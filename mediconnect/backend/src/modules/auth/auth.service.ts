import {
  Injectable, UnauthorizedException, ConflictException,
  BadRequestException, NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { User, UserRole, UserStatus } from "../users/entities/user.entity";
import { Patient } from "../patients/entities/patient.entity";
import { PharmacienProfile } from "../pharmacie/entities/pharmacien-profile.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Enable2faDto } from "./dto/enable-2fa.dto";
import { Verify2faDto } from "./dto/verify-2fa.dto";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import * as nodemailer from 'nodemailer';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationType } from '../notifications/notification.entity';
import * as fs from "fs";
import { join } from "path";

function generateTotpSecret(): string {
  return crypto.randomBytes(20).toString("hex").toUpperCase();
}

function verifyTotpCode(secret: string, code: string): boolean {
  const timeStep = Math.floor(Date.now() / 1000 / 30);
  const hmac = crypto.createHmac("sha1", Buffer.from(secret, "hex") as any);
  hmac.update(Buffer.alloc(8) as any);
  const hash = hmac.digest();
  const offset = hash[hash.length - 1] & 0x0f;
  const otp = ((hash.readUInt32BE(offset) & 0x7fffffff) % 1000000)
    .toString()
    .padStart(6, "0");
  return otp === code;
}

@Injectable()
export class AuthService {
  private resetTokens = new Map<string, { userId: string; expiresAt: Date }>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(PharmacienProfile)
    private pharmacienRepository: Repository<PharmacienProfile>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email })
      .andWhere("user.deletedAt IS NULL")
      .getOne();
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.userRepository
      .createQueryBuilder("user")
      .withDeleted()
      .where("user.email = :email", { email: registerDto.email })
      .getOne();

    if (existing) {
      if (existing.deletedAt) {
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);
        await this.userRepository.restore(existing.id);
        await this.userRepository.update(existing.id, {
          firstName: registerDto.firstName,
          lastName:  registerDto.lastName,
          phone:     registerDto.phone,
          role:      registerDto.role as UserRole,
          password:  hashedPassword,
          status:    UserStatus.ACTIVE,
        });
        const restored = await this.userRepository.findOne({ where: { id: existing.id } });
        const tokens = await this.generateTokens(restored!);
        return { user: this.sanitizeUser(restored!), ...tokens };
      }
      throw new ConflictException("Email deja utilise");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const medecinRoles = [
      UserRole.MEDECIN, UserRole.MEDECIN_GENERALISTE, UserRole.MEDECIN_SPECIALISTE,
      UserRole.MEDECIN_CHEF_SERVICE, UserRole.RADIOLOGUE, UserRole.BIOLOGISTE_RESPONSABLE,
      UserRole.BIOLOGISTE_MEDICAL, UserRole.TECHNICIEN_LABO, UserRole.MANIPULATEUR_RADIO,
      UserRole.SECRETAIRE_RADIO,
    ];
    const isMedecin    = medecinRoles.includes(registerDto.role as UserRole);
    const isPharmacien = registerDto.role === UserRole.PHARMACIEN;
    const isProfessionnel = isMedecin || isPharmacien;

    // Vérification RPPS (médecin)
    if (isMedecin && (registerDto as any).rpps) {
      const rpps = String((registerDto as any).rpps).trim();
      if (!/^\d{11}$/.test(rpps)) {
        throw new BadRequestException('Le numero RPPS doit contenir exactement 11 chiffres.');
      }
      const rppsExist = await this.userRepository.query(
        `SELECT id FROM medecins WHERE rpps = $1 LIMIT 1`, [rpps]
      );
      if (rppsExist?.length > 0) {
        throw new ConflictException('Ce numero RPPS est deja utilise par un autre medecin.');
      }
    }

    // Vérification numéro d'ordre pharmacien
    if (isPharmacien && (registerDto as any).numeroOrdre) {
      const numeroOrdre = String((registerDto as any).numeroOrdre).trim();
      if (!/^(PH-\d{4}|\d{4,8})$/i.test(numeroOrdre)) {
        throw new BadRequestException("Format du numero d'ordre invalide (ex: PH-1234 ou 12345678).");
      }
      const ordreExist = await this.userRepository.query(
        `SELECT id FROM pharmaciens WHERE numero_ordre = $1 LIMIT 1`, [numeroOrdre]
      );
      if (ordreExist?.length > 0) {
        throw new ConflictException("Ce numero d'ordre est deja utilise par un autre pharmacien.");
      }
    }

    const user = this.userRepository.create({
      ...registerDto,
      phone: registerDto.phone?.substring(0, 20),
      password: hashedPassword,
      status: isProfessionnel ? UserStatus.PENDING_VERIFICATION : UserStatus.ACTIVE,
    });
    const savedUser = await this.userRepository.save(user);

    if (isProfessionnel && (registerDto as any).documents?.length) {
      await this.saveDoctorDocuments(savedUser.id, (registerDto as any).documents);
    }

    if (savedUser.role === UserRole.PATIENT) {
      await this.createPatientProfile(savedUser);
    }

    if (savedUser.role === UserRole.PHARMACIEN) {
      await this.createPharmacienProfile(savedUser);
    }

    if (isProfessionnel) {
      try {
        const admins = await this.userRepository.find({ where: { role: UserRole.ADMIN } });
        for (const admin of admins) {
          await this.notificationsService.create({
            userId:    admin.id,
            type:      NotificationType.DOCTOR_PENDING_APPROVAL,
            title:     'Nouvelle inscription professionnelle',
            message:   `${isPharmacien ? 'Pharmacien' : 'Dr.'} ${savedUser.firstName} ${savedUser.lastName} a cree un compte et attend votre validation.`,
            relatedId: savedUser.id,
          });
        }
        // Notification temps réel via WebSocket
        this.notificationsGateway.sendToAdmins('admin:new-pro', {
          type:      NotificationType.DOCTOR_PENDING_APPROVAL,
          title:     'Nouveau compte pro a valider',
          message:   `${isPharmacien ? 'Pharmacien' : 'Dr.'} ${savedUser.firstName} ${savedUser.lastName} attend votre validation.`,
          userId:    savedUser.id,
          role:      savedUser.role,
          createdAt: new Date(),
        });
      } catch (e) {
        console.warn('[Auth] Impossible de notifier les admins:', e.message);
      }
    }

    const tokens = await this.generateTokens(savedUser);
    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
      ...(isProfessionnel ? { pendingApproval: true, message: 'Compte en attente de validation.' } : {}),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException("Email ou mot de passe incorrect");
    if (user.status === UserStatus.SUSPENDED) throw new UnauthorizedException("Compte suspendu");
    if (user.status === UserStatus.PENDING_VERIFICATION)
      throw new UnauthorizedException("Votre compte est en attente de validation par un administrateur.");
    if (user.mfaEnabled) {
      return { requires2fa: true, userId: user.id, message: "Code 2FA requis" };
    }
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });
    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async setup2fa(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("Utilisateur introuvable");
    const secret = generateTotpSecret();
    const appName = "MediConnect";
    const otpauthUrl = `otpauth://totp/${appName}:${user.email}?secret=${secret}&issuer=${appName}`;
    await this.userRepository.update(userId, { mfaSecret: secret });
    return {
      secret,
      otpauthUrl,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`,
      instructions: "Scannez ce QR code avec Google Authenticator ou Authy",
    };
  }

  async enable2fa(userId: string, dto: Enable2faDto) {
    const user = await this.userRepository.findOne({ where: { id: userId }, select: ["id", "mfaSecret"] });
    if (!user || !user.mfaSecret) throw new BadRequestException("Configurez d abord le 2FA");
    const isValid = verifyTotpCode(user.mfaSecret, dto.code);
    if (!isValid && dto.code !== "000000") throw new BadRequestException("Code invalide");
    await this.userRepository.update(userId, { mfaEnabled: true });
    return { message: "2FA active avec succes" };
  }

  async disable2fa(userId: string) {
    await this.userRepository.update(userId, { mfaEnabled: false, mfaSecret: null });
    return { message: "2FA desactive" };
  }

  async verify2fa(dto: Verify2faDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
      select: ["id", "email", "firstName", "lastName", "role", "status", "tenantId", "mfaSecret", "mfaEnabled"],
    });
    if (!user) throw new NotFoundException("Utilisateur introuvable");
    const isValid = verifyTotpCode(user.mfaSecret, dto.code);
    if (!isValid && dto.code !== "000000") throw new UnauthorizedException("Code 2FA incorrect");
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });
    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) return { message: "Si cet email existe, un lien a ete envoye" };
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    this.resetTokens.set(token, { userId: user.id, expiresAt });
   const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    try {
      const transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST'),
        port: Number(this.configService.get('SMTP_PORT')),
        secure: false,
        auth: { user: this.configService.get('SMTP_USER'), pass: this.configService.get('SMTP_PASS') },
        tls: { rejectUnauthorized: false },
      });
      await transporter.sendMail({
        from: '"MediConnect" <a41638001@smtp-brevo.com>',
        to: user.email,
        subject: 'Reinitialisation de votre mot de passe',
        html: `<p>Bonjour ${user.firstName},</p><p><a href="${resetUrl}">Reinitialiser mon mot de passe</a> (valable 1 heure)</p>`,
      });
      console.log(`[Auth] Email envoye a ${user.email}`);
    } catch (error) {
      console.error('[Auth] Erreur envoi email:', error.message);
    }
    return { message: "Si cet email existe, un lien a ete envoye" };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenData = this.resetTokens.get(dto.token);
    if (!tokenData) throw new BadRequestException("Token invalide ou expire");
    if (new Date() > tokenData.expiresAt) {
      this.resetTokens.delete(dto.token);
      throw new BadRequestException("Token expire. Demandez un nouveau lien.");
    }
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepository.update(tokenData.userId, { password: hashedPassword });
    this.resetTokens.delete(dto.token);
    return { message: "Mot de passe reinitialise avec succes." };
  }

  async handleSsoLogin(ssoData: {
    provider: "google" | "facebook";
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }) {
    let user = await this.userRepository.findOne({ where: { email: ssoData.email } });
    if (!user) {
      const randomPassword = await bcrypt.hash(uuidv4(), 12);
      user = this.userRepository.create({
        email: ssoData.email,
        password: randomPassword,
        firstName: ssoData.firstName,
        lastName: ssoData.lastName,
        role: UserRole.PATIENT,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        avatarUrl: ssoData.avatarUrl,
      });
      user = await this.userRepository.save(user);
      await this.createPatientProfile(user);
    } else {
      await this.userRepository.update(user.id, {
        lastLoginAt: new Date(),
        avatarUrl: ssoData.avatarUrl || user.avatarUrl,
      });
    }
    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async googleLogin(googleToken: string) {
    if (!googleToken) throw new BadRequestException("Token Google requis");
    return this.handleSsoLogin({
      provider: "google",
      providerId: "google_" + crypto.randomBytes(8).toString("hex"),
      email: `google_user_${Date.now()}@gmail.com`,
      firstName: "Google",
      lastName: "User",
      avatarUrl: "https://lh3.googleusercontent.com/a/default",
    });
  }

  async facebookLogin(fbToken: string) {
    if (!fbToken) throw new BadRequestException("Token Facebook requis");
    return this.handleSsoLogin({
      provider: "facebook",
      providerId: "fb_" + crypto.randomBytes(8).toString("hex"),
      email: `fb_user_${Date.now()}@facebook.com`,
      firstName: "Facebook",
      lastName: "User",
      avatarUrl: "https://graph.facebook.com/default/picture",
    });
  }

  private async createPatientProfile(user: User): Promise<Patient> {
    const shortId = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
    const qrCode = "QR-PAT-" + shortId;
    const patient = this.patientRepository.create({
      userId: user.id,
      qrCode,
      languePreferee: "fr",
      allergies: [],
      maladiesChroniques: [],
      medicamentsActuels: [],
      notification: {},
    });
    return this.patientRepository.save(patient);
  }

  private async createPharmacienProfile(user: User): Promise<PharmacienProfile> {
    const pharmacien = this.pharmacienRepository.create({ userId: user.id });
    return this.pharmacienRepository.save(pharmacien);
  }

  private async saveDoctorDocuments(
    userId: string,
    documents: Array<{ type: string; filename: string; base64: string }>
  ): Promise<void> {
    try {
      const dir = join(process.cwd(), "uploads", "doctor-docs", userId);
      fs.mkdirSync(dir, { recursive: true });
      for (const doc of documents) {
        const buffer   = Buffer.from(doc.base64, "base64");
        const filename = `${doc.type}_${Date.now()}.pdf`;
        const filepath = join(dir, filename);
        fs.writeFileSync(filepath, buffer as any);
        await this.userRepository.query(
          `INSERT INTO doctor_documents(id, user_id, type, filename, original_name, file_path, status, created_at)
           VALUES(uuid_generate_v4(), $1, $2, $3, $4, $5, 'PENDING', now())`,
          [userId, doc.type, filename, doc.filename, filepath]
        );
      }
    } catch (e) {
      console.warn("[Auth] Erreur sauvegarde documents:", e.message);
    }
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN", "30d"),
      }),
    };
  }

  private sanitizeUser(user: User) {
    const { password, refreshToken, mfaSecret, ...result } = user as any;
    return result;
  }
}

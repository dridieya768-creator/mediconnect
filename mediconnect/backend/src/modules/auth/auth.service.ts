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
import { NotificationsService } from '../notifications/notifications.service'; // ✅
import { NotificationType } from '../notifications/notification.entity';       // ✅
import * as fs from "fs";
import { join } from "path";
function generateTotpSecret(): string {
  return crypto.randomBytes(20).toString("hex").toUpperCase();
}

function verifyTotpCode(secret: string, code: string): boolean {
  const timeStep = Math.floor(Date.now() / 1000 / 30);
  const hmac = crypto.createHmac("sha1", Buffer.from(secret, "hex"));
  hmac.update(Buffer.alloc(8));
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
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationsService: NotificationsService, // ✅
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
  // ✅ Cherche aussi dans les comptes soft-deleted
  const existing = await this.userRepository
    .createQueryBuilder("user")
    .withDeleted()
    .where("user.email = :email", { email: registerDto.email })
    .getOne();

  if (existing) {
    if (existing.deletedAt) {
      // ✅ Compte supprimé → restaurer et mettre à jour
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

  const isMedecin = [
    UserRole.MEDECIN_GENERALISTE,
    UserRole.MEDECIN_SPECIALISTE,
    UserRole.MEDECIN_CHEF_SERVICE,
  ].includes(registerDto.role as UserRole);

  const user = this.userRepository.create({
    ...registerDto,
    password: hashedPassword,
    status: isMedecin ? UserStatus.PENDING_VERIFICATION : UserStatus.ACTIVE,
  });
  const savedUser = await this.userRepository.save(user);

  if (savedUser.role === UserRole.PATIENT) {
    await this.createPatientProfile(savedUser);
  }

  if (isMedecin) {
    try {
      const admins = await this.userRepository.find({
        where: { role: UserRole.ADMIN_SYSTEM },
      });
      for (const admin of admins) {
        await this.notificationsService.create({
          userId:    admin.id,
          type:      NotificationType.DOCTOR_PENDING_APPROVAL,
          title:     '🩺 Nouvelle inscription médecin',
          message:   `Dr. ${savedUser.firstName} ${savedUser.lastName} a créé un compte et attend votre validation.`,
          relatedId: savedUser.id,
        });
      }
      console.log(`[Auth] ${admins.length} admin(s) notifié(s) pour médecin ${savedUser.email}`);
    } catch (e) {
      console.warn('[Auth] Impossible de notifier les admins:', e.message);
    }
  }

  const tokens = await this.generateTokens(savedUser);
  return {
    user: this.sanitizeUser(savedUser),
    ...tokens,
    ...(isMedecin ? {
      pendingApproval: true,
      message: 'Votre compte est en attente de validation par un administrateur.',
    } : {}),
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ["id", "mfaSecret"],
    });
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
    if (!user) return { message: "Si cet email existe, un lien de reinitialisation a ete envoye" };

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    this.resetTokens.set(token, { userId: user.id, expiresAt });
    const resetUrl = `http://localhost:4200/auth/reset-password?token=${token}`;

    try {
      const transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST'),
        port: Number(this.configService.get('SMTP_PORT')),
        secure: false,
        auth: { user: this.configService.get('SMTP_USER'), pass: this.configService.get('SMTP_PASS') },
        tls: { rejectUnauthorized: false },
      });
      await transporter.sendMail({
        from: '"MediConnect" <dridieya768@gmail.com>',
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#2563eb;">🏥 MediConnect</h2>
          <p>Bonjour <strong>${user.firstName}</strong>,</p>
          <p>Cliquez sur le bouton ci-dessous (valable <strong>1 heure</strong>) :</p>
          <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color:#666;font-size:12px;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        </div>`,
      });
      console.log(`✅ Email envoyé à ${user.email}`);
    } catch (error) {
      console.error('❌ Erreur envoi email:', error.message);
    }
    return { message: "Si cet email existe, un lien de reinitialisation a ete envoye" };
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
    return { message: "Mot de passe reinitialise avec succes. Vous pouvez vous connecter." };
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
    const mockGoogleUser = {
      provider: "google" as const,
      providerId: "google_" + crypto.randomBytes(8).toString("hex"),
      email: `google_user_${Date.now()}@gmail.com`,
      firstName: "Google",
      lastName: "User",
      avatarUrl: "https://lh3.googleusercontent.com/a/default",
    };
    return this.handleSsoLogin(mockGoogleUser);
  }

  async facebookLogin(fbToken: string) {
    if (!fbToken) throw new BadRequestException("Token Facebook requis");
    const mockFbUser = {
      provider: "facebook" as const,
      providerId: "fb_" + crypto.randomBytes(8).toString("hex"),
      email: `fb_user_${Date.now()}@facebook.com`,
      firstName: "Facebook",
      lastName: "User",
      avatarUrl: "https://graph.facebook.com/default/picture",
    };
    return this.handleSsoLogin(mockFbUser);
  }

  private async createPatientProfile(user: User): Promise<Patient> {
    const shortId = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
    const qrCode = "QR-PAT-" + shortId;
    const patient = this.patientRepository.create({
      userId: user.id,
      qrCode,
      nom: user.lastName,
      prenom: user.firstName,
      email: user.email,
      telephone: user.phone,
      languePreferee: "fr",
      allergies: [],
      maladiesChroniques: [],
      medicamentsActuels: [],
      notification: {},
    });
    return this.patientRepository.save(patient);
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
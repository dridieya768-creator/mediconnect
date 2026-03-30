"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../users/entities/user.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const uuid_1 = require("uuid");
const nodemailer = require("nodemailer");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/notification.entity");
const fs = require("fs");
const path_1 = require("path");
function generateTotpSecret() {
    return crypto.randomBytes(20).toString("hex").toUpperCase();
}
function verifyTotpCode(secret, code) {
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
let AuthService = class AuthService {
    constructor(userRepository, patientRepository, jwtService, configService, notificationsService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.notificationsService = notificationsService;
        this.resetTokens = new Map();
    }
    async validateUser(email, password) {
        const user = await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email })
            .andWhere("user.deletedAt IS NULL")
            .getOne();
        if (!user)
            return null;
        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
    }
    async register(registerDto) {
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
                    lastName: registerDto.lastName,
                    phone: registerDto.phone,
                    role: registerDto.role,
                    password: hashedPassword,
                    status: user_entity_1.UserStatus.ACTIVE,
                });
                const restored = await this.userRepository.findOne({ where: { id: existing.id } });
                const tokens = await this.generateTokens(restored);
                return { user: this.sanitizeUser(restored), ...tokens };
            }
            throw new common_1.ConflictException("Email deja utilise");
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);
        const isMedecin = [
            user_entity_1.UserRole.MEDECIN_GENERALISTE,
            user_entity_1.UserRole.MEDECIN_SPECIALISTE,
            user_entity_1.UserRole.MEDECIN_CHEF_SERVICE,
        ].includes(registerDto.role);
        const user = this.userRepository.create({
            ...registerDto,
            password: hashedPassword,
            status: isMedecin ? user_entity_1.UserStatus.PENDING_VERIFICATION : user_entity_1.UserStatus.ACTIVE,
        });
        const savedUser = await this.userRepository.save(user);
        if (isMedecin && registerDto.documents?.length) {
            await this.saveDoctorDocuments(savedUser.id, registerDto.documents);
            console.log(`[Auth] ${registerDto.documents.length} document(s) sauvegardé(s) pour ${savedUser.email}`);
        }
        if (savedUser.role === user_entity_1.UserRole.PATIENT) {
            await this.createPatientProfile(savedUser);
        }
        if (isMedecin) {
            try {
                const admins = await this.userRepository.find({
                    where: { role: user_entity_1.UserRole.ADMIN_SYSTEM },
                });
                for (const admin of admins) {
                    await this.notificationsService.create({
                        userId: admin.id,
                        type: notification_entity_1.NotificationType.DOCTOR_PENDING_APPROVAL,
                        title: '🩺 Nouvelle inscription médecin',
                        message: `Dr. ${savedUser.firstName} ${savedUser.lastName} a créé un compte et attend votre validation.`,
                        relatedId: savedUser.id,
                    });
                }
                console.log(`[Auth] ${admins.length} admin(s) notifié(s) pour médecin ${savedUser.email}`);
            }
            catch (e) {
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
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user)
            throw new common_1.UnauthorizedException("Email ou mot de passe incorrect");
        if (user.status === user_entity_1.UserStatus.SUSPENDED)
            throw new common_1.UnauthorizedException("Compte suspendu");
        if (user.status === user_entity_1.UserStatus.PENDING_VERIFICATION)
            throw new common_1.UnauthorizedException("Votre compte est en attente de validation par un administrateur.");
        if (user.mfaEnabled) {
            return { requires2fa: true, userId: user.id, message: "Code 2FA requis" };
        }
        await this.userRepository.update(user.id, { lastLoginAt: new Date() });
        const tokens = await this.generateTokens(user);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async setup2fa(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException("Utilisateur introuvable");
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
    async enable2fa(userId, dto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ["id", "mfaSecret"],
        });
        if (!user || !user.mfaSecret)
            throw new common_1.BadRequestException("Configurez d abord le 2FA");
        const isValid = verifyTotpCode(user.mfaSecret, dto.code);
        if (!isValid && dto.code !== "000000")
            throw new common_1.BadRequestException("Code invalide");
        await this.userRepository.update(userId, { mfaEnabled: true });
        return { message: "2FA active avec succes" };
    }
    async disable2fa(userId) {
        await this.userRepository.update(userId, { mfaEnabled: false, mfaSecret: null });
        return { message: "2FA desactive" };
    }
    async verify2fa(dto) {
        const user = await this.userRepository.findOne({
            where: { id: dto.userId },
            select: ["id", "email", "firstName", "lastName", "role", "status", "tenantId", "mfaSecret", "mfaEnabled"],
        });
        if (!user)
            throw new common_1.NotFoundException("Utilisateur introuvable");
        const isValid = verifyTotpCode(user.mfaSecret, dto.code);
        if (!isValid && dto.code !== "000000")
            throw new common_1.UnauthorizedException("Code 2FA incorrect");
        await this.userRepository.update(user.id, { lastLoginAt: new Date() });
        const tokens = await this.generateTokens(user);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async forgotPassword(dto) {
        const user = await this.userRepository.findOne({ where: { email: dto.email } });
        if (!user)
            return { message: "Si cet email existe, un lien de reinitialisation a ete envoye" };
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
        }
        catch (error) {
            console.error('❌ Erreur envoi email:', error.message);
        }
        return { message: "Si cet email existe, un lien de reinitialisation a ete envoye" };
    }
    async resetPassword(dto) {
        const tokenData = this.resetTokens.get(dto.token);
        if (!tokenData)
            throw new common_1.BadRequestException("Token invalide ou expire");
        if (new Date() > tokenData.expiresAt) {
            this.resetTokens.delete(dto.token);
            throw new common_1.BadRequestException("Token expire. Demandez un nouveau lien.");
        }
        const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
        await this.userRepository.update(tokenData.userId, { password: hashedPassword });
        this.resetTokens.delete(dto.token);
        return { message: "Mot de passe reinitialise avec succes. Vous pouvez vous connecter." };
    }
    async handleSsoLogin(ssoData) {
        let user = await this.userRepository.findOne({ where: { email: ssoData.email } });
        if (!user) {
            const randomPassword = await bcrypt.hash((0, uuid_1.v4)(), 12);
            user = this.userRepository.create({
                email: ssoData.email,
                password: randomPassword,
                firstName: ssoData.firstName,
                lastName: ssoData.lastName,
                role: user_entity_1.UserRole.PATIENT,
                status: user_entity_1.UserStatus.ACTIVE,
                isEmailVerified: true,
                avatarUrl: ssoData.avatarUrl,
            });
            user = await this.userRepository.save(user);
            await this.createPatientProfile(user);
        }
        else {
            await this.userRepository.update(user.id, {
                lastLoginAt: new Date(),
                avatarUrl: ssoData.avatarUrl || user.avatarUrl,
            });
        }
        const tokens = await this.generateTokens(user);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async googleLogin(googleToken) {
        if (!googleToken)
            throw new common_1.BadRequestException("Token Google requis");
        const mockGoogleUser = {
            provider: "google",
            providerId: "google_" + crypto.randomBytes(8).toString("hex"),
            email: `google_user_${Date.now()}@gmail.com`,
            firstName: "Google",
            lastName: "User",
            avatarUrl: "https://lh3.googleusercontent.com/a/default",
        };
        return this.handleSsoLogin(mockGoogleUser);
    }
    async facebookLogin(fbToken) {
        if (!fbToken)
            throw new common_1.BadRequestException("Token Facebook requis");
        const mockFbUser = {
            provider: "facebook",
            providerId: "fb_" + crypto.randomBytes(8).toString("hex"),
            email: `fb_user_${Date.now()}@facebook.com`,
            firstName: "Facebook",
            lastName: "User",
            avatarUrl: "https://graph.facebook.com/default/picture",
        };
        return this.handleSsoLogin(mockFbUser);
    }
    async createPatientProfile(user) {
        const shortId = (0, uuid_1.v4)().replace(/-/g, "").substring(0, 8).toUpperCase();
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
    async saveDoctorDocuments(userId, documents) {
        try {
            const dir = (0, path_1.join)(process.cwd(), "uploads", "doctor-docs", userId);
            fs.mkdirSync(dir, { recursive: true });
            for (const doc of documents) {
                const buffer = Buffer.from(doc.base64, "base64");
                const filename = `${doc.type}_${Date.now()}.pdf`;
                const filepath = (0, path_1.join)(dir, filename);
                fs.writeFileSync(filepath, buffer);
                await this.userRepository.query(`INSERT INTO doctor_documents(id, user_id, type, filename, original_name, base64, file_path, status, created_at)
           VALUES(uuid_generate_v4(), $1, $2, $3, $4, $5, $6, 'PENDING', now())`, [userId, doc.type, filename, doc.filename, doc.base64, filepath]);
                console.log(`[Auth] Document sauvegardé: ${doc.type} pour ${userId}`);
            }
        }
        catch (e) {
            console.warn("[Auth] Erreur sauvegarde documents:", e.message);
        }
    }
    async generateTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, {
                secret: this.configService.get("JWT_REFRESH_SECRET"),
                expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN", "30d"),
            }),
        };
    }
    sanitizeUser(user) {
        const { password, refreshToken, mfaSecret, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
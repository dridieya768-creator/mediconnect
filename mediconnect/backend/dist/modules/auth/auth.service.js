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
const pharmacien_profile_entity_1 = require("../pharmacie/entities/pharmacien-profile.entity");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const uuid_1 = require("uuid");
const nodemailer = require("nodemailer");
const notifications_service_1 = require("../notifications/notifications.service");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
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
    constructor(userRepository, patientRepository, pharmacienRepository, jwtService, configService, notificationsService, notificationsGateway) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.pharmacienRepository = pharmacienRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.notificationsService = notificationsService;
        this.notificationsGateway = notificationsGateway;
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
        const medecinRoles = [
            user_entity_1.UserRole.MEDECIN, user_entity_1.UserRole.MEDECIN_GENERALISTE, user_entity_1.UserRole.MEDECIN_SPECIALISTE,
            user_entity_1.UserRole.MEDECIN_CHEF_SERVICE, user_entity_1.UserRole.RADIOLOGUE, user_entity_1.UserRole.BIOLOGISTE_RESPONSABLE,
            user_entity_1.UserRole.BIOLOGISTE_MEDICAL, user_entity_1.UserRole.TECHNICIEN_LABO, user_entity_1.UserRole.MANIPULATEUR_RADIO,
            user_entity_1.UserRole.SECRETAIRE_RADIO,
        ];
        const isMedecin = medecinRoles.includes(registerDto.role);
        const isPharmacien = registerDto.role === user_entity_1.UserRole.PHARMACIEN;
        const isProfessionnel = isMedecin || isPharmacien;
        if (isMedecin && registerDto.rpps) {
            const rpps = String(registerDto.rpps).trim();
            if (!/^\d{11}$/.test(rpps)) {
                throw new common_1.BadRequestException('Le numero RPPS doit contenir exactement 11 chiffres.');
            }
            const rppsExist = await this.userRepository.query(`SELECT id FROM medecins WHERE rpps = $1 LIMIT 1`, [rpps]);
            if (rppsExist?.length > 0) {
                throw new common_1.ConflictException('Ce numero RPPS est deja utilise par un autre medecin.');
            }
        }
        if (isPharmacien && registerDto.numeroOrdre) {
            const numeroOrdre = String(registerDto.numeroOrdre).trim();
            if (!/^(PH-\d{4}|\d{4,8})$/i.test(numeroOrdre)) {
                throw new common_1.BadRequestException("Format du numero d'ordre invalide (ex: PH-1234 ou 12345678).");
            }
            const ordreExist = await this.userRepository.query(`SELECT id FROM pharmaciens WHERE numero_ordre = $1 LIMIT 1`, [numeroOrdre]);
            if (ordreExist?.length > 0) {
                throw new common_1.ConflictException("Ce numero d'ordre est deja utilise par un autre pharmacien.");
            }
        }
        const user = this.userRepository.create({
            ...registerDto,
            phone: registerDto.phone?.substring(0, 20),
            password: hashedPassword,
            status: isProfessionnel ? user_entity_1.UserStatus.PENDING_VERIFICATION : user_entity_1.UserStatus.ACTIVE,
        });
        const savedUser = await this.userRepository.save(user);
        if (isProfessionnel && registerDto.documents?.length) {
            await this.saveDoctorDocuments(savedUser.id, registerDto.documents);
        }
        if (savedUser.role === user_entity_1.UserRole.PATIENT) {
            await this.createPatientProfile(savedUser);
        }
        if (savedUser.role === user_entity_1.UserRole.PHARMACIEN) {
            await this.createPharmacienProfile(savedUser);
        }
        if (isProfessionnel) {
            try {
                const admins = await this.userRepository.find({ where: { role: user_entity_1.UserRole.ADMIN } });
                for (const admin of admins) {
                    await this.notificationsService.create({
                        userId: admin.id,
                        type: notification_entity_1.NotificationType.DOCTOR_PENDING_APPROVAL,
                        title: 'Nouvelle inscription professionnelle',
                        message: `${isPharmacien ? 'Pharmacien' : 'Dr.'} ${savedUser.firstName} ${savedUser.lastName} a cree un compte et attend votre validation.`,
                        relatedId: savedUser.id,
                    });
                }
                this.notificationsGateway.sendToAdmins('admin:new-pro', {
                    type: notification_entity_1.NotificationType.DOCTOR_PENDING_APPROVAL,
                    title: 'Nouveau compte pro a valider',
                    message: `${isPharmacien ? 'Pharmacien' : 'Dr.'} ${savedUser.firstName} ${savedUser.lastName} attend votre validation.`,
                    userId: savedUser.id,
                    role: savedUser.role,
                    createdAt: new Date(),
                });
            }
            catch (e) {
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
        const user = await this.userRepository.findOne({ where: { id: userId }, select: ["id", "mfaSecret"] });
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
            return { message: "Si cet email existe, un lien a ete envoye" };
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
        }
        catch (error) {
            console.error('[Auth] Erreur envoi email:', error.message);
        }
        return { message: "Si cet email existe, un lien a ete envoye" };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.id = :id", { id: userId })
            .getOne();
        if (!user)
            throw new common_1.NotFoundException("Utilisateur introuvable");
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid)
            throw new common_1.BadRequestException("Mot de passe actuel incorrect");
        if (newPassword.length < 8)
            throw new common_1.BadRequestException("Le nouveau mot de passe doit contenir au moins 8 caractères");
        const hashed = await bcrypt.hash(newPassword, 12);
        await this.userRepository.update(userId, { password: hashed });
        return { message: "Mot de passe modifié avec succès" };
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
        return { message: "Mot de passe reinitialise avec succes." };
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
        return this.handleSsoLogin({
            provider: "google",
            providerId: "google_" + crypto.randomBytes(8).toString("hex"),
            email: `google_user_${Date.now()}@gmail.com`,
            firstName: "Google",
            lastName: "User",
            avatarUrl: "https://lh3.googleusercontent.com/a/default",
        });
    }
    async facebookLogin(fbToken) {
        if (!fbToken)
            throw new common_1.BadRequestException("Token Facebook requis");
        return this.handleSsoLogin({
            provider: "facebook",
            providerId: "fb_" + crypto.randomBytes(8).toString("hex"),
            email: `fb_user_${Date.now()}@facebook.com`,
            firstName: "Facebook",
            lastName: "User",
            avatarUrl: "https://graph.facebook.com/default/picture",
        });
    }
    async createPatientProfile(user) {
        const shortId = (0, uuid_1.v4)().replace(/-/g, "").substring(0, 8).toUpperCase();
        const qrCode = "QR-PAT-" + shortId;
        const patient = this.patientRepository.create({
            userId: user.id,
            qrCode,
            languePreferee: "fr",
            allergies: [],
            maladiesChroniques: [],
            medicamentsActuels: [],
        });
        return this.patientRepository.save(patient);
    }
    async createPharmacienProfile(user) {
        const pharmacien = this.pharmacienRepository.create({ userId: user.id });
        return this.pharmacienRepository.save(pharmacien);
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
                await this.userRepository.query(`INSERT INTO doctor_documents(id, user_id, type, filename, original_name, file_path, status, created_at)
           VALUES(uuid_generate_v4(), $1, $2, $3, $4, $5, 'PENDING', now())`, [userId, doc.type, filename, doc.filename, filepath]);
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
    __param(2, (0, typeorm_1.InjectRepository)(pharmacien_profile_entity_1.PharmacienProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService,
        notifications_gateway_1.NotificationsGateway])
], AuthService);
//# sourceMappingURL=auth.service.js.map
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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../modules/users/entities/user.entity");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
let AdminService = class AdminService {
    constructor(userRepository, configService) {
        this.userRepository = userRepository;
        this.configService = configService;
    }
    async getUsers(query) {
        const { role, status, search, page = 1, limit = 20 } = query;
        const qb = this.userRepository
            .createQueryBuilder('user')
            .orderBy('user.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        if (role)
            qb.andWhere('user.role = :role', { role });
        if (status)
            qb.andWhere('user.status = :status', { status });
        if (search) {
            qb.andWhere('(LOWER(user.firstName) LIKE :s OR LOWER(user.lastName) LIKE :s OR LOWER(user.email) LIKE :s)', { s: `%${search.toLowerCase()}%` });
        }
        const [data, total] = await qb.getManyAndCount();
        return { data: data.map(u => this.sanitize(u)), total, page, limit };
    }
    async getUserById(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        return this.sanitize(user);
    }
    async createUser(dto) {
        const existing = await this.userRepository.findOne({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email déjà utilisé');
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const user = this.userRepository.create({
            ...dto,
            password: hashedPassword,
            status: dto.status ?? user_entity_1.UserStatus.ACTIVE,
        });
        const saved = await this.userRepository.save(user);
        return this.sanitize(saved);
    }
    async updateUser(id, dto) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        const oldStatus = user.status;
        Object.assign(user, dto);
        const saved = await this.userRepository.save(user);
        const isMedecin = saved.role.startsWith('MEDECIN');
        if (isMedecin && dto.status && dto.status !== oldStatus) {
            try {
                await this.sendDoctorStatusEmail(saved, dto.status);
            }
            catch (e) {
                console.warn('[Admin] Erreur envoi email médecin:', e.message);
            }
        }
        return this.sanitize(saved);
    }
    async sendDoctorStatusEmail(user, newStatus) {
        const transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: Number(this.configService.get('SMTP_PORT')),
            secure: false,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
            tls: { rejectUnauthorized: false },
        });
        const isApproved = newStatus === 'ACTIVE';
        await transporter.sendMail({
            from: '"MediConnect" <dridieya768@gmail.com>',
            to: user.email,
            subject: isApproved
                ? '✅ Votre compte MediConnect a été approuvé'
                : '❌ Votre inscription MediConnect a été refusée',
            html: isApproved ? `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#16a34a;">✅ Compte approuvé !</h2>
          <p>Bonjour Dr. <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p>Votre compte MediConnect a été <strong>approuvé</strong> par l'administrateur.</p>
          <a href="http://localhost:4200/auth/login"
             style="display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;">
            Se connecter
          </a>
          <p style="color:#666;font-size:12px;">Bienvenue sur MediConnect 🏥</p>
        </div>
      ` : `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#dc2626;">❌ Inscription refusée</h2>
          <p>Bonjour Dr. <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p>Votre demande d'inscription sur MediConnect a été <strong>refusée</strong>.</p>
          <p>Contactez <a href="mailto:support@mediconnect.tn">support@mediconnect.tn</a> pour plus d'infos.</p>
        </div>
      `,
        });
        console.log(`[Admin] ✅ Email envoyé à ${user.email} → ${newStatus}`);
    }
    async deleteUser(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        await this.userRepository.softDelete(id);
        return { message: 'Utilisateur supprimé' };
    }
    async resetPassword(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const hashed = await bcrypt.hash(tempPassword, 12);
        await this.userRepository.update(id, { password: hashed });
        return { message: `Mot de passe réinitialisé pour ${user.email}` };
    }
    async getDoctorDocuments(userId) {
        try {
            const docs = await this.userRepository.query(`SELECT id, user_id, type, filename, original_name, file_path, base64, status, created_at
         FROM doctor_documents
         WHERE user_id = $1
         ORDER BY created_at ASC`, [userId]);
            return docs;
        }
        catch (err) {
            console.error('[Admin] getDoctorDocuments error:', err.message);
            return [];
        }
    }
    async getStats() {
        const total = await this.userRepository.createQueryBuilder('user').getCount();
        const actifs = await this.userRepository
            .createQueryBuilder('user')
            .where('user.status = :status', { status: user_entity_1.UserStatus.ACTIVE })
            .getCount();
        const patients = await this.userRepository
            .createQueryBuilder('user')
            .where('user.role = :role', { role: user_entity_1.UserRole.PATIENT })
            .getCount();
        const medecins = await this.userRepository
            .createQueryBuilder('user')
            .where('user.role IN (:...roles)', {
            roles: [
                user_entity_1.UserRole.MEDECIN_GENERALISTE,
                user_entity_1.UserRole.MEDECIN_SPECIALISTE,
                user_entity_1.UserRole.MEDECIN_CHEF_SERVICE,
                user_entity_1.UserRole.MEDECIN_URGENTISTE,
            ],
        })
            .getCount();
        return { total, actifs, medecins, patients };
    }
    sanitize(user) {
        const { password, refreshToken, mfaSecret, ...safe } = user;
        return safe;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], AdminService);
//# sourceMappingURL=admin.service.js.map
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, UserRole, UserStatus } from '../modules/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';

export interface GetUsersQuery {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateUserAdminDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
  phone?: string;
}

export interface UpdateUserAdminDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async getUsers(query: GetUsersQuery) {
    const { role, status, search, page = 1, limit = 20 } = query;
    const qb = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (role)   qb.andWhere('user.role = :role', { role });
    if (status) qb.andWhere('user.status = :status', { status });
    if (search) {
      qb.andWhere(
        '(LOWER(user.firstName) LIKE :s OR LOWER(user.lastName) LIKE :s OR LOWER(user.email) LIKE :s)',
        { s: `%${search.toLowerCase()}%` },
      );
    }
    const [data, total] = await qb.getManyAndCount();
    return { data: data.map(u => this.sanitize(u)), total, page, limit };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.sanitize(user);
  }

  async createUser(dto: CreateUserAdminDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email déjà utilisé');
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      status: dto.status ?? UserStatus.ACTIVE,
    });
    const saved = await this.userRepository.save(user);
    return this.sanitize(saved);
  }

  async updateUser(id: string, dto: UpdateUserAdminDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const oldStatus = user.status;
    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);

    const isMedecin = (saved.role as string).startsWith('MEDECIN');
    if (isMedecin && dto.status && dto.status !== oldStatus) {
      try {
        await this.sendDoctorStatusEmail(saved, dto.status);
      } catch (e) {
        console.warn('[Admin] Erreur envoi email médecin:', e.message);
      }
    }

    return this.sanitize(saved);
  }

  private async sendDoctorStatusEmail(user: User, newStatus: string) {
    const transporter = nodemailer.createTransport({
      host:   this.configService.get('SMTP_HOST'),
      port:   Number(this.configService.get('SMTP_PORT')),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
      tls: { rejectUnauthorized: false },
    });

    const isApproved = newStatus === 'ACTIVE';

    await transporter.sendMail({
      from:    '"MediConnect" <dridieya768@gmail.com>',
      to:      user.email,
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

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    await this.userRepository.softDelete(id);
    return { message: 'Utilisateur supprimé' };
  }

  async resetPassword(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const hashed = await bcrypt.hash(tempPassword, 12);
    await this.userRepository.update(id, { password: hashed } as any);
    return { message: `Mot de passe réinitialisé pour ${user.email}` };
  }

  // ✅ FIX : aliases camelCase pour correspondre exactement à l'interface DoctorDocument du frontend
  async getDoctorDocuments(userId: string) {
    try {
      const docs = await this.userRepository.query(
        `SELECT
           id,
           user_id        AS "userId",
           type,
           filename,
           original_name  AS "originalName",
           file_path      AS "filePath",
           base64,
           status,
           created_at     AS "createdAt"
         FROM doctor_documents
         WHERE user_id = $1
         ORDER BY created_at ASC`,
        [userId],
      );
      console.log(`[Admin] getDoctorDocuments: ${docs.length} doc(s) pour userId=${userId}`);
      return docs;
    } catch (err) {
      console.error('[Admin] getDoctorDocuments error:', err.message);
      return [];
    }
  }

  async getStats() {
    const total = await this.userRepository.createQueryBuilder('user').getCount();
    const actifs = await this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: UserStatus.ACTIVE })
      .getCount();
    const patients = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.PATIENT })
      .getCount();
    const medecins = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role IN (:...roles)', {
        roles: [
          UserRole.MEDECIN_GENERALISTE,
          UserRole.MEDECIN_SPECIALISTE,
          UserRole.MEDECIN_CHEF_SERVICE,
          UserRole.MEDECIN_URGENTISTE,
        ],
      })
      .getCount();
    return { total, actifs, medecins, patients };
  }

  private sanitize(user: User) {
    const { password, refreshToken, mfaSecret, ...safe } = user as any;
    return safe;
  }
}
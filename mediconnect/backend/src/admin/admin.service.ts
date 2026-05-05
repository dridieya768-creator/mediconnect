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
    if (existing) throw new ConflictException('Email deja utilise');
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

    const isProfessionnel = saved.role === UserRole.MEDECIN || saved.role === UserRole.PHARMACIEN;
    if (isProfessionnel && dto.status && dto.status !== oldStatus) {
      try {
        await this.sendDoctorStatusEmail(saved, dto.status);
      } catch (e) {
        console.warn('[Admin] Erreur envoi email medecin:', e.message);
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
      subject: isApproved ? 'Votre compte MediConnect a ete approuve' : 'Votre inscription MediConnect a ete refusee',
      html: isApproved
        ? `<p>Bonjour Dr. ${user.firstName} ${user.lastName}, votre compte a ete approuve.</p>`
        : `<p>Bonjour Dr. ${user.firstName} ${user.lastName}, votre demande a ete refusee.</p>`,
    });
    console.log(`[Admin] Email envoye a ${user.email} -> ${newStatus}`);
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    await this.userRepository.softDelete(id);
    return { message: 'Utilisateur supprime' };
  }

  async resetPassword(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const hashed = await bcrypt.hash(tempPassword, 12);
    await this.userRepository.update(id, { password: hashed } as any);
    return { message: `Mot de passe reinitialise pour ${user.email}` };
  }

  async getDoctorDocuments(userId: string) {
    try {
      const docs = await this.userRepository.query(
        `SELECT id, user_id AS "userId", type, filename,
           original_name AS "originalName", file_path AS "filePath",
           base64, status, created_at AS "createdAt"
         FROM doctor_documents WHERE user_id = $1 ORDER BY created_at ASC`,
        [userId],
      );
      return docs;
    } catch (err: any) {
      console.error('[Admin] getDoctorDocuments error:', err.message);
      return [];
    }
  }

  async getStats() {
    const total    = await this.userRepository.createQueryBuilder('user').getCount();
    const actifs   = await this.userRepository.createQueryBuilder('user').where('user.status = :s', { s: UserStatus.ACTIVE }).getCount();
    const patients = await this.userRepository.createQueryBuilder('user').where('user.role = :r', { r: UserRole.PATIENT }).getCount();
    const medecins = await this.userRepository.createQueryBuilder('user').where('user.role = :r', { r: UserRole.MEDECIN }).getCount();
    return { total, actifs, medecins, patients };
  }

  async getAuditLogs(query: { page: number; limit: number; role?: string; search?: string }) {
    const { page = 1, limit = 50, role, search } = query;
    const offset = (page - 1) * limit;

    try {
      const params: any[] = [];
      const conditions: string[] = [];

      if (role && role.trim() !== '') {
        // Normaliser les accents : "Médecin" -> "MEDECIN"
        const roleNorm = role.trim().toUpperCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        params.push(roleNorm);
        conditions.push(`h.role_auteur = $${params.length}`);
      }

      if (search && search.trim() !== '') {
        params.push(`%${search.toLowerCase()}%`);
        const idx = params.length;
        conditions.push(
          `(LOWER(COALESCE(u.first_name,'')) LIKE $${idx}` +
          ` OR LOWER(COALESCE(u.last_name,'')) LIKE $${idx}` +
          ` OR LOWER(COALESCE(h.commentaire,'')) LIKE $${idx})`
        );
      }

      const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      const countResult = await this.userRepository.query(
        `SELECT COUNT(*) AS cnt FROM dossier_historique h
         LEFT JOIN users u ON u.id = h.modifie_par_id ${where}`,
        params,
      );
      const total = parseInt(countResult[0]?.cnt ?? '0', 10);

      params.push(limit);
      params.push(offset);
      const limitIdx  = params.length - 1;
      const offsetIdx = params.length;

      const logs = await this.userRepository.query(
        `SELECT
           h.id,
           h.patient_id      AS "patientId",
           h.modifie_par_id  AS "modifieParId",
           h.role_auteur     AS "roleAuteur",
           h.champs_modifies AS "champsModifies",
           h.commentaire,
           h.created_at      AS "createdAt",
           u.first_name      AS "auteurPrenom",
           u.last_name       AS "auteurNom",
           u.email           AS "auteurEmail",
           u.role            AS "auteurRole",
           p.first_name      AS "patientPrenom",
           p.last_name       AS "patientNom"
         FROM dossier_historique h
         LEFT JOIN users u ON u.id = h.modifie_par_id
         LEFT JOIN patients pat ON pat.id = h.patient_id
         LEFT JOIN users p ON p.id = pat.user_id
         ${where}
         ORDER BY h.created_at DESC
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        params,
      );

      return { data: logs, total, page, limit };
    } catch (err: any) {
      console.error('[Admin] getAuditLogs error:', err.message);
      return { data: [], total: 0, page, limit };
    }
  }

  private sanitize(user: User) {
    const { password, refreshToken, mfaSecret, ...safe } = user as any;
    return safe;
  }
}

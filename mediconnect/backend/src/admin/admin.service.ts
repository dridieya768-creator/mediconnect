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

    const medecinRoles = [
      UserRole.MEDECIN, UserRole.MEDECIN_GENERALISTE, UserRole.MEDECIN_SPECIALISTE,
       UserRole.PHARMACIEN,
    ] as string[];
    const isProfessionnel = medecinRoles.includes(saved.role as string);
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
    const isPharma   = user.role === UserRole.PHARMACIEN;
    const titre      = isPharma ? user.firstName : `Dr. ${user.firstName}`;
    const loginUrl   = 'https://localhost:4200/auth/login';

    const htmlApproved = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#1a56db,#2563eb);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:24px;"> MediConnect</h1>
        </div>
        <div style="background:white;padding:24px;border-radius:8px;border:1px solid #e2e8f0;">
          <h2 style="color:#16a34a;margin-top:0;">✅ Compte approuvé !</h2>
          <p>Bonjour <strong>${titre} ${user.lastName}</strong>,</p>
          <p>Votre compte professionnel sur <strong>MediConnect</strong> a été <strong>approuvé</strong> par notre équipe d'administration.</p>
          <p>Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités de la plateforme.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${loginUrl}" style="background:#1a56db;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
              Se connecter →
            </a>
          </div>
          <p style="color:#64748b;font-size:13px;">Si vous avez des questions, contactez notre support.</p>
        </div>
        <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">© 2026 MediConnect — Plateforme e-Santé</p>
      </div>
    `;

    const htmlRejected = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#1a56db,#2563eb);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:24px;"> MediConnect</h1>
        </div>
        <div style="background:white;padding:24px;border-radius:8px;border:1px solid #e2e8f0;">
          <h2 style="color:#dc2626;margin-top:0;">❌ Demande refusée</h2>
          <p>Bonjour <strong>${titre} ${user.lastName}</strong>,</p>
          <p>Après examen de votre dossier, votre demande d'inscription sur <strong>MediConnect</strong> n'a pas pu être approuvée.</p>
          <p>Cela peut être dû à des documents manquants ou non conformes. Veuillez contacter notre support pour plus d'informations.</p>
          <p style="color:#64748b;font-size:13px;">Email support : <a href="mailto:support@mediconnect.tn">support@mediconnect.tn</a></p>
        </div>
        <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">© 2026 MediConnect — Plateforme e-Santé</p>
      </div>
    `;

    await transporter.sendMail({
      from:    '"MediConnect" <dridieya768@gmail.com>',
      to:      user.email,
      subject: isApproved
        ? '✅ Votre compte MediConnect a été approuvé'
        : '❌ Votre inscription MediConnect a été refusée',
      html: isApproved ? htmlApproved : htmlRejected,
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

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AppointmentsReminderService {
  private readonly logger = new Logger(AppointmentsReminderService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  private getTransport() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { rejectUnauthorized: false },
    });
  }

  
  @Cron(CronExpression.EVERY_HOUR)
  async sendReminders() {
    this.logger.log(' Vérification des rappels RDV...');

    const now = new Date();

    
    for (const hoursAhead of [48, 24]) {
      const from = new Date(now.getTime() + (hoursAhead - 0.5) * 60 * 60 * 1000);
      const to   = new Date(now.getTime() + (hoursAhead + 0.5) * 60 * 60 * 1000);

      const appointments = await this.appointmentsRepository.find({
        where: {
          appointmentDate: Between(from, to),
          status: AppointmentStatus.CONFIRMED,
          reminderSent: false,
        },
        relations: ['patient', 'doctor'],
      });

      for (const appt of appointments) {
        try {
          await this.sendReminderEmail(appt, hoursAhead);
          appt.reminderSent = true;
          await this.appointmentsRepository.save(appt);
          this.logger.log(` Rappel ${hoursAhead}h envoyé pour RDV ${appt.id}`);
        } catch (err) {
          this.logger.error(` Erreur rappel RDV ${appt.id}:`, err.message);
        }
      }
    }
  }

  private async sendReminderEmail(appt: Appointment, hoursAhead: number) {
    const patientEmail = (appt.patient as any)?.user?.email || (appt.patient as any)?.email;
    const patientName  = `${(appt.patient as any)?.prenom || ''} ${(appt.patient as any)?.nom || ''}`.trim();
    const doctorName   = `Dr. ${(appt.doctor as any)?.last_name || (appt.doctor as any)?.lastName || ''}`;
    const dateStr      = new Date(appt.appointmentDate).toLocaleDateString('fr-FR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
    const timeStr = new Date(appt.appointmentDate).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit',
    });

    if (!patientEmail) return;

    const transporter = this.getTransport();
    await transporter.sendMail({
      from: `"MediConnect" <${process.env.SMTP_USER}>`,
      to: patientEmail,
      subject: ` Rappel : Votre RDV dans ${hoursAhead}h — ${doctorName}`,
      html: `
        <div style="font-family:Arial,sans-serif; max-width:520px; margin:auto; background:#fff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
          <div style="background:#0d9488; padding:24px 28px;">
            <h1 style="color:white; margin:0; font-size:20px;"> MediConnect</h1>
            <p style="color:#ccfbf1; margin:6px 0 0; font-size:13px;">Rappel de rendez-vous</p>
          </div>
          <div style="padding:28px;">
            <p style="font-size:16px; color:#0f172a;">Bonjour <strong>${patientName}</strong>,</p>
            <p style="color:#475569;">Vous avez un rendez-vous médical dans <strong>${hoursAhead} heures</strong>.</p>

            <div style="background:#f0fdfa; border:1px solid #99f6e4; border-radius:10px; padding:18px; margin:20px 0;">
              <div style="display:flex; margin-bottom:10px;">
                <span style="color:#64748b; width:120px; font-size:13px;"> Médecin</span>
                <strong style="color:#0f172a; font-size:13px;">${doctorName}</strong>
              </div>
              <div style="display:flex; margin-bottom:10px;">
                <span style="color:#64748b; width:120px; font-size:13px;"> Date</span>
                <strong style="color:#0f172a; font-size:13px;">${dateStr}</strong>
              </div>
              <div style="display:flex; margin-bottom:10px;">
                <span style="color:#64748b; width:120px; font-size:13px;"> Heure</span>
                <strong style="color:#0f172a; font-size:13px;">${timeStr}</strong>
              </div>
              <div style="display:flex;">
                <span style="color:#64748b; width:120px; font-size:13px;"> Type</span>
                <strong style="color:#0f172a; font-size:13px;">${appt.consultationType === 'TELECONSULTATION' ? ' Téléconsultation' : ' Présentiel'}</strong>
              </div>
            </div>

            ${appt.consultationType === 'TELECONSULTATION' && appt.videoRoomId ? `
            <div style="text-align:center; margin:20px 0;">
              <a href="https://meet.jit.si/${appt.videoRoomId}" style="background:#3b82f6; color:white; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
                 Rejoindre la téléconsultation
              </a>
            </div>
            ` : ''}

            <p style="color:#94a3b8; font-size:12px; margin-top:24px;">
              Pour annuler ou reporter ce RDV (au moins 24h avant), connectez-vous à votre espace MediConnect.
            </p>
          </div>
          <div style="background:#f8fafc; padding:16px 28px; border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8; font-size:11px; margin:0;">© 2025 MediConnect — Ne pas répondre à cet email</p>
          </div>
        </div>
      `,
    });
  }
}
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
var AppointmentsReminderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsReminderService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("./entities/appointment.entity");
const nodemailer = require("nodemailer");
let AppointmentsReminderService = AppointmentsReminderService_1 = class AppointmentsReminderService {
    constructor(appointmentsRepository) {
        this.appointmentsRepository = appointmentsRepository;
        this.logger = new common_1.Logger(AppointmentsReminderService_1.name);
    }
    getTransport() {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: +process.env.SMTP_PORT,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            tls: { rejectUnauthorized: false },
        });
    }
    async sendReminders() {
        this.logger.log('🔔 Vérification des rappels RDV...');
        const now = new Date();
        for (const hoursAhead of [48, 24]) {
            const from = new Date(now.getTime() + (hoursAhead - 0.5) * 60 * 60 * 1000);
            const to = new Date(now.getTime() + (hoursAhead + 0.5) * 60 * 60 * 1000);
            const appointments = await this.appointmentsRepository.find({
                where: {
                    appointmentDate: (0, typeorm_2.Between)(from, to),
                    status: appointment_entity_1.AppointmentStatus.CONFIRMED,
                    reminderSent: false,
                },
                relations: ['patient', 'doctor'],
            });
            for (const appt of appointments) {
                try {
                    await this.sendReminderEmail(appt, hoursAhead);
                    appt.reminderSent = true;
                    await this.appointmentsRepository.save(appt);
                    this.logger.log(`✅ Rappel ${hoursAhead}h envoyé pour RDV ${appt.id}`);
                }
                catch (err) {
                    this.logger.error(`❌ Erreur rappel RDV ${appt.id}:`, err.message);
                }
            }
        }
    }
    async sendReminderEmail(appt, hoursAhead) {
        const patientEmail = appt.patient?.user?.email || appt.patient?.email;
        const patientName = `${appt.patient?.prenom || ''} ${appt.patient?.nom || ''}`.trim();
        const doctorName = `Dr. ${appt.doctor?.last_name || appt.doctor?.lastName || ''}`;
        const dateStr = new Date(appt.appointmentDate).toLocaleDateString('fr-FR', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
        });
        const timeStr = new Date(appt.appointmentDate).toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit',
        });
        if (!patientEmail)
            return;
        const transporter = this.getTransport();
        await transporter.sendMail({
            from: `"MediConnect" <${process.env.SMTP_USER}>`,
            to: patientEmail,
            subject: `⏰ Rappel : Votre RDV dans ${hoursAhead}h — ${doctorName}`,
            html: `
        <div style="font-family:Arial,sans-serif; max-width:520px; margin:auto; background:#fff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
          <div style="background:#0d9488; padding:24px 28px;">
            <h1 style="color:white; margin:0; font-size:20px;">🏥 MediConnect</h1>
            <p style="color:#ccfbf1; margin:6px 0 0; font-size:13px;">Rappel de rendez-vous</p>
          </div>
          <div style="padding:28px;">
            <p style="font-size:16px; color:#0f172a;">Bonjour <strong>${patientName}</strong>,</p>
            <p style="color:#475569;">Vous avez un rendez-vous médical dans <strong>${hoursAhead} heures</strong>.</p>

            <div style="background:#f0fdfa; border:1px solid #99f6e4; border-radius:10px; padding:18px; margin:20px 0;">
              <div style="display:flex; margin-bottom:10px;">
                <span style="color:#64748b; width:120px; font-size:13px;">👨‍⚕️ Médecin</span>
                <strong style="color:#0f172a; font-size:13px;">${doctorName}</strong>
              </div>
              <div style="display:flex; margin-bottom:10px;">
                <span style="color:#64748b; width:120px; font-size:13px;">📅 Date</span>
                <strong style="color:#0f172a; font-size:13px;">${dateStr}</strong>
              </div>
              <div style="display:flex; margin-bottom:10px;">
                <span style="color:#64748b; width:120px; font-size:13px;">🕙 Heure</span>
                <strong style="color:#0f172a; font-size:13px;">${timeStr}</strong>
              </div>
              <div style="display:flex;">
                <span style="color:#64748b; width:120px; font-size:13px;">🏥 Type</span>
                <strong style="color:#0f172a; font-size:13px;">${appt.consultationType === 'TELECONSULTATION' ? '💻 Téléconsultation' : '🏥 Présentiel'}</strong>
              </div>
            </div>

            ${appt.consultationType === 'TELECONSULTATION' && appt.videoRoomId ? `
            <div style="text-align:center; margin:20px 0;">
              <a href="https://meet.jit.si/${appt.videoRoomId}" style="background:#3b82f6; color:white; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
                📹 Rejoindre la téléconsultation
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
};
exports.AppointmentsReminderService = AppointmentsReminderService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppointmentsReminderService.prototype, "sendReminders", null);
exports.AppointmentsReminderService = AppointmentsReminderService = AppointmentsReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AppointmentsReminderService);
//# sourceMappingURL=appointments-reminder.service.js.map
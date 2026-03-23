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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("./entities/appointment.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/notification.entity");
const uuid_1 = require("uuid");
const patient_entity_1 = require("../patients/entities/patient.entity");
let AppointmentsService = class AppointmentsService {
    constructor(repo, notificationsService) {
        this.repo = repo;
        this.notificationsService = notificationsService;
    }
    async create(dto) {
        const apptDate = new Date(dto.appointmentDate);
        const endDate = new Date(apptDate.getTime() + (dto.durationMinutes ?? 30) * 60000);
        console.log(`[Appointments] create → doctorId=${dto.doctorId} patientId=${dto.patientId} date=${apptDate}`);
        const conflict = await this.repo
            .createQueryBuilder("a")
            .where("a.doctorId = :doctorId", { doctorId: dto.doctorId })
            .andWhere("a.status IN (:...statuses)", {
            statuses: [appointment_entity_1.AppointmentStatus.CONFIRMED, appointment_entity_1.AppointmentStatus.REQUESTED],
        })
            .andWhere("a.appointmentDate < :end AND a.appointmentDate >= :start", {
            start: apptDate, end: endDate,
        })
            .getOne();
        if (conflict) {
            throw new common_1.BadRequestException("Ce créneau est déjà réservé pour ce médecin.");
        }
        const appt = this.repo.create({
            patientId: dto.patientId,
            doctorId: dto.doctorId,
            appointmentDate: apptDate,
            durationMinutes: dto.durationMinutes ?? 30,
            consultationType: dto.consultationType,
            reason: dto.reason,
            status: appointment_entity_1.AppointmentStatus.REQUESTED,
            reminderSent: false,
            videoRoomId: dto.consultationType === appointment_entity_1.ConsultationType.TELECONSULTATION
                ? `mediconnect-${(0, uuid_1.v4)().slice(0, 8)}`
                : null,
        });
        const saved = await this.repo.save(appt);
        try {
            await this.notificationsService.create({
                userId: saved.doctorId,
                type: notification_entity_1.NotificationType.APPOINTMENT_CONFIRMED,
                title: "Nouvelle demande de RDV",
                message: `Un patient a demandé un rendez-vous le ${apptDate.toLocaleDateString("fr-FR")}.`,
                relatedId: saved.id,
            });
        }
        catch (e) {
            console.warn("[Notifications] Impossible de notifier le médecin:", e.message);
        }
        return this.findOneSafe(saved.id);
    }
    async findByPatient(patientId) {
        try {
            const appts = await this.repo.find({
                where: { patientId },
                order: { appointmentDate: "DESC" },
            });
            return await Promise.all(appts.map(a => this.findOneSafe(a.id)));
        }
        catch (err) {
            console.error("[AppointmentsService] findByPatient error:", err.message);
            return this.repo.find({
                where: { patientId },
                order: { appointmentDate: "DESC" },
            });
        }
    }
    async findByDoctor(doctorId, date) {
        console.log(`[Appointments] findByDoctor → doctorId=${doctorId} date=${date}`);
        try {
            const pending = await this.repo.find({
                where: { doctorId, status: appointment_entity_1.AppointmentStatus.REQUESTED },
                relations: ["patient"],
                order: { appointmentDate: "ASC" },
            });
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setDate(end.getDate() + 60);
            end.setHours(23, 59, 59, 999);
            let appointmentDate = (0, typeorm_2.Between)(start, end);
            if (date) {
                const d = new Date(date);
                const s = new Date(d);
                s.setHours(0, 0, 0, 0);
                const e = new Date(d);
                e.setHours(23, 59, 59, 999);
                appointmentDate = (0, typeorm_2.Between)(s, e);
            }
            const scheduled = await this.repo.find({
                where: {
                    doctorId,
                    appointmentDate,
                    status: (0, typeorm_2.In)([appointment_entity_1.AppointmentStatus.CONFIRMED, appointment_entity_1.AppointmentStatus.COMPLETED]),
                },
                relations: ["patient"],
                order: { appointmentDate: "ASC" },
            });
            const map = new Map();
            [...pending, ...scheduled].forEach(a => map.set(a.id, a));
            return Array.from(map.values()).sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
        }
        catch (err) {
            console.error("[AppointmentsService] findByDoctor error:", err.message);
            return this.repo.find({
                where: { doctorId },
                order: { appointmentDate: "ASC" },
            });
        }
    }
    async cancel(id, reason) {
        const appt = await this.findOne(id);
        if (appt.status === appointment_entity_1.AppointmentStatus.CANCELLED)
            throw new common_1.BadRequestException("Ce RDV est déjà annulé.");
        if (appt.status === appointment_entity_1.AppointmentStatus.COMPLETED)
            throw new common_1.BadRequestException("Impossible d'annuler un RDV terminé.");
        const diff = new Date(appt.appointmentDate).getTime() - Date.now();
        if (diff < 24 * 60 * 60 * 1000 && appt.status === appointment_entity_1.AppointmentStatus.CONFIRMED && diff > 0)
            throw new common_1.BadRequestException("L'annulation doit être faite au moins 24h à l'avance.");
        appt.status = appointment_entity_1.AppointmentStatus.CANCELLED;
        appt.cancellationReason = reason;
        await this.repo.save(appt);
        try {
            const patient = await this.repo.manager.findOne(patient_entity_1.Patient, {
                where: { id: appt.patientId },
            });
            const notifUserId = patient?.userId ?? appt.patientId;
            console.log(`[Notifications] cancel → patientId=${appt.patientId} → userId=${notifUserId}`);
            const dateStr = new Date(appt.appointmentDate).toLocaleDateString("fr-FR", {
                weekday: "long", day: "2-digit", month: "long",
            });
            const timeStr = new Date(appt.appointmentDate).toLocaleTimeString("fr-FR", {
                hour: "2-digit", minute: "2-digit",
            });
            await this.notificationsService.create({
                userId: notifUserId,
                type: notification_entity_1.NotificationType.APPOINTMENT_CANCELLED,
                title: "❌ Rendez-vous refusé",
                message: reason
                    ? `Votre demande de RDV du ${dateStr} à ${timeStr} a été refusée. Motif : ${reason}`
                    : `Votre demande de RDV du ${dateStr} à ${timeStr} a été refusée.`,
                relatedId: appt.id,
            });
        }
        catch (e) {
            console.warn("[Notifications] Impossible de notifier le patient (cancel):", e.message);
        }
        return this.findOneSafe(id);
    }
    async confirm(id) {
        const appt = await this.findOne(id);
        if (appt.status !== appointment_entity_1.AppointmentStatus.REQUESTED)
            throw new common_1.BadRequestException("Seules les demandes en attente peuvent être confirmées.");
        appt.status = appointment_entity_1.AppointmentStatus.CONFIRMED;
        await this.repo.save(appt);
        try {
            const patient = await this.repo.manager.findOne(patient_entity_1.Patient, {
                where: { id: appt.patientId },
            });
            const notifUserId = patient?.userId ?? appt.patientId;
            console.log(`[Notifications] confirm → patientId=${appt.patientId} → userId=${notifUserId}`);
            await this.notificationsService.create({
                userId: notifUserId,
                type: notification_entity_1.NotificationType.APPOINTMENT_CONFIRMED,
                title: "✅ Rendez-vous confirmé",
                message: `Votre rendez-vous du ${new Date(appt.appointmentDate).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })} à ${new Date(appt.appointmentDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} a été confirmé.`,
                relatedId: appt.id,
            });
        }
        catch (e) {
            console.warn("[Notifications] Impossible de notifier le patient (confirm):", e.message);
        }
        return this.findOneSafe(id);
    }
    async complete(id, notes) {
        const appt = await this.findOne(id);
        if (appt.status !== appointment_entity_1.AppointmentStatus.CONFIRMED)
            throw new common_1.BadRequestException("Seuls les RDV confirmés peuvent être marqués terminés.");
        appt.status = appointment_entity_1.AppointmentStatus.COMPLETED;
        if (notes)
            appt.notes = notes;
        await this.repo.save(appt);
        return this.findOneSafe(id);
    }
    async rate(id, dto) {
        const appt = await this.findOne(id);
        if (appt.status !== appointment_entity_1.AppointmentStatus.COMPLETED)
            throw new common_1.BadRequestException("Seules les consultations terminées peuvent être évaluées.");
        if (appt.rated)
            throw new common_1.BadRequestException("Cette consultation a déjà été évaluée.");
        appt.rating = dto.rating;
        appt.ratingComment = dto.comment;
        appt.rated = true;
        await this.repo.save(appt);
        return this.findOneSafe(id);
    }
    async generateVideoRoom(id) {
        const appt = await this.findOne(id);
        if (!appt.videoRoomId) {
            appt.videoRoomId = `mediconnect-${(0, uuid_1.v4)().slice(0, 8)}`;
            await this.repo.save(appt);
        }
        return { videoRoomId: appt.videoRoomId, jitsiUrl: `https://meet.jit.si/${appt.videoRoomId}` };
    }
    async findOne(id) {
        const appt = await this.repo.findOne({ where: { id } });
        if (!appt)
            throw new common_1.NotFoundException(`RDV #${id} introuvable.`);
        return appt;
    }
    async findOneSafe(id) {
        try {
            const appt = await this.repo.findOne({
                where: { id },
                relations: ["doctor", "patient"],
            });
            if (!appt)
                throw new common_1.NotFoundException(`RDV #${id} introuvable.`);
            return appt;
        }
        catch (err) {
            console.error("[AppointmentsService] findOneSafe relations error:", err.message);
            const appt = await this.repo.findOne({ where: { id } });
            if (!appt)
                throw new common_1.NotFoundException(`RDV #${id} introuvable.`);
            return appt;
        }
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map
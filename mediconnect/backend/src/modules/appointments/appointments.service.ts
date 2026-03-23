// appointments.service.ts
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, In } from "typeorm";
import { Appointment, AppointmentStatus, ConsultationType } from "./entities/appointment.entity";
import { CreateAppointmentDto } from "././dto/create-appointment.dto";
import { RateAppointmentDto }   from "././dto/rate-appointment.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType }     from "../notifications/notification.entity";
import { v4 as uuid } from "uuid";
import { Patient } from "../patients/entities/patient.entity";
@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const apptDate = new Date(dto.appointmentDate);
    const endDate  = new Date(apptDate.getTime() + (dto.durationMinutes ?? 30) * 60000);

    console.log(`[Appointments] create → doctorId=${dto.doctorId} patientId=${dto.patientId} date=${apptDate}`);

    const conflict = await this.repo
      .createQueryBuilder("a")
      .where("a.doctorId = :doctorId", { doctorId: dto.doctorId })
      .andWhere("a.status IN (:...statuses)", {
        statuses: [AppointmentStatus.CONFIRMED, AppointmentStatus.REQUESTED],
      })
      .andWhere("a.appointmentDate < :end AND a.appointmentDate >= :start", {
        start: apptDate, end: endDate,
      })
      .getOne();

    if (conflict) {
      throw new BadRequestException("Ce créneau est déjà réservé pour ce médecin.");
    }

    const appt = this.repo.create({
      patientId:        dto.patientId,
      doctorId:         dto.doctorId,
      appointmentDate:  apptDate,
      durationMinutes:  dto.durationMinutes ?? 30,
      consultationType: dto.consultationType as ConsultationType,
      reason:           dto.reason,
      status:           AppointmentStatus.REQUESTED,
      reminderSent:     false,
      videoRoomId: dto.consultationType === ConsultationType.TELECONSULTATION
        ? `mediconnect-${uuid().slice(0, 8)}`
        : null,
    });

    const saved = await this.repo.save(appt);

    // ── Notifier le médecin (non-bloquant) ────────────────────────────
    try {
      await this.notificationsService.create({
        userId:    saved.doctorId,
        type:      NotificationType.APPOINTMENT_CONFIRMED,
        title:     "Nouvelle demande de RDV",
        message:   `Un patient a demandé un rendez-vous le ${apptDate.toLocaleDateString("fr-FR")}.`,
        relatedId: saved.id,
      });
    } catch (e) {
      console.warn("[Notifications] Impossible de notifier le médecin:", e.message);
    }

    return this.findOneSafe(saved.id);
  }

  async findByPatient(patientId: string): Promise<any[]> {
    try {
      const appts = await this.repo.find({
        where: { patientId },
        order: { appointmentDate: "DESC" },
      });
      return await Promise.all(appts.map(a => this.findOneSafe(a.id)));
    } catch (err) {
      console.error("[AppointmentsService] findByPatient error:", err.message);
      return this.repo.find({
        where: { patientId },
        order: { appointmentDate: "DESC" },
      });
    }
  }

  async findByDoctor(doctorId: string, date?: string): Promise<Appointment[]> {
    console.log(`[Appointments] findByDoctor → doctorId=${doctorId} date=${date}`);

    try {
      const pending = await this.repo.find({
        where:     { doctorId, status: AppointmentStatus.REQUESTED },
        relations: ["patient"],
        order:     { appointmentDate: "ASC" },
      });

      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end   = new Date(); end.setDate(end.getDate() + 60); end.setHours(23, 59, 59, 999);

      let appointmentDate: any = Between(start, end);
      if (date) {
        const d = new Date(date);
        const s = new Date(d); s.setHours(0, 0, 0, 0);
        const e = new Date(d); e.setHours(23, 59, 59, 999);
        appointmentDate = Between(s, e);
      }

      const scheduled = await this.repo.find({
        where: {
          doctorId,
          appointmentDate,
          status: In([AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED]),
        },
        relations: ["patient"],
        order:     { appointmentDate: "ASC" },
      });

      const map = new Map<string, Appointment>();
      [...pending, ...scheduled].forEach(a => map.set(a.id, a));

      return Array.from(map.values()).sort(
        (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
      );

    } catch (err) {
      console.error("[AppointmentsService] findByDoctor error:", err.message);
      return this.repo.find({
        where: { doctorId },
        order: { appointmentDate: "ASC" },
      });
    }
  }

  async cancel(id: string, reason: string): Promise<Appointment> {
  const appt = await this.findOne(id);

  if (appt.status === AppointmentStatus.CANCELLED)
    throw new BadRequestException("Ce RDV est déjà annulé.");
  if (appt.status === AppointmentStatus.COMPLETED)
    throw new BadRequestException("Impossible d'annuler un RDV terminé.");

  const diff = new Date(appt.appointmentDate).getTime() - Date.now();
  if (diff < 24 * 60 * 60 * 1000 && appt.status === AppointmentStatus.CONFIRMED && diff > 0)
    throw new BadRequestException("L'annulation doit être faite au moins 24h à l'avance.");

  appt.status = AppointmentStatus.CANCELLED;
  appt.cancellationReason = reason;
  await this.repo.save(appt);

  try {
    // ✅ Résoudre le vrai user_id depuis la table patients
    const patient = await this.repo.manager.findOne(Patient, {
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
      userId:    notifUserId,  // ✅ user_id, pas patient_id
      type:      NotificationType.APPOINTMENT_CANCELLED,
      title:     "❌ Rendez-vous refusé",
      message:   reason
        ? `Votre demande de RDV du ${dateStr} à ${timeStr} a été refusée. Motif : ${reason}`
        : `Votre demande de RDV du ${dateStr} à ${timeStr} a été refusée.`,
      relatedId: appt.id,
    });
  } catch (e) {
    console.warn("[Notifications] Impossible de notifier le patient (cancel):", e.message);
  }

  return this.findOneSafe(id);
}

async confirm(id: string): Promise<Appointment> {
  const appt = await this.findOne(id);
  if (appt.status !== AppointmentStatus.REQUESTED)
    throw new BadRequestException("Seules les demandes en attente peuvent être confirmées.");

  appt.status = AppointmentStatus.CONFIRMED;
  await this.repo.save(appt);

  try {
    // ✅ Résoudre le vrai user_id
    const patient = await this.repo.manager.findOne(Patient, {
      where: { id: appt.patientId },
    });
    const notifUserId = patient?.userId ?? appt.patientId;
    console.log(`[Notifications] confirm → patientId=${appt.patientId} → userId=${notifUserId}`);

    await this.notificationsService.create({
      userId:    notifUserId,  // ✅ user_id, pas patient_id
      type:      NotificationType.APPOINTMENT_CONFIRMED,
      title:     "✅ Rendez-vous confirmé",
      message:   `Votre rendez-vous du ${new Date(appt.appointmentDate).toLocaleDateString("fr-FR", { weekday:"long", day:"2-digit", month:"long" })} à ${new Date(appt.appointmentDate).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })} a été confirmé.`,
      relatedId: appt.id,
    });
  } catch (e) {
    console.warn("[Notifications] Impossible de notifier le patient (confirm):", e.message);
  }

  return this.findOneSafe(id);
}

  async complete(id: string, notes?: string): Promise<Appointment> {
    const appt = await this.findOne(id);
    if (appt.status !== AppointmentStatus.CONFIRMED)
      throw new BadRequestException("Seuls les RDV confirmés peuvent être marqués terminés.");
    appt.status = AppointmentStatus.COMPLETED;
    if (notes) appt.notes = notes;
    await this.repo.save(appt);
    return this.findOneSafe(id);
  }

  async rate(id: string, dto: RateAppointmentDto): Promise<Appointment> {
    const appt = await this.findOne(id);
    if (appt.status !== AppointmentStatus.COMPLETED)
      throw new BadRequestException("Seules les consultations terminées peuvent être évaluées.");
    if (appt.rated)
      throw new BadRequestException("Cette consultation a déjà été évaluée.");
    appt.rating        = dto.rating;
    appt.ratingComment = dto.comment;
    appt.rated         = true;
    await this.repo.save(appt);
    return this.findOneSafe(id);
  }

  async generateVideoRoom(id: string): Promise<{ videoRoomId: string; jitsiUrl: string }> {
    const appt = await this.findOne(id);
    if (!appt.videoRoomId) {
      appt.videoRoomId = `mediconnect-${uuid().slice(0, 8)}`;
      await this.repo.save(appt);
    }
    return { videoRoomId: appt.videoRoomId, jitsiUrl: `https://meet.jit.si/${appt.videoRoomId}` };
  }

  private async findOne(id: string): Promise<Appointment> {
    const appt = await this.repo.findOne({ where: { id } });
    if (!appt) throw new NotFoundException(`RDV #${id} introuvable.`);
    return appt;
  }

  private async findOneSafe(id: string): Promise<Appointment> {
    try {
      const appt = await this.repo.findOne({
        where:     { id },
        relations: ["doctor", "patient"],
      });
      if (!appt) throw new NotFoundException(`RDV #${id} introuvable.`);
      return appt;
    } catch (err) {
      console.error("[AppointmentsService] findOneSafe relations error:", err.message);
      const appt = await this.repo.findOne({ where: { id } });
      if (!appt) throw new NotFoundException(`RDV #${id} introuvable.`);
      return appt;
    }
  }
}
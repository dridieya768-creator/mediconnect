// appointments.service.ts - v2
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, In } from "typeorm";
import { Appointment, AppointmentStatus, ConsultationType } from "./entities/appointment.entity";
import { CreateAppointmentDto } from "././dto/create-appointment.dto";
import { RateAppointmentDto }   from "././dto/rate-appointment.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType }     from "../notifications/notification.entity";
import { SmsService }           from "../notifications/sms.service";
import { v4 as uuid } from "uuid";
@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
    private readonly notificationsService: NotificationsService,
    private readonly smsService: SmsService,
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
      beneficiaryId:    dto.beneficiaryId ?? null,
      beneficiaryNom:   dto.beneficiaryNom ?? null,
      beneficiaryPrenom: dto.beneficiaryPrenom ?? null,
      videoRoomId: dto.consultationType === ConsultationType.TELECONSULTATION
        ? `mediconnect-${uuid().slice(0, 8)}`
        : null,
    });

    const saved = await this.repo.save(appt);

    
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
      
      const userIdFromPatient = await this.resolvePatientUserId(patientId);
      const idsToSearch = [...new Set([patientId, userIdFromPatient])];

      const appts = await this.repo
        .createQueryBuilder("a")
        .where("a.patientId IN (:...ids)", { ids: idsToSearch })
        .orderBy("a.appointmentDate", "DESC")
        .getMany();

      return await Promise.all(appts.map(a => this.findOneSafe(a.id)));
    } catch (err) {
      console.error("[AppointmentsService] findByPatient error:", err.message);
      return this.repo.find({
        where: { patientId },
        order: { appointmentDate: "DESC" },
      });
    }
  }

  async findDoctorsByPatient(patientUserId: string): Promise<any[]> {
    try {
      const resolvedId = await this.resolvePatientUserId(patientUserId);
      const idsToSearch = [...new Set([patientUserId, resolvedId])];

      
      const appts = await this.repo
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.doctor', 'doctor')
        .where('a.patientId IN (:...ids)', { ids: idsToSearch })
        .andWhere('a.status IN (:...statuses)', {
          statuses: [
            AppointmentStatus.COMPLETED,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.REQUESTED,
          ],
        })
        .getMany();

      const doctorMap = new Map<string, any>();
      for (const a of appts) {
        if (a.doctorId && !doctorMap.has(a.doctorId)) {
          doctorMap.set(a.doctorId, {
            id:        a.doctorId,
            firstName: (a.doctor as any)?.firstName ?? '',
            lastName:  (a.doctor as any)?.lastName ?? '',
            email:     (a.doctor as any)?.email ?? '',
          });
        }
      }
      return Array.from(doctorMap.values());
    } catch (err) {
      console.error('[AppointmentsService] findDoctorsByPatient error:', (err as any).message);
      return [];
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

      const list = Array.from(map.values()).sort(
        (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
      );

    
      return await this.enrichWithBeneficiaryDocs(list);

    } catch (err) {
      console.error("[AppointmentsService] findByDoctor error:", err.message);
      return this.repo.find({
        where: { doctorId },
        order: { appointmentDate: "ASC" },
      });
    }
  }

  private async enrichWithBeneficiaryDocs(appointments: any[]): Promise<any[]> {
    const withBeneficiary = appointments.filter(a => a.beneficiaryId);
    if (withBeneficiary.length === 0) return appointments;

    const ids = [...new Set(withBeneficiary.map(a => a.beneficiaryId))];
    const rows = await this.repo.manager.query(
      `SELECT id, doc_membre_path, doc_patient_path FROM family_members WHERE id = ANY($1)`,
      [ids]
    );
    const docsMap = new Map<string, { docMembrePath: string; docPatientPath: string }>();
    for (const row of rows) {
      docsMap.set(row.id, {
        docMembrePath:  row.doc_membre_path,
        docPatientPath: row.doc_patient_path,
      });
    }

    return appointments.map(a => {
      if (!a.beneficiaryId) return a;
      const docs = docsMap.get(a.beneficiaryId);
      return {
        ...a,
        beneficiaryDocMembrePath:  docs?.docMembrePath  ?? null,
        beneficiaryDocPatientPath: docs?.docPatientPath ?? null,
      };
    });
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
    
    const notifUserId = await this.resolvePatientUserId(appt.patientId);
    console.log(`[Notifications] cancel → patientId=${appt.patientId} → notifUserId=${notifUserId}`);

    const dateStr = new Date(appt.appointmentDate).toLocaleDateString("fr-FR", {
      weekday: "long", day: "2-digit", month: "long",
    });
    const timeStr = new Date(appt.appointmentDate).toLocaleTimeString("fr-FR", {
      hour: "2-digit", minute: "2-digit",
    });

    await this.notificationsService.create({
      userId:    notifUserId,
      type:      NotificationType.APPOINTMENT_CANCELLED,
      title:     "Rendez-vous refusé",
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
    
    const notifUserId = await this.resolvePatientUserId(appt.patientId);
    console.log(`[Notifications] confirm → patientId=${appt.patientId} → notifUserId=${notifUserId}`);

    const dateStr = new Date(appt.appointmentDate).toLocaleDateString("fr-FR", { weekday:"long", day:"2-digit", month:"long" });
    const timeStr = new Date(appt.appointmentDate).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });
    const message = `Votre rendez-vous du ${dateStr} à ${timeStr} a été confirmé.`;

    await this.notificationsService.create({
      userId:    notifUserId,
      type:      NotificationType.APPOINTMENT_CONFIRMED,
      title:     "Rendez-vous confirmé",
      message,
      relatedId: appt.id,
    });

    
    const patientPhone = await this.resolvePatientPhone(appt.patientId);
    if (patientPhone) {
      await this.smsService.sendSms(
        patientPhone,
        `MediConnect: ${message}`,
      );
      await this.notificationsService.create({
        userId:    notifUserId,
        type:      NotificationType.SMS_REMINDER,
        title:     "SMS envoyé",
        message:   `SMS de confirmation envoyé au ${patientPhone}`,
        relatedId: appt.id,
      });
    }
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

  async generateVideoRoom(id: string): Promise<{ videoRoomId: string; jitsiUrl: string; patientId: string }> {
    const appt = await this.findOne(id);
    if (!appt.videoRoomId) {
      appt.videoRoomId = `mediconnect-${uuid().slice(0, 8)}`;
      await this.repo.save(appt);
    }
    // Résoudre le patient.id réel (appt.patientId est un user_id)
    const patientRow = await this.repo.manager.query(
      `SELECT id FROM patients WHERE user_id = $1 LIMIT 1`,
      [appt.patientId]
    );
    const patientId = patientRow?.[0]?.id ?? appt.patientId;
    return { videoRoomId: appt.videoRoomId, jitsiUrl: `https://meet.jit.si/${appt.videoRoomId}`, patientId };
  }

  
  private async resolvePatientUserId(patientId: string): Promise<string> {
    const result = await this.repo.manager.query(
      `SELECT user_id FROM patients WHERE id = $1 LIMIT 1`,
      [patientId]
    );
    if (result?.length > 0 && result[0].user_id) {
      return result[0].user_id;
    }
    return patientId;
  }

  
  private async resolvePatientPhone(patientId: string): Promise<string | null> {
    
    const result = await this.repo.manager.query(
      `SELECT u.phone
       FROM patients p
       LEFT JOIN users u ON u.id = p.user_id
       WHERE p.id = $1 LIMIT 1`,
      [patientId]
    );
    if (result?.length > 0 && result[0].phone) {
      return result[0].phone;
    }
    
    const fromUser = await this.repo.manager.query(
      `SELECT phone FROM users WHERE id = $1 LIMIT 1`,
      [patientId]
    );
    return fromUser?.[0]?.phone || null;
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
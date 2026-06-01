﻿﻿import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedecinProfile } from './entities/medecin-profile.entity';
import { DoctorPatient } from './entities/doctor-patient.entity';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UpdateAvailabilityDto } from './update-availability.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
import { SmsService } from '../notifications/sms.service';
import { RevenusService } from './revenus.service';
@Injectable()
export class MedecinsService {
  constructor(
    @InjectRepository(MedecinProfile)
    private medecinProfileRepository: Repository<MedecinProfile>,
    @InjectRepository(DoctorPatient)
    private doctorPatientRepository: Repository<DoctorPatient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private readonly notificationsService: NotificationsService,
    private readonly smsService: SmsService,
    private readonly revenusService: RevenusService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.medecinProfileRepository.findOne({
      where: { userId: userId },
    });
  
    if (!profile) {
      const newProfile = this.medecinProfileRepository.create({
        userId: userId,
        agendaConnecte: true,
        disponTeleconsult: false,
        connexionVideoIntegree: false,
        profilSEO: false,
        statsAnalytics: false,
      });
      return this.medecinProfileRepository.save(newProfile);
    }
    
    return profile;
  }
  
 
  async updateProfile(userId: string, updateData: any) {
    let profile = await this.medecinProfileRepository.findOne({
      where: { userId: userId },
    });
    
    if (!profile) {
      profile = this.medecinProfileRepository.create({ 
        userId: userId 
      });
    }
    
    if (updateData.photoPro && updateData.photoPro.startsWith('data:image')) {
      updateData.photoPro = await this.saveBase64Image(updateData.photoPro, 'photos');
    }
    
    if (updateData.photosCabinet) {
      const photos = updateData.photosCabinet.split(',');
      const savedPhotos = [];
      
      for (const photo of photos) {
        const trimmedPhoto = photo.trim();
        if (trimmedPhoto.startsWith('data:image')) {
          const savedUrl = await this.saveBase64Image(trimmedPhoto, 'cabinet');
          savedPhotos.push(savedUrl);
        } else {
          savedPhotos.push(trimmedPhoto);
        }
      }
      
      updateData.photosCabinet = savedPhotos.join(', ');
    }
    
    Object.assign(profile, updateData);
    return this.medecinProfileRepository.save(profile);
  }

  async getMedecinById(id: string) {
    const medecinRoles = ['MEDECIN'];

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user || !medecinRoles.includes(user.role) || user.status !== 'ACTIVE') {
      throw new NotFoundException('Médecin non trouvé');
    }

    const profile = await this.medecinProfileRepository.findOne({
      where: { userId: id },
    });

    return {
      id: user.id,
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      profile: profile || null,
    };
  }

  async getAllMedecinsWithProfiles(search?: string, specialite?: string, ville?: string) {
  const roles = ['MEDECIN', 'MEDECIN_GENERALISTE', 'MEDECIN_SPECIALISTE'];
 
  let qb = this.userRepository
    .createQueryBuilder('user')
    .where('user.role IN (:...roles)', { roles })
    .andWhere("user.status = 'ACTIVE'");
 
  const trimmedSearch = search?.trim();
  const trimmedSpecialite = specialite?.trim();
  const trimmedVille = ville?.trim();

  if (trimmedSearch) {
    qb = qb.andWhere(
      '(LOWER(user.firstName) LIKE :s OR LOWER(user.lastName) LIKE :s OR LOWER(user.email) LIKE :s)',
      { s: `%${trimmedSearch.toLowerCase()}%` }
    );
  }
 
  const users = await qb.getMany();
  const profiles = await this.medecinProfileRepository.find();
  const profileMap = new Map(profiles.map(p => [p.userId, p]));
 
  let result = users.map(u => ({
    id:        u.id,
    userId:    u.id,
    firstName: u.firstName,
    lastName:  u.lastName,
    email:     u.email,
    role:      u.role,
    avatarUrl: u.avatarUrl,
    profile:   profileMap.get(u.id) || null,
  }));
 
  
  if (trimmedSpecialite) {
    result = result.filter(d =>
      (d.profile?.specialite || '').toLowerCase().includes(trimmedSpecialite.toLowerCase())
    );
  }
  if (trimmedVille) {
    result = result.filter(d =>
      (d.profile?.ville || '').toLowerCase() === trimmedVille.toLowerCase()
    );
  }
 
  return result;
}
async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
  const profile = await this.medecinProfileRepository
    .createQueryBuilder('profile')
    .where('profile.user_id = :userId', { userId })
    .getOne();

  if (!profile) throw new NotFoundException('Profile not found');

  
  const availabilityData = {
    workDays:                dto.workDays,
    defaultDuration:         dto.defaultDuration,
    acceptsTeleconsultation: dto.acceptsTeleconsultation,
    conges:                  (dto as any).conges ?? [],
  };

  Object.assign(profile, {
    tarifs: availabilityData,
    ...(dto.disponTeleconsult      !== undefined && { disponTeleconsult:      dto.disponTeleconsult }),
    ...(dto.connexionVideoIntegree !== undefined && { connexionVideoIntegree: dto.connexionVideoIntegree }),
  });

  return this.medecinProfileRepository.save(profile);
}

async getAvailability(userId: string) {
  const profile = await this.medecinProfileRepository
    .createQueryBuilder('profile')
    .where('profile.user_id = :userId', { userId })
    .getOne();

  if (!profile) throw new NotFoundException('Profile not found');

  
  let saved: any = {};
  if (profile.tarifs) {
    try {
      saved = typeof profile.tarifs === 'string'
        ? JSON.parse(profile.tarifs)
        : profile.tarifs;
    } catch (e) {
      saved = {};
    }
  }

  return {
    workDays:                saved?.workDays                ?? null,
    defaultDuration:         saved?.defaultDuration         ?? 30,
    acceptsTeleconsultation: saved?.acceptsTeleconsultation ?? true,
    conges:                  saved?.conges                  ?? [],
    disponTeleconsult:       profile.disponTeleconsult,
    connexionVideoIntegree:  profile.connexionVideoIntegree,
  };
}
  
async addPatientToDoctorList(doctorId: string, patientId: string) {
  console.log(`[Service]  addPatientToDoctorList: doctor=${doctorId}, patient=${patientId}`);
  
  try {
    
    const patientExists = await this.userRepository.findOne({
      where: { id: patientId }
    });
    
    if (!patientExists) {
      console.error(`[Service]  Patient ${patientId} does not exist in users table!`);
      return { 
        success: false, 
        message: 'Patient non trouver dans la base de donnÃ©es',
        patient: null
      };
    }
    
    
    const existingRelation = await this.doctorPatientRepository.findOne({
      where: { doctorId, patientId }
    });
    
    if (!existingRelation) {
      
      const newRelation = this.doctorPatientRepository.create({
        doctorId,
        patientId,
        addedAt: new Date(),
        status: 'ACTIVE'
      });
      await this.doctorPatientRepository.save(newRelation);
      console.log(`[Service] Patient ${patientId} added to doctor ${doctorId}`);
      
      return { success: true, patient: patientExists };
    }
    
    console.log(`[Service]  Patient ${patientId} already in doctor ${doctorId} list`);
    return { success: false, message: 'Patient dÃ©jÃ  dans la liste', patient: patientExists };
  } catch (error) {
    console.error('[Service] âŒ Error in addPatientToDoctorList:', error);
    return { success: false, message: error.message, patient: null };
  }
}

  
 
async acceptAppointment(doctorId: string, appointmentId: string) {
  console.log(`[Service]  acceptAppointment called with doctorId=${doctorId}, appointmentId=${appointmentId}`);
  
  try {
    
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, doctorId: doctorId },
      relations: ['patient']
    });
    
    console.log(`[Service]  Appointment found:`, {
      id: appointment?.id,
      status: appointment?.status,
      patientId: appointment?.patientId,
      hasPatient: !!appointment?.patient
    });
    
    if (!appointment) {
      throw new NotFoundException(`Rendez-vous ${appointmentId} non trouvé`);
    }
    
  
    if (!appointment.patientId) {
      throw new BadRequestException('Le rendez-vous n\'a pas de patient associé');
    }
    
    
    const patientExists = await this.userRepository.findOne({
      where: { id: appointment.patientId }
    });
    
    if (!patientExists) {
      console.warn(`[Service] Patient ${appointment.patientId} not found in users, but continuing with appointment acceptance`);
      
    }
    
    
    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      await this.appointmentRepository.update(
        { id: appointmentId },
        { status: AppointmentStatus.CONFIRMED }
      );

      
      try {
        const patientUserId = await this.resolvePatientUserId(appointment.patientId);
        const dateStr = new Date(appointment.appointmentDate).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
        const timeStr = new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        await this.notificationsService.create({
          userId:    patientUserId,
          type:      NotificationType.APPOINTMENT_CONFIRMED,
          title:     'Rendez-vous confirme',
          message:   `Votre rendez-vous du ${dateStr} a ${timeStr} a ete confirme.`,
          relatedId: appointment.id,
        });
        console.log(`[Notifications] acceptAppointment -> notif envoyee a userId=${patientUserId}`);

        
        try {
          const patientPhone = await this.resolvePatientPhone(appointment.patientId);
          if (patientPhone) {
            await this.smsService.sendSms(
              patientPhone,
              `MediConnect: Votre rendez-vous du ${dateStr} a ${timeStr} a ete confirme.`,
            );
          }
        } catch (smsErr: any) {
          console.warn('[SMS] Impossible d\'envoyer le SMS:', smsErr.message);
        }
      } catch (e) {
        console.warn('[Notifications] Impossible de notifier le patient (accept):', e.message);
      }
      console.log(`[Service]  Appointment status updated to CONFIRMED`);
    } else {
      console.log(`[Service] Appointment already confirmed`);
    }
    
    
    let addedPatient = null;
    if (patientExists) {
      addedPatient = await this.addPatientToDoctorList(doctorId, appointment.patientId);
      console.log(`[Service] Add patient result:`, addedPatient);
    } else {
      console.log(`[Service]  Skipping adding patient to doctor list because patient doesn't exist`);
    }
    
    return {
      success: true,
      message: patientExists 
        ? 'Rendez-vous accepté et patient ajouté à votre liste'
        : 'Rendez-vous accepté (patient non trouvé dans la base)',
      appointment: {
        ...appointment,
        status: AppointmentStatus.CONFIRMED
      },
      patient: patientExists || null
    };
  } catch (error) {
    console.error('[Service] âŒ Error in acceptAppointment:', error);
    throw error;
  }
}
  
  
  // convertit patient id a user.id
  private async resolvePatientUserId(patientId: string): Promise<string> {
    const result = await this.appointmentRepository.manager.query(
      `SELECT user_id FROM patients WHERE id = $1 LIMIT 1`,
      [patientId]
    );
    if (result?.length > 0 && result[0].user_id) {
      return result[0].user_id;
    }
    return patientId;
  }

  private async resolvePatientPhone(patientId: string): Promise<string | null> {
    const result = await this.appointmentRepository.manager.query(
      `SELECT u.phone FROM patients p LEFT JOIN users u ON u.id = p.user_id WHERE p.id = $1 LIMIT 1`,
      [patientId]
    );
    if (result?.length > 0 && result[0].phone) return result[0].phone;
    const fromUser = await this.appointmentRepository.manager.query(
      `SELECT phone FROM users WHERE id = $1 LIMIT 1`,
      [patientId]
    );
    return fromUser?.[0]?.phone || null;
  }
  async getMyPatients(doctorId: string) {
    // Récupérer les relations
    const relations = await this.doctorPatientRepository.find({
      where: { doctorId, status: 'ACTIVE' },
    });
    
    const patientIds = relations.map(rel => rel.patientId);
    
    if (patientIds.length === 0) {
      return [];
    }
    
    
    const patients = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids: patientIds })
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
      .getMany();
    
    return patients;
  }


  async isPatientInDoctorList(doctorId: string, patientId: string) {
    const relation = await this.doctorPatientRepository.findOne({
      where: { doctorId, patientId }
    });
    return !!relation;
  }
   async getMyPatientsFromAppointments(doctorId: string) {
  const appointments = await this.appointmentRepository.find({
    where: [
      { doctorId, status: AppointmentStatus.CONFIRMED },
      { doctorId, status: AppointmentStatus.COMPLETED },
    ],
    relations: ['patient'],
  });


  const seen = new Map<string, any>();
  for (const appt of appointments) {
    if (appt.patient && !seen.has(appt.patientId)) {
      
      const patientRecord = await this.patientRepository.findOne({
        where: { userId: appt.patientId }
      });
      seen.set(appt.patientId, {
        id:        appt.patient.id,
        patientId: patientRecord?.id ?? appt.patientId,
        email:     (appt.patient as any).email,
        firstName: (appt.patient as any).firstName,
        lastName:  (appt.patient as any).lastName,
        phone:     (appt.patient as any).phone,
        rdvCount:  appointments.filter(a => a.patientId === appt.patientId).length,
      });
    }
  }

  return Array.from(seen.values());
}
  
  async removePatientFromDoctorList(doctorId: string, patientId: string) {
    const relation = await this.doctorPatientRepository.findOne({
      where: { doctorId, patientId }
    });
    
    if (!relation) {
      throw new NotFoundException('Patient non trouvé dans la liste');
    }
    
    await this.doctorPatientRepository.remove(relation);
    return { success: true, message: 'Patient retirer de la liste' };
  }
  
  async getMedecinAvailabilityById(id: string) {
    
    const profile = await this.medecinProfileRepository.findOne({
      where: { userId: id },
    });

    
    if (!profile) {
      return {
        workDays: [
          { day: 'monday',    startTime: '08:00', endTime: '17:00' },
          { day: 'tuesday',   startTime: '08:00', endTime: '17:00' },
          { day: 'wednesday', startTime: '08:00', endTime: '17:00' },
          { day: 'thursday',  startTime: '08:00', endTime: '17:00' },
          { day: 'friday',    startTime: '08:00', endTime: '17:00' },
        ],
        defaultDuration: 30,
        acceptsTeleconsultation: true,
        conges: [],
        disponTeleconsult: false,
      };
    }

    let saved: any = {};
    if (profile.tarifs) {
      try {
        saved = typeof profile.tarifs === 'string'
          ? JSON.parse(profile.tarifs)
          : profile.tarifs;
      } catch (e) {
        saved = {};
      }
    }

    
    const defaultWorkDays = [
      { day: 'monday',    startTime: '08:00', endTime: '17:00' },
      { day: 'tuesday',   startTime: '08:00', endTime: '17:00' },
      { day: 'wednesday', startTime: '08:00', endTime: '17:00' },
      { day: 'thursday',  startTime: '08:00', endTime: '17:00' },
      { day: 'friday',    startTime: '08:00', endTime: '17:00' },
    ];

    
    const dayNameMap: Record<string, string> = {
      'Lundi': 'monday', 'Mardi': 'tuesday', 'Mercredi': 'wednesday',
      'Jeudi': 'thursday', 'Vendredi': 'friday', 'Samedi': 'saturday', 'Dimanche': 'sunday',
      'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday',
      'thursday': 'thursday', 'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday',
    };

    let workDays = saved?.workDays ?? null;

    
    if (Array.isArray(workDays) && workDays.length > 0 && workDays[0].name !== undefined) {
      const converted: any[] = [];
      for (const wd of workDays) {
        if (!wd.active) continue;
        const dayKey = dayNameMap[wd.name];
        if (!dayKey) continue;
        // Matin
        if (wd.morningStart && wd.morningEnd) {
          converted.push({ day: dayKey, startTime: wd.morningStart, endTime: wd.morningEnd });
        }
        
        if (wd.afternoonStart && wd.afternoonEnd) {
          converted.push({ day: dayKey, startTime: wd.afternoonStart, endTime: wd.afternoonEnd });
        }
      }
      workDays = converted.length > 0 ? converted : defaultWorkDays;
    }

    const result = {
      workDays: workDays ?? defaultWorkDays,
      defaultDuration: saved?.defaultDuration ?? 30,
      acceptsTeleconsultation: saved?.acceptsTeleconsultation ?? true,
      conges: saved?.conges ?? [],
      disponTeleconsult: profile.disponTeleconsult,
    };
    console.log('[getMedecinAvailabilityById] result workDays sample:', JSON.stringify(result.workDays?.slice(0,2)));
    return result;
  }

  async getOccupiedSlots(id: string, startDate: string, endDate: string) {
    try {
      const profile = await this.medecinProfileRepository.findOne({
        where: { userId: id },
      });

      if (!profile) {
        return [];
      }

      const doctorId = profile.userId;

      const appointments = await this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.doctorId = :id', { id: doctorId })
        .andWhere('appointment.status IN (:...statuses)', {
          statuses: [AppointmentStatus.CONFIRMED, AppointmentStatus.REQUESTED],
        })
        .andWhere('appointment.appointmentDate >= :startDate', { startDate: new Date(startDate + 'T00:00:00') })
        .andWhere('appointment.appointmentDate <= :endDate', { endDate: new Date(endDate + 'T23:59:59') })
        .select(['appointment.appointmentDate', 'appointment.durationMinutes'])
        .getMany();

      return appointments.map((a) => ({
        appointmentDate: a.appointmentDate,
        durationMinutes: a.durationMinutes,
      }));
    } catch (err) {
      console.warn('[getOccupiedSlots] error:', err?.message);
      return [];
    }
  }

  async getRevenus(doctorId: string, from?: string, to?: string) {
  return this.revenusService.getRevenus(
    doctorId,
    from,
    to,
  );
}

  private async saveBase64Image(base64String: string, folder: string): Promise<string> {
    try {
      const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new BadRequestException('Format d\'image invalide');
      }
      
      const extension = matches[1];
      const imageData = matches[2];
      const buffer = Buffer.from(imageData, 'base64');
      
      const uploadDir = path.join(process.cwd(), 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = `${uuidv4()}.${extension}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, buffer as unknown as Uint8Array);
      
      return `/uploads/${folder}/${fileName}`;
    } catch (error) {
      console.error('Error saving image:', error);
      throw new BadRequestException('Erreur lors de la sauvegarde de l\'image');
    }
  }
  
}




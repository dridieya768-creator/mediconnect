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
      throw new NotFoundException('MÃ©decin non trouvÃ©');
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
  const roles = ['MEDECIN'];
 
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
 
  // Filtres sur le profil
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

  // Stocker tout dans la colonne tarifs (JSON)
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

  // âœ… Parser tarifs car c'est du TEXT en DB, pas du JSON automatique
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
  // Ajouter un patient Ã  la liste du mÃ©decin
async addPatientToDoctorList(doctorId: string, patientId: string) {
  console.log(`[Service] ðŸ”µ addPatientToDoctorList: doctor=${doctorId}, patient=${patientId}`);
  
  try {
    // VÃ©rifier d'abord si le patient existe dans users
    const patientExists = await this.userRepository.findOne({
      where: { id: patientId }
    });
    
    if (!patientExists) {
      console.error(`[Service] âŒ Patient ${patientId} does not exist in users table!`);
      return { 
        success: false, 
        message: 'Patient non trouvÃ© dans la base de donnÃ©es',
        patient: null
      };
    }
    
    // VÃ©rifier si la relation existe dÃ©jÃ 
    const existingRelation = await this.doctorPatientRepository.findOne({
      where: { doctorId, patientId }
    });
    
    if (!existingRelation) {
      // CrÃ©er la relation mÃ©decin-patient
      const newRelation = this.doctorPatientRepository.create({
        doctorId,
        patientId,
        addedAt: new Date(),
        status: 'ACTIVE'
      });
      await this.doctorPatientRepository.save(newRelation);
      console.log(`[Service] âœ… Patient ${patientId} added to doctor ${doctorId}`);
      
      return { success: true, patient: patientExists };
    }
    
    console.log(`[Service] â„¹ï¸ Patient ${patientId} already in doctor ${doctorId} list`);
    return { success: false, message: 'Patient dÃ©jÃ  dans la liste', patient: patientExists };
  } catch (error) {
    console.error('[Service] âŒ Error in addPatientToDoctorList:', error);
    return { success: false, message: error.message, patient: null };
  }
}

  // Accepter un rendez-vous et ajouter le patient
 // Accepter un rendez-vous et ajouter le patient
async acceptAppointment(doctorId: string, appointmentId: string) {
  console.log(`[Service] ðŸ”µ acceptAppointment called with doctorId=${doctorId}, appointmentId=${appointmentId}`);
  
  try {
    // 1. RÃ©cupÃ©rer le rendez-vous
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, doctorId: doctorId },
      relations: ['patient']
    });
    
    console.log(`[Service] ðŸ“‹ Appointment found:`, {
      id: appointment?.id,
      status: appointment?.status,
      patientId: appointment?.patientId,
      hasPatient: !!appointment?.patient
    });
    
    if (!appointment) {
      throw new NotFoundException(`Rendez-vous ${appointmentId} non trouvÃ©`);
    }
    
    // VÃ©rifier que le patient existe
    if (!appointment.patientId) {
      throw new BadRequestException('Le rendez-vous n\'a pas de patient associÃ©');
    }
    
    // VÃ©rifier que le patient existe dans la table users
    const patientExists = await this.userRepository.findOne({
      where: { id: appointment.patientId }
    });
    
    if (!patientExists) {
      console.warn(`[Service] âš ï¸ Patient ${appointment.patientId} not found in users, but continuing with appointment acceptance`);
      // On continue quand mÃªme pour accepter le rendez-vous, mÃªme si le patient n'existe pas
    }
    
    // 2. Mettre Ã  jour le statut du rendez-vous
    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      await this.appointmentRepository.update(
        { id: appointmentId },
        { status: AppointmentStatus.CONFIRMED }
      );

      // Notifier le patient
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
      } catch (e) {
        console.warn('[Notifications] Impossible de notifier le patient (accept):', e.message);
      }
      console.log(`[Service] âœ… Appointment status updated to CONFIRMED`);
    } else {
      console.log(`[Service] â„¹ï¸ Appointment already confirmed`);
    }
    
    // 3. Ajouter le patient Ã  la liste du mÃ©decin (seulement s'il existe)
    let addedPatient = null;
    if (patientExists) {
      addedPatient = await this.addPatientToDoctorList(doctorId, appointment.patientId);
      console.log(`[Service] ðŸ‘¤ Add patient result:`, addedPatient);
    } else {
      console.log(`[Service] âš ï¸ Skipping adding patient to doctor list because patient doesn't exist`);
    }
    
    return {
      success: true,
      message: patientExists 
        ? 'Rendez-vous acceptÃ© et patient ajoutÃ© Ã  votre liste'
        : 'Rendez-vous acceptÃ© (patient non trouvÃ© dans la base)',
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
  
  // RÃ©cupÃ©rer tous les patients du mÃ©decin
  
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
  async getMyPatients(doctorId: string) {
    // RÃ©cupÃ©rer les relations
    const relations = await this.doctorPatientRepository.find({
      where: { doctorId, status: 'ACTIVE' },
    });
    
    const patientIds = relations.map(rel => rel.patientId);
    
    if (patientIds.length === 0) {
      return [];
    }
    
    // RÃ©cupÃ©rer les informations complÃ¨tes des patients
    const patients = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids: patientIds })
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
      .getMany();
    
    return patients;
  }

  // Vérifier si un patient est dans la liste du médecin
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

  // DÃ©dupliquer par userId patient
  const seen = new Map<string, any>();
  for (const appt of appointments) {
    if (appt.patient && !seen.has(appt.patientId)) {
      // RÃ©soudre le vrai patient.id depuis la table patients
      const patientRecord = await this.patientRepository.findOne({
        where: { userId: appt.patientId }
      });
      seen.set(appt.patientId, {
        id:        appt.patient.id,
        // patientId = UUID de la table patients (requis pour crÃ©er une prescription)
        patientId: patientRecord?.id ?? appt.patientId,
        email:     appt.patient.email,
        firstName: appt.patient.firstName,
        lastName:  appt.patient.lastName,
        phone:     appt.patient.phone,
        rdvCount:  appointments.filter(a => a.patientId === appt.patientId).length,
      });
    }
  }

  return Array.from(seen.values());
}
  // Supprimer un patient de la liste
  async removePatientFromDoctorList(doctorId: string, patientId: string) {
    const relation = await this.doctorPatientRepository.findOne({
      where: { doctorId, patientId }
    });
    
    if (!relation) {
      throw new NotFoundException('Patient non trouvÃ© dans la liste');
    }
    
    await this.doctorPatientRepository.remove(relation);
    return { success: true, message: 'Patient retirÃ© de la liste' };
  }
  
  async getMedecinAvailabilityById(id: string) {
    // Cherche par userId (UUID)
    const profile = await this.medecinProfileRepository.findOne({
      where: { userId: id },
    });

    // Si pas de profil, retourner des valeurs par défaut sans erreur
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

    // Horaires par dÃ©faut si le mÃ©decin n'a pas configurÃ© ses disponibilitÃ©s
    const defaultWorkDays = [
      { day: 'monday',    startTime: '08:00', endTime: '17:00' },
      { day: 'tuesday',   startTime: '08:00', endTime: '17:00' },
      { day: 'wednesday', startTime: '08:00', endTime: '17:00' },
      { day: 'thursday',  startTime: '08:00', endTime: '17:00' },
      { day: 'friday',    startTime: '08:00', endTime: '17:00' },
    ];

    // Mapping des noms franÃ§ais/anciens vers le format standard
    const dayNameMap: Record<string, string> = {
      'Lundi': 'monday', 'Mardi': 'tuesday', 'Mercredi': 'wednesday',
      'Jeudi': 'thursday', 'Vendredi': 'friday', 'Samedi': 'saturday', 'Dimanche': 'sunday',
      'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday',
      'thursday': 'thursday', 'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday',
    };

    let workDays = saved?.workDays ?? null;

    // Convertir l'ancien format (name/active/morningStart...) vers le nouveau (day/startTime/endTime)
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
        // AprÃ¨s-midi
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
        .andWhere('appointment.appointmentDate >= :startDate', { startDate })
        .andWhere('appointment.appointmentDate <= :endDate', { endDate })
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



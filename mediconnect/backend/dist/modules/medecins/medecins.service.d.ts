import { Repository } from 'typeorm';
import { MedecinProfile } from './entities/medecin-profile.entity';
import { DoctorPatient } from './entities/doctor-patient.entity';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { UpdateAvailabilityDto } from './update-availability.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { SmsService } from '../notifications/sms.service';
import { RevenusService } from './revenus.service';
export declare class MedecinsService {
    private medecinProfileRepository;
    private doctorPatientRepository;
    private userRepository;
    private appointmentRepository;
    private patientRepository;
    private readonly notificationsService;
    private readonly smsService;
    private readonly revenusService;
    constructor(medecinProfileRepository: Repository<MedecinProfile>, doctorPatientRepository: Repository<DoctorPatient>, userRepository: Repository<User>, appointmentRepository: Repository<Appointment>, patientRepository: Repository<Patient>, notificationsService: NotificationsService, smsService: SmsService, revenusService: RevenusService);
    getProfile(userId: string): Promise<MedecinProfile>;
    updateProfile(userId: string, updateData: any): Promise<MedecinProfile>;
    getMedecinById(id: string): Promise<{
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        role: import("../users/entities/user.entity").UserRole;
        avatarUrl: string;
        profile: MedecinProfile;
    }>;
    getAllMedecinsWithProfiles(search?: string, specialite?: string, ville?: string): Promise<{
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        role: import("../users/entities/user.entity").UserRole;
        avatarUrl: string;
        profile: MedecinProfile;
    }[]>;
    updateAvailability(userId: string, dto: UpdateAvailabilityDto): Promise<MedecinProfile>;
    getAvailability(userId: string): Promise<{
        workDays: any;
        defaultDuration: any;
        acceptsTeleconsultation: any;
        conges: any;
        disponTeleconsult: boolean;
        connexionVideoIntegree: boolean;
    }>;
    addPatientToDoctorList(doctorId: string, patientId: string): Promise<{
        success: boolean;
        patient: User;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        patient: User;
    } | {
        success: boolean;
        message: any;
        patient: any;
    }>;
    acceptAppointment(doctorId: string, appointmentId: string): Promise<{
        success: boolean;
        message: string;
        appointment: {
            status: AppointmentStatus;
            id: string;
            patientId: string;
            patient: User;
            doctorId: string;
            doctor: User;
            appointmentDate: Date;
            durationMinutes: number;
            consultationType: import("../appointments/entities/appointment.entity").ConsultationType;
            reason: string;
            notes: string;
            cancellationReason: string;
            videoRoomId: string;
            reminderSent: boolean;
            rating: number;
            ratingComment: string;
            rated: boolean;
            beneficiaryId: string;
            beneficiaryNom: string;
            beneficiaryPrenom: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
        };
        patient: User;
    }>;
    private resolvePatientUserId;
    private resolvePatientPhone;
    getMyPatients(doctorId: string): Promise<User[]>;
    isPatientInDoctorList(doctorId: string, patientId: string): Promise<boolean>;
    getMyPatientsFromAppointments(doctorId: string): Promise<any[]>;
    removePatientFromDoctorList(doctorId: string, patientId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMedecinAvailabilityById(id: string): Promise<{
        workDays: any;
        defaultDuration: any;
        acceptsTeleconsultation: any;
        conges: any;
        disponTeleconsult: boolean;
    }>;
    getOccupiedSlots(id: string, startDate: string, endDate: string): Promise<{
        appointmentDate: Date;
        durationMinutes: number;
    }[]>;
    getRevenus(doctorId: string, from?: string, to?: string): Promise<{
        factures: {
            numero: string;
            date: Date;
            patientNom: string;
            type: import("../appointments/entities/appointment.entity").ConsultationType;
            statut: AppointmentStatus;
            montant: number;
            devise: string;
        }[];
        stats: {
            totalRevenu: number;
            nbConsult: number;
            nbTeleconsult: number;
            nbPhysique: number;
            tarif: number;
        };
        parMois: Record<string, number>;
    }>;
    private saveBase64Image;
}

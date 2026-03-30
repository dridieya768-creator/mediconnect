import { MedecinsService } from './medecins.service';
import { User } from '@modules/users/entities/user.entity';
import { UpdateAvailabilityDto } from './update-availability.dto';
import { SearchMedecinsDto } from './dto/search-medecins.dto';
import { GetSlotsQueryDto } from './dto/get-slots-query.dto';
export declare class UpdateMedecinProfileDto {
    titre?: string;
    specialite?: string;
    numeroOrdrePro?: string;
    diplomes?: string;
    photoPro?: string;
    photosCabinet?: string;
    languesParlees?: string;
    biographie?: string;
    adresseCabinet?: string;
    geoGoogleMaps?: string;
    ville?: string;
    telephonePro?: string;
    emailPro?: string;
    tarifs?: string;
    actesCouverts?: string;
    assurancesAcceptees?: string;
    agendaConnecte?: boolean;
    disponTeleconsult?: boolean;
    connexionVideoIntegree?: boolean;
    profilSEO?: boolean;
    statsAnalytics?: boolean;
}
export declare class MedecinsController {
    private readonly medecinsService;
    constructor(medecinsService: MedecinsService);
    updateAvailability(user: User, dto: UpdateAvailabilityDto): Promise<import("./entities/medecin-profile.entity").MedecinProfile>;
    getAvailability(user: User): Promise<{
        workDays: any;
        defaultDuration: any;
        acceptsTeleconsultation: any;
        disponTeleconsult: boolean;
        connexionVideoIntegree: boolean;
    }>;
    acceptAppointment(user: User, appointmentId: string): Promise<{
        success: boolean;
        message: string;
        appointment: {
            status: import("../appointments/entities/appointment.entity").AppointmentStatus;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
        };
        patient: User;
    }>;
    getMe(user: User): Promise<{
        id: string;
        data: {
            id: string;
            profile: import("./entities/medecin-profile.entity").MedecinProfile;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            phone: string;
            role: import("@modules/users/entities/user.entity").UserRole;
            status: import("@modules/users/entities/user.entity").UserStatus;
            tenantId: string;
            countryCode: string;
            isEmailVerified: boolean;
            mfaEnabled: boolean;
            mfaSecret: string;
            refreshToken: string;
            lastLoginAt: Date;
            avatarUrl: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
        };
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import("@modules/users/entities/user.entity").UserRole;
        status: import("@modules/users/entities/user.entity").UserStatus;
        tenantId: string;
        countryCode: string;
        isEmailVerified: boolean;
        mfaEnabled: boolean;
        mfaSecret: string;
        refreshToken: string;
        lastLoginAt: Date;
        avatarUrl: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    removePatient(user: User, patientId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    checkPatient(user: User, patientId: string): Promise<boolean>;
    getProfile(user: User): Promise<import("./entities/medecin-profile.entity").MedecinProfile>;
    updateProfile(user: User, updateDto: UpdateMedecinProfileDto): Promise<import("./entities/medecin-profile.entity").MedecinProfile>;
    getAllMedecins(query: SearchMedecinsDto): Promise<{
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        role: import("@modules/users/entities/user.entity").UserRole;
        avatarUrl: string;
        profile: import("./entities/medecin-profile.entity").MedecinProfile;
    }[]>;
    getMyPatients(user: User): Promise<any[]>;
    getMedecinAvailabilityById(id: string): Promise<{
        workDays: any;
        defaultDuration: any;
        acceptsTeleconsultation: any;
        disponTeleconsult: boolean;
    }>;
    getOccupiedSlots(id: string, query: GetSlotsQueryDto): Promise<{
        appointmentDate: Date;
        durationMinutes: number;
    }[]>;
    getMedecinById(id: string): Promise<{
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        role: import("@modules/users/entities/user.entity").UserRole;
        avatarUrl: string;
        profile: import("./entities/medecin-profile.entity").MedecinProfile;
    }>;
}

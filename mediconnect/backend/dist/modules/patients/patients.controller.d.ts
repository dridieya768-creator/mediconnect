import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Patient } from "./entities/patient.entity";
export declare class PatientsController {
    private readonly userRepo;
    private readonly patientRepo;
    constructor(userRepo: Repository<User>, patientRepo: Repository<Patient>);
    searchPatients(search: string): Promise<{
        success: boolean;
        data: Patient[];
    }>;
    getMe(req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        id?: undefined;
    } | {
        success: boolean;
        id: string;
        data: {
            id: string;
            userId: string;
            firstName: string;
            lastName: string;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
            avatarUrl: string;
            mfaEnabled: any;
            telephone: string;
            dateNaissance: Date;
            sexe: string;
            ville: string;
            languePreferee: string;
            groupeSanguin: import("./entities/patient.entity").BloodGroup;
            nss: string;
            qrCode: string;
            allergies: string[];
            maladiesChroniques: string[];
            medicamentsActuels: any[];
            observationsMedecin: string;
            documents: any[];
        };
        message?: undefined;
    }>;
    updateAvatar(body: {
        avatarUrl: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
    getPatientByUserId(userId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        id?: undefined;
        userId?: undefined;
        firstName?: undefined;
        lastName?: undefined;
        email?: undefined;
        avatarUrl?: undefined;
        telephone?: undefined;
        dateNaissance?: undefined;
        sexe?: undefined;
        ville?: undefined;
        groupeSanguin?: undefined;
        nss?: undefined;
        observationsMedecin?: undefined;
        allergies?: undefined;
        maladiesChroniques?: undefined;
        medicamentsActuels?: undefined;
        documents?: undefined;
    } | {
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl: string;
        telephone: string;
        dateNaissance: Date;
        sexe: string;
        ville: string;
        groupeSanguin: import("./entities/patient.entity").BloodGroup;
        nss: string;
        observationsMedecin: string;
        allergies: string[];
        maladiesChroniques: string[];
        medicamentsActuels: string[];
        documents: any[];
        success?: undefined;
        data?: undefined;
        message?: undefined;
    }>;
    updateObservations(id: string, body: {
        observationsMedecin: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getObservationsHistory(id: string, req: any): Promise<{
        texte: string;
        medecinNom: string;
        date: any;
    }[]>;
    updateProfile(id: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: Patient;
        message?: undefined;
    }>;
}

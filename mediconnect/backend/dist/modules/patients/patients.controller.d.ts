import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Patient } from "./entities/patient.entity";
export declare class PatientsController {
    private readonly userRepo;
    private readonly patientRepo;
    constructor(userRepo: Repository<User>, patientRepo: Repository<Patient>);
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

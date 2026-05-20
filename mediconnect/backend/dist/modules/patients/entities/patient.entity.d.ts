import { User } from "../../users/entities/user.entity";
export declare enum BloodGroup {
    A_POS = "A+",
    A_NEG = "A-",
    B_POS = "B+",
    B_NEG = "B-",
    AB_POS = "AB+",
    AB_NEG = "AB-",
    O_POS = "O+",
    O_NEG = "O-"
}
export declare class Patient {
    id: string;
    user: User;
    userId: string;
    qrCode: string;
    dateNaissance: Date;
    age: number;
    sexe: string;
    ville: string;
    languePreferee: string;
    groupeSanguin: BloodGroup;
    allergies: string[];
    maladiesChroniques: string[];
    medicamentsActuels: any[];
    rappelsAuto: boolean;
    historiqueTeleconsultations: any[];
    nss: string;
    observationsMedecin: string;
    documents: any[];
    createdAt: Date;
    updatedAt: Date;
}

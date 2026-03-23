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
    nom: string;
    prenom: string;
    dateNaissance: Date;
    age: number;
    sexe: string;
    telephone: string;
    email: string;
    ville: string;
    localisationGPS: string;
    languePreferee: string;
    groupeSanguin: BloodGroup;
    medecinTraitantId: string;
    allergies: string[];
    maladiesChroniques: string[];
    medicamentsActuels: any[];
    favoris: any;
    rappelsAuto: boolean;
    accesBaseMedicaments: boolean;
    questionsTeleconseil: string;
    historiqueTeleconsultations: any[];
    questionsForum: string;
    accesAnonyme: boolean;
    gestionMultiProfils: boolean;
    paiementEnLigne: boolean;
    applicationMobile: boolean;
    doubleAuthentification: boolean;
    notification: any;
    nss: string;
    createdAt: Date;
    updatedAt: Date;
}

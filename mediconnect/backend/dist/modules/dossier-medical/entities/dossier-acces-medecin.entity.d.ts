import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';
export declare enum NiveauAcces {
    LECTURE = "LECTURE",
    LECTURE_ECRITURE = "LECTURE_ECRITURE",
    ACCES_COMPLET = "ACCES_COMPLET"
}
export declare class DossierAccesMedecin {
    id: string;
    patientId: string;
    patient: Patient;
    medecinId: string;
    medecin: User;
    niveauAcces: NiveauAcces;
    accordeParId: string;
    dateExpiration: Date | null;
    actif: boolean;
    permissions: {
        allergies?: boolean;
        documents?: boolean;
        observations?: boolean;
    } | null;
    createdAt: Date;
    updatedAt: Date;
}

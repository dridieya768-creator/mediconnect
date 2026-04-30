import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';
export declare class DossierHistorique {
    id: string;
    patientId: string;
    patient: Patient;
    modifieParId: string;
    modifiePar: User;
    roleAuteur: string;
    champsModifies: Record<string, {
        avant: any;
        apres: any;
    }>;
    snapshotAvant: Record<string, any>;
    commentaire: string;
    createdAt: Date;
}

import { Patient } from '../../patients/entities/patient.entity';
export declare enum Relation {
    ENFANT = "ENFANT",
    CONJOINT = "CONJOINT",
    PARENT = "PARENT",
    AUTRE = "AUTRE"
}
export declare class FamilyMember {
    id: string;
    patientId: string;
    patient: Patient;
    prenom: string;
    nom: string;
    dateNaissance: Date;
    relation: Relation;
    sexe: string;
    nss: string;
    allergies: string[];
    groupeSanguin: string;
    docMembrePath: string | null;
    docPatientPath: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

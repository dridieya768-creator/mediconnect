export type Relation = 'ENFANT' | 'CONJOINT' | 'PARENT' | 'AUTRE';

/** Relations qui nécessitent des documents justificatifs (مضمون ولادة) */
export const RELATIONS_AVEC_DOCUMENTS: Relation[] = ['ENFANT', 'CONJOINT', 'PARENT'];

export interface FamilyMember {
  id: string;
  patientId: string;
  prenom: string;
  nom: string;
  dateNaissance: string;
  relation: Relation;
  sexe: 'M' | 'F';
  nss?: string;
  allergies?: string[];
  groupeSanguin?: string;
  docMembrePath?: string | null;
  docPatientPath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyMemberPayload {
  prenom: string;
  nom: string;
  dateNaissance: string;
  relation: Relation;
  sexe: 'M' | 'F';
  nss?: string;
  allergies?: string[];
  groupeSanguin?: string;
}

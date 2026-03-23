export enum UserRole {
PATIENT = 'PATIENT',
  PATIENT_TUTEUR = 'PATIENT_TUTEUR',
  PATIENT_PROTEGE = 'PATIENT_PROTEGE',
  MEDECIN_GENERALISTE = 'MEDECIN_GENERALISTE',
  MEDECIN_SPECIALISTE = 'MEDECIN_SPECIALISTE',
  MEDECIN_CHEF_SERVICE = 'MEDECIN_CHEF_SERVICE',
  SECRETAIRE_MEDICAL = 'SECRETAIRE_MEDICAL',
  PHARMACIEN = 'PHARMACIEN',  
  BIOLOGISTE = 'BIOLOGISTE',
  TECHNICIEN_LABO = 'TECHNICIEN_LABO',
  PRELEVEUR = 'PRELEVEUR',
  SECRETAIRE_LABO = 'SECRETAIRE_LABO',
  RADIOLOGUE = 'RADIOLOGUE',
  MANIPULATEUR_RADIO = 'MANIPULATEUR_RADIO',
  SECRETAIRE_RADIO = 'SECRETAIRE_RADIO',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: string;
  tenantId?: string;
  avatarUrl?: string;
  createdAt: Date;
  get fullName(): string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

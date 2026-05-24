export enum UserRole {
  PATIENT = 'PATIENT',
  MEDECIN_GENERALISTE = 'MEDECIN_GENERALISTE',
  MEDECIN_SPECIALISTE = 'MEDECIN_SPECIALISTE',
  PHARMACIEN = 'PHARMACIEN',  

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

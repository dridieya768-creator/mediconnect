export enum UserRole {
  PATIENT    = 'PATIENT',
  MEDECIN    = 'MEDECIN',
  PHARMACIEN = 'PHARMACIEN',
  ADMIN      = 'ADMIN',
}

export const ROLE_PORTAL_MAP: Record<string, string> = {
  [UserRole.PATIENT]:    '/patient/dashboard',
  [UserRole.MEDECIN]:    '/medecin/dashboard',
  [UserRole.PHARMACIEN]: '/pharmacie/dashboard',
  [UserRole.ADMIN]:      '/admin/dashboard',
};

export enum UserRole {
  // ─── Patients ──────────────────────────────────────────────
  PATIENT = 'PATIENT',
  PATIENT_TUTEUR = 'PATIENT_TUTEUR',
  PATIENT_PROTEGE = 'PATIENT_PROTEGE',

  // ─── Médecins ──────────────────────────────────────────────
  MEDECIN_GENERALISTE = 'MEDECIN_GENERALISTE',
  MEDECIN_SPECIALISTE = 'MEDECIN_SPECIALISTE',
  MEDECIN_CHEF_SERVICE = 'MEDECIN_CHEF_SERVICE',
  MEDECIN_URGENTISTE = 'MEDECIN_URGENTISTE',

  // ─── Assistants ────────────────────────────────────────────
  ASSISTANT_MEDICAL = 'ASSISTANT_MEDICAL',
  SECRETAIRE_MEDICAL = 'SECRETAIRE_MEDICAL',

  // ─── Pharmacie ─────────────────────────────────────────────
  PHARMACIEN_TITULAIRE = 'PHARMACIEN_TITULAIRE',
  PHARMACIEN_ADJOINT = 'PHARMACIEN_ADJOINT',
  PREPARATEUR_PHARMACIE = 'PREPARATEUR_PHARMACIE',

  // ─── Laboratoire ───────────────────────────────────────────
  BIOLOGISTE = 'BIOLOGISTE',
  TECHNICIEN_LABO = 'TECHNICIEN_LABO',
  PRELEVEUR = 'PRELEVEUR',
  SECRETAIRE_LABO = 'SECRETAIRE_LABO',

  // ─── Radiologie ────────────────────────────────────────────
  RADIOLOGUE = 'RADIOLOGUE',
  MANIPULATEUR_RADIO = 'MANIPULATEUR_RADIO',
  SECRETAIRE_RADIO = 'SECRETAIRE_RADIO',

  // ─── Admin ─────────────────────────────────────────────────
  ADMIN_SYSTEM = 'ADMIN_SYSTEM',
  SUPPORT = 'SUPPORT',
}

// ─── Role groups for guards ────────────────────────────────────
export const MEDECIN_ROLES = [
  UserRole.MEDECIN_GENERALISTE,
  UserRole.MEDECIN_SPECIALISTE,
  UserRole.MEDECIN_CHEF_SERVICE,
  UserRole.MEDECIN_URGENTISTE,
];

export const PATIENT_ROLES = [
  UserRole.PATIENT,
  UserRole.PATIENT_TUTEUR,
  UserRole.PATIENT_PROTEGE,
];

export const PHARMACIE_ROLES = [
  UserRole.PHARMACIEN_TITULAIRE,
  UserRole.PHARMACIEN_ADJOINT,
  UserRole.PREPARATEUR_PHARMACIE,
];

export const LABORATOIRE_ROLES = [
  UserRole.BIOLOGISTE,
  UserRole.TECHNICIEN_LABO,
  UserRole.PRELEVEUR,
  UserRole.SECRETAIRE_LABO,
];

export const RADIOLOGIE_ROLES = [
  UserRole.RADIOLOGUE,
  UserRole.MANIPULATEUR_RADIO,
  UserRole.SECRETAIRE_RADIO,
];

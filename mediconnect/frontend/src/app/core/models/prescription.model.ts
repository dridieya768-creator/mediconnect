export enum PrescriptionStatus {
  ACTIVE = 'ACTIVE',
  PARTIALLY_USED = 'PARTIALLY_USED',
  FULLY_USED = 'FULLY_USED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export interface Medication {
  cip: string;
  name: string;
  dosage: string;
  posology: string;
  durationDays: number;
  quantity: number;
  isSubstitutable: boolean;
  quantityDelivered?: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  qrCode: string;
  status: PrescriptionStatus;
  medications: Medication[];
  appointmentId?: string;
  pdfUrl?: string;
  issuedAt: Date;
  expiresAt: Date;
  signedAt?: Date;
  createdAt: Date;
}

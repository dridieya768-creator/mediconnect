export interface Patient {
  id: string;
  userId: string;
  qrCode: string;
  nss?: string;
  dateOfBirth?: Date;
  gender?: string;
  bloodGroup?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: any[];
  emergencyContact?: { name: string; phone: string; relationship: string };
  insuranceInfo?: { provider: string; number: string; reimbursementRate: number };
  address?: { street: string; city: string; postalCode: string; country: string };
  isMinor: boolean;
  createdAt: Date;
}

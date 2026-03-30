import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';
export declare enum PrescriptionStatus {
    ACTIVE = "ACTIVE",
    PARTIALLY_USED = "PARTIALLY_USED",
    FULLY_USED = "FULLY_USED",
    EXPIRED = "EXPIRED",
    REVOKED = "REVOKED"
}
export declare class Prescription {
    id: string;
    patient: Patient;
    patientId: string;
    doctor: User;
    doctorId: string;
    qrCode: string;
    qrJwt: string;
    status: PrescriptionStatus;
    medications: {
        cip: string;
        name: string;
        dosage: string;
        posology: string;
        durationDays: number;
        quantity: number;
        isSubstitutable: boolean;
        quantityDelivered?: number;
    }[];
    appointmentId: string;
    pdfUrl: string;
    emailSentAt: Date;
    notes: string;
    issuedAt: Date;
    expiresAt: Date;
    signedAt: Date;
    electronicSignature: string;
    createdAt: Date;
    updatedAt: Date;
}

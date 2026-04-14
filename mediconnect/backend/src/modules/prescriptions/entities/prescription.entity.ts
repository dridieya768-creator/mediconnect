import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';

export enum PrescriptionStatus {
  ACTIVE = 'ACTIVE',
  PARTIALLY_USED = 'PARTIALLY_USED',
  FULLY_USED = 'FULLY_USED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ name: 'doctor_id' })
  doctorId: string;

  @Column({ name: 'qr_code', unique: true })
  qrCode: string; // QR-ORD-UUID-XXXX

  @Column({ name: 'qr_jwt', type: 'text', nullable: true })
  qrJwt: string; // JWT signé

  @Column({ type: 'enum', enum: PrescriptionStatus, default: PrescriptionStatus.ACTIVE })
  status: PrescriptionStatus;

  @Column({ name: 'medications', type: 'jsonb' })
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

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: string;

  @Column({ name: 'pdf_url', nullable: true })
  pdfUrl: string;

  @Column({ name: 'email_sent_at', nullable: true })
  emailSentAt: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'issued_at', type: 'timestamp' })
  issuedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'signed_at', nullable: true })
  signedAt: Date;

  @Column({ name: 'electronic_signature', nullable: true, type: 'text' })
  electronicSignature: string;

  @Column({ name: 'signature_image', nullable: true, type: 'text' })
  signatureImage: string; // base64 PNG de la signature manuscrite

  @Column({ name: 'imaging_requests', type: 'jsonb', nullable: true })
  imagingRequests: {
    type: string;
    region: string;
    clinicalReason: string;
    urgency: string;
  }[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

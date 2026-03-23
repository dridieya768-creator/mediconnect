import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum QrCodeType {
  PATIENT = 'PATIENT',
  MEDECIN = 'MEDECIN',
  ORDONNANCE = 'ORDONNANCE',
  ANALYSE = 'ANALYSE',
  IMAGERIE = 'IMAGERIE',
  TUBE = 'TUBE',
  DICOM = 'DICOM',
}

export enum QrCodeStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

@Entity('qr_codes')
export class QrCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'qr_code', unique: true })
  qrCode: string;

  @Column({ type: 'enum', enum: QrCodeType, name: 'qr_type' })
  qrType: QrCodeType;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column({ name: 'jwt_token', type: 'text' })
  jwtToken: string;

  @Column({ type: 'enum', enum: QrCodeStatus, default: QrCodeStatus.ACTIVE })
  status: QrCodeStatus;

  @Column({ name: 'scan_count', default: 0 })
  scanCount: number;

  @Column({ name: 'last_scan_at', nullable: true })
  lastScanAt: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

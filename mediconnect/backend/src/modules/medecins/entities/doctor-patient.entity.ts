import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('doctor_patients')
export class DoctorPatient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'doctor_id', type: 'uuid' })
  doctorId: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Column({ default: 'ACTIVE' })
  status: string;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  notes: any;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
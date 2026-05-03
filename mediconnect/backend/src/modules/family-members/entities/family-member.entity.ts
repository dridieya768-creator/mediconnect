import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

export enum Relation {
  ENFANT   = 'ENFANT',
  CONJOINT = 'CONJOINT',
  PARENT   = 'PARENT',
  AUTRE    = 'AUTRE',
}

@Entity('family_members')
@Index(['patientId'], { where: '"deleted_at" IS NULL' })
export class FamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ length: 100 })
  prenom: string;

  @Column({ length: 100 })
  nom: string;

  @Column({ name: 'date_naissance', type: 'date' })
  dateNaissance: Date;

  @Column({ type: 'enum', enum: Relation })
  relation: Relation;

  @Column({ length: 1 })
  sexe: string; // 'M' | 'F'

  @Column({ nullable: true, length: 50 })
  nss: string;

  @Column({ type: 'jsonb', default: '[]' })
  allergies: string[];

  @Column({ name: 'groupe_sanguin', nullable: true, length: 5 })
  groupeSanguin: string;

  /** مضمون ولادة du membre lui-même (ENFANT / CONJOINT / PARENT) */
  @Column({ name: 'doc_membre_path', nullable: true, length: 500 })
  docMembrePath: string | null;

  /** مضمون ولادة du patient (preuve du lien familial) */
  @Column({ name: 'doc_patient_path', nullable: true, length: 500 })
  docPatientPath: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

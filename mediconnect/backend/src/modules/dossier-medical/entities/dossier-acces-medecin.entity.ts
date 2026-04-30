import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
  Unique, Index,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';

export enum NiveauAcces {
  LECTURE          = 'LECTURE',
  LECTURE_ECRITURE = 'LECTURE_ECRITURE',
  ACCES_COMPLET    = 'ACCES_COMPLET',
}

@Entity('dossier_acces_medecin')
@Unique(['patientId', 'medecinId'])
@Index(['patientId'])
@Index(['medecinId'])
export class DossierAccesMedecin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'medecin_id', type: 'uuid' })
  medecinId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'medecin_id' })
  medecin: User;

  @Column({ name: 'niveau_acces', type: 'enum', enum: NiveauAcces, default: NiveauAcces.LECTURE })
  niveauAcces: NiveauAcces;

  @Column({ name: 'accorde_par_id', type: 'uuid' })
  accordeParId: string;

  @Column({ name: 'date_expiration', type: 'timestamptz', nullable: true })
  dateExpiration: Date | null;

  @Column({ default: true })
  actif: boolean;

  @Column({ type: 'jsonb', nullable: true })
  permissions: {
    allergies?: boolean;
    documents?: boolean;
    observations?: boolean;
  } | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

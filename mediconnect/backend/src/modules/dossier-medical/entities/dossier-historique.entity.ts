import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, Index,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';

@Entity('dossier_historique')
@Index(['patientId', 'createdAt'])
export class DossierHistorique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'modifie_par_id', type: 'uuid' })
  modifieParId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'modifie_par_id' })
  modifiePar: User;

  @Column({ name: 'role_auteur', type: 'varchar', length: 50 })
  roleAuteur: string;

  @Column({ name: 'champs_modifies', type: 'jsonb' })
  champsModifies: Record<string, { avant: any; apres: any }>;

  @Column({ name: 'snapshot_avant', type: 'jsonb' })
  snapshotAvant: Record<string, any>;

  @Column({ nullable: true, type: 'text' })
  commentaire: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

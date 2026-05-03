import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('pharmaciens')
export class PharmacienProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ─── Informations professionnelles ───────────────────────
  @Column({ name: 'numero_ordre', nullable: true })
  numeroOrdre: string; // Numéro d'ordre national des pharmaciens

  @Column({ name: 'nom_pharmacie', nullable: true })
  nomPharmacie: string;

  // ─── Localisation ─────────────────────────────────────────
  @Column({ name: 'adresse_pharmacie', type: 'text', nullable: true })
  adressePharmacie: string;

  @Column({ nullable: true })
  ville: string;

  @Column({ name: 'code_postal', nullable: true })
  codePostal: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  // ─── Contact ──────────────────────────────────────────────
  // (nom, prénom, téléphone, email personnels → dans users)

  // ─── Horaires & Disponibilité ─────────────────────────────
  @Column({ name: 'horaires_ouverture', type: 'jsonb', nullable: true })
  horairesOuverture: Record<string, string>; // { lun: "8h-20h", mar: "8h-20h", ... }

  @Column({ name: 'is_garde', default: false })
  isGarde: boolean; // Pharmacie de garde

  @Column({ name: 'is_ouverte_24h', default: false })
  isOuverte24h: boolean;

  // ─── Médias ───────────────────────────────────────────────
  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl: string;

  // ─── Timestamps ───────────────────────────────────────────
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('medecins')
export class MedecinProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string; // Changé de number à string pour UUID

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  specialite: string;

  @Column({ nullable: true })
  rpps: string;


  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl: string;

  @Column({ name: 'photo_pro', type: 'text', nullable: true })
  photoPro: string;

  @Column({ type: 'text', nullable: true })
  diplomes: string;

  @Column({ name: 'photos_cabinet', type: 'text', nullable: true })
  photosCabinet: string;

  @Column({ type: 'jsonb', nullable: true })
  tarifs: any;

  @Column({ name: 'actes_couverts', type: 'text', nullable: true })
  actesCouverts: string;

  @Column({ name: 'assurances_acceptees', type: 'text', nullable: true })
  assurancesAcceptees: string;

  @Column({ nullable: true })
  titre: string;

  @Column({ name: 'numero_ordre_pro', nullable: true })
  numeroOrdrePro: string;

  @Column({ name: 'langues_parlees', nullable: true })
  languesParlees: string;

  @Column({ nullable: true })
  ville: string;

  @Column({ name: 'adresse_cabinet', type: 'text', nullable: true })
  adresseCabinet: string;

  @Column({ name: 'geo_google_maps', type: 'text', nullable: true })
  geoGoogleMaps: string;

  @Column({ name: 'telephone_pro', nullable: true })
  telephonePro: string;

  @Column({ name: 'email_pro', nullable: true })
  emailPro: string;

  @Column({ name: 'agenda_connecte', type: 'boolean', default: true })
  agendaConnecte: boolean;

  @Column({ name: 'dispon_teleconsult', type: 'boolean', default: false })
  disponTeleconsult: boolean;

  @Column({ name: 'connexion_video_integree', type: 'boolean', default: false })
  connexionVideoIntegree: boolean;

  @Column({ name: 'profil_seo', type: 'boolean', default: false })
  profilSEO: boolean;

  @Column({ name: 'stats_analytics', type: 'boolean', default: false })
  statsAnalytics: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum BloodGroup {
  A_POS = "A+", A_NEG = "A-",
  B_POS = "B+", B_NEG = "B-",
  AB_POS = "AB+", AB_NEG = "AB-",
  O_POS = "O+", O_NEG = "O-",
}

@Entity("patients")
export class Patient {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Lien vers le compte utilisateur
  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: string;

  // QR Code unique patient
  @Column({ name: "qr_code", unique: true })
  qrCode: string;

  // ─── Informations personnelles spécifiques au patient ───────────────────────
  // nom, prenom, telephone, email → dans users (first_name, last_name, phone, email)

  @Column({ name: "date_naissance", type: "date", nullable: true })
  dateNaissance: Date;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  sexe: string; // M / F

  // telephone et email → dans users.phone et users.email

  @Column({ nullable: true })
  ville: string;


  @Column({ name: "langue_preferee", nullable: true, default: "fr" })
  languePreferee: string;

  // ─── Médical ─────────────────────────────────────────────
  @Column({
    name: "groupe_sanguin",
    type: "enum",
    enum: BloodGroup,
    nullable: true,
  })
  groupeSanguin: BloodGroup;

  @Column({ type: "jsonb", default: "[]" })
  allergies: string[];

  @Column({ name: "maladies_chroniques", type: "jsonb", default: "[]" })
  maladiesChroniques: string[];

  @Column({ name: "medicaments_actuels", type: "jsonb", default: "[]" })
  medicamentsActuels: any[];

  // ─── Paramètres & Préférences ─────────────────────────────
  @Column({ name: "rappels_auto", default: false })
  rappelsAuto: boolean;


  @Column({ name: "historique_teleconsultations", type: "jsonb", default: "[]" })
  historiqueTeleconsultations: any[];

  // ─── NSS (ancien champ conservé) ─────────────────────────
  @Column({ nullable: true, unique: true })
  nss: string;

  // ─── Observations médecin ─────────────────────────────────
  @Column({ name: 'observations_medecin', type: 'text', nullable: true })
  observationsMedecin: string;

  // ─── Documents médicaux ───────────────────────────────────
  @Column({ type: 'jsonb', nullable: true })
  documents: any[];

  // ─── Timestamps ───────────────────────────────────────────
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
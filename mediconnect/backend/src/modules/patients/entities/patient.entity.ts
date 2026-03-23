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

  // ─── Informations personnelles ───────────────────────────
  @Column({ nullable: true })
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ name: "date_naissance", type: "date", nullable: true })
  dateNaissance: Date;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  sexe: string; // M / F

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  ville: string;

  @Column({ name: "localisation_gps", nullable: true })
  localisationGPS: string;

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

  @Column({ name: "medecin_traitant_id", nullable: true })
  medecinTraitantId: string;

  @Column({ type: "jsonb", default: "[]" })
  allergies: string[];

  @Column({ name: "maladies_chroniques", type: "jsonb", default: "[]" })
  maladiesChroniques: string[];

  @Column({ name: "medicaments_actuels", type: "jsonb", default: "[]" })
  medicamentsActuels: any[];

  @Column({ type: "jsonb", nullable: true })
  favoris: any;

  // ─── Paramètres & Préférences ─────────────────────────────
  @Column({ name: "rappels_auto", default: false })
  rappelsAuto: boolean;

  @Column({ name: "acces_base_medicaments", default: true })
  accesBaseMedicaments: boolean;

  @Column({ name: "questions_teleconseil", type: "text", nullable: true })
  questionsTeleconseil: string;

  @Column({ name: "historique_teleconsultations", type: "jsonb", default: "[]" })
  historiqueTeleconsultations: any[];

  @Column({ name: "questions_forum", type: "text", nullable: true })
  questionsForum: string;

  @Column({ name: "acces_anonyme", default: false })
  accesAnonyme: boolean;

  @Column({ name: "gestion_multi_profils", default: false })
  gestionMultiProfils: boolean;

  @Column({ name: "paiement_en_ligne", default: false })
  paiementEnLigne: boolean;

  @Column({ name: "application_mobile", default: false })
  applicationMobile: boolean;

  @Column({ name: "double_authentification", default: false })
  doubleAuthentification: boolean;

  @Column({ type: "jsonb", default: "{}" })
  notification: any;

  // ─── NSS (ancien champ conservé) ─────────────────────────
  @Column({ nullable: true, unique: true })
  nss: string;

  // ─── Timestamps ───────────────────────────────────────────
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from "typeorm";

export enum UserRole {
  PATIENT = "PATIENT",
  MEDECIN_GENERALISTE = "MEDECIN_GENERALISTE",
  MEDECIN_SPECIALISTE = "MEDECIN_SPECIALISTE",
  MEDECIN_CHEF_SERVICE = "MEDECIN_CHEF_SERVICE",
  MEDECIN_URGENTISTE = "MEDECIN_URGENTISTE",
  PHARMACIEN_TITULAIRE = "PHARMACIEN_TITULAIRE",
  PHARMACIEN_ADJOINT = "PHARMACIEN_ADJOINT",
  PHARMACIEN_GERANT = "PHARMACIEN_GERANT",
  BIOLOGISTE_RESPONSABLE = "BIOLOGISTE_RESPONSABLE",
  BIOLOGISTE_MEDICAL = "BIOLOGISTE_MEDICAL",
  TECHNICIEN_LABO = "TECHNICIEN_LABO",
  PRELEVEUR = "PRELEVEUR",
  RADIOLOGUE = "RADIOLOGUE",
  MANIPULATEUR_RADIO = "MANIPULATEUR_RADIO",
  TECHNICIEN_IMAGERIE = "TECHNICIEN_IMAGERIE",
  ASSISTANT_MEDICAL = "ASSISTANT_MEDICAL",
  SECRETAIRE_MEDICAL = "SECRETAIRE_MEDICAL",
  ADMIN_SYSTEM = "ADMIN_SYSTEM",
  SUPPORT = "SUPPORT",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ name: "first_name" })
  firstName: string;

  @Column({ name: "last_name" })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: "enum", enum: UserRole })
  role: UserRole;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Column({ name: "tenant_id", nullable: true })
  tenantId: string;

  @Column({ name: "country_code", default: "TN", length: 2 })
  countryCode: string;

  @Column({ name: "is_email_verified", default: false })
  isEmailVerified: boolean;

  @Column({ name: "mfa_enabled", default: false })
  mfaEnabled: boolean;

  @Column({ name: "mfa_secret", nullable: true, select: false })
  mfaSecret: string;

  @Column({ name: "refresh_token", nullable: true, select: false })
  refreshToken: string;

  @Column({ name: "last_login_at", nullable: true })
  lastLoginAt: Date;

  @Column({ name: "avatar_url", nullable: true, type: "text" })
  avatarUrl: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;
}
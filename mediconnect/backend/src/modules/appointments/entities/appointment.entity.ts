import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn,
  DeleteDateColumn, JoinColumn, Index
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum AppointmentStatus {
  REQUESTED    = "REQUESTED",
  CONFIRMED    = "CONFIRMED",
  CANCELLED    = "CANCELLED",
  COMPLETED    = "COMPLETED",
  NO_SHOW      = "NO_SHOW",
}

export enum ConsultationType {
  PHYSICAL         = "PHYSICAL",
  TELECONSULTATION = "TELECONSULTATION",
  HOME_VISIT       = "HOME_VISIT",
}

@Entity("appointments")
@Index(["patientId", "appointmentDate"])
@Index(["doctorId",  "appointmentDate"])
export class Appointment {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  
    @Column({ name: "patient_id", type: "uuid", nullable: false })
  patientId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: "patient_id" })
  patient: User;

  @Column({ name: "doctor_id" })
  doctorId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: "doctor_id" })
  doctor: User;

  
  @Column({ type: "timestamptz", name: "appointment_date" })
  appointmentDate: Date;

  @Column({ type: "int", default: 30, name: "duration_minutes" })
  durationMinutes: number;

  
  @Column({
    type: "enum",
    enum: ConsultationType,
    default: ConsultationType.PHYSICAL,
    name: "consultation_type",
  })
  consultationType: ConsultationType;

  @Column({
    type: "enum",
    enum: AppointmentStatus,
    default: AppointmentStatus.REQUESTED,
  })
  status: AppointmentStatus;

  
  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true, name: "cancellation_reason" })
  cancellationReason: string;

  
  @Column({ nullable: true, name: "video_room_id" })
  videoRoomId: string;

  
  @Column({ type: "boolean", default: false, name: "reminder_sent" })
  reminderSent: boolean;

  
  @Column({ type: "int", nullable: true })
  rating: number;

  @Column({ nullable: true, name: "rating_comment" })
  ratingComment: string;

  @Column({ type: "boolean", default: false })
  rated: boolean;

  
  @Column({ name: "beneficiary_id", type: "uuid", nullable: true })
  beneficiaryId: string | null;

  @Column({ name: "beneficiary_nom", nullable: true, length: 100 })
  beneficiaryNom: string | null;

  @Column({ name: "beneficiary_prenom", nullable: true, length: 100 })
  beneficiaryPrenom: string | null;

  
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;
}
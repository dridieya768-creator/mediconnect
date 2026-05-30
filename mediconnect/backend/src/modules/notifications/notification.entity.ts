// src/notifications/entities/notification.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, JoinColumn
} from "typeorm";
import { User } from "../users/entities/user.entity";

export enum NotificationType {
  APPOINTMENT_CONFIRMED   = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED   = 'APPOINTMENT_CANCELLED',
  DOCTOR_PENDING_APPROVAL = 'DOCTOR_PENDING_APPROVAL',
  DOCTOR_APPROVED         = 'DOCTOR_APPROVED',
  DOCTOR_REJECTED         = 'DOCTOR_REJECTED',
  SMS_REMINDER            = 'SMS_REMINDER',
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ type: "boolean", default: false, name: "is_read" })
  isRead: boolean;

  @Column({ nullable: true, name: "related_id" })
  relatedId: string; 

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
import { User } from "../users/entities/user.entity";
export declare enum NotificationType {
    APPOINTMENT_CONFIRMED = "APPOINTMENT_CONFIRMED",
    APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED",
    DOCTOR_PENDING_APPROVAL = "DOCTOR_PENDING_APPROVAL",
    DOCTOR_APPROVED = "DOCTOR_APPROVED",
    DOCTOR_REJECTED = "DOCTOR_REJECTED"
}
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    relatedId: string;
    createdAt: Date;
}

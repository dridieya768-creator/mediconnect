import { User } from "../../users/entities/user.entity";
export declare enum AppointmentStatus {
    REQUESTED = "REQUESTED",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED",
    NO_SHOW = "NO_SHOW"
}
export declare enum ConsultationType {
    PHYSICAL = "PHYSICAL",
    TELECONSULTATION = "TELECONSULTATION",
    HOME_VISIT = "HOME_VISIT"
}
export declare class Appointment {
    id: string;
    patientId: string;
    patient: User;
    doctorId: string;
    doctor: User;
    appointmentDate: Date;
    durationMinutes: number;
    consultationType: ConsultationType;
    status: AppointmentStatus;
    reason: string;
    notes: string;
    cancellationReason: string;
    videoRoomId: string;
    reminderSent: boolean;
    rating: number;
    ratingComment: string;
    rated: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

import { ConsultationType } from "../entities/appointment.entity";
export declare class CreateAppointmentDto {
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    durationMinutes?: number;
    consultationType: ConsultationType;
    reason?: string;
}

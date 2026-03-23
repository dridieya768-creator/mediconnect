import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "././dto/create-appointment.dto";
import { CancelAppointmentDto } from "././dto/cancel-appointment.dto";
import { RateAppointmentDto } from "././dto/rate-appointment.dto";
export declare class AppointmentsController {
    private readonly svc;
    constructor(svc: AppointmentsService);
    create(dto: CreateAppointmentDto): Promise<import("./entities/appointment.entity").Appointment>;
    getByPatient(patientId: string): Promise<any[]>;
    getByDoctor(doctorId: string, date?: string): Promise<import("./entities/appointment.entity").Appointment[]>;
    confirm(id: string): Promise<import("./entities/appointment.entity").Appointment>;
    cancel(id: string, dto: CancelAppointmentDto): Promise<import("./entities/appointment.entity").Appointment>;
    complete(id: string, notes?: string): Promise<import("./entities/appointment.entity").Appointment>;
    rate(id: string, dto: RateAppointmentDto): Promise<import("./entities/appointment.entity").Appointment>;
    generateVideoRoom(id: string): Promise<{
        videoRoomId: string;
        jitsiUrl: string;
    }>;
}

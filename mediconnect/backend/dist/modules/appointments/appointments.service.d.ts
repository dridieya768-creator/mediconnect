import { Repository } from "typeorm";
import { Appointment } from "./entities/appointment.entity";
import { CreateAppointmentDto } from "././dto/create-appointment.dto";
import { RateAppointmentDto } from "././dto/rate-appointment.dto";
import { NotificationsService } from "../notifications/notifications.service";
export declare class AppointmentsService {
    private readonly repo;
    private readonly notificationsService;
    constructor(repo: Repository<Appointment>, notificationsService: NotificationsService);
    create(dto: CreateAppointmentDto): Promise<Appointment>;
    findByPatient(patientId: string): Promise<any[]>;
    findByDoctor(doctorId: string, date?: string): Promise<Appointment[]>;
    cancel(id: string, reason: string): Promise<Appointment>;
    confirm(id: string): Promise<Appointment>;
    complete(id: string, notes?: string): Promise<Appointment>;
    rate(id: string, dto: RateAppointmentDto): Promise<Appointment>;
    generateVideoRoom(id: string): Promise<{
        videoRoomId: string;
        jitsiUrl: string;
    }>;
    private findOne;
    private findOneSafe;
}

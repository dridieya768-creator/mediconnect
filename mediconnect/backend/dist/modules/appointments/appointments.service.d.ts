import { Repository } from "typeorm";
import { Appointment } from "./entities/appointment.entity";
import { CreateAppointmentDto } from "././dto/create-appointment.dto";
import { RateAppointmentDto } from "././dto/rate-appointment.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { SmsService } from "../notifications/sms.service";
export declare class AppointmentsService {
    private readonly repo;
    private readonly notificationsService;
    private readonly smsService;
    constructor(repo: Repository<Appointment>, notificationsService: NotificationsService, smsService: SmsService);
    create(dto: CreateAppointmentDto): Promise<Appointment>;
    findByPatient(patientId: string): Promise<any[]>;
    findDoctorsByPatient(patientUserId: string): Promise<any[]>;
    findByDoctor(doctorId: string, date?: string): Promise<Appointment[]>;
    private enrichWithBeneficiaryDocs;
    cancel(id: string, reason: string): Promise<Appointment>;
    confirm(id: string): Promise<Appointment>;
    complete(id: string, notes?: string): Promise<Appointment>;
    rate(id: string, dto: RateAppointmentDto): Promise<Appointment>;
    generateVideoRoom(id: string): Promise<{
        videoRoomId: string;
        jitsiUrl: string;
    }>;
    private resolvePatientUserId;
    private resolvePatientPhone;
    private findOne;
    private findOneSafe;
}

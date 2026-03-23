import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
export declare class AppointmentsReminderService {
    private appointmentsRepository;
    private readonly logger;
    constructor(appointmentsRepository: Repository<Appointment>);
    private getTransport;
    sendReminders(): Promise<void>;
    private sendReminderEmail;
}

import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
export interface PaymentSession {
    paymentId: string;
    checkoutUrl: string;
    amount: number;
    currency: string;
}
export declare class PaymentsService {
    private readonly config;
    private readonly appointmentRepo;
    private readonly flouciPublicKey;
    private readonly flouciPrivateKey;
    private readonly frontendUrl;
    constructor(config: ConfigService, appointmentRepo: Repository<Appointment>);
    createCheckoutSession(appointmentId: string, patientId: string): Promise<PaymentSession>;
    verifyPayment(paymentId: string, appointmentId: string): Promise<void>;
    getPaymentHistory(patientId: string): Promise<{
        appointmentId: string;
        date: Date;
        doctorName: string;
        status: AppointmentStatus;
        consultationType: import("../appointments/entities/appointment.entity").ConsultationType;
        amount: number;
        currency: string;
        paid: boolean;
    }[]>;
}

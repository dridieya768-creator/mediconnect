import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createCheckout(appointmentId: string, req: any): Promise<import("./payments.service").PaymentSession>;
    verifyPayment(paymentId: string, appointmentId: string): Promise<{
        verified: boolean;
    }>;
    getHistory(req: any): Promise<{
        appointmentId: string;
        date: Date;
        doctorName: string;
        status: import("../appointments/entities/appointment.entity").AppointmentStatus;
        consultationType: import("../appointments/entities/appointment.entity").ConsultationType;
        amount: number;
        currency: string;
        paid: boolean;
    }[]>;
}

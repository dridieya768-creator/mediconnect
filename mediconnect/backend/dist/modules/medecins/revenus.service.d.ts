import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
export declare class RevenusService {
    private readonly appointmentRepo;
    constructor(appointmentRepo: Repository<Appointment>);
    getRevenus(doctorId: string, from?: string, to?: string): Promise<{
        factures: {
            numero: string;
            date: Date;
            patientNom: string;
            type: import("../appointments/entities/appointment.entity").ConsultationType;
            statut: AppointmentStatus;
            montant: number;
            devise: string;
        }[];
        stats: {
            totalRevenu: number;
            nbConsult: number;
            nbTeleconsult: number;
            nbPhysique: number;
            tarif: number;
        };
        parMois: Record<string, number>;
    }>;
}

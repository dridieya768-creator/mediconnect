import { CreateMedicationDto } from './create-medication.dto';
export declare class CreatePrescriptionDto {
    patientId: string;
    doctorId: string;
    appointmentId?: string;
    medications: CreateMedicationDto[];
    notes?: string;
    patientName?: string;
    patientNss?: string;
    medecinRpps?: string;
    medecinName?: string;
}

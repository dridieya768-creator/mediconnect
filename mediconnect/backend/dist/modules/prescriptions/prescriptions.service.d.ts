import { Repository } from "typeorm";
import { Prescription } from "./entities/prescription.entity";
import { QrCodesService } from "../qr-codes/qr-codes.service";
export declare class PrescriptionsService {
    private repo;
    private qrCodesService;
    constructor(repo: Repository<Prescription>, qrCodesService: QrCodesService);
    create(dto: any): Promise<Prescription>;
    findOne(id: string): Promise<Prescription>;
    findByPatient(patientId: string): Promise<Prescription[]>;
    scanAtPharmacy(qrCode: string, dispensedQuantities: Record<string, number>): Promise<Prescription>;
    signPrescription(id: string, signature: string): Promise<Prescription>;
}

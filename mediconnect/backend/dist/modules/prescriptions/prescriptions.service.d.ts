import { Repository } from "typeorm";
import { Prescription } from "./entities/prescription.entity";
import { QrCodesService } from "../qr-codes/qr-codes.service";
import { InteractionCheckerService, DrugInteraction } from "./interaction-checker.service";
import { PdfService } from "./pdf.service";
export declare class PrescriptionsService {
    private repo;
    private qrCodesService;
    private interactionChecker;
    private pdfService;
    constructor(repo: Repository<Prescription>, qrCodesService: QrCodesService, interactionChecker: InteractionCheckerService, pdfService: PdfService);
    checkInteractions(medications: any[]): DrugInteraction[];
    create(dto: any): Promise<Prescription>;
    findOne(id: string): Promise<Prescription>;
    findByQrCode(qrCode: string): Promise<Prescription>;
    findByPatient(patientId: string): Promise<Prescription[]>;
    scanAtPharmacy(qrCode: string, dispensedQuantities: Record<string, number>): Promise<Prescription>;
    signPrescription(id: string, signature: string): Promise<Prescription>;
}

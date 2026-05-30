import { PrescriptionsService } from "./prescriptions.service";
import { PdfService } from './pdf.service';
export declare class PrescriptionsController {
    private readonly prescriptionsService;
    private readonly pdfService;
    constructor(prescriptionsService: PrescriptionsService, pdfService: PdfService);
    create(dto: any): Promise<import("./entities/prescription.entity").Prescription>;
    checkInteractions(body: {
        medications: any[];
    }): import("./interaction-checker.service").DrugInteraction[];
    findByPatient(patientId: string): Promise<Partial<import("./entities/prescription.entity").Prescription>[]>;
    findByQrCode(qrCode: string): Promise<import("./entities/prescription.entity").Prescription>;
    findOne(id: string): Promise<import("./entities/prescription.entity").Prescription>;
    scanAtPharmacy(body: {
        qrCode: string;
        dispensedQuantities: Record<string, number>;
    }): Promise<import("./entities/prescription.entity").Prescription>;
    sign(id: string, body: {
        signature: string;
    }): Promise<import("./entities/prescription.entity").Prescription>;
    envoyer(id: string, body: {
        patientEmail: string;
    }): Promise<import("./entities/prescription.entity").Prescription>;
    regeneratePdf(id: string): Promise<{
        message: string;
        url: string;
    }>;
}

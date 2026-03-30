import { PrescriptionsService } from "./prescriptions.service";
export declare class PrescriptionsController {
    private readonly prescriptionsService;
    constructor(prescriptionsService: PrescriptionsService);
    create(dto: any): Promise<import("./entities/prescription.entity").Prescription>;
    checkInteractions(body: {
        medications: any[];
    }): import("./interaction-checker.service").DrugInteraction[];
    findByPatient(patientId: string): Promise<import("./entities/prescription.entity").Prescription[]>;
    findByQrCode(qrCode: string): Promise<import("./entities/prescription.entity").Prescription>;
    findOne(id: string): Promise<import("./entities/prescription.entity").Prescription>;
    scanAtPharmacy(body: {
        qrCode: string;
        dispensedQuantities: Record<string, number>;
    }): Promise<import("./entities/prescription.entity").Prescription>;
    sign(id: string, body: {
        signature: string;
    }): Promise<import("./entities/prescription.entity").Prescription>;
}

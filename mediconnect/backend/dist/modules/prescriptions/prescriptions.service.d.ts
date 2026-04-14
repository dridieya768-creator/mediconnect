import { OnModuleInit } from "@nestjs/common";
import { Repository, DataSource } from "typeorm";
import { Prescription } from "./entities/prescription.entity";
import { QrCodesService } from "../qr-codes/qr-codes.service";
import { InteractionCheckerService, DrugInteraction } from "./interaction-checker.service";
import { PdfService } from "./pdf.service";
export declare class PrescriptionsService implements OnModuleInit {
    private repo;
    private dataSource;
    private qrCodesService;
    private interactionChecker;
    private pdfService;
    constructor(repo: Repository<Prescription>, dataSource: DataSource, qrCodesService: QrCodesService, interactionChecker: InteractionCheckerService, pdfService: PdfService);
    onModuleInit(): Promise<void>;
    private generateElectronicSignature;
    verifySignature(prescription: Prescription, pin: string): boolean;
    checkInteractions(medications: any[]): DrugInteraction[];
    create(dto: any): Promise<Prescription>;
    findOne(id: string): Promise<Prescription>;
    findByQrCode(qrCode: string): Promise<Prescription>;
    findByPatient(patientId: string): Promise<Prescription[]>;
    scanAtPharmacy(qrCode: string, dispensedQuantities: Record<string, number>): Promise<Prescription>;
    signPrescription(id: string, signature: string): Promise<Prescription>;
}

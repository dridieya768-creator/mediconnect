import { Repository, DataSource } from 'typeorm';
import { QrCodesService } from '../qr-codes/qr-codes.service';
import { TicketPdfService } from './ticket-pdf.service';
import { Prescription, PrescriptionStatus } from '../prescriptions/entities/prescription.entity';
import { DossierHistoriqueService } from '../dossier-medical/dossier-historique.service';
import { ScanQrOrdDto } from './dto/scan-qr-ord.dto';
import { ScanMedCipDto } from './dto/scan-med-cip.dto';
import { ConfirmerDelivranceDto, MedicamentDelivreDto } from './dto/confirmer-delivrance.dto';
export interface PrescriptionDetailDto {
    id: string;
    qrCode: string;
    status: PrescriptionStatus;
    issuedAt: Date;
    expiresAt: Date;
    patient: {
        id: string;
        nom: string;
        prenom: string;
        nss: string;
    };
    medecin: {
        id: string;
        nom: string;
        prenom: string;
        rpps: string | null;
    };
    medications: {
        cip: string;
        name: string;
        dosage: string;
        posology: string;
        durationDays: number;
        quantity: number;
        quantityDelivered: number;
        isSubstitutable: boolean;
    }[];
    notes?: string;
}
export interface FinancierLigneDto {
    cip: string;
    nom: string;
    quantite: number;
    prixUnitaire: number;
    montantTotal: number;
    partCnam: number;
    partPatient: number;
}
export interface FinancierDto {
    lignes: FinancierLigneDto[];
    totalCnam: number;
    totalPatient: number;
    totalGeneral: number;
}
export interface MedicamentDelivreeResultDto {
    cip: string;
    nom: string;
    quantiteDelivree: number;
    prixUnitaire: number;
    partCnam: number;
    partPatient: number;
}
export interface DelivranceResultDto {
    delivranceId: string;
    prescriptionId: string;
    status: PrescriptionStatus;
    medicamentsDelivres: MedicamentDelivreeResultDto[];
    financier: FinancierDto;
    ticketUrl: string;
    delivreAt: Date;
}
export declare class DelivranceService {
    private readonly dataSource;
    private readonly qrCodesService;
    private readonly ticketPdfService;
    private readonly historiqueService;
    private readonly prescriptionRepo;
    constructor(dataSource: DataSource, qrCodesService: QrCodesService, ticketPdfService: TicketPdfService, historiqueService: DossierHistoriqueService, prescriptionRepo: Repository<Prescription>);
    scanQrOrd(dto: ScanQrOrdDto, pharmacienId: string): Promise<PrescriptionDetailDto>;
    scanMedCip(dto: ScanMedCipDto, sessionCounts: Record<string, number>): Promise<{
        cip: string;
        nom: string;
        quantiteSession: number;
    }>;
    calculerFinancier(medicaments: MedicamentDelivreDto[]): FinancierDto;
    confirmerDelivrance(dto: ConfirmerDelivranceDto, pharmacienId: string): Promise<DelivranceResultDto>;
    private mapToPrescriptionDetailDto;
}

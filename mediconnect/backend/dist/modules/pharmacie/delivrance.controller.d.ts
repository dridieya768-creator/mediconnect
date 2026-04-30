import { User } from '../users/entities/user.entity';
import { DelivranceService } from './delivrance.service';
import { ScanQrOrdDto } from './dto/scan-qr-ord.dto';
import { ScanMedCipDto } from './dto/scan-med-cip.dto';
import { ConfirmerDelivranceDto } from './dto/confirmer-delivrance.dto';
export declare class DelivranceController {
    private readonly delivranceService;
    constructor(delivranceService: DelivranceService);
    scanQrOrd(dto: ScanQrOrdDto, user: User): Promise<import("./delivrance.service").PrescriptionDetailDto>;
    scanMedCip(dto: ScanMedCipDto, user: User): Promise<{
        cip: string;
        nom: string;
        quantiteSession: number;
    }>;
    confirmerDelivrance(dto: ConfirmerDelivranceDto, user: User): Promise<import("./delivrance.service").DelivranceResultDto>;
}

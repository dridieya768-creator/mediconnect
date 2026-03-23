import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { QrCode } from "./entities/qr-code.entity";
export declare class QrCodesService {
    private qrRepository;
    private jwtService;
    constructor(qrRepository: Repository<QrCode>, jwtService: JwtService);
    generatePatientQr(patientId: string, patientInfo: any): Promise<string>;
    generateOrdonnanceQr(prescriptionId: string, data: any): Promise<string>;
    scanQr(qrCode: string, scannedBy: string): Promise<{
        valid: boolean;
        data: any;
        qrRecord: QrCode;
    }>;
    generateQrImage(qrCode: string): Promise<string>;
    revokeQr(qrCode: string): Promise<void>;
}

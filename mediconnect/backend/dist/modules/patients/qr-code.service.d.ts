import { ConfigService } from "@nestjs/config";
export declare class QrCodeService {
    private configService;
    constructor(configService: ConfigService);
    generateQrData(patientId: string, userId: string): string;
    generateQrImage(qrData: string): Promise<string>;
    verifyQrCode(qrData: string): {
        valid: boolean;
        patientId?: string;
        userId?: string;
    };
}

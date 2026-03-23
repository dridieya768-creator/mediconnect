import { QrCodesService } from "./qr-codes.service";
export declare class QrCodesController {
    private readonly qrCodesService;
    constructor(qrCodesService: QrCodesService);
    scan(body: {
        qrCode: string;
        scannedBy: string;
    }): Promise<{
        valid: boolean;
        data: any;
        qrRecord: import("./entities/qr-code.entity").QrCode;
    }>;
    getImage(qrCode: string): Promise<string>;
    revoke(qrCode: string): Promise<void>;
}

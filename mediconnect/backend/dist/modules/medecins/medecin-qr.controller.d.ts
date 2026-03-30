import { Response } from "express";
import { QrCodeService } from "../patients/qr-code.service";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
export declare class MedecinQrController {
    private readonly qrCodeService;
    private readonly userRepository;
    constructor(qrCodeService: QrCodeService, userRepository: Repository<User>);
    getPublicMedecinInfo(token: string): Promise<{
        valid: boolean;
        message?: undefined;
        medecin?: undefined;
    } | {
        valid: boolean;
        message: string;
        medecin?: undefined;
    } | {
        valid: boolean;
        medecin: {
            nom: string;
            prenom: string;
            email: string;
            telephone: string;
            role: import("../users/entities/user.entity").UserRole;
        };
        message?: undefined;
    }>;
    getQrCode(req: any): Promise<{
        error: string;
        qrData?: undefined;
        qrImage?: undefined;
        medecinId?: undefined;
        displayId?: undefined;
    } | {
        qrData: string;
        qrImage: string;
        medecinId: any;
        displayId: string;
        error?: undefined;
    }>;
    downloadQrPdf(req: any, res: Response): Promise<void>;
}

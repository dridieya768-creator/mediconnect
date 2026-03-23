import { Response } from "express";
import { QrCodeService } from "./qr-code.service";
import { Repository } from "typeorm";
import { Patient } from "./entities/patient.entity";
export declare class PatientQrController {
    private readonly qrCodeService;
    private readonly patientRepository;
    constructor(qrCodeService: QrCodeService, patientRepository: Repository<Patient>);
    getPublicPatientInfo(token: string): Promise<{
        valid: boolean;
        message?: undefined;
        patient?: undefined;
    } | {
        valid: boolean;
        message: string;
        patient?: undefined;
    } | {
        valid: boolean;
        patient: {
            nom: string;
            prenom: string;
            dateNaissance: Date;
            sexe: string;
            telephone: string;
            groupeSanguin: import("./entities/patient.entity").BloodGroup;
            allergies: string[];
            maladiesChroniques: string[];
        };
        message?: undefined;
    }>;
    getQrCode(req: any): Promise<{
        error: string;
        qrData?: undefined;
        qrImage?: undefined;
        patientId?: undefined;
        displayId?: undefined;
    } | {
        qrData: string;
        qrImage: string;
        patientId: string;
        displayId: string;
        error?: undefined;
    }>;
    downloadQrPdf(req: any, res: Response): Promise<void>;
}

import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { EmailService } from '../../common/services/email.service';
export interface LienPartagePayload {
    type: 'PARTAGE_DOSSIER';
    patientId: string;
    permissions: {
        allergies: boolean;
        maladiesChroniques: boolean;
        medicamentsActuels: boolean;
        documents: boolean;
        observations: boolean;
    };
    expiresAt: string;
}
export declare class PartageLienService {
    private readonly jwtService;
    private readonly patientRepo;
    private readonly emailService;
    constructor(jwtService: JwtService, patientRepo: Repository<Patient>, emailService: EmailService);
    genererEtEnvoyerLien(patientId: string, patientNom: string, medecinEmail: string, permissions: LienPartagePayload['permissions'], dureeHeures: number): Promise<{
        token: string;
        lien: string;
        expiresAt: string;
        emailEnvoye: boolean;
    }>;
    genererLien(patientId: string, permissions: LienPartagePayload['permissions'], dureeHeures: number): {
        token: string;
        lien: string;
        expiresAt: string;
    };
    accederVieLien(token: string): Promise<{
        patient: Partial<Patient>;
        permissions: LienPartagePayload['permissions'];
        expiresAt: string;
    }>;
}

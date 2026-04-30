import { PartageLienService } from './partage-lien.service';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
declare class PermissionsDto {
    allergies: boolean;
    maladiesChroniques: boolean;
    medicamentsActuels: boolean;
    documents: boolean;
    observations: boolean;
}
declare class GenererLienDto {
    permissions: PermissionsDto;
    dureeHeures: number;
}
export declare class PartageLienController {
    private readonly partageLienService;
    private readonly patientRepo;
    constructor(partageLienService: PartageLienService, patientRepo: Repository<Patient>);
    genererLien(dto: GenererLienDto, req: any): Promise<{
        token: string;
        lien: string;
        expiresAt: string;
    }>;
    accederVieLien(token: string): Promise<{
        patient: Partial<Patient>;
        permissions: {
            allergies: boolean;
            maladiesChroniques: boolean;
            medicamentsActuels: boolean;
            documents: boolean;
            observations: boolean;
        };
        expiresAt: string;
    } | {
        error: string;
    }>;
}
export {};

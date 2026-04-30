import { NiveauAcces } from '../entities/dossier-acces-medecin.entity';
export declare class CreateAccesDto {
    medecinId: string;
    niveauAcces: NiveauAcces;
    dateExpiration?: string;
    permissions?: {
        allergies?: boolean;
        documents?: boolean;
        observations?: boolean;
    };
}

import { NiveauAcces } from '../entities/dossier-acces-medecin.entity';
export declare class UpdateAccesDto {
    niveauAcces?: NiveauAcces;
    dateExpiration?: string;
    actif?: boolean;
}

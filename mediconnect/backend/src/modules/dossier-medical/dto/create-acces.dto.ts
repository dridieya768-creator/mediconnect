import { IsUUID, IsEnum, IsOptional, IsDateString, IsObject } from 'class-validator';
import { NiveauAcces } from '../entities/dossier-acces-medecin.entity';

export class CreateAccesDto {
  @IsUUID()
  medecinId: string;

  @IsEnum(NiveauAcces)
  niveauAcces: NiveauAcces;

  @IsOptional()
  @IsDateString()
  dateExpiration?: string;

  @IsOptional()
  @IsObject()
  permissions?: {
    allergies?: boolean;
    documents?: boolean;
    observations?: boolean;
  };
}

import { IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { NiveauAcces } from '../entities/dossier-acces-medecin.entity';

export class UpdateAccesDto {
  @IsOptional()
  @IsEnum(NiveauAcces)
  niveauAcces?: NiveauAcces;

  @IsOptional()
  @IsDateString()
  dateExpiration?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

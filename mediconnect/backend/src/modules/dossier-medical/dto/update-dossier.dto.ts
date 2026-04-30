import { IsOptional, IsString, IsArray, IsDateString } from 'class-validator';

export class UpdateDossierDto {
  @IsOptional()
  @IsArray()
  allergies?: string[];

  @IsOptional()
  @IsArray()
  maladiesChroniques?: string[];

  @IsOptional()
  @IsArray()
  medicamentsActuels?: any[];

  @IsOptional()
  @IsString()
  groupeSanguin?: string;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @IsOptional()
  @IsString()
  sexe?: string;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  nss?: string;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsString()
  observationsMedecin?: string;
}

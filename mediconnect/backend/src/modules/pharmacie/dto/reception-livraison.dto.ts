import { IsString, IsNotEmpty, IsInt, Min, IsDateString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LotReceptionDto {
  @IsString() @IsNotEmpty()
  cip: string;

  @IsString() @IsNotEmpty()
  nom: string;

  @IsOptional() @IsString()
  dci?: string;

  @IsOptional() @IsString()
  forme?: string;

  @IsOptional() @IsString()
  dosage?: string;

  @IsOptional() @IsString()
  fournisseur?: string;

  @IsString() @IsNotEmpty()
  lot: string;

  @IsInt() @Min(1)
  quantite: number;

  @IsDateString()
  dateExpiration: string;

  @IsOptional() @IsNumber()
  prixAchat?: number;

  @IsOptional() @IsNumber()
  prixVente?: number;

  @IsOptional() @IsInt() @Min(1)
  seuilAlerte?: number;
}

export class ReceptionLivraisonDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LotReceptionDto)
  lots: LotReceptionDto[];
}

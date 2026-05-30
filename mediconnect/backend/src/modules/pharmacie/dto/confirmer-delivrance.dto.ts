import { IsString, IsNotEmpty, IsArray, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MedicamentDelivreDto {
  @IsString()
  @IsNotEmpty()
  cip: string;

  @IsNumber()
  @Min(0)
  quantiteDelivree: number;

  @IsNumber()
  @Min(0)
  prixUnitaire: number;

  @IsNumber()
  @Min(0)
  tauxCnam: number;  
}

export class ConfirmerDelivranceDto {
  @IsString()
  @IsNotEmpty()
  prescriptionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicamentDelivreDto)
  medicamentsDelivres: MedicamentDelivreDto[];
}

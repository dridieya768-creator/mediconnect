import { IsString, IsNotEmpty, IsInt, Min, IsBoolean, IsOptional } from 'class-validator';

export class CreateMedicationDto {
  @IsString() @IsNotEmpty()
  cip: string;

  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  dosage: string;

  @IsString() @IsNotEmpty()
  posology: string;

  @IsInt() @Min(1)
  durationDays: number;

  @IsInt() @Min(1)
  quantity: number;

  @IsBoolean()
  isSubstitutable: boolean;

  @IsOptional() @IsInt() @Min(0)
  quantityDelivered?: number;
}

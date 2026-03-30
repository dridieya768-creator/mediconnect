import { IsUUID, IsArray, ValidateNested, ArrayMinSize, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMedicationDto } from './create-medication.dto';

export class CreatePrescriptionDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsOptional() @IsUUID()
  appointmentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateMedicationDto)
  medications: CreateMedicationDto[];

  @IsOptional() @IsString()
  notes?: string;

  // Métadonnées résolues côté service pour le QR
  @IsOptional() @IsString() patientName?: string;
  @IsOptional() @IsString() patientNss?: string;
  @IsOptional() @IsString() medecinRpps?: string;
  @IsOptional() @IsString() medecinName?: string;
}

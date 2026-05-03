import { IsString, IsDateString, IsEnum, IsOptional, IsInt, Min, Max, IsUUID, MaxLength } from "class-validator";
import { ConsultationType } from "../entities/appointment.entity";

export class CreateAppointmentDto {
  @IsString()
  patientId: string;

  @IsString()
  doctorId: string;

  @IsDateString()
  appointmentDate: string;

  @IsInt()
  @Min(15)
  @Max(120)
  @IsOptional()
  durationMinutes?: number;

  @IsEnum(ConsultationType)
  consultationType: ConsultationType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsOptional()
  @IsUUID()
  beneficiaryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  beneficiaryNom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  beneficiaryPrenom?: string;
}
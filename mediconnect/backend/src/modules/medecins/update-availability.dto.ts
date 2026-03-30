import { IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsBoolean()
  disponTeleconsult?: boolean;

  @IsOptional()
  @IsBoolean()
  agendaConnecte?: boolean;

  @IsOptional()
  @IsBoolean()
  connexionVideoIntegree?: boolean;

  @IsOptional()
  @IsArray()
  workDays?: any[];

  @IsOptional()
  @IsNumber()
  defaultDuration?: number;

  @IsOptional()
  @IsBoolean()
  acceptsTeleconsultation?: boolean;
}
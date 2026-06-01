import { IsOptional, IsInt, IsString, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class HistoriqueQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  champ?: string;

  @IsOptional()
  @IsUUID()
  modifieParId?: string;

  @IsOptional()
  @IsString()
  roleAuteur?: string;
}

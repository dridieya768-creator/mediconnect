import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchMedecinsDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  specialite?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  ville?: string;
}

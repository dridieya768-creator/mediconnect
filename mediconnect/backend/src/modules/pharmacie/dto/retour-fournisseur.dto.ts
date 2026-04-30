import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class RetourFournisseurDto {
  @IsString() @IsNotEmpty()
  stockItemId: string;

  @IsInt() @Min(1)
  quantite: number;

  @IsOptional() @IsString()
  lot?: string;

  @IsOptional() @IsString()
  motif?: string;
}

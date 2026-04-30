import { IsArray, ValidateNested, IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class LigneInventaireDto {
  @IsString() @IsNotEmpty()
  stockItemId: string;

  @IsInt() @Min(0)
  quantiteReelle: number;
}

export class InventaireDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneInventaireDto)
  lignes: LigneInventaireDto[];
}

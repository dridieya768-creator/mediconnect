import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Relation } from '../entities/family-member.entity';

export class CreateFamilyMemberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  prenom: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nom: string;

  @IsDateString()
  dateNaissance: string;

  @IsEnum(Relation)
  relation: Relation;

  @IsIn(['M', 'F'])
  sexe: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nss?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(5)
  groupeSanguin?: string;
}

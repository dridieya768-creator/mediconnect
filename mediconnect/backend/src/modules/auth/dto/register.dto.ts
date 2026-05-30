import { IsEmail, IsString, IsEnum, IsOptional, MinLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';


export class DoctorDocumentDto {
  @IsString()
  type: string;        

  @IsString()
  filename: string;    

  @IsString()
  base64: string;      
}

// ── DTO principal d'inscription ───────────────────────────────
export class RegisterDto {
  @ApiProperty({ example: 'ahmed.mansouri@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Test1234!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Mansouri' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+21698765432', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PATIENT })
  @IsEnum(UserRole)
  role: UserRole;

  
  @ApiProperty({ required: false, type: [DoctorDocumentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DoctorDocumentDto)
  documents?: DoctorDocumentDto[];
}
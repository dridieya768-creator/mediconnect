import { IsString, IsNotEmpty } from 'class-validator';

export class ScanMedCipDto {
  @IsString()
  @IsNotEmpty()
  qrMedCip: string;

  @IsString()
  @IsNotEmpty()
  prescriptionId: string;
}

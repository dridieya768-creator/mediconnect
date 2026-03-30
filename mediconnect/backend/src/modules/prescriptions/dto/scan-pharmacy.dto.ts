import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class ScanPharmacyDto {
  @IsString() @IsNotEmpty()
  qrCode: string;

  @IsObject()
  dispensedQuantities: Record<string, number>;
}

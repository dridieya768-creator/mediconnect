import { IsString, IsNotEmpty } from 'class-validator';

export class ScanQrOrdDto {
  @IsString()
  @IsNotEmpty()
  qrCode: string;
}

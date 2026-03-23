import { Controller, Post, Get, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { QrCodesService } from "./qr-codes.service";

@ApiTags("qr-codes")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("qr-codes")
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Post("scan")
  @ApiOperation({ summary: "Scanner un QR code (retourne les données décodées)" })
  scan(@Body() body: { qrCode: string; scannedBy: string }) {
    return this.qrCodesService.scanQr(body.qrCode, body.scannedBy);
  }

  @Get("image/:qrCode")
  @ApiOperation({ summary: "Générer image PNG du QR code (base64)" })
  getImage(@Param("qrCode") qrCode: string) {
    return this.qrCodesService.generateQrImage(qrCode);
  }

  @Post("revoke/:qrCode")
  @ApiOperation({ summary: "Révoquer un QR code" })
  revoke(@Param("qrCode") qrCode: string) {
    return this.qrCodesService.revokeQr(qrCode);
  }
}

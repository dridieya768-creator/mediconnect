import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import * as QRCode from "qrcode";

@Injectable()
export class QrCodeService {
  constructor(private configService: ConfigService) {}

generateQrData(patientId: string, userId: string): string {
  const signingKey = this.configService.get<string>("QR_SIGNING_KEY") || "default-key";
  const payload = `PAT:${patientId}:${userId}`;
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(payload)
    .digest("hex")
    .substring(0, 12);
  const token = `${patientId}:${userId}:${signature}`;
  const encoded = Buffer.from(token).toString("base64url");
  return `https://localhost:4200/scan/${encoded}`;
}

  async generateQrImage(qrData: string): Promise<string> {
    return QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
  }

  verifyQrCode(qrData: string): { valid: boolean; patientId?: string; userId?: string } {
    try {
      const parts = qrData.split(":");
      if (parts.length < 4 || parts[0] !== "MEDICONNECT" || parts[1] !== "PAT") {
        return { valid: false };
      }
      const patientId = parts[2];
      const userId = parts[3];
      const signature = parts[4];
      const signingKey = this.configService.get<string>("QR_SIGNING_KEY") || "default-key";
      const payload = `PAT:${patientId}:${userId}`;
      const expectedSig = crypto
        .createHmac("sha256", signingKey)
        .update(payload)
        .digest("hex")
        .substring(0, 12);
      if (signature !== expectedSig) return { valid: false };
      return { valid: true, patientId, userId };
    } catch {
      return { valid: false };
    }
  }
}

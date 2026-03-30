import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { QrCode, QrCodeType, QrCodeStatus } from "./entities/qr-code.entity";

@Injectable()
export class QrCodesService {
  constructor(
    @InjectRepository(QrCode)
    private qrRepository: Repository<QrCode>,
    private jwtService: JwtService,
  ) {}

  async generatePatientQr(patientId: string, patientInfo: any): Promise<string> {
    const qrCode = `QR-PAT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const payload = {
      type: QrCodeType.PATIENT,
      qr_id: uuidv4(),
      patient_id: patientId,
      patient_name: patientInfo.fullName ?? "",
      patient_nss: patientInfo.nss ?? "",
      iat: Math.floor(Date.now() / 1000),
    };
    const jwtToken = this.jwtService.sign(payload);
    await this.qrRepository.save(
      this.qrRepository.create({ qrCode, qrType: QrCodeType.PATIENT, entityId: patientId, jwtToken }),
    );
    return qrCode;
  }

  async generateOrdonnanceQr(prescriptionId: string, data: any): Promise<string> {
    const qrCode = `QR-ORD-${uuidv4().split("-")[0].toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    const payload = {
      type: QrCodeType.ORDONNANCE,
      qr_id: uuidv4(),
      prescription_id: prescriptionId,
      patient_id: data.patientId ?? "",
      patient_name: data.patientName ?? "",
      medecin_rpps: data.medecinRpps ?? "",
      medecin_name: data.medecinName ?? "",
      date_emission: new Date().toISOString(),
      date_expiration: expiresAt.toISOString(),
      exp: Math.floor(expiresAt.getTime() / 1000),
      iat: Math.floor(Date.now() / 1000),
    };

    const jwtToken = this.jwtService.sign(payload);
    await this.qrRepository.save(
      this.qrRepository.create({ qrCode, qrType: QrCodeType.ORDONNANCE, entityId: prescriptionId, jwtToken, expiresAt }),
    );
    return qrCode;
  }

  async scanQr(qrCode: string, scannedBy: string): Promise<{ valid: boolean; data: any; qrRecord: QrCode }> {
    const qrRecord = await this.qrRepository.findOne({ where: { qrCode } });
    if (!qrRecord) throw new NotFoundException("QR code introuvable");
    if (qrRecord.status === QrCodeStatus.REVOKED) throw new BadRequestException("QR code révoqué");
    if (qrRecord.status === QrCodeStatus.EXPIRED) throw new BadRequestException("QR code expiré");
    if (qrRecord.expiresAt && new Date() > qrRecord.expiresAt) {
      await this.qrRepository.update(qrRecord.id, { status: QrCodeStatus.EXPIRED });
      throw new BadRequestException("QR code expiré");
    }

    let data: any;
    try {
      data = this.jwtService.verify(qrRecord.jwtToken);
    } catch {
      throw new BadRequestException("Signature QR invalide");
    }

    await this.qrRepository.update(qrRecord.id, { scanCount: qrRecord.scanCount + 1, lastScanAt: new Date() });
    return { valid: true, data, qrRecord };
  }

  async generateQrImage(qrCode: string): Promise<string> {
    // Use callback-based overload wrapped in Promise to avoid type conflicts
    return new Promise<string>((resolve, reject) => {
      QRCode.toDataURL(
        qrCode,
        {
          errorCorrectionLevel: "M",
          margin: 2,
          color: { dark: "#0f172a", light: "#ffffff" },
        },
        (err: Error | null | undefined, url: string) => {
          if (err) reject(err);
          else resolve(url);
        },
      );
    });
  }

  async revokeQr(qrCode: string): Promise<void> {
    const qr = await this.qrRepository.findOne({ where: { qrCode } });
    if (!qr) throw new NotFoundException("QR code introuvable");
    await this.qrRepository.update(qr.id, { status: QrCodeStatus.REVOKED });
  }
}

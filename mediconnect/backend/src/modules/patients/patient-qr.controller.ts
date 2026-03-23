import { Controller, Get, UseGuards, Request, Res, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Response } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { QrCodeService } from "./qr-code.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Patient } from "./entities/patient.entity";
import * as PDFDocument from "pdfkit";


@ApiTags("patient-qr")
@Controller("patient/qr")
export class PatientQrController {
  constructor(
    private readonly qrCodeService: QrCodeService,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  // ✅ PUBLIC — sans authentification
  @Get("public/:token")
  @ApiOperation({ summary: "Page publique QR code patient" })
  async getPublicPatientInfo(@Param("token") token: string) {
    try {
      const decoded = Buffer.from(token, "base64url").toString("utf-8");
      const parts = decoded.split(":");
      if (parts.length < 3) return { valid: false };

      const [patientId, userId, signature] = parts;
      const verify = this.qrCodeService.verifyQrCode(
        `MEDICONNECT:PAT:${patientId}:${userId}:${signature}`
      );
      if (!verify.valid) return { valid: false, message: "QR code invalide" };

      const patient = await this.patientRepository.findOne({
        where: { id: patientId },
        relations: ["user"],
      });
      if (!patient) return { valid: false, message: "Patient introuvable" };

      return {
        valid: true,
        patient: {
          nom: patient.nom,
          prenom: patient.prenom,
          dateNaissance: patient.dateNaissance,
          sexe: patient.sexe,
          telephone: patient.telephone,
          groupeSanguin: patient.groupeSanguin,
          allergies: patient.allergies,
          maladiesChroniques: patient.maladiesChroniques,
        }
      };
    } catch {
      return { valid: false, message: "Token invalide" };
    }
  }

  // 🔒 PROTÉGÉ — nécessite JWT
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "US6 - Obtenir le QR code patient" })
  async getQrCode(@Request() req: any) {
    const userId = req.user.id;
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) return { error: "Profil patient non trouvé" };

    const qrData = this.qrCodeService.generateQrData(patient.id, userId);
    const qrImage = await this.qrCodeService.generateQrImage(qrData);

    return {
      qrData,
      qrImage,
      patientId: patient.id,
      displayId: `QR-PAT-${patient.id.substring(0, 8).toUpperCase()}`,
    };
  }

  // 🔒 PROTÉGÉ
  @Get("pdf")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "US7 - Télécharger QR code en PDF" })
  async downloadQrPdf(@Request() req: any, @Res() res: Response) {
    const userId = req.user.id;
    const patient = await this.patientRepository.findOne({
      where: { userId },
      relations: ["user"],
    });

    if (!patient) {
      res.status(404).json({ error: "Profil patient non trouvé" });
      return;
    }

    const qrData = this.qrCodeService.generateQrData(patient.id, userId);
    const qrImage = await this.qrCodeService.generateQrImage(qrData);

    const doc = new PDFDocument({ size: "A5", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="mediconnect-qr-${patient.id.substring(0, 8)}.pdf"`);
    doc.pipe(res);

    doc.rect(0, 0, doc.page.width, 80).fill("#0f172a");
    doc.fillColor("white").fontSize(20).font("Helvetica-Bold").text("MediConnect", 40, 20);
    doc.fillColor("#94a3b8").fontSize(10).font("Helvetica").text("Carte d'identification patient", 40, 48);

    const firstName = (patient as any).user?.firstName || "Patient";
    const lastName = (patient as any).user?.lastName || "";
    doc.fillColor("#0f172a").fontSize(16).font("Helvetica-Bold").text(`${firstName} ${lastName}`, 40, 100);
    doc.fillColor("#64748b").fontSize(10).font("Helvetica").text(`ID: QR-PAT-${patient.id.substring(0, 8).toUpperCase()}`, 40, 122);

    const base64Data = qrImage.replace(/^data:image\/png;base64,/, "");
    const qrBuffer = Buffer.from(base64Data, "base64");
    const pageWidth = doc.page.width;
    const qrX = (pageWidth - 180) / 2;
    doc.image(qrBuffer, qrX, 150, { width: 180, height: 180 });

    doc.fillColor("#64748b").fontSize(9).font("Helvetica")
      .text("Présentez ce QR code lors de vos consultations", 40, 345, { align: "center", width: pageWidth - 80 });

    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill("#f8fafc");
    doc.fillColor("#94a3b8").fontSize(8)
      .text(`Généré le ${new Date().toLocaleDateString("fr-FR")} · mediconnect.tn`, 40, doc.page.height - 25, { align: "center", width: pageWidth - 80 });

    doc.end();
  }
}
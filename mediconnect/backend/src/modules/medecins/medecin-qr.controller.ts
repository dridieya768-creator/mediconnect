import { Controller, Get, UseGuards, Request, Res, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Response } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { QrCodeService } from "../patients/qr-code.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import * as PDFDocument from "pdfkit";

@ApiTags("medecin-qr")
@Controller("medecin/qr")
export class MedecinQrController {
  constructor(
    private readonly qrCodeService: QrCodeService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ✅ PUBLIC — sans authentification — scan de la carte médecin
  @Get("public/:token")
  @ApiOperation({ summary: "Page publique QR code médecin" })
  async getPublicMedecinInfo(@Param("token") token: string) {
    try {
      const decoded = Buffer.from(token, "base64url").toString("utf-8");
      const parts = decoded.split(":");
      if (parts.length < 3) return { valid: false };

      const [medecinId, userId, signature] = parts;
      const verify = this.qrCodeService.verifyQrCode(
        `MEDICONNECT:MED:${medecinId}:${userId}:${signature}`
      );
      if (!verify.valid) return { valid: false, message: "QR code invalide" };

      const medecin = await this.userRepository.findOne({
        where: { id: medecinId },
      });
      if (!medecin) return { valid: false, message: "Médecin introuvable" };

      return {
        valid: true,
        medecin: {
          nom:       medecin.lastName,
          prenom:    medecin.firstName,
          email:     medecin.email,
          telephone: medecin.phone,
          role:      medecin.role,
        },
      };
    } catch {
      return { valid: false, message: "Token invalide" };
    }
  }

  // 🔒 PROTÉGÉ — nécessite JWT — obtenir son propre QR code
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtenir le QR code médecin" })
  async getQrCode(@Request() req: any) {
    const userId = req.user.id;
    const medecin = await this.userRepository.findOne({ where: { id: userId } });
    if (!medecin) return { error: "Médecin introuvable" };

    const qrData  = this.qrCodeService.generateQrData(userId, userId);
    const qrImage = await this.qrCodeService.generateQrImage(qrData);

    return {
      qrData,
      qrImage,
      medecinId: userId,
      displayId: `QR-MED-${userId.substring(0, 8).toUpperCase()}`,
    };
  }

  // 🔒 PROTÉGÉ — télécharger la carte médecin en PDF
  @Get("pdf")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Télécharger la carte médecin en PDF" })
  async downloadQrPdf(@Request() req: any, @Res() res: Response) {
    const userId  = req.user.id;
    const medecin = await this.userRepository.findOne({ where: { id: userId } });

    if (!medecin) {
      res.status(404).json({ error: "Médecin introuvable" });
      return;
    }

    const qrData  = this.qrCodeService.generateQrData(userId, userId);
    const qrImage = await this.qrCodeService.generateQrImage(qrData);

    const doc = new PDFDocument({ size: "A5", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="mediconnect-medecin-${userId.substring(0, 8)}.pdf"`
    );
    doc.pipe(res);

    // ── En-tête ──────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill("#0f172a");
    doc.fillColor("white").fontSize(20).font("Helvetica-Bold")
       .text("MediConnect", 40, 20);
    doc.fillColor("#94a3b8").fontSize(10).font("Helvetica")
       .text("Carte d'identification médecin", 40, 48);

    // ── Infos médecin ─────────────────────────────────────────
    doc.fillColor("#0f172a").fontSize(16).font("Helvetica-Bold")
       .text(`Dr. ${medecin.firstName} ${medecin.lastName}`, 40, 100);
    doc.fillColor("#64748b").fontSize(10).font("Helvetica")
       .text(`Rôle : ${medecin.role}`, 40, 122)
       .text(`Email : ${medecin.email}`, 40, 138)
       .text(`ID : QR-MED-${userId.substring(0, 8).toUpperCase()}`, 40, 154);

    // ── QR code centré ────────────────────────────────────────
    const base64Data = qrImage.replace(/^data:image\/png;base64,/, "");
    const qrBuffer   = Buffer.from(base64Data, "base64");
    const pageWidth  = doc.page.width;
    const qrX        = (pageWidth - 180) / 2;
    doc.image(qrBuffer, qrX, 175, { width: 180, height: 180 });

    // ── Sous-titre ────────────────────────────────────────────
    doc.fillColor("#64748b").fontSize(9).font("Helvetica")
       .text(
         "Présentez ce QR code pour identifier votre identité professionnelle",
         40, 365,
         { align: "center", width: pageWidth - 80 }
       );

    // ── Pied de page ──────────────────────────────────────────
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill("#f8fafc");
    doc.fillColor("#94a3b8").fontSize(8)
       .text(
         `Généré le ${new Date().toLocaleDateString("fr-FR")} · mediconnect.tn`,
         40, doc.page.height - 25,
         { align: "center", width: pageWidth - 80 }
       );

    doc.end();
  }
}
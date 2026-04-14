import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Prescription, PrescriptionStatus } from "./entities/prescription.entity";
import { QrCodesService } from "../qr-codes/qr-codes.service";
import { InteractionCheckerService, DrugInteraction } from "./interaction-checker.service";
import { PdfService } from "./pdf.service";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import * as crypto from "crypto";

@Injectable()
export class PrescriptionsService implements OnModuleInit {
  constructor(
    @InjectRepository(Prescription)
    private repo: Repository<Prescription>,
    @InjectDataSource()
    private dataSource: DataSource,
    private qrCodesService: QrCodesService,
    private interactionChecker: InteractionCheckerService,
    private pdfService: PdfService,
  ) {}

  // ── Migration automatique au démarrage ───────────────────────────────────
  async onModuleInit() {
    try {
      await this.dataSource.query(
        `ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS signature_image TEXT;`
      );
      await this.dataSource.query(
        `ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS imaging_requests JSONB;`
      );
      console.log('[PrescriptionsService] Migrations OK');
    } catch (err: any) {
      console.warn('[PrescriptionsService] Migration warning:', err?.message);
    }
  }

  // ── Génère une signature HMAC-SHA256 réelle ──────────────────────────────
  private generateElectronicSignature(
    prescriptionId: string,
    doctorId: string,
    patientId: string,
    medications: any[],
    pin: string,
    issuedAt: Date,
  ): string {
    // Payload canonique : contenu de l'ordonnance
    const payload = JSON.stringify({
      prescriptionId,
      doctorId,
      patientId,
      medicationsHash: crypto
        .createHash("sha256")
        .update(JSON.stringify(medications))
        .digest("hex"),
      issuedAt: issuedAt.toISOString(),
    });

    // Clé = HMAC(PIN + doctorId, SECRET_KEY)
    const secretKey = process.env.SIGNATURE_SECRET || "mediconnect-pfe-2026-secret-key";
    const signingKey = crypto
      .createHmac("sha256", secretKey)
      .update(`${pin}:${doctorId}`)
      .digest("hex");

    // Signature finale = HMAC-SHA256(payload, signingKey)
    const signature = crypto
      .createHmac("sha256", signingKey)
      .update(payload)
      .digest("hex");

    return `HMAC-SHA256:${signature.toUpperCase()}`;
  }

  // ── Vérifie une signature ────────────────────────────────────────────────
  verifySignature(prescription: Prescription, pin: string): boolean {
    if (!prescription.electronicSignature) return false;
    const expected = this.generateElectronicSignature(
      prescription.id,
      prescription.doctorId,
      prescription.patientId,
      prescription.medications,
      pin,
      prescription.issuedAt,
    );
    return prescription.electronicSignature === expected;
  }

  checkInteractions(medications: any[]): DrugInteraction[] {
    return this.interactionChecker.checkInteractions(medications);
  }

  async create(dto: any): Promise<Prescription> {
    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 90);

      const tempCode = `PENDING-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const entity = this.repo.create({
        patientId:   dto.patientId,
        doctorId:    dto.doctorId,
        medications: dto.medications ?? [],
        appointmentId: dto.appointmentId,
        notes:       dto.notes,
        issuedAt:    now,
        expiresAt,
        status:      PrescriptionStatus.ACTIVE,
        qrCode:      tempCode,
        qrJwt:       '',
        // Signature électronique HMAC-SHA256 réelle si PIN fourni
        signedAt:    dto.pin ? now : undefined,
        electronicSignature: dto.pin
          ? this.generateElectronicSignature(
              'PENDING',
              dto.doctorId,
              dto.patientId,
              dto.medications ?? [],
              dto.pin,
              now,
            )
          : undefined,
        signatureImage: dto.signatureImage || undefined,
        imagingRequests: dto.imagingRequests?.length ? dto.imagingRequests : undefined,
      });

      const saved = (await this.repo.save(entity as any)) as unknown as Prescription;

      try {
        const qrCode = await this.qrCodesService.generateOrdonnanceQr(saved.id, {
          patientId:   dto.patientId ?? '',
          patientName: dto.patientName ?? '',
          patientNss:  dto.patientNss ?? '',
          medecinRpps: dto.medecinRpps ?? '',
          medecinName: dto.medecinName ?? '',
        });
        await this.repo.update(saved.id, { qrCode });

        // Re-signer avec l'ID réel (la première signature utilisait 'PENDING')
        if (dto.pin) {
          const realSignature = this.generateElectronicSignature(
            saved.id,
            dto.doctorId,
            dto.patientId,
            dto.medications ?? [],
            dto.pin,
            now,
          );
          await this.repo.update(saved.id, {
            electronicSignature: realSignature,
            signatureImage: dto.signatureImage || undefined,
          });
        }

        // Générer le PDF
        try {
          const prescription = await this.findOne(saved.id);
          console.log('[PrescriptionsService] Generating PDF for prescription:', saved.id);
          const pdfBuffer = await this.pdfService.generatePrescriptionPdf(
            prescription,
            dto.medecinName || 'Médecin',
            dto.patientName || 'Patient',
          );
          console.log('[PrescriptionsService] PDF generated, size:', pdfBuffer.length, 'bytes');
          // Sauvegarder le PDF
          const uploadsDir = join(process.cwd(), 'uploads', 'prescriptions');
          if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
          const filename = `prescription-${saved.id}.pdf`;
          writeFileSync(join(uploadsDir, filename), pdfBuffer as unknown as Uint8Array);
          const pdfUrl = `/uploads/prescriptions/${filename}`;
          await this.repo.update(saved.id, { pdfUrl });
          console.log('[PrescriptionsService] PDF saved at:', pdfUrl);
        } catch (pdfErr: any) {
          console.error('[PrescriptionsService] PDF generation FAILED:', pdfErr?.message, pdfErr?.stack?.substring(0, 300));
        }
      } catch (qrErr: any) {
        console.warn('[PrescriptionsService] QR generation failed:', qrErr?.message);
      }

      return this.findOne(saved.id);
    } catch (err: any) {
      console.error('[PrescriptionsService] create() error:', err?.message, err?.detail);
      throw err;
    }
  }

  async findOne(id: string): Promise<Prescription> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException("Prescription introuvable");
    return p;
  }

  async findByQrCode(qrCode: string): Promise<Prescription> {
    const p = await this.repo.findOne({ where: { qrCode } });
    if (!p) throw new NotFoundException("Ordonnance introuvable");
    return p;
  }

  async findByPatient(patientId: string): Promise<Prescription[]> {
    try {
      return await this.repo.find({
        where: { patientId },
        order: { createdAt: 'DESC' },
        relations: [], // pas de jointures eager pour éviter les erreurs
      });
    } catch (err: any) {
      console.warn('[PrescriptionsService] findByPatient error:', err?.message);
      return [];
    }
  }

  async scanAtPharmacy(qrCode: string, dispensedQuantities: Record<string, number>): Promise<Prescription> {
    const p = await this.repo.findOne({ where: { qrCode } });
    if (!p) throw new NotFoundException("Ordonnance introuvable");
    if (p.status === PrescriptionStatus.EXPIRED) throw new BadRequestException("Ordonnance expirée");
    if (p.status === PrescriptionStatus.FULLY_USED) throw new BadRequestException("Ordonnance déjà délivrée");
    if (p.status === PrescriptionStatus.REVOKED) throw new BadRequestException("Ordonnance révoquée");

    p.medications = p.medications.map((med) => ({
      ...med,
      quantityDelivered: (med.quantityDelivered ?? 0) + (dispensedQuantities[med.cip] ?? 0),
    }));

    const allDone = p.medications.every((m) => (m.quantityDelivered ?? 0) >= m.quantity);
    p.status = allDone ? PrescriptionStatus.FULLY_USED : PrescriptionStatus.PARTIALLY_USED;
    return this.repo.save(p);
  }

  async signPrescription(id: string, signature: string): Promise<Prescription> {
    await this.repo.update(id, { signedAt: new Date(), electronicSignature: signature });
    return this.findOne(id);
  }
}

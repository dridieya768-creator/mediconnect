import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Prescription, PrescriptionStatus } from "./entities/prescription.entity";
import { QrCodesService } from "../qr-codes/qr-codes.service";
import { InteractionCheckerService, DrugInteraction } from "./interaction-checker.service";
import { PdfService } from "./pdf.service";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private repo: Repository<Prescription>,
    private qrCodesService: QrCodesService,
    private interactionChecker: InteractionCheckerService,
    private pdfService: PdfService,
  ) {}

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

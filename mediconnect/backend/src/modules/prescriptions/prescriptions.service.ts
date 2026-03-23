import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ObjectLiteral } from "typeorm";
import { Prescription, PrescriptionStatus } from "./entities/prescription.entity";
import { QrCodesService } from "../qr-codes/qr-codes.service";

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private repo: Repository<Prescription>,
    private qrCodesService: QrCodesService,
  ) {}

  async create(dto: any): Promise<Prescription> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    const entity = this.repo.create({
      patientId: dto.patientId,
      doctorId: dto.doctorId,
      medications: dto.medications ?? [],
      appointmentId: dto.appointmentId,
      issuedAt: new Date(),
      expiresAt,
      status: PrescriptionStatus.ACTIVE,
      qrCode: "PENDING",
      qrJwt: "PENDING",
    });

    // Cast explicitly to avoid TypeORM overload confusion
    const saved = (await this.repo.save(entity as any)) as unknown as Prescription;

    const qrCode = await this.qrCodesService.generateOrdonnanceQr(saved.id, {
      patientId: dto.patientId ?? "",
      patientName: dto.patientName ?? "",
      patientNss: dto.patientNss ?? "",
      medecinRpps: dto.medecinRpps ?? "",
      medecinName: dto.medecinName ?? "",
    });

    await this.repo.update(saved.id, { qrCode });
    return this.findOne(saved.id);
  }

  async findOne(id: string): Promise<Prescription> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException("Prescription introuvable");
    return p;
  }

  async findByPatient(patientId: string): Promise<Prescription[]> {
    return this.repo.find({ where: { patientId }, order: { createdAt: "DESC" } });
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

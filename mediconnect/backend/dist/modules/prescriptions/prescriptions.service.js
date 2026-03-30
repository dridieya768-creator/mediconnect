"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const prescription_entity_1 = require("./entities/prescription.entity");
const qr_codes_service_1 = require("../qr-codes/qr-codes.service");
const interaction_checker_service_1 = require("./interaction-checker.service");
const pdf_service_1 = require("./pdf.service");
const fs_1 = require("fs");
const path_1 = require("path");
let PrescriptionsService = class PrescriptionsService {
    constructor(repo, qrCodesService, interactionChecker, pdfService) {
        this.repo = repo;
        this.qrCodesService = qrCodesService;
        this.interactionChecker = interactionChecker;
        this.pdfService = pdfService;
    }
    checkInteractions(medications) {
        return this.interactionChecker.checkInteractions(medications);
    }
    async create(dto) {
        try {
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setDate(expiresAt.getDate() + 90);
            const tempCode = `PENDING-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            const entity = this.repo.create({
                patientId: dto.patientId,
                doctorId: dto.doctorId,
                medications: dto.medications ?? [],
                appointmentId: dto.appointmentId,
                notes: dto.notes,
                issuedAt: now,
                expiresAt,
                status: prescription_entity_1.PrescriptionStatus.ACTIVE,
                qrCode: tempCode,
                qrJwt: '',
            });
            const saved = (await this.repo.save(entity));
            try {
                const qrCode = await this.qrCodesService.generateOrdonnanceQr(saved.id, {
                    patientId: dto.patientId ?? '',
                    patientName: dto.patientName ?? '',
                    patientNss: dto.patientNss ?? '',
                    medecinRpps: dto.medecinRpps ?? '',
                    medecinName: dto.medecinName ?? '',
                });
                await this.repo.update(saved.id, { qrCode });
                try {
                    const prescription = await this.findOne(saved.id);
                    console.log('[PrescriptionsService] Generating PDF for prescription:', saved.id);
                    const pdfBuffer = await this.pdfService.generatePrescriptionPdf(prescription, dto.medecinName || 'Médecin', dto.patientName || 'Patient');
                    console.log('[PrescriptionsService] PDF generated, size:', pdfBuffer.length, 'bytes');
                    const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads', 'prescriptions');
                    if (!(0, fs_1.existsSync)(uploadsDir))
                        (0, fs_1.mkdirSync)(uploadsDir, { recursive: true });
                    const filename = `prescription-${saved.id}.pdf`;
                    (0, fs_1.writeFileSync)((0, path_1.join)(uploadsDir, filename), pdfBuffer);
                    const pdfUrl = `/uploads/prescriptions/${filename}`;
                    await this.repo.update(saved.id, { pdfUrl });
                    console.log('[PrescriptionsService] PDF saved at:', pdfUrl);
                }
                catch (pdfErr) {
                    console.error('[PrescriptionsService] PDF generation FAILED:', pdfErr?.message, pdfErr?.stack?.substring(0, 300));
                }
            }
            catch (qrErr) {
                console.warn('[PrescriptionsService] QR generation failed:', qrErr?.message);
            }
            return this.findOne(saved.id);
        }
        catch (err) {
            console.error('[PrescriptionsService] create() error:', err?.message, err?.detail);
            throw err;
        }
    }
    async findOne(id) {
        const p = await this.repo.findOne({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException("Prescription introuvable");
        return p;
    }
    async findByQrCode(qrCode) {
        const p = await this.repo.findOne({ where: { qrCode } });
        if (!p)
            throw new common_1.NotFoundException("Ordonnance introuvable");
        return p;
    }
    async findByPatient(patientId) {
        try {
            return await this.repo.find({
                where: { patientId },
                order: { createdAt: 'DESC' },
                relations: [],
            });
        }
        catch (err) {
            console.warn('[PrescriptionsService] findByPatient error:', err?.message);
            return [];
        }
    }
    async scanAtPharmacy(qrCode, dispensedQuantities) {
        const p = await this.repo.findOne({ where: { qrCode } });
        if (!p)
            throw new common_1.NotFoundException("Ordonnance introuvable");
        if (p.status === prescription_entity_1.PrescriptionStatus.EXPIRED)
            throw new common_1.BadRequestException("Ordonnance expirée");
        if (p.status === prescription_entity_1.PrescriptionStatus.FULLY_USED)
            throw new common_1.BadRequestException("Ordonnance déjà délivrée");
        if (p.status === prescription_entity_1.PrescriptionStatus.REVOKED)
            throw new common_1.BadRequestException("Ordonnance révoquée");
        p.medications = p.medications.map((med) => ({
            ...med,
            quantityDelivered: (med.quantityDelivered ?? 0) + (dispensedQuantities[med.cip] ?? 0),
        }));
        const allDone = p.medications.every((m) => (m.quantityDelivered ?? 0) >= m.quantity);
        p.status = allDone ? prescription_entity_1.PrescriptionStatus.FULLY_USED : prescription_entity_1.PrescriptionStatus.PARTIALLY_USED;
        return this.repo.save(p);
    }
    async signPrescription(id, signature) {
        await this.repo.update(id, { signedAt: new Date(), electronicSignature: signature });
        return this.findOne(id);
    }
};
exports.PrescriptionsService = PrescriptionsService;
exports.PrescriptionsService = PrescriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(prescription_entity_1.Prescription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        qr_codes_service_1.QrCodesService,
        interaction_checker_service_1.InteractionCheckerService,
        pdf_service_1.PdfService])
], PrescriptionsService);
//# sourceMappingURL=prescriptions.service.js.map
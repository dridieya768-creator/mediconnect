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
const email_service_1 = require("../../common/services/email.service");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto = require("crypto");
let PrescriptionsService = class PrescriptionsService {
    constructor(repo, dataSource, qrCodesService, interactionChecker, pdfService, emailService) {
        this.repo = repo;
        this.dataSource = dataSource;
        this.qrCodesService = qrCodesService;
        this.interactionChecker = interactionChecker;
        this.pdfService = pdfService;
        this.emailService = emailService;
    }
    async onModuleInit() {
        try {
            await this.dataSource.query(`ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS signature_image TEXT;`);
            await this.dataSource.query(`ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS imaging_requests JSONB;`);
            await this.dataSource.query(`ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS analysis_requests JSONB;`);
            console.log('[PrescriptionsService] Migrations OK');
        }
        catch (err) {
            console.warn('[PrescriptionsService] Migration warning:', err?.message);
        }
    }
    generateElectronicSignature(prescriptionId, doctorId, patientId, medications, pin, issuedAt) {
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
        const secretKey = process.env.SIGNATURE_SECRET || "mediconnect-pfe-2026-secret-key";
        const signingKey = crypto
            .createHmac("sha256", secretKey)
            .update(`${pin}:${doctorId}`)
            .digest("hex");
        const signature = crypto
            .createHmac("sha256", signingKey)
            .update(payload)
            .digest("hex");
        return `HMAC-SHA256:${signature.toUpperCase()}`;
    }
    verifySignature(prescription, pin) {
        if (!prescription.electronicSignature)
            return false;
        const expected = this.generateElectronicSignature(prescription.id, prescription.doctorId, prescription.patientId, prescription.medications, pin, prescription.issuedAt);
        return prescription.electronicSignature === expected;
    }
    checkInteractions(medications) {
        return this.interactionChecker.checkInteractions(medications);
    }
    async create(dto) {
        try {
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setDate(expiresAt.getDate() + 90);
            let patientId = dto.patientId;
            const patientRow = await this.dataSource.query(`SELECT id FROM patients WHERE id = $1 OR user_id = $1 LIMIT 1`, [patientId]);
            if (patientRow?.length > 0) {
                patientId = patientRow[0].id;
            }
            else {
                throw new Error(`Patient introuvable pour l'ID: ${patientId}`);
            }
            const tempCode = `PENDING-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            const entity = this.repo.create({
                patientId,
                doctorId: dto.doctorId,
                medications: dto.medications ?? [],
                appointmentId: dto.appointmentId,
                notes: dto.notes,
                issuedAt: now,
                expiresAt,
                status: prescription_entity_1.PrescriptionStatus.ACTIVE,
                qrCode: tempCode,
                qrJwt: '',
                signedAt: dto.pin ? now : undefined,
                electronicSignature: dto.pin
                    ? this.generateElectronicSignature('PENDING', dto.doctorId, dto.patientId, dto.medications ?? [], dto.pin, now)
                    : undefined,
                signatureImage: dto.signatureImage || undefined,
                imagingRequests: dto.imagingRequests?.length ? dto.imagingRequests : undefined,
                analysisRequests: dto.analysisRequests?.length ? dto.analysisRequests : undefined,
            });
            const saved = (await this.repo.save(entity));
            try {
                const qrCode = await this.qrCodesService.generateOrdonnanceQr(saved.id, {
                    patientId: patientId ?? '',
                    patientName: dto.patientName ?? '',
                    patientNss: dto.patientNss ?? '',
                    medecinRpps: dto.medecinRpps ?? '',
                    medecinName: dto.medecinName ?? '',
                });
                await this.repo.update(saved.id, { qrCode });
                if (dto.pin) {
                    const realSignature = this.generateElectronicSignature(saved.id, dto.doctorId, dto.patientId, dto.medications ?? [], dto.pin, now);
                    await this.repo.update(saved.id, {
                        electronicSignature: realSignature,
                        signatureImage: dto.signatureImage || undefined,
                    });
                }
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
            try {
                await this.dataSource.query(`INSERT INTO dossier_historique
             (id, patient_id, modifie_par_id, role_auteur, champs_modifies, snapshot_avant, commentaire, created_at)
           VALUES (gen_random_uuid(), $1, $2, 'MEDECIN', $3::jsonb, '{}'::jsonb, $4, NOW())`, [
                    patientId,
                    dto.doctorId,
                    JSON.stringify({
                        ordonnance_creee: {
                            avant: null,
                            apres: {
                                prescriptionId: saved.id,
                                medicaments: (dto.medications ?? []).map((m) => m.name),
                                medecinName: dto.medecinName,
                            },
                        },
                    }),
                    `Ordonnance créée — ${(dto.medications ?? []).map((m) => m.name).join(', ')}`,
                ]);
            }
            catch (auditErr) {
                console.warn('[PrescriptionsService] Audit log failed:', auditErr?.message);
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
                relations: ['doctor'],
            });
        }
        catch (err) {
            console.warn('[PrescriptionsService] findByPatient error:', err?.message);
            try {
                return await this.repo.find({ where: { patientId }, order: { createdAt: 'DESC' } });
            }
            catch {
                return [];
            }
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
    async envoyerOrdonnance(id, patientEmail) {
        const prescription = await this.findOne(id);
        try {
            await this.emailService.sendPrescriptionEmail(patientEmail, prescription);
        }
        catch (err) {
            console.warn('[PrescriptionsService] Envoi email ordonnance échoué:', err?.message);
        }
        await this.repo.update(id, { emailSentAt: new Date() });
        return this.findOne(id);
    }
};
exports.PrescriptionsService = PrescriptionsService;
exports.PrescriptionsService = PrescriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(prescription_entity_1.Prescription)),
    __param(1, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        qr_codes_service_1.QrCodesService,
        interaction_checker_service_1.InteractionCheckerService,
        pdf_service_1.PdfService,
        email_service_1.EmailService])
], PrescriptionsService);
//# sourceMappingURL=prescriptions.service.js.map
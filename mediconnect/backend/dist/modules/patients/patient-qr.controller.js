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
exports.PatientQrController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const qr_code_service_1 = require("./qr-code.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_entity_1 = require("./entities/patient.entity");
const PDFDocument = require("pdfkit");
let PatientQrController = class PatientQrController {
    constructor(qrCodeService, patientRepository) {
        this.qrCodeService = qrCodeService;
        this.patientRepository = patientRepository;
    }
    async getPublicPatientInfo(token) {
        try {
            const decoded = Buffer.from(token, "base64url").toString("utf-8");
            const parts = decoded.split(":");
            if (parts.length < 3)
                return { valid: false };
            const [patientId, userId, signature] = parts;
            const verify = this.qrCodeService.verifyQrCode(`MEDICONNECT:PAT:${patientId}:${userId}:${signature}`);
            if (!verify.valid)
                return { valid: false, message: "QR code invalide" };
            const patient = await this.patientRepository.findOne({
                where: { id: patientId },
                relations: ["user"],
            });
            if (!patient)
                return { valid: false, message: "Patient introuvable" };
            return {
                valid: true,
                patient: {
                    nom: patient.user?.lastName ?? '',
                    prenom: patient.user?.firstName ?? '',
                    dateNaissance: patient.dateNaissance,
                    sexe: patient.sexe,
                    telephone: patient.user?.phone ?? '',
                    groupeSanguin: patient.groupeSanguin,
                    allergies: patient.allergies,
                    maladiesChroniques: patient.maladiesChroniques,
                }
            };
        }
        catch {
            return { valid: false, message: "Token invalide" };
        }
    }
    async getQrCode(req) {
        const userId = req.user.id;
        const patient = await this.patientRepository.findOne({ where: { userId } });
        if (!patient)
            return { error: "Profil patient non trouvé" };
        const qrData = this.qrCodeService.generateQrData(patient.id, userId);
        const qrImage = await this.qrCodeService.generateQrImage(qrData);
        return {
            qrData,
            qrImage,
            patientId: patient.id,
            displayId: `QR-PAT-${patient.id.substring(0, 8).toUpperCase()}`,
        };
    }
    async downloadQrPdf(req, res) {
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
        const firstName = patient.user?.firstName || "Patient";
        const lastName = patient.user?.lastName || "";
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
};
exports.PatientQrController = PatientQrController;
__decorate([
    (0, common_1.Get)("public/:token"),
    (0, swagger_1.ApiOperation)({ summary: "Page publique QR code patient" }),
    __param(0, (0, common_1.Param)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PatientQrController.prototype, "getPublicPatientInfo", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "US6 - Obtenir le QR code patient" }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientQrController.prototype, "getQrCode", null);
__decorate([
    (0, common_1.Get)("pdf"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "US7 - Télécharger QR code en PDF" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PatientQrController.prototype, "downloadQrPdf", null);
exports.PatientQrController = PatientQrController = __decorate([
    (0, swagger_1.ApiTags)("patient-qr"),
    (0, common_1.Controller)("patient/qr"),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [qr_code_service_1.QrCodeService,
        typeorm_2.Repository])
], PatientQrController);
//# sourceMappingURL=patient-qr.controller.js.map
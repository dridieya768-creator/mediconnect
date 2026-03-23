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
exports.QrCodesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const QRCode = require("qrcode");
const uuid_1 = require("uuid");
const qr_code_entity_1 = require("./entities/qr-code.entity");
let QrCodesService = class QrCodesService {
    constructor(qrRepository, jwtService) {
        this.qrRepository = qrRepository;
        this.jwtService = jwtService;
    }
    async generatePatientQr(patientId, patientInfo) {
        const qrCode = `QR-PAT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        const payload = {
            type: qr_code_entity_1.QrCodeType.PATIENT,
            qr_id: (0, uuid_1.v4)(),
            patient_id: patientId,
            patient_name: patientInfo.fullName ?? "",
            patient_nss: patientInfo.nss ?? "",
            iat: Math.floor(Date.now() / 1000),
        };
        const jwtToken = this.jwtService.sign(payload);
        await this.qrRepository.save(this.qrRepository.create({ qrCode, qrType: qr_code_entity_1.QrCodeType.PATIENT, entityId: patientId, jwtToken }));
        return qrCode;
    }
    async generateOrdonnanceQr(prescriptionId, data) {
        const qrCode = `QR-ORD-${(0, uuid_1.v4)().split("-")[0].toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 3);
        const payload = {
            type: qr_code_entity_1.QrCodeType.ORDONNANCE,
            qr_id: (0, uuid_1.v4)(),
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
        const jwtToken = this.jwtService.sign(payload, { expiresIn: "90d" });
        await this.qrRepository.save(this.qrRepository.create({ qrCode, qrType: qr_code_entity_1.QrCodeType.ORDONNANCE, entityId: prescriptionId, jwtToken, expiresAt }));
        return qrCode;
    }
    async scanQr(qrCode, scannedBy) {
        const qrRecord = await this.qrRepository.findOne({ where: { qrCode } });
        if (!qrRecord)
            throw new common_1.NotFoundException("QR code introuvable");
        if (qrRecord.status === qr_code_entity_1.QrCodeStatus.REVOKED)
            throw new common_1.BadRequestException("QR code révoqué");
        if (qrRecord.status === qr_code_entity_1.QrCodeStatus.EXPIRED)
            throw new common_1.BadRequestException("QR code expiré");
        if (qrRecord.expiresAt && new Date() > qrRecord.expiresAt) {
            await this.qrRepository.update(qrRecord.id, { status: qr_code_entity_1.QrCodeStatus.EXPIRED });
            throw new common_1.BadRequestException("QR code expiré");
        }
        let data;
        try {
            data = this.jwtService.verify(qrRecord.jwtToken);
        }
        catch {
            throw new common_1.BadRequestException("Signature QR invalide");
        }
        await this.qrRepository.update(qrRecord.id, { scanCount: qrRecord.scanCount + 1, lastScanAt: new Date() });
        return { valid: true, data, qrRecord };
    }
    async generateQrImage(qrCode) {
        return new Promise((resolve, reject) => {
            QRCode.toDataURL(qrCode, {
                errorCorrectionLevel: "M",
                margin: 2,
                color: { dark: "#0f172a", light: "#ffffff" },
            }, (err, url) => {
                if (err)
                    reject(err);
                else
                    resolve(url);
            });
        });
    }
    async revokeQr(qrCode) {
        const qr = await this.qrRepository.findOne({ where: { qrCode } });
        if (!qr)
            throw new common_1.NotFoundException("QR code introuvable");
        await this.qrRepository.update(qr.id, { status: qr_code_entity_1.QrCodeStatus.REVOKED });
    }
};
exports.QrCodesService = QrCodesService;
exports.QrCodesService = QrCodesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(qr_code_entity_1.QrCode)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], QrCodesService);
//# sourceMappingURL=qr-codes.service.js.map
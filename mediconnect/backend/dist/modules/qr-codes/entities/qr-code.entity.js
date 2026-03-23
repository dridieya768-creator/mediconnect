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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrCode = exports.QrCodeStatus = exports.QrCodeType = void 0;
const typeorm_1 = require("typeorm");
var QrCodeType;
(function (QrCodeType) {
    QrCodeType["PATIENT"] = "PATIENT";
    QrCodeType["MEDECIN"] = "MEDECIN";
    QrCodeType["ORDONNANCE"] = "ORDONNANCE";
    QrCodeType["ANALYSE"] = "ANALYSE";
    QrCodeType["IMAGERIE"] = "IMAGERIE";
    QrCodeType["TUBE"] = "TUBE";
    QrCodeType["DICOM"] = "DICOM";
})(QrCodeType || (exports.QrCodeType = QrCodeType = {}));
var QrCodeStatus;
(function (QrCodeStatus) {
    QrCodeStatus["ACTIVE"] = "ACTIVE";
    QrCodeStatus["USED"] = "USED";
    QrCodeStatus["EXPIRED"] = "EXPIRED";
    QrCodeStatus["REVOKED"] = "REVOKED";
})(QrCodeStatus || (exports.QrCodeStatus = QrCodeStatus = {}));
let QrCode = class QrCode {
};
exports.QrCode = QrCode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], QrCode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_code', unique: true }),
    __metadata("design:type", String)
], QrCode.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: QrCodeType, name: 'qr_type' }),
    __metadata("design:type", String)
], QrCode.prototype, "qrType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id' }),
    __metadata("design:type", String)
], QrCode.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'jwt_token', type: 'text' }),
    __metadata("design:type", String)
], QrCode.prototype, "jwtToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: QrCodeStatus, default: QrCodeStatus.ACTIVE }),
    __metadata("design:type", String)
], QrCode.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scan_count', default: 0 }),
    __metadata("design:type", Number)
], QrCode.prototype, "scanCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_scan_at', nullable: true }),
    __metadata("design:type", Date)
], QrCode.prototype, "lastScanAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', nullable: true }),
    __metadata("design:type", Date)
], QrCode.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], QrCode.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], QrCode.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], QrCode.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], QrCode.prototype, "updatedAt", void 0);
exports.QrCode = QrCode = __decorate([
    (0, typeorm_1.Entity)('qr_codes')
], QrCode);
//# sourceMappingURL=qr-code.entity.js.map
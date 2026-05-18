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
exports.Prescription = exports.PrescriptionStatus = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("../../patients/entities/patient.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var PrescriptionStatus;
(function (PrescriptionStatus) {
    PrescriptionStatus["ACTIVE"] = "ACTIVE";
    PrescriptionStatus["PARTIALLY_USED"] = "PARTIALLY_USED";
    PrescriptionStatus["FULLY_USED"] = "FULLY_USED";
    PrescriptionStatus["EXPIRED"] = "EXPIRED";
    PrescriptionStatus["REVOKED"] = "REVOKED";
})(PrescriptionStatus || (exports.PrescriptionStatus = PrescriptionStatus = {}));
let Prescription = class Prescription {
};
exports.Prescription = Prescription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Prescription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], Prescription.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id' }),
    __metadata("design:type", String)
], Prescription.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'doctor_id' }),
    __metadata("design:type", user_entity_1.User)
], Prescription.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doctor_id' }),
    __metadata("design:type", String)
], Prescription.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_code', unique: true }),
    __metadata("design:type", String)
], Prescription.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_jwt', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "qrJwt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PrescriptionStatus, default: PrescriptionStatus.ACTIVE }),
    __metadata("design:type", String)
], Prescription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medications', type: 'jsonb' }),
    __metadata("design:type", Array)
], Prescription.prototype, "medications", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appointment_id', nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pdf_url', nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "pdfUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_sent_at', nullable: true }),
    __metadata("design:type", Date)
], Prescription.prototype, "emailSentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'issued_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Prescription.prototype, "issuedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Prescription.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signed_at', nullable: true }),
    __metadata("design:type", Date)
], Prescription.prototype, "signedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'electronic_signature', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Prescription.prototype, "electronicSignature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signature_image', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Prescription.prototype, "signatureImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'imaging_requests', type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Prescription.prototype, "imagingRequests", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'analysis_requests', type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Prescription.prototype, "analysisRequests", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Prescription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Prescription.prototype, "updatedAt", void 0);
exports.Prescription = Prescription = __decorate([
    (0, typeorm_1.Entity)('prescriptions')
], Prescription);
//# sourceMappingURL=prescription.entity.js.map
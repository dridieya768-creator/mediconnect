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
exports.DoctorPatient = void 0;
const typeorm_1 = require("typeorm");
let DoctorPatient = class DoctorPatient {
};
exports.DoctorPatient = DoctorPatient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DoctorPatient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doctor_id', type: 'uuid' }),
    __metadata("design:type", String)
], DoctorPatient.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], DoctorPatient.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'ACTIVE' }),
    __metadata("design:type", String)
], DoctorPatient.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'added_at' }),
    __metadata("design:type", Date)
], DoctorPatient.prototype, "addedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DoctorPatient.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DoctorPatient.prototype, "updatedAt", void 0);
exports.DoctorPatient = DoctorPatient = __decorate([
    (0, typeorm_1.Entity)('doctor_patients')
], DoctorPatient);
//# sourceMappingURL=doctor-patient.entity.js.map
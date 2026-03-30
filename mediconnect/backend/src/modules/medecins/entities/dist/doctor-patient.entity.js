"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DoctorPatient = void 0;
var typeorm_1 = require("typeorm");
var DoctorPatient = /** @class */ (function () {
    function DoctorPatient() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn('uuid')
    ], DoctorPatient.prototype, "id");
    __decorate([
        typeorm_1.Column({ name: 'doctor_id', type: 'uuid' })
    ], DoctorPatient.prototype, "doctorId");
    __decorate([
        typeorm_1.Column({ name: 'patient_id', type: 'uuid' })
    ], DoctorPatient.prototype, "patientId");
    __decorate([
        typeorm_1.Column({ "default": 'ACTIVE' })
    ], DoctorPatient.prototype, "status");
    __decorate([
        typeorm_1.CreateDateColumn({ name: 'added_at' })
    ], DoctorPatient.prototype, "addedAt");
    __decorate([
        typeorm_1.Column({ type: 'jsonb', nullable: true })
    ], DoctorPatient.prototype, "notes");
    __decorate([
        typeorm_1.UpdateDateColumn({ name: 'updated_at' })
    ], DoctorPatient.prototype, "updatedAt");
    DoctorPatient = __decorate([
        typeorm_1.Entity('doctor_patients')
    ], DoctorPatient);
    return DoctorPatient;
}());
exports.DoctorPatient = DoctorPatient;

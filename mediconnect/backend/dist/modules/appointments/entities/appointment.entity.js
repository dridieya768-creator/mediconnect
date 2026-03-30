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
exports.Appointment = exports.ConsultationType = exports.AppointmentStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["REQUESTED"] = "REQUESTED";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var ConsultationType;
(function (ConsultationType) {
    ConsultationType["PHYSICAL"] = "PHYSICAL";
    ConsultationType["TELECONSULTATION"] = "TELECONSULTATION";
    ConsultationType["HOME_VISIT"] = "HOME_VISIT";
})(ConsultationType || (exports.ConsultationType = ConsultationType = {}));
let Appointment = class Appointment {
};
exports.Appointment = Appointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Appointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "patient_id", type: "uuid", nullable: false }),
    __metadata("design:type", String)
], Appointment.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: "patient_id" }),
    __metadata("design:type", user_entity_1.User)
], Appointment.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "doctor_id" }),
    __metadata("design:type", String)
], Appointment.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: "doctor_id" }),
    __metadata("design:type", user_entity_1.User)
], Appointment.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamptz", name: "appointment_date" }),
    __metadata("design:type", Date)
], Appointment.prototype, "appointmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 30, name: "duration_minutes" }),
    __metadata("design:type", Number)
], Appointment.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ConsultationType,
        default: ConsultationType.PHYSICAL,
        name: "consultation_type",
    }),
    __metadata("design:type", String)
], Appointment.prototype, "consultationType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AppointmentStatus,
        default: AppointmentStatus.REQUESTED,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "cancellation_reason" }),
    __metadata("design:type", String)
], Appointment.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "video_room_id" }),
    __metadata("design:type", String)
], Appointment.prototype, "videoRoomId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, name: "reminder_sent" }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "reminderSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "rating_comment" }),
    __metadata("design:type", String)
], Appointment.prototype, "ratingComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "rated", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Appointment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Appointment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: "deleted_at" }),
    __metadata("design:type", Date)
], Appointment.prototype, "deletedAt", void 0);
exports.Appointment = Appointment = __decorate([
    (0, typeorm_1.Entity)("appointments"),
    (0, typeorm_1.Index)(["patientId", "appointmentDate"]),
    (0, typeorm_1.Index)(["doctorId", "appointmentDate"])
], Appointment);
//# sourceMappingURL=appointment.entity.js.map
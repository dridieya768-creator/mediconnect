"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Appointment = exports.ConsultationType = exports.AppointmentStatus = void 0;
var typeorm_1 = require("typeorm");
var user_entity_1 = require("../../users/entities/user.entity");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["REQUESTED"] = "REQUESTED";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(AppointmentStatus = exports.AppointmentStatus || (exports.AppointmentStatus = {}));
var ConsultationType;
(function (ConsultationType) {
    ConsultationType["PHYSICAL"] = "PHYSICAL";
    ConsultationType["TELECONSULTATION"] = "TELECONSULTATION";
    ConsultationType["HOME_VISIT"] = "HOME_VISIT";
})(ConsultationType = exports.ConsultationType || (exports.ConsultationType = {}));
var Appointment = /** @class */ (function () {
    function Appointment() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn("uuid")
    ], Appointment.prototype, "id");
    __decorate([
        typeorm_1.Column({ name: "patient_id", type: "uuid", nullable: false })
    ], Appointment.prototype, "patientId");
    __decorate([
        typeorm_1.ManyToOne(function () { return user_entity_1.User; }, { eager: false }),
        typeorm_1.JoinColumn({ name: "patient_id" })
    ], Appointment.prototype, "patient");
    __decorate([
        typeorm_1.Column({ name: "doctor_id" })
    ], Appointment.prototype, "doctorId");
    __decorate([
        typeorm_1.ManyToOne(function () { return user_entity_1.User; }, { eager: false }),
        typeorm_1.JoinColumn({ name: "doctor_id" })
    ], Appointment.prototype, "doctor");
    __decorate([
        typeorm_1.Column({ type: "timestamptz", name: "appointment_date" })
    ], Appointment.prototype, "appointmentDate");
    __decorate([
        typeorm_1.Column({ type: "int", "default": 30, name: "duration_minutes" })
    ], Appointment.prototype, "durationMinutes");
    __decorate([
        typeorm_1.Column({
            type: "enum",
            "enum": ConsultationType,
            "default": ConsultationType.PHYSICAL,
            name: "consultation_type"
        })
    ], Appointment.prototype, "consultationType");
    __decorate([
        typeorm_1.Column({
            type: "enum",
            "enum": AppointmentStatus,
            "default": AppointmentStatus.REQUESTED
        })
    ], Appointment.prototype, "status");
    __decorate([
        typeorm_1.Column({ nullable: true })
    ], Appointment.prototype, "reason");
    __decorate([
        typeorm_1.Column({ nullable: true })
    ], Appointment.prototype, "notes");
    __decorate([
        typeorm_1.Column({ nullable: true, name: "cancellation_reason" })
    ], Appointment.prototype, "cancellationReason");
    __decorate([
        typeorm_1.Column({ nullable: true, name: "video_room_id" })
    ], Appointment.prototype, "videoRoomId");
    __decorate([
        typeorm_1.Column({ type: "boolean", "default": false, name: "reminder_sent" })
    ], Appointment.prototype, "reminderSent");
    __decorate([
        typeorm_1.Column({ type: "int", nullable: true })
    ], Appointment.prototype, "rating");
    __decorate([
        typeorm_1.Column({ nullable: true, name: "rating_comment" })
    ], Appointment.prototype, "ratingComment");
    __decorate([
        typeorm_1.Column({ type: "boolean", "default": false })
    ], Appointment.prototype, "rated");
    __decorate([
        typeorm_1.CreateDateColumn({ name: "created_at" })
    ], Appointment.prototype, "createdAt");
    __decorate([
        typeorm_1.UpdateDateColumn({ name: "updated_at" })
    ], Appointment.prototype, "updatedAt");
    __decorate([
        typeorm_1.DeleteDateColumn({ name: "deleted_at" })
    ], Appointment.prototype, "deletedAt");
    Appointment = __decorate([
        typeorm_1.Entity("appointments"),
        typeorm_1.Index(["patientId", "appointmentDate"]),
        typeorm_1.Index(["doctorId", "appointmentDate"])
    ], Appointment);
    return Appointment;
}());
exports.Appointment = Appointment;

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Notification = exports.NotificationType = void 0;
// src/notifications/entities/notification.entity.ts
var typeorm_1 = require("typeorm");
var user_entity_1 = require("../users/entities/user.entity");
var NotificationType;
(function (NotificationType) {
    NotificationType["APPOINTMENT_CONFIRMED"] = "APPOINTMENT_CONFIRMED";
    NotificationType["APPOINTMENT_CANCELLED"] = "APPOINTMENT_CANCELLED";
    NotificationType["DOCTOR_PENDING_APPROVAL"] = "DOCTOR_PENDING_APPROVAL";
    NotificationType["DOCTOR_APPROVED"] = "DOCTOR_APPROVED";
    NotificationType["DOCTOR_REJECTED"] = "DOCTOR_REJECTED";
    // ✅ nouveau
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
var Notification = /** @class */ (function () {
    function Notification() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn("uuid")
    ], Notification.prototype, "id");
    __decorate([
        typeorm_1.Column({ name: "user_id" })
    ], Notification.prototype, "userId");
    __decorate([
        typeorm_1.ManyToOne(function () { return user_entity_1.User; }, { eager: false }),
        typeorm_1.JoinColumn({ name: "user_id" })
    ], Notification.prototype, "user");
    __decorate([
        typeorm_1.Column({ type: "enum", "enum": NotificationType })
    ], Notification.prototype, "type");
    __decorate([
        typeorm_1.Column()
    ], Notification.prototype, "title");
    __decorate([
        typeorm_1.Column()
    ], Notification.prototype, "message");
    __decorate([
        typeorm_1.Column({ type: "boolean", "default": false, name: "is_read" })
    ], Notification.prototype, "isRead");
    __decorate([
        typeorm_1.Column({ nullable: true, name: "related_id" })
    ], Notification.prototype, "relatedId");
    __decorate([
        typeorm_1.CreateDateColumn({ name: "created_at" })
    ], Notification.prototype, "createdAt");
    Notification = __decorate([
        typeorm_1.Entity("notifications")
    ], Notification);
    return Notification;
}());
exports.Notification = Notification;

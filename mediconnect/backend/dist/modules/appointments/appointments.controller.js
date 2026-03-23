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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const appointments_service_1 = require("./appointments.service");
const create_appointment_dto_1 = require("././dto/create-appointment.dto");
const cancel_appointment_dto_1 = require("././dto/cancel-appointment.dto");
const rate_appointment_dto_1 = require("././dto/rate-appointment.dto");
let AppointmentsController = class AppointmentsController {
    constructor(svc) {
        this.svc = svc;
    }
    create(dto) {
        return this.svc.create(dto);
    }
    getByPatient(patientId) {
        return this.svc.findByPatient(patientId);
    }
    getByDoctor(doctorId, date) {
        return this.svc.findByDoctor(doctorId, date);
    }
    confirm(id) {
        return this.svc.confirm(id);
    }
    cancel(id, dto) {
        return this.svc.cancel(id, dto?.reason || "");
    }
    complete(id, notes) {
        return this.svc.complete(id, notes);
    }
    rate(id, dto) {
        return this.svc.rate(id, dto);
    }
    generateVideoRoom(id) {
        return this.svc.generateVideoRoom(id);
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Créer un rendez-vous" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_appointment_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("patient/:patientId"),
    (0, swagger_1.ApiOperation)({ summary: "RDV d'un patient" }),
    __param(0, (0, common_1.Param)("patientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "getByPatient", null);
__decorate([
    (0, common_1.Get)("doctor/:doctorId"),
    (0, swagger_1.ApiOperation)({ summary: "RDV d'un médecin" }),
    __param(0, (0, common_1.Param)("doctorId")),
    __param(1, (0, common_1.Query)("date")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "getByDoctor", null);
__decorate([
    (0, common_1.Patch)(":id/confirm"),
    (0, swagger_1.ApiOperation)({ summary: "Confirmer un RDV" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(":id/cancel"),
    (0, swagger_1.ApiOperation)({ summary: "Annuler un RDV" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_appointment_dto_1.CancelAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(":id/complete"),
    (0, swagger_1.ApiOperation)({ summary: "Marquer un RDV comme terminé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("notes")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(":id/rate"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: "Évaluer une consultation" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rate_appointment_dto_1.RateAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "rate", null);
__decorate([
    (0, common_1.Post)(":id/video-room"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: "Générer un lien Jitsi Meet" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "generateVideoRoom", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, swagger_1.ApiTags)("appointments"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("appointments"),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map
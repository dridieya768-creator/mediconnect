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
exports.PrescriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const prescriptions_service_1 = require("./prescriptions.service");
let PrescriptionsController = class PrescriptionsController {
    constructor(prescriptionsService) {
        this.prescriptionsService = prescriptionsService;
    }
    create(dto) {
        return this.prescriptionsService.create(dto);
    }
    checkInteractions(body) {
        return this.prescriptionsService.checkInteractions(body.medications ?? []);
    }
    findByPatient(patientId) {
        return this.prescriptionsService.findByPatient(patientId);
    }
    findByQrCode(qrCode) {
        return this.prescriptionsService.findByQrCode(qrCode);
    }
    findOne(id) {
        return this.prescriptionsService.findOne(id);
    }
    scanAtPharmacy(body) {
        return this.prescriptionsService.scanAtPharmacy(body.qrCode, body.dispensedQuantities);
    }
    sign(id, body) {
        return this.prescriptionsService.signPrescription(id, body.signature);
    }
};
exports.PrescriptionsController = PrescriptionsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Créer une ordonnance (médecin)" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)("check-interactions"),
    (0, swagger_1.ApiOperation)({ summary: "Vérifier les interactions médicamenteuses" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "checkInteractions", null);
__decorate([
    (0, common_1.Get)("patient/:patientId"),
    (0, swagger_1.ApiOperation)({ summary: "Ordonnances d\'un patient" }),
    __param(0, (0, common_1.Param)("patientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)("qr/:qrCode"),
    (0, swagger_1.ApiOperation)({ summary: "Trouver une ordonnance par QR code" }),
    __param(0, (0, common_1.Param)("qrCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "findByQrCode", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)("scan-pharmacy"),
    (0, swagger_1.ApiOperation)({ summary: "Scanner ordonnance en pharmacie" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "scanAtPharmacy", null);
__decorate([
    (0, common_1.Post)(":id/sign"),
    (0, swagger_1.ApiOperation)({ summary: "Signer électroniquement une ordonnance" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "sign", null);
exports.PrescriptionsController = PrescriptionsController = __decorate([
    (0, swagger_1.ApiTags)("prescriptions"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, common_1.Controller)("prescriptions"),
    __metadata("design:paramtypes", [prescriptions_service_1.PrescriptionsService])
], PrescriptionsController);
//# sourceMappingURL=prescriptions.controller.js.map
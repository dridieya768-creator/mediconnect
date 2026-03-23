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
exports.QrCodesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const qr_codes_service_1 = require("./qr-codes.service");
let QrCodesController = class QrCodesController {
    constructor(qrCodesService) {
        this.qrCodesService = qrCodesService;
    }
    scan(body) {
        return this.qrCodesService.scanQr(body.qrCode, body.scannedBy);
    }
    getImage(qrCode) {
        return this.qrCodesService.generateQrImage(qrCode);
    }
    revoke(qrCode) {
        return this.qrCodesService.revokeQr(qrCode);
    }
};
exports.QrCodesController = QrCodesController;
__decorate([
    (0, common_1.Post)("scan"),
    (0, swagger_1.ApiOperation)({ summary: "Scanner un QR code (retourne les données décodées)" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], QrCodesController.prototype, "scan", null);
__decorate([
    (0, common_1.Get)("image/:qrCode"),
    (0, swagger_1.ApiOperation)({ summary: "Générer image PNG du QR code (base64)" }),
    __param(0, (0, common_1.Param)("qrCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QrCodesController.prototype, "getImage", null);
__decorate([
    (0, common_1.Post)("revoke/:qrCode"),
    (0, swagger_1.ApiOperation)({ summary: "Révoquer un QR code" }),
    __param(0, (0, common_1.Param)("qrCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QrCodesController.prototype, "revoke", null);
exports.QrCodesController = QrCodesController = __decorate([
    (0, swagger_1.ApiTags)("qr-codes"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, common_1.Controller)("qr-codes"),
    __metadata("design:paramtypes", [qr_codes_service_1.QrCodesService])
], QrCodesController);
//# sourceMappingURL=qr-codes.controller.js.map
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
exports.DelivranceController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const delivrance_service_1 = require("./delivrance.service");
const scan_qr_ord_dto_1 = require("./dto/scan-qr-ord.dto");
const scan_med_cip_dto_1 = require("./dto/scan-med-cip.dto");
const confirmer_delivrance_dto_1 = require("./dto/confirmer-delivrance.dto");
let DelivranceController = class DelivranceController {
    constructor(delivranceService) {
        this.delivranceService = delivranceService;
    }
    scanQrOrd(dto, user) {
        return this.delivranceService.scanQrOrd(dto, user.id);
    }
    scanMedCip(dto, user) {
        return this.delivranceService.scanMedCip(dto, {});
    }
    confirmerDelivrance(dto, user) {
        return this.delivranceService.confirmerDelivrance(dto, user.id);
    }
};
exports.DelivranceController = DelivranceController;
__decorate([
    (0, common_1.Post)('scan-qr-ord'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scan_qr_ord_dto_1.ScanQrOrdDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], DelivranceController.prototype, "scanQrOrd", null);
__decorate([
    (0, common_1.Post)('scan-med-cip'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scan_med_cip_dto_1.ScanMedCipDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], DelivranceController.prototype, "scanMedCip", null);
__decorate([
    (0, common_1.Post)('confirmer-delivrance'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirmer_delivrance_dto_1.ConfirmerDelivranceDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], DelivranceController.prototype, "confirmerDelivrance", null);
exports.DelivranceController = DelivranceController = __decorate([
    (0, common_1.Controller)('pharmacie'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PHARMACIEN),
    __metadata("design:paramtypes", [delivrance_service_1.DelivranceService])
], DelivranceController);
//# sourceMappingURL=delivrance.controller.js.map
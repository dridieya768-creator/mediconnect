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
exports.PartageLienController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const partage_lien_service_1 = require("./partage-lien.service");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_entity_1 = require("../patients/entities/patient.entity");
class PermissionsDto {
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "allergies", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "maladiesChroniques", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "medicamentsActuels", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "documents", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "observations", void 0);
class GenererLienDto {
}
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_transformer_1.Type)(() => PermissionsDto),
    __metadata("design:type", PermissionsDto)
], GenererLienDto.prototype, "permissions", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(168),
    __metadata("design:type", Number)
], GenererLienDto.prototype, "dureeHeures", void 0);
let PartageLienController = class PartageLienController {
    constructor(partageLienService, patientRepo) {
        this.partageLienService = partageLienService;
        this.patientRepo = patientRepo;
    }
    async genererLien(dto, req) {
        const userId = req.user?.sub ?? req.user?.id;
        const patient = await this.patientRepo.findOne({ where: { userId } });
        if (!patient) {
            throw new common_1.InternalServerErrorException('Profil patient introuvable pour cet utilisateur');
        }
        return this.partageLienService.genererLien(patient.id, dto.permissions, dto.dureeHeures);
    }
    async accederVieLien(token) {
        if (!token) {
            return { error: 'Token manquant' };
        }
        return this.partageLienService.accederVieLien(token);
    }
};
exports.PartageLienController = PartageLienController;
__decorate([
    (0, common_1.Post)('generer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenererLienDto, Object]),
    __metadata("design:returntype", Promise)
], PartageLienController.prototype, "genererLien", null);
__decorate([
    (0, common_1.Get)('acceder'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PartageLienController.prototype, "accederVieLien", null);
exports.PartageLienController = PartageLienController = __decorate([
    (0, common_1.Controller)('dossier-medical/partage'),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [partage_lien_service_1.PartageLienService,
        typeorm_2.Repository])
], PartageLienController);
//# sourceMappingURL=partage-lien.controller.js.map
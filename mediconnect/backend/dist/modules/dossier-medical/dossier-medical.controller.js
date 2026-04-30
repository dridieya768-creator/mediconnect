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
exports.DossierMedicalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const dossier_medical_service_1 = require("./dossier-medical.service");
const dossier_historique_service_1 = require("./dossier-historique.service");
const dossier_acces_service_1 = require("./dossier-acces.service");
const dossier_acces_medecin_entity_1 = require("./entities/dossier-acces-medecin.entity");
const create_acces_dto_1 = require("./dto/create-acces.dto");
const update_acces_dto_1 = require("./dto/update-acces.dto");
const historique_query_dto_1 = require("./dto/historique-query.dto");
const update_dossier_dto_1 = require("./dto/update-dossier.dto");
let DossierMedicalController = class DossierMedicalController {
    constructor(dossierService, historiqueService, accesService) {
        this.dossierService = dossierService;
        this.historiqueService = historiqueService;
        this.accesService = accesService;
    }
    getDemandeurId(req) {
        return req.user?.sub ?? req.user?.id;
    }
    getDemandeurRole(req) {
        return req.user?.role ?? '';
    }
    getDossier(patientId, req) {
        return this.dossierService.getDossier(patientId, this.getDemandeurId(req), this.getDemandeurRole(req));
    }
    updateDossier(patientId, body, req) {
        return this.dossierService.updateDossierParMedecin(patientId, this.getDemandeurId(req), body);
    }
    async getHistorique(patientId, query, req) {
        const demandeurId = this.getDemandeurId(req);
        const role = this.getDemandeurRole(req);
        const patient = await this.dossierService.getDossier(patientId, demandeurId, role);
        const isProprietaire = patient.userId === demandeurId;
        if (!isProprietaire) {
            await this.accesService.verifierAcces(patientId, demandeurId, dossier_acces_medecin_entity_1.NiveauAcces.ACCES_COMPLET);
        }
        return this.historiqueService.getHistorique(patientId, query);
    }
    async getMyPermissions(patientId, req) {
        const medecinId = this.getDemandeurId(req);
        return this.accesService.getPermissionsMedecin(patientId, medecinId);
    }
    async listerAcces(patientId, req) {
        await this.verifierProprietaire(patientId, req);
        return this.accesService.listerAcces(patientId);
    }
    async accorderAcces(patientId, dto, req) {
        await this.verifierProprietaire(patientId, req);
        return this.accesService.accorderAcces(patientId, this.getDemandeurId(req), dto);
    }
    async modifierAcces(patientId, accesId, dto, req) {
        await this.verifierProprietaire(patientId, req);
        return this.accesService.modifierAcces(accesId, patientId, dto);
    }
    async revoquerAcces(patientId, accesId, req) {
        await this.verifierProprietaire(patientId, req);
        return this.accesService.revoquerAcces(accesId, patientId);
    }
    async verifierProprietaire(patientId, req) {
        const demandeurId = this.getDemandeurId(req);
        const patient = await this.dossierService.getPatientDirect(patientId);
        if (!patient || patient.userId !== demandeurId) {
            throw new common_1.ForbiddenException('Accès réservé au patient propriétaire');
        }
    }
};
exports.DossierMedicalController = DossierMedicalController;
__decorate([
    (0, common_1.Get)(':patientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Consulter le dossier médical d\'un patient' }),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DossierMedicalController.prototype, "getDossier", null);
__decorate([
    (0, common_1.Patch)(':patientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier le dossier médical (médecin autorisé)' }),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_dossier_dto_1.UpdateDossierDto, Object]),
    __metadata("design:returntype", void 0)
], DossierMedicalController.prototype, "updateDossier", null);
__decorate([
    (0, common_1.Get)(':patientId/historique'),
    (0, swagger_1.ApiOperation)({ summary: 'Historique des modifications du dossier' }),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, historique_query_dto_1.HistoriqueQueryDto, Object]),
    __metadata("design:returntype", Promise)
], DossierMedicalController.prototype, "getHistorique", null);
__decorate([
    (0, common_1.Get)(':patientId/acces/my-permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les permissions du médecin connecté pour ce patient' }),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DossierMedicalController.prototype, "getMyPermissions", null);
__decorate([
    (0, common_1.Get)(':patientId/acces'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les accès médecins au dossier' }),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DossierMedicalController.prototype, "listerAcces", null);
__decorate([
    (0, common_1.Post)(':patientId/acces'),
    (0, swagger_1.ApiOperation)({ summary: 'Accorder l\'accès à un médecin' }),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_acces_dto_1.CreateAccesDto, Object]),
    __metadata("design:returntype", Promise)
], DossierMedicalController.prototype, "accorderAcces", null);
__decorate([
    (0, common_1.Patch)(':patientId/acces/:accesId'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un accès médecin' }),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('accesId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_acces_dto_1.UpdateAccesDto, Object]),
    __metadata("design:returntype", Promise)
], DossierMedicalController.prototype, "modifierAcces", null);
__decorate([
    (0, common_1.Delete)(':patientId/acces/:accesId'),
    (0, swagger_1.ApiOperation)({ summary: 'Révoquer l\'accès d\'un médecin' }),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('accesId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DossierMedicalController.prototype, "revoquerAcces", null);
exports.DossierMedicalController = DossierMedicalController = __decorate([
    (0, swagger_1.ApiTags)('dossier-medical'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('dossier-medical'),
    __metadata("design:paramtypes", [dossier_medical_service_1.DossierMedicalService,
        dossier_historique_service_1.DossierHistoriqueService,
        dossier_acces_service_1.DossierAccesService])
], DossierMedicalController);
//# sourceMappingURL=dossier-medical.controller.js.map
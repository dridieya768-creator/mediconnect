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
exports.DossierHistoriqueInterceptor = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const operators_1 = require("rxjs/operators");
const patient_entity_1 = require("../../patients/entities/patient.entity");
const dossier_historique_service_1 = require("../dossier-historique.service");
let DossierHistoriqueInterceptor = class DossierHistoriqueInterceptor {
    constructor(historiqueService, patientRepo) {
        this.historiqueService = historiqueService;
        this.patientRepo = patientRepo;
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const patientId = request.params?.id;
        const userId = request.user?.sub ?? request.user?.id;
        const role = request.user?.role ?? 'PATIENT';
        const avant = patientId
            ? await this.patientRepo.findOne({ where: { id: patientId } })
            : null;
        return next.handle().pipe((0, operators_1.tap)(async (response) => {
            if (!avant || !patientId)
                return;
            const isSuccess = response?.success === true || response?.data !== undefined;
            if (!isSuccess)
                return;
            const apres = await this.patientRepo.findOne({ where: { id: patientId } });
            if (!apres)
                return;
            await this.historiqueService.createHistorique(patientId, userId, role, { ...avant }, { ...apres });
        }));
    }
};
exports.DossierHistoriqueInterceptor = DossierHistoriqueInterceptor;
exports.DossierHistoriqueInterceptor = DossierHistoriqueInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [dossier_historique_service_1.DossierHistoriqueService,
        typeorm_2.Repository])
], DossierHistoriqueInterceptor);
//# sourceMappingURL=dossier-historique.interceptor.js.map
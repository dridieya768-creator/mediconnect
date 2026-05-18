"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DossierMedicalModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const dossier_historique_entity_1 = require("./entities/dossier-historique.entity");
const dossier_acces_medecin_entity_1 = require("./entities/dossier-acces-medecin.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const dossier_medical_controller_1 = require("./dossier-medical.controller");
const dossier_medical_service_1 = require("./dossier-medical.service");
const dossier_historique_service_1 = require("./dossier-historique.service");
const dossier_acces_service_1 = require("./dossier-acces.service");
const dossier_historique_interceptor_1 = require("./interceptors/dossier-historique.interceptor");
const partage_lien_service_1 = require("./partage-lien.service");
const partage_lien_controller_1 = require("./partage-lien.controller");
const email_service_1 = require("../../common/services/email.service");
let DossierMedicalModule = class DossierMedicalModule {
};
exports.DossierMedicalModule = DossierMedicalModule;
exports.DossierMedicalModule = DossierMedicalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([dossier_historique_entity_1.DossierHistorique, dossier_acces_medecin_entity_1.DossierAccesMedecin, patient_entity_1.Patient]),
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET'),
                    signOptions: { expiresIn: '7d' },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [dossier_medical_controller_1.DossierMedicalController, partage_lien_controller_1.PartageLienController],
        providers: [
            dossier_medical_service_1.DossierMedicalService,
            dossier_historique_service_1.DossierHistoriqueService,
            dossier_acces_service_1.DossierAccesService,
            dossier_historique_interceptor_1.DossierHistoriqueInterceptor,
            partage_lien_service_1.PartageLienService,
            email_service_1.EmailService,
        ],
        exports: [dossier_historique_service_1.DossierHistoriqueService, dossier_acces_service_1.DossierAccesService, dossier_historique_interceptor_1.DossierHistoriqueInterceptor],
    })
], DossierMedicalModule);
//# sourceMappingURL=dossier-medical.module.js.map
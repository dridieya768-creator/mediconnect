"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const patients_controller_1 = require("./patients.controller");
const patients_service_1 = require("./patients.service");
const patient_qr_controller_1 = require("./patient-qr.controller");
const qr_code_service_1 = require("./qr-code.service");
const patient_entity_1 = require("./entities/patient.entity");
const medecins_module_1 = require("../medecins/medecins.module");
const user_entity_1 = require("../users/entities/user.entity");
let PatientsModule = class PatientsModule {
};
exports.PatientsModule = PatientsModule;
exports.PatientsModule = PatientsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            medecins_module_1.MedecinsModule,
            typeorm_1.TypeOrmModule.forFeature([
                patient_entity_1.Patient,
                user_entity_1.User,
            ]),
            config_1.ConfigModule,
        ],
        controllers: [patients_controller_1.PatientsController, patient_qr_controller_1.PatientQrController],
        providers: [patients_service_1.PatientsService, qr_code_service_1.QrCodeService],
        exports: [patients_service_1.PatientsService, qr_code_service_1.QrCodeService],
    })
], PatientsModule);
//# sourceMappingURL=patients.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedecinsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const medecins_controller_1 = require("./medecins.controller");
const medecins_service_1 = require("./medecins.service");
const user_entity_1 = require("../users/entities/user.entity");
const medecin_profile_entity_1 = require("./entities/medecin-profile.entity");
const doctor_patient_entity_1 = require("./entities/doctor-patient.entity");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const notifications_module_1 = require("../notifications/notifications.module");
const revenus_service_1 = require("./revenus.service");
let MedecinsModule = class MedecinsModule {
};
exports.MedecinsModule = MedecinsModule;
exports.MedecinsModule = MedecinsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, medecin_profile_entity_1.MedecinProfile, appointment_entity_1.Appointment, doctor_patient_entity_1.DoctorPatient, patient_entity_1.Patient]), notifications_module_1.NotificationsModule],
        controllers: [medecins_controller_1.MedecinsController],
        providers: [medecins_service_1.MedecinsService, revenus_service_1.RevenusService],
        exports: [medecins_service_1.MedecinsService],
    })
], MedecinsModule);
//# sourceMappingURL=medecins.module.js.map
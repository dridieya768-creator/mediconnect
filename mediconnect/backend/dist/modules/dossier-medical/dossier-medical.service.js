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
exports.DossierMedicalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_entity_1 = require("../patients/entities/patient.entity");
const dossier_historique_service_1 = require("./dossier-historique.service");
const dossier_acces_service_1 = require("./dossier-acces.service");
const dossier_acces_medecin_entity_1 = require("./entities/dossier-acces-medecin.entity");
let DossierMedicalService = class DossierMedicalService {
    constructor(patientRepo, historiqueService, accesService) {
        this.patientRepo = patientRepo;
        this.historiqueService = historiqueService;
        this.accesService = accesService;
    }
    async getPatientDirect(patientId) {
        return this.patientRepo.findOne({ where: { id: patientId } });
    }
    async getDossier(patientId, demandeurId, demandeurRole) {
        const patient = await this.patientRepo.findOne({ where: { id: patientId } });
        if (!patient)
            throw new common_1.NotFoundException('Patient introuvable');
        if (patient.userId === demandeurId || demandeurRole === 'ADMIN') {
            return patient;
        }
        if (demandeurRole?.includes('MEDECIN')) {
            const rdv = await this.patientRepo.manager.query(`SELECT id FROM appointments
         WHERE doctor_id = $1
           AND patient_id = $2
           AND status IN ('CONFIRMED','REQUESTED')
         LIMIT 1`, [demandeurId, patient.userId ?? patientId]);
            if (rdv?.length > 0)
                return patient;
        }
        await this.accesService.verifierAcces(patientId, demandeurId, dossier_acces_medecin_entity_1.NiveauAcces.LECTURE);
        return patient;
    }
    async updateDossierParMedecin(patientId, medecinId, updateData) {
        await this.accesService.verifierAcces(patientId, medecinId, dossier_acces_medecin_entity_1.NiveauAcces.LECTURE_ECRITURE);
        const patient = await this.patientRepo.findOne({ where: { id: patientId } });
        if (!patient)
            throw new common_1.NotFoundException('Patient introuvable');
        const snapshotAvant = { ...patient };
        Object.assign(patient, updateData);
        const updated = await this.patientRepo.save(patient);
        await this.historiqueService.createHistorique(patientId, medecinId, 'MEDECIN', snapshotAvant, { ...updated });
        return updated;
    }
};
exports.DossierMedicalService = DossierMedicalService;
exports.DossierMedicalService = DossierMedicalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        dossier_historique_service_1.DossierHistoriqueService,
        dossier_acces_service_1.DossierAccesService])
], DossierMedicalService);
//# sourceMappingURL=dossier-medical.service.js.map
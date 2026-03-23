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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_entity_1 = require("./entities/patient.entity");
let PatientsService = class PatientsService {
    constructor(patientsRepository) {
        this.patientsRepository = patientsRepository;
    }
    async findAll() {
        return this.patientsRepository.find({
            relations: ["user"],
            order: { createdAt: "DESC" },
        });
    }
    async findOne(id) {
        const patient = await this.patientsRepository.findOne({
            where: { id },
            relations: ["user"],
        });
        if (!patient)
            throw new common_1.NotFoundException(`Patient ${id} introuvable`);
        return patient;
    }
    async findByQrCode(qrCode) {
        const patient = await this.patientsRepository.findOne({
            where: { qrCode },
            relations: ["user"],
        });
        if (!patient)
            throw new common_1.NotFoundException("Code QR patient invalide");
        return patient;
    }
    async findByNss(nss) {
        const patient = await this.patientsRepository.findOne({
            where: { nss },
            relations: ["user"],
        });
        if (!patient)
            throw new common_1.NotFoundException("Patient introuvable");
        return patient;
    }
    async update(id, updateData) {
        await this.patientsRepository.update(id, updateData);
        return this.findOne(id);
    }
    async findByUserId(userId) {
        const patient = await this.patientsRepository.findOne({
            where: { userId },
            relations: ["user"],
        });
        if (!patient)
            throw new common_1.NotFoundException("Profil patient introuvable");
        return patient;
    }
    async getDossierMedical(patientId) {
        const patient = await this.findOne(patientId);
        return {
            patient,
            allergies: patient.allergies,
            maladiesChroniques: patient.maladiesChroniques,
            medicamentsActuels: patient.medicamentsActuels,
            groupeSanguin: patient.groupeSanguin,
            historiqueTeleconsultations: patient.historiqueTeleconsultations,
        };
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PatientsService);
//# sourceMappingURL=patients.service.js.map
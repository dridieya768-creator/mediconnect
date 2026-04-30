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
exports.PartageLienService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_entity_1 = require("../patients/entities/patient.entity");
let PartageLienService = class PartageLienService {
    constructor(jwtService, patientRepo) {
        this.jwtService = jwtService;
        this.patientRepo = patientRepo;
    }
    genererLien(patientId, permissions, dureeHeures) {
        const expiresAt = new Date(Date.now() + dureeHeures * 60 * 60 * 1000).toISOString();
        const payload = {
            type: 'PARTAGE_DOSSIER',
            patientId,
            permissions,
            expiresAt,
        };
        const token = this.jwtService.sign(payload, {
            expiresIn: `${dureeHeures}h`,
            secret: process.env.JWT_SECRET,
        });
        const lien = `${process.env.FRONTEND_URL ?? process.env.APP_URL ?? 'http://localhost:4200'}/partage-dossier?token=${token}`;
        return { token, lien, expiresAt };
    }
    async accederVieLien(token) {
        let payload;
        try {
            payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
        }
        catch {
            throw new common_1.BadRequestException('Lien invalide ou expiré');
        }
        if (payload.type !== 'PARTAGE_DOSSIER') {
            throw new common_1.BadRequestException('Type de lien invalide');
        }
        if (new Date(payload.expiresAt) < new Date()) {
            throw new common_1.BadRequestException('Ce lien de partage a expiré');
        }
        const patient = await this.patientRepo.findOne({
            where: { id: payload.patientId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient introuvable');
        const dossierFiltre = {
            id: patient.id,
            nom: patient.nom,
            prenom: patient.prenom,
            dateNaissance: patient.dateNaissance,
            sexe: patient.sexe,
            groupeSanguin: patient.groupeSanguin,
        };
        if (payload.permissions.allergies) {
            dossierFiltre.allergies = patient.allergies;
        }
        if (payload.permissions.maladiesChroniques) {
            dossierFiltre.maladiesChroniques = patient.maladiesChroniques;
        }
        if (payload.permissions.medicamentsActuels) {
            dossierFiltre.medicamentsActuels = patient.medicamentsActuels;
        }
        if (payload.permissions.documents) {
            dossierFiltre.documents = patient.documents;
        }
        return {
            patient: dossierFiltre,
            permissions: payload.permissions,
            expiresAt: payload.expiresAt,
        };
    }
};
exports.PartageLienService = PartageLienService;
exports.PartageLienService = PartageLienService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        typeorm_2.Repository])
], PartageLienService);
//# sourceMappingURL=partage-lien.service.js.map
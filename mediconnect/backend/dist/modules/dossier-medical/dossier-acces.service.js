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
exports.DossierAccesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dossier_acces_medecin_entity_1 = require("./entities/dossier-acces-medecin.entity");
const HIERARCHIE = {
    [dossier_acces_medecin_entity_1.NiveauAcces.LECTURE]: 1,
    [dossier_acces_medecin_entity_1.NiveauAcces.LECTURE_ECRITURE]: 2,
    [dossier_acces_medecin_entity_1.NiveauAcces.ACCES_COMPLET]: 3,
};
let DossierAccesService = class DossierAccesService {
    constructor(accesRepo) {
        this.accesRepo = accesRepo;
    }
    async accorderAcces(patientId, accordeParId, dto) {
        const existing = await this.accesRepo.findOne({
            where: { patientId, medecinId: dto.medecinId },
        });
        if (existing)
            throw new common_1.ConflictException('Un accès existe déjà pour ce médecin');
        const acces = this.accesRepo.create({
            patientId,
            medecinId: dto.medecinId,
            niveauAcces: dto.niveauAcces,
            accordeParId,
            dateExpiration: dto.dateExpiration ? new Date(dto.dateExpiration) : null,
            actif: true,
            permissions: dto.permissions ?? null,
        });
        return this.accesRepo.save(acces);
    }
    async modifierAcces(accesId, patientId, dto) {
        const acces = await this.accesRepo.findOne({ where: { id: accesId, patientId } });
        if (!acces)
            throw new common_1.NotFoundException('Accès introuvable');
        if (dto.niveauAcces !== undefined)
            acces.niveauAcces = dto.niveauAcces;
        if (dto.dateExpiration !== undefined)
            acces.dateExpiration = dto.dateExpiration ? new Date(dto.dateExpiration) : null;
        if (dto.actif !== undefined)
            acces.actif = dto.actif;
        if (dto.permissions !== undefined)
            acces.permissions = dto.permissions;
        return this.accesRepo.save(acces);
    }
    async revoquerAcces(accesId, patientId) {
        const acces = await this.accesRepo.findOne({ where: { id: accesId, patientId } });
        if (!acces)
            throw new common_1.NotFoundException('Accès introuvable');
        acces.actif = false;
        await this.accesRepo.save(acces);
    }
    async getPermissionsMedecin(patientId, medecinId) {
        const acces = await this.accesRepo.findOne({
            where: { patientId, medecinId, actif: true },
        });
        if (!acces) {
            return { permissions: { allergies: false, documents: false, observations: false }, niveauAcces: null };
        }
        return {
            permissions: acces.permissions ?? { allergies: true, documents: true, observations: true },
            niveauAcces: acces.niveauAcces,
        };
    }
    async listerAcces(patientId) {
        try {
            const list = await this.accesRepo.find({
                where: { patientId },
                relations: ['medecin'],
            });
            return list.map(a => ({
                id: a.id,
                patientId: a.patientId,
                medecinId: a.medecinId,
                medecinNom: a.medecin ? `${a.medecin.firstName ?? ''} ${a.medecin.lastName ?? ''}`.trim() : null,
                niveauAcces: a.niveauAcces,
                permissions: a.permissions ?? null,
                actif: a.actif,
                dateExpiration: a.dateExpiration,
                createdAt: a.createdAt,
            }));
        }
        catch (err) {
            console.warn('[listerAcces] error:', err?.message);
            const list = await this.accesRepo.find({ where: { patientId } });
            return list.map(a => ({
                id: a.id,
                patientId: a.patientId,
                medecinId: a.medecinId,
                medecinNom: null,
                niveauAcces: a.niveauAcces,
                permissions: null,
                actif: a.actif,
                dateExpiration: a.dateExpiration,
                createdAt: a.createdAt,
            }));
        }
    }
    async verifierAcces(patientId, medecinId, niveauRequis) {
        const acces = await this.accesRepo.findOne({
            where: { patientId, medecinId },
        });
        if (!acces || !acces.actif) {
            throw new common_1.ForbiddenException('Accès non autorisé');
        }
        if (acces.dateExpiration && acces.dateExpiration < new Date()) {
            throw new common_1.ForbiddenException('Accès expiré');
        }
        if (HIERARCHIE[acces.niveauAcces] < HIERARCHIE[niveauRequis]) {
            throw new common_1.ForbiddenException('Niveau d\'accès insuffisant');
        }
        return acces;
    }
};
exports.DossierAccesService = DossierAccesService;
exports.DossierAccesService = DossierAccesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dossier_acces_medecin_entity_1.DossierAccesMedecin)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DossierAccesService);
//# sourceMappingURL=dossier-acces.service.js.map
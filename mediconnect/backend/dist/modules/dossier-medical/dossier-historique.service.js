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
exports.DossierHistoriqueService = exports.CHAMPS_SURVEILLES = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dossier_historique_entity_1 = require("./entities/dossier-historique.entity");
exports.CHAMPS_SURVEILLES = [
    'allergies', 'maladiesChroniques', 'medicamentsActuels',
    'groupeSanguin', 'dateNaissance', 'sexe', 'ville',
    'telephone', 'nss', 'nom', 'prenom',
];
const CHAMPS_SENSIBLES = ['password', 'mfaSecret', 'refreshToken'];
let DossierHistoriqueService = class DossierHistoriqueService {
    constructor(historiqueRepo) {
        this.historiqueRepo = historiqueRepo;
    }
    computeDiff(avant, apres) {
        const diff = {};
        for (const champ of exports.CHAMPS_SURVEILLES) {
            if (JSON.stringify(avant[champ]) !== JSON.stringify(apres[champ])) {
                diff[champ] = { avant: avant[champ], apres: apres[champ] };
            }
        }
        return diff;
    }
    sanitizeSnapshot(snapshot) {
        const clean = { ...snapshot };
        for (const champ of CHAMPS_SENSIBLES) {
            delete clean[champ];
        }
        return clean;
    }
    async createHistorique(patientId, modifieParId, roleAuteur, snapshotAvant, snapshotApres, commentaire) {
        const diff = this.computeDiff(snapshotAvant, snapshotApres);
        if (Object.keys(diff).length === 0)
            return null;
        const entry = this.historiqueRepo.create({
            patientId,
            modifieParId,
            roleAuteur,
            champsModifies: diff,
            snapshotAvant: this.sanitizeSnapshot(snapshotAvant),
            commentaire,
        });
        return this.historiqueRepo.save(entry);
    }
    async getHistorique(patientId, query) {
        const { page = 1, limit = 20, champ, modifieParId, roleAuteur } = query;
        const qb = this.historiqueRepo
            .createQueryBuilder('h')
            .where('h.patientId = :patientId', { patientId })
            .orderBy('h.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        if (champ) {
            qb.andWhere('h.champsModifies ? :champ', { champ });
        }
        if (modifieParId) {
            qb.andWhere('h.modifieParId = :modifieParId', { modifieParId });
        }
        if (roleAuteur) {
            qb.andWhere('h.roleAuteur = :roleAuteur', { roleAuteur });
        }
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page };
    }
};
exports.DossierHistoriqueService = DossierHistoriqueService;
exports.DossierHistoriqueService = DossierHistoriqueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dossier_historique_entity_1.DossierHistorique)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DossierHistoriqueService);
//# sourceMappingURL=dossier-historique.service.js.map
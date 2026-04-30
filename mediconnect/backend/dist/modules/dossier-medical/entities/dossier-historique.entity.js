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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DossierHistorique = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("../../patients/entities/patient.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let DossierHistorique = class DossierHistorique {
};
exports.DossierHistorique = DossierHistorique;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DossierHistorique.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], DossierHistorique.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], DossierHistorique.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'modifie_par_id', type: 'uuid' }),
    __metadata("design:type", String)
], DossierHistorique.prototype, "modifieParId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'modifie_par_id' }),
    __metadata("design:type", user_entity_1.User)
], DossierHistorique.prototype, "modifiePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'role_auteur', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], DossierHistorique.prototype, "roleAuteur", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'champs_modifies', type: 'jsonb' }),
    __metadata("design:type", Object)
], DossierHistorique.prototype, "champsModifies", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'snapshot_avant', type: 'jsonb' }),
    __metadata("design:type", Object)
], DossierHistorique.prototype, "snapshotAvant", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], DossierHistorique.prototype, "commentaire", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DossierHistorique.prototype, "createdAt", void 0);
exports.DossierHistorique = DossierHistorique = __decorate([
    (0, typeorm_1.Entity)('dossier_historique'),
    (0, typeorm_1.Index)(['patientId', 'createdAt'])
], DossierHistorique);
//# sourceMappingURL=dossier-historique.entity.js.map
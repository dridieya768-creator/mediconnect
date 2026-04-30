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
exports.DossierAccesMedecin = exports.NiveauAcces = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("../../patients/entities/patient.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var NiveauAcces;
(function (NiveauAcces) {
    NiveauAcces["LECTURE"] = "LECTURE";
    NiveauAcces["LECTURE_ECRITURE"] = "LECTURE_ECRITURE";
    NiveauAcces["ACCES_COMPLET"] = "ACCES_COMPLET";
})(NiveauAcces || (exports.NiveauAcces = NiveauAcces = {}));
let DossierAccesMedecin = class DossierAccesMedecin {
};
exports.DossierAccesMedecin = DossierAccesMedecin;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DossierAccesMedecin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], DossierAccesMedecin.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], DossierAccesMedecin.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medecin_id', type: 'uuid' }),
    __metadata("design:type", String)
], DossierAccesMedecin.prototype, "medecinId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'medecin_id' }),
    __metadata("design:type", user_entity_1.User)
], DossierAccesMedecin.prototype, "medecin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'niveau_acces', type: 'enum', enum: NiveauAcces, default: NiveauAcces.LECTURE }),
    __metadata("design:type", String)
], DossierAccesMedecin.prototype, "niveauAcces", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accorde_par_id', type: 'uuid' }),
    __metadata("design:type", String)
], DossierAccesMedecin.prototype, "accordeParId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_expiration', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], DossierAccesMedecin.prototype, "dateExpiration", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], DossierAccesMedecin.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DossierAccesMedecin.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DossierAccesMedecin.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DossierAccesMedecin.prototype, "updatedAt", void 0);
exports.DossierAccesMedecin = DossierAccesMedecin = __decorate([
    (0, typeorm_1.Entity)('dossier_acces_medecin'),
    (0, typeorm_1.Unique)(['patientId', 'medecinId']),
    (0, typeorm_1.Index)(['patientId']),
    (0, typeorm_1.Index)(['medecinId'])
], DossierAccesMedecin);
//# sourceMappingURL=dossier-acces-medecin.entity.js.map
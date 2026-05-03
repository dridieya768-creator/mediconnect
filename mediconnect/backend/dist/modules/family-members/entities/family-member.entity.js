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
exports.FamilyMember = exports.Relation = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("../../patients/entities/patient.entity");
var Relation;
(function (Relation) {
    Relation["ENFANT"] = "ENFANT";
    Relation["CONJOINT"] = "CONJOINT";
    Relation["PARENT"] = "PARENT";
    Relation["AUTRE"] = "AUTRE";
})(Relation || (exports.Relation = Relation = {}));
let FamilyMember = class FamilyMember {
};
exports.FamilyMember = FamilyMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FamilyMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], FamilyMember.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, { eager: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], FamilyMember.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], FamilyMember.prototype, "prenom", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], FamilyMember.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_naissance', type: 'date' }),
    __metadata("design:type", Date)
], FamilyMember.prototype, "dateNaissance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: Relation }),
    __metadata("design:type", String)
], FamilyMember.prototype, "relation", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 1 }),
    __metadata("design:type", String)
], FamilyMember.prototype, "sexe", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 50 }),
    __metadata("design:type", String)
], FamilyMember.prototype, "nss", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], FamilyMember.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'groupe_sanguin', nullable: true, length: 5 }),
    __metadata("design:type", String)
], FamilyMember.prototype, "groupeSanguin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doc_membre_path', nullable: true, length: 500 }),
    __metadata("design:type", String)
], FamilyMember.prototype, "docMembrePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doc_patient_path', nullable: true, length: 500 }),
    __metadata("design:type", String)
], FamilyMember.prototype, "docPatientPath", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FamilyMember.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FamilyMember.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], FamilyMember.prototype, "deletedAt", void 0);
exports.FamilyMember = FamilyMember = __decorate([
    (0, typeorm_1.Entity)('family_members'),
    (0, typeorm_1.Index)(['patientId'], { where: '"deleted_at" IS NULL' })
], FamilyMember);
//# sourceMappingURL=family-member.entity.js.map
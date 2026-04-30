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
exports.Patient = exports.BloodGroup = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var BloodGroup;
(function (BloodGroup) {
    BloodGroup["A_POS"] = "A+";
    BloodGroup["A_NEG"] = "A-";
    BloodGroup["B_POS"] = "B+";
    BloodGroup["B_NEG"] = "B-";
    BloodGroup["AB_POS"] = "AB+";
    BloodGroup["AB_NEG"] = "AB-";
    BloodGroup["O_POS"] = "O+";
    BloodGroup["O_NEG"] = "O-";
})(BloodGroup || (exports.BloodGroup = BloodGroup = {}));
let Patient = class Patient {
};
exports.Patient = Patient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Patient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", user_entity_1.User)
], Patient.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "user_id" }),
    __metadata("design:type", String)
], Patient.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "qr_code", unique: true }),
    __metadata("design:type", String)
], Patient.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "prenom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "date_naissance", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Patient.prototype, "dateNaissance", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Patient.prototype, "age", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "sexe", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "telephone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "ville", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "localisation_gps", nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "localisationGPS", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "langue_preferee", nullable: true, default: "fr" }),
    __metadata("design:type", String)
], Patient.prototype, "languePreferee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "groupe_sanguin",
        type: "enum",
        enum: BloodGroup,
        nullable: true,
    }),
    __metadata("design:type", String)
], Patient.prototype, "groupeSanguin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "medecin_traitant_id", nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "medecinTraitantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", default: "[]" }),
    __metadata("design:type", Array)
], Patient.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "maladies_chroniques", type: "jsonb", default: "[]" }),
    __metadata("design:type", Array)
], Patient.prototype, "maladiesChroniques", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "medicaments_actuels", type: "jsonb", default: "[]" }),
    __metadata("design:type", Array)
], Patient.prototype, "medicamentsActuels", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "favoris", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "rappels_auto", default: false }),
    __metadata("design:type", Boolean)
], Patient.prototype, "rappelsAuto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "acces_base_medicaments", default: true }),
    __metadata("design:type", Boolean)
], Patient.prototype, "accesBaseMedicaments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "questions_teleconseil", type: "text", nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "questionsTeleconseil", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "historique_teleconsultations", type: "jsonb", default: "[]" }),
    __metadata("design:type", Array)
], Patient.prototype, "historiqueTeleconsultations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "questions_forum", type: "text", nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "questionsForum", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "acces_anonyme", default: false }),
    __metadata("design:type", Boolean)
], Patient.prototype, "accesAnonyme", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "gestion_multi_profils", default: false }),
    __metadata("design:type", Boolean)
], Patient.prototype, "gestionMultiProfils", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "paiement_en_ligne", default: false }),
    __metadata("design:type", Boolean)
], Patient.prototype, "paiementEnLigne", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "application_mobile", default: false }),
    __metadata("design:type", Boolean)
], Patient.prototype, "applicationMobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "double_authentification", default: false }),
    __metadata("design:type", Boolean)
], Patient.prototype, "doubleAuthentification", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", default: "{}" }),
    __metadata("design:type", Object)
], Patient.prototype, "notification", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], Patient.prototype, "nss", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observations_medecin', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "observationsMedecin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Patient.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Patient.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Patient.prototype, "updatedAt", void 0);
exports.Patient = Patient = __decorate([
    (0, typeorm_1.Entity)("patients")
], Patient);
//# sourceMappingURL=patient.entity.js.map
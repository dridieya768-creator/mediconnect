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
exports.MedecinProfile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let MedecinProfile = class MedecinProfile {
};
exports.MedecinProfile = MedecinProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MedecinProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MedecinProfile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "specialite", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "rpps", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "telephone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cabinet_nom', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "cabinetNom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cabinet_adresse', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "cabinetAdresse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cabinet_ville', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "cabinetVille", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cabinet_code_postal', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "cabinetCodePostal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cabinet_telephone', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "cabinetTelephone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_pro', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "photoPro", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "diplomes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photos_cabinet', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "photosCabinet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MedecinProfile.prototype, "tarifs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actes_couverts', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "actesCouverts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assurances_acceptees', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "assurancesAcceptees", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "titre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_ordre_pro', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "numeroOrdrePro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'langues_parlees', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "languesParlees", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "ville", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adresse_cabinet', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "adresseCabinet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'geo_google_maps', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "geoGoogleMaps", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telephone_pro', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "telephonePro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_pro', nullable: true }),
    __metadata("design:type", String)
], MedecinProfile.prototype, "emailPro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agenda_connecte', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], MedecinProfile.prototype, "agendaConnecte", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dispon_teleconsult', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MedecinProfile.prototype, "disponTeleconsult", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'connexion_video_integree', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MedecinProfile.prototype, "connexionVideoIntegree", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profil_seo', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MedecinProfile.prototype, "profilSEO", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stats_analytics', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MedecinProfile.prototype, "statsAnalytics", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], MedecinProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], MedecinProfile.prototype, "updatedAt", void 0);
exports.MedecinProfile = MedecinProfile = __decorate([
    (0, typeorm_1.Entity)('medecins')
], MedecinProfile);
//# sourceMappingURL=medecin-profile.entity.js.map
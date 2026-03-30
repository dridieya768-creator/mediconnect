"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MedecinProfile = void 0;
var typeorm_1 = require("typeorm");
var user_entity_1 = require("../../users/entities/user.entity");
var MedecinProfile = /** @class */ (function () {
    function MedecinProfile() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn()
    ], MedecinProfile.prototype, "id");
    __decorate([
        typeorm_1.Column({ name: 'user_id', type: 'uuid' })
    ], MedecinProfile.prototype, "userId");
    __decorate([
        typeorm_1.OneToOne(function () { return user_entity_1.User; }),
        typeorm_1.JoinColumn({ name: 'user_id' })
    ], MedecinProfile.prototype, "user");
    __decorate([
        typeorm_1.Column({ nullable: true })
    ], MedecinProfile.prototype, "specialite");
    __decorate([
        typeorm_1.Column({ nullable: true })
    ], MedecinProfile.prototype, "rpps");
    __decorate([
        typeorm_1.Column({ nullable: true })
    ], MedecinProfile.prototype, "telephone");
    __decorate([
        typeorm_1.Column({ name: 'cabinet_nom', nullable: true })
    ], MedecinProfile.prototype, "cabinetNom");
    __decorate([
        typeorm_1.Column({ name: 'cabinet_adresse', type: 'text', nullable: true })
    ], MedecinProfile.prototype, "cabinetAdresse");
    __decorate([
        typeorm_1.Column({ name: 'cabinet_ville', nullable: true })
    ], MedecinProfile.prototype, "cabinetVille");
    __decorate([
        typeorm_1.Column({ name: 'cabinet_code_postal', nullable: true })
    ], MedecinProfile.prototype, "cabinetCodePostal");
    __decorate([
        typeorm_1.Column({ name: 'cabinet_telephone', nullable: true })
    ], MedecinProfile.prototype, "cabinetTelephone");
    __decorate([
        typeorm_1.Column({ type: 'text', nullable: true })
    ], MedecinProfile.prototype, "bio");
    __decorate([
        typeorm_1.Column({ name: 'photo_url', type: 'text', nullable: true })
    ], MedecinProfile.prototype, "photoUrl");
    __decorate([
        typeorm_1.Column({ name: 'photo_pro', type: 'text', nullable: true })
    ], MedecinProfile.prototype, "photoPro");
    __decorate([
        typeorm_1.Column({ type: 'text', nullable: true })
    ], MedecinProfile.prototype, "diplomes");
    __decorate([
        typeorm_1.Column({ name: 'photos_cabinet', type: 'text', nullable: true })
    ], MedecinProfile.prototype, "photosCabinet");
    __decorate([
        typeorm_1.Column({ type: 'jsonb', nullable: true })
    ], MedecinProfile.prototype, "tarifs");
    __decorate([
        typeorm_1.Column({ name: 'actes_couverts', type: 'text', nullable: true })
    ], MedecinProfile.prototype, "actesCouverts");
    __decorate([
        typeorm_1.Column({ name: 'assurances_acceptees', type: 'text', nullable: true })
    ], MedecinProfile.prototype, "assurancesAcceptees");
    __decorate([
        typeorm_1.Column({ nullable: true })
    ], MedecinProfile.prototype, "titre");
    __decorate([
        typeorm_1.Column({ name: 'numero_ordre_pro', nullable: true })
    ], MedecinProfile.prototype, "numeroOrdrePro");
    __decorate([
        typeorm_1.Column({ name: 'langues_parlees', nullable: true })
    ], MedecinProfile.prototype, "languesParlees");
    __decorate([
        typeorm_1.Column({ nullable: true })
    ], MedecinProfile.prototype, "ville");
    __decorate([
        typeorm_1.Column({ name: 'adresse_cabinet', type: 'text', nullable: true })
    ], MedecinProfile.prototype, "adresseCabinet");
    __decorate([
        typeorm_1.Column({ name: 'geo_google_maps', type: 'text', nullable: true })
    ], MedecinProfile.prototype, "geoGoogleMaps");
    __decorate([
        typeorm_1.Column({ name: 'telephone_pro', nullable: true })
    ], MedecinProfile.prototype, "telephonePro");
    __decorate([
        typeorm_1.Column({ name: 'email_pro', nullable: true })
    ], MedecinProfile.prototype, "emailPro");
    __decorate([
        typeorm_1.Column({ name: 'agenda_connecte', type: 'boolean', "default": true })
    ], MedecinProfile.prototype, "agendaConnecte");
    __decorate([
        typeorm_1.Column({ name: 'dispon_teleconsult', type: 'boolean', "default": false })
    ], MedecinProfile.prototype, "disponTeleconsult");
    __decorate([
        typeorm_1.Column({ name: 'connexion_video_integree', type: 'boolean', "default": false })
    ], MedecinProfile.prototype, "connexionVideoIntegree");
    __decorate([
        typeorm_1.Column({ name: 'profil_seo', type: 'boolean', "default": false })
    ], MedecinProfile.prototype, "profilSEO");
    __decorate([
        typeorm_1.Column({ name: 'stats_analytics', type: 'boolean', "default": false })
    ], MedecinProfile.prototype, "statsAnalytics");
    __decorate([
        typeorm_1.Column({ name: 'created_at', type: 'timestamp', "default": function () { return 'CURRENT_TIMESTAMP'; } })
    ], MedecinProfile.prototype, "createdAt");
    __decorate([
        typeorm_1.Column({ name: 'updated_at', type: 'timestamp', "default": function () { return 'CURRENT_TIMESTAMP'; }, onUpdate: 'CURRENT_TIMESTAMP' })
    ], MedecinProfile.prototype, "updatedAt");
    MedecinProfile = __decorate([
        typeorm_1.Entity('medecin_profiles')
    ], MedecinProfile);
    return MedecinProfile;
}());
exports.MedecinProfile = MedecinProfile;

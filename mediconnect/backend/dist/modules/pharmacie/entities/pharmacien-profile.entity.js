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
exports.PharmacienProfile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let PharmacienProfile = class PharmacienProfile {
};
exports.PharmacienProfile = PharmacienProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PharmacienProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid', unique: true }),
    __metadata("design:type", String)
], PharmacienProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], PharmacienProfile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_ordre', nullable: true }),
    __metadata("design:type", String)
], PharmacienProfile.prototype, "numeroOrdre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nom_pharmacie', nullable: true }),
    __metadata("design:type", String)
], PharmacienProfile.prototype, "nomPharmacie", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adresse_pharmacie', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PharmacienProfile.prototype, "adressePharmacie", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PharmacienProfile.prototype, "ville", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'code_postal', nullable: true }),
    __metadata("design:type", String)
], PharmacienProfile.prototype, "codePostal", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal', precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], PharmacienProfile.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal', precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], PharmacienProfile.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'horaires_ouverture', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PharmacienProfile.prototype, "horairesOuverture", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_garde', default: false }),
    __metadata("design:type", Boolean)
], PharmacienProfile.prototype, "isGarde", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_ouverte_24h', default: false }),
    __metadata("design:type", Boolean)
], PharmacienProfile.prototype, "isOuverte24h", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PharmacienProfile.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PharmacienProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PharmacienProfile.prototype, "updatedAt", void 0);
exports.PharmacienProfile = PharmacienProfile = __decorate([
    (0, typeorm_1.Entity)('pharmaciens')
], PharmacienProfile);
//# sourceMappingURL=pharmacien-profile.entity.js.map
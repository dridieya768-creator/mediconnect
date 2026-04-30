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
exports.StockItem = exports.StockStatut = void 0;
const typeorm_1 = require("typeorm");
const stock_mouvement_entity_1 = require("./stock-mouvement.entity");
var StockStatut;
(function (StockStatut) {
    StockStatut["DISPONIBLE"] = "DISPONIBLE";
    StockStatut["RUPTURE"] = "RUPTURE";
    StockStatut["PERIME"] = "PERIME";
    StockStatut["RAPPEL"] = "RAPPEL";
})(StockStatut || (exports.StockStatut = StockStatut = {}));
let StockItem = class StockItem {
};
exports.StockItem = StockItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cip', unique: true }),
    __metadata("design:type", String)
], StockItem.prototype, "cip", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nom' }),
    __metadata("design:type", String)
], StockItem.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dci', nullable: true }),
    __metadata("design:type", String)
], StockItem.prototype, "dci", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'forme', nullable: true }),
    __metadata("design:type", String)
], StockItem.prototype, "forme", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dosage', nullable: true }),
    __metadata("design:type", String)
], StockItem.prototype, "dosage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fournisseur', nullable: true }),
    __metadata("design:type", String)
], StockItem.prototype, "fournisseur", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantite_totale', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], StockItem.prototype, "quantiteTotale", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seuil_alerte', type: 'int', default: 10 }),
    __metadata("design:type", Number)
], StockItem.prototype, "seuilAlerte", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prix_achat', type: 'decimal', precision: 10, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], StockItem.prototype, "prixAchat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prix_vente', type: 'decimal', precision: 10, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], StockItem.prototype, "prixVente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StockStatut, default: StockStatut.DISPONIBLE }),
    __metadata("design:type", String)
], StockItem.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lots', type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], StockItem.prototype, "lots", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stock_mouvement_entity_1.StockMouvement, (m) => m.stockItem),
    __metadata("design:type", Array)
], StockItem.prototype, "mouvements", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StockItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StockItem.prototype, "updatedAt", void 0);
exports.StockItem = StockItem = __decorate([
    (0, typeorm_1.Entity)('stock_items')
], StockItem);
//# sourceMappingURL=stock-item.entity.js.map
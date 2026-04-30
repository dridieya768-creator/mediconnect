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
exports.StockMouvement = exports.TypeMouvement = void 0;
const typeorm_1 = require("typeorm");
const stock_item_entity_1 = require("./stock-item.entity");
var TypeMouvement;
(function (TypeMouvement) {
    TypeMouvement["RECEPTION"] = "RECEPTION";
    TypeMouvement["DELIVRANCE"] = "DELIVRANCE";
    TypeMouvement["RETOUR_FOURNISSEUR"] = "RETOUR_FOURNISSEUR";
    TypeMouvement["INVENTAIRE_AJUSTEMENT"] = "INVENTAIRE_AJUSTEMENT";
    TypeMouvement["PEREMPTION"] = "PEREMPTION";
})(TypeMouvement || (exports.TypeMouvement = TypeMouvement = {}));
let StockMouvement = class StockMouvement {
};
exports.StockMouvement = StockMouvement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockMouvement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stock_item_entity_1.StockItem, (s) => s.mouvements, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'stock_item_id' }),
    __metadata("design:type", stock_item_entity_1.StockItem)
], StockMouvement.prototype, "stockItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stock_item_id' }),
    __metadata("design:type", String)
], StockMouvement.prototype, "stockItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TypeMouvement }),
    __metadata("design:type", String)
], StockMouvement.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantite', type: 'int' }),
    __metadata("design:type", Number)
], StockMouvement.prototype, "quantite", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lot', nullable: true }),
    __metadata("design:type", String)
], StockMouvement.prototype, "lot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motif', nullable: true }),
    __metadata("design:type", String)
], StockMouvement.prototype, "motif", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pharmacien_id', nullable: true }),
    __metadata("design:type", String)
], StockMouvement.prototype, "pharmacienId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avoir_montant', type: 'decimal', precision: 10, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], StockMouvement.prototype, "avoirMontant", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StockMouvement.prototype, "createdAt", void 0);
exports.StockMouvement = StockMouvement = __decorate([
    (0, typeorm_1.Entity)('stock_mouvements')
], StockMouvement);
//# sourceMappingURL=stock-mouvement.entity.js.map
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
exports.StockController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const stock_service_1 = require("./stock.service");
const reception_livraison_dto_1 = require("./dto/reception-livraison.dto");
const retour_fournisseur_dto_1 = require("./dto/retour-fournisseur.dto");
const inventaire_dto_1 = require("./dto/inventaire.dto");
let StockController = class StockController {
    constructor(stockService) {
        this.stockService = stockService;
    }
    getStock() {
        return this.stockService.getStock();
    }
    getDashboard() {
        return this.stockService.getDashboard();
    }
    getAlertes() {
        return this.stockService.getAlertes();
    }
    getMouvements(stockItemId) {
        return this.stockService.getMouvements(stockItemId);
    }
    receptionnerLivraison(dto, user) {
        return this.stockService.receptionnerLivraison(dto, user.id);
    }
    realiserInventaire(dto, user) {
        return this.stockService.realiserInventaire(dto, user.id);
    }
    retourFournisseur(dto, user) {
        return this.stockService.retourFournisseur(dto, user.id);
    }
};
exports.StockController = StockController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getStock", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('alertes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getAlertes", null);
__decorate([
    (0, common_1.Get)('mouvements'),
    __param(0, (0, common_1.Query)('stockItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getMouvements", null);
__decorate([
    (0, common_1.Post)('reception'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reception_livraison_dto_1.ReceptionLivraisonDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "receptionnerLivraison", null);
__decorate([
    (0, common_1.Post)('inventaire'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventaire_dto_1.InventaireDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "realiserInventaire", null);
__decorate([
    (0, common_1.Post)('retour'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [retour_fournisseur_dto_1.RetourFournisseurDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "retourFournisseur", null);
exports.StockController = StockController = __decorate([
    (0, common_1.Controller)('pharmacie/stock'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PHARMACIEN),
    __metadata("design:paramtypes", [stock_service_1.StockService])
], StockController);
//# sourceMappingURL=stock.controller.js.map
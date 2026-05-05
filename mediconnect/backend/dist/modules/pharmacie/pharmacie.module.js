"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacieModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const prescription_entity_1 = require("../prescriptions/entities/prescription.entity");
const dossier_historique_entity_1 = require("../dossier-medical/entities/dossier-historique.entity");
const qr_codes_module_1 = require("../qr-codes/qr-codes.module");
const dossier_medical_module_1 = require("../dossier-medical/dossier-medical.module");
const delivrance_controller_1 = require("./delivrance.controller");
const delivrance_service_1 = require("./delivrance.service");
const ticket_pdf_service_1 = require("./ticket-pdf.service");
const stock_item_entity_1 = require("./entities/stock-item.entity");
const stock_mouvement_entity_1 = require("./entities/stock-mouvement.entity");
const stock_service_1 = require("./stock.service");
const stock_controller_1 = require("./stock.controller");
const pharmacien_profile_entity_1 = require("./entities/pharmacien-profile.entity");
let PharmacieModule = class PharmacieModule {
};
exports.PharmacieModule = PharmacieModule;
exports.PharmacieModule = PharmacieModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([prescription_entity_1.Prescription, dossier_historique_entity_1.DossierHistorique, stock_item_entity_1.StockItem, stock_mouvement_entity_1.StockMouvement, pharmacien_profile_entity_1.PharmacienProfile]),
            qr_codes_module_1.QrCodesModule,
            dossier_medical_module_1.DossierMedicalModule,
        ],
        controllers: [delivrance_controller_1.DelivranceController, stock_controller_1.StockController],
        providers: [delivrance_service_1.DelivranceService, ticket_pdf_service_1.TicketPdfService, stock_service_1.StockService],
        exports: [stock_service_1.StockService, typeorm_1.TypeOrmModule],
    })
], PharmacieModule);
//# sourceMappingURL=pharmacie.module.js.map
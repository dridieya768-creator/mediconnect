"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionCheckerService = void 0;
const common_1 = require("@nestjs/common");
const INTERACTIONS = [
    { drug1: 'warfarine', drug2: 'aspirine', severity: 'severe', description: 'Risque hémorragique majeur — association contre-indiquée' },
    { drug1: 'fluoxetine', drug2: 'tramadol', severity: 'severe', description: 'Risque de syndrome sérotoninergique potentiellement fatal' },
    { drug1: 'digoxine', drug2: 'amiodarone', severity: 'severe', description: 'Risque de toxicité digitalique — surveillance ECG obligatoire' },
    { drug1: 'simvastatine', drug2: 'clarithromycine', severity: 'severe', description: 'Risque de rhabdomyolyse — association contre-indiquée' },
    { drug1: 'metformine', drug2: 'alcool', severity: 'moderee', description: "Risque d'acidose lactique augmenté avec la consommation d'alcool" },
    { drug1: 'amoxicilline', drug2: 'methotrexate', severity: 'moderee', description: "L'amoxicilline peut augmenter la toxicité du méthotrexate" },
    { drug1: 'ibuprofene', drug2: 'aspirine', severity: 'moderee', description: "Risque accru d'effets indésirables gastro-intestinaux" },
    { drug1: 'lisinopril', drug2: 'potassium', severity: 'moderee', description: "Risque d'hyperkaliémie — surveillance de la kaliémie recommandée" },
    { drug1: 'paracetamol', drug2: 'alcool', severity: 'mineure', description: "Consommation excessive d'alcool peut augmenter la toxicité hépatique" },
    { drug1: 'ciprofloxacine', drug2: 'antiacides', severity: 'mineure', description: "Les antiacides réduisent l'absorption de la ciprofloxacine" },
];
let InteractionCheckerService = class InteractionCheckerService {
    constructor() {
        this.interactions = INTERACTIONS;
    }
    checkInteractions(medications) {
        const found = [];
        const names = medications.map(m => m.name.toLowerCase());
        for (let i = 0; i < names.length; i++) {
            for (let j = i + 1; j < names.length; j++) {
                const a = names[i];
                const b = names[j];
                const match = this.interactions.find(inter => (inter.drug1.toLowerCase() === a && inter.drug2.toLowerCase() === b) ||
                    (inter.drug1.toLowerCase() === b && inter.drug2.toLowerCase() === a));
                if (match)
                    found.push(match);
            }
        }
        return found;
    }
};
exports.InteractionCheckerService = InteractionCheckerService;
exports.InteractionCheckerService = InteractionCheckerService = __decorate([
    (0, common_1.Injectable)()
], InteractionCheckerService);
//# sourceMappingURL=interaction-checker.service.js.map
import { Injectable } from '@nestjs/common';
import { CreateMedicationDto } from './dto/create-medication.dto';

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'mineure' | 'moderee' | 'severe';
  description: string;
}


const INTERACTIONS: DrugInteraction[] = [
  { drug1: 'warfarine',      drug2: 'aspirine',        severity: 'severe',  description: 'Risque hémorragique majeur — association contre-indiquée' },
  { drug1: 'fluoxetine',     drug2: 'tramadol',        severity: 'severe',  description: 'Risque de syndrome sérotoninergique potentiellement fatal' },
  { drug1: 'digoxine',       drug2: 'amiodarone',      severity: 'severe',  description: 'Risque de toxicité digitalique — surveillance ECG obligatoire' },
  { drug1: 'simvastatine',   drug2: 'clarithromycine', severity: 'severe',  description: 'Risque de rhabdomyolyse — association contre-indiquée' },
  { drug1: 'metformine',     drug2: 'alcool',          severity: 'moderee', description: "Risque d'acidose lactique augmenté avec la consommation d'alcool" },
  { drug1: 'amoxicilline',   drug2: 'methotrexate',    severity: 'moderee', description: "L'amoxicilline peut augmenter la toxicité du méthotrexate" },
  { drug1: 'ibuprofene',     drug2: 'aspirine',        severity: 'moderee', description: "Risque accru d'effets indésirables gastro-intestinaux" },
  { drug1: 'lisinopril',     drug2: 'potassium',       severity: 'moderee', description: "Risque d'hyperkaliémie — surveillance de la kaliémie recommandée" },
  { drug1: 'paracetamol',    drug2: 'alcool',          severity: 'mineure', description: "Consommation excessive d'alcool peut augmenter la toxicité hépatique" },
  { drug1: 'ciprofloxacine', drug2: 'antiacides',      severity: 'mineure', description: "Les antiacides réduisent l'absorption de la ciprofloxacine" },
];

@Injectable()
export class InteractionCheckerService {
  private readonly interactions: DrugInteraction[] = INTERACTIONS;

  checkInteractions(medications: CreateMedicationDto[]): DrugInteraction[] {
    const found: DrugInteraction[] = [];
    const names = medications.map(m => m.name.toLowerCase());

    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = names[i];
        const b = names[j];
        const match = this.interactions.find(
          inter =>
            (inter.drug1.toLowerCase() === a && inter.drug2.toLowerCase() === b) ||
            (inter.drug1.toLowerCase() === b && inter.drug2.toLowerCase() === a),
        );
        if (match) found.push(match);
      }
    }
    return found;
  }
}

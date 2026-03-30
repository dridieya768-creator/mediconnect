import { CreateMedicationDto } from './dto/create-medication.dto';
export interface DrugInteraction {
    drug1: string;
    drug2: string;
    severity: 'mineure' | 'moderee' | 'severe';
    description: string;
}
export declare class InteractionCheckerService {
    private readonly interactions;
    checkInteractions(medications: CreateMedicationDto[]): DrugInteraction[];
}

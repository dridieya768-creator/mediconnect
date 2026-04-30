export declare class MedicamentDelivreDto {
    cip: string;
    quantiteDelivree: number;
    prixUnitaire: number;
    tauxCnam: number;
}
export declare class ConfirmerDelivranceDto {
    prescriptionId: string;
    medicamentsDelivres: MedicamentDelivreDto[];
}

import { StockItem } from './stock-item.entity';
export declare enum TypeMouvement {
    RECEPTION = "RECEPTION",
    DELIVRANCE = "DELIVRANCE",
    RETOUR_FOURNISSEUR = "RETOUR_FOURNISSEUR",
    INVENTAIRE_AJUSTEMENT = "INVENTAIRE_AJUSTEMENT",
    PEREMPTION = "PEREMPTION"
}
export declare class StockMouvement {
    id: string;
    stockItem: StockItem;
    stockItemId: string;
    type: TypeMouvement;
    quantite: number;
    lot: string;
    motif: string;
    pharmacienId: string;
    avoirMontant: number;
    createdAt: Date;
}

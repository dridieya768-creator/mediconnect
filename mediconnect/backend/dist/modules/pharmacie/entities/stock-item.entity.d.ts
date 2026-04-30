import { StockMouvement } from './stock-mouvement.entity';
export declare enum StockStatut {
    DISPONIBLE = "DISPONIBLE",
    RUPTURE = "RUPTURE",
    PERIME = "PERIME",
    RAPPEL = "RAPPEL"
}
export declare class StockItem {
    id: string;
    cip: string;
    nom: string;
    dci: string;
    forme: string;
    dosage: string;
    fournisseur: string;
    quantiteTotale: number;
    seuilAlerte: number;
    prixAchat: number;
    prixVente: number;
    statut: StockStatut;
    lots: {
        lot: string;
        quantite: number;
        dateExpiration: Date;
        dateReception: Date;
    }[];
    mouvements: StockMouvement[];
    createdAt: Date;
    updatedAt: Date;
}

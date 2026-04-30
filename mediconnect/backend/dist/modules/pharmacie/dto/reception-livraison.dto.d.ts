export declare class LotReceptionDto {
    cip: string;
    nom: string;
    dci?: string;
    forme?: string;
    dosage?: string;
    fournisseur?: string;
    lot: string;
    quantite: number;
    dateExpiration: string;
    prixAchat?: number;
    prixVente?: number;
    seuilAlerte?: number;
}
export declare class ReceptionLivraisonDto {
    lots: LotReceptionDto[];
}

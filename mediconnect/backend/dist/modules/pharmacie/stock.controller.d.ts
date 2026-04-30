import { User } from '../users/entities/user.entity';
import { StockService } from './stock.service';
import { ReceptionLivraisonDto } from './dto/reception-livraison.dto';
import { RetourFournisseurDto } from './dto/retour-fournisseur.dto';
import { InventaireDto } from './dto/inventaire.dto';
export declare class StockController {
    private readonly stockService;
    constructor(stockService: StockService);
    getStock(): Promise<{
        alerteStockBas: boolean;
        alertePeremption: boolean;
        lotsExpirantBientot: {
            lot: string;
            quantite: number;
            dateExpiration: Date;
            dateReception: Date;
        }[];
        prochaineLot: {
            lot: string;
            quantite: number;
            dateExpiration: Date;
            dateReception: Date;
        };
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
        statut: import("./entities/stock-item.entity").StockStatut;
        lots: {
            lot: string;
            quantite: number;
            dateExpiration: Date;
            dateReception: Date;
        }[];
        mouvements: import("./entities/stock-mouvement.entity").StockMouvement[];
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getDashboard(): Promise<{
        totalProduits: number;
        totalRuptures: number;
        totalAlertes: number;
        totalPeremptionProche: number;
        valeurStock: number;
        top10: {
            cip: string;
            nom: string;
            quantite: number;
            valeur: number;
        }[];
        derniersMouvements: import("./entities/stock-mouvement.entity").StockMouvement[];
    }>;
    getAlertes(): Promise<{
        stockBas: import("./entities/stock-item.entity").StockItem[];
        ruptures: import("./entities/stock-item.entity").StockItem[];
        peremptionProche: import("./entities/stock-item.entity").StockItem[];
        perimes: import("./entities/stock-item.entity").StockItem[];
    }>;
    getMouvements(stockItemId?: string): Promise<import("./entities/stock-mouvement.entity").StockMouvement[]>;
    receptionnerLivraison(dto: ReceptionLivraisonDto, user: User): Promise<any[]>;
    realiserInventaire(dto: InventaireDto, user: User): Promise<any[]>;
    retourFournisseur(dto: RetourFournisseurDto, user: User): Promise<{
        cip: string;
        nom: string;
        quantiteRetournee: number;
        avoirMontant: number;
        nouveauStock: number;
    }>;
}

import { Repository } from 'typeorm';
import { StockItem, StockStatut } from './entities/stock-item.entity';
import { StockMouvement } from './entities/stock-mouvement.entity';
import { ReceptionLivraisonDto } from './dto/reception-livraison.dto';
import { RetourFournisseurDto } from './dto/retour-fournisseur.dto';
import { InventaireDto } from './dto/inventaire.dto';
export declare class StockService {
    private readonly stockRepo;
    private readonly mouvementRepo;
    constructor(stockRepo: Repository<StockItem>, mouvementRepo: Repository<StockMouvement>);
    receptionnerLivraison(dto: ReceptionLivraisonDto, pharmacienId: string): Promise<any[]>;
    getStock(pharmacienId?: string): Promise<{
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
    }[]>;
    getAlertes(): Promise<{
        stockBas: StockItem[];
        ruptures: StockItem[];
        peremptionProche: StockItem[];
        perimes: StockItem[];
    }>;
    realiserInventaire(dto: InventaireDto, pharmacienId: string): Promise<any[]>;
    retourFournisseur(dto: RetourFournisseurDto, pharmacienId: string): Promise<{
        cip: string;
        nom: string;
        quantiteRetournee: number;
        avoirMontant: number;
        nouveauStock: number;
    }>;
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
        derniersMouvements: StockMouvement[];
    }>;
    getMouvements(stockItemId?: string): Promise<StockMouvement[]>;
    decrementerStock(cip: string, quantite: number, pharmacienId: string): Promise<void>;
    private calculerStatut;
}

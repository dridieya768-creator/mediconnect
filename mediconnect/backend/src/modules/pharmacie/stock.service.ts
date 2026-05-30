import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem, StockStatut } from './entities/stock-item.entity';
import { StockMouvement, TypeMouvement } from './entities/stock-mouvement.entity';
import { ReceptionLivraisonDto } from './dto/reception-livraison.dto';
import { RetourFournisseurDto } from './dto/retour-fournisseur.dto';
import { InventaireDto } from './dto/inventaire.dto';

@Injectable()
export class StockService {

  constructor(
    @InjectRepository(StockItem)
    private readonly stockRepo: Repository<StockItem>,
    @InjectRepository(StockMouvement)
    private readonly mouvementRepo: Repository<StockMouvement>,
  ) {}

  

  async receptionnerLivraison(dto: ReceptionLivraisonDto, pharmacienId: string) {
    const results = [];

    for (const lotDto of dto.lots) {
      let item = await this.stockRepo.findOne({ where: { cip: lotDto.cip } });

      if (!item) {
        item = this.stockRepo.create({
          cip: lotDto.cip,
          nom: lotDto.nom,
          dci: lotDto.dci,
          forme: lotDto.forme,
          dosage: lotDto.dosage,
          fournisseur: lotDto.fournisseur,
          quantiteTotale: 0,
          seuilAlerte: lotDto.seuilAlerte ?? 10,
          prixAchat: lotDto.prixAchat ?? 0,
          prixVente: lotDto.prixVente ?? 0,
          lots: [],
        });
      }

      
      item.lots = [
        ...item.lots,
        {
          lot: lotDto.lot,
          quantite: lotDto.quantite,
          dateExpiration: new Date(lotDto.dateExpiration),
          dateReception: new Date(),
        },
      ].sort((a, b) => new Date(a.dateExpiration).getTime() - new Date(b.dateExpiration).getTime());

      item.quantiteTotale += lotDto.quantite;
      if (lotDto.prixAchat) item.prixAchat = lotDto.prixAchat;
      if (lotDto.prixVente) item.prixVente = lotDto.prixVente;
      item.statut = this.calculerStatut(item);

      await this.stockRepo.save(item);

      
      await this.mouvementRepo.save(this.mouvementRepo.create({
        stockItemId: item.id,
        type: TypeMouvement.RECEPTION,
        quantite: lotDto.quantite,
        lot: lotDto.lot,
        motif: `Réception fournisseur ${lotDto.fournisseur ?? ''}`,
        pharmacienId,
      }));

      results.push({ cip: item.cip, nom: item.nom, quantiteAjoutee: lotDto.quantite });
    }

    return results;
  }


  async getStock(pharmacienId?: string) {
    const items = await this.stockRepo.find({ order: { nom: 'ASC' } });
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    return items.map((item) => {
      const alerteStockBas = item.quantiteTotale <= item.seuilAlerte;
      const lotsExpirantBientot = item.lots.filter(
        (l) => new Date(l.dateExpiration) <= in90Days && l.quantite > 0,
      );
      const alertePeremption = lotsExpirantBientot.length > 0;

      return {
        ...item,
        alerteStockBas,
        alertePeremption,
        lotsExpirantBientot,
        prochaineLot: item.lots.find((l) => l.quantite > 0) ?? null, 
      };
    });
  }

  

  async getAlertes() {
    const items = await this.stockRepo.find();
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const stockBas = items.filter((i) => i.quantiteTotale <= i.seuilAlerte && i.quantiteTotale > 0);
    const ruptures = items.filter((i) => i.quantiteTotale === 0);
    const peremptionProche = items.filter((i) =>
      i.lots.some((l) => new Date(l.dateExpiration) <= in90Days && l.quantite > 0),
    );
    const perimes = items.filter((i) =>
      i.lots.some((l) => new Date(l.dateExpiration) < now && l.quantite > 0),
    );

    return { stockBas, ruptures, peremptionProche, perimes };
  }

  

  async realiserInventaire(dto: InventaireDto, pharmacienId: string) {
    const rapport = [];

    for (const ligne of dto.lignes) {
      const item = await this.stockRepo.findOne({ where: { id: ligne.stockItemId } });
      if (!item) continue;

      const ecart = ligne.quantiteReelle - item.quantiteTotale;

      if (ecart !== 0) {
        // Ajustement
        item.quantiteTotale = ligne.quantiteReelle;
        
        if (item.lots.length > 0) {
          const diff = ecart;
          item.lots[0].quantite = Math.max(0, item.lots[0].quantite + diff);
        }
        item.statut = this.calculerStatut(item);
        await this.stockRepo.save(item);

        await this.mouvementRepo.save(this.mouvementRepo.create({
          stockItemId: item.id,
          type: TypeMouvement.INVENTAIRE_AJUSTEMENT,
          quantite: ecart,
          motif: `Inventaire mensuel — écart ${ecart > 0 ? '+' : ''}${ecart}`,
          pharmacienId,
        }));
      }

      rapport.push({
        cip: item.cip,
        nom: item.nom,
        quantiteSysteme: item.quantiteTotale - ecart,
        quantiteReelle: ligne.quantiteReelle,
        ecart,
      });
    }

    return rapport;
  }

  

  async retourFournisseur(dto: RetourFournisseurDto, pharmacienId: string) {
    const item = await this.stockRepo.findOne({ where: { id: dto.stockItemId } });
    if (!item) throw new NotFoundException('Produit introuvable');
    if (item.quantiteTotale < dto.quantite) {
      throw new BadRequestException('Quantité insuffisante en stock');
    }

    
    let restant = dto.quantite;
    for (const lot of item.lots) {
      if (restant <= 0) break;
      const pris = Math.min(lot.quantite, restant);
      lot.quantite -= pris;
      restant -= pris;
    }
    item.lots = item.lots.filter((l) => l.quantite > 0);
    item.quantiteTotale -= dto.quantite;
    item.statut = this.calculerStatut(item);
    await this.stockRepo.save(item);

    const avoirMontant = dto.quantite * Number(item.prixAchat);

    await this.mouvementRepo.save(this.mouvementRepo.create({
      stockItemId: item.id,
      type: TypeMouvement.RETOUR_FOURNISSEUR,
      quantite: -dto.quantite,
      lot: dto.lot,
      motif: dto.motif ?? 'Retour fournisseur',
      pharmacienId,
      avoirMontant,
    }));

    return {
      cip: item.cip,
      nom: item.nom,
      quantiteRetournee: dto.quantite,
      avoirMontant,
      nouveauStock: item.quantiteTotale,
    };
  }


  async getDashboard() {
    const items = await this.stockRepo.find();
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const totalProduits = items.length;
    const totalRuptures = items.filter((i) => i.quantiteTotale === 0).length;
    const totalAlertes = items.filter((i) => i.quantiteTotale <= i.seuilAlerte && i.quantiteTotale > 0).length;
    const totalPeremptionProche = items.filter((i) =>
      i.lots.some((l) => new Date(l.dateExpiration) <= in90Days && l.quantite > 0),
    ).length;

    const valeurStock = items.reduce(
      (sum, i) => sum + i.quantiteTotale * Number(i.prixAchat),
      0,
    );

    
    const top10 = [...items]
      .sort((a, b) => b.quantiteTotale * Number(b.prixAchat) - a.quantiteTotale * Number(a.prixAchat))
      .slice(0, 10)
      .map((i) => ({
        cip: i.cip,
        nom: i.nom,
        quantite: i.quantiteTotale,
        valeur: i.quantiteTotale * Number(i.prixAchat),
      }));

    
    const derniersMouvements = await this.mouvementRepo.find({
      relations: ['stockItem'],
      order: { createdAt: 'DESC' },
      take: 20,
    });

    return {
      totalProduits,
      totalRuptures,
      totalAlertes,
      totalPeremptionProche,
      valeurStock,
      top10,
      derniersMouvements,
    };
  }

  

  async getMouvements(stockItemId?: string) {
    const where = stockItemId ? { stockItemId } : {};
    return this.mouvementRepo.find({
      where,
      relations: ['stockItem'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  

  async decrementerStock(cip: string, quantite: number, pharmacienId: string) {
    const item = await this.stockRepo.findOne({ where: { cip } });
    if (!item || item.quantiteTotale < quantite) return; // silencieux si pas en stock

    let restant = quantite;
    for (const lot of item.lots) {
      if (restant <= 0) break;
      const pris = Math.min(lot.quantite, restant);
      lot.quantite -= pris;
      restant -= pris;
    }
    item.lots = item.lots.filter((l) => l.quantite > 0);
    item.quantiteTotale -= quantite;
    item.statut = this.calculerStatut(item);
    await this.stockRepo.save(item);

    await this.mouvementRepo.save(this.mouvementRepo.create({
      stockItemId: item.id,
      type: TypeMouvement.DELIVRANCE,
      quantite: -quantite,
      motif: 'Délivrance ordonnance',
      pharmacienId,
    }));
  }

  

  private calculerStatut(item: StockItem): StockStatut {
    if (item.quantiteTotale === 0) return StockStatut.RUPTURE;
    const now = new Date();
    if (item.lots.some((l) => new Date(l.dateExpiration) < now && l.quantite > 0)) {
      return StockStatut.PERIME;
    }
    return StockStatut.DISPONIBLE;
  }
}

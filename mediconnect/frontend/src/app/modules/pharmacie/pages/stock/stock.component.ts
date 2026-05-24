import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Tab = 'stock' | 'reception' | 'inventaire' | 'dashboard' | 'retours';

interface StockItem {
  id: string; cip: string; nom: string; dci: string; forme: string;
  dosage: string; fournisseur: string; quantiteTotale: number;
  seuilAlerte: number; prixAchat: number; prixVente: number;
  statut: string; lots: any[]; alerteStockBas: boolean; alertePeremption: boolean;
  prochaineLot?: { dateExpiration: string } | null;
}

interface Dashboard {
  totalProduits: number; totalRuptures: number; totalAlertes: number;
  totalPeremptionProche: number; valeurStock: number;
  top10: any[]; derniersMouvements: any[];
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent implements OnInit {
  private http = inject(HttpClient);

  activeTab = signal<Tab>('stock');
  stock = signal<StockItem[]>([]);
  dashboard = signal<Dashboard | null>(null);
  alertes = signal<any>(null);
  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  searchQuery = '';

  // Réception
  lotsReception: any[] = [this.newLot()];

  // Inventaire
  lignesInventaire: any[] = [];

  // Retour
  retourForm = { stockItemId: '', quantite: 1, lot: '', motif: '' };

  ngOnInit() {
    this.loadStock();
    this.loadDashboard();
    this.loadAlertes();
  }

  loadStock() {
    this.http.get<any>('/api/v1/pharmacie/stock').subscribe({
      next: (r) => this.stock.set(r?.data ?? r),
      error: () => {}
    });
  }

  loadDashboard() {
    this.http.get<any>('/api/v1/pharmacie/stock/dashboard').subscribe({
      next: (r) => this.dashboard.set(r?.data ?? r),
      error: () => {}
    });
  }

  loadAlertes() {
    this.http.get<any>('/api/v1/pharmacie/stock/alertes').subscribe({
      next: (r) => this.alertes.set(r?.data ?? r),
      error: () => {}
    });
  }

  get filteredStock(): StockItem[] {
    const q = this.searchQuery.toLowerCase();
    return this.stock().filter(
      (i) => !q || i.nom.toLowerCase().includes(q) || i.cip.toLowerCase().includes(q) || (i.dci ?? '').toLowerCase().includes(q)
    );
  }

  get alertCount(): number {
    const a = this.alertes();
    if (!a) return 0;
    return (a.stockBas?.length ?? 0) + (a.ruptures?.length ?? 0) + (a.peremptionProche?.length ?? 0);
  }

  newLot() {
    return { cip: '', nom: '', dci: '', forme: '', dosage: '', fournisseur: '', lot: '', quantite: 1, dateExpiration: '', prixAchat: 0, prixVente: 0, seuilAlerte: 10 };
  }

  addLot() { this.lotsReception.push(this.newLot()); }
  removeLot(i: number) { this.lotsReception.splice(i, 1); }

  submitReception() {
    this.loading.set(true); this.successMsg.set(''); this.errorMsg.set('');
    this.http.post<any>('/api/v1/pharmacie/stock/reception', { lots: this.lotsReception }).subscribe({
      next: () => {
        this.successMsg.set('Livraison réceptionnée avec succès');
        this.lotsReception = [this.newLot()];
        this.loadStock(); this.loadDashboard(); this.loadAlertes();
        this.loading.set(false);
      },
      error: (e) => { this.errorMsg.set(e?.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  prepareInventaire() {
    this.lignesInventaire = this.stock().map((i) => ({
      stockItemId: i.id, cip: i.cip, nom: i.nom,
      quantiteSysteme: i.quantiteTotale, quantiteReelle: i.quantiteTotale
    }));
  }

  submitInventaire() {
    this.loading.set(true); this.successMsg.set(''); this.errorMsg.set('');
    const lignes = this.lignesInventaire.map((l) => ({ stockItemId: l.stockItemId, quantiteReelle: Number(l.quantiteReelle) }));
    this.http.post<any>('/api/v1/pharmacie/stock/inventaire', { lignes }).subscribe({
      next: (r) => {
        const rapport = r?.data ?? r;
        const ecarts = rapport.filter((l: any) => l.ecart !== 0);
        this.successMsg.set(`Inventaire terminé — ${ecarts.length} écart(s) corrigé(s)`);
        this.loadStock(); this.loadDashboard();
        this.loading.set(false);
      },
      error: (e) => { this.errorMsg.set(e?.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  submitRetour() {
    this.loading.set(true); this.successMsg.set(''); this.errorMsg.set('');
    this.http.post<any>('/api/v1/pharmacie/stock/retour', {
      ...this.retourForm, quantite: Number(this.retourForm.quantite)
    }).subscribe({
      next: (r) => {
        const res = r?.data ?? r;
        this.successMsg.set(`Retour enregistré — Avoir : ${res.avoirMontant?.toFixed(3)} TND`);
        this.retourForm = { stockItemId: '', quantite: 1, lot: '', motif: '' };
        this.loadStock(); this.loadDashboard();
        this.loading.set(false);
      },
      error: (e) => { this.errorMsg.set(e?.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  getBadgeClass(item: StockItem): string {
    if (item.statut === 'RUPTURE') return 'badge badge-rupture';
    if (item.statut === 'PERIME') return 'badge badge-perime';
    if (item.alerteStockBas) return 'badge badge-alerte';
    return 'badge badge-ok';
  }

  getBadgeLabel(item: StockItem): string {
    if (item.statut === 'RUPTURE') return 'Rupture';
    if (item.statut === 'PERIME') return 'Périmé';
    if (item.alerteStockBas) return 'Stock bas';
    return 'OK';
  }

  formatDate(d: any): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR');
  }

  formatMontant(v: number): string {
    return Number(v ?? 0).toFixed(3) + ' TND';
  }
}

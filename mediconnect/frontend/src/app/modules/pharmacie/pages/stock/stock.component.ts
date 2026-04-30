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
  styles: [`
    .tab-bar { display:flex; gap:4px; margin-bottom:24px; background:white; padding:8px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,.06); border:1px solid #e5e7eb; }
    .tab-btn { padding:8px 18px; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; color:#64748b; background:transparent; transition:all .15s; }
    .tab-btn.active { background:#059669; color:white; }
    .tab-btn:hover:not(.active) { background:#f0fdf4; color:#059669; }
    .alert-badge { display:inline-block; background:#fef2f2; color:#dc2626; border-radius:12px; padding:1px 8px; font-size:11px; font-weight:700; margin-left:6px; }
    .card { background:white; border-radius:14px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,.06); border:1px solid #e5e7eb; margin-bottom:16px; }
    .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; }
    .stat-card { background:white; border-radius:12px; padding:16px; text-align:center; border:1px solid #e5e7eb; }
    .stat-val { font-size:28px; font-weight:700; }
    .stat-lbl { font-size:12px; color:#64748b; margin-top:4px; }
    .green { color:#059669; } .red { color:#dc2626; } .orange { color:#d97706; } .blue { color:#1a56db; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { background:#059669; color:white; padding:10px 12px; text-align:left; font-size:12px; }
    td { padding:10px 12px; border-bottom:1px solid #f1f5f9; }
    tr:hover td { background:#f8fafc; }
    .badge { padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; }
    .badge-ok { background:#f0fdf4; color:#16a34a; }
    .badge-rupture { background:#fef2f2; color:#dc2626; }
    .badge-alerte { background:#fffbeb; color:#d97706; }
    .badge-perime { background:#fdf4ff; color:#9333ea; }
    .form-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:12px; }
    .form-input { width:100%; padding:8px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; box-sizing:border-box; }
    .form-input:focus { border-color:#059669; outline:none; }
    .btn-primary { padding:10px 20px; background:#059669; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-primary:hover { background:#047857; }
    .btn-danger { padding:8px 16px; background:#fef2f2; color:#dc2626; border:1.5px solid #fecaca; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; }
    .btn-add { padding:6px 14px; background:#eff6ff; color:#1a56db; border:1.5px solid #bfdbfe; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; margin-bottom:12px; }
    .alert-box { background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:12px 16px; margin-bottom:12px; font-size:13px; color:#92400e; }
    .success-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:12px; font-size:13px; color:#166534; }
    .error-box { background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:12px; font-size:13px; color:#991b1b; }
    .section-title { font-size:15px; font-weight:700; color:#0f172a; margin-bottom:12px; }
    .top10-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f1f5f9; font-size:13px; }
    .mouv-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #f1f5f9; font-size:12px; }
    .mouv-type { padding:2px 8px; border-radius:8px; font-size:11px; font-weight:600; }
    .mouv-RECEPTION { background:#f0fdf4; color:#16a34a; }
    .mouv-DELIVRANCE { background:#eff6ff; color:#1a56db; }
    .mouv-RETOUR_FOURNISSEUR { background:#fffbeb; color:#d97706; }
    .mouv-INVENTAIRE_AJUSTEMENT { background:#fdf4ff; color:#9333ea; }
    .search-input { padding:8px 14px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; width:280px; }
    .search-input:focus { border-color:#059669; outline:none; }
  `]
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

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Facture {
  numero: string;
  date: string;
  patientNom: string;
  type: string;
  statut: string;
  montant: number;
  devise: string;
}

interface Stats {
  totalRevenu: number;
  nbConsult: number;
  nbTeleconsult: number;
  nbPhysique: number;
  tarif: number;
}

@Component({
  selector: 'app-medecin-revenus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rev-page">

      <div class="page-header">
        <div>
          <h1 class="page-title"> Mes Revenus</h1>
          <p class="page-subtitle">Suivi de vos consultations et export de factures</p>
        </div>
        <button class="btn-export" (click)="exportCsv()" [disabled]="factures().length === 0">
           Exporter CSV
        </button>
      </div>

      <!-- Filtres période -->
      <div class="filters-bar">
        <div class="filter-group">
          <label>Du</label>
          <input type="date" [(ngModel)]="dateFrom" (change)="load()" />
        </div>
        <div class="filter-group">
          <label>Au</label>
          <input type="date" [(ngModel)]="dateTo" (change)="load()" />
        </div>
        <button class="btn-reset" (click)="resetFilters()">Réinitialiser</button>
      </div>

      <!-- Stats cards -->
      <div class="stats-grid" *ngIf="stats()">
        <div class="stat-card blue">
          <div class="stat-icon"></div>
          <div class="stat-val">{{ stats()!.totalRevenu | number:'1.3-3' }} TND</div>
          <div class="stat-lbl">Revenu total</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon"></div>
          <div class="stat-val">{{ stats()!.nbConsult }}</div>
          <div class="stat-lbl">Consultations</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon"></div>
          <div class="stat-val">{{ stats()!.nbTeleconsult }}</div>
          <div class="stat-lbl">Téléconsultations</div>
        </div>
        <div class="stat-card orange">
          <div class="stat-icon"></div>
          <div class="stat-val">{{ stats()!.nbPhysique }}</div>
          <div class="stat-lbl">Consultations physiques</div>
        </div>
      </div>

      <!-- Graphique revenus par mois -->
      <div class="chart-card" *ngIf="parMoisEntries().length > 0">
        <div class="chart-title">Revenus par mois</div>
        <div class="chart-bars">
          <div class="bar-item" *ngFor="let entry of parMoisEntries()">
            <div class="bar-wrap">
              <div class="bar-fill"
                [style.height.%]="getBarHeight(entry[1])"
                [title]="entry[1] + ' TND'">
              </div>
            </div>
            <div class="bar-label">{{ entry[0] }}</div>
            <div class="bar-val">{{ entry[1] | number:'1.0-0' }}</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <!-- Table factures -->
      <div class="table-card" *ngIf="!loading()">
        <div class="table-header">
          <span class="table-title">Détail des factures</span>
          <span class="table-count">{{ factures().length }} facture(s)</span>
        </div>

        <div class="empty" *ngIf="factures().length === 0">
          <div style="font-size:48px"></div>
          <p>Aucune consultation sur cette période</p>
        </div>

        <table class="rev-table" *ngIf="factures().length > 0">
          <thead>
            <tr>
              <th>N° Facture</th>
              <th>Date</th>
              <th>Patient</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of factures()">
              <td class="mono">{{ f.numero }}</td>
              <td>{{ formatDate(f.date) }}</td>
              <td>{{ f.patientNom }}</td>
              <td>
                <span class="type-badge" [class.tele]="f.type === 'TELECONSULTATION'">
                  {{ f.type === 'TELECONSULTATION' ? ' Téléconsult.' : ' Physique' }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class.confirmed]="f.statut === 'CONFIRMED'" [class.completed]="f.statut === 'COMPLETED'">
                  {{ f.statut === 'CONFIRMED' ? 'Confirmé' : 'Terminé' }}
                </span>
              </td>
              <td class="amount">{{ f.montant | number:'1.3-3' }} {{ f.devise }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="total-label">TOTAL</td>
              <td class="total-amount">{{ stats()?.totalRevenu | number:'1.3-3' }} TND</td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  `,
  styles: [`
    .rev-page { padding: 0; font-family: system-ui, sans-serif; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .page-title { font-size:26px; font-weight:700; color:#0f172a; margin:0 0 4px; }
    .page-subtitle { color:#64748b; font-size:14px; margin:0; }

    .btn-export { padding:10px 20px; background:#1a56db; color:white; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-export:hover:not(:disabled) { background:#1447c0; }
    .btn-export:disabled { opacity:.5; cursor:not-allowed; }

    .filters-bar { display:flex; align-items:center; gap:16px; background:white; border-radius:12px; padding:16px 20px; border:1px solid #e5e7eb; margin-bottom:20px; flex-wrap:wrap; }
    .filter-group { display:flex; align-items:center; gap:8px; font-size:13px; color:#64748b; }
    .filter-group input { padding:7px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; }
    .btn-reset { padding:7px 14px; background:#f1f5f9; color:#64748b; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; cursor:pointer; }
    .btn-reset:hover { background:#e2e8f0; }

    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:20px; }
    .stat-card { background:white; border-radius:14px; padding:20px; border:1px solid #e5e7eb; display:flex; flex-direction:column; gap:8px; }
    .stat-card.blue   { border-top:3px solid #1a56db; }
    .stat-card.green  { border-top:3px solid #16a34a; }
    .stat-card.purple { border-top:3px solid #7c3aed; }
    .stat-card.orange { border-top:3px solid #d97706; }
    .stat-icon { font-size:24px; }
    .stat-val { font-size:22px; font-weight:700; color:#0f172a; }
    .stat-lbl { font-size:12px; color:#64748b; }

    .chart-card { background:white; border-radius:14px; padding:20px; border:1px solid #e5e7eb; margin-bottom:20px; }
    .chart-title { font-size:15px; font-weight:700; color:#0f172a; margin-bottom:16px; }
    .chart-bars { display:flex; align-items:flex-end; gap:12px; height:120px; overflow-x:auto; padding-bottom:4px; }
    .bar-item { display:flex; flex-direction:column; align-items:center; gap:4px; min-width:60px; }
    .bar-wrap { height:80px; display:flex; align-items:flex-end; width:100%; }
    .bar-fill { width:100%; background:#1a56db; border-radius:4px 4px 0 0; min-height:4px; transition:height .3s; }
    .bar-label { font-size:10px; color:#64748b; text-align:center; white-space:nowrap; }
    .bar-val { font-size:11px; font-weight:600; color:#0f172a; }

    .loading { display:flex; flex-direction:column; align-items:center; gap:12px; padding:48px; color:#64748b; }
    .spinner { width:36px; height:36px; border:3px solid #e2e8f0; border-top-color:#1a56db; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .table-card { background:white; border-radius:14px; border:1px solid #e5e7eb; overflow:hidden; }
    .table-header { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #e5e7eb; }
    .table-title { font-size:15px; font-weight:700; color:#0f172a; }
    .table-count { font-size:13px; color:#64748b; }

    .empty { text-align:center; padding:48px; color:#94a3b8; }

    .rev-table { width:100%; border-collapse:collapse; font-size:13px; }
    .rev-table th { text-align:left; padding:10px 16px; background:#f8fafc; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid #e5e7eb; }
    .rev-table td { padding:12px 16px; border-bottom:1px solid #f1f5f9; }
    .rev-table tr:hover td { background:#f8fafc; }
    .rev-table tfoot td { padding:12px 16px; border-top:2px solid #e5e7eb; background:#f8fafc; }

    .mono { font-family:monospace; font-size:12px; color:#64748b; }
    .amount { font-weight:700; color:#0f172a; }
    .total-label { font-weight:700; color:#0f172a; text-align:right; }
    .total-amount { font-weight:700; color:#1a56db; font-size:15px; }

    .type-badge { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; background:#f1f5f9; color:#374151; }
    .type-badge.tele { background:#eff6ff; color:#1a56db; }

    .status-badge { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
    .status-badge.confirmed { background:#fffbeb; color:#d97706; }
    .status-badge.completed { background:#f0fdf4; color:#16a34a; }
  `]
})
export class MedecinRevenusComponent implements OnInit {
  private http = inject(HttpClient);

  loading  = signal(true);
  factures = signal<Facture[]>([]);
  stats    = signal<Stats | null>(null);
  parMois  = signal<Record<string, number>>({});

  dateFrom = '';
  dateTo   = '';

  parMoisEntries = computed(() => Object.entries(this.parMois()));

  ngOnInit() {
    // Période par défaut : 3 derniers mois
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - 3);
    this.dateFrom = from.toISOString().split('T')[0];
    this.dateTo   = now.toISOString().split('T')[0];
    this.load();
  }

  load() {
    this.loading.set(true);
    const params = new URLSearchParams();
    if (this.dateFrom) params.set('from', this.dateFrom);
    if (this.dateTo)   params.set('to',   this.dateTo);

    this.http.get<any>(`/api/v1/medecins/revenus/stats?${params}`).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      const d = res?.data ?? res;
      this.factures.set(d?.factures ?? []);
      this.stats.set(d?.stats ?? null);
      this.parMois.set(d?.parMois ?? {});
      this.loading.set(false);
    });
  }

  resetFilters() {
    this.dateFrom = '';
    this.dateTo   = '';
    this.load();
  }

  getBarHeight(val: number): number {
    const max = Math.max(...Object.values(this.parMois()), 1);
    return Math.round((val / max) * 100);
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  exportCsv() {
    const headers = ['N° Facture', 'Date', 'Patient', 'Type', 'Statut', 'Montant (TND)'];
    const rows = this.factures().map(f => [
      f.numero,
      this.formatDate(f.date),
      f.patientNom,
      f.type === 'TELECONSULTATION' ? 'Teleconsultation' : 'Physique',
      f.statut,
      f.montant.toFixed(3),
    ]);

    const csv = [
      headers.join(';'),
      ...rows.map(r => r.map(v => `"${v}"`).join(';')),
      '',
      `"TOTAL";"";"";"";"";"${this.stats()?.totalRevenu?.toFixed(3) ?? '0.000'}"`,
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `factures-${this.dateFrom || 'all'}-${this.dateTo || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

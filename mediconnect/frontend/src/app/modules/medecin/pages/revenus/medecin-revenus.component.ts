import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Facture {
  numero: string;
  date: string;
  patientNom: string;
  type: string;
  statut: string;
  montant: number;
  devise: string;
}

export interface Stats {
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
  templateUrl: './medecin-revenus.component.html',
  styleUrls: ['./medecin-revenus.component.scss'],
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

  formatDateTime(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  exportCsv() {
    const headers = ['N° Facture', 'Date paiement', 'Patient', 'Type', 'Statut', 'Montant (TND)'];
    const rows = this.factures().map(f => [
      f.numero,
      this.formatDate(f.date),
      f.patientNom,
      f.type === 'TELECONSULTATION' ? 'Teleconsultation' : 'Physique',
      'Payé',
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
    a.download = `revenus-${this.dateFrom || 'all'}-${this.dateTo || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-pharmacie-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">

      <!-- Hero Banner -->
      <div class="hero-banner" [style.backgroundImage]="'url(assets/images/pha3jpg.jpg)'">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="hero-tag">Tableau de bord Pharmacie</span>
          <h1 class="hero-title">Voici l'avenir de la pharmacie :<br>Rapide, fluide et directement à vos patients.</h1>
          <p class="hero-desc">Gérez vos ordonnances et votre stock en toute simplicité</p>
        </div>
      </div>

      <div class="inner">
        <!-- Actions rapides -->
        <div class="quick-actions">
          <a routerLink="../delivrance" class="action-card action-primary">
            <span class="action-icon"></span>
            <span class="action-label">Délivrance</span>
            <span class="action-sub">Scanner une ordonnance</span>
          </a>
          <a routerLink="../stock" class="action-card action-secondary">
            <span class="action-icon"></span>
            <span class="action-label">Stock</span>
            <span class="action-sub">Gérer l'inventaire</span>
          </a>
        </div>

        <!-- QR-ORD reçus -->
        <div class="section">
          <div class="section-header">
            <h2> QR-ORD reçus des patients</h2>
            <span class="badge-count" *ngIf="pendingCount() > 0">{{ pendingCount() }} en attente</span>
          </div>

          <div class="loading" *ngIf="loading()">
            <div class="spinner"></div>
          </div>

          <div class="qr-table" *ngIf="!loading()">
            <table *ngIf="qrRequests().length > 0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Code QR-ORD</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of qrRequests()" [class.pending]="r.status === 'PENDING'">
                  <td>{{ formatDate(r.created_at) }}</td>
                  <td>{{ r.patient_name || 'Patient' }}</td>
                  <td><code class="qr-code">{{ r.qr_code }}</code></td>
                  <td>
                    <span class="status-badge" [class.pending]="r.status === 'PENDING'" [class.done]="r.status === 'DONE'">
                      {{ r.status === 'PENDING' ? ' En attente' : ' Traité' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn-scan" (click)="scanQr(r)" *ngIf="r.status === 'PENDING'">
                      Scanner
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="empty" *ngIf="qrRequests().length === 0">
              <p>Aucun QR-ORD reçu pour le moment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 0; }

    /* ── Hero Banner ── */
    .hero-banner {
      position: relative;
      width: 100%;
      height: 260px;
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      overflow: hidden;
      margin-bottom: 32px;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15,23,42,0.55);
    }
    .hero-content {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 48px;
      max-width: 800px;
    }
    .hero-tag {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 4px 14px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.35);
      margin-bottom: 14px;
      width: fit-content;
    }
    .hero-title {
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      margin: 0 0 12px;
      line-height: 1.35;
      text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .hero-desc {
      font-size: 15px;
      color: rgba(255,255,255,0.85);
      margin: 0;
    }

    /* ── Inner content ── */
    .inner { padding: 0 24px 32px; max-width: 1000px; margin: 0 auto; }

    .quick-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 32px; }
    .action-card { display: flex; flex-direction: column; align-items: center; padding: 20px; background: white; border-radius: 12px; border: 1.5px solid #e5e7eb; text-decoration: none; color: #0f172a; transition: all .2s; cursor: pointer; }
    .action-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); border-color: #1a56db; }
    .action-card.action-primary { background: #1a56db; color: white; border-color: #1a56db; }
    .action-card.action-secondary { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
    .action-icon { font-size: 32px; margin-bottom: 8px; }
    .action-label { font-size: 15px; font-weight: 700; }
    .action-sub { font-size: 12px; opacity: .7; margin-top: 2px; }

    .section { background: white; border-radius: 14px; border: 1px solid #e5e7eb; overflow: hidden; }
    .section-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
    .section-header h2 { font-size: 16px; font-weight: 700; margin: 0; }
    .badge-count { background: #ef4444; color: white; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }

    .loading { display: flex; justify-content: center; padding: 32px; }
    .spinner { width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #1a56db; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .qr-table { padding: 0; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
    td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    tr.pending { background: #fffbeb; }
    tr:last-child td { border-bottom: none; }

    .qr-code { font-family: monospace; font-size: 13px; font-weight: 700; color: #1a56db; background: #eff6ff; padding: 2px 8px; border-radius: 6px; }
    .status-badge { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
    .status-badge.pending { background: #fef3c7; color: #d97706; }
    .status-badge.done { background: #dbeafe; color: #1d4ed8; }

    .btn-scan { padding: 6px 14px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-scan:hover { background: #1447c0; }

    .empty { text-align: center; padding: 40px; color: #94a3b8; }
  `]
})
export class PharmacieDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  loading = signal(true);
  qrRequests = signal<any[]>([]);
  pendingCount = signal(0);

  ngOnInit() {
    this.http.get<any>('/api/v1/pharmacies/my-qr-requests')
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(res => {
        let list: any[] = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res?.data?.data)) list = res.data.data;
        this.qrRequests.set(list);
        this.pendingCount.set(list.filter((r: any) => r.status === 'PENDING').length);
        this.loading.set(false);
      });
  }

  scanQr(request: any) {
    this.router.navigate(['/pharmacie/delivrance'], {
      queryParams: { qrCode: request.qr_code }
    });
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}

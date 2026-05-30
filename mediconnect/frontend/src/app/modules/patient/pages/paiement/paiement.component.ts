import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="pay-page">

      <!-- Succès -->
      <div class="result-card success" *ngIf="paymentStatus() === 'success'">
        <div class="result-icon"></div>
        <h2>{{ 'payment.success' | translate }}</h2>
        <p>{{ 'payment.successMsg' | translate }}</p>
        <button class="btn-primary" (click)="router.navigate(['/patient/appointments'])">
          {{ 'payment.backToAppointments' | translate }}
        </button>
      </div>

      <!-- Annulé -->
      <div class="result-card cancelled" *ngIf="paymentStatus() === 'cancelled'">
        <div class="result-icon"></div>
        <h2>{{ 'payment.cancelled' | translate }}</h2>
        <p>{{ 'payment.cancelledMsg' | translate }}</p>
        <button class="btn-secondary" (click)="router.navigate(['/patient/appointments'])">
          {{ 'payment.backBtn' | translate }}
        </button>
      </div>

      <!-- Simulé -->
      <div class="result-card simulated" *ngIf="paymentStatus() === 'simulated'">
        <div class="result-icon"></div>
        <h2>{{ 'payment.simulated' | translate }}</h2>
        <p>{{ 'payment.simulatedMsg' | translate }}</p>
        <button class="btn-primary" (click)="router.navigate(['/patient/appointments'])">
          {{ 'payment.backToAppointments' | translate }}
        </button>
      </div>

      <!-- Page principale de paiement -->
      <div class="pay-container" *ngIf="!paymentStatus()">
        <div class="pay-header">
          <h1> {{ 'payment.title' | translate }}</h1>
          <p>{{ 'payment.subtitle' | translate }}</p>
        </div>

        <div class="alert-success" *ngIf="successMsg()"> {{ successMsg() }}</div>
        <div class="alert-error" *ngIf="errorMsg()"> {{ errorMsg() }}</div>

        <div class="loading" *ngIf="loading()">
          <div class="spinner"></div>
          <p>{{ 'common.loading' | translate }}</p>
        </div>

        <div class="rdv-list" *ngIf="!loading()">
          <div class="rdv-card" *ngFor="let rdv of rdvAPayer()">
            <div class="rdv-info">
              <div class="rdv-doctor">{{ rdv.doctorName }}</div>
              <div class="rdv-date">{{ formatDate(rdv.date) }}</div>
              <div class="rdv-type">
                {{ rdv.consultationType === 'TELECONSULTATION'
                  ? ('appointments.type.TELECONSULTATION' | translate)
                  : ('appointments.type.PHYSICAL' | translate) }}
              </div>
            </div>
            <div class="rdv-amount">
              <div class="amount">{{ rdv.amount }} {{ 'payment.currency' | translate }}</div>
              <div class="status-badge" [class.paid]="rdv.paid" [class.unpaid]="!rdv.paid && rdv.payable" [class.cancelled]="!rdv.payable && !rdv.paid">
                {{ rdv.paid ? ('payment.paid' | translate) : rdv.payable ? ('payment.pending' | translate) : ('appointments.status.CANCELLED' | translate) }}
              </div>
            </div>
            <button
              class="btn-pay"
              *ngIf="rdv.payable && !rdv.paid"
              [disabled]="paying() === rdv.appointmentId"
              (click)="payer(rdv.appointmentId)"
            >
              {{ paying() === rdv.appointmentId ? ('payment.paying' | translate) : ('payment.pay' | translate) }}
            </button>
          </div>

          <div class="empty" *ngIf="noPayablePending()">
            <div style="font-size:48px;margin-bottom:12px"></div>
            <p>{{ 'payment.noPayments' | translate }}</p>
          </div>
        </div>

        <div class="security-note">
           {{ 'payment.security' | translate }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pay-page { min-height: 100vh; background: #f8fafc; padding: 32px 24px; font-family: system-ui, sans-serif; }

    .result-card { max-width: 480px; margin: 80px auto; background: white; border-radius: 20px; padding: 48px 32px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .result-card.success { border-top: 4px solid #16a34a; }
    .result-card.cancelled { border-top: 4px solid #dc2626; }
    .result-card.simulated { border-top: 4px solid #d97706; }
    .result-icon { font-size: 56px; margin-bottom: 16px; }
    .result-card h2 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
    .result-card p { color: #64748b; margin: 0 0 24px; }

    .pay-container { max-width: 680px; margin: 0 auto; }
    .pay-header { margin-bottom: 28px; }
    .pay-header h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0 0 6px; }
    .pay-header p { color: #64748b; font-size: 14px; margin: 0; }

    .alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }
    .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }

    .loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: #64748b; }
    .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #1a56db; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .rdv-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .rdv-card { background: white; border-radius: 14px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.06); border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 16px; }
    .rdv-info { flex: 1; }
    .rdv-doctor { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .rdv-date { font-size: 13px; color: #64748b; margin-bottom: 4px; }
    .rdv-type { font-size: 12px; color: #94a3b8; }
    .rdv-amount { text-align: right; flex-shrink: 0; }
    .amount { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .status-badge { font-size: 12px; font-weight: 600; padding: 2px 10px; border-radius: 20px; }
    .status-badge.paid { background: #f0fdf4; color: #16a34a; }
    .status-badge.unpaid { background: #fffbeb; color: #d97706; }
    .status-badge.cancelled { background: #f1f5f9; color: #94a3b8; }

    .btn-pay { padding: 10px 20px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; flex-shrink: 0; }
    .btn-pay:disabled { opacity: .6; cursor: not-allowed; }
    .btn-pay:hover:not(:disabled) { background: #1447c0; }

    .btn-primary { padding: 12px 24px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-secondary { padding: 12px 24px; background: white; color: #64748b; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }

    .empty { text-align: center; padding: 48px; color: #94a3b8; background: white; border-radius: 14px; border: 1px solid #e5e7eb; }

    .security-note { text-align: center; font-size: 12px; color: #94a3b8; padding: 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
  `]
})
export class PaiementComponent implements OnInit {
  private http = inject(HttpClient);
  router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  paying = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  rdvAPayer = signal<any[]>([]);
  paymentStatus = signal<'success' | 'cancelled' | 'simulated' | null>(null);

  ngOnInit() {
    
    const payment = this.route.snapshot.queryParamMap.get('payment');
    const appointmentId = this.route.snapshot.queryParamMap.get('appointmentId');

    if (payment === 'success') {
      const paymentId = this.route.snapshot.queryParamMap.get('payment_id') ?? '';
      if (paymentId && appointmentId) {
        this.http.get(`/api/v1/payments/verify?payment_id=${paymentId}&appointmentId=${appointmentId}`).subscribe();
      }
      this.paymentStatus.set('success');
      return;
    }
    if (payment === 'cancelled') { this.paymentStatus.set('cancelled'); return; }
    if (payment === 'simulated') {
      
      if (appointmentId) {
        this.http.get(`/api/v1/payments/verify?payment_id=sim_${appointmentId}&appointmentId=${appointmentId}`).subscribe();
      }
      this.paymentStatus.set('simulated');
      return;
    }

    this.loadHistory();
  }

  loadHistory() {
    this.loading.set(true);
    this.http.get<any>('/api/v1/payments/history').subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        
        const all = Array.isArray(data) ? data : [];
        this.rdvAPayer.set(all.filter((r: any) => r.status !== 'NO_SHOW'));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  payer(appointmentId: string) {
    this.paying.set(appointmentId);
    this.errorMsg.set(null);

    this.http.post<any>(`/api/v1/payments/checkout/${appointmentId}`, {}).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        const url = data?.checkoutUrl;
        if (!url) {
          this.errorMsg.set('Impossible de créer la session de paiement');
          this.paying.set(null);
          return;
        }
        
        if (url.includes('/patient/paiement')) {
          const urlObj = new URL(url, window.location.origin);
          const payment = urlObj.searchParams.get('payment');
          const appointmentId = urlObj.searchParams.get('appointmentId');
          this.paying.set(null);
          this.router.navigate(['/patient/paiement'], {
            queryParams: { payment, appointmentId }
          });
        } else {
          
          window.location.href = url;
        }
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || JSON.stringify(err?.error) || 'Erreur lors du paiement';
        this.errorMsg.set(msg);
        this.paying.set(null);
        setTimeout(() => this.errorMsg.set(null), 6000);
      }
    });
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  noPayablePending(): boolean {
    const list = this.rdvAPayer();
    return list.length === 0 || list.every((r: any) => r.paid || !r.payable);
  }
}

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-scanner-pharmacie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title"> Scanner une Ordonnance</h1>
      <p class="page-subtitle">Saisissez le code QR de l'ordonnance pour la valider et enregistrer la dispensation</p>
    </div>

    <!-- Recherche par QR code -->
    <div class="search-card">
      <div class="search-row">
        <input
          class="qr-input"
          type="text"
          [(ngModel)]="qrCode"
          placeholder="Code QR-ORD (ex: QR-ORD-XXXX-YYYY)"
          (keyup.enter)="search()"
        />
        <button class="btn-search" (click)="search()" [disabled]="!qrCode.trim() || searching()">
          {{ searching() ? ' Recherche...' : ' Rechercher' }}
        </button>
      </div>
      <p class="hint">Scannez le QR code ou saisissez le code manuellement</p>
    </div>

    <!-- Erreur -->
    <div class="alert-error" *ngIf="errorMsg()"> {{ errorMsg() }}</div>

    <!-- Succès dispensation -->
    <div class="alert-success" *ngIf="successMsg()"> {{ successMsg() }}</div>

    <!-- Détails ordonnance -->
    <div class="rx-card" *ngIf="prescription()">
      <div class="rx-header">
        <div>
          <div class="rx-title">Ordonnance #{{ prescription()!.id?.substring(0, 8).toUpperCase() }}</div>
          <div class="rx-meta">
            Émise le {{ formatDate(prescription()!.issuedAt) }} — expire le {{ formatDate(prescription()!.expiresAt) }}
          </div>
        </div>
        <span class="rx-badge" [class]="'status-' + prescription()!.status?.toLowerCase()">
          {{ getStatusLabel(prescription()!.status) }}
        </span>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <div class="info-label"> Patient</div>
          <div class="info-value">{{ prescription()!.patientId }}</div>
        </div>
        <div class="info-block">
          <div class="info-label"> Médecin</div>
          <div class="info-value">{{ prescription()!.doctorId }}</div>
        </div>
      </div>

      <!-- Médicaments -->
      <div class="meds-section">
        <h3 class="section-title"> Médicaments</h3>
        <div class="meds-table">
          <div class="table-header">
            <span>Médicament</span>
            <span>Dosage</span>
            <span>Posologie</span>
            <span>Prescrit</span>
            <span>Délivré</span>
            <span>À délivrer</span>
          </div>
          <div class="table-row" *ngFor="let med of prescription()!.medications; let i = index">
            <span class="med-name">{{ med.name }}</span>
            <span>{{ med.dosage }}</span>
            <span>{{ med.posology }}</span>
            <span class="qty-badge">{{ med.quantity }}</span>
            <span class="qty-delivered">{{ med.quantityDelivered ?? 0 }}</span>
            <span>
              <input
                class="qty-input"
                type="number"
                [min]="0"
                [max]="med.quantity - (med.quantityDelivered ?? 0)"
                [(ngModel)]="dispensed[med.cip || med.name || i]"
                [disabled]="isFullyUsed()"
              />
            </span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="notes-block" *ngIf="prescription()!.notes">
        <div class="info-label"> Notes</div>
        <div class="notes-text">{{ prescription()!.notes }}</div>
      </div>

      <!-- Actions -->
      <div class="actions-row" *ngIf="!isFullyUsed()">
        <button class="btn-dispense" (click)="dispense()" [disabled]="dispensing()">
          {{ dispensing() ? ' Enregistrement...' : ' Valider la dispensation' }}
        </button>
        <button class="btn-cancel" (click)="reset()">Annuler</button>
      </div>
      <div class="fully-used-msg" *ngIf="isFullyUsed()">
         Cette ordonnance a été entièrement délivrée.
        <button class="btn-cancel" (click)="reset()" style="margin-left:12px">Nouvelle recherche</button>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; padding-left: 40px; padding-top: 20px; }
    .page-title { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-subtitle { color: #64748b; font-size: 14px; margin: 0; }

    .search-card { background: white; border-radius: 12px; padding: 16px 20px; box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #e5e7eb; margin-bottom: 20px; max-width: 700px; margin-left: auto; margin-right: auto; }
    .search-row { display: flex; gap: 12px; }
    .qr-input { flex: 1; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 15px; color: #0f172a; outline: none; font-family: monospace; }
    .qr-input:focus { border-color: #1a56db; }
    .btn-search { padding: 12px 24px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .btn-search:disabled { opacity: .6; cursor: not-allowed; }
    .hint { font-size: 12px; color: #94a3b8; margin: 8px 0 0; }

    .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }
    .alert-success { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }

    .rx-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #e5e7eb; }
    .rx-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .rx-title { font-size: 18px; font-weight: 700; color: #0f172a; font-family: monospace; }
    .rx-meta { font-size: 13px; color: #64748b; margin-top: 4px; }
    .rx-badge { padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-active { background: #eff6ff; color: #1d4ed8; }
    .status-expired { background: #fef2f2; color: #dc2626; }
    .status-fully_used { background: #f1f5f9; color: #64748b; }
    .status-partially_used { background: #fffbeb; color: #d97706; }
    .status-revoked { background: #fef2f2; color: #dc2626; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .info-block { background: #f8fafc; border-radius: 10px; padding: 12px 16px; }
    .info-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }
    .info-value { font-size: 14px; color: #0f172a; font-family: monospace; word-break: break-all; }

    .meds-section { margin-bottom: 20px; }
    .section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
    .meds-table { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
    .table-header { display: grid; grid-template-columns: 2fr 1fr 2fr 80px 80px 100px; gap: 8px; padding: 10px 16px; background: #1a56db; color: white; font-size: 12px; font-weight: 600; }
    .table-row { display: grid; grid-template-columns: 2fr 1fr 2fr 80px 80px 100px; gap: 8px; padding: 12px 16px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #374151; align-items: center; }
    .table-row:nth-child(even) { background: #f8fafc; }
    .med-name { font-weight: 600; color: #0f172a; }
    .qty-badge { background: #eff6ff; color: #1a56db; padding: 2px 8px; border-radius: 12px; font-weight: 600; text-align: center; }
    .qty-delivered { background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 12px; font-weight: 600; text-align: center; }
    .qty-input { width: 70px; padding: 6px 8px; border: 1.5px solid #e2e8f0; border-radius: 6px; font-size: 13px; text-align: center; }
    .qty-input:focus { border-color: #1a56db; outline: none; }

    .notes-block { background: #fffbeb; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; }
    .notes-text { font-size: 14px; color: #374151; font-style: italic; }

    .actions-row { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-dispense { padding: 12px 28px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-dispense:disabled { opacity: .6; cursor: not-allowed; }
    .btn-cancel { padding: 12px 20px; background: white; color: #64748b; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .fully-used-msg { color: #1d4ed8; font-weight: 600; font-size: 14px; display: flex; align-items: center; }
  `]
})
export class ScannerPharmacieComponent {
  private http = inject(HttpClient);

  qrCode     = '';
  searching  = signal(false);
  dispensing = signal(false);
  errorMsg   = signal('');
  successMsg = signal('');
  prescription = signal<any>(null);
  dispensed: Record<string, number> = {};

  search() {
    const code = this.qrCode.trim();
    if (!code) return;
    this.searching.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');
    this.prescription.set(null);
    this.dispensed = {};

    this.http.get<any>(`/api/v1/prescriptions/qr/${encodeURIComponent(code)}`).subscribe({
      next: res => {
        const outer = res?.data ?? res;
        const data = outer?.data ?? outer;
        this.prescription.set(data);
        
        (data?.medications ?? []).forEach((m: any, i: number) => {
          this.dispensed[m.cip || m.name || i] = 0;
        });
        this.searching.set(false);
      },
      error: err => {
        const msg = err?.error?.message;
        this.errorMsg.set(Array.isArray(msg) ? msg.join(', ') : msg || 'Ordonnance introuvable');
        this.searching.set(false);
      }
    });
  }

  dispense() {
    const rx = this.prescription();
    if (!rx) return;
    this.dispensing.set(true);
    this.errorMsg.set('');

    this.http.post<any>('/api/v1/prescriptions/scan-pharmacy', {
      qrCode: rx.qrCode,
      dispensedQuantities: this.dispensed
    }).subscribe({
      next: res => {
        const outer = res?.data ?? res;
        const updated = outer?.data ?? outer;
        this.prescription.set(updated);
        this.successMsg.set('Dispensation enregistrée avec succès');
        this.dispensing.set(false);
      },
      error: err => {
        const msg = err?.error?.message;
        this.errorMsg.set(Array.isArray(msg) ? msg.join(', ') : msg || 'Erreur lors de la dispensation');
        this.dispensing.set(false);
      }
    });
  }

  isFullyUsed(): boolean {
    return this.prescription()?.status === 'FULLY_USED';
  }

  reset() {
    this.prescription.set(null);
    this.qrCode = '';
    this.errorMsg.set('');
    this.successMsg.set('');
    this.dispensed = {};
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatusLabel(s: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Active', EXPIRED: 'Expirée', FULLY_USED: 'Entièrement délivrée',
      PARTIALLY_USED: 'Partiellement délivrée', REVOKED: 'Révoquée'
    };
    return labels[s] || s;
  }
}

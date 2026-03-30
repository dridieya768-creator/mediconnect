import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { QRCodeModule } from "angularx-qrcode";

@Component({
  selector: "app-patient-prescriptions",
  standalone: true,
  imports: [CommonModule, QRCodeModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">💊 Mes Ordonnances</h1>
      <p class="page-subtitle">Consultez, téléchargez ou présentez le QR code à votre pharmacien</p>
    </div>

    <div class="loading-state" *ngIf="loading()">
      <div class="spinner"></div><p>Chargement...</p>
    </div>

    <div *ngIf="!loading()">
      <div class="rx-list" *ngIf="prescriptions().length > 0">
        <div class="rx-card" *ngFor="let rx of prescriptions()">
          <div class="rx-body">
            <!-- Infos ordonnance -->
            <div class="rx-info">
              <div class="rx-header">
                <div>
                  <div class="rx-doctor">Dr. {{ getDoctorName(rx) }}</div>
                  <div class="rx-date">{{ formatDate(rx.issuedAt) }} — expire {{ formatDate(rx.expiresAt) }}</div>
                </div>
                <span class="rx-badge" [class]="'status-' + rx.status.toLowerCase()">{{ getStatusLabel(rx.status) }}</span>
              </div>
              <div class="rx-meds">
                <span class="med-tag" *ngFor="let m of rx.medications">{{ m.name }} {{ m.dosage }}</span>
              </div>
              <div class="rx-actions">
                <button class="btn-dl" (click)="download(rx)" [disabled]="!rx.pdfUrl">
                  {{ rx.pdfUrl ? '⬇ PDF' : 'PDF non disponible' }}
                </button>
                <button class="btn-qr" (click)="showQr(rx)" *ngIf="rx.qrCode">
                  📲 Afficher QR Code
                </button>
              </div>
            </div>

            <!-- QR Code miniature -->
            <div class="rx-qr-mini" *ngIf="rx.qrCode" (click)="showQr(rx)" title="Cliquer pour agrandir">
              <qrcode
                [qrdata]="getQrData(rx)"
                [width]="90"
                [errorCorrectionLevel]="'M'"
                [colorDark]="'#0f172a'"
                [colorLight]="'#ffffff'"
                [margin]="1"
              ></qrcode>
              <div class="qr-label">QR-ORD</div>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="prescriptions().length === 0">
        <div style="font-size:48px">💊</div>
        <p>Aucune ordonnance pour le moment</p>
      </div>
    </div>

    <!-- Modal QR Code agrandi -->
    <div class="modal-overlay" *ngIf="selectedRx()" (click)="closeQr()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closeQr()">✕</button>
        <h2 class="modal-title">📲 QR Code Ordonnance</h2>
        <p class="modal-sub">Présentez ce code à votre pharmacien</p>

        <div class="qr-container">
          <qrcode
            [qrdata]="getQrData(selectedRx()!)"
            [width]="240"
            [errorCorrectionLevel]="'M'"
            [colorDark]="'#0f172a'"
            [colorLight]="'#ffffff'"
            [margin]="2"
          ></qrcode>
        </div>

        <!-- Indication selon type de QR -->
        <div class="qr-hint" *ngIf="selectedRx()!.pdfUrl">
          📄 Ce QR ouvre directement le PDF de l'ordonnance
        </div>
        <div class="qr-hint qr-hint-code" *ngIf="!selectedRx()!.pdfUrl">
          🔑 Code à saisir manuellement chez le pharmacien
        </div>

        <div class="qr-code-text">{{ selectedRx()!.qrCode }}</div>

        <!-- Bouton ouvrir PDF -->
        <button class="btn-open-pdf" *ngIf="selectedRx()!.pdfUrl" (click)="download(selectedRx()!)">
          ⬇ Télécharger le PDF
        </button>

        <div class="modal-info">
          <div class="info-row">
            <span class="info-label">Médecin</span>
            <span>Dr. {{ getDoctorName(selectedRx()!) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Émis le</span>
            <span>{{ formatDate(selectedRx()!.issuedAt) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Expire le</span>
            <span>{{ formatDate(selectedRx()!.expiresAt) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Médicaments</span>
            <span>{{ getMedNames(selectedRx()!) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-subtitle { color: #64748b; font-size: 14px; margin: 0; }

    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #64748b; gap: 12px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #1a56db; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .rx-list { display: flex; flex-direction: column; gap: 16px; }
    .rx-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #e5e7eb; }
    .rx-body { display: flex; gap: 20px; align-items: flex-start; }
    .rx-info { flex: 1; }

    .rx-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .rx-doctor { font-size: 16px; font-weight: 700; color: #0f172a; }
    .rx-date { font-size: 12px; color: #64748b; margin-top: 2px; }
    .rx-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
    .status-active { background: #f0fdf4; color: #16a34a; }
    .status-expired { background: #fef2f2; color: #dc2626; }
    .status-fully_used { background: #f1f5f9; color: #64748b; }
    .status-partially_used { background: #fffbeb; color: #d97706; }
    .status-revoked { background: #fef2f2; color: #dc2626; }

    .rx-meds { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .med-tag { background: #eff6ff; color: #1a56db; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }

    .rx-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn-dl { padding: 8px 14px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-dl:disabled { opacity: .5; cursor: not-allowed; background: #94a3b8; }
    .btn-qr { padding: 8px 14px; background: #f0fdf4; color: #16a34a; border: 1.5px solid #bbf7d0; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-qr:hover { background: #dcfce7; }

    .rx-qr-mini { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 8px; border: 1.5px solid #e2e8f0; border-radius: 12px; transition: border-color .2s; flex-shrink: 0; }
    .rx-qr-mini:hover { border-color: #1a56db; }
    .qr-label { font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: .05em; }

    .empty-state { text-align: center; padding: 60px 20px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 12px; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal-box { background: white; border-radius: 20px; padding: 32px; max-width: 420px; width: 100%; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-close { position: absolute; top: 16px; right: 16px; background: #f1f5f9; border: none; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; font-size: 14px; color: #64748b; }
    .modal-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .modal-sub { font-size: 13px; color: #64748b; margin: 0 0 24px; }

    .qr-container { display: flex; justify-content: center; background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 16px; }
    .qr-code-text { text-align: center; font-family: monospace; font-size: 12px; color: #64748b; background: #f1f5f9; padding: 8px 12px; border-radius: 8px; margin-bottom: 20px; word-break: break-all; }

    .qr-hint { text-align: center; font-size: 12px; color: #16a34a; background: #f0fdf4; border-radius: 8px; padding: 6px 12px; margin-bottom: 10px; }
    .qr-hint-code { color: #d97706; background: #fffbeb; }
    .btn-open-pdf { width: 100%; padding: 10px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 16px; }
    .btn-open-pdf:hover { background: #1e40af; }

    .modal-info { display: flex; flex-direction: column; gap: 10px; }
    .info-row { display: flex; justify-content: space-between; font-size: 13px; color: #374151; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .info-label { font-weight: 600; color: #64748b; }
  `]
})
export class PatientPrescriptionsComponent implements OnInit {
  private http = inject(HttpClient);

  loading       = signal(true);
  prescriptions = signal<any[]>([]);
  selectedRx    = signal<any>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any>('/api/v1/patients/me').subscribe({
      next: res => {
        const outer = res?.data ?? res;
        const profile = outer?.data ?? outer;
        if (!profile?.id) { this.loading.set(false); return; }
        this.http.get<any>(`/api/v1/prescriptions/patient/${profile.id}`).subscribe({
          next: r => {
            const outer = r?.data ?? r;
            const list = Array.isArray(outer) ? outer : (outer?.data ?? outer);
            this.prescriptions.set(Array.isArray(list) ? list : []);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });
  }

  showQr(rx: any) { this.selectedRx.set(rx); }
  closeQr() { this.selectedRx.set(null); }

  getDoctorName(rx: any): string {
    return rx.doctor ? `${rx.doctor.firstName || ''} ${rx.doctor.lastName || ''}`.trim() : 'Médecin';
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatusLabel(s: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Active', EXPIRED: 'Expirée', FULLY_USED: 'Délivrée', PARTIALLY_USED: 'Partielle', REVOKED: 'Révoquée'
    };
    return labels[s] || s;
  }

  // Encode l'URL du PDF dans le QR si disponible, sinon le code QR-ORD
  getQrData(rx: any): string {
    if (rx.pdfUrl) {
      // URL absolue pour que le scan téléphone ouvre directement le PDF
      const base = window.location.origin;
      return rx.pdfUrl.startsWith('http') ? rx.pdfUrl : `${base}${rx.pdfUrl}`;
    }
    return rx.qrCode ?? '';
  }

  getMedNames(rx: any): string {
    return (rx.medications ?? []).map((m: any) => m.name).join(', ');
  }

  download(rx: any) {
    if (!rx.pdfUrl) return;
    const a = document.createElement('a');
    a.href = rx.pdfUrl;
    a.download = `ordonnance-${rx.id}.pdf`;
    a.target = '_blank';
    a.click();
  }
}

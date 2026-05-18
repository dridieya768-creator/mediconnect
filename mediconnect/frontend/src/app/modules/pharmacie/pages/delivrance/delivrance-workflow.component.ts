import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Step = 'scan-qr' | 'verification' | 'scan-boites' | 'recapitulatif' | 'confirmation';

interface MedicationDetail {
  cip: string;
  name: string;
  dosage: string;
  posology: string;
  durationDays: number;
  quantity: number;
  quantityDelivered: number;
  isSubstitutable: boolean;
  prixUnitaire: number;
  tauxCnam: number;
}

interface PrescriptionDetail {
  id: string;
  qrCode: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
  patient: { id: string; nom: string; prenom: string; nss: string };
  medecin: { id: string; nom: string; prenom: string; rpps: string | null };
  medications: MedicationDetail[];
  notes?: string;
}

interface FinancierLigne {
  cip: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
  partCnam: number;
  partPatient: number;
}

interface Financier {
  lignes: FinancierLigne[];
  totalCnam: number;
  totalPatient: number;
  totalGeneral: number;
}

@Component({
  selector: 'app-delivrance-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Indicateur d'étapes -->
    <div class="steps-bar">
      <div class="step-item" [class.active]="currentStep() === 'scan-qr'" [class.done]="isStepDone('scan-qr')">
        <div class="step-circle">1</div>
        <div class="step-label">Scan QR</div>
      </div>
      <div class="step-connector" [class.done]="isStepDone('scan-qr')"></div>
      <div class="step-item" [class.active]="currentStep() === 'verification'" [class.done]="isStepDone('verification')">
        <div class="step-circle">2</div>
        <div class="step-label">Vérification</div>
      </div>
      <div class="step-connector" [class.done]="isStepDone('verification')"></div>
      <div class="step-item" [class.active]="currentStep() === 'scan-boites'" [class.done]="isStepDone('scan-boites')">
        <div class="step-circle">3</div>
        <div class="step-label">Scan boîtes</div>
      </div>
      <div class="step-connector" [class.done]="isStepDone('scan-boites')"></div>
      <div class="step-item" [class.active]="currentStep() === 'recapitulatif'" [class.done]="isStepDone('recapitulatif')">
        <div class="step-circle">4</div>
        <div class="step-label">Récapitulatif</div>
      </div>
      <div class="step-connector" [class.done]="isStepDone('recapitulatif')"></div>
      <div class="step-item" [class.active]="currentStep() === 'confirmation'" [class.done]="isStepDone('confirmation')">
        <div class="step-circle">5</div>
        <div class="step-label">Confirmation</div>
      </div>
    </div>

    <!-- ÉTAPE 1 : Scan QR-ORD -->
    <div class="step-content" *ngIf="currentStep() === 'scan-qr'">
      <div class="page-header">
        <h1 class="page-title"> Délivrance — Scan QR-ORD</h1>
        <p class="page-subtitle">Saisissez ou scannez le code QR de l'ordonnance</p>
      </div>
      <div class="card">
        <div class="search-row">
          <input class="qr-input" type="text" [(ngModel)]="qrCodeInput"
            placeholder="Code QR-ORD (ex: QR-ORD-XXXX-YYYY)"
            (keyup.enter)="scanQrOrd()" />
          <button class="btn-primary" (click)="scanQrOrd()" [disabled]="!qrCodeInput.trim() || loading()">
            {{ loading() ? ' Scan...' : ' Scanner' }}
          </button>
        </div>
        <p class="hint">Scannez le QR code ou saisissez le code manuellement</p>
        <div class="alert-error" *ngIf="error()"> {{ error() }}</div>
      </div>
    </div>

    <!-- ÉTAPE 2 : Vérification -->
    <div class="step-content" *ngIf="currentStep() === 'verification'">
      <div class="page-header">
        <h1 class="page-title"> Vérification de l'ordonnance</h1>
        <p class="page-subtitle">Vérifiez les informations avant de procéder à la délivrance</p>
      </div>
      <div class="card" *ngIf="prescription()">
        <div class="valid-badge"> Ordonnance valide</div>
        <div class="info-grid">
          <div class="info-block">
            <div class="info-label"> Patient</div>
            <div class="info-value">{{ prescription()!.patient.prenom }} {{ prescription()!.patient.nom }}</div>
            <div class="info-sub">NSS : {{ prescription()!.patient.nss }}</div>
          </div>
          <div class="info-block">
            <div class="info-label"> Médecin</div>
            <div class="info-value">Dr {{ prescription()!.medecin.prenom }} {{ prescription()!.medecin.nom }}</div>
            <div class="info-sub" *ngIf="prescription()!.medecin.rpps">RPPS : {{ prescription()!.medecin.rpps }}</div>
          </div>
          <div class="info-block">
            <div class="info-label"> Date d'émission</div>
            <div class="info-value">{{ formatDate(prescription()!.issuedAt) }}</div>
          </div>
          <div class="info-block">
            <div class="info-label"> Date d'expiration</div>
            <div class="info-value">{{ formatDate(prescription()!.expiresAt) }}</div>
          </div>
        </div>
        <h3 class="section-title"> Médicaments prescrits</h3>
        <div class="meds-list">
          <div class="med-item" *ngFor="let med of prescription()!.medications">
            <div class="med-name">{{ med.name }}</div>
            <div class="med-details">
              <span class="tag">{{ med.dosage }}</span>
              <span class="tag">{{ med.posology }}</span>
              <span class="tag">{{ med.durationDays }} jours</span>
              <span class="tag qty">Qté : {{ med.quantity - med.quantityDelivered }} à délivrer</span>
            </div>
            <div class="med-cip">CIP : {{ med.cip }}</div>
          </div>
        </div>
        <div class="notes-block" *ngIf="prescription()!.notes">
          <div class="info-label"> Notes</div>
          <div class="notes-text">{{ prescription()!.notes }}</div>
        </div>
        <div class="alert-error" *ngIf="error()"> {{ error() }}</div>
        <div class="actions-row">
          <button class="btn-primary" (click)="goToScanBoites()">
             Commencer le scan des boîtes
          </button>
        </div>
      </div>
    </div>

    <!-- ÉTAPE 3 : Scan boîtes -->
    <div class="step-content" *ngIf="currentStep() === 'scan-boites'">
      <div class="page-header">
        <h1 class="page-title"> Scan des boîtes</h1>
        <p class="page-subtitle">Scannez ou saisissez le CIP de chaque boîte à délivrer</p>
      </div>
      <div class="card" *ngIf="prescription()">
        <div class="meds-scan-list">
          <div class="med-scan-item" *ngFor="let med of getMedicationsWithPrix()">
            <div class="med-scan-header">
              <div>
                <div class="med-name">{{ med.name }}</div>
                <div class="med-cip">CIP : {{ med.cip }}</div>
              </div>
              <div class="counter-badge">
                <span class="counter-current">{{ boitesScannees()[med.cip] || 0 }}</span>
                <span class="counter-sep">/</span>
                <span class="counter-total">{{ med.quantity - med.quantityDelivered }}</span>
              </div>
            </div>
            <div class="scan-row">
              <input class="cip-input" type="text" [(ngModel)]="cipInputs[med.cip]"
                placeholder="Saisir CIP ou scanner boîte"
                (keyup.enter)="scanMedCip(med.cip)" />
              <button class="btn-scan" (click)="scanMedCip(med.cip)"
                [disabled]="!cipInputs[med.cip].trim() || loading()">
                Scanner
              </button>
            </div>
            <div class="prix-row">
              <label class="prix-label">Prix unitaire (TND) :</label>
              <input class="prix-input" type="number" min="0" step="0.01"
                [(ngModel)]="prixInputs[med.cip]" placeholder="0.00" />
              <label class="prix-label" style="margin-left:16px">Taux CNAM :</label>
              <input class="prix-input" type="number" min="0" max="1" step="0.01"
                [(ngModel)]="tauxInputs[med.cip]" placeholder="0.70" />
            </div>
          </div>
        </div>
        <div class="alert-error" *ngIf="error()"> {{ error() }}</div>
        <div class="actions-row">
          <button class="btn-primary" (click)="calculerRecapitulatif()">
             Calculer le récapitulatif
          </button>
        </div>
      </div>
    </div>

    <!-- ÉTAPE 4 : Récapitulatif financier -->
    <div class="step-content" *ngIf="currentStep() === 'recapitulatif'">
      <div class="page-header">
        <h1 class="page-title"> Récapitulatif financier</h1>
        <p class="page-subtitle">Vérifiez le détail financier avant de confirmer la délivrance</p>
      </div>
      <div class="card" *ngIf="financier()">
        <div class="financier-table">
          <div class="fin-header">
            <span>Médicament</span>
            <span>Qté</span>
            <span>Prix unit.</span>
            <span>Part CNAM</span>
            <span>Part patient</span>
            <span>Total</span>
          </div>
          <div class="fin-row" *ngFor="let ligne of financier()!.lignes">
            <span class="fin-nom">{{ ligne.nom }}</span>
            <span>{{ ligne.quantite }}</span>
            <span>{{ ligne.prixUnitaire | number:'1.2-2' }} TND</span>
            <span class="cnam-val">{{ ligne.partCnam | number:'1.2-2' }} TND</span>
            <span class="patient-val">{{ ligne.partPatient | number:'1.2-2' }} TND</span>
            <span class="total-val">{{ ligne.montantTotal | number:'1.2-2' }} TND</span>
          </div>
        </div>
        <div class="totaux-row">
          <div class="total-block cnam-block">
            <div class="total-label">Total CNAM</div>
            <div class="total-amount">{{ financier()!.totalCnam | number:'1.2-2' }} TND</div>
          </div>
          <div class="total-block patient-block">
            <div class="total-label">Total Patient</div>
            <div class="total-amount">{{ financier()!.totalPatient | number:'1.2-2' }} TND</div>
          </div>
          <div class="total-block general-block">
            <div class="total-label">Total Général</div>
            <div class="total-amount">{{ financier()!.totalGeneral | number:'1.2-2' }} TND</div>
          </div>
        </div>
        <div class="alert-error" *ngIf="error()"> {{ error() }}</div>
        <div class="actions-row">
          <button class="btn-secondary" (click)="currentStep.set('scan-boites')">← Retour</button>
          <button class="btn-primary" (click)="confirmerDelivrance()" [disabled]="loading()">
            {{ loading() ? ' Confirmation...' : ' Confirmer la délivrance' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ÉTAPE 5 : Confirmation -->
    <div class="step-content" *ngIf="currentStep() === 'confirmation'">
      <div class="page-header">
        <h1 class="page-title"> Délivrance confirmée</h1>
      </div>
      <div class="card confirmation-card">
        <div class="success-icon"></div>
        <div class="success-msg">Délivrance enregistrée avec succès</div>
        <div class="success-sub" *ngIf="prescription()">
          Ordonnance #{{ prescription()!.id.substring(0, 8).toUpperCase() }} —
          Patient : {{ prescription()!.patient.prenom }} {{ prescription()!.patient.nom }}
        </div>
        <div class="ticket-row" *ngIf="ticketUrl()">
          <a class="btn-ticket" [href]="ticketUrl()!" target="_blank" download>
             Télécharger le ticket PDF
          </a>
        </div>
        <div class="alert-error" *ngIf="error()"> {{ error() }}</div>
        <div class="actions-row" style="justify-content:center; margin-top:24px">
          <button class="btn-primary" (click)="nouvelleDelivrance()">
             Nouvelle délivrance
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .steps-bar { display: flex; align-items: center; margin-bottom: 32px; padding: 20px 24px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #e5e7eb; }
    .step-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .step-circle { width: 36px; height: 36px; border-radius: 50%; background: #e2e8f0; color: #94a3b8; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all .2s; }
    .step-item.active .step-circle { background: #1a56db; color: white; box-shadow: 0 0 0 4px rgba(5,150,105,.2); }
    .step-item.done .step-circle { background: #1d4ed8; color: white; }
    .step-label { font-size: 11px; font-weight: 600; color: #94a3b8; white-space: nowrap; }
    .step-item.active .step-label { color: #1a56db; }
    .step-item.done .step-label { color: #1d4ed8; }
    .step-connector { flex: 1; height: 2px; background: #e2e8f0; margin: 0 8px; margin-bottom: 18px; transition: background .2s; }
    .step-connector.done { background: #1d4ed8; }

    .step-content { animation: fadeIn .2s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .page-header { margin-bottom: 20px; }
    .page-title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-subtitle { color: #64748b; font-size: 14px; margin: 0; }

    .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #e5e7eb; }

    .search-row { display: flex; gap: 12px; margin-bottom: 8px; }
    .qr-input { flex: 1; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 15px; color: #0f172a; outline: none; font-family: monospace; }
    .qr-input:focus { border-color: #1a56db; }
    .hint { font-size: 12px; color: #94a3b8; margin: 0 0 16px; }

    .btn-primary { padding: 12px 24px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
    .btn-primary:hover:not(:disabled) { background: #1447c0; }
    .btn-secondary { padding: 12px 20px; background: white; color: #64748b; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-secondary:hover { background: #f8fafc; }

    .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; margin: 12px 0; }
    .alert-success { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px 16px; margin: 12px 0; }

    .valid-badge { display: inline-flex; align-items: center; gap: 8px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 10px; padding: 10px 18px; font-weight: 700; font-size: 15px; margin-bottom: 20px; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .info-block { background: #f8fafc; border-radius: 10px; padding: 12px 16px; }
    .info-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }
    .info-value { font-size: 14px; font-weight: 600; color: #0f172a; }
    .info-sub { font-size: 12px; color: #64748b; margin-top: 2px; font-family: monospace; }

    .section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
    .meds-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .med-item { background: #f8fafc; border-radius: 10px; padding: 12px 16px; border: 1px solid #e2e8f0; }
    .med-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .med-details { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
    .tag { background: #eff6ff; color: #1a56db; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .tag.qty { background: #eff6ff; color: #1d4ed8; }
    .med-cip { font-size: 11px; color: #94a3b8; font-family: monospace; }

    .notes-block { background: #fffbeb; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }
    .notes-text { font-size: 14px; color: #374151; font-style: italic; }

    .actions-row { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }

    .meds-scan-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
    .med-scan-item { background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; }
    .med-scan-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .counter-badge { display: flex; align-items: center; gap: 4px; background: white; border: 2px solid #1a56db; border-radius: 10px; padding: 6px 14px; }
    .counter-current { font-size: 20px; font-weight: 700; color: #1a56db; }
    .counter-sep { font-size: 16px; color: #94a3b8; }
    .counter-total { font-size: 16px; font-weight: 600; color: #64748b; }
    .scan-row { display: flex; gap: 10px; margin-bottom: 10px; }
    .cip-input { flex: 1; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: monospace; outline: none; }
    .cip-input:focus { border-color: #1a56db; }
    .btn-scan { padding: 10px 18px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-scan:disabled { opacity: .6; cursor: not-allowed; }
    .btn-scan:hover:not(:disabled) { background: #1e40af; }
    .prix-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .prix-label { font-size: 12px; color: #64748b; font-weight: 500; }
    .prix-input { width: 90px; padding: 6px 10px; border: 1.5px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; }
    .prix-input:focus { border-color: #1a56db; }

    .financier-table { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
    .fin-header { display: grid; grid-template-columns: 2fr 60px 120px 120px 120px 120px; gap: 8px; padding: 10px 16px; background: #1a56db; color: white; font-size: 12px; font-weight: 600; }
    .fin-row { display: grid; grid-template-columns: 2fr 60px 120px 120px 120px 120px; gap: 8px; padding: 12px 16px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #374151; align-items: center; }
    .fin-row:nth-child(even) { background: #f8fafc; }
    .fin-nom { font-weight: 600; color: #0f172a; }
    .cnam-val { color: #1a56db; font-weight: 500; }
    .patient-val { color: #d97706; font-weight: 500; }
    .total-val { color: #0f172a; font-weight: 700; }

    .totaux-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .total-block { border-radius: 12px; padding: 16px; text-align: center; }
    .cnam-block { background: #eff6ff; border: 1px solid #bfdbfe; }
    .patient-block { background: #fffbeb; border: 1px solid #fde68a; }
    .general-block { background: #eff6ff; border: 1px solid #bfdbfe; }
    .total-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 6px; }
    .cnam-block .total-amount { color: #1a56db; font-size: 18px; font-weight: 700; }
    .patient-block .total-amount { color: #d97706; font-size: 18px; font-weight: 700; }
    .general-block .total-amount { color: #1d4ed8; font-size: 18px; font-weight: 700; }

    .confirmation-card { text-align: center; padding: 40px 24px; }
    .success-icon { font-size: 64px; margin-bottom: 16px; }
    .success-msg { font-size: 22px; font-weight: 700; color: #1d4ed8; margin-bottom: 8px; }
    .success-sub { font-size: 14px; color: #64748b; margin-bottom: 24px; }
    .ticket-row { margin: 20px 0; }
    .btn-ticket { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #1a56db; color: white; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; }
    .btn-ticket:hover { background: #1e40af; }
  `]
})
export class DelivranceWorkflowComponent {
  private http = inject(HttpClient);

  // ── State signals ──────────────────────────────────────────────────────────
  currentStep = signal<Step>('scan-qr');
  prescription = signal<PrescriptionDetail | null>(null);
  boitesScannees = signal<Record<string, number>>({});
  financier = signal<Financier | null>(null);
  ticketUrl = signal<string | null>(null);
  error = signal<string>('');
  loading = signal<boolean>(false);

  // ── Local form state ───────────────────────────────────────────────────────
  qrCodeInput = '';
  cipInputs: Record<string, string> = {};
  prixInputs: Record<string, number> = {};
  tauxInputs: Record<string, number> = {};

  // ── Step helpers ───────────────────────────────────────────────────────────
  private readonly stepOrder: Step[] = ['scan-qr', 'verification', 'scan-boites', 'recapitulatif', 'confirmation'];

  isStepDone(step: Step): boolean {
    const currentIdx = this.stepOrder.indexOf(this.currentStep());
    const stepIdx = this.stepOrder.indexOf(step);
    return stepIdx < currentIdx;
  }

  // ── Étape 1 : Scan QR-ORD ─────────────────────────────────────────────────
  scanQrOrd(): void {
    const code = this.qrCodeInput.trim();
    if (!code) return;
    this.loading.set(true);
    this.error.set('');

    this.http.post<any>('/api/v1/pharmacie/scan-qr-ord', { qrCode: code }).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        const detail: PrescriptionDetail = data?.data ?? data;
        // Initialiser les prix/taux par défaut
        (detail.medications ?? []).forEach((med: MedicationDetail, idx: number) => {
          // Si CIP vide, utiliser l'index comme clé temporaire
          if (!med.cip || med.cip.trim() === '') {
            med.cip = `MED_${idx}`;
          }
          med.prixUnitaire = 0;
          med.tauxCnam = 0.70;
          this.prixInputs[med.cip] = 0;
          this.tauxInputs[med.cip] = 0.70;
          this.cipInputs[med.cip] = '';
        });
        this.prescription.set(detail);
        this.loading.set(false);
        this.currentStep.set('verification');
      },
      error: (err) => {
        const msg = err?.error?.message;
        this.error.set(Array.isArray(msg) ? msg.join(', ') : msg || 'Erreur lors du scan QR');
        this.loading.set(false);
      }
    });
  }

  // ── Étape 2 → 3 ───────────────────────────────────────────────────────────
  goToScanBoites(): void {
    this.error.set('');
    this.boitesScannees.set({});
    this.currentStep.set('scan-boites');
  }

  // ── Étape 3 : Scan médicament CIP ─────────────────────────────────────────
  scanMedCip(cipMed: string): void {
    const cipSaisi = this.cipInputs[cipMed]?.trim();
    if (!cipSaisi) return;
    const rx = this.prescription();
    if (!rx) return;

    this.loading.set(true);
    this.error.set('');

    this.http.post<any>('/api/v1/pharmacie/scan-med-cip', {
      qrMedCip: cipSaisi,
      prescriptionId: rx.id
    }).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        const result = data?.data ?? data;
        const cip: string = result.cip ?? cipMed;
        const current = { ...this.boitesScannees() };
        current[cip] = result.quantiteSession ?? (current[cip] ?? 0) + 1;
        this.boitesScannees.set(current);
        this.cipInputs[cipMed] = '';
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message;
        this.error.set(Array.isArray(msg) ? msg.join(', ') : msg || 'Erreur lors du scan CIP');
        this.loading.set(false);
      }
    });
  }

  // ── Étape 3 → 4 : Calcul financier local ──────────────────────────────────
  calculerRecapitulatif(): void {
    const rx = this.prescription();
    if (!rx) return;
    this.error.set('');

    const lignes: FinancierLigne[] = [];
    for (const med of rx.medications) {
      const scanned = this.boitesScannees()[med.cip] ?? 0;
      // Chercher aussi par CIP réel si le CIP a été mis à jour après scan
      const scannedAlt = Object.values(this.boitesScannees()).reduce((a, b) => a + b, 0);
      const qte = scanned > 0 ? scanned : (scannedAlt > 0 ? scannedAlt : (med.quantity - (med.quantityDelivered ?? 0)));
      if (qte <= 0) continue;
      const prix = Number(this.prixInputs[med.cip]) || 0;
      const taux = Number(this.tauxInputs[med.cip]) || 0.70;
      const montantTotal = prix * qte;
      const partCnam = montantTotal * taux;
      const partPatient = montantTotal - partCnam;
      lignes.push({ cip: med.cip, nom: med.name, quantite: qte, prixUnitaire: prix, montantTotal, partCnam, partPatient });
    }

    if (lignes.length === 0) {
      this.error.set('Aucun médicament à délivrer. Vérifiez les quantités.');
      return;
    }

    const totalCnam = lignes.reduce((s, l) => s + l.partCnam, 0);
    const totalPatient = lignes.reduce((s, l) => s + l.partPatient, 0);
    const totalGeneral = lignes.reduce((s, l) => s + l.montantTotal, 0);

    this.financier.set({ lignes, totalCnam, totalPatient, totalGeneral });
    this.currentStep.set('recapitulatif');
  }

  // ── Étape 5 : Confirmer la délivrance ─────────────────────────────────────
  confirmerDelivrance(): void {
    const rx = this.prescription();
    const fin = this.financier();
    if (!rx || !fin) return;

    this.loading.set(true);
    this.error.set('');

    const medicamentsDelivres = fin.lignes.map((l) => ({
      cip: l.cip,
      quantiteDelivree: l.quantite,
      prixUnitaire: l.prixUnitaire,
      tauxCnam: this.tauxInputs[l.cip] ?? 0.70
    }));

    this.http.post<any>('/api/v1/pharmacie/confirmer-delivrance', {
      prescriptionId: rx.id,
      medicamentsDelivres
    }).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        const result = data?.data ?? data;
        this.ticketUrl.set(result.ticketUrl ?? null);
        this.loading.set(false);
        this.currentStep.set('confirmation');
      },
      error: (err) => {
        const msg = err?.error?.message;
        this.error.set(Array.isArray(msg) ? msg.join(', ') : msg || 'Erreur lors de la confirmation');
        this.loading.set(false);
      }
    });
  }

  // ── Réinitialisation ───────────────────────────────────────────────────────
  nouvelleDelivrance(): void {
    this.currentStep.set('scan-qr');
    this.prescription.set(null);
    this.boitesScannees.set({});
    this.financier.set(null);
    this.ticketUrl.set(null);
    this.error.set('');
    this.loading.set(false);
    this.qrCodeInput = '';
    this.cipInputs = {};
    this.prixInputs = {};
    this.tauxInputs = {};
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getMedicationsWithPrix(): MedicationDetail[] {
    return this.prescription()?.medications ?? [];
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}

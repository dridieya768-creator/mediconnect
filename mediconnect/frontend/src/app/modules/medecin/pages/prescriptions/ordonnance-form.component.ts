import { Component, OnInit, AfterViewInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Medication {
  name: string;
  cip: string;
  dosage: string;
  posology: string;
  durationDays: number;
  quantity: number;
  isSubstitutable: boolean;
}

interface ImagingRequest {
  type: string;
  region: string;
  clinicalReason: string;
  urgency: 'NORMAL' | 'URGENT';
}

interface AnalysisRequest {
  typeAnalyse: string;
  motif: string;
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: string;
  description: string;
}

@Component({
  selector: 'app-ordonnance-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rx-page">

      
      <div class="page-header">
        <div>
          <h1 class="page-title">Rediger une Ordonnance</h1>
          <p class="page-subtitle">Ordonnance electronique securisee avec QR-ORD</p>
        </div>
        <div class="header-actions">
          <button class="btn-back" (click)="router.navigate(['/medecin/prescriptions'])">Retour</button>
        </div>
      </div>

      <div class="alert-success" *ngIf="successMsg()">Ordonnance creee avec succes ! QR-ORD genere.</div>
      <div class="alert-error"   *ngIf="errorMsg()">{{ errorMsg() }}</div>

      <!-- INTERACTIONS WARNING -->
      <div class="interactions-alert" *ngIf="interactions().length > 0">
        <div class="ia-title">Interactions medicamenteuses detectees</div>
        <div class="ia-item" *ngFor="let ia of interactions()">
          <span class="ia-sev" [class]="'sev-' + ia.severity.toLowerCase()">{{ ia.severity }}</span>
          <span>{{ ia.drug1 }} + {{ ia.drug2 }} : {{ ia.description }}</span>
        </div>
      </div>

      <div class="rx-grid">

        
        <div class="rx-left">

          <!-- PATIENT -->
          <div class="rx-card">
            <div class="card-title">Patient</div>
            <div class="search-patient-row">
              <input class="form-input" type="text" [(ngModel)]="patientSearch"
                     placeholder="Rechercher par nom ou NSS..."
                     (ngModelChange)="searchPatient($event)"
                     (focus)="searchPatient(patientSearch)" />
              <button class="btn-scan-qr" (click)="scanQr = !scanQr">Scanner QR-PAT</button>
            </div>
            <div class="patient-results" *ngIf="patientResults().length > 0">
              <div class="patient-result-item" *ngFor="let p of patientResults()"
                   (click)="selectPatient(p)">
                <div class="pr-name">{{ p.firstName ?? p.prenom }} {{ p.lastName ?? p.nom }}</div>
                <div class="pr-meta">NSS: {{ p.nss || '—' }} | {{ p.dateNaissance ? formatDate(p.dateNaissance) : '' }}</div>
              </div>
            </div>
            <div class="selected-patient" *ngIf="selectedPatient()">
              <div class="sp-avatar">{{ getInitials(selectedPatient()!) }}</div>
              <div class="sp-info">
                <div class="sp-name">{{ selectedPatient()!.firstName ?? selectedPatient()!.prenom }} {{ selectedPatient()!.lastName ?? selectedPatient()!.nom }}</div>
                <div class="sp-meta">
                  <span *ngIf="selectedPatient()!.nss">NSS: {{ selectedPatient()!.nss }}</span>
                  <span *ngIf="selectedPatient()!.groupeSanguin" class="blood-badge">{{ selectedPatient()!.groupeSanguin }}</span>
                  <span *ngIf="selectedPatient()!.allergies" class="allergy-badge">Allergies: {{ selectedPatient()!.allergies }}</span>
                </div>
              </div>
              <button class="btn-clear" (click)="selectedPatient.set(null)">x</button>
            </div>
          </div>

          
          <div class="rx-card">
            <div class="card-title-row">
              <div class="card-title">Medicaments</div>
              <button class="btn-add-med" (click)="addMedication()">+ Ajouter</button>
            </div>

            <div class="med-search-row">
              <input class="form-input" type="text" [(ngModel)]="drugSearch"
                     placeholder="Rechercher un medicament (DCI ou commercial)..."
                     (ngModelChange)="searchDrug($event)" />
            </div>
            <div class="drug-results" *ngIf="drugResults().length > 0">
              <div class="drug-result-item" *ngFor="let d of drugResults()"
                   (click)="addDrugFromSearch(d)">
                <span class="drug-name">{{ d.name }}</span>
                <span class="drug-dci" *ngIf="d.dci">{{ d.dci }}</span>
              </div>
            </div>

            <div class="meds-list" *ngIf="medications().length > 0">
              <div class="med-item" *ngFor="let med of medications(); let i = index">
                <div class="med-header">
                  <span class="med-num">{{ i + 1 }}</span>
                  <input class="form-input med-name-input" [(ngModel)]="med.name"
                         (ngModelChange)="checkInteractions()"
                         placeholder="Nom du medicament" />
                  <button class="btn-rm-med" (click)="removeMedication(i)">x</button>
                </div>
                <div class="med-fields">
                  <div class="med-field">
                    <label>Dosage</label>
                    <input class="form-input-sm" [(ngModel)]="med.dosage" placeholder="Ex: 500mg" />
                  </div>
                  <div class="med-field">
                    <label>Posologie</label>
                    <input class="form-input-sm" [(ngModel)]="med.posology" placeholder="Ex: 1 cp matin et soir" />
                  </div>
                  <div class="med-field">
                    <label>Duree (jours)</label>
                    <input class="form-input-sm" type="number" [(ngModel)]="med.durationDays" min="1" />
                  </div>
                  <div class="med-field">
                    <label>Quantite</label>
                    <input class="form-input-sm" type="number" [(ngModel)]="med.quantity" min="1" />
                  </div>
                  <div class="med-field med-field-check">
                    <label class="toggle-label">
                      <input type="checkbox" [(ngModel)]="med.isSubstitutable" class="toggle-input">
                      <span class="toggle-switch"></span>
                      Substituable
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="empty-meds" *ngIf="medications().length === 0">
              Aucun medicament ajoute. Cliquez sur "+ Ajouter" ou recherchez un medicament.
            </div>
          </div>

          
          <div class="rx-card">
            <div class="card-title-row">
              <div class="card-title">Bon d Imagerie Medicale</div>
              <button class="btn-add-med" (click)="addImaging()">+ Ajouter</button>
            </div>
            <div class="imaging-list" *ngIf="imagingRequests().length > 0">
              <div class="imaging-item" *ngFor="let img of imagingRequests(); let i = index">
                <div class="imaging-header">
                  <span class="med-num">{{ i + 1 }}</span>
                  <button class="btn-rm-med" (click)="removeImaging(i)">x</button>
                </div>
                <div class="med-fields">
                  <div class="med-field">
                    <label>Type d examen</label>
                    <select class="form-input-sm" [(ngModel)]="img.type">
                      <option value="">Selectionner...</option>
                      <option value="RADIOGRAPHIE">Radiographie</option>
                      <option value="ECHOGRAPHIE">Echographie</option>
                      <option value="SCANNER">Scanner (TDM)</option>
                      <option value="IRM">IRM</option>
                      <option value="SCINTIGRAPHIE">Scintigraphie</option>
                      <option value="MAMMOGRAPHIE">Mammographie</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div class="med-field">
                    <label>Region anatomique</label>
                    <input class="form-input-sm" [(ngModel)]="img.region" placeholder="Ex: Thorax, Abdomen..." />
                  </div>
                  <div class="med-field">
                    <label>Urgence</label>
                    <select class="form-input-sm" [(ngModel)]="img.urgency">
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div class="med-field" style="grid-column:1/-1">
                    <label>Motif clinique</label>
                    <textarea class="form-input-sm" rows="2" [(ngModel)]="img.clinicalReason"
                              placeholder="Indication clinique..."></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="empty-meds" *ngIf="imagingRequests().length === 0">
              Aucun examen d imagerie ajoute.
            </div>
          </div>

          <!-- BON D'ANALYSE MÉDICALE -->
          <div class="rx-card">
            <div class="card-title-row">
              <div class="card-title"> Bon d'Analyse Médicale</div>
              <button class="btn-add-med" (click)="addAnalysis()">+ Ajouter</button>
            </div>
            <div class="imaging-list" *ngIf="analysisRequests().length > 0">
              <div class="imaging-item" *ngFor="let ana of analysisRequests(); let i = index">
                <div class="imaging-header">
                  <span class="med-num">{{ i + 1 }}</span>
                  <button class="btn-rm-med" (click)="removeAnalysis(i)">x</button>
                </div>
                <div class="med-fields">
                  <div class="med-field">
                    <label>Type d'analyse</label>
                    <select class="form-input-sm" [(ngModel)]="ana.typeAnalyse">
                      <option value="">Sélectionner...</option>
                      <option value="NFS">NFS (Numération Formule Sanguine)</option>
                      <option value="GLYCEMIE">Glycémie</option>
                      <option value="BILAN_LIPIDIQUE">Bilan lipidique</option>
                      <option value="BILAN_HEPATIQUE">Bilan hépatique</option>
                      <option value="BILAN_RENAL">Bilan rénal (créatinine, urée)</option>
                      <option value="TSH">TSH (Thyroïde)</option>
                      <option value="CRP">CRP / VS</option>
                      <option value="IONOGRAMME">Ionogramme sanguin</option>
                      <option value="URINE">Analyse d'urine (ECBU)</option>
                      <option value="COAGULATION">Bilan de coagulation (TP, TCA)</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div class="med-field">
                    <label>Motif / Indication clinique</label>
                    <input class="form-input-sm" [(ngModel)]="ana.motif" placeholder="Ex: Suivi diabète, contrôle post-traitement..." />
                  </div>
                </div>
              </div>
            </div>
            <div class="empty-meds" *ngIf="analysisRequests().length === 0">
              Aucune analyse ajoutée.
            </div>
          </div>

        </div>

        
        <div class="rx-right">

          <!-- NOTES -->
          <div class="rx-card">
            <div class="card-title">Notes et Instructions</div>
            <textarea class="form-input" rows="4" [(ngModel)]="notes"
                      placeholder="Instructions particulieres, recommandations..."></textarea>
          </div>

          
          <div class="rx-card">
            <div class="card-title">Signature Manuscrite</div>
            <p class="sign-hint">Dessinez votre signature ci-dessous puis saisissez votre PIN.</p>

            <!-- Canvas de dessin -->
            <div class="canvas-wrap">
              <canvas #sigCanvas width="320" height="120" class="sig-canvas"
                (mousedown)="startDraw($event)"
                (mousemove)="draw($event)"
                (mouseup)="stopDraw()"
                (mouseleave)="stopDraw()"
                (touchstart)="startDrawTouch($event)"
                (touchmove)="drawTouch($event)"
                (touchend)="stopDraw()">
              </canvas>
              <div class="canvas-placeholder" *ngIf="!hasSig">Signez ici</div>
            </div>
            <div class="canvas-actions">
              <button class="btn-clear-sig" (click)="clearSignature()">Effacer</button>
              <span class="sig-status" *ngIf="hasSig">Signature capturee</span>
            </div>

            <div class="pin-row" style="margin-top:14px;">
              <input class="pin-input" type="password" [(ngModel)]="pin"
                     maxlength="6" placeholder="Code PIN (6 chiffres)"
                     (keydown.enter)="submit()" />
            </div>
            <div class="sign-info">
              <span>Ordonnance valable 90 jours</span>
              <span>QR-ORD genere automatiquement</span>
            </div>
          </div>

          
          <div class="rx-card recap-card">
            <div class="card-title">Recapitulatif</div>
            <div class="recap-row">
              <span>Patient</span>
              <strong>{{ selectedPatient() ? ((selectedPatient()!.firstName ?? selectedPatient()!.prenom ?? '') + ' ' + (selectedPatient()!.lastName ?? selectedPatient()!.nom ?? '')) : 'Non selectionne' }}</strong>
            </div>
            <div class="recap-row">
              <span>Medicaments</span>
              <strong>{{ medications().length }} prescrit(s)</strong>
            </div>
            <div class="recap-row">
              <span>Imagerie</span>
              <strong>{{ imagingRequests().length }} examen(s)</strong>
            </div>
            <div class="recap-row">
              <span>Interactions</span>
              <strong [class.warn]="interactions().length > 0">
                {{ interactions().length === 0 ? 'Aucune' : interactions().length + ' detectee(s)' }}
              </strong>
            </div>

            <button class="btn-submit" (click)="submit()"
                    [disabled]="isSubmitting() || !selectedPatient() || medications().length === 0 || !pin">
              {{ isSubmitting() ? 'Creation en cours...' : 'Signer et Creer l Ordonnance' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .rx-page { padding: 0; font-family: system-ui, sans-serif; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .page-title { font-size:26px; font-weight:700; color:#0f172a; margin:0 0 4px; padding-left:40px; }
    .page-subtitle { color:#2563eb; font-size:14px; margin:0; padding-left:40px; }
    .header-actions { display:flex; gap:8px; padding-bottom:4px; }
    .btn-back { padding:8px 16px; background:white; color:#64748b; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-back:hover { background:#f1f5f9; }

    .alert-success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; font-weight:600; }
    .alert-error   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }

    .interactions-alert { background:#fffbeb; border:1.5px solid #fde68a; border-radius:12px; padding:16px; margin-bottom:20px; }
    .ia-title { font-size:14px; font-weight:700; color:#92400e; margin-bottom:10px; }
    .ia-item { display:flex; align-items:flex-start; gap:10px; font-size:13px; color:#78350f; margin-bottom:6px; }
    .ia-sev { padding:2px 8px; border-radius:6px; font-size:11px; font-weight:700; flex-shrink:0; }
    .sev-high, .sev-severe { background:#fef2f2; color:#dc2626; }
    .sev-moderate { background:#fffbeb; color:#d97706; }
    .sev-low, .sev-minor { background:#f0fdf4; color:#16a34a; }

    .rx-grid { display:grid; grid-template-columns:1fr 340px; gap:20px; align-items:start; }
    .rx-left, .rx-right { display:flex; flex-direction:column; gap:16px; }

    .rx-card { background:white; border-radius:14px; border:1.5px solid #e2e8f0; padding:20px; }
    .card-title { font-size:15px; font-weight:700; color:#0f172a; margin-bottom:14px; }
    .card-title-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }

    .search-patient-row { display:flex; gap:10px; margin-bottom:10px; }
    .btn-scan-qr { padding:8px 14px; background:#f1f5f9; color:#374151; border:1.5px solid #e2e8f0; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; }
    .btn-scan-qr:hover { background:#e2e8f0; }

    .patient-results { border:1.5px solid #e2e8f0; border-radius:8px; overflow:hidden; margin-bottom:10px; }
    .patient-result-item { padding:10px 14px; cursor:pointer; border-bottom:1px solid #f1f5f9; transition:background .1s; }
    .patient-result-item:hover { background:#f8fafc; }
    .patient-result-item:last-child { border-bottom:none; }
    .pr-name { font-size:14px; font-weight:600; color:#0f172a; }
    .pr-meta { font-size:12px; color:#64748b; margin-top:2px; }

    .selected-patient { display:flex; align-items:center; gap:12px; background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:10px; padding:12px 16px; }
    .sp-avatar { width:40px; height:40px; background:#16a34a; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; flex-shrink:0; }
    .sp-info { flex:1; }
    .sp-name { font-size:14px; font-weight:700; color:#0f172a; }
    .sp-meta { display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; font-size:12px; }
    .blood-badge { background:#fef2f2; color:#dc2626; padding:2px 8px; border-radius:6px; font-weight:600; }
    .allergy-badge { background:#fffbeb; color:#d97706; padding:2px 8px; border-radius:6px; font-weight:600; }
    .btn-clear { background:none; border:none; color:#94a3b8; cursor:pointer; font-size:18px; padding:0; }

    .btn-add-med { padding:6px 14px; background:#1a56db; color:white; border:none; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; }
    .btn-add-med:hover { background:#1447c0; }

    .med-search-row { margin-bottom:10px; }
    .drug-results { border:1.5px solid #e2e8f0; border-radius:8px; overflow:hidden; margin-bottom:12px; max-height:160px; overflow-y:auto; }
    .drug-result-item { padding:8px 14px; cursor:pointer; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:10px; transition:background .1s; }
    .drug-result-item:hover { background:#eff6ff; }
    .drug-result-item:last-child { border-bottom:none; }
    .drug-name { font-size:13px; font-weight:600; color:#0f172a; }
    .drug-dci { font-size:11px; color:#64748b; background:#f1f5f9; padding:2px 6px; border-radius:4px; }

    .meds-list { display:flex; flex-direction:column; gap:12px; }
    .med-item { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; }
    .med-header { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .med-num { width:24px; height:24px; background:#1a56db; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
    .med-name-input { flex:1; }
    .btn-rm-med { background:none; border:none; color:#dc2626; cursor:pointer; font-size:18px; padding:0; font-weight:700; }
    .med-fields { display:grid; grid-template-columns:1fr 1fr 80px 80px auto; gap:10px; align-items:end; }
    .med-field { display:flex; flex-direction:column; gap:4px; }
    .med-field label { font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }
    .med-field-check { justify-content:flex-end; padding-bottom:2px; }

    .imaging-list { display:flex; flex-direction:column; gap:12px; }
    .imaging-item { background:#f0f7ff; border:1px solid #bfdbfe; border-radius:10px; padding:14px; }
    .imaging-header { display:flex; align-items:center; gap:10px; margin-bottom:10px; }

    .empty-meds { text-align:center; color:#94a3b8; font-size:13px; padding:20px; font-style:italic; }

    .form-input { width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; box-sizing:border-box; font-family:inherit; }
    .form-input:focus { border-color:#1a56db; }
    .form-input-sm { width:100%; padding:7px 10px; border:1.5px solid #e2e8f0; border-radius:6px; font-size:13px; color:#0f172a; outline:none; box-sizing:border-box; font-family:inherit; resize:vertical; }
    .form-input-sm:focus { border-color:#1a56db; }

    .sign-hint { font-size:13px; color:#64748b; margin:0 0 14px; }
    .pin-row { margin-bottom:14px; }
    .pin-input { width:100%; padding:12px 16px; border:2px solid #e2e8f0; border-radius:10px; font-size:18px; letter-spacing:6px; text-align:center; outline:none; font-family:monospace; box-sizing:border-box; }
    .pin-input:focus { border-color:#1a56db; }
    .sign-info { display:flex; flex-direction:column; gap:4px; font-size:12px; color:#64748b; }
    .sign-info span::before { content:'✓ '; color:#16a34a; }

    .recap-card { background:#f8fafc; }
    .recap-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #e2e8f0; font-size:13px; }
    .recap-row:last-of-type { border-bottom:none; margin-bottom:16px; }
    .recap-row span { color:#64748b; }
    .recap-row strong { color:#0f172a; }
    .recap-row strong.warn { color:#d97706; }

    .btn-submit { width:100%; padding:14px; background:#1a56db; color:white; border:none; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; transition:background .15s; }
    .btn-submit:hover:not(:disabled) { background:#1447c0; }
    .btn-submit:disabled { opacity:.5; cursor:not-allowed; }

    .toggle-label { display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px; font-weight:600; color:#374151; }
    .toggle-input { display:none; }
    .toggle-switch { width:36px; height:20px; background:#e2e8f0; border-radius:10px; position:relative; transition:background .2s; flex-shrink:0; }
    .toggle-switch::after { content:''; position:absolute; top:2px; left:2px; width:16px; height:16px; background:white; border-radius:50%; transition:transform .2s; }
    .toggle-input:checked + .toggle-switch { background:#1a56db; }
    .toggle-input:checked + .toggle-switch::after { transform:translateX(16px); }

    @media (max-width:900px) {
      .rx-grid { grid-template-columns:1fr; }
      .med-fields { grid-template-columns:1fr 1fr; }
    }
    .canvas-wrap { position:relative; border:2px solid #e2e8f0; border-radius:10px; overflow:hidden; background:white; cursor:crosshair; }
    .sig-canvas { display:block; width:100%; touch-action:none; }
    .canvas-placeholder { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:15px; font-style:italic; pointer-events:none; }
    .canvas-actions { display:flex; align-items:center; gap:12px; margin-top:8px; }
    .btn-clear-sig { padding:5px 14px; background:#fef2f2; color:#dc2626; border:1.5px solid #fecaca; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; }
    .btn-clear-sig:hover { background:#fee2e2; }
    .sig-status { font-size:12px; color:#16a34a; font-weight:600; }
  `]
})
export class OrdonnanceFormComponent implements OnInit, AfterViewInit {
  private http   = inject(HttpClient);
  private auth   = inject(AuthService);
  private route  = inject(ActivatedRoute);
  router         = inject(Router);

  isSubmitting   = signal(false);
  successMsg     = signal(false);
  errorMsg       = signal<string|null>(null);
  patientResults = signal<any[]>([]);
  selectedPatient = signal<any>(null);
  private myPatients: any[] = [];
  drugResults    = signal<any[]>([]);
  medications    = signal<Medication[]>([]);
  imagingRequests = signal<ImagingRequest[]>([]);
  analysisRequests = signal<AnalysisRequest[]>([]);
  interactions   = signal<DrugInteraction[]>([]);

  patientSearch = '';
  drugSearch    = '';
  notes         = '';
  pin           = '';
  scanQr        = false;

  @ViewChild('sigCanvas') sigCanvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;
  hasSig = false;

  private medecinId: string | null = null;
  private medecinName = '';

  
  private drugCatalog = [
    { name: 'Amoxicilline', dci: 'Amoxicilline', cip: 'AMX500' },
    { name: 'Paracetamol', dci: 'Paracetamol', cip: 'PAR500' },
    { name: 'Ibuprofene', dci: 'Ibuprofene', cip: 'IBU400' },
    { name: 'Metformine', dci: 'Metformine', cip: 'MET500' },
    { name: 'Omeprazole', dci: 'Omeprazole', cip: 'OME20' },
    { name: 'Atorvastatine', dci: 'Atorvastatine', cip: 'ATO20' },
    { name: 'Amlodipine', dci: 'Amlodipine', cip: 'AML5' },
    { name: 'Lisinopril', dci: 'Lisinopril', cip: 'LIS10' },
    { name: 'Metoprolol', dci: 'Metoprolol', cip: 'MET50' },
    { name: 'Salbutamol', dci: 'Salbutamol', cip: 'SAL100' },
    { name: 'Prednisolone', dci: 'Prednisolone', cip: 'PRE5' },
    { name: 'Ciprofloxacine', dci: 'Ciprofloxacine', cip: 'CIP500' },
    { name: 'Azithromycine', dci: 'Azithromycine', cip: 'AZI500' },
    { name: 'Diclofenac', dci: 'Diclofenac', cip: 'DIC50' },
    { name: 'Loratadine', dci: 'Loratadine', cip: 'LOR10' },
  ];


  ngAfterViewInit() { setTimeout(() => this.initCanvas(), 300); }

  initCanvas() {
    const c = this.sigCanvasRef?.nativeElement;
    if (!c) return;
    this.ctx = c.getContext('2d');
    if (!this.ctx) return;
    this.ctx.strokeStyle = '#1a1a2e';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  private getPos(e: MouseEvent | Touch, c: HTMLCanvasElement) {
    const r = c.getBoundingClientRect();
    const sx = c.width / r.width, sy = c.height / r.height;
    const cx = 'clientX' in e ? (e as MouseEvent).clientX : (e as Touch).clientX;
    const cy = 'clientX' in e ? (e as MouseEvent).clientY : (e as Touch).clientY;
    return { x: (cx - r.left) * sx, y: (cy - r.top) * sy };
  }

  startDraw(e: MouseEvent) {
    if (!this.ctx) this.initCanvas();
    if (!this.ctx) return;
    this.drawing = true;
    const p = this.getPos(e, this.sigCanvasRef.nativeElement);
    this.ctx.beginPath(); this.ctx.moveTo(p.x, p.y);
  }

  draw(e: MouseEvent) {
    if (!this.drawing || !this.ctx) return;
    e.preventDefault();
    const p = this.getPos(e, this.sigCanvasRef.nativeElement);
    this.ctx.lineTo(p.x, p.y); this.ctx.stroke();
    this.hasSig = true;
  }

  startDrawTouch(e: TouchEvent) {
    e.preventDefault();
    if (!this.ctx) this.initCanvas();
    if (!this.ctx) return;
    this.drawing = true;
    const p = this.getPos(e.touches[0], this.sigCanvasRef.nativeElement);
    this.ctx.beginPath(); this.ctx.moveTo(p.x, p.y);
  }

  drawTouch(e: TouchEvent) {
    e.preventDefault();
    if (!this.drawing || !this.ctx) return;
    const p = this.getPos(e.touches[0], this.sigCanvasRef.nativeElement);
    this.ctx.lineTo(p.x, p.y); this.ctx.stroke();
    this.hasSig = true;
  }

  stopDraw() { this.drawing = false; }

  clearSignature() {
    const c = this.sigCanvasRef?.nativeElement;
    if (!c || !this.ctx) return;
    this.ctx.clearRect(0, 0, c.width, c.height);
    this.hasSig = false;
  }

  captureSignature(): string {
    const c = this.sigCanvasRef?.nativeElement;
    return (c && this.hasSig) ? c.toDataURL('image/png') : '';
  }
  ngOnInit() {
    this.http.get<any>('/api/v1/medecins/me').pipe(catchError(() => of(null))).subscribe(res => {
      const data = res?.data?.data ?? res?.data ?? res;
      if (data) {
        this.medecinId   = data.id ?? data.userId;
        this.medecinName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim();
      }
    });
    
    this.http.get<any>('/api/v1/medecins/my-patients').pipe(catchError(() => of([]))).subscribe(res => {
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      this.myPatients = list;
    });
    // Pre-remplir patient depuis query param
    this.route.queryParams.subscribe(p => {
      if (p['patientId']) this.loadPatientById(p['patientId']);
    });
  }

  loadPatientById(id: string) {
    this.http.get<any>(`/api/v1/patients/${id}`).pipe(catchError(() => of(null))).subscribe(res => {
      const p = res?.data ?? res;
      if (p) this.selectedPatient.set(p);
    });
  }

  searchPatient(q: string) {
    if (!q || q.length < 1) {
      
      this.patientResults.set(this.myPatients.slice(0, 8));
      return;
    }
    const lower = q.toLowerCase();
    const filtered = this.myPatients.filter(p =>
      (p.firstName ?? p.user?.firstName ?? '').toLowerCase().includes(lower) ||
      (p.lastName  ?? p.user?.lastName  ?? '').toLowerCase().includes(lower) ||
      (p.nss ?? '').toLowerCase().includes(lower)
    );
    this.patientResults.set(filtered.slice(0, 8));
  }

  selectPatient(p: any) {
    this.selectedPatient.set(p);
    this.patientResults.set([]);
    this.patientSearch = '';
  }

  searchDrug(q: string) {
    if (!q || q.length < 2) { this.drugResults.set([]); return; }
    const filtered = this.drugCatalog.filter(d =>
      d.name.toLowerCase().includes(q.toLowerCase()) ||
      d.dci.toLowerCase().includes(q.toLowerCase())
    );
    this.drugResults.set(filtered.slice(0, 8));
  }

  addDrugFromSearch(d: any) {
    this.medications.update(list => [...list, {
      name: d.name, cip: d.cip || '', dosage: '', posology: '',
      durationDays: 7, quantity: 1, isSubstitutable: true
    }]);
    this.drugResults.set([]);
    this.drugSearch = '';
    this.checkInteractions();
  }

  addMedication() {
    this.medications.update(list => [...list, {
      name: '', cip: '', dosage: '', posology: '',
      durationDays: 7, quantity: 1, isSubstitutable: true
    }]);
  }

  removeMedication(i: number) {
    this.medications.update(list => list.filter((_, idx) => idx !== i));
    this.checkInteractions();
  }

  addImaging() {
    this.imagingRequests.update(list => [...list, {
      type: '', region: '', clinicalReason: '', urgency: 'NORMAL'
    }]);
  }

  removeImaging(i: number) {
    this.imagingRequests.update(list => list.filter((_, idx) => idx !== i));
  }

  addAnalysis() {
    this.analysisRequests.update(list => [...list, { typeAnalyse: '', motif: '' }]);
  }

  removeAnalysis(i: number) {
    this.analysisRequests.update(list => list.filter((_, idx) => idx !== i));
  }

  checkInteractions() {
    const meds = this.medications();
    if (meds.length < 2) { this.interactions.set([]); return; }
    this.http.post<any>('/api/v1/prescriptions/check-interactions', { medications: meds })
      .pipe(catchError(() => of({ interactions: [] })))
      .subscribe(res => {
        const list = Array.isArray(res) ? res
          : Array.isArray(res?.data) ? res.data
          : res?.interactions ?? res?.data?.interactions ?? [];
        this.interactions.set(list);
      });
  }

  submit() {
    const patient = this.selectedPatient();
    if (!patient || this.medications().length === 0 || !this.pin) return;
    if (!this.medecinId) { this.errorMsg.set('Impossible de recuperer votre identifiant medecin.'); return; }

    this.isSubmitting.set(true);
    this.errorMsg.set(null);

    const sigDataUrl = this.captureSignature();

    const payload = {
      patientId:    patient.id,
      doctorId:     this.medecinId,
      medications:  this.medications().filter(m => m.name && m.name.trim() !== ''),
      imagingRequests: this.imagingRequests().length > 0 ? this.imagingRequests() : undefined,
      analysisRequests: this.analysisRequests().length > 0 ? this.analysisRequests() : undefined,
      notes:        this.notes || undefined,
      pin:          this.pin,
      signatureImage: sigDataUrl || undefined,
      patientName:  `${patient.firstName ?? patient.prenom ?? ''} ${patient.lastName ?? patient.nom ?? ''}`.trim(),
      patientNss:   patient.nss ?? '',
      medecinName:  this.medecinName,
    };

    this.http.post<any>('/api/v1/prescriptions', payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMsg.set(true);
        setTimeout(() => this.router.navigate(['/medecin/prescriptions']), 2500);
      },
      error: err => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message;
        this.errorMsg.set(Array.isArray(msg) ? msg.join(', ') : msg || 'Erreur lors de la creation.');
      }
    });
  }

  getInitials(p: any): string {
    const first = (p.firstName ?? p.prenom ?? '')[0] ?? '';
    const last  = (p.lastName  ?? p.nom    ?? '')[0] ?? '';
    return (first + last).toUpperCase() || 'P';
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
  }
}









import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-patient-dossier",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dossier-page">

      <!-- HEADER -->
      <div class="page-header">
        <div class="header-left">
          <a routerLink="../dashboard" class="back-btn">← Retour</a>
          <div>
            <h1 class="page-title">📋 Mon Dossier Médical</h1>
            <p class="page-subtitle" *ngIf="patient()">
              {{ patient().prenom }} {{ patient().nom }}
              <span *ngIf="patient().nss"> — NSS : {{ patient().nss }}</span>
            </p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-edit" *ngIf="!isEditing()" (click)="startEdit()">✏️ Modifier</button>
          <button class="btn-save" *ngIf="isEditing()" (click)="saveChanges()" [disabled]="isSaving()">
            {{ isSaving() ? '⏳ Sauvegarde...' : '✅ Enregistrer' }}
          </button>
          <button class="btn-cancel" *ngIf="isEditing()" (click)="cancelEdit()">✕ Annuler</button>
        </div>
      </div>

      <!-- MESSAGES -->
      <div class="alert-success" *ngIf="successMsg()">✅ {{ successMsg() }}</div>
      <div class="alert-error" *ngIf="saveError()">❌ {{ saveError() }}</div>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p>Chargement de votre dossier...</p>
      </div>

      <!-- CONTENT -->
      <div class="dossier-grid" *ngIf="!isLoading() && patient()">

        <!-- IDENTITÉ MÉDICALE -->
        <div class="mc-card identity-card">
          <div class="card-title">🩺 Identité Médicale</div>

          <!-- MODE LECTURE -->
          <div *ngIf="!isEditing()">
            <div class="identity-grid">
              <div class="identity-item">
                <span class="identity-label">Groupe sanguin</span>
                <span class="identity-value blood-type">{{ patient().groupeSanguin || patient().groupe_sanguin || '—' }}</span>
              </div>
              <div class="identity-item">
                <span class="identity-label">Date de naissance</span>
                <span class="identity-value">{{ formatDate(patient().dateNaissance || patient().date_naissance) }}</span>
              </div>
              <div class="identity-item">
                <span class="identity-label">Sexe</span>
                <span class="identity-value">{{ patient().sexe === 'M' ? '👨 Masculin' : patient().sexe === 'F' ? '👩 Féminin' : '—' }}</span>
              </div>
              <div class="identity-item">
                <span class="identity-label">Ville</span>
                <span class="identity-value">{{ patient().ville || '—' }}</span>
              </div>
              <div class="identity-item">
                <span class="identity-label">Téléphone</span>
                <span class="identity-value">{{ patient().telephone || '—' }}</span>
              </div>
              <div class="identity-item">
                <span class="identity-label">NSS</span>
                <span class="identity-value">{{ patient().nss || '—' }}</span>
              </div>
            </div>

            <div class="section-block">
              <div class="section-label">⚠️ Allergies</div>
              <div class="tags-list" *ngIf="allergies().length">
                <span class="tag tag-danger" *ngFor="let a of allergies()">{{ a }}</span>
              </div>
              <span class="empty-text" *ngIf="!allergies().length">Aucune allergie connue</span>
            </div>

            <div class="section-block">
              <div class="section-label">🏥 Maladies chroniques</div>
              <div class="tags-list" *ngIf="maladies().length">
                <span class="tag tag-warning" *ngFor="let m of maladies()">{{ m }}</span>
              </div>
              <span class="empty-text" *ngIf="!maladies().length">Aucune maladie chronique</span>
            </div>

            <div class="section-block">
              <div class="section-label">💊 Médicaments actuels</div>
              <div class="tags-list" *ngIf="medicaments().length">
                <span class="tag tag-blue" *ngFor="let m of medicaments()">{{ m }}</span>
              </div>
              <span class="empty-text" *ngIf="!medicaments().length">Aucun médicament en cours</span>
            </div>
          </div>

          <!-- MODE ÉDITION -->
          <div *ngIf="isEditing()" class="edit-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Groupe sanguin</label>
                <select class="form-select" [(ngModel)]="editData.groupeSanguin">
                  <option value="">— Sélectionner —</option>
                  <option *ngFor="let g of groupesSanguins" [value]="g">{{ g }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date de naissance</label>
                <input class="form-input" type="date" [(ngModel)]="editData.dateNaissance" />
              </div>
              <div class="form-group">
                <label class="form-label">Sexe</label>
                <select class="form-select" [(ngModel)]="editData.sexe">
                  <option value="">— Sélectionner —</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Ville</label>
                <input class="form-input" type="text" [(ngModel)]="editData.ville" placeholder="Votre ville" />
              </div>
              <div class="form-group">
                <label class="form-label">Téléphone</label>
                <input class="form-input" type="tel" [(ngModel)]="editData.telephone" placeholder="+216XXXXXXXX" />
              </div>
              <div class="form-group">
                <label class="form-label">NSS</label>
                <input class="form-input" type="text" [(ngModel)]="editData.nss" placeholder="Numéro sécurité sociale" />
              </div>
            </div>

            <!-- Allergies -->
            <div class="form-group-full">
              <label class="form-label">⚠️ Allergies</label>
              <div class="tag-input-area">
                <div class="tags-list">
                  <span class="tag tag-danger editable-tag" *ngFor="let a of editData.allergies; let i = index">
                    {{ a }}
                    <button class="tag-remove" (click)="removeItem(editData.allergies, i)">×</button>
                  </span>
                </div>
                <div class="add-tag-row">
                  <input class="form-input small" type="text" [(ngModel)]="newAllergie"
                    placeholder="Ex: Pénicilline" (keydown.enter)="addItem(editData.allergies, 'newAllergie')" />
                  <button class="btn-add-tag" (click)="addItem(editData.allergies, 'newAllergie')">+ Ajouter</button>
                </div>
              </div>
            </div>

            <!-- Maladies chroniques -->
            <div class="form-group-full">
              <label class="form-label">🏥 Maladies chroniques</label>
              <div class="tag-input-area">
                <div class="tags-list">
                  <span class="tag tag-warning editable-tag" *ngFor="let m of editData.maladiesChroniques; let i = index">
                    {{ m }}
                    <button class="tag-remove" (click)="removeItem(editData.maladiesChroniques, i)">×</button>
                  </span>
                </div>
                <div class="add-tag-row">
                  <input class="form-input small" type="text" [(ngModel)]="newMaladie"
                    placeholder="Ex: Diabète type 2" (keydown.enter)="addItem(editData.maladiesChroniques, 'newMaladie')" />
                  <button class="btn-add-tag" (click)="addItem(editData.maladiesChroniques, 'newMaladie')">+ Ajouter</button>
                </div>
              </div>
            </div>

            <!-- Médicaments -->
            <div class="form-group-full">
              <label class="form-label">💊 Médicaments actuels</label>
              <div class="tag-input-area">
                <div class="tags-list">
                  <span class="tag tag-blue editable-tag" *ngFor="let m of editData.medicamentsActuels; let i = index">
                    {{ m }}
                    <button class="tag-remove" (click)="removeItem(editData.medicamentsActuels, i)">×</button>
                  </span>
                </div>
                <div class="add-tag-row">
                  <input class="form-input small" type="text" [(ngModel)]="newMedicament"
                    placeholder="Ex: Metformine 500mg" (keydown.enter)="addItem(editData.medicamentsActuels, 'newMedicament')" />
                  <button class="btn-add-tag" (click)="addItem(editData.medicamentsActuels, 'newMedicament')">+ Ajouter</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- HISTORIQUE CONSULTATIONS -->
        <div class="mc-card consultations-card">
          <div class="card-title">
            📅 Historique des Consultations
            <span class="count-badge">{{ appointments().length }}</span>
          </div>

          <div class="filters-bar">
            <button class="filter-btn" [class.active]="activeFilter() === 'all'" (click)="setFilter('all')">Toutes ({{ appointments().length }})</button>
            <button class="filter-btn" [class.active]="activeFilter() === 'presentiel'" (click)="setFilter('presentiel')">Présentiel</button>
            <button class="filter-btn" [class.active]="activeFilter() === 'teleconsultation'" (click)="setFilter('teleconsultation')">Téléconsultation</button>
          </div>

          <div class="consultations-list" *ngIf="filteredConsultations().length">
            <div class="consultation-item" *ngFor="let c of filteredConsultations()">
              <div class="consult-date">
                <div class="consult-day">{{ formatDay(c.appointmentDate || c.scheduledAt || c.date) }}</div>
                <div class="consult-month">{{ formatMonth(c.appointmentDate || c.scheduledAt || c.date) }}</div>
                <div class="consult-year">{{ formatYear(c.appointmentDate || c.scheduledAt || c.date) }}</div>
              </div>
              <div class="consult-body">
                <div class="consult-header">
                  <span class="consult-doctor">
                    Dr. {{ c.doctor?.lastName || c.doctor?.last_name || c.medecin?.user?.last_name || 'Médecin' }}
                  </span>
                  <span class="consult-type" [class.type-video]="c.consultationType === 'VIDEO' || c.type === 'VIDEO'">
                    {{ (c.consultationType === 'VIDEO' || c.type === 'VIDEO') ? '💻 Télé' : '🏥 Présentiel' }}
                  </span>
                </div>
                <div class="consult-specialite">{{ c.medecin?.specialite || 'Médecin généraliste' }}</div>
                <div class="consult-motif" *ngIf="c.reason || c.motif">Motif : {{ c.reason || c.motif }}</div>
                <span class="status-badge" [ngClass]="getStatusClass(c.status)">{{ getStatusLabel(c.status) }}</span>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="!filteredConsultations().length">
            <div style="font-size:48px">📭</div>
            <p>Aucune consultation trouvée</p>
            <a routerLink="../rendez-vous" class="btn-outline">Prendre un RDV</a>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dossier-page { padding: 0; }
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:12px; }
    .header-left { display:flex; align-items:flex-start; gap:16px; }
    .back-btn { color:#1a56db; text-decoration:none; font-size:13px; font-weight:500; margin-top:4px; }
    .page-title { font-size:24px; font-weight:700; color:#0f172a; margin:0 0 4px; }
    .page-subtitle { font-size:14px; color:#64748b; margin:0; }
    .header-actions { display:flex; gap:8px; align-items:center; }
    .btn-edit { padding:9px 20px; background:#eff6ff; color:#1a56db; border:2px solid #1a56db; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-save { padding:9px 20px; background:#1a56db; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-save:disabled { opacity:.6; cursor:not-allowed; }
    .btn-cancel { padding:9px 16px; background:#f8fafc; color:#64748b; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; cursor:pointer; }
    .alert-success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }
    .alert-error { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }
    .loading-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px; color:#64748b; gap:12px; }
    .spinner { width:40px; height:40px; border:3px solid #e2e8f0; border-top-color:#1a56db; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .dossier-grid { display:grid; grid-template-columns:380px 1fr; gap:24px; align-items:start; }
    .mc-card { background:white; border-radius:16px; padding:24px; box-shadow:0 2px 12px rgba(0,0,0,.06); }
    .card-title { font-size:16px; font-weight:700; color:#0f172a; margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:8px; }
    .count-badge { background:#1a56db; color:white; border-radius:12px; padding:2px 8px; font-size:12px; font-weight:600; }
    .identity-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; }
    .identity-item { background:#f8fafc; border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:4px; }
    .identity-label { font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; }
    .identity-value { font-size:14px; font-weight:700; color:#0f172a; }
    .blood-type { color:#dc2626; font-size:20px; }
    .section-block { margin-bottom:16px; }
    .section-label { font-size:12px; font-weight:600; color:#64748b; margin-bottom:8px; }
    .tags-list { display:flex; flex-wrap:wrap; gap:6px; min-height:28px; }
    .tag { padding:4px 10px; border-radius:20px; font-size:12px; font-weight:500; display:inline-flex; align-items:center; gap:4px; }
    .tag-danger { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
    .tag-warning { background:#fffbeb; color:#d97706; border:1px solid #fde68a; }
    .tag-blue { background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; }
    .empty-text { font-size:13px; color:#94a3b8; font-style:italic; }
    .edit-form { display:flex; flex-direction:column; gap:16px; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .form-group { display:flex; flex-direction:column; gap:6px; }
    .form-group-full { display:flex; flex-direction:column; gap:6px; }
    .form-label { font-size:12px; font-weight:600; color:#64748b; }
    .form-input { padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; transition:border-color .15s; width:100%; box-sizing:border-box; }
    .form-input:focus { border-color:#1a56db; }
    .form-input.small { flex:1; }
    .form-select { padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; background:white; width:100%; }
    .form-select:focus { border-color:#1a56db; }
    .tag-input-area { background:#f8fafc; border-radius:10px; padding:12px; border:1.5px solid #e2e8f0; }
    .editable-tag { cursor:default; }
    .tag-remove { background:none; border:none; cursor:pointer; font-size:14px; color:inherit; padding:0 0 0 4px; opacity:.7; }
    .tag-remove:hover { opacity:1; }
    .add-tag-row { display:flex; gap:8px; margin-top:8px; }
    .btn-add-tag { padding:8px 14px; background:#1a56db; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; }
    .btn-add-tag:hover { background:#1447c0; }
    .filters-bar { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
    .filter-btn { padding:6px 14px; border:1.5px solid #e2e8f0; border-radius:20px; background:white; font-size:13px; cursor:pointer; color:#64748b; transition:all .15s; }
    .filter-btn.active, .filter-btn:hover { border-color:#1a56db; color:#1a56db; background:#eff6ff; }
    .consultations-list { display:flex; flex-direction:column; gap:12px; }
    .consultation-item { display:flex; gap:16px; padding:16px; border-radius:12px; border:1px solid #f1f5f9; background:#fafafa; transition:all .15s; }
    .consultation-item:hover { border-color:#1a56db; background:#eff6ff; }
    .consult-date { min-width:48px; text-align:center; background:#1a56db; color:white; border-radius:10px; padding:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .consult-day { font-size:20px; font-weight:700; line-height:1; }
    .consult-month { font-size:11px; text-transform:uppercase; opacity:.85; }
    .consult-year { font-size:10px; opacity:.7; }
    .consult-body { flex:1; }
    .consult-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; gap:8px; }
    .consult-doctor { font-size:15px; font-weight:600; color:#0f172a; }
    .consult-type { font-size:11px; padding:3px 8px; border-radius:6px; background:#f0fdf4; color:#16a34a; font-weight:500; }
    .consult-type.type-video { background:#eff6ff; color:#2563eb; }
    .consult-specialite { font-size:12px; color:#64748b; margin-bottom:4px; }
    .consult-motif { font-size:13px; color:#475569; margin-bottom:6px; }
    .status-badge { display:inline-block; font-size:11px; padding:2px 8px; border-radius:6px; font-weight:500; }
    .badge-success { background:#f0fdf4; color:#16a34a; }
    .badge-warning { background:#fffbeb; color:#d97706; }
    .badge-danger { background:#fef2f2; color:#dc2626; }
    .badge-muted { background:#f8fafc; color:#64748b; }
    .empty-state { text-align:center; padding:60px 20px; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:12px; }
    .btn-outline { padding:8px 20px; border:2px solid #1a56db; color:#1a56db; border-radius:8px; text-decoration:none; font-size:14px; font-weight:600; }
    @media (max-width:900px) { .dossier-grid { grid-template-columns:1fr; } .form-grid { grid-template-columns:1fr; } }
  `]
})
export class PatientDossierComponent implements OnInit {
  private http = inject(HttpClient);

  isLoading = signal(true);
  isEditing = signal(false);
  isSaving = signal(false);
  successMsg = signal<string | null>(null);
  saveError = signal<string | null>(null);
  patient = signal<any>(null);
  appointments = signal<any[]>([]);
  activeFilter = signal<'all' | 'presentiel' | 'teleconsultation'>('all');

  allergies = signal<string[]>([]);
  maladies = signal<string[]>([]);
  medicaments = signal<string[]>([]);

  editData: any = {};
  newAllergie = '';
  newMaladie = '';
  newMedicament = '';

  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  ngOnInit() { this.loadDossier(); }

  loadDossier() {
    this.isLoading.set(true);
    this.http.get<any>('/api/v1/patients/me').subscribe({
      next: (response) => {
        // TransformInterceptor wraps: { data: { success, id, data: {...} }, timestamp }
        const outer = response?.data ?? response;
        const patient = outer?.data ?? outer;
        console.log('✅ Patient reçu:', patient);
        console.log('✅ Patient ID:', patient?.id);

        this.patient.set(patient);
        this.allergies.set(this.parseJsonb(patient.allergies));
        this.maladies.set(this.parseJsonb(patient.maladiesChroniques || patient.maladies_chroniques));
        this.medicaments.set(this.parseJsonb(patient.medicamentsActuels || patient.medicaments_actuels));

        if (!patient?.id) {
          this.appointments.set([]);
          this.isLoading.set(false);
          return;
        }

        this.http.get<any[]>(`/api/v1/appointments/patient/${patient.id}`).subscribe({
          next: (appts) => { this.appointments.set(appts || []); this.isLoading.set(false); },
          error: () => { this.appointments.set([]); this.isLoading.set(false); }
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  startEdit() {
    const p = this.patient();
    // ✅ Utilise les noms TypeORM (camelCase) pour le PATCH backend
    this.editData = {
      groupeSanguin: p.groupeSanguin || p.groupe_sanguin || '',
      dateNaissance: (p.dateNaissance || p.date_naissance)
        ? (p.dateNaissance || p.date_naissance).substring(0, 10)
        : '',
      sexe: p.sexe || '',
      ville: p.ville || '',
      telephone: p.telephone || '',
      nss: p.nss || '',
      allergies: [...this.allergies()],
      maladiesChroniques: [...this.maladies()],
      medicamentsActuels: [...this.medicaments()],
    };
    this.newAllergie = '';
    this.newMaladie = '';
    this.newMedicament = '';
    this.isEditing.set(true);
    this.successMsg.set(null);
    this.saveError.set(null);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.saveError.set(null);
  }

  saveChanges() {
    this.isSaving.set(true);
    this.saveError.set(null);
    const patientId = this.patient().id;

    // Ne pas envoyer les champs vides/null — évite les erreurs TypeORM sur enum/date
    const payload: any = {
      allergies:          this.editData.allergies          || [],
      maladiesChroniques: this.editData.maladiesChroniques || [],
      medicamentsActuels: this.editData.medicamentsActuels || [],
    };
    if (this.editData.groupeSanguin)  payload.groupeSanguin  = this.editData.groupeSanguin;
    if (this.editData.dateNaissance)  payload.dateNaissance  = this.editData.dateNaissance;
    if (this.editData.sexe)           payload.sexe           = this.editData.sexe;
    if (this.editData.ville)          payload.ville          = this.editData.ville;
    if (this.editData.telephone)      payload.telephone      = this.editData.telephone;
    if (this.editData.nss)            payload.nss            = this.editData.nss;

    this.http.patch<any>(`/api/v1/patients/${patientId}`, payload).subscribe({
      next: (res) => {
        console.log('[dossier saveChanges] PATCH response:', res);
        // Recharger depuis le backend pour avoir les données persistées
        this.http.get<any>('/api/v1/patients/me').subscribe({
          next: (response) => {
            const outer = response?.data ?? response;
            const patient = outer?.data ?? outer;
            this.patient.set(patient);
            this.allergies.set(this.parseJsonb(patient.allergies));
            this.maladies.set(this.parseJsonb(patient.maladiesChroniques || patient.maladies_chroniques));
            this.medicaments.set(this.parseJsonb(patient.medicamentsActuels || patient.medicaments_actuels));
            this.isSaving.set(false);
            this.isEditing.set(false);
            this.successMsg.set('Dossier médical mis à jour avec succès !');
            setTimeout(() => this.successMsg.set(null), 4000);
          },
          error: () => {
            // Fallback: mise à jour locale
            this.patient.set({ ...this.patient(), ...this.editData });
            this.allergies.set([...this.editData.allergies]);
            this.maladies.set([...this.editData.maladiesChroniques]);
            this.medicaments.set([...this.editData.medicamentsActuels]);
            this.isSaving.set(false);
            this.isEditing.set(false);
            this.successMsg.set('Dossier médical mis à jour avec succès !');
            setTimeout(() => this.successMsg.set(null), 4000);
          }
        });
      },
      error: (err) => {
        console.error('[dossier saveChanges] PATCH error:', err);
        this.isSaving.set(false);
        this.saveError.set('Erreur lors de la sauvegarde. Veuillez réessayer.');
      }
    });
  }

  addItem(list: string[], field: 'newAllergie' | 'newMaladie' | 'newMedicament') {
    const val = (this as any)[field]?.trim();
    if (val && !list.includes(val)) { list.push(val); }
    (this as any)[field] = '';
  }

  removeItem(list: string[], index: number) { list.splice(index, 1); }

  parseJsonb(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      try { const p = JSON.parse(value); return Array.isArray(p) ? p : [p]; }
      catch { return value ? [value] : []; }
    }
    return [];
  }

  filteredConsultations(): any[] {
    const f = this.activeFilter();
    if (f === 'all') return this.appointments();
    if (f === 'teleconsultation') return this.appointments().filter(a => a.consultationType === 'VIDEO' || a.type === 'VIDEO');
    return this.appointments().filter(a => a.consultationType !== 'VIDEO' && a.type !== 'VIDEO');
  }

  setFilter(f: 'all' | 'presentiel' | 'teleconsultation') { this.activeFilter.set(f); }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  formatDay(d: string): string { return d ? new Date(d).getDate().toString().padStart(2, '0') : '--'; }
  formatMonth(d: string): string { return d ? new Date(d).toLocaleDateString('fr-FR', { month: 'short' }) : '--'; }
  formatYear(d: string): string { return d ? new Date(d).getFullYear().toString() : '--'; }

  getStatusLabel(s: string): string {
    return ({ CONFIRMED:'Confirmé', REQUESTED:'En attente', CANCELLED:'Annulé', COMPLETED:'Terminé', NO_SHOW:'Absent' } as any)[s] || s;
  }
  getStatusClass(s: string): string {
    return ({ CONFIRMED:'badge-success', REQUESTED:'badge-warning', CANCELLED:'badge-danger', COMPLETED:'badge-muted', NO_SHOW:'badge-danger' } as any)[s] || 'badge-muted';
  }
}
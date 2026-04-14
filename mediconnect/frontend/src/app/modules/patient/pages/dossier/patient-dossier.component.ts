import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-patient-dossier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <!-- PHOTO ARRIERE PLAN FIXE -->
      <div style="position:fixed; inset:0; z-index:0;">
        <img src="assets/images/Writing-down-results.jpg" alt="background"
             style="width:100%; height:100%; object-fit:cover; object-position:center; display:block;">
        <div style="position:absolute; inset:0; background:rgba(15,39,90,0.55);"></div>
      </div>

      <!-- CONTENU PAR-DESSUS LA PHOTO -->
      <div style="position:relative; z-index:1; padding:32px 40px;">

        <!-- TITRE -->
        <div style="margin-bottom:24px;">
          <h1 style="font-size:32px; font-weight:800; color:white; margin:0 0 6px; text-shadow:0 2px 8px rgba(0,0,0,.3);">Mon Dossier Medical</h1>
          <p style="font-size:15px; color:rgba(255,255,255,0.8); margin:0;">Consultez et mettez a jour vos informations medicales</p>
        </div>

      <div class="page-header" style="background:transparent; padding:0; margin-bottom:16px;">
        <div></div>
        <div class="header-actions">
          <button class="btn-edit" *ngIf="!editing()" (click)="startEdit()">✏️ Modifier</button>
          <button class="btn-save" *ngIf="editing()" (click)="save()" [disabled]="saving()">
            {{ saving() ? '⏳...' : '✅ Enregistrer' }}
          </button>
          <button class="btn-cancel" *ngIf="editing()" (click)="cancelEdit()">✕</button>
        </div>
      </div>

      <div class="alert-success" *ngIf="successMsg()">✅ {{ successMsg() }}</div>
      <div class="alert-error" *ngIf="errorMsg()">❌ {{ errorMsg() }}</div>

      <div class="loading" *ngIf="loading()"><div class="spinner"></div></div>

      <div *ngIf="!loading() && patient()" class="content">

        <!-- Infos médicales -->
        <div class="card">
          <div class="card-title">🩺 Informations médicales</div>
          <div *ngIf="!editing()" class="info-grid">
            <div class="info-item"><span class="info-label">Nom</span><span>{{ patient().prenom }} {{ patient().nom }}</span></div>
            <div class="info-item"><span class="info-label">NSS</span><span>{{ patient().nss || '—' }}</span></div>
            <div class="info-item"><span class="info-label">Groupe sanguin</span><span class="blood">{{ patient().groupeSanguin || '—' }}</span></div>
            <div class="info-item"><span class="info-label">Date de naissance</span><span>{{ formatDate(patient().dateNaissance) }}</span></div>
            <div class="info-item"><span class="info-label">Sexe</span><span>{{ patient().sexe === 'M' ? '👨 Masculin' : patient().sexe === 'F' ? '👩 Féminin' : '—' }}</span></div>
            <div class="info-item"><span class="info-label">Ville</span><span>{{ patient().ville || '—' }}</span></div>
            <div class="info-item"><span class="info-label">Téléphone</span><span>{{ patient().telephone || '—' }}</span></div>
          </div>
          <div *ngIf="editing()" class="edit-grid">
            <div class="fg"><label class="fl">Groupe sanguin</label>
              <select class="fi" [(ngModel)]="form.groupeSanguin">
                <option value="">—</option>
                <option *ngFor="let g of groupes" [value]="g">{{ g }}</option>
              </select></div>
            <div class="fg"><label class="fl">Date de naissance</label>
              <input class="fi" type="date" [(ngModel)]="form.dateNaissance"/></div>
            <div class="fg"><label class="fl">Sexe</label>
              <select class="fi" [(ngModel)]="form.sexe">
                <option value="">—</option><option value="M">Masculin</option><option value="F">Féminin</option>
              </select></div>
            <div class="fg"><label class="fl">Ville</label>
              <input class="fi" type="text" [(ngModel)]="form.ville"/></div>
            <div class="fg"><label class="fl">Téléphone</label>
              <input class="fi" type="tel" [(ngModel)]="form.telephone"/></div>
            <div class="fg"><label class="fl">NSS</label>
              <input class="fi" type="text" [(ngModel)]="form.nss"/></div>
          </div>
        </div>

        <!-- Allergies & Maladies -->
        <div class="card">
          <div class="card-title">⚠️ Allergies & Maladies chroniques</div>
          <div *ngIf="!editing()">
            <div class="section-label">Allergies</div>
            <div class="tags" *ngIf="allergies().length"><span class="tag red" *ngFor="let a of allergies()">{{ a }}</span></div>
            <p class="empty" *ngIf="!allergies().length">Aucune allergie connue</p>
            <div class="section-label" style="margin-top:12px">Maladies chroniques</div>
            <div class="tags" *ngIf="maladies().length"><span class="tag orange" *ngFor="let m of maladies()">{{ m }}</span></div>
            <p class="empty" *ngIf="!maladies().length">Aucune maladie chronique</p>
            <div class="section-label" style="margin-top:12px">Médicaments actuels</div>
            <div class="tags" *ngIf="medicaments().length"><span class="tag blue" *ngFor="let m of medicaments()">{{ m }}</span></div>
            <p class="empty" *ngIf="!medicaments().length">Aucun médicament en cours</p>
          </div>
          <div *ngIf="editing()">
            <div class="tag-section">
              <label class="fl">⚠️ Allergies</label>
              <div class="tags"><span class="tag red editable" *ngFor="let a of form.allergies; let i=index">{{ a }}<button class="tag-rm" (click)="rm(form.allergies,i)">×</button></span></div>
              <div class="tag-add"><input class="fi small" [(ngModel)]="newAllergie" placeholder="Ex: Pénicilline" (keydown.enter)="add(form.allergies,'newAllergie')"/><button class="btn-add-tag" (click)="add(form.allergies,'newAllergie')">+</button></div>
            </div>
            <div class="tag-section">
              <label class="fl">🏥 Maladies chroniques</label>
              <div class="tags"><span class="tag orange editable" *ngFor="let m of form.maladiesChroniques; let i=index">{{ m }}<button class="tag-rm" (click)="rm(form.maladiesChroniques,i)">×</button></span></div>
              <div class="tag-add"><input class="fi small" [(ngModel)]="newMaladie" placeholder="Ex: Diabète type 2" (keydown.enter)="add(form.maladiesChroniques,'newMaladie')"/><button class="btn-add-tag" (click)="add(form.maladiesChroniques,'newMaladie')">+</button></div>
            </div>
            <div class="tag-section">
              <label class="fl">💊 Médicaments actuels</label>
              <div class="tags"><span class="tag blue editable" *ngFor="let m of form.medicamentsActuels; let i=index">{{ m }}<button class="tag-rm" (click)="rm(form.medicamentsActuels,i)">×</button></span></div>
              <div class="tag-add"><input class="fi small" [(ngModel)]="newMedicament" placeholder="Ex: Metformine 500mg" (keydown.enter)="add(form.medicamentsActuels,'newMedicament')"/><button class="btn-add-tag" (click)="add(form.medicamentsActuels,'newMedicament')">+</button></div>
            </div>
          </div>
        </div>

        <!-- Documents PDF -->
        <div class="card">
          <div class="card-title">📄 Documents médicaux</div>
          <div class="docs-list" *ngIf="documents().length">
            <div class="doc-item" *ngFor="let d of documents(); let i=index">
              <span class="doc-icon">📄</span>
              <div class="doc-info">
                <div class="doc-name">{{ d.name }}</div>
                <div class="doc-date">{{ d.uploadedAt ? formatDate(d.uploadedAt) : '' }}</div>
              </div>
              <a class="btn-dl" [href]="d.url" target="_blank" download>⬇ Télécharger</a>
              <button class="btn-rm-doc" (click)="removeDoc(i)">🗑️</button>
            </div>
          </div>
          <p class="empty" *ngIf="!documents().length">Aucun document ajouté</p>

          <!-- Upload PDF -->
          <div class="upload-zone" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
            <input #fileInput type="file" accept=".pdf" multiple hidden (change)="onFilesSelected($event)"/>
            <div class="upload-icon">📎</div>
            <div class="upload-text">Cliquez ou glissez vos fichiers PDF ici</div>
            <div class="upload-hint">PDF uniquement · max 10MB par fichier</div>
          </div>
          <div class="uploading" *ngIf="uploading()">⏳ Upload en cours...</div>
        </div>

      </div>
      </div><!-- fin contenu z-index -->
    </div>
  `,
  styles: [`
    .page{padding:0;position:relative;min-height:100vh} .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px}
    .page-title{font-size:24px;font-weight:700;color:#0f172a;margin:0}
    .header-actions{display:flex;gap:8px}
    .btn-edit{padding:8px 16px;background:#1a56db;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
    .btn-save{padding:8px 16px;background:#16a34a;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
    .btn-cancel{padding:8px 12px;background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;cursor:pointer}
    .alert-success{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:10px;padding:12px 16px;margin-bottom:16px}
    .alert-error{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:10px;padding:12px 16px;margin-bottom:16px}
    .loading{display:flex;justify-content:center;padding:60px} .spinner{width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#1a56db;border-radius:50%;animation:spin .8s linear infinite} @keyframes spin{to{transform:rotate(360deg)}}
    .content{display:flex;flex-direction:column;gap:20px}
    .card{background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);border-radius:16px;padding:24px;box-shadow:0 4px 24px rgba(0,0,0,.15);border:1px solid rgba(255,255,255,0.6)}
    .card-title{font-size:16px;font-weight:700;color:#0f172a;margin-bottom:16px}
    .info-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
    .info-item{background:#f8fafc;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:4px}
    .info-label{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em}
    .blood{color:#dc2626;font-weight:700;font-size:16px}
    .edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .fg{display:flex;flex-direction:column;gap:6px} .fl{font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em}
    .fi{padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;color:#0f172a;outline:none;font-family:inherit;background:white}
    .fi:focus{border-color:#1a56db} .fi.small{flex:1}
    .section-label{font-size:13px;font-weight:700;color:#374151;margin-bottom:8px}
    .tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
    .tag{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}
    .red{background:#fef2f2;color:#dc2626} .orange{background:#fffbeb;color:#d97706} .blue{background:#eff6ff;color:#1a56db}
    .editable{display:inline-flex;align-items:center;gap:4px}
    .tag-rm{background:none;border:none;cursor:pointer;font-size:13px;padding:0;opacity:.7}
    .tag-section{margin-bottom:16px}
    .tag-add{display:flex;gap:8px;margin-top:6px}
    .btn-add-tag{padding:8px 14px;background:#1a56db;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
    .empty{font-size:13px;color:#94a3b8;font-style:italic;margin:0}
    .docs-list{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
    .doc-item{display:flex;align-items:center;gap:12px;background:#f8fafc;border-radius:10px;padding:12px;border:1px solid #e2e8f0}
    .doc-icon{font-size:24px;flex-shrink:0}
    .doc-info{flex:1} .doc-name{font-size:14px;font-weight:600;color:#0f172a} .doc-date{font-size:12px;color:#64748b}
    .btn-dl{padding:6px 12px;background:#eff6ff;color:#1a56db;border:1.5px solid #bfdbfe;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;text-decoration:none}
    .btn-rm-doc{background:none;border:none;cursor:pointer;font-size:16px;color:#dc2626}
    .upload-zone{border:2px dashed #cbd5e1;border-radius:12px;padding:32px;text-align:center;cursor:pointer;transition:all .2s;margin-top:8px}
    .upload-zone:hover{border-color:#1a56db;background:#f8fafc}
    .upload-icon{font-size:32px;margin-bottom:8px}
    .upload-text{font-size:14px;font-weight:600;color:#374151;margin-bottom:4px}
    .upload-hint{font-size:12px;color:#94a3b8}
    .uploading{font-size:13px;color:#1a56db;margin-top:8px;font-weight:600}
    @media(max-width:640px){.edit-grid{grid-template-columns:1fr}}
  `]
})
export class PatientDossierComponent implements OnInit {
  private http = inject(HttpClient);

  loading  = signal(true);
  saving   = signal(false);
  uploading = signal(false);
  editing  = signal(false);
  patient  = signal<any>(null);
  successMsg = signal<string|null>(null);
  errorMsg   = signal<string|null>(null);

  allergies   = signal<string[]>([]);
  maladies    = signal<string[]>([]);
  medicaments = signal<string[]>([]);
  documents   = signal<any[]>([]);

  form: any = {};
  newAllergie = ''; newMaladie = ''; newMedicament = '';
  groupes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any>('/api/v1/patients/me').subscribe({
      next: res => {
        const outer = res?.data ?? res;
        const p = outer?.data ?? outer;
        this.patient.set(p);
        this.allergies.set(this.parseList(p?.allergies));
        this.maladies.set(this.parseList(p?.maladiesChroniques));
        this.medicaments.set(this.parseList(p?.medicamentsActuels));
        this.documents.set(this.parseJson(p?.documents) ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  startEdit() {
    const p = this.patient();
    this.form = {
      groupeSanguin: p?.groupeSanguin ?? '',
      dateNaissance: p?.dateNaissance ? p.dateNaissance.substring(0,10) : '',
      sexe: p?.sexe ?? '',
      ville: p?.ville ?? '',
      telephone: p?.telephone ?? '',
      nss: p?.nss ?? '',
      allergies: [...this.allergies()],
      maladiesChroniques: [...this.maladies()],
      medicamentsActuels: [...this.medicaments()],
    };
    this.editing.set(true);
  }

  cancelEdit() { this.editing.set(false); }

  save() {
    this.saving.set(true);
    this.errorMsg.set(null);
    const payload: any = { ...this.form };
    if (!payload.groupeSanguin) delete payload.groupeSanguin;
    if (!payload.sexe) delete payload.sexe;
    payload.allergies = payload.allergies.join(', ');
    payload.maladiesChroniques = payload.maladiesChroniques.join(', ');
    payload.medicamentsActuels = payload.medicamentsActuels.join(', ');
    payload.documents = JSON.stringify(this.documents());

    this.http.patch<any>(`/api/v1/patients/${this.patient()?.id}`, payload).subscribe({
      next: () => {
        this.saving.set(false); this.editing.set(false);
        this.successMsg.set('Dossier mis à jour');
        setTimeout(() => this.successMsg.set(null), 3000);
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message || 'Erreur lors de la sauvegarde');
        setTimeout(() => this.errorMsg.set(null), 4000);
      }
    });
  }

  add(arr: string[], field: string) {
    const val = (this as any)[field]?.trim();
    if (val && !arr.includes(val)) { arr.push(val); (this as any)[field] = ''; }
  }
  rm(arr: string[], i: number) { arr.splice(i, 1); }
  removeDoc(i: number) {
    const docs = [...this.documents()];
    docs.splice(i, 1);
    this.documents.set(docs);
    // Sauvegarder immédiatement
    this.http.patch<any>(`/api/v1/patients/${this.patient()?.id}`, { documents: JSON.stringify(docs) }).subscribe();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.uploadFiles(Array.from(input.files));
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files ?? []).filter(f => f.type === 'application/pdf');
    if (files.length) this.uploadFiles(files);
  }

  uploadFiles(files: File[]) {
    this.uploading.set(true);
    let done = 0;
    const newDocs: any[] = [];

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        this.errorMsg.set(`${file.name} dépasse 10MB`);
        done++;
        if (done === files.length) this.uploading.set(false);
        return;
      }
      const fd = new FormData();
      fd.append('file', file);
      this.http.post<any>('/api/v1/upload/document', fd).subscribe({
        next: res => {
          const url = res?.data?.url || res?.url;
          if (url) newDocs.push({ name: file.name, url, uploadedAt: new Date().toISOString() });
          done++;
          if (done === files.length) {
            const all = [...this.documents(), ...newDocs];
            this.documents.set(all);
            this.uploading.set(false);
            // Sauvegarder
            this.http.patch<any>(`/api/v1/patients/${this.patient()?.id}`, { documents: JSON.stringify(all) }).subscribe({
              next: () => { this.successMsg.set('Document(s) ajouté(s)'); setTimeout(() => this.successMsg.set(null), 3000); }
            });
          }
        },
        error: () => { done++; if (done === files.length) this.uploading.set(false); }
      });
    });
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  private parseList(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  private parseJson(val: any): any[] | null {
    if (!val) return null;
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return null; }
  }
}

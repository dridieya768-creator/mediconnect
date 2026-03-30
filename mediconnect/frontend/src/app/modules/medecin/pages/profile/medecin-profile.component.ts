import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-medecin-profile",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <!-- HEADER -->
      <div class="page-header">
        <h1 class="page-title">👨‍⚕️ Mon Profil Professionnel</h1>
        <div class="header-actions">
          <button class="btn-save" (click)="saveProfile()" [disabled]="isSaving()">
            {{ isSaving() ? '⏳ Enregistrement...' : '💾 Enregistrer' }}
          </button>
        </div>
      </div>

      <div class="alert-success" *ngIf="successMsg()">✅ {{ successMsg() }}</div>
      <div class="alert-error" *ngIf="errorMsg()">❌ {{ errorMsg() }}</div>

      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div><p>Chargement...</p>
      </div>

      <div class="profile-grid" *ngIf="!isLoading()">

        <!-- ── CARTE IDENTITÉ ── -->
        <div class="profile-card full-width">
          <div class="card-header">
            <span class="card-icon">🪪</span>
            <h2>Identité Professionnelle</h2>
          </div>
          <div class="card-body">
            <div class="avatar-section">
              <div class="avatar-preview">
                <img *ngIf="photoPreview || form.photoPro" [src]="photoPreview || form.photoPro" alt="Photo pro" class="avatar-img"/>
                <div *ngIf="!photoPreview && !form.photoPro" class="avatar-placeholder">
                  {{ getInitials() }}
                </div>
                <div class="avatar-overlay" *ngIf="isUploadingPhoto()">
                  <div class="spinner-small"></div>
                </div>
              </div>
              <div class="avatar-info">
                <h3>{{ medecin()?.firstName }} {{ medecin()?.lastName }}</h3>
                <span class="role-badge">{{ getRoleLabel() }}</span>
                <div class="avatar-upload">
                  <label class="upload-photo-btn">
                    📸 Changer la photo
                    <input type="file" (change)="onPhotoSelected($event)" 
                           accept="image/jpeg,image/png,image/jpg" hidden>
                  </label>
                  <button *ngIf="form.photoPro || photoPreview" class="remove-photo-btn" 
                          (click)="removePhoto()" type="button">🗑️ Supprimer</button>
                </div>
                <small class="upload-hint">JPEG, PNG, JPG. Max 5MB</small>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Titre</label>
                <select class="form-input" [(ngModel)]="form.titre">
                  <option value="">— Sélectionner —</option>
                  <option value="Dr">Dr</option>
                  <option value="Pr">Pr</option>
                  <option value="Dr Pr">Dr Pr</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Spécialité</label>
                <input class="form-input" [(ngModel)]="form.specialite" placeholder="Ex: Cardiologie"/>
              </div>
              <div class="form-group">
                <label class="form-label">N° Ordre Professionnel</label>
                <input class="form-input" [(ngModel)]="form.numeroOrdrePro" placeholder="Ex: TN-12345"/>
              </div>
              <div class="form-group">
                <label class="form-label">Langues parlées</label>
                <input class="form-input" [(ngModel)]="form.languesParlees" placeholder="Ex: Français, Arabe, Anglais"/>
              </div>
              <div class="form-group full-span">
                <label class="form-label">Diplômes & Formations</label>
                <textarea class="form-input" rows="3" [(ngModel)]="form.diplomes"
                  placeholder="Ex: Doctorat en Médecine - Faculté de Tunis (2010)..."></textarea>
              </div>
              <div class="form-group full-span">
                <label class="form-label">Biographie</label>
                <textarea class="form-input" rows="4" [(ngModel)]="form.biographie"
                  placeholder="Présentez-vous en quelques lignes..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- ── LOCALISATION ── -->
        <div class="profile-card">
          <div class="card-header">
            <span class="card-icon">📍</span>
            <h2>Cabinet & Localisation</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Ville</label>
              <input class="form-input" [(ngModel)]="form.ville" placeholder="Ex: Tunis"/>
            </div>
            <div class="form-group">
              <label class="form-label">Adresse du cabinet</label>
              <input class="form-input" [(ngModel)]="form.adresseCabinet" placeholder="Ex: 12 Rue de la République, Tunis"/>
            </div>
            <div class="form-group">
              <label class="form-label">Lien Google Maps</label>
              <input class="form-input" [(ngModel)]="form.geoGoogleMaps" placeholder="https://maps.google.com/..."/>
            </div>
            <div class="form-group">
              <label class="form-label">Photos du cabinet (upload multiple)</label>
              <div class="cabinet-photos-section">
                <div class="photos-grid">
                  <div *ngFor="let photo of cabinetPhotosList; let i = index" class="photo-item">
                    <img [src]="photo" alt="Photo cabinet">
                    <button type="button" class="remove-photo-btn-small" (click)="removeCabinetPhoto(i)">×</button>
                  </div>
                  <div class="add-photo-box">
                    <label class="add-photo-label">
                      <div class="add-photo-icon">+</div>
                      <span>Ajouter</span>
                      <input type="file" (change)="onCabinetPhotosSelected($event)" 
                             accept="image/jpeg,image/png,image/jpg" multiple hidden>
                    </label>
                  </div>
                </div>
                <small class="upload-hint">Vous pouvez sélectionner plusieurs photos à la fois</small>
              </div>
            </div>
          </div>
        </div>

        <!-- ── CONTACT PRO ── -->
        <div class="profile-card">
          <div class="card-header">
            <span class="card-icon">📞</span>
            <h2>Contact Professionnel</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Téléphone professionnel</label>
              <input class="form-input" [(ngModel)]="form.telephonePro" placeholder="+216 XX XXX XXX"/>
            </div>
            <div class="form-group">
              <label class="form-label">Email professionnel</label>
              <input class="form-input" type="email" [(ngModel)]="form.emailPro" placeholder="dr.nom@cabinet.tn"/>
            </div>
          </div>
        </div>

        <!-- ── TARIFS ── -->
        <div class="profile-card">
          <div class="card-header">
            <span class="card-icon">💰</span>
            <h2>Tarifs & Actes</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Tarifs (description)</label>
              <textarea class="form-input" rows="3" [(ngModel)]="form.tarifs"
                placeholder="Ex: Consultation: 50 DT, Téléconsultation: 40 DT"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Actes couverts</label>
              <textarea class="form-input" rows="3" [(ngModel)]="form.actesCouverts"
                placeholder="Ex: ECG, Échocardiographie, Holter..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Assurances acceptées</label>
              <textarea class="form-input" rows="2" [(ngModel)]="form.assurancesAcceptees"
                placeholder="Ex: CNAM, MAE, GAT..."></textarea>
            </div>
          </div>
        </div>

        <!-- ── FONCTIONNALITÉS ── -->
        <div class="profile-card full-width">
          <div class="card-header">
            <span class="card-icon">⚙️</span>
            <h2>Fonctionnalités & Options</h2>
          </div>
          <div class="card-body">
            <div class="features-grid">
              <div class="feature-toggle" *ngFor="let feat of features">
                <div class="feat-info">
                  <span class="feat-icon">{{ feat.icon }}</span>
                  <div>
                    <div class="feat-label">{{ feat.label }}</div>
                    <div class="feat-desc">{{ feat.desc }}</div>
                  </div>
                </div>
                <label class="toggle-label">
                  <input type="checkbox" class="toggle-input" [(ngModel)]="form[feat.key]">
                  <span class="toggle-switch"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding: 0; }
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    .page-title { font-size:24px; font-weight:700; color:#0f172a; margin:0; }
    .btn-save { padding:10px 24px; background:#4f46e5; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-save:disabled { opacity:.6; cursor:not-allowed; }
    .alert-success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }
    .alert-error { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }
    .loading-state { display:flex; flex-direction:column; align-items:center; padding:60px; color:#64748b; gap:12px; }
    .spinner { width:36px; height:36px; border:3px solid #e2e8f0; border-top-color:#4f46e5; border-radius:50%; animation:spin .8s linear infinite; }
    .spinner-small { width:20px; height:20px; border:2px solid #fff; border-top-color:#4f46e5; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .profile-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .profile-card { background:white; border-radius:16px; border:1.5px solid #e2e8f0; overflow:hidden; }
    .profile-card.full-width { grid-column:1/-1; }
    .card-header { display:flex; align-items:center; gap:10px; padding:16px 20px; border-bottom:1px solid #f1f5f9; background:#f8fafc; }
    .card-header h2 { font-size:15px; font-weight:700; color:#0f172a; margin:0; }
    .card-icon { font-size:20px; }
    .card-body { padding:20px; display:flex; flex-direction:column; gap:14px; }

    .avatar-section { display:flex; align-items:flex-start; gap:20px; margin-bottom:16px; flex-wrap:wrap; }
    .avatar-preview { width:100px; height:100px; border-radius:50%; overflow:hidden; background:#4f46e5; display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; }
    .avatar-img { width:100%; height:100%; object-fit:cover; }
    .avatar-placeholder { color:white; font-size:28px; font-weight:700; }
    .avatar-overlay { position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; border-radius:50%; }
    .avatar-info h3 { font-size:18px; font-weight:700; color:#0f172a; margin:0 0 6px; }
    .role-badge { background:#eef2ff; color:#4f46e5; border-radius:20px; padding:4px 12px; font-size:12px; font-weight:600; display:inline-block; margin-bottom:12px; }
    .avatar-upload { display:flex; gap:10px; margin-top:8px; flex-wrap:wrap; }
    .upload-photo-btn { background:#f1f5f9; color:#334155; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; transition:all .2s; border:1px solid #e2e8f0; display:inline-block; }
    .upload-photo-btn:hover { background:#e2e8f0; }
    .remove-photo-btn { background:#fee2e2; color:#dc2626; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; border:none; }
    .remove-photo-btn:hover { background:#fecaca; }
    .upload-hint { font-size:11px; color:#94a3b8; margin-top:5px; display:block; }

    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .form-group { display:flex; flex-direction:column; gap:6px; }
    .form-group.full-span { grid-column:1/-1; }
    .form-label { font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }
    .form-input { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; font-family:inherit; resize:vertical; }
    .form-input:focus { border-color:#4f46e5; }

    /* Photos cabinet styles */
    .cabinet-photos-section { margin-top:8px; }
    .photos-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 100px)); gap:12px; margin-bottom:12px; }
    .photo-item { position:relative; width:100px; height:100px; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0; }
    .photo-item img { width:100%; height:100%; object-fit:cover; }
    .remove-photo-btn-small { position:absolute; top:4px; right:4px; width:22px; height:22px; border-radius:50%; background:#ef4444; color:white; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; }
    .add-photo-box { width:100px; height:100px; border:2px dashed #cbd5e1; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; background:#f8fafc; }
    .add-photo-box:hover { border-color:#4f46e5; background:#eef2ff; }
    .add-photo-label { display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; width:100%; height:100%; justify-content:center; }
    .add-photo-icon { font-size:28px; color:#64748b; }

    .features-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
    .feature-toggle { display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:14px 16px; }
    .feat-info { display:flex; align-items:center; gap:10px; }
    .feat-icon { font-size:22px; flex-shrink:0; }
    .feat-label { font-size:13px; font-weight:700; color:#0f172a; }
    .feat-desc { font-size:11px; color:#94a3b8; margin-top:2px; }
    .toggle-label { display:flex; align-items:center; cursor:pointer; }
    .toggle-input { display:none; }
    .toggle-switch { width:42px; height:24px; background:#e2e8f0; border-radius:12px; position:relative; transition:background .2s; flex-shrink:0; }
    .toggle-switch::after { content:''; position:absolute; top:3px; left:3px; width:18px; height:18px; background:white; border-radius:50%; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
    .toggle-input:checked + .toggle-switch { background:#4f46e5; }
    .toggle-input:checked + .toggle-switch::after { transform:translateX(18px); }

    @media (max-width:768px) {
      .profile-grid { grid-template-columns:1fr; }
      .form-grid { grid-template-columns:1fr; }
      .features-grid { grid-template-columns:1fr; }
      .photos-grid { grid-template-columns:repeat(auto-fill, minmax(80px, 80px)); }
      .photo-item, .add-photo-box { width:80px; height:80px; }
    }
  `]
})
export class MedecinProfileComponent implements OnInit {
  private http = inject(HttpClient);

  medecin    = signal<any>(null);
  isLoading  = signal(true);
  isSaving   = signal(false);
  isUploadingPhoto = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg   = signal<string | null>(null);
  
  photoPreview: string | null = null;
  cabinetPhotosList: string[] = [];

  form: any = {
    titre: '',
    specialite: '',
    numeroOrdrePro: '',
    diplomes: '',
    photoPro: '',
    photosCabinet: '',
    languesParlees: '',
    biographie: '',
    adresseCabinet: '',
    geoGoogleMaps: '',
    ville: '',
    telephonePro: '',
    emailPro: '',
    tarifs: '',
    actesCouverts: '',
    assurancesAcceptees: '',
    agendaConnecte: true,
    disponTeleconsult: false,
    connexionVideoIntegree: false,
    profilSEO: false,
    statsAnalytics: false,
  };

  features = [
    { key: 'agendaConnecte',       icon: '📅', label: 'Agenda connecté',        desc: 'Synchronisation avec le planning' },
    { key: 'disponTeleconsult',    icon: '💻', label: 'Téléconsultation',        desc: 'Disponible en vidéo consultation' },
    { key: 'connexionVideoIntegree', icon: '📹', label: 'Vidéo intégrée',       desc: 'Utiliser Jitsi Meet intégré' },
    { key: 'profilSEO',            icon: '🔍', label: 'Profil SEO',             desc: 'Référencement sur les moteurs de recherche' },
    { key: 'statsAnalytics',       icon: '📊', label: 'Stats & Analytics',      desc: 'Statistiques de consultation du profil' },
  ];

  ngOnInit() { this.loadProfile(); }

  loadProfile() {
    this.isLoading.set(true);
    this.http.get<any>("/api/v1/medecins/me")
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        const data = res?.data?.data ?? res?.data ?? res;
        if (data) {
          this.medecin.set(data);
          if (data.profile) {
            Object.keys(this.form).forEach(key => {
              if (data.profile[key] !== undefined && data.profile[key] !== null) {
                this.form[key] = data.profile[key];
                if (key === 'photoPro' && data.profile[key]) {
                  this.photoPreview = data.profile[key];
                }
                if (key === 'photosCabinet' && data.profile[key]) {
                  this.cabinetPhotosList = data.profile[key].split(',').map((p: string) => p.trim());
                }
              }
            });
          }
          if (data.emailPro === undefined && data.email) {
            this.form.emailPro = data.email;
          }
        }
        this.isLoading.set(false);
      });
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMsg.set("La photo ne doit pas dépasser 5MB");
        setTimeout(() => this.errorMsg.set(null), 3000);
        return;
      }
      
      // Vérifier le type
      if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
        this.errorMsg.set("Format accepté: JPEG, PNG, JPG");
        setTimeout(() => this.errorMsg.set(null), 3000);
        return;
      }
      
      this.isUploadingPhoto.set(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      this.http.post<any>("/api/v1/upload/photo", formData)
        .pipe(finalize(() => this.isUploadingPhoto.set(false)))
        .subscribe({
          next: (res) => {
            const photoUrl = res?.data?.url || res?.url;
            if (photoUrl) {
              this.photoPreview = photoUrl;
              this.form.photoPro = photoUrl;
              this.successMsg.set("Photo téléchargée avec succès !");
              setTimeout(() => this.successMsg.set(null), 3000);
            }
          },
          error: (err) => {
            console.error('Upload error:', err);
            this.errorMsg.set("Erreur lors du téléchargement de la photo");
            setTimeout(() => this.errorMsg.set(null), 3000);
          }
        });
    }
  }

  onCabinetPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      for (const file of files) {
        // Vérifier la taille
        if (file.size > 5 * 1024 * 1024) {
          this.errorMsg.set(`La photo "${file.name}" dépasse 5MB`);
          setTimeout(() => this.errorMsg.set(null), 3000);
          continue;
        }
        
        // Vérifier le type
        if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
          this.errorMsg.set(`Format non accepté pour "${file.name}"`);
          setTimeout(() => this.errorMsg.set(null), 3000);
          continue;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        
        this.http.post<any>("/api/v1/upload/photo", formData)
          .subscribe({
            next: (res) => {
              const photoUrl = res?.data?.url || res?.url;
              if (photoUrl) {
                this.cabinetPhotosList.push(photoUrl);
                this.form.photosCabinet = this.cabinetPhotosList.join(', ');
              }
            },
            error: (err) => {
              console.error('Upload error:', err);
              this.errorMsg.set(`Erreur lors du téléchargement de "${file.name}"`);
            }
          });
      }
      
      this.successMsg.set(`${files.length} photo(s) en cours de téléchargement...`);
      setTimeout(() => this.successMsg.set(null), 3000);
    }
  }

  removePhoto() {
    this.photoPreview = null;
    this.form.photoPro = '';
  }

  removeCabinetPhoto(index: number) {
    this.cabinetPhotosList.splice(index, 1);
    this.form.photosCabinet = this.cabinetPhotosList.join(', ');
  }

  saveProfile() {
    this.isSaving.set(true);
    this.errorMsg.set(null);
    this.http.put<any>("/api/v1/medecins/profile", this.form)
      .pipe(catchError(err => {
        this.errorMsg.set("Erreur lors de l'enregistrement");
        this.isSaving.set(false);
        return of(null);
      }))
      .subscribe(res => {
        if (res) {
          this.successMsg.set("Profil mis à jour avec succès !");
          setTimeout(() => this.successMsg.set(null), 3000);
        }
        this.isSaving.set(false);
      });
  }

  getInitials(): string {
    const m = this.medecin();
    if (!m) return 'M';
    return `${m.firstName?.[0] ?? ''}${m.lastName?.[0] ?? ''}`.toUpperCase();
  }

  getRoleLabel(): string {
    const role = this.medecin()?.role ?? '';
    const labels: Record<string, string> = {
      MEDECIN_GENERALISTE:  'Médecin Généraliste',
      MEDECIN_SPECIALISTE:  'Médecin Spécialiste',
      MEDECIN_CHEF_SERVICE: 'Chef de Service',
    };
    return labels[role] || role;
  }
}
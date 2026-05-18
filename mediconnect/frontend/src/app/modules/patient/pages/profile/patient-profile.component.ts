import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { AuthService } from "../../../../core/services/auth.service";

@Component({
  selector: "app-patient-profile",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">

      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title"> Mon Profil</h1>
          <p class="page-subtitle">Gérez vos informations personnelles et médicales</p>
        </div>
        <div class="header-actions">
          <button class="btn-edit" *ngIf="!editing()" (click)="startEdit()"> Modifier</button>
          <button class="btn-save" *ngIf="editing()" (click)="saveProfile()" [disabled]="saving()">
            {{ saving() ? ' Enregistrement...' : ' Enregistrer' }}
          </button>
          <button class="btn-cancel" *ngIf="editing()" (click)="cancelEdit()">Annuler</button>
        </div>
      </div>

      <!-- ALERTS -->
      <div class="alert-success" *ngIf="successMsg()"> {{ successMsg() }}</div>
      <div class="alert-error"   *ngIf="errorMsg()"> {{ errorMsg() }}</div>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Chargement du profil...</p>
      </div>

      <div class="profile-grid" *ngIf="!loading()">

        <!-- ── COLONNE GAUCHE : Avatar + Infos rapides ── -->
        <div class="left-col">

          <!-- Avatar Card -->
          <div class="avatar-card">
            <div class="avatar-wrapper">
              <div class="avatar-circle">
                <img *ngIf="avatarPreview() || user()?.avatarUrl"
                     [src]="avatarPreview() || user()!.avatarUrl"
                     class="avatar-img" alt="Photo profil"/>
                <span *ngIf="!avatarPreview() && !user()?.avatarUrl" class="avatar-initials">
                  {{ getInitials() }}
                </span>
              </div>
              <button class="avatar-edit-btn" (click)="fileInput.click()" title="Changer la photo">
                [◉°]
              </button>
              <input #fileInput type="file" accept="image/*" style="display:none"
                     (change)="onAvatarSelected($event)"/>
            </div>
            <div class="avatar-upload-hint" *ngIf="uploadingAvatar()"> Envoi en cours...</div>
            <h2 class="avatar-name">{{ user()?.firstName }} {{ user()?.lastName }}</h2>
            <span class="avatar-role">Patient</span>
            <div class="avatar-email">{{ user()?.email }}</div>

            <div class="quick-stats">
              <div class="qs-item">
                <span class="qs-icon"></span>
                <span class="qs-label">Groupe sanguin</span>
                <span class="qs-value blood">{{ profile()?.groupeSanguin || '—' }}</span>
              </div>
              <div class="qs-item">
                <span class="qs-icon"></span>
                <span class="qs-label">Date de naissance</span>
                <span class="qs-value">{{ formatDate(profile()?.dateNaissance) }}</span>
              </div>
              <div class="qs-item">
                <span class="qs-icon"></span>
                <span class="qs-label">Ville</span>
                <span class="qs-value">{{ profile()?.ville || '—' }}</span>
              </div>
              <div class="qs-item">
                <span class="qs-icon"></span>
                <span class="qs-label">Téléphone</span>
                <span class="qs-value">{{ profile()?.telephone || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Sécurité -->
          <div class="security-card">
            <h3 class="card-title"> Sécurité</h3>
            <div class="security-item">
              <span>Authentification 2FA</span>
              <span class="badge-on" *ngIf="user()?.mfaEnabled">Activée</span>
              <span class="badge-off" *ngIf="!user()?.mfaEnabled">Désactivée</span>
            </div>
            <div class="security-item">
              <span>Statut du compte</span>
              <span class="badge-on">Actif</span>
            </div>
            <button class="btn-security" (click)="goTo('/patient/securite')">
              ⚙️ Paramètres de sécurité
            </button>
            <button class="btn-logout" (click)="logout()">
               Déconnexion
            </button>
          </div>
        </div>

        <!-- ── COLONNE DROITE : Formulaire ── -->
        <div class="right-col">

          <!-- Informations personnelles -->
          <div class="info-card">
            <h3 class="card-title"> Informations personnelles</h3>

            <div class="form-grid" *ngIf="!editing()">
              <div class="info-row"><span class="info-label">Prénom</span><span class="info-val">{{ user()?.firstName || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Nom</span><span class="info-val">{{ user()?.lastName || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Email</span><span class="info-val">{{ user()?.email || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Téléphone</span><span class="info-val">{{ profile()?.telephone || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Date de naissance</span><span class="info-val">{{ formatDate(profile()?.dateNaissance) }}</span></div>
              <div class="info-row"><span class="info-label">Sexe</span><span class="info-val">{{ profile()?.sexe === 'M' ? 'Masculin' : profile()?.sexe === 'F' ? 'Féminin' : '—' }}</span></div>
              <div class="info-row"><span class="info-label">Ville</span><span class="info-val">{{ profile()?.ville || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Langue préférée</span><span class="info-val">{{ profile()?.languePreferee || 'Français' }}</span></div>
            </div>

            <div class="edit-grid" *ngIf="editing()">
              <div class="field-group">
                <label class="field-label">Téléphone</label>
                <input class="field-input" type="tel" [(ngModel)]="form.telephone" placeholder="+216 XX XXX XXX"/>
              </div>
              <div class="field-group">
                <label class="field-label">Date de naissance</label>
                <input class="field-input" type="date" [(ngModel)]="form.dateNaissance"/>
              </div>
              <div class="field-group">
                <label class="field-label">Sexe</label>
                <select class="field-input" [(ngModel)]="form.sexe">
                  <option value="">— Sélectionner —</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Ville</label>
                <input class="field-input" type="text" [(ngModel)]="form.ville" placeholder="Tunis, Sfax..."/>
              </div>
              <div class="field-group">
                <label class="field-label">Groupe sanguin</label>
                <select class="field-input" [(ngModel)]="form.groupeSanguin">
                  <option value="">— Sélectionner —</option>
                  <option *ngFor="let g of bloodGroups" [value]="g">{{ g }}</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Langue préférée</label>
                <select class="field-input" [(ngModel)]="form.languePreferee">
                  <option value="fr">Français</option>
                  <option value="ar">Arabe</option>
                  <option value="en">Anglais</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Informations médicales -->
          <div class="info-card">
            <h3 class="card-title"> Informations médicales</h3>

            <div *ngIf="!editing()">
              <div class="medical-row">
                <span class="info-label">Groupe sanguin</span>
                <span class="blood-badge" *ngIf="profile()?.groupeSanguin">{{ profile()?.groupeSanguin }}</span>
                <span class="info-val" *ngIf="!profile()?.groupeSanguin">—</span>
              </div>

              <div class="tags-section">
                <div class="tags-label"> Allergies</div>
                <div class="tags-list">
                  <span class="tag tag-danger" *ngFor="let a of getAllergies()">{{ a }}</span>
                  <span class="empty-tag" *ngIf="!getAllergies().length">Aucune allergie renseignée</span>
                </div>
              </div>

              <div class="tags-section">
                <div class="tags-label"> Maladies chroniques</div>
                <div class="tags-list">
                  <span class="tag tag-warning" *ngFor="let m of getMaladies()">{{ m }}</span>
                  <span class="empty-tag" *ngIf="!getMaladies().length">Aucune maladie chronique renseignée</span>
                </div>
              </div>

              <div class="tags-section">
                <div class="tags-label"> Médicaments actuels</div>
                <div class="tags-list">
                  <span class="tag tag-blue" *ngFor="let med of getMedNames()">{{ med }}</span>
                  <span class="empty-tag" *ngIf="!getMedNames().length">Aucun médicament renseigné</span>
                </div>
              </div>
            </div>

            <div *ngIf="editing()">
              <div class="field-group" style="margin-bottom:16px">
                <label class="field-label">Allergies (séparées par virgule)</label>
                <input class="field-input" type="text" [(ngModel)]="form.allergiesStr"
                  placeholder="Pénicilline, Arachides..."/>
              </div>
              <div class="field-group">
                <label class="field-label">Maladies chroniques (séparées par virgule)</label>
                <input class="field-input" type="text" [(ngModel)]="form.maladiesStr"
                  placeholder="Diabète, Hypertension..."/>
              </div>
            </div>
          </div>

          <!-- NSS -->
          <div class="info-card" *ngIf="profile()?.nss">
            <h3 class="card-title"> Numéro de Sécurité Sociale</h3>
            <div class="nss-display">{{ profile()?.nss }}</div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding: 0; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .page-title { font-size:26px; font-weight:700; color:#0f172a; margin:0 0 4px; }
    .page-subtitle { color:#64748b; font-size:14px; margin:0; }
    .header-actions { display:flex; gap:8px; align-items:center; }

    .btn-edit   { padding:9px 20px; background:#eff6ff; color:#1a56db; border:2px solid #1a56db; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; transition:background .15s; }
    .btn-edit:hover { background:#dbeafe; }
    .btn-save   { padding:9px 20px; background:#1a56db; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-save:disabled { opacity:.6; cursor:not-allowed; }
    .btn-cancel { padding:9px 16px; background:#f8fafc; color:#64748b; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; cursor:pointer; }

    .alert-success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }
    .alert-error   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }

    .loading-state { display:flex; flex-direction:column; align-items:center; padding:80px; color:#64748b; gap:12px; }
    .spinner { width:40px; height:40px; border:3px solid #e2e8f0; border-top-color:#1a56db; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .profile-grid { display:grid; grid-template-columns:280px 1fr; gap:24px; align-items:start; }

    /* ── LEFT ── */
    .left-col { display:flex; flex-direction:column; gap:16px; }

    .avatar-card { background:white; border-radius:16px; padding:28px 20px; text-align:center; box-shadow:0 2px 12px rgba(0,0,0,.06); border:1px solid #e5e7eb; }
    .avatar-wrapper { position:relative; width:88px; margin:0 auto 16px; }
    .avatar-circle { width:88px; height:88px; border-radius:50%; background:linear-gradient(135deg,#1a56db,#2563eb); display:flex; align-items:center; justify-content:center; overflow:hidden; border:3px solid #dbeafe; }
    .avatar-img { width:100%; height:100%; object-fit:cover; }
    .avatar-initials { color:white; font-size:28px; font-weight:700; }
    .avatar-edit-btn { position:absolute; bottom:0; right:0; width:28px; height:28px; border-radius:50%; background:#1a56db; border:2px solid white; cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:center; transition:background .15s; }
    .avatar-edit-btn:hover { background:#1447c0; }
    .avatar-upload-hint { font-size:11px; color:#64748b; margin-bottom:8px; }
    .avatar-name { font-size:18px; font-weight:700; color:#0f172a; margin:0 0 4px; }
    .avatar-role { display:inline-block; background:#eff6ff; color:#1a56db; border-radius:20px; padding:3px 12px; font-size:12px; font-weight:600; margin-bottom:8px; }
    .avatar-email { font-size:13px; color:#64748b; margin-bottom:20px; word-break:break-all; }

    .quick-stats { display:flex; flex-direction:column; gap:10px; text-align:left; }
    .qs-item { display:flex; align-items:center; gap:10px; padding:8px 12px; background:#f8fafc; border-radius:8px; }
    .qs-icon { font-size:16px; flex-shrink:0; }
    .qs-label { font-size:11px; color:#94a3b8; flex:1; }
    .qs-value { font-size:13px; font-weight:600; color:#0f172a; }
    .qs-value.blood { color:#dc2626; font-size:15px; }

    .security-card { background:white; border-radius:16px; padding:20px; box-shadow:0 2px 12px rgba(0,0,0,.06); border:1px solid #e5e7eb; }
    .security-item { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:13px; color:#475569; }
    .security-item:last-of-type { border:none; }
    .badge-on  { background:#f0fdf4; color:#16a34a; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
    .badge-off { background:#fef2f2; color:#dc2626; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
    .btn-security { width:100%; margin-top:12px; padding:9px; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; color:#64748b; cursor:pointer; transition:all .15s; }
    .btn-security:hover { border-color:#1a56db; color:#1a56db; background:#eff6ff; }
    .btn-logout { width:100%; margin-top:8px; padding:9px; background:#fef2f2; border:1.5px solid #fecaca; border-radius:8px; font-size:13px; color:#dc2626; cursor:pointer; font-weight:600; transition:all .15s; }
    .btn-logout:hover { background:#fee2e2; border-color:#dc2626; }

    /* ── RIGHT ── */
    .right-col { display:flex; flex-direction:column; gap:16px; }

    .info-card { background:white; border-radius:16px; padding:24px; box-shadow:0 2px 12px rgba(0,0,0,.06); border:1px solid #e5e7eb; }
    .card-title { font-size:15px; font-weight:700; color:#0f172a; margin:0 0 18px; padding-bottom:12px; border-bottom:1px solid #f1f5f9; }

    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; }
    .info-row { display:flex; flex-direction:column; gap:3px; padding:10px 0; border-bottom:1px solid #f8fafc; }
    .info-label { font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; font-weight:600; }
    .info-val { font-size:14px; font-weight:600; color:#0f172a; }

    .edit-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .field-group { display:flex; flex-direction:column; gap:6px; }
    .field-label { font-size:12px; font-weight:600; color:#64748b; }
    .field-input { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; transition:border-color .15s; width:100%; box-sizing:border-box; background:white; font-family:inherit; }
    .field-input:focus { border-color:#1a56db; box-shadow:0 0 0 3px rgba(26,86,219,.08); }

    .medical-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f8fafc; margin-bottom:14px; }
    .blood-badge { background:#fef2f2; color:#dc2626; border:1.5px solid #fecaca; border-radius:8px; padding:4px 14px; font-size:16px; font-weight:800; }

    .tags-section { margin-bottom:16px; }
    .tags-label { font-size:12px; font-weight:600; color:#64748b; margin-bottom:8px; }
    .tags-list { display:flex; flex-wrap:wrap; gap:6px; min-height:28px; }
    .tag { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:500; }
    .tag-danger  { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
    .tag-warning { background:#fffbeb; color:#d97706; border:1px solid #fde68a; }
    .tag-blue    { background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; }
    .empty-tag   { font-size:13px; color:#94a3b8; font-style:italic; }

    .nss-display { font-size:18px; font-weight:700; color:#1a56db; letter-spacing:2px; background:#eff6ff; padding:12px 20px; border-radius:10px; display:inline-block; }

    @media (max-width:900px) {
      .profile-grid { grid-template-columns:1fr; }
      .form-grid, .edit-grid { grid-template-columns:1fr; }
    }
  `]
})
export class PatientProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  user    = this.authService.currentUser;
  profile = signal<any>(null);
  loading = signal(true);
  editing = signal(false);
  saving  = signal(false);
  successMsg = signal('');
  errorMsg   = signal('');
  avatarPreview  = signal<string | null>(null);
  uploadingAvatar = signal(false);

  bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

  form: any = {};

  ngOnInit() { this.loadProfile(); }

  loadProfile() {
    this.loading.set(true);
    this.http.get<any>('/api/v1/patients/me').subscribe({
      next: res => {
        // TransformInterceptor wraps: { success, data: { success, id, data: {...} }, timestamp }
        const outer = res?.data ?? res;
        const profile = outer?.data ?? outer;
        this.profile.set(profile);
        // Synchroniser la photo avec le signal AuthService → navbar se met à jour
        const avatarUrl = profile?.avatarUrl ?? profile?.user?.avatarUrl;
        if (avatarUrl) {
          this.avatarPreview.set(avatarUrl);
          this.authService.updateAvatar(avatarUrl);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  startEdit() {
    const p = this.profile();
    this.form = {
      telephone:      p?.telephone || '',
      dateNaissance:  p?.dateNaissance ? p.dateNaissance.substring(0,10) : '',
      sexe:           p?.sexe || '',
      ville:          p?.ville || '',
      groupeSanguin:  p?.groupeSanguin || '',
      languePreferee: p?.languePreferee || 'fr',
      allergiesStr:   (p?.allergies || []).join(', '),
      maladiesStr:    (p?.maladiesChroniques || []).join(', '),
    };
    this.editing.set(true);
  }

  cancelEdit() { this.editing.set(false); }

  saveProfile() {
    this.saving.set(true);
    this.errorMsg.set('');

    // Nettoyer le payload — ne pas envoyer les champs vides/null
    const payload: any = {};
    if (this.form.telephone)      payload.telephone      = this.form.telephone;
    if (this.form.dateNaissance)  payload.dateNaissance  = this.form.dateNaissance;
    if (this.form.sexe)           payload.sexe           = this.form.sexe;
    if (this.form.ville)          payload.ville          = this.form.ville;
    if (this.form.languePreferee) payload.languePreferee = this.form.languePreferee;
    if (this.form.groupeSanguin)  payload.groupeSanguin  = this.form.groupeSanguin;

    // Tableaux — toujours inclus
    payload.allergies = this.form.allergiesStr
      ? this.form.allergiesStr.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
    payload.maladiesChroniques = this.form.maladiesStr
      ? this.form.maladiesStr.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const patientId = this.profile()?.id;
    console.log('[saveProfile] patientId:', patientId, 'payload:', payload);
    if (!patientId) { this.errorMsg.set('Profil introuvable — rechargez la page'); this.saving.set(false); return; }

    this.http.patch<any>(`/api/v1/patients/${patientId}`, payload).subscribe({
      next: () => {
        // Recharger le profil complet depuis /me pour avoir les données fraîches
        this.http.get<any>('/api/v1/patients/me').subscribe({
          next: res => {
            const outer = res?.data ?? res;
            const profile = outer?.data ?? outer;
            this.profile.set(profile);
            this.editing.set(false);
            this.saving.set(false);
            this.successMsg.set('Profil mis à jour avec succès');
            setTimeout(() => this.successMsg.set(''), 3000);
          },
          error: () => {
            this.editing.set(false);
            this.saving.set(false);
            this.successMsg.set('Profil mis à jour avec succès');
            setTimeout(() => this.successMsg.set(''), 3000);
          }
        });
      },
      error: err => {
        const msg = err?.error?.message;
        this.errorMsg.set(Array.isArray(msg) ? msg.join(', ') : msg || 'Erreur lors de la mise à jour');
        this.saving.set(false);
      }
    });
  }

  getInitials(): string {
    const u = this.user();
    return ((u?.firstName?.[0] || '') + (u?.lastName?.[0] || '')).toUpperCase() || 'P';
  }

  formatDate(d: any): string {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }); }
    catch { return '—'; }
  }

  getMedNames(): string[] {
    const meds = this.profile()?.medicamentsActuels;
    if (!meds) return [];
    if (Array.isArray(meds)) return meds.map((m: any) => typeof m === 'string' ? m : m?.nom || m?.name || '').filter(Boolean);
    return String(meds).split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  getAllergies(): string[] {
    const val = this.profile()?.allergies;
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    return String(val).split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  getMaladies(): string[] {
    const val = this.profile()?.maladiesChroniques;
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    return String(val).split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  goTo(route: string) { this.router.navigate([route]); }

  logout() { this.authService.logout(); }

  onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg.set('Image trop grande (max 5 Mo)');
      return;
    }

    // Redimensionner et compresser via canvas avant upload
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      const MAX = 200; // max 200x200px
      let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
      else        { if (h > MAX) { w = w * MAX / h; h = MAX; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.8); // qualité 80%

      this.avatarPreview.set(base64);
      this.uploadingAvatar.set(true);

      this.http.patch<any>('/api/v1/patients/avatar', { avatarUrl: base64 }).subscribe({
        next: (res) => {
          if (res?.data?.success === false || res?.success === false) {
            this.avatarPreview.set(null);
            this.errorMsg.set(res?.data?.message || res?.message || 'Erreur upload');
            this.uploadingAvatar.set(false);
            return;
          }
          // Mettre à jour le signal AuthService → sidebar se rafraîchit automatiquement
          this.authService.updateAvatar(base64);
          this.uploadingAvatar.set(false);
          this.successMsg.set('Photo de profil mise à jour');
          setTimeout(() => this.successMsg.set(''), 3000);
        },
        error: (err) => {
          this.avatarPreview.set(null);
          this.uploadingAvatar.set(false);
          this.errorMsg.set('Erreur lors de l\'upload. Essayez une image plus petite.');
        }
      });
    };
    img.src = objectUrl;
  }
}

import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, debounceTime, distinctUntilChanged, Subject, switchMap } from "rxjs";
import { of } from "rxjs";
import { AuthService } from "../../../../core/services/auth.service";
import { BookAppointmentPanelComponent } from "./book-appointment-panel/book-appointment-panel.component";

@Component({
  selector: "app-patient-search-medecin",
  standalone: true,
  imports: [CommonModule, FormsModule, BookAppointmentPanelComponent],
  template: `
    <div class="search-page">

      <!-- HEADER -->
      <div class="page-header">
        <h1 class="page-title">🔍 Trouver un Médecin</h1>
        <p class="page-subtitle">Recherchez parmi nos médecins disponibles</p>
      </div>

      <!-- BARRE DE RECHERCHE -->
      <div class="search-hero">
        <div class="search-bar-main">
          <div class="search-input-wrap">
            <span class="search-icon">🔍</span>
            <input class="search-input" type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Nom du médecin, spécialité..."/>
          </div>
          <div class="search-select-wrap">
            <span class="search-icon">📍</span>
            <select class="search-select" [(ngModel)]="filterVille" (change)="applyFilters()">
              <option value="">Toutes les villes</option>
              <option *ngFor="let v of villes" [value]="v">{{ v }}</option>
            </select>
          </div>
          <div class="search-select-wrap">
            <span class="search-icon">🩺</span>
            <select class="search-select" [(ngModel)]="filterSpecialite" (change)="applyFilters()">
              <option value="">Toutes spécialités</option>
              <option *ngFor="let s of specialites" [value]="s">{{ s }}</option>
            </select>
          </div>
          <button class="btn-search" (click)="applyFilters()">Rechercher</button>
        </div>

        <!-- FILTRES RAPIDES -->
        <div class="quick-filters">
          <button class="quick-btn" [class.active]="filterTeleconsult"
            (click)="filterTeleconsult = !filterTeleconsult; applyFilters()">
            💻 Téléconsultation
          </button>
          <button class="quick-btn" [class.active]="filterDisponible"
            (click)="filterDisponible = !filterDisponible; applyFilters()">
            ✅ Disponible aujourd'hui
          </button>
          <button *ngFor="let s of topSpecialites" class="quick-btn"
            [class.active]="filterSpecialite === s"
            (click)="filterSpecialite = filterSpecialite === s ? '' : s; applyFilters()">
            {{ s }}
          </button>
        </div>
      </div>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p>Recherche en cours...</p>
      </div>

      <!-- RÉSULTATS -->
      <div *ngIf="!isLoading()">
        <div class="results-header">
          <span class="results-count">{{ filteredDoctors().length }} médecin(s) trouvé(s)</span>
          <div class="sort-bar">
            <select class="sort-select" [(ngModel)]="sortBy" (change)="sortDoctors()">
              <option value="nom">Trier par nom</option>
              <option value="specialite">Trier par spécialité</option>
              <option value="ville">Trier par ville</option>
            </select>
          </div>
        </div>

        <!-- GRILLE MÉDECINS -->
        <div class="doctors-grid" *ngIf="filteredDoctors().length > 0">
          <div class="doctor-card" *ngFor="let doc of filteredDoctors()"
            (click)="openProfile(doc)">

            <!-- Avatar + Badge -->
            <div class="card-top">
              <div class="doc-avatar">
                <img *ngIf="doc.profile?.photoPro" [src]="doc.profile.photoPro" [alt]="getFullName(doc)" class="avatar-img"/>
                <span *ngIf="!doc.profile?.photoPro" class="avatar-initials">{{ getInitials(doc) }}</span>
              </div>
              <div class="doc-badges">
                <span class="badge-teleconsult" *ngIf="doc.profile?.disponTeleconsult">💻 Téléconsult.</span>
                <span class="badge-disponible">✅ Disponible</span>
              </div>
            </div>

            <!-- Infos principales -->
            <div class="card-body">
              <h3 class="doc-name">{{ doc.profile?.titre || 'Dr.' }} {{ getFullName(doc) }}</h3>
              <p class="doc-spec">{{ doc.profile?.specialite || getRoleLabel(doc.role) }}</p>

              <div class="doc-meta">
                <span *ngIf="doc.profile?.ville">
                  <span class="meta-icon">📍</span> {{ doc.profile.ville }}
                </span>
                <span *ngIf="doc.profile?.languesParlees">
                  <span class="meta-icon">🗣️</span> {{ doc.profile.languesParlees }}
                </span>
                <span *ngIf="doc.profile?.telephonePro">
                  <span class="meta-icon">📞</span> {{ doc.profile.telephonePro }}
                </span>
              </div>

              <p class="doc-bio" *ngIf="doc.profile?.biographie">
                {{ doc.profile.biographie | slice:0:120 }}{{ doc.profile.biographie?.length > 120 ? '...' : '' }}
              </p>

              <!-- Tarifs -->
              <div class="doc-tarifs" *ngIf="doc.profile?.tarifs">
                <span class="tarif-label">💰</span>
                <span class="tarif-text">{{ getTarif(doc.profile.tarifs) }}</span>
              </div>

              <!-- Assurances -->
              <div class="doc-assurances" *ngIf="doc.profile?.assurancesAcceptees">
                <span class="assur-label">🛡️ Assurances :</span>
                <span class="assur-text">{{ doc.profile.assurancesAcceptees }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="card-actions">
              <button class="btn-profile" (click)="$event.stopPropagation(); openProfile(doc)">
                👁️ Voir profil
              </button>
              <button class="btn-rdv" (click)="$event.stopPropagation(); takeAppointment(doc)">
                📅 Prendre RDV
              </button>
            </div>
          </div>
        </div>

        <!-- EMPTY STATE -->
        <div class="empty-state" *ngIf="filteredDoctors().length === 0">
          <div style="font-size:56px">🔍</div>
          <p>Aucun médecin trouvé pour votre recherche</p>
          <button class="btn-reset" (click)="resetFilters()">Réinitialiser les filtres</button>
        </div>
      </div>

      <!-- PANNEAU PRISE DE RDV -->
      <app-book-appointment-panel
        [medecin]="bookingDoctor()"
        (closed)="bookingDoctor.set(null)"
        (booked)="onBooked()"
      ></app-book-appointment-panel>

      <!-- MODAL PROFIL MÉDECIN -->
      <div class="modal-overlay" *ngIf="selectedDoc()" (click)="selectedDoc.set(null)">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Profil du Médecin</h2>
            <button class="btn-close" (click)="selectedDoc.set(null)">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedDoc()">
            <!-- En-tête profil -->
            <div class="profile-hero">
              <div class="profile-avatar">
                <img *ngIf="selectedDoc()!.profile?.photoPro"
                  [src]="selectedDoc()!.profile.photoPro" class="avatar-img-lg"/>
                <span *ngIf="!selectedDoc()!.profile?.photoPro" class="avatar-initials-lg">
                  {{ getInitials(selectedDoc()!) }}
                </span>
              </div>
              <div class="profile-intro">
                <h3>{{ selectedDoc()!.profile?.titre || 'Dr.' }} {{ getFullName(selectedDoc()!) }}</h3>
                <p class="profile-spec">{{ selectedDoc()!.profile?.specialite || getRoleLabel(selectedDoc()!.role) }}</p>
                <div class="profile-badges">
                  <span class="badge-teleconsult" *ngIf="selectedDoc()!.profile?.disponTeleconsult">💻 Téléconsultation</span>
                  <span class="badge-video" *ngIf="selectedDoc()!.profile?.connexionVideoIntegree">📹 Vidéo intégrée</span>
                </div>
              </div>
            </div>

            <!-- Infos détaillées -->
            <div class="profile-sections">
              <div class="profile-section" *ngIf="selectedDoc()!.profile?.biographie">
                <h4>📋 Biographie</h4>
                <p>{{ selectedDoc()!.profile.biographie }}</p>
              </div>

              <div class="profile-section" *ngIf="selectedDoc()!.profile?.diplomes">
                <h4>🎓 Diplômes & Formations</h4>
                <p>{{ selectedDoc()!.profile.diplomes }}</p>
              </div>

              <div class="profile-section">
                <h4>📍 Contact & Localisation</h4>
                <div class="info-grid">
                  <div class="info-row" *ngIf="selectedDoc()!.profile?.adresseCabinet">
                    <span class="info-label">Adresse</span>
                    <span>{{ selectedDoc()!.profile.adresseCabinet }}</span>
                  </div>
                  <div class="info-row" *ngIf="selectedDoc()!.profile?.ville">
                    <span class="info-label">Ville</span>
                    <span>{{ selectedDoc()!.profile.ville }}</span>
                  </div>
                  <div class="info-row" *ngIf="selectedDoc()!.profile?.telephonePro">
                    <span class="info-label">Téléphone</span>
                    <span>{{ selectedDoc()!.profile.telephonePro }}</span>
                  </div>
                  <div class="info-row" *ngIf="selectedDoc()!.profile?.emailPro">
                    <span class="info-label">Email</span>
                    <span>{{ selectedDoc()!.profile.emailPro }}</span>
                  </div>
                  <div class="info-row" *ngIf="selectedDoc()!.profile?.languesParlees">
                    <span class="info-label">Langues</span>
                    <span>{{ selectedDoc()!.profile.languesParlees }}</span>
                  </div>
                </div>
              </div>

              <div class="profile-section" *ngIf="selectedDoc()!.profile?.tarifs || selectedDoc()!.profile?.assurancesAcceptees">
                <h4>💰 Tarifs & Assurances</h4>
                <div class="info-grid">
                  <div class="info-row" *ngIf="selectedDoc()!.profile?.tarifs">
                    <span class="info-label">Tarifs</span>
                    <span>{{ selectedDoc()!.profile.tarifs }}</span>
                  </div>
                  <div class="info-row" *ngIf="selectedDoc()!.profile?.assurancesAcceptees">
                    <span class="info-label">Assurances</span>
                    <span>{{ selectedDoc()!.profile.assurancesAcceptees }}</span>
                  </div>
                  <div class="info-row" *ngIf="selectedDoc()!.profile?.actesCouverts">
                    <span class="info-label">Actes</span>
                    <span>{{ selectedDoc()!.profile.actesCouverts }}</span>
                  </div>
                </div>
              </div>

              <!-- Google Maps -->
              <div class="profile-section" *ngIf="selectedDoc()!.profile?.geoGoogleMaps">
                <h4>🗺️ Localisation</h4>
                <a [href]="selectedDoc()!.profile.geoGoogleMaps" target="_blank" class="maps-link">
                  📍 Voir sur Google Maps
                </a>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-outline" (click)="selectedDoc.set(null)">Fermer</button>
            <button class="btn-rdv-lg" (click)="takeAppointment(selectedDoc()!)">
              📅 Prendre un rendez-vous
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .search-page { padding: 0; }
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-subtitle { color: #64748b; font-size: 14px; margin: 0; }

    .search-hero { background: linear-gradient(135deg, #1a56db, #2563eb); border-radius: 16px; padding: 28px; margin-bottom: 28px; }
    .search-bar-main { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
    .search-input-wrap, .search-select-wrap { display: flex; align-items: center; gap: 8px; background: white; border-radius: 10px; padding: 10px 14px; flex: 1; min-width: 160px; }
    .search-icon { font-size: 16px; flex-shrink: 0; }
    .search-input { border: none; outline: none; font-size: 14px; color: #0f172a; width: 100%; background: transparent; }
    .search-select { border: none; outline: none; font-size: 14px; color: #0f172a; width: 100%; background: transparent; cursor: pointer; }
    .btn-search { padding: 10px 24px; background: white; color: #1a56db; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background .15s; }
    .btn-search:hover { background: #eff6ff; }

    .quick-filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .quick-btn { padding: 6px 14px; background: rgba(255,255,255,.2); color: white; border: 1.5px solid rgba(255,255,255,.4); border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
    .quick-btn:hover, .quick-btn.active { background: white; color: #1a56db; border-color: white; }

    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #64748b; gap: 12px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #1a56db; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .results-count { font-size: 14px; color: #64748b; font-weight: 600; }
    .sort-select { padding: 6px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; cursor: pointer; }

    .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .doctor-card { background: white; border-radius: 16px; border: 1.5px solid #e2e8f0; overflow: hidden; cursor: pointer; transition: all .2s; display: flex; flex-direction: column; }
    .doctor-card:hover { border-color: #1a56db; box-shadow: 0 8px 24px rgba(26,86,219,.12); transform: translateY(-2px); }

    .card-top { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 16px 0; }
    .doc-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #1a56db, #2563eb); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-initials { color: white; font-size: 20px; font-weight: 700; }
    .doc-badges { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
    .badge-teleconsult { background: #eff6ff; color: #1a56db; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .badge-disponible { background: #f0fdf4; color: #16a34a; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }

    .card-body { padding: 12px 16px; flex: 1; }
    .doc-name { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .doc-spec { font-size: 13px; color: #1a56db; font-weight: 600; margin: 0 0 10px; }
    .doc-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #64748b; margin-bottom: 10px; }
    .meta-icon { margin-right: 4px; }
    .doc-bio { font-size: 12px; color: #475569; line-height: 1.5; margin: 0 0 8px; }
    .doc-tarifs, .doc-assurances { font-size: 12px; color: #64748b; margin-bottom: 4px; display: flex; gap: 6px; align-items: flex-start; }
    .tarif-label, .assur-label { font-weight: 600; flex-shrink: 0; }
    .tarif-text, .assur-text { color: #475569; }

    .card-actions { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #f1f5f9; background: #f8fafc; }
    .btn-profile { flex: 1; padding: 8px; background: white; color: #1a56db; border: 1.5px solid #1a56db; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background .15s; }
    .btn-profile:hover { background: #eff6ff; }
    .btn-rdv { flex: 1; padding: 8px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background .15s; }
    .btn-rdv:hover { background: #1447c0; }

    .empty-state { text-align: center; padding: 60px 20px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 16px; background: white; border-radius: 14px; }
    .btn-reset { padding: 10px 20px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }

    /* MODAL */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
    .modal-card { background: white; border-radius: 16px; width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: white; z-index: 1; }
    .modal-header h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; gap: 12px; padding: 16px 24px; border-top: 1px solid #f1f5f9; position: sticky; bottom: 0; background: white; }

    .profile-hero { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px; }
    .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #1a56db, #2563eb); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
    .avatar-img-lg { width: 100%; height: 100%; object-fit: cover; }
    .avatar-initials-lg { color: white; font-size: 26px; font-weight: 700; }
    .profile-intro h3 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .profile-spec { color: #1a56db; font-weight: 600; font-size: 14px; margin: 0 0 8px; }
    .profile-badges { display: flex; gap: 6px; flex-wrap: wrap; }
    .badge-video { background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }

    .profile-sections { display: flex; flex-direction: column; gap: 20px; }
    .profile-section h4 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9; }
    .profile-section p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0; }
    .info-grid { display: flex; flex-direction: column; gap: 8px; }
    .info-row { display: flex; gap: 12px; font-size: 13px; }
    .info-label { color: #64748b; font-weight: 600; min-width: 90px; flex-shrink: 0; }
    .maps-link { display: inline-flex; align-items: center; gap: 6px; color: #1a56db; text-decoration: none; font-size: 14px; font-weight: 600; padding: 8px 16px; background: #eff6ff; border-radius: 8px; }
    .maps-link:hover { background: #dbeafe; }

    .btn-outline { flex: 1; padding: 10px; background: white; color: #64748b; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-rdv-lg { flex: 2; padding: 10px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-rdv-lg:hover { background: #1447c0; }

    @media (max-width: 640px) {
      .search-bar-main { flex-direction: column; }
      .doctors-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PatientSearchMedecinComponent implements OnInit {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading    = signal(true);
  allDoctors   = signal<any[]>([]);
  selectedDoc  = signal<any>(null);
  bookingDoctor = signal<any>(null);

  searchQuery       = "";
  filterVille       = "";
  filterSpecialite  = "";
  filterTeleconsult = false;
  filterDisponible  = false;
  sortBy            = "nom";

  private searchSubject = new Subject<string>();

  villes = ["Tunis","Sfax","Sousse","Bizerte","Nabeul","Monastir","Gabès","Ariana","Ben Arous","La Marsa"];

  specialites = [
    "Médecin Généraliste","Cardiologue","Dermatologue","Urgentiste",
    "Gynécologue","Neurologue","Ophtalmologue","ORL","Pédiatre",
    "Psychiatre","Radiologue","Rhumatologue","Urologue","Chirurgien",
    "Anesthésiste","Endocrinologue","Gastro-entérologue","Néphrologue",
    "Oncologue","Pneumologue"
  ];

  topSpecialites = ["Cardiologue","Généraliste","Pédiatre","Gynécologue"];

  filteredDoctors = signal<any[]>([]);

  ngOnInit() {
    this.loadDoctors();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());
  }

  loadDoctors() {
    this.isLoading.set(true);
    this.http.get<any>("/api/v1/medecins")
      .pipe(catchError(() => of([])))
      .subscribe(res => {
        const list: any[] =
          Array.isArray(res)             ? res :
          Array.isArray(res?.data)       ? res.data :
          Array.isArray(res?.data?.data) ? res.data.data : [];
        this.allDoctors.set(list);
        this.filteredDoctors.set(list);
        this.isLoading.set(false);
      });
  }

  onSearchChange(q: string) { this.searchSubject.next(q); }

  applyFilters() {
    let list = [...this.allDoctors()];
    const q = this.searchQuery.toLowerCase().trim();

    if (q) {
      list = list.filter(d =>
        this.getFullName(d).toLowerCase().includes(q) ||
        (d.profile?.specialite || '').toLowerCase().includes(q) ||
        (d.profile?.ville || '').toLowerCase().includes(q) ||
        (d.email || '').toLowerCase().includes(q)
      );
    }
    if (this.filterVille) {
      list = list.filter(d => d.profile?.ville === this.filterVille);
    }
    if (this.filterSpecialite) {
      list = list.filter(d =>
        (d.profile?.specialite || '').toLowerCase().includes(this.filterSpecialite.toLowerCase()) ||
        this.getRoleLabel(d.role).toLowerCase().includes(this.filterSpecialite.toLowerCase())
      );
    }
    if (this.filterTeleconsult) {
      list = list.filter(d => d.profile?.disponTeleconsult);
    }

    this.sortList(list);
    this.filteredDoctors.set(list);
  }

  sortDoctors() {
    const list = [...this.filteredDoctors()];
    this.sortList(list);
    this.filteredDoctors.set(list);
  }

  sortList(list: any[]) {
    list.sort((a, b) => {
      if (this.sortBy === 'nom')        return this.getFullName(a).localeCompare(this.getFullName(b));
      if (this.sortBy === 'specialite') return (a.profile?.specialite || '').localeCompare(b.profile?.specialite || '');
      if (this.sortBy === 'ville')      return (a.profile?.ville || '').localeCompare(b.profile?.ville || '');
      return 0;
    });
  }

  resetFilters() {
    this.searchQuery      = "";
    this.filterVille      = "";
    this.filterSpecialite = "";
    this.filterTeleconsult = false;
    this.filterDisponible  = false;
    this.filteredDoctors.set(this.allDoctors());
  }

  openProfile(doc: any) { this.selectedDoc.set(doc); }

  takeAppointment(doc: any) {
    this.selectedDoc.set(null);
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/patient/search' }
      });
      return;
    }
    this.bookingDoctor.set(doc);
  }

  onBooked(): void {
    this.router.navigate(['/patient/appointments']);
  }

  getFullName(doc: any): string {
    return `${doc.firstName || doc.first_name || ''} ${doc.lastName || doc.last_name || ''}`.trim() || 'Médecin';
  }

  getInitials(doc: any): string {
    const f = (doc.firstName || doc.first_name || '')[0] || '';
    const l = (doc.lastName  || doc.last_name  || '')[0] || '';
    return (f + l).toUpperCase() || 'M';
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      MEDECIN_GENERALISTE:  'Médecin Généraliste',
      MEDECIN_SPECIALISTE:  'Médecin Spécialiste',
      MEDECIN_CHEF_SERVICE: 'Chef de Service',
      MEDECIN_URGENTISTE:   'Médecin Urgentiste',
    };
    return labels[role] || 'Médecin';
  }

  getTarif(tarifs: string): string {
    try {
      const t = typeof tarifs === 'string' ? JSON.parse(tarifs) : tarifs;
      if (t?.consultation) return `Consultation : ${t.consultation} DT`;
    } catch {}
    return tarifs?.substring(0, 60) || '';
  }
}
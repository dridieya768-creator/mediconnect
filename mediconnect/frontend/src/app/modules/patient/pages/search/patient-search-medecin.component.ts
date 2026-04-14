import { Component, OnInit, OnDestroy, inject, signal, HostListener, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { of } from "rxjs";
import { AuthService } from "../../../../core/services/auth.service";
import { BookAppointmentPanelComponent } from "./book-appointment-panel/book-appointment-panel.component";
import * as L from "leaflet";

@Component({
  selector: "app-patient-search-medecin",
  standalone: true,
  imports: [CommonModule, FormsModule, BookAppointmentPanelComponent],
  template: `
    <div class="search-page">

      <!-- HERO BANNER -->
      <div class="hero-banner">
        <img src="assets/images/hemato-oncology-adults.jpg.webp" class="hero-img" alt="Trouver un medecin" />
        <div class="hero-overlay">
          <h1 class="hero-title">Trouver un Medecin</h1>
          <p class="hero-sub">Recherchez parmi nos medecins disponibles</p>
        </div>
      </div>

      <!-- BARRE DE RECHERCHE -->
      <div class="search-hero">
        <div class="search-bar-main">
          <div class="search-input-wrap">
            <input class="search-input" type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)" placeholder="Nom du medecin, specialite..."/>
          </div>
          <div class="search-select-wrap">
            <select class="search-select" [(ngModel)]="filterVille" (change)="applyFilters()">
              <option value="">Toutes les villes</option>
              <option *ngFor="let v of villes" [value]="v">{{ v }}</option>
            </select>
          </div>
          <div class="search-select-wrap">
            <select class="search-select" [(ngModel)]="filterSpecialite" (change)="applyFilters()">
              <option value="">Toutes specialites</option>
              <option *ngFor="let s of specialites" [value]="s">{{ s }}</option>
            </select>
          </div>
          <button class="btn-search" (click)="applyFilters()">Rechercher</button>
        </div>
        <div class="quick-filters">
          <button class="quick-btn" [class.active]="filterTeleconsult" (click)="filterTeleconsult = !filterTeleconsult; applyFilters()">Teleconsultation</button>
          <button class="quick-btn" [class.active]="filterDisponible" (click)="filterDisponible = !filterDisponible; applyFilters()">Disponible aujourd'hui</button>
          <button *ngFor="let s of topSpecialites" class="quick-btn" [class.active]="filterSpecialite === s" (click)="filterSpecialite = filterSpecialite === s ? '' : s; applyFilters()">{{ s }}</button>
        </div>
      </div>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div><p>Recherche en cours...</p>
      </div>

      <div *ngIf="!isLoading()">
        <!-- TOGGLE VUE -->
        <div class="results-header">
          <span class="results-count">{{ filteredDoctors().length }} medecin(s) trouve(s)</span>
          <div class="view-toggle-bar">
            <button class="view-btn" [class.active]="viewMode === 'list'" (click)="setView('list')">&#9776; Liste</button>
            <button class="view-btn" [class.active]="viewMode === 'map'" (click)="setView('map')">&#9974; Carte</button>
            <select class="sort-select" *ngIf="viewMode === 'list'" [(ngModel)]="sortBy" (change)="sortDoctors()">
              <option value="nom">Trier par nom</option>
              <option value="specialite">Trier par specialite</option>
              <option value="ville">Trier par ville</option>
            </select>
          </div>
        </div>

        <!-- VUE CARTE -->
        <div class="map-section" *ngIf="viewMode === 'map'">
          <div class="map-toolbar">
            <button class="locate-btn" (click)="locateUser()">&#9654; Ma position</button>
            <span class="map-info">{{ filteredDoctors().length }} cabinet(s) sur la carte</span>
          </div>
          <div id="medecin-map" class="leaflet-map"></div>
        </div>

        <!-- VUE LISTE CAROUSEL -->
        <div class="carousel-section" *ngIf="viewMode === 'list' && filteredDoctors().length > 0">
          <div class="carousel-wrapper">
            <button class="carousel-arrow" (click)="prevSlide()" [disabled]="!canPrev">&#8249;</button>
            <div class="carousel-viewport">
              <div class="carousel-track" [style.transform]="'translateX(-' + carouselOffset + 'px)'">
                <div class="doctor-card" *ngFor="let doc of filteredDoctors()" (click)="openProfile(doc)">
                  <div class="card-top">
                    <div class="doc-avatar">
                      <img *ngIf="doc.profile?.photoPro" [src]="doc.profile.photoPro" [alt]="getFullName(doc)" class="avatar-img"/>
                      <span *ngIf="!doc.profile?.photoPro" class="avatar-initials">{{ getInitials(doc) }}</span>
                    </div>
                    <div class="doc-badges">
                      <span class="badge-teleconsult" *ngIf="doc.profile?.disponTeleconsult">Teleconsult.</span>
                      <span class="badge-disponible">Disponible</span>
                    </div>
                  </div>
                  <div class="card-body">
                    <h3 class="doc-name">{{ doc.profile?.titre || 'Dr.' }} {{ getFullName(doc) }}</h3>
                    <p class="doc-spec">{{ doc.profile?.specialite || getRoleLabel(doc.role) }}</p>
                    <div class="doc-meta">
                      <span *ngIf="doc.profile?.ville">{{ doc.profile.ville }}</span>
                      <span *ngIf="doc.profile?.telephonePro">{{ doc.profile.telephonePro }}</span>
                    </div>
                    <p class="doc-bio" *ngIf="doc.profile?.biographie">{{ doc.profile.biographie | slice:0:100 }}{{ doc.profile.biographie?.length > 100 ? '...' : '' }}</p>
                    <div class="doc-assurances" *ngIf="doc.profile?.assurancesAcceptees">Assurances : {{ doc.profile.assurancesAcceptees }}</div>
                  </div>
                  <div class="card-actions">
                    <button class="btn-profile" (click)="$event.stopPropagation(); openProfile(doc)">Voir profil</button>
                    <button class="btn-rdv" (click)="$event.stopPropagation(); takeAppointment(doc)">Prendre RDV</button>
                  </div>
                </div>
              </div>
            </div>
            <button class="carousel-arrow" (click)="nextSlide()" [disabled]="!canNext">&#8250;</button>
          </div>
          <div class="carousel-dots">
            <button *ngFor="let dot of getCarouselDots()" class="carousel-dot" [class.active]="dot === carouselIndex" (click)="goToSlide(dot)"></button>
          </div>
          <p class="carousel-counter">Page {{ carouselIndex + 1 }} / {{ getCarouselDots().length }} - {{ filteredDoctors().length }} medecin(s)</p>
        </div>

        <div class="empty-state" *ngIf="viewMode === 'list' && filteredDoctors().length === 0">
          <p>Aucun medecin trouve</p>
          <button class="btn-reset" (click)="resetFilters()">Reinitialiser</button>
        </div>
      </div>

      <!-- SECTION PROMO -->
      <div class="promo-section">
        <div class="promo-text">
          <h2 class="promo-title">Bienvenue sur notre plateforme medicale !</h2>
          <p class="promo-desc">Nous collaborons avec les meilleurs medecins en Tunisie pour vous accompagner dans votre parcours de sante.</p>
          <button class="btn-symptomes" (click)="goToGuide()">Creer vos symptomes</button>
        </div>
        <div class="promo-img-wrap">
          <img src="assets/images/recherche-medecins.webp" class="promo-img" alt="Recherche medecins" />
        </div>
      </div>

      <!-- PANNEAU RDV -->
      <app-book-appointment-panel [medecin]="bookingDoctor()" (closed)="bookingDoctor.set(null)" (booked)="onBooked()"></app-book-appointment-panel>

      <!-- MODAL PROFIL -->
      <div class="modal-overlay" *ngIf="selectedDoc()" (click)="selectedDoc.set(null)">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Profil du Medecin</h2>
            <button class="btn-close" (click)="selectedDoc.set(null)">X</button>
          </div>
          <div class="modal-body" *ngIf="selectedDoc()">
            <div class="profile-hero">
              <div class="profile-avatar">
                <img *ngIf="selectedDoc()!.profile?.photoPro" [src]="selectedDoc()!.profile.photoPro" class="avatar-img-lg"/>
                <span *ngIf="!selectedDoc()!.profile?.photoPro" class="avatar-initials-lg">{{ getInitials(selectedDoc()!) }}</span>
              </div>
              <div>
                <h3>{{ selectedDoc()!.profile?.titre || 'Dr.' }} {{ getFullName(selectedDoc()!) }}</h3>
                <p class="profile-spec">{{ selectedDoc()!.profile?.specialite || getRoleLabel(selectedDoc()!.role) }}</p>
              </div>
            </div>
            <div class="profile-sections">
              <div class="profile-section" *ngIf="selectedDoc()!.profile?.biographie">
                <h4>Biographie</h4><p>{{ selectedDoc()!.profile.biographie }}</p>
              </div>
              <div class="profile-section">
                <h4>Contact</h4>
                <div class="info-grid">
                  <div class="info-row" *ngIf="selectedDoc()!.profile?.ville"><span class="info-label">Ville</span><span>{{ selectedDoc()!.profile.ville }}</span></div>
                  <div class="info-row" *ngIf="selectedDoc()!.profile?.telephonePro"><span class="info-label">Tel</span><span>{{ selectedDoc()!.profile.telephonePro }}</span></div>
                  <div class="info-row" *ngIf="selectedDoc()!.profile?.assurancesAcceptees"><span class="info-label">Assurances</span><span>{{ selectedDoc()!.profile.assurancesAcceptees }}</span></div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-outline" (click)="selectedDoc.set(null)">Fermer</button>
            <button class="btn-rdv-lg" (click)="takeAppointment(selectedDoc()!)">Prendre RDV</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-page { padding: 0; font-family: system-ui, sans-serif; }
    .hero-banner { position: relative; width: 100%; height: 520px; overflow: hidden; }
    .hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,.65), rgba(0,0,0,.2)); display: flex; flex-direction: column; justify-content: center; padding: 40px 48px; }
    .hero-title { font-size: 32px; font-weight: 800; color: white; margin: 0 0 8px; }
    .hero-sub { font-size: 16px; color: rgba(255,255,255,.85); margin: 0; }
    .search-hero { background: #f1f5f9; border-radius: 16px; padding: 28px; margin-bottom: 28px; }
    .search-bar-main { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
    .search-input-wrap, .search-select-wrap { display: flex; align-items: center; background: white; border-radius: 10px; padding: 10px 14px; flex: 1; min-width: 160px; border: 1.5px solid #e2e8f0; }
    .search-input, .search-select { border: none; outline: none; font-size: 14px; color: #0f172a; width: 100%; background: transparent; }
    .btn-search { padding: 10px 24px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-search:hover { background: #1447c0; }
    .quick-filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .quick-btn { padding: 6px 14px; background: white; color: #374151; border: 1.5px solid #d1d5db; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .quick-btn:hover, .quick-btn.active { background: #1a56db; color: white; border-color: #1a56db; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #64748b; gap: 12px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #1a56db; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 0 4px; }
    .results-count { font-size: 14px; color: #64748b; font-weight: 600; }
    .view-toggle-bar { display: flex; gap: 8px; align-items: center; }
    .view-btn { padding: 7px 16px; background: white; color: #374151; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
    .view-btn.active { background: #1a56db; color: white; border-color: #1a56db; }
    .sort-select { padding: 6px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; cursor: pointer; }
    .map-section { margin-bottom: 32px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.1); }
    .map-toolbar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border-bottom: 1px solid #e2e8f0; }
    .locate-btn { padding: 7px 16px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .locate-btn:hover { background: #1447c0; }
    .map-info { font-size: 13px; color: #64748b; }
    .leaflet-map { height: 520px; width: 100%; }
    .carousel-section { margin-bottom: 32px; }
    .carousel-wrapper { display: flex; align-items: center; }
    .carousel-viewport { flex: 1; overflow: hidden; }
    .carousel-track { display: flex; gap: 16px; transition: transform .45s cubic-bezier(.25,.46,.45,.94); }
    .doctor-card { min-width: 300px; width: 300px; flex-shrink: 0; background: white; border-radius: 16px; border: 1.5px solid #e2e8f0; overflow: hidden; cursor: pointer; transition: all .2s; display: flex; flex-direction: column; }
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
    .doc-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #64748b; margin-bottom: 8px; }
    .doc-bio { font-size: 12px; color: #475569; line-height: 1.5; margin: 0 0 6px; }
    .doc-assurances { font-size: 12px; color: #64748b; }
    .card-actions { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #f1f5f9; background: #f8fafc; }
    .btn-profile { flex: 1; padding: 8px; background: white; color: #1a56db; border: 1.5px solid #1a56db; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .btn-profile:hover { background: #eff6ff; }
    .btn-rdv { flex: 1; padding: 8px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .btn-rdv:hover { background: #1447c0; }
    .carousel-arrow { width: 44px; height: 44px; border-radius: 50%; background: white; border: 1.5px solid #e2e8f0; font-size: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,.1); transition: all .2s; flex-shrink: 0; color: #0f172a; }
    .carousel-arrow:first-of-type { margin-right: 12px; }
    .carousel-arrow:last-of-type { margin-left: 12px; }
    .carousel-arrow:hover:not(:disabled) { background: #1a56db; color: white; border-color: #1a56db; }
    .carousel-arrow:disabled { opacity: .3; cursor: not-allowed; }
    .carousel-dots { display: flex; justify-content: center; gap: 6px; margin-top: 16px; }
    .carousel-dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; border: none; cursor: pointer; padding: 0; transition: all .2s; }
    .carousel-dot.active { background: #1a56db; width: 22px; border-radius: 4px; }
    .carousel-counter { text-align: center; font-size: 12px; color: #64748b; margin-top: 8px; }
    .empty-state { text-align: center; padding: 60px 20px; color: #94a3b8; background: white; border-radius: 14px; }
    .btn-reset { padding: 10px 20px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 12px; }
    .promo-section { display: flex; align-items: center; gap: 48px; background: white; border-radius: 20px; padding: 48px; margin: 32px 0; box-shadow: 0 4px 24px rgba(0,0,0,.06); }
    .promo-text { flex: 1; }
    .promo-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 16px; }
    .promo-desc { font-size: 16px; color: #475569; line-height: 1.7; margin: 0 0 28px; }
    .btn-symptomes { padding: 14px 28px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; }
    .btn-symptomes:hover { background: #1447c0; }
    .promo-img-wrap { flex: 1; display: flex; justify-content: flex-end; }
    .promo-img { width: 100%; max-width: 460px; height: 300px; object-fit: cover; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,.12); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
    .modal-card { background: white; border-radius: 16px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: white; }
    .modal-header h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
    .btn-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; gap: 12px; padding: 16px 24px; border-top: 1px solid #f1f5f9; position: sticky; bottom: 0; background: white; }
    .profile-hero { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px; }
    .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #1a56db, #2563eb); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
    .avatar-img-lg { width: 100%; height: 100%; object-fit: cover; }
    .avatar-initials-lg { color: white; font-size: 26px; font-weight: 700; }
    .profile-hero h3 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .profile-spec { color: #1a56db; font-weight: 600; font-size: 14px; margin: 0; }
    .profile-sections { display: flex; flex-direction: column; gap: 20px; }
    .profile-section h4 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9; }
    .profile-section p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0; }
    .info-grid { display: flex; flex-direction: column; gap: 8px; }
    .info-row { display: flex; gap: 12px; font-size: 13px; }
    .info-label { color: #64748b; font-weight: 600; min-width: 90px; flex-shrink: 0; }
    .btn-outline { flex: 1; padding: 10px; background: white; color: #64748b; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-rdv-lg { flex: 2; padding: 10px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-rdv-lg:hover { background: #1447c0; }
    @media (max-width: 768px) { .promo-section { flex-direction: column; padding: 28px; } .promo-img { max-width: 100%; height: 200px; } }
    @media (max-width: 640px) { .search-bar-main { flex-direction: column; } .hero-overlay { padding: 24px 20px; } .hero-title { font-size: 22px; } .doctor-card { min-width: calc(100vw - 80px); width: calc(100vw - 80px); } .leaflet-map { height: 360px; } }
  `]
})
export class PatientSearchMedecinComponent implements OnInit, OnDestroy {
  private http        = inject(HttpClient);
  private router      = inject(Router);
  private authService = inject(AuthService);
  private zone        = inject(NgZone);

  isLoading     = signal(true);
  allDoctors    = signal<any[]>([]);
  selectedDoc   = signal<any>(null);
  bookingDoctor = signal<any>(null);

  searchQuery       = "";
  filterVille       = "";
  filterSpecialite  = "";
  filterTeleconsult = false;
  filterDisponible  = false;
  sortBy            = "nom";
  viewMode          = "list";

  carouselIndex  = 0;
  carouselOffset = 0;
  readonly cardWidth = 316;

  private searchSubject = new Subject<string>();
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private userMarker: L.Marker | null = null;

  villes = ["Tunis","Sfax","Sousse","Bizerte","Nabeul","Monastir","Gabes","Ariana","Ben Arous","La Marsa"];
  specialites = ["Medecin Generaliste","Cardiologue","Dermatologue","Urgentiste","Gynecologue","Neurologue","Ophtalmologue","ORL","Pediatre","Psychiatre","Radiologue","Rhumatologue","Urologue","Chirurgien","Anesthesiste","Endocrinologue","Gastro-enterologue","Nephrologue","Oncologue","Pneumologue"];
  topSpecialites = ["Cardiologue","Generaliste","Pediatre","Gynecologue"];
  filteredDoctors = signal<any[]>([]);

  private villeCoords: Record<string, [number, number]> = {
    "Tunis": [36.8065, 10.1815], "Sfax": [34.7406, 10.7603], "Sousse": [35.8245, 10.6346],
    "Bizerte": [37.2744, 9.8739], "Nabeul": [36.4561, 10.7376], "Monastir": [35.7643, 10.8113],
    "Gabes": [33.8881, 10.0975], "Ariana": [36.8625, 10.1956], "Ben Arous": [36.7533, 10.2282],
    "La Marsa": [36.8781, 10.3247]
  };

  get visibleCount(): number {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth <= 640)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }
  get canPrev(): boolean { return this.carouselIndex > 0; }
  get canNext(): boolean { return this.carouselIndex < this.getCarouselDots().length - 1; }
  getCarouselDots(): number[] { return Array.from({ length: Math.ceil(this.filteredDoctors().length / this.visibleCount) }, (_, i) => i); }
  prevSlide() { if (this.canPrev) this.goToSlide(this.carouselIndex - 1); }
  nextSlide() { if (this.canNext) this.goToSlide(this.carouselIndex + 1); }
  goToSlide(i: number) { this.carouselIndex = i; this.carouselOffset = i * this.visibleCount * this.cardWidth; }

  @HostListener("window:resize")
  onResize() { this.goToSlide(0); }

  ngOnInit() {
    this.loadDoctors();
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.applyFilters());
  }

  ngOnDestroy() {
    if (this.map) { this.map.remove(); this.map = null; }
    delete (window as any).__takeAppointment;
  }

  setView(mode: string) {
    this.viewMode = mode;
    if (mode === "map") setTimeout(() => this.initMap(), 150);
  }

  initMap() {
    if (this.map) { this.map.remove(); this.map = null; }
    const el = document.getElementById("medecin-map");
    if (!el) return;

    this.map = L.map("medecin-map", { zoomControl: true }).setView([36.8065, 10.1815], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.map);

    this.addDoctorMarkers();
    this.locateUser();
  }

  addDoctorMarkers() {
    if (!this.map) return;
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const docIcon = L.divIcon({
      className: "",
      html: `<div style="background:#1a56db;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.3);border:2px solid white;font-weight:700;">+</div>`,
      iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20]
    });

    const bounds: [number, number][] = [];

    this.filteredDoctors().forEach(doc => {
      let lat: number, lng: number;

      if (doc.profile?.latitude && doc.profile?.longitude) {
        lat = parseFloat(doc.profile.latitude);
        lng = parseFloat(doc.profile.longitude);
      } else if (doc.profile?.ville && this.villeCoords[doc.profile.ville]) {
        const base = this.villeCoords[doc.profile.ville];
        lat = base[0] + (Math.random() - 0.5) * 0.02;
        lng = base[1] + (Math.random() - 0.5) * 0.02;
      } else {
        lat = 36.8065 + (Math.random() - 0.5) * 0.05;
        lng = 10.1815 + (Math.random() - 0.5) * 0.05;
      }

      const name = `${doc.profile?.titre || "Dr."} ${this.getFullName(doc)}`;
      const spec = doc.profile?.specialite || this.getRoleLabel(doc.role);
      const addr = doc.profile?.adresseCabinet || doc.profile?.ville || "";
      const tel  = doc.profile?.telephonePro || "";

      const popup = `<div style="min-width:200px;font-family:system-ui,sans-serif;padding:4px;">
        <div style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:4px;">${name}</div>
        <div style="font-size:12px;color:#1a56db;font-weight:600;margin-bottom:6px;">${spec}</div>
        ${addr ? `<div style="font-size:12px;color:#64748b;margin-bottom:3px;">&#128205; ${addr}</div>` : ""}
        ${tel  ? `<div style="font-size:12px;color:#64748b;margin-bottom:8px;">&#128222; ${tel}</div>` : ""}
        <button onclick="window.__takeAppointment('${doc.id}')"
          style="width:100%;padding:8px;background:#1a56db;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">
          Prendre RDV
        </button>
      </div>`;

      const marker = L.marker([lat, lng], { icon: docIcon }).addTo(this.map!).bindPopup(popup, { maxWidth: 240 });
      this.markers.push(marker);
      bounds.push([lat, lng]);
    });

    (window as any).__takeAppointment = (id: string) => {
      this.zone.run(() => {
        const doc = this.filteredDoctors().find(d => String(d.id) === String(id));
        if (doc) this.takeAppointment(doc);
      });
    };

    if (bounds.length > 0) {
      this.map!.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 13 });
    }
  }

  locateUser() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      this.zone.run(() => {
        if (!this.map) return;
        const { latitude: lat, longitude: lng } = pos.coords;
        if (this.userMarker) this.userMarker.remove();
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="background:#ef4444;border-radius:50%;width:16px;height:16px;border:3px solid white;box-shadow:0 0 0 3px rgba(239,68,68,.3);"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8]
        });
        this.userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(this.map!).bindPopup("<b>Votre position</b>").openPopup();
        this.map!.setView([lat, lng], 12);
      });
    }, () => {});
  }

  loadDoctors() {
    this.isLoading.set(true);
    this.http.get<any>("/api/v1/medecins").pipe(catchError(() => of([]))).subscribe(res => {
      const list: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      this.allDoctors.set(list);
      this.filteredDoctors.set(list);
      this.isLoading.set(false);
    });
  }

  onSearchChange(q: string) { this.searchSubject.next(q); }

  applyFilters() {
    let list = [...this.allDoctors()];
    const q = this.searchQuery.toLowerCase().trim();
    if (q) list = list.filter(d => this.getFullName(d).toLowerCase().includes(q) || (d.profile?.specialite||"").toLowerCase().includes(q) || (d.profile?.ville||"").toLowerCase().includes(q));
    if (this.filterVille) list = list.filter(d => d.profile?.ville === this.filterVille);
    if (this.filterSpecialite) list = list.filter(d => (d.profile?.specialite||"").toLowerCase().includes(this.filterSpecialite.toLowerCase()) || this.getRoleLabel(d.role).toLowerCase().includes(this.filterSpecialite.toLowerCase()));
    if (this.filterTeleconsult) list = list.filter(d => d.profile?.disponTeleconsult);
    this.sortList(list);
    this.filteredDoctors.set(list);
    this.goToSlide(0);
    if (this.viewMode === "map" && this.map) this.addDoctorMarkers();
  }

  sortDoctors() { const list = [...this.filteredDoctors()]; this.sortList(list); this.filteredDoctors.set(list); }

  sortList(list: any[]) {
    list.sort((a, b) => {
      if (this.sortBy === "nom") return this.getFullName(a).localeCompare(this.getFullName(b));
      if (this.sortBy === "specialite") return (a.profile?.specialite||"").localeCompare(b.profile?.specialite||"");
      if (this.sortBy === "ville") return (a.profile?.ville||"").localeCompare(b.profile?.ville||"");
      return 0;
    });
  }

  resetFilters() {
    this.searchQuery = ""; this.filterVille = ""; this.filterSpecialite = "";
    this.filterTeleconsult = false; this.filterDisponible = false;
    this.filteredDoctors.set(this.allDoctors()); this.goToSlide(0);
    if (this.viewMode === "map" && this.map) this.addDoctorMarkers();
  }

  openProfile(doc: any) { this.selectedDoc.set(doc); }

  takeAppointment(doc: any) {
    this.selectedDoc.set(null);
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(["/auth/login"], { queryParams: { returnUrl: "/patient/recherche" } });
      return;
    }
    this.bookingDoctor.set(doc);
  }

  onBooked(): void { this.router.navigate(["/patient/appointments"]); }
  goToGuide(): void { this.router.navigate(["/patient/guide-medecin"]); }

  getFullName(doc: any): string { return `${doc.firstName||doc.first_name||""} ${doc.lastName||doc.last_name||""}`.trim() || "Medecin"; }
  getInitials(doc: any): string { return ((doc.firstName||doc.first_name||"")[0]||"").toUpperCase() + ((doc.lastName||doc.last_name||"")[0]||"").toUpperCase() || "M"; }
  getRoleLabel(role: string): string {
    const labels: Record<string,string> = { MEDECIN_GENERALISTE:"Medecin Generaliste", MEDECIN_SPECIALISTE:"Medecin Specialiste", MEDECIN_CHEF_SERVICE:"Chef de Service", MEDECIN_URGENTISTE:"Medecin Urgentiste" };
    return labels[role] || "Medecin";
  }
  getTarif(tarifs: string): string {
    if (!tarifs) return "";
    try { const t = typeof tarifs === "string" ? JSON.parse(tarifs) : tarifs; if (t?.consultation) return `Consultation : ${t.consultation} DT`; } catch {}
    return tarifs?.substring(0, 60) || "";
  }
}

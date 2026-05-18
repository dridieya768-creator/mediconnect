import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-patient-pharmacies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-page">

      <!-- HERO BANNER -->
      <div class="hero-banner">
        <video class="hero-video" autoplay muted loop playsinline>
          <source src="assets/images/ph.mp4" type="video/mp4">
        </video>
        <div class="hero-overlay">
          <h1 class="hero-title"> Trouver une Pharmacie</h1>
          <p class="hero-sub">Recherchez parmi nos pharmacies partenaires en Tunisie</p>
        </div>
      </div>
      
      <!-- BARRE DE RECHERCHE -->
      <div class="search-hero">
        <div class="search-bar-main">
          <input class="search-input" type="text" [(ngModel)]="searchQuery"
                 (ngModelChange)="applyFilters()"
                 placeholder="Nom de la pharmacie, ville..." />
          <select class="search-select" [(ngModel)]="filterVille" (change)="applyFilters()">
            <option value="">Toutes les villes</option>
            <option *ngFor="let v of villes" [value]="v">{{ v }}</option>
          </select>
          <button class="btn-search" (click)="applyFilters()">Rechercher</button>
        </div>
        <div class="quick-filters">
          <button class="quick-btn" [class.active]="filterGarde" (click)="filterGarde = !filterGarde; applyFilters()">🌙 Pharmacie de garde</button>
          <button class="quick-btn" [class.active]="filter24h" (click)="filter24h = !filter24h; applyFilters()"> Ouverte 24h/24</button>
        </div>
      </div>
      <!-- LOADING -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div><p>Chargement...</p>
      </div>

      <div *ngIf="!isLoading()">
        <!-- TOGGLE VUE -->
        <div class="results-header">
          <span class="results-count">{{ filtered().length }} pharmacie(s) trouvée(s)</span>
          <div class="view-toggle-bar">
            <button class="view-btn" [class.active]="viewMode === 'list'" (click)="setView('list')">&#9776; Liste</button>
            <button class="view-btn" [class.active]="viewMode === 'map'" (click)="setView('map')">&#9974; Carte</button>
            <select class="sort-select" *ngIf="viewMode === 'list'" [(ngModel)]="sortBy" (change)="sortList()">
              <option value="nom">Trier par nom</option>
              <option value="ville">Trier par ville</option>
            </select>
          </div>
        </div>

        <!-- VUE CARTE -->
        <div class="map-section" *ngIf="viewMode === 'map'">
          <div id="pharmacie-map" class="leaflet-map"></div>
        </div>

        <!-- VUE LISTE CAROUSEL -->
        <div class="carousel-section" *ngIf="viewMode === 'list' && filtered().length > 0">
          <div class="carousel-wrapper">
            <button class="carousel-arrow" (click)="prevSlide()" [disabled]="carouselIndex === 0">&#8249;</button>
            <div class="carousel-viewport">
              <div class="carousel-track" [style.transform]="'translateX(-' + carouselOffset + 'px)'">
                <div class="doctor-card" *ngFor="let p of filtered()" (click)="openModal(p)">
                  <div class="card-top">
                    <div class="doc-avatar">
                      <img *ngIf="p.photoUrl" [src]="p.photoUrl" [alt]="p.nomPharmacie" class="avatar-img"/>
                      <span *ngIf="!p.photoUrl" class="avatar-initials">{{ getInitials(p) }}</span>
                    </div>
                    <div class="doc-badges">
                      <span class="badge-garde" *ngIf="p.isGarde"> Garde</span>
                      <span class="badge-disponible" *ngIf="p.isOuverte24h">24h/24</span>
                    </div>
                  </div>
                  <div class="card-body">
                    <h3 class="doc-name">{{ p.nomPharmacie || 'Pharmacie' }}</h3>
                    <p class="doc-spec">{{ p.pharmacien }}</p>
                    <div class="doc-meta">
                      <span *ngIf="p.ville">{{ p.ville }}</span>
                      <span *ngIf="p.telephone">{{ p.telephone }}</span>
                    </div>
                    <div class="doc-assurances" *ngIf="p.adresse">📍 {{ p.adresse }}</div>
                  </div>
                  <div class="card-actions">
                    <button class="btn-profile" (click)="$event.stopPropagation(); openModal(p)">Voir détails</button>
                    <button class="btn-rdv" (click)="$event.stopPropagation(); openSendQr(p)"> Mon QR-ORD</button>
                  </div>
                </div>
              </div>
            </div>
            <button class="carousel-arrow" (click)="nextSlide()" [disabled]="!canNext()">&#8250;</button>
          </div>
          <div class="carousel-dots">
            <button *ngFor="let dot of getDots()" class="carousel-dot" [class.active]="dot === carouselIndex" (click)="goToSlide(dot)"></button>
          </div>
          <p class="carousel-counter">Page {{ carouselIndex + 1 }} / {{ getDots().length }} - {{ filtered().length }} pharmacie(s)</p>
        </div>

        <div class="empty-state" *ngIf="viewMode === 'list' && filtered().length === 0">
          <p>Aucune pharmacie trouvée</p>
          <button class="btn-reset" (click)="resetFilters()">Réinitialiser</button>
        </div>
      </div>

      <!-- MODAL DÉTAILS -->
      <div class="modal-overlay" *ngIf="selectedPharmacie()" (click)="selectedPharmacie.set(null)">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close" (click)="selectedPharmacie.set(null)">✕</button>
          <div class="modal-avatar">
            <img *ngIf="selectedPharmacie()?.photoUrl" [src]="selectedPharmacie()!.photoUrl" class="avatar-img-lg"/>
            <span *ngIf="!selectedPharmacie()?.photoUrl" class="avatar-initials-lg">{{ getInitials(selectedPharmacie()) }}</span>
          </div>
          <h2>{{ selectedPharmacie()?.nomPharmacie }}</h2>
          <p class="modal-spec">{{ selectedPharmacie()?.pharmacien }}</p>
          <div class="modal-info">
            <div *ngIf="selectedPharmacie()?.adresse">📍 {{ selectedPharmacie()?.adresse }}, {{ selectedPharmacie()?.ville }}</div>
            <div *ngIf="selectedPharmacie()?.telephone"> {{ selectedPharmacie()?.telephone }}</div>
            <div *ngIf="selectedPharmacie()?.email"> {{ selectedPharmacie()?.email }}</div>
            <div *ngIf="selectedPharmacie()?.isGarde" class="badge-garde-lg">🌙 Pharmacie de garde</div>
            <div *ngIf="selectedPharmacie()?.isOuverte24h" class="badge-h24-lg"> Ouverte 24h/24</div>
          </div>
          <button class="btn-rdv-modal" (click)="openSendQr(selectedPharmacie()); selectedPharmacie.set(null)">
            ✎ᝰ. Envoyer mon QR-ORD
          </button>
        </div>
      </div>

      <!-- MODAL QR-ORD -->
      <div class="modal-overlay" *ngIf="qrPharmacie()" (click)="qrPharmacie.set(null)">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close" (click)="qrPharmacie.set(null)">✕</button>
          <h2>✎ᝰ. Vos codes QR-ORD</h2>
          <p class="modal-spec">Communiquez ce code à <strong>{{ qrPharmacie()?.nomPharmacie }}</strong></p>

          <div class="loading-state" *ngIf="loadingPrescriptions()">
            <div class="spinner"></div>
          </div>

          <div class="qr-list" *ngIf="!loadingPrescriptions()">
            <!-- Saisie manuelle du code -->
            <div class="manual-input-section">
              <p class="manual-label">Saisir un code QR-ORD manuellement :</p>
              <div class="manual-input-row">
                <input type="text" [(ngModel)]="manualQrCode" placeholder="ex: QR-ORD-XXXX-YYYY"
                       class="manual-input" (keydown.enter)="sendManualQr()" />
                <button class="btn-send" (click)="sendManualQr()" [disabled]="!manualQrCode.trim()">
                  {{ sendSuccess() ? '✔ Envoyé' : '📤 Envoyer' }}
                </button>
              </div>
              <p class="send-success" *ngIf="sendSuccess()">Code envoyé à {{ qrPharmacie()?.nomPharmacie }} !</p>
            </div>

            <div class="divider" *ngIf="prescriptions().length > 0">
              <span>ou choisir parmi vos ordonnances</span>
            </div>

            <div class="qr-item" *ngFor="let p of prescriptions()">
              <div>
                <div class="qr-code">{{ p.qrCode }}</div>
                <div class="qr-date">{{ formatDate(p.issuedAt) }} — {{ getMedNames(p) }}</div>
              </div>
              <button class="btn-copy" (click)="copyCode(p.qrCode)">
                {{ copied() === p.qrCode ? '✔' : '✎ᝰ.' }}
              </button>
            </div>
            <div class="empty-state" *ngIf="prescriptions().length === 0">
              <p style="color:#94a3b8;font-size:13px;">Aucune ordonnance active trouvée</p>
            </div>
          </div>
        </div>
      </div>

  <!-- SECTION PHARMACIE - PRODUITS DISPONIBLES -->

<section style="background:#f0f7ff; padding:60px 0; overflow:hidden;">
  <div style="display:grid; grid-template-columns:1fr 1fr; align-items:center; max-width:1200px; margin:0 auto; padding:0 40px; gap:60px;">

    <!-- TEXTE GAUCHE -->
    <div>
      <h2 style="font-size:36px; font-weight:800; color:#0f172a; line-height:1.2; margin:0 0 20px;">
        Mais nous sommes aussi là pour vous quand vous allez mieux…
      </h2>
      <p style="font-size:16px; color:#334155; line-height:1.8; margin:0 0 16px;">
        La pharmacie n'est pas seulement votre assistant santé de proximité pendant vos jours de maladie.
        Nous proposons également une large gamme de produits pharmaceutiques, notamment :
      </p>

      <ul style="font-size:15px; color:#334155; line-height:2; margin:0 0 28px; padding-left:20px;">
        <li>Médicaments sans ordonnance</li>
        <li>Vitamines et compléments alimentaires</li>
        <li>Produits de premiers secours : pansements, antiseptiques, thermomètres</li>
        <li>Dispositifs médicaux : tensiomètres, glucomètres, aides à la mobilité</li>
        <li>Produits de soins pour la peau et les cheveux</li>
        <li>Dentifrice, brosses à dents, bain de bouche</li>
        <li>Déodorants, savons, produits d'hygiène féminine, produits de rasage</li>
        <li>Lait infantile et autres produits d'allaitement</li>
        <li>Cosmétiques et produits de beauté divers</li>
      </ul>

      <a routerLink="/auth/register"
         style="display:inline-flex; align-items:center; gap:8px; padding:14px 28px;
                background:#1a56db; color:white; border-radius:50px;
                font-size:15px; font-weight:700; text-decoration:none;
                box-shadow:0 4px 20px rgba(26,86,219,0.35);">
        Commencer maintenant
      </a>
    </div>

    <!-- IMAGE DROITE -->
    <div style="display:flex; justify-content:center; align-items:center;">
      <img src="assets/images/phar1.jpg" alt="Produits pharmaceutiques disponibles"
           style="width:100%; max-width:520px; border-radius:20px; object-fit:cover;
                  box-shadow:0 20px 60px rgba(26,86,219,0.18);">
    </div>

  </div>
</section>
      <!-- SECTION PHARMACIE - POUR LES PATIENTS -->
    
<section style="background:#f0f7ff; padding:60px 0; overflow:hidden;">
  <div style="display:grid; grid-template-columns:1fr 1fr; align-items:center; max-width:1200px; margin:0 auto; padding:0 40px; gap:60px;">

    <!-- IMAGE GAUCHE -->
    <div style="display:flex; justify-content:center; align-items:center;">
      <img src="assets/images/phaa1.jpg" alt="Pharmacie pour les patients"
           style="width:100%; max-width:520px; border-radius:20px; object-fit:cover;
                  box-shadow:0 20px 60px rgba(26,86,219,0.18);">
    </div>

    <!-- TEXTE DROITE -->
    <div>
      <h2 style="font-size:36px; font-weight:800; color:#0f172a; line-height:1.2; margin:0 0 20px;">
        Pour les patients
      </h2>
      <p style="font-size:16px; color:#334155; line-height:1.8; margin:0 0 16px;">
        On connaît tous cette situation : après une visite chez le médecin, quand le moral n'est pas au beau fixe,
        la dernière chose dont on a envie, c'est de faire la queue à la pharmacie et d'attendre que notre assurance
        maladie approuve notre traitement.
      </p>
      <p style="font-size:16px; color:#334155; line-height:1.8; margin:0 0 16px; font-weight:600; color:#1a56db;">
        Rétablissez-vous plus vite.
      </p>
      <p style="font-size:16px; color:#334155; line-height:1.8; margin:0 0 16px;">
        Notre Pharmacy simplifie l'obtention de vos médicaments en vous livrant votre ordonnance directement à domicile,
        sans contact et sans délai. Parce que faire exécuter une ordonnance ne devrait jamais être une source de stress supplémentaire.
      </p>
      <p style="font-size:16px; color:#334155; line-height:1.8; margin:0 0 28px;">
        Conçue pour votre confort et votre bien-être, notre pharmacie révolutionne votre expérience de santé.
        Envoyez-nous simplement votre ordonnance, et nous nous chargeons de vous livrer votre traitement partout
        en Tunisie — rapidement, en toute sécurité et en toute simplicité.
      </p>
      <a routerLink="/auth/register"
         style="display:inline-flex; align-items:center; gap:8px; padding:14px 28px;
                background:#1a56db; color:white; border-radius:50px;
                font-size:15px; font-weight:700; text-decoration:none;
                box-shadow:0 4px 20px rgba(26,86,219,0.35);">
        Commencer maintenant
      </a>
    </div>
  </div>
</section>
    </div>
  `,
  styles: [`
    .search-page { background: #f8fafc; min-height: 100vh; }

    .hero-banner {
      position: relative;
      height: 220px;
      overflow: hidden;
      text-align: center;
    }
    .hero-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }
    .hero-overlay {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.52);
    }
    .hero-title { color: white; font-size: 32px; font-weight: 800; margin: 0 0 8px; text-shadow: 0 2px 8px rgba(0,0,0,.4); }
    .hero-sub { color: rgba(255,255,255,.9); font-size: 16px; margin: 0; }

    .search-hero { background: white; padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
    .search-bar-main { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
    .search-input { flex: 1; min-width: 200px; padding: 10px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; }
    .search-input:focus { border-color: #1a56db; }
    .search-select { padding: 10px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; background: white; }
    .btn-search { padding: 10px 24px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .quick-filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .quick-btn { padding: 6px 14px; border: 1.5px solid #e2e8f0; border-radius: 20px; font-size: 13px; background: white; cursor: pointer; transition: all .15s; }
    .quick-btn.active { background: #1a56db; color: white; border-color: #1a56db; }

    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: #64748b; }
    .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #1a56db; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .results-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; background: white; border-bottom: 1px solid #e5e7eb; }
    .results-count { font-size: 14px; color: #64748b; }
    .view-toggle-bar { display: flex; gap: 8px; align-items: center; }
    .view-btn { padding: 7px 16px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-weight: 600; background: white; cursor: pointer; }
    .view-btn.active { background: #1a56db; color: white; border-color: #1a56db; }
    .sort-select { padding: 7px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; outline: none; }

    .map-section { padding: 16px 24px; }
    .leaflet-map { height: 500px; border-radius: 12px; border: 1px solid #e5e7eb; }

    .carousel-section { padding: 24px; }
    .carousel-wrapper { display: flex; align-items: center; gap: 12px; }
    .carousel-arrow { width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid #e2e8f0; background: white; font-size: 20px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .carousel-arrow:disabled { opacity: .3; cursor: not-allowed; }
    .carousel-viewport { flex: 1; overflow: hidden; }
    .carousel-track { display: flex; gap: 16px; transition: transform .3s ease; }

    .doctor-card { min-width: 200px; max-width: 200px; background: white; border-radius: 14px; border: 1px solid #e5e7eb; overflow: hidden; cursor: pointer; transition: box-shadow .2s; flex-shrink: 0; }
    .doctor-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
    .card-top { padding: 16px 16px 8px; display: flex; justify-content: space-between; align-items: flex-start; }
    .doc-avatar { width: 56px; height: 56px; border-radius: 50%; overflow: hidden; background: #e2e8f0; display: flex; align-items: center; justify-content: center; }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-initials { font-size: 18px; font-weight: 700; color: #1a56db; }
    .doc-badges { display: flex; flex-direction: column; gap: 4px; }
    .badge-garde { font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 10px; background: #fef3c7; color: #d97706; }
    .badge-disponible { font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 10px; background: #dcfce7; color: #16a34a; }
    .card-body { padding: 0 16px 12px; }
    .doc-name { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
    .doc-spec { font-size: 12px; color: #1a56db; margin: 0 0 6px; }
    .doc-meta { font-size: 11px; color: #64748b; display: flex; flex-direction: column; gap: 2px; margin-bottom: 4px; }
    .doc-assurances { font-size: 11px; color: #64748b; }
    .card-actions { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #f1f5f9; }
    .btn-profile { flex: 1; padding: 7px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-weight: 600; background: white; cursor: pointer; }
    .btn-rdv { flex: 1; padding: 7px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }

    .carousel-dots { display: flex; justify-content: center; gap: 6px; margin-top: 16px; }
    .carousel-dot { width: 8px; height: 8px; border-radius: 50%; border: none; background: #e2e8f0; cursor: pointer; }
    .carousel-dot.active { background: #1a56db; }
    .carousel-counter { text-align: center; font-size: 13px; color: #94a3b8; margin-top: 8px; }

    .empty-state { text-align: center; padding: 48px; color: #94a3b8; }
    .btn-reset { margin-top: 12px; padding: 8px 20px; background: #1a56db; color: white; border: none; border-radius: 8px; cursor: pointer; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal-card { background: white; border-radius: 16px; padding: 28px; width: 100%; max-width: 440px; max-height: 80vh; overflow-y: auto; position: relative; text-align: center; }
    .modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
    .modal-avatar { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: #e2e8f0; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
    .avatar-img-lg { width: 100%; height: 100%; object-fit: cover; }
    .avatar-initials-lg { font-size: 28px; font-weight: 700; color: #1a56db; }
    .modal-card h2 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
    .modal-spec { color: #1a56db; font-size: 14px; margin: 0 0 16px; }
    .modal-info { text-align: left; display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #475569; margin-bottom: 20px; }
    .badge-garde-lg { color: #d97706; font-weight: 600; }
    .badge-h24-lg { color: #16a34a; font-weight: 600; }
    .btn-rdv-modal { width: 100%; padding: 12px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }

    /* QR Modal */
    .qr-list { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; text-align: left; }
    .qr-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
    .qr-code { font-family: monospace; font-size: 14px; font-weight: 700; color: #1a56db; }
    .qr-date { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .btn-copy { padding: 6px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 16px; cursor: pointer; background: white; }

    .manual-input-section { background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
    .manual-label { font-size: 13px; font-weight: 600; color: #0369a1; margin: 0 0 8px; }
    .manual-input-row { display: flex; gap: 8px; }
    .manual-input { flex: 1; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: monospace; outline: none; }
    .manual-input:focus { border-color: #1a56db; }
    .btn-send { padding: 9px 16px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .btn-send:disabled { opacity: .5; cursor: not-allowed; }
    .send-success { color: #16a34a; font-size: 13px; font-weight: 600; margin: 6px 0 0; }
    .divider { display: flex; align-items: center; gap: 10px; margin: 12px 0; color: #94a3b8; font-size: 12px; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
  `]
})
export class PatientPharmaciesComponent implements OnInit {
  private http = inject(HttpClient);

  isLoading = signal(true);
  loadingPrescriptions = signal(false);
  all = signal<any[]>([]);
  filtered = signal<any[]>([]);
  prescriptions = signal<any[]>([]);
  selectedPharmacie = signal<any>(null);
  qrPharmacie = signal<any>(null);
  copied = signal<string | null>(null);
  manualQrCode = '';
  sendSuccess = signal(false);

  searchQuery = '';
  filterVille = '';
  filterGarde = false;
  filter24h = false;
  sortBy = 'nom';
  viewMode: 'list' | 'map' = 'list';
  villes: string[] = [];

  carouselIndex = 0;
  readonly CARDS_PER_PAGE = 4;
  readonly CARD_WIDTH = 216;

  get carouselOffset(): number {
    return this.carouselIndex * this.CARDS_PER_PAGE * this.CARD_WIDTH;
  }

  ngOnInit() {
    this.http.get<any>('/api/v1/pharmacies').pipe(catchError(() => of({ data: [] }))).subscribe(res => {
      let list: any[] = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      this.all.set(list);
      this.filtered.set(list);
      this.villes = [...new Set(list.map((p: any) => p.ville).filter(Boolean))] as string[];
      this.isLoading.set(false);
    });
  }

  applyFilters() {
    let result = this.all();
    if (this.searchQuery.trim()) {
      const s = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.nomPharmacie || '').toLowerCase().includes(s) ||
        (p.pharmacien || '').toLowerCase().includes(s) ||
        (p.ville || '').toLowerCase().includes(s)
      );
    }
    if (this.filterVille) result = result.filter(p => p.ville === this.filterVille);
    if (this.filterGarde) result = result.filter(p => p.isGarde);
    if (this.filter24h) result = result.filter(p => p.isOuverte24h);
    this.filtered.set(result);
    this.carouselIndex = 0;
    if (this.viewMode === 'map') this.initMap();
  }

  sortList() {
    const list = [...this.filtered()];
    if (this.sortBy === 'nom') list.sort((a, b) => (a.nomPharmacie || '').localeCompare(b.nomPharmacie || ''));
    if (this.sortBy === 'ville') list.sort((a, b) => (a.ville || '').localeCompare(b.ville || ''));
    this.filtered.set(list);
  }

  resetFilters() {
    this.searchQuery = ''; this.filterVille = ''; this.filterGarde = false; this.filter24h = false;
    this.filtered.set(this.all()); this.carouselIndex = 0;
  }

  setView(mode: 'list' | 'map') {
    this.viewMode = mode;
    if (mode === 'map') setTimeout(() => this.initMap(), 100);
  }

  private map: any;
  initMap() {
    if (this.map) { this.map.remove(); this.map = null; }
    const el = document.getElementById('pharmacie-map');
    if (!el) return;
    this.map = L.map('pharmacie-map').setView([36.8, 10.18], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.filtered().forEach(p => {
      if (p.latitude && p.longitude) {
        L.marker([+p.latitude, +p.longitude])
          .addTo(this.map)
          .bindPopup(`<b>${p.nomPharmacie}</b><br>${p.adresse || ''}`);
      }
    });
  }

  getDots(): number[] {
    return Array.from({ length: Math.ceil(this.filtered().length / this.CARDS_PER_PAGE) }, (_, i) => i);
  }
  canNext(): boolean { return this.carouselIndex < this.getDots().length - 1; }
  prevSlide() { if (this.carouselIndex > 0) this.carouselIndex--; }
  nextSlide() { if (this.canNext()) this.carouselIndex++; }
  goToSlide(i: number) { this.carouselIndex = i; }

  openModal(p: any) { this.selectedPharmacie.set(p); }

  openSendQr(p: any) {
    this.qrPharmacie.set(p);
    this.manualQrCode = '';
    this.sendSuccess.set(false);
    this.loadingPrescriptions.set(true);
    this.http.get<any>('/api/v1/patients/me').pipe(catchError(() => of(null))).subscribe(res => {
      const patient = res?.data?.data ?? res?.data ?? res;
      if (patient?.id) {
        this.http.get<any>(`/api/v1/prescriptions/patient/${patient.id}`).pipe(catchError(() => of([]))).subscribe(r => {
          let list: any[] = [];
          if (Array.isArray(r)) list = r;
          else if (Array.isArray(r?.data?.data)) list = r.data.data;
          else if (Array.isArray(r?.data)) list = r.data;
          else if (r?.success && Array.isArray(r?.prescriptions)) list = r.prescriptions;
          this.prescriptions.set(list.filter((x: any) => x.status === 'ACTIVE' || x.status === 'PARTIALLY_USED'));
          this.loadingPrescriptions.set(false);
        });
      } else { this.loadingPrescriptions.set(false); }
    });
  }

  sendManualQr() {
    if (!this.manualQrCode.trim() || !this.qrPharmacie()) return;
    const pharmacie = this.qrPharmacie();
    this.http.post('/api/v1/pharmacies/send-qr', {
      pharmacieUserId: pharmacie.userId,
      qrCode: this.manualQrCode.trim(),
    }).pipe(catchError(() => of(null))).subscribe(() => {
      this.sendSuccess.set(true);
      this.manualQrCode = '';
      setTimeout(() => this.sendSuccess.set(false), 3000);
    });
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copied.set(code);
      setTimeout(() => this.copied.set(null), 2000);
    });
  }

  getInitials(p: any): string {
    return (p?.nomPharmacie || 'P').substring(0, 2).toUpperCase();
  }

  getMedNames(p: any): string {
    return (p.medications ?? []).slice(0, 2).map((m: any) => m.name).join(', ');
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}

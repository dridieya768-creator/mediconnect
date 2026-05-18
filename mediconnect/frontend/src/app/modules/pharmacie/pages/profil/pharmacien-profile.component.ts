import { Component, OnInit, OnDestroy, AfterViewChecked, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-pharmacien-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="profile-header">
        <h1>Mon Profil Pharmacie</h1>
        <p>Gérez les informations de votre pharmacie</p>
      </div>

      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div><p>Chargement...</p>
      </div>

      <div class="profile-content" *ngIf="!isLoading()">
        <div class="alert-success" *ngIf="successMsg()"> {{ successMsg() }}</div>
        <div class="alert-error" *ngIf="errorMsg()"> {{ errorMsg() }}</div>

        <!-- Photo de profil -->
        <div class="section">
          <h2>Photo de la pharmacie</h2>
          <div class="photo-section">
            <div class="photo-preview">
              <img *ngIf="photoPreview" [src]="photoPreview" class="photo-img" alt="Photo pharmacie"/>
              <div *ngIf="!photoPreview" class="photo-placeholder">
                <span></span>
                <p>Aucune photo</p>
              </div>
            </div>
            <div class="photo-actions">
              <label class="btn-upload" [class.loading]="isUploadingPhoto()">
                <input type="file" accept="image/jpeg,image/png,image/jpg" (change)="onPhotoSelected($event)" hidden/>
                {{ isUploadingPhoto() ? ' Téléchargement...' : '📷 Changer la photo' }}
              </label>
              <button class="btn-remove" *ngIf="photoPreview" (click)="removePhoto()">🗑 Supprimer</button>
            </div>
          </div>
        </div>

        <!-- Informations générales -->
        <div class="section">
          <h2>Informations générales</h2>
          <div class="form-grid">
            <div class="field">
              <label>Nom de la pharmacie</label>
              <input type="text" [(ngModel)]="form.nomPharmacie" placeholder="Pharmacie Centrale" />
            </div>
            <div class="field">
              <label>Numéro d'ordre</label>
              <input type="text" [(ngModel)]="form.numeroOrdre" placeholder="PH-1234" />
            </div>
            <div class="field">
              <label>Téléphone professionnel</label>
              <input type="text" [(ngModel)]="form.telephone" placeholder="+216 XX XXX XXX" />
            </div>
            <div class="field">
              <label>Ville</label>
              <input type="text" [(ngModel)]="form.ville" placeholder="Tunis" />
            </div>
            <div class="field full">
              <label>Adresse complète</label>
              <input type="text" [(ngModel)]="form.adressePharmacie" placeholder="12 Avenue Habib Bourguiba, Tunis" />
            </div>
            <div class="field">
              <label>Code postal</label>
              <input type="text" [(ngModel)]="form.codePostal" placeholder="1000" />
            </div>
          </div>
        </div>

        <!-- Horaires & Services -->
        <div class="section">
          <h2>Services</h2>
          <div class="toggles-grid">
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-icon"></span>
                <div>
                  <div class="toggle-label">Pharmacie de garde</div>
                  <div class="toggle-desc">Disponible en dehors des heures normales</div>
                </div>
              </div>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="form.isGarde" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-icon"></span>
                <div>
                  <div class="toggle-label">Ouverte 24h/24</div>
                  <div class="toggle-desc">Service continu jour et nuit</div>
                </div>
              </div>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="form.isOuverte24h" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Localisation sur carte -->
        <div class="section">
          <h2> Localisation sur la carte</h2>
          <p class="map-hint">Cliquez sur la carte pour placer votre pharmacie. Vous pouvez aussi déplacer le marqueur.</p>
          <div class="map-coords" *ngIf="form.latitude">
            <span> {{ form.latitude | number:'1.4-6' }}, {{ form.longitude | number:'1.4-6' }}</span>
            <button class="btn-clear-loc" (click)="clearLocation()">✕ Effacer</button>
          </div>
          <div id="pharmacie-profile-map" class="leaflet-map"></div>
        </div>

        <!-- Bouton sauvegarder -->
        <div class="save-section">
          <button class="btn-save" (click)="saveProfile()" [disabled]="isSaving()">
            {{ isSaving() ? ' Enregistrement...' : ' Enregistrer le profil' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding: 24px; max-width: 800px; margin: 0 auto; }
    .profile-header { margin-bottom: 24px; }
    .profile-header h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; }
    .profile-header p { color: #64748b; margin: 0; }

    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: #64748b; }
    .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #1a56db; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .alert-success { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }
    .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }

    .section { background: white; border-radius: 14px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 16px; }
    .section h2 { font-size: 16px; font-weight: 700; margin: 0 0 16px; color: #0f172a; }

    .photo-section { display: flex; gap: 20px; align-items: flex-start; }
    .photo-preview { width: 120px; height: 120px; border-radius: 12px; overflow: hidden; border: 2px solid #e5e7eb; flex-shrink: 0; }
    .photo-img { width: 100%; height: 100%; object-fit: cover; }
    .photo-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; color: #94a3b8; font-size: 32px; }
    .photo-placeholder p { font-size: 11px; margin: 4px 0 0; }
    .photo-actions { display: flex; flex-direction: column; gap: 8px; }
    .btn-upload { padding: 10px 16px; background: #1a56db; color: white; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-block; }
    .btn-upload.loading { opacity: .7; cursor: not-allowed; }
    .btn-remove { padding: 8px 16px; background: white; border: 1.5px solid #fecaca; color: #dc2626; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field.full { grid-column: 1 / -1; }
    .field label { font-size: 13px; font-weight: 600; color: #374151; }
    .field input, .field textarea { padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; }
    .field input:focus { border-color: #1a56db; }

    .toggles-grid { display: flex; flex-direction: column; gap: 12px; }
    .toggle-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f8fafc; border-radius: 10px; }
    .toggle-info { display: flex; align-items: center; gap: 12px; }
    .toggle-icon { font-size: 24px; }
    .toggle-label { font-size: 14px; font-weight: 600; }
    .toggle-desc { font-size: 12px; color: #64748b; }
    .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background: #e2e8f0; border-radius: 24px; transition: .3s; }
    .slider:before { content: ''; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: .3s; }
    input:checked + .slider { background: #1a56db; }
    input:checked + .slider:before { transform: translateX(20px); }

    .map-hint { font-size: 13px; color: #64748b; margin: 0 0 10px; }
    .map-coords { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 13px; color: #1a56db; font-weight: 600; }
    .btn-clear-loc { padding: 3px 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; cursor: pointer; background: white; }
    .leaflet-map { height: 350px; border-radius: 10px; border: 1px solid #e5e7eb; }

    .save-section { display: flex; justify-content: flex-end; padding: 8px 0; }
    .btn-save { padding: 12px 32px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; }
    .btn-save:disabled { opacity: .6; cursor: not-allowed; }
    .btn-save:hover:not(:disabled) { background: #1447c0; }
  `]
})
export class PharmacienProfileComponent implements OnInit, OnDestroy, AfterViewChecked {
  private http   = inject(HttpClient);
  private router = inject(Router);

  isLoading  = signal(true);
  isSaving   = signal(false);
  isUploadingPhoto = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg   = signal<string | null>(null);

  photoPreview: string | null = null;
  private profileMap: L.Map | null = null;
  private profileMarker: L.Marker | null = null;
  private mapInitialized = false;

  form: any = {
    nomPharmacie: '',
    numeroOrdre: '',
    telephone: '',
    ville: '',
    adressePharmacie: '',
    codePostal: '',
    photoUrl: '',
    isGarde: false,
    isOuverte24h: false,
    latitude: null,
    longitude: null,
  };

  ngOnInit() { this.loadProfile(); }

  ngAfterViewChecked() {
    if (!this.isLoading() && !this.mapInitialized) {
      const el = document.getElementById('pharmacie-profile-map');
      if (el) { this.initMap(); this.mapInitialized = true; }
    }
  }

  ngOnDestroy() {
    if (this.profileMap) { this.profileMap.remove(); this.profileMap = null; }
  }

  private initMap() {
    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    });

    let center: [number, number] = [36.8065, 10.1815];
    let zoom = 7;

    if (this.form.latitude && this.form.longitude) {
      center = [+this.form.latitude, +this.form.longitude];
      zoom = 15;
    }

    this.profileMap = L.map('pharmacie-profile-map').setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 18,
    }).addTo(this.profileMap);

    if (this.form.latitude && this.form.longitude) {
      this.profileMarker = L.marker(center, { icon, draggable: true })
        .addTo(this.profileMap)
        .bindPopup('🏪 Ma pharmacie').openPopup();
      this.profileMarker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        this.form.latitude = pos.lat.toFixed(6);
        this.form.longitude = pos.lng.toFixed(6);
      });
    }

    this.profileMap.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.form.latitude = lat.toFixed(6);
      this.form.longitude = lng.toFixed(6);

      if (this.profileMarker) {
        this.profileMarker.setLatLng([lat, lng]);
      } else {
        this.profileMarker = L.marker([lat, lng], { icon, draggable: true })
          .addTo(this.profileMap!)
          .bindPopup('🏪 Ma pharmacie').openPopup();
        this.profileMarker.on('dragend', (ev: any) => {
          const pos = ev.target.getLatLng();
          this.form.latitude = pos.lat.toFixed(6);
          this.form.longitude = pos.lng.toFixed(6);
        });
      }
    });

    if (navigator.geolocation && !this.form.latitude) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.profileMap?.setView([pos.coords.latitude, pos.coords.longitude], 13);
      });
    }
  }

  clearLocation() {
    this.form.latitude = null;
    this.form.longitude = null;
    if (this.profileMarker) { this.profileMarker.remove(); this.profileMarker = null; }
  }

  loadProfile() {
    this.isLoading.set(true);
    this.http.get<any>('/api/v1/pharmacies/my-profile')
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        const data = res?.data ?? res;
        if (data) {
          Object.keys(this.form).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
              this.form[key] = data[key];
            }
          });
          if (data.photoUrl) this.photoPreview = data.photoUrl;
          if (data.telephone) this.form.telephone = data.telephone;
        }
        this.isLoading.set(false);
      });
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { this.errorMsg.set('Photo max 5MB'); return; }
    this.isUploadingPhoto.set(true);
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<any>('/api/v1/upload/photo', fd)
      .pipe(finalize(() => this.isUploadingPhoto.set(false)), catchError(() => of(null)))
      .subscribe(res => {
        const url = res?.data?.url || res?.url;
        if (url) { this.photoPreview = url; this.form.photoUrl = url; }
      });
  }

  removePhoto() { this.photoPreview = null; this.form.photoUrl = ''; }

  saveProfile() {
    this.isSaving.set(true);
    this.errorMsg.set(null);
    this.http.put<any>('/api/v1/pharmacies/my-profile', this.form)
      .pipe(catchError(() => { this.errorMsg.set("Erreur lors de l'enregistrement"); this.isSaving.set(false); return of(null); }))
      .subscribe(res => {
        if (res) { this.successMsg.set('Profil mis à jour !'); setTimeout(() => this.successMsg.set(null), 3000); }
        this.isSaving.set(false);
      });
  }
}

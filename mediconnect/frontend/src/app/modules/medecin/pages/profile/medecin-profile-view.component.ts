import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-medecin-profile-view",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-view-container">
      <div class="profile-header">
        <div class="header-content">
          <h1 class="page-title"> Mon Profil Professionnel</h1>
          <button class="btn-edit" routerLink="/medecin/profil/edit">
             Modifier mon profil
          </button>
        </div>
        <p class="page-subtitle">Consultez et gérez vos informations professionnelles</p>
      </div>

      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p>Chargement de votre profil...</p>
      </div>

      <div class="profile-content" *ngIf="!isLoading() && profile()">
        <div class="profile-section">
          <div class="section-header">
            <span class="section-icon"></span>
            <h2>Identité Professionnelle</h2>
          </div>
          <div class="section-body">
            <div class="info-grid">
              <div class="info-item" *ngIf="profile()?.titre">
                <span class="info-label">Titre</span>
                <span class="info-value">{{ profile()?.titre }}</span>
              </div>
              <div class="info-item" *ngIf="profile()?.specialite">
                <span class="info-label">Spécialité</span>
                <span class="info-value">{{ profile()?.specialite }}</span>
              </div>
              <div class="info-item" *ngIf="profile()?.numeroOrdrePro">
                <span class="info-label">N° Ordre</span>
                <span class="info-value">{{ profile()?.numeroOrdrePro }}</span>
              </div>
              <div class="info-item" *ngIf="profile()?.languesParlees">
                <span class="info-label">Langues</span>
                <span class="info-value">{{ profile()?.languesParlees }}</span>
              </div>
              <div class="info-item full-width" *ngIf="profile()?.diplomes">
                <span class="info-label">Diplômes</span>
                <span class="info-value">{{ profile()?.diplomes }}</span>
              </div>
              <div class="info-item full-width" *ngIf="profile()?.biographie">
                <span class="info-label">Biographie</span>
                <span class="info-value">{{ profile()?.biographie }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-section" *ngIf="profile()?.ville || profile()?.adresseCabinet">
          <div class="section-header">
            <span class="section-icon">📍</span>
            <h2>Cabinet & Localisation</h2>
          </div>
          <div class="section-body">
            <div class="info-grid">
              <div class="info-item" *ngIf="profile()?.ville">
                <span class="info-label">Ville</span>
                <span class="info-value">{{ profile()?.ville }}</span>
              </div>
              <div class="info-item full-width" *ngIf="profile()?.adresseCabinet">
                <span class="info-label">Adresse</span>
                <span class="info-value">{{ profile()?.adresseCabinet }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-section" *ngIf="profile()?.telephonePro || profile()?.emailPro">
          <div class="section-header">
            <span class="section-icon"></span>
            <h2>Contact Professionnel</h2>
          </div>
          <div class="section-body">
            <div class="info-grid">
              <div class="info-item" *ngIf="profile()?.telephonePro">
                <span class="info-label">Téléphone</span>
                <span class="info-value">{{ profile()?.telephonePro }}</span>
              </div>
              <div class="info-item" *ngIf="profile()?.emailPro">
                <span class="info-label">Email</span>
                <span class="info-value">{{ profile()?.emailPro }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-view-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .profile-header {
      margin-bottom: 2rem;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .page-subtitle {
      color: #64748b;
      margin: 0.5rem 0 0 0;
    }
    .btn-edit {
      padding: 0.75rem 1.5rem;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    .btn-edit:hover {
      background: #4338ca;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem;
      gap: 1rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .profile-section {
      background: white;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
      overflow: hidden;
    }
    .section-header {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .section-header h2 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }
    .section-icon {
      font-size: 1.25rem;
      margin-right: 0.75rem;
    }
    .section-body {
      padding: 1.5rem;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .info-item.full-width {
      grid-column: 1 / -1;
    }
    .info-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
    .info-value {
      font-size: 0.875rem;
      color: #0f172a;
    }
    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MedecinProfileViewComponent implements OnInit {
  private http = inject(HttpClient);
  profile = signal<any>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.http.get<any>("/api/v1/medecins/me")
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        const data = res?.data?.data ?? res?.data ?? res;
        if (data) {
          this.profile.set(data.profile);
        }
        this.isLoading.set(false);
      });
  }
}
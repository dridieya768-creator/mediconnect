import { Component, inject } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "@core/services/auth.service";

@Component({
  selector: "app-patient-layout",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="top-nav">
      <div class="nav-container">
        <a routerLink="/patient/dashboard" class="nav-brand">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#1a56db"/>
              <path d="M16 7v18M7 16h18" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="brand-name">MediConnect</span>
        </a>
        <div class="nav-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Rechercher..." class="search-input" [routerLink]="['/patient/recherche']" readonly/>
        </div>
        <div class="nav-links">
          <a routerLink="/patient/dashboard" routerLinkActive="active" class="nav-link">Accueil</a>
          <a routerLink="/patient/recherche" routerLinkActive="active" class="nav-link">Médecins</a>
          <a routerLink="/patient/appointments" routerLinkActive="active" class="nav-link">
            Rendez-vous <span class="nav-badge">2</span>
          </a>
          <a routerLink="/patient/dossier" routerLinkActive="active" class="nav-link">Dossier</a>
          <a routerLink="/patient/prescriptions" routerLinkActive="active" class="nav-link">Ordonnances</a>
          <a routerLink="/patient/paiement" routerLinkActive="active" class="nav-link">💳 Paiement</a>
        </div>
        <div class="nav-user">
          <a routerLink="/patient/notifications" class="notif-btn">
            🔔 <span class="notif-badge">3</span>
          </a>
          <a routerLink="/patient/profil" class="user-avatar-btn">
            <div class="user-avatar">{{ userInitials }}</div>
            <span class="user-name-nav">{{ currentUser()?.firstName }}</span>
          </a>
        </div>
      </div>
    </nav>
    <div class="page-container">
      <router-outlet />
    </div>
  `,
  styles: [`
    .top-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      background: white; border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 8px rgba(0,0,0,0.06); height: 64px;
    }
    .nav-container {
      max-width: 1400px; margin: 0 auto; padding: 0 24px;
      height: 64px; display: flex; align-items: center; gap: 24px;
    }
    .nav-brand { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
    .brand-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
    .brand-name { font-size: 16px; font-weight: 800; color: #0f172a; }
    .nav-search {
      display: flex; align-items: center; gap: 8px;
      background: #f1f5f9; border-radius: 8px; padding: 8px 14px; width: 220px; cursor: pointer;
    }
    .search-input { border: none; background: transparent; outline: none; font-size: 13px; color: #94a3b8; cursor: pointer; width: 100%; }
    .nav-links { display: flex; gap: 4px; flex: 1; }
    .nav-link {
      padding: 8px 12px; font-size: 14px; font-weight: 500; color: #374151;
      text-decoration: none; border-radius: 8px; transition: all 0.15s;
      display: flex; align-items: center; gap: 6px; white-space: nowrap;
      &:hover { color: #1a56db; background: #eff6ff; }
      &.active { color: #1a56db; background: #eff6ff; font-weight: 600; }
    }
    .nav-badge { background: #1a56db; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; }
    .nav-user { display: flex; align-items: center; gap: 12px; margin-left: auto; flex-shrink: 0; }
    .notif-btn { position: relative; font-size: 18px; text-decoration: none; cursor: pointer; }
    .notif-badge { position: absolute; top: -4px; right: -6px; background: #ef4444; color: white; font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 10px; }
    .user-avatar-btn { display: flex; align-items: center; gap: 8px; text-decoration: none; cursor: pointer; }
    .user-avatar { width: 34px; height: 34px; background: #1a56db; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
    .user-name-nav { font-size: 13px; font-weight: 600; color: #0f172a; }
    .page-container {
      padding-top: 64px;
      overflow-x: hidden;
      padding: 0;
      padding-top: 64px;
      margin-left: 0 !important;
    }
  `]
})
export class PatientLayoutComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  get userInitials(): string {
    const u = this.currentUser();
    if (!u) return '?';
    return `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
  }
}

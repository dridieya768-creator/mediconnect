import { Component, inject } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "@core/services/auth.service";

@Component({
  selector: "app-medecin-layout",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="top-nav">
      <div class="nav-container">
        <a routerLink="/medecin/dashboard" class="nav-brand">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#1a56db"/>
              <path d="M16 7v18M7 16h18" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="brand-name">MediConnect</span>
        </a>

        <div class="nav-links">
          <a routerLink="/medecin/dashboard" routerLinkActive="active" class="nav-link">Tableau de bord</a>
          <a routerLink="/medecin/planning"   routerLinkActive="active" class="nav-link">Planning</a>
          <a routerLink="/medecin/patients"   routerLinkActive="active" class="nav-link">Patients</a>
          <a routerLink="/medecin/prescriptions" routerLinkActive="active" class="nav-link">Prescriptions</a>
          <a routerLink="/medecin/profil"     routerLinkActive="active" class="nav-link">Mon Profil</a>
        </div>

        <div class="nav-user">
          <div class="user-avatar-btn">
            <div class="user-avatar">{{ userInitials }}</div>
            <span class="user-name-nav">{{ currentUser()?.firstName }}</span>
          </div>
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
    .nav-links { display: flex; gap: 4px; flex: 1; }
    .nav-link {
      padding: 8px 12px; font-size: 14px; font-weight: 500; color: #374151;
      text-decoration: none; border-radius: 8px; transition: all 0.15s; white-space: nowrap;
    }
    .nav-link:hover { color: #1a56db; background: #eff6ff; }
    .nav-link.active { color: #1a56db; background: #eff6ff; font-weight: 600; }
    .nav-user { display: flex; align-items: center; gap: 12px; margin-left: auto; flex-shrink: 0; }
    .user-avatar-btn { display: flex; align-items: center; gap: 8px; }
    .user-avatar { width: 34px; height: 34px; background: #1a56db; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
    .user-name-nav { font-size: 13px; font-weight: 600; color: #0f172a; }
    .btn-logout { padding: 7px 14px; background: #ef4444; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-logout:hover { background: #dc2626; }
    .page-container { padding-top: 64px; margin-left: 0 !important; padding-left: 0; padding-right: 0; padding-bottom: 0; }
  `]
})
export class MedecinLayoutComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  get userInitials(): string {
    const u = this.currentUser();
    if (!u) return '?';
    return `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}

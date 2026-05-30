import { Component, inject } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { AuthService } from "@core/services/auth.service";
import { LangSwitcherComponent } from "../../../shared/components/lang-switcher/lang-switcher.component";
import { environment } from 'src/environments/environment';
@Component({
  selector: "app-pharmacie-layout",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, TranslateModule, LangSwitcherComponent],
  template: `
    <!-- Navbar horizontale -->
    <nav class="ph-navbar">
      <div class="ph-nav-brand">
        <span class="ph-brand-icon"></span>
        <span class="ph-brand-name">MediConnect</span>
        <span class="ph-brand-tag">Pharmacie</span>
      </div>

      <div class="ph-nav-links">
        <a class="ph-nav-link" routerLink="/pharmacie/dashboard" routerLinkActive="active">
          {{ 'nav.dashboard' | translate }}
        </a>
        <a class="ph-nav-link" routerLink="/pharmacie/scan" routerLinkActive="active">
          Scanner
        </a>
        <a class="ph-nav-link" routerLink="/pharmacie/delivrance" routerLinkActive="active">
          {{ 'nav.delivrance' | translate }}
        </a>
        <a class="ph-nav-link" routerLink="/pharmacie/stock" routerLinkActive="active">
          {{ 'nav.stock' | translate }}
        </a>
        <a class="ph-nav-link" routerLink="/pharmacie/profil" routerLinkActive="active">
           Profil
        </a>
      </div>

      <div class="ph-nav-user">
        <app-lang-switcher />
        <div class="ph-user-avatar">{{ initials }}</div>
        <div class="ph-user-info">
          <div class="ph-user-name">{{ fullName }}</div>
          <div class="ph-user-role">PHARMACIEN</div>
        </div>
        <button class="ph-logout-btn" (click)="logout()">{{ 'auth.logout' | translate }}</button>
      </div>
    </nav>

    <!-- Contenu principal -->
    <div class="ph-page-content">
      <router-outlet />
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }

    .ph-navbar {
      display: flex;
      align-items: center;
      gap: 0;
      background: white;
      border-bottom: 2px solid #2053fdff;
      padding: 0 24px;
      height: 64px;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .ph-nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 32px;
      flex-shrink: 0;
    }
    .ph-brand-icon { font-size: 22px; }
    .ph-brand-name { font-size: 17px; font-weight: 700; color: #0f172a; }
    .ph-brand-tag {
      font-size: 11px;
      font-weight: 600;
      color: #1953f2ff;
      background: #92abefff;
      border: 1px solid #9bb3f0ff;
      border-radius: 6px;
      padding: 2px 8px;
    }

    .ph-nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }
    .ph-nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      text-decoration: none;
      transition: all .15s;
      white-space: nowrap;
    }
    .ph-nav-link:hover { background: #eff6ff; color: #0d58e4ff; }
    .ph-nav-link.active { background: #eff6ff; color: #1935eaff; font-weight: 700; }

    .ph-nav-user {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: auto;
      flex-shrink: 0;
    }
    .ph-user-avatar {
      width: 36px;
      height: 36px;
      background: #1235e4ff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .ph-user-info { line-height: 1.2; }
    .ph-user-name { font-size: 13px; font-weight: 600; color: #0f172a; }
    .ph-user-role { font-size: 11px; color: #64748b; }
    .ph-logout-btn {
      padding: 6px 14px;
      background: white;
      color: #dc2626;
      border: 1.5px solid #fecaca;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      margin-left: 8px;
    }
    .ph-logout-btn:hover { background: #fef2f2; }

    .ph-page-content {
      flex: 1;
      padding: 0;
      background: #f8fafc;
      min-height: calc(100vh - 64px);
    }
  `]
})
export class PharmacieLayoutComponent {
  private auth = inject(AuthService);

  get fullName(): string {
    const u = this.auth.currentUser();
    if (!u) return '';
    return `${u.firstName} ${u.lastName}`.trim();
  }

  get initials(): string {
    const u = this.auth.currentUser();
    if (!u) return 'PH';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || 'PH';
  }

  logout(): void {
    this.auth.logout();
  }
}


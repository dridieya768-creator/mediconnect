import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="header">
        <div class="logo">MediConnect</div>
        <div class="subtitle">Espace sécurisé</div>
      </div>

      <div class="error-card">
        <div class="error-icon">🔒</div>
        <h2>Accès refusé</h2>
        <p class="main-msg">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </p>

        <div class="info-box" *ngIf="auth.currentUser() as user">
          <span class="info-label">Connecté en tant que</span>
          <span class="info-value">{{ user.firstName }} {{ user.lastName }}</span>
          <span class="role-badge">{{ user.role }}</span>
        </div>

        <p class="hint">
          Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur
          ou retournez à votre espace personnel.
        </p>

        <div class="actions">
          <button class="btn-primary" (click)="goHome()">
            Retour à l'accueil
          </button>
          <button class="btn-secondary" (click)="logout()">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f275a 0%, #1a56db 100%);
      padding: 32px 16px;
      font-family: system-ui, sans-serif;
      display: flex;
      flex-direction: column;
    }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 28px; font-weight: 800; color: white; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: rgba(255,255,255,0.7); }

    .error-card {
      max-width: 480px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,.3);
    }
    .error-icon { font-size: 56px; margin-bottom: 16px; }
    .error-card h2 { color: #dc2626; margin: 0 0 12px; font-size: 24px; }
    .main-msg { color: #374151; margin: 0 0 20px; line-height: 1.5; }

    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin: 20px 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
    }
    .info-label {
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .info-value { font-weight: 700; color: #0f172a; }
    .role-badge {
      background: #eff6ff;
      color: #1a56db;
      border: 1px solid #bfdbfe;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 4px;
    }

    .hint {
      font-size: 13px;
      color: #94a3b8;
      font-style: italic;
      margin: 16px 0 24px;
      line-height: 1.5;
    }

    .actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity .2s;
    }
    .btn-primary { background: #1a56db; color: white; }
    .btn-secondary {
      background: white;
      color: #374151;
      border: 1px solid #e2e8f0;
    }
    .btn-primary:hover, .btn-secondary:hover { opacity: .85; }
  `]
})
export class Unauthorized {
  constructor(public auth: AuthService, private router: Router) {}

  goHome(): void {
    const role = this.auth.userRole();
    const path = this.auth.getRedirectPath(role);
    this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
  }
}
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-patient-securite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:700px; margin:40px auto; padding:0 20px;">
      <h1 style="font-size:24px; font-weight:800; color:#0f172a; margin:0 0 6px;">Paramètres de sécurité</h1>
      <p style="color:#64748b; font-size:14px; margin:0 0 32px;">Gérez votre mot de passe et l'authentification à deux facteurs</p>

      <!-- CHANGER MOT DE PASSE -->
      <div style="background:white; border-radius:16px; border:1px solid #e5e7eb; padding:28px; margin-bottom:24px;">
        <h2 style="font-size:16px; font-weight:700; color:#0f172a; margin:0 0 20px; display:flex; align-items:center; gap:8px;">
          🔑 Changer le mot de passe
        </h2>

        @if (pwSuccess()) {
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px 16px; color:#166534; font-size:14px; margin-bottom:16px;">
            ✅ {{ pwSuccess() }}
          </div>
        }
        @if (pwError()) {
          <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:12px 16px; color:#dc2626; font-size:14px; margin-bottom:16px;">
            ❌ {{ pwError() }}
          </div>
        }

        <div style="display:flex; flex-direction:column; gap:16px;">
          <div>
            <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px;">Mot de passe actuel</label>
            <input type="password" [(ngModel)]="pwForm.current" placeholder="••••••••"
              style="width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px;">Nouveau mot de passe</label>
            <input type="password" [(ngModel)]="pwForm.newPw" placeholder="Min. 8 caractères"
              style="width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px;">Confirmer le nouveau mot de passe</label>
            <input type="password" [(ngModel)]="pwForm.confirm" placeholder="••••••••"
              style="width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box;">
          </div>
          <button (click)="changePassword()" [disabled]="pwLoading()"
            style="align-self:flex-start; padding:10px 24px; background:#1a56db; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer;">
            {{ pwLoading() ? 'Enregistrement...' : 'Mettre à jour le mot de passe' }}
          </button>
        </div>
      </div>

      <!-- 2FA -->
      <div style="background:white; border-radius:16px; border:1px solid #e5e7eb; padding:28px; margin-bottom:24px;">
        <h2 style="font-size:16px; font-weight:700; color:#0f172a; margin:0 0 6px; display:flex; align-items:center; gap:8px;">
          🛡️ Authentification à deux facteurs (2FA)
        </h2>
        <p style="font-size:13px; color:#64748b; margin:0 0 20px;">
          Ajoutez une couche de sécurité supplémentaire avec une application comme Google Authenticator.
        </p>

        @if (twoFaMsg()) {
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px 16px; color:#166534; font-size:14px; margin-bottom:16px;">
            ✅ {{ twoFaMsg() }}
          </div>
        }
        @if (twoFaError()) {
          <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:12px 16px; color:#dc2626; font-size:14px; margin-bottom:16px;">
            ❌ {{ twoFaError() }}
          </div>
        }

        <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; background:#f8fafc; border-radius:10px; margin-bottom:16px;">
          <div>
            <div style="font-size:14px; font-weight:600; color:#0f172a;">Statut 2FA</div>
            <div style="font-size:13px; margin-top:2px;">
              @if (mfaEnabled()) {
                <span style="color:#16a34a; font-weight:600;">✅ Activée</span>
              } @else {
                <span style="color:#dc2626; font-weight:600;">❌ Désactivée</span>
              }
            </div>
          </div>
          @if (!mfaEnabled()) {
            <button (click)="setup2fa()" [disabled]="twoFaLoading()"
              style="padding:9px 20px; background:#1a56db; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;">
              {{ twoFaLoading() ? 'Chargement...' : 'Activer le 2FA' }}
            </button>
          } @else {
            <button (click)="disable2fa()" [disabled]="twoFaLoading()"
              style="padding:9px 20px; background:#ef4444; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;">
              {{ twoFaLoading() ? 'Chargement...' : 'Désactiver' }}
            </button>
          }
        </div>

        <!-- QR Code setup -->
        @if (qrCodeUrl()) {
          <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:10px; padding:20px; text-align:center;">
            <p style="font-size:13px; color:#0369a1; margin:0 0 12px;">
              Scannez ce QR code avec Google Authenticator, puis entrez le code à 6 chiffres :
            </p>
            <img [src]="qrCodeUrl()!" alt="QR Code 2FA" style="width:180px; height:180px; margin-bottom:16px;">
            <div style="display:flex; gap:8px; justify-content:center; align-items:center;">
              <input type="text" [(ngModel)]="twoFaCode" placeholder="Code à 6 chiffres" maxlength="6"
                style="width:160px; padding:10px 14px; border:1px solid #d1d5db; border-radius:8px; font-size:16px; text-align:center; letter-spacing:4px; outline:none;">
              <button (click)="enable2fa()" [disabled]="twoFaLoading()"
                style="padding:10px 20px; background:#16a34a; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;">
                Confirmer
              </button>
            </div>
          </div>
        }
      </div>

      <!-- INFO COMPTE -->
      <div style="background:white; border-radius:16px; border:1px solid #e5e7eb; padding:28px;">
        <h2 style="font-size:16px; font-weight:700; color:#0f172a; margin:0 0 16px; display:flex; align-items:center; gap:8px;">
          👤 Informations du compte
        </h2>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div style="padding:12px 16px; background:#f8fafc; border-radius:8px;">
            <div style="font-size:11px; color:#94a3b8; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Email</div>
            <div style="font-size:14px; color:#0f172a; font-weight:500;">{{ currentUser()?.email }}</div>
          </div>
          <div style="padding:12px 16px; background:#f8fafc; border-radius:8px;">
            <div style="font-size:11px; color:#94a3b8; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Rôle</div>
            <div style="font-size:14px; color:#0f172a; font-weight:500;">{{ currentUser()?.role }}</div>
          </div>
          <div style="padding:12px 16px; background:#f8fafc; border-radius:8px;">
            <div style="font-size:11px; color:#94a3b8; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Statut</div>
            <div style="font-size:14px; color:#16a34a; font-weight:600;">{{ currentUser()?.status }}</div>
          </div>
          <div style="padding:12px 16px; background:#f8fafc; border-radius:8px;">
            <div style="font-size:11px; color:#94a3b8; font-weight:600; text-transform:uppercase; margin-bottom:4px;">2FA</div>
            <div style="font-size:14px; font-weight:600;" [style.color]="mfaEnabled() ? '#16a34a' : '#dc2626'">
              {{ mfaEnabled() ? 'Activée' : 'Désactivée' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PatientSecuriteComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  mfaEnabled = signal(false);

  // Changer mot de passe
  pwForm = { current: '', newPw: '', confirm: '' };
  pwLoading = signal(false);
  pwSuccess = signal('');
  pwError = signal('');

  // 2FA
  qrCodeUrl = signal<string | null>(null);
  twoFaCode = '';
  twoFaLoading = signal(false);
  twoFaMsg = signal('');
  twoFaError = signal('');

  ngOnInit() {
    this.mfaEnabled.set(!!(this.currentUser() as any)?.mfaEnabled);
  }

  changePassword() {
    this.pwError.set('');
    this.pwSuccess.set('');
    if (!this.pwForm.current || !this.pwForm.newPw || !this.pwForm.confirm) {
      this.pwError.set('Tous les champs sont obligatoires'); return;
    }
    if (this.pwForm.newPw !== this.pwForm.confirm) {
      this.pwError.set('Les mots de passe ne correspondent pas'); return;
    }
    if (this.pwForm.newPw.length < 8) {
      this.pwError.set('Le mot de passe doit contenir au moins 8 caractères'); return;
    }
    this.pwLoading.set(true);
    this.http.post<any>('/api/v1/auth/change-password', {
      currentPassword: this.pwForm.current,
      newPassword: this.pwForm.newPw
    }).subscribe({
      next: () => {
        this.pwSuccess.set('Mot de passe modifié avec succès');
        this.pwForm = { current: '', newPw: '', confirm: '' };
        this.pwLoading.set(false);
      },
      error: (err) => {
        this.pwError.set(err.error?.message || 'Erreur lors du changement');
        this.pwLoading.set(false);
      }
    });
  }

  setup2fa() {
    this.twoFaError.set('');
    this.twoFaLoading.set(true);
    this.http.post<any>('/api/v1/auth/2fa/setup', {}).subscribe({
      next: (res) => {
        this.qrCodeUrl.set(res?.qrCode || res?.data?.qrCode);
        this.twoFaLoading.set(false);
      },
      error: () => {
        this.twoFaError.set('Erreur lors de la configuration 2FA');
        this.twoFaLoading.set(false);
      }
    });
  }

  enable2fa() {
    if (!this.twoFaCode || this.twoFaCode.length !== 6) {
      this.twoFaError.set('Entrez un code à 6 chiffres'); return;
    }
    this.twoFaLoading.set(true);
    this.http.post<any>('/api/v1/auth/2fa/enable', { code: this.twoFaCode }).subscribe({
      next: () => {
        this.mfaEnabled.set(true);
        this.qrCodeUrl.set(null);
        this.twoFaCode = '';
        this.twoFaMsg.set('2FA activée avec succès');
        this.twoFaLoading.set(false);
        this.authService.updateMfa(true);
      },
      error: (err) => {
        this.twoFaError.set(err.error?.message || 'Code incorrect');
        this.twoFaLoading.set(false);
      }
    });
  }

  disable2fa() {
    this.twoFaLoading.set(true);
    this.http.post<any>('/api/v1/auth/2fa/disable', {}).subscribe({
      next: () => {
        this.mfaEnabled.set(false);
        this.twoFaMsg.set('2FA désactivée');
        this.twoFaLoading.set(false);
        this.authService.updateMfa(false);
      },
      error: () => {
        this.twoFaError.set('Erreur lors de la désactivation');
        this.twoFaLoading.set(false);
      }
    });
  }
}

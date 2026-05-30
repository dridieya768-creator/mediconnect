import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-partage-dossier',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="header">
        <div class="logo"> MediConnect</div>
        <div class="subtitle">Dossier médical partagé — accès temporaire sécurisé</div>
      </div>

      
      <div class="loading" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Vérification du lien...</p>
      </div>

      
      <div class="error-card" *ngIf="!loading() && error()">
        <div class="error-icon"></div>
        <h2>Accès refusé</h2>
        <p>{{ error() }}</p>
        <p class="hint">Ce lien est peut-être expiré ou invalide. Demandez au patient de générer un nouveau lien.</p>
      </div>

      
      <div class="dossier-card" *ngIf="!loading() && !error() && dossier()">
        <div class="dossier-header">
          <div class="patient-avatar">{{ initiales() }}</div>
          <div>
            <h1 class="patient-nom">{{ dossier()!.patient.prenom || dossier()!.patient.firstName }} {{ dossier()!.patient.nom || dossier()!.patient.lastName }}</h1>
            <div class="expiry-badge">
              ⏱ Accès valide jusqu'au {{ formatDate(dossier()!.expiresAt) }}
            </div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item" *ngIf="dossier()!.patient.dateNaissance">
            <span class="info-label">Date de naissance</span>
            <span>{{ formatDate(dossier()!.patient.dateNaissance) }}</span>
          </div>
          <div class="info-item" *ngIf="dossier()!.patient.sexe">
            <span class="info-label">Sexe</span>
            <span>{{ dossier()!.patient.sexe === 'M' ? 'Masculin' : 'Féminin' }}</span>
          </div>
          <div class="info-item" *ngIf="dossier()!.patient.groupeSanguin">
            <span class="info-label">Groupe sanguin</span>
            <span class="blood">{{ dossier()!.patient.groupeSanguin }}</span>
          </div>
        </div>

        
        <div class="section" *ngIf="dossier()!.permissions.allergies">
          <div class="section-title"> Allergies & Maladies chroniques</div>
          <div class="tags" *ngIf="allergies().length">
            <span class="tag red" *ngFor="let a of allergies()">{{ a }}</span>
          </div>
          <p class="empty" *ngIf="!allergies().length">Aucune allergie connue</p>

          <div class="tags mt" *ngIf="maladies().length">
            <span class="tag orange" *ngFor="let m of maladies()">{{ m }}</span>
          </div>
          <p class="empty" *ngIf="!maladies().length">Aucune maladie chronique</p>
        </div>

        
        <div class="section" *ngIf="dossier()!.permissions.medicamentsActuels">
          <div class="section-title"> Médicaments actuels</div>
          <div class="tags" *ngIf="medicaments().length">
            <span class="tag blue" *ngFor="let m of medicaments()">{{ m }}</span>
          </div>
          <p class="empty" *ngIf="!medicaments().length">Aucun médicament en cours</p>
        </div>

       
        <div class="section" *ngIf="dossier()!.permissions.documents && documents().length">
          <div class="section-title"> Documents médicaux</div>
          <div class="docs-list">
            <div class="doc-item" *ngFor="let d of documents()">
              <span></span>
              <span class="doc-name">{{ d.name }}</span>
              <a class="btn-dl" [href]="d.url" target="_blank" download>⬇ Télécharger</a>
            </div>
          </div>
        </div>

        <div class="footer-note">
           Ce dossier a été partagé de manière sécurisée et temporaire par le patient via MediConnect.
          L'accès expirera automatiquement le {{ formatDate(dossier()!.expiresAt) }}.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: linear-gradient(135deg, #0f275a 0%, #1a56db 100%); padding: 32px 16px; font-family: system-ui, sans-serif; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 28px; font-weight: 800; color: white; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: rgba(255,255,255,0.7); }

    .loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px; color: white; }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-card { max-width: 480px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; text-align: center; }
    .error-icon { font-size: 48px; margin-bottom: 16px; }
    .error-card h2 { color: #dc2626; margin: 0 0 12px; }
    .error-card p { color: #374151; margin: 0 0 8px; }
    .hint { font-size: 13px; color: #94a3b8; font-style: italic; }

    .dossier-card { max-width: 720px; margin: 0 auto; background: white; border-radius: 20px; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
    .dossier-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #f1f5f9; }
    .patient-avatar { width: 56px; height: 56px; background: #1a56db; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0; }
    .patient-nom { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 6px; }
    .expiry-badge { display: inline-flex; align-items: center; gap: 6px; background: #fffbeb; color: #d97706; border: 1px solid #fde68a; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; }

    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .info-item { background: #f8fafc; border-radius: 10px; padding: 12px; }
    .info-label { display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }
    .blood { color: #dc2626; font-weight: 700; font-size: 16px; }

    .section { margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 12px; }
    .section-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .mt { margin-top: 10px; }
    .tag { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .red { background: #fef2f2; color: #dc2626; }
    .orange { background: #fffbeb; color: #d97706; }
    .blue { background: #eff6ff; color: #1a56db; }
    .empty { font-size: 13px; color: #94a3b8; font-style: italic; margin: 0; }

    .docs-list { display: flex; flex-direction: column; gap: 8px; }
    .doc-item { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; }
    .doc-name { flex: 1; font-size: 13px; font-weight: 600; color: #0f172a; }
    .btn-dl { padding: 5px 12px; background: #eff6ff; color: #1a56db; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; }

    .footer-note { margin-top: 24px; padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; font-size: 12px; color: #166534; line-height: 1.6; }

    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class PartageDossierComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  loading = signal(true);
  error = signal<string | null>(null);
  dossier = signal<any>(null);

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.error.set('Aucun token fourni dans le lien.');
      this.loading.set(false);
      return;
    }

    this.http.get<any>(`/api/v1/dossier-medical/partage/acceder?token=${encodeURIComponent(token)}`).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        if (data?.error) {
          this.error.set(data.error);
        } else {
          this.dossier.set(data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Lien invalide ou expiré.';
        this.error.set(Array.isArray(msg) ? msg.join(', ') : String(msg));
        this.loading.set(false);
      }
    });
  }

  get initiales(): () => string {
    return () => {
      const p = this.dossier()?.patient;
      if (!p) return '?';
      const first = (p.prenom ?? p.firstName ?? '')[0] ?? '';
      const last  = (p.nom    ?? p.lastName  ?? '')[0] ?? '';
      return (first + last).toUpperCase();
    };
  }

  allergies(): string[] {
    const v = this.dossier()?.patient?.allergies;
    if (!v) return [];
    if (Array.isArray(v)) return v;
    return v.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  maladies(): string[] {
    const v = this.dossier()?.patient?.maladiesChroniques;
    if (!v) return [];
    if (Array.isArray(v)) return v;
    return v.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  medicaments(): string[] {
    const v = this.dossier()?.patient?.medicamentsActuels;
    if (!v) return [];
    if (Array.isArray(v)) return v;
    return v.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  documents(): any[] {
    const v = this.dossier()?.patient?.documents;
    if (!v) return [];
    try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return []; }
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}

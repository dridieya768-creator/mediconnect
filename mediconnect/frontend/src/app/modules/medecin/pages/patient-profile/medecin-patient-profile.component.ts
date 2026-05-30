import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-medecin-patient-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">

      <div class="back-bar">
        <button class="btn-back" (click)="goBack()">← Retour</button>
      </div>

      <div class="loading-state" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Chargement du profil...</p>
      </div>

      <div class="error-state" *ngIf="!loading() && !patient()">
        <p>Profil patient introuvable.</p>
      </div>

      <div class="content" *ngIf="!loading() && patient()">

        
        <div class="patient-header">
          <div class="avatar">
            <img *ngIf="patient()?.avatarUrl" [src]="patient()?.avatarUrl" alt="photo">
            <span *ngIf="!patient()?.avatarUrl">{{ initials() }}</span>
          </div>
          <div class="patient-info">
            <h1>{{ patient()?.firstName }} {{ patient()?.lastName }}</h1>
            <p class="patient-email">{{ patient()?.email }}</p>
            <div class="patient-tags">
              <span class="tag" *ngIf="patient()?.sexe">{{ patient()?.sexe === 'M' ? 'Homme' : 'Femme' }}</span>
              <span class="tag" *ngIf="patient()?.ville">{{ patient()?.ville }}</span>
              <span class="tag blood" *ngIf="patient()?.groupeSanguin">{{ patient()?.groupeSanguin }}</span>
            </div>
          </div>
        </div>

        <div class="cards-grid">

          
          <div class="card">
            <div class="card-title">Informations générales</div>
            <div class="info-row"><span class="label">Téléphone</span><span>{{ patient()?.telephone || '—' }}</span></div>
            <div class="info-row"><span class="label">Date de naissance</span><span>{{ formatDate(patient()?.dateNaissance) }}</span></div>
            <div class="info-row"><span class="label">Ville</span><span>{{ patient()?.ville || '—' }}</span></div>
            <div class="info-row"><span class="label">NSS</span><span>{{ patient()?.nss || '—' }}</span></div>
          </div>

          
          <div class="card">
            <div class="card-title">Informations médicales</div>
            <div class="info-row"><span class="label">Groupe sanguin</span><span class="blood-badge">{{ patient()?.groupeSanguin || '—' }}</span></div>

            <ng-container *ngIf="permissions().allergies">
            <div class="section-label">Allergies</div>
            <div class="tags-list" *ngIf="patient()?.allergies?.length">
              <span class="tag-item allergy" *ngFor="let a of patient()?.allergies">{{ a }}</span>
            </div>
            <p class="empty-text" *ngIf="!patient()?.allergies?.length">Aucune allergie connue</p>

            <div class="section-label">Maladies chroniques</div>
            <div class="tags-list" *ngIf="patient()?.maladiesChroniques?.length">
              <span class="tag-item chronic" *ngFor="let m of patient()?.maladiesChroniques">{{ m }}</span>
            </div>
            <p class="empty-text" *ngIf="!patient()?.maladiesChroniques?.length">Aucune maladie chronique</p>
            </ng-container>
            <div *ngIf="!permissions().allergies" class="no-access-msg"> Accès non autorisé par le patient</div>
          </div>

          
          <div class="card card-full">
            <div class="card-title">Médicaments actuels</div>
            <div *ngIf="patient()?.medicamentsActuels?.length">
              <div class="med-item" *ngFor="let m of patient()?.medicamentsActuels">
                <span class="med-name">{{ m?.nom || m?.name || m }}</span>
                <span class="med-dose" *ngIf="m?.dose">{{ m.dose }}</span>
              </div>
            </div>
            <p class="empty-text" *ngIf="!patient()?.medicamentsActuels?.length">Aucun médicament en cours</p>
          </div>

          
          <div class="card card-full" *ngIf="permissions().documents">
            <div class="card-title"> Documents médicaux</div>
            <div *ngIf="patient()?.documents?.length">
              <div class="doc-item" *ngFor="let d of patient()?.documents">
                <span class="doc-icon"></span>
                <div class="doc-info">
                  <div class="doc-name">{{ d.name }}</div>
                  <div class="doc-date">{{ d.uploadedAt ? formatDate(d.uploadedAt) : '' }}</div>
                </div>
                <a class="btn-dl" [href]="d.url" target="_blank">⬇ Télécharger</a>
              </div>
            </div>
            <p class="empty-text" *ngIf="!patient()?.documents?.length">Aucun document partagé</p>
          </div>
          <div class="card card-full" *ngIf="!permissions().documents">
            <div class="card-title"> Documents médicaux</div>
            <div class="no-access-msg"> Accès non autorisé par le patient</div>
          </div>

          
          <div class="card card-full">
            <div class="card-title">Observations médicales</div>
            <!-- Observation existante : soumise à permission -->
<ng-container *ngIf="permissions().observations">
  <div *ngIf="patient()?.observationsMedecin" class="obs-existing">
    <p class="obs-text">{{ patient()?.observationsMedecin }}</p>
  </div>
</ng-container>
<div *ngIf="!permissions().observations" class="no-access-msg">
  Accès non autorisé par le patient
</div>


<textarea
  class="obs-textarea"
  [(ngModel)]="newObservation"
  placeholder="Saisir vos observations, remarques cliniques..."
  rows="4"
></textarea>
<div class="obs-actions">
  <span class="obs-success" *ngIf="obsSaved()">✓ Observation enregistrée</span>
  <span class="obs-error" *ngIf="obsError()">{{ obsError() }}</span>
  <button class="btn-save-obs" (click)="saveObservation()" 
    [disabled]="obsSaving() || !newObservation.trim()">
    {{ obsSaving() ? 'Enregistrement...' : 'Enregistrer' }}
  </button>
</div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding: 24px; max-width: 900px; margin: 0 auto; }

    .back-bar { margin-bottom: 20px; }
    .btn-back { background: none; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; color: #475569; }
    .btn-back:hover { background: #f8fafc; }

    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 12px; color: #64748b; }
    .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #4f46e5; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .patient-header { display: flex; align-items: center; gap: 20px; background: white; border-radius: 16px; border: 1.5px solid #e2e8f0; padding: 24px; margin-bottom: 20px; }
    .avatar { width: 72px; height: 72px; border-radius: 50%; background: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: white; flex-shrink: 0; overflow: hidden; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .patient-info h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .patient-email { font-size: 14px; color: #64748b; margin: 0 0 10px; }
    .patient-tags { display: flex; gap: 8px; flex-wrap: wrap; }
    .tag { background: #f1f5f9; color: #475569; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .tag.blood { background: #fef2f2; color: #dc2626; }

    .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .card-full { grid-column: 1 / -1; }

    .card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 20px; }
    .card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }

    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; color: #0f172a; }
    .info-row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 500; }
    .blood-badge { background: #fef2f2; color: #dc2626; padding: 2px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; }

    .section-label { font-size: 12px; font-weight: 600; color: #64748b; margin: 14px 0 8px; text-transform: uppercase; letter-spacing: .5px; }
    .tags-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag-item { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .tag-item.allergy { background: #fef2f2; color: #dc2626; }
    .tag-item.chronic { background: #fffbeb; color: #d97706; }
    .empty-text { font-size: 13px; color: #94a3b8; margin: 4px 0; }

    .med-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }
    .med-item:last-child { border-bottom: none; }
    .med-name { font-weight: 600; color: #0f172a; }
    .med-dose { color: #64748b; font-size: 12px; }

    .obs-existing { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    .obs-text { font-size: 13px; color: #166534; margin: 0; white-space: pre-wrap; }
    .obs-textarea { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 13px; font-family: inherit; resize: vertical; outline: none; box-sizing: border-box; }
    .obs-textarea:focus { border-color: #4f46e5; }
    .obs-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 10px; }
    .obs-success { font-size: 13px; color: #16a34a; font-weight: 600; }
    .obs-error { font-size: 13px; color: #dc2626; }
    .btn-save-obs { background: #4f46e5; color: white; border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-save-obs:hover:not(:disabled) { background: #4338ca; }
    .btn-save-obs:disabled { opacity: 0.5; cursor: not-allowed; }
    .no-access-msg { font-size: 13px; color: #94a3b8; font-style: italic; padding: 8px 0; }
    .doc-item { display: flex; align-items: center; gap: 12px; background: #f8fafc; border-radius: 10px; padding: 12px; border: 1px solid #e2e8f0; margin-bottom: 8px; }
    .doc-icon { font-size: 24px; flex-shrink: 0; }
    .doc-info { flex: 1; }
    .doc-name { font-size: 14px; font-weight: 600; color: #0f172a; }
    .doc-date { font-size: 12px; color: #64748b; }
    .btn-dl { padding: 6px 12px; background: #eff6ff; color: #1a56db; border: 1.5px solid #bfdbfe; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: none; }

    @media (max-width: 640px) { .cards-grid { grid-template-columns: 1fr; } .card-full { grid-column: 1; } }
  `]
})
export class MedecinPatientProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  patient = signal<any>(null);
  loading = signal(true);
  newObservation = '';
  obsSaving = signal(false);
  obsSaved  = signal(false);
  obsError  = signal<string | null>(null);
  patientId = '';
  permissions = signal<any>({ allergies: false, documents: false, observations: false });
  initials = () => {
    const p = this.patient();
    if (!p) return '?';
    return `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  };

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) { this.loading.set(false); return; }
    this.patientId = userId;

    this.http.get<any>(`/api/v1/patients/${userId}`)
      .pipe(catchError((err) => {
        console.error('[MedecinPatientProfile] GET /patients error:', err);
        return of(null);
      }))
      .subscribe(res => {
        console.log('[MedecinPatientProfile] GET /patients response:', JSON.stringify(res));
        const data = res?.data?.data ?? res?.data ?? null;
        this.patient.set(data);
        if (data?.id) this.patientId = data.id;
        this.newObservation = data?.observationsMedecin ?? '';
        this.loading.set(false);

        
        if (data?.id) {
          this.http.get<any>(`/api/v1/dossier-medical/${data.id}/acces/my-permissions`)
            .pipe(catchError((err) => {
              console.error('[MedecinPatientProfile] my-permissions error:', err?.status, err?.error);
              return of(null);
            }))
            .subscribe(r => {
              console.log('[MedecinPatientProfile] my-permissions response:', JSON.stringify(r));
              const perms = r?.data?.permissions ?? r?.permissions;
              if (perms) {
                this.permissions.set(perms);
              }
            });
        }
      });
  }

  saveObservation(): void {
    if (!this.newObservation.trim() || !this.patientId) return;
    this.obsSaving.set(true);
    this.obsSaved.set(false);
    this.obsError.set(null);

    this.http.patch<any>(`/api/v1/patients/${this.patientId}/observations`, {
      observationsMedecin: this.newObservation.trim(),
    }).pipe(catchError(err => {
      this.obsError.set(err?.error?.message || 'Erreur lors de l\'enregistrement');
      this.obsSaving.set(false);
      return of(null);
    })).subscribe(res => {
      if (res) {
        this.obsSaved.set(true);
        this.patient.update(p => ({ ...p, observationsMedecin: this.newObservation.trim() }));
        setTimeout(() => this.obsSaved.set(false), 3000);
      }
      this.obsSaving.set(false);
    });
  }

  goBack() { this.router.navigate(['/medecin/patients']); }

  formatDate(d: any): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-teleconsultation-medecin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-page">
      <div class="video-header">
        <div class="header-left">
          <button class="btn-back" (click)="goBack()">← Retour</button>
          <div class="session-info">
            <span class="session-badge"> Téléconsultation en cours</span>
            <span class="room-id" *ngIf="roomId()">Salle : {{ roomId() }}</span>
          </div>
        </div>
        <div class="header-right">
          <button class="btn-dossier" (click)="toggleDossier()" [class.active]="showDossier()">
            📋 Dossier patient
          </button>
          <button class="btn-end" (click)="endCall()"> Terminer</button>
        </div>
      </div>

      <div class="main-area">
        <!-- Jitsi -->
        <div class="jitsi-area" [class.with-panel]="showDossier()">
          <div class="loading-state" *ngIf="loading()">
            <div class="spinner"></div>
            <p>Préparation de la salle vidéo...</p>
          </div>
          <div class="error-state" *ngIf="error()">
            <h2>Impossible de rejoindre la salle</h2>
            <p>{{ error() }}</p>
            <button class="btn-retry" (click)="loadRoom()">Réessayer</button>
          </div>
          <div class="jitsi-container" *ngIf="!loading() && !error() && jitsiUrl()">
            <iframe [src]="jitsiUrl()!" class="jitsi-frame"
              allow="camera; microphone; fullscreen; display-capture; autoplay" allowfullscreen></iframe>
          </div>
        </div>

        <!-- Panneau dossier patient -->
        <div class="dossier-panel" *ngIf="showDossier()">
          <div class="panel-header">
            <span>📋 Dossier patient</span>
            <button class="btn-close-panel" (click)="toggleDossier()">✕</button>
          </div>

          <div class="panel-loading" *ngIf="dossierLoading()">
            <div class="spinner-sm"></div>
            <span>Chargement...</span>
          </div>

          <div class="panel-content" *ngIf="!dossierLoading() && dossier()">
            <!-- Identité -->
            <div class="section">
              <div class="section-title">Patient</div>
              <div class="info-row"><span class="lbl">Nom</span><span>{{ dossier()?.firstName }} {{ dossier()?.lastName }}</span></div>
              <div class="info-row"><span class="lbl">Naissance</span><span>{{ formatDate(dossier()?.dateNaissance) }}</span></div>
              <div class="info-row"><span class="lbl">Groupe sanguin</span><span class="blood">{{ dossier()?.groupeSanguin || '—' }}</span></div>
            </div>

            <!-- Allergies -->
            <div class="section" *ngIf="permissions().allergies">
              <div class="section-title">Allergies</div>
              <div class="tags" *ngIf="dossier()?.allergies?.length">
                <span class="tag allergy" *ngFor="let a of dossier()?.allergies">{{ a }}</span>
              </div>
              <p class="empty" *ngIf="!dossier()?.allergies?.length">Aucune allergie</p>
            </div>

            <!-- Maladies chroniques -->
            <div class="section" *ngIf="permissions().allergies">
              <div class="section-title">Maladies chroniques</div>
              <div class="tags" *ngIf="dossier()?.maladiesChroniques?.length">
                <span class="tag chronic" *ngFor="let m of dossier()?.maladiesChroniques">{{ m }}</span>
              </div>
              <p class="empty" *ngIf="!dossier()?.maladiesChroniques?.length">Aucune</p>
            </div>

            <!-- Médicaments -->
            <div class="section">
              <div class="section-title">Médicaments actuels</div>
              <div class="med-list" *ngIf="dossier()?.medicamentsActuels?.length">
                <div class="med-item" *ngFor="let m of dossier()?.medicamentsActuels">
                  {{ m?.nom || m?.name || m }}
                </div>
              </div>
              <p class="empty" *ngIf="!dossier()?.medicamentsActuels?.length">Aucun</p>
            </div>

            <!-- Accès refusé -->
            <div class="no-access" *ngIf="!permissions().allergies && !permissions().documents">
              🔒 Accès limité — le patient n'a pas accordé de permissions
            </div>
          </div>

          <div class="panel-error" *ngIf="!dossierLoading() && !dossier()">
            Impossible de charger le dossier
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-page{display:flex;flex-direction:column;height:100vh;background:#0f172a}
    .video-header{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:#1e293b;border-bottom:1px solid #334155;flex-shrink:0}
    .header-left{display:flex;align-items:center;gap:16px}
    .header-right{display:flex;align-items:center;gap:10px}
    .btn-back{padding:8px 16px;background:#334155;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
    .session-badge{background:#dc2626;color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
    .room-id{font-size:12px;color:#94a3b8;font-family:monospace}
    .btn-dossier{padding:8px 16px;background:#334155;color:#94a3b8;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}
    .btn-dossier.active,.btn-dossier:hover{background:#1a56db;color:white}
    .btn-end{padding:8px 20px;background:#dc2626;color:white;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer}

    .main-area{flex:1;display:flex;overflow:hidden}

    .jitsi-area{flex:1;display:flex;flex-direction:column;transition:all .3s}
    .loading-state{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#94a3b8;gap:16px}
    .spinner{width:48px;height:48px;border:4px solid #334155;border-top-color:#1a56db;border-radius:50%;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .error-state{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#94a3b8;gap:16px;text-align:center;padding:40px}
    .error-state h2{color:white;font-size:22px;margin:0}
    .btn-retry{padding:10px 24px;background:#1a56db;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
    .jitsi-container{flex:1;display:flex}
    .jitsi-frame{flex:1;border:none;width:100%;height:100%}

    /* Panneau dossier */
    .dossier-panel{width:340px;flex-shrink:0;background:#1e293b;border-left:1px solid #334155;display:flex;flex-direction:column;overflow:hidden}
    .panel-header{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#0f172a;border-bottom:1px solid #334155;font-size:14px;font-weight:700;color:white;flex-shrink:0}
    .btn-close-panel{background:none;border:none;color:#94a3b8;font-size:16px;cursor:pointer;padding:2px 6px;border-radius:4px}
    .btn-close-panel:hover{color:white;background:#334155}
    .panel-loading{display:flex;align-items:center;gap:10px;padding:20px;color:#94a3b8;font-size:13px}
    .spinner-sm{width:20px;height:20px;border:2px solid #334155;border-top-color:#1a56db;border-radius:50%;animation:spin .8s linear infinite}
    .panel-content{flex:1;overflow-y:auto;padding:12px}
    .panel-error{padding:20px;color:#94a3b8;font-size:13px;text-align:center}

    .section{background:#0f172a;border-radius:10px;padding:12px;margin-bottom:10px}
    .section-title{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
    .info-row{display:flex;justify-content:space-between;font-size:12px;color:#cbd5e1;padding:4px 0;border-bottom:1px solid #1e293b}
    .info-row:last-child{border-bottom:none}
    .lbl{color:#64748b}
    .blood{color:#f87171;font-weight:700}
    .tags{display:flex;flex-wrap:wrap;gap:6px}
    .tag{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
    .tag.allergy{background:#450a0a;color:#f87171}
    .tag.chronic{background:#451a03;color:#fb923c}
    .med-list{display:flex;flex-direction:column;gap:4px}
    .med-item{font-size:12px;color:#cbd5e1;padding:4px 8px;background:#1e293b;border-radius:6px}
    .empty{font-size:12px;color:#475569;margin:0}
    .no-access{font-size:12px;color:#64748b;text-align:center;padding:16px;background:#0f172a;border-radius:10px}
  `]
})
export class TeleconsultationMedecinComponent implements OnInit {
  private route     = inject(ActivatedRoute);
  private router    = inject(Router);
  private http      = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  loading  = signal(true);
  error    = signal<string | null>(null);
  roomId   = signal<string | null>(null);
  jitsiUrl = signal<SafeResourceUrl | null>(null);

  showDossier   = signal(false);
  dossierLoading = signal(false);
  dossier       = signal<any>(null);
  permissions   = signal<any>({ allergies: false, documents: false, observations: false });

  private appointmentId = '';
  private patientId     = '';

  ngOnInit() {
    this.appointmentId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.appointmentId) { this.error.set('ID manquant'); this.loading.set(false); return; }
    this.loadRoom();
  }

  loadRoom() {
    this.loading.set(true); this.error.set(null);
    this.http.post<any>(`/api/v1/appointments/${this.appointmentId}/video-room`, {}).subscribe({
      next: res => {
        const data = res?.data ?? res;
        const room = data?.videoRoomId ?? data?.data?.videoRoomId;
        if (!room) { this.error.set('Impossible de créer la salle'); this.loading.set(false); return; }
        this.roomId.set(room);
        // Récupérer le patientId depuis la réponse si disponible
        if (data?.patientId) this.patientId = data.patientId;
        const url = `https://meet.jit.si/${room}#config.startWithAudioMuted=false&config.startWithVideoMuted=false`;
        this.jitsiUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.loading.set(false);
      },
      error: err => { this.error.set(err?.error?.message || 'Erreur connexion'); this.loading.set(false); }
    });
  }

  toggleDossier() {
    this.showDossier.update(v => !v);
    if (this.showDossier() && !this.dossier()) {
      this.loadDossier();
    }
  }

  private loadDossier() {
    this.dossierLoading.set(true);

    // Charger le RDV pour obtenir le patientId
    this.http.get<any>(`/api/v1/appointments/${this.appointmentId}`)
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        const appt = res?.data ?? res;
        const pid = appt?.patientId ?? this.patientId;
        if (!pid) { this.dossierLoading.set(false); return; }
        this.patientId = pid;

        // Charger le dossier médical
        this.http.get<any>(`/api/v1/dossier-medical/${pid}`)
          .pipe(catchError(() => of(null)))
          .subscribe(r => {
            const d = r?.data ?? r;
            this.dossier.set(d);

            // Charger les permissions
            this.http.get<any>(`/api/v1/dossier-medical/${pid}/acces/my-permissions`)
              .pipe(catchError(() => of(null)))
              .subscribe(p => {
                const perms = p?.data?.permissions ?? p?.permissions;
                if (perms) this.permissions.set(perms);
                this.dossierLoading.set(false);
              });
          });
      });
  }

  endCall() { if (confirm('Terminer la téléconsultation ?')) this.goBack(); }
  goBack() { this.router.navigate(['/medecin/planning']); }

  formatDate(d: any): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}

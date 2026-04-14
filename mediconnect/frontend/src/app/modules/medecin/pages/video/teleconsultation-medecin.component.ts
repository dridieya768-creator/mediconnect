import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
            <span class="session-badge">📹 Téléconsultation en cours</span>
            <span class="room-id" *ngIf="roomId()">Salle : {{ roomId() }}</span>
          </div>
        </div>
        <button class="btn-end" (click)="endCall()">🔴 Terminer</button>
      </div>

      <div class="loading-state" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Préparation de la salle vidéo...</p>
      </div>

      <div class="error-state" *ngIf="error()">
        <div style="font-size:48px">❌</div>
        <h2>Impossible de rejoindre la salle</h2>
        <p>{{ error() }}</p>
        <button class="btn-retry" (click)="loadRoom()">Réessayer</button>
      </div>

      <div class="jitsi-container" *ngIf="!loading() && !error() && jitsiUrl()">
        <iframe [src]="jitsiUrl()!" class="jitsi-frame"
          allow="camera; microphone; fullscreen; display-capture; autoplay" allowfullscreen></iframe>
      </div>
    </div>
  `,
  styles: [`
    .video-page{display:flex;flex-direction:column;height:100vh;background:#0f172a}
    .video-header{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:#1e293b;border-bottom:1px solid #334155;flex-shrink:0}
    .header-left{display:flex;align-items:center;gap:16px}
    .btn-back{padding:8px 16px;background:#334155;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
    .session-badge{background:#dc2626;color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
    .room-id{font-size:12px;color:#94a3b8;font-family:monospace}
    .btn-end{padding:8px 20px;background:#dc2626;color:white;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer}
    .loading-state{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#94a3b8;gap:16px}
    .spinner{width:48px;height:48px;border:4px solid #334155;border-top-color:#1a56db;border-radius:50%;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .error-state{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#94a3b8;gap:16px;text-align:center;padding:40px}
    .error-state h2{color:white;font-size:22px;margin:0}
    .btn-retry{padding:10px 24px;background:#1a56db;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
    .jitsi-container{flex:1;display:flex}
    .jitsi-frame{flex:1;border:none;width:100%;height:100%}
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
  private appointmentId = '';

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
        const url = `https://meet.jit.si/${room}#config.startWithAudioMuted=false&config.startWithVideoMuted=false`;
        this.jitsiUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.loading.set(false);
      },
      error: err => { this.error.set(err?.error?.message || 'Erreur connexion'); this.loading.set(false); }
    });
  }

  endCall() { if (confirm('Terminer la téléconsultation ?')) this.goBack(); }
  goBack() { this.router.navigate(['/medecin/planning']); }
}

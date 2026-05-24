import {
  Component, OnInit, inject, signal, computed,
  AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-medecin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dash">

      <!-- HERO BANNER -->
      <div style="position:relative; width:100%; height:480px; overflow:hidden; margin-bottom:24px;">
        <img src="assets/images/Homepage-Hero.jpg.webp" alt="Dashboard Medecin"
             style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; display:block;">
        <div style="position:absolute; inset:0; background:linear-gradient(to right, rgba(15,39,90,0.78), rgba(15,39,90,0.25)); display:flex; flex-direction:column; justify-content:center; padding:0 60px;">
          <p style="font-family:'Georgia',serif; font-size:18px; color:rgba(255,255,255,0.85); margin:0 0 12px; font-weight:400;">
            Bonjour, {{ medecin()?.firstName ?? 'Docteur' }} 
          </p>
          <h1 style="font-family:'Georgia',serif; font-size:42px; font-weight:700; color:white; margin:0 0 12px; line-height:1.2;">
            Bienvenue dans MediConnect
          </h1>
          <p style="font-family:'Georgia',serif; font-size:17px; color:rgba(255,255,255,0.82); margin:0; max-width:560px; line-height:1.6;">
            MediConnect assure la continuite de vos soins — un suivi intelligent, des patients fideles, une carriere epanouie.
          </p>
        </div>
      </div>

      <!-- ══ STATS CARDS ═══════════════════════════════════════════ -->
      <div class="stats-row">
        <div class="stat-card" *ngFor="let s of stats()">
          <div class="stat-icon">{{ s.icon }}</div>
          <div class="stat-body">
            <div class="stat-val">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
          <div class="stat-trend" [class.up]="s.trend > 0" [class.down]="s.trend < 0" *ngIf="s.trend !== 0">
            {{ s.trend > 0 ? '↑' : '↓' }} {{ s.trend > 0 ? '+' : '' }}{{ s.trend }}
          </div>
        </div>
      </div>

      <!-- ══ MAIN GRID ═════════════════════════════════════════════ -->
      <div class="main-grid">

        <!-- ── Prochains RDV ──────────────────────────────────── -->
        <div class="card card-appts">
          <div class="card-head">
            <h2>Prochains rendez-vous</h2>
            <a routerLink="/medecin/planning" class="link-more">Voir tout →</a>
          </div>

          <div class="loading-state" *ngIf="isLoading()">
            <div class="spinner"></div>
          </div>

          <div class="appts-list" *ngIf="!isLoading()">
            <div class="appt-item" *ngFor="let a of upcomingAppointments()"
                 [class.appt-confirmed]="a.status === 'CONFIRMED'"
                 [class.appt-pending]  ="a.status === 'REQUESTED'">
              <div class="appt-time">
                <div class="appt-hour">{{ formatTime(a.appointmentDate) }}</div>
                <div class="appt-date-sm">{{ formatShortDate(a.appointmentDate) }}</div>
              </div>
              <div class="appt-sep"></div>
              <div class="appt-info">
                <div class="appt-name appt-name-link" (click)="viewPatient(a)">{{ getPatientName(a) }}</div>
                <div class="appt-meta">
                  <span class="appt-type-badge">
                    {{ a.consultationType === 'TELECONSULTATION' ? ' Téléconsult.' : ' Présentiel' }}
                  </span>
                  <span class="appt-dur">{{ a.durationMinutes }} min</span>
                </div>
              </div>
              <div class="appt-status-pill" [ngClass]="getStatusClass(a.status)">
                {{ getStatusLabel(a.status) }}
              </div>
            </div>

            <div class="empty-mini" *ngIf="upcomingAppointments().length === 0">
              <span></span>
              <p>Aucun RDV à venir aujourd'hui</p>
            </div>
          </div>

          <div class="pending-bar" *ngIf="pendingCount() > 0">
            <span> {{ pendingCount() }} demande(s) en attente</span>
            <a routerLink="/medecin/planning" class="link-more">Traiter →</a>
          </div>
        </div>

        <!-- ── QR Code ─────────────────────────────────────────── -->
        <div class="card card-qr">
          <div class="card-head">
            <h2> Mon QR Code</h2>
          </div>

          <div class="qr-section">

            <!--  Le canvas est TOUJOURS dans le DOM, juste caché par CSS -->
            <!-- Cela permet à ViewChild de toujours le trouver -->
            <div class="qr-loading" [class.hidden]="!qrLoading()">
              <div class="spinner"></div>
              <span>Génération…</span>
            </div>

            <div class="qr-error" *ngIf="qrError()">
               {{ qrError() }}
            </div>

            <!-- Canvas toujours présent dans le DOM -->
            <div class="qr-canvas-wrap" [class.hidden]="qrLoading() || !!qrError()">
              <canvas #qrCanvas></canvas>
              <div class="qr-logo"></div>
            </div>

            <div class="qr-url" [class.hidden]="qrLoading() || !!qrError()">
              <span class="qr-url-label"> Lien de profil</span>
              <span class="qr-url-val">{{ profileUrl() }}</span>
            </div>

            <div class="qr-actions" [class.hidden]="qrLoading() || !!qrError()">
              <button class="btn-qr-dl"    (click)="downloadQr()">⬇ Télécharger</button>
              <button class="btn-qr-copy"  (click)="copyUrl()">
                {{ copied() ? ' Copié !' : ' Copier' }}
              </button>
              <button class="btn-qr-print" (click)="printQr()"> Imprimer</button>
            </div>

            <p class="qr-hint">
              Affichez ce code dans votre cabinet pour que vos patients vérifient votre profil MediConnect.
            </p>
          </div>
        </div>

        <!-- ── Accès rapides ───────────────────────────────────── -->
        <div class="card card-quick">
          <div class="card-head">
            <h2> Accès rapides</h2>
          </div>
          <div class="quick-grid">
            <a routerLink="/medecin/planning"      class="quick-btn">
              <span></span><span>Planning</span>
            </a>
            <a routerLink="/medecin/patients"      class="quick-btn">
              <span></span><span>Patients</span>
            </a>
            <a routerLink="/medecin/prescriptions" class="quick-btn">
              <span></span><span>Prescriptions</span>
            </a>
            <a routerLink="/medecin/profil"        class="quick-btn">
              <span></span><span>Mon Profil</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .hidden { display: none !important; }

    /* ── Page ─────────────────────────────────────────────── */
    .dash { padding: 0; display: flex; flex-direction: column; gap: 24px; }

    /* ── Header ───────────────────────────────────────────── */
    .dash-header {
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 12px;
    }
    .dash-greeting { display: flex; align-items: center; gap: 14px; }
    .greeting-avatar {
      width: 52px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white; font-size: 18px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .dash-title  { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
    .dash-sub    { font-size: 13px; color: #94a3b8; margin: 0; }
    .btn-primary {
      padding: 10px 20px; background: #4f46e5; color: white;
      border: none; border-radius: 8px; font-size: 14px; font-weight: 600;
      cursor: pointer; text-decoration: none; display: inline-block;
      transition: opacity .15s;
    }
    .btn-primary:hover { opacity: .88; }

    /* ── Stats ────────────────────────────────────────────── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    .stat-card {
      background: white; border-radius: 14px;
      border: 1.5px solid #e2e8f0; padding: 16px 20px;
      display: flex; align-items: center; gap: 14px;
      position: relative; overflow: hidden;
      transition: box-shadow .15s;
    }
    .stat-card:hover { box-shadow: 0 4px 20px rgba(79,70,229,.1); }
    .stat-icon { font-size: 28px; flex-shrink: 0; }
    .stat-val   { font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 3px; }
    .stat-trend {
      position: absolute; top: 10px; right: 12px;
      font-size: 11px; font-weight: 700; padding: 2px 8px;
      border-radius: 20px;
    }
    .stat-trend.up   { background: #f0fdf4; color: #16a34a; }
    .stat-trend.down { background: #fef2f2; color: #dc2626; }

    /* ── Main grid ────────────────────────────────────────── */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      grid-template-rows: auto auto;
      gap: 20px;
    }
    .card {
      background: white; border-radius: 16px;
      border: 1.5px solid #e2e8f0; overflow: hidden;
    }
    .card-appts { grid-row: 1 / 3; }
    .card-qr    { grid-column: 2; grid-row: 1; }
    .card-quick { grid-column: 2; grid-row: 2; }

    .card-head {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #f1f5f9;
      background: #f8fafc;
    }
    .card-head h2 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }
    .link-more { font-size: 12px; color: #4f46e5; text-decoration: none; font-weight: 600; }
    .link-more:hover { text-decoration: underline; }

    /* ── Appointments list ────────────────────────────────── */
    .loading-state { display: flex; justify-content: center; padding: 40px; }
    .spinner {
      width: 32px; height: 32px; border: 3px solid #e2e8f0;
      border-top-color: #4f46e5; border-radius: 50%;
      animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .appts-list { padding: 8px 0; }
    .appt-item {
      display: flex; align-items: center; gap: 14px;
      padding: 12px 20px; border-bottom: 1px solid #f8fafc;
      transition: background .1s;
    }
    .appt-item:hover { background: #fafbff; }
    .appt-item.appt-confirmed { border-left: 3px solid #16a34a; }
    .appt-item.appt-pending   { border-left: 3px solid #d97706; }

    .appt-time  { text-align: center; min-width: 48px; }
    .appt-hour  { font-size: 14px; font-weight: 700; color: #0f172a; }
    .appt-date-sm { font-size: 10px; color: #94a3b8; margin-top: 2px; }
    .appt-sep   { width: 1px; height: 36px; background: #e2e8f0; flex-shrink: 0; }
    .appt-info  { flex: 1; }
    .appt-name  { font-size: 14px; font-weight: 600; color: #0f172a; }
    .appt-name-link { cursor: pointer; }
    .appt-name-link:hover { color: #4f46e5; text-decoration: underline; }
    .appt-meta  { display: flex; gap: 8px; margin-top: 3px; align-items: center; }
    .appt-type-badge {
      font-size: 11px; color: #64748b;
      background: #f1f5f9; border-radius: 6px; padding: 2px 8px;
    }
    .appt-dur { font-size: 11px; color: #94a3b8; }
    .appt-status-pill {
      font-size: 11px; font-weight: 600; padding: 3px 10px;
      border-radius: 20px; white-space: nowrap; flex-shrink: 0;
    }
    .status-confirmed { background: #f0fdf4; color: #16a34a; }
    .status-pending   { background: #fffbeb; color: #d97706; }
    .status-cancelled { background: #fef2f2; color: #dc2626; }
    .status-completed { background: #f8fafc; color: #64748b; }

    .pending-bar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 20px; background: #fffbeb;
      border-top: 1px solid #fde68a;
      font-size: 13px; font-weight: 600; color: #92400e;
    }

    .empty-mini {
      display: flex; flex-direction: column; align-items: center;
      padding: 40px 20px; gap: 8px; color: #94a3b8; font-size: 13px;
    }
    .empty-mini span { font-size: 32px; }

    /* ── QR Code ──────────────────────────────────────────── */
    .qr-section {
      padding: 20px; display: flex; flex-direction: column;
      align-items: center; gap: 14px;
    }
    .qr-loading {
      display: flex; align-items: center; gap: 10px;
      color: #64748b; font-size: 13px; padding: 30px 0;
    }
    .qr-error {
      background: #fef2f2; color: #dc2626;
      border: 1px solid #fecaca; border-radius: 8px;
      padding: 10px 14px; font-size: 12px; width: 100%; box-sizing: border-box;
    }
    .qr-canvas-wrap {
      position: relative; display: inline-flex;
      align-items: center; justify-content: center;
      padding: 10px; background: white;
      border: 2px solid #e2e8f0; border-radius: 14px;
      box-shadow: 0 4px 20px rgba(79,70,229,.1);
    }
    .qr-canvas-wrap canvas { display: block; border-radius: 6px; }
    .qr-logo {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 32px; height: 32px; background: white;
      border-radius: 6px; display: flex; align-items: center;
      justify-content: center; font-size: 18px;
      box-shadow: 0 2px 6px rgba(0,0,0,.12);
      pointer-events: none;
    }
    .qr-url {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 8px 12px; width: 100%; box-sizing: border-box;
      display: flex; flex-direction: column; gap: 3px;
    }
    .qr-url-label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; }
    .qr-url-val   { font-size: 11px; color: #4f46e5; font-weight: 600; word-break: break-all; }
    .qr-actions   { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
    .btn-qr-dl, .btn-qr-copy, .btn-qr-print {
      padding: 7px 13px; border-radius: 7px;
      font-size: 12px; font-weight: 600; cursor: pointer;
      border: none; transition: opacity .15s;
    }
    .btn-qr-dl    { background: #4f46e5; color: white; }
    .btn-qr-copy  { background: #f1f5f9; color: #475569; border: 1.5px solid #e2e8f0; }
    .btn-qr-print { background: #f1f5f9; color: #475569; border: 1.5px solid #e2e8f0; }
    .btn-qr-dl:hover, .btn-qr-copy:hover, .btn-qr-print:hover { opacity: .82; }
    .qr-hint {
      font-size: 11px; color: #94a3b8; text-align: center;
      line-height: 1.5; margin: 0;
    }

    /* ── Quick actions ────────────────────────────────────── */
    .quick-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 10px; padding: 16px;
    }
    .quick-btn {
      display: flex; flex-direction: column; align-items: center;
      gap: 6px; padding: 16px 8px;
      background: #f8fafc; border: 1.5px solid #e2e8f0;
      border-radius: 10px; text-decoration: none;
      font-size: 12px; font-weight: 600; color: #334155;
      transition: all .15s; cursor: pointer;
    }
    .quick-btn span:first-child { font-size: 22px; }
    .quick-btn:hover { border-color: #4f46e5; color: #4f46e5; background: #eef2ff; }

    /* ── Responsive ───────────────────────────────────────── */
    @media (max-width: 1024px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .main-grid { grid-template-columns: 1fr; }
      .card-appts { grid-row: auto; }
      .card-qr    { grid-column: 1; grid-row: auto; }
      .card-quick { grid-column: 1; grid-row: auto; }
    }
    @media (max-width: 600px) {
      .stats-row { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class MedecinDashboardComponent implements OnInit, AfterViewInit {

  
  @ViewChild("qrCanvas", { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private http   = inject(HttpClient);
  private router = inject(Router);
  private cdr  = inject(ChangeDetectorRef);

  medecin      = signal<any>(null);
  appointments = signal<any[]>([]);
  isLoading    = signal(true);
  qrLoading    = signal(true);
  qrError      = signal<string | null>(null);
  profileUrl   = signal("");
  copied       = signal(false);

  private doctorId: string | null = null;
  private pendingQrUrl: string | null = null; // URL en attente si AfterViewInit pas encore passé

  // ── Computed ────────────────────────────────────────────────────────────
  upcomingAppointments = computed(() => {
    const now = new Date();
    return this.appointments()
      .filter(a => new Date(a.appointmentDate) >= now
               && (a.status === "CONFIRMED" || a.status === "REQUESTED"))
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
      .slice(0, 8);
  });

  pendingCount = computed(() =>
    this.appointments().filter(a => a.status === "REQUESTED").length
  );

  stats = computed(() => {
    const appts = this.appointments();
    const today = new Date();
    const todayStr = today.toDateString();

    const todayCount = appts.filter(a =>
      new Date(a.appointmentDate).toDateString() === todayStr
    ).length;

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekCount = appts.filter(a => {
      const d = new Date(a.appointmentDate);
      return d >= weekStart && d <= weekEnd;
    }).length;

    const completedTotal = appts.filter(a => a.status === "COMPLETED").length;
    const pending        = appts.filter(a => a.status === "REQUESTED").length;

    return [
      { icon: "", label: "RDV aujourd'hui",    value: todayCount,     trend: 0 },
      { icon: "", label: "RDV cette semaine",   value: weekCount,      trend: 0 },
      { icon: "", label: "Consultations total",  value: completedTotal, trend: 0 },
      { icon: "", label: "En attente",           value: pending,        trend: pending > 0 ? pending : 0 },
    ];
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit() { this.loadData(); }

  ngAfterViewInit() {
    // Si loadData a déjà résolu l'URL avant qu'on arrive ici, on génère maintenant
    if (this.pendingQrUrl) {
      this.generateQr(this.pendingQrUrl);
      this.pendingQrUrl = null;
    }
  }

loadData() {
  this.isLoading.set(true);
  this.http.get<any>("/api/v1/medecins/me")
    .pipe(catchError(() => of(null)))
    .subscribe(res => {
      console.log("🔍 medecins/me:", JSON.stringify(res, null, 2));

      // ✅ Structure confirmée : res.data.id OU res.data.data.id
      const medecinData = res?.data?.data ?? res?.data ?? res;
      if (medecinData) this.medecin.set(medecinData);

      const id =
        res?.data?.data?.id ||
        res?.data?.id       ||
        res?.id             || null;

      if (!id) {
        this.isLoading.set(false);
        this.qrLoading.set(false);
        this.qrError.set("Identifiant médecin introuvable.");
        return;
      }

      this.doctorId = id;
      const url = `${window.location.origin}/medecin/scan/${id}`;
      this.profileUrl.set(url);

      // Charger les RDV
      this.http.get<any>(`/api/v1/appointments/doctor/${id}`)
        .pipe(catchError(() => of([])))
        .subscribe(appts => {
          const list: any[] =
            Array.isArray(appts)             ? appts :
            Array.isArray(appts?.data)       ? appts.data :
            Array.isArray(appts?.data?.data) ? appts.data.data : [];
          this.appointments.set(list);
          this.isLoading.set(false);
        });

     
      if (this.canvasRef?.nativeElement) {
        this.generateQr(url);
      } else {
        this.pendingQrUrl = url;
      }
    });
}

 
  private async generateQr(url: string) {
    this.qrLoading.set(true);
    this.qrError.set(null);
    try {
      const QRCode = (await import("qrcode")).default;
      const canvas = this.canvasRef?.nativeElement;
      if (!canvas) {
        this.qrError.set("Canvas introuvable.");
        this.qrLoading.set(false);
        return;
      }
      await QRCode.toCanvas(canvas, url, {
        width: 190,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      this.qrLoading.set(false);
    } catch (e) {
      this.qrError.set("Erreur génération QR. Vérifiez que 'qrcode' est installé.");
      this.qrLoading.set(false);
    }
  }

  
  downloadQr() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `qrcode-medecin-${this.doctorId}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  async copyUrl() {
    try {
      await navigator.clipboard.writeText(this.profileUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch { /* ignore */ }
  }

  printQr() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const data = canvas.toDataURL("image/png");
    const win  = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/>
      <title>QR Code — MediConnect</title>
      <style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;padding:40px;color:#0f172a}
      h1{font-size:20px;margin-bottom:4px}p{color:#64748b;font-size:13px;margin-bottom:20px}
      img{width:220px;height:220px;border:1px solid #e2e8f0;border-radius:12px;padding:8px}
      .url{margin-top:12px;font-size:11px;color:#4f46e5;word-break:break-all;max-width:280px;text-align:center}
      .note{margin-top:20px;font-size:11px;color:#94a3b8;text-align:center;max-width:280px}</style>
      </head><body>
      <h1> MediConnect</h1>
      <p>Profil Médecin Vérifié — ${this.medecin()?.firstName ?? ''} ${this.medecin()?.lastName ?? ''}</p>
      <img src="${data}" alt="QR Code"/>
      <div class="url">${this.profileUrl()}</div>
      <div class="note">Scannez pour accéder au profil vérifié du médecin</div>
      <script>window.onload=()=>{window.print();window.close();}<\/script>
      </body></html>`);
    win.document.close();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  getInitials(): string {
    const m = this.medecin();
    if (!m) return "M";
    return `${m.firstName?.[0] ?? ""}${m.lastName?.[0] ?? ""}`.toUpperCase();
  }

  getPatientName(a: any): string {
    const p = a.patient;
    if (!p) return "Patient";
    const prenom = p.prenom || p.firstName || p.first_name || "";
    const nom    = p.nom    || p.lastName  || p.last_name  || "";
    return `${prenom} ${nom}`.trim() || "Patient";
  }

  formatTime(d: any): string {
    return d ? new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
  }

  formatShortDate(d: any): string {
    if (!d) return "";
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  }

  getStatusLabel(s: string): string {
    return ({ CONFIRMED: "Confirmé", REQUESTED: "En attente", CANCELLED: "Annulé", COMPLETED: "Terminé" } as any)[s] || s;
  }

  getStatusClass(s: string): string {
    return ({ CONFIRMED: "status-confirmed", REQUESTED: "status-pending", CANCELLED: "status-cancelled", COMPLETED: "status-completed" } as any)[s] || "status-pending";
  }

  viewPatient(a: any) {
    const patientId = a.patientId || a.patient?.id;
    if (patientId) this.router.navigate(['/medecin/patients', patientId]);
  }

  today(): string {
    return new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
}
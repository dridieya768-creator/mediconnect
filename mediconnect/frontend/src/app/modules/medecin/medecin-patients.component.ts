import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

interface PatientSummary {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  rdvCount: number;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  status: "CONFIRMED" | "REQUESTED" | "CANCELLED" | "COMPLETED";
  consultationType: "PRESENTIEL" | "TELECONSULTATION";
  durationMinutes: number;
  reason?: string;
  patientId: string;
  patient?: any;
}

@Component({
  selector: "app-medecin-patients",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="patients-page">

      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">👥 Mes Patients</h1>
          <p class="page-subtitle">Patients ayant des rendez-vous confirmés avec vous</p>
        </div>
        <div class="header-actions">
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              #searchInput
              (input)="searchTerm.set(searchInput.value)"
              placeholder="Rechercher par nom, email..."
              class="search-input"
            />
          </div>
          <button class="btn-export" (click)="exportData()">📊 Exporter</button>
        </div>
      </div>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p>Chargement des patients...</p>
      </div>

      <div *ngIf="!isLoading()">

        <!-- STATS -->
        <div class="stats-row">
          <div class="stat-card indigo">
            <div class="stat-icon">👥</div>
            <div>
              <div class="stat-val">{{ patients().length }}</div>
              <div class="stat-label">Patients uniques</div>
            </div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon">✅</div>
            <div>
              <div class="stat-val">{{ confirmedCount() }}</div>
              <div class="stat-label">RDV confirmés</div>
            </div>
          </div>
          <div class="stat-card blue">
            <div class="stat-icon">✔️</div>
            <div>
              <div class="stat-val">{{ completedCount() }}</div>
              <div class="stat-label">Consultations terminées</div>
            </div>
          </div>
          <div class="stat-card orange">
            <div class="stat-icon">⏳</div>
            <div>
              <div class="stat-val">{{ pendingCount() }}</div>
              <div class="stat-label">En attente</div>
            </div>
          </div>
        </div>

        <!-- TABS -->
        <div class="tabs-bar">
          <button class="tab-btn" [class.active]="activeTab() === 'patients'" (click)="activeTab.set('patients')">
            👥 Patients <span class="tab-pill">{{ filteredPatients().length }}</span>
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'rdv'" (click)="activeTab.set('rdv')">
            📋 Tous les RDV <span class="tab-pill">{{ appointments().length }}</span>
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'upcoming'" (click)="activeTab.set('upcoming')">
            📅 À venir <span class="tab-pill">{{ upcomingList().length }}</span>
          </button>
        </div>

        <!-- ══ TAB PATIENTS ══ -->
        <div *ngIf="activeTab() === 'patients'">
          <div class="patients-grid" *ngIf="filteredPatients().length > 0">
            <div class="patient-card" *ngFor="let p of filteredPatients()" (click)="selectPatient(p)">
              <div class="patient-avatar">{{ getInitials(p) }}</div>
              <div class="patient-info">
                <div class="patient-name">{{ getFullName(p) }}</div>
                <div class="patient-email">{{ p.email }}</div>
                <div class="patient-phone" *ngIf="p.phone">📞 {{ p.phone }}</div>
                <div class="patient-rdv-count">
                  <span class="rdv-badge">{{ p.rdvCount }} RDV</span>
                </div>
              </div>
              <div class="patient-arrow">›</div>
            </div>
          </div>
          <div class="empty-state" *ngIf="filteredPatients().length === 0">
            <div style="font-size:48px">👥</div>
            <p>Aucun patient trouvé</p>
            <small *ngIf="searchTerm()">Essayez un autre terme de recherche</small>
            <small *ngIf="!searchTerm()">Vos patients apparaîtront ici après confirmation de RDV</small>
          </div>
        </div>

        <!-- ══ TAB RDV ══ -->
        <div *ngIf="activeTab() === 'rdv'">
          <div class="table-card">
            <table class="rdv-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Durée</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of filteredAppointments()" (click)="openAppt(a)" class="table-row">
                  <td>
                    <div class="appt-date">{{ formatDate(a.appointmentDate) }}</div>
                    <div class="appt-time">{{ formatTime(a.appointmentDate) }}</div>
                  </td>
                  <td><strong>{{ getApptPatientName(a) }}</strong></td>
                  <td class="email-cell">{{ getApptPatientEmail(a) }}</td>
                  <td>
                    <span class="type-badge">
                      {{ a.consultationType === 'TELECONSULTATION' ? '💻 Télé' : '🏥 Présentiel' }}
                    </span>
                  </td>
                  <td>{{ a.durationMinutes }} min</td>
                  <td>
                    <span class="status-pill" [ngClass]="getStatusClass(a.status)">
                      {{ getStatusLabel(a.status) }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="filteredAppointments().length === 0">
                  <td colspan="6" class="empty-state">Aucun RDV trouvé</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ══ TAB À VENIR ══ -->
        <div *ngIf="activeTab() === 'upcoming'">
          <div class="upcoming-list">
            <div class="upcoming-item" *ngFor="let a of upcomingList()">
              <div class="upcoming-date-block">
                <div class="upcoming-day">{{ formatDay(a.appointmentDate) }}</div>
                <div class="upcoming-time">{{ formatTime(a.appointmentDate) }}</div>
              </div>
              <div class="upcoming-sep"></div>
              <div class="upcoming-info">
                <div class="upcoming-name">{{ getApptPatientName(a) }}</div>
                <div class="upcoming-meta">
                  <span>{{ a.consultationType === 'TELECONSULTATION' ? '💻 Téléconsultation' : '🏥 Présentiel' }}</span>
                  <span>{{ a.durationMinutes }} min</span>
                </div>
              </div>
              <span class="status-pill" [ngClass]="getStatusClass(a.status)">
                {{ getStatusLabel(a.status) }}
              </span>
            </div>
            <div class="empty-state" *ngIf="upcomingList().length === 0">
              <div style="font-size:48px">📅</div>
              <p>Aucun RDV à venir</p>
            </div>
          </div>
        </div>

      </div>

      <!-- MODAL PATIENT DETAIL -->
      <ng-container *ngIf="selectedPatient() as p">
        <div class="modal-overlay" (click)="selectedPatient.set(null)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-head">
              <div class="modal-avatar">{{ getInitials(p) }}</div>
              <div>
                <div class="modal-name">{{ getFullName(p) }}</div>
                <div class="modal-email">{{ p.email }}</div>
              </div>
              <button class="btn-close" (click)="selectedPatient.set(null)">✕</button>
            </div>
            <div class="modal-body">
              <div class="detail-row" *ngIf="p.phone">
                <span class="detail-label">📞 Téléphone</span>
                <span>{{ p.phone }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Nombre de RDV</span>
                <span>{{ p.rdvCount }} rendez-vous</span>
              </div>
              <div class="detail-sub">Historique des RDV</div>
              <div class="patient-appt-list">
                <div class="patient-appt-item" *ngFor="let a of getPatientAppts(p.id)">
                  <span class="appt-date-sm">{{ formatDate(a.appointmentDate) }} {{ formatTime(a.appointmentDate) }}</span>
                  <span class="type-badge-sm">{{ a.consultationType === 'TELECONSULTATION' ? '💻' : '🏥' }}</span>
                  <span class="status-pill" [ngClass]="getStatusClass(a.status)">{{ getStatusLabel(a.status) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- MODAL RDV DETAIL -->
      <ng-container *ngIf="selectedAppt() as a">
        <div class="modal-overlay" (click)="selectedAppt.set(null)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-head">
              <div>
                <div class="modal-name">Détail du rendez-vous</div>
                <div class="modal-email">{{ formatDate(a.appointmentDate) }} à {{ formatTime(a.appointmentDate) }}</div>
              </div>
              <button class="btn-close" (click)="selectedAppt.set(null)">✕</button>
            </div>
            <div class="modal-body">
              <div class="detail-row">
                <span class="detail-label">👤 Patient</span>
                <span>{{ getApptPatientName(a) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📧 Email</span>
                <span>{{ getApptPatientEmail(a) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🏥 Type</span>
                <span>{{ a.consultationType === 'TELECONSULTATION' ? 'Téléconsultation' : 'Présentiel' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">⏱ Durée</span>
                <span>{{ a.durationMinutes }} min</span>
              </div>
              <div class="detail-row" *ngIf="a.reason">
                <span class="detail-label">📝 Motif</span>
                <span>{{ a.reason }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📌 Statut</span>
                <span class="status-pill" [ngClass]="getStatusClass(a.status)">
                  {{ getStatusLabel(a.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

    </div>
  `,
  styles: [`
    .patients-page { padding: 0; }

    /* ── Header ── */
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-title  { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-subtitle { color: #64748b; font-size: 14px; margin: 0; }
    .header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .search-wrap { position: relative; }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 14px; }
    .search-input { padding: 9px 12px 9px 32px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; width: 240px; outline: none; }
    .search-input:focus { border-color: #4f46e5; }
    .btn-export { padding: 9px 18px; background: white; color: #4f46e5; border: 1.5px solid #4f46e5; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }

    /* ── Loading ── */
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #64748b; gap: 12px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #4f46e5; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Stats ── */
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 16px 20px; display: flex; align-items: center; gap: 14px; }
    .stat-card.indigo { border-left: 4px solid #4f46e5; }
    .stat-card.green  { border-left: 4px solid #16a34a; }
    .stat-card.blue   { border-left: 4px solid #3b82f6; }
    .stat-card.orange { border-left: 4px solid #d97706; }
    .stat-icon { font-size: 26px; }
    .stat-val   { font-size: 22px; font-weight: 800; color: #0f172a; }
    .stat-label { font-size: 12px; color: #64748b; }

    /* ── Tabs ── */
    .tabs-bar { display: flex; gap: 8px; margin-bottom: 20px; }
    .tab-btn { padding: 8px 18px; border: 1.5px solid #e2e8f0; border-radius: 24px; background: white; font-size: 13px; cursor: pointer; color: #64748b; display: flex; align-items: center; gap: 6px; transition: all .15s; }
    .tab-btn.active { border-color: #4f46e5; color: #4f46e5; background: #eef2ff; font-weight: 600; }
    .tab-pill { background: #e2e8f0; color: #64748b; border-radius: 10px; padding: 1px 7px; font-size: 11px; }
    .tab-btn.active .tab-pill { background: #4f46e5; color: white; }

    /* ── Patients grid ── */
    .patients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
    .patient-card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all .15s; }
    .patient-card:hover { border-color: #4f46e5; box-shadow: 0 4px 16px rgba(79,70,229,.1); }
    .patient-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .patient-info { flex: 1; min-width: 0; }
    .patient-name  { font-size: 15px; font-weight: 700; color: #0f172a; }
    .patient-email { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
    .patient-phone { font-size: 12px; color: #64748b; margin-top: 2px; }
    .rdv-badge { background: #eef2ff; color: #4f46e5; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 600; margin-top: 4px; display: inline-block; }
    .patient-arrow { color: #94a3b8; font-size: 20px; }

    /* ── Table RDV ── */
    .table-card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; overflow: hidden; }
    .rdv-table { width: 100%; border-collapse: collapse; }
    .rdv-table th { padding: 12px 16px; background: #f8fafc; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .04em; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .rdv-table td { padding: 12px 16px; border-bottom: 1px solid #f8fafc; font-size: 14px; }
    .table-row { cursor: pointer; transition: background .1s; }
    .table-row:hover { background: #fafbff; }
    .appt-date { font-weight: 600; color: #0f172a; font-size: 13px; }
    .appt-time { font-size: 11px; color: #94a3b8; }
    .email-cell { color: #64748b; font-size: 12px; }
    .type-badge { background: #f1f5f9; color: #475569; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600; }

    /* ── Upcoming ── */
    .upcoming-list { display: flex; flex-direction: column; gap: 10px; }
    .upcoming-item { background: white; border-radius: 12px; border: 1.5px solid #e2e8f0; padding: 14px 18px; display: flex; align-items: center; gap: 16px; }
    .upcoming-date-block { text-align: center; min-width: 60px; }
    .upcoming-day  { font-size: 13px; font-weight: 700; color: #0f172a; }
    .upcoming-time { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .upcoming-sep  { width: 1px; height: 36px; background: #e2e8f0; flex-shrink: 0; }
    .upcoming-info { flex: 1; }
    .upcoming-name { font-size: 14px; font-weight: 600; color: #0f172a; }
    .upcoming-meta { display: flex; gap: 10px; font-size: 12px; color: #64748b; margin-top: 3px; }

    /* ── Status pills ── */
    .status-pill      { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }
    .status-confirmed { background: #f0fdf4; color: #16a34a; }
    .status-pending   { background: #fffbeb; color: #d97706; }
    .status-cancelled { background: #fef2f2; color: #dc2626; }
    .status-completed { background: #f1f5f9; color: #475569; }

    /* ── Empty state ── */
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; color: #94a3b8; gap: 8px; text-align: center; background: white; border-radius: 14px; }

    /* ── Modals ── */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
    .modal-card    { background: white; border-radius: 16px; width: 100%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,.2); overflow: hidden; }
    .modal-head    { display: flex; align-items: center; gap: 14px; padding: 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .modal-avatar  { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .modal-name    { font-size: 16px; font-weight: 700; color: #0f172a; }
    .modal-email   { font-size: 12px; color: #64748b; margin-top: 2px; }
    .btn-close     { margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
    .modal-body    { padding: 20px; }
    .detail-row    { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .detail-label  { color: #64748b; }
    .detail-sub    { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; margin: 16px 0 8px; }
    .patient-appt-list { display: flex; flex-direction: column; gap: 6px; }
    .patient-appt-item { display: flex; align-items: center; gap: 10px; padding: 8px; background: #f8fafc; border-radius: 8px; font-size: 12px; }
    .appt-date-sm  { flex: 1; color: #475569; }
    .type-badge-sm { font-size: 14px; }

    /* ── Responsive ── */
    @media (max-width: 1024px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) {
      .patients-grid { grid-template-columns: 1fr; }
      .rdv-table .email-cell { display: none; }
    }
  `]
})
export class MedecinPatientsComponent implements OnInit {
  private http = inject(HttpClient);

  appointments  = signal<Appointment[]>([]);
  patients      = signal<PatientSummary[]>([]);
  isLoading     = signal(true);
  searchTerm    = signal("");
  activeTab     = signal<"patients" | "rdv" | "upcoming">("patients");
  selectedPatient = signal<PatientSummary | null>(null);
  selectedAppt    = signal<Appointment | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredPatients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.patients();
    return this.patients().filter(p =>
      this.getFullName(p).toLowerCase().includes(term) ||
      (p.email || "").toLowerCase().includes(term) ||
      (p.phone || "").includes(term)
    );
  });

  confirmedCount = computed(() => this.appointments().filter(a => a.status === "CONFIRMED").length);
  completedCount = computed(() => this.appointments().filter(a => a.status === "COMPLETED").length);
  pendingCount   = computed(() => this.appointments().filter(a => a.status === "REQUESTED").length);

  filteredAppointments = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.appointments();
    return this.appointments().filter(a =>
      this.getApptPatientName(a).toLowerCase().includes(term) ||
      this.getApptPatientEmail(a).toLowerCase().includes(term)
    );
  });

  upcomingList = computed(() => {
    const now = new Date();
    return this.appointments()
      .filter(a => new Date(a.appointmentDate) >= now
               && (a.status === "CONFIRMED" || a.status === "REQUESTED"))
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
      .slice(0, 20);
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() { this.loadData(); }

  loadData() {
    this.isLoading.set(true);
    this.http.get<any>("/api/v1/medecins/me")
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        const doctorId = res?.data?.data?.id || res?.data?.id || res?.id || null;
        if (!doctorId) { this.isLoading.set(false); return; }

        // Charger les RDV (pour les tabs RDV et À venir)
        this.http.get<any>(`/api/v1/appointments/doctor/${doctorId}`)
          .pipe(catchError(() => of([])))
          .subscribe(appts => {
            const list: Appointment[] =
              Array.isArray(appts)             ? appts :
              Array.isArray(appts?.data)       ? appts.data :
              Array.isArray(appts?.data?.data) ? appts.data.data : [];
            this.appointments.set(list);
          });

        // ✅ Charger les patients filtrés par RDV CONFIRMED/COMPLETED
        this.http.get<any>("/api/v1/medecins/my-patients")
          .pipe(catchError(() => of([])))
          .subscribe(res => {
            const list: PatientSummary[] =
              Array.isArray(res)       ? res :
              Array.isArray(res?.data) ? res.data : [];
            this.patients.set(list);
            this.isLoading.set(false);
          });
      });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getFullName(p: PatientSummary): string {
    const first = p.firstName || "";
    const last  = p.lastName  || "";
    return `${first} ${last}`.trim() || p.email || "Patient";
  }

  getInitials(p: PatientSummary): string {
    const first = p.firstName?.[0] || p.email?.[0] || "P";
    const last  = p.lastName?.[0]  || "";
    return (first + last).toUpperCase();
  }

  getApptPatientName(a: Appointment): string {
    const p = a.patient;
    if (!p) return "Patient";
    const first = p.firstName || p.first_name || "";
    const last  = p.lastName  || p.last_name  || "";
    return `${first} ${last}`.trim() || p.email || "Patient";
  }

  getApptPatientEmail(a: Appointment): string {
    return a.patient?.email || "—";
  }

  getPatientAppts(patientId: string): Appointment[] {
    return this.appointments().filter(a => a.patientId === patientId);
  }

  selectPatient(p: PatientSummary) { this.selectedPatient.set(p); }
  openAppt(a: Appointment)         { this.selectedAppt.set(a); }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  }
  formatDay(d: string): string {
    return new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
  }
  formatTime(d: string): string {
    return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  getStatusLabel(s: string): string {
    return ({ CONFIRMED: "Confirmé", REQUESTED: "En attente", CANCELLED: "Annulé", COMPLETED: "Terminé" } as any)[s] || s;
  }
  getStatusClass(s: string): string {
    return ({ CONFIRMED: "status-confirmed", REQUESTED: "status-pending", CANCELLED: "status-cancelled", COMPLETED: "status-completed" } as any)[s] || "";
  }

  exportData() {
    const data = {
      patients:     this.patients(),
      appointments: this.appointments(),
      exportedAt:   new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `patients_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
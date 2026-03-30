import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "@core/services/auth.service";
import { AppointmentStatus } from "@core/models/appointment.model";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";

@Component({
  selector: "app-patient-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./patient-dashboard.component.html",
  styleUrls: ["./patient-dashboard.component.scss"],
})
export class PatientDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  currentUser = this.auth.currentUser;

  // État
  isLoading = signal(true);
  patient = signal<any>(null);
  appointments = signal<any[]>([]);
  prescriptions = signal<any[]>([]);
  qrCodeImage = signal<string | null>(null);
  qrDisplayId = signal<string>('');

  // Stats calculées depuis les vraies données
  stats = computed(() => ({
    appointments: this.appointments().filter(a =>
      a.status === AppointmentStatus.CONFIRMED &&
      new Date(a.appointmentDate) >= new Date()
    ).length,
    prescriptions: this.prescriptions().length,
    analyses: 0,   // à connecter quand le module analyses sera prêt
    documents: 0,  // à connecter quand le module documents sera prêt
  }));

  // RDV confirmés à venir (triés par date, max 5)
  upcomingAppointments = computed(() =>
    this.appointments()
      .filter(a => a.status === AppointmentStatus.CONFIRMED)
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
      .slice(0, 5)
  );

  // Ordonnances actives (max 3)
  activePrescriptions = computed(() =>
    this.prescriptions().slice(0, 3)
  );

  today = new Date();

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading.set(true);

    // 1. Charger le profil patient
    this.http.get<any>('/api/v1/patients/me').pipe(
      catchError(() => of(null))
    ).subscribe(response => {
      const outer = response?.data ?? response;
      const patient = outer?.data ?? outer;
      this.patient.set(patient);

      if (!patient?.id) {
        this.isLoading.set(false);
        return;
      }

      // 2. Charger en parallèle : RDV + Ordonnances + QR code
      forkJoin({
        appointments: this.http.get<any>(`/api/v1/appointments/patient/${patient.id}`).pipe(
          catchError(() => of({ data: [] }))
        ),
        prescriptions: this.http.get<any>(`/api/v1/prescriptions/patient/${patient.id}`).pipe(
          catchError(() => of({ data: [] }))
        ),
        qr: this.http.get<any>('/api/v1/patient/qr').pipe(
          catchError(() => of(null))
        ),
      }).subscribe(({ appointments, prescriptions, qr }) => {
        // Extraire les tableaux — TransformInterceptor wraps: { data: [...] }
        const apptList = appointments?.data ?? appointments;
        const rxList   = prescriptions?.data ?? prescriptions;
        this.appointments.set(Array.isArray(apptList) ? apptList : []);
        this.prescriptions.set(Array.isArray(rxList)   ? rxList   : []);

        if (qr) {
          const img = qr?.data?.qrImage || qr?.qrImage;
          const id = qr?.data?.displayId || qr?.displayId;
          if (img) this.qrCodeImage.set(img);
          if (id) this.qrDisplayId.set(id);
        }

        this.isLoading.set(false);
      });
    });
  }

  // ── Helpers dates ──────────────────────────────────────────
  formatDay(d: string): string {
    if (!d) return '--';
    return new Date(d).getDate().toString().padStart(2, '0');
  }

  formatMonth(d: string): string {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
  }

 getDoctorName(a: any): string {
  if (a.doctor) {
    const first = a.doctor.firstName || a.doctor.first_name || '';
    const last  = a.doctor.lastName  || a.doctor.last_name  || '';
    return `${first} ${last}`.trim() || 'Médecin';
  }
  return 'Médecin';
}

  getSpecialty(appt: any): string {
    return appt.medecin?.specialite || appt.doctor?.specialty || 'Médecin généraliste';
  }

  getConsultationType(appt: any): string {
    const type = appt.consultationType || appt.type;
    return type === 'VIDEO' ? '📹 Téléconsultation' : '🏥 Présentiel';
  }

  isVideo(appt: any): boolean {
    return appt.consultationType === 'VIDEO' || appt.type === 'VIDEO';
  }

  formatTime(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  // ── Statuts ────────────────────────────────────────────────
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      CONFIRMED: '✓ Confirmé',
      REQUESTED: '⏳ En attente',
      CANCELLED: '✕ Annulé',
      COMPLETED: '✔ Terminé',
      NO_SHOW: '⚠ Absent',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      CONFIRMED: 'status-confirmed',
      REQUESTED: 'status-pending',
      CANCELLED: 'status-cancelled',
      COMPLETED: 'status-completed',
      NO_SHOW: 'status-cancelled',
    };
    return classes[status] || 'status-pending';
  }

  // ── QR Code ────────────────────────────────────────────────
  downloadQr() {
    const img = this.qrCodeImage();
    if (!img) return;
    const a = document.createElement('a');
    a.href = img;
    a.download = `mediconnect-qr-${this.qrDisplayId()}.png`;
    a.click();
  }

  downloadPdf() {
    this.http.get('/api/v1/patient/qr/pdf', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mediconnect-qr-${this.qrDisplayId()}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('PDF error:', err)
    });
  }

  printQr() {
    const img = this.qrCodeImage();
    const user = this.currentUser();
    if (!img) return;

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <!DOCTYPE html><html><head>
        <title>QR Code — MediConnect</title>
        <style>
          body { font-family: Arial, sans-serif; display:flex; justify-content:center; align-items:center; min-height:100vh; margin:0; background:#f8fafc; }
          .card { background:white; border-radius:16px; padding:32px; text-align:center; box-shadow:0 4px 24px rgba(0,0,0,.1); max-width:320px; }
          .logo { font-size:22px; font-weight:bold; color:#0f172a; margin-bottom:4px; }
          .subtitle { color:#64748b; font-size:12px; margin-bottom:24px; }
          img { width:200px; height:200px; margin:0 auto 20px; display:block; border:1px solid #e2e8f0; border-radius:8px; padding:8px; }
          .name { font-size:20px; font-weight:bold; color:#0f172a; margin-bottom:12px; }
          .info { color:#475569; font-size:13px; margin:6px 0; }
          .footer { margin-top:20px; font-size:11px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:12px; }
        </style>
      </head><body>
        <div class="card">
          <div class="logo">🏥 MediConnect</div>
          <div class="subtitle">Carte d'identification patient</div>
          <img src="${img}" alt="QR Code" />
          <div class="name">${user?.firstName || ''} ${user?.lastName || ''}</div>
          <div class="info">📧 ${user?.email || ''}</div>
          <div class="info">${this.qrDisplayId()}</div>
          <div class="footer">Présentez ce QR code lors de vos consultations<br><strong>Code personnel et confidentiel</strong></div>
        </div>
      </body></html>
    `);
    printWindow?.document.close();
    setTimeout(() => { printWindow?.focus(); printWindow?.print(); }, 500);
  }
}
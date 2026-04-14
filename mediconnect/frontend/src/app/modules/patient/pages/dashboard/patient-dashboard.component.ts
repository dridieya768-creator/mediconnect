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

  topSpecialites = [
    { value: 'CARDIOLOGUE',          label: 'Cardiologie',          desc: 'Soins du cœur.',           image: 'assets/images/cardio.jpg' },
    { value: 'GYNECOLOGUE',          label: 'Gynécologie',          desc: 'Santé reproductive.',       image: 'assets/images/gyneco.jpg' },
    { value: 'PEDIATRE',             label: 'Pédiatrie',            desc: 'Soins des enfants.',        image: 'assets/images/pediatrie.jpg' },
    { value: 'NEUROLOGUE',           label: 'Neurologie',           desc: 'Système nerveux.',          image: 'assets/images/neuro.jpg' },
    { value: 'OPHTALMOLOGUE',        label: 'Ophtalmologie',        desc: 'Soins des yeux.',           image: 'assets/images/ophtalmo.jpg' },
    { value: 'DERMATOLOGUE',         label: 'Dermatologie',         desc: 'Soins de la peau.',         image: 'assets/images/dermato.jpg' },
    { value: 'CHIRURGIEN_PLASTICIEN',label: 'Chirurgie Plastique',  desc: 'Chirurgie esthétique.',     image: 'assets/images/plastique.jpg' },
    { value: 'DENTISTE',             label: 'Dentisterie',          desc: 'Soins dentaires.',          image: 'assets/images/dentiste.jpg' },
    { value: 'URGENTISTE',           label: 'Urgences',             desc: 'Soins d\'urgence.',         image: 'assets/images/urgences.jpg' },
    { value: 'MEDECIN_FAMILLE',      label: 'Médecin de famille',   desc: 'Médecine générale.',        image: 'assets/images/famille.jpg' },
    { value: 'ORL',                  label: 'ORL',                  desc: 'Oreille, nez, gorge.',      image: 'assets/images/orl.jpg' },
    { value: 'PSYCHIATRE',           label: 'Psychiatrie',          desc: 'Santé mentale.',            image: 'assets/images/psychiatrie.jpg' },
    { value: 'RADIOLOGUE_SPEC',      label: 'Radiologie',           desc: 'Imagerie médicale.',        image: 'assets/images/radio.jpg' },
    { value: 'RHUMATOLOGUE',         label: 'Rhumatologie',         desc: 'Articulations et os.',      image: 'assets/images/rhumato.jpg' },
    { value: 'UROLOGUE',             label: 'Urologie',             desc: 'Voies urinaires.',          image: 'assets/images/urologie.jpg' },
    { value: 'CHIRURGIEN',           label: 'Chirurgie',            desc: 'Interventions chirurgicales.', image: 'assets/images/chirurgie.jpg' },
    { value: 'ANESTHESISTE',         label: 'Anesthésie',           desc: 'Anesthésie et réanimation.', image: 'assets/images/anesthesie.jpg' },
    { value: 'ENDOCRINOLOGUE',       label: 'Endocrinologie',       desc: 'Hormones et métabolisme.',  image: 'assets/images/endocrino.jpg' },
    { value: 'GASTROLOGUE',          label: 'Gastro-entérologie',   desc: 'Système digestif.',         image: 'assets/images/gastro.jpg' },
    { value: 'NEPHROLOGUE',          label: 'Néphrologie',          desc: 'Soins des reins.',          image: 'assets/images/nephro.jpg' },
    { value: 'ONCOLOGUE',            label: 'Oncologie',            desc: 'Traitement du cancer.',     image: 'assets/images/onco.jpg' },
    { value: 'PNEUMOLOGUE',          label: 'Pneumologie',          desc: 'Poumons et respiration.',   image: 'assets/images/pneumo.jpg' },
  ];

  topProcedures = [
    { label: 'Liposuccion',              desc: 'Chirurgie pour éliminer les graisses localisées.',          image: 'assets/images/proc/liposuccion.jpg' },
    { label: 'Augmentation Mammaire',    desc: 'Chirurgie pour augmenter le volume des seins.',             image: 'assets/images/proc/mammaire.jpg' },
    { label: 'Rhinoplastie',             desc: 'Chirurgie de correction du nez.',                           image: 'assets/images/proc/rhinoplastie.jpg' },
    { label: 'Abdominoplastie',          desc: 'Chirurgie pour retendre la paroi abdominale.',              image: 'assets/images/proc/abdominoplastie.jpg' },
    { label: 'Blépharoplastie',          desc: 'Chirurgie des paupières pour un regard rajeuni.',           image: 'assets/images/proc/blepharoplastie.jpg' },
  ];

  allServices = [
    { label: 'Chirurgie Plastique', icon: '✂️', desc: 'Chirurgie esthétique et reconstructrice.', color: '#fef3c7', image: 'assets/images/service-plastique.jpg' },
    { label: 'Fertilité/FIV', icon: '🤰', desc: 'Traitement de l\'infertilité et procréation.', color: '#fce7f3', image: 'assets/images/service-fiv.jpg' },
    { label: 'Greffe de Cheveux', icon: '💇', desc: 'Techniques FUE, DHI, Saphir FUE.', color: '#dbeafe', image: 'assets/images/service-cheveux.jpg' },
    { label: 'Chirurgie Orthopédique', icon: '🦴', desc: 'Prothèse de hanche, genou, colonne.', color: '#d1fae5', image: 'assets/images/service-ortho.jpg' },
    { label: 'Dentisterie', icon: '🦷', desc: 'Soins dentaires et implants.', color: '#ede9fe', image: 'assets/images/service-dentiste.jpg' },
    { label: 'Traitement du Cancer', icon: '🎗️', desc: 'Oncologie et soins palliatifs.', color: '#fee2e2', image: 'assets/images/service-cancer.jpg' },
    { label: 'Chirurgie Bariatrique', icon: '⚖️', desc: 'Sleeve, bypass gastrique.', color: '#fef3c7', image: 'assets/images/service-baria.jpg' },
    { label: 'Neurologie', icon: '🧠', desc: 'Traitement des maladies neurologiques.', color: '#ede9fe', image: 'assets/images/service-neuro.jpg' },
    { label: 'Cardiologie', icon: '❤️', desc: 'Chirurgie cardiaque et coronaire.', color: '#fee2e2', image: 'assets/images/service-cardio.jpg' },
    { label: 'Greffe d\'Organe', icon: '🫀', desc: 'Transplantation rénale, hépatique.', color: '#d1fae5', image: 'assets/images/service-greffe.jpg' },
  ];

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
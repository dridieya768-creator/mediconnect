import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, debounceTime, distinctUntilChanged, Subject, switchMap, of } from "rxjs";

type ViewMode = "list" | "new" | "detail" | "cancel" | "rate";
type FilterTab = "upcoming" | "past" | "all";

@Component({
  selector: "app-patient-appointments",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.scss'],
})
export class PatientAppointmentsComponent implements OnInit {
  private http   = inject(HttpClient);
  private router = inject(Router);

  slotTakenError = signal(false);
  view         = signal<ViewMode>("list");
  filterTab    = signal<FilterTab>("upcoming");
  isLoading    = signal(true);
  isCreating   = signal(false);
  isCancelling = signal(false);
  isRating     = signal(false);
  successMsg   = signal<string | null>(null);
  errorMsg     = signal<string | null>(null);

  patientId      = signal<string | null>(null);
  appointments   = signal<any[]>([]);
  doctors        = signal<any[]>([]);
  selectedAppt   = signal<any>(null);
  selectedDoctor = signal<any>(null);
  doctorConges   = signal<any[]>([]);
  selectedSlot   = signal<string | null>(null);

  searchQuery     = "";
  searchSpecialty = "";
  searchLoading   = signal(false);
  private searchSubject = new Subject<string>();

  specialties = [
    "Cardiologue","Dermatologue","Urgentiste","Médecin de famille",
    "Gynécologue","Neurologue","Ophtalmologue","ORL","Pédiatre",
    "Psychiatre","Radiologue","Rhumatologue","Urologue"
  ];

  currentWeekStart = signal<Date>(this.getMonday(new Date()));

  newAppt       = { consultationType: "PHYSICAL", durationMinutes: 30, reason: "" };
  cancelReason  = "";
  cancelNote    = "";
  rating        = signal(0);
  hoverRating   = signal(0);
  ratingComment = "";

  upcomingCount = computed(() => this.appointments().filter(a => this.isUpcoming(a)).length);
  pastCount     = computed(() => this.appointments().filter(a => !this.isUpcoming(a)).length);

  filteredAppointments = computed(() => {
    const tab = this.filterTab();
    const all = this.appointments();
    if (tab === "upcoming") return all.filter(a => this.isUpcoming(a));
    if (tab === "past")     return all.filter(a => !this.isUpcoming(a));
    return all;
  });

  slotDays = computed(() => {
    const start = new Date(this.currentWeekStart());
    const _conges = this.doctorConges();
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        date:  d.getDate().toString(),
        slots: this.generateSlots(d),
      };
    });
  });

  ngOnInit() {
    this.loadPatient();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q && !this.searchSpecialty) {
          this.doctors.set([]);
          return of(null);
        }
        this.searchLoading.set(true);
        const params: any = {};
        if (q) params["search"] = q;
        if (this.searchSpecialty) params["specialite"] = this.searchSpecialty;
        return this.http.get<any>("/api/v1/medecins", { params })
          .pipe(catchError(() => of({ data: [] })));
      })
    ).subscribe(res => {
      if (res) {
        const list: any[] = res?.data?.data ?? res?.data ?? (Array.isArray(res) ? res : []);
        const normalized = list.map((doc: any) => ({
          ...doc,
          firstName:        doc.firstName   || doc.first_name  || '',
          lastName:         doc.lastName    || doc.last_name   || '',
          ville:            doc.profile?.ville       || doc.ville       || '',
          specialite:       doc.profile?.specialite  || doc.specialite  || '',
          teleconsultation: doc.profile?.disponTeleconsult ?? doc.teleconsultation ?? false,
          avatarUrl:        doc.profile?.photoPro    || doc.avatarUrl   || null,
        }));
        this.doctors.set(normalized);
      }
      this.searchLoading.set(false);
    });
  }

  private normalizeList(res: any): any[] {
    if (Array.isArray(res))             return res;
    if (Array.isArray(res?.data))       return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  }

  loadPatient() {
    this.isLoading.set(true);
    this.http.get<any>("/api/v1/patients/me")
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        const patient = res?.data ?? res;
        const patientUserId = patient?.userId ?? patient?.id;
        if (!patientUserId) {
          this.isLoading.set(false);
          return;
        }
        this.patientId.set(patientUserId);
        this.http.get<any>(`/api/v1/appointments/patient/${patientUserId}`)
          .pipe(catchError(() => of([])))
          .subscribe(appts => {
            const list = this.normalizeList(appts);
            this.appointments.set(
              list.sort((a: any, b: any) =>
                new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
              )
            );
            this.isLoading.set(false);
          });
      });
  }

  showView(v: ViewMode) {
    this.view.set(v);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    if (v === "new") {
      this.selectedDoctor.set(null);
      this.selectedSlot.set(null);
      this.newAppt = { consultationType: "PHYSICAL", durationMinutes: 30, reason: "" };
      this.searchQuery     = "";
      this.searchSpecialty = "";
      this.doctors.set([]);
    }
  }

  setFilter(f: FilterTab) { this.filterTab.set(f); }
  openDetail(appt: any)   { this.selectedAppt.set(appt); this.showView("detail"); }
  openCancel(appt: any)   { this.selectedAppt.set(appt); this.cancelReason = ""; this.cancelNote = ""; this.showView("cancel"); }
  openRate(appt: any)     { this.selectedAppt.set(appt); this.rating.set(0); this.ratingComment = ""; this.showView("rate"); }

  onSearchChange(q: string) { this.searchSubject.next(q); }

  searchDoctors() {
    if (!this.searchQuery && !this.searchSpecialty) { this.doctors.set([]); return; }
    this.searchSubject.next(this.searchQuery);
  }

  selectDoctor(doc: any) {
    this.selectedDoctor.set(doc);
    this.selectedSlot.set(null);
    this.currentWeekStart.set(this.getMonday(new Date()));
    const doctorId = doc.userId || doc.id;
    this.http.get<any>('/api/v1/medecins/' + doctorId + '/availability')
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        const data = res?.data ?? res;
        this.doctorConges.set(data?.conges ?? []);
        this.currentWeekStart.set(this.getMonday(new Date()));
      });
  }

  isDateInConge(date: Date): boolean {
    const d = new Date(date); d.setHours(0,0,0,0);
    return this.doctorConges().some(c => {
      const start = new Date(c.startDate); start.setHours(0,0,0,0);
      const end   = new Date(c.endDate);   end.setHours(23,59,59,999);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
      if (start.getFullYear() < 2000 || end.getFullYear() < 2000) return false;
      return d >= start && d <= end;
    });
  }

  generateSlots(date: Date): { time: string; datetime: string; taken: boolean }[] {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date < today || this.isDateInConge(date)) return [];
    const times = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30","16:00","16:30"];
    return times.map(t => {
      const dt = new Date(date);
      const [h, m] = t.split(":");
      dt.setHours(+h, +m, 0, 0);
      return { time: t, datetime: dt.toISOString(), taken: Math.random() < 0.25 };
    });
  }

  selectSlot(datetime: string) { this.selectedSlot.set(datetime); }

  prevWeek() {
    const d = new Date(this.currentWeekStart());
    d.setDate(d.getDate() - 7);
    if (d >= this.getMonday(new Date())) this.currentWeekStart.set(d);
  }

  nextWeek() {
    const d = new Date(this.currentWeekStart());
    d.setDate(d.getDate() + 7);
    this.currentWeekStart.set(d);
  }

  createAppointment() {
    const doc       = this.selectedDoctor();
    const slot      = this.selectedSlot();
    const patientId = this.patientId();
    if (!doc || !slot || !patientId) return;
    this.isCreating.set(true);
    const payload = {
      patientId,
      doctorId:         doc.userId || doc.id,
      appointmentDate:  slot,
      durationMinutes:  +this.newAppt.durationMinutes,
      consultationType: this.newAppt.consultationType,
      reason:           this.newAppt.reason,
    };
    this.http.post<any>("/api/v1/appointments", payload).subscribe({
      next: (res) => {
        const appt = res?.data ?? res;
        this.appointments.update(list =>
          [appt, ...list].sort((a, b) =>
            new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
          )
        );
        this.isCreating.set(false);
        this.successMsg.set("Rendez-vous confirmé avec succès !");
        this.showView("list");
        setTimeout(() => this.successMsg.set(null), 4000);
      },
      error: (err: any) => {
        this.isCreating.set(false);
        const raw = err?.error?.message;
        const msg = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : err?.message || '';
        const isSlotTaken = msg.toLowerCase().includes('conflict')
                         || msg.toLowerCase().includes('créneau')
                         || msg.toLowerCase().includes('déjà')
                         || msg.toLowerCase().includes('taken')
                         || err?.status === 409;
        this.slotTakenError.set(isSlotTaken);
        if (!isSlotTaken) {
          this.errorMsg.set(msg || "Erreur lors de la création du RDV.");
          setTimeout(() => this.errorMsg.set(null), 5000);
        }
      }
    });
  }

  confirmCancel() {
    const appt = this.selectedAppt();
    if (!appt || !this.cancelReason) return;
    this.isCancelling.set(true);
    const reason = this.cancelNote ? `${this.cancelReason} — ${this.cancelNote}` : this.cancelReason;
    this.http.patch<any>(`/api/v1/appointments/${appt.id}/cancel`, { reason }).subscribe({
      next: () => {
        this.appointments.update(list =>
          list.map(a => a.id === appt.id ? { ...a, status: "CANCELLED", cancellationReason: reason } : a)
        );
        this.isCancelling.set(false);
        this.successMsg.set("RDV annulé avec succès.");
        this.showView("list");
        setTimeout(() => this.successMsg.set(null), 4000);
      },
      error: () => {
        this.isCancelling.set(false);
        this.errorMsg.set("Erreur lors de l'annulation.");
        setTimeout(() => this.errorMsg.set(null), 5000);
      }
    });
  }

  submitRating() {
    const appt = this.selectedAppt();
    if (!appt || !this.rating()) return;
    this.isRating.set(true);
    this.http.post<any>(`/api/v1/appointments/${appt.id}/rate`, {
      rating: this.rating(),
      comment: this.ratingComment
    }).pipe(catchError(() => of(null))).subscribe(() => {
      this.appointments.update(list =>
        list.map(a => a.id === appt.id ? { ...a, rated: true } : a)
      );
      this.isRating.set(false);
      this.successMsg.set("Merci pour votre évaluation !");
      this.showView("list");
      setTimeout(() => this.successMsg.set(null), 4000);
    });
  }

  joinVideo(appt: any) {
    this.router.navigate(['/patient/video', appt.id]);
  }

  isUpcoming(a: any): boolean {
    return new Date(a.appointmentDate) > new Date() && a.status !== "CANCELLED";
  }
  canCancel(a: any): boolean {
    return a.status === "CONFIRMED" || a.status === "REQUESTED";
  }
  isVideo(a: any): boolean { return a.consultationType === "TELECONSULTATION"; }

  getDoctorName(a: any): string {
    return a.doctor?.lastName || a.doctor?.last_name || a.medecin?.user?.last_name || "Médecin";
  }
  getSpecialty(a: any): string {
    return a.medecin?.specialite || a.doctor?.specialty || "Médecin généraliste";
  }
  getInitials(doc: any): string {
    const f = (doc.firstName || doc.first_name || "")[0] || "";
    const l = (doc.lastName  || doc.last_name  || "")[0] || "";
    return (f + l).toUpperCase();
  }

  formatDay(d: any):      string { return d ? new Date(d).getDate().toString().padStart(2, "0") : "--"; }
  formatMonth(d: any):    string { return d ? new Date(d).toLocaleDateString("fr-FR", { month: "short" }).toUpperCase() : "--"; }
  formatYear(d: any):     string { return d ? new Date(d).getFullYear().toString() : ""; }
  formatTime(d: any):     string { return d ? new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""; }
  formatFullDate(d: any): string {
    if (!d) return "";
    return new Date(d).toLocaleDateString("fr-FR", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })
         + " à " + this.formatTime(d);
  }

  getStatusLabel(s: string): string {
    return ({ CONFIRMED:"✓ Confirmé", REQUESTED:" En attente", CANCELLED:"✕ Annulé", COMPLETED:"✔ Terminé", NO_SHOW:"⚠ Absent" } as any)[s] || s;
  }
  getStatusClass(s: string): string {
    return ({ CONFIRMED:"status-confirmed", REQUESTED:"status-pending", CANCELLED:"status-cancelled", COMPLETED:"status-completed", NO_SHOW:"status-cancelled" } as any)[s] || "status-pending";
  }
  getTypeLabel(t: string): string {
    return ({ PHYSICAL:" Présentiel", TELECONSULTATION:" Téléconsultation", HOME_VISIT:" À domicile" } as any)[t] || t;
  }
  getRatingLabel(): string {
    return ([""," Très déçu"," Décevant"," Correct"," Bien"," Excellent !"] as any)[this.hoverRating() || this.rating()] || "";
  }

  getMonday(d: Date): Date {
    const date = new Date(d);
    const day  = date.getDay();
    date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
    date.setHours(0, 0, 0, 0);
    return date;
  }
}

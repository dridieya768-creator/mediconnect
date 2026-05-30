import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MedecinAvailabilityService } from '../../../../../core/services/medecin-availability.service';
import { BookingStateService } from '../../../../../core/services/booking-state.service';
import { AppointmentService } from '../../../../../core/services/appointment.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { AvailabilityConfig, OccupiedSlot } from '../../../../../core/models/medecin-availability.model';
import { ConsultationType } from '../../../../../core/models/appointment.model';
import { WeeklyCalendarComponent } from '../weekly-calendar/weekly-calendar.component';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { profile } from 'console';

@Component({
  selector: 'app-book-appointment-panel',
  standalone: true,
  imports: [CommonModule, WeeklyCalendarComponent, AppointmentFormComponent],
  template: `
    <!-- Overlay backdrop -->
    <div
      class="overlay"
      *ngIf="medecin"
      (click)="onClose()"
      aria-hidden="true"
    ></div>

    
    <div class="panel" *ngIf="medecin" role="dialog" aria-modal="true" [attr.aria-label]="'Prendre rendez-vous avec ' + doctorFullName">

      
      <div class="panel-header">
        <div class="doctor-info">
          <img
            *ngIf="doctorPhoto"
            [src]="doctorPhoto"
            [alt]="doctorFullName"
            class="doctor-avatar"
          />
          <div class="doctor-avatar-placeholder" *ngIf="!doctorPhoto">
            {{ doctorInitials }}
          </div>
          <div class="doctor-details">
            <h2 class="doctor-name">{{ doctorFullName }}</h2>
            <span class="doctor-specialty" *ngIf="medecin.specialite">{{ medecin.specialite }}</span>
          </div>
        </div>
        <button class="close-btn" (click)="onClose()" aria-label="Fermer le panneau">fermer</button>
      </div>

      <!-- Error message -->
      <div class="error-banner" *ngIf="errorMessage()">
        <span class="error-icon"></span>
        <span>{{ errorMessage() }}</span>
        <button class="error-dismiss" (click)="errorMessage.set(null)" aria-label="Fermer le message d'erreur">fermer</button>
      </div>

      <!-- Loading state for availability -->
      <div class="loading-state" *ngIf="loadingAvailability()">
        <div class="spinner" aria-hidden="true"></div>
        <span>Chargement des disponibilities...</span>
      </div>

      <!-- Content -->
      <div class="panel-content" *ngIf="!loadingAvailability()">

        <!-- Weekly Calendar -->
        <section class="calendar-section">
          <h3 class="section-title">Choisissez un créneau</h3>
          <app-weekly-calendar
            [availability]="availability()"
            [occupiedSlots]="occupiedSlots()"
            [conges]="conges()"
            (slotSelected)="onSlotSelected($event)"
          ></app-weekly-calendar>
        </section>

        <!-- Appointment Form -->
        <section class="form-section">
          <app-appointment-form
            [medecin]="medecin"
            [availability]="availability()"
            [isLoading]="bookingState.isLoading()"
            (confirmed)="onConfirmed($event)"
            (cancelled)="onClose()"
          ></app-appointment-form>
        </section>

      </div>
    </div>
  `,
  styles: [`
    /* Overlay */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      animation: fadeIn .2s ease;
    }

    /* Panel */
    .panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 100%;
      max-width: 680px;
      height: 100vh;
      background: white;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
      animation: slideIn .25s ease;
      overflow: hidden;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    /* Header */
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1.5px solid #e5e7eb;
      background: #f8fafc;
      flex-shrink: 0;
    }

    .doctor-info {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .doctor-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
      border: 2.5px solid #1a56db;
      flex-shrink: 0;
    }

    .doctor-avatar-placeholder {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #1a56db;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .doctor-details {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .doctor-name {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .doctor-specialty {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1.5px solid #e5e7eb;
      background: white;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .15s, color .15s;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fca5a5;
    }

    /* Error banner */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      background: #fef2f2;
      border-bottom: 1.5px solid #fca5a5;
      color: #991b1b;
      font-size: 14px;
      flex-shrink: 0;
    }

    .error-icon { font-size: 16px; }

    .error-dismiss {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      color: #991b1b;
      font-size: 18px;
      line-height: 1;
      padding: 0 4px;
    }

    /* Loading state */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex: 1;
      color: #64748b;
      font-size: 14px;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: #1a56db;
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Content */
    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 14px;
    }

    .calendar-section,
    .form-section {
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 640px) {
      .panel {
        max-width: 100%;
      }
    }
  `],
})
export class BookAppointmentPanelComponent implements OnChanges {
  @Input() medecin: any | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() booked = new EventEmitter<void>();

  private availabilityService = inject(MedecinAvailabilityService);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  bookingState = inject(BookingStateService);

  availability = signal<AvailabilityConfig | null>(null);
  occupiedSlots = signal<OccupiedSlot[]>([]);
  conges = signal<any[]>([]);
  loadingAvailability = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    
    effect(() => {
      const _week = this.bookingState.currentWeekStart(); 
      const medecinId = this.medecin?.id ?? this.medecin?.userId;
      if (medecinId && this.availability()) {
        this.loadOccupiedSlots(medecinId);
      }
    });
  }

  get doctorFullName(): string {
    if (!this.medecin) return '';
    const prenom = this.medecin.prenom ?? this.medecin.firstName ?? '';
    const nom = this.medecin.nom ?? this.medecin.lastName ?? this.medecin.name ?? '';
    return `Dr. ${prenom} ${nom}`.trim();
  }

  get doctorPhoto(): string | null {
  const photo =
    this.medecin?.profile?.photoPro ??
    this.medecin?.profile?.photoUrl ??
    null;

  return photo ? String(photo) : null;
}
  get doctorInitials(): string {
    const prenom = this.medecin?.prenom ?? this.medecin?.firstName ?? '';
    const nom = this.medecin?.nom ?? this.medecin?.lastName ?? '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['medecin']) {
      if (this.medecin) {
        this.bookingState.reset();
        this.errorMessage.set(null);
        this.loadAvailabilityData();
      } else {
        this.availability.set(null);
        this.occupiedSlots.set([]);
        this.conges.set([]);
      }
    }
  }

  private loadAvailabilityData(): void {
    const medecinId = this.medecin?.id ?? this.medecin?.userId;
    if (!medecinId) return;

    this.loadingAvailability.set(true);
    this.errorMessage.set(null);

    this.availabilityService.getAvailability(medecinId).subscribe({
      next: (config) => {
        console.log('[BookPanel] availability from API:', JSON.stringify(config));
        this.availability.set(config);
        this.conges.set((config as any).conges ?? []);
        this.bookingState.durationMinutes.set(config.defaultDuration ?? 30);
        this.loadOccupiedSlots(medecinId);
      },
      error: () => {
        this.loadingAvailability.set(false);
        this.errorMessage.set('Impossible de charger les disponibilitÃ©s du mÃ©decin.');
      },
    });
  }

  private loadOccupiedSlots(medecinId: string): void {
    const weekStart = this.bookingState.currentWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startDate = this.formatDate(weekStart);
    const endDate = this.formatDate(weekEnd);

    this.availabilityService.getOccupiedSlots(medecinId, startDate, endDate).subscribe({
      next: (slots) => {
        this.occupiedSlots.set(slots);
        this.loadingAvailability.set(false);
      },
      error: () => {
        this.occupiedSlots.set([]);
        this.loadingAvailability.set(false);
      },
    });
  }

  onSlotSelected(_date: Date): void {
    
    this.errorMessage.set(null);
  }

  onConfirmed(formData: { consultationType: string; durationMinutes: number; reason: string; beneficiaryId?: string | null; beneficiaryNom?: string | null; beneficiaryPrenom?: string | null }): void {
    const selectedSlot = this.bookingState.selectedSlot();
    if (!selectedSlot) return;
    if (!this.authService.currentUser()) return;

    const medecinId = this.medecin?.id ?? this.medecin?.userId;
    this.bookingState.isLoading.set(true);
    this.errorMessage.set(null);

    
    this.http.get<any>('/api/v1/patients/me').subscribe({
      next: (res) => {
        const outer = res?.data ?? res;
        const profile = outer?.data ?? outer;
        const patientId = profile?.userId ?? profile?.id;

        if (!patientId) {
          this.bookingState.isLoading.set(false);
          this.errorMessage.set('Profil patient introuvable. Veuillez vous reconnecter.');
          return;
        }

        this.appointmentService.create({
          patientId,
          doctorId: medecinId,
          appointmentDate: selectedSlot,
          durationMinutes: formData.durationMinutes,
          consultationType: formData.consultationType as ConsultationType,
          reason: formData.reason || undefined,
          beneficiaryId: formData.beneficiaryId || undefined,
          beneficiaryNom: formData.beneficiaryNom || undefined,
          beneficiaryPrenom: formData.beneficiaryPrenom || undefined,
        }).subscribe({
          next: () => {
            this.bookingState.isLoading.set(false);
            this.booked.emit();
            this.bookingState.reset();
            this.closed.emit();
          },
          error: (err: HttpErrorResponse) => {
            this.bookingState.isLoading.set(false);
            if (err.status === 400) {
              this.errorMessage.set('Ce créneau est deja réservé. Veuillez en choisir un autre.');
              const id = this.medecin?.id ?? this.medecin?.userId;
              if (id) this.loadOccupiedSlots(id);
            } else {
              this.errorMessage.set('Une erreur est survenue. Veuillez rÃ©essayer.');
            }
          },
        });
      },
      error: () => {
        this.bookingState.isLoading.set(false);
        this.errorMessage.set('Impossible de recuperer votre profil patient.');
      }
    });
  }

  onClose(): void {
    this.closed.emit();
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}







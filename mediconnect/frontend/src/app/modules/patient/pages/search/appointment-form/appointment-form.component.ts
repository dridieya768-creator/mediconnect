import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BookingStateService } from '../../../../../core/services/booking-state.service';
import { AvailabilityConfig } from '../../../../../core/models/medecin-availability.model';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="appointment-form">

      <!-- Récapitulatif créneau sélectionné -->
      <div class="summary-card" *ngIf="selectedSlot()">
        <h3 class="summary-title">Récapitulatif</h3>
        <div class="summary-grid">
          <div class="summary-item" *ngIf="medecin">
            <span class="summary-label">Médecin</span>
            <div class="summary-doctor">
              <img
                *ngIf="medecin.photo"
                [src]="medecin.photo"
                [alt]="medecin.nom"
                class="doctor-avatar"
              />
              <div>
                <span class="summary-value">{{ medecin.nom }}</span>
                <span class="summary-specialty" *ngIf="medecin.specialite">{{ medecin.specialite }}</span>
              </div>
            </div>
          </div>
          <div class="summary-item">
            <span class="summary-label">Date et heure</span>
            <span class="summary-value">{{ selectedSlot() | date:'EEEE d MMMM yyyy à HH:mm':'':'fr' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Type</span>
            <span class="summary-value">{{ consultationTypeLabel }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Durée</span>
            <span class="summary-value">{{ form.get('durationMinutes')?.value }} min</span>
          </div>
        </div>
      </div>

      <!-- Message aucun créneau -->
      <div class="no-slot-msg" *ngIf="!selectedSlot()">
        <span></span>
        <p>Veuillez sélectionner un créneau dans le calendrier.</p>
      </div>

      <!-- Formulaire -->
      <form [formGroup]="form" class="form-body" (ngSubmit)="onConfirm()">

        <!-- Type de consultation -->
        <div class="form-group">
          <label class="form-label">Type de consultation</label>
          <div class="radio-group">
            <label class="radio-option" [class.disabled]="false">
              <input
                type="radio"
                formControlName="consultationType"
                value="PHYSICAL"
              />
              <span class="radio-label">🏥 Présentiel</span>
            </label>
            <label
              class="radio-option"
              [class.disabled]="isTeleconsultDisabled"
            >
              <input
                type="radio"
                formControlName="consultationType"
                value="TELECONSULTATION"
                [attr.disabled]="isTeleconsultDisabled ? true : null"
              />
              <span class="radio-label">💻 Téléconsultation</span>
              <span class="badge-unavailable" *ngIf="isTeleconsultDisabled">Non disponible</span>
            </label>
          </div>
        </div>

        <!-- Durée -->
        <div class="form-group">
          <label class="form-label" for="duration">Durée</label>
          <select id="duration" formControlName="durationMinutes" class="form-select">
            <option [value]="15">15 minutes</option>
            <option [value]="30">30 minutes</option>
            <option [value]="45">45 minutes</option>
            <option [value]="60">60 minutes</option>
          </select>
        </div>

        <!-- Motif -->
        <div class="form-group">
          <label class="form-label" for="reason">
            Motif de consultation
            <span class="optional">(optionnel)</span>
          </label>
          <textarea
            id="reason"
            formControlName="reason"
            class="form-textarea"
            rows="3"
            maxlength="500"
            placeholder="Décrivez brièvement le motif de votre consultation..."
          ></textarea>
          <span class="char-count">
            {{ form.get('reason')?.value?.length ?? 0 }} / 500
          </span>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button
            type="button"
            class="btn-cancel"
            (click)="onCancel()"
            [disabled]="isLoading"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="btn-confirm"
            [disabled]="!selectedSlot() || isLoading"
          >
            <span *ngIf="isLoading" class="spinner" aria-hidden="true"></span>
            <span *ngIf="isLoading">Confirmation en cours...</span>
            <span *ngIf="!isLoading">✓ Confirmer le rendez-vous</span>
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .appointment-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      font-family: inherit;
    }

    /* Summary card */
    .summary-card {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 12px;
      padding: 16px;
    }
    .summary-title {
      font-size: 14px;
      font-weight: 700;
      color: #166534;
      margin: 0 0 12px;
    }
    .summary-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .summary-label {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .summary-value {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      text-transform: capitalize;
    }
    .summary-doctor {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .doctor-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #86efac;
    }
    .summary-specialty {
      font-size: 12px;
      color: #6b7280;
      display: block;
    }

    /* No slot message */
    .no-slot-msg {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: #fef9c3;
      border: 1.5px solid #fde047;
      border-radius: 10px;
      color: #854d0e;
      font-size: 14px;
    }
    .no-slot-msg span { font-size: 20px; }
    .no-slot-msg p { margin: 0; }

    /* Form */
    .form-body {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }
    .optional {
      font-weight: 400;
      color: #9ca3af;
      font-size: 12px;
      margin-left: 4px;
    }

    /* Radio group */
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .radio-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color .15s, background .15s;
    }
    .radio-option:has(input:checked) {
      border-color: #1a56db;
      background: #eff6ff;
    }
    .radio-option.disabled {
      opacity: .5;
      cursor: not-allowed;
      background: #f9fafb;
    }
    .radio-option input[type="radio"] { accent-color: #1a56db; }
    .radio-label { font-size: 14px; font-weight: 500; color: #111827; }
    .badge-unavailable {
      margin-left: auto;
      font-size: 11px;
      background: #fee2e2;
      color: #991b1b;
      padding: 2px 8px;
      border-radius: 99px;
      font-weight: 600;
    }

    /* Select */
    .form-select {
      padding: 10px 12px;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      color: #111827;
      background: white;
      cursor: pointer;
      outline: none;
      transition: border-color .15s;
    }
    .form-select:focus { border-color: #1a56db; }

    /* Textarea */
    .form-textarea {
      padding: 10px 12px;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      color: #111827;
      resize: vertical;
      font-family: inherit;
      outline: none;
      transition: border-color .15s;
    }
    .form-textarea:focus { border-color: #1a56db; }
    .char-count {
      font-size: 11px;
      color: #9ca3af;
      text-align: right;
    }

    /* Actions */
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      padding-top: 4px;
    }
    .btn-cancel {
      padding: 10px 20px;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      color: #374151;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background .15s;
    }
    .btn-cancel:hover:not(:disabled) { background: #f9fafb; }
    .btn-cancel:disabled { opacity: .5; cursor: not-allowed; }

    .btn-confirm {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 22px;
      background: #1a56db;
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background .15s;
    }
    .btn-confirm:hover:not(:disabled) { background: #1447c0; }
    .btn-confirm:disabled { opacity: .5; cursor: not-allowed; }

    /* Spinner */
    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin .7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class AppointmentFormComponent implements OnInit, OnChanges {
  @Input() medecin: any = null;
  @Input() availability: AvailabilityConfig | null = null;
  @Input() isLoading: boolean = false;

  @Output() confirmed = new EventEmitter<{
    consultationType: string;
    durationMinutes: number;
    reason: string;
  }>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private bookingState = inject(BookingStateService);

  form!: FormGroup;

  // Expose signals as methods for template
  selectedSlot = this.bookingState.selectedSlot;

  get isTeleconsultDisabled(): boolean {
    return this.availability?.acceptsTeleconsultation === false;
  }

  get consultationTypeLabel(): string {
    const type = this.form?.get('consultationType')?.value;
    return type === 'TELECONSULTATION' ? '💻 Téléconsultation' : '🏥 Présentiel';
  }

  ngOnInit(): void {
    const defaultDuration = this.availability?.defaultDuration ?? 30;
    const initialType = this.bookingState.consultationType();
    const initialReason = this.bookingState.reason();

    this.form = this.fb.group({
      consultationType: [
        this.isTeleconsultDisabled && initialType === 'TELECONSULTATION'
          ? 'PHYSICAL'
          : initialType,
      ],
      durationMinutes: [this.bookingState.durationMinutes() ?? defaultDuration],
      reason: [initialReason, [Validators.maxLength(500)]],
    });

    // Sync form changes back to state
    this.form.get('consultationType')?.valueChanges.subscribe(val => {
      this.bookingState.consultationType.set(val);
    });
    this.form.get('durationMinutes')?.valueChanges.subscribe(val => {
      this.bookingState.durationMinutes.set(Number(val));
    });
    this.form.get('reason')?.valueChanges.subscribe(val => {
      this.bookingState.reason.set(val);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['availability'] && this.form) {
      const defaultDuration = this.availability?.defaultDuration ?? 30;
      this.form.patchValue({ durationMinutes: defaultDuration });

      // If teleconsult is now disabled and currently selected, switch to PHYSICAL
      if (
        this.isTeleconsultDisabled &&
        this.form.get('consultationType')?.value === 'TELECONSULTATION'
      ) {
        this.form.patchValue({ consultationType: 'PHYSICAL' });
      }
    }
  }

  onConfirm(): void {
    if (!this.selectedSlot() || this.isLoading) return;
    const { consultationType, durationMinutes, reason } = this.form.value;
    this.confirmed.emit({
      consultationType,
      durationMinutes: Number(durationMinutes),
      reason: reason ?? '',
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}

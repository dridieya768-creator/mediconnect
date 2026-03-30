import {
  Component,
  Output,
  EventEmitter,
  inject,
  computed,
  signal,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingStateService } from '../../../../../core/services/booking-state.service';
import {
  AvailabilityConfig,
  OccupiedSlot,
  WorkDay,
} from '../../../../../core/models/medecin-availability.model';

interface TimeSlot {
  start: Date;
  end: Date;
  occupied: boolean;
  selected: boolean;
}

interface DayColumn {
  date: Date;
  label: string;
  slots: TimeSlot[];
}

const DAY_MAP: Record<WorkDay['day'], number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="weekly-calendar">

      <!-- Navigation semaine -->
      <div class="week-nav">
        <button class="nav-btn" (click)="prevWeek()" [disabled]="isPrevDisabled()">
          ← Semaine précédente
        </button>
        <span class="week-label">{{ weekLabel() }}</span>
        <button class="nav-btn" (click)="nextWeek()">
          Semaine suivante →
        </button>
      </div>

      <!-- Message aucun créneau -->
      <div class="no-slots" *ngIf="!hasWorkDays()">
        <span>📅</span>
        <p>Aucun créneau disponible pour ce médecin.</p>
      </div>

      <!-- Grille des jours -->
      <div class="days-grid" *ngIf="hasWorkDays()">
        <div class="day-col" *ngFor="let day of dayColumns()">
          <div class="day-header" [class.today]="isToday(day.date)">
            <span class="day-name">{{ day.label }}</span>
          </div>

          <div class="slots-list">
            <div *ngIf="day.slots.length === 0" class="no-day-slots">—</div>
            <button
              *ngFor="let slot of day.slots"
              class="slot-btn"
              [class.occupied]="slot.occupied"
              [class.selected]="slot.selected"
              [disabled]="slot.occupied || isPastSlot(slot.start)"
              (click)="selectSlot(slot)"
            >
              {{ slot.start | date:'HH:mm' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .weekly-calendar { font-family: inherit; }

    .week-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 8px;
    }
    .nav-btn {
      padding: 8px 14px;
      background: #f1f5f9;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      color: #0f172a;
      transition: background .15s;
    }
    .nav-btn:hover:not(:disabled) { background: #e2e8f0; }
    .nav-btn:disabled { opacity: .4; cursor: not-allowed; }
    .week-label { font-size: 14px; font-weight: 700; color: #0f172a; text-align: center; flex: 1; }

    .no-slots {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 32px;
      color: #94a3b8;
      font-size: 14px;
      background: #f8fafc;
      border-radius: 10px;
    }
    .no-slots span { font-size: 32px; }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
      overflow-x: auto;
    }
    .day-col { display: flex; flex-direction: column; gap: 4px; min-width: 72px; }

    .day-header {
      text-align: center;
      padding: 6px 4px;
      background: #f1f5f9;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      white-space: pre-line;
    }
    .day-header.today { background: #1a56db; color: white; }

    .slots-list { display: flex; flex-direction: column; gap: 4px; }
    .no-day-slots { text-align: center; color: #cbd5e1; font-size: 12px; padding: 8px 0; }

    .slot-btn {
      width: 100%;
      padding: 6px 4px;
      border: 1.5px solid #1a56db;
      border-radius: 6px;
      background: white;
      color: #1a56db;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all .15s;
      text-align: center;
    }
    .slot-btn:hover:not(:disabled):not(.occupied) { background: #1a56db; color: white; }
    .slot-btn.selected { background: #1a56db; color: white; }
    .slot-btn.occupied { background: #f1f5f9; border-color: #e2e8f0; color: #cbd5e1; cursor: not-allowed; }
    .slot-btn:disabled:not(.occupied) { opacity: .4; cursor: not-allowed; }

    @media (max-width: 640px) {
      .days-grid { grid-template-columns: repeat(4, 1fr); }
    }
  `],
})
export class WeeklyCalendarComponent {
  availability = input<AvailabilityConfig | null>(null);
  occupiedSlots = input<OccupiedSlot[]>([]);
  @Output() slotSelected = new EventEmitter<Date>();

  private bookingState = inject(BookingStateService);

  hasWorkDays = computed(() => {
    const wd = this.availability()?.workDays;
    return !!(wd && wd.length > 0);
  });

  weekLabel = computed(() => {
    const start = this.bookingState.currentWeekStart();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) =>
      d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    return `${fmt(start)} – ${fmt(end)}`;
  });

  isPrevDisabled = computed(() => {
    const weekStart = this.bookingState.currentWeekStart();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Disable if going back would put us before today's week start
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);
    return prevWeekStart < today;
  });

  dayColumns = computed((): DayColumn[] => {
    const weekStart = this.bookingState.currentWeekStart();
    const selectedSlot = this.bookingState.selectedSlot();
    const availability = this.availability();
    const occupiedSlots = this.occupiedSlots();

    const days: DayColumn[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      const label = date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      });

      const slots = availability
        ? this.generateSlotsForDay(date, availability, selectedSlot, occupiedSlots)
        : [];

      days.push({ date, label, slots });
    }
    return days;
  });

  private generateSlotsForDay(
    date: Date,
    availability: AvailabilityConfig,
    selectedSlot: Date | null,
    occupiedSlots: OccupiedSlot[],
  ): TimeSlot[] {
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ...
    const workDay = availability.workDays.find(
      wd => DAY_MAP[wd.day] === dayOfWeek,
    );
    if (!workDay) return [];

    const duration = availability.defaultDuration;
    const slots: TimeSlot[] = [];

    const [startH, startM] = workDay.startTime.split(':').map(Number);
    const [endH, endM] = workDay.endTime.split(':').map(Number);

    let current = new Date(date);
    current.setHours(startH, startM, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(endH, endM, 0, 0);

    while (current < dayEnd) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      if (slotEnd > dayEnd) break;

      const occupied = this.isOccupied(slotStart, slotEnd, occupiedSlots);
      const selected =
        selectedSlot !== null &&
        selectedSlot.getTime() === slotStart.getTime();

      slots.push({ start: slotStart, end: slotEnd, occupied, selected });

      current = new Date(current);
      current.setMinutes(current.getMinutes() + duration);
    }

    return slots;
  }

  private isOccupied(slotStart: Date, slotEnd: Date, occupiedSlots: OccupiedSlot[]): boolean {
    return occupiedSlots.some(os => {
      const osStart = new Date(os.appointmentDate);
      const osEnd = new Date(osStart);
      osEnd.setMinutes(osEnd.getMinutes() + os.durationMinutes);
      // Overlap: slotStart < osEnd && slotEnd > osStart
      return slotStart < osEnd && slotEnd > osStart;
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  isPastSlot(start: Date): boolean {
    return start < new Date();
  }

  prevWeek(): void {
    if (this.isPrevDisabled()) return;
    const current = this.bookingState.currentWeekStart();
    const prev = new Date(current);
    prev.setDate(current.getDate() - 7);
    this.bookingState.currentWeekStart.set(prev);
  }

  nextWeek(): void {
    const current = this.bookingState.currentWeekStart();
    const next = new Date(current);
    next.setDate(current.getDate() + 7);
    this.bookingState.currentWeekStart.set(next);
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.occupied || this.isPastSlot(slot.start)) return;
    this.bookingState.selectSlot(slot.start);
    this.slotSelected.emit(slot.start);
  }
}

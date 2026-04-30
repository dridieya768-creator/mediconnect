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
  CongesPeriod,
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
        <span></span>
        <p>Aucun créneau disponible pour ce médecin.</p>
      </div>

      <!-- Grille des jours -->
      <div class="days-grid" *ngIf="hasWorkDays()">
        <div class="day-col" *ngFor="let day of dayColumns()">
          <div class="day-header" [class.today]="isToday(day.date)" [class.selected-day]="isSelectedDay(day.date)">
            <div class="day-name">{{ getDayName(day.date) }}</div>
            <div class="day-date">{{ getDayDate(day.date) }}</div>
          </div>

          <div class="slots-list">
            <div *ngIf="day.slots.length === 0" class="no-day-slots">–</div>
            <button
              *ngFor="let slot of day.slots"
              class="slot-btn"
              [class.occupied]="slot.occupied || isPastSlot(slot.start)"
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
      white-space: nowrap;
    }
    .nav-btn:hover:not(:disabled) { background: #e2e8f0; }
    .nav-btn:disabled { opacity: .4; cursor: not-allowed; }
    .week-label { font-size: 14px; font-weight: 700; color: #0f172a; text-align: center; flex: 1; }

    .no-slots {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 32px; color: #94a3b8; font-size: 14px;
      background: #f8fafc; border-radius: 10px;
    }
    .no-slots span { font-size: 32px; }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      overflow-x: auto;
    }
    .day-col { display: flex; flex-direction: column; gap: 4px; min-width: 80px; }

    .day-header {
      text-align: center;
      padding: 8px 4px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1.5px solid #e2e8f0;
      margin-bottom: 4px;
    }
    .day-header.today { background: #eff6ff; border-color: #bfdbfe; }
    .day-header.selected-day { background: #1a56db; border-color: #1a56db; }
    .day-header.selected-day .day-name,
    .day-header.selected-day .day-date { color: white; }
    .day-name { font-size: 11px; font-weight: 700; color: #475569; text-transform: capitalize; }
    .day-date { font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .day-header.today .day-name { color: #1a56db; }
    .day-header.today .day-date { color: #1a56db; }

    .slots-list { display: flex; flex-direction: column; gap: 4px; }
    .no-day-slots { text-align: center; color: #cbd5e1; font-size: 13px; padding: 12px 0; }

    .slot-btn {
      width: 100%;
      padding: 8px 4px;
      border: 1.5px solid #1a56db;
      border-radius: 8px;
      background: white;
      color: #1a56db;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all .15s;
      text-align: center;
    }
    .slot-btn:hover:not(:disabled):not(.occupied) { background: #1a56db; color: white; }
    .slot-btn.selected { background: #1a56db; color: white; border-color: #1a56db; }
    .slot-btn.occupied {
      background: #f1f5f9;
      border-color: #e2e8f0;
      color: #94a3b8;
      cursor: not-allowed;
      text-decoration: line-through;
    }
    .slot-btn:disabled:not(.occupied) { opacity: .4; cursor: not-allowed; text-decoration: line-through; color: #94a3b8; border-color: #e2e8f0; background: #f8fafc; }

    @media (max-width: 640px) {
      .days-grid { grid-template-columns: repeat(4, 1fr); }
    }
  `],
})
export class WeeklyCalendarComponent {
  availability = input<AvailabilityConfig | null>(null);
  occupiedSlots = input<OccupiedSlot[]>([]);
  conges = input<CongesPeriod[]>([]);
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
      const date = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() + i
      );

      const label = date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      });

      // Block conge days entirely
      const isConge = this.isDateInConge(date);
      const slots = availability && !isConge
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
    const dayOfWeek = date.getDay();
    // Récupérer TOUTES les plages pour ce jour (matin + après-midi)
    const workDayRanges = availability.workDays.filter(
      wd => DAY_MAP[wd.day] === dayOfWeek,
    );
    if (!workDayRanges.length) {
      console.log('[Calendar] No workDays for', date.toDateString(), 'dayOfWeek=', dayOfWeek, 'workDays=', JSON.stringify(availability.workDays?.slice(0,2)));
      return [];
    }

    const duration = availability.defaultDuration;
    const slots: TimeSlot[] = [];

    for (const workDay of workDayRanges) {
      if (!workDay.startTime || !workDay.endTime) continue;
      const [startH, startM] = workDay.startTime.split(':').map(Number);
      const [endH, endM] = workDay.endTime.split(':').map(Number);
      if (isNaN(startH) || isNaN(endH)) continue;

      // Construire les dates en utilisant les composantes locales de `date`
      // pour éviter tout décalage UTC
      const y = date.getFullYear();
      const m = date.getMonth();
      const d = date.getDate();

      let current = new Date(y, m, d, startH, startM, 0, 0);
      const rangeEnd = new Date(y, m, d, endH, endM, 0, 0);

      while (current.getTime() < rangeEnd.getTime()) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);

        if (slotEnd.getTime() > rangeEnd.getTime()) break;

        const occupied = this.isOccupied(slotStart, slotEnd, occupiedSlots);
        const selected =
          selectedSlot !== null &&
          selectedSlot.getTime() === slotStart.getTime();

        slots.push({ start: slotStart, end: slotEnd, occupied, selected });

        current = new Date(current);
        current.setMinutes(current.getMinutes() + duration);
      }
    }

    // Trier par heure
    slots.sort((a, b) => a.start.getTime() - b.start.getTime());
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

  isSelectedDay(date: Date): boolean {
    const sel = this.bookingState.selectedSlot();
    if (!sel) return false;
    return sel.getFullYear() === date.getFullYear() &&
      sel.getMonth() === date.getMonth() &&
      sel.getDate() === date.getDate();
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  }

  getDayDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }

  isDateInConge(date: Date): boolean {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return this.conges().some(c => {
      const start = new Date(c.startDate); start.setHours(0,0,0,0);
      const end   = new Date(c.endDate);   end.setHours(23,59,59,999);
      // Ignorer les congés avec dates invalides (ex: année < 2000)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
      if (start.getFullYear() < 2000 || end.getFullYear() < 2000) return false;
      return d >= start && d <= end;
    });
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








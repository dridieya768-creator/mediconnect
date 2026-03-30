import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  readonly selectedSlot = signal<Date | null>(null);
  readonly consultationType = signal<'PHYSICAL' | 'TELECONSULTATION'>('PHYSICAL');
  readonly durationMinutes = signal<number>(30);
  readonly reason = signal<string>('');
  readonly currentWeekStart = signal<Date>(this.getStartOfCurrentWeek());
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  selectSlot(date: Date): void {
    this.selectedSlot.set(date);
  }

  clearSlot(): void {
    this.selectedSlot.set(null);
  }

  reset(defaultDuration?: number): void {
    this.selectedSlot.set(null);
    this.consultationType.set('PHYSICAL');
    this.durationMinutes.set(defaultDuration ?? 30);
    this.reason.set('');
    this.currentWeekStart.set(this.getStartOfCurrentWeek());
    this.isLoading.set(false);
    this.error.set(null);
  }

  private getStartOfCurrentWeek(): Date {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
}

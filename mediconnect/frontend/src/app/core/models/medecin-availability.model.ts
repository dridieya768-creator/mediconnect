export interface WorkDay {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface CongesPeriod {
  startDate: string; // ISO date
  endDate: string;   // ISO date
  message?: string;
}

export interface AvailabilityConfig {
  workDays: WorkDay[];
  defaultDuration: number; // minutes (15, 30, 45, 60)
  acceptsTeleconsultation: boolean;
  disponTeleconsult?: boolean;
  conges?: CongesPeriod[];
}

export interface OccupiedSlot {
  appointmentDate: string; // ISO datetime
  durationMinutes: number;
}

export interface BookingState {
  doctorId: string;
  selectedSlot: Date | null;
  consultationType: 'PHYSICAL' | 'TELECONSULTATION';
  durationMinutes: number;
  reason: string;
  currentWeekStart: Date;
  isLoading: boolean;
  error: string | null;
}



export interface WorkDay {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; 
  endTime: string;   
}

export interface CongesPeriod {
  startDate: string; 
  endDate: string;   
  message?: string;
}

export interface AvailabilityConfig {
  workDays: WorkDay[];
  defaultDuration: number; 
  acceptsTeleconsultation: boolean;
  disponTeleconsult?: boolean;
  conges?: CongesPeriod[];
}

export interface OccupiedSlot {
  appointmentDate: string; 
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



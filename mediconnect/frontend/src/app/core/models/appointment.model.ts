export enum AppointmentStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum ConsultationType {
  PHYSICAL = 'PHYSICAL',
  TELECONSULTATION = 'TELECONSULTATION',
  HOME_VISIT = 'HOME_VISIT',
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  durationMinutes: number;
  status: AppointmentStatus;
  consultationType: ConsultationType;
  reason?: string;
  notes?: string;
  videoRoomId?: string;
  cancellationReason?: string;
  createdAt: Date;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  durationMinutes?: number;
  consultationType: ConsultationType;
  reason?: string;
}

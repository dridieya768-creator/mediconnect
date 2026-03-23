import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { Appointment, CreateAppointmentDto } from "../models/appointment.model";

@Injectable({ providedIn: "root" })
export class AppointmentService {
  constructor(private api: ApiService) {}

  create(dto: CreateAppointmentDto): Observable<Appointment> {
    return this.api.post<Appointment>("/appointments", dto);
  }

  getByPatient(patientId: string): Observable<Appointment[]> {
    return this.api.get<Appointment[]>(`/appointments/patient/${patientId}`);
  }

  getByDoctor(doctorId: string, date?: string): Observable<Appointment[]> {
    const params = date ? { date } : undefined;
    return this.api.get<Appointment[]>(`/appointments/doctor/${doctorId}`, params);
  }

  confirm(id: string): Observable<Appointment> {
    return this.api.patch<Appointment>(`/appointments/${id}/confirm`, {});
  }

  cancel(id: string, reason: string): Observable<Appointment> {
    return this.api.patch<Appointment>(`/appointments/${id}/cancel`, { reason });
  }

  complete(id: string, notes?: string): Observable<Appointment> {
    return this.api.patch<Appointment>(`/appointments/${id}/complete`, { notes });
  }

  generateVideoRoom(id: string): Observable<string> {
    return this.api.post<string>(`/appointments/${id}/video-room`, {});
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AvailabilityConfig, OccupiedSlot } from '../models/medecin-availability.model';

@Injectable({ providedIn: 'root' })
export class MedecinAvailabilityService {
  constructor(private api: ApiService) {}
///Appelle GET /medecins/:id/availability pour récupérer les horaires configurés du médecin
  getAvailability(medecinId: string): Observable<AvailabilityConfig> {
    return this.api.get<AvailabilityConfig>(`/medecins/${medecinId}/availability`);
  }
 ///Appelle GET /medecins/:id/slots pour récupérer les créneaux déjà pris
  getOccupiedSlots(medecinId: string, startDate: string, endDate: string): Observable<OccupiedSlot[]> {
    return this.api.get<OccupiedSlot[]>(`/medecins/${medecinId}/slots`, { startDate, endDate });
  }
}

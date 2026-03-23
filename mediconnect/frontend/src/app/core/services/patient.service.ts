import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { Patient } from "../models/patient.model";

@Injectable({ providedIn: "root" })
export class PatientService {
  constructor(private api: ApiService) {}

  getMyProfile(): Observable<Patient> {
    return this.api.get<Patient>("/patients/me");
  }

  getPatient(id: string): Observable<Patient> {
    return this.api.get<Patient>(`/patients/${id}`);
  }

  getDossierMedical(id: string): Observable<any> {
    return this.api.get<any>(`/patients/${id}/dossier-medical`);
  }

  getByQrCode(qrCode: string): Observable<Patient> {
    return this.api.get<Patient>(`/patients/qr/${qrCode}`);
  }

  updateProfile(id: string, data: Partial<Patient>): Observable<Patient> {
    return this.api.patch<Patient>(`/patients/${id}`, data);
  }
}

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

@Injectable({ providedIn: "root" })
export class DossierService {
  constructor(private api: ApiService) {}

  getDossier(patientId: string): Observable<any> {
    return this.api.get<any>(`/dossier-medical/${patientId}`);
  }

  getMyPermissions(patientId: string): Observable<any> {
    return this.api.get<any>(`/dossier-medical/${patientId}/acces/my-permissions`);
  }
}

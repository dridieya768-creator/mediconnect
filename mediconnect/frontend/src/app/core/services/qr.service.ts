import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

@Injectable({ providedIn: "root" })
export class QrService {
  constructor(private api: ApiService) {}

  scan(qrCode: string, scannedBy: string): Observable<{ valid: boolean; data: any }> {
    return this.api.post<{ valid: boolean; data: any }>("/qr-codes/scan", { qrCode, scannedBy });
  }

  getImage(qrCode: string): Observable<string> {
    return this.api.get<string>(`/qr-codes/image/${qrCode}`);
  }

  revoke(qrCode: string): Observable<void> {
    return this.api.post<void>(`/qr-codes/revoke/${qrCode}`, {});
  }
}

import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { QRCodeModule } from "angularx-qrcode";

@Component({
  selector: "app-patient-prescriptions",
  standalone: true,
  imports: [CommonModule, QRCodeModule],
  templateUrl: "./patient-prescriptions.component.html",
  styleUrls: ["./patient-prescriptions.component.scss"],
})
export class PatientPrescriptionsComponent implements OnInit {
  private http = inject(HttpClient);

  loading       = signal(true);
  prescriptions = signal<any[]>([]);
  selectedRx    = signal<any>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any>('/api/v1/patients/me').subscribe({
      next: res => {
        const data = res?.data ?? res;
        const patientId = data?.id;
        if (!patientId) { this.loading.set(false); return; }
        this.http.get<any>(`/api/v1/prescriptions/patient/${patientId}`).subscribe({
          next: r => {
            const list = Array.isArray(r) ? r : (r?.data ?? []);
            this.prescriptions.set(Array.isArray(list) ? list : []);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });
  }

  showQr(rx: any) { this.selectedRx.set(rx); }
  closeQr() { this.selectedRx.set(null); }

  getDoctorName(rx: any): string {
    if (rx.doctor) return `${rx.doctor.firstName || ''} ${rx.doctor.lastName || ''}`.trim();
    return 'Médecin';
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatusLabel(s: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Active', EXPIRED: 'Expirée', FULLY_USED: 'Délivrée',
      PARTIALLY_USED: 'Partielle', REVOKED: 'Révoquée'
    };
    return labels[s] || s;
  }

  getQrData(rx: any): string {
    if (rx.pdfUrl) {
      const base = window.location.origin;
      return rx.pdfUrl.startsWith('http') ? rx.pdfUrl : `${base}${rx.pdfUrl}`;
    }
    return rx.qrCode ?? '';
  }

  getMedNames(rx: any): string {
    return (rx.medications ?? []).map((m: any) => m.name).join(', ');
  }

  download(rx: any) {
    if (!rx.pdfUrl) return;
    const a = document.createElement('a');
    a.href = rx.pdfUrl;
    a.download = `ordonnance-${rx.id}.pdf`;
    a.target = '_blank';
    a.click();
  }
}

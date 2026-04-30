import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-scan-patient",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-height:100vh; background:#f8fafc; display:flex; justify-content:center; align-items:center; padding:24px;">
      <div style="background:white; border-radius:16px; padding:32px; max-width:420px; width:100%; box-shadow:0 4px 24px rgba(0,0,0,0.1);">
        
        <div style="text-align:center; margin-bottom:24px;">
          <div style="font-size:28px; font-weight:bold; color:#0f172a;"> MediConnect</div>
          <div style="color:#64748b; font-size:13px;">Dossier Patient</div>
        </div>

        @if (loading()) {
          <div style="text-align:center; color:#64748b;">Chargement...</div>
        }

        @if (!loading() && !patient()) {
          <div style="text-align:center; background:#fef2f2; border-radius:8px; padding:16px; color:#dc2626;">
             QR code invalide ou expiré
          </div>
        }

        @if (patient()) {
          <div>
            <div style="background:#f0fdf4; border-radius:12px; padding:16px; margin-bottom:16px; text-align:center;">
              <div style="font-size:48px;"></div>
              <div style="font-size:22px; font-weight:bold; color:#0f172a; margin-top:8px;">
                {{ patient()?.prenom }} {{ patient()?.nom }}
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:10px;">
              <div style="display:flex; justify-content:space-between; padding:10px; background:#f8fafc; border-radius:8px;">
                <span style="color:#64748b;"> Date de naissance</span>
                <span style="font-weight:500;">{{ patient()?.dateNaissance | date:'dd/MM/yyyy' }}</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:10px; background:#f8fafc; border-radius:8px;">
                <span style="color:#64748b;"> Sexe</span>
                <span style="font-weight:500;">{{ patient()?.sexe || 'Non renseigné' }}</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:10px; background:#f8fafc; border-radius:8px;">
                <span style="color:#64748b;"> Téléphone</span>
                <span style="font-weight:500;">{{ patient()?.telephone || 'Non renseigné' }}</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:10px; background:#f8fafc; border-radius:8px;">
                <span style="color:#64748b;"> Groupe sanguin</span>
                <span style="font-weight:bold; color:#dc2626;">{{ patient()?.groupeSanguin || 'Non renseigné' }}</span>
              </div>

              @if (patient()?.allergies?.length) {
                <div style="padding:10px; background:#fff7ed; border-radius:8px;">
                  <div style="color:#64748b; margin-bottom:6px;"> Allergies</div>
                  <div style="font-weight:500; color:#ea580c;">{{ patient()?.allergies?.join(', ') }}</div>
                </div>
              }

              @if (patient()?.maladiesChroniques?.length) {
                <div style="padding:10px; background:#fef2f2; border-radius:8px;">
                  <div style="color:#64748b; margin-bottom:6px;"> Maladies chroniques</div>
                  <div style="font-weight:500; color:#dc2626;">{{ patient()?.maladiesChroniques?.join(', ') }}</div>
                </div>
              }
            </div>

            <div style="margin-top:20px; text-align:center; font-size:11px; color:#94a3b8;">
              Informations confidentielles — MediConnect
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ScanPatientComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  loading = signal(true);
  patient = signal<any>(null);

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get("token");
    if (!token) { this.loading.set(false); return; }

    this.http.get<any>(`/api/v1/patient/qr/public/${token}`).subscribe({
      next: (res) => {
       const data = res?.data || res;
       if (data?.valid) this.patient.set(data.patient);
        this.loading.set(false);
     },
      error: () => this.loading.set(false),
    });
  }
}
import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-scan-medecin",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-height:100vh; background:#f0f4ff; display:flex; justify-content:center; align-items:center; padding:24px;">
      <div style="background:white; border-radius:20px; padding:36px; max-width:460px; width:100%; box-shadow:0 8px 32px rgba(79,70,229,0.12);">

        <!-- Header -->
        <div style="text-align:center; margin-bottom:28px;">
          <div style="font-size:30px; font-weight:800; color:#0f172a;"> MediConnect</div>
          <div style="color:#64748b; font-size:13px; margin-top:4px;">Profil Médecin Vérifié</div>
        </div>

        <!-- Chargement -->
        @if (loading()) {
          <div style="text-align:center; color:#64748b; padding:40px 0;">
            <div style="font-size:32px; margin-bottom:12px;"></div>
            <div>Chargement du profil...</div>
          </div>
        }

        <!-- Erreur -->
        @if (!loading() && !medecin()) {
          <div style="text-align:center; background:#fef2f2; border-radius:12px; padding:24px; color:#dc2626;">
            <div style="font-size:32px; margin-bottom:8px;"></div>
            <div style="font-weight:700; margin-bottom:4px;">QR code invalide ou expiré</div>
            <div style="font-size:13px; color:#94a3b8;">Ce médecin n'est pas enregistré sur MediConnect</div>
          </div>
        }

        <!-- Profil médecin -->
        @if (medecin()) {
          <div>

            <!-- Avatar + nom -->
            <div style="background:linear-gradient(135deg,#eef2ff,#e0e7ff); border-radius:16px; padding:20px; margin-bottom:20px; text-align:center;">
              <div style="width:72px; height:72px; background:linear-gradient(135deg,#4f46e5,#7c3aed); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; color:white; margin:0 auto 12px;">
                {{ getInitials() }}
              </div>
              <div style="font-size:22px; font-weight:800; color:#0f172a;">
                Dr. {{ medecin()?.firstName }} {{ medecin()?.lastName }}
              </div>
              <div style="margin-top:6px;">
                <span style="background:#4f46e5; color:white; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700;">
                  {{ getSpecialiteLabel() }}
                </span>
              </div>

              <!-- Badge vérifié -->
              <div style="margin-top:10px; display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:20px; padding:4px 12px; font-size:12px; color:#16a34a; font-weight:700;">
                ✅ Médecin vérifié — MediConnect
              </div>
            </div>

            <!-- Informations -->
            <div style="display:flex; flex-direction:column; gap:10px;">

              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;">
                <span style="color:#64748b; font-size:13px;"> Email professionnel</span>
                <span style="font-weight:600; font-size:13px; color:#0f172a;">{{ medecin()?.email }}</span>
              </div>

              @if (medecin()?.phone) {
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;">
                  <span style="color:#64748b; font-size:13px;"> Téléphone</span>
                  <span style="font-weight:600; font-size:13px; color:#0f172a;">{{ medecin()?.phone }}</span>
                </div>
              }

              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;">
                <span style="color:#64748b; font-size:13px;"> Spécialité</span>
                <span style="font-weight:600; font-size:13px; color:#0f172a;">{{ getSpecialiteLabel() }}</span>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;">
                <span style="color:#64748b; font-size:13px;"> Membre depuis</span>
                <span style="font-weight:600; font-size:13px; color:#0f172a;">{{ medecin()?.createdAt | date:'MMMM yyyy' : '' : 'fr' }}</span>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;">
                <span style="color:#64748b; font-size:13px;"> Statut</span>
                <span style="background:#f0fdf4; color:#16a34a; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:700;">
                   Compte actif et vérifié
                </span>
              </div>

              @if (medecin()?.ville) {
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;">
                  <span style="color:#64748b; font-size:13px;"> Ville</span>
                  <span style="font-weight:600; font-size:13px; color:#0f172a;">{{ medecin()?.ville }}</span>
                </div>
              }

              @if (medecin()?.teleconsultation) {
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#eef2ff; border-radius:10px; border:1px solid #c7d2fe;">
                  <span style="color:#4f46e5; font-size:13px; font-weight:600;"> Téléconsultation</span>
                  <span style="background:#4f46e5; color:white; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:700;">
                    Disponible
                  </span>
                </div>
              }

            </div>

            <!-- Footer -->
            <div style="margin-top:24px; padding-top:16px; border-top:1px solid #f1f5f9; text-align:center; font-size:11px; color:#94a3b8; line-height:1.6;">
              Ce QR code certifie que ce médecin est enregistré et vérifié sur la plateforme MediConnect.<br>
              Informations confidentielles — Ne pas partager.
            </div>

          </div>
        }

      </div>
    </div>
  `,
})
export class ScanMedecinComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private http   = inject(HttpClient);

  loading = signal(true);
  medecin = signal<any>(null);

  ngOnInit() {
    const medecinId = this.route.snapshot.paramMap.get("id")
                   ?? this.route.snapshot.queryParams["id"];

    if (!medecinId) {
      this.loading.set(false);
      return;
    }

    this.http.get<any>(`/api/v1/medecins/${medecinId}/public`).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        if (data) this.medecin.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getInitials(): string {
    const m = this.medecin();
    if (!m) return "M";
    return `${m.firstName?.[0] ?? ""}${m.lastName?.[0] ?? ""}`.toUpperCase();
  }

  getSpecialiteLabel(): string {
    const role = this.medecin()?.role ?? "";
    const labels: Record<string, string> = {
      MEDECIN_GENERALISTE: "Médecin Généraliste",
      MEDECIN_SPECIALISTE: "Médecin Spécialiste",
      MEDECIN_CHEF_SERVICE: "Médecin Chef de Service",
    };
    return labels[role] || this.medecin()?.specialite || role;
  }
}
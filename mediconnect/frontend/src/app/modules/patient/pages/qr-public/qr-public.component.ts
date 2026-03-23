import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-qr-public",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qr-page">

      <!-- HEADER -->
      <div class="qr-header">
        <div class="logo-row">
          <span class="logo-icon">🏥</span>
          <div>
            <div class="logo-text">MediConnect</div>
            <div class="logo-sub">Dossier Patient — Accès QR Code</div>
          </div>
        </div>
      </div>

      <!-- LOADING -->
      <div class="qr-body" *ngIf="isLoading()">
        <div class="state-card">
          <div class="spinner"></div>
          <p>Chargement du dossier médical...</p>
        </div>
      </div>

      <!-- INVALIDE -->
      <div class="qr-body" *ngIf="!isLoading() && !patient()">
        <div class="state-card error">
          <div style="font-size:56px">❌</div>
          <h2>QR Code invalide</h2>
          <p>Ce lien QR est expiré, invalide ou a déjà été utilisé.</p>
        </div>
      </div>

      <!-- DOSSIER MÉDICAL COMPLET -->
      <div class="qr-body" *ngIf="!isLoading() && patient() as p">

        <!-- Badge sécurité -->
        <div class="security-banner">
          <span>🔒</span>
          <span>Accès sécurisé — Données médicales confidentielles</span>
          <span class="scan-time">Scanné le {{ now }}</span>
        </div>

        <!-- Identité patient -->
        <div class="patient-hero">
          <div class="patient-avatar">
            {{ getInitials(p) }}
          </div>
          <div class="patient-identity">
            <h1>{{ p.prenom }} {{ p.nom }}</h1>
            <div class="identity-meta">
              <span *ngIf="p.dateNaissance">🎂 {{ formatDate(p.dateNaissance) }} ({{ getAge(p.dateNaissance) }} ans)</span>
              <span *ngIf="p.sexe">{{ p.sexe === 'M' ? '👨' : '👩' }} {{ p.sexe === 'M' ? 'Homme' : 'Femme' }}</span>
              <span *ngIf="p.telephone">📞 {{ p.telephone }}</span>
            </div>
          </div>
          <div class="blood-badge" *ngIf="p.groupeSanguin">
            <span class="blood-icon">🩸</span>
            <span class="blood-type">{{ p.groupeSanguin }}</span>
          </div>
        </div>

        <!-- Grille infos médicales -->
        <div class="medical-grid">

          <!-- Informations générales -->
          <div class="medical-card">
            <div class="card-title">📋 Informations générales</div>
            <div class="info-row">
              <span class="info-label">Nom complet</span>
              <span class="info-value">{{ p.prenom }} {{ p.nom }}</span>
            </div>
            <div class="info-row" *ngIf="p.dateNaissance">
              <span class="info-label">Date de naissance</span>
              <span class="info-value">{{ formatDate(p.dateNaissance) }}</span>
            </div>
            <div class="info-row" *ngIf="p.dateNaissance">
              <span class="info-label">Âge</span>
              <span class="info-value">{{ getAge(p.dateNaissance) }} ans</span>
            </div>
            <div class="info-row" *ngIf="p.sexe">
              <span class="info-label">Sexe</span>
              <span class="info-value">{{ p.sexe === 'M' ? 'Masculin' : 'Féminin' }}</span>
            </div>
            <div class="info-row" *ngIf="p.telephone">
              <span class="info-label">Téléphone</span>
              <span class="info-value">{{ p.telephone }}</span>
            </div>
          </div>

          <!-- Informations vitales -->
          <div class="medical-card vital">
            <div class="card-title">🩸 Informations vitales</div>
            <div class="info-row">
              <span class="info-label">Groupe sanguin</span>
              <span class="info-value blood" *ngIf="p.groupeSanguin">{{ p.groupeSanguin }}</span>
              <span class="info-value missing" *ngIf="!p.groupeSanguin">Non renseigné</span>
            </div>
            <div class="info-row" *ngIf="p.taille">
              <span class="info-label">Taille</span>
              <span class="info-value">{{ p.taille }} cm</span>
            </div>
            <div class="info-row" *ngIf="p.poids">
              <span class="info-label">Poids</span>
              <span class="info-value">{{ p.poids }} kg</span>
            </div>
            <div class="info-row" *ngIf="p.taille && p.poids">
              <span class="info-label">IMC</span>
              <span class="info-value">{{ getIMC(p.taille, p.poids) }}</span>
            </div>
          </div>

          <!-- Allergies -->
          <div class="medical-card allergy" *ngIf="p.allergies">
            <div class="card-title">⚠️ Allergies connues</div>
            <div class="tags-list">
              <span class="tag tag-red" *ngFor="let a of parseList(p.allergies)">
                ⚠️ {{ a }}
              </span>
              <span class="no-data" *ngIf="parseList(p.allergies).length === 0">Aucune allergie connue</span>
            </div>
          </div>

          <!-- Maladies chroniques -->
          <div class="medical-card chronic" *ngIf="p.maladiesChroniques">
            <div class="card-title">🏥 Maladies chroniques</div>
            <div class="tags-list">
              <span class="tag tag-orange" *ngFor="let m of parseList(p.maladiesChroniques)">
                {{ m }}
              </span>
              <span class="no-data" *ngIf="parseList(p.maladiesChroniques).length === 0">Aucune maladie chronique</span>
            </div>
          </div>

          <!-- Médicaments actuels -->
          <div class="medical-card meds" *ngIf="p.medicamentsActuels">
            <div class="card-title">💊 Médicaments en cours</div>
            <div class="tags-list">
              <span class="tag tag-blue" *ngFor="let m of parseList(p.medicamentsActuels)">
                💊 {{ m }}
              </span>
              <span class="no-data" *ngIf="parseList(p.medicamentsActuels).length === 0">Aucun médicament en cours</span>
            </div>
          </div>

          <!-- Contact urgence -->
          <div class="medical-card emergency" *ngIf="p.contactUrgenceNom || p.contactUrgence">
            <div class="card-title">🚨 Contact d'urgence</div>
            <div class="info-row" *ngIf="p.contactUrgenceNom || p.contactUrgence">
              <span class="info-label">Nom</span>
              <span class="info-value">{{ p.contactUrgenceNom || p.contactUrgence }}</span>
            </div>
            <div class="info-row" *ngIf="p.contactUrgenceTel || p.telephoneUrgence">
              <span class="info-label">Téléphone</span>
              <span class="info-value urgent">{{ p.contactUrgenceTel || p.telephoneUrgence }}</span>
            </div>
          </div>

        </div>

        <!-- Footer légal -->
        <div class="legal-footer">
          <p>🔒 Ces informations sont confidentielles et réservées aux professionnels de santé autorisés.</p>
          <p>Plateforme MediConnect — e-Santé Tunisie</p>
        </div>

      </div>

      <!-- FOOTER -->
      <div class="qr-footer">
        <span>© 2025 MediConnect</span>
        <span>Données chiffrées AES-256 · Conforme RGPD</span>
      </div>

    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .qr-page {
      min-height: 100vh;
      background: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* HEADER */
    .qr-header {
      background: linear-gradient(135deg, #0f172a 0%, #134e4a 100%);
      padding: 20px 24px;
      display: flex;
      align-items: center;
    }
    .logo-row { display: flex; align-items: center; gap: 12px; }
    .logo-icon { font-size: 28px; }
    .logo-text { font-size: 20px; font-weight: 700; color: white; }
    .logo-sub { font-size: 11px; color: #67e8f9; margin-top: 2px; }

    /* BODY */
    .qr-body { max-width: 800px; margin: 0 auto; padding: 24px 16px; }

    /* STATES */
    .state-card {
      background: white; border-radius: 16px; padding: 60px 40px;
      text-align: center; display: flex; flex-direction: column;
      align-items: center; gap: 16px;
    }
    .state-card h2 { font-size: 22px; color: #0f172a; }
    .state-card p { color: #64748b; }
    .state-card.error h2 { color: #dc2626; }
    .spinner { width: 48px; height: 48px; border: 3px solid #e2e8f0; border-top-color: #0d9488; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* SECURITY BANNER */
    .security-banner {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
      background: #f0fdf4; border: 1px solid #bbf7d0;
      border-radius: 10px; padding: 10px 16px;
      font-size: 13px; color: #16a34a; margin-bottom: 20px;
    }
    .scan-time { margin-left: auto; color: #64748b; font-size: 12px; }

    /* PATIENT HERO */
    .patient-hero {
      background: white; border-radius: 16px; padding: 24px;
      display: flex; align-items: center; gap: 20px;
      margin-bottom: 20px; box-shadow: 0 2px 12px rgba(0,0,0,.06);
      flex-wrap: wrap;
    }
    .patient-avatar {
      width: 72px; height: 72px; background: #0d9488; color: white;
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: 24px; font-weight: 700; flex-shrink: 0;
    }
    .patient-identity { flex: 1; min-width: 180px; }
    .patient-identity h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .identity-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: #64748b; }

    .blood-badge {
      display: flex; flex-direction: column; align-items: center;
      background: #fef2f2; border: 2px solid #fecaca;
      border-radius: 12px; padding: 12px 20px; flex-shrink: 0;
    }
    .blood-icon { font-size: 20px; }
    .blood-type { font-size: 22px; font-weight: 800; color: #dc2626; margin-top: 4px; }

    /* MEDICAL GRID */
    .medical-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
    }

    .medical-card {
      background: white; border-radius: 14px; padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,.05);
      border-top: 3px solid #0d9488;
    }
    .medical-card.vital { border-top-color: #dc2626; }
    .medical-card.allergy { border-top-color: #f59e0b; }
    .medical-card.chronic { border-top-color: #8b5cf6; }
    .medical-card.meds { border-top-color: #3b82f6; }
    .medical-card.emergency { border-top-color: #ef4444; }

    .card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 14px; }

    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px;
    }
    .info-row:last-child { border: none; }
    .info-label { color: #64748b; }
    .info-value { font-weight: 600; color: #0f172a; text-align: right; }
    .info-value.blood { color: #dc2626; font-size: 16px; font-weight: 800; }
    .info-value.missing { color: #94a3b8; font-weight: 400; }
    .info-value.urgent { color: #ef4444; }

    /* TAGS */
    .tags-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag {
      padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
    }
    .tag-red { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .tag-orange { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
    .tag-blue { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
    .no-data { color: #94a3b8; font-size: 13px; font-style: italic; }

    /* LEGAL FOOTER */
    .legal-footer {
      margin-top: 24px; padding: 16px; background: #fef9c3;
      border: 1px solid #fde68a; border-radius: 10px;
      text-align: center; font-size: 12px; color: #92400e; line-height: 1.8;
    }

    /* FOOTER */
    .qr-footer {
      background: #0f172a; padding: 16px 24px;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 12px; color: #475569; flex-wrap: wrap; gap: 8px;
      margin-top: 24px;
    }

    @media (max-width: 600px) {
      .medical-grid { grid-template-columns: 1fr; }
      .patient-hero { flex-direction: column; text-align: center; }
      .identity-meta { justify-content: center; }
    }
  `]
})
export class QrPublicComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  isLoading = signal(true);
  patient = signal<any>(null);
  now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) { this.isLoading.set(false); return; }

    this.http.get<any>(`/api/v1/patient/qr/public/${token}`)
      .pipe(catchError(() => of({ valid: false })))
      .subscribe((res: any) => {
        const data = res?.data ?? res;
        if (data?.valid && data?.patient) {
          this.patient.set(data.patient);
        }
        this.isLoading.set(false);
      });
  }

  getInitials(p: any): string {
    return `${(p.prenom?.[0] ?? '')}${(p.nom?.[0] ?? '')}`.toUpperCase();
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  getAge(d: string): number {
    if (!d) return 0;
    return Math.floor((Date.now() - new Date(d).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }

  getIMC(taille: number, poids: number): string {
    const imc = poids / ((taille / 100) ** 2);
    return imc.toFixed(1);
  }

  parseList(val: string | string[]): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    return val.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  }
}
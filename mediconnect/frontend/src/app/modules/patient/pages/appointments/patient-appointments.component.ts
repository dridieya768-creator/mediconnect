import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, debounceTime, distinctUntilChanged, Subject, switchMap, of } from "rxjs";

type ViewMode = "list" | "new" | "detail" | "cancel" | "rate";
type FilterTab = "upcoming" | "past" | "all";

@Component({
  selector: "app-patient-appointments",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="appt-page">

      <!-- HEADER SIMPLE -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Mes Rendez-vous</h1>
          <p class="page-subtitle">Gerez vos consultations et teleconsultations</p>
        </div>
        <button class="btn-primary" (click)="showView('new')" *ngIf="view() !== 'new'">
          + Nouveau RDV
        </button>
      </div>

      <!-- ── MESSAGES ───────────────────────────────── -->
      <div class="alert-success" *ngIf="successMsg()">✔ {{ successMsg() }}</div>
      <div class="alert-error"   *ngIf="errorMsg()">✖ {{ errorMsg() }}</div>

      <!-- ══════════════════════════════════════════════
           VUE LISTE
           ══════════════════════════════════════════════ -->
      <ng-container *ngIf="view() === 'list'">

        <!-- Tabs -->
        <div class="tabs-bar">
          <button class="tab-btn" [class.active]="filterTab() === 'upcoming'" (click)="setFilter('upcoming')">
            ➠ À venir <span class="tab-count">{{ upcomingCount() }}</span>
          </button>
          <button class="tab-btn" [class.active]="filterTab() === 'past'" (click)="setFilter('past')">
            ⏱ Passés <span class="tab-count">{{ pastCount() }}</span>
          </button>
          <button class="tab-btn" [class.active]="filterTab() === 'all'" (click)="setFilter('all')">
            𓂃🖊 Tous <span class="tab-count">{{ appointments().length }}</span>
          </button>
        </div>

        <!-- Loading -->
        <div class="loading-state" *ngIf="isLoading()">
          <div class="spinner"></div>
          <p>Chargement de vos rendez-vous...</p>
        </div>

        <!-- Liste -->
        <div class="appt-list" *ngIf="!isLoading()">
          <div class="appt-card" *ngFor="let appt of filteredAppointments()" (click)="openDetail(appt)">
            <div class="appt-date-block" [class.date-video]="isVideo(appt)">
              <div class="date-day">{{ formatDay(appt.appointmentDate) }}</div>
              <div class="date-month">{{ formatMonth(appt.appointmentDate) }}</div>
              <div class="date-year">{{ formatYear(appt.appointmentDate) }}</div>
            </div>
            <div class="appt-body">
              <div class="appt-top">
                <div>
                  <div class="appt-doctor">Dr. {{ getDoctorName(appt) }}</div>
                  <div class="appt-spec">{{ getSpecialty(appt) }}</div>
                </div>
                <span class="status-pill" [ngClass]="getStatusClass(appt.status)">
                  {{ getStatusLabel(appt.status) }}
                </span>
              </div>
              <div class="appt-meta">
                <span>{{ isVideo(appt) ? '모 Téléconsultation' : ' Présentiel' }}</span>
                <span>⏱ {{ formatTime(appt.appointmentDate) }}</span>
                <span *ngIf="appt.durationMinutes">⏱ {{ appt.durationMinutes }} min</span>
                <span *ngIf="appt.reason" class="reason-badge">𓂃🖊 {{ appt.reason }}</span>
              </div>
              <div class="appt-actions" (click)="$event.stopPropagation()">
                <button class="btn-sm btn-danger"
                        *ngIf="canCancel(appt)"
                        (click)="openCancel(appt)">✕ Annuler</button>
                <button class="btn-sm btn-video"
                        *ngIf="isVideo(appt) && appt.status === 'CONFIRMED'"
                        (click)="joinVideo(appt)">📽 Rejoindre</button>
                <button class="btn-sm btn-rate"
                        *ngIf="appt.status === 'COMPLETED' && !appt.rated"
                        (click)="openRate(appt)">⭐ Évaluer</button>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div class="empty-state" *ngIf="filteredAppointments().length === 0">
            <div style="font-size:56px"></div>
            <p>Aucun rendez-vous {{ filterTab() === 'upcoming' ? 'à venir' : filterTab() === 'past' ? 'passé' : '' }}</p>
            <button class="btn-primary" (click)="showView('new')">+ Prendre un RDV</button>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════════════════════════════════
           VUE NOUVEAU RDV
           ══════════════════════════════════════════════ -->
      <ng-container *ngIf="view() === 'new'">
        <div class="form-card">
          <div class="form-header">
            <button class="btn-back" (click)="showView('list')">← Retour</button>
            <h2>Nouveau Rendez-vous</h2>
          </div>

          <!-- Étape 1 : Recherche médecin -->
          <div class="step-block">
            <div class="step-label"><span class="step-num">1</span> Trouver un médecin</div>
            <div class="search-bar">
              <input class="form-input" type="text" [(ngModel)]="searchQuery"
                     placeholder="🔍︎ Nom du médecin..."
                     (ngModelChange)="onSearchChange($event)" />
              <select class="form-select" [(ngModel)]="searchSpecialty" (change)="searchDoctors()">
                <option value="">Toutes spécialités</option>
                <option *ngFor="let s of specialties" [value]="s">{{ s }}</option>
              </select>
            </div>
            <div class="doctors-grid" *ngIf="doctors().length > 0">
              <div class="doctor-card"
                   *ngFor="let doc of doctors()"
                   [class.selected]="selectedDoctor()?.id === doc.id"
                   (click)="selectDoctor(doc)">
                <div class="doc-avatar">{{ getInitials(doc) }}</div>
                <div class="doc-info">
                  <div class="doc-name">Dr. {{ doc.firstName || doc.first_name }} {{ doc.lastName || doc.last_name }}</div>
                  <div class="doc-spec">{{ doc.specialite || doc.specialty || 'Médecin généraliste' }}</div>
                  <div class="doc-meta">
                    <span *ngIf="doc.ville || doc.city">📍 {{ doc.ville || doc.city }}</span>
                    <span class="doc-badge video" *ngIf="doc.teleconsultation">모 Téléconsult.</span>
                  </div>
                </div>
                <div class="doc-check" *ngIf="selectedDoctor()?.id === doc.id">✓</div>
              </div>
            </div>
            <div class="search-hint" *ngIf="doctors().length === 0 && !searchLoading()">
              Tapez pour rechercher un médecin disponible
            </div>
            <div class="search-hint" *ngIf="searchLoading()"> Recherche en cours...</div>
          </div>

          <!-- Étape 2 : Créneaux -->
          <div class="step-block" *ngIf="selectedDoctor()">
            <div class="step-label"><span class="step-num">2</span> Choisir un créneau</div>
            <div class="slot-picker">
              <div class="slot-date-nav">
                <button class="btn-nav" (click)="prevWeek()">‹</button>
                <div class="slot-dates">
                  <div class="slot-day-col" *ngFor="let day of slotDays()">
                    <div class="slot-day-label">{{ day.label }}</div>
                    <div class="slot-day-date">{{ day.date }}</div>
                    <div class="slot-time"
                         *ngFor="let slot of day.slots"
                         [class.selected]="selectedSlot() === slot.datetime"
                         [class.taken]="slot.taken"
                         (click)="!slot.taken && selectSlot(slot.datetime)">{{ slot.time }}</div>
                    <div class="slot-empty" *ngIf="day.slots.length === 0">—</div>
                  </div>
                </div>
                <button class="btn-nav" (click)="nextWeek()">›</button>
              </div>
            </div>
          </div>
          <!-- Message créneau occupé — centré dans l'étape 2 -->
<div class="slot-taken-overlay" *ngIf="slotTakenError()">
  <div class="slot-taken-box">
    <div class="slot-taken-icon">⏱</div>
    <div class="slot-taken-title">Ce créneau est déjà occupé</div>
    <div class="slot-taken-sub">Veuillez choisir un autre horaire disponible</div>
    <button class="slot-taken-btn" (click)="slotTakenError.set(false); selectedSlot.set(null)">
      Choisir un autre créneau
    </button>
  </div>
</div>
          <!-- Étape 3 : Confirmation -->
          <div class="step-block" *ngIf="selectedDoctor() && selectedSlot()">
            <div class="step-label"><span class="step-num">3</span> Confirmer le rendez-vous</div>
            <div class="confirm-grid">
              <div class="form-group">
                <label class="form-label">Type de consultation</label>
                <select class="form-select" [(ngModel)]="newAppt.consultationType">
                  <option value="PHYSICAL"> Présentiel</option>
                  <option value="TELECONSULTATION">모 Téléconsultation</option>
                  <option value="HOME_VISIT">🏠︎ À domicile</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Durée</label>
                <select class="form-select" [(ngModel)]="newAppt.durationMinutes">
                  <option [value]="15">15 minutes</option>
                  <option [value]="30">30 minutes</option>
                  <option [value]="45">45 minutes</option>
                  <option [value]="60">1 heure</option>
                </select>
              </div>
              <div class="form-group-full">
                <label class="form-label">Motif de consultation</label>
                <textarea class="form-input" rows="3" [(ngModel)]="newAppt.reason"
                          placeholder="Décrivez brièvement le motif de votre visite..."></textarea>
              </div>
            </div>

            <!-- Récapitulatif -->
            <div class="recap-box">
              <div class="recap-row">
                <span> Médecin</span>
                <strong>Dr. {{ selectedDoctor()?.firstName || selectedDoctor()?.first_name }}
                        {{ selectedDoctor()?.lastName  || selectedDoctor()?.last_name }}</strong>
              </div>
              <div class="recap-row">
                <span> Date & heure</span>
                <strong>{{ formatFullDate(selectedSlot()!) }}</strong>
              </div>
              <div class="recap-row">
                <span> Type</span>
                <strong>{{ getTypeLabel(newAppt.consultationType) }}</strong>
              </div>
              <div class="recap-row">
                <span>⏱ Durée</span>
                <strong>{{ newAppt.durationMinutes }} minutes</strong>
              </div>
            </div>

            <button class="btn-primary btn-full" (click)="createAppointment()" [disabled]="isCreating()">
              {{ isCreating() ? ' Confirmation...' : '✔ Confirmer le rendez-vous' }}
            </button>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════════════════════════════════
           VUE DÉTAIL
           ══════════════════════════════════════════════ -->
      <ng-container *ngIf="view() === 'detail' && selectedAppt()">
        <div class="form-card">
          <div class="form-header">
            <button class="btn-back" (click)="showView('list')">← Retour</button>
            <h2>Détail du Rendez-vous</h2>
          </div>
          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label"> Médecin</span>
              <span class="detail-value">Dr. {{ getDoctorName(selectedAppt()!) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🩺 Spécialité</span>
              <span class="detail-value">{{ getSpecialty(selectedAppt()!) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label"> Date</span>
              <span class="detail-value">{{ formatFullDate(selectedAppt()!.appointmentDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">⏱ Durée</span>
              <span class="detail-value">{{ selectedAppt()!.durationMinutes }} min</span>
            </div>
            <div class="detail-row">
              <span class="detail-label"> Type</span>
              <span class="detail-value">{{ getTypeLabel(selectedAppt()!.consultationType) }}</span>
            </div>
            <div class="detail-row" *ngIf="selectedAppt()!.reason">
              <span class="detail-label">𓂃🖊 Motif</span>
              <span class="detail-value">{{ selectedAppt()!.reason }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label"> Statut</span>
              <span class="status-pill" [ngClass]="getStatusClass(selectedAppt()!.status)">
                {{ getStatusLabel(selectedAppt()!.status) }}
              </span>
            </div>
            <div class="detail-row" *ngIf="selectedAppt()!.cancellationReason">
              <span class="detail-label">💬 Motif annulation</span>
              <span class="detail-value">{{ selectedAppt()!.cancellationReason }}</span>
            </div>
            <div class="detail-row" *ngIf="selectedAppt()!.notes">
              <span class="detail-label">🗒 Notes médecin</span>
              <span class="detail-value">{{ selectedAppt()!.notes }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <button class="btn-danger"
                    *ngIf="canCancel(selectedAppt()!)"
                    (click)="openCancel(selectedAppt()!)">✕ Annuler ce RDV</button>
            <button class="btn-video"
                    *ngIf="isVideo(selectedAppt()!) && selectedAppt()!.status === 'CONFIRMED'"
                    (click)="joinVideo(selectedAppt()!)">📽 Rejoindre la téléconsultation</button>
            <button class="btn-rate"
                    *ngIf="selectedAppt()!.status === 'COMPLETED' && !selectedAppt()!.rated"
                    (click)="openRate(selectedAppt()!)">⭐ Évaluer la consultation</button>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════════════════════════════════
           VUE ANNULATION
           ══════════════════════════════════════════════ -->
      <ng-container *ngIf="view() === 'cancel' && selectedAppt()">
        <div class="form-card">
          <div class="form-header">
            <button class="btn-back" (click)="showView('list')">← Retour</button>
            <h2>Annuler le Rendez-vous</h2>
          </div>
          <div class="cancel-warning">
            <div style="font-size:32px">⚠️</div>
            <div>
              <strong>Vous êtes sur le point d'annuler votre RDV</strong><br>
              Dr. {{ getDoctorName(selectedAppt()!) }} — {{ formatFullDate(selectedAppt()!.appointmentDate) }}<br>
              <span style="color:#ef4444; font-size:13px;">Cette action est irréversible.</span>
            </div>
          </div>
          <div class="form-group" style="margin-top:20px;">
            <label class="form-label">Motif d'annulation *</label>
            <select class="form-select" [(ngModel)]="cancelReason">
              <option value="">— Sélectionner un motif —</option>
              <option value="Empêchement personnel">Empêchement personnel</option>
              <option value="Problème de transport">Problème de transport</option>
              <option value="Guérison spontanée">Guérison spontanée</option>
              <option value="Changement de médecin">Changement de médecin</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div class="form-group" style="margin-top:12px;">
            <label class="form-label">Précisions (optionnel)</label>
            <textarea class="form-input" rows="3" [(ngModel)]="cancelNote"
                      placeholder="Informations supplémentaires..."></textarea>
          </div>
          <div style="display:flex; gap:12px; margin-top:20px;">
            <button class="btn-outline flex-1" (click)="showView('list')">Conserver le RDV</button>
            <button class="btn-danger flex-1"
                    (click)="confirmCancel()"
                    [disabled]="!cancelReason || isCancelling()">
              {{ isCancelling() ? ' Annulation...' : "✕ Confirmer l'annulation" }}
            </button>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════════════════════════════════
           VUE ÉVALUATION
           ══════════════════════════════════════════════ -->
      <ng-container *ngIf="view() === 'rate' && selectedAppt()">
        <div class="form-card">
          <div class="form-header">
            <button class="btn-back" (click)="showView('list')">← Retour</button>
            <h2>Évaluer la Consultation</h2>
          </div>
          <div style="text-align:center; padding:16px 0 24px;">
            <div style="font-size:40px; margin-bottom:8px;"></div>
            <p style="color:#64748b;">Votre avis aide les autres patients à choisir leur médecin</p>
            <p style="font-weight:600; color:#0f172a;">Dr. {{ getDoctorName(selectedAppt()!) }}</p>
          </div>
          <div class="stars-row">
            <span *ngFor="let i of [1,2,3,4,5]"
                  class="star"
                  [class.filled]="i <= hoverRating() || (hoverRating() === 0 && i <= rating())"
                  (click)="rating.set(i)"
                  (mouseenter)="hoverRating.set(i)"
                  (mouseleave)="hoverRating.set(0)">★</span>
          </div>
          <div class="rating-label">{{ getRatingLabel() }}</div>
          <div class="form-group" style="margin-top:20px;">
            <label class="form-label">Votre commentaire</label>
            <textarea class="form-input" rows="4" [(ngModel)]="ratingComment"
                      placeholder="Partagez votre expérience avec ce médecin..."></textarea>
          </div>
          <div style="display:flex; gap:12px; margin-top:20px;">
            <button class="btn-outline flex-1" (click)="showView('list')">Annuler</button>
            <button class="btn-primary flex-1"
                    (click)="submitRating()"
                    [disabled]="!rating() || isRating()">
              {{ isRating() ? ' Envoi...' : ' Publier mon avis' }}
            </button>
          </div>
        </div>
      </ng-container>

    </div>
  `,
  styles: [`
     .slot-taken-overlay {
  display:flex; justify-content:center; margin-top:16px;
}
.slot-taken-box {
  background:#fff7ed; border:2px solid #fed7aa;
  border-radius:14px; padding:24px 32px;
  text-align:center; max-width:340px;
  box-shadow:0 4px 20px rgba(234,88,12,.12);
  animation:fadeIn .25s ease;
}
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
.slot-taken-icon  { font-size:36px; margin-bottom:8px; }
.slot-taken-title { font-size:16px; font-weight:700; color:#c2410c; margin-bottom:4px; }
.slot-taken-sub   { font-size:13px; color:#9a3412; margin-bottom:16px; }
.slot-taken-btn {
  padding:9px 20px; background:#ea580c; color:white;
  border:none; border-radius:8px; font-size:13px;
  font-weight:600; cursor:pointer;
}
.slot-taken-btn:hover { background:#c2410c; }
    .appt-page { padding: 24px; background: #f1f5f9; min-height: 100vh; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
    .page-title { font-size:26px; font-weight:700; color:#0f172a; margin:0 0 4px; }
    .page-subtitle { color:#64748b; font-size:14px; margin:0; }

    .alert-success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }
    .alert-error   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }

    .tabs-bar { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
    .tab-btn { padding:8px 18px; border:1.5px solid #e2e8f0; border-radius:24px; background:white; font-size:13px; cursor:pointer; color:#64748b; display:flex; align-items:center; gap:6px; transition:all .15s; }
    .tab-btn.active { border-color:#1a56db; color:#1a56db; background:#eff6ff; font-weight:600; }
    .tab-count { background:#e2e8f0; color:#64748b; border-radius:10px; padding:1px 7px; font-size:11px; }
    .tab-btn.active .tab-count { background:#1a56db; color:white; }

    .loading-state { display:flex; flex-direction:column; align-items:center; padding:60px; color:#64748b; gap:12px; }
    .spinner { width:40px; height:40px; border:3px solid #e2e8f0; border-top-color:#1a56db; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .appt-list { display:flex; flex-direction:column; gap:12px; }
    .appt-card { display:flex; background:white; border-radius:14px; border:1.5px solid #e2e8f0; overflow:hidden; cursor:pointer; transition:all .2s; }
    .appt-card:hover { border-color:#1a56db; box-shadow:0 4px 16px rgba(26,86,219,.1); transform:translateY(-1px); }
    .appt-date-block { min-width:72px; background:#1a56db; color:white; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px 8px; }
    .appt-date-block.date-video { background:#7c3aed; }
    .date-day   { font-size:26px; font-weight:700; line-height:1; }
    .date-month { font-size:11px; text-transform:uppercase; opacity:.85; margin-top:2px; }
    .date-year  { font-size:10px; opacity:.7; }
    .appt-body  { flex:1; padding:16px 20px; }
    .appt-top   { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; gap:12px; }
    .appt-doctor { font-size:16px; font-weight:700; color:#0f172a; }
    .appt-spec  { font-size:12px; color:#64748b; margin-top:2px; }
    .appt-meta  { display:flex; flex-wrap:wrap; gap:12px; font-size:12px; color:#475569; margin-bottom:12px; }
    .reason-badge { max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .appt-actions { display:flex; gap:8px; }

    .status-pill       { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; white-space:nowrap; }
    .status-confirmed  { background:#f0fdf4; color:#16a34a; }
    .status-pending    { background:#fffbeb; color:#d97706; }
    .status-cancelled  { background:#fef2f2; color:#dc2626; }
    .status-completed  { background:#f8fafc; color:#64748b; }

    .btn-primary  { padding:10px 20px; background:#1a56db; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; transition:background .15s; }
    .btn-primary:hover { background:#1447c0; }
    .btn-primary:disabled { opacity:.6; cursor:not-allowed; }
    .btn-outline  { padding:10px 20px; background:white; color:#1a56db; border:2px solid #1a56db; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-danger   { padding:10px 20px; background:#dc2626; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-danger:disabled { opacity:.6; cursor:not-allowed; }
    .btn-video    { padding:10px 20px; background:#7c3aed; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-rate     { padding:10px 20px; background:#d97706; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-back     { background:none; border:none; color:#1a56db; cursor:pointer; font-size:14px; font-weight:600; padding:0; }
    .btn-full     { width:100%; }
    .btn-nav      { background:white; border:1.5px solid #e2e8f0; border-radius:8px; padding:8px 14px; cursor:pointer; font-size:16px; }
    .btn-sm       { padding:5px 12px; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; }
    .btn-sm.btn-danger { background:#dc2626; color:white; }
    .btn-sm.btn-video  { background:#7c3aed; color:white; }
    .btn-sm.btn-rate   { background:#d97706; color:white; }
    .flex-1 { flex:1; }

    .form-card    { background:white; border-radius:16px; padding:28px; box-shadow:0 2px 16px rgba(0,0,0,.06); max-width:800px; }
    .form-header  { display:flex; align-items:center; gap:16px; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #f1f5f9; }
    .form-header h2 { font-size:20px; font-weight:700; color:#0f172a; margin:0; }

    .step-block  { margin-bottom:28px; padding:20px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0; }
    .step-label  { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:700; color:#0f172a; margin-bottom:16px; }
    .step-num    { width:28px; height:28px; background:#1a56db; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }

    .search-bar  { display:flex; gap:10px; margin-bottom:16px; }
    .search-hint { text-align:center; color:#94a3b8; font-size:13px; padding:20px; }
    .doctors-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); gap:12px; }
    .doctor-card  { background:white; border:1.5px solid #e2e8f0; border-radius:10px; padding:14px; cursor:pointer; display:flex; align-items:flex-start; gap:12px; transition:all .15s; position:relative; }
    .doctor-card:hover  { border-color:#1a56db; }
    .doctor-card.selected { border-color:#1a56db; background:#eff6ff; }
    .doc-avatar   { width:40px; height:40px; background:#1a56db; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; flex-shrink:0; }
    .doc-info     { flex:1; min-width:0; }
    .doc-name     { font-size:13px; font-weight:700; color:#0f172a; }
    .doc-spec     { font-size:11px; color:#64748b; margin:2px 0; }
    .doc-meta     { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; }
    .doc-badge    { font-size:10px; padding:2px 6px; border-radius:6px; font-weight:600; }
    .doc-badge.video { background:#eff6ff; color:#1a56db; }
    .doc-check    { position:absolute; top:10px; right:10px; color:#1a56db; font-size:16px; font-weight:700; }

    .slot-picker       { overflow-x:auto; }
    .slot-date-nav     { display:flex; align-items:flex-start; gap:8px; }
    .slot-dates        { display:flex; gap:8px; flex:1; overflow-x:auto; }
    .slot-day-col      { flex:1; min-width:70px; }
    .slot-day-label    { font-size:11px; color:#64748b; text-align:center; font-weight:600; text-transform:uppercase; }
    .slot-day-date     { font-size:16px; font-weight:700; color:#0f172a; text-align:center; margin:4px 0 8px; }
    .slot-time         { background:white; border:1.5px solid #e2e8f0; border-radius:6px; padding:6px; text-align:center; font-size:12px; cursor:pointer; margin-bottom:4px; transition:all .15s; }
    .slot-time:hover:not(.taken) { border-color:#1a56db; color:#1a56db; }
    .slot-time.selected { background:#1a56db; color:white; border-color:#1a56db; }
    .slot-time.taken   { background:#f1f5f9; color:#cbd5e1; cursor:not-allowed; text-decoration:line-through; }
    .slot-empty        { text-align:center; color:#cbd5e1; font-size:20px; padding:10px; }

    .confirm-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px; }
    .recap-box    { background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:16px; margin-bottom:20px; }
    .recap-row    { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #dbeafe; font-size:13px; }
    .recap-row:last-child { border:none; }
    .recap-row span { color:#64748b; }

    .detail-grid    { margin-bottom:24px; }
    .detail-row     { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9; font-size:14px; }
    .detail-label   { color:#64748b; }
    .detail-value   { font-weight:600; color:#0f172a; text-align:right; }
    .detail-actions { display:flex; gap:12px; flex-wrap:wrap; }

    .cancel-warning { display:flex; gap:16px; align-items:flex-start; background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:16px; margin-bottom:8px; font-size:14px; line-height:1.6; }

    .stars-row    { display:flex; justify-content:center; gap:8px; margin:8px 0 4px; }
    .star         { font-size:40px; cursor:pointer; transition:transform .1s; color:#e2e8f0; position:relative; z-index:1; }
    .star.filled  { color:#d97706; }
    .star:hover   { transform:scale(1.15); }
    .rating-label { text-align:center; color:#64748b; font-size:14px; margin-bottom:8px; min-height:24px; }

    .form-group      { display:flex; flex-direction:column; gap:6px; }
    .form-group-full { grid-column:1/-1; display:flex; flex-direction:column; gap:6px; }
    .form-label      { font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }
    .form-input      { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; width:100%; box-sizing:border-box; resize:vertical; font-family:inherit; }
    .form-input:focus { border-color:#1a56db; }
    .form-select     { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; background:white; width:100%; font-family:inherit; }
    .form-select:focus { border-color:#1a56db; }

    .empty-state { text-align:center; padding:60px 20px; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:16px; background:white; border-radius:14px; }

    @media (max-width:640px) {
      .confirm-grid  { grid-template-columns:1fr; }
      .doctors-grid  { grid-template-columns:1fr; }
      .detail-actions { flex-direction:column; }
      .search-bar    { flex-direction:column; }
    }
  `]
})
export class PatientAppointmentsComponent implements OnInit {
  private http   = inject(HttpClient);
  private router = inject(Router);
  slotTakenError = signal(false);
  view         = signal<ViewMode>("list");
  filterTab    = signal<FilterTab>("upcoming");
  isLoading    = signal(true);
  isCreating   = signal(false);
  isCancelling = signal(false);
  isRating     = signal(false);
  successMsg   = signal<string | null>(null);
  errorMsg     = signal<string | null>(null);

  patientId      = signal<string | null>(null);
  appointments   = signal<any[]>([]);
  doctors        = signal<any[]>([]);
  selectedAppt   = signal<any>(null);
  selectedDoctor = signal<any>(null);
  doctorConges   = signal<any[]>([]);
  selectedSlot   = signal<string | null>(null);

  searchQuery     = "";
  searchSpecialty = "";
  searchLoading   = signal(false);
  private searchSubject = new Subject<string>();

  specialties = [
    "Cardiologue","Dermatologue","Urgentiste","Médecin de famille",
    "Gynécologue","Neurologue","Ophtalmologue","ORL","Pédiatre",
    "Psychiatre","Radiologue","Rhumatologue","Urologue"
  ];

  currentWeekStart = signal<Date>(this.getMonday(new Date()));

  newAppt       = { consultationType: "PHYSICAL", durationMinutes: 30, reason: "" };
  cancelReason  = "";
  cancelNote    = "";
  rating        = signal(0);
  hoverRating   = signal(0);
  ratingComment = "";

  upcomingCount = computed(() => this.appointments().filter(a => this.isUpcoming(a)).length);
  pastCount     = computed(() => this.appointments().filter(a => !this.isUpcoming(a)).length);

  filteredAppointments = computed(() => {
    const tab = this.filterTab();
    const all = this.appointments();
    if (tab === "upcoming") return all.filter(a => this.isUpcoming(a));
    if (tab === "past")     return all.filter(a => !this.isUpcoming(a));
    return all;
  });

  slotDays = computed(() => {
    const start = new Date(this.currentWeekStart());
    const _conges = this.doctorConges(); // dépendance réactive sur les congés
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        date:  d.getDate().toString(),
        slots: this.generateSlots(d),
      };
    });
  });

  ngOnInit() {
    this.loadPatient();
    // FIX: Correct pipe implementation without nested pipe
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q && !this.searchSpecialty) {
          this.doctors.set([]);
          return of(null);
        }
        this.searchLoading.set(true);
        const params: any = {};
        if (q) params["search"] = q;
        if (this.searchSpecialty) params["specialite"] = this.searchSpecialty;
        return this.http.get<any>("/api/v1/medecins", { params })
          .pipe(catchError(() => of({ data: [] })));
      })
    ).subscribe(res => {
      if (res) {
        const list: any[] = res?.data?.data ?? res?.data ?? (Array.isArray(res) ? res : []);
        const normalized = list.map((doc: any) => ({
          ...doc,
          firstName:       doc.firstName   || doc.first_name  || '',
          lastName:        doc.lastName    || doc.last_name   || '',
          ville:           doc.profile?.ville       || doc.ville       || '',
          specialite:      doc.profile?.specialite  || doc.specialite  || '',
          teleconsultation: doc.profile?.disponTeleconsult ?? doc.teleconsultation ?? false,
          avatarUrl:       doc.profile?.photoPro    || doc.avatarUrl   || null,
        }));
        this.doctors.set(normalized);
      }
      this.searchLoading.set(false);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FIX PRINCIPAL : normalisation robuste de la réponse API
  // L'API NestJS peut retourner :
  //   - un tableau direct           : [{ id, ... }, ...]
  //   - un objet wrappé             : { data: [{ id, ... }, ...] }
  //   - un objet doublement wrappé  : { data: { data: [...] } }
  // ─────────────────────────────────────────────────────────────────────────
  private normalizeList(res: any): any[] {
    if (Array.isArray(res))             return res;
    if (Array.isArray(res?.data))       return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  }

  loadPatient() {
    this.isLoading.set(true);

    this.http.get<any>("/api/v1/patients/me")
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        const patient = res?.data ?? res;

        // Utiliser userId (user_id) pour charger les RDV — c'est la clé dans appointments
        const patientUserId = patient?.userId ?? patient?.id;

        if (!patientUserId) {
          console.warn("[Appointments] Impossible de récupérer le patient :", res);
          this.isLoading.set(false);
          return;
        }

        this.patientId.set(patientUserId);

        this.http.get<any>(`/api/v1/appointments/patient/${patientUserId}`)
          .pipe(catchError(err => {
            console.error("[Appointments] Erreur chargement RDV :", err);
            return of([]);
          }))
          .subscribe(appts => {
            const list = this.normalizeList(appts);

            console.log(`[Appointments] ${list.length} RDV chargés pour patient ${patientUserId}`);

            this.appointments.set(
              list.sort((a: any, b: any) =>
                new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
              )
            );
            this.isLoading.set(false);
          });
      });
  }

  showView(v: ViewMode) {
    this.view.set(v);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    if (v === "new") {
      this.selectedDoctor.set(null);
      this.selectedSlot.set(null);
      this.newAppt = { consultationType: "PHYSICAL", durationMinutes: 30, reason: "" };
      this.searchQuery     = "";
      this.searchSpecialty = "";
      this.doctors.set([]);
    }
  }

  setFilter(f: FilterTab) { this.filterTab.set(f); }
  openDetail(appt: any)   { this.selectedAppt.set(appt); this.showView("detail"); }
  openCancel(appt: any)   { this.selectedAppt.set(appt); this.cancelReason = ""; this.cancelNote = ""; this.showView("cancel"); }
  openRate(appt: any)     { this.selectedAppt.set(appt); this.rating.set(0); this.ratingComment = ""; this.showView("rate"); }

  onSearchChange(q: string) { this.searchSubject.next(q); }

  searchDoctors() {
    if (!this.searchQuery && !this.searchSpecialty) { this.doctors.set([]); return; }
    this.searchSubject.next(this.searchQuery);
  }

  selectDoctor(doc: any) {
    this.selectedDoctor.set(doc);
    this.selectedSlot.set(null);
    this.currentWeekStart.set(this.getMonday(new Date()));
    // Charger les congés du médecin et forcer recalcul du calendrier
    const doctorId = doc.userId || doc.id;
    this.http.get<any>('/api/v1/medecins/' + doctorId + '/availability')
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        const data = res?.data ?? res;
        const conges = data?.conges ?? [];
        this.doctorConges.set(conges);
          // Forcer recalcul : reset à lundi de la semaine courante
        this.currentWeekStart.set(this.getMonday(new Date()));
      });
  }

  isDateInConge(date: Date): boolean {
    const d = new Date(date); d.setHours(0,0,0,0);
    return this.doctorConges().some(c => {
      const start = new Date(c.startDate); start.setHours(0,0,0,0);
      const end   = new Date(c.endDate);   end.setHours(23,59,59,999);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
      if (start.getFullYear() < 2000 || end.getFullYear() < 2000) return false;
      return d >= start && d <= end;
    });
  }

  generateSlots(date: Date): { time: string; datetime: string; taken: boolean }[] {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date < today) return [];
    // Bloquer les jours de congé
    if (this.isDateInConge(date)) return [];
    const times = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30","16:00","16:30"];
    return times.map(t => {
      const dt = new Date(date);
      const [h, m] = t.split(":");
      dt.setHours(+h, +m, 0, 0);
      return { time: t, datetime: dt.toISOString(), taken: Math.random() < 0.25 };
    });
  }

  selectSlot(datetime: string) { this.selectedSlot.set(datetime); }

  prevWeek() {
    const d = new Date(this.currentWeekStart());
    d.setDate(d.getDate() - 7);
    if (d >= this.getMonday(new Date())) this.currentWeekStart.set(d);
  }

  nextWeek() {
    const d = new Date(this.currentWeekStart());
    d.setDate(d.getDate() + 7);
    this.currentWeekStart.set(d);
  }

  createAppointment() {
    const doc       = this.selectedDoctor();
    const slot      = this.selectedSlot();
    const patientId = this.patientId();
    if (!doc || !slot || !patientId) return;
    this.isCreating.set(true);

    const payload = {
      patientId,
      doctorId:         doc.userId || doc.id,
      appointmentDate:  slot,
      durationMinutes:  +this.newAppt.durationMinutes,
      consultationType: this.newAppt.consultationType,
      reason:           this.newAppt.reason,
    };

    this.http.post<any>("/api/v1/appointments", payload).subscribe({
      next: (res) => {
        // FIX : le backend peut retourner { data: appt } ou l'objet directement
        const appt = res?.data ?? res;
        this.appointments.update(list =>
          [appt, ...list].sort((a, b) =>
            new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
          )
        );
        this.isCreating.set(false);
        this.successMsg.set("Rendez-vous confirmé avec succès !");
        this.showView("list");
        setTimeout(() => this.successMsg.set(null), 4000);
      },
       error: (err: any) => {
  this.isCreating.set(false);
  const raw = err?.error?.message;
  const msg = typeof raw === 'string' ? raw
            : Array.isArray(raw)      ? raw[0]
            : err?.message            || '';
  const isSlotTaken = msg.toLowerCase().includes('conflict')
                   || msg.toLowerCase().includes('créneau')
                   || msg.toLowerCase().includes('déjà')
                   || msg.toLowerCase().includes('taken')
                   || err?.status === 409;
  this.slotTakenError.set(isSlotTaken);
  if (!isSlotTaken) {
    this.errorMsg.set(msg || "Erreur lors de la création du RDV.");
    setTimeout(() => this.errorMsg.set(null), 5000);
  }
}
    });
  }

  confirmCancel() {
    const appt = this.selectedAppt();
    if (!appt || !this.cancelReason) return;
    this.isCancelling.set(true);
    const reason = this.cancelNote ? `${this.cancelReason} — ${this.cancelNote}` : this.cancelReason;

    this.http.patch<any>(`/api/v1/appointments/${appt.id}/cancel`, { reason }).subscribe({
      next: () => {
        this.appointments.update(list =>
          list.map(a => a.id === appt.id ? { ...a, status: "CANCELLED", cancellationReason: reason } : a)
        );
        this.isCancelling.set(false);
        this.successMsg.set("RDV annulé avec succès.");
        this.showView("list");
        setTimeout(() => this.successMsg.set(null), 4000);
      },
      error: () => {
        this.isCancelling.set(false);
        this.errorMsg.set("Erreur lors de l'annulation.");
        setTimeout(() => this.errorMsg.set(null), 5000);
      }
    });
  }

  submitRating() {
    const appt = this.selectedAppt();
    if (!appt || !this.rating()) return;
    this.isRating.set(true);
    this.http.post<any>(`/api/v1/appointments/${appt.id}/rate`, {
      rating: this.rating(),
      comment: this.ratingComment
    }).pipe(catchError(() => of(null))).subscribe(() => {
      this.appointments.update(list =>
        list.map(a => a.id === appt.id ? { ...a, rated: true } : a)
      );
      this.isRating.set(false);
      this.successMsg.set("Merci pour votre évaluation !");
      this.showView("list");
      setTimeout(() => this.successMsg.set(null), 4000);
    });
  }

  joinVideo(appt: any) {
    // Naviguer vers la page téléconsultation dédiée
    this.router.navigate(['/patient/video', appt.id]);
  }

  isUpcoming(a: any): boolean {
    return new Date(a.appointmentDate) > new Date() && a.status !== "CANCELLED";
  }
  canCancel(a: any): boolean {
    return a.status === "CONFIRMED" || a.status === "REQUESTED";
  }
  isVideo(a: any): boolean { return a.consultationType === "TELECONSULTATION"; }

  getDoctorName(a: any): string {
    return a.doctor?.lastName || a.doctor?.last_name || a.medecin?.user?.last_name || "Médecin";
  }
  getSpecialty(a: any): string {
    return a.medecin?.specialite || a.doctor?.specialty || "Médecin généraliste";
  }
  getInitials(doc: any): string {
    const f = (doc.firstName || doc.first_name || "")[0] || "";
    const l = (doc.lastName  || doc.last_name  || "")[0] || "";
    return (f + l).toUpperCase();
  }

  formatDay(d: any):      string { return d ? new Date(d).getDate().toString().padStart(2, "0") : "--"; }
  formatMonth(d: any):    string { return d ? new Date(d).toLocaleDateString("fr-FR", { month: "short" }).toUpperCase() : "--"; }
  formatYear(d: any):     string { return d ? new Date(d).getFullYear().toString() : ""; }
  formatTime(d: any):     string { return d ? new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""; }
  formatFullDate(d: any): string {
    if (!d) return "";
    return new Date(d).toLocaleDateString("fr-FR", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })
         + " à " + this.formatTime(d);
  }

  getStatusLabel(s: string): string {
    return ({ CONFIRMED:"✓ Confirmé", REQUESTED:"⏳ En attente", CANCELLED:"✕ Annulé", COMPLETED:"✔ Terminé", NO_SHOW:"⚠ Absent" } as any)[s] || s;
  }
  getStatusClass(s: string): string {
    return ({ CONFIRMED:"status-confirmed", REQUESTED:"status-pending", CANCELLED:"status-cancelled", COMPLETED:"status-completed", NO_SHOW:"status-cancelled" } as any)[s] || "status-pending";
  }
  getTypeLabel(t: string): string {
    return ({ PHYSICAL:"🏥 Présentiel", TELECONSULTATION:"💻 Téléconsultation", HOME_VISIT:"🏠 À domicile" } as any)[t] || t;
  }
  getRatingLabel(): string {
    return (["","😞 Très déçu","😐 Décevant","🙂 Correct","😊 Bien","🌟 Excellent !"] as any)[this.hoverRating() || this.rating()] || "";
  }

  getMonday(d: Date): Date {
    const date = new Date(d);
    const day  = date.getDay();
    date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
    date.setHours(0, 0, 0, 0);
    return date;
  }
}









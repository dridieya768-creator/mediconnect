import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

type PlanningView = "calendar" | "requests" | "slots" | "conges";

@Component({
  selector: "app-medecin-planning",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="planning-page">

      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">📅 Mon Planning</h1>
          <p class="page-subtitle">Gérez vos disponibilités et demandes de RDV</p>
        </div>
        <div class="header-actions">
          <button class="btn-outline" (click)="activeView.set('slots')">
            ⚙️ Gérer disponibilités
          </button>
          <div class="notif-badge" *ngIf="pendingCount() > 0">
            {{ pendingCount() }} demande(s) en attente
          </div>
        </div>
      </div>

      <!-- MESSAGES -->
      <div class="alert-success" *ngIf="successMsg()">✅ {{ successMsg() }}</div>
      <div class="alert-error"   *ngIf="errorMsg()">❌ {{ errorMsg() }}</div>

      <!-- NAV TABS -->
      <div class="tabs-bar">
        <button class="tab-btn" [class.active]="activeView() === 'calendar'" (click)="activeView.set('calendar')">
          📆 Calendrier
        </button>
        <button class="tab-btn" [class.active]="activeView() === 'requests'" (click)="activeView.set('requests')">
          📥 Demandes
          <span class="tab-count pending" *ngIf="pendingCount() > 0">{{ pendingCount() }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeView() === 'slots'" (click)="activeView.set('slots')">
          🕐 Disponibilités
        </button>
        <button class="tab-btn" [class.active]="activeView() === 'conges'" (click)="activeView.set('conges')">
          🏖️ Congés
          <span class="tab-count" *ngIf="conges().length > 0">{{ conges().length }}</span>
        </button>
      </div>

      <!-- ══════════════════════════════════════════
           VUE CALENDRIER
           ══════════════════════════════════════════ -->
      <ng-container *ngIf="activeView() === 'calendar'">
        <div class="calendar-card">

          <!-- Week navigation -->
          <div class="cal-nav">
            <button class="btn-nav" (click)="prevWeek()">‹</button>
            <span class="cal-title">{{ weekRangeLabel() }}</span>
            <button class="btn-nav" (click)="nextWeek()">›</button>
            <button class="btn-today" (click)="goToday()">Aujourd'hui</button>
          </div>

          <!-- Loading -->
          <div class="loading-state" *ngIf="isLoading()">
            <div class="spinner"></div>
            <p>Chargement...</p>
          </div>

          <!-- Calendar grid -->
          <div class="cal-grid" *ngIf="!isLoading()">
            <div class="cal-day-col" *ngFor="let day of calendarDays()">
              <div class="cal-day-header" [class.today]="day.isToday">
                <div class="cal-day-name">{{ day.name }}</div>
                <div class="cal-day-num" [class.today-num]="day.isToday">{{ day.num }}</div>
              </div>
              <div class="cal-day-body">
                <div class="cal-appt"
                     *ngFor="let appt of day.appointments"
                     [ngClass]="getApptClass(appt.status)"
                     (click)="openApptModal(appt)">
                  <div class="cal-appt-time">{{ formatTime(appt.appointmentDate) }}</div>
                  <div class="cal-appt-name">{{ getPatientName(appt) }}</div>
                  <div class="cal-appt-type">{{ appt.consultationType === 'TELECONSULTATION' ? '💻' : '🏥' }}</div>
                </div>
                <div class="cal-empty-day" *ngIf="day.appointments.length === 0">
                  <span>—</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="cal-legend">
            <span class="legend-item confirmed">✓ Confirmé</span>
            <span class="legend-item pending">⏳ En attente</span>
            <span class="legend-item completed">✔ Terminé</span>
            <span class="legend-item cancelled">✕ Annulé</span>
          </div>
        </div>

        <!-- Modal détail RDV -->
        <div class="modal-overlay" *ngIf="modalAppt()" (click)="closeModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Détail du Rendez-vous</h3>
              <button class="btn-close" (click)="closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <div class="detail-row">
                <span class="detail-label">👤 Patient</span>
                <span class="detail-value">{{ getPatientName(modalAppt()!) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Date</span>
                <span class="detail-value">{{ formatFullDate(modalAppt()!.appointmentDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">⏱ Durée</span>
                <span class="detail-value">{{ modalAppt()!.durationMinutes }} min</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🏥 Type</span>
                <span class="detail-value">{{ getTypeLabel(modalAppt()!.consultationType) }}</span>
              </div>
              <div class="detail-row" *ngIf="modalAppt()!.reason">
                <span class="detail-label">📝 Motif</span>
                <span class="detail-value">{{ modalAppt()!.reason }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📌 Statut</span>
                <span class="status-pill" [ngClass]="getStatusClass(modalAppt()!.status)">
                  {{ getStatusLabel(modalAppt()!.status) }}
                </span>
              </div>
            </div>
            <div class="modal-actions" *ngIf="modalAppt()!.status === 'REQUESTED'">
              <button class="btn-danger" (click)="refuseFromModal()">✕ Refuser</button>
              <button class="btn-primary" (click)="acceptFromModal()">✓ Confirmer</button>
            </div>
            <div class="modal-actions" *ngIf="modalAppt()!.status === 'CONFIRMED'">
              <button class="btn-video" *ngIf="modalAppt()!.consultationType === 'TELECONSULTATION'"
                      (click)="joinVideo(modalAppt()!)">📹 Démarrer téléconsult.</button>
              <button class="btn-complete" (click)="completeAppt(modalAppt()!)">✔ Marquer terminé</button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════════════════════════════
           VUE DEMANDES EN ATTENTE
           ══════════════════════════════════════════ -->
      <ng-container *ngIf="activeView() === 'requests'">
        <div class="section-title">
          📥 Demandes de rendez-vous en attente
          <span class="badge-count">{{ pendingAppointments().length }}</span>
        </div>

        <div class="loading-state" *ngIf="isLoading()">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>

        <div class="requests-list" *ngIf="!isLoading()">
          <div class="request-card" *ngFor="let req of pendingAppointments()">
            <div class="req-left">
              <div class="req-avatar">{{ getPatientInitials(req) }}</div>
              <div class="req-info">
                <div class="req-name">{{ getPatientName(req) }}</div>
                <div class="req-meta">
                  <span>📅 {{ formatFullDate(req.appointmentDate) }}</span>
                  <span>⏱ {{ req.durationMinutes }} min</span>
                  <span>{{ req.consultationType === 'TELECONSULTATION' ? '💻 Téléconsultation' : '🏥 Présentiel' }}</span>
                </div>
                <div class="req-reason" *ngIf="req.reason">📝 {{ req.reason }}</div>
              </div>
            </div>
            <div class="req-actions">
              <button class="btn-refuse" (click)="openRefuse(req)">✕ Refuser</button>
              <button class="btn-accept" (click)="acceptRequest(req)" [disabled]="processingId() === req.id">
                {{ processingId() === req.id ? '⏳' : '✓ Confirmer' }}
              </button>
            </div>
          </div>

          <!-- Refus modal -->
          <div class="modal-overlay" *ngIf="refuseTarget()" (click)="refuseTarget.set(null)">
            <div class="modal-card" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Refuser le rendez-vous</h3>
                <button class="btn-close" (click)="refuseTarget.set(null)">✕</button>
              </div>
              <div class="modal-body">
                <p style="color:#64748b; margin:0 0 16px;">
                  Patient : <strong>{{ getPatientName(refuseTarget()!) }}</strong><br>
                  Date : <strong>{{ formatFullDate(refuseTarget()!.appointmentDate) }}</strong>
                </p>
                <div class="form-group">
                  <label class="form-label">Motif de refus *</label>
                  <select class="form-select" [(ngModel)]="refuseReason">
                    <option value="">— Sélectionner —</option>
                    <option value="Agenda complet">Agenda complet</option>
                    <option value="Hors compétence">Hors compétence médicale</option>
                    <option value="Créneau non disponible">Créneau non disponible</option>
                    <option value="Urgence prioritaire">Urgence prioritaire</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div class="form-group" style="margin-top:12px;">
                  <label class="form-label">Message au patient (optionnel)</label>
                  <textarea class="form-input" rows="3" [(ngModel)]="refuseNote"
                            placeholder="Expliquez brièvement..."></textarea>
                </div>
              </div>
              <div class="modal-actions">
                <button class="btn-outline" (click)="refuseTarget.set(null)">Annuler</button>
                <button class="btn-danger" (click)="confirmRefuse()" [disabled]="!refuseReason || isProcessing()">
                  {{ isProcessing() ? '⏳' : '✕ Confirmer le refus' }}
                </button>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="pendingAppointments().length === 0">
            <div style="font-size:48px">✅</div>
            <p>Aucune demande en attente</p>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════════════════════════════
           VUE DISPONIBILITÉS
           ══════════════════════════════════════════ -->
      <ng-container *ngIf="activeView() === 'slots'">
        <div class="form-card">
          <h2 class="section-title">🕐 Gérer mes disponibilités</h2>
          <p style="color:#64748b; font-size:14px; margin-bottom:24px;">
            Définissez vos plages horaires de travail. Les créneaux seront automatiquement proposés aux patients.
          </p>

          <div class="slots-grid">
            <div class="slot-day-row" *ngFor="let day of workDays">
              <div class="slot-day-name">
                <label class="toggle-label">
                  <input type="checkbox" [(ngModel)]="day.active" class="toggle-input">
                  <span class="toggle-switch"></span>
                  {{ day.name }}
                </label>
              </div>
              <div class="slot-time-inputs" *ngIf="day.active">
                <div class="time-range">
                  <span>Matin :</span>
                  <select class="form-select-sm" [(ngModel)]="day.morningStart">
                    <option *ngFor="let t of morningTimes" [value]="t">{{ t }}</option>
                  </select>
                  <span>→</span>
                  <select class="form-select-sm" [(ngModel)]="day.morningEnd">
                    <option *ngFor="let t of morningTimes" [value]="t">{{ t }}</option>
                  </select>
                </div>
                <div class="time-range">
                  <span>Après-midi :</span>
                  <select class="form-select-sm" [(ngModel)]="day.afternoonStart">
                    <option *ngFor="let t of afternoonTimes" [value]="t">{{ t }}</option>
                  </select>
                  <span>→</span>
                  <select class="form-select-sm" [(ngModel)]="day.afternoonEnd">
                    <option *ngFor="let t of afternoonTimes" [value]="t">{{ t }}</option>
                  </select>
                </div>
              </div>
              <div class="slot-day-off" *ngIf="!day.active">
                <span>Jour de repos</span>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top:24px; max-width:300px;">
            <label class="form-label">Durée par défaut d'une consultation</label>
            <select class="form-select" [(ngModel)]="defaultDuration">
              <option [value]="15">15 minutes</option>
              <option [value]="20">20 minutes</option>
              <option [value]="30">30 minutes</option>
              <option [value]="45">45 minutes</option>
              <option [value]="60">1 heure</option>
            </select>
          </div>

          <div class="form-group" style="margin-top:16px;">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="acceptsTeleconsultation" class="toggle-input">
              <span class="toggle-switch"></span>
              <span style="font-size:14px; font-weight:600;">Accepter les téléconsultations (Jitsi Meet)</span>
            </label>
          </div>

          <button class="btn-primary" style="margin-top:28px;" (click)="saveAvailability()" [disabled]="isSavingSlots()">
            {{ isSavingSlots() ? '⏳ Enregistrement...' : '💾 Enregistrer les disponibilités' }}
          </button>
        </div>
      </ng-container>

      <!-- ══════════════════════════════════════════
           VUE CONGÉS
           ══════════════════════════════════════════ -->
      <ng-container *ngIf="activeView() === 'conges'">
        <div class="form-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <div>
              <h2 class="section-title" style="margin:0;">🏖️ Gestion des Congés</h2>
              <p style="color:#64748b; font-size:14px; margin:4px 0 0;">Bloquez des périodes d'indisponibilité. Les patients ne pourront pas réserver pendant ces dates.</p>
            </div>
            <button class="btn-primary" (click)="addConge()">+ Ajouter une période</button>
          </div>

          <!-- Liste des congés -->
          <div class="conges-list" *ngIf="conges().length > 0">
            <div class="conge-item" *ngFor="let c of conges(); let i = index">
              <div class="conge-icon">🏖️</div>
              <div class="conge-info">
                <div class="conge-label">{{ c.label || 'Congé' }}</div>
                <div class="conge-dates">
                  Du <strong>{{ formatDateFr(c.startDate) }}</strong>
                  au <strong>{{ formatDateFr(c.endDate) }}</strong>
                  <span class="conge-days">({{ getDays(c.startDate, c.endDate) }} jour(s))</span>
                </div>
                <div class="conge-msg" *ngIf="c.message">
                  Message aux patients : <em>{{ c.message }}</em>
                </div>
              </div>
              <div class="conge-status" [class.active]="isCongeActive(c)" [class.upcoming]="isCongeUpcoming(c)">
                {{ isCongeActive(c) ? 'En cours' : isCongeUpcoming(c) ? 'À venir' : 'Passé' }}
              </div>
              <button class="btn-rm-conge" (click)="removeConge(i)" title="Supprimer">✕</button>
            </div>
          </div>

          <div class="empty-state" *ngIf="conges().length === 0" style="background:#f8fafc; border-radius:12px; padding:40px; text-align:center; color:#94a3b8;">
            <div style="font-size:48px; margin-bottom:12px;">🏖️</div>
            <p>Aucune période de congé définie</p>
          </div>

          <!-- Formulaire ajout congé -->
          <div class="conge-form" *ngIf="showCongeForm()">
            <div class="conge-form-title">Nouvelle période de congé</div>
            <div class="conge-form-grid">
              <div class="form-group">
                <label class="form-label">Libellé</label>
                <input class="form-input" [(ngModel)]="newConge.label" placeholder="Ex: Vacances d'été, Congrès médical..." />
              </div>
              <div class="form-group">
                <label class="form-label">Date de début *</label>
                <input class="form-input" type="date" [(ngModel)]="newConge.startDate" [min]="today()" />
              </div>
              <div class="form-group">
                <label class="form-label">Date de fin *</label>
                <input class="form-input" type="date" [(ngModel)]="newConge.endDate" [min]="newConge.startDate || today()" />
              </div>
              <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">Message aux patients (optionnel)</label>
                <textarea class="form-input" rows="2" [(ngModel)]="newConge.message"
                          placeholder="Ex: Je serai absent du cabinet. Pour urgences, contactez le Dr..."></textarea>
              </div>
            </div>
            <div style="display:flex; gap:12px; margin-top:16px;">
              <button class="btn-outline" (click)="showCongeForm.set(false)">Annuler</button>
              <button class="btn-primary" (click)="saveConge()"
                      [disabled]="!newConge.startDate || !newConge.endDate || isSavingConge()">
                {{ isSavingConge() ? '⏳ Enregistrement...' : '✅ Confirmer le congé' }}
              </button>
            </div>
          </div>
        </div>
      </ng-container>

    </div>
  `,
  styles: [`
    .planning-page { padding:0; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .page-title  { font-size:26px; font-weight:700; color:#0f172a; margin:0 0 4px; }
    .page-subtitle { color:#64748b; font-size:14px; margin:0; }
    .header-actions { display:flex; align-items:center; gap:12px; }

    .notif-badge { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:8px; padding:6px 12px; font-size:12px; font-weight:600; }

    .alert-success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }
    .alert-error   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }

    .tabs-bar { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
    .tab-btn { padding:8px 18px; border:1.5px solid #e2e8f0; border-radius:24px; background:white; font-size:13px; cursor:pointer; color:#64748b; display:flex; align-items:center; gap:6px; transition:all .15s; }
    .tab-btn.active { border-color:#4f46e5; color:#4f46e5; background:#eef2ff; font-weight:600; }
    .tab-count { background:#e2e8f0; color:#64748b; border-radius:10px; padding:1px 7px; font-size:11px; }
    .tab-count.pending { background:#fef2f2; color:#dc2626; }
    .tab-btn.active .tab-count { background:#4f46e5; color:white; }

    .calendar-card { background:white; border-radius:16px; padding:24px; box-shadow:0 2px 16px rgba(0,0,0,.06); overflow:hidden; }
    .cal-nav { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .cal-title { font-size:16px; font-weight:700; color:#0f172a; flex:1; text-align:center; }
    .btn-nav  { background:white; border:1.5px solid #e2e8f0; border-radius:8px; padding:6px 14px; cursor:pointer; font-size:16px; }
    .btn-today { padding:6px 14px; background:#4f46e5; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
    .cal-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; }
    .cal-day-col { min-width:0; }
    .cal-day-header { text-align:center; padding:8px 4px; border-radius:8px 8px 0 0; }
    .cal-day-header.today { background:#eef2ff; }
    .cal-day-name { font-size:11px; color:#64748b; text-transform:uppercase; font-weight:600; }
    .cal-day-num  { font-size:20px; font-weight:700; color:#0f172a; }
    .cal-day-num.today-num { color:#4f46e5; }
    .cal-day-body { min-height:120px; border:1px solid #f1f5f9; border-radius:0 0 8px 8px; padding:4px; }
    .cal-appt { padding:4px 6px; border-radius:6px; margin-bottom:4px; cursor:pointer; transition:opacity .15s; }
    .cal-appt:hover { opacity:.85; }
    .cal-appt-time { font-size:10px; font-weight:700; }
    .cal-appt-name { font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cal-appt-type { font-size:10px; }
    .cal-appt.appt-confirmed  { background:#dcfce7; color:#166534; }
    .cal-appt.appt-requested  { background:#fef9c3; color:#854d0e; }
    .cal-appt.appt-completed  { background:#f1f5f9; color:#475569; }
    .cal-appt.appt-cancelled  { background:#fef2f2; color:#dc2626; opacity:.6; }
    .cal-empty-day { display:flex; align-items:center; justify-content:center; height:60px; color:#e2e8f0; font-size:20px; }
    .cal-legend { display:flex; gap:16px; margin-top:16px; flex-wrap:wrap; padding-top:12px; border-top:1px solid #f1f5f9; }
    .legend-item { font-size:12px; display:flex; align-items:center; gap:6px; }
    .legend-item::before { content:''; width:12px; height:12px; border-radius:3px; }
    .legend-item.confirmed::before { background:#dcfce7; }
    .legend-item.pending::before   { background:#fef9c3; }
    .legend-item.completed::before { background:#f1f5f9; }
    .legend-item.cancelled::before { background:#fef2f2; }

    .section-title { font-size:16px; font-weight:700; color:#0f172a; margin-bottom:16px; display:flex; align-items:center; gap:10px; }
    .badge-count   { background:#4f46e5; color:white; border-radius:10px; padding:2px 10px; font-size:12px; }
    .requests-list { display:flex; flex-direction:column; gap:12px; }
    .request-card  { background:white; border-radius:12px; border:1.5px solid #e2e8f0; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:16px; transition:border-color .15s; }
    .request-card:hover { border-color:#4f46e5; }
    .req-left   { display:flex; gap:14px; align-items:flex-start; flex:1; }
    .req-avatar { width:44px; height:44px; background:#4f46e5; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; flex-shrink:0; }
    .req-info   { flex:1; }
    .req-name   { font-size:15px; font-weight:700; color:#0f172a; }
    .req-meta   { display:flex; flex-wrap:wrap; gap:10px; font-size:12px; color:#64748b; margin:4px 0; }
    .req-reason { font-size:12px; color:#475569; background:#f8fafc; padding:4px 8px; border-radius:6px; margin-top:4px; }
    .req-actions { display:flex; gap:8px; flex-shrink:0; }
    .btn-accept { padding:8px 18px; background:#16a34a; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-accept:disabled { opacity:.6; cursor:not-allowed; }
    .btn-refuse { padding:8px 18px; background:white; color:#dc2626; border:1.5px solid #dc2626; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }

    .form-card { background:white; border-radius:16px; padding:28px; box-shadow:0 2px 16px rgba(0,0,0,.06); }
    .slots-grid { display:flex; flex-direction:column; gap:12px; }
    .slot-day-row { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px 18px; display:flex; align-items:flex-start; gap:16px; flex-wrap:wrap; }
    .slot-day-name { min-width:120px; }
    .slot-time-inputs { display:flex; flex-direction:column; gap:8px; flex:1; }
    .slot-day-off { color:#94a3b8; font-size:13px; flex:1; padding-top:6px; }
    .time-range { display:flex; align-items:center; gap:8px; font-size:13px; color:#64748b; flex-wrap:wrap; }
    .form-select-sm { padding:5px 8px; border:1.5px solid #e2e8f0; border-radius:6px; font-size:13px; background:white; cursor:pointer; }

    .toggle-label  { display:flex; align-items:center; gap:10px; cursor:pointer; font-size:14px; font-weight:600; color:#0f172a; }
    .toggle-input  { display:none; }
    .toggle-switch { width:40px; height:22px; background:#e2e8f0; border-radius:11px; position:relative; transition:background .2s; flex-shrink:0; }
    .toggle-switch::after { content:''; position:absolute; top:3px; left:3px; width:16px; height:16px; background:white; border-radius:50%; transition:transform .2s; }
    .toggle-input:checked + .toggle-switch { background:#4f46e5; }
    .toggle-input:checked + .toggle-switch::after { transform:translateX(18px); }

    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:999; padding:20px; }
    .modal-card    { background:white; border-radius:16px; padding:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,.2); }
    .modal-header  { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
    .modal-header h3 { font-size:18px; font-weight:700; color:#0f172a; margin:0; }
    .btn-close     { background:none; border:none; font-size:20px; cursor:pointer; color:#64748b; }
    .modal-body    { margin-bottom:20px; }
    .modal-actions { display:flex; gap:12px; }

    .detail-row   { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:14px; }
    .detail-label { color:#64748b; }
    .detail-value { font-weight:600; color:#0f172a; }

    .status-pill      { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
    .status-confirmed { background:#f0fdf4; color:#16a34a; }
    .status-pending   { background:#fffbeb; color:#d97706; }
    .status-cancelled { background:#fef2f2; color:#dc2626; }
    .status-completed { background:#f8fafc; color:#64748b; }

    .btn-primary  { padding:10px 20px; background:#4f46e5; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-primary:disabled { opacity:.6; cursor:not-allowed; }
    .btn-outline  { padding:9px 18px; background:white; color:#4f46e5; border:1.5px solid #4f46e5; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-danger   { padding:10px 20px; background:#ef4444; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-danger:disabled { opacity:.6; cursor:not-allowed; }
    .btn-video    { padding:10px 20px; background:#3b82f6; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-complete { padding:10px 20px; background:#1a56db; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }

    .loading-state { display:flex; flex-direction:column; align-items:center; padding:60px; color:#64748b; gap:12px; }
    .spinner { width:40px; height:40px; border:3px solid #e2e8f0; border-top-color:#4f46e5; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .empty-state { text-align:center; padding:60px 20px; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:16px; background:white; border-radius:14px; }

    .form-group  { display:flex; flex-direction:column; gap:6px; }
    .form-label  { font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }
    .form-input  { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; width:100%; box-sizing:border-box; resize:vertical; font-family:inherit; }
    .form-input:focus { border-color:#4f46e5; }
    .form-select { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; background:white; outline:none; width:100%; font-family:inherit; }
    .form-select:focus { border-color:#4f46e5; }

    @media (max-width:640px) {
      .cal-grid { grid-template-columns:repeat(3,1fr); }
      .req-actions { flex-direction:column; }
      .request-card { flex-direction:column; }
    }

    /* ── Congés ─────────────────────────────────────────────── */
    .conges-list { display:flex; flex-direction:column; gap:12px; margin-bottom:20px; }
    .conge-item { display:flex; align-items:flex-start; gap:14px; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px; padding:16px; transition:border-color .15s; }
    .conge-item:hover { border-color:#4f46e5; }
    .conge-icon { font-size:24px; flex-shrink:0; }
    .conge-info { flex:1; }
    .conge-label { font-size:15px; font-weight:700; color:#0f172a; margin-bottom:4px; }
    .conge-dates { font-size:13px; color:#475569; }
    .conge-days { background:#eff6ff; color:#1a56db; padding:2px 8px; border-radius:6px; font-size:11px; font-weight:600; margin-left:8px; }
    .conge-msg { font-size:12px; color:#64748b; margin-top:4px; font-style:italic; }
    .conge-status { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; flex-shrink:0; }
    .conge-status.active { background:#fef9c3; color:#854d0e; }
    .conge-status.upcoming { background:#f0fdf4; color:#16a34a; }
    .conge-status:not(.active):not(.upcoming) { background:#f1f5f9; color:#94a3b8; }
    .btn-rm-conge { background:none; border:none; color:#dc2626; cursor:pointer; font-size:18px; padding:0; flex-shrink:0; }
    .conge-form { background:#f0f7ff; border:1.5px solid #bfdbfe; border-radius:12px; padding:20px; margin-top:20px; }
    .conge-form-title { font-size:15px; font-weight:700; color:#0f172a; margin-bottom:16px; }
    .conge-form-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
  `]
})
export class MedecinPlanningComponent implements OnInit {
  private http   = inject(HttpClient);
  private router = inject(Router);

  activeView     = signal<PlanningView>("calendar");
  isLoading      = signal(true);
  isProcessing   = signal(false);
  isSavingSlots  = signal(false);
  processingId   = signal<string | null>(null);
  successMsg     = signal<string | null>(null);
  errorMsg       = signal<string | null>(null);

  // ── FIX : stocker l'ID utilisé pour recharger si besoin ──────────────────
  medecinDoctorId = signal<string | null>(null);

  appointments   = signal<any[]>([]);
  modalAppt      = signal<any>(null);
  refuseTarget   = signal<any>(null);
  refuseReason   = "";
  refuseNote     = "";

  currentWeekStart = signal<Date>(this.getMonday(new Date()));

  defaultDuration          = 30;
  acceptsTeleconsultation  = true;

  workDays = [
    { name: "Lundi",    active: true,  morningStart: "08:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "18:00" },
    { name: "Mardi",    active: true,  morningStart: "08:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "18:00" },
    { name: "Mercredi", active: true,  morningStart: "08:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "17:00" },
    { name: "Jeudi",    active: true,  morningStart: "08:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "18:00" },
    { name: "Vendredi", active: true,  morningStart: "08:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "17:00" },
    { name: "Samedi",   active: false, morningStart: "09:00", morningEnd: "13:00", afternoonStart: "14:00", afternoonEnd: "16:00" },
    { name: "Dimanche", active: false, morningStart: "09:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "16:00" },
  ];

  morningTimes   = ["07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00"];
  afternoonTimes = ["12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"];

  // ── Congés ────────────────────────────────────────────────────────────────
  conges         = signal<any[]>([]);
  showCongeForm  = signal(false);
  isSavingConge  = signal(false);
  newConge: any  = { label: '', startDate: '', endDate: '', message: '' };

  // ── Computed ──────────────────────────────────────────────────────────────
  pendingAppointments = computed(() =>
    this.appointments().filter(a => a.status === "REQUESTED")
  );
  pendingCount = computed(() => this.pendingAppointments().length);

  calendarDays = computed(() => {
    const start = new Date(this.currentWeekStart());
    const appts = this.appointments();
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return {
        name: d.toLocaleDateString("fr-FR", { weekday: "short" }).toUpperCase(),
        num:  d.getDate(),
        isToday: d.getTime() === today.getTime(),
        appointments: appts.filter(a => {
          const ad = new Date(a.appointmentDate);
          return ad.getFullYear() === d.getFullYear()
              && ad.getMonth()    === d.getMonth()
              && ad.getDate()     === d.getDate();
        })
      };
    });
  });

  weekRangeLabel = computed(() => {
    const start = new Date(this.currentWeekStart());
    const end   = new Date(start); end.setDate(end.getDate() + 4);
    return `${start.toLocaleDateString("fr-FR", { day:"2-digit", month:"long" })} – ${end.toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })}`;
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
ngOnInit() { 
  this.loadAppointments(); 
  this.loadAvailability();
}

loadAvailability() {
  this.http.get<any>('/api/v1/medecins/availability')
    .pipe(catchError(err => {
      console.error('[Availability] ERREUR:', err);
      return of(null);
    }))
    .subscribe(res => {
      console.log('[Availability] réponse brute:', JSON.stringify(res));
      
      // Le backend retourne { workDays, defaultDuration, acceptsTeleconsultation }
      // mais peut-être wrappé dans { data: ... } ou { success: true, data: ... }
      const raw  = res?.data ?? res;
// Si workDays encore null, essayer de lire depuis tarifs (fallback)
const data = (raw?.workDays !== null && raw?.workDays !== undefined)
  ? raw
  : (() => {
      try {
        const t = typeof raw?.tarifs === 'string' ? JSON.parse(raw.tarifs) : raw?.tarifs;
        return t?.workDays ? { ...raw, ...t } : raw;
      } catch { return raw; }
    })();
      
      console.log('[Availability] data extraite:', JSON.stringify(data));
      
      if (!data) return;

      if (Array.isArray(data.workDays) && data.workDays.length > 0) {
        this.workDays = this.workDays.map(defaultDay => {
          const saved = data.workDays.find((d: any) => d.name === defaultDay.name);
          return saved ? { ...defaultDay, ...saved } : defaultDay;
        });
        console.log('[Availability] workDays restaurés:', this.workDays);
      }

      if (data.defaultDuration) {
        this.defaultDuration = data.defaultDuration;
      }

      if (data.acceptsTeleconsultation !== undefined) {
        this.acceptsTeleconsultation = data.acceptsTeleconsultation;
      }

      // Charger les congés
      if (Array.isArray(data.conges)) {
        this.conges.set(data.conges);
      }
    });
}

  loadAppointments() {
    this.isLoading.set(true);

    this.http.get<any>("/api/v1/medecins/me")
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        console.log("[Planning] doctorId résolu:", res?.data?.data?.id);
        // ── Réponse brute confirmée : { success: true, data: { id, userId, ... } }
        // On lit directement res.data.userId (confirmé par les logs)
       const doctorId =
  res?.data?.data?.id     ||  // ← AJOUTER EN PREMIER
  res?.data?.data?.userId ||  // ← AJOUTER
  res?.data?.userId       ||
  res?.data?.id           ||
  res?.userId             ||
  res?.id                 ||
  null;
        if (!doctorId) {
          console.error("[Planning] Aucun doctorId trouvé. Réponse brute :", res);
          this.isLoading.set(false);
          return;
        }

        this.medecinDoctorId.set(doctorId);

        this.http.get<any>(`/api/v1/appointments/doctor/${doctorId}`)
          .pipe(catchError(err => {
            console.error("[Planning] Erreur chargement appointments :", err);
            return of([]);
          }))
          .subscribe(appts => {
            // Normalise : tableau direct OU { data: [...] } OU { data: { data: [...] } }
            const list: any[] =
              Array.isArray(appts)             ? appts :
              Array.isArray(appts?.data)       ? appts.data :
              Array.isArray(appts?.data?.data) ? appts.data.data :
              [];

            this.appointments.set(list);
            this.isLoading.set(false);
          });
      });
  }

  // ── Calendar navigation ────────────────────────────────────────────────────
  prevWeek() {
    const d = new Date(this.currentWeekStart());
    d.setDate(d.getDate() - 7);
    this.currentWeekStart.set(d);
  }
  nextWeek() {
    const d = new Date(this.currentWeekStart());
    d.setDate(d.getDate() + 7);
    this.currentWeekStart.set(d);
  }
  goToday() { this.currentWeekStart.set(this.getMonday(new Date())); }

  // ── Modal ──────────────────────────────────────────────────────────────────
  openApptModal(appt: any) { this.modalAppt.set(appt); }
  closeModal()             { this.modalAppt.set(null); }

  // ── Accept / Refuse ────────────────────────────────────────────────────────
// Remplacez la méthode acceptRequest par celle-ci :

acceptRequest(req: any) {
  this.processingId.set(req.id);
  
  // ✅ Utiliser le bon endpoint avec PATCH
  this.http.patch<any>(`/api/v1/medecins/appointments/${req.id}/accept`, {}).subscribe({
    next: (response) => {
      console.log('✅ Rendez-vous accepté:', response);
      
      // Mettre à jour le statut du rendez-vous
      this.appointments.update(list =>
        list.map(a => a.id === req.id ? { ...a, status: "CONFIRMED" } : a)
      );
      this.processingId.set(null);
      this.showSuccess("✅ Rendez-vous confirmé ! Le patient a été ajouté à votre liste.");
      
      // Optionnel: recharger la liste des patients dans le composant patients
      // Vous pouvez émettre un événement ou recharger les données
    },
    error: (err) => {
      this.processingId.set(null);
      console.error('❌ Erreur lors de l\'acceptation:', err);
      
      // Extraire le message d'erreur correctement
      let errorMessage = "Erreur lors de la confirmation du rendez-vous.";
      
      if (err?.error?.message) {
        const rawMsg = err.error.message;
        if (typeof rawMsg === 'string') {
          errorMessage = rawMsg;
        } else if (Array.isArray(rawMsg)) {
          errorMessage = rawMsg[0];
        } else if (typeof rawMsg === 'object') {
          errorMessage = JSON.stringify(rawMsg);
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      // Message personnalisé pour conflit de créneau
      if (errorMessage.includes('déjà réservé') || 
          errorMessage.includes('créneau') || 
          errorMessage.includes('conflict') || 
          errorMessage.includes('occupé')) {
        this.showError('⏰ Ce créneau est déjà occupé. Veuillez choisir un autre horaire.');
      } else {
        this.showError(errorMessage);
      }
    }
  });
}

  acceptFromModal() {
    const appt = this.modalAppt();
    if (appt) { this.acceptRequest(appt); this.closeModal(); }
  }

  openRefuse(req: any) {
    this.refuseTarget.set(req);
    this.refuseReason = "";
    this.refuseNote   = "";
  }

  refuseFromModal() {
    const appt = this.modalAppt();
    if (appt) { this.closeModal(); this.openRefuse(appt); }
  }

  confirmRefuse() {
    const req = this.refuseTarget();
    if (!req || !this.refuseReason) return;
    this.isProcessing.set(true);
    const reason = this.refuseNote
      ? `${this.refuseReason} — ${this.refuseNote}`
      : this.refuseReason;

    this.http.patch<any>(`/api/v1/appointments/${req.id}/cancel`, { reason }).subscribe({
      next: () => {
        this.appointments.update(list =>
          list.map(a => a.id === req.id ? { ...a, status: "CANCELLED", cancellationReason: reason } : a)
        );
        this.isProcessing.set(false);
        this.refuseTarget.set(null);
        this.showSuccess("Demande refusée. Le patient a été notifié.");
      },
      error: () => {
        this.isProcessing.set(false);
        this.showError("Erreur lors du refus.");
      }
    });
  }

  // ── Complete ───────────────────────────────────────────────────────────────
  completeAppt(appt: any) {
    this.http.patch<any>(`/api/v1/appointments/${appt.id}/complete`, {}).subscribe({
      next: () => {
        this.appointments.update(list =>
          list.map(a => a.id === appt.id ? { ...a, status: "COMPLETED" } : a)
        );
        this.closeModal();
        this.showSuccess("Consultation marquée comme terminée.");
      },
      error: () => this.showError("Erreur.")
    });
  }

  // ── Join video ─────────────────────────────────────────────────────────────
  joinVideo(appt: any) {
    this.router.navigate(['/medecin/video', appt.id]);
  }

  // ── Save availability ──────────────────────────────────────────────────────
// ── Save availability ──────────────────────────────────────────────────────
saveAvailability() {
  this.isSavingSlots.set(true);
  const payload = {
    workDays:                this.workDays,
    defaultDuration:         this.defaultDuration,
    acceptsTeleconsultation: this.acceptsTeleconsultation,
    disponTeleconsult:       this.acceptsTeleconsultation,
    connexionVideoIntegree:  this.acceptsTeleconsultation,
  };
  this.http.put<any>('/api/v1/medecins/availability', payload)
    .pipe(catchError(() => of(null)))
    .subscribe(res => {
      this.isSavingSlots.set(false);
      this.showSuccess('Disponibilités enregistrées !');
    });
}

  // ── Helpers ────────────────────────────────────────────────────────────────
  getPatientName(a: any): string {
    const p = a.patient;
    if (!p) return "Patient";
    const prenom = p.prenom || p.firstName || p.first_name || "";
    const nom    = p.nom    || p.lastName  || p.last_name  || "";
    return `${prenom} ${nom}`.trim() || "Patient";
  }

  getPatientInitials(a: any): string {
    const name  = this.getPatientName(a);
    const parts = name.split(" ").filter(Boolean);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] || "P").toUpperCase();
  }

  formatTime(d: any): string {
    return d ? new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
  }

  formatFullDate(d: any): string {
    if (!d) return "";
    return new Date(d).toLocaleDateString("fr-FR", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric"
    }) + " à " + this.formatTime(d);
  }

  getTypeLabel(t: string): string {
    return ({ PHYSICAL: "🏥 Présentiel", TELECONSULTATION: "💻 Téléconsultation", HOME_VISIT: "🏠 À domicile" } as any)[t] || t;
  }

  getStatusLabel(s: string): string {
    return ({ CONFIRMED:"✓ Confirmé", REQUESTED:"⏳ En attente", CANCELLED:"✕ Annulé", COMPLETED:"✔ Terminé", NO_SHOW:"⚠ Absent" } as any)[s] || s;
  }

  getStatusClass(s: string): string {
    return ({ CONFIRMED:"status-confirmed", REQUESTED:"status-pending", CANCELLED:"status-cancelled", COMPLETED:"status-completed" } as any)[s] || "status-pending";
  }

  getApptClass(s: string): string {
    return ({ CONFIRMED:"appt-confirmed", REQUESTED:"appt-requested", COMPLETED:"appt-completed", CANCELLED:"appt-cancelled" } as any)[s] || "appt-requested";
  }

  getMonday(d: Date): Date {
    const date = new Date(d);
    const day  = date.getDay();
    date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // ── Congés ────────────────────────────────────────────────────────────────
  addConge() {
    this.newConge = { label: '', startDate: '', endDate: '', message: '' };
    this.showCongeForm.set(true);
  }

  saveConge() {
    if (!this.newConge.startDate || !this.newConge.endDate) return;
    if (new Date(this.newConge.endDate) < new Date(this.newConge.startDate)) {
      this.showError('La date de fin doit être après la date de début.');
      return;
    }
    this.isSavingConge.set(true);
    const updated = [...this.conges(), { ...this.newConge }];
    this.http.put<any>('/api/v1/medecins/availability', {
      workDays: this.workDays,
      defaultDuration: this.defaultDuration,
      acceptsTeleconsultation: this.acceptsTeleconsultation,
      conges: updated,
    }).pipe(catchError(() => of(null))).subscribe(() => {
      this.conges.set(updated);
      this.showCongeForm.set(false);
      this.isSavingConge.set(false);
      this.showSuccess(`Congé du ${this.formatDateFr(this.newConge.startDate)} au ${this.formatDateFr(this.newConge.endDate)} enregistré.`);
    });
  }

  removeConge(i: number) {
    const updated = this.conges().filter((_, idx) => idx !== i);
    this.http.put<any>('/api/v1/medecins/availability', {
      workDays: this.workDays,
      defaultDuration: this.defaultDuration,
      acceptsTeleconsultation: this.acceptsTeleconsultation,
      conges: updated,
    }).pipe(catchError(() => of(null))).subscribe(() => {
      this.conges.set(updated);
      this.showSuccess('Période de congé supprimée.');
    });
  }

  isCongeActive(c: any): boolean {
    const now = new Date(); now.setHours(0,0,0,0);
    return new Date(c.startDate) <= now && new Date(c.endDate) >= now;
  }

  isCongeUpcoming(c: any): boolean {
    const now = new Date(); now.setHours(0,0,0,0);
    return new Date(c.startDate) > now;
  }

  getDays(start: string, end: string): number {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.round(diff / 86400000) + 1);
  }

  formatDateFr(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  showSuccess(msg: string) {    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 4000);
  }
  showError(msg: string) {
    this.errorMsg.set(msg);
    setTimeout(() => this.errorMsg.set(null), 5000);
  }
}
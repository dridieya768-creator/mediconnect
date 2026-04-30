import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-patient-notifications",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-page">
      <div class="page-header">
        <h1 class="page-title"> Notifications</h1>
        <button class="btn-mark-all" (click)="markAllRead()" *ngIf="unreadCount() > 0">
          ✓ Tout marquer comme lu
        </button>
      </div>

      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <div class="notif-list" *ngIf="!isLoading()">

        <div class="empty-state" *ngIf="notifications().length === 0">
          <div style="font-size:48px"></div>
          <p>Aucune notification</p>
        </div>

        <div class="notif-card"
             *ngFor="let n of notifications()"
             [class.unread]="!n.isRead"
             (click)="markRead(n)">
          <div class="notif-icon">
            {{ n.type === 'APPOINTMENT_CANCELLED' ? '' :
               n.type === 'APPOINTMENT_CONFIRMED' ? '' : '' }}
          </div>
          <div class="notif-content">
            <div class="notif-title">{{ n.title }}</div>
            <div class="notif-msg">{{ n.message }}</div>
            <div class="notif-time">{{ formatDate(n.createdAt) }}</div>
          </div>
          <div class="notif-dot" *ngIf="!n.isRead"></div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .notif-page    { padding: 0; }
    .page-header   { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    .page-title    { font-size:24px; font-weight:700; color:#0f172a; margin:0; }
    .btn-mark-all  { padding:8px 16px; background:#4f46e5; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }

    .notif-list    { display:flex; flex-direction:column; gap:10px; }
    .notif-card    { background:white; border-radius:12px; border:1.5px solid #e2e8f0; padding:16px; display:flex; align-items:flex-start; gap:14px; cursor:pointer; transition:all .15s; }
    .notif-card:hover { border-color:#4f46e5; }
    .notif-card.unread { background:#eef2ff; border-color:#c7d2fe; }

    .notif-icon    { font-size:24px; flex-shrink:0; }
    .notif-content { flex:1; }
    .notif-title   { font-size:14px; font-weight:700; color:#0f172a; margin-bottom:4px; }
    .notif-msg     { font-size:13px; color:#475569; line-height:1.5; }
    .notif-time    { font-size:11px; color:#94a3b8; margin-top:6px; }
    .notif-dot     { width:10px; height:10px; background:#4f46e5; border-radius:50%; flex-shrink:0; margin-top:4px; }

    .loading-state { display:flex; flex-direction:column; align-items:center; padding:60px; color:#64748b; gap:12px; }
    .spinner       { width:36px; height:36px; border:3px solid #e2e8f0; border-top-color:#4f46e5; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .empty-state   { text-align:center; padding:60px 20px; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:16px; background:white; border-radius:14px; }
  `]
})
export class PatientNotificationsComponent implements OnInit {
  private http = inject(HttpClient);

  notifications = signal<any[]>([]);
  isLoading     = signal(true);
  unreadCount   = signal(0);

  ngOnInit() { this.loadNotifications(); }

 loadNotifications() {
  this.isLoading.set(true);
  this.http.get<any>("/api/v1/notifications")
    .pipe(catchError(() => of([])))
    .subscribe(res => {
      // Normalise : tableau direct OU { data: [...] } OU { data: { data: [...] } }
      const list: any[] =
        Array.isArray(res)             ? res :
        Array.isArray(res?.data)       ? res.data :
        Array.isArray(res?.data?.data) ? res.data.data :
        [];

      this.notifications.set(list);
      this.unreadCount.set(list.filter((n: any) => !n.isRead).length);
      this.isLoading.set(false);
    });
}

  markRead(n: any) {
    if (n.isRead) return;
    this.http.patch(`/api/v1/notifications/${n.id}/read`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.notifications.update(list =>
          list.map(x => x.id === n.id ? { ...x, isRead: true } : x)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      });
  }

  markAllRead() {
    this.http.patch("/api/v1/notifications/mark-all-read", {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("fr-FR", {
      weekday: "long", day: "2-digit", month: "long",
      hour: "2-digit", minute: "2-digit"
    });
  }
}
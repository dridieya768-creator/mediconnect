import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-patient-notifications",
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-notifications.component.html',
  styleUrls: ['./patient-notifications.component.scss'],
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

import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminWsNotification {
  type: string;
  title: string;
  message: string;
  userId: string;
  role: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminWsService implements OnDestroy {
  private socket: Socket | null = null;
  private newPro$ = new Subject<AdminWsNotification>();

  /** Observable émis à chaque nouveau compte pro en attente */
  readonly newProNotification$ = this.newPro$.asObservable();

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(`${environment.wsUrl}/notifications`, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[WS Admin] Connecté au serveur WebSocket');
    });

    this.socket.on('admin:new-pro', (data: AdminWsNotification) => {
      console.log('[WS Admin] Nouveau compte pro:', data);
      this.newPro$.next(data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WS Admin] Déconnecté:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[WS Admin] Erreur connexion:', err.message);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.newPro$.complete();
  }
}

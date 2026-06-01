import { Injectable, signal, computed } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap, catchError, throwError, retry } from "rxjs";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  mfaEnabled?: boolean;
  avatarUrl?: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly API = "/api/v1/auth";
  private _currentUser = signal<User | null>(this.loadUserFromStorage());
  private _token = signal<string | null>(this.loadTokenFromStorage());

  currentUser = this._currentUser.asReadonly();
  token = this._token.asReadonly();
  isAuthenticated = computed(() => !!this._currentUser());
  userRole = computed(() => this._currentUser()?.role||"");

  constructor(private http: HttpClient, private router: Router) {}

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/register`, data).pipe(
      tap((res: any) => {
        const payload = res?.data ?? res;
        if (!payload?.pendingApproval) {
          this.handleAuthSuccess(payload);
        }
      }),
      catchError((err: any) => throwError(() =>
        err.error?.message?.[0] || err.error?.message || "Erreur inscription"
      )),
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API}/login`, { email, password }).pipe(
      tap((res: any) => {
        if (!res?.requires2fa && !res?.data?.requires2fa) {
          this.handleAuthSuccess(res?.data ?? res);
        }
      }),
      catchError((err: any) => throwError(() =>
        err.error?.message || "Email ou mot de passe incorrect"
      )),
    );
  }

  loginWithGoogle(googleToken: string): Observable<any> {
    return this.http.post<any>(`${this.API}/sso/google`, { token: googleToken }).pipe(
      tap((res: any) => this.handleAuthSuccess(res)),
      catchError((err: any) => throwError(() =>
        err.error?.message || "Erreur connexion Google"
      )),
    );
  }

  loginWithFacebook(fbToken: string): Observable<any> {
    return this.http.post<any>(`${this.API}/sso/facebook`, { token: fbToken }).pipe(
      tap((res: any) => this.handleAuthSuccess(res)),
      catchError((err: any) => throwError(() =>
        err.error?.message || "Erreur connexion Facebook"
      )),
    );
  }

  setup2fa(): Observable<any> {
    return this.http.post<any>(`${this.API}/2fa/setup`, {}, { headers: this.authHeaders });
  }

  enable2fa(code: string): Observable<any> {
    return this.http.post<any>(`${this.API}/2fa/enable`, { code }, { headers: this.authHeaders }).pipe(
      tap(() => {
        const user = this.loadUserFromStorage();
        if (user) {
          (user as any).mfaEnabled = true;
          localStorage.setItem("current_user", JSON.stringify(user));
          this._currentUser.set(user);
        }
      })
    );
  }

  disable2fa(): Observable<any> {
    return this.http.post<any>(`${this.API}/2fa/disable`, {}, { headers: this.authHeaders }).pipe(
      tap(() => {
        const user = this.loadUserFromStorage();
        if (user) {
          (user as any).mfaEnabled = false;
          localStorage.setItem("current_user", JSON.stringify(user));
          this._currentUser.set(user);
        }
      })
    );
  }

  verify2fa(userId: string, code: string): Observable<any> {
    return this.http.post<any>(`${this.API}/2fa/verify`, { userId, code }).pipe(
      tap((res: any) => this.handleAuthSuccess(res?.data ?? res)),
      catchError((err: any) => throwError(() =>
        err.error?.message || "Code 2FA invalide"
      )),
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.API}/forgot-password`, { email }).pipe(
      catchError((err: any) => throwError(() =>
        err.error?.message || "Erreur lors de l envoi"
      )),
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.API}/reset-password`, { token, newPassword }).pipe(
      catchError((err: any) => throwError(() =>
        err.error?.message || "Token invalide ou expiré"
      )),
    );
  }

  logout(): void {
    this.clearStorage();
    this._currentUser.set(null);
    this._token.set(null);
    this.router.navigate(["/auth/login"]);
  }

  updateAvatar(avatarUrl: string): void {
    const user = this._currentUser();
    if (!user) return;
    const updated = { ...user, avatarUrl };
    localStorage.setItem("current_user", JSON.stringify(updated));
    this._currentUser.set(updated);
  }

  updateMfa(enabled: boolean): void {
    const user = this._currentUser();
    if (!user) return;
    const updated = { ...user, mfaEnabled: enabled };
    localStorage.setItem("current_user", JSON.stringify(updated));
    this._currentUser.set(updated);
  }

  getRedirectPath(role: string): string {
    const routes: Record<string, string> = {
      PATIENT:                 "/patient/dashboard",
      MEDECIN:                 "/medecin/dashboard",
      PHARMACIEN:              "/pharmacie/dashboard",
      ADMIN:                   "/admin/dashboard",
      MEDECIN_GENERALISTE:     "/medecin/dashboard",
      MEDECIN_SPECIALISTE:     "/medecin/dashboard",
      MEDECIN_CHEF_SERVICE:    "/medecin/dashboard",
      ADMIN_SYSTEM:            "/admin/dashboard",
    };
    return routes[role] || "/auth/login";
  }

  private get authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this._token() || ""}` });
  }

  private handleAuthSuccess(payload: any): void {
    try {
      const unwrapped = payload?.data ?? payload;
      const rawUser = unwrapped?.user ?? unwrapped;
      const user = rawUser?.id ? {
        ...rawUser,
        firstName: rawUser.firstName ?? rawUser.first_name ?? '',
        lastName: rawUser.lastName ?? rawUser.last_name ?? '',
      } : null;

      const access_token = unwrapped?.access_token ?? payload?.access_token;
      const refresh_token = unwrapped?.refresh_token ?? payload?.refresh_token;

      if (access_token) localStorage.setItem("access_token", access_token);
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
      if (user?.id) localStorage.setItem("current_user", JSON.stringify(user));

      this._token.set(access_token ?? null);
      this._currentUser.set(user);
    } catch {
      this.clearStorage();
    }
  }

  private loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem("current_user");
      if (!stored || stored === "undefined" || stored === "null") return null;
      return JSON.parse(stored) as User;
    } catch {
      localStorage.removeItem("current_user");
      return null;
    }
  }

  private loadTokenFromStorage(): string | null {
    try {
      const token = localStorage.getItem("access_token");
      if (!token || token === "undefined" || token === "null") return null;
      return token;
    } catch {
      return null;
    }
  }

  private clearStorage(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("current_user");
  }
  getRole ():string{
    return this.currentUser()?.role ??'';
  }
}
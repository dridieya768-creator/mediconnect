import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Tous les rôles exacts de user.entity.ts
export type UserRole =
  | 'PATIENT'
  | 'MEDECIN_GENERALISTE'
  | 'MEDECIN_SPECIALISTE'
  | 'MEDECIN_CHEF_SERVICE'
  | 'MEDECIN_URGENTISTE'
  | 'PHARMACIEN_TITULAIRE'
  | 'PHARMACIEN_ADJOINT'
  | 'PHARMACIEN_GERANT'
  | 'BIOLOGISTE_RESPONSABLE'
  | 'BIOLOGISTE_MEDICAL'
  | 'TECHNICIEN_LABO'
  | 'PRELEVEUR'
  | 'RADIOLOGUE'
  | 'MANIPULATEUR_RADIO'
  | 'TECHNICIEN_IMAGERIE'
  | 'ASSISTANT_MEDICAL'
  | 'SECRETAIRE_MEDICAL'
  | 'ADMIN_SYSTEM'
  | 'SUPPORT';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  phone?: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
}

export interface UsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminStats {
  total: number;
  actifs: number;
  medecins: number;
  patients: number;
}

const API = '/api/v1/admin/users';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private http = inject(HttpClient);

  getAll(params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }): Observable<UsersResponse> {
    let httpParams = new HttpParams();
    if (params?.role)   httpParams = httpParams.set('role',   params.role);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page)   httpParams = httpParams.set('page',   String(params.page));
    if (params?.limit)  httpParams = httpParams.set('limit',  String(params.limit));
    return this.http.get<UsersResponse>(API, { params: httpParams });
  }

  getById(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${API}/${id}`);
  }

  create(dto: CreateUserDto): Observable<AdminUser> {
    return this.http.post<AdminUser>(API, dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${API}/${id}`, dto);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API}/${id}`);
  }

  toggleStatus(id: string, status: UserStatus): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${API}/${id}`, { status });
  }

  resetPassword(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/${id}/reset-password`, {});
  }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>('/api/v1/admin/stats');
  }
}
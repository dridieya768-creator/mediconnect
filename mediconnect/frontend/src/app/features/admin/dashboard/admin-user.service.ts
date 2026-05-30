import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 

export type UserRole =
  | 'PATIENT'
  | 'MEDECIN'
  | 'PHARMACIEN'
  | 'ADMIN';

export type UserStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'PENDING_VERIFICATION'
  | 'PENDING';

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

export interface DoctorDocument {
  id: string;
  userId?: string;
  type: string;
  filename: string;
  originalName: string;  
  filePath?: string;     
  base64?: string;
  status: string;
  createdAt: string;
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

  
  getDoctorDocs(userId: string): Observable<DoctorDocument[]> {
    return this.http.get<any>(`${API}/${userId}/documents`).pipe(
      map((res: any) => {
        if (Array.isArray(res))       return res as DoctorDocument[];
        if (Array.isArray(res?.data)) return res.data as DoctorDocument[];
        return [] as DoctorDocument[];
      })
    );
  }
}
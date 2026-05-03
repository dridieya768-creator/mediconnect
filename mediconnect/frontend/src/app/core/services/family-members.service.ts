import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FamilyMember, CreateFamilyMemberPayload } from '../models/family-member.model';

@Injectable({ providedIn: 'root' })
export class FamilyMembersService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/family-members';

  getAll(): Observable<FamilyMember[]> {
    return this.http.get<any>(this.base).pipe(
      map(res => {
        const data = res?.data ?? res;
        return Array.isArray(data) ? data : [];
      })
    );
  }

  create(payload: CreateFamilyMemberPayload): Observable<FamilyMember> {
    return this.http.post<any>(this.base, payload).pipe(
      map(res => res?.data ?? res)
    );
  }

  update(id: string, payload: Partial<CreateFamilyMemberPayload>): Observable<FamilyMember> {
    return this.http.patch<any>(`${this.base}/${id}`, payload).pipe(
      map(res => res?.data ?? res)
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  uploadDocuments(id: string, docMembre?: File, docPatient?: File): Observable<FamilyMember> {
    const formData = new FormData();
    if (docMembre)  formData.append('docMembre',  docMembre,  docMembre.name);
    if (docPatient) formData.append('docPatient', docPatient, docPatient.name);
    return this.http.post<any>(`${this.base}/${id}/documents`, formData).pipe(
      map(res => res?.data ?? res)
    );
  }
}

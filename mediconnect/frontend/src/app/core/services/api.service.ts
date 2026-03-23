import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "@env/environment";

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly BASE = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => (httpParams = httpParams.set(k, v)));
    return this.http.get<{ data: T }>(`${this.BASE}${path}`, { params: httpParams }).pipe(
      map((res: any) => res.data ?? res),
    );
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<{ data: T }>(`${this.BASE}${path}`, body).pipe(
      map((res: any) => res.data ?? res),
    );
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<{ data: T }>(`${this.BASE}${path}`, body).pipe(
      map((res: any) => res.data ?? res),
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<{ data: T }>(`${this.BASE}${path}`).pipe(
      map((res: any) => res.data ?? res),
    );
  }
}

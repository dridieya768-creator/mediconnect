import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatMessage, AnalyzeSymptomResponse } from '../models/ai-chat.model';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/ai';

  analyzeSymptoms(messages: ChatMessage[]): Observable<AnalyzeSymptomResponse> {
    const payload = {
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    };
    return this.http.post<any>(`${this.base}/analyze-symptoms`, payload).pipe(
      map(res => res?.data ?? res)
    );
  }
}

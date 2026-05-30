import {
  Component,
  OnInit,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AiService } from '../../../../../core/services/ai.service';
import { ChatMessage } from '../../../../../core/models/ai-chat.model';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-card">
      <!-- Header -->
      <div class="chatbot-header">
        <div class="chatbot-icon">🤖</div>
        <div>
          <h3 class="chatbot-title">Assistant IA MediConnect</h3>
          <p class="chatbot-subtitle">Décrivez vos symptômes pour être orienté vers la bonne spécialité</p>
        </div>
      </div>

      
      <div class="disclaimer">
         Ceci est une aide à l'orientation uniquement. Consultez toujours un médecin pour un diagnostic.
      </div>

      
      <div class="messages-area" #messagesContainer>
        <div
          *ngFor="let msg of messages()"
          class="message"
          [class.message-user]="msg.role === 'user'"
          [class.message-ai]="msg.role === 'assistant'"
        >
          <div class="message-avatar">
            {{ msg.role === 'user' ? '' : '🤖' }}
          </div>
          <div class="message-bubble">
            <p class="message-content">{{ msg.content }}</p>
            <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>

        <!-- Typing indicator -->
        <div class="message message-ai" *ngIf="isLoading()">
          <div class="message-avatar">🤖</div>
          <div class="message-bubble typing-bubble">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>

      
      <div class="specialite-banner" *ngIf="specialiteRecommandee()">
        <span class="specialite-label"> Spécialité recommandée : <strong>{{ specialiteRecommandee() }}</strong></span>
        <button class="btn-find-doctor" (click)="navigateToSearch()">
           Trouver un {{ specialiteRecommandee() | lowercase }}
        </button>
      </div>

      
      <div class="input-area">
        <textarea
          class="chat-input"
          [(ngModel)]="userInputText"
          placeholder="Décrivez vos symptômes... (ex: j'ai des douleurs thoraciques depuis 2 jours)"
          rows="2"
          [disabled]="isLoading()"
          (keydown.enter)="onEnterKey($event)"
          maxlength="2000"
        ></textarea>
        <button
          class="btn-send"
          (click)="handleUserMessage()"
          [disabled]="isLoading() || !userInputText.trim()"
        >
          <span *ngIf="!isLoading()">➤</span>
          <span *ngIf="isLoading()" class="spinner-sm"></span>
        </button>
      </div>
      <div class="char-count">{{ userInputText.length }} / 2000</div>
    </div>
  `,
  styles: [`
    .chatbot-card {
      background: white;
      border-radius: 16px;
      border: 1.5px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,.06);
    }

    .chatbot-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px;
      background: linear-gradient(135deg, #1a56db, #2563eb);
      color: white;
    }
    .chatbot-icon { font-size: 32px; }
    .chatbot-title { font-size: 16px; font-weight: 700; margin: 0 0 2px; }
    .chatbot-subtitle { font-size: 12px; opacity: .85; margin: 0; }

    .disclaimer {
      background: #fffbeb;
      border-bottom: 1px solid #fde68a;
      padding: 10px 20px;
      font-size: 12px;
      color: #92400e;
      font-weight: 500;
    }

    .messages-area {
      height: 320px;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8fafc;
    }

    .message {
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }
    .message-user {
      flex-direction: row-reverse;
    }
    .message-avatar {
      font-size: 20px;
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .message-bubble {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
    }
    .message-user .message-bubble {
      background: #1a56db;
      color: white;
      border-bottom-right-radius: 4px;
    }
    .message-ai .message-bubble {
      background: white;
      color: #0f172a;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
    }
    .message-content { margin: 0 0 4px; white-space: pre-wrap; }
    .message-time { font-size: 10px; opacity: .6; }
    .message-user .message-time { text-align: right; display: block; }

    /* Typing dots */
    .typing-bubble {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 12px 16px;
    }
    .dot {
      width: 8px;
      height: 8px;
      background: #94a3b8;
      border-radius: 50%;
      animation: bounce 1.2s infinite;
    }
    .dot:nth-child(2) { animation-delay: .2s; }
    .dot:nth-child(3) { animation-delay: .4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    /* Spécialité banner */
    .specialite-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 20px;
      background: #f0fdf4;
      border-top: 1px solid #bbf7d0;
      border-bottom: 1px solid #bbf7d0;
      flex-wrap: wrap;
    }
    .specialite-label { font-size: 13px; color: #166534; }
    .btn-find-doctor {
      padding: 8px 16px;
      background: #16a34a;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-find-doctor:hover { background: #15803d; }

    /* Input */
    .input-area {
      display: flex;
      gap: 10px;
      padding: 16px 20px 8px;
      background: white;
      border-top: 1px solid #e2e8f0;
    }
    .chat-input {
      flex: 1;
      padding: 10px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
      font-family: inherit;
      resize: none;
      outline: none;
      transition: border-color .15s;
      line-height: 1.5;
    }
    .chat-input:focus { border-color: #1a56db; }
    .chat-input:disabled { background: #f8fafc; color: #94a3b8; }
    .btn-send {
      width: 44px;
      height: 44px;
      background: #1a56db;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      align-self: flex-end;
      transition: background .15s;
    }
    .btn-send:hover:not(:disabled) { background: #1447c0; }
    .btn-send:disabled { opacity: .5; cursor: not-allowed; }
    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .char-count {
      text-align: right;
      font-size: 11px;
      color: #94a3b8;
      padding: 0 20px 12px;
      background: white;
    }
  `],
})
export class AiChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private aiService = inject(AiService);
  private router    = inject(Router);

  messages              = signal<ChatMessage[]>([]);
  isLoading             = signal(false);
  specialiteRecommandee = signal<string | null>(null);
  userInputText         = '';

  private shouldScroll = false;

  ngOnInit(): void {
    // Message d'accueil
    this.messages.set([{
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant médical MediConnect. Décrivez-moi vos symptômes et je vous orienterai vers la bonne spécialité médicale. 😊',
      timestamp: new Date(),
    }]);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  onEnterKey(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      event.preventDefault();
      this.handleUserMessage();
    }
  }

  handleUserMessage(): void {
    const text = this.userInputText.trim();
    if (!text || this.isLoading()) return;

    
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.userInputText = '';
    this.isLoading.set(true);
    this.shouldScroll = true;

    
    const history = this.messages().slice(-20);

    this.aiService.analyzeSymptoms(history)
      .pipe(
        catchError(() => {
          const errMsg: ChatMessage = {
            role: 'assistant',
            content: ' Service temporairement indisponible. Veuillez réessayer dans quelques instants.',
            timestamp: new Date(),
          };
          this.messages.update(msgs => [...msgs, errMsg]);
          this.isLoading.set(false);
          this.shouldScroll = true;
          return EMPTY;
        }),
      )
      .subscribe(response => {
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(),
        };
        this.messages.update(msgs => [...msgs, aiMsg]);

        if (response.specialite) {
          this.specialiteRecommandee.set(response.specialite);
        }

        this.isLoading.set(false);
        this.shouldScroll = true;
      });
  }

  navigateToSearch(): void {
    const specialite = this.specialiteRecommandee();
    if (!specialite) return;
    this.router.navigate(['/patient/recherche'], {
      queryParams: { specialite },
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* silencieux */ }
  }
}

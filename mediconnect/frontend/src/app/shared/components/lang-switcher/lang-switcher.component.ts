import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, AppLang } from '@core/services/i18n.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-switcher">
      <button
        *ngFor="let lang of i18n.langs"
        class="lang-btn"
        [class.active]="i18n.currentLang() === lang.code"
        (click)="i18n.setLang(lang.code)"
        [title]="lang.label"
      >
        <span class="flag">{{ lang.flag }}</span>
        <span class="code">{{ lang.code.toUpperCase() }}</span>
      </button>
    </div>
  `,
  styles: [`
    .lang-switcher {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .lang-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border: 1.5px solid transparent;
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      transition: all 0.15s;
    }
    .lang-btn:hover {
      background: #f1f5f9;
      color: #1a56db;
    }
    .lang-btn.active {
      background: #eff6ff;
      border-color: #1a56db;
      color: #1a56db;
    }
    .flag { font-size: 14px; }
    .code { font-size: 11px; }
  `]
})
export class LangSwitcherComponent {
  i18n = inject(I18nService);
}

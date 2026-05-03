import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

export type AppLang = 'fr' | 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private translate = inject(TranslateService);
  private document = inject(DOCUMENT);

  currentLang = signal<AppLang>('fr');

  readonly langs: { code: AppLang; label: string; flag: string; dir: 'ltr' | 'rtl' }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'en', label: 'English',  flag: '🇬🇧', dir: 'ltr' },
    { code: 'ar', label: 'العربية',  flag: '🇹🇳', dir: 'rtl' },
  ];

  init() {
    const saved = (localStorage.getItem('lang') as AppLang) || 'fr';
    this.translate.addLangs(['fr', 'en', 'ar']);
    this.translate.setDefaultLang('fr');
    this.setLang(saved);
  }

  setLang(lang: AppLang) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);

    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.setAttribute('lang', lang);
    this.document.documentElement.setAttribute('dir', dir);
    this.document.body.setAttribute('dir', dir);
  }

  get isRtl(): boolean {
    return this.currentLang() === 'ar';
  }
}

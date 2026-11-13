import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, OnDestroy, PLATFORM_ID, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

/** The early head script restores this same preference before the first paint. */
@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly state = signal<Theme>(this.document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  readonly theme = this.state.asReadonly();

  constructor() {
    if (this.browser) window.addEventListener('storage', this.onStorage);
  }

  toggle(): void { this.setTheme(this.state() === 'light' ? 'dark' : 'light'); }

  setTheme(theme: Theme, persist = true): void {
    this.state.set(theme);
    this.document.documentElement.dataset.theme = theme;
    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#09090B' : '#FFFFFF');
    if (this.browser && persist) {
      try { localStorage.setItem('portfolio-theme', theme); } catch { /* Works without storage. */ }
    }
  }

  private readonly onStorage = (event: StorageEvent): void => {
    if (event.key === 'portfolio-theme') this.setTheme(event.newValue === 'dark' ? 'dark' : 'light', false);
  };

  ngOnDestroy(): void { if (this.browser) window.removeEventListener('storage', this.onStorage); }
}

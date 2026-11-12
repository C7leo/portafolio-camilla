import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, OnDestroy, PLATFORM_ID, signal } from '@angular/core';

export type IntroResult = 'ended' | 'skipped' | 'unavailable' | 'reduced';
export const INTRO_SESSION_KEY = 'camilla-cinematic-intro-seen';
function shouldPlayIntro(reloading: boolean): boolean {
  if (typeof window === 'undefined') return false;
  if (reloading) {
    // Refresh always starts at Home, before route readers and native scroll restoration.
    window.history.scrollRestoration = 'manual';
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#inicio`);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.location.hash && window.location.hash !== '#inicio') return false;
  if (reloading) return true;
  try { return window.sessionStorage.getItem(INTRO_SESSION_KEY) !== '1'; }
  catch { return true; }
}

/** Keeps the top-layer intro outside chapter pinning while coordinating only Hero. */
@Injectable({ providedIn: 'root' })
export class CinematicIntroState implements OnDestroy {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly originalRestoration = this.browser ? window.history.scrollRestoration : undefined;
  private readonly reloading = this.browser && (window.performance?.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type === 'reload';
  readonly required = this.browser && shouldPlayIntro(this.reloading);
  readonly visible = signal(this.required);
  private result?: IntroResult;
  private listener?: (result: IntroResult) => void;
  private resetFrame = 0;
  private restoreFrame = 0;

  constructor() {
    if (this.reloading && !this.required) this.restoreHomeScroll();
  }

  complete(result: IntroResult): void {
    if (this.result) return;
    this.result = result;
    this.visible.set(false);
    this.listener?.(result);
    if (this.reloading) this.restoreHomeScroll();
  }
  listen(listener: (result: IntroResult) => void): () => void {
    this.listener = listener;
    if (this.result) listener(this.result);
    return () => { if (this.listener === listener) this.listener = undefined; };
  }
  private restoreHomeScroll(): void {
    this.resetFrame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      this.restoreFrame = requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (this.originalRestoration) window.history.scrollRestoration = this.originalRestoration;
      });
    });
  }
  ngOnDestroy(): void {
    if (!this.browser) return;
    cancelAnimationFrame(this.resetFrame); cancelAnimationFrame(this.restoreFrame);
    if (this.originalRestoration) window.history.scrollRestoration = this.originalRestoration;
  }
}

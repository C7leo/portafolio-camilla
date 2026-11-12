import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, NgZone, OnDestroy, PLATFORM_ID } from '@angular/core';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Progress = (bounds: DOMRectReadOnly, viewportHeight: number, reduced: boolean) => void;

/** One observer for entrances, one visibility observer for the two scroll effects. */
@Injectable({ providedIn: 'root' })
export class ViewportMotionService implements OnDestroy {
  private readonly zone = inject(NgZone);
  private media?: MediaQueryList;
  private observer?: IntersectionObserver;
  private effectObserver?: IntersectionObserver;
  private readonly entrances = new Map<Element, Set<() => void>>();
  private readonly immediate = new Map<HTMLElement, () => void>();
  private readonly preferences = new Set<(reduced: boolean) => void>();
  private readonly effects = new Map<HTMLElement, Progress>();
  private readonly visibleEffects = new Set<HTMLElement>();
  private frame = 0;
  private lastReduced = true;
  readonly supported: boolean;

  constructor() {
    this.supported = isPlatformBrowser(inject(PLATFORM_ID)) && typeof IntersectionObserver !== 'undefined';
    if (!this.supported) return;
    // Browser chrome on touch devices must not refresh pinned scenes mid-gesture.
    // Actual element/orientation changes are observed by their scene owners.
    ScrollTrigger.config({ ignoreMobileResize: true });
    this.zone.runOutsideAngular(() => {
      this.media = matchMedia('(prefers-reduced-motion: reduce)');
      this.lastReduced = this.reduced;
      this.media.addEventListener('change', this.onPreference);
      this.observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          [...(this.entrances.get(entry.target) ?? [])].forEach(callback => callback());
        }
      }, { threshold: 0.04, rootMargin: '0px 0px -20px 0px' });
      this.effectObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) this.visibleEffects.add(element);
          else this.visibleEffects.delete(element);
          this.effects.get(element)?.(entry.boundingClientRect, innerHeight, this.reduced);
        }
        this.queueFrame();
      }, { rootMargin: '80px 0px' });
      document.addEventListener('focusin', this.onFocus, true);
      window.addEventListener('hashchange', this.onHash);
    });
  }

  get reduced(): boolean { return this.media?.matches ?? true; }

  observe(target: HTMLElement, enter: () => void): () => void {
    let callbacks = this.entrances.get(target);
    if (!callbacks) {
      callbacks = new Set();
      this.entrances.set(target, callbacks);
      this.observer?.observe(target);
    }
    callbacks.add(enter);
    return () => {
      callbacks!.delete(enter);
      if (!callbacks!.size) { this.entrances.delete(target); this.observer?.unobserve(target); }
    };
  }

  registerImmediate(element: HTMLElement, finish: () => void): () => void {
    this.immediate.set(element, finish);
    return () => { this.immediate.delete(element); };
  }

  finishEntrance(element: HTMLElement): void { this.immediate.get(element)?.(); }

  onPreferenceChange(callback: (reduced: boolean) => void): () => void {
    this.preferences.add(callback);
    return () => { this.preferences.delete(callback); };
  }

  trackScroll(element: HTMLElement, update: Progress): () => void {
    if (!this.supported) return () => {};
    this.zone.runOutsideAngular(() => {
      if (!this.effects.size) {
        window.addEventListener('scroll', this.queueFrame, { passive: true });
        window.addEventListener('resize', this.queueFrame, { passive: true });
      }
      this.effects.set(element, update);
      update(element.getBoundingClientRect(), innerHeight, this.reduced);
      this.effectObserver?.observe(element);
    });
    return () => {
      this.effects.delete(element);
      this.visibleEffects.delete(element);
      this.effectObserver?.unobserve(element);
      if (!this.effects.size) {
        window.removeEventListener('scroll', this.queueFrame);
        window.removeEventListener('resize', this.queueFrame);
        cancelAnimationFrame(this.frame); this.frame = 0;
      }
    };
  }

  private revealAncestors(target: HTMLElement): void {
    for (let current: HTMLElement | null = target; current; current = current.parentElement) this.immediate.get(current)?.();
  }
  private readonly onFocus = (event: FocusEvent): void => {
    this.syncPreference();
    if (event.target instanceof HTMLElement) this.revealAncestors(event.target);
  };
  private readonly onHash = (): void => {
    this.syncPreference();
    let id: string;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (target) this.revealAncestors(target);
  };
  private readonly onPreference = (): void => {
    this.lastReduced = this.reduced;
    [...this.preferences].forEach(callback => callback(this.reduced));
    if (this.reduced) {
      cancelAnimationFrame(this.frame); this.frame = 0;
      this.effects.forEach((update, element) => update(element.getBoundingClientRect(), innerHeight, true));
    } else this.queueFrame();
  };
  private syncPreference(): void {
    if (this.lastReduced !== this.reduced) this.onPreference();
  }
  private readonly queueFrame = (): void => {
    this.syncPreference();
    if (this.frame || this.reduced || !this.visibleEffects.size) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      // Read all geometry first, then write compositor properties.
      const visible = [...this.visibleEffects].map(element => ({ element, bounds: element.getBoundingClientRect() }));
      visible.forEach(({ element, bounds }) => this.effects.get(element)?.(bounds, innerHeight, false));
    });
  };

  ngOnDestroy(): void {
    if (!this.supported) return;
    this.observer?.disconnect(); this.effectObserver?.disconnect();
    this.media?.removeEventListener('change', this.onPreference);
    document.removeEventListener('focusin', this.onFocus, true);
    window.removeEventListener('hashchange', this.onHash);
    window.removeEventListener('scroll', this.queueFrame);
    window.removeEventListener('resize', this.queueFrame);
    cancelAnimationFrame(this.frame);
    this.entrances.clear(); this.immediate.clear(); this.preferences.clear(); this.effects.clear(); this.visibleEffects.clear();
  }
}

import { inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionPositionService, SECTION_IDS } from './section-position.service';
import { ContactNavigationService } from './contact-navigation.service';

/** One scroll owner for editorial anchors. Contact keeps its dedicated lateral cover. */
@Injectable({ providedIn: 'root' })
export class SectionNavigationService implements OnDestroy {
  private readonly positions = inject(SectionPositionService);
  private readonly zone = inject(NgZone);
  private readonly contact = inject(ContactNavigationService);
  private tween?: gsap.core.Tween;
  private frame = 0;
  private started = false;
  private parked?: { id: string; y: number };
  private layoutTimer = 0;

  start(): void {
    if (this.started) return;
    this.started = true;
    this.zone.runOutsideAngular(() => {
      document.addEventListener('click', this.click);
      window.addEventListener('hashchange', this.historyChange);
      window.addEventListener('popstate', this.historyChange);
      window.addEventListener('wheel', this.cancel, { passive: true });
      window.addEventListener('touchstart', this.cancel, { passive: true });
      window.addEventListener('keydown', this.keydown);
      window.addEventListener('resize', this.layoutChanged, { passive: true });
      window.addEventListener('scroll', this.manualScroll, { passive: true });
      window.addEventListener('sectionnavigationend', this.coverEnded);
      document.addEventListener('load', this.assetLoaded, true);
      document.fonts.addEventListener('loadingdone', this.layoutChanged);
      void document.fonts.ready.then(() => this.historyChange());
    });
  }

  private readonly click = (event: MouseEvent): void => {
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (anchor?.hasAttribute('appContactLink') && (this.tween || this.frame)) this.cancel();
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (!anchor || anchor.hasAttribute('appContactLink') || anchor.target || anchor.hasAttribute('download')) return;
    const href = anchor.getAttribute('href') ?? '';
    if (!SECTION_IDS.some(id => href === `#${id}`)) return;
    event.preventDefault();
    if (href === '#contacto') {
      this.cancel();
      const target = document.getElementById('contacto');
      if (target) this.contact.navigate(target);
      return;
    }
    this.navigate(href.slice(1), true);
  };

  private readonly historyChange = (): void => {
    const id = location.hash.slice(1);
    if (SECTION_IDS.some(section => section === id)) this.navigate(id, false, true);
  };

  navigate(id: string, push = true, immediate = false): void {
    this.cancel();
    if (push && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    // Let project-detail routing restore the catalogue before measuring its layout.
    window.dispatchEvent(new Event('sectionnavigation'));
    this.frame = requestAnimationFrame(() => {
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        ScrollTrigger.refresh();
        const end = this.positions.destination(id);
        if (end === null) return;
        const finish = (): void => {
          const latest = this.positions.destination(id);
          if (latest !== null) this.positions.land(latest);
          const section = document.getElementById(id);
          if (section) {
            if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
            section.focus({ preventScroll: true });
          }
          this.tween = undefined;
          this.parked = { id, y: scrollY };
        };
        if (immediate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
          finish();
          return;
        }
        const start = scrollY;
        const state = { progress: 0 };
        this.tween = gsap.to(state, {
          progress: 1, duration: .85, ease: 'power2.inOut',
          onUpdate: () => {
            const destination = this.positions.destination(id) ?? end;
            scrollTo({ top: start + (destination - start) * state.progress, behavior: 'instant' });
            this.positions.update();
          }, onComplete: finish,
        });
      });
    });
  }

  private readonly keydown = (event: KeyboardEvent): void => {
    if (['Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) this.cancel();
  };
  private readonly coverEnded = (): void => { this.parked = { id: 'contacto', y: scrollY }; };
  private readonly manualScroll = (): void => {
    if (this.parked && !this.layoutTimer && Math.abs(scrollY - this.parked.y) > 2) this.parked = undefined;
  };
  private readonly assetLoaded = (event: Event): void => {
    if (event.target instanceof HTMLImageElement) this.layoutChanged();
  };
  private readonly layoutChanged = (): void => {
    clearTimeout(this.layoutTimer);
    if (!this.parked) return;
    this.layoutTimer = window.setTimeout(() => {
      const parked = this.parked;
      this.layoutTimer = 0;
      if (!parked) return;
      ScrollTrigger.refresh();
      const destination = this.positions.destination(parked.id);
      if (destination !== null) this.positions.land(destination);
      parked.y = scrollY;
    }, 220);
  };
  private readonly cancel = (): void => {
    this.parked = undefined;
    clearTimeout(this.layoutTimer);
    this.layoutTimer = 0;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.tween?.kill();
    this.tween = undefined;
  };
  ngOnDestroy(): void {
    this.cancel();
    document.removeEventListener('click', this.click);
    window.removeEventListener('hashchange', this.historyChange);
    window.removeEventListener('popstate', this.historyChange);
    window.removeEventListener('wheel', this.cancel);
    window.removeEventListener('touchstart', this.cancel);
    window.removeEventListener('keydown', this.keydown);
    window.removeEventListener('resize', this.layoutChanged);
    window.removeEventListener('scroll', this.manualScroll);
    window.removeEventListener('sectionnavigationend', this.coverEnded);
    document.removeEventListener('load', this.assetLoaded, true);
    document.fonts.removeEventListener('loadingdone', this.layoutChanged);
  }
}

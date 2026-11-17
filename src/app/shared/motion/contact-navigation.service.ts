import { inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { ViewportMotionService } from './viewport-motion.service';
import { SectionPositionService } from './section-position.service';

/** Slide the real Contact composition over the current view, then settle its anchor. */
@Injectable({ providedIn: 'root' })
export class ContactNavigationService implements OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly motion = inject(ViewportMotionService);
  private readonly positions = inject(SectionPositionService);
  private tween?: gsap.core.Tween;
  private target?: HTMLElement;
  private restore?: () => void;
  private removeListeners?: () => void;

  navigate(target: HTMLElement): void {
    if (this.target === target) return;
    this.cancel();
    this.zone.runOutsideAngular(() => {
      const preference = matchMedia('(prefers-reduced-motion: reduce)');
      const clearance = this.positions.viewportTop(target);
      const normalTop = target.getBoundingClientRect().top + scrollY;
      this.motion.revealWithin(target);
      const arrive = (): void => {
        if (location.hash !== '#contacto') history.pushState(null, '', '#contacto');
        if (!target.contains(document.activeElement)) target.focus({ preventScroll: true });
        window.dispatchEvent(new Event('sectionnavigationend'));
      };
      if (preference.matches || Math.abs(target.getBoundingClientRect().top - clearance) < 1) {
        this.land(normalTop - clearance);
        arrive();
        return;
      }
      this.target = target;
      const panel = target.closest<HTMLElement>('app-contact-form') ?? target;
      const bounds = panel.getBoundingClientRect();
      const sectionOffset = target.getBoundingClientRect().top - bounds.top;
      const originalStyle = panel.getAttribute('style');
      const placeholder = document.createElement('div');
      placeholder.setAttribute('aria-hidden', 'true');
      placeholder.style.height = `${bounds.height}px`;
      panel.before(placeholder);
      Object.assign(panel.style, {
        position: 'fixed', inset: '0', height: '100%', margin: '0',
        paddingTop: '0', overflow: 'clip', background: '#000000',
        zIndex: '19', isolation: 'isolate', willChange: 'transform',
      });
      // Move the same composition vertically to its final visual entry before covering.
      const originalTargetStyle = target.getAttribute('style');
      target.style.marginTop = `${clearance - sectionOffset}px`;
      gsap.set(panel, { xPercent: 100 });
      this.restore = () => {
        if (originalStyle === null) panel.removeAttribute('style');
        else panel.setAttribute('style', originalStyle);
        if (originalTargetStyle === null) target.removeAttribute('style');
        else target.setAttribute('style', originalTargetStyle);
        placeholder.remove();
      };
      const complete = (): void => {
        if (this.target !== target) return;
        // Commit behind the covering panel, then restore normal flow in one task.
        this.land(placeholder.getBoundingClientRect().top + scrollY + sectionOffset - clearance);
        this.cancel();
        arrive();
      };
      const finish = (): void => { this.tween?.progress(1); };
      const keydown = (event: KeyboardEvent): void => {
        if (['Escape', 'Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) finish();
      };
      const click = (event: MouseEvent): void => {
        const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (anchor && anchor.getAttribute('href') !== '#contacto') this.cancel();
      };
      window.addEventListener('wheel', finish, { passive: true });
      window.addEventListener('touchmove', finish, { passive: true });
      window.addEventListener('keydown', keydown);
      window.addEventListener('resize', finish, { passive: true });
      window.addEventListener('popstate', this.cancel);
      window.addEventListener('hashchange', this.cancel);
      document.addEventListener('click', click, true);
      preference.addEventListener('change', finish);
      this.removeListeners = () => {
        window.removeEventListener('wheel', finish);
        window.removeEventListener('touchmove', finish);
        window.removeEventListener('keydown', keydown);
        window.removeEventListener('resize', finish);
        window.removeEventListener('popstate', this.cancel);
        window.removeEventListener('hashchange', this.cancel);
        document.removeEventListener('click', click, true);
        preference.removeEventListener('change', finish);
      };
      this.tween = gsap.to(panel, { xPercent: 0, duration: .72, ease: 'power3.inOut', onComplete: complete });
    });
  }

  private land(top: number): void {
    this.positions.land(top);
  }

  private readonly cancel = (): void => {
    this.tween?.kill();
    this.tween = undefined;
    this.target = undefined;
    this.removeListeners?.();
    this.removeListeners = undefined;
    this.restore?.();
    this.restore = undefined;
  };

  ngOnDestroy(): void { this.cancel(); }
}

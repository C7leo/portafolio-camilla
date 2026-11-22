import { AfterViewInit, Directive, ElementRef, inject, Input, NgZone, OnDestroy } from '@angular/core';
import { ViewportMotionService } from '../../shared/motion/viewport-motion.service';

/** Contact's short, one-time stagger; shared animation directives remain unchanged. */
@Directive({ selector: '[appContactReveal]', standalone: true })
export class ContactRevealDirective implements AfterViewInit, OnDestroy {
  @Input() motionDelay = 0;
  @Input() motionDuration = 400;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(ViewportMotionService);
  private readonly zone = inject(NgZone);
  private animation?: Animation;
  private stopObserve?: () => void;
  private stopImmediate?: () => void;
  private stopPreference?: () => void;
  private original?: { opacity: string; transform: string };
  private done = false;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      if (!this.motion.supported || this.motion.reduced || typeof this.element.animate !== 'function') return;
      this.original = { opacity: this.element.style.opacity, transform: this.element.style.transform };
      Object.assign(this.element.style, { opacity: '0', transform: 'translateY(8px)' });
      this.stopImmediate = this.motion.registerImmediate(this.element, () => this.finish());
      this.stopPreference = this.motion.onPreferenceChange(reduced => { if (reduced) this.finish(); });
      this.stopObserve = this.motion.observe(this.element, () => {
        if (this.done || this.animation) return;
        this.stopObserve?.();
        this.animation = this.element.animate([
          { opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' },
        ], { duration: this.motionDuration, delay: this.motionDelay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
        this.animation.finished.then(() => this.finish()).catch(() => {});
      });
    });
  }

  private finish(): void {
    if (this.done) return;
    this.done = true;
    this.stopObserve?.(); this.stopImmediate?.(); this.stopPreference?.();
    this.animation?.cancel();
    if (this.original) Object.assign(this.element.style, this.original);
  }
  ngOnDestroy(): void { this.finish(); }
}

import { AfterViewInit, Directive, ElementRef, inject, Input, NgZone, OnDestroy } from '@angular/core';
import { ViewportMotionService } from './viewport-motion.service';

export type RevealKind = 'focus';

@Directive({ selector: '[appReveal]', standalone: true })
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input() appReveal: RevealKind = 'focus';
  @Input() motionDelay = 0;
  @Input() motionDuration = 700;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(ViewportMotionService);
  private readonly zone = inject(NgZone);
  private animation?: Animation;
  private stopObserve?: () => void;
  private stopImmediate?: () => void;
  private stopPreference?: () => void;
  private original?: { opacity: string; translate: string; willChange: string; filter: string };
  private from: Keyframe = {};
  private to: Keyframe = {};
  private done = false;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.element.dataset.motion = this.appReveal;
      if (!this.motion.supported || this.motion.reduced || typeof this.element.animate !== 'function') { this.finish(); return; }
      this.from = { opacity: .15, translate: '0 8px', filter: 'blur(14px)' };
      this.to = { opacity: 1, translate: '0 0', filter: 'blur(0px)' };
      const style = this.element.style;
      this.original = { opacity: style.opacity, translate: style.translate, willChange: style.willChange, filter: style.filter };
      style.opacity = String(this.from.opacity);
      style.translate = String(this.from.translate);
      if (this.from.filter) style.filter = String(this.from.filter);
      this.element.dataset.motionState = 'pending';
      this.stopImmediate = this.motion.registerImmediate(this.element, () => this.finish());
      this.stopPreference = this.motion.onPreferenceChange(reduced => { if (reduced) this.finish(); });
      this.stopObserve = this.motion.observe(this.element, () => this.play());
    });
  }

  private play(): void {
    if (this.done || this.animation) return;
    this.stopObserve?.();
    if (this.motion.reduced) { this.finish(); return; }
    this.element.dataset.motionState = 'animating';
    this.element.style.willChange = 'opacity, translate, filter';
    this.animation = this.element.animate([this.from, this.to], {
      duration: Number(this.motionDuration), delay: Math.max(0, Number(this.motionDelay)),
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both',
    });
    this.animation.finished.then(() => this.finish()).catch(() => { /* Focus, reduced motion or destruction cancels cleanly. */ });
  }

  private finish(): void {
    if (this.done) return;
    this.done = true;
    this.stopObserve?.(); this.stopImmediate?.(); this.stopPreference?.();
    this.animation?.cancel();
    if (this.original) Object.assign(this.element.style, this.original);
    this.element.dataset.motionState = 'done';
  }

  ngOnDestroy(): void { this.finish(); }
}

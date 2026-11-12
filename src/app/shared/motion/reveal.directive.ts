import { AfterViewInit, Directive, ElementRef, inject, Input, NgZone, OnDestroy } from '@angular/core';
import { ViewportMotionService } from './viewport-motion.service';

export type RevealKind = 'fade' | 'rise' | 'word' | 'focus' | 'mask-up' | 'mask-left' | 'image' | 'dark-surface' | 'light-surface' | 'violet-surface';

@Directive({ selector: '[appReveal]', standalone: true })
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input() appReveal: RevealKind = 'rise';
  @Input() motionDelay = 0;
  @Input() motionDuration = 700;
  @Input() motionDistance = 28;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(ViewportMotionService);
  private readonly zone = inject(NgZone);
  private animation?: Animation;
  private stopObserve?: () => void;
  private stopImmediate?: () => void;
  private stopPreference?: () => void;
  private original?: { opacity: string; translate: string; clipPath: string; willChange: string; filter: string };
  private from: Keyframe = {};
  private to: Keyframe = {};
  private done = false;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.element.dataset.motion = this.appReveal;
      if (!this.motion.supported || this.motion.reduced || typeof this.element.animate !== 'function') { this.finish(); return; }
      const masked = ['word', 'mask-up', 'mask-left', 'image'].includes(this.appReveal);
      const surface = this.appReveal.endsWith('surface');
      const focus = this.appReveal === 'focus';
      const horizontal = this.appReveal === 'mask-left';
      const translated = this.appReveal !== 'fade' && !surface && this.appReveal !== 'image';
      this.from = {
        opacity: surface ? 1 : focus ? 0.15 : 0,
        translate: focus ? '0 8px' : translated ? (horizontal ? '-20px 0' : `0 ${Number(this.motionDistance)}px`) : '0 0',
        ...(focus ? { filter: 'blur(14px)' } : {}),
        ...(masked ? { clipPath: horizontal ? 'inset(0 100% 0 0)' : 'inset(0 0 100% 0)' } : {}),
      };
      this.to = {
        opacity: 1, translate: '0 0',
        ...(focus ? { filter: 'blur(0px)' } : {}),
        ...(masked ? { clipPath: this.appReveal !== 'image' ? 'inset(-0.5em -1em -0.35em -1em)' : 'inset(0)' } : {}),
      };
      const style = this.element.style;
      this.original = { opacity: style.opacity, translate: style.translate, clipPath: style.clipPath, willChange: style.willChange, filter: style.filter };
      style.opacity = String(this.from.opacity);
      style.translate = String(this.from.translate);
      if (this.from.clipPath) style.clipPath = String(this.from.clipPath);
      if (this.from.filter) style.filter = String(this.from.filter);
      style.setProperty('--motion-delay', `${Math.max(0, Number(this.motionDelay))}ms`);
      this.element.dataset.motionState = 'pending';
      this.stopImmediate = this.motion.registerImmediate(this.element, () => this.finish());
      this.stopPreference = this.motion.onPreferenceChange(reduced => { if (reduced) this.finish(); });
      // Observe an unclipped parent for masks: observing a fully clipped target never enters.
      const target = masked || surface ? this.element.parentElement ?? this.element : this.element;
      this.stopObserve = this.motion.observe(target, () => this.play());
    });
  }

  private play(): void {
    if (this.done || this.animation) return;
    this.stopObserve?.();
    if (this.motion.reduced) { this.finish(); return; }
    this.element.dataset.motionState = 'animating';
    this.element.style.willChange = this.from.filter ? 'opacity, translate, filter' : this.from.clipPath ? 'opacity, translate, clip-path' : 'opacity, translate';
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

  ngOnDestroy(): void { this.finish(); this.element.style.removeProperty('--motion-delay'); }
}

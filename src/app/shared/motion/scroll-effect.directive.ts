import { AfterViewInit, Directive, ElementRef, inject, Input, OnDestroy } from '@angular/core';
import { ViewportMotionService } from './viewport-motion.service';

const clamp = (value: number): number => Math.max(0, Math.min(1, value));

@Directive({ selector: '[appScrollEffect]', standalone: true })
export class ScrollEffectDirective implements AfterViewInit, OnDestroy {
  @Input({ required: true }) appScrollEffect!: 'hero-exit' | 'experience-photo';
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(ViewportMotionService);
  private stop?: () => void;
  private photoOpacity = 0;

  ngAfterViewInit(): void {
    this.stop = this.motion.trackScroll(this.element, (bounds, height, reduced) => {
      if (this.appScrollEffect === 'hero-exit') {
        const progress = reduced ? 0 : clamp(-bounds.top / Math.max(bounds.height * 0.85, 1));
        this.element.style.setProperty('--hero-exit-y', `${(-32 * progress).toFixed(2)}px`);
        this.element.style.setProperty('--hero-exit-opacity', (1 - progress).toFixed(4));
      } else {
        this.photoOpacity = reduced ? 1 : Math.max(this.photoOpacity, clamp((height - bounds.top) / Math.min(bounds.height, height * 0.65)));
        const distance = Math.max(-1, Math.min(1, (height / 2 - bounds.top - bounds.height / 2) / Math.max((height + bounds.height) / 2, 1)));
        this.element.style.setProperty('--experience-photo-opacity', this.photoOpacity.toFixed(4));
        this.element.style.setProperty('--experience-photo-y', `${reduced ? 0 : (distance * 8).toFixed(2)}px`);
      }
    });
  }

  ngOnDestroy(): void {
    this.stop?.();
    for (const property of ['--hero-exit-y', '--hero-exit-opacity', '--experience-photo-opacity', '--experience-photo-y']) this.element.style.removeProperty(property);
  }
}

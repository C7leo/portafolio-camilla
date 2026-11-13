import { AfterViewInit, Directive, ElementRef, inject, Input, OnDestroy } from '@angular/core';
import { ViewportMotionService } from './viewport-motion.service';

const clamp = (value: number): number => Math.max(0, Math.min(1, value));

@Directive({ selector: '[appScrollEffect]', standalone: true })
export class ScrollEffectDirective implements AfterViewInit, OnDestroy {
  @Input({ required: true }) appScrollEffect!: 'hero-exit';
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(ViewportMotionService);
  private stop?: () => void;

  ngAfterViewInit(): void {
    this.stop = this.motion.trackScroll(this.element, (bounds, _height, reduced) => {
      const progress = reduced ? 0 : clamp(-bounds.top / Math.max(bounds.height * 0.85, 1));
      this.element.style.setProperty('--hero-exit-y', `${(-32 * progress).toFixed(2)}px`);
      this.element.style.setProperty('--hero-exit-opacity', (1 - progress).toFixed(4));
    });
  }

  ngOnDestroy(): void {
    this.stop?.();
    for (const property of ['--hero-exit-y', '--hero-exit-opacity']) this.element.style.removeProperty(property);
  }
}

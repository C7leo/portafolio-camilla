import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, inject, signal } from '@angular/core';

/** Decorative SVG paths, with independently timed pulses and no animation loop in Angular. */
@Component({
  selector: 'app-falling-rays', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class.is-playing]': 'visible()' },
  template: `
    <svg viewBox="0 0 1200 760" preserveAspectRatio="none" focusable="false">
      <defs>
        <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" [attr.stop-color]="colors[0]"/><stop offset=".4" [attr.stop-color]="colors[1]"/>
          <stop offset=".72" [attr.stop-color]="colors[2]"/><stop offset="1" [attr.stop-color]="colors[3]"/>
        </linearGradient>
        <linearGradient [attr.id]="fadeId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="white" stop-opacity="0"/>
          <stop offset=".2" stop-color="white" stop-opacity="1"/>
          <stop offset=".72" stop-color="white" stop-opacity="1"/>
          <stop offset="1" stop-color="white" stop-opacity="0"/>
        </linearGradient>
        <mask [attr.id]="maskId" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="760">
          <rect width="1200" height="760" [attr.fill]="'url(#' + fadeId + ')'"/>
        </mask>
      </defs>
      <g [attr.mask]="'url(#' + maskId + ')'">
        @for (ray of paths; track $index) {
          <g class="ray" [style.--delay]="ray.delay + 's'" [style.--duration]="speed + 's'">
            <path class="ray-base" [attr.d]="ray.path" [attr.stroke]="'url(#' + gradientId + ')'" [attr.stroke-width]="thickness" [attr.opacity]="opacity" />
            <path class="ray-pulse" [attr.d]="ray.path" [attr.stroke]="'url(#' + gradientId + ')'" pathLength="100" [attr.stroke-width]="thickness * 1.8" [style.--trail]="trail + ' 100'" [style.--intensity]="intensity" />
          </g>
        }
      </g>
    </svg>`,
  styles: `
    :host{position:absolute;inset:clamp(-160px,-12vw,-88px) 0 -50px;display:block;pointer-events:none;overflow:hidden}
    svg{width:100%;height:100%;display:block}
    path{fill:none;vector-effect:non-scaling-stroke}
    .ray-pulse{stroke-linecap:round;stroke-dasharray:var(--trail);animation:ray-travel var(--duration) linear var(--delay) infinite;animation-play-state:paused}
    :host(.is-playing) .ray-pulse{animation-play-state:running}
    @keyframes ray-travel{0%{stroke-dashoffset:100;opacity:0}10%{opacity:var(--intensity)}80%{opacity:var(--intensity)}100%{stroke-dashoffset:-10;opacity:0}}
    @media(max-width:640px){.ray:nth-of-type(even){display:none}}
    @media(prefers-reduced-motion:reduce){.ray-pulse{display:none}}
  `,
})
export class FallingRaysComponent implements AfterViewInit, OnDestroy {
  private static nextId = 0;
  readonly gradientId = `behind-rays-gradient-${FallingRaysComponent.nextId++}`;
  readonly fadeId = `${this.gradientId}-fade`;
  readonly maskId = `${this.gradientId}-mask`;
  @Input() count = 15;
  @Input() thickness = 0.8;
  @Input() speed = 6.5;
  @Input() trail = 7;
  @Input() opacity = 0.17;
  @Input() intensity = 0.7;
  @Input() curvature = 0.72;
  @Input() spread = 1;
  @Input() colors = ['#4A9EFF', '#B9A6FF', '#EEA0FF', '#FF6575'];
  readonly visible = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private inView = false;
  get paths(): { path: string; delay: number }[] {
    const count = Math.max(1, Math.min(32, Math.floor(this.count)));
    return Array.from({ length: count }, (_, index) => {
      const position = count === 1 ? 0 : index / (count - 1) * 2 - 1;
      const start = 600 + position * 235;
      const end = 600 + position * 540 * this.spread;
      const bend = start + (end - start) * this.curvature;
      return { path: `M ${start} 0 C ${start} 230, ${start} 420, ${bend} 610 Q ${end} 760, ${end} 760`, delay: -(index * 0.47 % Math.max(1, this.speed)) };
    });
  }
  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      document.addEventListener('visibilitychange', this.updateVisibility);
      if (typeof IntersectionObserver === 'undefined') { this.inView = true; this.updateVisibility(); return; }
      this.observer = new IntersectionObserver(entries => { this.inView = entries.some(entry => entry.isIntersecting); this.updateVisibility(); }, { rootMargin: '80px' });
      this.observer.observe(this.host);
    });
  }
  private readonly updateVisibility = () => { this.visible.set(this.inView && !document.hidden); };
  ngOnDestroy(): void { this.observer?.disconnect(); document.removeEventListener('visibilitychange', this.updateVisibility); }
}

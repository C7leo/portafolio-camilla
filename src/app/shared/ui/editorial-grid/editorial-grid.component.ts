import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, Input, NgZone, OnDestroy, PLATFORM_ID } from '@angular/core';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './editorial-grid.component.css?inline';

export interface EditorialRule {
  /** CSS position, or an existing element whose layout defines this rule. */
  at?: string;
  anchor?: string;
  edge?: 'top' | 'bottom';
  offset?: number;
  intersections?: boolean;
  line?: boolean;
  mobile?: boolean;
}

/** Decorative only: follows each scene's positioning, including pinned scenes. */
@Component({
  selector: 'app-editorial-grid', standalone: true, styles,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class.is-viewport]': 'viewport',
    '[attr.data-tone]': 'tone',
    '[style.--grid-line-opacity]': 'opacity',
    '[style.--grid-node-opacity]': 'intersectionOpacity',
    '[style.--grid-inset]': 'inset',
  },
  template: `
    @if (viewport || rails) { <div class="grid-rails"><i class="grid-rail left"></i><i class="grid-rail right"></i></div> }
    @for (rule of rules; track $index) {
      <div class="grid-rule" [class.no-line]="rule.line === false" [class.desktop-detail]="rule.mobile === false"
        [style.top]="rule.at || '0px'" [attr.data-grid-rule]="$index">
        <span class="grid-crossings">
          @if (rule.intersections !== false) { <i class="grid-node left"></i><i class="grid-node right"></i> }
        </span>
      </div>
    }
  `,
})
export class EditorialGridComponent implements AfterViewInit, OnDestroy {
  @Input() viewport = false;
  @Input() rails = false;
  /** Local rails replace the viewport rails on these surfaces only. */
  @Input() railExclusions: readonly string[] = [];
  @Input() rules: readonly EditorialRule[] = [];
  @Input() tone: 'auto' | 'light' | 'dark' = 'auto';
  @Input() opacity = .13;
  @Input() intersectionOpacity = .5;
  @Input() inset: string | null = null;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private resize?: ResizeObserver;
  private visibility?: IntersectionObserver;
  private frame = 0;
  private destroyed = false;

  ngAfterViewInit(): void {
    if (!this.browser) return;
    if (this.viewport && !this.rules.length && !this.railExclusions.length) return;
    this.zone.runOutsideAngular(() => {
      const scene = this.host.parentElement!;
      this.resize = new ResizeObserver(this.scheduleLayout);
      this.resize.observe(scene);
      this.railExclusions.forEach(selector => {
        const target = document.querySelector(selector);
        if (target) this.resize!.observe(target);
      });
      this.rules.forEach(rule => {
        const target = rule.anchor && scene.querySelector(rule.anchor);
        if (target) this.resize!.observe(target);
      });
      // Opacity reveals run once. Returning to a scene never redraws its grid.
      if (typeof IntersectionObserver !== 'undefined') {
        this.visibility = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-seen');
            this.visibility!.unobserve(entry.target);
          });
        }, { rootMargin: '0px 0px -24px 0px' });
        this.host.querySelectorAll('.grid-rule').forEach(rule => this.visibility!.observe(rule));
      } else this.host.querySelectorAll('.grid-rule').forEach(rule => rule.classList.add('is-seen'));
      ScrollTrigger.addEventListener('refresh', this.scheduleLayout);
      window.addEventListener('resize', this.scheduleLayout, { passive: true });
      if (this.viewport && this.railExclusions.length) window.addEventListener('scroll', this.scheduleLayout, { passive: true });
      document.fonts.ready.then(() => { if (!this.destroyed) this.scheduleLayout(); });
      this.scheduleLayout();
    });
  }

  private readonly scheduleLayout = (): void => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      if (this.viewport && this.railExclusions.length) {
        const stops = ['#000 0px'];
        const ranges = this.railExclusions.flatMap(selector => {
          const bounds = document.querySelector(selector)?.getBoundingClientRect();
          return bounds && bounds.bottom > 0 && bounds.top < innerHeight
            ? [{ top: Math.max(0, bounds.top), bottom: Math.min(innerHeight, bounds.bottom) }] : [];
        }).sort((a, b) => a.top - b.top);
        ranges.forEach(({ top, bottom }) => stops.push(`#000 ${top}px`, `transparent ${top}px`, `transparent ${bottom}px`, `#000 ${bottom}px`));
        stops.push('#000 100%');
        this.host.querySelector<HTMLElement>('.grid-rails')!.style.maskImage = `linear-gradient(to bottom, ${stops.join(', ')})`;
      }
      const scene = this.host.parentElement!;
      this.host.querySelectorAll<HTMLElement>('.grid-rule').forEach((element, index) => {
        const rule = this.rules[index];
        if (!rule.anchor) return;
        const target = scene.querySelector<HTMLElement>(rule.anchor);
        element.hidden = !target;
        if (!target) return;
        // Layout offsets ignore reveal transforms and stay stable during scroll.
        let top = 0;
        let current: HTMLElement | null = target;
        while (current && current !== scene) {
          top += current.offsetTop;
          current = current.offsetParent as HTMLElement | null;
        }
        element.style.top = `${top + (rule.edge === 'bottom' ? target.offsetHeight : 0) + (rule.offset ?? 0)}px`;
      });
    });
  };

  ngOnDestroy(): void {
    this.destroyed = true;
    if (!this.browser) return;
    cancelAnimationFrame(this.frame);
    this.resize?.disconnect();
    this.visibility?.disconnect();
    ScrollTrigger.removeEventListener('refresh', this.scheduleLayout);
    window.removeEventListener('resize', this.scheduleLayout);
    window.removeEventListener('scroll', this.scheduleLayout);
  }
}

import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, inject, Input, NgZone, OnDestroy, Output, PLATFORM_ID, signal } from '@angular/core';

@Component({
  selector: 'app-experience-valley', standalone: true,
  host: { 'aria-hidden': 'true', '[attr.data-ready]': 'ready()' },
  template: '<div class="valley-canvas" [class.is-ready]="ready()"></div>',
  styles: `
    :host { display: block; position: sticky; top: 0; height: 100svh; margin-bottom: -100svh; overflow: clip; background: #000; pointer-events: none; }
    .valley-canvas { position: absolute; inset: 0; opacity: 0; transition: opacity 1200ms ease; }
    .valley-canvas.is-ready { opacity: 1; }
    @media (prefers-reduced-motion: reduce) { .valley-canvas { transition: none; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceValleyComponent implements AfterViewInit, OnDestroy {
  readonly ready = signal(false);
  @Input() preview?: HTMLCanvasElement;
  @Output() readonly unavailable = new EventEmitter<void>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private renderer?: { update(): void; dispose(): void };
  private readonly state = { progress: 0 };
  private destroyed = false;

  setProgress(progress: number): void {
    this.state.progress = progress;
    this.renderer?.update();
  }

  ngAfterViewInit(): void {
    if (!this.browser || typeof IntersectionObserver === 'undefined') return;
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        this.observer?.disconnect();
        void this.load();
      }, { rootMargin: '500px 0px' });
      this.observer.observe(this.host);
    });
  }

  private async load(): Promise<void> {
    try {
      const { mountExperienceValley } = await import('./graphics/experience-valley.scene');
      if (this.destroyed) return;
      this.zone.runOutsideAngular(() => {
        this.renderer = mountExperienceValley(this.host.querySelector<HTMLElement>('.valley-canvas')!, {
          state: this.state,
          preview: this.preview,
          ready: value => this.zone.run(() => { this.ready.set(value); if (!value) this.unavailable.emit(); }),
        });
      });
    } catch { if (!this.destroyed) this.zone.run(() => this.unavailable.emit()); }
  }

  ngOnDestroy(): void { this.destroyed = true; this.observer?.disconnect(); this.renderer?.dispose(); }
}

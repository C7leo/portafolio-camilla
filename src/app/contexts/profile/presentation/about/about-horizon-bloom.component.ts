import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, NgZone, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { mountHorizonBloom } from '../graphics/about-horizon-bloom.scene';

@Component({
  selector: 'app-about-horizon-bloom', standalone: true,
  host: { 'aria-hidden': 'true' },
  template: '<div class="horizon-fallback" [class.is-hidden]="ready()"></div><div class="horizon-canvas" [class.is-ready]="ready()"></div>',
  styles: `
    :host { display: block; overflow: clip; }
    .horizon-fallback, .horizon-canvas { position: absolute; inset: 0; width: 100%; height: 100%; transition: opacity 500ms ease; }
    .horizon-fallback { opacity: 1; background:
      radial-gradient(ellipse 44% 11% at 54% 42%, rgb(238 160 255 / .17), transparent 72%),
      radial-gradient(ellipse 75% 62% at 50% 102%, #fff 98.7%, rgb(248 175 237 / .82) 99%, rgb(238 160 255 / .28) 99.35%, transparent 100%); }
    .horizon-fallback.is-hidden { opacity: 0; }
    .horizon-canvas { opacity: 0; }
    .horizon-canvas.is-ready { opacity: 1; }
    @media (max-width: 640px) { .horizon-canvas.is-ready { opacity: .9; } }
    @media (prefers-reduced-motion: reduce) { .horizon-fallback, .horizon-canvas { transition: none; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutHorizonBloomComponent implements AfterViewInit, OnDestroy {
  readonly ready = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private dispose?: () => void;

  ngAfterViewInit(): void {
    if (!this.browser) return;
    this.zone.runOutsideAngular(() => {
      this.dispose = mountHorizonBloom(this.host.querySelector<HTMLElement>('.horizon-canvas')!, {
        ready: value => this.zone.run(() => this.ready.set(value)),
      });
    });
  }

  ngOnDestroy(): void { this.dispose?.(); }
}

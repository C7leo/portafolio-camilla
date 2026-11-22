import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, NgZone, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { LanguageService } from '../../../shared/i18n/language.service';

type IntroPhase = 'loading' | 'progress' | 'assembling' | 'revealing' | 'complete';

@Component({
  selector: 'app-particle-intro', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-active]': 'active()', '[class.is-ready]': 'ready()', '[class.is-consolidating]': 'consolidating()' },
  template: `<div class="particle-intro__veil" aria-hidden="true"></div><div class="particle-intro__loading" role="status"><svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="particle-ring-gradient"><stop stop-color="#55a1fe"/><stop offset=".3" stop-color="#c0adff"/><stop offset=".55" stop-color="#ffb6c8"/><stop offset=".78" stop-color="#ff967e"/><stop offset="1" stop-color="#e7f4ff"/></linearGradient></defs><circle cx="50" cy="50" r="38" /></svg><span class="sr-only">{{ language.translate('intro.loading') }}</span></div><canvas class="particle-intro__canvas" aria-hidden="true"></canvas><span class="particle-intro__count" [class.is-fading]="countFading()" aria-hidden="true">{{ count() }}</span>`,
})
export class ParticleIntroComponent implements AfterViewInit, OnDestroy {
  readonly language = inject(LanguageService);
  private readonly phase = signal<IntroPhase>('loading');
  readonly consolidating = signal(false);
  readonly count = signal(1);
  readonly countFading = signal(false);
  readonly active = computed(() => this.phase() === 'loading' || this.phase() === 'progress' || this.phase() === 'assembling');
  readonly ready = computed(() => this.phase() === 'progress' || this.phase() === 'assembling');
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private abort = new AbortController();
  private dispose?: () => void;
  private timeout?: ReturnType<typeof setTimeout>;
  private destroyed = false;
  private media?: MediaQueryList;

  ngAfterViewInit(): void {
    if (!this.browser) return;
    if ((location.hash && location.hash !== '#inicio') || document.documentElement.dataset.particlePhase === 'complete') { this.finish(); return; }
    this.media = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (this.media.matches || connection?.saveData || /(^|-)2g/.test(connection?.effectiveType ?? '')) { this.finish(); return; }
    const hero = this.host.closest<HTMLElement>('.hero');
    const canvas = this.host.querySelector<HTMLCanvasElement>('canvas');
    if (!hero || !canvas) { this.finish(); return; }
    const background = getComputedStyle(hero).backgroundImage;
    const url = /^url\(["']?(.*?)["']?\)$/.exec(background)?.[1];
    if (!url) { this.finish(); return; }
    this.setPhase('loading');
    this.zone.runOutsideAngular(() => {
      this.media!.addEventListener('change', this.onPreference);
      window.addEventListener('hashchange', this.onNavigation);
      window.addEventListener('wheel', this.finish, { passive: true });
      window.addEventListener('touchstart', this.finish, { passive: true });
      window.addEventListener('keydown', this.onKey);
      window.addEventListener('pointerdown', this.onPointer);
      window.addEventListener('particle-intro-timeout', this.finish);
      this.timeout = setTimeout(this.finish, 8000);
      void import('./particle-scene.js').then(({ mountParticleScene }) => mountParticleScene(canvas, hero, url, this.abort.signal, () => { if (this.phase() === 'loading') { clearTimeout(this.timeout); this.timeout = setTimeout(this.finish, 13000); this.setPhase('progress'); } }, (value, fading) => { this.zone.run(() => { this.count.set(value); this.countFading.set(fading); }); }, () => { if (this.phase() === 'progress') this.setPhase('assembling'); }, () => { if (this.phase() === 'assembling') this.zone.run(() => this.consolidating.set(true)); }, this.complete))
        .then(dispose => { if (this.destroyed || !this.active()) dispose(); else this.dispose = dispose; })
        .catch(() => this.finish());
    });
  }
  private readonly onPreference = (): void => { if (this.media?.matches) this.finish(); };
  private readonly onNavigation = (): void => { if (location.hash && location.hash !== '#inicio') this.finish(); };
  private readonly onKey = (): void => { this.finish(); };
  private readonly onPointer = (): void => { this.finish(); };
  readonly finish = (): void => {
    if (this.phase() === 'complete') return;
    this.abort.abort(); this.dispose?.(); this.dispose = undefined;
    clearTimeout(this.timeout);
    this.media?.removeEventListener('change', this.onPreference);
    window.removeEventListener('hashchange', this.onNavigation);
    window.removeEventListener('wheel', this.finish);
    window.removeEventListener('touchstart', this.finish);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('pointerdown', this.onPointer);
    window.removeEventListener('particle-intro-timeout', this.finish);
    window.removeEventListener('animationend', this.onRevealEnd, true);
    window.removeEventListener('animationcancel', this.onRevealEnd, true);
    this.setPhase('complete');
  };
  private readonly complete = (): void => {
    if (this.phase() !== 'assembling' || this.destroyed) return;
    this.dispose?.(); this.dispose = undefined; clearTimeout(this.timeout);
    window.addEventListener('animationend', this.onRevealEnd, true);
    window.addEventListener('animationcancel', this.onRevealEnd, true);
    this.setPhase('revealing');
  };
  private readonly onRevealEnd = (event: AnimationEvent): void => {
    if (event.animationName === 'particle-content-in' && (event.target as Element | null)?.matches('.hero-cta')) this.finish();
  };
  private setPhase(next: IntroPhase): void {
    const order: IntroPhase[] = ['loading', 'progress', 'assembling', 'revealing', 'complete'];
    if (order.indexOf(next) < order.indexOf(this.phase())) return;
    document.documentElement.dataset.particlePhase = next;
    this.zone.run(() => this.phase.set(next));
  }
  ngOnDestroy(): void { this.destroyed = true; if (this.browser) this.finish(); }
}

import { AfterViewInit, ChangeDetectionStrategy, Component, effect, ElementRef, inject, NgZone, OnDestroy, signal, ViewChild } from '@angular/core';
import { ArrowDown, createElement, Moon, Sun } from 'lucide';
import { gsap } from 'gsap';
import { CinematicIntroState } from '../../shared/motion/cinematic-intro-state.service';
import { ThemeService } from '../../shared/theme/theme.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { ViewportControlTargets } from './viewport-control-targets';
import template from './floating-controls.component.html?raw';
import styles from './floating-controls.component.css?inline';

@Component({
  selector: 'app-floating-controls', standalone: true, imports: [TranslatePipe], template, styles,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.intro-visible]': 'intro.visible()', '[attr.inert]': 'intro.visible() ? "" : null' },
})
export class FloatingControlsComponent implements AfterViewInit, OnDestroy {
  readonly theme = inject(ThemeService);
  readonly intro = inject(CinematicIntroState);
  readonly cueVisible = signal(true);
  readonly themeVisible = signal(true);
  readonly darkSurface = signal(true);
  readonly themeDarkSurface = signal(true);
  readonly atHome = signal(false);
  readonly atEnd = signal(false);
  readonly returning = signal(false);
  readonly homeTop = signal(0);
  readonly homeLeft = signal(0);
  @ViewChild('scrollButton') scrollButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('themeButton') themeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('arrowIcon') arrowIcon!: ElementRef<HTMLElement>;
  @ViewChild('sunIcon') sunIcon!: ElementRef<HTMLElement>;
  @ViewChild('moonIcon') moonIcon!: ElementRef<HTMLElement>;
  @ViewChild('returnVeil') returnVeil!: ElementRef<HTMLElement>;
  private readonly zone = inject(NgZone);
  private frame = 0;
  private ready = false;
  private destroyed = false;
  private resize?: ResizeObserver;
  private targets?: ViewportControlTargets;
  private about: HTMLElement | null = null;
  private hero: HTMLElement | null = null;
  private homeAnchors: HTMLElement[] = [];
  private rail: HTMLElement | null = null;
  private settleTimer?: ReturnType<typeof setTimeout>;
  private returnTimeline?: gsap.core.Timeline;

  constructor() {
    effect(() => {
      this.theme.theme(); this.intro.visible();
      this.queueLayout();
    });
  }

  ngAfterViewInit(): void {
    for (const [element, icon, size] of [[this.arrowIcon, ArrowDown, 20], [this.sunIcon, Sun, 18], [this.moonIcon, Moon, 18]] as const) {
      element.nativeElement.append(createElement(icon, { width: size, height: size, 'stroke-width': 1.5, 'aria-hidden': 'true' }));
    }
    this.ready = true;
    this.about = document.getElementById('sobre-mi');
    this.hero = document.querySelector('.hero');
    this.homeAnchors = Array.from(document.querySelectorAll('[data-scroll-cue-anchor]'));
    this.rail = document.querySelector('.is-viewport .grid-rail.left');
    this.zone.runOutsideAngular(() => {
      this.targets = new ViewportControlTargets(this.queueLayout);
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.queueLayout, { passive: true });
      window.visualViewport?.addEventListener('resize', this.queueLayout, { passive: true });
      window.visualViewport?.addEventListener('scroll', this.queueLayout, { passive: true });
      document.addEventListener('click', this.queueLayout);
      document.addEventListener('keyup', this.queueLayout);
      this.resize = new ResizeObserver(this.queueLayout);
      this.resize.observe(document.body);
      this.queueLayout();
    });
  }

  scrollFurther(): void {
    if (this.returning()) return;
    if (this.atEnd()) {
      this.returnToStart();
      return;
    }
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    const hero = document.querySelector('.hero');
    const about = document.getElementById('sobre-mi');
    if (hero && about && hero.getBoundingClientRect().bottom > innerHeight / 2) {
      window.scrollTo({ top: about.getBoundingClientRect().top + scrollY - 84, behavior });
    } else window.scrollBy({ top: Math.round((visualViewport?.height ?? innerHeight) * .8), behavior });
  }

  private returnToStart(): void {
    const finish = (): void => {
      this.returning.set(false);
      document.getElementById('inicio')?.focus({ preventScroll: true });
      this.queueLayout();
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      finish();
      return;
    }
    this.returning.set(true);
    // Blur the viewport through a separate veil, never the transformed/pinned
    // chapters. Their timelines and canvas instances continue uninterrupted.
    const position = { y: window.scrollY };
    this.zone.runOutsideAngular(() => {
      this.returnTimeline = gsap.timeline({ onComplete: () => this.zone.run(finish) })
        .to(this.returnVeil.nativeElement, { opacity: 1, backdropFilter: 'blur(14px)', duration: .3 })
        .to(position, {
          y: 0, duration: 1.35, ease: 'power3.inOut',
          onUpdate: () => window.scrollTo({ top: position.y, behavior: 'instant' }),
        }, .15)
        .to(this.returnVeil.nativeElement, { opacity: 0, backdropFilter: 'blur(0px)', duration: .4 });
    });
  }

  private readonly onScroll = (): void => {
    this.queueLayout();
    clearTimeout(this.settleTimer);
    // Scrubbed scenes can reveal an interactive control after the last scroll
    // event; check once more when that existing animation has settled.
    this.settleTimer = setTimeout(this.queueLayout, 800);
  };

  private readonly queueLayout = (): void => {
    if (!this.ready || this.destroyed || this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const root = document.documentElement;
      const remaining = root.scrollHeight - root.clientHeight - scrollY;
      const atEnd = remaining <= 40;
      const blocked = !!document.querySelector('dialog[open], .navigation.is-open');
      const about = this.about?.getBoundingClientRect();
      const hero = this.hero?.getBoundingClientRect();
      const anchor = this.homeAnchors.map(element => element.getBoundingClientRect()).find(box => box.width > 0);
      const atHome = !atEnd && !!anchor && !!about && about.top >= anchor.bottom + 12;
      const themeBox = this.themeButton.nativeElement.getBoundingClientRect();
      const homeTop = anchor?.top ?? 0, homeLeft = anchor?.left ?? 0;
      const cue = new DOMRect(
        atHome ? homeLeft : Math.max(10, (this.rail?.getBoundingClientRect().left ?? 24) - 56),
        atHome ? homeTop : themeBox.bottom - this.scrollButton.nativeElement.offsetHeight,
        44, this.scrollButton.nativeElement.offsetHeight,
      );
      const inHome = atHome && !!hero && cue.top >= hero.top && cue.bottom <= hero.bottom - 12;
      const afterHome = !atHome && !!about && cue.top >= about.top + 12;
      const cueVisible = !blocked && cue.top >= 0 && cue.bottom <= root.clientHeight
        && (inHome || afterHome || atEnd) && this.targets!.isClear(cue);
      this.targets!.watchControl(themeBox);
      this.targets!.watchControl(cue, 'scroll');
      const themeVisible = !blocked && this.targets!.isClear(themeBox);
      const x = cue.x + cue.width / 2, y = cue.y + cue.height / 2;
      const surfaces = this.targets!.readSurfaces();
      const isDark = (x: number, y: number): boolean => {
        let surface = 'neutral';
        surfaces.forEach(({ box, tone, visible }) => {
          if (visible && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) surface = tone;
        });
        return surface === 'dark' || surface === 'neutral' && this.theme.theme() === 'dark';
      };
      const darkSurface = isDark(x, y);
      const themeDarkSurface = isDark(themeBox.x + themeBox.width / 2, themeBox.y + themeBox.height / 2);
      if (atEnd === this.atEnd() && cueVisible === this.cueVisible() && themeVisible === this.themeVisible() && darkSurface === this.darkSurface() && themeDarkSurface === this.themeDarkSurface() && atHome === this.atHome() && homeTop === this.homeTop() && homeLeft === this.homeLeft()) return;
      this.zone.run(() => {
        this.atEnd.set(atEnd);
        this.cueVisible.set(cueVisible); this.darkSurface.set(darkSurface);
        this.themeVisible.set(themeVisible);
        this.themeDarkSurface.set(themeDarkSurface);
        this.atHome.set(atHome);
        this.homeTop.set(homeTop); this.homeLeft.set(homeLeft);
      });
    });
  };

  ngOnDestroy(): void {
    this.returnTimeline?.kill();
    this.destroyed = true; cancelAnimationFrame(this.frame); clearTimeout(this.settleTimer); this.resize?.disconnect();
    this.targets?.dispose();
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.queueLayout);
    window.visualViewport?.removeEventListener('resize', this.queueLayout);
    window.visualViewport?.removeEventListener('scroll', this.queueLayout);
    document.removeEventListener('click', this.queueLayout);
    document.removeEventListener('keyup', this.queueLayout);
  }
}

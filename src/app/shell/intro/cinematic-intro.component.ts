import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, inject, NgZone, OnDestroy, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { LanguageService } from '../../shared/i18n/language.service';
import { INTRO_SESSION_KEY, IntroResult } from '../../shared/motion/cinematic-intro-state.service';
import template from './cinematic-intro.component.html?raw';
import styles from './cinematic-intro.component.css?inline';

@Component({
  selector: 'app-cinematic-intro', standalone: true, template, styles,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CinematicIntroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('screen') screen!: ElementRef<HTMLDialogElement>;
  @ViewChild('film') film!: ElementRef<HTMLVideoElement>;
  @ViewChild('still') still!: ElementRef<HTMLElement>;
  @Output() readonly finished = new EventEmitter<IntroResult>();
  readonly language = inject(LanguageService);
  readonly videoSrc = new URL('./assets/cinematic-intro.mp4', import.meta.url).href;
  readonly posterSrc = new URL('../../shared/assets/night-lily.png', import.meta.url).href;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private preference?: MediaQueryList;
  private fade?: gsap.core.Timeline;
  private loadingTimer?: ReturnType<typeof setTimeout>;
  private safetyTimer?: ReturnType<typeof setTimeout>;
  private ending = false;
  private destroyed = false;
  private aligned = false;

  ngAfterViewInit(): void {
    if (!this.browser) { this.finished.emit('unavailable'); return; }
    this.preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (this.preference.matches) { this.finished.emit('reduced'); return; }
    try { sessionStorage.setItem(INTRO_SESSION_KEY, '1'); } catch { /* Session storage is optional. */ }
    const dialog = this.screen.nativeElement;
    try { dialog.showModal(); } catch { this.finished.emit('unavailable'); return; }
    this.syncStillFrame();
    window.addEventListener('resize', this.syncStillFrame, { passive: true });
    this.preference.addEventListener('change', this.onPreference);
    document.addEventListener('visibilitychange', this.onVisibility);
    dialog.addEventListener('wheel', this.preventScroll, { passive: false });
    window.addEventListener('scroll', this.keepHome, { passive: true });
    this.keepHome();
    this.loadingTimer = setTimeout(() => this.finish('unavailable'), 5000);
    this.safetyTimer = setTimeout(() => this.finish('unavailable'), 60000);
    const video = this.film.nativeElement;
    video.muted = true;
    video.src = this.videoSrc;
    void video.play().catch(() => this.finish('unavailable'));
  }

  playing(): void { clearTimeout(this.loadingTimer); }
  nearEnd(): void {
    const video = this.film.nativeElement;
    if (!video.seeking && Number.isFinite(video.duration) && video.duration - video.currentTime <= 1.35) this.finish('ended');
  }
  // Match the real Hero backdrop, including its navbar offset and shorter mobile height.
  private readonly syncStillFrame = (): void => {
    const hero = document.querySelector<HTMLElement>('app-hero');
    if (!hero) return;
    const bounds = hero.getBoundingClientRect();
    const backdrop = getComputedStyle(hero, '::before');
    Object.assign(this.still.nativeElement.style, {
      left: `${bounds.left}px`, top: `${bounds.top + (parseFloat(backdrop.top) || 0)}px`,
      width: `${bounds.width}px`, height: backdrop.height, right: 'auto', bottom: 'auto',
      backgroundImage: backdrop.backgroundImage, backgroundPosition: backdrop.backgroundPosition,
      backgroundSize: backdrop.backgroundSize,
    });
    if (this.aligned) this.alignFilm();
  };
  /** Match the actual background rectangle, not the dialog's dynamic viewport. */
  private alignFilm(): void {
    const frame = this.still.nativeElement.style;
    Object.assign(this.film.nativeElement.style, {
      left: frame.left, top: frame.top, width: frame.width, height: frame.height,
      right: 'auto', bottom: 'auto',
      objectPosition: frame.backgroundPosition.split(',').at(-1)!.trim(),
    });
  }
  waiting(): void {
    if (this.ending) return;
    clearTimeout(this.loadingTimer);
    this.loadingTimer = setTimeout(() => this.finish('unavailable'), 8000);
  }
  cancel(event: Event): void { event.preventDefault(); this.finish('skipped'); }
  preventNavigation(event: KeyboardEvent): void {
    if (['PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp'].includes(event.key)) event.preventDefault();
  }
  finish(reason: IntroResult): void {
    if (this.ending || this.destroyed) return;
    this.ending = true;
    clearTimeout(this.loadingTimer); clearTimeout(this.safetyTimer);
    this.syncStillFrame();
    if (reason !== 'ended') this.film.nativeElement.pause();
    const complete = (): void => {
      if (this.destroyed) return;
      this.screen.nativeElement.close();
      this.zone.run(() => this.finished.emit(reason));
    };
    if (reason === 'reduced' || reason === 'unavailable') { complete(); return; }
    this.zone.runOutsideAngular(() => {
      if (reason === 'ended' && matchMedia('(max-width: 820px)').matches) {
        const film = this.film.nativeElement;
        const frame = this.still.nativeElement.style;
        this.screen.nativeElement.dataset.handoff = 'aligning';
        // The PNG and encoded final shot have slightly different compositions.
        // First register their viewport crop, then dissolve to the original PNG.
        // The last visible intro image is thus exactly the Hero's backdrop.
        this.fade = gsap.timeline({ onComplete: complete })
          .to(this.screen.nativeElement.querySelector('.skip-intro'), { opacity: 0, duration: .2 }, 0)
          .to(film, {
            left: () => frame.left, top: () => frame.top,
            width: () => frame.width, height: () => frame.height,
            objectPosition: () => frame.backgroundPosition.split(',').at(-1)!.trim(),
            duration: .85, ease: 'sine.inOut',
            onComplete: () => { this.aligned = true; this.syncStillFrame(); film.pause(); },
          }, 0)
          .to(film, { opacity: 0, duration: .65, ease: 'sine.inOut' }, .85)
          .call(() => { this.screen.nativeElement.dataset.handoff = 'still'; }, [], 1.5)
          .to({}, { duration: .25 }, 1.5)
          .to(this.screen.nativeElement, { opacity: 0, duration: .4, ease: 'sine.inOut' }, 1.75);
        return;
      }
      const dissolve = reason === 'skipped' ? .4 : 1.25;
      this.fade = gsap.timeline({ onComplete: complete })
        .to(this.film.nativeElement, { opacity: 0, filter: 'blur(2px)', duration: dissolve, ease: 'sine.inOut', onComplete: () => this.film.nativeElement.pause() }, 0)
        .to(this.screen.nativeElement.querySelector('.skip-intro'), { opacity: 0, duration: .2 }, 0)
        .to(this.screen.nativeElement, { opacity: 0, duration: reason === 'skipped' ? .25 : .5, ease: 'sine.inOut' }, dissolve);
    });
  }
  private readonly preventScroll = (event: Event): void => event.preventDefault();
  // Browser restoration and ScrollTrigger refresh can restore an old section
  // after startup. The movie must dissolve into Home, never that old position.
  private readonly keepHome = (): void => {
    if (!this.destroyed && this.screen.nativeElement.open && window.scrollY !== 0) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };
  private readonly onPreference = (): void => {
    if (!this.preference?.matches) return;
    if (this.fade) this.fade.progress(1);
    else this.finish('reduced');
  };
  private readonly onVisibility = (): void => {
    if (this.ending) return;
    if (document.hidden) this.film.nativeElement.pause();
    else void this.film.nativeElement.play().catch(() => this.finish('unavailable'));
  };
  ngOnDestroy(): void {
    this.destroyed = true;
    this.fade?.kill();
    clearTimeout(this.loadingTimer); clearTimeout(this.safetyTimer);
    this.preference?.removeEventListener('change', this.onPreference);
    if (!this.browser) return;
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('resize', this.syncStillFrame);
    window.removeEventListener('scroll', this.keepHome);
    const dialog = this.screen.nativeElement;
    dialog.removeEventListener('wheel', this.preventScroll);
    dialog.close();
    const video = this.film.nativeElement;
    video.pause(); video.removeAttribute('src'); video.load();
  }
}

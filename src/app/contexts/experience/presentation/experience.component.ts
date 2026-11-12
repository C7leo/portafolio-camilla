import { EditorialGridComponent } from '../../../shared/ui/editorial-grid/editorial-grid.component';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, NgZone, OnDestroy, signal, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ExperienceValleyComponent } from './experience-valley.component';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { ViewportMotionService } from '../../../shared/motion/viewport-motion.service';
import { LanguageService } from '../../../shared/i18n/language.service';
import { ExperienceCatalogService } from '../application/experience-catalog.service';
import template from './experience.component.html?raw';
import styles from './experience.component.css?inline';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-experience', standalone: true, imports: [ExperienceValleyComponent, EditorialGridComponent, TranslatePipe],
  template, styles, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent implements AfterViewInit, OnDestroy {
  readonly experiences = inject(ExperienceCatalogService).entries;
  @ViewChild('experienceScene') scene!: ElementRef<HTMLElement>;
  @ViewChild('valley') valley!: ExperienceValleyComponent;
  readonly readingMode = signal(false);
  private readonly zone = inject(NgZone);
  private readonly motion = inject(ViewportMotionService);
  private readonly language = inject(LanguageService);
  private context?: gsap.Context;
  private stopPreference?: () => void;
  private frame = 0;
  private destroyed = false;
  private graphicsUnavailable = false;
  private shortViewport = false;
  private resizeFrame = 0;
  private readonly onResize = (): void => {
    cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = requestAnimationFrame(() => {
      if (this.shortViewport !== (this.scene.nativeElement.querySelector<HTMLElement>('.experience-grid')!.clientHeight < 560)) this.setup();
    });
  };
  get english(): boolean { return this.language.language() === 'en'; }

  toggleReadingMode(): void {
    this.readingMode.update(value => !value);
    this.zone.runOutsideAngular(() => this.setup());
    const section = this.scene.nativeElement;
    // Return to the start of the narrative after changing its document height.
    section.querySelector('.experience-content')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  onGraphicsUnavailable(): void {
    const bounds = this.scene.nativeElement.getBoundingClientRect();
    const withinJourney = bounds.top <= 0 && bounds.bottom > 0;
    this.graphicsUnavailable = true;
    this.zone.runOutsideAngular(() => this.setup());
    if (withinJourney) this.scene.nativeElement.querySelector('.experience-content')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  get openingParts(): readonly [string, string] {
    const word = this.language.translate('EXPERIENCE.').replace('.', '');
    const middle = Math.floor(word.length / 2);
    return [word.slice(0, middle), word.slice(middle)];
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.stopPreference = this.motion.onPreferenceChange(() => this.setup());
      window.addEventListener('resize', this.onResize, { passive: true });
      this.frame = requestAnimationFrame(() => this.setup());
    });
  }
  private setup(): void {
    if (this.destroyed) return;
    this.context?.revert(); this.context = undefined;
    const section = this.scene.nativeElement;
    delete section.dataset.zoomEnabled;
    delete section.dataset.zoomProgress;
    delete section.dataset.journeyEnabled;
    delete section.dataset.canAnimate;
    section.querySelectorAll<HTMLElement>('.experience-entry, .experience-header, .journey-mode').forEach(element => {
      element.inert = false; element.removeAttribute('aria-hidden');
    });
    // CSS uses svh, which stays stable while mobile browser bars expand. Use
    // that same measured height for all distances and aperture coordinates.
    const viewportHeight = (): number => section.querySelector<HTMLElement>('.experience-grid')!.clientHeight;
    this.shortViewport = viewportHeight() < 560;
    const canAnimate = !this.motion.reduced && this.motion.supported && !this.graphicsUnavailable && !this.shortViewport;
    if (canAnimate) section.dataset.canAnimate = '';
    if (!canAnimate || this.readingMode()) {
      this.valley?.setProgress(.35);
      ScrollTrigger.refresh(); return;
    }
    section.dataset.zoomEnabled = '';
    section.dataset.journeyEnabled = '';
    this.context = gsap.context(() => {
      const photo = section.querySelector<HTMLElement>('.experience-photo')!;
      const preview = section.querySelector<HTMLCanvasElement>('.experience-valley-preview')!;
      const backdrop = section.querySelector<HTMLElement>('.experience-backdrop')!;
      const content = section.querySelector<HTMLElement>('.experience-content')!;
      const opening = section.querySelector<HTMLElement>('.experience-opening')!;
      const hairline = section.querySelector<HTMLElement>('.experience-aperture-line')!;
      const stage = section.querySelector<HTMLElement>('.experience-stage')!;
      const typeSize = (): number => Math.min(section.clientWidth * .12, viewportHeight() * .16);
      const circle = (): number => typeSize() * 1.81;
      const pillWidth = (): number => innerWidth <= 720 ? section.clientWidth - 48 : typeSize() * 3.62;
      const pillHeight = (): number => innerWidth <= 720 ? pillWidth() / 1.85 : circle();
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'experience-image-zoom', trigger: section, start: 'top top',
          end: () => `+=${Math.round(viewportHeight() * 1.25)}`, scrub: .35, invalidateOnRefresh: true,
          onUpdate: self => { section.dataset.zoomProgress = self.progress.toFixed(4); },
        },
      });
      timeline.fromTo(photo, {
        opacity: 1,
        width: 1.5, height: circle, left: () => (section.clientWidth - 1.5) / 2,
        top: () => (viewportHeight() - circle()) / 2, borderRadius: 999, clipPath: 'inset(50% 0)',
      }, { clipPath: 'inset(0%)', duration: .1 }, 0)
        .to(photo, { width: () => typeSize() * .16, left: () => (section.clientWidth - typeSize() * .16) / 2, duration: .18 }, .1)
        .to(photo, { width: circle, left: () => (section.clientWidth - circle()) / 2, duration: .22 }, .28)
        .to(photo, { width: pillWidth, height: pillHeight, left: () => (section.clientWidth - pillWidth()) / 2, top: () => (viewportHeight() - pillHeight()) / 2, duration: .22 }, .5)
        .to(photo, { width: () => section.clientWidth, height: viewportHeight, left: 0, top: 0, borderRadius: 0, duration: .28 }, .72)
        .fromTo(section, { '--opening-width': '1.5px' }, { '--opening-width': () => `${typeSize() * .16}px`, duration: .18 }, .1)
        .to(section, { '--opening-width': () => `${circle()}px`, duration: .22 }, .28)
        .to(section, { '--opening-width': () => `${pillWidth()}px`, duration: .22 }, .5)
        .to(section, { '--opening-width': () => `${section.clientWidth}px`, duration: .28 }, .72)
        .fromTo(hairline, { opacity: 1 }, { opacity: 0, duration: .18 }, .1)
        .fromTo(opening, { opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(12px)', duration: .18 }, .6)
        .fromTo(photo, { filter: 'grayscale(1) saturate(1) contrast(1) brightness(1)' }, {
          filter: 'grayscale(0) saturate(1) contrast(1) brightness(1)', duration: .38,
        }, .62)
        // Fractional scroll positions can settle just below 1 in WebKit. Reveal
        // once the aperture is effectively full, instead of leaving a blank world.
        .set(stage, { visibility: 'visible' }, .98);

      // Move the aperture away, but keep its landscape aligned with the fixed valley.
      gsap.timeline({ scrollTrigger: {
        id: 'experience-world-entry', trigger: section,
        start: () => `top+=${viewportHeight() * 1.65} top`,
        end: () => `top+=${viewportHeight() * 2.65} top`,
        scrub: .35, invalidateOnRefresh: true,
      } })
        .to(backdrop, { yPercent: -100, ease: 'none', duration: 1 }, 0)
        .fromTo(preview, { yPercent: 0 }, { yPercent: 100, ease: 'none', duration: 1 }, 0);

      const header = section.querySelector<HTMLElement>('.experience-header')!;
      const entries = [...section.querySelectorAll<HTMLElement>('.experience-entry')];
      const information = entries.map(entry => entry.querySelector<HTMLElement>('.entry-information')!);
      const environment = section.querySelector<HTMLElement>('app-experience-valley')!;
      const mode = section.querySelector<HTMLElement>('.journey-mode')!;
      const travel = { progress: 0 };
      this.valley.setProgress(0);
      let active = -2;
      let headerHidden = false;
      gsap.set(information, { opacity: 0 });
      gsap.set([environment, preview], { opacity: .7 });
      entries.forEach(entry => { entry.inert = true; entry.setAttribute('aria-hidden', 'true'); });
      const journey = gsap.timeline({
        defaults: { ease: 'sine.inOut' },
        onUpdate: () => {
          this.valley.setProgress(travel.progress);
          const time = journey.time();
          const closing = time >= 9.5;
          if (mode.inert !== closing) {
            mode.inert = closing;
            mode.setAttribute('aria-hidden', String(closing));
          }
          const current = time >= 1.2 && time < 5.2 ? 0 : time >= 5.5 && time < 9.5 ? 1 : -1;
          if (current !== active) {
            entries.forEach((entry, index) => { entry.inert = index !== current; entry.setAttribute('aria-hidden', String(index !== current)); });
            active = current;
          }
          const hideHeader = time > 1.05;
          if (hideHeader !== headerHidden) {
            header.setAttribute('aria-hidden', String(hideHeader));
            headerHidden = hideHeader;
          }
        },
        scrollTrigger: {
          id: 'experience-journey', trigger: content, start: 'top top',
          end: () => `+=${Math.round(viewportHeight() * 8.5)}`, pin: stage, pinSpacing: true,
          scrub: .6, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      journey.to(header, { opacity: 0, duration: .45 }, .6)
        .to(information[0], { opacity: 1, duration: .7 }, 1.2)
        .to(information[0], { opacity: 0, duration: .65 }, 4.55)
        .to(information[1], { opacity: 1, duration: .7 }, 5.5)
        .to(information[1], { opacity: 0, duration: .65 }, 8.85)
        .to(travel, { progress: .1, duration: 1.2, ease: 'none' }, 0)
        .to(travel, { progress: .28, duration: 1, ease: 'none' }, 1.2)
        .to(travel, { progress: .31, duration: 2.05, ease: 'none' }, 2.2)
        .to(travel, { progress: .65, duration: 2.25, ease: 'none' }, 4.25)
        .to(travel, { progress: .68, duration: 2, ease: 'none' }, 6.5)
        .to(travel, { progress: 1, duration: 1.8, ease: 'none' }, 8.5)
        .to([environment, preview], { opacity: .32, duration: .8 }, 1.6)
        .to([environment, preview], { opacity: .85, duration: .7 }, 4.6)
        .to([environment, preview], { opacity: .32, duration: .7 }, 5.9)
        .to([environment, preview], { opacity: .85, duration: .6 }, 8.85)
        .to([environment, preview], { opacity: 0, duration: .8 }, 9.5)
        .to(section, { backgroundColor: '#FFFFFF', duration: .6 }, 9.7)
        .to(mode, { opacity: 0, duration: .3 }, 9.5);
    }, section);
    ScrollTrigger.refresh();
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.frame);
    cancelAnimationFrame(this.resizeFrame);
    window.removeEventListener('resize', this.onResize);
    this.stopPreference?.();
    this.context?.revert();
  }
}

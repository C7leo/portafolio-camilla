import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, NgZone, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { LanguageService } from '../../../shared/i18n/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { EXPERIENCE_COPY, ExperienceCopy } from '../../../shared/i18n/experience.copy';



@Component({ selector: 'app-experience', standalone: true, imports: [TranslatePipe], templateUrl: './experience.component.html', styleUrl: './experience.component.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class ExperienceComponent implements AfterViewInit, OnDestroy {
  protected readonly timelineComplete = signal(false);
  private readonly language = inject(LanguageService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private preference?: MediaQueryList;
  private resizeObserver?: ResizeObserver;
  private section?: HTMLElement;
  private entries: HTMLElement[] = [];
  private frame = 0;
  private tracking = false;

  get copy(): ExperienceCopy { return EXPERIENCE_COPY[this.language.language()]; }

  ngAfterViewInit(): void {
    if (!this.browser) return;
    this.preference = matchMedia('(prefers-reduced-motion: reduce)');
    this.zone.runOutsideAngular(() => {
      this.section = this.host.querySelector<HTMLElement>('.experience') ?? undefined;
      this.entries = Array.from(this.host.querySelectorAll<HTMLElement>('.timeline-entry'));
      this.preference!.addEventListener('change', this.onPreference);
      this.configureMotion();
    });
  }

  private configureMotion(): void {
    this.stopTracking();
    const section = this.section;
    if (!section || this.entries.length !== 2) return;
    if (this.preference?.matches || typeof IntersectionObserver === 'undefined') {
      section.classList.remove('will-reveal');
      section.classList.add('is-visible');
      this.entries.forEach(entry => entry.classList.add('is-visible'));
      section.style.setProperty('--timeline-progress', '1');
      this.timelineComplete.set(true);
      return;
    }

    this.observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        section.classList.add('is-visible');
        this.observer?.disconnect();
      }
    }, { threshold: 0.08 });
    section.classList.add('will-reveal');
    this.observer.observe(section);
    window.addEventListener('scroll', this.scheduleUpdate, { passive: true });
    window.addEventListener('resize', this.scheduleUpdate, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.scheduleUpdate);
      this.entries.forEach(entry => this.resizeObserver!.observe(entry));
    }
    this.tracking = true;
    this.updateProgress();
  }

  private readonly scheduleUpdate = (): void => {
    if (!this.frame) this.frame = requestAnimationFrame(this.updateProgress);
  };

  private readonly updateProgress = (): void => {
    this.frame = 0;
    if (!this.section || this.entries.length !== 2) return;
    const first = this.entries[0].getBoundingClientRect();
    const second = this.entries[1].getBoundingClientRect();
    const firstNode = this.entries[0].querySelector<HTMLElement>('.timeline-node');
    const secondNode = this.entries[1].querySelector<HTMLElement>('.timeline-node');
    if (!firstNode || !secondNode) return;
    // Entry boxes are stationary even while the circles themselves animate.
    const firstCenter = first.top + firstNode.offsetHeight / 2;
    const secondCenter = second.top + secondNode.offsetHeight / 2;
    const start = innerHeight * .82;
    // The same viewport line crosses each node in turn; their distance is
    // exactly the scroll distance needed to draw the connector.
    const distance = secondCenter - firstCenter;
    const progress = Math.max(0, Math.min(1, (start - firstCenter) / Math.max(distance, 1)));
    this.section.style.setProperty('--timeline-progress', String(progress));
    this.timelineComplete.set(progress >= 1);
    if (firstCenter <= start) this.entries[0].classList.add('is-visible');
    if (progress >= 1) this.entries[1].classList.add('is-visible');
  };

  private readonly onPreference = (): void => this.configureMotion();

  private stopTracking(): void {
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
    if (this.tracking) {
      window.removeEventListener('scroll', this.scheduleUpdate);
      window.removeEventListener('resize', this.scheduleUpdate);
    }
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.tracking = false;
  }

  ngOnDestroy(): void {
    this.stopTracking();
    this.preference?.removeEventListener('change', this.onPreference);
  }
}

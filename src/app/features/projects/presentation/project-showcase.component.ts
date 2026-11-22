import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, effect, inject, signal } from '@angular/core';
import { LanguageService } from '../../../shared/i18n/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import type { Project } from '../domain/project.model';
import type { mountCircularCarousel } from './circular-carousel-bridge.js';



@Component({ selector: 'app-project-showcase', standalone: true, imports: [TranslatePipe], templateUrl: './project-showcase.component.html', styleUrl: './project-showcase.component.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class ProjectShowcaseComponent implements AfterViewInit, OnDestroy {
  private readonly order = ['harmonix', 'spotfinder', 'nutrisend', 'eduspace', 'courtly', 'smartcampus'];
  readonly language = inject(LanguageService);
  readonly activeIndex = signal(0);
  readonly autoplay = signal(true);
  readonly carouselReady = signal(false);
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private carousel?: ReturnType<typeof mountCircularCarousel>;
  private carouselTarget?: HTMLElement;
  private observer?: IntersectionObserver;
  private loading?: Promise<void>;
  private destroyed = false;
  projects: readonly Project[] = [];
  constructor() {
    effect(() => {
      const labels = this.carouselLabels();
      this.carousel?.setLabels(labels);
    });
  }
  private carouselLabels() {
    const t = (key: string) => this.language.translate(key);
    return { region: t('carousel.region'), carousel: t('carousel.role'), slide: t('carousel.slide'), of: t('carousel.of'), image: t('carousel.image') };
  }

  @Input({ required: true }) set catalog(value: readonly Project[]) {
    this.projects = this.order.flatMap(id => {
      const project = value.find(item => item.id === id);
      return project ? [project] : [];
    });
    this.activeIndex.set(0);
  }
  get activeProject(): Project | undefined { return this.projects[this.activeIndex()]; }
  ngAfterViewInit(): void {
    this.carouselTarget = this.host.querySelector<HTMLElement>('.react-carousel') ?? undefined;
    if (!this.carouselTarget) return;
    this.zone.runOutsideAngular(() => {
      if (typeof IntersectionObserver === 'undefined') { void this.loadCarousel(); return; }
      this.observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        this.observer?.disconnect();
        void this.loadCarousel();
      }, { rootMargin: '400px' });
      this.observer.observe(this.carouselTarget!);
    });
  }
  private loadCarousel(): Promise<void> {
    if (this.carousel || this.destroyed || !this.carouselTarget) return Promise.resolve();
    if (!this.loading) this.loading = import('./circular-carousel-bridge.js').then(({ mountCircularCarousel }) => {
      if (this.destroyed || !this.carouselTarget) return;
      this.carousel = mountCircularCarousel(this.carouselTarget, this.projects, index => this.zone.run(() => this.activeIndex.set(index)), () => {
        if (!this.destroyed) this.zone.run(() => this.carouselReady.set(true));
      }, this.carouselLabels());
      if (!this.autoplay()) this.carousel.setAutoplay(false);
    }).catch(error => {
      this.loading = undefined;
      console.error('No se pudo cargar la galería de proyectos.', error);
    });
    return this.loading;
  }
  select(index: number): void { void this.loadCarousel().then(() => this.carousel?.select(index)); }
  toggleAutoplay(): void {
    this.autoplay.update(value => !value);
    this.carousel?.setAutoplay(this.autoplay());
  }
  ngOnDestroy(): void { this.destroyed = true; this.observer?.disconnect(); this.carousel?.destroy(); }
}

import { EditorialGridComponent } from '../../../../shared/ui/editorial-grid/editorial-grid.component';
import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, NgZone, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { createElement, Database, GitBranch, Leaf } from 'lucide';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LanguageService } from '../../../../shared/i18n/language.service';
import { ABOUT_PASSAGES, ABOUT_TECHNOLOGIES } from './about-story.data';
import { AboutHorizonBloomComponent } from './about-horizon-bloom.component';
import template from './about-story.component.html?raw';
import styles from './about-story.component.css?inline';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about-story', standalone: true, imports: [EditorialGridComponent, AboutHorizonBloomComponent], template, styles,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutStoryComponent implements AfterViewInit, OnDestroy {
  readonly language = inject(LanguageService);
  readonly passages = computed(() => ABOUT_PASSAGES.map(passage =>
    passage.map(line => this.language.translate(line).split(' ')),
  ));
  readonly technologies = ABOUT_TECHNOLOGIES;
  readonly paused = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private media?: gsap.MatchMedia;
  private loops: gsap.core.Tween[] = [];
  private frame = 0;
  private destroyed = false;

  ngAfterViewInit(): void {
    if (!this.browser) return;
    this.zone.runOutsideAngular(() => {
      const symbols = { leaf: Leaf, database: Database, branch: GitBranch };
      this.host.querySelectorAll<HTMLElement>('[data-tech-icon]').forEach(element => {
        const symbol = symbols[element.dataset.techIcon as keyof typeof symbols];
        if (symbol) element.append(createElement(symbol, { width: 24, height: 24, 'stroke-width': 1.7, 'aria-hidden': 'true' }));
      });
      this.frame = requestAnimationFrame(() => this.setup());
      document.fonts.ready.then(() => {
        if (!this.destroyed) ScrollTrigger.refresh();
      });
    });
  }

  private setup(): void {
    if (this.destroyed) return;
    this.media = gsap.matchMedia();
    this.media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      mobile: '(max-width: 640px)',
    }, context => {
      const { motion, mobile } = context.conditions!;
      const story = this.host.querySelector<HTMLElement>('.about-story')!;
      const marquee = this.host.querySelector<HTMLElement>('.technology-marquee')!;
      if (!motion) return;
      let cleanupMarquee: (() => void) | undefined;
      try {
        this.setupStory(story, mobile);
        cleanupMarquee = this.setupMarquee();
      } catch {
        // Roll back any partial enhancement; the default layout is the fallback.
        context.revert();
        story.classList.remove('is-enhanced');
        marquee.classList.remove('is-animated');
        this.loops = [];
      }
      return () => {
        cleanupMarquee?.();
        story.classList.remove('is-enhanced');
        marquee.classList.remove('is-animated');
        this.loops = [];
      };
    }, this.host);
  }

  private setupStory(story: HTMLElement, mobile: boolean): void {
    const stage = story.querySelector<HTMLElement>('.story-stage')!;
    const passages = gsap.utils.toArray<HTMLElement>('.story-passage', story);
    story.classList.add('is-enhanced');
    gsap.set(story.querySelectorAll('.story-word'), { color: '#202020' });
    gsap.set(passages, { autoAlpha: 0, y: 8, filter: 'blur(10px)' });
    gsap.set(passages[0], { autoAlpha: 1, y: 0, filter: 'blur(0px)' });

    const timeline = gsap.timeline({
      scrollTrigger: {
        id: 'about-narrative', trigger: stage, start: 'top 84px',
        end: () => `+=${Math.round(innerHeight * (mobile ? 3.6 : 4.2))}`,
        pin: stage, scrub: .65, invalidateOnRefresh: true,
        refreshPriority: 4,
      },
    });
    timeline
      .to({}, { duration: .65 })
      .to(passages[0], { autoAlpha: 0, y: -8, filter: 'blur(10px)', duration: .5, ease: 'sine.inOut' })
      .fromTo(passages[1], { autoAlpha: 0, y: 8, filter: 'blur(10px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .65, ease: 'sine.inOut', immediateRender: false }, '-=.15')
      .to({}, { duration: .65 })
      .to(passages[1], { autoAlpha: 0, y: -8, filter: 'blur(10px)', duration: .5, ease: 'sine.inOut' })
      .fromTo(passages[2], { autoAlpha: 0, y: 8, filter: 'blur(10px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .65, ease: 'sine.inOut', immediateRender: false }, '-=.15')
      .to({}, { duration: .75 });

    // One continuous transition controls both the outgoing narrative and the
    // editorial composition. The photos remain in normal flow, never pinned.
    const editorial = this.host.querySelector<HTMLElement>('.editorial-transition')!;
    const transition = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'about-editorial', trigger: editorial, start: 'top bottom',
        end: mobile ? 'bottom 85%' : 'top 20%', scrub: true, invalidateOnRefresh: true,
        refreshPriority: 3,
      },
    });
    transition.to(story.querySelector('.story-copy'), { y: -36, opacity: 0, duration: mobile ? .18 : .45 }, 0)
      .to(story.querySelector('.story-horizon'), { y: -18, opacity: .18, duration: mobile ? .2 : .6 }, 0)
      .fromTo(editorial.querySelector('.portrait-mask'), { clipPath: 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0% 0 0 0)', duration: mobile ? .32 : .65 }, 0)
      .fromTo(editorial.querySelector('.process'), { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: mobile ? .22 : .45 }, mobile ? .36 : .2)
      .fromTo(editorial.querySelector('.manifesto'), { y: 24, clipPath: 'inset(100% 0 0 0)' },
        { y: 0, clipPath: 'inset(0% 0 0 0)', duration: mobile ? .24 : .3 }, mobile ? .74 : .7);
  }

  private setupMarquee(): () => void {
    this.host.querySelector('.technology-marquee')!.classList.add('is-animated');
    const groups = gsap.utils.toArray<HTMLElement>('.marquee-group', this.host);
    const originals = groups.map(group => Array.from(group.children));
    const fillers: Element[] = [];
    let previousWidth = 0;
    const fillRows = () => {
      const width = this.host.clientWidth;
      if (!width || width === previousWidth) return;
      previousWidth = width;
      fillers.splice(0).forEach(element => element.remove());
      groups.forEach((group, index) => {
        // Repeat complete sets so both halves remain identical and loop seamlessly.
        while (group.getBoundingClientRect().width < width) {
          originals[index].forEach(element => {
            const copy = element.cloneNode(true) as HTMLElement;
            copy.setAttribute('aria-hidden', 'true');
            group.append(copy);
            fillers.push(copy);
          });
        }
      });
    };
    fillRows();
    const resize = new ResizeObserver(fillRows);
    resize.observe(this.host);
    const tracks = gsap.utils.toArray<HTMLElement>('.marquee-track', this.host);
    this.loops = tracks.map((track, index) => gsap.fromTo(track,
      { xPercent: index === 0 ? 0 : -50 },
      { xPercent: index === 0 ? -50 : 0, duration: 45, repeat: -1, ease: 'none', paused: this.paused() },
    ));
    const speed = { value: 1 };
    const settle = gsap.to(speed, {
      value: 1, duration: .85, ease: 'power2.out', paused: true,
      onUpdate: () => this.loops.forEach(loop => loop.timeScale(speed.value)),
    });
    const visibility = ScrollTrigger.create({
      trigger: this.host.querySelector('.technology-marquee'), start: 'top bottom', end: 'bottom top',
      onUpdate: self => {
        speed.value = 1 + Math.min(Math.abs(self.getVelocity()) / 2600, .8);
        settle.invalidate().restart();
      },
      onToggle: self => this.loops.forEach(loop => loop.paused(this.paused() || !self.isActive)),
    });
    this.loops.forEach(loop => loop.paused(this.paused() || !visibility.isActive));
    return () => {
      resize.disconnect();
      fillers.forEach(element => element.remove());
    };
  }

  toggleMarquee(): void {
    this.paused.update(value => !value);
    this.loops.forEach(loop => loop.paused(this.paused()));
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.browser) cancelAnimationFrame(this.frame);
    this.media?.revert();
  }
}

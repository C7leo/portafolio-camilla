import { AfterViewInit, Directive, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ViewportMotionService } from './viewport-motion.service';

gsap.registerPlugin(ScrollTrigger);

interface Chapter { name: string; host: HTMLElement; surface: HTMLElement; }

/** Pins only the outgoing tail, during the next chapter's natural viewport entry. */
@Directive({ selector: '[appStoryChapters]', standalone: true })
export class StoryChaptersDirective implements AfterViewInit, OnDestroy {
  private readonly main = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly motion = inject(ViewportMotionService);
  private chapters: Chapter[] = [];
  private context?: gsap.Context;
  private observer?: ResizeObserver;
  private stopPreference?: () => void;
  private refreshTimer?: ReturnType<typeof setTimeout>;
  private frame = 0;
  private destroyed = false;
  private short = false;
  private viewportWidth = innerWidth;
  private scrollMargin = '';
  private refreshFocus?: HTMLElement;

  ngAfterViewInit(): void {
    this.scrollMargin = this.main.style.scrollMarginTop;
    this.main.style.scrollMarginTop = '96px';
    const names = ['home', 'about', 'projects', 'experience'];
    this.chapters = Array.from(this.main.children).flatMap((node, index) => {
      if (!(node instanceof HTMLElement)) return [];
      const surface = node.querySelector<HTMLElement>('section');
      return surface ? [{ name: names[index], host: node, surface }] : [];
    });
    this.zone.runOutsideAngular(() => {
      this.stopPreference = this.motion.onPreferenceChange(() => this.setup());
      window.addEventListener('resize', this.onResize, { passive: true });
      this.main.addEventListener('focusin', this.onFocus);
      this.main.addEventListener('focusout', this.onFocusOut);
      ScrollTrigger.addEventListener('refreshInit', this.rememberRefreshFocus);
      ScrollTrigger.addEventListener('refresh', this.restoreRefreshFocus);
      this.frame = requestAnimationFrame(() => {
        this.setup();
        if (typeof ResizeObserver !== 'undefined') {
          const sizes = new WeakMap<Element, string>();
          this.observer = new ResizeObserver(entries => {
            let changed = false;
            for (const entry of entries) {
              const size = `${Math.round(entry.contentRect.width)}:${Math.round(entry.contentRect.height)}`;
              if (sizes.get(entry.target) !== size) { sizes.set(entry.target, size); changed = true; }
            }
            if (changed) this.queueRefresh();
          });
          this.chapters.forEach(chapter => this.observer!.observe(chapter.surface));
        }
        document.fonts.ready.then(() => { if (!this.destroyed) this.queueRefresh(); });
      });
    });
  }

  private setup(): void {
    if (this.destroyed) return;
    this.context?.revert();
    this.context = undefined;
    this.short = innerHeight <= 500;
    this.chapters.forEach(chapter => {
      delete chapter.host.dataset.storyChapter;
      delete chapter.surface.dataset.storyTransition;
      delete chapter.surface.dataset.storyProgress;
      delete chapter.surface.dataset.storyStart;
      delete chapter.surface.dataset.storyEnd;
      delete chapter.surface.dataset.storyFocus;
    });
    if (this.motion.reduced || !this.motion.supported || this.short) return;
    // Keep element entrances; replace only the former time-based surface reveals.
    this.chapters.forEach(chapter => {
      if (chapter.surface.dataset.motion?.endsWith('surface')) this.motion.finishEntrance(chapter.surface);
    });
    this.context = gsap.context(() => {
      this.chapters.forEach((chapter, index) => {
        chapter.host.dataset.storyChapter = chapter.name;
        gsap.set(chapter.host, { position: 'relative', zIndex: index + 1 });
        if (chapter.name === 'about') gsap.set(chapter.host, { backgroundColor: '#FFFFFF' });
      });
      for (let index = 1; index < this.chapters.length; index++) {
        const outgoing = this.chapters[index - 1];
        const incoming = this.chapters[index];
        // These sections enter in natural document flow, without a chapter transition.
        if (incoming.name === 'projects') continue;
        // The viewport-sized reel must also leave in normal flow. Pinning its host
        // caches its former height on resize and lets Experience cover the canvas.
        if (outgoing.name === 'projects' && outgoing.surface.querySelector('app-project-reel')) continue;
        const surface = incoming.surface;
        surface.dataset.storyTransition = incoming.name === 'about' ? 'slide-over' : incoming.name === 'experience' ? 'cinematic' : 'editorial';
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            id: `chapter-${outgoing.name}-${incoming.name}`,
            trigger: incoming.host, start: 'clamp(top bottom)', end: 'top top',
            pin: outgoing.host, pinSpacing: false, scrub: true,
            invalidateOnRefresh: true, refreshPriority: this.chapters.length - index,
            onUpdate: self => {
              surface.dataset.storyProgress = self.progress.toFixed(4);
              this.updateFocusVisibility(incoming);
            },
            onRefresh: self => {
              surface.dataset.storyStart = String(self.start);
              surface.dataset.storyEnd = String(self.end);
            },
          },
        });
        if (incoming.name === 'experience') {
          timeline.fromTo(surface, { clipPath: 'inset(5% 0 0 0)', '--chapter-photo-opacity': 0.15 },
            { clipPath: 'inset(0% 0 0 0)', '--chapter-photo-opacity': 1, duration: 0.82 }, 0);
        }
        // Last portion is already fully readable, including when landing on anchors.
        timeline.to({}, { duration: 0.18 }, 0.82);
      }
    }, this.main);
    this.queueRefresh();
  }

  private readonly queueRefresh = (): void => {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      if (!this.destroyed && this.context) ScrollTrigger.refresh(true);
    }, 120);
  };
  private readonly onResize = (): void => {
    // Address-bar motion changes innerHeight but not the svh chapter surfaces.
    // Their ResizeObserver handles actual height changes; width/orientation must
    // still rebuild the relevant pin configuration.
    const widthChanged = this.viewportWidth !== innerWidth;
    this.viewportWidth = innerWidth;
    if (!widthChanged && matchMedia('(pointer: coarse)').matches) return;
    if ((innerHeight <= 500) !== this.short) this.setup();
    else this.queueRefresh();
  };
  private updateFocusVisibility(chapter: Chapter): void {
    const active = document.activeElement;
    if (active instanceof HTMLElement && chapter.surface.contains(active) && active.matches(':focus-visible') && Number(chapter.surface.dataset.storyProgress ?? 1) < 0.82) {
      chapter.surface.dataset.storyFocus = '';
    } else delete chapter.surface.dataset.storyFocus;
  }
  private readonly onFocus = (): void => { this.chapters.forEach(chapter => this.updateFocusVisibility(chapter)); };
  private readonly onFocusOut = (event: FocusEvent): void => {
    this.chapters.forEach(chapter => {
      if (!(event.relatedTarget instanceof Node) || !chapter.surface.contains(event.relatedTarget)) delete chapter.surface.dataset.storyFocus;
    });
  };
  private readonly rememberRefreshFocus = (): void => {
    const active = document.activeElement;
    this.refreshFocus = active instanceof HTMLElement && this.main.contains(active) ? active : undefined;
  };
  private readonly restoreRefreshFocus = (): void => {
    const target = this.refreshFocus;
    this.refreshFocus = undefined;
    // Refresh temporarily reparents pinned hosts; preserve keyboard focus through it.
    if (target?.isConnected && document.activeElement === document.body) target.focus({ preventScroll: true });
  };

  ngOnDestroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.frame);
    clearTimeout(this.refreshTimer);
    window.removeEventListener('resize', this.onResize);
    this.main.removeEventListener('focusin', this.onFocus);
    this.main.removeEventListener('focusout', this.onFocusOut);
    ScrollTrigger.removeEventListener('refreshInit', this.rememberRefreshFocus);
    ScrollTrigger.removeEventListener('refresh', this.restoreRefreshFocus);
    this.observer?.disconnect();
    this.stopPreference?.();
    this.context?.revert();
    this.main.style.scrollMarginTop = this.scrollMargin;
    this.chapters.forEach(chapter => {
      delete chapter.host.dataset.storyChapter;
      delete chapter.surface.dataset.storyTransition;
      delete chapter.surface.dataset.storyProgress;
      delete chapter.surface.dataset.storyStart;
      delete chapter.surface.dataset.storyEnd;
      delete chapter.surface.dataset.storyFocus;
    });
  }
}

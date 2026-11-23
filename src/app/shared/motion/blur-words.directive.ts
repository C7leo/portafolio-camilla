import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, inject, NgZone, OnDestroy, PLATFORM_ID } from '@angular/core';

/** Reveals the existing text nodes without changing their accessible names. */
@Directive({ selector: '[appBlurWords]', standalone: true })
export class BlurWordsDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private readonly seen = new WeakSet<Text>();
  private readonly pending = new Map<Element, Text[]>();
  private readonly cleanups = new Set<() => void>();
  private readonly sectionTiming = new WeakMap<Element, number>();
  private currentSection?: Element;
  private observer?: IntersectionObserver;
  private mutations?: MutationObserver;
  private motion?: MediaQueryList;
  private scheduled = 0;
  private visibilityFrame = 0;

  ngAfterViewInit(): void {
    if (!this.browser || typeof IntersectionObserver === 'undefined') return;
    this.zone.runOutsideAngular(() => {
      this.motion = matchMedia('(prefers-reduced-motion: reduce)');
      this.motion.addEventListener('change', this.onMotionChange);
      if (!this.motion.matches) this.start();
    });
  }

  private readonly onMotionChange = (): void => {
    if (this.motion?.matches) this.stop();
    else this.start();
  };

  private start(): void {
    if (this.observer) return;
    this.observer = new IntersectionObserver(this.queueVisibilityCheck, { threshold: 0.1 });
    window.addEventListener('scroll', this.queueVisibilityCheck, { passive: true });
    window.addEventListener('resize', this.queueVisibilityCheck, { passive: true });
    this.scan();
    this.mutations = new MutationObserver(() => {
      if (!this.scheduled) this.scheduled = requestAnimationFrame(() => { this.scheduled = 0; this.scan(); });
    });
    this.mutations.observe(this.host, { childList: true, subtree: true });
  }

  private readonly queueVisibilityCheck = (): void => {
    if (this.visibilityFrame) return;
    this.visibilityFrame = requestAnimationFrame(() => {
      this.visibilityFrame = 0;
      const ordered = [...this.pending.keys()].filter(target => this.isActuallyVisible(target)).sort((a, b) =>
        a === b ? 0 : a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
      for (const target of ordered) {
        this.observer?.unobserve(target);
        const nodes = this.pending.get(target) ?? [];
        this.pending.delete(target);
        const section = target.closest('section, footer, nav, header') ?? this.host;
        for (const node of nodes) {
          const now = performance.now();
          if (this.currentSection !== section) {
            [...this.cleanups].forEach(cleanup => cleanup());
            this.currentSection = section;
          }
          const sectionStart = this.sectionTiming.get(section) ?? now;
          const start = Math.max(now, sectionStart);
          const delay = Math.min(start - now, 350);
          const count = node.data.trim().split(/\s+/).length;
          this.reveal(node, delay);
          this.sectionTiming.set(section, now + Math.min(delay + count * 45, 400));
        }
      }
    });
  };

  private isActuallyVisible(target: Element): boolean {
    if (!target.isConnected) { this.pending.delete(target); return false; }
    const rect = target.getBoundingClientRect();
    const left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
    const top = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
    if (right <= left || bottom <= top || bottom - top < Math.min(rect.height * .1, 12)) return false;
    const section = target.closest('section, footer, nav, header') ?? this.host;
    const uppermost = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
    return !!uppermost && (section.contains(uppermost) || target.contains(uppermost));
  }

  private readonly scan = (): void => {
    const walker = document.createTreeWalker(this.host, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const parent = node.parentElement;
      if (!parent || this.seen.has(node) || !node.data.trim() || !/[\p{L}\p{N}]/u.test(node.data)) continue;
      if (parent.closest('script, style, svg, textarea, option, [aria-hidden="true"], .sr-only, .skip-link, [data-blur-words], [data-no-blur], app-particle-intro')) continue;
      // The intro controls the whole Hero and navbar reveal for this page load.
      if (document.documentElement.dataset.particlePhase && parent.closest('app-hero, app-navbar')) { this.seen.add(node); continue; }
      this.seen.add(node);
      // About's cards and text use the same viewport target as their visual reveal.
      const target = parent.closest('[data-about-reveal]') ?? parent;
      const group = this.pending.get(target) ?? [];
      group.push(node);
      this.pending.set(target, group);
      this.observer?.observe(target);
    }
  };

  private reveal(node: Text, startDelay: number): void {
    if (!node.isConnected || !node.parentNode || this.motion?.matches || typeof Element.prototype.animate !== 'function') return;
    const parts = node.data.split(/(\s+)/);
    if (!parts.some(part => part.trim())) return;
    const container = document.createElement('span');
    container.dataset.blurWords = '';
    const original = document.createElement('span');
    original.className = 'sr-only';
    node.parentNode.insertBefore(container, node);
    original.append(node);
    container.append(original);
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    container.append(visual);
    const animations: Animation[] = [];
    let rank = 0;
    for (const part of parts) {
      if (!part.trim()) { visual.append(document.createTextNode(part)); continue; }
      const word = document.createElement('span');
      word.textContent = part;
      word.style.display = 'inline-block';
      visual.append(word);
      animations.push(word.animate([
        { opacity: 0, transform: 'translateY(-12px)', filter: 'blur(10px)' },
        { opacity: .5, transform: 'translateY(5px)', filter: 'blur(5px)', offset: .5 },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
      ], { duration: 500, delay: startDelay + Math.min(rank++ * 45, 450), easing: 'ease-out', fill: 'both' }));
    }
    let cleaned = false;
    const cleanup = (): void => {
      if (cleaned) return;
      cleaned = true;
      animations.forEach(animation => animation.cancel());
      if (container.parentNode) container.replaceWith(node);
      this.cleanups.delete(cleanup);
    };
    this.cleanups.add(cleanup);
    void Promise.all(animations.map(animation => animation.finished)).then(cleanup, cleanup);
  }

  private stop(): void {
    this.observer?.disconnect(); this.observer = undefined;
    this.mutations?.disconnect(); this.mutations = undefined;
    window.removeEventListener('scroll', this.queueVisibilityCheck);
    window.removeEventListener('resize', this.queueVisibilityCheck);
    cancelAnimationFrame(this.visibilityFrame); this.visibilityFrame = 0;
    cancelAnimationFrame(this.scheduled); this.scheduled = 0;
    this.pending.clear();
    this.currentSection = undefined;
    [...this.cleanups].forEach(cleanup => cleanup());
  }

  ngOnDestroy(): void { this.stop(); this.motion?.removeEventListener('change', this.onMotionChange); }
}

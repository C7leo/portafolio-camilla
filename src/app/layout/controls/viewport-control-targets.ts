/** Caches contextual surfaces; never scans the document on scroll. */
export class ViewportControlTargets {
  private surfaces: HTMLElement[] = [];
  private obstacles: HTMLElement[] = [];
  private readonly clips = new Map<HTMLElement, { element: HTMLElement; x: boolean; y: boolean }[]>();
  private readonly collisions = new Map<string, IntersectionObserver>();
  private readonly watchedRegions = new Map<string, string>();
  private readonly mutations: MutationObserver;

  constructor(private readonly changed: () => void) {
    this.mutations = new MutationObserver(records => {
      if (records.some(record => !(record.target instanceof Element) || !record.target.closest('app-floating-controls'))) this.refresh();
    });
    this.mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'inert', 'open'] });
    this.refresh();
  }

  private refresh(): void {
    this.surfaces = Array.from(document.querySelectorAll<HTMLElement>('[data-control-surface]'));
    // Protect actual links/text, not a whole row's empty padding or flex gaps.
    // Decorative rules and surface boundaries never obstruct global controls.
    const interactive = 'a[href], button, input, select, textarea';
    this.obstacles = [...new Set(Array.from(document.querySelectorAll<HTMLElement>('[data-control-avoid]')).flatMap(element => {
      if (element.matches(interactive)) return [element];
      const controls = Array.from(element.querySelectorAll<HTMLElement>(interactive));
      return controls.length
        ? [...controls, ...element.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4')]
        : [element];
    }))];
    this.clips.clear();
    for (const element of this.obstacles) {
      const ancestors: { element: HTMLElement; x: boolean; y: boolean }[] = [];
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        const x = /^(hidden|clip|auto|scroll)$/.test(style.overflowX);
        const y = /^(hidden|clip|auto|scroll)$/.test(style.overflowY);
        if (x || y) ancestors.push({ element: parent, x, y });
      }
      this.clips.set(element, ancestors);
    }
    this.watchedRegions.clear();
    this.changed();
  }

  readSurfaces(): { box: DOMRect; tone: string; visible: boolean }[] {
    return this.surfaces.map(el => ({ box: el.getBoundingClientRect(), tone: el.dataset.controlSurface!, visible: getComputedStyle(el).visibility !== 'hidden' }));
  }

  /** Watch transformed cards too, without polling their animation on every frame. */
  watchControl(box: DOMRect, key = 'theme'): void {
    const width = document.documentElement.clientWidth, height = document.documentElement.clientHeight;
    const margin = `${-Math.max(0, box.top)}px ${-Math.max(0, width - box.right)}px ${-Math.max(0, height - box.bottom)}px ${-Math.max(0, box.left)}px`;
    if (margin === this.watchedRegions.get(key)) return;
    this.watchedRegions.set(key, margin);
    this.collisions.get(key)?.disconnect();
    const observer = new IntersectionObserver(this.changed, { rootMargin: margin });
    this.collisions.set(key, observer);
    this.obstacles.forEach(element => observer.observe(element));
  }

  isClear(box: DOMRect, gap = 0): boolean {
    const region = this.regionAt(box);
    return !this.obstacles.some(element => {
      if (region && this.regionOf(element) !== region) return false;
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return false;
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || Number(style.opacity) < .05) return false;
      let { left, right, top, bottom } = bounds;
      // A transformed card can extend beyond the gallery in layout coordinates;
      // its clipped, invisible area must not hide a control in the outer gutter.
      for (const clip of this.clips.get(element) ?? []) {
        const area = clip.element.getBoundingClientRect();
        if (clip.x) { left = Math.max(left, area.left); right = Math.min(right, area.right); }
        if (clip.y) { top = Math.max(top, area.top); bottom = Math.min(bottom, area.bottom); }
      }
      return right > left && bottom > top && box.left < right + gap && box.right > left - gap
        && box.top < bottom + gap && box.bottom > top - gap;
    });
  }

  private regionOf(element: Element): Element | null {
    return element.closest('[data-control-region]');
  }

  private regionAt(box: DOMRect): Element | null {
    for (const element of document.elementsFromPoint(box.x + box.width / 2, box.y + box.height / 2)) {
      const region = this.regionOf(element);
      if (region) return region;
    }
    return null;
  }

  dispose(): void {
    this.mutations.disconnect();
    this.collisions.forEach(observer => observer.disconnect());
    this.collisions.clear(); this.watchedRegions.clear();
    this.surfaces = [];
    this.obstacles = [];
    this.clips.clear();
  }
}

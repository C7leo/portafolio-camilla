/** Caches painted surfaces for global-control contrast, never for hiding them. */
export class ViewportControlTargets {
  private surfaces: HTMLElement[] = [];
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
    this.changed();
  }

  readSurfaces(): { box: DOMRect; tone: string; visible: boolean }[] {
    return this.surfaces.map(element => {
      const style = getComputedStyle(element);
      return { box: element.getBoundingClientRect(), tone: element.dataset.controlSurface!,
        visible: style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > .05 };
    });
  }

  dispose(): void {
    this.mutations.disconnect();
    this.surfaces = [];
  }
}

import { Injectable } from '@angular/core';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const SECTION_IDS = ['inicio', 'sobre-mi', 'proyectos', 'servicios', 'experiencia', 'contacto'] as const;

/** Geometry is measured on demand: never cache offsets across pin refreshes or layout changes. */
@Injectable({ providedIn: 'root' })
export class SectionPositionService {
  clearance(): number {
    return (document.querySelector('.floating-header')?.getBoundingClientRect().bottom ?? 80) + 16;
  }

  visualMarker(section: HTMLElement): HTMLElement | null {
    const selector: Record<string, string> = {
      proyectos: '.showcase-header, .detail-header',
      servicios: '.services-meta .editorial-section-label',
      contacto: '.editorial-section-label',
    };
    return selector[section.id] ? section.querySelector<HTMLElement>(selector[section.id]) : null;
  }

  /** Section viewport top that exposes its visual entry, rather than its outer padding. */
  viewportTop(section: HTMLElement): number {
    const marker = this.visualMarker(section);
    if (!marker) return 0; // Full-frame narrative entrances retain their original composition.
    const inset = marker.getBoundingClientRect().top - section.getBoundingClientRect().top;
    const padding = parseFloat(getComputedStyle(marker).paddingTop) || 0;
    return this.clearance() - inset - padding;
  }

  destination(id: string): number | null {
    if (id === 'inicio') return 0;
    const section = document.getElementById(id);
    if (!section) return null;
    // The pinned opening has a stable timeline coordinate even while its descendants move.
    const opening = id === 'experiencia' ? ScrollTrigger.getById('experience-image-zoom') : undefined;
    const top = opening ? opening.start : section.getBoundingClientRect().top + scrollY - this.viewportTop(section);
    return Math.max(0, Math.min(top, document.documentElement.scrollHeight - innerHeight));
  }

  update(settle = false): void {
    ScrollTrigger.update();
    if (settle) ScrollTrigger.getAll().forEach(trigger => {
      const scrub = trigger.getTween();
      if (scrub) scrub.progress(1);
    });
  }

  land(top: number): void {
    scrollTo({ top: Math.round(Math.max(0, top)), behavior: 'instant' });
    this.update(true);
  }
}

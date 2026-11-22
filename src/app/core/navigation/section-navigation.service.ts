import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SectionNavigationService {
  navigate(id: string, event?: MouseEvent): void {
    if (event && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    const target = document.getElementById(id);
    if (!target) return;
    event?.preventDefault();
    if (location.hash !== `#${id}`) {
      const oldURL = location.href;
      history.pushState(null, '', `#${id}`);
      window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: location.href }));
    }
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    if (id === 'inicio') window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior, block: 'start' });
  }
}

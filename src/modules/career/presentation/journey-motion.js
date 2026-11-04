import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Only the title is sticky. Each chapter enters separately on native page scroll.
export function initJourneyMotion() {
  const section = document.querySelector('#journey');
  const records = section.querySelector('.journey-records');
  const entries = [...records.querySelectorAll('.journey-entry')];
  const media = gsap.matchMedia();
  let current = -1;
  function update(self) {
    records.style.setProperty('--journey-progress', self.progress);
    const active = Math.max(0, entries.findLastIndex(entry => entry.getBoundingClientRect().top <= innerHeight * .55));
    if (active === current) return;
    current = active;
    records.dataset.chapter = String(active + 1);
    entries.forEach((entry, index) => {
      entry.classList.toggle('visited', index <= active);
      if (index === active) entry.setAttribute('aria-current', 'step');
      else entry.removeAttribute('aria-current');
    });
  }
  media.add('(prefers-reduced-motion: no-preference)', () => {
    current = -1;
    ScrollTrigger.create({ id: 'journey-chapters', trigger: records, start: 'top 55%', end: 'bottom 55%', onUpdate: update, onRefresh: update });
    gsap.from(section.querySelector('.journey-title'), {
      y: 18, opacity: .35, duration: .65, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 82%', once: true },
    });
    entries.forEach(entry => {
      for (const [selector, delay] of [['.journey-entry-copy', 0], ['.journey-media', .08]]) {
        gsap.from(entry.querySelector(selector), {
          y: 24, opacity: .25, duration: .65, delay, ease: 'power2.out',
          scrollTrigger: { trigger: entry, start: 'top 85%', once: true },
        });
      }
    });
  });
  media.add('(prefers-reduced-motion: reduce)', () => {
    records.style.setProperty('--journey-progress', 1);
    entries.forEach(entry => { entry.classList.add('visited'); entry.removeAttribute('aria-current'); });
    return () => { current = -1; };
  });
  return () => media.revert();
}

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Native scrolling drives the slides; long sections keep their full reading length.
// The data scene retains its own sticky geometry and never receives an extra pin.
export function initSectionTransitions() {
  const sections = [...document.querySelectorAll('#main > section')];
  const effects = ['cover', 'wipe-left', 'wipe-right', 'cover', 'cover', 'wipe-left', 'cover'];
  const media = gsap.matchMedia();
  sections.forEach((section, index) => {
    section.classList.add('editorial-slide');
    section.style.setProperty('--slide-order', index + 1);
  });

  media.add({ motion: '(prefers-reduced-motion: no-preference)', compact: '(max-width: 700px)', desktop: '(min-width: 701px)' }, context => {
    if (!context.conditions.motion) return;
    const compact = context.conditions.compact;
    sections.slice(1).forEach((incoming, index) => {
      const outgoing = sections[index];
      // These spreads need an uninterrupted reading flow, including their exit.
      // A short pinned exploration spread otherwise gets covered by Contact.
      if (incoming.matches('.work, .exploring, .journey, .data-scene') || outgoing.matches('.exploring, .journey, .data-scene')) {
        incoming.dataset.transition = 'flow';
        return;
      }
      const effect = compact ? 'cover' : effects[index];
      incoming.dataset.transition = effect;

      if (!outgoing.matches('.data-scene, .work, .ecosystem')) {
        ScrollTrigger.create({
          id: `slide-hold-${outgoing.id}`,
          trigger: outgoing,
          start: 'clamp(bottom bottom)',
          end: () => `+=${innerHeight}`,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          id: `slide-enter-${incoming.id}`,
          trigger: incoming,
          start: 'top bottom',
          end: 'top 20%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      // The incoming background covers the previous section like a presentation.
      // Directional masks vary the desktop transitions without translating the page sideways.
      if (effect !== 'cover') {
        const mask = effect === 'wipe-left' ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)';
        timeline.fromTo(incoming,
          { clipPath: mask },
          { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0);
      }
      timeline.fromTo(outgoing,
        { '--slide-shade': 0 },
        { '--slide-shade': compact ? .10 : .20, ease: 'none' }, 0);
      timeline.fromTo(incoming,
        { '--slide-edge': 1 },
        { '--slide-edge': 0, ease: 'none' }, 0);
    });

    const sectionTop = section => {
      const hold = ScrollTrigger.getById(`slide-hold-${section.id}`);
      return hold ? hold.start - Math.max(0, section.offsetHeight - innerHeight) : section.getBoundingClientRect().top + scrollY;
    };
    // Resolve anchors from their flow position even while the destination is pinned.
    const navigate = event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!sections.includes(target)) return;
      event.preventDefault();
      history.pushState(null, '', link.getAttribute('href'));
      const headerHeight = document.querySelector('.header').getBoundingClientRect().height;
      const destination = target === sections[0] ? 0 : Math.max(0, sectionTop(target) - headerHeight - 20);
      window.scrollTo({ top: destination, behavior: 'smooth' });
    };
    document.addEventListener('click', navigate);
    // Keyboard focus must never land behind an unfinished visual mask.
    const focus = event => {
      const section = event.target.closest('.editorial-slide');
      if (section && section !== sections[0] && section.getBoundingClientRect().top > innerHeight * .2) {
        const top = sectionTop(section);
        const headerHeight = document.querySelector('.header').getBoundingClientRect().height;
        window.scrollTo({ top: Math.max(0, top - headerHeight - 20), behavior: 'instant' });
      }
    };
    document.addEventListener('focusin', focus);
    return () => {
      document.removeEventListener('focusin', focus);
      document.removeEventListener('click', navigate);
      sections.forEach(section => { delete section.dataset.transition; });
    };
  });

  // Include viewport changes in matchMedia so switching devices refreshes the composition.
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });
  return () => {
    media.revert();
    window.removeEventListener('load', refresh);
    sections.forEach(section => {
      section.classList.remove('editorial-slide');
      section.style.removeProperty('--slide-order');
    });
  };
}

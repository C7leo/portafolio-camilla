import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import CircularCarousel from './CircularCarousel.jsx';

export function mountCircularCarousel(element, projects, onChange, onReady, labels) {
  const root = createRoot(element);
  const readyObserver = new MutationObserver(() => {
    if (!element.querySelector('.circular-carousel[data-ready]')) return;
    readyObserver.disconnect();
    onReady?.();
  });
  readyObserver.observe(element, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-ready'] });
  const items = projects.map(project => ({
    src: project.image, srcSet: project.imageSmall ? `${project.imageSmall} 640w, ${project.image} 1280w` : undefined, alt: project.imageAlt, title: project.name, subtitle: project.category,
  }));
  const gapForWidth = width => Math.round(Math.max(40, Math.min(250, 40 + (width - 342) * .34)));
  const props = {
    items, labels, preset: 'cylinder', intro: 'rise', cardWidth: 330, aspectRatio: 1.5,
    speed: 14, captions: false, gap: gapForWidth(element.clientWidth), tilt: -5, curve: 1, perspective: 2500,
    autoplay: 'drift', interval: 3, direction: 'left', momentum: 0.6, snap: true,
    pauseOnHover: true, focusOnClick: true, draggable: true, parallax: 0.3, stretch: 0.5,
    fadeColor: '#000000', depthFade: 0.55, innerShade: 0.6, cornerRadius: 12, onChange,
  };
  const render = () => root.render(createElement(CircularCarousel, props));
  render();
  const resize = new ResizeObserver(entries => {
    const gap = gapForWidth(entries[0].contentRect.width);
    if (gap !== props.gap) { props.gap = gap; render(); }
  });
  resize.observe(element);
  return {
    setLabels(labels) { props.labels = labels; render(); },
    setAutoplay(enabled) { props.autoplay = enabled ? 'drift' : 'off'; render(); },
    select(index) {
      const carousel = element.querySelector('.circular-carousel');
      if (!carousel) return;
      carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      for (let i = 0; i < index; i++) carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    },
    destroy() { readyObserver.disconnect(); resize.disconnect(); root.unmount(); },
  };
}

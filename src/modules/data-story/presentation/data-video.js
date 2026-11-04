import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { dataStages } from '../domain/stages.js';
import './data-visual.css';

// The clip's six holds are not evenly spaced. These normalized boundaries
// follow the actual database / cube / shield / bars / insight transitions.
export function initDataVideo() {
  const scene = document.querySelector('#data');
  const video = scene.querySelector('video');
  const steps = [...scene.querySelectorAll('.pipeline-step')];
  const description = scene.querySelector('#stage-description');
  const progressbar = scene.querySelector('.data-progress');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let trigger, observer, frame = 0, watchdog = 0, progress = 0;
  let loaded = false, failed = false, disposed = false, stage = -1, percent = -1;
  const finiteDuration = () => Number.isFinite(video.duration) && video.duration > 0;
  const headerHeight = () => document.querySelector('.header').getBoundingClientRect().height;

  function display(value) {
    const nextStage = dataStages.findLastIndex(item => value + .0001 >= item.start);
    const nextPercent = Math.round(value * 100);
    scene.style.setProperty('--sequence-progress', value);
    if (nextPercent !== percent) {
      percent = nextPercent;
      progressbar.setAttribute('aria-valuenow', String(percent));
    }
    if (nextStage === stage) return;
    stage = nextStage;
    scene.dataset.stage = String(stage);
    steps.forEach((step, i) => {
      step.classList.toggle('active', i <= stage);
      if (i === stage) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    description.textContent = dataStages[stage].description;
  }

  function stopWork() {
    cancelAnimationFrame(frame); frame = 0;
    clearTimeout(watchdog);
    observer?.disconnect();
    trigger?.kill(); trigger = null;
    video.pause();
  }

  function fallback() {
    if (disposed) return;
    failed = true;
    stopWork();
    scene.dataset.mode = 'static';
    scene.dataset.media = 'unavailable';
    video.removeAttribute('src'); video.load();
    ScrollTrigger.refresh();
  }

  // Coalesce scroll events into at most one seek per animation frame.
  // While a decode is in flight only retain the latest target; seeked flushes it.
  // No tween, ticker, play(), or continuously running requestAnimationFrame.
  function seek() {
    frame = 0;
    if (disposed || failed || reduced.matches || !finiteDuration() || video.seeking) return;
    const target = progress * video.duration;
    if (Math.abs(video.currentTime - target) < 1 / 240) {
      if (video.readyState >= 2) reveal();
      return;
    }
    video.currentTime = target;
    clearTimeout(watchdog);
    watchdog = setTimeout(fallback, 8000);
  }
  function schedule() {
    if (!frame && loaded && !failed && !reduced.matches) frame = requestAnimationFrame(seek);
  }
  function reveal() {
    if (failed || reduced.matches || video.readyState < 2 || !finiteDuration()) return;
    // Avoid flashing frame zero when entering midway through a delayed load.
    if (scene.dataset.media !== 'ready' && Math.abs(video.currentTime - progress * video.duration) >= 1 / 240) return;
    scene.dataset.media = 'ready';
    display(Math.min(1, video.currentTime / video.duration));
  }
  function settled() {
    clearTimeout(watchdog);
    if (failed || reduced.matches) return;
    reveal();
    // A new scroll target may have arrived during decoding.
    if (finiteDuration() && Math.abs(video.currentTime - progress * video.duration) >= 1 / 240) schedule();
  }
  function load() {
    if (loaded || failed || reduced.matches || disposed) return;
    loaded = true;
    scene.dataset.media = 'loading';
    video.preload = 'auto';
    video.src = video.dataset.src;
    video.load();
    watchdog = setTimeout(fallback, 12000);
  }
  function configure() {
    stopWork();
    loaded = false; failed = false;
    scene.dataset.media = 'idle';
    scene.dataset.mode = reduced.matches ? 'static' : 'scrub';
    if (reduced.matches) {
      video.removeAttribute('src'); video.preload = 'none'; video.load();
      display(0);
    } else {
      trigger = ScrollTrigger.create({
        id: 'data-video-scrub', trigger: scene,
        start: () => `top ${headerHeight()}px`, end: 'bottom bottom',
        onUpdate(self) { progress = self.progress; schedule(); },
        onRefresh(self) { progress = self.progress; schedule(); },
      });
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { load(); observer.disconnect(); }
      }, { rootMargin: '800px 0px' });
      observer.observe(scene);
    }
    ScrollTrigger.refresh();
  }
  const pause = () => video.pause();
  const metadata = () => { if (finiteDuration()) schedule(); else fallback(); };
  const ready = () => { clearTimeout(watchdog); settled(); schedule(); };
  video.addEventListener('play', pause);
  video.addEventListener('loadedmetadata', metadata);
  video.addEventListener('loadeddata', ready);
  video.addEventListener('seeked', settled);
  video.addEventListener('error', fallback);
  reduced.addEventListener('change', configure);
  display(0);
  configure();
  return () => {
    disposed = true; stopWork();
    reduced.removeEventListener('change', configure);
    video.removeEventListener('play', pause);
    video.removeEventListener('loadedmetadata', metadata);
    video.removeEventListener('loadeddata', ready);
    video.removeEventListener('seeked', settled);
    video.removeEventListener('error', fallback);
    video.removeAttribute('src'); video.load();
  };
}

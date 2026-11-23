/** Coordinates the initial HTML overlay with the resources actually used by the Hero. */
export function startCurtainIntro(bootstrap: Promise<unknown>): void {
  const root = document.documentElement;
  const curtain = document.getElementById('curtain-intro');
  if (!curtain || !root.classList.contains('curtain-active')) {
    curtain?.remove();
    return;
  }
  curtain.setAttribute('aria-label', root.lang === 'en' ? 'Loading portfolio' : 'Cargando portafolio');

  const progress = curtain.querySelector<HTMLElement>('.curtain-progress');
  const percent = curtain.querySelector<HTMLElement>('.curtain-percent');
  const heading = curtain.querySelector<HTMLElement>('.curtain-heading-text');
  const time = curtain.querySelector<HTMLElement>('.curtain-time');
  const steps = [...curtain.querySelectorAll<HTMLElement>('.curtain-step')];
  const english = root.lang === 'en';
  const labels = english
    ? ['Loading interface', 'Preparing visuals', 'Aligning sections', 'Opening portfolio']
    : ['Cargando la interfaz', 'Preparando las imágenes', 'Organizando las secciones', 'Abriendo el portafolio'];
  const headings = english
    ? ['Preparing experience...', 'Loading portfolio...', 'Bringing it together...', 'Opening portfolio...', 'Ready to explore.']
    : ['Preparando la experiencia...', 'Cargando el portafolio...', 'Dando forma a los detalles...', 'Abriendo el portafolio...', 'Todo listo.'];
  steps.forEach((step, index) => {
    const label = step.querySelector<HTMLElement>('.curtain-step-label');
    if (label) label.textContent = labels[index];
  });
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let finished = false;
  let revealing = false;
  let completed = 0;
  let pauseTimer = 0;
  let transitionTimer = 0;
  let frame = 0;
  let previousValue = -1;
  let previousStage = -1;
  let previousTenth = -1;
  const started = performance.now();
  const cleanup = () => {
    if (finished) return;
    finished = true;
    clearTimeout(deadline);
    clearTimeout(pauseTimer);
    clearTimeout(transitionTimer);
    cancelAnimationFrame(frame);
    motion.removeEventListener('change', onMotionChange);
    curtain.removeEventListener('transitionend', onTransitionEnd);
    root.classList.remove('curtain-active');
    curtain.remove();
    window.dispatchEvent(new Event('curtain-finished'));
  };
  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target === curtain && event.propertyName === 'transform') cleanup();
  };
  const onMotionChange = () => { if (motion.matches) cleanup(); };
  const reveal = () => {
    if (finished || revealing) return;
    revealing = true;
    cancelAnimationFrame(frame);
    curtain.addEventListener('transitionend', onTransitionEnd);
    curtain.classList.add('is-revealing');
    transitionTimer = window.setTimeout(cleanup, 1500);
  };
  const deadline = window.setTimeout(reveal, 6000);
  motion.addEventListener('change', onMotionChange);

  const markReady = () => {
    if (finished || revealing) return;
    completed += 1;
  };

  const updateProgress = (now: number) => {
    if (finished || revealing) return;
    const elapsed = now - started;
    const value = Math.min(Math.floor(elapsed / 5000 * 100), completed === 3 ? 100 : Math.floor(completed / 3 * 100), 100);
    const tenth = Math.floor(elapsed / 100);
    if (tenth !== previousTenth) {
      previousTenth = tenth;
      if (time) time.textContent = `${(tenth / 10).toFixed(1)}s`;
    }
    if (value !== previousValue) {
      previousValue = value;
      curtain.setAttribute('aria-valuenow', String(value));
      if (percent) percent.textContent = `${value}%`;
      if (progress) progress.style.transform = `scaleX(${value / 100})`;
      const stage = value === 100 ? steps.length : Math.floor(value / 25);
      if (stage !== previousStage) {
        previousStage = stage;
        if (heading) heading.textContent = headings[stage];
        steps.forEach((step, index) => { step.dataset.state = index < stage ? 'done' : index === stage ? 'active' : 'pending'; });
      }
    }
    if (value === 100) {
      clearTimeout(deadline);
      pauseTimer = window.setTimeout(reveal, 200);
    } else frame = requestAnimationFrame(updateProgress);
  };
  frame = requestAnimationFrame(updateProgress);

  const loadHeroImage = async () => {
    const hero = document.querySelector<HTMLElement>('app-hero .hero');
    if (!hero) throw new Error('Hero unavailable');
    const imageUrl = getComputedStyle(hero).backgroundImage.match(/url\(["']?(.+?)["']?\)/)?.[1];
    if (!imageUrl) throw new Error('Hero image unavailable');
    const image = new Image();
    image.src = imageUrl;
    if (image.decode) await image.decode();
    else await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Hero image failed to load'));
    });
  };

  void bootstrap.then(async () => {
    markReady();
    await Promise.all([
      loadHeroImage().then(markReady),
      document.fonts.load('500 16px Urbanist').then(fonts => {
        if (!fonts.length) throw new Error('Hero font unavailable');
        markReady();
      }),
    ]);
  }).catch(reveal);
}

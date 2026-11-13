/** CSS perspective gallery. Animation stays outside Angular's change detection. */
export class ProjectRing {
  private readonly cards: HTMLElement[];
  private readonly motion = matchMedia('(prefers-reduced-motion: reduce)');
  private readonly events = new AbortController();
  private readonly observer: IntersectionObserver;
  private frame = 0;
  private visible = false;
  private paused = false;
  private hovered = false;
  private target = 0;
  private rotation = 0;
  private previous = 0;
  private entered = 0;
  private elapsed = 0;
  private pointer: { id: number; x: number; y: number; rotation: number; moved: boolean } | null = null;
  private suppressClick = false;

  constructor(private readonly wall: HTMLElement) {
    this.cards = Array.from(wall.querySelectorAll<HTMLElement>('.ring-card'));
    const signal = this.events.signal;
    wall.addEventListener('pointerdown', this.down, { signal });
    wall.addEventListener('pointermove', this.move, { signal });
    wall.addEventListener('pointerup', this.up, { signal });
    wall.addEventListener('pointercancel', this.cancel, { signal });
    wall.addEventListener('lostpointercapture', this.cancel, { signal });
    wall.addEventListener('click', event => {
      if (this.suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); this.suppressClick = false; }
    }, { capture: true, signal });
    wall.addEventListener('pointerenter', () => { this.hovered = true; }, { signal });
    wall.addEventListener('pointerleave', () => { this.hovered = false; this.wake(); }, { signal });
    // Only horizontal gestures belong to the gallery; vertical scroll always leaves it.
    wall.addEventListener('wheel', event => {
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      this.target += Math.max(-240, Math.min(240, event.deltaX * (event.deltaMode === 1 ? 16 : 1))) * .15;
      this.wake();
    }, { passive: false, signal });
    this.motion.addEventListener('change', this.sync, { signal });
    document.addEventListener('visibilitychange', this.sync, { signal });
    this.observer = new IntersectionObserver(entries => {
      this.visible = entries[0].isIntersecting;
      this.sync();
    }, { threshold: .05 });
    this.observer.observe(wall);
    this.render(1);
  }

  step(direction: number): void { this.target += direction * 360 / this.cards.length; this.wake(); }

  setPaused(value: boolean): void { this.paused = value; this.sync(); }

  private wake(): void {
    if (!this.frame && this.visible && !document.hidden && !this.motion.matches) {
      this.previous = 0;
      this.frame = requestAnimationFrame(this.tick);
    }
  }

  private sync = (): void => {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    const running = this.visible && !document.hidden && !this.motion.matches;
    if (running) { this.previous = 0; this.frame = requestAnimationFrame(this.tick); }
    else if (this.motion.matches) this.render(1);
  };

  private tick = (time: number): void => {
    this.frame = 0;
    const dt = this.previous ? Math.min((time - this.previous) / 1000, .05) : 0;
    this.previous = time;
    this.elapsed += dt;
    this.entered = Math.min(1, this.elapsed / 1.8);
    if (!this.paused && !this.hovered && !this.pointer) this.target += dt * 5;
    this.rotation += (this.target - this.rotation) * (1 - Math.exp(-dt * 9));
    this.render(1 - Math.pow(1 - this.entered, 3));
    if (this.entered < 1 || Math.abs(this.target - this.rotation) > .001 || (!this.paused && !this.hovered)) {
      this.frame = requestAnimationFrame(this.tick);
    }
  };

  private render(expansion: number): void {
    const radius = 460 + 1340 * expansion;
    const cardScale = .52 + 1.78 * expansion * expansion;
    for (const [index, card] of this.cards.entries()) {
      const angle = ((index * 360 / this.cards.length + this.rotation + 180) % 360 + 360) % 360 - 180;
      const radians = angle * Math.PI / 180;
      const z = -Math.cos(radians) * radius;
      card.style.visibility = Math.abs(angle) > 96 || z >= 690 ? 'hidden' : 'visible';
      card.style.transform = `translate3d(${-Math.sin(radians) * radius}px,0,${z}px) rotateY(${angle}deg) scale(${cardScale})`;
    }
    this.wall.style.setProperty('--ring-tilt', `${-22 * (1 - expansion)}deg`);
    this.wall.style.setProperty('--ring-roll', `${-20 * (1 - expansion)}deg`);
  }

  private down = (event: PointerEvent): void => {
    if (event.button !== 0 || this.motion.matches || event.isPrimary === false) return;
    this.suppressClick = false;
    this.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, rotation: this.target, moved: false };
  };

  private move = (event: PointerEvent): void => {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!pointer.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      pointer.moved = true;
      this.wall.setPointerCapture(event.pointerId);
      this.wall.classList.add('is-dragging');
    }
    if (pointer.moved) { this.target = pointer.rotation + dx * .16; this.wake(); }
  };

  private up = (): void => {
    this.suppressClick = this.pointer?.moved ?? false;
    this.cancel();
  };

  private cancel = (): void => {
    this.pointer = null;
    this.wall.classList.remove('is-dragging');
  };

  destroy(): void {
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.events.abort();
  }
}

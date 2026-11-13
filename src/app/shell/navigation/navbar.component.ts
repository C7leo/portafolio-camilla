import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, NgZone, OnDestroy, signal, ViewChild } from '@angular/core';
import { LanguageService } from '../../shared/i18n/language.service';
import { CinematicIntroState } from '../../shared/motion/cinematic-intro-state.service';
import template from './navbar.component.html?raw';
import styles from './navbar.component.css?inline';

@Component({
  selector: 'app-navbar', standalone: true,
  imports: [TranslatePipe],
  template, styles,
  host: { '(document:keydown.escape)': 'closeMenu(true)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  readonly logoSrc = new URL('../../shared/assets/logo.png', import.meta.url).href;
  readonly language = inject(LanguageService);
  get cvFilename(): string { return this.language.language() === 'en' ? 'CV_Camilla_Espinoza_EN.pdf' : 'CV_Camilla_Espinoza.pdf'; }
  get cvUrl(): string { return `${import.meta.env.BASE_URL}cv/${this.cvFilename}`; }
  readonly menuOpen = signal(false);
  readonly activeSection = signal('inicio');
  private readonly intro = inject(CinematicIntroState);
  readonly visible = computed(() => !this.intro.visible());
  readonly sections = [
    { id: 'inicio', label: 'Inicio' }, { id: 'sobre-mi', label: 'Sobre mí' },
    { id: 'proyectos', label: 'Proyectos' }, { id: 'servicios', label: 'Servicios' }, { id: 'experiencia', label: 'Experiencia' },
  ];
  private readonly zone = inject(NgZone);
  private frame = 0;
  @ViewChild('menuToggle') toggle?: ElementRef<HTMLButtonElement>;
  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.queueActiveSection, { passive: true });
      window.addEventListener('resize', this.queueActiveSection, { passive: true });
      this.queueActiveSection();
    });
  }
  private readonly queueActiveSection = (): void => {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const threshold = Math.min(180, innerHeight * 0.25);
      let active = 'inicio';
      for (const id of ['sobre-mi', 'proyectos', 'servicios', 'experiencia', 'contacto']) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= threshold) active = id;
      }
      if (active !== this.activeSection()) this.zone.run(() => {
        this.activeSection.set(active);
        if (active === 'inicio') this.closeMenu();
      });
    });
  };
  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
    window.removeEventListener('scroll', this.queueActiveSection);
    window.removeEventListener('resize', this.queueActiveSection);
  }
  closeMenu(restoreFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (restoreFocus) this.toggle?.nativeElement.focus();
  }
}

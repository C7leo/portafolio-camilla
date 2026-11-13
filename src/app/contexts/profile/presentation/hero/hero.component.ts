import { EditorialGridComponent } from '../../../../shared/ui/editorial-grid/editorial-grid.component';
import { isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, NgZone, OnDestroy, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollEffectDirective } from '../../../../shared/motion/scroll-effect.directive';
import { CinematicIntroState, IntroResult } from '../../../../shared/motion/cinematic-intro-state.service';
import { ProfileCatalogService } from '../../application/profile-catalog.service';
import { freelanceWhatsappUrl } from '../../application/freelance-contact';
import template from './hero.component.html?raw';
import styles from './hero.component.css?inline';

@Component({
  selector: 'app-hero', standalone: true,
  imports: [EditorialGridComponent, TranslatePipe, ScrollEffectDirective], template, styles,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  readonly profile = inject(ProfileCatalogService).profile;
  readonly whatsappUrl = freelanceWhatsappUrl;
  readonly marqueeItems = ['DESARROLLO WEB', 'APLICACIONES A MEDIDA', 'DATOS Y AUTOMATIZACIÓN', 'SOLUCIONES DIGITALES'] as const;
  @ViewChild('heroScene') heroScene!: ElementRef<HTMLElement>;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly intro = inject(CinematicIntroState);
  readonly introRequired = this.intro.required;
  readonly building = signal(this.introRequired);
  private context?: gsap.Context;
  private preference?: MediaQueryList;
  private destroyed = false;
  private stopIntro?: () => void;

  ngAfterViewInit(): void {
    if (!this.browser || !this.introRequired) return;
    this.preference = matchMedia('(prefers-reduced-motion: reduce)');
    this.preference.addEventListener('change', this.onPreference);
    this.stopIntro = this.intro.listen(reason => this.buildHero(reason));
  }

  buildHero(reason: IntroResult): void {
    if (this.destroyed) return;
    if (reason === 'unavailable' || reason === 'reduced' || this.preference?.matches) { this.finishBuild(); return; }
    this.zone.runOutsideAngular(() => {
      const scene = this.heroScene.nativeElement;
      this.context = gsap.context(() => {
        const title = scene.querySelector<HTMLElement>('.name-letters')!;
        const surname = scene.querySelector<HTMLElement>('.surname-letters')!;
        const cursor = scene.querySelector<HTMLElement>('.surname')!;
        const metadata = scene.querySelector<HTMLElement>('.hero-meta')!;
        const details = scene.querySelectorAll<HTMLElement>('.hero-micro-cta, .hero-details > *');
        const timeline = gsap.timeline({ onComplete: () => this.finishBuild() });
        timeline.to(scene, { '--name-panel-scale': 1, duration: .55, ease: 'power2.out' }, 0)
          .to(title, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)', duration: .9, ease: 'steps(7)' }, .38)
          .to(surname, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)', duration: .58, ease: 'steps(8)' }, 1.05)
          .fromTo(cursor, { '--surname-cursor': 0 }, { '--surname-cursor': 1, duration: .14, repeat: 5, yoyo: true, ease: 'none' }, 1.05)
          .set(cursor, { '--surname-cursor': 0 }, 1.94)
          .to(metadata, { opacity: 1, y: 0, duration: .4, ease: 'power2.out' }, 1.65)
          .to(details, { opacity: 1, y: 0, duration: .42, stagger: .06, ease: 'power2.out' }, 2);
      }, scene);
    });
  }

  private finishBuild(): void {
    if (this.destroyed) return;
    this.zone.run(() => {
      this.building.set(false);
      // Remove the pending CSS before GSAP restores the inline styles; otherwise
      // the finished content becomes hidden again until Angular's next render.
      this.changeDetector.detectChanges();
      this.context?.revert(); this.context = undefined;
    });
  }
  private readonly onPreference = (): void => { if (this.preference?.matches) this.finishBuild(); };
  ngOnDestroy(): void {
    this.destroyed = true;
    this.context?.revert();
    this.stopIntro?.();
    this.preference?.removeEventListener('change', this.onPreference);
  }
}

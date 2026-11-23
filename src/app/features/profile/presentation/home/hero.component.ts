import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';
import { SectionNavigationService } from '../../../../core/navigation/section-navigation.service';



@Component({ selector: 'app-hero', standalone: true, imports: [TranslatePipe], templateUrl: './hero.component.html', styleUrl: './hero.component.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class HeroComponent implements AfterViewInit, OnDestroy {
  private readonly sectionNavigation = inject(SectionNavigationService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private disposeRipple?: () => void;
  private destroyed = false;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const hero = this.element.nativeElement.querySelector<HTMLElement>('.hero');
      const mount = hero?.querySelector<HTMLElement>('.hero-ripple');
      if (!hero || !mount || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let loading = false;
      const start = async (event: PointerEvent) => {
        if (loading || event.pointerType !== 'mouse') return;
        loading = true;
        hero.removeEventListener('pointermove', start);
        try {
          const { mountHeroRipple } = await import('./ripple/hero-ripple.js');
          if (this.destroyed || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          this.disposeRipple = mountHeroRipple(hero, mount);
        } catch { /* Keep the existing background when WebGL is unavailable. */ }
      };
      hero.addEventListener('pointermove', start, { passive: true });
      this.disposeRipple = () => hero.removeEventListener('pointermove', start);
    });
  }

  ngOnDestroy(): void { this.destroyed = true; this.disposeRipple?.(); }
  goToContact(event: MouseEvent): void {
    this.sectionNavigation.navigate('contacto', event);
  }
}

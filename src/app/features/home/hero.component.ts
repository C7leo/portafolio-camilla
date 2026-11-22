import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { SectionNavigationService } from '../../core/navigation/section-navigation.service';
import { ParticleIntroComponent } from './particle-intro/particle-intro.component';



@Component({ selector: 'app-hero', standalone: true, imports: [TranslatePipe, ParticleIntroComponent], templateUrl: './hero.component.html', styleUrl: './hero.component.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class HeroComponent {
  private readonly sectionNavigation = inject(SectionNavigationService);
  goToContact(event: MouseEvent): void {
    this.sectionNavigation.navigate('contacto', event);
  }
}

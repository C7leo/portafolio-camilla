import { FloatingControlsComponent } from './layout/controls/floating-controls.component';
import { ThemeService } from './core/theme/theme.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EditorialGridComponent } from './shared/ui/editorial-grid/editorial-grid.component';
import { CinematicIntroState } from './shared/motion/cinematic-intro-state.service';
import { NavbarComponent } from './layout/navigation/navbar.component';
import { HeroComponent } from './features/profile/presentation/home/hero.component';
import { AboutComponent } from './features/profile/presentation/about/about.component';
import { ProjectsComponent } from './features/projects/presentation/projects.component';
import { ExperienceComponent } from './features/experience/presentation/experience.component';
import { FooterComponent } from './layout/footer/footer.component';
import { StoryChaptersDirective } from './shared/motion/story-chapters.directive';
import { ServicesComponent } from './features/profile/presentation/services/services.component';
import { BlurWordsDirective } from './shared/motion/blur-words.directive';
import { BehindCodeComponent } from './features/profile/presentation/behind-code/behind-code.component';

@Component({
  selector: 'app-root', standalone: true,
  hostDirectives: [BlurWordsDirective],
  imports: [FloatingControlsComponent, EditorialGridComponent, NavbarComponent, HeroComponent, AboutComponent, ProjectsComponent, ServicesComponent, ExperienceComponent, FooterComponent, StoryChaptersDirective, BehindCodeComponent],
  template: '<app-editorial-grid [viewport]="true" [railExclusions]="localRailExclusions" /><app-navbar /><main id="inicio" tabindex="-1" appStoryChapters><app-hero data-control-region /><app-about data-control-region /><app-services data-control-region /><app-behind-code data-control-region /><app-projects data-control-region /><app-experience data-control-region /></main><app-footer data-control-region /><app-floating-controls />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent { readonly theme = inject(ThemeService); readonly intro = inject(CinematicIntroState); readonly localRailExclusions = ['app-hero', '.project-showcase', '.services']; constructor() { if (this.intro.visible()) this.intro.complete('unavailable'); } }

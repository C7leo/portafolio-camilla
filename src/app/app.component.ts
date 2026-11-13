import { FloatingControlsComponent } from './shell/controls/floating-controls.component';
import { ThemeService } from './shared/theme/theme.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EditorialGridComponent } from './shared/ui/editorial-grid/editorial-grid.component';
import { CinematicIntroComponent } from './shell/intro/cinematic-intro.component';
import { CinematicIntroState } from './shared/motion/cinematic-intro-state.service';
import { NavbarComponent } from './shell/navigation/navbar.component';
import { HeroComponent } from './contexts/profile/presentation/hero/hero.component';
import { AboutComponent } from './contexts/profile/presentation/about/about.component';
import { ProjectsComponent } from './contexts/projects/presentation/projects.component';
import { ExperienceComponent } from './contexts/experience/presentation/experience.component';
import { FooterComponent } from './shell/footer/footer.component';
import { StoryChaptersDirective } from './shared/motion/story-chapters.directive';
import { ServicesComponent } from './contexts/profile/presentation/services/services.component';

@Component({
  selector: 'app-root', standalone: true,
  imports: [FloatingControlsComponent, EditorialGridComponent, CinematicIntroComponent, NavbarComponent, HeroComponent, AboutComponent, ProjectsComponent, ServicesComponent, ExperienceComponent, FooterComponent, StoryChaptersDirective],
  template: '@if (intro.visible()) { <app-cinematic-intro (finished)="intro.complete($event)" /> }<app-editorial-grid [viewport]="true" [railExclusions]="localRailExclusions" /><app-navbar /><main id="inicio" tabindex="-1" appStoryChapters><app-hero data-control-region /><app-about data-control-region /><app-projects data-control-region /><app-services data-control-region /><app-experience data-control-region /></main><app-footer data-control-region /><app-floating-controls />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent { readonly theme = inject(ThemeService); readonly intro = inject(CinematicIntroState); readonly localRailExclusions = ['.project-showcase', '.services']; }

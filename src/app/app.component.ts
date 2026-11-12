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

@Component({
  selector: 'app-root', standalone: true,
  imports: [EditorialGridComponent, CinematicIntroComponent, NavbarComponent, HeroComponent, AboutComponent, ProjectsComponent, ExperienceComponent, FooterComponent, StoryChaptersDirective],
  template: '@if (intro.visible()) { <app-cinematic-intro (finished)="intro.complete($event)" /> }<app-editorial-grid [viewport]="true" /><app-navbar /><main id="inicio" tabindex="-1" appStoryChapters><app-hero /><app-about /><app-projects /><app-experience /></main><app-footer />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent { readonly intro = inject(CinematicIntroState); }

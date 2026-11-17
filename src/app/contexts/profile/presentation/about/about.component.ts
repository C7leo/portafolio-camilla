import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { ProfileCatalogService } from '../../application/profile-catalog.service';
import { AboutStoryComponent } from './about-story.component';
import { CinematicIntroState } from '../../../../shared/motion/cinematic-intro-state.service';
import template from './about.component.html?raw';
import styles from './about.component.css?inline';

@Component({
  selector: 'app-about', standalone: true, imports: [TranslatePipe, AboutStoryComponent],
  template, styles, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  readonly intro = inject(CinematicIntroState);
  readonly profile = inject(ProfileCatalogService).profile;
  readonly photoFailed = signal(false);
  readonly workFailed = signal(false);
  private portraitUrl: string | null = new URL('./assets/retrato.webp', import.meta.url).href;
  private workUrl: string | null = new URL('./assets/proceso.webp', import.meta.url).href;
  portraitSrcset: string | null = new URL('./assets/retrato-480.webp', import.meta.url).href + ' 480w, ' + new URL('./assets/retrato-960.webp', import.meta.url).href + ' 960w';
  processSrcset: string | null = new URL('./assets/proceso-480.webp', import.meta.url).href + ' 480w, ' + new URL('./assets/proceso-960.webp', import.meta.url).href + ' 960w, ' + new URL('./assets/proceso.webp', import.meta.url).href + ' 1536w';
  @Input() set photoSrc(value: string | null) { this.portraitUrl = value; this.portraitSrcset = null; this.photoFailed.set(false); }
  get photoSrc(): string | null { return this.portraitUrl; }
  @Input() set workSrc(value: string | null) { this.workUrl = value; this.processSrcset = null; this.workFailed.set(false); }
  get workSrc(): string | null { return this.workUrl; }
  @Input() workAlt = 'Captura real de un proyecto o del proceso de trabajo';

}

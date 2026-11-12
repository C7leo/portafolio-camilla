import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { ProfileCatalogService } from '../../application/profile-catalog.service';
import { AboutStoryComponent } from './about-story.component';
import template from './about.component.html?raw';
import styles from './about.component.css?inline';

@Component({
  selector: 'app-about', standalone: true, imports: [TranslatePipe, AboutStoryComponent],
  template, styles, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  readonly profile = inject(ProfileCatalogService).profile;
  readonly photoFailed = signal(false);
  readonly workFailed = signal(false);
  private portraitUrl: string | null = new URL('./assets/retrato.png', import.meta.url).href;
  private workUrl: string | null = new URL('./assets/proceso.png', import.meta.url).href;
  @Input() set photoSrc(value: string | null) { this.portraitUrl = value; this.photoFailed.set(false); }
  get photoSrc(): string | null { return this.portraitUrl; }
  @Input() set workSrc(value: string | null) { this.workUrl = value; this.workFailed.set(false); }
  get workSrc(): string | null { return this.workUrl; }
  @Input() workAlt = 'Captura real de un proyecto o del proceso de trabajo';

}

import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import type { Project } from '../domain/project.model';

@Component({
  selector: 'app-project-art', standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (project.image && !imageFailed()) {
      <img [src]="project.image" [alt]="project.imageAlt | t" [style.object-fit]="fit" width="1200" height="750"
        loading="lazy" decoding="async" (error)="imageFailed.set(true)" />
    } @else {
      <div class="editorial-placeholder" role="img" [attr.aria-label]="('Placeholder editorial de ' + project.name + ', sin captura real') | t">
        <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <defs>
            <pattern [attr.id]="patternId" width="48" height="48" patternUnits="userSpaceOnUse">
              @switch (project.id) {
                @case ('harmonix') {
                  <path d="M-24 48 48-24M0 72 72 0M24 72 72 24" fill="none" stroke="#212121" stroke-width="1.2" />
                }
                @case ('spotfinder') {
                  <path d="M0 0h48v48H0ZM12 12h24v24H12Z" fill="none" stroke="#212121" stroke-width="1" />
                }
                @case ('nutrisend') {
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#212121" stroke-width="1.1" />
                  <circle cx="24" cy="24" r="11" fill="none" stroke="#212121" stroke-width="0.8" />
                }
                @default {
                  <path d="M4 0v48M12 0v48M20 0v48M28 0v48M36 0v48M44 0v48" stroke="#212121" stroke-width="0.8" />
                  <path d="M0 24h48" stroke="#212121" stroke-width="5" />
                }
              }
            </pattern>
          </defs>
          <rect width="400" height="400" [attr.fill]="'url(#' + patternId + ')'" />
        </svg>
        <span class="placeholder-status">{{ 'Placeholder editorial' | t }}<br />{{ 'Sin captura real' | t }}</span>
        <span class="placeholder-name">{{ project.name }}</span>
      </div>
    }
  `,
  styles: `
    :host { display: block; width: 100%; height: 100%; }
    img { display: block; width: 100%; height: 100%; object-fit: contain; }
    .editorial-placeholder { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--surface); color: var(--text-primary); }
    .editorial-placeholder svg { display: block; width: 100%; height: 100%; opacity: 0.32; }
    .editorial-placeholder svg [stroke] { stroke: currentColor; }
    .placeholder-status, .placeholder-name { position: absolute; left: 14px; max-width: calc(100% - 28px); padding: 6px 8px; background: var(--glass-solid); }
    .placeholder-status { top: 14px; font-size: 10px; font-weight: 400; line-height: 1.4; }
    .placeholder-name { bottom: 14px; font-size: clamp(12px, 1.5vw, 18px); font-weight: 500; line-height: 1.2; }
    @media (max-width:640px) { .placeholder-status { font-size: 9px; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectArtComponent {
  @Input() fit: 'cover' | 'contain' = 'contain';
  readonly imageFailed = signal(false);
  private currentProject!: Project;
  @Input({ required: true }) set project(value: Project) {
    this.currentProject = value;
    this.imageFailed.set(false);
  }
  get project(): Project { return this.currentProject; }
  get patternId(): string { return 'project-study-' + this.project.id; }
}

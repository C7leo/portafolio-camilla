import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { Project } from '../domain/project.model';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

/** One case-study summary shared by the gallery dialog and the direct detail route. */
@Component({
  selector: 'app-project-summary', standalone: true, imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="project-facts">
      <div><dt>{{ 'Problema' | t }}</dt><dd>{{ project.problem | t }}</dd></div>
      <div><dt>{{ 'Solución' | t }}</dt><dd>{{ project.solution | t }}</dd></div>
      <div><dt>{{ 'Tecnologías' | t }}</dt><dd>{{ project.technologies.join(' / ') }}</dd></div>
    </dl>
  `,
  styles: `
    :host { display: block; margin-top: 24px; }
    .project-facts { display: grid; gap: 20px; margin: 0; }
    dt { font-size: 12px; font-weight: 600; line-height: 1.5; opacity: .7; }
    dd { margin: 6px 0 0; font-size: 15px; line-height: 1.6; overflow-wrap: anywhere; }
  `,
})
export class ProjectSummaryComponent {
  @Input({ required: true }) project!: Project;
}

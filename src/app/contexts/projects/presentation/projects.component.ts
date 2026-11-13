import { EditorialGridComponent } from '../../../shared/ui/editorial-grid/editorial-grid.component';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import type { Project } from '../domain/project.model';
import { ProjectCatalogService } from '../application/project-catalog.service';
import { ProjectShowcaseComponent } from './project-showcase.component';
import { ProjectArtComponent } from './project-art.component';
import { ProjectSummaryComponent } from './project-summary.component';
import template from './projects.component.html?raw';
import styles from './projects.component.css?inline';

@Component({
  selector: 'app-projects', standalone: true, imports: [EditorialGridComponent, TranslatePipe, ProjectShowcaseComponent, ProjectArtComponent, ProjectSummaryComponent],
  template, styles, host: { '(window:hashchange)': 'syncRoute()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private readonly catalog = inject(ProjectCatalogService);
  readonly projects = this.catalog.projects;
  readonly detailProject = signal<Project | null>(null);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private routeFrame = 0;

  ngOnInit(): void { this.syncRoute(); }

  syncRoute(): void {
    const project = this.catalog.findByRoute(location.hash);
    const previous = this.detailProject();
    this.detailProject.set(project);
    const returning = !project && previous && (location.hash === '#proyectos' || location.hash === '');
    cancelAnimationFrame(this.routeFrame);
    if (!project && !returning) return;
    this.routeFrame = requestAnimationFrame(() => {
      const section = this.element.nativeElement.querySelector<HTMLElement>('#proyectos');
      section?.scrollIntoView({ block: 'start', behavior: 'instant' });
      if (project) this.element.nativeElement.querySelector<HTMLElement>('#project-detail-title')?.focus({ preventScroll: true });
    });
  }

  ngOnDestroy(): void { cancelAnimationFrame(this.routeFrame); }
}

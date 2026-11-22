import { inject, Injectable, InjectionToken } from '@angular/core';
import type { ProjectRepository } from '../domain/project.repository';
import type { Project } from '../domain/project.model';

export const PROJECT_REPOSITORY = new InjectionToken<ProjectRepository>('ProjectRepository');

@Injectable({ providedIn: 'root' })
export class ProjectCatalogService {
  readonly projects = inject(PROJECT_REPOSITORY).getAll();

  findByRoute(route: string): Project | null {
    return this.projects.find(project => project.detailRoute === route) ?? null;
  }
}

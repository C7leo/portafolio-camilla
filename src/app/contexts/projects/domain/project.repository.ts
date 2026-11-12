import type { Project } from './project.model';

export interface ProjectRepository {
  getAll(): readonly Project[];
}

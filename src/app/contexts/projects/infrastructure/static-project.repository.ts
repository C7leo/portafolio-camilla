import type { ProjectRepository } from '../domain/project.repository';
import { PROJECTS } from './project.catalog';

export class StaticProjectRepository implements ProjectRepository {
  getAll() { return PROJECTS; }
}

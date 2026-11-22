import type { Experience } from './experience.model';

export interface ExperienceRepository {
  getAll(): readonly Experience[];
}

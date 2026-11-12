import type { ExperienceRepository } from '../domain/experience.repository';
import { EXPERIENCES } from './experience.catalog';

export class StaticExperienceRepository implements ExperienceRepository {
  getAll() { return EXPERIENCES; }
}

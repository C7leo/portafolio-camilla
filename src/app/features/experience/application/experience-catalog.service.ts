import { inject, Injectable, InjectionToken } from '@angular/core';
import type { ExperienceRepository } from '../domain/experience.repository';

export const EXPERIENCE_REPOSITORY = new InjectionToken<ExperienceRepository>('ExperienceRepository');

@Injectable({ providedIn: 'root' })
export class ExperienceCatalogService {
  readonly entries = inject(EXPERIENCE_REPOSITORY).getAll();
}

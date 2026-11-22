import type { ApplicationConfig } from '@angular/core';
import { PROFILE_REPOSITORY } from './features/profile/application/profile-catalog.service';
import { StaticProfileRepository } from './features/profile/infrastructure/static-profile.repository';
import { PROJECT_REPOSITORY } from './features/projects/application/project-catalog.service';
import { StaticProjectRepository } from './features/projects/infrastructure/static-project.repository';
import { EXPERIENCE_REPOSITORY } from './features/experience/application/experience-catalog.service';
import { StaticExperienceRepository } from './features/experience/infrastructure/static-experience.repository';

/** The composition root is the only layer that selects repository implementations. */
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: PROFILE_REPOSITORY, useClass: StaticProfileRepository },
    { provide: PROJECT_REPOSITORY, useClass: StaticProjectRepository },
    { provide: EXPERIENCE_REPOSITORY, useClass: StaticExperienceRepository },
  ],
};

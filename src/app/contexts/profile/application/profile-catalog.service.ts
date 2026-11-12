import { inject, Injectable, InjectionToken } from '@angular/core';
import type { ProfileRepository } from '../domain/profile.repository';

export const PROFILE_REPOSITORY = new InjectionToken<ProfileRepository>('ProfileRepository');

@Injectable({ providedIn: 'root' })
export class ProfileCatalogService {
  readonly profile = inject(PROFILE_REPOSITORY).getProfile();
}

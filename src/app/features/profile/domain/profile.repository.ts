import type { ProfessionalProfile } from './profile.model';

export interface ProfileRepository {
  getProfile(): ProfessionalProfile;
}

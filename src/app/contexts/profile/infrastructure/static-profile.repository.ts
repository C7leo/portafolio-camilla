import type { ProfessionalProfile } from '../domain/profile.model';
import type { ProfileRepository } from '../domain/profile.repository';
import { CONTACT_LINKS } from './contact-links';

export class StaticProfileRepository implements ProfileRepository {
  getProfile(): ProfessionalProfile {
    return {
      displayName: 'Camilla Espinoza', givenName: 'Camilla', familyName: 'Espinoza',
      location: 'Lima, Perú', discipline: 'Ingeniería de Software.',
      introduction: 'Transformo necesidades de negocio en soluciones tecnológicas, combinando desarrollo de software, análisis de datos y mejora de procesos.',
      background: 'Mi experiencia en el sector financiero me ha permitido trabajar con plataformas de datos, automatización y soluciones digitales, conectando el conocimiento técnico con los desafíos reales del negocio.',
      contacts: CONTACT_LINKS,
    };
  }
}

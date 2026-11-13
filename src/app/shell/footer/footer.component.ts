import { EditorialGridComponent } from '../../shared/ui/editorial-grid/editorial-grid.component';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { RevealDirective } from '../../shared/motion/reveal.directive';
import { ProfileCatalogService } from '../../contexts/profile/application/profile-catalog.service';
import { ProjectCatalogService } from '../../contexts/projects/application/project-catalog.service';
import template from './footer.component.html?raw';
import styles from './footer.component.css?inline';

@Component({
  selector: 'app-footer', standalone: true, imports: [EditorialGridComponent, TranslatePipe, RevealDirective],
  template, styles, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly contacts = inject(ProfileCatalogService).profile.contacts;
  readonly projects = inject(ProjectCatalogService).projects;
  readonly navigation = [
    { label: 'Inicio', href: '#inicio' }, { label: 'Sobre mí', href: '#sobre-mi' },
    { label: 'Servicios', href: '#servicios' }, { label: 'Experiencia', href: '#experiencia' },
    { label: 'Contacto', href: '#contacto' },
  ];
}

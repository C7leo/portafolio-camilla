import { EditorialGridComponent } from '../../shared/ui/editorial-grid/editorial-grid.component';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../core/theme/theme.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { RevealDirective } from '../../shared/motion/reveal.directive';
import { ProfileCatalogService } from '../../features/profile/application/profile-catalog.service';
import { ProjectCatalogService } from '../../features/projects/application/project-catalog.service';
import { ContactFormComponent } from '../../features/contact/contact-form.component';



@Component({
  selector: 'app-footer', standalone: true, imports: [EditorialGridComponent, TranslatePipe, RevealDirective, ContactFormComponent],
  templateUrl: './footer.component.html', styleUrl: './footer.component.css', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly theme = inject(ThemeService);
  readonly contacts = inject(ProfileCatalogService).profile.contacts.filter(link => link.id !== 'email');
  readonly projects = inject(ProjectCatalogService).projects;
  readonly navigation = [
    { label: 'Inicio', href: '#inicio' }, { label: 'Sobre mí', href: '#sobre-mi' },
    { label: 'Servicios', href: '#servicios' }, { label: 'Experiencia', href: '#experiencia' },
    { label: 'Contacto', href: '#contacto' },
  ];
}

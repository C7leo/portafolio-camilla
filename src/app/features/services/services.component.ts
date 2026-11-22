import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';



@Component({
  selector: 'app-services', standalone: true, imports: [TranslatePipe], templateUrl: './services.component.html', styleUrl: './services.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent {
  readonly active = signal(0);
  readonly services = [
    {
      number: '01',
      title: 'Desarrollo de aplicaciones',
      description: 'Aplicaciones web y móviles diseñadas para ofrecer experiencias funcionales e intuitivas.',
    },
    {
      number: '02',
      title: 'Análisis y visualización de datos',
      description: 'Diseño paneles e indicadores que transforman información en conocimiento útil para la toma de decisiones.',
    },
    {
      number: '03',
      title: 'Automatización de procesos',
      description: 'Implemento soluciones que simplifican tareas repetitivas y optimizan flujos de trabajo.',
    },
  ] as const;
}

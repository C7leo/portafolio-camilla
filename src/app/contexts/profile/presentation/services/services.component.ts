import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { AppWindow, ChartNoAxesCombined, CodeXml, createElement } from 'lucide';
import { freelanceWhatsappUrl } from '../../application/freelance-contact';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';
import { EditorialGridComponent } from '../../../../shared/ui/editorial-grid/editorial-grid.component';
import template from './services.component.html?raw';
import styles from './services.component.css?inline';

@Component({
  selector: 'app-services', standalone: true,
  imports: [TranslatePipe, RevealDirective, EditorialGridComponent],
  template, styles, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent implements AfterViewInit {
  readonly whatsappUrl = freelanceWhatsappUrl;
  @ViewChildren('serviceIcon') private icons!: QueryList<ElementRef<HTMLElement>>;
  readonly services = [
    { number: '01', label: '01 / WEB', icon: CodeXml, title: 'Desarrollo web', description: 'Landing pages y sitios web modernos, responsivos y personalizados.' },
    { number: '02', label: '02 / SOFTWARE', icon: AppWindow, title: 'Aplicaciones a medida', description: 'Sistemas de gestión, reservas y soluciones adaptadas a tu negocio.' },
    { number: '03', label: '03 / DATA', icon: ChartNoAxesCombined, title: 'Datos y automatización', description: 'Dashboards, reportes interactivos y automatización de procesos.' },
  ] as const;

  ngAfterViewInit(): void {
    this.icons.forEach((element, index) => element.nativeElement.append(createElement(this.services[index].icon, {
      width: 24, height: 24, 'stroke-width': 1.5, 'aria-hidden': 'true', focusable: 'false',
    })));
  }
}

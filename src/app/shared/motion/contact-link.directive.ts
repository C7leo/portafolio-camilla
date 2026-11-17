import {Directive, HostListener, inject} from '@angular/core';
import { ContactNavigationService } from './contact-navigation.service';

/** Preserve normal link semantics while sharing the lateral Contact transition. */
@Directive({selector: 'a[appContactLink]', standalone: true})
export class ContactLinkDirective {
  private readonly navigation = inject(ContactNavigationService);
  @HostListener('click', ['$event'])
  navigate(event: MouseEvent): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById('contacto');
    if (!target) return;
    event.preventDefault();
    this.navigation.navigate(target);
  }
}

import {ChangeDetectionStrategy, Component, inject, OnDestroy, signal} from '@angular/core';
import {CONTACT_FORM_ENDPOINT, ContactField, ContactFormService, ContactSubmissionError} from '../../contexts/profile/application/contact-form.service';
import {TranslatePipe} from '../../shared/i18n/translate.pipe';
import {RevealDirective} from '../../shared/motion/reveal.directive';
import {EditorialGridComponent} from '../../shared/ui/editorial-grid/editorial-grid.component';
import template from './contact-form.component.html?raw';
import styles from './contact-form.component.css?inline';

@Component({
  selector: 'app-contact-form', standalone: true,
  imports: [TranslatePipe, RevealDirective, EditorialGridComponent],
  template, styles, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormComponent implements OnDestroy {
  readonly endpoint = CONTACT_FORM_ENDPOINT;
  readonly state = signal<'idle' | 'sending' | 'success' | 'error'>('idle');
  readonly errors = signal<Partial<Record<ContactField, string>>>({});
  readonly notice = signal('');
  private readonly contact = inject(ContactFormService);
  private request?: AbortController;
  private destroyed = false;

  edit(field: ContactField): void {
    if (this.errors()[field]) this.errors.update(errors => ({...errors, [field]: undefined}));
    if (this.state() === 'success' || this.state() === 'error') {
      this.state.set('idle'); this.notice.set('');
    }
  }

  async submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.state() === 'sending') return;
    const form = event.currentTarget as HTMLFormElement;
    const errors: Partial<Record<ContactField, string>> = {};
    const data = new FormData(form);
    for (const field of ['name', 'email', 'subject', 'message'] as const) {
      const input = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement;
      const value = input.value.trim();
      data.set(field, value);
      if (field !== 'subject' && !value) errors[field] = field === 'name' ? 'Escribe tu nombre completo.' : field === 'email' ? 'Escribe tu correo electrónico.' : 'Escribe tu mensaje.';
      else if (!input.validity.valid) errors[field] = field === 'email' ? 'Introduce un correo electrónico válido.' : 'Revisa la longitud de este campo.';
    }
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      this.state.set('error'); this.notice.set('Revisa los campos señalados antes de enviar.');
      (form.elements.namedItem(Object.keys(errors)[0]) as HTMLElement).focus();
      return;
    }
    this.state.set('sending'); this.notice.set('Enviando tu mensaje…');
    const request = this.request = new AbortController();
    const timeout = setTimeout(() => request.abort(), 30000);
    try {
      await this.contact.submit(data, request.signal);
      if (this.destroyed) return;
      form.reset();
      this.state.set('success');
      this.notice.set('Mensaje recibido. Gracias por escribirme; te responderé a tu correo.');
    } catch (error) {
      if (this.destroyed) return;
      this.state.set('error');
      const fields: Partial<Record<ContactField, string>> = {};
      if (error instanceof ContactSubmissionError) {
        for (const field of error.fields) fields[field] = field === 'email' ? 'Introduce un correo electrónico válido.' : 'Revisa este campo e inténtalo de nuevo.';
      }
      this.errors.set(fields);
      this.notice.set(error instanceof ContactSubmissionError && error.status === 429
        ? 'Se han realizado varios envíos. Espera un momento e inténtalo de nuevo.'
        : Object.keys(fields).length ? 'Revisa los campos señalados antes de enviar.'
        : 'No pudimos confirmar el envío. Conservamos tu mensaje para que puedas intentarlo de nuevo.');
    } finally {
      clearTimeout(timeout);
      if (!this.destroyed) {
        this.request = undefined;
        form.querySelector<HTMLElement>('#contact-feedback')?.focus({preventScroll: true});
      }
    }
  }

  ngOnDestroy(): void { this.destroyed = true; this.request?.abort(); }
}

import {Injectable} from '@angular/core';

export const CONTACT_FORM_ENDPOINT = 'https://formspree.io/f/xjgvpygp';
export type ContactField = 'name' | 'email' | 'subject' | 'message';
export class ContactSubmissionError extends Error {
  constructor(readonly status: number, readonly fields: ContactField[] = []) {
    super('Contact submission was not confirmed');
  }
}

@Injectable({providedIn: 'root'})
export class ContactFormService {
  async submit(data: FormData, signal: AbortSignal): Promise<void> {
    const response = await fetch(CONTACT_FORM_ENDPOINT, {
      method: 'POST', body: data, headers: {Accept: 'application/json'},
      credentials: 'omit', redirect: 'error', signal,
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result?.ok === true) return;
    const fields: ContactField[] = [];
    if (Array.isArray(result?.errors)) {
      for (const error of result.errors) {
        if (['name', 'email', 'subject', 'message'].includes(error.field)) fields.push(error.field);
      }
    }
    throw new ContactSubmissionError(response.status, fields);
  }
}

import type { ContactLink } from '../domain/profile.model';

﻿/** Public link destinations. Configure locally; href values remain visible to browsers. */
const email = import.meta.env.VITE_CONTACT_EMAIL?.trim() || '';

const configuredLinks: ContactLink[] = [
  { id: 'email', title: 'EMAIL', href: email ? `mailto:${email}` : '', external: false },
  { id: 'linkedin', title: 'LINKEDIN', href: import.meta.env.VITE_CONTACT_LINKEDIN?.trim() || '', external: true },
  { id: 'github', title: 'GITHUB', href: import.meta.env.VITE_CONTACT_GITHUB?.trim() || '', external: true },
];

export const CONTACT_LINKS: readonly ContactLink[] = configuredLinks.filter(link => Boolean(link.href));

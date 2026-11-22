export interface ContactLink {
  readonly id: 'email' | 'linkedin' | 'github';
  readonly title: string;
  readonly href: string;
  readonly external: boolean;
}

export interface ProfessionalProfile {
  readonly displayName: string;
  readonly givenName: string;
  readonly familyName: string;
  readonly location: string;
  readonly discipline: string;
  readonly introduction: string;
  readonly background: string;
  readonly contacts: readonly ContactLink[];
}

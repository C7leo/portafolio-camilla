interface TimelineEntry {
  readonly id: 'bcp' | 'banbif';
  readonly date: string;
  readonly role: string;
  readonly area: string;
  readonly description: string;
  readonly icon: 'analytics' | 'support_agent';
}

export interface ExperienceCopy {
  readonly introLead: string;
  readonly introRest: string;
  readonly timelineLabel: string;
  readonly entries: readonly TimelineEntry[];
}

export const EXPERIENCE_COPY: Record<'es' | 'en', ExperienceCopy> = {
  es: {
    introLead: 'Experiencia en el sector financiero,',
    introRest: 'combinando análisis de datos, desarrollo de soluciones digitales y soporte tecnológico.',
    timelineLabel: 'Trayectoria profesional',
    entries: [
      { id: 'bcp', date: '2026 - BCP', role: 'Practicante Preprofesional de Ingeniería de Software', area: 'Análisis de datos y soluciones digitales', description: 'Desarrollo de paneles, modelado de datos y automatización de procesos con Power BI, SQL y Microsoft Fabric.', icon: 'analytics' },
      { id: 'banbif', date: '2025 - BanBif', role: 'Practicante de Mesa de Servicios TI', area: 'Soporte TI y gestión de incidencias', description: 'Gestión de incidencias, soporte tecnológico y seguimiento de solicitudes para asegurar la continuidad operativa.', icon: 'support_agent' },
    ],
  },
  en: {
    introLead: 'Experience in the financial sector,',
    introRest: 'combining data analysis, digital solution development and technology support.',
    timelineLabel: 'Professional experience',
    entries: [
      { id: 'bcp', date: '2026 - BCP', role: 'Software Engineering Intern', area: 'Data analysis and digital solutions', description: 'Dashboard development, data modeling and process automation with Power BI, SQL and Microsoft Fabric.', icon: 'analytics' },
      { id: 'banbif', date: '2025 - BanBif', role: 'IT Service Desk Intern', area: 'IT support and incident management', description: 'Incident management, technology support and request follow-up to ensure operational continuity.', icon: 'support_agent' },
    ],
  },
};


import type { Experience } from '../domain/experience.model';

/** Professional information supplied by the portfolio owner. */
export const EXPERIENCES: readonly Experience[] = [
  {
    id: 'bcp', period: '2026', company: 'Banco de Crédito del Perú (BCP)',
    role: 'Practicante Preprofesional — Gobierno de Datos',
    description: 'Desarrollo de soluciones para el procesamiento, integración y análisis de datos mediante Python, SQL y Microsoft Fabric. Diseño y mantenimiento de modelos de datos con criterios de consistencia, calidad y trazabilidad. Desarrollo de indicadores para apoyar el seguimiento y la toma de decisiones. Mejoras en la estructura y mantenibilidad de soluciones de datos, utilizando GitHub para el control de versiones.',
    technologies: ['Python', 'SQL', 'Microsoft Fabric', 'GitHub', 'Power BI', 'DAX'],
  },
  {
    id: 'banbif', period: '2025–2026', company: 'BanBif',
    role: 'Practicante Preprofesional — Mesa de Servicios TI',
    description: 'Gestioné incidencias, solicitudes y accesos, brindando soporte a usuarios y coordinando escalaciones. Contribuí a optimizar los flujos de gestión de accesos, reduciendo reprocesos manuales, y apoyé la estandarización de procesos administrativos de TI, mejorando la trazabilidad y los tiempos de atención.',
    technologies: ['Aranda', 'Windows', 'Redes', 'Gestión de incidencias', 'Soporte TI'],
  },
];

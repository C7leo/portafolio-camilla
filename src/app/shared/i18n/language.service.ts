import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

export type Language = 'es' | 'en';
const ES: Record<string, string> = {
  'My approach to technology': 'Mi enfoque de la tecnología',
  'I TURN IDEAS INTO DIGITAL EXPERIENCES.': 'TRANSFORMO IDEAS EN EXPERIENCIAS DIGITALES.',
  'FOR ME, TECHNOLOGY IS MORE THAN CODE.': 'PARA MÍ, LA TECNOLOGÍA ES MÁS QUE CÓDIGO.',
  "IT'S ABOUT CREATING, EXPLORING,": 'SE TRATA DE CREAR, EXPLORAR,',
  'AND BUILDING SOMETHING MEANINGFUL.': 'Y CONSTRUIR ALGO SIGNIFICATIVO.',
  '03 / Projects': '03 / Proyectos',
  'Email': 'Correo', 'DESIGNED & DEVELOPED BY CAMILLA': 'DISEÑADO Y DESARROLLADO POR CAMILLA',
  '06 / CONTACT': '06 / CONTACTO', "LET'S TALK.": 'HABLEMOS.',
  "I'm always open to new opportunities, collaborations or just a good conversation about technology.": 'Siempre estoy abierta a nuevas oportunidades, colaboraciones o una buena conversación sobre tecnología.',
  'EMAIL': 'CORREO', 'VISITORS': 'VISITANTES', 'PROJECTS': 'PROYECTOS', 'OPPORTUNITIES': 'OPORTUNIDADES',
  'SOFTWARE ENGINEERING / DATA / CLOUD': 'INGENIERÍA DE SOFTWARE / DATOS / CLOUD',
  'All rights reserved.': 'Todos los derechos reservados.',
  '05 / SKILLS': '05 / HABILIDADES', 'SKILLS.': 'HABILIDADES.',
  '05 / EXPERIENCE': '05 / EXPERIENCIA', 'EXPERIENCE.': 'EXPERIENCIA.',
  '02 / ABOUT': '02 / SOBRE MÍ', '03 / PROJECT ARCHIVE': '03 / ARCHIVO DE PROYECTOS',
  'SELECTED': 'TRABAJOS', 'WORK.': 'DESTACADOS.',
  'CREATE.': 'CREA.', 'BUILD.': 'CONSTRUYE.', 'EVOLVE.': 'EVOLUCIONA.',
};
const EN: Record<string, string> = {
  '¿TRABAJAMOS JUNTOS?': 'SHALL WE WORK TOGETHER?',
  'Hagamos realidad tu próxima idea.': 'Let’s bring your next idea to life.',
  'DESARROLLO WEB ✳ APLICACIONES A MEDIDA ✳ DATOS Y AUTOMATIZACIÓN ✳ SOLUCIONES DIGITALES ✳': 'WEB DEVELOPMENT ✳ CUSTOM APPLICATIONS ✳ DATA & AUTOMATION ✳ DIGITAL SOLUTIONS ✳',
  'Tu negocio visible en internet.': 'Your business, easy to find online.',
  'Problema': 'Problem', 'Solución': 'Solution',
  'Gastos compartidos del hogar, organizados en un solo lugar.': 'Shared household expenses, organized in one place.',
  'Llevar las cuentas compartidas de un hogar puede generar confusión sobre quién pagó y cuánto corresponde a cada persona.': 'Sharing household expenses can make it hard to track who paid and how much each person owes.',
  'Aplicación web para organizar los gastos del hogar y consultar la información desde paneles según el rol de cada usuario.': 'A web application to organize household expenses and view information through role-based dashboards.',
  'Búsqueda y reserva de estacionamientos desde la web y el móvil.': 'Find and book parking spaces on web and mobile.',
  'Encontrar un estacionamiento disponible y coordinar su reserva exige conocer la ocupación de los espacios.': 'Finding available parking and arranging a booking requires knowing which spaces are occupied.',
  'Plataforma web y móvil para buscar, reservar y gestionar estacionamientos con información de ocupación e integración IoT.': 'A web and mobile platform to find, book and manage parking with occupancy information and IoT integration.',
  'Servicios nutricionales con acceso y navegación según cada plan.': 'Nutrition services with access and navigation tailored to each plan.',
  'Organizar los servicios nutricionales requiere reunir el acceso de usuarios, sus perfiles y los planes disponibles.': 'Organizing nutrition services requires bringing together user access, profiles and available plans.',
  'Aplicación web que reúne la autenticación, los perfiles de usuario y la navegación según el plan de suscripción.': 'A web application combining authentication, user profiles and navigation based on the subscription plan.',
  'Gestión escolar que conecta usuarios, cursos y calificaciones.': 'School management connecting users, courses and grades.',
  'La gestión académica necesita mantener conectada la información de usuarios, cursos y calificaciones.': 'Academic management needs to keep user, course and grade information connected.',
  'Plataforma de gestión escolar con servicios de autenticación, cursos y calificaciones conectados mediante un gateway.': 'A school management platform with authentication, course and grade services connected through a gateway.',
  'Reservas deportivas y entrenadores': 'Sports bookings and coaches',
  'Reservas de canchas y conexión con entrenadores desde el móvil.': 'Book courts and connect with coaches from a mobile device.',
  'Coordinar reservas de canchas y sesiones con entrenadores requiere reunir las opciones deportivas y de entrenamiento.': 'Coordinating court bookings and coaching sessions requires bringing sports and training options together.',
  'Aplicaciones móviles para reservar canchas, consultar entrenadores y gestionar reseñas dentro de una misma plataforma.': 'Mobile applications to book courts, find coaches and manage reviews within one platform.',
  'Organización de reuniones educativas': 'Educational meeting organization',
  'Reuniones educativas con participantes, fechas y horarios organizados.': 'Educational meetings with organized participants, dates and times.',
  'Organizar reuniones educativas requiere coordinar participantes, fechas y horarios sin dispersar la información.': 'Organizing educational meetings requires coordinating participants, dates and times without scattering the information.',
  'Aplicación web para organizar reuniones educativas con formularios, selección de participantes y manejo de fechas y horas.': 'A web application to organize educational meetings with forms, participant selection and date and time handling.',
  'Coordinación de cuidados': 'Care coordination',
  'Comunicación entre residencias y familias para coordinar cuidados.': 'Communication between care homes and families to coordinate care.',
  'Las familias y las residencias necesitan compartir información para coordinar el cuidado de los adultos mayores.': 'Families and care homes need to share information to coordinate care for older adults.',
  'Plataforma web de coordinación de cuidados y comunicación entre residencias y familiares.': 'A web platform for care coordination and communication between care homes and families.',
  'Servicios': 'Services',
  '04 / SERVICIOS': '04 / SERVICES',
  'Soluciones digitales para llevar tus ideas más lejos.': 'Digital solutions to take your ideas further.',
  'Desde una presencia web hasta herramientas que optimizan tu negocio.': 'From a web presence to tools that optimize your business.',
  'Desarrollo web': 'Web development',
  'Landing pages y sitios web modernos, responsivos y personalizados.': 'Modern, responsive and personalized landing pages and websites.',
  'Aplicaciones a medida': 'Custom applications',
  'Sistemas de gestión, reservas y soluciones adaptadas a tu negocio.': 'Management systems, booking platforms and solutions tailored to your business.',
  'Datos y automatización': 'Data and automation',
  'Dashboards, reportes interactivos y automatización de procesos.': 'Dashboards, interactive reports and process automation.',
  '05 / EXPERIENCE': '05 / EXPERIENCE',
  'Controles de proyectos': 'Project controls',
  'proyectos seleccionados': 'selected projects',
  'Arrastra para explorar': 'Drag to explore',
  'Proyecto anterior': 'Previous project',
  'Proyecto siguiente': 'Next project',
  'Pausar animación': 'Pause animation',
  'Reanudar animación': 'Resume animation',
  'Seleccionar proyecto': 'Select a project',
  '¿Tienes un proyecto en mente?': 'Have a project in mind?',
  'Hablemos': 'Let’s talk',
  'Activar tema oscuro': 'Switch to dark theme',
  'Activar tema claro': 'Switch to light theme',
  'Abrir WhatsApp': 'Open WhatsApp',
  'Soluciones digitales, de la idea al desarrollo.': 'Digital solutions, from idea to development.',
  'Ver proyecto': 'View project',
  'Desliza para explorar': 'Scroll to explore',
  'Volver al inicio': 'Back to top',
  'Descargar CV': 'Download CV', 'Descargar CV en PDF': 'Download CV as PDF',
  'Desarrollo, datos y tecnología para crear soluciones con propósito.': 'Development, data and technology to build purposeful digital solutions.',
  'Conversemos': 'Let’s connect', 'Explorar': 'Explore',
  'Desarrollo': 'Development', 'Datos': 'Data',
  'Pausar fondo': 'Pause background', 'Reproducir fondo': 'Play background',
  'Ideas que se convierten en experiencias digitales.': 'Ideas that become digital experiences.',
  'Desplázate para descubrir los proyectos': 'Scroll to discover the projects',
  'Ver landing page': 'View landing page', 'Repositorio': 'Repository',
  'Pulsa Enter o espacio para ver los enlaces del proyecto.': 'Press Enter or Space to view the project links.',
  'Desplázate o arrastra para explorar': 'Scroll or drag to explore',
  'Usa las flechas para explorar los proyectos. Inicio vuelve al primero.': 'Use the arrow keys to explore projects. Home returns to the first.',
  'Habilidades': 'Skills',
  'Experiencia': 'Experience', 'Navegación del pie de página': 'Footer navigation',
  'LIMA, PERÚ — 2026': 'LIMA, PERU — 2026',
  'Aplicación web de finanzas': 'Financial web application', 'Aplicación web de finanzas.': 'Financial web application.',
  'Sistema inteligente de estacionamientos': 'Smart parking system', 'Sistema inteligente de estacionamientos.': 'Smart parking system.',
  'Plataforma de gestión de servicios nutricionales': 'Nutrition services management platform', 'Plataforma de gestión de servicios nutricionales.': 'Nutrition services management platform.',
  'Usa Tab o las flechas izquierda y derecha para seleccionar un proyecto. Enter o Espacio actualizan la información sin salir del archivo.': 'Use Tab or the left and right arrow keys to select a project. Enter or Space update the information without leaving the archive.',
  'Canales de contacto': 'Contact channels', '(se abre en otra pestaña)': '(opens in a new tab)',
  'Estadísticas del portafolio': 'Portfolio statistics', 'Estadísticas próximamente.': 'Visitor statistics coming soon.',
  'Detalle de código en una pantalla, en blanco y negro': 'Close-up of code on a screen, in black and white',
  'HERRAMIENTAS': 'TOOLS', 'H': 'T',
  'Tecnologías y herramientas que utilizo para transformar ideas en soluciones digitales.': 'Technologies and tools I use to turn ideas into digital solutions.',
  'Construcción de aplicaciones web modernas y escalables.': 'Building modern, scalable web applications.',
  'Análisis, modelado y visualización de datos para la toma de decisiones.': 'Data analysis, modeling and visualization to support decision-making.',
  'Servicios y arquitecturas en la nube para soluciones robustas y seguras.': 'Cloud services and architectures for robust, secure solutions.',
  'Entornos y herramientas que potencian el desarrollo y el trabajo colaborativo.': 'Environments and tools that enhance development and collaborative work.',
  'DESARROLLO': 'DEVELOPMENT', 'DATOS': 'DATA', 'SOPORTE TI': 'IT SUPPORT',
  'Arquitectura de la sede del Banco de Crédito del Perú, en blanco y negro': 'Architecture of the Banco de Crédito del Perú headquarters, in black and white',
  'Edificio de BanBif, en blanco y negro': 'BanBif building, in black and white',
  'Experiencias que transforman conocimientos en soluciones reales.': 'Experiences that turn knowledge into real solutions.',
  'Cada experiencia abre un nuevo mundo.': 'Every experience opens a new world.',
  'Trayectoria profesional': 'Professional experience',
  'Practicante Preprofesional — Gobierno de Datos': 'Data Governance Intern',
  'Practicante Preprofesional — Mesa de Servicios TI': 'IT Service Desk Intern',
  'Desarrollo de soluciones para el procesamiento, integración y análisis de datos mediante Python, SQL y Microsoft Fabric. Diseño y mantenimiento de modelos de datos con criterios de consistencia, calidad y trazabilidad. Desarrollo de indicadores para apoyar el seguimiento y la toma de decisiones. Mejoras en la estructura y mantenibilidad de soluciones de datos, utilizando GitHub para el control de versiones.': 'I develop solutions for data processing, integration and analysis using Python, SQL and Microsoft Fabric. I design and maintain data models with a focus on consistency, quality and traceability, and develop indicators to support monitoring and decision-making. I improve the structure and maintainability of data solutions, using GitHub for version control.',
  'Gestioné incidencias, solicitudes y accesos, brindando soporte a usuarios y coordinando escalaciones. Contribuí a optimizar los flujos de gestión de accesos, reduciendo reprocesos manuales, y apoyé la estandarización de procesos administrativos de TI, mejorando la trazabilidad y los tiempos de atención.': 'I managed IT incidents, service requests and user access, providing support and coordinating escalations. I contributed to optimizing access management workflows, reducing manual rework, and helped standardize administrative IT processes, improving traceability and turnaround times.',
  'Redes': 'Networking', 'Gestión de incidencias': 'Incident Management', 'Soporte TI': 'IT Support',
  'Inicio': 'Home', 'Sobre mí': 'About', 'Proyectos': 'Projects', 'Contacto': 'Contact',
  'Navegación principal': 'Main navigation', 'Camilla. Ir al inicio': 'Camilla. Go to home',
  'Menú': 'Menu', 'Cerrar': 'Close', 'Abrir menú': 'Open menu', 'Cerrar menú': 'Close menu',
  'Idioma': 'Language', 'Saltar al contenido': 'Skip to content',
  'Lima, Perú': 'Lima, Peru', 'Ingeniería de Software.': 'Software Engineering.',
  'Desarrollo de aplicaciones.': 'Application development.', 'Análisis de datos.': 'Data analysis.',
  'Explora mi portafolio': 'Explore my portfolio', 'Ver proyectos': 'View projects', 'Conóceme': 'About me',
  'TECNOLOGÍA': 'TECHNOLOGY', 'CON PROPÓSITO.': 'WITH PURPOSE.', 'Tecnología con propósito.': 'Technology with purpose.',
  'Transformo necesidades de negocio en soluciones tecnológicas, combinando desarrollo de software, análisis de datos y mejora de procesos.': 'I turn business needs into technology solutions by combining software development, data analytics, and process improvement.',
  'Mi experiencia en el sector financiero me ha permitido trabajar con plataformas de datos, automatización y soluciones digitales, conectando el conocimiento técnico con los desafíos reales del negocio.': 'My experience in the financial sector has given me hands-on exposure to data platforms, automation, and digital solutions, connecting technical expertise with real business challenges.',
  'Fotografía personal': 'Personal photograph', 'Fotografía por incorporar': 'Photograph to be added',
  'Espacio para incorporar una fotografía personal': 'Space for a personal photograph',
  'Espacio para incorporar una captura real de un proyecto o del proceso de trabajo': 'Space for a real project or work-process screenshot',
  'Captura real de un proyecto o del proceso de trabajo': 'Real project or work-process screenshot',
  'Captura real por incorporar': 'Screenshot to be added', 'Retrato': 'Portrait', 'Proceso': 'Process',
  'Volver al archivo': 'Back to archive',
  'La imagen y la documentación detallada de este proyecto aún no están disponibles.': 'The image and detailed documentation for this project are not available yet.',
  'Archivo visual de proyectos': 'Visual project archive', 'Índice de proyectos': 'Project index',
  'Desplázate hacia abajo para descubrir y ordenar los proyectos. Usa Tab o las flechas izquierda y derecha para elegir un proyecto y Enter para abrir sus detalles. Con movimiento reducido, el catálogo se muestra directamente ordenado.': 'Scroll down to reveal and arrange the projects. Use Tab or the left and right arrow keys to select a project and Enter to open its details. With reduced motion enabled, the catalogue is displayed in its final layout.',
  'Estudios visuales provisionales. No representan capturas de los proyectos.': 'Temporary visual studies. They do not represent project screenshots.',
  'Aplicación web financiera': 'Financial web application', 'Aplicación web financiera.': 'Financial web application.',
  'Estacionamientos inteligentes': 'Smart parking', 'Plataforma de estacionamientos inteligentes.': 'Smart parking platform.',
  'Aplicación web de nutrición': 'Nutrition web application', 'Aplicación web de nutrición.': 'Nutrition web application.',
  'Arquitectura de microservicios': 'Microservices architecture', 'Arquitectura de microservicios.': 'Microservices architecture.',
  'Placeholder editorial': 'Editorial placeholder', 'Sin captura real': 'No actual screenshot',
  'Tecnologías': 'Technologies', 'Por documentar': 'Not documented yet',
};

function savedLanguage(): Language {
  try { return localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'es'; }
  catch { return 'es'; }
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly language = signal<Language>(savedLanguage());
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const language = this.language();
      this.document.documentElement.lang = language;
      this.document.title = language === 'en' ? 'Camilla Espinoza — Development & Data' : 'Camilla Espinoza — Desarrollo & Datos';
      const description = this.document.querySelector('meta[name="description"]');
      description?.setAttribute('content', this.translate('Transformo necesidades de negocio en soluciones tecnológicas, combinando desarrollo de software, análisis de datos y mejora de procesos.'));
      const skip = this.document.querySelector('.skip-link');
      if (skip) skip.textContent = this.translate('Saltar al contenido');
      try { localStorage.setItem('portfolio-language', language); } catch { /* Language switching also works without storage. */ }
    });
  }

  setLanguage(language: Language): void { this.language.set(language); }

  translate(value: string | null | undefined): string {
    if (!value) return '';
    if (this.language() === 'es') return ES[value] ?? value;
    if (EN[value]) return EN[value];
    if (value.endsWith(': próximamente')) return this.translate(value.slice(0, -14)) + ': coming soon';
    const announcement = /^La sección (.+) estará disponible próximamente\.$/.exec(value);
    if (announcement) return `The ${this.translate(announcement[1])} section will be available soon.`;
    if (value.startsWith('Explorar ')) return 'Explore ' + value.slice(9);
    if (value.startsWith('Abrir ')) {
      const [name, category] = value.slice(6).split(': ');
      return 'Open ' + name + (category ? ': ' + this.translate(category) : '');
    }
    const placeholder = /^Placeholder editorial de (.+), sin captura real$/.exec(value);
    if (placeholder) return `Editorial placeholder for ${placeholder[1]}, no actual screenshot`;
    if (value.startsWith('Captura de ')) return 'Screenshot of ' + value.slice(11);
    return value;
  }
}

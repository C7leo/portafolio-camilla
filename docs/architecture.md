# Arquitectura orientada a dominios

> La organización actual por funcionalidades está descrita en [feature-reorganization.md](feature-reorganization.md). Las rutas `contexts/` que aparecen más abajo describen el estado anterior.

El portafolio es una aplicación Angular standalone construida con Vite. Su contenido se organiza en tres contextos: **Perfil**, **Proyectos** y **Experiencia**. Cada contexto tiene modelos propios y un contrato de acceso al contenido. Angular compone sus implementaciones estáticas desde `src/app/app.config.ts`.

## Estructura

```text
src/
  main.ts                         # Bootstrap y configuración global
  styles.css                      # Tipografía, tokens y estilos globales
  app/
    app.component.ts              # Composición de la página
    app.config.ts                 # Proveedores de repositorios
    contexts/
      profile/
        domain/                   # Perfil profesional, contactos y contrato
        application/              # ProfileCatalogService
        infrastructure/           # Perfil estático y contactos desde VITE_*
        presentation/
          hero/                   # Portada
          services/               # Servicios freelance y CTA de WhatsApp
          about/                  # Biografía, narrativa y marquee
          graphics/               # Shader y contrato del horizonte
      projects/
        domain/                   # Proyecto y contrato de repositorio
        application/              # Catálogo y búsqueda por ruta
        infrastructure/
          assets/                 # Imágenes de los siete proyectos
        presentation/
                                  # Galería CSS 3D, escena de mar, modal y detalles por hash
      experience/
        domain/                   # Experiencia y contrato de repositorio
        application/              # Catálogo profesional
        infrastructure/           # Contenido de BCP y BanBif
        presentation/
          graphics/               # Escena Three.js del valle
    layout/
      controls/                   # Controles flotantes de scroll y tema
      navigation/                 # Navbar, idiomas y descarga de CV
      footer/                     # Cierre global
    features/
      contact/                    # Formulario y comportamiento de contacto
    shell/intro/                  # Introducción anterior conservada, actualmente inactiva
    shared/
      assets/                     # Logo y fotografía floral compartidos
      theme/                      # Estado centralizado y persistencia del tema
      i18n/                       # LanguageService y TranslatePipe
      motion/                     # Coordinación de scroll e introducción
      ui/editorial-grid/          # Guías arquitectónicas reutilizables
```

## Responsabilidades y dependencias

```mermaid
flowchart LR
  P[Presentación] --> A[Aplicación]
  A --> D[Dominio]
  I[Infraestructura] --> D
  C[app.config.ts] --> A
  C --> I
```

- **Dominio:** interfaces TypeScript de información profesional y puertos de repositorio. No importa Angular, GSAP, Three.js ni implementaciones de almacenamiento.
- **Aplicación:** servicios de consulta que dependen de los contratos de dominio mediante `InjectionToken`. Proyectos resuelve además el proyecto correspondiente a una ruta.
- **Infraestructura:** catálogos estáticos, carga de contactos públicos desde el entorno e implementaciones de los repositorios. Aquí se elige cómo obtener el contenido, sin modificar componentes consumidores.
- **Presentación:** componentes Angular, plantillas, estilos, controles y renderizadores visuales. Las escenas WebGL pertenecen a presentación porque implementan la experiencia visual, no reglas del negocio.
- **Layout:** navegación, controles y footer. El footer consulta los servicios de Perfil y Proyectos y compone la funcionalidad de contacto.
- **Features:** el formulario de contacto y sus recursos de presentación. La introducción anterior permanece separada e inactiva mientras se revisan sus pruebas y recursos originales.
- **Shared:** recursos técnicos comunes. No depende de un contexto de negocio.
- **Raíz de composición:** `app.config.ts` conecta contratos e implementaciones. `main.ts` entrega esta configuración a `bootstrapApplication`.

Los datos del portafolio son de lectura. Los modelos y contratos se mantienen pequeños; las operaciones de consulta se añaden cuando existe un consumidor real. Los archivos `.d.ts` junto a los renderizadores JavaScript describen el contrato usado por TypeScript y se conservan.

## Editar contenido

- Identidad, ubicación, biografía: `contexts/profile/infrastructure/static-profile.repository.ts`.
- Contacto: variables públicas de `.env`, documentadas en `docs/development.md`; su adaptador es `contexts/profile/infrastructure/contact-links.ts`.
- Proyectos e imágenes: `contexts/projects/infrastructure/project.catalog.ts` y `assets/`.
- BCP y BanBif: `contexts/experience/infrastructure/experience.catalog.ts`.
- Traducciones y metadatos por idioma: `shared/i18n/language.service.ts`.
- CV: `docs/career/CV_Camilla.md` y `docs/career/CV_Camila_Espinoza_ATS_EN.md`; exportar con `npm run cv:export`.

## Comprobaciones

`npm run check:architecture` analiza imports TypeScript/JavaScript/JSX, imports diferidos, plantillas y estilos de Angular, CSS, recursos `new URL`, iconos del marquee y PDF del navbar. También informa sobre archivos sin conexión con la aplicación: actualmente la comprobación termina con error porque hay implementaciones históricas conservadas y la dependencia `three` necesaria para ellas. El detalle por archivo está en [architecture-inventory.md](architecture-inventory.md).

`npm run typecheck` comprueba todos los contratos TypeScript. `npm test` ejecuta las pruebas de navegador en Chrome. `npm run build` verifica la integración de módulos y recursos para producción.

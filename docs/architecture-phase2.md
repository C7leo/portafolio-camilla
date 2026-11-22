# Auditoría y reorganización: fase 2

## Estructura

Antes, las responsabilidades globales estaban en `app/shell/{controls,navigation,footer,contact, intro}`; las secciones estaban en `app/contexts/{profile,projects,experience}` y los dos WebP del Hero en la raíz de `src`.

```text
src/app/
  contexts/{profile,projects,experience}/  # dominios y presentación existentes
  features/contact/                       # formulario y sus recursos
  layout/{controls,navigation,footer}/     # elementos globales
  shared/{assets,i18n,motion,navigation,theme,ui}/
  shell/intro/                            # implementación anterior inactiva
src/app/contexts/profile/presentation/hero/assets/  # WebP del Hero
```

Se movieron los directorios `shell/controls`, `shell/navigation` y `shell/footer` a `layout/`, y `shell/contact` a `features/contact/`. Se movieron `hero-fondo-1280.webp` y `hero-fondo-1802.webp` a los assets del Hero. Se ajustaron imports, precargas, CSS del footer, referencias del analizador y las pruebas de descarga de CV. La fuente de iconos de Experience y las URL del fondo se declaran en los estilos globales para que Vite las procese durante AOT. El inventario individual está en [architecture-inventory.md](architecture-inventory.md).

## Candidatos revisados

| Archivo o grupo | Evidencia y decisión | Riesgo |
| --- | --- | --- |
| `contexts/projects/presentation/project-ring.ts` | Sin imports ni referencias dinámicas; la galería activa utiliza `CircularCarousel`. Archivo versionado sin cambios locales: eliminado y recuperable de Git. | Bajo; documentación histórica mencionaba la implementación anterior. |
| `contexts/experience/presentation/experience-valley.component.ts` y `graphics/experience-valley.scene.*` | No están en el grafo activo; hay imports dinámicos de `three`, pruebas históricas y cambios locales. Se conservan. | Alto para el trabajo local y las pruebas anteriores. |
| `contexts/profile/presentation/about/about-story.*`, `about-horizon-bloom.component.ts`, `graphics/about-horizon-bloom.scene.*`, sus PNG y `public/assets/skills/` | La vista activa About ya no los importa, pero las pruebas y documentación anteriores los referencian; las escenas importan `three` dinámicamente. Se conservan. | Medio/alto; no se presume que la funcionalidad anterior se haya descartado definitivamente. |
| `shell/intro/*` y `shared/assets/night-lily.png` | Introducción inactiva, pero existen pruebas, documentación y el vídeo original. Se conservan fuera de la compilación activa. | Alto para la recuperación del recurso original. |
| `src/about.png`, `src/hero-fondo.png` | Originales PNG no referenciados por la vista activa, sin seguimiento de Git. Se conservan para no borrar originales locales sin respaldo. | Alto: su eliminación no sería recuperable desde Git. |
| `contexts/profile/application/freelance-contact.ts` | Sin consumidor activo; contiene datos del usuario y documentación histórica. Se conserva. | Medio. |

`three` no se encuentra en el bundle inicial ni en la funcionalidad activa; se conserva porque las dos escenas anteriores y sus pruebas aún lo necesitan. React se descarga con el carrusel al aproximarse a proyectos; GSAP y Lucide sí tienen usos activos. `@angular/compiler` pasó a dependencia de desarrollo y dejó de descargarse en el navegador. Se agregaron `@angular/compiler-cli`, `@angular/build` y `@analogjs/vite-plugin-angular` para compilar AOT; no se retiraron otras dependencias.

## Tamaño

| Medida | Antes | Después |
| --- | ---: | ---: |
| Assets en `src` y `public`, sumados por tamaño de archivo | 12.318.742 B | 12.318.742 B |
| Transferencia inicial total en Lighthouse móvil local | 487.539 B | 214.738 B |
| JS inicial transferido en Lighthouse móvil local | 410.035 B | 135.225 B |

La reorganización movió los assets sin recomprimirlos ni eliminar originales en esta fase. La transferencia procede de una carga inicial sin caché, no de una navegación por todas las secciones. Las cifras de Lighthouse y las limitaciones de SSG están en [performance.md](performance.md).

## Validación y pendientes

La compilación y TypeScript pasan. Se verificaron imágenes del Hero y footer, fuente de iconos, Services, navbar, tema, idioma, Experience, formulario, CV y carrusel sobre producción. Algunas pruebas históricas de Services aún buscan `.services-intro` y datos de un diseño anterior; otras pruebas de intro/About/valle también describen implementaciones inactivas y necesitan revisión. `check:architecture` informa correctamente los candidatos conservados y `three`, por lo que todavía devuelve error. Angular 22 exige una versión de Node más reciente que la instalada durante esta revisión.

# Organización por funcionalidades

El portafolio es una aplicación Angular standalone compilada con Vite y AOT. Es una sola página renderizada en el navegador; los detalles de proyectos usan fragmentos de URL, no rutas del servidor.

```text
src/app/
  core/{navigation,theme}/          # servicios globales
  features/
    home/                            # Hero e imágenes adaptables
    about/                           # About y recursos anteriores
    services/                        # servicios ofrecidos
    projects/{domain,application,infrastructure,presentation}/
    experience/{domain,application,infrastructure,presentation}/
    profile/{domain,application,infrastructure}/
    contact/                         # formulario
  layout/{navigation,footer,controls}/
  shared/{assets,i18n,motion,ui}/
  shell/intro/                       # implementación anterior, inactiva
```

Antes, las secciones estaban en `contexts/profile/presentation/{hero,about,services}` y `contexts/{projects,experience}`; tema y navegación estaban en `shared/`. Se movieron a las ubicaciones anteriores, junto con los assets y las escenas asociadas, y se actualizaron imports, precargas y CSS. `app.config.ts` conecta los catálogos estáticos con sus contratos. Los modelos y servicios existentes se conservaron sin añadir capas nuevas.

El carrusel React se carga dinámicamente cerca de proyectos. Las secciones mantienen sus dimensiones y animaciones: diferirlas mediante placeholders exigiría rehacer la navegación por fragmentos y la coordinación de animaciones, con riesgo de saltos. No se añadió `@defer` sin demostrar que preserve esas funciones.

## Revisión de recursos y código

El [inventario anterior por archivo](architecture-inventory.md) conserva las rutas previas. `npm run check:architecture` sigue el grafo activo, imports dinámicos, plantillas, estilos y recursos, e informa los archivos no alcanzados para revisión; no demuestra por sí solo que se puedan eliminar.

| Candidato o grupo | Evidencia y decisión | Riesgo |
| --- | --- | --- |
| `features/about/assets/originals/about.png`, `features/home/assets/originals/hero-fondo.png` | Originales locales sin seguimiento, movidos junto a sus funcionalidades; la aplicación usa las versiones WebP. Se conservan. | Perder originales que no están en Git. |
| `features/home/assets/hero-fondo-{1280,1802}.webp` | Ambos tienen referencias de precarga y CSS para distintos anchos; se conservan. | Afectar portada y footer. |
| `features/about/about-story.*`, `about-horizon-bloom.component.ts`, `graphics/`, sus PNG y `public/assets/skills/` | Implementación anterior inactiva, con referencias dinámicas, pruebas históricas y cambios locales. Se conserva. | Pérdida de trabajo local o de funcionalidad anterior. |
| `features/experience/presentation/experience-valley.component.ts` y `graphics/` | Inactivos en la vista actual; contienen cambios locales y una importación dinámica de `three`; varias pruebas históricas los cubren. Se conservan. | Pérdida de trabajo local y pruebas históricas. |
| `shell/intro/`, `shared/assets/night-lily.png` | Intro y vídeo anteriores inactivos, preservados por sus recursos y cambios locales. | Pérdida de la implementación anterior. |
| `three` | No aparece en los fragmentos de producción actuales; las dos escenas históricas lo importan dinámicamente. Se conserva. | Romper esas escenas si vuelven a activarse. |
| `freelance-contact.ts` | Sin referencias; eliminado en la revisión anterior. El adaptador activo sigue en `features/profile/infrastructure/`. | Bajo; el archivo estaba versionado. |

Los demás archivos alcanzados se consideran necesarios para la aplicación o sus recursos; documentación, licencias, configuración y pruebas se conservan para sus usos respectivos. La copia anterior a los movimientos está en `.local/before-feature-reorganization/`, fuera del despliegue y de Git.

## Prerenderizado

El HTML inicial no contiene el contenido de las secciones. El prerenderizado podría mejorar indexación y presentación inicial, pero hay accesos a `window`, `document`, `location`, observadores y animaciones que requieren adaptaciones para servidor. También habría que comprobar hidratación, navegación por fragmentos y despliegue Vercel. No se activó SSG sin validar esas incompatibilidades.

## Rendimiento y tamaño

La auditoría móvil identifica la sección Hero como LCP. En el informe anterior el recurso se descubrió desde el HTML con prioridad alta; la demora principal observada fue de renderizado. En la compilación actual, el fragmento inicial minificado ocupa 411.458 B y el fragmento diferido del carrusel 211.659 B, antes de compresión de transferencia. El análisis de módulos de Rollup identifica Angular y GSAP como contribuyentes principales del inicial, y React DOM como el mayor contribuyente del carrusel diferido. Los tamaños de módulos individuales que informa Rollup son anteriores a la minificación final y no se deben sumar como transferencia.

| Medida | Referencia 68 | Antes de reorganizar | Después de reorganizar |
| --- | ---: | ---: | ---: |
| Lighthouse móvil | 68 | 92 | 93 |
| LCP | 4,1 s | 2,5 s | 2,4 s |
| CLS | 0 | 0,005 | 0,005 |
| JS inicial transferido | 410.035 B | 135.225 B | 135.081 B |
| Total transferido en carga inicial | 489.251 B | 216.450 B | 216.298 B |
| Imágenes, fuentes, vídeo y PDF en `src` y `public` | — | 12.318.742 B | 12.318.742 B |

Las dos últimas mediciones son ejecuciones locales simuladas individuales y su diferencia no demuestra una mejora real de rendimiento por mover archivos. La reducción frente a 68 corresponde a la fase AOT anterior. El total transferido se calcula sumando las solicitudes de red de Lighthouse en la carga inicial, no todas las secciones; los recursos del repositorio incluyen archivos históricos no descargados. No hay una medición válida de INP de usuarios. El informe final está en `.local/lighthouse-features-solo.report.html` y el análisis de fragmentos en `.local/bundle-audit.json`.

## Verificación

La compilación y TypeScript pasan. En 36 pruebas seleccionadas sobre producción, 33 pasaron; tres pruebas de la intro antigua fallaron porque esperan un vídeo desactivado antes de esta reorganización. La suite completa se inició en la línea base y se interrumpió tras fallos de pruebas que esperan el About antiguo; no se declara que la suite completa pase. El chequeo de arquitectura informa los candidatos conservados y `three` y por ello sigue devolviendo error.

En otras 11 pruebas de navbar, nueve pasaron y dos buscan `.glass-surface`, elemento ausente en la implementación actual. Una prueba adicional del CTA del Hero se interrumpió después de detectar que espera `.hero-micro-cta`, también ausente en la versión previa a los movimientos. Esas pruebas requieren revisión frente al diseño activo.

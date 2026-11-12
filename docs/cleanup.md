# Reorganización y limpieza — 2026-11-11

## Criterio de eliminación

Se trazaron imports desde `src/main.ts`, plantillas, estilos, imports diferidos, imágenes, iconos dinámicos y documentos descargables. Los archivos alcanzables se reubicaron y sus referencias se actualizaron. Se conservaron las declaraciones TypeScript de las escenas JavaScript, los recursos usados por estados alternativos y los componentes de detalle de proyectos.

El inventario previo y el mapa completo de movimientos están en `.local/refactor-2026-11-11/before.json` y `migration.json`. Los archivos retirados se apartaron del árbol de ejecución; una copia de recuperación local está en `.local/refactor-2026-11-11/removed/` y no se copia a producción.

## Archivos retirados

- Componentes y estilos de las antiguas secciones independientes Habilidades y Contacto. El contacto utilizado por el footer se mantiene como adaptador del dominio Perfil.
- `project-archive.component.*`: presentación de proyectos anterior, sin importadores. Se conserva `project-art.component.ts`, que sí usa la ruta de detalle actual.
- `brand.component.ts`, `pending-link.component.ts` y `scroll-reveal.directive.ts`: sin consumidores activos.
- Fotografías de BCP/BanBif, gato y antiguos recursos de Experiencia; captura del Contacto retirado y sus iconos públicos.
- SVG Kubernetes y Notion, sin uso en el marquee actual; favicon SVG sustituido previamente por el logo.
- Cinco documentos de secciones retiradas o desactualizados, sustituidos por la documentación actual de arquitectura y recursos.
- `tests/composition-baseline.json`: referencia histórica que incluía las secciones eliminadas. La prueba de composición se mantiene y ahora verifica las guías y secciones vigentes.

El inventario inicial identificó 26 archivos de ejecución sin uso, con aproximadamente **5,4 MB** de contenido; junto a cinco documentos obsoletos se retiraron 31 archivos del árbol activo. La referencia histórica de pruebas se retiró después, al actualizar esa prueba.

## Dependencias retiradas

Se eliminaron diez dependencias directas sin consumidores: `@hugeicons/core-free-icons`, `@hugeicons/react`, `@primeuix/themes`, `@tailwindcss/postcss`, `motion`, `postcss`, `primeng`, `react`, `react-dom` y `tailwindcss`. npm retiró 47 paquetes en esa operación. TypeScript 6.0.3 se añadió exclusivamente como herramienta de desarrollo para verificar contratos y arquitectura.

RxJS y tslib se conservan por los requisitos de Angular, aunque su uso no aparezca como un import directo en los componentes.

## Documentos y rutas

Los cuatro documentos profesionales están en `docs/career/`, incluido **`CV_Camilla.md`**, cuyo nombre se conserva. La exportación del CV es ahora una herramienta del proyecto: `scripts/export-cv.mjs`. Los PDF públicos conservan sus nombres y URLs.

La documentación general está en `docs/`; los componentes, modelos y adaptadores están en `src/app/contexts/`. Navbar, introducción y footer están en `src/app/shell/`. Los recursos técnicos compartidos están en `src/app/shared/`.

## Preservación

Se conservaron imágenes y vídeo activos, contenido ES/EN, navegación, descarga del CV, rutas de proyectos, secuencia de introducción, interacciones Three.js, animaciones GSAP/ScrollTrigger y guías editoriales. Las evidencias profesionales y auditorías de `.local/` no se consideran archivos obsoletos de la aplicación y no se eliminaron.

Las comprobaciones de cierre incluyen compilación, tipos, reglas de arquitectura, pruebas de navegador y comparación del contenido visible antes y después. Sus resultados se registran en `validation.md` dentro de `.local/refactor-2026-11-11/`.

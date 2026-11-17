# Ajuste editorial del Hero y la navegación

La corrección conserva Urbanist, la fotografía floral y la paleta original. Se retiraron la cinta superior, su animación y sus traducciones exclusivas. El espacio de cabecera corresponde ahora a la propia navegación, sin un hueco reservado para la cinta.

El nombre mantiene sus tamaños y proporciones. Dos espacios flexibles de la retícula separan los metadatos, el nombre y el bloque inferior; el desplazamiento solicitado no usa una transformación adicional. La columna principal admite contenido de ancho cero como mínimo para que la fuente provisional no ensanche la retícula antes de cargar Urbanist.

El fondo rosa del nombre usa un degradado radial transparente, sin desenfoque ni bordes rectangulares. Conserva la variable animada de la entrada cinematográfica. No se modificaron la fotografía ni los archivos de video.

En escritorio, especialidad, indicador de scroll y enlaces comparten una fila. Dos columnas laterales iguales mantienen el indicador en el centro real de la pantalla. En móvil, la especialidad ocupa una línea propia y los enlaces flanquean el indicador; el espacio inferior protege los controles del botón de tema. Se mantiene la invitación a conversar por WhatsApp. «Análisis de datos.» se retiró únicamente del Hero.

EN/ES mantiene dimensiones y peso tipográfico constantes, selección mediante subrayado, hover lima translúcido y foco visible por teclado. Los estados no dependen del fondo blanco del tema claro.

## Evidencias locales

- Capturas anteriores: `.local/hero-composition/before/`.
- Comparación visual antes/después: `.local/hero-composition/comparison.html`.
- Capturas de escritorio y móvil, en ES/EN, y resultados de Playwright: `.local/hero-composition/chrome-production/`.
- Comparación visual en 375, 390, 768, 1024, 1366, 1440 y 1920 px; revisión de contención, alineación del scroll, separación de controles, carga de fuentes y navegación.
- La compilación mantiene la introducción automática, el botón para saltarla, la entrada animada del Hero y la carga diferida de las escenas inferiores.

Se verificaron 57 casos en Chrome (ejecución principal y confirmaciones) y 18 en WebKit para Windows. Incluyen reproducción automática sin interacción en escritorio/móvil, finalización y salto de la intro, navegación, continuidad del fondo, contención de las secciones inferiores y caché de producción. La comprobación de continuidad espera el estado anclado real; se sustituyó una espera fija de 100 ms que podía adelantarse al refresco de fuentes y layout. El anclaje se comparó también con la implementación original y conserva su posición. WebKit para Windows no sustituye una prueba en un iPhone físico.

TypeScript, arquitectura, compilación AOT y prerender completaron sus verificaciones.

## Lighthouse

Dos auditorías locales de producción, con autoplay activo, dieron **78 y 93 en móvil**, y **99 en escritorio** en ambas ejecuciones. Accesibilidad, buenas prácticas y SEO: **100** en ambos tamaños. Se conservó la primera medición en `.local/hero-composition/lighthouse-*-run-1.json`; los informes completos de la segunda están en `.local/performance/mobile.*` y `desktop.*`.

La primera ejecución móvil midió un LCP de 3,83 s; la segunda, 1,01 s. El bloqueo total fue de 316 y 268 ms, respectivamente, frente a 405 ms en la auditoría anterior. No hubo cambios de código entre ambas ejecuciones. Estos resultados muestran variabilidad de laboratorio con el video activo; no se ocultó ni omitió la introducción para medir. El CLS móvil fue 0 y 0,0015, respectivamente.

No se añadieron dependencias ni se modificó la configuración de Vercel o sus políticas de caché. No se publicó el cambio.

# Rendimiento

## Apertura de partículas

Tras ordenar la aparición visual, una nueva ejecución móvil local dio 92/100, LCP de 2,6 s, CLS de 0 y tiempo total de bloqueo de 240 ms; la transferencia inicial fue de 224.260 B. La medición anterior de la introducción (93/100 y 180 ms de bloqueo) se muestra debajo. Las diferencias entre ejecuciones pueden incluir variación del entorno. El informe está en `.local/lighthouse-particles-ordered.report.html`.

La escena carga dinámicamente un módulo propio y toma las muestras de la imagen responsive ya usada por el Hero. En escritorio utiliza WebGL; en pantallas de hasta 640 px usa menos partículas con Canvas 2D para evitar el coste de inicializar WebGL. La escena termina y libera sus recursos; se omite con movimiento reducido, ahorro de datos o navegación directa a otra sección. El indicador de preparación es indeterminado porque no se dispone de progreso fiable por bytes.

| Lighthouse móvil local | Antes | Después |
| --- | ---: | ---: |
| Rendimiento | 96 | 93 |
| LCP | 2,5 s | 2,6 s |
| CLS | 0,005 | 0,005 |
| Tiempo total de bloqueo | 110 ms | 180 ms |
| JavaScript transferido | 137.033 B | 141.000 B |
| Transferencia total inicial | 218.626 B | 223.052 B |

Son ejecuciones simuladas individuales, no datos reales de usuarios. La animación añade trabajo y transferencia; no se afirma una mejora de rendimiento. Informes: `.local/lighthouse-particles-before.report.html` y `.local/lighthouse-particles-final2.report.html`.

Una auditoría móvil local adicional sobre `vite preview` obtuvo 92/100 en rendimiento, 96/100 en accesibilidad, 100/100 en buenas prácticas y 92/100 en SEO; FCP 0,8 s, LCP 2,5 s, TBT 270 ms y CLS 0,005. El informe está en `.local/lighthouse-latest.report.html`. Es una medición simulada, sujeta a variación y no representa datos reales de usuarios.

La compilación de Vite produce un sitio estático con archivos JS y CSS minificados. La página sigue siendo una aplicación Angular renderizada en el navegador: el HTML generado no contiene el contenido prerenderizado de las secciones.

## Recursos

- La portada usa WebP de 1280 o 1802 píxeles y se precarga según el ancho de pantalla. El pie reutiliza el mismo recurso.
- Las imágenes de proyectos usan WebP de 640 y 1280 píxeles; el navegador elige con `srcset` según el tamaño y la densidad de pantalla.
- El carrusel y React se importan cuando el visitante se aproxima a proyectos. Mientras tanto se reserva el espacio y se muestra una vista previa. Los controles se habilitan cuando el carrusel termina de cargar.
- Las fuentes se sirven localmente y la tipografía principal usa `font-display: swap`.

## Vercel

Vercel distribuye automáticamente archivos estáticos en su CDN. `vercel.json` configura la caché del navegador para los archivos con hash bajo `assets/build/` (un año) y para los CV (un día). Los archivos bajo `public/assets/skills/` no tienen nombres versionados y no reciben la regla inmutable. Las cabeceras requieren un despliegue en Vercel para quedar activas; `vite preview` no las aplica.

## Auditoría local

Una ejecución móvil simulada de Lighthouse sobre `vite preview`, el 21 de noviembre de 2026, dio los siguientes resultados. Las métricas varían entre ejecuciones y no representan datos reales de visitantes.

| Métrica | Antes | Después |
| --- | ---: | ---: |
| Rendimiento | 48/100 | 68/100 |
| Primera pintura con contenido | 3,4 s | 2,9 s |
| Pintura del elemento principal | 13,7 s | 4,1 s |
| Tiempo total de bloqueo | 720 ms | 530 ms |
| Cambio acumulado de diseño | 0 | 0 |

En esa medición el JS inicial aún incluía el compilador JIT de Angular, principal oportunidad detectada.

Una nueva medición local sobre la compilación de producción dio 68/100 en rendimiento, 96/100 en accesibilidad, 100/100 en buenas prácticas y 92/100 en SEO; FCP 2,9 s, LCP 4,1 s, TBT 540 ms y CLS 0. La reducción de archivos de una introducción ya desactivada no cambió apreciablemente la puntuación. El reporte está en `.local/lighthouse-current.report.html` y Lighthouse sigue señalando JavaScript sin usar como oportunidad principal.

La introducción estaba desactivada antes de esta revisión. Se retiró su componente de la entrada para que el vídeo y su portada no se incluyan en `dist`; se conserva el código anterior por sus cambios y pruebas locales. No hay mapas ni vídeos activos que requieran un control de carga por clic. El formulario valida al enviar y no realiza peticiones por cada pulsación; tampoco hay listas largas que justifiquen paginación.

## Segunda fase: compilación anticipada

Se sustituyó la compilación JIT en el navegador por AOT mediante el plugin de Angular para Vite. Las plantillas y estilos usan `templateUrl` y `styleUrl`; los recursos compartidos de Hero y la fuente de Experience se procesan desde los estilos globales para conservar sus URL en producción. El carrusel continúa en su fragmento diferido.

| Medida móvil simulada, Lighthouse local | Antes | Después |
| --- | ---: | ---: |
| Rendimiento | 68 | 96 |
| LCP | 4,1 s | 2,4 s |
| FCP | 2,9 s | 1,6 s |
| Tiempo total de bloqueo | 540 ms | 150 ms |
| CLS | 0 | 0,005 |
| JavaScript inicial transferido | 410.035 B | 135.225 B |
| Total transferido | 487.539 B | 214.738 B |

Ambas mediciones son ejecuciones locales simuladas, no datos reales de visitantes ni mediciones válidas de INP. El elemento LCP fue la sección Hero y su fondo WebP estaba correctamente precargado; la reducción del trabajo de JavaScript fue la intervención principal. El informe final está en `.local/lighthouse-phase2.report.html`.

El HTML sigue sin prerenderizar: SSG podría mejorar el SEO y la primera pintura, pero necesita adaptar el acceso directo a `window`, `document`, almacenamiento y animaciones, y comprobar hidratación, navegación por hash y despliegue en Vercel. No se activó automáticamente. Angular 22.2.5 requiere Node 22.22.3+, 24.15.0+ o 26+; las verificaciones locales se ejecutaron con Node 24.11.0, que emitió avisos de incompatibilidad aunque compiló, por lo que debe actualizarse antes de considerar el entorno compatible.

Para repetir la medición, ejecutar `npm run build`, iniciar `npm run preview` y apuntar Lighthouse a la URL local. Los informes de esta revisión se encuentran en `.local/`, que no forma parte del despliegue.

# Rendimiento y publicaci?n

La aplicaci?n compila plantillas Angular con AOT y Vite minifica JS y CSS. `npm run build` genera los recursos y prerenderiza `dist/index.html`; `npm run build:client` solo compila el cliente. El prerenderizado usa Chrome local o Chromium de `@sparticuz/chromium` en Vercel. Angular reconstruye el contenido en el navegador; no se trata de hidrataci?n Angular.

El Hero utiliza WebP de 1280 o 1802 px precargado seg?n el viewport. About y proyectos utilizan variantes y `srcset`; las im?genes fuera de pantalla se cargan de forma diferida y reservan dimensiones. El carrusel React se importa al acercarse a Proyectos y muestra una vista previa mientras carga; Three.js se importa al interactuar con el Hero. Las fuentes se sirven localmente. La cortina de entrada de cinco segundos se conserva por decisi?n de dise?o y afecta el tiempo hasta ver el Hero.

Vercel distribuye el sitio a trav?s de su CDN. `vercel.json` define HTML revalidable, archivos versionados inmutables durante un a?o y PDF durante un d?a. Estas cabeceras y el CDN solo est?n activos al desplegar en Vercel; la vista previa local no los representa.

No hay mapas o v?deos activos que requieran carga por clic, ni listas largas que justifiquen paginaci?n. El formulario valida al enviar y no hace solicitudes por cada pulsaci?n; retrasar sus campos no mejorar?a la red. Angular usa se?ales y `OnPush` en los componentes principales.

## Lighthouse local

Mediciones individuales en Chrome con Lighthouse y simulaci?n m?vil, antes y despu?s de esta revisi?n. No son datos reales de usuarios ni demuestran por s? solas una mejora estad?stica.

| M?trica | Antes | Despu?s |
| --- | ---: | ---: |
| Rendimiento | 97 | 91?97 |
| Accesibilidad | 97 | 97 |
| Buenas pr?cticas | 100 | 100 |
| SEO | 92 | 100 |
| FCP | 0,8 s | 0,9?1,1 s |
| LCP | 2,5 s | 2,5?2,7 s |
| TBT | 120 ms | 70?270 ms |
| CLS | 0,005 | 0?0,005 |

La auditor?a final de escritorio fue 100/97/100/100 en rendimiento, accesibilidad, buenas pr?cticas y SEO, con LCP 0,6 s, TBT 0 ms y CLS 0,001. Las ejecuciones finales m?viles variaron; no se demostr? una mejora del tiempo de carga frente a la l?nea base. Los informes JSON locales est?n en `.local/lighthouse-baseline.json`, `.local/lighthouse-final-mobile.json` y `.local/lighthouse-final-repeat.json` y `.local/performance/` (HTML y JSON). Lighthouse todav?a se?ala JavaScript no utilizado como oportunidad. La versi?n local de Node 24.11.0 est? por debajo del m?nimo declarado para Angular 22.2.5; usar Node 24.15.0 o superior compatible para despliegues.

Para repetir la auditor?a: `npm run build` y `npm run audit:lighthouse`. El HTML prerenderizado aumenta el tama?o inicial del documento, pero permite leer el contenido sin JavaScript.

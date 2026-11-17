# Rendimiento y despliegue en Vercel

El proyecto utiliza Angular standalone sobre Vite. Se revisaron los archivos del repositorio: no existían `angular.json` ni `vercel.json`. La configuración nueva identifica el framework de construcción como Vite, genera `dist/` y utiliza el CDN integrado de Vercel. No requiere contratar servicios, optimización de imágenes bajo demanda ni funciones de pago.

## Construcción

```sh
npm ci
npm run build
npm run serve:production
npm run audit:lighthouse
```

Usar Node 24.15 o posterior compatible con Angular 22. El build compila las plantillas Angular AOT en `.local/`, enlaza las bibliotecas, minifica JS/CSS y genera HTML estático con Playwright. Localmente requiere Chrome. En la construcción Linux de Vercel utiliza Chromium de `@sparticuz/chromium`, instalado como dependencia de desarrollo. Vercel debe instalar las dependencias de desarrollo durante el build. El navegador de construcción no se publica en `dist/`.

El prerender genera contenido en español legible sin JavaScript. La aplicación se inicia después sobre ese contenido: no es hidratación Angular SSR. Los controles se habilitan al arrancar la aplicación. No se capturan datos privados ni variables de entorno salvo los destinos públicos de contacto ya utilizados por el sitio.

## Optimizaciones

- Imágenes WebP de 480/960 px y una variante grande, `srcset`, `sizes`, dimensiones intrínsecas, decodificación asíncrona y lazy loading en contenido inferior. Los PNG originales quedan como fuentes editables y no se publican.
- Fondo principal precargado según el ancho de pantalla; fuente Urbanist local y variable declarada una vez por subconjunto, con `font-display: swap`.
- La introducción cinematográfica se reproduce automáticamente con `autoplay`, `muted` y `playsinline`, como en la implementación original. El montaje completo se sirve en WebM/VP9 o MP4/H.264 optimizado con faststart, con poster del primer fotograma. Se conservan el salto, la disolución y la entrada tipográfica del Hero. WebGL y las imágenes inferiores esperan hasta terminar la entrada del Hero; después conservan su carga por proximidad al viewport. Movimiento reducido y rechazo de autoplay disponen de salida legible al Hero.
- Se mantienen `OnPush`, señales, claves estables en bucles y animaciones fuera de Angular. La lista duplicada del carrusel se calcula solo al recibir proyectos.
- Esqueletos discretos en los espacios reservados para imágenes; los gráficos conservan sus alternativas CSS mientras cargan.
- JS/CSS minificados; Angular, movimiento y Three.js separados para reutilizar caché. El compilador Angular es una dependencia de desarrollo y no llega al navegador. Los estilos de componentes se minifican antes de compilar; Angular elimina constantes de plantillas y estilos que no necesita en producción.
- Se verificó que las dependencias de ejecución restantes tienen consumidores. No se aplicó un borrado automático de selectores: hay clases dinámicas de Angular y GSAP que deben conservarse. Se eliminaron declaraciones de fuente duplicadas.

No hay campos de búsqueda/formularios, mapas ni listas largas: no se añade debounce ni paginación a los siete proyectos. No se añaden dependencias para funcionalidades que no existen.

## Caché y actualizaciones

`vercel.json` aplica:

| Recurso | Cache-Control del navegador |
| --- | --- |
| `/` e `/index.html` | `public, max-age=0, must-revalidate` |
| Archivos en `/assets/` cuyo nombre contiene hash | `public, max-age=31536000, immutable` |
| Iconos sin hash y PDF del CV | `public, max-age=0, must-revalidate` |

El HTML se revalida. Al cambiar una imagen, fuente, JS o CSS, Vite produce otra URL con hash; el HTML del nuevo despliegue referencia esos archivos. Los PDF e iconos no reciben caché inmutable porque sus URLs se mantienen al actualizarse. Vercel gestiona los recursos estáticos en su CDN y la promoción de despliegues. No se instala un service worker ni se almacena HTML mediante JavaScript.

Las animaciones se crean en cada arranque; la caché solo reutiliza bytes de los recursos. Las preferencias de idioma y tema siguen en el almacenamiento existente. Un despliegue no reemplaza una pestaña que ya está abierta: al navegar o recargar se solicita el HTML actualizado. Si una pestaña antigua solicita un fragmento JS que ya no existe, el manejador de `vite:preloadError` recarga el HTML una vez, con protección contra bucles y sin recargar cuando no hay conexión. Las rutas de proyectos usan fragmentos `#proyectos/...`; no necesitan redirigir peticiones de archivos ausentes a HTML.

La política sigue las recomendaciones de [caché de Vercel](https://vercel.com/docs/caching/cache-control-headers). La compilación de bibliotecas utiliza el [linker oficial de Angular](https://angular.dev/tools/libraries/creating-libraries#consuming-partial-ivy-code-outside-the-angular-cli).

## Verificación

Última auditoría local de producción, con introducción automática activa y sin omitir el video, después del [ajuste editorial del Hero](hero-composition.md). La comparación usa la línea base original con autoplay; no usa la versión intermedia de reproducción manual. Véase [restauración cinematográfica](intro-restoration.md).

| Métrica | Original (móvil) | Actual (móvil) | Actual (escritorio) |
| --- | --- | --- | --- |
| Lighthouse rendimiento | 61 | 93 | 99 |
| Primera pintura de contenido | 3,4 s | 1,0 s | 0,3 s |
| Pintura del contenido principal | 3,4 s | 1,0 s | 0,8 s |
| Bloqueo total | 813 ms | 268 ms | 2 ms |
| Transferencia observada | 7467 KiB | 3170 KiB | 3461 KiB |

Se hicieron dos auditorías del mismo build después del ajuste visual: móvil 78/93 y escritorio 99/99. La tabla muestra la segunda ejecución; el rango y los resultados de la primera se conservan en el informe del ajuste editorial. Accesibilidad, buenas prácticas y SEO: 100. No hubo cambios de código entre ambas mediciones.

Las variantes principales de las imágenes suman 0,79 MB frente a 19,64 MB de los PNG originales (aproximadamente −96 %). Con la introducción automática restaurada, el JS inicial sin comprimir es aproximadamente 590 kB frente a 1371 kB; incluye la introducción necesaria para empezar inmediatamente y excluye el compilador Angular. Los resultados varían entre ejecuciones y la transferencia de escenas opcionales depende de cuándo entran en el margen del viewport.

El ajuste actual se verificó con 57 casos en Chrome (ejecución principal y confirmaciones) y 18 en WebKit: composición en siete anchos, ES/EN, foco y hover, fuentes retrasadas, autoplay sin entradas reales del usuario, recorrido completo y salto, Escape, navegación, movimiento reducido, bloqueo de autoplay, formatos alternativos, continuidad visual y caché. La restauración anterior también comprobó el poster durante un arranque lento. TypeScript, arquitectura y construcción AOT/prerender pasaron. WebKit se ejecutó en Windows con tamaños de móvil y escritorio; no sustituye una prueba en un iPhone físico. El Chromium Linux de construcción en Vercel debe verificarse en el próximo despliegue.

Lighthouse produce informes HTML/JSON en `.local/performance/mobile.*` y `desktop.*` sobre la construcción de producción, con compresión y cabeceras de caché. La línea base está en `before.report.*`. Son mediciones de laboratorio local; no son datos de usuarios reales ni una auditoría del despliegue nuevo en Vercel.

```powershell
$env:TEST_BASE_URL = 'http://127.0.0.1:5184'
$env:CHECK_CACHE = '1'
npx playwright test tests/performance.spec.js
```

Después de desplegar, comprobar cabeceras reales:

```sh
curl -I https://portafolio-camilla.vercel.app/
curl -I https://portafolio-camilla.vercel.app/assets/NOMBRE-CON-HASH.js
curl -I https://portafolio-camilla.vercel.app/cv/CV_Camilla_Espinoza.pdf
```

Para auditar producción, establecer `AUDIT_URL=https://portafolio-camilla.vercel.app/` antes de `npm run audit:lighthouse`. El script no publica cambios. Para este trabajo se comprobó que la URL existente responde 200 y utiliza Vercel; la configuración nueva requiere un próximo despliegue para reflejarse allí.

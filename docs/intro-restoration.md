# Restauración de la introducción cinematográfica

Se recuperó la experiencia anterior a la optimización: el visitante ve el montaje original automáticamente antes del Hero. Se retiraron el botón «Ver intro» y la carga del componente condicionada a una acción manual. La introducción vuelve a formar parte del arranque necesario.

## Comportamiento conservado

La decisión de inicio coincide con la versión original del repositorio: reproducción automática en la primera visita de la sesión y al recargar, salida directa al contenido en enlaces internos y omisión con movimiento reducido. Se conserva el control de sesión existente.

El video ocupa la misma capa de pantalla completa que en la implementación original. Su ubicación fuera del Hero evita interferencias con los elementos fijados por ScrollTrigger. No se creó una página ni una ventana de reproducción manual. Siguen disponibles «Omitir intro» y Escape.

Se conservaron literalmente las secuencias GSAP de disolución, registro del encuadre móvil y construcción tipográfica del Hero: mismos tiempos, efectos, posiciones y curvas. La disolución natural comienza en los últimos 1,35 segundos; en móvil registra el video con el fondo floral del Hero antes de cerrar la capa. La secuencia tipográfica aparece automáticamente después.

## Carga y formatos

| Archivo | Peso | Uso |
| --- | --- | --- |
| `cinematic-intro.mp4` | 4.998.725 bytes | Fuente original, conservada sin modificaciones y sin publicarse |
| `cinematic-intro.webm` | 1.676.936 bytes | Alternativa VP9 cuando no se declara soporte H.264 o falla MP4 |
| `cinematic-intro.optimized.mp4` | 2.812.795 bytes | H.264 preferido por compatibilidad y decodificación eficiente, con faststart |
| `cinematic-intro-poster.webp` | 62.406 bytes | Primer fotograma del video, durante el arranque |

Las dos versiones mantienen los 1280 × 720 píxeles, los 24 fps y todos los fotogramas del montaje original. No se han sustituido escenas, alterado la velocidad ni recortado la narrativa. Solo se omite la pista de audio que ya era inaudible por `muted`. El MP4 se reduce aproximadamente un 44 % y el WebM un 66 %.

El elemento usa `autoplay`, `muted`, `playsinline`, `preload="auto"` y dimensiones explícitas. Se incluye un poster inicial antes del arranque de Angular para evitar que el HTML prerenderizado del Hero aparezca brevemente antes del video. Se prefiere H.264 porque durante la validación WebKit declaró soporte VP9 sin producir un primer fotograma a tiempo. Un fallo de formato intenta la otra variante una sola vez. Cuando el navegador impide autoplay o fallan ambas variantes, la capa se disuelve al Hero legible; no se impone un botón de reproducción. Se mantienen los límites de carga, espera y bloqueo para impedir una pantalla permanente.

Las escenas WebGL y las URLs de las imágenes inferiores esperan hasta terminar la entrada del Hero. Después se activan sus observadores de proximidad y el lazy loading existente. Se conservan los fallbacks de gráficos y los tamaños reservados para imágenes. Las políticas de caché de Vercel y la compilación AOT siguen funcionando.

Para regenerar las variantes al editar la fuente:

```sh
FFMPEG_BINARY=/ruta/a/ffmpeg npm run video:optimize
```

La codificación es una tarea explícita de edición; Vercel utiliza los archivos generados y no descarga ni ejecuta FFmpeg durante el despliegue.

## Comparación con la implementación original

Se extrajo `HEAD` a una copia aislada y se ejecutó su aplicación junto a la compilación restaurada. La comparación está en `.local/intro-restoration/original-comparison.json` y las capturas en `comparison/`.

- El SHA-256 de la fuente de video coincide con el original.
- Coinciden la función original que decide la reproducción, la secuencia GSAP del Hero y la secuencia de disolución/registro del video.
- Se capturaron ambos videos a 1, 3 y 6 segundos en 1440 y 390 px. La diferencia media por canal está entre 0,78 y 1,34 en una escala de 0–255; la geometría y el contenido permanecen alineados.
- El SSIM sobre todos los fotogramas, normalizando las bases de tiempo, es 0,9941 para H.264 y 0,9915 para VP9. Las hojas de contacto de ambas versiones se revisaron visualmente.
- Las cuatro comparaciones de la transición final al Hero en Chrome (375/390/393/430 px) registraron diferencia media de píxeles 0 entre el último fondo de la intro y el primer fondo del Hero, sin anotaciones.

## Pruebas reproducibles

```powershell
$env:TEST_BASE_URL = 'http://127.0.0.1:5191'
$env:CHECK_CACHE = '1'
npx playwright test tests/intro-autoplay.spec.js tests/intro-poster.spec.js tests/hero-intro.spec.js tests/cinematic-continuity.spec.js tests/performance.spec.js
```

`playwright.intro.config.js` permite repetir autoplay, poster y continuidad con WebKit. Las pruebas registran las entradas reales de puntero/teclado y verifican que el tiempo del video avanza sin ellas; no utilizan un clic para iniciar el video. También cubren salto y Escape, recarga, navegación posterior, movimiento reducido, autoplay bloqueado, WebM fallido, carga aplazada de WebGL/imágenes y recuperación de fragmentos de código después de un despliegue.

Las capturas y resultados de esta corrección quedan bajo `.local/intro-restoration/`. Lighthouse se ejecuta sobre la compilación de producción con la introducción automática activa, sin simular movimiento reducido ni omitir el video.

## Resultado final

26 pruebas Chrome y 18 casos WebKit verificados en tamaños móvil y escritorio. Las comparaciones de continuidad floral registraron diferencia media 0 en ambos motores a 375/390/393/430 px. El poster de inicio se comprobó por píxeles en Chrome; en WebKit se comprobó la imagen decodificada y la cobertura de pantalla completa, porque su API de captura espera a que termine la carga inicial que esa prueba bloquea deliberadamente.

| Métrica | Original (móvil) | Restaurada (móvil) | Restaurada (escritorio) |
| --- | --- | --- | --- |
| Lighthouse rendimiento | 61 | 87 | 99 |
| Primera pintura de contenido | 3,4 s | 1,1 s | 0,6 s |
| Pintura del contenido principal | 3,4 s | 1,1 s | 0,6 s |
| Bloqueo total | 813 ms | 405 ms | 53 ms |
| Transferencia observada | 7467 KiB | 3171 KiB | 3095 KiB |

Lighthouse también obtuvo 100 en accesibilidad móvil, 100 en buenas prácticas y 100 en SEO. Ambos informes registran la descarga del MP4 optimizado completo (2.812.795 bytes de recurso, respuesta HTTP 206), confirmando que la auditoría incluyó el video. Estas mediciones son locales; los cambios no se han desplegado en Vercel desde esta sesión. No se utilizaron clics de reproducción, movimiento reducido ni un poster estático para reemplazar el video durante Lighthouse.

# Auditoría y correcciones móviles — 2026-11-11

Rama de trabajo: `fix/mobile-bugs`, creada desde `origin/develop`. Se revisaron los adjuntos y las capturas de iPhone antes de modificar el código. No se incorporaron librerías ni se actualizaron dependencias.

## Arquitectura y alcance real

El sitio usa Angular standalone con Vite, GSAP/ScrollTrigger para narrativa y transiciones, Three.js para Proyectos, el horizonte y el valle, y Web Animations API para revelados secundarios. Las escenas tienen limpieza de observers, listeners y recursos gráficos.

Se inspeccionaron Intro, Navbar, Hero, Sobre mí, Proyectos, Experiencia, Footer y las directivas compartidas. Habilidades y Contacto independiente ya habían sido retirados antes de esta tarea; no se recrearon. El footer es el destino Contacto.

## Bugs, causas y correcciones

| Problema | Causa | Corrección |
| --- | --- | --- |
| Nombres de proyectos separados de sus imágenes; indicaciones superpuestas | El mosaico se calculaba en coordenadas WebGL, pero los siete nombres se situaban en una navegación inferior independiente, sin reservar su altura | En anchos de hasta 820 px, cada nombre usa las coordenadas de su misma celda. El cálculo reserva cabecera, imagen, etiqueta táctil y pie. Se conservan las imágenes, la cinta 3D, su reorganización y el diálogo. En pantallas bajas se emplean tres columnas para conservar etiquetas legibles y controles de 44 px |
| El recorrido de Proyectos tarda demasiado en alcanzar su estado final en GPU lenta | La interpolación avanzaba un porcentaje fijo por frame | Interpolación según tiempo transcurrido, equivalente al movimiento anterior a 60 fps. El renderer sigue deteniéndose al estabilizarse o salir de pantalla; DPR máximo móvil de 1,5 |
| Desfase entre apertura, canvas y scroll al cambiar las barras del navegador | Experiencia y Sobre mí mezclaban `innerHeight` con contenedores de altura `svh` | Distancias y geometría calculadas desde las superficies reales. ScrollTrigger ignora el resize pequeño de las barras táctiles; ResizeObserver mantiene el refresh ante cambios de tamaño efectivos. Se conserva la reconstrucción al cambiar orientación |
| Mundo vacío al completar la apertura de Experiencia | La visibilidad del contenido se activaba exactamente en progreso 1. WebKit produjo 0,9991 al situarse en el inicio del recorrido por redondeo de scroll | El contenido queda disponible en 0,98, cuando la apertura está prácticamente completa. La narrativa, BCP, BanBif, reversibilidad y cierre blanco se conservan |
| Banda blanca detrás del navbar sobre el Hero móvil | Safari recorta la extensión negativa del fondo cuando el host aplica `overflow-x: clip` | Se retira ese recorte únicamente en móvil/tablet; el panel ya termina en el borde de la pantalla. Se verifica el ancho real del documento, sin ocultar desbordamientos globales |
| Vídeo demasiado desplazado hacia la derecha; cobertura incorrecta tras resize | Se reutilizaba el encuadre del fondo floral para un vídeo de contenido distinto, y el diálogo usaba la altura estable | Vídeo centrado en móvil, conservando el encuadre floral independiente. El diálogo cubre `100dvh`; el botón de omisión mantiene los márgenes seguros y el final coincide con el Hero |
| Paisaje reducido a una franja en retrato | Un FOV vertical de 76 grados comprimía su escala y recortaba los bancos cercanos por los laterales | Se conserva el FOV vertical de 54 grados y se ajusta la extensión horizontal del mundo al aspect ratio de retrato. El recorrido de cámara usa la misma escala; escritorio, paleta, partículas y narrativa se conservan |
| Título de la galería estática desplazado tras un cambio de preferencias o pérdida WebGL | La liberación del renderer no retiraba los transforms, blur y opacidad escritos en los títulos DOM | El dispose retira las propiedades que pertenecen al renderer antes de mostrar el fallback |
| Controles táctiles pequeños en la navegación | Contacto y CV medían 40 px y las opciones de idioma podían medir 18 px de ancho | Contacto y CV tienen una altura mínima móvil de 44 px; CV mide 44 px de ancho y cada idioma tiene al menos 24 px. Se comprueba el navbar completo desde 320 px |
| Carga tipográfica dependiente de una conexión externa | Las trazas registraron `ERR_SOCKET_NOT_CONNECTED` al solicitar la hoja de Google Fonts | Se sirve la misma Urbanist en dos WOFF2 locales (aproximadamente 44 kB en total), con pesos, rangos Unicode y licencia originales. Se precarga el subconjunto latino; no se cambia de tipografía |

El espacio negro que representa el cielo y el sendero del valle se conserva. Se corrigen los recortes, el contenido invisible y la perspectiva móvil, sin sustituir el paisaje por otro fondo.

## Pruebas reproducibles

```sh
npx playwright install webkit
npm run test:mobile
npm test
npm run typecheck
npm run check:architecture
npm run build
```

`playwright.mobile.config.js` ejecuta la matriz en Chrome y WebKit, con entrada táctil. WebKit se instala como navegador de pruebas, no como dependencia de la aplicación. La suite ordinaria también incluye las nuevas regresiones en Chrome.

Las pruebas comprueban mosaico y apertura del proyecto correcto, etiquetas asociadas y sin solapamiento, avance y retroceso, entrada inmediata al mundo, BCP/BanBif en ES/EN, canvas ajustado a la escena, navegación al footer e Inicio y errores JavaScript/consola. También cubren orientación, divergencia entre altura CSS y `innerHeight`, omisión de intro después de resize, narrativa de Sobre mí y cambio a movimiento reducido con limpieza de estados gráficos.

La recarga a mitad de página conserva la política existente: vuelve a Inicio y reproduce la intro. No se ha cambiado esa decisión de producto.

## Evidencia y estado

Las capturas y medidas previas y posteriores se conservan en `.local/mobile-audit/`. Las capturas de regresión se generan en `test-results/`, fuera del repositorio publicado. El cierre de esta auditoría registra los resultados finales por tamaño y motor.

La validación final se ejecuta sobre la compilación de producción servida en `http://127.0.0.1:5184`, mediante `TEST_BASE_URL`. Durante pruebas anteriores en desarrollo se observaron también peticiones de módulos Vite que agotaron el tiempo de espera; se distinguen de los resultados de la compilación distribuible.

### Resultados finales

| Viewport | Chrome | WebKit |
| --- | --- | --- |
| 320 × 568 | Aprobado | Aprobado |
| 375 × 667 | Aprobado | Aprobado |
| 390 × 844 | Aprobado | Aprobado |
| 393 × 852 | Aprobado | Aprobado |
| 430 × 932 | Aprobado | Aprobado |
| 768 × 1024 | Aprobado | Aprobado |
| 1440 × 900 | Aprobado | Aprobado |

- **20 pruebas responsive aprobadas:** siete tamaños y tres pruebas adicionales por motor (orientación/altura/recarga, intro/resize, Sobre mí/movimiento reducido). Las pruebas de los siete tamaños comprueban también ES/EN, consola, navegación, avance y retroceso y ausencia de desbordamiento horizontal.
- **45 regresiones existentes aprobadas:** Sobre mí, composición, líneas editoriales, Experiencia, introducción, continuidad con footer y descargas ES/EN. Resultados locales en `.local/mobile-audit/regression-results/`.
- **65 pruebas aprobadas en total sobre la compilación final.**
- `npm run typecheck` y `npm run check:architecture`: correctos; 96 archivos de ejecución alcanzables, contratos y capas válidos.
- `npm run build`: correcto. Permanece el aviso previo de chunks de más de 500 kB; no se modificó el sistema de compilación ni se añadieron dependencias.
- Se conservan las imágenes y el vídeo originales. Las capturas comparativas de escritorio previas a la distribución local de la fuente conservan idénticos píxeles en el mosaico final y en la entrada del valle; las pruebas de escritorio de la compilación final confirman guías, composición e interacciones.

## Archivos modificados

- `src/app/contexts/projects/presentation/graphics/project-reel.js`: geometría móvil, etiquetas, DPR, suavizado por tiempo y limpieza del fallback.
- `src/app/contexts/projects/presentation/project-reel.component.html` y `.css`: etiquetas asociadas y distribución móvil.
- `src/app/contexts/experience/presentation/experience.component.ts`: alturas medidas y visibilidad al terminar la apertura.
- `src/app/contexts/experience/presentation/graphics/experience-valley.scene.js`: encuadre adaptativo de retrato.
- `src/app/contexts/profile/presentation/about/about-story.component.ts`: altura real para el recorrido narrativo.
- `src/app/contexts/profile/presentation/hero/hero.component.css`: fondo extendido y espaciado en móviles bajos.
- `src/app/shared/motion/story-chapters.directive.ts` y `viewport-motion.service.ts`: refresh ante cambios reales y estabilidad durante el movimiento de las barras móviles.
- `src/app/shell/intro/cinematic-intro.component.css`: cobertura dinámica y encuadre de vídeo.
- `src/app/shell/navigation/navbar.component.css`: dimensiones táctiles.
- `tests/mobile-responsive.spec.js`, `playwright.mobile.config.js` y `package.json`: regresiones en dos motores y comando de validación.
- `src/app/shared/assets/fonts/`, `src/main.ts` e `index.html`: distribución local de la misma fuente y su precarga.
- `README.md`, `docs/assets.md` y este informe: instrucciones y resultados de la auditoría.

## Validación manual pendiente

WebKit automatizado en Windows no es Safari ejecutándose en un iPhone. Sigue pendiente comprobar en un dispositivo físico la apertura/cierre real de las barras, notch y áreas seguras, gestos con inercia, autoplay bajo modo de bajo consumo y recuperación de GPU después de pasar a segundo plano. La simulación de alturas reproduce el desacuerdo geométrico, pero no sustituye esa prueba física.

## Seguimiento: continuidad Intro → Hero e Inicio → Sobre mí

Se inspeccionaron fotogramas a 8,65, 9,5 y 9,98 segundos del vídeo original. El MP4 mide 1280 × 720 y la fotografía floral original 1672 × 941. Son recursos distintos: representan la misma flor con pequeñas diferencias de composición. El vídeo móvil se encuadraba en el viewport dinámico, centrado; el fondo del Hero usa una altura estable que puede ser menor y un punto focal de 72%. Por ello, dos reglas `cover` no garantizaban continuidad.

En el final natural de la intro móvil se registra suavemente el rectángulo y el punto focal del vídeo con los del fondo real del Hero. Después se completa la disolución sobre el PNG original, copiando también el degradado, se mantiene esa imagen y se retira la capa de introducción. El texto comienza después. No se sustituyeron el vídeo ni la flor; la última imagen visible de la intro utiliza exactamente el recurso y encuadre del Hero. La ruta de finalización de escritorio conserva su comportamiento anterior.

El temblor al terminar Inicio → Sobre mí estaba relacionado con una limpieza manual de `transform` al abandonar el pin. ScrollTrigger necesita ese desplazamiento para mantener la continuidad de la posición después de liberar el elemento; la limpieza competía con su propio control del pin. Se retiró la escritura manual y se comprueba avance y retroceso alrededor del punto de salida.

Se añadió el enlace «Desliza para explorar / Scroll to explore», con destino a Sobre mí y aparición después de la construcción del Hero en móvil, tablet y escritorio. Su representación visual sigue la referencia posterior: contorno fino de mouse y flecha violeta animada hacia abajo; el texto traducido se conserva para lectores de pantalla. En teléfonos ocupa el centro de la fila de enlaces; en tablet y escritorio queda centrado debajo, con espacio reservado para evitar superposiciones. Con movimiento reducido la flecha queda estática.

Archivos de este seguimiento: `cinematic-intro.component.ts`, `story-chapters.directive.ts`, `hero.component.html`, `hero.component.css`, `language.service.ts`, `tests/cinematic-continuity.spec.js`, `playwright.mobile.config.js` y `docs/features/intro.md`.

Las pruebas específicas cubren 375, 390, 393 y 430 px en Chrome y WebKit, con comparación del rectángulo, imagen, posición, escala y capturas rasterizadas antes de las anotaciones. También verifican la liberación continua del pin en 390 y 1440 px y el enlace de scroll ES/EN. Las capturas y medidas quedan en `.local/intro-continuity/mobile-results/`.

También se corrigió `vite.config.js`: el observador de desarrollo detectaba los HTML de auditorías y trazas y emitía recargas completas de página, reiniciando la intro. Se excluyen `.local/`, `test-results/` y `playwright-report/`. Una comprobación con conexión HMR activa confirmó cero recargas al generar informes HTML en esas carpetas; evidencia en `.local/intro-continuity/dev-watch-verification.json`.

### Validación del seguimiento

- **32 pruebas de Chrome/WebKit aprobadas** y **45 regresiones generales aprobadas** sobre la compilación de producción: **77 en total**.
- Comparación visual de la última imagen visible de la intro y el fondo inicial del Hero en **375, 390, 393 y 430 px**: diferencia media de píxeles **0 en los ocho casos**. Se ocultaron únicamente las anotaciones para comparar el fondo; la transición y la geometría reales siguieron funcionando. Los JSON `frame-comparison.json` y las parejas PNG contienen la evidencia.
- Liberación y reversión del pin de Inicio → Sobre mí comprobadas en 390 y 1440 px en ambos motores, sin discontinuidad de posición al cruzar el final.
- Indicador de scroll ES/EN, entrada del texto, omisión de intro, cambios de orientación, movimiento reducido, rutas, partículas y descarga de CV comprobados por las suites.
- Tipos, reglas de arquitectura y compilación correctos. Se mantiene pendiente la comprobación física en Safari/iPhone descrita anteriormente.

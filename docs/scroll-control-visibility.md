# Visibilidad del scroll global en móvil

## Causa comprobada

Se reprodujo la transición Habilidades → Proyectos en 375, 390 y 430 px. El botón seguía en el DOM, dentro de `app-floating-controls`, hijo directo de `app-root`. Su host tenía `position: fixed` y `z-index: 21`; no dependía de los contenedores transformados de los capítulos.

La condición `cueVisible` consultaba `ViewportControlTargets.isClear(cue)`. El registro de obstáculos detectaba los textos de Proyectos dentro del rectángulo del botón y devolvía `false`. Angular aplicaba `.is-hidden`, cuyo CSS establece `opacity: 0`, `visibility: hidden` y `pointer-events: none`; también retiraba el botón del orden de tabulación. El botón de tema no aplicaba esa condición. La desaparición era una decisión de visibilidad del componente, no un fallo de carga del SVG ni de z-index.

## Corrección

- `floating-controls.component.ts`: la visibilidad global deja de depender del contenido y de la frontera Hero/About. Se mantienen las restricciones de intro, diálogo y menú abierto, así como el anclaje original del Hero y la acción de volver al inicio al terminar la página.
- `viewport-control-targets.ts`: se elimina el registro de obstáculos y sus IntersectionObservers. El caché conserva únicamente las superficies que determinan el contraste. Una superficie con opacidad cero, como la copia retirada del paisaje de Experiencia, no puede cambiar el icono a un color incorrecto.
- Se conservan CSS, geometría, animación del indicador, botones, textos, retícula y escenas. Fuera del Hero, ambos controles mantienen el mismo borde inferior y distancias simétricas a los extremos del viewport.

## Validación

`tests/global-scroll-navigation.spec.js` recorre Inicio → Sobre mí → Habilidades → Proyectos → Experiencia → Servicios → Contacto con anchos de 375, 390 y 430 px, emulación de iPhone y DPR 3, en tema claro y oscuro. Muestrea fotogramas durante el desplazamiento, comprueba identidad del nodo, visibilidad, orden de tabulación, recepción de toques, alineación y cambio de altura del viewport. Incluye el paso de Experiencia hacia Servicios en sentido inverso al orden del documento. Las capturas se toman en los límites de cada sección.

La prueba anterior que esperaba que el icono desapareciese sobre el título de Proyectos se actualizó en `tests/mobile-audit.spec.js`: ahora exige que siga visible y accesible.

Resultado: 3 recorridos completos en Chrome y 3 en WebKit aprobados, además de 11 comprobaciones de regresión en móvil y escritorio (anclaje del Hero, retorno al inicio, identidad de canvas, modal, ES/EN y movimiento reducido). También aprobaron `typecheck`, la validación de arquitectura y la compilación AOT de producción. El límite del recorrido WebKit se amplió de 90 a 240 segundos porque la ejecución con DPR 3 agotaba el límite inicial; no se redujo la cobertura ni se desactivaron animaciones.

Diagnóstico y capturas antes/después: `.local/scroll-controls/before/` y `after/`. Resultados y límites de sección: `.local/scroll-controls/chrome/` y `webkit/`. WebKit se prueba en Windows mediante Playwright, no en un iPhone físico.

Abrir [la comparación antes/después](../.local/scroll-controls/comparison.html) o [la galería de límites de sección](../.local/scroll-controls/screenshots.html).

No se publicó el cambio en Vercel.

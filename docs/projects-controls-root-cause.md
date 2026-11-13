# Projects: desaparicion de los controles flotantes

Fecha: 2026-11-12.

## Reproduccion comprobada

En Chrome a 1108 x 758 px, colocando el separador de navegacion de Projects a la altura de los botones:

- Scroll: rectangulo x=10, y=654, ancho=44, alto=60.
- Tema: rectangulo x=1054, y=670, ancho=44, alto=44.
- Ambos estaban libres de contenido (`isClear: true`) pero fallaban `isWithinSurface` al coincidir con una linea editorial. El resultado era la clase `is-hidden` y `visibility: hidden`.
- El problema no era el z-index, la carga de iconos, el fondo blanco ni el canvas. Era una decision de visibilidad tomada por el componente global.

Reducir el margen de deteccion a cero no resolvia la causa: las lineas continuaban clasificadas como obstaculos al atravesar el rectangulo del control. Las pruebas anteriores incluso esperaban esa ocultacion.

En movil tambien se detectaban como obstaculos los rectangulos completos del indice y de otros grupos, incluyendo padding y espacios sin enlaces.

## Correccion

- Se elimina la condicion `isWithinSurface` del scroll y del tema y su metodo/cache sin usos. Las reglas decorativas y los cambios de superficie no controlan la visibilidad.
- Los contenedores protegidos con enlaces o botones se resuelven a sus elementos interactivos y textos, en vez de bloquear todo el espacio vacio del grupo.
- Se conserva el recorte real de las tarjetas y la exclusion de regiones fijadas que ya estan cubiertas por otra escena.
- Cada boton tiene su propio IntersectionObserver para detectar contenido animado sin un sondeo continuo ni listeners de scroll adicionales.
- Se mantienen las protecciones por intro, modal/menu, final de pagina para el scroll y superposicion real con contenido protegido. No se modifican el carrusel, la reticula ni la ubicacion de los controles.

Archivos: `src/app/shell/controls/floating-controls.component.ts` y `viewport-control-targets.ts`; regresiones en `tests/floating-controls.spec.js` y documentacion de controles.

## Validacion

- 11 casos correctos: Projects/Experience en movil y escritorio, controles cerca y sobre las reglas de About, cruce de ambas reglas de navegacion de Projects a 1108 x 758 y 1440 x 900 en ES/EN, teclado, tema oscuro, scroll y modales; contencion general de 320 a 1920 px.
- TypeScript, arquitectura y compilacion correctos. Permanece el aviso previo de bundles superiores a 500 KB.
- Capturas del antes: `.local/projects-controls-diagnostic-1108.png` y `-390.png`.
- Capturas del despues: directorio `.local/projects-utilities-root-cause/`, archivo `projects-controls-on-editorial-rule.png`.
- Validacion en Chrome responsive; no sustituye una comprobacion fisica de Safari/iPhone.

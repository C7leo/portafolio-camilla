# Auditoria de contencion y controles

Fecha: 2026-11-12. Alcance: About/tecnologias, Hero, Projects y controles globales. Sin cambios de paleta, tipografia, recursos florales ni dimensiones del nombre.

## Hallazgos comprobados antes de modificar

| Problema | Componente / causa | Correccion |
| --- | --- | --- |
| Capsulas cortadas y guias sobre iconos | `AboutStoryComponent`: `.marquee-rows` ocupaba 390/768/1440 px completos, mientras las guias estaban a 24/40/120 px. El recorte sucedia en el viewport y las guias globales quedaban dentro de la franja animada. | Apertura `.container` entre guias, mascara suave local y calculo de las repeticiones usando el ancho real de esa apertura. |
| Indicador cercano al texto del Hero | `FloatingControlsComponent`: usaba el viewport y la posicion de About; no existia un espacio del Hero que definiera su ubicacion. | Dos anclas responsive mutuamente excluyentes en el layout: fila inferior en escritorio y columna central entre enlaces en movil. Un solo boton sigue sus coordenadas. |
| Controles del carrusel sin contencion | `ProjectShowcaseComponent`: barra absoluta sobre la misma superficie de las tarjetas; sin fila reservada, fondo de grupo ni borde. | Escenario y barra en filas de un grid. Grupo semantico delimitado, con botones de 44 px y espacio para el foco. |
| Indicador sobre Harmonix / Projects | La visibilidad global comprobaba solo el contenido restante y modales. En la medicion movil, el indicador ocupaba y=746..800 mientras el panel terminaba en y=784. | El indicador solo se presenta contenido en Hero o About. Se oculta en Projects, Experience y footer, y ante colisiones o dialogos. |
| Tema cruzando limites | El boton fijo solo muestreaba el color bajo su centro. En movil ocupaba y=756..800, cruzando el limite del panel situado en y=784. | Posicion fija estable. Visibilidad contextual segun su rectangulo completo, limites de superficies, reglas editoriales y contenido importante. Al desaparecer sale tambien de la navegacion por teclado. |
| Limites falsos durante transiciones | Hero sigue fijado detras de About: conserva un rectangulo aunque la escena entrante ya lo cubra. | La comprobacion usa la region pintada bajo el control y descarta obstaculos de las escenas cubiertas. |
| Distribucion en ventanas bajas | El nombre, CTA y espacios generosos podian empujar la nueva reserva del indicador fuera del viewport. | Se compactan los espacios verticales en escritorio de poca altura, conservando el espacio de 28 px entre micro-CTA y linea. No se modifica el tamano del nombre. |

La salida de una capsula por una apertura animada es necesaria para mantener el movimiento infinito; la mascara evita el corte abrupto y deja las guias fuera del contenido legible. Con movimiento reducido se conserva la lista estatica completa.

## Archivos de implementacion

- `src/app/contexts/profile/presentation/about/about-story.component.html`, `.css`, `.ts`: apertura del marquee, ancho de repeticion y declaraciones de contenido protegido.
- `src/app/contexts/profile/presentation/hero/hero.component.html`, `.css`: anclas y distribucion responsive.
- `src/app/contexts/projects/presentation/project-showcase.component.html`, `.css`: fila propia para los controles, semantica y eliminacion de la regla de foco duplicada.
- `src/app/shell/controls/floating-controls.component.ts`, `.html`, `.css`: estado y posicion de los controles.
- `src/app/shell/controls/viewport-control-targets.ts`: cache de superficies, regiones pintadas, limites y obstaculos.
- `src/app/contexts/experience/presentation/experience.component.html` y `src/app/shell/footer/footer.component.html`: declaraciones de limites/contenido; sin modificar sus animaciones.
- `src/app/shared/i18n/language.service.ts`: nombre ES/EN del grupo de controles.

## Estrategia y ciclo de vida

`src/app/app.component.ts` declara las regiones de los capitulos mediante `data-control-region`. `data-control-boundary` identifica limites de superficies y `data-control-avoid` contenido que los controles deben respetar. Las reglas editoriales existentes tambien se consideran limites. Esto evita dispersar coordenadas particulares de cada tarjeta en el shell.

Se conserva el listener pasivo de scroll y su actualizacion agrupada en un frame. El cache se renueva al cambiar el DOM; no se busca toda la pagina en cada scroll. Un IntersectionObserver restringido al area del boton de tema detecta tarjetas transformadas que entren en ella sin sondear permanentemente la animacion. Se mantienen las comprobaciones diferidas para escenas con scrub.

Se liberan observers, listeners, temporizadores y frames al destruir los componentes. El ResizeObserver del marquee mide su contenedor real. No se agregaron dependencias, z-index altos, recortes globales ni offsets CSS negativos. El video y el motor de Projects conservan su pausa fuera de pantalla y limpieza existentes.

## Validacion

Las pruebas de contencion cubren 320x568, 390x844, 768x1024, 1440x900 y 1920x1080: geometria entre guias, repeticion simetrica y pausa del marquee, contencion de controles, ocultacion en limites y recuperacion del tema sin cambiar su posicion.

Se actualizan las expectativas obsoletas que exigian mostrar la flecha en Projects y se acota el selector del video cinematografico para distinguirlo del video del mar. Se mantienen las pruebas de traducciones, enlaces reales, teclado, tema persistente, movimiento reducido y transiciones.

Las comprobaciones de navegador se ejecutan en Chrome con viewports responsive; no equivalen a una prueba fisica de Safari/iPhone.

Resultados finales:

- `npm run typecheck`: correcto.
- `npm run check:architecture`: correcto; 103 archivos alcanzables, sin infracciones de capas ni recursos de runtime huerfanos.
- `npm run build`: correcto. Permanece el aviso previo de chunks superiores a 500 KB; esta correccion no incorpora librerias.
- Casos de contencion: 5/5 correctos, de 320 a 1920 px.
- Regresiones verificadas: Hero/CTA, posicion contextual, ES/EN, navegacion del carrusel, foco/dialogos, tema claro/oscuro, persistencia, restauracion antes de Angular, almacenamiento bloqueado, movimiento reducido y transiciones Home/About.
- Continuidad cinematografica movil: comparacion del encuadre entre introduccion y Hero correcta a 390 px.
- Los selectores de pruebas se ajustaron al estado visible de los controles y a las URLs con timestamp de Vite. No se eliminaron comprobaciones funcionales para ocultar fallos.

Archivos de validacion/documentacion: `tests/layout-containment.spec.js`, `tests/floating-controls.spec.js`, `tests/cinematic-continuity.spec.js`, `playwright.mobile.config.js`, este informe y `docs/features/floating-controls.md` / `docs/features/projects.md`.

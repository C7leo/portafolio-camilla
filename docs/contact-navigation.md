# Contacto: transición lateral de cubrir

La navegación de los botones «Hablemos» (Hero y Servicios), Contacto del navbar y Conversemos del pie comparte `ContactNavigationService` a través de `ContactLinkDirective`.

Por preferencia de diseño, se sustituye el recorrido vertical por una transición de diapositiva: Contacto entra desde la derecha y cubre la vista actual hacia la izquierda en 720 ms, con `power3.inOut`. La sección anterior permanece en su posición hasta que Contacto termina de cubrirla. No se muestran las secciones intermedias.

Se anima el componente real `app-contact-form`, sin clonarlo, moverlo a otro padre, generar una imagen de su contenido ni duplicar campos. Un placeholder conserva temporalmente su espacio original. El componente se presenta fijo al viewport, con su fondo negro y el margen del navbar, por debajo de los controles globales. El título y los campos se preparan con los callbacks existentes de `ViewportMotionService.revealWithin`: quedan legibles desde el inicio del deslizamiento, sin combinar la transición de cubrir con una segunda entrada borrosa. Este acabado marca esas entradas como completadas una sola vez; la entrada original al llegar mediante scroll manual se mantiene.

Cuando el panel cubre todo el viewport se actualiza el scroll del documento detrás de él, se sincronizan los ScrollTriggers existentes y se restaura el flujo normal en la misma tarea. Se retiran el placeholder, los estilos temporales y los listeners. Así se puede seguir haciendo scroll por Contacto y el pie sin un modal ni una pantalla independiente. La posición final utiliza `SectionPositionService`, el mismo cálculo del navbar: la etiqueta editorial queda 16 px bajo su borde inferior, sin dejar contenido de la sección anterior.

Los clics repetidos no reinician la animación. Escape, rueda, gesto táctil o cambio de tamaño completan la cubierta; otro enlace o la navegación del historial la cancelan y limpian. Movimiento reducido produce navegación inmediata. El foco llega a la sección, no automáticamente a un campo; si el visitante ya está interactuando con un campo durante la entrada se conserva su foco. Se mantienen los clics modificados del navegador.

No se cambian el diseño, las fuentes, las animaciones de las demás secciones ni el envío de Formspree. No se agregan dependencias ni se activa la capa del regreso al inicio.

## Verificación

`tests/contact-navigation.spec.js` verifica Hero y Servicios en 375, 390, 430 y 1440 px, la cubierta a mitad de recorrido, ausencia de scroll vertical mientras entra el panel, identidad y unicidad del formulario, clics repetidos, llegada estable, foco, movimiento reducido y limpieza al presionar Escape. Las capturas están en `.local/contact-cover/`. Para obtener fotogramas atómicos se controla únicamente el reloj de Playwright; no se modifican los estilos ni las posiciones de la aplicación desde las pruebas.

Vista previa de producción local: `http://127.0.0.1:5198/`. No se publica en Vercel sin autorización.

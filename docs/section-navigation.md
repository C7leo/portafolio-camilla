# Posicionamiento de la navegación

## Causa del desfase

Los enlaces del navbar delegaban el movimiento al anchor nativo. Este alineaba el
contenedor exterior con márgenes independientes: 84 px en Sobre mí, Servicios y
Contacto; 90 px en Proyectos; 92 px en Experiencia y 96 px añadidos al main por
StoryChapters. Esos márgenes dejaban parte del capítulo anterior en pantalla.
Además, cada composición tiene su propio espacio interior antes del encabezado;
alinear su contenedor no equivale a encuadrar su entrada visual.

Experiencia añade otro caso: su introducción utiliza una línea de tiempo fijada
con ScrollTrigger. El contenido posterior y los descendientes sticky/animados no
representan el inicio de esa introducción. Contacto tenía además un cálculo
independiente para confirmar el destino después de su transición lateral.

## Corrección

- `SectionPositionService` mide el navbar real y los marcadores visuales. Las
  entradas editoriales de Proyectos, Servicios y Contacto quedan a 16 px bajo el
  navbar, descontando el padding de la etiqueta. No se modifican los espacios de
  las composiciones ni sus alturas durante el scroll manual.
- Inicio vuelve al origen del documento. Sobre mí conserva su primera escena a
  pantalla completa. Experiencia utiliza el `start` de `experience-image-zoom`
  cuando está disponible, conservando la introducción monumental y su narrativa.
- `SectionNavigationService` centraliza los enlaces internos a las seis secciones,
  actualiza la ruta sin activar un segundo salto nativo, espera el render del
  catálogo y refresca los pins antes de medir. El desplazamiento utiliza GSAP
  durante 850 ms, con actualización de ScrollTrigger y asentamiento de sus scrubs
  al llegar. Movimiento reducido utiliza posicionamiento inmediato.
- Contacto mantiene el efecto lateral de cubrir de 720 ms sobre el formulario
  real. El panel y el documento comparten la misma geometría de llegada. No hay
  duplicación del formulario ni cambios en Formspree.
- Una nueva navegación cancela la anterior; rueda, gesto táctil o teclas de
  desplazamiento permiten recuperar el control. Se respetan los clics modificados,
  enlaces externos y descargas. La llegada conserva un destino de foco accesible
  sin enfocar automáticamente los campos del formulario.
- Los destinos se miden de nuevo durante la navegación. Resize, imágenes y fuentes
  recalculan una llegada que sigue estacionada; el scroll manual libera ese
  seguimiento. La navegación atrás/adelante y las URLs de sección usan el mismo
  cálculo. La política previa de recarga que reinicia la introducción se conserva.
- El navbar determina la sección activa con esas mismas entradas y no confunde
  el panel fijo de Contacto, durante la transición, con una sección ya alcanzada.
- Se retiraron los márgenes individuales y la modificación del main. El fallback
  nativo comparte `--header-reserve` en `styles.css`. La flecha del Hero también
  reutiliza la navegación central hacia Sobre mí.

## Validación reproducible

`tests/section-navigation.spec.js` comprueba los anchos 375, 390, 430, 768, 1366 y
1920 px en ambos temas; recorre las seis entradas, vuelve tras scroll manual y
genera capturas de cada composición. Incluye todos los pares origen/destino,
resize, historial, retorno desde el detalle de proyecto, navegación interrumpida,
URLs directas y movimiento reducido.

`tests/contact-navigation.spec.js` conserva la comprobación del panel a mitad de
recorrido, la identidad del formulario, el borrador, Escape y movimiento reducido,
con el nuevo encuadre compartido.

Las capturas y resultados locales están en `.local/section-navigation/` y
`.local/contact-cover/`. Las pruebas WebKit emulan el motor y el viewport móvil;
no sustituyen una comprobación en un iPhone físico. No se publica en Vercel.

Resultado sobre la compilación local de producción (16/11/2026):

- Chrome: 8 pruebas de navegación aprobadas, incluidos los seis anchos y todos
  los pares de secciones; capturas en `production-chrome/`.
- WebKit: 5 pruebas aprobadas, con 375, 390, 430 y 1366 px en ambos temas,
  además de movimiento reducido y enlace directo; capturas en `webkit/`.
- Contacto: 18 pruebas aprobadas de transición y formulario en
  `contact-regression/`. Las respuestas de Formspree se simulan para probar
  validación, duplicados, éxito, errores y timeout sin enviar mensajes reales.
- TypeScript, revisión de arquitectura y compilación/prerender aprobados.

Vista de revisión: `http://127.0.0.1:5198/`.

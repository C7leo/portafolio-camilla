# Rediseño editorial de Contacto

Se implementó el brief del adjunto `f65caf8c-bc86-4c5a-8dd3-9c13f967c3c8`. La carpeta recibida solo contenía texto; no había una imagen disponible para una comparación visual directa. La composición se contrastó con las especificaciones escritas: negro, título monumental único, tarjeta lima superpuesta, formulario integrado y botón negro.

## Composición y tipografía

Se verificaron `src/styles.css`, la precarga de `index.html` y los dos archivos WOFF2 de `shared/assets/fonts/urbanist.css`. La familia original es Urbanist variable, con pesos 400–800. Contacto conserva esa familia: título 600, subtítulo y botón 500, texto y campos heredados. No se añadieron fuentes ni dependencias.

La sección mantiene el negro del portafolio `#000000`, letras blancas y líneas editoriales. La tarjeta usa exactamente `#E2F4A6`, esquinas rectas, padding responsive y un ancho máximo de 800 px sobre una retícula máxima de 1200 px. El título se escala con `clamp()`, sin estirar las letras. La tarjeta se eleva sobre su franja inferior mediante margen negativo controlado: 10 px en móviles y hasta 44 px en escritorio. La superposición ocupa menos del 30% de la altura del título. Su lado derecho coincide con el de la retícula.

El formulario conserva campos, identificadores, `email`, honeypot, validación y estados originales. Solo se reorganizó la presentación. El botón negro conserva 48 px de alto, texto blanco, flecha diagonal, estado de envío y foco accesible. El área de mensaje pasa a cuatro filas proporcionales. Los errores permanecen oscuros sobre lima en ambos temas.

`RevealDirective` revela título, tarjeta y contenido con duraciones breves y retardos moderados. No se cambiaron la directiva, las escenas de GSAP, el navbar ni los tokens globales. El título no se duplica. No hay imágenes, canvas, vídeos ni decoraciones dentro de Contacto; el pie posterior conserva su diseño independiente.

## Validación

Las mediciones preliminares en 375, 390, 430, 768, 1024, 1440 y 1920 px dieron cero desbordamiento horizontal. Los límites reales de las letras se midieron con `Range` tras cargar las fuentes. Todos quedaron dentro de la retícula. Ver `.local/contact-editorial/geometry.json` y las capturas de `preview/`.

Resultado final: 34 comprobaciones aprobadas: 19 en Chrome (7 tamaños, 8 casos de envío y 4 de continuidad), 7 tamaños en WebKit, 3 tamaños sobre el bundle AOT local y 5 regresiones de rendimiento. Estas últimas conservan autoplay, prioridad de recursos, HTML legible sin JavaScript, caché y recuperación de chunks. La compilación y la comprobación de arquitectura también aprobaron. WebKit se ejecutó en Windows; no sustituye una prueba en iPhone físico.

[Abrir las capturas del diseño](../.local/contact-editorial/gallery.html) o la [vista previa local](http://127.0.0.1:5198/#contacto).

`tests/services-contact-responsive.spec.js` comprueba esos siete anchos, ambas apariencias, color, familia tipográfica, superposición, alineación, área táctil, ausencia de medios y llegada desde Hablemos. `tests/contact-form.spec.js` conserva las comprobaciones del contrato de envío con respuestas interceptadas; no se repitió un mensaje real por un cambio exclusivamente visual. El envío real anterior ya fue aceptado por Formspree y confirmado por la propietaria en Formspree y Gmail.

## Rendimiento

No se agregaron librerías, fuentes, imágenes ni scripts externos. El bundle principal pasa de 211,48 kB (59,23 kB gzip) a 212,18 kB (59,48 kB gzip): unos 250 bytes gzip adicionales de presentación. Se mantienen chunks diferidos, prerender y optimizaciones existentes. Esto verifica el coste de descarga, no equivale a una medición Lighthouse nueva.

No se publicó ningún cambio en Vercel.

Los estados interactivos posteriores se documentan en [microinteracciones de Contacto](contact-microinteractions.md): líneas de foco, relleno de cápsula, indicadores de carga/éxito y stagger ligero sin cambios al contrato de Formspree.

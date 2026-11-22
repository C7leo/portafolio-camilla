# Microinteracciones de Contacto

La tarjeta lima, Urbanist, la retícula y las proporciones se mantienen. El servicio de Formspree, endpoint, validaciones, antispam y control de duplicados conservan su implementación.

## Campos

Cada control tiene un wrapper `.field-control`: el borde inferior existente responde al hover en 240 ms y una línea de foco se despliega desde la izquierda en 260 ms, aumentando visualmente de 1 a 2 px. Se anima `scale` sobre el mismo borde inferior, sin variar la geometría del campo ni medirla en JavaScript. La línea también acompaña el redimensionado nativo del textarea. La etiqueta cambia de color sin desplazarse. Al salir del campo, el efecto se revierte. Los errores conservan texto, asociación `aria-describedby`, `aria-invalid` y foco; la línea y la etiqueta toman el color de error.

El marco violeta provenía de `input:focus-visible, textarea:focus-visible` en el CSS del propio componente. Se sustituye únicamente en estos campos por la línea inferior persistente de 2 px, también con teclado y movimiento reducido; no depende de ver la animación para percibir el foco. Los select comparten los mismos estilos si se incorporan al formulario. Los outlines de botones y enlaces se conservan. En táctil, el foco activa la misma línea y el botón admite compresión al presionar; el hover se limita a dispositivos compatibles.

## Botón

La cápsula negra mantiene texto blanco y cambia suavemente a violeta (`--violet`, #5A4EFF) al hacer hover, enfocar con teclado o presionar. Solo se transiciona el color de fondo, con la misma duración de color que el navbar. Se eliminan el relleno deslizante, el desplazamiento de flecha y la compresión; se conserva el indicador de foco y la geometría del botón.

Las etiquetas normal, enviando y enviado comparten una celda CSS Grid. Todas participan en el cálculo del ancho aunque solo la actual sea visible, evitando saltos de dimensión sin listeners ni medidas JS. El nombre accesible del botón refleja el estado real, mientras las copias visuales y los iconos son decorativos para lectores de pantalla.

Durante el envío se muestra un spinner integrado y se conserva el bloqueo de controles existente. Solo el estado `success` existente, establecido después de la confirmación de Formspree, activa el check y «Mensaje enviado». Los errores nunca activan ese icono. La confirmación accesible existente se mantiene en su región `role=status`.

## Aparición

Se añade la variante `rise` a `RevealDirective`: solo opacity y translate de 8 px, con duración de 400 ms. La variante `focus` que usan las otras secciones conserva sus valores originales.

Título Hablemos, descripción, cuatro campos y acciones tienen retrasos de 0, 65, 130, 195, 260, 325 y 390 ms. Cada entrada se ejecuta una sola vez por instancia con el IntersectionObserver compartido existente; no se reinicia con las señales del formulario, la escritura o el scroll de retorno. El servicio conserva la revelación inmediata de ancestros al enfocar con teclado.

Con movimiento reducido, las entradas son inmediatas, no hay desplazamiento de etiqueta/flecha ni compresión, y el spinner queda estático con la etiqueta «Enviando…». Se conservan los cambios de color y el estado accesible.

## Verificación

`tests/contact-microinteractions.spec.js` comprueba hover, foco, escritura, desenfoque, compresión, ancho estable en los tres estados, éxito y fallo interceptados, stagger único, scroll, movimiento reducido y tap móvil. Las demás regresiones de envío y los siete anchos siguen en `contact-form.spec.js` y `services-contact-responsive.spec.js`.

No se enviaron nuevos mensajes reales por un cambio visual: las respuestas de estas pruebas se interceptan. El recorrido real de Formspree a Gmail ya fue confirmado por la propietaria durante la integración original. No se agregaron dependencias ni se publicó en Vercel.

Resultado final: 37 comprobaciones aprobadas: 15 regresiones de formulario/responsive en Chrome, 6 interacciones en Chrome, las mismas 6 en WebKit y 10 comprobaciones sobre la compilación AOT local (interacciones y continuidad). Typecheck, arquitectura y build/prerender también aprobaron. Las capturas están en `.local/contact-micro/`; la vista previa de producción local permanece en `http://127.0.0.1:5198/#contacto`.

## Corrección del foco rectangular

La revisión posterior reemplaza la regla violeta de los campos por la línea inferior persistente descrita arriba. Pasaron 14 pruebas de formulario/microinteracciones en Chrome y 3 pruebas de foco, movimiento reducido y tacto en WebKit sobre la compilación AOT actualizada. El build y prerender aprobaron. Capturas y resultados de esta corrección: `.local/contact-focus/`. WebKit se ejecuta en emulación; no equivale a una prueba en un iPhone físico. Los escenarios de Formspree siguen interceptados, sin nuevos mensajes reales.

# Contacto con Formspree

El formulario integrado precede al cierre del portafolio. Su diseño editorial usa fondo negro, un único título monumental «CONTACTO» en Urbanist 600 y una tarjeta rectangular `#E2F4A6` alineada a la derecha y parcialmente superpuesta al título. La tarjeta contiene «Hablemos», el texto de colaboración y el formulario, con botón negro y texto blanco. No incorpora imágenes, nuevas fuentes ni decoraciones. En móvil la tarjeta ocupa el ancho de la retícula y los campos se apilan. Los controles usan Urbanist a 16 px, etiquetas permanentes, líneas negras, foco de teclado y altura táctil mínima de 48 px. La escena floral del pie y las demás secciones conservan su implementación.

El título, la tarjeta y su contenido reutilizan `RevealDirective` con entradas breves y escalonadas. La superposición es parte del flujo CSS, sin offsets de JavaScript ni alturas fijas; el cambio de viewport no exige recalcular una posición de animación. El movimiento reducido y la entrada mediante teclado conservan la revelación inmediata del sistema existente. El servicio de Formspree y sus reglas de envío no cambiaron con este rediseño.

## Envío y estados

`shell/contact/ContactFormComponent` recoge nombre completo, `email`, asunto opcional y mensaje. Valida campos obligatorios, correo y límites de longitud antes de enviar. `profile/application/ContactFormService` hace un POST HTTPS a `https://formspree.io/f/xjgvpygp` con `Accept: application/json`, sin cookies ni redirecciones. El endpoint es un identificador público, no una credencial.

El formulario bloquea sus controles durante el envío y descarta intentos duplicados. Solo presenta éxito al recibir una respuesta HTTP satisfactoria con `ok: true`. Entonces limpia los campos y enfoca el estado de confirmación. Los errores conservan el borrador en los controles actuales, permiten reintentar e incluyen validación del servidor y límite HTTP 429. Una espera superior a 30 segundos cancela la petición local y muestra que no se pudo confirmar el envío, sin reintentar automáticamente. Al destruir el componente se cancela su petición. No se guardan mensajes ni correos en localStorage o sessionStorage.

Los mensajes de interfaz están traducidos a ES/EN. `ContactLinkDirective` enlaza Hero, Servicios, el CTA del pie y Contacto del navbar al mismo formulario mediante una transición lateral de cubrir, con foco al completar; respeta movimiento reducido y los clics modificados del navegador. El foco se coloca en la sección, nunca automáticamente en sus campos. Véase [Navegación hacia Contacto](contact-navigation.md).

## Privacidad y spam

Se retiraron el módulo y la variable de WhatsApp, su comprobación de compilación y el enlace mailto. También se eliminaron las entradas obsoletas del entorno local y el archivo local exportado para Vercel. El formulario no necesita ni publica el teléfono o el Gmail de la propietaria. Los CV descargables sustituyen el Gmail por la URL de Contacto; sus dos versiones mantienen dos páginas y el contenido profesional.

No se desactivaron protecciones en Formspree. Se incluye `_gotcha` como honeypot oculto, según la [documentación oficial](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering/). La configuración antispam y de notificaciones de la cuenta queda a cargo del endpoint existente. No se instala un SDK ni se incrustan claves privadas. Si en el futuro se exige un CAPTCHA explícito en el cliente, debe integrarse con una clave pública propia sin desactivar la protección del formulario.

## Verificación

Se hizo un solo envío real autorizado desde el formulario local:

- Referencia: `PORTFOLIO-FORMSPREE-20261115201653`.
- Respuesta HTTP 200: `{"next":"/thanks?language=es","ok":true}`.
- El visitante permaneció en el portafolio y apareció la confirmación.
- Remitente de prueba: una dirección de ejemplo, sin datos personales.

Evidencia local: `.local/formspree/live-submit.json` y `live-submit.png`. La respuesta confirma la aceptación del endpoint. La propietaria confirmó que la misma referencia aparece en Formspree y que recibió la notificación en Gmail. Así queda comprobado el recorrido de extremo a extremo, con la comprobación privada realizada por la propietaria, sin compartir credenciales ni exponer el Gmail.

`tests/contact-form.spec.js` intercepta las demás peticiones para comprobar validación, campos enviados, bloqueo de duplicados, éxito, errores HTTP 422/429/500, red, timeout y reintento. `tests/services-contact-responsive.spec.js` verifica 375, 390, 430, 768, 1024, 1440 y 1920 px en ambos temas, acceso desde Hablemos, área táctil, privacidad y ausencia de overflow. No se envían mensajes reales en las pruebas automatizadas. La auditoría del rediseño actual está en [Contacto editorial](contact-editorial.md).

Validación inicial de la integración: 55 comprobaciones aprobadas: 14 de formulario/diseño en Chrome, 14 en WebKit, 20 regresiones de Hero/Servicios/continuidad y 7 sobre el paquete AOT de producción servido localmente. Typecheck, arquitectura (131 archivos alcanzables) y build/prerender también aprobaron. WebKit es automatización en Windows, no una prueba sobre un iPhone físico. Los dos PDF se extrajeron para comprobar que no contienen Gmail personal ni teléfono móvil peruano y sí contienen la URL del formulario.

Galería de capturas reales del viewport: [Contacto en móvil, tablet y escritorio](../.local/formspree/gallery.html). Incluye el inicio del formulario y la zona de envío en ambos temas, sin ocultar controles globales ni desactivar las animaciones.

Vercel usa `npm run build`; ya no necesita la antigua configuración de contacto por WhatsApp. No se publicó ningún despliegue. Las variables obsoletas que pudieran existir en el dashboard de Vercel se pueden retirar: el código ya no las consume.

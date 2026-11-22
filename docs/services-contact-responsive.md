# Contacto responsive

El diagnóstico anterior identificó que el CTA podía faltar en el HTML publicado porque su renderizado dependía de una configuración externa de WhatsApp. La distribución móvil del botón ya existía: debajo del título, alineado a la izquierda, con 20 px de separación y 44 px de altura mínima.

La integración actual sustituye ese destino por el formulario de Formspree. El mismo botón se renderiza siempre y navega a `#contacto`, con scroll suave y foco accesible. No hay dependencias de un teléfono, enlaces a WhatsApp ni una comprobación de compilación asociada a ese servicio. El archivo local que contenía el destino antiguo se retiró.

La composición conserva el título «Hagamos realidad tu próxima idea.», el botón lima, la flecha diagonal y la distribución de escritorio. Las seis resoluciones siguen cubiertas por `tests/services-contact-responsive.spec.js`; ahora se comprueba también la llegada al formulario y sus temas claro y oscuro.

Consulta [la integración actual de Formspree](formspree-contact.md) para el comportamiento de envío, la privacidad y la validación. Las capturas antiguas de `.local/services-contact/` solo documentan la investigación histórica y no son instrucciones para configurar el contacto actual.
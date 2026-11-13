# Auditoría responsive y Safari iOS

Rama: `fix/mobile-layout`. No se publican cambios ni se crean commits durante esta auditoría.

## Diagnóstico previo a la implementación

| Problema | Componente y archivos | Causa comprobada / alcance | Corrección prevista |
|---|---|---|---|
| Hero móvil desproporcionado | `profile/presentation/hero/hero.component.css`, navbar y tokens | A 390×844 y 440×956, el Hero termina a 768 px: el límite de 680 px más la reserva de 88 px ignora la altura disponible. En móvil se añaden dos espacios mínimos de 64 px. No hay overflow horizontal en las seis resoluciones iniciales. | Compartir la reserva real del encabezado, usar la altura estable disponible sin el límite de 680 px y hacer proporcional el espaciado móvil. Conservar nombre, imagen, enlaces y CTA. |
| Blanco después del bloque lima | `about.component.css`, `about-story.component.css` | El espacio no pertenece a un pin: se suman 56 px inferiores de `.editorial-scene` y 40 px superiores del marquee móvil. Las transformaciones del manifiesto pueden variar temporalmente su distancia visual. | Reducir únicamente esa separación móvil de 96 a 56 px, conservando las tres frases y la transición del manifiesto. |
| Iconos convertidos en emoji | Hero y `project-showcase.component.html` | `✳` aparece dentro del texto de la cinta; `↗` se usa en el CTA y dos enlaces de Projects. Su aspecto depende de la fuente de símbolos/emoji del sistema. | SVG monocromáticos en las plantillas. Separar el contenido traducible de los separadores gráficos, sin reemplazar ni reiniciar el track animado. |
| Tema desaparece | `shell/controls/floating-controls.component.ts`, `viewport-control-targets.ts` y estilos de contenido | Los controles ya viven fuera de los capítulos transformados. La causa reproducida es `themeVisible = !blocked && isClear(themeBox)`: la caja de 44 px entra en una guía lateral de solo 24 px. Se oculta sobre Skills/Servicios a 390 px y sobre Projects en otros tamaños. | Mantener el tema disponible salvo intro/modal/menú y reservar un espacio interior para su área táctil, sin mover las guías. El indicador conserva la ocultación intencional ante contenido protegido y su retorno al inicio. |
| Safe areas / Safari | `index.html`, `styles.css`, navbar y controles | El viewport no incluye `viewport-fit=cover`; el control solo incorpora el inset inferior y no los laterales. Los límites de visibilidad se comparan con `clientHeight`, sin considerar los límites del viewport visual. | Unificar tokens de safe area y reserva del encabezado; respetar el viewport visual y los insets laterales sin añadir listeners de scroll duplicados. |
| Línea vertical en Experience | `experience.component.ts/.css`, retícula y preview | En Chrome no se ha reproducido el parpadeo de la captura. Hay una abertura inicial de 1.5 px y capas sticky/transformadas cuya composición se está contrastando en WebKit. No se atribuye todavía el fallo a una de ellas. | Identificar la capa en las capturas WebKit y modificar únicamente su ciclo de visibilidad/composición; conservar ambas guías y los recorridos BCP/BanBif. |
| Projects y Servicios | Componentes existentes | La galería y las tarjetas respetan la retícula en las medidas iniciales; los controles pueden invadir sus márgenes estrechos. | Conservar radios, arrastre, tarjetas y CTA. Reservar el margen interactivo y comprobar las transiciones completas. |

Evidencia inicial: `.local/mobile-audit/before/` y `.local/mobile-audit/before-webkit/`. Resoluciones: 1920×1080, 1366×768, 768×1024, 390×844, 440×956 y 375×667. WebKit se instaló en `.local/browsers` porque la instalación compartida de Windows estaba incompleta. Se usaron los certificados del sistema, sin desactivar TLS.

## Implementación y hallazgos adicionales

- Hero: comparte la reserva del navbar, ocupa `100svh` con el encabezado y conserva el tamaño del nombre. Los dos gaps móviles pasan de 64 px a un rango proporcional de 24–48 px. En 390×844 su borde inferior pasa de 768 a 844 px; en 440×956, de 768 a 956 px. En 375×667 sigue terminando a 667 px.
- About: el espaciado móvil estable después del manifiesto pasa de 96 a 56 px. No se eliminan pins ni etapas del relato. Las mediciones inmediatas durante la entrada del manifiesto no representan su posición final: deben contrastarse con la captura una vez asentada la animación.
- SVG: la cinta contiene texto traducible y separadores gráficos separados; las flechas de los proyectos y del micro-CTA también son SVG. Se conservan el track y su animación al cambiar de idioma/tema.
- Utilidades: el tema no depende ya del detector de colisiones. Un token de espacio interior, derivado de los 44 px táctiles y del margen lateral, protege el contenido estrecho sin mover las guías. El indicador conserva sus colisiones y solo usa la posición central mientras su ancla sigue visible dentro del Hero.
- La revisión visual adicional encontró textos fuera del registro de obstáculos: el encabezado y título de Projects, el encabezado del marquee y los textos editoriales de About/Experience. Se marcaron con el atributo existente `data-control-avoid`. La prueba coloca el título de Projects debajo del indicador, confirma que este se oculta y comprueba que reaparece al encontrar espacio libre. No se añaden offsets de layout ni otro detector.
- Pintado del tema: se reprodujo un segundo fallo a densidad 3×, después del recorrido largo de Experience. El SVG conservaba caja, trazo y visibilidad correctos, pero sus píxeles desaparecían. Se contrastaron capas independientes: transformar el wrapper del icono no lo resolvió; dar al botón una capa propia mediante `translateZ(0)` sí. La prueba compara los píxeles del icono antes y después del scroll, en Chrome y WebKit.
- Experience: las capas transparentes de la abertura ahora terminan con `visibility: hidden`; el backdrop saliente se retira al completar su salida y reaparece al invertir el mismo timeline. Esta corrección de ciclo de visibilidad está comprobada. **No demuestra que sea la causa del parpadeo vertical reportado en Safari iOS**, que no se reprodujo de forma concluyente aquí.
- Safe areas: viewport con `viewport-fit=cover`, tokens compartidos y límites del viewport visual. Se reutilizan los listeners existentes y todos se eliminan en `ngOnDestroy`; no se añade otro listener de scroll ni un bucle de sondeo.
- WhatsApp: se conserva `VITE_CONTACT_WHATSAPP`, el mensaje y la apertura segura. Cuando falta la variable en el entorno de compilación, los enlaces no se renderizan; la ausencia del CTA en un despliegue sin esa configuración no se corrige inventando un número ni incrustándolo en el código.

## Validación y límites

Capturas y medidas posteriores: `.local/mobile-audit/after/`. Las pruebas dedicadas guardan Home, Projects y la salida de Experience en `.local/mobile-audit/final-results/`; el título libre de superposiciones queda también en `.local/mobile-audit/cue-results/`. Estos artefactos locales están excluidos de Git.

La prueba `tests/mobile-audit.spec.js` recorre todas las secciones en las seis resoluciones y comprueba visibilidad, área táctil dentro del viewport, recepción de clics, ausencia de overflow, SVG y cambios de tema. Además comprueba la retirada/reaparición de las capas de Experience y el pintado del icono a densidad 3×.

Resultados:

| Validación | Resultado |
|---|---|
| `npm run typecheck` | Correcto. |
| `npm run check:architecture` | Correcto: 105 archivos alcanzables, sin dependencias entre capas inválidas. |
| `npm run build` | Correcto. Persiste la advertencia previa de tamaño de chunk; no se añadieron paquetes. |
| `git diff --check` | Correcto. |
| Regresiones Chrome | 74 casos distintos aprobados: controles, micro-CTA, cinta, contención, Servicios, intro, giro de pantalla, lectura ES/EN, arrastre y tema de Projects. |
| Controles WebKit | 24 casos aprobados: posicionamiento, persistencia, recarga, retorno con blur, movimiento reducido y conservación del canvas. |
| Auditoría dedicada Chrome/WebKit | 18 casos distintos aprobados: seis resoluciones por motor, capas reversibles de Experience, SVG a densidad 3× y protección del título de Projects. |

Se actualizaron las expectativas antiguas de la cinta, que aún pedían los símbolos Unicode, y la comprobación del toolbar para medir el centrado vertical cuando su etiqueta ocupa varias líneas. En la prueba nueva de recuperación del indicador se corrigió el punto de comprobación: debe reaparecer sobre el espacio vacío de entrada, no encima de una tarjeta que se mueve. Ambos motores aprobaron esa repetición (`.local/mobile-audit/cue-tests.log`). El lote anterior de 66 casos conserva en su log la ejecución con esa expectativa antigua: 65 aprobados y un fallo después corregido y repetido. No se presenta ese lote como una ejecución de 66 aprobados.

**WebKit automatizado en Windows no equivale a Safari en un iPhone real**: no reproduce su barra dinámica, GPU ni safe areas físicas. El parpadeo exacto de la línea de Experience y el comportamiento con las barras reales siguen requiriendo esa validación; no se presentan como fallos confirmadamente resueltos.

No se crearon commits, PR ni despliegues. No se modificaron la configuración privada de WhatsApp ni las dependencias.

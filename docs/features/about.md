# About: narrativa centrada y composición editorial

La sección empieza con el relato en inglés, centrado en un ancho máximo de 820 px, con Urbanist de 36–48 px en escritorio y una escala menor en móvil. Después presenta el retrato original a la izquierda y, a la derecha, el título existente, el proyecto, los dos textos personales y la pieza lima. Las fotografías mantienen su proporción natural. Las demás secciones y la navegación conservan sus archivos.

## Organización

- `about.component.html`, `.css`, `.ts`: composición editorial, fotografías e inputs existentes. Proyecta su contenido dentro de `AboutStoryComponent`.
- `about-story.component.html`, `.css`, `.ts`: relato inicial, transición compartida y marquee.
- `about-story.data.ts`: el texto y las dos listas de tecnologías (8 y 7 elementos).
- `about-horizon-bloom.component.ts`: montaje Angular y fallback visual del horizonte.
- `about-horizon-bloom.scene.js` y `.d.ts`: shader, interacción y liberación de recursos Three.js.

## Scroll y accesibilidad

Las frases pasan por `LanguageService` antes de dividirse en palabras. Una se?al calculada actualiza el texto, el idioma y la etiqueta accesible al cambiar ES/EN. Los p?rrafos conservan su identidad, por lo que la timeline mantiene la frase activa y el progreso del scroll.

Una timeline con `scrub: .65` reemplaza las tres frases en la misma celda centrada y suaviza los cambios de scroll. Cada escena conserva una pausa de lectura y se desvanece con un desenfoque de hasta 10 px y 8 px de desplazamiento ascendente. La siguiente entra lentamente desde abajo, recuperando nitidez con un breve solapamiento entre ambas. Se fija únicamente la escena narrativa durante 4,2 alturas de pantalla en escritorio y 3,6 en móvil; una franja de 84 px respeta el navbar existente. El recorrido es reversible.

Después, una segunda timeline continua coordina la salida del texto y del lirio, la máscara vertical del retrato, el desplazamiento del proyecto y la aparición final de la pieza lima. En móvil su recorrido se adapta a la altura de toda la composición. Las fotografías permanecen en el flujo normal. No hay entradas independientes con `appReveal` ni un cierre lima de pantalla completa.

Los contextos de `gsap.matchMedia()` limpian estilos y ScrollTriggers, incluso al cambiar las preferencias. La transición también se mantiene en ventanas de menos de 560 px de alto. Con movimiento reducido, el relato y las fotografías se presentan legibles en flujo normal. Si la inicialización de la animación falla, se revierten las mejoras y queda el contenido estático.

El marquee conserva los bucles en direcciones opuestas, los iconos locales, la aceleración suave al hacer scroll, la pausa y la detención fuera de pantalla. Sus copias están ocultas para lectores de pantalla. Con movimiento reducido, las tecnologías se distribuyen en filas estáticas ajustadas al ancho disponible.

## Horizon Bloom original

El fondo se construye localmente con un shader de Three.js y no depende de React Bits Pro ni de una licencia. La superficie blanca del planeta se integra con el fondo y deja visible un arco amplio y fino: el borde usa `#EEA0FF`, el airglow incorpora sutilmente `#E2F4A6` y el amanecer se concentra cerca del centro.

Three.js se carga de forma diferida y el render limita el DPR a 1,5. El horizonte permanece visible desde el inicio, el puntero desplaza suavemente la curvatura aparente y el scroll la mueve unos pocos píxeles. IntersectionObserver y la visibilidad del documento detienen los frames fuera de pantalla o en segundo plano.

Con movimiento reducido se desactivan la animación y la interacción, conservando el amanecer completo en un frame estático. Si WebGL no está disponible, queda un fallback de gradientes. Al destruir el componente se cancelan frames, listeners y observadores, y se liberan geometría, material y renderer.

## Verificación

```powershell
$env:TEST_BASE_URL='http://127.0.0.1:5173'
npx.cmd playwright test tests/about-story.spec.js --workers=1
npm.cmd run build
```

Las pruebas cubren el orden inicial, el tamaño y centrado del texto, el revelado reversible, la composición y transición editorial, las fotografías originales, navegación entre About y Projects, el marquee, movimiento reducido y los anchos 320/390/768/1024/1920 px. La carga y destrucción del renderer también se comprueban con una geometría de prueba que no forma parte de los assets del portafolio.

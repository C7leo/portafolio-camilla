# Sistema visual del portafolio

El portafolio usa una composición editorial compartida: superficies blancas y negras, una retícula con márgenes comunes y acentos de identidad reservados para controles y detalles. La portada y el cierre comparten una superficie clara; servicios y experiencia aportan contraste.

## Fundamentos

- `--font-body`: Urbanist para lectura e interfaz; `--font-display`: Impact con alternativas condensadas para los títulos de mayor jerarquía; `--font-mono`: metadatos y etiquetas técnicas.
- Blanco y negro predominan. Violeta `#5A4EFF` indica interacción y foco; lima `#E2F4A6` y fucsia `#EEA0FF` aparecen como acentos.
- `.container` y `--editorial-rail-inset` comparten el ancho de contenido y se adaptan a tablet y móvil. `--space-section`, `--radius-media` y `--ease-editorial` definen ritmo, medios y transición.
- Las superficies adaptables usan las variables semánticas de tema. Las portadas clara y oscura mantienen colores propios para preservar el contraste.

## Composición y movimiento

La portada combina nombre y retrato; la historia mantiene su narrativa progresiva; los proyectos combinan galería interactiva y mosaico; los servicios usan paneles oscuros; la experiencia conserva el recorrido y su modo de lectura; el cierre reúne contacto y CV. Los detalles de retícula se alinean a los mismos márgenes.

Se mantienen las preferencias de movimiento reducido y los controles existentes para pausar o simplificar las animaciones. Las imágenes de proyectos se contienen en sus marcos para no recortar capturas panorámicas.

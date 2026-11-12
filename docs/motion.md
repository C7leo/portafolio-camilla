# Movimiento y ciclo de vida

El movimiento se implementa en presentación y en `src/app/shared/motion/`. Los modelos y repositorios de dominio no dependen de GSAP, Three.js ni del navegador.

## Escenas activas

- **Introducción y Hero:** `shell/intro/` presenta el vídeo original; `shared/motion/cinematic-intro-state.service.ts` coordina fin, omisión y fallback con el Hero de Perfil. El nombre y los metadatos mantienen su entrada y salida existentes.
- **Sobre mí:** la narrativa de tres frases y la transición editorial usan sus timelines de GSAP/ScrollTrigger. El horizonte es un renderer de presentación; el marquee conserva sus direcciones opuestas, pausa e iconos.
- **Proyectos:** `contexts/projects/presentation/graphics/project-reel.js` implementa el recorrido Three.js y su fallback. El modal y la vista por hash conservan sus rutas, selección y retorno de foco.
- **Experiencia:** una timeline reversible coordina el valle, la frase inicial, BCP, BanBif y el flash blanco final. La apertura muestra el mismo paisaje mediante una copia del canvas; la cuadrícula compartida permanece estable. El contenido profesional se mantiene centrado.
- **Footer:** `RevealDirective` utiliza Web Animations API para sus revelados existentes sobre el fondo floral con degradado blanco. La sección sigue directamente a Experiencia.

## Coordinación compartida

`ViewportMotionService` comparte observación de visibilidad, preferencias y actualizaciones de scroll. `StoryChaptersDirective` coordina las transiciones entre las secciones activas. `ScrollEffectDirective` controla la salida del Hero. El estado de la introducción se comparte con el Hero para evitar entradas duplicadas.

Las escenas y directivas liberan observers, listeners, timelines y recursos gráficos al destruirse. Los renderizadores detienen el trabajo fuera de pantalla, con el documento oculto o cuando el progreso se estabiliza. Las preferencias `prefers-reduced-motion`, los fallos de WebGL y los tamaños cortos mantienen alternativas legibles.

Las pruebas en `tests/` verifican reproducción/omisión de la introducción, scroll reversible, narrativa ES/EN, pausa del marquee, alineación del contenido, rutas de proyectos, continuidad con el footer y fallbacks. La reorganización de carpetas conserva los archivos de renderizado y los recursos multimedia sin modificar sus bytes.
# Recursos visuales publicados

Los archivos se agrupan por el módulo que los utiliza:

- profile/hero/: gato original del Hero.
- profile/about/: mundo y tres ilustraciones de prácticas.
- profile/contact/: gato original de contacto.
- projects/gallery/: gato cósmico y dos capturas del prototipo de trazos.
- career/stickers/ y career/photographs/: stickers originales y fotografías institucionales. Créditos en career/photographs/README.md.
- capabilities/illustrations/ y capabilities/logos/: las seis ilustraciones y logos de herramientas. Orígenes en capabilities/logos/README.md.
- data-story/video/, stages/, stickers/ y masks/: MP4 optimizado, seis fotogramas de respaldo, gato y máscara de integración.
- shared/brand/: logo de navegación. El favicon conserva la ruta convencional /favicon.svg.

Todas las ilustraciones entregadas por Camilla conservan sus bytes, colores, proporciones y transparencia originales. La reorganización no modifica los archivos gráficos.

Las dos capturas de trazos muestran una interacción ilustrativa anterior del portafolio, no una aplicación académica completada ni resultados terapéuticos. Se capturaron a 2000 × 1400 y DPR 2 en Chrome con movimiento reducido. El script scripts/capture-study.mjs conserva ese procedimiento histórico; requiere la interfaz anterior .exercise-content, retirada de la página actual.

El video fuente se conserva fuera de esta carpeta, en resources/data-story/03_video-original.mp4. scripts/prepare-data-video.mjs genera la versión optimizada y los seis WebP publicados.

La limpieza retiró cinco copias idénticas y una variante de sticker sin uso. El inventario y los criterios están en docs/assets.md. tests/assets.spec.js verifica que todos los recursos publicados tengan consumidores actuales y respondan como imágenes o video.

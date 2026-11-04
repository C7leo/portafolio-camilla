# Organización y limpieza de imágenes

Los recursos de presentación se organizan en `public/assets` con los mismos nombres de módulo que `src/modules`. Los archivos de marca compartidos pertenecen a `shared`; las imágenes no se mezclan con los datos de dominio.

Se actualizaron rutas literales y dinámicas en HTML, JavaScript y CSS, además de pruebas, scripts y documentación. Se conservaron los nombres de las imágenes originales. La comparación SHA-256 confirmó que cada imagen, máscara y video trasladado conserva exactamente sus bytes.

## Archivos retirados

| Ubicación anterior | Motivo |
| --- | --- |
| `public/01_mundo.png` | Copia idéntica de la ilustración de About conservada |
| `public/01_ing_software.png` | Copia idéntica de la ilustración de About conservada |
| `public/01_datos_gobierno.png` | Copia idéntica de la ilustración de About conservada |
| `public/01_aprendizaje_continuo.png` | Copia idéntica de la ilustración de About conservada |
| `public/Gato cósmico neón en órbita.png` | Copia idéntica del gato de proyectos conservado |
| `public/assets/03_gato_asombrado-3.png` | Variante sin referencias en el código; se conserva el sticker activo |

Estas seis imágenes sumaban 8.89 MB. El original `public/03_video.mp4` se trasladó a `resources/data-story/03_video-original.mp4` para conservarlo sin incluir otros 2.22 MB en el sitio publicado. El MP4 optimizado y los seis WebP de respaldo siguen disponibles en el módulo `data-story`.

No se retiraron los fotogramas de movimiento reducido, las máscaras CSS, los logos de categorías no seleccionadas inicialmente ni las capturas de proyectos. Todos tienen consumidores actuales.

## Validación

`npx playwright test tests/assets.spec.js --workers=1` recorre las seis categorías, recoge las imágenes actuales, los posters, el video, la máscara CSS y el favicon. Compara esas referencias con todos los archivos multimedia publicados y verifica respuestas HTTP con tipos `image/*` o `video/*`, evitando falsos positivos del fallback HTML de Vite.

Las pruebas de cada sección validan además las rutas nuevas, los fallos de carga, los cambios de idioma y el video reversible. `npm run build` reconstruye `dist` a partir de la estructura limpia.

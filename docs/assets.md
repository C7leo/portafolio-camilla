# Recursos

- `src/app/features/profile/presentation/home/assets/`: fondos WebP de 1280 y 1802 px, elegidos y precargados por ancho de pantalla.
- `src/app/features/profile/presentation/about/assets/`: imagen de About en variantes WebP de 384 y 530 px, seleccionadas con `srcset`.
- `src/app/features/projects/infrastructure/assets/`: variantes WebP de los proyectos.
- `src/app/shared/assets/`: logo y fuentes Urbanist en WOFF2, servidas localmente.
- `public/cv/`: PDF descargables en espa?ol e ingl?s.
- `design-assets/originals/`: originales editables; no se publican con la aplicaci?n.

`npm run images:optimize` regenera las variantes activas de Hero y About desde sus originales con Sharp y conserva la versi?n existente cuando ocupa menos. Las im?genes de proyectos usan `srcset`; la imagen del Hero se precarga y las im?genes fuera de pantalla usan carga diferida. Los recursos de `src` se generan con nombres versionados por Vite.

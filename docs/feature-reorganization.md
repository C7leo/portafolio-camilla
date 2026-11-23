# Organizaci?n por funcionalidades

Perfil, Proyectos y Experiencia est?n organizados en `src/app/features/` con capas de dominio, aplicaci?n e infraestructura. Las vistas de Inicio, Sobre m?, Servicios y Contacto est?n en `features/profile/presentation/`; las vistas de Proyectos y Experiencia permanecen junto a sus propios dominios. `core`, `shared` y `layout` contienen servicios globales y composici?n compartida.

La compilaci?n `npm run build` genera la aplicaci?n AOT y luego prerenderiza `dist/index.html`. El contenido est?tico puede leerse sin JavaScript; al iniciar, Angular reconstruye la interfaz interactiva. El carrusel y el efecto de ondas se descargan de forma diferida.

Se retiraron archivos y variantes antiguas que no pertenec?an al grafo activo. Los originales editables se mantienen en `design-assets/originals/`. `npm run check:architecture` valida las rutas, capas y recursos activos.

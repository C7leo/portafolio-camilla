# Recursos activos

Los archivos gráficos conservan su contenido original. Su ubicación expresa quién los utiliza:

- `src/app/shared/assets/night-lily.png`: fotografía compartida por Hero, introducción y footer.
- `src/app/shared/assets/logo.png`: logo del navbar y favicon.
- `src/app/shared/assets/fonts/`: Urbanist en WOFF2, pesos 400/500/700/800 y rangos Unicode originales, servida localmente. Incluye la licencia SIL Open Font License y las URLs de origen; sustituye la petición externa a Google Fonts.
- `src/app/shell/intro/assets/cinematic-intro.mp4`: vídeo original de entrada.
- `src/app/contexts/profile/presentation/about/assets/`: retrato y proceso de trabajo.
- `src/app/contexts/projects/infrastructure/assets/`: imágenes de Harmonix, SpotFinder, NutriSend, SmartCampus, Courtly, EduSpace y Veyra.
- `public/assets/skills/`: los trece SVG utilizados por el marquee de tecnologías. El nombre de esta ruta pública se conserva para mantener sus URLs. Las atribuciones y la licencia Devicon permanecen junto a los SVG.
- `public/cv/`: PDF en español e inglés que descarga el navbar.

Vite resuelve los recursos de `src` mediante `new URL(..., import.meta.url)` y `url(...)` en CSS. Los recursos públicos conservan sus URLs y usan `import.meta.env.BASE_URL` desde la aplicación. No hay referencias a las antiguas fotografías empresariales ni a los iconos del Contacto retirado.

Las escenas del horizonte, el valle y el carrusel son código de presentación; sus archivos `.d.ts` forman parte del contrato TypeScript. La reorganización no altera sus shaders ni sus movimientos.

Los PDF se generan desde los Markdown de `docs/career/` con `npm run cv:export`. El exportador utiliza Chrome mediante la dependencia de desarrollo Playwright; el sitio distribuido no necesita un navegador automatizado ni genera documentos en el cliente.

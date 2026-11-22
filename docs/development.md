# Desarrollo y validación

## Comandos

```sh
npm ci
npm run dev
npm run typecheck
npm run check:architecture
npm test
npm run build
npm run preview
```

El servidor de desarrollo usa Vite. Las pruebas arrancan o reutilizan `http://127.0.0.1:5183`; `TEST_BASE_URL` permite probar otra instancia. Chrome debe estar instalado para Playwright, exportar el CV y prerenderizar localmente. En Vercel, la construcción utiliza Chromium de `@sparticuz/chromium` sin servicios externos.

La instalación local usa Node 24.11.0. Las dependencias Angular 22.2.5 declaran compatibilidad con `^22.22.3`, `^24.15.0` o `>=26.0.0`; npm informa de esa diferencia. La reorganización mantiene las versiones Angular existentes y no cambia el runtime del equipo.

## Dependencias

- Ejecución: Angular, RxJS/tslib, GSAP, Three.js y Lucide.
- Construcción y auditoría: Vite, TypeScript, Angular compiler/compiler-cli, Babel linker, Lightning CSS, Sharp, Playwright, Chromium y Lighthouse.
- No hay un segundo framework de UI ni un procesador Tailwind/PostCSS configurado.

Desarrollo utiliza JIT para conservar el flujo de Vite. Producción compila las plantillas con Angular AOT, enlaza las bibliotecas Angular y elimina el compilador del navegador. Después genera HTML estático; el cliente arranca sobre ese contenido sin hidratación Angular. Consulta [rendimiento y Vercel](performance.md).

## Contenido y configuración

Crear un archivo `.env` local y configurar únicamente los destinos públicos de contacto que se quieran mostrar:

```dotenv
VITE_CONTACT_LINKEDIN=
VITE_CONTACT_GITHUB=
```

Las variables `VITE_*` quedan visibles en el navegador; no deben contener credenciales privadas. Los destinos vacíos se omiten. Tras editar el entorno, reiniciar Vite y reconstruir la versión publicada. `VITE_GA_MEASUREMENT_ID` está reservada para una integración futura; no activa seguimiento por sí sola.

El formulario de Contacto utiliza el endpoint público de Formspree configurado en `profile/application/contact-form.service.ts`. No requiere un número de teléfono, una dirección Gmail pública ni credenciales. Hero y Servicios llevan al formulario mediante enlaces internos. La integración anterior de WhatsApp y su comprobación de compilación se retiraron; ya no hace falta configurar esa variable en Vercel. Vercel conserva `npm run build` como comando de compilación. Ver [integración de Formspree](formspree-contact.md).

Los archivos `.env*`, la carpeta `.agents/` y `skills-lock.json` permanecen locales y están excluidos de Git. `.env.example` es la excepción versionable y solo contiene nombres de variables sin datos personales.

Las traducciones están en `src/app/shared/i18n/`. La selección ES/EN mantiene las claves de almacenamiento existentes y el PDF elegido en el navbar. No se necesita un sistema de traducciones adicional.

## CV

```sh
npm run cv:export
npm run build
```

Fuentes editables: `docs/career/CV_Camilla.md` y `docs/career/CV_Camila_Espinoza_ATS_EN.md`. Destinos: `public/cv/CV_Camilla_Espinoza.pdf` y `public/cv/CV_Camilla_Espinoza_EN.pdf`. El exportador conserva texto seleccionable, enlaces y estructura de una columna; comprueba y muestra el número de páginas. Los HTML de revisión y el registro se guardan en `.local/cv-exports/`.

## Evidencias y archivos generados

- `.local/`: auditorías, capturas y copias de recuperación locales. No se distribuyen con el sitio.
- `test-results/` y `playwright-report/`: resultados de pruebas, ignorados por Git.
- `dist/`: resultado de producción, regenerado por Vite.
- `node_modules/`: dependencias instaladas desde el lockfile.
- `.agents/` y `skills-lock.json`: configuración de herramientas del espacio de trabajo; no forman parte de la aplicación y se conservan.

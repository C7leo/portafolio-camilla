# Portafolio de Camilla Espinoza

Portafolio Angular standalone con TypeScript, Vite, GSAP y Three.js. El proyecto está organizado por dominios: Perfil, Proyectos y Experiencia, con presentación, servicios de aplicación, contratos e implementaciones de repositorio separados.

## Empezar

```sh
npm ci
npm run dev
```

Configura los enlaces públicos de contacto siguiendo `.env.example`. El idioma ES/EN, la introducción, los recorridos visuales, las rutas de proyectos y la descarga de CV forman parte de la aplicación existente.

## Organización

```text
src/app/
  app.component.ts       Composición de la página
  app.config.ts          Proveedores de repositorios
  contexts/
    profile/             Identidad, biografía y contacto
    projects/            Proyectos y referencias públicas
    experience/          Experiencia profesional
  shell/                 Navbar, introducción y footer
  shared/                Idioma, movimiento, cuadrícula y recursos comunes
public/
  assets/skills/         Iconos activos y sus licencias
  cv/                    PDF descargables en ES/EN
docs/
  career/                CV editables, credenciales y auditoría
  features/              Documentación de las escenas
scripts/                 Exportación de CV y comprobación de arquitectura
tests/                   Pruebas de navegador
```

Cada contexto de `contexts/` contiene `domain`, `application`, `infrastructure` y `presentation`. El dominio es TypeScript puro; `app.config.ts` conecta sus contratos con repositorios estáticos. Los componentes consultan servicios de aplicación.

## Validar

```sh
npm run typecheck
npm run check:architecture
npm test
npm run build
```

Las pruebas usan Chrome y arrancan o reutilizan el servidor local en el puerto 5183. `TEST_BASE_URL` permite comprobar otra instancia. La compilación de producción queda en `dist/`.

## Actualizar el CV

Las fuentes están en [CV_Camilla.md](docs/career/CV_Camilla.md) y [CV en inglés](docs/career/CV_Camila_Espinoza_ATS_EN.md). Después de editarlas:

```sh
npm run cv:export
npm run build
```

El exportador genera los PDF públicos con texto seleccionable usando Chrome. Consulta el [inventario de credenciales](docs/career/CERTIFICACIONES_COMPLETAS.md) y la [auditoría del CV](docs/career/AUDITORIA_CV.md) para la procedencia de la información y los datos pendientes.

## Documentación

- [Arquitectura y dependencias entre capas](docs/architecture.md)
- [Desarrollo, configuración y herramientas](docs/development.md)
- [Recursos gráficos y documentos públicos](docs/assets.md)
- [Informe de limpieza y archivos retirados](docs/cleanup.md)
- [Sistema visual](docs/design-system.md)
- [Idioma ES/EN](docs/i18n.md)
- [Cuadrícula editorial](docs/editorial-grid.md)

`.local/` conserva evidencias, auditorías y copias de recuperación; no forma parte del sitio publicado. `node_modules`, `dist` y los resultados de Playwright están ignorados por Git.
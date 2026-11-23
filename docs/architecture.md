# Arquitectura por dominios

El portafolio es una aplicaci?n Angular standalone. `src/app/app.config.ts` conecta contratos de dominio y repositorios est?ticos; `app.component.ts` compone las secciones.

```text
src/app/
  core/                       navegaci?n y tema compartidos
  features/
    profile/
      domain/                 modelos y contratos del perfil
      application/            consultas y env?o de contacto
      infrastructure/         repositorio est?tico y enlaces p?blicos
      presentation/           home, about, servicios y contacto
    projects/
      domain/ application/ infrastructure/ presentation/
    experience/
      domain/ application/ infrastructure/ presentation/
  layout/                     navegaci?n, controles y pie
  shared/                     idioma, movimiento, recursos y UI com?n
  shell/intro/                controlador de la cortina inicial
```

El dominio no depende de Angular ni de las implementaciones de almacenamiento. La presentaci?n consulta servicios de aplicaci?n; el layout puede componer componentes de presentaci?n. El carrusel de proyectos usa React mediante un puente cargado din?micamente; el efecto de ondas carga Three.js al interactuar. El HTML est?tico se genera despu?s de la compilaci?n AOT y Angular vuelve a inicializar el contenido en el navegador, sin hidrataci?n de servidor.

`npm run check:architecture` revisa dependencias, l?mites de capas y recursos alcanzables; `npm run typecheck` comprueba los contratos TypeScript. Los originales editables se conservan fuera del sitio en `design-assets/originals/`.

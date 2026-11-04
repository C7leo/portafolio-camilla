# Arquitectura por dominios (DDD)

El punto de entrada es `src/app/main.js`. La organización sigue los conceptos del portafolio y separa los datos de dominio de su representación en el navegador.

```text
src/
├── app/                         Composición y arranque del sitio
│   ├── main.js
│   ├── scenes.js
│   └── motion.js
├── modules/
│   ├── profile/                 Identidad, presentación personal y contacto
│   │   ├── domain/profile.js
│   │   ├── presentation/        Hero, About, Contact y sus estilos/animaciones
│   │   └── index.js
│   ├── career/                  Experiencia y formación
│   │   ├── domain/journey.js
│   │   ├── presentation/
│   │   └── index.js
│   ├── capabilities/            Herramientas, prácticas e intereses
│   │   ├── domain/technologies.js
│   │   ├── presentation/
│   │   └── index.js
│   ├── data-story/              Etapas de la transformación de datos
│   │   ├── domain/stages.js
│   │   ├── presentation/        Secuencia, video y visualizaciones
│   │   └── index.js
│   └── projects/                Galería y explicación de los proyectos
│       ├── presentation/        CardSwap adapter, vistas y diálogo
│       └── index.js
└── shared/
    ├── i18n/                    Cambio de idioma y traducciones
    └── presentation/            Navegación, estilos base, transiciones y UI común
        └── components/CardSwap/ Componente original sin cambios
```

Cada módulo define un límite funcional y expone su API mediante `index.js`. Los consumidores externos importan esa API; las referencias internas permanecen dentro del módulo. `app` coordina el montaje, los estilos globales y el ciclo de vida de las secciones. `shared` no depende de los módulos ni del arranque.

`domain` contiene únicamente contenido y conceptos propios del portafolio, sin DOM, React, GSAP ni estilos. `presentation` contiene los renderizadores HTML, controladores de interacción, animaciones, adaptadores de React y CSS. Las vistas de proyectos incluyen HTML editorial y por eso pertenecen a presentación. La implementación actual utiliza contenido local: no se añadieron repositorios, servicios ni carpetas de infraestructura vacías. Los casos de uso y adaptadores de persistencia podrán incorporarse dentro del módulo que los necesite si aparece lógica o una fuente de datos externa.

Los datos verificados se editan en `profile/domain/profile.js`, `career/domain/journey.js` y `capabilities/domain/technologies.js`. Los recursos visuales siguen los mismos límites funcionales bajo `public/assets/`: `profile`, `career`, `projects`, `capabilities`, `data-story` y `shared`. El video fuente está en `resources/data-story/`, fuera del contenido publicado. Véase [assets.md](assets.md).

Las visualizaciones de partículas y el prototipo de dibujo anteriores se conservaron junto a su módulo correspondiente. Permanecen fuera del montaje actual. El componente CardSwap original y su CSS conservan exactamente su contenido.

Ejecutar `npm run check:architecture` comprueba imports resolubles, independencia del dominio, dirección de dependencias de `shared` y uso de APIs públicas. `npm run build` valida el empaquetado. Las pruebas Playwright de secciones comprueban la navegación, los idiomas, los componentes y la reproducción del video tras la reorganización.

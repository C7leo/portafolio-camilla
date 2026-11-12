# Auditoría de contenido profesional y CV

Fecha de revisión: 2026-11-11. Documento principal: `CV_Camilla.md`, según la corrección expresa de la propietaria. El adjunto nombraba `CV_Camila_Espinoza_ATS.md`; ese archivo no se creó ni se utilizó como destino. La versión inglesa conserva el nombre de entregable solicitado: `CV_Camila_Espinoza_ATS_EN.md`.

## 1. Alcance y método

Se revisaron los archivos de contenido, componentes, traducciones, configuración pública de contacto, Markdown, documentación y estructura Angular del portafolio. Después se consultaron los enlaces originales de las siete organizaciones de proyectos, sus repositorios públicos, README, informes académicos, manifiestos y algunos workflows. Las páginas públicas de Coursera se comprobaron también mediante Chrome porque la respuesta HTML inicial solo mostraba «Loading…».

La evidencia se distingue así:

- **Contenido suministrado:** información del CV original y de las fuentes del portafolio. Es una declaración de la candidata, no una validación por parte de su empleador.
- **Evidencia pública del proyecto:** repositorios, código o informes del equipo. El stack del producto no demuestra por sí solo dominio individual ni experiencia laboral.
- **Aporte individual documentado:** atribución nominal en informes académicos; se usa para redactar la contribución y no para atribuir todo el producto a una sola persona.
- **Credencial comprobada:** nombre, titular y fecha visibles en la página pública del emisor o en el perfil de credenciales. No equivale automáticamente a certificación por examen.
- **Pendiente:** dato sin respaldo suficiente, información provisional o enlace sin comprobación de contenido.

Se hizo la auditoría antes de actualizar los CV. Se guardó una copia del original en `.local/cv-audit-2026-11-11/CV_Camilla.original.md`. Las respuestas públicas y evidencias auxiliares se conservaron en esa carpeta local.

## 2. Fuentes locales y estado real de las secciones

- `src/app/hero/hero.component.html`: marca Camilla Espinoza, Lima, Ingeniería de Software, desarrollo de aplicaciones y análisis de datos.
- `src/app/about/about.component.html` y `src/app/shared/i18n/language.service.ts`: propuesta de valor orientada a necesidades de negocio, software, analítica y mejora de procesos; experiencia en el sector financiero.
- `src/app/projects/data/projects.ts`: siete proyectos y sus enlaces a landing pages y organizaciones. Los arrays `technologies` están vacíos: no se utilizaron para deducir stacks.
- `src/app/experience/data/experience.ts`: BCP, 2026, Gobierno de Datos, Power BI, DAX, SQL, Python, Microsoft Fabric y GitHub; BanBif, 2025–2026, Mesa de Servicios TI, Aranda, Windows, redes e incidencias.
- `src/app/about/about-story.data.ts`: tecnologías declaradas en el marquee; no acredita nivel de dominio.
- `src/app/skills/data/skills.ts`: datos históricos de Habilidades. El componente ya no se renderiza en `app.component.ts`; Kubernetes aparece como icono/dato histórico y no se incorporó como experiencia al CV.
- `src/app/contact/data/contact.ts` y `.env`: correo y perfiles profesionales configurados para publicación. Se consultaron exclusivamente las variables públicas de contacto; no se trasladaron configuraciones internas al CV.
- `src/app/footer/*` y `src/app/app.component.ts`: el footer es ahora el destino Contacto, directamente después de Experiencia. La sección independiente de Contacto y Habilidades no se renderizan.
- `CV_Camilla.md` original: meses de empleo, modalidades, Power Query, Dataflows, Lakehouse, control de accesos, documentación, formación, idiomas y certificaciones declaradas.
- `README.md` y README por componente: algunos están desactualizados y mencionan el gato, Skills, Contacto independiente o una portada anterior. Para el estado visual se priorizó el código vigente. La documentación de animación no se convirtió en supuesta experiencia laboral.
- `package.json`, TypeScript y pruebas: sirven para entender el portafolio Angular/GSAP/Three.js, no para atribuir automáticamente React, PrimeNG u otras dependencias como competencias personales.

No hay una sección de certificaciones activa ni archivos de certificados en el proyecto local. Las primeras referencias recuperadas provienen del CV original; las adicionales se localizaron siguiendo sus enlaces públicos.

## 3. Contacto e identidad

- Correo recuperado: cleo.espivas@gmail.com. Coincide con la configuración pública actual y el perfil de datos del portafolio público anterior. No se envió ningún correo ni se comprobó la entrega del buzón.
- GitHub: https://github.com/C7leo — perfil público accesible; muestra Camilla Leonor Espinoza Vivas y fija repositorios de Harmonix, SpotFinder y EduSpace.
- LinkedIn: https://www.linkedin.com/in/camilla-leonor-espinoza-vivas-4ba5b2361/ — coincide entre configuración, perfil GitHub y documentación pública anterior. LinkedIn devolvió HTTP 999 al intentar leerlo: asociación corroborada, contenido del perfil no auditado directamente.
- Teléfono personal: no encontrado. El teléfono de la landing de SmartCampus es del producto académico y no se atribuyó a la candidata.
- URL pública actual del portafolio: no encontrada. El perfil GitHub y los metadatos de sus repositorios no declaran una homepage. https://github.com/C7leo/portafolio-camilla es un repositorio, no una URL de despliegue confirmada.
- El original escribe **Camila Leonor Espinoza Vivas**; el portafolio, GitHub, Google Skills y credenciales usan **Camilla** o una variante abreviada de ese nombre. Se normalizó la marca del CV como **Camilla Leonor Espinoza Vivas**, siguiendo las fuentes profesionales actuales. Confirmar la grafía legal antes de postular.

Fuentes de corroboración: https://github.com/C7leo y https://github.com/C7leo/portafolio-camilla . Se consultó el archivo `src/modules/profile/domain/profile.js` de la rama resuelta por la API; la evidencia descargada conserva la ruta consultada.

## 4. Experiencia profesional

### BCP

La web respalda las funciones generales de analítica, Power BI, modelos semánticos, integración y calidad de datos. El CV original añade Power Query, Dataflows, Lakehouse, documentación, repositorios y el inicio en febrero de 2026. Se conservaron esos datos como experiencia declarada por la candidata; no hay documentación pública del empleador que permita verificarlos de forma independiente.

Se usa el cargo de la web, «Practicante Preprofesional — Gobierno de Datos». La variante «Ingeniería y Software» del original y «Ingeniería de Software / Gobierno de Datos» del adjunto no se presentan como denominaciones contractuales verificadas. Se redactaron funciones en presente para el empleo actual, sin inventar automatizaciones desplegadas ni mejoras cuantificadas.

### BanBif

La web respalda incidencias, solicitudes, soporte y escalaciones mediante Aranda. El CV añade cuentas y accesos, documentación y estandarización de procedimientos. Se conservaron las fechas declaradas de agosto de 2025 a enero de 2026, compatibles con el periodo general 2025–2026 de la web.

Se eliminó la afirmación «reduciendo reprocesos manuales» porque no tiene una evidencia de resultado identificable. Se mantuvo la contribución concreta a procedimientos y atención de servicios TI. No se atribuyó administración avanzada de infraestructura ni certificación ITIL.

## 5. Proyectos y repositorios recuperados

Todos se clasificaron como **proyectos académicos**. La participación en un informe o repositorio de equipo no se trató como autoría exclusiva. Las siete landing pages originales devolvieron HTTP 200; sus cifras comerciales, testimonios y promesas de marketing no se trasladaron al CV.

### Harmonix

- Problema y solución: gestión de gastos compartidos en hogares; aplicación web.
- Stack contrastado: Vue.js en `FrontEnd/package.json`; C#/.NET y Entity Framework en `BackEnd/com.split.backend/com.split.backend.csproj`. MySQL está documentado en el informe; que existan otros drivers no demuestra uso de todas esas bases.
- Aporte nominal: arquitectura de información, autenticación, dashboards por rol, HouseHold e integración frontend/backend. El informe aporta más evidencia que el CV original, que se centraba en planificación.
- Repositorios: https://github.com/1ASI0730-2520-7432-G1-Harmonix/FrontEnd y https://github.com/1ASI0730-2520-7432-G1-Harmonix/BackEnd
- Informe: https://github.com/1ASI0730-2520-7432-G1-Harmonix/Report

### SpotFinder

- Problema y solución: búsqueda, reserva y gestión de estacionamientos con información de ocupación e integración IoT.
- Stack contrastado: Angular/TypeScript, Java/Spring Boot, MySQL y Flutter/Dart. Hay workflows de Azure en los repositorios web y backend; no equivalen a experiencia profesional administrando Azure.
- Aporte: diseño funcional y requisitos de rendimiento/seguridad declarados en el CV original. El perfil GitHub fija el backend, pero eso no prueba por sí solo un módulo individual. No se atribuye la implementación íntegra del sistema IoT.
- Repositorios: https://github.com/Emergentes-Trackmind/BackEnd-SpotFinder , https://github.com/Emergentes-Trackmind/FrontEnd-Web-SpotFinder y https://github.com/Emergentes-Trackmind/FrontEnd-Mobil-SpotFinder
- Landing corroborante: https://emergentes-trackmind.github.io/LandingPage-Trackmind/

### NutriSend

- Aplicación web de servicios nutricionales. Se evitó reducirla a pedidos de comida: la descripción de la web es más amplia.
- Stack: Spring Boot/Java y MySQL, contrastados en `nutrisend-platform`; Angular y la contribución a autenticación, perfil y navegación por plan están declarados en el CV. Se localizó además el repositorio personal `nutrisend-front-end`, cuyo README no documenta funcionalidades.
- Repositorios: https://github.com/Open-Source-SI729-2402-SV54/nutrisend-platform y https://github.com/C7leo/nutrisend-front-end
- Informe: https://github.com/Open-Source-SI729-2402-SV54/informe — incluye a Camila Leonor Espinoza Vivas entre los integrantes. No convierte automáticamente los aportes colectivos en individuales.

### SmartCampus

- Solución académica de gestión escolar. El backend contiene servicios/módulos de autenticación, cursos, gateway y calificaciones.
- Stack: Angular/TypeScript y Java/Spring Boot/MySQL, contrastados en los manifiestos. El frontend está dentro de una carpeta denominada `RocketNotes-Front_End-master`; se conserva el nombre real del repositorio, sin renombrarlo ni inventar otro.
- Aporte individual: implementación académica de microservicios y pruebas de componentes, según el CV original. No se encontró un informe nominal de contribuciones dentro de estos repositorios.
- Repositorios: https://github.com/SmartCampus-Grupo1-FundamentoArqui/lumina-smartcampus-backendV2 y https://github.com/SmartCampus-Grupo1-FundamentoArqui/lumina-samrtcampus-frontend
- Las cifras de descargas y opiniones de la landing no se utilizaron como resultados.

### EduSpace

- Aplicación web de reuniones educativas, desarrollada con Vue.js y C#/.NET; manifiestos corroboran esas tecnologías y MySQL.
- Aporte: formularios, selección múltiple y fechas/horas declarados en el CV; el informe público también atribuye a Camila participación en frontend, backend y mejoras de bounded contexts.
- Repositorios: https://github.com/FullStack-Fury/eduspace-frontend y https://github.com/FullStack-Fury/eduspace-platform
- Informe: https://github.com/FullStack-Fury/final-report

### Courtly

- Aplicaciones móviles para reservas de canchas y relación con entrenadores; backend Java/Spring Boot, cliente Flutter/Dart y aplicación Android/Kotlin.
- El informe identifica a Camilla por nombre y código de estudiante, asigna Reviews y Coaches y describe aportes móviles. Se incorporó esa contribución concreta. Los objetivos SMART del informe no se convirtieron en logros cumplidos ni en métricas del CV.
- Repositorios: https://github.com/UPC-1ACC0238-202610-3248-Courtly/backend , https://github.com/UPC-1ACC0238-202610-3248-Courtly/courtly_mobile_app y https://github.com/UPC-1ACC0238-202610-3248-Courtly/courtly_coaches_app
- Informe: https://github.com/UPC-1ACC0238-202610-3248-Courtly/REPORT

### Veyra

- Plataforma de coordinación de cuidados y comunicación entre residencias de adultos mayores y familias.
- Stack: Angular/TypeScript y Java/Spring Boot; repositorios con workflows de CI/CD. No se convirtió una lista de funcionalidades propuestas en funcionalidades realizadas por la candidata.
- Aporte nominal: configuración y documentación de integración continua, compilación y validación automática; revisión de historias/backlog. También se documenta una auditoría académica del sistema de otro equipo, que no se presentó como auditoría profesional de Veyra.
- Repositorios: https://github.com/upc-pre-1ASI0732-2610-16880-NovaTech/Veyra-Frontend-Application y https://github.com/upc-pre-1ASI0732-2610-16880-NovaTech/Veyra-Backend-Application
- Informe: https://github.com/upc-pre-1ASI0732-2610-16880-NovaTech/Veyra-Document-Report

## 6. Habilidades y límites de evidencia

- **Experiencia laboral declarada:** Power BI, DAX, Power Query, SQL, Python, Microsoft Fabric, Dataflows, Lakehouse y GitHub; Aranda, Windows, redes, accesos e incidencias.
- **Desarrollo académico documentado:** Angular, Vue.js, Java, Spring Boot, C#, .NET, JavaScript, TypeScript, APIs REST, MySQL, Git/GitHub y arquitectura de software. PostgreSQL figura en el CV y en dependencias de proyectos; no se afirma administración profesional.
- **Móvil:** Courtly y SpotFinder aportan evidencia de Flutter/Dart y Android/Kotlin en los productos académicos. Se retiraron las notas editoriales del CV, pero no se añadieron niveles de dominio ni años de experiencia.
- **Cloud/DevOps:** CI/CD tiene contribución nominal en Veyra y workflows públicos. Azure y Docker se conservan como fundamentos/conocimientos académicos; no como experiencia operando infraestructura empresarial.
- **Testing/gestión:** Postman, Selenium IDE, Scrum y Kanban están en el CV original. Los informes apoyan planificación, validación y pruebas; no se presenta Selenium como una suite profesional mantenida ni se infiere dominio por una dependencia.
- **Fuera del CV principal por falta de detalle o prioridad:** Kubernetes, SonarQube, pandas, Jira, Trello y SharePoint. Algunos aparecen en el CV original o datos históricos, pero no hay evidencia suficiente para determinar responsabilidades, alcance y nivel. La exclusión no significa que la candidata no los conozca; pueden reincorporarse con ejemplos verificables.
- No se añadieron React, todas las dependencias del portafolio, frameworks de prueba específicos o servicios cloud solo por aparecer en `package.json` o como ejemplos de documentación.

## 7. Certificaciones y formación

Las tres páginas Coursera originales se comprobaron mediante su contenido renderizado y muestran titular y fecha:

- Google Project Management — Google/Coursera — 2025-08-22: https://www.coursera.org/account/accomplishments/specialization/MC0Y8U0311NN
- Google IT Support — Google/Coursera — 2025-09-02: https://www.coursera.org/account/accomplishments/specialization/H1KHJVI7PX3Y
- Google UX Design — Google/Coursera — 2025-10-08: https://www.coursera.org/account/accomplishments/specialization/9COH4GTMYUY2

Se recuperaron también 20 URLs únicas de certificados de cursos asociados a esos programas y 16 insignias con nombre y fecha en el perfil Google Skills. El inventario completo registra los enlaces y evita contar como credenciales distintas el mismo certificado compartido entre programas. Estos certificados de programas/cursos y las insignias no se equiparan a certificaciones profesionales por examen como Google Cloud Professional o Microsoft Certified.

Perfil: https://www.skills.google/public_profiles/1bd83aee-9a16-48b0-ab92-a89a7c7cee7b . Solo se consultó el perfil público; no se accedió a Google Cloud Console ni a ninguna cuenta privada.

**Pendientes de verificación:** Generative AI Fundamentals (IBM, 2025), Google AI Essentials (Google/Coursera, 2026) y Scrum Fundamentals Certified (SCRUMstudy, 2023). No hay enlace individual suficiente en el proyecto. Las búsquedas no permitieron asociar de forma concluyente una credencial Credly a esta candidata. Se conservaron en el inventario como declaraciones del CV original, fuera de la selección principal. Ausencia de evidencia no se interpretó como falsedad.

## 8. Cambios de redacción y ATS

- Perfil encabezado por aportación profesional y experiencia bancaria; la carrera en curso aparece en Educación.
- Fechas laborales uniformes `AAAA-MM` y fechas de credenciales `AAAA-MM-DD`; sin fecha de graduación inventada. Una fecha provisional encontrada en una versión pública anterior no se trasladó al CV.
- Orden: nombre, especialidad, contacto, perfil, experiencia, habilidades, proyectos académicos, educación, certificaciones e idiomas.
- Una columna, encabezados convencionales, sin tablas, iconos, fotografías, gráficos ni barras de habilidades en los CV.
- Siete proyectos descritos brevemente, con stacks y repositorios concretos. No se inventó ningún enlace; al haber repositorios identificados no fue necesario usar `[Repositorio pendiente de verificar]`.
- Se quitaron notas editoriales y campos vacíos del documento principal. Los pendientes se centralizan en este informe.
- La adaptación inglesa diferencia internship, academic projects y credentials, sin traducir literalmente denominaciones ambiguas de cargos.
- No se añadió experiencia profesional cloud, dominio avanzado, resultados porcentuales ni responsabilidades adicionales no respaldadas.

## 9. Datos que requieren confirmación

1. Grafía legal del nombre completo: Camila frente a Camilla; se usa Camilla como marca actual corroborada.
2. Teléfono de contacto personal y URL pública actual del portafolio. No se inventaron ni se usaron teléfonos de landing pages de equipos.
3. Meses exactos de BCP y BanBif, vigencia del puesto actual, modalidad y denominación contractual del cargo. Los meses y modalidad provienen del CV original.
4. Alcance personal de SQL/Python/Fabric, automatizaciones realmente entregadas y uso laboral de Dataflows/Lakehouse; no se solicitan activos ni datos confidenciales de banca.
5. Contribución concreta a SpotFinder y SmartCampus y ejemplos de tecnologías declaradas solo en el CV. No se requiere ampliar el stack si no es relevante para la vacante.
6. Enlaces individuales y fechas de IBM, Google AI Essentials y SCRUMstudy; perfil Credly si existe.
7. Ciclo académico actual y fechas de estudios, solo si se desean añadir. No se afirma título obtenido ni graduación prevista.
8. Nivel práctico de herramientas complementarias excluidas y, si corresponde, evidencia de idiomas. Se mantuvieron los niveles declarados: español nativo, inglés intermedio y francés básico.

## 10. Validación de integridad y entregables

Entregables completados: `CV_Camilla.md`, `CV_Camila_Espinoza_ATS_EN.md`, `CERTIFICACIONES_COMPLETAS.md` y este informe.

- Revisión ATS: ambos CV incluyen las secciones exigidas, siete proyectos académicos sin duplicados, fechas consistentes y enlaces completos. No contienen tablas, imágenes, métricas inventadas ni notas editoriales pendientes. La información por confirmar se centraliza en la sección 9 de esta auditoría.
- Exportación comprobada: PDF A4 de **dos páginas por idioma**, una columna, tipografía Arial de 10 pt y márgenes de 12/13 mm. La extracción mediante `pdftotext` recupera nombre, empleos, siete proyectos, URLs y credenciales; son documentos de texto, no imágenes rasterizadas. Los enlaces y las descripciones de cada proyecto se mantienen juntos al paginar.
- Inventario: tres programas Google/Coursera comprobados; 20 URLs únicas de certificados de cursos asociados; 16 insignias Google Skills; tres credenciales declaradas pendientes. Los certificados de curso y las insignias no se confundieron con acreditaciones por examen.
- Integridad de la web durante la tarea de auditoría y CV: comparación SHA-256 de **123 archivos**, con **cero modificaciones** antes de la solicitud posterior del botón. Registro: `.local/cv-audit-2026-11-11/web-integrity-before-cv-button.json`.

### Solicitud posterior: botón de descarga en el navbar

Después de editar los Markdown, la propietaria solicitó expresamente añadir un botón junto a Contacto. Esta ampliación autoriza las siguientes modificaciones puntuales de la web, separadas de la auditoría del CV:

- `src/app/navbar/navbar.component.html`, `.css` y `.ts`: botón violeta, icono accesible en móvil, descarga nativa y selección del PDF según ES/EN.
- `src/app/shared/i18n/language.service.ts`: etiquetas «Descargar CV» y «Descargar CV en PDF» con sus traducciones.
- `public/cv/CV_Camilla_Espinoza.pdf` y `public/cv/CV_Camilla_Espinoza_EN.pdf`: exportaciones de las fuentes Markdown en español e inglés, respectivamente.

Se comprobaron diez descargas reales en Chrome: ES/EN en 320, 390, 768, 821 y 1440 px. Se verificaron nombre de archivo, respuesta HTTP 200, MIME PDF, dos páginas, etiquetas de accesibilidad del PDF, posición junto a Contacto, ausencia de desbordamiento y apertura/cierre del menú móvil. La compilación de producción pasó. No se cambiaron imágenes, escenas 3D, animaciones de scroll ni composición de las secciones.

Para regenerar los PDF tras editar el Markdown: `npm run cv:export`. La regeneración no es automática; actualizar el PDF antes de volver a publicar. El botón respeta `import.meta.env.BASE_URL`.


## Reubicación durante la reorganización del proyecto

Los cuatro documentos profesionales se trasladaron a `docs/career/` conservando sus nombres. Las referencias a archivos del código anteriores describen el estado auditado en ese momento; las rutas vigentes se documentan en `docs/architecture.md`. La herramienta mantenida para regenerar los PDF es `scripts/export-cv.mjs` (`npm run cv:export`). Las evidencias originales de `.local/cv-audit-2026-11-11/` se conservan como registro histórico.

## Orientación profesional solicitada posteriormente

La propietaria solicitó orientar ambos CV hacia ingeniería de datos, Data QA, ciencia de datos y arquitectura de software. Se actualizaron el encabezado, perfil y orden de habilidades, funciones de BCP, proyectos y credenciales. Se priorizan integración, validación, calidad, gobierno de datos, microservicios y CI/CD a partir de la evidencia ya documentada. Se mantienen los cargos, fechas y siete proyectos; los proyectos se reordenan para destacar SmartCampus, Veyra y Harmonix.

Ciencia de datos se presenta como dirección de carrera. No se añadió experiencia en modelos predictivos, estadística, machine learning, herramientas de orquestación ni automatización de pruebas de datos no acreditada. Arquitectura se sustenta en formación y proyectos académicos, sin atribuir un cargo de arquitecta. La selección actual de credenciales figura en `CERTIFICACIONES_COMPLETAS.md`; las secciones anteriores conservan el registro de la auditoría original.

### Aclaración posterior de enfoque, funciones y logros

La propietaria precisó que su orientación principal es ingeniería de software y de datos, gobierno de datos, ciencia de datos y arquitectura de software. Se retiró Data QA del encabezado y del posicionamiento profesional; la validación de datos se conserva como responsabilidad real.

Información adicional declarada directamente por la candidata para BCP: reportes operativos semanales y mensuales, tickets de soporte, uso de un proyecto Python y notebooks para insertar registros, validaciones previas y comunicación de hallazgos al líder técnico, quien realiza el pase a producción; cálculos en un notebook para proyectar un indicador del equipo; y nomenclatura descriptiva en snake_case para carpetas de páginas del proyecto Power BI en GitHub. Se incorporó este último aporte como mejora de legibilidad y mantenibilidad, sin atribuir mejoras de rendimiento ni resultados medidos. Los cálculos de proyección no se presentan como entrenamiento de modelos predictivos ni experiencia profesional en machine learning.

Para BanBif, la captura aportada por la candidata declara optimización de flujos de gestión de accesos para reducir reprocesos manuales y apoyo a la estandarización de procesos administrativos TI para mejorar trazabilidad y tiempos de atención. Se añadieron ambos logros con redacción de contribución, sin inventar porcentajes ni atribuir responsabilidad exclusiva. Esta información es declarada por la candidata, no una verificación independiente del empleador.

Se actualizaron las fuentes ES/EN y se regeneraron ambos PDF descargables; cada documento mantiene dos páginas.

### Redacción final solicitada por la propietaria

Se sustituyeron el encabezado por «Ingeniería de Software | Ciencia de Datos | Arquitectura de Software», el perfil profesional por el texto aportado y el bloque BCP por sus cuatro funciones centradas en procesamiento, integración, modelado, indicadores y mantenibilidad. La versión inglesa se adaptó al mismo contenido. Power BI permanece en habilidades técnicas como herramienta de trabajo; los logros de BanBif se conservan. Los detalles operativos previamente declarados se mantienen en este registro histórico, aunque se sintetizaron en el CV. Se regeneraron los PDF en ambos idiomas, con dos páginas cada uno.

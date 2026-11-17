# Línea gris en Experiencia: comprobación móvil

## Causa y corrección

El elemento responsable es `.experience-backdrop`, la capa que contiene la copia del canvas utilizada en la apertura cinematográfica. Combina `position: sticky`, `overflow: hidden`, `background: var(--surface)` y un desplazamiento vertical de GSAP; el canvas copiado se desplaza en sentido inverso para conservar la alineación con el paisaje principal.

Durante un desplazamiento entre píxeles, el recorte deja filtrar el fondo claro en una fila. Se reprodujo al desplazar la capa medio píxel: aparece una línea gris de ancho completo debajo del título. No corresponde a un borde del título ni a las reglas editoriales. El fondo y el recorte se definen en `src/app/contexts/experience/presentation/experience.component.css:7`.

La corrección local ya existía al iniciar esta comprobación: al terminar la apertura, la timeline ejecuta `.set(backdrop, { opacity: 0 }, 1)` en `experience.component.ts`. El canvas principal sigue visible con sus partículas y animaciones. Al retroceder, GSAP restaura la copia y su fondo temático antes de cerrar la apertura. Se conservan las dos reglas editoriales del encuadre y el acento rosa del título; los shaders y la composición no se modifican.

## Versión publicada

El 15 de noviembre de 2026 se inspeccionó [la producción en Vercel](https://portafolio-camilla.vercel.app/#experiencia). Servía `/assets/index-D9V9IbtQ.js`: su timeline termina la apertura con `.set(..., { visibility: 'visible' }, .98)` y **no contiene la retirada del backdrop** que sigue a esa instrucción en el código local. Durante el recorrido se confirmó `opacity: 1` en el overlay publicado, frente a `0` en la versión corregida.

Esto explica que el defecto siga presente en el celular aunque la corrección esté en el repositorio. No se atribuyó el problema a caché ni se cambiaron sus políticas. No se realizó un despliegue, respetando la indicación de no publicar sin autorización.

## Validación ampliada

Se ampliaron `tests/experience-seam.spec.js` y las capturas de diagnóstico:

- Anchos 375, 390 y 430 px con DPR 3, emulación móvil, tacto y agente de usuario de iPhone; además, escritorio de 1440 px.
- Cuatro casos en Chrome y cuatro en WebKit: pasan en los cuatro tamaños.
- Desplazamiento de medio píxel y comparación de la franja del recorte contra el canvas principal; tolerancia para el movimiento real de las partículas entre capturas.
- Scroll inverso para restaurar la apertura y volver al paisaje, y cambio de altura del viewport para simular la barra del navegador móvil.
- Permanencia del canvas, ausencia de desbordamiento horizontal, conservación de reglas editoriales y ausencia de errores de ejecución.

WebKit se ejecutó en Windows mediante Playwright; **no es una prueba en Safari de un iPhone físico**. El código de producción no necesitó otra modificación durante esta revisión; se amplió la cobertura para los tres anchos solicitados.

Comparación visual controlada: `.local/experience-line/mobile-comparison/index.html`. Reproduce el overlay anterior y el corregido en la misma escena local; no son capturas de dos despliegues. Los resultados de pruebas están en `.local/experience-line/iphone-chrome/` e `iphone-webkit/`. La inspección del bundle publicado y su captura están en `.local/experience-line/published/`.

# Inicio de Camilla Espinoza: portada editorial experimental

Solo navbar y Hero. Urbanist es la familia principal; CAMILLA es el elemento visual dominante y ESPINOZA ocupa una segunda escala, alineada a la derecha.

## Referencias y criterio previo

Se revisaron las cinco imágenes proporcionadas. De GAZU se toma la tipografía monumental; de Dröm, la asimetría y alineación a retícula; de Urbanist, la geometría de las letras y el uso contenido de pastel; de Minimalism/Futurism, el contraste de escalas y espacio negativo; de Warp Gradients, la relación entre información pequeña y título. No se reutilizan fotografías, objetos, logotipos, degradados ni composiciones literales.

Se descarta añadir un objeto central superpuesto: competiría con el nombre y no comunicaría el perfil. La experimentación se concentra en la proporción del título, el apellido desplazado y las alineaciones entre ubicación, formación y especialidades.

```text
Camilla                         Inicio   Sobre mí   Proyectos   Contacto
Espinoza

Lima, Perú                              Ingeniería de Software.

CAMILLA
                                             ESPINOZA

Desarrollo de            Análisis de
aplicaciones.            datos.                Ver proyectos  Conóceme
```

## Tokens y composición

- Blanco #FFFFFF y texto #212121 dominantes.
- Lima #E2F4A6 en la ubicación; rosa #EEA0FF en el borde de una acción; violeta #5A4EFF en hover y foco. Gris #F5F5F5 en la línea superior.
- Urbanist 800 para CAMILLA, 500 para ESPINOZA y especialidades, 400 para información pequeña. No hay tipografías secundarias.
- Retícula de 12 columnas compartida entre navbar y Hero. Las líneas delimitan metadatos y especialidades, sin convertir cada texto en una caja.
- El tamaño monumental responde al ancho real del contenedor mediante unidades cqw. En pantallas bajas se limita por altura para conservar la lectura.
- Altura aproximada de una pantalla en escritorio. En móvil se preservan el nombre completo en una línea y el apellido desplazado, con retícula de dos columnas para la información.

## Comportamiento conservado

Angular standalone y Vite, sin nuevas dependencias. Inicio sigue disponible y las demás secciones mantienen el estado de próximamente. Se conservan menú móvil, Escape, retorno de foco, salto al contenido, anuncios accesibles y movimiento reducido. El nombre completo tiene un nombre accesible explícito.

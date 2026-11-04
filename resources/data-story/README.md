# Video fuente

`03_video-original.mp4` es el archivo original entregado por Camilla. Se conserva fuera de `public` para evitar desplegar una segunda copia del video. La web utiliza únicamente el MP4 optimizado en `public/assets/data-story/video/` y los seis fotogramas de `public/assets/data-story/stages/`.

Para regenerarlos, con ffmpeg disponible: `node scripts/prepare-data-video.mjs`. El proceso conserva este original.

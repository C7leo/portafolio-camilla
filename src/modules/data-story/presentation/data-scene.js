import { dataStages } from '../domain/stages.js';

const icons = [
  '<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v14c0 4 14 4 14 0V5M5 10c0 4 14 4 14 0M5 15c0 4 14 4 14 0"/>',
  '<path d="M6 2h8l5 5v15H6zM14 2v6h5M9 12h7M9 16h4"/><path d="m13 19 2 2 4-4"/>',
  '<path d="m12 2 9 5v11l-9 5-9-5V7zM3 7l9 5 9-5M12 12v11"/>',
  '<path d="m12 2 9 4v6c0 6-9 11-9 11S3 18 3 12V6z"/>',
  '<rect x="3" y="14" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="14" rx="1"/><rect x="17" y="2" width="4" height="20" rx="1"/>',
  '<path d="M8 17c0-4-4-4-4-9a8 8 0 0 1 16 0c0 5-4 5-4 9M8 17h8M9 20h6M10 23h4M12 17v-7m-3-1 3 2 3-2"/>',
];
const sparkle = (className) => `<svg class="data-sparkle ${className}" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0c2 15 5 18 20 20-15 2-18 5-20 20C18 25 15 22 0 20 15 18 18 15 20 0Z" fill="currentColor"/></svg>`;

export function renderData() {
  return `<section class="data-scene" id="data" aria-labelledby="data-title" data-mode="static">
    <div class="data-sticky">
      <div class="section-top"><span class="eyebrow"><span class="section-number">03</span> FROM INFORMATION TO UNDERSTANDING</span><span class="micro">RAW DATA — INSIGHT</span></div>
      <div class="data-composition">
      <div class="data-heading"><h2 id="data-title"><span>INFORMATION.</span><span>IN <em>FORMATION.</em></span></h2>
        <svg class="data-title-stroke" viewBox="0 0 380 45" aria-hidden="true"><path d="M9 34C130 13 250 4 360 12c25 2-2 16-32 25" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>
        ${sparkle('data-title-star')}
        <p>Transform information into a consistent shape.<br>With structure, validation and context.</p></div>
      <div class="data-media-zone">
      <div class="data-visual">
        <video class="data-video" muted playsinline preload="none" poster="/assets/data-story/stages/03-stage-1.webp" data-src="/assets/data-story/video/03_video.mp4" aria-hidden="true" tabindex="-1" disablepictureinpicture disableremoteplayback></video>
        <ol class="data-storyboard" aria-label="Six stages from raw data to insight">${dataStages.map((stage, i) => `<li><img src="/assets/data-story/stages/03-stage-${i + 1}.webp" alt="" width="640" height="360" loading="lazy" decoding="async"/><span><b>0${i + 1}</b> ${stage.name}</span></li>`).join('')}</ol>
      </div>
      <div class="data-media-notes">
      <img class="data-cat" src="/assets/data-story/stickers/03_gato_sorprendido.png" alt="" width="1536" height="1024" loading="lazy" decoding="async"/>
      <p class="data-aside">TURN<br>DATA<br>INTO<br>POSSIBILITIES.<svg viewBox="0 0 150 25" aria-hidden="true"><path d="M2 23Q65 2 145 2"/></svg></p>
      </div></div></div>
      <div class="visual-axis" aria-hidden="true"><span>FIG. 03 / RAW DATA</span><span>CONNECTED INSIGHT ↗</span></div>
      <div class="data-timeline">
        <div class="data-progress" role="progressbar" aria-label="Data to insight sequence" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <svg viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden="true"><path class="data-track" d="M0 40H1200"/><path class="data-track-fill" pathLength="1" d="M0 40H1200"/></svg>
        </div>
        <ol class="pipeline" aria-label="Conceptual data processing stages">${dataStages.map((stage,i)=>`<li class="pipeline-step ${i===0?'active':''}" ${i===0?'aria-current="step"':''}><div class="pipeline-marker"><span class="pipeline-current">CURRENT</span><svg viewBox="0 0 24 25" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[i]}</svg></div><div class="pipeline-copy"><span class="pipeline-number">0${i+1}</span><span class="pipeline-name">${stage.name}</span><p>${stage.description}</p></div></li>`).join('')}</ol>
      </div>
      <div class="data-footer"><span id="stage-description" class="data-sr-only">Collect diverse sources.</span><span class="micro data-scroll-hint">SCROLL TO TRANSFORM ↕</span><span class="micro data-static-hint">SIX STAGES / STATIC VIEW</span></div>
      <a class="data-skip" href="#journey">Skip the visual sequence ↓</a>
    </div>
  </section>`;
}

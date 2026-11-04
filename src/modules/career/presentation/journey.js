import { journey } from '../domain/journey.js';
import './journey.css';

// Architecture is illustrative of each institution, not a claim about Camilla's workplace/campus.
const photographs = [
  { file: 'bcp-la-molina.webp', alt: 'BCP headquarters in La Molina', caption: 'BCP / LA MOLINA', credit: 'SUMAC', source: 'https://www.sumacinc.com/en/portfolio/banco-de-credito-del-peru-bcp---sede-la-molina' },
  { file: 'banbif.jpg', alt: 'Entrance to the BanBif Jockey Plaza branch', caption: 'BANBIF / JOCKEY PLAZA', credit: 'BanBif', source: 'https://www.linkedin.com/posts/banbif_nuestra-oficina-de-jockeyplaza-regresa-activity-7162845561224720384-q6wQ' },
  { file: 'upc-monterrico.jpg', alt: 'Entrance to the UPC Monterrico campus', caption: 'UPC / MONTERRICO', credit: 'UPC', source: 'https://www.upc.edu.pe/nosotros/campus/campus-monterrico/' },
];

export function renderJourney() {
  return `<section class="journey section-pad" id="journey" aria-labelledby="journey-title">
    <div class="section-top"><span class="eyebrow"><span class="section-number">04</span> <span class="journey-section-label">EXPERIENCE & EDUCATION</span></span><span class="micro">A JOURNEY IN PROGRESS</span></div>
    <div class="journey-layout">
      <aside class="journey-sidebar">
        <h2 id="journey-title" class="journey-title"><span>LEARN.</span><span>APPLY.</span><span class="journey-evolve">EVOLVE.<svg viewBox="0 0 400 40" aria-hidden="true"><path d="M5 31Q190-2 380 10c30 3-5 15-37 17" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg></span></h2>
        <p class="journey-introduction">From the classroom to enterprise IT.<br>Each experience adds another perspective.</p>
        <div class="journey-sidebar-bottom"><div class="journey-scroll-note"><span class="journey-scroll-line" aria-hidden="true"></span><span>SCROLL<br>TO EXPLORE</span></div>
          <div class="journey-love" aria-hidden="true"><svg class="journey-glass-steps" viewBox="0 0 300 180"><defs><linearGradient id="journey-glass" x2="1" y2="1"><stop stop-color="#ead8ff" stop-opacity=".15"/><stop offset=".55" stop-color="#9747ff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></linearGradient></defs><g fill="url(#journey-glass)" stroke="#cba1ff" stroke-width="1"><path d="m35 135 95-28 85 21-93 32Z"/><path d="m35 135 87 25v20l-87-25Z"/><path d="m122 160 93-32v20l-93 32Z"/><path d="m95 95 95-28 85 21-93 32Z"/><path d="m95 95 87 25v40l-87-25Z"/><path d="m182 120 93-32v40l-93 32Z"/><path d="m155 55 60-20 80 21-60 20Z"/><path d="m155 55 80 21v44l-80-25Z"/><path d="m235 76 60-20v44l-60 20Z"/></g></svg><img src="/assets/career/stickers/04_gato_mirando.png" alt="" width="393" height="243" loading="lazy" decoding="async"/><svg class="journey-heart" viewBox="0 0 70 60"><path d="M8 4h51a7 7 0 0 1 7 7v29a7 7 0 0 1-7 7H28L13 57l2-10H8a7 7 0 0 1-7-7V11a7 7 0 0 1 7-7Z" fill="#fff9" stroke="#9747ff" stroke-width="1.7"/><path d="M34 36 20 23c-8-10 9-19 14-7 5-12 22-3 14 7Z" fill="#ff63bf"/></svg></div>
        </div>
      </aside>
      <div class="journey-records"><div class="journey-spine" aria-hidden="true"><i></i></div>${journey.map((item, index) => {
        const photo = photographs[index];
        return `<article class="journey-entry journey-entry-${index + 1}" aria-labelledby="journey-company-${index}">
          <span class="journey-chapter-dot" aria-hidden="true"></span><span class="journey-entry-number" aria-hidden="true">0${index + 1}</span>
          <div class="journey-entry-copy"><span class="journey-category">${item.period}</span><h3 id="journey-company-${index}">${item.company}</h3><h4>${item.role}</h4><p>${item.description}</p><span class="journey-entry-tags">${item.tags}</span></div>
          <div class="journey-media">${index===0?'<img class="journey-sticker journey-wink" src="/assets/career/stickers/04_Gatito neón guiñando el ojo.png" alt="" width="1536" height="1024" loading="lazy" decoding="async"/>':index===2?'<img class="journey-sticker journey-sleep" src="/assets/career/stickers/04_gato durmiendo.png" alt="" width="382" height="286" loading="lazy" decoding="async"/>':'<span class="journey-handnote journey-real">REAL EXPERIENCE.<br>REAL PEOPLE.</span>'}
          <figure class="journey-photograph"><span class="journey-photo-backdrop" aria-hidden="true"></span><span class="journey-photo-accent" aria-hidden="true"></span><img src="/assets/career/photographs/${photo.file}" alt="${photo.alt}" loading="lazy" decoding="async" width="600" height="450"/><figcaption><span>${photo.caption}</span><a href="${photo.source}" target="_blank" rel="noopener noreferrer" aria-label="Photo source: ${photo.credit}">${photo.credit} ↗</a></figcaption></figure>
          <span class="journey-handnote journey-note-${index+1}">${index===0?'TURN DATA<br>INTO OPPORTUNITIES.':index===2?'ALWAYS<br>LEARNING.':'A DIFFERENT PERSPECTIVE.'}</span></div>
        </article>`;
      }).join('')}</div>
    </div>
  </section>`;
}

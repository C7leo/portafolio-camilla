const practices = [
  ['01', '01_ing_software.png', 'Software engineering', 'Application development, maintainable code and database integration.'],
  ['02', '01_datos_gobierno.png', 'Data & governance', 'Understanding how data is structured, validated and transformed into reporting.'],
  ['03', '01_aprendizaje_continuo.png', 'Continuous learning', 'Exploring cloud platforms, automation and intelligent applications.'],
];

export function renderAbout() {
  return `<section class="about section-pad" id="about" aria-labelledby="about-title">
    <div class="section-top"><span class="eyebrow"><span class="section-number">01</span> A LITTLE CONTEXT</span><span class="micro">THE PERSON BEHIND THE PROCESS</span></div>
    <div class="context-spread">
      <div class="context-copy">
        <span class="context-kicker">SOFTWARE ENGINEERING / UPC</span>
        <h2 id="about-title"><span>A curious mind.</span><span><span data-es="Un">A</span> <em class="context-highlight">structured</em></span><span>approach.</span></h2>
        <p class="context-description">I'm a Software Engineering student at UPC in Peru, gaining practical experience in data governance, reporting and automation.</p>
        <div class="context-academic"><strong>08</strong><div><span>EIGHTH ACADEMIC CYCLE</span><p>Universidad Peruana de Ciencias Aplicadas</p></div><span aria-hidden="true">↗</span></div>
        <div class="context-academic-note"><p>This stage connects my studies with projects, specialized courses and practical experience in data analysis and management.</p><i class="context-barcode" aria-hidden="true"></i></div>
        <p class="context-graduation">Expected graduation: December 2027, subject to the remaining graduation-project courses and academic schedule.</p>
      </div>
      <figure class="context-world">
        <div class="context-grid" aria-hidden="true"></div>
        <figcaption class="context-world-index"><span>IDEAS<br>DATA<br>LEARNING<br>RESULTS</span><i aria-hidden="true"></i></figcaption>
        <img src="/assets/profile/about/01_mundo.png" width="1254" height="1254" loading="lazy" alt="Neon green world with chrome orbits, translucent violet shapes and Camilla's black cat mascot."/>
        <span class="context-world-note">SAME CURIOSITY.<br>MORE POSSIBILITIES.</span>
        <span class="context-pixel" aria-hidden="true"></span>
      </figure>
      <aside class="context-marginalia" aria-label="A perspective on learning">
        <div class="context-quote"><div class="context-card-index"><span aria-hidden="true">//</span><span>(01)</span></div><p><span>Every small</span><br> <span>step is</span> <em class="context-highlight" data-es="progreso.">progress.</em></p><span class="context-spark" aria-hidden="true">✳</span><div class="context-quote-foot"><span>CURIOSITY. DISCIPLINE. RESULTS.</span><i class="context-barcode" aria-hidden="true"></i></div></div>
        <figure class="context-progress"><figcaption><span>PROGRESS<br>WITH INTENTION</span><span>(02)</span></figcaption><div class="context-chart"><svg viewBox="0 0 320 160" role="img" aria-label="Conceptual progress curve: learning includes small dips and continued growth."><defs><linearGradient id="context-growth" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c7ff35" stop-opacity=".48"/><stop offset="1" stop-color="#c7ff35" stop-opacity="0"/></linearGradient></defs><g stroke="#d8d8d0" stroke-dasharray="2 3" fill="none"><path d="M15 145H305M15 105H305M15 65H305M15 25H305M15 145V120M90 145V82M165 145V94M240 145V32M305 145V12"/></g><path d="M15 120C45 118 60 82 90 82S140 104 165 94S205 30 240 32S280 10 305 12V155H15Z" fill="url(#context-growth)"/><path d="M15 120C45 118 60 82 90 82S140 104 165 94S205 30 240 32S280 10 305 12" fill="none" stroke="#c7ff35" stroke-width="7"/><path d="M15 120C45 118 60 82 90 82S140 104 165 94S205 30 240 32S280 10 305 12" fill="none" stroke="#171714" stroke-width="1.6"/>${[[15,120],[90,82],[165,94],[240,32],[305,12]].map(([cx,cy])=>`<circle cx="${cx}" cy="${cy}" r="6" fill="#171714" stroke="#c7ff35" stroke-width="4"/>`).join('')}</svg><span class="context-chart-label"><b>+1%</b><span>EACH DAY</span></span></div><span class="context-chart-arrow" aria-hidden="true">↗</span></figure>
      </aside>
    </div>
    <div class="context-practice-heading"><h3>MY PRACTICE</h3><span aria-hidden="true"></span><b aria-hidden="true">✳</b></div>
    <div class="context-practice-layout"><div class="context-practices">${practices.map(([n,image,title,description])=>`<article class="context-practice"><div class="context-practice-index"><span>${n} /</span><i aria-hidden="true"></i><span class="context-mini-arrow" aria-hidden="true">↗</span></div><div class="context-practice-body"><img src="/assets/profile/about/${image}" width="1024" height="1024" loading="lazy" alt=""/><div><h3>${title}</h3><p>${description}</p></div></div></article>`).join('')}</div><div class="context-mantra"><p><span>CURIOSITY.</span><span>STRUCTURE.</span><span>PURPOSE.</span></p><svg viewBox="0 0 210 22" aria-hidden="true"><path d="M5 17Q100 -8 139 6L107 15Q156 8 203 16" fill="none" stroke="#c7ff35" stroke-width="7" stroke-linecap="round"/></svg><i aria-hidden="true"></i></div></div>
  </section>`;
}

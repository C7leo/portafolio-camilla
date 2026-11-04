import './hero-editorial.css';

const arrow = '<span aria-hidden="true">↗</span>';
const icons = [
  '<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 0v10m9-5-9 5-9-5m9 5v10"/>',
  '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 10c0 4 16 4 16 0M4 15c0 4 16 4 16 0"/>',
  '<path d="m14 2-9 12h6l-1 8 9-13h-6Z"/>',
];

export function renderIntro() {
  return `<section id="home" class="hero hero-editorial" aria-labelledby="hero-heading">
    <div class="hero-stage"><div class="hero-composition">
      <p class="hero-running-label">SOFTWARE × DATA × AUTOMATION</p>
      <div class="hero-portfolio-label"><span class="hero-edition">01 — 07</span><span>PERSONAL PORTFOLIO</span></div>
      <h1 id="hero-heading" class="hero-title"><span class="sr-only">Camilla — </span><span class="hero-headline-line hero-code">CODE</span><span class="hero-headline-line hero-data">DATA</span><span class="hero-headline-line hero-curiosity"><svg class="curiosity-brush" viewBox="0 0 800 170" preserveAspectRatio="none" aria-hidden="true"><path d="m15 21 91-8 84 8 128-10 101 7 120-9 111 5 111-1 20 9-4 23 7 8-11 11-73-2-88 7-128-6-122 5-111-5-101 6-99-2-33 4-11-10 4-15-6-6Zm19 74 98-5 89 7 127-6 122 4 94-4 110 7 101-1 9 11-3 28 7 10-11 10-95-5-131 4-96-8-116 6-99-7-116 3-90-5-7-11 4-16-5-7Z" fill="currentColor"/></svg>CURIOSITY<svg class="curiosity-underline" viewBox="0 0 440 38" fill="none" aria-hidden="true"><path d="M2 34C112 5 232 3 432 10M199 17l93-13-49 17 184-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></span></h1>
      <div class="hero-panel hero-panel-lime" aria-hidden="true"></div><div class="hero-panel hero-violet" aria-hidden="true"></div>
      <svg class="hero-orbits" viewBox="0 0 1600 850" fill="none" preserveAspectRatio="none" aria-hidden="true"><g class="hero-orbit-motion" stroke="currentColor" stroke-width=".8"><ellipse cx="780" cy="360" rx="445" ry="132" transform="rotate(-22 780 360)"/><path d="M883 128C1071 91 1141 139 1118 259M553 485c-91-17-85-70-50-113" stroke-dasharray="4 5"/><path d="m1110 254 9 12 5-16m-626 117 5-8 4 12"/></g></svg>
      <figure class="hero-art hero-cat"><div class="hero-photo"><div class="hero-cat-float"><img class="hero-cat-image" src="/assets/profile/hero/Gato negro de ojos neón.png" alt="Camilla's glossy black 3D cat mascot with neon green eyes, pink ears and violet reflections" width="1536" height="1024" fetchpriority="high" decoding="async"/></div></div></figure>
      <div class="hero-practice"><span class="practice-arrow" aria-hidden="true">↘</span><p>A PRACTICE IN<br>CONTINUOUS<br>LEARNING.</p></div>
      <div class="hero-fields"><span>Software engineering</span><span>Data governance</span><span>Automation</span></div>
      <div class="hero-graphics" aria-hidden="true"><svg class="hero-globe" viewBox="0 0 40 40" fill="none"><g stroke="currentColor" stroke-width=".8"><circle cx="20" cy="20" r="18"/><ellipse cx="20" cy="20" rx="8" ry="18"/><path d="M2 20h36M20 2v36"/></g></svg><span class="hero-pixels hero-pixels-dark"></span><span class="hero-pixels hero-pixels-violet"></span><span class="hero-star hero-star-dark">✳</span><span class="hero-star hero-star-violet">+</span><span class="hero-lime-square"></span><span class="hero-corner"></span></div>
    </div></div>
    <div class="hero-bottom">
      <div class="hero-specialties hero-right-list">${[['01','ENGINEERING','SOLUTIONS'],['02','GOVERNING DATA',''],['03','AUTOMATING','PROCESSES']].map(([number,line1,line2],index)=>`<div class="hero-specialty"><span class="hero-specialty-number">${number}</span><span class="hero-specialty-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round">${icons[index]}</svg></span><span class="hero-specialty-label">${line1}${line2?`<br>${line2}`:''}</span></div>`).join('')}</div>
      <div class="hero-actions"><a class="button button-dark" href="#work">Explore my work ${arrow}</a><a class="button button-outline" href="#contact" aria-label="Let's connect">${arrow}</a></div>
    </div>
    <a class="scroll-cue" href="#about" aria-label="Scroll to About"><span>SCROLL TO EXPLORE</span><span class="scroll-arrow" aria-hidden="true">↓</span></a>
  </section>`;
}

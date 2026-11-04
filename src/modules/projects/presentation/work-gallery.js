import { workViews } from './work-views.js';
import { mountWorkSwap } from './work-swap.jsx';
export { workViews } from './work-views.js';

export function renderGallery(){
 return `<section class="work section-pad" id="work" aria-labelledby="work-title">
 <div class="work-exhibition">
  <div class="work-gallery-header"><div><span class="work-eyebrow"><i aria-hidden="true"></i>02 / <span>SELECTED WORK</span><b aria-hidden="true"></b></span><h2 id="work-title"><span data-es="TRABAJO">WORK</span><span data-es="CON PROPÓSITO.">WITH PURPOSE.</span></h2></div><p>Design and technology for ideas that make a meaningful difference to people.</p></div>
  <div class="work-mascot" aria-hidden="true"><img src="/assets/projects/gallery/gato_cosmico.png" width="1651" height="955" loading="lazy" alt=""/><i class="work-star">✦</i><i class="work-orbit-pixel"></i></div>
  <div class="work-floor" aria-hidden="true"></div>
  <div class="projects-swap-container" id="work-swap" aria-busy="true"></div>
  <div class="work-gallery-footer"><div class="work-gallery-caption"><span aria-hidden="true">⌖</span><p>Select a view to explore</p><i aria-hidden="true"></i></div><div class="work-gallery-controls"><span class="work-gallery-count" aria-live="polite"><span>VIEW</span> <b data-view-count>01 / 06</b></span><button type="button" data-gallery-overview>Overview</button><button type="button" class="work-index-toggle" aria-expanded="false" aria-controls="work-index">Index</button><button type="button" class="work-gallery-arrow" data-gallery-prev aria-label="Previous view">←</button><button type="button" class="work-gallery-arrow" data-gallery-next aria-label="Next view">→</button></div></div>
  <div id="work-index" class="work-gallery-index" hidden><div><span>01 / ACADEMIC DIRECTION</span><h3>Digital assistance for motor dysgraphia.</h3><p>One academic proposal, six views into the process.</p></div><ol>${workViews.map((v,i)=>`<li><button type="button" data-index-view="${i}"><span>0${i+1}</span><span>${v.name}</span><span aria-hidden="true">↗</span></button></li>`).join('')}</ol></div>
 </div><p class="work-gallery-note">The captures show this portfolio’s illustrative prototype, not a completed academic application.</p>`;
}

export function initWorkGallery(onLayoutChange){
 const root=document.querySelector('.work-exhibition');
 const toggle=root.querySelector('.work-index-toggle');
 const index=root.querySelector('#work-index');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Keep the native dialog as the single destination for every view of this proposal.
 function openView(i){
  const view=workViews[i],dialog=document.querySelector('#case-dialog');
  let preview=dialog.querySelector('.work-case-preview');
  if(!preview){preview=document.createElement('figure');preview.className='work-case-preview';dialog.querySelector('.case-sections').before(preview);}
  const visual=document.createElement(view.image?'img':'span');
  if(view.image){visual.className='work-panel-image';visual.src=view.image;visual.alt='Authentic capture of the portfolio tracing interface.';}
  else{visual.className=`work-editorial work-editorial-${view.art}`;visual.innerHTML=view.markup;}
  preview.replaceChildren(visual);dialog.showModal();
 }
 const play=document.createElement('button');play.type='button';play.dataset.galleryPlay='';play.textContent='Pause';play.setAttribute('aria-pressed','false');
 root.querySelector('[data-gallery-overview]').before(play);
 const bridge=mountWorkSwap(document.querySelector('#work-swap'),{onOpen:openView,onChange:i=>{
  root.querySelector('[data-view-count]').textContent=`0${i+1} / 0${workViews.length}`;
 }});
 play.addEventListener('click',()=>bridge.toggle?.());
 function closeIndex(){const changed=!index.hidden;index.hidden=true;toggle.setAttribute('aria-expanded','false');if(changed)onLayoutChange?.();}
 root.querySelector('[data-gallery-next]').addEventListener('click',()=>bridge.next?.());
 root.querySelector('[data-gallery-prev]').addEventListener('click',()=>bridge.prev?.());
 root.querySelector('[data-gallery-overview]').addEventListener('click',()=>{closeIndex();bridge.goTo?.(0);});
 toggle.addEventListener('click',()=>{index.hidden=!index.hidden;toggle.setAttribute('aria-expanded',String(!index.hidden));onLayoutChange?.();});
 root.querySelectorAll('[data-index-view]').forEach(b=>b.addEventListener('click',()=>{bridge.goTo?.(Number(b.dataset.indexView));closeIndex();root.querySelector('.card-swap')?.focus({preventScroll:true});}));
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!index.hidden){closeIndex();toggle.focus();}});
 const mascot=root.querySelector('.work-mascot');
 root.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType!=='mouse')return;const r=root.getBoundingClientRect();mascot.style.setProperty('--mx',`${((e.clientX-r.left)/r.width-.5)*8}px`);mascot.style.setProperty('--my',`${((e.clientY-r.top)/r.height-.5)*8}px`);});
 root.addEventListener('pointerleave',()=>{mascot.style.setProperty('--mx','0px');mascot.style.setProperty('--my','0px');});
 const observer=new IntersectionObserver(entries=>root.classList.toggle('work-in-view',entries.some(e=>e.isIntersecting)));observer.observe(root);
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}


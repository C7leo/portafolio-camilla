import gsap from 'gsap';

export function animateHeroCollage() {
  gsap.from('.hero-panel',{opacity:0,scale:.97,duration:.8,stagger:.07,delay:.15,ease:'power3.out'});
  gsap.from('.hero-cat-image',{autoAlpha:0,y:12,duration:1,delay:.2,ease:'power3.out'});
  const region=document.querySelector('.hero-stage');
  const photoX=gsap.quickTo('.hero-photo','x',{duration:.8,ease:'power3.out'});
  const photoY=gsap.quickTo('.hero-photo','y',{duration:.8,ease:'power3.out'});
  const panelX=gsap.quickTo('.hero-violet','x',{duration:1,ease:'power3.out'});
  const reset=()=>{photoX(0);photoY(0);panelX(0);};
  const move=event=>{
    if(event.pointerType!=='mouse'||!matchMedia('(min-width:701px)').matches)return;
    const box=region.getBoundingClientRect();
    const x=Math.max(-1,Math.min(1,((event.clientX-box.left)/box.width-.5)*2));
    const y=Math.max(-1,Math.min(1,((event.clientY-box.top)/box.height-.5)*2));
    photoX(x*5);photoY(y*5);panelX(x*-3);
  };
  region.addEventListener('pointermove',move);region.addEventListener('pointerleave',reset);
  const animated=[...document.querySelectorAll('.hero-cat-float,.hero-orbit-motion,.hero-pixels-violet')];
  const observer=new IntersectionObserver(entries=>{animated.forEach(el=>{el.style.animationPlayState=entries[0].isIntersecting?'running':'paused';});});
  observer.observe(region);
  return()=>{region.removeEventListener('pointermove',move);region.removeEventListener('pointerleave',reset);observer.disconnect();animated.forEach(el=>el.style.removeProperty('animation-play-state'));};
}

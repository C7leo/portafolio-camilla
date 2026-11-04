import gsap from 'gsap';
import { initSectionTransitions } from '../shared/presentation/motion/section-transitions.js';
import { animateHeroCollage } from '../modules/profile/index.js';
import { initDataVideo } from '../modules/data-story/index.js';
import { initJourneyMotion } from '../modules/career/index.js';
import { initContactMotion } from '../modules/profile/index.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
export function initMotion() {
  const mm=gsap.matchMedia();
  const disposeTransitions=initSectionTransitions();
  const disposeDataVideo=initDataVideo();
  const disposeJourney=initJourneyMotion();
  const disposeContact=initContactMotion();
  mm.add('(prefers-reduced-motion: no-preference)',()=>{
    const cleanupHero = animateHeroCollage();
    gsap.from('.hero-headline-line',{y:26,opacity:0,stagger:.09,duration:.85,ease:'power3.out',delay:.05});
    gsap.from('.hero-bottom',{y:15,opacity:0,duration:.8,ease:'power2.out',delay:.25});
    gsap.from('.scroll-arrow',{y:-6,duration:1.1,ease:'power2.out'});
    document.querySelectorAll('.reveal').forEach(el=>gsap.from(el,{y:24,opacity:.25,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
    return cleanupHero;
  });
  window.addEventListener('pagehide',()=>{disposeDataVideo();disposeJourney();disposeContact();mm.revert();disposeTransitions();},{once:true});
}

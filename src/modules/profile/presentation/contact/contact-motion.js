import gsap from 'gsap';

export function initContactMotion() {
  const section=document.querySelector('#contact');
  const media=gsap.matchMedia();
  const backTop=section.querySelector('.back-top');
  // Contact is never masked. Moving it on focus shifts the link between
  // pointer-down and pointer-up and cancels its native click.
  const keepLinkPosition=event=>event.stopPropagation();
  backTop.addEventListener('focusin',keepLinkPosition);
  let visible=false;
  function update() { section.classList.toggle('contact-is-visible',visible && !document.hidden); }
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:.08});
  observer.observe(section);document.addEventListener('visibilitychange',update);
  media.add('(prefers-reduced-motion: no-preference)',()=>{
    const reveal=(element,from,trigger,start='top 88%',delay=0)=>gsap.from(element,{
      ...from,duration:.7,ease:'power2.out',delay,scrollTrigger:{trigger,start,once:true},
    });
    reveal(section.querySelector('.contact-poster'),{y:18,opacity:.35},section.querySelector('.contact-spread'));
    reveal(section.querySelector('.contact-title'),{y:14,opacity:.4},section.querySelector('.contact-spread'),'top 85%',.08);
    reveal(section.querySelector('.contact-art'),{scale:.97,opacity:0},section.querySelector('.contact-spread'),'top 85%',.12);
    gsap.from(section.querySelectorAll('.contact-link'),{y:12,opacity:.35,stagger:.065,duration:.5,ease:'power2.out',scrollTrigger:{trigger:section.querySelector('.contact-bottom'),start:'top 94%',once:true}});
  });
  return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);backTop.removeEventListener('focusin',keepLinkPosition);media.revert();section.classList.remove('contact-is-visible');};
}

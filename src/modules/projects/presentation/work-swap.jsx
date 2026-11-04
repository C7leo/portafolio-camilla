import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CardSwap, { Card } from '../../../shared/presentation/components/CardSwap/CardSwap.jsx';
import { workViews } from './work-views.js';
import './work-swap.css';

function WorkSwap({ bridge, onChange, onOpen }) {
  const swap=useRef(null),host=useRef(null),front=useRef(0),queue=useRef([]);
  const [mobile,setMobile]=useState(()=>innerWidth<=700);
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [paused,setPaused]=useState(false),[focused,setFocused]=useState(false),[modal,setModal]=useState(false);
  const [active,setActive]=useState(0);
  const clearQueue=()=>{queue.current.forEach(clearTimeout);queue.current=[];};
  const changed=i=>{front.current=i;setActive(i);onChange(i);};
  const select=i=>{
    clearQueue();
    const steps=(i-front.current+workViews.length)%workViews.length;
    for(let n=0;n<steps;n++)queue.current.push(setTimeout(()=>swap.current?.next(),n*180));
  };
  const open=i=>{
    clearQueue();
    // The original invokes onCardClick BEFORE bringing a back card forward.
    // Ignore that callback until it is the front sheet and has settled.
    if(i!==front.current)return;
    const slot=host.current?.querySelector(`[data-swap-index="${i}"]`);
    if(!slot?.hasAttribute('data-front'))return;
    const matrix=new DOMMatrixReadOnly(getComputedStyle(slot).transform);
    if(Math.abs(matrix.m41)>2||Math.abs(matrix.m42)>2||Math.abs(matrix.m43)>2)return;
    onOpen(i);
  };
  useEffect(()=>{
    const resize=()=>setMobile(innerWidth<=700);
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const preference=()=>setReduced(media.matches);
    const dialog=document.querySelector('#case-dialog');
    const observer=new MutationObserver(()=>setModal(dialog.open));
    observer.observe(dialog,{attributes:true,attributeFilter:['open']});
    window.addEventListener('resize',resize);media.addEventListener('change',preference);
    return()=>{clearQueue();window.removeEventListener('resize',resize);media.removeEventListener('change',preference);observer.disconnect();};
  },[]);
  useEffect(()=>{
    Object.assign(bridge,{
      next:()=>{clearQueue();swap.current?.next();},
      prev:()=>{clearQueue();swap.current?.prev();},
      goTo:select,
      toggle:()=>setPaused(v=>!v)
    });
  });
  useEffect(()=>{clearQueue();changed(0);},[mobile,reduced]);
  useEffect(()=>{host.current?.querySelectorAll('[data-select-view]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.selectView)===active)));},[active,mobile,reduced]);
  useEffect(()=>{
    const button=document.querySelector('[data-gallery-play]');
    button.textContent=paused?'Play':'Pause';button.setAttribute('aria-pressed',String(paused));button.disabled=reduced;
  },[paused,reduced]);

  // Stable children preserve translated editorial DOM when focus or pause changes.
  const cards=useMemo(()=>workViews.map((v,i)=><Card key={v.name} customClass="portfolio-project-card">
    <button type="button" className="project-swap-preview" data-select-view={i} aria-label={v.name} aria-pressed={i===0}>
      <span className="swap-project-bar"><span>CAM/01</span><span>{v.category}</span><span>0{i+1}</span></span>
      {v.image?<img className="swap-project-image" src={v.image} alt="Authentic capture of the portfolio tracing interface." draggable={false}/>:<span className={`work-editorial work-editorial-${v.art}`} dangerouslySetInnerHTML={{__html:v.markup}}/>}
      <span className="swap-project-meta"><strong>{v.name}</strong><span>{v.description}</span><span>READ THE PROPOSAL ↗</span></span>
    </button>
  </Card>),[]);

  return <div ref={host} className="portfolio-swap-host" data-front-index={active}
    onFocusCapture={()=>setFocused(true)}
    onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false);}}
    onKeyDownCapture={e=>{
      if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('card-swap')){e.preventDefault();open(front.current);}
    }}>
    <CardSwap key={`${mobile}-${reduced}`} ref={swap}
      width={420} height={300}
      cardDistance={60} verticalDistance={70} depth={90} skewAmount={6}
      visibleCards={mobile?3:4} cardRadius={18} delay={4000}
      speed={reduced?4:1} bounce={reduced?0:.35}
      parallax={reduced?0:.5} hoverSpread={reduced?0:.12} dim={.5}
      autoplay={!paused&&!reduced&&!focused&&!modal}
      pauseOnHover draggable intro={!reduced}
      onChange={changed} onCardClick={open}>
      {cards}
    </CardSwap>
  </div>;
}

export function mountWorkSwap(element,options){
  const bridge={},root=createRoot(element);
  root.render(<WorkSwap bridge={bridge} {...options}/>);
  element.removeAttribute('aria-busy');
  window.addEventListener('pagehide',()=>root.unmount(),{once:true});
  return bridge;
}

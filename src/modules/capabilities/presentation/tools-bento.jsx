import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { technologies } from '../domain/technologies.js';
import { toolSymbol } from './tools-symbols.js';

const summaries = [
  ['Explore the tools behind digital products.', 'Explora las herramientas detrás de los productos digitales.'],
  ['Understand reliable and useful information.', 'Comprender información confiable y útil.'],
  ['Explore reports, indicators and data.', 'Explora reportes, indicadores y datos.'],
  ['Study how to structure and connect data.', 'Estudiar cómo estructurar y conectar datos.'],
  ['Explore cloud platforms and automation.', 'Explora plataformas en la nube y automatización.'],
  ['Discover new possibilities with intelligent technology.', 'Descubrir posibilidades con tecnología inteligente.'],
];

const panelHeadings = [
  ['LANGUAGES & STACK', 'LENGUAJES Y STACK'],
  ['DATA & GOVERNANCE', 'DATOS Y GOBIERNO'],
  ['REPORTING & INSIGHTS', 'REPORTES E INDICADORES'],
  ['DATABASES & STRUCTURE', 'BASES DE DATOS Y ESTRUCTURA'],
  ['CLOUD & AUTOMATION', 'NUBE Y AUTOMATIZACIÓN'],
  ['INTELLIGENT SYSTEMS', 'SISTEMAS INTELIGENTES'],
];
const panelIntros = [
  ['Technologies studied and practiced to build digital products.', 'Tecnologías estudiadas y practicadas para crear productos digitales.'],
  ['Practices for reliable, traceable information.', 'Prácticas para información confiable y trazable.'],
  ['Tools and concepts for reports and indicators.', 'Herramientas y conceptos para reportes e indicadores.'],
  ['Tools and concepts for structuring and querying data.', 'Herramientas y conceptos para estructurar y consultar datos.'],
  ['Cloud platforms and workflows I am currently exploring.', 'Plataformas en la nube y flujos que estoy explorando.'],
  ['Concepts I am interested in exploring.', 'Conceptos que me interesa explorar.'],
];
const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';

function TechnologyPanel({ index, onClose, closing }) {
  const item = technologies[index];
  return <div className={`tech-panel${closing?' is-closing':''}`} id="tech-panel" role="region" aria-labelledby="tech-name" data-category={index} aria-busy="false" data-layout-key="panel">
    <div className="tools-panel-heading">
      <p className="tools-panel-kicker"><span>0{index+1} / </span><span id="tech-category-name">{item.name}</span></p>
      <button type="button" className="tools-close" onClick={onClose}><span aria-hidden="true">×</span><span className="tools-close-label" data-es="Cerrar">Close</span></button>
    </div>
    <h3 id="tech-name" data-es={panelHeadings[index][1]}>{panelHeadings[index][0]}</h3>
    <p className="tools-panel-intro" data-es={panelIntros[index][1]}>{panelIntros[index][0]}</p>
    <ul className="tech-quick-list" style={{'--tool-count':Math.min(6,item.tech.split(' · ').length)}}>
      {item.tech.split(' · ').map(name=><li className="tech-quick-item" key={name}>
        <span className="tech-tool-symbol" aria-hidden="true" dangerouslySetInnerHTML={{__html:toolSymbol(name)}}/>
        <span>{name}</span>
      </li>)}
    </ul>
    <div className="tools-panel-context"><span className="micro" id="tech-label">{item.label}</span><p id="tech-description">{item.description}</p></div>
  </div>;
}

export function ToolsBento({ categoryIcon, onChange }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [closing, setClosing] = useState(false);
  const grid = useRef(null);
  const previous = useRef(null);
  const animations = useRef(new Set());
  const timer = useRef(null);
  const reduced = useRef(false);
  const buttons = useRef([]);
  const activeRef = useRef(null);

  useEffect(()=>{
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = ()=>{
      reduced.current = preference.matches;
      if(preference.matches) animations.current.forEach(animation=>animation.cancel());
    };
    update();preference.addEventListener('change',update);
    return ()=>{clearTimeout(timer.current);preference.removeEventListener('change',update);animations.current.forEach(animation=>animation.cancel());};
  },[]);

  function capture() {
    previous.current = {
      height:grid.current.getBoundingClientRect().height,
      cards:new Map([...grid.current.querySelectorAll('[data-tech]')].map(card=>[card.dataset.tech,card.getBoundingClientRect()])),
    };
    animations.current.forEach(animation=>animation.cancel());
    animations.current.clear();
  }
  function close() {
    if(activeRef.current===null) return;
    clearTimeout(timer.current);
    const index = activeRef.current;
    const commit = ()=>{capture();activeRef.current=null;setActiveCategory(null);setClosing(false);buttons.current[index]?.focus({preventScroll:true});};
    if(reduced.current) commit();
    else {setClosing(true);timer.current=setTimeout(commit,100);}
  }
  function select(index) {
    if(index===activeRef.current){close();return;}
    clearTimeout(timer.current);
    capture();activeRef.current=index;setClosing(false);setActiveCategory(index);
  }
  function keyboard(event) {
    if(event.key==='Escape' && activeRef.current!==null){event.preventDefault();close();return;}
    const button=event.target.closest('[data-tech]');if(!button)return;
    let next=Number(button.dataset.tech);
    if(['ArrowDown','ArrowRight'].includes(event.key)) next=(next+1)%technologies.length;
    else if(['ArrowUp','ArrowLeft'].includes(event.key)) next=(next+technologies.length-1)%technologies.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=technologies.length-1;
    else return;
    event.preventDefault();buttons.current[next]?.focus({preventScroll:true});
    if(next!==activeRef.current)select(next);
  }

  useLayoutEffect(()=>{
    const before=previous.current;
    if(!before)return;
    previous.current=null;
    const animate=(element,frames,options={})=>{
      const animation=element.animate(frames,{duration:450,easing,...options});
      animations.current.add(animation);
      animation.finished.catch(()=>{}).finally(()=>animations.current.delete(animation));
      return animation.finished.catch(()=>{});
    };
    const finished=[];
    if(!reduced.current){
      // FLIP: measure the new grid, then animate each card from its previous bounds.
      for(const card of grid.current.querySelectorAll('[data-tech]')){
        const from=before.cards.get(card.dataset.tech),to=card.getBoundingClientRect();
        if(!from || !to.width || !to.height)continue;
        finished.push(animate(card,[{transformOrigin:'top left',transform:`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`},{transformOrigin:'top left',transform:'none'}]));
      }
      const panel=grid.current.querySelector('.tech-panel');
      if(panel)finished.push(animate(panel,[{opacity:0,transform:'translateX(-12px) scaleX(.96)',transformOrigin:'left center'},{opacity:1,transform:'none',transformOrigin:'left center'}]));
      const height=grid.current.getBoundingClientRect().height;
      if(Math.abs(before.height-height)>1)finished.push(animate(grid.current,[{height:`${before.height}px`},{height:`${height}px`}]));
    }
    onChange?.();
    Promise.all(finished).then(()=>onChange?.());
  },[activeCategory,onChange]);

  const others=technologies.map((_,index)=>index).filter(index=>index!==activeCategory);
  const nodes=[];
  technologies.forEach((item,index)=>{
    const active=index===activeCategory;
    const slot=activeCategory===null?'':active?' active-card':` ${others.indexOf(index)<2?'companion-'+(others.indexOf(index)+1):'remainder-'+(others.indexOf(index)-1)}`;
    nodes.push(<button type="button" key={`card-${index}`} ref={element=>{buttons.current[index]=element;}} className={`tech-node tech-card-${index}${active?' selected':''}${slot}`} data-tech={index} aria-pressed={active} aria-expanded={active} aria-controls={active?'tech-panel':undefined} onClick={()=>select(index)}>
      <span className="tech-number">0{index+1}</span>
      <span className="tech-category-icon" dangerouslySetInnerHTML={{__html:categoryIcon(index)}}/>
      <span className="tech-category-name">{item.name}</span>
      <span className="tech-summary" data-es={summaries[index][1]}>{summaries[index][0]}</span>
      {index===3 && <img className="tools-database" src="/assets/05_db.png" alt="" width="900" height="563" loading="lazy" decoding="async"/>}
      <span className="tech-arrow" aria-hidden="true">{active?'↗':'→'}</span>
    </button>);
    if(active)nodes.push(<TechnologyPanel key={`panel-${index}`} index={index} onClose={close} closing={closing}/>);
  });
  return <>
    <div className={`tech-categories${activeCategory!==null?' has-active':''}`} id="toolkit-categories" ref={grid} role="group" aria-label="Technology categories" onKeyDown={keyboard}>{nodes}</div>
    <span className="tools-status" role="status" aria-live="polite" key={`status-${activeCategory}`}>{activeCategory===null?'':technologies[activeCategory].name}</span>
  </>;
}

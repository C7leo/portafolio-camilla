import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { ToolsBento } from './tools-bento.jsx';

function ToolsLayout({ categoryIcon, onChange }) {
  return <>
    <div className="section-top">
      <span className="eyebrow"><span className="section-number">05</span><span>TOOLS, PRACTICE &amp; POSSIBILITIES</span></span>
      <span className="tools-header-rule" aria-hidden="true" />
      <a className="tools-header-link" href="#toolkit-categories"><span data-es="EXPLORA MIS HERRAMIENTAS">EXPLORE MY TOOLKIT</span><span aria-hidden="true">↗</span></a>
    </div>
    <div className="tools-heroes">
      <div className="technology-heading">
        <p className="tools-kicker"><span data-es="MIS HERRAMIENTAS">MY TOOLKIT</span> / 01 — 06</p>
        <h2 id="tools-title" className="tools-title"><span data-es="UNA FORMA">A CONNECTED</span><span><span data-es="CONECTADA">WAY OF</span> <em data-es="DE TRABAJAR.">WORKING.</em></span></h2>
        <p className="tools-subtitle"><span data-es="Distintas herramientas.">Different tools.</span><br/><span data-es="Una mente curiosa.">One curious mind.</span></p>
        <svg className="tools-underline" viewBox="0 0 320 45" aria-hidden="true"><path d="M5 26C95 2 244 3 183 20S263 19 313 39"/></svg>
        <svg className="tools-star" viewBox="0 0 60 70" aria-hidden="true"><path d="m31 3-7 60-9-43 35 21L4 32 31 3"/></svg>
      </div>
      <div className="tools-hero-visual">
        <div className="tools-visual-grid" aria-hidden="true"/>
        <img className="tools-hero-cat" src="/assets/05_gato.png" alt="Camilla’s 3D cat with software development tools" width="1670" height="941" loading="lazy" decoding="async"/>
        <p className="tools-handnote"><span data-es="EXPLORA MIS HERRAMIENTAS">EXPLORE MY TOOLS</span><svg viewBox="0 0 100 85" aria-hidden="true"><path d="M70 7Q21 30 24 70m-12-15 12 15 15-16M62 29l30-6"/></svg></p>
        <span className="tools-spark" aria-hidden="true">✧</span>
      </div>
    </div>
    <ToolsBento categoryIcon={categoryIcon} onChange={onChange}/>
  </>;
}

export function mountTools(element, options) {
  const root = createRoot(element);
  // Mount before the site's translation observer and scroll measurements start.
  flushSync(()=>root.render(<ToolsLayout {...options}/>));
  window.addEventListener('pagehide',()=>root.unmount(),{once:true});
}

import { profile } from '../../domain/profile.js';
import { GithubIcon, Linkedin02Icon, Mail01Icon, File02Icon } from '@hugeicons/core-free-icons';
import './contact.css';

const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function icon(data) {
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${data.map(([tag,attributes])=>`<${tag} ${Object.entries(attributes).filter(([key])=>key!=='key').map(([key,value])=>`${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}="${escape(value)}"`).join(' ')}/>`).join('')}</svg>`;
}

export function renderContact(data = profile) {
  const channels = [
    { name:'Email', caption:"Let's talk!", url:data.email?`mailto:${data.email}`:null, icon:Mail01Icon },
    { name:'LinkedIn', caption:"Let's connect!", url:data.linkedin, icon:Linkedin02Icon },
    { name:'GitHub', caption:'See my work.', url:data.github, icon:GithubIcon },
    { name:'Download CV', caption:'My resume.', url:data.cv, icon:File02Icon, download:true },
  ];
  return `<section class="contact section-pad" id="contact" aria-labelledby="contact-title">
    <div class="section-top"><span class="eyebrow"><span class="section-number">07</span> EVERY GOOD IDEA STARTS SOMEWHERE</span><a class="micro back-top" href="#home">BACK TO TOP ↗</a></div>
    <div class="contact-spread">
      <div class="contact-margin">
        <div class="contact-invitation"><p>HAVE AN IDEA,<br>A QUESTION OR<br>AN OPPORTUNITY?</p><svg viewBox="0 0 180 110" aria-hidden="true"><path class="invitation-underline" d="M4 24Q55 5 122 8"/><path class="invitation-arrow" d="M106 35q0 42 65 58m-13-15 13 15-20 3"/></svg></div>
        <div class="contact-introduction"><p>Let's turn curiosity into something real.</p><p>I'm always open to new conversations, collaborations and challenges.</p></div>
        <p class="contact-margin-note">A CONVERSATION<br>IS A GOOD START.</p>
      </div>
      <div class="contact-poster">
        <div class="contact-poster-grid" aria-hidden="true"></div><i class="contact-pixel contact-pixel-violet" aria-hidden="true"></i><i class="contact-pixel contact-pixel-lime" aria-hidden="true"></i>
        <div class="contact-poster-copy"><span class="contact-poster-label">FROM A LITTLE CURIOSITY.</span>
          <h2 class="contact-title" id="contact-title"><span data-es="HAGAMOS">LET'S MAKE</span><span class="contact-title-band" data-es="ALGO">SOMETHING</span><span class="contact-title-purple" data-es="SIGNIFICATIVO.">MEANINGFUL.</span></h2>
          <svg class="contact-title-underline" viewBox="0 0 400 35" aria-hidden="true"><path d="M7 28Q198-5 392 8"/></svg>
          <span class="contact-poster-caption"><span>TOGETHER.</span><span aria-hidden="true">↗</span></span>
        </div>
        <div class="contact-art"><img class="contact-art-image" src="/assets/profile/contact/07_gato.png" alt="Camilla’s original neon cat peeking over a laptop with a heart and MEOW lettering" width="1448" height="1086" loading="lazy" decoding="async"/></div>
      </div>
    </div>
    <div class="contact-bottom"><span class="eyebrow">GET IN TOUCH</span><div class="contact-links">${channels.map(channel=>{
      const inside=`<span class="contact-link-icon">${icon(channel.icon)}</span><span class="contact-link-copy"><span class="contact-link-title">${channel.name}</span><span class="contact-link-caption">${channel.caption}</span>${channel.url?'':'<span class="contact-availability">To be added</span>'}</span><span class="contact-link-arrow" aria-hidden="true">${channel.url?'↗':'−'}</span>`;
      // Only verified profile values create anchors. Pending channels have no href,
      // click handler, keyboard stop, or simulated interaction.
      return channel.url?`<a class="contact-link" href="${escape(channel.url)}" ${channel.download?'download':channel.name==='Email'?'':'target="_blank" rel="noopener noreferrer"'}>${inside}</a>`:`<div class="contact-link contact-link-pending">${inside}</div>`;
    }).join('')}</div></div>
  </section>`;
}

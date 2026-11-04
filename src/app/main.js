import { renderIntro, renderData, renderAbout, renderWork, renderJourney, renderTechnology, renderExploration, renderContact } from './scenes.js';
import { renderNavigation, initNavigation } from '../shared/presentation/navigation/navigation.js';
import { renderCaseDialog, initCaseDialog } from '../modules/projects/index.js';
import '../shared/presentation/styles/global.css';
import '../modules/profile/presentation/hero/hero.css';
import { initTools } from '../modules/capabilities/index.js';
import { initMotion } from './motion.js';

import { initLanguage } from '../shared/i18n/language.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../shared/presentation/navigation/navigation.css';
import '../modules/profile/presentation/about/about.css';
import '../modules/projects/presentation/work-gallery.css';
import '../modules/projects/presentation/work-space.css';
import { initWorkGallery } from '../modules/projects/index.js';

document.querySelector('#app').innerHTML = `
${renderNavigation()}
<main id="main">
${renderIntro()}
${renderAbout()}
${renderWork()}
${renderData()}
${renderJourney()}
${renderTechnology()}
${renderExploration()}
${renderContact()}
</main>${renderCaseDialog()}`;

initNavigation();
initTools(() => ScrollTrigger.refresh());
initCaseDialog();

initWorkGallery(() => ScrollTrigger.refresh());
initMotion();
initLanguage(() => requestAnimationFrame(() => ScrollTrigger.refresh()));

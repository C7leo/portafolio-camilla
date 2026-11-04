import { mountTools } from './tools-layout.jsx';
import './tools.css';

const categoryPaths = [
  '<path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 3l-4 18"/>',
  '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 10c0 4 16 4 16 0M4 15c0 4 16 4 16 0"/>',
  '<path d="M3 21h18M5 17V9h3v8M11 17V3h3v14M17 17v-6h3v6"/>',
  '<path d="m12 2 9 5v11l-9 5-9-5V7zM3 7l9 5 9-5M12 12v11"/>',
  '<path d="M6 19a5 5 0 0 1-1-10 7 7 0 0 1 13-2 6 6 0 0 1 0 12Z"/>',
  '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4M9 15l2-6 2 6m-3-2h2m3-4v6"/>',
];
function categoryIcon(index) { return `<svg viewBox="0 0 24 25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${categoryPaths[index]}</svg>`; }
export function renderTechnology() {
  return '<section class="ecosystem section-pad" id="ecosystem" aria-labelledby="tools-title"></section>';
}

export function initTools(onChange) {
  mountTools(document.querySelector('#ecosystem'), { categoryIcon, onChange });
}

import { spanish } from './translations.js';

export function initLanguage(onChange) {
  const originals = new WeakMap();
  const attributes = new WeakMap();
  let language = 'en';
  try { if (localStorage.getItem('portfolio-language') === 'es') language = 'es'; } catch { /* Storage can be disabled. */ }
  const translate = value => language === 'es' ? (spanish[value] ?? value) : value;
  const normalized = value => value.trim().replace(/\s+/g, ' ');
  const observer = new MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'characterData') visit(record.target);
      else if (record.type === 'attributes') visit(record.target);
      else record.addedNodes.forEach(visit);
    }
    observe();
  });
  function visit(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.parentElement?.closest('script, style, [data-language-controls]')) return;
      const current = normalized(node.data);
      let original = originals.get(node);
      // Interactive controls may replace text while the Spanish view is active.
      const contextual = node.parentElement?.dataset.es;
      if (!original || (current !== original && current !== (contextual ?? spanish[original]))) original = current;
      originals.set(node, original);
      const next = language === 'es' ? (contextual ?? translate(original)) : original;
      if (next !== current) node.data = node.data.replace(node.data.trim(), next);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.matches('script, style, [data-language-controls]')) return;
      let source = attributes.get(node);
      if (!source) { source = {}; attributes.set(node, source); }
      for (const name of ['aria-label', 'alt', 'title']) {
        if (!node.hasAttribute(name)) continue;
        const value = node.getAttribute(name);
        if (!(name in source) || (value !== source[name] && value !== spanish[source[name]])) source[name] = value;
        const next = translate(source[name]);
        if (value !== next) node.setAttribute(name, next);
      }
      node.childNodes.forEach(visit);
    }
  }
  function observe() {
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'alt', 'title'] });
  }
  function apply() {
    observer.disconnect();
    document.documentElement.lang = language;
    visit(document.body);
    document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    document.querySelector('[data-language-controls]').setAttribute('aria-label', language === 'es' ? 'Idioma del sitio' : 'Site language');
    document.title = language === 'es' ? 'Camilla — Software, datos y sistemas con propósito' : 'Camilla — Software, data & meaningful systems';
    observe();
    onChange?.();
  }
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    language = button.dataset.language;
    try { localStorage.setItem('portfolio-language', language); } catch { /* Switching still works without storage. */ }
    apply();
  }));
  apply();
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
}

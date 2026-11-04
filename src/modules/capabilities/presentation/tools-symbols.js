// Original vendor artwork is stored locally, with source URLs in the asset README.
const brands = {
  Angular:'angular.svg', Java:'java.svg', 'Spring Boot':'spring-boot.svg',
  'C#':'csharp.svg', 'Vue.js':'vue.svg', Python:'python.svg',
  Android:'android.svg', Flutter:'flutter.svg', Kotlin:'kotlin.svg',
  'Power BI':'power-bi.svg', PostgreSQL:'postgresql.png', Azure:'azure.svg',
  'Microsoft Fabric':'fabric.svg', 'Power Automate':'power-automate.svg',
};

// These are concepts/standards, not product brands. Give each a distinct symbol
// without suggesting experience in an undocumented vendor's implementation.
const concepts = {
  'Data validation':'<path d="M5 3h11v6M5 3v18h6M8 7h5M8 11h3"/><path d="m13 16 3 3 6-7"/>',
  'Structured datasets':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  'Technical documentation':'<path d="M5 2h9l5 5v15H5zM14 2v6h5M8 12h8M8 16h8M8 19h5"/>',
  Reporting:'<path d="M3 3v18h18M6 16l4-5 4 2 6-8M17 5h3v3"/>',
  'Data transformation':'<rect x="2" y="7" width="6" height="10" rx="1"/><rect x="16" y="3" width="6" height="7" rx="1"/><rect x="16" y="14" width="6" height="7" rx="1"/><path d="M8 12h4m0 0V6h4m-4 6v6h4"/>',
  SQL:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 10c0 4 16 4 16 0M4 15c0 4 16 4 16 0"/>',
  'Relational design':'<rect x="2" y="3" width="7" height="9" rx="1"/><rect x="15" y="12" width="7" height="9" rx="1"/><path d="M2 6h7m6 9h7M9 8h3v9h3"/><circle cx="12" cy="8" r="1"/>',
  'Lakehouse concepts':'<path d="m2 10 10-8 10 8M5 8v13h14V8"/><ellipse cx="12" cy="13" rx="4" ry="1.5"/><path d="M8 13v4c0 2 8 2 8 0v-4"/>',
  RAG:'<path d="M3 2h8l4 4v8M3 2v17h6M6 6h4M6 10h6"/><path d="M10 17h8m-3-3 3 3-3 3"/><circle cx="20" cy="6" r="2"/><path d="M18 10h4v3h-4z"/>',
  Embeddings:'<path d="M3 3v18h18M7 17l3-6 5 3 4-8"/><circle cx="7" cy="17" r="1.7"/><circle cx="10" cy="11" r="1.7"/><circle cx="15" cy="14" r="1.7"/><circle cx="19" cy="6" r="1.7"/>',
  'Document processing':'<path d="M4 2h9l4 4v6M4 2v19h6M13 2v5h4M7 10h6M7 14h3"/><path d="m12 17 3 3 6-7"/>',
  'Vector retrieval':'<circle cx="10" cy="10" r="7"/><path d="m15 15 7 7M6 12l4-5 4 4"/><circle cx="6" cy="12" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14" cy="11" r="1"/>',
};

export function toolSymbol(name) {
  if (brands[name]) return `<img class="tech-brand-logo" src="/assets/capabilities/logos/${brands[name]}" alt="" width="34" height="34" decoding="async" data-symbol="brand"/>`;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-symbol="concept">${concepts[name] || concepts['Technical documentation']}</svg>`;
}

import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import './app/shared/assets/fonts/urbanist.css';
import './styles.css';

// A tab opened before a deployment may request an old lazy chunk. Revalidate
// HTML once instead of leaving the optional UI broken; avoid offline reload loops.
window.addEventListener('vite:preloadError', (event: Event) => {
  if (!navigator.onLine) return;
  try {
    const key = 'portfolio-chunk-recovery';
    const lastAttempt = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - lastAttempt < 60000) return;
    sessionStorage.setItem(key, String(Date.now()));
  } catch { return; }
  event.preventDefault();
  window.location.reload();
});

bootstrapApplication(AppComponent, appConfig).then(() => {
  document.querySelector('app-root')?.setAttribute('data-ready', '');
  document.querySelectorAll('[data-prerender-style]').forEach(node => node.remove());
}).catch((error: unknown) => {
  delete document.documentElement.dataset.introPending;
  console.error('No se pudo iniciar el portafolio.', error);
  const root = document.querySelector('app-root');
  if (root) root.textContent = 'No se pudo cargar la página. Intenta actualizarla.';
});

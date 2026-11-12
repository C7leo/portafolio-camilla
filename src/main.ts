import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import './app/shared/assets/fonts/urbanist.css';
import './styles.css';

bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => {
  console.error('No se pudo iniciar el portafolio.', error);
  const root = document.querySelector('app-root');
  if (root) root.textContent = 'No se pudo cargar la página. Intenta actualizarla.';
});

import { test, expect } from '@playwright/test';

async function switchLanguage(page, language) {
  const menu = page.locator('.home-menu-toggle');
  if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
  await page.locator(`.language-choice[lang="${language}"]`).click();
}

async function checkSections(page, language) {
  const es = language === 'es';
  await expect(page.locator('html')).toHaveAttribute('lang', language);
  await expect(page.locator('.hero-lead')).toHaveText(es ? 'Entre la l\u00f3gica y la creatividad.' : 'Between logic and creativity.');
  await expect(page.locator('#about-title')).toHaveText(es ? 'SOBRE M\u00cd' : 'ABOUT ME');
  await expect(page.locator('#services-title')).toHaveText(es ? 'SERVICIOS' : 'SERVICES');
  await expect(page.locator('#projects-title')).toHaveText(es ? 'PROYECTOS' : 'MY WORK');
  await expect(page.locator('#experience-title')).toHaveText(es ? 'MI EXPERIENCIA' : 'MY EXPERIENCE');
  await expect(page.locator('#contact-title')).toHaveText(es ? 'CONTACTO' : 'CONTACT');
  await expect(page.locator('.service-title').first()).toHaveText(es ? 'Desarrollo de aplicaciones' : 'Application development');
  await expect(page.locator('.timeline-entry h3').first()).toHaveText(es ? 'Practicante Preprofesional de Ingenier\u00eda de Software' : 'Software Engineering Intern');
  await expect(page.locator('#contact-name')).toHaveAttribute('placeholder', es ? 'Nombre' : 'Name');
}

test('all sections switch reactively, including carousel and form errors, and survive reload', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1800, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#inicio');
  await checkSections(page, 'es');
  await page.locator('#proyectos').scrollIntoViewIfNeeded();
  await expect(page.locator('.circular-carousel[data-ready]')).toBeAttached({ timeout: 15000 });
  const carousel = page.locator('.circular-carousel');
  await carousel.evaluate(el => { window.originalCarousel = el; });
  await expect(carousel).toHaveAttribute('aria-label', 'Carrusel de proyectos');
  await switchLanguage(page, 'en');
  await checkSections(page, 'en');
  await expect(carousel).toHaveAttribute('aria-label', 'Project carousel');
  expect(await carousel.evaluate(el => el === window.originalCarousel)).toBe(true);
  await page.locator('#contacto').scrollIntoViewIfNeeded();
  await page.locator('.contact-submit').click();
  await expect(page.locator('#contact-name-error')).toHaveText('Enter your full name.');
  await page.reload();
  await checkSections(page, 'en');
  await switchLanguage(page, 'es');
  await checkSections(page, 'es');
  await expect(page.locator('body')).not.toContainText(/section\.(about|services|projects|experience|contact)/);
  expect(errors).toEqual([]);
});

test('mobile navigation switches language and accessible labels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#inicio');
  await switchLanguage(page, 'en');
  await checkSections(page, 'en');
  await expect(page.locator('.home-menu-toggle')).toHaveAttribute('aria-label', /menu/i);
  await switchLanguage(page, 'es');
  await checkSections(page, 'es');
});

test('language is restored during the intro and can change immediately afterward', async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 900 });
  await page.addInitScript(() => localStorage.setItem('portfolio-language', 'en'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#inicio', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.particle-intro__loading')).toContainText('Preparing animation');
  await page.keyboard.press('Escape');
  await switchLanguage(page, 'es');
  await checkSections(page, 'es');
});

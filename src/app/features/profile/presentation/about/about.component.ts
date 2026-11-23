import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, NgZone, OnDestroy, PLATFORM_ID } from '@angular/core';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';



@Component({ selector: 'app-about', standalone: true, imports: [TranslatePipe], templateUrl: './about.component.html', styleUrl: './about.component.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class AboutComponent implements AfterViewInit, OnDestroy {
  readonly image = new URL('./assets/about.webp', import.meta.url).href;
  readonly imageSmall = new URL('./assets/about-384.webp', import.meta.url).href;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private preference?: MediaQueryList;

  ngAfterViewInit(): void {
    if (!this.browser || typeof IntersectionObserver === 'undefined') return;
    this.preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (this.preference.matches) return;
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          this.observer?.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      this.host.querySelectorAll<HTMLElement>('[data-about-reveal]').forEach(element => {
        element.classList.add('will-reveal');
        this.observer!.observe(element);
      });
      this.preference!.addEventListener('change', this.onPreference);
    });
  }
  private readonly onPreference = (): void => {
    if (!this.preference?.matches) return;
    this.host.querySelectorAll('.will-reveal').forEach(element => element.classList.add('is-visible'));
    this.observer?.disconnect();
  };
  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.preference?.removeEventListener('change', this.onPreference);
  }
}

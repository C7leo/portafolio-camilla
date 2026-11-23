import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';
import { CodeMorphComponent } from './code-morph.component';
import { FallingRaysComponent } from './falling-rays.component';

@Component({
  selector: 'app-behind-code', standalone: true,
  imports: [TranslatePipe, CodeMorphComponent, FallingRaysComponent],
  templateUrl: './behind-code.component.html', styleUrl: './behind-code.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BehindCodeComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.zone.runOutsideAngular(() => {
      const section = this.host.querySelector<HTMLElement>('.behind-code');
      if (!section) return;
      this.observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        section.classList.add('is-visible');
        this.observer?.disconnect();
      }, { threshold: 0.08 });
      section.classList.add('can-reveal');
      this.observer.observe(section);
    });
  }
  ngOnDestroy(): void { this.observer?.disconnect(); }
}

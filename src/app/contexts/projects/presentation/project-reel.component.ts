import { EditorialGridComponent } from '../../../shared/ui/editorial-grid/editorial-grid.component';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, Input, NgZone, OnDestroy, signal, ViewChild } from '@angular/core';
import type { Project } from '../domain/project.model';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../shared/i18n/language.service';
import template from './project-reel.component.html?raw';
import styles from './project-reel.component.css?inline';

@Component({
  selector: 'app-project-reel', standalone: true, imports: [EditorialGridComponent, TranslatePipe],
  template, styles, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectReelComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) projects: readonly Project[] = [];
  @ViewChild('stage') stage!: ElementRef<HTMLElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('projectDialog') projectDialog!: ElementRef<HTMLDialogElement>;
  readonly openedProject = signal<Project | null>(null);
  readonly fallback = signal(matchMedia('(prefers-reduced-motion: reduce)').matches);
  readonly selected = signal(0);
  private readonly language = inject(LanguageService);
  private readonly zone = inject(NgZone);
  private dispose?: () => void;
  private destroyed = false;

  get description(): string {
    const project = this.projects[this.selected()];
    return project ? `${project.name}. ${this.language.translate(project.description)} ${this.language.translate('Usa las flechas para explorar los proyectos. Inicio vuelve al primero.')}` : '';
  }

  async ngAfterViewInit(): Promise<void> {
    if (this.fallback()) return;
    try {
      const { createProjectReel } = await import('./graphics/project-reel');
      if (this.destroyed) return;
      this.zone.runOutsideAngular(() => {
        this.dispose = createProjectReel(this.canvas.nativeElement, this.stage.nativeElement, this.projects, {
          select: index => this.zone.run(() => this.selected.set(index)),
          activate: index => this.zone.run(() => this.openProject(index)),
          unavailable: () => this.zone.run(() => this.fallback.set(true)),
        });
      });
    } catch {
      if (!this.destroyed) this.fallback.set(true);
    }
  }

  openProject(index: number): void {
    const project = this.projects[index];
    if (!project) return;
    this.openedProject.set(project);
    this.projectDialog.nativeElement.showModal();
  }

  closeProject(): void { this.projectDialog.nativeElement.close(); }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target !== this.projectDialog.nativeElement) return;
    const rect = this.projectDialog.nativeElement.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.closeProject();
  }

  ngOnDestroy(): void { this.destroyed = true; this.projectDialog?.nativeElement.close(); this.dispose?.(); }
}

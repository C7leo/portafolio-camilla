import { EditorialGridComponent } from '../../../shared/ui/editorial-grid/editorial-grid.component';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, Input, NgZone, OnDestroy, signal, ViewChild } from '@angular/core';
import { ProjectRing } from './project-ring';
import { ProjectSummaryComponent } from './project-summary.component';
import type { Project } from '../domain/project.model';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import template from './project-showcase.component.html?raw';
import styles from './project-showcase.component.css?inline';

@Component({
  selector: 'app-project-showcase', standalone: true, imports: [EditorialGridComponent, TranslatePipe, ProjectSummaryComponent],
  template, styles, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectShowcaseComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) projects: readonly Project[] = [];
  @ViewChild('projectDialog') projectDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('ringWall') ringWall!: ElementRef<HTMLElement>;
  readonly paused = signal(false);
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private ring?: ProjectRing;
  readonly openedProject = signal<Project | null>(null);
  private returnFocus?: HTMLElement;

  get ringSlots(): readonly Project[] { return [...this.projects, ...this.projects]; }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.ring = new ProjectRing(this.ringWall.nativeElement);
    });
  }

  step(direction: number): void { this.ring?.step(direction); }

  toggleMotion(): void {
    this.paused.update(value => !value);
    this.ring?.setPaused(this.paused());
  }

  pauseForFocus(value: boolean): void { this.ring?.setPaused(value || this.paused()); }

  openProject(index: number, event: Event): void {
    const project = this.projects[index];
    if (!project) return;
    const trigger = event.currentTarget as HTMLElement;
    this.returnFocus = trigger.classList.contains('ring-card')
      ? this.host.nativeElement.querySelectorAll<HTMLElement>('.project-open')[index]
      : trigger;
    this.openedProject.set(project);
    this.ring?.setPaused(true);
    this.projectDialog.nativeElement.showModal();
  }

  closeProject(): void { this.projectDialog.nativeElement.close(); }

  restoreProjectFocus(): void {
    // Native dialogs may dispatch `close` after the user has already moved focus.
    // Restore a lost/dialog focus without stealing it from another control.
    const dialog = this.projectDialog.nativeElement;
    const active = dialog.ownerDocument.activeElement;
    if (active === dialog.ownerDocument.body || active === dialog || (active && dialog.contains(active))) {
      this.returnFocus?.focus({ preventScroll: true });
    }
    this.ring?.setPaused(this.paused());
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target !== this.projectDialog.nativeElement) return;
    const rect = this.projectDialog.nativeElement.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.closeProject();
  }

  ngOnDestroy(): void { this.ring?.destroy(); this.projectDialog?.nativeElement.close(); }
}

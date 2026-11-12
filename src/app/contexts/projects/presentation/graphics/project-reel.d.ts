import type { Project } from '../../domain/project.model';
export function createProjectReel(canvas: HTMLCanvasElement, stage: HTMLElement, projects: readonly Project[], options: {
  select: (index: number) => void;
  activate: (index: number) => void;
  unavailable: () => void;
}): () => void;

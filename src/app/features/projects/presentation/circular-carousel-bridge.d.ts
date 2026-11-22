export interface CarouselLabels { region: string; carousel: string; slide: string; of: string; image: string; }
import type { Project } from '../domain/project.model';
export declare function mountCircularCarousel(
  element: HTMLElement, projects: readonly Project[], onChange: (index: number) => void, onReady: (() => void) | undefined, labels: CarouselLabels,
): { setLabels(labels: CarouselLabels): void; select(index: number): void; setAutoplay(enabled: boolean): void; destroy(): void };

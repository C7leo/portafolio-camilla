export function mountExperienceValley(host: HTMLElement, options: {
  state: { progress: number };
  preview?: HTMLCanvasElement;
  ready(value: boolean): void;
}): { update(): void; dispose(): void };

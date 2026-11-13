/** A portfolio project and its owner-supplied publication references. */
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly problem: string;
  readonly solution: string;
  readonly technologies: readonly string[];
  readonly image: string | null;
  readonly imageAlt: string;
  readonly detailRoute: string;
  readonly landingUrl: string;
  readonly repositoryUrl: string;
}

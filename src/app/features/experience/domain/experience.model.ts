/** Professional information supplied by the portfolio owner. */
export interface Experience {
  readonly id: string;
  readonly period: string;
  readonly company: string;
  readonly role: string;
  readonly description: string;
  readonly technologies: readonly string[];
}

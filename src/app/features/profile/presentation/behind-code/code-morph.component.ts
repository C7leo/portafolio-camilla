import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';

type Example = 'development' | 'data' | 'automation';
interface Token { key: string; text: string; kind: string; }
const EXAMPLES: Record<Example, string> = {
  development: `import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-greeting',
  standalone: true,
  template: '<p>{{ greeting() }}</p>'
})
export class GreetingComponent {
  readonly name = signal('Camilla');
  readonly greeting = computed(() =>
    \`Hello, \${this.name()}!\`
  );
}`,
  data: `WITH monthly_totals AS (
  SELECT
    customer_id,
    DATE_TRUNC('month', paid_at) AS month,
    SUM(amount) AS revenue
  FROM payments
  WHERE status = 'paid'
  GROUP BY customer_id, DATE_TRUNC('month', paid_at)
)
SELECT month, SUM(revenue) AS total_revenue
FROM monthly_totals
GROUP BY month
ORDER BY month;`,
  automation: `from csv import DictReader
from pathlib import Path

def count_records(folder: Path) -> int:
    total = 0
    for file in folder.glob('*.csv'):
        with file.open(encoding='utf-8', newline='') as data:
            total += sum(1 for _ in DictReader(data))
    return total

if __name__ == '__main__':
    records = count_records(Path('data'))
    print(f'Processed {records} records')`,
};
const KEYWORDS = new Set('import from export class readonly const return true as with select date_trunc sum from where group by order def for in with return if async await'.split(' '));

function tokenize(source: string): Token[] {
  const counts = new Map<string, number>();
  return (source.match(/\s+|(?:'[^'\n]*'|"[^"\n]*"|`[^`\n]*`)|[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|./g) ?? []).map(text => {
    const count = counts.get(text) ?? 0;
    counts.set(text, count + 1);
    const kind = /^\s+$/.test(text) ? 'space' : /^['"`]/.test(text) ? 'string' : KEYWORDS.has(text.toLowerCase()) ? 'keyword' : /^\d/.test(text) ? 'number' : /^[A-Z][\w$]*$/.test(text) ? 'type' : 'plain';
    return { key: `${text}:${count}`, text, kind };
  });
}

@Component({
  selector: 'app-code-morph', standalone: true, imports: [TranslatePipe],
  templateUrl: './code-morph.component.html', styleUrl: './code-morph.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-no-blur': '' },
})
export class CodeMorphComponent implements AfterViewInit, OnDestroy {
  readonly tabs: { id: Example; label: string; file: string }[] = [
    { id: 'development', label: 'Desarrollo', file: 'greeting.component.ts' },
    { id: 'data', label: 'Datos', file: 'monthly-revenue.sql' },
    { id: 'automation', label: 'Automatización', file: 'count_records.py' },
  ];
  readonly active = signal<Example>('development');
  readonly tokens = signal<Token[]>(tokenize(EXAMPLES.development));
  readonly copyState = signal<'idle' | 'copied' | 'error'>('idle');
  get lineNumbers(): number[] { return Array.from({ length: EXAMPLES[this.active()].split('\n').length }, (_, i) => i + 1); }
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private animations: Animation[] = [];
  private ghosts: HTMLElement[] = [];
  private frame = 0;
  private copyTimer = 0;
  private destroyed = false;
  private sequence = 0;

  ngAfterViewInit(): void { /* The editor stays static until the visitor chooses a tab. */ }

  select(id: Example): void {
    if (id === this.active()) return;
    this.clearMotion();
    const sequence = this.sequence;
    clearTimeout(this.copyTimer);
    this.copyState.set('idle');
    const next = tokenize(EXAMPLES[id]);
    const keys = new Set(next.filter(token => token.kind !== 'space').map(token => token.key));
    const code = this.host.querySelector<HTMLElement>('.code-text');
    const layer = this.host.querySelector<HTMLElement>('.code-ghosts');
    const previous = new Map<string, DOMRect>();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (code && layer && !reduced && typeof Element.prototype.animate === 'function') {
      const layerRect = layer.getBoundingClientRect();
      code.querySelectorAll<HTMLElement>('[data-token-key]').forEach(element => {
        const key = element.dataset.tokenKey!;
        const rect = element.getBoundingClientRect();
        previous.set(key, rect);
        if (!keys.has(key) && rect.width && rect.height) {
          const ghost = element.cloneNode(true) as HTMLElement;
          ghost.style.left = `${rect.left - layerRect.left}px`;
          ghost.style.top = `${rect.top - layerRect.top}px`;
          layer.append(ghost);
          this.ghosts.push(ghost);
          const animation = ghost.animate([{ opacity: .75 }, { opacity: 0, transform: 'translateY(-4px)' }], { duration: 260, easing: 'ease-out', fill: 'forwards' });
          this.animations.push(animation);
          void animation.finished.then(() => ghost.remove(), () => ghost.remove());
        }
      });
    }
    this.active.set(id);
    this.tokens.set(next);
    if (reduced || !code || !previous.size) return;
    this.zone.runOutsideAngular(() => {
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        if (this.destroyed) return;
        code.querySelectorAll<HTMLElement>('[data-token-key]').forEach((element, index) => {
          const old = previous.get(element.dataset.tokenKey!);
          const current = element.getBoundingClientRect();
          const frames = old
            ? [{ transform: `translate(${old.left - current.left}px, ${old.top - current.top}px)` }, { transform: 'translate(0, 0)' }]
            : [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }];
          const animation = element.animate(frames, { duration: old ? 700 : 380, delay: old ? 0 : Math.min(index * 3, 180), easing: 'cubic-bezier(.2,.7,.2,1)' });
          this.animations.push(animation);
        });
        void Promise.allSettled(this.animations.map(animation => animation.finished)).then(() => {
          if (this.sequence !== sequence) return;
          this.animations = [];
          this.ghosts = [];
        });
      });
    });
  }

  onTabKey(event: KeyboardEvent, index: number): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? this.tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + this.tabs.length) % this.tabs.length;
    this.select(this.tabs[next].id);
    this.host.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus({ preventScroll: true });
  }

  async copy(): Promise<void> {
    const example = this.active();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(EXAMPLES[example]);
      if (!this.destroyed && this.active() === example) this.copyState.set('copied');
    } catch { if (!this.destroyed && this.active() === example) this.copyState.set('error'); }
    if (!this.destroyed && this.active() === example) { clearTimeout(this.copyTimer); this.copyTimer = window.setTimeout(() => this.copyState.set('idle'), 2200); }
  }

  private clearMotion(): void {
    this.sequence += 1;
    cancelAnimationFrame(this.frame); this.frame = 0;
    this.animations.forEach(animation => animation.cancel()); this.animations = [];
    this.ghosts.forEach(ghost => ghost.remove()); this.ghosts = [];
  }
  ngOnDestroy(): void { this.destroyed = true; clearTimeout(this.copyTimer); this.clearMotion(); }
}

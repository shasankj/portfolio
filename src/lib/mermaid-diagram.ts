// Build-time Mermaid -> animatable SVG. Authoring convention (see CLAUDE.md):
//   src/diagrams/<name>.mmd, a flowchart, with ONE comment line mapping node ids to steps:
//   %% steps: A=1 B=2 C=3 D=3
// A node gets its step; every edge gets the step of the node it points INTO. Same rule as hand-authored SVG.
// Needs a Playwright browser at build time (CI: `npx playwright install chromium`;
// locally: MERMAID_BROWSER_CHANNEL=chrome to use installed Chrome).
import { createMermaidRenderer, type MermaidRenderer } from 'mermaid-isomorphic';

let renderer: MermaidRenderer | undefined;

export async function renderMermaidDiagram(source: string): Promise<string> {
  renderer ??= createMermaidRenderer({
    launchOptions: process.env.MERMAID_BROWSER_CHANNEL ? { channel: process.env.MERMAID_BROWSER_CHANNEL } : {},
  });
  const [res] = await renderer([source], {
    prefix: 'mmd',
    mermaidConfig: { theme: 'base', flowchart: { htmlLabels: false, curve: 'basis', padding: 16 }, themeVariables: { fontFamily: 'monospace', fontSize: '13px' } },
  });
  if (res.status !== 'fulfilled') throw new Error(`Mermaid render failed: ${String((res as PromiseRejectedResult).reason)}`);
  let svg = res.value.svg;

  const line = source.match(/^\s*%%\s*steps?:\s*(.+)$/im);
  const steps = new Map<string, number>();
  line?.[1].split(/\s+/).forEach((pair) => {
    const [id, n] = pair.split('=');
    if (id && Number(n)) steps.set(id, Number(n));
  });

  // Mermaid prefixes ids (e.g. "mmd-0-flowchart-A-0", "mmd-0-L_A_B_0"), so match on the tag as a whole.
  svg = svg.replace(/<(g|path)\b[^>]*>/g, (tag, name) => {
    if (name === 'g') {
      const id = tag.match(/\bid="[^"]*?flowchart-([A-Za-z0-9]+)-\d+"/)?.[1];
      return id && steps.has(id) ? tag.replace(/>$/, ` data-step="${steps.get(id)}">`) : tag;
    }
    const to = tag.match(/\bid="[^"]*?L_[A-Za-z0-9]+_([A-Za-z0-9]+)_\d+"/)?.[1]; // an edge points INTO `to`
    if (!to || !steps.has(to)) return tag;
    const withStep = tag.replace(/>$/, ` data-step="${steps.get(to)}">`);
    return /class="/.test(withStep) ? withStep.replace('class="', 'class="edge ') : withStep.replace('<path', '<path class="edge"');
  });
  return svg.replace('<svg ', '<svg class="diagram mermaid-diagram" ');
}

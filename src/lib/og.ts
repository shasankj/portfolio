// Open Graph card renderer: satori (layout -> SVG) + resvg (SVG -> PNG), at build time, in the site's Blueprint style.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const font = (pkg: string, file: string) => readFileSync(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file));
const fonts = [
  { name: 'Martian Mono', data: font('martian-mono', 'martian-mono-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'Martian Mono', data: font('martian-mono', 'martian-mono-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'IBM Plex Sans', data: font('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
];

const INK = '#14213d', PAPER = '#f3f0e8', MUTED = '#4a5568', LINE = '#cfc8b8';
type Node = { type: string; props: { style?: Record<string, unknown>; children?: unknown; [k: string]: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style: { display: 'flex', ...style }, children } });

function hash(seed: string) {
  let x = 2166136261;
  for (const c of seed) x = Math.imul(x ^ c.charCodeAt(0), 16777619);
  return () => ((x = Math.imul(x ^ (x >>> 15), 2246822507) >>> 0), (x % 1000) / 1000);
}

export interface OgInput { title: string; summary?: string; eyebrow?: string; accent?: string; seed?: string }

export async function renderOg({ title, summary, eyebrow, accent = '#b3350a', seed = title }: OgInput): Promise<Buffer> {
  const rnd = hash(seed);
  const rails = [0, 1, 2, 3, 4, 5, 6].map((i) => 70 + i * 82);
  const packets = Array.from({ length: 14 }, () => ({ r: Math.floor(rnd() * 6), x: 870 + Math.floor(rnd() * 28) * 10, big: rnd() > 0.65 }));
  const size = title.length > 34 ? 56 : title.length > 22 ? 68 : 80;

  const tree = h('div', { width: 1200, height: 630, background: PAPER, position: 'relative', fontFamily: 'IBM Plex Sans' }, [
    ...rails.map((y) => h('div', { position: 'absolute', left: 0, top: y, width: 1200, height: 1, background: LINE })),
    ...packets.map((p) => h('div', { position: 'absolute', left: p.x, top: rails[p.r] - (p.big ? 9 : 5), width: p.big ? 18 : 10, height: p.big ? 18 : 10, background: p.big ? accent : INK, opacity: p.big ? 1 : 0.5 })),
    h('div', { position: 'absolute', left: 0, top: 0, width: 16, height: 630, background: accent }),
    h('div', { position: 'absolute', left: 72, top: 64, flexDirection: 'column', width: 760 }, [
      h('div', { fontFamily: 'Martian Mono', fontSize: 22, letterSpacing: 2, color: MUTED, textTransform: 'uppercase' }, eyebrow ?? 'Portfolio'),
      h('div', { fontFamily: 'Martian Mono', fontWeight: 600, fontSize: size, color: INK, letterSpacing: -3, lineHeight: 1.05, marginTop: 34 }, title),
      summary ? h('div', { fontSize: 30, color: MUTED, lineHeight: 1.4, marginTop: 30 }, summary.length > 150 ? summary.slice(0, 147) + '…' : summary) : h('div', {}, ''),
    ]),
    h('div', { position: 'absolute', left: 72, bottom: 52, fontFamily: 'Martian Mono', fontSize: 24, color: INK, alignItems: 'center' }, [
      h('div', { fontWeight: 600 }, 'Shasank Jabade'),
      h('div', { color: accent, marginLeft: 6 }, '_'),
      h('div', { color: MUTED, marginLeft: 24, fontWeight: 400 }, 'Distributed systems · agentic AI'),
    ]),
  ]);

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}

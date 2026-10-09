import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOg, type OgInput } from '../../lib/og';
import { getProjects, getWork, getNotes } from '../../lib/content';
import { site } from '../../data/site';

// One card per page type, generated at build time: /og/default.png, /og/projects-<slug>.png, /og/work-<slug>.png, /og/notes-<slug>.png
export const getStaticPaths: GetStaticPaths = async () => {
  const [projects, work, notes] = await Promise.all([getProjects(), getWork(), getNotes()]);
  const status = (s: string) => s.replace('-', ' ');
  const entries: Array<[string, OgInput]> = [
    ['default', { title: site.name, summary: site.description, eyebrow: 'Portfolio' }],
    ...projects.map((p): [string, OgInput] => [`projects-${p.data.slug}`, { title: p.data.title, summary: p.data.summary, eyebrow: `Project · ${status(p.data.status)}`, accent: p.data.accentColor, seed: p.data.slug }]),
    ...work.map((w): [string, OgInput] => [`work-${w.data.slug}`, { title: w.data.title, summary: w.data.summary, eyebrow: 'Work case study', accent: w.data.accentColor, seed: w.data.slug }]),
    ...notes.map((n): [string, OgInput] => [`notes-${n.data.slug}`, { title: n.data.title, summary: n.data.description, eyebrow: 'Note', seed: n.data.slug }]),
  ];
  return entries.map(([slug, input]) => ({ params: { slug }, props: { input } }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props.input as OgInput);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};

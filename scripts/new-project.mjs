// Usage: npm run new-project -- "Project Name"
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const name = process.argv.slice(2).join(' ').trim();
if (!name) {
  console.error('Usage: npm run new-project -- "Project Name"');
  process.exit(1);
}
const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
if (!slug) { console.error('Could not derive a slug from that name.'); process.exit(1); }

const target = join(root, 'src/content/projects', `${slug}.mdx`);
if (existsSync(target)) { console.error(`Already exists: src/content/projects/${slug}.mdx`); process.exit(1); }

const today = new Date().toISOString().slice(0, 10);
const out = readFileSync(join(root, 'src/content/projects/_template.mdx'), 'utf8')
  .replace('title: "Project Name"', `title: ${JSON.stringify(name)}`)
  .replaceAll('"project-name"', JSON.stringify(slug))
  .replace('date: 2026-01-01', `date: ${today}`);
writeFileSync(target, out);

// Starter diagram so the page builds; replace with the real architecture.
const svgPath = join(root, 'src/diagrams', `${slug}.svg`);
if (!existsSync(svgPath)) {
  writeFileSync(svgPath, `<svg class="diagram" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" focusable="false">
  <g class="node" data-step="1"><rect x="10" y="30" width="140" height="60" rx="2"/><text x="80" y="56">Start</text><text class="sub" x="80" y="74">replace me</text></g>
</svg>
`);
}
console.log(`Created src/content/projects/${slug}.mdx and src/diagrams/${slug}.svg (draft: true).`);
console.log('Next: fill in the frontmatter, then run "npm run dev". Or use /add-project in Claude Code.');

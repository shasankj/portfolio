// Internal link checker for the built site: every href/src that points inside the site must resolve to a file in dist/,
// and every #anchor must exist in the target page. External links are listed but not fetched (sites like LinkedIn block bots).
// Usage: npm run build && npm run links      (BASE_PATH=/portfolio npm run links  if you built with a base path)
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const dist = resolve('dist');
const base = (process.env.BASE_PATH ?? '/').replace(/\/$/, '');
const htmlFiles = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && htmlFiles.push(p); } })(dist);

const ids = new Map();
const idsOf = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(file);
};
const toFile = (urlPath) => {
  let p = decodeURIComponent(urlPath);
  if (base && p.startsWith(base)) p = p.slice(base.length) || '/';
  const full = join(dist, p);
  if (existsSync(full) && statSync(full).isFile()) return full;
  if (existsSync(join(full, 'index.html'))) return join(full, 'index.html');
  return null;
};

const problems = [];
const externals = new Set();
let checked = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const pageUrl = '/' + file.slice(dist.length + 1).replace(/index\.html$/, '');
  for (const m of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const raw = m[1].replace(/&amp;/g, '&');
    if (!raw || raw.startsWith('data:') || raw.startsWith('javascript:')) continue;
    if (/^(https?:)?\/\//.test(raw)) { externals.add(raw); continue; }
    if (raw.startsWith('mailto:') || raw.startsWith('tel:')) continue;
    checked++;
    const [pathPart, hash] = raw.split('#');
    const target = pathPart ? toFile(new URL(pathPart.split('?')[0], 'http://x' + (base ? '' : '') + pageUrl).pathname) : file;
    if (!target) { problems.push(`${pageUrl}  ->  ${raw}  (file not found)`); continue; }
    if (hash && target.endsWith('.html') && !idsOf(target).has(hash)) problems.push(`${pageUrl}  ->  ${raw}  (anchor #${hash} not found)`);
  }
}
console.log(`Checked ${checked} internal links across ${htmlFiles.length} pages. ${externals.size} external links not fetched.`);
if (problems.length) { console.error('\nBroken links:\n' + [...new Set(problems)].map((p) => '  ' + p).join('\n')); process.exit(1); }
console.log('No broken internal links.');

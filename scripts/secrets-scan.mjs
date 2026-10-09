// Read-only secrets check for a project folder. Never prints a secret in full (first 4 characters, then ***).
// Usage: node scripts/secrets-scan.mjs "<path to project folder>"
// Only runs read-only git commands (ls-files, log -p, check-ignore). Never modifies anything.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? '');
if (!process.argv[2] || !existsSync(dir)) { console.error('Usage: node scripts/secrets-scan.mjs "<project folder>"'); process.exit(1); }

const isRepo = existsSync(join(dir, '.git'));
const git = (...args) => { try { return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return ''; } };
const mask = (s) => (s.length > 8 ? `${s.slice(0, 4)}***` : '***');

const patterns = [
  ['AWS access key id', /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g],
  ['Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{10,}/g],
  ['OpenAI-style key', /\bsk-[A-Za-z0-9]{20,}/g],
  ['Google API key (Gemini)', /\bAIza[0-9A-Za-z_-]{30,}/g],
  ['Private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
  ['Connection string with credentials', /\b[a-z+]+:\/\/[^\s:@/'"]+:[^\s@/'"]{3,}@[^\s'"]+/gi],
  ['Azure storage / key', /\b(AccountKey|SharedAccessKey)=[A-Za-z0-9+/=]{20,}/g],
  ['Hard-coded secret assignment', /\b(password|passwd|secret|api[_-]?key|token)\b["']?\s*[:=]\s*["'][^"'\s${<][^"'\s]{7,}["']/gi],
];
const placeholder = /(example|placeholder|your[_-]|changeme|replace|xxxx|\*\*\*|<.+>|dummy|fake|test)/i;

const report = { envFiles: [], workingTree: [], history: [] };

// 1. env-like files: present on disk, tracked, and ever committed
const skip = new Set(['node_modules', '.git', '.venv', 'venv', 'dist', 'build', '__pycache__', '.next', '.astro']);
const onDisk = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    if (skip.has(f)) continue;
    const p = join(d, f);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/^\.env/.test(f) || /\.(pem|key|p12|pfx)$/.test(f) || /credentials/i.test(f)) onDisk.push(p.slice(dir.length + 1));
  }
})(dir);
const tracked = new Set(isRepo ? git('ls-files').split('\n').filter(Boolean) : []);
const everCommitted = new Set(isRepo ? git('log', '--all', '--name-only', '--pretty=format:').split('\n').filter(Boolean) : []);
for (const f of onDisk) {
  const ignored = isRepo ? git('check-ignore', f).trim() !== '' : null;
  report.envFiles.push({ file: f, tracked: tracked.has(f), everCommitted: everCommitted.has(f), gitignored: ignored, example: /example|sample|template/i.test(f) });
}

// 2. working tree (tracked files if a repo, otherwise every text file)
const files = isRepo ? [...tracked] : onDisk;
const binary = /\.(png|jpe?g|gif|ico|svg|woff2?|ttf|pdf|zip|gz|lock|map)$|package-lock\.json$/i;
for (const f of files) {
  if (binary.test(f)) continue;
  let text; try { text = readFileSync(join(dir, f), 'utf8'); } catch { continue; }
  text.split('\n').forEach((line, i) => {
    for (const [name, re] of patterns) for (const m of line.matchAll(re)) {
      if (placeholder.test(m[0])) continue;
      report.workingTree.push({ where: `${f}:${i + 1}`, kind: name, sample: mask(m[0]) });
    }
  });
}

// 3. git history
if (isRepo) {
  const patch = git('log', '-p', '--all', '--no-color');
  let commit = '', file = '';
  const seen = new Set();
  for (const line of patch.split('\n')) {
    if (line.startsWith('commit ')) commit = line.slice(7, 14);
    else if (line.startsWith('+++ b/')) file = line.slice(6);
    else if (line.startsWith('+') && !line.startsWith('+++')) {
      for (const [name, re] of patterns) for (const m of line.matchAll(re)) {
        if (placeholder.test(m[0])) continue;
        const key = `${commit}|${file}|${name}|${m[0]}`;
        if (seen.has(key)) continue;
        seen.add(key);
        report.history.push({ where: `${commit} ${file}`, kind: name, sample: mask(m[0]) });
      }
    }
  }
}

const out = (title, rows, fmt) => { console.log(`\n${title}: ${rows.length}`); rows.slice(0, 50).forEach((r) => console.log('  ' + fmt(r))); if (rows.length > 50) console.log(`  ... ${rows.length - 50} more`); };
console.log(`Secrets scan: ${dir}${isRepo ? '' : '  (not a git repository: history not checked)'}`);
out('Env-like files on disk', report.envFiles, (r) => `${r.file}  tracked=${r.tracked}  everCommitted=${r.everCommitted}  gitignored=${r.gitignored}${r.example ? '  (example file)' : ''}`);
out('Pattern matches in working tree (placeholders skipped)', report.workingTree, (r) => `${r.where}  ${r.kind}  ${r.sample}`);
out('Pattern matches in git history (added lines, placeholders skipped)', report.history, (r) => `${r.where}  ${r.kind}  ${r.sample}`);
const bad = report.envFiles.filter((r) => !r.example && (r.tracked || r.everCommitted));
console.log(bad.length || report.workingTree.length || report.history.length ? '\nReview the items above. Treat anything real as compromised: rotate it, then clean history. Do not put it in the portfolio.' : '\nNo findings.');

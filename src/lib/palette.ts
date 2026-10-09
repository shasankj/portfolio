// Command palette (Cmd/Ctrl+K). Lazy-loaded on first open. Native <dialog> gives focus trapping and Esc.
import { navigate } from 'astro:transitions/client';
import { isDark, reducedMotion, setReducedMotion, toast, toggleTheme } from './ui';

interface Item { group: string; label: string; hint?: string; href?: string; action?: string }
interface Data { items: Item[]; email: string; resume: string }

let data: Data | null = null;
let shown: Item[] = [];
let active = 0;

const q = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function allItems(): Item[] {
  data ??= JSON.parse(document.getElementById('palette-data')!.textContent!);
  return data!.items.map((i) => {
    if (i.action === 'theme') return { ...i, label: isDark() ? 'Switch to light theme' : 'Switch to dark theme' };
    if (i.action === 'motion') return { ...i, label: reducedMotion() ? 'Turn reduced motion off' : 'Turn reduced motion on' };
    return i;
  });
}

function filter(text: string): Item[] {
  const terms = text.toLowerCase().split(/\s+/).filter(Boolean);
  const items = allItems();
  if (!terms.length) return items;
  return items
    .map((i) => ({ i, hay: `${i.label} ${i.hint ?? ''} ${i.group}`.toLowerCase(), l: i.label.toLowerCase() }))
    .filter((x) => terms.every((t) => x.hay.includes(t)))
    .sort((a, b) => Number(b.l.startsWith(terms[0])) - Number(a.l.startsWith(terms[0])))
    .map((x) => x.i);
}

function render() {
  const list = q<HTMLUListElement>('pal-list');
  const input = q<HTMLInputElement>('pal-input');
  list.replaceChildren();
  let lastGroup = '';
  shown.forEach((item, idx) => {
    if (item.group !== lastGroup) {
      lastGroup = item.group;
      const g = document.createElement('li');
      g.className = 'pal-group'; g.setAttribute('role', 'presentation'); g.textContent = item.group;
      list.appendChild(g);
    }
    const li = document.createElement('li');
    li.id = `pal-opt-${idx}`; li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(idx === active));
    li.className = 'pal-opt';
    const b = document.createElement('b'); b.textContent = item.label; li.appendChild(b);
    if (item.hint) { const s = document.createElement('span'); s.textContent = item.hint; li.appendChild(s); }
    li.addEventListener('pointermove', () => { if (active !== idx) { active = idx; mark(); } });
    li.addEventListener('click', () => run(item));
    list.appendChild(li);
  });
  input.setAttribute('aria-activedescendant', shown.length ? `pal-opt-${active}` : '');
  q('pal-status').textContent = shown.length ? `${shown.length} results` : 'No results';
}

function mark() {
  const opts = q('pal-list').querySelectorAll<HTMLElement>('.pal-opt');
  opts.forEach((o, i) => o.setAttribute('aria-selected', String(i === active)));
  opts[active]?.scrollIntoView({ block: 'nearest' });
  q('pal-input').setAttribute('aria-activedescendant', `pal-opt-${active}`);
}

function close() { q<HTMLDialogElement>('palette').close(); }

function run(item: Item) {
  close();
  if (item.href) {
    if (/^https?:/.test(item.href)) window.open(item.href, '_blank', 'noopener');
    else navigate(item.href);
    return;
  }
  switch (item.action) {
    case 'theme': toggleTheme(); break;
    case 'motion': setReducedMotion(!reducedMotion()); toast(reducedMotion() ? 'Reduced motion on' : 'Reduced motion off'); break;
    case 'email':
      navigator.clipboard?.writeText(data!.email).then(() => toast('Email copied'), () => toast(data!.email));
      break;
    case 'resume': {
      const a = document.createElement('a');
      a.href = data!.resume; a.download = 'Shasank_Jabade_Resume.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      break;
    }
  }
}

function wire() {
  const dlg = q<HTMLDialogElement>('palette');
  if (dlg.dataset.wired) return;
  dlg.dataset.wired = '1';
  const input = q<HTMLInputElement>('pal-input');
  input.addEventListener('input', () => { shown = filter(input.value); active = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (shown.length) { active = (active + 1) % shown.length; mark(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) { active = (active - 1 + shown.length) % shown.length; mark(); } }
    else if (e.key === 'Enter') { e.preventDefault(); if (shown[active]) run(shown[active]); }
  });
  // Click on the backdrop closes.
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
}

export function openPalette() {
  const dlg = q<HTMLDialogElement>('palette');
  if (!dlg) return;
  wire();
  if (dlg.open) { close(); return; }
  const input = q<HTMLInputElement>('pal-input');
  input.value = '';
  shown = filter('');
  active = 0;
  render();
  dlg.showModal();
  input.focus();
}

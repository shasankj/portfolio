// Small shared helpers: motion preference (system + manual, persisted), theme toggle, toast.
const root = () => document.documentElement;

/** True when the system asks for reduced motion OR the visitor turned the manual toggle on. */
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches || root().dataset.motion === 'reduce';

export function setReducedMotion(on: boolean) {
  if (on) root().dataset.motion = 'reduce';
  else delete root().dataset.motion;
  try { on ? localStorage.setItem('motion', 'reduce') : localStorage.removeItem('motion'); } catch {}
  syncMotionButtons();
  document.dispatchEvent(new Event('motionchange'));
}

export function syncMotionButtons() {
  const on = root().dataset.motion === 'reduce';
  document.querySelectorAll<HTMLElement>('[data-motion-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
}

export const isDark = () => (root().dataset.theme ? root().dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);

export function toggleTheme() {
  const next = isDark() ? 'light' : 'dark';
  root().dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
}

let toastTimer: number | undefined;
export function toast(message: string) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2200);
}

/** Run on first load and after every client-side navigation. */
export const onPage = (fn: () => void) => document.addEventListener('astro:page-load', fn);

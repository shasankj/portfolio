// Micro-interactions and scroll storytelling. Vanilla on purpose: keeps the initial JS tiny.
// Re-runs after every client-side navigation and when the reduced-motion preference changes.
import { reducedMotion } from './ui';

let cleanups: Array<() => void> = [];

export function initInteractions() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  const reduce = reducedMotion();
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const on = <T extends EventTarget>(t: T, ev: string, fn: (e: any) => void, opts?: AddEventListenerOptions) => {
    t.addEventListener(ev, fn, opts);
    cleanups.push(() => t.removeEventListener(ev, fn, opts));
  };

  // ---- Reveal: section headings, timeline roles (CSS hides them only while html.js and motion is allowed) ----
  const revealEls = document.querySelectorAll<HTMLElement>('.section h1, .section h2, .cs-section > h2, .role');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { (e.target as HTMLElement).classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    revealEls.forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());
  }

  // ---- Count-up for metric numbers. The full final text is kept for assistive tech. ----
  document.querySelectorAll<HTMLElement>('b[data-count]').forEach((el) => {
    const final = el.textContent ?? '';
    el.setAttribute('aria-label', final);
    if (reduce || !/\d/.test(final) || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 900;
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = final.replace(/\d+(?:\.\d+)?/g, (m) => {
          const dec = (m.split('.')[1] ?? '').length;
          return (parseFloat(m) * eased).toFixed(dec);
        });
        if (k < 1) requestAnimationFrame(step); else el.textContent = final;
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    cleanups.push(() => { io.disconnect(); el.textContent = final; });
  });

  // ---- Pointer effects: fine pointers only. Touch gets the :active/:focus equivalents in CSS. ----
  if (fine && !reduce) {
    // Magnetic buttons
    document.querySelectorAll<HTMLElement>('.btn.primary, .hero .actions .btn, [data-magnetic]').forEach((b) => {
      on(b, 'pointermove', (e: PointerEvent) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.22, y = (e.clientY - (r.top + r.height / 2)) * 0.3;
        b.style.setProperty('--mx', `${Math.max(-7, Math.min(7, x))}px`);
        b.style.setProperty('--my', `${Math.max(-5, Math.min(5, y))}px`);
      });
      on(b, 'pointerleave', () => { b.style.removeProperty('--mx'); b.style.removeProperty('--my'); });
    });
    // Cursor-aware card tilt + spotlight
    document.querySelectorAll<HTMLElement>('.card').forEach((c) => {
      on(c, 'pointermove', (e: PointerEvent) => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ry', `${((px - 0.5) * 6).toFixed(2)}deg`);
        c.style.setProperty('--rx', `${((0.5 - py) * 5).toFixed(2)}deg`);
        c.style.setProperty('--sx', `${(px * 100).toFixed(1)}%`);
        c.style.setProperty('--sy', `${(py * 100).toFixed(1)}%`);
      });
      on(c, 'pointerleave', () => { ['--rx', '--ry'].forEach((p) => c.style.removeProperty(p)); });
    });
  }

  // ---- Experience timeline: the line draws with scroll progress; role technologies light up in sequence ----
  const tl = document.querySelector<HTMLElement>('[data-timeline]');
  if (tl) {
    tl.querySelectorAll<HTMLElement>('.role').forEach((role) =>
      role.querySelectorAll<HTMLElement>('.badge').forEach((b, i) => b.style.setProperty('--i', String(Math.min(i, 12)))));
    if (reduce) {
      tl.style.setProperty('--p', '1');
    } else {
      let ticking = false;
      const update = () => {
        ticking = false;
        const r = tl.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (innerHeight * 0.65 - r.top) / r.height));
        tl.style.setProperty('--p', p.toFixed(3));
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      on(window, 'scroll', onScroll, { passive: true });
      on(window, 'resize', onScroll);
      update();
    }
  }

  // ---- Architecture diagram (GSAP + ScrollTrigger), loaded only on pages that have one ----
  if (document.querySelector('[data-arch]')) {
    import('./diagram-anim').then((m) => { cleanups.push(m.initDiagrams(reduce)); });
  }
}

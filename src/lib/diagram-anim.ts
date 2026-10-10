// Scroll-driven architecture diagrams. Conventions (see CLAUDE.md):
//  - elements in the SVG carry data-step="N"; a node and the edges leading INTO it share a step
//  - edges are <path class="edge">; a "packet" travels along each edge of the current step
//  - the walkthrough <ol data-steps> has one <li> per step, in order
// The diagram is pinned while the steps scroll. Steps can also be clicked, and "Play flow" runs them in order,
// so you never have to scroll to see the flow.
// With reduced motion: no dimming, no packets, no auto-centering animation; only the current step is highlighted.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const SVG_NS = 'http://www.w3.org/2000/svg';
const DIM = 0.14;

export function initDiagrams(reduce: boolean) {
  const cleanups: Array<() => void> = [];
  const ctx = gsap.context(() => {
    document.querySelectorAll<HTMLElement>('[data-arch]').forEach((root) => {
      const svg = root.querySelector<SVGSVGElement>('svg');
      const items = [...root.querySelectorAll<HTMLElement>('[data-steps] > li')];
      const bar = root.querySelector<HTMLElement>('.arch-bar');
      const playBtn = root.querySelector<HTMLButtonElement>('[data-play]');
      const count = root.querySelector<HTMLElement>('[data-caption-count]');
      const caption = root.querySelector<HTMLElement>('[data-caption]');
      const wrap = root.querySelector<HTMLElement>('.diagram-wrap');
      if (!svg || !items.length) return;
      const els = [...svg.querySelectorAll<SVGElement>('[data-step]')];
      const stepOf = (el: Element) => Number(el.getAttribute('data-step'));
      let current = 0;
      let playing: gsap.core.Tween | null = null;
      if (bar) bar.hidden = false;

      const packets = (n: number) => {
        svg.querySelectorAll<SVGPathElement>(`path.edge[data-step="${n}"]`).forEach((path) => {
          const len = path.getTotalLength();
          const dot = document.createElementNS(SVG_NS, 'circle');
          dot.setAttribute('class', 'packet');
          dot.setAttribute('r', '5');
          // Same parent as the edge, so packets share its coordinate system (Mermaid nests edges in transformed groups).
          path.parentNode!.appendChild(dot);
          const pos = { p: 0 };
          const place = () => { const pt = path.getPointAtLength(pos.p * len); dot.setAttribute('cx', String(pt.x)); dot.setAttribute('cy', String(pt.y)); };
          place();
          gsap.to(pos, { p: 1, duration: 0.9, ease: 'power2.inOut', onUpdate: place,
            onComplete: () => gsap.to(dot, { opacity: 0, duration: 0.2, onComplete: () => dot.remove() }) });
        });
      };

      // If the diagram is wider than its box (phones), keep the current step's node centred in view.
      const centre = (n: number) => {
        if (!wrap || wrap.scrollWidth <= wrap.clientWidth + 2) return;
        const target = svg.querySelector<SVGGraphicsElement>(`.node[data-step="${n}"], g[data-step="${n}"]`);
        if (!target) return;
        const t = target.getBoundingClientRect(), w = wrap.getBoundingClientRect();
        wrap.scrollBy({ left: t.left + t.width / 2 - (w.left + w.width / 2), behavior: reduce ? 'auto' : 'smooth' });
      };

      const show = (n: number, travel = true) => {
        current = n;
        els.forEach((el) => {
          const s = stepOf(el);
          el.classList.toggle('now', s === n);
          if (!reduce) gsap.to(el, { opacity: s <= n ? 1 : DIM, duration: 0.3, overwrite: true });
        });
        items.forEach((li, i) => {
          li.classList.toggle('active', i + 1 === n);
          i + 1 === n ? li.setAttribute('aria-current', 'step') : li.removeAttribute('aria-current');
        });
        const it = items[n - 1];
        if (count) count.textContent = `Step ${n} of ${items.length}`;
        if (caption && it) {
          const title = document.createElement('b'), text = document.createElement('span');
          title.textContent = it.querySelector('h3')?.textContent ?? '';
          text.textContent = it.querySelector('p')?.textContent ?? '';
          caption.replaceChildren(title, text);
        }
        centre(n);
        if (travel && !reduce) packets(n);
      };
      const showAll = () => {
        current = 0;
        els.forEach((el) => { el.classList.remove('now'); if (!reduce) gsap.to(el, { opacity: 1, duration: 0.3, overwrite: true }); });
        items.forEach((li) => { li.classList.remove('active'); li.removeAttribute('aria-current'); });
        if (count) count.textContent = `All ${items.length} steps`;
        if (caption) caption.textContent = '';
      };

      const stop = () => {
        playing?.kill(); playing = null;
        playBtn?.setAttribute('aria-pressed', 'false');
        if (playBtn) playBtn.textContent = '▶ Play flow';
      };
      // Scroll position drives the diagram, but never fights a running "Play flow".
      // A click also nudges the page (focus / scroll into view); ignore scroll-driven updates briefly so it sticks.
      let lockUntil = 0;
      const fromScroll = (n: number) => { if (!playing && performance.now() > lockUntil) show(n); };

      // 1. Scroll: current step follows the walkthrough, in both directions.
      ScrollTrigger.create({ trigger: root, start: 'top 85%', end: 'bottom top',
        onEnter: () => { if (!playing && !current) show(1); }, onEnterBack: () => { if (!playing) show(items.length, false); },
        onLeave: () => { if (!playing) showAll(); }, onLeaveBack: () => { if (!playing) showAll(); } });
      items.forEach((li, i) => ScrollTrigger.create({ trigger: li, start: 'top 62%', end: 'bottom 62%', onEnter: () => fromScroll(i + 1), onEnterBack: () => fromScroll(i + 1) }));

      // 2. Click or press Enter/Space on a step to jump to it and replay its packets.
      items.forEach((li, i) => {
        const go = () => { stop(); lockUntil = performance.now() + 900; show(i + 1); };
        const onClick = () => go();
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
        li.addEventListener('click', onClick); li.addEventListener('keydown', onKey);
        cleanups.push(() => { li.removeEventListener('click', onClick); li.removeEventListener('keydown', onKey); });
      });

      // 3. Play flow: run every step in order, about 1.5 s each.
      const onPlay = () => {
        if (playing) { stop(); return; }
        playBtn?.setAttribute('aria-pressed', 'true');
        if (playBtn) playBtn.textContent = '❚❚ Pause';
        let n = current >= items.length || current === 0 ? 0 : current;
        const tick = () => {
          n += 1;
          if (n > items.length) { stop(); show(items.length, false); return; }
          show(n);
          playing = gsap.delayedCall(reduce ? 1.2 : 1.5, tick);
        };
        playing = gsap.delayedCall(0, tick);
      };
      playBtn?.addEventListener('click', onPlay);
      cleanups.push(() => { playBtn?.removeEventListener('click', onPlay); stop(); });

      if (!reduce) els.forEach((el) => gsap.set(el, { opacity: 1 }));
    });
  });
  return () => { cleanups.forEach((fn) => fn()); ctx.revert(); };
}

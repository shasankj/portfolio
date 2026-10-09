// Scroll-driven architecture diagrams. Conventions (see CLAUDE.md):
//  - elements in the SVG carry data-step="N"; a node and the edges leading INTO it share a step
//  - edges are <path class="edge">; a "packet" travels along each edge of the current step
//  - the walkthrough <ol data-steps> has one <li> per step, in order
// With reduced motion: no dimming, no packets; only the current step is highlighted as you read.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const SVG_NS = 'http://www.w3.org/2000/svg';
const DIM = 0.14;

export function initDiagrams(reduce: boolean) {
  const ctx = gsap.context(() => {
    document.querySelectorAll<HTMLElement>('[data-arch]').forEach((root) => {
      const svg = root.querySelector<SVGSVGElement>('svg');
      const items = [...root.querySelectorAll<HTMLElement>('[data-steps] > li')];
      if (!svg || !items.length) return;
      const els = [...svg.querySelectorAll<SVGElement>('[data-step]')];
      const stepOf = (el: Element) => Number(el.getAttribute('data-step'));
      let current = 0;

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
        if (travel && !reduce) packets(n);
      };
      const showAll = () => {
        current = 0;
        els.forEach((el) => { el.classList.remove('now'); if (!reduce) gsap.to(el, { opacity: 1, duration: 0.3, overwrite: true }); });
        items.forEach((li) => { li.classList.remove('active'); li.removeAttribute('aria-current'); });
      };

      // Enter the section: start at step 1. Leave below it: show the complete diagram.
      ScrollTrigger.create({ trigger: root, start: 'top 85%', end: 'bottom top', onEnter: () => current || show(1), onEnterBack: () => show(items.length, false), onLeave: showAll, onLeaveBack: showAll });
      items.forEach((li, i) => {
        ScrollTrigger.create({
          trigger: li, start: 'top 62%', end: 'bottom 62%',
          onEnter: () => show(i + 1), onEnterBack: () => show(i + 1),
        });
      });
      if (!reduce) els.forEach((el) => gsap.set(el, { opacity: 1 }));
    });
  });
  return () => ctx.revert();
}

import { reducedMotion } from './ui';

/**
 * Hero "event stream": a few faint packets travel along horizontal rails, like messages through a pipeline.
 * Everything you are likely to tweak is in CONFIG. See docs/ANIMATION.md.
 */
export const CONFIG = {
  /** How many packets are on screen. More = busier. 8-20 is calm. */
  particles: 14,
  /** Time for one packet to cross the screen, in seconds (min..max). Higher = slower. */
  crossSeconds: [12, 25] as [number, number],
  /** Horizontal rails drawn behind the packets. Must match the 12.5% spacing of .hero-rails in global.css (7 rails). */
  rails: 7,
  /** Packet opacity: resting, and when the cursor is near. 0..1 */
  opacity: { rest: 0.4, near: 0.9 },
  /** Packet size in px. */
  size: 4,
  /** Cursor interaction radius and push strength, in px. Set push to 0 to disable. */
  cursor: { radius: 110, push: 10 },
  /** Packets fade in/out over this fraction of their path. */
  fade: 0.12,
  /** Frame-rate cap. Lower saves battery; 30 is still smooth for slow motion. */
  maxFps: 30,
};

type P = { t: number; speed: number; lane: number };

export function mountStream(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const reduce = reducedMotion();
  const { rails } = CONFIG;
  const mouse = { x: -999, y: -999 };
  let w = 0, h = 0, raf = 0, visible = true, last = 0;

  const rand = ([a, b]: [number, number]) => a + Math.random() * (b - a);
  const speedFor = () => 1 / (rand(CONFIG.crossSeconds) * 1000); // fraction of path per millisecond
  const ps: P[] = Array.from({ length: CONFIG.particles }, () => ({
    t: Math.random(), speed: speedFor(), lane: Math.floor(Math.random() * rails),
  }));

  const colors = () => {
    const s = getComputedStyle(canvas);
    return { dot: s.getPropertyValue('--ink').trim(), hot: s.getPropertyValue('--accent').trim() };
  };

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(0);
  }

  // Packets move along a rail and hop to a neighbouring rail at right angles at four "stations".
  function pos(p: P) {
    const ly = ((p.lane + 1) / (rails + 1)) * h;
    const stage = Math.floor(p.t * 4);
    const jog = ((((p.lane * 3 + stage) % rails) + 1) / (rails + 1)) * h;
    const k = Math.min(1, ((p.t * 4) % 1) * 5);
    return { x: p.t * w, y: ly + (jog - ly) * k };
  }

  function draw(dt: number) {
    ctx!.clearRect(0, 0, w, h);
    const c = colors();
    const { radius, push } = CONFIG.cursor;
    for (const p of ps) {
      if (!reduce && visible) p.t += p.speed * dt;
      if (p.t > 1) { p.t = 0; p.lane = Math.floor(Math.random() * rails); p.speed = speedFor(); }
      let { x, y } = pos(p);
      const dx = x - mouse.x, dy = y - mouse.y, d = Math.hypot(dx, dy) || 1;
      const near = d < radius;
      if (near && push) { const f = (1 - d / radius) * push; x += (dx / d) * f; y += (dy / d) * f; }
      const edge = Math.min(1, p.t / CONFIG.fade, (1 - p.t) / CONFIG.fade);
      ctx!.globalAlpha = edge * (near ? CONFIG.opacity.near : CONFIG.opacity.rest);
      ctx!.fillStyle = near ? c.hot : c.dot;
      ctx!.fillRect(x - CONFIG.size / 2, y - CONFIG.size / 2, CONFIG.size, CONFIG.size);
    }
    ctx!.globalAlpha = 1;
  }

  const minFrame = 1000 / CONFIG.maxFps;
  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    const dt = now - last;
    if (dt < minFrame) return;
    last = now;
    draw(Math.min(dt, 80));
  }
  const start = () => { if (!raf && !reduce && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); });
  io.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);
  const host = canvas.parentElement;
  const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
  const onLeave = () => { mouse.x = mouse.y = -999; };
  host?.addEventListener('pointermove', onMove);
  host?.addEventListener('pointerleave', onLeave);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize(); start();
  canvas.classList.add('on');
  return () => {
    stop(); io.disconnect(); ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    host?.removeEventListener('pointermove', onMove);
    host?.removeEventListener('pointerleave', onLeave);
  };
}

/**
 * True on devices where an always-on canvas is not worth it (data-saver on, or very little memory).
 * Falls back to the static rails. CPU core count is deliberately NOT used: 14 small squares at 30 fps is cheap,
 * and plenty of healthy 2-core machines and virtual machines would have been wrongly excluded.
 */
export function lowPower() {
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (n.deviceMemory ?? 8) <= 2 || !!n.connection?.saveData;
}

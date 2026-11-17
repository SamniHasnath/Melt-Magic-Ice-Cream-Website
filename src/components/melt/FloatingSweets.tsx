import { useEffect, useRef } from 'react';
import { reducedMotion } from '@/lib/gsap';

/**
 * Sprinkles and little cream drops drifting behind the page on a single 2D canvas.
 * They drift down slowly, lag behind when you scroll (parallax), and are gently pushed
 * away by the mouse. Particle count scales with screen size; it pauses in background tabs
 * and is switched off entirely for reduced-motion users.
 */
const COLORS = ['#F7A1BE', '#FFD23F', '#6FE3C1', '#8FD3FF', '#B48AD6', '#FF7FA8', '#9E5D3A'];
const CREAM = ['#FFF1C9', '#F7A1BE', '#B8F0DC', '#FFC857'];

type P = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; z: number; kind: 0 | 1; color: string; size: number };

export function FloatingSweets() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const c = ref.current!, ctx = c.getContext('2d')!;
    let W = 0, H = 0, raf = 0, last = performance.now(), lastScroll = scrollY;
    const mouse = { x: -999, y: -999 };
    let parts: P[] = [];

    const resize = () => {
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      W = innerWidth; H = innerHeight;
      c.width = W * dpr; c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(38, Math.max(12, (W * H) / 42000)));
      parts = Array.from({ length: n }, (_, i) => spawn(i % 4 === 0 ? 1 : 0, true));
    };
    const spawn = (kind: 0 | 1, anywhere = false): P => ({
      x: Math.random() * W, y: anywhere ? Math.random() * H : -20,
      vx: (Math.random() - 0.5) * 6, vy: 6 + Math.random() * 14,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 1.2,
      z: 0.4 + Math.random() * 0.8, kind,
      color: kind ? CREAM[(Math.random() * CREAM.length) | 0] : COLORS[(Math.random() * COLORS.length) | 0],
      size: kind ? 5 + Math.random() * 5 : 1,
    });

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const ds = scrollY - lastScroll; lastScroll = scrollY;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        // mouse pushes particles away softly
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120) { const f = (1 - Math.sqrt(d2) / 120) * 260 * dt; const d = Math.sqrt(d2) || 1; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        p.vx *= 0.985; p.vy += ((6 + p.z * 10) - p.vy) * 0.02;
        p.x += (p.vx + Math.sin(now / 1400 + p.rot) * 4) * dt * p.z;
        p.y += p.vy * dt * p.z - ds * p.z * 0.35;
        p.rot += p.vr * dt;
        if (p.y > H + 30) Object.assign(p, spawn(p.kind), { y: -20 });
        if (p.y < -40) Object.assign(p, spawn(p.kind), { y: H + 20 });
        if (p.x < -30) p.x = W + 20; else if (p.x > W + 30) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = 0.35 + p.z * 0.4;
        ctx.fillStyle = p.color;
        if (p.kind === 0) {
          const l = 11 * p.z, w = 3.4 * p.z;
          ctx.beginPath(); ctx.roundRect(-w / 2, -l / 2, w, l, w / 2); ctx.fill();
        } else {
          // a little teardrop of cream
          const s = p.size * p.z;
          ctx.rotate(-p.rot);
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.5);
          ctx.bezierCurveTo(s * 0.9, -s * 0.2, s, s * 0.9, 0, s);
          ctx.bezierCurveTo(-s, s * 0.9, -s * 0.9, -s * 0.2, 0, -s * 1.5);
          ctx.fill();
          ctx.globalAlpha *= 0.6; ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.ellipse(-s * 0.3, s * 0.1, s * 0.18, s * 0.3, 0.3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    };
    const onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointermove', onMove); };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-[1] h-full w-full" />;
}

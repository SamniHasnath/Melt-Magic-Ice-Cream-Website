import { useEffect, useRef } from 'react';
import { ScrollTrigger, clamp01, easeOut, gsap, range, reducedMotion } from '@/lib/gsap';

type Variant = 'drip' | 'splash' | 'wave';

/**
 * Liquid transitions between sections, scrubbed by scroll (GSAP ScrollTrigger).
 *
 *  drip   – a band of melted cream (continuing the colour of the section above)
 *           pours long drips down over the next section; drops break off at the end.
 *  splash – a burst of flavour-coloured cream blobs and droplets, merged by a gooey
 *           SVG filter, that bursts open and then shrinks away to reveal what's below.
 *  wave   – layers of vanilla, caramel and chocolate rise and fill the space, ending
 *           in solid chocolate so the next (chocolate) section continues seamlessly.
 *
 * Drawing runs on gsap.ticker only while the divider is on screen.
 */
export function MeltDivider({ variant, color = 'var(--melt)', reach = 1, className = '' }: {
  variant: Variant; color?: string; /** how far drips run, 0–1 (drip only) */ reach?: number; className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = wrap.current!, s = svg.current!;
    let W = el.clientWidth, H = el.clientHeight;
    let target = reducedMotion() ? 1 : 0, p = target, visible = false;
    let seeds = makeSeeds(variant, W);

    const ro = new ResizeObserver(() => { W = el.clientWidth; H = el.clientHeight; s.setAttribute('viewBox', `0 0 ${W} ${H}`); seeds = makeSeeds(variant, W); draw(performance.now() / 1000); });
    ro.observe(el);
    s.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const st = ScrollTrigger.create({
      trigger: el,
      // drips and waves finish as the divider's bottom reaches the bottom of the screen;
      // the splash plays while it crosses the middle of the screen
      start: variant === 'splash' ? 'top 85%' : 'top bottom',
      end: variant === 'splash' ? 'bottom 15%' : 'bottom bottom',
      onUpdate: (self) => { if (!reducedMotion()) target = self.progress; },
    });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' });
    io.observe(el);

    const draw = (t: number) => {
      if (variant === 'drip') drawDrip(s, seeds as DripSeed[], p, t, W, H, reach);
      else if (variant === 'splash') drawSplash(s, seeds as SplashSeed[], p, W, H);
      else drawWave(s, p, t, W, H);
    };
    const tick = (time: number) => {
      if (!visible) return;
      p += (target - p) * 0.12;
      draw(time);
    };
    draw(0);
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); st.kill(); ro.disconnect(); io.disconnect(); };
  }, [variant, reach]);

  const sizes: Record<Variant, string> = {
    drip: 'h-[60vh] -mb-[38vh]',
    splash: 'h-[60vh] -my-[24vh]',
    wave: 'h-[45vh]',
  };

  return (
    <div ref={wrap} aria-hidden className={`pointer-events-none relative z-[5] w-full overflow-visible ${sizes[variant]} ${className}`} style={{ color }}>
      <svg ref={svg} className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <filter id="goo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="g" />
            <feComposite in="SourceGraphic" in2="g" operator="atop" />
          </filter>
          <linearGradient id="drip-shine" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          {/* slightly darker towards the drip tips, like thicker cream */}
          <linearGradient id="drip-depth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset=".45" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#3a1a10" stopOpacity=".16" />
          </linearGradient>
          <radialGradient id="blob-shine" cx=".35" cy=".3" r=".6">
            <stop offset="0" stopColor="#fff" stopOpacity=".55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g data-layer="main" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
type DripSeed = { x: number; w: number; len: number; delay: number; wob: number };
type SplashSeed = { x: number; y: number; r: number; color: string; delay: number; drops: { a: number; d: number; r: number }[] };

const FLAVOURS = ['#F7A1BE', '#FFF1C9', '#B8F0DC', '#FFC857', '#9E5D3A'];

function prng(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

function makeSeeds(variant: Variant, W: number): DripSeed[] | SplashSeed[] {
  const r = prng(variant === 'drip' ? 7 : 11);
  if (variant === 'drip') {
    const n = Math.max(7, Math.round(W / 95));
    return Array.from({ length: n }, (_, i) => ({
      x: ((i + 0.5) / n) * W + (r() - 0.5) * (W / n) * 0.5,
      w: 26 + r() * 46,
      len: 0.35 + r() * 0.65,
      delay: r() * 0.3,
      wob: r() * 6,
    }));
  }
  if (variant === 'splash') {
    const n = W < 700 ? 5 : 8, small = W < 700;
    return Array.from({ length: n }, (_, i) => ({
      x: ((i + 0.5) / n) * W + (r() - 0.5) * (W / n) * 0.5,
      y: 0.5 + (r() - 0.5) * 0.3,
      r: (small ? 26 : 38) + r() * (small ? 22 : 36),
      color: FLAVOURS[i % FLAVOURS.length],
      delay: r() * 0.2,
      // droplets flung outward in a crown, mostly upward and sideways
      drops: Array.from({ length: small ? 7 : 11 }, () => ({ a: -Math.PI * (0.05 + r() * 0.9) + (r() < 0.25 ? Math.PI : 0), d: 60 + r() * (small ? 110 : 190), r: 3 + r() * (small ? 7 : 10) })),
    }));
  }
  return [];
}

function layer(s: SVGSVGElement) {
  return s.querySelector('[data-layer="main"]') as SVGGElement;
}

/* drip ---------------------------------------------------------------- */
function drawDrip(s: SVGSVGElement, seeds: DripSeed[], p: number, t: number, W: number, H: number, reach: number) {
  const band = H * 0.2;
  const room = (H - band - 40) * reach;
  let d = `M0,-2 L${W},-2 L${W},${band} `;
  let drops = '', shine = '', glints = '';
  const sorted = [...seeds].sort((a, b) => b.x - a.x);
  for (const sd of sorted) {
    const k = easeOut(range(p, sd.delay, Math.min(1, sd.delay + 0.7)));
    const len = Math.max(0, sd.len * room * k + Math.sin(t * 1.4 + sd.wob) * 4 * k);
    const r = sd.w / 2, x = sd.x, y0 = band, y1 = band + len;
    const neck = r * 0.42, bulb = r * (0.55 + 0.15 * k);
    d += `L${x + r * 1.6},${y0} `;
    d += `C${x + r * 0.7},${y0} ${x + neck},${y0 + len * 0.2} ${x + neck},${Math.max(y0, y1 - bulb * 1.6)} `;
    d += `C${x + neck},${y1 - bulb * 0.6} ${x + bulb},${y1 - bulb * 0.9} ${x + bulb},${y1} `;
    d += `C${x + bulb},${y1 + bulb * 1.15} ${x - bulb},${y1 + bulb * 1.15} ${x - bulb},${y1} `;
    d += `C${x - bulb},${y1 - bulb * 0.9} ${x - neck},${y1 - bulb * 0.6} ${x - neck},${Math.max(y0, y1 - bulb * 1.6)} `;
    d += `C${x - neck},${y0 + len * 0.2} ${x - r * 0.7},${y0} ${x - r * 1.6},${y0} `;
    // glossy highlight running down the left side of each drip and on its bulb
    if (len > bulb * 3) {
      shine += `M${x - neck * 0.45},${y0 + 6} L${x - neck * 0.45},${y1 - bulb * 1.4} `;
      glints += `<ellipse cx="${x - bulb * 0.38}" cy="${y1 - bulb * 0.15}" rx="${bulb * 0.16}" ry="${bulb * 0.28}" fill="#fff" fill-opacity=".5" transform="rotate(18 ${x - bulb * 0.38} ${y1 - bulb * 0.15})"/>`;
    }
    // a drop breaks off the longest drips near the end and falls away
    const fall = range(p, 0.72 + sd.delay * 0.5, 1);
    if (fall > 0 && sd.len > 0.6) {
      const dy = y1 + bulb * 2 + fall * fall * H * 0.9, dr = bulb * 0.8 * (1 - fall * 0.3);
      drops += `M${x - dr},${dy} a${dr},${dr * 1.15} 0 1,0 ${dr * 2},0 a${dr},${dr * 1.15} 0 1,0 ${-dr * 2},0 Z `;
    }
  }
  // the band's lower edge sags gently between drips
  d += `L0,${band} Z`;
  layer(s).innerHTML =
    `<path d="${d}${drops}" fill="currentColor"/>` +
    `<path d="${d}" fill="url(#drip-depth)"/>` +
    `<path d="${shine}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/>` + glints +
    `<path d="M0,${band * 0.55} L${W},${band * 0.55}" stroke="url(#drip-shine)" stroke-width="${Math.max(3, band * 0.06)}" stroke-linecap="round"/>`;
}

/* splash -------------------------------------------------------------- */
function drawSplash(s: SVGSVGElement, seeds: SplashSeed[], p: number, W: number, H: number) {
  let out = '', shine = '';
  for (const sd of seeds) {
    const burst = range(p, sd.delay, sd.delay + 0.3);
    const settle = range(p, 0.6, 1);
    const grow = burst <= 0 ? 0 : backOut(burst) * (1 - easeOut(settle));
    if (grow <= 0.001) continue;
    const cx = sd.x, cy = sd.y * H, R = sd.r * grow;
    // the splat: a squashed core plus two lopsided lobes so no two look the same
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${R * 1.25}" ry="${R * 0.8}" fill="${sd.color}"/>`;
    out += `<circle cx="${cx - R * 0.8}" cy="${cy + R * 0.25}" r="${R * 0.55}" fill="${sd.color}"/>`;
    out += `<circle cx="${cx + R * 0.9}" cy="${cy - R * 0.15}" r="${R * 0.45}" fill="${sd.color}"/>`;
    shine += `<ellipse cx="${cx - R * 0.35}" cy="${cy - R * 0.3}" rx="${R * 0.55}" ry="${R * 0.28}" fill="url(#blob-shine)"/>`;
    for (const dr of sd.drops) {
      const fly = easeOut(clamp01(burst * 1.25));
      const g = settle * settle * 220;                         // droplets arc back down
      const x = cx + Math.cos(dr.a) * dr.d * fly * (1 + settle * 0.4);
      const y = cy + Math.sin(dr.a) * dr.d * fly + g;
      const rr = dr.r * (1 - settle * 0.85) * Math.min(1, burst * 2.5);
      if (rr < 0.6) continue;
      // stretched along its flight direction while it's moving fast
      const vx = Math.cos(dr.a), vy = Math.sin(dr.a) + settle * 2;
      const ang = (Math.atan2(vy, vx) * 180) / Math.PI;
      const st = 1 + (1 - fly) * 1.6 + settle * 0.5;
      out += `<ellipse cx="${x}" cy="${y}" rx="${rr * st}" ry="${rr / Math.sqrt(st)}" transform="rotate(${ang} ${x} ${y})" fill="${sd.color}"/>`;
      // a thin streak joins the droplet to the splat early in the burst
      if (burst < 0.7) out += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${sd.color}" stroke-width="${rr * 0.55 * (1 - burst)}" stroke-linecap="round"/>`;
    }
  }
  layer(s).innerHTML = `<g filter="url(#goo)">${out}</g>${shine}`;
}
const backOut = (t: number) => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

/* wave ---------------------------------------------------------------- */
function drawWave(s: SVGSVGElement, p: number, t: number, W: number, H: number) {
  const layers = [
    { color: '#FFF1C9', rise: range(p, 0, 0.55), amp: 18, k: 0.010, sp: 1.1, ph: 0 },
    { color: '#E8B07A', rise: range(p, 0.15, 0.75), amp: 22, k: 0.008, sp: -0.9, ph: 2 },
    { color: '#5A2A12', rise: range(p, 0.3, 1), amp: 26, k: 0.006, sp: 0.7, ph: 4 },
  ];
  let out = '';
  const step = Math.max(16, W / 60);
  for (const l of layers) {
    const top = H - easeOut(l.rise) * (H + 40);
    if (top >= H) continue;
    let d = `M0,${H + 2} L0,${top} `, crest = '';
    for (let x = 0; x <= W + step; x += step) {
      const y = top + Math.sin(x * l.k + t * l.sp + l.ph) * l.amp * (1 - l.rise * 0.5) + Math.sin(x * l.k * 2.3 + t * l.sp * 1.7) * l.amp * 0.35;
      d += `L${x},${y} `;
      crest += `${crest ? 'L' : 'M'}${x},${y + 7} `;
    }
    d += `L${W},${H + 2} Z`;
    out += `<path d="${d}" fill="${l.color}"/>`;
    // a soft highlight riding just under each wave crest
    out += `<path d="${crest}" fill="none" stroke="#fff" stroke-opacity="${l.color === '#5A2A12' ? 0.14 : 0.35}" stroke-width="3" stroke-linecap="round"/>`;
  }
  layer(s).innerHTML = out;
}

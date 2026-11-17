import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger, gsap } from '@/lib/gsap';

/**
 * A stream of melted cream down the left edge of the screen that grows as you scroll,
 * so the melt carries on through every page. It changes flavour along its length
 * (strawberry → vanilla → mint → mango → chocolate) and ends in a wobbling drop.
 */
export function MeltRail() {
  const path = useRef<SVGPathElement>(null);
  const drop = useRef<SVGEllipseElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    let target = 0, p = 0;
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { target = self.progress; } });
    const tick = (t: number) => {
      p += (target - p) * 0.1;
      const H = innerHeight, len = 30 + p * (H - 70);
      const w = 4 + Math.sin(t * 2) * 0.4;
      // a slightly wavy strand that is thicker at the top and swells into a drop at the end
      let d = `M${10 - w},0 `;
      for (let y = 0; y <= len; y += 24) d += `L${10 - w * (1 - y / len * 0.35) + Math.sin(y * 0.03 + t * 1.5) * 1.2},${y} `;
      d += `L${10 + w * 0.65},${len} `;
      for (let y = len; y >= 0; y -= 24) d += `L${10 + w * (1 - y / len * 0.35) + Math.sin(y * 0.03 + t * 1.5) * 1.2},${y} `;
      d += 'Z';
      path.current?.setAttribute('d', d);
      const r = 7 + Math.sin(t * 3) * 0.6;
      drop.current?.setAttribute('cy', String(len + r * 0.9));
      drop.current?.setAttribute('rx', String(r));
      drop.current?.setAttribute('ry', String(r * 1.18));
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); st.kill(); };
  }, [pathname]);

  return (
    <svg aria-hidden className="pointer-events-none fixed left-[clamp(4px,1.2vw,18px)] top-0 z-[50] hidden h-screen w-5 overflow-visible md:block">
      <defs>
        <linearGradient id="rail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7A1BE" />
          <stop offset=".3" stopColor="#FFE9B8" />
          <stop offset=".55" stopColor="#9FE6CC" />
          <stop offset=".8" stopColor="#FFC857" />
          <stop offset="1" stopColor="#9E5D3A" />
        </linearGradient>
      </defs>
      <path ref={path} fill="url(#rail)" />
      <ellipse ref={drop} cx="10" fill="url(#rail)" />
      <ellipse cx="7.5" cy="12" rx="1.2" ry="6" fill="#fff" opacity=".55" />
    </svg>
  );
}

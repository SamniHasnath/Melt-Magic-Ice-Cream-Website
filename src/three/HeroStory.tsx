import { lazy, Suspense, useEffect, useRef, useState, type PointerEvent } from 'react';
import { useShop } from '@/store/shop';
import { useUi } from '@/store/ui';
import { money, typeInfo } from '@/data/constants';
import { useAddToCart } from '@/hooks/useAddToCart';
import { ScrollTrigger, gsap, range, reducedMotion } from '@/lib/gsap';

const MeltScene = lazy(() => import('@/three/MeltScene'));

const STORY = [
  { word: 'scoop', title: 'Hand-churned|at dawn.', text: 'One perfect scoop of real fruit and fresh cream, sitting pretty on a crisp waffle cone.' },
  { word: 'melt', title: 'Then the sun|comes out.', text: 'It softens, slumps and starts to run. Colombo afternoons do that.' },
  { word: 'drip', title: 'Every drop|counts.', text: 'Cream runs down the cone, gathers at the tip and lets go.' },
  { word: 'pick', title: 'Catch it while|it lasts.', text: "Today's pick, made this morning. Grab it before it's gone." },
  { word: 'flow', title: 'Follow|the drip.', text: 'The melt runs on below. Everything we make is waiting there.' },
];
const HERO_FLAVOURS = [
  { name: 'Strawberry', hex: '#F7A1BE' }, { name: 'Mint', hex: '#B8F0DC' }, { name: 'Mango', hex: '#FFC857' },
  { name: 'Cocoa', hex: '#9E5D3A' }, { name: 'Blueberry', hex: '#B6B3FF' },
];

/**
 * Scroll-driven melting hero. The section is 560vh tall; a sticky 100vh stage holds the
 * 3D canvas. GSAP ScrollTrigger maps the scroll position to progress 0 → 1, which melts
 * the scoop. Over the last part of the scroll, melted cream floods up from the bottom of
 * the stage; that flood is the same colour (--melt) as the drip transition right below the
 * hero, so the melt pours straight into the next section without a seam.
 */
export function HeroStory() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const flood = useRef<SVGSVGElement>(null);
  const floodPath = useRef<SVGPathElement>(null);
  const floodShine = useRef<SVGPathElement>(null);
  const progress = useRef(0);
  const spin = useRef(0);
  const drag = useRef<{ x: number } | null>(null);
  const [scene, setScene] = useState(0);
  const [shown, setShown] = useState(0);
  const [swap, setSwap] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [flavour, setFlavour] = useState(HERO_FLAVOURS[0]);
  const { products, settings } = useShop();
  const openViewer = useUi((s) => s.openViewer);
  const add = useAddToCart();
  const featured = products.find((p) => p.id === settings.featuredProductId) ?? products.find((p) => p.featured) ?? products[0];

  // the chosen flavour becomes the colour of all melted cream on the page
  useEffect(() => { document.documentElement.style.setProperty('--melt', flavour.hex); }, [flavour]);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress.current = self.progress;
        setScene(Math.min(4, Math.round(self.progress * 4)));
      },
    });
    // pause the WebGL canvas once the hero has scrolled away
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '200px' });
    io.observe(section.current!);

    // the flood: a wavy liquid surface rising over the last 30% of the scroll
    let shown = 0;
    const tick = (t: number) => {
      const target = reducedMotion() ? 0 : range(progress.current, 0.7, 1);
      shown += (target - shown) * 0.12;
      const svg = flood.current, path = floodPath.current;
      if (!svg || !path) return;
      const W = svg.clientWidth || innerWidth, H = svg.clientHeight || innerHeight;
      const top = H - shown * H * 0.42;
      let d = `M0,${H} L0,${top} `, crest = '';
      const step = Math.max(18, W / 48);
      for (let x = 0; x <= W + step; x += step) {
        const y = top + Math.sin(x * 0.012 + t * 1.6) * 10 * shown + Math.sin(x * 0.031 - t * 2.2) * 5 * shown;
        d += `L${x},${y} `;
        crest += `${crest ? 'L' : 'M'}${x},${y + 8} `;
      }
      path.setAttribute('d', `${d}L${W},${H} Z`);
      floodShine.current?.setAttribute('d', shown > 0.01 ? crest : '');
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    };
    gsap.ticker.add(tick);
    return () => { st.kill(); io.disconnect(); gsap.ticker.remove(tick); };
  }, []);

  // Fade the big word + caption out, swap the text, fade back in.
  useEffect(() => {
    if (scene === shown) return;
    setSwap(true);
    const t = setTimeout(() => { setShown(scene); setSwap(false); }, 260);
    return () => clearTimeout(t);
  }, [scene, shown]);

  const jump = (i: number) => {
    const el = section.current!;
    scrollTo({ top: el.offsetTop + ((el.offsetHeight - innerHeight) * i) / 4, behavior: 'smooth' });
  };
  const onDown = (e: PointerEvent) => { drag.current = { x: e.clientX }; };
  const onMove = (e: PointerEvent) => { if (!drag.current) return; spin.current += (e.clientX - drag.current.x) * 0.01; drag.current.x = e.clientX; };
  const onUp = () => { drag.current = null; };

  const s = STORY[shown];
  const title = shown === 0 && settings.heroLine ? settings.heroLine : s.title;

  return (
    <section ref={section} className="relative h-[560vh]" aria-label="Melting ice cream story">
      <div ref={stage} className="sticky top-0 h-screen overflow-hidden bg-[#FFF6E8]">
        {/* big word sits BEHIND the 3D canvas */}
        <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-1/2 text-center font-serif text-[clamp(120px,26vw,380px)] uppercase leading-none tracking-tighter text-white/80 transition-all duration-500 ${swap ? '-translate-y-[44%] scale-y-110 opacity-0 blur-sm' : '-translate-y-[58%] opacity-100'}`}>
          {s.word}
        </div>

        <div className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
          <Suspense fallback={null}>
            <MeltScene progress={progress} flavour={flavour.hex} stage={stage} spin={spin} active={onScreen} />
          </Suspense>
        </div>

        {/* melted cream rising from the bottom; continues into the drip divider below */}
        <svg ref={flood} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" style={{ color: 'var(--melt)' }}>
          <path ref={floodPath} fill="currentColor" />
          <path ref={floodShine} fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="4" strokeLinecap="round" />
        </svg>

        <div className={`pointer-events-none absolute left-[clamp(20px,5vw,80px)] top-28 max-w-[460px] transition-all duration-500 ${shown >= 3 ? 'md:top-36' : 'md:bottom-[clamp(90px,14vh,150px)] md:top-auto'} ${swap ? 'translate-y-4 opacity-0' : 'opacity-100'}`}>
          <div className="mb-3.5 font-mono text-[13px]">Step {shown + 1} of 5</div>
          <h1 className="mb-3.5 font-serif text-[clamp(40px,5vw,68px)] leading-[.95]">{title.split('|').map((l, i) => <span key={i} className="block">{l}</span>)}</h1>
          <p className="leading-relaxed text-ink/75">{s.text}</p>
        </div>

        <div className="absolute right-[clamp(16px,3vw,48px)] top-1/2 flex -translate-y-1/2 flex-col gap-2.5">
          {STORY.map((_, i) => (
            <button key={i} onClick={() => jump(i)} aria-label={`Scene ${i + 1}`} className={`w-2.5 rounded-full bg-ink transition-all duration-300 ${i === scene ? 'h-9 opacity-100' : 'h-2.5 opacity-20'}`} />
          ))}
        </div>

        {featured && (
          <div className={`glass absolute bottom-28 left-1/2 w-[min(320px,88vw)] p-6 transition-all duration-700 md:bottom-auto md:left-auto md:right-[clamp(40px,8vw,140px)] md:top-1/2 ${scene === 3 ? 'pointer-events-auto -translate-x-1/2 opacity-100 md:-translate-y-1/2 md:translate-x-0' : 'pointer-events-none -translate-x-1/2 translate-y-10 opacity-0 md:-translate-y-1/2 md:translate-x-16'}`}>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[.14em] opacity-55">Today's pick · {typeInfo(featured.type).label}</div>
            <h3 className="my-2 font-serif text-[34px] leading-[.95]">{featured.name}</h3>
            <p className="text-sm leading-normal text-ink/60">{featured.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-2xl font-bold">{money(featured.price)}</span>
              <button className="btn-dark" onClick={(e) => add({ product: featured }, e)}>Add to cart</button>
            </div>
            <button className="btn-light mt-3 w-full" onClick={() => openViewer(featured)}>View in 3D</button>
          </div>
        )}

        <div className={`absolute bottom-4 left-1/2 z-10 flex max-w-[94vw] -translate-x-1/2 gap-1.5 overflow-x-auto glass !rounded-full p-1.5 transition-opacity md:bottom-7 ${scene === 4 ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
          {HERO_FLAVOURS.map((f) => (
            <button key={f.name} onClick={() => setFlavour(f)} aria-pressed={flavour.name === f.name} className={`group flex items-center gap-2 whitespace-nowrap rounded-full py-2 pl-2 pr-3.5 text-[13px] font-bold transition ${flavour.name === f.name ? 'bg-ink text-paper' : ''}`}>
              <i className="swatch-drip h-[22px] w-[22px] rounded-full border-2 border-white shadow-[inset_-3px_-3px_5px_rgba(0,0,0,.15)]" style={{ background: f.hex, ['--drip' as string]: f.hex }} />{f.name}
            </button>
          ))}
        </div>

        <div className={`absolute bottom-9 right-[clamp(20px,5vw,80px)] hidden items-center gap-2.5 text-[13px] text-ink/60 transition-opacity md:flex ${scene === 4 ? 'opacity-0' : ''}`}>
          <span className="font-mono">scroll to melt</span> <b className="grid h-[30px] w-[30px] animate-bob place-items-center rounded-full border border-ink/25">↓</b>
        </div>
      </div>
    </section>
  );
}

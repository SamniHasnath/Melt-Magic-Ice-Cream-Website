import { lazy, Suspense, useState } from 'react';
import { FLAVOURS, flavourName, money } from '@/data/constants';
import { useAddToCart } from '@/hooks/useAddToCart';
import { toast } from '@/store/ui';
import type { BuildState } from '@/three/BuilderScene';

const BuilderScene = lazy(() => import('@/three/BuilderScene'));

const EXTRAS = [
  { key: 'sprinkles', label: 'Sprinkles', price: 100 },
  { key: 'chips', label: 'Choco chips', price: 120 },
  { key: 'cherry', label: 'Cherry', price: 80 },
  { key: 'wafer', label: 'Wafer', price: 100 },
  { key: 'sauce', label: 'Fudge sauce', price: 150 },
] as const;
type ExtraKey = typeof EXTRAS[number]['key'];

const START: BuildState = { base: 'cone', scoops: ['#F7A1BE', '#B8F0DC'], topping: 'sprinkles', sauce: 'none', cherry: true, wafer: false };

export default function Builder() {
  const [b, setB] = useState<BuildState>(START);
  const add = useAddToCart();
  const isOn = (k: ExtraKey) => (k === 'sprinkles' || k === 'chips' ? b.topping === k : k === 'sauce' ? b.sauce !== 'none' : b[k]);
  const price = (b.base === 'cone' ? 300 : 350) + b.scoops.length * 350 + EXTRAS.reduce((a, e) => a + (isOn(e.key) ? e.price : 0), 0);

  const toggle = (k: ExtraKey) => setB((s) => {
    if (k === 'sprinkles' || k === 'chips') return { ...s, topping: s.topping === k ? 'none' : k };
    if (k === 'sauce') return { ...s, sauce: s.sauce === 'none' ? 'chocolate' : 'none' };
    return { ...s, [k]: !s[k] };
  });
  const drop = (hex: string) => {
    if (b.scoops.length >= 3) { toast('Max 3 scoops. Remove one first'); return; }
    setB((s) => ({ ...s, scoops: [...s.scoops, hex] }));
  };

  return (
    <section className="section pt-36">
      <div className="grid items-center gap-[clamp(30px,5vw,80px)] lg:grid-cols-[1.1fr_1fr]">
        <div className="relative aspect-[1/1.05] overflow-hidden glass !rounded-[40px]">
          <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
            <Suspense fallback={null}><BuilderScene build={b} /></Suspense>
          </div>
          <span className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/85 px-3.5 py-2 text-[13px] font-semibold"><i className="h-2 w-2 animate-pulse rounded-full bg-mint" />Live 3D preview</span>
          <div className="absolute right-5 top-5 glass-dark !rounded-[20px] px-4 py-3 text-right">
            <small className="block text-[11px] font-bold tracking-[.14em] opacity-60">TOTAL</small>
            <b className="font-serif text-[34px] font-normal">{money(price)}</b>
          </div>
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/80 px-3.5 py-2 text-[13px] text-ink/60">drag to spin · tap a flavour to drop a scoop</span>
        </div>

        <div>
          <div className="eyebrow">BUILD YOUR OWN</div>
          <h1 className="h2">Stack your dream<br />cone in <em>3D.</em></h1>
          <div className="mt-9 flex flex-col gap-7">
            <Step n={1} title="Choose your base">
              <div className="seg">
                <button aria-pressed={b.base === 'cone'} onClick={() => setB((s) => ({ ...s, base: 'cone' }))}>Waffle cone</button>
                <button aria-pressed={b.base === 'cup'} onClick={() => setB((s) => ({ ...s, base: 'cup' }))}>Paper cup</button>
              </div>
            </Step>
            <Step n={2} title="Drop up to 3 scoops">
              <div className="flex flex-wrap gap-3.5">
                {FLAVOURS.slice(0, 10).map((f) => (
                  <button key={f.hex} onClick={() => drop(f.hex)} className="group flex flex-col items-center gap-1.5 text-xs font-medium text-ink/60">
                    <i className="swatch-drip h-[50px] w-[50px] rounded-full shadow-[inset_-6px_-7px_10px_rgba(42,21,18,.22),inset_4px_4px_8px_rgba(255,255,255,.7),0_8px_16px_-8px_rgba(42,21,18,.4)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" style={{ background: f.hex, ['--drip' as string]: f.hex }} />
                    {f.name}
                  </button>
                ))}
              </div>
              <div className="mt-3.5 flex min-h-[34px] flex-wrap gap-2">
                {b.scoops.length ? b.scoops.map((h, i) => (
                  <span key={i} className="inline-flex items-center gap-2 rounded-full bg-cream py-1.5 pl-3 pr-1.5 text-[13px] font-semibold">
                    <i className="h-3.5 w-3.5 rounded-full" style={{ background: h }} />{flavourName(h)}
                    <button aria-label="Remove scoop" className="h-[22px] w-[22px] rounded-full bg-white text-[13px]" onClick={() => setB((s) => ({ ...s, scoops: s.scoops.filter((_, j) => j !== i) }))}>✕</button>
                  </span>
                )) : <span className="text-sm text-ink/60">No scoops yet: tap a flavour</span>}
              </div>
            </Step>
            <Step n={3} title="Add toppings">
              <div className="flex flex-wrap gap-2.5">
                {EXTRAS.map((e) => (
                  <button key={e.key} onClick={() => toggle(e.key)} aria-pressed={isOn(e.key)} className={`chip ${isOn(e.key) ? 'chip-on' : ''}`}>
                    <i className={`grid h-[22px] w-[22px] place-items-center rounded-full text-xs not-italic ${isOn(e.key) ? 'bg-white text-accent' : 'bg-cream'}`}>{isOn(e.key) ? '✓' : '+'}</i>
                    {e.label}<small className="opacity-60">+{money(e.price)}</small>
                  </button>
                ))}
              </div>
            </Step>
            <div className="flex flex-wrap items-center gap-3.5">
              <button className="btn-dark px-7 py-4" onClick={(e) => {
                if (!b.scoops.length) { toast('Drop at least one scoop first'); return; }
                add({ name: `My ${b.base === 'cone' ? 'Cone' : 'Cup'} · ${b.scoops.map(flavourName).join(' + ')}`, price: Math.round(price), spec: { type: b.base, flavours: b.scoops, topping: b.topping, sauce: b.sauce, cherry: b.cherry, wafer: b.wafer } }, e);
              }}>Add to cart →</button>
              <button className="btn-light" onClick={() => setB({ ...START, scoops: [] })}>Start over</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3.5 flex items-center gap-3 text-lg font-semibold"><i className="grid h-[30px] w-[30px] place-items-center rounded-full bg-accent text-[13px] font-bold not-italic text-white">{n}</i>{title}</h4>
      {children}
    </div>
  );
}
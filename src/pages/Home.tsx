import { Link, useNavigate } from 'react-router-dom';
import { HeroStory } from '@/three/HeroStory';
import { ProductCard } from '@/components/ProductCard';
import { Thumb } from '@/components/Thumb';
import { MeltDivider } from '@/components/melt/MeltDivider';
import { Loader } from '@/components/Loader';
import { useShop } from '@/store/shop';
import { useReveal } from '@/hooks/useReveal';
import { TYPES } from '@/data/constants';
import type { IceCreamType, ModelSpec } from '@/types';

const REPS: Record<IceCreamType, ModelSpec> = {
  cone: { type: 'cone', flavours: ['#F7A1BE', '#FFF1C9'], topping: 'sprinkles', sauce: 'none', cherry: true, wafer: false },
  cup: { type: 'cup', flavours: ['#FFC857'], topping: 'none', sauce: 'strawberry', cherry: false, wafer: true },
  stick: { type: 'stick', flavours: ['#FFF1C9', '#5A2A12'], topping: 'nuts', sauce: 'none', cherry: false, wafer: false },
  sundae: { type: 'sundae', flavours: ['#FFF1C9', '#F7A1BE', '#9E5D3A'], topping: 'sprinkles', sauce: 'chocolate', cherry: true, wafer: false },
  shake: { type: 'shake', flavours: ['#F7A1BE'], topping: 'sprinkles', sauce: 'none', cherry: true, wafer: false },
  sandwich: { type: 'sandwich', flavours: ['#B8F0DC'], topping: 'chips', sauce: 'none', cherry: false, wafer: false },
};
const REVIEWS = [
  { q: 'My kids design their cone on the builder before we even leave the house. Then they change their minds at the counter anyway.', n: 'Nethmi P.', c: '#F7A1BE', r: '-rotate-2' },
  { q: 'Choco shake got to Wellawatte still properly cold at 2pm. Not sure how.', n: 'Kasun F.', c: '#B8F0DC', r: 'rotate-1' },
  { q: 'The mango is the real thing, not the yellow syrup kind. I go every Friday.', n: 'Amaya S.', c: '#F6D46B', r: '-rotate-1' },
];

export default function Home() {
  const { products, loading } = useShop();
  const nav = useNavigate();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  useReveal([products.length]);

  return (
    <>
      <HeroStory />

      {/* Home → Shop: the hero's melted cream pours down over the collection */}
      <MeltDivider variant="drip" />

      <section className="section relative z-[6]" id="kinds">
        <div className="reveal mb-12 flex flex-wrap items-end justify-between gap-8">
          <div><div className="eyebrow">The menu</div><h2 className="h2">What we make.</h2></div>
          <p className="lead">Six kinds, one freezer. Tap one to see what's in it today. Every treat is a 3D model, so what you see is what you get.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {TYPES.map((t) => {
            const n = products.filter((p) => p.type === t.value).length;
            return (
              <button key={t.value} onClick={() => nav(`/shop?type=${t.value}`)} className="glass melt-hover group relative overflow-hidden p-4 pb-5 text-left transition-transform duration-300 hover:-translate-y-1.5" style={{ background: t.bg + '99', ['--drip' as string]: t.bg }}>
                <Thumb spec={REPS[t.value]} alt={t.plural} className="relative z-[3] aspect-square w-full object-contain group-hover:animate-jelly" />
                <b className="mt-1 block font-serif text-[24px]">{t.plural}</b>
                <span className="font-mono text-[12px] text-ink/60">{n} on the menu</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section relative z-[6] pt-0">
        <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-8">
          <div><div className="eyebrow">At the counter this week</div><h2 className="h2">The ones people<br />keep coming back for.</h2></div>
          <Link to="/shop" className="btn-dark px-6 py-4">Full menu</Link>
        </div>
        {loading ? <Loader /> : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      <section className="section relative z-[6]" id="love">
        <div className="reveal mb-12"><div className="eyebrow">From the comment book</div><h2 className="h2">What regulars say.</h2></div>
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.n} className="reveal glass relative p-8 transition duration-500 hover:-translate-y-1.5" style={{ background: r.c + '80' }}>
              <blockquote className="text-[19px] font-medium leading-snug">{r.q}</blockquote>
              <figcaption className="mt-5 font-mono text-sm">— {r.n}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Shop → Build your own: a burst of flavour splashes */}
      <MeltDivider variant="splash" />

      <section className="section relative z-[6]" id="build">
        <div className="reveal grid items-center gap-10 md:grid-cols-2">
          <Link to="/build" aria-label="Open the builder" className="group relative grid aspect-square place-items-center overflow-hidden glass melt-hover !rounded-[40px]" style={{ ['--drip' as string]: '#F7A1BE' }}>
            <Thumb spec={{ type: 'cone', flavours: ['#F7A1BE', '#B8F0DC', '#FFC857'], topping: 'sprinkles', sauce: 'chocolate', cherry: true, wafer: true }} alt="Triple scoop" className="relative z-[3] w-4/5 group-hover:animate-jelly" />
          </Link>
          <div>
            <div className="eyebrow !bg-paper">Build your own</div>
            <h2 className="h2">Can't pick one?<br />Stack three.</h2>
            <p className="lead !text-ink/80">Choose a cone or a cup, drop in up to three scoops and add whatever goes on top. We make it exactly the way it looks on screen.</p>
            <Link to="/build" className="btn-dark mt-8 px-7 py-4">Start building</Link>
          </div>
        </div>
      </section>

      {/* Build → Visit: vanilla, caramel and chocolate rise as a creamy wave */}
      <MeltDivider variant="wave" />

      <section className="section relative z-[6] bg-[#5A2A12] pt-4 text-paper" id="visit">
        <div className="reveal grid items-center gap-12 rounded-[48px] border border-white/15 bg-white/[.06] p-[clamp(30px,5vw,70px)] backdrop-blur-md md:grid-cols-2">
          <div>
            <div className="eyebrow">Come by</div>
            <h2 className="h2">Marine Drive,<br />next to the bus stop.</h2>
            <dl className="my-8 grid grid-cols-[90px_1fr] gap-3 font-mono text-[14px]">
              <dt className="font-bold text-accent-soft">Address</dt><dd>42 Marine Drive, Colombo 03</dd>
              <dt className="font-bold text-accent-soft">Hours</dt><dd>Every day · 10:00 AM – 12:00 AM</dd>
              <dt className="font-bold text-accent-soft">Phone</dt><dd>+94 11 234 5678</dd>
            </dl>
            <a className="btn-accent px-6 py-3.5" href="https://maps.google.com/?q=Marine+Drive+Colombo" target="_blank" rel="noreferrer">Get directions</a>
          </div>
          <div className="relative aspect-[1.3] overflow-hidden rounded-4xl bg-[#CFF5E7]" aria-label="Map">
            <i className="absolute -left-[10%] top-[30%] h-[34px] w-[120%] -rotate-[10deg] bg-white" />
            <i className="absolute -left-[10%] top-[70%] h-[22px] w-[120%] rotate-6 bg-white" />
            <i className="absolute -top-[10%] left-[35%] h-[120%] w-[30px] rotate-12 bg-white" />
            <i className="absolute -top-[10%] left-[75%] h-[120%] w-5 -rotate-[5deg] bg-white" />
            <span className="absolute left-[46%] top-[44%] h-14 w-14 rounded-full border-[5px] border-white bg-accent shadow-lg"><span className="absolute -inset-8 animate-ping2 rounded-full bg-accent/20" /></span>
            <span className="absolute left-[58%] top-[28%] glass !rounded-2xl px-4 py-2.5 text-sm font-bold text-ink">Melt &amp; Magic<small className="block text-xs text-mint">● Open now</small></span>
          </div>
        </div>
      </section>

      {/* the chocolate keeps melting into the footer */}
      <MeltDivider variant="drip" color="#5A2A12" reach={0.5} />
    </>
  );
}
import type { Product } from '@/types';
import { money, typeInfo } from '@/data/constants';
import { useUi } from '@/store/ui';
import { useShop } from '@/store/shop';
import { useAddToCart } from '@/hooks/useAddToCart';
import { Thumb } from './Thumb';

export function ProductCard({ p }: { p: Product }) {
  const open = useUi((s) => s.openViewer);
  const isOpen = useShop((s) => s.settings.isOpen);
  const add = useAddToCart();
  const soldOut = p.stock <= 0;
  return (
    <article className="glass group relative p-3 transition-transform duration-300 hover:-translate-y-1.5">
      <button onClick={() => open(p)} className="melt-hover relative grid aspect-[1/0.92] w-full place-items-center overflow-hidden rounded-[22px]" style={{ background: typeInfo(p.type).bg + 'B3', ['--drip' as string]: typeInfo(p.type).bg }} aria-label={`View ${p.name} in 3D`}>
        {p.badge && <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 font-mono text-xs font-bold uppercase">{p.badge}</span>}
        {soldOut ? <span className="absolute right-3 top-3 z-10 rounded-full bg-ink px-3 py-1 font-mono text-xs font-bold text-paper">Sold out</span>
          : p.stock < 10 && <span className="absolute right-3 top-3 z-10 rounded-full bg-accent px-3 py-1 font-mono text-xs font-bold text-white">Only {p.stock} left</span>}
        <Thumb spec={p} alt={p.name} className="relative z-[3] w-[86%] group-hover:animate-jelly" />
      </button>
      <div className="px-2 pb-2 pt-4">
        <div className="flex items-baseline gap-2">
          <h3 className="font-serif text-[24px] leading-tight">{p.name}</h3>
          <span className="flex-1 translate-y-[-4px] border-b-2 border-dotted border-ink/30" />
          <span className="font-mono text-lg font-bold">{money(p.price)}</span>
        </div>
        <div className="mt-0.5 font-mono text-xs uppercase text-ink/50">{typeInfo(p.type).label}</div>
        <p className="mt-2 min-h-[42px] text-sm leading-normal text-ink/70">{p.description}</p>
        <div className="mt-4">
          <button disabled={soldOut || !isOpen} onClick={(e) => add({ product: p }, e)} aria-label={`Add ${p.name}`} className="btn-dark w-full py-2.5">Add to cart</button>
        </div>
      </div>
    </article>
  );
}
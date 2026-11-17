import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '@/store/shop';
import { ProductCard } from '@/components/ProductCard';
import { Loader } from '@/components/Loader';
import { TYPES, flavourName } from '@/data/constants';
import type { IceCreamType } from '@/types';

type Sort = 'featured' | 'low' | 'high' | 'az';

export default function Shop() {
  const { products, loading, error, loadProducts } = useShop();
  const [params, setParams] = useSearchParams();
  const type = (params.get('type') as IceCreamType | null) ?? 'all';
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('featured');

  const list = useMemo(() => {
    let l = products.filter((p) => type === 'all' || p.type === type);
    const s = q.trim().toLowerCase();
    if (s) l = l.filter((p) => `${p.name} ${p.description} ${p.flavours.map(flavourName).join(' ')}`.toLowerCase().includes(s));
    const by: Record<Sort, (a: typeof l[0], b: typeof l[0]) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder,
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      az: (a, b) => a.name.localeCompare(b.name),
    };
    return [...l].sort(by[sort]);
  }, [products, type, q, sort]);

  const setType = (t: string) => setParams(t === 'all' ? {} : { type: t });

  return (
    <section className="section pt-36">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
        <div><div className="eyebrow">THE MENU</div><h1 className="h2">Every kind<br />of <em>cold.</em></h1></div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1 glass !rounded-full p-1.5" role="tablist">
            {[{ value: 'all', plural: 'All' }, ...TYPES].map((t) => (
              <button key={t.value} role="tab" aria-selected={type === t.value} onClick={() => setType(t.value)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${type === t.value ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink'}`}>{t.plural}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 glass !rounded-full py-1 pl-5 pr-1.5">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search flavours…" aria-label="Search" className="w-40 bg-transparent py-2 outline-none" />
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className="rounded-full bg-white/60 px-3 py-2 font-bold outline-none">
              <option value="featured">Featured</option><option value="low">Price ↑</option><option value="high">Price ↓</option><option value="az">A–Z</option>
            </select>
          </div>
        </div>
      </div>
      {loading ? <Loader /> : error ? (
        <div className="py-16 text-center"><p className="mb-4 text-ink/60">{error}</p><button className="btn-dark" onClick={loadProducts}>Try again</button></div>
      ) : list.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      ) : (
        <p className="py-16 text-center text-ink/60">No treats match that. Try another flavour.</p>
      )}
    </section>
  );
}
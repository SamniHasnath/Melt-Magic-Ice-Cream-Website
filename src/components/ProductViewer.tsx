import { useEffect, useState } from 'react';
import { useUi } from '@/store/ui';
import { money, typeInfo } from '@/data/constants';
import { ProductStage } from '@/three/IceCream';
import { useAddToCart } from '@/hooks/useAddToCart';
import { useShop } from '@/store/shop';
import { CloseButton, Overlay } from './Overlay';

/** Full 360° product view: drag, zoom, choose size and quantity. */
export function ProductViewer() {
  const { viewer: p, closeViewer } = useUi();
  const isOpen = useShop((s) => s.settings.isOpen);
  const add = useAddToCart();
  const [qty, setQty] = useState(1);
  const [large, setLarge] = useState(false);
  useEffect(() => { setQty(1); setLarge(false); }, [p?.id]);

  return (
    <Overlay open={!!p} onClose={closeViewer}>
      {p && (
        <div className="grid md:grid-cols-[1.15fr_1fr]">
          <div className="relative min-h-[380px] md:min-h-[540px]" style={{ background: `radial-gradient(circle at 50% 40%, #fff, ${typeInfo(p.type).bg} 75%)` }}>
            <ProductStage spec={p} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3.5 py-2 text-[13px] text-ink/60">drag to spin 360° · scroll to zoom</span>
          </div>
          <div className="relative p-8 md:p-11">
            <CloseButton onClick={closeViewer} className="absolute right-5 top-5" />
            <div className="eyebrow">{typeInfo(p.type).label.toUpperCase()}{p.badge ? ` · ${p.badge.toUpperCase()}` : ''}</div>
            <h2 className="mb-3.5 font-serif text-[52px] leading-[.95]">{p.name}</h2>
            <p className="leading-relaxed text-ink/60">{p.description}</p>
            <div className="my-5 font-serif text-5xl">{money(p.price * (large ? 1.3 : 1) * qty)}</div>
            <div className="seg">
              <button aria-pressed={!large} onClick={() => setLarge(false)}>Regular</button>
              <button aria-pressed={large} onClick={() => setLarge(true)}>Large +30%</button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-full bg-cream p-1">
                <button className="h-10 w-10 rounded-full bg-white text-lg font-bold" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Less">–</button>
                <span className="min-w-[40px] text-center font-bold">{qty}</span>
                <button className="h-10 w-10 rounded-full bg-white text-lg font-bold" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="More">+</button>
              </div>
              <button disabled={p.stock <= 0 || !isOpen} className="btn-dark px-6 py-3.5" onClick={(e) => { add({ product: p, quantity: qty, sizeFactor: large ? 1.3 : 1 }, e); closeViewer(); }}>
                Add to cart →
              </button>
            </div>
            <p className="mt-4 text-[13px]">{p.stock > 0 ? (p.stock < 10 ? `Hurry, only ${p.stock} left today.` : 'In stock · ready in 5 minutes') : 'Sold out today.'}</p>
          </div>
        </div>
      )}
    </Overlay>
  );
}
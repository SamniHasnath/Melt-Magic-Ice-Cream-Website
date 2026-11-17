import { useNavigate } from 'react-router-dom';
import { cartTotals, useCart } from '@/store/cart';
import { money } from '@/data/constants';
import { CloseButton, Overlay } from './Overlay';
import { Thumb } from './Thumb';

export function CartDrawer() {
  const { items, isOpen, setOpen, setQuantity } = useCart();
  const t = cartTotals(items);
  const nav = useNavigate();
  const close = () => setOpen(false);
  return (
    <Overlay open={isOpen} onClose={close} side="right">
      <header className="flex items-center justify-between px-6 pb-3 pt-6">
        <h3 className="font-serif text-[40px]">Your cart</h3>
        <CloseButton onClick={close} />
      </header>
      <div className="flex-1 overflow-auto px-6">
        {!items.length && <p className="py-16 text-center text-ink/60">Your cart is empty.<br />Go grab a scoop!</p>}
        {items.map((i) => (
          <div key={i.key} className="grid grid-cols-[72px_1fr_auto] items-center gap-3.5 border-b border-ink/10 py-3.5">
            <div className="h-[72px] w-[72px] rounded-2xl bg-accent-soft"><Thumb spec={i.spec} alt={i.name} className="h-full w-full object-contain" /></div>
            <div>
              <b className="block font-semibold">{i.name}</b>
              <small className="text-ink/60">{money(i.unitPrice)} each</small>
              <div className="mt-2 inline-flex items-center rounded-full bg-cream p-1">
                <button aria-label="Less" className="h-7 w-7 rounded-full bg-white font-bold" onClick={() => setQuantity(i.key, i.quantity - 1)}>–</button>
                <span className="min-w-[28px] text-center font-bold">{i.quantity}</span>
                <button aria-label="More" className="h-7 w-7 rounded-full bg-white font-bold" onClick={() => setQuantity(i.key, i.quantity + 1)}>+</button>
              </div>
            </div>
            <b>{money(i.unitPrice * i.quantity)}</b>
          </div>
        ))}
      </div>
      <div className="border-t border-ink/10 px-6 py-6">
        <div className="mb-2 flex justify-between text-ink/60"><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
        <div className="mb-2 flex justify-between text-ink/60"><span>Delivery</span><span>{t.deliveryFee ? money(t.deliveryFee) : t.subtotal ? 'Free' : money(0)}</span></div>
        <div className="mb-5 mt-3 flex justify-between text-xl font-bold"><span>Total</span><span>{money(t.total)}</span></div>
        <button disabled={!items.length} className="btn-dark w-full py-4" onClick={() => { close(); nav('/checkout'); }}>Checkout →</button>
      </div>
    </Overlay>
  );
}
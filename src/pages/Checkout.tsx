import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { cartTotals, useCart } from '@/store/cart';
import { useShop } from '@/store/shop';
import { useUi } from '@/store/ui';
import { ordersApi } from '@/api/services';
import { errorMessage } from '@/api/client';
import { money } from '@/data/constants';
import { Thumb } from '@/components/Thumb';
import type { CreateOrderDto, Order, PaymentMethod } from '@/types';

export default function Checkout() {
  const { items, clear } = useCart();
  const loadProducts = useShop((s) => s.loadProducts);
  const confetti = useUi((s) => s.confetti);
  const t = cartTotals(items);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<Order | null>(null);
  const [form, setForm] = useState({ customerName: '', phone: '', address: '', paymentMethod: 'CASH' as PaymentMethod });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[0-9+\s-]{9,15}$/.test(form.phone)) { setError('Enter a valid phone number'); return; }
    setBusy(true);
    try {
      const dto: CreateOrderDto = { ...form, items: items.map((i) => ({ productId: i.productId, name: i.name, quantity: i.quantity, unitPrice: i.unitPrice, spec: i.spec })) };
      const order = await ordersApi.create(dto);
      setDone(order);
      clear();
      confetti();
      loadProducts();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <section className="section pt-40 text-center">
        <div className="eyebrow">ORDER {done.id}</div>
        <h1 className="h2">Scooped!<br /><em>Thank you.</em></h1>
        <p className="lead mx-auto">We're churning your order now. Estimated delivery: 25–35 min. Total paid on delivery: {money(done.total)}.</p>
        <Link to="/shop" className="btn-dark mt-8 px-7 py-4">Keep browsing</Link>
      </section>
    );

  if (!items.length)
    return (
      <section className="section pt-40 text-center">
        <h1 className="h2">Your cart is <em>empty.</em></h1>
        <Link to="/shop" className="btn-dark mt-8 px-7 py-4">Go grab a scoop →</Link>
      </section>
    );

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <section className="section pt-36">
      <div className="eyebrow">CHECKOUT</div>
      <h1 className="h2 mb-10">Almost <em>scooped.</em></h1>
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={submit} className="glass grid gap-4 p-8">
          <label className="field">Name<input required minLength={2} className="input" value={form.customerName} onChange={set('customerName')} placeholder="Your name" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">Phone<input required className="input" value={form.phone} onChange={set('phone')} placeholder="07X XXX XXXX" /></label>
            <label className="field">Pay with
              <select className="input" value={form.paymentMethod} onChange={set('paymentMethod')}>
                <option value="CASH">Cash on delivery</option><option value="CARD">Card on delivery</option>
              </select>
            </label>
          </div>
          <label className="field">Delivery address<textarea required minLength={5} rows={3} className="input" value={form.address} onChange={set('address')} placeholder="House, street, city" /></label>
          {error && <p className="text-sm font-semibold text-danger">{error}</p>}
          <button disabled={busy} className="btn-dark mt-2 py-4">{busy ? 'Placing order…' : `Place order · ${money(t.total)}`}</button>
        </form>
        <aside className="glass p-8">
          <h3 className="mb-4 font-serif text-3xl">Order summary</h3>
          {items.map((i) => (
            <div key={i.key} className="flex items-center gap-3 border-b border-ink/10 py-3">
              <div className="h-14 w-14 rounded-xl bg-accent-soft"><Thumb spec={i.spec} alt={i.name} className="h-full w-full object-contain" /></div>
              <div className="flex-1 text-sm"><b>{i.name}</b><br /><span className="text-ink/60">{i.quantity} × {money(i.unitPrice)}</span></div>
              <b>{money(i.quantity * i.unitPrice)}</b>
            </div>
          ))}
          <div className="mt-4 flex justify-between text-ink/60"><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
          <div className="mt-1 flex justify-between text-ink/60"><span>Delivery</span><span>{t.deliveryFee ? money(t.deliveryFee) : 'Free'}</span></div>
          <div className="mt-3 flex justify-between text-xl font-bold"><span>Total</span><span>{money(t.total)}</span></div>
        </aside>
      </div>
    </section>
  );
}
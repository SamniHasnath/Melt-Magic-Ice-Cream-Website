import type { MouseEvent } from 'react';
import type { ModelSpec, Product } from '@/types';
import { useCart } from '@/store/cart';
import { useShop } from '@/store/shop';
import { toast } from '@/store/ui';

/** Flies a little scoop from the click point to the cart button. */
function flyToCart(e?: MouseEvent) {
  const target = document.getElementById('cart-button')?.getBoundingClientRect();
  if (!e || !target) return;
  const d = document.createElement('div');
  d.style.cssText = `position:fixed;z-index:400;width:22px;height:22px;border-radius:50%;background:rgb(var(--accent));left:${e.clientX - 11}px;top:${e.clientY - 11}px;transition:all .7s cubic-bezier(.5,-0.4,.4,1);pointer-events:none`;
  document.body.appendChild(d);
  requestAnimationFrame(() => {
    d.style.left = `${target.left + target.width - 22}px`;
    d.style.top = `${target.top + 8}px`;
    d.style.transform = 'scale(.4)';
  });
  setTimeout(() => d.remove(), 750);
}

export function useAddToCart() {
  const add = useCart((s) => s.add);
  const isOpen = useShop((s) => s.settings.isOpen);
  return (item: { product?: Product; name?: string; price?: number; spec?: ModelSpec; quantity?: number; sizeFactor?: number }, e?: MouseEvent) => {
    if (!isOpen) { toast("We're closed right now. Ordering is paused"); return; }
    const p = item.product;
    const factor = item.sizeFactor ?? 1;
    const spec: ModelSpec = item.spec ?? { type: p!.type, flavours: p!.flavours, topping: p!.topping, sauce: p!.sauce, cherry: p!.cherry, wafer: p!.wafer };
    const name = (item.name ?? p!.name) + (factor > 1 ? ' (Large)' : '');
    add({ productId: p?.id ?? null, name, unitPrice: Math.round((item.price ?? p!.price) * factor * 100) / 100, quantity: item.quantity ?? 1, spec });
    toast(`${name} added to cart`);
    flyToCart(e);
  };
}
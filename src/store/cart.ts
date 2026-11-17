import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';
import { DELIVERY_FEE, FREE_DELIVERY_OVER } from '@/data/constants';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  bump: number;
  add: (item: Omit<CartItem, 'key'>) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

const keyOf = (i: Omit<CartItem, 'key'>) =>
  [i.productId ?? 'custom', i.name, i.unitPrice, JSON.stringify(i.spec)].join('|');

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      bump: 0,
      add: (item) =>
        set((s) => {
          const key = keyOf(item);
          const found = s.items.find((x) => x.key === key);
          const items = found
            ? s.items.map((x) => (x.key === key ? { ...x, quantity: x.quantity + item.quantity } : x))
            : [...s.items, { ...item, key }];
          return { items, bump: s.bump + 1 };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          items: quantity <= 0 ? s.items.filter((x) => x.key !== key) : s.items.map((x) => (x.key === key ? { ...x, quantity } : x)),
        })),
      clear: () => set({ items: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    { name: 'scoopverse-cart-lkr', partialize: (s) => ({ items: s.items }) },
  ),
);

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee, count: items.reduce((a, i) => a + i.quantity, 0) };
}
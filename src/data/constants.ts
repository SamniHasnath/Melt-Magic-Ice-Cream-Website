import type { IceCreamType, OrderStatus, Sauce, Topping } from '@/types';

export const FLAVOURS: { name: string; hex: string }[] = [
  { name: 'Strawberry', hex: '#F7A1BE' },
  { name: 'Vanilla', hex: '#FFF1C9' },
  { name: 'Chocolate', hex: '#9E5D3A' },
  { name: 'Mint', hex: '#B8F0DC' },
  { name: 'Mango', hex: '#FFC857' },
  { name: 'Blueberry', hex: '#B6B3FF' },
  { name: 'Pistachio', hex: '#C9DF9A' },
  { name: 'Caramel', hex: '#E8B07A' },
  { name: 'Cookies', hex: '#E9E2DA' },
  { name: 'Lemon', hex: '#FFF3A0' },
  { name: 'Ube', hex: '#B48AD6' },
  { name: 'Coconut', hex: '#FFFFFF' },
  { name: 'Dark Choc', hex: '#5A2A12' },
];

export const flavourName = (hex: string) =>
  FLAVOURS.find((f) => f.hex.toLowerCase() === hex.toLowerCase())?.name ?? hex;

export const TYPES: { value: IceCreamType; label: string; plural: string; bg: string }[] = [
  { value: 'cone', label: 'Cone', plural: 'Cones', bg: '#F8DDE5' },
  { value: 'cup', label: 'Cup', plural: 'Cups', bg: '#FFEBC7' },
  { value: 'stick', label: 'Stick', plural: 'Sticks', bg: '#DDF5EA' },
  { value: 'sundae', label: 'Sundae', plural: 'Sundaes', bg: '#EDE3FF' },
  { value: 'shake', label: 'Shake', plural: 'Shakes', bg: '#FFE0E8' },
  { value: 'sandwich', label: 'Sandwich', plural: 'Sandwiches', bg: '#F1E5DA' },
];
export const typeInfo = (t: IceCreamType) => TYPES.find((x) => x.value === t) ?? TYPES[0];

export const TOPPINGS: Topping[] = ['none', 'sprinkles', 'chips', 'nuts'];
export const SAUCES: Sauce[] = ['none', 'chocolate', 'caramel', 'strawberry'];
export const SAUCE_COLORS: Record<Sauce, string | null> = {
  none: null,
  chocolate: '#4A2412',
  caramel: '#C27A2C',
  strawberry: '#D93A5E',
};

export const ACCENTS: { color: string; soft: string; name: string }[] = [
  { color: '#E8457A', soft: '#F8D3DF', name: 'Berry' },
  { color: '#1FA67F', soft: '#CDEFE2', name: 'Mint' },
  { color: '#7A3E22', soft: '#EBD9CC', name: 'Cocoa' },
  { color: '#4C6FFF', soft: '#DCE3FF', name: 'Blue' },
];

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const FREE_DELIVERY_OVER = 4000;
export const DELIVERY_FEE = 350;

/** Sri Lankan rupees, whole amounts with thousands separators, e.g. Rs 1,450 */
export const money = (n: number) => 'Rs ' + Math.round(n).toLocaleString('en-US');


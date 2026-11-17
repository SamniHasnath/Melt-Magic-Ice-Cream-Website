import type { Product, Settings } from '@/types';

type Seed = Omit<Product, 'createdAt' | 'updatedAt'>;
const p = (x: Omit<Seed, 'badge'> & { badge?: string }): Seed => ({ ...x, badge: x.badge ?? null });

/** Starter menu used by the mock API (the backend team can reuse it in prisma/seed.ts). */
export const SEED_PRODUCTS: Seed[] = [
  p({ id: 'strawberry-cloud-cone', name: 'Strawberry Cloud Cone', type: 'cone', flavours: ['#F7A1BE'], topping: 'sprinkles', sauce: 'none', cherry: true, wafer: false, price: 900, stock: 42, badge: 'Bestseller', description: 'Real berries churned into cloud-soft cream with a rainbow crown.', featured: true, active: true, sortOrder: 1 }),
  p({ id: 'mint-chip-double', name: 'Mint Chip Double', type: 'cone', flavours: ['#B8F0DC', '#B8F0DC'], topping: 'chips', sauce: 'none', cherry: false, wafer: false, price: 1050, stock: 30, description: 'Two scoops of garden mint loaded with dark chocolate chips.', featured: false, active: true, sortOrder: 2 }),
  p({ id: 'triple-tower', name: 'Triple Tower', type: 'cone', flavours: ['#9E5D3A', '#FFF1C9', '#F7A1BE'], topping: 'sprinkles', sauce: 'chocolate', cherry: true, wafer: false, price: 1450, stock: 18, badge: "Chef's pick", description: 'Chocolate, vanilla and strawberry stacked high with fudge drizzle.', featured: true, active: true, sortOrder: 3 }),
  p({ id: 'strawberry-cloud-cup', name: 'Strawberry Cloud Cup', type: 'cup', flavours: ['#F7A1BE'], topping: 'sprinkles', sauce: 'none', cherry: true, wafer: true, price: 1100, stock: 36, badge: 'New', description: 'Berry cream in a paper cup with a crisp wafer and a glossy cherry.', featured: true, active: true, sortOrder: 4 }),
  p({ id: 'vanilla-caramel-cup', name: 'Vanilla Caramel Cup', type: 'cup', flavours: ['#FFF1C9', '#FFF1C9'], topping: 'nuts', sauce: 'caramel', cherry: false, wafer: true, price: 1100, stock: 25, description: 'Madagascar vanilla with salted caramel and toasted nuts.', featured: false, active: true, sortOrder: 5 }),
  p({ id: 'mango-sunset-cup', name: 'Mango Sunset Cup', type: 'cup', flavours: ['#FFC857'], topping: 'none', sauce: 'strawberry', cherry: true, wafer: false, price: 950, stock: 8, badge: 'Vegan', description: 'Alphonso mango sorbet with a ribbon of strawberry sauce.', featured: false, active: true, sortOrder: 6 }),
  p({ id: 'choco-crunch-stick', name: 'Choco Crunch Stick', type: 'stick', flavours: ['#FFF1C9', '#5A2A12'], topping: 'nuts', sauce: 'none', cherry: false, wafer: false, price: 650, stock: 50, description: 'Vanilla bar dipped in dark chocolate and crushed almonds.', featured: false, active: true, sortOrder: 7 }),
  p({ id: 'berry-pop', name: 'Berry Pop', type: 'stick', flavours: ['#F7A1BE', '#FFFFFF'], topping: 'sprinkles', sauce: 'none', cherry: false, wafer: false, price: 600, stock: 44, badge: 'Kids love', description: 'Strawberry bar dunked in white chocolate and sprinkles.', featured: false, active: true, sortOrder: 8 }),
  p({ id: 'mango-ice-pop', name: 'Mango Ice Pop', type: 'stick', flavours: ['#FFC857'], topping: 'none', sauce: 'none', cherry: false, wafer: false, price: 500, stock: 60, description: 'Pure frozen mango on a stick. Sunshine you can bite.', featured: false, active: true, sortOrder: 9 }),
  p({ id: 'grand-sundae', name: 'The Grand Sundae', type: 'sundae', flavours: ['#FFF1C9', '#F7A1BE', '#9E5D3A'], topping: 'sprinkles', sauce: 'chocolate', cherry: true, wafer: false, price: 1600, stock: 15, badge: 'Share it', description: 'Three scoops, whipped cream, hot fudge and a cherry on top.', featured: true, active: true, sortOrder: 10 }),
  p({ id: 'caramel-crunch-sundae', name: 'Caramel Crunch Sundae', type: 'sundae', flavours: ['#E8B07A', '#FFF1C9'], topping: 'nuts', sauce: 'caramel', cherry: true, wafer: false, price: 1450, stock: 12, description: 'Caramel and vanilla scoops under a glossy caramel pour.', featured: false, active: true, sortOrder: 11 }),
  p({ id: 'berry-blast-shake', name: 'Berry Blast Shake', type: 'shake', flavours: ['#F7A1BE'], topping: 'sprinkles', sauce: 'none', cherry: true, wafer: false, price: 1200, stock: 28, description: 'Thick strawberry shake crowned with whipped cream.', featured: false, active: true, sortOrder: 12 }),
  p({ id: 'cookies-cream-shake', name: 'Cookies & Cream Shake', type: 'shake', flavours: ['#E9E2DA'], topping: 'chips', sauce: 'chocolate', cherry: false, wafer: false, price: 1250, stock: 22, badge: 'Bestseller', description: 'Crushed cookies blended into vanilla, finished with fudge.', featured: false, active: true, sortOrder: 13 }),
  p({ id: 'mint-cookie-sandwich', name: 'Mint Cookie Sandwich', type: 'sandwich', flavours: ['#B8F0DC'], topping: 'chips', sauce: 'none', cherry: false, wafer: false, price: 750, stock: 34, description: 'Mint chip pressed between two soft chocolate cookies.', featured: false, active: true, sortOrder: 14 }),
  p({ id: 'confetti-sandwich', name: 'Confetti Sandwich', type: 'sandwich', flavours: ['#FFF1C9'], topping: 'sprinkles', sauce: 'none', cherry: false, wafer: false, price: 700, stock: 6, description: 'Vanilla cream rolled in rainbow sprinkles.', featured: false, active: true, sortOrder: 15 }),
];

export const DEFAULT_SETTINGS: Settings = {
  announcement: 'Free delivery over Rs 4,000 · New: Mango Sunset Cup · Open till midnight',
  heroLine: '',
  featuredProductId: 'strawberry-cloud-cup',
  accent: '#E8457A',
  isOpen: true,
};
/**
 * In-browser mock of the NestJS REST API.
 * Same request/response shapes as the real endpoints, data kept in localStorage.
 * Turn it off with VITE_USE_MOCK=false once the backend is running.
 */
import type {
  CreateOrderDto, CreateProductDto, LoginDto, LoginResponse, Order, OrderStatus,
  Product, ProductQuery, Settings, UpdateProductDto,
} from '@/types';
import { DEFAULT_SETTINGS, SEED_PRODUCTS } from '@/data/seed';
import { DELIVERY_FEE, FREE_DELIVERY_OVER } from '@/data/constants';
import { useAuth } from '@/store/auth';
import { ApiError } from './client';

interface Db { products: Product[]; orders: Order[]; settings: Settings }
const KEY = 'scoopverse-mockdb-v2';
const MOCK_ADMIN = { email: 'admin@meltandmagic.lk', password: 'scoop123' };

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch { /* ignore */ }
  const now = new Date().toISOString();
  return { products: SEED_PRODUCTS.map((p) => ({ ...p, createdAt: now, updatedAt: now })), orders: [], settings: DEFAULT_SETTINGS };
}
let db = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* ignore */ } };
const wait = <T,>(v: T, ms = 220) => new Promise<T>((r) => setTimeout(() => r(structuredClone(v)), ms));
const requireAdmin = () => { if (!useAuth.getState().token) throw new ApiError('Unauthorized', 401); };
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

function validateProduct(d: Partial<CreateProductDto>, partial: boolean) {
  const errs: string[] = [];
  if (!partial || d.name !== undefined) if (!d.name || d.name.trim().length < 2) errs.push('name must be at least 2 characters');
  if (!partial || d.price !== undefined) if (typeof d.price !== 'number' || d.price < 0) errs.push('price must be a positive number');
  if (!partial || d.stock !== undefined) if (!Number.isInteger(d.stock) || (d.stock as number) < 0) errs.push('stock must be a whole number ≥ 0');
  if (!partial || d.flavours !== undefined) if (!d.flavours?.length || d.flavours.length > 3) errs.push('flavours must contain 1 to 3 colours');
  if (errs.length) throw new ApiError(errs.join(', '), 400);
}

export const mock = {
  login: async (dto: LoginDto): Promise<LoginResponse> => {
    if (dto.email.trim().toLowerCase() !== MOCK_ADMIN.email || dto.password !== MOCK_ADMIN.password) {
      await wait(null, 500);
      throw new ApiError('Invalid email or password', 401);
    }
    return wait({ accessToken: 'mock.' + btoa(dto.email) + '.' + Date.now(), admin: { id: 'admin-1', email: MOCK_ADMIN.email, name: 'Shop Admin' } }, 500);
  },

  listProducts: (q: ProductQuery = {}, includeHidden = false) => {
    if (includeHidden) requireAdmin();
    let list = db.products.filter((p) => includeHidden || p.active);
    if (q.type) list = list.filter((p) => p.type === q.type);
    if (q.search) { const s = q.search.toLowerCase(); list = list.filter((p) => (p.name + ' ' + p.description).toLowerCase().includes(s)); }
    return wait([...list].sort((a, b) => a.sortOrder - b.sortOrder));
  },
  getProduct: (id: string) => {
    const p = db.products.find((x) => x.id === id && x.active);
    if (!p) return Promise.reject(new ApiError('Product not found', 404));
    return wait(p);
  },
  createProduct: (dto: CreateProductDto) => {
    requireAdmin(); validateProduct(dto, false);
    const now = new Date().toISOString();
    const p: Product = { ...dto, id: uid(), createdAt: now, updatedAt: now };
    db.products.push(p); save(); return wait(p);
  },
  updateProduct: (id: string, dto: UpdateProductDto) => {
    requireAdmin(); validateProduct(dto, true);
    const i = db.products.findIndex((x) => x.id === id);
    if (i < 0) return Promise.reject(new ApiError('Product not found', 404));
    db.products[i] = { ...db.products[i], ...dto, updatedAt: new Date().toISOString() }; save();
    return wait(db.products[i]);
  },
  deleteProduct: (id: string) => {
    requireAdmin();
    db.products = db.products.filter((x) => x.id !== id); save();
    return wait({ success: true });
  },

  createOrder: (dto: CreateOrderDto) => {
    if (!db.settings.isOpen) return Promise.reject(new ApiError('The shop is closed right now', 400));
    if (!dto.items.length) return Promise.reject(new ApiError('items should not be empty', 400));
    const subtotal = dto.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
    for (const it of dto.items) {
      const p = it.productId ? db.products.find((x) => x.id === it.productId) : null;
      if (p) p.stock = Math.max(0, p.stock - it.quantity);
    }
    const order: Order = { ...dto, id: 'SV' + Date.now().toString(36).toUpperCase().slice(-6), subtotal, deliveryFee, total: subtotal + deliveryFee, status: 'NEW', createdAt: new Date().toISOString() };
    db.orders.unshift(order); save(); return wait(order, 600);
  },
  listOrders: () => { requireAdmin(); return wait(db.orders); },
  updateOrderStatus: (id: string, status: OrderStatus) => {
    requireAdmin();
    const o = db.orders.find((x) => x.id === id);
    if (!o) return Promise.reject(new ApiError('Order not found', 404));
    o.status = status; save(); return wait(o);
  },

  getSettings: () => wait(db.settings, 80),
  updateSettings: (dto: Partial<Settings>) => { requireAdmin(); db.settings = { ...db.settings, ...dto }; save(); return wait(db.settings); },

  /** Admin-only helper for the demo: restore the starter menu. */
  reset: () => { localStorage.removeItem(KEY); db = load(); save(); },
};
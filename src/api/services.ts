/**
 * One function per REST endpoint. Pages only ever call these.
 *
 *   POST   /auth/login                 → LoginResponse
 *   GET    /products?type=&search=     → Product[]   (public, active only)
 *   GET    /products/admin             → Product[]   (JWT, includes hidden)
 *   GET    /products/:id               → Product
 *   POST   /products                   → Product     (JWT)
 *   PATCH  /products/:id               → Product     (JWT)
 *   DELETE /products/:id               → { success } (JWT)
 *   POST   /orders                     → Order       (public checkout)
 *   GET    /orders                     → Order[]     (JWT)
 *   PATCH  /orders/:id/status          → Order       (JWT)
 *   GET    /settings                   → Settings    (public)
 *   PATCH  /settings                   → Settings    (JWT)
 */
import type {
  CreateOrderDto, CreateProductDto, LoginDto, LoginResponse, Order, OrderStatus,
  Product, ProductQuery, Settings, UpdateProductDto,
} from '@/types';
import { http, USE_MOCK } from './client';
import { mock } from './mock';

export const authApi = {
  login: (dto: LoginDto) =>
    USE_MOCK ? mock.login(dto) : http.post<LoginResponse>('/auth/login', dto).then((r) => r.data),
};

export const productsApi = {
  list: (q: ProductQuery = {}) =>
    USE_MOCK ? mock.listProducts(q) : http.get<Product[]>('/products', { params: q }).then((r) => r.data),
  listAll: () =>
    USE_MOCK ? mock.listProducts({}, true) : http.get<Product[]>('/products/admin').then((r) => r.data),
  get: (id: string) =>
    USE_MOCK ? mock.getProduct(id) : http.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (dto: CreateProductDto) =>
    USE_MOCK ? mock.createProduct(dto) : http.post<Product>('/products', dto).then((r) => r.data),
  update: (id: string, dto: UpdateProductDto) =>
    USE_MOCK ? mock.updateProduct(id, dto) : http.patch<Product>(`/products/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    USE_MOCK ? mock.deleteProduct(id) : http.delete<{ success: boolean }>(`/products/${id}`).then((r) => r.data),
};

export const ordersApi = {
  create: (dto: CreateOrderDto) =>
    USE_MOCK ? mock.createOrder(dto) : http.post<Order>('/orders', dto).then((r) => r.data),
  list: () =>
    USE_MOCK ? mock.listOrders() : http.get<Order[]>('/orders').then((r) => r.data),
  updateStatus: (id: string, status: OrderStatus) =>
    USE_MOCK ? mock.updateOrderStatus(id, status) : http.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data),
};

export const settingsApi = {
  get: () => (USE_MOCK ? mock.getSettings() : http.get<Settings>('/settings').then((r) => r.data)),
  update: (dto: Partial<Settings>) =>
    USE_MOCK ? mock.updateSettings(dto) : http.patch<Settings>('/settings', dto).then((r) => r.data),
};
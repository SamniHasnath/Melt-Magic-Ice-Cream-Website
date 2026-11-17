/**
 * Shared types. These mirror the NestJS DTOs / Prisma models the backend
 * team will build, so swapping the mock API for the real one needs no UI changes.
 */
export type IceCreamType = 'cone' | 'cup' | 'stick' | 'sundae' | 'shake' | 'sandwich';
export type Topping = 'none' | 'sprinkles' | 'chips' | 'nuts';
export type Sauce = 'none' | 'chocolate' | 'caramel' | 'strawberry';

/** Everything the 3D engine needs to draw a treat. */
export interface ModelSpec {
  type: IceCreamType;
  /** Hex colours, bottom → top. 1–3 entries. */
  flavours: string[];
  topping: Topping;
  sauce: Sauce;
  cherry: boolean;
  wafer: boolean;
}

export interface Product extends ModelSpec {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  badge: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

/** POST /products body (CreateProductDto) */
export type CreateProductDto = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
/** PATCH /products/:id body (UpdateProductDto = PartialType(CreateProductDto)) */
export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductQuery {
  type?: IceCreamType;
  search?: string;
}

export type OrderStatus = 'NEW' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD';

export interface OrderItem {
  productId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  spec?: ModelSpec;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

/** POST /orders body (CreateOrderDto) */
export interface CreateOrderDto {
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
}

export interface Settings {
  announcement: string;
  heroLine: string;
  featuredProductId: string | null;
  accent: string;
  isOpen: boolean;
}

export interface AuthAdmin {
  id: string;
  email: string;
  name: string;
}

/** POST /auth/login response */
export interface LoginResponse {
  accessToken: string;
  admin: AuthAdmin;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CartItem {
  key: string;
  productId: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  spec: ModelSpec;
}
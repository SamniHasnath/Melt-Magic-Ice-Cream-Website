import { create } from 'zustand';
import type { Product, Settings } from '@/types';
import { productsApi, settingsApi } from '@/api/services';
import { DEFAULT_SETTINGS } from '@/data/seed';
import { errorMessage } from '@/api/client';

interface ShopState {
  products: Product[];
  settings: Settings;
  loading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

/** Public storefront data (active products + site settings). */
export const useShop = create<ShopState>((set) => ({
  products: [],
  settings: DEFAULT_SETTINGS,
  loading: true,
  error: null,
  loadProducts: async () => {
    try {
      const products = await productsApi.list();
      set({ products, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: errorMessage(e) });
    }
  },
  loadSettings: async () => {
    try {
      set({ settings: { ...DEFAULT_SETTINGS, ...(await settingsApi.get()) } });
    } catch {
      /* keep defaults */
    }
  },
}));
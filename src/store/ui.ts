import { create } from 'zustand';
import type { Product } from '@/types';

interface UiState {
  toast: { id: number; message: string } | null;
  viewer: Product | null;
  confettiAt: number;
  showToast: (message: string) => void;
  openViewer: (p: Product) => void;
  closeViewer: () => void;
  confetti: () => void;
}

export const useUi = create<UiState>((set) => ({
  toast: null,
  viewer: null,
  confettiAt: 0,
  showToast: (message) => set({ toast: { id: Date.now(), message } }),
  openViewer: (viewer) => set({ viewer }),
  closeViewer: () => set({ viewer: null }),
  confetti: () => set({ confettiAt: Date.now() }),
}));

export const toast = (m: string) => useUi.getState().showToast(m);
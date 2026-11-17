import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthAdmin, LoginResponse } from '@/types';

interface AuthState {
  token: string | null;
  admin: AuthAdmin | null;
  setSession: (res: LoginResponse) => void;
  logout: () => void;
}

/** Holds the admin JWT. The axios interceptor reads the token from here. */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      setSession: (res) => set({ token: res.accessToken, admin: res.admin }),
      logout: () => set({ token: null, admin: null }),
    }),
    { name: 'scoopverse-auth' },
  ),
);
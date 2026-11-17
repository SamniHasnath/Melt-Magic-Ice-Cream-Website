import axios, { AxiosError } from 'axios';
import { useAuth } from '@/store/auth';

export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/** Axios instance for the NestJS REST API. */
export const http = axios.create({ baseURL: API_URL, timeout: 15000 });

// Attach the admin JWT to every request.
http.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired / invalid token logs the admin out.
http.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401) useAuth.getState().logout();
    return Promise.reject(error);
  },
);

/**
 * Turns any error into a readable sentence.
 * NestJS + class-validator returns `{ message: string | string[] }`.
 */
export function errorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data!.message.join(', ');
    if (data?.message) return data.message;
    if (!e.response) return 'Cannot reach the server. Is the API running?';
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return 'Something went wrong';
}

/** Thrown by the mock API so it behaves like the real one. */
export class ApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

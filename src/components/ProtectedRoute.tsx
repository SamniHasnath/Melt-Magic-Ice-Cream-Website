import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/auth';

/** Sends anyone without an admin JWT to the login page. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAuth((s) => s.token);
  const location = useLocation();
  if (!token) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
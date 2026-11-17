import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Toast } from '@/components/Toast';
import { USE_MOCK } from '@/api/client';

const ICONS = {
  overview: <path d="M3 13h4v5H3zM8 8h4v10H8zM13 3h4v15h-4z" />,
  products: <path d="M6 8a4 4 0 1 1 8 0M5 8h10l-5 10z" />,
  orders: <path d="M5 3h10v15l-2.5-1.5L10 18l-2.5-1.5L5 18zM8 7h4M8 10.5h4" />,
  settings: <path d="M3 6h9M15 6h2M3 14h2M8 14h9M12 4v4M5 12v4" />,
  site: <path d="M8 4H4v12h12v-4M11 3h6v6M17 3l-8 8" />,
};
const Icon = ({ name }: { name: keyof typeof ICONS }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {ICONS[name]}
  </svg>
);

const NAV: { to: string; label: string; icon: keyof typeof ICONS; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: 'overview', end: true },
  { to: '/admin/products', label: 'Products', icon: 'products' },
  { to: '/admin/orders', label: 'Orders', icon: 'orders' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);

  return (
    <div className="admin min-h-screen md:grid md:grid-cols-[240px_1fr]">
      {/* sidebar */}
      <aside className={`${menu ? 'block' : 'hidden'} bg-[#343a40] text-[#c2c7d0] md:sticky md:top-0 md:block md:h-screen`}>
        <Link to="/admin" className="block border-b border-[#4b545c] px-4 py-[15px] text-[19px] text-white">
          <b>Melt &amp; Magic</b> <span className="font-light">Admin</span>
        </Link>
        <div className="border-b border-[#4b545c] px-4 py-3 text-[14px]">
          <div className="text-white">Administrator</div>
          <div className="truncate text-[13px]">{admin?.email}</div>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setMenu(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded px-3 py-2 ${isActive ? 'bg-[#0d6efd] text-white' : 'hover:bg-white/10 hover:text-white'}`}>
              <Icon name={n.icon} />{n.label}
            </NavLink>
          ))}
          <Link to="/" className="flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 hover:text-white"><Icon name="site" />View website</Link>
        </nav>
      </aside>

      <div className="min-w-0">
        {/* top bar */}
        <header className="flex h-[57px] items-center justify-between border-b border-[#dee2e6] bg-white px-4">
          <button className="rounded px-2 py-1 text-[20px] text-[#6c757d] hover:bg-[#f1f3f5] md:hidden" onClick={() => setMenu((m) => !m)} aria-label="Toggle menu">☰</button>
          <span className="hidden text-[#6c757d] md:inline">Melt &amp; Magic ice cream shop</span>
          <button onClick={() => { logout(); nav('/admin/login'); }} className="btn-light">Logout</button>
        </header>

        <main className="p-4 md:p-6">
          {USE_MOCK && (
            <div className="alert-warning mb-4">
              <b>Demo mode:</b> data is saved in this browser only. Set VITE_USE_MOCK=false to use the NestJS backend.
            </div>
          )}
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}

export function PageHead({ title, children }: { title: string; note?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-[26px] font-normal">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

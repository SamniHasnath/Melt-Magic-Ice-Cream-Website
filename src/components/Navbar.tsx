import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cartTotals, useCart } from '@/store/cart';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/build', label: 'Build yours' },
  { to: '/#visit', label: 'Visit' },
];

export function Navbar() {
  const { items, bump, setOpen } = useCart();
  const count = cartTotals(items).count;
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  const [pop, setPop] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setSolid(pathname !== '/' || scrollY > innerHeight * 4.5);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, [pathname]);
  useEffect(() => { setMenu(false); }, [pathname]);
  useEffect(() => {
    if (!bump) return;
    setPop(true);
    const t = setTimeout(() => setPop(false), 300);
    return () => clearTimeout(t);
  }, [bump]);

  return (
    <nav className={`fixed inset-x-0 top-[34px] z-[55] flex items-center justify-between px-[clamp(16px,4vw,56px)] py-4 transition ${solid ? 'border-b border-white/60 bg-white/40 backdrop-blur-xl' : ''}`}>
      <Link to="/" className="flex items-baseline gap-2 font-serif text-[28px] leading-none">Melt &amp; Magic<small className="hidden font-mono text-[11px] font-normal tracking-normal text-ink/60 lg:inline">est. Colombo</small></Link>
      <div className={`${menu ? 'fixed inset-x-4 top-24 flex flex-col glass !rounded-3xl p-2' : 'hidden'} gap-1 md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end className={({ isActive }) => `px-3 py-2 text-[15px] font-bold underline-offset-[6px] decoration-2 transition hover:text-accent ${isActive && !l.to.includes('#') ? 'underline decoration-accent' : ''}`}>
            {l.label}
          </NavLink>
        ))}
      </div>
      <div className="flex items-center gap-2.5">
        <Link to="/admin" className="btn-light hidden sm:inline-flex">Admin</Link>
        <button id="cart-button" onClick={() => setOpen(true)} className="btn-dark">
          Cart
          <span className={`grid h-[26px] min-w-[26px] place-items-center rounded-md bg-accent px-1.5 text-xs font-bold text-white transition-transform duration-300 ${pop ? 'scale-[1.35]' : ''}`}>{count}</span>
        </button>
        <button className="btn-light md:hidden" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>Menu</button>
      </div>
    </nav>
  );
}

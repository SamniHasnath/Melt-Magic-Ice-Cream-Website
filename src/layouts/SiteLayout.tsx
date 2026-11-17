import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductViewer } from '@/components/ProductViewer';
import { Toast } from '@/components/Toast';
import { Confetti } from '@/components/Confetti';
import { MeltRail } from '@/components/melt/MeltRail';
import { FloatingSweets } from '@/components/melt/FloatingSweets';
import { ScrollTrigger } from '@/lib/gsap';

export default function SiteLayout() {
  const { pathname, hash } = useLocation();
  // Scroll to top on page change, or to #section links like /#visit.
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120);
      return () => clearTimeout(t);
    }
    scrollTo({ top: 0 });
  }, [pathname, hash]);

  // Lazy pages, images and product lists change the page height after load.
  // Re-measure every scroll-driven melt when that happens (debounced).
  useEffect(() => {
    let t = 0;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = window.setTimeout(() => ScrollTrigger.refresh(), 150); });
    ro.observe(document.body);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, []);

  return (
    <>
      <FloatingSweets />
      <MeltRail />
      <AnnouncementBar />
      <Navbar />
      <main><Outlet /></main>
      <Footer />
      <CartDrawer />
      <ProductViewer />
      <Toast />
      <Confetti />
    </>
  );
}
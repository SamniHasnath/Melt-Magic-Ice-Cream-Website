import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SiteLayout from '@/layouts/SiteLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader } from '@/components/Loader';
import { useShop } from '@/store/shop';
import { applyAccent } from '@/hooks/useAccent';

const Home = lazy(() => import('@/pages/Home'));
const Shop = lazy(() => import('@/pages/Shop'));
const Builder = lazy(() => import('@/pages/Builder'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Login = lazy(() => import('@/pages/admin/Login'));
const Overview = lazy(() => import('@/pages/admin/Overview'));
const Products = lazy(() => import('@/pages/admin/Products'));
const Orders = lazy(() => import('@/pages/admin/Orders'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

export default function App() {
  const { loadProducts, loadSettings, settings } = useShop();
  useEffect(() => { loadProducts(); loadSettings(); }, [loadProducts, loadSettings]);
  useEffect(() => applyAccent(settings.accent), [settings.accent]);

  return (
    <Suspense fallback={<Loader full />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="build" element={<Builder />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>
        <Route path="admin/login" element={<Login />} />
        <Route path="admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Overview />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
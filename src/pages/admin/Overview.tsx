import { Link } from 'react-router-dom';
import { productsApi, ordersApi } from '@/api/services';
import { useAsync } from '@/hooks/useAsync';
import { Loader } from '@/components/Loader';
import { PageHead } from '@/layouts/AdminLayout';
import { ORDER_STATUSES, TYPES, money } from '@/data/constants';
import { STATUS_BADGE } from './Orders';

export default function Overview() {
  const { data, loading, error } = useAsync(() => Promise.all([productsApi.listAll(), ordersApi.list()]));
  if (loading) return <Loader />;
  if (error || !data) return <p className="text-danger">{error}</p>;
  const [products, orders] = data;
  const revenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((a, o) => a + o.total, 0);
  const low = products.filter((p) => p.stock < 10);
  const maxType = Math.max(1, ...TYPES.map((t) => products.filter((p) => p.type === t.value).length));
  const stats = [
    { label: 'Products', value: products.length, color: 'bg-[#17a2b8]', link: '/admin/products' },
    { label: 'Live on site', value: products.filter((p) => p.active).length, color: 'bg-[#28a745]', link: '/admin/products' },
    { label: 'Low stock', value: low.length, color: 'bg-[#dc3545]', link: '/admin/products' },
    { label: 'Orders', value: orders.length, color: 'bg-[#6f42c1]', link: '/admin/orders' },
    { label: 'Revenue', value: money(revenue), color: 'bg-[#fd7e14]', link: '/admin/orders' },
  ];

  return (
    <>
      <PageHead title="Dashboard">
        <Link to="/admin/products?new=1" className="btn-dark">+ Add product</Link>
      </PageHead>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className={`stat ${s.color}`}>
            <b className="num">{s.value}</b>
            <span>{s.label}</span>
            <Link to={s.link} className="-mx-4 -mb-4 mt-3 block bg-black/10 py-1 text-center text-[13px] text-white/90 hover:bg-black/20">More info</Link>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="card-header"><h3>Menu by kind</h3></div>
          <div className="card-body grid gap-3">
            {TYPES.map((t) => {
              const n = products.filter((p) => p.type === t.value).length;
              return (
                <div key={t.value}>
                  <div className="mb-1 flex justify-between text-[14px]"><span>{t.plural}</span><b>{n}</b></div>
                  <div className="h-2.5 overflow-hidden rounded bg-[#e9ecef]"><i className="block h-full bg-[#0d6efd] transition-all duration-700" style={{ width: `${(n / maxType) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Low stock</h3>{low.length > 0 && <span className="badge-danger">{low.length}</span>}</div>
          {low.length ? (
            <table className="table">
              <thead><tr><th>Product</th><th>Stock</th></tr></thead>
              <tbody>
                {low.map((p) => <tr key={p.id}><td>{p.name}</td><td><span className="badge-danger">{p.stock} left</span></td></tr>)}
              </tbody>
            </table>
          ) : <div className="card-body text-[#6c757d]">Everything is well stocked.</div>}
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header"><h3>Recent orders</h3><Link to="/admin/orders" className="btn-sm-primary">View all</Link></div>
        {orders.length ? (
          <div className="overflow-auto">
            <table className="table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id}>
                    <td><Link to="/admin/orders" className="text-[#0d6efd] hover:underline">{o.id}</Link></td>
                    <td>{o.customerName}</td>
                    <td>{o.items.length}</td>
                    <td className="num">{money(o.total)}</td>
                    <td><span className={STATUS_BADGE[o.status]}>{ORDER_STATUSES.find((s) => s.value === o.status)?.label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="card-body text-[#6c757d]">No orders yet. Place one from the shop to see it here.</div>}
      </div>
    </>
  );
}

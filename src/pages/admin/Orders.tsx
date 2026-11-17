import { useState } from 'react';
import { ordersApi } from '@/api/services';
import { errorMessage } from '@/api/client';
import { useAsync } from '@/hooks/useAsync';
import { toast } from '@/store/ui';
import { Loader } from '@/components/Loader';
import { PageHead } from '@/layouts/AdminLayout';
import { ORDER_STATUSES, money } from '@/data/constants';
import type { OrderStatus } from '@/types';

/** Badge colour for each order status (also used on the dashboard). */
export const STATUS_BADGE: Record<OrderStatus, string> = {
  NEW: 'badge-primary', PREPARING: 'badge-warning', OUT_FOR_DELIVERY: 'badge-info', DELIVERED: 'badge-success', CANCELLED: 'badge-secondary',
};

export default function Orders() {
  const { data, loading, error, reload, setData } = useAsync(() => ordersApi.list());
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const list = (data ?? []).filter((o) => filter === 'ALL' || o.status === filter);

  const change = async (id: string, status: OrderStatus) => {
    setData((d) => d?.map((o) => (o.id === id ? { ...o, status } : o)) ?? null);
    try { await ordersApi.updateStatus(id, status); toast(`Order ${id} marked ${ORDER_STATUSES.find((s) => s.value === status)?.label}`); }
    catch (e) { toast(errorMessage(e)); reload(); }
  };

  return (
    <>
      <PageHead title="Orders" />
      <div className="card">
        <div className="card-header">
          <h3>All orders</h3>
          <div className="flex gap-2">
            <select className="input !w-48 !py-1 !text-[14px]" value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | 'ALL')} aria-label="Filter by status">
              <option value="ALL">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button className="btn-light" onClick={reload}>Refresh</button>
          </div>
        </div>
        {loading && !data ? <Loader /> : error ? <p className="card-body text-danger">{error}</p> : (
          <div className="overflow-auto">
            <table className="table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Change status</th></tr></thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id}>
                    <td><b>{o.id}</b><br /><small className="text-[#6c757d]">{o.paymentMethod === 'CASH' ? 'Cash' : 'Card'}</small></td>
                    <td>{o.customerName}<br /><small className="text-[#6c757d]">{o.phone} · {o.address}</small></td>
                    <td>{o.items.map((i, k) => <div key={k}>{i.quantity} x {i.name}</div>)}</td>
                    <td className="num whitespace-nowrap">{money(o.total)}</td>
                    <td className="whitespace-nowrap">{new Date(o.createdAt).toLocaleString()}</td>
                    <td><span className={STATUS_BADGE[o.status]}>{ORDER_STATUSES.find((s) => s.value === o.status)?.label}</span></td>
                    <td>
                      <select value={o.status} onChange={(e) => change(o.id, e.target.value as OrderStatus)} aria-label={`Status of ${o.id}`} className="input !py-1 !text-[14px]">
                        {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {!list.length && <tr><td colSpan={7} className="!py-10 text-center text-[#6c757d]">No orders found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

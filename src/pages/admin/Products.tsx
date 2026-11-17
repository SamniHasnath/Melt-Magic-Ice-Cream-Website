import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '@/api/services';
import { errorMessage } from '@/api/client';
import { useAsync } from '@/hooks/useAsync';
import { useShop } from '@/store/shop';
import { toast } from '@/store/ui';
import { Loader } from '@/components/Loader';
import { Thumb } from '@/components/Thumb';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHead } from '@/layouts/AdminLayout';
import { ProductEditor } from './ProductEditor';
import { TYPES, flavourName, money, typeInfo } from '@/data/constants';
import type { CreateProductDto, IceCreamType, Product } from '@/types';

export default function Products() {
  const { data, loading, error, reload, setData } = useAsync(() => productsApi.listAll());
  const refreshShop = useShop((s) => s.loadProducts);
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [type, setType] = useState<IceCreamType | 'all'>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  /** Pre-filled values for a new product (used by "Duplicate"). */
  const [draft, setDraft] = useState<Product | null>(null);
  const openNew = (prefill: Product | null = null) => { setEditing(null); setDraft(prefill); setEditorOpen(true); };

  useEffect(() => { if (params.get('new')) { openNew(); setParams({}); } }, [params, setParams]);

  const list = useMemo(() => (data ?? [])
    .filter((p) => (type === 'all' || p.type === type) && p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder), [data, q, type]);

  const after = async (msg: string) => { toast(msg); await reload(); refreshShop(); };

  const save = async (dto: CreateProductDto) => {
    try {
      if (editing) await productsApi.update(editing.id, dto);
      else await productsApi.create({ ...dto, sortOrder: dto.sortOrder === 99 ? (data?.length ?? 0) + 1 : dto.sortOrder });
      setEditorOpen(false);
      await after(editing ? `Saved ${dto.name}` : `Added ${dto.name} to the shop`);
    } catch (e) { toast(errorMessage(e)); }
  };
  const toggle = async (p: Product) => {
    setData((d) => d?.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)) ?? null); // optimistic
    try { await productsApi.update(p.id, { active: !p.active }); await after(p.active ? 'Hidden from the shop' : 'Now visible on the shop'); }
    catch (e) { toast(errorMessage(e)); reload(); }
  };
  const remove = async () => {
    const p = deleting!;
    setDeleting(null); setEditorOpen(false);
    try { await productsApi.remove(p.id); await after(`Deleted ${p.name}`); } catch (e) { toast(errorMessage(e)); }
  };

  return (
    <>
      <PageHead title="Products">
        <button className="btn-dark" onClick={() => openNew()}>+ Add product</button>
      </PageHead>
      <div className="card">
        <div className="card-header">
          <h3>Product list</h3>
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="input !w-52 !py-1 !text-[14px]" aria-label="Search" />
            <select value={type} onChange={(e) => setType(e.target.value as IceCreamType | 'all')} className="input !w-36 !py-1 !text-[14px]" aria-label="Kind">
              <option value="all">All kinds</option>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        {loading && !data ? <Loader /> : error ? <p className="card-body text-danger">{error}</p> : (
          <div className="overflow-auto">
            <table className="table">
              <thead>
                <tr><th className="w-12">#</th><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {list.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td><div className="h-11 w-11 rounded border border-[#dee2e6] bg-[#f8f9fa]"><Thumb spec={p} alt="" className="h-full w-full object-contain" /></div></td>
                    <td>
                      {p.name}
                      {p.featured && <span className="badge-primary ml-1.5">Featured</span>}
                      {p.badge && <span className="badge-info ml-1.5">{p.badge}</span>}
                      <br /><small className="text-[#6c757d]">{p.flavours.map(flavourName).join(', ')}</small>
                    </td>
                    <td>{typeInfo(p.type).label}</td>
                    <td className="num whitespace-nowrap">{money(p.price)}</td>
                    <td>{p.stock < 10 ? <span className="badge-danger">{p.stock}</span> : p.stock}</td>
                    <td>
                      <label className="flex items-center gap-2 whitespace-nowrap">
                        <button role="switch" aria-checked={p.active} aria-label="Visible on shop" className="switch" onClick={() => toggle(p)} />
                        <span className={`text-[13px] ${p.active ? 'text-[#198754]' : 'text-[#6c757d]'}`}>{p.active ? 'Active' : 'Hidden'}</span>
                      </label>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex gap-1">
                        <button className="btn-sm-primary" onClick={() => { setEditing(p); setEditorOpen(true); }}>Edit</button>
                        <button className="btn-sm-secondary" onClick={() => openNew({ ...p, name: `${p.name} (copy)` })}>Copy</button>
                        <button className="btn-sm-danger" onClick={() => setDeleting(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!list.length && <tr><td colSpan={8} className="!py-10 text-center text-[#6c757d]">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {data && <div className="border-t border-[#dee2e6] px-4 py-2.5 text-[14px] text-[#6c757d]">Showing {list.length} of {data.length} products</div>}
      </div>
      <ProductEditor open={editorOpen} isEdit={!!editing} product={editing ?? draft} onClose={() => setEditorOpen(false)} onSave={save} onDelete={editing ? () => setDeleting(editing) : undefined} />
      <ConfirmDialog open={!!deleting} title={`Delete ${deleting?.name ?? ''}?`} text="It will disappear from the shop for everyone." onConfirm={remove} onCancel={() => setDeleting(null)} />
    </>
  );

}
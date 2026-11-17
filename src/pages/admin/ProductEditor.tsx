import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react';
import type { CreateProductDto, Product } from '@/types';
import { FLAVOURS, SAUCES, TOPPINGS, TYPES } from '@/data/constants';
import { CloseButton, Overlay } from '@/components/Overlay';

const ProductStage = lazy(() => import('@/three/IceCream').then((m) => ({ default: m.ProductStage })));

const EMPTY: CreateProductDto = {
  name: '', type: 'cone', flavours: ['#F7A1BE'], topping: 'sprinkles', sauce: 'none', cherry: true, wafer: false,
  price: 900, stock: 20, badge: null, description: '', featured: false, active: true, sortOrder: 99,
};

/** Create / edit drawer with a live 3D preview that rebuilds as you type. */
export function ProductEditor({ open, isEdit, product, onClose, onSave, onDelete }: {
  open: boolean; isEdit: boolean; product: Product | null; onClose: () => void;
  onSave: (dto: CreateProductDto) => Promise<void>; onDelete?: () => void;
}) {
  const [d, setD] = useState<CreateProductDto>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(EMPTY);
  useEffect(() => {
    if (!open) return;
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = (product ?? EMPTY) as Product;
    setD(rest); setPreview(rest);
  }, [open, product]);
  // Debounce so the 3D model doesn't rebuild on every keystroke.
  useEffect(() => { const t = setTimeout(() => setPreview(d), 140); return () => clearTimeout(t); }, [d]);

  const up = <K extends keyof CreateProductDto>(k: K, v: CreateProductDto[K]) => setD((s) => ({ ...s, [k]: v }));
  const setFlavour = (i: number, hex: string) => {
    const f = [...d.flavours];
    if (hex) f[i] = hex; else f.splice(i);
    up('flavours', f.filter(Boolean).length ? f.filter(Boolean) : ['#F7A1BE']);
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try { await onSave({ ...d, name: d.name.trim(), badge: d.badge?.trim() || null }); } finally { setBusy(false); }
  };

  return (
    <Overlay open={open} onClose={onClose} side="right" className="!w-[min(560px,100vw)] !border-[#dee2e6] !bg-white !backdrop-blur-none">
      <div className="relative h-[260px] flex-none border-b border-[#dee2e6] bg-[#f8f9fa]">
        {open && <Suspense fallback={null}><ProductStage spec={preview} zoom={false} className="absolute inset-0 cursor-grab" cameraZ={12} /></Suspense>}
        <CloseButton onClick={onClose} className="absolute right-4 top-4" />
        <span className="absolute bottom-3 left-4 rounded bg-[#6c757d] px-2 py-1 text-[12px] text-white">Preview</span>
      </div>
      <form id="product-form" onSubmit={submit} className="grid flex-1 content-start gap-4 overflow-auto p-6">
        <div><h3 className="text-[20px] font-semibold">{isEdit ? d.name || 'Edit product' : 'New product'}</h3></div>
        <label className="field">Name<input required minLength={2} maxLength={60} className="input" value={d.name} onChange={(e) => up('name', e.target.value)} placeholder="e.g. Pistachio Dream Cone" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="field">Kind
            <select className="input" value={d.type} onChange={(e) => up('type', e.target.value as CreateProductDto['type'])}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label className="field">Badge<input maxLength={24} className="input" value={d.badge ?? ''} onChange={(e) => up('badge', e.target.value)} placeholder="Bestseller, New…" /></label>
        </div>
        <div className="field">Flavours (bottom → top)
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <i className="h-6 w-6 flex-none rounded-full" style={{ background: d.flavours[i] ?? 'transparent', border: d.flavours[i] ? 0 : '1.5px dashed rgba(35,26,21,.2)' }} />
              <select className="input" value={d.flavours[i] ?? ''} disabled={i > d.flavours.length} onChange={(e) => setFlavour(i, e.target.value)} aria-label={`Flavour ${i + 1}`}>
                {i > 0 && <option value="">None</option>}
                {FLAVOURS.map((f) => <option key={f.hex} value={f.hex}>{f.name}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="field">Topping<select className="input capitalize" value={d.topping} onChange={(e) => up('topping', e.target.value as CreateProductDto['topping'])}>{TOPPINGS.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label className="field">Sauce<select className="input capitalize" value={d.sauce} onChange={(e) => up('sauce', e.target.value as CreateProductDto['sauce'])}>{SAUCES.map((t) => <option key={t}>{t}</option>)}</select></label>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-md border border-[#dee2e6] bg-[#f8f9fa] px-3 py-2.5 text-[13px] font-semibold">
          {(['cherry', 'wafer', 'featured', 'active'] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 capitalize">
              <input type="checkbox" checked={d[k]} onChange={(e) => up(k, e.target.checked)} className="h-4 w-4" />
              {k === 'active' ? 'Visible on shop' : k}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="field">Price (Rs)<input required type="number" min={0} step={10} className="input" value={d.price} onChange={(e) => up('price', Number(e.target.value))} /></label>
          <label className="field">Stock<input required type="number" min={0} step={1} className="input" value={d.stock} onChange={(e) => up('stock', Math.floor(Number(e.target.value)))} /></label>
          <label className="field">Sort order<input type="number" min={0} className="input" value={d.sortOrder} onChange={(e) => up('sortOrder', Number(e.target.value))} /></label>
        </div>
        <label className="field">Description<textarea rows={3} maxLength={240} className="input" value={d.description} onChange={(e) => up('description', e.target.value)} placeholder="What makes it special?" /></label>
      </form>
      <div className="flex justify-between gap-2 border-t border-[#dee2e6] bg-[#f8f9fa] px-6 py-3">
        {isEdit && onDelete ? <button className="btn-light !text-danger" onClick={onDelete}>Delete</button> : <span />}
        <div className="flex gap-2.5">
          <button className="btn-light" onClick={onClose}>Cancel</button>
          <button form="product-form" disabled={busy} className="btn-dark">{busy ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </Overlay>
  );
}
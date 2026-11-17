import { useEffect, useState, type FormEvent } from 'react';
import { productsApi, settingsApi } from '@/api/services';
import { errorMessage, USE_MOCK } from '@/api/client';
import { mock } from '@/api/mock';
import { useAsync } from '@/hooks/useAsync';
import { useShop } from '@/store/shop';
import { toast } from '@/store/ui';
import { applyAccent } from '@/hooks/useAccent';
import { Loader } from '@/components/Loader';
import { PageHead } from '@/layouts/AdminLayout';
import { ACCENTS } from '@/data/constants';
import type { Settings } from '@/types';

export default function SettingsPage() {
  const { data, loading } = useAsync(() => Promise.all([settingsApi.get(), productsApi.listAll()]));
  const { loadSettings, loadProducts } = useShop();
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) setS(data[0]); }, [data]);
  useEffect(() => () => applyAccent(useShop.getState().settings.accent), []); // undo unsaved colour preview

  if (loading || !s || !data) return <Loader />;
  const up = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try { await settingsApi.update(s); await loadSettings(); toast('Settings saved'); }
    catch (err) { toast(errorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHead title="Settings" />
      <form onSubmit={save} className="card max-w-3xl">
        <div className="card-header"><h3>Website settings</h3></div>
        <div className="card-body grid gap-5">
          <label className="field">Announcement bar
            <input className="input" maxLength={240} value={s.announcement} onChange={(e) => up('announcement', e.target.value)} />
            <span className="form-text">Separate messages with ·</span>
          </label>
          <label className="field">Hero headline
            <input className="input" maxLength={80} placeholder="Hand-churned|at dawn." value={s.heroLine} onChange={(e) => up('heroLine', e.target.value)} />
            <span className="form-text">Use | for a line break. Leave empty for the default.</span>
          </label>
          <label className="field">Featured product
            <select className="input" value={s.featuredProductId ?? ''} onChange={(e) => up('featuredProductId', e.target.value || null)}>
              <option value="">Auto (first featured)</option>
              {data[1].map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span className="form-text">Shown on the home page hero card.</span>
          </label>
          <div className="field">Theme colour
            <div className="flex flex-wrap gap-4">
              {ACCENTS.map((a) => (
                <label key={a.color} className="flex cursor-pointer items-center gap-2 font-normal">
                  <input type="radio" name="accent" checked={s.accent === a.color} onChange={() => { up('accent', a.color); applyAccent(a.color); }} />
                  <span className="h-4 w-4 rounded-sm border border-black/10" style={{ background: a.color }} />{a.name}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 font-normal">
            <input type="checkbox" className="h-4 w-4" checked={s.isOpen} onChange={(e) => up('isOpen', e.target.checked)} />
            Shop is open for orders
          </label>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-[#dee2e6] bg-[#f8f9fa] px-4 py-3">
          <button disabled={busy} className="btn-dark">{busy ? 'Saving...' : 'Save changes'}</button>
          {USE_MOCK && (
            <button type="button" className="btn-light" onClick={async () => { mock.reset(); await Promise.all([loadSettings(), loadProducts()]); toast('Mock data reset to the starter menu'); location.reload(); }}>
              Reset demo data
            </button>
          )}
        </div>
      </form>
    </>
  );
}

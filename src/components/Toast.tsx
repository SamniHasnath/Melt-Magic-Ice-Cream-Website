import { useEffect, useState } from 'react';
import { useUi } from '@/store/ui';

export function Toast() {
  const t = useUi((s) => s.toast);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!t) return;
    setShow(true);
    const id = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(id);
  }, [t]);
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-7 left-1/2 z-[200] max-w-[90vw] -translate-x-1/2 rounded-full bg-ink px-6 py-3.5 shadow-soft text-center text-sm font-semibold text-white transition-all duration-500 ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      {t?.message}
    </div>
  );
}
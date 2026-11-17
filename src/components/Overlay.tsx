import { useEffect, type ReactNode } from 'react';

/** Scrim + panel. `side="right"` slides in a drawer, otherwise a centred modal. */
export function Overlay({ open, onClose, children, side, className = '' }: {
  open: boolean; onClose: () => void; children: ReactNode; side?: 'right'; className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  const panel = side === 'right'
    ? `fixed inset-y-0 right-0 z-[90] flex w-[min(460px,100vw)] flex-col border-l border-white/70 bg-white/60 backdrop-blur-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? 'translate-x-0' : 'translate-x-[105%]'}`
    : `fixed left-1/2 top-1/2 z-[90] max-h-[92vh] w-[min(1040px,94vw)] overflow-auto rounded-[36px] border border-white/70 bg-white/60 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? '-translate-x-1/2 -translate-y-1/2 opacity-100' : 'pointer-events-none -translate-x-1/2 -translate-y-[46%] scale-95 opacity-0'}`;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[80] bg-ink/30 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden
      />
      <div role="dialog" aria-modal="true" aria-hidden={!open} className={`${panel} ${className}`}>
        {children}
      </div>
    </>
  );
}

export function CloseButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} aria-label="Close" className={`grid h-11 w-11 place-items-center rounded-full bg-white text-lg shadow-md transition hover:rotate-90 ${className}`}>
      ✕
    </button>
  );
}
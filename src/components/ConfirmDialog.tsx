export function ConfirmDialog({ open, title, text, confirmLabel = 'Delete', onConfirm, onCancel }: {
  open: boolean; title: string; text: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <>
      <div onClick={onCancel} className={`fixed inset-0 z-[110] bg-ink/45 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <div role="alertdialog" aria-hidden={!open} className={`fixed left-1/2 top-1/2 z-[120] w-[min(400px,92vw)] -translate-x-1/2 -translate-y-1/2 glass !rounded-[26px] p-7 transition-all ${open ? 'opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}>
        <h4 className="mb-2 font-serif text-[24px] leading-tight">{title}</h4>
        <p className="mb-5 text-ink/60">{text}</p>
        <div className="flex justify-end gap-2.5">
          <button className="btn-light" onClick={onCancel}>Cancel</button>
          <button className="btn-accent" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </>
  );
}
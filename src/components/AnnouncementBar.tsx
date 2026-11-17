import { useShop } from '@/store/shop';

export function AnnouncementBar() {
  const { announcement, isOpen } = useShop((s) => s.settings);
  const parts = announcement.split('·').map((s) => s.trim()).filter(Boolean);
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] flex h-[34px] items-center justify-center gap-6 overflow-hidden whitespace-nowrap bg-ink px-4 font-mono text-[12px] text-paper">
        {parts.map((p, i) => (
          <span key={i} className={i > 0 ? 'hidden md:inline' : ''}>{i > 0 && <span className="mr-6 text-accent">✱</span>}{p}</span>
        ))}
      </div>
      {!isOpen && (
        <div className="fixed left-1/2 top-24 z-[54] -translate-x-1/2 rounded-full bg-danger px-5 py-2.5 text-[13px] font-bold text-white shadow-card">
          We're closed right now. Ordering is paused
        </div>
      )}
    </>
  );
}
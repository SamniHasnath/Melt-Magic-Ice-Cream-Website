export function Loader({ full = false }: { full?: boolean }) {
  return (
    <div className={full ? 'grid min-h-screen place-items-center bg-cream' : 'grid place-items-center py-16'}>
      <div
        className="h-14 w-14 animate-spin rounded-full"
        style={{
          background: 'conic-gradient(rgb(var(--accent)), #FFC857, #B8F0DC, rgb(var(--accent)))',
          WebkitMask: 'radial-gradient(circle, transparent 55%, #000 56%)',
          mask: 'radial-gradient(circle, transparent 55%, #000 56%)',
        }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
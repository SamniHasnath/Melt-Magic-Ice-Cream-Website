import { useEffect } from 'react';

/** Fades in every `.reveal` element as it scrolls into view. Re-scans when deps change. */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
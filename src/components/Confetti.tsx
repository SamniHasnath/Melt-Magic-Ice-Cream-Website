import { useEffect, useState } from 'react';
import { useUi } from '@/store/ui';

export const SPRINKLES = ['#FF4F8B', '#FFD23F', '#6FE3C1', '#8FD3FF', '#B48AD6', '#E8457A'];

/** Sprinkle confetti, fired with useUi.getState().confetti(). */
export function Confetti() {
  const at = useUi((s) => s.confettiAt);
  const [bits, setBits] = useState<{ id: string; left: number; color: string; delay: number; rot: number }[]>([]);
  useEffect(() => {
    if (!at) return;
    setBits(Array.from({ length: 70 }, (_, i) => ({ id: `${at}-${i}`, left: Math.random() * 100, color: SPRINKLES[i % SPRINKLES.length], delay: Math.random() * 0.5, rot: Math.random() * 360 })));
    const t = setTimeout(() => setBits([]), 2600);
    return () => clearTimeout(t);
  }, [at]);
  return (
    <div className="pointer-events-none fixed inset-0 z-[150] overflow-hidden" aria-hidden>
      {bits.map((b) => (
        <i key={b.id} className="absolute -top-5 block h-[22px] w-2 animate-fall rounded" style={{ left: `${b.left}vw`, background: b.color, animationDelay: `${b.delay}s`, transform: `rotate(${b.rot}deg)` }} />
      ))}
    </div>
  );
}
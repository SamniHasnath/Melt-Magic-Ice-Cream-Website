import { ACCENTS } from '@/data/constants';

const triplet = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** Pushes the admin-chosen brand colour into the CSS variables Tailwind reads. */
export function applyAccent(color: string) {
  const a = ACCENTS.find((x) => x.color.toLowerCase() === color.toLowerCase()) ?? ACCENTS[0];
  document.documentElement.style.setProperty('--accent', triplet(a.color));
  document.documentElement.style.setProperty('--accent-soft', triplet(a.soft));
}
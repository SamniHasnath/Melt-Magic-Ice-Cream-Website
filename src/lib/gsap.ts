import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** True when the visitor asked the OS for less motion. Melt effects then show their end state. */
export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Maps v from [a, b] onto [0, 1], clamped. */
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export { gsap, ScrollTrigger };

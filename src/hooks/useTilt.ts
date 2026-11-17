import type { PointerEvent } from 'react';

/** 3D hover tilt + moving glare for cards. Spread the returned handlers onto the element. */
export function tiltHandlers(max = 10) {
  return {
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return;
      const el = e.currentTarget, r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateY(${(x - 0.5) * max}deg) rotateX(${(0.5 - y) * max}deg) translateY(-6px)`;
      el.style.setProperty('--gx', `${x * 100}%`);
      el.style.setProperty('--gy', `${y * 100}%`);
    },
    onPointerLeave: (e: PointerEvent<HTMLElement>) => { e.currentTarget.style.transform = ''; },
  };
}
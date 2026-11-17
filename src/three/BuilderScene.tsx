import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Sauce, Topping } from '@/types';
import { StudioLights } from './IceCream';
import { disposeObject, makeCherry, makeCone, makeCup, makeScoop, makeWafer } from './builders';

export interface BuildState {
  base: 'cone' | 'cup';
  scoops: string[];
  topping: Topping;
  sauce: Sauce;
  cherry: boolean;
  wafer: boolean;
}

interface Body { obj: THREE.Object3D; target: number; vy: number; s: number }

/**
 * Live builder: every new scoop / cherry / wafer falls from above and lands
 * with a squash-and-stretch spring. Unchanged parts keep their position.
 */
function Stack({ b }: { b: BuildState }) {
  const group = useMemo(() => new THREE.Group(), []);
  const bodies = useRef<Record<string, Body>>({});
  const prev = useRef<BuildState | null>(null);

  useEffect(() => {
    const before = prev.current;
    const oldY: Record<string, number> = {};
    for (const k in bodies.current) oldY[k] = bodies.current[k].obj.position.y;
    group.children.slice().forEach((c) => { group.remove(c); disposeObject(c); });
    bodies.current = {};

    group.add(b.base === 'cone' ? makeCone() : makeCup());
    let y = b.base === 'cone' ? 0.62 : 0.38, prevR = 0;
    b.scoops.forEach((c, i) => {
      const r = 1 - i * 0.1, last = i === b.scoops.length - 1;
      const s = makeScoop(c, { topping: last ? b.topping : 'none', sauce: last ? b.sauce : 'none', seed: i + 31 });
      y += i === 0 ? 0 : prevR * 0.68 + r * 0.78;
      const key = `s${i}${c}`;
      const isNew = !before || before.scoops[i] !== c;
      s.position.y = isNew ? y + 5 : oldY[key] ?? y;
      s.rotation.y = i * 1.3;
      s.scale.setScalar(r);
      group.add(s);
      bodies.current[key] = { obj: s, target: y, vy: 0, s: r };
      prevR = r;
    });
    if (b.scoops.length) {
      const top = y + prevR * 0.96;
      const stackChanged = !before || before.scoops.length !== b.scoops.length;
      if (b.cherry) {
        const c = makeCherry(), t = top + 0.12;
        c.position.y = !before?.cherry || stackChanged ? t + 4 : oldY.cherry ?? t;
        group.add(c); bodies.current.cherry = { obj: c, target: t, vy: 0, s: 1 };
      }
      if (b.wafer) {
        const w = makeWafer(), t = y + 0.55 * prevR;
        w.rotation.set(0.3, 0, -0.5);
        w.position.set(0.45 * prevR, !before?.wafer ? t + 4 : oldY.wafer ?? t, -0.25);
        group.add(w); bodies.current.wafer = { obj: w, target: t, vy: 0, s: 1 };
      }
    }
    prev.current = { ...b, scoops: [...b.scoops] };
  }, [b, group]);

  useFrame(() => {
    for (const k in bodies.current) {
      const o = bodies.current[k];
      o.vy += (o.target - o.obj.position.y) * 0.12;
      o.vy *= 0.74;
      o.obj.position.y += o.vy;
      const sq = Math.max(-0.25, Math.min(0.25, o.vy * 0.6));
      o.obj.scale.set(o.s * (1 - sq * 0.5), o.s * (1 + sq), o.s * (1 - sq * 0.5));
    }
  });

  return <primitive object={group} position={[0, -0.6, 0]} scale={0.8} />;
}

export default function BuilderScene({ build }: { build: BuildState }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.8, 11.5], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <StudioLights />
      <Stack b={build} />
      <ContactShadows position={[0, -2.75, 0]} opacity={0.4} scale={7} blur={2.6} far={3} />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.2} minPolarAngle={0.9} maxPolarAngle={1.8} />
    </Canvas>
  );
}
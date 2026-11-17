import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import type { ModelSpec } from '@/types';
import { buildModel, disposeObject, specKey } from './builders';

export function StudioLights() {
  return (
    <>
      <hemisphereLight args={[0xffffff, 0xf3c2d2, 1.1]} />
      <directionalLight position={[3, 6, 5]} intensity={1.7} />
      <directionalLight position={[-5, 2, 3]} intensity={0.7} color="#FFE6EE" />
      <directionalLight position={[0, 3, -6]} intensity={1.1} />
      <ambientLight intensity={0.2} />
    </>
  );
}

/** Any product as a live 3D object. Rebuilds only when the spec really changes. */
export function IceCream({ spec, spin = 0 }: { spec: Partial<ModelSpec>; spin?: number }) {
  const key = specKey(spec);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const object = useMemo(() => buildModel(spec), [key]);
  useEffect(() => () => disposeObject(object), [object]);
  const ref = useRef<Group>(null);
  useFrame((_, dt) => { if (ref.current && spin) ref.current.rotation.y += dt * spin; });
  return (
    <group ref={ref}>
      <primitive object={object} />
    </group>
  );
}

/** Drop-in 3D viewer: drag to rotate, scroll to zoom, auto-spins. */
export function ProductStage({ spec, zoom = true, className = '', autoRotate = true, cameraZ = 10.5 }: {
  spec: Partial<ModelSpec>; zoom?: boolean; className?: string; autoRotate?: boolean; cameraZ?: number;
}) {
  return (
    <div className={className}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0.6, cameraZ], fov: 30 }} gl={{ antialias: true, alpha: true }}>
        <StudioLights />
        <IceCream spec={spec} />
        <ContactShadows position={[0, -2.05, 0]} opacity={0.45} scale={7} blur={2.6} far={3} />
        <OrbitControls enablePan={false} enableZoom={zoom} autoRotate={autoRotate} autoRotateSpeed={1.6} minDistance={6} maxDistance={16} minPolarAngle={0.6} maxPolarAngle={1.9} />
      </Canvas>
    </div>
  );
}
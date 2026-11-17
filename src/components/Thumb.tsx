import { useMemo } from 'react';
import type { ModelSpec } from '@/types';
import { specKey } from '@/three/builders';
import { thumbnail } from '@/three/thumbnails';

/** A still image rendered from the real 3D model (falls back to a coloured ball without WebGL). */
export function Thumb({ spec, alt, className = '' }: { spec: Partial<ModelSpec>; alt: string; className?: string }) {
  const key = specKey(spec);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const url = useMemo(() => thumbnail(spec), [key]);
  if (!url)
    return <div className={`mx-auto aspect-square w-3/5 rounded-full ${className}`} style={{ background: spec.flavours?.[0] ?? '#F7A1BE' }} aria-label={alt} />;
  return <img src={url} alt={alt} className={className} draggable={false} />;
}
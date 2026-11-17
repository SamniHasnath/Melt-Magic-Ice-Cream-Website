import * as THREE from 'three';
import type { ModelSpec } from '@/types';
import { addStudioLights, buildModel, disposeObject, specKey } from './builders';

/**
 * Renders product thumbnails from the real 3D models with ONE hidden WebGL
 * renderer, so a grid of 30 products costs one GPU context instead of 30.
 */
const cache = new Map<string, string>();
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let failed = false;

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(42,21,18,.4)'); gr.addColorStop(1, 'rgba(42,21,18,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function setup() {
  if (renderer || failed) return;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(420, 420);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    scene = new THREE.Scene();
    addStudioLights(scene);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -2.05;
    scene.add(shadow);
    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 1.2, 10.2);
    camera.lookAt(0, -0.1, 0);
  } catch {
    failed = true;
  }
}

/** Returns a PNG data URL, or '' if WebGL is unavailable. */
export function thumbnail(spec: Partial<ModelSpec>): string {
  const key = specKey(spec);
  const hit = cache.get(key);
  if (hit) return hit;
  setup();
  if (!renderer) return '';
  const model = buildModel(spec);
  model.rotation.y = 0.5;
  scene.add(model);
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  scene.remove(model);
  disposeObject(model);
  cache.set(key, url);
  return url;
}
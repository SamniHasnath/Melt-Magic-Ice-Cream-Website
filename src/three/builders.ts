/**
 * Procedural 3D ice cream builders (plain Three.js).
 * Every treat on the site, in every kind, is generated from a ModelSpec here,
 * so admins can create new products without any 3D files.
 */
import * as THREE from 'three';
import type { ModelSpec, Sauce, Topping } from '@/types';
import { SAUCE_COLORS } from '@/data/constants';

export const TAU = Math.PI * 2;

/** Small seeded random generator so sprinkles land in the same place every render. */
export function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- textures (drawn on canvas, cached) ---------- */
const TEX = new Map<string, THREE.Texture>();
function canvasTex(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const hit = TEX.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  TEX.set(key, t);
  return t;
}
export const waffleTex = () => {
  const t = canvasTex('waffle', 512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#F4BC72'); gr.addColorStop(1, '#CB843A');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.lineWidth = 16; g.strokeStyle = 'rgba(118,58,14,.5)';
    for (let i = -w; i < 2 * w; i += 64) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke();
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i - h, h); g.stroke();
    }
    g.lineWidth = 4; g.strokeStyle = 'rgba(255,232,190,.4)';
    for (let i = -w; i < 2 * w; i += 64) { g.beginPath(); g.moveTo(i + 8, 0); g.lineTo(i + h + 8, h); g.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 1.4);
  return t;
};
const stripeTex = (c1: string) => {
  const t = canvasTex('stripe' + c1, 512, 256, (g, w, h) => {
    g.fillStyle = '#FFF8F3'; g.fillRect(0, 0, w, h);
    g.fillStyle = c1;
    for (let i = 0; i < 20; i++) if (i % 2) g.fillRect((i * w) / 20, 0, w / 20, h);
    g.fillRect(0, h * 0.8, w, h * 0.2);
    g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(0, h * 0.8, w, 5);
  });
  t.wrapS = THREE.RepeatWrapping;
  return t;
};
const cookieTex = () =>
  canvasTex('cookie', 256, 256, (g, w, h) => {
    g.fillStyle = '#4A2614'; g.fillRect(0, 0, w, h);
    const r = rng(7);
    for (let i = 0; i < 70; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(30,12,4,.6)' : 'rgba(120,70,40,.5)';
      g.beginPath(); g.arc(r() * w, r() * h, 2 + r() * 6, 0, TAU); g.fill();
    }
  });

/* ---------- materials ---------- */
export const creamMat = (c: string) =>
  new THREE.MeshPhysicalMaterial({ color: new THREE.Color(c), roughness: 0.5, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.45 });
const glossyMat = (c: string) =>
  new THREE.MeshPhysicalMaterial({ color: new THREE.Color(c), roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.15 });
const glassMat = () =>
  new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.26, roughness: 0.05, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });

/* ---------- scoop ---------- */
let scoopGeometry: THREE.SphereGeometry | null = null;
/** A sphere with a creamy, wobbly surface and the ridged "scoop lip" at the bottom. */
export function scoopGeo() {
  if (scoopGeometry) return scoopGeometry;
  const g = new THREE.SphereGeometry(1, 96, 72);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 5.1 + 1.7) * Math.sin(v.y * 4.3 + 0.6) * Math.sin(v.z * 5.7 + 2.1) * 0.035 + Math.sin(v.x * 11 + v.z * 9) * 0.01;
    let r = 1 + n;
    let y = v.y;
    if (y < -0.35) {
      const a = Math.atan2(v.z, v.x);
      const lip = (-0.35 - y) / 0.65;
      r += Math.sin(a * 14) * 0.055 * lip + 0.1 * lip;
      y = -0.35 + (y + 0.35) * 0.5;
    }
    p.setXYZ(i, v.x * r, y * (v.y < -0.35 ? 1 : r) * 0.96, v.z * r);
  }
  g.computeVertexNormals();
  scoopGeometry = g;
  return g;
}

const SPRINKLE_COLORS = ['#FF4F8B', '#FFD23F', '#6FE3C1', '#8FD3FF', '#FFFFFF', '#B48AD6'];
function pointOnSphere(r: () => number, minY: number) {
  const d = new THREE.Vector3();
  do d.set(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
  while (d.lengthSq() > 1 || d.lengthSq() < 0.02);
  d.normalize();
  if (d.y < minY) { d.y = minY + r() * (1 - minY); d.normalize(); }
  return d;
}
/** Instanced toppings scattered over a sphere: one draw call for all of them. */
export function scatter(kind: Exclude<Topping, 'none'>, count: number, radius: number, seed: number, minY = 0.05) {
  const r = rng(seed);
  let geo: THREE.BufferGeometry;
  let mat: THREE.MeshStandardMaterial;
  if (kind === 'sprinkles') { geo = new THREE.CylinderGeometry(0.028, 0.028, 0.17, 6); mat = new THREE.MeshStandardMaterial({ roughness: 0.35 }); }
  else if (kind === 'chips') { geo = new THREE.DodecahedronGeometry(0.075); mat = new THREE.MeshStandardMaterial({ color: '#2E140A', roughness: 0.5 }); }
  else { geo = new THREE.BoxGeometry(0.12, 0.07, 0.09); mat = new THREE.MeshStandardMaterial({ color: '#C99A5B', roughness: 0.7 }); }
  const im = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), c = new THREE.Color(), t = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const d = pointOnSphere(r, minY);
    t.set(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).cross(d).normalize();
    q.setFromUnitVectors(up, t);
    const s = kind === 'sprinkles' ? 1 : 0.7 + r() * 0.6;
    m.compose(d.clone().multiplyScalar(radius * (kind === 'sprinkles' ? 1.01 : 0.99)), q, new THREE.Vector3(s, s, s));
    im.setMatrixAt(i, m);
    if (kind === 'sprinkles') im.setColorAt(i, c.set(SPRINKLE_COLORS[i % SPRINKLE_COLORS.length]));
  }
  im.instanceMatrix.needsUpdate = true;
  return im;
}

function sauceCap(color: string, seed: number) {
  const g = new THREE.Group();
  const mat = glossyMat(color);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1.035, 64, 24, 0, TAU, 0, 0.85), mat));
  const r = rng(seed), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + r() * 0.4, th = 0.95 + r() * 0.25;
    const d = new THREE.Vector3(Math.sin(th) * Math.cos(a), Math.cos(th), Math.sin(th) * Math.sin(a));
    const drip = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), mat);
    drip.scale.set(0.075, 0.12 + r() * 0.16, 0.075);
    drip.position.copy(d.multiplyScalar(1.03));
    drip.quaternion.setFromUnitVectors(up, new THREE.Vector3(Math.cos(th) * Math.cos(a), -Math.sin(th), Math.cos(th) * Math.sin(a)));
    g.add(drip);
  }
  return g;
}

export function makeScoop(color: string, opts: { topping?: Topping; sauce?: Sauce; seed?: number } = {}) {
  const { topping = 'none', sauce = 'none', seed = 1 } = opts;
  const g = new THREE.Group();
  const ball = new THREE.Mesh(scoopGeo(), creamMat(color));
  ball.name = 'ball';
  g.add(ball);
  const sc = SAUCE_COLORS[sauce];
  if (sc) g.add(sauceCap(sc, seed + 3));
  if (topping === 'sprinkles') g.add(scatter('sprinkles', 46, sc ? 1.04 : 1, seed, 0.12));
  if (topping === 'chips') g.add(scatter('chips', 30, 1, seed, -0.35));
  if (topping === 'nuts') g.add(scatter('nuts', 26, sc ? 1.04 : 1, seed, 0.25));
  return g;
}

/* ---------- parts ---------- */
export function makeCherry() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 24), glossyMat('#D8102E'));
  b.scale.set(1, 0.92, 1);
  g.add(b);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.16, 0), new THREE.Vector3(0.04, 0.4, 0), new THREE.Vector3(0.2, 0.6, 0.02)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.022, 6), new THREE.MeshStandardMaterial({ color: '#4E7A2A', roughness: 0.6 })));
  return g;
}
export const makeWafer = () =>
  new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.2, 20), new THREE.MeshStandardMaterial({ map: waffleTex(), color: '#FFE0B0', roughness: 0.7 }));

/** Waffle cone, rim at y = 0, tip at y = -2.6. */
export function makeCone() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.88, 2.6, 56, 1, true), new THREE.MeshStandardMaterial({ map: waffleTex(), roughness: 0.75, side: THREE.DoubleSide }));
  body.rotation.x = Math.PI; body.position.y = -1.3;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.11, 16, 64), new THREE.MeshStandardMaterial({ map: waffleTex(), color: '#FFE2B6', roughness: 0.7 }));
  rim.rotation.x = Math.PI / 2;
  g.add(body, rim);
  return g;
}
/** Striped paper cup, rim at y = 0, base at y = -1.45. */
export function makeCup(color = '#EF5C8E') {
  const g = new THREE.Group(), h = 1.45;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 0.82, h, 64, 1, true), new THREE.MeshStandardMaterial({ map: stripeTex(color), roughness: 0.5, side: THREE.DoubleSide }));
  body.position.y = -h / 2;
  const base = new THREE.Mesh(new THREE.CircleGeometry(0.82, 48), new THREE.MeshStandardMaterial({ color }));
  base.rotation.x = Math.PI / 2; base.position.y = -h;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.06, 12, 72), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.35 }));
  rim.rotation.x = Math.PI / 2;
  g.add(body, base, rim);
  return g;
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x, y + r); s.lineTo(x, y + h - r); s.quadraticCurveTo(x, y + h, x + r, y + h);
  s.lineTo(x + w - r, y + h); s.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
  s.lineTo(x + w, y + r); s.quadraticCurveTo(x + w, y, x + w - r, y);
  s.lineTo(x + r, y); s.quadraticCurveTo(x, y, x, y + r);
  return s;
}
function flatScatter(kind: Exclude<Topping, 'none'>, count: number, w: number, h: number, z: number, cy: number, seed: number) {
  const r = rng(seed), g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    let m: THREE.Mesh;
    if (kind === 'sprinkles') {
      m = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.17, 6), new THREE.MeshStandardMaterial({ color: SPRINKLE_COLORS[i % 6], roughness: 0.35 }));
      m.rotation.z = r() * TAU;
    } else {
      m = new THREE.Mesh(kind === 'chips' ? new THREE.DodecahedronGeometry(0.07) : new THREE.BoxGeometry(0.11, 0.07, 0.06), new THREE.MeshStandardMaterial({ color: kind === 'chips' ? '#2E140A' : '#C99A5B' }));
      m.rotation.set(r() * 3, r() * 3, r() * 3);
    }
    m.position.set((r() - 0.5) * w, cy + (r() - 0.5) * h, z * (r() < 0.5 ? 1 : -1));
    g.add(m);
  }
  return g;
}

function makeWhip() {
  const g = new THREE.Group(), m = creamMat('#FFFDF8');
  ([[0.62, 0.22, 0], [0.48, 0.19, 0.3], [0.34, 0.16, 0.55], [0.2, 0.12, 0.75]] as const).forEach(([r, t, y], i) => {
    const o = new THREE.Mesh(new THREE.TorusGeometry(r, t, 18, 48), m);
    o.rotation.x = Math.PI / 2; o.rotation.z = i * 0.8; o.position.y = y;
    g.add(o);
  });
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.38, 24), m);
  tip.position.y = 0.98;
  g.add(tip);
  return g;
}

/* ---------- the six kinds ---------- */
function stackScoops(g: THREE.Group, spec: ModelSpec, baseY: number) {
  let y = baseY, prevR = 0;
  spec.flavours.forEach((f, i) => {
    const r = 1 - i * 0.1, last = i === spec.flavours.length - 1;
    const s = makeScoop(f, { topping: last ? spec.topping : 'none', sauce: last ? spec.sauce : 'none', seed: i + 11 });
    s.scale.setScalar(r);
    y += i === 0 ? 0 : prevR * 0.68 + r * 0.78;
    s.position.y = y; s.rotation.y = i * 1.3;
    g.add(s);
    prevR = r;
  });
  return { top: y + prevR * 0.96, y, r: prevR };
}
function makeStick(spec: ModelSpec) {
  const g = new THREE.Group(), fl = spec.flavours;
  const ex = { depth: 0.42, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.12, bevelSegments: 6, curveSegments: 24 };
  const bg = new THREE.ExtrudeGeometry(roundedRect(1.3, 2.3, 0.6), ex); bg.center();
  g.add(new THREE.Mesh(bg, creamMat(fl[0])));
  if (fl[1]) {
    const dg = new THREE.ExtrudeGeometry(roundedRect(1.38, 1.35, 0.62), { ...ex, depth: 0.48 }); dg.center();
    const dip = new THREE.Mesh(dg, glossyMat(fl[1])); dip.position.y = 0.5; g.add(dip);
    if (spec.topping !== 'none') g.add(flatScatter(spec.topping, spec.topping === 'sprinkles' ? 40 : 22, 1.1, 1.1, 0.39, 0.5, 5));
  } else if (spec.topping !== 'none') g.add(flatScatter(spec.topping, 30, 1.1, 1.9, 0.36, 0, 5));
  const sg = new THREE.ExtrudeGeometry(roundedRect(0.34, 1.5, 0.16), { depth: 0.07, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 }); sg.center();
  const stick = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: '#E2B77E', roughness: 0.8 })); stick.position.y = -1.65;
  g.add(stick);
  g.rotation.z = -0.12;
  return g;
}
function makeSundae(spec: ModelSpec) {
  const g = new THREE.Group();
  const pts = ([[0.75, -1.95], [0.8, -1.88], [0.22, -1.82], [0.11, -1.6], [0.11, -1.05], [0.28, -0.95], [0.78, -0.75], [1.18, -0.4], [1.4, 0.05], [1.44, 0.12]] as const).map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 72), glassMat()));
  const pos: [number, number, number][] = [[-0.48, -0.05, 0.18], [0.48, -0.05, 0.15], [0, 0.12, -0.38]];
  spec.flavours.slice(0, 3).forEach((f, i) => { const s = makeScoop(f, { seed: i + 2 }); s.scale.setScalar(0.62); s.position.set(...pos[i]); g.add(s); });
  const w = makeWhip(); w.scale.setScalar(0.85); w.position.y = 0.55; g.add(w);
  const sc = SAUCE_COLORS[spec.sauce];
  if (sc) { const cap = sauceCap(sc, 9); cap.scale.setScalar(0.52); cap.position.y = 0.62; g.add(cap); }
  if (spec.topping !== 'none') { const s = scatter(spec.topping, 28, 0.62, 4, 0.2); s.position.y = 0.55; g.add(s); }
  if (spec.cherry) { const c = makeCherry(); c.position.y = 1.5; g.add(c); }
  return g;
}
function makeShake(spec: ModelSpec) {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.72, 2.8, 64, 1, true), glassMat()); glass.position.y = -0.65;
  const milk = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.68, 2.35, 64), creamMat(spec.flavours[0])); milk.position.y = -0.85;
  g.add(glass, milk);
  const sc = SAUCE_COLORS[spec.sauce];
  if (sc) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.05, 8, 64), glossyMat(sc)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.3; g.add(ring); }
  const w = makeWhip(); w.scale.setScalar(1.25); w.position.y = 0.4; g.add(w);
  const straw = new THREE.CatmullRomCurve3([new THREE.Vector3(0.25, -1.2, 0.1), new THREE.Vector3(0.38, 1.1, 0.1), new THREE.Vector3(0.5, 1.65, 0.1), new THREE.Vector3(1.05, 2, 0.1)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(straw, 40, 0.07, 12), new THREE.MeshStandardMaterial({ color: '#FF5A8A', roughness: 0.4 })));
  if (spec.topping !== 'none') { const s = scatter(spec.topping, 30, 0.8, 6, 0.15); s.scale.y = 0.9; s.position.y = 0.55; g.add(s); }
  if (spec.cherry) { const c = makeCherry(); c.position.y = 1.85; g.add(c); }
  return g;
}
function makeSandwich(spec: ModelSpec) {
  const g = new THREE.Group(), cm = new THREE.MeshStandardMaterial({ map: cookieTex(), roughness: 0.85 });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.3, 64), cm); top.position.y = 0.52;
  const bottom = top.clone(); bottom.position.y = -0.52;
  const fill = new THREE.Mesh(new THREE.CylinderGeometry(1.04, 1.04, 0.74, 64), creamMat(spec.flavours[0]));
  g.add(top, bottom, fill);
  if (spec.topping !== 'none') {
    const r = rng(3);
    for (let i = 0; i < 44; i++) {
      const a = r() * TAU, y = (r() - 0.5) * 0.6;
      const m = spec.topping === 'sprinkles'
        ? new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.17, 6), new THREE.MeshStandardMaterial({ color: SPRINKLE_COLORS[i % 6] }))
        : new THREE.Mesh(new THREE.DodecahedronGeometry(0.07), new THREE.MeshStandardMaterial({ color: spec.topping === 'chips' ? '#2E140A' : '#C99A5B' }));
      m.rotation.set(r() * 3, r() * 3, r() * 3);
      m.position.set(Math.cos(a) * 1.05, y, Math.sin(a) * 1.05);
      g.add(m);
    }
  }
  g.rotation.set(0.5, 0, 0.12);
  return g;
}

/** Scale and centre any object so it fits a box of height H. */
export function fit(obj: THREE.Object3D, H = 3.9) {
  const box = new THREE.Box3().setFromObject(obj), size = new THREE.Vector3(), centre = new THREE.Vector3();
  box.getSize(size); box.getCenter(centre);
  const k = H / Math.max(size.y, size.x * 1.05, size.z * 1.05);
  obj.position.sub(centre);
  const wrap = new THREE.Group();
  wrap.add(obj);
  wrap.scale.setScalar(k);
  return wrap;
}

export function normaliseSpec(s: Partial<ModelSpec>): ModelSpec {
  const flavours = (s.flavours?.length ? s.flavours : ['#F7A1BE']).slice(0, 3);
  return { type: s.type ?? 'cone', flavours, topping: s.topping ?? 'none', sauce: s.sauce ?? 'none', cherry: !!s.cherry, wafer: !!s.wafer };
}
export const specKey = (s: Partial<ModelSpec>) => JSON.stringify(normaliseSpec(s));

/** The one entry point: ModelSpec → ready-to-render, centred Object3D. */
export function buildModel(input: Partial<ModelSpec>): THREE.Group {
  const spec = normaliseSpec(input);
  const g = new THREE.Group();
  if (spec.type === 'cone' || spec.type === 'cup') {
    g.add(spec.type === 'cone' ? makeCone() : makeCup());
    const st = stackScoops(g, spec, spec.type === 'cone' ? 0.62 : 0.38);
    if (spec.cherry) { const c = makeCherry(); c.position.y = st.top + 0.12; g.add(c); }
    if (spec.wafer) { const w = makeWafer(); w.position.set(0.45 * st.r, st.y + 0.55 * st.r, -0.25); w.rotation.set(0.3, 0, -0.5); g.add(w); }
  } else if (spec.type === 'stick') g.add(makeStick(spec));
  else if (spec.type === 'sundae') g.add(makeSundae(spec));
  else if (spec.type === 'shake') g.add(makeShake(spec));
  else g.add(makeSandwich(spec));
  return fit(g);
}

/** Free GPU memory. Shared geometry and textures are kept. */
export function disposeObject(o: THREE.Object3D) {
  o.traverse((n) => {
    const m = n as THREE.Mesh;
    if (m.geometry && m.geometry !== scoopGeometry) m.geometry.dispose();
    if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose());
  });
}

export function addStudioLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xf3c2d2, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(3, 6, 5);
  const fill = new THREE.DirectionalLight(0xffe6ee, 0.7); fill.position.set(-5, 2, 3);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(0, 3, -6);
  scene.add(key, fill, rim, new THREE.AmbientLight(0xffffff, 0.2));
}
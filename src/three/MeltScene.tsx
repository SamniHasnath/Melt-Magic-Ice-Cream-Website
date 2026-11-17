import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { StudioLights } from './IceCream';
import { TAU, creamMat, makeCherry, makeCone, rng, scoopGeo } from './builders';

/**
 * The melting hero. Scroll progress (0 → 1) drives how far the scoop has melted:
 *  - a vertex shader slumps the scoop and pulls drip lobes out of its lower half
 *  - cream strands run down the waffle cone and grow bulbs at their tips
 *  - drops break off, stretch as they fall, and splash into a spreading puddle
 *  - the camera follows the melt downward so the liquid "leaves" the bottom of the screen
 * Even at the top of the page the scoop melts a little and wobbles, so it never looks frozen.
 */

interface Props {
  progress: MutableRefObject<number>;
  flavour: string;
  stage: MutableRefObject<HTMLDivElement | null>;
  spin: MutableRefObject<number>;
}

/* ------------------------------------------------------------------ */
/* Melt shader: injected into the normal physical cream material       */
/* ------------------------------------------------------------------ */
const MELT_GLSL = /* glsl */ `
uniform float uMelt;
uniform float uTime;
vec3 melt(vec3 p) {
  float m = uMelt;
  float h = clamp((p.y + 1.0) * 0.5, 0.0, 1.0);           // 0 at the bottom, 1 at the top
  p.y -= m * 0.62 * h * h;                                 // the top sinks
  float belly = 1.0 - smoothstep(0.0, 1.0, abs(p.y + 0.2) * 1.25);
  p.xz *= 1.0 + m * 0.34 * belly;                          // the middle spreads over the rim
  float w = sin(p.x * 5.0 + uTime * 1.3) * sin(p.z * 4.0 - uTime * 1.1) * sin(p.y * 6.0 + uTime * 0.7);
  p += normalize(p + vec3(1e-4)) * w * (0.012 + 0.035 * m); // slow creamy wobble
  float a = atan(p.z, p.x);
  float lobes = pow(0.5 + 0.5 * sin(a * 5.0 + 1.3), 7.0) + 0.8 * pow(0.5 + 0.5 * sin(a * 3.0 + 4.1), 9.0);
  float low = smoothstep(0.15, -0.8, p.y);
  float len = m * (1.15 + 0.25 * sin(uTime * 0.8 + a * 2.0));
  p.y -= lobes * low * len;                                // drips stretch downward
  p.xz *= 1.0 - lobes * low * m * 0.38;                    // and get thinner as they stretch
  return p;
}`;

function meltMaterial(color: string) {
  const mat = creamMat(color);
  const uniforms = { uMelt: { value: 0 }, uTime: { value: 0 } };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${MELT_GLSL}`)
      // recompute the normal from the deformed surface so the lighting follows the drips
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        vec3 t1 = normalize(cross(objectNormal, abs(objectNormal.y) > 0.95 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0)));
        vec3 t2 = cross(objectNormal, t1);
        vec3 m0 = melt(position);
        objectNormal = normalize(cross(melt(position + t1 * 0.01) - m0, melt(position + t2 * 0.01) - m0));`)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed = melt(position);');
  };
  mat.customProgramCacheKey = () => 'melt-scoop';
  return { mat, uniforms };
}

/* ------------------------------------------------------------------ */
/* Static helpers                                                      */
/* ------------------------------------------------------------------ */
const smooth = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const glossy = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 });

/** An uneven puddle outline so it doesn't look like a perfect disc. */
function puddleGeo() {
  const g = new THREE.CircleGeometry(1, 72);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 1; i < p.count; i++) {
    const a = Math.atan2(p.getY(i), p.getX(i));
    const r = 1 + Math.sin(a * 3 + 1) * 0.08 + Math.sin(a * 7 + 2) * 0.05 + Math.sin(a * 13) * 0.025;
    p.setXY(i, p.getX(i) * r, p.getY(i) * r);
  }
  return g;
}

const CONE_Y = 0.15;          // cone rim height in the scene
const TIP_Y = CONE_Y - 2.6;   // cone tip
const FLOOR_Y = -3.05;        // where the puddle lies
const STRANDS = [0.4, 1.35, 2.2, 3.05, 3.9, 4.8, 5.6].map((a, i) => ({ a, delay: (i * 0.37) % 0.5, max: 1.1 + ((i * 0.53) % 0.9), wob: i * 1.7 }));
const DROPS = 36, SPLASH = 72, SPRINKLES = 70;
const SPRINKLE_COLORS = ['#FF4F8B', '#FFD23F', '#6FE3C1', '#8FD3FF', '#FFFFFF', '#B48AD6', '#9E5D3A'];

function World({ progress, flavour, stage, spin }: Props) {
  const { camera, pointer, size } = useThree();

  const parts = useMemo(() => {
    const { mat: scoopMat, uniforms } = meltMaterial(flavour);
    const scoop = new THREE.Mesh(scoopGeo(), scoopMat);
    const cone = makeCone();
    const cherry = makeCherry();
    const liquid = glossy(flavour);

    // cream strands running down the cone: a stretched capsule + a bulb at the tip
    // tapered: thick where it leaves the rim, thinner towards the bulb (+y points up the cone)
    const strandGeo = new THREE.CylinderGeometry(0.095, 0.05, 1, 14, 6, false);
    const bulbGeo = new THREE.SphereGeometry(0.11, 16, 12);
    const strands = STRANDS.map(() => ({ body: new THREE.Mesh(strandGeo, liquid), bulb: new THREE.Mesh(bulbGeo, liquid), end: new THREE.Vector3(), ready: false }));

    const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 12, 10), liquid, DROPS);
    const splash = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), liquid, SPLASH);
    drops.frustumCulled = splash.frustumCulled = false;

    const puddle = new THREE.Mesh(puddleGeo(), liquid);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.y = FLOOR_Y;

    // sprinkles floating around the scoop (one draw call)
    const sprinkles = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.025, 0.12, 2, 6), new THREE.MeshStandardMaterial({ roughness: 0.4 }), SPRINKLES);
    const r = rng(9), c = new THREE.Color();
    const floaters = Array.from({ length: SPRINKLES }, (_, i) => {
      sprinkles.setColorAt(i, c.set(SPRINKLE_COLORS[i % SPRINKLE_COLORS.length]));
      return { a: r() * TAU, rad: 1.9 + r() * 2.6, y: -2.5 + r() * 5.5, sp: 0.08 + r() * 0.18, rot: new THREE.Euler(r() * TAU, r() * TAU, r() * TAU), z: -1.5 + r() * 2.5 };
    });

    return { scoop, uniforms, cone, cherry, liquid, strands, drops, splash, puddle, sprinkles, floaters };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // particle state lives outside React: plain typed arrays updated every frame
  const sim = useMemo(() => ({
    dp: new Float32Array(DROPS * 3), dv: new Float32Array(DROPS * 3), dl: new Uint8Array(DROPS),
    sp: new Float32Array(SPLASH * 3), sv: new Float32Array(SPLASH * 3), sl: new Float32Array(SPLASH),
    next: 0, nextSplash: 0, smoothP: 0, jelly: 0, jellyV: 0, lastPx: 0, lastPy: 0,
  }), []);

  const target = useRef(new THREE.Color(flavour));
  useEffect(() => { target.current.set(flavour); }, [flavour]);
  const root = useRef<THREE.Group>(null);

  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const bgA = useMemo(() => new THREE.Color('#FFF6E8'), []);
  const bgB = useMemo(() => new THREE.Color('#FBE0E8'), []);
  const bgC = useMemo(() => new THREE.Color('#F8CFDC'), []);
  const bg = useMemo(() => new THREE.Color(), []);
  const hidden = useMemo(() => new THREE.Matrix4().makeScale(0, 0, 0), []);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30);
    const t = state.clock.elapsedTime;
    sim.smoothP += (progress.current - sim.smoothP) * Math.min(1, dt * 6);
    const p = sim.smoothP;
    const { scoop, uniforms, cone, cherry, liquid, strands, drops, splash, puddle, sprinkles, floaters } = parts;

    // how melted it is: a gentle idle melt at the top of the page, then scroll takes over
    const idle = 0.1 + Math.sin(t * 0.35) * 0.03;
    const melt = idle + (0.95 - idle) * smooth(0.04, 0.82, p);
    uniforms.uMelt.value = melt;
    uniforms.uTime.value = t;

    // pointer velocity → soft jelly squash on the scoop (spring)
    const pvx = pointer.x - sim.lastPx, pvy = pointer.y - sim.lastPy;
    sim.lastPx = pointer.x; sim.lastPy = pointer.y;
    sim.jellyV += (Math.min(0.6, Math.hypot(pvx, pvy) * 6) - sim.jelly) * 0.18 - sim.jellyV * 0.12;
    sim.jelly += sim.jellyV;
    const jl = sim.jelly;

    scoop.position.set(0, CONE_Y + 0.82 - melt * 0.1, 0);
    scoop.rotation.y = t * 0.12 + spin.current;
    scoop.scale.set(1 + jl * 0.05, 1 - jl * 0.09 + Math.sin(t * 2.1) * 0.006, 1 + jl * 0.05);

    // the cherry rides the sinking top and slowly tips over
    cherry.position.set(Math.sin(melt * 2) * 0.18, scoop.position.y + 0.98 * (1 - 0.62 * melt) * scoop.scale.y + 0.12, 0.05);
    cherry.rotation.set(0, t * 0.3, -melt * 0.7);

    cone.position.y = CONE_Y;
    cone.rotation.y = scoop.rotation.y * 0.3;

    // strands down the cone
    const coneR = (y: number) => 0.88 * (1 + (y - CONE_Y) / 2.6) + 0.07;
    strands.forEach((st, i) => {
      const cfg = STRANDS[i];
      const grow = smooth(cfg.delay * 0.6, cfg.delay * 0.6 + 0.55, melt) * cfg.max * (1 + Math.sin(t * 1.1 + cfg.wob) * 0.06);
      const L = Math.max(0.001, grow * 2.3);
      const a = cfg.a + cone.rotation.y;
      const yEnd = Math.max(TIP_Y + 0.1, CONE_Y + 0.05 - L * 0.95);
      const start = v.set(Math.cos(a) * coneR(CONE_Y), CONE_Y + 0.05, Math.sin(a) * coneR(CONE_Y));
      const end = s.set(Math.cos(a) * coneR(yEnd), yEnd, Math.sin(a) * coneR(yEnd));
      st.body.position.copy(start).add(end).multiplyScalar(0.5);
      const len = start.distanceTo(end);
      st.body.quaternion.setFromUnitVectors(up, start.sub(end).normalize());
      st.body.scale.set(1, Math.max(0.01, len), 1);
      st.bulb.position.copy(end);
      const b = 0.6 + grow * 0.5 + Math.sin(t * 3 + i) * 0.05;
      st.bulb.scale.setScalar(grow > 0.02 ? b : 0.001);
      st.body.visible = grow > 0.02;
      st.ready = grow > cfg.max * 0.55;
      st.end.copy(end);
    });

    // spawn drops from ripe strand tips and from the cone tip
    const rate = melt < 0.2 ? 0.35 : 1 + melt * 9; // drops per second
    sim.next -= dt;
    if (sim.next <= 0) {
      sim.next = (0.6 + Math.random() * 0.8) / rate;
      const ripe = strands.filter((x) => x.ready);
      const from = ripe.length && Math.random() < 0.75 ? ripe[(Math.random() * ripe.length) | 0].end : v.set(0, TIP_Y, 0);
      if (melt > 0.16 || ripe.length) {
        const k = sim.dl.indexOf(0);
        if (k >= 0) {
          sim.dl[k] = 1;
          sim.dp.set([from.x, from.y - 0.05, from.z], k * 3);
          sim.dv.set([(Math.random() - 0.5) * 0.15, -0.2, (Math.random() - 0.5) * 0.15], k * 3);
        }
      }
    }
    const puddleR = 0.15 + smooth(0.15, 0.95, melt) * 2.4;
    for (let k = 0; k < DROPS; k++) {
      if (!sim.dl[k]) { drops.setMatrixAt(k, hidden); continue; }
      const o = k * 3;
      sim.dv[o + 1] -= 7.5 * dt;
      sim.dp[o] += sim.dv[o] * dt; sim.dp[o + 1] += sim.dv[o + 1] * dt; sim.dp[o + 2] += sim.dv[o + 2] * dt;
      if (sim.dp[o + 1] < FLOOR_Y + 0.02) {
        sim.dl[k] = 0;
        // splash: a little crown of droplets
        for (let n = 0; n < 6; n++) {
          const j = sim.nextSplash; sim.nextSplash = (sim.nextSplash + 1) % SPLASH;
          const ang = (n / 6) * TAU + Math.random() * 0.6, spd = 0.6 + Math.random() * 0.9;
          sim.sp.set([sim.dp[o], FLOOR_Y + 0.03, sim.dp[o + 2]], j * 3);
          sim.sv.set([Math.cos(ang) * spd, 1.4 + Math.random() * 1.4, Math.sin(ang) * spd], j * 3);
          sim.sl[j] = 0.55 + Math.random() * 0.3;
        }
        drops.setMatrixAt(k, hidden);
        continue;
      }
      const stretch = 1 + Math.min(1.8, Math.abs(sim.dv[o + 1]) * 0.22);
      m4.compose(v.set(sim.dp[o], sim.dp[o + 1], sim.dp[o + 2]), q.identity(), s.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch)));
      drops.setMatrixAt(k, m4);
    }
    drops.instanceMatrix.needsUpdate = true;
    for (let j = 0; j < SPLASH; j++) {
      if (sim.sl[j] <= 0) { splash.setMatrixAt(j, hidden); continue; }
      const o = j * 3;
      sim.sl[j] -= dt;
      sim.sv[o + 1] -= 9 * dt;
      sim.sp[o] += sim.sv[o] * dt; sim.sp[o + 1] = Math.max(FLOOR_Y, sim.sp[o + 1] + sim.sv[o + 1] * dt); sim.sp[o + 2] += sim.sv[o + 2] * dt;
      m4.compose(v.set(sim.sp[o], sim.sp[o + 1], sim.sp[o + 2]), q.identity(), s.setScalar(Math.max(0, sim.sl[j]) * 1.6));
      splash.setMatrixAt(j, m4);
    }
    splash.instanceMatrix.needsUpdate = true;

    // the puddle spreads and breathes
    puddle.scale.set(puddleR * (1 + Math.sin(t * 1.7) * 0.015), puddleR * 0.62 * (1 + Math.cos(t * 1.3) * 0.02), 1);

    // floating sprinkles drift around the scoop
    floaters.forEach((f, i) => {
      const a = f.a + t * f.sp;
      f.rot.x += dt * 0.6; f.rot.y += dt * 0.4;
      m4.compose(v.set(Math.cos(a) * f.rad, f.y + Math.sin(t * 0.6 + i) * 0.25, Math.sin(a) * f.rad * 0.5 + f.z), q.setFromEuler(f.rot), s.setScalar(1));
      sprinkles.setMatrixAt(i, m4);
    });
    sprinkles.instanceMatrix.needsUpdate = true;

    // colours follow the chosen flavour
    (scoop.material as THREE.MeshPhysicalMaterial).color.lerp(target.current, 0.08);
    liquid.color.lerp(target.current, 0.08);

    // camera follows the melt down towards the puddle; pointer adds a gentle parallax
    const narrow = size.width / size.height < 0.8;
    const camY = 0.15 - smooth(0.25, 1, p) * 2.4;
    const camZ = (10.5 - smooth(0.3, 1, p) * 1.6) * (narrow ? 1.45 : 1);
    const lift = narrow ? 1.1 : 0;
    camera.position.x += (pointer.x * 0.5 - camera.position.x) * 0.06;
    camera.position.y += (camY + lift + pointer.y * 0.3 - camera.position.y) * 0.06;
    camera.position.z = camZ;
    camera.lookAt(0, camY * 0.9 - 0.25 + lift, 0);
    if (root.current) {
      root.current.rotation.y += (pointer.x * 0.35 - root.current.rotation.y) * 0.05;
      root.current.rotation.x += (-pointer.y * 0.08 - root.current.rotation.x) * 0.05;
    }

    // stage colour warms from vanilla to strawberry as it melts
    if (stage.current) {
      bg.copy(bgA).lerp(bgB, smooth(0, 0.5, p)).lerp(bgC, smooth(0.5, 1, p));
      stage.current.style.background = '#' + bg.getHexString();
    }
  });

  return (
    <>
      <group ref={root}>
        <primitive object={parts.cone} />
        <primitive object={parts.scoop} />
        <primitive object={parts.cherry} />
        {parts.strands.map((st, i) => (
          <group key={i}><primitive object={st.body} /><primitive object={st.bulb} /></group>
        ))}
        <primitive object={parts.drops} />
        <primitive object={parts.splash} />
        <primitive object={parts.puddle} />
        <ContactShadows position={[0, FLOOR_Y - 0.01, 0]} opacity={0.3} scale={10} blur={2.6} far={4} />
      </group>
      <primitive object={parts.sprinkles} />
    </>
  );
}

export default function MeltScene({ active = true, ...props }: Props & { active?: boolean }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.75]} camera={{ position: [0, 0.15, 10.5], fov: 32 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <StudioLights />
      <World {...props} />
    </Canvas>
  );
}

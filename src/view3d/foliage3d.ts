// Leaves and grass for the 3D view.
// Trees used to be a stick with a few green balls on it. Now each canopy is dozens of clumps of leaf cards (small
// pictures of leaves, painted here in code, cut out by their own transparency), lit as if the whole crown were one
// soft ball so it shades from a bright sunny top to a dark underside, and swaying a little in the wind. Pines get
// drooping tiers of needle sprays. Grass is many crossed blade cards on grassy ground, built only near where you are
// looking (and not at all on Low), so a huge map costs no more than a small one.
import * as THREE from 'three';
import type { GameMap } from '../engine/map';
import { terrainById } from '../library/terrain';
import { objectById } from '../library/objects';
import { shade, type VisUniforms } from './shaders';

// ---------------------------------------------------------------------------------------------------------
// painted cut-outs (greyscale, so one picture serves every leaf colour through the vertex colour)

function rnd(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const texCache = new Map<string, THREE.Texture>();
function cutout(key: string, S: number, paint: (g: CanvasRenderingContext2D, R: () => number) => void) {
  let t = texCache.get(key);
  if (t) return t;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  paint(g, rnd(key.length * 7919 + S));
  t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}

/** A clump of broad leaves: a rough round spray, darker toward the middle. */
const leafTex = () =>
  cutout('leaf', 256, (g, R) => {
    for (let i = 0; i < 150; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 100;
      const x = 128 + Math.cos(a) * d, y = 128 + Math.sin(a) * d * 0.92;
      const L = 14 + R() * 12, W = L * (0.42 + R() * 0.15), rot = a + (R() - 0.5) * 1.2;
      const v = Math.round(150 + R() * 90 - (1 - d / 100) * 50);
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.beginPath();
      g.moveTo(-L / 2, 0);
      g.quadraticCurveTo(0, -W, L / 2, 0);
      g.quadraticCurveTo(0, W, -L / 2, 0);
      g.fill();
      g.strokeStyle = `rgba(40,40,40,0.35)`;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(-L / 2, 0);
      g.lineTo(L / 2, 0);
      g.stroke();
      g.restore();
    }
  });

/** A spray of pine needles fanning out from a twig along the bottom edge. */
const needleTex = () =>
  cutout('needle', 256, (g, R) => {
    g.lineCap = 'round';
    for (let b = 0; b < 9; b++) {
      const x0 = 128 + (R() - 0.5) * 40, y0 = 250, ang = -Math.PI / 2 + (b / 8 - 0.5) * 1.7;
      const len = 150 + R() * 80;
      const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
      g.strokeStyle = 'rgb(90,80,70)';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      g.stroke();
      for (let n = 0; n < 40; n++) {
        const t = n / 40, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t;
        for (const side of [-1, 1]) {
          const na = ang + side * (0.75 + R() * 0.3), nl = 12 + R() * 10 * (1 - t * 0.5);
          const v = Math.round(120 + R() * 110);
          g.strokeStyle = `rgb(${v},${v},${v})`;
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(px, py);
          g.lineTo(px + Math.cos(na) * nl, py + Math.sin(na) * nl);
          g.stroke();
        }
      }
    }
  });

/** A tuft of grass blades: dark at the root, light at the tips. */
const bladeTex = () =>
  cutout('blade', 256, (g, R) => {
    for (let i = 0; i < 46; i++) {
      const x0 = 20 + R() * 216, h = 110 + R() * 140, lean = (R() - 0.5) * 70, w = 4 + R() * 6;
      const grad = g.createLinearGradient(0, 256, 0, 256 - h);
      const tip = Math.round(215 + R() * 40);
      grad.addColorStop(0, 'rgb(150,150,150)');
      grad.addColorStop(1, `rgb(${tip},${tip},${tip})`);
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(x0 - w / 2, 256);
      g.quadraticCurveTo(x0 + lean * 0.3, 256 - h * 0.6, x0 + lean, 256 - h);
      g.quadraticCurveTo(x0 + lean * 0.35, 256 - h * 0.55, x0 + w / 2, 256);
      g.fill();
    }
  });

// ---------------------------------------------------------------------------------------------------------
// collecting canopies while the props are built

type Card = { kind: 'leaf' | 'needle'; x: number; y: number; z: number; s: number; col: THREE.Color; cx: number; cy: number; cz: number; droop?: number; ang?: number; tilt?: number };

let sink: Card[] | null = null;
/** While set, tree models put their crowns here instead of building them from balls. */
export function collectFoliage(on: boolean) {
  sink = on ? [] : null;
}
export const foliageOn = () => !!sink;

const C3 = new THREE.Color();
function tint(col: string, k: number, R: () => number) {
  const c = new THREE.Color(col);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h + (R() - 0.5) * 0.03, Math.min(1, hsl.s * (0.9 + R() * 0.25)), Math.max(0, Math.min(1, hsl.l * (k + (R() - 0.5) * 0.18))));
  return c;
}

/** A broadleaf crown: a few limbs and clumps of leaves on them. Positions are world units. */
export function leafCrown(o: { x: number; y: number; z: number }, R: () => number, leaf: string, h: number, r: number, style: 'round' | 'airy' | 'weeping' | 'swamp'): [number, number, number][] {
  const cards = sink!;
  const top = o.y + h, cy = o.y + h * 0.72;
  const limbs: [number, number, number][] = [];
  const nl = style === 'airy' ? 5 : 6;
  for (let i = 0; i < nl; i++) {
    const a = (i / nl) * Math.PI * 2 + R() * 0.8, d = r * (0.55 + R() * 0.35);
    const ly = style === 'weeping' ? cy + R() * h * 0.15 : cy - h * 0.1 + R() * h * 0.3;
    limbs.push([Math.cos(a) * d, ly - o.y, Math.sin(a) * d]);
  }
  limbs.push([0, top - o.y - r * 0.3, 0]);
  const n = style === 'airy' ? 22 : 30;
  for (let i = 0; i < n; i++) {
    const L = limbs[i % limbs.length];
    let x = L[0] + (R() - 0.5) * r * 0.75, y = L[1] + (R() - 0.35) * r * 0.6, z = L[2] + (R() - 0.5) * r * 0.75;
    if (style === 'weeping') y -= R() * h * 0.35;
    // keep the crown roughly an egg
    const ex = x / (r * 1.15), ey = (y - (cy - o.y)) / (h * 0.42), ez = z / (r * 1.15), e = Math.hypot(ex, ey, ez);
    if (e > 1) { x /= e; y = (cy - o.y) + (y - (cy - o.y)) / e; z /= e; }
    const s = r * (style === 'airy' ? 0.62 : 0.78) * (0.75 + R() * 0.5);
    const shadeK = 0.7 + 0.45 * Math.max(0, Math.min(1, (y - (cy - o.y - h * 0.3)) / (h * 0.6)));
    cards.push({ kind: 'leaf', x: o.x + x, y: o.y + y, z: o.z + z, s, col: tint(leaf, shadeK, R), cx: o.x, cy, cz: o.z, droop: style === 'weeping' ? 1.8 : style === 'swamp' ? 1.3 : 1 });
  }
  return limbs;
}

/** A conifer: tiers of drooping needle sprays, narrowing to a spike. */
export function needleCrown(o: { x: number; y: number; z: number }, R: () => number, col: string, h: number, r: number, snow: boolean) {
  const cards = sink!;
  const tiers = 9;
  for (let t = 0; t < tiers; t++) {
    const f = t / (tiers - 1), y = o.y + h * (0.28 + f * 0.72), rad = r * 1.55 * (1 - f * 0.85) + 0.12;
    const n = Math.max(4, Math.round(9 - f * 5));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + t * 0.7 + R() * 0.4;
      const k = 0.62 + 0.5 * f + (R() - 0.5) * 0.1;
      const c = tint(col, k, R);
      if (snow && R() < 0.55) c.lerp(C3.set('#eef3f6'), 0.6 + R() * 0.3);
      cards.push({ kind: 'needle', x: o.x + Math.cos(a) * rad * 0.5, y, z: o.z + Math.sin(a) * rad * 0.5, s: rad * 1.05, col: c, cx: o.x, cy: o.y + h * 0.55, cz: o.z, ang: a, tilt: 0.35 + f * 0.25 });
    }
  }
  // the leader at the top
  cards.push({ kind: 'needle', x: o.x, y: o.y + h * 1.02, z: o.z, s: r * 0.5, col: tint(col, 1.1, R), cx: o.x, cy: o.y + h * 0.55, cz: o.z, ang: R() * 6.28, tilt: -1.2 });
}

/** A bush: low clumps of leaves. */
export function bushCrown(o: { x: number; y: number; z: number }, R: () => number, leaf: string, r: number) {
  const cards = sink!;
  for (let i = 0; i < 9; i++) {
    const a = R() * 6.28, d = Math.sqrt(R()) * r * 0.6;
    const y = o.y + r * (0.35 + R() * 0.5);
    cards.push({ kind: 'leaf', x: o.x + Math.cos(a) * d, y, z: o.z + Math.sin(a) * d, s: r * (0.7 + R() * 0.35), col: tint(leaf, 0.75 + (y - o.y) / r * 0.35, R), cx: o.x, cy: o.y + r * 0.3, cz: o.z });
  }
}

/** Turns the collected crowns into two meshes (leaves, needles). */
export function buildFoliage(vis: VisUniforms, shadows: boolean): { meshes: THREE.Mesh[]; materials: THREE.Material[]; geometries: THREE.BufferGeometry[] } {
  const cards = sink ?? [];
  sink = null;
  const out = { meshes: [] as THREE.Mesh[], materials: [] as THREE.Material[], geometries: [] as THREE.BufferGeometry[] };
  for (const kind of ['leaf', 'needle'] as const) {
    const list = cards.filter((c) => c.kind === kind);
    if (!list.length) continue;
    const per = kind === 'leaf' ? 3 : 1;
    const nq = list.length * per;
    const P = new Float32Array(nq * 4 * 3), N = new Float32Array(nq * 4 * 3), U = new Float32Array(nq * 4 * 2), Cc = new Float32Array(nq * 4 * 3), Sw = new Float32Array(nq * 4);
    const I = new Uint32Array(nq * 6);
    let q = 0;
    const v = new THREE.Vector3(), nrm = new THREE.Vector3(), ax = new THREE.Vector3(), ay = new THREE.Vector3();
    const R = rnd(list.length);
    for (const c of list) {
      for (let k = 0; k < per; k++) {
        if (kind === 'leaf') {
          // three cards through the clump at random angles: it reads as a full ball of leaves from any side
          const a = R() * Math.PI, b = (R() - 0.5) * 1.6;
          ax.set(Math.cos(a), 0, Math.sin(a));
          ay.set(-Math.sin(a) * Math.sin(b), Math.cos(b), Math.cos(a) * Math.sin(b)).normalize();
          if (k === 1) { ax.set(-ax.z, ax.y, ax.x); }
          if (k === 2) { ax.set(Math.cos(a + 0.8), 0.7, Math.sin(a + 0.8)).normalize(); ay.crossVectors(ax, ay).normalize(); }
          ay.multiplyScalar(c.droop ?? 1);
        } else {
          // a spray pointing out from the trunk and drooping
          const a = c.ang ?? 0, t = c.tilt ?? 0.4;
          ay.set(Math.cos(a) * Math.cos(t), -Math.sin(t), Math.sin(a) * Math.cos(t));
          if (t < -1) ay.set(0, 1, 0);
          ax.set(-Math.sin(a), 0, Math.cos(a));
        }
        const s = c.s;
        const corners = kind === 'leaf' ? [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]] : [[-0.5, 0], [0.5, 0], [0.5, 1], [-0.5, 1]];
        for (let j = 0; j < 4; j++) {
          const [cu, cv] = corners[j];
          v.set(c.x, c.y, c.z).addScaledVector(ax, cu * s).addScaledVector(ay, cv * s);
          // light the crown as one soft ball: normals point away from its middle, tipped up toward the sky
          nrm.set(v.x - c.cx, (v.y - c.cy) * 1.2 + 0.35, v.z - c.cz).normalize();
          const o = (q * 4 + j);
          P.set([v.x, v.y, v.z], o * 3);
          N.set([nrm.x, nrm.y, nrm.z], o * 3);
          U.set([cu + 0.5, kind === 'leaf' ? cv + 0.5 : cv], o * 2);
          const dk = kind === 'needle' && cv === 0 ? 0.8 : 1;
          Cc.set([c.col.r * dk, c.col.g * dk, c.col.b * dk], o * 3);
          Sw[o] = Math.min(1.5, Math.max(0.15, (v.y - (c.cy - 1.5)) * 0.35));
        }
        const b0 = q * 4;
        I.set([b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3], q * 6);
        q++;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    g.setAttribute('color', new THREE.BufferAttribute(Cc, 3));
    g.setAttribute('aSway', new THREE.BufferAttribute(Sw, 1));
    g.setIndex(new THREE.BufferAttribute(I, 1));
    g.computeBoundingSphere();
    const mat = shade(
      new THREE.MeshStandardMaterial({ map: kind === 'leaf' ? leafTex() : needleTex(), vertexColors: true, alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.82, metalness: 0 }),
      vis,
      { sway: kind === 'leaf' ? 0.035 : 0.02 },
    );
    const mesh = new THREE.Mesh(g, mat);
    mesh.name = 'foliage-' + kind;
    mesh.castShadow = shadows;
    mesh.receiveShadow = shadows;
    out.meshes.push(mesh);
    out.materials.push(mat);
    out.geometries.push(g);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------
// grass

const GRASS: Record<string, { n: number; h: number; base: string; tip: string; glow?: boolean }> = {
  grass: { n: 4, h: 0.3, base: '#5a7a2c', tip: '#a8c860' },
  'grass-lush': { n: 5, h: 0.4, base: '#4a7a24', tip: '#9ad050' },
  meadow: { n: 5, h: 0.45, base: '#5f8a30', tip: '#c2d070' },
  'grass-dry': { n: 4, h: 0.38, base: '#8a7a3a', tip: '#e0cc80' },
  moss: { n: 2, h: 0.12, base: '#2f5a1c', tip: '#7aa840' },
  thicket: { n: 6, h: 0.7, base: '#22401a', tip: '#5c8a34' },
  tundra: { n: 2, h: 0.18, base: '#6a6a50', tip: '#b8b48c' },
  'forest-floor': { n: 1.5, h: 0.22, base: '#3a4a1e', tip: '#6c8a3a' },
  'jungle-floor': { n: 2, h: 0.35, base: '#22381a', tip: '#4f7a2a' },
  'jungle-undergrowth': { n: 5, h: 0.65, base: '#1c3414', tip: '#4a8a2a' },
  bog: { n: 3, h: 0.5, base: '#3a4224', tip: '#8a8a4a' },
  'glow-moss': { n: 3, h: 0.16, base: '#14403c', tip: '#5af0d0', glow: true },
  'fungal-ground': { n: 1.5, h: 0.26, base: '#3a2a5a', tip: '#b78aff', glow: true },
};

const CH = 12;

export interface Grass {
  group: THREE.Group;
  update: (focus: THREE.Vector3) => void;
  dispose: () => void;
}

/** Grass near the focus, chunk by chunk. `matAt` and `heightAt` cover the land past the edge too. */
export function buildGrass(m: GameMap, matAt: (x: number, y: number) => string, heightAt: (x: number, z: number) => number, margin: number, q: 'low' | 'medium' | 'high', vis: VisUniforms): Grass | undefined {
  if (q === 'low') return undefined;
  const group = new THREE.Group();
  group.name = 'grass';
  const dens = q === 'high' ? 1 : 0.5, reach = q === 'high' ? 34 : 24;
  const mat = shade(
    new THREE.MeshStandardMaterial({ map: bladeTex(), vertexColors: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9, metalness: 0 }),
    vis,
    { sway: 0.09, fade: [reach * 0.45, reach * 0.8] },
  );
  const glowMat = shade(
    new THREE.MeshStandardMaterial({ map: bladeTex(), vertexColors: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9, emissive: new THREE.Color('#ffffff'), emissiveMap: bladeTex(), emissiveIntensity: 0.35 }),
    vis,
    { sway: 0.06, emissiveVertex: true, fade: [reach * 0.45, reach * 0.8] },
  );
  // squares under buildings and big solid things get no grass poking through their floors
  const covered = new Set<string>();
  for (const p of m.props) {
    const d = objectById(p.kind);
    if (!d || !(d.solid || d.cat === 'structure')) continue;
    const [w, h] = p.rot % 180 ? [d.h, d.w] : [d.w, d.h];
    for (let y = p.y; y < p.y + h; y++) for (let x = p.x; x < p.x + w; x++) covered.add(x + ',' + y);
  }
  const chunks = new Map<string, THREE.Mesh[]>();
  const x0 = -margin, y0 = -margin, x1 = m.cols + margin, y1 = m.rows + margin;
  const make = (kx: number, ky: number) => {
    const R = rnd(kx * 7349 + ky * 9157 + 13);
    const lists: { P: number[]; U: number[]; C: number[]; S: number[] }[] = [{ P: [], U: [], C: [], S: [] }, { P: [], U: [], C: [], S: [] }];
    const base = new THREE.Color(), tip = new THREE.Color();
    for (let y = ky * CH; y < ky * CH + CH; y++)
      for (let x = kx * CH; x < kx * CH + CH; x++) {
        if (x < x0 || y < y0 || x >= x1 || y >= y1) continue;
        const id = matAt(x, y);
        const G = GRASS[id];
        if (!G) continue;
        if (covered.has(x + ',' + y)) continue;
        const n = G.n * dens;
        const cnt = Math.floor(n) + (R() < n % 1 ? 1 : 0);
        const L = lists[G.glow ? 1 : 0];
        for (let i = 0; i < cnt; i++) {
          const px = x + R(), pz = y + R(), py = heightAt(px, pz);
          if (py < -0.08) continue; // not under water
          const hh = G.h * (0.7 + R() * 0.6), w = hh * (1.1 + R() * 0.6), a = R() * Math.PI;
          base.set(G.base);
          tip.set(G.tip).offsetHSL((R() - 0.5) * 0.04, 0, (R() - 0.5) * 0.12);
          for (const da of [0, Math.PI / 2]) {
            const dx = Math.cos(a + da) * w * 0.5, dz = Math.sin(a + da) * w * 0.5;
            const quad = [[px - dx, py - 0.02, pz - dz, 0, 0], [px + dx, py - 0.02, pz + dz, 1, 0], [px + dx, py + hh, pz + dz, 1, 1], [px - dx, py - 0.02, pz - dz, 0, 0], [px + dx, py + hh, pz + dz, 1, 1], [px - dx, py + hh, pz - dz, 0, 1]];
            for (const [vx, vy, vz, u, v] of quad) {
              L.P.push(vx, vy, vz);
              L.U.push(u, v);
              const c = v ? tip : base;
              L.C.push(c.r, c.g, c.b);
              L.S.push(v * hh * 2.2);
            }
          }
        }
      }
    const out: THREE.Mesh[] = [];
    lists.forEach((L, gi) => {
      if (!L.P.length) return;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(L.P, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(L.U, 2));
      g.setAttribute('color', new THREE.Float32BufferAttribute(L.C, 3));
      g.setAttribute('aSway', new THREE.Float32BufferAttribute(L.S, 1));
      // blades take the light of the ground they grow from
      const N = new Float32Array(L.P.length);
      for (let i = 1; i < N.length; i += 3) N[i] = 1;
      g.setAttribute('normal', new THREE.BufferAttribute(N, 3));
      g.computeBoundingSphere();
      const me = new THREE.Mesh(g, gi ? glowMat : mat);
      me.receiveShadow = q === 'high';
      me.name = 'grass-chunk';
      group.add(me);
      out.push(me);
    });
    return out;
  };
  let last = new THREE.Vector3(1e9, 0, 1e9);
  const update = (f: THREE.Vector3) => {
    if (Math.hypot(f.x - last.x, f.z - last.z) < 3) return;
    last = f.clone();
    const k0x = Math.floor((f.x - reach) / CH), k1x = Math.floor((f.x + reach) / CH);
    const k0y = Math.floor((f.z - reach) / CH), k1y = Math.floor((f.z + reach) / CH);
    let built = 0;
    for (let ky = k0y; ky <= k1y; ky++)
      for (let kx = k0x; kx <= k1x; kx++) {
        const key = kx + ',' + ky;
        if (chunks.has(key)) continue;
        if (kx * CH + CH < x0 || ky * CH + CH < y0 || kx * CH > x1 || ky * CH > y1) continue;
        if (built++ > 6) { last.set(1e9, 0, 1e9); continue; } // a few per frame; the rest next frame
        chunks.set(key, make(kx, ky));
      }
    for (const [key, ms] of chunks) {
      const [kx, ky] = key.split(',').map(Number);
      const d = Math.hypot(kx * CH + CH / 2 - f.x, ky * CH + CH / 2 - f.z);
      for (const me of ms) me.visible = d < reach + CH;
      if (d > reach * 2.2) {
        for (const me of ms) { group.remove(me); me.geometry.dispose(); }
        chunks.delete(key);
      }
    }
  };
  return {
    group,
    update,
    dispose: () => {
      for (const ms of chunks.values()) for (const me of ms) me.geometry.dispose();
      mat.dispose();
      glowMat.dispose();
    },
  };
}

/** Is this ground grassy (for colour checks and tests)? */
export const grassy = (id: string) => !!GRASS[id] && !!terrainById(id);

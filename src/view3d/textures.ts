// Lair Labs' own surface textures for the 3D view, painted in code on canvases (no outside pictures).
// Each surface comes as a colour map (grey so vertex colour tints it) and a normal map made from the same height field,
// the same way the build kit this was modelled on pairs its colour and normal pictures.
import * as THREE from 'three';

type Painter = (x: number, y: number) => number; // height 0..1 at pixel x,y

const cache = new Map<string, THREE.Texture>();

function hash2(x: number, y: number, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
/** Tileable value noise with period p cells. */
function vnoise(x: number, y: number, p: number, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const f = (t: number) => t * t * (3 - 2 * t);
  const w = (a: number) => ((a % p) + p) % p;
  const a = hash2(w(xi), w(yi), s), b = hash2(w(xi + 1), w(yi), s), c = hash2(w(xi), w(yi + 1), s), d = hash2(w(xi + 1), w(yi + 1), s);
  const u = f(fx), v = f(fy);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/** Tileable fractal noise over a texture of size S. */
export function fbm(x: number, y: number, S: number, base: number, oct = 4, s = 0) {
  let amp = 0.5, sum = 0, norm = 0, per = base;
  for (let o = 0; o < oct; o++) {
    sum += amp * vnoise((x / S) * per, (y / S) * per, per, s + o * 31);
    norm += amp;
    amp *= 0.5;
    per *= 2;
  }
  return sum / norm;
}

function canvas(S: number) {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  return c;
}

function bake(S: number, height: Painter, tone: (h: number, x: number, y: number) => number, strength: number) {
  const H = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) H[y * S + x] = height(x, y);
  const col = canvas(S), nor = canvas(S);
  const ci = col.getContext('2d')!.createImageData(S, S), ni = nor.getContext('2d')!.createImageData(S, S);
  const at = (x: number, y: number) => H[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4, h = at(x, y);
      const g = Math.max(0, Math.min(255, Math.round(tone(h, x, y) * 255)));
      ci.data[i] = ci.data[i + 1] = ci.data[i + 2] = g;
      ci.data[i + 3] = 255;
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength, dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1);
      ni.data[i] = Math.round((-dx / l * 0.5 + 0.5) * 255);
      ni.data[i + 1] = Math.round((dy / l * 0.5 + 0.5) * 255);
      ni.data[i + 2] = Math.round((1 / l * 0.5 + 0.5) * 255);
      ni.data[i + 3] = 255;
    }
  col.getContext('2d')!.putImageData(ci, 0, 0);
  nor.getContext('2d')!.putImageData(ni, 0, 0);
  return { col, nor };
}

function tex(c: HTMLCanvasElement, srgb: boolean) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function pair(key: string, S: number, height: Painter, tone: (h: number, x: number, y: number) => number, strength: number) {
  if (!cache.has(key + '_d')) {
    const { col, nor } = bake(S, height, tone, strength);
    cache.set(key + '_d', tex(col, true));
    cache.set(key + '_n', tex(nor, false));
  }
  return { map: cache.get(key + '_d')!, normal: cache.get(key + '_n')! };
}

/** Fine grit, for painted solid things (stone props, plaster, rough wood ends). */
export const gritTex = () =>
  pair('grit', 256, (x, y) => fbm(x, y, 256, 8, 5, 3) * 0.7 + hash2(x, y, 9) * 0.3, (h) => 0.72 + h * 0.36, 3.5);

/** Dressed stone blocks in courses, for dungeon walls. One texture tile = 2 x 2 world units. */
export const stoneBlockTex = () =>
  pair(
    'stoneblock',
    512,
    (x, y) => {
      const row = Math.floor(y / 64), off = row % 2 ? 48 : 0, bx = Math.floor((x + off) / 96);
      const lx = (x + off) % 96, ly = y % 64;
      const edge = Math.min(lx, 96 - lx, ly, 64 - ly);
      const mortar = edge < 3 ? 0 : Math.min(1, (edge - 3) / 5);
      const face = 0.55 + 0.25 * hash2(bx, row, 4) + 0.2 * fbm(x, y, 512, 16, 4, bx + row * 7);
      const chip = fbm(x, y, 512, 32, 3, 17) > 0.72 ? -0.25 : 0;
      return mortar * (face + chip * mortar);
    },
    (h, x, y) => (h < 0.05 ? 0.38 : 0.6 + h * 0.42 + (fbm(x, y, 512, 8, 3, 77) - 0.5) * 0.25),
    6,
  );

/** Rough cave rock. */
export const caveRockTex = () =>
  pair('caverock', 512, (x, y) => Math.pow(fbm(x, y, 512, 6, 6, 11), 1.3) * 0.8 + fbm(x, y, 512, 48, 2, 5) * 0.2, (h) => 0.45 + h * 0.75, 9);

/** Wood grain running along V. */
export const woodTex = () =>
  pair(
    'wood',
    256,
    (x, y) => {
      const warp = fbm(x, y, 256, 4, 3, 21) * 18;
      const g = Math.sin(((x + warp) / 256) * Math.PI * 2 * 14) * 0.5 + 0.5;
      return g * 0.6 + fbm(x * 4, y * 0.25, 256, 8, 3, 2) * 0.4;
    },
    (h) => 0.62 + h * 0.4,
    2.2,
  );

/** Planks, for doors and floors of wood (planks run along V, 4 to a tile). */
export const plankTex = () =>
  pair(
    'plank',
    256,
    (x, y) => {
      const lx = x % 64;
      const seam = lx < 2 || lx > 61 ? 0 : 1;
      const warp = fbm(x, y, 256, 4, 3, 23) * 10;
      const g = Math.sin(((x + warp) / 256) * Math.PI * 2 * 22) * 0.5 + 0.5;
      const knot = fbm(x, y, 256, 16, 2, Math.floor(x / 64)) > 0.78 ? 0.3 : 0;
      return seam * (0.5 + g * 0.35 + hash2(Math.floor(x / 64), 0, 8) * 0.15 - knot);
    },
    (h) => (h < 0.05 ? 0.3 : 0.55 + h * 0.5),
    3,
  );

/** Woven cloth. */
export const clothTex = () =>
  pair(
    'cloth',
    128,
    (x, y) => {
      const a = Math.sin((x / 128) * Math.PI * 2 * 32) * 0.5 + 0.5, b = Math.sin((y / 128) * Math.PI * 2 * 32) * 0.5 + 0.5;
      return ((Math.floor(x / 4) + Math.floor(y / 4)) % 2 ? a : b) * 0.7 + hash2(x, y, 3) * 0.3;
    },
    (h) => 0.75 + h * 0.3,
    1.5,
  );

/** Worn iron. */
export const ironTex = () =>
  pair('iron', 256, (x, y) => fbm(x, y, 256, 6, 5, 41) * 0.8 + hash2(x, y, 2) * 0.2, (h) => 0.55 + h * 0.5, 2.5);

/** A soft round glow sprite for flames and light halos. */
export function glowTex() {
  if (!cache.has('glow')) {
    const c = canvas(64), g = c.getContext('2d')!;
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.25, 'rgba(255,255,255,0.6)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    cache.set('glow', t);
  }
  return cache.get('glow')!;
}

/** A small cube map for reflections: warm torch-lit stone all round, so metal and wet things pick up a dungeon glow. */
export function dungeonEnv(top = '#2a2420', mid = '#5a4632', low = '#1a1612') {
  const key = `env|${top}|${mid}|${low}`;
  if (!cache.has(key)) {
    const faces: HTMLCanvasElement[] = [];
    for (let f = 0; f < 6; f++) {
      const c = canvas(32), g = c.getContext('2d')!;
      if (f === 2) g.fillStyle = top;
      else if (f === 3) g.fillStyle = low;
      else {
        const gr = g.createLinearGradient(0, 0, 0, 32);
        gr.addColorStop(0, top);
        gr.addColorStop(0.5, mid);
        gr.addColorStop(1, low);
        g.fillStyle = gr;
      }
      g.fillRect(0, 0, 32, 32);
      faces.push(c);
    }
    const t = new THREE.CubeTexture(faces);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    cache.set(key, t);
  }
  return cache.get(key)! as THREE.CubeTexture;
}

export function disposeTextures() {
  for (const t of cache.values()) t.dispose();
  cache.clear();
}

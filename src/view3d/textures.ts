// Lair Labs' own surface textures for the 3D view, painted in code on canvases (no outside pictures).
// Each surface comes as a colour map (grey so vertex colour tints it) and a normal map made from the same height field,
// the same way the build kit this was modelled on pairs its colour and normal pictures.
import * as THREE from 'three';
import { ashlar, caveRock } from './paint';

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

/** Texture size: 512 on medium and high quality, 256 on low (set by the engine before the first map is built). */
let DETAIL = 512;
export function setTextureDetail(q: 'low' | 'medium' | 'high') {
  DETAIL = q === 'low' ? 256 : 512;
}

/** Fine grit with chips and hairline cracks, for painted solid things (stone props, plaster, rough wood ends). */
export const gritTex = () => {
  const S = DETAIL;
  return pair(
    'grit',
    S,
    (x, y) => {
      const n = fbm(x, y, S, 8, 5, 3);
      const crack = Math.abs(fbm(x, y, S, 5, 4, 77) - 0.5) < 0.012 ? -0.35 : 0;
      const chip = fbm(x, y, S, 24, 2, 5) > 0.72 ? -0.2 : 0;
      return n * 0.7 + hash2(x, y, 9) * 0.3 + crack + chip;
    },
    (h) => 0.7 + h * 0.38,
    3.5,
  );
};

/** Dressed stone for dungeon walls: now the painted ashlar (one tile = 2 x 2 world units). */
export const stoneBlockTex = () => ashlar();

/** Rough cave rock. */
export const caveRockTex = () => caveRock();

/** Wood grain running along V: growth lines bent round the odd knot, fine pores and long streaks. */
export const woodTex = () => {
  const S = DETAIL, k = S / 256;
  const knots = [[0.3, 0.2], [0.75, 0.62], [0.18, 0.85]];
  return pair(
    'wood',
    S,
    (x, y) => {
      let warp = fbm(x, y, S, 4, 3, 21) * 18 * k;
      let knot = 0;
      for (const [kx, ky] of knots) {
        const dx = (x / S - kx) * 6, dy = (y / S - ky) * 1.6;
        const d = Math.hypot(dx, dy);
        warp += (Math.sign(dx) * 26 * k) / (1 + d * d * 30);
        if (d < 0.12) knot = Math.max(knot, 1 - d / 0.12);
      }
      const g = Math.sin(((x + warp) / S) * Math.PI * 2 * 14) * 0.5 + 0.5;
      const line = Math.pow(g, 6);
      const streak = fbm(x * 6, y * 0.18, S, 8, 3, 2);
      const pore = hash2(x, Math.floor(y / (3 * k)), 4) > 0.93 ? -0.18 : 0;
      return g * 0.45 + streak * 0.4 - line * 0.25 + pore - knot * 0.55;
    },
    (h) => 0.58 + h * 0.46,
    2.4,
  );
};

/** Planks, for doors and floors of wood (planks run along V, 4 to a tile). */
export const plankTex = () => {
  const S = DETAIL, k = S / 256, P = 64 * k;
  return pair(
    'plank',
    S,
    (x, y) => {
      const lx = x % P, plank = Math.floor(x / P);
      const seam = lx < 2 * k || lx > P - 2 * k ? 0 : 1;
      // butt joints: each plank ends somewhere along its length
      const endAt = hash2(plank, 0, 12) * S, butt = Math.abs(((y - endAt + S) % S)) < 1.5 * k ? 0 : 1;
      const warp = fbm(x, y, S, 4, 3, 23) * 10 * k;
      const g = Math.sin(((x + warp) / S) * Math.PI * 2 * 22) * 0.5 + 0.5;
      const knot = fbm(x, y, S, 16, 2, plank) > 0.78 ? 0.3 : 0;
      const nail = (Math.abs(lx - P / 2) < 1.6 * k && Math.abs(((y - endAt + S) % S) - 4 * k) < 1.6 * k) ? -0.4 : 0;
      return seam * butt * (0.5 + g * 0.3 + fbm(x * 5, y * 0.2, S, 8, 2, plank) * 0.12 + hash2(plank, 0, 8) * 0.15 - knot + nail);
    },
    (h) => (h < 0.05 ? 0.3 : 0.55 + h * 0.5),
    3,
  );
};

/** Woven cloth with uneven threads. */
export const clothTex = () => {
  const S = DETAIL / 2, T = 64;
  return pair(
    'cloth',
    S,
    (x, y) => {
      const a = Math.sin((x / S) * Math.PI * 2 * T) * 0.5 + 0.5, b = Math.sin((y / S) * Math.PI * 2 * T) * 0.5 + 0.5;
      const cell = S / T;
      const slub = fbm(x, y * 0.1, S, 16, 2, 8) * 0.3;
      return ((Math.floor(x / cell) + Math.floor(y / cell)) % 2 ? a : b) * 0.6 + hash2(x, y, 3) * 0.15 + slub;
    },
    (h) => 0.72 + h * 0.32,
    1.6,
  );
};

/** Worn iron: hammer dents, pitting and darker rust blooms. */
export const ironTex = () => {
  const S = DETAIL;
  return pair(
    'iron',
    S,
    (x, y) => {
      const dent = fbm(x, y, S, 12, 2, 61);
      const pit = hash2(x >> 1, y >> 1, 2) > 0.96 ? -0.25 : 0;
      return fbm(x, y, S, 6, 5, 41) * 0.6 + dent * 0.3 + hash2(x, y, 2) * 0.1 + pit;
    },
    (h) => {
      return 0.5 + h * 0.55;
    },
    2.6,
  );
};

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

// Lair Labs' own painted surfaces for the 3D view, made in code (no outside pictures).
// Unlike the flat overhead floor pictures, these carry what makes stone and wood read as real up close:
// each stone its own colour, worn rounded edges, dirt packed into the gaps, chips, specks, and a matching
// normal map baked from the same height, so torchlight rakes across the surface.
// Floors tile every 4 squares (UV = square / 4); walls tile every 2 world units (triplanar at 0.5).
import * as THREE from 'three';
import { fbm } from './textures';

type RGB = [number, number, number];
interface Px { h: number; c: RGB }
type Painter = (x: number, y: number) => Px;

const cache = new Map<string, { map: THREE.Texture; normal: THREE.Texture }>();

function hash(x: number, y: number, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const hex = (s: string): RGB => [parseInt(s.slice(1, 3), 16) / 255, parseInt(s.slice(3, 5), 16) / 255, parseInt(s.slice(5, 7), 16) / 255];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mul = (a: RGB, k: number): RGB => [a[0] * k, a[1] * k, a[2] * k];
const sstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const pick = (pal: RGB[], r: number) => pal[Math.min(pal.length - 1, Math.floor(r * pal.length))];

/** Tileable cellular noise: distance to the nearest and second nearest jittered point, and the nearest cell's id. */
function cells(x: number, y: number, S: number, n: number, jitter = 0.85, seed = 0) {
  const cs = S / n;
  const gx = Math.floor(x / cs), gy = Math.floor(y / cs);
  let d1 = 1e9, d2 = 1e9, id = 0;
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const cx = gx + i, cy = gy + j;
      const wx = ((cx % n) + n) % n, wy = ((cy % n) + n) % n;
      const px = (cx + 0.5 + (hash(wx, wy, seed) - 0.5) * jitter) * cs;
      const py = (cy + 0.5 + (hash(wx, wy, seed + 7) - 0.5) * jitter) * cs;
      const d = Math.hypot(x - px, y - py);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = wy * n + wx;
      } else if (d < d2) d2 = d;
    }
  return { d1, d2, edge: (d2 - d1) / 2, id };
}

function bake(S: number, paint: Painter, strength: number) {
  const H = new Float32Array(S * S);
  const col = document.createElement('canvas'), nor = document.createElement('canvas');
  col.width = col.height = nor.width = nor.height = S;
  const ci = col.getContext('2d')!.createImageData(S, S), ni = nor.getContext('2d')!.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const p = paint(x, y), i = (y * S + x) * 4;
      H[y * S + x] = p.h;
      ci.data[i] = Math.max(0, Math.min(255, Math.round(p.c[0] * 255)));
      ci.data[i + 1] = Math.max(0, Math.min(255, Math.round(p.c[1] * 255)));
      ci.data[i + 2] = Math.max(0, Math.min(255, Math.round(p.c[2] * 255)));
      ci.data[i + 3] = 255;
    }
  const at = (x: number, y: number) => H[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength, dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1);
      ni.data[i] = Math.round((-dx / l * 0.5 + 0.5) * 255);
      ni.data[i + 1] = Math.round((dy / l * 0.5 + 0.5) * 255);
      ni.data[i + 2] = Math.round((1 / l * 0.5 + 0.5) * 255);
      ni.data[i + 3] = 255;
    }
  col.getContext('2d')!.putImageData(ci, 0, 0);
  nor.getContext('2d')!.putImageData(ni, 0, 0);
  const tex = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.generateMipmaps = true;
    t.needsUpdate = true;
    return t;
  };
  return { map: tex(col, true), normal: tex(nor, false) };
}

/** Common finishing: fine grain, darker specks, and dirt that gathers in low spots. */
function finish(c: RGB, h: number, x: number, y: number, S: number, dirt: RGB, s = 0): RGB {
  const grain = fbm(x, y, S, 64, 2, 91 + s) - 0.5;
  const blot = fbm(x, y, S, 6, 4, 13 + s);
  let o = mul(c, 1 + grain * 0.18 + (blot - 0.5) * 0.22);
  if (hash(x, y, 77 + s) > 0.985) o = mul(o, 0.7);
  o = mix(o, dirt, (1 - sstep(0.02, 0.3, h)) * 0.6);
  return o;
}

// ---------------- walls ----------------

/** Dressed stone in uneven courses: blocks of different heights and lengths, each its own shade, worn edges, dark mortar. */
export function ashlar(S = 512) {
  const key = `ashlar${S}`;
  if (cache.has(key)) return cache.get(key)!;
  const k = S / 512;
  // course heights that add up to the tile, and block lengths per course
  const rows: { y0: number; h: number; xs: number[] }[] = [];
  let y = 0, r = 0;
  while (y < S - 1) {
    let h = Math.round((44 + hash(r, 0, 3) * 46) * k);
    if (S - (y + h) < 36 * k) h = S - y;
    const xs: number[] = [];
    let x = Math.round(hash(r, 1, 5) * 60 * k);
    const x0 = x;
    while (x < x0 + S) {
      xs.push(x);
      x += Math.round((70 + hash(r, xs.length, 9) * 110) * k);
    }
    rows.push({ y0: y, h, xs });
    y += h;
    r++;
  }
  const pal = ['#a59c8e', '#968f84', '#aa9d86', '#8d8780', '#9f9485', '#b0a692', '#88827a'].map(hex);
  const mortar = hex('#3e3831');
  const v = bake(
    S,
    (px, py) => {
      const row = rows.find((q) => py >= q.y0 && py < q.y0 + q.h) ?? rows[rows.length - 1];
      const ri = rows.indexOf(row);
      let bi = 0, bx0 = 0, bx1 = S;
      for (let i = 0; i < row.xs.length; i++) {
        const a = row.xs[i], b = row.xs[i + 1] ?? row.xs[0] + S;
        const xx = px < row.xs[0] ? px + S : px;
        if (xx >= a && xx < b) {
          bi = i;
          bx0 = a;
          bx1 = b;
          break;
        }
      }
      const xx = px < row.xs[0] ? px + S : px;
      const ex = Math.min(xx - bx0, bx1 - xx), ey = Math.min(py - row.y0, row.y0 + row.h - py);
      // ragged edge: the stone's outline wanders a little
      const rag = (fbm(px, py, S, 24, 2, ri * 13 + bi) - 0.5) * 6 * k;
      const e = Math.min(ex, ey) + rag;
      const bevel = sstep(2 * k, 9 * k, e);
      const face = fbm(px, py, S, 10, 4, ri * 31 + bi * 7);
      const pits = fbm(px, py, S, 48, 2, 55) > 0.7 ? 0.12 : 0;
      const h = bevel * (0.75 + face * 0.25 - pits);
      const id = hash(ri, bi, 21);
      let c = mix(pick(pal, id), pick(pal, hash(ri, bi, 22)), 0.35);
      c = mul(c, 0.86 + face * 0.28);
      c = mix(mortar, c, sstep(0.0, 0.25, h));
      return { h, c: finish(c, h, px, py, S, mortar, 3) };
    },
    5,
  );
  cache.set(key, v);
  return v;
}

/** Rough cave rock, layered and stained. */
export function caveRock(S = 512) {
  const key = `cave${S}`;
  if (cache.has(key)) return cache.get(key)!;
  const a = hex('#7c7166'), b = hex('#5e554c'), ochre = hex('#8a7356'), dark = hex('#2e2924');
  const v = bake(
    S,
    (x, y) => {
      const n = fbm(x, y, S, 5, 6, 11);
      const strata = Math.sin((y / S) * Math.PI * 2 * 7 + fbm(x, y, S, 3, 3, 4) * 6) * 0.5 + 0.5;
      const cr = cells(x, y, S, 7, 1, 33);
      const crack = sstep(0, 4, cr.edge);
      const h = (n * 0.75 + strata * 0.25) * (0.6 + crack * 0.4);
      let c = mix(b, a, n);
      c = mix(c, ochre, sstep(0.55, 0.8, fbm(x, y, S, 4, 3, 66)) * 0.5);
      return { h, c: finish(c, h, x, y, S, dark, 5) };
    },
    8,
  );
  cache.set(key, v);
  return v;
}

// ---------------- floors (one tile = 4 x 4 squares) ----------------

/** Irregular flagstones laid close, about two feet across. */
function flagstones(S: number, pal: RGB[], grout: RGB, n: number, seed: number) {
  return bake(
    S,
    (x, y) => {
      const c0 = cells(x, y, S, n, 0.8, seed);
      const e = c0.edge + (fbm(x, y, S, 20, 2, seed) - 0.5) * 3;
      const bevel = sstep(0.8, 5, e);
      const face = fbm(x, y, S, 8, 4, seed + c0.id);
      const tilt = (hash(c0.id, 1, seed) - 0.5) * 0.12;
      const h = bevel * (0.78 + face * 0.18 + tilt);
      let c = mix(pick(pal, hash(c0.id, 0, seed)), pick(pal, hash(c0.id, 3, seed)), 0.3);
      c = mul(c, 0.84 + face * 0.3);
      // worn polish in the middle of stones, grime toward the edges
      c = mix(c, mul(c, 0.88), 1 - sstep(2, 10, e));
      c = mix(grout, c, sstep(0.0, 0.18, h));
      return { h, c: finish(c, h, x, y, S, grout, seed) };
    },
    5,
  );
}

/** Long slabs in offset rows. */
function slabs(S: number, pal: RGB[], grout: RGB, seed: number) {
  const rowsN = 8, rh = S / rowsN;
  return bake(
    S,
    (x, y) => {
      const r = Math.floor(y / rh);
      const off = hash(r, 0, seed) * S;
      const len = S / (2 + Math.floor(hash(r, 1, seed) * 2)); // 2 or 3 slabs per row
      const xx = (x + off) % S;
      const bi = Math.floor(xx / len);
      const ex = Math.min(xx - bi * len, (bi + 1) * len - xx), ey = Math.min(y - r * rh, (r + 1) * rh - y);
      const e = Math.min(ex, ey) + (fbm(x, y, S, 24, 2, seed + 1) - 0.5) * 3;
      const bevel = sstep(1.5, 6, e);
      const face = fbm(x, y, S, 10, 4, seed + r * 9 + bi);
      const crack = Math.abs(fbm(x, y, S, 6, 3, seed + 40) - 0.5) < 0.012 ? 0.25 : 0;
      const h = bevel * (0.8 + face * 0.2 - crack);
      let c = mul(pick(pal, hash(r, bi, seed + 2)), 0.84 + face * 0.3);
      c = mix(grout, c, sstep(0, 0.3, h));
      return { h, c: finish(c, h, x, y, S, grout, seed) };
    },
    5,
  );
}

/** Rounded cobbles, set in dirt. */
function cobbles(S: number, pal: RGB[], bed: RGB, seed: number) {
  return bake(
    S,
    (x, y) => {
      const c0 = cells(x, y, S, 22, 0.9, seed);
      const r = c0.edge;
      const dome = Math.sqrt(sstep(0, 9, r));
      const face = fbm(x, y, S, 24, 3, seed + c0.id);
      const h = dome * (0.85 + face * 0.15);
      let c = mul(pick(pal, hash(c0.id, 0, seed)), 0.8 + face * 0.3 + dome * 0.12);
      c = mix(bed, c, sstep(0.05, 0.35, h));
      return { h, c: finish(c, h, x, y, S, bed, seed) };
    },
    7,
  );
}

/** Packed earth or cave floor with grit and pebbles. */
function earth(S: number, a: RGB, b: RGB, peb: RGB, seed: number, pebbles = 0.5) {
  return bake(
    S,
    (x, y) => {
      const n = fbm(x, y, S, 6, 5, seed);
      const c0 = cells(x, y, S, 40, 1, seed + 5);
      const isPeb = hash(c0.id, 0, seed) < pebbles * 0.35;
      const p = isPeb ? sstep(0, 3, c0.edge) * sstep(6, 1, c0.d1) : 0;
      const h = n * 0.6 + p * 0.5;
      let c = mix(b, a, n);
      c = mix(c, mul(peb, 0.8 + hash(c0.id, 2, seed) * 0.4), Math.min(1, p * 1.4));
      return { h, c: finish(c, h + 0.3, x, y, S, mul(b, 0.6), seed) };
    },
    6,
  );
}

/** Boards running along x, each its own tone, with grain, nail holes and dark seams. */
function boards(S: number, pal: RGB[], seam: RGB, seed: number) {
  const n = 8, bw = S / n; // 2 boards per square
  return bake(
    S,
    (x, y) => {
      const r = Math.floor(y / bw);
      const len = S / 2;
      const off = hash(r, 0, seed) * len;
      const xx = (x + off) % S;
      const bi = Math.floor(xx / len);
      const ey = Math.min(y - r * bw, (r + 1) * bw - y), ex = Math.min(xx - bi * len, (bi + 1) * len - xx);
      const e = Math.min(ey, ex * 2);
      const edge = sstep(0.5, 3, e);
      const warp = fbm(x, y, S, 3, 3, seed + r) * 14;
      const grain = Math.sin(((y + warp) / bw) * Math.PI * 6 + x * 0.02) * 0.5 + 0.5;
      const knot = fbm(x, y, S, 18, 2, seed + r * 3) > 0.8 ? 1 : 0;
      const nail = (Math.abs(xx - bi * len - 10) < 2 || Math.abs(xx - (bi + 1) * len + 10) < 2) && Math.abs(y - (r + 0.5) * bw) < 2 ? 1 : 0;
      const h = edge * (0.8 + grain * 0.12 - knot * 0.1 - nail * 0.3);
      let c = mul(pick(pal, hash(r, bi, seed + 4)), 0.8 + grain * 0.25 - knot * 0.25);
      c = mix(seam, c, edge);
      if (nail) c = mul(c, 0.4);
      return { h, c: finish(c, h + 0.2, x, y, S, seam, seed) };
    },
    3,
  );
}

function grass(S: number, seed: number) {
  const a = hex('#5f7f39'), b = hex('#3f5a26'), dry = hex('#8a8a4a'), soil = hex('#4a3c2a');
  return bake(
    S,
    (x, y) => {
      const n = fbm(x, y, S, 8, 5, seed);
      const blade = fbm(x * 1.0, y * 0.35, S, 96, 2, seed + 3);
      const bare = sstep(0.68, 0.8, fbm(x, y, S, 4, 3, seed + 9));
      const h = blade * 0.7 + n * 0.3;
      let c = mix(b, a, blade);
      c = mix(c, dry, sstep(0.55, 0.75, n) * 0.4);
      c = mix(c, soil, bare * 0.85);
      return { h, c: mul(c, 0.85 + (hash(x, y, seed) - 0.5) * 0.25) };
    },
    4,
  );
}

const PAINTED: Record<string, (S: number) => { map: THREE.Texture; normal: THREE.Texture }> = {
  'stone-flagstone': (S) => flagstones(S, ['#8e8a82', '#7f7b74', '#99948a', '#857e73', '#76736e'].map(hex), hex('#3a352f'), 7, 3),
  'stone-flagstone-warm': (S) => flagstones(S, ['#a8957a', '#9a8569', '#b19f83', '#8f7c62', '#a38a6a'].map(hex), hex('#45392c'), 7, 8),
  'dungeon-slab': (S) => slabs(S, ['#6f6c66', '#66635e', '#7a766e', '#5f5c57'].map(hex), hex('#24211e'), 12),
  'stone-cobble': (S) => cobbles(S, ['#8a857c', '#7a756d', '#958d80', '#6d6962', '#83796c'].map(hex), hex('#3d342a'), 5),
  'cave-floor': (S) => earth(S, hex('#6e6458'), hex('#4f463d'), hex('#8a8075'), 14, 0.8),
  dirt: (S) => earth(S, hex('#7d6347'), hex('#5c4632'), hex('#8f8070'), 17, 0.5),
  mud: (S) => earth(S, hex('#5e4a35'), hex('#3e3022'), hex('#6a5a48'), 19, 0.2),
  'wood-planks': (S) => boards(S, ['#9a6b3e', '#8c5f36', '#a5784a', '#86593a', '#946540'].map(hex), hex('#2e1f12'), 23),
  'wood-planks-dark': (S) => boards(S, ['#5f4029', '#553823', '#6a4a30', '#4c3220'].map(hex), hex('#1a120b'), 29),
  grass: (S) => grass(S, 31),
};

/** A painted floor for this material id, or undefined to use the overhead picture. */
export function paintedFloor(id: string, S = 512) {
  const f = PAINTED[id];
  if (!f) return undefined;
  const key = `floor|${id}|${S}`;
  if (!cache.has(key)) cache.set(key, f(S));
  return cache.get(key)!;
}

export function disposePaint() {
  for (const v of cache.values()) {
    v.map.dispose();
    v.normal.dispose();
  }
  cache.clear();
}

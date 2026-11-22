// The ground of a map: floor pictures, soft blends between natural terrains, cliff edges, rock, rubble,
// pits and the shade at the foot of walls. It is baked into square chunks at a few levels of detail and
// cached, so a huge outdoor map draws as a handful of pictures per frame. Far out, a one-pixel-per-square
// overview picture stands in. Everything is in world space: CELL px per square.
import { type GameMap, cell } from '../engine/map';
import { terrainById } from '../library/terrain';

type G = CanvasRenderingContext2D;
type Img = CanvasImageSource & { width: number; height: number };
type Cv = HTMLCanvasElement;
export interface GroundArt {
  image(id: string): Img | undefined;
  squares(id: string): number;
}

/** Bake resolutions, in chunk pixels per square. */
const LODS = [12, 24, 48, 96];
const CHUNK_PX = 768;
const PAD = 2;
const BUDGET_BYTES = 110 * 1024 * 1024;
/** Below this many screen pixels per square, the overview picture is drawn instead of chunks. */
const OVERVIEW_BELOW = 7;

let makeCanvas: (w: number, h: number) => Cv = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};
export function setGroundCanvasFactory(f: (w: number, h: number) => unknown) {
  makeCanvas = f as (w: number, h: number) => Cv;
  cache.clear();
  bytes = 0;
  texCache.clear();
}

const THEME_FLOOR: Record<string, string> = { stone: 'stone-flagstone', cave: 'cave-floor', wood: 'wood-planks' };
const ROCK = '#181614', ROCK_CAVE = '#1a1714';

/** The ground picture a square shows. */
export function groundMat(m: GameMap, i: number, v: number): string {
  const mt = m.mats?.[i];
  if (v === 2) return mt && terrainById(mt)?.rule === 'water' ? mt : 'water-shallow';
  if (v === 4) return 'pit';
  if (v === 5 && !mt) return 'cliff';
  return mt || THEME_FLOOR[m.theme] || 'stone-flagstone';
}
export const groundColor = (mat: string) => terrainById(mat)?.color ?? '#8f8a80';

const hash = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

// --- world noise for ragged blend edges: a tileable 8 x 8 square field, sampled twice at skewed angles ---
const NP = 8, NR = 256;
const noiseField = (() => {
  const f = new Float32Array(NR * NR);
  const oct = (lat: number, w: number, seed: number) => {
    const step = NR / lat;
    for (let y = 0; y < NR; y++)
      for (let x = 0; x < NR; x++) {
        const gx = x / step, gy = y / step;
        const x0 = Math.floor(gx), y0 = Math.floor(gy);
        const tx = gx - x0, ty = gy - y0;
        const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
        const v = (a: number, b: number) => hash(((x0 + a) % lat) + seed, ((y0 + b) % lat) + seed * 7);
        const top = v(0, 0) + (v(1, 0) - v(0, 0)) * sx, bot = v(0, 1) + (v(1, 1) - v(0, 1)) * sx;
        f[y * NR + x] += (top + (bot - top) * sy) * w;
      }
  };
  oct(NP, 0.55, 11);
  oct(NP * 2, 0.3, 23);
  oct(NP * 4, 0.15, 37);
  let lo = 1, hi = 0;
  for (const v of f) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  for (let i = 0; i < f.length; i++) f[i] = (f[i] - lo) / (hi - lo);
  return f;
})();
function field(wx: number, wy: number) {
  let u = ((wx / NP) % 1) * NR, v = ((wy / NP) % 1) * NR;
  if (u < 0) u += NR;
  if (v < 0) v += NR;
  const x0 = u | 0, y0 = v | 0, fx = u - x0, fy = v - y0;
  const x1 = (x0 + 1) & (NR - 1), y1 = (y0 + 1) & (NR - 1);
  const a = noiseField[y0 * NR + x0], b = noiseField[y0 * NR + x1], c = noiseField[y1 * NR + x0], d = noiseField[y1 * NR + x1];
  return a + (b - a) * fx + (c - a + (d - c - b + a) * fx) * fy;
}
/** Smooth world noise in 0..1, about one bump per square. */
export function groundNoise(wx: number, wy: number) {
  const n = 0.6 * field(wx, wy) + 0.4 * field(wx * 0.61 + wy * 0.37 + 3.1, -wx * 0.37 + wy * 0.61 + 7.7);
  return Math.min(1, Math.max(0, (n - 0.5) * 1.7 + 0.5));
}

// --- each ground picture pre-scaled to a bake resolution, so drawing a square is a 1:1 copy ---
const texCache = new Map<string, { src: Img; c: Cv; sq: number }>();
function tex(art: GroundArt, mat: string, rpx: number) {
  const img = art.image(mat);
  if (!img) return undefined;
  const key = `${mat}:${rpx}`;
  const hit = texCache.get(key);
  if (hit && hit.src === img) return hit;
  const sq = art.squares(mat);
  const size = sq * rpx;
  let src: Img = img;
  // halve in steps so small bakes stay crisp instead of aliased
  let w = img.width;
  while (w / 2 >= size * 1.5) {
    const half = makeCanvas(Math.round(w / 2), Math.round(w / 2));
    const hg = half.getContext('2d')!;
    hg.imageSmoothingEnabled = true;
    hg.drawImage(src, 0, 0, half.width, half.height);
    src = half;
    w = half.width;
  }
  const c = makeCanvas(size, size);
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = true;
  g.drawImage(src, 0, 0, size, size);
  const out = { src: img, c, sq };
  texCache.set(key, out);
  return out;
}

// --- chunk signatures: what a chunk shows depends on its squares and two squares around them ---
const interned = new Map<string, number>();
const idOf = (s: string) => {
  let k = interned.get(s);
  if (k === undefined) interned.set(s, (k = interned.size + 1));
  return k;
};
interface Memo { mats: string[] | undefined; sigs: Map<string, { sig: number; used: string[] }> }
const memos = new WeakMap<number[], Memo>();
function chunkSig(m: GameMap, cx0: number, cy0: number, nx: number, ny: number, key: string) {
  let memo = memos.get(m.cells);
  if (!memo || memo.mats !== m.mats) memos.set(m.cells, (memo = { mats: m.mats, sigs: new Map() }));
  const hit = memo.sigs.get(key);
  if (hit) return hit;
  let h = 2166136261 ^ m.cols ^ (m.rows << 12) ^ idOf(m.theme) ^ (idOf(m.wallStyle ?? '') << 7);
  const used = new Set<string>();
  for (let y = cy0 - PAD; y < cy0 + ny + PAD; y++)
    for (let x = cx0 - PAD; x < cx0 + nx + PAD; x++) {
      const inb = x >= 0 && y >= 0 && x < m.cols && y < m.rows;
      const i = y * m.cols + x;
      const v = inb ? m.cells[i] : -2;
      let k = v + 7;
      if (v > 0) {
        const mat = groundMat(m, i, v);
        used.add(mat);
        k = k * 131 + idOf(mat);
      }
      h = Math.imul(h ^ k, 16777619);
    }
  const out = { sig: h >>> 0, used: [...used] };
  memo.sigs.set(key, out);
  return out;
}

interface Chunk { sig: number; c: Cv; bytes: number }
const cache = new Map<string, Chunk>();
let bytes = 0;
function remember(key: string, ch: Chunk) {
  const old = cache.get(key);
  if (old) { bytes -= old.bytes; cache.delete(key); }
  cache.set(key, ch);
  bytes += ch.bytes;
  for (const [k, v] of cache) {
    if (bytes <= BUDGET_BYTES) break;
    if (k === key) continue;
    cache.delete(k);
    bytes -= v.bytes;
  }
}
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// --- the overview: one pixel per square, smoothed when drawn ---
const overviews = new WeakMap<number[], { mats: string[] | undefined; theme: string; c: Cv }>();
function overview(m: GameMap) {
  const hit = overviews.get(m.cells);
  if (hit && hit.mats === m.mats && hit.theme === m.theme) return hit.c;
  const c = hit && hit.c.width === m.cols && hit.c.height === m.rows ? hit.c : makeCanvas(m.cols, m.rows);
  const g = c.getContext('2d')!;
  const im = g.createImageData(m.cols, m.rows);
  const rgb = new Map<string, number[]>();
  const col = (hex: string) => {
    let v = rgb.get(hex);
    if (!v) {
      const n = parseInt(hex.slice(1), 16);
      rgb.set(hex, (v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]));
    }
    return v;
  };
  const rock = col(m.theme === 'cave' ? ROCK_CAVE : ROCK);
  for (let i = 0; i < m.cells.length; i++) {
    const v = m.cells[i];
    if (v === -1) continue;
    const [r, gg, b] = v === 0 ? rock : col(groundColor(groundMat(m, i, v)));
    const j = (v === 0 ? 0 : (hash(i % m.cols, (i / m.cols) | 0) - 0.5) * 14) | 0;
    im.data[i * 4] = r + j;
    im.data[i * 4 + 1] = gg + j;
    im.data[i * 4 + 2] = b + j;
    im.data[i * 4 + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  overviews.set(m.cells, { mats: m.mats, theme: m.theme, c });
  return c;
}

let pending = false;
/** True when the last ground draw left chunks unbaked, so another frame should follow soon. */
export const groundPending = () => pending;

/**
 * Draws the ground of the squares in view. `scale` is screen pixels per world pixel.
 * Returns true when some chunks still need baking (draw again next frame).
 */
export function drawGround(g: G, m: GameMap, art: GroundArt | undefined, scale: number, view: { x0: number; y0: number; x1: number; y1: number }, CELL: number): boolean {
  const spc = CELL * scale;
  const ov = overview(m);
  pending = false;
  if (spc < OVERVIEW_BELOW || !art) {
    g.save();
    g.imageSmoothingEnabled = spc < 3;
    g.drawImage(ov, 0, 0, m.cols, m.rows, 0, 0, m.cols * CELL, m.rows * CELL);
    g.restore();
    return false;
  }
  const rpx = LODS.find((l) => l >= spc * 0.85) ?? LODS[LODS.length - 1];
  const n = CHUNK_PX / rpx;
  const t0 = now();
  const firstFrame = cache.size === 0;
  const budget = firstFrame ? 60 : 18;
  const kx0 = Math.floor(view.x0 / n), ky0 = Math.floor(view.y0 / n);
  const kx1 = Math.ceil(view.x1 / n), ky1 = Math.ceil(view.y1 / n);
  const cx = (kx0 + kx1) / 2, cy = (ky0 + ky1) / 2;
  const list: [number, number][] = [];
  for (let ky = ky0; ky < ky1; ky++) for (let kx = kx0; kx < kx1; kx++) list.push([kx, ky]);
  // bake from the middle of the screen outward
  list.sort((a, b) => Math.hypot(a[0] + 0.5 - cx, a[1] + 0.5 - cy) - Math.hypot(b[0] + 0.5 - cx, b[1] + 0.5 - cy));
  const s = CELL / rpx;
  for (const [kx, ky] of list) {
    const x0 = kx * n, y0 = ky * n;
    const nx = Math.min(n, m.cols - x0), ny = Math.min(n, m.rows - y0);
    if (nx <= 0 || ny <= 0) continue;
    const key = `${m.id}:${rpx}:${kx}:${ky}`;
    const { sig: base, used } = chunkSig(m, x0, y0, nx, ny, key);
    let sig = base;
    for (const u of used) sig = Math.imul(sig ^ (art.image(u) ? 1 : 2), 16777619) >>> 0;
    let ch = cache.get(key);
    if (!ch || ch.sig !== sig) {
      if (now() - t0 > budget) {
        pending = true;
        if (ch) {
          g.drawImage(ch.c, x0 * CELL - PAD * s, y0 * CELL - PAD * s, ch.c.width * s, ch.c.height * s); // stale but close
        } else {
          g.save();
          g.beginPath();
          g.rect(x0 * CELL, y0 * CELL, nx * CELL, ny * CELL);
          g.clip();
          g.imageSmoothingEnabled = true;
          g.drawImage(ov, x0 - 1, y0 - 1, nx + 2, ny + 2, (x0 - 1) * CELL, (y0 - 1) * CELL, (nx + 2) * CELL, (ny + 2) * CELL);
          g.restore();
        }
        continue;
      }
      const c = ch && ch.c.width === nx * rpx + PAD * 2 && ch.c.height === ny * rpx + PAD * 2 ? ch.c : makeCanvas(nx * rpx + PAD * 2, ny * rpx + PAD * 2);
      bake(c, m, art, x0, y0, nx, ny, rpx);
      ch = { sig, c, bytes: c.width * c.height * 4 };
      remember(key, ch);
    } else {
      cache.delete(key);
      cache.set(key, ch); // most recently used
    }
    g.drawImage(ch.c, x0 * CELL - PAD * s, y0 * CELL - PAD * s, ch.c.width * s, ch.c.height * s);
  }
  return pending;
}

// ---------------------------------------------------------------------------------------------------------
// baking one chunk

let scratch: { c: Cv; tmp: Cv; mask: Cv; w: number; h: number } | null = null;
function scratchFor(w: number, h: number) {
  if (!scratch || scratch.w < w || scratch.h < h) {
    const W = Math.max(w, scratch?.w ?? 0), H = Math.max(h, scratch?.h ?? 0);
    scratch = { c: makeCanvas(W, H), tmp: makeCanvas(W, H), mask: makeCanvas(W, H), w: W, h: H };
  }
  return scratch;
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

function bake(c: Cv, m: GameMap, art: GroundArt, x0: number, y0: number, nx: number, ny: number, rpx: number) {
  const g = c.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, c.width, c.height);
  g.imageSmoothingEnabled = true;
  // chunk pixel of square (x, y): ((x - x0) * rpx + PAD)
  const X = (x: number) => (x - x0) * rpx + PAD;
  const Y = (y: number) => (y - y0) * rpx + PAD;
  // squares drawn: the chunk plus one around it, for the overlap that hides seams
  const bx0 = Math.max(0, x0 - 1), by0 = Math.max(0, y0 - 1);
  const bx1 = Math.min(m.cols, x0 + nx + 1), by1 = Math.min(m.rows, y0 + ny + 1);
  const W = m.cols;
  const k = rpx / 48;
  const cave = m.wallStyle === 'cave' || m.theme === 'cave';

  // 1. every square's own ground
  for (let y = by0; y < by1; y++)
    for (let x = bx0; x < bx1; x++) {
      const i = y * W + x;
      const v = m.cells[i];
      if (v === -1) continue;
      const px = X(x), py = Y(y);
      if (v === 0) {
        g.fillStyle = cave ? ROCK_CAVE : ROCK;
        g.fillRect(px, py, rpx, rpx);
        const h = hash(x, y);
        if (h > 0.55) {
          g.fillStyle = 'rgba(255,255,255,0.035)';
          g.fillRect(px + hash(y, x) * 30 * k, py + hash(x + 3, y) * 30 * k, (8 + h * 8) * k, 5 * k);
        }
        continue;
      }
      const mat = groundMat(m, i, v);
      const t = tex(art, mat, rpx);
      if (t) {
        g.drawImage(t.c, (x % t.sq) * rpx, (y % t.sq) * rpx, rpx, rpx, px, py, rpx, rpx);
      } else {
        g.fillStyle = groundColor(mat);
        g.fillRect(px, py, rpx, rpx);
      }
    }

  // 2. natural grounds spread softly over lower ones
  blendNatural(g, m, art, bx0, by0, bx1, by1, rpx, X, Y);

  // 2b. broad light and dark patches over natural ground, so repeating pictures don't show their pattern
  tintNatural(g, m, bx0, by0, bx1, by1, rpx, X, Y);

  // 3. cliffs: a rocky lip, a face on the south side and shade on the low ground
  drawCliffs(g, m, bx0, by0, bx1, by1, rpx, X, Y);

  // 4. rubble, pits, and the soft shade along the foot of walls
  for (let y = by0; y < by1; y++)
    for (let x = bx0; x < bx1; x++) {
      const i = y * W + x;
      const v = m.cells[i];
      if (v <= 0) continue;
      const px = X(x), py = Y(y);
      if (v === 3 && terrainById(groundMat(m, i, v))?.rule !== 'difficult') {
        for (let q = 0; q < 7; q++) {
          const rx = px + (5 + hash(x * 3 + q, y) * 38) * k, ry = py + (5 + hash(x, y * 3 + q) * 38) * k, rr = (2.5 + hash(q, x + y) * 4.5) * k;
          g.fillStyle = 'rgba(0,0,0,0.35)';
          g.beginPath();
          g.ellipse(rx + 1.2 * k, ry + 1.6 * k, rr, rr * 0.8, 0, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = q % 2 ? '#7d7266' : '#958a7c';
          g.beginPath();
          g.ellipse(rx, ry, rr, rr * 0.8, hash(q, y) * 3, 0, Math.PI * 2);
          g.fill();
        }
      } else if (v === 4) {
        const grd = g.createRadialGradient(px + rpx / 2, py + rpx / 2, 2 * k, px + rpx / 2, py + rpx / 2, rpx * 0.6);
        grd.addColorStop(0, 'rgba(0,0,0,0.95)');
        grd.addColorStop(1, 'rgba(0,0,0,0.3)');
        g.fillStyle = grd;
        g.fillRect(px, py, rpx, rpx);
      }
      const sides: [number, number, number, number, number, number][] = [
        [0, -1, px, py, rpx, 9 * k], [-1, 0, px, py, 9 * k, rpx], [1, 0, px + rpx - 6 * k, py, 6 * k, rpx], [0, 1, px, py + rpx - 5 * k, rpx, 5 * k],
      ];
      for (const [dx, dy, rx, ry, rw, rh] of sides) {
        if (cell(m, x + dx, y + dy) !== 0) continue;
        // the map's own border isn't a wall on open ground
        if (!(x + dx >= 0 && y + dy >= 0 && x + dx < m.cols && y + dy < m.rows) && terrainById(groundMat(m, i, v))?.z) continue;
        const grd = dx === 0
          ? g.createLinearGradient(0, dy < 0 ? ry : ry + rh, 0, dy < 0 ? ry + rh : ry)
          : g.createLinearGradient(dx < 0 ? rx : rx + rw, 0, dx < 0 ? rx + rw : rx, 0);
        grd.addColorStop(0, 'rgba(0,0,0,0.42)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        g.fillRect(rx, ry, rw, rh);
      }
    }
}

function tintNatural(g: G, m: GameMap, bx0: number, by0: number, bx1: number, by1: number, rpx: number, X: (x: number) => number, Y: (y: number) => number) {
  const P = 4; // tint pixels per square
  const tw = (bx1 - bx0) * P, th = (by1 - by0) * P;
  const sc = scratchFor((bx1 - bx0) * rpx + 4, (by1 - by0) * rpx + 4);
  const mg = sc.mask.getContext('2d')!;
  const im = mg.createImageData(tw, th);
  const d = im.data;
  let any = false;
  for (let y = by0; y < by1; y++)
    for (let x = bx0; x < bx1; x++) {
      const i = y * m.cols + x, v = m.cells[i];
      if (v <= 0) continue;
      const t = terrainById(groundMat(m, i, v));
      if (t?.z === undefined || t.rule === 'water') continue;
      any = true;
      const n0 = parseInt(t.color.slice(1), 16);
      const lum = ((n0 >> 16) & 255) * 0.3 + ((n0 >> 8) & 255) * 0.59 + (n0 & 255) * 0.11;
      const dk = lum > 170 ? 0.35 : lum > 130 ? 0.7 : 1;
      for (let yy = 0; yy < P; yy++)
        for (let xx = 0; xx < P; xx++) {
          const wx = x + (xx + 0.5) / P, wy = y + (yy + 0.5) / P;
          const n = (groundNoise(wx / 4.2 + 17, wy / 4.2 + 3) - 0.5) * 0.7 + (groundNoise(wx / 1.7 + 5, wy / 1.7 + 41) - 0.5) * 0.3;
          const j = (((y - by0) * P + yy) * tw + (x - bx0) * P + xx) * 4;
          const c = n > 0 ? 255 : 0;
          d[j] = c; d[j + 1] = n > 0 ? 246 : 8; d[j + 2] = n > 0 ? 210 : 0;
          d[j + 3] = Math.min(255, Math.abs(n) * (n > 0 ? 100 : 230 * dk));
        }
    }
  if (!any) return;
  mg.setTransform(1, 0, 0, 1, 0, 0);
  mg.clearRect(0, 0, sc.w, sc.h);
  mg.putImageData(im, 0, 0);
  g.imageSmoothingEnabled = true;
  g.drawImage(sc.mask, 0, 0, tw, th, X(bx0), Y(by0), (bx1 - bx0) * rpx, (by1 - by0) * rpx);
}

const N8: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];

function blendNatural(g: G, m: GameMap, art: GroundArt, bx0: number, by0: number, bx1: number, by1: number, rpx: number, X: (x: number) => number, Y: (y: number) => number) {
  const W = m.cols;
  const matAt = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= m.cols || y >= m.rows) return '';
    const v = m.cells[y * W + x];
    return v > 0 ? groundMat(m, y * W + x, v) : '';
  };
  // which higher ground spreads into which square
  const targets = new Map<string, { x: number; y: number; nb: number }[]>();
  for (let y = by0; y < by1; y++)
    for (let x = bx0; x < bx1; x++) {
      const own = matAt(x, y);
      const oz = own ? terrainById(own)?.z : undefined;
      if (oz === undefined) continue;
      const seen = new Map<string, number>();
      for (let d = 0; d < 8; d++) {
        const nm = matAt(x + N8[d][0], y + N8[d][1]);
        if (!nm || nm === own) continue;
        const nz = terrainById(nm)?.z;
        if (nz === undefined || nz <= oz) continue;
        seen.set(nm, (seen.get(nm) ?? 0) | (1 << d));
      }
      for (const [nm, nb] of seen) {
        let list = targets.get(nm);
        if (!list) targets.set(nm, (list = []));
        list.push({ x, y, nb });
      }
    }
  if (!targets.size) return;
  const order = [...targets.keys()].sort((a, b) => (terrainById(a)!.z ?? 0) - (terrainById(b)!.z ?? 0));
  const w = (bx1 - bx0) * rpx, h = (by1 - by0) * rpx;
  const sc = scratchFor(w + 4, h + 4);
  const ms = rpx >= 48 ? 0.5 : 1; // mask at half resolution when large: the soft edge hides it
  const mpx = Math.round(rpx * ms);
  const mw = Math.ceil((bx1 - bx0) * mpx), mh = Math.ceil((by1 - by0) * mpx);
  const mg = sc.mask.getContext('2d')!;
  const tg = sc.tmp.getContext('2d')!;
  const soft = Math.max(0.07, 1.4 / mpx);
  for (const mat of order) {
    const list = targets.get(mat)!;
    const tz = terrainById(mat)!;
    const into = (x: number, y: number) => terrainById(matAt(x, y));
    const ox = X(bx0), oy = Y(by0);
    // the spreading ground, drawn over each target square
    tg.setTransform(1, 0, 0, 1, 0, 0);
    tg.globalCompositeOperation = 'source-over';
    tg.clearRect(0, 0, w + 4, h + 4);
    const t = tex(art, mat, rpx);
    for (const q of list) {
      const px = X(q.x) - ox, py = Y(q.y) - oy;
      if (t) tg.drawImage(t.c, (q.x % t.sq) * rpx, (q.y % t.sq) * rpx, rpx, rpx, px, py, rpx, rpx);
      else { tg.fillStyle = tz.color; tg.fillRect(px, py, rpx, rpx); }
    }
    // the ragged mask: full at the shared edge, fading out a noisy distance into the square
    const im = mg.createImageData(mw, mh);
    const d8 = im.data;
    let foam: ImageData | null = null;
    for (const q of list) {
      const own = into(q.x, q.y);
      const water = own?.rule === 'water' && tz.rule !== 'water';
      const sp = tz.spread ?? 1;
      const base = (water ? 0.14 : 0.18) * sp, span = (water ? 0.55 : 0.6) * sp;
      const L = q.nb & 1, R = q.nb & 2, U = q.nb & 4, D = q.nb & 8, UL = q.nb & 16, UR = q.nb & 32, DL = q.nb & 64, DR = q.nb & 128;
      const mx0 = (q.x - bx0) * mpx, my0 = (q.y - by0) * mpx;
      if (water && own?.shore && !foam) foam = mg.createImageData(mw, mh);
      for (let py = 0; py < mpx; py++) {
        const ly = (py + 0.5) / mpx;
        for (let px = 0; px < mpx; px++) {
          const lx = (px + 0.5) / mpx;
          let d = 9;
          if (L && lx < d) d = lx;
          if (R && 1 - lx < d) d = 1 - lx;
          if (U && ly < d) d = ly;
          if (D && 1 - ly < d) d = 1 - ly;
          if (UL) d = Math.min(d, Math.hypot(lx, ly));
          if (UR) d = Math.min(d, Math.hypot(1 - lx, ly));
          if (DL) d = Math.min(d, Math.hypot(lx, 1 - ly));
          if (DR) d = Math.min(d, Math.hypot(1 - lx, 1 - ly));
          if (d > base + span + soft) continue;
          const n = groundNoise(q.x + lx, q.y + ly);
          const edge = base + span * n;
          const a = 1 - smooth(edge - soft, edge + soft, d);
          const j = ((my0 + py) * mw + mx0 + px) * 4;
          const av = a * 255;
          if (av > d8[j + 3]) d8[j + 3] = av;
          if (foam && own?.shore) {
            const f = Math.exp(-(((d - edge - 0.06) / 0.045) ** 2)) * (0.35 + 0.35 * n) * 255;
            if (f > foam.data[j + 3]) { foam.data[j] = 236; foam.data[j + 1] = 244; foam.data[j + 2] = 240; foam.data[j + 3] = f; }
          }
        }
      }
    }
    mg.setTransform(1, 0, 0, 1, 0, 0);
    mg.clearRect(0, 0, sc.w, sc.h);
    mg.putImageData(im, 0, 0);
    tg.globalCompositeOperation = 'destination-in';
    tg.imageSmoothingEnabled = true;
    tg.drawImage(sc.mask, 0, 0, mw, mh, 0, 0, w, h);
    tg.globalCompositeOperation = 'source-over';
    g.drawImage(sc.tmp, 0, 0, w, h, ox, oy, w, h);
    if (foam) {
      mg.clearRect(0, 0, sc.w, sc.h);
      mg.putImageData(foam, 0, 0);
      g.imageSmoothingEnabled = true;
      g.drawImage(sc.mask, 0, 0, mw, mh, ox, oy, w, h);
    }
  }
}

function drawCliffs(g: G, m: GameMap, bx0: number, by0: number, bx1: number, by1: number, rpx: number, X: (x: number) => number, Y: (y: number) => number) {
  const isCliff = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= m.cols || y >= m.rows) return false;
    const i = y * m.cols + x, v = m.cells[i];
    return v > 0 && (v === 5 || !!terrainById(groundMat(m, i, v))?.cliff);
  };
  const open = (x: number, y: number) => x >= 0 && y >= 0 && x < m.cols && y < m.rows && m.cells[y * m.cols + x] > 0 && !isCliff(x, y);
  const k = rpx / 48;
  // look one square further out: a cliff just outside the chunk still shades into it
  const ax0 = Math.max(0, bx0 - 1), ay0 = Math.max(0, by0 - 1), ax1 = Math.min(m.cols, bx1 + 1), ay1 = Math.min(m.rows, by1 + 1);
  const jag = (wx: number, wy: number) => (hash(wx * 4 + 1, wy * 4 + 7) - 0.5) * 0.16;
  const faces: [number, number, number, number][] = []; // south faces
  const rims: number[][] = [];
  for (let y = ay0; y < ay1; y++)
    for (let x = ax0; x < ax1; x++) {
      if (!isCliff(x, y)) continue;
      const px = X(x), py = Y(y);
      // shade on the low ground: deep below (south), lighter east, faint north and west
      const shade: [number, number, number, number, number, number, number][] = [
        [0, 1, px, py + rpx, rpx, rpx * 0.85, 0.62], [1, 0, px + rpx, py, rpx * 0.45, rpx, 0.4], [-1, 0, px - rpx * 0.22, py, rpx * 0.22, rpx, 0.18], [0, -1, px, py - rpx * 0.2, rpx, rpx * 0.2, 0.16],
      ];
      for (const [dx, dy, rx, ry, rw, rh, a] of shade) {
        if (!open(x + dx, y + dy)) continue;
        const grd = dx === 0
          ? g.createLinearGradient(0, dy > 0 ? ry : ry + rh, 0, dy > 0 ? ry + rh : ry)
          : g.createLinearGradient(dx > 0 ? rx : rx + rw, 0, dx > 0 ? rx + rw : rx, 0);
        grd.addColorStop(0, `rgba(10,8,6,${a})`);
        grd.addColorStop(1, 'rgba(10,8,6,0)');
        g.fillStyle = grd;
        g.fillRect(rx, ry, rw, rh);
        if (dy > 0) faces.push([x, y, px, py]);
      }
      // the ragged lip along every open side
      const sides: [number, number, number, number, number, number][] = [
        [0, -1, x, y, x + 1, y], [0, 1, x, y + 1, x + 1, y + 1], [-1, 0, x, y, x, y + 1], [1, 0, x + 1, y, x + 1, y + 1],
      ];
      for (const [dx, dy, wx0, wy0, wx1, wy1] of sides) {
        if (!open(x + dx, y + dy)) continue;
        const pts: number[] = [];
        for (let s = 0; s <= 4; s++) {
          const wx = wx0 + ((wx1 - wx0) * s) / 4, wy = wy0 + ((wy1 - wy0) * s) / 4;
          const j = s === 0 || s === 4 ? 0 : jag(wx, wy);
          pts.push(X(wx) + (dy ? 0 : j * rpx), Y(wy) + (dx ? 0 : j * rpx));
        }
        rims.push(pts);
      }
    }
  // south faces: a band of rock wall seen from above, with a few cracks
  for (const [x, , px, py] of faces) {
    const fh = rpx * 0.42;
    const grd = g.createLinearGradient(0, py + rpx, 0, py + rpx + fh);
    grd.addColorStop(0, '#6a645b');
    grd.addColorStop(0.35, '#4a453f');
    grd.addColorStop(1, '#25221f');
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(px, py + rpx);
    for (let s = 0; s <= 6; s++) g.lineTo(px + (rpx * s) / 6, py + rpx + fh * (0.75 + hash(x * 6 + s, 91) * 0.4));
    g.lineTo(px + rpx, py + rpx);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(15,12,10,0.55)';
    g.lineWidth = Math.max(0.8, 1.2 * k);
    g.beginPath();
    for (let s = 0; s < 4; s++) {
      const cx = px + rpx * (0.12 + hash(x * 4 + s, 17) * 0.76);
      g.moveTo(cx, py + rpx + 1);
      g.lineTo(cx + (hash(s, x) - 0.5) * 4 * k, py + rpx + fh * (0.5 + hash(x, s) * 0.4));
    }
    g.stroke();
  }
  if (!rims.length) return;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.strokeStyle = 'rgba(18,14,11,0.9)';
  g.lineWidth = Math.max(1, 2.4 * k);
  g.beginPath();
  for (const p of rims) {
    g.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]);
  }
  g.stroke();
  g.strokeStyle = 'rgba(240,226,200,0.22)';
  g.lineWidth = Math.max(0.6, 1.2 * k);
  g.beginPath();
  for (const p of rims) {
    g.moveTo(p[0] + k, p[1] + k);
    for (let i = 2; i < p.length; i += 2) g.lineTo(p[i] + k, p[i + 1] + k);
  }
  g.stroke();
}

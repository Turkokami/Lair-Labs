// The GM's outdoor brushes: paint ground, scatter things, and clear things. Paths (roads and rivers)
// live in outdoor.ts next to the map maker, which they share their carving code with.
import { type GameMap, type Prop, pid } from './map';
import { RULE_CELL, terrainById } from '../library/terrain';
import { objectById } from '../library/objects';

// ---------- small seeded helpers ----------

function hash(x: number, y: number, s: number) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** Smooth value noise in 0..1 with features about `sc` squares wide. */
function vnoise(x: number, y: number, sc: number, s: number) {
  const fx = x / sc, fy = y / sc, ix = Math.floor(fx), iy = Math.floor(fy);
  const tx = fx - ix, ty = fy - iy, ux = tx * tx * (3 - 2 * tx), uy = ty * ty * (3 - 2 * ty);
  const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The squares a round brush covers at a point, with a slightly ragged edge so strokes look hand-painted. */
export function brushDisc(gx: number, gy: number, size: number, cols: number, rows: number): [number, number][] {
  const out: [number, number][] = [];
  if (size <= 1) {
    const x = Math.floor(gx), y = Math.floor(gy);
    return x >= 0 && y >= 0 && x < cols && y < rows ? [[x, y]] : [];
  }
  const r = size / 2, R = Math.ceil(r + 1);
  for (let y = Math.floor(gy - R); y <= gy + R; y++)
    for (let x = Math.floor(gx - R); x <= gx + R; x++) {
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
      const d = Math.hypot(x + 0.5 - gx, y + 0.5 - gy);
      if (d <= r * (0.82 + 0.3 * hash(x, y, 91))) out.push([x, y]);
    }
  return out;
}

// ---------- paint ground ----------

/** Grounds that mix with close cousins when "natural mix" is on, so a big painted area isn't one repeated picture. */
export const GROUND_MIX: Record<string, string[]> = {
  grass: ['grass', 'grass-lush', 'meadow'],
  'grass-lush': ['grass-lush', 'grass', 'meadow'],
  meadow: ['meadow', 'grass', 'grass-lush'],
  'grass-dry': ['grass-dry', 'grass', 'dirt'],
  'forest-floor': ['forest-floor', 'forest-floor', 'moss'],
  sand: ['sand', 'sand', 'desert-cracked'],
  'desert-cracked': ['desert-cracked', 'sand'],
  'beach-sand': ['beach-sand', 'sand'],
  dirt: ['dirt', 'rocky-ground', 'grass-dry'],
  'rocky-ground': ['rocky-ground', 'gravel', 'dirt'],
  gravel: ['gravel', 'rocky-ground'],
  snow: ['snow', 'snow', 'tundra'],
  tundra: ['tundra', 'snow', 'grass-dry'],
  mud: ['mud', 'bog'],
  'jungle-floor': ['jungle-floor', 'jungle-floor', 'forest-floor'],
  'fungal-ground': ['fungal-ground', 'fungal-ground', 'mycelium'],
  mycelium: ['mycelium', 'fungal-ground'],
  'glow-moss': ['glow-moss', 'fungal-ground'],
  ash: ['ash', 'rocky-ground'],
};

/** Paint squares with a ground. Each square takes the ground's rule (water, difficult...) as well as its look. */
export function paintGround(map: GameMap, cells: [number, number][], id: string, mix = false, seed = 1): GameMap {
  if (!terrainById(id)) return map;
  const mats = map.mats ? [...map.mats] : new Array(map.cols * map.rows).fill('');
  const out = [...map.cells];
  const family = mix ? GROUND_MIX[id] : undefined;
  for (const [x, y] of cells) {
    if (x < 0 || y < 0 || x >= map.cols || y >= map.rows) continue;
    const i = y * map.cols + x;
    let pick = id;
    if (family) {
      const n = vnoise(x, y, 5, seed) * 0.75 + hash(x, y, seed + 7) * 0.25;
      pick = family[Math.min(family.length - 1, Math.floor(n * family.length))];
    }
    const t = terrainById(pick)!;
    mats[i] = pick;
    out[i] = RULE_CELL[t.rule];
  }
  return { ...map, cells: out, mats };
}

// ---------- scatter ----------

export type ScatterKind = [kind: string, weight: number, variants?: number[]];
export interface ScatterSet { id: string; name: string; kinds: ScatterKind[] }

export const SCATTER_SETS: ScatterSet[] = [
  { id: 'woods', name: 'Woodland', kinds: [['tree-oak', 5], ['tree-pine', 3], ['tree-birch', 2], ['tree-cluster', 1], ['bush', 3], ['ferns', 2]] },
  { id: 'pines', name: 'Pine forest', kinds: [['tree-pine', 7], ['boulder', 1], ['ferns', 1], ['log-fallen', 0.5]] },
  { id: 'jungle', name: 'Jungle', kinds: [['tree-jungle', 6], ['tree-emergent', 0.3], ['tree-palm', 2], ['plant-broadleaf', 4], ['ferns', 3], ['vines-hanging', 1]] },
  { id: 'alien', name: 'Alien fungus', kinds: [['fungus-tower', 3], ['mushroom-giant', 3, [2, 3]], ['tree-alien', 2], ['glow-pods', 3], ['glowing-fungus', 2], ['tendrils', 2], ['spore-vent', 1], ['crystal-spire', 1]] },
  { id: 'swamp', name: 'Swamp', kinds: [['tree-swamp', 3], ['tree-willow', 1], ['tree-dead', 1], ['reeds', 4], ['lily-pads', 2], ['log-fallen', 1]] },
  { id: 'desert', name: 'Desert', kinds: [['cactus', 4], ['desert-rocks', 3], ['boulder', 1, [1]], ['thorn-bush', 1, [2]], ['skull-bleached', 0.3]] },
  { id: 'snow', name: 'Snowy', kinds: [['tree-fir-snow', 5], ['boulder', 2], ['tree-dead', 1]] },
  { id: 'rocks', name: 'Rocks', kinds: [['boulder', 4], ['boulder-large', 1], ['rock-outcrop', 0.5], ['desert-rocks', 1]] },
  { id: 'flowers', name: 'Flowers & grass', kinds: [['flowers', 3], ['grass-tall', 3], ['bush', 2], ['mushrooms', 1]] },
];

/** Things that grow in water; everything else needs dry, open ground. */
const IN_WATER = new Set(['reeds', 'lily-pads']);

export const SCATTER_DENSITY = { sparse: 0.07, some: 0.18, thick: 0.4 } as const;
export type ScatterDensity = keyof typeof SCATTER_DENSITY;

/**
 * Drop things over the brushed squares with random picks, variants, turns and sizes. Trees only claim
 * their trunk, so canopies can overlap like a real wood; other things don't land on top of each other.
 */
export function scatterProps(map: GameMap, cells: [number, number][], kinds: ScatterKind[], density: number, seed: number, vary = true): GameMap {
  const live = kinds.filter(([k]) => objectById(k));
  if (!live.length || !cells.length) return map;
  const r = rng(seed);
  const { cols, rows } = map;
  const occ = new Uint8Array(cols * rows);
  const claim = (p: { kind: string; x: number; y: number; rot: number }) => {
    const d = objectById(p.kind);
    if (!d || d.layer === 'floor') return;
    const [w, h] = p.rot % 180 ? [d.h, d.w] : [d.w, d.h];
    if (d.layer === 'overhead') {
      const cx = p.x + Math.floor(w / 2), cy = p.y + Math.floor(h / 2), rr = Math.max(0, Math.floor(Math.min(w, h) / 2) - 0);
      for (let j = -rr; j <= rr; j++) for (let i = -rr; i <= rr; i++) { const X = cx + i, Y = cy + j; if (X >= 0 && Y >= 0 && X < cols && Y < rows) occ[Y * cols + X] = 1; }
    } else for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const X = p.x + i, Y = p.y + j; if (X >= 0 && Y >= 0 && X < cols && Y < rows) occ[Y * cols + X] = 1; }
  };
  for (const p of map.props) claim(p);
  const total = live.reduce((s, k) => s + k[1], 0);
  const pick = () => { let t = r() * total; for (const k of live) if ((t -= k[1]) <= 0) return k; return live[0]; };
  const order = [...cells];
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const added: Prop[] = [];
  for (const [x, y] of order) {
    if (r() >= density) continue;
    const [kind, , vs] = pick();
    const d = objectById(kind)!;
    const square = d.w === d.h;
    const rot = !vary ? 0 : square ? Math.floor(r() * 4) * 90 : r() < 0.5 ? 0 : 90;
    const [w, h] = rot % 180 ? [d.h, d.w] : [d.w, d.h];
    const ox = x - Math.floor(w / 2), oy = y - Math.floor(h / 2);
    if (ox < 0 || oy < 0 || ox + w > cols || oy + h > rows) continue;
    let ok = true;
    for (let j = 0; j < h && ok; j++)
      for (let i = 0; i < w && ok; i++) {
        const q = (oy + j) * cols + ox + i;
        const v = map.cells[q];
        const wet = v === 2;
        if (v === 0 || v === 4 || v === 5 || occ[q] || wet !== IN_WATER.has(kind)) ok = false;
      }
    if (!ok) continue;
    const n = d.variants?.length ?? 0;
    const v = vs ? vs[Math.floor(r() * vs.length)] % Math.max(1, n) : n > 1 && vary && r() < 0.4 ? Math.floor(r() * n) : 0;
    const s = vary && d.layer !== 'floor' ? Math.round((0.82 + r() * 0.36) * 100) / 100 : undefined;
    const p: Prop = { id: pid(), kind, x: ox, y: oy, rot, ...(v ? { v } : {}), ...(s && s !== 1 ? { s } : {}) };
    added.push(p);
    claim(p);
  }
  return added.length ? { ...map, props: [...map.props, ...added] } : map;
}

/** Remove things whose middle sits on one of these squares. Notes stay. */
export function clearProps(map: GameMap, cells: [number, number][], keep?: (p: Prop) => boolean): GameMap {
  const hit = new Set(cells.map(([x, y]) => y * map.cols + x));
  const props = map.props.filter((p) => {
    if (keep?.(p)) return true;
    const d = objectById(p.kind);
    const [w, h] = d ? (p.rot % 180 ? [d.h, d.w] : [d.w, d.h]) : [1, 1];
    const cx = p.x + Math.floor(w / 2), cy = p.y + Math.floor(h / 2);
    return !hit.has(cy * map.cols + cx);
  });
  return props.length === map.props.length ? map : { ...map, props };
}

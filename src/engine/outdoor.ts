// Outdoor map maker: forests, villages, coasts, deserts, swamps, mountains and whole regions, at any size.
// Everything is seeded, so the same biome, size and seed always give the same map. Ground comes from the
// terrain library (src/library/terrain.ts); trees, houses and the rest from the object library.
import { type GameMap, blankMap, pid } from './map';
import { RULE_CELL, terrainById } from '../library/terrain';
import { objectById } from '../library/objects';

export type Biome = 'forest' | 'village' | 'coast' | 'desert' | 'swamp' | 'mountains' | 'winter' | 'region';
export type OutdoorSize = 'small' | 'medium' | 'large' | 'huge';

export const BIOMES: { id: Biome; name: string; blurb: string }[] = [
  { id: 'forest', name: 'Forest', blurb: 'Woods with clearings, a stream, a track and a ruin or camp.' },
  { id: 'village', name: 'Village', blurb: 'Houses along the roads, an inn and a chapel on the green, fields and a river bridge.' },
  { id: 'coast', name: 'Coast', blurb: 'Sea, surf and sand, sea cliffs, a fishing jetty and the land behind.' },
  { id: 'desert', name: 'Desert', blurb: 'Dunes and cracked flats, mesas, an oasis and buried ruins.' },
  { id: 'swamp', name: 'Swamp', blurb: 'Black water, bog and mossy islands, drowned trees and a hut on stilts.' },
  { id: 'mountains', name: 'Mountains', blurb: 'Cliffs, scree and snow, a pass with a road through it, pines lower down.' },
  { id: 'winter', name: 'Winter', blurb: 'Snowfields, a frozen lake, snowy firs and a lonely camp.' },
  { id: 'region', name: 'Region (1 square = 1 mile)', blurb: 'A whole land: sea, mountains, forests, rivers, towns and the roads between them.' },
];

/** Squares across and down. Battle maps are 5 ft a square; region maps a mile. */
export const OUTDOOR_SIZES: Record<OutdoorSize, { name: string; battle: [number, number]; region: [number, number] }> = {
  small: { name: 'Small', battle: [40, 30], region: [48, 36] },
  medium: { name: 'Medium', battle: [80, 60], region: [80, 60] },
  large: { name: 'Large', battle: [140, 100], region: [120, 90] },
  huge: { name: 'Huge', battle: [200, 150], region: [160, 120] },
};

// ---------------------------------------------------------------------------------------------------------
// noise

function mulberry(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x: number, y: number, s: number) {
  let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smooth value noise in [0,1], fractal over `oct` octaves. `sc` is the feature size in squares. */
function makeNoise(seed: number) {
  const one = (x: number, y: number, s: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  return (x: number, y: number, sc: number, oct = 3, layer = 0) => {
    let sum = 0, amp = 1, tot = 0, f = 1 / sc;
    for (let o = 0; o < oct; o++) {
      sum += one(x * f, y * f, seed + layer * 101 + o * 17) * amp;
      tot += amp;
      amp *= 0.5;
      f *= 2;
    }
    return sum / tot;
  };
}

// ---------------------------------------------------------------------------------------------------------
// the painter: ground, props and paths

class Maker {
  m: GameMap;
  rnd: () => number;
  n: ReturnType<typeof makeNoise>;
  /** Squares taken by something solid (houses, trunks, rocks): nothing else is placed there. */
  occ: Uint8Array;
  /** Squares kept clear: roads, the village green, campsites. */
  keep: Uint8Array;
  cols: number;
  rows: number;

  constructor(name: string, cols: number, rows: number, seed: number) {
    this.m = blankMap(cols, rows, name);
    this.m.mats = new Array(cols * rows).fill('');
    this.m.ambient = 'bright';
    this.m.walls = [];
    this.cols = cols;
    this.rows = rows;
    this.rnd = mulberry(seed * 9973 + 17);
    this.n = makeNoise(seed);
    this.occ = new Uint8Array(cols * rows);
    this.keep = new Uint8Array(cols * rows);
  }

  in(x: number, y: number) { return x >= 0 && y >= 0 && x < this.cols && y < this.rows; }
  idx(x: number, y: number) { return y * this.cols + x; }
  mat(x: number, y: number) { return this.in(x, y) ? this.m.mats![this.idx(x, y)] : ''; }
  isWater(x: number, y: number) { return terrainById(this.mat(x, y))?.rule === 'water'; }

  paint(x: number, y: number, id: string) {
    if (!this.in(x, y)) return;
    const t = terrainById(id);
    const i = this.idx(x, y);
    this.m.mats![i] = id;
    this.m.cells[i] = t ? RULE_CELL[t.rule] : 1;
  }

  fill(f: (x: number, y: number) => string | null) {
    for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) { const id = f(x, y); if (id) this.paint(x, y, id); }
  }

  disc(cx: number, cy: number, r: number, f: (x: number, y: number, d: number) => void) {
    const R = Math.ceil(r);
    for (let y = Math.floor(cy - R); y <= cy + R; y++)
      for (let x = Math.floor(cx - R); x <= cx + R; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        if (d <= r && this.in(x, y)) f(x, y, d);
      }
  }

  /** An uneven blob of ground: radius r, edge broken up by noise. */
  blob(cx: number, cy: number, r: number, id: string | ((x: number, y: number, d: number) => string | null), rough = 0.35) {
    const L = 7 + Math.floor(this.rnd() * 50);
    this.disc(cx, cy, r * (1 + rough), (x, y, d) => {
      const edge = r * (1 - rough + 2 * rough * this.n(x, y, Math.max(3, r / 2), 2, L));
      if (d > edge) return;
      const v = typeof id === 'string' ? id : id(x, y, d / edge);
      if (v) this.paint(x, y, v);
    });
  }

  /** Does a w x h footprint at x,y fit: inside the map, nothing solid there, and ground that passes `ok`? */
  fits(x: number, y: number, w: number, h: number, ok: (x: number, y: number) => boolean, pad = 0) {
    if (x < 0 || y < 0 || x + w > this.cols || y + h > this.rows) return false;
    for (let j = -pad; j < h + pad; j++)
      for (let i = -pad; i < w + pad; i++) {
        const X = x + i, Y = y + j;
        if (!this.in(X, Y)) continue;
        const k = this.idx(X, Y);
        if (this.occ[k]) return false;
        if (j >= 0 && i >= 0 && j < h && i < w && (this.keep[k] || !ok(X, Y))) return false;
      }
    return true;
  }

  /** Put an object down. `solid` marks its footprint so nothing else lands on it. */
  put(kind: string, x: number, y: number, rot = 0, v?: number, solid = true) {
    const d = objectById(kind);
    if (!d) return false;
    const [w, h] = rot % 180 ? [d.h, d.w] : [d.w, d.h];
    if (x < 0 || y < 0 || x + w > this.cols || y + h > this.rows) return false;
    this.m.props.push({ id: pid(), kind, x, y, rot, ...(v ? { v } : {}) });
    if (solid) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.occ[this.idx(x + i, y + j)] = 1;
    return true;
  }

  size(kind: string, rot = 0): [number, number] {
    const d = objectById(kind);
    if (!d) return [1, 1];
    return rot % 180 ? [d.h, d.w] : [d.w, d.h];
  }

  /** Try a few random spots in a box for an object; returns where it went. */
  tryPut(kind: string, x0: number, y0: number, x1: number, y1: number, ok: (x: number, y: number) => boolean, opts: { rot?: number; v?: number; tries?: number; pad?: number; solid?: boolean } = {}) {
    const rot = opts.rot ?? 0;
    const [w, h] = this.size(kind, rot);
    for (let t = 0; t < (opts.tries ?? 30); t++) {
      const x = Math.floor(x0 + this.rnd() * Math.max(1, x1 - x0 - w + 1)), y = Math.floor(y0 + this.rnd() * Math.max(1, y1 - y0 - h + 1));
      if (this.fits(x, y, w, h, ok, opts.pad ?? 0)) {
        this.put(kind, x, y, rot, opts.v, opts.solid ?? true);
        return [x, y] as const;
      }
    }
    return null;
  }

  /** Scatter objects over the map: density per square where `where` says yes. Trunks only take one square each. */
  scatter(kinds: [string, number][], density: number, where: (x: number, y: number) => boolean, variants?: number[]) {
    const total = kinds.reduce((s, [, w]) => s + w, 0);
    const pick = () => {
      let r = this.rnd() * total;
      for (const [k, w] of kinds) if ((r -= w) <= 0) return k;
      return kinds[0][0];
    };
    for (let y = 0; y < this.rows; y++)
      for (let x = 0; x < this.cols; x++) {
        if (this.rnd() >= density || !where(x, y)) continue;
        const kind = pick();
        const d = objectById(kind);
        if (!d) continue;
        const rot = !kind.startsWith('region-') && (d.layer === 'overhead' || d.w !== d.h) ? (this.rnd() < 0.5 ? 0 : 90) : 0;
        const [w, h] = this.size(kind, rot);
        const ox = x - Math.floor(w / 2), oy = y - Math.floor(h / 2);
        if (!this.fits(ox, oy, w, h, where)) continue;
        const v = variants ? variants[Math.floor(this.rnd() * variants.length)] : d.variants && this.rnd() < 0.3 ? Math.floor(this.rnd() * Math.min(2, d.variants.length)) : 0;
        // a tree only claims its trunk, so canopies can touch like a real wood
        this.put(kind, ox, oy, rot, v, false);
        const cx = ox + Math.floor(w / 2), cy = oy + Math.floor(h / 2);
        const r = d.layer === 'overhead' ? Math.max(1, Math.floor(Math.min(w, h) / 2)) : 0;
        for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (this.in(cx + i, cy + j)) this.occ[this.idx(cx + i, cy + j)] = 1;
        if (d.layer !== 'overhead') for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.occ[this.idx(ox + i, oy + j)] = 1;
      }
  }

  /** A wandering line through the points, stamped as a band. Returns the centreline squares in order. */
  trail(pts: number[][], width: number, stamp: (x: number, y: number, d: number) => void, wander = 0.6, L = 3) {
    const out: number[][] = [];
    const seen = new Set<number>();
    for (let s = 0; s < pts.length - 1; s++) {
      const [ax, ay] = pts[s], [bx, by] = pts[s + 1];
      const len = Math.hypot(bx - ax, by - ay);
      const steps = Math.ceil(len * 2);
      const nx = -(by - ay) / (len || 1), ny = (bx - ax) / (len || 1);
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        // sideways wobble that fades out at the ends of each leg so legs join up
        const fade = Math.sin(Math.PI * t);
        const off = (this.n(ax + (bx - ax) * t, ay + (by - ay) * t, 14, 3, L) - 0.5) * 2 * wander * Math.min(12, len * 0.25) * fade;
        const x = ax + (bx - ax) * t + nx * off, y = ay + (by - ay) * t + ny * off;
        const w = width * (0.85 + 0.3 * this.n(x, y, 6, 1, L + 1));
        this.disc(x, y, w / 2, stamp);
        const cx = Math.floor(x), cy = Math.floor(y);
        if (this.in(cx, cy) && !seen.has(this.idx(cx, cy))) { seen.add(this.idx(cx, cy)); out.push([cx, cy]); }
      }
    }
    return out;
  }

  /** A river edge to edge. Deep in the middle when wide, mud or sand on the banks. */
  river(pts: number[][], width: number, bank = 'mud', deep = 'water-deep', shallow = 'water-shallow') {
    const line = this.trail(pts, width + 2, (x, y, d) => {
      if (this.isWater(x, y)) return;
      if (d > width / 2) { if (bank && this.mat(x, y) !== 'road-dirt') this.paint(x, y, bank); }
    }, 0.9, 11);
    this.trail(pts, width, (x, y, d) => this.paint(x, y, width >= 4 && d < width / 4 ? deep : shallow), 0.9, 11);
    return line;
  }

  /** A road that keeps out of water; bridges go in afterwards. */
  road(pts: number[][], width: number, id = 'road-dirt', overWater = false) {
    const line = this.trail(pts, width, (x, y) => {
      if (this.isWater(x, y) && !overWater) return;
      this.paint(x, y, id);
      this.keep[this.idx(x, y)] = 1;
    }, 0.5, 23);
    for (const [x, y] of line) this.keep[this.idx(x, y)] = 1;
    return line;
  }

  /** Wherever a road's line runs over water, lay a bridge along it and make those squares walkable. */
  bridges(line: number[][], kind = 'bridge-stone', maxLen = 16) {
    const d = objectById(kind);
    if (!d) return;
    const L = Math.max(d.w, d.h), S = Math.min(d.w, d.h);
    const longIsH = d.h >= d.w; // the art runs top to bottom at rot 0
    const done = new Set<number>();
    for (let k = 0; k < line.length; k++) {
      const [x, y] = line[k];
      if (!this.isWater(x, y) || done.has(this.idx(x, y))) continue;
      // which way the road runs here
      const a = line[Math.max(0, k - 4)], b = line[Math.min(line.length - 1, k + 4)];
      const horiz = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]);
      const dx = horiz ? 1 : 0, dy = horiz ? 0 : 1;
      let s = 0, e = 0;
      while (this.isWater(x - dx * (s + 1), y - dy * (s + 1)) && s < 60) s++;
      while (this.isWater(x + dx * (e + 1), y + dy * (e + 1)) && e < 60) e++;
      const len = s + e + 3; // one square of bank at each end
      if (len > maxLen) { for (let t = -s; t <= e; t++) done.add(this.idx(x + dx * t, y + dy * t)); continue; }
      const pieces = Math.ceil(len / L);
      const start = -s - 1 - Math.floor((pieces * L - len) / 2);
      const across = (horiz ? y : x) - Math.floor(S / 2);
      const rot = horiz === longIsH ? 90 : 0;
      for (let p = 0; p < pieces; p++) {
        const along = (horiz ? x : y) + start + p * L;
        const px = horiz ? along : across, py = horiz ? across : along;
        this.put(kind, px, py, rot, 0, true);
        const [w, h] = this.size(kind, rot);
        for (let j = 0; j < h; j++)
          for (let i = 0; i < w; i++) {
            const X = px + i, Y = py + j;
            if (!this.in(X, Y)) continue;
            const q = this.idx(X, Y);
            done.add(q);
            this.keep[q] = 1;
            if (this.m.cells[q] === 2) this.m.cells[q] = 1; // you walk over it; the water still shows underneath
          }
      }
    }
  }

  note(x: number, y: number, text: string) { this.m.notes.push({ id: pid(), x, y, text, gmOnly: true }); }

  edgePoint(side: number, at: number): number[] {
    const c = this.cols, r = this.rows;
    return side === 0 ? [at * c, -2] : side === 1 ? [c + 2, at * r] : side === 2 ? [at * c, r + 2] : [-2, at * r];
  }

  done(): GameMap {
    const m = this.m;
    // start the heroes on open ground near the middle of the bottom edge
    const cx = Math.floor(this.cols / 2);
    for (let r = 0; r < Math.max(this.cols, this.rows); r++)
      for (const [x, y] of [[cx + r, this.rows - 3 - Math.floor(r / 3)], [cx - r, this.rows - 3 - Math.floor(r / 3)]]) {
        if (!this.in(x, y)) continue;
        const i = this.idx(x, y);
        if (m.cells[i] === 1 && !this.occ[i]) { m.playerStart = [x, y]; return m; }
      }
    return m;
  }
}

// ---------------------------------------------------------------------------------------------------------
// biomes

const grassy = (mk: Maker, x: number, y: number) => {
  const a = mk.n(x, y, 18, 3, 1), b = mk.n(x, y, 7, 2, 2);
  return a > 0.62 ? 'meadow' : a < 0.36 ? 'grass-dry' : b > 0.7 ? 'grass-lush' : 'grass';
};

function forest(mk: Maker, big: boolean) {
  const { cols, rows } = mk;
  const dense = (x: number, y: number) => mk.n(x, y, big ? 26 : 14, 3, 5);
  mk.fill((x, y) => {
    const d = dense(x, y);
    if (d > 0.45) return mk.n(x, y, 6, 2, 6) > 0.72 ? 'moss' : 'forest-floor';
    if (d > 0.39) return 'grass-lush';
    return grassy(mk, x, y);
  });
  // thickets in the deepest wood
  mk.fill((x, y) => (dense(x, y) > 0.66 && mk.n(x, y, 5, 2, 7) > 0.62 ? 'thicket' : null));
  // a stream from the top edge to a side or the bottom
  const s0 = mk.edgePoint(0, 0.2 + mk.rnd() * 0.6), s1 = mk.edgePoint(mk.rnd() < 0.5 ? 2 : 1, 0.2 + mk.rnd() * 0.6);
  const mid = [cols * (0.3 + mk.rnd() * 0.4), rows * (0.35 + mk.rnd() * 0.3)];
  mk.river([s0, mid, s1], big ? 3 : 2, 'mud');
  // a pond
  if (cols >= 60 || mk.rnd() < 0.5) {
    const px = cols * (0.15 + mk.rnd() * 0.7), py = rows * (0.15 + mk.rnd() * 0.7), pr = 2 + Math.min(cols, rows) * 0.05;
    mk.blob(px, py, pr + 1.5, (x, y, t) => (t > 0.75 && !mk.isWater(x, y) ? 'mud' : t <= 0.75 ? 'water-shallow' : null));
  }
  // a track across, side to side
  const r0 = mk.edgePoint(3, 0.3 + mk.rnd() * 0.4), r1 = mk.edgePoint(1, 0.3 + mk.rnd() * 0.4);
  const road = mk.road([r0, [cols * 0.5, rows * (0.4 + mk.rnd() * 0.2)], r1], 2);
  mk.bridges(road, cols >= 80 ? 'bridge-stone' : 'bridge-plank');
  // clearings: a ruin, a camp, a stone circle
  const sites = Math.max(1, Math.round((cols * rows) / 1800));
  const things = ['ruin', 'camp', 'circle', 'tower', 'camp', 'ruin'];
  for (let s = 0; s < sites; s++) {
    const cx = Math.floor(cols * (0.12 + mk.rnd() * 0.76)), cy = Math.floor(rows * (0.12 + mk.rnd() * 0.76));
    const r = 4 + mk.rnd() * 3;
    if (mk.isWater(cx, cy) || mk.keep[mk.idx(cx, cy)]) continue;
    mk.blob(cx, cy, r, (x, y) => (mk.isWater(x, y) || mk.keep[mk.idx(x, y)] ? null : 'grass'));
    const what = things[s % things.length];
    const land = (x: number, y: number) => !mk.isWater(x, y);
    if (what === 'ruin') { mk.tryPut('ruin-walls', cx - 3, cy - 3, cx + 3, cy + 3, land); mk.note(cx, cy, 'Old ruin: a good place for an ambush or a hidden cellar.'); }
    else if (what === 'tower') { mk.tryPut('ruin-tower', cx - 2, cy - 2, cx + 2, cy + 2, land); mk.note(cx, cy, 'Fallen tower: rubble and a way down?'); }
    else if (what === 'circle') { mk.tryPut('stone-circle', cx - 2, cy - 2, cx + 2, cy + 2, land); mk.note(cx, cy, 'Standing stones: something old sleeps here.'); }
    else {
      mk.tryPut('campfire', cx - 1, cy - 1, cx + 1, cy + 1, land);
      for (const k of ['tent', 'tent', 'bedroll', 'log-pile']) mk.tryPut(k, cx - 4, cy - 4, cx + 4, cy + 4, land, { pad: 0 });
      mk.note(cx, cy, 'Camp: bandits, hunters or other travellers.');
    }
    mk.disc(cx, cy, r * 0.8, (x, y) => { mk.keep[mk.idx(x, y)] = 1; });
  }
  const land = (x: number, y: number) => !mk.isWater(x, y) && mk.m.cells[mk.idx(x, y)] !== 5;
  const wood = (x: number, y: number) => land(x, y) && dense(x, y) > 0.45;
  const edge = (x: number, y: number) => land(x, y) && dense(x, y) > 0.37 && dense(x, y) <= 0.45;
  const open = (x: number, y: number) => land(x, y) && dense(x, y) <= 0.37;
  if (big) mk.scatter([['tree-large', 1]], 0.0015, wood);
  mk.scatter([['tree-oak', 5], ['tree-pine', 4], ['tree-cluster', 2], ['tree-birch', 2]], 0.4, wood);
  mk.scatter([['tree-oak', 2], ['tree-birch', 2], ['bush', 4], ['tree-pine', 1]], 0.12, edge);
  mk.scatter([['bush', 3], ['flowers', 3], ['boulder', 1], ['tree-oak', 1], ['grass-tall', 2]], 0.02, open);
  mk.scatter([['ferns', 4], ['log-fallen', 2], ['stump', 2], ['mushrooms', 2], ['boulder', 2], ['rock-outcrop', 1], ['thorn-bush', 1]], 0.035, wood);
  mk.scatter([['reeds', 3], ['lily-pads', 1]], 0.25, (x, y) => mk.mat(x, y) === 'mud' || (mk.mat(x, y) === 'water-shallow' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !mk.isWater(x + a, y + b))));
}

function village(mk: Maker, big: boolean) {
  const { cols, rows } = mk;
  mk.fill((x, y) => grassy(mk, x, y));
  const cx = Math.floor(cols * (0.42 + mk.rnd() * 0.16)), cy = Math.floor(rows * (0.42 + mk.rnd() * 0.16));
  // river down one side with a bridge on the main road
  const rx = mk.rnd() < 0.5 ? cols * 0.18 : cols * 0.82;
  mk.river([[rx + (mk.rnd() - 0.5) * 8, -2], [rx, rows / 2], [rx + (mk.rnd() - 0.5) * 8, rows + 2]], big ? 5 : 3, 'mud');
  // roads: east-west main road through the square, a north-south lane
  const w = big ? 3 : 2;
  const main = mk.road([[-2, cy + (mk.rnd() - 0.5) * 6], [cx, cy], [cols + 2, cy + (mk.rnd() - 0.5) * 6]], w);
  const lane = mk.road([[cx + (mk.rnd() - 0.5) * 6, -2], [cx, cy], [cx + (mk.rnd() - 0.5) * 6, rows + 2]], w - 1 || 1);
  const lanes = [main, lane];
  if (big) {
    for (const f of [0.25, 0.75]) {
      const ly = Math.floor(rows * f);
      lanes.push(mk.road([[cx - cols * 0.25, ly], [cx + cols * 0.25, ly + (mk.rnd() - 0.5) * 6]], 2));
    }
  }
  for (const l of lanes) mk.bridges(l);
  // the green: cobbles round a well
  const sq = big ? 6 : 4;
  mk.blob(cx, cy, sq, 'stone-cobble', 0.12);
  mk.disc(cx, cy, sq + 1, (x, y) => { mk.keep[mk.idx(x, y)] = 1; });
  mk.put('well-house', cx - 1, cy - 1);
  mk.note(cx, cy, 'Village square: market days, notices and gossip.');
  const groundOK = (x: number, y: number) => !mk.isWater(x, y) && mk.mat(x, y) !== 'mud';
  // buildings face the road they stand on
  const kinds = big
    ? [['inn', 1], ['chapel', 1], ['house-large', 2], ['house', 8], ['cottage', 8], ['shop', 5], ['longhouse', 2], ['barn', 2], ['tower-stone', 1]]
    : [['inn', 1], ['chapel', 1], ['house', 6], ['cottage', 7], ['shop', 3], ['barn', 1], ['house-large', 1]];
  const queue: string[] = [];
  for (const [k, n] of kinds as [string, number][]) for (let i = 0; i < n; i++) queue.push(k);
  // the special buildings first, the rest shuffled
  const head = queue.slice(0, 2), rest = queue.slice(2).sort(() => mk.rnd() - 0.5);
  const order = [...head, ...rest];
  let placed = 0;
  const along: { x: number; y: number; dir: [number, number] }[] = [];
  for (const l of lanes)
    for (let k = 3; k < l.length - 3; k += 2) {
      const [x, y] = l[k];
      const a = l[k - 3], b = l[k + 3];
      along.push({ x, y, dir: Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]) ? [1, 0] : [0, 1] });
    }
  // nearest the square first
  along.sort((p, q) => Math.hypot(p.x - cx, p.y - cy) - Math.hypot(q.x - cx, q.y - cy) + (mk.rnd() - 0.5) * 6);
  for (const kind of order) {
    for (let t = 0; t < along.length; t++) {
      const p = along[t];
      if (!p) continue;
      const side = mk.rnd() < 0.5 ? -1 : 1;
      // door faces the road: rot 0 door down, 180 up, 90 left, 270 right
      const horiz = p.dir[0] === 1;
      const rot = horiz ? (side < 0 ? 0 : 180) : side < 0 ? 270 : 90;
      const [bw, bh] = mk.size(kind, rot);
      const gap = Math.ceil(w / 2) + 1;
      const bx = horiz ? p.x - Math.floor(bw / 2) : side < 0 ? p.x - gap - bw + 1 : p.x + gap;
      const by = horiz ? (side < 0 ? p.y - gap - bh + 1 : p.y + gap) : p.y - Math.floor(bh / 2);
      if (!mk.fits(bx, by, bw, bh, groundOK, 1)) continue;
      mk.put(kind, bx, by, rot);
      // a yard of packed earth round the door
      const dx = horiz ? bx + Math.floor(bw / 2) : side < 0 ? bx + bw : bx - 1;
      const dy = horiz ? (side < 0 ? by + bh : by - 1) : by + Math.floor(bh / 2);
      mk.disc(dx + 0.5, dy + 0.5, 1.2, (x, y) => { if (!mk.occ[mk.idx(x, y)] && !mk.isWater(x, y) && mk.mat(x, y) !== 'stone-cobble') mk.paint(x, y, 'dirt'); });
      if (kind === 'inn') mk.note(bx + 1, by + 1, 'The inn: rooms, rumours and a hot meal.');
      if (kind === 'chapel') mk.note(bx + 1, by + 1, 'Chapel and graveyard.');
      if (kind === 'chapel') for (let g = 0; g < 6; g++) mk.tryPut('gravestone', bx - 3, by - 3, bx + bw + 3, by + bh + 3, groundOK, { v: Math.floor(mk.rnd() * 3) });
      along.splice(Math.max(0, t - 2), 4);
      placed++;
      break;
    }
  }
  // fields of crops and a fence round them beyond the houses
  const fields = big ? 10 : 4;
  for (let f = 0; f < fields; f++) {
    const fw = 6 + Math.floor(mk.rnd() * 6), fh = 4 + Math.floor(mk.rnd() * 4);
    for (let t = 0; t < 25; t++) {
      const fx = Math.floor(mk.rnd() * (cols - fw)), fy = Math.floor(mk.rnd() * (rows - fh));
      if (Math.hypot(fx - cx, fy - cy) < (big ? 22 : 12)) continue;
      if (!mk.fits(fx, fy, fw, fh, groundOK, 1)) continue;
      for (let y = fy; y < fy + fh; y++) for (let x = fx; x < fx + fw; x++) mk.paint(x, y, 'farmland');
      const v = Math.floor(mk.rnd() * 4);
      for (let y = fy; y + 2 <= fy + fh; y += 2) for (let x = fx; x + 2 <= fx + fw; x += 2) mk.put('crop-rows', x, y, 0, v, false);
      for (let y = fy; y < fy + fh; y++) for (let x = fx; x < fx + fw; x++) mk.occ[mk.idx(x, y)] = 1;
      for (let x = fx; x + 2 <= fx + fw; x += 2) mk.put('fence-wood', x, fy - 1, 0, 0, false);
      if (mk.rnd() < 0.5) mk.tryPut('scarecrow', fx - 2, fy - 2, fx + fw + 2, fy + fh + 2, groundOK);
      break;
    }
  }
  // gardens, carts, people's things
  const nearTown = (x: number, y: number) => groundOK(x, y) && Math.hypot(x - cx, y - cy) < (big ? cols * 0.35 : cols * 0.3);
  mk.scatter([['bush', 3], ['hedge', 2], ['flowers', 3], ['barrel', 1], ['crate', 1], ['hay-bale', 1], ['tree-birch', 1]], 0.012, nearTown);
  mk.scatter([['tree-oak', 3], ['tree-cluster', 1], ['bush', 2], ['tree-willow', 1], ['boulder', 1]], 0.012, (x, y) => groundOK(x, y) && !nearTown(x, y));
  mk.tryPut('wagon', cx - 8, cy - 2, cx + 8, cy + 2, groundOK);
  mk.tryPut('signpost', cx - sq - 3, cy - sq - 3, cx + sq + 3, cy + sq + 3, groundOK);
  mk.tryPut('windmill', 0, 0, cols, rows, (x, y) => groundOK(x, y) && Math.hypot(x - cx, y - cy) > 14);
  void placed;
}

function coast(mk: Maker, big: boolean) {
  const { cols, rows } = mk;
  // the sea comes in from one side
  const side = Math.floor(mk.rnd() * 4);
  const depth = (x: number, y: number) => {
    const t = side === 0 ? y / rows : side === 1 ? 1 - x / cols : side === 2 ? 1 - y / rows : x / cols;
    return t + (mk.n(x, y, big ? 30 : 16, 4, 3) - 0.5) * 0.45;
  };
  mk.fill((x, y) => {
    const d = depth(x, y);
    if (d < 0.2) return 'ocean';
    if (d < 0.3) return 'water-deep';
    if (d < 0.38) return 'water-shallow';
    if (d < 0.47) return 'beach-sand';
    if (d < 0.54) return mk.n(x, y, 5, 2, 4) > 0.5 ? 'grass-dry' : 'beach-sand';
    return grassy(mk, x, y);
  });
  // sea cliffs along part of the shore
  const cliffAt = (x: number, y: number) => mk.n(x, y, 20, 2, 9) > 0.6;
  mk.fill((x, y) => {
    const d = depth(x, y);
    return d >= 0.4 && d < 0.5 && cliffAt(x, y) ? 'cliff' : d >= 0.5 && d < 0.56 && cliffAt(x, y) ? 'rocky-ground' : null;
  });
  // rocks in the surf
  mk.scatter([['boulder', 2], ['boulder-large', 1]], 0.02, (x, y) => mk.mat(x, y) === 'water-shallow');
  // a stream to the sea
  const shoreLand = (x: number, y: number) => depth(x, y) > 0.6;
  const st = side === 0 ? [cols * (0.3 + mk.rnd() * 0.4), rows + 2] : side === 1 ? [-2, rows * (0.3 + mk.rnd() * 0.4)] : side === 2 ? [cols * (0.3 + mk.rnd() * 0.4), -2] : [cols + 2, rows * (0.3 + mk.rnd() * 0.4)];
  const en = side === 0 ? [st[0] + (mk.rnd() - 0.5) * 10, rows * 0.2] : side === 1 ? [cols * 0.8, st[1] + (mk.rnd() - 0.5) * 10] : side === 2 ? [st[0] + (mk.rnd() - 0.5) * 10, rows * 0.8] : [cols * 0.2, st[1] + (mk.rnd() - 0.5) * 10];
  mk.river([st, en], big ? 3 : 2, 'beach-sand');
  // a coast road parallel to the shore, and a fishing jetty
  const along = (t: number, d: number): number[] => (side === 0 ? [t * cols, d * rows] : side === 1 ? [(1 - d) * cols, t * rows] : side === 2 ? [t * cols, (1 - d) * rows] : [d * cols, t * rows]);
  const road = mk.road([along(-0.05, 0.72), along(0.5, 0.66 + mk.rnd() * 0.1), along(1.05, 0.72)], 2);
  mk.bridges(road, 'bridge-plank');
  // jetty: walk from the road towards the sea and lay dock sections over the water
  const jt = 0.3 + mk.rnd() * 0.4;
  let [jx, jy] = along(jt, 0.6).map(Math.floor);
  const step = side === 0 ? [0, -1] : side === 1 ? [1, 0] : side === 2 ? [0, 1] : [-1, 0];
  for (let k = 0; k < 60 && mk.in(jx, jy) && !mk.isWater(jx, jy); k++) { jx += step[0]; jy += step[1]; }
  const vert = step[0] === 0;
  for (let k = 0; k < (big ? 8 : 5) && mk.in(jx, jy); k++) {
    mk.put('dock-pier', jx, jy, vert ? 0 : 90, 0, true);
    for (const [a, b] of vert ? [[0, 0], [0, 1]] : [[0, 0], [1, 0]]) if (mk.in(jx + a, jy + b)) mk.m.cells[mk.idx(jx + a, jy + b)] = 1;
    jx += step[0] * 2; jy += step[1] * 2;
  }
  mk.tryPut('rowboat', jx - 3, jy - 3, jx + 3, jy + 3, (x, y) => mk.mat(x, y) === 'water-shallow' || mk.mat(x, y) === 'water-deep', { solid: true });
  mk.note(jx, jy, 'Fishing jetty: a boat for hire, or smugglers at night.');
  // a cottage or two by the road
  const land = (x: number, y: number) => shoreLand(x, y) && !mk.isWater(x, y) && mk.m.cells[mk.idx(x, y)] !== 5;
  for (let h = 0; h < (big ? 6 : 2); h++) {
    const [hx, hy] = along(0.1 + mk.rnd() * 0.8, 0.8).map(Math.floor);
    mk.tryPut(mk.rnd() < 0.6 ? 'cottage' : 'house', hx - 4, hy - 4, hx + 4, hy + 4, land, { rot: side === 0 ? 180 : side === 1 ? 90 : side === 2 ? 0 : 270, pad: 1 });
  }
  if (big) mk.tryPut('tower-stone', 0, 0, cols, rows, (x, y) => { const d = depth(x, y); return d > 0.5 && d < 0.6 && !mk.isWater(x, y); }, { v: 0, tries: 80 });
  mk.scatter([['grass-tall', 3], ['bush', 1]], 0.04, (x, y) => mk.mat(x, y) === 'beach-sand' && depth(x, y) > 0.46);
  mk.scatter([['tree-pine', 2], ['tree-oak', 2], ['bush', 3], ['boulder', 1], ['tree-cluster', 1]], 0.03, (x, y) => land(x, y) && depth(x, y) > 0.62);
  mk.scatter([['boulder', 2], ['rock-outcrop', 1]], 0.02, (x, y) => mk.mat(x, y) === 'rocky-ground');
}

function desert(mk: Maker, big: boolean) {
  const { cols, rows } = mk;
  mk.fill((x, y) => {
    const a = mk.n(x, y, big ? 24 : 14, 3, 1), b = mk.n(x, y, 8, 2, 2);
    return a > 0.66 ? 'desert-cracked' : a < 0.3 ? 'rocky-ground' : b > 0.72 ? 'gravel' : 'sand';
  });
  // mesas: raised rock with cliff edges
  const mesas = Math.max(1, Math.round((cols * rows) / 1600));
  for (let k = 0; k < mesas; k++) {
    const mx = cols * (0.1 + mk.rnd() * 0.8), my = rows * (0.1 + mk.rnd() * 0.8), r = 3 + mk.rnd() * (big ? 7 : 4);
    mk.blob(mx, my, r + 1.5, (x, y, t) => (t > 0.8 ? 'scree' : 'cliff'), 0.4);
  }
  // an oasis
  const ox = cols * (0.25 + mk.rnd() * 0.5), oy = rows * (0.25 + mk.rnd() * 0.5), orad = 2.5 + Math.min(cols, rows) * 0.04;
  mk.blob(ox, oy, orad + 4, (x, y, t) => (t > 0.62 ? 'grass-dry' : t > 0.5 ? 'grass' : t > 0.42 ? 'mud' : 'water-shallow'), 0.25);
  mk.note(Math.floor(ox), Math.floor(oy), 'Oasis: the only water for miles. Someone always guards it.');
  const oasisRing = (x: number, y: number) => { const d = Math.hypot(x - ox, y - oy); return d > orad * 0.9 && d < orad + 4 && !mk.isWater(x, y); };
  mk.scatter([['tree-palm', 3], ['bush', 1], ['reeds', 1]], 0.25, oasisRing);
  // a caravan track past the oasis
  const road = mk.road([mk.edgePoint(3, 0.2 + mk.rnd() * 0.6), [ox + orad + 4, oy], mk.edgePoint(1, 0.2 + mk.rnd() * 0.6)], 2, 'desert-cracked');
  void road;
  // ruins half under the sand
  for (let k = 0; k < (big ? 4 : 1); k++) {
    const at = mk.tryPut(mk.rnd() < 0.6 ? 'ruin-walls' : 'ruin-arch', 2, 2, cols - 2, rows - 2, (x, y) => mk.mat(x, y) === 'sand', { v: 1 });
    if (at) mk.note(at[0] + 1, at[1] + 1, 'Sand-drowned ruin: a stair leads down into the dark.');
  }
  if (big) mk.tryPut('giant-ribcage', 0, 0, cols, rows, (x, y) => mk.mat(x, y) === 'sand');
  const flat = (x: number, y: number) => !mk.isWater(x, y) && mk.m.cells[mk.idx(x, y)] !== 5;
  mk.scatter([['cactus', 3], ['desert-rocks', 2], ['boulder', 1], ['sand-ripples', 2], ['skull-bleached', 0.3], ['thorn-bush', 1]], 0.02, flat);
  mk.scatter([['boulder', 2], ['boulder-large', 1]], 0.05, (x, y) => mk.mat(x, y) === 'scree');
  mk.tryPut('tent-round', ox - 10, oy - 10, ox + 10, oy + 10, (x, y) => flat(x, y) && !oasisRing(x, y));
}

function swamp(mk: Maker, big: boolean) {
  const { cols, rows } = mk;
  mk.fill((x, y) => {
    const wet = mk.n(x, y, big ? 18 : 11, 4, 3), g = mk.n(x, y, 6, 2, 4);
    if (wet > 0.6) return 'swamp-water';
    if (wet > 0.54) return 'bog';
    if (wet > 0.47) return g > 0.5 ? 'mud' : 'bog';
    return g > 0.62 ? 'moss' : wet < 0.36 ? 'grass-lush' : 'grass';
  });
  // a channel of open water winding through
  mk.river([mk.edgePoint(0, 0.3 + mk.rnd() * 0.4), [cols * (0.3 + mk.rnd() * 0.4), rows / 2], mk.edgePoint(2, 0.3 + mk.rnd() * 0.4)], big ? 4 : 3, 'bog', 'swamp-water', 'swamp-water');
  // an old causeway of moss and roots across the wettest bit
  mk.road([mk.edgePoint(3, 0.5), [cols / 2, rows * (0.4 + mk.rnd() * 0.2)], mk.edgePoint(1, 0.5)], 1.6, 'moss', true);
  // a hut on a dry island
  const hx = Math.floor(cols * (0.25 + mk.rnd() * 0.5)), hy = Math.floor(rows * (0.25 + mk.rnd() * 0.5));
  mk.blob(hx, hy, 4, 'grass', 0.25);
  mk.put('cottage', hx - 1, hy - 1, 0, 0);
  mk.tryPut('cauldron-tripod', hx - 3, hy + 1, hx + 3, hy + 4, () => true);
  mk.note(hx, hy, 'A hut on the one dry hump: the swamp witch, or what is left of her.');
  const wet = (x: number, y: number) => mk.mat(x, y) === 'swamp-water';
  const soggy = (x: number, y: number) => ['bog', 'mud'].includes(mk.mat(x, y));
  const dry = (x: number, y: number) => !wet(x, y) && !soggy(x, y);
  mk.scatter([['tree-swamp', 4], ['tree-willow', 2], ['tree-dead', 2]], 0.06, (x, y) => soggy(x, y) || dry(x, y));
  mk.scatter([['tree-swamp', 1], ['tree-dead', 1]], 0.02, wet);
  mk.scatter([['reeds', 5], ['lily-pads', 3]], 0.18, (x, y) => wet(x, y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !wet(x + a, y + b)));
  mk.scatter([['reeds', 3], ['mud-patch', 1], ['grass-tall', 2], ['mushrooms', 1], ['log-fallen', 1], ['bones-mud', 0.3]], 0.04, soggy);
  mk.scatter([['ferns', 2], ['bush', 2], ['mushrooms', 1], ['stump', 1]], 0.04, dry);
}

function mountains(mk: Maker, big: boolean, winter = false) {
  const { cols, rows } = mk;
  const hi = (x: number, y: number) => mk.n(x, y, big ? 34 : 18, 4, 2);
  // a pass: the ground drops along a valley line across the map
  const passY = rows * (0.35 + mk.rnd() * 0.3);
  const elev = (x: number, y: number) => {
    const v = hi(x, y);
    const dist = Math.abs(y - passY - (mk.n(x, 0, 16, 2, 5) - 0.5) * rows * 0.4) / rows;
    return v * 0.6 + Math.min(1, dist * 2.2) * 0.5;
  };
  mk.fill((x, y) => {
    const e = elev(x, y), r = mk.n(x, y, 5, 2, 8);
    if (e > 0.82) return 'snow';
    if (e > 0.72) return winter ? 'snow' : r > 0.55 ? 'scree' : 'rocky-ground';
    if (e > 0.6) return winter ? (r > 0.6 ? 'scree' : 'snow') : r > 0.6 ? 'gravel' : 'rocky-ground';
    if (e > 0.5) return winter ? 'tundra' : r > 0.5 ? 'grass-dry' : 'rocky-ground';
    return winter ? 'snow' : grassy(mk, x, y);
  });
  // cliff bands where the height jumps
  mk.fill((x, y) => {
    const e = elev(x, y);
    const band = (e > 0.63 && e < 0.67) || (e > 0.76 && e < 0.79);
    return band && mk.n(x, y, 9, 2, 12) > 0.42 ? 'cliff' : null;
  });
  // a stream down the valley, a road beside it
  mk.river([[-2, passY + 5], [cols * 0.5, passY + 4 + mk.rnd() * 3], [cols + 2, passY + 5]], big ? 3 : 2, 'gravel', winter ? 'ice' : 'water-deep', winter ? 'ice' : 'water-shallow');
  const road = mk.road([[-2, passY - 3], [cols * 0.35, passY - 4], [cols * 0.7, passY - 2], [cols + 2, passY - 3]], 2, winter ? 'gravel' : 'road-dirt');
  mk.bridges(road);
  // nothing walks through a cliff, so cut the road through any cliff it hits
  for (const [x, y] of road) mk.disc(x + 0.5, y + 0.5, 1.2, (a, b) => { if (mk.mat(a, b) === 'cliff') mk.paint(a, b, 'gravel'); });
  // a watchtower on the pass and a cave higher up
  mk.tryPut('watchtower-wood', cols * 0.4, passY - 8, cols * 0.6, passY - 3, (x, y) => !mk.isWater(x, y) && mk.m.cells[mk.idx(x, y)] === 1);
  mk.note(Math.floor(cols * 0.5), Math.floor(passY - 5), 'The pass: whoever holds the tower holds the road.');
  const cave = mk.tryPut('boulder-large', 0, 0, cols, rows, (x, y) => mk.mat(x, y) === 'rocky-ground' && elev(x, y) > 0.66, { tries: 80 });
  if (cave) mk.note(cave[0], cave[1], 'A cave mouth behind the boulders: a lair.');
  const ok = (x: number, y: number) => !mk.isWater(x, y) && mk.m.cells[mk.idx(x, y)] !== 5;
  const pine = winter ? 'tree-fir-snow' : 'tree-pine';
  mk.scatter([[pine, 5], ['boulder', 1]], 0.06, (x, y) => ok(x, y) && elev(x, y) < 0.58);
  mk.scatter([[pine, 2], ['boulder', 2], ['boulder-large', 1], ['rock-outcrop', 1]], 0.025, (x, y) => ok(x, y) && elev(x, y) >= 0.58 && elev(x, y) < 0.74);
  mk.scatter([['boulder', 3], ['boulder-large', 2], ['cairn', 0.2]], 0.02, (x, y) => ok(x, y) && elev(x, y) >= 0.74);
  if (winter) mk.scatter([['snowdrift', 1]], 0.012, (x, y) => ok(x, y) && mk.mat(x, y) === 'snow');
  if (!winter) mk.scatter([['bush', 2], ['flowers', 1], ['grass-tall', 2]], 0.02, (x, y) => ok(x, y) && elev(x, y) < 0.5);
}

function winterland(mk: Maker, big: boolean) {
  const { cols, rows } = mk;
  mk.fill((x, y) => {
    const a = mk.n(x, y, big ? 22 : 12, 3, 1);
    return a < 0.3 ? 'tundra' : a > 0.7 ? 'ice' : 'snow';
  });
  // a frozen lake with a hole in the ice
  const lx = cols * (0.3 + mk.rnd() * 0.4), ly = rows * (0.3 + mk.rnd() * 0.4), lr = 3 + Math.min(cols, rows) * 0.1;
  mk.blob(lx, ly, lr, (x, y, t) => (t < 0.08 ? 'water-deep' : 'ice'), 0.3);
  mk.note(Math.floor(lx), Math.floor(ly), 'The ice is thin in the middle: DC 12 Dexterity save or fall through.');
  mk.scatter([['tree-fir-snow', 5], ['tree-dead', 1], ['boulder-large', 1], ['snowdrift', 1]], 0.06, (x, y) => mk.mat(x, y) === 'snow' && mk.n(x, y, 16, 2, 4) > 0.48);
  mk.scatter([['snowdrift', 2], ['boulder', 1], ['tree-fir-snow', 1]], 0.012, (x, y) => mk.mat(x, y) === 'tundra');
  const trail = mk.road([mk.edgePoint(2, 0.3 + mk.rnd() * 0.4), [lx + lr + 4, ly], mk.edgePoint(0, 0.3 + mk.rnd() * 0.4)], 1, 'tundra');
  void trail;
  const cx = Math.floor(lx + lr + 8), cy = Math.floor(ly);
  mk.tryPut('campfire', cx - 1, cy - 1, cx + 1, cy + 1, () => true);
  for (const k of ['tent-round', 'lean-to', 'log-pile', 'igloo']) mk.tryPut(k, cx - 6, cy - 6, cx + 6, cy + 6, (x, y) => !mk.isWater(x, y));
  mk.note(cx, cy, 'A hunters\' camp: warm fire, cold welcome.');
}

/** A whole land at one mile a square: height and wetness make the ground, then rivers, towns and roads. */
function region(mk: Maker) {
  const { cols, rows } = mk;
  mk.m.scale = 5280;
  mk.m.viewRange = 400;
  // sea along one or two edges
  const seaA = Math.floor(mk.rnd() * 4), seaB = mk.rnd() < 0.5 ? (seaA + 1) % 4 : -1;
  const edgeD = (x: number, y: number, s: number) => (s === 0 ? y / rows : s === 1 ? 1 - x / cols : s === 2 ? 1 - y / rows : x / cols);
  const elevation = new Float32Array(cols * rows);
  const moist = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      let e = mk.n(x, y, cols / 3, 5, 1) * 0.75 + mk.n(x, y, cols / 10, 3, 2) * 0.25;
      const coast = Math.min(edgeD(x, y, seaA), seaB >= 0 ? edgeD(x, y, seaB) : 1);
      e = e * 0.7 + Math.min(1, coast * 3) * 0.45 - 0.2;
      // a mountain spine
      const ridge = 1 - Math.abs(mk.n(x, y, cols / 2.5, 2, 3) - 0.5) * 2;
      if (ridge > 0.8) e += (ridge - 0.8) * 1.6;
      elevation[y * cols + x] = e;
      moist[y * cols + x] = mk.n(x, y, cols / 4, 4, 4);
    }
  const E = (x: number, y: number) => elevation[y * cols + x];
  const SEA = 0.3, SHORE = 0.34, BEACH = 0.36;
  mk.fill((x, y) => {
    const e = E(x, y), w = moist[y * cols + x];
    if (e < SEA - 0.06) return 'ocean';
    if (e < SEA) return 'water-deep';
    if (e < SHORE) return 'water-shallow';
    if (e < BEACH) return 'beach-sand';
    if (e > 0.82) return 'snow';
    if (e > 0.7) return 'rocky-ground';
    if (e > 0.62) return w < 0.4 ? 'grass-dry' : 'tundra';
    if (w < 0.3) return e < 0.48 ? 'sand' : 'desert-cracked';
    if (w < 0.42) return 'grass-dry';
    if (w < 0.6) return w > 0.52 ? 'meadow' : 'grass';
    if (w < 0.72) return 'grass-lush';
    return e < 0.45 ? 'bog' : 'grass-lush';
  });
  // marsh pools in the wettest lowland
  mk.fill((x, y) => (moist[y * cols + x] > 0.74 && E(x, y) < 0.45 && E(x, y) >= BEACH && mk.n(x, y, 3, 1, 9) > 0.55 ? 'swamp-water' : null));
  // rivers: from high ground downhill to the sea
  const rivers = Math.max(2, Math.round(cols / 30));
  for (let r = 0; r < rivers; r++) {
    let best: number[] | null = null;
    for (let t = 0; t < 200; t++) {
      const x = Math.floor(mk.rnd() * cols), y = Math.floor(mk.rnd() * rows);
      if (E(x, y) > 0.66 && E(x, y) < 0.8) { best = [x, y]; break; }
    }
    if (!best) continue;
    let [x, y] = best;
    const seen = new Set<number>();
    for (let k = 0; k < cols * 3; k++) {
      if (mk.isWater(x, y) && k > 0) break;
      seen.add(y * cols + x);
      mk.paint(x, y, 'water-shallow');
      // go to the lowest unseen neighbour, with a little wander
      let nx = x, ny = y, low = Infinity;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const X = x + dx, Y = y + dy;
        if (!mk.in(X, Y) || seen.has(Y * cols + X)) continue;
        const v = E(X, Y) + mk.rnd() * 0.03;
        if (v < low) { low = v; nx = X; ny = Y; }
      }
      if (nx === x && ny === y) break;
      // carve: the river keeps running downhill
      if (E(nx, ny) > E(x, y)) elevation[ny * cols + nx] = E(x, y) - 0.001;
      x = nx; y = ny;
      if (!mk.in(x, y)) break;
    }
  }
  const land = (x: number, y: number) => !mk.isWater(x, y) && E(x, y) >= BEACH;
  // settlements: on land, flat-ish, near water, spaced apart
  const towns: { x: number; y: number; kind: string }[] = [];
  const near = (x: number, y: number, r: number) => towns.some((t) => Math.hypot(t.x - x, t.y - y) < r);
  const score = (x: number, y: number) => {
    if (!land(x, y) || E(x, y) > 0.6) return -1;
    let s = 1 - Math.abs(E(x, y) - 0.45);
    for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2], [1, 1], [-1, -1]]) if (mk.in(x + dx, y + dy) && mk.isWater(x + dx, y + dy)) s += 0.4;
    return s;
  };
  const want: [string, number, number][] = [['region-city', 1, 16], ['region-castle', 2, 12], ['region-town', Math.round(cols / 25), 10], ['region-village', Math.round(cols / 10), 6], ['region-tower', 2, 6], ['region-ruins', 3, 5], ['region-cave', 2, 5], ['region-port', 1, 10], ['region-camp', 1, 6]];
  for (const [kind, n, gap] of want) {
    for (let i = 0; i < n; i++) {
      const cand: [number, number, number][] = [];
      for (let t = 0; t < 500; t++) {
        const x = 2 + Math.floor(mk.rnd() * (cols - 4)), y = 2 + Math.floor(mk.rnd() * (rows - 4));
        if (near(x, y, gap)) continue;
        let s = score(x, y);
        if (kind === 'region-port') s = land(x, y) && [[2, 0], [-2, 0], [0, 2], [0, -2]].some(([a, b]) => mk.in(x + a, y + b) && ['ocean', 'water-deep'].includes(mk.mat(x + a, y + b))) ? 2 : -1;
        if (kind === 'region-cave' || kind === 'region-tower') s = land(x, y) && E(x, y) > 0.55 ? 1 + E(x, y) : -1;
        if (s >= 0) cand.push([s, x, y]);
      }
      cand.sort((p, q) => q[0] - p[0]);
      const [w, h] = mk.size(kind);
      const spot = cand.find(([, x, y]) => mk.fits(x - Math.floor(w / 2), y - Math.floor(h / 2), w, h, (X, Y) => land(X, Y) || kind === 'region-port', 0));
      if (!spot) continue;
      const best = [spot[1], spot[2]];
      mk.put(kind, best[0] - Math.floor(w / 2), best[1] - Math.floor(h / 2));
      towns.push({ x: best[0], y: best[1], kind });
    }
  }
  // roads: join each settlement to its nearest neighbours along the cheapest ground
  const settled = towns.filter((t) => /city|castle|town|village|port/.test(t.kind));
  const cost = (x: number, y: number) => {
    const m = mk.mat(x, y);
    if (m === 'ocean' || m === 'water-deep') return 999;
    if (m === 'trail') return 0.4;
    if (mk.isWater(x, y)) return 6;
    return 1 + Math.max(0, E(x, y) - 0.5) * 12 + (m === 'forest-floor' ? 1 : 0) + (m === 'bog' ? 3 : 0);
  };
  const route = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const N = cols * rows, dist = new Float32Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1);
    const heap: [number, number][] = [];
    const push = (d: number, i: number) => { heap.push([d, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0]; const last = heap.pop()!; if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let s = k; if (l < heap.length && heap[l][0] < heap[s][0]) s = l; if (r < heap.length && heap[r][0] < heap[s][0]) s = r; if (s === k) break; [heap[s], heap[k]] = [heap[k], heap[s]]; k = s; } } return top; };
    const s = a.y * cols + a.x, g = b.y * cols + b.x;
    dist[s] = 0; push(0, s);
    while (heap.length) {
      const [d, i] = pop();
      if (i === g) break;
      if (d > dist[i]) continue;
      const x = i % cols, y = (i / cols) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const X = x + dx, Y = y + dy;
        if (!mk.in(X, Y)) continue;
        const j = Y * cols + X, nd = d + cost(X, Y) * (dx && dy ? 1.41 : 1);
        if (nd < dist[j]) { dist[j] = nd; prev[j] = i; push(nd, j); }
      }
    }
    if (dist[g] > 900) return;
    const lay = (i: number) => {
      const x = i % cols, y = (i / cols) | 0;
      if (mk.occ[i]) return;
      if (!mk.isWater(x, y)) mk.paint(x, y, 'trail');
      else if (mk.mat(x, y) === 'water-shallow') mk.m.cells[i] = 1; // a ford or bridge
    };
    for (let i = prev[g], last = g; i >= 0 && i !== s; last = i, i = prev[i]) {
      lay(i);
      // a diagonal step gets a corner square too, so the trail stays joined up
      const x = i % cols, y = (i / cols) | 0, lx = last % cols, ly = (last / cols) | 0;
      if (x !== lx && y !== ly) lay(y * cols + lx);
    }
  };
  // a spanning tree over the settlements, nearest first, plus a few extra links so it isn't all dead ends
  const pairs: [number, number, number][] = [];
  for (let i = 0; i < settled.length; i++) for (let j = i + 1; j < settled.length; j++) pairs.push([Math.hypot(settled[i].x - settled[j].x, settled[i].y - settled[j].y), i, j]);
  pairs.sort((p, q) => p[0] - q[0]);
  const root = settled.map((_, i) => i);
  const find = (i: number): number => (root[i] === i ? i : (root[i] = find(root[i])));
  let extra = Math.round(settled.length / 4);
  for (const [d, i, j] of pairs) {
    const a = find(i), b = find(j);
    if (a !== b) { root[a] = b; route(settled[i], settled[j]); }
    else if (extra > 0 && d < cols * 0.25) { extra--; route(settled[i], settled[j]); }
  }
  // the land's features as map icons
  const free = (x: number, y: number) => land(x, y) && mk.mat(x, y) !== 'trail';
  mk.scatter([['region-mountains', 2], ['region-peak', 1]], 0.35, (x, y) => free(x, y) && E(x, y) > 0.72);
  mk.scatter([['region-hills', 1]], 0.25, (x, y) => free(x, y) && E(x, y) > 0.6 && E(x, y) <= 0.72);
  const forestV = (x: number, y: number) => free(x, y) && mk.mat(x, y) === 'grass-lush';
  mk.scatter([['region-forest', 1]], 0.5, forestV, [0, 1]);
  mk.scatter([['region-swamp', 1]], 0.15, (x, y) => free(x, y) && mk.mat(x, y) === 'bog');
  mk.tryPut('region-compass', cols - 5, rows - 5, cols, rows, () => true, { solid: true, tries: 5 }) ?? mk.tryPut('region-compass', 0, 0, 4, 4, () => true, { tries: 5 });
  const city = towns.find((t) => t.kind === 'region-city');
  if (city) mk.note(city.x, city.y, 'The capital. Roads lead out to every town.');
  mk.m.ambient = 'bright';
}

// ---------------------------------------------------------------------------------------------------------

const NAMES: Record<Biome, string[]> = {
  forest: ['Thornwood', 'The Greenhollow', 'Old Oak Wood', 'Mirkfern Forest', 'Ashgrove'],
  village: ['Millbrook', 'Harrowford', 'Elmstead', 'Brindle Cross', 'Oakham'],
  coast: ['Gullrock Shore', 'Saltmarsh Point', 'Wrecker\'s Cove', 'Brightwater Bay', 'Kelp Strand'],
  desert: ['The Ochre Waste', 'Sunscar Flats', 'Dunes of Kesh', 'Red Mesa', 'The Dry Sea'],
  swamp: ['Blackmire', 'The Sunken Fen', 'Croaker\'s Bog', 'Mossmere', 'Weepwater'],
  mountains: ['Greyfang Pass', 'The High Teeth', 'Stormcrag', 'Ironridge', 'Cloudstep Pass'],
  winter: ['The White Reach', 'Frostmere', 'Hoarfell', 'Ice Hollow', 'Wolfwinter'],
  region: ['The Kingdom of Aldmere', 'The Westmarch', 'Isles of Varrow', 'The Riverlands', 'Duskvale'],
};

export function outdoorMap(biome: Biome, size: OutdoorSize = 'medium', seed = Date.now()): GameMap {
  const reg = biome === 'region';
  const [cols, rows] = OUTDOOR_SIZES[size][reg ? 'region' : 'battle'];
  const nm = NAMES[biome][Math.abs(seed) % NAMES[biome].length];
  const mk = new Maker(nm, cols, rows, seed);
  const big = cols >= 120;
  if (biome === 'forest') forest(mk, big);
  else if (biome === 'village') village(mk, big);
  else if (biome === 'coast') coast(mk, big);
  else if (biome === 'desert') desert(mk, big);
  else if (biome === 'swamp') swamp(mk, big);
  else if (biome === 'mountains') mountains(mk, big);
  else if (biome === 'winter') { if (mk.rnd() < 0.5) winterland(mk, big); else mountains(mk, big, true); }
  else region(mk);
  const m = mk.done();
  m.wallStyle = 'stone';
  m.viewRange = m.viewRange ?? (big ? 60 : 40);
  return m;
}

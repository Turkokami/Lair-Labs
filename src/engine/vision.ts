// Dynamic lighting and line of sight on the square grid.
// Walls, shut doors and tall objects block sight along cell edges; light comes from the map's own
// lights, from lit objects (torches, braziers, campfires) and from what heroes carry. A hero sees a
// square when nothing blocks the line to it and the square is lit, or it is within their darkvision.
import { type GameMap, blocksSight, inBounds, isFloor } from './map';
import { objectById } from '../library/objects';

export interface LightSource { x: number; y: number; bright: number; dim: number; color: string; }
export interface Viewer { x: number; y: number; size: number; darkvision: number; light?: { bright: number; dim: number } }

/** Lights in the map: free lights plus lit objects. Positions are in grid units (centre of a cell = x + 0.5). */
export function mapLights(m: GameMap): LightSource[] {
  const out: LightSource[] = (m.lights ?? []).map((l) => ({ ...l }));
  for (const p of m.props) {
    if (p.off) continue;
    const d = objectById(p.kind);
    if (!d?.light) continue;
    const rot = ((p.rot % 360) + 360) % 360;
    const w = rot % 180 ? d.h : d.w, h = rot % 180 ? d.w : d.h;
    out.push({ x: p.x + w / 2, y: p.y + h / 2, ...d.light });
  }
  return out;
}

/** Objects that block sight (tall bookshelves are fine to see past; tree canopies and big pillars aren't). */
function blockedCells(m: GameMap): Set<number> {
  const out = new Set<number>();
  for (const p of m.props) {
    const d = objectById(p.kind);
    if (!d?.blocksSight) continue;
    const rot = ((p.rot % 360) + 360) % 360;
    const w = rot % 180 ? d.h : d.w, h = rot % 180 ? d.w : d.h;
    // a 3x3 tree blocks only its trunk square in the middle; pillars and buildings block their own squares
    if ((w >= 3 || h >= 3) && !d.solid) out.add((p.y + Math.floor(h / 2)) * m.cols + p.x + Math.floor(w / 2));
    else for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) out.add((p.y + j) * m.cols + p.x + i);
  }
  return out;
}

/** Sight-blocking edges as flat arrays, worked out once per map change: h[y * cols + x] is the top edge of (x, y), v[y * (cols + 1) + x] its left edge. */
interface EdgeGrid { h: Uint8Array; v: Uint8Array; cols: number }
const edgeMemo = new WeakMap<number[], { sig: string; grid: EdgeGrid }>();
function sightEdges(m: GameMap): EdgeGrid {
  // doors open and shut in place, so the few special edges are part of the key
  const sig = `${m.walls.join('|')}#${Object.entries(m.doors).join('|')}#${Object.entries(m.wallKinds ?? {}).join('|')}#${Object.entries(m.doorStyles ?? {}).join('|')}`;
  const hit = edgeMemo.get(m.cells);
  if (hit && hit.sig === sig) return hit.grid;
  const C = m.cols, R = m.rows;
  const h = new Uint8Array((R + 1) * C), v = new Uint8Array(R * (C + 1));
  const open = (x: number, y: number) => x >= 0 && y >= 0 && x < C && y < R && m.cells[y * C + x] > 0;
  for (let y = 0; y <= R; y++) for (let x = 0; x < C; x++) if (open(x, y) !== open(x, y - 1)) h[y * C + x] = 1;
  for (let y = 0; y < R; y++) for (let x = 0; x <= C; x++) if (open(x, y) !== open(x - 1, y)) v[y * (C + 1) + x] = 1;
  // the rare edges with doors, manual walls or see-through wall kinds go through the full rule
  const special = new Set<string>([...m.walls, ...Object.keys(m.doors), ...Object.keys(m.wallKinds ?? {})]);
  for (const k of special) {
    const t = k[0], [xs, ys] = k.slice(2).split(','), x = +xs, y = +ys;
    const b = blocksSight(m, k) ? 1 : 0;
    if (t === 'h' && x >= 0 && x < C && y >= 0 && y <= R) h[y * C + x] = b;
    else if (t === 'v' && x >= 0 && x <= C && y >= 0 && y < R) v[y * (C + 1) + x] = b;
  }
  const grid = { h, v, cols: C };
  edgeMemo.set(m.cells, { sig, grid });
  return grid;
}
const hBlocks = (e: EdgeGrid, x: number, y: number) => x < 0 || x >= e.cols || y < 0 || y * e.cols + x >= e.h.length ? true : e.h[y * e.cols + x] === 1;
const vBlocks = (e: EdgeGrid, x: number, y: number) => x < 0 || x > e.cols || y < 0 || y * (e.cols + 1) + x >= e.v.length ? true : e.v[y * (e.cols + 1) + x] === 1;

/**
 * Is the straight line from (ax,ay) to (bx,by) (grid units) clear of sight-blocking edges?
 * Walks the grid square by square (Amanatides and Woo). When the line passes exactly through a corner,
 * it is clear if either way round the corner is clear.
 */
export function clearLine(m: GameMap, ax: number, ay: number, bx: number, by: number, solid?: Set<number>, edges?: EdgeGrid): boolean {
  let cx = Math.floor(ax), cy = Math.floor(ay);
  const tx = Math.floor(bx), ty = Math.floor(by);
  const dx = bx - ax, dy = by - ay;
  const sx = dx > 0 ? 1 : dx < 0 ? -1 : 0, sy = dy > 0 ? 1 : dy < 0 ? -1 : 0;
  const tdx = sx ? Math.abs(1 / dx) : Infinity, tdy = sy ? Math.abs(1 / dy) : Infinity;
  let tmx = sx > 0 ? (cx + 1 - ax) * tdx : sx < 0 ? (ax - cx) * tdx : Infinity;
  let tmy = sy > 0 ? (cy + 1 - ay) * tdy : sy < 0 ? (ay - cy) * tdy : Infinity;
  const E = edges ?? sightEdges(m);
  const xEdge = (x: number, y: number) => vBlocks(E, sx > 0 ? x + 1 : x, y);
  const yEdge = (x: number, y: number) => hBlocks(E, x, sy > 0 ? y + 1 : y);
  const start = cy * m.cols + cx;
  for (let guard = 0; guard < 2000; guard++) {
    if (cx === tx && cy === ty) return true;
    if (solid && solid.has(cy * m.cols + cx) && cy * m.cols + cx !== start) return false;
    if (Math.abs(tmx - tmy) < 1e-9) {
      // through a corner
      const a = !xEdge(cx, cy) && !yEdge(cx + sx, cy);
      const b = !yEdge(cx, cy) && !xEdge(cx, cy + sy);
      if (!a && !b) return false;
      cx += sx;
      cy += sy;
      tmx += tdx;
      tmy += tdy;
    } else if (tmx < tmy) {
      if (xEdge(cx, cy)) return false;
      cx += sx;
      tmx += tdx;
    } else {
      if (yEdge(cx, cy)) return false;
      cy += sy;
      tmy += tdy;
    }
    if (tmx > 1 && tmy > 1 && !(cx === tx && cy === ty)) return true; // past the end point inside the target
  }
  return true;
}

const SAMPLES: [number, number][] = [[0.5, 0.5], [0.12, 0.12], [0.88, 0.12], [0.12, 0.88], [0.88, 0.88]];

/**
 * Cells with a clear line from a point, out to `range` squares. Only cells that can be reached by
 * crossing see-through edges are tested, so a big map stays fast.
 */
export function sightFrom(m: GameMap, ox: number, oy: number, range: number, solid?: Set<number>): Set<number> {
  const out = new Set<number>();
  const sx = Math.floor(ox), sy = Math.floor(oy);
  if (!inBounds(m, sx, sy)) return out;
  const E = sightEdges(m);
  const seen = new Set<number>([sy * m.cols + sx]);
  const q: number[] = [sy * m.cols + sx];
  const r2 = (range + 0.75) * (range + 0.75);
  while (q.length) {
    const id = q.pop()!;
    const x = id % m.cols, y = (id / m.cols) | 0;
    const ddx = x + 0.5 - ox, ddy = y + 0.5 - oy;
    if (ddx * ddx + ddy * ddy > r2) continue;
    let ok = x === sx && y === sy;
    if (!ok) for (const [fx, fy] of SAMPLES) if (clearLine(m, ox, oy, x + fx, y + fy, solid, E)) { ok = true; break; }
    if (!ok) continue;
    out.add(id);
    if (!isFloor(m, x, y) && !(x === sx && y === sy)) continue; // see the face of the rock, not into it
    for (const [nx, ny, b] of [[x + 1, y, vBlocks(E, x + 1, y)], [x - 1, y, vBlocks(E, x, y)], [x, y + 1, hBlocks(E, x, y + 1)], [x, y - 1, hBlocks(E, x, y)]] as [number, number, boolean][]) {
      if (!inBounds(m, nx, ny)) continue;
      const nid = ny * m.cols + nx;
      if (seen.has(nid)) continue;
      // we still add the cell behind a wall to the queue so the wall's far face isn't lit, but it fails clearLine
      if (b && isFloor(m, nx, ny)) continue;
      seen.add(nid);
      q.push(nid);
    }
  }
  return out;
}

export interface VisionResult {
  /** 0 dark, 1 dim, 2 bright, per cell */
  light: Uint8Array;
  /** cells the party can see now */
  visible: Set<number>;
}

/** Light level of every cell from the ambient light and all sources. */
export function lightMap(m: GameMap, sources: LightSource[], solid = blockedCells(m)): Uint8Array {
  const n = m.cols * m.rows;
  const base = m.ambient === 'dark' ? 0 : m.ambient === 'dim' ? 1 : 2;
  const out = new Uint8Array(n).fill(base);
  if (base === 2) return out;
  for (const L of sources) {
    const bright = L.bright / 5, total = (L.bright + L.dim) / 5;
    if (total <= 0) continue;
    for (const id of sightFrom(m, L.x, L.y, total, solid)) {
      const x = id % m.cols, y = (id / m.cols) | 0;
      const d = Math.hypot(x + 0.5 - L.x, y + 0.5 - L.y);
      const lv = d <= bright + 0.5 ? 2 : d <= total + 0.5 ? 1 : 0;
      if (lv > out[id]) out[id] = lv;
    }
  }
  return out;
}

/** What a group of heroes sees together. */
export function partyVision(m: GameMap, viewers: Viewer[], extraLights: LightSource[] = []): VisionResult {
  const solid = blockedCells(m);
  const carried: LightSource[] = viewers
    .filter((v) => v.light && v.light.bright + v.light.dim > 0)
    .map((v) => ({ x: v.x + v.size / 2, y: v.y + v.size / 2, bright: v.light!.bright, dim: v.light!.dim, color: '#ffcf80' }));
  const light = lightMap(m, [...mapLights(m), ...extraLights, ...carried], solid);
  const visible = new Set<number>();
  // open country: sight reaches about 400 ft unless the map says otherwise, so huge maps stay quick
  const far = Math.min(Math.max(m.cols, m.rows), m.viewRange ?? 80);
  for (const v of viewers) {
    const ox = v.x + v.size / 2, oy = v.y + v.size / 2;
    const dv = v.darkvision / 5;
    for (const id of sightFrom(m, ox, oy, far, solid)) {
      const x = id % m.cols, y = (id / m.cols) | 0;
      const d = Math.hypot(x + 0.5 - ox, y + 0.5 - oy);
      if (light[id] > 0 || d <= dv + 0.5 || d <= 1.5) visible.add(id);
    }
  }
  // the rock around anything visible, so the walls show
  for (const id of [...visible]) {
    const x = id % m.cols, y = (id / m.cols) | 0;
    if (!isFloor(m, x, y)) continue;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (inBounds(m, nx, ny) && !isFloor(m, nx, ny)) visible.add(ny * m.cols + nx);
      }
  }
  return { light, visible };
}

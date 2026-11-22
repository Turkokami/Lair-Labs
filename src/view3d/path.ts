// Grid paths for the 3D view: every square a token can reach this turn, with the route there, using the same
// rules as the engine's move cost (5 ft a square, diagonals 5 ft, rubble and water double, no squeezing past corners).
import { type GameMap, isFloor, cell, blocks, edgeBetween } from '../engine/map';

export interface Reach { cost: Map<number, number>; prev: Map<number, number> }

const stepCost = (m: GameMap, x: number, y: number) => (cell(m, x, y) === 3 || cell(m, x, y) === 2 ? 10 : 5);

export function reach(m: GameMap, fx: number, fy: number, maxFeet: number): Reach {
  const W = m.cols;
  const cost = new Map<number, number>([[fy * W + fx, 0]]);
  const prev = new Map<number, number>();
  const open: [number, number, number][] = [[0, fx, fy]];
  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [d, x, y] = open.shift()!;
    if (d > (cost.get(y * W + x) ?? Infinity)) continue;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (!isFloor(m, nx, ny) || cell(m, nx, ny) === 4 || cell(m, nx, ny) === 5) continue;
        if (dx && dy) {
          const a = edgeBetween(x, y, nx, y)!, b = edgeBetween(nx, y, nx, ny)!;
          const c = edgeBetween(x, y, x, ny)!, e = edgeBetween(x, ny, nx, ny)!;
          if (blocks(m, a) || blocks(m, b) || blocks(m, c) || blocks(m, e)) continue;
        } else if (blocks(m, edgeBetween(x, y, nx, ny)!)) continue;
        const nd = d + stepCost(m, nx, ny);
        if (nd > maxFeet) continue;
        const id = ny * W + nx;
        if (nd < (cost.get(id) ?? Infinity)) {
          cost.set(id, nd);
          prev.set(id, y * W + x);
          open.push([nd, nx, ny]);
        }
      }
  }
  return { cost, prev };
}

/** Square centres from start to target (start excluded), or a straight hop when no route is known. */
export function route(m: GameMap, fx: number, fy: number, tx: number, ty: number, size = 1): [number, number][] {
  const r = reach(m, fx, fy, 400);
  const W = m.cols;
  let id = ty * W + tx;
  if (!r.cost.has(id)) return [[tx + size / 2, ty + size / 2]];
  const out: [number, number][] = [];
  const start = fy * W + fx;
  let guard = 0;
  while (id !== start && guard++ < 500) {
    out.unshift([(id % W) + size / 2, Math.floor(id / W) + size / 2]);
    const p = r.prev.get(id);
    if (p === undefined) break;
    id = p;
  }
  return out;
}

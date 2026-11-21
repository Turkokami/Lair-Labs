// Area-of-effect shapes (SRD 5.2 rules, simplified to the grid): a square is hit when its centre is inside the shape.
import type { AreaTemplate } from './game';

type Shape = Pick<AreaTemplate, 'shape' | 'x' | 'y' | 'tx' | 'ty' | 'size'>;

/** Direction from origin to target as a unit vector (defaults to east). */
function dir(t: Shape): [number, number] {
  const dx = t.tx - t.x, dy = t.ty - t.y;
  const d = Math.hypot(dx, dy);
  return d < 1e-6 ? [1, 0] : [dx / d, dy / d];
}

/** Cube: a square with one corner on the origin, growing toward the target. */
function cubeRect(t: Shape): [number, number, number, number] {
  const L = t.size / 5;
  const sx = t.tx >= t.x ? 1 : -1, sy = t.ty >= t.y ? 1 : -1;
  const x0 = sx > 0 ? t.x : t.x - L, y0 = sy > 0 ? t.y : t.y - L;
  return [x0, y0, L, L];
}

export function inArea(t: Shape, px: number, py: number): boolean {
  const L = t.size / 5;
  const dx = px - t.x, dy = py - t.y;
  switch (t.shape) {
    case 'sphere':
      return dx * dx + dy * dy <= L * L + 1e-6;
    case 'cube': {
      const [x0, y0, w, h] = cubeRect(t);
      return px >= x0 && px <= x0 + w && py >= y0 && py <= y0 + h;
    }
    case 'cone': {
      const [ux, uy] = dir(t);
      const along = dx * ux + dy * uy;
      if (along <= 0 || along > L + 1e-6) return false;
      const across = Math.abs(dx * uy - dy * ux);
      return across <= along * 0.5 + 1e-6; // width at the end equals the length
    }
    case 'line': {
      const [ux, uy] = dir(t);
      const along = dx * ux + dy * uy;
      const across = Math.abs(dx * uy - dy * ux);
      return along >= 0 && along <= L + 1e-6 && across <= 0.5 + 1e-6;
    }
  }
  return false;
}

/** Squares inside the shape. */
export function areaCells(t: Shape, cols: number, rows: number): [number, number][] {
  const L = t.size / 5 + 1;
  const out: [number, number][] = [];
  const x0 = Math.max(0, Math.floor(Math.min(t.x, t.tx) - L)), x1 = Math.min(cols - 1, Math.ceil(Math.max(t.x, t.tx) + L));
  const y0 = Math.max(0, Math.floor(Math.min(t.y, t.ty) - L)), y1 = Math.min(rows - 1, Math.ceil(Math.max(t.y, t.ty) + L));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inArea(t, x + 0.5, y + 0.5)) out.push([x, y]);
  return out;
}

/** Tokens touched by the shape (any of their squares). */
export function tokensInArea<T extends { id: string; x: number; y: number; size: number }>(t: Shape, tokens: T[]): T[] {
  return tokens.filter((k) => {
    for (let j = 0; j < k.size; j++) for (let i = 0; i < k.size; i++) if (inArea(t, k.x + i + 0.5, k.y + j + 0.5)) return true;
    return false;
  });
}

/** Trace the shape's outline as a path (call stroke() after). */
export function templateOutline(g: CanvasRenderingContext2D, t: Shape, cell: number) {
  const L = (t.size / 5) * cell;
  const ox = t.x * cell, oy = t.y * cell;
  g.beginPath();
  if (t.shape === 'sphere') g.arc(ox, oy, L, 0, Math.PI * 2);
  else if (t.shape === 'cube') {
    const [x0, y0, w] = cubeRect(t);
    g.rect(x0 * cell, y0 * cell, w * cell, w * cell);
  } else {
    const [ux, uy] = dir(t);
    const nx = -uy, ny = ux;
    if (t.shape === 'cone') {
      g.moveTo(ox, oy);
      g.lineTo(ox + ux * L + nx * L * 0.5, oy + uy * L + ny * L * 0.5);
      g.lineTo(ox + ux * L - nx * L * 0.5, oy + uy * L - ny * L * 0.5);
      g.closePath();
    } else {
      const hw = cell / 2;
      g.moveTo(ox + nx * hw, oy + ny * hw);
      g.lineTo(ox + ux * L + nx * hw, oy + uy * L + ny * hw);
      g.lineTo(ox + ux * L - nx * hw, oy + uy * L - ny * hw);
      g.lineTo(ox - nx * hw, oy - ny * hw);
      g.closePath();
    }
  }
}

/** Grid distance in feet the way the SRD counts it: every square is 5 ft, diagonals too. */
export function gridFeet(ax: number, ay: number, bx: number, by: number) {
  return Math.max(Math.abs(Math.floor(bx) - Math.floor(ax)), Math.abs(Math.floor(by) - Math.floor(ay))) * 5;
}

// Universal VTT import (.uvtt / .dd2vtt / .df2vtt): the open JSON format many map makers export.
// The picture becomes the map's backdrop; its line-of-sight walls snap to our grid edges, its portals
// become doors and its lights become map lights.
import { type GameMap, type MapLight, blankMap, hKey, vKey, pid } from './map';

interface Pt { x: number; y: number }
export interface UvttFile {
  format?: number;
  resolution?: { map_origin?: Pt; map_size?: Pt; pixels_per_grid?: number };
  line_of_sight?: Pt[][];
  objects_line_of_sight?: Pt[][];
  portals?: { position: Pt; bounds: Pt[]; rotation?: number; closed?: boolean; freestanding?: boolean }[];
  lights?: { position: Pt; range?: number; intensity?: number; color?: string; shadows?: boolean }[];
  environment?: { ambient_light?: string };
  image?: string;
}

/** Does segment p1-p2 cross segment p3-p4? */
function crosses(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number) {
  const d = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
  if (Math.abs(d) < 1e-9) return false;
  const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / d;
  const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / d;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

/** Grid edges between neighbouring squares whose centre-to-centre line a wall segment crosses. */
export function edgesCrossed(a: Pt, b: Pt, cols: number, rows: number): string[] {
  const out: string[] = [];
  const x0 = Math.max(0, Math.floor(Math.min(a.x, b.x)) - 1), x1 = Math.min(cols - 1, Math.ceil(Math.max(a.x, b.x)) + 1);
  const y0 = Math.max(0, Math.floor(Math.min(a.y, b.y)) - 1), y1 = Math.min(rows - 1, Math.ceil(Math.max(a.y, b.y)) + 1);
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      // to the right neighbour: edge v:x+1,y
      if (x + 1 < cols && crosses(a.x, a.y, b.x, b.y, x + 0.5, y + 0.5, x + 1.5, y + 0.5)) out.push(vKey(x + 1, y));
      if (y + 1 < rows && crosses(a.x, a.y, b.x, b.y, x + 0.5, y + 0.5, x + 0.5, y + 1.5)) out.push(hKey(x, y + 1));
    }
  return out;
}

export interface UvttResult { map: GameMap; image?: string; imageType: string; }

/** Convert a Universal VTT file. Throws if it isn't one. */
export function fromUvtt(f: UvttFile, name = 'Imported map'): UvttResult {
  const r = f.resolution;
  if (!r?.map_size?.x || !r.map_size.y) throw new Error('That file is not a Universal VTT map.');
  const cols = Math.min(120, Math.round(r.map_size.x)), rows = Math.min(120, Math.round(r.map_size.y));
  const o = r.map_origin ?? { x: 0, y: 0 };
  const P = (p: Pt) => ({ x: p.x - o.x, y: p.y - o.y });
  const m = blankMap(cols, rows, name);
  m.cells = new Array(cols * rows).fill(1);
  const walls = new Set<string>();
  for (const line of [...(f.line_of_sight ?? []), ...(f.objects_line_of_sight ?? [])]) {
    for (let i = 0; i + 1 < line.length; i++) for (const k of edgesCrossed(P(line[i]), P(line[i + 1]), cols, rows)) walls.add(k);
  }
  const doors: GameMap['doors'] = {};
  for (const p of f.portals ?? []) {
    if (!p.bounds || p.bounds.length < 2) continue;
    const a = P(p.bounds[0]), b = P(p.bounds[1]);
    let ks = edgesCrossed(a, b, cols, rows);
    if (!ks.length) {
      // a narrow door between two centres: take the grid edge nearest its middle
      const c = P(p.position ?? { x: (p.bounds[0].x + p.bounds[1].x) / 2, y: (p.bounds[0].y + p.bounds[1].y) / 2 });
      ks = [Math.abs(b.x - a.x) < Math.abs(b.y - a.y) ? vKey(Math.round(c.x), Math.floor(c.y)) : hKey(Math.floor(c.x), Math.round(c.y))];
    }
    for (const k of ks) {
      doors[k] = p.closed === false ? 'open' : 'closed';
      walls.delete(k);
    }
  }
  const lights: MapLight[] = (f.lights ?? []).map((l) => {
    const ft = Math.max(5, Math.round(((l.range ?? 4) * 5) / 5) * 5);
    const c = l.color && /^[0-9a-f]{6,8}$/i.test(l.color) ? `#${l.color.slice(l.color.length === 8 ? 2 : 0)}` : '#ffd8a0';
    return { id: pid(), x: P(l.position).x, y: P(l.position).y, bright: Math.round(ft / 2 / 5) * 5 || 5, dim: Math.round(ft / 2 / 5) * 5 || 5, color: c };
  });
  const amb = f.environment?.ambient_light;
  // ambient is an ARGB hex; dark maps have a low brightness
  let ambient: GameMap['ambient'] = 'bright';
  if (amb && /^[0-9a-f]{8}$/i.test(amb)) {
    const [rr, gg, bb] = [2, 4, 6].map((i) => parseInt(amb.slice(i, i + 2), 16));
    const lum = (rr * 0.3 + gg * 0.59 + bb * 0.11) / 255;
    ambient = lum < 0.25 ? 'dark' : lum < 0.6 ? 'dim' : 'bright';
  }
  const map: GameMap = {
    ...m, walls: [...walls], doors, lights, ambient, wallStyle: 'stone',
    backdrop: f.image ? { id: pid(), w: cols, h: rows } : undefined,
  };
  const head = f.image?.slice(0, 16) ?? '';
  const imageType = head.startsWith('/9j/') ? 'image/jpeg' : head.startsWith('UklG') ? 'image/webp' : 'image/png';
  return { map, image: f.image, imageType };
}

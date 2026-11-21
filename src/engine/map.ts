// Grid map model. Walls are derived: every edge between floor and rock is a wall, so rooms that
// touch merge and the shared wall disappears. Doors sit on wall edges.
export type DoorState = 'closed' | 'open' | 'locked' | 'secret';
export type Tile = 0 | 1 | 2 | 3 | 4; // 0 rock, 1 floor, 2 water, 3 difficult, 4 pit
export const TILE_NAMES: Record<number, string> = { 0: 'Rock', 1: 'Floor', 2: 'Water', 3: 'Rubble (difficult)', 4: 'Pit' };

export interface Prop { id: string; kind: string; x: number; y: number; rot: number; gmOnly?: boolean; }
export interface Note { id: string; x: number; y: number; text: string; }

export interface GameMap {
  id: string;
  name: string;
  cols: number;
  rows: number;
  theme: 'stone' | 'cave' | 'wood';
  cells: number[];
  walls: string[]; // manual extra walls (edge keys)
  doors: Record<string, DoorState>;
  props: Prop[];
  notes: Note[];
}

export const PROP_KINDS = ['chest', 'barrel', 'crate', 'table', 'bed', 'bookshelf', 'altar', 'statue', 'pillar', 'rubble', 'campfire', 'torch', 'stairs', 'well', 'trap'];
export const PROP_LABELS: Record<string, string> = {
  chest: 'Chest', barrel: 'Barrel', crate: 'Crate', table: 'Table', bed: 'Bed', bookshelf: 'Bookshelf', altar: 'Altar',
  statue: 'Statue', pillar: 'Pillar', rubble: 'Rubble', campfire: 'Campfire', torch: 'Torch', stairs: 'Stairs', well: 'Well', trap: 'Trap (GM only)',
};

let idc = 0;
export const pid = () => `p${Date.now().toString(36)}${(idc++).toString(36)}`;

export function blankMap(cols = 30, rows = 22, name = 'New map'): GameMap {
  return { id: pid(), name, cols, rows, theme: 'stone', cells: new Array(cols * rows).fill(0), walls: [], doors: {}, props: [], notes: [] };
}

export const inBounds = (m: GameMap, x: number, y: number) => x >= 0 && y >= 0 && x < m.cols && y < m.rows;
export const cell = (m: GameMap, x: number, y: number) => (inBounds(m, x, y) ? m.cells[y * m.cols + x] : 0);
export const isFloor = (m: GameMap, x: number, y: number) => cell(m, x, y) > 0;

/** "h:x,y" = top edge of cell (x,y); "v:x,y" = left edge of cell (x,y). */
export const hKey = (x: number, y: number) => `h:${x},${y}`;
export const vKey = (x: number, y: number) => `v:${x},${y}`;
export function parseEdge(k: string) {
  const [t, rest] = k.split(':');
  const [x, y] = rest.split(',').map(Number);
  return { t: t as 'h' | 'v', x, y };
}
/** The two cells on either side of an edge. */
export function edgeCells(k: string): [[number, number], [number, number]] {
  const { t, x, y } = parseEdge(k);
  return t === 'h' ? [[x, y - 1], [x, y]] : [[x - 1, y], [x, y]];
}
export function edgeBetween(x1: number, y1: number, x2: number, y2: number): string | null {
  if (x1 === x2 && Math.abs(y1 - y2) === 1) return hKey(x1, Math.max(y1, y2));
  if (y1 === y2 && Math.abs(x1 - x2) === 1) return vKey(Math.max(x1, x2), y1);
  return null;
}

const wallSet = new WeakMap<GameMap, { cells: number[]; walls: string[]; set: Set<string> }>();
function manualWalls(m: GameMap) {
  const c = wallSet.get(m);
  if (c && c.walls === m.walls) return c.set;
  const set = new Set(m.walls);
  wallSet.set(m, { cells: m.cells, walls: m.walls, set });
  return set;
}

export function isWall(m: GameMap, k: string): boolean {
  if (m.doors[k]) return true;
  const [[ax, ay], [bx, by]] = edgeCells(k);
  if (isFloor(m, ax, ay) !== isFloor(m, bx, by)) return true;
  return isFloor(m, ax, ay) && manualWalls(m).has(k);
}

/** Does this edge stop movement and sight? Open doors don't. */
export function blocks(m: GameMap, k: string): boolean {
  const d = m.doors[k];
  if (d) return d !== 'open';
  return isWall(m, k);
}

/** All wall edges to draw. */
export function allWallEdges(m: GameMap): string[] {
  const out: string[] = [];
  for (let y = 0; y <= m.rows; y++)
    for (let x = 0; x <= m.cols; x++) {
      if (x < m.cols) {
        const k = hKey(x, y);
        if (isWall(m, k)) out.push(k);
      }
      if (y < m.rows) {
        const k = vKey(x, y);
        if (isWall(m, k)) out.push(k);
      }
    }
  return out;
}

export function setCells(m: GameMap, pts: [number, number][], v: number): GameMap {
  const cells = m.cells.slice();
  for (const [x, y] of pts) if (inBounds(m, x, y)) cells[y * m.cols + x] = v;
  // Doors left floating in rock or open floor are cleaned up.
  const next = { ...m, cells };
  const doors: Record<string, DoorState> = {};
  for (const [k, s] of Object.entries(m.doors)) {
    const [[ax, ay], [bx, by]] = edgeCells(k);
    if (isFloor(next, ax, ay) || isFloor(next, bx, by)) doors[k] = s;
  }
  return { ...next, doors };
}

export function rectCells(x1: number, y1: number, x2: number, y2: number): [number, number][] {
  const out: [number, number][] = [];
  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) out.push([x, y]);
  return out;
}

/** An L-shaped corridor from a to b, `width` squares wide. */
export function corridorCells(ax: number, ay: number, bx: number, by: number, width = 1): [number, number][] {
  const out: [number, number][] = [];
  const add = (x: number, y: number) => {
    for (let i = 0; i < width; i++) for (let j = 0; j < width; j++) out.push([x + i, y + j]);
  };
  const sx = Math.sign(bx - ax), sy = Math.sign(by - ay);
  let x = ax, y = ay;
  add(x, y);
  while (x !== bx) { x += sx; add(x, y); }
  while (y !== by) { y += sy; add(x, y); }
  return out;
}

/** Nearest edge to a point in grid units (fractional), if within reach. */
export function nearestEdge(gx: number, gy: number): string {
  const cx = Math.floor(gx), cy = Math.floor(gy);
  const fx = gx - cx, fy = gy - cy;
  const d = [
    { k: hKey(cx, cy), d: fy },
    { k: hKey(cx, cy + 1), d: 1 - fy },
    { k: vKey(cx, cy), d: fx },
    { k: vKey(cx + 1, cy), d: 1 - fx },
  ].sort((a, b) => a.d - b.d);
  return d[0].k;
}

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** Flood-fill a room: floor cells reachable without crossing walls or any door. */
export function floodRoom(m: GameMap, x: number, y: number, limit = 2500): number[] {
  if (!isFloor(m, x, y)) return [];
  const seen = new Set<number>([y * m.cols + x]);
  const q: [number, number][] = [[x, y]];
  while (q.length && seen.size < limit) {
    const [cx, cy] = q.shift()!;
    for (const [dx, dy] of N4) {
      const nx = cx + dx, ny = cy + dy;
      if (!isFloor(m, nx, ny)) continue;
      const k = edgeBetween(cx, cy, nx, ny)!;
      if (isWall(m, k)) continue; // doors count as walls here: a room ends at its doors
      const id = ny * m.cols + nx;
      if (seen.has(id)) continue;
      seen.add(id);
      q.push([nx, ny]);
    }
  }
  return [...seen];
}

/** Cells to reveal around a hero: their room plus a one-square ring so walls show. */
export function revealAround(m: GameMap, x: number, y: number): number[] {
  const room = floodRoom(m, x, y);
  const out = new Set(room);
  for (const id of room) {
    const cx = id % m.cols, cy = Math.floor(id / m.cols);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) if (inBounds(m, cx + dx, cy + dy)) out.add((cy + dy) * m.cols + cx + dx);
  }
  return [...out];
}

const stepCost = (m: GameMap, x: number, y: number) => (cell(m, x, y) === 3 || cell(m, x, y) === 2 ? 10 : 5);

/** Movement cost in feet (5 ft per square, diagonals 5 ft, difficult terrain doubles). */
export function moveCost(m: GameMap, fx: number, fy: number, tx: number, ty: number, maxFeet = 1000): number {
  if (fx === tx && fy === ty) return 0;
  if (!isFloor(m, tx, ty)) return Infinity;
  const W = m.cols;
  const dist = new Map<number, number>([[fy * W + fx, 0]]);
  const open: [number, number, number][] = [[0, fx, fy]];
  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [d, x, y] = open.shift()!;
    if (x === tx && y === ty) return d;
    if (d > maxFeet) return Infinity;
    if (d > (dist.get(y * W + x) ?? Infinity)) continue;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (!isFloor(m, nx, ny)) continue;
        if (dx && dy) {
          // no squeezing diagonally past a wall corner
          const a = edgeBetween(x, y, nx, y)!, b = edgeBetween(nx, y, nx, ny)!;
          const c = edgeBetween(x, y, x, ny)!, e = edgeBetween(x, ny, nx, ny)!;
          if (blocks(m, a) || blocks(m, b) || blocks(m, c) || blocks(m, e)) continue;
        } else if (blocks(m, edgeBetween(x, y, nx, ny)!)) continue;
        const nd = d + stepCost(m, nx, ny);
        const id = ny * W + nx;
        if (nd < (dist.get(id) ?? Infinity)) {
          dist.set(id, nd);
          open.push([nd, nx, ny]);
        }
      }
  }
  return Infinity;
}

// ---------- Templates and the random dungeon ----------
type Room = { x: number; y: number; w: number; h: number };

function build(name: string, cols: number, rows: number, rooms: Room[], corridors: [number, number, number, number, number?][], doors: [string, DoorState][], props: Omit<Prop, 'id'>[], theme: GameMap['theme'] = 'stone', notes: Omit<Note, 'id'>[] = []): GameMap {
  let m = blankMap(cols, rows, name);
  m.theme = theme;
  for (const r of rooms) m = setCells(m, rectCells(r.x, r.y, r.x + r.w - 1, r.y + r.h - 1), 1);
  for (const [ax, ay, bx, by, w] of corridors) m = setCells(m, corridorCells(ax, ay, bx, by, w ?? 1), 1);
  for (const [k, s] of doors) m.doors[k] = s;
  m.props = props.map((p) => ({ ...p, id: pid() }));
  m.notes = notes.map((n) => ({ ...n, id: pid() }));
  return m;
}

export function addDoorsAtRoomEntrances(m: GameMap, rooms: Room[], chance = 1, rnd = Math.random): GameMap {
  const inRoom = (x: number, y: number) => rooms.some((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  const doors = { ...m.doors };
  for (let y = 0; y < m.rows; y++)
    for (let x = 0; x < m.cols; x++) {
      if (!isFloor(m, x, y) || !inRoom(x, y)) continue;
      for (const [dx, dy] of N4) {
        const nx = x + dx, ny = y + dy;
        if (!isFloor(m, nx, ny) || inRoom(nx, ny)) continue;
        // corridor square touching a room: door if the corridor is one square wide here
        const side1 = dx ? isFloor(m, nx, ny - 1) : isFloor(m, nx - 1, ny);
        const side2 = dx ? isFloor(m, nx, ny + 1) : isFloor(m, nx + 1, ny);
        if (side1 || side2) continue;
        if (rnd() <= chance) doors[edgeBetween(x, y, nx, ny)!] = 'closed';
      }
    }
  return { ...m, doors };
}

export function randomDungeon(size: 'small' | 'medium' | 'large' = 'small', seed = Date.now()): GameMap {
  let s = seed >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000);
  const target = size === 'small' ? 6 : size === 'medium' ? 12 : 20;
  const cols = size === 'small' ? 36 : size === 'medium' ? 52 : 70;
  const rows = size === 'small' ? 26 : size === 'medium' ? 38 : 50;
  const rooms: Room[] = [];
  for (let tries = 0; rooms.length < target && tries < 600; tries++) {
    const w = 4 + Math.floor(rnd() * 6), h = 4 + Math.floor(rnd() * 5);
    const x = 1 + Math.floor(rnd() * (cols - w - 2)), y = 1 + Math.floor(rnd() * (rows - h - 2));
    if (rooms.some((r) => x < r.x + r.w + 2 && x + w + 2 > r.x && y < r.y + r.h + 2 && y + h + 2 > r.y)) continue;
    rooms.push({ x, y, w, h });
  }
  rooms.sort((a, b) => a.x + a.y - (b.x + b.y));
  const center = (r: Room) => [r.x + Math.floor(r.w / 2), r.y + Math.floor(r.h / 2)] as const;
  const corridors: [number, number, number, number][] = [];
  for (let i = 1; i < rooms.length; i++) {
    const [ax, ay] = center(rooms[i - 1]);
    const [bx, by] = center(rooms[i]);
    corridors.push(rnd() < 0.5 ? [ax, ay, bx, by] : [bx, by, ax, ay]);
  }
  let m = build(`Random dungeon (${size})`, cols, rows, rooms, corridors, [], []);
  m = addDoorsAtRoomEntrances(m, rooms, 0.7, rnd);
  const kinds = ['chest', 'barrel', 'crate', 'rubble', 'pillar', 'statue', 'table'];
  for (const r of rooms) {
    const n = Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) m.props.push({ id: pid(), kind: kinds[Math.floor(rnd() * kinds.length)], x: r.x + Math.floor(rnd() * r.w), y: r.y + Math.floor(rnd() * r.h), rot: 0 });
  }
  m.props.push({ id: pid(), kind: 'stairs', x: center(rooms[0])[0], y: center(rooms[0])[1], rot: 0 });
  return m;
}

export interface MapTemplate { id: string; name: string; blurb: string; make: () => GameMap; }

export const TEMPLATES: MapTemplate[] = [
  {
    id: 'crypt', name: 'The Sunken Crypt', blurb: 'Entry hall, two side chambers, a flooded chapel and a locked vault.',
    make: () => build('The Sunken Crypt', 34, 24,
      [{ x: 2, y: 9, w: 6, h: 6 }, { x: 12, y: 8, w: 9, h: 8 }, { x: 13, y: 1, w: 7, h: 5 }, { x: 13, y: 18, w: 7, h: 5 }, { x: 25, y: 7, w: 7, h: 10 }],
      [[7, 11, 12, 11], [16, 5, 16, 8], [16, 15, 16, 18], [20, 12, 25, 12]],
      [[vKey(8, 11), 'closed'], [vKey(12, 11), 'open'], [hKey(16, 6), 'closed'], [hKey(16, 18), 'secret'], [vKey(25, 12), 'locked']],
      [
        { kind: 'stairs', x: 3, y: 11, rot: 0 }, { kind: 'pillar', x: 13, y: 9, rot: 0 }, { kind: 'pillar', x: 19, y: 9, rot: 0 }, { kind: 'pillar', x: 13, y: 14, rot: 0 }, { kind: 'pillar', x: 19, y: 14, rot: 0 },
        { kind: 'altar', x: 16, y: 2, rot: 0 }, { kind: 'statue', x: 14, y: 2, rot: 0 }, { kind: 'statue', x: 18, y: 2, rot: 0 }, { kind: 'chest', x: 30, y: 8, rot: 0 }, { kind: 'chest', x: 30, y: 15, rot: 0 },
        { kind: 'rubble', x: 15, y: 20, rot: 0 }, { kind: 'bookshelf', x: 19, y: 21, rot: 0 }, { kind: 'trap', x: 22, y: 12, rot: 0, gmOnly: true }, { kind: 'torch', x: 2, y: 9, rot: 0 }, { kind: 'torch', x: 7, y: 9, rot: 0 },
      ],
      'stone',
      [{ x: 16, y: 12, text: 'Flooded chapel: 3 skeletons rise when the heroes reach the middle.' }, { x: 28, y: 11, text: 'Vault: key is on the altar. Wight guards it.' }, { x: 22, y: 12, text: 'Pressure plate: DC 13 Perception, 2d6 piercing darts.' }],
    ),
  },
  {
    id: 'warren', name: 'Goblin Warren', blurb: 'Twisting cave tunnels, a lookout, a den and the boss chamber.',
    make: () => {
      const m = build('Goblin Warren', 36, 26,
        [{ x: 1, y: 11, w: 5, h: 5 }, { x: 9, y: 3, w: 6, h: 5 }, { x: 10, y: 16, w: 8, h: 7 }, { x: 22, y: 9, w: 10, h: 9 }, { x: 24, y: 1, w: 5, h: 4 }],
        [[5, 13, 12, 13], [12, 13, 12, 7], [12, 13, 12, 16], [17, 19, 26, 19], [26, 19, 26, 17], [15, 5, 26, 5], [26, 5, 26, 9]],
        [[hKey(26, 18), 'closed']],
        [{ kind: 'campfire', x: 26, y: 13, rot: 0 }, { kind: 'chest', x: 30, y: 10, rot: 0 }, { kind: 'bed', x: 11, y: 21, rot: 0 }, { kind: 'bed', x: 15, y: 21, rot: 0 }, { kind: 'crate', x: 10, y: 4, rot: 0 }, { kind: 'barrel', x: 13, y: 4, rot: 0 }, { kind: 'rubble', x: 3, y: 13, rot: 0 }],
        'cave',
        [{ x: 12, y: 5, text: 'Lookout: 2 goblins with shortbows.' }, { x: 26, y: 13, text: 'Boss: hobgoblin chief and 3 goblins.' }],
      );
      return setCells(m, [[14, 13], [15, 13], [16, 12], [16, 13], [16, 14]], 3);
    },
  },
  {
    id: 'tavern', name: 'The Lantern Tavern', blurb: 'A common room, kitchen, cellar stairs and two private rooms.',
    make: () => build('The Lantern Tavern', 27, 21,
      [{ x: 2, y: 2, w: 14, h: 10 }, { x: 17, y: 2, w: 7, h: 6 }, { x: 2, y: 13, w: 6, h: 6 }, { x: 9, y: 13, w: 7, h: 6 }, { x: 18, y: 14, w: 5, h: 5 }],
      [[16, 4, 16, 4], [4, 12, 4, 12], [12, 12, 12, 12], [20, 8, 20, 13]],
      [[vKey(17, 4), 'open'], [hKey(4, 13), 'closed'], [hKey(12, 13), 'closed'], [hKey(20, 8), 'closed']],
      [
        { kind: 'table', x: 5, y: 5, rot: 0 }, { kind: 'table', x: 9, y: 5, rot: 0 }, { kind: 'table', x: 5, y: 9, rot: 0 }, { kind: 'table', x: 10, y: 9, rot: 0 },
        { kind: 'barrel', x: 14, y: 3, rot: 0 }, { kind: 'barrel', x: 14, y: 4, rot: 0 }, { kind: 'campfire', x: 21, y: 3, rot: 0 }, { kind: 'crate', x: 22, y: 6, rot: 0 },
        { kind: 'bed', x: 3, y: 15, rot: 0 }, { kind: 'bed', x: 13, y: 16, rot: 0 }, { kind: 'stairs', x: 20, y: 16, rot: 0 }, { kind: 'well', x: 7, y: 2, rot: 0 },
      ],
      'wood',
      [{ x: 9, y: 7, text: 'Barkeep Maddo has the rumor about the crypt.' }],
    ),
  },
];

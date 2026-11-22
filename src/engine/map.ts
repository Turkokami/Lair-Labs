// Grid map model. Walls are derived: every edge between floor and rock is a wall, so rooms that
// touch merge and the shared wall disappears. Doors sit on wall edges.
export type DoorState = 'closed' | 'open' | 'locked' | 'secret';
export type Tile = 0 | 1 | 2 | 3 | 4 | 5; // 0 rock, 1 floor, 2 water, 3 difficult, 4 pit, 5 impassable open ground (cliff, sheer rock)
export const TILE_NAMES: Record<number, string> = { 0: 'Rock', 1: 'Floor', 2: 'Water', 3: 'Rubble (difficult)', 4: 'Pit', 5: 'Cliff (blocks movement)' };

/** A placed object. `kind` is an object id from src/library/objects (old maps use short names that map to them). */
export interface Prop { id: string; kind: string; x: number; y: number; rot: number; gmOnly?: boolean; /** variant index */ v?: number; /** light switched off */ off?: boolean; }
export interface Note { id: string; x: number; y: number; text: string; gmOnly?: boolean; }
/** A light that isn't an object, in grid units (cell centre = x + 0.5). Radii in feet. */
export interface MapLight { id: string; x: number; y: number; bright: number; dim: number; color: string; }
export interface RoomInfo { id: string; name: string; rects: number[][]; readAloud?: string; gmNotes?: string; labelAt?: number[]; }
export interface EncounterInfo { name: string; area: number[]; trigger: string; difficulty: string; monsters: { srd: string; count: number }[]; }
/** Walls that stop feet but not eyes (windows, bars), or neither (low walls you can see and step over with cover). */
export type WallKind = 'window' | 'bars' | 'low' | 'ethereal';
export type Ambient = 'bright' | 'dim' | 'dark';
/** A picture under the grid (from a Universal VTT import). The data is sent to phones separately, once. */
export interface MapBackdrop { id: string; w: number; h: number; }

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
  // Everything below is optional so older saved maps still load.
  /** Floor material id per cell ('' = the theme's plain floor). */
  mats?: string[];
  wallStyle?: string;
  wallKinds?: Record<string, WallKind>;
  /** Door look per door edge: door-wood, door-iron, door-double, door-secret, portcullis, bars. */
  doorStyles?: Record<string, string>;
  ambient?: Ambient;
  lights?: MapLight[];
  rooms?: RoomInfo[];
  encounters?: EncounterInfo[];
  playerStart?: number[];
  backdrop?: MapBackdrop;
  /** How far heroes can see, in squares (open country). Default 80. */
  viewRange?: number;
  /** Feet per square: 5 for battle maps; region maps use more (5280 = a mile). */
  scale?: number;
}

export const PROP_KINDS = ['chest', 'barrel', 'crate', 'table', 'bed', 'bookshelf', 'altar', 'statue', 'pillar', 'rubble', 'campfire', 'torch', 'stairs', 'well', 'trap'];
export const PROP_LABELS: Record<string, string> = {
  chest: 'Chest', barrel: 'Barrel', crate: 'Crate', table: 'Table', bed: 'Bed', bookshelf: 'Bookshelf', altar: 'Altar',
  statue: 'Statue', pillar: 'Pillar', rubble: 'Rubble', campfire: 'Campfire', torch: 'Torch', stairs: 'Stairs', well: 'Well', trap: 'Trap (GM only)',
};

let idc = 0;
export const pid = () => `p${Date.now().toString(36)}${(idc++).toString(36)}`;

export function blankMap(cols = 48, rows = 36, name = 'New map'): GameMap {
  return { id: pid(), name, cols, rows, theme: 'stone', cells: new Array(cols * rows).fill(0), walls: [], doors: {}, props: [], notes: [] };
}

export const inBounds = (m: GameMap, x: number, y: number) => x >= 0 && y >= 0 && x < m.cols && y < m.rows;
export const cell = (m: GameMap, x: number, y: number) => (inBounds(m, x, y) ? m.cells[y * m.cols + x] : 0);
export const isFloor = (m: GameMap, x: number, y: number) => cell(m, x, y) > 0;
/** Open ground a creature can stand on: floor that isn't a cliff (5). Cliffs are open to sight but not to feet. */
export const isWalkable = (m: GameMap, x: number, y: number) => { const v = cell(m, x, y); return v > 0 && v !== 5; };

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

/** Doors you can see through when shut (portcullis, bars). */
export const SEE_THROUGH_DOORS = new Set(['portcullis', 'bars']);

export function isWall(m: GameMap, k: string): boolean {
  if (m.doors[k]) return true;
  if (m.wallKinds?.[k] === 'low') return false;
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

/** Does this edge stop sight? Closed doors and walls do; windows, bars and portcullises don't. */
export function blocksSight(m: GameMap, k: string): boolean {
  const d = m.doors[k];
  if (d) return d !== 'open' && !SEE_THROUGH_DOORS.has(m.doorStyles?.[k] ?? '');
  if (m.wallKinds?.[k]) return false; // windows, bars, low walls and force walls are all see-through
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
  if (!isWalkable(m, tx, ty)) return Infinity;
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
        if (!isWalkable(m, nx, ny)) continue;
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

/**
 * Makes a map bigger: every square becomes f by f squares. Rooms, halls and corridors grow, a door becomes a
 * row of f doors (a wide doorway), and things, notes and lights move to the same spot in the bigger room.
 */
export function upscaleMap(m: GameMap, f = 2): GameMap {
  if (f <= 1) return m;
  const cols = m.cols * f, rows = m.rows * f;
  const cells = new Array(cols * rows).fill(0);
  const mats: string[] | undefined = m.mats ? new Array(cols * rows).fill('') : undefined;
  for (let y = 0; y < m.rows; y++)
    for (let x = 0; x < m.cols; x++)
      for (let j = 0; j < f; j++)
        for (let i = 0; i < f; i++) {
          const k = (y * f + j) * cols + x * f + i;
          cells[k] = m.cells[y * m.cols + x];
          if (mats) mats[k] = m.mats![y * m.cols + x] ?? '';
        }
  const edges = (k: string) => {
    const { t, x, y } = parseEdge(k);
    return Array.from({ length: f }, (_, i) => (t === 'h' ? hKey(x * f + i, y * f) : vKey(x * f, y * f + i)));
  };
  const spread = <T,>(r: Record<string, T> | undefined) => {
    if (!r) return undefined;
    const o: Record<string, T> = {};
    for (const [k, v] of Object.entries(r)) for (const e of edges(k)) o[e] = v;
    return o;
  };
  const sc = (n: number) => n * f;
  return {
    ...m,
    cols,
    rows,
    cells,
    mats,
    walls: m.walls.flatMap(edges),
    doors: spread(m.doors)!,
    wallKinds: spread(m.wallKinds),
    doorStyles: spread(m.doorStyles),
    props: m.props.map((p) => ({ ...p, x: sc(p.x), y: sc(p.y) })),
    notes: m.notes.map((n) => ({ ...n, x: sc(n.x), y: sc(n.y) })),
    lights: m.lights?.map((l) => ({ ...l, x: (l.x + 0.5) * f - 0.5, y: (l.y + 0.5) * f - 0.5 })),
    rooms: m.rooms?.map((r) => ({ ...r, rects: r.rects.map((q) => q.map(sc)), labelAt: r.labelAt?.map(sc) })),
    encounters: m.encounters?.map((e) => ({ ...e, area: e.area.map(sc) })),
    playerStart: m.playerStart?.map(sc),
  };
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
  const decided = new Map<string, boolean>();
  const opening = (x: number, y: number, dx: number, dy: number) => isFloor(m, x + dx, y + dy) && !inRoom(x + dx, y + dy) && inRoom(x, y);
  for (let y = 0; y < m.rows; y++)
    for (let x = 0; x < m.cols; x++) {
      if (!isFloor(m, x, y) || !inRoom(x, y)) continue;
      for (const [dx, dy] of N4) {
        if (!opening(x, y, dx, dy)) continue;
        // how wide is the corridor mouth here? Doors go in mouths of 1 or 2 squares (a 2-wide corridor gets double doors)
        const px = dx ? 0 : 1, py = dx ? 1 : 0;
        let a = 0, b = 0;
        while (opening(x - px * (a + 1), y - py * (a + 1), dx, dy)) a++;
        while (opening(x + px * (b + 1), y + py * (b + 1), dx, dy)) b++;
        if (a + b + 1 > 2) continue;
        const key = `${x - px * a},${y - py * a},${dx},${dy}`;
        if (!decided.has(key)) decided.set(key, rnd() <= chance);
        if (decided.get(key)) doors[edgeBetween(x, y, x + dx, y + dy)!] = 'closed';
      }
    }
  return { ...m, doors };
}

export function randomDungeon(size: 'small' | 'medium' | 'large' = 'small', seed = Date.now()): GameMap {
  let s = seed >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000);
  // big rooms: halls of 35 to 75 ft a side, so the 3D view feels like walking a real dungeon
  const target = size === 'small' ? 6 : size === 'medium' ? 11 : 18;
  const cols = size === 'small' ? 56 : size === 'medium' ? 80 : 104;
  const rows = size === 'small' ? 42 : size === 'medium' ? 58 : 76;
  const rooms: Room[] = [];
  for (let tries = 0; rooms.length < target && tries < 900; tries++) {
    const w = 7 + Math.floor(rnd() * 9), h = 7 + Math.floor(rnd() * 7);
    const x = 1 + Math.floor(rnd() * (cols - w - 2)), y = 1 + Math.floor(rnd() * (rows - h - 2));
    if (rooms.some((r) => x < r.x + r.w + 2 && x + w + 2 > r.x && y < r.y + r.h + 2 && y + h + 2 > r.y)) continue;
    rooms.push({ x, y, w, h });
  }
  rooms.sort((a, b) => a.x + a.y - (b.x + b.y));
  const center = (r: Room) => [r.x + Math.floor(r.w / 2), r.y + Math.floor(r.h / 2)] as const;
  const corridors: [number, number, number, number, number][] = [];
  for (let i = 1; i < rooms.length; i++) {
    const [ax, ay] = center(rooms[i - 1]);
    const [bx, by] = center(rooms[i]);
    corridors.push(rnd() < 0.5 ? [ax, ay, bx, by, 2] : [bx, by, ax, ay, 2]);
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

/** The doubled crypt has room for more: braziers, a chandelier over the chapel, side tombs and sconces. */
function dressCrypt(m: GameMap): GameMap {
  const add = (kind: string, x: number, y: number, rot = 0) => m.props.push({ id: pid(), kind, x, y, rot });
  add('chandelier-wheel', 31, 23);
  for (const [x, y] of [[25, 17], [40, 17], [25, 30], [40, 30]]) add('brazier', x, y);
  for (const y of [18, 24, 28]) add('torch-sconce', 4, y), add('torch-sconce', 15, y);
  for (const x of [28, 36]) add('sarcophagus-effigy', x, 3);
  add('rug-runner', 31, 6), add('rug-runner', 31, 9);
  for (const y of [16, 20, 26]) add('pillar-round', 50, y), add('pillar-round', 61, y);
  add('skeleton-lying', 9, 26), add('cobweb-corner', 4, 18), add('debris-wood', 33, 40);
  return m;
}

export interface MapTemplate { id: string; name: string; blurb: string; make: () => GameMap; }

export const TEMPLATES: MapTemplate[] = [
  {
    id: 'crypt', name: 'The Sunken Crypt', blurb: 'Entry hall, two side chambers, a flooded chapel and a locked vault.',
    make: () => dressCrypt(upscaleMap(build('The Sunken Crypt', 34, 24,
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
    ), 2)),
  },
  {
    id: 'warren', name: 'Goblin Warren', blurb: 'Twisting cave tunnels, a lookout, a den and the boss chamber.',
    make: () => {
      const m = build('Goblin Warren', 36, 26,
        [{ x: 1, y: 11, w: 5, h: 5 }, { x: 9, y: 3, w: 6, h: 5 }, { x: 10, y: 16, w: 8, h: 7 }, { x: 22, y: 9, w: 10, h: 9 }, { x: 24, y: 1, w: 5, h: 4 }],
        [[5, 13, 12, 13], [12, 13, 12, 7], [12, 13, 12, 16], [17, 19, 26, 19], [26, 19, 26, 17], [15, 5, 26, 5], [26, 5, 26, 9]],
        [[hKey(26, 18), 'closed']],
        [{ kind: 'bedroll', x: 23, y: 10, rot: 0 }, { kind: 'bedroll', x: 30, y: 15, rot: 0 }, { kind: 'barrel-group', x: 28, y: 1, rot: 0 }, { kind: 'crate-pile', x: 25, y: 2, rot: 0 }, { kind: 'weapon-rack', x: 9, y: 7, rot: 0 }, { kind: 'skeleton-lying', x: 2, y: 15, rot: 0 }, { kind: 'torch-standing', x: 23, y: 16, rot: 0 }, { kind: 'torch-standing', x: 31, y: 9, rot: 0 }, { kind: 'campfire', x: 26, y: 13, rot: 0 }, { kind: 'chest', x: 30, y: 10, rot: 0 }, { kind: 'bed', x: 11, y: 21, rot: 0 }, { kind: 'bed', x: 15, y: 21, rot: 0 }, { kind: 'crate', x: 10, y: 4, rot: 0 }, { kind: 'barrel', x: 13, y: 4, rot: 0 }, { kind: 'rubble', x: 3, y: 13, rot: 0 }],
        'cave',
        [{ x: 12, y: 5, text: 'Lookout: 2 goblins with shortbows.' }, { x: 26, y: 13, text: 'Boss: hobgoblin chief and 3 goblins.' }],
      );
      return upscaleMap(setCells(m, [[14, 13], [15, 13], [16, 12], [16, 13], [16, 14]], 3), 2);
    },
  },
  {
    id: 'great-hall', name: 'The Great Hall of Harrowmere', blurb: 'A huge pillared feast hall with a throne, a library, a chapel, kitchens, barracks and the lord’s chambers.',
    make: () => {
      const m = build('The Great Hall of Harrowmere', 58, 46,
        [{ x: 24, y: 36, w: 10, h: 8 }, { x: 19, y: 10, w: 20, h: 22 }, { x: 3, y: 12, w: 12, h: 16 }, { x: 43, y: 12, w: 12, h: 16 }, { x: 23, y: 1, w: 12, h: 6 }, { x: 3, y: 32, w: 13, h: 10 }, { x: 42, y: 32, w: 13, h: 10 }],
        [[28, 32, 28, 35, 2], [15, 20, 18, 20, 2], [39, 20, 42, 20, 2], [28, 7, 28, 9, 2], [8, 28, 8, 31, 2], [48, 28, 48, 31, 2]],
        [
          [hKey(28, 36), 'open'], [hKey(29, 36), 'open'], [hKey(28, 32), 'open'], [hKey(29, 32), 'open'],
          [vKey(15, 20), 'closed'], [vKey(15, 21), 'closed'], [vKey(19, 20), 'open'], [vKey(19, 21), 'open'],
          [vKey(39, 20), 'open'], [vKey(39, 21), 'open'], [vKey(43, 20), 'closed'], [vKey(43, 21), 'closed'],
          [hKey(28, 7), 'locked'], [hKey(29, 7), 'locked'], [hKey(28, 10), 'closed'], [hKey(29, 10), 'closed'],
          [hKey(8, 28), 'closed'], [hKey(9, 28), 'closed'], [hKey(48, 28), 'closed'], [hKey(49, 28), 'closed'],
        ],
      [
        { kind: 'rug-runner', x: 28, y: 13, rot: 0 }, { kind: 'rug-runner', x: 28, y: 16, rot: 0 }, { kind: 'rug-runner', x: 28, y: 19, rot: 0 }, { kind: 'rug-runner', x: 28, y: 22, rot: 0 }, { kind: 'rug-runner', x: 28, y: 25, rot: 0 }, { kind: 'rug-runner', x: 28, y: 28, rot: 0 }, { kind: 'column-fluted', x: 22, y: 13, rot: 0 }, { kind: 'column-fluted', x: 35, y: 13, rot: 0 }, { kind: 'column-fluted', x: 22, y: 17, rot: 0 }, { kind: 'column-fluted', x: 35, y: 17, rot: 0 }, { kind: 'column-fluted', x: 22, y: 21, rot: 0 }, { kind: 'column-fluted', x: 35, y: 21, rot: 0 }, { kind: 'column-fluted', x: 22, y: 25, rot: 0 }, { kind: 'column-fluted', x: 35, y: 25, rot: 0 }, { kind: 'column-fluted', x: 22, y: 29, rot: 0 }, { kind: 'column-fluted', x: 35, y: 29, rot: 0 }, { kind: 'table-feast', x: 24, y: 16, rot: 0 }, { kind: 'bench-long', x: 24, y: 15, rot: 0 }, { kind: 'bench-long', x: 24, y: 17, rot: 0 }, { kind: 'table-feast', x: 24, y: 22, rot: 0 }, { kind: 'bench-long', x: 24, y: 21, rot: 0 }, { kind: 'bench-long', x: 24, y: 23, rot: 0 }, { kind: 'table-feast', x: 31, y: 16, rot: 0 }, { kind: 'bench-long', x: 31, y: 15, rot: 0 }, { kind: 'bench-long', x: 31, y: 17, rot: 0 }, { kind: 'table-feast', x: 31, y: 22, rot: 0 }, { kind: 'bench-long', x: 31, y: 21, rot: 0 }, { kind: 'bench-long', x: 31, y: 23, rot: 0 }, { kind: 'chandelier-tiered', x: 27, y: 14, rot: 0 }, { kind: 'chandelier-great', x: 27, y: 19, rot: 0 }, { kind: 'chandelier-tiered', x: 27, y: 26, rot: 0 }, { kind: 'throne-dais', x: 27, y: 10, rot: 0 }, { kind: 'banner-pole', x: 26, y: 11, rot: 0 }, { kind: 'banner-pole', x: 30, y: 11, rot: 0 }, { kind: 'fireplace', x: 24, y: 10, rot: 0 }, { kind: 'fireplace', x: 32, y: 10, rot: 0 }, { kind: 'brazier-pedestal', x: 20, y: 30, rot: 0 }, { kind: 'banner-hanging-tall', x: 20, y: 23, rot: 0 }, { kind: 'banner-hanging-tall', x: 37, y: 23, rot: 0 }, { kind: 'bookcase-grand', x: 5, y: 12, rot: 0 }, { kind: 'bookcase-grand', x: 9, y: 12, rot: 0 }, { kind: 'brazier-pedestal', x: 37, y: 30, rot: 0 }, { kind: 'statue-tall-knight', x: 24, y: 29, rot: 0 }, { kind: 'statue-tall-knight', x: 32, y: 29, rot: 0 }, { kind: 'torch-sconce', x: 19, y: 12, rot: 0 }, { kind: 'torch-sconce', x: 38, y: 12, rot: 0 }, { kind: 'torch-sconce', x: 19, y: 19, rot: 0 }, { kind: 'torch-sconce', x: 38, y: 19, rot: 0 }, { kind: 'torch-sconce', x: 19, y: 26, rot: 0 }, { kind: 'torch-sconce', x: 38, y: 26, rot: 0 }, { kind: 'bookshelf-tall', x: 3, y: 13, rot: 0 }, { kind: 'bookshelf-tall', x: 3, y: 15, rot: 0 }, { kind: 'bookshelf-tall', x: 3, y: 17, rot: 0 }, { kind: 'bookshelf-tall', x: 3, y: 19, rot: 0 }, { kind: 'bookshelf-tall', x: 3, y: 21, rot: 0 }, { kind: 'bookshelf-tall', x: 3, y: 23, rot: 0 }, { kind: 'bookshelf-tall', x: 3, y: 25, rot: 0 }, { kind: 'library-stack', x: 6, y: 15, rot: 0 }, { kind: 'library-stack', x: 9, y: 15, rot: 0 }, { kind: 'library-stack', x: 6, y: 19, rot: 0 }, { kind: 'library-stack', x: 9, y: 19, rot: 0 }, { kind: 'library-stack', x: 6, y: 23, rot: 0 }, { kind: 'library-stack', x: 9, y: 23, rot: 0 }, { kind: 'table-reading', x: 12, y: 17, rot: 0 }, { kind: 'chandelier-wheel', x: 8, y: 17, rot: 0 }, { kind: 'rug-round', x: 7, y: 25, rot: 0 }, { kind: 'candles', x: 13, y: 13, rot: 0 }, { kind: 'globe-stand', x: 12, y: 25, rot: 0 }, { kind: 'altar', x: 48, y: 13, rot: 0 }, { kind: 'statue', x: 46, y: 13, rot: 0 }, { kind: 'statue', x: 51, y: 13, rot: 0 }, { kind: 'candles', x: 47, y: 14, rot: 0 }, { kind: 'candles', x: 50, y: 14, rot: 0 }, { kind: 'chandelier-crystal', x: 48, y: 19, rot: 0 }, { kind: 'organ-cathedral', x: 44, y: 26, rot: 0 }, { kind: 'pew', x: 45, y: 17, rot: 0 }, { kind: 'pew', x: 50, y: 17, rot: 0 }, { kind: 'pew', x: 45, y: 19, rot: 0 }, { kind: 'pew', x: 50, y: 19, rot: 0 }, { kind: 'pew', x: 45, y: 21, rot: 0 }, { kind: 'pew', x: 50, y: 21, rot: 0 }, { kind: 'pew', x: 45, y: 23, rot: 0 }, { kind: 'pew', x: 50, y: 23, rot: 0 }, { kind: 'bed-four-poster', x: 25, y: 2, rot: 0 }, { kind: 'fireplace', x: 30, y: 1, rot: 0 }, { kind: 'rug-round', x: 28, y: 3, rot: 0 }, { kind: 'table-reading', x: 32, y: 4, rot: 0 }, { kind: 'armor-stand', x: 24, y: 5, rot: 0 }, { kind: 'hearth-oven', x: 4, y: 32, rot: 0 }, { kind: 'stove', x: 7, y: 32, rot: 0 }, { kind: 'kitchen-table', x: 8, y: 36, rot: 0 }, { kind: 'kitchen-table', x: 11, y: 36, rot: 0 }, { kind: 'barrel-group', x: 13, y: 39, rot: 0 }, { kind: 'produce-crates', x: 4, y: 40, rot: 0 }, { kind: 'water-barrel', x: 14, y: 33, rot: 0 }, { kind: 'bunk-bed', x: 43, y: 33, rot: 0 }, { kind: 'bunk-bed', x: 45, y: 33, rot: 0 }, { kind: 'bunk-bed', x: 47, y: 33, rot: 0 }, { kind: 'bunk-bed', x: 49, y: 33, rot: 0 }, { kind: 'bunk-bed', x: 51, y: 33, rot: 0 }, { kind: 'weapon-rack', x: 43, y: 40, rot: 0 }, { kind: 'weapon-rack', x: 46, y: 40, rot: 0 }, { kind: 'armor-stand', x: 50, y: 40, rot: 0 }, { kind: 'armor-stand', x: 52, y: 40, rot: 0 }, { kind: 'table-long', x: 47, y: 37, rot: 0 }, { kind: 'torch-standing', x: 25, y: 37, rot: 0 }, { kind: 'torch-standing', x: 32, y: 37, rot: 0 }, { kind: 'crate-pile', x: 25, y: 41, rot: 0 }, { kind: 'stairs-up', x: 33, y: 40, rot: 0 }, { kind: 'barrel', x: 32, y: 42, rot: 0 },
      ],
        'stone',
        [{ x: 28, y: 12, text: 'Lady Corvane holds court here. 6 guards, 2 at each door.' }, { x: 48, y: 20, text: 'Chapel: the organ hides a stair down (DC 15 Investigation).' }, { x: 28, y: 3, text: 'Solar: locked. The key is on Lady Corvane’s belt.' }],
      );
      m.doorStyles = { [hKey(28, 32)]: 'door-double', [hKey(29, 32)]: 'door-double', [hKey(28, 36)]: 'portcullis', [hKey(29, 36)]: 'portcullis' };
      m.wallKinds = Object.fromEntries([hKey(21, 10), hKey(36, 10), vKey(19, 14), vKey(19, 16), vKey(19, 24), vKey(19, 27), vKey(39, 14), vKey(39, 16), vKey(39, 24), vKey(39, 27), hKey(46, 12), hKey(52, 12)].map((k) => [k, 'window' as WallKind]));
      return m;
    },
  },
  {
    id: 'tavern', name: 'The Lantern Tavern', blurb: 'A big common room with a bar and hearth, a kitchen, the cellar, two private rooms and the stair up.',
    make: () => build('The Lantern Tavern', 42, 34,
      [{ x: 2, y: 2, w: 22, h: 15 }, { x: 26, y: 2, w: 12, h: 10 }, { x: 26, y: 14, w: 12, h: 9 }, { x: 2, y: 19, w: 10, h: 8 }, { x: 14, y: 19, w: 10, h: 8 }, { x: 28, y: 25, w: 8, h: 7 }],
      [[24, 6, 25, 6, 2], [31, 12, 31, 13, 2], [6, 17, 6, 18, 2], [18, 17, 18, 18, 2], [31, 23, 31, 24, 2]],
      [
        [vKey(24, 6), 'open'], [vKey(24, 7), 'open'], [hKey(31, 14), 'closed'], [hKey(32, 14), 'closed'],
        [hKey(6, 19), 'closed'], [hKey(7, 19), 'closed'], [hKey(18, 19), 'closed'], [hKey(19, 19), 'closed'], [hKey(31, 25), 'closed'], [hKey(32, 25), 'closed'],
      ],
      [
        { kind: 'table-round', x: 5, y: 5, rot: 0 }, { kind: 'chair', x: 4, y: 5, rot: 0 }, { kind: 'chair', x: 6, y: 5, rot: 0 }, { kind: 'stool', x: 5, y: 6, rot: 0 }, { kind: 'table-round', x: 10, y: 5, rot: 0 }, { kind: 'chair', x: 9, y: 5, rot: 0 }, { kind: 'chair', x: 11, y: 5, rot: 0 }, { kind: 'stool', x: 10, y: 6, rot: 0 }, { kind: 'table-round', x: 5, y: 10, rot: 0 }, { kind: 'chair', x: 4, y: 10, rot: 0 }, { kind: 'chair', x: 6, y: 10, rot: 0 }, { kind: 'stool', x: 5, y: 11, rot: 0 }, { kind: 'table-round', x: 10, y: 10, rot: 0 }, { kind: 'chair', x: 9, y: 10, rot: 0 }, { kind: 'chair', x: 11, y: 10, rot: 0 }, { kind: 'stool', x: 10, y: 11, rot: 0 }, { kind: 'table-round', x: 15, y: 10, rot: 0 }, { kind: 'chair', x: 14, y: 10, rot: 0 }, { kind: 'chair', x: 16, y: 10, rot: 0 }, { kind: 'stool', x: 15, y: 11, rot: 0 }, { kind: 'table-round', x: 5, y: 13, rot: 0 }, { kind: 'chair', x: 4, y: 13, rot: 0 }, { kind: 'chair', x: 6, y: 13, rot: 0 }, { kind: 'stool', x: 5, y: 14, rot: 0 }, { kind: 'table-round', x: 10, y: 13, rot: 0 }, { kind: 'chair', x: 9, y: 13, rot: 0 }, { kind: 'chair', x: 11, y: 13, rot: 0 }, { kind: 'stool', x: 10, y: 14, rot: 0 }, { kind: 'bar-counter', x: 17, y: 4, rot: 0 }, { kind: 'bar-counter', x: 20, y: 4, rot: 0 }, { kind: 'stool-bar', x: 17, y: 5, rot: 0 }, { kind: 'stool-bar', x: 18, y: 5, rot: 0 }, { kind: 'stool-bar', x: 20, y: 5, rot: 0 }, { kind: 'stool-bar', x: 21, y: 5, rot: 0 }, { kind: 'keg-rack', x: 18, y: 2, rot: 0 }, { kind: 'keg-rack', x: 21, y: 2, rot: 0 }, { kind: 'fireplace', x: 2, y: 8, rot: 0 }, { kind: 'hearth-rug', x: 4, y: 8, rot: 0 }, { kind: 'armchair', x: 4, y: 7, rot: 0 }, { kind: 'rocking-chair', x: 4, y: 10, rot: 0 }, { kind: 'chandelier-wheel', x: 8, y: 7, rot: 0 }, { kind: 'chandelier-wheel', x: 14, y: 11, rot: 0 }, { kind: 'tavern-sign', x: 12, y: 2, rot: 0 }, { kind: 'hearth-oven', x: 27, y: 2, rot: 0 }, { kind: 'stove', x: 30, y: 2, rot: 0 }, { kind: 'kitchen-table', x: 29, y: 6, rot: 0 }, { kind: 'produce-crates', x: 34, y: 8, rot: 0 }, { kind: 'water-barrel', x: 36, y: 3, rot: 0 }, { kind: 'barrel-group', x: 35, y: 10, rot: 0 }, { kind: 'barrel-stack', x: 27, y: 15, rot: 0 }, { kind: 'barrel-stack', x: 30, y: 15, rot: 0 }, { kind: 'barrel-group', x: 34, y: 15, rot: 0 }, { kind: 'crate-pile', x: 27, y: 20, rot: 0 }, { kind: 'crate-stack', x: 36, y: 21, rot: 0 }, { kind: 'stairs-down', x: 33, y: 19, rot: 0 }, { kind: 'bed-double', x: 3, y: 20, rot: 0 }, { kind: 'side-table', x: 5, y: 20, rot: 0 }, { kind: 'rug', x: 7, y: 22, rot: 0 }, { kind: 'bed', x: 14, y: 20, rot: 0 }, { kind: 'bed', x: 16, y: 20, rot: 0 }, { kind: 'side-table', x: 18, y: 20, rot: 0 }, { kind: 'chair', x: 20, y: 23, rot: 0 }, { kind: 'stairs-up', x: 31, y: 27, rot: 0 }, { kind: 'lantern-hanging', x: 29, y: 27, rot: 0 },
      ],
      'wood',
      [{ x: 12, y: 8, text: 'Barkeep Maddo has the rumor about the crypt.' }],
    ),
  },
];

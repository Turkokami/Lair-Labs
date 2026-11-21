// Building helpers: drop a room template into a map (with rotation), furnish rooms by themselves,
// and lay out a whole furnished dungeon in one tap.
import { type GameMap, type Prop, type RoomInfo, type MapLight, pid, parseEdge, hKey, vKey, randomDungeon, floodRoom, isFloor, inBounds, allWallEdges } from './map';
import { objectById } from '../library/objects';

function size(kind: string, rot: number): [number, number] {
  const d = objectById(kind);
  const w = d?.w ?? 1, h = d?.h ?? 1;
  return ((rot % 360) + 360) % 180 ? [h, w] : [w, h];
}

/** Turn a map a quarter turn clockwise. */
export function rotate90(m: GameMap): GameMap {
  const W = m.cols, H = m.rows;
  const cells = new Array(W * H).fill(0);
  const mats = m.mats ? new Array(W * H).fill('') : undefined;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const nx = H - 1 - y, ny = x;
      cells[ny * H + nx] = m.cells[y * W + x];
      if (mats) mats[ny * H + nx] = m.mats![y * W + x];
    }
  const edge = (k: string) => {
    const { t, x, y } = parseEdge(k);
    return t === 'h' ? vKey(H - y, x) : hKey(H - 1 - y, x);
  };
  const remap = <T,>(r?: Record<string, T>) => (r ? Object.fromEntries(Object.entries(r).map(([k, v]) => [edge(k), v])) : undefined);
  const props: Prop[] = m.props.map((p) => {
    const [, h] = size(p.kind, p.rot);
    return { ...p, x: H - p.y - h, y: p.x, rot: (p.rot + 90) % 360 };
  });
  const rect = ([x, y, w, h]: number[]) => [H - y - h, x, h, w];
  return {
    ...m, cols: H, rows: W, cells, mats,
    walls: m.walls.map(edge), doors: remap(m.doors)!, doorStyles: remap(m.doorStyles), wallKinds: remap(m.wallKinds),
    props, notes: m.notes.map((n) => ({ ...n, x: H - 1 - n.y, y: n.x })),
    lights: m.lights?.map((l) => ({ ...l, x: H - l.y, y: l.x })),
    rooms: m.rooms?.map((r) => ({ ...r, rects: r.rects.map(rect), labelAt: r.labelAt ? [H - r.labelAt[1], r.labelAt[0]] : undefined })),
    playerStart: m.playerStart ? rect(m.playerStart) : undefined,
  };
}

/** Cells of a room template that are actually part of the room (not the rock border). */
function bounds(room: GameMap) {
  let x0 = room.cols, y0 = room.rows, x1 = -1, y1 = -1;
  room.cells.forEach((v, i) => {
    if (v <= 0) return;
    const x = i % room.cols, y = (i / room.cols) | 0;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  });
  return { x0, y0, x1, y1 };
}

/**
 * Drop a room template so its floor's top-left lands on (ox, oy). Rock in the template never erases the map.
 * `turns` is quarter turns clockwise.
 */
export function stampRoom(map: GameMap, template: GameMap, ox: number, oy: number, turns = 0): GameMap {
  let room = template;
  for (let i = 0; i < ((turns % 4) + 4) % 4; i++) room = rotate90(room);
  const b = bounds(room);
  const dx = ox - b.x0, dy = oy - b.y0;
  const cells = map.cells.slice();
  const mats = (map.mats ?? new Array(map.cols * map.rows).fill('')).slice();
  for (let y = 0; y < room.rows; y++)
    for (let x = 0; x < room.cols; x++) {
      const v = room.cells[y * room.cols + x];
      if (v <= 0) continue;
      const tx = x + dx, ty = y + dy;
      if (!inBounds(map, tx, ty)) continue;
      cells[ty * map.cols + tx] = v;
      mats[ty * map.cols + tx] = room.mats?.[y * room.cols + x] ?? '';
    }
  const shift = (k: string) => {
    const { t, x, y } = parseEdge(k);
    return t === 'h' ? hKey(x + dx, y + dy) : vKey(x + dx, y + dy);
  };
  const doors = { ...map.doors }, doorStyles = { ...(map.doorStyles ?? {}) }, wallKinds = { ...(map.wallKinds ?? {}) };
  for (const [k, s] of Object.entries(room.doors)) doors[shift(k)] = s;
  for (const [k, s] of Object.entries(room.doorStyles ?? {})) doorStyles[shift(k)] = s;
  for (const [k, s] of Object.entries(room.wallKinds ?? {})) wallKinds[shift(k)] = s;
  const inMap = (x: number, y: number) => x >= 0 && y >= 0 && x < map.cols && y < map.rows;
  const props = [...map.props, ...room.props.filter((p) => inMap(p.x + dx, p.y + dy)).map((p) => ({ ...p, id: pid(), x: p.x + dx, y: p.y + dy }))];
  const lights: MapLight[] = [...(map.lights ?? []), ...(room.lights ?? []).map((l) => ({ ...l, id: pid(), x: l.x + dx, y: l.y + dy }))];
  const rooms: RoomInfo[] = [...(map.rooms ?? []), ...(room.rooms ?? []).map((r) => ({ ...r, id: pid(), rects: r.rects.map(([x, y, w, h]) => [x + dx, y + dy, w, h]), labelAt: r.labelAt ? [r.labelAt[0] + dx, r.labelAt[1] + dy] : undefined }))];
  const notes = [...map.notes, ...room.notes.filter((n) => !/connector/i.test(n.text)).map((n) => ({ ...n, id: pid(), x: n.x + dx, y: n.y + dy }))];
  return {
    ...map, cells, mats, doors, doorStyles, wallKinds, props, lights, rooms, notes,
    walls: [...map.walls, ...room.walls.map(shift)],
    ambient: map.ambient ?? room.ambient,
  };
}

// ---------- auto-furnish ----------
type Kit = { wall: string[]; middle: string[]; corner: string[]; floor?: string[]; name: string; mat?: string };
const KITS: Record<string, Kit> = {
  library: { name: 'Library', wall: ['bookshelf', 'bookshelf', 'bookshelf', 'lectern'], middle: ['desk', 'table-round', 'candles'], corner: ['candles'], floor: ['rug'], mat: 'wood-planks-dark' },
  shrine: { name: 'Shrine', wall: ['statue', 'candles'], middle: ['altar', 'brazier'], corner: ['brazier'], floor: ['rug'], mat: 'marble' },
  barracks: { name: 'Barracks', wall: ['bed', 'bed', 'bedroll', 'weapon-rack', 'chest'], middle: ['table-long', 'stool'], corner: ['barrel', 'torch-sconce'] },
  storeroom: { name: 'Storeroom', wall: ['crate', 'barrel', 'sack', 'crate-pile', 'keg-rack'], middle: ['crate', 'sack'], corner: ['barrel', 'crate'] },
  hall: { name: 'Pillared hall', wall: ['statue', 'torch-sconce'], middle: ['pillar-round'], corner: ['brazier'] },
  crypt: { name: 'Crypt', wall: ['coffin', 'sarcophagus', 'bones'], middle: ['sarcophagus', 'candles'], corner: ['bones', 'spider-web'], mat: 'dungeon-slab' },
  mess: { name: 'Mess hall', wall: ['barrel', 'keg-rack', 'cauldron'], middle: ['table-long', 'bench', 'table-long'], corner: ['barrel', 'sack'], mat: 'wood-planks' },
  lair: { name: 'Monster lair', wall: ['bones', 'treasure-pile', 'rubble-pile'], middle: ['bones', 'blood-pool'], corner: ['spider-web', 'bones'] },
  ritual: { name: 'Ritual chamber', wall: ['candles', 'statue'], middle: ['magic-circle'], corner: ['brazier', 'candles'] },
  smithy: { name: 'Smithy', wall: ['weapon-rack', 'barrel', 'anvil'], middle: ['forge', 'anvil'], corner: ['barrel'], mat: 'brick-floor' },
  vault: { name: 'Treasure vault', wall: ['chest', 'statue'], middle: ['treasure-pile', 'chest-open'], corner: ['chest'], mat: 'marble' },
  throne: { name: 'Throne room', wall: ['statue', 'brazier'], middle: ['throne'], corner: ['brazier'], floor: ['rug'] },
};
const KEYWORDS: [RegExp, string][] = [
  [/librar|study|archive/i, 'library'], [/shrine|chapel|temple/i, 'shrine'], [/barrack|guard|bunk/i, 'barracks'], [/store|pantry|cellar/i, 'storeroom'],
  [/crypt|tomb|niche|ossuar/i, 'crypt'], [/mess|kitchen|dining/i, 'mess'], [/lair|den|nest/i, 'lair'], [/ritual|summon/i, 'ritual'],
  [/smith|forge/i, 'smithy'], [/vault|treasur/i, 'vault'], [/throne|audience/i, 'throne'], [/hall/i, 'hall'],
];

export const KIT_NAMES = Object.fromEntries(Object.entries(KITS).map(([k, v]) => [k, v.name]));

/** Rooms as sets of cells: the map's named rooms, or any big floor area between doors. */
export function findRooms(m: GameMap): { cells: number[]; name?: string }[] {
  if (m.rooms?.length) {
    return m.rooms.map((r) => {
      const cells: number[] = [];
      for (const [x, y, w, h] of r.rects) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (isFloor(m, i, j)) cells.push(j * m.cols + i);
      return { cells, name: r.name };
    });
  }
  const seen = new Set<number>();
  const out: { cells: number[] }[] = [];
  m.cells.forEach((v, i) => {
    if (v <= 0 || seen.has(i)) return;
    const cells = floodRoom(m, i % m.cols, (i / m.cols) | 0);
    cells.forEach((c) => seen.add(c));
    if (cells.length >= 12) out.push({ cells });
  });
  return out;
}

/** Fill a room with things that suit it, against walls, in corners and in the middle. Never blocks a doorway. */
export function furnishRoom(m: GameMap, cells: number[], kind: string, rnd: () => number = Math.random): GameMap {
  const kit = KITS[kind] ?? KITS.storeroom;
  const set = new Set(cells);
  const taken = new Set<number>();
  for (const p of m.props) {
    const [w, h] = size(p.kind, p.rot);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) taken.add((p.y + j) * m.cols + p.x + i);
  }
  // keep a clear square inside every door, and the squares next to it
  for (const k of Object.keys(m.doors)) {
    const { t, x, y } = parseEdge(k);
    for (const [cx, cy] of t === 'h' ? [[x, y - 1], [x, y], [x - 1, y], [x + 1, y], [x - 1, y - 1], [x + 1, y - 1]] : [[x - 1, y], [x, y], [x, y - 1], [x, y + 1], [x - 1, y - 1], [x - 1, y + 1]]) taken.add(cy * m.cols + cx);
  }
  const wallEdges = new Set(allWallEdges(m));
  const isWallSide = (x: number, y: number) => {
    const sides = [hKey(x, y), hKey(x, y + 1), vKey(x, y), vKey(x + 1, y)].filter((k) => wallEdges.has(k) && !m.doors[k]);
    return sides;
  };
  const props = [...m.props];
  const fits = (kindId: string, x: number, y: number, rot: number) => {
    const [w, h] = size(kindId, rot);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const id = (y + j) * m.cols + x + i;
      if (!set.has(id) || taken.has(id)) return false;
    }
    return true;
  };
  const place = (kindId: string, x: number, y: number, rot: number) => {
    if (!objectById(kindId) || !fits(kindId, x, y, rot)) return false;
    const [w, h] = size(kindId, rot);
    for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) {
      const inside = j >= 0 && i >= 0 && j < h && i < w;
      // big things keep a walkway around them
      if (inside || (w * h > 1 && rnd() < 0.6)) taken.add((y + j) * m.cols + x + i);
    }
    const d = objectById(kindId)!;
    props.push({ id: pid(), kind: kindId, x, y, rot, v: d.variants ? Math.floor(rnd() * Math.min(3, d.variants.length)) : 0 });
    return true;
  };
  const pick = (a: string[]) => a[Math.floor(rnd() * a.length)];
  const shuffled = [...cells].sort(() => rnd() - 0.5);
  // floor pieces (rugs, circles) first, in the middle
  const xs = cells.map((c) => c % m.cols), ys = cells.map((c) => (c / m.cols) | 0);
  const cx = Math.round((Math.min(...xs) + Math.max(...xs)) / 2), cy = Math.round((Math.min(...ys) + Math.max(...ys)) / 2);
  if (kit.floor && cells.length >= 20) {
    const k = pick(kit.floor);
    const d = objectById(k);
    if (d) {
      const fx = cx - Math.floor(d.w / 2), fy = cy - Math.floor(d.h / 2);
      if (cells.includes(fy * m.cols + fx)) props.push({ id: pid(), kind: k, x: fx, y: fy, rot: 0 });
    }
  }
  // middle
  const nMid = Math.max(1, Math.round(cells.length / 22));
  for (let n = 0, tries = 0; n < nMid && tries < 60; tries++) {
    const k = pick(kit.middle);
    const d = objectById(k);
    if (!d) continue;
    const rot = d.w !== d.h && rnd() < 0.5 ? 90 : 0;
    const [w, h] = size(k, rot);
    const x = cx - Math.floor(w / 2) + Math.round((rnd() - 0.5) * 4), y = cy - Math.floor(h / 2) + Math.round((rnd() - 0.5) * 4);
    if (place(k, x, y, rot)) n++;
  }
  // along the walls, turned to face into the room
  const nWall = Math.max(2, Math.round(cells.length / 9));
  let placed = 0;
  for (const id of shuffled) {
    if (placed >= nWall) break;
    const x = id % m.cols, y = (id / m.cols) | 0;
    const sides = isWallSide(x, y);
    if (!sides.length) continue;
    const corner = sides.length >= 2;
    const k = pick(corner ? kit.corner : kit.wall);
    const d = objectById(k);
    if (!d) continue;
    // back against the wall: "top" of the art faces the wall
    const s0 = sides[0];
    const rot = s0 === hKey(x, y) ? 0 : s0 === hKey(x, y + 1) ? 180 : s0 === vKey(x, y) ? 270 : 90;
    const [w, h] = size(k, rot);
    // long things run along the wall
    const px = s0 === vKey(x + 1, y) ? x - w + 1 : x;
    const py = s0 === hKey(x, y + 1) ? y - h + 1 : y;
    if (place(k, px, py, d.w === d.h ? 0 : rot)) placed++;
  }
  const mats = kit.mat ? (m.mats ?? new Array(m.cols * m.rows).fill('')).slice() : m.mats;
  if (kit.mat && mats) for (const c of cells) if (m.cells[c] === 1 && !mats[c]) mats[c] = kit.mat;
  return { ...m, props, mats };
}

/** Furnish every room in the map. Named rooms get kits that match their names. */
export function autoFurnish(m: GameMap, rnd: () => number = Math.random, onlyEmpty = true): GameMap {
  const order = ['storeroom', 'barracks', 'library', 'shrine', 'crypt', 'mess', 'hall', 'lair', 'ritual', 'smithy', 'vault', 'throne'];
  let out = m;
  const rooms = findRooms(m);
  rooms.forEach((r, i) => {
    if (onlyEmpty && out.props.some((p) => r.cells.includes(p.y * out.cols + p.x))) return;
    const byName = r.name ? KEYWORDS.find(([re]) => re.test(r.name!))?.[1] : undefined;
    const kind = byName ?? (i === rooms.length - 1 ? 'vault' : order[Math.floor(rnd() * order.length)]);
    out = furnishRoom(out, r.cells, kind, rnd);
  });
  return out;
}

/** One tap: a random dungeon with rooms furnished, floors chosen and light where it makes sense. */
export function quickDungeon(sizeName: 'small' | 'medium' | 'large', seed = Date.now()): GameMap {
  let s = seed >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000);
  const m = randomDungeon(sizeName, seed);
  const base: GameMap = {
    ...m, name: `Quick dungeon (${sizeName})`, props: [], ambient: 'dark', wallStyle: 'stone',
    mats: m.cells.map((v) => (v > 0 ? 'dungeon-slab' : '')),
  };
  const rooms = findRooms(base);
  let out = base;
  const order = ['storeroom', 'barracks', 'library', 'shrine', 'crypt', 'mess', 'hall', 'lair', 'ritual', 'smithy'];
  rooms.forEach((r, i) => {
    const kind = i === 0 ? 'hall' : i === rooms.length - 1 ? 'vault' : order[Math.floor(rnd() * order.length)];
    out = furnishRoom(out, r.cells, kind, rnd);
    const xs = r.cells.map((c) => c % out.cols), ys = r.cells.map((c) => (c / out.cols) | 0);
    out.rooms = [...(out.rooms ?? []), { id: pid(), name: KITS[kind].name, rects: [[Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs) + 1, Math.max(...ys) - Math.min(...ys) + 1]] }];
  });
  // stairs in the first room
  const first = rooms[0]?.cells ?? [];
  const spot = first.find((c) => !out.props.some((p) => p.y * out.cols + p.x === c) && isFloor(out, (c % out.cols), ((c / out.cols) | 0) + 1));
  if (spot !== undefined) out.props.push({ id: pid(), kind: 'stairs-down', x: spot % out.cols, y: (spot / out.cols) | 0, rot: 0 });
  return out;
}

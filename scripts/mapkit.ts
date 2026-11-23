// A small kit for writing the ready-made maps in code: carve rooms, caves and halls, hang doors, place things,
// add rooms' read-aloud text and encounters, then check the result (every thing exists, every monster has a
// stat block, every floor square can be reached from the start) and write it as a library map.
// Run a map file with: npx vite-node scripts/maps/<file>.ts
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { objectById } from '../src/library/objects';
import { monsterById } from '../src/rules/monsters';
import type { DoorState, GameMap, RoomInfo, EncounterInfo, Prop, Note, WallKind } from '../src/engine/map';

export type Dir = 'n' | 's' | 'e' | 'w';
export type Rect = [number, number, number, number];
export interface CarveOpts { mat?: string; tile?: number }
export interface RoomOpts extends CarveOpts { readAloud?: string; gmNotes?: string; label?: [number, number] }
export interface PropOpts { rot?: number; gm?: boolean; v?: number; off?: boolean }

/** Seeded random numbers, so a map comes out the same every run. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export class MapBuilder {
  cells: number[];
  mats: string[];
  doors: Record<string, DoorState> = {};
  doorStyles: Record<string, string> = {};
  walls: string[] = [];
  wallKinds: Record<string, WallKind> = {};
  props: Prop[] = [];
  notes: Note[] = [];
  rooms: RoomInfo[] = [];
  encounters: EncounterInfo[] = [];
  playerStart?: number[];
  private n = 0;
  rnd: () => number;

  constructor(
    public id: string,
    public name: string,
    public cols: number,
    public rows: number,
    public opts: { theme: GameMap['theme']; wallStyle: string; ambient: GameMap['ambient']; floor: string; seed?: number },
  ) {
    this.cells = new Array(cols * rows).fill(0);
    this.mats = new Array(cols * rows).fill('');
    this.rnd = rng(opts.seed ?? 7);
  }

  in(x: number, y: number) { return x >= 0 && y >= 0 && x < this.cols && y < this.rows; }
  at(x: number, y: number) { return this.in(x, y) ? this.cells[y * this.cols + x] : 0; }
  floor(x: number, y: number) { return this.at(x, y) > 0; }

  /** Set one square. tile: 1 floor, 2 water, 3 rubble/difficult, 4 pit. Leaves a 1-square rock rim round the map. */
  set(x: number, y: number, o: CarveOpts = {}) {
    if (x < 1 || y < 1 || x >= this.cols - 1 || y >= this.rows - 1) return;
    const i = y * this.cols + x;
    this.cells[i] = o.tile ?? 1;
    this.mats[i] = o.mat ?? (this.mats[i] || this.opts.floor);
  }
  rect(x: number, y: number, w: number, h: number, o: CarveOpts = {}) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, o);
  }
  /** Re-floor squares that are already carved (water, rubble, a rug of marble...). */
  paint(x: number, y: number, w: number, h: number, o: CarveOpts) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.floor(i, j)) this.set(i, j, { mat: o.mat ?? this.mats[j * this.cols + i], tile: o.tile ?? this.at(i, j) });
  }
  /** Fill back to rock (for pillars of stone, or cutting a shape). */
  fill(x: number, y: number, w: number, h: number) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.in(i, j)) { this.cells[j * this.cols + i] = 0; this.mats[j * this.cols + i] = ''; }
  }

  /** A rectangular room. Returns its rect. */
  room(name: string, x: number, y: number, w: number, h: number, o: RoomOpts = {}): Rect {
    this.rect(x, y, w, h, o);
    this.addRoom(name, [[x, y, w, h]], o, [x + Math.floor(w / 2), y + Math.floor(h / 2)]);
    return [x, y, w, h];
  }
  /** A room made of several rects (an L, a cross, a hall with alcoves). */
  rooms2(name: string, rects: Rect[], o: RoomOpts = {}) {
    for (const r of rects) this.rect(...r, o);
    const [x, y, w, h] = rects[0];
    this.addRoom(name, rects, o, [x + Math.floor(w / 2), y + Math.floor(h / 2)]);
  }
  /** A round room. */
  round(name: string, cx: number, cy: number, r: number, o: RoomOpts = {}) {
    const cells: [number, number][] = [];
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * 0.6) { this.set(x, y, o); cells.push([x, y]); }
    this.addRoom(name, runs(cells), o, [cx, cy]);
  }
  /** A natural cave chamber: a lumpy blob about rx by ry around (cx, cy). */
  cave(name: string, cx: number, cy: number, rx: number, ry: number, o: RoomOpts = {}) {
    const cells = this.blob(cx, cy, rx, ry, o);
    this.addRoom(name, runs(cells), o, [cx, cy]);
  }
  /** A cave blob that isn't a named room (a passage widening, a side pocket). */
  blob(cx: number, cy: number, rx: number, ry: number, o: CarveOpts = {}): [number, number][] {
    const ph = [this.rnd() * 6.28, this.rnd() * 6.28, this.rnd() * 6.28];
    const out: [number, number][] = [];
    for (let y = Math.floor(cy - ry * 1.4); y <= cy + ry * 1.4; y++)
      for (let x = Math.floor(cx - rx * 1.4); x <= cx + rx * 1.4; x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        const a = Math.atan2(dy, dx);
        const wob = 1 + 0.18 * Math.sin(a * 3 + ph[0]) + 0.12 * Math.sin(a * 5 + ph[1]) + 0.08 * Math.sin(a * 7 + ph[2]);
        if (dx * dx + dy * dy <= wob * wob) { this.set(x, y, o); if (this.floor(x, y)) out.push([x, y]); }
      }
    return out;
  }
  /** A hall from (x1,y1) to (x2,y2): straight, or with one bend (horizontal first unless vFirst). */
  hall(x1: number, y1: number, x2: number, y2: number, o: CarveOpts & { w?: number; vFirst?: boolean } = {}) {
    const w = o.w ?? 1;
    const h = (ya: number, xa: number, xb: number) => this.rect(Math.min(xa, xb), ya, Math.abs(xb - xa) + 1, w, o);
    const v = (xa: number, ya: number, yb: number) => this.rect(xa, Math.min(ya, yb), w, Math.abs(yb - ya) + 1, o);
    if (o.vFirst) { v(x1, y1, y2); h(y2, x1, x2); } else { h(y1, x1, x2); v(x2, y1, y2); }
  }
  /** A winding cave tunnel between two points. */
  tunnel(x1: number, y1: number, x2: number, y2: number, o: CarveOpts & { w?: number } = {}) {
    const w = o.w ?? 2;
    let x = x1, y = y1;
    let guard = 0;
    while ((Math.abs(x - x2) > 0 || Math.abs(y - y2) > 0) && guard++ < 2000) {
      this.rect(Math.round(x - (w - 1) / 2), Math.round(y - (w - 1) / 2), w, w, o);
      const dx = x2 - x, dy = y2 - y;
      if (this.rnd() < 0.25) { if (this.rnd() < 0.5) y += Math.sign(dy) || (this.rnd() < 0.5 ? 1 : -1); else x += Math.sign(dx) || (this.rnd() < 0.5 ? 1 : -1); }
      else if (Math.abs(dx) > Math.abs(dy)) x += Math.sign(dx); else y += Math.sign(dy);
      x = Math.max(1, Math.min(this.cols - 2, x)); y = Math.max(1, Math.min(this.rows - 2, y));
    }
    this.rect(x2 - Math.floor((w - 1) / 2), y2 - Math.floor((w - 1) / 2), w, w, o);
  }

  /** A door on the given side of square (x, y). Styles: door-wood, door-iron, door-double, door-secret, portcullis, bars. */
  door(x: number, y: number, side: Dir, state: DoorState = 'closed', style?: string) {
    const k = side === 'n' ? `h:${x},${y}` : side === 's' ? `h:${x},${y + 1}` : side === 'w' ? `v:${x},${y}` : `v:${x + 1},${y}`;
    this.doors[k] = state;
    const st = style ?? (state === 'secret' ? 'door-secret' : state === 'locked' ? 'door-iron' : 'door-wood');
    this.doorStyles[k] = st;
    return k;
  }
  /** A manual wall on a side of a square (to split two rooms that touch), optionally a window, bars or low wall. */
  wall(x: number, y: number, side: Dir, kind?: WallKind) {
    const k = side === 'n' ? `h:${x},${y}` : side === 's' ? `h:${x},${y + 1}` : side === 'w' ? `v:${x},${y}` : `v:${x + 1},${y}`;
    if (!this.walls.includes(k)) this.walls.push(k);
    if (kind) this.wallKinds[k] = kind;
  }

  prop(kind: string, x: number, y: number, o: PropOpts = {}) {
    const p: Prop = { id: `prop-${++this.n}`, kind, x, y, rot: o.rot ?? 0 };
    if (o.gm) p.gmOnly = true;
    if (o.v) p.v = o.v;
    if (o.off) p.off = true;
    this.props.push(p);
    return p;
  }
  /** Scatter n of a kind on free floor squares inside a rect. */
  scatter(kinds: string | string[], n: number, area: Rect, o: PropOpts = {}) {
    const ks = Array.isArray(kinds) ? kinds : [kinds];
    const taken = new Set(this.props.map((p) => `${p.x},${p.y}`));
    let placed = 0, guard = 0;
    while (placed < n && guard++ < 400) {
      const x = area[0] + Math.floor(this.rnd() * area[2]), y = area[1] + Math.floor(this.rnd() * area[3]);
      if (this.at(x, y) !== 1 || taken.has(`${x},${y}`)) continue;
      taken.add(`${x},${y}`);
      this.prop(ks[placed % ks.length], x, y, { ...o, rot: o.rot ?? [0, 90, 180, 270][Math.floor(this.rnd() * 4)] });
      placed++;
    }
  }
  note(x: number, y: number, text: string, gm = true) {
    this.notes.push({ id: `n${this.notes.length + 1}`, x, y, text, ...(gm ? { gmOnly: true } : {}) });
  }
  encounter(name: string, area: Rect, monsters: [string, number][], difficulty: 'easy' | 'medium' | 'hard' | 'deadly' = 'medium', trigger = 'on-enter') {
    this.encounters.push({ name, area, trigger, difficulty, monsters: monsters.map(([srd, count]) => ({ srd, count })) });
  }
  start(x: number, y: number, w = 2, h = 2) { this.playerStart = [x, y, w, h]; }

  private addRoom(name: string, rects: number[][], o: RoomOpts, label: [number, number]) {
    const r: RoomInfo = { id: `room-${this.rooms.length + 1}`, name, rects };
    if (o.readAloud) r.readAloud = o.readAloud;
    if (o.gmNotes) r.gmNotes = o.gmNotes;
    r.labelAt = o.label ?? label;
    this.rooms.push(r);
  }

  /** Check the map and return problems (empty when it's good). */
  check(): string[] {
    const errs: string[] = [];
    for (const p of this.props) {
      if (!objectById(p.kind)) errs.push(`unknown thing "${p.kind}" at ${p.x},${p.y}`);
      if (!this.floor(p.x, p.y)) errs.push(`"${p.kind}" at ${p.x},${p.y} is on rock`);
    }
    for (const e of this.encounters) for (const m of e.monsters) if (!monsterById(m.srd) && !monsterById(normMonsterId(m.srd))) errs.push(`no stat block "${m.srd}" in ${e.name}`);
    for (const e of this.encounters) {
      const [x, y, w, h] = e.area;
      let ok = 0;
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.floor(i, j)) ok++;
      if (!ok) errs.push(`encounter ${e.name} has no floor in its area`);
    }
    for (const k of Object.keys(this.doors)) {
      const [t, xy] = k.split(':');
      const [x, y] = xy.split(',').map(Number);
      const a = t === 'h' ? [x, y - 1] : [x - 1, y];
      if (!this.floor(a[0], a[1]) || !this.floor(x, y)) errs.push(`door ${k} doesn't sit between two floor squares`);
    }
    if (!this.playerStart) errs.push('no player start');
    else {
      // every floor square reachable from the start (doors of any kind count as ways through)
      const W = this.cols;
      const seen = new Set<number>();
      const q = [this.playerStart[1] * W + this.playerStart[0]];
      if (!this.floor(this.playerStart[0], this.playerStart[1])) errs.push('player start is on rock');
      seen.add(q[0]);
      const manual = new Set(this.walls);
      while (q.length) {
        const i = q.pop()!;
        const x = i % W, y = Math.floor(i / W);
        const steps: [number, number, string][] = [[x + 1, y, `v:${x + 1},${y}`], [x - 1, y, `v:${x},${y}`], [x, y + 1, `h:${x},${y + 1}`], [x, y - 1, `h:${x},${y}`]];
        for (const [nx, ny, k] of steps) {
          const j = ny * W + nx;
          if (!this.floor(nx, ny) || seen.has(j)) continue;
          if (manual.has(k) && !this.doors[k]) continue;
          seen.add(j); q.push(j);
        }
      }
      let lost = 0, ex = '';
      this.cells.forEach((v, i) => { if (v > 0 && !seen.has(i)) { lost++; if (!ex) ex = `${i % W},${Math.floor(i / W)}`; } });
      if (lost) errs.push(`${lost} floor squares can't be reached from the start (e.g. ${ex})`);
    }
    return errs;
  }

  toMap(): GameMap {
    return {
      id: this.id, name: this.name, cols: this.cols, rows: this.rows, theme: this.opts.theme,
      cells: this.cells, walls: this.walls, doors: this.doors, props: this.props, notes: this.notes,
      mats: this.mats, wallStyle: this.opts.wallStyle, wallKinds: this.wallKinds, doorStyles: this.doorStyles,
      ambient: this.opts.ambient, lights: [], rooms: this.rooms, encounters: this.encounters, playerStart: this.playerStart,
    };
  }

  /** Check, then write public/library/maps/<id>.json and update its line in public/library/index.json. */
  save(meta: { description: string; setting: string; tags: string[] }) {
    const errs = this.check();
    if (errs.length) {
      console.error(`${this.id}: ${errs.length} problems\n - ` + errs.slice(0, 40).join('\n - '));
      process.exitCode = 1;
      return;
    }
    const root = resolve(__dirname, '..');
    writeFileSync(resolve(root, `public/library/maps/${this.id}.json`), JSON.stringify(this.toMap()));
    const idxPath = resolve(root, 'public/library/index.json');
    const idx = JSON.parse(readFileSync(idxPath, 'utf8'));
    const entry = { id: this.id, name: this.name, cols: this.cols, rows: this.rows, ambient: this.opts.ambient, ...meta, rooms: this.rooms.length, encounters: this.encounters.length };
    const at = idx.maps.findIndex((m: { id: string }) => m.id === this.id);
    if (at >= 0) idx.maps[at] = entry; else idx.maps.push(entry);
    writeFileSync(idxPath, JSON.stringify(idx, null, 1) + '\n');
    const floor = this.cells.filter((v) => v > 0).length;
    console.log(`${this.id}: ${this.cols}×${this.rows}, ${floor} floor squares, ${this.rooms.length} rooms, ${this.props.length} things, ${this.encounters.length} encounters, ${Object.keys(this.doors).length} doors`);
  }
}

/** Monster ids in maps are written kebab-case (goblin-warrior); stat blocks use camelCase (goblinWarrior). */
const normMonsterId = (s: string) => s.trim().replace(/[-_ ]+([a-z0-9])/gi, (_, c: string) => c.toUpperCase()).replace(/^[A-Z]/, (c) => c.toLowerCase());

/** Squares to row-runs [x, y, w, 1], so a cave room can be stored as rects. */
function runs(cells: [number, number][]): number[][] {
  const rows = new Map<number, number[]>();
  for (const [x, y] of cells) (rows.get(y) ?? rows.set(y, []).get(y)!).push(x);
  const out: number[][] = [];
  for (const [y, xs] of [...rows].sort((a, b) => a[0] - b[0])) {
    xs.sort((a, b) => a - b);
    let s = xs[0], p = xs[0];
    for (const x of xs.slice(1).concat([Infinity])) {
      if (x === p + 1) { p = x; continue; }
      out.push([s, y, p - s + 1, 1]);
      s = x; p = x;
    }
  }
  return out;
}

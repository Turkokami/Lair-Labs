// A small toolkit for laying out the adventures' maps in code: rooms, caves, halls, water, doors,
// furniture, lights, named areas with read-aloud text, and encounters. Everything is deterministic,
// so the same adventure always draws the same map.
import { type GameMap, type DoorState, type Prop, type RoomInfo, type EncounterInfo, type MapLight, type WallKind, hKey, vKey } from '../engine/map';

export type Side = 'n' | 's' | 'e' | 'w';
export interface MapOpts {
  theme?: GameMap['theme'];
  wallStyle?: string;
  ambient?: GameMap['ambient'];
  /** Floor material for every square that isn't given one. */
  floor?: string;
  /** Outdoor maps start as open ground instead of solid rock. */
  open?: boolean;
}

/** Small seeded random numbers, so maps never change between loads. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000);
}

export class MapBuilder {
  readonly cols: number;
  readonly rows: number;
  private cells: number[];
  private mats: string[];
  private doors: Record<string, DoorState> = {};
  private doorStyles: Record<string, string> = {};
  private wallKinds: Record<string, WallKind> = {};
  private walls: string[] = [];
  private props: Prop[] = [];
  private lights: MapLight[] = [];
  private rooms: RoomInfo[] = [];
  private notes: GameMap['notes'] = [];
  private encounters: EncounterInfo[] = [];
  private startRect?: number[];
  private n = 0;
  private opts: MapOpts;

  constructor(readonly id: string, readonly name: string, cols: number, rows: number, opts: MapOpts = {}) {
    this.cols = cols;
    this.rows = rows;
    this.opts = opts;
    this.cells = new Array(cols * rows).fill(opts.open ? 1 : 0);
    this.mats = new Array(cols * rows).fill(opts.open ? opts.floor ?? 'grass' : '');
  }

  private uid(p: string) { return `${p}${(this.n++).toString(36)}`; }
  private ok(x: number, y: number) { return x >= 0 && y >= 0 && x < this.cols && y < this.rows; }
  private setCell(x: number, y: number, v: number, mat?: string) {
    if (!this.ok(x, y)) return;
    const i = y * this.cols + x;
    this.cells[i] = v;
    if (mat !== undefined) this.mats[i] = mat;
  }
  isFloor(x: number, y: number) { return this.ok(x, y) && this.cells[y * this.cols + x] > 0; }
  cellAt(x: number, y: number) { return this.ok(x, y) ? this.cells[y * this.cols + x] : 0; }

  /** Open floor in a rectangle. */
  floor(x: number, y: number, w: number, h: number, mat?: string) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.setCell(i, j, 1, mat ?? this.opts.floor ?? '');
    return this;
  }
  /** Solid rock (or, outdoors, impassable ground) in a rectangle. */
  rock(x: number, y: number, w: number, h: number) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.setCell(i, j, 0, '');
    return this;
  }
  /** Change the floor material where there is floor already. */
  paint(x: number, y: number, w: number, h: number, mat: string) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.isFloor(i, j)) this.mats[j * this.cols + i] = mat;
    return this;
  }

  /** A named rectangular room. `more` adds extra rectangles to the same named area. */
  room(name: string, x: number, y: number, w: number, h: number, o: { mat?: string; read?: string; gm?: string; label?: [number, number]; more?: number[][] } = {}) {
    this.floor(x, y, w, h, o.mat);
    for (const [a, b, c, d] of o.more ?? []) this.floor(a, b, c, d, o.mat);
    this.area(name, [[x, y, w, h], ...(o.more ?? [])], o);
    return this;
  }

  /** Name an area of the map (for labels, read-aloud text and auto-reveal) without changing the floor. */
  area(name: string, rects: number[][], o: { read?: string; gm?: string; label?: [number, number] } = {}) {
    const [x, y, w, h] = rects[0];
    this.rooms.push({ id: this.uid('room-'), name, rects, readAloud: o.read, gmNotes: o.gm, labelAt: o.label ?? [x + Math.floor(w / 2), y + Math.floor(h / 2)] });
    return this;
  }

  /** A rough, natural cave: an oval with a wobbling edge. */
  cave(name: string | null, cx: number, cy: number, rx: number, ry: number, o: { seed?: number; mat?: string; read?: string; gm?: string; wobble?: number } = {}) {
    const r = rng(o.seed ?? (cx * 31 + cy * 17));
    const k1 = 2 + Math.floor(r() * 3), k2 = 4 + Math.floor(r() * 4), p1 = r() * 6.28, p2 = r() * 6.28;
    const wob = o.wobble ?? 0.16;
    let x0 = this.cols, y0 = this.rows, x1 = 0, y1 = 0;
    for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++)
      for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        const a = Math.atan2(dy, dx);
        const lim = 1 + wob * Math.sin(k1 * a + p1) + wob * 0.6 * Math.sin(k2 * a + p2);
        if (dx * dx + dy * dy <= lim * lim && this.ok(x, y)) {
          this.setCell(x, y, 1, o.mat ?? this.opts.floor ?? 'cave-floor');
          x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
        }
      }
    if (name) this.area(name, [[Math.round(cx - rx * 0.7), Math.round(cy - ry * 0.7), Math.max(1, Math.round(rx * 1.4)), Math.max(1, Math.round(ry * 1.4))]], { ...o, label: [Math.round(cx), Math.round(cy)] });
    return this;
  }

  /** A hall from point to point, going across first and then down (or down first). */
  hall(ax: number, ay: number, bx: number, by: number, w = 1, o: { mat?: string; downFirst?: boolean } = {}) {
    const put = (x: number, y: number) => { for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) if (!this.isFloor(x + i, y + j)) this.setCell(x + i, y + j, 1, o.mat ?? this.opts.floor ?? ''); };
    let x = ax, y = ay;
    put(x, y);
    const sx = Math.sign(bx - ax), sy = Math.sign(by - ay);
    if (o.downFirst) {
      while (y !== by) { y += sy; put(x, y); }
      while (x !== bx) { x += sx; put(x, y); }
    } else {
      while (x !== bx) { x += sx; put(x, y); }
      while (y !== by) { y += sy; put(x, y); }
    }
    return this;
  }

  /** A winding natural tunnel through a list of points. */
  tunnel(points: [number, number][], w = 2, o: { mat?: string; seed?: number } = {}) {
    const r = rng(o.seed ?? points.length * 97 + points[0][0]);
    for (let p = 0; p < points.length - 1; p++) {
      const [ax, ay] = points[p], [bx, by] = points[p + 1];
      const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 2;
      const dig = (x: number, y: number) => {
        for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) if (!this.isFloor(x + i, y + j)) this.setCell(x + i, y + j, 1, o.mat ?? this.opts.floor ?? 'cave-floor');
      };
      let px = ax, py = ay;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const jx = Math.round((r() - 0.5) * 0.9), jy = Math.round((r() - 0.5) * 0.9);
        const x = Math.round(ax + (bx - ax) * t) + jx, y = Math.round(ay + (by - ay) * t) + jy;
        // walk there square by square, never corner to corner, so the way is always passable
        while (px !== x) { px += Math.sign(x - px); dig(px, py); }
        while (py !== y) { py += Math.sign(y - py); dig(px, py); }
        dig(x, y);
      }
    }
    return this;
  }

  private terrain(v: number, x: number, y: number, w: number, h: number, mat?: string, onlyFloor = false) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) {
        if (onlyFloor && !this.isFloor(i, j)) continue;
        this.setCell(i, j, v, mat);
      }
    return this;
  }
  water(x: number, y: number, w: number, h: number, deep = false, onlyFloor = false) { return this.terrain(2, x, y, w, h, deep ? 'water-deep' : 'water-shallow', onlyFloor); }
  /** Water in a rough oval (ponds, flooded caves). */
  pool(cx: number, cy: number, rx: number, ry: number, deep = false) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.setCell(x, y, 2, deep && dx * dx + dy * dy < 0.45 ? 'water-deep' : 'water-shallow');
      }
    return this;
  }
  rubble(x: number, y: number, w: number, h: number) { return this.terrain(3, x, y, w, h, undefined, true); }
  mud(x: number, y: number, w: number, h: number) { return this.terrain(3, x, y, w, h, 'mud', true); }
  lava(x: number, y: number, w: number, h: number) { return this.terrain(3, x, y, w, h, 'lava'); }
  ice(x: number, y: number, w: number, h: number) { return this.terrain(1, x, y, w, h, 'ice', true); }
  pit(x: number, y: number, w: number, h: number) { return this.terrain(4, x, y, w, h, 'pit'); }

  private edge(x: number, y: number, side: Side) {
    return side === 'n' ? hKey(x, y) : side === 's' ? hKey(x, y + 1) : side === 'w' ? vKey(x, y) : vKey(x + 1, y);
  }
  /** A door on one side of a square. */
  door(x: number, y: number, side: Side, state: DoorState = 'closed', style = 'door-wood') {
    const k = this.edge(x, y, side);
    this.doors[k] = state;
    this.doorStyles[k] = state === 'secret' ? 'door-secret' : style;
    return this;
  }
  /** A wall inside open floor (to split a room or build a fence line outdoors). */
  wall(x: number, y: number, side: Side, kind?: WallKind) {
    const k = this.edge(x, y, side);
    if (kind) this.wallKinds[k] = kind;
    this.walls.push(k);
    return this;
  }
  /** A run of wall along one side of several squares. */
  wallRun(x: number, y: number, len: number, side: Side, kind?: WallKind) {
    for (let i = 0; i < len; i++) side === 'n' || side === 's' ? this.wall(x + i, y, side, kind) : this.wall(x, y + i, side, kind);
    return this;
  }

  /**
   * A building on open ground: a floor of its own with thin walls all round. Doors are [x, y, side] on its edge.
   * `name` labels it on the map like a room.
   */
  building(name: string, x: number, y: number, w: number, h: number, o: { mat?: string; read?: string; gm?: string; doors?: [number, number, Side, DoorState?, string?][]; windows?: [number, number, Side][] } = {}) {
    this.room(name, x, y, w, h, { mat: o.mat ?? 'wood-planks', read: o.read, gm: o.gm });
    this.wallRun(x, y, w, 'n').wallRun(x, y + h - 1, w, 's').wallRun(x, y, h, 'w').wallRun(x + w - 1, y, h, 'e');
    for (const [dx, dy, side, state, style] of o.doors ?? []) this.door(dx, dy, side, state ?? 'closed', style ?? 'door-wood');
    for (const [wx, wy, side] of o.windows ?? []) this.wallKinds[this.edge(wx, wy, side)] = 'window';
    return this;
  }

  prop(kind: string, x: number, y: number, rot = 0, o: { gm?: boolean; v?: number; off?: boolean } = {}) {
    this.props.push({ id: this.uid('pr'), kind, x, y, rot, gmOnly: o.gm || undefined, v: o.v || undefined, off: o.off || undefined });
    return this;
  }
  /** The same thing in a row of squares. */
  props_(kind: string, pts: [number, number][], rot = 0, o: { gm?: boolean; v?: number } = {}) {
    for (const [x, y] of pts) this.prop(kind, x, y, rot, o);
    return this;
  }
  light(x: number, y: number, bright = 20, dim = 20, color = '#ffb35c') {
    this.lights.push({ id: this.uid('li'), x: x + 0.5, y: y + 0.5, bright, dim, color });
    return this;
  }
  note(x: number, y: number, text: string, gm = true) {
    this.notes.push({ id: this.uid('no'), x, y, text: text.slice(0, 500), gmOnly: gm || undefined });
    return this;
  }
  /** A fight waiting in an area. Monster ids are the stat block ids (kebab-case is fine). */
  encounter(name: string, area: number[], monsters: [string, number][], difficulty: 'low' | 'moderate' | 'high', trigger = 'on-enter') {
    this.encounters.push({ name, area, trigger, difficulty, monsters: monsters.map(([srd, count]) => ({ srd, count })) });
    return this;
  }
  start(x: number, y: number, w = 3, h = 3) {
    this.startRect = [x, y, w, h];
    return this;
  }

  build(): GameMap {
    // doors that ended up in solid rock on both sides would confuse the table: drop them
    const doors: Record<string, DoorState> = {};
    for (const [k, s] of Object.entries(this.doors)) {
      const [t, rest] = k.split(':');
      const [x, y] = rest.split(',').map(Number);
      const a = t === 'h' ? [x, y - 1] : [x - 1, y];
      if (this.isFloor(x, y) || this.isFloor(a[0], a[1])) doors[k] = s;
    }
    const doorStyles = Object.fromEntries(Object.entries(this.doorStyles).filter(([k]) => doors[k]));
    return {
      id: this.id, name: this.name, cols: this.cols, rows: this.rows,
      theme: this.opts.theme ?? 'stone', wallStyle: this.opts.wallStyle ?? (this.opts.theme === 'cave' ? 'cave' : 'stone'),
      ambient: this.opts.ambient ?? 'dark',
      cells: this.cells.slice(), mats: this.mats.slice(), walls: [...new Set(this.walls)].filter((k) => !doors[k]), doors, doorStyles, wallKinds: { ...this.wallKinds },
      props: this.props.slice(), notes: this.notes.slice(), lights: this.lights.slice(), rooms: this.rooms.slice(), encounters: this.encounters.slice(),
      playerStart: this.startRect,
    };
  }
}

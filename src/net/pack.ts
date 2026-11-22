// Squeezes a player's view for the wire. Big outdoor maps have tens of thousands of squares, and the
// view goes out on every token move, so: squares and grounds are run-length coded, grounds use a short
// palette, square lists become ranges, and the map itself is only sent again when it has changed.
import type { PlayerView } from '../engine/game';
import type { GameMap } from '../engine/map';

/** [value, count, value, count, ...] */
export function rle(a: ArrayLike<number>): number[] {
  const out: number[] = [];
  for (let i = 0; i < a.length; ) {
    const v = a[i];
    let n = 1;
    while (i + n < a.length && a[i + n] === v) n++;
    out.push(v, n);
    i += n;
  }
  return out;
}
export function unrle(r: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < r.length; i += 2) for (let k = 0; k < r[i + 1]; k++) out.push(r[i]);
  return out;
}

/** A sorted list of square numbers as [start, length, start, length, ...]. */
export function ranges(list: number[]): number[] {
  const s = [...list].sort((a, b) => a - b);
  const out: number[] = [];
  for (let i = 0; i < s.length; ) {
    let n = 1;
    while (i + n < s.length && s[i + n] === s[i] + n) n++;
    out.push(s[i], n);
    i += n;
    while (i < s.length && s[i] === s[i - 1]) i++; // duplicates
  }
  return out;
}
export function unranges(r: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < r.length; i += 2) for (let k = 0; k < r[i + 1]; k++) out.push(r[i] + k);
  return out;
}

export interface PackedMap extends Omit<GameMap, 'cells' | 'mats'> { cells: number[]; mats?: { pal: string[]; idx: number[] }; packed: 1 }

export function packMap(m: GameMap): PackedMap {
  let mats: PackedMap['mats'];
  if (m.mats) {
    const pal: string[] = [''];
    const at = new Map<string, number>([['', 0]]);
    // squares the viewer can't see (-1) carry no ground: smaller, and nothing leaks through the fog
    const idx = m.mats.map((id, i) => {
      if (m.cells[i] === -1 || !id) return 0;
      let k = at.get(id);
      if (k === undefined) { k = pal.length; pal.push(id); at.set(id, k); }
      return k;
    });
    mats = { pal, idx: rle(idx) };
  }
  return { ...m, cells: rle(m.cells), mats, packed: 1 };
}
export function unpackMap(p: PackedMap | GameMap): GameMap {
  if (!(p as PackedMap).packed) return p as GameMap;
  const { packed: _p, mats, cells, ...rest } = p as PackedMap;
  const out: GameMap = { ...(rest as Omit<GameMap, 'cells'>), cells: unrle(cells) } as GameMap;
  if (mats) out.mats = unrle(mats.idx).map((k) => mats.pal[k] ?? '');
  return out;
}

export interface WireView extends Omit<PlayerView, 'map' | 'revealed' | 'visible' | 'lit'> {
  /** Left out when the map is the same as last time. */
  map?: PackedMap;
  mapKey: string;
  revealed: number[];
  visible?: number[];
  lit?: number[];
  packed: 1;
}

/** Pack a view. Returns the wire form and the packed map's text, which the caller keeps to spot changes. */
export function packView(v: PlayerView, lastMapText?: string): { wire: WireView; mapText: string } {
  const pm = packMap(v.map);
  const mapText = JSON.stringify(pm);
  const same = mapText === lastMapText;
  const wire: WireView = {
    ...v,
    map: same ? undefined : pm,
    mapKey: String(mapText.length) + ':' + hashText(mapText),
    revealed: ranges(v.revealed),
    visible: v.visible ? ranges(v.visible) : undefined,
    lit: v.lit !== undefined ? rle(Array.from(v.lit, (c) => c.charCodeAt(0) - 48)) : undefined,
    packed: 1,
  };
  return { wire, mapText };
}

/** Unpack a view. `prev` supplies the map when the host left it out. */
export function unpackView(w: WireView | PlayerView, prev?: GameMap): PlayerView | undefined {
  if (!(w as WireView).packed) return w as PlayerView;
  const { packed: _p, mapKey: _k, map, revealed, visible, lit, ...rest } = w as WireView;
  const m = map ? unpackMap(map) : prev;
  if (!m) return undefined;
  return {
    ...rest,
    map: m,
    revealed: unranges(revealed),
    visible: visible ? unranges(visible) : undefined,
    lit: lit ? unrle(lit).map((n) => String.fromCharCode(n + 48)).join('') : undefined,
  } as PlayerView;
}

function hashText(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

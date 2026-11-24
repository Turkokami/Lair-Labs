// Checks that a ready-made adventure is sound: big connected maps, real props and stat blocks,
// fights as hard as they say, and scenes and people that point at real things. Used by the tests
// and by scripts/check-adventure.ts while writing a new adventure.
import { isFloor, isWall, edgeBetween, type GameMap } from '../engine/map';
import { objectById } from '../library/objects';
import { creatureById, creatureForMonster } from '../library/creatures';
import { monsterById } from '../rules/monsters';
import { encounterXp, difficultyFor, statId } from './xp';
import type { Adventure } from './types';

/** The old Goblin Warren sample had 342 floor squares; every adventure map has at least five times that. */
export const MIN_FLOOR = 342 * 5;

/** Every floor square reachable from the heroes' start, walking through doors (open, shut or secret) and windows. */
export function reachable(m: GameMap) {
  const [sx, sy] = m.playerStart ?? [0, 0];
  const seen = new Set<number>([sy * m.cols + sx]);
  const todo: [number, number][] = [[sx, sy]];
  while (todo.length) {
    const [x, y] = todo.pop()!;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (!isFloor(m, nx, ny) || seen.has(ny * m.cols + nx)) continue;
      const k = edgeBetween(x, y, nx, ny)!;
      if (isWall(m, k) && !m.doors[k] && m.wallKinds?.[k] !== 'window') continue;
      seen.add(ny * m.cols + nx);
      todo.push([nx, ny]);
    }
  }
  return seen;
}

/** Problems with one map, as plain sentences. */
export function checkMap(m: GameMap, level: number): string[] {
  const out: string[] = [];
  if (m.cols > 80 || m.rows > 80) out.push(`${m.name}: ${m.cols}x${m.rows} is bigger than 80x80`);
  const floor = m.cells.filter((v) => v > 0).length;
  if (floor < MIN_FLOOR) out.push(`${m.name}: only ${floor} floor squares (need ${MIN_FLOOR})`);
  if (!m.playerStart || !isFloor(m, m.playerStart[0], m.playerStart[1])) out.push(`${m.name}: the heroes' start is not on floor`);
  else {
    const seen = reachable(m);
    const lost = m.cells.map((v, i) => (v > 0 && !seen.has(i) ? `${i % m.cols},${Math.floor(i / m.cols)}` : '')).filter(Boolean);
    if (lost.length) out.push(`${m.name}: ${lost.length} floor squares can't be reached from the start, e.g. ${lost.slice(0, 6).join(' ')}`);
  }
  for (const p of m.props) {
    if (!objectById(p.kind)) out.push(`${m.name}: unknown prop "${p.kind}"`);
    else if (!isFloor(m, p.x, p.y)) out.push(`${m.name}: prop ${p.kind} at ${p.x},${p.y} is not on floor`);
  }
  for (const l of m.lights ?? []) if (!isFloor(m, Math.floor(l.x), Math.floor(l.y))) out.push(`${m.name}: light at ${l.x},${l.y} is not on floor`);
  for (const k of Object.keys(m.doors)) {
    const [t, xy] = k.split(':');
    const [x, y] = xy.split(',').map(Number);
    const [ax, ay, bx, by] = t === 'h' ? [x, y - 1, x, y] : [x - 1, y, x, y];
    if (!isFloor(m, ax, ay) || !isFloor(m, bx, by)) out.push(`${m.name}: door ${k} needs floor on both sides`);
  }
  for (const en of m.encounters ?? []) {
    for (const g of en.monsters) {
      const id = statId(g.srd);
      if (!id) out.push(`${m.name}: "${en.name}" uses unknown monster ${g.srd}`);
      else if (!creatureForMonster(id)) out.push(`${m.name}: "${en.name}" monster ${id} has no token art (add it to ART_ in src/rules/own)`);
    }
    const d = difficultyFor(encounterXp(en.monsters), level);
    if (d !== en.difficulty) out.push(`${m.name}: "${en.name}" is ${d} for level ${level} (${encounterXp(en.monsters)} XP), but says ${en.difficulty}`);
    const [ax, ay, aw, ah] = en.area;
    let spots = 0;
    for (let y = ay; y < ay + ah; y++) for (let x = ax; x < ax + aw; x++) if (isFloor(m, x, y)) spots++;
    if (spots < en.monsters.reduce((n, g) => n + g.count, 0)) out.push(`${m.name}: "${en.name}" area has too little floor for its monsters`);
  }
  const names = (m.rooms ?? []).map((r) => r.name);
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  if (dup.length) out.push(`${m.name}: two areas share the name ${dup[0]}`);
  return out;
}

/** Every problem with an adventure, as plain sentences. Empty means it's ready. */
export function checkAdventure(a: Adventure): string[] {
  const out: string[] = [];
  if (!/^[a-z0-9-]+$/.test(a.id)) out.push(`bad adventure id ${a.id}`);
  const ids = new Set(a.npcs.map((n) => n.id));
  if (ids.size !== a.npcs.length) out.push('two NPCs share an id');
  for (const n of a.npcs) {
    if (!/^pf_[a-z0-9]{4,32}$/.test(n.id)) out.push(`NPC id ${n.id} must be pf_ and 4-32 lowercase letters or digits`);
    if (n.art && !creatureById(n.art)) out.push(`NPC ${n.name}: unknown art ${n.art}`);
    if (n.monsterId && !monsterById(n.monsterId)) out.push(`NPC ${n.name}: unknown monsterId ${n.monsterId}`);
    else if (n.monsterId && !n.art && !creatureForMonster(n.monsterId)) out.push(`NPC ${n.name}: ${n.monsterId} has no token art (give the NPC art, or add it to ART_ in src/rules/own)`);
    if (!(n.wants && n.knows && n.voice && n.appearance)) out.push(`NPC ${n.name}: needs wants, knows, voice and appearance`);
  }
  const handouts = new Set(a.handouts.map((h) => h.id));
  const mapIds = new Set<string>();
  for (const ch of a.chapters) {
    const m = ch.map();
    if (mapIds.has(m.id)) out.push(`${ch.title}: map id ${m.id} is used twice`);
    mapIds.add(m.id);
    if (JSON.stringify(m) !== JSON.stringify(ch.map())) out.push(`${ch.title}: the map changes between loads (use rng(seed), not Math.random)`);
    out.push(...checkMap(m, ch.level));
    const rooms = new Set((m.rooms ?? []).map((r) => r.name));
    const fights = new Set((m.encounters ?? []).map((e) => e.name));
    for (const sc of ch.scenes) {
      if (sc.room && !rooms.has(sc.room)) out.push(`${ch.title}: scene "${sc.title}" points at unknown area "${sc.room}"`);
      if (sc.encounter && !fights.has(sc.encounter)) out.push(`${ch.title}: scene "${sc.title}" points at unknown fight "${sc.encounter}"`);
      if (sc.handout && !handouts.has(sc.handout)) out.push(`${ch.title}: scene "${sc.title}" points at unknown handout "${sc.handout}"`);
    }
    for (const p of ch.npcs) {
      if (!ids.has(p.npc)) out.push(`${ch.title}: placement of unknown NPC ${p.npc}`);
      if (!isFloor(m, p.x, p.y)) out.push(`${ch.title}: ${p.npc} at ${p.x},${p.y} is not on floor`);
    }
  }
  return out;
}

// Setting an adventure's part up at the table: its map, its people, and its monsters (hidden until the GM reveals them).
import type { GameState, Intent } from '../engine/game';
import { isFloor, type GameMap } from '../engine/map';
import { monsterById, sizeSquares } from '../rules/monsters';
import { creatureById, creatureForMonster } from '../library/creatures';
import { mod } from '../rules/core';
import type { AdvChapter, AdvNpc, Adventure } from './types';
import { statId } from './xp';

export interface AdventureProgress { id: string; chapter: number }

type Encounter = NonNullable<GameMap['encounters']>[number];

/** A stat block written out for a profile, from the SRD monster an NPC uses. */
function statsFor(npc: AdvNpc) {
  if (npc.stats) return npc.stats;
  const mon = npc.monsterId ? monsterById(npc.monsterId) : undefined;
  if (!mon) return undefined;
  return {
    race: `${mon.size} ${mon.kind}`, level: `CR ${mon.cr} (${mon.xp} XP)`, ac: String(mon.ac), hp: `${mon.hp} (${mon.hpDice})`, speed: mon.speed,
    abilities: [...mon.abilities], senses: mon.senses,
    traits: mon.traits?.map((x) => `${x.name}. ${x.text}`).join('\n'),
    actions: mon.actions.map((a) => `${a.name}. ${a.hit !== undefined ? `${a.hit >= 0 ? '+' : ''}${a.hit} to hit, ` : ''}${a.dmg ? `${a.dmg} ${a.type ?? ''}` : ''}${a.save ? ` ${a.save}` : ''}${a.text ? ` ${a.text}` : ''}`.trim()).join('\n'),
  };
}

/** The profile an adventure NPC gets: story for the players (if shared), the secrets for the GM. */
export function npcProfile(npc: AdvNpc) {
  return {
    id: npc.id,
    name: npc.name,
    title: npc.title,
    story: { appearance: npc.appearance, personality: npc.voice, goals: npc.wants, ...(npc.backstory ? { backstory: npc.backstory } : {}) },
    gmNotes: [`Knows: ${npc.knows}`, npc.gmNotes].filter(Boolean).join('\n\n'),
    stats: statsFor(npc),
    shared: !!npc.shared,
  };
}

/** An encounter's monsters, less the named people placed inside its area who already stand for one of them. */
export function encounterGroups(chapter: AdvChapter, adv: Adventure, en: Encounter) {
  const groups = en.monsters.map((g) => ({ ...g, id: statId(g.srd) }));
  const [ax, ay, aw, ah] = en.area;
  for (const p of chapter.npcs) {
    const npc = adv.npcs.find((n) => n.id === p.npc);
    if (!npc?.monsterId || p.x < ax || p.y < ay || p.x >= ax + aw || p.y >= ay + ah) continue;
    const g = groups.find((x) => x.id === npc.monsterId && x.count > 0);
    if (g) g.count--;
  }
  return groups.filter((g) => g.count > 0);
}

/** Puts an encounter's monsters on the map, hidden, spread over its area. */
export function placeEncounterHidden(gm: (i: Intent) => boolean, map: GameMap, chapter: AdvChapter, adv: Adventure, en: Encounter): number {
  const [ax, ay, aw, ah] = en.area;
  const spots: [number, number][] = [];
  for (let y = ay; y < ay + ah; y++) for (let x = ax; x < ax + aw; x++) if (isFloor(map, x, y) && map.cells[y * map.cols + x] === 1) spots.push([x, y]);
  // spread them out: shuffle the floor squares and take them in turn
  for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
  let placed = 0, k = 0;
  for (const g of encounterGroups(chapter, adv, en)) {
    if (!g.id) continue;
    for (let i = 0; i < g.count; i++) {
      const [x, y] = spots.length ? spots[k++ % spots.length] : [ax, ay];
      if (gm({ t: 'gm:addMonster', monsterId: g.id, x, y, hidden: true })) placed++;
    }
  }
  return placed;
}

/** Loads one part of an adventure: map, profiles, NPC tokens, and (optionally) every encounter's monsters, hidden. */
export function startChapter(gm: (i: Intent) => boolean, s: () => GameState, adv: Adventure, index: number, o: { monsters: boolean; clear: boolean }) {
  const chapter = adv.chapters[index];
  if (!chapter) return false;
  if (o.clear) for (const t of [...s().tokens]) if (t.kind !== 'pc') gm({ t: 'gm:removeToken', tokenId: t.id });
  const map = chapter.map();
  if (!gm({ t: 'gm:setMap', map })) return false;
  // every person in the adventure gets a profile now, so the GM can read ahead
  for (const npc of adv.npcs) {
    // a profile the GM already has (and may have changed) stays as it is
    if (s().profiles?.[npc.id]) continue;
    if (gm({ t: 'gm:newProfile', name: npc.name, kind: npc.kind, id: npc.id })) gm({ t: 'profile:save', profile: npcProfile(npc) });
  }
  for (const p of chapter.npcs) {
    const npc = adv.npcs.find((n) => n.id === p.npc);
    if (!npc) continue;
    const mon = npc.monsterId ? monsterById(npc.monsterId) : undefined;
    const art = npc.art && creatureById(npc.art) ? npc.art : mon ? creatureForMonster(mon.id)?.id : undefined;
    gm({
      t: 'gm:addToken',
      token: {
        name: npc.name, x: p.x, y: p.y, kind: npc.kind, hidden: !!p.hidden, profileId: npc.id, art,
        color: npc.kind === 'monster' ? '#b23a3a' : '#8a8f98',
        ...(mon ? {
          monsterId: mon.id, hp: mon.hp, maxHp: mon.hp, ac: mon.ac, size: sizeSquares(mon.size), initMod: mod(mon.abilities[1]),
          speed: parseInt(mon.speed, 10) || 30, darkvision: parseInt(/darkvision (\d+)/i.exec(mon.senses)?.[1] ?? '0', 10),
        } : {}),
      },
    });
  }
  let placed = 0;
  if (o.monsters) for (const en of map.encounters ?? []) placed += placeEncounterHidden(gm, map, chapter, adv, en);
  return { placed };
}

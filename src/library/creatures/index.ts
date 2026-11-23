import type { CreatureDef } from '../art/types';
import { CORE_CREATURES } from './core';
import { PEOPLE_CREATURES } from './people';
import { UNDEAD_FEY_CREATURES } from './undead-fey';
import { BEAST_CREATURES } from './beasts';
import { PLANAR_CREATURES } from './planar';
import { STAPLE_CREATURES } from './staples';

// Left out on purpose: names that come from a game book rather than the free rules or folklore.
const NOT_FREE = new Set(['twigBlight', 'needleBlight', 'vineBlight', 'myconid', 'grick']);
const seen = new Set<string>(NOT_FREE);
/** Every creature and hero token. Ids are stable: tokens refer to them. When two sets draw the same id, the first wins. */
export const CREATURES: CreatureDef[] = [...CORE_CREATURES, ...PEOPLE_CREATURES, ...UNDEAD_FEY_CREATURES, ...BEAST_CREATURES, ...PLANAR_CREATURES, ...STAPLE_CREATURES].filter((c) => !seen.has(c.id) && !!seen.add(c.id));

const byId = new Map(CREATURES.map((c) => [c.id, c]));
export const creatureById = (id: string): CreatureDef | undefined => byId.get(id);

/** Stat block ids are camelCase (giantSpider); the map library writes them kebab-case (giant-spider). */
export const normMonsterId = (s: string) => s.trim().replace(/[-_ ]+([a-z0-9])/gi, (_, c: string) => c.toUpperCase()).replace(/^[A-Z]/, (c) => c.toLowerCase());
const bySrd = new Map<string, CreatureDef>();
for (const c of CREATURES) if (c.srd && !bySrd.has(normMonsterId(c.srd))) bySrd.set(normMonsterId(c.srd), c);
const byName = new Map(CREATURES.map((c) => [normMonsterId(c.name.toLowerCase()), c]));
/** The token art for a stat-block monster id from src/rules/monsters.ts. */
// Stat blocks whose token is a close cousin's art.
const ALIAS: Record<string, string> = {
  rat: 'giant-rat', shriekerFungus: 'shrieker', goblinMinion: 'goblin', goblinWarrior: 'goblin', merfolkSkirmisher: 'merfolk',
  giantVenomousSnake: 'snake', swarmOfBats: 'bat', tough: 'thug', skeletonWarhorse: 'warhorse-skeleton', willOWisp: 'will-o-wisp',
};
export const creatureForMonster = (monsterId: string): CreatureDef | undefined => {
  const id = normMonsterId(monsterId);
  const hit = bySrd.get(id) ?? byName.get(id) ?? (ALIAS[id] ? byId.get(ALIAS[id]) : undefined) ?? byId.get(id.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()));
  if (hit) return hit;
  const w = /^([a-z]+)DragonWyrmling$/.exec(id);
  if (w) return byId.get(`dragon-${w[1]}-wyrmling`);
  const d = /^(young|adult|ancient)([A-Z][a-z]+)Dragon$/.exec(id);
  return d ? byId.get(`dragon-${d[2].toLowerCase()}-${d[1]}`) : undefined;
};

/** Stat block ids that could belong to a creature token, best guess first. */
export function monsterIdCandidates(c: CreatureDef): string[] {
  const out: string[] = [];
  if (c.srd) out.push(normMonsterId(c.srd));
  const d = /^dragon-([a-z]+)-(wyrmling|young|adult|ancient)$/.exec(c.id);
  if (d) {
    const col = d[1], Col = col[0].toUpperCase() + col.slice(1);
    out.push(d[2] === 'wyrmling' ? `${col}DragonWyrmling` : `${d[2]}${Col}Dragon`);
  }
  out.push(normMonsterId(c.id), normMonsterId(c.name.toLowerCase()));
  return out;
}

// Usage: npx vite-node scripts/monster-art-check.ts
// Lists every stat block an adventure uses (fights and people) that has no token art.
import { ADVENTURE_CARDS, loadAdventure } from '../src/adventures';
import { creatureForMonster, creatureById } from '../src/library/creatures';
import { statId } from '../src/adventures/xp';
import { ADVENTURE_MONSTER_ART } from '../src/rules/own';

let bad = 0;
for (const [id, art] of Object.entries(ADVENTURE_MONSTER_ART)) if (!creatureById(art)) { bad++; console.log(`art for ${id}: no creature "${art}"`); }
for (const c of ADVENTURE_CARDS) {
  const a = await loadAdventure(c.id);
  const ids = new Set<string>();
  for (const n of a.npcs) if (n.monsterId && !n.art) ids.add(n.monsterId);
  for (const ch of a.chapters) for (const en of ch.map().encounters ?? []) for (const g of en.monsters) ids.add(statId(g.srd) ?? g.srd);
  for (const id of ids) if (!creatureForMonster(id)) { bad++; console.log(`${a.id}: ${id} has no token art`); }
}
console.log(bad ? `${bad} problems` : 'OK: every stat block in use has token art');

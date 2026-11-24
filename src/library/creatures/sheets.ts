// Monsters built from the owner's own concept sheets (front / side / back art). Each one's token is a head-and-shoulders
// crop of its sheet (public/library/portraits/<id>.webp); until the picture loads, a close cousin's drawing stands in.
// Each has an original Lair Labs stat block (src/rules/own/sheets.ts, id = this id in camelCase) and a rigged 3D figure
// (public/models/<id>.glb, registered in src/view3d/custom-models.ts). Steps: docs/monster-pipeline.md.
import type { CreatureDef, CreatureFamily, CreatureSize } from '../art/types';

interface SheetSpec {
  id: string;
  name: string;
  family: CreatureFamily;
  size: CreatureSize;
  cr: string;
  tags: string[];
  /** Drawn token that stands in until the picture loads. */
  base: string;
}

const SPECS: SheetSpec[] = [
  { id: 'goblin-alchemist', name: 'Goblin Alchemist', family: 'humanoid', size: 'Small', cr: '1', base: 'goblin',
    tags: ['goblin', 'goblinoid', 'alchemist', 'potion', 'bomb', 'flask', 'tinker', 'goggles', 'npc', 'small', '3d'] },
  { id: 'zombie-butcher', name: 'Zombie Butcher', family: 'undead', size: 'Medium', cr: '2', base: 'plague-zombie',
    tags: ['undead', 'zombie', 'butcher', 'cleaver', 'rotting', 'graveyard', 'village', 'horror', '3d'] },
  { id: 'dragonborn-archer', name: 'Dragonborn Archer', family: 'humanoid', size: 'Medium', cr: '2', base: 'hero-dragonborn-ranger',
    tags: ['dragonborn', 'archer', 'bow', 'ranger', 'scout', 'hunter', 'red', 'fire', 'npc', '3d'] },
  { id: 'orc-shaman', name: 'Orc Shaman', family: 'humanoid', size: 'Medium', cr: '3', base: 'orc',
    tags: ['orc', 'shaman', 'spirit', 'crystal', 'staff', 'storm', 'caster', 'tribe', 'npc', '3d'] },
  { id: 'werewolf-reaver', name: 'Werewolf Reaver', family: 'monstrosity', size: 'Medium', cr: '5', base: 'werewolf',
    tags: ['werewolf', 'lycanthrope', 'wolf', 'shapechanger', 'armored', 'moon', 'curse', 'boss', '3d'] },
  { id: 'moss-troll', name: 'Moss Troll', family: 'giant', size: 'Large', cr: '6', base: 'troll',
    tags: ['troll', 'moss', 'club', 'swamp', 'forest', 'bridge', 'regenerate', 'brute', 'boss', '3d'] },
  { id: 'cinderwing-red-dragon', name: 'Cinderwing Red Dragon', family: 'dragon', size: 'Large', cr: '9', base: 'dragon-red-young',
    tags: ['dragon', 'red', 'fire', 'wings', 'wyrm', 'drake', 'cinderwing', 'boss', '3d'] },
  { id: 'crowned-lich', name: 'Crowned Lich', family: 'undead', size: 'Medium', cr: '13', base: 'necromancer',
    tags: ['lich', 'undead', 'crown', 'king', 'necromancer', 'skeleton', 'staff', 'caster', 'villain', 'boss', '3d'] },
];

/** The sheet monsters, drawn with their stand-in's art until each picture loads. `all` is every other creature. */
export function sheetCreatures(all: CreatureDef[]): CreatureDef[] {
  const byId = new Map(all.map((c) => [c.id, c]));
  return SPECS.map((s) => {
    const base = byId.get(s.base);
    return {
      id: s.id, name: s.name, family: s.family, size: s.size, cr: s.cr, tags: s.tags, c: base?.c ?? {},
      portrait: `/library/portraits/${s.id}.webp`,
      draw: (d) => base?.draw({ ...d, c: { ...base.c, ...d.c } }),
    };
  });
}

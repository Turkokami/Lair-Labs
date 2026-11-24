// Original Lair Labs monsters built from the owner's concept sheets (tokens and 3D figures in
// src/library/creatures/sheets.ts), written with the SRD 5.2 rules.
import type { Monster } from '../monsters';

const own = (x: Omit<Monster, 'source'>): Monster => ({ ...x, source: 'lair-labs' });

export const MONSTERS_SHEETS: Monster[] = [
  own({ id: 'goblinAlchemist', name: 'Goblin Alchemist', size: 'Small', kind: 'Humanoid (Goblinoid)', ac: 13, hp: 27, hpDice: '6d6+6', speed: '30 ft',
    abilities: [8, 16, 12, 15, 10, 9], cr: '1', xp: 200, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [
      { name: 'Nimble Escape', text: 'It can take the Disengage or Hide action as a bonus action.' },
      { name: 'Volatile Satchel', text: 'When it takes fire damage or a critical hit, roll a d6. On a 1 its satchel bursts: each creature within 5 ft makes a DC 12 Dex save, taking 2d6 fire damage on a failure or half on a success.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Alchemical Flask or two Dagger attacks.' },
      { name: 'Alchemical Flask', hit: 5, dmg: '1d6+3', type: 'acid', text: 'Range 20/60 ft. Roll a d4 for the brew: 1 +1d6 acid; 2 the target catches fire (1d4 fire at the start of each of its turns until it uses an action to douse it); 3 sticky goo, Speed 0 until the end of its next turn; 4 a 10-ft cloud of smoke, heavily obscured until the end of the alchemist\'s next turn.' },
      { name: 'Dagger', hit: 5, dmg: '1d4+3', type: 'piercing', text: 'Melee or thrown 20/60 ft.' },
      { name: 'Quaff (bonus action, Recharge 5-6)', dmg: '2d4+2', type: 'healing', text: 'Drinks one of its own tonics.' },
    ],
    notes: 'Original Lair Labs monster: a grinning goblin tinkerer in goggles, a patched apron and a red scarf, with a bandolier of bubbling vials. Works for whoever pays in shiny reagents.' }),

  own({ id: 'zombieButcher', name: 'Zombie Butcher', size: 'Medium', kind: 'Undead', ac: 12, hp: 52, hpDice: '8d8+16', speed: '30 ft',
    abilities: [17, 8, 15, 3, 6, 5], cr: '2', xp: 450, senses: 'Darkvision 60 ft, passive Perception 8',
    traits: [
      { name: 'Dead Flesh', text: "Immune to poison; can't be poisoned or exhausted. Understands the languages it knew in life but can't speak." },
      { name: "Won't Stay Down", text: 'When damage drops it to 0 HP, it makes a Con save (DC 5 + the damage taken). On a success it drops to 1 HP instead, unless the damage was radiant or from a critical hit.' },
      { name: 'Smell of the Shop', text: 'It has advantage on attack rolls against a creature that has fewer than half its hit points.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Cleaver attacks, or one Cleaver and one Meat Hook.' },
      { name: 'Cleaver', hit: 5, dmg: '1d8+3', type: 'slashing', text: 'A critical hit also leaves the target bleeding: 1d6 slashing at the start of each of its turns until it or an ally uses an action to bind the wound.' },
      { name: 'Meat Hook', hit: 5, dmg: '1d6+3', type: 'piercing', text: 'A Medium or smaller target is pulled 5 ft toward the butcher and grappled (escape DC 13).' },
    ],
    notes: 'Original Lair Labs monster: a village butcher who never stopped working after the plague took him. Patched leathers, a dented pauldron, a blood-red scarf and a notched cleaver.' }),

  own({ id: 'dragonbornArcher', name: 'Dragonborn Archer', size: 'Medium', kind: 'Humanoid (Dragonborn)', ac: 15, hp: 39, hpDice: '6d8+12', speed: '30 ft',
    abilities: [11, 17, 14, 10, 13, 10], cr: '2', xp: 450, senses: 'Darkvision 60 ft, passive Perception 13',
    traits: [
      { name: 'Ember Blood', text: 'Resists fire damage.' },
      { name: 'Steady Aim', text: "Long range doesn't give it disadvantage, and its ranged attacks ignore half cover." },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Longbow or two Shortsword attacks.' },
      { name: 'Longbow', hit: 5, dmg: '1d8+3', type: 'piercing', text: 'Range 150/600 ft.' },
      { name: 'Shortsword', hit: 5, dmg: '1d6+3', type: 'piercing' },
      { name: 'Fire Breath (Recharge 5-6)', dmg: '3d6', type: 'fire', save: 'DC 12 Dex', text: '15-ft cone; half on a success.' },
      { name: 'Kindled Arrow (bonus action, 2/day)', text: 'Lights its next arrow from its own breath: on a hit it deals +2d6 fire and sets flammable objects alight.' },
    ],
    notes: 'Original Lair Labs monster or NPC: a red-scaled dragonborn scout in a hooded leather jerkin and a red sash, with a long recurve bow and a full quiver. Works as a hired archer, a ranger ally or a raider.' }),

  own({ id: 'orcShaman', name: 'Orc Shaman', size: 'Medium', kind: 'Humanoid (Orc)', ac: 13, hp: 55, hpDice: '10d8+10', speed: '30 ft',
    abilities: [14, 12, 13, 11, 16, 12], cr: '3', xp: 700, senses: 'Darkvision 60 ft, passive Perception 15',
    traits: [
      { name: 'Relentless (1/day)', text: "When it drops to 0 HP but isn't killed outright, it drops to 1 HP instead." },
      { name: 'Spirit Crystal', text: 'While it holds its staff, it can cast its spells without components and its spell save DC is 13.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Crystal Staff or two Spirit Bolt attacks.' },
      { name: 'Crystal Staff', hit: 4, dmg: '1d6+2', type: 'bludgeoning', text: '+1d8 thunder.' },
      { name: 'Spirit Bolt', hit: 5, dmg: '2d8', type: 'force', text: 'Range 120 ft.' },
      { name: 'Storm Call (Recharge 5-6)', dmg: '3d8', type: 'lightning', save: 'DC 13 Dex', text: '20-ft radius sphere centred on a point within 90 ft; half on a success.' },
      { name: "Ancestors' Ward (bonus action, 3/day)", text: 'One ally it can see within 30 ft gains 2d6+3 temporary HP.' },
      { name: 'Spellcasting', text: 'Wisdom (DC 13). At will: Guidance, Thaumaturgy. 1/day each: Cure Wounds, Fog Cloud, Hold Person.' },
    ],
    notes: 'Original Lair Labs monster or NPC: a grey-braided orc elder in layered dark robes with a red sash, a satchel of charms and a gnarled staff topped with a pale crystal. Speaks for the ancestors.' }),

  own({ id: 'werewolfReaver', name: 'Werewolf Reaver', size: 'Medium', kind: 'Monstrosity (Lycanthrope)', ac: 16, hp: 104, hpDice: '16d8+32', speed: '40 ft',
    abilities: [18, 15, 15, 9, 13, 10], cr: '5', xp: 1800, senses: 'Darkvision 60 ft, passive Perception 15',
    traits: [
      { name: 'Silver-Bane Hide', text: 'Resists bludgeoning, piercing and slashing damage from attacks that are not magical and not made with silvered weapons.' },
      { name: 'Moonlit Recovery', text: 'It regains 5 HP at the start of its turn if it has at least 1 HP, unless it took radiant damage or damage from a silvered weapon since its last turn.' },
      { name: 'Pack Leader', text: 'Wolves and lycanthropes it chooses within 30 ft of it deal an extra 1d4 damage with their attacks.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Bite and two Claw attacks.' },
      { name: 'Bite', hit: 7, dmg: '2d6+4', type: 'piercing', save: 'DC 13 Con', text: 'A humanoid target is cursed with werewolf lycanthropy on a failed save.' },
      { name: 'Claw', hit: 7, dmg: '1d8+4', type: 'slashing' },
      { name: 'Howl of the Hunt (Recharge 5-6)', save: 'DC 13 Wis', text: 'Each creature of its choice within 30 ft that can hear it is frightened until the end of its next turn.' },
      { name: 'Pounce (bonus action)', save: 'DC 15 Str', text: 'If it moved at least 20 ft straight toward a creature this turn, that creature is knocked prone on a failed save.' },
    ],
    notes: 'Original Lair Labs monster: a grey werewolf warlord in hybrid form, wearing battered pauldrons, bracers and a torn red loincloth. Leads the pack rather than hunting alone.' }),

  own({ id: 'mossTroll', name: 'Moss Troll', size: 'Large', kind: 'Giant', ac: 15, hp: 115, hpDice: '10d10+60', speed: '30 ft',
    abilities: [19, 10, 22, 7, 10, 7], cr: '6', xp: 2300, senses: 'Darkvision 60 ft, passive Perception 12',
    traits: [
      { name: 'Regeneration', text: "It regains 10 HP at the start of its turn. If it takes fire or acid damage, this doesn't work at the start of its next turn. It dies only if it starts its turn at 0 HP and doesn't regenerate." },
      { name: 'Moss-Grown', text: 'It has advantage on Dexterity (Stealth) checks made to hide in forest, swamp or under bridges, where it looks like a mossy boulder.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Trunk Club attacks and one Bite.' },
      { name: 'Trunk Club', hit: 7, dmg: '2d8+4', type: 'bludgeoning', text: 'Reach 10 ft. A Large or smaller target is pushed up to 10 ft away.' },
      { name: 'Bite', hit: 7, dmg: '1d10+4', type: 'piercing' },
      { name: 'Sweeping Swing (Recharge 5-6)', dmg: '3d8+4', type: 'bludgeoning', save: 'DC 15 Dex', text: 'Each creature within 10 ft; knocked prone on a failure, half damage and not prone on a success.' },
    ],
    notes: 'Original Lair Labs monster: a hunched, tusked troll grown over with moss and lichen, in rusted plates and rope belts, dragging a club made from a whole tree trunk.' }),

  own({ id: 'cinderwingRedDragon', name: 'Cinderwing Red Dragon', size: 'Large', kind: 'Dragon (Chromatic)', ac: 18, hp: 178, hpDice: '17d10+85', speed: '40 ft, climb 40 ft, fly 80 ft',
    abilities: [23, 10, 21, 14, 11, 19], cr: '9', xp: 5000, senses: 'Blindsight 30 ft, darkvision 120 ft, passive Perception 16',
    traits: [
      { name: 'Fireborn', text: 'Immune to fire damage.' },
      { name: 'Molten Blood', text: 'While it has half its hit points or fewer, its Bite deals +2d6 fire instead of +1d6, and a creature that hits it with a melee attack while within 5 ft takes 1d6 fire damage.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Bite and two Claw attacks.' },
      { name: 'Bite', hit: 10, dmg: '2d10+6', type: 'piercing', text: 'Reach 10 ft; +1d6 fire.' },
      { name: 'Claw', hit: 10, dmg: '2d6+6', type: 'slashing' },
      { name: 'Fire Breath (Recharge 5-6)', dmg: '12d6', type: 'fire', save: 'DC 17 Dex', text: '30-ft cone; half on a success.' },
      { name: 'Wing Buffet (Recharge 5-6)', dmg: '2d6+6', type: 'bludgeoning', save: 'DC 17 Str', text: 'Each creature within 10 ft is pushed 10 ft and knocked prone on a failure (half damage only on a success). The dragon can then fly up to half its fly speed.' },
    ],
    notes: 'Original Lair Labs monster: a lean red dragon of middle years with ember-orange belly plates, swept-back horns and a spined tail. Hunts from mountain thermals and keeps a small, fiercely guarded hoard.' }),

  own({ id: 'crownedLich', name: 'Crowned Lich', size: 'Medium', kind: 'Undead (Wizard)', ac: 17, hp: 135, hpDice: '18d8+54', speed: '30 ft',
    abilities: [11, 16, 16, 20, 15, 16], cr: '13', xp: 10000, senses: 'Truesight 60 ft, passive Perception 17',
    traits: [
      { name: 'Deathless', text: 'Immune to necrotic and poison damage; resists cold and lightning. It can\'t be charmed, frightened, paralyzed or poisoned.' },
      { name: 'Crown Phylactery', text: 'If it is destroyed, it re-forms beside its crown in 1d10 days. Only destroying the crown ends it for good.' },
      { name: 'Legendary Resistance (2/day)', text: 'If it fails a saving throw, it can choose to succeed instead.' },
      { name: 'Legendary Actions (3)', text: 'Grave Lance; Withering Gaze (costs 2: one creature within 30 ft, DC 18 Wis or frightened for 1 minute); Crown\'s Command (costs 3: each undead ally within 60 ft moves up to half its speed and makes one attack).' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Grave Lance attacks, or Paralyzing Touch and two Grave Lance attacks.' },
      { name: 'Grave Lance', hit: 10, dmg: '3d8', type: 'necrotic', text: 'Range 120 ft (spell attack).' },
      { name: 'Paralyzing Touch', hit: 10, dmg: '3d6', type: 'cold', save: 'DC 18 Con', text: 'Paralyzed until the end of its next turn on a failed save.' },
      { name: 'Soulfire (Recharge 5-6)', dmg: '8d8', type: 'necrotic', save: 'DC 18 Dex', text: 'Green fire fills a 20-ft radius sphere centred on a point within 120 ft; half on a success. A creature killed by it rises as a zombie under the lich\'s command at the start of its next turn.' },
      { name: 'Spellcasting', text: 'Intelligence (DC 18). At will: Detect Magic, Mage Hand. 2/day each: Counterspell, Dimension Door, Fireball. 1/day each: Cone of Cold, Dominate Person.' },
    ],
    notes: 'Original Lair Labs monster: a skeletal sorcerer-king in layered black and crimson robes, a spiked crown and a bone mantle, carrying a tall staff that holds a green soul-crystal.' }),
];

/** Every sheet monster has its own token art under the same id (kebab case), so none is needed here. */
export const ART_SHEETS: Record<string, string> = {};

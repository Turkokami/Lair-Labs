// Original Lair Labs monsters written for the ready-made adventures (group 4), built with the SRD 5.2 rules.
import type { Monster } from '../monsters';

const CLOCKWORK_BODY = {
  name: 'Clockwork Body',
  text: "Immune to poison and psychic damage; can't be charmed, exhausted, frightened, paralyzed or poisoned. Needs no air, food, drink or sleep.",
};

export const MONSTERS_G4: Monster[] = [
  // ---------- The Toll on Sabbath Mesa ----------
  {
    id: 'elderManticore', name: 'Elder Manticore', size: 'Large', kind: 'Monstrosity', ac: 14, hp: 93, hpDice: '11d10+33', speed: '30 ft, fly 50 ft',
    abilities: [18, 16, 17, 10, 13, 14], cr: '4', xp: 1100, senses: 'Darkvision 60 ft, passive Perception 14',
    traits: [
      { name: 'Old Hunter', text: 'Has advantage on attack rolls against a creature that is prone or below half its hit point maximum.' },
      { name: 'Silver Tongue', text: 'Speaks Common and loves to talk. It will parley before a fight and bargain in one, and it keeps a bargain while it is fed.' },
      { name: 'Tail Spike Regrowth', text: 'Has 24 tail spikes. Spent spikes regrow after a long rest.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Bite and two Claws, or three Tail Spikes.' },
      { name: 'Bite', hit: 6, dmg: '1d8+4', type: 'piercing' },
      { name: 'Claw', hit: 6, dmg: '1d6+4', type: 'slashing' },
      { name: 'Tail Spike', hit: 5, dmg: '1d8+3', type: 'piercing', text: 'Range 100/200 ft.' },
      { name: 'Spike Sermon (Recharge 5-6)', dmg: '4d8', type: 'piercing', save: 'DC 13 Dex', text: 'Spends 6 spikes: each creature in a 20-ft-radius circle it can see within 100 ft takes the damage, half on a success.' },
      { name: 'Wing Lift (reaction)', text: 'When a melee attack hits it, it flies up to 20 ft away without provoking opportunity attacks.' },
    ],
    notes: 'Original Lair Labs monster: a manticore grown old, grey-bearded and clever, who would rather talk than fight and lands only on the wounded. Its face is a weathered old man\'s; its voice is a preacher\'s.',
    source: 'lair-labs',
  },

  // ---------- The Troll Bridges of Kel Morrow ----------
  {
    id: 'trollMatriarch', name: 'Troll Matriarch', size: 'Large', kind: 'Giant', ac: 15, hp: 126, hpDice: '12d10+60', speed: '30 ft',
    abilities: [20, 12, 20, 9, 14, 12], cr: '6', xp: 2300, senses: 'Darkvision 60 ft, passive Perception 15',
    traits: [
      { name: 'Regeneration', text: "Regains 10 hit points at the start of each of her turns unless she took acid or fire damage since her last turn. She dies only if she starts her turn at 0 hit points and doesn't regenerate." },
      { name: 'Keen Smell', text: 'Advantage on Wisdom (Perception) checks that rely on smell.' },
      { name: 'Mother of the Bridges', text: 'Trolls within 60 ft that can see and hear her have advantage on saves against being frightened, and obey her above anyone else.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Bite and two Claws.' },
      { name: 'Bite', hit: 8, dmg: '1d8+5', type: 'piercing' },
      { name: 'Claw', hit: 8, dmg: '2d6+5', type: 'slashing' },
      { name: "Matriarch's Call (Recharge 5-6)", text: 'Bonus action: each troll ally within 60 ft that can hear her can use its reaction to move up to half its speed and make one Claw attack.' },
      { name: "Mother's Wrath (reaction)", text: 'When a troll she can see within 30 ft drops to 0 hit points, she moves up to half her speed toward the attacker and makes one Claw attack.' },
    ],
    notes: 'Original Lair Labs monster: the old mother of a troll family, grey-green and mossy, with a nose for lies and grandchildren on every bridge. She settles quarrels first and fights second.',
    source: 'lair-labs',
  },

  // ---------- Across the Shine ----------
  {
    id: 'crystalGardener', name: 'Crystal Gardener', size: 'Large', kind: 'Construct', ac: 17, hp: 168, hpDice: '16d10+80', speed: '30 ft',
    abilities: [22, 9, 20, 3, 11, 1], cr: '10', xp: 5900, senses: 'Darkvision 120 ft, passive Perception 10',
    traits: [
      { name: 'Living Crystal', text: "Immune to poison and psychic damage; can't be charmed, exhausted, frightened, paralyzed, petrified or poisoned. Vulnerable to thunder damage." },
      { name: 'Magic Resistance', text: 'Advantage on saving throws against spells and other magical effects.' },
      { name: 'Ridden', text: 'A spirit can ride it. While one does, the Gardener speaks with the rider\'s voice and uses the rider\'s Intelligence and Wisdom for checks and saves.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Slams, or one Slam and one Shard Spray.' },
      { name: 'Slam', hit: 10, dmg: '3d8+6', type: 'bludgeoning' },
      { name: 'Shard Spray', hit: 10, dmg: '2d10+3', type: 'piercing', text: 'Range 60/120 ft.' },
      { name: 'Stilling Light (Recharge 5-6)', save: 'DC 17 Wis', text: "Its heart flares. Each creature of its choice within 15 ft that can see it is slowed for 1 minute on a failed save: half speed, no reactions, and only one attack on its turn. Repeat the save at the end of each turn." },
      { name: 'Root Grip (reaction)', text: 'When a creature within 5 ft of it moves away, it makes one Slam against that creature.' },
    ],
    notes: 'Original Lair Labs monster: a gardener of living crystal grown by a fallen star to tend its own heart. Slow, patient and immensely strong; it does whatever the voice that rides it says.',
    source: 'lair-labs',
  },
  {
    id: 'rootKeeper', name: 'Root-Keeper', size: 'Large', kind: 'Construct', ac: 17, hp: 133, hpDice: '14d10+56', speed: '30 ft',
    abilities: [18, 8, 18, 7, 10, 3], cr: '7', xp: 2900, senses: 'Blindsight 10 ft, darkvision 60 ft, passive Perception 10',
    traits: [
      { name: 'Living Crystal', text: "Immune to poison and psychic damage; can't be charmed, exhausted, frightened, paralyzed or poisoned." },
      { name: 'Seed-Bound', text: 'It obeys whoever holds the seed\'s favour. It will not attack a creature the seed\'s spirit walks beside.' },
      { name: 'Root Mending', text: 'Regains 10 hit points at the start of its turn while it stands on crystal, unless it took thunder damage since its last turn.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Fists.' },
      { name: 'Fist', hit: 7, dmg: '2d6+4', type: 'bludgeoning' },
      { name: 'Root Snare (Recharge 5-6)', dmg: '2d8', type: 'piercing', save: 'DC 15 Dex', text: 'Crystal roots burst from the floor in a 15-ft radius around it. Each other creature there takes the damage and is restrained (escape DC 15); half damage and not restrained on a success.' },
      { name: 'Crystal Ward (reaction)', text: 'When an attack hits an ally within 5 ft of it, the hit strikes the Root-Keeper instead.' },
    ],
    notes: 'Original Lair Labs monster: a tall guardian of clear crystal that grew from a star-seed\'s roots, its face a smooth blank facet. It keeps the doors of the seed\'s tower.',
    source: 'lair-labs',
  },

  // ---------- The Clockwork Spire ----------
  {
    id: 'clockworkLion', name: 'Clockwork Lion', size: 'Large', kind: 'Construct', ac: 14, hp: 30, hpDice: '4d10+8', speed: '50 ft',
    abilities: [17, 14, 15, 2, 12, 1], cr: '1', xp: 200, senses: 'Darkvision 60 ft, passive Perception 13',
    traits: [
      CLOCKWORK_BODY,
      { name: 'Wind-Down Key', text: 'A creature within 5 ft can take an action to twist its key backwards (DC 13 Dexterity (Sleight of Hand)): the lion is incapacitated until the end of its next turn.' },
    ],
    actions: [
      { name: 'Brass Bite', hit: 5, dmg: '1d10+3', type: 'piercing' },
      { name: 'Spring Pounce', hit: 5, dmg: '1d6+3', type: 'slashing', save: 'DC 13 Str', text: 'Only after it moves 20+ ft straight toward the target this turn; a bonus action after a Brass Bite. The target is knocked prone on a failed save.' },
    ],
    notes: 'Original Lair Labs monster: a life-size lion of brass plates and coiled springs, its mane a ring of tiny gears that whirr when it roars.',
    source: 'lair-labs',
  },
  {
    id: 'clockworkScorpion', name: 'Clockwork Scorpion', size: 'Large', kind: 'Construct', ac: 16, hp: 52, hpDice: '7d10+14', speed: '40 ft',
    abilities: [16, 12, 15, 1, 10, 1], cr: '3', xp: 700, senses: 'Blindsight 60 ft, passive Perception 10',
    traits: [
      CLOCKWORK_BODY,
      { name: 'Galvanic Coil', text: 'A creature that touches it or hits it with a metal melee weapon while grappled by it takes 3 (1d6) lightning damage.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Pincers and one Spark Sting.' },
      { name: 'Pincer', hit: 5, dmg: '1d8+3', type: 'bludgeoning', text: 'The target is grappled (escape DC 13). It has two pincers, each able to grapple one target.' },
      { name: 'Spark Sting', hit: 5, dmg: '1d10+3', type: 'piercing', save: 'DC 12 Con', text: '+2d8 lightning on a failed save, half on a success.' },
    ],
    notes: 'Original Lair Labs monster: a scorpion of riveted iron plates, its tail a jointed brass rod tipped with a crackling copper needle.',
    source: 'lair-labs',
  },
  {
    id: 'clockworkManticore', name: 'Clockwork Manticore', size: 'Large', kind: 'Construct', ac: 15, hp: 60, hpDice: '8d10+16', speed: '30 ft, fly 50 ft',
    abilities: [17, 14, 15, 3, 10, 1], cr: '3', xp: 700, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [
      CLOCKWORK_BODY,
      { name: 'Spring-Loaded Tail', text: 'Its tail holds 18 steel bolts. Spent bolts can be reloaded in 10 minutes.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Bite and two Claws, or three Tail Bolts.' },
      { name: 'Bite', hit: 5, dmg: '1d8+3', type: 'piercing' },
      { name: 'Claw', hit: 5, dmg: '1d6+3', type: 'slashing' },
      { name: 'Tail Bolt', hit: 4, dmg: '1d8+2', type: 'piercing', text: 'Range 100/200 ft.' },
      { name: 'Grinding Gears (reaction)', text: 'When a creature misses it with a melee attack, that creature takes 3 (1d6) slashing damage from its whirring wing-gears.' },
    ],
    notes: 'Original Lair Labs monster: a winged lion of copper and brass with a painted porcelain face and a tail of clicking steel bolts.',
    source: 'lair-labs',
  },
  {
    id: 'brassRook', name: 'Brass Rook', size: 'Medium', kind: 'Construct', ac: 14, hp: 22, hpDice: '4d8+4', speed: '10 ft, fly 80 ft',
    abilities: [14, 17, 13, 3, 14, 1], cr: '1', xp: 200, senses: 'Darkvision 60 ft, passive Perception 14',
    traits: [
      CLOCKWORK_BODY,
      { name: 'Flyby', text: "Doesn't provoke opportunity attacks when it flies out of an enemy's reach." },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Beak and one Talons.' },
      { name: 'Beak', hit: 5, dmg: '1d6+3', type: 'piercing' },
      { name: 'Talons', hit: 5, dmg: '1d6+3', type: 'slashing', save: 'DC 12 Str', text: 'If it dived 30+ ft this turn, a climbing or flying target is knocked loose on a failed save (a climber falls to the next ledge).' },
    ],
    notes: 'Original Lair Labs monster: a big black-and-brass clockwork bird with a hooked beak and a click instead of a caw. They nest on high scaffolds and guard them like crows guard a field.',
    source: 'lair-labs',
  },

  // ---------- The Rat King of Lower Wick ----------
  {
    id: 'ratKingWererat', name: 'Rat King', size: 'Medium', kind: 'Humanoid (Shapechanger)', ac: 13, hp: 45, hpDice: '10d8', speed: '30 ft (climb 30 ft in rat form)',
    abilities: [10, 16, 11, 13, 11, 16], cr: '2', xp: 450, senses: 'Darkvision 60 ft (rat and hybrid form), passive Perception 12',
    traits: [
      { name: 'Shapechanger', text: 'Bonus action: turns into a big rat, a huge rat-man hybrid, or back into a human. Its statistics are the same in each form. In rat or hybrid form it is immune to bludgeoning, piercing and slashing damage from nonmagical weapons that are not silvered.' },
      { name: 'King of the Drains', text: 'Bonus action: it squeaks and rats pour out of the walls in a 10-ft radius around a point it can see within 30 ft. That ground is difficult terrain until the start of its next turn. The rats deal no damage.' },
      { name: 'Bolt-Hole', text: 'While it has 10 hit points or fewer, it can take the Disengage or Hide action as a bonus action.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two attacks: Bite (rat or hybrid form only), Lamplighter\'s Hook or Hurl Junk, in any mix.' },
      { name: 'Bite', hit: 5, dmg: '1d6+3', type: 'piercing', save: 'DC 11 Con', text: 'A humanoid target is cursed with wererat lycanthropy on a failed save.' },
      { name: "Lamplighter's Hook", hit: 5, dmg: '1d6+3', type: 'piercing', text: 'Reach 10 ft (human or hybrid form only).' },
      { name: 'Hurl Junk', hit: 5, dmg: '1d6+3', type: 'bludgeoning', text: 'Range 30/90 ft. Pots, bottles, a boot: whatever is to hand.' },
      { name: 'Quick Duck (reaction)', text: '+2 AC against one attack it can see that would hit it.' },
    ],
    notes: 'Original Lair Labs monster: a wererat who made himself king of the sewers: a crown of bent spoons, a cloak of patchwork and a showman\'s voice. Grand and theatrical, quick to flee and never one to fight fair.',
    source: 'lair-labs',
  },

  // ---------- The Kraken's Maw ----------
  {
    id: 'drownedCommodore', name: 'Drowned Commodore', size: 'Medium', kind: 'Undead', ac: 16, hp: 150, hpDice: '20d8+60', speed: '30 ft, swim 40 ft',
    abilities: [18, 16, 17, 15, 15, 18], cr: '13', xp: 10000, senses: 'Darkvision 120 ft, passive Perception 17',
    traits: [
      { name: 'Sea-Bound', text: "Resists bludgeoning, piercing and slashing damage from nonmagical attacks; immune to cold, necrotic and poison; can't be charmed, exhausted, frightened or poisoned. Needs no air." },
      { name: 'Legendary Resistance (2/day)', text: 'If it fails a saving throw, it can choose to succeed instead.' },
      { name: 'Brine in the Lungs', text: 'Each creature of its choice that starts its turn within 10 ft of it makes a DC 17 Con save or takes 10 (3d6) cold damage and can\'t speak until the start of its next turn.' },
      { name: 'Legendary Actions (3/round)', text: 'At the end of another creature\'s turn: Step (move half its speed without provoking opportunity attacks); Cutlass (one Drowned Cutlass attack); Rally the Crew (costs 2: each undead ally within 60 ft that can hear it moves up to half its speed and makes one attack).' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Drowned Cutlass attacks, or two and one Anchor Chain.' },
      { name: 'Drowned Cutlass', hit: 9, dmg: '2d8+4', type: 'slashing', text: '+2d6 cold.' },
      { name: 'Anchor Chain', hit: 9, dmg: '2d6+4', type: 'bludgeoning', text: 'Reach 15 ft. The target is grappled (escape DC 17) and pulled up to 10 ft toward it.' },
      { name: 'Drowning Tide (Recharge 5-6)', dmg: '8d8', type: 'cold', save: 'DC 17 Str', text: 'A 30-ft cone of black seawater. On a failure, full damage, pushed 15 ft and knocked prone; half damage only on a success.' },
      { name: 'Parry (reaction)', text: '+3 AC against one melee attack that would hit it.' },
    ],
    notes: 'Original Lair Labs monster: a fleet commander drowned with his ships and held in his body by a binding older than he is. Barnacles in his beard, seawater in his voice, and his old fleet\'s colours rotting on his coat. He needs no blood, only orders.',
    source: 'lair-labs',
  },

  // ---------- Wrackstone Light ----------
  {
    id: 'drownedPirateCaptain', name: 'Drowned Captain', size: 'Medium', kind: 'Undead', ac: 14, hp: 52, hpDice: '7d8+21', speed: '30 ft, swim 30 ft',
    abilities: [15, 14, 16, 11, 13, 15], cr: '3', xp: 700, senses: 'Darkvision 60 ft, passive Perception 13',
    traits: [
      { name: 'Drowned Flesh', text: "Resists cold and necrotic damage; immune to poison; can't be exhausted or poisoned. Needs no air." },
      { name: 'Hates the Light', text: 'While in bright light, it has disadvantage on attack rolls and Wisdom (Perception) checks.' },
      { name: 'Master of the Drowned', text: 'When it is destroyed, every zombie and ghoul it raised within 1 mile drops dead at once.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Salt-Rusted Cutlass attacks, or one and one Drowning Grasp.' },
      { name: 'Salt-Rusted Cutlass', hit: 4, dmg: '1d8+2', type: 'slashing' },
      { name: 'Drowning Grasp', hit: 4, dmg: '1d6+2', type: 'bludgeoning', save: 'DC 13 Con', text: '+2d6 necrotic as seawater floods the target\'s mouth. On a failed save its hit point maximum drops by the necrotic damage until it finishes a long rest.' },
      { name: 'Hold Them Under (reaction)', text: 'When a creature within 5 ft of it falls prone, it makes one Drowning Grasp against that creature.' },
    ],
    notes: 'Original Lair Labs monster: a hanged pirate who drowned before the rope could finish him, raised by the sea. Weed in his hair, chains on his wrists and a hatred of any light that shows ships the way home.',
    source: 'lair-labs',
  },
  // ---------- Across the Shine (Quell's servants and the seed's storms) ----------
  {
    id: 'heatGhost', name: 'Heat-Ghost', size: 'Medium', kind: 'Elemental', ac: 14, hp: 97, hpDice: '15d8+30', speed: '40 ft, fly 50 ft (hover)',
    abilities: [12, 18, 14, 9, 15, 8], cr: '6', xp: 2300, senses: 'Darkvision 60 ft, passive Perception 16',
    traits: [
      { name: 'Shimmer', text: 'While it is in bright light it is invisible. In dim light or darkness it shows as a ripple in the air, like heat over a road.' },
      { name: 'Searing Body', text: "Resists bludgeoning, piercing and slashing damage from nonmagical attacks; immune to fire and poison; can't be exhausted, grappled, poisoned or knocked prone. Vulnerable to cold: a creature doused with water or touched by cold shows its outline until the end of its next turn." },
      { name: 'Named Quarry', text: 'Its master can name one creature it has seen. The heat-ghost always knows the direction and distance to that creature while both are on the same plane.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Burning Touch attacks.' },
      { name: 'Burning Touch', hit: 7, dmg: '2d8+4', type: 'fire' },
      { name: 'Heat Haze (Recharge 5-6)', dmg: '4d8', type: 'fire', save: 'DC 14 Con', text: 'The air around it boils. Each creature within 10 ft takes the damage and can\'t take reactions until the start of its next turn on a failed save; half damage only on a success.' },
      { name: 'Mirage Step (reaction)', text: 'When an attack hits it, it vanishes and reappears in an unoccupied space in bright light that it can see within 15 ft, after taking the damage.' },
    ],
    notes: 'Original Lair Labs monster: a hunter made of desert heat-shimmer, bound to a dead marshal\'s will. You see it only as a wobble in the air and a smell of scorched glass, and you feel it when it touches you.',
    source: 'lair-labs',
  },
  {
    id: 'shardStorm', name: 'Shard Storm', size: 'Large', kind: 'Elemental', ac: 15, hp: 90, hpDice: '12d10+24', speed: '0 ft, fly 90 ft (hover)',
    abilities: [14, 20, 14, 6, 10, 6], cr: '5', xp: 1800, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [
      { name: 'Glass Wind', text: "Resists bludgeoning, piercing and slashing damage from nonmagical attacks; immune to poison; can't be exhausted, grappled, paralyzed, poisoned, knocked prone or restrained. It can move through a space as narrow as 1 inch." },
      { name: 'Seed-Bound', text: 'It ignores any creature carrying a crystal from the seed\'s basin or walking with the seed\'s spirit, unless that creature attacks it.' },
      { name: 'Thunder-Brittle', text: 'If it takes thunder damage, it can\'t use Shard Cyclone until the end of its next turn.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Glass Lash attacks.' },
      { name: 'Glass Lash', hit: 8, dmg: '2d8+5', type: 'slashing' },
      { name: 'Shard Cyclone (Recharge 4-6)', dmg: '3d8+2', type: 'slashing', save: 'DC 15 Dex', text: 'Each creature in its space or within 5 ft of it takes the damage and is pushed 15 ft away and knocked prone on a failed save; half damage only on a success.' },
      { name: 'Scatter (reaction)', text: 'When a melee attack hits it, it bursts into loose splinters: it takes half damage and moves up to 10 ft without provoking opportunity attacks.' },
    ],
    notes: 'Original Lair Labs monster: a whirling column of glass splinters raised by a fallen star to guard its crater, singing like a wind through broken windows. The seed\'s antibodies.',
    source: 'lair-labs',
  },
];

/** Token art for each new stat block: monster id -> an existing creature id from src/library/creatures. */
export const ART_G4: Record<string, string> = {
  elderManticore: 'manticore',
  trollMatriarch: 'troll',
  crystalGardener: 'stoneGolem',
  rootKeeper: 'shieldGuardian',
  clockworkLion: 'lion',
  clockworkScorpion: 'giant-scorpion',
  clockworkManticore: 'manticore',
  brassRook: 'giant-eagle',
  ratKingWererat: 'wererat',
  drownedCommodore: 'wight',
  drownedPirateCaptain: 'wight',
  heatGhost: 'invisibleStalker',
  shardStorm: 'airElemental',
};

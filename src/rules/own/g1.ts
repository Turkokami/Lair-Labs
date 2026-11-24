// Original Lair Labs monsters written for the ready-made adventures (group 1), built with the SRD 5.2 rules.
import type { Monster } from '../monsters';

export const MONSTERS_G1: Monster[] = [
  // ---------- CR 0 ----------
  { id: 'snapdragonShrub', name: 'Snapdragon Shrub', size: 'Small', kind: 'Plant', ac: 10, hp: 10, hpDice: '3d6', speed: '10 ft', abilities: [6, 10, 11, 1, 10, 4], cr: '0', xp: 10, senses: 'Blindsight 30 ft, passive Perception 10',
    traits: [
      { name: 'False Appearance', text: 'While it stays still it looks like an ordinary pot of snapdragons.' },
      { name: 'Fire Shy', text: 'Vulnerable to fire. It will not snap at anyone holding an open flame.' },
      { name: 'Called Off', text: 'It stops at once if a creature that tends its garden (such as a sprite) tells it to.' },
    ],
    actions: [
      { name: 'Snap', hit: 2, dmg: '1d4', type: 'piercing', text: 'Reach 5 ft. It goes for ankles.' },
    ],
    notes: 'Original Lair Labs monster: a greenhouse snapdragon woken by stray magic. Its flower heads snap like little jaws, and it shuffles along in its pot when nobody is looking.',
    source: 'lair-labs' },
  { id: 'hagStrawServant', name: 'Hag-Stuffed Scarecrow', size: 'Medium', kind: 'Construct', ac: 10, hp: 10, hpDice: '3d8-3', speed: '20 ft', abilities: [11, 10, 8, 1, 8, 1], cr: '0', xp: 10, senses: 'Blindsight 30 ft, passive Perception 9',
    traits: [
      { name: 'Straw Body', text: 'Vulnerable to fire. Immune to poison; can\'t be charmed, frightened or poisoned.' },
      { name: 'False Appearance', text: 'While it stays still on its pole it looks like an ordinary scarecrow.' },
      { name: 'Witch-Knot Bound', text: 'It walks only while the witch-knot that binds it is whole. When that knot burns, it drops where it stands.' },
    ],
    actions: [
      { name: 'Straw Grasp', hit: 2, dmg: '1d4', type: 'bludgeoning', text: 'A Medium or smaller target is grappled (escape DC 10). It drags a grappled creature at half speed.' },
    ],
    notes: 'Original Lair Labs monster: a straw man stuffed with a hag\'s stolen harvest, with rats nesting in its belly. The small ones she keeps by her hearth are called straw children.',
    source: 'lair-labs' },
  { id: 'appleChangeling', name: 'Apple Changeling', size: 'Small', kind: 'Fey', ac: 10, hp: 9, hpDice: '2d6+2', speed: '30 ft', abilities: [8, 10, 12, 6, 8, 11], cr: '0', xp: 10, senses: 'Passive Perception 9',
    traits: [
      { name: 'Hag-Grown', text: 'Vulnerable to fire. It obeys the hag who grew it while she is within 1 mile, unless the bones at its heart are laid to rest; then it is its own.' },
      { name: 'Echo', text: 'It repeats the last thing a grown-up said, a moment too late.' },
    ],
    actions: [
      { name: 'Cold Hands', hit: 2, dmg: '1d2', type: 'bludgeoning', text: 'It only does this if its maker orders it.' },
      { name: 'Shield the Mother (reaction)', text: 'When a creature within 5 ft of it attacks its maker, it steps into the way and becomes the target instead.' },
    ],
    notes: 'Original Lair Labs monster: a child grown by a hag from apple flesh, pond water and a drowned child\'s bones. It has some of the child\'s memories and none of the child\'s warmth.',
    source: 'lair-labs' },

  // ---------- CR 1/8 ----------
  { id: 'chalkPointer', name: 'Chalk Pointer', size: 'Tiny', kind: 'Construct', ac: 14, hp: 7, hpDice: '3d4', speed: '0 ft, fly 40 ft (hover)', abilities: [6, 16, 10, 1, 5, 1], cr: '1/8', xp: 25, senses: 'Blindsight 60 ft, passive Perception 7',
    traits: [
      { name: 'Constructed Nature', text: 'Immune to poison and psychic damage; can\'t be charmed, frightened, poisoned or exhausted.' },
      { name: 'Conjured', text: 'It crumbles to chalk dust when it drops to 0 hit points, when its conjurer is knocked out or gives up, or when the summoning circle that fuels it closes.' },
    ],
    actions: [
      { name: 'Rap Knuckles', hit: 4, dmg: '1d4+2', type: 'bludgeoning' },
    ],
    notes: 'Original Lair Labs monster: a long wooden classroom pointer, tipped with chalk, that a tutor has conjured to fly about and rap knuckles.',
    source: 'lair-labs' },

  // ---------- CR 1/4 ----------
  { id: 'runawayBroom', name: 'Runaway Broom', size: 'Small', kind: 'Construct', ac: 13, hp: 14, hpDice: '4d6', speed: '0 ft, fly 50 ft (hover)', abilities: [12, 15, 10, 1, 5, 1], cr: '1/4', xp: 50, senses: 'Blindsight 60 ft, passive Perception 7',
    traits: [
      { name: 'Constructed Nature', text: 'Immune to poison and psychic damage; can\'t be charmed, frightened, poisoned or exhausted.' },
      { name: 'False Appearance', text: 'While it lies still it looks like an ordinary broom.' },
      { name: 'Tidy-Minded', text: 'A creature that orders it to rest in a teacher\'s voice (DC 12 Intimidation or Deception, as an action) makes it settle for 1 minute. It dives at any heap of dust or leaves it sees, ignoring everything else for a round.' },
    ],
    actions: [
      { name: 'Bristle Whack', hit: 4, dmg: '1d6+2', type: 'bludgeoning' },
      { name: 'Sweep Aside', save: 'DC 12 Dex', text: 'One creature within 5 ft is swept 10 ft in a direction the broom chooses and knocked prone on a failed save.' },
    ],
    notes: 'Original Lair Labs monster: a school broom woken by a wave of wild magic. It wants everything swept into a neat pile, including people.',
    source: 'lair-labs' },
  { id: 'flappingBookFlock', name: 'Flock of Flapping Books', size: 'Medium', kind: 'Construct (Swarm)', ac: 12, hp: 22, hpDice: '5d8', speed: '5 ft, fly 30 ft', abilities: [5, 15, 10, 2, 12, 4], cr: '1/4', xp: 50, senses: 'Blindsight 30 ft, passive Perception 11',
    traits: [
      { name: 'Swarm', text: 'It can occupy another creature\'s space and move through openings large enough for a book. It can\'t regain hit points or gain temporary hit points. Resists bludgeoning, piercing and slashing.' },
      { name: 'Hush', text: 'If three or more creatures within 30 ft shout "SHHH!" together (DC 12 group Charisma check), every flock that hears settles on the shelves for 10 minutes.' },
      { name: 'Afraid of Flame', text: 'It won\'t willingly move within 10 ft of an open flame.' },
    ],
    actions: [
      { name: 'Papercuts', hit: 4, dmg: '2d4', type: 'slashing', text: 'Reach 0 ft (a creature in its space). Only 1d4 if the flock has half its hit points or fewer.' },
    ],
    notes: 'Original Lair Labs monster: a rustling flock of library books that have learned to fly and do not like being opened. They snap at ears and swoop in the dark like starlings.',
    source: 'lair-labs' },
  { id: 'homeworkBlob', name: 'Lumpy Homework', size: 'Small', kind: 'Ooze', ac: 9, hp: 22, hpDice: '4d6+8', speed: '20 ft, climb 10 ft', abilities: [12, 8, 14, 3, 6, 5], cr: '1/4', xp: 50, senses: 'Blindsight 30 ft (blind beyond), passive Perception 8',
    traits: [
      { name: 'Amorphous', text: 'It can squeeze through a space as narrow as 1 inch.' },
      { name: 'Wants a Grade', text: 'A creature that marks it higher than a C (DC 11 Deception or Persuasion, as an action) makes it glow with pride and slop back into its cauldron. A failing grade makes it attack.' },
    ],
    actions: [
      { name: 'Splat', hit: 3, dmg: '1d6+1', type: 'bludgeoning', text: 'The target is grappled (escape DC 11) by the sticky mess.' },
      { name: 'Lob Glop (Recharge 6)', save: 'DC 11 Dex', text: 'One creature within 20 ft is restrained by a gob of glue-thick potion until the end of its next turn on a failed save.' },
    ],
    notes: 'Original Lair Labs monster: a failed potion assignment that climbed out of its cauldron. Lumpy, brown or grey, smells of burnt toffee, and desperate to be marked.',
    source: 'lair-labs' },
  { id: 'homeworkSteamCloud', name: 'Cross Steam Cloud', size: 'Small', kind: 'Elemental', ac: 12, hp: 13, hpDice: '3d6+3', speed: '0 ft, fly 30 ft (hover)', abilities: [5, 14, 12, 4, 8, 9], cr: '1/4', xp: 50, senses: 'Darkvision 60 ft, passive Perception 9',
    traits: [
      { name: 'Cloud Body', text: 'Immune to fire and poison; can\'t be grappled, poisoned or knocked prone. It can pass through a gap 1 inch wide.' },
      { name: 'Bad Temper', text: 'A creature that marks it higher than a C (DC 11 Deception or Persuasion, as an action) calms it and it drifts back into its cauldron. Anything less, and it boils over.' },
    ],
    actions: [
      { name: 'Scald', hit: 4, dmg: '1d4+2', type: 'fire' },
      { name: 'Hiss of Steam (Recharge 6)', dmg: '2d6', type: 'fire', save: 'DC 11 Con', text: '15-ft cone; half on a success.' },
    ],
    notes: 'Original Lair Labs monster: a puff of steam from a failed potion that boiled away in a very bad mood. It huffs, it whistles, and it argues about whose turn it is.',
    source: 'lair-labs' },

  // ---------- CR 1/2 ----------
  { id: 'chalkTutor', name: 'Scheming Tutor', size: 'Medium', kind: 'Humanoid (Wizard)', ac: 12, hp: 27, hpDice: '6d8', speed: '30 ft', abilities: [9, 14, 10, 15, 12, 13], cr: '1/2', xp: 100, senses: 'Passive Perception 11',
    traits: [
      { name: 'Chalk Conjurer', text: 'Chalk pointers he conjures obey his spoken orders and crumble when he is knocked out or gives up.' },
      { name: '"Oh, Very Well."', text: 'He is no hero. At half his hit points or fewer he gives up, unless he still has a clear way to run.' },
    ],
    actions: [
      { name: 'Conducting Baton', hit: 4, dmg: '1d6+2', type: 'piercing', text: 'A thin, stiff baton used like a rapier.' },
      { name: 'Chalk Bolt', hit: 4, dmg: '1d10', type: 'force', text: 'Spell attack, range 60 ft. A streak of violet chalk.' },
      { name: 'Detention (Recharge 5-6)', save: 'DC 12 Wis', text: 'One creature within 30 ft that can hear him ("Stand in the corner!") can\'t move until the end of its next turn on a failed save.' },
      { name: 'Ruler Parry (reaction)', text: '+2 AC against one melee attack that would hit him.' },
    ],
    notes: 'Original Lair Labs monster: a polite, bitter school tutor who knows just enough magic to cause a great deal of trouble. Grey robe, violet chalk on his fingertips, a baton in his hand.',
    source: 'lair-labs' },

  // ---------- CR 2 ----------
  { id: 'tidepoolEelMother', name: 'Tidepool Eel-Mother', size: 'Large', kind: 'Beast', ac: 13, hp: 52, hpDice: '7d10+14', speed: '5 ft, swim 40 ft', abilities: [17, 14, 15, 2, 12, 5], cr: '2', xp: 450, senses: 'Darkvision 60 ft, passive Perception 11',
    traits: [
      { name: 'Water Breathing', text: 'It breathes only water. Out of water it can last an hour, but its speed is 5 ft.' },
      { name: 'Slick Hide', text: 'Advantage on checks and saves to escape a grapple or restraint.' },
      { name: 'Lurker in the Deep Pool', text: 'While it lies coiled in deep water it is hidden. It has advantage on the first attack it makes in a fight.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Bite and one Coil.' },
      { name: 'Bite', hit: 5, dmg: '2d6+3', type: 'piercing' },
      { name: 'Coil', hit: 5, dmg: '1d8+3', type: 'bludgeoning', text: 'A Medium or smaller target is grappled (escape DC 13) and restrained until the grapple ends. It can coil only one creature at a time.' },
      { name: 'Drag Under', text: 'It swims up to half its speed with the creature it is coiling. A dragged creature underwater can\'t breathe until it escapes.' },
    ],
    notes: 'Original Lair Labs monster: a grey eel as long as a rowing boat that has lived in the same tide pool for longer than anyone can remember. She hoards bright things and eats anything that wades in after them.',
    source: 'lair-labs' },
  { id: 'crookbackRootKnot', name: 'Root-Knot Guardian', size: 'Large', kind: 'Plant', ac: 13, hp: 59, hpDice: '7d10+21', speed: '10 ft', abilities: [18, 8, 16, 5, 10, 5], cr: '2', xp: 450, senses: 'Tremorsense 30 ft, passive Perception 10',
    traits: [
      { name: 'Living Wood', text: 'Vulnerable to fire. Resists bludgeoning and piercing.' },
      { name: 'False Appearance', text: 'While it stays still it looks like a curtain of hanging roots.' },
      { name: 'Rooted to Its Tree', text: 'It never moves more than 30 ft from the tree it grows from. If that tree is soothed (a wassail of cider poured on its roots), it falls asleep and does not wake for the fight.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Root Lash attacks.' },
      { name: 'Root Lash', hit: 6, dmg: '1d10+4', type: 'bludgeoning', text: 'Reach 10 ft. A Medium or smaller target is grappled (escape DC 14) and restrained until the grapple ends. It can hold two creatures at once.' },
      { name: 'Wind Tight (reaction)', text: 'When a creature it is holding tries to escape and fails, that creature takes 1d6 bludgeoning damage.' },
    ],
    notes: 'Original Lair Labs monster: a knot of living roots from a hag\'s great tree, as thick as a man\'s body. It guards her larder and her hollow like a hound guards a door.',
    source: 'lair-labs' },

  // ---------- CR 3 ----------
  { id: 'ankhegBroodmother', name: 'Ankheg Broodmother', size: 'Huge', kind: 'Monstrosity', ac: 14, hp: 66, hpDice: '7d12+21', speed: '30 ft, burrow 10 ft', abilities: [19, 9, 16, 1, 13, 6], cr: '3', xp: 700, senses: 'Darkvision 60 ft, tremorsense 60 ft, passive Perception 11',
    traits: [
      { name: 'Brood Guardian', text: 'She never leaves her brood chamber and fights to the death while her egg mound stands.' },
      { name: 'Fear of Fire', text: 'She won\'t willingly move onto burning ground, and after she takes fire damage she can\'t take reactions until the end of her next turn.' },
      { name: 'Flooded Out', text: 'If her chamber is flooded (knee-deep water), her speed is halved and she starts the fight with 15 damage.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Bite and one Leg Sweep.' },
      { name: 'Bite', hit: 6, dmg: '2d6+4', type: 'slashing', text: '+1d6 acid. A Large or smaller target is grappled (escape DC 14).' },
      { name: 'Leg Sweep', hit: 6, dmg: '1d6+4', type: 'bludgeoning', save: 'DC 14 Str', text: 'Reach 10 ft. Knocked prone on a failed save.' },
      { name: 'Acid Spray (Recharge 5-6)', dmg: '4d6', type: 'acid', save: 'DC 13 Dex', text: '30-ft line, 5 ft wide; half on a success. She can\'t use this while grappling.' },
      { name: 'Brood Fury (reaction)', text: 'When a creature she can sense damages one of her eggs, she moves up to half her speed toward it without provoking opportunity attacks.' },
    ],
    notes: 'Original Lair Labs monster: a laying ankheg queen swollen to the size of a hay wagon, her shell scarred white with old acid burns. Her clicking stops just before she strikes.',
    source: 'lair-labs' },
  { id: 'highKindler', name: 'High Kindler', size: 'Medium', kind: 'Humanoid (Cultist)', ac: 13, hp: 49, hpDice: '11d8', speed: '30 ft', abilities: [10, 14, 11, 13, 16, 15], cr: '3', xp: 700, senses: 'Passive Perception 13',
    traits: [
      { name: 'Fire-Scarred', text: 'Resists fire.' },
      { name: 'Waking Chant', text: 'While a rite is under way she spends her turn chanting instead of attacking, unless a creature attacked her in melee since her last turn.' },
      { name: 'Grief Behind the Fire', text: 'A creature that has spent a round truly listening to her can try to reach her (DC 16 Persuasion, as an action). On a success she falters and stops the rite.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Kindling Bolts, or one Ember Touch and one Kindling Bolt.' },
      { name: 'Kindling Bolt', hit: 5, dmg: '2d8', type: 'fire', text: 'Spell attack, range 120 ft.' },
      { name: 'Ember Touch', hit: 5, dmg: '1d6+2', type: 'bludgeoning', text: '+2d6 fire. Her burned hands glow like coals.' },
      { name: 'Ash Wreath (Recharge 5-6)', dmg: '4d6', type: 'fire', save: 'DC 13 Dex', text: 'Fire bursts out of her in a 10-ft radius; half on a success.' },
      { name: 'Burning Ward (reaction)', text: 'When a creature within 5 ft hits her with a melee attack, it takes 2d4 fire damage.' },
    ],
    notes: 'Original Lair Labs monster: the high priest of a fire cult, burned by her own faith and proud of the scars. She speaks to the fire as to a mother and believes it will save the world from the cold.',
    source: 'lair-labs' },

  // ---------- CR 6 ----------
  { id: 'tideQueenCorsair', name: 'Tide Queen', size: 'Medium', kind: 'Humanoid', ac: 16, hp: 97, hpDice: '15d8+30', speed: '30 ft, swim 30 ft', abilities: [14, 16, 14, 12, 13, 17], cr: '6', xp: 2300, senses: 'Passive Perception 14',
    traits: [
      { name: 'Sea Legs', text: 'Pitching decks and shallow water are not difficult ground for her, and she has advantage on saves against being knocked prone.' },
      { name: 'Tide Shard', text: 'Resists cold and lightning. Outside a fight, within a mile of the sea she can raise waves, call sharks or bind a water elemental to serve her.' },
      { name: 'A Bargainer at Heart', text: 'At half her hit points or fewer she will hear terms, and a fair written bargain is worth more to her than winning.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Cutlass attacks, or two Cutlass attacks and one Storm Bolt.' },
      { name: 'Cutlass', hit: 6, dmg: '1d6+3', type: 'slashing', text: '+1d6 cold.' },
      { name: 'Storm Bolt', hit: 6, dmg: '3d8', type: 'lightning', text: 'Spell attack, range 120 ft.' },
      { name: 'Breaker Wave (Recharge 5-6)', dmg: '6d8', type: 'bludgeoning', save: 'DC 14 Str', text: '30-ft line, 10 ft wide. On a failed save a creature is pushed 15 ft and knocked prone; half damage and no push on a success.' },
      { name: 'Riposte (reaction)', text: '+3 AC against one melee attack that would hit her; if it then misses, she makes one Cutlass attack against the attacker.' },
    ],
    notes: 'Original Lair Labs monster: a pirate queen of the islands with a sea-shard set in her cutlass hilt. Salt-white braids, a captain\'s coat over mail, and the sea itself answering when she calls.',
    source: 'lair-labs' },

  // ---------- CR 7 ----------
  { id: 'shardCrownedOgreKing', name: 'Shard-Crowned Ogre King', size: 'Large', kind: 'Giant', ac: 15, hp: 126, hpDice: '12d10+60', speed: '40 ft', abilities: [21, 8, 20, 14, 10, 15], cr: '7', xp: 2900, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [
      { name: 'Granite Shard', text: 'He regains 10 hit points at the start of each of his turns if he has at least 1. A creature next to him can pry the shard from his crown (an action, DC 16 Athletics or Sleight of Hand); then he stops regenerating and loses Kneel! and Stone Step.' },
      { name: 'Shard-Clever', text: 'Advantage on Intelligence, Wisdom and Charisma saves.' },
      { name: 'Lonely Underneath', text: 'A creature that kneels to him and offers him a true title (DC 15 Persuasion, as an action) makes him stop fighting to listen until the end of his next turn.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Greatclub attacks, or one Hurl Boulder.' },
      { name: 'Greatclub', hit: 8, dmg: '3d8+5', type: 'bludgeoning' },
      { name: 'Hurl Boulder', hit: 8, dmg: '3d10+5', type: 'bludgeoning', text: 'Range 60/240 ft.' },
      { name: 'Kneel! (Recharge 5-6)', save: 'DC 16 Wis', text: 'Each creature within 30 ft that can hear him falls prone and can\'t stand up until the end of its next turn on a failed save.' },
      { name: 'Stone Step (bonus action, Recharge 5-6)', text: 'He sinks into bare rock and steps out of other bare rock he can see within 30 ft.' },
    ],
    notes: 'Original Lair Labs monster: an ogre made clever and grand by a glowing stone shard set in his crown of beaten cooking pots. He loves long words and longs, more than anything, to be respected.',
    source: 'lair-labs' },

  // ---------- CR 10 ----------
  { id: 'dwarvenWarGolem', name: 'Dwarven War Golem', size: 'Huge', kind: 'Construct', ac: 18, hp: 178, hpDice: '17d12+68', speed: '30 ft', abilities: [24, 9, 19, 6, 11, 1], cr: '10', xp: 5900, senses: 'Darkvision 120 ft, passive Perception 10',
    traits: [
      { name: 'Constructed Nature', text: 'Immune to fire, poison and psychic damage; can\'t be charmed, exhausted, frightened, paralyzed, petrified or poisoned. Advantage on saves against spells.' },
      { name: 'Shutdown Word', text: 'A creature clinging to it (DC 16 Athletics or Acrobatics to climb on) can pry open its chest plate (an action, DC 15 Strength) and then speak its shutdown word (another action). The golem sets down its weapons and sleeps.' },
      { name: 'Fed by the Forge', text: 'If its forge\'s bellows are stopped, its speed is halved and Furnace Breath does not recharge.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Forge Hammer attacks.' },
      { name: 'Forge Hammer', hit: 11, dmg: '3d10+7', type: 'bludgeoning', text: 'Reach 10 ft.' },
      { name: 'Furnace Breath (Recharge 5-6)', dmg: '10d8', type: 'fire', save: 'DC 16 Dex', text: '30-ft cone of forge fire from the grille in its chest; half on a success.' },
      { name: 'Shake Off (reaction)', save: 'DC 16 Str', text: 'When a creature climbs onto it, that creature is thrown 10 ft and lands prone on a failed save.' },
    ],
    notes: 'Original Lair Labs monster: a war machine of iron and granite, eighteen feet tall, built by dwarf smiths for a war long over. It speaks in a voice like a hammer on an anvil and believes it is always the eve of battle.',
    source: 'lair-labs' },
];

/** Token art for each new stat block: monster id -> an existing creature id from src/library/creatures. */
export const ART_G1: Record<string, string> = {
  snapdragonShrub: 'awakenedShrub',
  hagStrawServant: 'scarecrow',
  appleChangeling: 'child',
  chalkPointer: 'flyingSword',
  runawayBroom: 'flyingSword',
  flappingBookFlock: 'bat',
  homeworkBlob: 'mudMephit',
  homeworkSteamCloud: 'steamMephit',
  chalkTutor: 'court-wizard',
  tidepoolEelMother: 'giant-constrictor-snake',
  crookbackRootKnot: 'awakenedTree',
  ankhegBroodmother: 'ankheg',
  highKindler: 'fire-mage',
  tideQueenCorsair: 'ship-captain',
  shardCrownedOgreKing: 'ogre',
  dwarvenWarGolem: 'stoneGolem',
};

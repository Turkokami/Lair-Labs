// Original Lair Labs monsters written for the ready-made adventures (group 3), built with the SRD 5.2 rules.
import type { Monster } from '../monsters';

const MACHINE_BODY = {
  name: 'Machine Body',
  text: "Immune to poison and psychic damage; can't be charmed, exhausted, frightened, paralyzed or poisoned. Needs no air, food, drink or sleep.",
};

export const MONSTERS_G3: Monster[] = [
  // ---------- The Kneeling Fortress ----------
  {
    id: 'clockworkTrooper', name: 'Clockwork Trooper', size: 'Medium', kind: 'Construct', ac: 17, hp: 52, hpDice: '8d8+16', speed: '30 ft',
    abilities: [16, 14, 15, 3, 10, 1], cr: '3', xp: 700, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [
      MACHINE_BODY,
      { name: 'Standing Order', text: 'It ignores any creature wearing its own nation\'s badge (the Brazen sun or the Compact gear) unless that creature attacks it or one of its line.' },
      { name: 'Shoulder to Shoulder', text: 'While another clockwork trooper is within 5 ft of it, it has +2 AC (19).' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Bayonet attacks, or one Bayonet and one Rivet Carbine.' },
      { name: 'Bayonet', hit: 5, dmg: '1d10+3', type: 'piercing', text: 'Reach 5 ft.' },
      { name: 'Rivet Carbine', hit: 4, dmg: '1d10+2', type: 'piercing', text: 'Range 80/320 ft. The rivet is red-hot: +1d4 fire.' },
      { name: 'Close the Line (reaction)', text: 'When another clockwork trooper within 10 ft of it drops to 0 hit points, it moves up to 15 ft into that trooper\'s place without provoking opportunity attacks and makes one Bayonet attack.' },
    ],
    notes: 'Original Lair Labs monster: a soldier of riveted plate and clockwork, wound by an Order-Engine three hundred years ago and still holding the line. The Brazen troopers are bronze with a sun stamped on the breastplate; the Compact\'s are iron-grey with a gear. None of them has a face.',
    source: 'lair-labs',
  },
  {
    id: 'kneeGateWarden', name: 'Knee-Gate Warden', size: 'Large', kind: 'Construct', ac: 18, hp: 142, hpDice: '15d10+60', speed: '30 ft',
    abilities: [22, 9, 18, 3, 11, 1], cr: '9', xp: 5000, senses: 'Darkvision 120 ft, passive Perception 10',
    traits: [
      MACHINE_BODY,
      { name: 'Oath-Bound', text: 'It never attacks a creature that holds up an Order-Key (Sun or Gear), and stands aside to let that creature and its companions pass.' },
      { name: 'Hold the Gate', text: 'The ground within 10 ft of the warden is difficult terrain for its enemies: its halberd sweeps low and its feet are planted like gateposts.' },
      { name: 'Magic Resistance', text: 'Advantage on saving throws against spells and other magical effects.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Halberd attacks.' },
      { name: 'Halberd', hit: 10, dmg: '2d10+6', type: 'slashing', text: 'Reach 10 ft.' },
      { name: 'Sun-and-Gear Toll (Recharge 5-6)', save: 'DC 16 Con', dmg: '6d10', type: 'thunder', text: 'It strikes its chest-bell. Each creature in a 30-ft cone takes the damage and is pushed 15 ft away and knocked prone on a failed save; half damage only on a success.' },
      { name: 'Bar the Way (reaction)', text: 'When a creature within 10 ft of it moves, or attacks the other warden, it makes one Halberd attack against that creature. On a hit the creature\'s speed becomes 0 until the end of the turn.' },
    ],
    notes: 'Original Lair Labs monster: one of the two iron knights who keep the Oathmother\'s knee, twelve feet tall, with a sun on one pauldron and a gear on the other and a bell where a heart should be. They were built to admit both nations, and they still do, if you carry a key.',
    source: 'lair-labs',
  },
  {
    id: 'gravemaker', name: 'Gravemaker', size: 'Gargantuan', kind: 'Construct', ac: 20, hp: 290, hpDice: '20d20+80', speed: '40 ft',
    abilities: [26, 8, 19, 3, 10, 1], cr: '17', xp: 18000, senses: 'Darkvision 120 ft, Tremorsense 60 ft, passive Perception 10',
    traits: [
      { name: 'Machine Body', text: "Immune to fire, poison and psychic damage; can't be charmed, exhausted, frightened, paralyzed or poisoned. Needs no air, food, drink or sleep." },
      { name: 'Siege Engine', text: 'Deals double damage to objects and structures.' },
      { name: 'Gear Badge', text: 'It ignores any creature wearing a Compact gear badge unless that creature damages it. Ilka Vrell can order it to stand down with a word.' },
      { name: 'Four Legs', text: 'It can\'t be knocked prone, and it ignores difficult terrain made by mud, wire and craters.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Stamp attacks and one Siege Gun.' },
      { name: 'Stamp', hit: 14, dmg: '3d12+8', type: 'bludgeoning', save: 'DC 22 Str', text: 'Reach 10 ft. A Large or smaller target is knocked prone on a failed save.' },
      { name: 'Siege Gun', save: 'DC 18 Dex', dmg: '10d10', type: 'thunder', text: 'It fires a shell at a point it can see within 600 ft. Each creature in a 20-ft-radius sphere there takes the damage on a failed save, half on a success; the ground there becomes a crater (15 ft deep).' },
      { name: 'Burning Gas (Recharge 5-6)', save: 'DC 18 Con', dmg: '16d8', type: 'fire', text: 'The gun vents a 60-ft cone of burning gas. Damage on a failed save, half on a success.' },
      { name: 'Steam Howl (reaction)', save: 'DC 18 Con', dmg: '3d6', type: 'fire', text: 'When a creature hits it with a melee attack, scalding steam blasts from its joints: each creature within 10 ft takes the damage on a failed save.' },
    ],
    notes: 'Original Lair Labs monster: the Iron Compact\'s juggernaut, number VII, a walking siege-gun of black iron on four legs. Ilka Vrell built it and named it. It has walked no-man\'s land for three hundred years, firing on anything that moves.',
    source: 'lair-labs',
  },
  {
    id: 'quickironBorer', name: 'Quickiron Borer', size: 'Gargantuan', kind: 'Monstrosity', ac: 18, hp: 247, hpDice: '15d20+90', speed: '50 ft, burrow 40 ft',
    abilities: [28, 7, 22, 1, 8, 4], cr: '15', xp: 13000, senses: 'Blindsight 30 ft, Tremorsense 60 ft, passive Perception 9',
    traits: [
      { name: 'Metal Hide', text: 'Its hide is studded with the metal it has eaten. Resistance to bludgeoning, piercing and slashing damage from weapons made of metal that aren\'t magical.' },
      { name: 'Glass Bore', text: 'It burrows through solid rock at half speed and leaves a round, glassy tunnel 10 ft wide behind it.' },
      { name: 'Footstep Hunger', text: 'It knows the location of any creature that moves on the ground within 300 ft, and comes up beneath the loudest.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Grinding Maw and two Rasp Tail attacks.' },
      { name: 'Grinding Maw', hit: 14, dmg: '4d10+9', type: 'piercing', save: 'DC 19 Dex', text: 'Reach 10 ft. A Large or smaller target fails a Dex save or is swallowed: blinded and restrained, total cover, and 6d6 acid damage at the start of each of the borer\'s turns. Metal armour and weapons swallowed with it are eaten (+1 penalty each round they stay inside). If the borer takes 30 damage in one turn from inside, it spits out everything swallowed.' },
      { name: 'Rasp Tail', hit: 14, dmg: '3d8+9', type: 'slashing', text: 'Reach 15 ft.' },
      { name: 'Quickiron Spit (Recharge 5-6)', save: 'DC 19 Dex', dmg: '12d10', type: 'fire', text: 'A 60-ft line, 10 ft wide, of molten quickiron. Damage on a failed save, half on a success. A creature that fails by 5 or more is restrained as the metal cools (DC 19 Str check to break free).' },
      { name: 'Sink (reaction)', text: 'When it takes damage, it burrows up to 20 ft without provoking opportunity attacks.' },
    ],
    notes: 'Original Lair Labs monster: an eyeless wyrm as long as a street, which eats metal and spits it back molten. Its grey hide is crusted with rivets, buckles and broken blades from everything it has swallowed. This one bored up into the machine graveyard and cracked the Stillward from below.',
    source: 'lair-labs',
  },

  // ---------- The Carnival of Shadows ----------
  {
    id: 'carouselHorse', name: 'Carousel Horse', size: 'Large', kind: 'Construct', ac: 13, hp: 30, hpDice: '4d10+8', speed: '60 ft',
    abilities: [16, 12, 14, 1, 10, 1], cr: '1/2', xp: 100, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [
      { name: 'Painted Wood', text: 'Immune to poison and psychic damage; can\'t be charmed, frightened or poisoned. Vulnerable to fire damage.' },
      { name: 'False Appearance', text: 'While it stays still on its pole, it is indistinguishable from an ordinary carved horse.' },
      { name: 'Calliope Gallop', text: 'While the calliope plays, it can take the Dash action as a bonus action.' },
    ],
    actions: [
      { name: 'Hooves', hit: 5, dmg: '2d4+3', type: 'bludgeoning' },
      { name: 'Brass-Pole Charge', hit: 5, dmg: '2d6+3', type: 'bludgeoning', save: 'DC 13 Str', text: 'Only after it moves 20 ft or more straight toward the target this turn. The target is knocked prone on a failed save.' },
      { name: 'Round and Round (reaction)', text: 'When a creature misses it with a melee attack, it wheels away up to 10 ft without provoking opportunity attacks.' },
    ],
    notes: 'Original Lair Labs monster: a white carousel horse with gold reins and a splintered brass pole through its back, torn free and galloping to calliope music. Its painted eyes never blink, and it leaves no hoofprints.',
    source: 'lair-labs',
  },

  // ---------- The Wolves of Winterhollow ----------
  {
    id: 'groveWardenWolf', name: 'Grove-Warden Wolf', size: 'Large', kind: 'Beast', ac: 14, hp: 52, hpDice: '7d10+14', speed: '50 ft',
    abilities: [17, 15, 15, 10, 14, 12], cr: '1', xp: 200, senses: 'Darkvision 60 ft, passive Perception 16',
    traits: [
      { name: 'Grove Speech', text: 'Speaks Common and Sylvan, a gift of the grove she guards.' },
      { name: 'Pack Tactics', text: 'Advantage on an attack roll against a creature if at least one of her allies is within 5 ft of it and not incapacitated.' },
      { name: 'Snow Coat', text: 'Advantage on Dexterity (Stealth) checks in snow, and resistance to cold damage.' },
    ],
    actions: [
      { name: 'Bite', hit: 5, dmg: '2d6+3', type: 'piercing', save: 'DC 13 Str', text: 'The target is knocked prone on a failed save.' },
      { name: 'Den Howl (Recharge 5-6)', save: 'DC 12 Wis', text: 'Each enemy within 30 ft that can hear her is frightened until the end of its next turn on a failed save. Each wolf of her pack that hears it can move up to half its speed as a reaction.' },
      { name: 'Guard the Pups (reaction)', text: 'When a creature within 5 ft of her attacks anyone other than her, she makes one Bite attack against it.' },
    ],
    notes: 'Original Lair Labs monster: an old white wolf as big as a pony, given speech by a sacred grove long ago so that she could guard it. She keeps her word, and she yields when badly hurt to save her pack.',
    source: 'lair-labs',
  },

  // ---------- The Hags' Bargain ----------
  {
    id: 'giantBogEel', name: 'Giant Bog Eel', size: 'Large', kind: 'Beast', ac: 13, hp: 60, hpDice: '8d10+16', speed: '5 ft, swim 40 ft',
    abilities: [17, 14, 15, 1, 10, 3], cr: '2', xp: 450, senses: 'Blindsight 10 ft, Darkvision 60 ft, passive Perception 10',
    traits: [
      { name: 'Hold Breath', text: 'It breathes water and can stay out of it for 10 minutes.' },
      { name: 'Slick', text: 'Advantage on checks and saves to escape a grapple or restraint.' },
      { name: 'Murk Hunter', text: 'Advantage on attack rolls against a creature that is in the water and can\'t see it.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Bite and one Coil.' },
      { name: 'Bite', hit: 5, dmg: '2d6+3', type: 'piercing' },
      { name: 'Coil', hit: 5, dmg: '1d8+3', type: 'bludgeoning', text: 'The target is grappled (escape DC 13) and, if in water, pulled under. Until the grapple ends the target is restrained and the eel can\'t Coil another.' },
      { name: 'Death Roll (Recharge 5-6)', save: 'DC 13 Con', dmg: '4d8', type: 'bludgeoning', text: 'The eel rolls with a creature it is grappling and drags it 15 ft deeper. Damage on a failed save, half on a success.' },
    ],
    notes: 'Original Lair Labs monster: an eel as long as a rowing boat and as thick as a man, mud-brown with a pale belly, grown old and fat on what the hags throw into the pool.',
    source: 'lair-labs',
  },
  {
    id: 'bloatedMereDead', name: 'Bloated Mere-Dead', size: 'Large', kind: 'Undead', ac: 9, hp: 85, hpDice: '9d10+36', speed: '30 ft, swim 20 ft',
    abilities: [19, 6, 18, 3, 6, 5], cr: '2', xp: 450, senses: 'Darkvision 60 ft, passive Perception 8',
    traits: [
      { name: 'Undead Nature', text: 'Immune to poison damage; can\'t be exhausted or poisoned. Needs no air, food, drink or sleep.' },
      { name: 'Undead Fortitude', text: 'If damage drops it to 0 HP, it makes a Con save (DC 5 + damage taken) to drop to 1 HP instead, unless the damage is radiant or from a critical hit.' },
      { name: 'Waterlogged', text: 'When it takes piercing or slashing damage, foul bog water sprays out: each creature within 5 ft makes a DC 14 Con save or is poisoned until the end of its next turn.' },
    ],
    actions: [
      { name: 'Slam', hit: 6, dmg: '2d8+4', type: 'bludgeoning' },
      { name: 'Drag Under', hit: 6, dmg: '1d8+4', type: 'bludgeoning', text: 'The target is grappled (escape DC 14). While it holds a creature in water, that creature is underwater and can\'t breathe.' },
      { name: 'Mere Belch (Recharge 5-6)', save: 'DC 14 Con', dmg: '3d6', type: 'poison', text: 'A 15-ft cone of stinking marsh gas. On a failed save a creature takes the damage and is poisoned until the end of its next turn; half damage only on a success.' },
    ],
    notes: 'Original Lair Labs monster: a corpse swollen to twice its size by years under the mere, skin grey-green and tight as a drum, still in the rags of the clothes it was buried in. Thimbleby sank its famine dead because the ground was too hard to dig.',
    source: 'lair-labs',
  },

  // ---------- The Tiger Masquerade ----------
  {
    id: 'ironVaultTiger', name: 'Iron Vault Tiger', size: 'Large', kind: 'Construct', ac: 20, hp: 253, hpDice: '22d10+132', speed: '50 ft',
    abilities: [24, 16, 22, 3, 14, 1], cr: '16', xp: 15000, senses: 'Darkvision 120 ft, passive Perception 12',
    traits: [
      MACHINE_BODY,
      { name: 'Magic Resistance', text: 'Advantage on saving throws against spells and other magical effects.' },
      { name: 'Vault-Bound', text: 'It never leaves the room it guards and ignores anyone who enters with its House\'s heir or the vault key. Speaking the House motto stops it for 1 minute.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Bite and two Claw attacks.' },
      { name: 'Bite', hit: 12, dmg: '4d10+7', type: 'piercing' },
      { name: 'Claw', hit: 12, dmg: '3d8+7', type: 'slashing', save: 'DC 20 Str', text: 'If it moved 20 ft or more straight toward the target this turn, the target is knocked prone on a failed save and the tiger can make one Bite against it as a bonus action.' },
      { name: 'Furnace Roar (Recharge 5-6)', save: 'DC 19 Dex', dmg: '12d10', type: 'fire', text: 'Its jaws open on the furnace in its chest: a 30-ft cone of fire. Damage on a failed save, half on a success.' },
      { name: 'Iron Pivot (reaction)', text: 'When a creature within 10 ft of it moves, it moves up to 10 ft toward that creature without provoking opportunity attacks and makes one Claw attack against it.' },
    ],
    notes: 'Original Lair Labs monster: a tiger of black iron larger than a horse, its eyes two lamps of red glass and a banked furnace glowing behind its teeth. A noble House set it to guard its treasury and gave it the House motto as the only word that calms it.',
    source: 'lair-labs',
  },
];

/** Token art for each new stat block: monster id -> an existing creature id from src/library/creatures. */
export const ART_G3: Record<string, string> = {
  clockworkTrooper: 'clockworkSoldier',
  kneeGateWarden: 'animatedArmor',
  gravemaker: 'ironGolem',
  quickironBorer: 'purple-worm',
  carouselHorse: 'warhorse',
  groveWardenWolf: 'winter-wolf',
  giantBogEel: 'giant-constrictor-snake',
  bloatedMereDead: 'ogre-zombie',
  ironVaultTiger: 'saber-toothed-tiger',
};

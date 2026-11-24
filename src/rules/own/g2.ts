// Original Lair Labs monsters written for the ready-made adventures (group 2), built with the SRD 5.2 rules.
import type { Monster } from '../monsters';

export const MONSTERS_G2: Monster[] = [
  // ---------- The Siege of Brightwall: the Tally Legion ----------
  { id: 'ironCollarSergeant', name: 'Iron-Collar Sergeant', size: 'Medium', kind: 'Humanoid (Goblinoid)', ac: 18, hp: 58, hpDice: '9d8+18', speed: '30 ft', abilities: [16, 13, 14, 11, 12, 10], cr: '3', xp: 700, senses: 'Darkvision 60 ft, passive Perception 13',
    traits: [
      { name: 'Shield Line', text: 'Once per turn, a Longsword hit deals an extra 2d6 damage if one of its allies is within 5 ft of the target and isn\'t incapacitated.' },
      { name: 'Drill Voice', text: 'Bonus action: one goblinoid ally within 30 ft that can hear it moves up to half its speed without provoking opportunity attacks.' },
      { name: 'Retreat in Order', text: 'While it is conscious, goblinoid allies within 30 ft of it can\'t be frightened.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Longsword attacks, or two Longbow attacks.' },
      { name: 'Longsword', hit: 5, dmg: '1d8+3', type: 'slashing' },
      { name: 'Longbow', hit: 3, dmg: '1d8+1', type: 'piercing', text: 'Range 150/600 ft.' },
      { name: 'Lock Shields (reaction)', text: 'When it or an ally within 5 ft is hit by an attack it can see, it adds 2 to that creature\'s AC against the attack, possibly turning the hit into a miss.' },
    ],
    notes: 'Original Lair Labs monster: a hobgoblin sergeant of a drilled legion, with an iron collar riveted shut on the day of promotion and a knotted cord for every soldier lost under its command.', source: 'lair-labs' },
  { id: 'tallyMaskedChampion', name: 'Masked Champion', size: 'Medium', kind: 'Humanoid (Goblinoid)', ac: 18, hp: 104, hpDice: '16d8+32', speed: '30 ft', abilities: [18, 14, 15, 10, 12, 13], cr: '5', xp: 1800, senses: 'Darkvision 60 ft, passive Perception 14',
    traits: [
      { name: 'Silver Mask', text: 'Advantage on saves against being charmed or frightened. While masked, it never speaks.' },
      { name: 'Chosen of the Line', text: 'Bonus action: it marks one creature it can see within 30 ft. Until the end of the champion\'s next turn, the marked creature has disadvantage on attack rolls against anyone but the champion.' },
      { name: 'Honour Guard', text: 'It fights to the death while the legion\'s standard stands within 120 ft of it.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Glaive attacks, or two Javelin attacks.' },
      { name: 'Glaive', hit: 7, dmg: '1d10+4', type: 'slashing', text: 'Reach 10 ft.' },
      { name: 'Javelin', hit: 7, dmg: '1d6+4', type: 'piercing', text: 'Range 30/120 ft.' },
      { name: 'Riposte (reaction)', text: 'When a creature within its reach misses it with a melee attack, it makes one Glaive attack against that creature.' },
    ],
    notes: 'Original Lair Labs monster: a giant hobgoblin duellist in black scale, face hidden behind a silver-chased war mask, picked from the whole legion to guard its standard and fight its champion duels.', source: 'lair-labs' },
  { id: 'tallyWarlord', name: 'Tally Warlord', size: 'Medium', kind: 'Humanoid (Goblinoid)', ac: 19, hp: 123, hpDice: '19d8+38', speed: '30 ft', abilities: [18, 14, 15, 15, 14, 16], cr: '6', xp: 2300, senses: 'Darkvision 60 ft, passive Perception 15',
    traits: [
      { name: 'Every Life Counted (2/day)', text: 'If it fails a saving throw, it can choose to succeed instead.' },
      { name: 'Calm Command', text: 'Goblinoid allies within 30 ft that can see it can\'t be frightened and add 1d4 to their saving throws.' },
      { name: 'Word Given', text: 'It never breaks a promise made before witnesses. When a battle is lost, it orders a retreat in good order rather than throw its soldiers away.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Warspear attacks, or two Warspear attacks and Command the Line.' },
      { name: 'Warspear', hit: 7, dmg: '1d10+4', type: 'piercing', text: 'Reach 10 ft; or thrown, range 20/60 ft (1d8+4).' },
      { name: 'Command the Line', text: 'Up to two allies within 60 ft that can hear it use their reactions to move up to half their speed and make one weapon attack each.' },
      { name: 'Parry (reaction)', text: '+3 AC against one melee attack that would hit it, if it is holding a weapon.' },
    ],
    notes: 'Original Lair Labs monster: the calm, exacting commander of a hobgoblin legion, in black lacquered plate with a knotted tally-cord down one arm for every life his soldiers have taken.', source: 'lair-labs' },
  { id: 'tallyAshcaller', name: 'Ashcaller', size: 'Medium', kind: 'Humanoid (Goblinoid)', ac: 13, hp: 71, hpDice: '13d8+13', speed: '30 ft', abilities: [10, 16, 12, 17, 13, 12], cr: '6', xp: 2300, senses: 'Darkvision 60 ft, passive Perception 11',
    traits: [
      { name: 'Ash-Scarred', text: 'Resistance to fire damage. Smoke doesn\'t obscure its vision.' },
      { name: 'Fire-Pot Satchel', text: 'Any of its fire that hits a flammable object (a pitch barrel, a timber roof, a tent) sets it alight.' },
      { name: 'Kindler of War', text: 'Each enemy that starts its turn in burning ground within 30 ft of it takes 2d6 fire damage.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Cinder Bolt attacks, or one Cinder Bolt and Throw Fire-Pot.' },
      { name: 'Cinder Bolt', hit: 6, dmg: '2d8+3', type: 'fire', text: 'Ranged spell attack, range 120 ft.' },
      { name: 'Throw Fire-Pot (Recharge 5-6)', dmg: '7d6', type: 'fire', save: 'DC 14 Dex', text: '20-ft-radius sphere within 60 ft; half on a success. The ground there burns for 1 minute.' },
      { name: 'Lantern Flare (1/day, bonus action)', save: 'DC 14 Con', text: 'Each creature within 15 ft that can see its brass lantern is blinded until the end of its next turn on a failed save.' },
      { name: 'Smoke Cloak (reaction)', text: 'When hit by an attack, it adds 3 to its AC against that attack as a puff of black smoke hides it.' },
    ],
    notes: 'Original Lair Labs monster: a hobgoblin war-caster with soot-black arms and a burned throat, who carries the legion\'s fire in a brass lantern on a pole and burns what the legion cannot keep.', source: 'lair-labs' },

  // ---------- When the Sun Goes Out ----------
  { id: 'unqueen', name: 'The Unqueen', size: 'Medium', kind: 'Undead (Shadow)', ac: 17, hp: 152, hpDice: '16d8+80', speed: '30 ft, fly 30 ft (hover)', abilities: [16, 18, 20, 16, 17, 22], cr: '13', xp: 10000, senses: 'Darkvision 120 ft, passive Perception 17',
    traits: [
      { name: 'Black Frost Regeneration', text: 'She regains 20 HP at the start of her turn if she has at least 1 HP and took no radiant damage since her last turn. This stops working while the true queen whose shadow she is walks in the shadow city.' },
      { name: 'Crown of the Long Night (3/day)', text: 'If she fails a saving throw, she can choose to succeed instead.' },
      { name: 'Made of Night', text: 'Immune to cold and necrotic damage; can\'t be charmed, frightened or exhausted. In sunlight she has disadvantage on attack rolls and ability checks and takes 20 radiant damage at the start of each of her turns.' },
      { name: 'Court of Night (legendary, 3/round)', text: 'At the end of another creature\'s turn: move up to her speed without provoking opportunity attacks; or make one Touch of Black Frost; or order one undead ally within 60 ft to make one attack (costs 2).' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Touch of Black Frost attacks, or two and Royal Command.' },
      { name: 'Touch of Black Frost', hit: 10, dmg: '2d8+5', type: 'cold', text: '+3d6 necrotic. The target\'s speed is halved until the end of its next turn.' },
      { name: 'Royal Command', save: 'DC 18 Wis', text: 'One creature within 60 ft that can hear her is charmed until the end of her next turn on a failed save. While charmed, it uses its reaction to make one weapon attack against a creature she chooses.' },
      { name: 'Hush of Feeling (Recharge 5-6)', dmg: '8d8', type: 'psychic', save: 'DC 18 Cha', text: 'Each creature of her choice within 30 ft; half on a success. On a failure the creature also can\'t take reactions until the end of its next turn.' },
    ],
    notes: 'Original Lair Labs monster: a young queen\'s fears given a body by an endless night, wearing her face and a gown of black frost. She cannot truly die while the night lasts: brought to 0 HP, she fades.', source: 'lair-labs' },
  { id: 'umbralAstronomer', name: 'Umbral Astronomer', size: 'Medium', kind: 'Undead (Shadow)', ac: 17, hp: 157, hpDice: '21d8+63', speed: '30 ft', abilities: [10, 16, 16, 21, 17, 16], cr: '21', xp: 33000, senses: 'Truesight 120 ft, passive Perception 20',
    traits: [
      { name: 'Every Star Charted (3/day)', text: 'If it fails a saving throw, it can choose to succeed instead.' },
      { name: 'Reads the Sky', text: 'It can\'t be surprised, and it knows where every creature within 120 ft of it is, even invisible ones. Advantage on saving throws against spells. Immune to cold, necrotic and poison; can\'t be charmed, frightened, paralyzed or poisoned.' },
      { name: 'Spellcasting', text: 'Intelligence, spell save DC 20: at will Detect Magic, Mage Hand; 2/day each Counterspell, Dimension Door, Dispel Magic, Wall of Force; 1/day Power Word Stun.' },
      { name: 'Night Observatory (legendary, 3/round)', text: 'At the end of another creature\'s turn: teleport up to 30 ft; or make one Black Star attack (costs 2); or recharge Foretell (costs 2).' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Black Star or Chart-Rod attacks, or one Black Star and Eclipse.' },
      { name: 'Black Star', hit: 12, dmg: '4d10+5', type: 'necrotic', text: 'Ranged spell attack, range 120 ft. A 5-ft ring of magical darkness clings to a target it hits until the start of the Astronomer\'s next turn.' },
      { name: 'Chart-Rod', hit: 12, dmg: '3d6+5', type: 'bludgeoning', text: '+4d8 cold.' },
      { name: 'Eclipse (Recharge 5-6)', dmg: '14d8', type: 'cold', save: 'DC 20 Con', text: 'A 30-ft-radius sphere within 120 ft becomes magical darkness for 1 minute; each creature in it takes the damage, half on a success.' },
      { name: 'Foretell (reaction)', text: 'When a creature it can see within 60 ft makes an attack roll or a saving throw, it rolls a d20 and the creature must use that roll instead.' },
    ],
    notes: 'Original Lair Labs monster: the shadow of a royal astronomer, a robed skeleton of black glass turning the pages of a star-chart of a night that has never had a day. It foresees blows before they are struck.', source: 'lair-labs' },

  // ---------- The Ninth Seal: Hushfolk changed by the titan's dreams ----------
  { id: 'dreamTroll', name: 'Dream-Troll', size: 'Large', kind: 'Aberration', ac: 14, hp: 95, hpDice: '10d10+40', speed: '30 ft', abilities: [18, 12, 18, 6, 10, 8], cr: '5', xp: 1800, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [
      { name: 'Dream-Knit Flesh', text: 'It regains 10 HP at the start of its turn. If it took fire or radiant damage since its last turn, this doesn\'t work. It dies only if it starts its turn at 0 HP and doesn\'t regain HP.' },
      { name: 'Sleepwalker', text: 'It is never fully awake: it can\'t be charmed or put to sleep, and it has advantage on saves against being frightened.' },
      { name: 'Hates the Light', text: 'Advantage on attack rolls against a creature carrying a lit light source.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Heavy Claw attacks.' },
      { name: 'Heavy Claw', hit: 7, dmg: '2d6+4', type: 'slashing' },
      { name: 'Dream Murmur (Recharge 5-6)', save: 'DC 13 Wis', text: 'Each creature within 15 ft that can hear it falls prone and is incapacitated until the end of its next turn on a failed save, drowsy with the titan\'s dreams.' },
    ],
    notes: 'Original Lair Labs monster: a cave-dweller who dreamed a sleeping titan\'s dreams too long and swelled into a hulking, grey, scale-patched sleepwalker. It heals while it dreams unless burned. Not evil, only half asleep and frightened.', source: 'lair-labs' },
  { id: 'twinSleeper', name: 'Twin-Sleeper', size: 'Large', kind: 'Aberration', ac: 13, hp: 85, hpDice: '10d10+30', speed: '40 ft', abilities: [20, 8, 17, 6, 10, 8], cr: '4', xp: 1100, senses: 'Darkvision 60 ft, passive Perception 12',
    traits: [
      { name: 'One Wakes, One Dreams', text: 'Its two heads take turns to sleep. It can\'t be surprised, and it has advantage on saves against being blinded, charmed, deafened, stunned or knocked unconscious.' },
      { name: 'Grown Together', text: 'It was two people, fused by one shared dream. If someone calls both of their names, it hesitates and loses its next action.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Stone-Heavy Fist attacks, or one Fist and Shared Dream.' },
      { name: 'Stone-Heavy Fist', hit: 7, dmg: '2d8+5', type: 'bludgeoning' },
      { name: 'Shared Dream', dmg: '3d8', type: 'psychic', save: 'DC 13 Wis', text: 'One creature within 30 ft; half on a success. On a failure its speed is 0 until the end of its next turn, as it dreams of being stone.' },
    ],
    notes: 'Original Lair Labs monster: two dreaming cave-dwellers grown together into one huge two-headed shape. One head sleeps and murmurs while the other watches, and they swap without waking.', source: 'lair-labs' },

  // ---------- The Seven Suns Caravan ----------
  { id: 'duneDog', name: 'Dune Dog', size: 'Medium', kind: 'Beast', ac: 13, hp: 11, hpDice: '2d8+2', speed: '50 ft', abilities: [11, 15, 12, 3, 12, 6], cr: '1/4', xp: 50, senses: 'Passive Perception 13',
    traits: [
      { name: 'Keen Nose', text: 'Advantage on Wisdom (Perception) checks that rely on smell.' },
      { name: 'Sand Runner', text: 'Loose sand isn\'t difficult terrain for it, and it can Disengage as a bonus action.' },
      { name: 'Hungry, Not Brave', text: 'A dune dog that is thrown food, or sees two of its pack fall, flees.' },
    ],
    actions: [
      { name: 'Bite', hit: 4, dmg: '1d6+2', type: 'piercing', text: 'If another dune dog is within 5 ft of the target, the target\'s speed is halved until the end of its next turn.' },
    ],
    notes: 'Original Lair Labs monster: a lean, long-legged, sand-coloured wild dog of the deep desert, with big ears and a yelping call. Packs of five or six follow caravans for scraps.', source: 'lair-labs' },
  { id: 'cacklingHyenaBeast', name: 'Hyena-Beast', size: 'Large', kind: 'Monstrosity', ac: 13, hp: 30, hpDice: '4d10+8', speed: '50 ft', abilities: [16, 13, 14, 5, 11, 6], cr: '1/2', xp: 100, senses: 'Darkvision 60 ft, passive Perception 13',
    traits: [
      { name: 'Keen Smell', text: 'Advantage on Wisdom (Perception) checks that rely on smell.' },
      { name: 'Bone-Cracker', text: 'Its Bite deals an extra 1d6 damage to a prone creature.' },
      { name: 'Gnoll Mount', text: 'It carries a Medium rider, and a gnoll riding it can act normally.' },
    ],
    actions: [
      { name: 'Bite', hit: 5, dmg: '2d6+3', type: 'piercing', save: 'DC 13 Str', text: 'A Medium or smaller target is knocked prone on a failed save.' },
      { name: 'Cackle (bonus action, Recharge 6)', save: 'DC 11 Wis', text: 'Each creature within 30 ft that can hear it and isn\'t a gnoll or hyena is frightened of it until the end of its next turn on a failed save.' },
    ],
    notes: 'Original Lair Labs monster: a hyena the size of a pony, bred by gnolls as a mount and a hunting beast. Spotted, slope-backed and always laughing.', source: 'lair-labs' },
  { id: 'gnollRingChief', name: 'Gnoll Ring-Chief', size: 'Medium', kind: 'Humanoid', ac: 15, hp: 45, hpDice: '7d8+14', speed: '30 ft', abilities: [17, 13, 14, 8, 11, 10], cr: '2', xp: 450, senses: 'Darkvision 60 ft, passive Perception 12',
    traits: [
      { name: 'Giggling Fury', text: 'When it reduces a creature to 0 HP, it and each gnoll within 30 ft that can hear its laughter gain 5 temporary HP.' },
      { name: 'Ring-Chief\'s Cry (1/day, bonus action)', text: 'Each gnoll and hyena ally within 30 ft that can hear it uses its reaction to move up to half its speed toward an enemy and make one Bite attack.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Flail attacks, or one Flail and one Bite.' },
      { name: 'Flail', hit: 5, dmg: '1d10+3', type: 'bludgeoning' },
      { name: 'Bite', hit: 5, dmg: '1d6+3', type: 'piercing' },
      { name: 'Longbow', hit: 3, dmg: '1d8+1', type: 'piercing', text: 'Range 150/600 ft.' },
    ],
    notes: 'Original Lair Labs monster: the biggest and cleverest gnoll of a desert band, who leads by laughter and fear. The band follows its chief until the chief shows fear itself.', source: 'lair-labs' },
  { id: 'motherWind', name: 'The Mother Wind', size: 'Huge', kind: 'Elemental', ac: 15, hp: 115, hpDice: '11d12+44', speed: '0 ft, fly 90 ft (hover)', abilities: [18, 20, 18, 8, 14, 12], cr: '5', xp: 1800, senses: 'Darkvision 60 ft, passive Perception 12',
    traits: [
      { name: 'Body of Sand and Wind', text: 'Immune to poison and to being grappled, knocked prone or restrained; resistance to lightning and thunder. She can move through a space as narrow as 1 inch.' },
      { name: 'Sandstorm Veil', text: 'The area within 10 ft of her is heavily obscured by whirling sand. She can see through it.' },
      { name: 'A Mother\'s Grief', text: 'If her stolen child is set free within a mile of her, she stops fighting at once, gathers it up and leaves.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Gust attacks.' },
      { name: 'Gust', hit: 8, dmg: '2d8+5', type: 'bludgeoning', text: 'Reach 10 ft. A Large or smaller target is pushed 10 ft away from her.' },
      { name: 'Scouring Whirl (Recharge 4-6)', dmg: '3d8+5', type: 'bludgeoning', save: 'DC 14 Str', text: 'Each creature in her space or within 10 ft of her; on a failure it is also flung 20 ft and lands prone. Half damage on a success.' },
    ],
    notes: 'Original Lair Labs monster: the great wind of the deep desert, a howling shape of whirling red sand as tall as a tower. She is not evil: she has searched four hundred years for the child stolen from her.', source: 'lair-labs' },

  // ---------- Blood Moon over Varrow ----------
  { id: 'werewolfGreyAlpha', name: 'Grey Alpha', size: 'Medium', kind: 'Humanoid (Shapechanger)', ac: 13, hp: 90, hpDice: '12d8+36', speed: '30 ft (50 ft in wolf form)', abilities: [18, 14, 16, 11, 13, 12], cr: '5', xp: 1800, senses: 'Darkvision 60 ft, passive Perception 15',
    traits: [
      { name: 'Shapechanger', text: 'Bonus action: it turns into a huge grey wolf or a wolf-headed hybrid, or back to its true human form. Its statistics are the same in each form, but only the wolf and hybrid can bite.' },
      { name: 'Moonbound Hide', text: 'Resistance to bludgeoning, piercing and slashing damage from attacks that aren\'t made with silvered or magic weapons.' },
      { name: 'Pack Lord', text: 'Wolves and werewolves within 30 ft of it that can see it add 2 to their attack rolls.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Bite and two Claw attacks (wolf or hybrid form), or two Cudgel attacks (human form).' },
      { name: 'Bite', hit: 7, dmg: '2d6+4', type: 'piercing', save: 'DC 13 Con', text: 'A humanoid that fails is cursed with werewolf lycanthropy.' },
      { name: 'Claw', hit: 7, dmg: '1d8+4', type: 'slashing' },
      { name: 'Cudgel', hit: 7, dmg: '2d6+4', type: 'bludgeoning' },
      { name: 'Call the Pack (Recharge 5-6)', text: 'Each wolf and werewolf within 60 ft that can hear its howl uses its reaction to move up to its speed and make one Bite attack.' },
    ],
    notes: 'Original Lair Labs monster: the old head of a cursed bloodline, a great grey wolf with a white muzzle when the moon is up. The pack it made cannot disobey its howl.', source: 'lair-labs' },

  // ---------- The Hagsmoor Mill ----------
  { id: 'millpondHag', name: 'Millpond Hag', size: 'Medium', kind: 'Fey', ac: 14, hp: 52, hpDice: '8d8+16', speed: '30 ft, swim 40 ft', abilities: [15, 13, 15, 13, 14, 14], cr: '2', xp: 450, senses: 'Darkvision 60 ft, passive Perception 14',
    traits: [
      { name: 'Amphibious', text: 'Breathes air and water.' },
      { name: 'Bound by the Bargain', text: 'She can\'t break the exact words of a bargain she has made, and she must hear out a fair offer made to her three times, kindly.' },
      { name: 'Kindly Face', text: 'She can look like a kindly old woman of the village until she takes damage or uses Reed Whisper.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Dripping Claw attacks.' },
      { name: 'Dripping Claw', hit: 4, dmg: '1d8+2', type: 'slashing' },
      { name: 'Reed Whisper', save: 'DC 12 Wis', text: 'Each creature within 30 ft that can see her is frightened of her for 1 minute on a failed save (it repeats the save at the end of each of its turns). A creature that succeeds is immune for 24 hours.' },
      { name: 'Dream-Drinking Stare', save: 'DC 12 Wis', text: 'One creature frightened of her within 30 ft falls unconscious on a failed save while she sips its dreams. It wakes if it takes damage or someone uses an action to shake it, and otherwise after 1 minute.' },
    ],
    notes: 'Original Lair Labs monster: a hag of millponds and fen pools, green-grey, with pondweed hair and lily-bud eyes. She drinks dreams, keeps every bargain to the letter, and would always rather deal than fight.', source: 'lair-labs' },
];

/** Token art for each new stat block: monster id -> an existing creature id from src/library/creatures. */
export const ART_G2: Record<string, string> = {
  ironCollarSergeant: 'hobgoblin',
  tallyMaskedChampion: 'hobgoblin',
  tallyWarlord: 'hobgoblin',
  tallyAshcaller: 'fire-mage',
  unqueen: 'vampire',
  umbralAstronomer: 'lich',
  dreamTroll: 'troll',
  twinSleeper: 'ettin',
  duneDog: 'wolf',
  cacklingHyenaBeast: 'worg',
  gnollRingChief: 'gnoll',
  motherWind: 'airElemental',
  werewolfGreyAlpha: 'werewolf',
  millpondHag: 'sea-hag',
};

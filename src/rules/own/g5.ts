// Original Lair Labs monsters written for the ready-made adventures (group 5), built with the SRD 5.2 rules.
import type { Monster } from '../monsters';

export const MONSTERS_G5: Monster[] = [
  // ---------- CR 1/2 ----------
  {
    id: 'feyDebtHound', name: 'Debt-Hound', size: 'Medium', kind: 'Fey', ac: 13, hp: 26, hpDice: '4d8+8', speed: '50 ft',
    abilities: [15, 15, 14, 6, 13, 8], cr: '1/2', xp: 100, senses: 'Darkvision 60 ft, passive Perception 13',
    traits: [
      { name: 'Nose for Debts', text: 'It knows the direction of any creature within 1 mile that owes its master a debt, and has advantage on Wisdom (Perception) checks to find one.' },
      { name: 'Collector', text: 'It has advantage on attack rolls against a creature that owes its master a debt.' },
      { name: 'Paid in Full', text: 'If the debt it hunts is paid, it stops attacking at once, bows, and slinks back into the hedges.' },
    ],
    actions: [
      { name: 'Bite', hit: 4, dmg: '2d4+2', type: 'piercing', save: 'DC 12 Cha', text: 'A debtor that fails the save is frightened of the hound until the end of its next turn.' },
      { name: 'Drag Home (bonus action)', text: 'It moves up to half its speed, pulling a prone or grappled Medium or smaller debtor with it.' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a long grey hound of the fey court with eyes like polished coins. It hunts guests who took a gift and left nothing in return.',
  },

  // ---------- CR 1 ----------
  {
    id: 'stoneGardener', name: 'Stone Gardener', size: 'Medium', kind: 'Construct', ac: 16, hp: 33, hpDice: '6d8+6', speed: '25 ft',
    abilities: [15, 8, 13, 3, 10, 1], cr: '1', xp: 200, senses: 'Blindsight 60 ft (blind beyond), passive Perception 10',
    traits: [
      { name: 'False Appearance', text: 'While it stands still, it looks exactly like a garden statue.' },
      { name: 'Stone Body', text: "Immune to poison and psychic; can't be charmed, frightened, exhausted or poisoned. Resists piercing and slashing." },
      { name: 'Courtesy-Bound', text: "It can't attack a creature that has spoken politely to the garden this hour, unless that creature harms a statue or a plant first." },
    ],
    actions: [
      { name: 'Multiattack', text: 'One Pruning Shears attack and one Stone Hand attack.' },
      { name: 'Pruning Shears', hit: 4, dmg: '1d8+2', type: 'slashing' },
      { name: 'Stone Hand', hit: 4, dmg: '1d6+2', type: 'bludgeoning', text: 'A Medium or smaller target is grappled (escape DC 12).' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a stone statue of a gardener in a broad hat, holding shears, that keeps a fey garden tidy. Its face is smooth and blank where the eyes should be.',
  },
  {
    id: 'roseDaughter', name: 'Rose Daughter', size: 'Medium', kind: 'Plant', ac: 13, hp: 27, hpDice: '5d8+5', speed: '30 ft',
    abilities: [10, 14, 12, 10, 13, 15], cr: '1', xp: 200, senses: 'Darkvision 60 ft, passive Perception 13',
    traits: [
      { name: 'One Voice', text: 'Every rose daughter within 1 mile of the mother rose knows what the others know, and they speak together in one sweet voice.' },
      { name: 'Afraid of Fire', text: 'Vulnerable to fire. When it takes fire damage, it is frightened of the source until the end of its next turn.' },
      { name: 'Petal Step (bonus action)', text: 'It steps into a flower bed or rose bush within 5 ft and out of another one within 30 ft.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Thorn Touch attacks.' },
      { name: 'Thorn Touch', hit: 4, dmg: '1d6+2', type: 'piercing', text: '+1d6 poison.' },
      { name: 'Sweet Song (1/day)', save: 'DC 12 Wis', text: 'One creature within 30 ft that can hear it is charmed for 1 minute (repeat the save at the end of each of its turns, and it ends if the creature takes damage).' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a slender figure grown from rose petals and green stems, budded from a mother rose. Its face is grown in the likeness of someone the rose remembers, and its fingers end in thorns.',
  },

  // ---------- CR 2 ----------
  {
    id: 'livingTopiary', name: 'Living Topiary', size: 'Large', kind: 'Plant', ac: 13, hp: 51, hpDice: '6d10+18', speed: '30 ft',
    abilities: [18, 10, 16, 3, 10, 6], cr: '2', xp: 450, senses: 'Blindsight 60 ft (blind beyond), passive Perception 10',
    traits: [
      { name: 'False Appearance', text: 'While it stands still, it looks like an ordinary hedge clipped into the shape of a beast.' },
      { name: 'Clipped and Woven', text: 'Vulnerable to fire. Resists bludgeoning and piercing.' },
      { name: 'Thorny', text: 'A creature that grapples it, or hits it with an unarmed strike, takes 2 (1d4) piercing damage.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Branch Lash attacks, or one Branch Lash and one Enfold.' },
      { name: 'Branch Lash', hit: 6, dmg: '1d8+4', type: 'slashing', text: 'Reach 10 ft.' },
      { name: 'Enfold', hit: 6, dmg: '2d6+4', type: 'bludgeoning', text: 'A Medium or smaller target is grappled (escape DC 14) and restrained while grappled. It can enfold one creature at a time.' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a hedge clipped into the shape of a stag, a swan or a hound and woken by fey or wild magic. Small bells or ribbons are often tied in its leaves.',
  },
  {
    id: 'roseThornWarden', name: 'Thorn Warden', size: 'Large', kind: 'Plant', ac: 14, hp: 52, hpDice: '7d10+14', speed: '20 ft',
    abilities: [17, 8, 14, 5, 12, 6], cr: '2', xp: 450, senses: 'Blindsight 30 ft, passive Perception 11',
    traits: [
      { name: 'False Appearance', text: 'While it stands still, it looks like a great tangle of rose briars.' },
      { name: 'Fear of Fire', text: 'Vulnerable to fire. After it takes fire damage, it has disadvantage on attack rolls until the end of its next turn.' },
      { name: 'Lulled', text: 'A creature can sing or play a lullaby as an action (DC 13 Charisma (Performance) check). On a success, each warden within 30 ft that hears it falls asleep for 1 minute, or until it takes damage.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Briar Whip attacks.' },
      { name: 'Briar Whip', hit: 5, dmg: '1d10+3', type: 'slashing', text: 'Reach 10 ft.' },
      { name: 'Grasping Briars (Recharge 5-6)', dmg: '2d6', type: 'piercing', save: 'DC 13 Str', text: 'Each creature within 10 ft takes the damage and is restrained (escape DC 13) on a failed save, or takes half and is not restrained on a success.' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a guardian grown from rose briars, thick as a cart and heavy with red blooms, that wakes when someone touches what it guards.',
  },

  // ---------- CR 3 ----------
  {
    id: 'eyrieWarriorMonk', name: 'Warrior Monk', size: 'Medium', kind: 'Humanoid', ac: 15, hp: 52, hpDice: '8d8+16', speed: '40 ft',
    abilities: [12, 16, 14, 10, 15, 10], cr: '3', xp: 700, senses: 'Passive Perception 14',
    traits: [
      { name: 'Unarmored Defense', text: 'Its AC includes its Wisdom bonus while it wears no armour.' },
      { name: 'Disciplined', text: 'Advantage on saves against being charmed or frightened.' },
      { name: 'Staffs Crossed', text: 'While another warrior monk is within 5 ft of it, it has +1 AC.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Quarterstaff attacks and one Open Hand attack.' },
      { name: 'Quarterstaff', hit: 5, dmg: '1d8+3', type: 'bludgeoning' },
      { name: 'Open Hand', hit: 5, dmg: '1d6+3', type: 'bludgeoning', save: 'DC 12 Str', text: "A Large or smaller target is pushed 10 ft away or knocked prone (the monk's choice) on a failed save." },
      { name: 'Deflect (reaction)', text: 'When a weapon attack hits it, it reduces the damage by 1d10+3.' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a robed monk of a mountain order, trained to fight with staff and open hand and to hold a line shoulder to shoulder.',
  },

  // ---------- CR 4 ----------
  {
    id: 'inkPudding', name: 'Ink Pudding', size: 'Large', kind: 'Ooze', ac: 8, hp: 76, hpDice: '9d10+27', speed: '20 ft',
    abilities: [16, 6, 16, 1, 6, 1], cr: '4', xp: 1100, senses: 'Blindsight 60 ft (blind beyond), passive Perception 8',
    traits: [
      { name: 'Amorphous', text: 'It can move through a space as narrow as 1 inch without squeezing.' },
      { name: 'Ooze Nature', text: "Immune to acid and cold; can't be blinded, charmed, deafened, exhausted, frightened or knocked prone. Vulnerable to fire (the ink burns with a smell of old letters)." },
      { name: "Can't Climb", text: "It can't climb furniture or walls. A creature standing on a desk or table is out of its reach unless it is within 10 ft of the edge." },
    ],
    actions: [
      { name: 'Pseudopod', hit: 5, dmg: '1d8+3', type: 'bludgeoning', text: 'Reach 10 ft. +2d8 acid. Paper, parchment and cloth the target carries are soaked black and ruined unless they are in a sealed case.' },
      { name: 'Ink Spray (Recharge 5-6)', save: 'DC 13 Con', text: '15-ft cone. Each creature in it is blinded until the end of its next turn on a failed save.' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a heaving pool of a hundred years of spilled ink that slowly woke up. Half-dissolved letters swirl on its surface.',
  },

  // ---------- CR 5 ----------
  {
    id: 'eyrieStaffMaster', name: 'Monk Staff-Master', size: 'Medium', kind: 'Humanoid', ac: 16, hp: 97, hpDice: '13d8+39', speed: '45 ft',
    abilities: [14, 18, 16, 11, 17, 12], cr: '5', xp: 1800, senses: 'Passive Perception 16',
    traits: [
      { name: 'Trained Guard', text: 'Its AC comes from training, not armour: robes or light mail make no difference to it.' },
      { name: 'Evasion', text: 'When it makes a Dexterity save to take half damage, it takes none on a success and half on a failure.' },
      { name: 'Disciplined', text: 'Advantage on saves against being charmed or frightened.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three attacks with its Iron-Bound Staff or Open Hand, in any mix.' },
      { name: 'Iron-Bound Staff', hit: 7, dmg: '1d8+4', type: 'bludgeoning', text: 'Reach 10 ft.' },
      { name: 'Open Hand', hit: 7, dmg: '1d6+4', type: 'bludgeoning' },
      { name: 'Stunning Strike (once per turn)', save: 'DC 14 Con', text: "When it hits a creature, the target is stunned until the start of the staff-master's next turn on a failed save." },
      { name: 'Deflect (reaction)', text: 'When a weapon attack hits it, it reduces the damage by 1d10+7.' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a senior monk of a mountain order who fights with an iron-shod staff and a hand that can stop a heart for a moment.',
  },

  // ---------- CR 6 ----------
  {
    id: 'midsummerLord', name: 'Midsummer Lord', size: 'Medium', kind: 'Fey', ac: 15, hp: 104, hpDice: '16d8+32', speed: '30 ft',
    abilities: [12, 18, 14, 16, 15, 20], cr: '6', xp: 2300, senses: 'Darkvision 120 ft, passive Perception 15',
    traits: [
      { name: 'Bound by His Word', text: "He can't break a promise he has spoken aloud." },
      { name: "Host's Law", text: "He can't harm a guest who keeps the courtesies. A guest who steals from him or draws iron in his hall stops being a guest." },
      { name: 'Magic Resistance', text: 'Advantage on saves against spells and other magical effects.' },
      { name: 'A Guest Worth Keeping', text: 'When he drops below half his hit points, he may yield and offer a boon instead of fighting on.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Thorn Rapier attacks, or two Moonlight Lance attacks.' },
      { name: 'Thorn Rapier', hit: 7, dmg: '1d8+4', type: 'piercing', text: '+1d6 poison.' },
      { name: 'Moonlight Lance', hit: 8, dmg: '3d8', type: 'radiant', text: 'Ranged spell attack, range 120 ft.' },
      { name: 'Golden Pollen (Recharge 5-6)', save: 'DC 16 Wis', text: 'A 20-ft cube within 60 ft. Each creature in it is charmed for 1 minute on a failed save and spends its turns dancing (repeat the save at the end of each of its turns; it ends if the creature takes damage).' },
      { name: 'Courtly Parry (reaction)', text: '+3 AC against one melee attack that would hit him.' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a tall fey lord with antlers of silver twigs who holds court one night a year. Charming, bored, and absolutely bound by his word.',
  },
  {
    id: 'unseenWhisperer', name: 'Unseen Whisperer', size: 'Medium', kind: 'Aberration', ac: 14, hp: 104, hpDice: '16d8+32', speed: '0 ft, fly 50 ft (hover)',
    abilities: [14, 19, 14, 12, 15, 16], cr: '6', xp: 2300, senses: 'Darkvision 60 ft, passive Perception 18',
    traits: [
      { name: 'Invisible', text: 'It is always invisible. Only its breath, frosting in cold air, shows where it is (DC 15 Wisdom (Perception)).' },
      { name: 'Borrowed Voices', text: 'It can speak in the voice of anyone it has heard, and it always knows the name of someone each creature it can see trusts.' },
      { name: 'Dream-Born', text: "Immune to psychic; can't be charmed or frightened. At 0 hit points it scatters into cold mist." },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Cold Grasp attacks.' },
      { name: 'Cold Grasp', hit: 7, dmg: '2d8+4', type: 'cold' },
      { name: 'Whispered Accusation (Recharge 5-6)', dmg: '4d10', type: 'psychic', save: 'DC 14 Wis', text: "One creature within 60 ft that can hear it. On a failed save it takes the damage and must use its next action to attack a creature of the whisperer's choice; on a success, half damage only." },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a nightmare that leaked out of a dream and never took a shape. It follows people and whispers accusations in the voices of their friends.',
  },

  // ---------- CR 7 ----------
  {
    id: 'barrowHuskarl', name: 'Barrow Huskarl', size: 'Huge', kind: 'Undead', ac: 15, hp: 126, hpDice: '11d12+55', speed: '40 ft',
    abilities: [22, 9, 20, 6, 10, 8], cr: '7', xp: 2900, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [
      { name: 'Grave-Cold', text: "Immune to cold and poison; can't be poisoned, frightened or exhausted. Resists necrotic." },
      { name: "Heir's Word", text: 'It obeys the true heir of the hold it swore to. The heir can send it back to sleep with a word.' },
      { name: 'Rime Crust', text: 'A creature that hits it with a melee attack while within 5 ft takes 4 (1d8) cold damage.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Barrow Axe attacks.' },
      { name: 'Barrow Axe', hit: 9, dmg: '2d12+6', type: 'slashing', text: 'Reach 10 ft. +1d8 necrotic.' },
      { name: 'Grave Breath (Recharge 5-6)', dmg: '8d8', type: 'cold', save: 'DC 16 Con', text: '30-ft cone; half damage on a success.' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a frost giant oath-guard who died beside his king and was buried sitting up, axe on his knees. Frost rims his beard and his eyes are pale blue lights.',
  },
  {
    id: 'boneMarketTallyman', name: 'Tallyman', size: 'Large', kind: 'Construct', ac: 17, hp: 142, hpDice: '15d10+60', speed: '30 ft',
    abilities: [20, 10, 18, 3, 14, 1], cr: '7', xp: 2900, senses: 'Blindsight 30 ft, darkvision 60 ft, passive Perception 15',
    traits: [
      { name: 'Market-Bound', text: "Immune to poison and psychic; can't be charmed, frightened, paralyzed or poisoned." },
      { name: 'Law-Sense', text: "It knows when one of its market's laws is broken within 300 ft, and where." },
      { name: 'Grab, Not Kill', text: 'It deals no damage to a creature that has yielded, and it knocks out instead of killing.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Bone Grip attacks.' },
      { name: 'Bone Grip', hit: 8, dmg: '2d10+5', type: 'bludgeoning', text: 'Reach 10 ft. A Large or smaller target is grappled (escape DC 16). It has two hands and can hold two creatures.' },
      { name: 'Tally Chime (Recharge 5-6)', save: 'DC 15 Con', text: 'It rattles the counting beads in its chest. Each creature within 30 ft that has broken a law of the market is stunned until the end of its next turn on a failed save.' },
      { name: 'Drag to Account (bonus action)', text: 'It moves up to its speed, carrying any creatures it is grappling with no penalty.' },
    ],
    source: 'lair-labs',
    notes: "Original Lair Labs monster: a tall, stooped warden of yellow bone and brass with counting beads rattling in its ribcage. It keeps a market's laws to the letter.",
  },
  {
    id: 'dragonSwornGeneral', name: 'Dragon-Sworn General', size: 'Medium', kind: 'Humanoid', ac: 19, hp: 112, hpDice: '15d8+45', speed: '30 ft',
    abilities: [18, 12, 16, 13, 14, 16], cr: '7', xp: 2900, senses: 'Passive Perception 15',
    traits: [
      { name: 'Scale Armour', text: 'His armour is made of shed dragon scales: he resists fire.' },
      { name: 'Commander', text: 'Allies within 30 ft that can see him have advantage on saves against being frightened.' },
      { name: 'Old Soldier', text: 'He has advantage on initiative rolls and can\'t be surprised while he is awake.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Greatsword attacks.' },
      { name: 'Greatsword', hit: 7, dmg: '2d6+4', type: 'slashing' },
      { name: 'Rally the Oath (Recharge 5-6)', text: 'Up to three allies within 60 ft that can hear him can each use a reaction to make one weapon attack.' },
      { name: 'Parry (reaction)', text: '+3 AC against one melee attack that would hit him.' },
    ],
    source: 'lair-labs',
    notes: "Original Lair Labs monster: an old general who swore his army to a dragon to save what was left of his country. Red scale armour, a grey beard and a soldier's shame.",
  },

  // ---------- CR 9 ----------
  {
    id: 'motherRose', name: 'Mother Rose', size: 'Huge', kind: 'Plant', ac: 15, hp: 138, hpDice: '12d12+60', speed: '0 ft',
    abilities: [23, 8, 21, 10, 16, 14], cr: '9', xp: 5000, senses: 'Blindsight 120 ft (blind beyond), passive Perception 13',
    traits: [
      { name: 'Rooted', text: "She can't move or be moved. Her roots run under the soil of her garden: she can attack any creature standing on that soil within 60 ft, the briars bursting up under it." },
      { name: 'Fire Hurts Her', text: 'Fire damage against her is doubled.' },
      { name: 'Regrowth', text: 'At the start of her turn she regains 10 hit points, unless she took fire damage since her last turn.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Three Thorn Lash attacks, or two Thorn Lash attacks and Strangling Roots.' },
      { name: 'Thorn Lash', hit: 10, dmg: '3d6+6', type: 'slashing', text: 'Reach 20 ft (or anywhere on her soil, see Rooted).' },
      { name: 'Strangling Roots', save: 'DC 17 Str', text: 'One creature on her soil within 60 ft is restrained on a failed save (escape DC 17) and takes 2d8 bludgeoning damage at the start of each of its turns while restrained.' },
      { name: 'Petal Storm (Recharge 5-6)', dmg: '6d8', type: 'poison', save: 'DC 17 Con', text: 'Each creature within 30 ft of her takes the damage and is poisoned until the end of its next turn on a failed save, or half damage on a success.' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a vast old rose grown wild with magic, its thorns as long as knives and every bloom turned toward whoever it is watching.',
  },
  {
    id: 'frostGiantQueen', name: 'Frost Giant Queen', size: 'Huge', kind: 'Giant', ac: 16, hp: 184, hpDice: '16d12+80', speed: '40 ft',
    abilities: [24, 9, 21, 11, 14, 16], cr: '9', xp: 5000, senses: 'Passive Perception 15',
    traits: [
      { name: 'Winter-Blooded', text: 'Immune to cold.' },
      { name: 'Grief-Fury', text: 'When an ally she can see within 60 ft drops to 0 hit points, she can use her reaction to move up to her speed and make one Rime Axe attack.' },
      { name: 'Royal Voice', text: 'Giants of her hold within 120 ft that can hear her obey her commands, even mid-fight.' },
    ],
    actions: [
      { name: 'Multiattack', text: "Two Rime Axe attacks, or one Rime Axe attack and Queen's Command." },
      { name: 'Rime Axe', hit: 11, dmg: '3d12+7', type: 'slashing', text: 'Reach 10 ft. +1d8 cold.' },
      { name: 'Ice Boulder', hit: 11, dmg: '4d10+7', type: 'bludgeoning', text: 'Range 60/240 ft.' },
      { name: "Queen's Command", text: 'Up to two giant allies within 60 ft that can hear her can each use a reaction to move up to half their speed and make one weapon attack.' },
      { name: "Winter's Voice (Recharge 5-6)", save: 'DC 15 Wis', text: 'Each creature of her choice within 30 ft that can hear her is frightened of her for 1 minute on a failed save (repeat the save at the end of each of its turns).' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: the crowned ruler of a frost giant hold, taller than her huskarls, in a cloak of white bear fur with an axe of blue ice. Her voice carries over a blizzard.',
  },

  // ---------- CR 15 ----------
  {
    id: 'notaryEngine', name: 'Notary Engine', size: 'Large', kind: 'Construct', ac: 20, hp: 210, hpDice: '20d10+100', speed: '30 ft',
    abilities: [24, 9, 20, 3, 11, 1], cr: '15', xp: 13000, senses: 'Darkvision 120 ft, passive Perception 10',
    traits: [
      { name: 'Clerk of the Pit', text: "Immune to fire, poison and psychic; can't be charmed, frightened, paralyzed, petrified or poisoned. Resists bludgeoning, piercing and slashing from nonmagical attacks." },
      { name: 'Magic Resistance', text: 'Advantage on saves against spells and other magical effects.' },
      { name: 'Proper Channels', text: 'It steps aside for anyone who feeds it a properly stamped and countersigned form, and ignores them until they leave its hall.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Seal Fist attacks and one Stamp of Rejection.' },
      { name: 'Seal Fist', hit: 12, dmg: '3d8+7', type: 'bludgeoning', text: 'Reach 10 ft.' },
      { name: 'Stamp of Rejection', hit: 12, dmg: '2d10+7', type: 'bludgeoning', text: "+3d6 fire. The word REJECTED burns onto the target: until the end of its next turn it can't take reactions." },
      { name: 'Red-Tape Exhalation (Recharge 5-6)', dmg: '12d8', type: 'fire', save: 'DC 18 Con', text: '30-ft cone of boiling sealing wax and ink. On a failed save a creature takes the damage and is restrained until the end of its next turn; half damage on a success.' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a hulking engine of iron and brass with a slot in its chest for papers and a red-hot seal for each fist. It approves, or it rejects, loudly.',
  },

  // ---------- CR 16 ----------
  {
    id: 'emberBrassWarden', name: 'Brass Warden', size: 'Large', kind: 'Construct', ac: 20, hp: 199, hpDice: '19d10+95', speed: '30 ft',
    abilities: [24, 9, 20, 3, 11, 1], cr: '16', xp: 15000, senses: 'Darkvision 120 ft, passive Perception 10',
    traits: [
      { name: 'Forged Body', text: "Immune to fire, poison and psychic; can't be charmed, frightened, paralyzed, petrified or poisoned. Resists bludgeoning, piercing and slashing from nonmagical attacks." },
      { name: 'Fire Feeds It', text: 'When it would take fire damage, it regains that many hit points instead.' },
      { name: 'Searing Body', text: 'A creature that touches it or hits it with a melee attack while within 5 ft takes 7 (2d6) fire damage.' },
      { name: 'Magic Resistance', text: 'Advantage on saves against spells and other magical effects.' },
    ],
    actions: [
      { name: 'Multiattack', text: 'Two Molten Fist attacks.' },
      { name: 'Molten Fist', hit: 12, dmg: '3d8+7', type: 'bludgeoning', text: 'Reach 10 ft. +2d6 fire.' },
      { name: 'Furnace Mouth (Recharge 5-6)', dmg: '12d10', type: 'fire', save: 'DC 18 Dex', text: '60-ft line, 5 ft wide; half damage on a success.' },
    ],
    source: 'lair-labs',
    notes: 'Original Lair Labs monster: a giant of polished brass with a furnace glowing behind its ribs, forged to guard a treasury. It is hot enough to blister skin at a touch.',
  },
];

/** Token art for each new stat block: monster id -> an existing creature id from src/library/creatures. */
export const ART_G5: Record<string, string> = {
  feyDebtHound: 'blink-dog',
  stoneGardener: 'stoneGolem',
  roseDaughter: 'dryad',
  livingTopiary: 'awakenedShrub',
  roseThornWarden: 'awakenedTree',
  eyrieWarriorMonk: 'monk',
  inkPudding: 'blackPudding',
  eyrieStaffMaster: 'monk',
  midsummerLord: 'fey-knight',
  unseenWhisperer: 'invisibleStalker',
  barrowHuskarl: 'frostGiant',
  boneMarketTallyman: 'shieldGuardian',
  dragonSwornGeneral: 'knight',
  motherRose: 'treant',
  frostGiantQueen: 'frostGiant',
  notaryEngine: 'ironGolem',
  emberBrassWarden: 'ironGolem',
};

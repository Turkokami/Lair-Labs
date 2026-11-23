// SRD 5.2.1 spells (CC-BY-4.0), cantrips to 9th level. Text is summarized in our own words; GM has final say.
import type { Ability } from './core';
import { LOW_SPELLS } from './spells-low';
import { HIGH_SPELLS } from './spells-high';

export interface Spell {
  id: string;
  name: string;
  level: number; // 0 = cantrip
  school: string;
  time: string;
  range: string;
  conc?: boolean;
  ritual?: boolean;
  classes: string[];
  attack?: 'melee' | 'ranged';
  save?: Ability;
  damage?: string; // base dice (cantrips: at level 1-4)
  damage5?: string; // cantrip dice at level 5+
  upcast?: string; // extra dice per slot level above base
  dmgType?: string;
  heal?: string; // healing dice; + spellcasting mod added
  healMod?: boolean;
  /** A burst centred on a point you pick: everyone inside makes the save. Radius in feet. */
  burst?: number;
  text: string;
}

const B = 'bard', C = 'cleric', D = 'druid', P = 'paladin', R = 'ranger', S = 'sorcerer', K = 'warlock', W = 'wizard';

export const SPELLS: Spell[] = [
  // Cantrips
  { id: 'acidSplash', name: 'Acid Splash', level: 0, school: 'Evocation', time: '1 action', range: '60 ft', classes: [S, W], save: 'dex', damage: '1d6', damage5: '2d6', dmgType: 'acid', text: 'Up to two creatures within 5 ft of each other make a Dex save or take acid damage.' },
  { id: 'chillTouch', name: 'Chill Touch', level: 0, school: 'Necromancy', time: '1 action', range: 'Touch', classes: [S, K, W], attack: 'melee', damage: '1d10', damage5: '2d10', dmgType: 'necrotic', text: "On a hit the target can't regain HP until your next turn." },
  { id: 'druidcraft', name: 'Druidcraft', level: 0, school: 'Transmutation', time: '1 action', range: '30 ft', classes: [D], text: 'Small nature effects: predict weather, bloom a flower, light or snuff a small flame.' },
  { id: 'eldritchBlast', name: 'Eldritch Blast', level: 0, school: 'Evocation', time: '1 action', range: '120 ft', classes: [K], attack: 'ranged', damage: '1d10', dmgType: 'force', text: 'A beam of crackling energy. You fire two beams at level 5, three at 11 and four at 17 (roll each separately).' },
  { id: 'fireBolt', name: 'Fire Bolt', level: 0, school: 'Evocation', time: '1 action', range: '120 ft', classes: [S, W], attack: 'ranged', damage: '1d10', damage5: '2d10', dmgType: 'fire', text: 'Hurl a mote of fire; ignites flammable objects not worn or carried.' },
  { id: 'guidance', name: 'Guidance', level: 0, school: 'Divination', time: '1 action', range: 'Touch', conc: true, classes: [C, D], text: 'Choose a skill; the target adds 1d4 to one check with it within 1 minute.' },
  { id: 'light', name: 'Light', level: 0, school: 'Evocation', time: '1 action', range: 'Touch', classes: [B, C, S, W], text: 'An object sheds bright light in a 20-ft radius and dim light 20 ft beyond for 1 hour.' },
  { id: 'mageHand', name: 'Mage Hand', level: 0, school: 'Conjuration', time: '1 action', range: '30 ft', classes: [B, S, K, W], text: 'A spectral hand that can manipulate objects up to 10 lb.' },
  { id: 'minorIllusion', name: 'Minor Illusion', level: 0, school: 'Illusion', time: '1 action', range: '30 ft', classes: [B, S, K, W], text: 'Create a sound or a still image for 1 minute.' },
  { id: 'poisonSpray', name: 'Poison Spray', level: 0, school: 'Necromancy', time: '1 action', range: '30 ft', classes: [D, S, K, W], attack: 'ranged', damage: '1d12', damage5: '2d12', dmgType: 'poison', text: 'Project a puff of toxic spray at a creature.' },
  { id: 'prestidigitation', name: 'Prestidigitation', level: 0, school: 'Transmutation', time: '1 action', range: '10 ft', classes: [B, S, K, W], text: 'Minor magical tricks: clean, flavor, warm, mark, small sensory effects.' },
  { id: 'produceFlame', name: 'Produce Flame', level: 0, school: 'Conjuration', time: 'Bonus action', range: 'Self', classes: [D], attack: 'ranged', damage: '1d8', damage5: '2d8', dmgType: 'fire', text: 'A flame in your hand sheds light; you can hurl it (60 ft) as a magic action.' },
  { id: 'rayOfFrost', name: 'Ray of Frost', level: 0, school: 'Evocation', time: '1 action', range: '60 ft', classes: [S, W], attack: 'ranged', damage: '1d8', damage5: '2d8', dmgType: 'cold', text: "On a hit, the target's speed drops 10 ft until your next turn." },
  { id: 'sacredFlame', name: 'Sacred Flame', level: 0, school: 'Evocation', time: '1 action', range: '60 ft', classes: [C], save: 'dex', damage: '1d8', damage5: '2d8', dmgType: 'radiant', text: 'Flame descends on a creature; no benefit from cover against the save.' },
  { id: 'shillelagh', name: 'Shillelagh', level: 0, school: 'Transmutation', time: 'Bonus action', range: 'Self', classes: [D], text: 'Your club or staff uses your spellcasting ability and deals a d8 (d10 at level 5) for 1 minute.' },
  { id: 'shockingGrasp', name: 'Shocking Grasp', level: 0, school: 'Evocation', time: '1 action', range: 'Touch', classes: [S, W], attack: 'melee', damage: '1d8', damage5: '2d8', dmgType: 'lightning', text: "On a hit the target can't make opportunity attacks until its next turn." },
  { id: 'spareTheDying', name: 'Spare the Dying', level: 0, school: 'Necromancy', time: '1 action', range: '15 ft', classes: [C, D], text: 'A creature at 0 HP becomes stable.' },
  { id: 'thaumaturgy', name: 'Thaumaturgy', level: 0, school: 'Transmutation', time: '1 action', range: '30 ft', classes: [C], text: 'Minor wonders: booming voice, flickering flames, tremors, slamming doors.' },
  { id: 'viciousMockery', name: 'Vicious Mockery', level: 0, school: 'Enchantment', time: '1 action', range: '60 ft', classes: [B], save: 'wis', damage: '1d6', damage5: '2d6', dmgType: 'psychic', text: 'On a failed save the target also has disadvantage on its next attack roll.' },
  // 1st level
  { id: 'bless', name: 'Bless', level: 1, school: 'Enchantment', time: '1 action', range: '30 ft', conc: true, classes: [C, P], text: 'Up to three creatures add 1d4 to attack rolls and saves for 1 minute.' },
  { id: 'burningHands', name: 'Burning Hands', level: 1, school: 'Evocation', time: '1 action', range: 'Self (15-ft cone)', classes: [S, W], save: 'dex', damage: '3d6', upcast: '1d6', dmgType: 'fire', text: 'Creatures in the cone take fire damage (half on a save).' },
  { id: 'charmPerson', name: 'Charm Person', level: 1, school: 'Enchantment', time: '1 action', range: '30 ft', classes: [B, D, S, K, W], save: 'wis', text: 'A humanoid is charmed by you for 1 hour (advantage on the save if you are fighting it).' },
  { id: 'command', name: 'Command', level: 1, school: 'Enchantment', time: '1 action', range: '60 ft', classes: [B, C, P], save: 'wis', text: 'Speak a one-word command (Approach, Drop, Flee, Grovel, Halt); the target obeys on its next turn on a failed save.' },
  { id: 'cureWounds', name: 'Cure Wounds', level: 1, school: 'Abjuration', time: '1 action', range: 'Touch', classes: [B, C, D, P, R], heal: '2d8', upcast: '2d8', healMod: true, text: 'A creature you touch regains HP.' },
  { id: 'detectMagic', name: 'Detect Magic', level: 1, school: 'Divination', time: '1 action', range: 'Self', conc: true, ritual: true, classes: [B, C, D, P, R, S, K, W], text: 'Sense magic within 30 ft for 10 minutes.' },
  { id: 'divineFavor', name: 'Divine Favor', level: 1, school: 'Transmutation', time: 'Bonus action', range: 'Self', classes: [P], text: 'Your weapon hits deal an extra 1d4 radiant damage for 1 minute.' },
  { id: 'entangle', name: 'Entangle', level: 1, school: 'Conjuration', time: '1 action', range: '90 ft', conc: true, classes: [D, R], save: 'str', text: 'Grasping plants fill a 20-ft square; creatures there are restrained on a failed Str save.' },
  { id: 'faerieFire', name: 'Faerie Fire', level: 1, school: 'Evocation', time: '1 action', range: '60 ft', conc: true, classes: [B, D], save: 'dex', text: "Creatures in a 20-ft cube are outlined in light; attacks against them have advantage and they can't be invisible." },
  { id: 'featherFall', name: 'Feather Fall', level: 1, school: 'Transmutation', time: 'Reaction', range: '60 ft', classes: [B, S, W], text: 'Up to five falling creatures descend slowly and take no falling damage.' },
  { id: 'fogCloud', name: 'Fog Cloud', level: 1, school: 'Conjuration', time: '1 action', range: '120 ft', conc: true, classes: [D, R, S, W], text: 'A 20-ft-radius sphere of fog heavily obscures the area.' },
  { id: 'goodberry', name: 'Goodberry', level: 1, school: 'Conjuration', time: '1 action', range: 'Self', classes: [D, R], text: 'Ten berries; eating one restores 1 HP and feeds a creature for a day.' },
  { id: 'guidingBolt', name: 'Guiding Bolt', level: 1, school: 'Evocation', time: '1 action', range: '120 ft', classes: [C], attack: 'ranged', damage: '4d6', upcast: '1d6', dmgType: 'radiant', text: 'The next attack roll against the target before your next turn has advantage.' },
  { id: 'healingWord', name: 'Healing Word', level: 1, school: 'Abjuration', time: 'Bonus action', range: '60 ft', classes: [B, C, D], heal: '2d4', upcast: '2d4', healMod: true, text: 'A creature you can see regains HP.' },
  { id: 'hellishRebuke', name: 'Hellish Rebuke', level: 1, school: 'Evocation', time: 'Reaction', range: '60 ft', classes: [K], save: 'dex', damage: '2d10', upcast: '1d10', dmgType: 'fire', text: 'When a creature damages you, it is engulfed in flames (half on a save).' },
  { id: 'heroism', name: 'Heroism', level: 1, school: 'Enchantment', time: '1 action', range: 'Touch', conc: true, classes: [B, P], text: "A willing creature can't be frightened and gains temp HP equal to your spellcasting mod each turn." },
  { id: 'huntersMark', name: "Hunter's Mark", level: 1, school: 'Divination', time: 'Bonus action', range: '90 ft', conc: true, classes: [R], damage: '1d6', dmgType: 'force', text: 'Mark a creature: your weapon hits deal +1d6 force damage to it and you have advantage to find it.' },
  { id: 'inflictWounds', name: 'Inflict Wounds', level: 1, school: 'Necromancy', time: '1 action', range: 'Touch', classes: [C], save: 'con', damage: '2d10', upcast: '1d10', dmgType: 'necrotic', text: 'A creature you touch takes necrotic damage (half on a save).' },
  { id: 'mageArmor', name: 'Mage Armor', level: 1, school: 'Abjuration', time: '1 action', range: 'Touch', classes: [S, W], text: "An unarmored creature's base AC becomes 13 + Dex for 8 hours." },
  { id: 'magicMissile', name: 'Magic Missile', level: 1, school: 'Evocation', time: '1 action', range: '120 ft', classes: [S, W], damage: '3d4+3', upcast: '1d4+1', dmgType: 'force', text: 'Three darts that always hit, each 1d4 + 1 force (one more dart per slot level above 1st).' },
  { id: 'sanctuary', name: 'Sanctuary', level: 1, school: 'Abjuration', time: 'Bonus action', range: '30 ft', classes: [C], text: 'Creatures that target the warded creature must make a Wis save or pick another target.' },
  { id: 'shield', name: 'Shield', level: 1, school: 'Abjuration', time: 'Reaction', range: 'Self', classes: [S, W], text: '+5 AC until the start of your next turn, including against the triggering attack; Magic Missile does nothing to you.' },
  { id: 'shieldOfFaith', name: 'Shield of Faith', level: 1, school: 'Abjuration', time: 'Bonus action', range: '60 ft', conc: true, classes: [C, P], text: 'A creature gains +2 AC for 10 minutes.' },
  { id: 'sleep', name: 'Sleep', level: 1, school: 'Enchantment', time: '1 action', range: '60 ft', conc: true, classes: [B, S, W], save: 'wis', text: 'Creatures in a 5-ft-radius sphere make Wis saves or become incapacitated, then fall unconscious if they fail again.' },
  { id: 'thunderwave', name: 'Thunderwave', level: 1, school: 'Evocation', time: '1 action', range: 'Self (15-ft cube)', classes: [B, D, S, W], save: 'con', damage: '2d8', upcast: '1d8', dmgType: 'thunder', text: 'Creatures in the cube take thunder damage and are pushed 10 ft (half and no push on a save).' },
  // 2nd level
  { id: 'aid', name: 'Aid', level: 2, school: 'Abjuration', time: '1 action', range: '30 ft', classes: [B, C, D, P, R], text: 'Up to three creatures gain +5 HP maximum and current HP for 8 hours.' },
  { id: 'blur', name: 'Blur', level: 2, school: 'Illusion', time: '1 action', range: 'Self', conc: true, classes: [S, W], text: 'Attack rolls against you have disadvantage for 1 minute.' },
  { id: 'darkness', name: 'Darkness', level: 2, school: 'Evocation', time: '1 action', range: '60 ft', conc: true, classes: [S, K, W], text: 'Magical darkness fills a 15-ft-radius sphere.' },
  { id: 'holdPerson', name: 'Hold Person', level: 2, school: 'Enchantment', time: '1 action', range: '60 ft', conc: true, classes: [B, C, D, S, K, W], save: 'wis', text: 'A humanoid is paralyzed; it repeats the save at the end of each of its turns.' },
  { id: 'invisibility', name: 'Invisibility', level: 2, school: 'Illusion', time: '1 action', range: 'Touch', conc: true, classes: [B, S, K, W], text: 'A creature is invisible for 1 hour or until it attacks, deals damage or casts a spell.' },
  { id: 'lesserRestoration', name: 'Lesser Restoration', level: 2, school: 'Abjuration', time: 'Bonus action', range: 'Touch', classes: [B, C, D, P, R], text: 'End one condition: blinded, deafened, paralyzed or poisoned.' },
  { id: 'mistyStep', name: 'Misty Step', level: 2, school: 'Conjuration', time: 'Bonus action', range: 'Self', classes: [S, K, W], text: 'Teleport up to 30 ft to a space you can see.' },
  { id: 'moonbeam', name: 'Moonbeam', level: 2, school: 'Evocation', time: '1 action', range: '120 ft', conc: true, classes: [D], save: 'con', damage: '2d10', upcast: '1d10', dmgType: 'radiant', text: 'A 5-ft-radius cylinder of light damages creatures that enter or start there (half on a save).' },
  { id: 'passWithoutTrace', name: 'Pass without Trace', level: 2, school: 'Abjuration', time: '1 action', range: 'Self', conc: true, classes: [D, R], text: 'You and allies within 30 ft get +10 to Stealth checks for 1 hour.' },
  { id: 'prayerOfHealing', name: 'Prayer of Healing', level: 2, school: 'Abjuration', time: '10 minutes', range: '30 ft', classes: [C, P], heal: '2d8', upcast: '1d8', healMod: true, text: 'Up to five creatures regain HP and get a free short-rest benefit.' },
  { id: 'scorchingRay', name: 'Scorching Ray', level: 2, school: 'Evocation', time: '1 action', range: '120 ft', classes: [S, W], attack: 'ranged', damage: '2d6', dmgType: 'fire', text: 'Three rays; make a separate attack roll for each (one more ray per slot level above 2nd).' },
  { id: 'shatter', name: 'Shatter', level: 2, school: 'Evocation', time: '1 action', range: '60 ft', classes: [B, S, K, W], save: 'con', damage: '3d8', upcast: '1d8', dmgType: 'thunder', burst: 10, text: 'A 10-ft-radius sphere of ringing noise (half on a save).' },
  { id: 'spiritualWeapon', name: 'Spiritual Weapon', level: 2, school: 'Evocation', time: 'Bonus action', range: '60 ft', conc: true, classes: [C], attack: 'melee', damage: '1d8', upcast: '1d8', dmgType: 'force', text: 'A floating weapon; bonus action to move it and attack (add your spellcasting mod to damage).' },
  { id: 'web', name: 'Web', level: 2, school: 'Conjuration', time: '1 action', range: '60 ft', conc: true, classes: [S, W], save: 'dex', text: 'A 20-ft cube of sticky webs; creatures are restrained on a failed Dex save.' },
  // 3rd level
  { id: 'callLightning', name: 'Call Lightning', level: 3, school: 'Conjuration', time: '1 action', range: '120 ft', conc: true, classes: [D], save: 'dex', damage: '3d10', upcast: '1d10', dmgType: 'lightning', text: 'A storm cloud; each turn call a bolt on a 5-ft-radius area (half on a save).' },
  { id: 'counterspell', name: 'Counterspell', level: 3, school: 'Abjuration', time: 'Reaction', range: '60 ft', classes: [S, K, W], text: 'The caster of a spell makes a Con save or the spell fails (the slot is not spent).' },
  { id: 'dispelMagic', name: 'Dispel Magic', level: 3, school: 'Abjuration', time: '1 action', range: '120 ft', classes: [B, C, D, P, R, S, K, W], text: 'End spells of 3rd level or lower on a target; higher ones need a check.' },
  { id: 'fireball', name: 'Fireball', level: 3, school: 'Evocation', time: '1 action', range: '150 ft', classes: [S, W], save: 'dex', damage: '8d6', upcast: '1d6', dmgType: 'fire', burst: 20, text: 'A 20-ft-radius explosion of flame (half on a save).' },
  { id: 'fly', name: 'Fly', level: 3, school: 'Transmutation', time: '1 action', range: 'Touch', conc: true, classes: [S, K, W], text: 'A creature gains a fly speed of 60 ft for 10 minutes.' },
  { id: 'haste', name: 'Haste', level: 3, school: 'Transmutation', time: '1 action', range: '30 ft', conc: true, classes: [S, W], text: 'Double speed, +2 AC, advantage on Dex saves and an extra limited action; lethargic when it ends.' },
  { id: 'hypnoticPattern', name: 'Hypnotic Pattern', level: 3, school: 'Illusion', time: '1 action', range: '120 ft', conc: true, classes: [B, S, K, W], save: 'wis', text: 'Creatures in a 30-ft cube are charmed and incapacitated on a failed save.' },
  { id: 'lightningBolt', name: 'Lightning Bolt', level: 3, school: 'Evocation', time: '1 action', range: 'Self (100-ft line)', classes: [S, W], save: 'dex', damage: '8d6', upcast: '1d6', dmgType: 'lightning', text: 'A 100-ft line of lightning (half on a save).' },
  { id: 'massHealingWord', name: 'Mass Healing Word', level: 3, school: 'Abjuration', time: 'Bonus action', range: '60 ft', classes: [B, C], heal: '2d4', upcast: '1d4', healMod: true, text: 'Up to six creatures you can see regain HP.' },
  { id: 'revivify', name: 'Revivify', level: 3, school: 'Necromancy', time: '1 action', range: 'Touch', classes: [C, D, P, R], text: 'A creature that died within the last minute returns with 1 HP (needs a 300 gp diamond).' },
  { id: 'spiritGuardians', name: 'Spirit Guardians', level: 3, school: 'Conjuration', time: '1 action', range: 'Self (15 ft)', conc: true, classes: [C], save: 'wis', damage: '3d8', upcast: '1d8', dmgType: 'radiant', text: 'Spirits around you halve enemy speed and damage enemies in the area (half on a save).' },
];
SPELLS.push(...LOW_SPELLS, ...HIGH_SPELLS);
SPELLS.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
const BY_ID = new Map(SPELLS.map((s) => [s.id, s]));
export const spellById = (id: string) => BY_ID.get(id);
export const spellsFor = (classId: string, maxLevel: number) =>
  SPELLS.filter((s) => s.classes.includes(classId) && s.level <= maxLevel);

/** How many dice a cantrip rolls: 1, then 2 at level 5, 3 at 11, 4 at 17. */
export const cantripTier = (charLevel: number) => (charLevel >= 17 ? 4 : charLevel >= 11 ? 3 : charLevel >= 5 ? 2 : 1);
/** Damage dice for a spell cast with a given slot (cantrips grow at levels 5, 11 and 17). */
export function spellDamage(sp: Spell, charLevel: number, slot: number) {
  if (sp.level === 0) {
    if (!sp.damage) return undefined;
    if (!sp.damage5) return sp.damage; // e.g. Eldritch Blast fires more beams instead
    const m = /^(\d*)d(\d+)$/.exec(sp.damage);
    if (!m) return charLevel >= 5 ? sp.damage5 : sp.damage;
    return `${(m[1] ? parseInt(m[1], 10) : 1) * cantripTier(charLevel)}d${m[2]}`;
  }
  if (!sp.damage) return undefined;
  if (!sp.upcast || slot <= sp.level) return sp.damage;
  const extra = sp.upcast.replace(/^(\d*)d(\d+)$/, (_, n, s) => `${(n ? parseInt(n, 10) : 1) * (slot - sp.level)}d${s}`);
  return `${sp.damage}+${extra}`;
}
/** Healing dice for a spell cast with a given slot, before the caster's modifier. */
export function spellHeal(sp: Spell, slot: number) {
  if (!sp.heal) return undefined;
  if (sp.level > 0 && slot > sp.level && sp.upcast) {
    const m = /^(\d*)d(\d+)$/.exec(sp.upcast);
    if (m) return `${sp.heal}+${(m[1] ? parseInt(m[1], 10) : 1) * (slot - sp.level)}d${m[2]}`;
  }
  return sp.heal;
}
/** Range in feet ("120 ft", "Touch" = 5, "Self" = 0). */
export function spellRangeFt(sp: Spell) {
  const m = /(\d+)\s*ft/.exec(sp.range);
  if (/^touch/i.test(sp.range)) return 5;
  if (/^self/i.test(sp.range)) return 0;
  return m ? parseInt(m[1], 10) : 30;
}

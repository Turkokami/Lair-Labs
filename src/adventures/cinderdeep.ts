// The Cinderdeep Vault: a dungeon delve for four heroes of level 9 to 10.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder } from './builder';
import type { Adventure } from './types';

function cinderdeepVault() {
  const b = new MapBuilder('adv-cinderdeep', 'The Cinderdeep Vault', 80, 64, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'dungeon-slab' });

  // the Fireflow: a lava channel that splits the vault in two, with three crossings
  b.lava(34, 0, 4, 64);
  b.props_('lava-river', [[34, 16], [34, 28], [34, 36], [34, 58]]);
  for (const y of [16, 30, 44, 58]) b.light(35, y, 20, 30, '#ff7a2e');

  // ----- west bank: the dwarves' halls -----
  b.room('Ashen gate', 2, 52, 12, 9, { mat: 'stone-flagstone', read: 'Two stone dwarves, each sixty feet tall, hold up the mountain on either side of a pair of bronze doors. One door hangs open, scorched black, and hot wind blows out of it.', gm: 'The way in. The rune over the door reads "Emberfall keeps the fire" in Dwarvish. The doors were burned open from inside.' });
  b.prop('doors-grand-frame', 2, 60).props_('statue-tall-knight', [[3, 53], [12, 53]]).prop('rubble-pile', 9, 58).prop('skeleton-lying', 6, 55);
  b.start(4, 56, 3, 3);
  b.hall(14, 56, 15, 56, 2).door(13, 56, 'e', 'closed', 'door-double').door(13, 57, 'e', 'closed', 'door-double');

  b.room('Hall of Wardens', 16, 46, 16, 14, { read: 'A long hall of black pillars. At its far end stands a stone dwarf in armour, twice as tall as a man, with a hammer resting on its shoulder. Its eyes open, glowing orange.', gm: 'The Warden (stone golem) still obeys the old command: no one passes without the gate-word. Two azer are chained to it as its "keepers" by the dragon. The gate-word ("Hearth") is on Bruna\'s map; saying it stops the golem, but not the azer.' });
  b.props_('pillar-square', [[18, 48], [18, 52], [18, 56], [29, 48], [29, 52], [29, 56]]).prop('statue-tall-knight', 23, 47).props_('brazier-everburning', [[20, 47], [27, 47]]).prop('wall-chains', 24, 49).prop('trap-rune-threshold', 24, 58, 0, { gm: true });
  b.light(20, 47, 15, 20).light(27, 47, 15, 20);
  b.encounter('The Warden', [16, 46, 16, 14], [['stone-golem', 1], ['azer', 2]], 'moderate');

  b.room('Kennels', 2, 36, 12, 12, { mat: 'stone-cobble', read: 'Iron cages line the walls. The bars are bent outward. Bones crack underfoot, and something growls with a voice like a bellows.', gm: 'Hell hounds the dragon brought, and magmins that drifted up from the lava. The magmins burst into flame when they die: careful near the straw.' });
  b.hall(14, 46, 15, 46, 2).door(13, 46, 'e', 'closed', 'door-iron').door(13, 47, 'e', 'closed', 'door-iron');
  b.props_('cage', [[3, 37], [6, 37], [9, 37], [12, 37]]).props_('bones', [[5, 42], [9, 45]]).prop('straw-bed', 4, 45).prop('water-trough', 11, 42).prop('magma-vent', 7, 40);
  b.encounter('Kennels of the hounds', [2, 36, 12, 12], [['hell-hound', 6], ['magmin', 6]], 'low');

  b.room('Hall of Ale and Song', 2, 18, 12, 12, { mat: 'wood-planks-dark', read: 'Long tables, a stage for musicians and a wall of great kegs. Dust lies thick over everything except one table, where someone has eaten very recently.', gm: 'Safe. Bruna camped here on her first trip. One keg still holds good dwarf ale (each drink grants 1d6 temporary hit points). A short rest is possible here.' });
  b.hall(7, 30, 7, 35, 1).door(7, 29, 's', 'closed').door(7, 35, 's', 'closed');
  b.props_('feast-hall-table', [[4, 21], [4, 25]]).prop('keg-rack', 12, 19).prop('barrel-stack', 12, 23).prop('bench-long', 8, 19).prop('hearth-grand', 2, 27).light(3, 27, 10, 20);

  b.cave('Old mine', 9, 9, 7, 6, { seed: 21, mat: 'cave-floor', read: 'Rails run into tunnels that go nowhere: the rock has closed over them. Ore carts stand where the miners left them.', gm: 'Three xorn have been eating the silver seams and the bones of the miners. They will trade: offer them metal (50 gp worth each) and they go quiet. Otherwise they come up out of the floor.' });
  b.tunnel([[8, 14], [7, 18]], 2, { seed: 22 });
  b.props_('mine-rails', [[6, 8], [7, 8], [8, 8], [9, 8], [10, 8]]).prop('mine-cart', 11, 8).prop('ore-pile', 5, 11).prop('pickaxes', 13, 11).prop('cave-crystals', 14, 6).light(14, 6, 5, 10, '#9fd3ff');
  b.encounter('Metal-eaters', [2, 3, 15, 13], [['xorn', 3]], 'low');

  b.room('Runehall', 20, 2, 12, 10, { mat: 'marble', read: 'The walls are covered floor to ceiling with carved runes. In the middle of the floor, five stone discs, each carved with a different rune, turn on iron pins.', gm: 'The vault\'s lock. Turning the five discs to the thane\'s oath (handout from the tomb, or DC 18 Intelligence (History) to work it out from the walls) unlocks the Vault door. A wrong order lets out a gout of fire: DC 17 Dexterity save, 28 (8d6) fire damage, half on a success.' });
  b.tunnel([[15, 7], [19, 6]], 2, { seed: 23 });
  b.props_('rune-stone', [[22, 6], [24, 6], [26, 6], [28, 6], [25, 4]]).props_('rune-tiles', [[23, 9], [27, 9]]).prop('lectern-dais', 21, 3).prop('trap-fire-statue', 30, 3, 0, { gm: true }).prop('scroll-rack', 30, 9);
  b.light(25, 6, 10, 20, '#ffd27a');

  b.room('The Great Forge', 16, 22, 18, 18, { mat: 'stone-flagstone', read: 'The heart of Emberfall: a hall that opens on one side straight onto the lava. A dozen forges blaze. Fire-skinned smiths with bronze beards hammer chains on giant anvils, and two great serpents of flame coil around the room, watching them work.', gm: 'Seven azer and two salamanders. The azer are slaves: their forgemaster Kesh will call a truce if the heroes promise to free them (break the dragon\'s brand on Kesh\'s anvil: 20 damage to it). Then only the salamanders fight. The open side drops into the lava channel.' });
  b.hall(14, 25, 15, 25, 1).door(13, 25, 'e', 'closed');
  b.hall(26, 12, 26, 21, 1).door(26, 11, 's', 'closed').door(26, 21, 's', 'closed', 'door-iron');
  b.hall(24, 40, 24, 45, 1).door(24, 39, 's', 'closed', 'door-iron').door(24, 45, 's', 'open', 'door-iron');
  b.props_('forge', [[18, 24], [22, 24], [26, 24], [18, 33], [22, 33]]).props_('anvil', [[20, 27], [24, 27], [28, 27], [20, 36], [24, 36]]).prop('water-trough', 30, 30).props_('weapon-rack', [[17, 38], [21, 38]]).prop('chains-hanging', 28, 34).prop('ore-pile', 31, 23);
  for (const [x, y] of [[19, 25], [23, 25], [27, 25], [19, 34]]) b.light(x, y, 10, 20, '#ff9a3c');
  b.encounter('Slaves of the forge', [16, 22, 18, 18], [['azer', 7], ['salamander', 2]], 'moderate');

  // the lava tube under the gate: a hidden loop to the giant's camp
  b.tunnel([[9, 61], [24, 62], [33, 62]], 1, { seed: 24 });
  b.floor(34, 62, 4, 1, 'stone-cobble');
  b.tunnel([[38, 62], [44, 60]], 1, { seed: 25 });
  b.door(9, 60, 's', 'secret').note(10, 61, 'Lava tube: a 2 ft ledge across the Fireflow at the far end (DC 14 Acrobatics or slip into the lava).');
  b.props_('steam-vent', [[18, 62], [28, 62]]).prop('trap-vent-grate', 22, 62, 0, { gm: true });

  // ----- crossings over the Fireflow -----
  b.hall(32, 6, 33, 6, 2).floor(34, 6, 4, 2, 'wood-planks').hall(38, 6, 39, 6, 2);
  b.area('The Chain Bridge', [[32, 6, 8, 2]], { read: 'A bridge of iron plates hung on chains crosses the lava. It sways, and the plates are hot enough to cook on.', gm: 'Each creature crossing makes a DC 12 Dexterity save or is knocked prone by a swing; prone on the bridge takes 5 (1d10) fire damage each turn.', label: [35, 6] });
  b.prop('bridge-rope', 35, 6, 90);
  b.hall(32, 50, 33, 50, 2).floor(34, 50, 4, 2, 'stone-cobble').rubble(36, 50, 1, 2).hall(38, 50, 39, 50, 2);
  b.area('The Broken Bridge', [[32, 50, 8, 2]], { read: 'A stone bridge, cracked through the middle. Far below, the lava glows.', gm: 'The crack is difficult ground. A creature over 500 lb (the stone golem, the giant) breaks it: everyone on it makes a DC 15 Dexterity save or falls into the lava.', label: [35, 51] });
  b.door(31, 50, 'e', 'closed').door(31, 51, 'e', 'closed');

  // ----- east bank: what the dragon took -----
  b.room('Golem foundry', 40, 2, 16, 10, { read: 'Moulds the size of a man line the walls, and half-made stone soldiers lie on tables. One of them, made of baked red clay, sits up.', gm: 'A clay golem left unfinished: it fights clumsily (disadvantage on its first attack each turn) but heals in the lava. Moulds hold the plans for the Warden; a smith could use them.' });
  b.door(39, 6, 'e', 'closed', 'door-iron').door(39, 7, 'e', 'closed', 'door-iron');
  b.props_('table-long', [[42, 4], [42, 8], [48, 4]]).props_('statue-knight', [[52, 3], [54, 3], [52, 9]]).prop('cauldron', 49, 8).prop('forge', 53, 6).light(54, 7, 10, 20, '#ff9a3c');
  b.encounter('The unfinished golem', [40, 2, 16, 10], [['clay-golem', 1]], 'low');

  b.room('Tomb of the Thanes', 60, 2, 18, 12, { mat: 'marble', read: 'Stone thanes lie in rows with their axes on their chests. Cold air, the first cold air in Cinderdeep. Something in the dark whispers your names.', gm: 'Three wraiths, the thanes\' honour guard, gone wrong. Thane Odvar\'s ghost appears when they fall: he gives the oath for the Runehall (handout) and shows the hidden way to the vault (secret door in the south wall, DC 18 Perception).' });
  b.hall(56, 6, 59, 6, 1).door(55, 6, 'e', 'closed').door(59, 6, 'e', 'closed', 'door-double');
  b.props_('sarcophagus-row', [[62, 4], [62, 9], [70, 4], [70, 9]]).prop('tomb-niche', 76, 7).props_('candle-stand-tall', [[61, 3], [76, 3], [61, 12], [76, 12]]).light(68, 7, 10, 20, '#a8c8ff');
  b.encounter('The honour guard', [60, 2, 18, 12], [['wraith', 3]], 'low');

  b.room('The Sealed Vault', 64, 17, 14, 10, { mat: 'marble', read: 'Rune-lit shelves of gold, gems and finely made arms, untouched for three hundred years. In the middle, on a plinth, stands an anvil of blue-black metal humming with cold.', gm: 'The Heartanvil. While it sits here and its runes are unbroken, the mountain sleeps. The dragon has been cracking its runes from outside the vault door to force it open, which is why the volcano is waking. Touching the Heartanvil with a lit forge hammer (from the Great Forge) relights its runes and stops the quakes.' });
  b.hall(70, 14, 70, 16, 1).door(70, 13, 's', 'secret');
  b.hall(70, 27, 70, 39, 2).door(70, 26, 's', 'locked', 'door-iron').door(71, 26, 's', 'locked', 'door-iron');
  b.prop('sword-in-stone', 70, 21).props_('treasure-pile', [[65, 18], [76, 18], [65, 25], [76, 25]]).props_('rune-weapon-rack', [[67, 18], [73, 18]]).prop('jewelry-box', 66, 22).prop('crown-cushion', 75, 22).prop('gem-bowl', 72, 25);
  b.light(70, 21, 15, 25, '#7fb8ff');

  b.cave('Salamander nest', 52, 30, 11, 8, { seed: 26, read: 'A cave around a lake of slow, bright lava. Long red shapes swim in it like eels in a pond, and a pillar of living fire turns slowly on the shore.', gm: 'Three salamanders guard their eggs (glowing red stones in the lava, worth 250 gp each to a collector, if anyone can carry them). A fire elemental drifts with them. The lake gives off a heat haze: ranged attacks across it have disadvantage.' });
  b.lava(47, 27, 10, 6);
  b.tunnel([[48, 11], [50, 22]], 2, { seed: 27 });
  b.tunnel([[48, 37], [47, 46]], 2, { seed: 28 });
  b.tunnel([[61, 34], [66, 40]], 2, { seed: 29 });
  b.props_('lava-pool', [[49, 28], [53, 29]]).props_('magma-vent', [[44, 33], [59, 26]]).prop('crystal-spire', 58, 35);
  b.encounter('Salamander nest', [41, 22, 22, 16], [['salamander', 3], ['fire-elemental', 1]], 'moderate');

  b.room("Giant's anvil", 40, 46, 18, 14, { mat: 'stone-cobble', read: 'A camp of looted furs and dwarf shields, around a giant\'s anvil the size of a wagon. A giant with skin like coal and a beard of fire is sharpening a sword as long as a canoe.', gm: 'Gorm Cinderjaw, a fire giant the dragon hired to keep the forge running, and three hell hounds. Gorm is paid in gold and hates the dragon\'s manners. Pay or out-bluff him (DC 18 Persuasion or Deception, or 1,000 gp) and he leaves, taking the hounds.' });
  b.door(39, 50, 'e', 'open').door(39, 51, 'e', 'open');
  b.prop('anvil', 48, 52).prop('forge', 52, 48).props_('loot-sacks', [[42, 57], [44, 57]]).prop('bedroll', 55, 57).props_('weapon-barrel', [[41, 47], [56, 47]]).prop('campfire', 46, 55).light(53, 49, 15, 20, '#ff9a3c');
  b.encounter("Gorm's camp", [40, 46, 18, 14], [['fire-giant', 1], ['hell-hound', 3]], 'moderate');

  b.room('The Crucible', 60, 40, 19, 20, { mat: 'dungeon-slab', read: 'The vault\'s great antechamber has become a dragon\'s den. Gold is heaped against the walls, and lava pours from a broken pipe into a channel round the floor. On the biggest heap lies a red dragon, scratching at the vault door with one claw, patiently, the way a cat waits at a mousehole.', gm: 'Vharyxa the Kindled (young red dragon) with two salamanders. She fights in the air above the lava channel. When she drops below half her hit points she bargains: half her hoard for her life. Then she tries to fly up the smoke shaft and escape.' });
  b.hall(58, 52, 59, 52, 2).door(57, 52, 'e', 'closed', 'door-double').door(57, 53, 'e', 'closed', 'door-double');
  b.door(70, 39, 's', 'open').door(71, 39, 's', 'open');
  b.lava(60, 58, 18, 1).lava(77, 41, 1, 17);
  b.prop('dragon-hoard', 68, 48).props_('coins-large', [[62, 43], [74, 54]]).props_('coin-stacks', [[64, 56], [75, 44]]).prop('statue-dragon', 63, 50).props_('pillar-broken', [[62, 46], [75, 49]]).prop('magma-vent', 70, 56).prop('ceiling-rubble', 66, 54);
  b.light(69, 49, 20, 30, '#ff7a2e');
  b.encounter('Vharyxa the Kindled', [60, 40, 19, 20], [['young-red-dragon', 1], ['salamander', 2]], 'high');
  return b.build();
}

export const CINDERDEEP: Adventure = {
  id: 'cinderdeep',
  title: 'The Cinderdeep Vault',
  tagline: 'A dwarf forge-vault inside a waking volcano, and the young red dragon who moved in.',
  levels: '9-10',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['dungeon', 'high level', 'fire', 'dragon', 'traps'],
  pitch:
    'For three hundred years the dwarves of Emberfall kept the mountain Cinderdeep asleep with a single anvil. Then the dwarves were gone, and the mountain stayed quiet anyway. A month ago it started to shake. The town of Ashby, in its shadow, has three days before the old dwarf songs say the fire comes down.',
  secret:
    'The Heartanvil, sealed in the deepest vault, holds the volcano asleep with its runes. A year ago a young red dragon, Vharyxa the Kindled, moved into the vault\'s antechamber. She cannot open the vault door, so she is cracking the runes on it one by one, and every rune she breaks wakes the mountain a little more. She has enslaved the azer smiths who stayed behind, hired a fire giant and filled the halls with hounds. The vault\'s lock is in the Runehall; its key words are in the oath of the last thane, whose ghost waits in the tomb.',
  hooks: [
    'Bruna Vell, the last dwarf of Emberfall\'s line, hires the heroes: 5,000 gp and first pick of the vault for getting her to the Heartanvil.',
    'Ashby\'s council begs for help: the quakes are getting closer together, and lava has already reached the high pastures.',
    'A dragon has been seen over the mountain, and a sage wants proof (and a scale, for 1,000 gp).',
  ],
  tips: [
    'Use a quake clock: start at 12. Every long fight, rest or hour of play takes one off. At 6, lava floods the lowest halls (the lava tube and the Kennels). At 0, the eruption begins and the heroes must flee.',
    'Every crossing of the Fireflow is a choice: the swinging Chain Bridge, the cracked stone bridge, or the hidden ledge in the lava tube.',
    'Many fights can be talked down: the azer want freedom, the xorn want metal, and the fire giant wants money. Reward clever deals with the same XP as a win.',
    'The dragon is clever. If the heroes make a lot of noise, she sends Gorm or the salamanders first and waits.',
    'If the party is short of a level, drop one salamander from the dragon\'s fight.',
    'Remind the players of the heat: away from the Ale Hall, a long rest costs a level of exhaustion unless they have fire resistance or cold magic.',
  ],
  npcs: [
    {
      id: 'pf_brunavell', name: 'Bruna Vell', title: 'last heir of Emberfall', kind: 'npc', art: 'hero-dwarf-fighter', shared: true,
      wants: 'The Heartanvil relit and her family\'s name spoken again.', knows: 'The gate-word, the layout of the western halls and that the vault lock is in the Runehall.',
      voice: 'Loud, proud, sings when nervous. Calls everyone "lad", whoever they are.', appearance: 'Stocky, grey-braided, in old scale armour that is too big for her and a helm with one horn missing.',
      backstory: 'Her great-grandmother was the thane\'s cupbearer and left the night the dwarves sealed the vault. Bruna grew up on the stories and has spent her savings on this trip.',
    },
    {
      id: 'pf_kesh', name: 'Kesh', title: 'forgemaster of the azer', kind: 'monster', art: 'azer', monsterId: 'azer',
      wants: 'Freedom for his smiths and the dragon\'s brand off his anvil.', knows: 'Where the dragon sleeps, that she cannot open the vault and that Gorm is only there for the gold.',
      voice: 'Speaks in short bursts, like a hammer. Never looks away from his work.', appearance: 'An azer with a beard of white fire and a bronze collar hammered shut around his neck.',
      gmNotes: 'If freed, Kesh gives the heroes a lit forge hammer: the tool needed to relight the Heartanvil.',
    },
    {
      id: 'pf_thaneodvar', name: 'Thane Odvar', title: 'ghost of the last thane', kind: 'npc', art: 'ghost', monsterId: 'ghost',
      wants: 'The Heartanvil safe and his people remembered.', knows: 'The oath that opens the vault, and the secret door from his tomb.',
      voice: 'Slow and grand, as if every sentence is carved in stone.', appearance: 'A broad, translucent dwarf with a beard to his knees and an iron crown.',
      gmNotes: 'Appears after the wraiths fall. He will not fight. He asks the heroes to swear to relight the anvil before he tells them the oath.',
    },
    {
      id: 'pf_gorm', name: 'Gorm Cinderjaw', title: 'fire giant for hire', kind: 'monster', monsterId: 'fireGiant',
      wants: 'Gold, and an excuse to leave this job.', knows: 'The dragon\'s habits and that she has been scratching at the vault door for a year.',
      voice: 'Deep and bored, with a habit of counting coins out loud.', appearance: 'Huge, coal-skinned, with a burning beard and a sword like a canoe.',
      gmNotes: 'Fire giant stat block. Can be bought off for 1,000 gp, or out-bluffed (DC 18).',
    },
    {
      id: 'pf_vharyxa', name: 'Vharyxa the Kindled', title: 'young red dragon', kind: 'monster', art: 'dragon-red-young', monsterId: 'youngRedDragon',
      wants: 'The Heartanvil (she thinks it will make her an adult dragon at once), and everything else in the vault.', knows: 'Every way into her den, and that the mountain will erupt soon. She does not care.',
      voice: 'Sweet and amused, very polite, and every so often a hiss she cannot hide.', appearance: 'Scarlet scales cracked with glowing orange lines, horns hung with stolen dwarf rings.',
      gmNotes: 'Young red dragon stat block. Uses her breath first, then flies over the lava channel. Bargains at half hit points.',
    },
  ],
  handouts: [
    { id: 'bruna-map', title: "Bruna's map", text: 'An old dwarf map, redrawn many times: the Ashen Gate, the Hall of Wardens ("say HEARTH to the Warden"), the Great Forge, the Runehall, and across the Fireflow, the tomb and "THE VAULT".' },
    { id: 'thane-oath', title: "The thane's oath", text: 'Stone that holds, (Rune of the mountain)\nFire that serves, (Rune of the forge)\nHand that shapes, (Rune of the smith)\nWord that binds, (Rune of the oath)\nHeart that keeps. (Rune of the hearth)\nTurn the five stones in this order to open the vault.' },
    { id: 'ashby-note', title: 'Notice from Ashby', text: 'BY ORDER OF THE COUNCIL: All persons to leave the high pastures. The Mountain is waking. Anyone with knowledge of the old dwarf halls is begged to come to the town hall.' },
  ],
  chapters: [
    {
      id: 'vault', title: 'Into Cinderdeep', level: 9,
      summary: 'A huge dwarf forge-vault split by a river of lava: golems, hounds, enslaved smiths, xorn, wraiths, a fire giant and a young red dragon, with a sealed vault at the bottom.',
      goal: 'Reach the Heartanvil and relight its runes before the mountain erupts, and deal with the dragon.',
      map: cinderdeepVault,
      npcs: [
        { npc: 'pf_brunavell', x: 6, y: 57 },
        { npc: 'pf_kesh', x: 24, y: 28, hidden: true },
        { npc: 'pf_thaneodvar', x: 68, y: 7, hidden: true },
        { npc: 'pf_gorm', x: 48, y: 54, hidden: true },
        { npc: 'pf_vharyxa', x: 68, y: 51, hidden: true },
      ],
      scenes: [
        { room: 'Ashen gate', title: 'The burned doors', read: 'Hot wind pours out of the mountain. The ground shivers under your boots, and somewhere far below, something enormous laughs.', gm: 'Open in action: a quake brings down part of the gate as the heroes arrive. Start the quake clock at 12.', handout: 'bruna-map' },
        { room: 'Hall of Wardens', title: 'The Warden wakes', encounter: 'The Warden', gm: 'The gate-word stops the golem. The azer keepers still fight unless Kesh has been freed.' },
        { room: 'Kennels', title: 'The kennels', encounter: 'Kennels of the hounds', gm: 'Loud: if the fight lasts over 5 rounds, the Great Forge is warned.' },
        { room: 'Hall of Ale and Song', title: 'A safe hall', optional: true, gm: 'The only place to rest safely. Good dwarf ale.' },
        { room: 'Old mine', title: 'The metal-eaters', optional: true, encounter: 'Metal-eaters', gm: 'Fight or trade.', treasure: 'A silver seam the xorn missed: 300 gp of ore, and a dwarf miner\'s +2 war pick on a skeleton.' },
        { room: 'The Great Forge', title: 'Slaves of the forge', encounter: 'Slaves of the forge', gm: 'Free Kesh and only the salamanders fight. Kesh gives the lit forge hammer.', treasure: 'Fine dwarf arms: an adamantine breastplate, a +1 warhammer, 6 ingots of mithral (100 gp each).' },
        { room: 'Runehall', title: 'The rune lock', gm: 'The five stones open the vault door. Needs the thane\'s oath, or a DC 18 History check.', handout: 'thane-oath' },
        { room: 'The Chain Bridge', title: 'Crossing the Fireflow', gm: 'Swinging bridge, falling plates.' },
        { room: 'Golem foundry', title: 'The unfinished golem', encounter: 'The unfinished golem', gm: 'A clumsy but tough fight.', treasure: 'A manual of golems (clay), a stone of earth control... or for a simpler table, 800 gp of tools and gems.' },
        { room: 'Tomb of the Thanes', title: 'The honour guard', encounter: 'The honour guard', gm: 'Then Thane Odvar\'s ghost.', treasure: 'Thane Odvar\'s iron crown (1,500 gp, Bruna will want it).' },
        { room: 'Salamander nest', title: 'The lava lake', optional: true, encounter: 'Salamander nest', gm: 'Eggs worth money, if anyone dares.', treasure: '3 salamander eggs (250 gp each), a ring of fire resistance on a melted hand.' },
        { room: "Giant's anvil", title: "Gorm's price", encounter: "Gorm's camp", gm: 'Fight, pay or bluff.', treasure: 'Gorm\'s pay chest: 1,200 gp, a potion of fire giant strength.' },
        { room: 'The Crucible', title: 'Vharyxa the Kindled', encounter: 'Vharyxa the Kindled', gm: 'The big fight. She bargains at half hit points.', treasure: 'The dragon\'s hoard: 6,000 gp in coins, a dragon-scale cloak (cloak of protection), a flame tongue longsword, a rod of the pact keeper +1, and gems worth 2,500 gp.' },
        { room: 'The Sealed Vault', title: 'The Heartanvil', gm: 'Relight the runes with the forge hammer. The mountain sighs and goes quiet.', treasure: 'Emberfall\'s treasury: 10,000 gp, a dwarven thrower, an anvil of the hearth (Bruna\'s to keep), and whatever magic armour suits the party.' },
      ],
      wrapUp: 'With the Heartanvil burning cold again, the quakes stop. Ashby is saved, and Bruna Vell claims the halls in Emberfall\'s name.',
    },
  ],
  ending:
    'Win: the Heartanvil is relit, the dragon is dead or fled, the azer are free and Bruna starts to rebuild Emberfall (the heroes are welcome forever, and get a smith who works for cost). Lose: the mountain erupts; the heroes must race the lava out through the gate, and Ashby burns unless they warned it. Next: Vharyxa, if she escaped, has a mother. She will want to know who hurt her child.',
};

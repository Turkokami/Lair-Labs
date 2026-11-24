// Escape from Blackgate: a one-part prison break for four heroes of level 5.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder } from './builder';
import type { Adventure } from './types';

function blackgate() {
  const b = new MapBuilder('adv-blackgate-escape', 'Blackgate Prison-Mine', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'dungeon-slab' });

  // ======== the Stack: two tiers of cells cut into the mountain ========
  const cellX = [31, 35, 39, 43, 47, 51];
  const cellRow = (y: number, doorSide: 'n' | 's') => {
    for (const x of cellX) {
      b.floor(x, y, 3, 3, 'stone-flagstone');
      const edgeY = doorSide === 's' ? y + 2 : y;
      b.wallRun(x, edgeY, 3, doorSide);
      b.door(x + 1, edgeY, doorSide, 'locked', 'bars');
    }
  };

  b.room('Upper tier', 30, 4, 25, 4, {
    mat: 'stone-flagstone',
    read: 'An iron-railed gallery runs past a row of barred cells on each side. Somebody is coughing. Somebody else is counting under their breath, the same numbers over and over. Far below, through the grates, you hear the mine breathing.',
    gm: 'The women\'s row and the long-timers. Sparrow sleeps in the north cell nearest the catwalk. The east end of the gallery is a barred gate onto the Catwalk to the warden\'s tower (locked, DC 15 Thieves\' Tools; the key is on Sergeant Lusk\'s ring). A loose grate at the west end hides the old air shaft to the Silver drift (secret door, DC 14 Perception, or Febb tells them).',
  });
  cellRow(1, 's');
  cellRow(8, 'n');
  b.props_('straw-bed', [[32, 1], [36, 1], [40, 1], [44, 1], [52, 1], [32, 10], [40, 10], [48, 10]]).props_('pottery', [[33, 2], [41, 9], [49, 9]]);
  b.props_('lantern-hanging', [[34, 5], [46, 5]]).prop('wall-chains', 37, 1).prop('cobweb-corner', 53, 10).prop('notice-board', 42, 4);
  b.light(34, 5, 5, 15).light(46, 5, 5, 15);

  b.room('Lower tier', 30, 18, 25, 4, {
    mat: 'stone-flagstone',
    read: 'Wet stone, cold iron and the smell of too many people in too little air. Lamps hang over a gallery of barred cells, and every face behind the bars turns to watch the new fish.',
    gm: 'Where the heroes wake. Corra Quarrel\'s gang holds the north cells and runs the tier. The gallery has a barred gate south to the Turnkey\'s post (locked) and a portcullis west to the Mine gate (locked, winch in the Mine head). Stairs at both ends climb to the Upper tier. A cell lock can be picked with a bent spoon or wire (DC 15 Thieves\' Tools, disadvantage without real tools) or forced (DC 18 Athletics, loud).',
  });
  cellRow(15, 's');
  cellRow(22, 'n');
  b.props_('straw-bed', [[32, 15], [36, 15], [44, 15], [48, 15], [52, 15], [48, 24], [52, 24]]).props_('pottery', [[37, 16], [45, 16]]).prop('table-cards', 33, 16);
  b.props_('lantern-hanging', [[34, 19], [42, 19], [50, 19]]).prop('wall-chains', 46, 21).prop('bench', 39, 20);
  b.light(34, 19, 5, 15).light(42, 19, 5, 15).light(50, 19, 5, 15);

  // stairs at both ends of the Stack: a loop between the tiers
  b.floor(30, 8, 1, 10, 'stone-flagstone').floor(54, 8, 1, 10, 'stone-flagstone');
  b.wallRun(31, 8, 3, 'w').wallRun(53, 8, 3, 'e').wallRun(31, 15, 3, 'w').wallRun(53, 15, 3, 'e');
  b.props_('stairs-down', [[30, 9], [54, 9]]).props_('stairs-up', [[30, 16], [54, 16]]);

  b.area('Fish tank', [[35, 22, 3, 3]], {
    read: 'You wake on wet straw with a mouth full of copper. Your armour, your weapons, your packs and pouches are gone. Your wrists are raw from irons that someone has already taken off.',
    gm: 'The new-prisoner cell. The heroes were dosed with poppy-wine on the cart in. Each wakes with 1 level of exhaustion that a short rest removes. Nobody searched their hair, boots or seams: allow each hero one small hidden thing if the player can say where it was.',
  });
  b.prop('straw-bed', 36, 23).prop('wall-chains', 35, 24);
  b.start(35, 22, 3, 3);

  b.area("Febb's cell", [[31, 22, 3, 3]], {
    read: 'The next cell is tidy as a scriptorium. Chalk letters cover every wall, beautiful ones, and an old man is copying them onto a tin plate with a nail.',
    gm: 'Ezzo Febb, forger. A loose stone in his west wall (secret door, DC 16 Perception) opens on Febb\'s crawl, a tight tunnel to the Mine head that he has spent six years digging with a spoon. He shows it to anyone who promises to take him along.',
  });
  b.prop('writing-desk', 32, 23).prop('scroll-pile', 31, 24).prop('candles', 33, 22);
  b.door(31, 23, 'w', 'secret');
  b.tunnel([[30, 23], [28, 25], [26, 27]], 1, { seed: 501, mat: 'cave-floor' });
  b.area("Febb's crawl", [[27, 23, 4, 3]], {
    read: 'A crawl so tight your shoulders scrape both walls. Spoons, dozens of them, worn flat, lie in a neat pile where the digging started.',
    gm: 'Medium heroes squeeze through (difficult terrain the whole way). It comes out behind ore sacks in the Mine head, unseen by the foremen unless the heroes fail a DC 12 group Stealth check.',
  });
  b.prop('tool-crate', 27, 24);

  b.area("Sparrow's cell", [[47, 1, 3, 3]], {
    read: 'A cell with nothing in it but a folded blanket and a cup. Whoever lives here owns nothing and expects to own nothing.',
    gm: 'Sparrow\'s cell. Under the blanket, stitched into the hem, is a tiny scrap of embroidered silk with a heron and three stars: the arms of House Vellacourt (DC 15 History to know them).',
  });
  b.prop('bedroll', 48, 1);

  // the barred passage and the Turnkey's post between the Stack and the yard
  b.floor(42, 22, 1, 4, 'stone-flagstone').wallRun(42, 22, 3, 'w').wallRun(42, 22, 3, 'e');
  b.door(42, 21, 's', 'locked', 'bars');
  b.room("Turnkey's post", 37, 26, 11, 4, {
    mat: 'stone-flagstone',
    read: 'A guard room with a desk, a brazier and a board of iron hooks. Half the hooks hold keys. A lever on the wall is wrapped in a red rag.',
    gm: 'The key board holds cell keys for both tiers and the yard gate. The red lever rings the alarm bell in the Bell tower: pulling it puts the alarm at Lockdown. A turnkey sits here unless the patrol has been dealt with. The duty roster on the desk shows the count times.',
  });
  b.prop('desk', 39, 27).prop('stool', 39, 28).prop('key-ring', 40, 26).prop('lever', 46, 26).prop('brazier', 44, 28).prop('weapon-rack', 37, 29).prop('notice-board', 42, 26);
  b.light(44, 28, 10, 15);
  b.floor(42, 30, 2, 1, 'stone-flagstone');
  b.encounter('Lights-out patrol', [30, 18, 25, 4], [['veteran', 1], ['thug', 2], ['guard', 4]], 'low');

  // ======== the Catwalk and the warden's tower ========
  b.floor(55, 5, 3, 2, 'wood-planks');
  b.pit(55, 1, 3, 4).pit(55, 7, 3, 3);
  b.door(54, 5, 'e', 'locked', 'bars').door(54, 6, 'e', 'locked', 'bars');
  b.door(57, 5, 'e', 'locked', 'door-iron').door(57, 6, 'e', 'locked', 'door-iron');
  b.area('The Catwalk', [[55, 5, 3, 2]], {
    read: 'A plank bridge with a single rope rail crosses a light-well. Sixty feet down, the lamps of the Lower tier look like coins at the bottom of a well.',
    gm: 'The warden\'s private way in and out of the Stack. A creature shoved off falls 60 feet (21 (6d6) bludgeoning) unless they catch the rail with a DC 13 Dexterity save and dangle. The tower door is iron and locked (DC 17 Thieves\' Tools; Malloch and Gorrin carry keys).',
    label: [56, 5],
  });
  b.props_('bridge-plank', [[55, 5], [57, 6]], 90).prop('chasm-edge', 56, 8).prop('crumbling-ledge', 56, 2);

  b.room("Warden's office", 58, 3, 14, 12, {
    mat: 'wood-planks-dark',
    read: 'Warm, after the cold of the Stack. A fire burns, a carpet softens your steps and a table is laid with fresh bread. Behind a broad desk, under a painting of a heron, a neat man in a grey coat looks up from his ledger and does not seem surprised at all.',
    gm: 'Warden Severin Malloch works late every night, with Gorrin Stave at the door and two mastiffs by the fire. He prefers talking to fighting: he offers the heroes a pardon and a horse each to leave Sparrow behind (a lie: DC 15 Insight). The bookcase behind the desk swings open on the vault passage (secret door, DC 15 Perception, or the warden\'s ring opens it). The desk holds the ledger.',
  });
  b.prop('writing-desk', 64, 6).prop('chair-high-back', 64, 5).prop('fireplace', 58, 9).prop('rug', 63, 9).props_('bookshelf-tall', [[60, 3], [68, 3]]).prop('bookcase-secret', 71, 6).prop('map-cabinet', 70, 13).prop('dining-table-six', 66, 12).prop('heraldic-crest', 64, 3).prop('strongbox', 59, 13).props_('armchair', [[60, 8], [60, 11]]).prop('globe-stand', 68, 9).props_('candelabra', [[62, 6], [67, 6]]);
  b.light(59, 9, 15, 20, '#ff9a3c').light(64, 6, 10, 15);
  b.encounter("The Warden's hour", [58, 3, 14, 12], [['mage', 1], ['gladiator', 1], ['mastiff', 2]], 'high');

  b.floor(72, 6, 1, 1).door(71, 6, 'e', 'secret').door(72, 6, 'e', 'locked', 'door-iron');
  b.room("Warden's vault", 73, 2, 6, 8, {
    mat: 'stone-flagstone',
    read: 'Racks and shelves crowd a narrow strongroom. Here is everything Blackgate has ever taken from anyone: swords, boots, wedding rings, children\'s toys. Your own packs sit on a shelf near the door with your names chalked on them.',
    gm: 'The heroes\' gear is here, whole. So are the vault\'s keepers: a suit of armour and swords that rise when anyone without the warden\'s ring steps past the threshold, and a red carpet that is not a carpet. A dart trap in the lock plate of the iron door (DC 14 Perception to spot, DC 14 Dexterity save or 7 (2d6) piercing and poisoned for an hour).',
  });
  b.props_('weapon-rack', [[73, 2], [78, 2]]).props_('armor-stand', [[73, 5], [78, 5]]).props_('gear-pile', [[75, 3], [76, 7]]).prop('backpack', 74, 8).prop('safe', 78, 8).prop('chest', 76, 2).prop('coffer', 75, 5).prop('lock-plate', 73, 6).prop('trap-darts', 73, 7, 0, { gm: true });
  b.light(76, 5, 5, 10, '#ffd27a');
  b.encounter('Vault guardians', [73, 2, 6, 8], [['animatedArmor', 2], ['rugOfSmothering', 1], ['flyingSword', 3]], 'low');

  b.floor(72, 12, 1, 1).door(71, 12, 'e', 'closed').door(72, 12, 'e', 'locked');
  b.room("Warden's quarters", 73, 11, 6, 7, {
    mat: 'wood-planks-dark',
    read: 'A bedroom like a monk\'s: a hard bed, a basin, a single shelf of books. Every candle is lit, though nobody is here. Malloch does not sleep in the dark.',
    gm: 'The Tallywife walks the warden\'s dreams when payment is late, so he keeps every light burning. In a locked drawer (DC 13 Thieves\' Tools): the Regent\'s letter, a purse of 120 gp, and a spare ring-key to the vault. Malloch\'s spellbook is under the mattress.',
  });
  b.prop('bed', 74, 12).prop('nightstand', 76, 12).prop('washbasin', 78, 14).prop('bookshelf-low', 73, 16).props_('candle-stand-tall', [[78, 11], [78, 17]]).prop('dresser', 76, 17);
  b.light(78, 11, 5, 10).light(78, 17, 5, 10);

  b.hall(65, 15, 65, 16).door(65, 14, 's', 'closed');
  b.room('Tower stair', 62, 17, 7, 6, {
    mat: 'stone-flagstone',
    read: 'A spiral stair winds down through the tower. Arrow slits look out over the yard, and from here you can see every man in every tower.',
    gm: 'Links the warden\'s floor and the barracks below. A guard naps on the landing at night (DC 12 Stealth to pass). The arrow slits give a full view of the Exercise yard: count the tower guards from here.',
  });
  b.prop('stair-spiral', 65, 19).prop('stool', 63, 21).prop('weapon-rack', 68, 17).prop('lantern-wall', 62, 18).prop('barrel', 68, 22);
  b.light(64, 21, 5, 10);
  b.hall(65, 23, 65, 25).door(65, 22, 's', 'closed').door(65, 25, 's', 'locked', 'door-iron');

  // ======== the guard side: barracks, armory, kennels, gatehouse ========
  b.room('Guard barracks', 60, 26, 18, 12, {
    mat: 'wood-planks-dark',
    read: 'Rows of bunks in the dark, and the sound of thirty men snoring. Boots stand in pairs. A dice game has been left mid-throw on an upturned barrel, the coins still on the table.',
    gm: 'The off-duty watch, asleep unless the alarm has reached Lockdown. A DC 13 group Stealth check gets the heroes through; each failure wakes a few. Guard uniforms hang on pegs: a hero in one has advantage on Deception to pass as a guard at night. The armory door is locked (DC 14 Thieves\' Tools).',
  });
  for (let i = 0; i < 5; i++) b.prop('bunk-bed', 61 + i * 3, 27).prop('footlocker', 61 + i * 3, 28);
  for (let i = 0; i < 5; i++) b.prop('bunk-bed', 61 + i * 3, 35);
  b.prop('table-cards', 69, 31).prop('barrel', 71, 31).prop('fireplace', 77, 30).prop('coat-rack', 60, 31).props_('weapon-rack', [[76, 27], [76, 36]]).prop('water-barrel', 63, 31).prop('coins-small', 70, 31);
  b.light(77, 30, 10, 15, '#ff9a3c');
  b.encounter('Barracks at rest', [60, 26, 18, 12], [['veteran', 3], ['guard', 8], ['thug', 2]], 'moderate');

  b.floor(74, 38, 1, 1).door(74, 37, 's', 'locked', 'door-iron').door(74, 38, 's', 'closed', 'door-iron');
  b.room('Armory', 71, 39, 7, 4, {
    mat: 'stone-flagstone',
    read: 'Spears in racks, crossbows on pegs, a barrel of bolts and a row of padded jacks. Everything is oiled and numbered.',
    gm: 'Enough for a riot. Chain shirts, shortswords, spears, light crossbows and 200 bolts. Handing these to Corra\'s gang turns the yard fight their way (the tower guards fight at disadvantage on their first round). Two potions of healing in a medic\'s box.',
  });
  b.props_('spear-rack', [[71, 39], [77, 39]]).prop('weapon-barrel', 73, 41).prop('armor-stand', 75, 39).prop('shield-wall', 77, 42).prop('crate-stack', 71, 42);

  b.hall(64, 38, 64, 39).door(64, 37, 's', 'closed');
  b.room('Kennels', 60, 40, 10, 11, {
    mat: 'stone-cobble',
    read: 'Straw, bones and the heavy breath of dogs. A dozen mastiffs lift their heads from the dark, all at once, and not one of them barks.',
    gm: 'Old Murdo the houndmaster trained these dogs never to bark: they just come. The houndmaster is a veteran. Raw meat from the Kitchens (or the sleeping draught from the Infirmary in it) quiets them. At Lockdown the dogs are loosed into the yard.',
  });
  b.props_('cage', [[60, 41], [60, 44], [60, 47]]).props_('straw-bed', [[63, 42], [67, 45], [64, 49]]).prop('water-trough', 68, 41).props_('bones', [[66, 47], [62, 45]]).prop('hay-bale', 69, 49).prop('chains-hanging', 66, 41);
  b.light(65, 44, 5, 10);
  b.encounter('The silent hounds', [60, 40, 10, 11], [['veteran', 1], ['mastiff', 12]], 'low');
  b.hall(66, 51, 66, 53).door(66, 50, 's', 'closed').door(66, 53, 's', 'closed');

  b.room('Gatehouse', 62, 54, 14, 8, {
    mat: 'stone-flagstone',
    read: 'The only door Blackgate admits to: an arch of black iron, a portcullis as thick as your arm and a winch-house above it. Guards play cards by a brazier. Beyond the bars, the night smells of pine and river.',
    gm: 'The front way out. The portcullis winch is in the north-east corner (one action to drop or raise; it takes 2 rounds to rise). Ways through: force it (a moderate fight with the chaplain and the gate watch); walk out in guard uniforms with a pass Febb forged (DC 14 Deception, advantage if Lusk vouches); or bribe the gate (50 gp a head, which the heroes will not have until the vault). The chaplain blesses every shift: he is the one guard here who cannot be bribed.',
  });
  b.props_('portcullis', [[68, 61], [69, 61]]).prop('winch', 74, 55).prop('lever', 75, 56).prop('table-cards', 65, 57).prop('brazier', 67, 57).props_('weapon-rack', [[62, 54], [75, 60]]).prop('gate-iron-tall', 68, 60).prop('barricade-wood', 72, 60).prop('shrine', 62, 60);
  b.light(67, 57, 10, 20, '#ff9a3c');
  b.encounter('The front gate', [62, 54, 14, 8], [['priest', 1], ['veteran', 3], ['guard', 4]], 'moderate');
  b.door(68, 61, 's', 'locked', 'portcullis').door(69, 61, 's', 'locked', 'portcullis');

  // the road down the mountain to the ferry
  b.tunnel([[68, 62], [76, 65], [63, 68], [70, 71]], 3, { seed: 502, mat: 'dirt' });
  b.floor(76, 65, 4, 3, 'dirt');
  b.area('The switchback road', [[60, 62, 20, 10]], {
    read: 'A cart road zigzags down the mountain in the dark, with nothing but a low wall between it and the drop. A gibbet creaks on the second bend.',
    gm: 'Open ground: the gate towers can shoot down on anyone here for 3 rounds (two crossbow attacks per round, +2 to hit, 1d8). The road east is the long way to town; the ferry below is the fast way.',
    label: [70, 66],
  });
  b.prop('gibbet-post', 77, 64).prop('signpost', 78, 66).props_('boulder', [[64, 69], [74, 63]]).prop('milestone', 72, 69).prop('tree-pine', 63, 69).prop('wall-stone-low', 66, 67);
  b.floor(56, 72, 24, 4, 'dirt');
  b.area('Ferry landing', [[56, 72, 24, 4]], {
    read: 'A stone landing at the foot of the cliff, with a rope ferry, two rowboats and a hut where the ferryman snores. The river runs fast and black.',
    gm: 'Freedom, almost. The ferryman (a commoner) takes anyone across for a silver, and asks no questions of people in prison grey if they pay double. Cutting the ferry rope behind you stops pursuit for an hour.',
    label: [66, 73],
  });
  b.prop('dock-pier', 66, 75).props_('mooring-post', [[62, 75], [72, 75]]).prop('lean-to', 58, 72).prop('rope-coil', 70, 73).prop('cargo-crates', 76, 73).prop('lamp-post', 64, 72).prop('campfire-cold', 59, 74);
  b.light(64, 72, 10, 15);

  // ======== the yard ========
  b.room('Exercise yard', 30, 31, 25, 20, {
    mat: 'dirt',
    read: 'A pit open to the night sky, the size of a market square, walled by cliffs. Four towers stand at its corners with lanterns and crossbows. Heaps of broken ore cover the ground where prisoners swing hammers all day, and a gallows stands in the middle, waiting.',
    gm: 'The heart of a riot. A tower guard sees anything that moves in lantern light (passive Perception 13; the middle third of the yard is dark at night). Gates: north to the Turnkey\'s post, east to the barracks (locked), south to the Mess hall. The Hole is a solitary pit by the gallows.',
  });
  b.door(42, 30, 's', 'locked', 'door-iron').door(43, 30, 's', 'locked', 'door-iron');
  b.props_('ore-pile', [[36, 37], [48, 37], [37, 44], [47, 44]]).props_('rubble-pile', [[35, 40], [49, 41]]).prop('gallows', 42, 40).props_('stocks', [[39, 36], [45, 36]]).prop('pillory', 46, 46).prop('well', 38, 47).props_('boulder', [[44, 33], [33, 39]]).prop('pickaxes', 50, 40).prop('wall-chains', 41, 31).prop('lamp-post', 42, 48);
  b.light(42, 48, 10, 15);
  b.rock(35, 31, 3, 1).rock(30, 40, 1, 3).rock(54, 41, 1, 3).rock(46, 50, 3, 1);
  b.rubble(35, 40, 2, 2).rubble(48, 41, 2, 2);
  b.pit(40, 42, 2, 2);
  b.area('The Hole', [[40, 42, 2, 2]], {
    read: 'A square pit with a grate over it. A hand comes up through the bars as you pass and grips your ankle, gently. "Is it night?" someone asks. "Is it still night?"',
    gm: 'Solitary. Its prisoner is Wix, a kitchen hand who stole bread; he has heard every guard\'s gossip through the grate. Freed, he tells the heroes the Count is at third bell and that the warden "goes down the mine with the list".',
    label: [40, 42],
  });
  b.prop('cage', 41, 43);
  b.building('Bell tower', 30, 31, 4, 4, {
    mat: 'stone-flagstone', doors: [[33, 33, 'e', 'closed']], windows: [[31, 34, 's']],
    read: 'A squat tower with a bronze bell hung under its roof and a ladder up to it.',
    gm: 'The alarm bell. One guard. If the bell rings, the alarm goes to Lockdown. Cutting the bell rope (or stuffing the bell with laundry) silences it.',
  });
  b.prop('temple-bell', 31, 32).prop('ladder', 32, 33).light(32, 32, 5, 10);
  b.building('East tower', 51, 31, 4, 4, {
    mat: 'stone-flagstone', doors: [[51, 33, 'w', 'closed']], windows: [[52, 34, 's']],
    read: 'A tower with a crossbow rack and a brazier. Its door faces the yard.',
    gm: 'Two guards and a veteran. From the top a guard can shoot into the barracks hall and the yard.',
  });
  b.prop('brazier', 53, 32).prop('ladder', 52, 33).light(53, 32, 5, 10, '#ff9a3c');
  b.building('Crossbow tower', 30, 47, 4, 4, {
    mat: 'stone-flagstone', doors: [[33, 48, 'e', 'closed']], windows: [[31, 47, 'n']],
    read: 'A tower with a rack of crossbows and a chest of bolts.',
    gm: 'The yard\'s spare weapons: 4 light crossbows and 60 bolts. One scout on watch.',
  });
  b.prop('weapon-rack', 31, 49).prop('chest', 32, 49).prop('ladder', 31, 48);
  b.building('Lamp tower', 51, 47, 4, 4, {
    mat: 'stone-flagstone', doors: [[51, 48, 'w', 'closed']], windows: [[52, 47, 'n']],
    read: 'A tower full of oil jars. A great hooded lantern turns on a pivot at its top.',
    gm: 'The searchlight. Whoever holds this tower decides which part of the yard is lit. Ten jars of lamp oil: a thrown jar and a spark make a 5-foot burning patch (2d6 fire).',
  });
  b.prop('lantern-standing', 52, 48).prop('shelf-jars', 53, 49).prop('barrel', 53, 48).light(52, 48, 15, 25);
  b.encounter('The towers', [30, 31, 25, 20], [['veteran', 3], ['scout', 4], ['guard', 4]], 'moderate');

  b.hall(55, 37, 59, 37).door(54, 37, 'e', 'locked', 'door-iron').door(59, 37, 'e', 'closed');

  // ======== the working halls: mess, kitchens, laundry, infirmary ========
  b.floor(42, 51, 1, 1).door(42, 50, 's', 'closed', 'door-iron');
  b.room('Mess hall', 32, 52, 19, 10, {
    mat: 'stone-flagstone',
    read: 'Long tables, chained benches and a serving hatch. The evening slop is grey and smells of turnip. At the head table, under the only lamp, a broad woman with a bent nose is holding court.',
    gm: 'Corra Quarrel\'s table. Prisoners eat in shifts; at night the hall is the gang\'s parlour. Corra can start a riot with a word (see her profile). The dead-cart door on the west wall (locked iron, DC 15) opens on the tunnel to the Ore incline: the guards wheel the "accident" bodies out that way.',
  });
  for (let r = 0; r < 3; r++) b.prop('table-long', 35, 54 + r * 3).prop('table-long', 43, 54 + r * 3);
  b.props_('bench-long', [[35, 55], [43, 55], [35, 58], [43, 58]]).prop('table-round', 40, 53).prop('bar-counter', 49, 56).prop('lantern-hanging', 40, 53).props_('barrel-group', [[50, 60], [32, 61]]).prop('pot-rack', 50, 53);
  b.light(40, 53, 10, 20).light(48, 58, 5, 10);
  b.encounter("Corra's crew", [32, 52, 19, 10], [['banditCaptain', 1], ['thug', 6]], 'low');

  b.floor(51, 56, 1, 1).door(50, 56, 'e', 'closed').door(51, 56, 'e', 'closed');
  b.room('Kitchens', 52, 52, 8, 10, {
    mat: 'brick-floor',
    read: 'Ovens roar. Three cauldrons bubble. A one-eyed cook is beating a sack of something with a ladle and swearing at it.',
    gm: 'The guards\' soup for the midnight shift cooks here. A dose of the Infirmary\'s sleeping draught in it puts half the night watch to sleep at second bell (no Barracks fight; the Gatehouse fight loses two veterans). The cook can be bribed with tobacco from Corra. The supply door east (locked) leads to the Gatehouse.',
  });
  b.props_('hearth-oven', [[52, 52], [59, 52]]).props_('cauldron', [[54, 55], [57, 55]]).prop('butcher-block', 55, 58).props_('flour-sacks', [[52, 60], [53, 61]]).prop('bread-rack', 59, 58).prop('kitchen-table', 56, 60).prop('water-barrel', 59, 61);
  b.light(55, 53, 10, 20, '#ff9a3c');
  b.floor(60, 57, 2, 1).door(59, 57, 'e', 'closed').door(61, 57, 'e', 'locked', 'door-iron');

  b.floor(37, 62, 1, 1).door(37, 61, 's', 'closed').door(37, 62, 's', 'closed');
  b.room('Laundry', 32, 63, 12, 7, {
    mat: 'stone-flagstone',
    read: 'Steam, soap and the thump of wooden paddles. Prison grey hangs in rows from the ceiling. A slight woman works a mangle at the far end, alone, and does not look up.',
    gm: 'Sparrow works the night wash here. Laundry goes out in sacks down a chute to a barge (officially); the smugglers use the same chute for tobacco and letters. The chute hatch is under the last mangle (secret door, DC 15 Perception, or Sparrow shows it if she trusts the heroes). Laundry sacks are great for hiding in: a hero in a sack on a cart passes a casual look.',
  });
  b.props_('washbasin', [[33, 64], [35, 64], [37, 64]]).props_('cauldron', [[41, 64], [42, 66]]).props_('rope-coil', [[34, 67], [39, 67]]).props_('sack', [[33, 68], [34, 69], [40, 69]]).prop('handcart', 36, 68).prop('water-barrel', 43, 69).prop('workbench', 38, 68);
  b.light(41, 64, 10, 15, '#ff9a3c');

  b.floor(55, 62, 1, 1).door(55, 61, 's', 'closed').door(55, 62, 's', 'closed');
  b.floor(44, 66, 2, 1).door(43, 66, 'e', 'closed').door(45, 66, 'e', 'closed');
  b.room('Infirmary', 46, 63, 12, 7, {
    mat: 'stone-flagstone',
    read: 'Six cots, four of them full. A woman in a stained apron moves between them with a lamp, and the herbs drying over the stove almost cover the smell.',
    gm: 'Doctor Ines Callowell\'s ward. She knows which prisoners "went down the mine" and never came back, and it is eating her alive. She can be turned (see her profile). Her cabinet holds the sleeping draught for the kitchen plan and three potions of healing.',
  });
  b.props_('cot', [[47, 64], [49, 64], [51, 64], [47, 68], [49, 68], [51, 68]]).prop('apothecary-counter', 56, 64).prop('potion-shelf', 57, 66).prop('herbs-drying', 54, 63).prop('stove', 56, 69).prop('washbasin', 53, 68).prop('alchemy-table', 54, 66);
  b.light(54, 66, 10, 15);

  // the smugglers' chute and the midden sump
  b.floor(38, 70, 1, 2, 'stone-cobble').door(38, 69, 's', 'secret');
  b.cave('Midden sump', 40, 74, 5, 2.6, {
    seed: 503, mat: 'mud',
    read: 'You slide down a slick chute and land in a cave of slops and bones. The river roars just past a lip of rock. Something under the muck opens a single eye on a stalk.',
    gm: 'Every scrap from the kitchens ends here, and so does the otyugh that eats it. It can be bargained with (it speaks by telepathy and loves fresh meat: a sack of kitchen meat buys passage). A skiff the smugglers keep tied under the lip holds four. Otherwise the river: DC 12 Athletics to swim clear, then a mile downstream to safety.',
  });
  b.props_('bones-mud', [[38, 73], [43, 74]]).prop('sewer-outflow', 38, 72).prop('rowboat', 41, 75).prop('debris-wood', 44, 73).prop('mud-patch', 36, 74);
  b.encounter('Something in the slops', [35, 72, 11, 4], [['otyugh', 1]], 'low');

  // ======== the mine ========
  b.hall(29, 20, 24, 22).door(30, 20, 'w', 'locked', 'portcullis');
  b.area('Mine gate', [[24, 20, 6, 1]], {
    read: 'A portcullis with a winch-chain running away into the dark, and a sign burned into a plank: WORK IS FREEDOM.',
    gm: 'Raised from the Mine head side only (the winch there), or lifted for a moment with a DC 20 Athletics check. Every morning the prisoners go through here in chains; every night, fewer come back than should.',
    label: [26, 20],
  });
  b.prop('signpost', 27, 20);

  b.cave('Mine head', 21, 25, 7, 5, {
    seed: 504, mat: 'cave-floor',
    read: 'A huge cavern of rails and chains. Ore carts stand nose to tail. A cage-lift hangs over a dark shaft, and a foreman with a whip is counting picks back into a rack.',
    gm: 'Where the shifts muster. The foremen (a veteran and his thugs, plus a few guards) stay late to count tools. Kegs of blasting powder for the face work sit in a locked cage (DC 14 Thieves\' Tools): one keg opens the Collapsed tunnel. A ride in an ore cart down the rails to the Ore sorting cave is fast and loud (DC 13 Dexterity or tumble out for 2d6).',
  });
  b.props_('mine-rails', [[19, 27], [20, 27], [21, 27], [22, 27], [23, 27], [22, 28], [22, 30]]).props_('mine-cart', [[18, 27], [24, 27]]).prop('winch', 25, 22).prop('cage', 16, 24).prop('barrel-group', 17, 23).props_('ore-pile', [[25, 29], [16, 28]]).prop('pickaxes', 23, 22).prop('tool-wall', 20, 21).prop('chains-hanging', 18, 25).prop('mine-support', 24, 24);
  b.light(21, 25, 10, 20).light(17, 23, 5, 10);
  b.encounter('Mine foremen', [14, 20, 15, 11], [['veteran', 1], ['thug', 4], ['guard', 4]], 'low');

  b.tunnel([[18, 21], [17, 16], [16, 13]], 2, { seed: 505, mat: 'cave-floor' });
  b.cave('Silver drift', 16, 9, 7, 4.5, {
    seed: 506, mat: 'cave-floor',
    read: 'An old working where the silver ran out. The walls glitter with leftover flecks, and the rails end in a heap of rusted carts. Something drips from the ceiling, and it is not water.',
    gm: 'Abandoned after "the ceiling ate Dannet". Darkmantles hang among the stalactites (DC 15 Perception to spot), and an ochre jelly lives in the old ore chute. A thin silver seam is still worth 150 gp to anyone with an hour and a pick. The old air shaft east climbs to the Upper tier.',
  });
  b.props_('stalactites', [[13, 7], [18, 6], [20, 10]]).props_('cave-crystals', [[11, 10], [21, 8]]).props_('mine-rails', [[14, 11], [15, 11], [16, 11]]).prop('mine-cart', 17, 11).prop('skeleton-lying', 12, 8).prop('pickaxes', 19, 11).prop('ore-pile', 15, 6);
  b.light(21, 8, 5, 10, '#9fd3ff');
  b.encounter('The ceiling drop', [9, 4, 15, 11], [['ochreJelly', 1], ['darkmantle', 6]], 'low');

  b.door(30, 5, 'w', 'secret');
  b.tunnel([[29, 5], [25, 6], [22, 8]], 1, { seed: 507, mat: 'cave-floor' });
  b.area('Air shaft', [[23, 5, 7, 2]], {
    read: 'A narrow shaft, warm air rising past you from the mine and whistling out through the grates of the Stack.',
    gm: 'A climb, not a walk: DC 10 Athletics, and a fall is only 10 feet. It links the Upper tier and the Silver drift, bypassing every gate.',
    label: [26, 6],
  });

  b.tunnel([[10, 8], [7, 6], [5, 6]], 2, { seed: 508, mat: 'cave-floor' });
  b.rubble(5, 5, 4, 3);
  b.area('Collapsed tunnel', [[5, 4, 5, 4]], {
    read: 'The old adit to the mountainside ends in a wall of fallen rock. Through a gap the size of your fist, you feel cold wind and smell snow.',
    gm: 'Opening it: one keg of blasting powder from the Mine head (one minute to set, everyone within 20 feet DC 13 Dexterity save or 3d6 bludgeoning, and the bang raises the alarm one step), or three hours of digging (too slow before the Count unless the riot buys time). A gnome or a druid with a burrowing trick might find another way.',
    label: [7, 6],
  });
  b.props_('rubble-pile', [[6, 6], [9, 6]]).prop('ceiling-rubble', 7, 7).prop('column-collapsed', 9, 7);
  b.floor(1, 1, 4, 12, 'dirt');
  b.area('West cliff', [[1, 1, 4, 12]], {
    read: 'You step out onto a ledge on the mountain\'s face. Wind and stars. Far below, the river glints, and a goat path zigzags down the cliff toward it.',
    gm: 'Outside. The goat path takes an hour (DC 12 Athletics or Survival per hero; a failure costs 1d6 damage and ten minutes). Nobody watches this side of the mountain.',
    label: [2, 6],
  });
  b.props_('boulder', [[1, 2], [3, 11]]).prop('tree-pine', 2, 9).prop('crumbling-ledge', 1, 12).prop('cairn', 3, 1);

  b.tunnel([[22, 30], [22, 34], [22, 38]], 2, { seed: 509, mat: 'cave-floor' });
  b.props_('mine-rails', [[22, 31], [22, 32], [22, 33], [22, 34], [22, 35]]);
  b.cave('Ore sorting cave', 22, 42, 6, 4, {
    seed: 510, mat: 'cave-floor',
    read: 'Rails split here three ways around tables of sorted ore: grey, black and a little silver. A set of scales stands in the middle with a lead weight still on it.',
    gm: 'The junction of the mine. Rails run north to the Mine head, south down the Ore incline to the river, and a wet side passage west goes down to the Flooded gallery. The weigh-book on the table lists every shift; six names a month are crossed out with the word DEEP.',
  });
  b.props_('mine-rails', [[20, 42], [21, 42], [22, 42], [23, 42], [22, 44]]).prop('mine-cart', 24, 42).prop('scales', 22, 40).prop('workbench', 19, 40).props_('ore-pile', [[24, 39], [26, 44]]).prop('grindstone', 18, 43).prop('sack', 24, 44);
  b.light(22, 41, 5, 15);

  b.tunnel([[22, 46], [25, 55], [25, 66]], 2, { seed: 511, mat: 'cave-floor' });
  b.props_('mine-rails', [[23, 48], [24, 52], [25, 58], [25, 62]]).prop('mine-cart', 25, 60);
  b.area('Ore incline', [[22, 47, 5, 19]], {
    read: 'A steep tunnel drops away, the rails shining in your lantern light. A rope-brake drum creaks at the top. Every few yards a chalk tally is scratched on the wall.',
    gm: 'A runaway cart from the top reaches the Ore gate in two rounds and smashes it open (and alerts the dock). On foot, the incline is difficult terrain.',
    label: [24, 52],
  });

  b.hall(26, 57, 31, 57).door(32, 57, 'w', 'locked', 'door-iron');
  b.area('Dead-cart tunnel', [[26, 57, 6, 1]], {
    read: 'A low tunnel with a handcart in it. The cart has a tarp, and under the tarp is a shape you do not want to look at.',
    gm: 'How the "accidents" leave the Mess hall. The body is a prisoner who refused the Count last month; in his fist is a scrap of paper with the word TALLY scratched on it.',
    label: [28, 57],
  });
  b.prop('handcart', 28, 57, 90);

  b.hall(25, 66, 25, 70, 2).door(25, 70, 's', 'locked', 'door-iron').door(26, 70, 's', 'locked', 'door-iron');
  b.floor(18, 71, 13, 5, 'wood-planks');
  b.area('Ore dock', [[18, 71, 13, 5]], {
    read: 'A wooden wharf on the river, stacked with crates of ore under tarps. A flat barge is tied up, riding low. Two lamps swing in the wind.',
    gm: 'Behind the Ore gate (locked iron, DC 16, or smash it with a runaway cart). Two guards doze in the shed at night; they are paid to look away from smugglers and can be paid again (10 gp each). The barge needs four people to pole it (DC 12 Athletics to get it into the current), and it is the best way to take a crowd: Corra\'s whole gang fits.',
  });
  b.props_('dock-pier', [[20, 75], [28, 75]]).props_('cargo-crates', [[19, 72], [29, 72]]).prop('crate-stack', 21, 73).prop('mine-cart', 26, 72).prop('ore-pile', 23, 72).prop('winch', 30, 73).prop('mooring-post', 24, 75).prop('lean-to', 18, 71).prop('lamp-post', 27, 74);
  b.light(27, 74, 10, 15);

  // the flooded gallery and the deep chamber
  b.tunnel([[17, 43], [13, 45]], 2, { seed: 512, mat: 'cave-floor' });
  b.cave('Flooded gallery', 8, 45, 6, 6, {
    seed: 513, mat: 'cave-floor',
    read: 'The lower workings broke into an underground lake years ago. Rails run down into black water and disappear. On the far side, something clicks, like shears.',
    gm: 'Waist-deep water (difficult terrain) with a deep sump in the middle. The chuul here are the Tallywife\'s watchdogs, and with them a heap of babbling flesh that was once the last six prisoners sold (it calls out in their voices; DC 13 Wisdom save the first time or frightened for a round). The rails along the north edge are a dry path (DC 12 Acrobatics). A drowned guard\'s purse (35 gp) and a potion of water breathing lie in the shallows.',
  });
  b.pool(8, 45, 5, 3.5, true).pool(5, 48, 2.5, 1.5);
  b.props_('mine-rails', [[5, 41], [6, 41], [7, 41], [8, 41], [9, 41]]).prop('mine-cart', 10, 41).prop('mine-support', 4, 40).prop('skeleton-lying', 12, 48).prop('deep-water', 8, 45).prop('column-collapsed', 4, 49);
  b.light(10, 41, 5, 10, '#9fd3ff');
  b.encounter('Black water', [2, 39, 13, 13], [['chuul', 2], ['gibberingMouther', 1]], 'moderate');

  b.tunnel([[8, 50], [10, 53], [10, 57]], 2, { seed: 514, mat: 'cave-floor' });
  b.props_('stairs-down', [[9, 52]]);
  b.area('The long stair', [[8, 51, 4, 5]], {
    read: 'Steps cut by hand spiral down into the dark. They are worn into hollows in the middle, as if many people walked them, and none of them walked back up.',
    gm: 'Carved long before Blackgate. At the bottom, the air smells of wet copper and candle smoke. A candle burns on every tenth step: the Tallywife likes her guests to arrive.',
    label: [9, 53],
  });

  b.cave('Deep chamber', 10, 62, 8, 6, {
    seed: 515, mat: 'cave-floor',
    read: 'A cavern like a church with the roof sunk in. Candles stand in rings on every rock. Chains hang from above, and from some of them hang cages. In the middle, beside a black pool, an old woman in a shawl sits at a table with a tally-board, notching it with a little knife. "Six," she says, without looking up. "You\'re early."',
    gm: 'The Tallywife\'s parlour. She expects six prisoners and the warden at third bell. She will talk first: she counts souls, not bodies, and a fair tally is a fair tally. A clever party can sell her the warden instead of themselves (see her profile). If it comes to blows, the babbling spawn rise from the pool and a chuul climbs out of the sunken channel. The pool drains through a flooded channel to the river: 60 feet underwater (DC 13 Athletics, one minute of held breath).',
  });
  b.pool(7, 63, 3, 2, true);
  b.prop('table-round', 11, 60).props_('chair', [[10, 60], [12, 60]]).props_('candle-ring', [[5, 58], [15, 59], [13, 66]]).props_('cage-hanging', [[6, 60], [14, 63]]).props_('chains-hanging', [[9, 58], [12, 65]]).prop('bone-heap', 4, 65).prop('skull-pile', 16, 62).prop('gem-bowl', 12, 61).prop('scales', 13, 59).prop('idol', 10, 57).prop('glowing-fungus', 4, 61).prop('stalagmites', 15, 64);
  b.light(11, 60, 10, 20, '#c8ffb0').light(5, 58, 5, 10, '#ffd27a').light(15, 59, 5, 10, '#ffd27a');
  b.encounter('The Deep Count', [2, 56, 17, 13], [['nightHag', 1], ['gibberingMouther', 2], ['chuul', 1]], 'high');

  b.water(9, 67, 2, 9, true);
  b.area('Sunken channel', [[9, 68, 2, 8]], {
    read: 'The black pool narrows into a tunnel of water. You can feel the river pulling at it, cold and fast.',
    gm: 'Swim it: 60 feet underwater, DC 13 Athletics (failure: 2d6 bludgeoning against the rocks and try again). It comes out under the cliff into the river, out of sight of every tower.',
    label: [9, 70],
  });

  b.tunnel([[16, 62], [20, 61], [24, 62]], 1, { seed: 516, mat: 'cave-floor' });
  b.rubble(19, 60, 3, 3);
  b.area("Hag's crack", [[17, 60, 7, 3]], {
    read: 'A crack in the rock, half choked with loose stone, whistling with a draught.',
    gm: 'A tight, loose way between the Ore incline and the Deep chamber (difficult terrain). The Tallywife uses it to listen to the miners. Heroes can use it to reach her parlour without passing the Flooded gallery, or to surprise her.',
    label: [20, 61],
  });

  // the river at the foot of the mountain
  b.water(0, 76, 80, 1, false).water(0, 77, 80, 3, true);
  b.area('The river', [[0, 76, 80, 4]], {
    read: 'The river runs fast and black at the foot of the mountain, loud enough to swallow any shout.',
    gm: 'The end of most escapes. Swimming downstream for a mile: DC 12 Athletics, or DC 10 holding onto a barrel or plank. A failure costs 1d6 damage and drops anything not tied on.',
    label: [40, 78],
  });
  b.props_('rapids', [[12, 77], [48, 78]]).prop('whirlpool', 8, 78).prop('rowboat', 60, 76).prop('canoe', 31, 77);
  return b.build();
}

export const BLACKGATE_ESCAPE: Adventure = {
  id: 'blackgate-escape',
  title: 'Escape from Blackgate',
  tagline: 'Framed, stripped and locked in a prison-mine: break out before the warden sells you to the thing in the deep.',
  levels: '5',
  sessions: '1 session',
  players: '3-5 players',
  tags: ['prison break', 'heist', 'mine', 'intrigue', 'horror'],
  pitch:
    'Blackgate is a prison cut into a mountain, and its prisoners dig silver until they die. You wake there on wet straw with no weapons, no armour and no idea how long you slept. The old man in the next cell says you have until third bell. When you ask what happens at third bell, he stops smiling.',
  secret:
    'Warden Severin Malloch takes money from two masters. Lord Regent Albric Vellacourt pays him every month to hide the Regent\'s niece Aveline, the true heir of House Vellacourt, whom the realm believes drowned. Deep under the mine lives the Tallywife, a night hag who buys prisoners by the half-dozen and pays in uncut gems and dreamless sleep. Tonight is the dark of the moon, the night of the Deep Count. The Tallywife has asked for something better than thieves this time: a soul of the blood royal. Malloch has agreed. At third bell he will walk Aveline, the four newest prisoners (the heroes) and the old forger down the long stair, and come back rich.',
  hooks: [
    'Framed: the heroes were arrested in the river town of Coldmarch Ford for murdering a magistrate. The magistrate had found proof that the heir lived; the Regent\'s man killed him and pinned it on the strangers in town.',
    'Caught on a job: the heir\'s old nurse hired the heroes to find out what really happened to Aveline. They were caught breaking into the Regent\'s records, and nobody bothered with a trial.',
    'Sold: the heroes were drugged at a roadside inn by a crimp who sells strong backs to Blackgate at ten gold a head. They are not even on the books, which suits the warden fine.',
  ],
  tips: [
    'Run a bell clock: the Count comes at third bell. Start the clock at 6. A fight, a long talk, a rest or about half an hour of play takes one off. At 0, the warden\'s men come for the six names on the list.',
    'Run an alarm track too: Quiet, Wary (double patrols), Lockdown (every gate locked, the bell rings, dogs in the yard) and Riot. Loud fights, the bell and blasting powder push it up. A riot started on purpose is cover, not failure.',
    'The heroes start with nothing but what they hid. Let them punch, grapple and improvise (a stool leg is a club, a chain is a whip). Spellcasters can cast spells without costly components. The vault is the big reward: getting the gear back should feel like a superpower coming home.',
    'Most fights can be dodged, bribed or turned. Corra\'s gang can be bought, the dogs fed, the barracks drugged, the otyugh paid in meat, and the Tallywife can be sold a better soul than yours. Give full XP for a clever way round.',
    'There are five ways out: the front gate, the laundry chute, the ore dock, the collapsed tunnel and the sunken channel. Let the players find them through people (Febb, Sparrow, Corra, Wix, the doctor), not by reading the map.',
    'Who comes along matters. Every extra prisoner makes stealth harder (disadvantage on group Stealth with more than three) and the ending richer.',
  ],
  npcs: [
    {
      id: 'pf_bgemalloch', name: 'Severin Malloch', title: 'Warden of Blackgate', kind: 'monster', art: 'court-wizard', monsterId: 'mage', shared: true,
      wants: 'Enough money to never come back down a mountain again, and to sleep one night without dreaming.', knows: 'Everything: who Sparrow is, who pays for her, what waits at the bottom of the long stair, and where every key hangs.',
      voice: 'Soft, precise, faintly apologetic, like a clerk refusing a loan. Calls prisoners by their cell numbers.', appearance: 'A neat, thin man in a grey coat buttoned to the throat, ink on his fingers, eyes red from never sleeping.',
      backstory: 'A court wizard who lost his post over gambling debts. The Regent gave him Blackgate as a favour. The Tallywife found him the first winter, in a dream.',
      gmNotes: 'Mage stat block. He fights from behind Gorrin and his dogs and runs for the long stair if things go badly, to bargain with the Tallywife. Wears the ring-key to the vault. If the heroes bring him to the Tallywife bound, she takes him gladly: he is three payments behind.',
    },
    {
      id: 'pf_bgegorrin', name: 'Gorrin Stave', title: 'the Gatekeeper, warden\'s champion', kind: 'monster', art: 'gladiator', monsterId: 'gladiator',
      wants: 'A good fight, and a way out of his own debts to the warden.', knows: 'That he is a prisoner too: Malloch holds his brother\'s pardon and will tear it up if Gorrin fails him.',
      voice: 'Slow and hoarse. Says very little, and says "aye" to mean anything at all.', appearance: 'A scarred giant of a man in a pit-fighter\'s harness, with a net over one shoulder and a trident he sharpens when nervous.',
      gmNotes: 'Gladiator stat block. If the heroes find his brother\'s pardon in the warden\'s strongbox and hand it to him, he steps aside and lets the fight happen without him.',
    },
    {
      id: 'pf_bgefebb', name: 'Ezzo Febb', title: 'forger, cell 21', kind: 'npc', art: 'sage', monsterId: 'commoner', shared: true,
      wants: 'To see the sky once more before he dies, and to find out what happened to his apprentice, who went down in the last Count.', knows: 'The prison\'s layout (his tin-plate map), the bell times, the secret crawl from his cell, and that the "accidents" go out by the dead-cart tunnel.',
      voice: 'Fussy and grand, an old scholar fallen on hard times. Corrects everyone\'s grammar, even in a riot.', appearance: 'Bald, bent and ink-stained, with half-moon spectacles held together with thread.',
      gmNotes: 'Can forge a guard\'s pass, a work order or the warden\'s signature in ten minutes with ink from the office or the infirmary (gives advantage on the Gatehouse bluff). He is slow: he cannot swim the channel or climb the goat path without help.',
    },
    {
      id: 'pf_bgecorra', name: 'Corra Quarrel', title: 'boss of the Lower tier', kind: 'monster', art: 'bandit-captain', monsterId: 'banditCaptain', shared: true,
      wants: 'Out, with her whole crew, and a little revenge on the way.', knows: 'Which guards take bribes (Lusk does), where the tobacco comes in (the laundry chute) and that the mine foremen keep blasting powder.',
      voice: 'Warm and loud, a market-stall voice, with a laugh that ends very suddenly when she is crossed.', appearance: 'A broad, grey-haired woman with a bent nose and a dozen rings tattooed on her fingers.',
      gmNotes: 'Bandit captain stat block. She will start a riot in the yard if the heroes bring weapons from the armory or promise her crew a way out (the ore barge holds them all). Betray her and the gang turns on the heroes at the worst moment.',
    },
    {
      id: 'pf_bgesparrow', name: 'Aveline Vellacourt', title: '"Sparrow", the quiet laundress', kind: 'npc', art: 'commoner', monsterId: 'noble',
      wants: 'To live, and then to decide whether she wants to be a duchess at all.', knows: 'Her uncle put her here when she was fifteen. She knows the laundry chute and the smugglers\' signal (three knocks on the hatch).',
      voice: 'Barely above a whisper. Chooses every word. Laughs once in the whole adventure and it surprises everyone, her most of all.', appearance: 'Slight and pale, cropped hair, laundress\'s red hands, and the straightest back in Blackgate.',
      backstory: 'Four years ago the Regent announced that his niece had drowned crossing the river. She was in a closed cart on her way to Blackgate. Malloch has kept her alive and nameless ever since, because a live heir is a monthly payment.',
      gmNotes: 'She does not trust anyone who knows her real name. A DC 15 Persuasion (advantage if they free her or show her the Regent\'s letter) wins her trust. Her testimony and the ledger together can unseat the Regent: that is the long game after the escape.',
    },
    {
      id: 'pf_bgelusk', name: 'Ruel Lusk', title: 'night sergeant', kind: 'monster', art: 'guard-captain', monsterId: 'veteran',
      wants: 'His pension, his drink and not to think about the Count.', knows: 'The patrol routes, the bell times and that the warden goes down the mine with a list. He has seen the list.',
      voice: 'Tired, gravelly, with a cough. "Not my business" is half his vocabulary.', appearance: 'A heavy, grey-stubbled sergeant with a ring of keys at his belt and a flask in his boot.',
      gmNotes: 'Veteran stat block. Bribable (a promised 50 gp from the vault, or Corra\'s tobacco money) to look away for one bell, or turned outright if shown the Count list with his own nephew\'s name on it (he is in the Lower tier, cell 9). He carries the Count slip.',
    },
    {
      id: 'pf_bgeines', name: 'Ines Callowell', title: 'prison doctor', kind: 'npc', art: 'healer', monsterId: 'priest',
      wants: 'To stop being part of it. She lacks the courage to do it alone.', knows: 'Which prisoners went down the mine, that none came back, and that Malloch has bought sleeping draught from her every month to quiet the ones on the list.',
      voice: 'Brisk and kind, then suddenly very quiet when she lies.', appearance: 'A tired woman of fifty in a stained apron, with a healer\'s satchel she never puts down.',
      gmNotes: 'Priest stat block. A DC 14 Persuasion or proof of the Count turns her. Then she gives the sleeping draught for the kitchen plan, heals the heroes (she has 3 potions of healing and her spells) and will testify against the warden.',
    },
    {
      id: 'pf_bgetally', name: 'The Tallywife', title: 'night hag of the deep', kind: 'monster', art: 'night-hag', monsterId: 'nightHag',
      wants: 'A soul of the blood royal to crown her collection, and a fair tally: she cannot abide a cheat, even her own.', knows: 'Every dream in Blackgate. She knows the heroes\' names, their fears and what they hid in their boots.',
      voice: 'A kindly grandmother with a slight lisp, counting under her breath between sentences. Never raises her voice.', appearance: 'A small old woman in a black shawl with long grey fingers, iron teeth and eyes like wet pebbles.',
      gmNotes: 'Night hag stat block. She bargains before she fights. She will take any soul that is "owed" in place of one that is offered: Malloch owes her three payments, so a bound warden settles the whole tally and she lets everyone else go. She keeps her word to the letter. If cheated, she haunts the cheat\'s dreams forever.',
    },
  ],
  handouts: [
    { id: 'count-slip', title: 'The Count slip', text: 'DEEP COUNT. Third bell. Six head.\nFish tank: all four new. Unmarked, no names on the book.\nCell 21: the old pen-man.\nLaundry: SPARROW. Whole and clean. By my own hand.\nLusk to bring them to the Mine gate in irons. No lamps on the stair.\n- M.' },
    { id: 'febb-plate', title: "Febb's tin plate", text: 'Scratched with a nail on the bottom of a tin plate: the Stack (two tiers, stairs both ends), the yard and its four towers, "MESS" and "WASH" below, "WARDEN" in a little box on the right with a bridge to it, and the mine on the left. Notes: "chute = river (ask the quiet girl)". "Powder in the foreman\'s cage". "Old adit WEST - fallen in - wind comes through". "Never take the long stair."' },
    { id: 'warden-ledger', title: "The warden's ledger", text: 'Received of A.V., for keeping of the Sparrow, one month: 200 gp.\nReceived of Below, for six head: uncut stones, est. 900 gp.\nReceived of A.V. ... 200 gp.\nOWED to Below: three tallies short. She says the next must be "of the crown" to square it.\nNote to self: A.V. will never know. A drowned girl cannot drown twice.' },
    { id: 'regent-letter', title: "The Regent's letter", text: 'Malloch,\nThe usual sum is enclosed. The council grows curious about the river crossing and the body that was never found. If anyone comes asking after the Sparrow, they are to work the deep seams until they stop asking.\nBurn this.\n- A.V., Regent of Vellacourt, under the heron seal' },
    { id: 'tally-board', title: "The Tallywife's board", text: 'A board of black wood notched in rows of six. Every notch has a name scratched beside it in a tiny, careful hand. The newest row is empty, with one larger notch at its end and a little crown carved over it.' },
  ],
  chapters: [
    {
      id: 'blackgate', title: 'Escape from Blackgate', level: 5,
      summary: 'One night in a prison-mine. The heroes wake in a cell with no gear, meet the people who could help them, find out about the Deep Count, and break out by stealth, riot, bribe or force, ideally with their gear and the right people beside them.',
      goal: 'Get out of Blackgate before third bell, recover the gear from the warden\'s vault, and choose who to take along: the forger, the gang, the heir.',
      map: blackgate,
      npcs: [
        { npc: 'pf_bgefebb', x: 32, y: 22 },
        { npc: 'pf_bgelusk', x: 44, y: 19 },
        { npc: 'pf_bgecorra', x: 40, y: 54 },
        { npc: 'pf_bgesparrow', x: 34, y: 66 },
        { npc: 'pf_bgeines', x: 50, y: 66 },
        { npc: 'pf_bgemalloch', x: 64, y: 7, hidden: true },
        { npc: 'pf_bgegorrin', x: 59, y: 5, hidden: true },
        { npc: 'pf_bgetally', x: 11, y: 61, hidden: true },
      ],
      scenes: [
        {
          room: 'Fish tank', title: 'Wake in the Stack',
          read: 'You wake on wet straw in a cell of black stone, and every bone aches. Your gear is gone. In the next cell an old man with mended spectacles is writing on a tin plate with a nail, and he says, without looking up: "Ah. The new fish. You have until third bell, if you are wondering."',
          gm: 'Let the players take stock: what did each hero hide? Febb talks through the bars. He wants out and he wants to know about his apprentice. Promise to take him and he shows them his crawl and gives his tin-plate map. Getting out of the cell: Febb\'s spoon-key (works once), picking the lock (DC 15, disadvantage without tools), jumping the patrol when it opens the door for the evening count, or bribing Lusk with a promise.',
          handout: 'febb-plate',
          treasure: 'Febb\'s stash under his bed: three sharpened spoon-shivs (daggers), a bent-wire lockpick set (thieves\' tools that break on a roll of 1), a stub of chalk and a potion of healing he has saved for six years.',
        },
        {
          room: 'Lower tier', title: 'Lights out', encounter: 'Lights-out patrol',
          read: 'Boots on the gallery. Keys. A lantern swings past the bars, and a tired voice reads out numbers. When it reaches your cell, it stops. "Ah. You lot. You\'re on the slip."',
          gm: 'Sergeant Lusk and the evening patrol do the count. Lusk carries the Count slip. He can be bribed or turned (see his profile), or the heroes can jump the patrol when the cell is opened: unarmed heroes should grapple, shove into cells and steal keys. If Corra\'s gang is on side, they throw slop and block the stairs. A fight here that lasts over 3 rounds puts the alarm at Wary.',
          handout: 'count-slip',
          treasure: 'Lusk\'s key ring (cells, the barred gate, the Catwalk gate), a flask of good brandy, 14 gp.',
        },
        {
          room: 'Mess hall', title: "Corra's table", encounter: "Corra's crew",
          read: 'The gang boss pours you a cup of something that is not water and pushes it across the table. "So," she says. "You\'re on the slip. So\'s the girl from the laundry. Which means tonight, for once, the warden wants something badly. I like it when the warden wants something."',
          gm: 'Corra knows the riot is the cover everyone needs. Her price: weapons from the armory, a way out for her crew (the ore barge holds them), or 100 gp from the vault. Agree and she starts the riot in the yard on the heroes\' signal. Insult her or try to take the tier from her and it is a fight; the gang yields when Corra drops below half her hit points.',
          treasure: 'Corra\'s purse: 60 gp, a pouch of tobacco (currency here: worth a bribe to the cook or the dock guards), and a potion of climbing.',
        },
        {
          room: 'Laundry', title: 'The quiet laundress',
          read: 'The woman at the mangle keeps working while you talk. Her hands are red to the elbow. When one of you says "Count", she stops, sets down the paddle and looks at you properly for the first time.',
          gm: 'Sparrow is wary: everyone who has known her name has sold it. Persuasion DC 15 (advantage if the heroes have the Count slip or the Regent\'s letter, or if Febb vouches). Once she trusts them, she shows the chute and the smugglers\' knock, and tells them the truth about who she is. The chute drops to the Midden sump and its otyugh: bring kitchen meat.',
          treasure: 'Prison grey and guard uniforms washed and ready (disguise kits in all but name). A smuggled letter in the chute hatch, for Corra, with 20 gp in it.',
        },
        {
          room: 'Infirmary', title: "The doctor's rounds", optional: true,
          read: 'The doctor looks at your faces, then at the door behind you, then back. "If you\'re here to kill me," she says, "please do it quietly. They\'re finally asleep."',
          gm: 'Ines Callowell knows about the Count and hates herself for it. Turn her with Persuasion (DC 14) or proof. She gives the sleeping draught (enough for the guards\' soup in the Kitchens: half the night watch sleeps from second bell), heals the heroes and becomes a witness. Wix from the Hole is her nephew: freeing him wins her at once.',
          treasure: '3 potions of healing, a healer\'s kit, a vial of sleeping draught (DC 13 Constitution save or asleep for an hour; one vial doses a cauldron).',
        },
        {
          room: 'Exercise yard', title: 'Riot in the yard', encounter: 'The towers',
          read: 'Somebody screams "NOW!" and the yard explodes. Prisoners boil out of the mess hall with benches and buckets and burning laundry. The tower lanterns swing wildly, crossbows thump, and the bell begins to ring.',
          gm: 'The riot is cover, not a battle the heroes must win. While it rages (4 rounds of chaos, then the guards rally), the heroes can cross the yard, take a tower or two, or slip into the barracks side. Taking the Bell tower stops the bell; taking the Lamp tower lets them choose where the light falls. If the heroes fight the towers head on, the encounter is the tower guards; armed prisoners on their side give advantage on the first round.',
          treasure: 'The Crossbow tower: 4 light crossbows and 60 bolts. A tower guard\'s purse: 9 gp.',
        },
        {
          room: 'Guard barracks', title: 'Through the barracks', encounter: 'Barracks at rest', optional: true,
          read: 'Thirty men asleep in the dark. Someone mutters in his sleep. Someone else turns over, and the bunk creaks like a door.',
          gm: 'The fastest way to the tower, the armory and the kennels is straight through here. A DC 13 group Stealth check passes (disadvantage at Lockdown or with more than three people). If the soup was drugged, only a few are awake. Uniforms on the pegs. The Kennels lie south: feed the dogs or they come silently.',
          treasure: 'Pay chest under the sergeant\'s bunk: 85 gp. The Armory beyond: chain shirts, shortswords, spears, light crossbows and 2 potions of healing.',
        },
        {
          room: "Warden's office", title: "The warden's hour", encounter: "The Warden's hour",
          read: 'The warden sets down his pen and folds his hands. "Cell eighteen. Well done. I mean that sincerely." The big man by the door lifts a trident from the wall. "Let us be practical. I can give you a pardon each, a horse each and a road. All you have to do is go, and leave the laundress where she is."',
          gm: 'Malloch talks first. He offers pardons (forged and worthless, DC 15 Insight) to leave Sparrow. He stalls for the bell. If it comes to a fight he casts from behind Gorrin and the dogs, then flees for the long stair at half hit points. Gorrin stands down if handed his brother\'s pardon from the strongbox (DC 13 Thieves\' Tools). The vault door is the bookcase behind the desk.',
          handout: 'warden-ledger',
          treasure: 'Strongbox: 250 gp, Gorrin\'s brother\'s pardon, the cell keys. On the warden: the ring-key to the vault, a wand of magic missiles and his spellbook (fireball, fly, invisibility and more).',
        },
        {
          room: "Warden's vault", title: 'Everything they took', encounter: 'Vault guardians',
          read: 'The racks are full of other people\'s lives. Then you see it: your own pack, your own sword, your own boots, your names chalked on the shelf in the warden\'s neat hand. Behind you, very quietly, an empty suit of armour lifts its head.',
          gm: 'The guardians wake for anyone without the warden\'s ring-key. Getting the gear is the big turn of the night: a hero who spends an action grabs and draws a weapon; donning armour takes the usual minutes. The Regent\'s letter is in the safe (DC 15 Thieves\' Tools, or the ring-key).',
          handout: 'regent-letter',
          treasure: 'All the heroes\' gear. Seized property: 400 gp in mixed coin, a ruby ring (250 gp), a +1 weapon of the GM\'s choice that belonged to a prisoner who never left, a bag of holding and a cloak of protection.',
        },
        {
          room: 'Mine head', title: 'Down the shafts', encounter: 'Mine foremen',
          read: 'The cage-lift groans. Ore carts stand nose to tail on the rails, and the foreman cracks his whip at nothing out of habit. "Shift\'s over," he says. "Who sent you down?"',
          gm: 'The mine is three escape routes in one: the Collapsed tunnel (blasting powder from the cage here), the Ore incline to the Ore dock and its barge (a runaway cart smashes the Ore gate), and the deep way past the Flooded gallery to the Tallywife. A good forged work order or Lusk\'s word sends the foremen to bed. Otherwise they fight, and a ride in a cart down the incline is the fastest way past them.',
          treasure: 'Two kegs of blasting powder, a foreman\'s purse (22 gp) and 50 gp of good silver ore.',
        },
        {
          room: 'Flooded gallery', title: 'Black water', encounter: 'Black water', optional: true,
          read: 'The rails slope into black water. Out in the dark something answers your lantern with clicking, and then a chorus of voices calls your names. One of them is Febb\'s apprentice. "Master? Is that you? It\'s so cold down here."',
          gm: 'The Tallywife\'s watchdogs. The voices come from the babbling spawn: what is left of last month\'s Count. If Febb is with the party he must make a DC 13 Wisdom save or wade toward it. The dry path along the rails avoids the deep water. The fight can be skipped by taking the Hag\'s crack from the Ore incline instead.',
          treasure: 'A drowned guard\'s purse (35 gp) and a potion of water breathing, useful for the Sunken channel.',
        },
        {
          room: 'Deep chamber', title: 'The Deep Count', encounter: 'The Deep Count',
          read: 'The old woman notches her board and smiles with iron teeth. "Six I was promised. And a crowned one. I see the crowned one, and I see four more, and I see a cheat who is not here." She turns the board around so you can see the empty row. "So. Who settles the tally?"',
          gm: 'The climax for those who go deep, or who are dragged there at third bell. The Tallywife bargains: she will accept Malloch, bound, in place of everyone else (he owes her three payments). She also accepts the heroes\' word to bring him within the hour, and holds them to it to the letter. Refuse, cheat or attack, and her spawn rise from the pool and a chuul climbs from the channel. Beaten, she fades into the Ethereal with a promise to remember their dreams. The Sunken channel to the river is right there.',
          handout: 'tally-board',
          treasure: 'The warden\'s payment, uncut gems in a bowl on her table (800 gp), and a ring of protection on a skeletal hand in one of the hanging cages.',
        },
        {
          room: 'Gatehouse', title: 'Breakout',
          encounter: 'The front gate',
          read: 'Cold air on your face. Somewhere behind you the bell is still ringing. In front of you is the last door in Blackgate, and on the other side of it, the whole rest of the world.',
          gm: 'Pick the scene for the route the heroes chose. Gatehouse: bluff with uniforms and Febb\'s pass (DC 14 Deception), bribe, or fight the chaplain and the gate watch, then 3 rounds of crossbows on the Switchback road. Laundry chute: the Midden sump and its otyugh, then the river or the smugglers\' skiff. Ore dock: pay or beat two dozing guards, pole the barge into the current (DC 12 Athletics). Collapsed tunnel: blast it and climb down the West cliff. Sunken channel: swim 60 feet underwater. Whoever they bring along shapes the ending.',
          treasure: 'At the gate: the gate watch\'s strongbox (40 gp) and two riding horses in the stable outside.',
        },
      ],
      wrapUp:
        'Dawn finds the heroes on the river or the mountain, with Blackgate behind them. Count who came out: the gang, the forger, the heir, the doctor. If Sparrow is free and they hold the ledger or the Regent\'s letter, the Regent\'s days are numbered; if Malloch went to the Tallywife, Blackgate has a new warden by the week\'s end, and it is less clear what kind.',
    },
  ],
  ending:
    'Success: the heroes walk out with their gear and the people they chose. With Aveline, the ledger and the doctor\'s testimony, the Vellacourt council can be made to listen, and a grateful duchess (if she chooses the title) remembers the people who believed her. Febb sees the sky. Corra\'s crew owes them a favour in every river town. Failure: if the Count happens with the heroes in irons, they meet the Tallywife bound and helpless; play the bargain anyway, because she loves a clever offer, and the last escape is through the Sunken channel. If Aveline is left behind, she is gone by morning. What next: the Regent sends hunters after the "dead" girl and the strangers with her, and the Tallywife, owed or paid, never forgets a name.',
};

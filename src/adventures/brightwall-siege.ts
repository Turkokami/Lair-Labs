// The Siege of Brightwall: a three-part mini-campaign for four heroes, levels 7 to 8.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

// A stream that winds through a list of points, three squares wide.
function river(b: MapBuilder, pts: [number, number][], deep: boolean) {
  for (let p = 0; p < pts.length - 1; p++) {
    const [ax, ay] = pts[p], [bx, by] = pts[p + 1];
    const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    for (let s = 0; s <= n; s++) b.water(Math.round(ax + ((bx - ax) * s) / n) - 1, Math.round(ay + ((by - ay) * s) / n), 3, 1, deep);
  }
}

// ---------- The hill town: cliffs, walls, the crag and the stream (shared by parts 1 and 3) ----------
function brightwallGround(b: MapBuilder, o: { breach?: boolean } = {}) {
  const r = rng(7301);
  let wl = 3;
  for (let y = 0; y < 80; y++) {
    wl = Math.max(1, Math.min(4, wl + Math.round((r() - 0.5) * 2)));
    b.rock(0, y, wl, 1);
  }
  for (let x = 0; x < 80; x++) b.rock(x, 0, 1, 1 + Math.floor(r() * 2));
  b.rock(24, 0, 12, 2).rock(66, 0, 6, 2);
  // streets first: the stream is laid over them afterwards
  b.paint(36, 16, 4, 42, 'stone-cobble'); // Lamp Street
  b.paint(4, 27, 62, 3, 'stone-cobble'); // Wall Road
  b.paint(33, 24, 11, 7, 'stone-cobble'); // Fountain Cross
  b.paint(12, 30, 4, 32, 'dirt'); // Miners' Row
  b.paint(20, 44, 16, 2, 'stone-cobble'); // Market Lane
  b.paint(40, 46, 26, 2, 'stone-cobble'); // Temple Way
  b.paint(28, 50, 20, 8, 'stone-cobble'); // Gate Square
  b.paint(22, 39, 13, 12, 'stone-cobble'); // the market
  b.paint(24, 2, 25, 12, 'stone-flagstone'); // the top of the crag
  b.paint(16, 66, 50, 14, 'dirt'); // the killing ground outside the gate
  // the crag the Beacon stands on, with three ways up
  b.rock(21, 2, 3, 12).rock(21, 14, 30, 2).rock(49, 2, 2, 12);
  b.floor(36, 14, 2, 2, 'stone-flagstone'); // the Signal Stair
  b.floor(21, 9, 3, 1, 'dirt'); // the goat path
  b.floor(49, 4, 2, 1, 'stone-flagstone').door(49, 4, 'w', 'closed', 'door-iron'); // the Watch Door
  // the town walls: east and south, with towers standing out from them
  b.rock(68, 2, 2, 64).rock(0, 64, 70, 2);
  b.rock(70, 19, 2, 4).rock(70, 39, 2, 4).rock(70, 56, 2, 4).rock(11, 66, 3, 2).rock(27, 66, 3, 2).rock(51, 66, 3, 2).rock(61, 66, 3, 2);
  b.paint(66, 2, 2, 62, 'stone-flagstone').paint(4, 62, 62, 2, 'stone-flagstone').paint(51, 2, 15, 3, 'stone-cobble');
  for (let y = 6; y < 62; y++) if (![12, 13, 30, 31, 48, 49].includes(y) && !(o.breach && y >= 33 && y <= 42)) b.wall(66, y, 'w');
  for (let x = 4; x < 66; x++) if ((x < 31 || x > 44) && ![10, 11, 24, 25, 52, 53, 60, 61].includes(x)) b.wall(x, 62, 'n');
  b.props_('stairs-up', [[65, 12], [65, 30], [65, 48], [10, 61], [24, 61], [52, 61], [60, 61]]);
  b.floor(36, 58, 4, 8, 'stone-cobble'); // the gate passage through the south wall
  // the Brightrun: from the spring under the crag, down through town and out by the water-gate
  b.water(18, 16, 2, 11).water(17, 27, 2, 8).pool(17.5, 37.5, 3.5, 3, true).water(17, 40, 2, 8).water(18, 48, 2, 7).water(19, 55, 2, 11).water(19, 66, 2, 6).water(20, 72, 2, 8);
  b.floor(16, 27, 4, 3, 'wood-planks'); // Wall Road bridge
  b.floor(16, 44, 4, 2, 'wood-planks'); // Market Lane bridge
  b.floor(19, 62, 2, 2, 'stone-flagstone'); // the wall-walk over the culvert
  b.door(19, 65, 's', 'locked', 'bars').door(20, 65, 's', 'locked', 'bars');
  b.area('The Brightrun spring', [[16, 15, 5, 4]], { read: 'Clear water bubbles out from under the crag and runs away downhill in a stone channel. Women queue here with buckets, watching the sky for fire-pots.', gm: 'The town\'s only water now the well by the gate is fouled. If the legion poisons the stream, Brightwall lasts three days.', label: [18, 16] });
  b.prop('road-shrine', 20, 16).prop('reeds', 17, 18).prop('water-barrel', 20, 18);
  b.area('The goat path', [[19, 8, 5, 3]], { gm: 'A goat track up the west face of the crag, narrow enough for one at a time. Few townsfolk remember it (DC 15 History or ask Mabb). The third way up to the Beacon.', label: [22, 9] });
}

// ---------- Part 1: Brightwall under siege ----------
function brightwallBesieged() {
  const b = new MapBuilder('adv-brightwall-siege-town', 'Brightwall under siege', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone' });
  brightwallGround(b);

  // ----- the Great Gate -----
  for (let x = 36; x < 40; x++) b.door(x, 65, 's', 'closed', 'portcullis').door(x, 58, 'n', 'open', 'door-double');
  b.area('Great Gate', [[36, 58, 4, 8]], { read: 'A dark stone throat through the wall, ten paces long. The portcullis at the far end shudders every time something big walks past outside.', gm: 'The inner gates stand open so the defenders can run to the portcullis. Murder holes in both towers look down into the passage. If the portcullis falls, close the inner gates (two actions, DC 14 Athletics each).', label: [37, 61] });
  b.building('West gate-tower', 31, 58, 5, 6, { mat: 'stone-flagstone', read: 'Arrow slits, a winch for the portcullis and a dozen crossbows nobody has had time to load.', gm: 'The portcullis winch is here. Smashing it (AC 15, 20 hp) drops the portcullis for good: no one opens it again without a day\'s work.', doors: [[33, 58, 'n'], [31, 62, 'w'], [35, 61, 'e']] });
  b.prop('winch', 34, 59).prop('weapon-rack', 32, 59).prop('crate', 32, 62).prop('stair-spiral', 34, 62);
  b.building('East gate-tower', 40, 58, 5, 6, { mat: 'stone-flagstone', gm: 'The murder holes. A cauldron of hot sand stands ready: poured on the passage it does 10 (3d6) fire damage to everything below, once.', doors: [[42, 58, 'n'], [44, 62, 'e'], [40, 61, 'w']] });
  b.prop('cauldron', 41, 60).prop('brazier', 43, 59).prop('spear-rack', 43, 62).light(43, 59, 10, 15, '#ff9a3c');
  b.area('Gate Square', [[28, 50, 20, 8]], { read: 'A square of blood-dark cobbles behind the gate. Militia in borrowed helmets crouch behind carts turned on their sides, and a girl runs between them with a bucket of arrows.', gm: 'The heart of the defence. Captain Hedda Ferrandine gives orders from an upturned cart. About forty militia and twelve trained watch hold Brightwall: count them as background unless the heroes lead them.', label: [37, 53] });
  b.props_('barricade-wood', [[30, 56], [44, 56], [34, 55]]).props_('cart', [[30, 52], [45, 52]], 90).props_('brazier', [[31, 51], [45, 55]]).prop('war-banner', 38, 50).prop('weapon-barrel', 46, 51).prop('water-barrel', 29, 54).props_('cot', [[42, 51], [43, 51]]).prop('sandbags', 40, 56);
  b.light(31, 51, 15, 20).light(45, 55, 15, 20);

  // ----- outside the walls -----
  b.area('The killing ground', [[22, 66, 40, 13]], { read: 'Below the wall the slope is churned to mud and littered with arrows, dead horses and broken ladders. Beyond bowshot, a line of wooden mantlets hides the legion. Their drums beat out a slow count.', gm: 'Anyone out here is in plain view of the legion\'s archers: each round, DC 15 Dexterity save or 7 (2d6) piercing damage. The drums are a signal code: Captain Hedda can read it (or DC 16 History).', label: [40, 72] });
  b.props_('barricade-wood', [[30, 76], [36, 77], [42, 76], [48, 77], [54, 76]]).props_('skeleton-lying', [[33, 69], [45, 70], [26, 72]]).props_('ladder', [[24, 66], [48, 66], [58, 66]]).prop('caltrops', 39, 69).prop('catapult', 58, 78).prop('war-banner', 40, 78).props_('mud-patch', [[34, 71], [44, 73]]).prop('debris-wood', 50, 70);
  b.mud(30, 70, 14, 3);
  b.area('East slope', [[70, 22, 10, 28]], { read: 'The hill falls away steeply under the east wall. Scaling ladders lie in the grass like the bones of something long.', gm: 'The legion tests this wall every few hours. A siege tower is being built far down the slope; it will not be ready until the final assault.', label: [75, 34] });
  b.props_('ladder', [[70, 28], [70, 32], [70, 36], [70, 45]]).prop('siege-tower', 75, 10).props_('barricade-wood', [[76, 30], [77, 44]]).props_('skeleton-lying', [[73, 33], [72, 47]]).prop('boulder', 76, 52);
  b.encounter('Ladders on the east wall', [60, 26, 20, 22], [['hobgoblin', 10], ['ironCollarSergeant', 2], ['ogre', 2]], 'low');
  b.area('East wall-walk', [[66, 4, 2, 58]], { read: 'A stone walk behind the battlements, slick with rain and worse. Every twenty paces a militiaman stands with a pole for pushing ladders away.', gm: 'From the walk, defenders have three-quarters cover against archers below. Pushing a ladder off: DC 15 Athletics (DC 20 if two hobgoblins are on it).', label: [66, 20] });
  b.props_('brazier', [[67, 16], [67, 40]]).props_('barrel', [[67, 24], [66, 34]]).prop('sandbags', 67, 52).light(67, 16, 10, 15).light(67, 40, 10, 15);
  b.area('Water-gate', [[17, 60, 6, 6]], { read: 'The Brightrun slides out under the wall through an iron grate furred with weed. The bars are old. Some of them are newly bent.', gm: 'The weak point of the wall. DC 14 Perception: two bars are bent from outside, and fresh worg prints are pressed into the mud bank. Outriders sniff here at night. The grate\'s lock: DC 16 thieves\' tools; Hedda has the key.', label: [19, 61] });
  b.prop('bridge-plank', 19, 62).prop('reeds', 18, 59);
  b.encounter('Outriders at the water-gate', [14, 66, 14, 12], [['worg', 6], ['goblinWarrior', 6], ['bugbear', 4]], 'low');

  // ----- the crag and the Beacon -----
  b.area('Beacon yard', [[24, 2, 25, 12]], { read: 'The top of the crag is flat and windy, ringed with a waist-high parapet. From here you can see the whole valley, and the legion\'s camp fires laid out in perfect squares like a map of a city.', gm: 'Fuel stores, the Keeper\'s house and the tower. Fresh mud on the flagstones runs between the tower door and the Keeper\'s house (DC 13 Survival: large boots, bugbear-sized, three nights old).', label: [41, 12] });
  b.props_('barrel-group', [[25, 12], [47, 12]]).prop('winch', 36, 3).prop('telescope', 47, 3).prop('log-pile', 25, 4).prop('crate-stack', 47, 10).prop('brazier', 36, 12).prop('stairs-down', 37, 13).prop('lamp-post', 25, 9);
  b.light(36, 12, 10, 15);
  b.building('Beacon tower', 26, 6, 9, 6, { mat: 'stone-flagstone', read: 'A round stone stairwell climbs the inside of the tower. Brass plaques on the wall list three hundred years of Keepers. The newest name has been scratched almost through.', gm: 'No door was forced: whoever did this had a key. The scratched name is Teodric Wendercott\'s; he did it himself last night, sick with shame (DC 15 Investigation: the knife is still on the sill, his initials on the hilt).', doors: [[30, 11, 's', 'closed', 'door-iron'], [30, 6, 'n', 'closed']], windows: [[26, 8, 'w'], [34, 8, 'e']] });
  b.prop('stair-spiral', 32, 8).prop('heraldic-crest', 27, 7).prop('weapon-rack', 33, 10).prop('lantern-hanging', 29, 9).light(29, 9, 10, 15);
  b.building('Lantern room', 26, 2, 9, 4, { mat: 'marble', read: 'The top of the Beacon. A great lens of polished crystal, taller than a man, lies cracked straight across. Beneath it, the bronze cradle that should hold the Dawnstone is empty.', gm: 'The lens was broken with a spell from inside the room (DC 15 Arcana: a thunder spell, cast at arm\'s length). The cradle was opened with its own key. A DC 17 Arcana check shows the lens can be mended: the temple\'s altar crystal could fill the crack.', windows: [[26, 3, 'w'], [34, 3, 'e']] });
  b.prop('brazier-pedestal', 30, 3).prop('orb-pedestal', 31, 4).prop('debris-wood', 28, 4).prop('candle-ring', 33, 3).prop('book-pile', 27, 3);
  b.building("Keeper's house", 38, 4, 9, 6, { read: 'A neat house that smells of lamp oil and ink. A child\'s room at the back is very tidy, as if nobody has slept in it for a month.', gm: 'Teodric\'s house. His desk drawer (DC 15 to pick) holds a knotted cord of brown hair and a note in a neat soldier\'s hand (handout). He says his daughter Elske is visiting her aunt in Harrowford. She is not.', doors: [[42, 9, 's']], windows: [[38, 6, 'w'], [46, 6, 'e']] });
  b.prop('writing-desk', 39, 5).prop('bookshelf', 40, 4).prop('bed', 45, 5).prop('crib', 44, 8).prop('fireplace', 42, 4).prop('chest', 39, 8).prop('dresser', 46, 8);
  b.encounter('The Keeper unmasked', [24, 2, 25, 12], [['mage', 1], ['animatedArmor', 4], ['bugbear', 8], ['ironCollarSergeant', 2]], 'high');
  b.area('Signal Stair', [[34, 13, 6, 4]], { read: 'Forty steps cut into the rock, so steep you climb with your hands.', gm: 'The main way up the crag. Two can fight abreast on it; anyone shoved off falls 20 feet (2d6 bludgeoning).', label: [36, 15] });
  b.props_('stair-grand', [[36, 14], [37, 15]]);

  // ----- the upper town -----
  b.building("Reeve's hall", 41, 17, 10, 8, { mat: 'wood-planks-dark', read: 'A hall of dark beams where the town council argues in whispers. On the long table, someone has written the number of grain sacks left in chalk, and crossed it out, and written a smaller one.', gm: 'Reeve Lorimer Pettigrew wants to accept the legion\'s terms. He has been meeting the herald at the gate, which makes him look like the traitor. He is only frightened. The town strongbox (DC 18 to pick, or the reeve\'s key) holds 400 gp, the town\'s war chest.', doors: [[41, 20, 'w'], [45, 24, 's']], windows: [[43, 17, 'n'], [48, 17, 'n']] });
  b.prop('table-long', 45, 20).props_('chair-high-back', [[44, 19], [47, 19], [44, 21], [47, 21]]).prop('fireplace', 49, 18).prop('strongbox', 49, 23).prop('banner-hanging-tall', 42, 18).prop('notice-board', 42, 23).light(49, 18, 10, 15);
  b.building('Lamp-oil chandlery', 25, 17, 9, 7, { gm: 'The Beacon\'s supplier. The chandler sold Teodric nothing for a month: "Said he had no need, Keeper did. Odd, with winter coming." A good clue for anyone asking around.', doors: [[33, 20, 'e'], [29, 23, 's']] });
  b.prop('shop-counter', 27, 19).props_('barrel-stack', [[26, 18], [32, 18]]).prop('shelf-jars', 30, 18).prop('candles', 28, 21).prop('lantern-cluster', 31, 21);
  b.building('Barracks and armoury', 54, 16, 11, 8, { mat: 'stone-flagstone', read: 'Bunks for sixty and men for thirty. The armoury racks are half empty, and the armourer sleeps sitting up beside his anvil.', gm: 'Captain Hedda can open the armoury to the heroes: a +1 longbow, 40 arrows and two potions of healing. Wounded watchmen here confirm the bugbears came from inside the walls, from the west.', doors: [[59, 23, 's'], [54, 19, 'w']] });
  b.props_('bunk-bed', [[55, 17], [57, 17], [59, 17], [61, 17]]).props_('weapon-rack', [[63, 17], [63, 19]]).prop('armor-stand', 63, 21).prop('anvil', 56, 21).prop('footlocker', 58, 21).prop('stove', 60, 21);
  b.area('Drill yard', [[54, 24, 11, 3]], { gm: 'Where the militia learn which end of a spear to hold. Useful for a quick training scene: give the militia advantage on one check in part 3.', label: [59, 25] });
  b.props_('training-dummy', [[55, 25], [57, 25]]).prop('archery-target', 63, 25).prop('weapon-barrel', 61, 25);
  b.area('Kitchen gardens', [[51, 5, 15, 9]], { read: 'Cabbages, bean poles and beehives, all trampled by soldiers running to the wall.', gm: 'A quiet corner between the crag and the east wall. Wall Road North runs above it to the Watch Door: the back way onto the crag.', label: [58, 9] });
  b.props_('crop-rows', [[53, 7], [53, 10], [56, 7], [56, 10]]).prop('scarecrow', 59, 8).props_('beehive', [[62, 6], [63, 6]]).prop('well', 61, 11).prop('chicken-coop', 52, 12);
  b.area('Fountain Cross', [[33, 24, 11, 7]], { read: 'Lamp Street meets Wall Road at a fountain with a stone lamplighter on top. A list of the dead is nailed to its rim, and it is long.', gm: 'The crossroads of the town. Every runner passes here: the best place to hear rumours (DC 13 Investigation or Persuasion for one clue).', label: [41, 26] });
  b.prop('fountain', 38, 26).prop('notice-board', 34, 25).props_('lamp-post', [[35, 30], [42, 24]]).prop('bench', 42, 29);
  b.light(35, 30, 10, 15).light(42, 24, 10, 15);

  // ----- the west ward and the old mine -----
  b.building('Old Smelt House', 5, 16, 10, 10, { mat: 'stone-flagstone', read: 'A cold stone hall where silver was smelted two hundred years ago. The furnaces are dead and the floor is grey with old slag. A door at the back is new oak, and locked.', gm: 'Boarded up since the mine closed. The lock on the back room was oiled recently (DC 14 Perception). Behind the shaft-room wall is a second way in: a secret door (DC 16 Perception) beside the old ore chute.', doors: [[9, 25, 's'], [14, 23, 'e']], windows: [[5, 20, 'w']] });
  b.wallRun(11, 16, 5, 'w').wallRun(11, 20, 4, 's').door(11, 18, 'w', 'secret').door(13, 20, 's', 'locked', 'door-iron');
  b.area('Shaft room', [[11, 16, 4, 5]], { read: 'A square hole drops into blackness. The windlass over it has a brand-new rope, and the rope is wet.', gm: 'The old silver shaft, 120 feet down into the workings. This is how the bugbears came in, and how the Dawnstone went out. Part 2 starts at its foot.', label: [12, 18] });
  b.pit(12, 17, 2, 2).prop('winch', 14, 17).prop('ladder', 12, 19).prop('rope-coil', 14, 19);
  b.props_('forge', [[6, 17]]).prop('anvil', 8, 18).prop('ore-pile', 6, 23).prop('mine-cart', 9, 22).prop('scales', 7, 20).prop('workbench', 10, 17).prop('pickaxes', 6, 21);
  b.note(12, 18, 'Part 2 starts here: down the shaft into the old silver mine.');
  b.encounter('Sappers in the Smelt House', [5, 16, 10, 10], [['bugbear', 6], ['ogre', 2]], 'low');
  b.building("Mabb's cottage", 5, 31, 6, 6, { read: 'A low cottage full of rock samples. Every shelf holds lumps of ore with labels in a shaky hand.', gm: 'Old Mabb Greyhallow, the last miner, lives here. She knows the workings by heart and has a hand-drawn map of them (she will lend it, or come herself).', doors: [[10, 33, 'e']] });
  b.prop('bed', 6, 32).prop('hearth-oven', 9, 31).prop('ore-pile', 6, 35).prop('pickaxes', 9, 35).prop('rocking-chair', 8, 33).light(9, 31, 5, 10);
  b.building('Shuttered cottages', 5, 38, 6, 6, { gm: 'Two families hide here with the doors nailed shut. A boy, Wim, saw "big hairy men" carrying a glowing box toward the Smelt House on the night the Beacon died.', doors: [[10, 40, 'e']] });
  b.prop('bed-double', 6, 39).prop('table-square', 8, 41).prop('broken-furniture', 6, 42).prop('cupboard', 9, 39);
  b.building('Stables', 4, 45, 7, 6, { mat: 'dirt', gm: 'Ser Calder\'s warhorse and three ponies. Calder wants to ride out through the gate and try to reach the knights. Three riders already tried; the legion threw their heads back over the wall.', doors: [[10, 47, 'e', 'open']] });
  b.props_('hay-bale', [[5, 46], [5, 49]]).prop('horse-trough', 8, 49).prop('hitching-post', 7, 46);
  b.building('Smithy', 4, 52, 8, 7, { mat: 'brick-floor', read: 'A smith hammers spearheads out of door hinges. The forge is the only warm place in the west ward.', gm: 'The smith mends armour and weapons for free. He saw lights moving on the Beacon crag at midnight, the night it went dark, "small and blue, like a mage\'s light".', doors: [[11, 55, 'e']] });
  b.prop('forge', 5, 53).prop('anvil', 7, 54).prop('grindstone', 9, 57).prop('weapon-barrel', 5, 57).prop('water-barrel', 10, 53).light(5, 53, 15, 20, '#ff9a3c');
  b.area("Miners' Row", [[12, 30, 4, 32]], { read: 'A crooked dirt lane of miners\' cottages, most of them empty since the silver ran out.', gm: 'The quiet way from the west ward down to the water-gate. Few watchmen come here.', label: [13, 46] });
  b.props_('lamp-post', [[14, 34], [14, 50]]).prop('handcart', 13, 42).prop('barrel', 15, 57);
  b.area('The Well-Pool', [[14, 34, 8, 7]], { read: 'The stream widens into a deep stone basin where the town draws its water. Ducks paddle in circles, unbothered.', gm: 'Deep water in the middle (swim, DC 10 Athletics). A rope ladder hangs into it: in the old days miners washed ore here.', label: [17, 37] });
  b.props_('reeds', [[14, 36], [21, 39]]).prop('bench', 21, 35);

  // ----- the middle town: the hospital and the temple -----
  b.building('Cloth Hall', 22, 31, 12, 8, { mat: 'wood-planks', read: 'The wool merchants\' hall is a hospital now. Bales of cloth are torn into bandages, and the wounded lie in rows on the floor where buyers used to haggle.', gm: 'Mother Agathe runs it. Sixty wounded, eight healers, no sleep. A dying watchman, Corran, swears he saw the Keeper at the Smelt House at midnight with two "giant shadows" (DC 13 Medicine to keep him alive long enough to say it).', doors: [[27, 38, 's', 'open', 'door-double'], [28, 38, 's', 'open', 'door-double'], [33, 34, 'e']], windows: [[22, 34, 'w'], [26, 31, 'n'], [30, 31, 'n']] });
  b.props_('cot', [[23, 32], [25, 32], [27, 32], [29, 32], [23, 36], [25, 36], [29, 36], [31, 36]]).prop('table-long', 27, 34).prop('apothecary-counter', 32, 32).prop('washbasin', 31, 34).prop('shelf-jars', 23, 34).light(27, 34, 10, 15);
  b.area('Field hospital', [[22, 39, 13, 12]], { read: 'The market square is full of tents. Stalls hold bandages instead of apples. Somewhere a man is singing to keep from screaming, and a priest in a bloody apron is singing along.', gm: 'More wounded, the cook-fires and the dead-cart. At dusk the bugbears who came up the shaft strike here, to kill the healers and spread panic, at the same moment as ladders go up on the east wall.', label: [28, 44] });
  b.props_('tent', [[24, 41], [31, 41], [24, 48], [31, 48]]).props_('cot', [[27, 41], [28, 41], [27, 48], [28, 48]]).prop('cauldron-tripod', 28, 46).prop('water-barrel', 34, 40).prop('cart', 33, 49).prop('market-stall', 22, 43).prop('herbs-drying', 22, 47).prop('table-trestle', 30, 45);
  b.light(28, 46, 10, 20);
  b.encounter('Knives in the field hospital', [22, 39, 13, 12], [['bugbear', 8], ['ironCollarSergeant', 1]], 'low');
  b.building('Temple of the Kindler', 44, 32, 14, 14, { mat: 'marble', read: 'A tall temple of white stone. On the altar a crystal the size of a fist holds a steady flame that never needs fuel. Children sleep under the pews in rows.', gm: 'The Kindler is the god of hearth-fires and watch-fires. The altar crystal is a shard of the same stone as the Dawnstone: with the rite (handout, part 3) it can mend the Beacon\'s lens. Mother Agathe will give it up only if she believes the Beacon will be lit.', doors: [[44, 38, 'w', 'closed', 'door-double'], [44, 39, 'w', 'closed', 'door-double'], [57, 41, 'e'], [50, 45, 's']], windows: [[47, 32, 'n'], [51, 32, 'n'], [44, 34, 'w'], [44, 43, 'w']] });
  b.wallRun(53, 32, 5, 'w').wallRun(53, 36, 5, 's').door(53, 34, 'w');
  b.area('Sacristy', [[53, 32, 5, 5]], { gm: 'Vestments, candles and a stair down to the crypt. Agathe keeps the temple\'s silver here (a censer and two chalices, 150 gp) and will not mind if it buys arrows.', label: [55, 34] });
  b.prop('altar', 49, 33).prop('brazier-everburning', 50, 34).props_('statue-tall-robed', [[45, 33], [52, 33]]).props_('pew', [[47, 37], [51, 37], [47, 39], [51, 39], [47, 41], [51, 41]]).prop('font', 49, 44).props_('candelabra', [[46, 35], [52, 35]]).prop('stairs-down', 56, 35).prop('wardrobe', 54, 33).prop('chalices', 56, 33);
  b.light(50, 34, 15, 20, '#ffe3a8');
  b.area('Temple graveyard', [[58, 32, 8, 14]], { read: 'Old stones lean in the wet grass. Along the wall, a row of fresh graves waits, already dug.', gm: 'The sexton digs ahead. The graves are a grim count: twelve dug, nine filled.', label: [61, 38] });
  b.props_('burial-slab', [[59, 33], [62, 33], [59, 36], [62, 36]]).props_('open-grave', [[64, 40], [64, 42], [64, 44]]).prop('tree-dead', 60, 42).prop('cairn', 62, 39);
  b.building('Cooperage', 42, 49, 7, 6, { gm: 'On fire. A fire-pot came over the wall an hour ago. Barrels of pitch inside will go up in 3 rounds.', doors: [[45, 49, 'n']] });
  b.props_('barrel-stack', [[43, 50], [47, 52]]).prop('burning-wreckage', 45, 52).prop('workbench', 43, 53).light(45, 52, 10, 20, '#ff7a2a');
  b.building('Weaver\'s house', 50, 49, 7, 6, { gm: 'Smoke pours from the shutters. A grandmother and two children are trapped upstairs (see the scene Fire on Cooper\'s Lane).', doors: [[53, 49, 'n']] });
  b.prop('loom', 51, 50).prop('spinning-wheel', 55, 50).prop('bed', 55, 53).prop('burning-wreckage', 52, 52).light(52, 52, 10, 20, '#ff7a2a');
  b.building('Tanner\'s yard', 58, 49, 7, 6, { mat: 'dirt', gm: 'Stinking vats and hides. Its back wall is the south wall-walk: a quick way up.', doors: [[61, 49, 'n']] });
  b.props_('cauldron', [[59, 51], [62, 51]]).prop('tool-wall', 63, 53).prop('water-trough', 59, 53);
  b.area("Cooper's Lane", [[40, 46, 26, 3]], { read: 'Fire roars out of a cooper\'s shop. Pitch-smoke rolls down the lane, and from the house next door a child is screaming.', gm: 'Fire-pots from the legion\'s catapults. See the scene Fire on Cooper\'s Lane.', label: [52, 47] });
  b.props_('burning-ground', [[46, 47], [49, 48]]).prop('water-trough', 41, 47).prop('handcart', 58, 47);

  b.area('Hilltop orchard', [[4, 2, 16, 12]], { read: 'Old apple trees lean over the west cliff. From the edge you can see the river far below, and the legion\'s outriders watering their worgs in it.', gm: 'A lookout no one uses. The goat path up the crag starts at the east end of the orchard. A DC 15 Perception from the cliff edge spots bugbear tracks coming and going from the Smelt House at night.', label: [11, 7] });
  b.props_('tree-oak', [[6, 4], [10, 3], [14, 5], [7, 9], [12, 10], [17, 4]]).prop('beehive', 18, 11).prop('bench', 9, 6).prop('stump', 15, 9);
  b.start(36, 52, 3, 3);
  return b.build();
}

// ---------- Part 2: the night sortie ----------
function theSortie() {
  const b = new MapBuilder('adv-brightwall-siege-camp', 'The sortie: under the hill and into the camp', 80, 80, { open: true, floor: 'grass', ambient: 'dark', wallStyle: 'wood' });
  const r = rng(8802);
  for (let x = 0; x < 80; x++) {
    const base = x < 12 ? 46 : x < 30 ? 46 - ((x - 12) * 16) / 18 : x < 50 ? 30 - ((x - 30) * 12) / 20 : 18 - ((x - 50) * 9) / 29;
    b.rock(x, 0, 1, Math.round(base + (r() - 0.5) * 2));
  }
  b.note(60, 13, 'Up this slope: Brightwall\'s south wall.');

  // ----- the old silver mine under the hill -----
  b.cave('Shaft foot', 8, 6, 5, 4, { seed: 31, read: 'You climb down the last of the ladder into a cave that smells of wet stone and old smoke. Rails run off into the dark. Bugbear footprints, big as shovels, lead east and south.', gm: 'The night clock starts now: six watches until dawn. Mabb knows two ways: east through the old stope to the legion\'s counter-mine (fast, guarded), or south past the drowned gallery to the old adit (slow, quiet).' });
  b.prop('ladder', 8, 4).prop('mine-cart', 10, 7).prop('mine-rails', 11, 8).prop('lantern-hook', 5, 6).prop('rope-coil', 6, 8).light(5, 6, 5, 10);
  b.start(6, 4, 3, 3);
  b.tunnel([[12, 7], [20, 9], [25, 12]], 2, { seed: 32 });
  b.cave('Old silver stope', 31, 13, 7, 5, { seed: 33, read: 'A great hollow where the silver vein was dug out, propped with black timbers. Rusted carts sit on rails that go nowhere. Somewhere, water drips in a slow count.', gm: 'Abandoned for two centuries. The timbers groan: a fireball or thunder spell here brings part of the roof down (DC 15 Dexterity save, 4d10 bludgeoning). A DC 16 Perception finds a draught behind the north wall: the secret door to the Miners\' chapel.' });
  b.props_('mine-support', [[27, 11], [35, 11], [27, 15], [35, 15]]).prop('mine-rails', 31, 13).props_('mine-cart', [[29, 14], [33, 12]]).prop('ore-pile', 34, 15).prop('pickaxes', 26, 13).prop('stalactites', 31, 10);
  b.room("Miners' chapel", 27, 2, 7, 4, { mat: 'cave-floor', read: 'A tiny chapel cut into the rock. A carved lamp-bearer stands over an altar of raw silver ore, and miners\' tokens hang on nails by the hundred.', gm: 'The miners\' guild hid its last treasure here when the mine closed. Mabb weeps when she sees it. A good place for a short rest: nothing in the legion knows of it.' });
  b.hall(30, 6, 30, 10, 1, { mat: 'cave-floor' }).door(30, 5, 's', 'secret');
  b.prop('altar', 30, 2).prop('statue', 28, 3).props_('candles', [[29, 3], [32, 3]]).prop('coffer', 33, 4).prop('offering-bowl', 31, 4).light(30, 3, 5, 10, '#ffe3a8');
  b.tunnel([[7, 10], [5, 16], [9, 21]], 2, { seed: 34 });
  b.cave('Drowned gallery', 11, 25, 6, 4, { seed: 35, read: 'The tunnel opens into a flooded gallery. Black water fills the middle, and on the ledges around it lie the bones of miners, picked clean and somehow glistening.', gm: 'A black pudding lives in the water and two ochre jellies on the ceiling: they ate the miners who were trapped here when the gallery flooded. The ledge path is narrow (DC 12 Acrobatics or fall in). Everything can be avoided by wading the far side quickly while someone throws them meat.' });
  b.pool(12, 26, 3.5, 2.2, true);
  b.props_('skeleton-lying', [[7, 23], [13, 28]]).prop('pickaxes', 8, 27).prop('mine-support', 14, 22).prop('backpack', 7, 26);
  b.encounter('The pudding in the drowned gallery', [5, 21, 13, 9], [['blackPudding', 1], ['ochreJelly', 2]], 'low');
  b.tunnel([[13, 29], [15, 35], [16, 39]], 2, { seed: 36 });
  b.room('The old adit', 13, 38, 7, 5, { mat: 'cave-floor', read: 'The old miners\' road out of the hill. Its mouth is choked with brambles, and through them you smell cook-smoke and hear a drum keeping slow time.', gm: 'Comes out in the gully at the west edge of the camp, unwatched. The quiet way in.' });
  b.props_('mine-support', [[13, 38], [19, 38]]).prop('mine-rails', 16, 40).prop('brambles', 16, 42);
  b.tunnel([[16, 42], [16, 48]], 2, { seed: 37, mat: 'dirt' });
  b.tunnel([[37, 13], [44, 12]], 2, { seed: 38, mat: 'dirt' });
  b.cave('Counter-mine junction', 46, 12, 3, 3, { seed: 39, mat: 'dirt', read: 'Raw new tunnel, shored with fresh pine that still weeps sap. The legion has been digging here, and digging fast.', gm: 'Their counter-mine broke into the old workings a week ago; that is how the bugbears found the shaft. Tunnels lead north (the mine face), east (the bulette pen) and south (out to the engines).' });
  b.props_('mine-support', [[44, 11], [48, 12]]).prop('torch-standing', 47, 11).light(47, 11, 5, 10);
  b.tunnel([[45, 10], [44, 6]], 2, { seed: 40, mat: 'dirt' });
  b.room('The mine face', 39, 2, 11, 5, { mat: 'dirt', read: 'The end of the counter-mine: a long chamber under the town wall, propped with timbers soaked in pitch. Barrels of pitch are stacked to the roof. Through the ceiling you hear boots on stone: the wall-walk, right above you.', gm: 'When the props burn, the wall above falls. The sappers plan to fire them at dawn of the final assault. Collapsing the face now (fire it early with the heroes clear: they need 3 rounds to get out, DC 14 Dexterity save or 3d10 bludgeoning) costs the legion its mine. The orders are nailed to a prop (handout).' });
  b.props_('mine-support', [[40, 3], [43, 3], [46, 3], [40, 5], [43, 5], [46, 5]]).props_('barrel-stack', [[48, 2], [48, 5]]).prop('pickaxes', 41, 4).prop('ore-pile', 45, 6).prop('lantern-standing', 44, 4).light(44, 4, 10, 15);
  b.encounter('Sappers at the mine face', [38, 2, 13, 9], [['bugbear', 6], ['ogre', 2], ['ironCollarSergeant', 1]], 'low');
  b.tunnel([[48, 11], [51, 9]], 2, { seed: 41, mat: 'dirt' });
  b.cave('Bulette pen', 54, 9, 4, 3, { seed: 42, mat: 'dirt', read: 'Two armoured backs, like overturned boats, rise and fall in the dirt. Chains as thick as your wrist run from their collars to iron stakes.', gm: 'The legion\'s tunnel hounds, starved to make them dig. They can be loosed to chase the sappers (DC 16 Animal Handling, or just break the stakes and run). If killed here they cannot erupt under the town in part 3.' });
  b.props_('chains-hanging', [[52, 9], [56, 9]]).prop('bone-heap', 55, 11).prop('wall-chains', 57, 8);
  b.encounter('Tunnel hounds', [50, 6, 9, 7], [['bulette', 2]], 'low');
  b.tunnel([[46, 15], [47, 20], [48, 26]], 2, { seed: 43, mat: 'dirt' });
  b.area('The sap-head', [[44, 18, 8, 7]], { read: 'The counter-mine comes out under a timber roof among the siege engines. A bored ogre sits on an upturned bucket, eating a sheep.', gm: 'The fast way in, straight into the engine park. A DC 15 Stealth (group) gets past the ogre while he eats.', label: [47, 21] });
  b.props_('mine-support', [[47, 19], [48, 17]]).prop('mine-cart', 48, 23).prop('ore-pile', 45, 22);

  // ----- the engine park and the saps -----
  b.area('Engine park', [[38, 28, 21, 13]], { read: 'Three great throwing engines crouch in the dark like praying insects. Beside them a siege tower, half clad in wet hides, and a ram with an iron head shaped like a fist. Pitch bubbles in cauldrons over low fires.', gm: 'An ogre crew and a hill giant who loads boulders by hand. Burning an engine: a lit pitch barrel on it and one round (or 20 fire damage). Wrecking one by hand: DC 17 Strength or Athletics with tools, two actions. Every engine destroyed means one fewer breach in part 3.' });
  b.props_('catapult', [[42, 31], [48, 30], [54, 32]]).prop('siege-tower', 45, 37).prop('battering-ram', 52, 37).prop('ballista', 40, 36).props_('log-pile', [[56, 29], [39, 39]]).prop('barrel-group', 50, 34).prop('cauldron-tripod', 51, 35).prop('workbench', 44, 34).prop('sawhorse', 46, 34).prop('rope-coil', 56, 38).props_('cheval-de-frise', [[38, 29], [58, 39]]).props_('fire-bowl', [[47, 33], [55, 36]]);
  b.light(47, 33, 10, 20, '#ff9a3c').light(55, 36, 10, 20, '#ff9a3c');
  b.encounter('The engine park', [38, 28, 21, 13], [['ogre', 4], ['hillGiant', 1], ['hobgoblin', 6]], 'moderate');
  b.mud(50, 24, 8, 2).mud(56, 19, 2, 6).mud(56, 19, 8, 2).mud(62, 15, 2, 5).mud(62, 15, 5, 2);
  b.area('The saps', [[50, 14, 20, 13]], { read: 'Zigzag trenches crawl up the slope toward the town wall, roofed in places with hurdles. Hobgoblins sleep in them in neat rows, armour on, weapons in hand.', gm: 'The legion\'s approach trenches. Pickets with worgs walk them every watch. They are the shortest way between the engines and the hill, and the most watched.', label: [58, 21] });
  b.props_('sandbags', [[51, 23], [55, 18], [60, 15]]).props_('barricade-wood', [[58, 22], [64, 17]]).prop('spear-rack', 54, 26).prop('torch-standing', 60, 19).prop('crate', 57, 25).light(60, 19, 10, 15);
  b.encounter('Pickets in the saps', [50, 14, 20, 13], [['hobgoblin', 10], ['worg', 4], ['ironCollarSergeant', 1]], 'low');

  // ----- the stream, the ford and the bridge -----
  river(b, [[69, 11], [64, 16], [67, 22], [63, 28], [65, 33], [62, 36]], false);
  b.pool(62, 39, 3.5, 3, true);
  river(b, [[61, 42], [56, 47], [60, 53], [55, 59], [59, 64], [57, 68], [54, 74], [57, 79]], true);
  b.water(57, 53, 6, 3).floor(55, 66, 6, 2, 'wood-planks');
  b.area('Weir pool', [[58, 36, 8, 7]], { read: 'The Brightrun pools behind a beaver-dam of siege timber. The legion waters its beasts here.', gm: 'Deep water. Anyone swimming downstream at night is almost invisible (advantage on Stealth), and the current carries them to the bridge.', label: [62, 39] });
  b.props_('reeds', [[59, 37], [65, 41]]).prop('log-fallen', 64, 36);
  b.area('The ford', [[57, 53, 7, 4]], { gm: 'Shallow, stony and unguarded: the only place to cross the stream on foot without the bridge.', label: [60, 54] });
  b.area('Timber bridge', [[55, 65, 7, 4]], { read: 'A bridge of fresh-cut logs, lashed tight. Two sentries lean on the rail and argue about dice.', gm: 'Two hobgoblins. They can be bluffed (DC 15 Deception, in Goblin) or quietly removed.', label: [58, 66] });
  b.props_('torch-standing', [[55, 65], [61, 68]]).light(55, 65, 10, 15);

  // ----- the beast pens east of the stream -----
  b.mud(67, 39, 10, 9);
  b.wallRun(66, 38, 12, 'n').wallRun(66, 48, 12, 's').wallRun(66, 38, 11, 'w').wallRun(77, 38, 11, 'e').door(66, 43, 'w').door(71, 48, 's');
  b.area('Mammoth pen', [[66, 38, 12, 11]], { read: 'Something the size of a house shifts in the mud and blows a long sad breath. A mammoth, its tusks capped with iron, its back scarred by harness.', gm: 'The beast that will pull the ram. It hates its handlers. Freeing it and pointing it at the camp (DC 16 Animal Handling, or a lot of noise and fire behind it) sends it stampeding through the tent lines: one round of chaos, and no ram tomorrow.', label: [72, 43] });
  b.props_('hay-bale', [[68, 40], [75, 46]]).prop('water-trough', 74, 40).prop('wall-chains', 69, 46);
  b.wallRun(66, 52, 11, 'n').wallRun(66, 60, 11, 's').wallRun(66, 52, 9, 'w').wallRun(76, 52, 9, 'e').door(66, 56, 'w');
  b.area('Worg kennels', [[66, 52, 11, 9]], { read: 'A stink of wet fur. Yellow eyes open in the dark, one pair after another.', gm: 'Eight worgs on chains. They wake at anything louder than a whisper (passive Perception 14 each; group Stealth DC 15).', label: [71, 56] });
  b.props_('bone-heap', [[68, 54], [74, 58]]).prop('cage', 74, 53).prop('water-trough', 68, 58);
  b.encounter('The beast pens', [64, 36, 15, 25], [['mammoth', 1], ['worg', 6], ['bugbear', 3]], 'low');
  b.area('Ogre lines', [[64, 64, 15, 13]], { read: 'The legion\'s hired muscle sleeps apart, in a sprawl of hides and bones round a fire big enough to roast an ox. It is roasting an ox.', gm: 'The ogres are paid in meat and hate the hobgoblins\' rules. A bold hero with a cart of food could buy them out of the fight tomorrow (DC 17 Persuasion, and a lot of meat).', label: [70, 70] });
  b.props_('campfire-spit', [[70, 70]]).props_('tent-round', [[66, 66], [75, 66], [66, 74], [75, 74]]).prop('bone-heap', 72, 73).prop('log-pile', 77, 70).prop('barrel', 68, 69);
  b.light(70, 70, 15, 25, '#ff9a3c');

  // ----- the castrum: the legion's fortified camp -----
  b.mud(13, 49, 40, 3).mud(13, 77, 40, 2).mud(13, 49, 3, 30).mud(50, 49, 3, 30);
  b.floor(31, 49, 5, 4, 'dirt').floor(31, 77, 5, 2, 'dirt').floor(13, 64, 4, 3, 'dirt').floor(50, 64, 3, 3, 'dirt');
  b.paint(17, 64, 33, 3, 'dirt').paint(32, 53, 3, 24, 'dirt');
  b.wallRun(17, 53, 33, 'n').wallRun(17, 76, 33, 's').wallRun(17, 53, 24, 'w').wallRun(49, 53, 24, 'e');
  for (let x = 32; x < 35; x++) b.door(x, 53, 'n', 'closed', 'door-double').door(x, 76, 's', 'closed', 'door-double');
  for (let y = 64; y < 67; y++) b.door(17, y, 'w', 'closed', 'door-double').door(49, y, 'e', 'closed', 'door-double');
  b.area('Camp ditch and palisade', [[13, 49, 40, 30]], { read: 'Even on campaign, the legion digs a ditch and raises a palisade every night: a square town of tents behind sharpened stakes, with four gates and a sentry at each.', gm: 'Climbing the palisade: DC 13 Athletics, but the gate sentries see anyone within 30 feet of a torch. The west gate is the loosest: its sentry is a raw recruit who can be scared off (DC 14 Intimidation).', label: [16, 60] });
  b.props_('torch-standing', [[31, 52], [35, 52], [16, 63], [16, 67], [50, 63], [31, 77]]).props_('war-banner', [[30, 52], [36, 52]]);
  for (const [x, y] of [[31, 52], [35, 52], [16, 63], [50, 63], [31, 77]] as [number, number][]) b.light(x, y, 10, 15);
  b.area('Tent lines', [[18, 54, 14, 10]], { read: 'Tents in perfect rows, eight soldiers to a tent, boots lined up outside each flap. Even the snoring sounds orderly.', gm: 'Two hundred sleeping legionaries. Any alarm here wakes the camp: the night clock jumps forward one watch and every later fight gains two hobgoblins.', label: [24, 59] });
  for (const x of [19, 22, 25, 28]) for (const y of [55, 58, 61]) b.prop('tent', x, y);
  b.prop('campfire', 30, 57).prop('cooking-pot-fire', 30, 61).prop('weapon-barrel', 20, 63).light(30, 57, 10, 15);
  b.building("Warlord's pavilion", 37, 54, 11, 8, { mat: 'wood-planks', read: 'A pavilion of black and grey canvas. Inside, a map of Brightwall covers the table, with every house drawn and numbered. A tall hobgoblin in black armour looks up from it, unsurprised.', gm: 'Grisk Uldaran and Ashcaller Yethra, planning the final assault, with three iron-collar sergeants. Grisk will talk before he fights: he offers a duel, champion against champion, before witnesses. If his champion loses, he gives up the Dawnstone and lets the heroes walk out. He keeps his word. Yethra does not.', doors: [[42, 61, 's', 'closed', 'door-wood'], [37, 57, 'w', 'closed', 'door-wood']] });
  b.wallRun(44, 54, 4, 'w').wallRun(44, 57, 4, 's').door(44, 56, 'w', 'locked');
  b.area('Strongroom', [[44, 54, 4, 4]], { gm: 'An iron-bound chest (DC 18 to pick; Grisk wears the key). Inside, wrapped in a soldier\'s cloak, the Dawnstone glows softly, warm as a hand.', label: [46, 55] });
  b.prop('war-table', 40, 57).props_('chair-high-back', [[39, 56], [41, 56]]).prop('rug-pelt', 40, 59).prop('brazier', 38, 55).prop('armor-stand', 43, 55).prop('weapon-rack', 38, 60).prop('cot', 43, 60).props_('chest', [[46, 55]]).prop('strongbox', 45, 56).light(38, 55, 10, 15);
  b.encounter("The warlord's pavilion", [37, 54, 11, 8], [['tallyWarlord', 1], ['tallyAshcaller', 1], ['ironCollarSergeant', 3]], 'high');
  b.area('The Great Tally', [[29, 61, 9, 9]], { read: 'Where the camp\'s two roads cross stands a bronze pole twice the height of a man, hung with thousands of knotted cords. Each cord belonged to a dead legionary; each knot is a life they took. Two giant hobgoblins in masks stand guard.', gm: 'The legion\'s standard. Stealing or burning it (it takes two rounds to cut down) breaks the legion\'s heart: in part 3 every hobgoblin has disadvantage on its first attack, and the legion retreats as soon as Grisk falls. The honour guard fight to the death.', label: [33, 65] });
  b.prop('banner-pole', 33, 65).props_('brazier-pedestal', [[31, 63], [35, 67]]).prop('skull-pile', 31, 67).prop('war-banner', 35, 63).light(31, 63, 10, 15).light(35, 67, 10, 15);
  b.encounter('The Great Tally guard', [29, 61, 9, 9], [['tallyMaskedChampion', 2], ['hobgoblin', 6]], 'moderate');
  b.wallRun(19, 69, 4, 'n', 'bars').wallRun(19, 74, 4, 's', 'bars').wallRun(19, 69, 6, 'w', 'bars').wallRun(22, 69, 6, 'e', 'bars').door(21, 69, 'n', 'locked', 'bars');
  b.wallRun(25, 69, 4, 'n', 'bars').wallRun(25, 74, 4, 's', 'bars').wallRun(25, 69, 6, 'w', 'bars').wallRun(28, 69, 6, 'e', 'bars').door(26, 69, 'n', 'locked', 'bars');
  b.area('Prisoner pens', [[18, 67, 13, 9]], { read: 'Two cages of lashed iron bars, crammed with people from the valley farms. Nobody cries. A girl in cracked spectacles is counting the guards under her breath.', gm: 'Thirty-one prisoners, kept as labour. Elske Wendercott is in the east cage. The keys hang on the sergeant\'s belt; the locks are DC 15. Getting thirty frightened people out of a camp is the hard part: back the way the heroes came, or out the west gate and up the gully.', label: [24, 67] });
  b.props_('straw-bed', [[20, 71], [26, 71]]).props_('water-trough', [[21, 73], [27, 73]]).prop('stocks', 30, 70).prop('brazier', 30, 74).prop('key-ring', 29, 72).light(30, 74, 10, 15);
  b.encounter('Pen guards', [18, 67, 13, 9], [['hobgoblin', 8], ['ironCollarSergeant', 2]], 'low');
  b.area("Quartermaster's depot", [[36, 67, 13, 9]], { read: 'Stacked crates, sacks of grain stamped with the seals of three different villages, and a field forge banked for the night.', gm: 'Plunder and supplies. Four potions of healing in a medicine chest. The pitch store next door is the best diversion in the camp.', label: [40, 70] });
  b.props_('crate-stack', [[37, 68], [37, 71]]).props_('flour-sacks', [[40, 68], [41, 74]]).prop('loot-sacks', 39, 73).prop('forge', 42, 69).prop('anvil', 42, 71).prop('cart', 38, 75, 90);
  b.building('Pitch store', 44, 70, 5, 5, { mat: 'dirt', gm: 'Barrels of pitch for the fire-pots. One torch and a 30-foot run turns it into a fireball (8d6 fire in 20 feet) and a column of flame the whole camp will chase. Buys the heroes one watch of chaos.', doors: [[44, 72, 'w']] });
  b.props_('barrel-group', [[45, 71], [47, 71], [45, 73], [47, 73]]);

  // ----- the west edge: the gully and the burned farm -----
  b.paint(2, 46, 11, 33, 'dirt');
  b.area('The gully', [[2, 46, 11, 16]], { read: 'A brambled ravine runs down the west side of the camp, black with shadow. Water trickles somewhere at the bottom.', gm: 'Unwatched. From here a careful party can reach the west gate or the pens without crossing open ground.', label: [7, 52] });
  b.props_('brambles', [[4, 48], [9, 51], [5, 57]]).props_('thorn-bush', [[11, 47], [3, 54]]).prop('tree-dead', 8, 55).props_('boulder', [[6, 49], [10, 58]]);
  b.room('Burned farm', 3, 64, 8, 7, { mat: 'wood-planks-dark', read: 'Blackened walls of a farmhouse, its roof gone. A dog sits on the step and will not leave.', gm: 'The legion burned it on the first day. A family of four hides in the root cellar under the trapdoor (DC 13 Perception to hear them). Taking them with you is slow; leaving them is safe tonight and death tomorrow.' });
  b.wallRun(3, 64, 4, 'n').wallRun(8, 64, 3, 'n').wallRun(3, 64, 5, 'w').wallRun(10, 66, 5, 'e').wallRun(3, 70, 3, 's');
  b.props_('debris-wood', [[5, 66], [9, 68]]).prop('trapdoor', 6, 68).prop('broken-furniture', 4, 69).prop('well', 9, 73).prop('campfire-cold', 7, 74);
  b.paint(32, 28, 3, 21, 'dirt');
  b.area('Picket fires', [[36, 41, 14, 7]], { read: 'A line of small fires between the engines and the camp, each with a sentry wrapped in a cloak, facing the town.', gm: 'The legion watches the hill, not its own back. Moving between the fires: DC 14 Stealth each, or DC 16 Deception in borrowed cloaks.', label: [43, 44] });
  b.props_('campfire', [[37, 44], [43, 42], [48, 45]]).prop('spear-rack', 40, 46).light(37, 44, 10, 15).light(43, 42, 10, 15).light(48, 45, 10, 15);
  b.area('Burned orchard', [[18, 37, 14, 11]], { read: 'An apple orchard, burned to black stumps. Beside the road, three poles stand in a row, and on each pole is a helmet with something still inside it.', gm: 'The three riders who tried to reach the knights. Ser Calder knew them all. Cover for anyone crossing from the hill to the camp: every stump gives half cover, and the pickets do not look this way.', label: [25, 42] });
  b.props_('tree-dead', [[20, 40], [24, 39], [28, 41], [21, 45], [26, 46], [30, 44]]).props_('stump', [[23, 43], [29, 38]]).props_('gibbet-post', [[31, 39], [31, 42], [31, 45]]).prop('signpost', 35, 30);
  b.note(33, 29, 'The valley road climbs from here to Brightwall\'s Great Gate.');
  return b.build();
}

// ---------- Part 3: Brightwall burning ----------
function brightwallBurning() {
  const b = new MapBuilder('adv-brightwall-siege-ruin', 'Brightwall burning', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone' });
  brightwallGround(b, { breach: true });

  // ----- the fallen gate -----
  b.floor(31, 58, 14, 6, 'stone-cobble').rubble(31, 58, 5, 5).rubble(41, 59, 4, 5).rubble(36, 64, 4, 1);
  b.area('The fallen gate', [[28, 50, 20, 16]], { read: 'The gate-towers are heaps of broken stone. Through the gap where the portcullis was, a mammoth in iron plate drags the ram backwards for another swing, and behind it the legion comes on in step.', gm: 'The opening fight of the final assault. If the heroes destroyed the ram or freed the mammoth in part 2, the gate still holds: the legion comes over ladders instead, without the mammoth (drop it from the fight).', label: [37, 55] });
  b.props_('door-broken', [[36, 61], [39, 62]]).prop('battering-ram', 37, 63).props_('burning-wreckage', [[30, 52], [45, 52]]).props_('rubble-pile', [[33, 56], [42, 56]]).props_('skeleton-lying', [[38, 57], [31, 55]]).prop('war-banner', 39, 64).prop('obscuring-cloud', 35, 59);
  b.light(30, 52, 10, 20, '#ff7a2a').light(45, 52, 10, 20, '#ff7a2a');
  b.encounter('The war mammoth', [28, 50, 20, 16], [['mammoth', 1], ['hobgoblin', 10], ['ironCollarSergeant', 2], ['ogre', 2]], 'moderate');
  b.area('The killing ground', [[22, 66, 40, 13]], { read: 'The slope below the wall is black with the legion: shield-blocks in perfect squares, waiting their turn.', gm: 'Nobody goes out here and lives. Show it to the players to make them feel the size of the thing.', label: [40, 72] });
  b.props_('catapult', [[30, 77], [50, 78]]).props_('barricade-wood', [[36, 76], [44, 76]]).props_('war-banner', [[34, 74], [46, 74]]).props_('ladder', [[24, 66], [48, 66]]).prop('skeleton-lying', 41, 70);

  // ----- the inner line of barricades -----
  for (let x = 4; x < 44; x++) if (![13, 27, 37, 38].includes(x)) b.wall(x, 41, 'n');
  b.door(13, 41, 'n', 'closed').door(27, 41, 'n', 'closed').door(37, 41, 'n', 'closed', 'door-double').door(38, 41, 'n', 'closed', 'door-double');
  for (let x = 58; x < 66; x++) if (x !== 61) b.wall(x, 46, 'n');
  b.door(61, 46, 'n', 'closed').wall(66, 46, 'n').door(67, 46, 'n', 'closed');
  b.area('Lamp Street barricade', [[30, 36, 14, 5]], { read: 'Carts, doors, church pews and coffins are piled across Lamp Street, chest high. Behind them stand everyone in Brightwall who can hold a spear: smiths, grandmothers, boys with their fathers\' helmets down over their eyes.', gm: 'The Inner Line. Captain Hedda holds it with the last of the watch. Each time the heroes leave it to go elsewhere, roll a d6: on a 1-2 the line gives a little and ten more townsfolk die (keep count).', label: [37, 38] });
  b.props_('barricade-wood', [[31, 40], [34, 40], [41, 40], [43, 40]]).props_('cart', [[32, 39], [42, 39]], 90).props_('pew', [[35, 40], [40, 40]]).props_('coffin', [[30, 39], [44, 38]]).props_('brazier', [[33, 37], [41, 37]]).prop('weapon-barrel', 36, 37).props_('sandbags', [[22, 40], [25, 40], [14, 40]]);
  b.light(33, 37, 15, 20).light(41, 37, 15, 20);
  b.area('The lost market', [[22, 42, 14, 9]], { read: 'The tents of the field hospital are slashed and trampled. Cots lie overturned in the mud. Not everyone got out.', gm: 'South of the line, in enemy hands. Three wounded who could not be carried hide under the dead-cart (DC 14 Perception to hear them). Bringing them back over the barricade under fire is a heroic act; the town remembers.', label: [28, 46] });
  b.props_('cot', [[24, 43], [27, 47], [31, 44]]).prop('tent', 33, 48).prop('cart', 25, 49, 90).prop('cauldron-tripod', 29, 46).prop('debris-wood', 23, 46);
  b.encounter('Hold the Lamp Street gate', [20, 42, 24, 7], [['hobgoblin', 15], ['ironCollarSergeant', 3], ['bugbear', 4]], 'low');

  // ----- the east breach and the graveyard line -----
  b.floor(68, 33, 2, 10, 'dirt').rubble(62, 33, 10, 10);
  b.area('The east breach', [[62, 32, 18, 12]], { read: 'Forty feet of the east wall has come down in a slope of broken stone. Over it, hill giants wade in with clubs like tree trunks, and hobgoblins follow them up the rubble in a tight wedge.', gm: 'Each catapult left whole in part 2 smashed this breach wider: if the heroes burned all three engines, there is no breach at all (only ladders: use half the fight). The breach opens behind the Inner Line, straight into the graveyard and the back door of the temple.', label: [70, 37] });
  b.props_('rubble-pile', [[64, 34], [67, 40]]).props_('boulder-large', [[63, 38], [72, 35]]).prop('siege-tower', 75, 46).props_('ladder', [[70, 26], [70, 30]]).prop('skeleton-lying', 65, 42).prop('ceiling-rubble', 68, 38);
  b.encounter('Giants in the east breach', [62, 32, 18, 12], [['hillGiant', 2], ['ogre', 2], ['hobgoblin', 10]], 'moderate');
  b.area('Graveyard line', [[58, 32, 8, 14]], { read: 'The fresh graves have been dug into a trench. Militiamen crouch in them with spears, and some of the graves are already full again.', gm: 'The last ground between the breach and the temple. A good place to hold if the heroes are few: the open graves give half cover.', label: [61, 38] });
  b.props_('open-grave', [[59, 35], [61, 35], [63, 35], [59, 44], [62, 44]]).props_('burial-slab', [[60, 40], [63, 40]]).prop('tree-dead', 64, 33).prop('sandbags', 61, 45);

  // ----- the temple: the last refuge -----
  b.building('Temple refuge', 44, 32, 14, 14, { mat: 'marble', read: 'The temple is full to the walls: the wounded on the pews, the children under them, the old ones holding the children. The Kindler\'s flame burns steady on the altar while the stones shake.', gm: 'Mother Agathe\'s last hospital, and Teodric under guard. If the counter-mine was not collapsed in part 2, the legion\'s sappers break up through the crypt stair into the sacristy. If it was, the same fighters come over the graveyard wall instead, a round later.', doors: [[44, 38, 'w', 'closed', 'door-double'], [44, 39, 'w', 'closed', 'door-double'], [57, 41, 'e'], [50, 45, 's', 'locked']], windows: [[47, 32, 'n'], [51, 32, 'n'], [44, 34, 'w']] });
  b.wallRun(53, 32, 5, 'w').wallRun(53, 36, 5, 's').door(53, 34, 'w');
  b.area('Broken sacristy', [[53, 32, 5, 5]], { read: 'The floor of the sacristy has fallen in. Pine props and fresh dirt show where something dug up from below.', gm: 'The sappers\' tunnel (if it exists). Collapsing it behind them takes one action and a DC 15 Strength check, or any thunder spell.', label: [55, 34] });
  b.prop('altar', 49, 33).prop('brazier-everburning', 50, 34).props_('pew', [[47, 37], [51, 37], [47, 39], [51, 39], [47, 41], [51, 41]]).props_('cot', [[45, 42], [55, 42], [55, 39]]).prop('font', 49, 44).prop('statue-tall-robed', 45, 33).prop('trapdoor', 56, 34).prop('mine-support', 54, 35).prop('rubble-pile', 55, 33);
  b.light(50, 34, 15, 20, '#ffe3a8');
  b.encounter('Sappers in the sanctuary', [44, 32, 14, 14], [['bugbear', 8], ['ironCollarSergeant', 3], ['ogre', 2]], 'low');

  // ----- the burning town -----
  b.area('Burned Cloth Hall', [[22, 31, 12, 8]], { read: 'The old hospital is a black shell. Its roof has fallen in and flames still crawl along the beams. From under the floor, someone is knocking.', gm: 'Six wounded were hidden in the cellar when the hall caught fire. Getting them out: three DC 15 checks (Athletics to shift beams, Medicine or Survival to find air, Constitution saves against the smoke at 2d6 fire damage each failure). Takes 3 rounds the heroes are not spending elsewhere.', label: [27, 34] });
  b.paint(22, 31, 12, 8, 'dirt').rubble(23, 32, 3, 3).rubble(29, 35, 4, 3);
  b.wallRun(22, 31, 5, 'n').wallRun(30, 31, 4, 'n').wallRun(22, 31, 4, 'w').wallRun(33, 34, 5, 'e').wallRun(22, 38, 3, 's').wallRun(31, 38, 3, 's');
  b.props_('burning-wreckage', [[24, 36], [31, 32]]).props_('burning-ground', [[27, 33], [28, 37]]).prop('trapdoor', 27, 36).prop('embers-ash', 32, 36).light(24, 36, 10, 20, '#ff7a2a').light(31, 32, 10, 20, '#ff7a2a');
  b.area('Fountain Cross', [[33, 24, 11, 7]], { read: 'The fountain is dry and the stone lamplighter has lost his head. Runners, stretchers and frightened faces pass in every direction.', gm: 'The last rally point below the crag. If Ser Calder is alive he holds here with a dozen militia, and any hero who stops for one round can send a rallied group to wherever the line is weakest.', label: [41, 26] });
  b.prop('fountain', 38, 26).props_('cot', [[34, 25], [34, 29]]).prop('water-barrel', 42, 29).prop('obscuring-cloud', 40, 24).prop('handcart', 42, 26);
  b.building('Gutted barracks', 54, 16, 11, 8, { mat: 'stone-flagstone', read: 'Fire-pots set the barracks alight before dawn. The roof is gone. The armoury racks are empty: everything that could be carried is on the line.', gm: 'Nothing left but a few arrows (20) and a crossbow nobody could find a bolt for. The drill yard behind it is open ground between the breach and the crag.', doors: [[59, 23, 's'], [54, 19, 'w']] });
  b.rubble(56, 17, 4, 3).props_('burning-wreckage', [[61, 18], [57, 22]]).prop('bunk-bed', 63, 17).prop('weapon-rack', 63, 21).light(61, 18, 10, 20, '#ff7a2a');
  b.building("Reeve's hall", 41, 17, 10, 8, { mat: 'wood-planks-dark', read: 'The council hall\'s roof has caved in at one end. The long table is still covered in plans for a surrender nobody signed.', gm: 'Reeve Lorimer hid here and was found by the children he wanted to save. He can be shamed into courage (DC 14 Persuasion): he takes the town banner to Fountain Cross, and the militia cheer him.', doors: [[41, 20, 'w'], [45, 24, 's']] });
  b.rubble(46, 18, 4, 4).prop('table-long', 43, 21).prop('banner-hanging-tall', 42, 18).prop('strongbox', 49, 23).prop('debris-wood', 44, 23);
  b.area('Chandlery ruin', [[25, 17, 9, 7]], { read: 'The chandler\'s shop took a fire-pot and exploded. Melted lamp oil has run down the street and is still burning.', gm: 'Burning oil across Wall Road: crossing it here is 2d6 fire damage. Go round by the stream or by Lamp Street.', label: [29, 20] });
  b.paint(25, 17, 9, 7, 'dirt').rubble(26, 18, 7, 5).props_('burning-ground', [[27, 25], [30, 26], [33, 27]]).props_('embers-ash', [[29, 20]]).light(30, 26, 10, 20, '#ff7a2a');
  b.area("Ashes of Cooper's Lane", [[40, 46, 26, 12]], { read: 'Every house on the lane has burned to its chimney. Ash drifts like snow.', gm: 'South of the Inner Line and lost. Legion runners move through it toward the temple\'s south door.', label: [52, 51] });
  b.rubble(42, 49, 7, 6).rubble(50, 49, 7, 6).rubble(58, 49, 7, 6).props_('embers-ash', [[45, 52], [53, 51], [61, 52]]).props_('burning-wreckage', [[48, 50], [56, 53]]).light(56, 53, 10, 20, '#ff7a2a');

  // ----- the west ward -----
  b.building('Old Smelt House', 5, 16, 10, 10, { mat: 'stone-flagstone', read: 'The old hall where your sortie began. The shaft rope still swings in the back room.', gm: 'The heroes\' way back from part 2. Anyone fleeing the town at the end can go down the shaft and out through the old adit: Mabb will lead them.', doors: [[9, 25, 's'], [14, 23, 'e']] });
  b.wallRun(11, 16, 5, 'w').wallRun(11, 20, 4, 's').door(11, 18, 'w', 'closed').door(13, 20, 's', 'open', 'door-iron');
  b.pit(12, 17, 2, 2).prop('winch', 14, 17).prop('forge', 6, 17).prop('mine-cart', 9, 22).prop('crate-stack', 7, 23);
  b.building("Mabb's cottage", 5, 31, 6, 6, { gm: 'Mabb has hidden eleven children from Miners\' Row in her cellar. The bulette is digging straight for them.', doors: [[10, 33, 'e']] });
  b.prop('bed', 6, 32).prop('hearth-oven', 9, 31).prop('trapdoor', 7, 35).prop('pickaxes', 9, 35);
  b.area("Miners' Row", [[12, 26, 5, 15]], { read: 'The ground of the lane heaves and splits. Something armoured surges out of the earth, and from the water-gate behind it comes the howling of wolves.', gm: 'The bulette (if it lives) and worg riders who came through the water-gate grate. They are behind the Inner Line: unchecked, they reach Fountain Cross in three rounds. Mabb\'s cottage is in their path.', label: [13, 33] });
  b.rubble(12, 31, 4, 3).props_('rubble-pile', [[13, 30], [15, 34]]).prop('handcart', 14, 37).prop('lamp-post', 14, 28);
  b.encounter('Breakout in the West Ward', [4, 26, 13, 14], [['bulette', 1], ['worg', 6], ['goblinWarrior', 6]], 'low');
  b.area('Water-gate', [[17, 60, 6, 6]], { gm: 'The grate has been torn out. Worg riders came in this way.', label: [19, 61] });
  b.prop('door-broken', 19, 66).prop('bridge-plank', 19, 62);

  // ----- the crag and the Beacon -----
  b.area('Wall Road North', [[51, 2, 17, 4]], { read: 'A siege tower leans against the north end of the east wall, and its drawbridge is down. Black-armoured hobgoblins pour across it, heading for the crag.', gm: 'Grisk\'s chosen came this way at the height of the assault to take the Beacon. The Watch Door into the Beacon yard is barred from inside (DC 18 Athletics to break).', label: [58, 3] });
  b.props_('siege-tower', [[72, 4]]).props_('skeleton-lying', [[60, 3], [65, 4]]).prop('war-banner', 55, 3).prop('burning-wreckage', 62, 7);
  b.area('Signal Stair', [[34, 13, 6, 4]], { read: 'The forty steps up the crag are held by a wall of black shields, three deep. Above them, on the Beacon yard, you hear the warlord giving calm orders.', gm: 'The main way up. The goat path (west) and the Watch Door (east) go round, but take longer.', label: [36, 15] });
  b.props_('stair-grand', [[36, 14], [37, 15]]).prop('war-banner', 38, 17);
  b.encounter('Shield wall on the Signal Stair', [30, 12, 12, 7], [['tallyMaskedChampion', 1], ['hobgoblin', 12], ['ironCollarSergeant', 2]], 'low');
  b.area('Beacon yard', [[24, 2, 25, 12]], { read: 'The top of the crag. Smoke from the burning town boils up all round it, and through the gaps you can see the whole valley, all the way to the far blue ridge where the knights wait.', gm: 'The final fight. Grisk and Yethra hold the yard: Yethra means to burn the tower down so it can never be lit. While the heroes fight, someone has to relight the Beacon (see the scene). Grisk ends the fight if the Beacon burns: his war is lost and he knows it.', label: [41, 12] });
  b.props_('barrel-group', [[25, 12], [47, 12]]).prop('telescope', 47, 3).prop('stairs-down', 37, 13).props_('burning-ground', [[39, 11], [44, 7]]).prop('war-banner', 36, 10).prop('obscuring-cloud', 45, 12);
  b.building('Beacon tower', 26, 6, 9, 6, { mat: 'stone-flagstone', gm: 'Yethra has piled pitch barrels against the stair. If she gets two uninterrupted turns here, the tower burns from the inside and the Beacon cannot be lit for a day.', doors: [[30, 11, 's', 'closed', 'door-iron'], [30, 6, 'n', 'closed']], windows: [[26, 8, 'w'], [34, 8, 'e']] });
  b.prop('stair-spiral', 32, 8).props_('barrel-stack', [[28, 9], [33, 10]]).light(29, 9, 10, 15);
  b.building('Lantern room', 26, 2, 9, 4, { mat: 'marble', read: 'The great lens, its crack filled with a seam of glowing temple crystal (or still broken), and the empty bronze cradle waiting for the Dawnstone.', gm: 'Setting the Dawnstone and speaking the rite takes three actions in a row, each with a check (handout): DC 15 Arcana or Religion, DC 15 Strength to swing the lens round to face the ridge, DC 15 Wisdom to speak the words with an enemy at your back. Teodric, if present and redeemed, gives advantage on all three. Without the Dawnstone, a hero can feed the cradle their own magic: expend spell slots totalling 12 levels, or the temple crystal and Agathe\'s life.', windows: [[26, 3, 'w'], [34, 3, 'e']] });
  b.prop('brazier-pedestal', 30, 3).prop('orb-pedestal', 31, 4).prop('candle-ring', 33, 3);
  b.building("Keeper's house", 38, 4, 9, 6, { gm: 'Empty. Elske\'s spare spectacles still sit on the windowsill.', doors: [[42, 9, 's']] });
  b.prop('writing-desk', 39, 5).prop('bed', 45, 5).prop('broken-furniture', 41, 7);
  b.encounter('Grisk at the beacon', [24, 2, 25, 10], [['tallyWarlord', 1], ['tallyMaskedChampion', 1], ['tallyAshcaller', 1], ['ironCollarSergeant', 3]], 'high');

  b.area('Orchard camp', [[4, 2, 16, 12]], { read: 'The people of the lower town have fled up here with what they could carry. Blankets hang from the apple trees, and a hundred faces turn toward you each time a horn sounds.', gm: 'If the Beacon falls, these are the people who die first. Mabb can lead them down the old shaft and out through the mine, but only if someone holds the Smelt House for her.', label: [11, 7] });
  b.props_('tree-oak', [[6, 4], [10, 3], [14, 5], [7, 9], [12, 10], [17, 4]]).props_('bedroll', [[8, 5], [12, 7], [15, 8]]).props_('tent', [[5, 11], [16, 11]]).prop('campfire', 10, 7).prop('handcart', 18, 5).light(10, 7, 10, 15);
  b.start(36, 35, 3, 3);
  return b.build();
}

export const BRIGHTWALL_SIEGE: Adventure = {
  id: 'brightwall-siege',
  title: 'The Siege of Brightwall',
  tagline: 'A hobgoblin legion at the walls, a traitor inside them, and a beacon that must burn before the town falls.',
  levels: '7-8',
  sessions: '3-4 sessions',
  players: '3-5 players',
  tags: ['mini-campaign', 'siege', 'war', 'town', 'heroic'],
  pitch:
    'Brightwall sits on its hill like a grey stone crown, and on the highest rock stands the Beacon. For three hundred years, when the Beacon burned, the Dawnward Knights rode. Four days ago the Tally Legion marched out of the eastern hills: two thousand hobgoblins in perfect step, ogres hauling their engines, and a warlord who counts every life he takes. Last night the Beacon went dark. Not blown out. Broken, from the inside. Someone in Brightwall did this. The legion\'s drums have not stopped since.',
  secret:
    'Warlord Grisk Uldaran wants Brightwall: its walls command the valley road, and with it he can hold the whole valley through the winter. He also knows the Dawnward Knights are mustered at Harrowford, half a day\'s ride away, until the first frost, and that by an old law they ride only for the Beacon. So a month ago his raiders took Elske, the twelve-year-old daughter of the Beacon\'s Keeper, Magister Teodric Wendercott, and sent him a knotted cord of her hair. Last night Teodric cracked the great lens and handed the Dawnstone, the crystal heart of the Beacon, to bugbears who came up the old silver shaft under the Smelt House. The stone sits in Grisk\'s pavilion. The legion\'s sappers are digging under the walls; the final assault comes at dawn on the fourth day. If the Beacon is not lit before the frost, the knights go home, and Brightwall dies.',
  hooks: [
    'The heroes reached Brightwall with a wagon of arrows the day the legion arrived. The gates closed behind them. There is no leaving now.',
    'Captain Hedda Ferrandine offers 300 gp each from the town chest to find whoever darkened the Beacon, and to light it again.',
    'Ser Calder Rennick, a young Dawnward knight trapped in town, begs the heroes to help him keep his order\'s oath: "While the Beacon stands, it burns."',
  ],
  tips: [
    'Run it as a war story. Keep a visible tally of townsfolk saved and lost, just as the legion keeps its tally. Let the players feel every choice in that number.',
    'The legion has its own stat blocks: plain hobgoblins in the ranks, iron-collar sergeants leading every squad, masked champions guarding the standard, Ashcaller Yethra as its war-caster and Grisk as the Tally Warlord. Bugbears are scouts and knives; ogres and hill giants are hired muscle. Run them all as one disciplined army.',
    'The legion is disciplined, not mindless. Hobgoblin units retreat in good order at half strength, take prisoners, and keep their word in a parley. Many fights can be avoided by bluff, by fear, or by giving them a better order to follow.',
    'Part 1: at dusk, three alarms come at once (the hospital, the east wall, the Beacon). The heroes cannot be everywhere: whatever they leave, the townsfolk handle badly. That is the point.',
    'Part 2 has a night clock of six watches. Each fight, each engine burned, each rescue costs one watch. At dawn the camp wakes. What the heroes destroy here changes part 3: say so plainly when they do it.',
    'Part 3 is a fighting retreat up the hill. Each scene is a turn of the battle; whatever the heroes do not go to, falls. Level the party up to 8 before it starts.',
  ],
  npcs: [
    {
      id: 'pf_bwsgrisk', name: 'Grisk Uldaran', title: 'warlord of the Tally Legion', kind: 'monster', art: 'hobgoblin', monsterId: 'tallyWarlord',
      wants: 'Brightwall\'s walls for his legion\'s winter, and the knights who broke his father\'s legion to come too late.',
      knows: 'The name of every soldier he commands. Where the Dawnstone is (his strongroom). That he holds the Keeper\'s daughter.',
      voice: 'Calm and precise. Never raises his voice. Speaks Common with a soldier\'s courtesy and counts on his fingers as he talks.',
      appearance: 'A tall grey-skinned hobgoblin in black lacquered plate. Knotted cords run down his left arm from shoulder to wrist: his tally.',
      backstory: 'His father\'s legion was destroyed by the Dawnward Knights thirty years ago, at this same valley. Grisk was a drummer boy. He remembers the Beacon burning that night.',
      gmNotes: 'Tally Warlord stat block. He keeps his word: offered a duel before witnesses, he accepts, and honours the result. If he dies in part 2, his second-in-command (also a Tally Warlord) leads the assault in part 3, swearing revenge. If the Beacon burns, he orders a withdrawal in good order rather than lose his whole legion.',
    },
    {
      id: 'pf_bwsyethra', name: 'Yethra Coldmouth', title: 'Ashcaller of the legion', kind: 'monster', art: 'fire-mage', monsterId: 'tallyAshcaller',
      wants: 'To burn the Beacon tower to the ground, so that no fire but the legion\'s ever calls anyone again.',
      knows: 'Every fire-pot recipe in the legion. That Grisk means to keep his promise to the Keeper, which she thinks is weakness.',
      voice: 'A hoarse whisper (her throat is burned). Laughs at the wrong moments.',
      appearance: 'A small hobgoblin woman with soot-black arms to the elbow, carrying a brass lantern on a pole.',
      gmNotes: 'Ashcaller stat block. She does not keep Grisk\'s bargains: if he lets the heroes go, she sends bugbears after them. In part 3 she tries to burn the tower from inside.',
    },
    {
      id: 'pf_bwsteodric', name: 'Teodric Wendercott', title: 'Magister, Keeper of the Beacon', kind: 'npc', art: 'court-wizard', monsterId: 'mage',
      wants: 'His daughter Elske alive. Nothing else matters to him any more.',
      knows: 'Where the Dawnstone went, how the bugbears came in, and the rite of kindling. That the temple\'s altar crystal can mend the lens.',
      voice: 'Soft and exact. Apologises too often. His hands shake when he is lying.',
      appearance: 'A thin man of fifty with ink and soot on his fingers, wearing spectacles with one cracked lens, like the Beacon.',
      gmNotes: 'Mage stat block. He is the traitor. In the Beacon fight he can be talked down: a DC 16 Insight shows he is terrified, and anyone who says Elske\'s name with a promise to save her stops him (DC 14 Persuasion). Taken alive, he confesses everything. If Elske is rescued in part 2, he redeems himself in part 3 and gives advantage on the kindling.',
    },
    {
      id: 'pf_bwselske', name: 'Elske Wendercott', title: "the Keeper's daughter", kind: 'npc', art: 'child',
      wants: 'To go home, and for her father not to hate himself.',
      knows: 'The pens\' guard changes at the third watch. The sergeant keeps the keys on his left hip. She has counted every soldier who walked past for a month.',
      voice: 'Fast and precise, counting things under her breath: "Six. No, seven."',
      appearance: 'Twelve years old, barefoot, a rope collar on her neck and her father\'s spare spectacles tied on with string.',
      gmNotes: 'Not a fighter. If freed, she can lead the prisoners out by the quickest unwatched way (she has worked it out already).',
    },
    {
      id: 'pf_bwshedda', name: 'Hedda Ferrandine', title: 'captain of the Brightwall watch', kind: 'npc', art: 'guard-captain', monsterId: 'veteran', shared: true,
      wants: 'The walls held until the knights come. Then sleep.',
      knows: 'Every weak point of the walls (the water-gate, the east wall). The legion\'s drum signals, from the border wars.',
      voice: 'Hoarse from shouting. Short orders. Swears by the Kindler\'s beard.',
      appearance: 'A broad, greying woman with her left arm in a sling and mail patched with pot lids.',
      gmNotes: 'Veteran stat block. She is honest and worn out. She suspects the reeve, wrongly. Keep her out of the heroes\' way in fights: she is busy holding the town together.',
    },
    {
      id: 'pf_bwsagathe', name: 'Agathe Quenby', title: 'Mother of the Temple of the Kindler', kind: 'npc', art: 'healer', monsterId: 'priest', shared: true,
      wants: 'Every wounded soul carried somewhere safe, and the children fed.',
      knows: 'The wounded all say the bugbears came from the west, not over the wall. The altar crystal is a shard of the Dawnstone\'s own rock.',
      voice: 'Warm and cheerful at terrible moments. Hums hymns while she stitches.',
      appearance: 'A tiny round woman with sleeves rolled up and an apron stiff with blood.',
      gmNotes: 'Priest stat block. She gives the altar crystal only to someone she believes will light the Beacon (DC 15 Persuasion, or bring her proof of the traitor).',
    },
    {
      id: 'pf_bwscalder', name: 'Calder Rennick', title: 'Ser, a knight of the Dawnward', kind: 'npc', art: 'knight', monsterId: 'knight', shared: true,
      wants: 'To ride for help, or to light the Beacon. To be worthy of his spurs either way.',
      knows: 'The Dawnward Knights are mustered at Harrowford until the first frost. By the old law (since the False Fire, a trick a century ago) they ride only for the Beacon, never for a messenger.',
      voice: 'Earnest and formal, as if reading from a book of oaths.',
      appearance: 'Nineteen, in armour a little too big, with a rising sun painted on his shield.',
      gmNotes: 'Knight stat block. If nobody stops him he tries to ride out through the gate in part 1 and dies on the killing ground. Talk him out of it (DC 13 Persuasion) and he follows the heroes into the mine, or holds Fountain Cross in part 3.',
    },
    {
      id: 'pf_bwslorimer', name: 'Lorimer Pettigrew', title: 'Reeve of Brightwall', kind: 'npc', art: 'noble', monsterId: 'noble', shared: true,
      wants: 'To save the children by surrendering the town.',
      knows: 'The grain lasts nine days. He has met the legion\'s herald twice in secret, to beg for terms.',
      voice: 'Smooth and sweating. Says "of course, of course" before every excuse.',
      appearance: 'A soft, well-fed man who keeps tucking his chain of office inside his coat.',
      gmNotes: 'A red herring: he looks like the traitor and is only a coward. Exposing his secret talks in public ruins him; sparing him earns a frightened ally who finds his courage in part 3.',
    },
    {
      id: 'pf_bwsmabb', name: 'Mabb Greyhallow', title: 'the last silver-miner', kind: 'npc', art: 'dwarf-miner', shared: true,
      wants: 'To go down the mine one more time before she dies.',
      knows: 'Every tunnel under the hill: the drowned gallery, the old stope, the adit and the miners\' chapel. She does not know about the legion\'s counter-mine.',
      voice: 'Loud (she is half deaf). Taps the wall with a knuckle and listens before she answers.',
      appearance: 'A white-bearded dwarf woman with one eye and a miner\'s lamp strapped to her hat.',
      gmNotes: 'She guides the sortie in part 2. She cannot fight, but she can find a way round almost anything underground (advantage on checks to navigate or sense a collapse).',
    },
  ],
  handouts: [
    { id: 'keeper-log', title: 'The Keeper\'s log, last entries', text: 'Third night of the siege. Lens polished. The Stone sleeps well. All quiet in the tower. - T.W.\n\nFourth night. [Nothing written. The page below is torn out.]\n\n(In the margin, in another ink, very small:) forgive me' },
    { id: 'herald-terms', title: 'Terms, nailed to the gate', text: 'To the town on the hill.\nOpen your gates by the fourth dawn. Your soldiers will lay down their spears and live as labour. Your children will be counted and fed. Your Beacon will stay dark.\nRefuse, and every life in Brightwall becomes a knot on our tally.\n- Grisk Uldaran, who keeps his word' },
    { id: 'knotted-note', title: 'A note wrapped round a knotted cord of hair', text: 'Keeper.\nYour daughter eats. She will eat for as long as your fire sleeps. One knot for every day it burns.\nOur friends will come up through the old shaft on the third night. Give them the Stone.' },
    { id: 'sapper-orders', title: 'Orders nailed to a mine prop', text: 'SAP COMPANY: FACE TO REACH THE SOUTH WALL BY THE THIRD NIGHT. PROP WITH PITCH-TIMBER ONLY. ON THE FOURTH DAWN, AT THE THIRD HORN, FIRE THE PROPS. NO SAPPER STAYS BELOW AFTER THE SECOND HORN. - By order. Counted and sealed.' },
    { id: 'pen-roll', title: 'A prisoner roll from the pens', text: 'Pen east: 16. Strong 9. Weak 6. Child 1 (the Keeper\'s - not to be sold, not to be harmed, by the warlord\'s order).\nPen west: 15. Strong 11. Weak 4.\nRations: half. Water: at the second watch.' },
    { id: 'kindling-rite', title: 'The Rite of Kindling, from the Beacon\'s brass plaque', text: 'Set the Stone in the cradle with a clean hand.\nTurn the eye of the lens toward the Dawnward.\nSpeak: "I am the watch on the wall. I am the fire on the hill. While Brightwall stands, it burns."\nAnd the light shall go out to the edge of the kingdom.' },
  ],
  chapters: [
    {
      id: 'besieged', title: 'Part 1: Brightwall under siege', level: 7,
      summary: 'A walled hill town under siege: a broken Beacon, a frightened council, a field hospital, the first assault, and a traitor to find before the town tears itself apart.',
      goal: 'Find out who broke the Beacon and where the Dawnstone went, while helping the town survive the first assault.',
      map: brightwallBesieged,
      npcs: [
        { npc: 'pf_bwshedda', x: 38, y: 51 },
        { npc: 'pf_bwscalder', x: 34, y: 53 },
        { npc: 'pf_bwsagathe', x: 27, y: 35 },
        { npc: 'pf_bwslorimer', x: 46, y: 21 },
        { npc: 'pf_bwsmabb', x: 7, y: 33 },
        { npc: 'pf_bwsteodric', x: 30, y: 4, hidden: true },
      ],
      scenes: [
        { room: 'Gate Square', title: 'Behind the gate', read: 'A boulder the size of a cart smashes into the gate-tower above you, and stone dust rains down on the square. Nobody even looks up any more. A grey woman with her arm in a sling shouts your names across the cobbles: "You! The ones with real weapons! Up on the wall, now."', gm: 'Open here. Hedda gives the hook and the situation: day three of the siege, the Beacon dark since last night, the knights at Harrowford, the frost a week away. She wants the traitor found and the Beacon lit. Ser Calder is saddling up to ride out through the gate: stop him (DC 13 Persuasion) or he dies on the killing ground in the second scene.' },
        { room: 'Beacon yard', title: 'The broken Beacon', read: 'The wind on the crag tastes of smoke. Up in the lantern room, the great lens lies split in two, and the bronze cradle where the Dawnstone burned for three hundred years is open and empty.', gm: 'The crime scene. Clues: no forced entry (whoever did it had keys); a thunder spell broke the lens from inside (DC 15 Arcana); bugbear-sized muddy prints between the tower and the Keeper\'s house (DC 13 Survival); Teodric\'s own name scratched off the plaque. Teodric is here, grey and helpful, and lies: he was asleep, he heard nothing (DC 16 Insight: he is terrified, not guilty-looking, and keeps glancing at his house).', handout: 'keeper-log' },
        { room: 'Great Gate', title: "The herald's terms", read: 'The drums stop. In the silence a single hobgoblin walks up the slope with a white flag on a spear, nails a sheet of parchment to the portcullis, bows to the wall, and walks back down without hurrying.', gm: 'The legion\'s terms. Reeve Lorimer wants to accept and argues for it at the gate; Hedda wants to shoot the next herald. Players who watch the reeve see him slip a note through the bars (DC 14 Perception). He is begging for the children\'s lives, not selling the town; but it looks bad.', handout: 'herald-terms' },
        { room: 'Cloth Hall', title: 'The field hospital', gm: 'Mother Agathe and the wounded. Corran the dying watchman saw the Keeper at the Smelt House at midnight with "two giant shadows" (DC 13 Medicine keeps him alive to say it). The wounded agree: the bugbears they fought came from the west, inside the walls. Helping out for an hour (DC 14 Medicine) earns Agathe\'s trust and a potion of greater healing.' },
        { room: "Keeper's house", title: "The Keeper's secret", optional: true, gm: 'Elske\'s room is too tidy. The drawer (DC 15 thieves\' tools) holds the knotted cord of her hair and the note. This is the proof. Show it to Teodric and he breaks down; show it to Hedda and she wants him hanged.', handout: 'knotted-note', treasure: 'A spell scroll of Counterspell and Teodric\'s purse (85 gp).' },
        { room: 'Old Smelt House', title: 'The Smelt House', encounter: 'Sappers in the Smelt House', gm: 'Bugbears and ogre porters wait here for the dusk attack, guarding the shaft. Six bugbears go up to the hospital at dusk; if the heroes find this place first, they fight all of them here instead and the hospital attack never happens. Mabb, next door, knows the shaft goes to the old workings.', treasure: 'A sack of looted silver plate (120 gp), Mabb\'s old map of the workings.' },
        { room: 'Field hospital', title: 'Dusk: knives in the hospital', encounter: 'Knives in the field hospital', read: 'The sun touches the hills and every drum in the legion booms at once. Ladders slap against the east wall. And in the hospital, behind you, someone starts to scream.', gm: 'Three alarms at once: bugbears in the hospital, ladders on the east wall, and (unseen) Teodric slipping up to the Beacon to meet his bugbear contacts. Let the players split or choose. Whatever they skip goes badly: an unprotected hospital loses twenty wounded and two healers; an unwatched east wall lets the ladders fight run three more rounds.' },
        { room: 'East wall-walk', title: 'Ladders on the east wall', encounter: 'Ladders on the east wall', gm: 'The first assault. The hobgoblins come over in squads of five; the ogres throw grappling hooks and pull at the battlements. Pushing a ladder off: DC 15 Athletics. If the heroes lead the militia (DC 14 Persuasion as a bonus action), the townsfolk hold their section on their own.' },
        { room: "Cooper's Lane", title: "Fire on Cooper's Lane", optional: true, gm: 'Fire-pots set the lane alight. A grandmother and two children are trapped upstairs in the weaver\'s house: three DC 14 checks (Athletics to break in, Survival or Perception to find them in the smoke, Acrobatics to get out), each failure costing 2d6 fire damage. Saved, the children are the reeve\'s grandchildren: Lorimer becomes the heroes\' man for good.' },
        { room: 'Lantern room', title: 'The Keeper unmasked', encounter: 'The Keeper unmasked', read: 'At the top of the tower, by the light of a blue spell-flame, the Keeper is pouring lamp oil over his own books. Behind him, the bronze guardians of the Beacon stir, and huge hairy shapes climb over the parapet from the goat path.', gm: 'Teodric is burning the Beacon\'s records (and the Rite) because the bugbears told him the legion wants them. The bugbears have come to take him to Grisk. He commands the tower\'s four animated armours. He can be talked down (see his notes): if Elske is mentioned with a promise, he orders the armours to stand still. Taken alive, he confesses: the Dawnstone is in the warlord\'s pavilion, Elske is in the camp pens, and the bugbears came up the old shaft.', treasure: 'Teodric\'s wand of magic missiles, two potions of greater healing, the Beacon\'s keys.' },
        { room: 'Shaft room', title: 'Down the shaft', gm: 'End of part 1. Hedda gives the heroes the night: a sortie through the mine, with Mabb as guide, to get the Dawnstone back, free who they can and hurt the legion before the final assault. Ser Calder asks to go too.' },
      ],
      wrapUp: 'The traitor is found, but the Dawnstone is in the enemy camp and the Keeper\'s daughter is a prisoner there. Brightwall has one night before the final assault. The heroes go down the old shaft into the hill.',
    },
    {
      id: 'sortie', title: 'Part 2: The night sortie', level: 7,
      summary: 'Through the old silver mine under the hill and out into the legion\'s fortified camp: the counter-mine, the siege engines, the beast pens, the prisoner pens, the legion\'s standard and the warlord\'s own pavilion. There is not enough night to do it all.',
      goal: 'Take back the Dawnstone. Then do as much damage, and save as many people, as six watches of darkness allow.',
      map: theSortie,
      npcs: [
        { npc: 'pf_bwsmabb', x: 9, y: 6 },
        { npc: 'pf_bwscalder', x: 7, y: 8 },
        { npc: 'pf_bwsgrisk', x: 40, y: 58, hidden: true },
        { npc: 'pf_bwsyethra', x: 42, y: 56, hidden: true },
        { npc: 'pf_bwselske', x: 26, y: 71 },
      ],
      scenes: [
        { room: 'Shaft foot', title: 'Into the hill', read: 'The rope creaks, the light of the town shrinks to a coin above you, and then there is only rock and the sound of your own breathing. At the bottom, Mabb puts her ear to the wall, listens, and grins. "Digging," she says. "Someone\'s digging in my mine."', gm: 'Start the night clock: six watches. Each fight, each rescue, each engine burned costs one watch; sneaking past something costs none. Two ways out: east (fast, through the legion\'s counter-mine) or south (slow, quiet, through the drowned gallery and the old adit).' },
        { room: 'Drowned gallery', title: 'The drowned gallery', encounter: 'The pudding in the drowned gallery', optional: true, gm: 'The quiet route has its own guards: things that ate the trapped miners. Avoidable by wading the far side while someone throws meat (DC 13 Stealth for the waders).', treasure: 'A dead foreman\'s pouch: 60 gp and a stone of good luck on a leather cord.' },
        { room: "Miners' chapel", title: "The miners' chapel", optional: true, gm: 'Behind the secret door in the old stope. Safe for a short rest (it costs one watch). Mabb lights a candle for every miner she remembers.', treasure: 'The guild\'s last coffer: 240 gp in old silver bars, and a +1 war pick the guild master was buried without.' },
        { room: 'The mine face', title: 'Under the wall', encounter: 'Sappers at the mine face', handout: 'sapper-orders', gm: 'The legion means to bring down the south wall at dawn. Collapse the face (see the area notes) and the sappers in part 3 have to come over the graveyard wall instead of up through the temple floor. The bulettes in the pen next door wake at the noise.' },
        { room: 'Bulette pen', title: 'Tunnel hounds', encounter: 'Tunnel hounds', optional: true, gm: 'Kill them, or loose them on the sappers. A bulette left alive here erupts in Miners\' Row in part 3.' },
        { room: 'Engine park', title: 'Burn the engines', encounter: 'The engine park', read: 'The engines tower over you, black against the camp fires, stinking of pitch. Up on the frame of the nearest one, a hill giant is asleep with a boulder in his lap like a baby.', gm: 'Each catapult burned narrows the east breach in part 3; all three burned and there is no breach. The siege tower burned means no assault on the Beacon from the north. The ram broken (or the mammoth freed) means the gate holds. A fire here is seen by the whole camp: the clock jumps one watch.' },
        { room: 'The saps', title: 'Pickets in the trenches', encounter: 'Pickets in the saps', optional: true, gm: 'Worg pickets walk the approach trenches. Sneak past (group DC 15 Stealth) or silence them fast before a horn blows (any picket that gets a turn after the first round blows it: one watch lost).' },
        { room: 'Mammoth pen', title: 'The beast pens', encounter: 'The beast pens', optional: true, gm: 'Release the mammoth into the camp (DC 16 Animal Handling) and it rampages through the tent lines: the heroes get a free watch, and there is no ram in part 3. The worgs are the real danger; the handlers try to calm the mammoth first.' },
        { room: 'Prisoner pens', title: 'The pens', encounter: 'Pen guards', handout: 'pen-roll', read: 'In the eastern cage a thin girl in cracked spectacles looks up as you come out of the dark. She does not cry out. She holds up three fingers, points at the guard tent, and mouths: "Three. Asleep."', gm: 'Elske has already worked out the escape: out the west gate and up the gully to the old adit. Thirty-one prisoners, many weak. Getting them clear costs two watches, or one if the heroes make a diversion (the pitch store, the mammoth). Saving them is the most important thing the heroes can do for Teodric.' },
        { room: 'The Great Tally', title: 'The legion\'s standard', encounter: 'The Great Tally guard', optional: true, gm: 'Take or burn the Great Tally and the legion\'s heart cracks (see the area notes). The hardest thing in the camp to do quietly: this is a fight.', treasure: 'The champions\' masks (silver-chased, 50 gp each) and a +1 shield with the legion\'s fist on it.' },
        { room: "Warlord's pavilion", title: 'The warlord\'s pavilion', encounter: "The warlord's pavilion", read: 'Grisk Uldaran sets down his pen, stands, and inclines his head. "You came up through my mine. Good. I would have." He gestures at a chair. "Sit, if you like. Or fight, if you must. Either way, someone counts tonight."', gm: 'Grisk talks first. He offers a duel: one hero against him, before witnesses. If the hero wins, he hands over the Dawnstone and lets them walk out, and keeps his word (Yethra does not: she sends bugbears after them, or ambushes them at the sap-head). If they fight, it is a hard fight in a tent in the middle of an army: the alarm goes up in two rounds.', treasure: 'The Dawnstone (in the strongroom chest). Grisk\'s war chest: 450 gp and a pouch of five garnets (100 gp each). A cloak of protection on the armour stand.' },
        { room: 'The old adit', title: 'Back into the hill', gm: 'End of part 2. However they get out, the heroes go back through the hill before dawn, with whoever they saved. Count the engines burned, the prisoners freed, the mine collapsed or not. Level up to 8.' },
      ],
      wrapUp: 'The heroes climb back up the shaft as the sky greys, with the Dawnstone or without it, and with as many lives as they could carry. Below the walls the legion\'s drums begin the slow count of the final assault. The heroes reach level 8.',
    },
    {
      id: 'burning', title: 'Part 3: Brightwall burning', level: 8,
      summary: 'The final assault. The gate falls, the walls are breached, and the town burns. The heroes fight back up the hill from the barricades to the Beacon, choosing who to save on the way, and relight the Beacon under the warlord\'s eyes.',
      goal: 'Hold long enough, save who they can, and light the Beacon.',
      map: brightwallBurning,
      npcs: [
        { npc: 'pf_bwshedda', x: 37, y: 37 },
        { npc: 'pf_bwscalder', x: 39, y: 27 },
        { npc: 'pf_bwsagathe', x: 50, y: 36 },
        { npc: 'pf_bwsteodric', x: 48, y: 43, hidden: true },
        { npc: 'pf_bwselske', x: 46, y: 43, hidden: true },
        { npc: 'pf_bwslorimer', x: 43, y: 20 },
        { npc: 'pf_bwsmabb', x: 7, y: 32 },
        { npc: 'pf_bwsgrisk', x: 36, y: 8, hidden: true },
        { npc: 'pf_bwsyethra', x: 33, y: 9, hidden: true },
      ],
      scenes: [
        { room: 'Lamp Street barricade', title: 'The fourth dawn', read: 'Three horns sound below the walls. Then the whole hill shakes. Down Lamp Street, through the smoke, you watch the Great Gate burst inwards in a spray of stone, and something enormous in iron plate comes through it, trumpeting.', gm: 'Start of the final assault. Tell the players exactly what their part 2 work changed: no ram (the gate holds), no breach, no sappers under the temple, a broken standard. Then begin the battle. Each scene is a turn: what they do not go to, falls.' },
        { room: 'The fallen gate', title: 'The war mammoth', encounter: 'The war mammoth', gm: 'The legion pours through the gate. The heroes can meet it at the gate (and buy the Inner Line time) or fall back behind the barricade and fight it there. Killing the mammoth in the gate passage blocks it for two rounds.' },
        { room: 'Lamp Street barricade', title: 'Hold the line', encounter: 'Hold the Lamp Street gate', gm: 'The legion comes at the barricade in shield-blocks of five. If the heroes hold it for four rounds, Hedda can hold it alone afterwards. If they leave it early, roll for the line (see the area notes).' },
        { room: 'The east breach', title: 'Giants in the breach', encounter: 'Giants in the east breach', gm: 'Only if a catapult survived part 2. The breach opens behind the line, toward the temple full of children. This is the hard choice: the line, the temple, or the Beacon. Hedda begs the heroes to go to the temple; Calder begs them to go up the crag.' },
        { room: 'Temple refuge', title: 'Sappers in the sanctuary', encounter: 'Sappers in the sanctuary', read: 'The temple floor bulges and splits behind the altar. Through the hole climb bugbears with picks and torches, and the children under the pews start screaming all at once.', gm: 'If the mine face was collapsed in part 2, they come over the graveyard wall a round later instead. Mother Agathe holds the door with her body. Teodric, under guard here, begs to be let loose to fight: if freed, he fights beside the heroes and walks with them to the Beacon.', treasure: 'Agathe gives the heroes the altar crystal to mend the lens, and her last two potions of superior healing.' },
        { room: "Miners' Row", title: 'Breakout in the West Ward', encounter: 'Breakout in the West Ward', optional: true, gm: 'Behind the line, the ground erupts. A bulette (only if it lived through part 2) and worg riders from the broken water-gate head for Mabb\'s cottage, where eleven children hide. Without the bulette, the worgs alone are an easy fight.' },
        { room: 'Burned Cloth Hall', title: 'Voices under the ashes', optional: true, gm: 'Six wounded in the cellar of the burning hall. Three rounds and three DC 15 checks to get them out (see the area notes). Every round spent here is a round the Beacon is not lit. Make the players say out loud what they choose.' },
        { room: 'Fountain Cross', title: 'The last rally', gm: 'A breath before the climb. Ser Calder (if alive) rallies the militia here; Reeve Lorimer may find his courage and raise the town banner. Teodric, if he is with the heroes, reads them the Rite from memory.', handout: 'kindling-rite' },
        { room: 'Signal Stair', title: 'Shield wall on the stair', encounter: 'Shield wall on the Signal Stair', gm: 'Grisk\'s chosen hold the stair. The goat path (west, DC 14 Athletics, single file) and the Watch Door (east, through Wall Road North, DC 18 Athletics to break) both go round in two rounds and take the shield wall from behind.' },
        { room: 'Beacon yard', title: 'Grisk at the Beacon', encounter: 'Grisk at the beacon', read: 'On the top of the crag, in a ring of black shields, the warlord waits for you with his spear grounded. Behind him the Ashcaller is rolling pitch barrels into the Beacon tower, laughing her hoarse laugh. "You came," says Grisk. "Good. Let us see who is counted."', gm: 'The finale. Three jobs at once: fight Grisk and his guard, stop Yethra burning the tower (two uninterrupted turns inside and it burns), and get the Dawnstone into the cradle with the three-action rite in the Lantern room. If the Great Tally was taken in part 2, the hobgoblins break when Grisk falls. When the Beacon blazes up, Grisk lowers his spear: he knows. He offers to march his legion away, and keeps his word. Yethra does not, and must be stopped.', treasure: 'Grisk\'s +1 spear and black plate (as plate armour, his tally-cords still on it). Yethra\'s wand of fireballs (if she falls). The town\'s thanks: the Reeve\'s war chest (400 gp) and the freedom of Brightwall.' },
        { room: 'Lantern room', title: 'While Brightwall stands', read: 'The Dawnstone takes the fire, and the lens swings round, and a beam of white-gold light leaps from the crag across the valley, so bright that the smoke around you glows. Far away on the blue ridge, a second fire answers. Then a third. Then, faint and thin on the wind, the horns of the Dawnward.', gm: 'The ending. By noon the knights come over the ridge. Count the tally of saved and lost aloud, by name where you can.' },
      ],
      wrapUp: 'The Beacon burns. The Dawnward Knights ride down the valley by noon, and the Tally Legion withdraws in good order or breaks and runs, depending on what the heroes did to it. Brightwall counts its dead, and carves the heroes\' names on the Beacon\'s brass plaque, under the Keepers.',
    },
  ],
  ending:
    'Success: the Beacon is lit, the knights come, and the legion marches away (in order if Grisk lives, scattered if he and the Great Tally fell). Teodric, if he lived, stands trial; the town decides between the rope and exile, and Elske\'s testimony may sway them. Failure: if the Beacon is not lit by dusk, the knights do not come. The town falls street by street; the heroes can lead whoever is left down the shaft and out through the old adit, and Grisk raises his banner over the dark Beacon. What next: Grisk\'s legion was only the vanguard of a hobgoblin march-kingdom in the eastern hills, and his masters will want to know why it came home. If Yethra escaped, she remembers the heroes\' faces, and she is very good with fire.',
};

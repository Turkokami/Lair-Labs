// The Dark Light of Wrackstone: a one-session storm adventure for four level 2 heroes.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function wrackstoneIsle() {
  const b = new MapBuilder('adv-wrackstone-isle', 'Wrackstone Isle in the storm', 80, 80, { open: true, floor: 'grass', ambient: 'dark', wallStyle: 'stone' });
  const r = rng(4471);

  // A path of dirt painted square by square over open ground (it never makes new floor).
  const path = (pts: [number, number][], w: number, mat = 'dirt') => {
    let [px, py] = pts[0];
    b.paint(px, py, w, w, mat);
    for (const [x, y] of pts.slice(1)) {
      while (px !== x || py !== y) {
        if (px !== x && (py === y || Math.abs(x - px) >= Math.abs(y - py))) px += Math.sign(x - px);
        else py += Math.sign(y - py);
        b.paint(px, py, w, w, mat);
      }
    }
  };
  // Scatter one kind of prop over plain ground (land, not water) inside a box.
  const scatter = (kind: string, n: number, x: number, y: number, w: number, h: number) => {
    for (let i = 0, tries = 0; i < n && tries < n * 20; tries++) {
      const px = x + Math.floor(r() * w), py = y + Math.floor(r() * h);
      if (b.cellAt(px, py) !== 1) continue;
      b.prop(kind, px, py, Math.floor(r() * 4) * 90);
      i++;
    }
  };

  // ---------- the sea, the island and its cliffs ----------
  b.water(0, 0, 80, 80, true);
  b.cave(null, 34, 36, 27, 21, { seed: 11, mat: 'grass', wobble: 0.1 });
  b.cave(null, 30, 17, 19, 10, { seed: 12, mat: 'grass', wobble: 0.12 });
  b.cave(null, 60, 38, 14, 13, { seed: 13, mat: 'grass', wobble: 0.1 });
  b.cave(null, 21, 53, 12, 7, { seed: 14, mat: 'grass', wobble: 0.12 });
  // every bit of land that touches the sea is a sheer drop, except where it is opened again below
  const cliff: [number, number][] = [];
  for (let y = 0; y < 80; y++)
    for (let x = 0; x < 80; x++) {
      if (b.cellAt(x, y) !== 1) continue;
      let sea = false;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (b.cellAt(x + i, y + j) === 2) sea = true;
      if (sea) cliff.push([x, y]);
    }
  for (const [x, y] of cliff) b.rock(x, y, 1, 1);
  // the high rock: the upper tower (north-east), the outcrop the lighthouse stands on, the Wrack headland over the sea caves (south)
  b.rock(58, 0, 22, 23);
  b.rock(48, 23, 16, 25);
  b.rock(34, 48, 40, 28);
  b.rock(64, 23, 12, 15).rock(55, 17, 3, 6);
  // the Knuckle: a tor of black rock in the north-west, over the old smugglers' way
  b.rock(16, 7, 14, 8);

  // ---------- the landing (west): the heroes come ashore here ----------
  b.floor(1, 41, 5, 3, 'wood-planks');
  b.floor(5, 39, 6, 7, 'stone-cobble');
  b.area('Wrack landing', [[1, 39, 10, 7]], {
    read: 'Your boat slams against a stone jetty slick with weed. Stone steps climb into the dark. Far above, the lighthouse stands black against the storm, and its lamp is dead.',
    gm: 'The heroes start here at about eight bells of the evening (8 o\'clock). The midnight clock starts now (see tips). Two wrecker longboats are NOT here: they are in the smugglers\' cove. A DC 12 Perception spots fresh boot prints in the weed going both north (cove) and east (cottage). Tying the boat safely takes a DC 10 Strength check, or the storm smashes it by eleven.',
    label: [6, 42],
  });
  b.props_('mooring-post', [[1, 41], [1, 43]]).prop('rowboat', 2, 42, 90).prop('rope-coil', 6, 40).prop('lantern-standing', 9, 41, 0, { off: true }).props_('barrel', [[7, 44], [8, 44]]).prop('anchor', 5, 44).prop('signpost', 10, 40);
  b.start(2, 41, 3, 3);

  // ---------- the paths over the heath ----------
  path([[10, 42], [18, 43], [28, 45], [36, 41], [42, 34], [47, 31]], 2);
  path([[9, 39], [10, 33], [12, 28], [15, 22], [17, 19]], 1);
  path([[17, 19], [24, 18], [30, 17]], 2);
  path([[44, 19], [48, 21], [51, 22]], 2);
  path([[26, 43], [22, 48], [20, 54], [18, 57]], 1);
  path([[42, 34], [40, 26], [40, 20]], 1);
  b.area('The heath', [[30, 24, 12, 8], [56, 23, 10, 6]], {
    read: 'Rain comes sideways over a hump of gorse, heather and boulders. The wind keeps trying to sit you down. Every few seconds lightning shows you the whole island, and then takes it away again.',
    gm: 'Open ground between everything. In the storm, sight is 60 feet and a shout carries 30. Anyone off the paths in the dark: DC 10 Survival or blunder into gorse and lose 10 feet of movement. Wreckers crossing between the chapel and the lighthouse use the north path every half hour or so.',
    label: [35, 28],
  });
  scatter('thorn-bush', 18, 28, 22, 18, 14);
  scatter('boulder', 10, 12, 24, 40, 28);
  scatter('grass-tall', 14, 10, 22, 50, 30);
  scatter('boulder-large', 4, 30, 22, 16, 12);
  b.props_('cairn', [[36, 27]]).prop('standing-stone', 33, 31).prop('log-fallen', 39, 30, 90).prop('stump', 30, 34);

  // ---------- the beacon knoll (west): the false light ----------
  b.paint(8, 26, 7, 6, 'dirt');
  b.area('Beacon knoll', [[8, 25, 8, 8]], {
    read: 'On a bald knoll by the west cliffs, an old iron fire-basket on a pole has been brought back to life. A ship\'s lantern burns inside it, shuttered on the landward side so only the sea can see it.',
    gm: 'The false light. Ships that cannot see the lighthouse see this and think it marks the safe channel; it steers them straight onto the reef. Ruddock Vosper lights it at dusk and four wreckers tend it with him. Putting it out is easy (one action) and takes a little pressure off the clock: a ship that sees NO light at all slows and heaves to, so with both lights dark the Wendeline arrives half an hour late. The lantern is a big ship\'s lamp and can be carried up to the lamp room as a poor substitute for the burner crown (see the lamp room).',
    label: [11, 28],
  });
  b.prop('brazier-hanging', 11, 28).prop('lantern-standing', 11, 27).props_('firewood', [[10, 29], [13, 30]]).prop('lean-to', 9, 26).prop('oil-slick', 12, 30).prop('cairn', 14, 26);
  b.light(11, 27, 20, 40, '#ffcf6b');
  b.encounter('Keepers of the false light', [7, 24, 9, 9], [['bandit', 3], ['thug', 2]], 'low');

  // ---------- the smugglers' cove (north-west) ----------
  b.water(6, 12, 7, 11, false);
  b.floor(12, 13, 5, 9, 'sand').floor(13, 12, 3, 1, 'sand');
  b.area("Smugglers' cove", [[6, 12, 11, 11]], {
    read: 'A narrow cove bites into the cliffs, out of the worst of the wind. Two black longboats are pulled up on the shingle, oars stacked. A hole in the rock at the back of the beach breathes cold air.',
    gm: 'The wreckers\' boats. Stove in or stealing the boats strands the wreckers: once they know, Grisel is far more willing to bargain. A DC 13 Perception finds a smugglers\' mark scratched by the cave hole (an eye with a line through it): the old way to the chapel crypt. The cove water is shallow and calm; a hero can swim out of it and round to the landing (DC 13 Athletics in the storm).',
    label: [13, 17],
  });
  b.props_('rowboat', [[13, 16], [14, 19]], 0).props_('crate', [[15, 14], [15, 20]]).prop('fishing-net', 12, 21).prop('mooring-post', 12, 15).prop('debris-wood', 8, 20).prop('loot-sacks', 16, 17).prop('lantern-hook', 15, 13).prop('reeds', 7, 13);
  b.light(15, 13, 5, 15);

  // ---------- the Knuckle: smugglers' way and the chapel crypt ----------
  b.tunnel([[14, 12], [18, 10], [22, 11]], 1, { mat: 'cave-floor', seed: 21 });
  b.area("Smugglers' way", [[15, 9, 7, 3]], {
    read: 'A crack in the tor, worn smooth by a hundred years of smugglers\' shoulders. Your light finds old chalk tallies on the walls.',
    gm: 'The quiet way into the wreckers\' camp: it comes up in the chapel crypt behind the bone shelves. Nance Kestle uses it to slip off and be alone. The wreckers have forgotten it exists.',
    label: [18, 10],
  });
  b.prop('lantern-hook', 20, 11, 0, { off: true });
  b.room('Chapel crypt', 22, 9, 7, 5, {
    mat: 'dungeon-slab',
    read: 'A low vault full of old bones stacked like firewood. The storm drums somewhere overhead. Stone steps go up to a trapdoor.',
    gm: 'Under the chapel. The bone shelves hide the smugglers\' way (from this side, a DC 10 Investigation: there is a draught). The wreckers keep their best loot here: the Gannet\'s strongbox (locked, DC 13 thieves\' tools; Grisel has the key). A secret door (DC 14 Perception from the chapel side; it is the trapdoor under the altar stone) leads up into the chapel.',
  });
  b.props_('ossuary-shelf', [[22, 9], [23, 9], [27, 9]]).prop('skull-pile', 28, 12).prop('strongbox', 26, 12).props_('loot-sacks', [[23, 12], [24, 12]]).prop('stairs-up', 28, 10).prop('gm-treasure', 26, 11, 0, { gm: true });
  b.floor(29, 10, 1, 1, 'dungeon-slab').door(29, 10, 'e', 'secret');

  // ---------- the ruined chapel and the wreckers' camp (north) ----------
  b.building('Ruined chapel', 30, 9, 11, 8, {
    mat: 'stone-flagstone',
    read: 'The Chapel of the Lamp lost its roof long ago. Inside, under a sail stretched for a ceiling, the wreckers have piled what the sea brought them: bolts of cloth, kegs, a gilt mirror, a ship\'s figurehead with a sad wooden face.',
    gm: 'The loot store. Six casks of lamp oil the wreckers took from the oil cellar to sell are stacked by the altar (one cask fills the lamp; it takes one hero with Strength 13 or two together to carry it, at half speed). The altar stone lifts (DC 12 Strength) to show the crypt steps.',
    doors: [[35, 16, 's', 'open', 'door-double'], [36, 16, 's', 'open', 'door-double'], [40, 12, 'e', 'closed']],
    windows: [[30, 12, 'w'], [33, 9, 'n'], [37, 9, 'n']],
  });
  b.prop('altar', 31, 10).props_('barrel-stack', [[32, 11], [33, 11], [32, 12]]).prop('cargo-crates', 38, 10).prop('mirror', 39, 11).prop('ship-mast', 36, 12).prop('sails-pile', 34, 14).props_('pew', [[32, 14], [38, 14]]).prop('treasure-pile', 39, 15).prop('candles', 31, 15);
  b.light(31, 15, 5, 10);
  b.paint(28, 17, 18, 6, 'dirt');
  b.area("Wreckers' camp", [[28, 17, 18, 6], [41, 9, 6, 8]], {
    read: 'Tents snap and strain in the lee of the chapel walls. Round a driftwood fire, a dozen hard-faced men and women in oilskins drink, gamble with a ship\'s dice and keep glancing south, toward the lighthouse, as if something might come up the path.',
    gm: 'Six bandits, three thugs and Nance Kestle (scout). They are scared: last night the dead came up into the lighthouse and dragged two of their mates away. They will parley before they fight, and they do not want to die for Grisel. A hero who walks up openly gets a hearing. DC 13 Persuasion or Intimidation, or proof of the dead (a zombie\'s head, Senna\'s story), and half of them simply row away when the tide turns at ten. If a fight starts, the wreckers flee when four are down.',
    label: [36, 19],
  });
  b.props_('tent', [[29, 18], [32, 21], [43, 18]], 0).prop('tent-round', 44, 11).prop('campfire', 37, 19).props_('bench-long', [[35, 18], [39, 20]]).prop('table-cards', 40, 18).props_('crate-pile', [[42, 16], [42, 21]]).prop('cooking-pot-fire', 34, 20).prop('weapon-barrel', 44, 15).props_('bedroll', [[30, 21], [41, 21]]).prop('lantern-hook', 42, 13);
  b.light(37, 19, 15, 25, '#ff9a4a').light(42, 13, 5, 10);
  b.encounter('The wreckers\' camp', [28, 9, 19, 14], [['bandit', 6], ['thug', 3], ['scout', 1]], 'moderate');
  b.area('Drowned graves', [[42, 17, 5, 6], [46, 19, 3, 3]], {
    read: 'Behind the camp, a little graveyard leans toward the sea. Every stone is for someone the sea took: "Lost off the Wrack", "Lost off the Wrack", "Lost off the Wrack".',
    gm: 'A DC 12 Investigation finds a stone that reads "Here lies nobody. Captain M. Cullis and his crew of the Hungry Patience, hanged at Scaldby, drowned before the rope. The sea keeps them." Forty years old. It is the first hint of who woke in the caves.',
    label: [44, 20],
  });
  b.props_('burial-slab', [[43, 18], [45, 18], [43, 21]]).prop('open-grave', 46, 20).prop('tree-dead', 47, 19).prop('road-shrine', 45, 21);

  // ---------- the keeper's cottage and garden ----------
  b.building("Keeper's cottage", 20, 31, 9, 7, {
    mat: 'wood-planks',
    read: 'A whitewashed cottage, its door kicked in. Drawers lie emptied on the floor, a clock has been smashed, and the rain blows in over a half-eaten supper for two.',
    gm: 'The wreckers looted it four nights ago and come back for anything they missed. Mabyn Tollan, the keeper\'s granddaughter, hides in the loft (DC 14 Perception to hear her breathe; she comes down for a kind voice or anyone who says her grandmother\'s name). The keeper\'s spare log lies under the bed (handout). Ebba kept her good lantern on a hook here: it is gone, because Ebba took it.',
    doors: [[24, 37, 's', 'open'], [28, 34, 'e', 'closed']],
    windows: [[20, 33, 'w'], [22, 31, 'n'], [26, 31, 'n'], [28, 36, 'e']],
  });
  b.prop('fireplace', 21, 32).prop('kitchen-table', 24, 34).props_('chair', [[23, 34], [25, 34]]).prop('bed', 27, 32).prop('broken-furniture', 22, 36).prop('ladder', 26, 36).prop('dresser', 21, 35).prop('rocking-chair', 23, 32).prop('gm-treasure', 27, 33, 0, { gm: true });
  b.paint(19, 38, 13, 6, 'dirt');
  b.area('Kitchen garden', [[19, 38, 13, 6], [29, 32, 4, 5]], {
    read: 'Behind a dry-stone wall, cabbages and beans have been flattened by the wind. A goat bleats from a shed. A row of beehive-shaped dovecotes rattles on the wall.',
    gm: 'Three wreckers and their two dogs are digging up the garden: Grisel is sure the keeper buried money. (She did not, but the dogs find an old pot of 30 sp under the beans.) The dogs smell the heroes from 60 feet unless they come upwind from the south. The goat shed has a dry corner and a short rest\'s worth of quiet.',
    label: [25, 40],
  });
  b.props_('crop-rows', [[21, 40], [24, 40], [27, 40], [21, 42]]).prop('well', 30, 39).prop('chicken-coop', 30, 33).prop('beehive', 32, 35).props_('fence-wood', [[19, 43], [23, 43], [31, 42]], 0).prop('fence-gate', 26, 43).prop('scarecrow', 29, 41).prop('handcart', 20, 39).prop('mud-patch', 25, 42);
  b.wallRun(19, 43, 7, 's', 'low').wallRun(27, 43, 5, 's', 'low');
  b.building('Goat shed', 15, 34, 4, 4, { mat: 'dirt', doors: [[18, 36, 'e', 'open']], gm: 'A nanny goat called Old Brine-Beard and a lot of straw. Dry. Mabyn hid here the first night.' });
  b.props_('hay-bale', [[16, 35]]).prop('water-trough', 16, 37);
  b.encounter('Diggers in the garden', [18, 37, 15, 8], [['bandit', 3], ['thug', 1], ['mastiff', 2]], 'low');

  // ---------- the lighthouse: yard, base, stores and oil cellar ----------
  b.paint(40, 26, 8, 11, 'stone-cobble');
  b.area('Lighthouse yard', [[40, 26, 8, 11]], {
    read: 'A cobbled yard at the foot of the tower, half walled against the wind. The great black column goes up and up into the rain. A coil of hose, a water butt, a woodpile, and two wreckers in a doorway pretending they are not cold.',
    gm: 'The front of the lighthouse. The double door is barred from inside at night (DC 15 Strength to force, loud). The two thugs in the doorway belong to Grisel\'s hold: a fight out here brings Grisel out to see. A DC 12 Perception spots the north door (into the mess) and that it is only latched.',
    label: [43, 31],
  });
  b.wallRun(40, 26, 8, 'n', 'low').wallRun(40, 26, 4, 'w', 'low').wallRun(40, 33, 4, 'w', 'low').wallRun(40, 36, 8, 's', 'low');
  b.props_('water-barrel', [[46, 27]]).prop('firewood', 41, 27).prop('handcart', 44, 35).prop('rope-coil', 46, 35).prop('lamp-post', 41, 34).prop('barrel', 46, 33);
  b.floor(48, 30, 1, 2, 'stone-flagstone');
  b.room('Tower foot', 49, 29, 8, 7, {
    mat: 'stone-flagstone',
    read: 'The round room at the bottom of the tower. A spiral stair winds up out of sight. Hammocks are strung between the iron pillars, and a big woman with a cutlass sits at a sea-chest desk, counting coins and listening to the stair.',
    gm: 'Grisel Corvey\'s hold, with two thugs. The stair door is locked; Grisel has the key on her belt. She will talk first: see her profile for what she wants. If it comes to a fight she yields at half her hit points if the heroes have offered her any way out before.',
  });
  b.door(49, 30, 'w', 'locked', 'door-double').door(49, 31, 'w', 'locked', 'door-double');
  b.props_('pillar-round', [[51, 31], [54, 31]]).prop('stair-spiral', 56, 29).props_('hammock', [[50, 33], [53, 33]]).prop('desk', 52, 30).prop('chair', 52, 29).prop('coins-small', 53, 30).prop('weapon-rack', 50, 35).prop('lantern-hanging', 53, 32).prop('trunk', 55, 34);
  b.light(53, 32, 15, 20);
  b.encounter('Grisel\'s hold', [49, 29, 8, 7], [['banditCaptain', 1], ['thug', 2]], 'moderate');
  b.floor(51, 23, 1, 1, 'stone-flagstone');
  b.room('Wreckers\' mess', 49, 24, 7, 4, {
    mat: 'wood-planks',
    read: 'The keepers\' old store has become a mess room: a table of dirty bowls, a stove, wet coats steaming on a line. Somebody has chalked a skull on the cellar-ward wall and written NO.',
    gm: 'Empty half the time; a wrecker cooks here the other half. Through the north door is the quick way in from the chapel path. The pantry shelf holds 2 days of food and a bottle of good brandy (Grisel\'s). The chalk skull is a warning about the oil cellar: the wreckers will not go down there now.',
  });
  b.door(51, 24, 'n', 'closed').floor(52, 28, 1, 1, 'stone-flagstone').door(52, 28, 'n', 'closed').door(52, 28, 's', 'open');
  b.prop('table-long', 51, 25).prop('stove', 49, 24).prop('wall-shelves', 55, 24).props_('coat-rack', [[54, 27]]).prop('barrel', 49, 27).prop('pot-rack', 50, 24);
  b.floor(57, 32, 1, 1, 'stone-flagstone').door(57, 32, 'w', 'closed');
  b.room('Store rooms', 58, 30, 5, 7, {
    mat: 'stone-flagstone',
    read: 'Shelves of candles, wicks, brass polish, spare panes of thick green glass. In the back, on a heap of sailcloth, a woman with her wrists tied looks up at you.',
    gm: 'Senna Wetherell, mate of the wrecked Gannet, is held here for ransom. She knows what was in the crate and will fight beside the heroes (use the scout stat block) if given a weapon. Spare wicks and lamp mantles here: with these, a DC 12 tinker\'s tools or Intelligence check lets the heroes rebuild a crude burner without the crown (the light is weak: see the lamp room).',
  });
  b.door(58, 32, 'w', 'locked').door(62, 35, 'e', 'locked');
  b.hall(63, 35, 63, 38, 1, { mat: 'stone-flagstone', downFirst: true });
  b.area("Keeper's sea stair", [[63, 35, 1, 4]], { gm: 'Steps cut in the rock from the store rooms\' back door down to the tide pools, where the keepers land supplies in calm weather. The door is locked (DC 13 thieves\' tools; Grisel has the key).', label: [63, 37] });
  b.prop('stairs-down', 63, 36);
  b.props_('wall-shelves', [[58, 30], [62, 30]]).prop('sails-pile', 61, 35).prop('crate', 58, 36).prop('candles', 60, 30).prop('tool-crate', 62, 33);
  b.floor(52, 36, 1, 3, 'stone-flagstone').door(52, 35, 's', 'closed', 'door-iron');
  b.room('Oil cellar', 50, 39, 11, 6, {
    mat: 'dungeon-slab',
    read: 'Steps go down into a vault that stinks of lamp oil and the sea. Two great iron tanks stand against the wall, one holed and dribbling. The floor is wet, and the wet comes in wide, flat, bare footprints from the south wall.',
    gm: 'The drowned come up the shaft from the sea caves after dark (four zombies and a ghoul tonight). The right-hand tank still holds enough oil for the lamp: fill a cask from the tap (2 minutes). Following the footprints: a DC 12 Investigation finds the secret door low in the south wall, which the dead left ajar. Fire here is deadly: anything that sets the spilled oil alight does 2d6 fire to everyone in the cellar and lights the whole room for a minute.',
  });
  b.props_('cauldron-tripod', [[51, 40]]).props_('barrel-stack', [[58, 40], [59, 40]]).prop('oil-slick', 55, 42).prop('stairs-up', 52, 39).prop('water-barrel', 60, 43).prop('puddle', 57, 43).prop('chains-hanging', 54, 40).prop('bones', 50, 43);
  b.props_('cargo-hatch', [[56, 40], [57, 40]]);
  b.encounter('The dead in the oil cellar', [50, 39, 11, 6], [['zombie', 4], ['ghoul', 1]], 'low');
  b.door(57, 44, 's', 'secret');

  // ---------- the tower stair, the watch room and the lamp ----------
  b.hall(57, 29, 60, 29, 1, { mat: 'stone-flagstone' }).hall(60, 29, 60, 22, 1, { mat: 'stone-flagstone', downFirst: true }).hall(60, 22, 58, 22, 1, { mat: 'stone-flagstone' }).hall(58, 22, 58, 18, 1, { mat: 'stone-flagstone', downFirst: true }).hall(58, 18, 59, 18, 1, { mat: 'stone-flagstone' });
  b.door(57, 29, 'w', 'locked', 'door-iron');
  b.area('Tower stair', [[57, 29, 4, 1], [60, 22, 1, 8], [58, 18, 3, 5]], {
    read: 'One hundred and twelve iron steps, winding up through the dark. The whole tower hums with the wind. Somewhere far below, something wet slaps a step, then another.',
    gm: 'The stair. Two people can fight side by side here, no more. Carrying a full cask of oil up the stair takes ten minutes (DC 10 Strength (Athletics) or drop it: it rolls down and bursts at the bottom). The stair is the only way up from inside. The dead follow the heroes up it if the cellar was left open.',
    label: [60, 25],
  });
  b.props_('stairs-up', [[58, 29], [60, 26], [58, 21]]).prop('lantern-wall', 60, 23, 0, { off: true });
  b.room('Watch room', 59, 15, 8, 5, {
    mat: 'wood-planks-dark',
    read: 'A cramped room under the lantern. A great brass clockwork turns the lamp when wound: its weight-chain disappears down a slot in the floor. A log book lies open on a high desk, pen still in the ink.',
    gm: 'The keeper\'s watch room. The clockwork is jammed with a belaying pin (pull it out: one action). Winding it takes a DC 10 Strength check. The keeper\'s log is here (handout). A short ladder goes up through a hatch to the gallery.',
  });
  b.prop('writing-desk', 60, 15).prop('stool', 61, 16).prop('winch', 64, 17).prop('chains-hanging', 66, 18).prop('telescope', 62, 19).prop('oil-lamp-hanging', 63, 16).prop('ladder', 65, 15);
  b.light(63, 16, 5, 15);
  b.floor(65, 14, 1, 1, 'stone-flagstone');
  b.room('Outer gallery', 61, 2, 15, 12, {
    mat: 'stone-flagstone',
    read: 'You step out onto a narrow iron balcony a hundred feet above the sea. The wind tries to tear you off it. Below, white water explodes on the reef; out on the black sea, very far off, a single yellow light rises and falls.',
    gm: 'The gallery round the lantern. In the wind, anyone who fights or runs here makes a DC 10 Dexterity save at the start of their turn or is knocked prone. A creature shoved off the rail falls; it is fatal unless the hero catches the rail (DC 13 Athletics). The light out at sea is the Bright Wendeline: she is about an hour out, or less.',
    label: [64, 3],
  });
  b.room('Lamp room', 64, 5, 9, 7, {
    mat: 'stone-flagstone-warm',
    read: 'A cage of green glass panes around a great cold lamp. Its lens is a beehive of glass rings taller than a man. The brass socket at its heart is empty.',
    gm: 'To light the lamp the heroes need: oil in the reservoir (one cask), a burner in the socket, and the clockwork wound. The burner crown (Ebba has it) gives a full beam: success. A crude burner from the store room spares or the beacon\'s ship lantern gives a weak light: the Wendeline sees it on a DC 13 Wisdom check made by the GM at midnight (advantage if the false light is out). Lighting it is one action with flint and steel. Lit, the beam sweeps the whole island once a minute.',
  });
  b.wallRun(64, 5, 9, 'n', 'window').wallRun(64, 11, 9, 's', 'window').wallRun(64, 5, 7, 'w', 'window').wallRun(72, 5, 7, 'e', 'window');
  b.door(68, 11, 's', 'closed', 'door-wood');
  b.prop('crystal-lamp', 68, 8).prop('lever', 65, 10).prop('water-barrel', 71, 10).prop('crate', 65, 6);
  b.props_('lantern-cluster', [[62, 3]]).prop('crumbling-ledge', 74, 12);
  b.light(68, 8, 40, 60, '#fff1c2');
  b.encounter('Drowned on the gallery', [61, 2, 15, 12], [['ghoul', 2], ['zombie', 2]], 'moderate');

  // ---------- the tide pools (east) ----------
  b.floor(64, 38, 11, 9, 'cave-floor');
  b.pool(66, 40, 1.5, 1.2).pool(72, 39, 1.8, 1.2).pool(65, 45, 1.6, 1.1).pool(73, 45, 1.5, 1.2);
  b.pool(69, 43, 3.2, 2.2, true);
  b.water(75, 39, 1, 7, false);
  b.area('Tide pools', [[64, 38, 11, 9]], {
    read: 'A shelf of black rock steps down to the sea in pools full of weed and starfish. In the biggest pool the water bulges, and a grey fin slices slowly round and round.',
    gm: 'A hunter shark the falling tide trapped in the long pool. It attacks anything in or next to the water. It can be avoided by keeping to the rocks (DC 10 Acrobatics on the slick weed, or fall in). Flotsam from the Ottery Belle lies all along the shelf. A DC 12 Perception spots a cleft in the rock at the south edge with a cold draught: the sea-door into the caves. Steps at the west end climb to the lighthouse store rooms\' back door (locked).',
    label: [68, 39],
  });
  b.props_('debris-wood', [[64, 39], [74, 42]]).props_('barrel', [[67, 46], [71, 38]]).prop('sails-pile', 73, 41).props_('lily-pads', [[66, 40]]).prop('fishing-net', 64, 44).prop('skeleton-lying', 72, 46);
  b.encounter('The trapped shark', [65, 40, 9, 6], [['hunterShark', 1]], 'low');

  // ---------- the south beach, the reef and the wreck of the Gannet (south-west) ----------
  b.floor(10, 56, 18, 4, 'sand');
  b.water(3, 60, 31, 17, false);
  b.water(2, 64, 4, 6, true).water(28, 61, 5, 4, true);
  for (let i = 0; i < 26; i++) b.rubble(4 + Math.floor(r() * 28), 61 + Math.floor(r() * 15), 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 2));
  b.area('South beach', [[10, 55, 18, 5]], {
    read: 'A cove of grey shingle under the cliffs. Wreckage is everywhere: spars, barrels, a smashed cabin door, a drowned sheep. Out on the reef, the black ribs of a ship stand up out of the surf.',
    gm: 'From about nine bells to eleven, low tide uncovers the reef and the heroes can wade out to the wreck (shallow water and rocks: difficult ground). After eleven the flats flood again: deep water and a DC 13 Athletics check each round to swim against the surge. A DC 12 Survival reads the tide line on the rocks and tells the heroes exactly how long they have.',
    label: [18, 57],
  });
  b.props_('debris-wood', [[12, 57], [22, 56], [26, 58]]).props_('barrel', [[15, 58], [20, 59]]).prop('crate', 17, 56).prop('sails-pile', 24, 57).prop('anchor', 11, 58);
  b.area('Wrack reef', [[4, 60, 29, 16]], {
    read: 'The tide has gone out over a field of black rocks and weed. The surf booms on the far edge. The going is ankle deep, knee deep, then suddenly over your head.',
    gm: 'Shallow water and rocky rubble all the way: difficult ground. The deep channels (dark water) need swimming. A DC 12 Perception spots a gap at the east end of the reef where the water runs into the headland: the Gut, a sea passage into the caves, wadeable only at low tide.',
    label: [9, 70],
  });
  b.floor(16, 66, 10, 4, 'wood-planks').floor(18, 64, 6, 2, 'wood-planks').floor(19, 70, 4, 2, 'wood-planks');
  b.area('Wreck of the Gannet', [[16, 64, 10, 8]], {
    read: 'The Gannet lies on her side on the reef, her back broken. Her hatch gapes. Inside, things in sailors\' clothes stand very still in the knee-deep water, facing the island.',
    gm: 'Six of the Gannet\'s drowned crew, raised by Cullis. They stir when anyone climbs aboard. The captain\'s cabin (stern) holds the ship\'s papers, the cargo manifest (handout) and a sealed tin of dry flares. The hold still has the empty cradle and broken lead straps where the crate was stowed, and the temple seals snapped off it.',
    label: [20, 67],
  });
  b.prop('ship-mast', 21, 67, 30).prop('ship-wheel', 24, 67).prop('cargo-hatch', 19, 67).props_('cargo-crates', [[17, 66], [22, 69]]).prop('chains-hanging', 20, 69).prop('crate', 25, 66).prop('rope-coil', 18, 68).prop('chest-open', 24, 68).prop('gm-treasure', 24, 66, 0, { gm: true });
  b.encounter('Drowned of the Gannet', [15, 63, 12, 10], [['zombie', 6]], 'low');
  b.water(33, 68, 6, 2, false);
  b.area('The Gut', [[33, 67, 6, 4]], {
    read: 'A slot of black water runs into the headland. The sea sucks in and out of it, breathing.',
    gm: 'The low-tide way from the reef into the sea-mouth cave. At high tide it is underwater (DC 15 Athletics to swim it in the surge, 2d6 bludgeoning on a fail).',
    label: [35, 68],
  });

  // ---------- the sea caves under the Wrack ----------
  b.tunnel([[57, 45], [57, 48], [56, 51]], 1, { mat: 'cave-floor', seed: 31 });
  b.cave('Shaft foot', 56, 53, 4, 3, {
    seed: 32,
    read: 'An old smugglers\' shaft drops out of the rock overhead with a rusted iron ladder. The cave at its foot is full of the sound of the sea, and it reeks of something dead.',
    gm: 'Where the secret way from the oil cellar comes down. Torn oilskins and a wrecker\'s boot: the two men the dead dragged off last night are not here. Wet tracks go west, south and east.',
  });
  b.prop('ladder', 56, 51).prop('bones-mud', 58, 54).prop('gear-pile', 54, 54);
  b.tunnel([[52, 53], [47, 54], [44, 53]], 2, { mat: 'cave-floor', seed: 33 });
  b.area('Drowned gallery', [[44, 52, 8, 3]], {
    read: 'A low tunnel where the walls are crusted with barnacles and tiny white shells. Bundles of something hang from the ceiling, dripping.',
    gm: 'The bundles are the two wreckers, wrapped in weed and hung up like a larder. Both are dead. One has 12 gp and a good knife. The walls here are low: Medium heroes squeeze (difficult ground).',
    label: [47, 53],
  });
  b.prop('stalactites', 46, 54);
  b.cave("Keeper's refuge", 40, 53, 4, 3, {
    seed: 34,
    read: 'A dry shelf of rock high in the cave wall, reached by a knotted rope. A tiny lantern burns up there, and someone is pointing a boathook at you. "If you\'re dead, you can bugger off."',
    gm: 'Ebba Tollan, the keeper, alive, thirsty and furious. She has held this ledge for three nights; the dead cannot climb the rope, and she cuts it if they try. She has the burner crown wrapped in her shawl. She knows the caves, the Captain\'s grotto, and that the dead hate her lantern\'s light. Fresh water or food wins her over at once.',
  });
  b.prop('rope-coil', 41, 52).prop('lantern-standing', 39, 52).prop('bedroll', 40, 51);
  b.light(39, 52, 10, 15);
  b.tunnel([[40, 56], [41, 60], [43, 63]], 2, { mat: 'cave-floor', seed: 35 });
  b.tunnel([[55, 56], [52, 60], [50, 63]], 1, { mat: 'cave-floor', seed: 36 });
  b.cave('Sea-mouth', 46, 67, 8, 5, {
    seed: 37,
    read: 'A great cave open to the sea, booming like a drum. A whaler, the Ottery Belle, has been rammed into it bow first by the storm, her masts snapped against the roof. Barrels of whale oil bob in the water around her.',
    gm: 'The second wreck. Her drowned crew (two ghouls, the mates who ate the others, and three zombies) guard her for Cullis. The whale-oil barrels are another oil supply: one is enough for the lamp, but it must be got up to the tower. The cave opens to the sea to the south (a boat could come in at low tide) and to the reef through the Gut to the west.',
  });
  b.water(42, 69, 9, 3, false).water(45, 72, 4, 4, true).water(45, 76, 4, 4, true).water(39, 68, 4, 2, false);
  b.floor(43, 64, 7, 3, 'wood-planks');
  b.prop('ship-mast', 45, 65, 60).prop('crows-nest', 48, 64).prop('cargo-hatch', 46, 65).props_('barrel-group', [[43, 70], [49, 70]]).prop('whirlpool', 46, 73).prop('debris-wood', 51, 68).prop('loot-sacks', 40, 66);
  b.encounter('The Ottery Belle\'s drowned', [38, 62, 16, 11], [['ghoul', 2], ['zombie', 3]], 'moderate');
  b.tunnel([[53, 67], [57, 66]], 2, { mat: 'cave-floor', seed: 38 });
  b.cave("Captain's grotto", 64, 66, 7, 5, {
    seed: 39,
    read: 'A tall cave with a black pool in the middle. On a shelf of rock lies a long crate, split open, lead straps peeled back like the lid of a tin. Bones and salt spill out of it. Above the pool, a tall figure in a rotted captain\'s coat turns, and its eyes are two cold points of light.',
    gm: 'Captain Mordaunt Cullis (Drowned Captain, an original Lair Labs stat block) and two of his old crew (zombies). Cullis hates light: the burner crown, the lamp beam or a lantern held high and bright gives him disadvantage on attack rolls while he stands in it. If the lamp is lit while he still walks, he comes up the shaft and the stair with his two crewmen to put it out: run this fight in the lamp room instead. Destroyed, every drowned thing on the island drops where it stands.',
  });
  b.pool(64, 67, 2.5, 1.8, true);
  b.prop('sarcophagus-open', 61, 64).prop('bone-heap', 62, 66).prop('skull-pile', 66, 69).prop('chains-hanging', 67, 63).prop('treasure-pile', 69, 66).prop('gm-treasure', 61, 69, 0, { gm: true });
  b.light(64, 67, 5, 15, '#7fd6ff');
  b.encounter("Captain Cullis", [57, 61, 14, 11], [['drownedPirateCaptain', 1], ['zombie', 2]], 'high');
  b.tunnel([[70, 47], [69, 50]], 1, { mat: 'cave-floor', seed: 40 });
  b.cave("Purser's hole", 67, 53, 3, 3, {
    seed: 41,
    read: 'A narrow cave behind the sea-door, where the sea leaves what it carries in. Driftwood, rope, a dead gull, and a small iron-bound chest half buried in shingle.',
    gm: 'The Gannet\'s purser\'s chest washed in here. Locked (DC 12 thieves\' tools, or break it: DC 14 Strength). Inside: 60 gp, three sea pearls (10 gp each) and a potion of healing in a wax-sealed tin. Two tunnels lead on: west to the shaft foot, and south down a wet slope to the Captain\'s grotto (the back way in: heroes coming this way get one free round if they are quiet, DC 12 Stealth).',
  });
  b.prop('strongbox', 68, 54).prop('debris-wood', 66, 52).prop('rope-coil', 67, 54);
  b.tunnel([[60, 53], [65, 53]], 1, { mat: 'cave-floor', seed: 42 });
  b.tunnel([[67, 56], [66, 59], [65, 62]], 1, { mat: 'cave-floor', seed: 43 });
  b.area('Sea-door', [[69, 47, 2, 4]], { gm: 'A cleft from the tide pools down into the caves. Narrow: one at a time.', label: [69, 48] });

  // ---------- a little more weather and wreckage ----------
  b.props_('debris-wood', [[9, 47], [30, 47], [62, 33]]).prop('skeleton-lying', 13, 50).props_('tree-dead', [[14, 46], [33, 15]]);
  b.note(46, 76, 'Open sea mouth: a boat can come in here at low tide.');
  b.note(2, 42, 'The heroes\' boat. Start of the midnight clock: eight bells (8 o\'clock).');
  return b.build();
}

export const WRACKSTONE_LIGHT: Adventure = {
  id: 'wrackstone-light',
  title: 'The Dark Light of Wrackstone',
  tagline: 'The lighthouse has been dark three nights, wreckers hold the island, the drowned are walking, and a ship full of passengers arrives at midnight.',
  levels: '2',
  sessions: '1 session (3-4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'storm', 'island', 'undead', 'race'],
  pitch:
    'Wrackstone Light has kept ships off the Wrack reef for a hundred years. Three nights ago it went dark. Since then two ships have broken on the rocks, and nobody has come back from the island to say why. Tonight the storm is the worst in years, and at midnight the Bright Wendeline, a packet boat with forty passengers aboard, will come round the point looking for that light. Nobody in Scaldby will row out. You will.',
  secret:
    'Four nights ago Grisel Corvey and her wreckers rowed out to Wrackstone to put the light out and light a false one, so ships would steer onto the reef and be looted. Keeper Ebba Tollan fought them, lost, and escaped down the old smugglers\' shaft under the oil cellar with the burner crown, the brass heart of the lamp, so they could never use her light against ships. The first ship to break was the Gannet. In her hold was a crate sealed with lead, salt and temple seals: the bodies of Captain Mordaunt Cullis and his crew, pirates who threw themselves into the sea in chains forty years ago rather than hang, and who would not stay dead. The temple was shipping them away to be burned. The sea split the crate open in the caves under the island, and Cullis woke, a wight with cold eyes and a captain\'s manners. Every ship that breaks on the reef gives him more drowned sailors. He wants the light dark forever, and he wants the Wendeline: forty more crew, and a ship to sail again. Now the dead are coming up the shaft into the lighthouse at night, and the wreckers are as frightened as anyone.',
  hooks: [
    'The Scaldby harbourmaster nails a notice to the quay: 100 gold pieces to whoever relights Wrackstone tonight. Nobody else is stupid enough. (Handout: the harbour notice.)',
    'A hero\'s cousin, friend or debtor is a passenger on the Bright Wendeline, and her captain swears by the Wrackstone light.',
    'The heroes were aboard the Gannet\'s sister ship and saw the Gannet go down. A fisherman lends them his boat and says the keeper, Ebba Tollan, once pulled him out of the sea.',
  ],
  tips: [
    'Keep the clock where everyone can see it. The heroes land at eight bells (8 o\'clock). Every scene, fight or crossing of the island costs about half an hour; carrying a cask up the tower costs ten minutes; a short rest costs an hour. Low tide is from nine to eleven. The Wendeline arrives at midnight. Ring a bell (or bang a cup) every half hour.',
    'To light the lamp they need three things: oil (the cellar tank, the casks in the chapel, or the whale oil in the sea-mouth), a burner (Ebba\'s burner crown is best; a crude one from the store-room spares or the beacon\'s ship lantern will do, weakly), and the tower stair key (Grisel has it; Nance can steal it; the door can be broken with a DC 16 Strength check, which takes ten minutes of hammering).',
    'There are many ways round: the landing path, the cove and the smugglers\' way into the chapel crypt, the reef and the Gut at low tide, the tide pools and the sea-door, and the secret shaft from the oil cellar. Let the players plan. Every route works.',
    'The wreckers are a resource, not just a fight. They are scared of the dead and they want to live. Grisel can be bargained with, Nance can be turned, and Ruddock is the one who will not give up. A deal with the wreckers saves the heroes two hard fights.',
    'Cullis is a deadly fight at level 2. Bright light is the heroes\' best weapon: a burning lamp or the burner crown held high gives him disadvantage. If the lamp is lit first, he comes to them, up the stair, which is dramatic and lets them fight on their ground.',
    'Running long? Have Ebba meet the heroes in the oil cellar, already climbing out, and skip the sea-mouth. Running short? Let the Wendeline\'s light appear early, at half past eleven.',
  ],
  npcs: [
    {
      id: 'pf_wklebba', name: 'Ebba Tollan', title: 'keeper of Wrackstone Light', kind: 'npc', art: 'commoner', monsterId: 'scout', shared: true,
      wants: 'Her light burning before midnight, her granddaughter Mabyn safe, and Grisel Corvey hanged.',
      knows: 'Every stone of the island, the smugglers\' shaft, the caves, and how the lamp works. She saw the crate wash into the caves and saw what climbed out. The dead hate her lantern.',
      voice: 'Hoarse, blunt, swears like a bosun, then apologises to nobody in particular. Calls the lamp "her".',
      appearance: 'A short, broad woman of sixty in a salt-stiff oilskin, grey hair in a sailor\'s pigtail, a boathook in her fist and a bundle wrapped in a shawl on her back.',
      backstory: 'Thirty years a keeper. Her husband kept the light before her, and drowned trying to reach a wreck in a storm like this one.',
      gmNotes: 'Use the scout stat block, at half hit points when found. She will not leave the burner crown with anyone but a hero who promises to light the lamp. Water or food wins her trust at once. She knows a short way: from the refuge back to the shaft foot and up the ladder into the oil cellar.',
    },
    {
      id: 'pf_wklmabyn', name: 'Mabyn Tollan', title: 'the keeper\'s granddaughter', kind: 'npc', art: 'child', shared: true,
      wants: 'Her grandmother back. Food. Not to be found by the dogs.',
      knows: 'The wreckers came in two black boats to the cove four nights ago. Grandmother told her to hide and ran into the lighthouse with "the crown". Since then, at night, she has seen wet grey people walking on the heath.',
      voice: 'Whispers. Very fast once she starts. Counts things when she is scared.',
      appearance: 'A skinny eleven-year-old in a big knitted jumper, smudged with soot, holding a toy boat.',
      gmNotes: 'Hiding in the cottage loft. She knows where Grandmother hid her savings (in the chimney: 25 gp and a potion of healing). She can be sent to hide in the goat shed or brought along; she is brave but not useful in a fight.',
    },
    {
      id: 'pf_wklgrisel', name: 'Grisel Corvey', title: 'captain of the wreckers', kind: 'npc', art: 'bandit-captain', monsterId: 'banditCaptain', shared: true,
      wants: 'To get off this island alive, with the loot, and paid. In that order now, though she would never say it.',
      knows: 'The false light, the stair key on her belt, that two of her crew were dragged down into the oil cellar last night, and that her buyer in Scaldby is paying double for the Wendeline\'s cargo.',
      voice: 'Slow and pleasant, like a landlady, with a habit of counting coins while she talks. Never raises her voice. Calls everyone "my love".',
      appearance: 'A big, handsome woman of forty-five in a sea-captain\'s coat several sizes too fine for her, with a cutlass, rings on every finger and a key on a chain.',
      backstory: 'Once a ship\'s purser who was cheated by her owners. She decided the sea owed her.',
      gmNotes: 'Bandit captain stat block. She bargains: clear the dead out of the oil cellar (or the caves) and she leaves at the tide with her loot and hands over the key. A DC 13 Insight shows she means to stall until after midnight. Showing her that her boats are stove in, or the Gannet\'s strongbox in the heroes\' hands, or a hard DC 15 Intimidation, gets the key now. She yields at half her hit points if she has been offered any way out.',
    },
    {
      id: 'pf_wklruddock', name: 'Ruddock Vosper', title: 'Grisel\'s mate, keeper of the false light', kind: 'npc', art: 'thug', monsterId: 'thug',
      wants: 'The Wendeline on the rocks and her strongroom in his hands. Grisel out of his way.',
      knows: 'How to light and shutter the false light. That the Wendeline carries a merchant\'s strongbox. That Grisel has gone soft.',
      voice: 'A big laugh and little words. Says "easy now" right before he hits someone.',
      appearance: 'A huge bald man with a tarred beard, a lantern hook for a left hand and a gutting knife in the other.',
      gmNotes: 'Thug stat block. Starts at the beacon knoll (one of its two thugs). If Grisel makes a deal with the heroes, Ruddock breaks it: he and two bandits slip down to the lighthouse to attack the heroes on the tower stair while they carry the oil.',
    },
    {
      id: 'pf_wklnance', name: 'Nance Kestle', title: 'a wrecker who wants out', kind: 'npc', art: 'scout', monsterId: 'scout', shared: true,
      wants: 'To go home to her mother in Scaldby and pretend none of this happened. To not see another drowned sailor.',
      knows: 'The smugglers\' way from the cove into the chapel crypt. Where Grisel keeps the Gannet\'s strongbox. That Ruddock lights the false light every dusk.',
      voice: 'Quiet, quick, looks at her feet. Starts every sentence with "It weren\'t me who..."',
      appearance: 'A thin girl of nineteen in an oilskin too big for her, with a fisher\'s knife, a crossbow and red, raw hands.',
      backstory: 'Her family owes Grisel money. This was supposed to be one trip to pay it off. She pulled a drowned boy off the Gannet and has not slept since.',
      gmNotes: 'Scout stat block. Counts as the scout in the wreckers\' camp. If a hero talks to her alone (she slips off to the smugglers\' way to cry), a DC 11 Persuasion turns her: she steals the stair key from Grisel within the hour, or leads the heroes through the crypt.',
    },
    {
      id: 'pf_wklsenna', name: 'Senna Wetherell', title: 'mate of the wrecked Gannet', kind: 'npc', art: 'sailor', monsterId: 'scout', shared: true,
      wants: 'To warn the Wendeline (her brother Hosk is its bosun), and to see Grisel Corvey on the end of a rope.',
      knows: 'What was in the Gannet\'s crate: the bodies of Captain Mordaunt Cullis and his crew, sealed in salt and lead by the temple at Scaldby, going to be burned. The captain was told never to open it, never to let it touch the sea.',
      voice: 'Crisp, a ship\'s officer\'s voice, cracking with thirst. Gives orders without thinking.',
      appearance: 'A lean woman with cropped red hair and a split lip, in a torn blue officer\'s jacket, wrists rubbed raw by rope.',
      gmNotes: 'Locked in the store rooms for ransom. Freed and armed, she fights beside the heroes (scout stat block). She knows ships: with her help any check to carry oil, work the clockwork or light the lamp has advantage.',
    },
    {
      id: 'pf_wklcullis', name: 'Captain Mordaunt Cullis', title: 'the drowned captain', kind: 'monster', art: 'wight', monsterId: 'drownedPirateCaptain',
      wants: 'A dark sea, a drowned crew, and a ship under his feet again. The Wendeline will do.',
      knows: 'Every reef and current of this coast as it was forty years ago. Everything his drowned crew saw when they lived. That light is the one thing he fears.',
      voice: 'Courtly and cold, like a gentleman reading out a sentence. Water drips from the end of every word.',
      appearance: 'A tall, thin corpse in the rags of a fine captain\'s coat, skin grey and salt-cracked, a broken iron chain still locked to one wrist. His eyes are two cold blue points.',
      backstory: 'A pirate captain of the Hungry Patience, taken at Scaldby forty years ago. On the morning of the hanging he walked off the harbour wall in his chains, and his whole crew followed him. They came back. The temple sealed them in salt and lead.',
      gmNotes: 'Drowned Captain stat block (original Lair Labs). Bright light (the lit lamp, the burner crown, a raised lantern within 10 feet) gives him disadvantage on attack rolls while he stands in it. He bargains only for time. If destroyed, every drowned thing on Wrackstone falls where it stands. If the lamp is lit while he walks, he comes up the shaft and the stair to put it out.',
    },
  ],
  handouts: [
    {
      id: 'wkl-notice', title: 'Nailed to the Scaldby quay',
      text: 'BY THE HARBOUR BOARD OF SCALDBY\n\nWrackstone Light has shown no lamp these three nights.\nThe Gannet (brig) and the Ottery Belle (whaler) are lost on the Wrack with all hands.\nThe Bright Wendeline, packet, is expected at the point at MIDNIGHT TONIGHT and cannot be reached.\n\nONE HUNDRED GOLD to any person who relights Wrackstone before she comes round.\nThe Board regrets it can provide no boat.',
    },
    {
      id: 'wkl-manifest', title: "From the Gannet's cargo manifest",
      text: 'Hold, aft:\n12 bales wool, Scaldby mark\n4 casks brandy (duty paid)\n1 crate, lead-lined, 7 ft, TEMPLE SEALS x7.\n\n  CONSIGNED TO THE WHITE FLAME FOR BURNING.\n  DO NOT OPEN. DO NOT LET IT TOUCH THE SEA.\n  Contents: the late M. Cullis and crew, of the Hungry Patience.\n  Master to sign on delivery that the seals are whole.\n\n(Signed, shakily, by the master: "God help us, a corpse cargo.")',
    },
    {
      id: 'wkl-log', title: "The keeper's log, Wrackstone Light",
      text: 'Lamp lit at dusk, 6 bells. Wind SW, rising. All well.\nLamp lit at dusk. Two black boats in the cove at sunset. Not fishers.\nThey are in the yard. Mabyn to the loft. I am taking HER heart down the old shaft. They can have the tower but they will not have my light.\n\n(The rest of the page is blank. The pen is still in the ink.)',
    },
    {
      id: 'wkl-slate', title: "Grisel's slate, chalked",
      text: 'GANNET: wool, brandy, strongbox (in crypt). Box ok. CRATE: gone in the sea, good riddance.\nOTTERY BELLE: oil, oil, oil. Can\'t get at her. Dead aboard. NOBODY GOES IN THE CAVES.\nWENDELINE: midnight. Passengers. Strongroom. Buyer pays double.\nLost: Pegg, Doon (cellar). Don\'t go in the cellar.\nR. says light the false one again. Fine. One more ship and we go.',
    },
  ],
  chapters: [
    {
      id: 'night', title: 'Midnight at Wrackstone', level: 2,
      summary: 'The heroes row out to Wrackstone Isle in a storm with four hours until the Bright Wendeline comes round the point. Wreckers hold the lighthouse, the keeper is missing, and a drowned pirate captain has woken in the sea caves below. Fight, bargain and sneak to gather oil, a burner and the stair key, and relight the lamp before midnight.',
      goal: 'Relight Wrackstone Light before midnight, so the Bright Wendeline does not break on the reef.',
      map: wrackstoneIsle,
      npcs: [
        { npc: 'pf_wklmabyn', x: 25, y: 35, hidden: true },
        { npc: 'pf_wklruddock', x: 12, y: 29 },
        { npc: 'pf_wklnance', x: 38, y: 21 },
        { npc: 'pf_wklgrisel', x: 52, y: 31 },
        { npc: 'pf_wklsenna', x: 60, y: 34, hidden: true },
        { npc: 'pf_wklebba', x: 40, y: 53, hidden: true },
        { npc: 'pf_wklcullis', x: 65, y: 64, hidden: true },
      ],
      scenes: [
        {
          room: 'Wrack landing', title: 'Ashore in the storm', handout: 'wkl-notice',
          read: 'The oars bend, the sea lifts you and drops you, and then the jetty is there, slick and black. Above you the lighthouse is a dead finger against the clouds. Out on the reef, lightning shows the broken ribs of a ship.',
          gm: 'Start the clock at eight bells. Give the notice if the hook used it. From the landing the heroes can see: a light burning on the knoll to the north (the false light), a glow behind the chapel ruins (the camp), and the dark cottage to the east. Let them pick a direction.',
        },
        {
          room: "Keeper's cottage", title: 'Dogs in the beans', encounter: 'Diggers in the garden',
          read: 'The cottage door hangs off one hinge. Out in the garden, two big dogs are digging up the beans while three men with lanterns curse the rain and the keeper.',
          gm: 'The diggers fight if surprised; if the heroes talk, the wreckers try to bluff ("we\'re salvagers, my lads"). If they flee they run to the chapel and warn the camp. Inside, Mabyn hides in the loft. She tells the heroes about the black boats and that Grandmother "took the crown and went into the lighthouse". The spare keeper\'s log and her grandmother\'s chimney stash are here.',
          treasure: 'In the chimney: 25 gp and a potion of healing (Mabyn knows). Under the beans: a pot of 30 sp the dogs dig up.',
        },
        {
          room: 'Beacon knoll', title: 'The false light', encounter: 'Keepers of the false light', optional: true,
          read: 'The old iron fire-basket on the knoll has a ship\'s lantern burning in it, shuttered so that only the sea can see. A huge man with a hook for a hand is wiping the glass clean, humming.',
          gm: 'Ruddock Vosper and four wreckers. Put out the false light and, if the main lamp is also dark at midnight, the Wendeline heaves to and arrives half an hour late (12:30). The ship\'s lantern can be carried to the lamp room as a weak burner. Ruddock fights; the bandits run if he falls.',
          treasure: 'The big ship\'s lantern; Ruddock\'s purse (18 gp); a spyglass (25 gp) that shows the Wendeline\'s light far out to sea.',
        },
        {
          room: "Wreckers' camp", title: 'Wreckers in the ruins', encounter: "The wreckers' camp",
          read: 'Firelight jumps on broken chapel walls. A dozen wreckers sit with their backs to the stones and their weapons in their laps, and every one of them is looking south, at the dark lighthouse, not at you.',
          gm: 'A parley, if the heroes allow it. The wreckers want off the island alive; the dead took two of them last night. A DC 13 Persuasion or Intimidation, or proof of the dead, splits them: half pack up to row away at the turn of the tide. The six oil casks are in the chapel. Nance slips off to the smugglers\' way; a hero who follows her can turn her (see her profile). The crypt holds the Gannet\'s strongbox.',
          treasure: 'In the crypt: the Gannet\'s strongbox (150 gp, a silver ship\'s compass worth 25 gp, letters of credit for the Gannet\'s owners who will pay 50 gp to get them back). In the chapel: lamp oil, bolts of cloth, a gilt mirror (50 gp, very heavy).',
        },
        {
          room: 'Tower foot', title: "Grisel's price", encounter: "Grisel's hold", handout: 'wkl-slate',
          read: '"Come in out of the wet, my loves," says the big woman at the sea-chest, not looking up from her coins. "Mind the thug. He bites." She lays a key on the desk and puts her hand flat on top of it.',
          gm: 'Grisel bargains (see her profile). Her price: clear the dead out of the oil cellar and she leaves at the tide, key on the table. She would like to stall until after midnight. Her slate is on the desk. If the heroes fight, the two thugs go first and Grisel yields at half hit points if she has been offered any way out. Ruddock, if alive and the deal is made, comes for the heroes on the stair later.',
          treasure: 'The stair key and the store-room keys; Grisel\'s purse (40 gp and three gold rings worth 20 gp each); her +1 scimitar, a fine cutlass with a mermaid on the guard.',
        },
        {
          room: 'Store rooms', title: 'The mate of the Gannet',
          read: 'In the dark behind the shelves, a woman with her wrists tied raises her head. "If you\'re with Corvey," she croaks, "you can tell her the answer\'s still no."',
          gm: 'Senna Wetherell. Freed, she tells the heroes about the crate (the manifest is out on the wreck) and that her brother is aboard the Wendeline. She knows lamps: with the store-room spares she can make a crude burner (DC 12 check, or automatic with her help and ten minutes). The back door goes down the keeper\'s sea stair to the tide pools.',
          treasure: 'Spare wicks, mantles and a flint lighter; three dry signal flares (each burns as a torch in any weather for 10 minutes and counts as bright light against Cullis).',
        },
        {
          room: 'Wreck of the Gannet', title: 'Low tide on the reef', encounter: 'Drowned of the Gannet', handout: 'wkl-manifest', optional: true,
          read: 'The sea has drawn back like a held breath. You wade out over weed and black rock to the Gannet, lying on her side with her back broken. In the flooded hold, sailors stand in the water, facing the island, swaying with the swell.',
          gm: 'Only between nine and eleven bells. Six drowned sailors wake when anyone climbs aboard. In the captain\'s cabin: the manifest, which tells the heroes exactly what woke. A hero who speaks a drowned sailor\'s name from the crew list (DC 12 Investigation in the cabin) makes that one stop and stand still. From the reef, the Gut leads into the sea caves.',
          treasure: 'A medicine chest with 2 potions of healing; the captain\'s brass bosun\'s whistle (5 gp); 35 gp in the cabin.',
        },
        {
          room: 'Oil cellar', title: 'Wet footprints', encounter: 'The dead in the oil cellar',
          read: 'The cellar stinks of oil and seaweed. Wide, bare, wet footprints come out of the south wall, cross the floor, and go back in. As your light touches the wall, the stones there swing slowly open, and something grey comes through.',
          gm: 'Four drowned and a ghoul come up the shaft. Fire is deadly here: spilled oil lit by a torch or spell does 2d6 fire to everyone in the room. One cask can be filled from the good tank in two minutes. Clearing the cellar meets Grisel\'s price. The open secret door leads down the shaft to the sea caves.',
          treasure: 'On the ghoul: a wrecker\'s silver earring and a whale-ivory pipe (10 gp together).',
        },
        {
          room: "Keeper's refuge", title: 'The keeper on the ledge',
          read: 'High on the cave wall a tiny lantern burns, and a woman with a boathook leans out over the drop. "If you\'re dead, you can bugger off," she shouts. "If you\'re not, you\'re late."',
          gm: 'Ebba Tollan, three days on this ledge. Water or food wins her. She hands the burner crown only to a hero who promises to light the lamp, and she insists on coming. She knows Cullis hates light, and that he waits in the grotto by the broken crate. She can lead the way back up the shaft to the oil cellar.',
          treasure: 'The burner crown (the brass heart of the lamp). Ebba\'s lantern: in her hands it is just a good lantern; afterwards she gives it to the heroes (a lantern of revealing, the keepers\' heirloom).',
        },
        {
          room: 'Sea-mouth', title: 'The Ottery Belle', encounter: "The Ottery Belle's drowned", optional: true,
          read: 'The whaler fills the cave mouth, jammed in by her bow, her masts broken against the roof. Barrels of oil knock together in the water like slow drums. On her deck, figures with harpoons turn to look at you.',
          gm: 'Two ghouls (the mates, who were hungry before they were dead) and three drowned whalers. The whale oil works in the lamp. Rolling a barrel through the caves and up the shaft is hard work: ten minutes and a DC 12 Athletics check.',
          treasure: 'A scrimshaw whale tooth carved with the Belle\'s name (15 gp); the ship\'s cashbox (28 gp).',
        },
        {
          room: "Captain's grotto", title: 'The drowned captain', encounter: 'Captain Cullis',
          read: 'The crate lies split open on the rock like a gutted fish. Salt and bones spill from it into the black pool. A tall figure in a rotted captain\'s coat bows to you, and the chain on his wrist clinks. "Strangers. You are welcome aboard. Everyone is, in the end."',
          gm: 'Cullis and two of his old crew. He talks only to stall: he wants the heroes here past midnight. Bright light gives him disadvantage. He can be destroyed here, or lured: if the lamp is lit first, run this fight in the lamp room instead. If he falls, every drowned thing on the island collapses.',
          treasure: 'In the broken crate: 90 gp in old coin, Cullis\'s gold captain\'s ring (50 gp), and a potion of water breathing in a corked green bottle.',
        },
        {
          room: 'Lamp room', title: 'Light the lamp', encounter: 'Drowned on the gallery', handout: 'wkl-log',
          read: 'The burner seats with a click. Oil runs. You strike the flint, and light blooms out through the great lens, so bright it hurts, and swings away over the sea in one long white arm. Far out in the dark, a small yellow light turns toward it.',
          gm: 'Oil in, burner in, clockwork wound (DC 10 Strength), one action to light. The keeper\'s log is in the watch room below. If Cullis still walks, the drowned climb the outside of the tower to the gallery (two ghouls and two drowned) and then Cullis himself comes up the stair: hold the light until midnight. At midnight, the GM checks: full beam, the Wendeline sees it and turns; a weak light, DC 13 Wisdom check (advantage if the false light is out). Make it close.',
          treasure: 'The harbour board\'s reward (100 gp), paid in Scaldby; Ebba\'s lantern; the undying thanks of forty passengers, one of whom is a very grateful wine merchant.',
        },
      ],
      wrapUp: 'At midnight the light swings out over the storm, and the Bright Wendeline comes round the point, sees the reef in time, and turns for Scaldby harbour. If Cullis fell, the drowned lie down on the rocks, and in the morning the heroes and Ebba can give them a proper burial at sea. The wreckers who lived are caught on the mainland or vanish. Ebba keeps the light, Mabyn sleeps for a day, and Scaldby pays up.',
    },
  ],
  ending:
    'Good ending: the lamp is lit before midnight and the Wendeline is saved. With Cullis destroyed, the island is quiet; Ebba gives the heroes her lantern and they have a free bed in the lighthouse for life. Grisel, if she bargained and kept her word, sends an anonymous purse of 50 gp in a month. Bad ending: if the light is dark at midnight, the Wendeline breaks on the Wrack. The heroes can still save some passengers in the surf (a desperate scene in the shallows), but Cullis gains forty drowned, takes the wreck off the reef on the next spring tide, and sails. Next: wherever he ends up, the Hungry Patience is back on the sea, and the temple at Scaldby wants its prisoner returned. Or: Grisel\'s buyer in Scaldby, who pays double for wrecked cargo, is still out there.',
};

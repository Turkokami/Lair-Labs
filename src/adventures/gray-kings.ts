// The Moot of the Gray Kings: giant-scale intrigue for four heroes of level 14.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function mootShelf() {
  const b = new MapBuilder('adv-gray-kings', 'The Moot Shelf', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone', theme: 'stone' });
  const r = rng(1414);
  const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const dSeg = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
    const vx = bx - ax, vy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
    return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
  };

  // ---------- cliffs all round the high plateau ----------
  const top: number[] = [], bot: number[] = [], lef: number[] = [], rig: number[] = [];
  let t = 2, bo = 76, l = 2, ri = 77;
  for (let i = 0; i < 80; i++) {
    t = cl(t + Math.round((r() - 0.5) * 1.6), 1, 3);
    bo = cl(bo + Math.round((r() - 0.5) * 1.6), 75, 77);
    l = cl(l + Math.round((r() - 0.5) * 1.6), 1, 3);
    ri = cl(ri + Math.round((r() - 0.5) * 1.6), 76, 78);
    top.push(t); bot.push(bo); lef.push(l); rig.push(ri);
  }
  for (let y = 0; y < 80; y++)
    for (let x = 0; x < 80; x++) if (y < top[x] || y >= bot[x] || x < lef[y] || x >= rig[y]) b.rock(x, y, 1, 1);

  // the Knuckles: a hump of bare rock south of the ring, with the dwarf tunnels inside it
  b.rock(24, 50, 28, 20).rock(30, 49, 4, 1).rock(45, 49, 4, 1).rock(28, 70, 3, 1).rock(43, 70, 4, 1).rock(51, 58, 2, 6);
  // the west cliff where the quarry bit too deep, and the ice cliffs over the glacier
  b.rock(0, 38, 8, 18).rock(64, 0, 16, 12).rock(62, 0, 2, 6);
  // tors and outcrops
  b.rock(20, 25, 2, 3).rock(47, 22, 2, 2).rock(70, 52, 3, 2).rock(27, 40, 1, 2);

  // ---------- the Envoys' Stair and the small folks' ground ----------
  b.floor(9, 72, 5, 8, 'stone-cobble');
  b.props_('stairs-up', [[11, 78], [11, 75]]).prop('crumbling-ledge', 9, 77).prop('chasm-edge', 13, 76).prop('milestone', 13, 73);
  b.start(10, 76, 3, 3);
  b.area("Envoys' Stair", [[9, 72, 5, 7]], {
    read: 'The stair up the cliff was cut for giants: every step is as high as your chest. Someone has chipped little half-steps into the side of each one, a long time ago, for visitors your size.',
    gm: 'The only way up from the lowlands. The half-steps were cut by the dwarf masons who built the ring. It is a two-hour climb; at the top the wind never stops. Marta Quarrow, the heroes\' guide, waits at the top with the mules.',
    label: [11, 74],
  });

  b.paint(3, 58, 21, 15, 'dirt');
  b.props_('tent', [[7, 61], [11, 60]]).prop('tent-round', 16, 62).prop('campfire', 11, 65).prop('banner-pole', 14, 60).prop('wagon', 19, 68, 0, { v: 1 }).prop('hitching-post', 21, 65).prop('standing-stone', 5, 68).props_('bedroll', [[8, 64], [14, 65]]).prop('supplies', 9, 63).prop('water-barrel', 17, 66).prop('rope-coil', 20, 70);
  b.light(11, 65, 10, 20);
  b.area("Envoys' ground", [[3, 58, 21, 15]], {
    read: 'A patch of trampled turf by a lone grey stone, the only place on the plateau where nothing is giant-sized. Your tents look like toys. A boot print the size of a rowing boat is pressed into the mud beside them.',
    gm: 'By moot law, small folk who come as witnesses camp at the Wardstone and may not be harmed while they stand within its shadow. That law is old and the hotheads may ignore it. Three ways out: north into the quarry, east along the cliff path, or (later) through the tunnels.',
    label: [12, 66],
  });

  // ---------- the cliff path along the south rim ----------
  b.paint(24, 70, 32, 5, 'dirt');
  b.props_('crumbling-ledge', [[33, 73], [46, 73]]).prop('chasm-edge', 38, 74).prop('cairn', 52, 71).prop('boulder', 25, 71).prop('boulder-large', 41, 71).prop('skull-bleached', 30, 72).prop('signpost', 23, 71);
  b.area('Cliff path', [[24, 70, 32, 5]], {
    read: 'A ledge between the bare rock of the Knuckles and a drop of a thousand feet. Far below, clouds drift over the valleys of home. The wind wants you to step off.',
    gm: 'The quiet way from the Envoys\' ground to the fire clan\'s camp. Twice the ledge crumbles: DC 15 Acrobatics or slide toward the edge (a second DC 15 Athletics to catch on; a fall is fatal without magic). Giants never use it; anything said here is not overheard.',
    label: [38, 72],
  });

  // ---------- the old dwarf quarry ----------
  b.paint(8, 34, 16, 24, 'stone-cobble');
  b.paint(10, 41, 12, 5, 'dungeon-slab').paint(10, 47, 12, 5, 'dungeon-slab');
  b.rubble(8, 40, 9, 1).rubble(19, 40, 5, 1).rubble(12, 46, 12, 1).rubble(8, 52, 10, 1).rubble(20, 52, 4, 1);
  b.pit(15, 48, 3, 2);
  b.props_('stairs-down', [[18, 40], [10, 46], [19, 52]]).prop('winch', 16, 36).prop('rope-coil', 17, 37).props_('mine-rails', [[21, 42], [21, 43], [21, 44]]).prop('mine-cart', 21, 45).props_('boulder-large', [[11, 36], [22, 38], [12, 55]]).prop('statue-tall-robed', 13, 43).props_('ore-pile', [[20, 48], [10, 50]]).prop('pickaxes', 18, 55).prop('tool-crate', 22, 56).prop('mine-support', 23, 51).prop('pit-deep', 16, 48).prop('skeleton-lying', 14, 50).prop('crate-pile', 9, 35);
  b.area('Old dwarf quarry', [[8, 34, 16, 24]], {
    read: 'A square bite out of the plateau, cut in giant steps. Blocks of grey stone the size of cottages lie where the masons left them. Half out of the rock wall, a carved king with no face stares at the sky.',
    gm: 'Where the dwarves cut the Gray Kings three thousand years ago, for the giants who paid them in gold and peace. Three terraces joined by stairs; the drop-shaft in the middle falls 60 ft into dark water (6d6 on landing wrong). The faceless king is the thirteenth stone, never finished. Fresh scrapes on the east wall lead to the gallery (DC 14 Survival: something Large walked here last night, and its prints get smaller as it goes).',
    label: [16, 44],
  });

  b.cave('The Deep Cut', 6, 47, 5, 5, { seed: 31, mat: 'cave-floor', read: 'The quarry\'s west wall opens into a round, glassy tunnel far too smooth for a pick. The air smells of wet stone and something sour, like a stomach.', gm: 'A purple worm found the quarry\'s old water seams and stayed. It feels footsteps: any group that crosses the lowest terrace makes a DC 15 Dexterity (Stealth) group check or it rises. It eats and goes back down; it does not chase into the tunnels to the east.' });
  b.props_('bones', [[4, 45], [7, 50]]).prop('gear-pile', 3, 48).prop('skeleton-lying', 9, 44).prop('puddle', 6, 47).prop('stalagmites', 5, 49);
  b.encounter('The Deep Feeder', [1, 42, 11, 11], [['purpleWorm', 1]], 'low');

  // ---------- the Underways: dwarf tunnels inside the Knuckles ----------
  b.tunnel([[22, 54], [27, 55], [31, 57], [34, 58]], 2, { seed: 33, mat: 'cave-floor' });
  b.door(23, 54, 'e', 'secret').door(23, 55, 'e', 'secret');
  b.props_('mine-rails', [[26, 55], [27, 55]]).prop('mine-support', 29, 56).prop('cobweb-corner', 25, 54).prop('lantern-hook', 32, 58, 0, { off: true });
  b.area('Quarry gallery', [[24, 53, 10, 6]], {
    read: 'Behind a slab that turns on a pin, a low gallery runs east into the rock. Old rails, old soot, and new footprints: big bare ones, and small booted ones walking beside them.',
    gm: 'The secret slab in the quarry\'s east wall needs DC 18 Perception to find (DC 12 for anyone who followed the shrinking prints). Marta knows it is somewhere here. The footprints are the oni (in giant shape and in human shape) and the Keeper. Giants cannot fit: everything below is small-folk scale, 8 ft ceilings.',
    label: [28, 55],
  });

  b.tunnel([[31, 57], [30, 61]], 1, { seed: 34, mat: 'cave-floor' });
  b.room("Masons' tomb", 26, 62, 8, 5, { mat: 'dungeon-slab', read: 'A small, neat room with eight stone beds. On each lies a dwarf carved in stone, a chisel on its chest. One carved hand holds a disc of clear crystal up to its eye.', gm: 'The masons who built the ring chose to be buried under it. The crystal comes free with a DC 15 Sleight of Hand (or breaks the hand off, which wakes nothing but feels wrong): it is a gem of seeing, the masons\' "seeing-glass" for checking the stones were true. It will show the Keeper\'s real face.' });
  b.prop('sarcophagus-row', 28, 64).prop('sarcophagus-effigy', 31, 64).prop('tomb-niche', 33, 63).prop('candle-stand-tall', 27, 62).prop('reliquary', 32, 66).prop('urn', 26, 66);

  b.room('Root Vault', 34, 54, 13, 9, { mat: 'dungeon-slab', read: 'A hall of pale stone directly beneath the ring. Thirteen roots of grey rock come down through the ceiling and into the floor, each as thick as a tower. Between them, on a plinth, lies a circlet of plain iron on a cushion of dust.', gm: 'The Gray Kings\' stones go down through the rock and meet here. The circlet is the Kingsband (see the First Oath handout). Two stone golems, the masons\' wardens, stand by the plinth; they ignore anyone who carries the seeing-glass or speaks the masons\' word ("True"). Two oni guard the Keeper\'s cache: the cloud clan\'s stolen speaking-stone, in a chest by the west wall, and the chisel used to cut the forged insult.' });
  b.props_('pillar-round', [[36, 56], [44, 56], [36, 60], [44, 60]]).props_('statue-tall-knight', [[38, 55], [42, 55]]).prop('plinth-display', 40, 57).prop('crown-cushion', 40, 58).prop('chest', 35, 61).prop('tool-crate', 45, 61).prop('rune-tiles', 40, 60).prop('stairs-up', 39, 52).prop('magic-circle', 42, 59, 0, { gm: true });
  b.light(40, 58, 10, 15, '#b8c8ff');
  b.hall(39, 50, 39, 53, 2, { mat: 'dungeon-slab' });
  b.door(39, 50, 'n', 'secret').door(40, 50, 'n', 'secret');
  b.encounter('Wardens of the Root', [34, 54, 13, 9], [['stoneGolem', 2], ['oni', 2]], 'moderate');

  b.tunnel([[46, 58], [49, 56], [51, 53]], 1, { seed: 35, mat: 'cave-floor' });
  b.door(51, 53, 'e', 'secret');
  b.props_('steam-vent', [[48, 57]]).prop('bones', 50, 55);
  b.area('Steam crawl', [[46, 52, 6, 6]], {
    read: 'A crawlway so hot the walls sweat. It ends at a slab that hisses when you touch it: on the other side, you can hear water boiling.',
    gm: 'Comes out behind a steam vent at the boiling spring (the slab is hidden by steam from outside: DC 20 Perception). This is how Druvan\'s body got to the spring unseen.',
    label: [48, 55],
  });

  // ---------- the Ring of the Gray Kings ----------
  const cx = 39.5, cy = 36.5;
  for (let y = 24; y <= 49; y++)
    for (let x = 27; x <= 52; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (!b.isFloor(x, y)) continue;
      if (d <= 9.5) b.paint(x, y, 1, 1, 'stone-flagstone');
      else if (d <= 11.5) b.paint(x, y, 1, 1, 'stone-cobble');
    }
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6;
    const x = Math.round(cx - 0.5 + 10 * Math.cos(a)), y = Math.round(cy - 0.5 + 10 * Math.sin(a));
    b.prop(k === 3 ? 'idol-colossal' : k % 2 ? 'statue-tall-robed' : 'standing-stone', x, y);
  }
  b.prop('altar', 39, 36).prop('magic-circle', 39, 37).props_('throne', [[34, 32], [44, 32], [44, 41]]).prop('writing-desk', 35, 42).prop('scroll-pile', 34, 42).prop('stool', 35, 43).props_('brazier-pedestal', [[36, 34], [42, 34], [39, 40]]).prop('temple-bell', 39, 29).prop('trap-rune-threshold', 39, 45, 0, { gm: true });
  b.light(36, 34, 10, 20).light(42, 34, 10, 20).light(39, 40, 10, 20);
  b.area('Ring of the Gray Kings', [[29, 26, 21, 21]], {
    read: 'Twelve grey stones stand in a ring as wide as a village green, each three times the height of a house. Up close you see they are carved: kings and queens with crowns of rough rock, eyes shut, hands on sword hilts. In the middle stands a plain altar where three peoples who could crush a town in an afternoon have agreed, for a thousand years, not to.',
    gm: 'Moot law (handout): no blood inside the ring; each clan speaks in turn; small-folk witnesses may speak once each day. The three thrones face the altar: stone (NW), cloud (NE), fire (SE). The Keeper of Tallies sits at a little desk by the south stone. THE DAWN SHADOWS: at sunrise every stone throws a long shadow across the ring, and anything standing in a shadow shows its true shape in it. Giants know this as an old story; nobody has tested it in years. The Keeper always arrives after sunrise (DC 16 Insight on the giants\' grumbling, or simply watch). The south stone, the Speaker\'s Stone, hides the secret stair to the Root Vault (DC 20 Perception, or DC 15 with the masons\' word).',
    label: [39, 36],
  });
  b.encounter('The Breaking of the Moot', [29, 26, 21, 21], [['adultWhiteDragon', 1], ['rakshasa', 1], ['oni', 1]], 'high');

  // ---------- the moot feast ground and the herald's cairn ----------
  b.paint(28, 5, 19, 16, 'dirt');
  b.props_('feast-hall-table', [[32, 9], [32, 14]]).props_('bench-long', [[30, 9], [34, 11]]).prop('table-feast', 39, 10).prop('cauldron', 43, 8).prop('campfire-spit', 42, 15).prop('keg-rack', 29, 6).prop('barrel-group', 29, 18).prop('firewood', 45, 18).prop('log-pile', 45, 6).props_('banner-pole', [[36, 6], [38, 6], [40, 6]]).prop('bone-heap', 44, 12).prop('giant-ribcage', 37, 17).prop('pot-rack', 41, 7);
  b.light(42, 15, 15, 25).light(43, 8, 8, 15);
  b.area('Moot feast ground', [[28, 5, 19, 16]], {
    read: 'Tables as long as a street, benches you would need a ladder to sit on, and a cooking fire with a whole mammoth turning over it. Giants of three colours eat here side by side, very carefully, the way people walk on thin ice.',
    gm: 'Neutral ground: all three clans eat here at noon and dusk. Under the tables is the best hiding place on the plateau for small folk: giants never look down while they eat (advantage on Stealth, and you hear everything). Rumours here: see the scene "The opening of the Moot". Pebble, a quiet stone-clan youngster, carries water here all day; it is the oni Yorrel in disguise.',
    label: [37, 12],
  });

  b.paint(47, 5, 9, 12, 'dirt');
  b.prop('cairn', 51, 10).prop('temple-bell', 49, 7).prop('blood-pool', 52, 12).props_('ice-block', [[53, 11], [50, 13]]).prop('snowdrift', 48, 14).prop('banner-pole', 48, 9).prop('obelisk', 54, 8);
  b.area("Herald's cairn", [[47, 5, 9, 12]], {
    read: 'A cairn of white stones on the windy shoulder between the feast ground and the glacier, with a great bronze horn hung on a frame beside it. The ground around it is frozen hard, though the sun is out. Frost feathers the stones in a fan shape.',
    gm: 'Where Druvan the herald blew the dawn horn, and where he really died. Clues (each DC 14 unless noted): frozen blood under fresh gravel; the fan of frost points from the glacier (Nature DC 16: a dragon\'s breath, white); a shed white scale wedged in the horn frame (Nature DC 15: adult white dragon); drag marks heading south-west toward the quarry, made by something Large whose feet change size halfway (Survival DC 16). The horn itself still calls the moot to order: whoever blows it is heard by every giant on the shelf.',
    label: [51, 10],
  });

  // ---------- Hollowmere Hall: the stone clan ----------
  b.building('Hollowmere Hall', 5, 4, 18, 13, {
    mat: 'stone-flagstone',
    read: 'The stone giants have raised a hall in three days out of quarry blocks, without mortar, and it will stand for a thousand years. Inside it is cool and quiet. A long body lies on a bier of slate, covered with a grey cloak, and twenty giants sit around it saying nothing at all.',
    gm: 'The Hollowmere sit with their dead herald for a full day and night: interrupting the silence before dusk is an insult (DC 14 Insight to read the room). King Ossrek speaks only after dusk, slowly. He believes the fire clan boiled his herald and wants Queen Hessa\'s blood-price or war. He can be moved by proof, not by speeches.',
    doors: [[13, 16, 's', 'open', 'door-double'], [14, 16, 's', 'open', 'door-double'], [22, 9, 'e', 'closed', 'door-iron']],
    windows: [[22, 6, 'e'], [22, 13, 'e']],
  });
  b.prop('hearth-grand', 13, 5).prop('throne', 13, 7).prop('burial-slab', 13, 11).props_('pillar-square', [[8, 7], [18, 7], [8, 13], [18, 13]]).props_('statue-tall-knight', [[6, 5], [21, 5]]).props_('table-long', [[10, 10], [16, 10]]).prop('weapon-rack', 21, 15).prop('rug-pelt', 13, 13).prop('chest', 6, 15).prop('boulder', 20, 11).props_('candle-stand-tall', [[11, 11], [15, 11]]);
  b.light(13, 6, 15, 25).light(13, 11, 6, 12, '#cfd8ff');

  b.paint(4, 18, 24, 15, 'stone-cobble');
  b.props_('standing-stone', [[7, 20], [12, 22], [17, 19], [24, 21], [9, 28], [15, 30]]).props_('boulder-large', [[6, 25], [25, 28], [18, 27]]).props_('cairn', [[11, 25], [23, 31]]).prop('statue-tall-robed', 26, 24).prop('rubble-pile', 14, 26).prop('wall-stone-low', 5, 31).prop('obelisk', 21, 20).prop('workbench', 16, 23).prop('pickaxes', 17, 24);
  b.area('Oath-pillar field', [[4, 18, 24, 15]], {
    read: 'A field of standing stones in front of the hall, each carved with deep straight lines like tally marks. Three stone giants stand among them so still that you take them for pillars too, until one of them turns its head.',
    gm: 'Each pillar records a moot the Hollowmere attended; the lines are the oaths sworn. Three sentries guard the hall while the clan mourns. Small folk who walk in uninvited are "pebbles in the boot": the sentries pick them up and carry them out. Laying a stone on a cairn and waiting to be noticed is the polite way (DC 12 History, or Marta tells them). Pushing past starts a fight; it can stop at once if someone shouts Druvan\'s name and swears to find his killer.',
    label: [15, 25],
  });
  b.encounter('Stone clan sentries', [6, 18, 20, 14], [['stoneGiant', 3]], 'low');

  // ---------- the glacier edge and the Blue Hollow ----------
  b.ice(54, 2, 26, 21);
  b.pit(58, 15, 6, 1).pit(67, 17, 1, 4).pit(72, 14, 4, 1).pit(57, 6, 1, 4);
  b.props_('ice-block', [[56, 12], [70, 20], [74, 17]]).props_('snowdrift', [[60, 19], [65, 13], [58, 4]]).props_('ice-thin', [[62, 16], [68, 21]]).props_('chasm-edge', [[60, 14], [66, 18]]).prop('frozen-pond', 60, 9).prop('skull-bleached', 73, 20);
  b.area('Glacier edge', [[54, 12, 22, 11]], {
    read: 'The plateau ends in a wall of old blue ice that groans in the afternoon sun. Cracks wide enough to swallow a cart run across it. Meltwater pours out from under the ice and races away south, colder than any river you have touched.',
    gm: 'Crevasses: DC 13 Perception to spot, DC 14 Dexterity save or fall 40 ft (4d6) and be wedged. Giants and the dragon both avoid the glacier: the Highmist say a "pale worm with wings" died here when their grandmothers were young. They are wrong; she only slept. Tracks of something huge and clawed come and go from the ice cliffs to the north-east (DC 15 Survival).',
    label: [64, 17],
  });

  b.cave('Blue Hollow', 72, 6, 5.5, 3.5, { seed: 32, mat: 'ice', read: 'Inside the ice cliff the light turns blue and the cold bites through your boots. Frozen into the walls are shapes: elk, a mammoth, a giant with his mouth open. Three pale young dragons look up from a heap of coins, hissing like kettles.', gm: 'The den of Vaskelune the Pale, an adult white dragon, and her brood of three. She is away at dawn and dusk (hunting) and is here otherwise; if the heroes come while she is home, she does not fight: she flies to the ring to start the war early. The brood fights. Her hoard is here, and so is the Keeper\'s letter to her (handout).' });
  b.tunnel([[70, 9], [68, 12], [66, 14]], 2, { seed: 36, mat: 'ice' });
  b.prop('dragon-hoard', 74, 6).props_('coin-stacks', [[70, 4], [73, 7]]).prop('ice-block', 68, 6).prop('bones', 72, 9).prop('crystal-spire', 75, 4).prop('scroll-pile', 71, 5);
  b.light(72, 6, 10, 20, '#9fd3ff');
  b.encounter('The Pale Brood', [66, 2, 13, 9], [['youngWhiteDragon', 3]], 'low');

  // ---------- the meltwater race, from the glacier to the boiling spring ----------
  const race: [number, number][] = [[61, 16], [57, 21], [53, 26], [52, 32], [54, 38], [58, 44]];
  const raceD = (x: number, y: number) => {
    let d = 99;
    for (let i = 0; i < race.length - 1; i++) d = Math.min(d, dSeg(x + 0.5, y + 0.5, race[i][0] + 0.5, race[i][1] + 0.5, race[i + 1][0] + 0.5, race[i + 1][1] + 0.5));
    return d;
  };
  for (let y = 18; y < 46; y++)
    for (let x = 48; x < 62; x++) {
      if (!b.isFloor(x, y)) continue;
      const d = raceD(x, y);
      if (d <= 0.95) b.water(x, y, 1, 1, true);
      else if (d <= 1.8) b.water(x, y, 1, 1, false);
    }
  // the Giants' Step: a fallen pillar laid across the race
  b.floor(52, 24, 5, 2, 'stone-flagstone');
  b.prop('column-fallen', 54, 24, 45).props_('boulder', [[51, 23], [57, 26]]);
  b.area("Giants' Step", [[51, 23, 7, 4]], {
    read: 'A fallen stone pillar lies across the meltwater, worn smooth by giant feet. The water underneath is loud, white and very fast.',
    gm: 'The dry crossing between the ring and the cloud camp. The race is deep and freezing: falling in means DC 15 Athletics each round or be swept 30 ft downstream and take 7 (2d6) cold. Lower down, by the ring, there is a shallow ford (difficult ground, DC 10 Athletics).',
    label: [54, 25],
  });
  for (let y = 31; y <= 33; y++) for (let x = 49; x <= 56; x++) if (b.isFloor(x, y) && raceD(x, y) <= 1.8) b.water(x, y, 1, 1, false);

  // ---------- the Highmist camp and the Mist Pavilion ----------
  b.building('Mist Pavilion', 56, 25, 13, 10, {
    mat: 'marble',
    read: 'A pavilion of grey silk taller than a temple, pegged down on marble slabs the cloud giants carried up the mountain. Inside, a harp the size of a ship plays itself very softly. On a plinth in the middle there is nothing at all, and every giant in the room is trying not to look at it.',
    gm: 'Sovereign Sefwyn of the Highmist sits on her dais and will not speak aloud: by Highmist custom a sovereign\'s word is only binding through the clan\'s speaking-stone, a grey egg of crystal, and it was stolen two nights ago. Her steward speaks for her. They suspect the stone clan (who "dig and hide things"). Without the stone the Highmist cannot swear the new oath, and the moot fails.',
    doors: [[56, 29, 'w', 'open'], [62, 34, 's', 'open', 'door-double'], [63, 34, 's', 'open', 'door-double']],
  });
  b.prop('throne-dais', 62, 26).prop('plinth-display', 62, 29).prop('chandelier-crystal', 62, 31).prop('harpsichord', 58, 27).prop('orrery', 66, 27).prop('telescope', 66, 32).prop('rug', 60, 31).prop('chaise-longue', 58, 32).prop('wardrobe', 67, 30).prop('crystal-lamp', 59, 26);
  b.light(62, 30, 15, 25, '#e8f0ff');
  b.props_('tent-bell', [[58, 21], [66, 21]]).props_('tent', [[59, 36], [67, 36]]).prop('campfire', 63, 22).prop('crate-stack', 70, 24).prop('banner-pole', 55, 35).prop('hitching-post', 69, 35);
  b.light(63, 22, 10, 20);
  b.area('Highmist camp', [[54, 19, 17, 18]], {
    read: 'Bell-shaped tents of white and silver stand around a great pavilion. The cloud giants move slowly and speak softly, and every one of them wears something blue: a ribbon, a gem, a feather the length of a spear.',
    gm: 'The Highmist are proud, polite and cold. Small folk are "guests of the air": they will be fed honey-cakes the size of cartwheels and watched every second. A steward (cloud giant) asks the heroes, very nicely, to search the stone clan\'s camp for the speaking-stone, "since they cannot fit through small doors".',
    label: [62, 22],
  });

  // the roc eyrie on the eastern spur
  b.paint(71, 22, 6, 16, 'stone-cobble');
  b.props_('straw-bed', [[74, 27], [73, 33]]).prop('bones', 72, 30).prop('giant-ribcage', 75, 35).prop('boulder-large', 72, 24).prop('skull-pile', 75, 24).prop('chasm-edge', 75, 30).prop('chains-hanging', 72, 36);
  b.area('Roc eyrie', [[71, 22, 6, 16]], {
    read: 'Two birds the size of barns sit on the eastern spur with their heads tucked under their wings. Their nests are made of whole pine trees. A cloud giant\'s saddle, as big as a boat, hangs on a chain from an iron post.',
    gm: 'The Highmist\'s two rocs, Cirrus and Skerry. They attack strangers who come within 30 ft without a cloud giant (or a DC 18 Animal Handling with an offering of meat). Calmed, they can be "asked" (Speak with Animals, or a DC 16 Animal Handling to read them): two nights ago they saw a small man in grey rise into the air from the pavilion holding something that shone, and fly west toward the ring.',
    label: [73, 29],
  });
  b.encounter('Wings of the Highmist', [70, 22, 8, 16], [['roc', 2]], 'low');

  // ---------- the boiling spring ----------
  b.paint(54, 39, 16, 15, 'stone-flagstone-warm');
  b.mud(55, 50, 3, 2).mud(67, 41, 2, 2);
  b.pool(62, 46, 5.5, 3.5, true);
  b.props_('steam-vent', [[56, 43], [68, 44], [66, 51], [52, 52]]).prop('puddle', 59, 51).prop('boulder', 57, 46).prop('reeds', 69, 48).prop('washbasin', 64, 52).prop('blood-pool', 55, 48, 0, { gm: true }).prop('stairs-down', 61, 41);
  b.light(62, 46, 10, 25, '#ffd9a0');
  b.area('The boiling spring', [[54, 39, 16, 15]], {
    read: 'A pool of water so hot it rolls and spits, in a basin of yellow stone. Steam hides half of it at any moment. At the edge, two fire giants are hauling something enormous and grey out of the water with hooks, and a stone giant is screaming at them.',
    gm: 'The fire clan bathes here; the spring is on their side of the shelf. Druvan\'s scalded body was found in it at dawn. Fire giants are immune to its heat; anyone else in it takes 10 (3d6) fire each turn. The hidden slab of the Steam crawl is behind the south-west vent (DC 20 Perception).',
    label: [62, 42],
  });
  b.encounter('Bathers in the steam', [54, 40, 16, 14], [['oni', 3]], 'low');

  // ---------- the Ashfast forge and ember yard ----------
  b.paint(52, 54, 25, 21, 'dirt');
  b.building('Ashfast forge', 60, 59, 15, 12, {
    mat: 'stone-flagstone-warm',
    read: 'The fire giants have built a forge on the mountain top out of black stone, because they cannot sleep without the sound of hammers. In the middle stands an anvil older than your kingdom, and someone has carved words into its face.',
    gm: 'The Anvil of Mothers: every Ashfast queen has struck her first blade on it. Last night someone carved an insult into it in Highmist script (handout). Queen Hessa has sworn to answer it at the next moot session "in fire". Close study shows the cuts were made by a chisel no wider than a finger, held at the height of a human\'s shoulder (DC 15 Investigation): no cloud giant made this.',
    doors: [[66, 59, 'n', 'open', 'door-double'], [67, 59, 'n', 'open', 'door-double'], [60, 65, 'w', 'closed', 'door-iron']],
  });
  b.lava(70, 66, 2, 2);
  b.props_('forge', [[63, 61], [71, 61]]).prop('anvil', 67, 64).prop('weapon-rack', 61, 68).prop('rune-weapon-rack', 73, 68).prop('armor-stand', 62, 61).prop('chest', 73, 63).prop('banner-hanging-tall', 67, 60).prop('throne', 67, 68).prop('lava-pool', 70, 66).prop('grindstone', 65, 67);
  b.light(63, 61, 10, 20, '#ff9a3c').light(71, 61, 10, 20, '#ff9a3c').light(70, 66, 10, 20, '#ff7a2e');
  b.props_('cage', [[55, 72], [57, 72], [59, 72]]).props_('bones', [[56, 70], [60, 73]]).prop('burning-ground', 56, 57).prop('magma-vent', 75, 56).prop('tent-command', 55, 61).prop('campfire', 57, 65).prop('anvil', 54, 67).prop('firewood', 58, 68).prop('weapon-barrel', 75, 72).prop('ore-pile', 73, 73).prop('war-banner', 64, 56);
  b.light(57, 65, 10, 20, '#ff9a3c');
  b.area('Ember yard', [[52, 54, 25, 21]], {
    read: 'Black tents, a ring of hound pens and a fire that never goes out. Young fire giants in iron collars spar with swords as long as a mast, and the sparks they strike fly higher than your head.',
    gm: 'Korrik Ashbrand and his "hotbloods" want war tonight. If the heroes come accusing the fire clan, Korrik picks a fight (and calls it a duel to keep it legal). Beating him in a contest of nerve instead, holding a hand in the fire as long as he does (DC 17 Constitution; fire resistance helps and he will call it cheating), wins him over. Otherwise Queen Hessa stops the fight after 3 rounds, unless the heroes killed one of her people.',
    label: [56, 63],
  });
  b.encounter("Korrik's hotbloods", [52, 54, 12, 20], [['fireGiant', 3], ['hellHound', 2]], 'moderate');

  // paths worn between the camps
  b.paint(24, 31, 6, 2, 'dirt').paint(44, 20, 2, 7, 'dirt').paint(48, 43, 6, 2, 'dirt').paint(50, 47, 5, 6, 'dirt').paint(26, 46, 4, 3, 'dirt');
  b.props_('cairn', [[25, 33], [50, 49]]).prop('milestone', 45, 22).prop('boulder', 27, 36).prop('boulder-large', 50, 18).prop('tree-fir-snow', 26, 44).prop('tree-dead', 49, 46).prop('bush', 24, 47);
  return b.build();
}

export const GRAY_KINGS: Adventure = {
  id: 'gray-kings',
  title: 'The Moot of the Gray Kings',
  tagline: 'Three giant clans, one ancient peace and a saboteur who wants them at war: find the truth before the third dawn.',
  levels: '14',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['intrigue', 'giants', 'high level', 'mystery', 'outdoors'],
  pitch:
    'Once in a lifetime, the giants of the high country climb to the Moot Shelf and meet in the Ring of the Gray Kings to settle their borders. Stone, fire and cloud: three clans who could flatten a city in an afternoon, and who have agreed for a thousand years not to. Your kingdom, Ardmere, lies in the valleys below them. Queen Maudry has sent you up the Envoys\' Stair as her witnesses, with one order: whatever happens, keep the peace. You arrive on the first morning. By noon, the moot\'s herald is dead.',
  secret:
    'The Keeper of Tallies, a soft-spoken small-folk scribe the giants have trusted for three moots, is Vizhar, a rakshasa. Under the ring lies the Root Vault, cut by dwarf masons, and in it the Kingsband: an iron circlet tied to the oath the clans renew at every moot. If a moot ends in blood, the oath breaks, and whoever wears the Kingsband holds every giant\'s oath in the high country. Vizhar wants an army of giants. He has two allies: Yorrel, an oni who shape-shifts into a stone-clan youngster called Pebble, and Vaskelune the Pale, an adult white dragon who sleeps in the glacier and hates giants. The price: the plateau and the glacier, empty of giants, for her. Why now: this is the first moot in thirty years, and the next would be too late; the masons\' wards on the vault are almost worn through. In three nights Vizhar has had the dragon kill the herald (then the oni moved and scalded the body to blame the fire clan), stolen the cloud clan\'s speaking-stone (to blame the stone clan), and carved an insult on the fire clan\'s sacred anvil in cloud-script. On the third dawn, the clans meet to swear or fight.',
  hooks: [
    'Queen Maudry of Ardmere names the heroes her envoys: 10,000 gp from the crown if the moot ends in peace, and lands in the high valleys.',
    'Marta Quarrow, a dwarf whose ancestors cut the Gray Kings, wants to see the ring before she dies and needs bodyguards who can talk to giants. She knows the masons\' secrets.',
    'A heroes\' old friend among the giants (a cloud giant they once helped, or a fire giant smith) sends a roc feather: "Come to the moot. Something is wrong."',
  ],
  tips: [
    'Use a War Drum clock: six marks. Add one each time a clan is insulted, a giant is hurt, the heroes accuse the wrong clan in public, or a night passes. At 6, the clans fight in the ring and the heroes must stop the battle or run.',
    'The moot runs three days. Day 1: the opening and the murder. Day 2: the theft and the insult come out, and the camps. Night 2: the oni try to kill the heroes. Day 3, dawn: the Judgment.',
    'Talking is the main game here. Every clan has a grievance and a wrong suspect: stone blames fire (the herald), cloud blames stone (the stone), fire blames cloud (the insult). Each piece of proof turns one clan.',
    'Every fight with a clan can be stopped, talked down or turned into a contest. Give full XP for a won argument against giants.',
    'Small folk are tiny here. Remind the players: they can hide under tables, crawl into dwarf tunnels giants can\'t follow, and ride on a giant\'s shoulder to be heard. Let them be clever about scale.',
    'The Keeper is helpful, kind and everywhere. Play him as the heroes\' best friend at the moot. He is never in the ring at sunrise.',
  ],
  npcs: [
    {
      id: 'pf_gkgosmund', name: 'Osmund Tallowby', title: 'Keeper of Tallies (Vizhar the rakshasa)', kind: 'monster', art: 'rakshasa', monsterId: 'rakshasa', shared: true,
      wants: 'The moot to end in blood, so the oath breaks and he can take the Kingsband and the giants with it.', knows: 'Everything: every clan\'s grudges, the secret stair under the ring, and the dragon\'s hunting hours.',
      voice: 'Gentle and dry, a little bookish. Calls each giant by full title and every hero "my dear envoy".', appearance: 'A small, stooped man with ink-stained fingers, round spectacles and a grey scholar\'s coat with many pockets. In his true shape, a tiger-headed fiend in silk with backward-turned hands.',
      backstory: 'He took the Keeper\'s place ninety years ago by killing the real one and wearing his face, and has kept the moot\'s records faithfully ever since, waiting for the wards under the ring to weaken.',
      gmNotes: 'Rakshasa stat block. His disguise beats ordinary detection; the dawn shadows of the Gray Kings or the masons\' seeing-glass show his true form. He helps the heroes all along, steering them toward the wrong clan. Unmasked, he calls the dragon and fights in the ring; if losing, he runs for the secret stair and the Kingsband.',
    },
    {
      id: 'pf_gkgossrek', name: 'Ossrek', title: 'King of the Hollowmere (stone giants)', kind: 'monster', art: 'stoneGiant', monsterId: 'stoneGiant', shared: true,
      wants: 'Justice for his herald, and the oath kept, in that order.', knows: 'The ring was cut by dwarves; there are "small-folk holes" under it; Druvan went to the cairn alone before dawn.',
      voice: 'Very slow. Long silences. Never says a thing twice.', appearance: 'Grey-skinned, bald, with a beard of braided slate-coloured hair and a crown that is just a band of quarry stone.',
      gmNotes: 'Stone giant stat block. He accepts proof he can touch: the white scale, the frozen blood, the chisel.',
    },
    {
      id: 'pf_gkghessa', name: 'Queen Hessa', title: 'Queen of the Ashfast (fire giants)', kind: 'monster', art: 'fireGiant', monsterId: 'fireGiant', shared: true,
      wants: 'The insult on the Anvil of Mothers answered, and her people respected.', knows: 'Her giants did not kill Druvan: they found him already in the spring. Pebble was seen at the spring that night.',
      voice: 'Clipped and loud, like a hammer on hot iron. Laughs at danger.', appearance: 'Coal-black skin, hair like a banked fire, a breastplate hammered from a single sheet of red iron.',
      gmNotes: 'Fire giant stat block. She respects courage and plain speaking; flattery makes her angry.',
    },
    {
      id: 'pf_gkgsefwyn', name: 'Sovereign Sefwyn', title: 'Sovereign of the Highmist (cloud giants)', kind: 'monster', art: 'cloudGiant', monsterId: 'cloudGiant', shared: true,
      wants: 'Her speaking-stone back, so her word can bind again.', knows: 'The stone vanished during the second night while she slept; her rocs were restless. She does not trust the Keeper\'s spectacles ("glass hides the eyes").',
      voice: 'Silent, except by gesture and the harp. Once the stone is back: a voice like wind in a high pass.', appearance: 'Tall even for her people, pale-blue skin, white hair to her heels, silver rings on every finger.',
      gmNotes: 'Cloud giant stat block. Returning her speaking-stone is the single biggest swing in the adventure: it turns the Highmist and clears the stone clan.',
    },
    {
      id: 'pf_gkgkorrik', name: 'Korrik Ashbrand', title: 'hotblood of the Ashfast', kind: 'monster', art: 'fireGiant', monsterId: 'fireGiant',
      wants: 'War, glory and a song about him.', knows: 'The Keeper told him (in kindness, of course) that the cloud clan laughed at the Anvil of Mothers.',
      voice: 'Shouts everything. Bangs his sword on things for emphasis.', appearance: 'A young fire giant with a shaved head, a fresh brand on each cheek and a sword with a notch for every duel.',
      gmNotes: 'Fire giant stat block. A red herring and a hothead, not a villain. Turned, he is a loud ally at the Judgment.',
    },
    {
      id: 'pf_gkgyorrel', name: 'Yorrel ("Pebble")', title: 'oni in disguise', kind: 'monster', art: 'oni', monsterId: 'oni',
      wants: 'Its share of the plunder, and to eat an envoy.', knows: 'It moved Druvan\'s body through the Steam crawl and stole the speaking-stone for the Keeper.',
      voice: 'As Pebble: shy, mumbling, "yes, big one". As itself: a wet chuckle.', appearance: 'As Pebble: a big-eyed stone-giant youngster only twice a man\'s height, always carrying water. As itself: a blue-skinned ogre-mage with horns and a glaive.',
      gmNotes: 'Oni stat block. Stone giants do not have a child called Pebble at this moot (DC 15 Insight when asking Ossrek\'s people about him, or just ask). Captured, it bargains: the Steam crawl and the Root Vault for its life.',
    },
    {
      id: 'pf_gkgdruvan', name: 'Druvan', title: 'herald of the moot (dead)', kind: 'npc', art: 'stoneGiant', shared: true,
      wants: 'Dead. In life: a moot that ends in peace.', knows: 'He saw the dragon\'s shadow over the glacier the morning he died. A Speak with Dead spell gets five answers from his corpse: "White wings." "The little scribe was there." "Cold." "Under the Speaker\'s Stone." "Tell my king."',
      voice: 'Was famous for it: a voice that could carry across the whole shelf.', appearance: 'An old stone giant with a herald\'s bronze collar, now scalded red and wrapped in a grey cloak.',
    },
    {
      id: 'pf_gkgmarta', name: 'Marta Quarrow', title: 'dwarf guide, mason\'s heir', kind: 'npc', art: 'hero-dwarf-ranger', shared: true,
      wants: 'To see the Gray Kings and the masons\' tomb before she dies.', knows: 'Family stories: the masons left a word ("True"), a way in from the quarry, and a seeing-glass "to check the stones were straight".',
      voice: 'Dry and blunt, with a stonecutter\'s habit of tapping walls while she talks.', appearance: 'A white-bearded dwarf woman with a mason\'s hammer on her belt and a lowland wool cloak.',
      gmNotes: 'Not a fighter at this level. She can find the quarry slab (advantage) and speaks the masons\' word to the golems.',
    },
    {
      id: 'pf_gkgvaskelune', name: 'Vaskelune the Pale', title: 'adult white dragon', kind: 'monster', art: 'dragon-white-adult', monsterId: 'adultWhiteDragon',
      wants: 'The giants gone from her mountain, and their hoards for her brood.', knows: 'The Keeper is a fiend, and she does not care. Where Druvan died.',
      voice: 'Hissing, flat, as if every word costs her. Counts things.', appearance: 'Ice-white scales with a blue sheen, a frill like icicles, one horn broken off by a giant\'s hammer long ago.',
      gmNotes: 'Adult white dragon stat block. She arrives when the Keeper is unmasked, or when the War Drum clock fills. At half hit points she flies home to her brood.',
    },
  ],
  handouts: [
    { id: 'gkg-credence', title: 'Letter of credence', text: 'From Maudry, Queen of Ardmere, to the Kings and Queens of the high country, greeting. The bearers speak for our valleys as witnesses at your moot. We ask nothing of your borders but that they stay peaceful. Our rivers run from your mountains; our children sleep under them. Sealed with the Ardmere ram.' },
    { id: 'gkg-moot-law', title: 'The laws of the moot (as cut on the Speaker\'s Stone)', text: 'I. No blood in the ring.\nII. Each clan speaks in turn, stone, then cloud, then fire.\nIII. The small may speak once each day, and are not to be stepped on.\nIV. An oath sworn here with the clan\'s voice binds the clan for a generation.\nV. If the moot ends in blood, the oath ends with it.' },
    { id: 'gkg-insult', title: 'Words cut into the Anvil of Mothers', text: '(In Highmist script, very neat.) "The Ashfast strike their iron like their mothers struck their husbands: often, and with no skill. Let the cloud remember who sits above the smoke."' },
    { id: 'gkg-first-oath', title: 'The First Oath (carved in the Root Vault, in Dwarvish)', text: 'We cut thirteen and set twelve. They swear on the stones and the stones remember. Under the stones we put the band that holds the oath. Let no one wear it. If the oath breaks in blood, the band will hold what the oath held, for whoever wears it. So: keep the oath. Signed, the eight of the Quarrow line. The word is TRUE.' },
    { id: 'gkg-letter', title: 'A letter in the dragon\'s hoard', text: 'Pale one: the herald is done; the stone is taken; the anvil is marked. On the third dawn they meet. Come when the drums beat, and not before, and not at sunrise. The shelf is yours after. I want only the iron. Your servant in all things, O. (The handwriting matches the Keeper\'s tally book.)' },
  ],
  chapters: [
    {
      id: 'moot', title: 'Three Days on the Moot Shelf', level: 14,
      summary: 'A giant moot on a windswept plateau: three clan camps, a ring of colossal stones, a glacier, a boiling spring and old dwarf tunnels under it all. A herald is murdered, a sacred stone stolen and an insult forged, all by a fiend in a scribe\'s coat.',
      goal: 'Find out who is sabotaging the moot, prove it to three proud giant clans, and keep the peace through the third dawn.',
      map: mootShelf,
      npcs: [
        { npc: 'pf_gkgmarta', x: 12, y: 66 },
        { npc: 'pf_gkgosmund', x: 36, y: 42 },
        { npc: 'pf_gkgossrek', x: 13, y: 8 },
        { npc: 'pf_gkgdruvan', x: 55, y: 46 },
        { npc: 'pf_gkgsefwyn', x: 62, y: 27 },
        { npc: 'pf_gkghessa', x: 67, y: 67 },
        { npc: 'pf_gkgkorrik', x: 57, y: 63 },
        { npc: 'pf_gkgyorrel', x: 60, y: 52, hidden: true },
        { npc: 'pf_gkgvaskelune', x: 39, y: 27, hidden: true },
      ],
      scenes: [
        {
          room: "Envoys' Stair", title: 'The climb to the Moot',
          read: 'You come over the top of the Envoys\' Stair into a wind that tastes of snow. The Moot Shelf spreads out before you: three smokes from three camps, a glacier glowing blue in the north, and in the middle twelve grey stones like a council of giants frozen mid-argument.',
          gm: 'Marta meets them with the mules and points out the camps. Start the War Drum clock at 1 (the clans are already tense). Give the letter of credence: any clan that sees it treats the heroes as envoys under moot law.',
          handout: 'gkg-credence',
        },
        {
          room: 'Ring of the Gray Kings', title: 'The opening of the Moot',
          read: 'A bronze horn should open the moot. It does not sound. The three monarchs wait on their thrones, the sun climbs, and a small grey man at a small desk keeps dipping his pen and looking at the sky. Then a stone giant runs into the ring shouting that the herald is dead.',
          gm: 'Meet the Keeper here: he is charming and helpful, and offers to "help the envoys be heard". Each monarch speaks once (stone, cloud, fire): Ossrek grieves in silence, Sefwyn cannot speak (her stone is gone, though she hides this), Hessa jokes. The Keeper arrived after sunrise (DC 14 Perception: his desk is cold, the ink pot frozen). Rumours at the feast afterwards: the herald was boiled; the cloud clan is hiding something; Pebble the water-carrier is "always where the trouble is".',
          handout: 'gkg-moot-law',
        },
        {
          room: 'The boiling spring', title: 'The herald in the spring',
          gm: 'Druvan\'s body is hauled out. Hessa\'s giants found him; Ossrek\'s people blame them (War Drum +1 if nobody intervenes). Clues: the scalds are on top of deep frostbite (DC 15 Medicine), his lungs are full of ice (any healer who looks), and there is no struggle at the spring (DC 13 Investigation). Faint drag marks lead to a steam vent and stop (DC 18 Survival: the Steam crawl). Speak with Dead gives Druvan\'s five answers. The Keeper urges caution: "Fire giants do bathe here, my dear envoy."',
        },
        {
          room: 'Hollowmere Hall', title: 'The Stone King\'s grief', encounter: 'Stone clan sentries',
          gm: 'The sentries in the Oath-pillar field must be passed first (politely or not). Ossrek wants blood-price from the fire clan by the third dawn. Proof from the Herald\'s cairn (the white scale, the frozen blood) turns him: he will hold his clan back, but only if the cloud clan stops accusing his people of theft. He mentions the "small-folk holes" under the ring that only small folk could use.',
          treasure: 'If the heroes bring proof, Ossrek gives each a stone from Druvan\'s cairn (a stone of good luck for one of them) and a potion of giant strength (stone giant).',
        },
        {
          room: 'Mist Pavilion', title: 'The silent Sovereign',
          gm: 'The steward explains (once the heroes promise discretion) that the speaking-stone is gone and Sefwyn cannot swear. They blame the stone clan. The plinth shows tiny scratches where small fingers lifted the stone (DC 14 Investigation) and the guard was asleep on his feet (a charm or sleep spell, DC 16 Arcana). Sefwyn, by gesture, makes clear she does not trust "the scribe".',
        },
        {
          room: 'Ashfast forge', title: 'The insult on the anvil', encounter: "Korrik's hotbloods",
          gm: 'Hessa shows the Anvil of Mothers in fury. The cuts were made by a small chisel at human shoulder height (DC 15 Investigation) and the Highmist script has a grammar slip no cloud giant would make (DC 17 History, or ask a Highmist). Korrik and his hotbloods want to march on the cloud camp tonight; stop them with a contest, a duel or proof. War Drum +1 if they march.',
          handout: 'gkg-insult',
          treasure: 'Turned, Hessa gives the heroes a flame tongue blade sized for a human, forged on the Anvil of Mothers to "answer the insult properly".',
        },
        {
          room: 'Roc eyrie', title: 'What the rocs saw', encounter: 'Wings of the Highmist', optional: true,
          gm: 'Go with a Highmist giant and the rocs only watch. Calmed and asked, they "remember" the small grey man flying west from the pavilion with something shining. Go uninvited and they attack; the Highmist will be very cold afterwards (War Drum +1).',
          treasure: 'Caught in a nest: a lost traveller\'s pack with wings of flying folded inside and 300 gp.',
        },
        {
          room: 'The boiling spring', title: 'Bathers in the steam', encounter: 'Bathers in the steam',
          read: 'The second night. Steam drifts across the shelf, and in it, between you and your tents, three tall shapes are walking. One of them is carrying a bucket of water.',
          gm: 'The Keeper has decided the heroes know too much. Yorrel (as Pebble) and two more oni ambush them near the spring, wherever they are; move the fight to the spring if that is where the heroes went. If the oni win, they dump bodies in the spring "like the herald". Captured, Yorrel spills the Steam crawl and the cache in the Root Vault. Fire giants who see the oni change shape turn on the spot: War Drum -1.',
        },
        {
          room: 'Old dwarf quarry', title: 'The dwarf road', encounter: 'The Deep Feeder', optional: true,
          gm: 'Marta leads the way to the quarry and its secret slab into the Quarry gallery. Crossing the lowest terrace risks waking the purple worm in the Deep Cut (DC 15 group Stealth). The gallery leads to the Masons\' tomb (the gem of seeing) and on to the Root Vault.',
          treasure: 'In the worm\'s tunnel: the undigested gear of old prospectors: a ring of evasion, 1,800 gp in raw gems, an adamantine breastplate. In the Masons\' tomb: the seeing-glass (gem of seeing) and 1,200 gp in old dwarf coin.',
        },
        {
          room: 'Root Vault', title: 'Under the Gray Kings', encounter: 'Wardens of the Root',
          read: 'The air under the ring hums like a struck bell. Thirteen roots of grey stone come down through the ceiling. Two oni spring up from beside a chest, and behind them the two stone wardens by the plinth turn their heads toward you, very slowly.',
          gm: 'The golems stand down for the masons\' word or the seeing-glass; otherwise they fight anyone touching the plinth. The oni fight regardless. The chest holds the Highmist speaking-stone and the finger-width chisel (proof for Hessa). The First Oath is carved over the plinth. The heroes can leave the Kingsband (it is safe while the oath holds) or take it to keep it from Vizhar, at the risk of being accused of theft. The stair up leads to a secret door under the Speaker\'s Stone.',
          handout: 'gkg-first-oath',
          treasure: 'The speaking-stone (return it!), the chisel, a rod of lordly might the masons left as a gift for the next keeper, and 4,000 gp of dwarf-cut gems in the wall niches.',
        },
        {
          room: 'Blue Hollow', title: 'The Pale Brood', encounter: 'The Pale Brood', optional: true,
          gm: 'If the heroes follow the dragon clues to the ice cliffs. Come at dawn or dusk and Vaskelune is out hunting; otherwise she flies straight to the ring and the War Drum jumps to 5. The brood fights. Among the coins is the Keeper\'s letter (handout), proof none of the giants can argue with: the handwriting matches his tally book.',
          handout: 'gkg-letter',
          treasure: 'Vaskelune\'s hoard: 7,500 gp in mixed coin, a frost brand longsword, a staff of frost, and an ioun stone (protection) frozen in a block of ice.',
        },
        {
          room: 'Ring of the Gray Kings', title: 'The Judgment of the third dawn', encounter: 'The Breaking of the Moot',
          read: 'The third dawn comes up red over the glacier. The three clans fill the ring, the thrones creak, and the shadows of the Gray Kings stretch out long and black across the stones. The Keeper of Tallies hurries up the path, late as always, and smiles at you.',
          gm: 'The heroes speak once each (moot law). Each clan turned by proof drops the War Drum by 1. Unmasking: get the Keeper to stand in a dawn shadow (trickery, a grapple, or a request from a monarch) or show him through the seeing-glass, and his true shape appears for all to see. He calls the dragon and fights with his last oni; the giants, bound by "no blood in the ring", hesitate for 2 rounds (unless every clan has been turned, in which case they join in on round 2). If he is beaten below half, he runs for the secret stair to grab the Kingsband. If the War Drum clock is full instead, the clans fight each other and Vizhar strikes in the chaos.',
          treasure: 'The Keeper\'s pockets: a ring of spell storing, a tally book that records ninety years of every clan\'s secrets, and 3,000 gp in lowland gems. From the three clans, for the peace: a belt of giant strength (stone giant) from Ossrek, the Highmist\'s blessing (each hero may call a cloud giant\'s aid once), and the Ashfast\'s promise of a forged weapon for each hero.',
        },
      ],
      wrapUp: 'With the saboteur unmasked and the proof laid out, the three clans swear the oath together on the third dawn and the Gray Kings\' eyes glow for one heartbeat. The borders are settled for a generation, and Ardmere\'s valleys are safe. If the moot broke in blood, the clans scatter to war, and the heroes have to get the Kingsband before anyone else does.',
    },
  ],
  ending:
    'Win: the oath is sworn, Vizhar is dead or banished, and the three clans name the heroes Friends of the Moot (giants will carry their messages, and Ardmere gets a seat as a witness forever). Marta is allowed to recut her ancestors\' names on the Speaker\'s Stone. Lose: the moot ends in blood; the clans go to war down the mountain and Ardmere\'s valleys are in the way. If Vizhar got the Kingsband, he now commands giants, and the next adventure is stopping a fiend with an army of them. Next: Vaskelune, if she fled, will be back with grown children; and the ninety-year tally book holds secrets that kings in the lowlands would pay a lot to read.',
};

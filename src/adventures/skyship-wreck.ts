// The Wreck of the Brass Albatross: a pulp jungle one-shot for four heroes of level 4.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function mistmawValley() {
  const b = new MapBuilder('adv-skyship-wreck', 'Mistmaw Valley, the wreck of the Brass Albatross', 80, 80, { open: true, floor: 'grass', ambient: 'bright', wallStyle: 'wood', theme: 'wood' });
  const r = rng(7341);

  // a path of painted ground through points
  const path = (pts: [number, number][], w: number, mat: string) => {
    for (let p = 0; p < pts.length - 1; p++) {
      const [ax, ay] = pts[p], [bx, by] = pts[p + 1];
      const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
      for (let s = 0; s <= steps; s++) {
        const x = Math.round(ax + ((bx - ax) * s) / steps), y = Math.round(ay + ((by - ay) * s) / steps);
        for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) if (b.cellAt(x + i, y + j) === 1) b.paint(x + i, y + j, 1, 1, mat);
      }
    }
  };
  // jungle too thick to cut through, or a rock outcrop
  const blob = (cx: number, cy: number, rx: number, ry: number) => {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) b.rock(x, y, 1, 1);
      }
  };

  // ----- the lake (south-east) and the shore -----
  b.paint(46, 53, 32, 5, 'sand');
  b.pool(63, 67, 13.5, 10.5, true);

  // ----- the river: from the plunge pool, through the rapids gorge, past the wreck, into the lake -----
  const knots: [number, number][] = [[15, 38], [22, 42], [28, 45], [34, 47], [40, 48], [46, 50], [52, 53], [58, 57]];
  const rc = (y: number) => {
    for (let k = 0; k < knots.length - 1; k++) {
      const [y0, x0] = knots[k], [y1, x1] = knots[k + 1];
      if (y >= y0 && y <= y1) return Math.round(x0 + ((x1 - x0) * (y - y0)) / (y1 - y0));
    }
    return knots[knots.length - 1][1];
  };
  for (let y = 15; y <= 60; y++) {
    const c = rc(y);
    const gorge = y >= 19 && y <= 31;
    if (gorge) {
      b.rock(c - 6, y, 3, 1).rock(c + 4, y, 3, 1);
      b.water(c - 3, y, 7, 1, true);
    } else {
      b.water(c - 3, y, 7, 1, false);
      if (!(y >= 46 && y <= 50)) b.water(c - 1, y, 3, 1, true);
    }
  }

  // ----- the plunge pool under the falls -----
  b.pool(38, 13, 8, 4.5, true);

  // ----- cliffs all round the valley -----
  for (let x = 0; x < 80; x++) {
    const north = x <= 60 ? 9 : 3 + Math.round(r());
    b.rock(x, 0, 1, north);
    const south = 2 + Math.round(r() * 2);
    b.rock(x, 80 - south, 1, south);
  }
  for (let y = 0; y < 80; y++) {
    b.rock(0, y, 2 + Math.round(r() * 2), 1);
    const east = 2 + Math.round(r() * 2);
    b.rock(80 - east, y, east, 1);
  }

  // ----- Thunderveil Falls and the secret cave behind them -----
  b.water(36, 4, 5, 5, true);
  b.area('Thunderveil Falls', [[30, 4, 18, 14]], {
    read: 'A white wall of water drops out of the sky and hits the pool like thunder. Spray hangs in rainbows. Behind the roar, the cliff is black and shining wet.',
    gm: 'Swimming the pool: DC 12 Athletics, or be pushed 10 ft toward the river mouth. A hero who studies the cliff east of the falls (DC 14 Perception, or automatic with Marisol\'s riddle) spots a ledge running behind the water curtain to a crack: the secret way into the cave. Wading the shallow north rim, right under the falls, crosses the river without a bridge (DC 12 Strength save or 1d6 bludgeoning from the pounding water).',
    label: [38, 13],
  });
  b.props_('rapids', [[38, 6], [37, 8]]).props_('boulder-large', [[31, 10], [46, 11]]).props_('ferns', [[32, 9], [44, 9], [30, 15]]).prop('obscuring-cloud', 39, 9).props_('lily-pads', [[33, 15], [43, 16]]).prop('flowers', 47, 15);
  b.cave('Cave behind the falls', 49.5, 4.2, 5, 3, {
    seed: 11, mat: 'cave-floor',
    read: 'The roar of the falls turns to a hollow hum. Pale light ripples across the walls through the curtain of water. Thick grey webs hang from the roof like old washing.',
    gm: 'Three giant spiders nest in the roof and drop on anyone who walks under the webs. Fire burns the webs away (each 10-ft patch, 1 round). Marisol hid here two nights ago and the spiders were asleep; they are hungry now.',
  });
  b.cave('Star gallery', 56, 4.2, 2.6, 2.6, {
    seed: 12, mat: 'cave-floor',
    read: 'Someone painted the night sky on this cave roof, long ago: white dots, joined by thin red lines, and a great coiled serpent swallowing the moon. In a crack below the serpent\'s eye, an oilskin tube is tucked.',
    gm: 'The Celestine Chart, in Marisol\'s oilskin tube. The ancient painting matches part of the chart: the valley people mapped the same sky-islands a thousand years ago (DC 13 History or Arcana). A hero who copies the mural (10 minutes) earns Marisol\'s undying gratitude and 50 gp from the Survey.',
  });
  b.hall(45, 6, 45, 8, 1, { mat: 'cave-floor' }).door(45, 8, 's', 'secret');
  b.props_('spider-web', [[46, 3], [50, 5], [52, 3]]).props_('cobweb-corner', [[44, 4], [51, 2]]).props_('bones', [[47, 6], [49, 2]]).prop('backpack', 48, 6).prop('puddle', 45, 5).prop('stalactites', 50, 3);
  b.prop('rune-stone', 55, 3).prop('treasure-map', 56, 5).prop('candles', 54, 5).prop('crystal-cluster', 57, 3);
  b.light(48, 4, 5, 15, '#9fd8ff').light(56, 5, 5, 10, '#ffe7a8');
  b.encounter('Webs behind the falls', [42, 1, 12, 7], [['giantSpider', 3]], 'low');

  // the crawlway from the shrine to the cave, above the lip of the falls
  b.tunnel([[12, 8], [13, 6], [17, 4], [24, 3], [31, 2], [41, 2], [44, 3]], 1, { mat: 'cave-floor', seed: 21 });
  b.area('Crawlway above the falls', [[13, 2, 28, 3]], {
    read: 'A tunnel no wider than your shoulders, carved smooth and painted with tiny feathered snakes. The rock shakes with the falls, somewhere very close.',
    gm: 'The shrine-builders\' secret way to the star gallery. One square wide: squeeze in single file, no running. Where it passes over the falls, the floor is wet and tilted (DC 11 Acrobatics or slide 10 ft back). A hero who presses an ear to the wall hears the spiders moving ahead.',
    label: [26, 3],
  });
  b.props_('torch-sconce', [[17, 4], [33, 2]]).prop('skeleton-lying', 28, 3).prop('offering-bowl', 39, 2);

  // ----- north-west: the Shrine of the Feathered Coil -----
  b.paint(4, 14, 20, 9, 'dirt');
  b.building('Serpent sanctum', 9, 9, 8, 5, {
    mat: 'stone-flagstone',
    read: 'Green light falls through a broken roof onto a stone serpent coiled around an empty altar. Its head is as big as a cart, and its eyes are two polished moonstones.',
    gm: 'Sunscale, the couatl, sleeps here in the shape of a huge coiled serpent of light and feathers. It wakes when anyone steps on the altar steps. It has guarded this valley for six hundred years and is furious about the wreck, the noise and the leaking core. See the scene "The feathered guardian". The north wall has a secret door (DC 15 Perception, or Sunscale shows it) to the crawlway.',
    doors: [[12, 13, 's', 'open', 'door-double'], [13, 13, 's', 'open', 'door-double'], [12, 9, 'n', 'secret']],
  });
  b.prop('altar', 12, 10).prop('idol', 13, 10).props_('statue-dragon', [[10, 11], [15, 11]]).props_('brazier', [[10, 10], [15, 10]]).prop('offering-bowl', 12, 11).prop('mold-patch', 16, 12);
  b.light(10, 10, 10, 15).light(15, 10, 10, 15);
  b.area('Shrine plaza', [[4, 14, 20, 9]], {
    read: 'Steps climb a vine-choked pyramid to a sanctum on top. Broken pillars and serpent statues lean out of the ferns, and every stone is carved with feathers.',
    gm: 'Quiet and watched. Flocks of bright birds go silent when strangers arrive. Climbing the pyramid steps is easy; the vines on the sides (DC 10 Athletics) are faster. A dry fountain holds 14 gp of old offerings; taking it makes Sunscale hostile.',
    label: [13, 18],
  });
  b.props_('stairs-up', [[12, 14], [13, 14]]).props_('pillar-broken', [[5, 15], [21, 15], [5, 21], [21, 21]]).props_('statue-tall-winged', [[8, 16], [18, 16]]).prop('obelisk', 7, 19).prop('fountain', 16, 19).prop('column-fallen', 19, 18).props_('ferns', [[6, 17], [20, 20], [10, 21]]).prop('grass-tall', 15, 21).prop('flowers', 11, 17);
  b.wallRun(4, 22, 6, 's', 'low').wallRun(16, 22, 8, 's', 'low').wallRun(23, 14, 4, 'e', 'low');
  b.encounter('Guardian of the coil', [4, 9, 20, 14], [['couatl', 1]], 'low');

  // ----- west: the Grandfather Fig and the bow of the Albatross -----
  blob(16, 29, 3.2, 3.2);
  b.building('Bow wheelhouse', 20, 22, 11, 7, {
    read: 'The front of the airship hangs nose-down in the branches, forty feet up, creaking like an old door. Charts and broken glass slide around the tilted floor. The brass wheel still turns, slowly, on its own.',
    gm: 'Bosun Grizel Ashmoor holds the wheelhouse against the apes with a boat hook. The floor tilts: anyone who falls prone slides 10 ft toward the smashed front windows (DC 12 Dexterity save to grab something, or drop 40 ft for 4d6). The captain\'s cabin is through the door to the west.',
    doors: [[30, 23, 'e', 'open'], [24, 28, 's', 'closed'], [20, 25, 'w', 'open']],
    windows: [[30, 26, 'e'], [27, 22, 'n']],
  });
  b.wallRun(25, 22, 7, 'e').door(25, 25, 'e', 'closed');
  b.area("Captain's cabin", [[20, 22, 6, 7]], {
    read: 'A narrow cabin, everything bolted down. The captain is still in his chair, very dead, his hand on a brass key that hangs from his neck.',
    gm: 'Captain Berthold Thale died in the crash. His damper key (a brass key the length of a hand, warm to the touch) is needed to shut the core down. His logbook says the Red Kestrel fired a harpoon into the core housing before the fall (see handout).',
    label: [22, 25],
  });
  b.prop('ship-wheel', 28, 25).prop('table-maps', 27, 23).prop('telescope', 29, 27).props_('debris-wood', [[26, 27], [29, 24]]).prop('map-cabinet', 26, 22);
  b.prop('writing-desk', 21, 23).prop('chair-high-back', 22, 23).prop('bed', 21, 27).prop('strongbox', 24, 27).prop('lantern-hanging', 23, 25);
  b.area('Grandfather Fig', [[8, 20, 12, 16], [20, 29, 12, 7]], {
    read: 'The fig tree is the size of a castle. Its roots climb over each other like frozen waves, and up in its arms hangs the bow of a ship, gold letters on its side: BRASS ALBATROSS. Something big and hairy hoots from the leaves.',
    gm: 'Six apes have claimed the bow as a new nest and pelt anyone climbing with fruit and broken glass. The root stairs (stairs props) climb to the wheelhouse hatch without a check; the trunk vines take DC 12 Athletics. Apes flee if two are hurt badly or if someone offers food (the cargo field has a crate of sugared figs). Grizel\'s shouts can be heard from the ground.',
    label: [12, 34],
  });
  b.props_('stairs-up', [[20, 31], [21, 30], [23, 29]]).props_('tree-oak', [[11, 24], [21, 34], [9, 31]]).props_('log-fallen', [[13, 35], [27, 32]]).prop('ladder', 24, 29).props_('debris-wood', [[18, 33], [26, 34]]).props_('bush', [[10, 27], [29, 33]]).prop('rope-coil', 22, 32).prop('crate', 19, 35);
  b.encounter('Apes in the branches', [10, 20, 22, 16], [['ape', 6]], 'low');

  // ----- the vine bridges over the rapids gorge -----
  for (let x = 31; x <= 50; x++) b.floor(x, 23, 1, 1, 'wood-planks');
  for (let x = 35; x <= 54; x++) b.floor(x, 30, 1, 1, 'wood-planks');
  b.area('Vine bridges', [[31, 22, 24, 9]], {
    read: 'Two bridges of rope and lashed planks sag across a gorge full of white water. The higher one starts at the ship\'s bow. Leathery wings circle below you, between the cliffs.',
    gm: 'The bridges are sound but sway (DC 10 Acrobatics to run; fail and fall prone). A dropped hero falls 30 ft into the rapids: 3d6 bludgeoning, then DC 13 Athletics each round to reach a bank, or be swept 60 ft downstream to the wreck hull. Daring swing: the hanging vines midway let a hero swing between the two bridges (DC 12 Acrobatics). Pteranodons nest on the gorge walls and dive at anyone on a bridge.',
    label: [44, 26],
  });
  b.props_('bridge-rope', [[34, 23], [47, 23], [38, 30], [51, 30]]).props_('rapids', [[43, 21], [44, 27], [46, 31]]).prop('whirlpool', 42, 25).props_('crumbling-ledge', [[33, 23], [53, 30]]).prop('log-fallen', 34, 18);
  b.encounter('Pteranodon dive', [32, 20, 22, 12], [['pteranodon', 10]], 'low');

  // ----- the midship, broken across the river -----
  b.building('Cargo hold', 39, 35, 13, 9, {
    read: 'The middle of the airship lies broken-backed across the river, and the river runs right through it. Crates, barrels and a mule\'s harness float in the brown water. People with crowbars are arguing over a strongbox.',
    gm: 'Mother Dorcas Grubbe\'s wreckers: Grubbe, four thugs, two scouts on the upper deck and four bandits. They want loot, not a fight; they will deal (see Grubbe). If a fight starts, the scouts shoot from the deck stairs and the bandits run for the raft. The hold is partly flooded: the water strip is difficult ground.',
    doors: [[39, 39, 'w', 'open'], [44, 35, 'n', 'open'], [42, 43, 's', 'closed']],
  });
  b.water(46, 35, 5, 9, false, true);
  b.props_('cargo-crates', [[40, 36], [41, 41]]).props_('crate-stack', [[43, 37], [44, 42]]).props_('barrel-group', [[40, 42], [49, 37]]).prop('stairs-up', 45, 36).prop('strongbox', 42, 39).prop('loot-sacks', 43, 40).props_('debris-wood', [[48, 41], [47, 36]]).prop('cargo-hatch', 41, 38).prop('rope-coil', 50, 42).prop('lantern-standing', 44, 39);
  b.light(44, 39, 10, 15);
  b.encounter('Wreckers in the hold', [39, 35, 13, 9], [['veteran', 1], ['thug', 4], ['scout', 2], ['bandit', 4]], 'moderate');
  b.building('Core chamber', 52, 35, 7, 9, {
    mat: 'wood-planks-dark',
    read: 'A brass cage the size of a wardrobe hangs from chains, and inside it a sphere of blue-white crystal spins and spits lightning. A hot wind howls round the room. Hairline cracks run across the crystal, and every few seconds they glow brighter.',
    gm: 'The lift core. It explodes at sunset. To shut it down: the damper key in the lock plate, three turns, and the word "HALLOW" (Juno knows it; without her, three DC 15 Arcana checks, one per round, each failure deals 2d6 lightning to the one trying). Or drown it: unchain it (DC 14 Athletics), heave it onto the cargo sled and drag it to the lake. Either way the bound air spirit, Hallowind, breaks loose. See the scene "The core wakes".',
    doors: [[58, 40, 'e', 'locked']],
  });
  b.door(51, 39, 'e', 'closed');
  b.prop('orb-pedestal', 55, 39).prop('chains-hanging', 55, 38).prop('lock-plate', 54, 40).props_('steam-vent', [[53, 36], [57, 42]]).prop('cage-hanging', 56, 39).prop('handcart', 53, 42).prop('lever', 57, 36).prop('gear-pile', 57, 38);
  b.light(55, 39, 20, 30, '#a9e4ff');
  b.encounter('The core wakes', [52, 35, 7, 9], [['airElemental', 1], ['steamMephit', 3]], 'high');

  // ----- south-west: the heroes come down the hunters' stair -----
  b.area("Hunters' stair", [[3, 68, 8, 8]], {
    read: 'The old hunters\' stair zigzags down the cliff, cut into the rock and slick with moss. From the bottom you can see three columns of smoke, a lake, a waterfall, and a blue light pulsing in the middle of the valley like a heartbeat.',
    gm: 'Start here, at noon. Show the players the sunset track (six hours). The trail north (the old shrine road) reaches the cargo field in 20 minutes; the trail east along the lake reaches the wreckers\' landing in 30.',
    label: [6, 74],
  });
  b.props_('stairs-down', [[4, 75], [5, 75]]).prop('signpost', 8, 70).prop('cairn', 9, 73).props_('ferns', [[3, 69], [9, 75]]);
  b.start(4, 71, 3, 3);
  b.note(5, 73, 'Sunset track: noon at the start. Each big scene or rest takes 1 hour, each trek 20-30 minutes. At sunset the core explodes.');

  // ----- the cargo field: the crash furrow and the spilled cargo -----
  path([[36, 34], [30, 39], [24, 44], [18, 49], [12, 53]], 3, 'dirt');
  b.area('Spilled cargo', [[16, 38, 20, 14]], {
    read: 'A long scar of torn earth runs through the jungle, and along it lies everything the airship was carrying: crates, trunks, a piano with no lid, bolts of silk caught in the trees. Something has been eating the dead mules.',
    gm: 'Four panthers feed here and stalk anyone who comes alone. One "chest" with the royal crest is a mimic, shipped to the Royal Menagerie as a curiosity; its crate stencil says DO NOT FEED. Searching the cargo (10 minutes, DC 12 Investigation) finds a crate of sugared figs (apes love them), a cargo sled with runners, and the useful loot listed in the scene.',
    label: [26, 45],
  });
  b.props_('crate', [[20, 40], [31, 41], [23, 49], [17, 46]]).props_('crate-pile', [[28, 43], [19, 43]]).prop('mimic-chest', 25, 46).props_('barrel', [[33, 38], [21, 47]]).prop('harpsichord', 29, 47).prop('trunk', 33, 44).prop('cage', 18, 50).prop('burning-wreckage', 35, 36).props_('debris-wood', [[27, 40], [22, 51]]).props_('bones', [[30, 45], [24, 42]]).prop('cart', 32, 49).prop('sails-pile', 19, 38);
  b.light(35, 36, 10, 15);
  b.encounter('Cats in the cargo', [16, 38, 20, 14], [['panther', 4], ['mimic', 1]], 'low');

  // ----- east bank and Kestrel Ridge -----
  // the escarpment: the ridge is only reached by the switchback stair and the goat path
  b.rock(57, 9, 3, 6).rock(57, 17, 3, 12).rock(60, 27, 6, 2).rock(68, 27, 9, 2);
  b.area('Switchback stair', [[56, 14, 5, 4]], {
    read: 'Steps hacked into the red rock with fresh axe marks. A rope hand-line runs up beside them, and someone has hung a tin can full of pebbles on it.',
    gm: 'The tin can is an alarm: DC 13 Perception spots it, DC 12 Sleight of Hand lifts it quietly. If it rattles, the Kestrel crew is waiting at the top. One of two ways up the ridge; the other is the goat path in the south.',
    label: [58, 15],
  });
  b.props_('stairs-up', [[57, 15], [58, 16], [59, 15]]).prop('rope-coil', 56, 16);
  b.area('Goat path', [[65, 26, 4, 4]], {
    read: 'A narrow, crumbling path climbs between boulders, worn by hooves and littered with droppings.',
    gm: 'The back way up the ridge, unwatched. DC 11 Athletics or Acrobatics to climb at speed; on a fail, a rattle of stones (the camp gets a DC 13 Perception to hear).',
    label: [66, 28],
  });
  b.props_('stairs-up', [[66, 27], [67, 28]]).prop('boulder', 65, 26);
  b.area('Kestrel Ridge camp', [[61, 3, 16, 11]], {
    read: 'Bell tents flap on the ridge top, round a fire with a goat on a spit. Sailors in red sashes clean crossbows and look down at the wreck like gulls looking at a dead fish.',
    gm: 'Captain Cassian Varga, quartermaster Ottoline Pemberly, three thugs, six bandits and two scouts. Varga prefers to talk: he invites the heroes to dinner and offers a partnership (see Varga). Marisol is in a cage at the south edge of the camp, by the moored Kestrel. Ottoline can be turned (see her notes).',
    label: [69, 8],
  });
  b.props_('tent-bell', [[63, 5], [74, 5], [63, 11]]).prop('tent-command', 70, 4).prop('campfire-spit', 68, 9).props_('weapon-rack', [[73, 10], [65, 8]]).props_('barrel-group', [[75, 12], [62, 8]]).prop('table-maps', 71, 7).prop('chair', 72, 7).prop('war-banner', 67, 6).props_('bedroll', [[65, 12], [72, 12]]).prop('supplies', 76, 9);
  b.light(68, 9, 15, 20);
  b.encounter('Kestrel Ridge camp', [61, 3, 16, 11], [['banditCaptain', 1], ['spy', 1], ['thug', 3], ['bandit', 6], ['scout', 2]], 'moderate');
  b.prop('cage', 64, 14);
  b.building('The Red Kestrel', 63, 16, 13, 7, {
    read: 'A sleek red airship sits on the ridge, tied down with a dozen ropes, listing to one side. A harpoon gun on its bow points at the valley. Its own lift core lies on the deck in three cracked pieces.',
    gm: 'Varga\'s ship cannot fly: its core cracked when it rammed the Albatross. That is why he wants the Albatross core so badly. Two crew aboard (not counted; they surrender at once). The harpoon gun (ballista) can be turned on the valley: +6 to hit, 3d10 piercing, range 120/480 ft, one shot a round with two crew. In the captain\'s locker: the orders from the Amberline Syndicate (handout).',
    doors: [[69, 16, 'n', 'open'], [63, 19, 'w', 'closed']],
    windows: [[75, 18, 'e'], [75, 20, 'e']],
  });
  b.prop('ship-mast', 69, 19).prop('ballista', 74, 19).prop('ship-wheel', 65, 19).prop('sails-pile', 71, 21).prop('crows-nest', 67, 17).prop('footlocker', 64, 21).props_('cargo-crates', [[72, 17]]).prop('crystal-cluster', 70, 21).prop('cannon', 73, 21);
  b.props_('mooring-post', [[62, 17], [76, 16], [62, 23], [76, 23]]);
  b.light(66, 18, 10, 15);

  // ----- east: the steaming springs, where the core's magic leaks into the ground -----
  b.pool(66, 34, 3, 2).pool(72, 41, 2.5, 2).pool(63, 44, 2, 1.5);
  b.mud(68, 37, 3, 2).mud(61, 31, 3, 2).mud(70, 45, 3, 2);
  b.area('Steaming springs', [[60, 30, 16, 17]], {
    read: 'The ground here is hot. Pools bubble and spit, the mud pops, and steam rises in lazy columns. Some of the pebbles are floating an inch off the ground.',
    gm: 'The core\'s leaking lift-magic has turned an old hot spring into a mephit nursery. Six steam mephits and four mud mephits play here, led by a chatterbox called Fizzle who would love to talk. Fizzle knows the core is "about to pop, wheee" and roughly when (it can feel the hour). Floating pebbles drift upward in a 10-ft column near the big pool: a creature there can jump three times as far.',
    label: [67, 38],
  });
  b.props_('steam-vent', [[64, 33], [69, 40], [74, 35], [62, 39], [71, 44]]).props_('mud-patch', [[65, 37], [73, 38]]).prop('burning-ground', 61, 35).props_('boulder', [[75, 31], [60, 45]]).prop('skull-bleached', 68, 42).prop('crystal-spire', 70, 33);
  b.light(66, 34, 5, 15, '#ffcf9a').light(72, 41, 5, 10, '#ffcf9a');
  b.encounter('Mephit springs', [60, 30, 16, 17], [['steamMephit', 6], ['mudMephit', 4]], 'low');

  // ----- the crocodile ford and the wreckers' landing -----
  b.area('Crocodile ford', [[45, 45, 12, 6]], {
    read: 'The river spreads wide and shallow over a bed of stones. Five long, knobbly logs lie on the far bank in the sun. One of them yawns.',
    gm: 'The easy crossing between the hull and the lake, waist deep. Five crocodiles bask here. A group DC 13 Stealth gets across unnoticed; throwing them a dead mule (cargo field) keeps them busy for 10 minutes. They let go and sink if one is killed.',
    label: [50, 48],
  });
  b.props_('boulder', [[47, 47], [52, 49], [55, 47]]).props_('reeds', [[46, 45], [56, 50]]).prop('bones-mud', 54, 46);
  b.encounter('Crocodile ford', [45, 45, 12, 6], [['crocodile', 5]], 'low');
  b.area("Wreckers' landing", [[37, 51, 12, 7]], {
    read: 'A raft of lashed barrels is pulled up on the sand beside a heap of salvage: brass rails, a chandelier, rolled sails, the ship\'s bell. A tarp lean-to flaps beside a cold fire.',
    gm: 'The wreckers\' base. One lookout (a bandit, not a fight: she yells and runs to the hull). The raft can carry six and floats down to the lake, or across it to the stern, in 10 minutes. The heap of salvage is worth 300 gp to anyone with a wagon and a month.',
    label: [42, 54],
  });
  b.props_('rowboat', [[47, 56], [45, 57]]).prop('canoe', 48, 54, 90).props_('loot-sacks', [[40, 52], [41, 53]]).prop('temple-bell', 39, 54).prop('chandelier', 38, 52).prop('lean-to', 43, 51).prop('campfire-cold', 43, 53).prop('sails-pile', 40, 56).prop('fishing-net', 46, 52);

  // ----- the stern, sunk in Glimmer Lake, and the fallen mainmast -----
  for (let y = 56; y <= 62; y++) b.floor(62, y, 1, 1, 'wood-planks');
  b.area('Fallen mainmast', [[61, 56, 3, 7]], {
    read: 'The ship\'s mainmast lies like a bridge from the shore out to the stern, its torn sail trailing in the water.',
    gm: 'A balance walk: DC 10 Acrobatics, or fall into deep water (the lake things notice). Running it takes DC 14.',
    label: [62, 59],
  });
  b.props_('sails-pile', [[62, 58]]).prop('crows-nest', 62, 61);
  b.building('Sunken stern', 58, 63, 10, 8, {
    read: 'The back third of the ship sits in the lake, tilted, half full of green water. Through the great cabin\'s windows you can see a lamp still burning, and a small hand slapping the glass.',
    gm: 'Juno Tinderly, the ship\'s gnome engineer, is trapped on an upturned bunk in the flooded engine deck, with air for another hour or two. A giant constrictor snake and four giant frogs have moved in. The great cabin (north, dry) was Marisol\'s: her diary is in the desk (handout).',
    doors: [[62, 63, 'n', 'open'], [67, 68, 'e', 'closed']],
    windows: [[58, 64, 'w'], [65, 63, 'n']],
  });
  b.water(58, 66, 10, 5, false, true).water(60, 67, 5, 3, true, true);
  b.floor(65, 69, 2, 1, 'wood-planks');
  b.wallRun(58, 65, 3, 's').wallRun(63, 65, 5, 's');
  b.area('Great cabin', [[58, 63, 10, 3]], {
    read: 'A pretty cabin turned on its side: maps everywhere, a hammock full of water, a portrait of a stern woman holding dividers.',
    gm: 'Marisol\'s cabin. Her desk holds her diary (handout) and a spare set of brass dividers that, held up to the stars, point toward the nearest sky-island (a curiosity worth 75 gp to a scholar).',
    label: [60, 64],
  });
  b.prop('writing-desk', 64, 64).prop('hammock', 59, 64).prop('map-cabinet', 66, 64).prop('globe-stand', 61, 64).prop('lantern-hanging', 63, 64);
  b.prop('bunk-bed', 65, 69).prop('anchor', 59, 70).prop('gear-pile', 66, 67).prop('chest', 58, 69);
  b.light(63, 64, 10, 15);
  b.encounter('The flooded stern', [58, 63, 10, 8], [['giantConstrictorSnake', 1], ['giantFrog', 4]], 'low');
  b.area('Glimmer Lake', [[52, 70, 6, 5], [69, 60, 7, 8]], {
    read: 'The lake is so clear you can see the brass fittings of the ship glittering on the bottom, and fish nosing round them.',
    gm: 'Deep in the middle (swim; DC 10 Athletics in armour). The best place to drown the core: drag it in deep water and the explosion becomes a 200-ft geyser that soaks everyone on the shore and kills nobody.',
    label: [72, 64],
  });
  b.props_('lily-pads', [[54, 60], [73, 59], [56, 72]]).props_('reeds', [[50, 62], [75, 66]]).prop('deep-water', 64, 74);

  // ----- the gig in the ferns, and the quicksand hollow (south) -----
  b.area('The gig in the ferns', [[13, 59, 10, 7]], {
    read: 'A little sky-boat, the Albatross\'s gig, lies on its side in a nest of snapped ferns. A carrier pigeon coos in a cage on its thwart.',
    gm: 'Three crew tried to fly the gig out and crashed; they walked off toward the shrine and were not seen again (Sunscale has them asleep under a spell; it will give them back). The ship\'s medical chest is here. The pigeon carries a message to the city: the heroes can send word of what happened, or of Varga.',
    label: [17, 62],
  });
  b.prop('rowboat', 17, 62, 30).prop('cage', 19, 61).prop('chest', 15, 60).props_('debris-wood', [[14, 63], [20, 64]]).props_('ferns', [[13, 60], [21, 59], [16, 65]]);
  b.mud(28, 66, 7, 4);
  b.area('Quicksand hollow', [[27, 64, 9, 7]], {
    read: 'A green clearing that looks soft and flat and inviting. The ground quivers when a bird lands on it.',
    gm: 'The quick way east from the stair to the lake. Quicksand: a creature that enters sinks; DC 12 Strength (Athletics) to wade out, and on two failures in a row it is stuck to the chest and needs a rope.',
    label: [31, 67],
  });
  b.props_('quicksand', [[29, 67], [32, 68]]).prop('skull-bleached', 30, 66).prop('log-fallen', 34, 65);

  // ----- trails -----
  path([[5, 71], [9, 63], [11, 54], [10, 44], [8, 36], [11, 24]], 2, 'dirt');
  path([[9, 63], [20, 63], [28, 61], [36, 58], [42, 55]], 2, 'dirt');
  path([[11, 54], [16, 49]], 2, 'dirt');
  path([[59, 40], [63, 36], [67, 31], [67, 28]], 2, 'dirt');
  path([[52, 23], [55, 19], [57, 16]], 2, 'dirt');
  path([[60, 15], [64, 11]], 2, 'dirt');
  path([[46, 10], [52, 14], [55, 16]], 2, 'dirt');
  path([[16, 22], [25, 18], [30, 18]], 2, 'dirt');

  // ----- thick jungle and rock outcrops -----
  blob(27, 13, 2.5, 3);
  blob(31, 72, 3, 2);
  blob(70, 51, 4, 2);
  blob(24, 56, 2, 2);
  blob(44, 66, 3, 3);
  blob(52, 18, 1.6, 2.2);

  // ----- jungle dressing scattered through the open ground -----
  const busy: number[][] = [[3, 9, 22, 14], [8, 20, 25, 17], [30, 1, 31, 18], [31, 20, 25, 12], [37, 33, 24, 12], [15, 37, 22, 16], [55, 2, 24, 23], [58, 28, 19, 20], [36, 44, 22, 15], [56, 55, 22, 23], [12, 58, 12, 9], [26, 63, 11, 9], [2, 66, 10, 11]];
  const isBusy = (x: number, y: number) => busy.some(([bx, by, bw, bh]) => x >= bx && y >= by && x < bx + bw && y < by + bh);
  const scatter: [string, number][] = [['tree-palm', 40], ['tree-swamp', 16], ['ferns', 34], ['bush', 20], ['grass-tall', 18], ['flowers', 14], ['log-fallen', 6], ['boulder', 8], ['mushroom-giant', 4], ['thorn-bush', 6], ['stump', 5]];
  for (const [kind, n] of scatter)
    for (let i = 0, tries = 0; i < n && tries < 600; tries++) {
      const x = 2 + Math.floor(r() * 76), y = 9 + Math.floor(r() * 68);
      if (isBusy(x, y) || b.cellAt(x, y) !== 1) continue;
      b.prop(kind, x, y, Math.floor(r() * 4) * 90);
      i++;
    }
  for (let i = 0, tries = 0; i < 12 && tries < 400; tries++) {
    const x = 2 + Math.floor(r() * 76), y = 9 + Math.floor(r() * 68);
    if (b.cellAt(x, y) !== 2 || isBusy(x, y)) continue;
    b.prop(i % 2 ? 'reeds' : 'lily-pads', x, y);
    i++;
  }
  b.rock(76, 3, 1, 1).rock(3, 76, 1, 1);
  return b.build();
}

export const SKYSHIP_WRECK: Adventure = {
  id: 'skyship-wreck',
  title: 'The Wreck of the Brass Albatross',
  tagline: 'A royal airship lies in pieces across a jungle valley, and its cracked heart will explode at sunset.',
  levels: '4',
  sessions: '1 session (4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'jungle', 'pulp', 'race the clock', 'airships'],
  pitch:
    'Two days ago the royal airship Brass Albatross fell out of the sky over Mistmaw Valley, a steaming green pit of jungle at the edge of the map. On board was Royal Cartographer Marisol Vantwell and the Celestine Chart, the only map of the drifting sky-islands, which she had just stolen back from the people who stole it first. The Royal Survey wants her, the chart and any survivors home. One more thing: the ship\'s lift core is cracked, and the Survey\'s engineers say it will blow at sunset, taking the valley with it. It is noon. Your guide has just shown you the hunters\' stair down the cliff. "Good luck," she says, and does not follow.',
  secret:
    'Captain Cassian Varga of the privateer airship Red Kestrel shot the Albatross down. The Amberline Syndicate, a ring of merchant princes, hired him to get the Celestine Chart back: whoever holds it can find the floating islands and the skystone they are made of, worth more than kingdoms. But Varga rammed the Albatross in the fight and cracked his own lift core. His ship is stuck on Kestrel Ridge. He has caught Marisol, but she hid the chart before he found her, in the painted cave behind the falls, and she will not talk. Now Varga needs two things before sunset: the chart, and the Albatross core to fly home. He does not believe the core will explode. Meanwhile Mother Grubbe\'s wreckers are stripping the midship, the jungle is fighting back, and the core\'s bound air spirit, Hallowind, is tearing its way out. Why now: the core breaks at sunset, today.',
  hooks: [
    'The Royal Survey offers 200 gp each for Marisol and the chart, and 50 gp for every crew member brought home alive.',
    'One hero owes Marisol a favour: she drew the map that once got them out of a desert alive.',
    'A hero\'s cousin, Juno Tinderly, is the Albatross\'s engineer. Her last message, by carrier pigeon, said only: "Core cracked. Stern sinking. Bring a crowbar."',
  ],
  tips: [
    'Use the sunset track: noon at the start, six hours to sunset. Each big scene, fight or short rest costs an hour; each trek between areas costs 20-30 minutes. Tell the players the time often and ring a tremor every hour (see the scene "The core wakes").',
    'There is no right order. The heroes need three things: the damper key (bow), someone who knows the shutdown (Juno in the stern, or Arcana), and ideally Marisol and the chart. Let them split up if they want: it is pulp, and it is fun.',
    'Reward daring: swinging on vines, riding a crate down the rapids, leaping from bridge to bridge. Give advantage for a good description, and make failures dramatic, not deadly.',
    'Most fights can be skipped. The apes want food, the wreckers want loot, the crocodiles want a dead mule, the mephits want a chat, Sunscale wants respect, and Varga wants a deal.',
    'Running short of time? Skip the springs, the gig and the ford. Running long? Have Varga\'s crew turn up at the core an hour before sunset.',
    'Varga is a rogue, not a monster. If the heroes show him the Syndicate\'s orders, or prove the core will explode, he can become a reluctant ally and fly them all out.',
  ],
  npcs: [
    {
      id: 'pf_skymarisol', name: 'Marisol Vantwell', title: 'Royal Cartographer', kind: 'npc', art: 'sage', monsterId: 'scout', shared: true,
      wants: 'The Celestine Chart home in the royal archive, and Varga in irons.', knows: 'Where she hid the chart (the painted cave behind the falls, past the spiders), and that Varga cannot fly without a new core.',
      voice: 'Crisp and precise, measures everything in paces and degrees, swears in sea-shanty.', appearance: 'A tall, sunburnt woman in a torn flying coat, with ink on her fingers and a brass compass on a chain.',
      backstory: 'She drew half the maps in the royal archive. When the Syndicate stole the Celestine Chart, she climbed into their counting-house through a chimney and took it back.',
      gmNotes: 'In a cage on Kestrel Ridge, bruised but defiant. Once freed she will only say where the chart is if she trusts the heroes (DC 12 Persuasion, or free her without hurting anyone). She tells it as a riddle out of habit: "Behind the singing water, where the old ones drew the sky."',
    },
    {
      id: 'pf_skycassian', name: 'Captain Cassian Varga', title: 'captain of the Red Kestrel', kind: 'monster', art: 'ship-captain', monsterId: 'banditCaptain', shared: true,
      wants: 'The chart for his paymasters, the Albatross core for his ship, and to look good doing it.', knows: 'That the Syndicate is paying him well. He does not know they plan to have him arrested once he delivers.',
      voice: 'A warm, theatrical baritone. Calls everyone "my friend". Laughs at danger, loudly.', appearance: 'A handsome man in a red long coat with silver buttons, a feathered hat and a harpoon pistol on his hip.',
      gmNotes: 'Opens with dinner and a deal: help him get the chart and the core, and he flies the heroes out with 500 gp. He will not harm Marisol, but he will lie about her. Shown the Syndicate orders (handout), or the core\'s cracks with his own eyes, he turns: he wants revenge on the Syndicate more than money. He fights with a wind fan in his off hand (see treasure) and surrenders at 15 hit points.',
    },
    {
      id: 'pf_skyottoline', name: 'Ottoline Pemberly', title: 'quartermaster of the Red Kestrel', kind: 'monster', art: 'spy', monsterId: 'spy',
      wants: 'Her back pay, and to never set foot in a jungle again.', knows: 'The Syndicate orders are in Varga\'s locker on the Kestrel, and that the crew have not been paid in three months.',
      voice: 'Dry, quiet, always doing sums out loud.', appearance: 'A small, neat woman with spectacles, a ledger under her arm and three knives in her boots.',
      gmNotes: 'Easy to turn: 50 gp or a promise of a place on the Survey\'s payroll (DC 12 Persuasion) and she will open Marisol\'s cage at the right moment, or "lose" the camp\'s crossbow bolts.',
    },
    {
      id: 'pf_skydorcas', name: 'Mother Dorcas Grubbe', title: 'boss of the wreckers', kind: 'monster', art: 'bandit-captain', monsterId: 'veteran', shared: true,
      wants: 'As much loot as her raft will hold, and no trouble with the Crown.', knows: 'Every corner of the hull. She has the key to the core chamber hatch, and she saw Varga\'s crew drag Marisol up the ridge.',
      voice: 'Gravelly, motherly, calls everyone "duckling", even when threatening them.', appearance: 'A broad old woman in a leather apron hung with crowbars, a pipe clamped in her teeth.',
      gmNotes: 'Will trade: the hatch key and a hand dragging the core for the right to keep the cargo (or 100 gp). She fights only to protect her crew, and pulls them out the moment she believes the core will blow.',
    },
    {
      id: 'pf_skygrizel', name: 'Grizel Ashmoor', title: 'bosun of the Brass Albatross', kind: 'npc', art: 'sailor', monsterId: 'veteran', shared: true,
      wants: 'To get down from this tree, and to punch Captain Varga.', knows: 'That the captain kept the damper key round his neck, and that Juno went aft before the crash.',
      voice: 'Loud, cheerful, salty. Sings when nervous.', appearance: 'A one-eyed dwarf woman with a boat hook, a bandaged leg and a beard braided with brass rings.',
      gmNotes: 'Down to 12 hit points and out of water. Healed and fed, she is a strong ally for the rest of the day and knows the core: with her help, the Arcana checks to shut it down are made with advantage.',
    },
    {
      id: 'pf_skyjuno', name: 'Juno Tinderly', title: 'gnome engineer of the Brass Albatross', kind: 'npc', art: 'alchemist', monsterId: 'commoner', shared: true,
      wants: 'Out of this stupid wet stern, and to save her core, which she loves like a child.', knows: 'The shutdown: damper key, three turns, the word "HALLOW". And that the core holds a bound air spirit that is very, very angry.',
      voice: 'Fast, technical, cheerful even when terrified. Talks to machines.', appearance: 'A soaked gnome in goggles and overalls, clutching a wrench bigger than her arm.',
      gmNotes: 'Air for two hours from the start of the adventure. Rescued, she rides on a hero\'s shoulders and gives orders. She begs the heroes not to drown the core ("It\'s a Mark Seven!"), but admits it would work.',
    },
    {
      id: 'pf_skysunscale', name: 'Sunscale', title: 'guardian of the Feathered Coil', kind: 'monster', art: 'couatl', monsterId: 'couatl',
      wants: 'The noise, the smoke and the "screaming star" (the core) gone from its valley.', knows: 'The valley\'s secret ways: the crawlway to the star gallery, and that the gig\'s three crew sleep safe in the shrine under its spell.',
      voice: 'Soft and slow, speaks straight into the mind, as old as the trees.', appearance: 'A great feathered serpent, rainbow-winged, coiled round the altar like a living sunset.',
      gmNotes: 'Courtesy matters. Heroes who bow, leave an offering or ask permission get its help: it shows the crawlway, wakes the gig crew, and casts Cure Wounds or Lesser Restoration on a hero once. Thieves and loud fools it fights, but it never kills: its venom sends them into a magical sleep, and it lays them outside the valley at dusk.',
    },
    {
      id: 'pf_skyfizzle', name: 'Fizzle', title: 'a very excited steam mephit', kind: 'monster', art: 'steamMephit', monsterId: 'steamMephit',
      wants: 'To see something go BOOM. Also friends.', knows: 'Exactly how long until sunset (it can feel the core), and that the "big windy one" inside the core is waking up.',
      voice: 'Hisses, giggles, finishes every sentence with "wheee".', appearance: 'A small grey imp made of steam, with a kettle-spout nose and wings like wet paper.',
      gmNotes: 'Talk to it and it tells the time to the minute and calls the mephits off. It will follow a friendly hero around and can boil water, fog a room or burp a scalding cloud on command (once). If the heroes decide the core will not explode, it sulks.',
    },
    {
      id: 'pf_skyhallowind', name: 'Hallowind', title: 'the spirit bound in the lift core', kind: 'monster', art: 'airElemental', monsterId: 'airElemental',
      wants: 'Freedom, after forty years of holding up a ship.', knows: 'Nothing about people, except that they put it in a box.',
      voice: 'A howl that sometimes, almost, makes words. "OUT. OUT. OUT."', appearance: 'A twisting column of blue-white wind full of sparks and broken glass.',
      gmNotes: 'Breaks loose when the core is shut down or drowned. It attacks whoever is nearest until someone speaks to it (DC 14 Persuasion, or Juno speaking its name), then it can be talked into leaving in peace: open the roof hatch or step aside. If freed kindly, it lifts the heroes and survivors to the cliff top before it goes.',
    },
  ],
  handouts: [
    { id: 'survey-notice', title: 'Notice from the Royal Survey', text: 'WANTED IN MISTMAW VALLEY BEFORE SUNSET\nRoyal Cartographer M. Vantwell, alive: 200 gp per rescuer.\nThe Celestine Chart, in its tube: no questions asked.\nCrew of the Brass Albatross: 50 gp a head.\nNOTE: the lift core is cracked. Engineers say it will fail at sunset. Do not be in the valley at sunset.' },
    { id: 'captains-log', title: "Captain Thale's last log entry", text: 'Red Kestrel on our tail since dawn. Harpoon through the core housing at the third bell. Core cracking. Taking her down into the valley while she still answers the wheel. Damper key round my neck if anyone needs it. Juno went aft. Gods keep us all.' },
    { id: 'marisol-diary', title: "Marisol's diary, last page", text: 'If they catch me they will not get it. I will hide it where the old ones drew the sky, behind the singing water. The spiders are asleep, I think. Don\'t let Varga near the core: the fool would carry a lit bomb home in his pocket.' },
    { id: 'syndicate-orders', title: 'Orders from the Amberline Syndicate', text: 'Captain Varga: recover the Celestine Chart by any means. On delivery, pay him from the small purse, then have him held at the dock for the Albatross affair. The Crown will want someone to hang. It may as well be him. — A.' },
    { id: 'core-plate', title: 'Brass plate on the core cage', text: 'LIFT CORE, MARK SEVEN. BOUND SPIRIT WITHIN.\nIN THE EVENT OF A CRACK:\n1. Insert damper key.\n2. Three turns, against the sun.\n3. Speak the binding word.\n4. Stand well back.' },
  ],
  chapters: [
    {
      id: 'valley', title: 'Mistmaw Valley', level: 4,
      summary: 'The heroes climb down into a steaming jungle valley where the airship Brass Albatross lies in three pieces. Wreckers, a rival air-captain and the jungle itself are all after a piece of it, and the ship\'s cracked lift core will explode at sunset.',
      goal: 'Rescue Marisol and the survivors, find the Celestine Chart, and stop the core before sunset.',
      map: mistmawValley,
      npcs: [
        { npc: 'pf_skymarisol', x: 64, y: 14 },
        { npc: 'pf_skycassian', x: 70, y: 5 },
        { npc: 'pf_skyottoline', x: 71, y: 8 },
        { npc: 'pf_skydorcas', x: 42, y: 40 },
        { npc: 'pf_skygrizel', x: 28, y: 24 },
        { npc: 'pf_skyjuno', x: 66, y: 69 },
        { npc: 'pf_skysunscale', x: 13, y: 11, hidden: true },
        { npc: 'pf_skyfizzle', x: 67, y: 37, hidden: true },
        { npc: 'pf_skyhallowind', x: 55, y: 40, hidden: true },
      ],
      scenes: [
        {
          room: "Hunters' stair", title: 'Noon at the hunters\' stair',
          read: 'The jungle below breathes out steam like a sleeping animal. Smoke rises in three places, a waterfall roars in the north, and in the middle of it all a blue light pulses, brighter every time. Far off, something big screams in the trees.',
          gm: 'Read the pitch, show the Survey notice and start the sunset track at noon. From the bottom of the stair the heroes can see the bow in the giant fig (north), the midship across the river (centre), the stern in the lake (east) and the red airship on the ridge (north-east). A DC 12 Survival check spots fresh boot tracks heading for the lake: the wreckers.',
          handout: 'survey-notice',
        },
        {
          room: 'Spilled cargo', title: 'Cats in the cargo', encounter: 'Cats in the cargo',
          read: 'Silk ribbons flutter from the branches like party streamers. A grand piano lies on its back in the mud. Something black and silent pads across its keys, and they play three low notes.',
          gm: 'Panthers stalk the scattered cargo; the royal "chest" is a mimic. Make a show of the crate stencil DO NOT FEED. A hero who throws the panthers a dead mule\'s haunch (DC 12 Animal Handling) makes them back off. Searching here finds the sugared figs, the cargo sled and loot.',
          treasure: 'In a trunk: a rope of climbing, 2 potions of healing, a potion of climbing and 40 gp in a purser\'s bag. The mimic has swallowed a silver tea set (60 gp).',
        },
        {
          room: 'Grandfather Fig', title: 'The bosun in the tree', encounter: 'Apes in the branches', handout: 'captains-log',
          read: 'A rain of half-eaten fruit hits the ground around you. Forty feet up, a voice bellows a sea shanty, very badly, and something hairy hoots back in time.',
          gm: 'Six apes have claimed the bow. Sugared figs, a good show of strength (DC 13 Intimidation), or Animal Handling (DC 13) makes them leave. Grizel Ashmoor is in the wheelhouse; the dead captain and the damper key are in the cabin. The logbook gives the shutdown hint. From the wheelhouse door, the high vine bridge runs east across the gorge.',
          treasure: 'The damper key. The captain\'s strongbox (DC 13 Thieves\' Tools, or the key opens it too): 120 gp, a spell scroll of Feather Fall and a +1 rapier with an albatross hilt.',
        },
        {
          room: 'Vine bridges', title: 'Wings over the gorge', encounter: 'Pteranodon dive',
          read: 'The bridge sways under your boots. Below, the river boils white between black rocks. A shadow slides across you, then another, and a shriek splits the air.',
          gm: 'Pteranodons dive at anyone on a bridge, trying to knock them off (a hit forces a DC 12 Strength save or the hero is pushed off the edge; they can grab a rope with a DC 12 Dexterity save). The flock scatters once four are down. Daring play: riding a pteranodon (grapple it mid-dive, then DC 14 Animal Handling) carries a hero anywhere in the valley in one round.',
        },
        {
          room: 'Cargo hold', title: 'Wreckers in the hold', encounter: 'Wreckers in the hold',
          read: 'A crowbar rings on iron. "Mind your fingers, ducklings, that\'s the Crown\'s strongbox." An old woman with a pipe looks up and smiles at you without any warmth at all.',
          gm: 'Mother Grubbe and her wreckers. A deal is easy: let them keep the cargo (or pay 100 gp) and Grubbe hands over the hatch key and lends four strong backs to drag the core. If the heroes convince her the core will blow (show the cracks, DC 12 Persuasion), she leaves with her crew at once and gives them the key for free. A fight here is loud and brings the pteranodons.',
          treasure: 'The Crown\'s strongbox: 200 gp in new coins and a brass spyglass. Grubbe\'s apron: boots of striding and springing (she will trade them for the cargo rights).',
        },
        {
          room: 'Sunken stern', title: 'The flooded stern', encounter: 'The flooded stern', handout: 'marisol-diary',
          read: 'Green water slaps against tilted walls. Somewhere inside, a muffled voice is shouting about pressure, valves and how nobody ever listens. Something heavy and slithering moves beneath the surface.',
          gm: 'Reach the stern by the fallen mainmast, the wreckers\' raft, or by swimming. A giant constrictor snake and four giant frogs lurk in the flooded engine deck. Juno is on the upturned bunk; diving to the hatch and back takes two DC 12 Athletics checks. Marisol\'s diary is in the great cabin desk.',
          treasure: 'Juno\'s tool chest (in the chest by the anchor): 2 potions of water breathing, goggles of night, 30 gp. Marisol\'s brass dividers (75 gp).',
        },
        {
          room: 'Kestrel Ridge camp', title: 'Dinner with Captain Varga', encounter: 'Kestrel Ridge camp', handout: 'syndicate-orders',
          read: 'A tall man in a red coat spreads his arms as if he has been waiting all day for you. "Friends! Guests! You must be starving. Sit, eat, and let us talk about how we are all going to get very rich."',
          gm: 'Varga offers a deal: the chart and the core for 500 gp and a ride home. He lies that Marisol is "resting". Ways to play it: sneak to the cage (DC 13 Stealth past the camp, alarm can on the stair), turn Ottoline, steal the Syndicate orders from the Kestrel and show him, or fight. Shown the orders, Varga turns ally. Fighting here at the same time as anything else is deadly: one fight at a time. Marisol, once free, tells the chart riddle.',
          treasure: 'Varga\'s wind fan, his harpoon pistol (a hand crossbow) and a purse of 150 gp. The crew\'s pay chest: 90 gp (Ottoline wants it).',
        },
        {
          room: 'Serpent sanctum', title: 'The feathered guardian', encounter: 'Guardian of the coil', optional: true,
          read: 'The stone serpent around the altar opens its eyes. They are not stone. Feathers of every colour unfold, and a voice speaks inside your head, soft as rain: "You are very loud, small ones."',
          gm: 'Sunscale. Bow, apologise, offer something (food, a song, a promise to take the "screaming star" away) and it helps: it shows the secret door to the crawlway, releases the three sleeping gig crew (50 gp each to the Survey), and blesses one hero (Cure Wounds or Lesser Restoration, once). Anyone who stole from the fountain gets put to sleep and wakes outside the valley.',
          treasure: 'If the heroes help, Sunscale gives them a potion of greater healing and a jade feather charm (25 gp) from an old offering.',
        },
        {
          room: 'Star gallery', title: 'Behind the singing water', encounter: 'Webs behind the falls',
          read: 'The roar of the falls fades to a hum. Painted stars glitter on the roof, joined by red lines, and the great painted serpent seems to be watching you. Something big shifts in the webs above.',
          gm: 'The chart is here. Two ways in: the secret ledge behind the falls (DC 14 Perception to spot) or the crawlway from the shrine. Giant spiders drop from the webs; fire clears the webs. The mural is a map of the sky-islands, older than the kingdom.',
          treasure: 'The Celestine Chart in its oilskin tube. Among old bones: a backpack with a silver astrolabe (75 gp), a potion of healing and 35 gp.',
        },
        {
          room: 'Steaming springs', title: 'Fizzle and friends', encounter: 'Mephit springs', optional: true,
          read: 'A puff of steam pops out of a pool, grows a face, and grins at you. "Ooh, visitors! Are you here for the big bang? Everyone is here for the big bang. Wheee!"',
          gm: 'Mephits play in the hot pools. Fizzle wants to chat and can tell the heroes the exact time left. Attack and all ten swarm; laugh at its jokes and they wave the heroes through. Fizzle may follow a hero home.',
        },
        {
          room: 'Crocodile ford', title: 'The crocodile ford', encounter: 'Crocodile ford', optional: true,
          gm: 'The low crossing. Sneak, distract with meat, or fight. A hero riding the wreckers\' raft past the ford draws two of them along behind.',
        },
        {
          room: 'Core chamber', title: 'The core wakes', encounter: 'The core wakes', handout: 'core-plate',
          read: 'The crystal screams. Lightning crawls over the brass cage, the floor lifts an inch, and the cracks blaze white. Inside the light, something with no face presses against the glass and howls.',
          gm: 'Tremors each hour: at 1 pm loose things float; at 3 pm everyone in the valley feels it; at 4 pm gravity flips for a round (DC 12 Dexterity save or fall 10 ft up and down, 1d6); at 5 pm steam mephits boil out of the core (three of them, here). Shutting it down: damper key, three turns, the word "HALLOW" (or three DC 15 Arcana checks). Drowning it: drag the core on the sled to deep water (two heroes, DC 13 Athletics every 10 minutes; Grubbe\'s crew make it automatic). Either way Hallowind bursts out: talk (DC 14 Persuasion, Juno helps) or fight. If nothing is done by sunset, the core explodes: everyone still in the valley makes a DC 15 Dexterity save, taking 6d10 force on a failure (half on a success) and landing in the lake or the trees.',
          treasure: 'A safely shut-down core is worth 1,000 gp to the Survey (a drowned one, 300 gp). If Hallowind leaves in peace, it drops one blue feather of solid wind that works once as a potion of flying.',
        },
      ],
      wrapUp: 'With the core quiet, Hallowind gone and the sun going down red over the cliffs, the heroes gather the survivors. If Varga turned, the Red Kestrel limps into the air with the Albatross core in its belly and everyone on deck. Otherwise the Survey\'s balloon arrives at dawn. The heroes reach level 5.',
    },
  ],
  ending:
    'Good ending: Marisol, the chart and the crew come home, the core is quiet, and the Survey pays up. Marisol names a sky-island after each hero, and Varga (if turned) testifies against the Amberline Syndicate. Bad ending: the core explodes at sunset, the valley becomes a smoking crater ringed with flattened jungle, and whoever has the chart now has a head start on the sky. If Varga took the core and flew off with it, the Kestrel lights up the evening sky like a second sun. What next: the chart shows a floating island that is moving toward the capital, and someone on it has started to steer.',
};

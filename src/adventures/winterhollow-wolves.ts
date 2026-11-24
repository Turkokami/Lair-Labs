// The Wolves of Winterhollow: a one-session survival adventure for four heroes of level 2.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function winterhollow() {
  const b = new MapBuilder('adv-winterhollow', 'Winterhollow on the longest night', 80, 80, { open: true, floor: 'ice', ambient: 'dim', wallStyle: 'wood', theme: 'wood' });
  const r = rng(2611);

  // ---------- the edges of the map: forest too thick to walk ----------
  b.rock(0, 0, 80, 1);
  let wl = 2, wr = 2;
  for (let y = 0; y < 80; y++) {
    wl = Math.max(1, Math.min(3, wl + Math.round((r() - 0.5) * 2)));
    wr = Math.max(1, Math.min(3, wr + Math.round((r() - 0.5) * 2)));
    b.rock(0, y, wl, 1).rock(80 - wr, y, wr, 1);
  }
  // the Wolfback, a ridge of grey rock in the north
  for (let x = 22; x <= 44; x++) b.rock(x, 0, 1, 14 + Math.round(2 * Math.sin(x * 0.6)) - (x < 26 ? 3 : 0));
  // the knoll under the sacred grove
  for (let x = 67; x <= 79; x++) b.rock(x, 0, 1, 13 + Math.round(Math.sin(x)));
  // deadfall thickets that shape the paths
  b.rock(37, 21, 4, 6).rock(38, 27, 2, 2).rock(57, 46, 5, 6).rock(37, 69, 4, 8).rock(51, 72, 6, 7).rock(3, 34, 4, 9).rock(24, 44, 4, 1);

  // ---------- the Hollowrun: fast black water that never quite freezes ----------
  const riverPts: [number, number][] = [[49, 0], [48, 10], [48, 22], [45, 32], [42, 44], [43, 56], [45, 66], [47, 79]];
  const riverX = (y: number) => {
    for (let i = 0; i < riverPts.length - 1; i++) {
      const [ax, ay] = riverPts[i], [bx, by] = riverPts[i + 1];
      if (y >= ay && y <= by) return Math.round(ax + ((bx - ax) * (y - ay)) / (by - ay) + Math.sin(y * 0.7) * 0.8);
    }
    return 47;
  };
  for (let y = 0; y < 80; y++) {
    const cx = riverX(y);
    b.water(cx - 2, y, 1, 1, false).water(cx - 1, y, 2, 1, true).water(cx + 1, y, 1, 1, false);
  }
  // frozen solid above the bend, at the ford and on the millpond
  b.ice(44, 1, 8, 15).ice(39, 33, 10, 3);
  b.pool(41, 48, 6, 4, true);
  b.ice(34, 44, 14, 8);
  b.mud(48, 37, 9, 9);
  b.pool(52, 41, 3, 2);

  // ---------- trails trodden into the snow ----------
  const trodden = new Set<string>();
  const trail = (pts: [number, number][], w = 2) => {
    for (let p = 0; p < pts.length - 1; p++) {
      let [x, y] = pts[p];
      const [bx, by] = pts[p + 1];
      const put = () => {
        for (let j = 0; j < w; j++)
          for (let i = 0; i < w; i++)
            if (b.cellAt(x + i, y + j) === 1) { b.paint(x + i, y + j, 1, 1, 'dirt'); trodden.add(`${x + i},${y + j}`); }
      };
      put();
      while (x !== bx || y !== by) {
        if (Math.abs(bx - x) >= Math.abs(by - y)) x += Math.sign(bx - x); else y += Math.sign(by - y);
        put();
      }
    }
  };
  trail([[18, 79], [18, 72]]); // south road
  trail([[20, 46], [20, 40], [16, 34], [12, 30], [11, 25]]); // north gate to the lodge
  trail([[20, 40], [25, 38], [33, 38], [40, 35], [47, 34], [50, 36]]); // past the tarn to the ford and the spring
  trail([[21, 36], [24, 28], [28, 22], [32, 18], [32, 15]]); // up to the Wolfback
  trail([[36, 58], [39, 60], [45, 63], [52, 63], [57, 60], [62, 62], [66, 64]]); // east gate, mill bridge, lower camp
  trail([[62, 62], [62, 54], [64, 46], [63, 40]]); // logging road north
  trail([[63, 40], [61, 32], [62, 24], [62, 19]]); // the cut
  trail([[52, 38], [56, 36], [60, 36]]); // spring to upper camp
  trail([[33, 16], [36, 18], [43, 19], [51, 20], [55, 18]]); // the Wolfback trail to the fallen-log crossing

  // ======================= THE VILLAGE =======================
  b.area('South road', [[12, 73, 12, 6]], {
    read: 'The road climbs out of the pines into a white clearing. Ahead stands a palisade of sharpened logs, black against the snow, with one brazier burning over the gate. Somewhere behind you, a wolf howls, and another answers.',
    gm: 'The heroes arrive here at dusk on the longest night. The gate guard, a nervous boy with a spear, opens up fast once he sees weapons: "Get in, get in, they come at dark."',
    label: [16, 76],
  });
  b.start(17, 75, 3, 3);
  b.props_('tree-fir-snow', [[13, 74], [22, 77], [14, 78]]).prop('signpost', 21, 74).prop('milestone', 15, 76).prop('snowdrift', 22, 75).prop('cart', 14, 75, 90);

  // the palisade
  b.wallRun(6, 46, 30, 'n').wallRun(6, 72, 30, 's').wallRun(6, 46, 27, 'w').wallRun(35, 46, 27, 'e');
  b.door(20, 46, 'n', 'closed').door(21, 46, 'n', 'closed');
  b.door(18, 72, 's', 'closed').door(19, 72, 's', 'closed');
  b.door(35, 58, 'e', 'closed').door(35, 59, 'e', 'closed');
  b.door(8, 46, 'n', 'secret');
  b.paint(16, 57, 10, 12, 'dirt').paint(18, 69, 2, 3, 'dirt').paint(20, 47, 2, 10, 'dirt').paint(26, 58, 9, 2, 'dirt');

  b.area('North gate', [[17, 46, 8, 3]], {
    read: 'A double gate of split logs, barred with a beam as thick as a man. A ladder climbs to a narrow walk along the top of the wall, where two old women with boar spears watch the treeline.',
    gm: 'The wolves test this gate every night. From the wall-walk the heroes get half cover and can shoot down into the clearing. The bar holds against anything but a dire wolf throwing itself at it three rounds in a row.',
    label: [21, 47],
  });
  b.props_('brazier', [[18, 47], [23, 47]]).prop('stairs-up', 17, 48).prop('spear-rack', 24, 48).prop('barrel', 25, 47);
  b.light(18, 47, 15, 20).light(23, 47, 15, 20);
  b.area('South gate', [[15, 69, 8, 3]], {
    gm: 'The way in from the road. One boy, one spear, one brazier. Once the heroes are inside, the gate stays barred until dawn.',
    label: [18, 70],
  });
  b.prop('brazier', 17, 70).prop('stairs-up', 21, 70).prop('water-barrel', 16, 71);
  b.light(17, 70, 10, 20);
  b.area('East gate', [[30, 57, 5, 4]], {
    gm: 'The small gate to the river path and the sawmill. The loggers use it at first light. Tonight it is barred and piled with sacks of sand.',
    label: [33, 58],
  });
  b.props_('sandbags', [[33, 57], [33, 60]]).prop('brazier', 31, 60);
  b.light(31, 60, 10, 15);

  b.building('Oakshott longhouse', 12, 49, 12, 7, {
    mat: 'wood-planks-dark',
    read: 'A long hall of smoke-black timber. Every family in Winterhollow has a bench here tonight, and the children sleep in a heap of furs by the fire. When the door opens, every face turns to see if it is news.',
    gm: 'Headwoman Hildy Oakshott runs the council from the high seat. Edric Brennick paces by the door with his axe. Everyone has a theory: the wolves are cursed, the wolves are starving, the wolves were sent. A DC 12 Insight on the loggers shows they are frightened of something besides wolves; the foreman Ulric Kettering is absent "at the mill".',
    doors: [[17, 55, 's'], [23, 52, 'e']],
    windows: [[12, 51, 'w'], [15, 49, 'n'], [20, 49, 'n']],
  });
  b.prop('hearth-grand', 17, 50).props_('bench-long', [[14, 52], [14, 54], [20, 52], [20, 54]]).prop('chair-high-back', 13, 50).props_('rug-pelt', [[17, 52], [16, 53]]).prop('table-long', 17, 53).prop('banner-hanging-tall', 22, 50).props_('bedroll', [[13, 53], [21, 50]]).prop('cauldron', 19, 50);
  b.light(17, 50, 15, 20).light(17, 53, 5, 10);

  b.building('Smokehouse', 7, 48, 4, 5, {
    mat: 'dirt',
    read: 'Hams, haunches and strings of sausage hang in the smoke. It is the warmest-smelling place in the village and the most guarded.',
    gm: 'The village\'s winter meat. Hildy will give the heroes three haunches if asked (each one thrown to the wolves ends a wolf fight for a round, or sweetens Hrimma\'s bargain). Behind the smokehouse a narrow alley runs to the postern.',
    doors: [[10, 50, 'e']],
  });
  b.props_('herbs-drying', [[8, 49], [9, 49]]).prop('butcher-block', 8, 51).prop('firewood', 9, 51);
  b.area('The postern', [[7, 46, 4, 2]], {
    gm: 'Secret: a door in the palisade, hidden behind the smokehouse, used by Hildy\'s grandfather to sneak out courting. Edric knows it (DC 15 Perception to find without him). It lets the heroes leave without opening the main gates and without the wolves noticing.',
    label: [8, 47],
  });
  b.prop('gm-secret-door', 8, 47, 0, { gm: true });

  b.building('Brennick cottage', 27, 49, 7, 5, {
    read: 'A cold cottage with the fire left to die. A child\'s cot by the hearth is empty, a dog\'s blanket lies beside it, and a slate leans against the door.',
    gm: 'Linnet Brennick\'s home. Her mother died two winters back; it is just Linnet, her father and the dog Bramble, who is also gone. The slate (handout) shows she went after the dog. Her other mitten is here: a hero who carries it gets advantage to track her scent with a beast companion.',
    doors: [[29, 53, 's']],
    windows: [[33, 51, 'e']],
  });
  b.prop('crib', 28, 50).prop('fireplace', 32, 50).prop('kitchen-table', 30, 51).props_('stool', [[29, 51], [31, 52]]).prop('rug-pelt', 28, 52).prop('coat-rack', 32, 52);

  b.building('Byre', 7, 56, 7, 5, {
    read: 'Cows and goats packed shoulder to shoulder in the straw, steaming and restless. They roll their eyes at the north wall.',
    gm: 'Every animal in the village is in here. A DC 10 Animal Handling calms them. A good place to hide a wounded hero.',
    doors: [[13, 58, 'e']],
  });
  b.props_('hay-bale', [[8, 57], [8, 59]]).prop('water-trough', 11, 57).prop('straw-bed', 10, 59).prop('milk-churn', 12, 59);

  b.building('Smithy', 7, 63, 7, 7, {
    mat: 'stone-cobble',
    read: 'A low forge glows red. Spearheads cool in a row on the anvil, and the smith has started on axe-blades for anyone who will hold one.',
    gm: 'The smith, a quiet woman named Bet, sells spears (2 gp), hand axes (6 gp) and will silver one weapon for 20 gp by midnight (it does nothing special to beasts, but Hrimma notices it and respects it).',
    doors: [[13, 66, 'e']],
  });
  b.prop('forge', 8, 64).prop('anvil', 10, 65).prop('grindstone', 8, 68).prop('tool-wall', 12, 64).prop('weapon-barrel', 11, 68).prop('water-barrel', 9, 68);
  b.light(8, 64, 15, 20, '#ff9a3c');

  b.building('Shrine of the Hearth-Mother', 27, 62, 7, 8, {
    mat: 'wood-planks',
    read: 'A little shrine with a clay hearth for an altar. Three loggers lie wrapped in blankets by the fire, their fingers blackened with frost.',
    gm: 'The frostbitten loggers came down from the upper camp a week ago. Ask them and they whisper about the cold that "came out of the Stand like breath", and a white shape bigger than a horse moving through the trees (that was Hrimma; the cold was something else). The keeper gives each hero a potion of healing for the night.',
    doors: [[27, 65, 'w']],
    windows: [[33, 64, 'e']],
  });
  b.prop('altar', 31, 63).prop('candles', 32, 63).prop('offering-bowl', 30, 63).props_('cot', [[28, 66], [30, 67], [32, 66]]).prop('font', 28, 63).prop('prayer-kneeler', 31, 65);
  b.light(31, 63, 10, 15, '#ffd08a');

  b.area('Village square', [[15, 56, 11, 13]], {
    read: 'A bonfire roars in the middle of the square, and everyone who isn\'t inside is feeding it. The snow around it has melted to slush. Beyond the firelight the palisade is a black wall full of small sounds.',
    gm: 'The heart of the village. Fire keeps the wolves off: no wolf will come within 20 feet of the bonfire. If the wolves get over the wall, the villagers fall back here.',
    label: [20, 62],
  });
  b.prop('campfire', 20, 62).prop('well', 23, 59).props_('firewood', [[17, 60], [24, 65]]).prop('notice-board', 16, 57).prop('lamp-post', 24, 67).prop('handcart', 17, 66).prop('snowman', 22, 67).prop('bench', 18, 64);
  b.light(20, 62, 20, 30).light(24, 67, 10, 15);
  b.area('Woodyard', [[26, 55, 9, 3]], {
    gm: 'Split logs stacked higher than a man along the east wall. Climbing the woodpile (DC 10 Athletics) puts a hero on the wall without a ladder.',
    label: [30, 56],
  });
  b.props_('log-pile', [[27, 55], [30, 55], [33, 55]]).prop('sawhorse', 29, 56).prop('workbench', 32, 56);

  // the wolves' clearing outside the north gate
  b.area('Wolf-run clearing', [[14, 37, 17, 8]], {
    read: 'A white clearing between the wall and the trees. Paw prints cover every inch of it, round and round, like a dance. Eyes catch the brazier light at the edge of the pines.',
    gm: 'Where the pack circles each night. The wolves are thin; a DC 12 Survival or Nature check shows they are starving, and that they came from the north-east. Their tracks lead to the Wolfback.',
    label: [22, 41],
  });
  b.props_('snowdrift', [[15, 39], [27, 43], [29, 38]]).props_('stump', [[17, 42], [26, 40]]).prop('bones', 24, 42).prop('log-fallen', 14, 44);
  b.encounter('Wolves at the north gate', [14, 37, 17, 8], [['wolf', 6]], 'low');

  // ======================= THE NORTH-WEST WOODS =======================
  b.building('Fenwold Lodge', 5, 15, 14, 10, {
    mat: 'wood-planks-dark',
    read: 'An old lord\'s hunting lodge of dark beams and antlers. Light and loud voices leak from the shutters. Pelts hang drying in rows outside, and one of the hides is the size of a bear.',
    gm: 'Varn Drace and four hunters have holed up here since the snow. They are poachers and timber-buyers from the lowlands, and they plan to burn the white wolf out of her den at dawn for her pelt. They are rude but not murderous: talk works (see Varn Drace). Fight only if they are threatened or robbed.',
    doors: [[8, 24, 's'], [5, 19, 'w']],
    windows: [[7, 15, 'n'], [10, 24, 's'], [18, 22, 'e']],
  });
  b.wallRun(12, 15, 10, 'e').wallRun(13, 16, 6, 's').wallRun(13, 19, 6, 's');
  b.door(12, 18, 'e', 'closed').door(12, 22, 'e', 'closed').door(16, 16, 's', 'secret');
  b.prop('hearth-grand', 6, 16).prop('table-long', 8, 19).props_('bench-long', [[7, 18], [7, 21]]).props_('chair', [[10, 19], [10, 20]]).prop('rug-pelt', 8, 22).props_('barrel', [[11, 16], [11, 23]]).prop('spear-rack', 6, 23).prop('lantern-hanging', 9, 20);
  b.light(6, 16, 15, 20).light(9, 20, 10, 15);
  b.area('Lodge trophy room', [[13, 17, 6, 3]], {
    read: 'Glass eyes watch you from every wall: stag heads, a boar, a bear rearing on its hind legs. One space over the mantel is empty, and someone has chalked a wolf\'s head there.',
    gm: 'The chalked space is where Drace means to hang the white wolf. A DC 13 Investigation notices a draught behind the stuffed bear: the secret door to the pelt store.',
  });
  b.prop('armor-stand', 14, 18).prop('heraldic-crest', 17, 17).prop('display-case', 15, 19).prop('rug-pelt', 16, 18);
  b.area('Hidden pelt store', [[13, 15, 6, 2]], {
    read: 'A cramped closet stacked with furs. Otter, fox, marten, and three wolf hides, grey and new.',
    gm: 'Proof of the poaching (the lodge\'s lord forbids wolf-hunting on his land) and Drace\'s spare kit, including two potions of resistance (cold).',
  });
  b.props_('crate-stack', [[14, 15], [17, 15]]).prop('chest', 15, 16).prop('gm-treasure', 16, 15, 0, { gm: true });
  b.area("Drace's chamber", [[13, 20, 6, 5]], {
    gm: 'A camp bed, a writing desk and a strongbox. On the desk: the furrier\'s bounty notice (handout) and a letter promising Ulric Kettering 40 gold crowns for "the big pine". Varn sleeps here with his boots on.',
  });
  b.prop('bed', 14, 21).prop('writing-desk', 17, 21).prop('strongbox', 17, 23).prop('trunk', 14, 23).prop('candles', 16, 21);
  b.light(16, 21, 5, 10);
  b.encounter('Poachers at Fenwold Lodge', [5, 15, 14, 10], [['bandit-captain', 1], ['bandit', 4]], 'moderate');

  b.area('Lodge yard', [[4, 25, 15, 6]], {
    read: 'A trampled yard behind a split-rail fence. A sledge stands loaded with barrels of lamp oil, and two hunting dogs whine on their chains, tails between their legs.',
    gm: 'The oil is for the den. Spilling it or cutting the sledge loose (DC 12 Stealth to do it unseen) ruins Drace\'s dawn plan. The dogs bark at strangers unless fed.',
    label: [10, 28],
  });
  b.prop('gibbet-post', 6, 26).prop('wagon', 12, 27, 90).props_('barrel-group', [[14, 26], [15, 28]]).prop('firewood', 5, 29).prop('hitching-post', 17, 29).props_('fence-wood', [[4, 30], [8, 30], [16, 30]]).prop('campfire', 9, 28);
  b.light(9, 28, 10, 15);
  b.area('Trap line', [[12, 30, 8, 8]], {
    gm: 'Drace\'s men have set steel bear traps under the snow along the lodge trail. DC 13 Perception spots one; DC 13 Dexterity save or 2d4 piercing and restrained (DC 13 Strength to open). A wolf foreleg is still in one.',
    label: [14, 33],
  });
  b.prop('trap-bear', 13, 32, 0, { gm: true }).prop('trap-bear', 16, 35, 0, { gm: true }).prop('trap-bear', 18, 31, 0, { gm: true }).prop('bones', 15, 33);

  b.area('Glasswater Tarn', [[25, 28, 13, 9]], {
    read: 'A round lake, frozen as clear as a window. Under the ice, fish hang still in the green dark. In the middle, a ring of black water steams where someone keeps a hole open.',
    gm: 'The ice is safe except around the fishing hole: anyone who runs or fights within 10 feet of it makes a DC 11 Dexterity save or breaks through into freezing water (1d6 cold damage each turn until out, DC 12 Athletics to climb). Wolves avoid the tarn: a safe shortcut to the ford.',
    label: [31, 32],
  });
  b.water(30, 32, 2, 1, true);
  b.props_('frozen-pond', [[27, 30], [35, 34], [28, 35]]).props_('ice-thin', [[29, 32], [32, 33]]).prop('fishing-net', 33, 31).prop('reeds', 37, 33).prop('reeds', 25, 30).prop('ice-block', 34, 29);
  b.building('Penhallow hut', 20, 34, 5, 4, {
    read: 'A hut half buried in snow, smoke leaking from a tin chimney. Inside, every inch is hung with traps, snares, dried herbs and the skulls of small animals.',
    gm: 'Old Aggie Penhallow, trapper and hermit. She trapped this woodland for fifty years and never took from the Stand. She knows the sleep-song, the secret way behind the Frozen falls, and what sleeps under the grove (see Aggie Penhallow). She will not leave her stove.',
    doors: [[24, 36, 'e']],
    windows: [[22, 34, 'n']],
  });
  b.prop('stove', 21, 35).prop('rocking-chair', 22, 36).prop('herbs-drying', 23, 35).prop('cot', 21, 36);
  b.light(21, 35, 10, 15);

  // ======================= THE WOLFBACK AND THE DEN =======================
  b.area('Wolfback trail', [[22, 15, 15, 8]], {
    read: 'The path climbs between snow-covered boulders to the foot of a grey ridge. The wind has scoured the stone bare, and the gap in the rock ahead smells of wolf.',
    gm: 'Three worgs and two wolves keep watch here: Hrimma\'s sentries. The worgs are clever and mean but just as hungry; a thrown haunch or a DC 13 Intimidation with fire makes them back off and howl to the den instead of fighting. Rough steps cut in the rock (stairs) climb to a lookout.',
    label: [28, 19],
  });
  b.props_('boulder-large', [[24, 17], [35, 20]]).props_('boulder', [[27, 21], [30, 16]]).prop('stairs-up', 26, 16).prop('skull-bleached', 33, 21).prop('snowdrift', 23, 21).prop('cairn', 29, 18);
  b.encounter('Worg sentries on the Wolfback', [22, 15, 15, 8], [['worg', 3], ['wolf', 2]], 'low');

  b.tunnel([[32, 16], [32, 13]], 2, { seed: 2612, mat: 'cave-floor' });
  b.cave('Den mouth', 32, 11, 3.2, 2.2, {
    seed: 2613, mat: 'cave-floor',
    read: 'The cave mouth is ringed with bones picked clean, and the floor is warm with the breath of many wolves.',
    gm: 'Wolves here growl but do not attack unless the heroes draw steel. A loud voice is heard in the den.',
  });
  b.prop('bone-heap', 30, 11).prop('skull-bleached', 34, 12);
  b.tunnel([[31, 10], [30, 8]], 2, { seed: 2614, mat: 'cave-floor' });
  b.cave("Hrimma's den", 30, 6, 5.5, 3.5, {
    seed: 2615, mat: 'cave-floor',
    read: 'A low cave full of grey shapes, ribs showing through their fur. At the back, on a ledge of stone, lies a wolf as white as fresh snow and as big as a pony. She lifts her head, and speaks. "You took long enough."',
    gm: 'Hrimma, the old white wolf of the Stand, with two dire wolves and four wolves. She speaks Common (the grove\'s gift, long ago). She has Linnet, safe and warm in the pup hollow. Her offer: kill the Hush or sing it back to sleep, and the cub goes home and the pack goes back to the deep woods. Fighting her is a high fight and the pack flees when she drops below half her hit points.',
  });
  b.props_('bones', [[27, 5], [33, 7]]).prop('straw-bed', 25, 6).prop('rug-pelt', 29, 4).prop('skeleton-lying', 34, 4).prop('gm-treasure', 26, 7, 0, { gm: true });
  b.encounter("Hrimma's den", [25, 3, 11, 7], [['direWolf', 3], ['wolf', 4]], 'high');
  b.tunnel([[35, 5], [38, 4]], 2, { seed: 2616, mat: 'cave-floor' });
  b.cave('Pup hollow', 39, 4, 2.8, 2.2, {
    seed: 2617, mat: 'cave-floor',
    read: 'In a hollow lined with moss and fur, a small girl sleeps curled among five fat wolf pups, her arm around a muddy brown dog.',
    gm: 'Linnet and Bramble, unhurt. Linnet says the big white wolf "carried me like a kitten" when she fell in a drift. She does not want the wolves hurt. A narrow crack at the back (one square wide) leads to the Frozen falls.',
  });
  b.prop('straw-bed', 39, 4).prop('rug-pelt', 40, 5).prop('bones', 37, 3);
  b.tunnel([[41, 5], [42, 8]], 1, { seed: 2618, mat: 'cave-floor' });
  b.room('Frozen falls', 41, 8, 3, 3, {
    mat: 'ice',
    read: 'Behind a curtain of frozen waterfall the light turns blue. You can see the river through the ice, like looking out of a window.',
    gm: 'Secret: from outside, the falls look like a solid wall of ice (DC 15 Perception, or Aggie tells you). From inside, a hero can chip a way out in a minute. It opens onto the frozen river right below the sacred grove: the quiet back way.',
  });
  b.floor(44, 9, 1, 1, 'ice').door(44, 9, 'e', 'secret');
  b.props_('ice-block', [[41, 8], [43, 10]]).prop('cave-crystals', 42, 9);
  b.light(42, 9, 5, 15, '#bfe3ff');

  b.area('Hollowrun river', [[44, 22, 8, 8]], {
    read: 'The river runs black and fast between shelves of ice, smoking in the cold. You can hear it grinding stones on the bottom.',
    gm: 'The Hollowrun never freezes in the middle. Swimming it: DC 12 Athletics, and 1d6 cold damage each round in the water. It is frozen solid above the bend (north), at the ford and at the millpond. Crossings: the mill bridge, the ford, the fallen log and the ice above the bend.',
    label: [47, 26],
  });
  b.floor(46, 19, 5, 1, 'wood-planks');
  b.area('Fallen-log crossing', [[45, 18, 7, 3]], {
    gm: 'A storm-felled pine lies across the river. Crossing it in the dark: DC 10 Acrobatics, or slip into the water. Wolf tracks cross it both ways.',
    label: [48, 19],
  });
  b.props_('log-fallen', [[47, 19], [49, 19]]).prop('stump', 45, 19).prop('snowdrift', 51, 18);

  // ======================= THE MILL AND THE LOWER CAMP =======================
  b.area('Millpond', [[34, 44, 13, 8]], {
    read: 'Above the mill dam the river spreads into a wide pond, frozen white. In the middle of it a wolf is eating something, and it does not look up.',
    gm: 'Four starving wolves (two of them dire wolves) have dragged a dead elk onto the ice. They fight only to keep their meal. Leave them be (DC 12 Animal Handling to edge past) and they ignore the heroes. In a fight, the ice near the dam is thin: DC 11 Dexterity save for anyone knocked prone there or they fall through.',
    label: [40, 47],
  });
  b.props_('frozen-pond', [[36, 46], [44, 45]]).props_('ice-thin', [[42, 50], [39, 50]]).prop('bone-heap', 40, 47).props_('debris-wood', [[40, 52], [44, 52]]).prop('reeds', 35, 49);
  b.encounter('Thin ice on the millpond', [34, 44, 13, 8], [['wolf', 2], ['dire-wolf', 2]], 'moderate');

  b.building('Saw-and-Wheel sawmill', 46, 54, 10, 8, {
    mat: 'wood-planks',
    read: 'A tall shed of raw boards, groaning in the wind. The great saw stands still, its blade furred with frost. Sawdust and snow lie together on the floor.',
    gm: 'The waterwheel is frozen in place. Foreman Ulric Kettering is here alone, drinking. His tally book (handout) sits in the office corner: it proves he sold the Warden Pine. DC 12 Insight shows he is sick with guilt; DC 13 Persuasion (or showing him the book) and he confesses everything and hands over the Warden\'s cone.',
    doors: [[46, 57, 'w'], [55, 58, 'e'], [50, 61, 's']],
    windows: [[49, 54, 'n'], [53, 54, 'n']],
  });
  b.prop('winch', 47, 57).prop('sawhorse', 50, 57).props_('log-pile', [[48, 55], [52, 55]]).prop('workbench', 53, 59).prop('tool-wall', 54, 56).prop('grindstone', 48, 60).prop('desk', 53, 57).prop('lantern-hanging', 51, 58);
  b.light(51, 58, 10, 15);
  b.area('Mill bridge', [[38, 62, 8, 3]], {
    gm: 'A sturdy plank bridge below the dam. The river under it runs fast and black. Anyone knocked off falls into the water.',
    label: [42, 63],
  });
  b.floor(38, 62, 8, 2, 'wood-planks');
  b.props_('mooring-post', [[38, 62], [45, 63]]).prop('lantern-standing', 39, 63);
  b.light(39, 63, 10, 15);
  b.area('Mill yard', [[56, 55, 7, 9]], {
    gm: 'Churned mud and log-sledges. The sledge runners point north-east: the great log came from the Stand, not the upper camp (DC 11 Survival).',
    label: [59, 58],
  });
  b.mud(56, 56, 5, 6);
  b.prop('wagon', 58, 56).props_('log-pile', [[60, 61], [57, 62]]).prop('mud-patch', 57, 58);

  b.area('Lower logging camp', [[57, 63, 20, 15]], {
    read: 'Bunkhouse, cookhouse and stacks of logs, all buried in snow. The loggers left in a hurry: an axe still stands in a chopping block, and a pot of porridge has frozen solid on a cold fire.',
    gm: 'Empty since the loggers fled into the village. Something is moving in the cookhouse. The sledge with the great log stands at the south end of camp.',
    label: [66, 64],
  });
  b.props_('log-pile', [[58, 66], [58, 70], [75, 65]]).prop('campfire-cold', 62, 65).prop('cooking-pot-fire', 63, 65).prop('stump', 60, 64).prop('sawhorse', 74, 70).prop('tool-crate', 76, 72).prop('snowdrift', 75, 68);
  b.building('Bunkhouse', 64, 66, 10, 6, {
    read: 'Bunks for twenty men. Clothes, dice and letters home lie where they were dropped.',
    gm: 'A good place for a short rest; the door bars. Under Ulric\'s bunk (DC 10 Investigation): the loggers\' pay box, 30 gp, and a sketch of the Warden Pine with nine rings drawn round it.',
    doors: [[68, 66, 'n'], [64, 69, 'w']],
    windows: [[71, 66, 'n'], [73, 69, 'e']],
  });
  b.props_('bunk-bed', [[65, 67], [67, 70], [69, 70], [71, 70]]).prop('stove', 72, 67).prop('table-trestle', 68, 68).prop('footlocker', 65, 70);
  b.building('Cookhouse', 70, 57, 7, 6, {
    read: 'The door hangs off one hinge. Inside, flour sacks are torn open, barrels smashed, and something huge and brown is licking the inside of a lard bucket.',
    gm: 'A brown bear, starved out of its winter sleep because the cold under the Stand has driven off everything it would eat in spring. It wants food, not a fight: leave a haunch or a sack of oats and it ambles off. Cornered, it fights.',
    doors: [[70, 60, 'w', 'open']],
  });
  b.prop('hearth-oven', 75, 58).prop('kitchen-table', 73, 60).props_('flour-sacks', [[71, 58], [75, 61]]).prop('broken-furniture', 72, 61).prop('barrel', 74, 58).prop('pot-rack', 71, 61);
  b.encounter('The bear in the cookhouse', [70, 57, 7, 6], [['brown-bear', 1]], 'low');
  b.area('The Warden Pine log', [[59, 73, 13, 4]], {
    read: 'A single tree trunk lies on a sledge as long as a house. It is wider than a cart. Where it was cut, the rings are so many and so fine that your eyes slide off them, and the sap has frozen into blue ice.',
    gm: 'The Warden Pine, eldest of the Stand of Nine, felled at first snow. The cut is wrong: its sap is frozen solid while every other log bleeds amber (DC 12 Arcana or Nature: something drew the warmth out of it from below). One branch still bears a cone the size of a man\'s head, unless Ulric took it. The cone is the key to the sleep-song.',
    label: [64, 75],
  });
  b.props_('log-fallen', [[60, 75], [62, 75], [64, 75], [66, 75], [68, 75]]).prop('cart', 70, 75, 90).prop('rope-coil', 61, 74).prop('ice-block', 59, 75);

  // ======================= THE SPRING, THE FORD AND THE UPPER CAMP =======================
  b.area('Frozen ford', [[39, 32, 11, 5]], {
    gm: 'The river spreads wide and shallow here, and it froze. Safe to cross; the ice groans but holds. Wolf and elk tracks cross here in their dozens.',
    label: [44, 34],
  });
  b.props_('ice-thin', [[41, 34]]).prop('snowdrift', 48, 33).prop('reeds', 40, 32);
  b.area('Smoking spring', [[47, 37, 10, 9]], {
    read: 'Steam rises from a little pool among the trees, and the snow around it has melted into black mud. The air is almost warm. Small tracks are everywhere: hares, foxes, birds.',
    gm: 'A warm spring, the one place the cold from the Stand has not reached. Every small animal for miles has crowded here. A child\'s red mitten lies in the mud by a set of huge white wolf tracks (DC 10 Survival): this is where Hrimma found Linnet.',
    label: [51, 40],
  });
  b.prop('steam-vent', 52, 41).props_('mud-patch', [[49, 39], [54, 44]]).prop('puddle', 50, 43).prop('reeds', 55, 40).prop('bush', 48, 44);
  b.light(52, 41, 5, 15, '#ffe6b0');

  b.area('Logging road', [[61, 44, 5, 12]], {
    gm: 'The sledge road from the lower camp to the upper camp. Deep ruts, frozen hard. Halfway up, a dead elk lies drained of all warmth, its eyes frosted white (DC 12 Nature: no wolf killed this; it froze from the inside).',
    label: [63, 49],
  });
  b.prop('skeleton-lying', 64, 48).prop('snowdrift', 61, 52).prop('milestone', 62, 54);

  b.area('Upper camp', [[55, 30, 17, 12]], {
    read: 'Tents sag under the snow. Every surface is crusted in frost feathers as long as your finger, and the air bites the back of your throat. A logger sits by a dead fire, very still, his hands held out to the ashes.',
    gm: 'The loggers fled from here. The man at the fire is frozen dead. Four ice mephits, born from the cold seeping out of the Stand, are playing among the tents; they giggle, ambush stragglers and flee if two of them pop. They speak Primordial and boast that "the Hush" is waking and will make the whole world quiet.',
    label: [62, 36],
  });
  b.props_('tent', [[57, 31], [66, 32], [58, 38]]).prop('lean-to', 69, 37).prop('campfire-cold', 62, 35).prop('skeleton-seated', 63, 35).props_('stump', [[60, 33], [67, 39], [56, 35]]).prop('tool-crate', 69, 31).prop('sawhorse', 65, 39).props_('ice-block', [[59, 36], [70, 34]]).prop('gm-treasure', 69, 31, 0, { gm: true });
  b.encounter('Rime-imps in the upper camp', [55, 30, 17, 12], [['ice-mephit', 4]], 'low');

  b.area('The cut', [[56, 20, 12, 10]], {
    read: 'A long, ugly lane of stumps leads uphill, every one cut low and clean. At the end of it, nine dark shapes stand against the sky, and one is missing.',
    gm: 'Ulric\'s men cut this lane to drag the Warden Pine out. The Stand is just beyond. It is very quiet: no birds, no wind.',
    label: [61, 25],
  });
  b.props_('stump', [[58, 27], [64, 26], [59, 23], [65, 22], [57, 21], [66, 28]]).prop('log-fallen', 60, 28).prop('snowdrift', 66, 24);

  // ======================= THE NINEFOLD STAND =======================
  b.area('The Stand of Nine', [[53, 4, 13, 15]], {
    read: 'Eight enormous trees stand in a ring, older than any town, their bark grey and grooved like old stone. Between them the snow is untouched. In the middle of the ring is a raw, pale stump as wide as a cottage, and from the dark gap among its roots comes a breath of cold that stops your heart for a beat.',
    gm: 'The sacred grove. Wynfrith the dryad lives in the westmost tree; she is grieving and angry, and her trees attack anyone who smells of sawdust or carries an axe (see the grieving trees). Speaking gently, or carrying the Warden\'s cone in plain sight, lets the heroes talk to her instead.',
    label: [59, 11],
  });
  const ring: [number, number][] = [[56, 7], [61, 5], [65, 7], [54, 12], [66, 15], [55, 17], [60, 18], [64, 18]];
  b.props_('tree-oak', ring).prop('stone-circle', 60, 11).props_('standing-stone', [[57, 10], [63, 13]]).prop('rune-stone', 58, 15).prop('offering-bowl', 61, 10).props_('candles', [[59, 13]]);
  b.encounter('The grieving trees', [53, 4, 13, 15], [['awakened-tree', 1], ['awakened-shrub', 3]], 'low');
  b.area('The stump of the Warden Pine', [[63, 11, 4, 3]], {
    gm: 'The stump\'s roots open into a dark slope down into the knoll: the way to the Hollow. Planting the Warden\'s cone in the soft heart of the stump is the first step of the sleep-song.',
    label: [64, 12],
  });
  b.prop('stump', 64, 12).prop('chasm-edge', 65, 13);
  b.tunnel([[66, 13], [68, 10], [70, 8]], 2, { seed: 2619, mat: 'cave-floor' });
  b.tunnel([[76, 16], [75, 13], [74, 8]], 1, { seed: 2620, mat: 'ice' });
  b.cave('The Hollow under the roots', 73, 6, 4.8, 3.8, {
    seed: 2621, mat: 'ice', wobble: 0.12,
    read: 'Roots as thick as your body twist through the walls of an ice cave, glittering with frost. Bones of elk and deer lie in heaps, and on a shelf of blue ice a white dragon no longer than a horse uncoils, yawns, and looks at you with eyes like frozen puddles.',
    gm: 'Hushwing, a white dragon wyrmling that slept here in its egg for three hundred years, held in the grove\'s roots, until the Warden Pine was cut. It is starving, spiteful and very young. Three ice mephits serve it. It talks (Draconic, a little Common) and boasts; it wants the whole forest quiet and still. See Hushwing for the sleep-song.',
  });
  b.props_('bone-heap', [[71, 4], [75, 8]]).props_('ice-block', [[70, 7], [76, 5]]).prop('cave-crystals', 74, 3).prop('dragon-hoard', 75, 5).prop('skull-bleached', 70, 9).prop('gm-treasure', 76, 6, 0, { gm: true });
  b.light(73, 6, 10, 20, '#a8dcff');
  b.encounter('The Hush beneath the roots', [69, 3, 9, 7], [['white-dragon-wyrmling', 1], ['ice-mephit', 3]], 'high');

  // ---------- the wild woods: trees and drifts everywhere nothing else is ----------
  const keepOut = [
    [4, 44, 33, 30], [11, 72, 13, 8], [3, 13, 18, 19], [11, 29, 10, 10], [18, 27, 21, 11], [13, 36, 19, 10], [21, 14, 17, 10],
    [33, 43, 15, 10], [36, 53, 28, 13], [55, 55, 24, 24], [38, 30, 20, 17], [53, 28, 21, 15], [55, 19, 14, 11], [52, 3, 16, 17],
    [60, 43, 7, 14], [43, 17, 10, 5], [62, 11, 6, 6], [73, 12, 5, 6],
  ];
  const kept = (x: number, y: number) => keepOut.some(([a, c, w, h]) => x >= a && y >= c && x < a + w && y < c + h);
  const used = new Set<string>();
  const trees = ['tree-fir-snow', 'tree-fir-snow', 'tree-fir-snow', 'tree-pine', 'tree-dead', 'snowdrift', 'tree-birch'];
  for (let i = 0; i < 260; i++) {
    const x = 2 + Math.floor(r() * 76), y = 1 + Math.floor(r() * 78);
    const k = `${x},${y}`;
    if (used.has(k) || trodden.has(k) || kept(x, y) || b.cellAt(x, y) !== 1) continue;
    if (b.cellAt(x + 1, y) === 2 || b.cellAt(x - 1, y) === 2) continue;
    used.add(k);
    b.prop(trees[Math.floor(r() * trees.length)], x, y, Math.floor(r() * 4) * 90);
  }
  b.props_('boulder', [[45, 4], [21, 30], [36, 66]]).prop('road-shrine', 33, 39).prop('signpost', 21, 40).prop('signpost', 62, 55);
  b.note(18, 77, 'Night falls as the heroes arrive. Dawn comes in about ten hours. At dawn, Drace\'s men march on the den with fire.');
  b.note(44, 9, 'Secret door: the frozen waterfall. Behind it, a crack climbs to the pup hollow.');

  return b.build();
}

export const WINTERHOLLOW_WOLVES: Adventure = {
  id: 'winterhollow-wolves',
  title: 'The Wolves of Winterhollow',
  tagline: 'Wolves circle a snowed-in logging village and a child is missing. But the wolves are running from something.',
  levels: '2',
  sessions: '1 session (3-4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'winter', 'survival', 'wolves', 'can be talked out'],
  pitch:
    'Winterhollow is a logging village deep in the pines, snowed in since the first frost. For nine nights the wolves have come out of the forest at dark and circled the palisade, closer every night. Yesterday a woodcutter\'s daughter, Linnet, went out after her dog and did not come back. Tonight is the longest night of the year. The gate opens for you just as the first howl rises behind you.',
  secret:
    'The wolves are not the enemy. At first snow, foreman Ulric Kettering secretly sold the Warden Pine, the eldest tree of the sacred Stand of Nine, to Varn Drace, a lowland fur and timber buyer. The Warden\'s roots held a sleeping white dragon\'s egg under the grove, cold and quiet for three hundred years. With the tree gone, the wyrmling Hushwing woke. It drains the warmth out of everything it hunts, and its cold seeps through the forest: the elk and deer have fled, ice mephits play in the empty logging camp, and the starving wolf pack has been driven out of the deep woods toward the only food left, the village. The pack is led by Hrimma, the old white wolf who guards the Stand. She found Linnet half frozen and carried her to her den. Now she holds the child as a bargain: the two-legs woke the Hush, so the two-legs must put it down. Why now: the longest night, when Hushwing is strongest and the pack is desperate. Deadline: at dawn Varn Drace and his hunters will burn the den out to take Hrimma\'s white pelt, with Linnet inside.',
  hooks: [
    'The heroes are travelling the forest road when the snow closes it behind them. Winterhollow\'s gate is the only shelter for twenty miles.',
    'Headwoman Hildy Oakshott sent a rider to the lowland road for help before the snows. The heroes are the ones who answered.',
    'Old Aggie Penhallow, a trapper, left a message at the last inn: "The Stand has gone quiet. Somebody come." One of the heroes owes her a favour.',
  ],
  tips: [
    'Keep the cold on the table. Outdoors without furs, each hour is a DC 10 Constitution save or one level of Exhaustion. The village gives furs to anyone who helps.',
    'Count the night. Dusk to dawn is about ten hours; travel between areas takes about an hour. Say the hour out loud when the players set out. At dawn Drace\'s men reach the den.',
    'Every wolf fight ends when a third of the wolves fall or someone throws them meat. They are starving, not evil. Players who notice this should be rewarded.',
    'There are three ways to the Stand: the cut from the logging camps, the fallen log from the Wolfback, and the secret way behind the Frozen falls from Hrimma\'s den. Let the players find their own.',
    'Short on time? Skip the Upper camp and the Penhallow hut, and let Hrimma tell the heroes about the Hush and the sleep-song.',
    'The ending is hopeful by design. Even a rough night should end with a sunrise, a child carried home, and the first birdsong in weeks.',
  ],
  npcs: [
    {
      id: 'pf_wwhhildy', name: 'Hildy Oakshott', title: 'Headwoman of Winterhollow', kind: 'npc', art: 'commoner', shared: true,
      wants: 'Linnet home and her village alive till spring, with no more of her loggers lost.',
      knows: 'The wolves started nine nights ago; the loggers came down from the upper camp a week ago, frostbitten and scared; Ulric has been drinking alone at the mill.',
      voice: 'Low and steady, never wastes a word, ends orders with "please" like a hammer blow.',
      appearance: 'A tall, grey-braided woman in a bearskin cloak, with an axe-handle for a walking stick.',
      backstory: 'Felled trees for thirty years before the village made her headwoman. She has buried a husband and two brothers in these woods.',
      gmNotes: 'Pays 25 gp each for Linnet\'s return, gives furs and three haunches from the smokehouse. If she learns of the Warden Pine, she seizes the log for the village and banishes Ulric unless the heroes speak for him.',
    },
    {
      id: 'pf_wwhedric', name: 'Edric Brennick', title: 'woodcutter, Linnet\'s father', kind: 'npc', art: 'farmer', monsterId: 'commoner', shared: true,
      wants: 'His daughter back, and every wolf in the forest dead for taking her.',
      knows: 'Linnet chased Bramble the dog into the trees yesterday afternoon. He knows the postern behind the smokehouse.',
      voice: 'Hoarse from shouting her name all night. Swings between fury and pleading.',
      appearance: 'A big, red-bearded man with frost in his beard, gripping a felling axe with white knuckles.',
      gmNotes: 'He insists on coming. At the den he may attack Hrimma and ruin the bargain unless a hero keeps him calm (DC 12 Persuasion, or he sees Linnet asleep and safe).',
    },
    {
      id: 'pf_wwhlinnet', name: 'Linnet Brennick', title: 'the missing girl', kind: 'npc', art: 'child', shared: true,
      wants: 'For everyone to stop shouting, and to keep one of the pups.',
      knows: 'The white wolf talks. She saw "a white lizard with wings" fly over the Stand the day the big tree fell.',
      voice: 'Solemn and matter-of-fact, like a much older person, until she laughs.',
      appearance: 'A nine-year-old in a too-big red coat with one mitten, her hair full of wolf fur.',
      gmNotes: 'Unhurt. Brave enough to walk home on her own feet, and she will try to stop anyone hurting Hrimma.',
    },
    {
      id: 'pf_wwhulric', name: 'Ulric Kettering', title: 'logging foreman', kind: 'npc', art: 'thug', monsterId: 'tough',
      wants: 'For nobody ever to find out what he did, and for the guilt to stop.',
      knows: 'He sold the Warden Pine to Varn Drace for 40 gold crowns. The night it fell, the frost spread from the stump "like ink in water". He kept one of its cones.',
      voice: 'Gruff, slurred, keeps saying "it was only a tree".',
      appearance: 'A barrel-chested man with a broken nose, his eyes red from drink and smoke.',
      backstory: 'Took the money to pay off the village\'s debt to a lowland saw-merchant, and kept none of it.',
      gmNotes: 'If confessed and forgiven, he comes along and fights (tough stat block) to make it right. He has the Warden\'s cone in his coat.',
    },
    {
      id: 'pf_wwhvarn', name: 'Varn Drace', title: 'fur and timber buyer', kind: 'monster', art: 'bandit-captain', monsterId: 'banditCaptain',
      wants: 'The white wolf\'s pelt (500 gp from his furrier), and the Warden Pine log floated down to the lowlands at thaw.',
      knows: 'Where the den is. That the old lord of the lodge forbids wolf-hunting. Nothing about the dragon.',
      voice: 'Smooth and amused, calls everyone "friend", talks about money as if it were weather.',
      appearance: 'A lean man in a white fox-fur coat, with a long hunting knife and very clean boots.',
      gmNotes: 'Greedy, not cruel. Learning a child is in the den makes him hesitate; learning there is a dragon makes him greedy in a new direction. A DC 14 Persuasion (advantage if he is offered the wyrmling\'s hide) and he calls off the burning and may even join the climax. Surrenders at a third of his hit points.',
    },
    {
      id: 'pf_wwhaggie', name: 'Aggie Penhallow', title: 'trapper of Glasswater Tarn', kind: 'npc', art: 'hedge-witch', shared: true,
      wants: 'The Stand made whole and quiet again, and her hearing back.',
      knows: 'Something cold sleeps under the Stand, and the Warden\'s roots held it. The sleep-song, taught her by the grove when she was a girl. The way behind the Frozen falls.',
      voice: 'Shouts because she is half deaf, swears by "frost and fishbones".',
      appearance: 'A tiny, ancient woman in layers of patched fur, with a clay pipe and one eye clouded white.',
      gmNotes: 'Teaches the sleep-song to anyone who sits and drinks her terrible pine tea. Hrimma and Wynfrith both trust her name.',
    },
    {
      id: 'pf_wwhhrimma', name: 'Hrimma', title: 'the white wolf of the Stand', kind: 'monster', art: 'winter-wolf', monsterId: 'direWolf',
      wants: 'The Hush gone, the deer back, and her pack fed and home in the deep woods.',
      knows: 'The Hush sleeps by day in the hollow under the stump, hunts at night and grows bolder. The secret crack from the pup hollow to the Frozen falls.',
      voice: 'Speaks slowly, like wind in a chimney, never says "I", always "we".',
      appearance: 'A wolf as big as a pony, white as fresh snow, with one torn ear and pale gold eyes.',
      backstory: 'The grove gave her speech long ago, so she could guard the Stand. She has guarded it through five lifetimes of men.',
      gmNotes: 'Use the dire wolf stat block with 50 hit points. She keeps her word. If the heroes promise to deal with the Hush, she lets Linnet go at once and sends a wolf to guide them (it fights beside them in the climax).',
    },
    {
      id: 'pf_wwhwynfrith', name: 'Wynfrith', title: 'dryad of the Stand of Nine', kind: 'monster', art: 'dryad', monsterId: 'dryad',
      wants: 'Her sister-tree back, which cannot be. Failing that, a new Warden planted, and the axes kept away forever.',
      knows: 'How the sleep-song works. That the Hush cannot be put back to sleep while it is strong, only once it is hurt.',
      voice: 'A whisper with a creak in it, like a branch under snow. Asks questions instead of answering.',
      appearance: 'A tall, thin woman of grey bark and frost, with green eyes and hair of pine needles.',
      gmNotes: 'Her awakened trees attack anyone who smells of sawdust. Calm her with DC 12 Persuasion or by showing the Warden\'s cone. If calmed, she sings with the heroes in the climax, and her trees fight the mephits.',
    },
    {
      id: 'pf_wwhhushwing', name: 'Hushwing', title: 'the Hush, a white dragon wyrmling', kind: 'monster', art: 'dragon-white-wyrmling', monsterId: 'whiteDragonWyrmling',
      wants: 'Everything quiet and still and frozen, and to eat until it is not hungry any more.',
      knows: 'Very little: it is three hundred years old and three weeks awake. It knows the forest is afraid of it, and likes that.',
      voice: 'A hiss like snow sliding off a roof. Speaks in short, greedy sentences: "Mine. Cold. Quiet now."',
      appearance: 'A white dragon the size of a horse, lean and spiky, with frost smoking from its jaws and a cracked shell still stuck to one wing.',
      gmNotes: 'The sleep-song: plant the Warden\'s cone in the stump\'s heart (an action, above the Hollow), then someone who knows the song sings it for three rounds in the Hollow (their action each round). At the end of the third round, if Hushwing has 16 hit points or fewer, it makes a DC 13 Wisdom save (disadvantage if Wynfrith sings too); on a fail it falls asleep and the roots close over it for another three hundred years. Otherwise, the heroes can simply kill it. It flees by burrowing into the ice if reduced to 5 hit points.',
    },
  ],
  handouts: [
    { id: 'slate', title: "Linnet's slate", text: 'GONE TO GET BRAMBLE.\nHE RAN AFTER A HARE.\nBACK BEFORE DARK. PROMISE.\n— L.\n(under it, a drawing of a dog with very long ears)' },
    { id: 'tally', title: "Ulric's tally book, last page", text: 'Week of first snow.\n1 pine, the old one, 9 ft through. Sold to V. Drace, 40 crowns gold.\nDebt to Marrick paid in full.\nNobody to know. Burn this page.\n(he did not burn it)' },
    { id: 'bounty', title: 'A furrier\'s notice', text: 'WANTED\nOne white wolf pelt, whole, head and paws.\nSaid to den on the Wolfback, north of Winterhollow.\n500 gp to the bearer.\nDrace & Daughters, Furriers, at the Low Bridge.' },
    { id: 'grove-stone', title: 'Carved on the stone in the Stand', text: 'NINE STAND\nONE SLEEPS\nWHILE THE WARDEN HOLDS\nTHE COLD HOLDS STILL\nCUT NOT\nSING THE CONE TO EARTH\nAND THE ROOTS WILL HOLD AGAIN' },
  ],
  chapters: [
    {
      id: 'night', title: 'The Longest Night', level: 2,
      summary: 'A snowed-in logging village, a wolf pack at the gates and a missing child. Out in the frozen forest: a sawmill on a black river, a poachers\' lodge, an empty logging camp, a wolf den in the rocks and a sacred grove with something cold under its roots.',
      goal: 'Bring Linnet home before dawn, and find out what is driving the wolves.',
      map: winterhollow,
      npcs: [
        { npc: 'pf_wwhhildy', x: 15, y: 50 },
        { npc: 'pf_wwhedric', x: 21, y: 53 },
        { npc: 'pf_wwhulric', x: 52, y: 57 },
        { npc: 'pf_wwhvarn', x: 15, y: 22, hidden: true },
        { npc: 'pf_wwhaggie', x: 22, y: 35 },
        { npc: 'pf_wwhhrimma', x: 30, y: 5, hidden: true },
        { npc: 'pf_wwhlinnet', x: 40, y: 4, hidden: true },
        { npc: 'pf_wwhwynfrith', x: 55, y: 11, hidden: true },
        { npc: 'pf_wwhhushwing', x: 73, y: 6, hidden: true },
      ],
      scenes: [
        {
          room: 'Wolf-run clearing', title: 'Wolves at the gate', encounter: 'Wolves at the north gate',
          read: 'The gate slams behind you, and the howling stops. In the silence you hear claws on wood. Then six grey shapes come out of the trees together, low and fast, straight at the wall.',
          gm: 'The heroes fight from the wall-walk (half cover) or go out through the gate. The wolves try to dig under the gate and flee when two fall, or when meat is thrown. A DC 12 Survival check on a dead wolf: it is starving, and its paws are frost-bitten black, as if it came from somewhere far colder than here.',
        },
        {
          room: 'Oakshott longhouse', title: 'The council by the fire', handout: 'slate',
          read: 'Every voice in the longhouse stops when you come in, snow on your shoulders and wolf blood on your boots. A tall grey-haired woman stands up from the high seat. "Well," she says. "You can fight. Can you find?"',
          gm: 'Hildy asks the heroes to find Linnet before dawn and offers 25 gp each, furs and meat. Edric shows the slate and insists on coming. The frostbitten loggers in the shrine whisper of the cold from the Stand. Point the heroes three ways: the wolves\' tracks (north to the Wolfback), the loggers\' trouble (east to the mill), and Drace\'s lodge (north-west), whose hunters "know these woods".',
          treasure: 'Furs for everyone, three haunches of smoked meat, and a potion of healing each from the shrine keeper.',
        },
        {
          room: 'Saw-and-Wheel sawmill', title: 'The foreman at the frozen mill', handout: 'tally', encounter: 'Thin ice on the millpond',
          read: 'The great wheel is a frozen sculpture of ice and wood. Inside the mill a lantern burns, and a big man sits on a log with a bottle, staring at the saw blade.',
          gm: 'On the way, the wolves on the millpond guard their kill: let them eat or fight them. Ulric is drunk and guilty. The tally book proves he sold the Warden Pine. Confessing, he says the frost spread from the stump "like ink in water" and gives up the Warden\'s cone. He begs the heroes not to tell Hildy.',
        },
        {
          room: 'The Warden Pine log', title: 'The great log', encounter: 'The bear in the cookhouse', optional: true,
          read: 'A tree that should have outlived the village lies on a sledge in the snow. Its rings shine faintly blue where it was cut.',
          gm: 'The starving bear in the cookhouse can be fed or fought. The log shows something drew the warmth out of the tree from below (DC 12 Arcana or Nature). If Ulric kept no cone, one still hangs on a high branch here (DC 12 Athletics to climb the trunk).',
          treasure: 'The loggers\' pay box under Ulric\'s bunk: 30 gp.',
        },
        {
          room: 'Fenwold Lodge', title: "The poachers' lodge", encounter: 'Poachers at Fenwold Lodge', handout: 'bounty',
          read: 'Laughter and the smell of roast meat spill out of the old lodge. A man in a white fox coat opens the door before you knock. "Friends! Out on a night like this? Come in, come in. Mind the dogs."',
          gm: 'Varn Drace is friendly and careful. He wants the white wolf\'s pelt and plans to burn the den at dawn. Heroes can talk him out of it, sabotage the oil sledge in the yard, steal the evidence from the hidden pelt store (proof of poaching on a lord\'s land is good leverage), or fight. Mind the bear traps on the trail.',
          treasure: 'Drace\'s strongbox: 80 gp and a silver hunting horn (25 gp). Hidden pelt store: two potions of resistance (cold) and furs worth 60 gp.',
        },
        {
          room: 'Penhallow hut', title: 'Tea with Aggie', optional: true,
          read: 'The door opens a crack, and a single eye looks you up and down. "Speak up! And if you\'re from the mill, keep walking."',
          gm: 'Aggie knows what sleeps under the Stand and teaches the sleep-song in return for listening to her stories (ten minutes). She tells of the secret way: the crack behind the Frozen falls, which leads from the river ice right up into the wolves\' den. Crossing the tarn to reach her is safe if the heroes keep away from the fishing hole.',
          treasure: 'A pouch of pine-resin salve (works as a potion of healing, one use) and a lantern of good tallow.',
        },
        {
          room: 'Upper camp', title: 'The frozen camp', encounter: 'Rime-imps in the upper camp', optional: true,
          read: 'Frost feathers coat every tent rope. A man sits at a dead fire with his hands held out to it, and does not turn when you call.',
          gm: 'The frozen logger, the ice mephits\' giggling ambush, and on the logging road a dead elk frozen from the inside. The mephits boast about "the Hush" if one is caught. The cold gets worse toward the cut.',
          treasure: 'In the tool crate: a fine felling axe (counts as a greataxe) and a flask of brandy.',
        },
        {
          room: 'Wolfback trail', title: 'The sentries on the Wolfback', encounter: 'Worg sentries on the Wolfback',
          read: 'Yellow eyes watch from the rocks above the trail. A worg as big as a calf steps into the path and lowers its head, and from the cave behind it comes a long, calling howl.',
          gm: 'The worgs fight, or back off for meat or fire. If they back off, they howl and the heroes are expected at the den: Hrimma waits to talk. If the heroes come in fighting, so does the den.',
        },
        {
          room: "Hrimma's den", title: "Hrimma's bargain", encounter: "Hrimma's den",
          read: 'Grey wolves part to let you through. The white wolf on the ledge watches you come, and her voice is like wind in a chimney. "Your cub is warm. She sleeps with our pups. But the Hush eats the deer and the elk, and our pups will starve. You woke it. You put it down."',
          gm: 'Hrimma offers the deal. She lets the heroes see Linnet in the pup hollow. Promise and she frees Linnet at once and sends a wolf guide; refuse and she keeps the child till they change their minds. If Drace\'s hunters arrive with fire (at dawn, or sooner if warned), the den panics and Hrimma fights to protect the pups. Edric may ruin everything. Fighting the whole den is very hard; she yields at half hit points.',
          treasure: 'Among old bones at the back of the den: a lost warden\'s silver-buckled belt (30 gp) and a spell scroll of Cure Wounds in a bone tube.',
        },
        {
          room: 'The Stand of Nine', title: 'The grieving grove', encounter: 'The grieving trees', handout: 'grove-stone',
          read: 'Snow falls in the ring of great trees without a sound. Then the bark of the nearest one splits open like an eye, and a voice like a creaking branch asks, "Did you bring axes?"',
          gm: 'Wynfrith\'s trees attack anyone who smells of sawdust (anyone who was in the mill or the log camp, unless they washed in the spring). Calm her with DC 12 Persuasion or by showing the Warden\'s cone; then she explains the sleep-song and joins the climax. The carved stone (handout) tells it too.',
        },
        {
          room: 'The Hollow under the roots', title: 'The Hush', encounter: 'The Hush beneath the roots',
          read: 'The cold here is a weight on your chest. Something white unrolls on a shelf of blue ice, and two eyes like frozen puddles open. "Warm things," it hisses. "Loud things. Make you quiet."',
          gm: 'The climax. Hushwing and three ice mephits. The heroes can kill it, or plant the cone in the stump and sing it back to sleep (see Hushwing). Allies that may help: Hrimma\'s wolf guide, Wynfrith, Ulric, even Varn Drace. Cold Breath is deadly at this level: spread out. The second way in, a narrow ice crack on the knoll\'s south side, lets a sneaky hero reach the hoard or flank.',
          treasure: 'Offerings the grove kept for centuries, now in the dragon\'s hoard: 140 gp in old coins frozen in ice, a silver circlet set with moonstones (75 gp), and the Warden\'s Axe, a +1 handaxe with an antler grip.',
        },
        {
          room: 'Village square', title: 'Sunrise',
          read: 'The sun comes up red over the pines as you carry Linnet through the gate. The bonfire is down to embers. Somewhere in the forest, for the first time in weeks, a bird starts to sing.',
          gm: 'Edric weeps. Hildy pays. Far off, the wolves howl once and go north. Decide Ulric\'s fate together, and what happens to the great log. Each hero gets a wolf-tooth token from Linnet.',
        },
      ],
      wrapUp: 'The Hush sleeps or is dead, the cold drains out of the forest, and the pack goes home to the deep woods. Linnet is back by the fire. The heroes reach level 3.',
    },
  ],
  ending:
    'Good ending: Linnet comes home at sunrise, the Hush is slain or sung back to sleep, and Hrimma\'s pack returns to the deep woods. The village plants the Warden\'s cone (or another one) in the Stand and swears never to cut there again; every midwinter they leave a haunch at the boundary stone, and no wolf touches their goats. If Drace was turned, the great log goes to rebuild the village\'s debt-free future. Bad ending: Linnet dies in the den fire or the Hush is left awake. Then the cold spreads a little further every winter, the wolves never stop coming, and by spring Winterhollow is abandoned. Next: Drace\'s furrier at the Low Bridge wants to know who spoiled her white pelt, and the wyrmling\'s cracked shell had a twin.',
};

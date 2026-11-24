// The Night Mill of Hagsmoor: a one-session folk-tale adventure for four level 1 heroes.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function hagsmoorAtMidnight() {
  const b = new MapBuilder('adv-hagsmoor-mill', 'Hagsmoor at midnight', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'wood' });
  const r = rng(7121);

  // A stream or race: shallow water along a line of points, with a deep middle if asked.
  const river = (pts: [number, number][], w: number, deep: boolean) => {
    const cells: [number, number][] = [];
    let [px, py] = pts[0];
    cells.push([px, py]);
    for (const [x, y] of pts.slice(1)) {
      while (px !== x || py !== y) {
        if (px !== x && (py === y || Math.abs(x - px) >= Math.abs(y - py))) px += Math.sign(x - px);
        else py += Math.sign(y - py);
        cells.push([px, py]);
      }
    }
    for (const [x, y] of cells) b.water(x - (w >> 1), y - (w >> 1), w, w, false);
    if (deep) for (const [x, y] of cells) b.water(x, y, 1, 1, true);
  };
  // A path of planks or dirt laid square by square (it bridges any water it crosses).
  const path = (pts: [number, number][], w: number, mat: string) => {
    let [px, py] = pts[0];
    b.floor(px, py, w, w, mat);
    for (const [x, y] of pts.slice(1)) {
      while (px !== x || py !== y) {
        if (px !== x && (py === y || Math.abs(x - px) >= Math.abs(y - py))) px += Math.sign(x - px);
        else py += Math.sign(y - py);
        b.floor(px, py, w, w, mat);
      }
    }
  };

  // ---------- the knoll: solid hill east of the mill, with the old diggings inside ----------
  b.rock(67, 0, 13, 37).rock(68, 37, 12, 33).rock(64, 24, 3, 4);
  b.rock(62, 61, 8, 9); // the barrow mound

  // ---------- the fen (south): mud, pools and reeds ----------
  for (let i = 0; i < 95; i++) {
    const x = Math.floor(r() * 64), y = 54 + Math.floor(r() * 25);
    b.mud(x, y, 2 + Math.floor(r() * 4), 1 + Math.floor(r() * 3));
  }
  for (let i = 0; i < 24; i++) {
    const x = 2 + Math.floor(r() * 74), y = 57 + Math.floor(r() * 21);
    if (x > 58 && y < 70) continue;
    b.pool(x, y, 1.5 + r() * 2, 1 + r() * 1.5);
  }
  b.pool(28, 70, 8, 5, true); // the Mere

  // ---------- the stream, the millpond and the race ----------
  river([[57, 0], [55, 8], [58, 14], [56, 21]], 3, true);
  b.pool(55, 27, 9, 6, true);
  river([[49, 31], [46, 37], [45, 44], [43, 50], [40, 56], [34, 62], [30, 66]], 3, true);
  b.water(58, 33, 2, 17, true); // the mill-race
  river([[59, 50], [57, 53], [53, 56], [47, 59], [40, 61]], 2, false); // the tail-race
  b.water(62, 25, 9, 2, true); // the drowned culvert, into the hill
  b.water(41, 49, 5, 3, false); // the ford

  // ---------- the lane and the village (west) ----------
  b.paint(0, 29, 30, 3, 'dirt').paint(27, 29, 3, 12, 'dirt').paint(27, 39, 16, 3, 'dirt');
  b.paint(4, 23, 20, 6, 'dirt').paint(7, 31, 3, 3, 'dirt').paint(18, 31, 3, 3, 'dirt');
  b.area('Hagsmoor lane', [[0, 28, 7, 5]], {
    read: 'The lane comes down off the downs into flat, wet country at dusk. Ahead, a huddle of thatched roofs. Beyond them, a black millwheel turns slowly against the last of the light, and the fen breathes mist.',
    gm: 'The heroes arrive here. A milestone reads HAGSMOOR 0, MARDLE MERE 1, which locals find funny. Even from here a DC 10 Perception hears the mill grinding, though no lamp is lit in it.',
    label: [3, 30],
  });
  b.prop('signpost', 4, 28).prop('milestone', 1, 32).props_('hedge-long', [[2, 27], [8, 33]]).prop('tree-oak', 0, 26);
  b.start(1, 29, 3, 3);

  b.area('Village green', [[4, 23, 20, 6]], {
    read: 'A trampled green with a well, a leaning maypole and a set of stocks. Every window has a candle in it, and every door has someone standing in it, yawning.',
    gm: 'Nobody in Hagsmoor wants to sleep. Reeve Absalom Thrupp meets the heroes here with a lantern and a list. His notice is nailed to the moot hall door (handout). Folk will tell anyone who asks: the mill has ground at night for three nights, and eleven people have fallen asleep and not woken.',
    label: [13, 25],
  });
  b.prop('well', 14, 26).prop('banner-pole', 9, 25).prop('stocks', 21, 24).props_('lamp-post', [[5, 24], [23, 27]]).prop('bench', 17, 27).prop('water-trough', 11, 27).prop('notice-board', 6, 23);
  b.light(5, 24, 15, 20).light(23, 27, 15, 20);

  b.building('Moot hall', 2, 14, 11, 9, {
    mat: 'wood-planks-dark',
    read: 'Benches have been pushed to the walls. On straw pallets down the middle lie eleven sleepers, wrapped in blankets. Their eyelids flicker. Their hair is damp, and every one of them smells faintly of pond water.',
    gm: 'The sleepers are breathing slowly and cannot be woken by any normal means (slaps, cold water, smelling salts). A DC 12 Medicine check: this is no sickness; they are dreaming very deeply. A DC 13 Perception: there is green weed caught under their fingernails. Ambrose\'s daughter Bryony lies by the fire, and her slate (handout) has writing on it she did in her sleep. All eleven ate bread from the bakery the morning they fell asleep.',
    doors: [[7, 22, 's', 'closed', 'door-double'], [8, 22, 's', 'closed', 'door-double']],
    windows: [[2, 17, 'w'], [12, 17, 'e'], [5, 14, 'n'], [10, 14, 'n']],
  });
  b.props_('straw-bed', [[3, 16], [3, 18], [3, 20], [11, 16], [11, 18], [11, 20]]).props_('bedroll', [[5, 16], [5, 19], [9, 16], [9, 19]]).prop('fireplace', 7, 14).prop('table-long', 7, 18).props_('bench-long', [[5, 21], [10, 21]]).prop('washbasin', 4, 15).prop('candles', 7, 17).prop('lantern-hanging', 7, 20);
  b.light(7, 15, 15, 20).light(7, 20, 10, 15);

  b.building("Crale's bakery", 15, 16, 9, 8, {
    mat: 'brick-floor',
    read: 'The warmest room in the village. Loaves cool on racks, a great oven ticks and glows, and flour lies over everything like snow. On the step outside sit two fat sacks tied with green string.',
    gm: 'Petronella Crale\'s bakery. The green-tied sacks turn up on the step before dawn: she thought Ambrose had started grinding early to please her. The flour is grey-white and smells of river mud and poppies (DC 11 Nature: fen-poppy, a sleeping herb). Anyone who eats the bread must make a DC 11 Constitution save or fall asleep and dream of green water until the bargain is settled (see the Mardle). Petronella stopped baking with it this morning.',
    doors: [[19, 23, 's', 'closed'], [23, 18, 'e', 'closed']],
    windows: [[15, 19, 'w'], [17, 16, 'n']],
  });
  b.prop('hearth-oven', 16, 17).props_('bread-rack', [[21, 17], [22, 17]]).prop('kitchen-table', 19, 19).prop('flour-sacks', 22, 21).prop('butcher-block', 17, 21).prop('shelf-jars', 20, 17).prop('stool', 18, 20).props_('sack', [[18, 24], [20, 24]]).prop('lantern-hanging', 19, 21);
  b.light(16, 17, 15, 20, '#ff9a4a').light(19, 21, 10, 15);

  b.building('The Barley Mow', 2, 33, 12, 10, {
    mat: 'wood-planks',
    read: 'A low, smoky inn full of people who have decided that if they keep drinking, they cannot fall asleep. A man in a straw hat is pinching himself and singing a counting song very loudly, out of tune.',
    gm: 'The singer is Dobbin Strawe, who has not slept for three days on purpose. In the snug behind the bar, Ambrose Crale the miller sits with a cold pint, hiding from his wife and from the mill. The landlady serves nettle beer and porridge, and absolutely no bread.',
    doors: [[7, 33, 'n', 'closed'], [8, 33, 'n', 'closed'], [13, 39, 'e', 'closed']],
    windows: [[2, 36, 'w'], [2, 40, 'w'], [11, 42, 's']],
  });
  b.wallRun(10, 33, 4, 'w').door(10, 34, 'w', 'open');
  b.prop('bar-counter', 4, 34).prop('keg-rack', 3, 35).prop('fireplace', 6, 42).props_('table-round', [[4, 38], [7, 39], [5, 41]]).props_('stool', [[3, 38], [5, 38], [6, 39], [8, 39], [4, 41]]).prop('dartboard', 9, 42).prop('tavern-sign', 6, 32).prop('table-round', 12, 35).props_('chair', [[11, 35], [12, 36]]).prop('lantern-hanging', 7, 37);
  b.light(6, 41, 15, 20).light(7, 37, 10, 15).light(12, 35, 5, 10);

  b.building("Thatcher's cottage", 16, 34, 8, 7, {
    mat: 'wood-planks',
    read: 'Half a roof of new straw and half of sky. Ladders, bundles of reed and a bed that has very clearly not been slept in.',
    gm: 'Dobbin Strawe\'s cottage. Pinned over the bed are seven drawings he made to stay awake, all of the same thing: a woman with weed for hair, looking up out of water. A DC 10 Investigation finds a sack of the green-tied flour he "borrowed" from the bakery step, with mill-dust and three black poppy seeds in its seams.',
    doors: [[19, 34, 'n', 'closed']],
    windows: [[23, 37, 'e']],
  });
  b.prop('bed', 17, 35).prop('ladder', 22, 35).props_('hay-bale', [[17, 39], [21, 39]]).prop('workbench', 20, 37).prop('sack', 22, 39).prop('candles', 18, 37);
  b.light(18, 37, 5, 10);
  b.props_('log-pile', [[24, 41]]).prop('chicken-coop', 14, 44).prop('beehive', 1, 44).prop('handcart', 24, 33).props_('fence-wood', [[1, 46], [5, 46], [9, 46]], 90).prop('fence-gate', 13, 46, 90);

  // ---------- the barley fields and the tithe barn (north) ----------
  b.paint(2, 2, 22, 9, 'dirt').paint(26, 18, 16, 8, 'dirt');
  b.area('Barley fields', [[2, 2, 24, 10], [26, 17, 18, 10]], {
    read: 'Stubble fields stretch away under a white moon, stacked with haystacks. A scarecrow leans in the middle of the nearest field, and its sleeve is moving, though there is no wind.',
    gm: 'Harvest is in, the barley is in the tithe barn and the old flour was ground at midsummer. The scarecrow is only a scarecrow: a barn owl lives in its hat (DC 10 Perception to spot it before it bursts out). The hedges have gaps a person can push through.',
    label: [12, 6],
  });
  b.props_('crop-rows', [[4, 4], [10, 4], [16, 4], [4, 8], [10, 8], [28, 20], [34, 20], [28, 23], [36, 23]]).props_('haystack', [[20, 3], [7, 10], [40, 19]]).prop('scarecrow', 13, 7).props_('hedge-long', [[0, 12], [6, 12], [12, 12], [20, 13], [26, 15], [32, 15], [44, 22]]).props_('tree-oak', [[25, 2], [45, 10], [24, 26]]).prop('cart', 22, 9, 90).prop('hay-bale', 18, 10);

  b.building('Tithe barn', 30, 4, 12, 9, {
    mat: 'wood-planks-dark',
    read: 'A huge old barn, stacked to the rafters with barley sheaves. Something rustles in the straw, then snores. Then rustles again.',
    gm: 'Rats got into the green-tied sacks Dobbin left here and ate the night-flour. Now they are asleep and walking: they move in a heaving, snoring mass and bite anything warm they bump into. Fire or a loud noise (a DC 12 Performance shout) wakes them, and awake rats just run. The loft (ladder) holds the reeve\'s tithe box.',
    doors: [[35, 12, 's', 'closed', 'door-double'], [36, 12, 's', 'closed', 'door-double'], [30, 8, 'w', 'closed']],
    windows: [[41, 7, 'e']],
  });
  b.props_('hay-bale', [[31, 5], [33, 5], [39, 5], [31, 10]]).props_('haystack', [[38, 9]]).prop('ladder', 40, 5).props_('sack', [[33, 10], [34, 10]]).prop('wagon', 36, 7, 90).prop('cobweb-corner', 41, 11).prop('gm-treasure', 40, 6, 0, { gm: true }).prop('grindstone', 32, 8);
  b.encounter('Sleepwalking rats', [30, 4, 12, 9], [['swarmOfRats', 2], ['giantRat', 2]], 'low');

  // ---------- the Crale graves and the stream crossing (north-east) ----------
  b.floor(53, 10, 6, 1, 'wood-planks');
  b.area('Plank bridge', [[53, 9, 6, 3]], {
    read: 'Two planks and a rope rail cross the stream where it runs fast and dark toward the millpond.',
    gm: 'The back way from the fields to the Crale graves and the pond\'s east shore. The planks are sound. Anyone who looks down at the water by moonlight (DC 12 Wisdom save) sees a pale face just under the surface, smiling. It is gone when they look again.',
    label: [55, 10],
  });
  b.prop('bridge-plank', 55, 10, 90).prop('tree-willow', 52, 12);
  b.area('Crale graves', [[59, 2, 8, 12]], {
    read: 'Under a crooked alder on a dry rise stand a handful of old headstones. The newest grave is bare earth, and it is soaking wet. Pondweed grows on it in the shape of a hand.',
    gm: 'Four generations of Crales. The new grave is Gammer Bettony Crale\'s, buried at midsummer. Her stone reads: BETTONY CRALE. SHE KEPT THE WHEEL TURNING. SHE NEVER ONCE DREAMED. A DC 12 Religion or Arcana: the wet earth and the weed hand are a sign that something is owed. Leaving a loaf of good bread or a coin on the grave makes the ghost in the cellar friendlier (advantage on checks with her).',
    label: [62, 7],
  });
  b.paint(59, 2, 8, 12, 'dirt');
  b.props_('burial-slab', [[60, 4], [62, 4], [64, 4], [60, 8]]).prop('mud-patch', 63, 8).prop('tree-birch', 65, 10).prop('cairn', 64, 2).prop('road-shrine', 60, 11).prop('flowers', 62, 9).prop('lantern-standing', 61, 6, 0, { off: true });
  b.props_('tree-willow', [[60, 15], [64, 18]]).prop('reeds', 63, 21);

  // ---------- the millpond ----------
  b.area('Millpond', [[47, 22, 16, 10]], {
    read: 'The millpond lies flat and black, with a skin of mist on it. Lily pads, a sunk punt, and at the east end the stone mouth of a culvert where the water slides into the hill.',
    gm: 'Wading the shallows round the edge is safe; the middle is twenty feet deep and very cold. Once per round anyone swimming in the deep water makes a DC 10 Wisdom save or hears a kind voice saying their name and swims toward the culvert. The Mardle watches from the pond and the fen; she will not attack out here unless someone tries to drain the pond.',
    label: [54, 27],
  });
  b.props_('lily-pads', [[50, 24], [58, 30], [53, 31]]).props_('reeds', [[47, 25], [61, 23], [48, 30]]).prop('rowboat', 52, 28, 30).prop('rapids', 49, 32).prop('mooring-post', 61, 29);
  b.area('Drowned culvert', [[64, 25, 6, 2]], {
    gm: 'An old stone culvert, flooded to the roof, that runs 40 feet under the knoll and comes up in the dream-pool grotto. Swimming it: DC 12 Athletics; on a fail, 1d6 cold damage and the swimmer comes up gasping, and the Mardle knows they are coming. A potion of water breathing makes it easy. Rusty bars at the mouth lift out with a DC 11 Strength check.',
    label: [66, 25],
  });
  b.note(64, 25, 'Drowned culvert: swim east under the knoll to the dream-pool grotto (DC 12 Athletics).');

  // ---------- the lane bridge, the mill yard and the miller's cottage ----------
  b.floor(43, 40, 6, 2, 'stone-cobble');
  b.area('Lane bridge', [[43, 39, 6, 4]], {
    read: 'A humped stone bridge carries the lane over the stream. The water under it is loud and quick.',
    gm: 'The main way to the mill. Mossy carvings of wheat-ears on the parapet. Anyone who drops a crumb of the night-bread into the stream sees it float upstream toward the pond.',
    label: [45, 40],
  });
  b.props_('wall-stone-low', [[44, 39], [47, 42]]).prop('lamp-post', 43, 39).light(43, 39, 10, 20);
  b.paint(48, 36, 10, 14, 'dirt');
  b.area('Mill yard', [[48, 34, 10, 9]], {
    read: 'A rutted yard between the stream and the mill-race. A cart stands with its shafts down, full of grey sacks. Wet footprints, too wide and too flat, go back and forth between the race and the mill door.',
    gm: 'The footprints belong to the drowned millhands. A DC 12 Survival: they come up out of the race, carry sacks into the mill, and carry flour back out across the footbridge toward the lane. The cart holds three green-tied sacks of night-flour ready for the bakery step.',
    label: [52, 38],
  });
  b.prop('cart', 50, 37, 90).props_('flour-sacks', [[51, 39], [55, 35]]).prop('grindstone', 56, 40).prop('hitching-post', 49, 35).prop('water-trough', 54, 35).prop('lantern-hook', 57, 37).prop('puddle', 57, 40);

  b.building("Miller's cottage", 49, 43, 7, 6, {
    mat: 'wood-planks',
    read: 'A tiny, tidy cottage gone cold. A rocking chair faces the window that looks at the mill. On the wall hangs a framed sampler, stitched in green thread.',
    gm: 'Gammer Bettony lived here alone until midsummer. The sampler (handout) is the bargain, written down so no Crale would forget it. A DC 12 Investigation finds a loose hearthstone. Ambrose has not been inside since the funeral.',
    doors: [[52, 43, 'n', 'closed']],
    windows: [[55, 45, 'e'], [49, 46, 'w']],
  });
  b.prop('rocking-chair', 54, 45).prop('fireplace', 50, 47).prop('bed', 54, 47).prop('spinning-wheel', 50, 44).prop('chest', 52, 47).prop('herbs-drying', 51, 44).prop('rug-round', 52, 45).prop('gm-treasure', 50, 47, 0, { gm: true });

  // ---------- the race, the sluice and the mill ----------
  b.floor(58, 38, 2, 1, 'wood-planks').floor(58, 34, 2, 1, 'wood-planks');
  b.area('Mill-race', [[58, 33, 2, 17]], {
    read: 'The race runs deep and fast in a stone channel along the mill wall, and the great wheel turns in it with a groan like an old man getting up. Two planks cross the race to the mill door.',
    gm: 'Deep, fast water: falling in means a DC 12 Strength (Athletics) check each round or be dragged 10 feet toward the wheel, and 2d6 bludgeoning if dragged into it. Footbridge to the mill door, and the sluice walk at the pond end.',
    label: [58, 44],
  });
  b.props_('rapids', [[58, 42], [59, 44]]).prop('debris-wood', 58, 47).prop('bridge-plank', 58, 38, 90);
  b.area('Sluice bank', [[60, 33, 7, 4]], {
    read: 'A grassy bank between the pond and the mill roof. An iron wheel works the sluice gate that lets the pond into the race.',
    gm: 'Turning the sluice wheel shut takes a DC 12 Strength check (two people can help). Shut, the race runs dry in two minutes, the millwheel stops, and the drowned millhands come out to see why (they walk round to the sluice in 2 rounds). The Mardle feels it too and grows angry: the next scene with her starts with her already shouting.',
    label: [63, 34],
  });
  b.prop('lever', 58, 34).prop('winch', 61, 34).prop('reeds', 65, 33).prop('mooring-post', 62, 33).prop('stump', 66, 35);

  b.building('Hagsmoor mill', 60, 37, 8, 12, {
    mat: 'wood-planks',
    read: 'The millstones are turning in the dark, grinding and grinding. Grey shapes in sodden smocks pour sacks into the hopper and stack the flour that comes out. None of them breathes. Water runs off them onto the boards.',
    gm: 'The drowned millhands: men and women who drowned in the race over a hundred years, raised by the Mardle as her night shift. Foreman Ezra Lumm is one of them. They ignore the heroes until someone touches the sacks or the stones. Calling Ezra by name and saying Bettony sent you (DC 12 Persuasion) makes him stop and point at the cellar door; the others stop when he does. Ezra has the cellar key round his neck (or DC 13 thieves\' tools, DC 15 Strength to force).',
    doors: [[60, 38, 'w', 'closed', 'door-double'], [63, 48, 's', 'closed'], [67, 42, 'e', 'locked', 'door-iron']],
    windows: [[60, 44, 'w'], [64, 37, 'n'], [67, 39, 'e']],
  });
  b.props_('grindstone', [[63, 41], [65, 41]]).prop('winch', 61, 43).props_('flour-sacks', [[62, 46], [66, 46], [61, 39]]).prop('crate', 66, 38).prop('stairs-down', 66, 42).prop('workbench', 64, 44).prop('scales', 62, 38).prop('lantern-hanging', 63, 44).prop('sack', 65, 45);
  b.light(63, 44, 10, 15, '#bfe8c8');
  b.encounter('The night shift', [60, 37, 8, 12], [['zombie', 5]], 'moderate');
  b.props_('log-pile', [[61, 51]]).prop('debris-wood', 65, 55).prop('tree-dead', 66, 58).prop('reeds', 60, 53);

  // ---------- under the knoll ----------
  b.room('Sunken cellar', 68, 39, 9, 8, {
    mat: 'stone-flagstone',
    read: 'Steps go down into a cellar that has sunk at one end, so the floor tilts and a skin of water lies in the low corner. Sacks are stacked to the roof. On one of them sits a little old woman, knitting with pondweed. You can see the sacks through her.',
    gm: 'Gammer Bettony Crale\'s ghost. She cannot leave until the bargain is settled. She is cross, funny and frank: she tells the whole truth of the bargain, says the Mardle "keeps a deal, but she keeps it to the letter", and gives the heroes the trick (ask three times, kindly, with something real to offer, and the Mardle must hear a fair deal). The north tunnel leads to the grotto; the narrow south way to the old barrow.',
  });
  b.water(74, 44, 3, 3, false);
  b.prop('stairs-up', 68, 42).props_('flour-sacks', [[69, 40], [70, 40], [69, 45]]).props_('barrel', [[75, 40], [76, 40]]).prop('crate-stack', 72, 45).prop('wine-rack', 76, 42).prop('cobweb-corner', 68, 39).prop('lantern-hanging', 71, 42, 0, { off: true });
  b.tunnel([[72, 39], [72, 35], [71, 32], [73, 29]], 2, { mat: 'cave-floor', seed: 31 });
  b.area('The dripping way', [[71, 30, 3, 9]], {
    read: 'A rough tunnel climbs from the cellar into the hill. Water drips from the roof in a steady rhythm, like a clock, and the walls glisten green.',
    gm: 'Halfway along, a DC 12 Perception spots a tripwire of braided weed strung across the floor: touching it rings a little bell of shell in the grotto, and the Mardle is waiting when the heroes arrive.',
    label: [72, 34],
  });
  b.prop('glowing-fungus', 71, 33).prop('trap-tripwire', 72, 32, 0, { gm: true });
  b.cave('Dream-pool grotto', 74, 21, 4.6, 6.8, {
    seed: 5, mat: 'cave-floor',
    read: 'A tall cave around a round pool that glows from beneath, green as a bottle. Over the water float pale lights like soap bubbles, and in each one a sleeper\'s dream moves: a girl running in a meadow, a man counting sheep that will not stay counted. Beside the pool, a stone hand-quern turns by itself, grinding the lights into flour.',
    gm: 'The Mardle\'s lair. She rises from the pool when the heroes arrive and speaks before she fights: she wants what she is owed. Bargain, trick or fight (see the Mardle). The quern has AC 15 and 20 hit points, or a DC 15 Strength check tips it into the pool: smashing it frees every dream, wakes every sleeper, and breaks the bargain forever. The pool is 15 feet deep; the edges are slick (DC 10 Dexterity save when shoved, or slide in).',
  });
  b.pool(74, 20, 2.6, 3, true);
  b.prop('grindstone', 71, 23).props_('light-orb', [[73, 18], [75, 21], [74, 23]]).prop('whirlpool', 74, 20).props_('reeds', [[71, 17], [77, 24]]).prop('bones-mud', 76, 16).prop('stalactites', 72, 16);
  b.light(74, 20, 15, 25, '#7fe0a8');
  b.encounter('The Mardle', [69, 14, 10, 14], [['seaHag', 1]], 'high');
  b.tunnel([[74, 16], [73, 12], [73, 9]], 2, { mat: 'cave-floor', seed: 13 });
  b.cave("The Mardle's larder", 74, 8, 4, 3.2, {
    seed: 9, mat: 'cave-floor',
    read: 'Shelves cut into the rock hold hundreds of stoppered bottles, each with a faint light inside. Some are labelled in a spidery hand: A FISHER, 1 NIGHT. A BRIDE, SWEET. BETTONY, NOTHING AGAIN.',
    gm: 'Seventy years of dreams. Uncorking a bottle releases a dream that plays out for a moment in the air (pleasant, strange, harmless). Eleven bottles, still warm, hold the sleepers\' dreams: pour one into the dreamer\'s mouth and they wake at once. This works even if the Mardle lives. Her hoard is in a sunk chest under the lowest shelf.',
  });
  b.props_('shelf-jars', [[71, 7], [76, 6], [77, 9]]).prop('potion-rack', 72, 9).prop('treasure-urn', 75, 10).prop('chest', 73, 6).prop('light-orb', 74, 8);
  b.light(74, 8, 5, 15, '#c8f0ff');

  // the narrow way south to the barrow
  b.tunnel([[72, 46], [72, 55], [70, 58], [70, 65], [68, 65]], 1, { mat: 'cave-floor', seed: 41 });
  b.area('Barrow passage', [[70, 50, 3, 15]], {
    read: 'A passage only one person wide, propped with black timbers. It smells of peat and old smoke.',
    gm: 'Dug long ago by whoever built the barrow, to reach the water under the hill. It ends at the back of the barrow in what looks like a solid stone slab (a secret door: DC 13 Perception from the barrow side, obvious from this side).',
    label: [71, 55],
  });
  b.prop('mine-support', 72, 49).prop('mine-support', 70, 61).prop('bones', 71, 57);
  b.room('Drowned barrow', 63, 63, 5, 5, {
    mat: 'dungeon-slab',
    read: 'A low stone chamber inside a grassy mound in the fen. Peat-water stands ankle deep. Four stone shelves hold four bundles of bones wrapped in rotted cloth, and every skull faces the back wall.',
    gm: 'The fen folk who first lived here buried their dead facing the water under the hill. The four skeletons rise when anyone touches the back wall. Leaving an offering of food or drink at the door (DC 11 Religion to think of it) keeps them still. The back wall is a secret door into the knoll (DC 13 Perception: the skulls are all staring at it).',
  });
  b.floor(62, 65, 1, 1, 'dungeon-slab').door(62, 65, 'w', 'open', 'door-broken').door(67, 65, 'e', 'secret');
  b.props_('burial-slab', [[63, 63], [67, 63], [63, 67]]).prop('urn', 65, 63).prop('skeleton-lying', 66, 67).prop('puddle', 65, 65).prop('gm-secret-door', 67, 65, 0, { gm: true }).prop('gm-treasure', 63, 63, 0, { gm: true });
  b.encounter('The barrow sleepers', [63, 63, 5, 5], [['skeleton', 4]], 'low');

  // ---------- the fen ----------
  b.area('Hagsmoor fen', [[0, 52, 60, 6], [44, 66, 18, 14]], {
    read: 'The ground gives under your boots. Pools shine between tussocks of reed, mist lies knee deep, and somewhere a bittern booms like someone blowing across a bottle.',
    gm: 'Mud is difficult ground. Off the causeway, each hero makes a DC 10 Survival check per few hundred feet or blunders into a soft patch (stuck until a DC 11 Strength check). Lights move in the far fen: they are only marsh gas, but nobody local will say so.',
    label: [50, 72],
  });
  path([[10, 47], [14, 52], [18, 57], [24, 60], [33, 61], [40, 63], [48, 64], [56, 65], [61, 65]], 2, 'wood-planks');
  b.area('Log causeway', [[14, 52, 4, 6], [33, 60, 16, 3]], {
    read: 'A track of split logs laid end to end runs out across the fen, black and slippery, sinking a little under every step.',
    gm: 'The safe way across the fen, from the back of the Barley Mow to the barrow mound. It crosses the stream on a log bridge. Running on it: DC 10 Acrobatics or slip into the mud.',
    label: [36, 61],
  });
  b.props_('mooring-post', [[13, 50], [47, 63]]).prop('lantern-standing', 24, 59, 0, { off: true }).prop('lantern-standing', 56, 64, 0, { off: true }).prop('signpost', 11, 47);

  b.water(3, 58, 13, 12, false);
  path([[10, 53], [10, 61]], 1, 'wood-planks');
  b.building("Ketty's eel hut", 6, 62, 7, 6, {
    mat: 'wood-planks-dark',
    read: 'A hut on stilts over black water, hung all over with eel traps, nets and strings of drying fish. A lamp burns inside, and someone is talking very kindly to something in a bucket.',
    gm: 'Ketty Bittern, the eel-catcher, lives here with her eels (each one has a name). She knows the Mardle well and is not afraid of her. She trades: the heroes\' help mending one trap gets them her rhyme (handout), the way to the barrow, and a flask of eel-oil (a potion of water breathing).',
    doors: [[10, 62, 'n', 'closed']],
    windows: [[6, 64, 'w'], [12, 65, 'e']],
  });
  b.prop('fishing-net', 7, 63).prop('cauldron', 8, 66).prop('herbs-drying', 11, 63).prop('straw-bed', 11, 66).prop('barrel', 7, 66).prop('lantern-hanging', 9, 64).props_('fishing-gear', [[4, 60], [14, 68]]).prop('canoe', 5, 69, 90).prop('mooring-post', 11, 60);
  b.light(9, 64, 10, 20);

  b.area('The Mere', [[20, 64, 16, 12]], {
    read: 'Mardle Mere lies wide and still, its edges red with fen-poppies. Small shapes stoop among the flowers, picking. They are made of mud, and they giggle.',
    gm: 'The Mardle\'s poppy-pickers (mud mephits) gather fen-poppy for the night-flour, watched by two giant frogs in the shallows. The mephits are cowardly and greedy: a shiny gift (DC 12 Persuasion) sends them off, and they will tattle that "Missus keeps the Crale dreams under the hill". Fen-poppies burnt in a lantern give off a smoke that wakes a sleeper for one minute, long enough to speak.',
    label: [28, 70],
  });
  b.props_('flowers', [[21, 66], [25, 64], [33, 66], [35, 71], [22, 74], [31, 75]]).props_('reeds', [[20, 69], [36, 68], [27, 76]]).props_('lily-pads', [[26, 69], [31, 72]]).prop('bones-mud', 34, 74).prop('sack', 34, 65);
  b.encounter('Poppy-pickers at the Mere', [19, 62, 18, 15], [['mudMephit', 2], ['giantFrog', 2]], 'low');

  b.area('The ford', [[40, 48, 7, 5]], {
    read: 'The stream spreads out wide and shallow over gravel, with a few big stones to hop between.',
    gm: 'Knee deep. A quiet way from the mill yard down into the fen without the lane. DC 10 Acrobatics on the stones or get soaked.',
    label: [43, 50],
  });
  b.props_('boulder', [[42, 49], [44, 51]]);

  // fen dressing, kept off paths and buildings
  const busy = [[0, 46, 26, 8], [2, 57, 15, 15], [9, 47, 6, 16], [30, 59, 33, 7], [12, 50, 8, 10], [18, 55, 8, 7], [60, 60, 11, 11], [19, 62, 18, 15]];
  const free = (x: number, y: number) => b.isFloor(x, y) && !busy.some(([a, c, w, h]) => x >= a && x < a + w && y >= c && y < c + h);
  const fenBits = ['reeds', 'reeds', 'tree-swamp', 'tree-dead', 'grass-tall', 'mud-patch', 'log-fallen', 'reeds', 'lily-pads', 'stump'];
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(r() * 80), y = 53 + Math.floor(r() * 27);
    if (free(x, y)) b.prop(fenBits[Math.floor(r() * fenBits.length)], x, y);
  }
  b.props_('quicksand', [[70, 74], [52, 70]]).prop('sinkhole', 76, 77).prop('skeleton-lying', 74, 72).prop('tree-dead', 71, 76);
  // the woods along the north and the field edges
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(r() * 66), y = Math.floor(r() * 50);
    if (b.isFloor(x, y) && b.cellAt(x, y) === 1 && (x > 24 && x < 46 && y > 26 && y < 38)) b.prop(r() < 0.5 ? 'tree-oak' : 'bush', x, y);
  }
  b.props_('tree-oak', [[32, 32], [38, 35], [26, 45], [34, 46]]).props_('bush', [[30, 36], [36, 30]]).prop('tree-willow', 41, 45);
  return b.build();
}

export const HAGSMOOR_MILL: Adventure = {
  id: 'hagsmoor-mill',
  title: 'The Night Mill of Hagsmoor',
  tagline: 'The old watermill grinds by itself after dark, and everyone who eats its bread falls into a dream they can\'t wake from.',
  levels: '1',
  sessions: '1 session (3-4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'starter', 'folk tale', 'fen', 'bargain'],
  pitch:
    'Hagsmoor is a farming village on the edge of a fen, where the barley grows well and the mist comes in every evening like a cat. For three nights the old watermill has been grinding in the dark, with no miller and no lamp. And for three mornings, people who ate the village bread have lain down and not got up. Eleven sleepers now, smiling, damp, dreaming of something under water. The reeve has put up a notice. You are passing through. Tonight is the third night.',
  secret:
    'Seventy years ago, in the Dry Year, the millpond shrank to a puddle and the wheel stopped. Young Bettony Crale went down to Mardle Mere and made a bargain with the Mardle, a fen hag who drinks dreams. The Mardle keeps the pond full and the wheel turning, and in return she drinks the dreams of a Crale who sleeps under the mill roof. Bettony paid every night for seventy years and never dreamed once. She died at midsummer. Her grandson Ambrose, the miller, married the baker Petronella and moved into the bakery, so now no Crale sleeps at the mill. The bargain says that if no Crale sleeps there, the Mardle takes her due from other minds. So she grinds dreams into flour with her drowned millhands, leaves the sacks on the bakery step, and drinks the dreams of everyone who eats the bread. Why now: she wants back pay for every night since midsummer. At cockcrow after the third night, the sleepers\' dreams are hers to keep, and they never wake.',
  hooks: [
    'Reeve Absalom Thrupp offers 25 gold pieces each "less reasonable deductions" to whoever wakes the sleepers by morning.',
    'A hero bought a loaf in Hagsmoor at noon, ate half, and keeps nodding off in the saddle. They dream of a green pool and a kind voice saying their name.',
    'Petronella the baker begs the heroes to help: her new stepdaughter Bryony is one of the sleepers, and it was her bread that did it.',
  ],
  tips: [
    'This is a folk tale. Things come in threes, bargains are kept to the letter, and kindness is rewarded. Let clever and generous ideas win.',
    'There are three ways to the grotto: through the mill and its cellar, round the fen by the causeway and the barrow, or swimming the culvert from the millpond. All of them work.',
    'The drowned millhands, the barrow skeletons, the rats and the mud mephits can all be avoided, calmed or bargained with. Reward that as much as a win.',
    'The Mardle is a sea hag stat block and very dangerous at level 1. She would much rather bargain than fight. If she drops below half her hit points, she offers terms. If a hero falls to her Death Glare, she offers to give them back for a price.',
    'Short on time? Skip the tithe barn and the Mere, and have Ketty meet the heroes on the causeway. Fast group? Ring the shell bell so the Mardle is ready for them.',
    'Keep the villagers funny and warm (Absalom\'s by-laws, Dobbin\'s songs, Petronella\'s bravery) so the creepy parts land harder.',
  ],
  npcs: [
    {
      id: 'pf_hgmabsalom', name: 'Absalom Thrupp', title: 'Reeve of Hagsmoor', kind: 'npc', art: 'town-crier', shared: true,
      wants: 'The sleepers woken, the village calm, and a proper record of it all in his book of by-laws.',
      knows: 'Who is asleep and when they fell asleep, that every one of them ate bakery bread, and that the mill has ground at night for three nights.',
      voice: 'Pompous and fussy, with a little bell he rings before he says anything important. Says "hereinafter" a lot.',
      appearance: 'A small round man in a chain of office made of brass washers, carrying a lantern, a ledger and a quill behind each ear.',
      gmNotes: 'Comic, but not a fool. If the heroes treat him with respect he opens the village purse properly (25 gp each) and hands over the tithe barn key.',
    },
    {
      id: 'pf_hgmambrose', name: 'Ambrose Crale', title: 'the miller', kind: 'npc', art: 'commoner', shared: true,
      wants: 'To never go near the mill at night again, and for Bryony to wake up.',
      knows: 'That Gammer Bettony slept at the mill every night of her life and made him promise to "keep sleeping under the roof". He never knew why, and he broke the promise.',
      voice: 'A huge, gentle man with a tiny voice. Apologises to furniture when he bumps it.',
      appearance: 'Big as a door, dusted in old flour, with a red handkerchief he twists in his hands.',
      backstory: 'Grew up hearing the wheel at night. At midsummer he married Petronella and moved into the bakery, glad to be free of the creaking old mill.',
      gmNotes: 'Once he reads the sampler he understands. He is terrified, but he will offer himself to the Mardle if the heroes are with him.',
    },
    {
      id: 'pf_hgmpetronella', name: 'Petronella Crale', title: 'the baker', kind: 'npc', art: 'innkeeper', shared: true,
      wants: 'To put right what her bread did, and to be a good stepmother to Bryony.',
      knows: 'The green-tied sacks appear on her step before dawn. She thought Ambrose was grinding early to please her.',
      voice: 'Loud, warm, bossy; calls everyone "my duck" and gives orders like a sergeant.',
      appearance: 'A broad woman with forearms like hams, flour to the elbows and a rolling pin she carries everywhere.',
      gmNotes: 'She is a Crale by marriage since midsummer. When she learns the bargain, she offers at once to sleep at the mill: "I never remember my dreams anyway." The Mardle may accept her, especially if Ambrose takes every other night.',
    },
    {
      id: 'pf_hgmbryony', name: 'Bryony Crale', title: "the miller's daughter, asleep", kind: 'npc', art: 'child',
      wants: 'In her dream: to keep playing in the green meadow under the water. Awake: her dad.',
      knows: 'In the dream she has met "the lady in the pond" and seen Gammer Bettony, who told her to be brave.',
      voice: 'Talks in her sleep in short, cheerful bursts, as if answering someone.',
      appearance: 'An eleven-year-old with muddy knees and damp hair, smiling in her sleep, a slate pencil still in her hand.',
      gmNotes: 'If a hero lights fen-poppies by her pillow, she wakes for one minute and can tell them what the lady wants: "She says the Crales owe her. She says it nicely."',
    },
    {
      id: 'pf_hgmdobbin', name: 'Dobbin Strawe', title: 'the thatcher who will not sleep', kind: 'npc', art: 'farmer', shared: true,
      wants: 'To stay awake until somebody else fixes this.',
      knows: 'He saw lanterns moving in the mill at midnight and wet grey people carrying sacks across the footbridge. He ate one slice of the bread three days ago and dreamed of a pond with a face in it.',
      voice: 'Fast, loud and cheerful, interrupts himself with counting songs, pinches himself between sentences.',
      appearance: 'A lanky man with a straw hat, eyes like boiled eggs and seven cups of nettle beer in front of him.',
      gmNotes: 'Once in the scene he dozes off mid-sentence and says, in a soft wet voice that is not his: "The Crales owe me. Tell the big one." Then he jerks awake and sings louder.',
    },
    {
      id: 'pf_hgmketty', name: 'Ketty Bittern', title: 'eel-catcher of the fen', kind: 'npc', art: 'swamp-witch', monsterId: 'druid', shared: true,
      wants: 'To be left alone with her eels, and for the Mardle to stop making the fen look bad.',
      knows: 'The Mardle is old, proud and bound by her word. The barrow on the fen has a back door into the knoll. Eel-oil lets you breathe water for a while.',
      voice: 'Dry and slow, with a fen drawl. Talks to her eels by name (Gertrude, Long Tom, the Bishop) more kindly than to people.',
      appearance: 'A tiny, wiry old woman in waders and an oilskin hat, smelling strongly of fish.',
      gmNotes: 'Uses the druid stat block if it comes to it, but she will not fight the Mardle: "We have an understanding." She can be talked into coming as far as the barrow door.',
    },
    {
      id: 'pf_hgmbettony', name: 'Gammer Bettony Crale', title: 'ghost of the old miller', kind: 'npc', art: 'ghost',
      wants: 'The bargain settled so she can rest, and her grandson to stop being a coward.',
      knows: 'Everything about the bargain. The Mardle keeps a deal to the letter, and must hear a fair offer if it is asked three times, kindly, with something real on the table.',
      voice: 'Sharp, dry and funny. Calls the heroes "you lot". Knits while she talks.',
      appearance: 'A little bent woman in a mob cap and shawl, grey and see-through, knitting a scarf of pondweed that never gets longer.',
      backstory: 'Made the bargain at nineteen to save the mill and the village in the Dry Year, and never told anyone what it cost.',
      gmNotes: 'Harmless and cannot fight. She tells the truth, plainly: seventy years without a dream was "no great loss, I slept like a log". If a Crale takes on the bargain again, she smiles and fades away for good.',
    },
    {
      id: 'pf_hgmezra', name: 'Ezra Lumm', title: 'drowned mill foreman', kind: 'monster', art: 'zombie', monsterId: 'zombie',
      wants: 'To finish the shift. Under that, very faintly, to rest.',
      knows: 'Where the cellar key is (round his own neck), and the way to the grotto.',
      voice: 'Cannot speak. Gurgles, and points.',
      appearance: 'A tall grey man in a sodden leather apron, with river-weed in his beard and a brass key on a string.',
      backstory: 'Drowned in the race forty years ago, trying to free the wheel in a flood. Bettony wept for him.',
      gmNotes: 'Counts as one of the five zombies in The night shift. If addressed by name with Bettony\'s name (DC 12 Persuasion), he stops and the whole shift stops with him.',
    },
    {
      id: 'pf_hgmmardle', name: 'The Mardle', title: 'the thing in the millpond', kind: 'monster', art: 'sea-hag', monsterId: 'seaHag',
      wants: 'What she is owed: a Crale\'s dreams, every night, as was agreed. And back pay since midsummer.',
      knows: 'The exact words of the bargain, every dream she has ever drunk, and every name in Hagsmoor.',
      voice: 'Soft, wet and reasonable, like a kindly aunt. Never raises her voice until the deal is broken. Repeats the last word of what people say, tasting it.',
      appearance: 'A long, thin woman with green-grey skin, pondweed hair and eyes like two lily-buds. Her fingers drip, and she smells of cut reeds and rain.',
      backstory: 'Older than the village. She has made bargains with fen folk for as long as there has been a fen.',
      gmNotes: 'Sea hag stat block (freshwater). Bargaining: she must hear a fair offer made three times kindly (three DC 12 Persuasion checks, or one great speech). She accepts Ambrose or Petronella sleeping at the mill again (one Crale a night), and releases the sleepers. Back pay can be settled with a dream from each hero (they dream nothing for a month) or something clever. Trick: she is bound by the bargain\'s words, so a named Crale sleeping under the roof that very night (even napping on the cellar sacks) stops the grinding at once. Fight: she flees into the pool at 10 HP or less, and the sleepers wake only if the quern is smashed or their bottled dreams are poured back.',
    },
  ],
  handouts: [
    {
      id: 'hgm-notice', title: 'Nailed to the moot hall door',
      text: 'BY ORDER OF THE REEVE OF HAGSMOOR\n\n1. No person shall fall asleep in the street, the inn or the stocks.\n2. No person shall eat bread until further notice. This includes toast.\n3. Any person hereinafter found grinding at the mill after dark will be fined one shilling. (This includes ghosts.)\n4. A reward of 25 gold pieces, less reasonable deductions, to whoever wakes the sleepers.\n\nA. Thrupp, Reeve\n(Under it, in chalk: THE MILLER KNOWS)',
    },
    {
      id: 'hgm-slate', title: "Bryony's slate, written in her sleep",
      text: 'the lady is nice\nshe has a garden under the pond\nshe says gammer was a good girl and paid every night\nshe says now dad has to pay\nor we all have to stay\n(the last word is wet and smudged, as if dripped on)',
    },
    {
      id: 'hgm-rhyme', title: "Ketty's skipping rhyme",
      text: 'Mardle, Mardle, under the mere,\nWhat will you give if I come near?\nWater for the wheel and fish for the pan,\nIf you give me your dreams, as many as you can.\n\nAsk her once, she shows her teeth.\nAsk her twice, she sinks beneath.\nAsk her three times, kind and fair,\nAnd the Mardle has to listen there.',
    },
    {
      id: 'hgm-sampler', title: "Gammer Bettony's sampler, stitched in green thread",
      text: 'Water for the wheel, and the wheel shall turn,\nWhile a Crale sleeps under the mill roof.\nThe Crale\'s dreams are the Mardle\'s due,\nOne a night, the whole night through.\nIf no Crale sleeps, the Mardle grinds,\nAnd takes her due from other minds.\n\nB.C. the Dry Year. Keep it, and do not be frightened. It is only dreams.',
    },
  ],
  chapters: [
    {
      id: 'night', title: 'The third night', level: 1,
      summary: 'The heroes arrive in Hagsmoor at dusk, learn why the village is afraid to sleep, and find their way to the mill, the fen and the grotto under the knoll where the Mardle collects her due.',
      goal: 'Wake the eleven sleepers before cockcrow, by settling the old bargain, tricking the Mardle or breaking her hold.',
      map: hagsmoorAtMidnight,
      npcs: [
        { npc: 'pf_hgmabsalom', x: 12, y: 25 },
        { npc: 'pf_hgmbryony', x: 7, y: 15 },
        { npc: 'pf_hgmpetronella', x: 19, y: 20 },
        { npc: 'pf_hgmdobbin', x: 6, y: 38 },
        { npc: 'pf_hgmambrose', x: 12, y: 36 },
        { npc: 'pf_hgmketty', x: 9, y: 64 },
        { npc: 'pf_hgmezra', x: 63, y: 43, hidden: true },
        { npc: 'pf_hgmbettony', x: 70, y: 41, hidden: true },
        { npc: 'pf_hgmmardle', x: 74, y: 21, hidden: true },
      ],
      scenes: [
        {
          room: 'Village green', title: 'A village that will not sleep',
          read: 'Candles burn in every window, and every doorway has somebody in it, yawning and refusing to go to bed. A little round man rings a bell at you. "Strangers! Excellent. Hereinafter you are hired."',
          gm: 'Absalom Thrupp explains: three nights of the mill grinding by itself, eleven sleepers, and nobody brave enough to go and look. Show the notice. He points the heroes to the moot hall, the bakery and the inn. Keep this quick.',
          handout: 'hgm-notice',
        },
        {
          room: 'Moot hall', title: 'The sleepers',
          read: 'Eleven people lie on straw in the moot hall, smiling in their sleep. Their hair is wet. A girl by the fire is writing on a slate without opening her eyes.',
          gm: 'No normal means wakes them (DC 12 Medicine: deep dreaming, not sickness). Bryony\'s slate is the first clue. A hero who sits by a sleeper and listens hears, very faintly, water and a millwheel. If a hero ate the bread (see hooks), their dream matches the sleepers\'.',
          handout: 'hgm-slate',
        },
        {
          room: "Crale's bakery", title: 'Bread from nowhere',
          gm: 'Petronella shows the green-tied sacks: they appear on her step before dawn. The flour smells of mud and fen-poppy (DC 11 Nature). She is ashamed and furious, and wants to come along. Let her bring a lantern and a rolling pin; she does not fight well but she never runs.',
        },
        {
          room: 'The Barley Mow', title: 'The wide-awake man',
          read: 'A man in a straw hat is singing "One Man Went to Mow" for what is clearly the hundredth time, pinching himself on every verse. In the snug behind the bar, a very large man is trying to hide behind a very small pint.',
          gm: 'Dobbin saw wet grey shapes carrying sacks out of the mill at midnight, and dozes off once to speak in the Mardle\'s voice. Ambrose admits Gammer Bettony made him promise to sleep at the mill, and that he broke the promise at midsummer. A DC 12 Persuasion (or a kind word about Bryony) gets him to come along, very slowly, at the back.',
        },
        {
          room: 'Tithe barn', title: 'Sleepwalking rats', optional: true, encounter: 'Sleepwalking rats',
          gm: 'Rats full of night-flour shamble about the barn asleep, biting whatever they bump into. Light or loud noise wakes them and they flee. Shows the heroes what the flour does, if they have not worked it out.',
          treasure: 'In the loft, the tithe box: 14 sp, 30 cp and a silver ring (10 gp) that somebody "tithed" by mistake.',
        },
        {
          room: "Ketty's eel hut", title: 'The eel-wife', optional: true,
          read: 'The hut sways on its stilts. An old woman in waders looks you up and down and says to the bucket at her feet, "Visitors, Gertrude. Mind your manners."',
          gm: 'Ketty knows the Mardle is bound by her word, and teaches the rhyme. Help with an eel trap (DC 10 Dexterity or Survival) and she gives a flask of eel-oil and tells them about the barrow\'s back door into the knoll.',
          handout: 'hgm-rhyme',
          treasure: 'A flask of eel-oil (potion of water breathing) and a smoked eel (one day\'s rations, delicious).',
        },
        {
          room: 'The Mere', title: 'Poppies at the Mere', optional: true, encounter: 'Poppy-pickers at the Mere',
          read: 'The edge of the Mere is red with poppies, and among them small mud-people are picking, giggling, and stuffing petals into a sack.',
          gm: 'Two mud mephits with two giant frogs in the shallows. The mephits can be bribed (anything shiny, DC 12 Persuasion) and tattle about the larder of dreams. Fen-poppy smoke wakes a sleeper for a minute.',
          treasure: 'The mephits\' sack: fen-poppies, a tin whistle and 9 gp in muddy coins.',
        },
        {
          room: "Miller's cottage", title: "Gammer's sampler",
          read: 'The cottage is cold and very neat. Above the fireplace hangs a sampler in green thread, the stitches so small and tight they look like print.',
          gm: 'The sampler is the bargain. Reading it, Ambrose goes white and sits down in the rocking chair. A DC 12 Investigation finds the loose hearthstone.',
          handout: 'hgm-sampler',
          treasure: 'Under the hearthstone: 35 gp in a stocking, 2 potions of healing, and Bettony\'s silver thimble (5 gp).',
        },
        {
          room: 'Hagsmoor mill', title: 'The night shift', encounter: 'The night shift',
          read: 'The stones grind on in the dark. Grey, dripping shapes carry sacks, pour, stack and turn, and do not look up. One of them, taller than the rest, has a brass key round his neck.',
          gm: 'Five drowned millhands, Ezra Lumm among them. They work until disturbed. Shutting the sluice stops the wheel and draws them outside. Saying Ezra\'s name and Bettony\'s (DC 12 Persuasion) stops the whole shift without a fight. Ezra has the cellar key.',
          treasure: 'Ezra\'s brass cellar key. In the hopper: a lost wedding ring (15 gp).',
        },
        {
          room: 'Drowned barrow', title: 'The barrow way', optional: true, encounter: 'The barrow sleepers',
          read: 'Inside the mound, peat-water lies ankle deep. Four bundles of bones rest on stone shelves, and every skull is turned to stare at the back wall.',
          gm: 'The back way under the knoll. An offering at the door keeps the dead still; touching the back wall without one wakes them. The secret door (DC 13 Perception) opens on the barrow passage to the sunken cellar.',
          treasure: 'Grave goods: a bronze torc (25 gp), 30 gp in old green coins, and a spell scroll of Protection from Evil and Good.',
        },
        {
          room: 'Sunken cellar', title: 'Gammer Bettony',
          read: 'On a sack of flour in the tilting cellar sits a little see-through old woman, knitting with pondweed. "Oh, it\'s you lot," she says. "Took your time. Is my Ambrose with you, or is he still hiding in the pub?"',
          gm: 'Bettony tells the whole story and the trick: ask the Mardle three times, kindly, with something real to offer. She also points out, drily, that a Crale napping right here would stop the grinding tonight. If Ambrose is present she scolds him, then hugs him. The heroes can take a short rest here.',
        },
        {
          room: 'Dream-pool grotto', title: "The Mardle's due", encounter: 'The Mardle',
          read: 'The green pool lights the cave from below, and dreams float over it like bubbles. The water bulges, and a long, thin woman rises out of it, smiling with too many teeth. "There you are," she says gently. "Have you brought what\'s owed?"',
          gm: 'Let her talk first. Bargain: three kind, fair offers (DC 12 Persuasion each); she accepts a Crale sleeping at the mill again, and back pay in the heroes\' dreams for a month or something clever. Trick: a Crale asleep under the mill roof right now stops her at once. Fight: she is deadly at level 1; she offers terms below half HP and flees at 10 HP. Smashing the quern frees all the dreams but breaks the bargain: the pond will dry up within a year. The larder holds the sleepers\' bottled dreams and her hoard.',
          treasure: "In the larder's sunk chest: 80 gp in drowned coins, a silver comb set with river pearls (40 gp), and a pouch of Dust of Dryness (1d6 + 4 pinches). The eleven bottled dreams wake their sleepers when poured into their mouths.",
        },
      ],
      wrapUp: 'At cockcrow the sleepers sit up one after another, sneezing pondweed, and Bryony runs to her dad. If the bargain was renewed, the mill grinds by day again and a Crale sleeps under its roof each night; Gammer Bettony is gone, and her grave is dry. Absalom pays up (after deductions for a broken window) and the village bakes a huge loaf, with ordinary flour, to celebrate. The heroes reach level 2.',
    },
  ],
  ending:
    'Good ending: a fair new bargain. Ambrose and Petronella take turns sleeping at the mill (they find it rather cosy), the sleepers wake, the wheel turns by day, and Gammer Bettony rests at last. The Mardle sends a fat eel to the bakery every midwinter, which nobody dares to refuse. Rough ending: the quern is smashed or the Mardle is driven off. The sleepers wake, but the bargain is broken, and over the next year the millpond shrinks and Hagsmoor must find a new way to grind its barley. Bad ending: dawn comes first. The eleven sleepers never wake, smiling forever, and the mill grinds every night. Next: the Mardle keeps other bargains up and down the fen, and some of them were made by people who are still alive. Her larder has a bottle labelled with a name one of the heroes knows.',
};

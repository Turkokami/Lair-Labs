// The Bandits of Crow's Ferry: a one-session adventure for four heroes of level 2.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

// Key columns: the hidden ford, the mill weir and the ferry rope.
const FORD = 7, WEIR = 30, FERRY = 50;

function crowsFerry() {
  const b = new MapBuilder('adv-crows-ferry', "Crow's Ferry on the Sallowrun", 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'wood', theme: 'wood' });
  const r = rng(4417);
  const trees = (x0: number, y0: number, w: number, h: number, n: number, kinds: string[], seed: number) => {
    const t = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = x0 + Math.floor(t() * w), y = y0 + Math.floor(t() * h);
      if (b.cellAt(x, y) === 1) b.prop(kinds[Math.floor(t() * kinds.length)], x, y);
    }
  };
  const road = (pts: [number, number][], w: number, mat = 'dirt') => {
    for (let i = 0; i < pts.length - 1; i++) {
      let [x, y] = pts[i];
      const [bx, by] = pts[i + 1];
      b.paint(x, y, w, w, mat);
      while (x !== bx || y !== by) {
        if (Math.abs(bx - x) >= Math.abs(by - y)) x += Math.sign(bx - x); else y += Math.sign(by - y);
        b.paint(x, y, w, w, mat);
      }
    }
  };

  // ---------- the shape of the Sallowrun ----------
  // top: first water row (far bank side), bot: last water row (near bank side)
  const top: number[] = [], bot: number[] = [];
  let jt = 0, jb = 0;
  for (let x = 0; x < 80; x++) {
    const c = 37 + Math.round(3 * Math.sin(x / 9 + 0.4));
    jt = Math.max(-1, Math.min(1, jt + Math.round((r() - 0.5) * 1.6)));
    jb = Math.max(-1, Math.min(1, jb + Math.round((r() - 0.5) * 1.6)));
    let t = c - 7 + jt;
    if (x >= 36 && x <= 62) t = Math.max(t, 28);
    if (x >= 10 && x < WEIR) t -= 1; // the millpond is wider
    top.push(t); bot.push(c + 7 + jb);
  }
  for (let x = 0; x < 64; x++) {
    b.water(x, top[x], 1, bot[x] - top[x] + 1, false);
    b.water(x, top[x] + 2, 1, bot[x] - top[x] - 3, true);
    if (r() < 0.45) b.mud(x, top[x] - 1, 1, 1);
    if (r() < 0.45) b.mud(x, bot[x] + 1, 1, 1);
  }

  // ---------- the marsh downstream ----------
  const chan = (x: number) => Math.round(top[62] + 6 - (x - 62) * 0.35);
  for (let y = 6; y < 74; y++) {
    // the marsh's ragged west edge (kept clear of the stockade wall)
    const x0 = Math.max(y >= 3 && y <= 25 ? 62 : 56, 64 - Math.round(2.5 * Math.sin(y / 4.3) + 1.5 * Math.sin(y / 1.7)));
    for (let x = x0; x < 80; x++) {
      if (y > 48 && x < 64 - (y - 48) % 3) continue;
      const n = 0.8 * Math.sin(x * 0.55 + 1.3) + Math.sin(y * 0.47 + x * 0.21) + 0.7 * Math.sin((x - y) * 0.33 + 2) + 0.5 * Math.sin((x + y) * 0.9) + (r() - 0.5) * 0.7;
      if (n > 0.7) continue; // grassy hummock
      if (n > 0) b.mud(x, y, 1, 1);
      else if (n > -1) b.water(x, y, 1, 1, false);
      else b.water(x, y, 1, 1, true);
    }
  }
  for (let x = 62; x < 80; x++) b.water(x, chan(x) - 2, 1, 5, false).water(x, chan(x) - 1, 1, 3, true);

  // ---------- NEAR BANK (south): where the heroes arrive ----------
  road([[49, 79], [49, 66], [47, 61], [46, 51], [49, bot[49] + 1]], 2);
  road([[48, 70], [36, 69], [24, 71], [14, 66], [FORD, bot[FORD] + 1]], 1);
  road([[51, 66], [58, 62], [59, bot[59] + 1]], 1);
  road([[35, 69], [31, 64], [WEIR, bot[WEIR] + 1]], 1);

  b.area('Gibbet Crossroads', [[42, 67, 14, 13]], {
    read: `The King's road comes up out of the hills and splits at a gibbet. An iron cage creaks on its chain, empty but for a crow. Nailed to the post, a fresh poster flaps in the wind: a woman's face, and a lot of gold.`,
    gm: `Start here at dusk. The poster is the Reeve's bounty (handout). From here the river is a quarter mile north: smoke still rises from the burned inn. Paths lead west into Crowwood and east toward the stilt village.`,
    label: [49, 72],
  });
  b.prop('gibbet-post', 46, 70).prop('cage-hanging', 46, 71).prop('signpost', 51, 68).prop('milestone', 52, 75).prop('notice-board', 47, 69);
  b.prop('wagon', 54, 74).prop('campfire-cold', 44, 76).props_('grass-tall', [[43, 73], [55, 71], [53, 78]]).prop('road-shrine', 44, 68);
  b.start(48, 75, 3, 3);

  b.building("The Ferryman's Rest", 40, 52, 12, 8, {
    mat: 'wood-planks-dark',
    read: `The inn is a black skeleton. Its roof has fallen into its own common room, and the sign over the door has burned down to the words FERRYMAN'S RE. It still smells of smoke, and of fish.`,
    gm: `Burned three weeks ago in a lizardfolk raid. The raiders took the strongbox, the smoked fish and every scrap of metal, and left. Clues (DC 12 Investigation): the strongbox was pried off the floor with something like a bone pick; long three-toed prints in the ash; a shed lizard scale. The cellar (trapdoor) is intact: Bess keeps the last kegs there.`,
    doors: [[45, 52, 'n', 'open'], [46, 52, 'n', 'open'], [51, 56, 'e', 'open'], [43, 59, 's', 'open']],
    windows: [[40, 54, 'w'], [40, 57, 'w'], [48, 52, 'n'], [51, 54, 'e']],
  });
  b.wallRun(48, 55, 4, 'n').door(49, 55, 'n', 'open');
  b.area('Burned kitchen', [[48, 55, 4, 4]], { gm: `The kitchen hearth still stands. A scorched iron pot holds a lizardfolk spear-head of sharpened river stone (DC 10 Nature: lizardfolk work, and fresh).`, label: [49, 57] });
  b.rubble(41, 53, 3, 2).rubble(44, 56, 2, 3);
  b.prop('ceiling-rubble', 42, 53).prop('bar-counter', 46, 54).prop('broken-furniture', 41, 57).prop('debris-wood', 44, 54).prop('embers-ash', 47, 57).prop('hearth-oven', 50, 56).prop('trapdoor', 42, 58).prop('tavern-sign', 47, 51).prop('table-round', 45, 57).prop('keg-rack', 50, 58);
  b.building('Burned stable', 54, 54, 6, 5, {
    read: `Half a stable, roofless and charred. A grey mule stands in the one surviving stall, chewing, entirely unbothered.`,
    gm: `The mule is called Penance and belongs to Bess. A child's wooden sword lies in the straw: Bess's daughter Moll was hiding here during the raid, and the Crows pulled her out.`,
    doors: [[54, 56, 'w', 'open'], [57, 58, 's', 'open']],
  });
  b.prop('hay-bale', 55, 55).prop('water-trough', 58, 55).prop('debris-wood', 58, 57).prop('hitching-post', 55, 57);
  b.area("Survivors' camp", [[37, 60, 17, 6]], {
    read: `Behind the ruin a few tents huddle round a cook-fire. A broad woman with soot to her elbows is stirring a pot and swearing at it.`,
    gm: `Bess Mabry, the innkeeper, her daughter Moll (8), and two stranded carters. Bess tells it straight: lizardfolk burned her out, and the Crows rowed over and fought them off. "And then they charged me half a sack of flour to cross the next day. Make of that what you like." Aldous Varnam calls this "nonsense, they staged it".`,
    label: [44, 63],
  });
  b.props_('tent', [[38, 62], [41, 64], [52, 63]]).prop('campfire', 45, 62).prop('cooking-pot-fire', 46, 62).props_('bedroll', [[39, 64], [50, 61]]).prop('cart', 37, 61).props_('barrel-group', [[52, 61]]).prop('washbasin', 48, 64);
  b.light(45, 62, 15, 20);

  const nl = bot[FERRY] + 1;
  b.area('The Near Landing', [[45, nl, 10, 51 - nl]], {
    read: `A muddy landing with a jetty, a bell on a post, and a painted board. Across the water, a raft as big as a barn floor sits against the far bank under a stockade of sharpened logs.`,
    gm: `Ring the bell and the Crows haul the raft over on its rope (it takes 5 minutes). The toll board (handout) says what they want. The ferry rope is a cable as thick as a wrist, running from a winch on the far bank to the mooring post here. Cutting it (AC 12, 20 hp) sets the raft adrift downstream into the marsh.`,
    label: [FERRY - 3, nl + 1],
  });
  b.prop('temple-bell', FERRY + 2, nl).prop('notice-board', FERRY - 2, nl + 1).props_('mooring-post', [[FERRY - 1, nl], [FERRY + 1, nl]]).prop('rope-coil', FERRY, nl + 1).prop('dock-pier', FERRY + 3, nl - 1).props_('reeds', [[44, nl], [55, nl]]).prop('crate', 53, nl + 2);
  b.floor(FERRY + 3, bot[FERRY + 3] - 1, 2, 2, 'wood-planks');
  // the ferry raft, docked on the near side when the heroes ring
  b.floor(FERRY - 1, bot[FERRY] - 3, 3, 3, 'wood-planks');
  b.area('The ferry raft', [[FERRY - 1, bot[FERRY] - 3, 3, 3]], {
    read: `The raft is forty feet of tarred logs lashed together, with a rail on each side and a pulley block riding along the great rope above it. It rocks under your feet.`,
    gm: `The raft moves on the rope at 20 ft a round when four people haul it. In a fight on the raft: anyone shoved off the side falls into deep water. If the rope is cut, the raft drifts 30 ft east each round and grounds on the sandbar or in the marsh. Drawn here at the near landing; move the tokens with the raft.`,
    label: [FERRY, bot[FERRY] - 2],
  });
  b.props_('crate-stack', [[FERRY - 1, bot[FERRY] - 3]]).prop('rope-coil', FERRY + 1, bot[FERRY] - 1).prop('lantern-standing', FERRY + 1, bot[FERRY] - 3);
  b.light(FERRY + 1, bot[FERRY] - 3, 10, 15);
  b.encounter("Lenard's ferry toll", [FERRY - 3, bot[FERRY] - 4, 8, 8], [['bandit', 4], ['thug', 1]], 'low');

  // Heronstilts: the fishing village on stilts
  const hy = Math.round((top[59] + bot[59]) / 2) + 1;
  b.hall(59, bot[59] + 1, 59, hy - 4, 1, { mat: 'wood-planks-dark' });
  b.hall(53, hy + 1, 59, hy + 1, 1, { mat: 'wood-planks-dark' });
  b.hall(59, hy - 4, 63, hy - 4, 1, { mat: 'wood-planks-dark' });
  b.hall(59, hy + 4, 62, hy + 4, 1, { mat: 'wood-planks-dark' });
  b.building("Wrenna's stilt-house", 60, hy - 1, 4, 3, {
    read: `A stilt-house bigger than the rest, with nets drying on the rail and a heron's skull nailed over the door. Inside, every wall is hung with children's drawings of crows.`,
    gm: `The headwoman's house. Wrenna keeps a tally stick of every sack of flour, keg of arrows and coin the Crows have sent over: it adds up to far more than the toll on any one traveller. (Proof that the toll goes to the village.)`,
    doors: [[60, hy, 'w']],
    windows: [[63, hy, 'e']],
  });
  b.building('The net-loft', 54, hy - 2, 3, 3, { gm: `Nets, floats and eel-traps. Two village children hide here during the raid; they know the hummock path through the reeds to the Drowned Shrine "where the lizard eggs were".`, doors: [[55, hy, 's']] });
  b.building('Smokehut', 60, hy - 7, 3, 3, { gm: `The village's smokehouse: empty racks. The lizardfolk took every fish.`, doors: [[61, hy - 5, 's']] });
  b.building('Eel-wife hut', 55, hy + 2, 3, 3, { gm: `Old Tib the eel-wife lives here. She sold the Crows the raft's new rope and knows the river better than anyone except the miller.`, doors: [[56, hy + 2, 'n']] });
  b.area('Heronstilts', [[53, hy - 7, 12, 13]], {
    read: `A village of tar-black huts stands on stilts in the shallows, joined by plank walkways that bounce when you step on them. Herons stalk the mud between the posts. Nobody is fishing.`,
    gm: `Thirty fisherfolk who have nowhere else to go. They love the Crows, who send them food, arrows and coin, and post a guard every new moon. They are terrified of the lizardfolk, who come out of the reeds at night for fish, nets, pots and anything that shines. Walkways: a creature knocked prone on them falls into the shallows (DC 11 Dexterity save). The tide of the raid: see the scene.`,
    label: [58, hy - 2],
  });
  b.props_('fishing-net', [[57, hy + 1], [62, hy - 4]]).props_('fish-crate', [[53, hy + 1], [59, hy - 2]]).props_('barrel', [[59, hy + 3]]).props_('lantern-hanging', [[59, hy - 1], [62, hy + 4]]).prop('hammock', 61, hy).prop('fishing-gear', 55, hy - 1).prop('rowboat', 64, hy + 3, 90).prop('canoe', 52, hy + 2, 90).props_('lily-pads', [[57, hy - 4], [63, hy + 2]]).prop('mooring-post', 63, hy - 4).prop('table-round', 62, hy - 1).prop('herbs-drying', 61, hy - 6);
  b.light(59, hy - 1, 10, 15).light(62, hy + 4, 10, 15);
  b.encounter('Raid on Heronstilts', [53, hy - 7, 12, 13], [['lizardfolk', 4], ['giantFrog', 2]], 'moderate');
  b.area('Heronstilts shore', [[54, bot[58] + 1, 10, 6]], {
    read: `Boats lie upside down on the mud, and drying racks stand empty. A girl is mending a net with a knife in her teeth.`,
    gm: `The way out to the stilts. From here a boy with a coracle will paddle anyone anywhere on the river for a copper, and will mention, unasked, that "the Crow lady is sweet on our Wrenna" (she is not; Brannock just eats supper there on new-moon nights).`,
    label: [58, bot[58] + 3],
  });
  b.props_('rowboat', [[55, bot[55] + 2], [62, bot[62] + 3]], 0).props_('fishing-net', [[56, bot[56] + 4]]).prop('fish-crate', 61, bot[61] + 2).prop('cooking-pot-fire', 57, bot[57] + 5);

  // Crowwood (the near bank's west woods) and the secret way to the ford
  b.area('Crowwood', [[12, 50, 22, 18]], {
    read: `Old oaks lean over a path of black leaf-mould. Every few trees, someone has cut a notch in the bark at knee height, so low you would only see it if you were looking for it.`,
    gm: `The notches mark the way to the Drowned Road (the hidden ford). A DC 13 Survival or Investigation spots them; a local (Bess, Garran, any villager) knows them. Crows nest in every tree, and they all take off at once if anyone fights here.`,
    label: [22, 58],
  });
  for (const [cx, cy, rx, ry] of [[18, 54, 2, 1.5], [27, 62, 2.5, 1.5], [14, 75, 3, 2], [30, 76, 2, 2], [6, 70, 2, 3]]) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
        if (((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1) b.rock(x, y, 1, 1);
  }
  trees(1, 48, 38, 31, 70, ['tree-oak', 'tree-oak', 'tree-birch', 'bush', 'ferns'], 4420);
  b.props_('stump', [[24, 56], [11, 63]]).prop('log-fallen', 20, 60).prop('mushrooms', 26, 58).props_('thorn-bush', [[17, 56], [29, 64]]);
  b.area("The ferrymen's graves", [[30, 51, 7, 6]], {
    read: `Under a willow, five old gravestones lean together, each carved with a little raft. The newest has fresh river-lilies on it.`,
    gm: `The Ferrick family, ferrymen here for a hundred years. The newest grave is Ned Ferrick, Lenard's father, drowned this spring "by a black thing in the water" (DC 12 Investigation: his headstone was carved by Crows' hands, and the bill for it is in Brannock's ledger). Lenard brings the lilies.`,
    label: [33, 53],
  });
  b.props_('open-grave', [[31, 53]]).props_('cairn', [[32, 52], [34, 52], [35, 54]]).prop('tree-willow', 33, 51).prop('flowers', 34, 53).prop('standing-stone', 31, 55);
  b.area('Drowned Road south bank', [[3, bot[FORD] + 1, 9, 6]], {
    read: `The path stops at a gravel beach where an old milestone lies on its side. The river here looks as wide, brown and deep as anywhere else.`,
    gm: `The near end of the hidden ford. A milestone, half in the water, reads DUNMARROW 9 (the old road ran here before the river moved). A DC 14 Perception spots the paler line of stones under the water.`,
    label: [FORD, bot[FORD] + 3],
  });
  b.prop('milestone', FORD, bot[FORD] + 1, 90).prop('tree-willow', 4, bot[4] + 3).prop('reeds', 10, bot[10] + 1).prop('boulder', 3, bot[3] + 2);

  // ---------- THE RIVER ----------
  for (let y = top[FORD]; y <= bot[FORD]; y++) b.water(FORD, y, 2, 1, false);
  b.props_('boulder', [[FORD, top[FORD] + 3], [FORD + 1, top[FORD] + 7], [FORD, bot[FORD] - 4]]).prop('rapids', FORD + 3, top[FORD] + 6).prop('deep-water', FORD - 3, top[FORD] + 5);
  b.area('The Drowned Road', [[FORD - 1, top[FORD], 4, bot[FORD] - top[FORD] + 1]], {
    read: `Under the brown water, if you squint, there is a paler line: old paving stones, running straight across the river like a road that forgot to stop.`,
    gm: `The ford only locals know: an old causeway, waist-deep, 10 ft wide. Off it, the water is deep and fast. Walking it needs no check by day; at night, or in a hurry, DC 10 Athletics or step off into deep water (DC 12 Athletics to swim back). A giant constrictor snake lives in the deep hole on the downstream side and hunts anything that splashes.`,
    label: [FORD, top[FORD] + 2],
  });
  b.encounter('The snake in the ford', [FORD - 3, top[FORD], 8, bot[FORD] - top[FORD] + 1], [['giantConstrictorSnake', 1]], 'low');
  b.area('The Millpond', [[12, top[20], 16, bot[20] - top[20] + 1]], {
    read: `Above the weir the river slows into a long, dark pond. The surface is smooth as oil, and something long drifts under it, then is gone.`,
    gm: `Deep and still. Easy swimming (DC 8 Athletics), but slow. The thing under the water is only a log. Probably.`,
    label: [18, top[18] + 4],
  });
  b.props_('lily-pads', [[14, top[14] + 1], [24, bot[24] - 1]]).prop('reeds', 12, bot[12]).prop('log-fallen', 20, top[20] + 5, 30);
  for (let y = top[WEIR] - 1; y <= bot[WEIR] + 1; y++) b.floor(WEIR, y, 1, 1, 'stone-cobble');
  b.area('The Weir', [[WEIR - 1, top[WEIR] - 1, 3, bot[WEIR] - top[WEIR] + 3]], {
    read: `A low wall of stone runs right across the river, with the millpond lapping at one side and white water roaring down the other. Its top is one stride wide and green with weed.`,
    gm: `The weir walk: a one-square path across the river. DC 12 Acrobatics each time a creature crosses (DC 15 if it runs, fights or is hit); fail by 5 or more and it slides off the downstream side into the churn below (DC 13 Athletics to get out, or take 1d6 bludgeoning each round). Two crocodiles wait in the churn for stunned fish, and for anything else that comes down.`,
    label: [WEIR, top[WEIR] + 4],
  });
  b.props_('rapids', [[WEIR + 1, top[WEIR] + 3], [WEIR + 2, top[WEIR] + 7], [WEIR + 1, bot[WEIR] - 2]]).prop('crumbling-ledge', WEIR, top[WEIR] + 6).prop('fishing-net', WEIR, bot[WEIR]);
  b.encounter('Crocodiles below the weir', [WEIR + 1, top[WEIR], 6, bot[WEIR] - top[WEIR] + 1], [['crocodile', 2]], 'low');
  const gy = Math.round((top[38] + bot[38]) / 2);
  b.cave('Gull Island', 38, gy + 0.5, 5.5, 2.2, {
    seed: 4431, mat: 'sand',
    read: `A long bar of pale sand in the middle of the river, covered in gull droppings and driftwood. A wrecked rowboat lies on it upside down.`,
    gm: `Halfway across, a place to rest for swimmers (the deep water on either side is DC 12 Athletics; fail and lose 15 ft downstream and swallow water). Under the wrecked rowboat: a lizardfolk tribute bundle wrapped in reeds, dropped in a hurry (a silver locket, 14 sp, a brass ferry token). The Crows use the island as a lookout post on new-moon nights.`,
  });
  b.prop('rowboat', 37, gy, 0).props_('debris-wood', [[34, gy + 1], [41, gy]]).props_('reeds', [[33, gy], [43, gy + 1]]).prop('skull-bleached', 40, gy + 1).prop('gm-treasure', 37, gy, 0, { gm: true }).prop('campfire-cold', 39, gy);
  b.area('The Sallowrun', [[FERRY - 8, top[44] + 2, 6, 8]], {
    read: `The Sallowrun is a quarter mile wide here, brown and fast and full of whirling leaves. It smells of mud and, faintly, of something sour, like vinegar.`,
    gm: `Swimming the deep middle: DC 12 Athletics each round or be carried 15 ft east; three failures in a row and a swimmer starts to drown. The sour smell is the dragon's acid upriver from the marsh (DC 13 Nature: something is fouling the water; dead fish wash up along the banks).`,
    label: [FERRY - 6, top[44] + 5],
  });
  b.props_('rapids', [[44, top[44] + 6], [56, top[56] + 5]]).props_('deep-water', [[46, top[46] + 4], [53, top[53] + 6]]).prop('whirlpool', 57, top[57] + 7).prop('log-fallen', 42, bot[42] - 3, 60);

  // ---------- FAR BANK (north): the Crows' stockade ----------
  road([[50, 0], [50, 4]], 2);
  road([[49, 24], [49, top[49] - 1]], 2);
  road([[41, 4], [34, 6], [26, 12], [24, 19]], 1);
  b.paint(41, 5, 19, 19, 'dirt');
  b.wallRun(40, 4, 21, 'n').wallRun(40, 24, 21, 's').wallRun(40, 4, 21, 'w').wallRun(60, 4, 21, 'e');
  b.door(49, 24, 's', 'closed', 'door-wood').door(50, 24, 's', 'closed', 'door-wood').door(50, 4, 'n', 'locked', 'door-wood');
  b.door(60, 19, 'e', 'secret');
  b.area("The Crows' yard", [[41, 16, 12, 8]], {
    read: `Inside the stockade, the Crows' yard is busy and neat: a cook-fire, a line of washing, an archery butt stuck full of arrows, and a pile of seized goods under a sailcloth. Somebody is singing badly.`,
    gm: `Fifteen Crows live here: ten deserters from the Sallowrun Watch and a few river folk who joined them. They are drilled, tired and decent. Sneaking in: DC 13 Stealth past the lookouts on the platforms. The Crows will not kill a captive; they tie them up and feed them.`,
    label: [46, 20],
  });
  b.prop('campfire', 45, 19).prop('cooking-pot-fire', 46, 19).prop('archery-target', 42, 17).prop('training-dummy', 43, 21).props_('bench', [[44, 21], [47, 21]]).prop('well', 50, 18).prop('loot-sacks', 52, 22).prop('weapon-barrel', 41, 22).prop('war-banner', 50, 16).prop('cage-hanging', 47, 17);
  b.light(45, 19, 15, 20);
  b.props_('crows-nest', [[41, 5], [59, 23]]).props_('ladder', [[42, 5], [58, 23]]).props_('brazier', [[48, 23], [51, 23]]);
  b.light(48, 23, 10, 15).light(51, 23, 10, 15);
  b.encounter('The stockade gate', [44, 20, 12, 8], [['bandit', 2], ['scout', 1], ['thug', 1], ['mastiff', 2]], 'low');

  b.building('The Toll-House', 42, 6, 11, 8, {
    mat: 'stone-flagstone',
    read: `The old toll-house is the only stone building for miles: thick walls, iron bars on the windows and a crow painted over the door. Inside it smells of ink, tallow and wet dog.`,
    gm: `Once the Crown's toll office, now Brannock's headquarters. The front room holds the tally desk, the map of the river with every lizardfolk raid pinned on it, and the strongbox. A curtain hides Brannock's room at the back. The Crows' ledger (handout) lies open on the desk.`,
    doors: [[47, 13, 's'], [52, 9, 'e']],
    windows: [[42, 8, 'w'], [44, 6, 'n'], [50, 6, 'n'], [42, 11, 'w']],
  });
  b.wallRun(42, 10, 6, 'n').door(44, 10, 'n', 'open');
  b.area("Brannock's room", [[42, 6, 6, 4]], {
    gm: `A soldier's cot, a soldier's footlocker and a soldier's habits: the blanket is folded square. Under the cot, wrapped in oilcloth, is her old Watch tabard and the order that made her desert (the withdrawal order, a copy of the one in the watchtower).`,
    label: [44, 7],
  });
  b.prop('desk', 47, 11).prop('chair', 47, 12).prop('table-maps', 50, 11).prop('strongbox', 51, 7).prop('book-pile', 46, 11).prop('cot', 43, 7).prop('footlocker', 46, 7).prop('weapon-rack', 49, 7).prop('fireplace', 51, 12).prop('lantern-hanging', 48, 9).prop('gm-treasure', 51, 7, 0, { gm: true }).prop('banner-hanging-tall', 45, 8);
  b.light(48, 9, 10, 15);
  b.encounter('Storming the Toll-House', [42, 6, 14, 14], [['banditCaptain', 1], ['thug', 2], ['bandit', 2]], 'high');
  b.building('Bunkhouse', 54, 6, 6, 9, {
    read: `Bunks in rows, a stove, boots drying round it. Someone has carved a little crow on every bunk post.`,
    gm: `Off-duty Crows sleep here: at night, four of them. A DC 12 Investigation finds Watch insignia cut off uniforms and kept in a cigar box, every one of them. They are ashamed, and proud.`,
    doors: [[54, 10, 'w'], [57, 14, 's']],
  });
  b.props_('bunk-bed', [[55, 7], [58, 7], [55, 12], [58, 12]]).prop('stove', 57, 9).prop('footlocker', 58, 10).prop('coat-rack', 55, 9);
  b.building('Kennel', 41, 16, 3, 3, { mat: 'dirt', gm: `Two mastiffs, Bacon and Sergeant. They bark at strangers, and roll over for anyone who offers meat (DC 10 Animal Handling).`, doors: [[43, 17, 'e']] });
  b.prop('straw-bed', 42, 17).prop('water-trough', 41, 18);
  b.building('The Toll Pile', 54, 17, 6, 5, {
    read: `A shed stacked with bolts of cloth, barrels, sacks and a very fine saddle. Each item has a paper tag tied on with string.`,
    gm: `Half of everything the Crows have taken in two months, waiting to be sold upriver. Each tag names the owner and what it was traded for ("Silk, Master Jessop: 40 arrows, 3 sacks flour, to Heronstilts"). About 200 gp of goods in all.`,
    doors: [[54, 19, 'w']],
  });
  b.props_('crate-pile', [[55, 18], [58, 18]]).prop('barrel-stack', 58, 20).prop('flour-sacks', 56, 20).prop('chest', 55, 20);
  b.area('The Far Landing', [[43, 25, 13, top[49] - 25 + 2]], {
    read: `The ferry rope comes out of the river and wraps round a great wooden winch on the bank. Two Crows sit beside it on upturned buckets, playing dice and watching you.`,
    gm: `The winch hauls the raft (DC 13 Strength to turn it alone). Lock it with its pin and nobody pulls the raft across. Locking or cutting the rope is how the Crows defend the river; the lizardfolk can swim, though.`,
    label: [47, 26],
  });
  b.prop('winch', FERRY, top[FERRY] - 1).props_('mooring-post', [[FERRY - 1, top[FERRY] - 1], [FERRY + 1, top[FERRY] - 1]]).prop('rope-coil', FERRY + 2, top[FERRY] - 2).props_('barrel', [[45, 26], [54, 26]]).prop('dock-pier', FERRY - 3, top[FERRY]).prop('lamp-post', 52, 25);
  b.floor(FERRY - 3, top[FERRY], 2, 2, 'wood-planks');
  b.light(52, 25, 10, 20);
  b.area('The reed gate', [[61, 17, 3, 5]], {
    gm: `A secret door in the stockade's east wall (DC 15 Perception from outside: the reeds are trampled in a line to one plank). The Crows' bolt-hole out to the marsh, and the way their new-moon patrols slip out. From inside it is plainly a door.`,
    label: [62, 19],
  });
  b.prop('reeds', 62, 18).prop('mud-patch', 61, 20);
  b.area('The Turnip Field', [[26, 0, 13, 12]], {
    read: `A field of turnips, recently weeded, with a scarecrow in a Watch tabard. The crows sit on its arms and ignore it.`,
    gm: `The Crows grow food for Heronstilts here. The scarecrow's tabard is real: Sallowrun Watch, sergeant's stripes (Brannock's own; she gave it to the scarecrow the day she deserted).`,
    label: [32, 5],
  });
  b.prop('scarecrow', 32, 4).prop('crop-rows', 29, 6).prop('crop-rows', 34, 8).prop('fence-wood', 27, 10).prop('fence-gate', 37, 10).prop('handcart', 36, 3);
  trees(20, 0, 20, 4, 6, ['tree-pine', 'bush'], 4421);
  b.area('The North Road', [[47, 0, 7, 4]], { gm: `The road north to the empty frontier, and to the Watch fort the soldiers abandoned. Nobody comes down it any more.`, label: [50, 1] });
  b.prop('milestone', 52, 2).prop('signpost', 48, 1);

  // ---------- the mill ----------
  const my = top[25] - 10;
  b.building('Sallow Mill', 20, my, 8, 6, {
    read: `A tall mill of grey boards stands on the bank, its great wheel turning slowly in a channel of black water. Flour-dust hangs in the doorway like smoke.`,
    gm: `Garran Corwen, the miller, still grinds a little corn for the village. He is old, deaf in one ear, and loyal to the Crows, who saved his mill from the lizardfolk. He knows the Drowned Road and draws it in flour on the floor if asked nicely (handout). He also knows the weir walk is the quick way across, "if you don't mind the crocs".`,
    doors: [[23, my + 5, 's'], [20, my + 2, 'w'], [24, my, 'n']],
    windows: [[27, my + 2, 'e'], [22, my, 'n']],
  });
  b.prop('grindstone', 25, my + 2).prop('flour-sacks', 21, my + 1).prop('workbench', 21, my + 4).prop('stair-spiral', 26, my + 4).prop('sack', 24, my + 1).prop('lantern-hanging', 23, my + 3);
  b.light(23, my + 3, 10, 15);
  b.water(28, my, 2, top[28] - my, false);
  b.props_('rapids', [[28, my + 2]]).prop('winch', 29, my + 4);
  b.area('Mill yard', [[19, my + 6, 12, top[25] - my - 6]], {
    read: `Sacks, a cart with a broken axle and a dog that does not bother to get up. The weir starts at the edge of the yard.`,
    gm: `From here the weir walk crosses the river to the near bank.`,
    label: [24, my + 7],
  });
  b.prop('cart', 21, my + 7).prop('sack', 26, my + 6);

  // ---------- Watchtower Hill ----------
  const hx = 10, hyy = 13, hrx = 9, hry = 8;
  for (let y = hyy - hry - 2; y <= hyy + hry + 2; y++)
    for (let x = hx - hrx - 2; x <= hx + hrx + 2; x++) {
      const d = Math.hypot((x + 0.5 - hx) / hrx, (y + 0.5 - hyy) / hry);
      if (d < 0.9 || d > 1.12) continue;
      if (Math.abs(x + 0.5 - hx) < 1.6 && y > hyy) continue; // south path to the ford
      if (Math.abs(y + 0.5 - hyy) < 1.6 && x > hx) continue; // east path to the mill
      b.rock(x, y, 1, 1);
    }
  road([[hx, hyy + 9], [FORD, top[FORD] - 1]], 1);
  road([[hx + 9, hyy], [20, my + 2]], 1);
  b.rock(5, 2, 10, 8);
  b.floor(8, 4, 4, 3, 'cave-floor').floor(9, 7, 1, 2, 'cave-floor');
  b.building('The ruined watchtower', 7, 9, 5, 5, {
    mat: 'stone-flagstone',
    read: `A round tower of the old Watch stands broken on the hilltop, its top floors fallen in. Bats pour out of the gap at dusk, and the stones are smeared with old blood that is not old enough.`,
    gm: `The Sallowrun Watch's lookout, abandoned in spring. A stirge colony nests in the broken upper floors and drops on anything warm. Pinned to the door, rotted: the withdrawal order (handout). A loose flagstone by the north wall hides a secret door (DC 14 Perception, or DC 10 if the heroes have seen Brannock's old Watch tabard: it is the same door every Watch tower has).`,
    doors: [[9, 13, 's', 'open']],
    windows: [[7, 11, 'w'], [11, 11, 'e']],
  });
  b.door(9, 9, 'n', 'secret');
  b.area('The hidden store', [[8, 4, 4, 5]], {
    read: `A dry little cellar cut into the rock, with Watch shields on the wall and a rack of crates. Nobody has touched it since the soldiers left.`,
    gm: `The Watch's emergency cache, still sealed with the Crown's wax. Brannock never came back for it: she left everything of the Crown's behind.`,
    label: [9, 5],
  });
  b.prop('shield-wall', 8, 4).prop('crate-stack', 11, 4).prop('chest', 10, 5).prop('gm-treasure', 10, 5, 0, { gm: true }).prop('weapon-rack', 8, 6);
  b.prop('stairs-up', 8, 11).prop('rubble-pile', 10, 10).prop('ceiling-rubble', 8, 12).prop('bones', 10, 12).prop('torch-sconce', 11, 13);
  b.area('Watchtower Hill', [[3, 8, 15, 12]], {
    read: `A steep green hill with a crown of broken rock, high enough to see the whole river: the ferry, the stockade, the stilts and, far downstream, a smudge of mist over the reeds that never moves.`,
    gm: `From the top a DC 12 Perception sees the line of the Drowned Road under the water, and at dusk something big and black sliding through the marsh channel. Paths down: south to the ford, east to the mill.`,
    label: [13, 16],
  });
  b.props_('stairs-up', [[hx, hyy + 7], [hx + 8, hyy]]).props_('boulder', [[5, 16], [15, 9]]).prop('campfire-cold', 13, 15).props_('grass-tall', [[6, 18], [13, 17]]).prop('cairn', 16, 12);
  b.encounter('The tower stirges', [4, 8, 14, 10], [['stirge', 6], ['swarmOfBats', 1]], 'low');
  trees(0, 18, 20, 9, 14, ['tree-pine', 'tree-birch', 'bush'], 4422);
  trees(0, 0, 4, 20, 5, ['tree-pine'], 4423);
  b.area('The Drowned Road north bank', [[4, top[FORD] - 4, 8, 4]], {
    gm: `The far end of the ford. A Crow stands here on new-moon nights; otherwise nobody. Footprints: boots (Crows) and, once, three-toed (a lizardfolk scout who came this way to watch the stockade).`,
    label: [FORD, top[FORD] - 2],
  });
  b.prop('reeds', 5, top[5] - 1).prop('log-fallen', 10, top[10] - 2);

  // ---------- the marsh: lizardfolk camp, frog fens and the Drowned Shrine ----------
  b.cave('Ochre Mound', 71, 13, 6, 4.5, {
    seed: 4440, mat: 'grass',
    read: `On a hummock of high ground in the reeds stands a ring of domed reed huts around a smoking fire. Crocodile skulls on poles grin at you from the mud. There are almost no eggs, no young, and almost no old ones: only warriors, thin and watchful.`,
    gm: `The Ochre-Throat lizardfolk's refuge since the dragon took their egg-mound. Kethra leads the warriors; old Shessa keeps the last of their lore. They are starving and desperate. A DC 13 Insight sees that they are not cruel but afraid. They speak Draconic; Kethra has some Common. They will talk if the heroes come openly, with no weapons drawn, or bring food.`,
  });
  b.props_('tent-round', [[68, 11], [74, 11], [69, 16], [74, 16]]).prop('campfire', 71, 13).prop('cooking-pot-fire', 72, 14).props_('skull-bleached', [[66, 13], [76, 13]]).prop('lean-to', 70, 10).prop('herbs-drying', 73, 10).prop('bones', 67, 15).prop('idol', 71, 11).prop('loot-sacks', 75, 14).prop('fishing-net', 68, 14);
  b.light(71, 13, 15, 20, '#ffa64d');
  b.encounter('The Ochre Mound', [64, 8, 15, 11], [['lizardfolk', 6]], 'moderate');
  b.area('The reed path', [[61, 21, 6, 10]], {
    read: `Reeds taller than a mounted rider close in on every side. The water underfoot is black and warm, and the only sound is frogs.`,
    gm: `Shallow water, mud and reeds: difficult ground, and you cannot see more than 10 ft. The hummock path from the Crows' reed gate to the Ochre Mound needs a DC 12 Survival to follow; fail and the heroes wade into a frog pool.`,
    label: [63, 25],
  });
  b.area('The Frog Fen', [[64, 48, 15, 14]], {
    read: `South of the river the reeds give way to round black pools. Every pool is ringed with eyes. The croaking stops, all at once.`,
    gm: `The way from Heronstilts to the Drowned Shrine on foot. A giant toad and its frogs hunt here, made bold by the dragon's leavings. Fire scatters them (any fire damage: DC 10 Wisdom save or flee).`,
    label: [71, 54],
  });
  b.encounter('Frogs in the fen', [64, 48, 15, 14], [['giantToad', 1], ['giantFrog', 3]], 'low');
  b.pool(70, 41, 8, 6.5, true);
  b.cave(null, 71, 41, 4.5, 3.3, { seed: 4441, mat: 'mud', wobble: 0.1 });
  b.building('The Drowned Shrine', 69, 39, 6, 5, {
    mat: 'stone-flagstone',
    read: `A little chapel of green stone sits half-sunk on a mud island, its roof gone, its door hanging. The water around it hisses and smokes where it laps the stones. Inside, on a mound of mud and broken shell, something black uncoils.`,
    gm: `The lizardfolk's egg-mound and holy place, built by people nobody remembers. Ulvesh lairs here now. The water round the island is deep; the dragon's acid has burned the reeds back in a ring. Three crocodiles that Ulvesh feeds serve it. The surviving eggs (eleven) are in a cracked font in the corner, kept warm under rotting weed: the dragon's hostages.`,
    doors: [[71, 39, 'n', 'open'], [69, 41, 'w', 'open'], [74, 42, 'e', 'open']],
    windows: [[72, 43, 's'], [74, 40, 'e']],
  });
  b.prop('altar', 72, 40).prop('acid-pool', 70, 42).prop('treasure-pile', 73, 41).prop('bones-mud', 70, 40).prop('font', 73, 42).prop('straw-bed', 72, 42).prop('gm-treasure', 73, 41, 0, { gm: true }).prop('pillar-broken', 69, 39).props_('tree-swamp', [[66, 37], [76, 45]]).props_('bones-mud', [[67, 43], [75, 38]]).prop('statue', 71, 44);
  b.light(70, 42, 5, 10, '#9fe870');
  b.encounter('The Black Hunger', [63, 35, 16, 13], [['blackDragonWyrmling', 1], ['crocodile', 3]], 'high');
  b.area('The tribute post', [[63, 44, 4, 4]], {
    gm: `A drowned post at the edge of the dragon's pool, where the lizardfolk leave tribute. Words are burned into it with acid, in Draconic (handout). Fish bones and a broken net are piled at its foot: last month's offering.`,
    label: [65, 46],
  });
  b.prop('mooring-post', 65, 46).prop('bone-heap', 64, 46);

  // marsh dressing
  const mr = rng(4450);
  for (let i = 0; i < 70; i++) {
    const x = 61 + Math.floor(mr() * 19), y = 6 + Math.floor(mr() * 66);
    if (!b.isFloor(x, y) || (x >= 52 && x <= 65 && y >= 30 && y <= 50) || (x >= 68 && x <= 75 && y >= 38 && y <= 44) || (x >= 66 && x <= 76 && y >= 9 && y <= 17)) continue;
    const k = ['reeds', 'reeds', 'reeds', 'lily-pads', 'tree-swamp', 'mud-patch', 'bones-mud', 'grass-tall'][Math.floor(mr() * 8)];
    b.prop(k, x, y);
  }
  b.area('The Reedbeds', [[62, 26, 18, 8]], {
    read: `Downstream the Sallowrun loses itself in a maze of reeds, channels and mud. Mist hangs in it like wet wool, even at noon.`,
    gm: `Getting lost: without a guide (lizardfolk, villager, or a DC 13 Survival), the heroes wander for an hour and meet the Frog Fen. The main channel runs east through the reeds, deep and slow; the Drowned Shrine is on its south side.`,
    label: [68, 30],
  });

  // near bank east of the village, and the far bank between mill and stockade
  trees(29, 12, 10, 14, 10, ['tree-oak', 'bush', 'thorn-bush'], 4424);
  trees(52, 64, 12, 15, 10, ['tree-willow', 'bush', 'reeds'], 4425);
  b.props_('boulder-large', [[36, 18], [33, 63]]).props_('flowers', [[38, 13], [57, 70]]).prop('beehive', 36, 22).prop('log-pile', 24, 16);
  b.note(FERRY, top[FERRY] + 2, 'The ferry rope runs straight across here, winch (north) to mooring post (south).');
  b.note(FORD, top[FORD] + 6, 'The Drowned Road: hidden ford, waist-deep, only locals know it.');
  return b.build();
}

export const CROWS_FERRY: Adventure = {
  id: 'crows-ferry',
  title: "The Bandits of Crow's Ferry",
  tagline: 'Bandits hold the only ferry on the river and rob every traveller. Find out why before you hang them.',
  levels: '2',
  sessions: '1 session (3-4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'wilderness', 'bandits', 'river', 'dragon'],
  pitch:
    "The Sallowrun is a wide brown river on the edge of the frontier, and Crow's Ferry is the only way across for forty miles. Two months ago the ferry was seized by bandits who call themselves the Crows. They charge half of everything you carry, and they have burned the inn, or so the Reeve says. There is a fat bounty on their leader, a deserter called Ardith Brannock. Ride down to the river, take back the crossing, and get paid. Simple.",
  secret:
    "Nothing at Crow's Ferry is what the bounty poster says. This spring a black dragon wyrmling called Ulvesh, cast out by its kin in the great fens to the east, came upriver looking for a kingdom. It drove the Ochre-Throat lizardfolk off their sacred egg-mound in the Drowned Shrine, kept their last clutch of eggs as hostages, and demands tribute every new moon: gold, bright things and meat, or it eats an egg. So the starving lizardfolk raid the river folk. When the raids began, the Reeve of Dunmarrow ordered the river Watch to pull back and leave the river folk to their fate. Sergeant Ardith Brannock refused. She deserted with ten soldiers, took the ferry and the old toll-house, and now robs travellers to feed and arm the fishing village of Heronstilts. Why now: tomorrow night is the new moon. The last tribute fell short. Ulvesh has told the lizardfolk it will take its payment from the humans itself, and the lizardfolk are planning one last, big raid to stop it.",
  hooks: [
    "The bounty: Aldous Varnam, who holds the Crown's charter for the ferry, hires the heroes to clear out the Crows. 100 gp for Brannock, 10 gp a head for the rest, and he rides along to see it done.",
    "The heroes simply need to cross the Sallowrun, and the Crows want half of everything they own to do it.",
    "One hero has a cousin in Heronstilts who wrote: 'The lizard-men come every new moon. The Crows help, but there are not enough of them. Come quick.'",
  ],
  tips: [
    "Show the grey early. Bess at the burned inn tells the truth about the raid, and the Crows' toll board says the poor ride free. Let the players notice before Varnam talks them out of it.",
    "There are five ways across: the ferry, swimming (and Gull Island), the weir walk, the Drowned Road ford, and a boat from Heronstilts. Each has its own risk; let the players pick.",
    "Brannock will talk before she fights. If the heroes storm the stockade, the Crows surrender once Brannock or half of them drop: they are soldiers, not killers.",
    "The new moon is a clock. If the heroes dither, run the raid on Heronstilts that night, and Ulvesh comes to the river itself the night after.",
    "In the climax, allies are simple: each Crow or lizardfolk band ties up one crocodile, or gives the heroes advantage on one attack a round. Let the heroes face the dragon.",
    "Ulvesh fights smart: it breathes acid on a group, dives into the deep water, and surfaces somewhere else. It flees at 10 hit points, and bargains if cornered.",
  ],
  npcs: [
    {
      id: 'pf_cfbrannock', name: 'Sergeant Ardith Brannock', title: "'the Crow', chief of the ferry bandits", kind: 'npc', art: 'bandit-captain', monsterId: 'banditCaptain', shared: true,
      wants: "To keep Heronstilts alive until the lizardfolk raids stop, and to never take another order from the Reeve.",
      knows: "Every raid, every tribute night, and that the lizardfolk 'pay something in the marsh'. She has not guessed it is a dragon, only that something there frightens them more than her.",
      voice: "A drill sergeant's bark, gone hoarse. Short sentences. Calls everybody 'soldier', even the mule.",
      appearance: "A rangy woman of fifty in patched Watch mail with the badges cut off, grey hair cropped to stubble, a crow feather in her helmet.",
      backstory: "Twenty years in the Sallowrun Watch. When the withdrawal order came, she read it twice, folded it up, and told her squad she was staying. Ten of them stayed with her.",
      gmNotes: "Bandit captain stat block. She will hand herself in to the Reeve, gladly, if the heroes end the lizardfolk raids: 'Then hang me. The river's safe.' She keeps her word. The heroes can argue for a pardon at the end (DC 15 Persuasion with Varnam, or with the withdrawal order as proof).",
    },
    {
      id: 'pf_cfferrick', name: 'Lenard Ferrick', title: 'the ferryman', kind: 'npc', art: 'sailor', monsterId: 'thug', shared: true,
      wants: "To run his family's ferry again, fair and free, and to kill whatever drowned his father.",
      knows: "The river, every rope and every current. His father Ned was dragged under in spring by 'a black thing, quick as an eel, with horns'. Nobody believed him that it wasn't a crocodile.",
      voice: "Slow, steady, says little. Spits in the river for luck before every crossing.",
      appearance: "A huge young man with forearms like hams and rope-burned palms, barefoot, in a fisherman's jersey.",
      gmNotes: "Thug stat block. He runs the raft for the Crows because they asked nicely and pay him. If the heroes mention a black, horned thing in the water, he joins them on the spot.",
    },
    {
      id: 'pf_cfbess', name: 'Bess Mabry', title: "keeper of the burned Ferryman's Rest", kind: 'npc', art: 'innkeeper', shared: true,
      wants: "Her inn rebuilt, her strongbox back, and somebody to finally pay for a drink.",
      knows: "Lizardfolk burned the inn, not the Crows. The Crows rowed over in the dark and pulled her daughter out of the stable. She also knows the notches in Crowwood mark the old ford.",
      voice: "Loud, warm, practical, swears creatively at pots and men.",
      appearance: "A broad woman in a scorched apron, soot to the elbows, a wooden spoon always in her hand.",
      gmNotes: "She sells the heroes stew for a copper and gossip for free. Return her strongbox (it is in the dragon's hoard) and she gives them free bed and board for life, once the inn is rebuilt.",
    },
    {
      id: 'pf_cfvarnam', name: 'Aldous Varnam', title: 'holder of the ferry charter', kind: 'npc', art: 'merchant', monsterId: 'noble', shared: true,
      wants: "His ferry back, his tolls back, and the Crows hanged as an example.",
      knows: "That the Reeve pulled the Watch out to save money. He bought the ferry charter cheap from the Crown right after, expecting to name his price to desperate travellers.",
      voice: "Smooth, nasal, always reasonable, always slightly offended. Says 'with respect' before every insult.",
      appearance: "A thin man in a good grey coat and very clean boots, holding a scented handkerchief to his nose at all times.",
      gmNotes: "Not a villain, just a man of business. He is the heroes' paymaster and will try to keep them from talking to anyone. Shown the Crows' ledger and the withdrawal order, he folds (DC 13 Persuasion): 'Very well. A pardon costs me nothing.' If the heroes kill Brannock he pays in full and raises the toll the next morning.",
    },
    {
      id: 'pf_cfwrenna', name: 'Wrenna Silt', title: 'headwoman of Heronstilts', kind: 'npc', art: 'farmer',
      wants: "Her people safe, and fish in the river again.",
      knows: "Every sack of flour and every arrow the Crows have sent (she keeps a tally stick). The lizardfolk used to trade eels for salt before this year. Something sour is in the water and the fish are dying.",
      voice: "Quiet and dry, speaks in a fisher's half-sentences. Never wastes a word.",
      appearance: "A small, weathered woman with a heron feather in her braid and a gutting knife on her belt.",
      gmNotes: "If the heroes come to hang the Crows, she meets them on the walkway with every adult in the village behind her, holding boathooks. She will not fight; she will simply stand there.",
    },
    {
      id: 'pf_cfgarran', name: 'Garran Corwen', title: 'the miller', kind: 'npc', art: 'commoner',
      wants: "Peace and quiet, and his mill wheel turning.",
      knows: "The Drowned Road, the weir walk, and that the crocodiles in the churn only came this spring, 'chased up out of the marsh by something'.",
      voice: "Shouts a little (he's deaf in one ear). Laughs at his own jokes before he finishes them.",
      appearance: "A bent old man as white as his flour, with huge hands and one gold tooth.",
      gmNotes: "Friendly to anyone who helps him lift a sack (DC 10 Athletics). Draws the ford in flour for them (handout).",
    },
    {
      id: 'pf_cfkethra', name: 'Kethra Ochre-Throat', title: 'war-leader of the lizardfolk', kind: 'monster', art: 'lizardfolk', monsterId: 'lizardfolk',
      wants: "Her people's eggs back from the black dragon, and her people fed until then, whatever it costs the soft-skins.",
      knows: "Everything about Ulvesh: its lair, its crocodiles, that it hates the sun and sleeps after it eats, and that its scales are softest under the jaw.",
      voice: "Flat and cold, a hiss on every s. Speaks Common badly but clearly. Never lies; does not understand why anyone would.",
      appearance: "A tall lizardfolk with a bright orange throat-pouch, a crocodile-jaw shield and scars of acid down one arm.",
      gmNotes: "Lizardfolk stat block with 22 hit points. She tried to fight Ulvesh once and lost four warriors. If the heroes offer to help, she leads them to the Shrine by the hummock path and brings her warriors. If her eggs come home, the raids stop that night.",
    },
    {
      id: 'pf_cfshessa', name: 'Old Shessa', title: 'egg-keeper of the Ochre-Throat', kind: 'monster', art: 'lizardfolk', monsterId: 'lizardfolk',
      wants: "To sit on the egg-mound once more before she dies, and to see the clutch hatch.",
      knows: "The Shrine is older than the lizardfolk and was built by people who 'talked to the river'. The font inside still holds clean water that the acid cannot spoil.",
      voice: "A slow, rattling whisper, with long pauses. Speaks only Draconic; Kethra translates.",
      appearance: "An ancient lizardfolk, grey-scaled and half blind, wrapped in a cloak of woven reeds and bird skulls.",
      gmNotes: "If the heroes show her kindness, she gives them a pouch of marsh salve (works as two potions of healing) and the true name of the dragon's weakness: it cannot bear bright light (sunlight, a daylight spell or a blazing fire gives its attackers advantage for a round).",
    },
    {
      id: 'pf_cfulvesh', name: 'Ulvesh', title: 'the Black Hunger, a dragon of the marsh', kind: 'monster', art: 'dragon-black-wyrmling', monsterId: 'blackDragonWyrmling',
      wants: "A hoard, a kingdom of mud and reeds, and everyone on the river bowing to it. It wants it all now, because it is very young.",
      knows: "Exactly how frightened the lizardfolk are, and that the humans upriver do not even know it exists. It thinks this is very funny.",
      voice: "A wet, delighted purr. Talks too much. Calls everyone 'little meal'.",
      appearance: "A black dragon the size of a pony, all horns and ribs, with a skull-like face and acid dripping from its jaw. It smells of vinegar.",
      backstory: "The runt of a clutch in the great fens, driven out by bigger siblings. It came upriver to be the biggest thing somewhere.",
      gmNotes: "Black dragon wyrmling stat block. It can breathe underwater and swims fast: it fights from the deep pool, breathes acid, dives and resurfaces. It flees at 10 hit points, and if cornered it offers the eggs for its life (it will keep its word only while the heroes watch). If the heroes come alone, consider letting it parley first: it offers them a share of the tribute to 'deal with' the Crows.",
    },
  ],
  handouts: [
    { id: 'cf-bounty', title: 'The bounty poster at the gibbet', text: "WANTED by order of the Reeve of Dunmarrow:\nMAUD BRANNOCK, called THE CROW.\nDeserter of the Sallowrun Watch. River-robber. Arsonist.\n100 GOLD CROWNS, alive or dead.\n10 crowns for each of her Crows.\nApply to Master Aldous Varnam, lawful holder of the Ferry Charter.\n(Someone has scrawled underneath in charcoal: SHE NEVER BURNED NOTHING)" },
    { id: 'cf-tollboard', title: "The Crows' toll board", text: "CROW'S FERRY\nUnder new management.\nTOLL: HALF. Of everything.\nPaid to the Crows, for the keeping of the river.\nChildren, the sick, the old and those with nothing: FREE.\nFolk of Heronstilts: FREE.\nTax collectors, Watch officers and Master Varnam: DOUBLE.\nRing the bell. Wait. Don't swim, there's crocs." },
    { id: 'cf-orders', title: 'The withdrawal order (rotted, pinned to the tower door)', text: "To the Sergeant commanding, Sallowrun Watch.\nYou will withdraw your post from the river at once and return to Dunmarrow.\nThe raids by marsh-creatures upon the fisher-folk are noted. The fisher-folk are not tax-paying subjects and are not the Crown's concern.\nThe ferry charter has been sold. Leave the toll-house keys for the new holder.\nBy order of the Reeve.\n(On the back, in pencil, in a square soldier's hand: No.)" },
    { id: 'cf-ledger', title: "A page of the Crows' ledger", text: "Week 7.\nTaken: silk (Jessop), wine x2 kegs, 41 sp, a saddle (very fine, owner rude).\nGiven: flour x6 sacks to Heronstilts. Arrows x40 (Garran's nephew). Headstone, Ned Ferrick, 3 gp. Bess: salt, nails, 1 keg (she will not say thank you).\nNew moon Thursday. Double watch on the stilts. Island post: Tam and Ruddy.\nLizards took 2 nets, 1 pot, Wrenna's brass bell. WHY do they want bells?\nMorale: poor. Turnips: good." },
    { id: 'cf-tribute', title: 'Words burned into the tribute post (Draconic)', text: "BRING ME BRIGHT THINGS AND MEAT AT EVERY DARK MOON.\nTWO HANDS OF GOLD. TWO HANDS OF SILVER. A WHOLE BEAST.\nFOR EACH HAND MISSING, ONE EGG.\nWHEN YOU HAVE NO MORE EGGS, I WILL ASK THE SOFT ONES UPRIVER.\nI AM ULVESH. THIS IS MY RIVER NOW." },
    { id: 'cf-fordmap', title: "Garran's flour-map of the Drowned Road", text: "Drawn in flour on the mill floor with one finger:\nA wiggly river. Upstream of the mill pond, a straight line across it.\n'Old Dunmarrow road. Under the water since my grandad's day.\nFind the fallen milestone on the south side. Walk straight at the pine with the split top.\nWaist-deep. Ten feet wide. Step left, you swim. Step right, you swim with the snake.\nDon't go at night.'" },
  ],
  chapters: [
    {
      id: 'ferry', title: "Crow's Ferry", level: 2,
      summary: "From the gibbet crossroads and the burned inn on the near bank, across the Sallowrun by one of five ways, to the bandits' stockade, the lizardfolk in the reeds and the dragon in the Drowned Shrine.",
      goal: "Open the crossing: by storming the Crows, by recruiting them, or by finding and ending what is really driving the raids before the new moon.",
      map: crowsFerry,
      npcs: [
        { npc: 'pf_cfvarnam', x: 50, y: 73 },
        { npc: 'pf_cfbess', x: 46, y: 63 },
        { npc: 'pf_cfferrick', x: FERRY, y: 40 },
        { npc: 'pf_cfwrenna', x: 61, y: 41 },
        { npc: 'pf_cfgarran', x: 23, y: 21 },
        { npc: 'pf_cfbrannock', x: 47, y: 11 },
        { npc: 'pf_cfkethra', x: 70, y: 14 },
        { npc: 'pf_cfshessa', x: 72, y: 12 },
        { npc: 'pf_cfulvesh', x: 71, y: 41, hidden: true },
      ],
      scenes: [
        {
          room: 'Gibbet Crossroads', title: 'The bounty at the gibbet',
          read: "The sun is going down red behind the hills as the road brings you to a gibbet with an empty cage. A crow sits on it and watches you. Below, on the post, a woman's hard face stares out of a poster, and under it is written a hundred gold crowns.",
          gm: "Start here. Aldous Varnam meets the heroes (or rides with them), dabbing his nose, and explains the job: clear the Crows, take back his ferry. He says the Crows burned the inn. Someone has scrawled on the poster that they did not. Smoke from the inn is visible to the north. Let the heroes choose: the inn and the landing (north), Crowwood (west), or the stilt village (east).",
          handout: 'cf-bounty',
        },
        {
          room: "The Ferryman's Rest", title: 'Ashes and an innkeeper',
          read: "The inn is a black ruin that still smells of smoke. Behind it, round a cook-fire, a broad woman with soot to her elbows looks up from her pot. \"If you've come to eat, it's a copper. If you've come to hang somebody, it's two.\"",
          gm: "Bess Mabry tells it plainly: lizardfolk burned her out three weeks ago, and the Crows rowed over in the dark and saved her daughter. Varnam scoffs. The ruin backs Bess up: three-toed prints in the ash, a shed scale, a stone spear-head in the kitchen pot, the strongbox pried up with a bone pick (DC 12 Investigation for each). Bess also knows the notches in Crowwood mark the old ford. A DC 12 Insight on Varnam: he knows Bess is telling the truth and doesn't care.",
        },
        {
          room: 'The Near Landing', title: 'Ring the bell', encounter: "Lenard's ferry toll",
          read: "You ring the bell. On the far bank a winch creaks, the great rope lifts dripping out of the river, and the raft comes sliding across the brown water toward you. A huge young man hauls it in, hand over hand, and four Crows with crossbows watch you over the rail.",
          gm: "Lenard and the Crows ask the toll: half of everything (handout). The toll board itself is the first clue: the poor ride free, Varnam pays double. Choices: pay, haggle (DC 13 Persuasion: a quarter, if the heroes are going to help the village), lie that they are poor (DC 14 Deception), or fight. A fight on the raft is dangerous for everyone: anyone shoved over falls into deep water. If things go badly the Crows cut loose, haul the raft back and lock the winch. Beaten Crows surrender and ask to be tied up somewhere dry. If anyone mentions a black, horned thing in the water, Lenard stops dead and asks to hear it all.",
          handout: 'cf-tollboard',
        },
        {
          room: 'Heronstilts', title: 'Raid on Heronstilts', encounter: 'Raid on Heronstilts',
          read: "A scream comes across the water from the stilt village, then the clang of a pot beaten like a bell. In the lantern-light, scaly shapes are climbing up out of the shallows onto the walkways, and something big and wet is hopping between the huts. Out on the river, a raft full of Crows is already coming, poling hard.",
          gm: "Run this the first evening, whenever the heroes are on the near bank or in the village. Four lizardfolk and two giant frogs are grabbing fish, pots and anything shiny. They are desperate, not bloodthirsty: they flee at half their number, and a captured one can be questioned (Kethra's people; DC 12 Intimidation or Persuasion, or Draconic). It hisses that 'the Black Hunger counts the eggs at dark moon' and 'we pay or the little ones are eaten'. The Crows arrive in two rounds and fight beside the heroes. Afterwards Wrenna shows the heroes her tally stick of all the Crows have given: the heroes now know whose side the bandits are on.",
          treasure: "Wrenna gives the heroes a potion of healing (the Crows' gift, she says, 'and now yours'). A dead lizardfolk carries a net-bag of stolen trinkets: 11 sp, a tin cup and Wrenna's brass bell's clapper (the bell itself is in the dragon's hoard).",
        },
        {
          room: 'The Weir', title: 'The miller and the weir', encounter: 'Crocodiles below the weir', optional: true,
          read: "Upriver, a grey mill turns its wheel beside a long stone weir. White water roars down its far side. An old man white with flour waves at you from the mill door and shouts something that the water swallows.",
          gm: "Garran Corwen is friendly, deaf and loyal to the Crows. Lift a sack for him and he draws the Drowned Road in flour (handout) and tells the heroes the crocodiles came up from the marsh in spring, 'chased by something'. The weir walk is a fast way across (rules in its area notes). Two crocodiles wait in the churn below for anyone who slips. Feeding them a sack of fish distracts them for 10 minutes.",
          handout: 'cf-fordmap',
          treasure: "Caught in the weir's grating, a drowned traveller's pack: 25 gp, a silver comb (10 gp) and a potion of water breathing.",
        },
        {
          room: 'The Drowned Road', title: 'The road under the river', encounter: 'The snake in the ford', optional: true,
          read: "The notches lead you to a gravel beach and a fallen milestone. You step in. The water closes cold around your waist, and under your boots there are paving stones, smooth and old, running straight out across the river.",
          gm: "The hidden ford. Waist-deep and safe on the causeway, deep and fast off it (rules in its area notes). Halfway across, a giant constrictor snake slides out of the deep hole on the downstream side and tries to drag someone off the road. The road comes out at the foot of Watchtower Hill, where the heroes can go up to the tower or along to the mill. The Crows do not watch this way except on new-moon nights, so it is the quiet way to reach the stockade.",
          treasure: "In the snake's hole (DC 13 Athletics to dive for it): a traveller's bones, 30 gp in a rotted purse and a silver ring (25 gp).",
        },
        {
          room: 'The ruined watchtower', title: 'The Watch that left', encounter: 'The tower stirges', optional: true,
          read: "The broken tower stands against the evening sky, and as you climb, the bats come pouring out of it in a black ribbon. Not all of them are bats. Some are bigger, with long needle noses, and they turn toward the warmth of you.",
          gm: "Six stirges and a swarm of bats nest in the upper floors. Fire or loud noise scatters the bats but not the stirges. Pinned to the door, rotting: the Reeve's withdrawal order, with Brannock's 'No.' on the back. This is proof, for Varnam or anyone, of why the Crows deserted. A secret door by the north wall (DC 14 Perception) leads to the Watch's hidden store.",
          handout: 'cf-orders',
          treasure: "In the hidden store, under the Crown's seal: 2 potions of healing, 10 +1 arrows in a Watch quiver, a signal horn, and the Watch's pay chest with 60 gp in Crown silver that never reached the soldiers.",
        },
        {
          room: "The Crows' yard", title: 'At the stockade gate', encounter: 'The stockade gate',
          read: "Sharpened logs, a gate of planks, and two braziers. A head pops up on the watch platform above, then a crossbow. \"Halt. State your business, soldier. And if your business is a bounty, turn round now and save us both the bother.\"",
          gm: "The heroes can talk their way in (asking for Brannock, showing the withdrawal order, or coming with Lenard, Wrenna or Bess all work), sneak in (DC 13 Stealth past the lookouts, or by the secret reed gate on the east wall), or fight at the gate. The gate guards fight to hold, not to kill; the mastiffs can be bribed with meat (DC 10 Animal Handling). If the heroes win here, Brannock comes out of the toll-house to talk before anyone else gets hurt.",
        },
        {
          room: 'The Toll-House', title: 'Sergeant Brannock', encounter: 'Storming the Toll-House',
          read: "The woman from the poster sits behind a desk covered in ledgers, a map of the river pinned with a hundred little crow feathers behind her. She does not stand up. \"You'll be Varnam's hired swords. Sit down. Have a turnip. Then tell me why I should let you hang me before the new moon.\"",
          gm: "Brannock is honest: she robs travellers to feed the village and buy arrows, and her ledger (handout) proves every penny. She does not know what drives the lizardfolk. If the heroes have heard about the Black Hunger or the eggs, she sees it at once: 'Then it's not the lizards we need to kill.' She offers a deal: end the raids, and she hands herself over to the Reeve herself. If the heroes attack, the Crows fight hard but surrender when Brannock or half of them fall. Killing her ends the 'bandits' and changes nothing else: the raids get worse and the new moon comes anyway.",
          handout: 'cf-ledger',
          treasure: "The Crows' strongbox: 85 gp and a potion of healing. If the heroes fight for the river, Brannock gives them her old Watch longbow at the end, a +1 longbow she calls Sergeant's Word.",
        },
        {
          room: 'Ochre Mound', title: 'The hungry people', encounter: 'The Ochre Mound',
          read: "Reed huts on a hummock in the marsh. Warriors rise from around the fire with spears and crocodile-jaw shields, thin as fence-posts, eyes gold and steady. A tall one with an orange throat steps forward and speaks in broken Common. \"Soft-skins. You come to kill us. Or you come to bring meat. Which.\"",
          gm: "Kethra will talk to anyone who comes openly. Bringing food, or a captured lizardfolk unharmed, gets a seat by the fire at once. She tells all: Ulvesh took the egg-mound in the Drowned Shrine, holds their last eleven eggs, and demands tribute every new moon. Tomorrow it wants more than they have, and it has said it will take the rest from the humans. Old Shessa (through Kethra) tells of the dragon's weakness to bright light and gives her salve. If the heroes help, Kethra and four warriors come with them, and the raids stop for good. If the heroes attack, the lizardfolk fight to the death: they have nothing left to lose.",
          treasure: "Shessa's marsh salve (works as two potions of healing), and a necklace of crocodile teeth that makes any Ochre-Throat lizardfolk treat the wearer as a friend.",
        },
        {
          room: 'The Frog Fen', title: 'Eyes in the pools', encounter: 'Frogs in the fen', optional: true,
          read: "The croaking stops. In the round black pools all around you, eyes rise out of the water, dozens of them, and one pair is as big as dinner plates.",
          gm: "Only if the heroes approach the Shrine from the south without a guide, or wander off the reed path. A giant toad and three giant frogs hunt here. Fire scatters them.",
        },
        {
          room: 'The Drowned Shrine', title: 'The Black Hunger', encounter: 'The Black Hunger',
          read: "The water round the island steams and smells of vinegar. The reeds are burned back in a ring. On the sunken chapel's broken roof, a black dragon no bigger than a pony stretches like a cat, and grins with a mouth full of dripping needles. \"More little meals,\" it purrs. \"And you've brought the lizards. How thoughtful.\"",
          gm: "Ulvesh and three crocodiles. The dragon talks first, because it loves to: it may offer the heroes a share of the tribute to go away, or to kill the Crows for it. It fights from the deep water, surfaces to breathe acid, and dives again. Bright light helps the heroes (Shessa's secret). Allies (Crows, Lenard, lizardfolk) each take on a crocodile. At 10 hit points Ulvesh flees down the channel or offers the eggs for its life. The tribute post at the island's edge carries its demands (handout).",
          handout: 'cf-tribute',
          treasure: "Ulvesh's little hoard: 280 gp and 340 sp in tribute, a river pearl (100 gp), Bess's strongbox (60 gp inside), Wrenna's brass bell, and a +1 shield of old green bronze from the shrine's builders. And the eleven eggs, warm and whole.",
        },
      ],
      wrapUp: "If Ulvesh is dead or driven off and the eggs go home, the raids stop the same night. The lizardfolk return to the Shrine, the fish come back to the river within a month, and the Crows have nothing left to rob anyone for. Brannock hands herself in as she promised, unless the heroes win her a pardon (Varnam, shown the withdrawal order and the ledger). If the heroes only stormed the stockade, Varnam pays the bounty, raises the toll, and on the new moon the dragon comes upriver to Heronstilts itself: a harder fight, with no friends. Either way, the heroes reach level 3.",
    },
  ],
  ending:
    "Good ending: the dragon is gone, the eggs hatch on the mound, the Crows are pardoned and the ferry runs free again, with Lenard at the rope and Bess rebuilding the inn with her strongbox. The Ochre-Throat trade eels for salt at the landing once more. Bad ending: the heroes hang Brannock, collect their gold, and leave; the lizardfolk starve or die raiding, Heronstilts is abandoned by midwinter, and Ulvesh grows into a real problem with a real hoard. What's next: Ulvesh, if it escaped, will be back, bigger. The Reeve of Dunmarrow will want to know who embarrassed him. And somewhere in the great fens to the east, there are bigger dragons than this one.",
};

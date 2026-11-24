// The Midsummer Feast of the Thornwood: a one-session fairy-tale adventure for four heroes of level 4.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

/** Where the Silverbrook runs at each column (its north bank is two squares above, its south bank two below). */
function brookY(x: number) {
  const pts: [number, number][] = [[26, 22], [33, 27], [42, 30], [52, 31], [62, 29], [71, 31], [79, 30]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    if (x >= ax && x <= bx) return Math.round(ay + ((by - ay) * (x - ax)) / (bx - ax));
  }
  return 30;
}

function thornwood() {
  // The Thornwood is solid briar wherever nothing is cut: hedge walls everywhere, glades and paths carved out.
  const b = new MapBuilder('adv-thornwood-feast', 'The Thornwood on Midsummer Night', 80, 80, { floor: 'grass', ambient: 'dim', wallStyle: 'hedge', theme: 'stone' });
  const r = rng(6121);
  /** Dressing that lands in the briars slides to the nearest dry floor square (organic glades have ragged edges). */
  const near = (x: number, y: number): [number, number] => {
    if (b.isFloor(x, y)) return [x, y];
    for (let d = 1; d < 6; d++)
      for (let dy = -d; dy <= d; dy++)
        for (let dx = -d; dx <= d; dx++)
          if (Math.max(Math.abs(dx), Math.abs(dy)) === d && b.cellAt(x + dx, y + dy) === 1) return [x + dx, y + dy];
    return [x, y];
  };
  const rawProp = b.prop.bind(b), rawLight = b.light.bind(b);
  b.prop = (kind, x, y, rot = 0, o = {}) => rawProp(kind, ...near(x, y), rot, o);
  b.light = (x, y, bright = 20, dim = 20, color = '#ffb35c') => rawLight(...near(x, y), bright, dim, color);

  // ---------- 1. The Mortal Gate (south edge, the heroes' start) ----------
  b.cave('The Mortal Gate', 40, 75, 7, 3.5, {
    seed: 3, mat: 'grass', wobble: 0.1,
    read: 'An old stile stands in a wall of thorns taller than a church. On this side, a dusty lane and the smell of hay. On the other side, music, lantern light, and air that tastes of honey and rain. A brass bell hangs from the stile post, very still.',
    gm: 'Clemency Dace waits here and cannot go in: she accepted the Lord\'s cure last year, and the wood would keep her. The bell is the dawn bell. When it rings by itself at sunrise, the gate closes for a year and anyone still inside stays. Merriwen must walk out through this stile before it rings.',
  });
  b.tunnel([[40, 79], [40, 77]], 2, { mat: 'dirt' });
  b.start(38, 75, 3, 2);
  b.prop('fence-gate', 40, 73).prop('temple-bell', 42, 73).prop('signpost', 36, 76).prop('lantern-standing', 44, 76).prop('hay-bale', 35, 75).prop('road-shrine', 45, 74).prop('flowers', 37, 77).prop('milestone', 41, 78);
  b.light(44, 76, 10, 20).light(42, 73, 5, 10, '#ffe7a3');

  // ---------- 2. The thorn-hedge maze ----------
  const MX = 24, MY = 53, CW = 11, CH = 6;
  b.floor(MX, MY, CW * 3, CH * 3, 'grass');
  const right = Array.from({ length: CW }, () => new Array<boolean>(CH).fill(false));
  const down = Array.from({ length: CW }, () => new Array<boolean>(CH).fill(false));
  const seen = Array.from({ length: CW }, () => new Array<boolean>(CH).fill(false));
  const stack: [number, number][] = [[5, 5]];
  seen[5][5] = true;
  while (stack.length) {
    const [i, j] = stack[stack.length - 1];
    const next = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as [number, number][])
      .map(([dx, dy]) => [i + dx, j + dy] as [number, number])
      .filter(([a, c]) => a >= 0 && c >= 0 && a < CW && c < CH && !seen[a][c]);
    if (!next.length) { stack.pop(); continue; }
    const [a, c] = next[Math.floor(r() * next.length)];
    if (a !== i) right[Math.min(a, i)][j] = true; else down[i][Math.min(c, j)] = true;
    seen[a][c] = true;
    stack.push([a, c]);
  }
  // the heart of the maze is one open lawn, and a few extra gaps make loops
  for (let i = 4; i <= 5; i++) for (let j = 2; j <= 3; j++) right[i][j] = true;
  for (let i = 4; i <= 6; i++) down[i][2] = true;
  for (let k = 0; k < 9; k++) right[Math.floor(r() * (CW - 1))][Math.floor(r() * CH)] = true;
  for (let k = 0; k < 6; k++) down[Math.floor(r() * CW)][Math.floor(r() * (CH - 1))] = true;
  for (let i = 0; i < CW - 1; i++) for (let j = 0; j < CH; j++) if (!right[i][j]) b.wallRun(MX + 3 * i + 2, MY + 3 * j, 3, 'e');
  for (let i = 0; i < CW; i++) for (let j = 0; j < CH - 1; j++) if (!down[i][j]) b.wallRun(MX + 3 * i, MY + 3 * j + 2, 3, 's');
  b.area('Thorn-hedge maze', [[MX, MY, CW * 3, CH * 3]], {
    read: 'Green walls of thorn rise twice your height, studded with white roses that turn to follow you. Little lanterns hang on the thorns. Somewhere ahead, someone is laughing, and it is not getting any closer.',
    gm: 'The maze rearranges itself only when nobody is looking: if the party splits up, the ones out of sight are lost for 10 minutes. A DC 13 Wisdom (Survival) check, or following the roses that turn toward the music, finds the north way to the lawn. Cutting through the hedge is iron against the wood: it takes a minute, deals 2d6 piercing, and the roses scream (the topiary stags come). Exits: north to the lawn, north-west to the toadstool ring, west to the owls, east to the Gifting Thorn.',
    label: [27, 67],
  });
  for (let k = 0; k < 14; k++) {
    const i = Math.floor(r() * CW), j = Math.floor(r() * CH);
    if (i >= 4 && i <= 6 && j >= 2 && j <= 3) continue;
    const kinds = ['lantern-hook', 'flowers', 'thorn-bush', 'bench', 'statue', 'candle-ring', 'bush'];
    b.prop(kinds[k % kinds.length], MX + 3 * i + 1, MY + 3 * j + 1);
  }
  b.prop('trap-net', 33, 66, 0, { gm: true }).prop('brambles', 48, 56).prop('skeleton-seated', 51, 68);
  b.light(30, 57, 5, 10, '#ffe7a3').light(48, 66, 5, 10, '#ffe7a3').light(27, 63, 5, 10, '#ffe7a3');

  b.area('Heart of the maze', [[36, 59, 9, 6]], {
    read: 'The hedges open on a round lawn around a white stone fountain. Two great topiary stags stand guard, clipped from living thorn, their antlers hung with tiny bells.',
    gm: 'The stags are living topiaries. They ask every guest one question: "Whose guest are you?" Say "the Midsummer Lord\'s" and they bow. Say your own true name and they ring their bells and attack (a name given freely in the Thornwood is a gift the wood takes). Anyone who has hurt the hedge is not a guest. The fountain water is safe and sweet: a drink grants advantage on the next save against charm tonight.',
    label: [40, 61],
  });
  b.prop('fountain', 40, 61).props_('hedge', [[37, 60], [43, 63]]).props_('bench', [[38, 63], [42, 59]]).prop('flowers', 39, 64).prop('lantern-standing', 44, 60);
  b.light(44, 60, 10, 15, '#ffe7a3');
  b.encounter('Topiary stags', [36, 59, 9, 6], [['livingTopiary', 2]], 'low');
  b.tunnel([[40, 70], [40, 73]], 2, { mat: 'grass' });

  // ---------- 3. The Owl glade (west side glade) ----------
  b.tunnel([[24, 57], [20, 59], [16, 60]], 2, { mat: 'dirt' });
  b.cave('Owl glade', 11, 62, 6, 5, {
    seed: 21, mat: 'grass',
    read: 'A ring of dead oaks, white as bone in the moonlight. Every branch holds an owl, and every owl turns its head to look at you at exactly the same moment.',
    gm: 'The Parliament of Owls keeps the riddles of the Thornwood. Mother Umberfeather, the oldest, will trade: answer her riddle (see her profile) and she answers one question truly. Ask her where Merriwen sleeps and she says: "Under the roots, where three roads meet: the willow, the throne and the dry fountain." Insult the owls, or try to leave without paying for an answer, and they attack.',
  });
  b.props_('tree-dead', [[7, 59], [15, 59], [6, 65], [16, 65]]).prop('tree-oak', 11, 61).props_('bones', [[9, 64], [13, 63]]).prop('standing-stone', 12, 66).prop('scroll-pile', 10, 61).prop('mushrooms', 14, 61).prop('gm-treasure', 11, 61, 0, { gm: true });
  b.light(11, 61, 5, 20, '#cfe3ff');
  b.encounter('Parliament of owls', [6, 58, 11, 9], [['giantOwl', 10]], 'low');
  b.tunnel([[11, 57], [12, 52], [13, 48]], 2, { mat: 'dirt', seed: 33 });

  // ---------- 4. The Gifting Thorn (east side glade) ----------
  b.tunnel([[56, 66], [60, 65], [63, 64]], 2, { mat: 'dirt', seed: 41 });
  b.cave('The Gifting Thorn', 68, 63, 6, 4.5, {
    seed: 17, mat: 'grass',
    read: 'A lone thorn tree stands in a hollow, hung all over with presents: a velvet cloak, a silver flute, ribbons, rings, a bowl of jewels that glitter like wet fruit. A painted sign says FOR OUR GUESTS. TAKE WHAT YOU LIKE.',
    gm: 'Everything here is real, and every gift taken is a debt. A guest who takes a gift must leave a gift of equal worth on the tree before the dawn bell, or the debt-hounds come to collect: they take something the debtor loves (a memory, a voice, a shadow) or drag the debtor back into the wood. A DC 14 Arcana or Insight sees the trap. Paying honestly (leaving gold, a story, a lock of hair) is safe: the tree is fair, just hungry.',
  });
  b.prop('thorn-bush', 68, 63).props_('flowers', [[64, 61], [72, 65]]).prop('chest-open', 66, 64).prop('jewelry-box', 70, 62).prop('ring-cushion', 69, 65).prop('gem-bowl', 67, 61).prop('magic-cloak', 70, 64).prop('brambles', 63, 66).prop('lantern-hook', 66, 62).prop('gm-trap', 68, 64, 0, { gm: true });
  b.light(66, 62, 5, 15, '#ffd27f');
  b.encounter('The debt-hounds', [63, 59, 11, 8], [['feyDebtHound', 4], ['sprite', 4]], 'low');
  b.tunnel([[68, 59], [67, 55], [66, 51]], 2, { mat: 'dirt', seed: 47 });

  // ---------- 5. The feasting lawn and the high table ----------
  b.tunnel([[40, 53], [40, 49]], 2, { mat: 'grass' });
  b.cave('Feasting lawn', 40, 42, 13, 7, {
    seed: 9, mat: 'grass', wobble: 0.08,
    read: 'Long tables run the length of a moonlit lawn, laid with gold plates, glass bread and fruit that glows from inside. A hundred guests in masks of leaves and feathers laugh and toast. The music never stops, and you cannot see who is playing it.',
    gm: 'The feast runs in six courses, one an hour, until the dawn bell (see the bill of fare). The guests are sprites, satyrs, dryads, goblin servers and a few blank-eyed mortals who have stayed too long. Everyone is polite; everyone is listening. Seats are found for the heroes at once. Thimbleweed announces each course. Rules of courtesy apply in full (see the courtesies): draw iron here and the court turns on you.',
  });
  b.props_('feast-hall-table', [[31, 40], [31, 45], [43, 40], [43, 45]]).props_('bench-long', [[31, 42], [43, 42], [31, 47], [43, 47]]);
  b.props_('lantern-cluster', [[29, 38], [51, 38], [29, 46], [51, 46]]).props_('candle-hoop', [[38, 43], [42, 43]]).props_('banner-pole', [[28, 42], [52, 42]]).prop('harpsichord', 49, 37).props_('barrel-group', [[52, 44]]).prop('produce-stall', 30, 37).prop('flowers', 40, 48).prop('bread-rack', 53, 41);
  b.light(29, 38, 10, 20, '#ffcf8a').light(51, 38, 10, 20, '#ffcf8a').light(29, 46, 10, 20, '#ffcf8a').light(51, 46, 10, 20, '#ffcf8a').light(40, 43, 10, 20, '#fff1c1');
  b.area('The high table', [[35, 35, 11, 3]], {
    read: 'At the head of the lawn, on a low rise, stands a table of white wood laid for twelve. The chair in the middle is grown from a living hawthorn, and it is empty.',
    gm: 'The Lord sits here only for the fourth course, when he serves the hart\'s-heart roast from his own hand. Food from his hand is always safe. Here, before the whole court, is where a wager offered in rhyme cannot be refused, and where the heroes can shame him with Gubbin\'s testimony (see the scene "The Midsummer Feast").',
    label: [40, 36],
  });
  b.prop('throne', 40, 36).props_('chair-high-back', [[37, 36], [43, 36]]).prop('table-feast', 39, 37).prop('candelabra-grand', 36, 37).prop('chalices', 41, 37);
  b.light(36, 37, 10, 20, '#fff1c1');

  // ---------- 6. The toadstool ring ----------
  b.tunnel([[28, 42], [22, 42]], 2, { mat: 'dirt', seed: 51 });
  b.area('Lantern walk', [[23, 41, 5, 3]], { read: 'A short path lined with paper lanterns shaped like moths.', gm: 'From here you can hear both the feast and the reel.', label: [25, 42] });
  b.props_('lantern-hook', [[24, 41], [26, 43]]);
  b.tunnel([[28, 53], [25, 50], [19, 47]], 2, { mat: 'dirt', seed: 57 });
  b.cave('Toadstool ring', 15, 42, 7, 6, {
    seed: 27, mat: 'grass',
    read: 'A perfect ring of red-capped toadstools, each as tall as a child, circles a lawn worn bare by dancing feet. Inside the ring the dancers spin and leap and never, ever tire. A satyr with a fiddle grins at you and nods at the empty space beside him.',
    gm: 'Fescue Merrylegs plays the Endless Reel. Step inside the ring and you must dance until the tune ends or someone pulls you out (DC 13 Athletics; the puller must step in to do it). Fescue offers a wager: out-dance the reel (three DC 13 Constitution or Performance checks, best two of three) and win a gift with no debt on it. Lose, and you dance until the next course. Breaking the ring with iron or fire turns the revel wild.',
  });
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    b.prop('mushroom-giant', Math.round(15 + Math.cos(a) * 5), Math.round(42 + Math.sin(a) * 4));
  }
  b.prop('stone-circle', 15, 42).prop('magic-circle', 14, 43, 0, { gm: true }).prop('stump', 10, 38).prop('glowing-fungus', 19, 46).prop('campfire', 20, 39);
  b.light(15, 42, 5, 20, '#ff9fd0').light(20, 39, 10, 15);
  b.encounter('The wild revel', [9, 37, 13, 11], [['satyr', 5], ['sprite', 4]], 'low');

  // ---------- 7. The goblin kitchen and its yard ----------
  b.cave('Kitchen yard', 65, 47, 9, 5.5, {
    seed: 39, mat: 'dirt',
    read: 'A trampled yard behind the feast, full of steam and shouting. Goblins in tall paper hats run in every direction with trays, pots and live, indignant geese.',
    gm: 'The servants\' way. Nobody stops a hero carrying a tray. From here a muddy track runs north to the stepping stones and the statue garden, and south to the Gifting Thorn.',
  });
  b.building('Goblin kitchen', 59, 37, 13, 8, {
    mat: 'wood-planks-dark',
    read: 'Heat hits you like a door. Cauldrons roar on six fires at once, a goblin in a towering hat bangs a ladle on a pot, and every dish on every shelf is very, very purple.',
    gm: 'Chef Gubbin Saltpinch rules here. The kitchen has no salt at all: fey food is all honey, dew and moonlight. A pinch of mortal salt buys his friendship; a whole pouch buys his secrets. He knows which dishes are unsafe, and that the Lord ordered the damson tart served to Merriwen last year, by a servant, not by his own hand (a breach of courtesy). Draw a blade in his kitchen and the whole staff fights.',
    doors: [[59, 41, 'w', 'closed'], [64, 44, 's', 'open'], [70, 44, 's', 'closed']],
    windows: [[62, 37, 'n'], [59, 39, 'w']],
  });
  b.wallRun(67, 37, 8, 'w').door(67, 40, 'w', 'closed');
  b.area('Larder', [[67, 37, 5, 8]], {
    read: 'Shelves of jars glow faintly: bottled dew, pickled moonbeams, a whole wheel of cheese that hums.',
    gm: 'Under a cloth on the bottom shelf, the rest of last year\'s damson tarts, kept "for special guests". Anyone who eats one makes a DC 13 Wisdom save or forgets their own name until it is given back (see the courtesies). A heel of honest bread here, baked by Gubbin from mortal flour he traded for, gives back one forgotten name to whoever eats it.',
  });
  b.props_('cauldron', [[60, 38], [63, 38]]).prop('hearth-oven', 65, 38).prop('pot-rack', 61, 40).prop('butcher-block', 63, 41).prop('kitchen-table', 61, 42).prop('stove', 65, 42).prop('flour-sacks', 60, 43).prop('bread-rack', 66, 41).props_('shelf-jars', [[68, 38], [70, 38]]).prop('potion-shelf', 71, 40).props_('barrel', [[68, 43], [70, 42]]).prop('cupboard', 71, 43).prop('gm-treasure', 70, 39, 0, { gm: true });
  b.light(65, 38, 15, 20).light(60, 38, 10, 15).light(68, 41, 5, 10, '#d8b7ff');
  b.props_('water-barrel', [[60, 46], [71, 46]]).prop('chicken-coop', 58, 49).prop('firewood', 62, 50).prop('handcart', 69, 50).prop('produce-crates', 65, 51).prop('washbasin', 72, 48);
  b.encounter('Kitchen brawl', [59, 37, 13, 8], [['goblinBoss', 1], ['goblinWarrior', 6], ['goblinMinion', 8]], 'low');
  b.tunnel([[52, 42], [56, 42], [58, 41]], 2, { mat: 'dirt', seed: 61 });

  // ---------- 8. The Silverbrook, with its bridge and stepping stones ----------
  for (let x = 26; x <= 79; x++) {
    const y = brookY(x);
    b.floor(x, y - 2, 1, 6, 'grass');
    b.water(x, y, 1, 2, true);
  }
  for (const x of [40, 41]) { const y = brookY(x); b.floor(x, y, 1, 2, 'wood-planks'); }
  for (const x of [67, 68]) { const y = brookY(x); b.water(x, y, 1, 2, false); }
  b.area('Silverbrook', [[44, brookY(48) - 2, 16, 6]], {
    read: 'A quick stream of water so clear it looks like moving glass. Silver fish flick through it, and the stones on the bottom are not stones but lost coins and keys.',
    gm: 'Deep and cold. Swimming across takes a DC 12 Athletics check; failure carries the swimmer 20 feet downstream. Fey cannot cross running water uninvited: a hero on the far bank can shout "You may not cross!" and a pursuing fey must stop (though the Lord just laughs and walks the bridge). The coins are real: 3d10 gp to anyone who spends ten minutes fishing.',
    label: [50, brookY(50)],
  });
  b.area('Moonbeam bridge', [[39, brookY(40) - 2, 4, 6]], {
    read: 'A narrow bridge of pale wood arches over the stream. In the moonlight it looks like it is made of light, and it rings softly underfoot.',
    gm: 'The main way north to the hollow-tree hall. Two sprite sentries ask for a toll: "a secret you have never told". A true secret (Insight DC 12 to tell) pays it; a lie and the bridge goes slippery (DC 13 Dexterity save or fall in).',
    label: [40, brookY(40)],
  });
  b.prop('bridge-plank', 40, brookY(40), 90).props_('lantern-standing', [[39, brookY(39) - 2], [42, brookY(42) + 3]]).prop('reeds', 44, brookY(44) + 2);
  b.light(39, brookY(39) - 2, 10, 15, '#cfe3ff');
  b.area('Stepping stones', [[66, brookY(67) - 2, 4, 6]], {
    read: 'Flat white stones cross the brook where it runs wide and shallow, each with a sleeping frog on it.',
    gm: 'Shallow water, difficult ground. The frogs croak if anyone crosses, but only goblins pay attention. The quiet way from the kitchen to the statue garden.',
    label: [67, brookY(67)],
  });
  b.props_('boulder', [[66, brookY(66)], [69, brookY(69)]]).prop('lily-pads', 72, brookY(72)).prop('reeds', 63, brookY(63) + 2).prop('reeds', 57, brookY(57) - 2).prop('log-fallen', 76, brookY(76) + 3).prop('fishing-net', 30, brookY(30) + 2);
  b.tunnel([[40, 35], [40, brookY(40) + 2]], 2, { mat: 'grass' });
  b.tunnel([[72, 45], [75, 39], [69, brookY(69) + 3]], 2, { mat: 'dirt', seed: 67 });

  // ---------- 9. The moonlit pond and the weeping willow ----------
  b.cave('Moonlit pond', 17, 19, 11, 8.5, {
    seed: 13, mat: 'grass',
    read: 'A round pond lies in a hollow of silver grass, so still that two moons float in it. Pale lights drift above the water. On the far bank, a willow trails its hair in the pond, and you would swear it sighs.',
    gm: 'The lights are will-o\'-wisps; they lure anyone carrying a light out over the deep water, where two giant toads wait. Walk in the dark, or carry no flame, and they ignore you. The pond is the Silverbrook\'s source. Look into it under the moon (DC 13 Wisdom save) and you see what you have forgotten tonight: a quick way to learn a name was stolen.',
  });
  b.pool(17, 18, 7, 5, true);
  b.area('The weeping willow', [[6, 11, 6, 5]], {
    read: 'The willow\'s branches part like a curtain. Inside, the air is green and cool, and a woman with bark-brown skin and hair of trailing leaves sits on a root, combing it.',
    gm: 'Lady Wistery, the Lord\'s consort, a dryad bound to this tree. She is jealous of Merriwen and will help the heroes take her away, for a price (see her profile). Between the roots behind her is the willow-root way, a secret door that opens only if she wills it or a DC 16 Investigation finds the knot that works it.',
    label: [8, 13],
  });
  b.prop('tree-willow', 8, 12).props_('reeds', [[11, 23], [24, 15], [12, 13]]).props_('lily-pads', [[15, 16], [20, 21]]).prop('canoe', 23, 22, 45).prop('flowers', 7, 15).prop('rug-pelt', 9, 13).prop('boulder', 26, 18).prop('gm-treasure', 17, 18, 0, { gm: true });
  b.light(14, 17, 5, 20, '#a8f0d0').light(20, 20, 5, 20, '#a8f0d0');
  b.encounter('Lights on the pond', [8, 12, 19, 13], [['willOWisp', 2], ['giantToad', 2]], 'moderate');
  b.tunnel([[15, 36], [13, 31], [15, 27]], 2, { mat: 'dirt', seed: 71 });
  b.tunnel([[27, 15], [31, 13]], 2, { mat: 'dirt', seed: 73 });

  // the willow-root way (secret, from the willow north and east to the spinners' hollow)
  let wx = 12;
  while (b.isFloor(wx - 1, 14)) wx--;
  b.hall(wx - 1, 14, 5, 14, 1, { mat: 'cave-floor' }).hall(5, 14, 5, 8, 1, { mat: 'cave-floor' });
  b.tunnel([[5, 8], [10, 5], [18, 3], [30, 2], [44, 2], [53, 4]], 1, { mat: 'cave-floor', seed: 77 });
  b.door(wx, 14, 'w', 'secret');
  b.area('Willow-root way', [[18, 2, 26, 2]], {
    read: 'You crawl between pale roots as thick as your body. Water drips. Far above, muffled, the music of the feast goes on.',
    gm: 'A tight, one-square crawl. It comes out in the spinners\' hollow below the hall. Medium heroes squeeze (difficult ground the whole way). Root-rot here hides 2 potions of healing in a drowned guest\'s satchel (DC 12 Perception).',
    label: [30, 2],
  });
  b.props_('mushrooms', [[18, 3], [36, 2]]).prop('backpack', 26, 2).prop('stairs-down', 46, 2);

  // ---------- 10. The hollow-tree hall ----------
  b.tunnel([[40, brookY(40) - 2], [40, 20]], 3, { mat: 'dirt', seed: 81 });
  b.area('Root steps', [[39, 21, 3, brookY(40) - 23]], {
    read: 'Steps of living root climb toward a tree so vast that its trunk is a wall of bark a hundred feet wide. Light spills from a doorway shaped like a keyhole.',
    gm: 'Two satyr doorwards (not hostile) ask each guest to leave their iron at the door. Refusing is not a crime, but the whole hall will know.',
    label: [40, 23],
  });
  b.prop('stairs-up', 40, 22).props_('torch-standing', [[39, 25], [42, 25]]).prop('weapon-rack', 42, 22);
  b.light(39, 25, 10, 15).light(42, 25, 10, 15);
  b.cave('Hollow-tree hall', 40, 13, 9, 7, {
    seed: 5, mat: 'wood-planks-dark', wobble: 0.06,
    read: 'You stand inside a living tree. The walls curve up into darkness, and hundreds of tiny birdcages hang from the roots overhead, each with a small brown bird inside, all silent. At the far end, on a throne of white hawthorn, a tall man with antlers of silver twigs smiles as if he has been waiting for you all his life.',
    gm: 'Lord Saffrel holds court here between courses. He is charming, bored and absolutely bound by his word. The cages hold the names of guests who stayed: open a cage and the bird sings one name, once, and that name flies home to its owner. Merriwen\'s cage is tagged "Last Midsummer: a seamstress who sang" (see the cage tags). Stealing a cage is theft from the host: the heroes stop being guests and the Lord fights. In the trunk wall behind the harpsichord, east of the throne, a secret door (DC 15 Perception, or Wistery\'s word) opens on the root stair.',
  });
  b.area('Cage of names', [[32, 9, 5, 8]], {
    read: 'The cages hang thickest here, low enough to touch. Every tag is written in a different hand.',
    gm: 'Twelve cages are within reach. The birds do not sing while the cages are closed. Opening one quietly while the court is busy takes a DC 15 Dexterity (Sleight of Hand) check; Lady Wistery, if she has been bargained with, can tell which cage is Merriwen\'s.',
    label: [34, 12],
  });
  b.prop('throne-dais', 40, 7).prop('throne', 40, 8).props_('cage-hanging', [[33, 10], [34, 13], [33, 15], [35, 9], [45, 9], [47, 13]]).prop('chandelier-antler', 40, 13).prop('rug-runner', 40, 16).props_('banner-hanging-tall', [[36, 7], [44, 7]]).prop('table-round', 44, 16).props_('chair', [[43, 16], [45, 16]]).prop('harpsichord', 46, 11).props_('candle-stand-tall', [[37, 9], [43, 9]]).prop('crystal-ball', 38, 10);
  b.light(40, 13, 15, 25, '#fff1c1').light(37, 9, 5, 10).light(43, 9, 5, 10);
  b.encounter("The Lord's wrath", [32, 7, 17, 13], [['midsummerLord', 1]], 'high');
  // the secret root stair in the trunk wall, east to the spinners' hollow
  // (a row where the trunk wall is solid above and below the passage, so the door is the only way in)
  let hx = 44, hy = 9;
  for (let y = 9; y <= 17; y++) {
    let x = 40;
    while (b.isFloor(x + 1, y)) x++;
    if (![x + 1, x + 2, x + 3].some((c) => b.isFloor(c, y - 1) || b.isFloor(c, y + 1))) { hx = x; hy = y; break; }
  }
  b.hall(hx + 1, hy, hx + 3, hy, 1, { mat: 'cave-floor' });
  b.door(hx + 1, hy, 'w', 'secret');
  b.tunnel([[hx + 3, hy], [52, 7], [54, 5]], 2, { mat: 'cave-floor', seed: 83 });
  b.prop('stairs-down', hx + 2, hy).prop('gm-secret-door', hx, hy, 0, { gm: true });

  // ---------- 11. The garden of statues ----------
  b.room('Garden of statues', 56, 12, 19, 14, {
    mat: 'grass',
    read: 'Clipped hedges make neat green rooms, and in every room stands a statue: a farmer with a hat in his hands, a girl mid-curtsey, a soldier with a raised cup. Each face wears the same look: politely trying to remember something. A dry fountain sits in the middle, full of fallen petals.',
    gm: 'Every statue was a guest who stayed and forgot their name. When moonlight touches one it can whisper. Old Corbin Askew, the tinker in the north-west corner, knows the fountain\'s secret: say "I would like to leave now" into the dry basin and the stones slide back on a stair down to the roots (or DC 16 Investigation finds the seams). Four of the statues are not guests but the Lord\'s gardeners, and two hedges are awake: they attack anyone who damages a statue or tries the stair without being polite.',
  });
  b.paint(56, 18, 19, 2, 'stone-cobble').paint(64, 12, 3, 14, 'stone-cobble');
  b.wallRun(57, 15, 6, 's').wallRun(68, 15, 6, 's').wallRun(57, 21, 6, 's').wallRun(68, 21, 6, 's');
  b.wallRun(62, 12, 3, 'e').wallRun(67, 13, 3, 'w').wallRun(62, 22, 4, 'e').wallRun(67, 22, 4, 'w');
  b.prop('fountain-grand', 65, 18).props_('statue', [[58, 13], [72, 13], [58, 24], [72, 24]]).props_('statue-tall-robed', [[60, 17], [70, 20]]).props_('statue-tall-knight', [[58, 20], [72, 17]]).prop('statue-tall-winged', 65, 14).prop('statue-knight', 65, 23).props_('hedge-long', [[59, 13], [69, 24]]).props_('bench', [[61, 19], [69, 18]]).props_('flowers', [[57, 23], [73, 14]]).prop('lamp-post', 63, 17).prop('stairs-down', 66, 19, 0, { gm: true }).prop('gm-treasure', 72, 24, 0, { gm: true });
  b.light(63, 17, 10, 20, '#cfe3ff');
  b.encounter("The gardener's statues", [57, 13, 17, 12], [['stoneGardener', 4], ['livingTopiary', 2]], 'moderate');
  b.tunnel([[66, 25], [67, brookY(67) - 2]], 2, { mat: 'dirt', seed: 87 });
  b.hall(60, 8, 60, 11, 1, { mat: 'cave-floor' });
  b.door(60, 11, 's', 'secret');

  // ---------- 12. Under the roots: the spinners' hollow and the hidden bower ----------
  b.cave("Spinners' hollow", 57, 5, 4.5, 3, {
    seed: 19, mat: 'cave-floor',
    read: 'Three root-tunnels meet in a low cave hung with grey silk. Bundles the size of people dangle from the ceiling, turning slowly. One of them is humming a lullaby.',
    gm: 'An ettercap and two giant spiders, the Lord\'s "seamstresses", spin silk for the court\'s gowns and eat anyone lost down here. The humming bundle is a sprite caught last week: cut it free and it owes the heroes a favour (and it knows the thorn wardens fear fire). The three ways in: the willow-root way (west), the root stair from the hall (south-west) and the fountain stair from the garden (south).',
  });
  b.props_('spider-web', [[54, 4], [59, 3], [60, 7]]).props_('cobweb-corner', [[53, 5], [61, 5]]).prop('bones', 56, 6).prop('skeleton-lying', 58, 7).prop('cage-hanging', 57, 4).prop('gear-pile', 55, 7).prop('gm-treasure', 55, 7, 0, { gm: true });
  b.encounter('Spinners in the roots', [53, 2, 9, 6], [['ettercap', 1], ['giantSpider', 2]], 'low');
  b.tunnel([[61, 5], [65, 5]], 2, { mat: 'cave-floor', seed: 91 });
  b.cave('The hidden bower', 70, 5, 6, 3.5, {
    seed: 29, mat: 'grass',
    read: 'Roses. A whole room of them, white and red, growing up through the roots into a dome of blossom. Moonlight falls through a hole far above onto a canopied bed, where a young woman in a gown of petals sits singing to herself, very softly, a song with no words.',
    gm: 'Merriwen Dace has been the Lord\'s "Midsummer Lady" for a year. Without her name she does not know the heroes, her sister or her home, and she is happy, in a dreamy way. Three thorn wardens (great guardians grown from rose briars) and a wisp guard her: they wake if anyone touches her or the bed without the Lord\'s leave. Clemency\'s lullaby makes Merriwen weep and listen; her name (from the cage, or the heel of honest bread) brings her all the way back.',
  });
  b.prop('bed-canopy', 71, 4).props_('flowers', [[66, 3], [74, 6], [68, 7], [73, 3]]).props_('thorn-bush', [[66, 6], [75, 4]]).prop('vanity', 69, 3).prop('spinning-wheel', 67, 5).prop('rug-round', 70, 6).prop('candle-ring', 72, 6).prop('mirror', 74, 5);
  b.light(71, 4, 10, 20, '#ffe1f0').light(67, 5, 5, 10, '#ffe1f0');
  b.encounter('The thorn wardens', [65, 2, 11, 6], [['roseThornWarden', 3], ['willOWisp', 1]], 'high');

  b.note(40, 74, 'The dawn bell. When it rings at sunrise, the gate closes for a year and a day.');
  b.note(7, 14, 'Secret door: the willow-root way. Opens at Wistery\'s word or DC 16 Investigation.');
  b.note(60, 11, 'Secret stair under the dry fountain: say "I would like to leave now" into the basin.');
  return b.build();
}

export const THORNWOOD_FEAST: Adventure = {
  id: 'thornwood-feast',
  title: 'The Midsummer Feast of the Thornwood',
  tagline: 'One night a year the Thornwood opens its gate. Eat with care, promise nothing, and bring the lost singer home before the dawn bell.',
  levels: '4',
  sessions: '1 session (3-4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'fey', 'fairy tale', 'riddles', 'can be talked out'],
  pitch:
    'Outside the village of Dimmock Cross stands the Thornwood, a hedge of briars so thick no bird flies through it. One night a year, on Midsummer Eve, a stile appears in the thorns and music drifts out. Tonight a sprite no bigger than your hand dropped gilded leaves on your table at the inn: invitations to the Midsummer Feast, with your names already written on them in green ink. And at the stile a young woman is waiting for anyone brave enough to go in, because her sister went to last year\'s feast and never came out. The gate closes at the dawn bell.',
  secret:
    'Lord Saffrel, the Midsummer Lord, rules the Thornwood on the one night a year it touches our world. Fey make nothing new; every song his court knows is a thousand years old, and he is bored to the bone. Last Midsummer, Merriwen Dace came to the feast to beg a cure for her dying sister Clemency. She paid by singing a song nobody had ever heard, and the whole court wept. Saffrel sent the cure out to the stile, as promised, but he could not bear to let the singer go. So he had a servant bring her the damson tart of forgetting, and she forgot her own name. A guest who cannot say her own name at the dawn bell has no other home, so she stayed. Saffrel keeps her name as a little brown bird in a cage in his hollow-tree hall, beside the names of every other guest who stayed. A name the wood has taken can only be given back by the wood: by the bird singing it, by bread baked in the Thornwood, or by the Lord\'s own word. Hearing it from a friend just slides off. Why now: a year and a day ends at this dawn bell. If Merriwen still cannot say her name when it rings, she becomes fey for good, the Midsummer Lady, and sings for Saffrel forever. The flaw in his plan: by his own courtesies, a guest is safe when she eats from the host\'s own hand. He had the tart served by someone else, and that is cheating, if anyone can prove it before the court.',
  hooks: [
    'Clemency Dace, a dyer\'s girl from Dimmock Cross, has begged every traveller at the Midsummer fair. She offers 30 gp, every coin she has, and a blue ribbon to give her sister so she knows who sent them.',
    'Thimbleweed, the Lord\'s herald, delivers the invitations in person, and makes it clear that refusing the Midsummer Lord is very, very rude. The Lord asked for "brave strangers" this year, to make things interesting.',
    'One hero\'s family still sets out a cup every Midsummer for a great-great-uncle, a tinker who went to "the fair in the thorns" eighty years ago and never came home. His statue is in the garden.',
  ],
  tips: [
    'The six courses are your clock. Each is about thirty minutes at the table, and Thimbleweed announces every one. The sixth course is the dawn bell. If the heroes dawdle, let a course pass.',
    'Keep a debt list on scrap paper: every gift taken, every "thank you", every promise. Read it out at the bell, when the wood collects.',
    'The fey never lie, but they rarely tell all of it. Play them polite, charming and frightening. Nobody harms a guest who keeps the courtesies; most fights start when heroes break one.',
    'There are three ways to win Merriwen\'s name (win it in a wager, shame the Lord with Gubbin\'s testimony, or steal the cage) and three roads to her bower (the hall\'s hidden door, the fountain stair, the willow-root way). Any mix works.',
    'Short on time? Skip the owls and the Gifting Thorn, and have Thimbleweed whisper the fountain\'s secret for a thimble of cream.',
    'Reward wit over steel. A clever rhyme, a fair gift or a good riddle should do as much as a fireball here.',
  ],
  npcs: [
    {
      id: 'pf_tfeclemency', name: 'Clemency Dace', title: "Merriwen's younger sister", kind: 'npc', art: 'commoner', shared: true,
      wants: 'Her sister home before the dawn bell, and the chance to say she is sorry.',
      knows: 'Merriwen went in last Midsummer to beg a cure for Clemency\'s wasting cough. At dawn a bottle of green cordial sat on the stile, but Merriwen never came out. Clemency drank it and lived. She knows the lullaby their mother sang them.',
      voice: 'Quick and quiet, finishes other people\'s sentences, presses her hands together when she is frightened.',
      appearance: 'A thin young woman in a dye-stained apron, with a blue ribbon in her hair that matches the one Merriwen wore.',
      gmNotes: 'She cannot go in: she accepted the wood\'s gift, and the wood would keep her. She gives the heroes a pouch of salt ("Mother always said, take salt to a fair"), teaches them the lullaby, and offers her 30 gp. If anyone suggests trading her for her sister, she agrees at once; the heroes should stop her.',
    },
    {
      id: 'pf_tfemerriwen', name: 'Merriwen Dace', title: 'the Midsummer Lady', kind: 'npc', art: 'bard',
      wants: 'To sing for the Lord forever and never be sad again. Underneath, to go home, though she cannot remember where home is.',
      knows: 'Every song the court has ever sung. The thorn wardens obey her hand, but only if she remembers who she is.',
      voice: 'Dreamy and sweet. Speaks in half-sung phrases and answers questions with questions.',
      appearance: 'A young woman in a gown of white petals, barefoot, with a blue ribbon in her hair that she does not remember tying.',
      backstory: 'A seamstress from Dimmock Cross who sang while she sewed. Her song at last year\'s feast made the fey weep, which no mortal has done in a hundred years.',
      gmNotes: 'Clemency\'s lullaby makes her stop, cry and listen (advantage on any check to calm her). Her name, given back by the wood, brings her all the way home: she can then order the thorn wardens to sleep, ending that fight. At the dawn bell, if she still cannot say her name, she becomes fey forever.',
    },
    {
      id: 'pf_tfesaffrel', name: 'Lord Saffrel', title: 'the Midsummer Lord', kind: 'monster', art: 'fey-knight', monsterId: 'midsummerLord',
      wants: 'A new song every night, forever. The fey make nothing new; only mortals do.',
      knows: 'Everything said aloud in his wood tonight, and every name in every cage. He cannot lie.',
      voice: 'Warm and amused. Never raises his voice, calls everyone "dear guest", and laughs at the wrong moments.',
      appearance: 'Tall and slender, with skin like birch bark, eyes of green glass and antlers of silver twigs hung with tiny bells.',
      backstory: 'He has ruled the Thornwood\'s single night for longer than Dimmock Cross has stood. He has heard every story twice.',
      gmNotes: 'Uses the Midsummer Lord stat block: a thorn rapier, lances of moonlight and a cloud of golden pollen that sets heroes dancing. He cannot harm a guest who keeps the courtesies, and he cannot refuse a wager offered in rhyme before the whole court. He is bound by every word he says. If the heroes become thieves or draw iron in his hall, he fights; at half hit points he yields ("A guest who can wound me is a guest worth keeping") and keeps whatever bargain ends the fight. Heroes he drops are not killed: they wake as statues in the garden, unless friends win them back.',
    },
    {
      id: 'pf_tfewistery', name: 'Lady Wistery', title: 'Lady of the Willow, the Lord\'s consort', kind: 'monster', art: 'dryad', monsterId: 'dryad',
      wants: 'The mortal singer gone, and her lord\'s eyes back on her.',
      knows: 'Which cage holds Merriwen\'s name (the one with the tag about the seamstress), the willow-root way, and the word that opens the hidden door in the hall: "Evening".',
      voice: 'Low and slow, like wind in leaves. She never asks a question; she only says things.',
      appearance: 'A tall woman with bark-brown skin, hair of trailing willow leaves and a green gown that drips pond water.',
      gmNotes: 'Her price for help is a promise under the moon: "You will take the mortal out of my lord\'s wood, and never bring another mortal song into it." From then on, any hero who sings, hums or plays music in the Thornwood loses their voice until next Midsummer. That bites if they planned to win the Lord with a song. She never fights her lord. If attacked, she charms one attacker and steps into her tree.',
    },
    {
      id: 'pf_tfethimbleweed', name: 'Thimbleweed', title: 'herald of the Midsummer Feast', kind: 'monster', art: 'sprite', monsterId: 'sprite', shared: true,
      wants: 'Gossip, cream, and to be thanked, because then you owe him.',
      knows: 'The order of the courses, who sits where, and every secret whispered at the tables. He delivered the heroes\' invitations.',
      voice: 'Tiny, very fast and very formal. Announces everything in rhyme.',
      appearance: 'A sprite no bigger than a hand, in a coat of beetle wings, with a trumpet made from a honeysuckle flower.',
      gmNotes: 'Tricky, not cruel. He fishes for "thank you" in every sentence. A thimble of cream from the kitchen buys one honest answer, including the fountain\'s secret.',
    },
    {
      id: 'pf_tfefescue', name: 'Fescue Merrylegs', title: 'master of the revels', kind: 'monster', art: 'satyr', monsterId: 'satyr',
      wants: 'A dancer who can keep up with the Endless Reel.',
      knows: 'That the Lord cannot refuse a wager offered in rhyme before the whole court. That the thorn wardens doze to the right lullaby.',
      voice: 'Laughs every third word, sings half his sentences and calls everyone "my lamb".',
      appearance: 'A goat-legged fiddler with gold rings in his ears, a crown of clover and a fiddle older than the village.',
      gmNotes: 'Beat his wager and he pays without debt: Pipes of Haunting, or he comes to the bower and plays, giving advantage on any check to sing or soothe the thorn wardens. He only fights if the ring is broken.',
    },
    {
      id: 'pf_tfegubbin', name: 'Gubbin Saltpinch', title: 'chef of the Midsummer Feast', kind: 'monster', art: 'goblin-boss', monsterId: 'goblinBoss',
      wants: 'Salt. Real mortal salt. He has not tasted any in two hundred years.',
      knows: 'Which dishes are unsafe. That last year the Lord ordered the damson tart sent to the singer by a server, not from his own hand. Where the heel of honest bread is.',
      voice: 'Shouts everything, waves a ladle, swears by "burnt sugar!"',
      appearance: 'A pot-bellied goblin in a paper hat three feet tall, with a necklace of wooden spoons.',
      gmNotes: 'A pinch of salt makes him a friend; the whole pouch makes him brave enough to testify before the court. He fights only if his kitchen is attacked, and surrenders at half hit points.',
    },
    {
      id: 'pf_tfeumberfeather', name: 'Mother Umberfeather', title: 'eldest of the Parliament of Owls', kind: 'monster', art: 'giant-owl', monsterId: 'giantOwl',
      wants: 'A riddle she has never heard before.',
      knows: 'The courtesies, the three roads to the bower, and that the Lord keeps names as birds.',
      voice: 'Hoots softly before every sentence, and repeats the last word you said as a question.',
      appearance: 'A snow-white owl as big as a pony, with spectacles of moon-glass perched on her beak.',
      gmNotes: 'Her riddle: "I wear a cap but have no head, I make a ring but have no finger, and I dance all night without feet." (Toadstools, or a fairy ring.) Answer it, or tell her a good riddle she has not heard, and she answers one question truthfully.',
    },
    {
      id: 'pf_tfecorbin', name: 'Corbin Askew', title: 'a statue in the garden', kind: 'npc', art: 'commoner',
      wants: 'His name back, even though it means he will be an old man by morning.',
      knows: 'The fountain stair and the words that open it. That the four blank-faced statues are the Lord\'s gardeners, not guests.',
      voice: 'Creaks like a door in the cold. Speaks very slowly, and only while moonlight is on him.',
      appearance: 'A stone tinker with a pack of pots on his back and a stone cup raised in a toast.',
      backstory: 'Came to the feast eighty years ago to sell pots, ate the third course, and stayed.',
      gmNotes: 'His cage tag reads "80 Midsummers past: a tinker with a squeaky cart." If his bird is freed he wakes, ages eighty years by the dawn bell, and walks out smiling. Mortal thanks do not bind, so he thanks the heroes freely.',
    },
  ],
  handouts: [
    { id: 'invitation', title: 'A gilded leaf invitation', text: 'THE MIDSUMMER LORD OF THE THORNWOOD\nrequests the pleasure of\n(your names, in green ink, spelled perfectly)\nat his Feast, from the first star to the dawn bell.\n\nCome hungry. Come merry. Come as you are.\nLeave as you can.\n\n(on the back, smaller: Bring nothing of iron to the table, darlings. It curdles the cream.)' },
    { id: 'courtesies', title: 'Carved on the arch at the mouth of the maze', text: 'THE COURTESIES OF THE THORNWOOD\n\nA guest who takes a gift gives one back before the bell.\nA guest who gives thanks gives a debt.\nA guest who promises under the moon promises forever.\nA guest who draws iron at table is a guest no more.\nA guest who eats from the host\'s own hand is safe.\nA guest who cannot say their own name at the dawn bell has no other home.\n\nDance when asked. Leave when the bell rings.\nNot before. Not after.' },
    { id: 'bill-of-fare', title: 'The bill of fare, as Thimbleweed sings it', text: 'THE FIRST: Dew in acorn cups, and bread of milled moonlight.\nTHE SECOND: A pie of nine larks, still singing.\nTHE THIRD: The Damson Tart, so sweet you will forget yourself.\nTHE FOURTH: The Hart\'s-Heart Roast, carved and served by our Lord\'s own hand.\nTHE FIFTH: Starlight Jelly, which trembles at a lie.\nTHE SIXTH: The Last Cup, poured at the bell, for all who wish to stay.' },
    { id: 'cage-tags', title: 'Tags on the cages of names', text: 'Tied to the cages with green thread, each in a different hand:\n\n"80 Midsummers past: a tinker with a squeaky cart."\n"51 Midsummers past: a soldier who would not stop toasting."\n"33 Midsummers past: a girl who curtseyed to everyone."\n"12 Midsummers past: a shepherd who whistled."\n"Last Midsummer: a seamstress who sang. MINE."\n\n(one cage is empty, and its tag is blank and waiting)' },
    { id: 'lullaby', title: "The Dace sisters' lullaby", text: 'Hush now, Merri, hush now, Clem,\ntwo brown birds on the one green stem.\nOne flies east and one flies west,\nboth come home to the one warm nest.\n\nHush now, Clem, and hush now, Merri,\nthe moon is a boat and the night is a ferry.\nWhoever goes, whoever stays,\nI\'ll sing you home by your own names.' },
  ],
  chapters: [
    {
      id: 'feast', title: 'Midsummer Night in the Thornwood', level: 4,
      summary: 'One night at a fey lord\'s feast: through the thorn maze to the moonlit lawn, among goblin cooks, endless dancers, riddling owls and a garden of forgotten guests, to the hollow-tree hall where names are kept in cages and down the roots to the bower where the lost singer sleeps.',
      goal: 'Win back Merriwen Dace\'s name and walk her out through the Mortal Gate before the dawn bell rings, without leaving anything of your own behind.',
      map: thornwood,
      npcs: [
        { npc: 'pf_tfeclemency', x: 42, y: 75 },
        { npc: 'pf_tfethimbleweed', x: 40, y: 38 },
        { npc: 'pf_tfefescue', x: 16, y: 40 },
        { npc: 'pf_tfegubbin', x: 62, y: 40 },
        { npc: 'pf_tfeumberfeather', x: 11, y: 63 },
        { npc: 'pf_tfewistery', x: 9, y: 14 },
        { npc: 'pf_tfecorbin', x: 59, y: 14 },
        { npc: 'pf_tfesaffrel', x: 40, y: 9 },
        { npc: 'pf_tfemerriwen', x: 70, y: 5, hidden: true },
      ],
      scenes: [
        {
          room: 'The Mortal Gate', title: 'The stile in the thorns',
          read: 'Music drifts over the hedge, sweet enough to make your teeth ache. A young woman in a dyer\'s apron grips the stile post with both hands, as if it might run away. "You came," she says. "Please. She has until the bell."',
          gm: 'Clemency tells her story (see her profile), gives the salt, the ribbon and her 30 gp, and teaches the lullaby. The heroes\' gilded invitations let them over the stile as guests. Warn them gently: Clemency drank the wood\'s cure, so she cannot come in. Point out the bell on the post. Keep this to ten minutes.',
          handout: 'invitation',
          treasure: 'A pouch of mortal salt (priceless in the Thornwood), Merriwen\'s blue ribbon, and 30 gp.',
        },
        {
          room: 'Heart of the maze', title: 'The maze of roses', encounter: 'Topiary stags',
          read: 'White roses turn on their stems to watch you pass. At the heart of the maze two stags of clipped thorn lower their antlers, and their little bells ring once. "Whose guest are you?" they ask, in voices like wind through hedges.',
          gm: 'The courtesies are carved on the arch at the maze\'s mouth (handout). "The Midsummer Lord\'s guests" gets a bow and the way north. A hero who gives their real name, or anyone who cut the hedge, starts the fight. Fire makes the stags flinch (disadvantage on their next attack). Thimbleweed meets the heroes at the north exit, whether they fought or not, and leads them to the lawn.',
          handout: 'courtesies',
          treasure: 'At the bottom of the fountain: a silver bell (10 gp) and 14 gp in coins thrown for wishes. Taking them is fine; they were never gifts.',
        },
        {
          room: 'Owl glade', title: 'The Parliament of Owls', encounter: 'Parliament of owls', optional: true,
          read: 'A hundred owls turn their heads at once. The biggest, white as frost and wearing spectacles, blinks slowly. "Guests?" she says. "Guests. Have you brought me something new?"',
          gm: 'Mother Umberfeather trades one true answer for her riddle answered, or for a good riddle she has not heard. Good questions: where Merriwen is (under the roots, where the willow, the throne and the dry fountain meet), how names are kept (as birds in cages), or how to beat the Lord (he is bound by every word he says). Attacking an owl, or leaving without paying for an answer, sets off the whole parliament. Ten giant owls swoop and strike, then scatter if Umberfeather is hurt.',
          treasure: 'In the old nest: 2 potions of healing, a moonstone (50 gp) and a ring of copper keys that open nothing in this world.',
        },
        {
          room: 'The Gifting Thorn', title: 'Take what you like', encounter: 'The debt-hounds', optional: true,
          read: 'The lone thorn tree is hung with treasures: a velvet cloak that ripples like water, a silver flute, rings on every twig. A painted board reads FOR OUR GUESTS. TAKE WHAT YOU LIKE. Somewhere nearby, something large is panting.',
          gm: 'Every gift is real and every gift is a debt (DC 14 Arcana or Insight to see it). A fair gift left in return (gold of equal value, a true story, a lock of hair) clears it, and the tree rustles happily. A hero who takes something and leaves nothing is followed by the debt-hounds: four debt-hounds (long grey hounds with coin-bright eyes) and four sprites riding on their collars. They do not fight to kill; they try to drag the debtor back to the tree. Paying, even mid-fight, stops them at once.',
          treasure: 'For a fair trade: a cloak of elvenkind, a silver flute (25 gp) or a ring of water walking. Each takes a gift of similar worth.',
        },
        {
          room: 'Feasting lawn', title: 'The Midsummer Feast',
          read: 'Thimbleweed blows his honeysuckle trumpet. "Guests! Be seated! The FIRST course!" Goblins in tall paper hats set down acorn cups of dew and bread that glows like a lantern. All down the long tables, masked faces turn to look at you, and smile, and wait to see what you will do.',
          gm: 'The feast runs on the bill of fare (handout), one course an hour. 1st: safe. 2nd: eat a singing lark and lose your voice until the next course (DC 12 Constitution save), no verbal spells. 3rd: the damson tart; DC 13 Wisdom save or forget your own name, and you cannot leave at the bell until it is given back. 4th: from the Lord\'s own hand, always safe; refusing it is an insult the court remembers. 5th: starlight jelly; you glow, and cannot tell a lie for an hour. 6th: the Last Cup at the bell; drink and you stay a year. The way to win without a fight: before the court, with Gubbin\'s testimony, show that Merriwen\'s tart came from a servant on the Lord\'s orders, not from his hand. The court gasps, Saffrel flushes, and he must give her name back ("I am... discourteous. Take it."). A wager offered in rhyme here before everyone cannot be refused.',
          handout: 'bill-of-fare',
        },
        {
          room: 'Goblin kitchen', title: 'Too many cooks', encounter: 'Kitchen brawl',
          read: 'Steam, shouting and the smell of burnt sugar. A goblin in a towering paper hat whacks a pot with his ladle. "OUT! Guests in the FRONT! Unless..." His nose twitches. "Unless one of you smells of... is that... SALT?"',
          gm: 'Gubbin trades: a pinch of salt for which dishes are safe; the whole pouch for his testimony about the damson tart and the heel of honest bread from the larder. He knows the larder still holds last year\'s tarts (handy to show the court, or to slip to an enemy). Draw a blade or smash his pots and the whole kitchen fights: Gubbin, six goblin cooks and eight scullions with skewers and hot fat. They surrender when Gubbin does.',
          treasure: 'In the larder: the heel of honest bread (eaten, it gives back one forgotten name), 2 potions of healing in honey jars, and a thimble of real cream (Thimbleweed\'s price).',
        },
        {
          room: 'Toadstool ring', title: 'The Endless Reel', encounter: 'The wild revel', optional: true,
          read: 'The fiddle never stops. Dancers in leaf masks whirl past, laughing, their feet bare and bleeding and happy. The satyr with the fiddle catches your eye and grins. "Dance with me, my lamb? Win, and I give you a gift with no debt on it. Lose, and you dance till the next course."',
          gm: 'Fescue\'s wager: best two of three DC 13 Constitution or Charisma (Performance) checks. Win and he gives Pipes of Haunting with no debt, or he comes to play at the bower. He also lets slip (to winners, or with DC 14 Persuasion) that the Lord cannot refuse a wager offered in rhyme before the court. Lose and the dancer is stuck until a friend pulls them out (DC 13 Athletics, and the puller must step into the ring). Breaking the ring with iron or fire turns the revel wild: five satyrs and four sprites attack until the ring is mended.',
          treasure: 'Pipes of Haunting (Fescue\'s prize), or 3 golden toadstool caps (25 gp each) left by a dancer who danced herself to dust.',
        },
        {
          room: 'Moonlit pond', title: 'The lady of the willow', encounter: 'Lights on the pond',
          read: 'Two moons float on the black water, and pale lights drift above it like lanterns carried by no one. Under the willow, a woman with leaves for hair stops combing and looks at you. "You have come for the singer," she says. "Good."',
          gm: 'Lady Wistery helps for a price (see her profile): the willow-root way, the word for the hall\'s hidden door, and which cage is Merriwen\'s. Heroes carrying light near the water draw the wisps, which lead them toward the deep middle where two giant toads wait. Carrying no light, or walking in darkness, the wisps ignore them. A DC 13 Wisdom save while looking into the pond shows a hero anything they have forgotten tonight.',
          treasure: 'On the pond bed (DC 12 Athletics to dive): 120 gp in drowned coins and a silver hand mirror (25 gp).',
        },
        {
          room: 'Garden of statues', title: 'The garden of forgotten guests', encounter: "The gardener's statues",
          read: 'Statues stand in every green room of the hedge garden: a farmer, a girl mid-curtsey, a soldier with a raised cup. When the moonlight touches the tinker in the corner, his stone lips move. "Is it Midsummer again?" he whispers. "Have you... brought my name?"',
          gm: 'Corbin Askew tells the heroes about the cages, the fountain stair and its words ("I would like to leave now"). Four statues are the Lord\'s stone gardeners and two hedges are living topiaries: they attack anyone who damages a statue, forces the fountain, or tries the stair without the words. Spoken politely, the words open the basin onto a root stair down to the spinners\' hollow. If the heroes free Corbin\'s name later, he wakes here, old and smiling.',
          treasure: 'In the stone hand of the girl mid-curtsey: a wand of magic missiles she brought as a gift sixty years ago. A spell scroll of Remove Curse is tucked in the fountain\'s dry spout.',
        },
        {
          room: 'Hollow-tree hall', title: 'The court of the Midsummer Lord', encounter: "The Lord's wrath",
          read: 'Inside the great tree, hundreds of cages hang from the roots like fruit, and in each a small brown bird sits silent. Lord Saffrel rises from his hawthorn throne, bells chiming in his antlers. "Brave strangers! I asked for you especially. Will you play a game with me?"',
          gm: 'Saffrel loves a wager. His Riddle Game: three riddles; answer all three and he grants one boon he can give (Merriwen\'s cage). Fail one and the heroes owe him a boon (a hero serves the court until the bell). 1: "Every guest at this table walks toward me, and when I come, the feast is over." (Dawn.) 2: "I weigh nothing, yet I can bind a lord. Keep me and I am worth nothing to anyone else; break me and you pay." (A promise.) 3: "You had me before you could speak. Others use me far more than you do. Lose me tonight and you lose the way home." (Your name.) The heroes may ask him one riddle back: if he cannot answer, they win. Cage tags (handout) show which bird is whose. Stealing a cage (DC 15 Sleight of Hand) makes the heroes thieves: Saffrel fights, and yields at half hit points. The secret door in the east wall, behind the harpsichord, opens to the word "Evening" or a DC 15 Perception.',
          handout: 'cage-tags',
          treasure: 'Merriwen\'s name-bird in its silver cage (the cage is worth 50 gp). Saffrel\'s goblet of horn and moonstone (250 gp) if he yields. Every name-bird set free flies home.',
        },
        {
          room: "Spinners' hollow", title: 'Spinners in the roots', encounter: 'Spinners in the roots',
          read: 'Grey silk hangs in curtains between the roots, and bundles the size of people turn slowly in the dark. One of them is humming. Something with too many legs clicks across the ceiling toward you.',
          gm: 'Where the three secret roads meet. An ettercap and two giant spiders spin silk for the court\'s gowns, and eat whoever gets lost down here. They are not courteous and cannot be bargained with, but fire burns the webs (and the spiders hate it). The humming bundle is a sprite: cut free, she owes the heroes a favour and tells them the thorn wardens fear fire and love a lullaby.',
          treasure: 'In the webbed gear of old guests: 90 gp, a silvered dagger, and a potion of greater healing.',
        },
        {
          room: 'The hidden bower', title: 'The Midsummer Lady', encounter: 'The thorn wardens',
          read: 'Roses climb the roots into a dome of white and red. Moonlight falls on a canopied bed where a young woman in a gown of petals sings a song with no words. She looks up at you without a flicker of knowing. "Have you come to hear me sing?" she asks. Around her, the rose briars slowly stand up.',
          gm: 'Three thorn wardens and a wisp guard Merriwen. They wake if anyone touches her or the bed without the Lord\'s leave. Singing Clemency\'s lullaby (handout) makes Merriwen weep and listen, and the wardens hesitate for one round. Merriwen\'s name, from the cage-bird or the heel of honest bread, brings her back: she raises her hand and the wardens sleep. With the Lord\'s leave (won or shamed), they bow and let her go. Then it is a run for the gate. The sixth course is being poured, the Last Cup is offered to every passing guest, and the dawn bell is about to ring.',
          handout: 'lullaby',
          treasure: 'Merriwen\'s silver thimble and needle case (25 gp), and a white rose that never wilts, for Clemency.',
        },
      ],
      wrapUp:
        'If the heroes reach the Mortal Gate with Merriwen before the bell, she steps over the stile, says "My name is Merriwen Dace," and her sister catches her. Any names set free fly over the hedge after them. The wood then collects every unpaid debt on your list, gently and exactly. The heroes reach level 5.',
    },
  ],
  ending:
    'Good ending: Merriwen walks out through the stile with her name, and the sisters go home down the lane. If the heroes freed other names, Corbin Askew and the others walk out too, old and amazed, into a world that has moved on. A Lord beaten fairly bows and keeps his word, and is secretly delighted: something new happened at his feast. Bad ending: the bell rings with Merriwen inside. She forgets the mortal world and becomes the Midsummer Lady, and a new statue stands in the garden for any hero left behind. Clemency waits at the stile every Midsummer after. Either way, unpaid debts follow the heroes home: a shadow that comes back a minute late, a voice gone hoarse, a dream that is not theirs. Next: next spring a gilded leaf arrives early, with every hero\'s name on it. Saffrel heard something new, and he wants more. And one cage tag in his hall had a hero\'s grandmother\'s description on it.',
};

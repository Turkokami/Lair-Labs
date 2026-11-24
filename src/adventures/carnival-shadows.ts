// The Carnival of Borrowed Shadows: a one-night one-shot for four heroes of level 6.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng, type Side } from './builder';
import type { Adventure } from './types';

// Whistling Brook runs north to south down the west of the map.
const BROOK: [number, number][] = [[26, 0], [25, 10], [23, 20], [22, 30], [21, 40], [20, 50], [20, 60], [18, 70], [18, 79]];
function brookX(y: number) {
  for (let i = 0; i < BROOK.length - 1; i++) {
    const [ax, ay] = BROOK[i], [bx, by] = BROOK[i + 1];
    if (y >= ay && y <= by) return Math.round(ax + ((bx - ax) * (y - ay)) / (by - ay));
  }
  return BROOK[BROOK.length - 1][0];
}

/** Paint a trodden path along a list of points, only on dry open ground. */
function lane(b: MapBuilder, pts: [number, number][], w = 2, mat = 'dirt') {
  for (let p = 0; p < pts.length - 1; p++) {
    const [ax, ay] = pts[p], [bx, by] = pts[p + 1];
    const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(ax + ((bx - ax) * s) / steps), y = Math.round(ay + ((by - ay) * s) / steps);
      for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) if (b.cellAt(x + i, y + j) === 1) b.paint(x + i, y + j, 1, 1, mat);
    }
  }
}

/** A round tent or platform: walls along the edge of a circle, except where `gaps` says. */
function round(b: MapBuilder, cx: number, cy: number, r: number, o: { mat?: string; kind?: 'low'; gaps?: string[] } = {}) {
  const inside = (x: number, y: number) => (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r;
  const gaps = new Set(o.gaps ?? []);
  for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++)
    for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
      if (!inside(x, y)) continue;
      if (o.mat) b.paint(x, y, 1, 1, o.mat);
      const sides: [number, number, Side][] = [[x, y - 1, 'n'], [x, y + 1, 's'], [x - 1, y, 'w'], [x + 1, y, 'e']];
      for (const [nx, ny, side] of sides) if (!inside(nx, ny) && !gaps.has(`${x},${y},${side}`)) b.wall(x, y, side, o.kind);
    }
  return inside;
}

/** A beast pen: dirt floor, plank walls, a barred front with a locked cage door in the middle. */
function pen(b: MapBuilder, x: number, y: number, w: number, h: number, front: Side) {
  b.floor(x, y, w, h, 'dirt');
  b.wallRun(x, y, w, 'n').wallRun(x, y + h - 1, w, 's').wallRun(x, y, h, 'w').wallRun(x + w - 1, y, h, 'e');
  if (front === 'n' || front === 's') {
    const fy = front === 'n' ? y : y + h - 1;
    for (let i = 0; i < w; i++) b.wall(x + i, fy, front, 'bars');
    b.door(x + Math.floor(w / 2), fy, front, 'locked', 'door-iron');
  } else {
    const fx = front === 'w' ? x : x + w - 1;
    for (let j = 0; j < h; j++) b.wall(fx, y + j, front, 'bars');
    b.door(fx, y + Math.floor(h / 2), front, 'locked', 'door-iron');
  }
}

function stilecrossMeadow() {
  const b = new MapBuilder('adv-carnival-shadows', 'Stilecross Meadow, the night of the carnival', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'wood' });

  // ---------- the Hollow Hill (north): a grassy barrow the hag lives under ----------
  const hr = rng(6061);
  const hp = hr() * 6.28;
  for (let y = 0; y < 18; y++)
    for (let x = 22; x < 70; x++) {
      const dx = (x + 0.5 - 45) / 19, dy = (y + 0.5 - 4) / 9;
      const lim = 1 + 0.1 * Math.sin(3 * Math.atan2(dy, dx) + hp);
      if (dx * dx + dy * dy <= lim * lim) b.rock(x, y, 1, 1);
    }
  b.rock(49, 9, 11, 5);

  // ---------- Whistling Brook, with a footbridge, a ford and a mill race ----------
  for (let y = 0; y < 80; y++) {
    const c = brookX(y);
    const ford = y >= 65 && y <= 69;
    b.water(c - 2, y, 4, 1, false);
    if (!ford) b.water(c - 1, y, 2, 1, true);
  }
  b.area('Whistling Brook', [[17, 50, 6, 10]], {
    read: `A quick, cold brook chatters over stones between the town and the meadow. Coloured light from the carnival dances on the water.`,
    gm: `Deep in the middle (swim, DC 12 Athletics to cross without being swept 10 feet downstream). Running water matters: the hag's Lantern of Borrowed Shadows goes out for good if it is plunged into the brook (see the fortune card). The hollow performers will not wade it; ask why and they only smile.`,
    label: [20, 55],
  });
  b.props_('reeds', [[22, 24], [17, 58], [21, 33], [16, 75]]).props_('lily-pads', [[20, 47], [19, 61]]).props_('boulder', [[23, 13], [16, 72]]);

  // ---------- Brindlemoor's edge (west of the brook) ----------
  lane(b, [[0, 40], [17, 40]], 2, 'stone-cobble');
  lane(b, [[8, 38], [8, 40]], 2, 'stone-cobble');
  lane(b, [[6, 42], [6, 44]], 1, 'dirt');
  lane(b, [[13, 42], [13, 44]], 1, 'dirt');
  lane(b, [[10, 42], [10, 60], [12, 66], [14, 67]], 1, 'dirt');
  b.area("Brindlemoor's edge", [[0, 28, 17, 24]], {
    read: `The last cottages of Brindlemoor lean over the road, every window lit. Half the town is walking toward the music, and the other half is watching from doorways with arms folded.`,
    gm: `Talking to the watchers: the old folk remember the last time (DC 13 Persuasion or a round of drinks). "Thirty years ago. Same wagons. Same ringmaster, and he hasn't aged a day. Three went with them. Happy as larks, they said. Nobody ever heard from them again." Most young folk think it is a grandmother's tale.`,
    label: [4, 41],
  });
  b.building("Reeve's tollhouse", 3, 32, 8, 6, {
    mat: 'wood-planks-dark',
    read: `A neat stone tollhouse with the town's brindled-cow sign over the door. On the desk, beside the toll book, sits a purse of gold far too heavy for a road toll.`,
    gm: `Reeve Harlan Stoat's office. The purse holds 300 gp in new gold: the carnival's "meadow fee". The toll book has a page torn out (DC 12 Investigation finds the indent of the writing on the next page: "3 tickets. S.M. returns T. at dawn."). Harlan let the carnival in because the ringmaster promised to give back his sister. Faced with the page, he breaks down and helps.`,
    doors: [[7, 37, 's']],
    windows: [[3, 34, 'w'], [10, 34, 'e'], [5, 32, 'n']],
  });
  b.prop('desk', 6, 33).prop('chair', 6, 34).prop('strongbox', 9, 33).props_('bookshelf', [[4, 33], [4, 35]]).prop('fireplace', 9, 36).prop('coat-rack', 5, 36).light(6, 33, 10, 15);
  b.building("Chandler's cottage", 2, 45, 7, 5, {
    read: `Candles on every sill, every shelf, every step. A woman sits by the door with her shawl clutched tight, staring across the brook at the lights.`,
    gm: `Bessa Coyle's home. Her mother, Wenda Coyle, is the hook: Bessa won a golden ticket at dusk, came home to change into her best dress, and went back laughing. "She kissed me goodbye. Bessa doesn't kiss me goodbye. She's nineteen." Wenda pays all she has (60 gp) and promises free candles for life.`,
    doors: [[5, 45, 'n']],
    windows: [[2, 47, 'w'], [8, 47, 'e']],
  });
  b.props_('candles', [[3, 46], [7, 46], [3, 48]]).prop('workbench', 6, 48).prop('shelf-jars', 7, 48).prop('rocking-chair', 4, 47).prop('cauldron', 5, 48).light(4, 46, 8, 12, '#ffd27a');
  b.building('The Tipsy Kettle', 10, 45, 7, 6, {
    mat: 'wood-planks',
    read: `A low taproom that smells of cider and wet dogs. Tonight it is almost empty: the landlord polishes the same mug over and over and will not look toward the meadow.`,
    gm: `The landlord, Merrin, was a boy the last time the carnival came. He saw his best friend's shadow "walk off on its own" at the big top door. A hero who shares a drink and listens gets the story and the advice: "Don't take a gold ticket. Don't take anything they give you for free." Rest here is safe until the 11th bell.`,
    doors: [[13, 45, 'n']],
    windows: [[16, 48, 'e'], [10, 48, 'w']],
  });
  b.prop('bar-counter', 11, 46).prop('keg-rack', 11, 49).props_('table-round', [[13, 47], [15, 49]]).props_('stool', [[12, 47], [14, 47]]).prop('hearth-oven', 15, 46).prop('tavern-sign', 13, 44).light(13, 47, 10, 15);
  b.props_('lamp-post', [[2, 39], [14, 39], [17, 42]]).props_('fence-wood', [[1, 43], [9, 43], [16, 43]]).props_('hedge', [[2, 31], [11, 30]]).prop('well', 13, 37).prop('handcart', 15, 36).prop('notice-board', 11, 39).prop('signpost', 17, 39);
  for (const [x, y] of [[2, 39], [14, 39], [17, 42]]) b.light(x, y, 10, 15);
  b.start(1, 40, 3, 2);

  // the commons and the orchard, north of the town
  b.area('Brindlemoor commons', [[0, 0, 20, 27]], {
    read: `Apple trees, a grazing common and a footpath along the brook. From here the carnival is a ring of coloured fire on the far bank, and the big top glows like a lantern.`,
    gm: `A quiet way north along the brook to the foot of the Hollow Hill. A hero who watches the hill for a while (DC 14 Perception) sees a thin light come and go at the waterline: the brookside mouth of the hag's cave.`,
    label: [8, 12],
  });
  b.props_('tree-oak', [[3, 4], [8, 3], [13, 6], [4, 11], [10, 14], [15, 18], [5, 21], [12, 24], [2, 17]]).props_('haystack', [[6, 8], [16, 10]]).prop('stump', 9, 9).prop('beehive', 14, 3).prop('log-fallen', 4, 15).prop('scarecrow', 17, 2).props_('flowers', [[7, 19], [11, 7]]).prop('fence-gate', 18, 26);

  // the old mill and the ford (south-west)
  b.water(12, 64, 5, 1, false);
  b.building('The old mill', 3, 61, 9, 7, {
    mat: 'wood-planks',
    read: `A mill with half its roof fallen in. The wheel creaks round in the race, turning nothing.`,
    gm: `Abandoned since the miller went with the carnival thirty years ago (his name, Wystan Stoat, is carved on the beam: he was Harlan's father). In the rafters (DC 13 Perception) hangs a bundle wrapped in oilcloth: the miller's notes on the carnival's last visit, ending "Running water. The lantern. Running water." A good place to hide, to rest, or to drag the lantern to: the race runs right past the door.`,
    doors: [[11, 64, 'e', 'open', 'door-broken'], [6, 61, 'n', 'closed']],
    windows: [[3, 64, 'w'], [8, 67, 's']],
  });
  b.prop('grindstone', 6, 64).props_('flour-sacks', [[4, 62], [4, 66]]).prop('ceiling-rubble', 9, 63).prop('broken-furniture', 9, 66).prop('ladder', 5, 62).prop('cobweb-corner', 10, 62).prop('debris-wood', 13, 63);
  b.area("Miller's ford", [[14, 65, 8, 5]], {
    read: `The brook spreads out wide and shallow here over flat stones. On the far bank, the carnival's rope fence has been trampled flat.`,
    gm: `Knee-deep, no checks needed. The quiet back way into the carnival: it comes out behind the mirror maze, where no roustabout is watching.`,
    label: [18, 67],
  });
  b.props_('boulder', [[17, 66], [19, 68]]).prop('reeds', 21, 69).prop('signpost', 13, 69);

  // ---------- the footbridge and the ticket gate ----------
  b.floor(18, 40, 6, 2, 'wood-planks');
  b.area('The footbridge', [[18, 40, 6, 2]], {
    read: `A humpbacked plank bridge, hung tonight with paper streamers. A painted board on a post reads: ONE NIGHT ONLY. GONE BY DAWN.`,
    gm: `The main way over. Paper streamers are tied along the rails; one is black and has no colour in any light (DC 12 Arcana: it is a strip of shadow, knitted like yarn).`,
    label: [20, 40],
  });
  b.props_('lantern-hook', [[18, 41], [23, 40]]).light(18, 41, 8, 12, '#ffcf6a').light(23, 40, 8, 12, '#ff8ad8');
  // the carnival's rope fence, with gaps at the gate, the ford and the hill path
  for (let y = 16; y < 80; y++) if (!(y >= 38 && y <= 43) && !(y >= 64 && y <= 69)) b.wall(27, y, 'w', 'low');
  lane(b, [[24, 39], [51, 39]], 3, 'dirt');
  b.area('Ticket gate', [[24, 36, 8, 9]], {
    read: `A painted arch of red and gold, stuck all over with little mirrors, spells MERRIWICK'S MOONLIT MARVELS. Under it a clown with a sad white face tears tickets, and music spills out from beyond like water from a bucket.`,
    gm: `Entry costs 1 sp. The clown is Tibby Pennywhistle. As she tears a hero's ticket, she slips her note into their hand (handout). If anyone looks closely in the lamplight (DC 13 Perception, or automatic if they think to look): she casts no shadow. Neither does any performer in the carnival.`,
    label: [27, 40],
  });
  b.building('Ticket booth', 28, 34, 3, 3, {
    mat: 'wood-planks',
    read: `A booth no bigger than a privy, painted with grinning moons. A cash box rattles with pennies.`,
    gm: `Tibby's booth. The cash box holds 6 gp in copper, and a roll of ordinary paper tickets. Under the counter, a list of tonight's golden tickets: three slots, three names, Bessa Coyle's already inked in.`,
    doors: [[29, 36, 's']],
  });
  b.prop('archway-grand', 27, 40).prop('shop-counter', 29, 35).prop('coffer', 28, 35).props_('banner-pole', [[27, 38], [27, 43]]).props_('lantern-cluster', [[26, 38], [26, 42]]);
  b.light(26, 38, 10, 15, '#ff7ad1').light(26, 42, 10, 15, '#7ad1ff');

  // ---------- the Midway ----------
  b.area('The Midway', [[32, 37, 19, 8]], {
    read: `An avenue of booths under strings of coloured lamps. Knock the skull off the post! Toss a ring on the moon! Every barker shouts your name before you have told it, and every prize on every shelf is smiling.`,
    gm: `The games are rigged, but fun (DC 15 Sleight of Hand or Dexterity to win anyway; DC 13 Insight to see the rig). Every win pays a ribbon, a sweet or a tin whistle. One win in each game pays a GOLDEN TICKET instead (handout): the hag's lure. A hero who takes one feels lighter and happier at once (DC 14 Wisdom save at the 12th bell or walk to the big top smiling). The barkers are hollow performers from other towns. Cheat loudly, or break into the prize tent, and the prizes come to life.`,
    label: [40, 40],
  });
  b.props_('market-stall', [[33, 37], [37, 37], [41, 37], [33, 43], [37, 43], [41, 43]]).props_('archery-target', [[39, 37], [50, 43]]).props_('skull-pile', [[35, 37], [43, 37]]).prop('dartboard', 35, 43).prop('barrel-group', 49, 37).prop('temple-bell', 50, 38).prop('training-dummy', 39, 43).props_('crate-stack', [[47, 43], [43, 43]]);
  for (const [x, y, c] of [[34, 38, '#ff5c8a'], [38, 42, '#ffd84a'], [42, 38, '#6aff9a'], [46, 42, '#6ab4ff'], [50, 40, '#ff9a4a']] as [number, number, string][]) b.light(x, y, 10, 15, c);
  b.building("Madame Velveteen's fortune booth", 33, 32, 5, 4, {
    mat: 'wood-planks-dark',
    read: `A purple booth stitched with silver moons. Inside, an old woman with a lace veil and very good teeth shuffles a deck of cards with no pictures on them.`,
    gm: `Madame Velveteen is Tansy Mallow, a green hag, under an illusion (DC 15 Investigation to see through it by touch: her hand is cold and wet like a frog's). She tells each hero a true, unsettling fortune and hands the bravest one a card (handout). She is the hag's niece and spy. If exposed she turns invisible and runs for the Hollow Hill to warn Mother Gloam (she joins the fight there). She will trade a real secret for a hero's real name, said aloud: do not let them.`,
    doors: [[35, 35, 's', 'closed']],
  });
  b.prop('crystal-ball', 35, 33).prop('table-round', 35, 34).prop('chair-high-back', 35, 32).prop('candle-ring', 34, 33).prop('censer-hanging', 36, 33).light(35, 33, 5, 10, '#b46aff');
  b.building('Prize tent', 44, 31, 7, 5, {
    mat: 'wood-planks',
    read: `Shelf on shelf of prizes: stuffed bears, tin knights, painted swords, a velvet blanket folded on a chest. Every face on every prize turns, very slightly, to watch you come in.`,
    gm: `The prizes are animated objects, made with the hag's gift: a tin knight (animated armour), six painted knives from the knife-throw (flying swords), the velvet blanket (rug of smothering) and the prize chest (mimic). They wake if anyone cheats a game loudly or opens the tent without a barker. Calm them with a golden ticket held high (they bow to it), or by a DC 15 Performance that makes the crowd cheer.`,
    doors: [[47, 35, 's', 'closed', 'door-double'], [44, 33, 'w', 'secret']],
  });
  b.props_('wall-shelves', [[45, 32], [49, 32]]).prop('armor-stand', 46, 32).prop('mimic-chest', 48, 33).prop('rug', 47, 34, 0, { gm: true }).prop('weapon-rack', 49, 34).prop('display-case', 45, 34).prop('gm-secret-door', 45, 33, 0, { gm: true }).light(47, 33, 8, 12, '#ffd27a');
  b.building('Knife-throw booth', 44, 45, 5, 3, {
    mat: 'wood-planks',
    read: `A spinning wooden wheel with a painted lady on it, and a barker juggling knives that never quite land in his hands.`,
    gm: `Hit the wheel three times without touching the lady (DC 15 Dexterity, three throws) to win. The knives here are the flying swords of the prize fight: they slide off the counter and join in if it starts.`,
    doors: [[46, 45, 'n', 'open']],
  });
  b.props_('weapon-barrel', [[45, 46], [47, 46]]).prop('lantern-standing', 46, 46);
  b.encounter('Prizes come alive', [40, 30, 12, 15], [['mimic', 1], ['rug-of-smothering', 1], ['flying-sword', 6], ['animated-armor', 1]], 'low');

  // ---------- Sugar Row ----------
  lane(b, [[30, 42], [30, 55]], 2, 'dirt');
  b.area('Sugar Row', [[28, 45, 9, 10]], {
    read: `Copper pots of bubbling toffee, clouds of spun sugar on sticks, apples dipped in something red and glossy. The sweet smell is so thick it sits on your tongue.`,
    gm: `Run by Gorse Mallow (a green hag under a cheery baker's face), the fortune-teller's "sister". The sweets are harmless and delicious, which is the trick: anyone who eats a red apple dreams of the big top until the 12th bell (disadvantage on the Wisdom save against a golden ticket's pull). Bessa Coyle is here with her golden ticket, buying sweets for everyone with money she should not have.`,
    label: [32, 49],
  });
  b.props_('produce-stall', [[29, 46], [34, 46]]).prop('cauldron-tripod', 33, 49).prop('cooking-pot-fire', 29, 51).prop('bread-rack', 34, 52).props_('bench', [[31, 53], [35, 50]]).prop('barrel', 28, 53);
  b.light(33, 49, 10, 15, '#ff9a6a').light(29, 51, 6, 10, '#ffb35c');

  // ---------- the Carousel ----------
  lane(b, [[41, 42], [41, 49]], 2, 'dirt');
  lane(b, [[41, 58], [41, 62]], 2, 'dirt');
  round(b, 42.5, 54.5, 5.5, { mat: 'wood-planks', kind: 'low', gaps: ['42,49,n', '43,49,n', '42,59,s', '43,59,s', '37,54,w', '37,55,w', '47,54,w', '47,54,e', '47,55,e'] });
  b.area('The Carousel', [[38, 50, 9, 9]], {
    read: `A carousel of painted horses turns to wheezing calliope music, though nobody is working the crank. Every horse is white with gold reins, except the lead horse, which is black as a hole and does not go up and down like the others.`,
    gm: `The black horse is Sootfoot, Mother Gloam's nightmare, standing very still and pretending to be wood (DC 15 Perception: its nostrils steam). The painted horses carry riders round and round; anyone who rides three turns hears whispering in their ear: the names of the taken (DC 13 Investigation to pick out "Tibitha" and "Wystan"). Catching the brass ring from the pole wins a prize. Touch the black horse, or try to stop the music, and Sootfoot wakes: the painted horses tear free of their poles and charge (use warhorse stats; they are wood).`,
    label: [42, 54],
  });
  b.prop('pipe-organ', 42, 54).prop('pillar-round', 43, 55).props_('statue', [[40, 52], [45, 52], [39, 55], [46, 56], [41, 57], [44, 51]]).prop('statue-dragon', 40, 57).prop('lantern-cluster', 42, 51);
  b.light(42, 54, 15, 20, '#ffe08a').light(39, 51, 6, 10, '#ff7ad1').light(46, 57, 6, 10, '#7ad1ff');
  b.encounter('The carousel bolts', [37, 49, 11, 11], [['nightmare', 1], ['warhorse', 6]], 'low');

  // ---------- the Mirror Maze (south) ----------
  const MX = 30, MY = 62, MW = 19, MH = 15;
  b.building('The Mirror Maze', MX, MY, MW, MH, {
    mat: 'marble',
    read: `A long low hall of glass and silver. Inside, a thousand of you walk a thousand ways at once, and somewhere in the bright twisting halls a girl is laughing.`,
    gm: `The walls are mirrors, and some are clear glass (shown as windows): you can see through them but not pass. Finding the way through needs two DC 13 Wisdom (Survival) or Intelligence checks; each failure costs ten minutes. Saffi the mirror-keeper is a doppelganger. She and a second doppelganger hunt intruders in the halls, wearing the heroes' own faces, with feral shadows slipping from mirror to mirror. Saffi will sell out the hag for 500 gp, or for her life.`,
    doors: [[39, 62, 'n', 'open'], [48, 70, 'e', 'closed'], [30, 68, 'w', 'open']],
  });
  {
    const mr = rng(9137);
    const inVault = (i: number, j: number) => i >= 15 && i <= 17 && j >= 1 && j <= 3;
    const inHall = (i: number, j: number) => i >= 7 && i <= 11 && j >= 5 && j <= 9;
    const ok = (i: number, j: number) => i >= 0 && j >= 0 && i < MW && j < MH && !inVault(i, j);
    const links = new Set<string>();
    const k = (a: number, c: number, d: number, e: number) => (a * 100 + c < d * 100 + e ? `${a},${c}|${d},${e}` : `${d},${e}|${a},${c}`);
    const seen = new Set<string>(['9,7']);
    const stack: [number, number][] = [[9, 7]];
    while (stack.length) {
      const [i, j] = stack[stack.length - 1];
      const nb = ([[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]] as [number, number][]).filter(([a, c]) => ok(a, c) && !seen.has(`${a},${c}`));
      if (!nb.length) { stack.pop(); continue; }
      const [a, c] = nb[Math.floor(mr() * nb.length)];
      links.add(k(i, j, a, c));
      seen.add(`${a},${c}`);
      stack.push([a, c]);
    }
    for (let n = 0; n < 16; n++) {
      const i = Math.floor(mr() * (MW - 1)), j = Math.floor(mr() * (MH - 1));
      if (mr() < 0.5) { if (ok(i, j) && ok(i + 1, j)) links.add(k(i, j, i + 1, j)); } else if (ok(i, j) && ok(i, j + 1)) links.add(k(i, j, i, j + 1));
    }
    for (let j = 0; j < MH; j++)
      for (let i = 0; i < MW; i++) {
        if (inVault(i, j)) {
          if (i + 1 < MW && !inVault(i + 1, j)) b.wall(MX + i, MY + j, 'e');
          if (j + 1 < MH && !inVault(i, j + 1)) b.wall(MX + i, MY + j, 's');
          if (i > 0 && !inVault(i - 1, j)) b.wall(MX + i, MY + j, 'w');
          continue;
        }
        if (ok(i + 1, j) && !links.has(k(i, j, i + 1, j)) && !(inHall(i, j) && inHall(i + 1, j))) b.wall(MX + i, MY + j, 'e', mr() < 0.25 ? 'window' : undefined);
        if (ok(i, j + 1) && !links.has(k(i, j, i, j + 1)) && !(inHall(i, j) && inHall(i, j + 1))) b.wall(MX + i, MY + j, 's', mr() < 0.25 ? 'window' : undefined);
      }
    b.door(45, 64, 'w', 'secret');
  }
  b.area('Hall of Faces', [[37, 67, 5, 5]], {
    read: `The maze opens into a round room of tall gilt mirrors. In each one stands a stranger in carnival clothes, smiling, pressing their hands flat against the glass from the other side.`,
    gm: `Each mirror shows one of the hollow performers as they were when taken: their real clothes, their real face, crying. Tibby is here, nine-year-old Harlan holding her hand. A hero who touches a mirror and says that person's real name (if they know it) sees the glass fog with a breath: the person inside is still in there. This is the proof that wins Dorran and Harlan.`,
    label: [39, 70],
  });
  b.props_('magic-mirror', [[37, 67], [41, 67], [37, 71], [41, 71]]).props_('mirror', [[39, 67], [37, 69], [41, 69], [39, 71]]).prop('chandelier-crystal', 39, 69).light(39, 69, 10, 15, '#bfe3ff');
  b.area("Saffi's dressing nook", [[45, 63, 3, 3]], {
    read: `Behind the mirror is a tiny room of wigs on stands, pots of paint and a rail of dresses. One dress is Bessa Coyle's best blue, still warm.`,
    gm: `Hidden behind a swinging mirror panel (DC 15 Perception, or watch Saffi use it). Here Saffi keeps the faces she has worn: after each visit she wears the taken around their home town for a week, so no one worries until the carnival is far away. A jewellery box holds 280 gp of rings and lockets from a dozen towns: names are scratched inside, and returning them is a kindness.`,
    label: [46, 64],
  });
  b.prop('vanity', 46, 63).prop('wardrobe', 47, 65).prop('jewelry-box', 45, 65).prop('gm-secret-door', 44, 64, 0, { gm: true });
  b.props_('lantern-hanging', [[30, 63], [48, 75], [30, 75]]).light(39, 63, 6, 10, '#bfe3ff').light(33, 73, 6, 10, '#bfe3ff').light(45, 73, 6, 10, '#bfe3ff');
  b.encounter('Reflections that walk', [30, 62, 19, 15], [['doppelganger', 2], ['shadow', 6]], 'low');
  lane(b, [[24, 67], [29, 67]], 2, 'dirt');
  lane(b, [[49, 70], [56, 70]], 2, 'dirt');

  // ---------- the Ghost Train (north, under the hill) ----------
  b.building('The Ghost Train', 30, 18, 20, 11, {
    mat: 'wood-planks-dark',
    read: `A long black tent painted with grinning skulls and flapping bats. Little carts on iron rails rattle in at one end and come out at the other, and the screams from inside sound almost real.`,
    gm: `The ride goes through six dark bays. Most of the frights are puppets on strings. The specters are not: they are the ghosts of those who died fighting the carnival over sixty years, bound to the ride by the hag. The Conductor, a wraith in a stationmaster's cap, punches tickets at the last bay. Riding all the way through (in a cart, quietly) lets the heroes pass: the spirits only attack those who get out of the carts. In the last bay waits the ghost Crispin Pellow, who wants to talk.`,
    doors: [[30, 26, 'w', 'open', 'door-double'], [49, 20, 'e', 'open', 'door-double'], [40, 18, 'n', 'secret']],
  });
  ([33, 36, 39, 42, 45] as number[]).forEach((x, t) => b.wallRun(x, t % 2 === 0 ? 18 : 20, 9, 'e'));
  b.props_('mine-rails', [[31, 26], [32, 24], [32, 20], [35, 22], [38, 25], [41, 21], [44, 25], [47, 22]]).prop('mine-cart', 31, 27).prop('mine-cart', 48, 21);
  b.props_('coffin', [[34, 19], [40, 27]]).props_('skeleton-seated', [[37, 19], [43, 27]]).props_('cobweb-corner', [[30, 18], [49, 28]]).props_('chains-hanging', [[35, 26], [41, 19]]).prop('statue-gargoyle', 38, 22).prop('cage-hanging', 44, 20).prop('stairs-up', 46, 25).prop('lever', 49, 19).prop('gm-secret-door', 40, 18, 0, { gm: true });
  b.light(35, 26, 5, 10, '#7aff9a').light(41, 19, 5, 10, '#7aff9a').light(47, 24, 8, 12, '#7aff9a');
  b.encounter('The Conductor', [30, 18, 20, 11], [['wraith', 1], ['specter', 4], ['shadow', 6]], 'moderate');
  lane(b, [[28, 26], [28, 38]], 2, 'dirt');
  lane(b, [[50, 20], [62, 20]], 2, 'dirt');

  // ---------- the hill path, the Ringmaster's wagon and the hatch ----------
  lane(b, [[28, 15], [48, 16], [51, 19]], 2, 'dirt');
  b.area('The hill path', [[28, 14, 22, 4]], {
    read: `A path runs along the foot of a round green hill. Nothing grows on its top, and the grass on its slopes is flattened in a spiral, as if something very large sleeps curled up inside.`,
    gm: `The Hollow Hill. Folk in Brindlemoor call it a barrow and leave it alone. The path links the brook, the ghost train and the ringmaster's wagon. A secret flap in the back of the ghost train opens onto it.`,
    label: [36, 15],
  });
  b.props_('standing-stone', [[31, 14], [46, 15]]).props_('grass-tall', [[35, 16], [42, 14]]).prop('cairn', 39, 16).prop('thorn-bush', 28, 17);
  b.building("The Ringmaster's wagon", 52, 14, 7, 5, {
    mat: 'wood-planks-dark',
    read: `A tall wagon painted crimson, with gold stars and a gold name: SEPTIMUS MERRIWICK. A brass drummer the size of a man stands beside the steps, its sticks raised, perfectly still.`,
    gm: `The brass drummer is Bertram, a shield guardian bound to the amulet Septimus wears. It attacks anyone who opens the door without the ringmaster. Inside: a desk, a bed, a strongbox, a cupboard of top hats, and a ledger. Under the rug, a hatch (DC 14 Perception, or the drag marks give it away) opens on a ladder down into the hill. The contract (handout) is in the desk's hidden drawer (DC 15 Investigation).`,
    doors: [[55, 18, 's', 'locked'], [55, 14, 'n', 'secret']],
    windows: [[52, 16, 'w'], [58, 16, 'e']],
  });
  b.prop('writing-desk', 53, 15).prop('bed-canopy', 57, 15).prop('strongbox', 57, 17).prop('wardrobe', 53, 17).prop('rug-round', 55, 15).prop('trapdoor', 55, 15, 0, { gm: true }).prop('mirror', 54, 15).prop('gm-secret-door', 55, 14, 0, { gm: true }).light(54, 16, 8, 12, '#ffcf6a');
  b.prop('statue-tall-knight', 55, 19).prop('banner-pole', 51, 19).prop('lamp-post', 59, 19).light(59, 19, 8, 12, '#ffcf6a');
  b.encounter('Bertram the brass drummer', [50, 14, 11, 8], [['shield-guardian', 1]], 'low');

  // the hag's tunnels under the Hollow Hill
  b.cave("Mother Gloam's bower", 44, 5, 7, 3.6, {
    seed: 61,
    mat: 'cave-floor',
    read: `A round warm room under the hill, roots hanging from the roof like curtains. A tiny old woman sits in a rocking chair, knitting something long and black that ripples like smoke. Beside her on a stand hangs an iron lantern full of shadows that press against the glass like moths.`,
    gm: `Mother Gloam, a night hag, with her nieces Tansy and Gorse (green hags) if they have been warned, and the feral shadows and specters of the carnival's oldest victims. The lantern on the stand is the Lantern of Borrowed Shadows (AC 15, 25 hit points, immune to necrotic and psychic damage; or plunge it into running water). Smash it and every stolen shadow flies home in a rush of cold wind. Gloam would rather bargain than die: she offers to "forgive" Brindlemoor's tithe if the heroes leave her the lantern. She keeps every bargain to the letter, and no further.`,
  });
  b.props_('rocking-chair', [[45, 5]]).prop('cauldron', 41, 4).prop('candle-ring', 47, 6).prop('rug-pelt', 44, 6).prop('brazier-pedestal', 43, 3).prop('chains-hanging', 49, 5).prop('bone-heap', 39, 6).prop('spinning-wheel', 47, 3);
  b.light(43, 4, 12, 18, '#9a6aff').light(48, 6, 6, 10, '#9a6aff');
  b.cave('The name-jars', 35, 5, 3.5, 2.6, {
    seed: 62,
    mat: 'cave-floor',
    read: `Shelves cut in the earth hold hundreds of little stoppered jars. When you lean close, each one whispers a single word over and over, very softly.`,
    gm: `Each jar holds the true name of one hollow performer, taken with their shadow. Opening a jar and speaking its name to its owner gives them back their memory at once (even before the lantern breaks). Tibby's jar says "Tibitha". There are 212 jars. Stealing them enrages Gloam: she follows the thief by smell.`,
  });
  b.props_('shelf-jars', [[33, 4], [36, 4], [34, 6]]).prop('potion-shelf', 37, 6).prop('wall-shelves', 35, 4).light(35, 5, 5, 10, '#c8a8ff');
  b.tunnel([[39, 5], [37, 5]], 2, { seed: 63 });
  b.tunnel([[33, 6], [30, 8], [27, 9]], 1, { seed: 64 });
  b.tunnel([[49, 7], [52, 10], [55, 11], [55, 13]], 1, { seed: 65 });
  b.area('Brookside cave mouth', [[27, 7, 4, 4]], {
    read: `Behind a curtain of ivy, a low crack in the hillside breathes warm air that smells of wool and old pennies.`,
    gm: `The hag's back door, right on the brook. A hero who knows about running water can carry the lantern out this way and drown it in ten steps.`,
    label: [28, 9],
  });
  b.area('The hatch tunnel', [[53, 9, 4, 5]], {
    read: `A ladder drops into a narrow earth passage, propped with old tent poles. Black wool is snagged on every root.`,
    gm: `From the ringmaster's hatch up into the bower. Septimus walks it every night to bring the hag her due.`,
    label: [55, 11],
  });
  b.prop('ladder', 55, 13).prop('mine-support', 53, 10);
  b.encounter("Mother Gloam's bower", [36, 1, 16, 9], [['night-hag', 1], ['green-hag', 2], ['shadow', 6], ['specter', 6]], 'high');

  // ---------- the performers' wagon circle (north-east) ----------
  lane(b, [[62, 20], [66, 21]], 2, 'dirt');
  lane(b, [[70, 28], [64, 29]], 2, 'dirt');
  lane(b, [[76, 28], [76, 41]], 2, 'dirt');
  b.area("Performers' wagon circle", [[62, 14, 17, 15]], {
    read: `Painted wagons stand in a ring around a fire. Acrobats, jugglers and clowns sit on the steps, eating nothing and staring into the flames, all smiling the same small smile.`,
    gm: `The hollow performers, taken from towns over sixty years. They answer questions sweetly and remember nothing before the carnival. None of them casts a shadow. Roustabouts guard the circle: living hired hands (veterans and thugs) who are paid in carnival gold and know exactly what happens at midnight. They throw out snoopers, and fight if pushed. A bribe of 50 gp each, or a DC 16 Intimidation after a show of force, sends them off to get drunk.`,
    label: [70, 21],
  });
  for (const [x, y] of [[70, 15], [64, 18], [64, 22], [77, 21], [76, 25], [70, 27]] as [number, number][]) b.prop('wagon', x, y);
  b.prop('campfire', 70, 22).props_('bench-long', [[68, 20], [72, 24]]).props_('log-pile', [[67, 24], [73, 19]]).prop('cooking-pot-fire', 71, 21).props_('barrel-stack', [[62, 15], [78, 28]]).prop('hammock', 66, 16).props_('stool', [[69, 24], [72, 20]]);
  b.light(70, 22, 15, 20, '#ff9a3c');
  b.building("Tibby's caravan", 74, 15, 4, 3, {
    mat: 'wood-planks',
    read: `A tiny caravan painted with faded daisies. Inside, pinned to every inch of wall, are children's drawings of a mill and a brook.`,
    gm: `Tibby draws them without knowing why. They are Brindlemoor's mill and Whistling Brook, the place she was taken from at twelve. If Harlan sees them, he knows her at once.`,
    doors: [[75, 17, 's']],
  });
  b.prop('bunk-bed', 77, 16).prop('trunk', 74, 16).light(75, 16, 4, 8);
  b.building("Dorran's caravan", 63, 25, 4, 3, {
    mat: 'wood-planks',
    read: `A caravan that sags on its springs. Iron weights lie on the floor, and on a shelf stands one small portrait of a laughing woman.`,
    gm: `Dorran Kettleby joined willingly fifteen years ago, to stay young and strong. The portrait is his wife, left behind in a town three hundred miles away; she will be old now. Showing him the Hall of Faces, or the contract's last clause, can turn him.`,
    doors: [[65, 25, 'n']],
  });
  b.prop('anvil', 64, 26).prop('straw-bed', 66, 26);
  b.encounter('The roustabouts', [62, 14, 17, 15], [['veteran', 2], ['thug', 6]], 'low');

  // horse lines on the hill's east shoulder
  b.area('Horse lines', [[62, 0, 18, 12]], {
    read: `Big grey dray horses doze in a row, tied to a rope between stakes. Their manes are braided with black ribbons and none of them is sweating, though they pulled the wagons forty miles today.`,
    gm: `The carnival's horses never tire and never age: the hag's gift. Spooking them (a loud noise, a fire) stampedes them through the wagon circle, scattering the roustabouts for a few minutes: a good distraction. A hero with a DC 14 Animal Handling can ride one; it runs like the wind but will not cross running water.`,
    label: [71, 6],
  });
  b.props_('hitching-post', [[66, 4], [70, 4], [74, 4], [78, 4]]).props_('hay-bale', [[67, 8], [76, 9]]).props_('water-trough', [[72, 8]]).prop('cart', 64, 10).prop('haystack', 78, 1).prop('sack', 69, 10);
  lane(b, [[70, 11], [70, 14]], 2, 'dirt');

  // ---------- the Big Top ----------
  round(b, 63.5, 41.5, 11.5, { mat: 'dirt' });
  b.door(52, 40, 'w', 'open', 'door-double').door(52, 41, 'w', 'open', 'door-double').door(52, 42, 'w', 'open', 'door-double');
  b.door(74, 41, 'e', 'closed', 'door-double').door(63, 30, 'n', 'closed').door(63, 52, 's', 'closed');
  round(b, 63.5, 41.5, 4.5, { mat: 'sand', kind: 'low', gaps: ['59,41,w', '68,41,e', '63,37,n', '63,45,s'] });
  b.area('The Big Top', [[54, 32, 19, 19]], {
    read: `The great tent is striped red and cream and lit by a hundred lamps. Tiers of benches climb toward the canvas, a sawdust ring waits in the middle, and high above, empty trapezes sway in a wind you cannot feel.`,
    gm: `The evening show runs from the 9th bell to the 11th: acrobats, a strongman, a lion who jumps through fire. All delightful. At the 11th bell everyone is ushered out "while we prepare the Midnight Show". At the 12th bell only golden-ticket holders are let in (Dorran on the door). Septimus carries the lantern from his wagon into the ring, the three ticket-holders step into the sand, and the lamps go out.`,
    label: [63, 34],
  });
  b.area('The ring', [[60, 38, 8, 8]], {
    read: `The sawdust is raked smooth in a perfect circle. At its centre, painted on the floor, is a black star with three points.`,
    gm: `At midnight the three ticket-holders stand on the star's points. Each must make a DC 15 Charisma save each round for three rounds (a hero standing beside them and holding their hand grants advantage). Three failures and their shadow tears loose and flies into the lantern: they become hollow. Breaking the lantern ends it at once.`,
    label: [63, 41],
  });
  b.props_('bench-long', [[56, 36], [56, 46], [58, 33], [68, 33], [70, 36], [70, 46], [58, 49], [68, 49], [55, 41]]).props_('stairs-up', [[57, 39], [57, 43], [70, 40]]).props_('pillar-round', [[58, 41], [69, 41]]).prop('magic-circle', 63, 41).props_('rope-coil', [[61, 39], [65, 43]]).prop('throne', 63, 37).props_('banner-hanging-tall', [[54, 41], [73, 40]]).props_('chandelier-wheel', [[60, 36], [66, 46]]).prop('cage', 72, 44).prop('crate-pile', 72, 37).prop('barrel', 66, 39);
  for (const [x, y] of [[63, 41], [57, 35], [69, 35], [57, 47], [69, 47], [63, 32], [63, 50]] as [number, number][]) b.light(x, y, x === 63 && y === 41 ? 20 : 10, 20, '#ffd27a');
  b.encounter('The Midnight Show', [52, 30, 23, 23], [['mage', 1], ['gladiator', 1], ['shadow', 8]], 'high');
  lane(b, [[63, 53], [63, 57]], 2, 'dirt');
  lane(b, [[75, 41], [77, 41], [77, 56]], 2, 'dirt');
  b.props_('lamp-post', [[51, 38], [51, 43], [62, 54], [75, 39]]).light(51, 38, 8, 12).light(51, 43, 8, 12).light(62, 54, 8, 12).light(75, 39, 8, 12);

  // ---------- the Menagerie (south-east) ----------
  b.paint(54, 57, 25, 21, 'dirt');
  b.area('The Menagerie', [[54, 57, 25, 21]], {
    read: `Cages on wheels stand in a horseshoe around a trampled yard. Something huffs and paces behind every set of bars, and the air smells of straw and blood and lion.`,
    gm: `Two lions, a pacing panther, a cage of chattering monkeys, a sleepy bear, and Old Matilda, a giant grey ape who is the carnival's star. They are real beasts that do not age. Corliss Thackery the keeper loves them and hates what the carnival is. If the heroes threaten the beasts, or the hag's whistle sounds, the cages spring open and Matilda and the lions attack. With Corliss beside them (DC 14 Animal Handling, advantage if he helps) the beasts calm, or can even be turned loose on the big top at midnight.`,
    label: [66, 66],
  });
  pen(b, 55, 58, 5, 3, 's');
  pen(b, 68, 58, 5, 3, 's');
  pen(b, 74, 58, 5, 4, 's');
  pen(b, 75, 64, 4, 4, 'w');
  pen(b, 75, 70, 4, 4, 'w');
  pen(b, 60, 71, 7, 5, 'n');
  b.building("Keeper's wagon", 54, 72, 4, 3, {
    mat: 'wood-planks',
    read: `A cramped wagon full of buckets, brushes and dog-eared books about animals. A kettle is always on.`,
    gm: `Corliss's home. He keeps the cage keys on his belt and a second set here in a boot (DC 12). His notebook lists every beast and the year it joined: the oldest lion is 61 years old.`,
    doors: [[56, 72, 'n']],
  });
  b.prop('cot', 55, 73).prop('bookshelf-low', 57, 74).prop('stove', 54, 74).light(55, 73, 4, 8);
  b.props_('hay-bale', [[57, 59], [70, 59], [77, 66], [63, 73]]).props_('bones', [[76, 60], [77, 72]]).prop('water-trough', 66, 63).props_('cage', [[60, 64], [70, 68]]).prop('cage-hanging', 64, 66).props_('sack', [[58, 66], [72, 64]]).prop('handcart', 68, 74).prop('signpost', 55, 63);
  b.light(66, 64, 12, 18, '#ffb35c').light(58, 62, 6, 10).light(72, 70, 6, 10);
  b.encounter('Menagerie breakout', [54, 57, 25, 21], [['giant-ape', 1], ['lion', 2]], 'moderate');
  lane(b, [[56, 70], [60, 66], [66, 66]], 2, 'dirt');

  // south meadow dressing
  b.area('Trampled meadow', [[30, 77, 50, 3]], {
    read: `Behind the tents the meadow is dark and quiet, scattered with crushed paper cups and lost ribbons.`,
    gm: `The way round the back of everything: from the ford to the menagerie without passing a single barker.`,
    label: [52, 78],
  });
  b.props_('grass-tall', [[33, 78], [50, 78], [70, 78]]).props_('debris-wood', [[44, 77], [60, 78]]).prop('campfire-cold', 76, 78).props_('bush', [[25, 76], [52, 60], [50, 54]]).props_('tree-willow', [[24, 59], [25, 30]]);

  b.note(20, 41, 'Clock: the town bell rings every hour. Dusk is the 8th bell; the Midnight Show is the 12th; at dawn (the 6th) the carnival packs itself up in an hour and is gone.');
  b.note(55, 12, 'The hatch: ladder from the ringmaster\'s wagon up into the hill and the hag\'s bower.');
  return b.build();
}

export const CARNIVAL_SHADOWS: Adventure = {
  id: 'carnival-shadows',
  title: 'The Carnival of Borrowed Shadows',
  tagline: 'A travelling carnival comes to town for one night, and by dawn three townsfolk will leave with it, smiling.',
  levels: '6',
  sessions: '1 session',
  players: '3-5 players',
  tags: ['carnival', 'fey', 'creepy', 'one-shot', 'outdoor'],
  pitch:
    `The wagons rolled into Brindlemoor at noon, painted red and gold, with music coming out of them before anyone had touched an instrument. By dusk a whole carnival stands on Stilecross Meadow across the brook: games, sweets, a menagerie, a ghost train, a mirror maze and a great striped big top. One night only, the handbills say. Gone by dawn. Everyone is going. Your hosts at the inn are going. And the old woman on the corner, who saw this same carnival thirty years ago, is boarding up her windows.`,
  secret:
    `Sixty-one years ago, the showman Septimus Merriwick was freezing to death with a dying carnival in a hard winter. Mother Gloam, a night hag, offered him a deal: wonder that never wears out, beasts that never age, and youth for himself. The price is a tithe: in every town the carnival visits, three people must walk into the big top at midnight holding the hag's golden tickets. There, the Lantern of Borrowed Shadows tears out their shadows and their names. Without them they become hollow, smiling performers who follow the carnival forever. The shadows feed Gloam, and keep Septimus young; the oldest ones, burned thin, slip loose as hungry shadows. Why now: the carnival last came to Brindlemoor thirty years ago and took three, including the reeve's sister Tibitha. This time Septimus offered Reeve Harlan Stoat a trade: let us in, look away, and your sister comes home at dawn. It is a lie. And there is a clause in the contract Septimus hopes nobody reads: if a town's tithe goes unpaid by first light, the debt falls on the ringmaster himself.`,
  hooks: [
    `Wenda Coyle, the town chandler, begs the heroes to bring her daughter Bessa home. Bessa won a golden ticket at dusk and has been laughing ever since, and Bessa never laughs like that.`,
    `Reeve Harlan Stoat quietly pays the heroes 200 gp to "keep an eye on the carnival tonight". He will not say why, and his hands shake while he counts the coins.`,
    `At the ticket gate a sad clown tears a hero's ticket and presses a note into their palm. It is written in a child's careful hand, and it says: don't let them go in at midnight.`,
  ],
  tips: [
    `Run a clock with the town bell. Dusk is the 8th bell; each scene or fight takes about half an hour. The Midnight Show is the 12th bell. If the heroes are slow, ring the bell out loud and let them feel it.`,
    `Start whimsical. Let the heroes win prizes, eat toffee apples and ride the carousel. Then show them a performer with no shadow, and let the music sound wrong from then on.`,
    `There are three ways to win: break or drown the lantern (in the bower before midnight, or in the ring during the show); save the three ticket-holders by holding them through the show; or let the tithe go unpaid till dawn, so the hag collects Septimus instead. Clever players may find a fourth.`,
    `Most fights can be talked past. Saffi sells out for gold, Dorran turns for proof, Corliss calms the beasts, the roustabouts can be bribed, and riding the ghost train quietly avoids the spirits. Give the same reward for a clever way through as for a win.`,
    `The two high fights are big. If the party is tired, the hag's nieces can be missing from the bower (dropped by an exposed fortune-teller), and freed townsfolk can drag shadows off the heroes at the Midnight Show.`,
    `Never let a hollow performer fight. They are victims. If one is hurt, let the heroes see their shadowless face crumple, just for a moment, into real pain.`,
  ],
  npcs: [
    {
      id: 'pf_cosseptimus', name: 'Septimus Merriwick', title: 'ringmaster of the Moonlit Marvels', kind: 'monster', art: 'illusionist', monsterId: 'mage', shared: true,
      wants: `To stay young, stay alive and keep the hag fed, in that order. Above all, never to be the one who pays.`,
      knows: `Everything about the pact, the lantern, the hatch to the bower and the unpaid-tithe clause he fears.`,
      voice: `A booming showman's voice that rolls every R. When frightened it drops into a quick, wheedling whine.`,
      appearance: `A tall man who looks thirty, in a crimson tailcoat and a top hat, with a waxed moustache and eyes far older than his face.`,
      backstory: `Ran a failing carnival until a winter sixty-one years ago, when his last horse died in the snow and an old woman knocked on his wagon door.`,
      gmNotes: `Mage stat block. Wears the amulet that commands Bertram the shield guardian. At midnight he carries the lantern into the ring. Bloodied, he bargains: he will betray Gloam and hand over the lantern if the heroes promise him his life. If the tithe goes unpaid at dawn, Gloam comes for him, and he begs the heroes to protect him.`,
    },
    {
      id: 'pf_cosgloam', name: 'Mother Gloam', title: 'the Patroness, a night hag', kind: 'monster', art: 'night-hag', monsterId: 'nightHag',
      wants: `Her tithe, paid to the letter, every town, forever.`,
      knows: `Every name in her jars, every word of the contract, and every bad dream the heroes ever had.`,
      voice: `A soft, cosy granny voice with a click of knitting needles under every sentence. She calls everyone "pet".`,
      appearance: `A tiny bent old woman in a shawl, knitting black wool that moves like smoke. Her true shape is long, grey and grinning.`,
      gmNotes: `Night hag stat block. Lives in the bower under the Hollow Hill. Keeps every bargain exactly as worded. If the tithe fails, the contract gives her Septimus, and she is quite content with that: the heroes can let her leave with him, which ends the carnival.`,
    },
    {
      id: 'pf_costibby', name: 'Tibby Pennywhistle', title: 'the sad clown (once Tibitha Stoat)', kind: 'npc', art: 'jester', shared: true,
      wants: `She does not know. Something about a brook, and a mill, and a boy who held her hand.`,
      knows: `That the gold tickets are bad, that the lantern takes shadows, and that it is kept "under the hill". Not much else.`,
      voice: `Small and careful, like someone who has forgotten how sentences end. Hums a mill-song without knowing it.`,
      appearance: `A slight woman in a baggy clown suit, white face paint, a painted tear. She looks twelve years older than she was taken, not forty-two.`,
      backstory: `Taken from Brindlemoor thirty years ago, aged twelve. Something of her survived, and every year it gets a little louder.`,
      gmNotes: `Writes the note to the heroes. Her name-jar is in the bower. If Harlan says "Tibitha" to her, or the jar is opened, she remembers everything and will lead the heroes anywhere.`,
    },
    {
      id: 'pf_cosdorran', name: 'Dorran Kettleby', title: 'the strongman', kind: 'monster', art: 'gladiator', monsterId: 'gladiator',
      wants: `To go home to a wife who is old now, if he could only stop being afraid.`,
      knows: `How the Midnight Show works, where the roustabouts sleep, and that the hag hurts anyone who breaks their contract.`,
      voice: `A deep, gentle rumble. Says "aye" and "nay" and very little else.`,
      appearance: `A huge man with an oiled moustache, leopard-skin leotard and a barrel chest, gone a little grey at the temples tonight for the first time.`,
      gmNotes: `Gladiator stat block. Guards the big top door at midnight. Signed on willingly; not hollow. Turns on Septimus if shown the Hall of Faces or the contract's last clause (DC 15 Persuasion with proof, automatic with both). Once turned he holds the big top door shut on the shadows.`,
    },
    {
      id: 'pf_cossaffi', name: 'Saffi', title: 'keeper of the mirror maze', kind: 'monster', art: 'doppelganger', monsterId: 'doppelganger',
      wants: `Money, fun and new faces. Loyalty is for people with one face.`,
      knows: `Every way through the maze, every taken person's face, and the way down the hatch.`,
      voice: `Giggly and quick. Copies the voice of whoever she is talking to, a little too well.`,
      appearance: `Usually a freckled girl with silver ribbons in her hair. Truly, a grey, smooth, sexless thing with big pale eyes.`,
      gmNotes: `Doppelganger stat block. Wears the faces of the taken around their home towns for a week after each visit, so no one worries. Sells out the hag for 500 gp, or for her life if cornered.`,
    },
    {
      id: 'pf_coscorliss', name: 'Corliss Thackery', title: 'beast-keeper of the menagerie', kind: 'npc', art: 'druid', monsterId: 'druid',
      wants: `His animals safe, fed and, one day, free in a real forest.`,
      knows: `That the beasts never age, that the horses will not cross running water, and that the big top has a south flap no one watches.`,
      voice: `A low, slow country drawl, and he speaks to the animals more kindly than to people.`,
      appearance: `A weathered man with a straw hat, a leather apron and a lion-claw scar across one cheek.`,
      gmNotes: `Druid stat block. Living, not hollow, and he hates Septimus. Helps if the heroes promise the beasts come to no harm. Can open every cage at once at midnight.`,
    },
    {
      id: 'pf_cosbessa', name: 'Bessa Coyle', title: 'chandler\'s daughter with a golden ticket', kind: 'npc', art: 'commoner', monsterId: 'commoner', shared: true,
      wants: `To see the Midnight Show. Nothing has ever felt so important.`,
      knows: `Who else won tickets tonight: Corm Ashdown the thatcher and Gussie Hobnail the cobbler's widow.`,
      voice: `Bright and breathless, laughing between every word, as if someone is tickling her.`,
      appearance: `A freckled young woman in her best blue dress, wax still under her nails, clutching a golden ticket against her heart.`,
      gmNotes: `Under the ticket's pull (DC 14 Wisdom save at the 12th bell, or walks to the big top). Taking the ticket away doesn't help: it comes back to her hand. Holding her through the show, or breaking the lantern, does.`,
    },
    {
      id: 'pf_cosharlan', name: 'Harlan Stoat', title: 'reeve of Brindlemoor', kind: 'npc', art: 'noble', shared: true,
      wants: `His sister back. He has wanted it every day for thirty years, and it has made him do a terrible thing.`,
      knows: `That the carnival takes three every visit, that Septimus promised to return Tibitha at dawn, and that he took gold to let them in.`,
      voice: `Clipped and official, until it cracks.`,
      appearance: `A grey-whiskered man in a good black coat with the reeve's chain, chewing the inside of his cheek.`,
      backstory: `Was nine when he held Tibitha's hand at the big top door. She let go first.`,
      gmNotes: `Confronted with the torn page (DC 14 Insight or the page itself), he confesses and helps: he can ring the town bell early to empty the meadow, which turns a fight at the big top into a fight without a crowd.`,
    },
    {
      id: 'pf_coscrispin', name: 'Crispin Pellow', title: 'ghost of a juggler', kind: 'npc', art: 'ghost', monsterId: 'ghost',
      wants: `His juggling clubs buried in a churchyard, and the hag's lantern broken.`,
      knows: `That the lantern hangs in the bower under the hill, that running water drowns it, and where the secret flap behind the ghost train is.`,
      voice: `Light and quick, with a juggler's patter, always counting under his breath: one, two, three, catch.`,
      appearance: `A pale, see-through young man in a patched harlequin coat, juggling three clubs that pass through his own hands.`,
      backstory: `Twenty years ago he tried to steal his own shadow back from the lantern. Gloam caught him, and nailed his spirit to the ghost train as its best fright.`,
      gmNotes: `Ghost stat block, friendly. Waits in the last bay of the ghost train. Can possess a willing hero to slip past the specters. Fights at the heroes' side in the bower if they ask.`,
    },
  ],
  handouts: [
    { id: 'handbill', title: 'A carnival handbill', text: `MERRIWICK'S MOONLIT MARVELS!\nONE NIGHT ONLY on Stilecross Meadow, over the brook.\nGames! Sweets! Beasts of Far Lands!\nThe GHOST TRAIN! The MIRROR MAZE of a Thousand Selves! The Carousel that Never Stops!\nAnd at the twelfth bell, for the lucky few: THE MIDNIGHT SHOW.\nWin a Golden Ticket at any booth.\nGates open at dusk. Gone by dawn.` },
    { id: 'golden-ticket', title: 'A golden ticket', text: `ADMIT ONE to THE MIDNIGHT SHOW.\nBring nothing. Bring no one.\nCome as you are, and leave as you were always meant to be.\n— S. Merriwick, Ringmaster\n\n(very small print along the edge: The bearer comes willing, and gives at the door what is asked.)` },
    { id: 'tibby-note', title: 'A note from the clown', text: `Dont let them go in at midnight. Not with the gold tickets.\nThey take your shadow and then you forget your name.\nI was Tibitha. I think I was.\nThe lantern is under the hill. Please.\n— T.` },
    { id: 'fortune-card', title: "Madame Velveteen's card", text: `THE HOLLOW CROWN.\nYou will lose something you never knew you had.\nKeep to the light, and keep your shadow close.\nThe brook remembers what the lantern forgets.` },
    { id: 'contract', title: 'The ringmaster\'s contract', text: `...the Patroness grants the Company wonder without wearing, beasts without age, and the Ringmaster youth without end.\nIn return, each town the Company visits shall pay a tithe of THREE, who enter the Great Tent at the twelfth bell bearing the Patroness's gold, of their own free will.\nShould any town's tithe go UNPAID by first light, the debt shall fall upon the Ringmaster himself, in full.\nSigned, the Year of the Long Frost: S. Merriwick (in red ink that is not ink).` },
  ],
  chapters: [
    {
      id: 'meadow', title: 'One Night Only', level: 6,
      summary: `A whole carnival on a meadow across the brook from a market town: midway games, sweets, a carousel, a mirror maze, a ghost train, a menagerie, the performers' wagons, the ringmaster's crimson wagon and, under the Hollow Hill, the night hag who owns it all.`,
      goal: `Before the 12th bell, find out what the golden tickets do and stop the Midnight Show: break or drown the Lantern of Borrowed Shadows, save Bessa Coyle and the other ticket-holders, and deal with Septimus and Mother Gloam.`,
      map: stilecrossMeadow,
      npcs: [
        { npc: 'pf_cosharlan', x: 7, y: 34 },
        { npc: 'pf_cosbessa', x: 31, y: 50 },
        { npc: 'pf_costibby', x: 27, y: 41 },
        { npc: 'pf_cossaffi', x: 39, y: 69, hidden: true },
        { npc: 'pf_coscrispin', x: 47, y: 23, hidden: true },
        { npc: 'pf_coscorliss', x: 66, y: 68 },
        { npc: 'pf_cosdorran', x: 60, y: 44 },
        { npc: 'pf_cosseptimus', x: 63, y: 38 },
        { npc: 'pf_cosgloam', x: 44, y: 5, hidden: true },
      ],
      scenes: [
        {
          room: "Brindlemoor's edge", title: 'One night only', handout: 'handbill',
          read: `Music drifts over the brook, a tune you almost know. On the far bank a ring of coloured lights burns against the dark, and the whole town is walking toward it, laughing.`,
          gm: `The 8th bell. Give the hook. Wenda Coyle waits in her doorway; Harlan Stoat watches from the tollhouse window and looks away when he is seen. Merrin at the Tipsy Kettle can tell the story of thirty years ago. A DC 13 History check recalls a pedlar's tale of a carnival that "takes its pay in people". Let the heroes cross whenever they like.`,
        },
        {
          room: 'Ticket gate', title: 'The sad clown', handout: 'tibby-note',
          read: `A clown with a painted tear takes your penny and tears your ticket in half, slowly, as if it hurts. Her gloved fingers press something small and folded into your palm.`,
          gm: `Tibby's note. Anyone who watches her in the arch's lamplight sees she has no shadow (DC 13 Perception). If questioned here she panics and says only "Not now. Not here. They watch the gate." She can be found later at the wagon circle.`,
        },
        {
          room: 'The Midway', title: 'Games of chance', handout: 'golden-ticket', encounter: 'Prizes come alive',
          gm: `Let the heroes play. Rigged games (DC 15 to win; DC 13 Insight spots the rig). The first hero to win anything is offered a golden ticket "on the house". Taking it puts them under its pull: a DC 14 Wisdom save at the 12th bell, or they walk smiling to the big top. A hero who carries a ticket into the show takes a ticket-holder's place, which is risky but clever (three tickets, three places). Exposing a rig loudly or sneaking into the prize tent wakes the prizes. The prize tent has a secret back panel (DC 13) where barkers slip in and out.`,
          treasure: `In the prize tent's cash box: 140 gp in mixed coin. Among the prizes: a bag of tricks (gray) sewn up as a plush rabbit, and three potions of healing in heart-shaped bottles.`,
        },
        {
          room: "Madame Velveteen's fortune booth", title: 'Madame Velveteen', handout: 'fortune-card', optional: true,
          gm: `Tansy Mallow the green hag tells true fortunes, in riddles. She wants a hero's real name said aloud (if given, she can find them in their dreams: disadvantage on saves against the hag's magic tonight). Her card holds the most useful clue in the adventure: running water kills the lantern. Expose her (DC 15 Investigation by touch, or a detect magic) and she flees invisibly to warn Mother Gloam.`,
          treasure: `Under the table, a deck of illusions she uses for "readings".`,
        },
        {
          room: 'Sugar Row', title: 'Bessa and the toffee apples',
          read: `A young woman in a blue dress is handing out toffee apples to strangers, laughing so hard she has to hold on to the stall. In her other hand she clutches a golden ticket so tight it has crumpled.`,
          gm: `Bessa Coyle. Charming, unreachable: she will not give up the ticket and does not believe anything is wrong. A DC 15 Insight sees the fear behind her laughter, like someone waving from a boat that is drifting away. She names the other two ticket-holders (Corm Ashdown the thatcher, Gussie Hobnail the cobbler's widow); finding them on the Midway takes a few minutes. Gorse Mallow at the toffee stall watches the heroes and slips off to warn the hill if they look like trouble.`,
        },
        {
          room: 'The Carousel', title: 'Catch the brass ring', encounter: 'The carousel bolts', optional: true,
          gm: `Pure fun until it isn't. Three turns on a horse whispers the names of the taken. Catching the brass ring is a DC 14 Dexterity (Acrobatics) check from a moving horse. Touching the black lead horse, or jamming the calliope, wakes Sootfoot and the painted horses. Sootfoot flees to the bower when below half its hit points.`,
          treasure: `The brass ring is a ring of jumping.`,
        },
        {
          room: 'The Mirror Maze', title: 'A thousand selves', encounter: 'Reflections that walk',
          read: `Your reflection smiles at you a heartbeat before you smile. Then it turns its head, though you did not turn yours, and walks away down a hall that should not be there.`,
          gm: `Two DC 13 checks to reach the Hall of Faces. Saffi and her partner hunt in the heroes' own faces; shadows slide out of the mirrors to drain strength. Saffi offers to sell out the hag for 500 gp, or surrenders if cornered. The Hall of Faces is the proof that the taken are still alive inside. The swinging mirror to Saffi's dressing nook is hidden (DC 15 Perception).`,
          treasure: `In Saffi's nook: 280 gp of rings and lockets, each scratched with a name (and a silver hand mirror worth 25 gp).`,
        },
        {
          room: 'The Ghost Train', title: 'The last ride', encounter: 'The Conductor', optional: true,
          read: `The cart lurches into the dark. Skeletons on springs leap out and fall back, a puppet bat swoops on a wire, and something cold sits down in the empty seat beside you.`,
          gm: `Stay in the cart and keep quiet (a DC 13 group Stealth check) and the spirits only stare. Step out, fight or scream a spell, and the Conductor and his specters attack. In the last bay Crispin Pellow the ghost talks: he knows the lantern is in the bower under the hill, that running water drowns it, and that the secret flap in the tent's north wall (DC 14 Perception) leads to the hill path. He asks only that someone bury his clubs.`,
          treasure: `The Conductor's lamp is a lantern of revealing. Crispin's clubs, if buried in Brindlemoor's churchyard, let him rest; that night each hero dreams of perfect juggling and wakes with inspiration.`,
        },
        {
          room: 'The Menagerie', title: 'The keeper of beasts', encounter: 'Menagerie breakout',
          read: `A great grey ape sits behind the bars of the biggest cage, peeling an orange with enormous careful fingers. She looks at you, and then she looks over your shoulder at the big top, and bares her teeth.`,
          gm: `Corliss Thackery feeds Old Matilda and talks to the heroes over the bars. He is not hollow, and he hates Septimus. Win him (DC 13 Persuasion, or a promise that no beast will be hurt) and he tells them the big top's south flap is never watched, and offers to turn the beasts loose on the big top at midnight. Threaten the beasts, or let Gloam's whistle sound, and the cages spring open: Matilda and two lions attack. With Corliss calling, a DC 14 Animal Handling ends the fight early.`,
          treasure: `Corliss gives his friends two potions of animal friendship and the cage keys.`,
        },
        {
          room: "Performers' wagon circle", title: 'No shadows', encounter: 'The roustabouts',
          read: `Firelight jumps over a ring of painted wagons and the smiling people on their steps. Your shadows stretch long across the grass behind you. Theirs do not, because they have none.`,
          gm: `The roustabouts tell snoopers to leave. Bribe them (50 gp each), scare them off (DC 16 Intimidation after a show of strength) or fight. Tibby is here: in her caravan the heroes can see her drawings of Brindlemoor's mill. If Harlan is brought and says "Tibitha", she remembers, weeps and tells everything she knows. Dorran is in his caravan before the show; see his profile.`,
          treasure: `The roustabouts' purse: 90 gp in carnival gold that turns to dry leaves at dawn, and 30 gp that doesn't.`,
        },
        {
          room: "The Ringmaster's wagon", title: 'The hatch', encounter: 'Bertram the brass drummer', handout: 'contract',
          gm: `Bertram the shield guardian attacks anyone who opens the wagon without Septimus (the door is locked: DC 15 thieves' tools). If Septimus is in the big top, Bertram can be lured away with noise. Inside, the hidden drawer (DC 15 Investigation) holds the contract: its last clause is the key to the clever ending. Under the rug, the hatch leads into the hill. The ledger lists towns and dates back sixty-one years, three names each; Brindlemoor appears twice.`,
          treasure: `In the strongbox: 1,100 gp in gold, a wand of magic missiles, and two potions of greater healing.`,
        },
        {
          room: "Mother Gloam's bower", title: 'The knitting hag', encounter: "Mother Gloam's bower",
          read: `An old woman in a rocking chair looks up from her knitting, delighted. "Visitors, at this hour! Sit, pets, sit. I'll put the kettle on." Behind her, an iron lantern rattles on its hook, full of shadows beating at the glass.`,
          gm: `Reach the bower by the hatch, the brookside cave mouth or the name-jars. Gloam talks first. She will "forgive" Brindlemoor's tithe if the heroes leave the lantern alone, and she means it, to the letter: Brindlemoor pays nothing, and the carnival takes its three in the next town. Fight, and her nieces (if they are here), shadows and specters join in. Smash the lantern (AC 15, 25 hp) or carry it ten steps to the brook and drown it. Either way every stolen shadow flies home and the hollow performers wake. Gloam then flees into the Ethereal Plane, cursing.`,
          treasure: `A shawl of shadow-yarn (cloak of protection), Gloam's hoard of 600 gp in old coins from forty towns, and gems worth 500 gp. The name-jars restore the taken's memories when opened.`,
        },
        {
          room: 'The Big Top', title: 'The Midnight Show', encounter: 'The Midnight Show',
          read: `The 12th bell rings across the meadow. Three people in their best clothes walk into the sawdust ring, smiling, and Septimus Merriwick raises an iron lantern full of moving darkness. "Ladies and gentlemen," he whispers, and every lamp goes out.`,
          gm: `If the lantern still exists, Septimus brings it here. Each ticket-holder makes a DC 15 Charisma save each round for three rounds (advantage with a hero holding their hand); three failures and they are hollow. Dorran fights unless turned; shadows pour from the lantern. Breaking it here (AC 15, 25 hp, it's in Septimus's hand) ends the ceremony at once. Bloodied, Septimus offers to give up the hag. If the heroes simply keep the three ticket-holders out until dawn, the tithe goes unpaid, and at first light Mother Gloam steps out of the shadows to collect her ringmaster.`,
          treasure: `Septimus's top hat (hat of disguise) and the night's takings: 300 gp in a velvet bag.`,
        },
      ],
      wrapUp: `If the lantern breaks, hundreds of shadows pour home across the dark, and a hundred and more hollow performers stop smiling and start to cry, and remember. Septimus ages sixty-one years in a breath. At dawn the carnival's wonders fade: the carousel is rotten wood, the wagons are old, and the beasts are only beasts. Brindlemoor wakes to a meadow full of lost people from forty towns.`,
    },
  ],
  ending:
    `Win: the lantern is broken or drowned, Bessa and the others walk home with their shadows, and Tibitha Stoat sits by her brother's fire for the first time in thirty years. The freed performers need getting home, which is a good reason for the heroes to travel. Harlan resigns as reeve (unless the heroes speak for him). Clever win: the heroes keep the ticket-holders out till dawn, and Mother Gloam takes Septimus away by the hand, as the contract says. The carnival dies with him, but the lantern goes with the hag. Lose: at dawn the carnival packs itself up in an hour and rolls away with three new smiling faces. It will stop in the next market town in a week, and the heroes can still catch it. Next: Mother Gloam keeps her lantern, her jars and her grudges. Somewhere a new showman is freezing in the snow, and an old woman is knocking on his door.`,
};

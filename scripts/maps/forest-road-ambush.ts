// Forest Road Ambush, grown into a stretch of wild forest: the old ambush at the narrows and the ruined watch hut
// are still here, now with a river (falls, rapids, a broken bridge and a ford), the bandits' palisade camp, a
// hunter's lodge, a wolf hollow, a bear cave, a marsh, standing stones with a hidden barrow, and the bandit
// captain's hideout in the cliffs behind the waterfall.
// Run: npx vite-node scripts/maps/forest-road-ambush.ts
import { MapBuilder, type Dir, type PropOpts, type Rect } from '../mapkit';
import { objectById } from '../../src/library/objects';

const b = new MapBuilder('forest-road-ambush', 'Forest Road Ambush', 68, 48, {
  theme: 'stone', wallStyle: 'stone', ambient: 'bright', floor: 'grass', seed: 2207,
});

// ---------- helpers ----------
const W = b.cols;
const matAt = (x: number, y: number) => b.mats[y * W + x];
/** Squares taken by things that stand up (floor-layer things like traps and stains don't count). */
const taken = new Set<string>();
const keepClear = new Set<string>();
const clear = (x: number, y: number, w = 1, h = 1) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) keepClear.add(`${i},${j}`); };
function foot(kind: string, rot = 0): [number, number] {
  const d = objectById(kind);
  const w = d?.w ?? 1, h = d?.h ?? 1;
  return ((rot % 360) + 360) % 180 ? [h, w] : [w, h];
}
const skipped: string[] = [];
/** Place a thing; refuse (and report) if its footprint is off the floor or on another standing thing. */
function put(kind: string, x: number, y: number, o: PropOpts = {}) {
  const d = objectById(kind);
  const [w, h] = foot(kind, o.rot ?? 0);
  const flat = d?.layer === 'floor' || d?.layer === 'overhead';
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
    if (!b.floor(i, j)) { skipped.push(`${kind}@${x},${y} off floor at ${i},${j}`); return; }
    if (!flat && taken.has(`${i},${j}`)) { skipped.push(`${kind}@${x},${y} overlaps at ${i},${j}`); return; }
  }
  if (!flat) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) taken.add(`${i},${j}`);
  return b.prop(kind, x, y, o);
}
/** Trees: only on plain grass, not on paths, water or kept-clear squares; quietly skip where they don't fit. */
function tree(kind: string, x: number, y: number, v = 0) {
  const [w, h] = foot(kind);
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
    if (b.at(i, j) !== 1 || !['grass', 'mud'].includes(matAt(i, j)) || taken.has(`${i},${j}`) || keepClear.has(`${i},${j}`)) return false;
  }
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) taken.add(`${i},${j}`);
  b.prop(kind, x, y, v ? { v } : {});
  return true;
}
function woods(area: Rect, n: number, kinds: [string, number][]) {
  let placed = 0, guard = 0;
  while (placed < n && guard++ < 600) {
    const [k, v] = kinds[Math.floor(b.rnd() * kinds.length)];
    const x = area[0] + Math.floor(b.rnd() * area[2]), y = area[1] + Math.floor(b.rnd() * area[3]);
    if (tree(k, x, y, v)) placed++;
  }
}
/** A dirt (or other) trail through waypoints, one square wide, only over plain ground. */
function trail(pts: [number, number][], mat = 'dirt', w = 1) {
  for (let p = 0; p < pts.length - 1; p++) {
    let [x, y] = pts[p];
    const [x2, y2] = pts[p + 1];
    const stamp = () => { for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) { const X = x + i, Y = y + j; if (b.at(X, Y) === 1 && matAt(X, Y) !== 'sand') b.set(X, Y, { mat }); } };
    stamp();
    while (x !== x2 || y !== y2) {
      if (Math.abs(x2 - x) >= Math.abs(y2 - y)) x += Math.sign(x2 - x); else y += Math.sign(y2 - y);
      stamp();
    }
  }
}
/** Manual walls round a building's rect, leaving gaps (collapsed walls) and door edges open. */
function building(x: number, y: number, w: number, h: number, gaps: string[] = []) {
  const skip = new Set(gaps);
  const side = (i: number, j: number, s: Dir) => { const k = s === 'n' ? `h:${i},${j}` : s === 's' ? `h:${i},${j + 1}` : s === 'w' ? `v:${i},${j}` : `v:${i + 1},${j}`; if (!skip.has(k)) b.wall(i, j, s); };
  for (let i = x; i < x + w; i++) { side(i, y, 'n'); side(i, y + h - 1, 's'); }
  for (let j = y; j < y + h; j++) { side(x, j, 'w'); side(x + w - 1, j, 'e'); }
}
const edge = (x: number, y: number, s: Dir) => (s === 'n' ? `h:${x},${y}` : s === 's' ? `h:${x},${y + 1}` : s === 'w' ? `v:${x},${y}` : `v:${x + 1},${y}`);
/** A door in a manual wall: drop the wall on that edge and hang the door. */
function gate(x: number, y: number, s: Dir, state: Parameters<typeof b.door>[3], style?: string) {
  const k = edge(x, y, s);
  b.walls = b.walls.filter((w) => w !== k);
  b.door(x, y, s, state, style);
}

/** A natural cave made of a few lumpy blobs, kept inside a clip rect so it can't merge with its neighbours. */
function caveRoom(name: string, blobs: [number, number, number, number][], clip: Rect, o: { mat: string; readAloud?: string; gmNotes?: string; label?: [number, number] }) {
  const cells = new Set<string>();
  for (const [cx, cy, rx, ry] of blobs) {
    const ph = [b.rnd() * 6.28, b.rnd() * 6.28, b.rnd() * 6.28];
    for (let y = Math.floor(cy - ry * 1.4); y <= cy + ry * 1.4; y++)
      for (let x = Math.floor(cx - rx * 1.4); x <= cx + rx * 1.4; x++) {
        if (x < clip[0] || y < clip[1] || x >= clip[0] + clip[2] || y >= clip[1] + clip[3]) continue;
        const dx = (x - cx) / rx, dy = (y - cy) / ry, a = Math.atan2(dy, dx);
        const wob = 1 + 0.16 * Math.sin(a * 3 + ph[0]) + 0.1 * Math.sin(a * 5 + ph[1]) + 0.06 * Math.sin(a * 7 + ph[2]);
        if (dx * dx + dy * dy <= wob * wob) cells.add(`${x},${y}`);
      }
  }
  const rows = new Map<number, number[]>();
  for (const k of cells) { const [x, y] = k.split(',').map(Number); (rows.get(y) ?? rows.set(y, []).get(y)!).push(x); }
  const rects: Rect[] = [];
  for (const [y, xs] of [...rows].sort((a, c) => a[0] - c[0])) {
    xs.sort((a, c) => a - c);
    let st = xs[0], p = xs[0];
    for (const x of xs.slice(1).concat([Infinity])) { if (x === p + 1) { p = x; continue; } rects.push([st, y, p - st + 1, 1]); st = x; p = x; }
  }
  b.rooms2(name, rects, { ...o, label: o.label ?? [blobs[0][0], blobs[0][1]] });
}
/** Paint an organic patch (mud, bog) over carved floor. */
function patch(cx: number, cy: number, rx: number, ry: number, o: { mat: string; tile: number }) {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
    const dx = (x - cx) / rx, dy = (y - cy) / ry;
    if (dx * dx + dy * dy <= 1 + (b.rnd() - 0.5) * 0.5 && b.floor(x, y)) b.set(x, y, o);
  }
}

// ---------- ground ----------
b.rect(1, 1, 66, 46, { mat: 'grass' });

// The cliff ridge along the north: the hideout and the bear cave are dug into it.
b.fill(22, 1, 45, 9);
b.fill(22, 10, 32, 1);
b.fill(26, 11, 13, 1); b.fill(28, 12, 4, 1); b.fill(34, 12, 3, 1); b.fill(49, 11, 5, 2); b.fill(55, 10, 3, 1); b.fill(62, 10, 5, 1); b.fill(64, 11, 3, 1);
// The barrow mound in the south.
b.fill(27, 42, 7, 5);
b.fill(26, 44, 1, 3); b.fill(34, 44, 1, 3);

// ---------- the river ----------
const bends: [number, number][] = [[15, 44], [20, 43], [24, 42], [28, 43], [33, 45], [38, 46], [46, 47]];
const riverC = (y: number) => {
  for (let i = 0; i < bends.length - 1; i++) {
    const [ya, xa] = bends[i], [yb, xb] = bends[i + 1];
    if (y >= ya && y <= yb) return Math.round(xa + ((xb - xa) * (y - ya)) / (yb - ya));
  }
  return 47;
};
for (let y = 15; y <= 46; y++) {
  const c = riverC(y);
  const ford = y >= 32 && y <= 37;
  if (ford) {
    b.rect(c - 3, y, 7, 1, { mat: 'water-shallow', tile: 2 });
    b.rect(c - 4, y, 1, 1, { mat: 'sand' }); b.rect(c + 4, y, 1, 1, { mat: 'sand' });
  } else {
    b.rect(c - 1, y, 3, 1, { mat: 'water-deep', tile: 2 });
    b.rect(c - 2, y, 1, 1, { mat: 'water-shallow', tile: 2 }); b.rect(c + 2, y, 1, 1, { mat: 'water-shallow', tile: 2 });
    if (y % 3 !== 0) b.rect(c - 3, y, 1, 1, { mat: 'sand' });
    if (y % 4 !== 1) b.rect(c + 3, y, 1, 1, { mat: 'sand' });
  }
}

// ---------- rooms and areas ----------
b.room('The road', 1, 17, 13, 11, {
  readAloud: 'A rutted cart road runs east under a green roof of oak and pine. Somewhere ahead a crow will not stop shouting.',
  gmNotes: 'Start here. Tracks (DC 12 Survival): a heavy wagon passed east this morning, and several people on foot moved through the trees beside it. A trail north leads to the hunter\'s lodge; one south to the marsh.',
  label: [6, 20],
});
b.room('The narrows', 14, 16, 14, 12, {
  readAloud: 'The road pinches between crowding oaks and pines. A wagon lies on its side across the ruts, one wheel still turning, its oxen gone.',
  gmNotes: 'The old ambush. Four bandits in the brush either side and a scout up a pine (half cover, +2 on its first volley; DC 14 Perception to spot before they strike). The net trap drops on whoever checks the wagon. Wagon: a strongbox already pried open, 2 bolts of good wool (25 gp each), a dead driver with a note naming "the camp past the ford". Trail north climbs to the west cleft.',
  label: [21, 20],
});
b.rooms2('Ruined watch hut', [[28, 27, 6, 5]], {
  mat: 'stone-flagstone-warm',
  readAloud: 'Half a stone hut squats by the road, its east wall tumbled into the ferns. Fresh ash in the hearth ring says someone sat watch here last night.',
  gmNotes: 'The bandits\' road lookout: two bandits and a thug. The east and south walls are down, so anyone can walk in. Trapdoor cache under the hearth stones (DC 15 Investigation): 60 gp, a potion of healing and a crude map marking the camp and "the door behind the water". A trail runs south-east to the ford and south to the standing stones.',
  label: [30, 29],
});
b.rooms2('Hunter\'s lodge', [[6, 5, 5, 6], [11, 8, 3, 3]], {
  mat: 'wood-planks',
  readAloud: 'A low log lodge smelling of smoke and hides. Pelts hang from the rafters and the table is set for one, the stew long cold.',
  gmNotes: 'The hunter, Oswin Thale, was taken to the bandit camp. Rack of hunting spears, 2 shortbows, 40 arrows, rations for a week. A journal by the bed mentions "lights under the waterfall at night". The storeroom door is locked (DC 15 thieves\' tools); Oswin carries the key.',
  label: [8, 7],
});
b.room('Lodge storeroom', 11, 5, 3, 3, {
  mat: 'wood-planks-dark',
  readAloud: 'Shelves of dried meat, salt, traps waiting for oil, and a long case wrapped in oilcloth.',
  gmNotes: 'Locked. The long case holds a +1 longbow Oswin will gift to whoever frees him. Also: 3 hunting traps, 50 ft of rope, a healer\'s kit.',
});
b.room('Wolf hollow', 15, 2, 6, 8, {
  readAloud: 'Gnawed bones litter a hollow under the roots of an old oak. The ground is trodden flat and smells sharp.',
  gmNotes: 'Three wolves den here and come out to hunt anything that passes on the trail between the lodge and the cleft. A dead traveller under the roots still has a pouch with 18 gp and a silver locket (10 gp).',
  label: [17, 5],
});
b.rooms2('West cleft', [[23, 6, 2, 5], [24, 5, 1, 1]], {
  mat: 'dirt',
  readAloud: 'A narrow crack runs into the cliff, worn smooth by boots. At its end an iron-banded door is set right into the rock.',
  gmNotes: 'Back door to the hideout. The iron door is locked (DC 18 thieves\' tools, or the key on the lieutenant Brask in the camp\'s command tent). Spiked pit at the cleft mouth: DC 13 Perception to spot, DC 13 Dex save or fall 10 ft onto stakes (2d10 piercing).',
  label: [23, 8],
});
caveRoom('Smugglers\' cave', [[30, 4, 3.6, 2.4], [31, 8, 3.2, 2.2], [27, 6, 1.6, 2]], [27, 1, 9, 10], {
  mat: 'cave-floor',
  readAloud: 'Bedrolls, crates and stolen goods crowd a low cave lit by a smoky lantern. Dogs lift their heads and begin to growl.',
  gmNotes: 'Two thugs, three bandits and two mastiffs. If the camp raised the alarm they are awake and ready (no surprise). Crates: bolts of cloth, wine (6 bottles, 10 gp each), a lockbox with 120 sp. A tunnel east leads to the captain\'s den.',
});
b.round('Captain\'s den', 40, 4, 3, {
  mat: 'wood-planks-dark',
  readAloud: 'Someone has floored this cave with planks and hung it with stolen tapestries. A tall figure in a fine coat rises from a chair by the brazier, two scarred fighters beside them.',
  gmNotes: 'Boss fight: the bandit captain and two veteran lieutenants, plus a thug at the door. The captain fights from behind the brazier and parleys at half hit points, offering a share of the hoard. Tipping the brazier makes a 10-ft square of burning ground (2d6 fire on entering or starting a turn there). The secret door to the hoard is behind the tapestry on the east side (DC 16 Perception, or the captain\'s ring opens it).',
});
b.room('The hoard', 48, 2, 5, 4, {
  mat: 'cave-floor',
  readAloud: 'A dry chamber behind the stone, stacked with chests, coin sacks and a rack of fine weapons.',
  gmNotes: 'The captain\'s hoard: 640 gp, 1,200 sp, three gems (50 gp each), a +1 shortsword, a cloak of elvenkind, 2 potions of healing. The iron chest is trapped with a poison needle (DC 15 to find and disarm; DC 13 Con save or 2d10 poison and poisoned for 1 hour). Tripwire in the hall: crossbow bolt +6 to hit, 1d10 piercing.',
});
b.rooms2('Falls pool', [[43, 9, 5, 1], [41, 10, 8, 5]], {
  readAloud: 'The river leaps off the cliff in a white curtain and boils into a cold green pool. Spray hangs in the air like smoke.',
  gmNotes: 'Behind the curtain is a narrow wet ledge. A secret door in the rock there (DC 15 Perception from the ledge; boot scuffs and a rope ring give it away) opens on the hideout\'s back passage. Reaching the ledge: swim 10 ft of deep water (DC 12 Athletics) or edge along the rocks (DC 12 Acrobatics, fail: fall in).',
  label: [44, 12],
});
b.room('White-water bend', 38, 15, 11, 6, {
  readAloud: 'Below the falls the river runs fast and loud over a bed of broken stones.',
  gmNotes: 'Rapids: a creature that enters the deep water here must make a DC 15 Strength (Athletics) check or be swept 20 ft downstream and take 1d6 bludgeoning. A dangerous shortcut to the east bank. The west-bank trail leads up to the falls pool.',
});
b.room('Broken bridge', 36, 21, 13, 5, {
  readAloud: 'The road ends at a timber bridge with its middle span torn away. Planks dangle into the dark water, and the far bank is very quiet.',
  gmNotes: 'The bandits cut the bridge to force travellers to the ford. Two scouts watch from the far bank. Crossing on the stringers that remain: DC 13 Acrobatics, fail drops into deep water (swept as the rapids, DC 13). Jumping the 10-ft gap needs a running start. The ford lies 50 ft south.',
});
b.room('The ford', 39, 32, 11, 7, {
  readAloud: 'Here the river spreads wide and shallow over pale gravel. On the far bank a palisade of sharpened logs blocks the trees.',
  gmNotes: 'Waist-deep, difficult terrain. Anyone crossing in daylight is seen from the watchtower; the camp is ready in 2 rounds. Caltrops sown in the shallows near the east bank (DC 15 Perception to notice; 1 piercing and speed -10 ft until healed).',
});
b.rooms2('Bandit camp', [[50, 32, 15, 11], [53, 29, 12, 3]], {
  readAloud: 'Tents ring a trampled clearing inside the palisade. Smoke drifts from cook fires, loot is heaped by a big striped tent, and someone is shut in a cage.',
  gmNotes: 'Five bandits, two thugs and a scout. The lieutenant Brask sleeps in the command tent; he carries the key to the west cleft door and a purse of 35 gp. Cage: the hunter Oswin Thale (commoner), who knows the waterfall path and carries the lodge storeroom key in his boot. Loot pile: 90 gp in mixed coin, a crate of tools, a barrel of brandy. Main gate west (closed, barred from inside); the north rear gate is a portcullis worked by the lever in the watchtower.',
  label: [57, 37],
});
b.room('Watchtower', 50, 29, 3, 3, {
  mat: 'wood-planks',
  readAloud: 'A timber tower in the palisade corner with a ladder up to a railed platform and a signal horn.',
  gmNotes: 'A scout and a bandit keep watch over the ford and road. The lever here raises the rear portcullis. If the horn is blown, the camp and the smugglers\' cave are alerted.',
});
caveRoom('Bear cave', [[60, 4, 3.6, 2.4], [62, 6, 3, 2], [57, 6, 1.6, 1.6]], [55, 1, 11, 8], {
  mat: 'cave-floor',
  readAloud: 'A rank smell spills from a dark cave mouth in the cliff. Claw marks score the stone at shoulder height.',
  gmNotes: 'A brown bear sleeps here (DC 13 Stealth to pass the mouth unnoticed). Under the bones at the back: a dead adventurer\'s pack with a potion of healing, a scroll of cure wounds and 22 gp.',
});
b.room('Toll barricade', 55, 20, 12, 7, {
  readAloud: 'Logs and a stripped cart block the eastern road. A painted board reads TOLL in crooked letters.',
  gmNotes: 'Three bandits and a thug "collect tolls" from anyone heading west. Caltrops across the road behind the barricade. They flee to the camp\'s rear gate if two of them fall. A trail north leads to the bear cave.',
});
b.room('Blackwater marsh', 2, 31, 19, 15, {
  readAloud: 'The ground goes soft and black. Reeds rattle, dead trees lean over still pools, and every step sucks at your boots.',
  gmNotes: 'Mud is difficult terrain. Giant frogs hunt the pools and a crocodile lies in the deep bog in the south-west. Quicksand: DC 13 Strength to pull free, sinking 1 ft per round. A drowned peddler\'s cart in the bog holds 30 gp and a jar of fine pipeweed (5 gp).',
  label: [9, 37],
});
b.room('Standing stones', 23, 33, 13, 8, {
  readAloud: 'In a mossy glade a ring of old grey stones leans together. A small wooden shrine stands at the edge, hung with fresh ribbons.',
  gmNotes: 'Hedge-folk come here to leave offerings. The bushes around the ring are four awakened shrubs that only fight anyone who damages a stone or robs the shrine. A short rest here grants 1d4 extra hit points per Hit Die spent. The barrow to the south has a secret door (DC 14 Investigation; a ribbon-tied stone presses in).',
  label: [29, 34],
});
b.room('Barrow hollow', 29, 43, 3, 3, {
  mat: 'dungeon-slab',
  readAloud: 'A cramped stone chamber under the mound. Candles long dead ring a stone bier.',
  gmNotes: 'Secret. An old warrior\'s grave: a +1 shield, a silver circlet (75 gp) and 12 old gold coins. Taking the shield angers the shrubs above (see Standing stones).',
});
// the dromos into the barrow and the hideout halls
b.set(30, 42, { mat: 'dirt' });
b.hall(24, 4, 26, 4, { mat: 'cave-floor' });
b.hall(34, 4, 36, 4, { mat: 'cave-floor' });
b.hall(45, 5, 45, 8, { mat: 'cave-floor' });
b.hall(44, 5, 45, 5, { mat: 'cave-floor' });
b.hall(44, 3, 47, 3, { mat: 'cave-floor' });
b.rect(58, 8, 2, 2, { mat: 'dirt' }); // bear cave mouth
// pool water and ledge
b.paint(41, 10, 8, 5, { mat: 'water-deep', tile: 2 });
b.paint(41, 14, 8, 1, { mat: 'water-shallow', tile: 2 });
b.paint(41, 10, 1, 4, { mat: 'water-shallow', tile: 2 });
b.paint(48, 10, 1, 4, { mat: 'water-shallow', tile: 2 });
b.paint(43, 9, 5, 1, { mat: 'stone-cobble', tile: 1 });

// ---------- roads and trails ----------
trail([[1, 21], [12, 21], [16, 22], [26, 22], [30, 23], [38, 23]], 'dirt', 3);
trail([[48, 23], [55, 23], [66, 24]], 'dirt', 3);
trail([[9, 11], [9, 15], [8, 21]]); // lodge to the road
trail([[13, 8], [15, 7]]); // lodge to the hollow
trail([[20, 7], [22, 12], [24, 12], [24, 11]]); // hollow to the cleft
trail([[22, 21], [21, 16], [24, 12]]); // narrows up to the cleft
trail([[16, 25], [14, 30], [12, 32]]); // narrows down to the marsh
trail([[30, 25], [30, 26]]); // road to the hut
trail([[33, 31], [36, 33], [39, 34]]); // hut to the ford
trail([[30, 32], [30, 34]]); // hut to the stones
trail([[38, 21], [39, 17], [40, 15]]); // west bank to the falls
trail([[57, 26], [57, 28]]); // road to the rear gate
trail([[58, 20], [58, 14], [59, 11]]); // road to the bear cave
// the bridge abutments: plank decking either side of the gap
b.paint(39, 23, 2, 3, { mat: 'wood-planks', tile: 1 });
b.paint(45, 23, 2, 3, { mat: 'wood-planks', tile: 1 });

// marsh: mud, bog pools
for (const [x, y, rx, ry] of [[6, 35, 4, 2.5], [12, 37, 4, 3], [6, 42, 4, 3.5], [17, 42, 3.5, 3], [13, 32, 2.5, 1.5], [3, 39, 2, 2]]) patch(x, y, rx, ry, { mat: 'mud', tile: 1 });
for (const [x, y, rx, ry] of [[6, 35, 1.8, 1.2], [12, 38, 1.8, 1.2], [17, 43, 1.8, 1.2]]) patch(x, y, rx, ry, { mat: 'water-shallow', tile: 2 });
patch(6, 43, 2.6, 2, { mat: 'water-deep', tile: 2 }); // the deep bog

// ---------- buildings: lodge, watch hut, palisade, tower ----------
building(6, 5, 8, 6);
b.wall(11, 5, 'w'); b.wall(11, 7, 'w');
for (const i of [11, 12, 13]) b.wall(i, 7, 's');
b.door(11, 6, 'w', 'locked', 'door-wood');
gate(9, 10, 's', 'closed', 'door-wood');
// watch hut: the east and south walls are tumbled down
building(28, 27, 6, 5, [edge(33, 29, 'e'), edge(33, 30, 'e'), edge(33, 31, 'e'), edge(31, 31, 's'), edge(32, 31, 's'), edge(33, 31, 's')]);
gate(30, 27, 'n', 'open', 'door-wood');
for (const k of [edge(33, 28, 'e'), edge(28, 31, 's')]) b.wallKinds[k] = 'low';
// palisade round the camp
building(50, 29, 15, 14);
gate(50, 35, 'w', 'closed', 'door-double');
gate(57, 29, 'n', 'locked', 'portcullis');
for (let j = 29; j <= 31; j++) b.wall(52, j, 'e');
for (let i = 50; i <= 52; i++) b.wall(i, 31, 's');
gate(51, 31, 's', 'closed', 'door-wood');
// hideout doors
b.door(24, 5, 'n', 'locked', 'door-iron');
b.door(26, 4, 'e', 'closed', 'door-wood');
b.door(36, 4, 'e', 'closed', 'door-wood');
b.door(45, 9, 'n', 'secret');
b.door(44, 5, 'w', 'closed', 'door-wood');
b.door(44, 3, 'w', 'secret');
b.door(47, 3, 'e', 'closed', 'door-iron');
b.door(30, 43, 'n', 'secret');

// keep doorways, gates and trail mouths clear of trees
clear(8, 10, 3, 3); clear(29, 25, 3, 2); clear(48, 34, 2, 3); clear(56, 26, 3, 3); clear(22, 10, 4, 3); clear(29, 41, 3, 2);
clear(57, 9, 4, 3); clear(14, 6, 2, 3);

// ---------- things ----------
// The road and the narrows
put('signpost', 3, 19, { v: 1 });
put('milestone', 12, 24);
put('wagon', 18, 22, { rot: 90 }); // overturned across the road
put('crate', 17, 24); put('barrel', 21, 21); put('sack', 22, 24, { v: 3 }); put('blood-pool', 20, 24);
put('strongbox', 16, 21, { v: 2 });
put('skeleton-lying', 23, 20);
put('trap-net', 17, 21, { gm: true });
put('thorn-bush', 15, 18); put('bush', 16, 18); put('bush', 19, 19); put('thorn-bush', 22, 19); put('bush', 25, 19);
put('bush', 15, 26); put('thorn-bush', 18, 26); put('bush', 21, 26); put('bush', 24, 26); put('brambles', 26, 25);
put('boulder-large', 25, 16, { v: 3 }); put('log-fallen', 14, 19, { v: 1 });
put('trap-pit-hidden', 21, 15, { gm: true, v: 3 }); // on the cleft trail
put('trap-bear', 9, 13, { gm: true }); // snare on the lodge trail
put('trap-bear', 15, 28, { gm: true });

// Hunter's lodge
put('fireplace', 6, 5); put('table-long', 8, 7); put('stool', 8, 8); put('bed', 6, 8);
put('rug-pelt', 9, 8); put('spear-rack', 10, 5); put('chandelier-antler', 7, 6);
put('wall-shelves', 6, 10); put('herbs-drying', 12, 8);
put('wall-shelves', 11, 5); put('trunk', 12, 7 - 1); put('chest', 13, 5);
put('firewood', 5, 12); put('stump', 12, 12, { v: 2 }); put('log-pile', 14, 11); put('water-barrel', 5, 9);
put('lantern-hook', 10, 11); put('fence-wood', 3, 6, { rot: 90 }); put('beehive', 4, 4);

// Wolf hollow
put('bone-heap', 17, 4, { v: 1 }); put('skeleton-lying', 16, 6); put('bones', 19, 6); put('backpack', 16, 8);
put('log-fallen', 20, 3, { v: 1 }); put('ferns', 15, 3); put('ferns', 19, 8);
put('trap-swinging-log', 20, 9, { gm: true });

// West cleft and smugglers' cave
put('trap-spike-pit', 23, 10, { gm: true, v: 2 });
put('boulder', 22, 11); put('ferns', 25, 11);
put('lantern-standing', 31, 5); put('bedroll', 28, 6); put('bedroll', 29, 2); put('bedroll', 33, 6);
put('crate-stack', 31, 9); put('barrel-group', 29, 7); put('loot-sacks', 32, 7); put('table-cards', 30, 4);
put('weapon-barrel', 33, 5); put('supplies', 28, 5);

// Captain's den
put('brazier', 40, 4); put('throne', 40, 2, { v: 3 }); put('rug-pelt', 38, 4, { v: 3 });
put('table-maps', 38, 6); put('banner-hanging-tall', 42, 3); put('armor-stand', 37, 3);
put('chest', 42, 5); put('gear-pile', 41, 6);
put('torch-standing', 45, 6);

// The hoard
put('dragon-hoard', 49, 3, { v: 3 }); put('chest-open', 48, 2); put('strongbox', 52, 2);
put('trap-needle-lock', 52, 3, { gm: true }); put('weapon-rack', 50, 2); put('coins-small', 48, 5);
put('magic-cloak', 52, 5, { v: 1 }); put('potion-healing', 48, 4);
put('trap-tripwire', 45, 3, { gm: true, v: 2 });

// Falls pool and the river
put('rapids', 43, 10); put('glowing-fungus', 47, 9, { v: 0 });
put('rope-coil', 43, 9);
put('rapids', 44, 15, { rot: 90 }); put('rapids', 43, 18, { rot: 90 });
put('boulder', 47, 16); put('boulder', 40, 19, { v: 3 }); put('reeds', 39, 16);
put('fishing-gear', 40, 13 + 1);
// broken bridge
put('bridge-plank', 41, 23, { rot: 90, v: 2 }); put('debris-wood', 44, 24); put('mooring-post', 39, 22); put('mooring-post', 46, 22);
put('wall-stone-low', 39, 26, { v: 3 }); put('rope-coil', 40, 25);
// down river
put('reeds', 40, 29); put('lily-pads', 41, 27); put('reeds', 47, 30); put('boulder', 46, 41, { v: 3 }); put('reeds', 44, 43);
put('canoe', 38, 36); put('caltrops', 47, 34, { gm: true }); put('caltrops', 47, 36, { gm: true });
put('trap-bear', 37, 33, { gm: true });

// Ruined watch hut
put('campfire-cold', 30, 29, { v: 1 }); put('trapdoor', 29, 28); put('gm-treasure', 29, 28, { gm: true });
put('bedroll', 32, 28); put('rubble-pile', 33, 30); put('rubble-pile', 32, 31); put('ceiling-rubble', 34, 29);
put('sack', 28, 30); put('barrel', 28, 31); put('ferns', 33, 31 + 1);

// Standing stones and the barrow
put('stone-circle', 28, 35, { v: 1 });
put('standing-stone', 25, 34, { v: 2 }); put('standing-stone', 34, 38, { v: 2 }); put('rune-stone', 33, 34, { v: 3 });
put('road-shrine', 24, 38, { v: 1 }); put('offering-bowl', 25, 38, { v: 1 }); put('flowers', 26, 37, { v: 2 });
put('bush', 27, 39, { v: 2 }); put('bush', 33, 36, { v: 2 }); put('bush', 24, 36, { v: 2 }); put('bush', 30, 33, { v: 2 });
put('candle-ring', 29, 43, { v: 3 }); put('open-grave', 31, 43, { v: 2 }); put('enchanted-shield', 29, 45, { v: 2 }); put('coffer', 31, 45);
put('cairn', 28, 41); put('cairn', 32, 41);

// Blackwater marsh
put('quicksand', 13, 34, { v: 1 }); put('mud-patch', 9, 37, { v: 1 }); put('mud-patch', 4, 39, { v: 1 }); put('tree-swamp', 2, 37); put('tree-dead', 17, 36, { v: 1 });
put('tree-dead', 9, 42, { v: 1 }); put('reeds', 8, 33); put('reeds', 14, 38);
put('lily-pads', 6, 34); put('lily-pads', 12, 39); put('lily-pads', 17, 43); put('bones-mud', 10, 35); put('skull-bleached', 3, 45);
put('cart', 8, 43, { v: 3 }); put('grass-tall', 12, 41, { v: 2 }); put('grass-tall', 18, 33, { v: 2 }); put('glowing-fungus', 14, 44, { v: 2 });
put('trap-pit-hidden', 13, 31, { gm: true, v: 3 });

// Bandit camp
put('ladder', 51, 29, { v: 1 }); put('cresset', 50, 29); put('lever', 52, 29, { v: 3 }); put('barrel', 50, 31);
put('tent-command', 60, 30, { v: 0 }); put('tent', 54, 33, { v: 1 }); put('tent', 54, 39); put('tent-round', 61, 39, { v: 3 }); put('tent', 62, 35, { v: 1 });
put('campfire', 57, 35); put('campfire-spit', 58, 40); put('bench-long', 56, 34); put('stool', 56, 36); put('stool', 59, 36);
put('cage', 51, 40, { v: 3 }); put('chains-hanging', 52, 41);
put('loot-sacks', 58, 30); put('treasure-pile', 57, 31, { v: 1 }); put('crate-stack', 54, 30); put('barrel-group', 64, 33);
put('weapon-rack', 51, 33); put('table-maps', 61, 33); put('firewood', 63, 41); put('water-barrel', 64, 37);
put('torch-standing', 51, 36); put('torch-standing', 51, 34); put('war-banner', 59, 29);
put('cheval-de-frise', 48, 33, { rot: 90 }); put('cheval-de-frise', 48, 37, { rot: 90 });
put('trap-tripwire', 52, 27, { gm: true, v: 1 }); put('caltrops', 49, 32, { gm: true });
put('archery-target', 63, 38); put('privy', 64, 42);

// Bear cave
put('bone-heap', 61, 4); put('backpack', 63, 5); put('bones', 58, 6); put('mushrooms', 57, 3);
put('potion-healing', 63, 6); put('spell-scroll', 62, 3, { v: 2 });

// Toll barricade
put('barricade-wood', 57, 23, { rot: 90 }); put('barricade-wood', 57, 25, { rot: 90 }); put('cart', 60, 22, { v: 0 });
put('notice-board', 54, 21); put('caltrops', 60, 24, { gm: true }); put('caltrops', 61, 25, { gm: true });
put('campfire', 63, 21); put('bedroll', 64, 20); put('torch-standing', 56, 22);
put('trap-bear', 58, 16, { gm: true });

// rocks and logs that shape the open woods
put('boulder-large', 33, 13, { v: 3 }); put('boulder', 36, 15); put('log-fallen', 30, 16, { v: 1 }); put('brambles', 34, 18);
put('boulder-large', 50, 14, { v: 3 }); put('brambles', 53, 16); put('log-fallen', 62, 13, { v: 3 });
put('boulder', 2, 12, { v: 3 }); put('hedge-long', 3, 14); put('mushrooms', 19, 12, { v: 3 });
put('boulder-large', 36, 28); put('log-fallen', 25, 30, { v: 1 }); put('brambles', 20, 30);
put('boulder', 53, 44); put('log-fallen', 60, 44, { rot: 90, v: 1 });

// trees last, round everything else
woods([1, 1, 21, 4], 3, [['tree-pine', 0], ['tree-oak', 0], ['tree-pine', 3]]);
woods([1, 1, 5, 16], 3, [['tree-pine', 0], ['tree-oak', 0]]);
woods([14, 10, 8, 6], 2, [['tree-pine', 0], ['tree-oak', 0]]);
woods([22, 11, 15, 10], 5, [['tree-pine', 0], ['tree-oak', 0], ['tree-birch', 0], ['tree-pine', 3]]);
woods([14, 16, 14, 4], 4, [['tree-oak', 0], ['tree-pine', 0]]);
woods([14, 25, 14, 6], 3, [['tree-oak', 0], ['tree-pine', 0]]);
woods([1, 24, 12, 7], 3, [['tree-oak', 0], ['tree-pine', 0], ['tree-birch', 0]]);
woods([1, 28, 21, 18], 4, [['tree-willow', 0], ['tree-dead', 0], ['tree-swamp', 1]]);
woods([20, 25, 18, 8], 3, [['tree-oak', 1], ['tree-pine', 0], ['tree-birch', 1]]);
woods([20, 33, 18, 13], 3, [['tree-birch', 0], ['tree-oak', 0], ['tree-pine', 0]]);
woods([47, 10, 19, 10], 5, [['tree-pine', 0], ['tree-oak', 0], ['tree-pine', 3]]);
woods([46, 26, 4, 20], 2, [['tree-pine', 0], ['tree-birch', 0]]);
woods([49, 43, 18, 4], 2, [['tree-pine', 0], ['tree-oak', 0]]);
woods([36, 38, 9, 9], 2, [['tree-willow', 0], ['tree-birch', 0]]);

// ---------- encounters ----------
b.encounter('Ambush at the narrows', [15, 17, 12, 10], [['bandit', 4], ['scout', 1]], 'medium');
b.encounter('Wolves of the hollow', [15, 2, 6, 8], [['wolf', 3]], 'easy');
b.encounter('Hut lookouts', [28, 27, 6, 5], [['bandit', 2], ['thug', 1]], 'medium');
b.encounter('Frogs in the reeds', [3, 32, 16, 8], [['giant-frog', 3]], 'easy');
b.encounter('The bog lurker', [3, 40, 7, 5], [['crocodile', 1]], 'easy');
b.encounter('Snipers across the gap', [36, 21, 13, 5], [['scout', 2]], 'easy');
b.encounter('Guardians of the ring', [23, 33, 13, 8], [['awakened-shrub', 4]], 'easy', 'manual');
b.encounter('The bear wakes', [56, 2, 9, 8], [['brown-bear', 1]], 'medium');
b.encounter('Toll collectors', [55, 20, 12, 7], [['bandit', 3], ['thug', 1]], 'medium');
b.encounter('Watchtower', [50, 29, 3, 3], [['scout', 1], ['bandit', 1]], 'easy');
b.encounter('Bandit camp', [53, 32, 12, 11], [['bandit', 5], ['thug', 2], ['scout', 1]], 'hard');
b.encounter('Smugglers\' cave', [26, 1, 10, 9], [['thug', 2], ['bandit', 3], ['mastiff', 2]], 'hard');
b.encounter('The captain and the lieutenants', [37, 1, 7, 7], [['bandit-captain', 1], ['veteran', 2], ['thug', 1]], 'deadly');

// ---------- notes ----------
b.note(17, 21, 'Net trap: DC 14 Perception to spot the cord. Drops a 10-ft net; restrained, DC 10 Str to escape or cut (AC 10, 5 hp).');
b.note(21, 15, 'Leaf-covered pit on the cleft trail: DC 13 Perception; 10 ft deep, 1d6 bludgeoning.');
b.note(9, 13, 'Hunting snare (the bandits reset Oswin\'s traps): DC 13 Perception; DC 13 Dex save or 1d4 piercing and stuck (DC 13 Str to free).');
b.note(20, 9, 'Swinging log: DC 14 Perception to see the trip line; DC 13 Dex save or 2d8 bludgeoning and knocked prone.');
b.note(52, 27, 'Alarm tripwire: bells ring in the camp. DC 12 Perception to spot.');
b.note(45, 9, 'Secret door behind the falls: DC 15 Perception from the ledge.');
b.note(44, 3, 'Secret door behind the tapestry: DC 16 Perception, or the captain\'s ring.');
b.note(30, 43, 'Secret door into the barrow: DC 14 Investigation, the ribbon-tied stone presses in.');
b.note(52, 29, 'Lever: raises the rear portcullis (north gate of the palisade).');
b.note(51, 40, 'Oswin Thale, the hunter, in the cage. Has the lodge storeroom key in his boot.');

b.start(2, 21, 2, 2);

if (skipped.length) console.warn('skipped things:\n - ' + skipped.join('\n - '));
b.save({
  description: 'A long stretch of forest road: the wagon ambush at the narrows, a cut bridge and a ford, the bandits\' palisade camp, a hunter\'s lodge, a marsh, standing stones with a hidden barrow, and the bandit captain\'s hideout in the cliffs behind the waterfall.',
  setting: 'wilderness',
  tags: ['wilderness', 'road', 'bandits', 'ambush', 'large'],
});

// The Troll Bridges of Kel Morrow: a one-session adventure for four heroes of level 6.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

// The seven crossings, west to east (map columns).
const LOG = 15, ROPE = 23, ARCH = 33, AQUA = 52, DRAW = 60, LIP = 66;

function kelMorrow() {
  const b = new MapBuilder('adv-troll-bridges', 'The gorge of Kel Morrow', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone', theme: 'stone' });

  // ---------- the shape of the gorge ----------
  // nRim: first row of the north cliff face; nBank: first row of the gorge floor;
  // sBank: last row of the gorge floor; sRim: first row of the south cliff top.
  const r = rng(6106);
  const nRim: number[] = [], nBank: number[] = [], sBank: number[] = [], sRim: number[] = [], wc: number[] = [], hw: number[] = [];
  const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  let a = 22, c = 31, d = 47, e = 56;
  for (let x = 0; x < 80; x++) {
    a = cl(a + Math.round((r() - 0.5) * 1.8), 20, 23);
    c = cl(c + Math.round((r() - 0.5) * 1.8), 30, 32);
    d = cl(d + Math.round((r() - 0.5) * 1.8), 46, 48);
    e = cl(e + Math.round((r() - 0.5) * 1.8), 55, 57);
    nRim.push(a); nBank.push(c); sBank.push(d); sRim.push(e);
    wc.push(39 + Math.round(1.6 * Math.sin(x / 7 + 0.6)));
    hw.push(r() < 0.45 ? 3 : 2);
  }
  // keep the rims steady where caves and hidden ways come close to the top
  for (let x = 37; x <= 50; x++) nRim[x] = Math.min(nRim[x], 21);
  for (let x = 54; x <= 59; x++) nRim[x] = Math.min(nRim[x], 21);
  for (let x = 68; x <= 75; x++) nRim[x] = 22;
  for (let x = 55; x <= 75; x++) sRim[x] = 56;
  for (let x = 24; x <= 43; x++) sRim[x] = Math.max(sRim[x], 56);

  for (let x = 0; x < 80; x++) {
    if (x >= 10) {
      b.rock(x, nRim[x], 1, nBank[x] - nRim[x]);
      b.rock(x, sBank[x] + 1, 1, sRim[x] - sBank[x] - 1);
    } else {
      // at the west end the gorge opens out into the ford: muddy slopes instead of cliffs
      b.paint(x, nRim[x], 1, nBank[x] - nRim[x], 'dirt');
      b.paint(x, sBank[x] + 1, 1, sRim[x] - sBank[x] - 1, 'dirt');
    }
    b.paint(x, nBank[x], 1, sBank[x] - nBank[x] + 1, 'dirt');
    b.water(x, wc[x] - hw[x], 1, hw[x] * 2 + 1, false);
    if (x >= 10) b.water(x, wc[x] - hw[x] + 1, 1, hw[x] * 2 - 1, true);
  }
  b.mud(0, 30, 10, 3).mud(0, 46, 10, 3).mud(20, 33, 6, 1).mud(44, 45, 5, 2);

  // ---------- below the falls: the Kettle ----------
  for (let x = LIP; x < 80; x++) {
    const top = nBank[x], bot = sBank[x];
    if (x === LIP) { b.rock(x, top, 1, bot - top + 1); continue; }
    if (x === LIP + 1) { b.rock(x, top, 1, 1).rock(x, bot, 1, 1).floor(x, top + 1, 1, bot - top - 1, 'cave-floor'); continue; }
    if (x === LIP + 2) { b.rock(x, top, 1, 1).rock(x, bot, 1, 1).water(x, top + 1, 1, bot - top - 1, true); continue; }
    b.water(x, top + 1, 1, bot - top - 1, false).water(x, top + 3, 1, bot - top - 7, true);
    b.paint(x, top, 1, 1, 'dirt');
    if (x >= 70 && x <= 78) b.floor(x, bot - 2, 1, 3, 'sand');
  }

  // ---------- roads ----------
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
  road([[39, 0], [40, 5], [38, 11], [35, 16], [ARCH, nRim[ARCH] - 2]], 3);
  road([[40, 11], [45, 12]], 2);
  road([[ARCH, 17], [27, 16], [ROPE, 18], [ROPE, nRim[ROPE] - 1]], 2);
  road([[ROPE, 17], [18, 15], [LOG, 17], [LOG, nRim[LOG] - 1]], 2);
  road([[LOG, 16], [9, 15], [5, 19], [4, nRim[4]]], 2);
  road([[37, 17], [44, 18], [AQUA, 18], [AQUA, nRim[AQUA] - 1]], 2);
  road([[AQUA, 18], [DRAW, 17], [DRAW, nRim[DRAW] - 1]], 2);
  road([[ARCH, sRim[ARCH]], [35, 62], [37, 70], [38, 77]], 3);
  road([[ARCH, 59], [27, 60], [ROPE, sRim[ROPE]], [ROPE, 60], [LOG, 59], [LOG, sRim[LOG]], [LOG, 60], [8, 59], [4, sRim[4] - 1]], 2);
  road([[36, 59], [46, 60], [DRAW, 63], [DRAW, 70], [57, 77]], 2);

  // ---------- the seven crossings ----------
  const deck = (x0: number, w: number, mat: string, overFloor: boolean) => {
    for (let x = x0; x < x0 + w; x++) {
      b.floor(x, nRim[x], 1, nBank[x] - nRim[x], mat);
      b.floor(x, sBank[x] + 1, 1, sRim[x] - sBank[x] - 1, mat);
      if (overFloor) b.floor(x, nBank[x], 1, sBank[x] - nBank[x] + 1, mat);
    }
  };

  // 1. The Wading Stones (the ford)
  b.area('The Wading Stones', [[0, 30, 10, 19]], {
    read: 'At the west end the gorge gives up and lies down. The river spreads wide and loud over a bed of round stones, and a line of flat boulders crosses it like the back of a sleeping dragon. On the far bank, something very large is singing, badly.',
    gm: 'The ford: shallow, fast water (difficult ground). Off the stones, DC 12 Athletics or be swept 10 ft downstream and knocked prone. The Giant\'s Bathtub (the deep hole mid-river) is 12 ft deep. Gorsk the hill giant has made the ford his "bridge" so he can be near his sweetheart. He charges a toll of one compliment about Mother Gristlemoss.',
    label: [5, 39],
  });
  b.water(5, wc[5] - 1, 2, 2, true);
  b.props_('boulder', [[2, wc[2] - 3], [3, wc[3] - 1], [2, wc[2] + 1], [4, wc[4] + 2], [3, wc[3] + 3]]).props_('boulder-large', [[6, wc[6] - 2], [7, wc[7] + 2]]);
  b.props_('rapids', [[8, wc[8]], [1, wc[1] - 1]]).prop('reeds', 0, nBank[0] + 1).prop('reeds', 9, sBank[9] - 1).prop('stairs-down', 4, nRim[4] + 1).prop('stairs-up', 4, sBank[4] + 2).prop('fishing-net', 7, sBank[7]).prop('skull-bleached', 1, sBank[1]);

  // 2. Grub's Log (a fallen giant fir)
  deck(LOG, 1, 'wood-planks-dark', false);
  for (let y = nBank[LOG]; y <= sBank[LOG]; y += 3) b.prop('log-fallen', LOG, y, 90);
  b.prop('stump', LOG, nRim[LOG] - 1).prop('tree-dead', LOG - 1, nRim[LOG - 1] - 2).prop('bones', LOG, sRim[LOG]).prop('mushrooms', LOG, nRim[LOG] + 2);
  b.area("Grub's Log", [[LOG - 2, nRim[LOG] - 2, 5, sRim[LOG] - nRim[LOG] + 4]], {
    read: 'A fir tree as tall as a temple fell across the gorge long ago. Its bark is worn smooth by feet, and halfway along it someone has carved GRUB in letters a yard high.',
    gm: 'One square wide and slick with moss: DC 12 Acrobatics to cross at more than half speed, DC 14 if hit or shoved while on it (fail: fall 60 ft into the river, 6d6 bludgeoning, halved by the water to 3d6). Grub, the youngest troll, holds it. His toll is meat. Any meat. He is miserable, hungry and close to tears, because he was guarding the nest the night the egg went and he fell asleep.',
    label: [LOG, 27],
  });
  b.encounter("Grub's hungry log", [LOG - 1, nRim[LOG] - 2, 3, sRim[LOG] - nRim[LOG] + 4], [['troll', 1]], 'low');

  // 3. Snag's rope bridge
  deck(ROPE, 1, 'wood-planks', false);
  for (let y = nBank[ROPE]; y <= sBank[ROPE]; y += 4) b.prop('bridge-rope', ROPE, y, 0, { v: y > 40 ? 1 : 0 });
  b.props_('mooring-post', [[ROPE - 1, nRim[ROPE - 1] - 1], [ROPE + 1, nRim[ROPE + 1] - 1], [ROPE - 1, sRim[ROPE - 1]], [ROPE + 1, sRim[ROPE + 1]]]).prop('rope-coil', ROPE + 2, nRim[ROPE] - 2).prop('temple-bell', ROPE, nRim[ROPE] - 2);
  b.area("Snag's Rope Bridge", [[ROPE - 2, nRim[ROPE] - 2, 5, sRim[ROPE] - nRim[ROPE] + 4]], {
    read: 'A rope bridge sags across the gorge, three hundred feet of plank and knot. A brass bell hangs at the near end with a sign: RING AND SING. Below, the river is a white thread.',
    gm: 'The bridge sways: anyone who runs, fights or is shoved on it makes a DC 13 Dexterity save or falls prone; a creature that falls prone at the edge makes a second save or goes over (cling on with DC 15 Athletics). Cutting both hand-ropes (AC 11, 10 hp each) drops everyone on it. Snag, a skinny troll who loves music, takes a song as toll. He has been accused because a twist of his rope was found in the nest.',
    label: [ROPE, 27],
  });
  b.encounter("Snag's swaying bridge", [ROPE - 1, nRim[ROPE] - 2, 3, sRim[ROPE] - nRim[ROPE] + 4], [['troll', 1]], 'low');

  // 4. The King's Arch (the old road)
  deck(ARCH, 3, 'stone-cobble', true);
  b.props_('statue-gargoyle', [[ARCH, nRim[ARCH] - 1], [ARCH + 2, nRim[ARCH] - 1], [ARCH, sRim[ARCH]], [ARCH + 2, sRim[ARCH]]]);
  b.prop('throne', ARCH + 1, 38).prop('offering-bowl', ARCH + 1, 36).props_('lamp-post', [[ARCH, 28], [ARCH + 2, 50]]).prop('signpost', ARCH + 1, nRim[ARCH] - 2).prop('skull-pile', ARCH + 2, 41);
  b.light(ARCH, 28, 10, 15).light(ARCH + 2, 50, 10, 15);
  b.area("The King's Arch", [[ARCH - 1, nRim[ARCH] - 1, 5, sRim[ARCH] - nRim[ARCH] + 2]], {
    read: 'A bridge of grey stone leaps the gorge in one great arch, wide enough for two carts. Carved kings with worn-off faces line the parapets. In the middle, on a stone chair, sits a troll in a rusted crown, with a wooden sign around his neck: TOLL.',
    gm: 'The main road and the only bridge a wagon can use. Bolder, eldest son of the matriarch, holds it with three worgs. Toll: answer his riddle, ask him one he can\'t answer, or pay a cow. Since the theft he adds "and tell me which of my wretched siblings did it". He thinks Ungle did. The parapet is 3 ft high: a creature shoved over it falls 70 ft into the river (7d6, halved by the water).',
    label: [ARCH + 1, 30],
  });
  b.encounter("Bolder's toll", [ARCH, 32, 3, 14], [['troll', 1], ['worg', 3]], 'low');

  // 5. The Moss Aqueduct (a ruin, broken in the middle)
  deck(AQUA, 2, 'stone-flagstone', true);
  for (let x = AQUA; x < AQUA + 2; x++) b.pit(x, wc[x] - 1, 1, 3);
  b.props_('pillar-broken', [[AQUA, nRim[AQUA] - 1], [AQUA + 1, sRim[AQUA]]]).props_('ferns', [[AQUA, 28], [AQUA + 1, 50]]).prop('column-collapsed', AQUA + 1, 34).prop('mushrooms', AQUA, 45).prop('bridge-plank', AQUA, wc[AQUA] - 1, 0, { v: 2 }).prop('flowers', AQUA + 1, 27);
  b.area('The Moss Aqueduct', [[AQUA - 1, nRim[AQUA] - 1, 4, sRim[AQUA] - nRim[AQUA] + 2]], {
    read: 'An aqueduct of a forgotten kingdom strides across the gorge on tall legs, furred green with moss. Its water channel is dry and full of ferns. In the middle a whole span has fallen, and a single rotten plank bridges the gap.',
    gm: 'The gap is 15 ft over a 70 ft drop. The plank breaks under anything heavier than 200 lb (DC 13 Athletics to jump it instead). The twins Moss-Meg and Moss-Mab hold it and take a rhyme as toll: you say a line, they must finish it. Since the theft they have stopped finishing each other\'s rhymes, because Meg found one of Mab\'s braids in the nest.',
    label: [AQUA, 30],
  });
  b.encounter("The twins' quarrel", [AQUA, 24, 2, 30], [['troll', 2]], 'moderate');

  // 6. Ungle's drawbridge and tower
  deck(DRAW, 2, 'stone-flagstone', true);
  for (let x = DRAW; x < DRAW + 2; x++) b.floor(x, sRim[x] - 4, 1, 4, 'wood-planks');
  b.props_('chains-hanging', [[DRAW, sRim[DRAW] - 4], [DRAW + 1, sRim[DRAW] - 4]]).prop('temple-bell', DRAW + 1, nRim[DRAW + 1] - 2).prop('notice-board', DRAW - 1, nRim[DRAW - 1] - 2).prop('pillar-square', DRAW, 33);
  b.area("Ungle's Drawbridge", [[DRAW - 1, nRim[DRAW] - 2, 4, sRim[DRAW] - nRim[DRAW] + 2]], {
    read: 'A narrow stone causeway runs across the gorge to a squat tower on the far side. The last stretch is a drawbridge of black planks, chained up and raised like a closed mouth. A bell hangs on a post by a painted board of prices.',
    gm: 'Ring the bell and the drawbridge comes down (eventually). Ungle, the family\'s accountant, charges coin: 1 sp a foot, 1 gp a hoof, 5 gp a wheel, double after dark. With the bridge up, the gap is 20 ft (DC 15 Athletics to leap, or climb the chains, DC 14).',
    label: [DRAW, 36],
  });
  b.building("Ungle's Tower", 56, 56, 9, 7, {
    mat: 'stone-flagstone',
    read: 'Inside the tower everything is in order. Tolls are sorted into labelled pots. Two human guards in patched mail stand to attention, looking deeply embarrassed.',
    gm: 'Ungle\'s counting room. The guards, Pell and Hamm, lost a riddle to Ungle three years ago and are working off the debt (they have 4 years left). They fight only if Ungle does, and surrender at once if offered a way out of their contract (DC 13 Persuasion, or forging a "paid in full" in the ledger, DC 15 Deception or Forgery kit). The winch lowers the drawbridge (DC 12 Strength).',
    doors: [[DRAW, 56, 'n', 'closed', 'portcullis'], [DRAW + 1, 56, 'n', 'closed', 'portcullis'], [DRAW, 62, 's']],
    windows: [[56, 58, 'w'], [64, 57, 'e']],
  });
  b.wallRun(62, 59, 4, 'w').wallRun(62, 59, 3, 'n').door(62, 61, 'w', 'secret');
  b.area("Ungle's strongroom", [[62, 59, 3, 4]], { gm: 'Behind a secret door (DC 16 Perception, or Ungle\'s thumb-greasy page edge gives it away, DC 12 Investigation). The family\'s savings and the toll ledger.', label: [63, 60] });
  b.prop('winch', DRAW, 57).prop('desk', 58, 58).prop('chair', 58, 59).props_('pottery', [[57, 57], [57, 61], [59, 61]]).prop('scales', 59, 58).prop('stair-spiral', 57, 60).prop('weapon-rack', 61, 61).prop('strongbox', 63, 60).prop('coin-stacks', 64, 61).prop('book-pile', 63, 59).prop('lantern-hanging', 60, 59);
  b.light(60, 59, 10, 15);
  b.encounter("Ungle's counting room", [56, 56, 6, 7], [['troll', 1], ['veteran', 2]], 'moderate');

  // 7. The Curtain Path (the hidden way under the falls)
  b.building('Shrine of the Falls', 71, 19, 3, 3, {
    mat: 'stone-flagstone',
    read: 'A tiny roofless shrine of mossy stones, half eaten by brambles. A worn face carved over the door might be a river god, or a frog.',
    gm: 'A secret door in the back wall (DC 15 Perception; fresh mud on the threshold and a smear of grease from Marlo\'s lantern give it away) opens on a stair cut into the cliff: the Curtain Path. Under the altar: Marlo\'s smuggled goods (three bolts of silk and a cask of fine brandy, 150 gp in all).',
    doors: [[72, 19, 'n']],
  });
  b.door(72, 21, 's', 'secret');
  b.prop('road-shrine', 72, 20).prop('crate', 71, 21).prop('brambles', 70, 18).prop('thorn-bush', 74, 19).prop('mud-patch', 72, 18);
  b.tunnel([[72, 22], [72, 26], [69, 26], [69, 29], [LIP + 1, nBank[LIP + 1]]], 1, { mat: 'stone', seed: 6107 });
  b.area('The Curtain Path', [[67, 22, 6, 9]], {
    read: 'Steps cut into the living rock spiral down through the dark. The roar of water grows until you feel it in your teeth, and the walls run wet.',
    gm: 'Built by the people who made the aqueduct. Slippery: DC 10 Acrobatics or slide to the bottom (2d6). Fresh ogre prints in the mud, four sets, one dragging something heavy (DC 12 Survival). The trolls do not know this way exists.',
    label: [70, 26],
  });
  b.area('Behind the Curtain', [[LIP + 1, 32, 2, 15]], {
    read: 'You step out onto a ledge behind the waterfall. A wall of white water thunders down an arm\'s length away, and the light comes through it green. The ledge runs right across the gorge.',
    gm: 'The hidden crossing. Spray: heavily obscured beyond 10 ft, and loud enough that speech needs shouting. A creature shoved into the falling water is hurled into the Kettle (DC 15 Strength save). A cracked waterproof box wedged in the rock holds the smuggler\'s ledger Marlo lost, which names the path (DC 14 Investigation to find it).',
    label: [LIP + 1, 38],
  });
  b.props_('rapids', [[LIP + 2, 34], [LIP + 2, 38], [LIP + 2, 42]]).prop('lantern-hook', LIP + 1, 36, 0, { off: true }).prop('chest-open', LIP + 1, 44).prop('puddle', LIP + 1, 40).prop('gm-treasure', LIP + 1, 44, 0, { gm: true });
  b.tunnel([[LIP + 1, sBank[LIP + 1]], [LIP + 1, 51], [71, 53], [71, 55]], 1, { mat: 'stone', seed: 6108 });
  b.building('The fallen tollhouse', 70, 56, 3, 3, {
    mat: 'wood-planks-dark',
    read: 'A tumbledown hut with no roof and a toll-bar rotting across its doorway. Nobody has collected anything here for a hundred years.',
    gm: 'The south end of the Curtain Path: a secret trapdoor-door in the north wall (DC 15 Perception). A tuft of green, sticky hair snagged on the frame (Nettlewick\'s). Her camp is a stone\'s throw south.',
    doors: [[71, 58, 's']],
  });
  b.door(71, 56, 'n', 'secret');
  b.prop('debris-wood', 70, 57).prop('broken-furniture', 72, 57);
  b.area('The Kettle', [[69, 31, 11, 17]], {
    read: 'Below the falls the river boils in a round black pool walled by cliffs. Spray hangs in the air. On a shelf of pale sand at the far side lie the shapes of men far too big to be men.',
    gm: 'Deep and churning: DC 14 Athletics to swim, or be pulled under for a round (3d6 bludgeoning). The shapes are three drowned ogres, last spring\'s thieves. The hag poured her cauldron-dregs into the pool to raise them as guards for the path.',
    label: [74, 38],
  });
  b.props_('whirlpool', [[73, 38]]).props_('bones', [[72, sBank[72] - 1], [76, sBank[76] - 1]]).prop('rowboat', 77, sBank[77] - 2, 90, { v: 1 }).prop('deep-water', 76, 37).prop('skeleton-lying', 74, sBank[74] - 1);
  b.encounter('The drowned in the Kettle', [69, 40, 11, 8], [['ogreZombie', 3]], 'low');

  // ---------- the troll caves and the ledge path ----------
  b.cave("Mother's Hollow", 44, 26.5, 4, 2.6, {
    seed: 6111, mat: 'cave-floor',
    read: 'The cave stinks of wet dog, river weed and old meat. Bones are stacked in neat sorted piles. In the middle of it all a huge troll sits on a boulder with her head in her hands, and around her neck hangs a bridal veil made of fishing net.',
    gm: 'Mother Gristlemoss\'s den. She will hear the heroes out if they come in peace and bring a gift (meat, or a compliment, DC 12 Persuasion). Her deadline: the egg back by moonrise tomorrow, or she calls the Moot and her children settle it with teeth. She will pay well for the truth.',
  });
  b.cave('The Egg Nest', 40.5, 24.8, 1.6, 1.3, {
    seed: 6112, mat: 'cave-floor',
    read: 'A hollow ringed with river stones and lined with moss, still faintly warm. It is the shape of something round and as big as a barrel. It is empty.',
    gm: 'Clues (DC 13 Investigation each): a twist of Snag\'s rope, one of Mab\'s braids and a troll\'s tooth (Grub\'s), all laid neatly on top of the moss, too neatly (DC 14 Insight: planted). Under the moss: a crushed sprig of stinging nettle and a smear of green, sticky slime (DC 15 Arcana or Nature: a hag\'s). The egg weighs 300 lb; four big creatures carried it.',
  });
  b.tunnel([[38, nRim[38] - 1], [38, 24], [40, 24]], 1, { mat: 'stone', seed: 6113 });
  b.tunnel([[44, 28], [44, nBank[44]]], 2, { mat: 'cave-floor', seed: 6114 });
  b.tunnel([[47, 27], [49, 28], [49, nBank[49]]], 1, { mat: 'stone', seed: 6115 });
  b.area('The Ledge Path', [[37, 21, 3, 4], [47, 27, 3, 4]], {
    read: 'A path no wider than a man\'s shoulders is chipped into the cliff face, with nothing on the outside but air and, far below, the river.',
    gm: 'From the north rim down past Mother\'s Hollow to the river. Single file. A creature knocked prone here makes a DC 13 Dexterity save or falls (6d6). Troll hand-holds: trolls climb it at full speed.',
    label: [38, 22],
  });
  b.props_('bone-heap', [[42, 27], [46, 26]]).prop('boulder-large', 44, 26).prop('rug-pelt', 45, 27).prop('cauldron', 43, 28).prop('fishing-net', 47, 26).prop('treasure-pile', 41, 28).prop('wardrobe', 46, 25).prop('cave-crystals', 40, 24).prop('crumbling-ledge', 38, 23).prop('stairs-down', 49, 29).prop('mushrooms', 39, 25);
  b.light(43, 28, 10, 15, '#ff9a3c');

  b.cave('The Larder', 56.5, 26.8, 1.5, 2.2, { seed: 6116, mat: 'cave-floor', wobble: 0.08,
    read: 'Carcasses hang from hooks in the dark: goats, deer, a cow, and something that might have been a horse. The air is cold and smells of salt.',
    gm: 'The family\'s meat store. Marlo\'s "toll meat" is here, every haunch green and crawling (DC 10 Medicine: weeks old). Grub\'s share was the only fresh one, the night of the theft, and Marlo gave it to him by hand. Behind the carcasses: a troll-hunter\'s pack from long ago, holding a potion of fire breath, two flasks of alchemist\'s fire and 40 gp.',
  });
  b.tunnel([[56, 28], [56, nBank[56]]], 1, { mat: 'cave-floor', seed: 6117 });
  b.props_('chains-hanging', [[56, 25], [57, 26], [56, 27]]).prop('butcher-block', 57, 26).prop('backpack', 55, 26).prop('gm-treasure', 55, 26, 0, { gm: true });

  b.cave('The Brood Den', 28, 51.3, 2.4, 2, { seed: 6118, mat: 'cave-floor',
    read: 'A low cave full of nests of torn sails and sheepskins, and a smell like a wet kennel. Someone has drawn pictures on the walls in charcoal: a big troll, five smaller trolls, and an egg with a crown on it.',
    gm: 'Where the younger trolls sleep. Snag\'s corner has a box of carved whistles. Grub\'s nest is full of buttons and shiny spoons. The twins have drawn a line down the middle of their nest in mud. A DC 14 Investigation finds no sign any of them hid the egg here.',
  });
  b.tunnel([[28, sBank[28]], [28, 50]], 2, { mat: 'cave-floor', seed: 6119 });
  b.props_('bedroll', [[26, 50], [29, 49], [28, 51]]).prop('straw-bed', 27, 51).prop('coffer', 29, 52).prop('sails-pile', 27, 49).prop('candles', 28, 50);

  b.cave('Under the Arch', 39.5, 50.6, 1.8, 1.6, { seed: 6120, mat: 'cave-floor',
    read: 'A dry cave in the foot of the bridge pier, with a chair made of a cart and a chest made of a coffin. Bolder\'s toll box sits on a shelf of carved stone, labelled MINE.',
    gm: 'Bolder\'s den, reached from the river bank. His hoard is here. A riddle is painted on the inside of the coffin lid: the answer ("a bridge") opens its false bottom.',
  });
  b.tunnel([[39, sBank[39]], [39, 50]], 1, { mat: 'cave-floor', seed: 6121 });
  b.prop('sarcophagus-open', 40, 51).prop('cart', 38, 51).prop('coin-stacks', 41, 50).prop('gm-treasure', 40, 51, 0, { gm: true });

  b.tunnel([[18, sBank[18]], [18, 50], [20, 52], [20, sRim[20]]], 1, { mat: 'stone', seed: 6122 });
  b.area('The Goat Stair', [[17, 47, 5, 10]], {
    read: 'A goat track zigzags up the south cliff, little more than a crack with ambitions. Fresh splinters of bone litter the steps, and a smell of unwashed giant.',
    gm: 'A back way from the river to the south rim. Three of the hag\'s ogres watch it from the top, with a pile of boulders to roll (each boulder: DC 13 Dexterity save or 3d10 bludgeoning and pushed down 10 ft). Beaten, a frightened ogre gives up the camp\'s location for its life.',
    label: [19, 51],
  });
  b.props_('boulder', [[20, sRim[20]], [21, sRim[21]]]).prop('rubble-pile', 18, 49).prop('stairs-up', 19, 50).prop('skull-bleached', 20, 52);
  b.encounter('Ogres on the Goat Stair', [17, 47, 7, 14], [['ogre', 3]], 'low');

  // ---------- the river floor ----------
  b.area('The Moot-stones', [[37, 32, 11, 15]], {
    read: 'On a wide bar of gravel under the cliffs, seven standing stones make a lopsided ring. Each stone is carved with a crude troll face, and one, bigger than the rest, wears a wreath of nettles.',
    gm: 'Where the troll family meets to settle quarrels. At moonrise on the second night, Mother Gristlemoss calls the Moot here. If the heroes bring the egg, or proof, this is where peace is made. If not, it is where the fighting starts.',
    label: [42, 40],
  });
  b.paint(37, nBank[40], 11, 2, 'sand');
  b.props_('standing-stone', [[38, 33], [41, 33], [45, 34], [47, 37], [46, 44], [39, 45], [37, 41]]).prop('stone-circle', 42, 40).prop('campfire-cold', 42, 44).prop('bone-heap', 44, 33).prop('flowers', 47, 37);
  b.encounter('The Moot turns bloody', [37, 32, 11, 15], [['troll', 2], ['hillGiant', 1]], 'high');
  b.area('The Long Rapids', [[10, 32, 13, 15]], {
    read: 'The river runs white between boulders, roaring. Driftwood is jammed in every crack, and a wrecked raft spins slowly in an eddy.',
    gm: 'Swimming: DC 15 Athletics each round or take 2d6 bludgeoning on the rocks and be carried 30 ft downstream. The banks are walkable, slippery gravel.',
    label: [16, 39],
  });
  b.props_('rapids', [[12, wc[12]], [17, wc[17]], [20, wc[20]], [26, wc[26]], [30, wc[30]]]).props_('boulder', [[13, wc[13] - 1], [19, wc[19] + 1], [27, wc[27] - 2]]).prop('debris-wood', 21, nBank[21] + 1).prop('log-fallen', 11, sBank[11] - 1).prop('canoe', 25, sBank[25] - 1, 90, { v: 1 });
  b.area('The Drowned Mile', [[54, 32, 12, 15]], {
    read: 'Here the river runs deep and quiet before the falls, green as glass. You can hear the falls ahead, a long way down, like a crowd cheering.',
    gm: 'Deep water. A swimmer who drifts east past the drawbridge is pulled toward the lip: DC 16 Athletics or go over the falls (7d6, halved by the Kettle, then the Kettle\'s current).',
    label: [58, 40],
  });
  b.props_('rapids', [[63, wc[63]], [65, wc[65]], [64, wc[64] + 1]]).props_('reeds', [[55, nBank[55]], [62, sBank[62]]]).prop('lily-pads', 57, wc[57] - 2).prop('mud-patch', 64, nBank[64]).prop('crumbling-ledge', 65, sBank[65]);

  // ---------- the north rim ----------
  b.building('The Shy Penny', 44, 3, 12, 9, {
    mat: 'wood-planks',
    read: 'A low stone waystation with a turf roof, every bench and corner taken by travellers who have been stuck here for eight days. The common room smells of wet wool and the last of the stew.',
    gm: 'Hobb the innkeeper is going broke feeding everyone on credit. Rumours here (one per DC 10 Insight or a round of drinks): the trolls are fighting; the egg is gone; the hill giant is courting the matriarch; nobody has crossed in a week; a sweet old peddler, Granny Ash, sells troll-bane. Granny Ash is Nettlewick in disguise (DC 18 Insight notices she never touches the iron poker or the salt).',
    doors: [[49, 11, 's'], [50, 11, 's'], [55, 7, 'e']],
    windows: [[44, 6, 'w'], [47, 3, 'n'], [52, 3, 'n'], [55, 4, 'e']],
  });
  b.wallRun(44, 6, 4, 'n').wallRun(47, 3, 3, 'e').door(46, 6, 'n');
  b.area('Penny kitchen', [[44, 3, 4, 3]], { gm: 'A trapdoor to a cellar, empty but for turnips. The cook\'s cleaver is missing (Granny Ash borrowed it).', label: [45, 4] });
  b.prop('bar-counter', 48, 4).prop('keg-rack', 51, 4).prop('hearth-grand', 54, 5).props_('table-round', [[48, 8], [52, 8]]).props_('chair', [[47, 8], [49, 8], [51, 8], [53, 8]]).prop('bench-long', 45, 9).prop('stove', 44, 3).prop('trapdoor', 46, 4).prop('notice-board', 53, 10).prop('tavern-sign', 51, 12).prop('dartboard', 55, 9);
  b.light(54, 5, 15, 20).light(48, 4, 10, 15);
  b.building('Penny stables', 57, 4, 7, 6, {
    read: 'Horses, mules and one very bored ox, packed in tight. Hay is running low.',
    gm: 'A stable boy, Wick, sleeps in the loft. He saw Granny Ash walk out toward the Mistwood at midnight two nights ago, "with a big basket that clanked".',
    doors: [[57, 6, 'w'], [60, 9, 's']],
  });
  b.props_('hay-bale', [[58, 5], [62, 5]]).prop('water-trough', 60, 7).props_('hitching-post', [[58, 8], [62, 8]]).prop('ladder', 63, 7);
  b.area('Caravan yard', [[42, 12, 22, 7]], {
    read: 'Wagons stand axle to axle in the yard, their oxen grazing on the verge. A plump man in plum velvet is shouting at a troll-shaped lump of nothing on the far side of the gorge.',
    gm: 'Marlo Saltby\'s three wagons (wool, wine and nails) and a dozen stranded travellers in tents. Marlo blames the trolls loudly and offers 50 gp a bridge to anyone who "clears" them. He knows far more than he says (see his profile).',
    label: [52, 15],
  });
  b.props_('wagon', [[47, 14], [53, 13], [58, 15]]).props_('tent', [[43, 16], [61, 13]]).prop('campfire', 50, 16).prop('well', 56, 17).prop('barrel-group', 45, 13).prop('crate-pile', 60, 17).prop('merchant-cart', 63, 15);
  b.light(50, 16, 10, 15);
  b.area('The Seven-Bridge signpost', [[30, 12, 9, 7]], {
    read: 'Where the road forks at the lip of the gorge stands a signpost with seven arms, and a great painted board nailed under it.',
    gm: 'The toll board (handout). Someone has scratched a note into the post: GRANNY SAYS FIRE. (Granny Ash, stirring up travellers to burn trolls.)',
    label: [34, 14],
  });
  b.prop('signpost', 36, 14).prop('notice-board', 34, 13).prop('milestone', 39, 9).prop('road-shrine', 31, 13);
  b.area('The Boot Tree', [[16, 4, 9, 8]], {
    read: 'A dead oak stands alone on a knoll, and every branch is hung with boots: hundreds of them, by their laces, swinging and knocking in the wind.',
    gm: 'Troll humour: trolls do not eat boots. Each pair is a traveller who failed a toll. A DC 12 Investigation finds two pairs of brand new, ogre-sized boots (size enormous), hung there two days ago by Bolder as a mockery of "the big lads who tried the Arch" (he chased off four ogres the night before the theft and never thought more of it).',
    label: [20, 8],
  });
  b.prop('tree-dead', 20, 7).props_('gear-pile', [[19, 8], [21, 6]]).props_('grass-tall', [[17, 5], [23, 10]]).prop('cairn', 24, 6);
  const trees = (x0: number, y0: number, w: number, h: number, n: number, kind: string, seed: number) => {
    const t = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = x0 + Math.floor(t() * w), y = y0 + Math.floor(t() * h);
      if (b.isFloor(x, y)) b.prop(kind, x, y);
    }
  };
  trees(1, 1, 12, 3, 5, 'tree-pine', 6130);
  trees(24, 1, 12, 9, 9, 'tree-pine', 6131);
  trees(64, 2, 15, 9, 12, 'tree-fir-snow', 6132);
  b.building("Goatherd's hut", 4, 5, 6, 4, {
    read: 'A stone hut with a turf roof and a goat standing on it.',
    gm: 'Old Wenna the goatherd lost two goats to Gorsk (he paid for them with a gold ring as big as a bracelet, which she will sell for 100 gp). She heard "thunder going down the cliff, but no rain" two nights ago, from the east (the ogres on the Curtain Path).',
    doors: [[6, 8, 's']],
  });
  b.prop('bed', 5, 6).prop('hearth-oven', 8, 6).prop('milk-churn', 5, 7).props_('fence-wood', [[2, 11], [5, 11], [8, 11], [11, 10]]).prop('haystack', 11, 7).prop('water-trough', 3, 10);
  b.area('The Mistwood', [[63, 9, 16, 12]], {
    read: 'A thick wood of dark firs crowds the cliff edge here, wet with spray from the falls. Footpaths that are not quite paths wander between the trunks.',
    gm: 'Trampled undergrowth and broken branches at ogre height lead to the Shrine of the Falls (DC 12 Survival). Marlo has a stash of empty sacks and a lantern hidden in a hollow stump.',
    label: [70, 14],
  });
  b.props_('stump', [[66, 16], [76, 18]]).prop('ferns', 68, 18).prop('mushroom-giant', 75, 15).prop('log-fallen', 64, 19, 90).prop('lantern-standing', 66, 17, 0, { off: true });
  b.props_('chasm-edge', [[12, nRim[12] - 1], [28, nRim[28] - 1], [46, nRim[46] - 1], [64, nRim[64] - 1], [30, sRim[30]], [50, sRim[50]], [66, sRim[66]]]);

  // ---------- the south rim ----------
  b.area("Gorsk's camp", [[1, 58, 12, 10]], {
    read: 'A hill giant\'s idea of a romantic camp: a bonfire, a heap of goat bones, a bed of hay, and a pile of presents, including a cartwheel, a church bell and a live sheep wearing a ribbon.',
    gm: 'Gorsk is courting Mother Gristlemoss and practising love poems out loud. His presents are for her. Among them, wilting: a second bouquet of stinging nettles, "for my darling, like the peddler lady said trolls like". The sheep is called Duchess.',
    label: [6, 62],
  });
  b.prop('campfire-spit', 6, 62).prop('bone-heap', 3, 60).prop('hay-bale', 9, 64).prop('treasure-pile', 10, 60).prop('temple-bell', 11, 62).prop('boulder-large', 4, 65).prop('flowers', 8, 60).prop('cart', 2, 66);
  b.light(6, 62, 15, 20);
  b.encounter('Gorsk at the ford', [1, 30, 10, 20], [['hillGiant', 1], ['direWolf', 2]], 'low');
  b.area('The Burnt Wagon', [[25, 61, 9, 7]], {
    read: 'A merchant\'s wagon lies on its side by the road, burned black. A painted sign leans against it: THIS ONE DIDN\'T PAY.',
    gm: 'Three years old: Ungle\'s warning to toll-dodgers. Inside the charred box, a DC 13 Investigation finds 30 gp melted into a lump and a scorched note promising "more meat next month, F." (Marlo has been paying the trolls in bad meat for years).',
    label: [29, 64],
  });
  b.prop('wagon', 28, 63, 0, { v: 1 }).prop('debris-wood', 30, 65).prop('signpost', 26, 62).prop('embers-ash', 29, 66).prop('skull-bleached', 32, 63);
  trees(10, 66, 18, 12, 14, 'tree-pine', 6133);
  trees(42, 66, 13, 12, 10, 'tree-pine', 6134);
  trees(44, 59, 10, 5, 3, 'bush', 6135);
  b.area('Ogre-walk wood', [[40, 65, 16, 13]], {
    read: 'Pines and thick bracken. Something big has walked through here more than once: branches are snapped off at twice your height.',
    gm: 'The ogres\' trail from the camp to the Goat Stair. A worg den sits in a hollow; the worgs are Bolder\'s and come when he whistles.',
    label: [48, 71],
  });
  b.area('The south road', [[33, 68, 8, 11]], {
    read: 'The road runs on south, toward the far valley and everywhere the heroes meant to go.',
    gm: 'Where the adventure ends, one way or another.',
    label: [37, 74],
  });
  b.prop('milestone', 36, 72).prop('road-shrine', 39, 66);

  // the thief's camp
  b.area("Nettlewick's Bower", [[62, 60, 17, 18]], {
    read: 'Behind a wall of thorns, ogres lounge around a fire under hanging bundles of herbs. A crooked hut squats at the back, and from inside it comes a warm red glow and a woman\'s voice, singing a lullaby.',
    gm: 'Nettlewick the green hag and her hired ogres (paid in sheep). The thorn ring is difficult ground and deals 1d4 piercing per square. The ogres are bored and greedy: a bigger bribe (anything over 100 gp, or a cow) and they "go for a walk". If the hag is beaten or her lie exposed, the rest run.',
    label: [68, 64],
  });
  b.props_('thorn-bush', [[63, 61], [66, 60], [76, 61], [78, 66], [77, 72], [64, 76], [70, 77], [62, 69]]).props_('brambles', [[63, 65], [75, 76], [78, 69]]).props_('lean-to', [[65, 66], [65, 71]]).prop('campfire', 67, 68).prop('bone-heap', 68, 66).prop('loot-sacks', 64, 68).prop('cage-hanging', 69, 73).prop('herbs-drying', 66, 64).prop('gibbet-post', 74, 64).prop('chicken-coop', 76, 74);
  b.light(67, 68, 15, 20);
  b.building("The Hag's Hut", 70, 67, 6, 5, {
    mat: 'wood-planks-dark',
    read: 'Jars, bones and bunches of nettles hang from every beam. In the middle of the floor a huge iron cauldron sits over glowing coals, and in it, nested in warm ash, is a great grey stone egg. It rocks gently. Something inside is knocking.',
    gm: 'The egg-stone. It hatches at moonrise tomorrow, and the troll child will love the first face it sees. Nettlewick means that face to be hers. Moving the egg takes four Medium creatures or two Large ones, or a cart; it must be kept warm (a fire, a blanket, a spell) or it hatches early and angry. The hut also holds her note to the ogres (handout).',
    doors: [[72, 71, 's'], [70, 69, 'w']],
    windows: [[75, 69, 'e']],
  });
  b.prop('cauldron', 72, 69).prop('shelf-jars', 71, 68).prop('straw-bed', 74, 68).prop('herbs-drying', 73, 68).prop('potion-shelf', 71, 70).prop('gm-treasure', 74, 70, 0, { gm: true });
  b.light(72, 69, 10, 15, '#ff6a3c');
  b.encounter("Nettlewick's camp", [63, 62, 15, 14], [['greenHag', 1], ['ogre', 5], ['ogreZombie', 1]], 'moderate');

  b.start(39, 1, 3, 3);
  b.note(39, 0, 'The heroes arrive down the north road. The south road (bottom of the map) is where they want to go.');
  b.note(72, 21, 'Secret door: the Curtain Path, the hidden crossing under the falls.');
  b.note(42, 40, 'The Moot happens here at moonrise on the second night.');
  return b.build();
}

export const TROLL_BRIDGES: Adventure = {
  id: 'troll-bridges',
  title: 'The Troll Bridges of Kel Morrow',
  tagline: 'Seven bridges, one troll family, one stolen egg: solve the theft before the toll turns bloody.',
  levels: '6',
  sessions: '1 session (4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'wilderness', 'trolls', 'mystery', 'funny'],
  pitch:
    'The only road between the two valleys crosses the gorge of Kel Morrow, and the gorge belongs to trolls. For as long as anyone remembers, a troll family has kept the seven old bridges and charged a toll: a riddle, a song or a nice bit of meat. Annoying, but fair. Then, a week ago, the tolls stopped. Now the trolls bellow at each other across the gorge, a wagon went over the King\'s Arch with its driver still on it, and travellers are piling up at the waystation on the north rim. You need to get across. So does everybody else.',
  secret:
    'Nettlewick, a green hag, stole the matriarch\'s egg-stone two nights ago. A troll family lays one stone egg a generation, and the child inside loves the first face it sees when it hatches. Nettlewick wants that face to be hers: a troll child of her own, and the bridges for her ogres once the family tears itself apart. She came to the waystation disguised as Granny Ash the peddler, sold drugged meat to the greedy merchant Marlo (who gave it to Grub, the troll guarding the nest), sent four hired ogres down the forgotten Curtain Path under the falls, and planted a hair, a rope and a tooth in the empty nest so that every troll blames another. She also told the lovesick hill giant Gorsk that trolls adore nettles, to hide her own smell. Why now: the egg hatches at moonrise tomorrow, and at moonrise Mother Gristlemoss calls the Moot.',
  hooks: [
    'The heroes simply need to cross: the road south is the only way to where they are going, and they are stuck at the Shy Penny with forty other travellers.',
    'Marlo Saltby, a merchant, offers 50 gp a bridge to anyone who will "clear the vermin" (he hopes the heroes will kill the trolls before anyone asks about his meat).',
    'Hobb the innkeeper begs for help: he is feeding everyone on credit and has nine days of food left. He offers free rooms for life and the two potions of resistance (fire) his grandmother kept for "troll trouble".',
  ],
  tips: [
    'Trolls regenerate. Remind the players early (the toll board\'s last line, NO FIRE, WE MEAN IT, is a hint) and put lamp oil and torches within reach. Grub\'s and Snag\'s fights should end with the troll fleeing into the river, not with a slow grind.',
    'Every troll is a suspect and every troll is innocent. Play each one big: Bolder\'s riddles, Snag\'s singing, Grub\'s sulking, the twins\' broken rhymes, Ungle\'s paperwork. The humour is the point, and the danger is real.',
    'Most fights can be talked down. Paying the toll, a good riddle, a song, or a promise to find the thief works on every troll. Fighting bridge by bridge is the hard road, and it ends at the Moot.',
    'The clue trail: the nest (planted clues and nettles), Gorsk (the peddler and the nettles, the four big fellas), Ungle\'s ledger (no troll crossed), Marlo (the drugged meat and the hidden path), the Curtain Path (ogre tracks). Any two of these point to the falls; let the players get there their own way.',
    'Keep a clock: the heroes arrive in the afternoon; moonrise is tomorrow night. Each bridge visit or long talk is an hour or two. If they dawdle, the twins\' quarrel turns into a real fight and someone falls off a bridge.',
    'For 3 heroes, take one ogre and the ogre zombie out of the camp and one worg off the Arch. For 5, add an ogre to the Goat Stair and a worg to the Arch.',
  ],
  npcs: [
    {
      id: 'pf_tbgristlemoss', name: 'Mother Gristlemoss', title: 'matriarch of the Morrow trolls', kind: 'monster', art: 'troll', monsterId: 'troll', shared: true,
      wants: 'Her egg back safe before it hatches at moonrise tomorrow, and the name of whoever took it.',
      knows: 'The egg was in the nest at dusk two nights ago and gone by dawn, while Grub was on guard. She smelled nettles, but Gorsk brought her nettles that day, so she trusts nothing.',
      voice: 'Slow and grand. Calls everyone "morsel". Ends arguments by sitting down on something.',
      appearance: 'A moss-green troll twelve feet tall, with a necklace of cartwheels and a bridal veil made of fishing net (a present from Gorsk).',
      backstory: 'She has kept the bridges for ninety years and buried two husbands (both troll-hunters\' work). The egg is the last child she will ever have.',
      gmNotes: 'Troll stat block with maximum hit points. She keeps a drawer of things troll-hunters left behind, and gives the heroes the one nobody in the family likes: a flame tongue longsword. If she is told the truth and shown proof, she calls off the Moot.',
    },
    {
      id: 'pf_tbbolder', name: 'Sir Bolder', title: 'keeper of the King\'s Arch, eldest son', kind: 'monster', art: 'troll', monsterId: 'troll', shared: true,
      wants: 'To be named heir, and for the Arch to be the only bridge anyone respects.',
      knows: 'The night before the theft he chased four ogres off the Arch and hung their boots on the Boot Tree. He blames Ungle, who "always wanted to count the egg".',
      voice: 'Pompous. Insists on "Sir". Asks riddles and sulks when they are solved.',
      appearance: 'A grey troll in a rusty crown-helm with a wooden sign round his neck reading TOLL.',
      gmNotes: 'His riddle: "I have a back but no front, I carry the world but never walk, and I am always under trolls." (A bridge.) He whistles for three worgs from the Ogre-walk wood.',
    },
    {
      id: 'pf_tbsnag', name: 'Snag', title: 'keeper of the rope bridge', kind: 'monster', art: 'troll', monsterId: 'troll',
      wants: 'A good song, and for everyone to stop looking at his rope.',
      knows: 'A coil of his spare rope went missing from the bridge post the day before the theft. He thinks a twin took it.',
      voice: 'High and quick. Hums when nervous, which is always.',
      appearance: 'A thin, long-armed troll with ropes and little bells braided into his hair.',
      gmNotes: 'If the heroes sing with him (DC 12 Performance), he becomes their friend and will stand beside them at the Moot.',
    },
    {
      id: 'pf_tbgrub', name: 'Grub', title: 'keeper of the fallen log, the youngest', kind: 'monster', art: 'troll', monsterId: 'troll',
      wants: 'Meat. Right now. And for Mother not to be cross with him any more.',
      knows: 'He was guarding the nest. The fat merchant gave him a lovely fresh haunch of mutton at sunset and then he was asleep until morning, with a tooth missing.',
      voice: 'Talks about himself as "Grub". Sniffs a lot. Very easily cheered up.',
      appearance: 'A round, warty troll ten feet tall, wearing a cooking pot as a hat.',
      gmNotes: 'The sleep was the hag\'s drug in Marlo\'s meat (DC 13 Medicine on his breath: valerian and poppy). Feed him and he is the heroes\' biggest fan.',
    },
    {
      id: 'pf_tbmeg', name: 'Moss-Meg', title: 'keeper of the aqueduct, one of the twins', kind: 'monster', art: 'troll', monsterId: 'troll',
      wants: 'For her twin sister Mab to admit she did it, and for the rhymes to come back.',
      knows: 'She found one of Mab\'s braids in the nest. Mab found nothing but says Meg planted it.',
      voice: 'Speaks in rhyme, and stops dead, furious, whenever a line needs Mab to finish it.',
      appearance: 'A mossy troll with ferns growing in her hair, one of two identical sisters (Mab has the ferns on the other side).',
      gmNotes: 'Mab uses the same troll stat block and is placed with the twins\' quarrel. Finishing a rhyme for them (DC 13 Performance or a clever line) makes them laugh, and the quarrel ends.',
    },
    {
      id: 'pf_tbungle', name: 'Ungle', title: 'keeper of the drawbridge, the family accountant', kind: 'monster', art: 'troll', monsterId: 'troll', shared: true,
      wants: 'Order, receipts, and compensation for the week\'s lost tolls.',
      knows: 'His ledger shows that nobody, troll or traveller, crossed any bridge on the night of the theft. So the thief crossed some other way, which means someone has been dodging tolls.',
      voice: 'Dry and precise. Licks his thumb to turn pages. Says "noted" instead of "yes".',
      appearance: 'A hunched troll in a pair of spectacles with no glass in them, an inkpot on a chain round his neck.',
      gmNotes: 'Accuses Gorsk ("outsiders, never pay"). Shows the ledger to anyone who pays his 5 gp "inspection fee" or wins a DC 14 Persuasion. Furious about any hidden path: tell him about the Curtain Path and he demands the heroes bring him the culprit.',
    },
    {
      id: 'pf_tbgorsk', name: 'Gorsk', title: 'a hill giant in love', kind: 'monster', art: 'hillGiant', monsterId: 'hillGiant', shared: true,
      wants: 'To marry Mother Gristlemoss, and for the trolls to stop calling him "the lump".',
      knows: 'A kind peddler lady told him trolls love nettles. Picking nettles by the falls two nights ago, he saw "four big fellas with a sack going down into the ground by the little shrine".',
      voice: 'Booming and slow. Recites terrible love poems ("Your skin is green like moss on a log, your breath is warm like a nice wet dog").',
      appearance: 'A sixteen-foot giant with a crown of thistles, carrying a live goat under each arm as gifts.',
      gmNotes: 'He blocks the ford with his two "puppies" (dire wolves). Praising his poem (DC 11 Persuasion, advantage if the hero writes him a better one) turns him into an ally, and he will carry the egg if asked.',
    },
    {
      id: 'pf_tbnettlewick', name: 'Nettlewick', title: 'green hag, alias Granny Ash the peddler', kind: 'monster', art: 'green-hag', monsterId: 'greenHag',
      wants: 'To hatch the egg herself so the troll child is hers, and to see the troll family destroy itself.',
      knows: 'Everything: the Curtain Path, the drugged meat, the planted clues, and that the egg hatches at moonrise tomorrow.',
      voice: 'As Granny Ash, sweet and creaky, calls everyone "dearie". As herself, a wet chuckle and a voice like a drain.',
      appearance: 'As Granny Ash, a tiny bent woman with a basket of clinking jars. Truly, a green-skinned crone with long wet hair full of nettles.',
      backstory: 'She has wanted a troll for a son since she saw a troll lift a cart one-handed. The ogres are paid in sheep, and in promises.',
      gmNotes: 'Uses her illusions to look like Granny Ash at the inn and invisibility to slip away. Cornered and losing, she offers a deal: the egg for her life. She keeps the deal only if the heroes watch her leave the gorge.',
    },
    {
      id: 'pf_tbmarlo', name: 'Marlo Saltby', title: 'a merchant in a hurry', kind: 'npc', art: 'merchant', shared: true,
      wants: 'His wagons across without paying, and nobody to look closely at his business.',
      knows: 'He has smuggled goods down the Curtain Path for years and paid the trolls their meat toll in rotten meat. Granny Ash sold him a fresh haunch "for the little troll" and he handed it over. Two nights ago, on the path, he saw ogres carrying a sack and ran.',
      voice: 'Oily and jolly, laughs at his own jokes, and goes very quiet when cornered.',
      appearance: 'A plump man in plum velvet, rings on every finger, and very clean boots.',
      gmNotes: 'Lies at first. DC 15 Insight catches it; DC 14 Intimidation, or the burnt-wagon note, or Ungle\'s name makes him confess and hand over his chalk map of the path (handout). If the trolls learn about his meat, he will need protecting.',
    },
    {
      id: 'pf_tbhobb', name: 'Hobb Tallowmere', title: 'innkeeper of the Shy Penny', kind: 'npc', art: 'innkeeper', shared: true,
      wants: 'The toll war over before he has to start serving boiled boots.',
      knows: 'Every troll by name and toll. That Granny Ash arrived a week ago, never pays, and was out late the night the trouble began.',
      voice: 'Worried and kind, polishes the same mug the whole time he talks.',
      appearance: 'A tall, thin man in a goat-wool apron, with flour on his eyebrows.',
    },
  ],
  handouts: [
    { id: 'tb-tollboard', title: 'The toll board at the signpost', text: 'BRIDGES OF KEL MORROW. TOLLS.\nLOG: MEAT (ANY)\nROPE: ONE SONG (GOOD)\nARCH: ONE RIDDLE OR ONE COW\nAQUADUCK: FINISH THE RHYME\nDRAWBRIDGE: COIN. SEE PRICES. DOUBLE AFTER DARK.\nFORD: ASK THE GIANT (NOT OURS)\nNO REFUNDS. NO FIRE. WE MEAN IT ABOUT THE FIRE.' },
    { id: 'tb-ledger', title: "A page of Ungle's ledger", text: 'Night of the egg. Log: nobody. Rope: nobody. Arch: nobody (Bolder asleep, noted). Aqueduct: nobody. Drawbridge: nobody. Ford: the lump, picking weeds, no toll (complaint filed).\nFive bridges, no crossings, egg gone.\nTHEREFORE: a crossing not on this page. Someone owes me for it.' },
    { id: 'tb-song', title: "Snag's toll-song (sung, not said)", text: 'Seven bridges over the Morrow,\nSix for the trolls and one for sorrow.\nOne of rope and one of tree,\nOne of stone for kings to see,\nOne of water, dry and green,\nOne that bites, and one unseen.\n(Snag does not know what the last line means. His grandmother sang it.)' },
    { id: 'tb-chalkmap', title: "Marlo's chalk map", text: 'A rough drawing on slate. A little house with a cross on it, by a waterfall. A dotted line goes down, under the falling water, and up again on the far side to a square marked "old toll hut". Under it, in a merchant\'s neat hand: "NO TOLL. DON\'T SLIP."' },
    { id: 'tb-hagnote', title: 'A note pinned to the cauldron', text: 'Boys.\nKeep the pot warm. Not hot. WARM.\nIf it starts knocking before I am back, put the sack over its head so the first face it sees is MINE, not yours, not ever.\nAnyone who eats the sheep before payday gets turned into a sheep.\n— N.' },
  ],
  chapters: [
    {
      id: 'gorge', title: 'The Gorge of Kel Morrow', level: 6,
      summary: 'From the crowded waystation on the north rim, across (or under) the seven bridges of the troll family, to the hag\'s camp on the south rim and the Moot at moonrise.',
      goal: 'Find the stolen egg-stone and the real thief before moonrise tomorrow, and get the road open again (by peace, or by fire).',
      map: kelMorrow,
      npcs: [
        { npc: 'pf_tbhobb', x: 49, y: 5 },
        { npc: 'pf_tbmarlo', x: 51, y: 15 },
        { npc: 'pf_tbbolder', x: 34, y: 39 },
        { npc: 'pf_tbgristlemoss', x: 45, y: 26, hidden: true },
        { npc: 'pf_tbsnag', x: 23, y: 26 },
        { npc: 'pf_tbgrub', x: 15, y: 28 },
        { npc: 'pf_tbmeg', x: 52, y: 29 },
        { npc: 'pf_tbungle', x: 59, y: 59, hidden: true },
        { npc: 'pf_tbgorsk', x: 6, y: 47 },
        { npc: 'pf_tbnettlewick', x: 73, y: 69, hidden: true },
      ],
      scenes: [
        {
          room: 'The Shy Penny', title: 'Stuck at the Shy Penny',
          read: 'The waystation is packed to the rafters with travellers who have nowhere to go. Through the window, across the gorge, you can hear trolls bellowing at each other. A sweet old peddler woman pats your hand. "Troll-bane, dearie? Burn the lot of them, that\'s what I say."',
          gm: 'Set the scene and the clock (moonrise tomorrow). Hobb hires the heroes; Marlo tries to hire them to kill trolls; Granny Ash (Nettlewick) sells pepper and lamp oil as troll-bane and slips out once the heroes start asking real questions. The toll board at the signpost outside gives the rules of the gorge.',
          handout: 'tb-tollboard',
        },
        {
          room: "The King's Arch", title: "Sir Bolder's toll", encounter: "Bolder's toll",
          read: 'The troll in the rusted crown rises from his stone chair, and he keeps rising. "Halt! Sir Bolder demands the toll. And then Sir Bolder demands to know which of his rotten little siblings stole his mother\'s egg."',
          gm: 'The first troll most heroes meet. His riddle is in his profile. Solve it, stump him, or pay a cow, and he lets them pass and tells the story of the egg (and blames Ungle). Refuse and he whistles up his worgs. Any troll beaten in a fight jumps into the river to regenerate and goes to tell Mother. He sends the heroes to her: "Ask her yourself. Take the ledge path, if you\'re not scared of heights."',
        },
        {
          room: "Mother's Hollow", title: 'Mother Gristlemoss',
          read: 'The huge troll looks up at you with eyes like wet lamps. "Morsels," she says. "Come to laugh at a mother with an empty nest? No? Then sit. Someone in my family has stolen my child, and by tomorrow\'s moon I will know who, or I will eat the answer out of all of them."',
          gm: 'She hires the heroes: find the egg by moonrise, and name the thief with proof. Reward: free passage forever for them and anyone they name, Bolder\'s toll box, and the flame tongue from her drawer. The Egg Nest is next to her; let the players search it (clues in its area notes). The nettles and the slime are the real clues; the hair, rope and tooth are planted.',
        },
        {
          room: "Snag's Rope Bridge", title: 'Ring and sing', encounter: "Snag's swaying bridge", optional: true,
          read: 'The bell clangs. Hand over hand along the underside of the bridge, a skinny troll swings up to meet you, humming. "A song for the bridge," he says. "And then, please, tell everyone it wasn\'t my rope."',
          gm: 'Sing (DC 12 Performance, or just sing with gusto) and Snag is a friend. He teaches the old toll-song: its last line, "one unseen", is the seventh crossing no troll remembers. Fight him on the bridge and the swaying rules apply to everyone.',
          handout: 'tb-song',
        },
        {
          room: "Grub's Log", title: 'Grub is hungry', encounter: "Grub's hungry log", optional: true,
          read: 'Halfway along the fallen tree sits a fat troll with a cooking pot on his head, crying into his own knees. He sees you and sniffs. "Grub is SO hungry," he says, "and Grub is in SO much trouble."',
          gm: 'Feed him and he spills everything: the fat merchant\'s gift of mutton at sunset, the long sleep, the missing tooth. DC 13 Medicine smells the sleeping drug on him. Refuse him meat and he tries to take some (a hero will do).',
        },
        {
          room: 'The Moss Aqueduct', title: "The twins' quarrel", encounter: "The twins' quarrel",
          read: 'Two identical trolls stand nose to nose on either side of the broken span. "You took the egg and then you lied—" begins one. The other folds her arms and says nothing at all. The first one screams.',
          gm: 'Meg and Mab are a heartbeat from shoving each other off the aqueduct, and anyone on it is in the way. A clever rhyme to finish Meg\'s line (DC 13 Performance), or showing that the braid was planted (DC 14 Persuasion), makes them laugh and hug, which is almost as dangerous. They tell the heroes Ungle keeps a record of every crossing.',
        },
        {
          room: "Ungle's Tower", title: "Ungle's accounts", encounter: "Ungle's counting room",
          read: 'The drawbridge comes down with a long complaining groan. Inside the tower, a troll in empty spectacles licks his thumb and turns a page. "Names. Purpose of crossing. And the inspection fee, which is five gold."',
          gm: 'Pay the fee or win a DC 14 Persuasion and Ungle shows the ledger: nobody crossed that night, so there is a secret crossing. That, for Ungle, is worse than the theft. Pell and Hamm, his debt-guards, can be talked out of any fight. The strongroom behind the secret door holds the family savings.',
          handout: 'tb-ledger',
          treasure: 'In Ungle\'s strongroom: 450 gp in sorted pots, 2 potions of greater healing, and a silver inkwell (25 gp). Ungle gives the heroes the potions freely if they find the hidden crossing.',
        },
        {
          room: 'The Wading Stones', title: 'The giant at the ford', encounter: 'Gorsk at the ford', optional: true,
          read: 'A hill giant in a crown of thistles stands knee-deep in the ford with a goat under each arm, reciting to the sky. "Your teeth are yellow like butter in May... no. Like CHEESE in May." He sees you. "You! Is that a good rhyme?"',
          gm: 'Gorsk is the matriarch\'s suitor and the trolls\' favourite suspect. Praise his poetry (DC 11 Persuasion) and he tells all: the peddler lady and her nettle advice, and the four big fellas with a sack going into the ground by the little shrine in the Mistwood. Insult him and his "puppies" come off the bank.',
          treasure: 'Among Gorsk\'s love-gifts: a gold ring as big as a bracelet (250 gp), which he would give to anyone who helps him win Mother Gristlemoss.',
        },
        {
          room: 'Caravan yard', title: 'Squeezing Marlo', optional: true,
          gm: 'This scene can happen anywhere Marlo is. Once the heroes know about the drugged meat, the rotten tolls or the burnt-wagon note, Marlo folds (or DC 14 Intimidation, DC 15 Insight to catch a lie). He confesses the meat, the smuggling and the ogres on the path, and hands over his chalk map. He begs the heroes not to tell the trolls.',
          handout: 'tb-chalkmap',
        },
        {
          room: 'Behind the Curtain', title: 'The seventh crossing', encounter: 'The drowned in the Kettle',
          read: 'The secret stair spirals down into thunder. Then the rock opens and you are standing behind a waterfall, on a ledge of wet stone, with the whole river falling past your face. Below, in the black pool, three huge shapes stand up out of the water.',
          gm: 'The Curtain Path from the Shrine of the Falls to the fallen tollhouse. The ogre zombies climb out of the Kettle onto the ledge; fighting in the spray is hard (heavily obscured past 10 ft). Ogre prints and drag marks go all the way across. This is proof the egg went by no bridge.',
          treasure: 'In a waterproof box wedged in the rock: gloves of swimming and climbing, 60 gp, and the smugglers\' old ledger. In the Shrine of the Falls: Marlo\'s silk and brandy (150 gp).',
        },
        {
          room: 'The Goat Stair', title: 'Boulders from above', encounter: 'Ogres on the Goat Stair', optional: true,
          gm: 'If the heroes go up the south cliff by the Goat Stair, or poke around the south rim asking questions, the hag\'s ogre lookouts roll boulders and then charge. A captured ogre trades the camp\'s location and the hag\'s name for its life.',
        },
        {
          room: "Nettlewick's Bower", title: "The hag's lullaby", encounter: "Nettlewick's camp",
          read: 'The ogres around the fire look up, slow and stupid and huge. From the hut comes the old woman\'s voice, sweet as honey: "Hush now, my lovely. Mummy\'s here. Mummy\'s always been here."',
          gm: 'The egg is in the hut, in the cauldron. The ogres can be bribed to walk away (anything over 100 gp, or a cow). Nettlewick fights with illusions and mockery, and tries to carry the egg off invisibly if the fight goes against her (it is far too heavy: she can only roll it). Losing, she offers the egg for her life. Bring the egg (and ideally the hag, or her note) to the Moot.',
          handout: 'tb-hagnote',
          treasure: 'In the hut: a potion of hill giant strength, a wand of web, 200 gp in stolen silver spoons, and three jars of "troll-bane" (pepper).',
        },
        {
          room: 'The Moot-stones', title: 'The Moot at moonrise', encounter: 'The Moot turns bloody',
          read: 'The moon comes up over the cliffs and turns the river to silver. Trolls come down to the gravel bar from every side, and in the ring of stones Mother Gristlemoss waits with her arms folded. Every eye turns to you.',
          gm: 'If the heroes bring the egg and name Nettlewick with any two pieces of proof (the hag note, Marlo\'s confession, the slime, the ledger, a captured ogre), the family makes peace, the egg hatches in its mother\'s arms, and the tolls go back to riddles. Without proof, Mother picks a culprit, and the Moot turns bloody: Mother, the accused troll and Gorsk (or Bolder if Gorsk is a friend) attack whoever they blame most, very possibly the heroes. Players can still stop it mid-fight with proof or a brilliant speech (DC 18 Persuasion).',
          treasure: 'Mother Gristlemoss\'s thanks: a flame tongue longsword from her drawer of troll-hunters\' leftovers ("Nobody in this family likes it"), Bolder\'s toll box from Under the Arch (320 gp and a rope of climbing), and free passage of the seven bridges forever.',
        },
      ],
      wrapUp: 'With the egg home and the hag gone, the bridges open again, the stuck travellers cheer all the way across the King\'s Arch, and Hobb throws a feast (meat for the trolls, too). If the Moot turned bloody, the heroes may have to carry the road open bridge by bridge, with fire. Either way the heroes reach level 7.',
    },
  ],
  ending:
    'Good ending: the egg hatches at moonrise in its mother\'s arms. The new troll child is named after the hero it likes best, Gorsk is finally accepted (the wedding is a week later and the heroes are invited), Marlo pays a very large toll in good meat, and the bridges are safe again for a generation. Bad ending: Nettlewick escapes with the egg or the child imprints on her, the trolls kill each other or scatter, and the hag\'s ogres own the bridges by spring, charging tolls in children. What next: Nettlewick (if she lives) has two sisters who will want to know who spoiled her plan, and Ungle\'s ledger mentions "the other gorge" where trolls once kept bridges too.',
};

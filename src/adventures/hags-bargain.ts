// The Hags' Bargain: a dark fairy-tale one-shot for four level 6 heroes.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function grimsallowCarr() {
  const b = new MapBuilder('adv-hags-bargain', 'Grimsallow Carr on the seventh spring', 80, 80, { theme: 'stone', wallStyle: 'hedge', ambient: 'dim', floor: 'grass' });
  const r = rng(60713);
  // squares kept clear of random dressing (paths, buildings, causeways)
  const keep = new Set<string>();
  const keepRect = (x: number, y: number, w: number, h: number) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) keep.add(`${i},${j}`); };

  // Walk square by square between points (never corner to corner).
  const walk = (pts: [number, number][], each: (x: number, y: number) => void) => {
    let [px, py] = pts[0];
    each(px, py);
    for (const [x, y] of pts.slice(1)) {
      while (px !== x || py !== y) {
        if (px !== x && (py === y || Math.abs(x - px) >= Math.abs(y - py))) px += Math.sign(x - px);
        else py += Math.sign(y - py);
        each(px, py);
      }
    }
  };
  // Bend a line of points so trails meander instead of running straight.
  const bend = (pts: [number, number][], amp: number, seed: number): [number, number][] => {
    const q = rng(seed);
    const out: [number, number][] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const across = Math.abs(bx - ax) >= Math.abs(by - ay);
      for (const t of [1 / 3, 2 / 3]) {
        const off = Math.round((q() - 0.5) * 2 * amp);
        const mx = Math.round(ax + (bx - ax) * t) + (across ? 0 : off), my = Math.round(ay + (by - ay) * t) + (across ? off : 0);
        out.push([mx, my]);
      }
      out.push([bx, by]);
    }
    return out;
  };
  // A laid path (stones, planks) that cuts through anything, water included.
  const path = (pts: [number, number][], w: number, mat: string) => walk(pts, (x, y) => { b.floor(x, y, w, w, mat); keepRect(x, y, w, w); });
  // A trail through the woods that keeps whatever ground it meets.
  const trail = (pts: [number, number][], w: number, mat: string, seed: number, amp = 2) => {
    const p = amp ? bend(pts, amp, seed) : pts;
    walk(p, (x, y) => { for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) if (!b.isFloor(x + i, y + j)) b.floor(x + i, y + j, 1, 1, mat); keepRect(x, y, w, w); });
  };
  // Scatter dressing in a box, only on open ground that isn't a path or a building.
  const scatter = (kinds: string[], n: number, x0: number, y0: number, w: number, h: number) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + Math.floor(r() * w), y = y0 + Math.floor(r() * h);
      if (keep.has(`${x},${y}`) || !b.isFloor(x, y) || b.cellAt(x, y) === 2) continue;
      b.prop(kinds[Math.floor(r() * kinds.length)], x, y, Math.floor(r() * 4) * 90);
      keep.add(`${x},${y}`);
    }
  };

  // ================= THE OPEN GROUND, carved first =================
  b.cave('Thimbleby edge', 8, 70, 10, 9, {
    seed: 11, mat: 'grass',
    read: 'The last houses of Thimbleby huddle at the edge of the carr, their shutters nailed tight. Every door has a horseshoe on it, and every horseshoe is new. Beyond the brook the trees grow close and black, and the mist smells of rot and burnt sugar.',
    gm: 'The heroes start on the lane. The village has had seven fat harvests in a row and is ashamed of every one of them. Folk will talk if asked kindly (DC 10 Persuasion): the bargain was made in the Hungry Year, Widow Coldwater made it, and nobody stopped her. Nobody will go into the carr after dark, not for any money.',
  });
  b.cave(null, 7, 76, 8, 4, { seed: 12, mat: 'grass' });
  b.cave('The eel pool', 11, 49, 9, 7, {
    seed: 23, mat: 'grass',
    read: 'A round black pool lies in a ring of alders, so still it looks like a hole in the world. Then something as thick as your thigh rolls under the surface, and another, and the water shivers.',
    gm: 'Three giant bog eels live here, old and fat on what the hags throw in. They attack anyone who wades or swims, or who lingers on the stepping stones. Dorrit Swale can call them off with a bucket of offal and a whistle. Something gold glints in the mud at the bottom (DC 13 Perception), 15 feet down.',
  });
  b.cave('The alder carr', 24, 42, 7.5, 6, {
    seed: 29, mat: 'grass',
    read: 'Black alders stand in standing water, their roots like knuckles. The ground squelches. Somewhere a bittern booms, and something else answers it that is not a bird.',
    gm: 'Wet woodland joining the eel pool, the drowned church, the bog and the hag\'s garden. Puddles are ankle deep, the mud pools are difficult ground. A DC 13 Survival finds small bare footprints going east toward the garden: Dimity, who comes this way to spy on the mill.',
  });
  b.cave('Drowned churchyard', 11, 32, 9, 8, {
    seed: 79, mat: 'grass',
    read: 'A church stands up to its knees in a black mere, its spire leaning like a drunk. Gravestones poke out of the water around it. The bell in the tower moves a little in the wind, but it makes no sound.',
    gm: 'A hundred years ago Father Ambrey preached against the coven, and the hags dammed the brook and drowned his church with the congregation inside, at prayer. The water is waist deep (difficult ground) and freezing. The drowned congregation still sits in the pews.',
  });
  b.cave('The bone orchard', 15, 11, 11, 8, {
    seed: 71, mat: 'dirt',
    read: 'An orchard of white, leafless trees in neat rows. Their fruit hangs and clicks in the wind: teeth on strings, wedding rings, a child\'s shoe, a fiddle, a braid of red hair. At the end of the last row stands a new sapling, no taller than a girl, tied with a yellow ribbon.',
    gm: 'Every tree grew from a price paid to the coven: each fruit is what someone gave. The sapling\'s ribbon reads CLEMMIE in Grandam\'s neat hand; it will grow from the bones of whatever the coven takes at midnight. The hags\' gardeners lurk: four of the trees are awake (awakened trees), and two ghasts and three ghouls tend the roots. They fight anyone who picks a fruit or touches the sapling. Pulling the sapling up by the roots (DC 15 Strength) wounds the coven: every hag has disadvantage on her first saving throw at the Supper.',
  });
  b.cave('The cauldron clearing', 42, 10, 10, 7, {
    seed: 61, mat: 'grass',
    read: 'A ring of leaning stones on a bald hill. In the middle a cauldron big enough to bathe in boils over a green fire, and the steam smells of cinnamon and blood. A long table is laid beside it with a white cloth. At its head sits a fat old woman in a lace cap, peeling an apple in one long curl. "You\'re early," she says. "Sit. Sit."',
    gm: 'The Reckoning Supper. Grandam Treacle (night hag) presides, with her troll, Knucklebone, behind her chair and three will-o\'-wisps for candles. She will not fight until someone refuses her hospitality, breaks the table, touches the cauldron or tries to take the Doll by force. Everything here is a game: she offers wagers, riddles and terms. See the scene notes for the ways to break the bargain.',
  });
  b.cave('The wisp bog', 36, 29, 11, 8, {
    seed: 53, mat: 'mud',
    read: 'Mist lies on the bog like milk in a bowl. Lights drift above it: pale blue, slow, kindly. One of them comes closer, bobbing, and stops a little way off, as if it wants you to follow.',
    gm: 'Four will-o\'-wisps, the souls of people who tried to cross on bargain-business and drowned, and a shambling mound that grew out of the peat. The wisps lead travellers off the log track into the deep pools. A DC 14 Survival keeps to the track; anyone off it sinks to the waist (difficult ground, and a DC 13 Strength check to pull free). Speaking a wisp\'s name (the drowned are listed in Father Ambrey\'s parish book) makes it stop and weep instead of fight.',
  });
  b.cave("Grandam's garden", 40, 46, 8, 5.5, {
    seed: 41, mat: 'grass',
    read: 'A garden blooms in the middle of the bog, too bright and too sweet. Cabbages the size of cartwheels. Sugar-pale roses. A fence of white sticks, which on a second look are not sticks. And in the middle, a cottage that leans as if it is listening, its walls dark and glossy as treacle toffee.',
    gm: 'The eldest hag\'s house, empty of her tonight: she is at the cauldron. The walls really are a kind of black treacle-bread, hard as stone, sweet as sin; licking them is a DC 13 Constitution save or be charmed by the house for an hour (you want to stay and tidy). The fence is made of shinbones. The gate squeals: a DC 12 Stealth or the kitchen inside wakes up.',
  });
  b.cave('The sunken causeway', 42, 58, 9, 6.5, {
    seed: 37, mat: 'mud',
    read: 'An old road of flat grey stones runs out across a black mere, half under water. Here and there the stones have sunk and you must wade. The reeds lean toward you as you pass, and under the water, pale shapes lie in rows.',
    gm: 'The famine dead: people who died in the Hungry Year before the bargain, sunk in the mere because the ground was too hard to dig. They rise when anyone steps off the stones or splashes through the drowned stretch. A child\'s counting rhyme (Dorrit or Agnetha knows it: "step on the grey, keep the dead away") lets a careful group cross silently: group DC 13 Stealth. Wading the drowned stretch is difficult ground.',
  });
  b.cave('The briar wood', 61, 63, 10, 8, {
    seed: 97, mat: 'grass',
    read: 'The lane dives into a wood of blackthorn and bramble so thick the moon cannot get in. The thorns are long as fingers. Small things are caught on them: a mitten, a feather, a scrap of lace.',
    gm: 'The long way round to the east of the carr. The thorns are difficult ground and tear at anyone who hurries (1d4 slashing per round of running). Little Dimity uses this path to visit the mill; her small bare footprints are everywhere (DC 12 Survival). A hollow stump to the east holds the village\'s old offerings.',
  });
  b.cave('The offering stump', 74, 73, 4.5, 4, {
    seed: 103, mat: 'grass',
    read: 'A huge hollow stump in a small clearing, its mouth stuffed with gifts: coins, ribbons, a pair of baby shoes, a cake gone green.',
    gm: 'For seven years Thimbleby folk have left gifts here "for the Aunts", hoping to be remembered kindly. Nobody has collected. A DC 13 Perception notices that the newest gift, a jar of honey, has Agnetha\'s name on it. Taking the gifts angers nobody; giving them back to the village wins a lot of friends. Inside: 180 gp in mixed coin, a silver sickle (40 gp) and a potion of greater healing someone left "for the Aunts\' health".',
  });
  b.cave("Dimity's grove", 66, 36, 9, 7.5, {
    seed: 107, mat: 'grass',
    read: 'A grove around one enormous dead oak. Up in its arms sits a little house with a pointed roof, painted pink, with lanterns and wind-chimes made of spoons. Dolls hang from the lower branches by their necks, swinging gently. A child\'s voice sings up above, sweet and slightly wrong.',
    gm: 'Little Dimity, the youngest hag, lives here with four giant spiders she calls her "aunties". She plays at being a little girl and is childish and cruel by turns. She will not fight a guest who plays her game (see the scene). She wants a sister of her own and has decided Clemmie is it. She does not know that Grandam means Clemmie to replace her.',
  });
  b.cave("Sister Primrose's mirror cave", 68, 12, 8.5, 6, {
    seed: 117, mat: 'cave-floor',
    read: 'A cave lined with mirrors: hand mirrors, gilt mirrors, mirrors of polished silver and black water. In every one of them, you are standing somewhere else, doing something else. A tall, beautiful woman steps out of the largest mirror and smiles at you with too many teeth.',
    gm: 'Sister Primrose, the middle hag (green hag). She keeps the reflections of everyone who has ever looked into her mirrors too long, and she can send them out: three of her reflections are doppelgangers wearing the faces of earlier visitors, and five shadows lie in the corners. She is vain, bored and ambitious. She wants to be eldest. She will deal before she fights.',
  });

  // ================= TRAILS between them =================
  b.floor(0, 72, 19, 2, 'dirt');
  keepRect(0, 72, 19, 2);
  trail([[8, 55], [7, 59], [8, 63]], 3, 'dirt', 31);                 // village to eel pool
  trail([[9, 38], [8, 42]], 3, 'dirt', 83, 1);                         // churchyard to eel pool
  trail([[20, 17], [20, 21], [18, 25]], 2, 'dirt', 81, 1);             // orchard to churchyard
  trail([[25, 10], [29, 8], [33, 9]], 3, 'dirt', 73);                  // orchard to cauldron
  trail([[38, 21], [39, 18], [41, 16]], 3, 'dirt', 63, 1);             // bog to cauldron
  trail([[41, 36], [41, 40]], 2, 'dirt', 57, 0);                       // bog to cottage back door
  trail([[37, 37], [34, 40]], 3, 'dirt', 59, 0);                       // bog to garden gate
  trail([[37, 74], [44, 75], [52, 70]], 3, 'dirt', 91);                // mill yard to briar wood
  trail([[49, 59], [53, 61]], 2, 'mud', 93, 0);                        // causeway to briar wood
  trail([[64, 55], [65, 49], [66, 43]], 3, 'dirt', 99);                // briar wood to grove
  trail([[65, 66], [69, 69], [73, 72]], 2, 'dirt', 101, 0);            // briar wood to offering stump
  trail([[28, 44], [33, 45]], 2, 'dirt', 103, 0);                      // alder carr to the garden
  trail([[67, 29], [68, 23], [68, 18]], 2, 'dirt', 113, 1);            // grove up the bluff to the mirror cave
  trail([[51, 8], [55, 7], [60, 9]], 3, 'stone-cobble', 109, 0);       // the glass path
  trail([[56, 9], [57, 17], [59, 24], [61, 30]], 2, 'dirt', 111, 1);   // the fox's path

  // ================= THIMBLEBY: the village edge (south-west) =================
  b.start(1, 72, 3, 2);
  b.building("Widow Coldwater's cottage", 2, 63, 6, 5, {
    mat: 'wood-planks',
    read: 'A neat, cold cottage. On the table, seven harvest loaves stand in a row, each one uneaten and gone hard as wood. A woman in black sits beside them with a candle and a piece of paper she has folded and unfolded until it is soft as cloth.',
    gm: 'Agnetha Coldwater, once reeve, made the bargain. She wrote down the exact words that night so she would never pretend to forget them (handout). She has never eaten bread from the fat harvests. She gives the heroes her savings (300 gp) and the paper. A DC 13 Insight: she means to walk into the carr at midnight and offer herself instead. That will not work, and she half knows it.',
    doors: [[4, 67, 's', 'closed']],
    windows: [[2, 65, 'w'], [7, 65, 'e']],
  });
  keepRect(2, 63, 6, 5);
  b.prop('table-round', 4, 65).prop('bread-rack', 3, 64).prop('candles', 5, 65).prop('fireplace', 6, 64).prop('rocking-chair', 3, 66).prop('chest', 6, 66).light(5, 65, 5, 15);
  b.building('Thimbleby chapel', 10, 75, 6, 4, {
    mat: 'stone-flagstone',
    read: 'A tiny chapel, the door wedged open. Inside, every candle in the village is burning, and an old man is praying in a loud, cross voice.',
    gm: 'Since Father Ambrey drowned, Thimbleby has had no priest. Old Sexton Hobday keeps the chapel and the parish chest, and the parish chest holds the birth roll: a DC 10 Investigation finds this spring\'s first entry, in a shaky hand, "Button, a kid, to the mill goat, first light of spring". Useful proof at the Supper.',
    doors: [[12, 75, 'n', 'open']],
    windows: [[10, 77, 'w'], [15, 77, 'e']],
  });
  keepRect(10, 75, 6, 4);
  b.prop('altar', 12, 77).props_('pew', [[11, 76], [14, 76]]).prop('candle-ring', 13, 77).prop('chest', 15, 78).light(12, 77, 10, 15, '#ffd27a');
  b.prop('well', 9, 69).prop('banner-pole', 12, 68).prop('signpost', 16, 71).prop('stocks', 5, 75).prop('lamp-post', 13, 73).prop('road-shrine', 9, 64).prop('horse-trough', 7, 71).prop('handcart', 8, 75).props_('fence-wood', [[1, 70], [3, 70]]).prop('chicken-coop', 3, 77);
  b.light(13, 73, 15, 20).light(9, 64, 5, 10, '#ffd27a');
  scatter(['tree-oak', 'bush', 'hedge', 'flowers', 'stump', 'beehive'], 22, 0, 61, 19, 19);

  // ================= THE BROOK and the mill =================
  const brook: [number, number][] = [[13, 53], [16, 57], [19, 61], [20, 66], [20, 72], [21, 79]];
  walk(brook, (x, y) => b.water(x - 1, y - 1, 3, 3, false));
  walk(brook.slice(2), (x, y) => b.water(x, y, 1, 1, true));
  b.water(22, 62, 1, 7, true); // the mill-race
  path([[17, 72], [24, 72]], 2, 'wood-planks');
  b.area('Thimble brook', [[17, 56, 6, 23]], {
    read: 'The brook runs quick and brown out of the carr, under the plank bridge and past the mill. Things bump against the piles in the dark: sticks, mostly.',
    gm: 'Deep in the middle (swim, DC 12 Athletics in armour). The plank bridge on the lane is the easy crossing; the stepping stones below the eel pool are the other (DC 11 Acrobatics or fall in).',
    label: [20, 68],
  });
  b.props_('rapids', [[21, 64], [21, 66]]).prop('bridge-plank', 20, 72, 90).prop('debris-wood', 21, 76).props_('boulder', [[14, 55], [16, 57]]);

  b.building('Orme mill', 23, 61, 10, 9, {
    mat: 'wood-planks',
    read: 'The mill shudders as the wheel turns in the race. Flour dust hangs in the lamplight. Through the inner door, a small girl in a nightdress sits up in bed, wide awake, talking happily to a doll made of reeds.',
    gm: 'Wilkin Orme the miller and his daughter Clemmie, seven years old today. Clemmie has a "new friend from the marsh, Dimmy" who visits at the window and says she will be her sister soon (Little Dimity in a child\'s shape). The reed doll is a gift from Dimity: a DC 13 Arcana finds a faint charm on it so Dimity can see through its eyes. Throwing it in the brook blinds her. At midnight, whatever anyone does, Clemmie will rise in her sleep and walk to the cauldron (see the midnight clock).',
    doors: [[25, 69, 's', 'closed', 'door-double'], [26, 69, 's', 'closed', 'door-double'], [32, 66, 'e', 'closed']],
    windows: [[23, 64, 'w'], [30, 61, 'n'], [32, 63, 'e']],
  });
  b.wallRun(28, 61, 9, 'w').door(28, 65, 'w', 'open');
  keepRect(23, 61, 10, 9);
  b.props_('grindstone', [[24, 63], [26, 63]]).prop('winch', 24, 66).props_('flour-sacks', [[27, 62], [27, 67]]).prop('scales', 25, 68).prop('stairs-up', 23, 62).prop('lantern-hanging', 25, 65);
  b.prop('bed', 30, 62).prop('crib', 29, 67).prop('kitchen-table', 31, 65).prop('stool', 30, 65).prop('fireplace', 32, 62).prop('dresser', 29, 62).prop('candles', 31, 64);
  b.light(25, 65, 10, 15).light(31, 64, 5, 15, '#ffcf80');
  b.building('Goat byre', 33, 64, 5, 5, {
    mat: 'dirt',
    gm: 'Nanny goat Hepzie and Button the kid, with straw and a milk churn. Button is very small, very white and very bold. The byre opens into the mill kitchen and onto the yard.',
    doors: [[35, 68, 's', 'open']],
  });
  keepRect(33, 64, 5, 5);
  b.props_('hay-bale', [[34, 65], [36, 65]]).prop('milk-churn', 34, 67).prop('water-trough', 36, 67);
  b.floor(23, 70, 15, 7, 'dirt').floor(33, 69, 5, 1, 'dirt');
  b.area('Mill yard', [[23, 70, 15, 7]], {
    read: 'A rutted yard behind the mill. A nanny goat bleats in a byre with a little white kid pressed against her side. Hanging from the mill door by a bone pin is a square of yellowed skin, written on in brown ink.',
    gm: 'The invitation (handout) appeared at sunset. The kid is Button, born at the first light of the first day of spring: Wilkin will mention it proudly if asked about the spring, or a DC 14 Insight helps the heroes think to ask. Button was the first thing born in Thimbleby this spring, which matters for the wording of the bargain. At moonrise the coven\'s wolves come to the yard to "count the household".',
    label: [29, 73],
  });
  b.prop('cart', 25, 74, 90).props_('sack', [[28, 71], [29, 71]]).prop('log-pile', 35, 75).prop('hitching-post', 32, 71).prop('lantern-hook', 27, 70).prop('notice-board', 24, 70).prop('puddle', 31, 75);
  b.light(27, 70, 10, 15);
  b.encounter('Wolves at the mill door', [22, 69, 16, 8], [['worg', 6], ['direWolf', 4]], 'low');

  // ================= THE EEL POOL and Dorrit's hut (west) =================
  b.pool(11, 49, 5, 3.5, true);
  b.floor(13, 53, 1, 2, 'stone-cobble');
  b.building("Dorrit's eel hut", 3, 44, 5, 4, {
    mat: 'wood-planks-dark',
    read: 'A hut of tarred planks hung with eel traps, nets and strings of smoked fish. A lantern burns inside. A voice says, quite calmly, "Shut the door, you\'re letting the bog in."',
    gm: 'Dorrit Swale, eel-catcher, the only person in Thimbleby who goes into the carr. Dorrit knows every path, which ones the hags use, and that Little Dimity "leaves the village kids sweets and fishhooks in the same twist of paper". Dorrit trades: help empty three traps (one round in the pool with the eels unless Dorrit whistles first) and Dorrit guides the heroes and gives two flasks of eel-oil (potions of water breathing).',
    doors: [[7, 46, 'e', 'closed']],
    windows: [[5, 44, 'n']],
  });
  keepRect(3, 44, 5, 4);
  b.prop('fishing-net', 4, 45).prop('barrel', 6, 45).prop('straw-bed', 4, 46).prop('herbs-drying', 6, 46).prop('lantern-hanging', 5, 45).light(5, 45, 5, 15);
  b.props_('fishing-gear', [[9, 44], [15, 45]]).prop('canoe', 8, 52, 90).prop('mooring-post', 8, 48).props_('reeds', [[14, 46], [6, 51], [16, 50]]).prop('lily-pads', 12, 48).prop('gm-treasure', 11, 49, 0, { gm: true });
  b.encounter('The eels of the pool', [3, 43, 17, 13], [['giantBogEel', 3]], 'low');
  scatter(['tree-willow', 'reeds', 'grass-tall', 'stump'], 12, 2, 42, 18, 14);

  // the alder carr: wet woods between the pool, the church, the bog and the garden
  b.mud(19, 38, 4, 3).mud(26, 44, 4, 3).mud(22, 46, 3, 2);
  b.pool(23, 41, 2, 1.5).pool(28, 39, 1.6, 1.3);
  b.props_('tree-willow', [[20, 44], [26, 45]]).props_('log-fallen', [[24, 38]]).prop('signpost', 25, 43).prop('cairn', 30, 44);
  scatter(['tree-swamp', 'tree-willow', 'reeds', 'grass-tall', 'mushrooms', 'stump'], 26, 16, 36, 16, 13);

  // ================= THE SUNKEN CAUSEWAY (south middle) =================
  b.mud(33, 52, 18, 13);
  b.pool(37, 54, 3, 2.2, true).pool(46, 60, 3, 2.5, true).pool(37, 61, 2.5, 1.8);
  path([[34, 70], [37, 67], [39, 63], [40, 59], [42, 56], [41, 51]], 2, 'stone-cobble');
  b.water(39, 61, 2, 2, false).water(41, 57, 2, 1, false);
  b.prop('gibbet-post', 46, 55).props_('bones-mud', [[35, 57], [44, 62]]).props_('reeds', [[34, 53], [48, 57], [38, 64]]).prop('skeleton-lying', 45, 63).prop('lantern-standing', 38, 66, 0, { off: true }).prop('milestone', 43, 53).prop('mud-patch', 44, 59);
  b.encounter('The famine dead', [33, 51, 18, 14], [['bloatedMereDead', 2], ['zombie', 7]], 'low');
  scatter(['reeds', 'tree-swamp', 'lily-pads', 'log-fallen'], 16, 33, 51, 18, 14);
  b.light(46, 55, 5, 15, '#9fd0ff');

  // ================= GRANDAM'S GARDEN, the crooked cottage and its cellar (middle) =================
  b.rock(46, 37, 9, 10);
  b.building('The crooked cottage', 37, 41, 9, 7, {
    mat: 'wood-planks-dark',
    read: 'A kitchen, hot as an oven. Copper pots hang from every beam. A table is laid for a party: four places, and one high chair. Something big and pink sits in the corner on a stool far too small, licking a spoon, and slowly stands up.',
    gm: 'Dumpling the ogre, Grandam\'s "grandson", guards the house with a living kitchen: two rugs that wrap and smother and a rack of knives that fly. The rugs and knives wake if anyone touches the food or the shelves. Dumpling would rather eat than fight: a sweet thing (honey, cake, sugar) buys a round of peace each, and humming the Thimbleby lullaby stops him cold (see Dumpling). Grandam\'s recipe book lies open on the lectern (handout). The larder door leads down to the cellar.',
    doors: [[41, 47, 's', 'closed'], [41, 41, 'n', 'closed'], [45, 42, 'e', 'closed']],
    windows: [[37, 44, 'w'], [39, 47, 's'], [43, 41, 'n']],
  });
  keepRect(37, 41, 9, 7);
  b.prop('hearth-oven', 38, 42).prop('table-feast', 41, 44, 90).props_('chair-high-back', [[40, 43], [42, 43], [40, 45]]).prop('stool-bar', 42, 45).prop('pot-rack', 44, 43).prop('shelf-jars', 39, 46).prop('bread-rack', 44, 46).prop('rug-round', 38, 45).prop('butcher-block', 43, 46).prop('stairs-down', 44, 42).prop('lectern', 38, 46).prop('cauldron', 38, 43);
  b.light(38, 42, 15, 20, '#ff9a4a');
  b.props_('mushroom-giant', [[34, 45], [36, 49]]).props_('crop-rows', [[35, 47], [44, 50]]).props_('flowers', [[38, 50], [43, 49]]).prop('scarecrow', 34, 43).props_('fence-wood', [[38, 49], [40, 49]]).prop('fence-gate', 41, 49).prop('beehive', 45, 49).prop('bone-heap', 35, 41);
  b.encounter('The hungry kitchen', [37, 41, 9, 7], [['ogre', 1], ['rugOfSmothering', 2], ['flyingSword', 4]], 'low');

  b.floor(46, 42, 1, 1, 'dungeon-slab');
  b.room('Cottage cellar', 47, 40, 6, 5, {
    mat: 'dungeon-slab',
    read: 'Steps down into cold. Jars line the walls: pickled things, things in honey, things that blink. In the middle, in a rocking cradle, lies a doll the size of a newborn, made of grey bread, with a braid of hair for a spine. It is breathing.',
    gm: 'The Bargain Doll: the contract itself. Its spine is a braid of four locks of hair (Agnetha\'s, and one from each hag) tied in seven knots; six hang loose, the seventh is tight. Whoever holds the doll at midnight holds the bargain. It cannot be harmed anywhere but in the coven\'s own cauldron fire; elsewhere it heals at once and screams. If a hag pulls her own lock from the braid, the knot loosens; with two locks gone any blade can cut it. A DC 15 Investigation of the north wall finds a hidden door behind the pickle shelves.',
  });
  b.door(46, 42, 'e', 'open');
  b.prop('stairs-up', 47, 42).prop('crib', 50, 42).props_('shelf-jars', [[48, 40], [52, 40], [52, 43]]).prop('potion-shelf', 48, 44).prop('barrel', 52, 41).prop('cobweb-corner', 47, 40).prop('gm-secret-door', 50, 40, 0, { gm: true }).prop('gm-treasure', 48, 44, 0, { gm: true });
  b.light(50, 42, 5, 10, '#d8c8a0');
  b.door(50, 40, 'n', 'secret');
  // the root tunnel from the cellar up to the cauldron (one square wide, kept apart from the bog)
  path([[50, 39], [51, 36], [52, 30], [51, 23], [49, 19], [48, 17], [47, 14]], 1, 'cave-floor');
  b.area('The root tunnel', [[51, 22, 2, 15]], {
    read: 'A tunnel only one person wide, roofed with roots. Small bones are pressed into the clay walls in patterns, like decorations on a cake.',
    gm: 'Grandam\'s private way from her cellar to the cauldron clearing. It comes out under a flat stone beside the standing stones (a hidden hatch, DC 15 Perception to spot from above). Coming this way lets the heroes start the climax with surprise, or reach the cauldron while the coven is busy at the table.',
    label: [52, 28],
  });
  b.prop('bones', 52, 30).prop('glowing-fungus', 52, 27).prop('mine-support', 50, 38);
  b.door(48, 17, 'n', 'secret').prop('trapdoor', 48, 17); // the hidden hatch under the flat stone by the standing stones

  // ================= THE WISP BOG (centre) =================
  b.mud(25, 21, 23, 17);
  b.pool(30, 26, 3, 2, true).pool(43, 26, 2.5, 2, true).pool(41, 32, 3, 2).pool(31, 33, 2, 1.5).pool(36, 24, 1.6, 1.2);
  path([[26, 30], [31, 30], [35, 28], [38, 29], [40, 27], [39, 23], [38, 21]], 1, 'wood-planks');
  path([[38, 29], [37, 33], [41, 36]], 1, 'wood-planks');
  b.props_('tree-dead', [[28, 24], [45, 30], [33, 34]]).props_('light-orb', [[30, 26], [43, 26], [41, 32]]).prop('skeleton-lying', 45, 28).prop('backpack', 44, 29).prop('quicksand', 33, 26).prop('obscuring-cloud', 36, 31);
  b.light(30, 26, 10, 20, '#8fc8ff').light(43, 26, 10, 20, '#8fc8ff').light(41, 32, 10, 20, '#8fc8ff');
  b.encounter('The bog lights', [25, 21, 22, 16], [['willOWisp', 4], ['shamblingMound', 1]], 'moderate');
  scatter(['reeds', 'tree-swamp', 'grass-tall', 'lily-pads', 'mud-patch'], 26, 25, 21, 23, 17);

  // ================= THE CAULDRON CLEARING (north, the climax) =================
  b.paint(38, 8, 9, 5, 'dirt');
  b.prop('cauldron', 42, 10).prop('burning-ground', 42, 11).props_('standing-stone', [[36, 8], [38, 5], [42, 5], [46, 5], [48, 9], [46, 14], [38, 14]]).prop('table-feast', 42, 7, 90).props_('chair-high-back', [[40, 6], [44, 6], [40, 8], [44, 8]]).prop('throne', 46, 7).prop('candle-ring', 42, 12).prop('magic-circle', 42, 10).prop('bone-heap', 36, 11).prop('skull-pile', 48, 11).prop('herbs-drying', 39, 13).prop('gm-treasure', 46, 8, 0, { gm: true });
  b.light(42, 10, 20, 30, '#7dff8a').light(42, 7, 10, 15, '#9fd0ff');
  b.encounter('The Reckoning Supper', [33, 4, 19, 13], [['nightHag', 1], ['troll', 1], ['willOWisp', 3]], 'high');
  scatter(['tree-oak', 'tree-dead', 'bush', 'ferns'], 12, 32, 2, 21, 16);

  // ================= THE BONE ORCHARD (north-west) =================
  b.building("The gardeners' shed", 7, 6, 5, 4, {
    mat: 'wood-planks-dark',
    gm: 'Ghoul gardeners sleep here in the day. Tools, sacks of bone meal, and a ledger of who paid what (DC 12 Investigation: the "Thimbleby" page lists seven harvests "PAID", one line, "FIRSTBORN, 7TH SPRING", not yet ticked, and, sixty years back, "ABNER MERRIWETHER, A BOY, PAID").',
    doors: [[11, 8, 'e', 'closed']],
  });
  keepRect(7, 6, 5, 4);
  b.prop('tool-wall', 8, 6).props_('sack', [[8, 8], [9, 8]]).prop('workbench', 10, 7);
  b.props_('tree-dead', [[14, 6], [18, 6], [22, 6], [14, 10], [18, 10], [22, 10], [14, 14], [18, 14], [10, 13]]).prop('tree-birch', 21, 15).props_('bones', [[16, 8], [20, 12]]).prop('open-grave', 12, 16).prop('skull-pile', 17, 16).prop('chains-hanging', 16, 12).prop('cage-hanging', 20, 8).prop('handcart', 9, 11).prop('gm-treasure', 16, 12, 0, { gm: true });
  b.light(21, 15, 5, 10, '#fff2a8');
  b.encounter('The orchard wakes', [5, 4, 21, 15], [['awakenedTree', 4], ['ghast', 2], ['ghoul', 3]], 'moderate');

  // ================= THE DROWNED CHURCH (west) =================
  b.pool(11, 33, 8, 6);
  b.rock(1, 19, 8, 5);
  b.building('Drowned church', 7, 27, 8, 11, {
    mat: 'stone-flagstone',
    read: 'Pews in rows, water to the seat-backs. In every pew sit grey people with their hands folded, heads bowed, hair floating. A hymn book drifts past you, open.',
    gm: 'The drowned congregation: four specters and a wight who was the churchwarden and sold the church to the coven for a fat purse. They rise when anyone reaches the altar or when the bell is rung, unless Father Ambrey has been spoken to first. Father Ambrey\'s parish book on the lectern lists the drowned by name (handout), including the souls in the wisp bog.',
    doors: [[7, 33, 'w', 'open', 'door-double'], [14, 31, 'e', 'closed']],
    windows: [[7, 29, 'w'], [14, 35, 'e'], [9, 37, 's'], [12, 37, 's']],
  });
  keepRect(7, 27, 8, 11);
  b.water(8, 31, 6, 6, false);
  b.props_('pew', [[9, 32], [12, 32], [9, 34], [12, 34], [9, 36], [12, 36]]).prop('altar', 10, 28).prop('lectern-dais', 12, 29).props_('candle-stand-tall', [[8, 28], [13, 28]]).prop('window-stained-tall', 10, 37).prop('font', 8, 30);
  b.light(10, 28, 10, 15, '#a8c8ff');
  b.encounter('The drowned congregation', [7, 27, 8, 11], [['specter', 4], ['wight', 1]], 'low');
  b.building('Bell tower', 9, 23, 4, 4, {
    mat: 'stone-flagstone',
    read: 'A narrow stair winds up into the dark. At the top, a bronze bell hangs, green with age, its clapper tied with a hag\'s red thread.',
    gm: 'Father Ambrey\'s ghost waits here, unable to leave until the bell rings once more. Cutting the red thread and ringing it (DC 12 Athletics to reach) wakes the congregation below, but it also breaks every glamour in the carr for an hour: Primrose\'s mirrors go dark, Dimity looks like what she is, and Grandam cannot hide her true shape. The bell is heard at the Supper. Behind a loose stone in the west wall (DC 14 Perception) is the old crypt.',
    doors: [[10, 26, 's', 'closed']],
  });
  keepRect(9, 23, 4, 4);
  b.prop('stair-spiral', 11, 24).prop('temple-bell', 10, 24).prop('cobweb-corner', 9, 23);
  b.light(10, 24, 5, 10, '#c8d8ff');
  b.rock(13, 23, 3, 4);
  b.floor(8, 22, 1, 3, 'dungeon-slab');
  b.door(9, 24, 'w', 'secret');
  b.room('Flooded crypt', 3, 20, 5, 3, {
    mat: 'dungeon-slab',
    read: 'A low crypt, ankle deep in water. A stone priest lies on the lid of a tomb with his hands crossed over a silver bell-clapper.',
    gm: 'Father Ambrey\'s tomb. The silver clapper (a holy symbol) and a box of church plate are here. The water here is clean: blessed by any cleric or paladin, it fills four flasks of holy water.',
  });
  b.prop('sarcophagus-effigy', 5, 21).prop('reliquary', 3, 20).prop('chalices', 7, 20).prop('puddle', 4, 22).prop('gm-treasure', 3, 21, 0, { gm: true });
  path([[15, 31], [20, 31], [25, 30]], 1, 'wood-planks');
  b.prop('bridge-plank', 20, 31, 90);

  // ================= THE BRIAR WOOD (south-east) =================
  b.rubble(54, 60, 3, 3).rubble(62, 66, 4, 2).rubble(57, 68, 3, 2).rubble(64, 58, 2, 3).rubble(67, 61, 2, 2);
  b.props_('thorn-bush', [[55, 61], [63, 66], [58, 69], [64, 59]]).props_('brambles', [[53, 64], [67, 62], [60, 68], [56, 66]]).prop('log-fallen', 60, 62).prop('stump', 66, 67).prop('gibbet-post', 61, 59);
  scatter(['thorn-bush', 'brambles', 'tree-oak', 'bush', 'ferns'], 24, 51, 55, 21, 17);
  b.prop('stump', 74, 72).props_('offering-bowl', [[72, 73], [76, 73]]).prop('candles', 73, 75).prop('flowers', 75, 71).prop('gm-treasure', 74, 73, 0, { gm: true });
  b.light(73, 75, 5, 10);

  // ================= DIMITY'S GROVE and the treehouse (east) =================
  b.building("Dimity's treehouse", 63, 31, 7, 5, {
    mat: 'wood-planks',
    read: 'Inside, everything is small. Tiny chairs, tiny cups, a tea party for dolls with real tea, still warm. A cradle by the window holds a cat, wearing a bonnet, looking furious.',
    gm: 'Dimity\'s playroom, up in the oak. Her toy chest holds her treasure. On the wall she has drawn, in charcoal, three hags and a little girl, holding hands. Grandam\'s figure has been scribbled over hard.',
    doors: [[66, 35, 's', 'closed']],
    windows: [[63, 33, 'w'], [69, 33, 'e'], [66, 31, 'n']],
  });
  keepRect(63, 31, 7, 5);
  b.prop('table-round', 66, 33).props_('stool', [[65, 33], [67, 33], [66, 32]]).prop('crib', 64, 32).prop('footlocker', 68, 34).prop('rocking-chair', 68, 32).prop('lantern-hanging', 66, 34).prop('hammock', 64, 34).prop('gm-treasure', 68, 34, 0, { gm: true });
  b.light(66, 34, 10, 15, '#ffb0d8');
  b.prop('ladder', 66, 36).prop('tree-oak', 62, 38).props_('cage-hanging', [[60, 35], [72, 36]]).props_('spider-web', [[61, 32], [71, 39], [69, 40]]).prop('lantern-cluster', 69, 37).prop('rug-pelt', 64, 39);
  b.light(69, 37, 10, 20, '#ffb0d8');
  b.encounter("Dimity's aunties", [58, 29, 17, 14], [['greenHag', 1], ['giantSpider', 4]], 'low');
  scatter(['tree-dead', 'ferns', 'mushrooms', 'bush'], 14, 57, 28, 18, 16);

  // ================= SISTER PRIMROSE'S MIRROR CAVE (north-east) =================
  b.area('The glass path', [[51, 6, 9, 4]], {
    read: 'The path from the clearing is paved with broken mirror, sharp edges up and pressed into the earth. Every shard shows a different moon.',
    gm: 'Walking it barefoot is a bad idea. Looking down, each hero sees themself a little older, a little younger or a little crueller. Harmless, unless they stare (DC 12 Wisdom save or stand and stare for a round).',
    label: [55, 8],
  });
  b.area("The fox's path", [[56, 12, 3, 14]], {
    gm: 'A narrow deer track from the glass path down to Dimity\'s grove, going round the mirror cave. Dimity runs this way to fetch her sisters.',
    label: [57, 18],
  });
  b.prop('stairs-up', 68, 24).prop('crumbling-ledge', 68, 21);
  b.props_('magic-mirror', [[63, 10], [66, 8], [71, 8], [74, 12], [72, 16], [64, 15]]).prop('mirror', 68, 10).prop('dresser-mirror', 70, 15).prop('vanity', 65, 12).prop('crystal-cluster', 62, 12).props_('candelabra', [[67, 14], [73, 10]]).prop('rug', 68, 13);
  b.light(67, 14, 10, 20, '#f0e6ff').light(73, 10, 10, 15, '#f0e6ff');
  b.encounter('The hall of mirrors', [61, 7, 15, 11], [['greenHag', 1], ['doppelganger', 3], ['shadow', 5]], 'moderate');
  b.rock(70, 0, 10, 5);
  b.hall(74, 4, 72, 8, 1, { mat: 'cave-floor', downFirst: true });
  b.room('The vanity', 73, 1, 5, 3, {
    mat: 'marble',
    read: 'A small, bright room behind the biggest mirror. Bottles stand in rows on velvet: each one holds a face, pressed flat like a flower.',
    gm: 'Primrose\'s real treasure. Every bottle is a stolen reflection. Breaking one returns the face to its owner, wherever they are (Agnetha\'s is here: she has not seen herself in a mirror for seven years, and thought it was guilt). Primrose will do almost anything to stop the heroes smashing the lot.',
  });
  b.door(74, 3, 's', 'secret');
  b.prop('display-case', 74, 1).prop('jewelry-box', 76, 2).prop('potion-rack', 73, 2).prop('dresser-tall', 77, 1).prop('gm-treasure', 76, 2, 0, { gm: true }).prop('gm-secret-door', 74, 4, 0, { gm: true });
  b.light(75, 2, 5, 10, '#fff0f8');

  b.note(48, 17, 'Hidden hatch: the root tunnel from the cottage cellar comes up here.');
  b.note(41, 57, 'The drowned stretch of the causeway: wading wakes the famine dead.');
  return b.build();
}

export const HAGS_BARGAIN: Adventure = {
  id: 'hags-bargain',
  title: "The Hags' Bargain",
  tagline: 'Seven years ago a starving village promised a coven of hags "the firstborn of the seventh spring". Tonight the miller\'s daughter turns seven.',
  levels: '6',
  sessions: '1 session (4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'fairy tale', 'hags', 'marsh', 'bargain'],
  pitch:
    'Seven springs ago, in the Hungry Year, the village of Thimbleby ate its seed corn, then its dogs, then its boots. Then the reeve walked into Grimsallow Carr, the black marsh-wood beyond the brook, and came back with a promise of seven good harvests. They came. Every one. Tonight is the first night of the seventh spring, and a square of skin has been pinned to the mill door with a bone, inviting the miller\'s household to supper. His daughter Clemmie turned seven this morning. You have until midnight.',
  secret:
    'The reeve, Agnetha Coldwater, bargained with a coven of three hags: Grandam Treacle (a night hag, eldest), Sister Primrose (a green hag, middle) and Little Dimity (a green hag, youngest). The price was "the firstborn of the seventh spring". The coven holds the bargain as a living thing, the Bargain Doll, a breathing doll of bread whose spine is a braid of hair from Agnetha and each hag, tied in seven knots; six have come loose, one a spring. At midnight the seventh knot pulls tight and the child walks to the cauldron in her sleep, and no lock or rope can stop her. Each hag wants something different. Grandam wants Clemmie to raise as a new youngest sister, because Dimity has "gone soft", and she means to turn Dimity into a toad in a jar. Primrose wants to be eldest and would sell Grandam out for it. Dimity wants a sister, and has no idea she is about to be replaced. The loophole: the words never said "child". The first thing born in Thimbleby this spring was a goat kid.',
  hooks: [
    'Agnetha Coldwater, the widow who made the bargain, sends for heroes with her whole savings (300 gp) and a letter that says only: "I sold a child. Please help me buy her back."',
    'Wilkin Orme the miller has barred his doors and sharpened his scythe, and the village elders, ashamed, quietly hire the heroes to do what they would not.',
    'A hero once struck a small bargain of their own with a hag (a lost name, a borrowed year); a twist of paper arrives with a sugared almond and an invitation to the Reckoning Supper "as a guest of the house".',
  ],
  tips: [
    'Run a midnight clock. The heroes arrive at dusk with about six hours. A fight or a long scene costs an hour; crossing the carr costs half an hour. At midnight Clemmie rises and walks to the cauldron along the causeway and the bog, and nothing short of a wall of force stops her. That is not the end: the heroes can still win at the Supper.',
    'There are many ways to break the bargain, and any of them is a win: burn the Doll in the coven\'s own cauldron; get all three hags to pull their hair from the braid (or two, and cut it); win a wager with Grandam; or argue the letter of the bargain with Button the goat kid. Reward clever and kind ideas. The hags respect wit, even when it costs them.',
    'Hags are funny before they are frightening. Grandam treats everything as a recipe, Primrose fishes for compliments, Dimity is a spoiled child with a jar of spiders. Let them be charming, then let the cruelty slip out.',
    'Turning the hags is the heart of the night. Dimity turns if she learns Grandam\'s plan for her (the recipe book in the cottage). Primrose turns for a promise to help make her eldest, or to save her vanity of stolen faces. Either one can pull her lock from the braid.',
    'The Reckoning Supper is high difficulty with only Grandam, her troll and her wisps. If Primrose or Dimity are still loyal and unharmed, they join on the third round: drop the wisps when they do, or the fight gets deadly. A turned sister fights on the heroes\' side.',
    'Short on time? Cut the drowned church and the bone orchard, and let Dorrit Swale tell the heroes about hag-law on the causeway.',
  ],
  npcs: [
    {
      id: 'pf_hgbtreacle', name: 'Grandam Treacle', title: 'eldest of the coven', kind: 'monster', art: 'night-hag', monsterId: 'nightHag',
      wants: 'Clemmie, to raise as a new youngest sister. A coven needs three, and Dimity has gone soft: Grandam has the toad jar ready for her.',
      knows: 'Every word of the bargain, and every loophole she would use if she were on the other side. That she must take up any fair wager offered at her table.',
      voice: 'Warm and sticky, like a favourite aunt at a wedding. Calls everyone "my pudding" and "my lamb". Talks about people as ingredients.',
      appearance: 'A plump old woman in a lace cap and a floury apron, with rosy cheeks and small black eyes. Her true shape, under the glamour, is blue-black and thin as a stick.',
      backstory: 'She has kept the coven for three hundred years by eating its youngest whenever one grew a conscience. Dimity is the fourth "Little" sister.',
      gmNotes: 'Night hag stat block. She sits at the head of the Supper and fights only if the rules of hospitality are broken. She never refuses a wager offered at her table and keeps every bargain to the letter. At a quarter of her hit points she offers terms: the Doll for her life. If the bell of the drowned church has rung, she cannot hide her true shape.',
    },
    {
      id: 'pf_hgbprimrose', name: 'Sister Primrose', title: 'middle of the coven', kind: 'monster', art: 'green-hag', monsterId: 'greenHag',
      wants: 'To be eldest. To be adored. Her vanity of stolen faces kept safe.',
      knows: 'That the Doll sleeps in Grandam\'s cellar and the root tunnel runs from there to the cauldron. That Grandam has a toad jar labelled DIMITY.',
      voice: 'Silky and bored, with a long sigh before every answer. Never finishes a compliment to anyone else.',
      appearance: 'Under her glamour: tall, golden-haired and very beautiful, with a smile slightly too wide. In truth: green, warty and patched with lichen, with eyes like wet stones.',
      gmNotes: 'Green hag stat block. Her price for pulling her lock from the braid: a hero\'s reflection (they cast none and have disadvantage on Charisma checks until it is given back), or a sworn promise to help make her eldest. Threatening her vanity of faces also works. If the heroes betray her, she remembers.',
    },
    {
      id: 'pf_hgbdimity', name: 'Little Dimity', title: 'youngest of the coven', kind: 'monster', art: 'young-witch', monsterId: 'greenHag', shared: true,
      wants: 'A sister. Someone to play with who won\'t die. Not to be the baby any more.',
      knows: 'Every path in the carr, and Clemmie\'s favourite colour, song and fear. Not that Grandam means to replace her.',
      voice: 'A little girl\'s voice that slides into an old woman\'s when she is cross. Giggles. Asks "why?" until it is unbearable.',
      appearance: 'Looks like a girl of nine with a gap in her teeth, a pinafore and bare feet. Her shadow is the wrong size. In truth she is a small green hag with moss in her hair.',
      backstory: 'Taken from a village like Thimbleby two hundred years ago and raised as a hag. She does not remember that, but she still has a lullaby she cannot stop humming.',
      gmNotes: 'Green hag stat block. She has been visiting Clemmie at the window as "Dimmy". Show her the recipe book (handout) and she goes white, then furious: she pulls her lock from the braid and wants revenge. If the bargain is settled with Button, she happily adopts the goat as her sister.',
    },
    {
      id: 'pf_hgbdumpling', name: 'Dumpling', title: "Grandam's 'grandson'", kind: 'monster', art: 'ogre', monsterId: 'ogre',
      wants: 'Something sweet. To be good so Grandam won\'t be cross.',
      knows: 'Where the Doll sleeps, the root tunnel, and that "there was another Little before Dimity, and Grandam put her in the pie".',
      voice: 'Slow and gentle, like a big child. Says "please" and "thank you" very carefully, as if he will be tested.',
      appearance: 'An enormous pink ogre in a baby\'s bonnet and a pinafore made of a sail, with a wooden spoon in one fist.',
      backstory: 'Once Abner Merriwether, a Thimbleby boy given to the coven in a bargain sixty years ago, fattened and changed until he forgot his name.',
      gmNotes: 'Ogre stat block. Each sweet thing buys a round of peace. Humming the Thimbleby lullaby (Agnetha or Wilkin knows it) makes him sit down and cry, and a DC 13 Persuasion then turns him: he carries the Doll for the heroes. Saying his old name (from the bone orchard ledger or Agnetha\'s memory, DC 15 History for a local) frees him from Grandam for good.',
    },
    {
      id: 'pf_hgbagnetha', name: 'Agnetha Coldwater', title: 'the widow who made the bargain', kind: 'npc', art: 'commoner', shared: true,
      wants: 'Clemmie safe, and to pay for what she did herself.',
      knows: 'The exact words of the bargain, the way to the cauldron clearing, the Thimbleby lullaby, and that Grandam "laughed when I said firstborn, as if I\'d made a joke".',
      voice: 'Quiet and flat, very precise, as if she is giving evidence. Never says Clemmie\'s name.',
      appearance: 'A thin woman of sixty in black, with ink on her fingers and seven years of not sleeping under her eyes.',
      backstory: 'Reeve of Thimbleby in the Hungry Year. She buried her own husband that winter and walked into the carr the next morning.',
      gmNotes: 'She means to go into the carr at midnight and offer herself. Grandam would accept her only as an extra. As the one who tied the braid, Agnetha can untie the seventh knot herself if two hags have already pulled their locks.',
    },
    {
      id: 'pf_hgbwilkin', name: 'Wilkin Orme', title: 'the miller', kind: 'npc', art: 'farmer', shared: true,
      wants: 'His daughter. Nothing else in the world.',
      knows: 'That Clemmie has a secret friend called Dimmy, and that Button the kid was born at first light on the first day of spring, "first thing this spring, the first of everything".',
      voice: 'Big, slow and hoarse with fear. Gets angry when frightened, then ashamed of it.',
      appearance: 'A broad man white with flour to the eyebrows, holding a scythe he does not know how to fight with.',
      gmNotes: 'He will try to come along. If he does, he can carry Button. He knows the lullaby his own mother sang, the same one Dumpling remembers.',
    },
    {
      id: 'pf_hgbclemmie', name: 'Clemmie Orme', title: "the miller's daughter, seven today", kind: 'npc', art: 'child', shared: true,
      wants: 'To have a sister. To stay up late. To show everyone Button.',
      knows: 'Dimmy\'s name and her songs. That Dimmy said "Grandam will be your granny too, and she makes pies".',
      voice: 'Bright, bossy and fearless; corrects grown-ups.',
      appearance: 'A small, freckled girl in a nightdress and boots, with flour in her hair and a reed doll under her arm.',
      gmNotes: 'At midnight she rises in her sleep and walks to the cauldron. Anyone who holds her hand can walk with her. She cannot be woken until the bargain is settled.',
    },
    {
      id: 'pf_hgbambrey', name: 'Father Ambrey', title: 'ghost of the drowned priest', kind: 'npc', art: 'ghost', monsterId: 'ghost',
      wants: 'His bell rung once more, and his congregation at rest.',
      knows: 'Hag-law: a hag keeps the letter of a bargain and never the spirit, cannot refuse a fair wager at her own table, and a coven\'s knot needs every sister\'s lock.',
      voice: 'Gentle and very tired. Speaks in the cadence of old sermons. Apologises for the damp.',
      appearance: 'A grey, dripping man in a priest\'s robe, with water running from his sleeves and weed in his tonsure.',
      gmNotes: 'Harmless unless his church is desecrated. He tells the heroes about hag-law and how to ring the bell. When it rings, he and his congregation can finally rest (the specters and the wight still fight first, unless the heroes made peace with him beforehand, in which case only the wight rises).',
    },
    {
      id: 'pf_hgbdorrit', name: 'Dorrit Swale', title: 'eel-catcher of the carr', kind: 'npc', art: 'hunter', monsterId: 'scout', shared: true,
      wants: 'Peace and quiet, a fat eel harvest, and, secretly, someone to finally stand up to the Aunts.',
      knows: 'Every path in the carr, the counting rhyme for the causeway, that Dimity leaves village children sweets, and that the will-o\'-wisps were people once.',
      voice: 'Slow, dry and amused. Never uses two words where none will do.',
      appearance: 'A lean, weathered person in waders and an oilskin hood, a bucket in one hand and an eel spear in the other.',
      gmNotes: 'Scout stat block if it comes to it. Will guide the heroes as far as the garden fence and no further. Calls off the eels with a whistle.',
    },
  ],
  handouts: [
    {
      id: 'bargain-words', title: "Agnetha's paper",
      text: 'Written the night of the bargain, so I can never pretend to forget.\n\nI said: "Give Thimbleby seven good harvests, and you shall have whatever you ask."\nThe old one said: "The firstborn of the seventh spring."\nI said: "Agreed." She laughed.\nThey cut a lock of my hair and plaited it with their own.\n\nGod forgive me, I thought she meant a lamb.\n- A. C.',
    },
    {
      id: 'supper-invite', title: 'Pinned to the mill door',
      text: 'GRANDAM TREACLE & SISTERS\nrequest the pleasure of\nTHE MILLER\'S HOUSEHOLD\nat the Reckoning Supper\nby the cauldron, at the stroke of twelve\non the first night of the seventh spring.\n\nThe little one need not dress.\nShe will be collected.',
    },
    {
      id: 'recipe-book', title: "A page from Grandam's recipe book",
      text: 'A NEW LITTLE SISTER\nOne firstborn of the seventh spring, fresh.\nSteep in moonlight seven years. Feed on honey and fear in equal parts.\nDo not let her love anything she cannot eat.\n\nTOAD-IN-THE-JAR\nOne old Little sister, gone soft.\nDimity is ready. Midnight, after the Supper.\nKeep the lid on tight. She bites.',
    },
    {
      id: 'dimity-note', title: 'A note under Clemmie\'s pillow',
      text: 'DEER CLEMMY\nat midnite you will come to the woods and be my SISTER for ever and ever. we will have tea and the spiders will be yor aunties. dont be scard of Grandam she only eats the bad ones.\nlove from DIMMY\n(burn this)',
    },
    {
      id: 'hag-law', title: "Father Ambrey's last sermon (the parish book)",
      text: 'Brethren, mark three things about the hags of the carr, and do not bargain with them.\nOne: a hag keeps the letter of a promise and never its spirit. Listen to what is SAID, not what is meant.\nTwo: a hag cannot refuse a fair wager offered at her own table, nor cheat at it.\nThree: their covenants are knotted with a lock from every sister. Where one sister will not hold, the knot will not hold.\n\nBelow, in a different ink: the names of forty souls drowned in this church, and eleven more "lost in the bog".',
    },
  ],
  chapters: [
    {
      id: 'carr', title: 'Into Grimsallow Carr', level: 6,
      summary: 'One night in the marsh-wood beyond Thimbleby: the mill, a sunken causeway, a garden that should not bloom, a drowned church, a bone orchard, a bog full of lights, a youngest hag\'s treehouse, a middle hag\'s cave of mirrors and the cauldron clearing where the Reckoning Supper is laid.',
      goal: 'Break the bargain before Clemmie is taken: find the Bargain Doll, turn the hags against each other, or beat Grandam Treacle at her own game.',
      map: grimsallowCarr,
      npcs: [
        { npc: 'pf_hgbagnetha', x: 4, y: 65 },
        { npc: 'pf_hgbwilkin', x: 26, y: 67 },
        { npc: 'pf_hgbclemmie', x: 30, y: 63 },
        { npc: 'pf_hgbdorrit', x: 5, y: 46 },
        { npc: 'pf_hgbdumpling', x: 41, y: 46, hidden: true },
        { npc: 'pf_hgbambrey', x: 11, y: 25, hidden: true },
        { npc: 'pf_hgbdimity', x: 66, y: 33, hidden: true },
        { npc: 'pf_hgbprimrose', x: 68, y: 12, hidden: true },
        { npc: 'pf_hgbtreacle', x: 46, y: 7, hidden: true },
      ],
      scenes: [
        {
          room: "Widow Coldwater's cottage", title: 'Seven loaves',
          read: 'Seven loaves stand in a row on the widow\'s table, hard as stones, one for every fat harvest. She pushes a soft, much-folded paper across to you and does not look up. "I said agreed," she says. "She laughed."',
          gm: 'Agnetha tells the whole story plainly: the Hungry Year, the walk into the carr, the cauldron, the hair. She gives the heroes the paper and her savings. She knows the Thimbleby lullaby and the way to the cauldron clearing, but she will not go in until midnight. Start the midnight clock: about six hours. A DC 15 Insight on the paper\'s wording, or any player reading it twice, can spot that it never says "child".',
          handout: 'bargain-words',
          treasure: "Agnetha's savings: 300 gp in a stocking, and a potion of greater healing she bought \"for whoever goes\".",
        },
        {
          room: 'Orme mill', title: "Clemmie's new friend",
          read: 'Clemmie is sitting up in bed, wide awake and delighted with herself. "Dimmy says I\'m going to be her sister," she tells you. "She says there\'s going to be pie."',
          gm: 'Wilkin is frantic and suspicious of strangers. Clemmie chatters about Dimmy, shows the reed doll and the note under her pillow (handout). The doll is Dimity\'s spy-eye (DC 13 Arcana). Wilkin, asked about the spring, boasts about Button the kid, "the first thing born this spring". The invitation hangs on the door outside.',
          handout: 'dimity-note',
        },
        {
          room: 'Mill yard', title: 'The household is counted',
          read: 'The moon comes up red over the carr, and the wolves come with it: big grey shapes slipping out of the reeds, walking upright for a step or two before they drop to all fours. The largest one sits in the yard and starts, very slowly, to count the windows of the mill.',
          gm: 'Six worgs and four dire wolves, sent to "count the household" for the Supper. The worgs speak, mocking and polite. They will not attack unless the heroes do, or someone tries to take Clemmie out of the mill. A DC 15 Intimidation or Deception (claiming the household is "spoken for") sends them back to the carr; then Grandam knows the heroes are coming. Killing them is fine too; the hags just set more places at the table.',
          encounter: 'Wolves at the mill door',
          handout: 'supper-invite',
        },
        {
          room: 'The sunken causeway', title: 'The famine dead',
          read: 'The grey stones go out across the mere. At the drowned stretch the water rises to your knees, and under it you see faces, rows of them, thin and patient, looking up.',
          gm: 'The quickest way to the garden. Stay on the stones and say the counting rhyme (group DC 13 Stealth) and the dead stay down. Splashing, fighting or stepping off wakes two bloated mere-dead and seven zombies, who were Thimbleby folk. A cleric who speaks a word of rest over them before the fight turns one zombie per hero back to sleep.',
          encounter: 'The famine dead',
          treasure: 'On the dead: 40 gp of old coins and a silver locket (25 gp) with a lock of baby hair, from the Hungry Year.',
        },
        {
          room: 'The eel pool', title: "Dorrit's eels",
          optional: true,
          read: 'A lantern swings out of the alders, held by someone in waders. "Mind the pool," says a dry voice. "They\'re hungry. So am I. Help me with my traps and I\'ll take you in by the dry ways."',
          gm: 'Dorrit Swale offers to guide the heroes through the carr (saving an hour on the clock) for help emptying her eel traps. The three giant eels fight anyone in or at the edge of the pool unless Dorrit whistles them off first. Dorrit knows the causeway rhyme and that Dimity "plays sweet but bites".',
          encounter: 'The eels of the pool',
          treasure: 'Two flasks of eel-oil (potions of water breathing) from Dorrit. In the mud at the bottom of the pool, 15 feet down: a ring of swimming on a long-drowned finger.',
        },
        {
          room: 'The crooked cottage', title: "Grandam's kitchen",
          read: 'The table is laid for four and a high chair. The pots on the stove are bubbling. In the corner, a huge pink figure in a baby\'s bonnet licks a wooden spoon and says, very politely, "Grandam says no visitors."',
          gm: 'Dumpling guards the house with the living kitchen. Sweets, the lullaby or his old name turn him (see Dumpling). The recipe book on the lectern shows Grandam\'s plans (handout): show it to Dimity and she turns. The Doll sleeps in the cellar below; the root tunnel behind the pickle shelves leads straight to the cauldron clearing.',
          encounter: 'The hungry kitchen',
          handout: 'recipe-book',
          treasure: 'In a biscuit tin: 220 gp. In the larder, two jars labelled BROTH (potions of greater healing). In the cellar: the Bargain Doll.',
        },
        {
          room: 'The wisp bog', title: 'Follow the lights',
          read: 'A light bobs ahead of you on the log track, then another to the left, warm and kind as a window at home. One of them whispers your name in your mother\'s voice.',
          gm: 'The direct way from the garden to the cauldron. Four will-o\'-wisps lure travellers into the deep pools, and a shambling mound waits in the deepest. Keeping to the track: DC 14 Survival. Speaking a wisp\'s name from the parish book makes it stop fighting and go out, at peace. The wisps serve the coven but do not love it.',
          encounter: 'The bog lights',
          treasure: 'On a skeleton by the track: a backpack with a wand of web and a map of the carr marked "AVOID THE PINK HOUSE".',
        },
        {
          room: 'Drowned church', title: 'The bell that will not ring',
          optional: true,
          read: 'The congregation sits with folded hands in water to their chests. As you wade up the aisle, every head turns, slowly, to watch you.',
          gm: 'Go up the tower first and Father Ambrey speaks with the heroes: hag-law (handout), the names of the drowned, and how to cut the hag\'s red thread on the bell. Ringing the bell wakes the congregation (four specters and the wight churchwarden) but breaks every glamour in the carr for an hour and gives the dead rest when they fall. Made peace with Ambrey first? Only the wight rises.',
          encounter: 'The drowned congregation',
          handout: 'hag-law',
          treasure: 'In the flooded crypt: a silver bell-clapper (a holy symbol worth 100 gp), church plate worth 150 gp, and a periapt of wound closure on Father Ambrey\'s effigy.',
        },
        {
          room: 'The bone orchard', title: 'What others paid',
          optional: true,
          read: 'The trees click in the wind like counting beads. Teeth, rings, a fiddle, a braid of red hair. At the end of the row, a little white sapling is tied with a yellow ribbon. The ribbon says CLEMMIE.',
          gm: 'The gardeners (four awakened trees, two ghasts, three ghouls) attack anyone who picks fruit or touches the sapling. The shed ledger lists the price, and the name Abner Merriwether against a bargain sixty years ago (Dumpling\'s old name). Uprooting the sapling wounds the coven: every hag has disadvantage on her first saving throw at the Supper.',
          encounter: 'The orchard wakes',
          treasure: 'Hanging among the fruit: a stone of good luck (someone sold their luck), a gold ring (50 gp) and a pouch of gold teeth (90 gp). Returning things to Thimbleby families is worth more in thanks than in coin.',
        },
        {
          room: "Dimity's treehouse", title: "Little Dimity's tea party",
          read: 'A little girl in a pinafore leans out of the pink house in the oak and claps her hands. "Visitors! Come up, come up! But you have to play. If you won\'t play, the aunties will play with you."',
          gm: 'Dimity wants to play a game: tea with the dolls, hide-and-seek in the grove, or "guess what\'s in my hand" (a riddle). Play nicely and she is charmed; cheat or bore her and she sets her four spider "aunties" on the heroes. Show her the recipe book, or convince her Grandam means to replace her (DC 14 Persuasion, or automatic with the book), and she turns: she pulls her lock from the braid (she can do it from anywhere, with a sob), and she will fight at the heroes\' side at the Supper.',
          encounter: "Dimity's aunties",
          treasure: 'Dimity\'s toy chest: a bag of tricks (gray), three pretty stones (moonstones, 50 gp each) and a jar of sugared almonds that are just sugared almonds. If she is befriended she gives one hero her "best thing": a hat of disguise.',
        },
        {
          room: "Sister Primrose's mirror cave", title: 'The middle sister',
          read: 'A tall woman steps out of the largest mirror and looks you over, the way a cook looks over a market stall. "Well," she sighs. "At least someone in this carr has a face worth stealing."',
          gm: 'Primrose bargains first. She wants to be eldest: help her (or swear to help her) and she pulls her lock. She also accepts a hero\'s reflection as payment. If the heroes find the vanity behind the big mirror (DC 15 Perception), threatening her bottles of faces makes her deal on the spot. Fight and she sends three doppelganger reflections and five shadows at them and laughs from inside the glass. Any deal with Primrose is kept to the letter, and she remembers betrayal.',
          encounter: 'The hall of mirrors',
          treasure: 'Silver-backed mirrors worth 400 gp in all (heavy, fragile) and jewellery worth 250 gp. In the vanity: a cloak of elvenkind and the bottled faces; smashing Agnetha\'s gives her back her reflection.',
        },
        {
          room: 'The cauldron clearing', title: 'The Reckoning Supper',
          read: 'The stones lean in to listen. Grandam Treacle tucks a napkin into her collar, and her troll pulls out a chair for you with a hand like a tree root. "Guests first," she says, ladling. "And then we\'ll talk about what\'s owed."',
          gm: 'The climax, whenever the heroes come: before midnight, or following Clemmie as she sleepwalks in. Ways to win. 1) Burn the Doll in this cauldron: it screams, the knots smoke, the bargain is gone, and Grandam is in agony (she loses half her hit points) and attacks. 2) Locks: with two sisters\' locks pulled, the braid can be cut or Agnetha can untie the seventh knot. 3) A wager: Grandam must take any fair wager offered at her table; she offers three riddles or a contest of eating. The riddles: "Tied, I keep a promise; cut, I break one." (a knot) "I give you your own face, and keep a copy for my mistress." (a mirror) "I am the kindest light in the carr, and I have never once led anyone home." (a will-o\'-wisp) Win two of three and she must give up the Doll. 4) The letter: bring Button and Agnetha\'s paper, and argue that the firstborn of the seventh spring is the kid (DC 15 Persuasion, advantage with Wilkin\'s word or Father Ambrey\'s sermon). Grandam is bound: she takes the goat, furious, and Dimity is thrilled. If the rules of the table are broken, it is a fight: Grandam, her troll Knucklebone and three wisp candles, plus any sister still loyal (see the tips).',
          encounter: 'The Reckoning Supper',
          treasure: 'Under Grandam\'s chair: a broom of flying, 1,100 gp in a soup tureen and three garnets (100 gp each). The cauldron itself, emptied, is just a very big iron pot.',
        },
      ],
      wrapUp:
        'When the bargain breaks, the Doll crumbles into crumbs and hair and blows away, Clemmie wakes up wherever she is (cross, and asking for pie), and every hag in the carr feels it like a slammed door. Dawn finds the heroes walking back down the causeway, the famine dead lying quiet under the water.',
    },
  ],
  ending:
    'Win: Clemmie comes home. If the goat paid the price, Thimbleby keeps its luck and Dimity has a sister with horns; if the Doll burned, the next harvest is merely ordinary, and the village is glad of it. Agnetha eats bread for the first time in seven years. If Dimity turned, she may come to the mill window again, as a friend this time, and Wilkin will have to decide whether to let her in. Lose: at midnight Clemmie walks into the cauldron clearing and Grandam takes her hand; the heroes have one chance left, a wager at the table, before the coven vanishes with her into the carr for seven more years. What\'s next: a coven never forgets a slight. If Grandam survived, she wants a new youngest and a new grudge. If Primrose was promised the eldest\'s chair, she will come to collect.',
};

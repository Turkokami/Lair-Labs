// The Infernal Audit: a dark comedy of paperwork in Hell for four heroes of level 12.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

/** The Archive of Binding: a real maze of shelves, 9 x 10 cells of 3 squares, with a reading room in the middle. */
function archiveMaze(b: MapBuilder) {
  const X0 = 2, Y0 = 4, CS = 3, MW = 9, MH = 10;
  b.floor(X0, Y0, MW * CS, MH * CS, 'wood-planks-dark');
  const r = rng(6613);
  const seen = new Set<number>([9 * MW + 4]);
  const open = new Set<string>();
  const stack: [number, number][] = [[4, 9]];
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      .map(([dx, dy]) => [cx + dx, cy + dy, dx, dy])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < MW && y < MH && !seen.has(y * MW + x));
    if (!nb.length) { stack.pop(); continue; }
    const [nx, ny, dx, dy] = nb[Math.floor(r() * nb.length)];
    open.add(dx === 1 ? `${cx},${cy},e` : dx === -1 ? `${nx},${ny},e` : dy === 1 ? `${cx},${cy},s` : `${nx},${ny},s`);
    seen.add(ny * MW + nx);
    stack.push([nx, ny]);
  }
  // a few extra gaps, so there are loops and more than one way through
  for (let i = 0; i < 6; i++) open.add(`${Math.floor(r() * (MW - 1))},${Math.floor(r() * (MH - 1))},${r() < 0.5 ? 'e' : 's'}`);
  const reading = (cx: number, cy: number) => cx >= 3 && cx <= 5 && cy >= 4 && cy <= 5;
  for (let cy = 0; cy < MH; cy++)
    for (let cx = 0; cx < MW; cx++) {
      if (cx < MW - 1 && !open.has(`${cx},${cy},e`) && !(reading(cx, cy) && reading(cx + 1, cy))) b.wallRun(X0 + cx * CS + CS - 1, Y0 + cy * CS, CS, 'e');
      if (cy < MH - 1 && !open.has(`${cx},${cy},s`) && !(reading(cx, cy) && reading(cx, cy + 1))) b.wallRun(X0 + cx * CS, Y0 + cy * CS + CS - 1, CS, 's');
    }
  // shelves, ladders and lost clerks in the corners of the cells
  const stacks = ['archive-stacks', 'bookshelf-tall', 'library-stack', 'scroll-pile', 'book-pile', 'bookcase-ladder', 'map-cabinet', 'scroll-rack', 'cobweb-corner', 'skeleton-seated', 'bookshelf-fallen'];
  for (let cy = 0; cy < MH; cy++)
    for (let cx = 0; cx < MW; cx++) {
      if (reading(cx, cy) || r() > 0.5) continue;
      const corner = Math.floor(r() * 4);
      const px = X0 + cx * CS + (corner % 2) * 2, py = Y0 + cy * CS + (corner > 1 ? 2 : 0);
      b.prop(stacks[Math.floor(r() * stacks.length)], px, py, Math.floor(r() * 4) * 90);
    }
  for (const [x, y] of [[4, 6], [24, 7], [6, 27], [25, 30], [9, 12], [22, 25]]) b.light(x, y, 5, 10, '#ffcf7a');
}

function bureauOfBinding() {
  const b = new MapBuilder('adv-infernal-audit', 'The Bureau of Binding', 80, 80, { theme: 'stone', wallStyle: 'brick', ambient: 'dim', floor: 'dungeon-slab' });

  // ----- the Chasm of Arrears: a crack through the world, fire at the bottom -----
  b.pit(44, 0, 7, 80);
  b.lava(46, 0, 3, 80);
  b.area('Chasm of Arrears', [[44, 0, 7, 80]], {
    read: 'The Bureau is built on both lips of a crack in the world. Far below, a river of fire moves slowly, like a queue. Heat rolls up the walls, and paper ash falls like snow.',
    gm: 'A creature that falls in drops 60 ft onto chains and ledges (6d6 bludgeoning), then slides into the fire (10d10 fire each turn) unless it makes a DC 15 Dexterity save to catch a chain. Flying over is possible, but imps patrol the gap and shriek for the bailiffs.',
    label: [47, 48],
  });
  b.props_('chasm-edge', [[44, 20], [50, 42], [44, 55], [50, 74]]).props_('lava-river', [[47, 16], [47, 40], [47, 58], [47, 76]]).props_('chains-hanging', [[45, 36], [49, 52]]);
  for (const y of [4, 20, 36, 52, 72]) b.light(47, y, 20, 30, '#ff6a2a');

  // ----- the River of Lost Souls: black water down the east edge -----
  b.water(74, 0, 2, 80);
  b.water(76, 0, 4, 80, true);
  b.area('River of Lost Souls', [[74, 0, 6, 80]], {
    read: 'Black water runs past the Bureau, thick with faces. They drift just under the surface, mouthing names, and reach up for anything warm.',
    gm: 'Swimming or wading in the deep water: each round, DC 16 Wisdom save or gain 1 level of Exhaustion as the souls pull memories out of you. A boat, the Ferryman\'s lantern or the Ledger of Unclaimed Names keeps them off. The current runs south at 30 ft a round, towards the Weeping Sluice and out of Hell.',
    label: [77, 40],
  });
  b.props_('rapids', [[77, 12], [78, 33], [76, 58]]).props_('whirlpool', [[77, 46]]).props_('deep-water', [[78, 22], [77, 66]]).prop('skull-pile', 74, 20).prop('reeds', 74, 50);

  // ----- arrival: the Endless Queue on the ash plain -----
  b.cave('The Endless Queue', 16, 70, 15.5, 9, {
    seed: 661, mat: 'dirt', wobble: 0.12,
    read: 'A plain of grey ash under a red sky. A queue of the dead winds back and forth between rails of black iron, thousands long, shuffling one step every few minutes. Bearded devils walk the line with glaives, barking numbers nobody has been called for in centuries.',
    gm: 'Souls from every land wait here to be filed. Warden Gristle runs the line. Cutting in starts the fight. A Grantor and up to five representatives may skip the queue (it is printed on the duke\'s Writ: DC 12 Investigation to notice it). Pellingrave folk are already here: Nan Petch is near the front.',
  });
  b.floor(15, 62, 2, 2, 'dirt').floor(28, 66, 3, 3, 'dirt');
  for (const [y, gapLeft] of [[65, true], [67, false], [69, true], [71, false], [73, true]] as [number, boolean][]) b.wallRun(gapLeft ? 9 : 6, y, 18, 's', 'low');
  b.start(4, 69, 3, 3);
  b.props_('lamp-post', [[7, 64], [25, 64], [8, 75], [22, 75]]).props_('gibbet-post', [[3, 66], [29, 71]]).prop('signpost', 6, 68).prop('notice-board', 12, 63);
  b.props_('embers-ash', [[18, 76], [8, 73], [22, 63]]).props_('skeleton-lying', [[20, 74], [11, 68]]).prop('tent-command', 27, 73).prop('campfire', 25, 72).prop('burning-ground', 29, 68).prop('milestone', 6, 72);
  b.light(7, 64, 10, 20, '#ff8a3c').light(25, 64, 10, 20, '#ff8a3c').light(22, 75, 10, 20, '#ff8a3c').light(25, 72, 10, 15, '#ff8a3c');
  b.encounter('Queue wardens', [5, 63, 22, 13], [['bearded-devil', 8], ['lemure', 10]], 'low');

  b.room('Gate of Arrival', 11, 58, 10, 4, {
    mat: 'stone-flagstone',
    read: 'A gatehouse of red brick, far too small for the crowd outside. Over the arch, iron letters read: ABANDON HOPE. TAKE A NUMBER.',
    gm: 'An imp in a booth hands out tickets (handout). The great bell here rings each hour: the Bell of Accounts. Six bells are left until midnight when the heroes arrive.',
  });
  b.wallRun(11, 61, 4, 's').wallRun(17, 61, 4, 's').door(15, 61, 's', 'open', 'door-iron').door(16, 61, 's', 'open', 'door-iron');
  b.floor(15, 57, 2, 1).door(15, 56, 's', 'closed', 'door-double').door(16, 56, 's', 'closed', 'door-double');
  b.prop('temple-bell', 12, 59).prop('shop-counter', 19, 59).prop('stool', 19, 60).props_('statue-gargoyle', [[11, 61], [20, 61]]).prop('portcullis', 15, 60).light(13, 59, 10, 15);

  // ----- the Waiting Hall -----
  b.room('Waiting Hall', 3, 39, 25, 18, {
    mat: 'stone-flagstone-warm',
    read: 'Pews stretch away under a vaulted ceiling, packed with the patient dead. A board of brass numbers clicks over above six service windows. Five say CLOSED. The sixth has a queue of its own.',
    gm: 'Now serving: 12. Duke Osbert Fennimore sits on the front pew in his nightshirt, holding his copy of the contract. Window 6 issues Form 13-B (the petition to contest) to anyone with a ticket and a reason (DC 14 Persuasion, or the duke\'s Writ). Jumping the line at the window brings the bailiffs.',
  });
  for (let x = 6; x <= 22; x += 4) for (let y = 45; y <= 53; y += 4) b.prop('pew', x, y);
  b.props_('column-fluted', [[4, 47], [26, 47], [4, 51], [26, 51]]);
  b.props_('shop-counter', [[6, 40], [10, 40], [14, 40], [18, 40], [22, 40], [26, 40]]).prop('notice-board', 16, 42).prop('statue-tall-robed', 4, 55).prop('chandelier-great', 15, 49);
  b.props_('skeleton-seated', [[10, 53], [22, 45]]).props_('brazier-everburning', [[4, 41], [26, 55]]).prop('water-barrel', 26, 50).prop('rug-runner', 15, 54);
  b.light(15, 49, 15, 25, '#ffb35c').light(4, 41, 10, 15).light(26, 55, 10, 15);
  b.encounter('Bailiffs of the Waiting Hall', [3, 39, 25, 18], [['barbed-devil', 4]], 'low');

  b.hall(28, 44, 36, 41, 2);
  b.door(27, 44, 'e', 'closed').door(27, 45, 'e', 'closed').door(36, 40, 's', 'closed', 'door-iron').door(37, 40, 's', 'closed', 'door-iron');
  b.area('Corridor of Pending Matters', [[28, 44, 10, 2], [36, 41, 2, 3]], {
    read: 'A corridor lined with chairs, every one taken by a skeleton holding a form. A sign says PLEASE WAIT HERE. Someone has added, in claw, FOREVER.',
    gm: 'Harmless. A DC 13 Investigation check on the skeletons finds a blank Form 13-B and a used Stamp of Receipt that only needs re-inking (it fools the Stamping Floor guards on a DC 15 Deception).',
    label: [31, 44],
  });
  b.props_('chair', [[29, 44], [31, 44], [33, 44]]).props_('skeleton-seated', [[30, 45], [34, 45]]).prop('notice-board', 37, 42);

  // ----- the Archive of Binding: a maze of shelves -----
  archiveMaze(b);
  b.area('Archive of Binding', [[2, 4, 27, 30]], {
    read: 'Shelves taller than towers, packed with scrolls, run off in every direction. Ladders lean into the dark. Somewhere, very faintly, someone is turning pages and humming.',
    gm: 'A maze. Every bell the shelves shuffle a little (the walls stay, but the shelf-marks move). Finding a given record without help takes 3 successes on DC 16 Investigation checks; each failure costs a bell or brings imp librarians. Mother Ledgerwick knows everything that is shelved here.',
    label: [6, 10],
  });
  b.area('Reading Room of the Stacks', [[11, 16, 9, 6]], {
    read: 'The shelves open on a round of reading tables lit by green lamps. A hag in spectacles sits knitting with two long quills, a pile of scrolls at her elbow, and smiles at you as if you were late for tea.',
    gm: 'Mother Ledgerwick, Keeper of the Stacks. For one cherished memory from a hero (gone forever: let the player choose), she fetches the Notary Register (handout) and whispers where the Lost Shelf is. Attacking her or stealing a scroll starts the fight; her imps scatter if she falls below half.',
    label: [15, 18],
  });
  b.props_('table-reading', [[13, 18], [17, 18]]).prop('lectern', 15, 17).prop('book-pile', 12, 20).prop('levitating-tome', 18, 20).prop('crystal-lamp', 15, 20).prop('armchair', 14, 19);
  b.light(15, 18, 10, 15, '#8fe8a0');
  b.encounter('Keeper of the Stacks', [11, 16, 9, 6], [['night-hag', 1], ['barbed-devil', 2], ['imp', 8]], 'low');
  b.hall(14, 34, 14, 38, 2).door(14, 38, 's', 'closed', 'door-double').door(15, 38, 's', 'closed', 'door-double');

  b.room('The Lost Shelf', 3, 0, 9, 3, {
    mat: 'wood-planks-dark',
    read: 'A low room thick with dust. One shelf holds a single fat ledger, chained, its pages full of crossed-out names.',
    gm: 'The Ledger of Unclaimed Names: every soul whose name was lost in filing. The Ferryman\'s name is in it (Aldo Wren). Carried, it keeps the river\'s souls away. The secret door is a hinged shelf: DC 17 Perception to find, or Ledgerwick tells.',
  });
  b.floor(6, 3, 1, 1).door(6, 2, 's', 'secret');
  b.prop('bookshelf-tall', 4, 0).prop('reliquary', 8, 1).prop('skeleton-lying', 10, 2).prop('cobweb-corner', 11, 0).prop('gm-secret-door', 6, 3, 0, { gm: true });

  // ----- the Stamping Floor -----
  b.room('Stamping Floor', 31, 20, 11, 21, {
    mat: 'dungeon-slab',
    read: 'A hall like a mill, roaring. Rows of devils at iron desks bring stamps down on paper in a rhythm you feel in your teeth: THUNK, THUNK, THUNK. A bone devil on a high stool watches all of them at once.',
    gm: 'Form 13-B needs the Stamp of Receipt. A form stamped in the proper order (DC 15 Intelligence check with the right paper, or a hero joins the line and does the work for a bell) gets it with no fight. Violence, or stamping your own form, brings the whole floor down on you. The supervisor can be reasoned with by quoting rules (DC 18 Persuasion with the form in hand).',
  });
  for (let y = 22; y <= 37; y += 3) b.props_('desk', [[33, y], [36, y], [39, y]]);
  b.props_('anvil', [[32, 39], [40, 39]]).prop('throne', 36, 21).props_('scroll-pile', [[34, 25], [38, 31]]).prop('crate-stack', 40, 22).prop('chains-hanging', 32, 30).props_('mine-rails', [[35, 38], [36, 38], [37, 38]]);
  b.light(36, 22, 10, 20).light(33, 31, 10, 15, '#ff9a3c').light(40, 35, 10, 15, '#ff9a3c');
  b.encounter('The stamping line', [31, 20, 11, 21], [['bone-devil', 1], ['barbed-devil', 4], ['bearded-devil', 4]], 'moderate');
  b.floor(29, 23, 2, 1).door(30, 23, 'e', 'closed');

  // ----- the Annex: the building is still growing -----
  b.room('The Annex', 30, 6, 13, 12, {
    mat: 'stone-cobble', more: [[33, 2, 8, 4]],
    read: 'Half a hall, open to the red sky. Lemures haul bricks up ramps that lead nowhere, and a new staircase climbs to a door hanging in empty air. Behind you, you can hear a wall being built where there was none a moment ago.',
    gm: 'The Bureau never stops growing: new wings for new paperwork. The work gang ignores anyone carrying a clipboard (or anything like one). Their overseers fight anyone who stops the work. The rotten scaffold at the east end leads out onto the Unfinished Span.',
  });
  b.wallRun(30, 11, 5, 's').wallRun(38, 6, 3, 'w').rubble(39, 12, 3, 2).pit(33, 14, 3, 2);
  b.props_('ladder', [[34, 3], [31, 7]]).prop('stairs-up', 40, 3).props_('sawhorse', [[32, 9], [36, 15]]).prop('workbench', 40, 16).prop('winch', 42, 9).prop('rope-coil', 41, 7);
  b.props_('crate-pile', [[31, 16], [37, 3]]).prop('column-collapsed', 37, 12).prop('ceiling-rubble', 35, 8).prop('mine-cart', 31, 13).prop('trap-collapsing-floor', 36, 10, 0, { gm: true });
  b.light(36, 9, 10, 20, '#ff8a3c');
  b.encounter('Annex work gang', [30, 2, 13, 16], [['lemure', 30], ['bearded-devil', 3], ['barbed-devil', 2]], 'low');
  b.floor(29, 8, 1, 1).door(29, 8, 'e', 'closed');
  b.floor(36, 18, 2, 2).door(36, 17, 's', 'closed').door(37, 17, 's', 'closed');

  b.floor(43, 8, 11, 1, 'wood-planks');
  b.area('The Unfinished Span', [[43, 8, 11, 1]], {
    read: 'A single plank of scaffold juts out over the chasm, nailed to nothing, and ends at a fresh crack in the wall of the vault on the far side.',
    gm: 'The back way into the Vault. DC 14 Acrobatics to cross; a failure leaves you hanging (DC 14 Athletics to climb back). Fail by 5 or more and you fall into the chasm. Two at a time and it creaks; three and it snaps.',
    label: [48, 8],
  });
  b.prop('bridge-plank', 47, 8, 90);

  // ----- the couriers' stable and the cart yard -----
  b.room("Couriers' Stable", 31, 48, 11, 11, {
    mat: 'dirt',
    read: 'Smoke and the smell of burning hay. Black horses with manes of fire stamp in iron stalls, and red hounds pace in a pen, panting sparks.',
    gm: 'The Bureau\'s couriers. The nightmares can be ridden by anyone who shows a Courier\'s Warrant or makes a DC 18 Animal Handling check: they fly, and they cross the chasm in a breath. Taking them is theft, and theft gets filed. The hounds raise the alarm on a failed Stealth check.',
  });
  b.props_('cage', [[32, 49], [35, 49], [38, 49]]).props_('hay-bale', [[40, 50], [32, 56]]).prop('water-trough', 36, 53).prop('hitching-post', 40, 56).prop('straw-bed', 33, 53).prop('bones', 38, 55).light(36, 53, 10, 15, '#ff8a3c');
  b.encounter("Couriers' stable", [31, 48, 11, 11], [['nightmare', 4], ['hell-hound', 4]], 'low');
  b.floor(28, 52, 3, 1).door(27, 52, 'e', 'closed').door(30, 52, 'e', 'closed');
  b.floor(36, 59, 2, 2).door(36, 58, 's', 'closed').door(37, 58, 's', 'closed');

  b.room('Cart Yard', 30, 61, 12, 12, {
    mat: 'stone-cobble',
    read: 'Iron carts stand in rows, each one heaped with the dull grey glow of souls. A brass sign over the bridge reads COLLECTIONS: NO RETURNS.',
    gm: 'Souls that missed their filing go from here across the Collection Bridge to the Debt Furnace. At the last bell, forty thousand Pellingrave souls arrive here at once. A hero hiding in a cart rides over the bridge unseen (DC 14 Stealth).',
  });
  b.wallRun(30, 61, 5, 'w', 'low').wallRun(30, 68, 5, 'w', 'low').prop('fence-gate', 30, 66);
  b.props_('mine-cart', [[32, 63], [35, 63], [32, 68], [35, 68]]).props_('mine-rails', [[38, 66], [39, 66], [40, 66], [41, 66]]).prop('scales', 39, 62).prop('cart', 33, 71).prop('lantern-standing', 40, 70).light(40, 70, 10, 15);

  b.floor(42, 66, 11, 2, 'wood-planks');
  b.area('The Collection Bridge', [[42, 66, 11, 2]], {
    read: 'A bridge of iron rails over the fire. Carts of souls roll across it on their own, one after another, towards a red glow.',
    gm: 'A cart comes every round: DC 15 Dexterity save or be knocked 10 ft along (and maybe over the edge: another DC 15 save or fall). Riding a cart is easy.',
    label: [47, 66],
  });
  b.props_('mine-rails', [[44, 66], [46, 66], [48, 66], [50, 66]]).prop('mine-cart', 45, 67);

  // ----- the Bridge of Due Process -----
  b.floor(42, 29, 11, 2, 'stone-cobble');
  b.area('Bridge of Due Process', [[42, 29, 11, 2]], {
    read: 'A bridge of iron plates hung from enormous chains. Each plate is stamped with a rule number. The chains groan when you step on it, as if they are reading you.',
    gm: 'The only proper way to the Appeals Court. A creature with no stamped paper about it makes the chains tilt: DC 15 Dexterity save or slide prone, taking 2d6 fire from the hot plates. Any stamped form, even the wrong one, keeps it level.',
    label: [47, 29],
  });
  b.door(41, 29, 'e', 'closed', 'door-iron').door(41, 30, 'e', 'closed', 'door-iron').props_('bridge-rope', [[44, 29], [49, 30]], 90);

  // ----- east bank: the Appeals Court -----
  b.cave(null, 62.5, 26, 7, 3, { seed: 663, mat: 'marble', wobble: 0.05 });
  b.floor(62, 22, 2, 2, 'marble');
  b.room('Appeals Court', 56, 24, 14, 17, {
    mat: 'marble', more: [[53, 28, 3, 6], [70, 28, 3, 6]],
    read: 'A courtroom carved from black stone, three storeys high. Twelve lemures sit in the jury box, melting slightly. At the top of a stair of judgement, a bone devil in a wig of spun bone raises a femur gavel and says: "Next."',
    gm: 'Justiciar Marrowgast hears petitions until the last bell. A petition needs Form 13-B with the Stamp of Receipt, signed by the Grantor or his representative. Two proofs strike Schedule C (the city is saved). Arguing Clause 41(c) with the forgery proven voids the whole contract. Lying to the court (it has a zone of truth, DC 17) or violence is contempt.',
  });
  b.door(53, 29, 'w', 'closed', 'door-double').door(53, 30, 'w', 'closed', 'door-double');
  b.prop('throne-dais', 62, 25).prop('lectern-dais', 62, 28).props_('pew', [[57, 33], [61, 33], [65, 33], [57, 36], [61, 36], [65, 36]]).props_('bench-long', [[69, 27], [69, 29]]).prop('prison-bars', 56, 28);
  b.props_('banner-hanging-tall', [[57, 25], [68, 25]]).props_('statue-tall-robed', [[56, 40], [69, 40]]).props_('column-fluted', [[53, 28], [53, 33], [72, 28], [72, 33]]).props_('candle-stand-tall', [[59, 24], [65, 24]]).prop('trap-rune-threshold', 54, 29, 0, { gm: true });
  b.light(62, 26, 15, 25, '#ffd27a').light(56, 36, 10, 15).light(69, 36, 10, 15);
  b.encounter('Contempt of court', [53, 23, 20, 18], [['bone-devil', 1], ['barbed-devil', 4]], 'moderate');

  // ----- the Hall of Seals and the Vault -----
  b.room('Hall of Seals', 56, 15, 15, 7, {
    mat: 'dungeon-slab',
    read: 'A long hall hung with ten thousand wax seals on cords, swaying in no wind. Before the vault door stands an iron giant with a stamp for a fist, and a slot in its chest marked REQUISITIONS.',
    gm: 'The Notary Engine (iron golem). It lets through anyone who feeds it a requisition with the Stamp of Receipt and a shelf-mark from the Archive (the Notary Register has one). A forged requisition needs DC 20 with a forgery kit. Anyone else is "rejected", loudly.',
  });
  b.floor(62, 22, 2, 1).door(62, 21, 's', 'closed', 'door-double').door(63, 21, 's', 'closed', 'door-double');
  b.floor(62, 14, 2, 1).door(62, 14, 's', 'locked', 'door-iron').door(63, 14, 's', 'locked', 'door-iron');
  b.props_('chains-hanging', [[58, 16], [68, 16], [58, 20], [68, 20]]).props_('censer-hanging', [[60, 18], [66, 18]]).prop('lock-plate', 62, 16).prop('statue-tall-knight', 70, 18);
  b.light(63, 18, 10, 20, '#ffb35c');
  b.encounter('The Notary Engine', [56, 15, 15, 7], [['iron-golem', 1]], 'moderate');

  b.room('Vault of Original Contracts', 54, 2, 18, 12, {
    mat: 'marble',
    read: 'Cold, still and silent, the first silence in Hell. Iron drawers climb the walls, each one sealed, each one holding a single signed page. In the middle, under glass, the Bureau\'s oldest contracts sleep.',
    gm: 'The original Instrument 30-PEL-0001 is in drawer P, row 30 (DC 15 Investigation with the shelf-mark, DC 22 without; each try costs a bell). It has Schedules A and B only, bound with the Chancellor\'s red cord; the staple holes on the duke\'s copy of Schedule C do not match. Clause 41(c) is here in tiny letters (handout). Opening any other drawer sets off a glyph (DC 17 Dexterity save, 8d8 fire).',
  });
  b.rubble(54, 7, 2, 3);
  b.rock(57, 4, 2, 7).rock(67, 4, 2, 7);
  b.props_('archive-stacks', [[55, 3], [58, 3], [61, 3], [64, 3], [67, 3], [70, 3]]).props_('map-cabinet', [[55, 12], [70, 12]]).props_('display-case', [[60, 7], [65, 7]]).prop('plinth-display', 62, 9);
  b.prop('safe', 70, 7).prop('strongbox', 56, 10).prop('glyph-trap', 67, 11, 0, { gm: true }).prop('gm-treasure', 62, 10, 0, { gm: true });
  b.light(62, 8, 10, 15, '#a8c8ff');
  b.floor(72, 7, 2, 2, 'stone-cobble').door(71, 7, 'e', 'locked', 'door-iron').door(71, 8, 'e', 'locked', 'door-iron');
  b.area('The Water-Gate', [[72, 7, 2, 2]], {
    read: 'An iron gate opens onto the black river. A chained skiff knocks against the step.',
    gm: 'The archivists\' way to drop old contracts into the river for "permanent storage". Locked: DC 18 Thieves\' Tools, or opens from the vault side. The skiff holds four.',
    label: [72, 7],
  });
  b.prop('rowboat', 74, 8).prop('mooring-post', 73, 8);

  // ----- Rimeholt's office and the forgery behind it -----
  b.floor(67, 41, 2, 2).door(67, 40, 's', 'closed').door(68, 40, 's', 'closed').door(67, 42, 's', 'closed', 'door-iron').door(68, 42, 's', 'closed', 'door-iron');
  b.room("Vice-Comptroller's Office", 62, 43, 11, 10, {
    mat: 'wood-planks-dark',
    read: 'A tidy office, very cold. Frost furs the inkwells. Behind a huge desk, a grate in the floor glows red from the furnace below, and on the wall hangs a quota chart with one red line climbing off the top.',
    gm: 'Rimeholt works here. Everything is in order, too much in order. A DC 16 Investigation finds that the bookcase on the west wall swings: the secret door to the forgery office. His desk drawer (DC 18 Thieves\' Tools, or a frost glyph: 4d8 cold) holds his letter to the Chancellor.',
  });
  b.prop('writing-desk', 67, 46).prop('chair-high-back', 67, 47).props_('bookcase-grand', [[62, 44]]).prop('bookcase-secret', 62, 47).prop('notice-board', 71, 44).prop('globe-stand', 70, 50).prop('armchair', 64, 51).prop('rug', 66, 49).prop('trap-needle-lock', 68, 46, 0, { gm: true });
  b.light(67, 45, 10, 15, '#a8d8ff');
  b.room('Forgery Office', 53, 43, 7, 10, {
    mat: 'stone-flagstone',
    read: 'A cramped, secret room. Imps hunch over sloping desks under a single blue lamp, copying signatures again and again, a thousand dukes on a thousand practice sheets.',
    gm: 'Rimeholt\'s workshop. Here are the frost-ink (it never thaws: proof any Schedule written in it is his), practice sheets of the duke\'s signature, and Tittle the copyist. The imps flee or surrender if two of them fall. The chute in the floor drops to the Debt Furnace.',
  });
  b.floor(60, 47, 2, 1).door(59, 47, 'e', 'closed').door(61, 47, 'e', 'secret');
  b.props_('writing-desk', [[54, 44], [57, 44], [54, 48], [57, 48]]).prop('scroll-pile', 58, 51).prop('cauldron-tripod', 54, 51).prop('book-pile', 56, 46).prop('gm-secret-door', 60, 47, 0, { gm: true });
  b.light(56, 47, 5, 10, '#8fc8ff');
  b.encounter('The copyists', [53, 43, 7, 10], [['imp', 6], ['barbed-devil', 2]], 'low');
  b.hall(55, 53, 55, 59, 1).door(55, 52, 's', 'secret');

  // ----- the Debt Furnace -----
  b.cave('The Debt Furnace', 62, 64, 9, 7, {
    seed: 667, mat: 'dungeon-slab', wobble: 0.12,
    read: 'A furnace as big as a cathedral, built around a pool of fire. Carts of souls tip into the flames, and out of the far side drip coins, still glowing. A horned devil in an apron counts them as they fall.',
    gm: 'The end of the line. Collector Brandgrue runs it. When Rimeholt is exposed he comes here to burn the original contract (and the Ledger, if the heroes have it). Whatever goes in the fire is gone; whatever he touches freezes, so the lava near him crusts over into black glass you can walk on.',
  });
  b.hall(52, 66, 56, 66, 2);
  b.lava(60, 62, 5, 4);
  b.props_('lava-pool', [[61, 63]]).props_('forge', [[56, 60], [68, 60]]).props_('mine-rails', [[54, 66], [56, 67], [58, 66]]).prop('mine-cart', 57, 64).prop('cauldron', 66, 68).prop('coin-stacks', 67, 64).prop('scales', 68, 66).prop('chains-hanging', 58, 69).prop('cage-hanging', 65, 59).prop('magma-vent', 55, 62);
  b.light(62, 64, 20, 30, '#ff6a2a').light(56, 60, 10, 15, '#ff9a3c').light(68, 60, 10, 15, '#ff9a3c');
  b.encounter('Rimeholt at the furnace', [53, 57, 19, 15], [['ice-devil', 1], ['horned-devil', 1]], 'high');

  // ----- the way out: the Ferry Landing on the river -----
  b.hall(66, 70, 66, 74, 2);
  b.room('Ferry Landing', 63, 74, 11, 5, {
    mat: 'wood-planks',
    read: 'A sagging wooden landing on the black river. A barge with a lantern of pale fire waits at the end, and an old grey man leans on his pole, trying to remember why he is there.',
    gm: 'The way out: down the river, through the Weeping Sluice, back to the world of the living (the heroes come up in Pellingrave\'s harbour). Bureau hounds come baying down the furnace stair as soon as the alarm is up.',
  });
  b.props_('dock-pier', [[72, 76], [73, 76]]).prop('mooring-post', 73, 75).prop('canoe', 75, 77).prop('rowboat', 74, 75).props_('lantern-hook', [[64, 75], [70, 75]]).prop('rope-coil', 65, 77).prop('crate-stack', 69, 78).prop('gm-exit', 77, 79, 0, { gm: true });
  b.light(70, 75, 10, 20, '#cfe8ff').light(64, 75, 10, 15);
  b.encounter('Hounds of collection', [63, 73, 11, 7], [['hell-hound', 6], ['nightmare', 4], ['barbed-devil', 2]], 'low');

  b.note(15, 60, 'Bell of Accounts: six bells to midnight. A long fight, a long talk, a rest or a lost search costs one bell.');
  b.note(47, 30, 'Chains tilt for anyone carrying no stamped paper: DC 15 Dex save or slide, 2d6 fire.');
  return b.build();
}

export const INFERNAL_AUDIT: Adventure = {
  id: 'infernal-audit',
  title: 'The Infernal Audit',
  tagline: 'A city\'s souls fall due at midnight. Your only weapons: a stamp, a form and the small print.',
  levels: '12',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['comedy', 'hell', 'devils', 'intrigue', 'high level'],
  pitch:
    'Thirty years ago, a poor young nobleman signed a contract in a cellar and woke up Duke of Pellingrave. Tonight is his sixtieth birthday, and the bill has come. According to the Bureau of Binding, it isn\'t just his soul that falls due at midnight. It\'s everyone\'s. Forty thousand souls. The whole city. There is one way to fight Hell, and it isn\'t with swords. It\'s with paperwork.',
  secret:
    'The duke\'s original contract pledged only his own soul and his household: twelve people. Ten years later, Vice-Comptroller Skelvane Rimeholt (an ice devil) slipped a forged Schedule C into the file, defining the duke\'s "household" as every soul inside Pellingrave\'s walls. If the collection goes through, Rimeholt beats Hell\'s century quota by forty thousand souls and wins the seat of Comptroller from the Chancellor (a pit fiend who never appears, but whose rules everyone fears). Devils must obey their own contracts. If a court proves the forgery, Schedule C dies, and by Clause 41(c), the small print nobody reads, the whole contract is void and the forger takes the duke\'s place. Rimeholt knows this. He will do anything legal to stop it, and, once exposed, anything at all.',
  hooks: [
    'Duke Fennimore, sweating through his nightshirt, begs the heroes for help: 10,000 gp and the thanks of a city. His Writ of Attendance lets him bring five "representatives" down to the Bureau at sunset.',
    'The bells of Pellingrave rang backwards at dawn, and the temple\'s high priest dreamed of a queue. She opens a door to Hell for anyone brave enough to argue with it.',
    'A hero\'s friend, the baker Nan Petch, died of old age yesterday, and her ghost says she is "in a queue". Her soul was never sold. Somebody is cheating.',
  ],
  tips: [
    'Run the Bell of Accounts: six bells to midnight. A long fight, a long talk, a rest or a failed search costs one bell. Ring a real bell (or a glass) at the table each time.',
    'Paperwork is a weapon. Devils must obey their own rules, so reward any clever form, stamp or rule-quote as much as a won fight. When in doubt, ask "what form would that need?" and let the players fill it in.',
    'Track the three proofs: the Original (Vault), the Forgery (frost-ink, the draft letter or Tittle\'s word) and the Missing Signature (the Notary Register). Two save the city. All three, or the forgery plus Clause 41(c), void the whole contract and save the duke too.',
    'Keep it funny, but let it bite. The queue is full of real people, and Nan Petch is one of them. The jokes land harder when the stakes are real.',
    'Most fights can be skipped: take a number, fill in the form, quote a rule, or bribe a devil with infernal coin. A party that never draws a sword can still win.',
    'For a weaker party, swap the horned devil in the climax for two bearded devils, or let Brandgrue be talked out of it.',
  ],
  npcs: [
    {
      id: 'pf_iafennimore', name: 'Duke Osbert Fennimore', title: 'Duke of Pellingrave, Grantor', kind: 'npc', art: 'noble', monsterId: 'noble', shared: true,
      wants: 'To keep his own soul, honestly, and to keep his city out of a bill it never ran up.',
      knows: 'He signed in a cellar thirty years ago. He remembers two schedules, not three, and that the devil with the pen had frost on its eyebrows.',
      voice: 'Blusters, apologises, blusters again. Says "technically" far too often.',
      appearance: 'Plump and pink, sixty at midnight, in a nightshirt under his ducal coat, clutching his copy of the contract to his chest.',
      backstory: 'A third son of a bankrupt house, he signed for "a duchy that prospers" and got one. Guilt made him a surprisingly good ruler.',
      gmNotes: 'Alive, and here by the Writ of Attendance. As Grantor he can sign petitions and skip queues, and so can his "representatives". If Clause 41(c) is argued he is freed as well. He is useless in a fight and knows it.',
    },
    {
      id: 'pf_iarimeholt', name: 'Skelvane Rimeholt', title: 'Vice-Comptroller of the Bureau of Binding', kind: 'monster', art: 'iceDevil', monsterId: 'iceDevil',
      wants: 'The seat of Comptroller and the office with the view of the chasm. This collection is his masterpiece.',
      knows: 'Every rule of the Bureau, and exactly which one could hang him: Clause 41(c).',
      voice: 'Soft, cold and precise. Corrects your grammar in the middle of a threat. He never shouts; the room just gets colder.',
      appearance: 'A towering, insect-like devil of blue ice in half-moon spectacles and a sash heavy with seals. Paper he touches frosts over.',
      backstory: 'He drafted the duke\'s contract as a junior assessor, then added Schedule C ten years later, when the quota board laughed at him.',
      gmNotes: 'Ice devil stat block. He fights with rules first: objections, recesses, "lost" forms. Exposed in court, he calls a recess and heads for the Debt Furnace to burn the original. At half hit points he offers a settlement: the city goes free if the duke\'s soul is paid. He keeps his word only to the letter.',
    },
    {
      id: 'pf_iatittle', name: 'Tittle', title: 'copyist, third class', kind: 'monster', art: 'imp', monsterId: 'imp',
      wants: 'A transfer anywhere else in Hell, and protection from Rimeholt.',
      knows: 'He copied Schedule C from Rimeholt\'s draft "as a routine correction". He knows where the draft is kept and about the chute to the furnace.',
      voice: 'Squeaky and fast. Panics in footnotes: "That is, I mean, as it were, sir."',
      appearance: 'A tiny red imp with ink-black claws, an eyeshade and a quill behind each ear.',
      gmNotes: 'A living proof. He testifies if the heroes keep him safe and file a witness protection form (any form, stamped), or on a DC 16 Persuasion. Rimeholt will try to freeze him first in any fight.',
    },
    {
      id: 'pf_iamarrowgast', name: 'Justiciar Marrowgast', title: 'judge of the Appeals Court', kind: 'monster', art: 'boneDevil', monsterId: 'boneDevil', shared: true,
      wants: 'Correct procedure. He does not care who wins. He hates clerks who cheat, because it makes Hell look sloppy.',
      knows: 'Every rule of appeal. The court sits until the last bell. Rimeholt is "ambitious, which is not yet a crime".',
      voice: 'Dry as paper. Clicks his jaw between sentences and quotes rule numbers from memory.',
      appearance: 'A gaunt, skeletal devil in a powdered wig of spun bone, holding a gavel carved from a femur.',
      gmNotes: 'Bone devil stat block. Strictly fair. He accepts creative filings that follow the letter of the rules, and punishes lies and violence as contempt. Two proofs strike Schedule C. Three, or the forgery plus Clause 41(c), void the instrument.',
    },
    {
      id: 'pf_iabrandgrue', name: 'Collector Brandgrue', title: 'keeper of the Debt Furnace', kind: 'monster', art: 'hornedDevil', monsterId: 'hornedDevil',
      wants: 'His quota met, and the Vice-Comptroller\'s seat, which Rimeholt has promised him.',
      knows: 'Forty thousand souls are booked through his furnace at midnight, and the carts are ready.',
      voice: 'Loud and cheerful, like a foreman. Calls souls "units".',
      appearance: 'A huge winged devil in a leather apron, soot to the horns, with a ledger chained to his belt.',
      gmNotes: 'Horned devil stat block. Rimeholt\'s promise is written nowhere. Point that out (DC 18 Insight or Persuasion, easier with the draft letter, which never mentions him) and he stands aside in the climax.',
    },
    {
      id: 'pf_iagristle', name: 'Warden Gristle', title: 'warden of the Endless Queue', kind: 'monster', art: 'beardedDevil', monsterId: 'beardedDevil',
      wants: 'Order. Nobody cuts. Nobody. Ever.',
      knows: 'The ticket system, the wait (1,112 years) and that Grantors and their representatives may skip the line.',
      voice: 'Barks numbers. Chews his beard when he thinks.',
      appearance: 'A bearded devil with a glaive, a PLEASE WAIT sign hanging from its blade.',
      gmNotes: 'Bearded devil stat block. Shows him the Writ (or a forged priority pass, DC 17 with a forgery kit) and he waves the heroes through, scowling.',
    },
    {
      id: 'pf_ialedgerwick', name: 'Mother Ledgerwick', title: 'Keeper of the Stacks', kind: 'monster', art: 'night-hag', monsterId: 'nightHag',
      wants: 'Memories. She trades a page for a good one.',
      knows: 'Where every scroll is shelved, including the Notary Register and the Lost Shelf behind its secret door.',
      voice: 'Sweet as a grandmother. Purrs over a good memory. Licks her thumb to turn pages.',
      appearance: 'Blue-black skin, spectacles on a chain and a cardigan knitted from shelf-dust and hair.',
      gmNotes: 'Night hag stat block. For one cherished memory (the player picks it, and it is gone for good) she brings the Register and tells of the Lost Shelf. She never fights fair and never fights to the death.',
    },
    {
      id: 'pf_ianobody', name: 'The Ferryman', title: 'a soul who forgot his name', kind: 'npc', art: 'ghost', monsterId: 'ghost',
      wants: 'His name back.',
      knows: 'Every turn of the River of Lost Souls, and the way out through the Weeping Sluice.',
      voice: 'Gentle and forgetful. Starts sentences and loses them halfway.',
      appearance: 'A grey, see-through old man in a fisherman\'s coat, leaning on a pole beside a black barge with a pale lantern.',
      gmNotes: 'His name, Aldo Wren, is in the Ledger of Unclaimed Names on the Lost Shelf. Give it back and he carries the heroes out for free and keeps the souls off. Otherwise his fare is one true story each.',
    },
    {
      id: 'pf_iapetch', name: 'Nan Petch', title: 'baker of Pellingrave, recently deceased', kind: 'npc', art: 'commoner', shared: true,
      wants: 'To know her grandchildren will be safe, and to tell the duke exactly what she thinks of him.',
      knows: 'Queue gossip: a clerk "with frost on him" walked the line counting Pellingrave folk twice, and the Bureau is badly short of staff.',
      voice: 'Brisk, floury and no-nonsense. "Well? Are you going to do something, or just stand there being heroic?"',
      appearance: 'A stout old woman in an apron still dusted with flour, see-through at the edges.',
      gmNotes: 'She died of old age yesterday. Her soul was never sold, yet her file says "Schedule C". She is living (well, dead) proof that Schedule C is wrong, and a fine witness if anyone can get her out of the queue.',
    },
  ],
  handouts: [
    { id: 'maturity', title: 'Notice of Maturity', text: 'BUREAU OF BINDING, DEPARTMENT OF COLLECTIONS\nInstrument 30-PEL-0001. Grantor: Osbert Fennimore.\nConsideration: one (1) duchy, prosperous. Delivered.\nCollateral: the Grantor\'s soul and household, as listed in Schedule C (40,312 souls).\nFalls due: midnight, the Grantor\'s sixtieth birthday.\nPlease have your souls ready. Thank you for choosing damnation.' },
    { id: 'ticket', title: 'A ticket from the booth', text: 'BUREAU OF BINDING: WAITING HALL\nYour number: 6,660,013\nNow serving: 12\nEstimated wait: 1,112 years\nPlease do not die again while waiting.' },
    { id: 'form-13b', title: 'Form 13-B', text: 'PETITION TO CONTEST AN INSTRUMENT (file in triplicate)\n1. Stamp of Receipt (Stamping Floor).\n2. Shelf-mark of the Original (Archive).\n3. Signature of the Grantor or his representative, in ink (blood accepted).\nPetitions filed after the Instrument falls due will be heard at the next sitting (in 600 years).' },
    { id: 'register', title: 'The Notary Register, page 30-PEL', text: 'Instrument 30-PEL-0001.\nSchedule A (Consideration: a duchy). Countersigned, Notary Vesk.\nSchedule B (Collateral: the Grantor\'s soul and household, being twelve persons). Countersigned, Notary Vesk.\n(No further entries.)' },
    { id: 'clause', title: 'Clause 41(c), in very small letters', text: 'Should any term of this Instrument be found falsified by an officer of the Bureau, this Instrument shall be void in whole, and the falsifying officer shall stand in the Grantor\'s place for all purposes of collection.' },
    { id: 'draft', title: 'A letter in Rimeholt\'s desk', text: 'To His Infernal Lordship the Chancellor of Binding.\nAt midnight the Bureau receives 40,312 souls under Instrument 30-PEL-0001, exceeding the century\'s quota by a margin I modestly put down to my own diligence. I humbly offer myself for the vacant seat of Comptroller.\nYour servant, S. Rimeholt.\nP.S. The copyist knows nothing. Burn this.\n(Below, in frost-ink, the duke\'s signature, practised eleven times.)' },
  ],
  chapters: [
    {
      id: 'bureau', title: 'The Bureau of Binding', level: 12,
      summary: 'A records-fortress in Hell built on both sides of a fiery chasm: a queue of the dead, a waiting hall, a maze of shelves, a stamping mill, an appeals court, a hidden forgery, a vault of contracts, a debt furnace and a river of lost souls.',
      goal: 'Before the last bell at midnight, prove Schedule C is forged and get the Justiciar to strike it (or void the whole contract), stop Rimeholt burning the evidence, and get out alive.',
      map: bureauOfBinding,
      npcs: [
        { npc: 'pf_iafennimore', x: 15, y: 44 },
        { npc: 'pf_iapetch', x: 10, y: 64 },
        { npc: 'pf_iagristle', x: 16, y: 66 },
        { npc: 'pf_ialedgerwick', x: 15, y: 19, hidden: true },
        { npc: 'pf_iamarrowgast', x: 62, y: 26 },
        { npc: 'pf_iatittle', x: 56, y: 45, hidden: true },
        { npc: 'pf_iabrandgrue', x: 66, y: 62, hidden: true },
        { npc: 'pf_iarimeholt', x: 58, y: 62, hidden: true },
        { npc: 'pf_ianobody', x: 71, y: 76 },
      ],
      scenes: [
        {
          room: 'The Endless Queue', title: 'Take a number', handout: 'maturity', encounter: 'Queue wardens',
          read: 'You step out of a cellar door into grey ash and red sky. Ahead, the dead stand in a queue that folds back on itself a hundred times, and at its head, far away, a gatehouse no bigger than a chapel.',
          gm: 'Open with the Notice of Maturity in the duke\'s shaking hands. Nan Petch calls out from the line: she knows the duke, and she has opinions. Gristle stops anyone who cuts in. The Writ lets the duke and five representatives skip the line (DC 12 Investigation to spot it, or Gristle mentions it with great reluctance). Otherwise, talk, bribe or fight.',
        },
        {
          room: 'Waiting Hall', title: 'Now serving: 12', handout: 'ticket', encounter: 'Bailiffs of the Waiting Hall',
          read: 'The number board clicks over, slowly, from 12 to 12. A thousand heads look up, and then down again.',
          gm: 'Window 6 issues Form 13-B (handout) to a ticket holder with a reason. The imp at the window wants a ticket, a signature and a bribe, in that order. Queue-jumping at the window brings the bailiffs. The duke can explain the contract (he signed two schedules) and Nan\'s presence is the first clue: she was never his household.',
          treasure: 'A blank Form 13-B. A priority pass, if anyone thinks to ask for one (DC 15 Persuasion).',
        },
        {
          room: 'Stamping Floor', title: 'The Stamp of Receipt', handout: 'form-13b', encounter: 'The stamping line',
          read: 'THUNK. THUNK. THUNK. The whole floor stops mid-stroke as you walk in, and a hundred devils look at your form.',
          gm: 'Getting the Stamp of Receipt: join the line and work a bell (DC 14 Dexterity to keep up with the rhythm), argue procedure with the bone devil supervisor (DC 18 Persuasion), or forge it (DC 18). Stamping your own form, or violence, starts the fight. The floor\'s gossip: Rimeholt "fast-tracked" a schedule here ten years ago without the supervisor\'s initials.',
          treasure: 'The supervisor\'s strongbox: infernal coins worth 900 gp to a planar trader, and a wand of binding.',
        },
        {
          room: 'Reading Room of the Stacks', title: 'A memory for a page', handout: 'register', encounter: 'Keeper of the Stacks',
          read: 'The hag sets down her quills and pats the chair beside her. "Sit, dears. Everyone who comes to me is looking for something. What will you give to find it?"',
          gm: 'The maze takes 3 successes on DC 16 Investigation to cross (each failure costs a bell or brings imps). Ledgerwick trades the Notary Register (the Missing Signature proof, and the vault shelf-mark) for one cherished memory. She also knows of the Lost Shelf. Stealing from her starts the fight.',
          treasure: 'Two spell scrolls of banishment from a reading table, and the shelf-mark P-30 for the vault.',
        },
        {
          room: 'The Lost Shelf', title: 'The Ledger of Unclaimed Names', optional: true,
          gm: 'Behind a secret door in the maze (DC 17 Perception, or Ledgerwick tells). The Ledger names every soul lost in filing, including the Ferryman (Aldo Wren). It keeps the river\'s souls away from whoever carries it. A hero can also find "Nan Petch, Schedule C, line 31,004": a second Pellingrave file in Rimeholt\'s frost-ink.',
          treasure: 'The Ledger of Unclaimed Names, and a cloak of protection on a skeleton that died waiting for it.',
        },
        {
          room: 'The Annex', title: 'The building that grows', optional: true, encounter: 'Annex work gang',
          read: 'A new wall rises in front of you, brick by brick, laid by lemures who were not there a moment ago.',
          gm: 'A side route to the Unfinished Span and the back of the Vault. Anyone with a clipboard (or a convincing plank, DC 14 Deception) is ignored as an inspector. Stopping the work brings the overseers.',
          treasure: 'A portable hole the builders use for rubble, rolled up in a tool crate.',
        },
        {
          room: "Couriers' Stable", title: 'Borrowing a nightmare', optional: true, encounter: "Couriers' stable",
          gm: 'Nightmares fly and cross the chasm in a breath: a fast way to the Vault, the court or the river. A Courier\'s Warrant (stamped, of course) or DC 18 Animal Handling gets a mount. Failure wakes the hounds.',
        },
        {
          room: 'Appeals Court', title: 'The court will hear you', encounter: 'Contempt of court',
          read: 'The gavel falls like a bone breaking. "Petition 30-PEL. The court notes the hour. The court notes that you are mortal. The court does not care. Proceed."',
          gm: 'The heart of the adventure. File Form 13-B and present proofs. Rimeholt appears to object: he cites rules, asks for recesses and "loses" exhibits. Give the players room to argue. Each proof is worth one success; clever arguments, witnesses (Nan, Tittle) and rule-quotes count too. Two strike Schedule C; three, or the forgery with Clause 41(c), void the contract. Once exposed, Rimeholt asks for a recess "to fetch the original" and leaves for the Debt Furnace. Violence or a lie caught by the court is contempt.',
        },
        {
          room: 'Hall of Seals', title: 'The Notary Engine', encounter: 'The Notary Engine',
          read: 'The iron giant turns its head with a sound like a vault door. Its stamp-fist rises. A slot in its chest opens, waiting.',
          gm: 'Feed it a requisition with the Stamp of Receipt and the shelf-mark P-30 and it steps aside. Otherwise it "rejects" you. The heroes can also skip it entirely by the Unfinished Span or the Water-Gate.',
        },
        {
          room: 'Vault of Original Contracts', title: 'The original', handout: 'clause',
          read: 'Drawer P-30 slides open with a sigh of cold air. Inside lies a single bound contract, tied with red cord. Two schedules. Only two.',
          gm: 'The Original proof. Reading it closely (DC 15 Investigation, or anyone who says "I read the small print") finds Clause 41(c). Other drawers are trapped with glyphs. Leaving by the Water-Gate takes the heroes straight to the river.',
          treasure: 'A pair of dimensional shackles kept for "difficult clients", 4,000 gp in gold bars, and a potion of supreme healing.',
        },
        {
          room: 'Forgery Office', title: 'A thousand dukes', handout: 'draft', encounter: 'The copyists',
          read: 'Every desk holds the same signature, written over and over: Osbert Fennimore, Osbert Fennimore, Osbert Fennimore, a little better each time.',
          gm: 'Reached through the secret door in Rimeholt\'s office (DC 16 Investigation, or Tittle shows them) or up the chute from the furnace. The Forgery proof is here three ways: the frost-ink, Rimeholt\'s letter (in his desk next door) and Tittle himself. The imps fold quickly; Tittle hides under a desk until someone promises him a transfer.',
          treasure: 'Rimeholt\'s desk: gems worth 2,500 gp and a bag of holding stuffed with blank forms.',
        },
        {
          room: 'The Debt Furnace', title: 'Rimeholt\'s last ruling', encounter: 'Rimeholt at the furnace',
          read: 'The ice devil stands at the edge of the fire with the original contract in one claw, and frost spreads from his feet across the lava. "A pity," he says. "You were very nearly correct."',
          gm: 'The climax. Rimeholt tries to throw the original (or the Ledger, or Tittle) into the fire; a hero can catch it with a DC 17 Dexterity check as a reaction. Brandgrue fights at his side unless the heroes have shown he was never promised anything in writing. Frozen lava near Rimeholt is walkable black glass; it melts again 1 round after he moves. If the contract is already voided, Rimeholt is collected the moment he drops to 0 hit points: chains rise from the fire and drag him in.',
          treasure: 'Rimeholt\'s sash of seals (3,000 gp), a staff of frost and a ring of resistance (fire) from the coin-trays.',
        },
        {
          room: 'Ferry Landing', title: 'Down the River of Lost Souls', encounter: 'Hounds of collection',
          read: 'Behind you, the furnace stair fills with red eyes and the beat of burning hooves. The old ferryman blinks at you. "Going somewhere? I used to know where this went."',
          gm: 'The escape. Hounds and nightmare riders pour down after the heroes. Give the Ferryman his name and he casts off at once and keeps the souls away; otherwise pay a true story each, or row the skiff yourselves through the grasping water. The river carries them out through the Weeping Sluice into Pellingrave harbour at dawn.',
        },
      ],
      wrapUp: 'If Schedule C was struck, the bells of Pellingrave ring the right way round at dawn and forty thousand people wake up never knowing how close it was. If the whole contract was voided, the duke wakes up too, and Rimeholt\'s name appears in the Bureau\'s ledger where the duke\'s used to be.',
    },
  ],
  ending:
    'Success: the city is saved; with Clause 41(c) the duke is free and Rimeholt is collected in his place, screaming objections all the way into the fire. Duke Fennimore pays the heroes 10,000 gp and, red-faced, apologises to Nan Petch\'s family in the town square. Failure: the last bell rings with the case unheard. The carts roll, and Pellingrave falls asleep and does not wake. But the heroes still hold any proofs they found, and an appeal lodged late is heard in six hundred years... unless someone breaks into the Debt Furnace before the souls are melted down. What\'s next: Hell noticed. The Chancellor of Binding (a pit fiend who never leaves her tower) sends the heroes a polite letter offering them jobs, and a less polite one listing every rule they broke on the way out.',
};

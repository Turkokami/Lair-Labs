// The Last Contract: a one-part heist for four heroes of level 19.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function escrow() {
  const b = new MapBuilder('adv-last-contract', 'Escrow, the Vault under Graycrown', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'dungeon-slab' });

  // ======== the Well: the hollow heart of the mountain, a chasm with the Inner Vault on a pillar in the middle ========
  const wr = rng(1919);
  for (let y = 26; y <= 52; y++) {
    const dy = (y + 0.5 - 39) / 13;
    if (Math.abs(dy) > 1) continue;
    const hw = 12 * Math.sqrt(1 - dy * dy) + (wr() - 0.5) * 1.6;
    const x0 = Math.round(40 - hw), x1 = Math.round(40 + hw);
    if (x1 > x0) b.pit(x0, y, x1 - x0, 1);
  }
  b.area('The Well of Escrow', [[29, 27, 23, 25]], {
    read: 'The mountain is hollow. A shaft of black air drops away below you, and far down in it something glows like a coin at the bottom of a fountain. In the middle of the nothing stands a pillar of stone, and on top of it a squat, windowless vault.',
    gm: 'A fall into the Well is 200 feet onto the coin-glow at the bottom (20d6 bludgeoning, max 20d6). Flying over it is possible but the Well is warded: anyone flying who is not wearing a clerk\'s chain must make a DC 19 Constitution save at the start of each turn in the air or fall 60 feet (the ward pulls you down like a weight). Four ways cross it: the Bridge of Oaths (south), the Hanging Stair (north), the Ore Bridge (east) and the hidden Lamplighters\' Ledge (west).',
    label: [33, 30],
  });
  b.props_('chasm-edge', [[33, 52], [47, 52], [29, 34], [50, 42]]).prop('pit-deep', 49, 44).prop('pit-deep', 31, 39);

  // ======== the Inner Vault, on its pillar ========
  b.room('The Inner Vault', 35, 33, 11, 12, {
    mat: 'marble',
    read: 'A round, low chamber of white marble, lit from nowhere. The walls are covered in small brass doors, thousands of them, each the size of a hand and each with its own keyhole. In the middle sits a cube of black iron with no door at all.',
    gm: 'The vault that fights back. Its marble floor is a living ward: anyone without a clerk\'s chain who stands on it at the end of their turn takes 22 (4d10) force damage (DC 19 Constitution save for half). Morrowgate\'s seal ring suppresses this for its wearer and anyone touching them. The brass doors are deposit boxes for lesser contracts (see treasure). The iron cube is the Coffer of Terms; its true door is on the west side (DC 22 Perception to find the seam).',
  });
  b.wallRun(38, 36, 5, 'n').wallRun(38, 40, 5, 's').wallRun(38, 36, 5, 'w').wallRun(42, 36, 5, 'e');
  b.floor(38, 36, 5, 5, 'dungeon-slab');
  b.area('Coffer of Terms', [[38, 36, 5, 5]], {
    read: 'Inside the cube, the air is still and smells of old paper. A single lectern stands in the middle. On it, under a bell of glass, lies a sheet of vellum with a brown signature at the bottom and a red one beside it.',
    gm: 'The Lyrenne Indenture. The glass bell is a glyph: lifting it without the seal ring summons the vault\'s answer at once (start the Midnight Collection fight early, without Sulcantor until midnight). The vellum cannot be burned, cut or dispelled by any ordinary means; only the Unmaking Crucible in the Foundry destroys it. To rewrite it: Notary\'s Quill + Morrowgate\'s seal + Sulcantor\'s true name, then a DC 18 Intelligence (Arcana or Investigation) check to word the change so it holds.',
    label: [40, 38],
  });
  b.door(40, 40, 's', 'locked', 'door-iron').door(38, 38, 'w', 'secret');
  b.prop('lectern-dais', 40, 38).prop('reliquary', 40, 37).prop('trap-rune-threshold', 40, 41, 0, { gm: true }).prop('glyph-trap', 40, 39, 0, { gm: true });
  b.props_('wall-alcove-arch', [[36, 34], [44, 34], [36, 43], [44, 43]]).props_('coffer', [[37, 34], [43, 34]]).props_('strongbox', [[36, 42], [44, 42]]).props_('sconce-magefire', [[35, 38], [45, 40]]).prop('orb-pedestal', 37, 41).prop('plinth-display', 43, 41);
  b.light(40, 34, 15, 20, '#e8f0ff').light(40, 43, 15, 20, '#e8f0ff');
  b.encounter('The Midnight Collection', [35, 33, 11, 12], [['pitFiend', 1], ['ironGolem', 1], ['iceDevil', 1], ['hornedDevil', 1]], 'high');

  // ======== the south: the mountain road, the Tally Gate and the Concourse ========
  b.floor(20, 72, 41, 7, 'dirt').paint(30, 74, 22, 3, 'stone-cobble');
  b.area('Graycrown Road', [[20, 72, 41, 7]], {
    read: 'Snow blows sideways along a road cut into the mountain. Ahead, the cliff has been carved into the face of a giant clerk, eyes shut, hands folded on a ledger. The door into Escrow is the ledger itself, and it is open.',
    gm: 'Escrow keeps bankers\' hours for mortals but never closes to "depositors of the first rank": gods\' heralds, giants, fiends. Tonight three late carriages wait in line. A DC 17 Deception or a forged writ (handout) gets the heroes in as depositors. A DC 15 Investigation along the west cliff finds the drovers\' cut into the Old Delving.',
    label: [38, 77],
  });
  b.props_('tree-pine', [[21, 72], [24, 77], [57, 72], [59, 77]]).props_('boulder', [[22, 74], [58, 75]]).props_('cart', [[45, 75], [50, 75]], 90).prop('wagon', 54, 74, 90).props_('lamp-post', [[33, 73], [46, 73]]).prop('hitching-post', 52, 77).prop('snowdrift', 27, 77).prop('signpost', 30, 77);
  b.light(33, 73, 10, 15).light(46, 73, 10, 15);
  b.start(37, 75, 3, 3);

  b.room('The Tally Gate', 36, 70, 8, 2, {
    mat: 'stone-flagstone',
    read: 'A gate of bronze bars, and behind it two statues that are not statues: tall figures of grey stone with ledgers carved on their chests, and two hulking guardians of riveted iron.',
    gm: 'Every visitor is counted, weighed and named. The golems ask each visitor for their business and their writ. A real or forged writ (DC 18 to forge in advance) passes. Lies to the golems are fine: they only check that the writ is sealed. Fight here and the alarm goes to Wary.',
  });
  b.door(38, 71, 's', 'closed', 'door-iron').door(39, 71, 's', 'closed', 'door-iron').door(40, 71, 's', 'closed', 'door-iron').door(41, 71, 's', 'closed', 'door-iron');
  b.props_('portcullis', [[37, 71], [42, 71]]).props_('scales', [[36, 70], [43, 70]]);
  b.light(39, 70, 10, 15, '#ffd27a');

  b.room('Depositors\' Concourse', 24, 57, 33, 13, {
    mat: 'marble',
    read: 'A hall big enough to hold a cathedral. Its floor is white marble veined with gold, and its ceiling is lost in the dark. Rows of counting desks stand empty; a few clerks in grey still work by green lamps, and a storm giant\'s herald sits on a bench made for him, waiting.',
    gm: 'The public face of Escrow. Night clerks (commoners in grey with brass chains) answer questions with perfect politeness and know nothing useful. A clerk\'s brass chain (DC 16 Sleight of Hand to lift one) quiets the floor ward in the Inner Vault and the flight ward in the Well. The north side opens onto the Overlook and the Bridge of Oaths.',
  });
  b.props_('column-fluted', [[28, 60], [28, 66], [52, 60], [52, 66], [34, 60], [46, 60]]).props_('shop-counter', [[30, 63], [36, 63], [44, 63], [50, 63]]).props_('bench-long', [[26, 68], [54, 68]]).prop('notice-board', 25, 58).prop('statue-tall-robed', 40, 61).props_('chandelier-great', [[32, 65], [48, 65]]).props_('lamp-table', [[31, 63], [45, 63]]).prop('scales', 37, 63).prop('rug-runner', 40, 66, 90).prop('fountain-grand', 40, 68);
  for (const [x, y] of [[32, 65], [48, 65], [40, 61]]) b.light(x, y, 15, 25, '#9cffb0');
  b.encounter('The Tally Gate', [30, 63, 20, 9], [['stoneGolem', 2], ['shieldGuardian', 2]], 'low');

  b.room('The Overlook', 30, 52, 21, 5, {
    mat: 'marble',
    read: 'The Concourse ends in a balcony of carved stone over the Well. A bridge runs out from it into the dark, straight as a ruled line, to the vault on its pillar. Beside the bridge stand two iron giants with their hands on their swords.',
    gm: 'The front door. Anyone may stand here; stepping onto the bridge without a summons from the Archbursar wakes the Oath-keepers.',
  });
  b.props_('statue-tall-winged', [[31, 53], [49, 53]]).props_('brazier-pedestal', [[36, 52], [44, 52]]).prop('telescope', 47, 55).prop('bench', 33, 55);
  b.light(36, 52, 10, 20, '#ffb35c').light(44, 52, 10, 20, '#ffb35c');

  b.floor(39, 45, 2, 7, 'stone-flagstone');
  b.area('Bridge of Oaths', [[38, 45, 4, 7]], {
    read: 'The bridge is ten feet wide with no rail. Words are cut into every paving stone: I WILL HOLD. I WILL RETURN. I WILL NOT ALTER.',
    gm: 'Two iron golems and a shield guardian guard the crossing. They obey the Archbursar\'s seal ring; with it, they kneel. Otherwise they fight anyone who sets foot on the bridge. A creature shoved off falls into the Well. Each paving stone holds a fragment of Morrowgate\'s oath; a DC 20 Arcana check notices the oath says nothing about letting thieves pass when he is "unable to act".',
    label: [40, 48],
  });
  b.encounter('The Oath-keepers', [36, 45, 9, 12], [['ironGolem', 2], ['shieldGuardian', 1]], 'moderate');

  // ======== the west: the Clerks' Halls ========
  b.room('Hall of Desks', 4, 45, 17, 11, {
    mat: 'wood-planks-dark',
    read: 'Three hundred desks in perfect rows, each with an inkpot, a candle and a stool. Pens scratch by themselves on half of them, copying out ledgers with nobody holding them. At the far end, on a raised desk, a very still clerk in a high collar looks up and smiles.',
    gm: 'Chief Clerk Ossery Pinch (rakshasa) runs the night shift with two invisible stalkers bound as messengers. Pinch is bound by contract too and is bored to tears; he will let the heroes pass for a good bribe (an interesting secret, or 5,000 gp, or a promise to steal his own contract from box 4,411 in the Inner Vault). He knows the Notary\'s Quill is in the Seal Room and that the Archbursar is dying. If attacked, he sends a stalker to raise the alarm.',
  });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) b.prop('desk', 6 + c * 4, 49 + r * 2);
  b.prop('lectern', 12, 46).prop('chair-high-back', 12, 47).props_('candle-stand-tall', [[5, 46], [19, 46]]).props_('archive-stacks', [[4, 54], [20, 54]]).prop('scroll-pile', 9, 54).prop('levitating-tome', 15, 54);
  b.light(12, 46, 10, 20, '#9cffb0').light(6, 52, 5, 10).light(18, 52, 5, 10);
  b.encounter('The Night Clerks', [4, 45, 17, 11], [['rakshasa', 1], ['invisibleStalker', 2]], 'low');

  b.room('Seal Room', 4, 59, 8, 8, {
    mat: 'stone-flagstone',
    read: 'A small, hot room that smells of sealing wax. Bowls of wax bubble over little blue flames. In a glass case on the wall, a single black quill floats upright, turning slowly as if writing in the air.',
    gm: 'The Notary\'s Quill: one of three things needed to rewrite a contract. The case is locked (DC 20 Thieves\' Tools) and trapped: opening it any other way fills the room with sealing wax that sets like iron (DC 19 Dexterity save or restrained; DC 22 Athletics to break free). The wax bowls also make perfect forged seals: with an hour and a DC 16 Forgery Kit check, a hero makes a writ good enough for the Tally Gate.',
  });
  b.prop('display-case', 7, 59).props_('cauldron-tripod', [[5, 62], [10, 62]]).prop('workbench', 7, 65).prop('shelf-jars', 4, 65).prop('desk', 10, 64).prop('trap-net', 8, 60, 0, { gm: true });
  b.light(7, 62, 10, 15, '#7ab8ff');

  b.room('Records Stacks', 14, 59, 8, 8, {
    mat: 'wood-planks',
    read: 'Shelves to the ceiling, ladders on rails, and the dry hiss of pages turning by themselves. A brass plaque reads: DEFAULTS, SETTLED, AND FORGOTTEN.',
    gm: 'Every contract Escrow has ever closed is copied here. A DC 17 Investigation (30 minutes) finds the copy of the Lyrenne Indenture: the heroes learn clause fourteen (handout). A second DC 20 check finds a note in the margin, in Morrowgate\'s hand: "If only someone would." A secret door in the south wall (DC 18 Perception) opens on the drovers\' stair to the Old Delving.',
  });
  b.props_('bookcase-ladder', [[14, 60], [21, 60]]).props_('library-stack', [[16, 62], [19, 62], [16, 64], [19, 64]]).prop('reading-nook', 15, 66).prop('book-pile', 20, 66).prop('table-reading', 18, 60);
  b.light(17, 63, 10, 15);
  b.hall(7, 56, 7, 58).door(7, 55, 's', 'closed').door(7, 58, 's', 'closed');
  b.hall(17, 56, 17, 58).door(17, 55, 's', 'closed').door(17, 58, 's', 'closed');
  b.hall(22, 62, 23, 62).door(21, 62, 'e', 'closed').door(23, 62, 'e', 'closed', 'door-double');
  b.hall(21, 52, 23, 57).door(20, 52, 'e', 'closed');

  // ======== the far southwest: the Old Delving (worm country) ========
  b.cave('Old Delving', 10, 74, 8, 4, {
    seed: 77, mat: 'cave-floor',
    read: 'Before it was a bank, Graycrown was a silver mine. Rails run into the dark and stop at a wall of smooth, round tunnel, wide as a house, that something has bored straight through the rock.',
    gm: 'A purple worm lives in the old workings and eats the silver tailings. It is the reason nobody uses the drovers\' way any more. It hunts by tremor: a party that moves at half speed and makes a DC 16 Stealth check (group) gets past while it sleeps. In the worm\'s last tunnel lie the bones of a thief who tried this route a century ago.',
  });
  b.tunnel([[17, 67], [16, 71]], 2, { seed: 78, mat: 'cave-floor' });
  b.tunnel([[17, 75], [21, 75]], 2, { seed: 79, mat: 'cave-floor' });
  b.door(17, 66, 's', 'secret');
  b.props_('mine-rails', [[5, 73], [6, 73], [7, 73], [8, 73]]).prop('mine-cart', 9, 73).prop('ore-pile', 13, 76).prop('pickaxes', 4, 75).prop('giant-ribcage', 12, 72).prop('skeleton-lying', 6, 76).prop('backpack', 7, 76).prop('stalagmites', 15, 73).prop('mine-support', 11, 75);
  b.light(9, 73, 5, 10, '#9fd3ff');
  b.encounter('The worm below', [2, 70, 17, 9], [['purpleWorm', 1]], 'low');

  // ======== the northwest: the Archbursar's tower and the Ledger Garden ========
  b.room("Morrowgate's Sickroom", 4, 2, 9, 10, {
    mat: 'wood-planks-dark',
    read: 'A bedroom like a rich old man\'s anywhere: a canopied bed, too many pillows, a fire. In the bed lies a man so old he looks like paper folded into the shape of a man. Every clock in the room has stopped at eleven minutes to midnight.',
    gm: 'Archbursar Idris Morrowgate (archmage, dying, 8 hit points). His oath forbids him to help any thief by deed. He will talk, though, and he will answer questions with a kind of furious care. If a hero points out the loophole (DC 18 Insight to spot it, or a player just says it) he takes off his seal ring "to wash", sets it on the nightstand, and closes his eyes. He knows Sulcantor\'s true name is filed in the Ledger Garden under the Index Tree.',
  });
  b.prop('bed-canopy', 6, 4).prop('nightstand', 8, 3).prop('fireplace', 4, 9).prop('armchair', 6, 9).props_('candelabra', [[11, 3], [11, 10]]).prop('potion-shelf', 11, 6).prop('rug-round', 8, 7).prop('ring-cushion', 9, 3);
  b.light(5, 9, 10, 15, '#ff9a3c');
  b.room('The Counting Room', 13, 2, 7, 10, {
    mat: 'marble',
    read: 'A brass orrery fills half the room, but its planets are coins: one for every great contract in the vault. One of them, a red-gold coin, is sliding toward a black notch marked TERM.',
    gm: 'The orrery is a clock for every contract in Escrow. Watching it (DC 15 Arcana) tells the heroes exactly how long they have until midnight. A secret door behind the bookcase (DC 19 Perception, or Morrowgate tells them) opens into the Strongrooms. The desk holds the night roster (who is on watch where).',
  });
  b.wallRun(12, 2, 10, 'e').door(12, 6, 'e', 'closed');
  b.prop('orrery', 16, 5).prop('writing-desk', 14, 9).prop('bookcase-secret', 19, 7).prop('globe-stand', 18, 3).prop('astrolabe-stand', 14, 3).prop('stair-spiral', 18, 10);
  b.light(16, 6, 10, 15, '#ffd27a');
  b.hall(20, 7, 24, 7).door(19, 7, 'e', 'secret');

  b.cave('The Ledger Garden', 14, 26, 10, 11, {
    seed: 55, mat: 'grass',
    read: 'A garden grows in the dark. Willow trees hang over a black stream, and their leaves are pages, thousands of them, rustling with small writing. Glowing moths drift between the branches. Somewhere a woman with great white wings is humming to the trees.',
    gm: 'Every contract in Escrow grows a leaf here, and the trees sort them by name: the garden is the vault\'s index. The black stream is ink (drinking it: DC 15 Constitution save or poisoned for an hour and able to speak only in small print). The gardener is Anthemis, a planetar bound by her own old bargain to tend it; two treants are her helpers. The Index Tree, a huge dead willow on the east bank, holds Sulcantor\'s true name on a leaf of red vellum (DC 17 Investigation, 20 minutes, or Anthemis just picks it).',
  });
  b.water(12, 15, 2, 23, false, true).pool(11, 29, 3, 2, true);
  b.floor(12, 22, 2, 1, 'wood-planks').floor(12, 33, 2, 1, 'wood-planks');
  b.props_('bridge-plank', [[12, 22], [12, 33]], 90);
  b.props_('tree-willow', [[8, 20], [18, 18], [6, 31], [19, 32], [21, 25]]).prop('tree-dead', 16, 26).props_('glowing-fungus', [[5, 25], [21, 28], [9, 35]]).props_('mushroom-giant', [[20, 21], [6, 22]]).props_('ferns', [[8, 27], [17, 30]]).props_('flowers', [[15, 20], [9, 24]]).props_('lily-pads', [[11, 29]]).props_('reeds', [[13, 31]]).prop('scroll-pile', 17, 27).prop('bench', 18, 23).prop('statue-tall-winged', 15, 34);
  for (const [x, y] of [[16, 26], [8, 20], [19, 32]]) b.light(x, y, 10, 20, '#cfe9ff');
  b.encounter('The Gardener', [4, 15, 21, 23], [['planetar', 1], ['treant', 2]], 'low');
  b.hall(10, 12, 10, 16);
  b.prop('stairs-up', 10, 13);
  b.tunnel([[12, 44], [10, 40], [12, 36]], 2, { seed: 56, mat: 'cave-floor' });

  // ======== the Lamplighters' Ledge: the secret west way into the vault ========
  b.tunnel([[20, 34], [22, 38], [24, 41]], 1, { seed: 57, mat: 'cave-floor' });
  b.floor(25, 41, 10, 1, 'stone-cobble');
  b.door(24, 41, 'e', 'secret');
  b.area('Lamplighters\' Ledge', [[22, 39, 13, 4]], {
    read: 'A ledge one foot wide runs along the wall of the Well, with iron rings set into the rock above it at arm\'s height. Old lamp-hooks hang from the rings. Nobody has lit them in a long time.',
    gm: 'How the lamplighters reached the vault before the Archbursar lit it with magic. Crossing takes a DC 15 Acrobatics or Athletics check per hero (holding the rings); failure by 5 or more means a fall into the Well. It reaches the vault\'s west side, right by the Coffer\'s hidden door, and the Oath-keepers on the south bridge cannot see it.',
    label: [29, 41],
  });
  b.props_('crumbling-ledge', [[27, 41], [31, 41]]).prop('lantern-hook', 25, 41).prop('rope-coil', 22, 38);

  // ======== the north: the Strongrooms, a maze ========
  const mr = rng(4411);
  const MX = 25, MY = 3, MW = 14, MH = 9;
  const blocked = (i: number, j: number) => (i >= 10 && j <= 3) || (i >= 2 && i <= 4 && j >= 5 && j <= 7);
  const seen = new Set<number>();
  const stack: [number, number][] = [[0, 4]];
  seen.add(4 * MW);
  b.floor(MX, MY + 8, 1, 1);
  while (stack.length) {
    const [i, j] = stack[stack.length - 1];
    b.floor(MX + i * 2, MY + j * 2, 1, 1);
    const next = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as [number, number][])
      .map(([di, dj]) => [i + di, j + dj] as [number, number])
      .filter(([a, c]) => a >= 0 && c >= 0 && a < MW && c < MH && !blocked(a, c) && !seen.has(c * MW + a));
    if (!next.length) { stack.pop(); continue; }
    const [a, c] = next[Math.floor(mr() * next.length)];
    b.floor(MX + i + a, MY + j + c, 1, 1);
    seen.add(c * MW + a);
    stack.push([a, c]);
  }
  // a few extra openings so the maze has loops
  for (let k = 0; k < 16; k++) {
    const i = Math.floor(mr() * (MW - 1)), j = Math.floor(mr() * MH);
    if (!blocked(i, j) && !blocked(i + 1, j)) b.floor(MX + i * 2 + 1, MY + j * 2, 1, 1);
    const i2 = Math.floor(mr() * MW), j2 = Math.floor(mr() * (MH - 1));
    if (!blocked(i2, j2) && !blocked(i2, j2 + 1)) b.floor(MX + i2 * 2, MY + j2 * 2 + 1, 1, 1);
  }
  b.area('The Strongrooms', [[25, 3, 20, 17], [25, 11, 28, 9]], {
    read: 'Narrow passages of black stone, just wide enough for one person, turn and turn again. Every few paces an iron door is set into the wall, each with a number and no handle. The walls hum, very faintly, like a held breath.',
    gm: 'A maze of private strongrooms. The walls shift: once per hour the GM may close one passage and open another. Getting through takes a DC 18 Survival or Intelligence check (or a map from Morrowgate\'s roster, or the Silent Partners\' chalk marks): each failure costs half an hour and one roll on the strongroom doors (a door opens on a glyph: DC 19 Dexterity save, 33 (6d10) force damage, half on a success). Most strongrooms hold dull things: deeds, wills, a god\'s IOU for a single apple.',
    label: [33, 9],
  });
  b.props_('lock-plate', [[27, 3], [31, 7], [37, 3], [41, 11], [27, 19], [43, 17], [49, 13], [51, 19]]).props_('safe', [[25, 15], [37, 19], [47, 15]]).props_('glyph-trap', [[29, 9], [39, 13], [45, 11]], 0, { gm: true }).prop('skeleton-seated', 33, 19).props_('lantern-wall', [[25, 3], [35, 9], [43, 3], [51, 17]]);
  for (const [x, y] of [[25, 3], [35, 9], [43, 3], [51, 17], [31, 19]]) b.light(x, y, 5, 10, '#9cffb0');
  b.hall(21, 11, 24, 11);
  b.tunnel([[19, 17], [21, 14], [21, 12]], 2, { seed: 58, mat: 'cave-floor' });

  b.room('Strongroom of Sealed Debts', 29, 13, 5, 5, {
    mat: 'dungeon-slab',
    read: 'A cramped vault stacked with iron boxes, every one wrapped in chain. Someone has been here very recently: a box lies open, chalk arrows mark the floor, and a cold lantern burns on the ground.',
    gm: 'The Silent Partners\' camp. They opened this room to rest out of sight. The open box held the Archbursar\'s own maze plan, now in Corvo Grell\'s pocket. Corvo\'s orders from his buyer are in his satchel (handout): the buyer\'s seal is Sulcantor\'s.',
  });
  b.floor(34, 15, 1, 1).door(33, 15, 'e', 'closed', 'door-iron');
  b.props_('strongbox', [[29, 13], [33, 13], [29, 17]]).prop('chest-open', 31, 13).prop('lantern-standing', 31, 15).props_('bedroll', [[30, 17], [32, 17]]).prop('gear-pile', 33, 17);
  b.light(31, 15, 5, 10, '#cfe9ff');
  b.encounter('The Silent Partners', [29, 11, 14, 9], [['vampire', 1], ['assassin', 4], ['archmage', 1]], 'moderate');

  b.room('The Great Strongroom', 45, 3, 8, 7, {
    mat: 'marble',
    read: 'The biggest strongroom in Escrow is full of gold, and the gold is breathing. A dragon lies curled on it with her chin on her tail, every scale like a new coin. One eye opens. "You are not the bank," she says.',
    gm: 'Aurisande, an adult gold dragon, lodged her whole hoard here two hundred years ago and sleeps on it whenever she visits "to check the interest". She hates fiends and knew Queen Amarra. If the heroes are honest with her (DC 18 Persuasion; automatic if they show the Indenture or clause fourteen) she will lodge her entire hoard as the surety that redeems Lyrenne. Steal from her and she fights, and she fights well.',
  });
  b.floor(44, 5, 1, 1).door(44, 5, 'e', 'closed', 'door-iron');
  b.prop('dragon-hoard', 48, 6).props_('coin-stacks', [[46, 4], [51, 8]]).props_('treasure-pile', [[51, 4], [46, 8]]).prop('jewelry-box', 52, 6).prop('chalices', 45, 6);
  b.light(48, 5, 15, 20, '#ffd27a');
  b.encounter("Aurisande's Deposit", [45, 3, 8, 7], [['adultGoldDragon', 1]], 'low');

  b.floor(39, 20, 2, 13, 'stone-flagstone');
  b.area('The Hanging Stair', [[38, 20, 4, 13]], {
    read: 'Steps of iron hang from chains over the Well, each one swinging a little on its own. They go down from the strongrooms to the roof of the vault like a ladder hung from a ceiling.',
    gm: 'The clerks\' way. Each hero makes a DC 14 Dexterity save on the way down; on a failure their step swings and drops them: DC 16 Athletics to catch a chain, or fall into the Well. Coming down this way lands the heroes on the vault\'s north side, out of sight of the Oath-keepers.',
    label: [40, 25],
  });
  b.prop('stair-grand', 39, 21).props_('chains-hanging', [[40, 27], [39, 30]]);

  b.hall(53, 6, 62, 6);
  b.door(52, 6, 'e', 'closed', 'door-iron');

  // ======== the northeast: the bound-outsider cells ========
  b.room("Turnkeys' Post", 63, 25, 11, 6, {
    mat: 'stone-flagstone',
    read: 'A guardroom with a fire that burns cold and blue. Three tall, gaunt devils with scorpion tails sit at a table, playing cards with tiles of bone. They look up, all at once.',
    gm: 'Three bone devils serve Escrow as turnkeys under contract. They take bribes in secrets, never in gold (DC 19 Deception or Persuasion with a juicy secret gets the party past). They hold the keys to every cell. If a fight here lasts more than 3 rounds, the alarm rises one step.',
  });
  b.prop('table-cards', 68, 27).props_('chair', [[66, 27], [70, 27]]).prop('key-ring', 72, 26).prop('fire-bowl', 64, 29).prop('weapon-rack', 73, 29).prop('notice-board', 63, 25);
  b.light(64, 29, 10, 15, '#7ab8ff');
  b.encounter('The Turnkeys', [63, 25, 11, 6], [['boneDevil', 3]], 'low');

  b.tunnel([[66, 24], [63, 19], [62, 12], [64, 5]], 3, { seed: 59, mat: 'dungeon-slab' });
  b.area('Gallery of Bindings', [[61, 6, 6, 18]], {
    read: 'A curving gallery, its walls lined with bronze plaques. Each plaque names a creature too large or too old to be kept anywhere else, and the date its debt falls due. Some plaques are glowing.',
    gm: 'The cells of the bound. Behind each plaque a creature waits out a contract it lost. The glowing plaques are cells whose wards are failing. Reading them all takes ten minutes (DC 14 Investigation) and tells the heroes what is behind each door.',
    label: [63, 15],
  });
  b.props_('heraldic-crest', [[63, 9], [63, 20]]).props_('chains-hanging', [[64, 13], [62, 17]]).prop('lantern-hanging', 63, 11);
  b.light(63, 11, 10, 15, '#7ab8ff').light(64, 21, 5, 10, '#7ab8ff');

  b.room('Cell of the Ninth Seal', 68, 12, 10, 10, {
    mat: 'dungeon-slab',
    read: 'Nine circles of silver are set one inside another in the floor. In the middle of the smallest, a shape of black smoke and fire the size of a house stands perfectly still. Eight of the circles shine. The ninth is cracked.',
    gm: 'A balor, bound here for a debt it owes to a god of storms, with three hezrou chained to it as its "collateral". It cannot leave until its term ends in forty years, unless someone breaks the ninth circle. It offers the heroes anything to do it: it swears Sulcantor\'s true name (a lie: the name it gives is its own). Touching the cracked circle (DC 19 Arcana to see it\'s a trap) frees it at once.',
  });
  b.hall(65, 16, 67, 16).door(67, 16, 'e', 'locked', 'door-iron');
  b.prop('magic-circle', 73, 17).prop('summoning-circle', 73, 16, 0, { gm: true }).props_('wall-chains', [[69, 13], [76, 13], [69, 20], [76, 20]]).props_('rune-stone', [[70, 15], [76, 17]]).prop('burning-ground', 72, 19);
  b.light(73, 17, 10, 20, '#ff5a2e');
  b.encounter('The Ninth Seal', [68, 12, 10, 10], [['balor', 1], ['hezrou', 3]], 'moderate');

  b.room("The Titan's Cell", 68, 1, 10, 9, {
    mat: 'stone-flagstone',
    read: 'A storm giant sits on the floor of a cell built for him, knees up, head bowed under the ceiling. Chains of lightning run from his wrists to the walls. He is carving a little boat out of a beam with his thumbnail.',
    gm: 'Thalgrun Deepwake bet the sea against the bank three hundred years ago and lost. He is here until a debt of "one tide" is paid, and nobody has ever worked out what that means. A DC 20 Arcana check (or Morrowgate) knows: the next tide of the sea, which a hero can bottle at the Well\'s spring. Free him (break the chains: AC 19, 60 hit points of force each, two of them; or pay the tide) and he joins the heroes until the night ends, but freeing him sets the alarm to Lockdown.',
  });
  b.hall(65, 5, 67, 5).door(67, 5, 'e', 'locked', 'door-iron');
  b.props_('wall-chains', [[69, 2], [76, 2], [69, 8], [76, 8]]).prop('debris-wood', 71, 7).prop('water-barrel', 76, 5).prop('straw-bed', 74, 3);
  b.light(72, 5, 10, 15, '#bfe0ff');

  b.room('Cell of Small Wishes', 55, 12, 5, 5, {
    mat: 'stone-flagstone',
    read: 'A tiny cell, swept clean, with a teapot on a little table and two cups. A woman of blue smoke sits on the bed and pours.',
    gm: 'A djinni bound for a wish she granted badly. She is lonely and polite. She cannot grant wishes here, but she can carry up to six heroes across the Well in a whirlwind (no ward save) if they promise to bring back word of the sky. She knows the Silent Partners passed her door an hour ago.',
  });
  b.hall(60, 14, 61, 14).door(59, 14, 'e', 'locked', 'door-iron');
  b.prop('table-round', 57, 14).prop('bed', 55, 12).prop('pottery', 59, 16).prop('rug', 57, 15);
  b.light(57, 14, 5, 10, '#bfe0ff');

  // ======== the east: the lava-moat Foundry ========
  b.lava(59, 34, 19, 25);
  b.room('The Foundry', 62, 37, 13, 18, {
    mat: 'stone-flagstone-warm',
    read: 'An island of black iron in a moat of lava. Hammers the size of carts rise and fall on their own. Iron giants stand half-built in their moulds, and a figure of smoke and flame, crowned in brass, walks among them shouting orders.',
    gm: 'Where Escrow builds its golems and melts down void contracts. Zuhrak, an efreeti foreman bound for a thousand years, runs it with two finished iron golems. The Unmaking Crucible (north end) is the only thing that can destroy the Indenture; running it at full heat takes two rounds and a DC 18 Arcana or Smith\'s Tools check, or Zuhrak\'s help. Zuhrak will help for his own release: his contract is in box 9 of the Inner Vault. The lava moat: 55 (10d10) fire damage to anyone who enters it.',
  });
  b.floor(59, 38, 3, 2, 'stone-cobble').floor(68, 31, 2, 6, 'stone-cobble').floor(66, 55, 2, 4, 'stone-cobble');
  b.props_('forge', [[64, 40], [72, 40]]).props_('anvil', [[66, 43], [70, 43]]).prop('cauldron', 68, 39).props_('statue-knight', [[64, 48], [72, 48]]).props_('workbench', [[64, 52], [72, 52]]).prop('tool-wall', 74, 45).prop('ore-pile', 62, 50).props_('magma-vent', [[68, 47], [63, 44]]).prop('steam-vent', 73, 51).props_('lava-river', [[60, 45], [76, 40], [70, 57]]).prop('winch', 61, 38);
  for (const [x, y] of [[68, 39], [64, 40], [72, 40], [68, 50]]) b.light(x, y, 15, 20, '#ff7a2e');
  b.area('The Unmaking Crucible', [[66, 37, 5, 3]], {
    read: 'A crucible as wide as a well, glowing white. Things are sinking in it slowly: a crown, a sword, a sheet of vellum curling at the corners and then not curling at all.',
    gm: 'Void contracts go in here to be unmade. Anything else dropped in takes 70 (20d6) fire damage a round and is gone in three. If the Indenture is fed in, it burns for one full minute; Sulcantor knows the instant it starts and arrives in 1d4 rounds to stop it (run the Midnight Collection here, without the iron golem).',
    label: [68, 38],
  });
  b.encounter('The Crucible Line', [62, 37, 13, 18], [['ironGolem', 2], ['efreeti', 1]], 'moderate');

  b.room('Slag Landing', 55, 35, 4, 8, {
    mat: 'stone-cobble',
    read: 'A stone landing above the lava, stacked with crates of ore. A narrow bridge runs west from it across the Well toward the vault, laid with iron rails for carts.',
    gm: 'Ore carts once carried bullion straight to the vault on the Ore Bridge. A cart still sits on the rails: four heroes can ride it across the bridge in one round (DC 15 Dexterity save to stay in when it hits the buffer at the far end, or 3d6 bludgeoning and prone in the Inner Vault).',
  });
  b.floor(46, 38, 9, 2, 'stone-flagstone');
  b.props_('crate-stack', [[55, 35], [58, 42]]).prop('mine-cart', 56, 38).props_('mine-rails', [[48, 38], [51, 38], [54, 38]]).prop('barrel-group', 55, 41);
  b.light(57, 37, 10, 15, '#ff9a3c');
  b.area('The Ore Bridge', [[46, 37, 9, 4]], {
    read: 'Iron rails on a stone span, no wider than a cart. Heat from the Foundry shimmers along it.',
    gm: 'The east way into the vault. The Oath-keepers on the south bridge can see it and will move to block it if the alarm is at Wary or worse.',
    label: [50, 39],
  });
  b.hall(58, 31, 67, 31).hall(58, 31, 58, 34);

  // the slag run: a service tunnel from the Foundry down to the Concourse
  b.tunnel([[66, 59], [63, 63], [57, 64]], 2, { seed: 60 });
  b.area('The Slag Run', [[56, 59, 12, 7]], {
    read: 'A low tunnel black with soot, its floor scored by a thousand barrows. It is hot as an oven and smells of burned iron.',
    gm: 'The workers\' way from the Foundry to the Concourse. Nobody guards it, but it is in plain sight of the Concourse\'s east door. Heroes coming out of it covered in soot need a DC 14 Deception to pass as Foundry hands.',
    label: [61, 62],
  });
  b.props_('handcart', [[60, 63]]).prop('debris-wood', 64, 61).prop('embers-ash', 66, 60);
  b.door(56, 64, 'e', 'closed');

  return b.build();
}

export const LAST_CONTRACT: Adventure = {
  id: 'last-contract',
  title: 'The Last Contract',
  tagline: 'A kingdom falls due at midnight. Rob the vault-city where gods and fiends keep their bargains, and steal it back.',
  levels: '19',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['heist', 'high level', 'fiends', 'golems', 'epic'],
  pitch:
    'At midnight tonight, the kingdom of Lyrenne falls due. Three hundred years ago, losing a war she could not win, Queen Amarra signed a contract with something from below: victory now, and in three hundred years the realm, its crown and every soul born in it. That contract has been kept ever since in Escrow, the vault-city inside the mountain Graycrown, where gods, titans and fiends lodge their bargains with a banker who never loses a page and never takes a side. Nobody in Lyrenne remembered, until a letter with no name arrived a month ago. Escrow cannot be bought, bribed or ordered. It can only be robbed. You have one night.',
  secret:
    'The holder of the Lyrenne Indenture is the Margrave Sulcantor, a pit fiend who has waited three centuries for this night. At the stroke of twelve, Escrow\'s own magic hands every contract that falls due to its holder in the Inner Vault. If the Indenture is there and unchanged when Sulcantor arrives, Lyrenne is his. Archbursar Idris Morrowgate, four hundred years old and dying tonight, swore an oath of perfect neutrality that binds him and every guard in the mountain: he may not help a thief by deed. But nothing stops him writing a letter. He sent the anonymous letter. Sulcantor is careful: he has hired the best thieves alive, the Silent Partners, to wait inside the vault tonight and make sure nobody tampers with his contract, or to steal it for him if anyone tries. Their leader, the vampire Ilse Mournay, does not know who hired her, and she was born in Lyrenne. Her partner Corvo Grell knows exactly who is paying. Three ways to win: steal the Indenture and burn it in the Unmaking Crucible; rewrite it with the Notary\'s Quill, Morrowgate\'s seal and Sulcantor\'s true name; or redeem it under clause fourteen by lodging a surety of equal worth, such as the gold dragon Aurisande\'s entire hoard.',
  hooks: [
    'Chancellor Merriam Ashgrove of Lyrenne hires the heroes: 50,000 gp, a castle each, and a royal pardon for the robbery, signed in advance.',
    'The anonymous letter (handout) arrives for one of the heroes directly, with a gold key-shaped token that opens the drovers\' cut into the mountain.',
    'One of the heroes has a bargain of their own lodged in Escrow (a patron\'s pact, a family debt, a promise made to a god). It sits in a brass box in the Inner Vault. Tonight is the night to take it back.',
  ],
  tips: [
    'Run the plan. Before play, give the players the floor plan (handout) and fifteen real minutes to plan. Then let them play it out. When the plan breaks, that is the adventure.',
    'Flashbacks: once per session, each player may say "I already took care of that." Set a DC (15 to 20) and a cost (gold, a favour, a spell slot). On a success, they did it before tonight: a forged writ, a bribed clerk, a bottled tide.',
    'The midnight clock: the heroes arrive at six in the evening. Each area searched, fight or long talk takes about half an hour; a short rest takes an hour. The orrery in the Counting Room shows the time. At eleven, Sulcantor\'s heralds (the ice devil and horned devil) take up post on the Overlook. At midnight, he arrives in the Inner Vault.',
    'The alarm has three steps: Quiet, Wary and Lockdown. Each loud fight raises it one step. At Wary, the Oath-keepers watch the Ore Bridge too and the clerks check writs again. At Lockdown, every strongroom door locks, the Turnkeys move to the Gallery of Bindings, and a third shield guardian joins the Oath-keepers.',
    'At level 19, the heroes have teleport, plane shift and wish. Escrow is warded: no teleporting into or out of the mountain, and divination about any contract shows only columns of figures. A wish can win one of the three rewriting keys (quill, seal or true name) but cannot change the Indenture itself: it has a clause against wishes.',
    'Almost every fight can be talked down, bought off or turned: Pinch wants his own contract, Anthemis and Zuhrak want freedom, Ilse would never sell her homeland, Aurisande hates fiends. Reward a good deal the same as a win.',
  ],
  npcs: [
    {
      id: 'pf_lctmerriam', name: 'Merriam Ashgrove', title: 'Chancellor of Lyrenne', kind: 'npc', art: 'noble', shared: true,
      wants: 'Her kingdom still standing at one minute past midnight, at any price.', knows: 'What the Indenture says, that it is held in Escrow, and that the Archbursar has refused every royal request to see it.',
      voice: 'Brisk and dry, counts things on her fingers, and never says "please" when "now" will do.', appearance: 'A small grey woman in a travelling cloak over court silks, a chain of office stuffed in her pocket.',
      backstory: 'She found the Indenture by accident, in a footnote of a footnote, after the letter came. She has told nobody at court, because half of them would sell.',
      gmNotes: 'Waits at the road with a carriage and fresh horses. She will not come inside.',
    },
    {
      id: 'pf_lctidris', name: 'Idris Morrowgate', title: 'Archbursar of Escrow', kind: 'npc', art: 'elder-wizard', monsterId: 'archmage', shared: true,
      wants: 'To die knowing his vault did no evil, without ever breaking his word.', knows: 'Everything about Escrow: every route, every guardian, every contract. And the loophole in his own oath.',
      voice: 'A whisper with perfect grammar. Answers every question with exactly the truth and not one word more.', appearance: 'A tiny, paper-thin old man in a nightshirt with a heavy iron ring on one finger.',
      backstory: 'He founded Escrow so that the powers of the world could make promises and trust them. He has kept every promise lodged with him for four hundred years, including the ones he loathes.',
      gmNotes: 'Archmage stat block, but he has 8 hit points and will not fight. He can never hand over his seal ring, but he can take it off "to wash" and leave it on the nightstand. If the heroes are cruel to him, he simply calls the guards: his oath allows that.',
    },
    {
      id: 'pf_lctsulcantor', name: 'The Margrave Sulcantor', title: 'holder of the Lyrenne Indenture', kind: 'monster', art: 'pitFiend', monsterId: 'pitFiend',
      wants: 'Lyrenne, to the last soul, collected on time and in full.', knows: 'Every word of the Indenture, every loophole in it, and that thieves are in the vault tonight (he hired some of them).',
      voice: 'Warm, patient and courteous, like a family lawyer. Never raises his voice. Calls the heroes "the other parties".', appearance: 'A pit fiend in a long coat of red scales, with a quill tucked behind one horn and spectacles of smoked glass.',
      gmNotes: 'Pit fiend stat block. Arrives at midnight in the Inner Vault with an ice devil and a horned devil; the vault\'s answer (an iron golem) joins him if the Coffer was opened. If the Indenture is gone, rewritten or redeemed, he still fights, but at a quarter of his hit points he stops, bows, and leaves: "The contract is the contract." His true name, Velthoruun-Sulcantor-of-the-Ninth-Ledger, is on a red leaf in the Ledger Garden.',
    },
    {
      id: 'pf_lctilse', name: 'Ilse Mournay', title: 'leader of the Silent Partners', kind: 'monster', art: 'vampire', monsterId: 'vampire',
      wants: 'The job done clean, the fee paid, and nobody saying her crew failed.', knows: 'The maze of the Strongrooms by heart, and every way down to the vault. Not who is paying.',
      voice: 'Soft, amused, a little old-fashioned; hums the same lullaby when she is thinking.', appearance: 'A pale woman in grey silk and soft boots, with a thief\'s rope coiled over one shoulder like a stole.',
      backstory: 'Born in a Lyrenne fishing town two hundred years ago. She still sends money home to a family that has forgotten her.',
      gmNotes: 'Vampire stat block. If she learns her client is a fiend collecting Lyrenne (Corvo\'s orders handout, or DC 20 Persuasion with good proof), she turns on Corvo, and her four assassins follow her. Then she offers to help.',
    },
    {
      id: 'pf_lctcorvo', name: 'Corvo Grell', title: 'the Silent Partners\' mage', kind: 'monster', art: 'court-wizard', monsterId: 'archmage',
      wants: 'The fee, and the second fee Sulcantor promised him alone: a seat at the Margrave\'s table.', knows: 'Who the client is, and that the client means to collect the thieves too once the job is done.',
      voice: 'Fast and fussy, finishes other people\'s sentences, cleans his nails with a knife while he talks.', appearance: 'A thin man in a coat with too many pockets, ink stains to the elbow.',
      gmNotes: 'Archmage stat block. Carries the buyer\'s orders and the Archbursar\'s maze plan. Surrenders the moment the fight turns against him and sells everyone.',
    },
    {
      id: 'pf_lctossery', name: 'Ossery Pinch', title: 'Chief Clerk of the night shift', kind: 'monster', art: 'rakshasa', monsterId: 'rakshasa',
      wants: 'His own contract, filed in box 4,411 of the Inner Vault, so he can finally stop working nights.', knows: 'Where the Notary\'s Quill is kept, the clerks\' routes, and that the Archbursar is dying tonight.',
      voice: 'Purrs. Polite to the point of insult. Corrects grammar mid-threat.', appearance: 'A tall clerk in a high collar and spectacles, his hands always folded so you never quite see them. His eyes catch the light like a cat\'s.',
      gmNotes: 'Rakshasa stat block. Bribable (a fine secret, 5,000 gp, or the promise of box 4,411). If the heroes bring him his contract later, he becomes a friend for life.',
    },
    {
      id: 'pf_lctanthemis', name: 'Anthemis', title: 'gardener of the ledgers', kind: 'monster', art: 'planetar', monsterId: 'planetar',
      wants: 'Her own leaf in the garden to wither and fall, which would set her free.', knows: 'Which tree holds every name, including Sulcantor\'s true name, and which leaves belong to the heroes.',
      voice: 'Slow, kind and sad, like someone reading a bedtime story to a sick child.', appearance: 'A tall woman with grey-white wings, mud on her knees and a pair of pruning shears on her belt.',
      backstory: 'She bargained her service away a thousand years ago to save a city that was destroyed anyway.',
      gmNotes: 'Planetar stat block. She will not let anyone harm the trees. Swear to free her (her contract is in the Inner Vault, box 1) and she picks the red leaf for the heroes herself.',
    },
    {
      id: 'pf_lctzuhrak', name: 'Zuhrak', title: 'foreman of the Foundry', kind: 'monster', art: 'efreeti', monsterId: 'efreeti',
      wants: 'Out. He has made golems for this bank for nine hundred years and has a hundred left to serve.', knows: 'How to run the Unmaking Crucible, and that it is the one thing that can destroy an infernal contract.',
      voice: 'Booming, short-tempered, every sentence an order. Laughs like a forge bellows.', appearance: 'A huge figure of smoke and flame, crowned with a foreman\'s brass ring, ash in his beard.',
      gmNotes: 'Efreeti stat block. If the heroes promise him his contract (box 9 in the Inner Vault), he orders his golems to stand down and runs the Crucible for them.',
    },
    {
      id: 'pf_lctaurisande', name: 'Aurisande', title: 'depositor of the first rank', kind: 'monster', art: 'dragon-gold-adult', monsterId: 'adultGoldDragon',
      wants: 'Her hoard kept safe, and the world to be a little more just than she found it.', knows: 'That she knew Queen Amarra, that she watched her sign, and what clause fourteen means.',
      voice: 'Grand, formal, and suddenly very warm. Says "my dear" to everyone.', appearance: 'An adult gold dragon with spectacles of beaten gold pushed up on her brow, reading a ledger of her own interest.',
      gmNotes: 'Adult gold dragon stat block. Lodging her whole hoard as surety redeems Lyrenne (clause fourteen), but she must be in the Inner Vault to do it before midnight. She will need persuading (DC 18) and a promise that Lyrenne pays her back over a hundred years.',
    },
    {
      id: 'pf_lctthalgrun', name: 'Thalgrun Deepwake', title: 'a titan who bet against the bank', kind: 'npc', art: 'stormGiant', monsterId: 'stormGiant',
      wants: 'To see the sea again.', knows: 'The service tunnels from three hundred years of listening, and that the balor next door is lying about everything.',
      voice: 'Deep and slow as surf. Talks to his little carved boat.', appearance: 'A storm giant with a beard of sea-grey, folded into a cell too small for him, chained with lightning.',
      gmNotes: 'Storm giant stat block. Freed, he fights with the heroes until dawn and then walks out through the front door, through the Tally Gate and its golems if he has to.',
    },
  ],
  handouts: [
    { id: 'lct-letter', title: 'A letter with no name', text: 'To whom it may concern,\nThe Lyrenne Indenture falls due at midnight on the last night of the year. It is held in the Inner Vault at Escrow. It cannot be bought back. It can be redeemed (see clause fourteen), rewritten, or unmade.\nThe drovers\' cut on the west of the road has not been used in a century. There is a reason for that.\nI regret I cannot be of further help.' },
    { id: 'lct-plan', title: 'Floor plan of Escrow, sold by a former clerk', text: 'FRONT: road, Tally Gate (two stone, two iron), Concourse, Overlook, Bridge of Oaths to the INNER VAULT.\nWEST: Clerks\' Halls (Seal Room! Records!), Ledger Garden (the gardener has WINGS), Archbursar\'s tower.\nNORTH: the Strongrooms. "The maze moves."\nEAST: Foundry on a lava moat; cells of the bound behind it ("don\'t open anything").\nAlso: a ledge on the west side of the Well. "Lamplighters used it. Nobody now."' },
    { id: 'lct-writ', title: 'Writ of a depositor of the first rank', text: 'ESCROW under GRAYCROWN\nThe bearer and companions are depositors of the first rank and are to be admitted at any hour, counted, weighed and named.\nSealed: (a blot of green wax with a key pressed in it)\nCounted: ____  Weighed: ____  Named: ____' },
    { id: 'lct-clause', title: 'The Lyrenne Indenture, clause fourteen (copy)', text: '14. This Indenture may be redeemed, and made void in every part, if before the end of its term there be lodged in Escrow, by any party, a surety of worth equal to the realm, freely given and freely received. The Archbursar shall judge the worth.\n(In the margin, in a small shaking hand: "A dragon\'s hoard would do. If only someone would.")' },
    { id: 'lct-orders', title: 'Orders found on Corvo Grell', text: 'C.G.\nThe crew is to wait in the Strongrooms until the eleventh hour, then hold the Hanging Stair. Should any party disturb the instrument, take it and bring it to me at the Overlook.\nThe woman is not to know who I am. When the job is done, the crew is yours to keep or to sell, as agreed.\n(Sealed in red wax with a sigil of a quill crossed with a chain.)' },
  ],
  chapters: [
    {
      id: 'escrow', title: 'One Night in Escrow', level: 19,
      summary: 'A vault-city built inside the hollow mountain Graycrown: a grand concourse, clerks\' halls, a garden whose leaves are contracts, a lava-moat foundry, the cells of bound titans and fiends, a shifting maze of strongrooms, and an Inner Vault on a pillar over a bottomless well, reached by four different crossings.',
      goal: 'Before midnight, steal, rewrite or redeem the Lyrenne Indenture, then survive the Margrave Sulcantor when he comes to collect.',
      map: escrow,
      npcs: [
        { npc: 'pf_lctmerriam', x: 41, y: 76 },
        { npc: 'pf_lctidris', x: 7, y: 5 },
        { npc: 'pf_lctossery', x: 13, y: 47, hidden: true },
        { npc: 'pf_lctanthemis', x: 9, y: 22, hidden: true },
        { npc: 'pf_lctilse', x: 35, y: 15, hidden: true },
        { npc: 'pf_lctcorvo', x: 32, y: 15, hidden: true },
        { npc: 'pf_lctaurisande', x: 48, y: 6, hidden: true },
        { npc: 'pf_lctzuhrak', x: 68, y: 45, hidden: true },
        { npc: 'pf_lctthalgrun', x: 72, y: 5, hidden: true },
        { npc: 'pf_lctsulcantor', x: 41, y: 43, hidden: true },
      ],
      scenes: [
        {
          room: 'Graycrown Road', title: 'The job',
          read: 'Snow blows sideways along the mountain road. The great stone clerk carved into the cliff looks down at you with closed eyes, and somewhere inside the mountain a bell strikes six. Six hours.',
          gm: 'Chancellor Ashgrove gives the heroes the floor plan, the stakes and the deadline, then waits with the carriage. Let the players plan. Ways in: the front door with a writ (real ones cost a favour from a first-rank depositor; forged ones need the Seal Room or a DC 18 forgery in advance), the drovers\' cut into the Old Delving (DC 15 Investigation to find), or bluffing the Tally Gate. Start the midnight clock.',
          handout: 'lct-plan',
        },
        {
          room: 'The Tally Gate', title: 'Counted, weighed and named', encounter: 'The Tally Gate',
          read: 'The bronze gate swings open by itself. Two grey statues step forward on legs like pillars, and a voice like a quill on paper asks: "Your business, and your writ."',
          gm: 'The golems check only that the writ is sealed and that the names on it match what the heroes say (so they must agree on false names in advance). A missing or bad writ means a fight, and the alarm goes to Wary. A clever idea also works: the golems count, weigh and name, so a hero inside a bag of holding is not counted at all.',
          handout: 'lct-writ',
        },
        {
          room: 'Hall of Desks', title: 'The night clerks', encounter: 'The Night Clerks',
          read: 'Three hundred pens scratch in the dark with nobody holding them. At the end of the hall the Chief Clerk takes off his spectacles, polishes them, and says, "We are closed. And yet here you are."',
          gm: 'Ossery Pinch can be fought, bribed or recruited (see his profile). Through the south doors: the Seal Room (the Notary\'s Quill, a trapped case, DC 20 to open safely) and the Records Stacks, where a DC 17 Investigation finds the copy of the Indenture with clause fourteen. A second DC 20 check finds Morrowgate\'s note in the margin.',
          treasure: 'Pinch\'s desk: 3,000 gp in the coins of forty nations and a ring of mind shielding. Each clerk\'s brass chain (six in the halls) quiets the vault\'s wards for its wearer. The Notary\'s Quill (needed to rewrite the Indenture).',
          handout: 'lct-clause',
        },
        {
          room: 'Old Delving', title: 'The worm in the silver', encounter: 'The worm below', optional: true,
          read: 'The rails end at a tunnel bored clean through the rock, round as a pipe and as wide as a house. The floor is warm. It is trembling, very slightly, in a slow rhythm, like breathing.',
          gm: 'The drovers\' way in, and the reason nobody uses it. A group DC 16 Stealth at half speed passes the sleeping worm. Otherwise it erupts from the floor. The secret door to the Records Stacks is at the top of the drovers\' stair (DC 18 Perception from this side, or the token from the anonymous letter opens it).',
          treasure: 'The bones of a thief from a century ago: a ring of invisibility, a portable hole holding 2,000 gp, and a map of the Strongrooms that is out of date (the maze has moved). In the worm\'s gizzard, 5,000 gp of silver and gems.',
        },
        {
          room: "Morrowgate's Sickroom", title: 'The dying banker',
          read: 'The old man in the bed opens his eyes. "Thieves," he whispers, without surprise. "Sit down, please. I am obliged to tell you that I will call the guards if you harm anything. I am not obliged to tell you anything else. Ask."',
          gm: 'Morrowgate answers every question truthfully and minimally. He cannot help by deed. If the heroes work out the loophole (or show him his own letter, which a DC 15 Investigation matches to the papers on his desk), he takes off his seal ring to wash his hands and leaves it on the nightstand. He tells them where the true name is. If anyone is kind to him, he dies at a quarter to midnight with a small smile and the word "finally".',
          treasure: 'The Archbursar\'s seal ring (needed to rewrite the Indenture; it also calms the Oath-keepers and quiets the vault\'s wards). His staff of power stands by the bed: he leaves it, in a written codicil, "to whoever was kind".',
          handout: 'lct-letter',
        },
        {
          room: 'The Ledger Garden', title: 'Where the names grow', encounter: 'The Gardener',
          read: 'Leaves of paper rustle overhead, thousands of them, each covered in tiny writing. Across the black stream stands a dead willow hung with a single red leaf. A winged woman kneels beside it with a pair of shears, and does not look up. "If you have come to cut," she says, "go back."',
          gm: 'Anthemis guards the trees, not the vault. Harm a tree and she fights with her two treants. Talk to her and she shows each hero their own leaf (every bargain they ever made, even small ones). Promise to bring her contract from box 1 of the Inner Vault and she gives them Sulcantor\'s true name. The black ink stream: DC 15 Constitution save if drunk.',
          treasure: 'Anthemis\'s thanks: two potions of supreme healing, and a seed for each hero that grows into a little tree showing, on its leaves, every promise ever made to them.',
        },
        {
          room: "Turnkeys' Post", title: 'Cards with the turnkeys', encounter: 'The Turnkeys', optional: true,
          read: 'Bone tiles click on the table. Three tall devils with scorpion tails look up from their game, and one of them pushes an empty chair toward you with its foot. "Stakes are secrets," it says. "Deal you in?"',
          gm: 'Win a hand (DC 19 Deception or Insight, three rounds) and the turnkeys let the heroes through the Gallery of Bindings. Beyond: the Titan\'s Cell (Thalgrun can be freed: see his profile; Lockdown follows), the Cell of the Ninth Seal (the balor begs to be freed and lies; freeing it starts The Ninth Seal fight, moderate), and the Cell of Small Wishes (the djinni carries heroes over the Well).',
          treasure: 'The turnkeys\' pot: 1,200 gp of bone dice and secrets. Freed, Thalgrun gives a belt of storm giant strength "that I will not need inside a cell, or outside one".',
        },
        {
          room: 'The Foundry', title: 'The Unmaking Crucible', encounter: 'The Crucible Line',
          read: 'Heat hits you like a door slammed in your face. Hammers fall by themselves, iron giants stand half-poured in their moulds, and the foreman, a towering figure of flame, turns and bellows: "Who let you on my floor?"',
          gm: 'Zuhrak and two iron golems. Fight, or bargain: promise Zuhrak his contract from box 9 and he stands his golems down. The Unmaking Crucible destroys the Indenture in one minute; Sulcantor knows at once and comes to stop it (see the Crucible\'s notes). The Ore Bridge from the Slag Landing runs straight to the vault, and the cart can carry four heroes across in one round.',
          treasure: 'A manual of golems (iron) on Zuhrak\'s bench, a flame tongue greatsword in a cooling trough, and 4,000 gp of gold ingots ready for the vault.',
        },
        {
          room: 'The Strongrooms', title: 'The other crew', encounter: 'The Silent Partners',
          read: 'A chalk arrow on the wall. Then another. Then, around a corner, a woman in grey silk sitting on a strongbox, as if she has been waiting for you. "You must be the competition," she says. "Sit. We have until eleven."',
          gm: 'Ilse Mournay, Corvo Grell and four assassins. They will not attack first: Ilse wants to know who else hired a crew. Corvo carries the buyer\'s orders (handout); show them to Ilse and she turns on him. Otherwise, at eleven they move to hold the Hanging Stair and the heroes must fight past them. The maze itself: DC 18 Survival or Intelligence to cross, each failure costs half an hour and a glyph.',
          treasure: 'Corvo: a robe of the archmagi and a crystal ball. The assassins: four potions of invisibility and 2,400 gp. Ilse, if she becomes a friend, gives her lockpicks: +5 to every lock in Escrow, and a promise of one future favour.',
          handout: 'lct-orders',
        },
        {
          room: 'The Great Strongroom', title: 'A dragon checks her interest', encounter: "Aurisande's Deposit", optional: true,
          read: 'Gold to the ceiling, and on top of it a dragon in golden spectacles, reading a ledger by the light of her own scales. She lowers the book. "Well," she says. "Either you are very lost, or very interesting."',
          gm: 'Aurisande is the redemption path. With clause fourteen and an honest plea (DC 18 Persuasion, or automatic if the heroes have the clause and the Archbursar\'s note), she agrees to lodge her entire hoard as surety. She must reach the Inner Vault before midnight; she cannot fly over the Well without a clerk\'s chain or the seal ring, and she will not fit down the Hanging Stair. Getting a dragon to the vault is its own heist. Try to steal from her and she fights.',
          treasure: 'If Lyrenne is redeemed with her hoard, Aurisande gives the heroes one thing from it anyway: a sun blade, "because a promise should be paid in light".',
        },
        {
          room: 'Bridge of Oaths', title: 'The front door', encounter: 'The Oath-keepers', optional: true,
          read: 'The iron giants turn their heads together, with a sound like a portcullis dropping. Words glow on every stone of the bridge: I WILL HOLD. I WILL RETURN. I WILL NOT ALTER.',
          gm: 'The only route the vault expects. With the seal ring held high, the Oath-keepers kneel and the heroes walk across. Otherwise they fight, and they shove heroes off into the Well. Smart parties come in another way: the Hanging Stair, the Ore Bridge, the Lamplighters\' Ledge, or the djinni\'s whirlwind.',
        },
        {
          room: 'The Inner Vault', title: 'The Midnight Collection', encounter: 'The Midnight Collection',
          read: 'Every brass door in the vault clicks open at once. A bell strikes twelve somewhere far above. And in the middle of the white floor, as if he has always been standing there, a giant in a coat of red scales takes off his smoked spectacles and says, "Good evening. I believe you are holding something of mine."',
          gm: 'Sulcantor arrives at midnight with his ice devil and horned devil; an iron golem steps out of the wall if the Coffer was opened without the seal ring. Remember the floor ward (4d10 force at the end of each turn without a chain or the ring). If the Indenture is gone, burned, rewritten or redeemed, Sulcantor fights to save face and leaves at a quarter of his hit points. If the heroes are still in the Coffer when he arrives, he simply reaches for the vellum: a hero holding it must win a contested Strength check each round, or he has it. Allies the heroes made tonight (Ilse, Thalgrun, Zuhrak, Pinch) can arrive to help: let each one take a single turn at the top of a round.',
          treasure: 'The brass deposit boxes: 20,000 gp in deeds and gems, a rod of absorption, a ring of regeneration, a cloak of displacement, and the contracts of Anthemis (box 1), Zuhrak (box 9) and Ossery Pinch (box 4,411). In Sulcantor\'s coat, if he falls: a tome of leadership and influence, bound in red scale.',
        },
      ],
      wrapUp: 'If the Indenture is unmade, rewritten or redeemed by midnight, Lyrenne wakes up on New Year\'s Day still free, without ever knowing how close it came. Merriam Ashgrove pays in full and burns the pardon. If Sulcantor collects, the kingdom passes to him at the stroke of twelve: the heroes can still run, and still fight for it, but now it is a war.',
    },
  ],
  ending:
    'Win: the Indenture is gone, changed or paid, Sulcantor bows and leaves ("the contract is the contract"), and the heroes walk out of the most secure vault in the world with a kingdom in their pockets. Freed Anthemis, Zuhrak, Thalgrun and Pinch become friends worth having, and if Morrowgate died kindly, Escrow passes to whoever he named in his codicil: possibly one of the heroes. Lose: at midnight Lyrenne becomes a province below. Its people do not die; they simply belong to someone, and slowly, the kingdom changes. The heroes can try to win it back by stealing the Indenture from Sulcantor\'s own vault in the hells. What\'s next: every great power that lodged a bargain in Escrow now knows the vault can be robbed. Some of them will want to hire the heroes. Some of them will want them dead. And the balor in the Ninth Seal remembers their faces.',
};

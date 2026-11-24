// Tomb of the Sand King: a trap-filled tomb delve for four heroes of level 8.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function sandKingTomb() {
  const b = new MapBuilder('adv-sand-king-tomb', 'Tomb of the Sand King', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'stone-flagstone-warm' });
  const r = rng(8808);

  // =====================================================================
  // THE DESERT: dunes, the old causeway, the rival camp and the buried door
  // =====================================================================
  b.floor(0, 0, 80, 21, 'sand');
  // wind-cut rock along the far edge of the dunes
  for (let x = 0; x < 80; x++) { const h = Math.floor(r() * 3); if (h) b.rock(x, 0, 1, h); }
  // the pyramid's top steps, poking out of the sand on either side of the door
  b.rock(18, 19, 14, 2).rock(22, 17, 8, 2).rock(48, 19, 14, 2).rock(51, 17, 8, 2);
  // soft dune ridges: hard going
  b.rubble(4, 9, 7, 2).rubble(15, 3, 6, 2).rubble(20, 11, 5, 3).rubble(44, 9, 4, 3).rubble(56, 14, 5, 2).rubble(32, 14, 3, 3).rubble(46, 14, 2, 3);

  b.area('The Dune Sea', [[0, 0, 28, 16]], {
    read: 'Dunes the colour of a lion\'s back roll away to the edge of the world. Yesterday this was flat, empty sand. The storm moved a mountain of it in one night, and now black stone teeth stick up out of the desert where no stone ever was.',
    gm: 'Where the heroes arrive with Zaida Marr. Soft dune ridges are difficult ground. Two patches of quicksand (marked): DC 13 Survival spots the too-smooth sand; a creature that steps in sinks 1 foot per round and is restrained, DC 13 Strength (Athletics) to pull free, 3 failures and it goes under. The storm comes back at sunset tomorrow (see the Sand Clock tip).',
    label: [12, 7],
  });
  b.props_('sand-ripples', [[6, 6], [12, 10], [22, 3], [9, 14]]).props_('desert-rocks', [[2, 12], [18, 8], [25, 13]]).prop('skull-bleached', 10, 4).prop('giant-ribcage', 16, 12).props_('cactus', [[3, 10], [26, 9]]).prop('boulder', 8, 2).props_('quicksand', [[8, 13], [24, 6]]).prop('campfire-cold', 5, 7);
  b.start(3, 3, 3, 3);

  b.area('The dry well', [[0, 16, 8, 5]], {
    read: 'A ring of old bricks pokes out of the sand, round as a mouth, with a cold draught breathing up from it.',
    gm: 'Not a well: the far end of the king\'s escape tunnel (see the Escape Tunnel). From up here it looks like a dry well 20 ft deep with a crawlway at the bottom. DC 15 Survival: the draught means it opens into something big.',
    label: [3, 18],
  });
  b.prop('well', 3, 18).prop('bones', 6, 19).prop('tree-dead', 1, 17);

  b.floor(14, 21, 1, 4, 'sand');
  b.area('The new sinkhole', [[9, 16, 9, 5]], {
    read: 'The sand here pours, slowly and endlessly, into a black hole in the ground, hissing like a kettle.',
    gm: 'The storm cracked the roof of the tomb\'s cistern. Sliding down the sand-chute (30 ft) is easy but loud and lands you in the Flooded Cistern; climbing back up needs a rope or DC 15 Athletics. A quiet back door the rivals have not found.',
    label: [13, 18],
  });
  b.prop('sinkhole', 14, 20).prop('rope-coil', 11, 19).prop('sand-ripples', 16, 17);

  b.paint(39, 2, 3, 19, 'stone-flagstone');
  b.area('Causeway of Kings', [[28, 2, 24, 11]], {
    read: 'A road of flat stones runs out of the sand and straight at the buried pyramid, lined with obelisks. Each one is carved with the same crowned face, smiling at you. The wind howls between them, and the sand dances in tall spinning columns.',
    gm: 'The dust devils are two air elementals, the last of the storm, bound to the causeway. They attack anyone who walks the road without bowing their head at the first obelisk (the oath on it says "bow to your king": handout). DC 14 Religion or Arcana: the spinning sand is alive and bound here. Walk round through the dunes instead and they never notice you. The first obelisk carries the King\'s Oath.',
    label: [40, 6],
  });
  b.props_('obelisk', [[36, 4], [44, 4], [36, 10], [44, 10]]).prop('column-fallen', 32, 7).prop('statue-tall-robed', 47, 3).prop('sand-ripples', 31, 10).prop('skull-bleached', 48, 8).prop('milestone', 38, 12);
  b.encounter('Dust devils on the causeway', [30, 2, 20, 11], [['airElemental', 2]], 'low');

  b.floor(39, 21, 3, 1, 'sand');
  b.area('The half-buried door', [[32, 13, 16, 9]], {
    read: 'At the end of the causeway the sand slopes down into a hollow, and at its bottom stands a doorway taller than three men, half full of sand. Two stone kings sit either side of it, buried to their shoulders, and stare at you.',
    gm: 'The front door. The rivals dug it clear yesterday and pushed on in; one of their diggers lies dead on the slope with a crushed chest (the rolling stone inside got him). DC 12 Medicine: crushed by something huge and round. The doors open with a push.',
    label: [40, 17],
  });
  b.props_('statue-tall-robed', [[36, 16], [44, 16]]).prop('skeleton-lying', 38, 18).prop('debris-wood', 43, 19).prop('pickaxes', 35, 19).prop('sandbags', 45, 18).prop('stairs-down', 40, 20);
  for (const x of [39, 40, 41]) b.door(x, 21, 's', 'closed', 'door-double');

  b.area('Brass Company camp', [[54, 2, 26, 11]], {
    read: 'A camp of striped tents round a cook-fire, pitched beside a muddy little spring. Camels groan at the hitching post. A banner of a brass lantern snaps in the wind, and someone is shouting at the diggers to hurry.',
    gm: 'The rival expedition\'s base: guards, scouts and hired gnoll diggers. Vessa and her best people are already inside. Nadi, a young local digger, is here and wants out. The guards are paid by the day and are scared of the tomb: a DC 15 Persuasion or Intimidation, 100 gp, or the news that Vessa means to leave them behind (her letter) makes them pack up and go. Vessa\'s letter is on the map table in the command tent.',
    label: [64, 6],
  });
  b.prop('tent-command', 62, 4).props_('tent', [[57, 3], [68, 3], [72, 7]]).prop('tent-round', 58, 9).prop('campfire-spit', 64, 8).prop('wagon', 75, 4).prop('table-maps', 63, 6).prop('weapon-rack', 60, 7).props_('bedroll', [[55, 6], [56, 11]]).prop('lantern-standing', 61, 10).prop('hitching-post', 77, 9).prop('war-banner', 66, 5).prop('water-barrel', 66, 11);
  b.pool(74, 11, 2.5, 1.6);
  b.prop('tree-palm', 77, 11).prop('reeds', 71, 10);
  b.light(64, 8, 15, 20).light(61, 10, 5, 10);
  b.encounter('The camp guards', [54, 2, 26, 11], [['veteran', 2], ['scout', 4], ['gnoll', 4], ['bandit', 6]], 'low');

  b.area("The robbers' dig", [[62, 13, 18, 8]], {
    read: 'A winch stands over a square black shaft, braced with planks. A rope runs down into the dark. Every few breaths it twitches.',
    gm: 'Vessa\'s back door: her diggers cut this shaft and tunnel down into the Servants\' Crypts. The rope twitches because the crypt\'s dead are pulling on it. Climbing down is easy (no check).',
    label: [70, 17],
  });
  b.prop('winch', 69, 18).prop('rope-coil', 72, 17).props_('sandbags', [[67, 19], [72, 19]]).prop('crate-stack', 74, 16).prop('lantern-standing', 68, 16).prop('ladder', 70, 20);

  b.tunnel([[70, 21], [73, 27], [77, 33], [76, 40]], 1, { mat: 'sand', seed: 881 });
  b.area("Robbers' tunnel", [[73, 27, 5, 7]], {
    gm: 'A crooked crawl through packed sand and broken stone, braced with planks. Medium creatures squeeze; a fight in here is at disadvantage. Halfway down, the bracing creaks: a DC 13 Perception notices it; any loud spell or a creature over 300 lb brings it down (DC 14 Dexterity save, 11 (2d10) bludgeoning, and the tunnel is blocked).',
    label: [77, 33],
  });
  b.props_('mine-support', [[73, 27], [77, 33]]).prop('lantern-hook', 76, 38);

  // =====================================================================
  // THE TOMB
  // =====================================================================
  b.room('The Sand-choked Stair', 38, 22, 5, 6, {
    read: 'A wide stair runs down into the dark, half buried in sand that hisses away from your boots. Two long grooves are worn into the steps, side by side, as if something heavy has rolled down them many times.',
    gm: 'Trap: a tripwire on the fourth step (DC 15 Perception, or anyone who studies the grooves and the round niche above the door, DC 12 Investigation) drops a stone ball down the stair. Everyone on the stair: DC 15 Dexterity save or 22 (4d10) bludgeoning and knocked prone into the Gallery. The niche can be wedged with a spike (DC 12 Sleight of Hand) and the stone stays put.',
  });
  b.rubble(38, 22, 2, 2);
  b.prop('trap-rolling-boulder', 41, 22, 0, { gm: true }).prop('trap-tripwire', 40, 25, 0, { gm: true }).prop('stairs-down', 40, 23).prop('skeleton-lying', 42, 26).prop('sand-ripples', 39, 26);
  b.floor(39, 28, 3, 1);
  b.prop('archway-grand', 40, 28);

  b.room('The Grand Gallery', 28, 29, 25, 11, {
    read: 'A hall as long as a street, lined with painted columns. On the walls, a carved procession of servants, priests and soldiers walks toward a king on a throne of sand. The floor is a chessboard of tiles: one carved with a sun, the next with a jackal. As you step in, two bronze bowls flare into fire by themselves.',
    gm: 'The hub of the tomb: doors west (cistern and statues), south-west (embalmers), south (scales) and east (the Hourglass). Trap: the jackal tiles are pressure plates; the procession on the wall walks only on suns (DC 13 Investigation, or the rubbing handout). Stepping on a jackal: darts from the walls, DC 15 Dexterity save or 10 (3d6) piercing and DC 15 Constitution save or poisoned for 1 hour. Guards: suits of bronze armour packed with sand, and two mummified spearmen. They only attack those who step on jackal tiles or touch the reliefs: walk on the suns and they stand still.',
  });
  b.props_('column-fluted', [[31, 31], [31, 37], [36, 31], [36, 37], [44, 31], [44, 37], [49, 31], [49, 37]]).props_('banner-hanging-tall', [[33, 29], [47, 29]]).props_('brazier-pedestal', [[38, 30], [42, 30]]).props_('armor-stand', [[30, 30], [50, 30], [30, 38], [50, 38]]).props_('statue-tall-robed', [[34, 34], [46, 34]]).props_('rune-tiles', [[38, 34], [40, 34], [42, 34]]).props_('pressure-plate', [[39, 36], [41, 32], [47, 35]], 0, { gm: true }).prop('trap-darts', 40, 38, 0, { gm: true }).prop('skeleton-lying', 43, 36);
  b.light(38, 30, 15, 20).light(42, 30, 15, 20);
  b.encounter('Sand-filled guardians', [28, 29, 25, 11], [['animatedArmor', 6], ['mummy', 2]], 'low');

  // west: the cistern
  b.floor(25, 33, 3, 1).door(28, 33, 'w').door(25, 33, 'w');
  b.room('The Flooded Cistern', 6, 25, 19, 14, {
    read: 'Rows of pillars stand in black water that fills the hall from wall to wall, with a narrow ledge round the edge. Sand trickles down from a crack high in the roof, and where it lands, the water stirs, as if something under it turned over in its sleep.',
    gm: 'The tomb\'s water store, flooded by the storm. A water elemental bound here as its keeper and a giant constrictor snake that came down the sinkhole. The ledge is slick: DC 12 Acrobatics when hit or knocked. The deep middle is 15 ft deep. The elemental leaves anyone alone who pours an offering of water back into the cistern (from a waterskin) and fights anyone who takes water out. At the bottom (DC 14 Athletics to dive): a drowned priest\'s bronze chest.',
  });
  b.water(7, 26, 17, 12).water(9, 28, 13, 8, true);
  b.rubble(13, 25, 3, 1);
  b.props_('pillar-round', [[10, 29], [14, 29], [18, 29], [10, 34], [14, 34], [18, 34]]).prop('statue-tall-robed', 6, 25).prop('lever', 6, 30).prop('whirlpool', 16, 32, 0, { gm: true }).prop('rowboat', 21, 37).prop('chest', 12, 31, 0, { gm: true }).prop('reeds', 23, 26).prop('offering-bowl', 24, 30);
  b.light(14, 25, 10, 20, '#e8d2a0');
  b.encounter('Keeper of the cistern', [6, 25, 19, 14], [['waterElemental', 1], ['giantConstrictorSnake', 1]], 'low');

  b.floor(16, 39, 1, 5).door(16, 38, 's').door(16, 43, 's');
  b.room('Hall of Moving Statues', 9, 44, 16, 13, {
    read: 'A dozen stone soldiers stand in rows, spears up. The floor between them is scored with long curving scratches. As you watch, with a deep grinding, every statue takes one step.',
    gm: 'Each round the statues shuffle along the scratches in the floor. A creature on a scratch when they move: DC 15 Dexterity save or 16 (3d10) bludgeoning and shoved 10 ft. Wit: walk only where there are no scratches (DC 14 Investigation or Perception to read the pattern, then no saves). Humility: kneel at the seated king at the west wall and every statue stops and grounds its spear (the handout hints "bow where the king sits"). That counts as a mark of courage, not weakness, to the king. The east door leads to the Chasm.',
  });
  b.props_('statue-rotating', [[11, 46], [15, 46], [19, 46], [23, 46], [13, 50], [17, 50], [21, 50], [11, 54], [19, 54], [23, 54]]).props_('statue-tall-knight', [[14, 52], [20, 52]]).prop('statue-tall-robed', 9, 50).prop('prayer-kneeler', 10, 50).prop('trap-crushing-walls', 17, 48, 0, { gm: true }).props_('torch-sconce', [[24, 45], [9, 55]]);
  b.light(16, 50, 15, 20);

  b.floor(16, 57, 1, 3).door(16, 56, 's').door(16, 59, 's');
  b.room('The Garden of Stone', 4, 60, 20, 16, {
    mat: 'dirt',
    read: 'A shaft of sunlight falls from far above into a walled garden. Everything in it is stone: stone palms, stone roses, a stone bird on a stone branch. And people. Stone diggers with stone shovels, a stone soldier with a stone sword half drawn. Someone is humming, and a watering can tinkles.',
    gm: 'The king\'s gardener, Hesset (a medusa), still tends the garden 900 years on, with three basilisks she calls her "lambs" and her snakes. The petrified include two of Vessa\'s people from yesterday. Hesset fights only if attacked, if her garden is damaged, or if anyone tries to steal from it. Blindfolded or looking away, the heroes can talk with her (see her profile). Mercy: talk to her kindly and she shows the hidden ledge across the Chasm and warns that the gilded tomb is a lie. The covered mirror on the north wall is a trap she set for herself long ago; she asks heroes not to uncover it.',
  });
  b.paint(5, 61, 4, 3, 'grass').paint(18, 70, 5, 4, 'grass');
  b.pool(13, 67, 3, 2);
  b.prop('fountain-grand', 13, 67).props_('statue', [[7, 63], [10, 72], [19, 64], [21, 71], [6, 69]]).prop('statue-knight', 17, 73).props_('tree-dead', [[5, 61], [22, 61], [5, 74], [22, 74]]).prop('bush', 18, 69).prop('flowers', 11, 63).prop('hedge', 8, 66).prop('bench', 15, 72).prop('magic-mirror', 9, 61).prop('tree-palm', 20, 66);
  b.light(13, 67, 30, 30, '#ffe7b0');
  b.encounter("The gardener's lambs", [4, 60, 20, 16], [['medusa', 1], ['basilisk', 3], ['giantConstrictorSnake', 2], ['giantVenomousSnake', 4]], 'moderate');

  // south-west of the gallery: the embalmers' workshop
  b.floor(31, 40, 1, 2).door(31, 39, 's').door(31, 41, 's');
  b.room("The Embalmers' Workshop", 30, 42, 8, 7, {
    read: 'Stone slabs with gutters, shelves of jars with animal-headed lids, and hooks for tools. A thief sits against the wall, long dead, still holding out one swollen black hand.',
    gm: 'Trap: the cedar chest on the table has a poisoned needle in its lock (the dead thief is the clue): DC 15 Perception to spot, DC 15 Sleight of Hand to disarm; pricked: DC 15 Constitution save or 11 (2d10) poison and poisoned for 1 hour. Inside: the king\'s signet ring, kept to seal his wrappings. Any mummy servant of the tomb bows to whoever wears it. The spilled embalming oil on the floor is flammable (a spark: 7 (2d6) fire in a 10-ft square). A secret door in the south wall (DC 15 Perception: sand blows from under it) opens on the east ledge of the Chasm.',
  });
  b.prop('alchemy-table', 32, 44).prop('burial-slab', 35, 44).prop('shelf-jars', 30, 42).prop('potion-shelf', 37, 43).prop('cauldron', 33, 47).props_('urn', [[36, 47], [37, 47]]).prop('chest', 34, 46).prop('trap-needle-lock', 34, 45, 0, { gm: true }).prop('skeleton-seated', 30, 47).prop('oil-slick', 32, 46);
  b.floor(34, 49, 1, 1).door(34, 48, 's', 'secret');

  // south of the gallery: the hall of scales
  b.floor(45, 40, 1, 3).door(45, 39, 's').door(45, 42, 's', 'closed', 'door-iron');
  b.room('The Hall of Scales', 39, 43, 13, 11, {
    mat: 'marble',
    read: 'A white hall. In its middle hangs a bronze scale as big as a cart, its left pan weighed down by a stone crown. Around the walls stand plinths holding bronze loaves, golden feathers and a single sword. Words are cut into the floor in a ring around the scale.',
    gm: 'The riddle of weights (handout). A loaf weighs 3 feathers; a sword weighs 2 loaves and a feather; the crown weighs a sword and a loaf, so 10 feathers. There are 4 loaves and 6 feathers. Right answers: 3 loaves and 1 feather, or 2 loaves and 4 feathers. Putting the sword on the scale balances it too, but breaks the rule "no blade": jets of fire from the corner statues, DC 16 Dexterity save or 28 (8d6) fire, half on a success, and a stain on the heroes\' record. Any other wrong answer: blades sweep the floor, DC 16 Dexterity save or 27 (6d8) slashing, half on a success. Right answer: the scale sinks, and a secret door in the east wall grinds open on the Stair of the Heir. The plain door east goes to the Servants\' Crypts, the south door to the gilded tomb.',
  });
  b.prop('scales', 45, 48).props_('plinth-display', [[41, 45], [41, 51], [49, 45]]).prop('weapon-rack', 49, 51).props_('brazier-everburning', [[40, 44], [50, 44]]).props_('trap-fire-statue', [[39, 53], [51, 43]], 0, { gm: true }).prop('trap-blade', 45, 46, 0, { gm: true }).prop('gm-secret-door', 51, 51, 0, { gm: true }).prop('crown-cushion', 44, 48);
  b.light(40, 44, 10, 15).light(50, 44, 10, 15);

  b.floor(52, 51, 3, 1).floor(54, 52, 1, 8).door(51, 51, 'e', 'secret').door(54, 59, 's', 'closed', 'door-iron');
  b.area('The Stair of the Heir', [[52, 51, 3, 9]], {
    read: 'Narrow steps go down between walls painted with stars. The air smells of cedar and old honey.',
    gm: 'The proper road to the king, opened only by the scale\'s right answer. No traps: the king does not trap those who earned the way. Candles light themselves as the heroes pass.',
    label: [54, 55],
  });
  b.prop('stairs-down', 54, 53).prop('candles', 54, 57);
  b.light(54, 57, 5, 10, '#ffd27a');

  // east of the gallery: the hourglass room
  b.floor(53, 33, 3, 1).door(52, 33, 'e').door(55, 33, 'e');
  b.room('The Hourglass Room', 56, 26, 13, 12, {
    mat: 'sand',
    read: 'A square room with a floor of loose sand, sloping down to a low pit in the middle. Above the pit hangs an hourglass of bronze and crystal as tall as a house, its top bulb full. A man sits in the sand up to his chest, very still, with his eyes shut.',
    gm: 'Trap: when anyone reaches the middle, the doors slam (DC 18 Strength to force) and sand pours from vents in the ceiling. Round 2: waist deep, difficult ground. Round 4: chest deep, DC 14 Strength save each round or restrained. Round 6: full, creatures inside start to suffocate. Wit: turning the great hourglass over (it pivots: DC 14 Athletics, or two people) reverses everything: the floor grates open and the sand drains out in 2 rounds. Clue: a carving over the door shows a hand turning an hourglass. Draining the room wakes what lives under the sand: a bulette and two ankhegs. The buried man is Tamir, Nadi\'s brother, alive and parched; pulling him out is a mark of mercy.',
  });
  b.rubble(59, 29, 7, 6);
  b.prop('statue-rotating', 62, 31).props_('trap-vent-grate', [[57, 27], [67, 27], [57, 36], [67, 36]], 0, { gm: true }).prop('sand-ripples', 60, 34).prop('backpack', 66, 30).props_('lever', [[56, 29], [68, 29]]).props_('portcullis', [[56, 33], [62, 37]]).prop('skull-bleached', 58, 35);
  b.light(62, 31, 10, 15, '#e8d2a0');
  b.encounter('What sleeps in the sand', [56, 26, 13, 12], [['bulette', 1], ['ankheg', 2]], 'low');

  b.floor(62, 38, 1, 3).door(62, 37, 's').door(62, 40, 's');
  b.room("The Servants' Crypts", 58, 41, 20, 15, {
    mat: 'dungeon-slab',
    read: 'A long low hall with burial bays on both sides, every bay stacked with wrapped bodies on stone shelves. Bowls of dried bread and little clay cups sit in front of each one. Some of the bowls have been kicked over, and a rope hangs down from a hole in the far corner.',
    gm: 'The king took his household with him: cooks, scribes, grooms and guards, all wrapped and walled up. Vessa\'s diggers broke in through the corner and looted, and now the dead are awake and angry. Steward Ibbu leads them. Show the king\'s signet, or put the stolen goods back and bow (DC 14 Religion or Persuasion), and they stand aside. Ibbu then shows the secret door in the third south bay (the Servants\' Stair to the king). Otherwise they fight. Trap: one niche holds a jar of tomb-dust; breaking it: 15-ft cloud, DC 14 Constitution save or 14 (4d6) poison and poisoned for 1 minute.',
  });
  for (const x of [61, 65, 69, 73]) b.wallRun(x, 41, 4, 'e').wallRun(x, 52, 4, 'e');
  b.props_('tomb-niche', [[59, 42], [63, 42], [67, 42], [71, 42], [75, 42]]).props_('coffin', [[59, 54], [63, 54], [68, 54], [71, 54], [75, 54]]).props_('pillar-square', [[60, 48], [64, 48], [68, 48], [72, 48]]).props_('offering-bowl', [[60, 46], [70, 51]]).prop('candles', 66, 47).prop('skull-pile', 76, 50).prop('rubble-pile', 76, 43).prop('rope-coil', 75, 44).prop('poison-gas', 70, 49, 0, { gm: true }).prop('sconce-witchfire', 58, 48).prop('broken-furniture', 62, 50).prop('gm-secret-door', 67, 55, 0, { gm: true });
  b.light(58, 48, 10, 15, '#9fe0a8').light(66, 47, 5, 10);
  b.encounter('The waking household', [58, 41, 20, 15], [['mummy', 8]], 'moderate');
  b.floor(52, 46, 6, 1).door(51, 46, 'e').door(57, 46, 'e');

  b.floor(66, 56, 1, 7).door(66, 55, 's', 'secret').door(66, 62, 's');
  b.area("The Servants' Stair", [[66, 56, 1, 7]], {
    gm: 'The narrow back stair the servants used to carry the king to his rest. A side door halfway down opens on the Treasury of Offerings.',
    label: [66, 58],
  });
  b.prop('stairs-down', 66, 57);
  b.floor(67, 59, 2, 1).door(68, 59, 'e', 'closed', 'door-iron');
  b.room('Treasury of Offerings', 69, 57, 8, 5, {
    mat: 'marble',
    read: 'A small, glittering room of jars and chests. Right inside the door, a robber lies flat under a stone block the size of a bed.',
    gm: 'Gifts the kingdom sent with its king. Trap: the middle tile drops a second block from the ceiling (DC 14 Perception: the squashed robber, and a seam in the roof). DC 15 Dexterity save or 22 (4d10) bludgeoning and pinned. The king counts it a stain if the heroes empty this room, and a mark of mercy if they take only what they need.',
  });
  b.props_('treasure-urn', [[70, 58], [75, 58]]).prop('offering-bowl', 72, 60).prop('chest', 75, 60).prop('trap-falling-block', 72, 59, 0, { gm: true }).prop('skeleton-lying', 70, 60).prop('gem-bowl', 73, 58).prop('chalices', 76, 59);

  // the chasm and the rope bridge
  b.hall(27, 37, 26, 49, 1).door(28, 37, 'w');
  b.floor(25, 50, 1, 1).door(24, 50, 'e');
  b.room('The Chasm of Faith', 26, 50, 10, 25, {
    read: 'The floor ends. A crack runs across the tomb from north to south, so deep that your torchlight gives up halfway down. A bridge of old rope and planks sags across it, creaking in a wind that blows up from below.',
    gm: 'A 60-ft drop onto rocks and old bones: 21 (6d6) bludgeoning. The rope bridge: each crossing, the first creature makes a DC 12 Dexterity save or a plank breaks (DC 13 Athletics to hang on). Vessa\'s assassin Quill waits on the far ledge to cut the ropes when someone is halfway (DC 15 Dexterity save to grab on, then climb). Hidden way: a narrow stone ledge at the north end (DC 16 Perception, or Hesset tells you) crosses safely but slowly (difficult ground). Courage: crossing the bridge after you know it can be cut counts as a mark of courage. Climbing down and up the far side takes 10 minutes and two DC 15 Athletics checks.',
  });
  b.pit(28, 50, 6, 25);
  b.floor(28, 51, 6, 1).rubble(28, 51, 6, 1);
  b.floor(28, 62, 6, 1, 'wood-planks');
  b.props_('bridge-rope', [[30, 62], [31, 62]]).props_('chasm-edge', [[27, 55], [34, 58]]).prop('crumbling-ledge', 27, 70).prop('bones', 30, 70).prop('pit-deep', 30, 57).prop('lantern-hook', 26, 61).prop('mooring-post', 35, 63).prop('skeleton-lying', 34, 72);
  b.light(35, 61, 5, 10);
  b.encounter('Knife at the bridge', [26, 50, 10, 25], [['assassin', 1], ['spy', 2], ['bandit', 4]], 'low');
  b.floor(24, 62, 2, 1).door(23, 62, 'e');
  b.floor(36, 62, 1, 1).door(35, 62, 'e');

  // the false tomb
  b.floor(44, 54, 1, 5).door(44, 53, 's').door(44, 58, 's', 'closed', 'door-double');
  b.room('The Gilded Tomb', 37, 59, 14, 13, {
    mat: 'marble',
    read: 'Gold. Gold on the walls, gold on the floor, and in the middle a golden coffin with a crowned face on its lid, ringed by candles that never went out. Here lies Ammurak, King of the Sand, says the writing round its edge. A woman in Brass Company colours lies beside it with a sword through her side, not moving.',
    gm: 'A lie, built for robbers. Clues: the name on the coffin is spelled "Amurrak" (DC 13 History, or anyone who has read the oath), the gold is thin leaf over lead (DC 12 Investigation), and the candles have no soot. Opening the coffin drops the ceiling: DC 15 Dexterity save or 22 (4d10) bludgeoning. The two treasure chests are mimics; the swords on the rack fly; three mummies rise from the walls. A secret door in the east wall (DC 18 Perception, or follow the draught that makes the candles lean) opens on the Antechamber of the Heir. Spotting the lie is a mark of wit.',
  });
  b.prop('sarcophagus-effigy', 43, 65).props_('mimic-chest', [[39, 69], [48, 69]]).props_('statue-tall-knight', [[38, 60], [49, 60]]).props_('candelabra-grand', [[40, 64], [47, 64]]).prop('rune-weapon-rack', 49, 63).prop('skeleton-lying', 41, 67).props_('coin-stacks', [[45, 61], [39, 61]]).prop('trap-ceiling-collapse', 43, 66, 0, { gm: true }).prop('gm-secret-door', 50, 66, 0, { gm: true }).prop('urn', 38, 70).prop('banner-hanging-tall', 43, 59);
  b.light(40, 64, 10, 15, '#ffd27a').light(47, 64, 10, 15, '#ffd27a');
  b.encounter('The false king', [37, 59, 14, 13], [['mimic', 2], ['mummy', 3], ['flyingSword', 6]], 'low');
  b.floor(51, 66, 1, 1).door(50, 66, 'e', 'secret');

  // the antechamber and the king
  b.room('Antechamber of the Heir', 52, 60, 5, 11, {
    mat: 'marble',
    read: 'A tall narrow room. At its far end a wall of fire roars from floor to ceiling, white at the heart, and through it you can just see a great door. Words are carved above the flames.',
    gm: 'The words read "The fire burns only those who turn their backs." The fire is an illusion for anyone who walks straight through it without stopping: no damage, a mark of courage. Anyone who flinches, backs away inside it or attacks it takes 18 (4d8) fire. DC 17 Investigation shows it gives no heat. The great door beyond opens by itself once someone has walked through. Vessa and her best fighters come here by whatever way they found, and try to pass first.',
  });
  b.props_('statue-tall-winged', [[52, 61], [56, 61]]).props_('brazier-pedestal', [[52, 69], [56, 69]]).prop('wall-of-fire', 54, 64).prop('trap-rune-threshold', 54, 65, 0, { gm: true }).prop('doors-grand-frame', 56, 66);
  b.light(54, 64, 15, 25, '#fff1c2').light(52, 69, 5, 10).light(56, 69, 5, 10);
  b.encounter("The Brass Company's last push", [52, 60, 5, 11], [['mage', 1], ['banditCaptain', 1], ['gladiator', 1], ['veteran', 2]], 'moderate');
  b.floor(57, 66, 1, 1).door(56, 66, 'e', 'locked', 'door-double');

  b.room("The Sand King's Rest", 58, 63, 19, 14, {
    mat: 'marble',
    read: 'A plain stone room, after all that gold. A simple coffin sits on a low step. Above it a colossus of the king, carved from the bedrock, holds a scale in one hand and a curved sword in the other. Sand falls in a thin bright thread from the ceiling onto the coffin, as it has for nine hundred years. Then a voice, warm and amused: "Well. Let us see what you are."',
    gm: 'King Ammurak\'s ghost appears above his coffin and judges the heroes by what they did in his tomb (see the Marks of the Heir tip). Worthy: he offers his crown, and the colossus (a stone golem) and his two guards kneel. Unworthy, or anyone who grabs the crown without his leave: he tries to possess the grabber (his oath: "I will rule again"), and the colossus and guards attack. The secret door in the south wall (the king shows it to the worthy; DC 18 Perception for others) opens on the Escape Tunnel. When the judgment ends, the tomb begins to sink back into the sand.',
  });
  b.prop('throne-dais', 67, 65).prop('sarcophagus', 67, 70).props_('column-twisted', [[61, 65], [73, 65], [61, 74], [73, 74]]).props_('treasure-pile', [[60, 75], [75, 75]]).prop('coin-stacks', 74, 64).prop('jewelry-box', 60, 64).prop('chalices', 64, 75).prop('reliquary', 70, 75).props_('brazier-everburning', [[63, 68], [71, 68]]).prop('sand-ripples', 67, 72).prop('crown-cushion', 67, 69).prop('banner-hanging-tall', 67, 63).prop('gm-secret-door', 60, 76, 0, { gm: true });
  b.light(63, 68, 15, 20).light(71, 68, 15, 20).light(67, 70, 5, 15, '#ffe7b0');
  b.encounter("The Sand King's judgment", [58, 63, 19, 14], [['stoneGolem', 1], ['ghost', 1], ['mummy', 2]], 'high');

  // the escape tunnel: from the king's chamber all the way round to the dry well
  b.door(60, 76, 's', 'secret');
  b.tunnel([[60, 77], [48, 78], [36, 77], [24, 78], [12, 78], [2, 77], [1, 66], [2, 58], [3, 50], [2, 40], [1, 30], [2, 21]], 1, { mat: 'sand', seed: 882 });
  b.area('The Escape Tunnel', [[1, 56, 3, 22], [3, 76, 58, 3]], {
    read: 'A low tunnel, so long the far end is lost in the dark. Somewhere ahead, sand is pouring.',
    gm: 'The king\'s secret way out, to the dry well in the dunes (about a quarter of a mile). Once the judgment ends, the tomb is sinking: every minute of running, DC 14 Dexterity save or 11 (2d10) bludgeoning from falling stone, and the tunnel fills behind them. Halfway, it runs through a nest of giant scorpions.',
    label: [1, 66],
  });
  b.cave('Scorpion nest', 4, 50, 3, 4, {
    seed: 883, mat: 'sand',
    read: 'The tunnel opens into a sandy hollow full of dry rattling. Pale husks the size of ponies lie piled against the walls, and then one of the husks lifts its tail.',
    gm: 'Four giant scorpions nest here. They have moulted, and the husks look like more of them. A loud noise or bright light (fire, daylight) keeps them back for a round. On the way out the heroes have no time to go round: it\'s fight or run past (each runner gets one attack of opportunity from the nearest scorpion).',
  });
  b.props_('bone-heap', [[3, 47], [5, 53]]).prop('skeleton-lying', 2, 51).prop('giant-ribcage', 5, 49);
  b.encounter('Scorpion nest', [0, 45, 8, 11], [['giantScorpion', 4]], 'low');
  return b.build();
}

export const SAND_KING_TOMB: Adventure = {
  id: 'sand-king-tomb',
  title: 'Tomb of the Sand King',
  tagline: 'A sandstorm has uncovered a king\'s tomb built to test his heir, and a rival expedition is already inside.',
  levels: '8',
  sessions: '1-2 sessions',
  players: '3-5',
  tags: ['dungeon', 'traps', 'desert', 'undead', 'puzzles'],
  pitch:
    'Nine hundred years ago, King Ammurak of Ushmar was buried in the Saffron Waste with a promise: when the sands gave his house back, he would rule again. Two nights ago the worst sandstorm in living memory blew across the Waste, and in the morning a pyramid stood where there had been only dunes. Every treasure-hunter in Amberwell is already riding for it. The storm comes back tomorrow at sunset, and when it does, the sand will take the tomb again.',
  secret:
    'The tomb is a test. Ammurak had no child he trusted, so he built his tomb to find an heir: its trials reward courage, wit and mercy, and he has watched every robber who ever came through the eyes of his statues. His Crown of the Dunes holds the desert asleep. Whoever he judges worthy, he crowns freely, and then at last he rests. But his oath is also a trap: anyone who takes the crown without his leave, or whom he finds unworthy, he possesses, and through them he truly does rule again, with the storm at his back. Magister Vessa Orrin, who leads the rival Brass Company, found half of the king\'s journal and believes the crown is hers by blood (she really is a far descendant). She is clever, ruthless and in a hurry, which makes her exactly the heir the king would possess. Why now: the century storm uncovered the tomb, and the next storm will bury it for another hundred years.',
  hooks: [
    'Zaida Marr, a tomb-scholar of Amberwell, hires the heroes: 1,500 gp each, the treasure split fairly, and she keeps the king\'s records. She has a wagon, camels and a map.',
    'Amberwell\'s council has heard what Vessa Orrin wants the crown for (to bury the river towns that shamed her family) and pays the heroes 6,000 gp to get there first.',
    'One of the heroes dreams of a man with a crown of falling sand who says "Come brave, come clever, come kind." The dream ends with a direction, and the direction is the Saffron Waste.',
  ],
  tips: [
    'Marks of the Heir: keep a tally. Marks of courage, wit and mercy (each area\'s notes say when one is earned). Stains for cruelty, greed and cheating: killing those who surrender, robbing the servants, putting the sword on the scale. Worthy means at least one mark of each kind and more marks than stains.',
    'The Sand Clock: the storm returns at sunset tomorrow. Give the heroes eight "turns of the glass" (about an hour each). A long fight, a short rest or a long detour takes one. At two left, sand starts to pour into the lower halls. At none, the tomb sinks.',
    'Not a straight line: there are three ways in (the front door, the sinkhole, the robbers\' shaft) and three ways to the king (the Stair of the Heir from the scales, the gilded tomb\'s secret door, the Servants\' Stair from the crypts). Let the players choose.',
    'Many fights can be skipped or turned: walk on the sun tiles, kneel to the statues, give water to the cistern, talk to Hesset blindfolded, show the signet to the servants, pay off the camp. Give full XP for a clever way past.',
    'Vessa is always one room ahead or one room behind. Use her people to show the traps working (a dead digger, a petrified guard, a woman in the gilded tomb) before the heroes walk into them.',
    'If the party is strong, add a mummy to the king\'s guard. If it is weak or tired, the colossus only joins the fight on the second round.',
  ],
  npcs: [
    {
      id: 'pf_skzaida', name: 'Zaida Marr', title: 'tomb-scholar of Amberwell', kind: 'npc', art: 'sage', shared: true,
      wants: 'The king\'s written records, unburned and unlooted, and to be the first scholar in a century to walk Ammurak\'s tomb.',
      knows: 'The King\'s Oath by heart, that the tomb was built as a test, and that robbers who went in a hundred years ago never came out.',
      voice: 'Dry and quick, quotes old poets, and says "how marvellous" in a flat voice whenever something is about to kill her.',
      appearance: 'Tall and sun-darkened, wrapped in dusty white cloth, with smoked-glass spectacles and a walking staff with a compass in its head.',
      backstory: 'She has studied Ushmar for thirty years from fragments and rubbings. She and Vessa Orrin were once teacher and student.',
      gmNotes: 'Not a fighter (use the noble stat block if needed). She can read the old script, which helps with the riddles: she gives advantage on History checks in the tomb. If she dies, the king counts it against the heroes only if they abandoned her.',
    },
    {
      id: 'pf_skvessa', name: 'Magister Vessa Orrin', title: 'leader of the Brass Company', kind: 'monster', art: 'mage', monsterId: 'mage', shared: true,
      wants: 'The Crown of the Dunes, which she believes is hers by blood, and the power to bury the river towns that drove her family out.',
      knows: 'Half of the king\'s journal: the tomb is a test, the gilded tomb is false, and there is a servants\' stair from the crypts. She does not know the king means to possess an unworthy heir.',
      voice: 'Soft and exact, never raises her voice, and calls people by their jobs: "digger", "sword", "scholar".',
      appearance: 'A slight woman in a robe of copper thread, black hair streaked grey, with a brass monocle on a chain.',
      backstory: 'Her great-grandmother\'s line goes back to Ammurak\'s sister. Amberwell\'s council stripped her family of its lands two generations ago.',
      gmNotes: 'Mage stat block. She uses fireball on groups and counterspells healing. She will not surrender, but a DC 18 Persuasion with proof (the king\'s own words, or the Oath plus what the heroes saw) that the crown would possess her makes her stop and think. If she reaches the king first, she grabs the crown and the king possesses her.',
    },
    {
      id: 'pf_skdrass', name: 'Captain Drass Kell', title: 'Vessa\'s hired sword', kind: 'monster', art: 'bandit-captain', monsterId: 'banditCaptain',
      wants: 'His pay, and to get out of this hole alive with his people.',
      knows: 'Every member of the company, where the camp keeps its water, and that Vessa sent Quill ahead to "clear the bridge".',
      voice: 'Gravel and jokes. Laughs at his own bad luck. Swears by "the Ten Thirsty Saints".',
      appearance: 'A big, scarred man missing one ear, in sun-black leather and a sand veil, with two curved swords.',
      gmNotes: 'Bandit captain stat block. Can be turned: show him Vessa\'s letter ("no one else reaches the inner tomb") or pay him 500 gp, and he and the veterans walk away or switch sides. Sparing him counts as a mark of mercy.',
    },
    {
      id: 'pf_skquill', name: 'Quill', title: 'Vessa\'s knife', kind: 'monster', art: 'assassin', monsterId: 'assassin',
      wants: 'To finish the job Vessa paid for: nobody crosses the Chasm.',
      knows: 'The bridge can be cut from the east ledge, and Vessa went on toward the gilded tomb.',
      voice: 'A whisper. Never wastes a word, and hums the same four notes while waiting.',
      appearance: 'Slim and veiled in grey, with a tattoo of a quill on one wrist and a long knife in each boot.',
      gmNotes: 'Assassin stat block, with two spies and four bandits hidden on the east ledge. Quill cuts the bridge when the first hero is halfway across, then fights. Runs if reduced below half hit points.',
    },
    {
      id: 'pf_sknadi', name: 'Nadi', title: 'a hired digger', kind: 'npc', art: 'commoner', shared: true,
      wants: 'Her older brother Tamir back. He went down the robbers\' shaft yesterday and never came up.',
      knows: 'The robbers\' shaft comes out in a hall of the dead, the camp guards are scared and underpaid, and Vessa left orders that nobody else may follow her in.',
      voice: 'Fast and nervous, swears by the moon, and goes quiet whenever Drass\'s name comes up.',
      appearance: 'A thin young woman in a dust-coloured scarf, carrying a shovel taller than she is.',
      gmNotes: 'Tamir is alive, buried to the chest in the Hourglass Room. Bringing him back to her earns a mark of mercy and her lasting friendship (she knows a dozen water-holes in the Waste).',
    },
    {
      id: 'pf_skhesset', name: 'Hesset', title: 'the king\'s gardener', kind: 'monster', art: 'medusa', monsterId: 'medusa',
      wants: 'Company that does not turn to stone, and for her garden to be left alone.',
      knows: 'The hidden ledge across the Chasm, that the gilded tomb is false, and that the king "watches everything with the statues\' eyes".',
      voice: 'Gentle and sad, hums while she works, and talks to the stone flowers as if they could hear.',
      appearance: 'A tall woman in a gardener\'s apron, with a veil over a nest of slow green snakes and a little brass watering can.',
      backstory: 'Nine hundred years ago she asked the gods to make the king\'s garden last forever. They answered with her gaze. She has been alone with her stone roses since.',
      gmNotes: 'Medusa stat block. She fights only to defend the garden. Heroes who talk to her blindfolded or looking away, and treat her kindly, earn a mark of mercy. She begs them not to uncover the mirror.',
    },
    {
      id: 'pf_skibbu', name: 'Steward Ibbu', title: 'keeper of the king\'s household', kind: 'monster', art: 'mummy', monsterId: 'mummy',
      wants: 'The household\'s rest undisturbed, and to serve the true heir when one comes.',
      knows: 'The secret door in the third south bay to the Servants\' Stair, and that the king judges everyone who comes.',
      voice: 'A dry rustle, and very formal court speech: "The household greets you. The household is displeased."',
      appearance: 'A tall mummy in faded blue linen, holding a steward\'s staff topped with a bronze hand.',
      gmNotes: 'Mummy stat block, leader of the crypt\'s eight mummies. Bows to the king\'s signet. Put back what the robbers stole and bow, and he shows the way himself.',
    },
    {
      id: 'pf_skammurak', name: 'King Ammurak', title: 'the Sand King', kind: 'monster', art: 'ghost', monsterId: 'ghost',
      wants: 'A worthy heir to take his crown, so the desert stays asleep and he can rest. Failing that, a body to rule again through.',
      knows: 'Everything the heroes did in his tomb: he has watched them through his statues the whole way.',
      voice: 'Warm, amused and very old. Laughs out loud at cleverness and goes cold and quiet at cruelty.',
      appearance: 'A tall, see-through man with a crown of sand that endlessly pours down and builds itself again, and eyes like two embers.',
      backstory: 'A good king in a hard land, who held back the desert for sixty years with the crown he made. His only son was cruel, so he built a tomb to find a better heir.',
      gmNotes: 'Ghost stat block. Judges by the Marks of the Heir. Possesses the unworthy or anyone who grabs the crown; while he possesses someone the colossus fights beside them. Driven out of his host and reduced to 0 hit points, he fades, laughing: "Perhaps next time."',
    },
    {
      id: 'pf_skwarden', name: 'The Heir-Weigher', title: 'colossus of the king', kind: 'monster', art: 'stoneGolem', monsterId: 'stoneGolem',
      wants: 'Nothing. It obeys the king, or the king\'s crowned heir.',
      knows: 'Nothing but its orders.',
      voice: 'No voice. Grinding stone, and a deep hum when it lifts its scale.',
      appearance: 'A sandstone statue of the king fifteen feet tall, with a scale in one hand and a curved sword in the other.',
      gmNotes: 'Stone golem stat block. Kneels to a crowned, worthy heir and will serve them while they stay in the tomb.',
    },
  ],
  handouts: [
    {
      id: 'kings-oath', title: 'The Oath of Ammurak',
      text: 'Carved on the first obelisk of the causeway:\n\nWhen I am dust, the sand will take my house.\nWhen the sand gives it back, I will rule again.\nLet whoever would wear my crown come brave, come clever, come kind.\nThe rest I will keep.\nBow to your king.',
    },
    {
      id: 'vessa-letter', title: 'Orders on the map table',
      text: 'Drass,\nThe crown is mine by blood, and I will not share the road to it. No one else reaches the inner tomb: not the scholar, not her hirelings, not your men if they turn greedy. Quill holds the bridge. The journal says the servants\' stair begins in the crypts, in the third bay on the south side. Find it before the scholar does.\nThe gold coffin is a lie. Let the diggers open it anyway.\n- V.O.',
    },
    {
      id: 'procession', title: 'A rubbing of the gallery wall',
      text: 'Walk on the sun, not on the jackal.\nBow where the king sits, and his stone men stand still.\nTurn the glass, and the sand goes home.\nWeigh with an empty hand.\nFaith crosses the deep.\nThe fire burns only those who turn their backs.',
    },
    {
      id: 'scales-riddle', title: 'The ring around the scale',
      text: 'A loaf weighs three feathers.\nA sword weighs two loaves and a feather.\nThe crown weighs a sword and a loaf.\nBalance the crown, and lay no blade upon my scale.',
    },
  ],
  chapters: [
    {
      id: 'tomb', title: 'Into the Tomb of the Sand King', level: 8,
      summary: 'A pyramid-tomb uncovered by a sandstorm: dunes and a rival camp outside, then a maze of trials inside (a gallery of trap tiles, a flooded cistern, moving statues, a sand trap, a riddle of weights, a stone garden, a rope bridge over a chasm, a false tomb and the crypts of the king\'s servants), with the real burial chamber hidden at the end.',
      goal: 'Reach King Ammurak before Vessa Orrin does, prove worthy of his crown (or stop anyone unworthy from taking it), and get out before the sand takes the tomb again.',
      map: sandKingTomb,
      npcs: [
        { npc: 'pf_skzaida', x: 5, y: 4 },
        { npc: 'pf_sknadi', x: 66, y: 10 },
        { npc: 'pf_skquill', x: 34, y: 60, hidden: true },
        { npc: 'pf_skhesset', x: 13, y: 64, hidden: true },
        { npc: 'pf_skibbu', x: 66, y: 49, hidden: true },
        { npc: 'pf_skvessa', x: 54, y: 67, hidden: true },
        { npc: 'pf_skdrass', x: 53, y: 68, hidden: true },
        { npc: 'pf_skammurak', x: 67, y: 68, hidden: true },
        { npc: 'pf_skwarden', x: 67, y: 66, hidden: true },
      ],
      scenes: [
        {
          room: 'The Dune Sea', title: 'The storm\'s gift', handout: 'kings-oath',
          read: 'The sun comes up red over a desert that has changed shape overnight. Ahead, black stone steps stand out of the sand, and a road of obelisks leads to a buried door. To the east, smoke rises from someone else\'s camp.',
          gm: 'Zaida shows the heroes the Oath (from her notes, or read it off the first obelisk). Start the Sand Clock at eight. Three ways in: the causeway to the front door (dust devils, unless they bow), the new sinkhole into the cistern, or the rivals\' shaft from their camp. Watch for quicksand on the way.',
        },
        {
          room: 'Brass Company camp', title: 'The rivals\' camp', optional: true, encounter: 'The camp guards', handout: 'vessa-letter',
          read: 'The guards look up from their fire with their hands on their swords. None of them looks happy to be here, and all of them keep glancing at the shaft.',
          gm: 'Talk, pay or fight. The guards leave for 100 gp, a DC 15 Persuasion or Intimidation, or if shown Vessa\'s letter (on the map table in the command tent; DC 14 Stealth to slip in and read it). Nadi begs the heroes to find her brother and tells them the shaft comes out "in a hall full of the dead". Sparing the guards who give up is a mark of mercy.',
          treasure: 'The camp strongbox: 400 gp, three potions of healing and a spare camel.',
        },
        {
          room: 'The Sand-choked Stair', title: 'The rolling stone',
          read: 'The door groans open on a dark stair. Sand slides down it ahead of you, whispering, into a hall lit by sudden fire.',
          gm: 'The tripwire and the rolling stone (DCs in the area notes). The dead digger outside is the warning. A good start for the Marks of the Heir: spotting it is a mark of wit.',
        },
        {
          room: 'The Grand Gallery', title: 'Walk on the sun', encounter: 'Sand-filled guardians', handout: 'procession',
          read: 'The carved procession on the wall walks toward the king with tiny careful steps. Down the hall, empty suits of bronze armour stand with their spears raised, and sand trickles from the joints of their gauntlets.',
          gm: 'The rubbing of the wall is the key to half the tomb (give the handout to anyone who studies it, DC 12 Investigation, or at once if Zaida is with them). Walk on the suns and nothing moves. Step on a jackal: darts, and the guardians attack. Choose a road from here: west, south-west, south or east.',
        },
        {
          room: 'Hall of Moving Statues', title: 'The stone soldiers',
          read: 'With a sound like a mill grinding, the stone soldiers step, turn and step again, and their spear-points sweep the air where you were about to walk.',
          gm: 'Read the scratches (DC 14) or kneel to the seated king and they stop. Otherwise each round in the room risks 16 (3d10). Kneeling counts as a mark of courage: it takes nerve to kneel among moving blades. The Flooded Cistern to the north is optional: give water and the keeper lets you pass.',
        },
        {
          room: 'The Garden of Stone', title: 'The gardener', encounter: "The gardener's lambs",
          read: 'The humming stops. From behind a stone palm a woman\'s voice asks, very politely, "Please don\'t look at me. I would so hate to add you to the roses."',
          gm: 'Hesset is a medusa, and she means it kindly. Close your eyes and talk: she is lonely and starved of news. Kindness earns a mark of mercy, the secret of the ledge and the truth about the gilded tomb. Harm the garden or attack her, and her basilisks and snakes join in. Never uncover the mirror unless the heroes want her dead: a medusa who sees her own face in it must make a DC 13 Constitution save or be petrified.',
          treasure: 'Hesset\'s gift to friends: a stone rose that is a scarab of protection in disguise. From the petrified rivals: 220 gp and a wand of web.',
        },
        {
          room: 'The Hourglass Room', title: 'The sand trap', encounter: 'What sleeps in the sand',
          read: 'The doors boom shut behind you. High above, iron grates slide open, and sand begins to fall, first a whisper, then a roar.',
          gm: 'Six rounds to turn the glass (DC 14 Athletics, or two people). Then the floor drains, Tamir can be dragged out, and the bulette and ankhegs burst up out of the draining sand. Pulling Tamir out is a mark of mercy; turning the glass is a mark of wit.',
          treasure: 'In the drained pit, the bones of old robbers: 310 gp, a +1 shield and boots of striding and springing.',
        },
        {
          room: 'The Hall of Scales', title: 'The riddle of weights', handout: 'scales-riddle',
          read: 'The great scale creaks as you come in, swinging just a little, as if something invisible had touched it. The stone crown sits heavy in its pan.',
          gm: 'Answer: 3 loaves and 1 feather, or 2 loaves and 4 feathers. The sword balances it too, and burns them for cheating (and costs a stain). Right answer: a mark of wit and the Stair of the Heir opens. Zaida gives advantage on any Intelligence check to work it out, but let the players do the sums.',
        },
        {
          room: 'The Chasm of Faith', title: 'The rope bridge', encounter: 'Knife at the bridge',
          read: 'The bridge sways under you. Below, the wind moans out of the dark. On the far ledge, something grey moves, and you hear four soft notes, hummed.',
          gm: 'Quill cuts the ropes when the first hero is halfway (DC 15 Dexterity save to grab on). Then the ambush from the east ledge. Crossing after they know the danger is a mark of courage. Hesset\'s ledge at the north end avoids the bridge altogether. The secret door from the embalmers\' workshop also comes out on the east ledge, behind Quill.',
          treasure: 'Quill\'s purse: 150 gp and a potion of invisibility. From the embalmers\' workshop nearby: the king\'s signet ring (500 gp, commands the tomb\'s mummies).',
        },
        {
          room: 'The Gilded Tomb', title: 'The false king', optional: true, encounter: 'The false king',
          read: 'The golden face on the coffin smiles at you, and the candles all lean the same way, as if a breeze were blowing toward the east wall.',
          gm: 'The misspelled name and the leaning candles are the clues. Opening the coffin drops the ceiling and wakes the guards. The Brass Company woman by the coffin is still alive (DC 10 Medicine); saving her is a mark of mercy, and she says Vessa went on through the east wall. The secret door east leads to the Antechamber.',
          treasure: 'Real gold under the fake: 900 gp in coins, a gilded mask worth 250 gp, and in one mimic\'s belly a periapt of wound closure.',
        },
        {
          room: 'Antechamber of the Heir', title: "The Brass Company's last push", encounter: "The Brass Company's last push",
          read: 'Vessa Orrin stands before the wall of fire with her captain and her best blades, and turns to you with a small, tired smile. "Scholar\'s hirelings. Of course. You can watch me go first."',
          gm: 'Vessa came by the Servants\' Stair (or right behind the heroes). Drass can be turned with her letter or 500 gp. Vessa can be talked down only with proof the crown would possess her (DC 18). Whoever wins, someone has to walk through the fire: straight through is harmless and a mark of courage; flinching burns (18 (4d8) fire).',
          treasure: 'Vessa\'s spellbook, her half of the king\'s journal (Zaida will pay 1,000 gp for it), a ring of protection and 300 gp.',
        },
        {
          room: "The Sand King's Rest", title: "The Sand King's judgment", encounter: "The Sand King's judgment",
          read: 'The thread of falling sand stops in mid-air. A tall shape made of light and dust rises from the coffin and looks at each of you in turn, as if he were reading a list. "I watched you all the way," says the Sand King. "Now. Shall I crown you, or shall I wear you?"',
          gm: 'Count the Marks of the Heir out loud with the king, who remembers every one. Worthy: he offers the crown to one hero. Taking it means becoming his heir: the hero gains the Crown of the Dunes (attunement: immune to heat and sandstorms, can speak with desert beasts, once per day call a sandstorm 100 ft across for 10 minutes), the colossus kneels, and the king fades into peace. Refusing is also fine: he laughs, blesses them (each hero gains inspiration) and shows the escape tunnel. Unworthy, or if anyone grabs the crown: he tries to possess them and the colossus and two guards attack. Either way, the tomb starts to sink: run for the Escape Tunnel and through the Scorpion nest to the dry well.',
          treasure: 'The king\'s grave goods: 2,500 gp in old gold, a sun blade, a decanter of endless water, a figurine of wondrous power (golden lions), a cloak of protection, and gems worth 1,200 gp. The worthy get them as gifts; the unworthy have to carry them out of a sinking tomb.',
        },
      ],
      wrapUp: 'The heroes burst out of the dry well as the storm rolls in behind them. Within the hour the pyramid is gone under the dunes, and the desert is flat again. Whatever they carried out is theirs; whatever they left is the sand\'s for another hundred years.',
    },
  ],
  ending:
    'Win: a worthy hero wears the Crown of the Dunes, the king rests at last, and the caravans of the Saffron Waste travel safer for a lifetime (Zaida writes the book that makes everyone famous). Or the heroes refuse the crown, Vessa is stopped, and the tomb sinks with the king still waiting. Lose: Vessa, or a greedy hero, takes the crown and the king rides them out of the tomb; the storm does not stop, and within a month the dunes are marching on Amberwell. Next: a possessed queen of sand to be freed, or, if the heroes took the crown, the river towns that want a desert ruler on their side, and Vessa\'s family, who still think the crown belongs to them.',
};

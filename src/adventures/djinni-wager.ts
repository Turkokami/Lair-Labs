// The Djinni's Wager: a game show of the gods for four heroes of level 11.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, type Side } from './builder';
import type { Adventure } from './types';

/** A one-square path from a to b that steps only along rows and columns: rope lines and wind bridges. */
function skyLine(b: MapBuilder, ax: number, ay: number, bx: number, by: number, mat: string, w = 1) {
  const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
  let px = ax, py = ay;
  b.floor(px, py, w, w, mat);
  for (let s = 1; s <= n; s++) {
    const x = Math.round(ax + ((bx - ax) * s) / n), y = Math.round(ay + ((by - ay) * s) / n);
    while (px !== x) { px += Math.sign(x - px); b.floor(px, py, w, w, mat); }
    while (py !== y) { py += Math.sign(y - py); b.floor(px, py, w, w, mat); }
  }
}

function hollowgale() {
  const b = new MapBuilder('adv-djinni-wager', 'Hollowgale, palace of the Grand Games', 80, 80, { open: true, floor: 'ice', ambient: 'bright', wallStyle: 'stone', theme: 'stone' });

  // ---------- the open sky: a long fall between every island ----------
  b.pit(0, 0, 80, 80);

  // ---------- the Gate of Welcomes: where the heroes blow in ----------
  b.cave('The Gate of Welcomes', 40, 72, 8, 5, {
    seed: 11, mat: 'ice',
    read: 'A whirlwind sets you down on a cloud as soft as a mattress. Trumpets blare out of thin air. A marble arch towers over you, and a voice as big as the sky booms: "CONTESTANTS! WELCOME... TO THE GRAND GAMES!"',
    gm: 'The arrival point. Prince Saffiruz greets every team in person, very loudly, and the judge Ysquel hands out the rules (handout). Guests without a proper invitation (the rain-envoy\'s summons counts) or who insult the host meet the gate wardens. Ask each team for a team name: the prince writes it on the sky in letters of cloud.',
  });
  b.paint(36, 69, 9, 6, 'marble');
  b.prop('portal-arch', 40, 76).props_('statue-tall-winged', [[35, 70], [45, 70]]).props_('banner-pole', [[37, 68], [43, 68], [34, 73], [46, 73]]);
  b.prop('lectern-dais', 40, 70).prop('notice-board', 43, 71).props_('obscuring-cloud', [[33, 75], [47, 75]]).prop('temple-bell', 37, 71);
  b.light(40, 71, 10, 20, '#e8f4ff');
  b.start(38, 73, 3, 2);
  b.encounter('Gate wardens', [33, 67, 15, 10], [['airElemental', 2], ['griffon', 1]], 'low');

  b.floor(39, 52, 3, 15, 'marble');
  b.area('The Bridge of Welcome', [[39, 53, 3, 13]], {
    read: 'A marble bridge with no supports at all runs up to the palace. Far below it, clouds roll like surf. The wind tugs at your cloaks, playfully, and then not so playfully.',
    gm: 'Gusts: anyone who stops on the bridge makes a DC 13 Strength saving throw at the end of their turn or slides 10 ft toward the edge. The Games\' catch-winds save anyone who falls anywhere but the Storm Engine: they are blown back to the Gate 1d4 rounds later, dizzy and embarrassed, and their team loses 1 laurel.',
    label: [40, 59],
  });
  b.props_('lamp-post', [[39, 56], [41, 61]]).prop('stair-grand', 40, 53).prop('banner-pole', 41, 64);

  // ---------- the palace: a cloud with a marble city on top ----------
  b.cave(null, 40, 38, 16, 13, { seed: 12, mat: 'ice' });
  b.floor(26, 25, 29, 27, 'marble');

  b.building("The Vizier's Study", 27, 27, 7, 8, {
    mat: 'wood-planks-dark',
    read: 'A cramped room that smells of ink and hot metal. Shelves lean under ledgers and scrolls, and on the desk a pair of bone knucklebones sits under a glass dome, as if they were precious.',
    gm: 'Grand Vizier Nessarine\'s hidden office: no door on the outside, only two secret doors (DC 18 Perception or Investigation from either side): one behind a tapestry in the Feast Hall, one onto a ledge where her hidden rope line runs up to the Storm Engine. Her desk drawer has a glyph of warding (DC 17 Investigation to spot; DC 17 Dexterity save, 22 (5d8) thunder damage). Here: the ledger (handout), the loaded knucklebones that won the wager, and the twin of the whisper-shell she uses to feed answers to the Brass Kettles.',
  });
  b.door(30, 34, 's', 'secret').door(29, 27, 'n', 'secret');
  b.props_('bookshelf-tall', [[27, 28], [27, 31]]).prop('writing-desk', 31, 29).prop('display-case', 32, 32).props_('scroll-pile', [[28, 33], [33, 28]]).prop('crystal-ball', 30, 31).prop('glyph-trap', 31, 30, 0, { gm: true }).prop('map-cabinet', 33, 33);
  b.light(31, 30, 5, 10, '#ffd9a0');
  b.encounter("The vizier's keepers", [28, 28, 5, 6], [['invisibleStalker', 2]], 'low');

  b.building('Hall of the Restless Throne', 35, 26, 11, 9, {
    mat: 'marble',
    read: 'Pillars of white marble hold up nothing: the hall has no roof, only sky. In the middle a throne of polished cloud spins slowly on its own, and on it lounges a blue giant in silks, chin in hand, looking terribly bored.',
    gm: 'The prince holds court here between contests. Talking to him is a game in itself: he loves flattery that is clever (DC 17 Persuasion) and hates flattery that is lazy (fail by 5 and he turns the speaker into a weathervane until the next gong, harmlessly). He will not hear an accusation without proof, and once he has proof he cannot ignore it: a wager won by fraud is void by his own oldest law.',
  });
  b.door(40, 26, 'n', 'closed', 'door-double').door(39, 34, 's', 'open', 'door-double').door(40, 34, 's', 'open', 'door-double').door(45, 30, 'e', 'locked', 'door-iron');
  b.props_('column-fluted', [[36, 27], [44, 27], [36, 32], [44, 32]]).prop('throne-dais', 40, 29).prop('rug-runner', 40, 32).props_('brazier-pedestal', [[38, 28], [42, 28]]).prop('statue-rotating', 37, 30);
  b.light(40, 29, 10, 20, '#bfe3ff');

  b.building("The Prince's Treasury", 46, 27, 8, 8, {
    mat: 'marble',
    read: 'A round room heaped with the winnings of a thousand bets: crowns, a ship in a bottle the size of a real ship, a whole orchard of silver trees. On a velvet cushion by itself lies one rolled-up scroll tied with a blue ribbon.',
    gm: 'Locked (DC 20 thieves\' tools; the prince and the vizier have keys). A secret panel on the east wall (DC 18 Perception) opens onto the treasury balcony. The scroll is the wager itself (handout): read carefully, it says the dice were "the vizier\'s own". Two shield guardians and three bound air elementals guard it. They stop attacking anyone who says the prince\'s password, "Again!" (the vizier knows it; so does a DC 20 Insight check while watching the prince).',
  });
  b.door(53, 31, 'e', 'secret');
  b.props_('treasure-pile', [[47, 28], [52, 28], [47, 33]]).prop('crown-cushion', 50, 30).props_('plinth-display', [[48, 31], [51, 33]]).prop('chalices', 52, 32).prop('ring-cushion', 49, 33).prop('treasure-urn', 52, 30).prop('magic-cloak', 47, 31);
  b.light(50, 30, 8, 15, '#ffe9a8');
  b.encounter('Treasury wardens', [47, 28, 6, 6], [['shieldGuardian', 2], ['airElemental', 3]], 'moderate');

  b.building('The Feast Hall', 27, 35, 19, 8, {
    mat: 'wood-planks',
    read: 'A table long enough to need its own weather runs down the hall. Servants made of mist float in with silver domes. Every plate is a different colour, every cup hums a different note, and every chair has a little card with your name already written on it.',
    gm: 'The Feast of a Thousand Tests. Five courses, five tests (see the scene). A tapestry on the north wall hides the secret door to the vizier\'s study (DC 18 Perception). The Soot Sisters, the Brass Kettles\' two assassins, sit at the far end. If the heroes expose the poisoned cup, the sisters go for their knives.',
  });
  b.door(27, 38, 'w', 'open', 'door-double').door(27, 39, 'w', 'open', 'door-double').door(35, 42, 's', 'open', 'door-double').door(36, 42, 's', 'open', 'door-double').door(45, 38, 'e', 'closed');
  b.props_('feast-hall-table', [[31, 38], [38, 38]]).props_('chair-high-back', [[29, 37], [33, 37], [37, 37], [41, 37], [29, 40], [33, 40], [37, 40], [41, 40]]).prop('chandelier-crystal', 35, 39).prop('harpsichord', 44, 36).prop('sideboard', 28, 41).prop('wine-rack', 44, 41).prop('tapestry-tall', 30, 35);
  b.light(35, 39, 15, 20, '#ffe2b0');
  b.encounter('Knives under the tablecloth', [28, 36, 17, 6], [['assassin', 2]], 'low');

  b.area('The Court of Gusts', [[30, 44, 21, 8]], {
    read: 'A courtyard of white stone open to the sky, with a fountain that sprays upward and never comes down: the water just keeps climbing into the clouds. Spectators of every shape crowd the balconies, cheering, betting and booing.',
    gm: 'The palace\'s crossroads and the best place to hear gossip. A DC 15 Investigation or Persuasion check among the spectators learns one rumour: "The Brass Kettles have won every Games they\'ve entered", "The vizier never bets, which is odd for a djinni\'s court", or "There\'s an island of wind chimes where they keep the losers".',
    label: [40, 48],
  });
  b.prop('fountain-grand', 40, 47).props_('statue-tall-robed', [[32, 45], [48, 45]]).props_('bench-long', [[34, 50], [45, 50]]).props_('flowers', [[31, 49], [49, 49]]).props_('column-twisted', [[30, 44], [50, 44]]).prop('stair-grand', 40, 51);
  b.area('The East Terrace', [[47, 36, 8, 7]], {
    read: 'A terrace hanging over nothing. From here you can see the whole race course: rocks the size of houses drifting in a slow ring, and riders already circling them.',
    gm: 'A good spot to scout the race (DC 15 Perception spots the Brass Kettles\' stokers fixing something to the inside of the Needle\'s Eye). A rope line drops east to the course.',
    label: [51, 39],
  });
  b.props_('telescope', [[53, 37]]).prop('bench', 49, 41).prop('banner-pole', 54, 42);

  // ---------- the Stairway of Clouds and the Storm Engine (the goal) ----------
  b.floor(39, 13, 3, 13, 'marble');
  b.area('The Stairway of Clouds', [[39, 16, 3, 9]], {
    read: 'A stair of marble steps floats up from the throne hall, each step a little apart from the next. Above, something enormous of brass and glass rumbles like thunder in a bottle.',
    gm: 'The main way to the Storm Engine. During the Games two spectral guards (just illusions, DC 16 Investigation) bar it. On the last day it opens for the closing ceremony.',
    label: [40, 20],
  });
  b.props_('stair-grand', [[40, 24], [40, 18]]).props_('lamp-post', [[39, 21], [41, 15]]);

  b.cave('The Storm Engine', 40, 9, 11, 6.5, {
    seed: 13, mat: 'dungeon-slab',
    read: 'A machine as big as a cathedral: brass bellows breathing in and out, copper pipes, spinning vanes. In its heart, a glass cistern holds a sea of grey storm, and inside it lightning flickers and rain falls upward forever. You can smell it: wet earth, after a long drought.',
    gm: 'Thessmark\'s three missing seasons of rain, bottled. The great lever in front of the cistern lets the rain go home; only the winner of the Games may pull it at the Last Gong. The Brass Kettles have fixed a siphon of brass to the cistern\'s back that runs down the Gale Ribbon to their ship. Shutting the siphon: DC 18 Strength (Athletics) check or dispel magic (DC 16). The vizier has turned off the catch-winds here: anyone who falls off the Engine is gone for the fight and turns up at the Gate an hour later with 35 (10d6) bludgeoning damage.',
  });
  b.pool(40, 8, 4, 2.5, true);
  b.props_('winch', [[34, 8], [46, 8]]).prop('lever', 40, 12).props_('steam-vent', [[33, 5], [47, 5]]).props_('crystal-spire', [[36, 4], [44, 4]]).props_('chains-hanging', [[35, 11], [45, 11]]).prop('orrery', 31, 9).prop('magic-circle', 40, 14).prop('trap-vent-grate', 49, 8, 0, { gm: true });
  b.light(40, 8, 15, 25, '#9fd0ff').light(34, 8, 5, 10, '#ffd27a').light(46, 8, 5, 10, '#ffd27a');
  b.encounter('The cheaters unmasked', [31, 4, 19, 10], [['efreeti', 1], ['archmage', 1], ['salamander', 1]], 'high');

  skyLine(b, 28, 24, 35, 13, 'wood-planks');
  b.area("The Vizier's Rope Line", [[28, 15, 7, 9]], {
    read: 'A single rope, thick as your arm, climbs up into a bank of cloud. Someone has knotted foot-loops into it every few feet.',
    gm: 'Nessarine\'s private way to the Engine, hidden by a cloud bank (DC 18 Perception to spot from the palace). Climbing it is a DC 14 Athletics check each turn; a fail means slipping back 10 ft, a fail by 5 means falling (the catch-winds still work here).',
    label: [31, 19],
  });
  b.props_('obscuring-cloud', [[30, 21], [33, 16]]).prop('rope-coil', 28, 24);

  // ---------- the Maze of Winds (northwest) ----------
  b.room('The Maze of Winds', 3, 3, 20, 20, {
    mat: 'ice', label: [6, 4],
    read: 'Walls of roaring wind, white with spinning snow, fold back on themselves into a maze. You can see through them, a little, the way you see through a waterfall. Somewhere inside, a single golden feather turns in the air.',
    gm: 'Touching a wall: DC 16 Strength saving throw or be thrown 15 ft back and take 9 (2d8) bludgeoning damage. The maze shifts: once per round the GM may close one gap and open another. The first team to bring the Golden Feather out of the Heart wins. The prince\'s invisible stalkers prowl the maze to steal the feather from whoever holds it (that is part of the game); the vizier has told them to go for the heroes\' throats instead.',
  });
  const ring = (k: number, gaps: [Side, number][]) => {
    const x0 = 3 + k, y0 = 3 + k, x1 = 22 - k, y1 = 22 - k;
    const open = (s: Side, i: number) => gaps.some(([gs, gi]) => gs === s && gi === i);
    for (let x = x0; x <= x1; x++) {
      if (!open('n', x)) b.wall(x, y0, 'n', 'ethereal');
      if (!open('s', x)) b.wall(x, y1, 's', 'ethereal');
    }
    for (let y = y0; y <= y1; y++) {
      if (!open('w', y)) b.wall(x0, y, 'w', 'ethereal');
      if (!open('e', y)) b.wall(x1, y, 'e', 'ethereal');
    }
  };
  ring(0, [['e', 9], ['e', 10], ['s', 12]]);
  ring(3, [['w', 12], ['n', 16]]);
  ring(6, [['s', 10], ['e', 12]]);
  ring(8, [['n', 13]]);
  for (let y = 20; y <= 22; y++) b.wall(14, y, 'e', 'ethereal');
  for (let x = 17; x <= 19; x++) b.wall(x, 9, 's', 'ethereal');
  for (let x = 9; x <= 10; x++) b.wall(x, 13, 's', 'ethereal');
  b.area('Heart of the Maze', [[11, 11, 4, 4]], {
    read: 'The wind stops. In the still air of the maze\'s heart, a golden feather as long as your arm hangs turning, and the floor is littered with the scraps of other teams\' banners.',
    gm: 'Grabbing the feather makes every invisible stalker in the maze know where its holder is. The feather is a key: whoever carries it out of the maze can walk through the wind walls once, as if they were open air.',
    label: [12, 12],
  });
  b.prop('orb-pedestal', 12, 12).props_('war-banner', [[11, 14], [14, 11]]).props_('obscuring-cloud', [[5, 5], [20, 20], [7, 17]]).props_('snowdrift', [[17, 5], [4, 13]]).prop('skeleton-lying', 8, 20).prop('backpack', 19, 13);
  b.light(12, 12, 5, 15, '#ffe58a');
  b.encounter('Hunters in the wind', [4, 4, 18, 18], [['invisibleStalker', 2], ['airElemental', 1]], 'low');

  b.floor(23, 9, 8, 2, 'ice');
  b.area('The North Wind Bridge', [[23, 9, 6, 2]], {
    read: 'A ribbon of hard, packed wind, white and humming, runs from the maze to the great machine.',
    gm: 'A back way into the Storm Engine. Walkable as normal ground, but a gust of thunder from the Engine every 1d4 rounds forces a DC 15 Strength save to stay on it.',
    label: [25, 9],
  });

  // ---------- the Riddle Pavilion (west) ----------
  b.cave(null, 11, 38, 8, 6, { seed: 14, mat: 'ice' });
  b.building('The Riddle Pavilion', 7, 35, 9, 7, {
    mat: 'marble',
    read: 'A round pavilion of white stone with curtains of falling feathers instead of walls. Two lecterns face each other across a gong. At one of them, a small whirlwind in a bow tie is already waiting, tapping an invisible foot.',
    gm: 'The Duel of Riddles against Ziffle of the Six Winds (and the Brass Kettles, who go next). Each team answers five riddles (handout; answers in the scene). The vizier sits as "official timekeeper" with a conch-shell earring: a whisper-shell, through which she feeds answers to Kharsimet. DC 18 Perception to see her lips move; detect magic shows the shell glowing.',
    doors: [[15, 38, 'e', 'open', 'door-double'], [11, 35, 'n', 'open'], [11, 41, 's', 'open']],
    windows: [[7, 37, 'w'], [7, 39, 'w']],
  });
  b.props_('lectern', [[9, 38], [13, 38]]).prop('temple-bell', 11, 36).props_('rug-round', [[11, 39]]).props_('candle-stand-tall', [[8, 36], [14, 36], [8, 40], [14, 40]]).prop('scroll-pile', 10, 40);
  b.props_('flowers', [[5, 34], [17, 41]]).prop('bench', 4, 39);
  b.light(11, 38, 10, 15, '#fff3d6');

  b.floor(16, 38, 11, 2, 'ice');
  b.area('The Whistling Span', [[19, 38, 7, 2]], {
    read: 'A bridge of cloud between the pavilion and the palace. Holes in its railings whistle as you cross, each a different note.',
    gm: 'The holes play a tune when the wind is right. A bard or anyone with a DC 15 Performance check who plays the full tune on them earns the crowd\'s favour: +1 laurel in the riddle duel.',
    label: [22, 38],
  });
  b.prop('bridge-plank', 21, 38).prop('lamp-post', 25, 39);

  skyLine(b, 12, 23, 11, 32, 'wood-planks');
  b.prop('rope-coil', 12, 24);

  // ---------- the Arena of Gales (southwest) ----------
  b.cave('The Arena of Gales', 13, 63, 9, 8, {
    seed: 15, mat: 'sand',
    read: 'A bowl of sand on a floating rock, ringed with banners that crack like whips in the wind. In the prince\'s box at the north end, cushions are piled ready. In the middle of the sand, a banner on a pole waits to be captured.',
    gm: 'The Mock Battle: capture the banner and hold it for 3 rounds. "Mock" means anyone dropped to 0 hit points is caught by the catch-winds, stable and out of the fight. Kill on purpose and the team is thrown out of the Games. The vizier has told Ormelda that the heroes poisoned her griffon (a lie); a DC 17 Insight check sees she\'s angry for a reason, and proof of the lie (or the feast poison) turns her. Ormelda is honourable: if she learns the truth before the bout, she fights fair and then loudly backs the heroes in the prince\'s court.',
  });
  b.prop('throne-dais', 13, 56).props_('war-banner', [[8, 58], [18, 58]]).prop('banner-pole', 13, 63).props_('weapon-rack', [[6, 62], [20, 64]]).prop('spear-rack', 7, 66).prop('shield-wall', 19, 61).props_('pillar-broken', [[9, 68], [17, 68]]).prop('training-dummy', 11, 69);
  b.light(13, 56, 10, 15, '#fff0c8');
  b.encounter('Mock battle: the Highwhistles', [6, 57, 15, 13], [['cloudGiant', 1], ['gladiator', 2], ['griffon', 3]], 'moderate');

  skyLine(b, 11, 44, 12, 55, 'wood-planks');
  b.area('The Long Rope', [[11, 45, 2, 9]], {
    read: 'A rope bridge, sagging and swaying, hangs between the pavilion\'s island and the arena.',
    gm: 'A crossing for walkers: DC 12 Dexterity (Acrobatics) or spend the turn clinging on. Halfway along, someone has cut half the strands (DC 15 Perception): more than two people on it at once and it snaps.',
    label: [11, 49],
  });
  b.prop('bridge-rope', 11, 49, 90);

  // ---------- Champions' Terraces: where the teams camp ----------
  b.cave("Champions' Terraces", 28, 58, 5, 3.5, {
    seed: 16, mat: 'ice',
    read: 'Four tents on a puff of cloud, each with its team\'s banner: a brass kettle, a white whistle, six twisting arrows, and one bare pole waiting for yours.',
    gm: 'Rest here between contests (a short rest per contest is allowed). Rival teams drop by: Ormelda brings honey cakes and sizes the heroes up, Ziffle steals something small and returns it later, and the Soot Sisters try to search the heroes\' tent (passive Perception 15 notices). Kharsimet comes once, to offer a bribe: 2,000 gp to throw the race.',
  });
  b.props_('tent-bell', [[25, 57], [31, 59]]).props_('tent-round', [[29, 56], [26, 60]]).props_('banner-pole', [[27, 57], [30, 57], [28, 61]]).prop('brazier-pedestal', 28, 58).props_('bedroll', [[24, 59], [32, 57]]).prop('hammock', 30, 61);
  b.light(28, 58, 5, 10, '#ffcf8a');
  b.floor(21, 60, 4, 2, 'ice');
  skyLine(b, 31, 51, 29, 55, 'ice', 2);
  skyLine(b, 32, 61, 34, 69, 'wood-planks');

  // ---------- the Isle of Wind Chimes: the losers' island ----------
  b.cave('The Isle of Wind Chimes', 53, 59, 4, 3, {
    seed: 17, mat: 'grass',
    read: 'A grassy islet hung with hundreds of silver chimes. When the wind blows they don\'t ring: they talk, in thin little voices, all at once. "Don\'t bet." "Don\'t trust the vizier." "Is it my turn yet?"',
    gm: 'Past losers of the Games, turned into wind chimes until the prince remembers them (he never does). They can\'t be freed by force, but any team that wins a contest can ask the prince for one favour, and a remove curse or a DC 18 Arcana check plus 10 minutes works too. Freed, the oldest chime, a farmer named Bettany Crook, tells them: "Two years ago I won the race fair and square. That night the vizier\'s fire friends said I\'d cheated. I never saw the judge again before I was a chime."',
  });
  b.props_('cage-hanging', [[51, 58], [54, 57], [56, 60], [52, 61]]).prop('temple-bell', 53, 59).props_('tree-birch', [[50, 60], [55, 58]]).props_('statue', [[54, 61]]).prop('flowers', 52, 58);
  skyLine(b, 48, 51, 52, 56, 'wood-planks');
  skyLine(b, 56, 61, 60, 67, 'wood-planks');

  // ---------- Skyfold Roost: the stables ----------
  b.cave('Skyfold Roost', 64, 70, 8, 5, {
    seed: 18, mat: 'ice',
    read: 'Pegasi stamp in stalls of cloud, griffons sulk on perches, and three giant eagles argue loudly over a fish. Along one rail, rolled-up carpets twitch, eager to fly.',
    gm: 'Each team picks mounts for the race. The beasts are clever: the best mount goes to whoever wins it over (DC 16 Animal Handling, or a gift of food, or talking to it in its own tongue). The giant eagles speak and will race for a team that promises them the roc\'s nest. Carpets are the fastest but stall if their rider insults them. The Brass Kettles feed their griffons fire-pepper for speed: anyone who checks the griffons (DC 15 Medicine or Nature) sees the burns.',
  });
  b.props_('hitching-post', [[59, 68], [61, 68], [63, 68]]).props_('haystack', [[68, 67], [70, 72]]).prop('horse-trough', 65, 73).prop('water-trough', 60, 71).props_('rug', [[66, 71], [68, 70]]).prop('rug-pelt', 62, 72).prop('fish-crate', 69, 69).prop('hay-bale', 58, 70);
  skyLine(b, 48, 72, 57, 72, 'wood-planks');
  b.prop('bridge-rope', 52, 72);

  // ---------- the Sky Race: a ring of floating rocks ----------
  b.cave('The Starting Spire', 66, 58, 3.5, 3, {
    seed: 19, mat: 'stone-cobble',
    read: 'A spike of rock with a striped pole on top. Flags snap. Below, the race course loops away: rocks drifting in a great ring, each with a hoop of glowing wind to fly through.',
    gm: 'Start and finish line. Ysquel the judge watches from here and sees everything she is looking at, but only what she is looking at.',
  });
  b.props_('banner-pole', [[64, 57], [68, 57]]).prop('lectern', 66, 59).prop('standing-stone', 67, 60).prop('temple-bell', 65, 60);
  b.floor(66, 61, 2, 5, 'ice');

  const rocks: [number, number, number, number, number][] = [
    [74, 48, 3, 2.5, 21], [73, 36, 2.5, 2.5, 22], [75, 24, 3, 3, 23], [57, 5, 3, 2.5, 25], [56, 17, 2.5, 2, 26], [61, 28, 2.5, 2.5, 27], [59, 44, 3, 2.5, 28],
  ];
  for (const [cx, cy, rx, ry, seed] of rocks) b.cave(null, cx, cy, rx, ry, { seed, mat: 'stone-cobble' });
  b.area('The Race Course', [[71, 46, 6, 5], [71, 34, 5, 5], [56, 3, 5, 5], [54, 15, 5, 4], [59, 26, 5, 5], [57, 42, 5, 5]], {
    read: 'The rocks drift as you fly between them. Each hoop of wind roars as you shoot through it, and the crowd on the palace balconies roars back.',
    gm: 'Three laps would take all day, so it is one lap in three legs. Leg 1, the Needle\'s Eye: DC 16 Wisdom (Animal Handling) or Dexterity (Acrobatics) to thread it at speed. Leg 2, Roc\'s Crag: sneak past the sleeping roc (DC 17 Stealth for the whole team) or wake it. Leg 3, the Downdraft home: DC 15 Strength or Dexterity to pull out of the dive. Three successes win; two place second. Spells like haste, fly or gust of wind count as a success on one leg. The Kettles have rigged a dead-air pocket in the Needle\'s Eye (DC 17 Perception to see it shimmer; a rider who hits it drops 60 ft and loses the leg).',
    label: [73, 41],
  });
  b.props_('boulder-large', [[73, 47], [55, 17]]).props_('boulder', [[74, 36], [57, 4], [60, 28], [59, 44]]).props_('crumbling-ledge', [[72, 49], [62, 29]]).prop('trap-pit-hidden', 75, 24, 0, { gm: true });
  b.area("The Needle's Eye", [[73, 22, 5, 5]], {
    read: 'A rock pierced by a hole barely wide enough for a pegasus with its wings folded. The wind through it screams.',
    gm: 'Leg 1 of the race. The dead-air pocket is here. A rider who spots it can fly round the outside (slower: disadvantage on leg 3) or dispel it (DC 15).',
    label: [75, 24],
  });
  b.prop('archway-grand', 75, 23).prop('obscuring-cloud', 76, 26);

  b.cave("Roc's Crag", 68, 12, 4, 3.5, {
    seed: 24, mat: 'cave-floor',
    read: 'A crag of black rock with a nest on top made of whole trees. Something in the nest breathes, slow and deep, and the whole rock rises and falls with it.',
    gm: 'A roc, the prince\'s pet, asleep. The Brass Kettles burn pepper-smoke as they pass to wake it just as the heroes arrive (DC 15 Perception to see the smoke trail). Awake, it grabs one rider and flies off; it lets go if hurt for 40 or more damage in a round, or if fed (a whole ox from the Roost will do). A giant eagle mount can talk it down (it is the eagles\' cousin, sort of).',
  });
  b.props_('log-pile', [[67, 11], [70, 12]]).prop('bones', 66, 13).prop('treasure-pile', 69, 10).prop('boulder-large', 65, 10).prop('rope-coil', 71, 14);
  b.encounter('Roc on the course', [64, 8, 9, 8], [['roc', 1]], 'low');

  for (const [ax, ay, bx2, by2] of [[69, 56, 73, 50], [74, 46, 73, 38], [74, 34, 75, 27], [74, 21, 70, 15], [65, 10, 59, 6], [57, 7, 56, 15], [57, 19, 60, 26], [60, 31, 59, 42], [61, 46, 64, 55]] as const) skyLine(b, ax, ay, bx2, by2, 'ice');

  skyLine(b, 54, 6, 50, 7, 'ice', 2);
  b.area('The Gale Ribbon', [[50, 5, 6, 3]], {
    read: 'A narrow ribbon of wind links the far rocks to the back of the great machine. A brass pipe, new and badly hidden under a tarp, runs along it.',
    gm: 'The Brass Kettles\' siphon pipe runs from the Storm Engine to their ship along here. Cutting the pipe (AC 19, 40 hit points, immune to fire) stops the theft as surely as the lever does.',
    label: [52, 6],
  });
  b.props_('chains-hanging', [[53, 6]]);
  skyLine(b, 56, 44, 54, 41, 'wood-planks');
  skyLine(b, 55, 31, 59, 29, 'wood-planks');
  b.area('The Treasury Balcony', [[54, 30, 4, 3]], {
    read: 'A narrow balcony with a rope line off its end, swaying out toward the race course.',
    gm: 'Outside the treasury\'s secret panel. Easy to miss from inside the palace, easy to reach from the course.',
    label: [55, 31],
  });

  // ---------- the Smoke Dhow: the Brass Kettles' ship ----------
  b.cave(null, 68, 39, 3, 2, { seed: 29, mat: 'stone-cobble' });
  b.room('The Smoke Dhow', 63, 32, 9, 4, {
    mat: 'wood-planks-dark',
    read: 'A ship of black wood and brass, moored in the sky by chains to a lump of rock. Its sails are smoke. On its deck a brass kettle the size of a bathhouse sits on a fire that is never allowed to go out.',
    gm: 'The Brass Kettles\' ship. The giant kettle is where the stolen rain will go: boiled to steam and carried off to the efreeti markets. Two fire elementals and two salamanders keep the fire and the deck. Sneaking aboard: DC 17 Stealth. In Kharsimet\'s cabin (the stern): his strongbox, and the contract with the vizier\'s signature, proof enough for the prince.',
  });
  b.prop('ship-mast', 67, 33).prop('ship-wheel', 71, 34).prop('cauldron', 65, 34).prop('burning-ground', 65, 33).props_('cargo-crates', [[69, 32], [64, 35]]).prop('sails-pile', 68, 35).prop('strongbox', 71, 32).prop('anchor', 63, 33).prop('gangplank', 67, 35);
  b.light(65, 34, 15, 20, '#ff8a3c');
  b.floor(67, 36, 2, 2, 'wood-planks');
  b.props_('mooring-post', [[67, 38], [69, 39]]);
  skyLine(b, 62, 30, 63, 32, 'wood-planks');
  b.encounter('Brass Kettle crew', [63, 32, 9, 4], [['fireElemental', 2], ['salamander', 2]], 'low');

  return b.build();
}

export const DJINNI_WAGER: Adventure = {
  id: 'djinni-wager',
  title: "The Djinni's Wager",
  tagline: 'A bored djinni prince won a kingdom\'s rain in a bet. Win it back at the Grand Games, where cheating is allowed but getting caught is not.',
  levels: '11',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['planar', 'contests', 'comedy', 'sky', 'intrigue'],
  pitch:
    'It has not rained in the kingdom of Thessmark for ninety days. The wells are mud and the wheat is dust, and everyone knows why: at midsummer, King Hollis the Mild got drunk and bet the kingdom\'s rain on a game of knucklebones against a laughing stranger in blue. He lost. The stranger was Prince Saffiruz, a djinni of the Elemental Plane of Air, and he has just sent a summons: anyone who wants the rain back may compete in his Grand Games. Winner takes the storm.',
  secret:
    'The wager was rigged. Grand Vizier Nessarine Tull, a mortal archmage who has served the prince for forty years, owes her magic and her soul to an efreeti trading house. Her contract is up unless she delivers "one kingdom\'s weather". So she lured the bored prince to Thessmark\'s feast and swapped in loaded knucklebones. Now she is fixing the Games so her efreeti partner, Kharsimet, wins: his crew will boil the rain off to the fire markets, Thessmark will turn to desert, and his house will buy the land for salt and glass. The prince knows none of this. He would be furious: a wager won by fraud is void by his oldest law. The Games last until the Last Gong at sunset; if the Kettles are losing by then, Kharsimet and Nessarine will simply steal the rain from the Storm Engine.',
  hooks: [
    'Pim Cobbleweather, Thessmark\'s last rain-priest, has the prince\'s summons and needs a team. The king offers 8,000 gp and a seat on his council.',
    'One of the heroes is personally invited: the prince saw them do something spectacular once and wants them "on the show".',
    'A wind-chime in a market sings in a tiny voice: "Help me. I lost the Games. Tell them the vizier cheats."',
  ],
  tips: [
    'Keep score on the table where everyone can see it. Each contest: 1st place 3 laurels, 2nd 2, 3rd 1, last 0. A spectacular moment earns +1 laurel for crowd favour (your call). If the heroes don\'t interfere, the Brass Kettles win every contest.',
    'The prince\'s one rule: cheating is part of the game, getting caught is losing. If Ysquel the judge sees proof of cheating, that team scores nothing for that contest. That goes for the heroes too.',
    'Let every contest be won more than one way: skill, magic, talk, or cheating back. Say yes to clever plans and give them advantage or an automatic success on one roll.',
    'Run it like a game show. Give the prince a booming announcer voice, interrupt with commentary ("OH! The halfling is EATING the soup with a FORK!"), and cut away to rival teams between contests.',
    'Two ways to win: finish with the most laurels, or prove the original wager was rigged. Either way, the cheaters make a grab for the Storm Engine at the end: that is the one real fight that must happen.',
    'For a single session, cut the maze or the feast, and give the heroes the ledger in the Vizier\'s Study as soon as they find the secret door.',
  ],
  npcs: [
    {
      id: 'pf_dwsaffiruz', name: 'Prince Saffiruz of the Hundred Gusts', title: 'djinni prince and host of the Grand Games', kind: 'monster', art: 'djinni', monsterId: 'djinni', shared: true,
      wants: 'Not to be bored. Ever. And to be thought of as the most generous, most fair host in the sky.',
      knows: 'Every rule of the Games and every bet he has ever won. Nothing about the vizier\'s cheating, and he would be mortified to learn it.',
      voice: 'An announcer\'s boom, then sudden whispers. Says "Marvellous!" about everything, even disasters.',
      appearance: 'A sky-blue giant in shimmering silks, his lower half a little tornado, with rings on every finger and a turban with a live swallow nesting in it.',
      backstory: 'Third son of a djinni sultan, given a palace to keep him out of trouble. He has won the rain of three kingdoms before; he always gives it back eventually, when he gets bored. Nessarine is the reason he hasn\'t, this time.',
      gmNotes: 'Djinni stat block. He will not fight in the Games: interfering would be cheating. If the heroes prove the fraud (the loaded knucklebones, the ledger, Kharsimet\'s contract, or Nessarine confessing), he voids the wager on the spot, grants the winning team one favour each, and sentences Nessarine to be a wind chime. He still lets the final fight happen: "A contest! The FINAL EVENT!"',
    },
    {
      id: 'pf_dwnessarine', name: 'Grand Vizier Nessarine Tull', title: 'the prince\'s mortal vizier', kind: 'monster', art: 'court-wizard', monsterId: 'archmage', shared: true,
      wants: 'The rain delivered to the efreeti house, so her contract burns and her soul stays hers.',
      knows: 'Everything: the rigged knucklebones, every cheat in the Games, the password to the treasury, how to switch off the catch-winds.',
      voice: 'Dry, precise and polite. Never raises her voice. Calls the prince "Radiance" and the heroes "the guests".',
      appearance: 'A thin old woman in grey robes with ink-stained fingers, a conch-shell earring and a chain of brass keys around her neck.',
      backstory: 'Forty years ago, a poor scribe from a mountain village, she signed with an efreeti house for the magic to become great. She did become great. Now the bill has come.',
      gmNotes: 'Archmage stat block. She is not cruel, just frightened, and if cornered alone with proof against her she may bargain: a full confession in front of the prince in exchange for the heroes asking for mercy (DC 18 Persuasion). If she confesses, the final fight is Kharsimet and his crew alone; swap her out of the encounter for a second salamander and an invisible stalker.',
    },
    {
      id: 'pf_dwkharsimet', name: 'Kharsimet the Brass-Handed', title: 'efreeti captain of the Brass Kettles', kind: 'monster', art: 'efreeti', monsterId: 'efreeti', shared: true,
      wants: 'The rain in his kettle and a fat commission from his trading house.',
      knows: 'That the vizier is his inside agent, every cheat she has set up, and that his siphon on the Storm Engine is the backup plan.',
      voice: 'Warm, loud and friendly, like a merchant who is about to rob you. Laughs at his own jokes before he gets to the end of them.',
      appearance: 'A red-skinned giant with smoke for hair, brass bands on both forearms and a smile with far too many gold teeth.',
      gmNotes: 'Efreeti stat block. Offers bribes first (2,000 gp to throw a contest), threats second. In the final fight he flies, uses his fire on whoever is near the siphon, and flees by plane shift if reduced below 40 hit points.',
    },
    {
      id: 'pf_dwormelda', name: 'Ormelda Highwhistle', title: 'cloud giant champion of the Highwhistles', kind: 'monster', art: 'cloudGiant', monsterId: 'cloudGiant', shared: true,
      wants: 'To win fairly, as her mother and grandmother did. A win by cheating would shame her whole family.',
      knows: 'That the Brass Kettles have won the last three Games, that the griffons hate fire-pepper, and that the vizier told her the heroes poisoned her best griffon.',
      voice: 'Slow, deep and kind, with a laugh like distant thunder. Calls everyone "little cousin".',
      appearance: 'A giant with silver-white skin, hair braided with tiny silver bells, and a morningstar the size of a cart.',
      gmNotes: 'Cloud giant stat block. Her team: the Fellbrook twins (gladiators) and three griffons. Shown the truth, she becomes the heroes\' loudest ally, and in the final fight she can be talked into catching anyone who falls from the Engine (DC 15 Persuasion).',
    },
    {
      id: 'pf_dwziffle', name: 'Ziffle of the Six Winds', title: 'air elemental trickster', kind: 'monster', art: 'airElemental', monsterId: 'airElemental', shared: true,
      wants: 'To be the funniest thing in the sky. Winning would be nice too, but mostly funny.',
      knows: 'All the riddles, every secret corner of the palace, and that the vizier\'s earring is a whisper-shell (he will trade this for a really good joke).',
      voice: 'Fast, high and breathy, finishing other people\'s sentences, usually wrongly. Speaks of himself as "we".',
      appearance: 'A whirlwind about the size of a child, with a bow tie, a monocle and a stolen hat that keeps changing.',
      gmNotes: 'Air elemental stat block, but he never fights for real. He steals one small thing from each hero during the adventure and gives it back at the worst possible moment. If the heroes make him laugh (DC 16 Performance) he throws the riddle duel to them.',
    },
    {
      id: 'pf_dwysquel', name: 'Ysquel the Unerring', title: 'couatl judge of the Games', kind: 'monster', art: 'couatl', monsterId: 'couatl', shared: true,
      wants: 'Fair play, under the rules as written. She is bound to judge the Games by an old oath to the prince\'s family.',
      knows: 'The rules perfectly. She cannot lie, and she rules only on what she sees for herself or on proof put in front of her.',
      voice: 'Calm, musical and very exact. Repeats the rule number before every ruling.',
      appearance: 'A feathered serpent of turquoise and gold, her wings spread like a judge\'s robe, coiled on a perch above every contest.',
      gmNotes: 'Couatl stat block. She never fights unless someone attacks her. If the heroes bring proof of cheating to her, she disqualifies the cheating team from that contest and takes the proof to the prince herself.',
    },
    {
      id: 'pf_dwpim', name: 'Pim Cobbleweather', title: 'Thessmark\'s last rain-priest', kind: 'npc', art: 'hero-halfling-cleric', shared: true,
      wants: 'Rain. Just rain. He dreams about puddles.',
      knows: 'The story of the wager, the kingdom\'s state, and how to feel where stored rain is (he can point toward the Storm Engine from anywhere).',
      voice: 'Anxious and polite, with weather sayings for every occasion: "Red sky at night, nobody\'s fault but mine."',
      appearance: 'A small, round halfling in a grey priest\'s coat with a dried-up rain-bell on a cord, and an umbrella he refuses to put down.',
      gmNotes: 'Not a fighter. He can be entered as a team member in the feast (he is a very good eater) and notices things the heroes miss: on any contest, once, he can give a hero advantage on a Perception check.',
    },
  ],
  handouts: [
    { id: 'dw-rules', title: 'The Rules of the Grand Games', text: 'By the grace of His Radiance, Prince Saffiruz of the Hundred Gusts:\n1. Five contests: the Race, the Riddles, the Feast, the Maze, the Battle.\n2. Laurels to the swift, the clever and the bold.\n3. No killing. It spoils the mood.\n4. All is fair in the Games.\n5. ...except getting caught.\n6. At the Last Gong, the team with the most laurels pulls the Lever.\n7. The judge is always right. Even when she isn\'t.' },
    { id: 'dw-riddles', title: 'The Five Riddles', text: 'One: No wings, yet I carry the hawk; no feet, yet I walk the sea. You feel me, but never see me.\nTwo: Bought in the drought, cursed in the flood, kings bow for me and farmers pray. What am I?\nThree: At every feast I sit, never fed, always near; when the last candle dies, I leave.\nFour: Given before it\'s earned, broken without a sound; a djinni who breaks it loses all he\'s bound.\nFive: Four winds in my mouth, one in my heart; I tell you where you\'re going but never where you\'ve been.' },
    { id: 'dw-menu', title: 'The menu card', text: 'THE FEAST OF A THOUSAND TESTS\nFirst: Soup of Mists (it will not stay in the bowl)\nSecond: Bread of Honest Crumbs\nThird: Thunder Pepper Skewers\nFourth: The Cup of Courtesy\nFifth: Dessert. (Guests are reminded that dessert is also a test.)' },
    { id: 'dw-ledger', title: 'A page from the vizier\'s ledger', text: 'Midsummer, Thessmark: bones swapped at the second throw. Radiance suspects nothing.\nRace: pocket set in the Needle. Riddles: shell. Feast: the sleeping cup for whoever talks most. Maze: stalkers told.\nOwed to the House of the Brass Kettle: ONE KINGDOM\'S WEATHER. When the steam is sold, the contract burns. Forty years. Almost done.' },
    { id: 'dw-wager', title: 'The wager scroll', text: 'Wagered this midsummer night: the RAIN of THESSMARK, all of it, against ONE WISH of the djinni\'s granting. Game: knucklebones, best of five, using the vizier\'s own bones for fairness.\nSigned: Hollis, King (very wobbly)\nSigned: Saffiruz, Prince of the Hundred Gusts (with a flourish)' },
  ],
  chapters: [
    {
      id: 'games', title: 'The Grand Games', level: 11,
      summary: 'A palace of marble and cloud floating in the open sky, ringed by islands where five contests are held: a sky race, a duel of riddles, a feast of tests, a maze of winds and a mock battle. Rival teams cheat, the vizier cheats for them, and at the end the cheaters try to steal the rain outright.',
      goal: 'Win the Grand Games, or prove the wager was rigged, and get Thessmark\'s rain out of the Storm Engine before the Brass Kettles boil it away.',
      map: hollowgale,
      npcs: [
        { npc: 'pf_dwsaffiruz', x: 40, y: 69 },
        { npc: 'pf_dwysquel', x: 42, y: 70 },
        { npc: 'pf_dwpim', x: 40, y: 74 },
        { npc: 'pf_dwormelda', x: 13, y: 60 },
        { npc: 'pf_dwziffle', x: 13, y: 38 },
        { npc: 'pf_dwkharsimet', x: 34, y: 10, hidden: true },
        { npc: 'pf_dwnessarine', x: 45, y: 12, hidden: true },
      ],
      scenes: [
        {
          room: 'The Gate of Welcomes', title: 'Welcome, contestants!', handout: 'dw-rules', encounter: 'Gate wardens',
          read: 'Trumpets of pure wind sound from nowhere. A blue giant in silks swoops down on a tornado, flings out his arms and bellows, "CONTESTANTS! I am SO glad you came. The last lot were dreadful." Behind him, a feathered serpent unrolls a scroll.',
          gm: 'Prince Saffiruz introduces the teams one by one, with nicknames he makes up on the spot. Ysquel reads the rules. The vizier stands in the background and nods. The wardens only fight guests who arrive uninvited or who insult the host; even then a good apology (DC 15 Persuasion) stops them. Move the rival NPC tokens here for the parade, then send them to their places.',
        },
        {
          room: "Champions' Terraces", title: 'Meet the rivals', optional: true,
          read: 'Three tents, three banners, three teams eyeing you. A cloud giant waves. A whirlwind steals your hat. A red-skinned giant with smoke for hair strolls over with his hands spread wide and a smile full of gold.',
          gm: 'Let the players meet everyone. Kharsimet offers 2,000 gp to throw the race (taking it and then winning anyway is very much allowed). Ormelda is cold to the heroes: the vizier has told her they poisoned her griffon. Ziffle trades secrets for jokes. A DC 17 Insight check on Kharsimet: he is not worried about losing, at all.',
        },
        {
          room: 'The Race Course', title: 'Contest one: the Sky Race', encounter: 'Roc on the course',
          read: 'The bell rings and the sky fills with wings. Pegasi, griffons, a carpet with a whirlwind sitting on it, and a smoke-sailed skiff full of grinning fire creatures surge toward the first hoop.',
          gm: 'Mounts from Skyfold Roost (or the heroes\' own flying). Run the three legs from the Race Course notes. The Kettles\' cheats: the dead-air pocket in the Needle\'s Eye and pepper-smoke to wake the roc as the heroes pass Roc\'s Crag. Proof of either, shown to Ysquel, disqualifies them from the race. The roc fight ends when it is fed, talked down, or takes 40 damage in a round.',
          treasure: 'Winner\'s purse: 1,000 gp and a wind fan. In the roc\'s nest: 600 gp of lost jewellery, a +1 shield and two potions of flying.',
        },
        {
          room: 'The Smoke Dhow', title: 'Aboard the Smoke Dhow', optional: true, encounter: 'Brass Kettle crew',
          read: 'The ship creaks on its chains. The kettle on its deck is big enough to bathe a dragon, and the fire under it roars like it is hungry.',
          gm: 'A raid or a sneak, between contests. Kharsimet\'s cabin holds his copy of the contract with the vizier: proof for the prince. Putting out the kettle-fire (a lot of water, or cold magic dealing 30 cold damage to it) means the Kettles cannot use the rain even if they steal it. If the heroes are caught, the crew fights; Kharsimet himself is busy at the palace.',
          treasure: 'Kharsimet\'s strongbox: 1,800 gp in brass-wrapped rubies, a necklace of fireballs (5 beads), and the vizier\'s signed contract.',
        },
        {
          room: 'The Riddle Pavilion', title: 'Contest two: the Duel of Riddles', handout: 'dw-riddles',
          read: 'The gong sounds. A whirlwind in a bow tie bows to you and says, "We go first. No we don\'t. You do." Above you, the judge coils and watches.',
          gm: 'Each team answers the five riddles; one minute each (use a real timer). Answers: 1 the wind, 2 rain, 3 a shadow, 4 a promise (or your word), 5 a weathervane (or compass). A stuck player can roll DC 15 Intelligence for a hint. The vizier feeds the Kettles answers through her whisper-shell: catching her (DC 18 Perception, or detect magic) and telling Ysquel voids their score. Making Ziffle laugh makes him throw his own round.',
          treasure: 'Winner\'s prize: a robe of useful items.',
        },
        {
          room: 'The Feast Hall', title: 'Contest three: the Feast of a Thousand Tests', handout: 'dw-menu', encounter: 'Knives under the tablecloth',
          read: 'Mist servants lift the silver domes all at once. The soup immediately floats out of your bowl and hovers at eye level, steaming politely.',
          gm: 'Five courses, one test each; the team passing the most wins. Soup of Mists: drink it without spilling (DC 15 Dexterity or a clever idea). Honest Bread: anyone who lies while eating it chokes (DC 17 Charisma save); rivals ask nosy questions. Thunder Pepper: DC 16 Constitution save or burp lightning, 7 (2d6) to each neighbour. Cup of Courtesy: toast the host in proper djinni style (DC 16 History or Persuasion). Dessert: the vizier\'s sleeping poison is in the cup of the heroes\' best talker (DC 18 Medicine or Perception to notice; DC 17 Constitution save or asleep for the next contest). Expose it and the Soot Sisters draw their knives.',
          treasure: 'Winner\'s prize: an elixir of health and two potions of superior healing.',
        },
        {
          room: 'The Isle of Wind Chimes', title: 'The chimes that talk', optional: true,
          read: 'A hundred tiny voices speak at once as the wind picks up. "Don\'t bet." "He doesn\'t remember us." "It was the vizier!"',
          gm: 'Freeing a chime (see the area notes) earns a witness: Bettany Crook saw the vizier\'s "fire friends" frame her two years ago. Her word alone isn\'t proof for Ysquel, but it points the heroes at the vizier\'s study and the Smoke Dhow. Freed chimes cheer the heroes in every contest after: +1 laurel of crowd favour, once.',
          treasure: 'A grateful freed chime gives a ring of feather falling she kept hidden in her apron for two years.',
        },
        {
          room: 'The Maze of Winds', title: 'Contest four: the Maze of Winds', encounter: 'Hunters in the wind',
          read: 'The wind walls howl up around you as the gate seals shut. Through the white, you glimpse other shapes moving, and something you cannot see at all brushes past your shoulder.',
          gm: 'First team out with the Golden Feather wins. The Kettles have a chart of the maze from the vizier (they move fast but the maze shifts, so the chart goes wrong once). The invisible stalkers attack the heroes for real; showing Ysquel a stalker wound (they are supposed to steal, not kill) disqualifies the stalkers\' secret patron... once the heroes work out who that is.',
          treasure: 'The Golden Feather (lets its holder pass through the wind walls once) and the maze prize: winged boots.',
        },
        {
          room: 'The Arena of Gales', title: 'Contest five: the Mock Battle', encounter: 'Mock battle: the Highwhistles',
          read: 'The crowd stamps on the clouds until the whole arena shakes. Across the sand, a cloud giant swings a morningstar the size of a cart, and two riders on griffons lower their spears. "Little cousins," she rumbles, "I will try not to break you."',
          gm: 'Capture the banner in the middle and hold it for 3 rounds. Dropped to 0 means caught and out. If the heroes have shown Ormelda the truth beforehand, she fights fair and salutes them; win or lose, she backs them in the prince\'s court. The Kettles "win" their own bout against the Six Winds because Ziffle laughs too hard to fight.',
          treasure: 'Winner\'s prize: a javelin of lightning, and Ormelda\'s silver bell (she will come once if it is rung).',
        },
        {
          room: "The Vizier's Study", title: 'The vizier\'s secrets', optional: true, handout: 'dw-ledger', encounter: "The vizier's keepers",
          read: 'Ink, hot brass and old paper. On the desk, under a glass dome, two little bones sit side by side, and one of them is heavier than it should be.',
          gm: 'The secret door is behind the Feast Hall tapestry, or at the top of the vizier\'s rope line. Two invisible stalkers guard it. Mind the warding glyph on the desk. The loaded knucklebones and the ledger are proof enough for Ysquel and the prince: this is the fast way to win.',
          treasure: 'The loaded knucklebones, the ledger, a wand of lightning bolts, and 900 gp in assorted coins from a dozen worlds.',
        },
        {
          room: "The Prince's Treasury", title: 'The wager scroll', optional: true, handout: 'dw-wager', encounter: 'Treasury wardens',
          read: 'Silver trees, a bottled ship, crowns piled like turnips. And on its own cushion, a scroll tied in blue.',
          gm: 'Breaking in is cheating, but a cheat nobody catches is legal here. The scroll proves the knucklebones were the vizier\'s, which makes the loaded bones in her study damning. Saying "Again!" stops the wardens. Taking anything but the scroll is theft, and the prince will notice at the end (he counts everything).',
          treasure: 'If the heroes help themselves: 4,000 gp in gems, a carpet of flying (4 by 6 ft) and a cloak of protection. The prince lets them keep it if they win; if they lose, they become chimes.',
        },
        {
          room: 'The Storm Engine', title: 'The Last Gong', encounter: 'The cheaters unmasked',
          read: 'The gong rolls across the sky. The great machine shudders, and from its back comes a new noise: a wet, greedy slurping. Through the glass of the cistern you see the storm draining away into a brass pipe, and beside it a red giant and a grey old woman turn to face you.',
          gm: 'Whether the heroes won on laurels or exposed the fraud, Kharsimet and Nessarine now try to steal the rain by force. Each round the siphon runs, Thessmark loses a month of rain (after 5 rounds only a drizzle is left). Stop it with the lever and a DC 18 Athletics check, dispel magic, or by cutting the pipe on the Gale Ribbon. The catch-winds are off here. The prince watches, delighted: "The FINAL EVENT!" Kharsimet flees below 40 hit points; Nessarine surrenders below half and begs for mercy.',
          treasure: 'Grand prize: 5,000 gp, the rain, and one favour from the prince for each hero. From the cheaters: Kharsimet\'s +2 scimitar and Nessarine\'s staff of thunder and lightning. Pim gives the heroes a decanter of endless water: "So you never go thirsty, like we did."',
        },
      ],
      wrapUp: 'The winner pulls the lever, and the Storm Engine roars as three seasons of rain pour off the edge of the sky toward Thessmark. The prince declares it "the best Games in a century", sentences his vizier to a chime (or, if the heroes ask, to forty years of honest work), and invites the heroes back next year as judges.',
    },
  ],
  ending:
    'Win: rain falls on Thessmark for three days without stopping, and the people dance in the mud. King Hollis pays the heroes, swears off knucklebones forever, and names a festival after them. The prince owes them a favour, and a djinni\'s favour is worth a kingdom. Lose: the rain goes into the Brass Kettle and away to the fire markets. Thessmark has one dry year to live, unless the heroes chase the Smoke Dhow and take the steam back before it is sold. Next: the House of the Brass Kettle holds contracts on other mortals too, and Nessarine (chime or not) knows all their names.',
};

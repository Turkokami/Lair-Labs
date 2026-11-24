// The Ember Court: a court-intrigue adventure on the Elemental Plane of Fire for four heroes of level 17.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder } from './builder';
import type { Adventure } from './types';

/** Turn only the floor squares in a rectangle to lava (never carves into solid rock). */
function lavaOn(b: MapBuilder, x: number, y: number, w: number, h: number) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (b.isFloor(i, j)) b.lava(i, j, 1, 1);
}

function emberCourt() {
  const b = new MapBuilder('adv-ember-court', 'The Ember Court', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'dungeon-slab' });

  // ----- the Ember Sea: lava everywhere, with islands of black glass -----
  b.lava(0, 0, 80, 80);
  b.cave('Cinder Docks', 10, 68, 8.5, 9, {
    seed: 41, mat: 'dungeon-slab',
    read: 'Your skiff grinds onto a shore of black glass. The sky is orange from edge to edge, and the sea is lava, slow and bright, breathing heat into your face. Across it, a brass palace floats on the fire like a lily.',
    gm: 'The heroes arrive here (through a rift, a plane shift or a hired flame-boat). Harbourmaster Szass sells Guest-Flames: 500 gp each, or a good story (DC 20 Persuasion), or a secret worth selling. A Guest-Flame wards its holder against the plane\'s heat and lets them walk the palace as a guest. No Guest-Flame? The dock wardens try to take the heroes as "salvage".',
  });
  b.cave('Glassmarket', 35, 67, 10, 9, {
    seed: 42, mat: 'stone-cobble',
    read: 'A market of black glass and brass awnings. Smiths blow glass with their bare breath. Azer haul carts, salamanders haggle, and from a raised block in the middle a voice like a bellows calls out lots and prices.',
    gm: 'Everything is for sale here, including people. Mortal captives from many worlds are kept in the pens. Prices are in brass, but gold is welcome. A DC 18 Investigation or Insight check overhears that "the prince bought a sun" three weeks ago.',
  });
  b.cave(null, 65, 67, 11, 9.5, { seed: 43, mat: 'dungeon-slab' });
  b.cave(null, 9, 13, 7, 7.5, { seed: 44, mat: 'dungeon-slab' });

  // solid black glass: the palace's foundation, the Glass Spine, the dragon's crag and a few spires out at sea
  b.rock(20, 3, 43, 45);
  b.rock(0, 30, 20, 27);
  b.rock(64, 10, 16, 36);
  b.rock(27, 52, 2, 2).rock(52, 55, 2, 2).rock(3, 1, 2, 2).rock(74, 2, 3, 3).rock(47, 0, 3, 1);

  // ----- the docks -----
  b.start(9, 70, 3, 3);
  b.floor(12, 77, 2, 3, 'wood-planks').floor(18, 72, 4, 1, 'wood-planks').floor(0, 66, 3, 1, 'wood-planks');
  b.building('Harbour-house', 4, 61, 7, 5, {
    mat: 'wood-planks-dark',
    read: 'A brass-roofed shed hung with chains and tally-boards. A salamander lies coiled on the counter, counting coins with the tip of its tail.',
    gm: 'Szass\'s office. The tally-board lists every boat in and out: three weeks ago, "one cage, very bright, to the prince\'s crucible, paid in full". DC 17 Perception spots it. The strongbox (DC 20 Thieves\' Tools) holds the harbour takings.',
    doors: [[7, 65, 's', 'closed']], windows: [[10, 63, 'e']],
  });
  b.prop('shop-counter', 6, 62).prop('strongbox', 9, 62).prop('notice-board', 5, 64).prop('scales', 8, 64).light(7, 63, 10, 15);
  b.props_('mooring-post', [[13, 78], [21, 72], [1, 66]]).props_('rowboat', [[15, 78], [21, 73]], 90).prop('canoe', 0, 67).props_('cargo-crates', [[13, 70], [6, 72]]).prop('crate-stack', 14, 66).props_('barrel-group', [[4, 69], [15, 72]]).prop('rope-coil', 12, 75).prop('anchor', 8, 75).prop('signpost', 12, 68).prop('gangplank', 12, 76);
  b.props_('lamp-post', [[7, 68], [14, 74]]).light(7, 68, 15, 20, '#ffb35c').light(14, 74, 15, 20, '#ffb35c');
  b.encounter('Dock wardens', [3, 60, 15, 15], [['salamander', 4], ['hell-hound', 4]], 'low');

  // the hidden mouth of the lava tube, behind a stack of crates under the Glass Spine
  b.floor(8, 57, 4, 2, 'cave-floor');
  b.prop('crate-pile', 11, 58);
  b.tunnel([[9, 56], [7, 50], [8, 44], [6, 39], [11, 38], [14, 41], [14, 43], [20, 43]], 2, { seed: 45, mat: 'cave-floor' });
  b.door(9, 56, 's', 'secret').door(10, 56, 's', 'secret');
  b.cave("Smugglers' grotto", 6, 38, 4, 3, {
    seed: 46, mat: 'cave-floor',
    read: 'The tube opens into a bubble of glass the colour of smoke. Someone has been living here: a bedroll, a lamp and a neat row of stolen bottles.',
    gm: 'Nim\'s hiding place, and the cache of a dead smuggler. With Nim, the heroes find it at once; without, DC 18 Perception to notice the loose glass plate hiding the cache.',
  });
  b.prop('bedroll', 4, 38).prop('loot-sacks', 7, 37).prop('oil-lamp-hanging', 5, 37).prop('shelf-jars', 8, 39).light(5, 37, 5, 10);
  lavaOn(b, 6, 47, 5, 2);
  b.area('Lava tube', [[7, 44, 3, 12]], {
    read: 'A round tunnel of glass, rippled like the inside of a throat. Halfway up, a stream of lava crosses the floor, hissing.',
    gm: 'The lava tube runs from the docks to a secret door in the furnace prisons. The lava stream is 10 ft wide: a DC 15 Athletics or Acrobatics jump clears it, or a creature wading through takes 33 (6d10) fire damage. Salamanders hunt in the tube; they come at the heroes from both ends.',
    label: [8, 52],
  });
  b.props_('steam-vent', [[8, 53], [15, 44]]).prop('magma-vent', 7, 49).prop('stalactites', 15, 43).prop('crumbling-ledge', 9, 45);
  b.light(8, 47, 15, 20, '#ff7a2e');
  b.encounter('Lava-tube crawlers', [4, 36, 14, 16], [['salamander', 4], ['fire-elemental', 1]], 'low');
  b.door(20, 43, 'e', 'secret').door(20, 44, 'e', 'secret');

  // ----- bridges across the sea -----
  b.floor(18, 67, 7, 2, 'wood-planks-dark');
  b.area("Slavers' Bridge", [[18, 67, 7, 2]], {
    read: 'A bridge of brass plates hung on chains crosses the lava. Every plate is stamped with a number, and the chains are hot enough to blister.',
    gm: 'Bare hands on the chains: 5 (1d10) fire damage. A creature knocked prone here must make a DC 15 Dexterity save or slide off into the lava.',
    label: [21, 67],
  });
  b.prop('bridge-rope', 21, 68, 90);
  b.floor(38, 52, 2, 7, 'wood-planks-dark');
  b.area('Long Chain', [[38, 52, 2, 7]], {
    read: 'The longest bridge on the sea swings between the market and the palace quay. Halfway across, a brass statue of the prince holds out a bowl for tolls.',
    gm: 'Toll: one coin of gold in the bowl. Anyone who crosses without paying hears the statue say their name aloud; the Gate of Brass hears it too, and its guards are waiting.',
    label: [38, 55],
  });
  b.prop('offering-bowl', 39, 55).prop('bridge-plank', 38, 53);
  b.floor(45, 66, 8, 2, 'wood-planks-dark');
  b.area('Hammer Bridge', [[45, 66, 8, 2]], {
    read: 'A low, heavy bridge of hammered iron, worn smooth by the feet of azer hauling ore.',
    gm: 'Safe and sturdy. The azer use it all day. A good place to meet an azer and hear about the forge-temple.',
    label: [48, 66],
  });
  b.prop('handcart', 49, 67);

  // ----- the Glassmarket -----
  b.building('Slave pens', 26, 63, 7, 6, {
    mat: 'dirt',
    read: 'Iron bars, black straw and the smell of scorched skin. Faces from a dozen worlds look up at you: a goatherd, a sailor, a child in a soot-black dress.',
    gm: 'Twenty-two mortal captives, eight of them from Vellandry, taken with the sun. The pens\' key hangs on the auctioneer\'s belt. Freeing them openly is theft under court law and ends the heroes\' guest status unless they buy them (150 gp each) or win them in a wager.',
    doors: [[32, 65, 'e', 'locked', 'door-iron']],
  });
  b.wallRun(26, 63, 7, 'n', 'bars').wallRun(26, 63, 6, 'w', 'bars');
  b.props_('straw-bed', [[27, 64], [27, 67], [30, 67]]).prop('water-trough', 30, 64).prop('wall-chains', 28, 66).light(29, 65, 5, 10);
  b.area('Auction block', [[34, 61, 8, 6]], {
    read: 'A slab of brass on a pillar of glass. On it, a thin young human in a slave collar stands very still while a fire giant lists their virtues: "Strong back. Knows the palace. Does not scream."',
    gm: 'Nim Tallow is the lot on the block, and the bidding is at 400 gp. Two fire giants run the auction with salamander guards. Buying Nim takes 500 gp or a DC 21 Persuasion/Deception to outbid with promises. Starting a fight here is a breach of the market peace: the giants fight, and the Long Chain toll statue screams the alarm.',
    label: [38, 63],
  });
  b.prop('lectern-dais', 38, 62).props_('cage', [[35, 62], [41, 62]]).prop('chains-hanging', 37, 64).prop('brazier-pedestal', 40, 65).light(40, 65, 15, 20, '#ff9a3c');
  b.encounter('The auction block', [27, 60, 16, 10], [['fire-giant', 2], ['salamander', 2]], 'low');
  b.props_('market-stall', [[30, 71], [34, 73], [40, 71], [43, 68]]).props_('produce-stall', [[37, 74]]).prop('merchant-cart', 28, 69).props_('crystal-spire', [[32, 60], [44, 64]]).prop('forge', 42, 73).prop('anvil', 41, 74).props_('crate', [[31, 74], [44, 70]]).prop('scales', 35, 72).prop('fire-bowl', 36, 69);
  b.light(34, 73, 10, 15, '#ffb35c').light(42, 73, 10, 20, '#ff9a3c');

  // ----- Anvil Isle and the forge-temple -----
  b.area('Anvil Isle', [[54, 59, 3, 14]], {
    read: 'An island of black rock where every surface rings with hammers. Chains of finished brass lie coiled on the shore like sleeping snakes.',
    gm: 'The azer smiths\' island. Flame-boats tie up on the south shore; a boat and its bound fire spirit can be hired here for 100 gp, or stolen (DC 20 Stealth while the azer pray).',
    label: [55, 66],
  });
  b.props_('mooring-post', [[60, 75], [70, 74]]).props_('canoe', [[61, 76], [69, 75]]).props_('ore-pile', [[55, 63], [73, 64]]).prop('chains-hanging', 56, 70).prop('mine-cart', 74, 68);
  b.building('Forge-temple of the Bound Flame', 57, 61, 12, 10, {
    mat: 'brick-floor',
    read: 'A temple and a smithy in one. Azer with beards of fire beat brass on anvils in time to a hymn, around a well of lava where a pillar of white flame turns slowly, wrapped in chains.',
    gm: 'Hammerfather Kolv leads the azer here. They are bound workers of the prince, not willing slaves of him, and they remember forging the chains that hold "the One Below". Kolv can forge a Chain of Binding in an hour if the heroes bring 1,000 gp of brass or a scale from Pyrrhax (see the Smiling Ash). Insult the Bound Flame and the temple fights.',
    doors: [[57, 65, 'w', 'closed', 'door-double'], [57, 66, 'w', 'closed', 'door-double'], [68, 62, 'e', 'closed']],
  });
  lavaOn(b, 62, 64, 3, 3);
  b.props_('forge', [[58, 62], [66, 62]]).props_('anvil', [[59, 64], [66, 65], [59, 68]]).prop('idol-colossal', 63, 65).prop('altar', 63, 62).prop('temple-bell', 67, 69).props_('prayer-kneeler', [[61, 68], [63, 68], [65, 68]]).prop('tool-wall', 58, 69).prop('water-trough', 66, 67);
  b.light(63, 65, 20, 25, '#fff1c4').light(58, 63, 10, 15, '#ff9a3c');
  b.encounter('Keepers of the forge', [57, 61, 12, 10], [['azer', 10], ['salamander', 2], ['fire-elemental', 1]], 'low');

  // ----- the Red Roost: the court dragon's crag -----
  b.cave('The Red Roost', 71, 26, 6, 9, {
    seed: 47, mat: 'cave-floor',
    read: 'The crag is hollow, open to the burning sky. Bones of fire giants lie in a heap, picked clean. On a mound of brass coins sleeps a red dragon the size of a ship, a brass collar welded round her neck and a chain as thick as a man running from it into the rock.',
    gm: 'Pyrrhax the Collared, the prince\'s court beast, and her grown son. She hates the prince. Talking to her is dangerous but possible (she is bored and proud). Bring her the collar key from the treasury and she swears, on her hoard, to burn the throne hall at a signal, or simply to leave. Wake her rudely and she fights.',
  });
  b.tunnel([[71, 33], [70, 39], [71, 45]], 2, { seed: 48, mat: 'cave-floor' });
  b.floor(71, 46, 2, 15, 'wood-planks-dark');
  b.area('Dragon Stair', [[70, 38, 3, 22]], {
    read: 'A stair cut into the crag, then a bridge of black iron down to Anvil Isle. Claw marks score the rails.',
    gm: 'The dragon\'s keepers use it to bring her meat. The bridge is wide enough for her to walk, and she sometimes does.',
    label: [71, 50],
  });
  b.prop('dragon-hoard', 72, 24).prop('bone-heap', 68, 30).prop('giant-ribcage', 74, 31).prop('wall-chains', 70, 21).prop('crystal-spire', 67, 22).prop('skull-bleached', 75, 27).prop('burning-ground', 69, 26).prop('stairs-down', 71, 37);
  b.light(71, 25, 20, 30, '#ff7a2e');
  b.encounter('Pyrrhax in her roost', [65, 17, 13, 19], [['adult-red-dragon', 1], ['young-red-dragon', 1]], 'moderate');

  // ----- Seffra's pleasure isle -----
  b.building('Pavilion of Seven Sparks', 4, 8, 10, 9, {
    mat: 'marble',
    read: 'Silk walls the colour of embers, cushions, a fountain that runs with liquid gold. Seven small flames hang in the air like lanterns, each humming a different note.',
    gm: 'Lady Seffra Coalcrown\'s island retreat, linked to the courtiers\' galleries by a private bridge. Here she will speak plainly, and here she makes her offer (see her profile). The seven sparks are bound fire spirits that report every word to her.',
    doors: [[8, 16, 's', 'closed'], [9, 16, 's', 'closed']], windows: [[4, 11, 'w'], [13, 11, 'e']],
  });
  b.props_('sofa', [[6, 10], [11, 10]]).prop('rug-round', 8, 12).prop('fountain', 9, 9).props_('censer-hanging', [[6, 14], [11, 14]]).prop('harpsichord', 12, 15).prop('vanity', 5, 15).prop('folding-screen', 12, 9);
  b.props_('fire-bowl', [[7, 18], [11, 18]]).prop('statue-tall-winged', 3, 13).light(9, 12, 15, 20, '#ffd27a');
  b.floor(12, 19, 2, 6, 'wood-planks-dark').floor(12, 25, 10, 2, 'wood-planks-dark');
  b.prop('lantern-standing', 16, 25).light(16, 25, 10, 15, '#ffd27a');

  // ----- the palace: brass halls carved into the black glass -----
  b.floor(34, 48, 16, 4, 'stone-flagstone-warm');
  b.area('Brass Quay', [[34, 48, 16, 4]], {
    read: 'A quay of polished brass at the foot of the palace. Flame-boats nose against it, pushed by fire spirits trapped under their hulls. Above you, the brass doors are three storeys tall.',
    gm: 'The palace landing. Herald Ammurat (an efreeti, use the efreeti stat block) greets guests and asks their names and their gifts. A gift for the prince worth 1,000 gp or more, or a good show (DC 20 Performance), gets the heroes seats at tonight\'s Feast of Embers.',
    label: [44, 49],
  });
  b.props_('mooring-post', [[34, 51], [49, 51]]).props_('rowboat', [[47, 52], [35, 52]], 90).props_('lamp-post', [[36, 48], [47, 48]]).prop('banner-pole', 40, 49).prop('banner-pole', 43, 49).prop('cargo-crates', 46, 50);
  b.light(36, 48, 15, 20).light(47, 48, 15, 20);

  b.room('Gate of Brass', 36, 40, 12, 7, {
    mat: 'stone-flagstone-warm',
    read: 'A hall of beaten brass, lit by hanging bowls of fire. Two efreet in mail of overlapping gold coins stand with scimitars drawn, and a row of salamanders lies along the walls like rugs that watch you.',
    gm: 'Guests with Guest-Flames pass. Others need the herald\'s word, a bribe (2,000 gp) or a DC 22 Deception. Forcing the gate brings the guards, and every courtier hears of it.',
  });
  b.hall(41, 47, 41, 47, 2).door(41, 46, 's', 'closed', 'door-double').door(42, 46, 's', 'closed', 'door-double');
  b.props_('statue-tall-winged', [[37, 41], [46, 41]]).props_('brazier-hanging', [[38, 44], [45, 44]]).prop('stair-grand', 41, 41).prop('banner-hanging-tall', 36, 43).prop('banner-hanging-tall', 47, 43).prop('trap-rune-threshold', 42, 45, 0, { gm: true });
  b.light(38, 44, 15, 20).light(45, 44, 15, 20);
  b.encounter('Gate of Brass', [36, 40, 12, 7], [['efreeti', 2], ['salamander', 6]], 'moderate');

  b.room('Gardens of Fire', 33, 21, 18, 17, {
    mat: 'dirt',
    read: 'A garden where everything burns. Trees of twisted brass bear fruit of flame. Paths of warm stone cross between beds of bubbling lava, and in the middle a fountain throws up arcs of liquid fire that fall back with a sound like rain.',
    gm: 'The Feast of Embers is held here tonight: courtiers recline on the paths, fire elementals dance as entertainment. The dancers are bound spirits: a heroic insult to the prince, a drawn weapon without a named duel, or a freed spirit turns them on the heroes. Stepping into a lava bed: 33 (6d10) fire damage, and again at the start of each turn there.',
  });
  b.paint(41, 21, 2, 17, 'stone-flagstone-warm').paint(33, 29, 18, 1, 'stone-flagstone-warm');
  lavaOn(b, 35, 23, 4, 3); lavaOn(b, 45, 23, 4, 3); lavaOn(b, 35, 33, 4, 3); lavaOn(b, 45, 33, 4, 3);
  b.prop('fountain-grand', 41, 29).props_('tree-dead', [[34, 27], [49, 27], [34, 31], [49, 31], [39, 22], [44, 36]]).props_('burning-ground', [[37, 27], [46, 31]]).props_('table-feast', [[37, 30], [46, 27]]).props_('fire-bowl', [[40, 24], [43, 34]]).prop('flowers', 39, 35).prop('lava-pool', 36, 24).prop('lava-pool', 46, 34);
  b.light(41, 29, 20, 30, '#ffb347').light(36, 24, 10, 20, '#ff7a2e').light(46, 34, 10, 20, '#ff7a2e');
  b.encounter('Garden of living flame', [33, 21, 18, 17], [['fire-elemental', 6]], 'low');
  b.hall(41, 38, 41, 38, 2).door(41, 39, 's', 'closed', 'door-double').door(42, 39, 's', 'closed', 'door-double');

  b.room("Courtiers' galleries", 22, 21, 9, 16, {
    mat: 'marble',
    read: 'Long galleries of white stone hung with mirrors of polished brass, so that every whisper has a hundred faces. Courtiers of fire lounge on couches, trading secrets for sweets.',
    gm: 'The heart of the intrigue. A DC 19 Insight or a 200 gp bribe learns one rumour (see tips). Lady Seffra\'s private bridge leaves from the west wall. If the heroes are asking too many questions about the sun, the prince sends knives: two assassins and an efreeti "duelling master" who will call it a duel after the fact.',
  });
  b.wallRun(23, 26, 3, 's', 'low').wallRun(27, 31, 3, 's', 'low');
  b.props_('mirror', [[22, 22], [30, 22], [22, 34]]).props_('chaise-longue', [[24, 23], [28, 28], [24, 33]]).props_('armchair', [[29, 24], [23, 29]]).prop('table-cards', 26, 30).prop('rug-runner', 26, 35).props_('candelabra', [[27, 22], [29, 34]]).prop('gallery-balcony', 30, 27).prop('stair-spiral', 22, 36);
  b.light(27, 22, 10, 15, '#ffd27a').light(29, 34, 10, 15, '#ffd27a');
  b.encounter('Knives in the galleries', [22, 21, 9, 16], [['assassin', 2], ['efreeti', 1]], 'low');
  b.door(21, 25, 'e', 'closed').door(21, 26, 'e', 'closed');
  b.hall(31, 26, 32, 26).door(32, 26, 'e', 'open');
  b.hall(31, 32, 32, 32).door(32, 32, 'e', 'closed');

  b.room('Ring of Cinders', 53, 18, 7, 14, {
    mat: 'sand',
    read: 'A duelling floor of black sand inside a square of running lava. Brass benches rise around it. The sand is littered with broken blades and something that was once a helmet.',
    gm: 'Under court law, a guest may be challenged only by a named duel, fought here before witnesses. Brannoch Slagborn is the prince\'s champion. Duels are to "yielding or ash": one hero against one champion, others may not interfere. The prince\'s side may add a second if the heroes cheat. The lava square around the floor deals 33 (6d10) fire damage to anyone pushed in.',
  });
  lavaOn(b, 54, 21, 5, 1); lavaOn(b, 54, 28, 2, 1); lavaOn(b, 57, 28, 2, 1); lavaOn(b, 54, 22, 1, 6); lavaOn(b, 58, 22, 1, 6);
  b.props_('bench-long', [[53, 19], [59, 19], [53, 30], [59, 30]]).prop('weapon-rack', 53, 25).prop('armor-stand', 59, 25).prop('war-banner', 56, 19).props_('broken-furniture', [[56, 24]]).prop('cresset', 53, 29);
  b.light(56, 25, 15, 20, '#ff7a2e');
  b.encounter('Duel in the Ring', [53, 18, 7, 14], [['fire-giant', 2]], 'low');
  b.hall(51, 26, 52, 26).door(52, 26, 'e', 'closed');

  b.room('Throne Hall', 34, 6, 16, 13, {
    mat: 'marble',
    read: 'A hall of fluted brass columns, so tall the ceiling is lost in smoke. A moat of lava runs before the dais. On a throne of cooled gold sits a giant of red lacquer skin and smoking beard, who smiles at you as if you were dessert.',
    gm: 'Prince Ashkarran holds court here with three efreet nobles, four salamander guards and a fire giant doorwarden. He loves bargains and wordplay. He will not give up the sun for anything less than a crown, but proof of what the Voice really is (the compact, Oriel\'s testimony, Seffra\'s word) plus a DC 22 Persuasion makes him doubt. Behind the dais, a secret door (DC 21 Perception) leads to the servants\' route; another in the west wall (DC 21) opens on the Sunken Crucible.',
  });
  lavaOn(b, 38, 10, 8, 1);
  b.prop('throne-dais', 41, 7).prop('throne', 42, 8).props_('column-fluted', [[36, 9], [36, 12], [36, 15], [47, 9], [47, 12], [47, 15]]).props_('banner-hanging-tall', [[35, 7], [48, 7]]).props_('brazier-everburning', [[39, 7], [45, 7]]).prop('chandelier-great', 41, 13).prop('rug-runner', 42, 15).prop('rug-runner', 42, 17).prop('doors-grand-frame', 41, 18);
  b.light(39, 7, 15, 20).light(45, 7, 15, 20).light(41, 13, 20, 25, '#ffd27a');
  b.encounter("The prince's court", [34, 6, 16, 13], [['efreeti', 4], ['salamander', 4], ['fire-giant', 1]], 'high');
  b.hall(41, 19, 41, 19, 2).door(41, 18, 's', 'closed', 'door-double').door(42, 18, 's', 'closed', 'door-double');

  b.room('Treasury', 52, 6, 8, 10, {
    mat: 'stone-flagstone-warm',
    read: 'A vault lined with shelves of brass. Coins, crowns, caged gems and bottles that hum. In the middle stands a statue of the prince in iron, and as the door opens, its head turns.',
    gm: 'The brass warden, a furnace-hearted giant of polished brass (Brass Warden stat block), attacks anyone without the prince\'s signet. The vault door from the Throne Hall is locked (DC 25 Thieves\' Tools, or the signet). The servants\' route reaches a secret panel in the east wall that the warden does not watch: a DC 20 Stealth check gets in and out unseen. Here: the Hearth-Cage, Pyrrhax\'s collar key and the compact.',
  });
  b.door(51, 10, 'e', 'locked', 'door-iron');
  b.hall(50, 10, 51, 10);
  b.props_('treasure-pile', [[53, 7], [58, 7], [53, 14]]).props_('coin-stacks', [[58, 14], [55, 7]]).prop('display-case', 59, 10).prop('jewelry-box', 54, 11).prop('reliquary', 57, 12).prop('orb-pedestal', 56, 9).prop('treasure-urn', 52, 12).prop('statue-knight', 55, 13);
  b.light(56, 9, 10, 20, '#fff1c4');
  b.encounter('The brass warden', [52, 6, 8, 10], [['emberBrassWarden', 1]], 'low');

  b.cave('The Sunken Crucible', 27, 13, 5, 6, {
    seed: 49, mat: 'cave-floor',
    read: 'A pit of black glass under the palace. In the middle, a crucible of lava glows white. Above it, in a cage of brass, hangs a small sun: a ball of pure morning, too bright to look at, and it is screaming. Below the lava, chained in green bronze, something vast opens its eyes and smiles.',
    gm: 'Morroch the Smiling Ash, a balor, bound here nine hundred years ago by the prince\'s grandmother. He has been the "Voice in the Furnace" all along. When the Hour of Brass comes, the sun is lowered into the crucible, the chains melt and Morroch is free. If the heroes come before then, Morroch tears half free anyway in rage: he fights with the bound fire spirits and salamanders he has corrupted. A Chain of Binding from Kolv thrown over him (DC 18 Athletics or a ranged attack against AC 19) takes away his Fire Aura and his flight until he breaks it (DC 25 Strength, his action).',
  });
  lavaOn(b, 25, 11, 4, 4);
  b.prop('cage-hanging', 26, 12).props_('chains-hanging', [[24, 10], [29, 15]]).props_('wall-chains', [[23, 9], [25, 17]]).props_('magma-vent', [[24, 16], [30, 10]]).prop('summoning-circle', 28, 16).prop('idol', 23, 13);
  b.light(26, 12, 25, 30, '#fff8dc').light(28, 16, 10, 15, '#ff4a2e');
  b.encounter('The Smiling Ash', [21, 6, 12, 14], [['balor', 1], ['fire-elemental', 6], ['salamander', 3]], 'high');
  b.hall(31, 13, 33, 13).door(33, 13, 'e', 'secret');

  // the servants' furnace route: a cramped brick crawlway behind every wall that matters
  b.hall(61, 40, 61, 4, 1, { mat: 'brick-floor' }).hall(61, 4, 30, 4, 1, { mat: 'brick-floor' });
  b.hall(30, 4, 30, 9, 1, { mat: 'brick-floor' }).door(30, 4, 's', 'secret');
  b.hall(41, 5, 41, 5).door(41, 5, 's', 'secret');
  b.hall(60, 10, 60, 10).door(60, 10, 'w', 'secret');
  b.hall(60, 40, 60, 40).door(59, 40, 'e', 'closed');
  b.area("Servants' furnace route", [[61, 4, 1, 37], [30, 4, 31, 1]], {
    read: 'A brick crawlway so hot the air shimmers, barely wide enough for one. Soot handprints mark the walls, and here and there someone has scratched a tally of days.',
    gm: 'The palace\'s hidden service passage, used by mortal slaves to carry fuel. Nim knows it by heart. It reaches the Treasury (secret panel), the back of the Throne Hall (spy door behind the throne) and the Crucible (a sealed hatch the servants are forbidden to open). Without Fire Resistance, every 10 minutes in here costs a DC 15 Constitution save or a level of exhaustion.',
    label: [61, 22],
  });
  b.props_('ladder', [[61, 30]]).props_('firewood', [[61, 36], [45, 4]]).prop('sack', 52, 4).prop('lantern-hook', 61, 15).prop('bones', 35, 4).light(61, 15, 5, 10);

  b.room('Great Furnace', 52, 36, 8, 11, {
    mat: 'brick-floor',
    read: 'The palace kitchen and boiler room: a pit of lava with grilles over it, black pots, and mortal servants in soaked rags feeding coal to the fire. Nobody looks up.',
    gm: 'Thirty mortal servants work here under a single salamander overseer who is usually asleep. They will hide the heroes, show them the servants\' route, and cheer (silently) if the overseer is dealt with. They know Oriel is alive: they bring her water.',
  });
  lavaOn(b, 55, 40, 3, 3);
  b.props_('hearth-grand', [[52, 37]]).props_('cauldron', [[58, 38], [53, 42]]).prop('pot-rack', 57, 37).prop('butcher-block', 58, 44).prop('bread-rack', 53, 45).prop('firewood', 59, 42).prop('water-barrel', 56, 45).prop('trap-vent-grate', 56, 43, 0, { gm: true });
  b.light(56, 41, 15, 20, '#ff7a2e');
  b.hall(48, 44, 51, 44).door(51, 44, 'e', 'closed');

  b.room('Furnace prisons', 21, 39, 11, 8, {
    mat: 'dungeon-slab',
    read: 'Cells cut into the hot glass, fronted with bars. The prisoners inside are red-faced and silent. In the end cell, a woman in scorched white robes sits with her back straight, singing a dawn hymn under her breath.',
    gm: 'Sunwarden Oriel Vane is in the end cell, and in the next one sits Brannoch\'s son, Hask, a young fire giant held to keep his father loyal. The jailers are salamanders, two fire giants and hell hounds. The cell doors open with keys on the head jailer, or DC 22 Thieves\' Tools. A secret door in the west wall (DC 20 Perception) opens on the lava tube.',
  });
  b.wallRun(24, 39, 3, 'e').wallRun(27, 39, 3, 'e').wallRun(25, 41, 7, 's', 'bars');
  b.door(26, 41, 's', 'locked', 'door-iron').door(29, 41, 's', 'locked', 'door-iron');
  lavaOn(b, 27, 44, 3, 2);
  b.props_('straw-bed', [[25, 39], [30, 39]]).prop('wall-chains', 28, 40).props_('torture-rack', [[22, 45]]).prop('desk', 31, 45).prop('key-ring', 31, 46).prop('stocks', 23, 42).prop('stairs-up', 22, 39).prop('brazier', 25, 44);
  b.light(25, 44, 10, 15, '#ff7a2e');
  b.encounter('Furnace jailers', [21, 39, 11, 8], [['salamander', 6], ['fire-giant', 2], ['hell-hound', 4]], 'moderate');
  b.hall(22, 37, 22, 38).door(22, 38, 's', 'locked', 'door-iron');
  b.hall(32, 44, 35, 44).door(35, 44, 'e', 'locked', 'door-iron');

  // the open sea
  b.area('The Ember Sea', [[48, 52, 20, 4]], {
    read: 'The sea of fire rolls in slow, heavy waves. Now and then a bubble the size of a house rises, bursts and rains burning droplets.',
    gm: 'Lava: a creature that enters it or starts its turn in it takes 55 (10d10) fire damage. Flame-boats cross safely at a walking pace. Flying is possible, but the heat-haze gives disadvantage on Perception checks that rely on sight beyond 60 ft.',
    label: [58, 53],
  });
  b.props_('lava-river', [[58, 53], [20, 52], [70, 6]]).props_('magma-vent', [[48, 75], [26, 78], [62, 52]]).prop('burning-wreckage', 30, 50).prop('rowboat', 64, 58, 45);
  b.light(58, 53, 20, 30, '#ff7a2e').light(25, 56, 20, 30, '#ff7a2e').light(70, 6, 20, 30, '#ff7a2e').light(10, 25, 20, 30, '#ff7a2e');

  b.note(9, 57, 'Secret: crates hide the mouth of the lava tube (DC 20 Perception, or Nim shows it).');
  b.note(30, 5, 'Sealed hatch into the Crucible. Opening it is death for a servant; Nim will show it but not open it.');
  return b.build();
}

export const EMBER_COURT: Adventure = {
  id: 'ember-court',
  title: 'The Ember Court',
  tagline: 'An efreeti prince stole a kingdom\'s sun. Win it back from a brass palace on a sea of lava.',
  levels: '17',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['planar', 'intrigue', 'fire', 'high level', 'demon'],
  pitch:
    'Three weeks ago, the sun of Vellandry went out. Not behind a cloud: gone. Vellandry is a small kingdom with one small sun of its own, hung over its valley by its first queen, and now the valley is dark and freezing, and the crops are black with frost. The sun\'s keeper vanished with it. A dying witness saw giants made of fire carry it through a burning door. The trail leads to the Elemental Plane of Fire, to a brass palace on a sea of lava, and to the court of a prince who collects beautiful things.',
  secret:
    'Prince Ashkarran the Gilded, an efreeti, bought the sun from fire giant raiders. He wants to be named Sultan over his three elder sisters at the coming Grand Divan, and a Voice in the furnace under his palace has promised to forge the sun into a crown of sun-fire that no sister could take. The Voice is Morroch the Smiling Ash, a balor chained under the palace nine hundred years ago by the prince\'s grandmother. No fire on the plane is hot enough to melt his chains; a living dawn is. At the Hour of Brass, when the Ember Tide peaks in two days, the prince will lower the sun into the crucible. The chains melt, Morroch walks free, the palace becomes a door to the Abyss and Vellandry freezes forever. Nobody at court knows the Voice is a demon. Everybody at court would care.',
  hooks: [
    'Queen Ilsabet of Vellandry gives the heroes the last sunlit thing in her kingdom (a candle lit from the sun) and a spell scroll of plane shift: "Bring it home. Bring Oriel home."',
    'A planar sage has noticed a balor\'s name being whispered in fire across a dozen worlds, and pays 20,000 gp for whoever finds out why.',
    'One of the heroes is owed a favour by Lady Seffra Coalcrown, who sends a burning letter: "Come to court. Bring a reason to ruin my cousin. I will pay in wishes."',
  ],
  tips: [
    'Use an ember clock: 8 embers to the Hour of Brass. A long rest, a big fight or an hour of play burns one. At 2 embers, the prince goes to the Crucible with his court. At 0, the sun is lowered and Morroch is free (he starts the final fight at full power, and the palace starts to sink).',
    'Guest-Flames are the heart of the play. Guests are safe until they break court law: striking without a named duel, stealing, or lying in the Throne Hall. Let the heroes scheme, trade and duel. When they break the law, every guard in the palace stops being polite.',
    'Rumours in the galleries (one per bribe or DC 19 Insight): the prince talks to his furnace at night; the azer forged chains for "the One Below"; Brannoch serves only because his son is a prisoner; the dragon would eat the prince if she could reach him; Seffra wants the throne; the prince\'s grandmother "went down into the fire and came back afraid".',
    'Almost every fight can be turned: free Hask and Brannoch quits, give Kolv his chain and the azer stand down, give Pyrrhax her key and she burns the throne hall for you, show the prince the compact and he hesitates. Reward a deal as well as a win.',
    'Heat: without a Guest-Flame or fire resistance, each hour on the plane is a DC 15 Constitution save or a level of exhaustion. Lava is 55 (10d10) fire damage on entering or starting a turn in it; the shallow beds in the palace deal 33 (6d10).',
    'For 3 heroes, drop the fire elementals from the Crucible fight; for 5, add two salamanders to it and to the Throne Hall.',
  ],
  npcs: [
    {
      id: 'pf_ecashkarran', name: 'Prince Ashkarran the Gilded', title: 'efreeti prince of the Ember Court', kind: 'monster', art: 'efreeti', monsterId: 'efreeti', shared: true,
      wants: 'To be named Sultan over his three elder sisters, and to be admired while it happens.', knows: 'The sun hangs in the Sunken Crucible. The Voice promised him a crown of sun-fire. He does not know the Voice is a balor, and has never asked.',
      voice: 'Grand and lazy. Calls himself "we". Laughs at his own jokes a moment before he finishes them.', appearance: 'Twelve feet tall, skin like red lacquer, a beard of smoke strung with gold rings, a turban of living flame.',
      backstory: 'The youngest of four, always the least. His grandmother, Sultana Ezraah, ruled this palace and forbade anyone to open the furnace hatch. She died when he was a child. He opened it the year after.',
      gmNotes: 'Efreeti stat block. Bound by his own court law: he must accept a named duel and keeps a bargain sealed on flame to the letter. If he is shown proof of what Morroch is and persuaded (DC 22), he refuses to lower the sun; then Morroch tears free early and the prince fights the balor beside the heroes.',
    },
    {
      id: 'pf_ecseffra', name: 'Lady Seffra Coalcrown', title: 'the prince\'s cousin and rival', kind: 'monster', art: 'efreeti', monsterId: 'efreeti', shared: true,
      wants: 'Ashkarran shamed before the Grand Divan and his palace for herself.', knows: 'The prince talks to his furnace at night. The sun is somewhere below the throne. Brannoch\'s son is a hostage. Every secret door in the galleries.',
      voice: 'Soft and amused, never in a hurry. Pays compliments that are half insults.', appearance: 'Tall and slim, skin of dull coal with cracks of orange light, a crown of seven floating sparks.',
      gmNotes: 'Efreeti stat block. Offers the heroes a bargain: bring her proof that the prince consorts with a fiend, or beat his champion in the Ring, and she will grant one wish (as the efreeti\'s Wish, for a non-combat purpose) and protect them at court. When she learns the truth she is horrified: efreet hate demons more than they hate each other. She will fight Morroch beside the heroes if they ask.',
    },
    {
      id: 'pf_ecbrannoch', name: 'Brannoch Slagborn', title: 'the prince\'s champion', kind: 'monster', art: 'fireGiant', monsterId: 'fireGiant',
      wants: 'His son Hask freed from the furnace prisons, and an honest fight.', knows: 'The layout of the palace, the prison keys\' keeper and that the prince goes alone to the Throne Hall\'s west wall every night.',
      voice: 'Slow and deep, every word set down like an anvil. Says "honour" without any irony at all.', appearance: 'A fire giant in black iron, his beard a curtain of flame, with a greatsword notched in a hundred duels.',
      gmNotes: 'Fire giant stat block. In a duel he fights fairly and accepts a yield. If Hask is freed and brought to him, he lays his sword down, and may stand at the Crucible doors with the heroes.',
    },
    {
      id: 'pf_ecoriel', name: 'Sunwarden Oriel Vane', title: 'keeper of Vellandry\'s sun', kind: 'npc', art: 'priest', monsterId: 'priest', shared: true,
      wants: 'The Little Sun home before it dies of grief, and the captives of Vellandry home with it.', knows: 'The sun is in the Crucible. The prince talks to "something with too many teeth" in the fire. Only a Sunwarden, or the Hearth-Cage in the treasury, can carry the sun without burning to ash.',
      voice: 'Calm, tired and kind. Calls the sun "she" and the heroes "dear".', appearance: 'A thin woman of sixty in scorched white robes, her hair burned short, her eyes still bright.',
      gmNotes: 'Priest stat block. If she reaches the sun, she can take it from its cage barehanded and carry it; anyone else touching it takes 70 (20d6) radiant damage. She smuggled a note out with the servants (handout).',
    },
    {
      id: 'pf_ecnim', name: 'Nim Tallow', title: 'palace servant, slave-born', kind: 'npc', art: 'commoner',
      wants: 'To see a sky that is not on fire, just once.', knows: 'The servants\' furnace route, the lava tube to the docks, which guards sleep on duty and where Oriel\'s cell is.',
      voice: 'Quick, quiet, never finishes a sentence when a nod will do.', appearance: 'A wiry young human with soot-black hands, a brass slave collar and very old eyes.',
      backstory: 'Born in the Great Furnace to a mother taken from Vellandry long ago. Nim has never been anywhere else.',
      gmNotes: 'Bought or freed at the auction block, Nim becomes the heroes\' guide: shows the lava tube and the servants\' route, and asks only to come with them when they leave.',
    },
    {
      id: 'pf_eckolv', name: 'Hammerfather Kolv', title: 'high priest of the forge-temple', kind: 'monster', art: 'azer', monsterId: 'azer',
      wants: 'Freedom for the azer of Anvil Isle, and the old binding below the palace kept whole.', knows: 'His forebears forged the chains that hold "the One Below". A Chain of Binding can weaken a fiend of fire. The hymn of the chains (handout).',
      voice: 'Speaks in rhythm, like a hammer on a beat, and sings when he is sure of something.', appearance: 'An old azer with a beard of white flame and arms scarred with brass, wearing an apron of chain.',
      gmNotes: 'Azer stat block. Forges a Chain of Binding in an hour for 1,000 gp of brass or a scale from Pyrrhax. If the heroes tell him what the Voice is, he forges it for nothing and sends ten azer to hold the Crucible\'s doors.',
    },
    {
      id: 'pf_ecpyrrhax', name: 'Pyrrhax the Collared', title: 'the court beast', kind: 'monster', art: 'dragon-red-adult', monsterId: 'adultRedDragon',
      wants: 'Her collar off, the prince dead and her hoard in a mountain of her own.', knows: 'The prince keeps her collar key in his treasury. She can smell the demon under the palace and has said nothing, because nobody asked her nicely.',
      voice: 'Silky and slow, with long pauses where she imagines eating you.', appearance: 'A red dragon the size of a ship, scales cracked with glowing seams, a brass collar welded round her neck.',
      gmNotes: 'Adult red dragon stat block, with her grown son (young red dragon). Given the key, she keeps a sworn bargain: she will burn the throne hall at a signal, or fly away with her son. Cheat her and she remembers forever.',
    },
    {
      id: 'pf_ecszass', name: 'Harbourmaster Szass', title: 'keeper of the Cinder Docks', kind: 'monster', art: 'salamander', monsterId: 'salamander', shared: true,
      wants: 'Money, and more money, and to be left alone by the palace.', knows: 'Every boat that comes and goes, including the one that brought "a very bright cage" three weeks ago. The lava tube exists (he thinks it is a smugglers\' myth).',
      voice: 'Hissing, friendly, counts out loud while he talks. Calls everyone "cargo".', appearance: 'A long salamander with brass rings down his spine and an abacus of red-hot beads.',
      gmNotes: 'Salamander stat block. Sells Guest-Flames, gossip and boats. He leads the dock wardens if the heroes refuse to pay, and surrenders the moment he is hurt.',
    },
    {
      id: 'pf_ecmorroch', name: 'Morroch the Smiling Ash', title: 'the Voice in the Furnace', kind: 'monster', art: 'balor', monsterId: 'balor',
      wants: 'Free of his chains, then the palace, then the plane.', knows: 'Everything the prince ever told him, and the true name of the prince\'s grandmother, which he likes to say.',
      voice: 'Warm and fatherly, like a friendly uncle. The smile can be heard.', appearance: 'A demon of black smoke and burning bone, forty feet of wings folded in a pit, chained in green bronze, always smiling.',
      gmNotes: 'Balor stat block. The twist. Before the Hour of Brass he can only talk, through any fire in the palace; he tries to win the heroes too ("Bring me the sun and I will send yours home"). When the heroes threaten the sun, he tears partly free and fights. If defeated before he is fully free, his chains drag him back down for another thousand years.',
    },
  ],
  handouts: [
    { id: 'guest-flame', title: 'The Guest-Flame', text: 'Who carries this flame is a guest of the Ember Court, under the shelter of Prince Ashkarran the Gilded.\nNo courtier, guard or beast may strike a guest without first naming a duel before witnesses.\nA guest who strikes first, who steals, or who lies in the Throne Hall is a guest no longer.\nThe flame burns out at the Hour of Brass.' },
    { id: 'feast-summons', title: 'Summons to the Feast of Embers', text: 'His Radiance Prince Ashkarran the Gilded is pleased to permit your presence at the Feast of Embers, in the Gardens of Fire, at the turning of the tide.\nBring a gift. Bring a story. Do not bring water.' },
    { id: 'oriel-note', title: 'A note scratched on brass', text: 'To anyone from home.\nShe is alive. They keep her below the throne, in the pit he calls the crucible. He talks to the fire there and the fire talks back. It is not his voice.\nBring the white cage from his vault. Do not touch her with bare hands.\nI am in the furnace cells. Hurry. - O.' },
    { id: 'chain-hymn', title: 'The Hymn of the Chains', text: 'Strike once for the bronze, and once for the green,\nStrike once for the fire that must not be seen.\nWe hammered the links and we sang as we wrought:\nWhat smiles in the furnace must never be bought.' },
    { id: 'compact', title: 'The Compact of the Crucible', text: 'I, Ashkarran, son of the Ember Court, will set a living dawn into the crucible at the Hour of Brass.\nThe One Below will forge from it a crown of sun-fire and set it on my head, and ask no other price.\nSealed in flame.\n\n(Under the seal, in a different, spidery hand, in Abyssal:) No other price. Only the chains.' },
  ],
  chapters: [
    {
      id: 'court', title: 'The Ember Court', level: 17,
      summary: 'A brass palace on a sea of lava, ringed by islands: the docks where the heroes land, a slave market, the azer forge-temple, a chained dragon\'s crag and a rival\'s pleasure isle. Inside the palace: galleries of intrigue, a garden of fire, a duelling ring, the treasury, the furnace prisons, the throne hall and, hidden below, the crucible where a balor waits.',
      goal: 'Find the stolen sun of Vellandry and carry it home before the Hour of Brass, and stop whatever is really waiting in the Crucible.',
      map: emberCourt,
      npcs: [
        { npc: 'pf_ecszass', x: 6, y: 63 },
        { npc: 'pf_ecnim', x: 37, y: 63 },
        { npc: 'pf_ecseffra', x: 8, y: 11 },
        { npc: 'pf_ecbrannoch', x: 56, y: 24, hidden: true },
        { npc: 'pf_ecashkarran', x: 42, y: 9, hidden: true },
        { npc: 'pf_ecoriel', x: 30, y: 39, hidden: true },
        { npc: 'pf_eckolv', x: 62, y: 63 },
        { npc: 'pf_ecpyrrhax', x: 72, y: 26, hidden: true },
        { npc: 'pf_ecmorroch', x: 22, y: 15, hidden: true },
      ],
      scenes: [
        {
          room: 'Cinder Docks', title: 'Guests or salvage', encounter: 'Dock wardens', handout: 'guest-flame',
          read: 'The heat hits you like a door slammed in your face. A salamander slides down the jetty towards you, rings clinking, and looks you over the way a merchant looks at a cart. "Cargo," it says happily. "Paying cargo, or salvage cargo?"',
          gm: 'Szass offers Guest-Flames (500 gp each, or a DC 20 Persuasion with a good story). Without them, the heroes have no protection from the heat and no standing at court, and Szass calls his wardens to take them as salvage. He surrenders when hurt and sells them the flames at double price. Start the ember clock at 8.',
        },
        {
          room: 'Auction block', title: 'Lot seven', encounter: 'The auction block',
          read: 'The auctioneer, a fire giant in a waistcoat of chain, slaps the young human on the block between the shoulders. "Lot seven! Knows every crack in the palace! Do I hear four hundred?"',
          gm: 'Nim Tallow is for sale. Buy Nim (500 gp, or outbid with a DC 21 Persuasion or Deception), and Nim becomes the heroes\' guide to the lava tube and the servants\' route. Freeing the captives in the pens can be bought (150 gp each) or won by wager. A fight here breaks the market peace.',
          treasure: 'From the auction: 3,000 gp in brass and fire opals in the auctioneer\'s strongbox, and lot nine, a necklace of fireballs (9 beads).',
        },
        {
          room: "Smugglers' grotto", title: 'Through the lava tube', optional: true, encounter: 'Lava-tube crawlers',
          read: 'The tube twists up through the black glass like the inside of a shell. Ahead, lava crosses the floor in a bright stream, and on the far side, something long and red uncoils.',
          gm: 'The quiet way into the palace, straight to the furnace prisons. Nim knows it; without Nim, the crates hiding its mouth need a DC 20 Perception. Salamanders hunt here. Jump the lava stream (DC 15) or wade it (33 fire damage).',
          treasure: 'The smuggler\'s cache: 1,500 gp, two potions of supreme healing and a spell scroll of plane shift.',
        },
        {
          room: 'Brass Quay', title: 'Presented at court', handout: 'feast-summons',
          read: 'An efreeti herald in a coat of hammered gold looks down at you from twice your height. "Names," it says. "Titles. Gifts. Quickly. The tide turns and the prince is hungry for amusement."',
          gm: 'A gift worth 1,000 gp, a fine story or a show (DC 20 Performance) earns seats at tonight\'s Feast of Embers. No gift: the heroes are let in as entertainment, which means someone will challenge them to a duel before dessert. Forcing the Gate of Brass is the loud way in (encounter Gate of Brass).',
        },
        {
          room: "Courtiers' galleries", title: 'A hundred mirrors', encounter: 'Knives in the galleries',
          read: 'Every mirror on the wall holds a courtier, and every courtier is pretending not to watch you. A voice at your shoulder says, softly, "You came about the sun. How sweet. Shall we talk somewhere without mirrors?"',
          gm: 'Lady Seffra invites the heroes to her pavilion across the private bridge. Her bargain: proof the prince deals with a fiend, or a win in the Ring against his champion, for a wish and her protection. Rumours can be bought here (see tips). If the heroes ask too openly, the prince sends his knives tonight.',
          treasure: 'On the assassins: 800 gp, a ring of resistance (fire) and a poisoner\'s kit.',
        },
        {
          room: 'Gardens of Fire', title: 'The Feast of Embers', encounter: 'Garden of living flame',
          read: 'Music like crackling wood. Courtiers recline along paths of warm stone, eating fruit that burns. Fire spirits dance in the lava beds for the prince\'s pleasure, and the prince raises a goblet of molten gold to you. "Our mortal guests! Tell us a story. If it bores us, you may be the next course."',
          gm: 'The social centrepiece. The prince is vain, curious and bored: he will trade, gamble and boast. A DC 20 Insight sees him glance at the throne hall\'s west wall when anyone mentions the sun. Brannoch stands behind him. A champion challenges one hero to a duel before the night ends. The dancers turn on the heroes only if court law is broken or a hero frees them (then they may fight the guards instead).',
        },
        {
          room: 'Ring of Cinders', title: 'Yielding or ash', encounter: 'Duel in the Ring',
          read: 'The benches fill with courtiers. Brannoch steps onto the black sand, lifts his sword in salute and says, gravely, "To yielding, or to ash. Your choice, little one."',
          gm: 'A named duel: one hero against Brannoch. Others may not interfere unless the prince\'s side cheats, in which case his second steps in. If the heroes have freed Hask, Brannoch kneels instead and yields at once. A win satisfies Seffra\'s bargain and earns the court\'s respect (advantage on Charisma checks with courtiers).',
          treasure: 'Brannoch\'s wager, paid honourably: a belt of fire giant strength.',
        },
        {
          room: 'Furnace prisons', title: 'The singing prisoner', encounter: 'Furnace jailers', handout: 'oriel-note',
          read: 'Heat rolls up from a grille in the floor. Behind the bars, a woman in scorched white is singing a dawn hymn, and every prisoner in the cells is mouthing the words with her.',
          gm: 'Free Oriel and she can carry the sun barehanded. Free Hask (Brannoch\'s son) and Brannoch stands down for good. The jailers are tough; a DC 22 Deception (forged orders) or Nim\'s help can get the heroes past them. Oriel tells the whole truth about the Voice: it is proof Seffra and the prince will believe.',
          treasure: 'The confiscated gear chest: a +3 shield, Oriel\'s sun-mace (a +2 mace that sheds bright light) and 600 gp.',
        },
        {
          room: 'Forge-temple of the Bound Flame', title: 'The hymn of the chains', optional: true, encounter: 'Keepers of the forge', handout: 'chain-hymn',
          read: 'The hammering stops all at once. Fifty burning faces turn to you. An old azer with a beard of white fire lays down his hammer and says, "Strangers. You smell of the palace. Why?"',
          gm: 'Hammerfather Kolv knows what lies in the Crucible. Tell him, and he forges a Chain of Binding (see the Smiling Ash) and sends azer to help. Bargain with brass or a dragon scale otherwise. Only an insult to the Bound Flame starts a fight.',
          treasure: 'A gift from Kolv to friends: a set of adamantine armour sized to one hero.',
        },
        {
          room: 'The Red Roost', title: 'The collared dragon', optional: true, encounter: 'Pyrrhax in her roost',
          read: 'One golden eye opens, then the other. The chain at the dragon\'s throat clinks as she lifts her head. "Food that talks," she purrs. "How novel. Talk, then. Quickly."',
          gm: 'Pyrrhax wants the collar key from the treasury. Promise it (DC 22 Persuasion, or a sworn bargain) and she gives a scale for Kolv\'s chain and tells the heroes she can smell a demon under the palace. Bring her the key and she burns the Throne Hall at a signal: the prince\'s court fight loses its salamanders and fire giant in the first round.',
          treasure: 'Her hoard, if she is slain or gives a third as thanks: 12,000 gp, 5,000 gp of gems, a carpet of flying and a staff of fire.',
        },
        {
          room: 'Treasury', title: 'The prince\'s vault', encounter: 'The brass warden', handout: 'compact',
          read: 'Gold gleams in every direction. On a pedestal sits a cage of white glass, cold to the touch, the only cold thing on this plane. And on a shelf, sealed in flame, lies a scroll with the prince\'s mark.',
          gm: 'The Hearth-Cage carries the sun safely; the collar key frees Pyrrhax; the Compact is the proof that turns Seffra and shakes the prince. The brass warden attacks anyone without the prince\'s signet. Through the servants\' secret panel, a DC 20 Stealth check avoids it entirely. Taking anything is theft: guest status ends if the theft is discovered.',
          treasure: '20,000 gp in coins and gems, an efreeti bottle, a helm of brilliance, the Hearth-Cage and the collar key.',
        },
        {
          room: 'Throne Hall', title: 'The prince\'s answer', encounter: "The prince's court",
          read: 'The prince lounges on his golden throne and spreads his hands. "You have been busy. Stealing, scheming, freeing our property. Do you have a good reason, or shall we simply have you melted?"',
          gm: 'The confrontation. Proof of the Voice plus a DC 22 Persuasion turns the prince (no fight; he leads the heroes to the Crucible). Seffra\'s support, Brannoch\'s refusal or Pyrrhax\'s fire each change the fight. Otherwise, the court fights to the death of the prince or to his yield at a quarter hit points.',
          treasure: 'The prince\'s signet, a scimitar of speed and the gold throne\'s jewels (6,000 gp).',
        },
        {
          room: 'The Sunken Crucible', title: 'The Smiling Ash', encounter: 'The Smiling Ash',
          read: 'The lava in the crucible bulges and parts. A head like a burning skull rises out of it, wings of black smoke unfold, and green bronze chains snap one by one. "Ah," says a warm and friendly voice. "Guests."',
          gm: 'Morroch tears half free. He cannot leave the Crucible while any chain holds (three chains, AC 19, 60 hit points each, immune to fire); each chain broken by his struggles (one per round on a d6 roll of 5-6) gives him more reach. A Chain of Binding removes his Fire Aura and flight. Allies the heroes won (Seffra, the prince, Brannoch, Kolv\'s azer) join the fight. Someone must take the sun: Oriel barehanded, or the Hearth-Cage, or 70 (20d6) radiant damage.',
          treasure: 'The Little Sun of Vellandry. A sliver of sunlight left in the brass cage forms a sun blade in the hand of whoever freed it.',
        },
      ],
      wrapUp: 'With the sun in safe hands, the heroes need a way home: the plane shift scroll, Seffra\'s wish, a rift opened by Oriel and the sun together, or a flame-boat to the plane\'s edge. If Morroch fell, his chains drag him back down; if the prince turned, he swears never to open the hatch again, and the Ember Court owes the heroes a debt.',
    },
  ],
  ending:
    'Win: the Little Sun rises over Vellandry again, the frost melts in an hour, and Queen Ilsabet names the heroes Friends of the Dawn. Oriel, Nim and the captives come home. At the Ember Court, Seffra takes the palace (or the humbled prince keeps it, in her debt), the azer are freed and Pyrrhax flies off to find a mountain. Lose: Morroch walks free at the Hour of Brass, the brass palace sinks into the lava, and a door to the Abyss opens on the Plane of Fire; Vellandry freezes, and its people flee down the valley. Next: the prince\'s three elder sisters want to know who meddled with their brother at the Grand Divan, and Morroch, banished or bound, has spoken the heroes\' names to the fire. Every flame they pass now listens.',
};

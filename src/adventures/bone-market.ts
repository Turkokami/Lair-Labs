// The Bone Market: a night-long heist and haggling adventure for four heroes of level 7.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder } from './builder';
import type { Adventure } from './types';

/** Put a prop on the nearest floor square to (x, y), so dressing never lands in rock. */
function pp(b: MapBuilder, kind: string, x: number, y: number, rot = 0, o: { gm?: boolean } = {}) {
  for (let r = 0; r <= 3; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (b.isFloor(x + dx, y + dy)) { b.prop(kind, x + dx, y + dy, rot, o); return; }
      }
}
/** A light on the nearest floor square. */
function lt(b: MapBuilder, x: number, y: number, bright: number, dim: number, color?: string) {
  for (let r = 0; r <= 3; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (b.isFloor(x + dx, y + dy)) { b.light(x + dx, y + dy, bright, dim, color); return; }
      }
}

function boneMarket() {
  const b = new MapBuilder('adv-bone-market', 'The Bone Market under Kettlemouth', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dark', floor: 'dungeon-slab' });
  const CANDLE = '#ffcf7a', GHOST = '#a8d8ff', GREEN = '#8fe39a', RED = '#ff7a5c';

  // ================= NORTH-WEST: the way in =================
  b.room('The Widow-Bell Crypt', 2, 2, 14, 9, {
    mat: 'marble',
    read: 'A rich family\'s crypt under the Saltgate graveyard. A stone widow kneels in the middle with a bronze bell in her hands. Behind her, an iron door carved with a grinning skull, and its jaw is moving.',
    gm: 'The front door of the Bone Market. The skull door asks "Who trades at night?" The answer is "Those with nothing left by day" (Dorrin remembers it; DC 16 Persuasion or Deception on a market regular in the city above; or DC 20 Thieves\' Tools, but a forced door rings the widow\'s bell and Old Gizzard knows). A loose sarcophagus lid hides nothing, but the east wall has a smugglers\' door behind a burial niche (DC 15 Perception: fresh scratches on the floor).',
  });
  b.start(3, 3, 3, 3);
  b.prop('stairs-up', 3, 2).prop('statue-tall-robed', 9, 5).prop('temple-bell', 9, 6).props_('sarcophagus-effigy', [[5, 8], [13, 8]]).prop('sarcophagus-open', 13, 3);
  b.props_('candles', [[7, 4], [11, 4]]).prop('urn', 2, 9).prop('cobweb-corner', 15, 2).prop('tomb-niche', 15, 5, 90).prop('coffin', 6, 9).prop('wall-candelabra', 12, 2);
  b.light(9, 4, 10, 20, CANDLE);
  b.hall(8, 11, 8, 13, 2).door(8, 10, 's', 'locked', 'door-iron').door(9, 10, 's', 'locked', 'door-iron');
  b.prop('stairs-down', 8, 12).door(15, 5, 'e', 'secret');

  b.room('The Gate of Teeth', 4, 14, 16, 8, {
    read: 'Steps come down into a toll hall. Every inch of the walls is set with teeth: human, animal, things that were neither. Behind a counter of stacked jawbones sits a tiny old woman with a jar of teeth on her lap, rattling it like a purse.',
    gm: 'Old Gizzard, the doorkeeper (green hag), takes the toll: one tooth, one true secret, or 10 gp a head. Teeth are best: a hero who pays with a tooth gets a bone token that lets them walk past any Tallyman once without being searched. She sells a map of the aisles for a memory of a good meal (the hero forgets their favourite dish). The three laws are carved over the inner arch (handout). She fights only if attacked or cheated; then her ghoul porters come out of the wall-niches.',
  });
  b.prop('shop-counter', 10, 16).prop('skull-pile', 5, 15).prop('skull-pile', 18, 15).prop('scales', 12, 16).prop('stool', 10, 15).prop('tomb-niche', 4, 18, 90).prop('tomb-niche', 19, 18, 270);
  b.prop('notice-board', 15, 14).prop('candelabra', 7, 16).prop('bone-heap', 17, 20).prop('archway-grand', 9, 21).prop('lantern-standing', 14, 19);
  b.light(10, 17, 15, 20, CANDLE).light(15, 19, 10, 15, GREEN);
  b.encounter("Gizzard's toll", [4, 14, 16, 8], [['greenHag', 1], ['ghast', 2], ['ghoul', 4]], 'low');

  // ================= the smugglers' run (north) =================
  b.tunnel([[16, 5], [23, 3], [30, 4], [34, 8], [37, 11]], 2, { mat: 'cave-floor', seed: 701 });
  b.tunnel([[28, 5], [28, 14]], 1, { mat: 'cave-floor', seed: 702 });
  b.area("The Smugglers' Run", [[16, 2, 20, 8]], {
    read: 'A crawlway gnawed through old graves. Bones poke out of the walls like roots. Somewhere ahead, something is eating, and it chews with its mouth open.',
    gm: 'The ghoul-runners carry goods past the Tallymen for a fee, and this is their road. The Tallymen never come here, so a hero can leave the market this way with unpaid goods and break no law that anyone sees. The runners want a toll of fresh meat or 50 gp; DC 15 Persuasion or Intimidation, or showing Gizzard\'s bone token, lets the heroes pass. A side crawl (1 square wide) runs south to a secret panel into the Last Breath Chapel. The main run comes out on the high benches of the Gutter Pit.',
    label: [26, 4],
  });
  pp(b, 'bones', 20, 4); pp(b, 'skull-pile', 31, 4); pp(b, 'sack', 25, 3); pp(b, 'bone-heap', 34, 8); pp(b, 'lantern-hook', 23, 3); pp(b, 'crate', 33, 7);
  b.door(28, 14, 's', 'secret');
  b.encounter('Ghoul-runners', [16, 2, 20, 9], [['ghast', 2], ['ghoul', 6]], 'low');

  // ================= the ossuary aisles (west) =================
  b.tunnel([[14, 21], [17, 25], [25, 27], [31, 29], [38, 33]], 4, { mat: 'stone-cobble', seed: 703 });
  b.area('Skull Row', [[15, 23, 20, 7]], {
    read: 'An aisle of stalls under walls stacked with skulls, every one with a candle in its crown. Hawkers call out: "Curses, fresh curses!" "Nightmares, slightly used!" "Your own name, back again, half price!" Something with too many arms is buying shoes.',
    gm: 'The main aisle. Wares here (a sample): a curse in a corked jar (bestow curse, one use, 300 gp or a year of the buyer\'s life); a nightmare in a snuffbox (the target of a sleep spell dreams it); potions of greater healing (150 gp, or a happy memory); a mimic pretending to be a chest of "mimic eggs" (it is one mimic, and it bites anyone who opens it). Haggling: each DC 15 Persuasion knocks the price down by a quarter; a lie to a Broker breaks the second law. The Tallymen walk this aisle in pairs.',
    label: [24, 27],
  });
  for (const [x, y] of [[17, 23], [21, 25], [27, 26], [30, 31], [34, 30]] as [number, number][]) pp(b, 'market-stall', x, y);
  pp(b, 'ossuary-shelf', 19, 28); pp(b, 'ossuary-shelf', 26, 30); pp(b, 'skull-pile', 33, 33); pp(b, 'mimic-chest', 23, 28); pp(b, 'shelf-jars', 29, 28); pp(b, 'crate-stack', 36, 32);
  b.rubble(24, 26, 2, 1);
  lt(b, 20, 25, 10, 15, CANDLE); lt(b, 29, 29, 10, 15, CANDLE); lt(b, 35, 32, 10, 15, CANDLE);
  b.encounter('The Tallymen', [14, 22, 24, 10], [['boneMarketTallyman', 2]], 'moderate');

  b.tunnel([[6, 21], [5, 29], [8, 36], [17, 42], [27, 43], [37, 41]], 3, { mat: 'stone-cobble', seed: 704 });
  b.area('Jar Alley', [[4, 24, 5, 12], [9, 39, 26, 5]], {
    read: 'A crooked alley of shelves, floor to ceiling with jars. In each jar something moves: a flicker of colour, a snatch of song, a shadow pressing its hands to the glass. A sign reads WE BUY ANYTHING. WE MEAN ANYTHING.',
    gm: 'Where Dorrin made his sale, at the stall of a moth-eaten jar-wife who calls herself only "the Glass". She buys for the Brokers. Her book (DC 14 Persuasion, a bribe of 25 gp, or a hero\'s fond memory) shows Lot 77 went straight to Broker Odalys Thurne "for the private shelf". She lowers her voice: Thurne buys every soul-piece in the market lately, and pays "in old gold, the cold kind". Breaking a jar frees whatever is inside but counts as leaving with unpaid goods when the hero walks off: the Glass screams for the Tallymen.',
    label: [14, 41],
  });
  for (const [x, y] of [[5, 25], [6, 32], [11, 38], [20, 42], [30, 42]] as [number, number][]) pp(b, 'shelf-jars', x, y);
  pp(b, 'market-stall', 9, 37); pp(b, 'potion-shelf', 24, 43); pp(b, 'apothecary-counter', 15, 41); pp(b, 'cage-hanging', 34, 41); pp(b, 'lantern-cluster', 6, 28);
  lt(b, 6, 27, 10, 15, GREEN); lt(b, 15, 40, 10, 15, GREEN); lt(b, 28, 43, 10, 15, CANDLE);

  b.cave('The Hatchery', 21, 34, 6, 4, {
    seed: 705, mat: 'dirt',
    read: 'Warm, damp and smelling of straw. Eggs of every size sit in nests of rags: speckled, scaled, one as big as a barrel and ticking softly. A hand-painted sign says DO NOT TAP THE GLASS. There is no glass.',
    gm: 'Monster eggs and young stock. The egg-dealer sells a griffon egg (900 gp), a wyvern egg (1,200 gp) and a basket of cockatrice chicks (cheap, dangerous). If a fight or spell goes off in here, or a hero taps the big egg, the pens break: two young basilisks and a brood of cockatrices get loose. Calming them (DC 16 Animal Handling, or food thrown the other way) ends it without blood. The Tallymen do not come for a stampede, only for blades.',
  });
  b.tunnel([[21, 28], [21, 31]], 2, { mat: 'dirt', seed: 706 }).tunnel([[19, 37], [15, 40]], 2, { mat: 'dirt', seed: 707 });
  pp(b, 'hay-bale', 17, 33); pp(b, 'cage', 25, 33); pp(b, 'cage', 24, 36); pp(b, 'straw-bed', 19, 35); pp(b, 'chicken-coop', 22, 32); pp(b, 'boulder', 21, 35); pp(b, 'water-trough', 18, 36);
  lt(b, 21, 34, 8, 12, '#ffb35c');
  b.encounter('Loose stock', [15, 30, 13, 9], [['basilisk', 2], ['cockatrice', 4]], 'low');

  b.room('The Last Breath Chapel', 23, 15, 9, 6, {
    mat: 'marble',
    read: 'A small chapel hung with black silk. On a velvet cushion sits a stoppered crystal flask, and inside it a breath of grey mist turns over and over, as if trying to finish a word.',
    gm: 'A dead king\'s last breath, up for sale before it goes to auction: 1,500 gp, or a "piece of equal weight" (a voice, a shadow, a name). Its seller, a polite ghast in a velvet coat, swears the king was about to name his true heir. Breathing it in grants the effect of a potion of heroism and lets the breather speak one sentence in the dead king\'s voice. It is the one thing in the market Broker Thurne wants for her patron and cannot afford: a perfect bargaining chip. The secret panel in the north wall leads to the Smugglers\' Run.',
  });
  b.hall(27, 21, 27, 27, 1).door(27, 20, 's', 'closed');
  b.prop('altar', 27, 16).prop('ring-cushion', 27, 17).prop('pew', 25, 19).prop('pew', 29, 19).prop('banner-hanging-tall', 23, 15).prop('banner-hanging-tall', 31, 15).prop('candle-stand-tall', 24, 17).prop('candle-stand-tall', 30, 17);
  b.light(27, 17, 10, 15, '#d0c0ff');

  // ================= the Gutter Pit (north) =================
  b.cave('The Gutter Pit', 46, 11, 10, 7, {
    seed: 708, mat: 'dirt',
    read: 'Roaring. A crowd packs benches cut into a round cave, stamping and throwing bones. Down in a ring of bloody sand, a woman with arms like ship\'s cables is holding a troll\'s head under one arm, and waving to the crowd with the other.',
    gm: 'The one place in the market where blades may be drawn. Brisa Scald runs the pit and hears everything said on the benches. She will tell the heroes where Thurne\'s strongroom is and that "crates go down the Long Ossuary before dawn, every night this month" if a hero wins a bout (fight her champions, or Brisa herself one-on-one to first blood). Betting: odds are 2 to 1 against strangers. Losers are tipped into the Drop, a chute that spits them into the Charnel Canal (20 ft, no damage, very wet). The Rat Run leaves from the east side to the Counting House back door (locked, DC 17 Thieves\' Tools; Brisa has a key, and sells it for 200 gp).',
  });
  for (let y = 6; y <= 16; y++) for (let x = 40; x <= 52; x++) { const dx = (x + 0.5 - 46.5) / 4.6, dy = (y + 0.5 - 11.5) / 3.6; if (dx * dx + dy * dy <= 1) b.paint(x, y, 1, 1, 'sand'); }
  b.pit(53, 14, 2, 2).note(54, 15, 'The Drop: a hole in the pit floor and a slimy chute down to the Charnel Canal (it comes out under the north bank, toward the east end). A loser tipped in lands in the water 20 ft below, unhurt.');
  pp(b, 'blood-pool', 46, 11); pp(b, 'weapon-rack', 42, 9); pp(b, 'cage', 51, 7); pp(b, 'cage', 52, 9); pp(b, 'chains-hanging', 48, 13);
  for (const [x, y] of [[39, 7], [53, 6], [38, 14], [55, 11], [41, 17], [50, 17]] as [number, number][]) pp(b, 'bench-long', x, y);
  pp(b, 'banner-pole', 44, 5); pp(b, 'stairs-down', 44, 7); pp(b, 'table-cards', 37, 11); pp(b, 'barrel-stack', 55, 8); pp(b, 'skull-pile', 54, 15);
  lt(b, 41, 8, 15, 20, '#ff9a3c'); lt(b, 51, 15, 15, 20, '#ff9a3c'); lt(b, 46, 11, 10, 15, '#ff9a3c');
  b.encounter('Pit champions', [36, 4, 21, 15], [['gladiator', 1], ['veteran', 2]], 'low');

  b.tunnel([[55, 12], [58, 13]], 2, { mat: 'cave-floor', seed: 709 });
  b.area('The Rat Run', [[56, 12, 4, 3]], { read: 'A low, greasy tunnel. Somebody has chalked a little rat and an arrow on the wall.', gm: 'Ends at the Counting House back door (locked iron, DC 17 Thieves\' Tools or Brisa\'s key). The clerks inside only look up if the door squeals: DC 13 Stealth.', label: [57, 13] });
  b.door(59, 13, 'e', 'locked', 'door-iron');
  pp(b, 'rope-coil', 56, 13);

  b.hall(44, 18, 44, 27, 2);
  b.area("The Gamblers' Stair", [[44, 18, 2, 9]], { read: 'Worn steps climb from the auction hall up toward the roar of the pit. Losing tickets carpet the stairs.', gm: 'A Tallyman stands at the bottom of the stair. Anyone coming down from the pit with a drawn blade must sheathe it at the bottom or break the first law.', label: [44, 22] });
  b.prop('stairs-up', 44, 21).prop('stairs-up', 45, 21).prop('lantern-wall', 45, 25);
  b.door(44, 26, 's', 'open', 'door-double').door(45, 26, 's', 'open', 'door-double');

  // ================= the Chandelier Hall (centre) =================
  b.room('The Chandelier Hall', 36, 28, 18, 17, {
    mat: 'marble',
    read: 'A domed hall of bone. Ribs of a thousand dead arch overhead to hold up a chandelier of hands and skulls, with eight fat candles burning in its crown. Rows of buyers sit in silence. On a dais, a man in a coat of grey feathers lifts a gavel made from a thigh bone. "Lot thirty-one. A drowned sailor\'s last wish. Who will start me?"',
    gm: 'The heart of the market, and where its master, Barnabus Caddow, runs the auction. The chandelier\'s eight candles are the Tallow Clock: one goes out every hour, and when the last dies the dawn bell rings and the market closes. The catalogue (handout) lists Lot 77 crossed out: "withdrawn, private sale to Broker Thurne". Barnabus hates cheats more than thieves: shown proof that Thurne pays in grave-gold, he rules her purchases unpaid and hands the heroes what they need (see the scene). Bidding: use the catalogue prices; a hero can bid anything the auctioneer agrees has value.',
  });
  for (let i = 0; i < 3; i++) { b.rock(36, 28 + i, 3 - i, 1).rock(51 + i, 28 + i, 3 - i, 1).rock(36, 44 - i, 3 - i, 1).rock(51 + i, 44 - i, 3 - i, 1); }
  b.prop('chandelier-great', 44, 36).prop('lectern-dais', 44, 30).prop('throne', 47, 30).prop('plinth-display', 41, 31).prop('plinth-display', 48, 32);
  b.props_('bench-long', [[40, 38], [44, 38], [48, 38], [40, 40], [44, 40], [48, 40]]).props_('display-case', [[38, 34], [51, 34]]).props_('candle-stand-tall', [[39, 30], [50, 30], [39, 42], [50, 42]]);
  b.prop('banner-hanging-tall', 42, 28).prop('banner-hanging-tall', 46, 28).prop('column-twisted', 37, 36).prop('column-twisted', 52, 38).prop('rug-runner', 44, 34);
  b.light(44, 36, 25, 30, CANDLE).light(44, 30, 10, 15, CANDLE);
  b.door(44, 44, 's', 'closed', 'door-double').door(45, 44, 's', 'closed', 'door-double');
  b.door(53, 36, 'e', 'closed').door(53, 37, 'e', 'closed');

  // ================= the Brokers' side (east) =================
  b.hall(54, 36, 62, 36, 2).hall(63, 18, 63, 41, 2);
  b.area("The Brokers' Gallery", [[54, 36, 10, 2], [63, 18, 2, 24]], {
    read: 'A quiet carpeted hall. Statues of robed Brokers line the walls, each with a real set of teeth set into its stone smile. The noise of the market falls away behind you like a door closing.',
    gm: 'Brokers and their clients only: a Tallyman asks "Whose guest?" at the hall door. The truth works ("We are here to see Broker Thurne"); so does a Broker\'s invitation. A lie here is a lie in the hearing of the statues, and the statues are Brokers\' ears: it breaks the second law. The locked door to the Long Ossuary (DC 18 Thieves\' Tools) is marked with a Broker\'s seal.',
    label: [63, 30],
  });
  b.props_('statue-tall-robed', [[56, 37], [60, 37], [64, 22], [63, 33]]).prop('rug-runner', 58, 36).prop('lantern-wall', 63, 26).prop('lantern-wall', 64, 38).prop('tapestry-tall', 64, 29);
  lt(b, 58, 36, 10, 15, CANDLE); lt(b, 63, 25, 10, 15, CANDLE);

  b.room('The Counting Floor', 60, 10, 18, 8, {
    mat: 'wood-planks-dark',
    read: 'Rows of tall desks, and at every desk a clerk with ink to the elbows, scratching in ledgers with quills made from finger bones. Nobody looks up. A brass bell over the far door rings once, very softly, every time someone in the room tells a lie.',
    gm: 'The Brokers\' Counting House. The lie-bell is real: it rings for any lie spoken in the room, and the Tallymen hear it. Broker Odalys Thurne keeps a desk by the strongroom stair and will see the heroes politely. She never lies; she chooses her words. She refuses to sell Lot 77 ("It is promised, and I keep my promises") unless offered something her patron wants more: the dead king\'s last breath, or a hero\'s own shadow or voice. If threatened or exposed, her bodyguard Tamas steps out of the shadow behind the ledger racks. A fight here breaks the first law: the Tallymen come in 1d4 rounds, and arrest everyone with a blade out, Thurne\'s people too.',
  });
  b.props_('desk', [[62, 12], [65, 12], [68, 12], [62, 15], [65, 15], [68, 15]]).props_('archive-stacks', [[75, 11], [75, 14]]).prop('writing-desk', 72, 15).prop('temple-bell', 70, 10).prop('scales', 71, 12).prop('strongbox', 76, 16).prop('lamp-table', 66, 14);
  b.light(66, 13, 15, 20, CANDLE).light(73, 14, 10, 15, CANDLE);
  b.door(63, 17, 's', 'closed', 'door-double').door(64, 17, 's', 'closed', 'door-double');
  b.encounter("Thurne's knives", [60, 10, 18, 8], [['assassin', 1], ['spy', 1], ['thug', 2]], 'moderate');

  b.room("Broker Thurne's Office", 60, 3, 8, 6, {
    mat: 'wood-planks',
    read: 'A tidy office that smells of lavender and ink. Every jar on the shelf is labelled in a neat round hand, and every label is a name.',
    gm: 'Thurne\'s desk drawer is locked (DC 16 Thieves\' Tools, or her key). Inside: Orsolo\'s letter (handout) and a purse of grave-gold. The jars on the shelf are empty, waiting. A hero who sits in her chair and reads the blotter (DC 14 Investigation) finds the pressed-in words "gold-tooth skull, third shelf, low".',
  });
  b.hall(63, 9, 63, 9, 1).door(63, 9, 's', 'closed');
  b.prop('writing-desk', 63, 5).prop('chair-high-back', 63, 4).prop('shelf-jars', 60, 3).prop('bookshelf', 66, 3).prop('rug-round', 64, 7).prop('lamp-table', 61, 7);
  b.light(63, 5, 8, 12, CANDLE);

  b.room('The Strongroom', 70, 3, 8, 6, {
    mat: 'dungeon-slab',
    read: 'Iron shelves, and on them a row of sealed glass jars, each wrapped in straw and tagged with a bone tally. One of them is humming a lullaby.',
    gm: 'Locked iron door (DC 18 Thieves\' Tools; Thurne and Tamas carry keys). Until the fourth candle goes out, Lot 77 is here among nineteen other soul-pieces, packed for delivery. After that, the crates have gone down the Long Ossuary. Taking a jar is leaving with unpaid goods unless the heroes have proved Thurne never paid for it. A glyph on the threshold (DC 15 Perception) screams Thurne\'s name if crossed without her key: it brings Tamas.',
  });
  b.hall(73, 9, 73, 9, 1).door(73, 9, 's', 'locked', 'door-iron');
  b.props_('crate-pile', [[71, 4], [76, 4]]).prop('shelf-jars', 73, 3).prop('shelf-jars', 75, 3).prop('strongbox', 76, 7).prop('glyph-trap', 73, 8, 0, { gm: true }).prop('reliquary', 71, 7);
  b.light(73, 5, 8, 12, GHOST);

  b.room('The Ledger Vault', 66, 20, 12, 8, {
    read: 'A round iron door opens on a cold, quiet vault. In its centre, on a reading stand, lies a ledger as thick as a gravestone, its pages turning by themselves. Behind it stands a statue of grey clay, taller than a doorway, with an inkwell for a heart.',
    gm: 'The market\'s Master Ledger writes down every sale by itself, and how it was paid. Thurne\'s purchases are all marked "paid: grave-gold" (handout). The Vault Warden (clay golem) attacks anyone who touches the ledger without the Tally-Rod or Barnabus beside them; it ignores anyone who only reads. The market\'s float (2,000 gp) sits in chests here: taking it breaks the third law in the loudest way possible. A secret door in the south wall (DC 17 Perception) leads to the Long Ossuary.',
  });
  b.hall(72, 18, 72, 19, 1).door(72, 17, 's', 'closed').door(72, 19, 's', 'locked', 'door-iron');
  b.prop('lectern', 72, 23).prop('statue-tall-knight', 72, 21).props_('chest', [[67, 21], [76, 21], [67, 26]]).prop('coin-stacks', 76, 26).prop('candle-ring', 70, 24).prop('archive-stacks', 68, 23);
  b.light(72, 23, 10, 15, '#bcd8ff');
  b.hall(72, 28, 72, 29, 1).door(72, 27, 's', 'secret');
  b.encounter('The Vault Warden', [66, 20, 12, 8], [['clayGolem', 1]], 'moderate');

  b.room('The Long Ossuary', 67, 30, 11, 22, {
    read: 'The Brokers\' private dead. A long gallery of shelves, every one packed with skulls set in neat rows like books, each with a little brass plate. It is very cold, and one skull on the third shelf down is grinning with a full set of gold teeth.',
    gm: 'Old Brokers are buried here, and three of them never left: wights who still keep their accounts and attack anyone without a Broker\'s seal, with their ghoul clerks. The gold-toothed skull is the latch of the secret wall in the south end (DC 16 Investigation to find without the clue). Pressing it slides the shelf aside on a stair down to the Tutor\'s workshop. On the fourth candle, Thurne and two porters carry the crates this way.',
  });
  b.rock(69, 33, 1, 3).rock(75, 33, 1, 3).rock(69, 39, 1, 3).rock(75, 39, 1, 3).rock(69, 45, 1, 3).rock(75, 45, 1, 3);
  for (const y of [31, 36, 42, 48]) { pp(b, 'ossuary-shelf', 67, y, 90); pp(b, 'ossuary-shelf', 77, y, 270); }
  b.prop('skull-pile', 72, 32).prop('burial-slab', 72, 41).prop('candle-stand-tall', 71, 37).prop('candle-stand-tall', 73, 45).prop('cobweb-corner', 77, 30).prop('urn', 68, 50).prop('wall-button', 74, 50, 0, { gm: true });
  b.light(72, 37, 8, 15, GHOST).light(72, 47, 8, 15, GHOST);
  b.hall(65, 40, 66, 40, 2).door(64, 40, 'e', 'locked').door(64, 41, 'e', 'locked');
  b.encounter('The quiet dead', [67, 30, 11, 22], [['wight', 3], ['ghoul', 4]], 'low');

  // ================= the Charnel Canal (south) =================
  b.floor(3, 51, 60, 2, 'stone-cobble');
  b.water(0, 53, 63, 6, false).water(0, 54, 63, 4, true);
  b.floor(2, 59, 50, 2, 'stone-cobble');
  b.mud(30, 59, 6, 2).rubble(46, 59, 3, 1);
  b.floor(22, 53, 3, 6, 'stone-cobble');
  b.floor(40, 53, 1, 6, 'wood-planks');
  b.area('The Charnel Canal', [[0, 51, 63, 10]], {
    read: 'Black water slides past under a low roof of bones. Boats painted with eyes drift by, poled by hooded figures, loaded with cages and coffins. Now and then something big turns over beneath the surface, and the boatmen all stop poling at once.',
    gm: 'The market\'s back road. Two ways across: the Coin Bridge (stone, watched by a Tallyman) and the Ribs, a single plank of whale-bone (DC 13 Acrobatics or fall in). Swimming is easy (DC 10 Athletics) but the chuul that the smugglers feed live under the deep middle: they attack swimmers, and anyone in a boat that is splashing. A boat from Scurlow\'s Landing reaches the Dead Dock water gate at the east end in 5 minutes. Tibb Scurlow knows the gate\'s knock.',
    label: [30, 55],
  });
  b.area("Scurlow's Landing", [[28, 51, 8, 2]], { read: 'A stub of pier with a lantern on a pole, three boats tied to skull-shaped mooring posts and a little man sitting cross-legged on an upturned crate, mending a net and humming.', gm: 'Tibb Scurlow\'s ferry: 5 sp a head anywhere on the canal, 50 gp to the Dead Dock "and I never saw you". He saw Thurne\'s porters take crates by boat on earlier nights, before she found the secret stair was quicker.', label: [31, 52] });
  b.props_('mooring-post', [[29, 52], [33, 52]]).prop('dock-pier', 31, 53).prop('crate', 35, 51).prop('fishing-net', 30, 51).prop('lamp-post', 34, 52);
  b.props_('rowboat', [[30, 54], [33, 55], [12, 56], [52, 55]]).prop('canoe', 58, 54).prop('bridge-rope', 40, 55).prop('sewer-outflow', 1, 56);
  // the Drop: the chute from the Gutter Pit's hole (53,14) comes out here, over the water
  b.prop('sewer-outflow', 53, 51).note(53, 52, 'The Drop comes out here: losers tipped down the hole in the Gutter Pit slide 20 ft down a slimy chute and splash into the canal (no damage, very wet). It cannot be climbed back up without a rope (DC 15 Athletics).');
  b.props_('skull-pile', [[8, 51], [56, 51], [18, 60]]).prop('lantern-standing', 23, 52).prop('lantern-standing', 23, 59).prop('fish-crate', 47, 51).prop('cargo-crates', 5, 59).prop('deep-water', 15, 55).prop('deep-water', 48, 56);
  for (const x of [8, 23, 31, 45, 58]) lt(b, x, 52, 8, 15, CANDLE);
  b.encounter('Canal lurkers', [0, 51, 63, 10], [['chuul', 3]], 'low');

  b.tunnel([[12, 42], [12, 50]], 2, { mat: 'stone-cobble', seed: 710 });
  b.area('The Bone Steps', [[12, 44, 2, 6]], { read: 'Steep, slick steps of packed femurs lead down toward the smell of water.', gm: 'Jar Alley\'s way down to the canal quay.', label: [12, 47] });
  pp(b, 'stairs-down', 12, 45); pp(b, 'lantern-hook', 13, 48);
  b.hall(44, 45, 44, 50, 2);
  b.area('The Canal Stair', [[44, 45, 2, 6]], { read: 'Wide wet steps go down from the auction hall to the water.', gm: 'Buyers\' boats wait here to carry big lots away. A Tallyman checks bone tallies at the bottom: no tally, no boat.', label: [44, 48] });
  b.prop('stairs-down', 44, 47).prop('stairs-down', 45, 47).prop('statue-gargoyle', 45, 50);

  // ================= south bank: the shrine, the sewer, the dock =================
  b.room('The Shrine of Settled Debts', 3, 62, 14, 12, {
    read: 'Quiet, after the roar of the market. Little paper lanterns float near the ceiling, and under them stand rows of niches, each holding a skull and a few coins. A pale old man kneels at the altar, polishing the coins one by one. You can see the candles through him.',
    gm: 'Where the market\'s traders lay their own dead, with coins to "settle the last debt". Ossian Dree (ghost) was an ossuary-builder who sold his last year of life here and was paid in grave-gold: he died the next dawn with nothing. He knows the secret wall in the Long Ossuary (he built it for Thurne, for a price she never paid) and how to spot grave-gold: it is cold even in a fist, and it smells of turned earth. He asks the heroes to put one honest coin in his niche. Taking coins from the niches curses the thief (disadvantage on Charisma checks until dawn) and every Broker\'s teeth chatter at them.',
  });
  b.hall(9, 61, 9, 61, 1).door(9, 60, 's', 'closed');
  b.prop('shrine', 10, 63).prop('altar', 9, 64).props_('prayer-kneeler', [[8, 66], [11, 66]]).props_('tomb-niche', [[3, 64], [3, 68], [16, 64]], 90).props_('ossuary-shelf', [[5, 72], [12, 72]]).prop('offering-bowl', 7, 64).props_('candle-ring', [[6, 69], [13, 69]]).prop('urn', 15, 72).prop('lantern-hanging', 9, 69);
  b.light(9, 65, 12, 20, GHOST).light(9, 70, 8, 15, CANDLE);
  b.door(16, 69, 'e', 'secret');
  b.tunnel([[17, 69], [23, 71], [28, 70]], 1, { mat: 'cave-floor', seed: 711 });
  pp(b, 'bones', 21, 70);

  b.room('The Old Sewer Mouth', 28, 63, 15, 17, {
    mat: 'brick-floor',
    read: 'An old brick sewer, far older than the market, slopes down toward a round grate and a breath of fresh, cold air. The way out. In the middle of the channel stands a hulking figure of bone plates, its lantern eyes swinging slowly from side to side.',
    gm: 'The market\'s back door: the sewer runs half a mile to the river outfall below the city wall. One Tallyman guards it and asks every leaving customer for their bone tallies. Show a tally for everything carried, or a token from Gizzard, or Barnabus\'s written leave, and it steps aside. Otherwise it fights to stop them, and the noise brings the next pair in 1d4 rounds. A side drain (locked grate, DC 15 Thieves\' Tools or DC 18 Athletics) runs east to the Dead Dock.',
  });
  b.water(34, 63, 3, 17, false);
  b.hall(33, 61, 33, 62, 1).door(33, 60, 's', 'open', 'door-iron');
  b.prop('stairs-down', 33, 62).prop('sewer-outflow', 35, 78).prop('gm-exit', 35, 79).props_('rubble-pile', [[29, 70], [41, 74]]).prop('mold-patch', 40, 66).prop('puddle', 31, 75).prop('barrel', 41, 64).prop('lantern-standing', 32, 66);
  b.light(32, 66, 8, 15, CANDLE);
  b.tunnel([[43, 70], [48, 68], [51, 66]], 1, { mat: 'brick-floor', seed: 712 });
  b.door(51, 66, 'e', 'locked', 'door-iron');
  b.encounter('The sewer Tallyman', [28, 63, 15, 17], [['boneMarketTallyman', 1]], 'low');

  b.room('The Dead Dock', 52, 60, 10, 8, {
    mat: 'wood-planks',
    read: 'A hidden boat dock under a low vault. A water gate of black iron bars holds back the canal. On the planks, a row of empty crates waits with their lids off, and the air smells of salt and myrrh.',
    gm: 'Orsolo\'s old delivery dock. The water gate opens to a knock (three slow, two fast: Tibb knows it) or DC 20 Athletics to lift. Two locked doors: west to the south canal ledge, east into the workshop (DC 16 Thieves\' Tools). Heroes coming this way arrive behind the Tutor\'s choir, not in front of it.',
  });
  b.water(55, 59, 4, 8, true);
  for (let x = 55; x <= 58; x++) b.door(x, 58, 's', 'locked', 'door-iron');
  b.door(51, 60, 'e', 'locked').door(61, 64, 'e', 'locked', 'door-iron');
  b.props_('crate', [[53, 62], [53, 64], [60, 61]]).prop('mooring-post', 54, 66).prop('rope-coil', 60, 66).prop('rowboat', 56, 63).prop('winch', 59, 60).prop('lantern-hook', 53, 61);
  b.light(54, 63, 8, 12, CANDLE);

  // ================= the Tutor's workshop (south-east) =================
  b.hall(72, 52, 72, 61, 2).door(72, 51, 's', 'secret');
  b.area('The Hidden Stair', [[72, 52, 2, 10]], { read: 'Behind the shelf, a narrow stair goes down and down, and from the bottom comes the sound of an organ being tuned, one sobbing note at a time.', gm: 'Every step is a rib bone. The bottom step creaks loudly (DC 14 Perception to spot it, or the choir is ready for the heroes).', label: [72, 56] });
  b.prop('stair-spiral', 72, 53).prop('stairs-down', 73, 58).prop('bones', 72, 60);

  b.room('The Bone Workshop', 62, 62, 16, 7, {
    read: 'A long workroom lit by green candles. On the tables lie bodies being wrapped in linen, bundles of bones being sorted, and jars, hundreds of jars, each with something faint moving inside. Two wrapped figures turn their heads toward you at the same moment.',
    gm: 'Orsolo Venn\'s workshop. His embalmed apprentices (mummies) and old Brokers he raised (wights) work here, with two ghasts as porters. If the heroes arrive before the last candle, Orsolo is at the organ fitting jars into its pipes; they have time to talk. He will trade: the heroes\' friend\'s soul-piece for the dead king\'s last breath, or for one hero to sit at his organ and sing (the hero loses their voice until dawn). He keeps his word, the way Thurne does.',
  });
  b.props_('table-long', [[64, 64], [69, 64], [74, 64]]).props_('burial-slab', [[65, 67], [71, 67]]).props_('shelf-jars', [[62, 62], [77, 62]]).prop('bone-heap', 76, 67).prop('alchemy-table', 67, 62).prop('cauldron-tripod', 73, 62);
  b.light(66, 65, 10, 15, GREEN).light(74, 65, 10, 15, GREEN);

  b.cave('The Marrow Organ', 71, 73, 6, 4, {
    seed: 713,
    read: 'A cave like the inside of a skull. Against the far wall rises an organ built of bones: its pipes are thigh bones, and fitted into each one is a jar with a soul-piece glowing inside. A thin man in a teacher\'s gown stands at its keys, conducting the empty air. "Ah. Latecomers. Sit, please. The lesson begins at dawn."',
    gm: 'The Marrow Organ. When the last candle dies and Orsolo plays it, every soul-piece in its pipes is used up, and he becomes undying (his body will reform 1d10 days after it is destroyed, unless the organ is smashed). Smashing it: AC 15, 60 hit points, vulnerable to thunder. Each jar broken frees its piece, which flies home: a shadow back to its feet, a voice back to its throat, a ghost back to its house. Lot 77 is the last pipe, top left. If the fight goes badly for Orsolo he plays three notes early: every creature within 30 ft makes a DC 15 Wisdom save or is frightened until the end of its next turn.',
  });
  pp(b, 'organ-cathedral', 72, 76); pp(b, 'stool', 72, 73); pp(b, 'candelabra-grand', 67, 72); pp(b, 'candelabra-grand', 76, 72); pp(b, 'summoning-circle', 70, 71); pp(b, 'bones', 66, 75); pp(b, 'skull-pile', 76, 75);
  b.light(72, 74, 15, 20, GHOST);
  b.room('The Wrapping Room', 55, 70, 8, 6, {
    mat: 'stone-flagstone',
    read: 'Spools of linen, tubs of resin, and a row of hooks with people\'s coats still hanging on them.',
    gm: 'Where the mummies were made. The coats belong to market traders who sold "a little time" to Thurne and never came back. A coat pocket holds a pawn ticket for Lot 12 (the last breath), stamped "held for O.V.". Myrrh and natron here burn hot: a fire spell sets the room alight.',
  });
  b.tunnel([[63, 72], [67, 72]], 1, { mat: 'dungeon-slab', seed: 714 }).door(62, 72, 'e', 'closed');
  b.props_('coat-rack', [[56, 70], [58, 70]]).prop('cauldron', 60, 73).prop('workbench', 57, 74).prop('herbs-drying', 61, 70).prop('washbasin', 55, 73);
  b.light(58, 72, 6, 10, CANDLE);
  b.encounter("The Tutor's choir", [62, 62, 16, 16], [['mage', 1], ['mummy', 2], ['wight', 3], ['ghast', 2]], 'high');

  return b.build();
}

export const BONE_MARKET: Adventure = {
  id: 'bone-market',
  title: 'The Bone Market',
  tagline: 'An illegal night bazaar in the catacombs, a friend\'s soul sold by mistake, and only until dawn to get it back.',
  levels: '7',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['heist', 'haggling', 'undead', 'city', 'catacombs'],
  pitch:
    'Under the trade city of Kettlemouth, in catacombs older than its walls, there is a market that opens at midnight and closes at dawn. You can buy anything there: a curse in a jar, a nightmare in a snuffbox, a dead king\'s last breath. Last night, your friend Dorrin Abernack went down there to sell a trinket and pay a debt. He came back with forty gold crowns and without something he can never buy again. Tonight, you are going down to get it back. The market has three laws. Break one, and the bone wardens come for you.',
  secret:
    'Broker Odalys Thurne, one of the market\'s seven Brokers, has spent a month buying every soul-piece that passes through the aisles: shadows, voices, house-ghosts, years of life. She pays in grave-gold, coin minted from the dead that turns to grave dirt at dawn, so by the market\'s own third law none of it is truly paid for. She buys for Orsolo Venn, the Tutor, a necromancer hidden in a forgotten workshop under the market. Orsolo has built the Marrow Organ, a pipe organ of bones with a jar in every pipe. At dawn after the longest night of the year (tonight) he will play it, burn up every soul-piece in it, and become undying. Dorrin\'s piece, Lot 77, is the last pipe he needs. Until the fourth candle goes out it sits in Thurne\'s strongroom; after that it is in the organ. Prove the grave-gold to the market\'s master, Barnabus Caddow, and the whole market turns on Thurne.',
  hooks: [
    'Dorrin Abernack, an old friend, knocks at midnight. He sold "something worthless" at the Bone Market to pay a gambling debt, and now something terrible is happening (see Dorrin\'s profile for the three versions: his shadow, his daughter\'s voice, or the family ghost). He gives the heroes the password and his purse of forty crowns.',
    'A priest of the city\'s dead has noticed that the household ghosts of Kettlemouth are vanishing one by one, sold by their families "for a song". She pays 1,000 gp to find out who is buying, and sends the heroes to Dorrin, her latest worried parishioner.',
    'A noble collector hires the heroes to bid for Lot 12 at tonight\'s auction, a dead king\'s last breath, with 1,500 gp of her money. In the Widow-Bell Crypt they meet Dorrin, white-faced and alone, trying to remember the password.',
  ],
  tips: [
    'Use the Tallow Clock: the bone chandelier has eight candles, and one goes out every hour of play, or after each long fight or long haggle. At the fourth candle, Thurne\'s crates go down the Long Ossuary. At the eighth, the dawn bell rings and Orsolo plays the organ.',
    'The three laws are the heart of the game. No blade drawn in the aisles (the Gutter Pit is the only exception). No lie to a Broker (their tooth necklaces chatter at a lie, so let the players craft clever true sentences). No leaving with unpaid goods (the Tallymen check bone tallies at every exit but the Smugglers\' Run). The Tallymen are tall, stooped wardens of yellow bone and brass with counting beads rattling in their ribs (Tallyman stat block). Two arrive 1d4 rounds after any law is broken. They grab, not kill: offenders are dragged to Barnabus to pay a fine (a memory, a year of life) or be thrown out.',
    'Haggling: every price can be paid in coin or in pieces of the buyer: a happy memory, a laugh, a year of life, a secret, a tooth. Each DC 15 Persuasion knocks a quarter off; an especially strange offer can do the same with no roll. Let the players spend odd things and remind them later what they gave up.',
    'Dorrin\'s forty crowns are grave-gold, and the heroes carry the proof from the first scene. Cold in the hand, smells of earth (DC 15 Arcana or Medicine, detect magic shows necromancy, or Ossian simply tells them). Reward players who think to test it.',
    'Most fights can be avoided: pay Gizzard, win at the pit, feed the ghoul-runners, calm the hatchery, show Barnabus the proof and borrow his Tallymen. Give the same XP for a clever bargain as for a win.',
    'For a party of 3 or a weaker group, drop one wight and one ghast from the Tutor\'s choir. For 5 or stronger heroes, add a third mummy, and let a Tallyman wander into the Counting House fight on Thurne\'s side.',
  ],
  npcs: [
    {
      id: 'pf_bmkdorrin', name: 'Dorrin Abernack', title: 'a friend who made a terrible sale', kind: 'npc', art: 'merchant', shared: true,
      wants: 'To undo what he did before dawn, and never set foot underground again.',
      knows: 'The password ("Those with nothing left by day"), the jar-wife\'s stall in Jar Alley, and the exact words of his sale.',
      voice: 'Talks too fast, laughs at the wrong moments, apologises every third sentence.',
      appearance: 'A soft-bellied lamp-oil seller in a good coat gone shabby, clutching a purse of forty gold crowns as if it might bite him.',
      backstory: 'He owed a dangerous man money and was told the Bone Market buys anything. He signed a receipt for "the one thing in my house I will never miss." The jar-wife\'s ink did the rest.',
      gmNotes: 'Pick what was sold. 1) His shadow: he casts none, is grey and cold, and at dawn he becomes a shadow (the monster). 2) His daughter Fia\'s voice: the girl, aged nine, has not made a sound since last night, and Dorrin has not slept. 3) The family ghost, Great-Aunt Philippa, who has haunted the Abernack house kindly for sixty years: the house has gone wrong, cold and full of bad luck. All three are Lot 77, a jar of grey glass with a bone tally. His forty crowns are grave-gold.',
    },
    {
      id: 'pf_bmkgizzard', name: 'Old Gizzard', title: 'doorkeeper of the Gate of Teeth', kind: 'monster', art: 'green-hag', monsterId: 'greenHag', shared: true,
      wants: 'Teeth. Good, strong teeth, and the gossip that comes with them.',
      knows: 'Everyone who came in tonight, including Thurne\'s porters with empty crates, and that the ghoul-runners\' road skips the Tallymen.',
      voice: 'A sweet grandmotherly croon, with a click of her tongue after every price.',
      appearance: 'A tiny bent woman in a shawl sewn with baby teeth, rattling a jar of molars like a purse.',
      gmNotes: 'Green hag stat block. Fair by her own rules: she never cheats a paying customer. She hates Thurne, who once paid her in coin that crumbled.',
    },
    {
      id: 'pf_bmkbarnabus', name: 'Barnabus Caddow', title: 'Auctioneer and Master of the Bone Market', kind: 'npc', art: 'noble', monsterId: 'noble', shared: true,
      wants: 'A clean market: everything sold is paid for, every law kept, every customer back next week.',
      knows: 'The laws, every Broker\'s reputation, and how to command the Tallymen with the Tally-Rod.',
      voice: 'A smooth auctioneer\'s patter that drops to a cold whisper when he is angry.',
      appearance: 'A tall, stooped man in a coat of grey feathers, with a thigh-bone gavel and a bone baton through his belt.',
      gmNotes: 'Noble stat block, but he never fights: the Tallymen fight for him. Shown proof of grave-gold, he rules Thurne\'s purchases void, gives the heroes his written leave to carry Lot 77 out, and either lends them the Tally-Rod (command one Tallyman until dawn) or sends two Tallymen with them.',
    },
    {
      id: 'pf_bmkodalys', name: 'Odalys Thurne', title: 'Broker of quiet things', kind: 'npc', art: 'noble', monsterId: 'spy',
      wants: 'Her patron\'s promise: a seat beside him forever, and the Bone Market for her own once he rules what lies under it.',
      knows: 'Where every soul-piece went, the secret stair, the Tutor\'s plan, and that the grave-gold will ruin her if anyone checks.',
      voice: 'Warm, careful and slow, like a doctor giving bad news. She never lies, and she never answers the question you asked.',
      appearance: 'A plump, kindly woman in lavender silk, with a necklace of tiny teeth that has never once chattered at her.',
      backstory: 'Thirty years a Broker, famous for fair dealing. A year ago her heart failed, and Orsolo Venn started it again. She owes him everything, and she pays her debts.',
      gmNotes: 'Spy stat block. She does not fight; she leaves that to Tamas. If cornered she offers a true bargain: Lot 77 for the dead king\'s last breath, or for a hero\'s own shadow or voice. If exposed before Barnabus, she runs for the Long Ossuary.',
    },
    {
      id: 'pf_bmktamas', name: 'Tamas Maudlin', title: 'Thurne\'s bodyguard', kind: 'monster', art: 'assassin', monsterId: 'assassin',
      wants: 'To be paid in real coin for once, and to never be seen.',
      knows: 'The strongroom key, the Rat Run, and that the Tutor scares him more than the Tallymen.',
      voice: 'Hardly speaks. When he does, it is one word, softly, from somewhere behind you.',
      appearance: 'A thin grey man you keep forgetting is there, with ink-stained fingers like a clerk\'s.',
      gmNotes: 'Assassin stat block. He waits behind the ledger racks. He fights to protect Thurne but can be bought: 500 gp in honest coin and he walks away.',
    },
    {
      id: 'pf_bmkbrisa', name: 'Brisa Scald', title: 'mistress of the Gutter Pit', kind: 'monster', art: 'gladiator', monsterId: 'gladiator', shared: true,
      wants: 'A good fight, a full house, and Thurne gone (she pays Brisa\'s winners in coin that crumbles).',
      knows: 'That crates go down the Long Ossuary every night before dawn, the Rat Run, and a key to the Counting House back door.',
      voice: 'A bellow made for crowds. Calls everyone "meat", fondly.',
      appearance: 'Huge and scarred, with a shaved head and a troll\'s skull worn as a shoulder guard.',
      gmNotes: 'Gladiator stat block. She tells all she knows to anyone who wins a bout, and sells the back-door key for 200 gp.',
    },
    {
      id: 'pf_bmktibb', name: 'Tibb Scurlow', title: 'canal ferryman', kind: 'monster', art: 'wererat', monsterId: 'wererat', shared: true,
      wants: 'Fares, gossip, and nobody poking at what he is under the hood.',
      knows: 'Every boat on the canal, the Dead Dock\'s knock (three slow, two fast), and where the chuul sleep.',
      voice: 'A cheerful, wet little sniff before every sentence, and a song always half-finished.',
      appearance: 'A small whiskery man in a long oilskin, with very bright black eyes and a tail he swears is a belt.',
      gmNotes: 'Wererat stat block. Friendly for fares. He will not fight for anyone, but if the heroes are kind to him he rows them right up to the water gate.',
    },
    {
      id: 'pf_bmkossian', name: 'Ossian Dree', title: 'ghost of the shrine', kind: 'npc', art: 'ghost', monsterId: 'ghost',
      wants: 'One honest coin in his niche, and Thurne to pay what she owes the dead.',
      knows: 'The secret wall and its gold-toothed latch, how to tell grave-gold, and what the Tutor is building.',
      voice: 'Soft and precise, like a man counting bones out loud.',
      appearance: 'A thin, pale old ossuary-builder in a leather apron, see-through from the knees down.',
      gmNotes: 'Ghost stat block. He will not fight. If the heroes give him a coin, he can possess a willing hero for an hour to open the secret wall and walk them safely past the Long Ossuary\'s wights.',
    },
    {
      id: 'pf_bmkorsolo', name: 'Orsolo Venn', title: 'the Tutor', kind: 'monster', art: 'necromancer', monsterId: 'mage',
      wants: 'To play the Marrow Organ at dawn and never die.',
      knows: 'Every soul-piece in his organ and whose it was. He remembers all their names; he thinks that makes it kind.',
      voice: 'A patient schoolmaster\'s voice, always asking questions he already knows the answer to.',
      appearance: 'A tall thin man in a black teacher\'s gown, with chalk on his fingers and a voice-jar hanging at his throat.',
      backstory: 'A tutor to noble children who found out he was dying, and decided he would not. He has taught the market\'s dead to work for him for twenty years.',
      gmNotes: 'Mage stat block; swap fireball for animate dead if you like (two more zombies). He bargains honestly before dawn. At half hit points he tries to reach the organ and play it early.',
    },
    {
      id: 'pf_bmkmimic', name: 'The "mimic eggs" chest', title: 'a mimic for sale on Skull Row', kind: 'monster', art: 'mimic', monsterId: 'mimic',
      wants: 'Something warm to open its lid. Failing that, to be sold to someone with soft hands.',
      knows: 'Nothing but the taste of the last three buyers, and that the stall-keeper feeds it rats on Tuesdays.',
      voice: 'A wet creak of hinges, then a sound like a dog swallowing.',
      appearance: 'A brass-bound sea chest chalked "MIMIC EGGS - DO NOT OPEN UNTIL PAID", sitting a little too still on the bottom shelf.',
      gmNotes: 'It is one mimic, not a chest of eggs. It bites (and sticks to) anyone who opens it or reaches inside, then lets go once it has had a mouthful. Too small a fight for an encounter at this level: run it as a single monster. The stall-keeper sells it for 40 gp "as is"; a hero who buys it owns a very bad pet. Biting a customer breaks no law of the market, so the Tallymen do not come.',
    },
  ],
  handouts: [
    { id: 'bmk-receipt', title: "Dorrin's receipt", text: 'BONE MARKET. STALL OF THE GLASS, JAR ALLEY.\nReceived of Dorrin Abernack: the one thing in his house he will never miss.\nPaid in full: forty crowns of the deep mint.\nLot 77. No returns. No regrets.\n(signed with a thumbprint in grey ink)' },
    { id: 'bmk-laws', title: 'Carved over the inner arch', text: 'THE THREE LAWS OF THE MARKET\nI. No blade bared in the aisles.\nII. No lie to a Broker.\nIII. Nothing leaves unpaid.\nThe Tallymen keep the laws. The laws keep the market. The market keeps you.' },
    { id: 'bmk-catalogue', title: 'Tonight\'s auction catalogue (a page)', text: 'Lot 12. A king\'s last breath, unfinished. From 1,500.\nLot 31. A drowned sailor\'s last wish. From 200.\nLot 44. Seven good years, gently used. From 900.\nLot 58. The colour blue (as seen by a painter). From 400.\nLot 77. Grey glass, one soul-piece. WITHDRAWN, private sale, Br. Thurne.\nLot 90. A curse that has not yet chosen anyone. Bidders beware.' },
    { id: 'bmk-letter', title: 'A letter in Thurne\'s desk', text: 'My dear Odalys,\nNinety-nine pipes are full. One remains. Bring it down before the fourth candle, as always, and bring the dead king\'s breath if you can get it for nothing; it would make a fine top note.\nDo not worry about the Brokers. After dawn, there will be only one.\nYour heart is in good hands.\n- O.V.' },
    { id: 'bmk-ledger', title: 'The Master Ledger (one page)', text: 'Br. Thurne buys: a shadow (tanner, Fish Street). Paid: grave-gold.\nBr. Thurne buys: a voice (child, Lamp Row). Paid: grave-gold.\nBr. Thurne buys: one year of life (O. Dree). Paid: grave-gold.\nBr. Thurne buys: a house-ghost (the Abernack house). Paid: grave-gold.\n...and ninety-six lines more, all the same.\nIn the margin, in a different hand: SETTLED BY DAWN?' },
  ],
  chapters: [
    {
      id: 'market', title: 'One Night in the Bone Market', level: 7,
      summary: 'A night-long heist under a trade city: get into the catacomb bazaar, follow a sold soul-piece from stall to Broker, keep the three laws (or break them cleverly), and reach the necromancer\'s hidden organ before the dawn bell.',
      goal: 'Get Lot 77 back before dawn, by buying, trading, tricking or stealing it, and stop the Tutor from playing the Marrow Organ.',
      map: boneMarket,
      npcs: [
        { npc: 'pf_bmkdorrin', x: 6, y: 4 },
        { npc: 'pf_bmkgizzard', x: 10, y: 15 },
        { npc: 'pf_bmkbrisa', x: 46, y: 11 },
        { npc: 'pf_bmkbarnabus', x: 45, y: 31 },
        { npc: 'pf_bmkodalys', x: 72, y: 16 },
        { npc: 'pf_bmktamas', x: 76, y: 12, hidden: true },
        { npc: 'pf_bmkmimic', x: 23, y: 28, hidden: true },
        { npc: 'pf_bmktibb', x: 31, y: 52 },
        { npc: 'pf_bmkossian', x: 9, y: 66, hidden: true },
        { npc: 'pf_bmkorsolo', x: 72, y: 74, hidden: true },
      ],
      scenes: [
        {
          room: 'The Widow-Bell Crypt', title: 'The skull that asks questions',
          read: 'Rain drips through the crypt door behind you. The skull on the iron door works its jaw, and dust falls from its teeth. "Who," it asks, in a voice like gravel in a bucket, "trades at night?"',
          gm: 'Dorrin gives the receipt (handout) and his purse. Let the players notice the coins are cold. The password opens the door; the smugglers\' door in the east wall (DC 15 Perception) leads to the ghoul-runners\' road instead. Start the Tallow Clock: it is midnight, eight candles.',
          handout: 'bmk-receipt',
        },
        {
          room: 'The Gate of Teeth', title: "Old Gizzard's toll", encounter: "Gizzard's toll",
          read: 'The old woman rattles her jar. "One tooth, one truth, or ten gold a head, my loves. And mind the words over the arch. The Tallymen can\'t read, but they don\'t need to."',
          gm: 'Pay the toll and there is no fight. Gizzard sells a map of the aisles (for a memory) and, for a juicy secret, tells them that Thurne\'s porters came in with empty crates. A hero who pays with a tooth gets a bone token (one free pass past a Tallyman). The laws are over the arch (handout).',
          handout: 'bmk-laws',
        },
        {
          room: 'Jar Alley', title: 'Following the jar', encounter: 'The Tallymen',
          read: 'Shelves of jars glow and mutter on both sides. Behind a stall made of coffin lids, a moth-eaten woman in a hundred shawls looks up and smiles with glass teeth. "Back so soon, Master Abernack? No returns, dearie. Says so on the paper."',
          gm: 'The Glass, the jar-wife. Her book (DC 14 Persuasion, 25 gp, or a fond memory) names Broker Thurne and "the private shelf". She mentions Thurne pays "in old gold, the cold kind". On the way, the heroes can shop Skull Row and peek into the Hatchery (careful). The Tallymen fight only if a law is broken: they arrive in 1d4 rounds, grab and drag, and stop once offenders yield. Yielding means a trip to Barnabus and a fine, which is a fine way to meet him.',
          treasure: 'For sale in the aisles: potions of greater healing (150 gp or a happy memory), a cloak of elvenkind (1,200 gp or a year of life), a wand of web (900 gp), a bag of holding that hums (600 gp). The mimic chest has 80 gp inside it, somewhere.',
        },
        {
          room: 'The Gutter Pit', title: 'Blood for answers', encounter: 'Pit champions', optional: true,
          read: 'Brisa Scald raises one huge arm and the crowd goes quiet. "New meat! New meat wants to ask questions! In my pit, meat, questions cost blood. Who goes first?"',
          gm: 'Fight Brisa\'s champions (Brisa and two veterans; they yield at half hit points), or one hero fights Brisa alone to first blood. Blades are allowed here. Win and Brisa tells what she knows (Thurne\'s crates, the Long Ossuary before dawn) and sells the Rat Run key for 200 gp. Bet on yourselves: 2 to 1 odds.',
          treasure: 'Winner\'s purse: 400 gp in honest silver, plus whatever the heroes bet (2 to 1). Brisa\'s favour: a bone pit-token that makes any ghoul-runner wave the heroes through.',
        },
        {
          room: 'The Chandelier Hall', title: 'Lot seventy-seven, withdrawn',
          read: 'The gavel cracks. "Lot twelve! A king\'s last breath, unfinished. Who will start me at fifteen hundred?" Above you, on the bone chandelier, one of the eight candles gutters and goes out.',
          gm: 'The catalogue (handout) shows Lot 77 withdrawn for Thurne. Barnabus will hear the heroes between lots. Accusations without proof bore him. Proof that Thurne pays in grave-gold (Dorrin\'s coins tested in front of him, the Master Ledger, Ossian\'s word, Brisa\'s crumbling winnings) makes him furious: he voids her purchases, writes the heroes leave to carry Lot 77 out, and lends them the Tally-Rod or two Tallymen. Heroes can also bid on Lot 12, the dead king\'s last breath, the perfect thing to trade to Thurne or Orsolo.',
          handout: 'bmk-catalogue',
        },
        {
          room: 'The Last Breath Chapel', title: 'A breath for sale', optional: true,
          read: 'The flask on the cushion fogs and clears, fogs and clears, like a mirror held to a dying man\'s lips. Its seller, a ghast in a velvet coat, bows. "One breath. Only one. A bargain at any price."',
          gm: 'Buy the last breath here before the auction (1,500 gp, or a piece of equal weight) or win it at the auction. It is the one thing both Thurne and Orsolo will trade Lot 77 for. A hero can also simply breathe it (potion of heroism, plus one sentence in a dead king\'s voice, which might impress Barnabus).',
          treasure: 'The dead king\'s last breath (works as a potion of heroism).',
        },
        {
          room: 'The Counting Floor', title: 'The Broker who never lies', encounter: "Thurne's knives",
          read: 'Odalys Thurne looks up from her ledger and smiles like a favourite aunt. "Master Abernack. And friends. Sit, please. I imagine you want something back. Everyone always does."',
          gm: 'The lie-bell rings at any lie. Thurne will sell Lot 77 only for the last breath or a hero\'s own shadow or voice. She will not say who it is for, but she never denies anything directly: a careful question ("Is it still in this building?") gets a careful true answer. Her office holds Orsolo\'s letter (handout). Fighting here breaks the first law: the Tallymen arrive in 1d4 rounds and arrest everyone with a blade out. Tamas can be bought off for 500 gp of honest coin. Before the fourth candle, Lot 77 is in the strongroom (DC 18 to open, glyph on the threshold).',
          handout: 'bmk-letter',
          treasure: 'Thurne\'s desk: 600 gp in honest coin, 300 "gp" of grave-gold, a ring of mind shielding she wears on a chain. The strongroom: twenty soul-pieces in jars (free them and they fly home), gems worth 900 gp.',
        },
        {
          room: 'The Ledger Vault', title: 'The book that writes itself', encounter: 'The Vault Warden', optional: true,
          read: 'The great ledger turns a page as you step in, and a line writes itself in fresh ink: your names, and the words "entered without purchase". The clay statue behind it opens its eyes.',
          gm: 'Reading the ledger is allowed; touching it wakes the Vault Warden unless Barnabus or the Tally-Rod is present. The ledger page (handout) is all the proof Barnabus needs. A thief can tear the page out (DC 15 Sleight of Hand while the golem is distracted). The secret door south leads into the Long Ossuary. Taking the market\'s float breaks the third law.',
          handout: 'bmk-ledger',
          treasure: 'The market\'s float: 2,000 gp (stealing it is a very bad idea). The Tally-Rod, if Barnabus has left it in the vault for safekeeping.',
        },
        {
          room: 'The Charnel Canal', title: "Tibb's ferry", encounter: 'Canal lurkers', optional: true,
          read: 'A little man in an oilskin sniffs and waves you over. "Ferry? Five silver anywhere on the water. Fifty to places I never go." Somewhere behind him, the black water bulges and goes still.',
          gm: 'Tibb rows the heroes to the shrine, the sewer, or for 50 gp to the Dead Dock\'s water gate (he knows the knock). The chuul attack only swimmers or noisy boats. This is the back route into the workshop, arriving behind Orsolo\'s choir. A chute from the Gutter Pit drops losers here.',
          treasure: 'A coffer sunk under the Coin Bridge (DC 15 Athletics to dive for it): 350 gp and a periapt of wound closure.',
        },
        {
          room: 'The Shrine of Settled Debts', title: 'The ossuary-builder', optional: true,
          read: 'The ghost at the altar holds up a gold coin and lets it fall through his palm. "She paid me in this. For my last year. I built her a door with it, a beautiful door, and I died the next dawn holding dirt."',
          gm: 'Ossian Dree tells how to recognise grave-gold, where the secret wall is (the gold-toothed skull, third shelf, south end), and what the organ is for. For one honest coin in his niche he will possess a willing hero and walk them through the Long Ossuary as a Broker (the wights let him pass). He can also come to the auction hall and tell Barnabus himself.',
        },
        {
          room: 'The Long Ossuary', title: 'The skull with golden teeth', encounter: 'The quiet dead',
          read: 'Rows of skulls watch you pass, each with a brass name plate. The cold gets into your teeth. At the far end, a skull on the third shelf grins at you with a full set of gold teeth, and three figures in Broker\'s silk rise from the shelves beside it.',
          gm: 'The old Brokers (wights) and their ghoul clerks challenge anyone without a Broker\'s seal. A seal, Thurne herself, or Ossian walking in a hero gets them past. Pressing the gold-toothed skull opens the hidden stair. If the heroes are here at the fourth candle, they catch Thurne and two porters carrying the crates: a chance to grab Lot 77 before it reaches the organ.',
          treasure: 'The wights\' grave goods: 400 gp of old Brokers\' rings and a cloak of protection.',
        },
        {
          room: 'The Marrow Organ', title: 'The lesson at dawn', encounter: "The Tutor's choir",
          read: 'One sobbing note fills the cave, then another. Orsolo Venn turns from the keys of the bone organ, chalk on his fingers, and smiles at you like a teacher at a late pupil. "Ninety-nine voices, and one more on its way. Tell me, have you ever heard a choir that cannot die?"',
          gm: 'Before the last candle, Orsolo talks and bargains honestly: Lot 77 for the dead king\'s last breath, or for one hero\'s voice until dawn. After the last candle he plays: the heroes have three rounds before the organ\'s song finishes. Fight: two mummies, three wights and two ghasts. If Barnabus\'s Tallymen came with the heroes, they hold the mummies. Smashing the organ (AC 15, 60 hp) frees every soul-piece at once, which shrieks home through the stone. Orsolo destroyed with the organ intact will rise again in 1d10 days.',
          treasure: 'Orsolo\'s spellbook, a wand of fear, a robe of useful items, 1,500 gp of silver organ fittings, and Lot 77 (the jar of grey glass, top left pipe).',
        },
      ],
      wrapUp: 'With Lot 77 in hand and the organ silent, the heroes still have to leave without breaking the third law: through the Old Sewer Mouth with Barnabus\'s leave or a bone tally, up the Smugglers\' Run past the ghoul-runners, or back out through the Gate of Teeth. The dawn bell rings, the candles all go out, and the market folds itself away like a fan. Above, in Kettlemouth, Dorrin\'s shadow comes home to his feet, or Fia laughs out loud, or the Abernack house warms up and something rattles the teacups happily.',
    },
  ],
  ending:
    'Win: the Marrow Organ is smashed, every soul-piece flies home, and Barnabus Caddow strips Thurne of her Broker\'s teeth (if she lives, she is sold at next week\'s auction, to pay her debts). The heroes have the run of the Bone Market: one free purchase a month, and a Broker\'s seal of their own. Lose: if dawn comes while the organ plays, Orsolo becomes undying and Lot 77 is gone for good. Dorrin\'s shadow becomes a shadow, Fia never speaks again, or the Abernack house turns cruel. The heroes, if they escaped, are wanted by the Tallymen for whatever laws they broke. Next: Orsolo, if he escaped or rises again, has a school, and his old pupils are now some of the richest nobles in Kettlemouth. And Lot 90, the curse that has not chosen anyone yet, was bought tonight by someone who asked the auctioneer a lot of questions about the heroes.',
};

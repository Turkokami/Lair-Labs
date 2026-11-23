// The Lantern Thief of Brindle Ford: a one-session adventure for four level 1 heroes.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder } from './builder';
import type { Adventure } from './types';

function underTheMill() {
  const b = new MapBuilder('adv-lantern-mill', 'Under Brindle Mill', 72, 56, { theme: 'cave', wallStyle: 'cave', ambient: 'dark', floor: 'cave-floor' });

  // 1. The mill cellar (way in from the village)
  b.room('Mill cellar', 3, 3, 10, 7, {
    mat: 'wood-planks',
    read: 'Flour dust hangs in the lantern light. Sacks slump against the walls, and a smell of wet stone rises from a gap behind the grain bins.',
    gm: 'Small clawed prints in the flour lead east. A DC 10 Investigation finds a scrap of blue-dyed cloth caught on a nail: kobold work.',
  });
  b.props_('flour-sacks', [[4, 4], [4, 6]]).prop('stairs-up', 3, 7).prop('grindstone', 9, 4).props_('barrel', [[11, 4], [11, 5]]).prop('sack', 8, 8).prop('lantern-hanging', 7, 6);
  b.light(7, 6, 15, 15).start(5, 5, 3, 3);
  b.door(12, 6, 'e', 'open', 'door-wood');

  // 2. Smugglers' storeroom
  b.hall(13, 6, 17, 6, 2, { mat: 'stone-cobble' });
  b.room("Smugglers' storeroom", 18, 3, 12, 9, {
    mat: 'stone-flagstone',
    read: 'Rotten crates are stacked to the ceiling of a long, low cellar. Something has chewed through the bottom of every one of them.',
    gm: 'Five giant rats nest in the crate piles and fight until two are left. A waterlogged ledger lies in the far crate (handout).',
  });
  b.props_('crate-pile', [[19, 4], [26, 4]]).props_('crate', [[22, 4], [23, 4], [28, 9], [19, 9]]).prop('crate-stack', 28, 8).props_('barrel-stack', [[24, 9]]).prop('bones', 21, 7).prop('rope-coil', 27, 6).prop('gm-treasure', 28, 4, 0, { gm: true });
  b.encounter('Rats in the crates', [18, 3, 12, 9], [['giant-rat', 5]], 'low');

  // 3. The collapsed tunnel (shortcut east) and the hidden smugglers' vault
  b.hall(30, 7, 46, 7, 2, { mat: 'stone-cobble' });
  b.rubble(33, 7, 5, 2);
  b.prop('column-collapsed', 40, 7, 0).prop('ceiling-rubble', 34, 7);
  b.area('Collapsed tunnel', [[30, 7, 17, 2]], {
    read: 'The old tunnel narrows where its roof came down. You squeeze between fallen beams and broken stone.',
    gm: 'Rubble is difficult ground. The seventh stone on the north wall is loose (DC 13 Perception, or automatic with the ledger): it hides the vault door.',
    label: [43, 7],
  });
  b.room("Smugglers' vault", 34, 1, 7, 5, {
    mat: 'stone-flagstone-warm',
    read: 'A tiny vault, bone dry. Three iron-bound boxes sit under a shelf of dusty bottles.',
    gm: 'Untouched for forty years. The middle strongbox has a poison needle (DC 12 Dexterity with tools to disarm; DC 11 Constitution save or 2d4 poison damage).',
  });
  b.floor(37, 6, 1, 1, 'stone-flagstone-warm').door(37, 6, 's', 'secret');
  b.props_('strongbox', [[35, 2], [37, 2], [39, 2]]).prop('wine-rack', 35, 4).prop('trap-needle-lock', 37, 2, 0, { gm: true }).prop('potion-set', 39, 4);

  // 4. Down to the kobolds' toll gate
  b.door(23, 11, 's', 'closed', 'door-wood');
  b.hall(23, 12, 23, 18, 2, { mat: 'stone-cobble' });
  b.room('Kobold toll gate', 18, 19, 12, 8, {
    mat: 'dirt',
    read: 'A barricade of planks and wagon wheels blocks the tunnel. Behind it, small figures with spears hiss: "Toll! Toll for tall ones!"',
    gm: 'Six kobolds. They want a toll (any shiny thing worth 1 gp or more each) and will talk. A tripwire at the barricade rings bells that wake the bunks. If three fall the rest run east.',
  });
  b.prop('barricade-wood', 22, 22).prop('barricade-wood', 25, 22).prop('trap-tripwire', 23, 21, 0, { gm: true }).props_('torch-standing', [[19, 20], [28, 20]]).prop('campfire', 23, 24).prop('loot-sacks', 27, 25).prop('stool', 21, 25);
  b.light(19, 20, 15, 15).light(28, 20, 15, 15).light(23, 24, 10, 20);
  b.encounter('Kobold toll gate', [19, 22, 10, 5], [['kobold', 6]], 'low');

  // 5. The trap hall and the stewpot cave (east)
  b.hall(30, 22, 40, 22, 2, { mat: 'dirt' });
  b.room('Trap hall', 40, 21, 12, 4, {
    mat: 'dirt',
    read: 'A straight, smooth tunnel, much too tidy for kobolds. Tiny holes pock the walls at knee height.',
    gm: 'Two traps: a hidden pit at the middle (DC 12 Perception to spot; DC 12 Dexterity save or fall 10 ft for 1d6) and darts from the wall holes past it (+4 to hit, 1d4 piercing each, 3 darts).',
  });
  b.prop('trap-pit-hidden', 45, 22, 0, { gm: true }).prop('trap-darts', 48, 21, 0, { gm: true }).prop('pressure-plate', 48, 23, 0, { gm: true });
  b.cave('Stewpot cave', 57, 23, 7, 5.5, {
    seed: 11,
    read: 'Something bubbles in a huge dented pot over a smoky fire. It smells of eels, mushrooms and old socks.',
    gm: 'Two kobold cooks (non-combatants, they flee). The stew is safe, if awful. The cooks know the lantern is "Glimmerwing\'s fire" in the shrine below.',
  });
  b.prop('cauldron-tripod', 57, 23).prop('campfire', 57, 24).props_('fish-crate', [[54, 21], [60, 25]]).prop('shelf-jars', 55, 26).prop('mushrooms', 61, 21).light(57, 24, 10, 20);

  // 6. The bunks and the hatchery (north-east)
  b.cave('Kobold bunks', 53, 9, 8, 5.5, {
    seed: 23,
    read: 'Dozens of nests of rags and straw fill a low cave. Little shapes stir and grumble in their sleep.',
    gm: 'Six kobolds sleep here. Stealth past them with a group DC 11 Dexterity (Stealth) check. If the toll gate bells rang, they are awake and waiting.',
  });
  b.props_('straw-bed', [[49, 8], [51, 11], [55, 7], [57, 11]]).props_('bedroll', [[52, 7], [54, 11]]).prop('loot-sacks', 58, 8).prop('cobweb-corner', 48, 10);
  b.encounter('The sleeping bunks', [48, 6, 11, 7], [['kobold', 6]], 'low');
  b.tunnel([[52, 13], [54, 17], [56, 19]], 2, { seed: 5 });
  b.cave('Hatchery', 65, 12, 5.5, 4.5, {
    seed: 31,
    read: 'Warm sand fills a hollow lit by a glowing fungus. A dozen leathery eggs lie in a careful ring.',
    gm: 'The egg-mother Yeep guards the eggs alone. She will not fight unless the eggs are touched, and she wants the tribe to stop following Snitchwick. She knows the crawlway to the chief\'s nook.',
  });
  b.paint(62, 10, 7, 5, 'sand').prop('glowing-fungus', 66, 10).prop('stone-circle', 63, 11).light(66, 10, 10, 20, '#9cf2a7');
  b.tunnel([[59, 9], [62, 11]], 2, { seed: 7 });

  // 7. The weeping cistern (south-west), with the secret culvert from the marsh
  b.cave('Weeping cistern', 16, 43, 12, 8.5, {
    seed: 41,
    read: 'Water drips from the ceiling of a great round cistern, and pale mist pours down the walls like a slow waterfall. Wings rustle overhead.',
    gm: 'The stirge roost: eight stirges and two swarms of bats hide in the ceiling and drop when anyone wades the pool. Without the lantern the mist gets thicker here every hour (lightly obscured, then heavily).',
  });
  b.pool(16, 43, 6, 4, true);
  b.props_('stalactites', [[9, 39], [22, 38], [12, 48]]).prop('skeleton-lying', 23, 46).prop('key-ring', 24, 47).prop('obscuring-cloud', 10, 44);
  b.encounter('Stirge roost', [6, 36, 20, 14], [['stirge', 8], ['swarm-of-bats', 2]], 'moderate');
  b.tunnel([[0, 51], [4, 49], [8, 47]], 2, { seed: 3 });
  b.prop('sewer-outflow', 0, 51);
  b.note(1, 51, 'Secret way in: the old culvert from the marsh. Locals call it the Weeping Pipe.');
  b.tunnel([[22, 27], [20, 31], [18, 35]], 2, { seed: 9 });

  // 8. The fungus grotto (optional) and the drip passage to the shrine
  b.tunnel([[26, 44], [31, 45]], 2, { seed: 13 });
  b.cave('Fungus grotto', 37, 45, 7, 5.5, {
    seed: 51,
    read: 'Mushrooms as tall as a child crowd a damp hollow. Their caps glow a faint violet.',
    gm: 'Two violet fungi lurk among harmless ones, and a shrieker screams when light comes near (it warns the shrine). Hanging roots on the east wall hide a narrow crack (DC 12 Perception).',
  });
  b.props_('mushroom-giant', [[34, 43], [39, 47]]).props_('glowing-fungus', [[36, 47], [40, 43]]).prop('mushrooms', 35, 46).light(36, 47, 5, 15, '#c08cff');
  b.encounter('Fungus grotto', [32, 41, 10, 9], [['violet-fungus', 2], ['shrieker-fungus', 1]], 'low');
  b.tunnel([[43, 45], [47, 44], [50, 41]], 1, { seed: 17 });

  // 8b. The smugglers' old dock on the underground river (a second way round to the shrine)
  b.tunnel([[39, 50], [41, 52]], 2, { seed: 37 });
  b.cave("Smugglers' dock", 52, 52, 13, 3.2, {
    seed: 81, wobble: 0.1,
    read: 'A black stream slides through a long cave. A sagging wooden jetty juts out over it, and a rowboat bumps against the posts.',
    gm: 'The stream is slow and only waist deep (difficult ground). Two giant frogs lurk under the jetty. The rowboat is sound: rowing upstream reaches the shrine\'s south side quietly.',
  });
  b.water(40, 52, 25, 2, false, true);
  b.prop('dock-pier', 50, 50).prop('rowboat', 52, 52, 90).props_('mooring-post', [[49, 50], [53, 50]]).prop('fishing-net', 45, 50).prop('reeds', 62, 51).prop('lily-pads', 57, 53).prop('lantern-hook', 51, 50, 0, { off: true });
  b.encounter('Frogs under the jetty', [42, 49, 22, 6], [['giant-frog', 2]], 'low');
  b.tunnel([[63, 51], [60, 47]], 2, { seed: 43 });

  // 9. The shrine of Glimmerwing and the chief's nook
  b.tunnel([[57, 27], [58, 31]], 2, { seed: 19 });
  b.cave('Shrine of Glimmerwing', 58, 40, 10, 7.5, {
    seed: 61,
    read: 'Blue fire burns in a brass lantern on a stone altar, and the mist bends away from it. Behind the altar, in a rusty birdcage, a tiny winged dragon watches you with sad golden eyes.',
    gm: 'Snitchwick, his pet snake Nibbles, a mud mephit he calls "the Prophet" and six kobolds. Snitchwick talks first: he truly believes the lantern is dragon fire. If he falls or surrenders, every kobold flees or drops its spear.',
  });
  b.prop('altar', 58, 37).prop('lantern-standing', 58, 36).prop('cage', 60, 36).props_('candles', [[55, 37], [62, 38]]).prop('magic-circle', 57, 41).props_('banner-pole', [[53, 38], [63, 42]]).prop('bones', 52, 44).prop('offering-bowl', 56, 37);
  b.light(58, 36, 20, 40, '#7fd0ff');
  b.encounter("Snitchwick's congregation", [51, 35, 15, 11], [['acolyte', 1], ['giant-venomous-snake', 1], ['mud-mephit', 1], ['kobold', 6]], 'moderate');
  b.tunnel([[66, 41], [68, 41]], 2, { seed: 23 });
  b.cave("Chief's nook", 68, 42, 3, 4, {
    seed: 71,
    read: 'A cramped hollow piled with bright junk: buttons, spoons, a cracked mirror and one very fine boot.',
    gm: 'Snitchwick\'s hoard. The crawlway north (one square wide) climbs to the hatchery: a quiet way in or out.',
  });
  b.prop('treasure-pile', 68, 43).prop('mirror', 69, 40).prop('coins-small', 67, 44);
  b.tunnel([[67, 15], [69, 22], [68, 30], [69, 38]], 1, { seed: 29 });

  return b.build();
}

export const LANTERN: Adventure = {
  id: 'lantern-thief',
  title: 'The Lantern Thief of Brindle Ford',
  tagline: 'Someone stole the lantern that keeps the marsh mist away. Get it back before dawn.',
  levels: '1',
  sessions: '1 session (3-4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'starter', 'caves', 'kobolds', 'can be talked out'],
  pitch:
    'Brindle Ford is a village of reed roofs on a slow brown river. For a hundred years a brass lantern with a blue flame has hung in its little shrine, and the marsh mist has never crossed the ford. Three nights ago the lantern vanished. Now the mist creeps between the houses after dark, and last night something drank a goat dry. The reeve has gathered whoever will help. You.',
  secret:
    'Snitchwick, a clever and very sincere kobold, stole the lantern. His tribe was flooded out of its old den and moved into the forgotten smugglers\' tunnels under Brindle Mill. Snitchwick keeps a caged pseudodragon, Glimmerwing, and preaches that she is a god: the lantern\'s blue fire must be her holy flame. He wants the tribe to obey him. What he does not know is that without the lantern, the mist (and the stirges that ride it) pours into his own tunnels through the old cistern. Why now: the flood. Deadline: by dawn the mist reaches the houses and the stirges will hunt people, not goats.',
  hooks: [
    'The reeve, Odalie Pike, offers 25 gp each and free ferry passage for a year.',
    'Tam, the miller\'s boy, saw "little lizard-men with a blue light" run into the mill and has been too scared to tell anyone but strangers.',
    'One of the heroes was bitten by a stirge on the road last night. The mist is following them.',
  ],
  tips: [
    'Open in the action: start at dusk in the shrine, with mist curling over the doorstep and the reeve mid-speech.',
    'There are three ways to the shrine (through the bunks, through the trap hall, or round by the cistern and grotto). Let the players choose; all of them work.',
    'Kobolds talk. The toll gate, the cooks and the egg-mother Yeep can all turn the fight into a deal. Yeep is the best ally if the players are gentle.',
    'Short on time? Skip the fungus grotto and the vault. Fast group? Have the bunks wake up.',
    'Each kobold group runs when its leader falls or half of it is down. Fights stay short.',
    'Snitchwick is wrong, not evil. Freeing Glimmerwing, or proving the lantern only keeps out mist, ends the fight as well as a sword does.',
  ],
  npcs: [
    {
      id: 'pf_odaliepike', name: 'Odalie Pike', title: 'Reeve of Brindle Ford', kind: 'npc', art: 'commoner', shared: true,
      wants: 'Her lantern back and her village safe, without anyone dying.', knows: 'The lantern was last seen three nights ago; the shrine door was opened from inside a gap in the floorboards.',
      voice: 'Brisk, counts things on her fingers, calls everyone "love".', appearance: 'A broad, weathered woman in a waxed coat, with an iron key on a cord round her neck.',
      backstory: 'Ferry-keeper for thirty years and reeve for ten. She has never left the ford for more than a week.',
    },
    {
      id: 'pf_tammiller', name: 'Tam Hollis', title: "the miller's boy", kind: 'npc', art: 'child', shared: true,
      wants: 'To not be in trouble, and to see a real adventure.', knows: 'The thieves came up through the mill cellar. One of them dropped a button and a feather.',
      voice: 'Talks very fast, then stops and stares at his shoes.', appearance: 'A skinny ten-year-old covered in flour, holding a wooden sword.',
    },
    {
      id: 'pf_snitchwick', name: 'Snitchwick', title: 'High Lantern-Priest of Glimmerwing', kind: 'monster', art: 'kobold', monsterId: 'acolyte',
      wants: 'For the tribe to obey him, and for Glimmerwing to be worshipped forever.', knows: 'Nothing about mist or stirges. He thinks the cistern "weeps" because the god is sad.',
      voice: 'Grand, squeaky, speaks of himself as "Snitchwick the Chosen".', appearance: 'A small kobold in a robe made from a blue tablecloth, wearing a teaspoon on a chain.',
      gmNotes: 'Uses the acolyte stat block (Sacred Flame, Bless, Cure Wounds). Surrenders at 3 HP or less. If shown the mist flooding the cistern, he panics and offers the lantern for safe passage of his tribe.',
    },
    {
      id: 'pf_yeep', name: 'Yeep', title: 'egg-mother of the tribe', kind: 'npc', art: 'kobold',
      wants: 'Her eggs safe, and Snitchwick out of charge.', knows: 'The crawlway from the hatchery to the chief\'s nook, and that Glimmerwing bites Snitchwick every day.',
      voice: 'Slow, old, clicks her tongue before every sentence.', appearance: 'A grey-scaled kobold with a shawl of knitted moss.',
      gmNotes: 'Reserve ally. If the heroes leave the eggs alone, she guides them and calls the bunks off.',
    },
    {
      id: 'pf_glimmerwing', name: 'Glimmerwing', title: 'a very tired pseudodragon', kind: 'monster', art: 'pseudodragon', monsterId: 'pseudodragon',
      wants: 'Out of the cage, and a warm sunny windowsill.', knows: 'Everything the kobolds have said in front of her for a year.',
      voice: 'Speaks only in feelings and pictures (telepathy): warm gold for yes, cold grey for no.', appearance: 'A cat-sized red-bronze dragon with a sting in her tail and a bald patch from the cage bars.',
      gmNotes: 'If freed she bonds with the kindest hero and may stay as a companion (the Find Familiar spell can make it official).',
    },
  ],
  handouts: [
    { id: 'shrine-note', title: 'Scratched on the shrine door', text: 'SHINY FIRE IS FOR GLIMMERWING.\nGO AWAY TALL ONES.\n(below it, a drawing of a very small dragon wearing a crown)' },
    { id: 'ledger', title: 'A waterlogged ledger page', text: 'Brandy, 6 casks, paid.\nSilk, 2 bolts, paid.\nThe count is behind the 7th stone, long tunnel, north side. Do NOT tell Garrow.\n— last entry, forty years ago' },
    { id: 'sermon', title: "Snitchwick's sermon slate", text: 'GLIMMERWING IS FIRE.\nFIRE IS HERS.\nSNITCHWICK IS HER VOICE.\nWHO IS NOT LISTENING TO SNITCHWICK IS NOT LISTENING TO FIRE.' },
  ],
  chapters: [
    {
      id: 'mill', title: 'Under Brindle Mill', level: 1,
      summary: 'From the mill cellar into the smugglers\' tunnels and the kobold warren, to the shrine where the lantern burns.',
      goal: 'Bring the lantern back to the village shrine before dawn.',
      map: underTheMill,
      npcs: [
        { npc: 'pf_snitchwick', x: 57, y: 38, hidden: true },
        { npc: 'pf_glimmerwing', x: 60, y: 36, hidden: true },
        { npc: 'pf_yeep', x: 65, y: 13, hidden: true },
      ],
      scenes: [
        {
          title: 'The shrine at dusk',
          read: 'Mist curls over the shrine step like a cat looking for a way in. Reeve Odalie Pike stands where the lantern used to hang, an empty hook above her head. "Right," she says. "Who\'s going to get it back?"',
          gm: 'Odalie hires the party. Tam points to the mill. The door note (handout) shows who took it. Keep this scene to ten minutes.',
          handout: 'shrine-note',
        },
        { room: 'Mill cellar', title: 'The mill cellar', gm: 'The way in. Flour prints lead east to the storeroom.' },
        { room: "Smugglers' storeroom", title: 'Rats in the crates', encounter: 'Rats in the crates', gm: 'A warm-up fight. The ledger in the far crate points to the hidden vault.', handout: 'ledger', treasure: '12 sp in a rotten purse; a good hooded lantern.' },
        { room: 'Collapsed tunnel', title: 'The collapsed tunnel', gm: 'The fast way to the bunks. The loose stone hides the vault.' },
        { room: "Smugglers' vault", title: "The smugglers' vault", optional: true, gm: 'Forty years forgotten. Mind the needle in the middle box.', treasure: '60 gp in old coins, 2 potions of healing, a silver flask (25 gp), a spell scroll of Bless.' },
        { room: 'Kobold toll gate', title: 'The toll gate', encounter: 'Kobold toll gate', gm: 'Talk or fight. Paying the toll (or a good Persuasion, DC 12) lets the party through; the kobolds even point the way.', treasure: 'Toll box: 8 sp, 30 cp, three glass beads.' },
        { room: 'Trap hall', title: 'The trap hall', gm: 'Pit and darts. Smart players poke ahead with a pole.' },
        { room: 'Stewpot cave', title: 'The stewpot', gm: 'Cooks flee. A good spot to learn where the lantern is.' },
        { room: 'Kobold bunks', title: 'The sleeping bunks', encounter: 'The sleeping bunks', gm: 'Sneak or fight. Waking them is noisy and brings them to the shrine later.' },
        { room: 'Hatchery', title: 'The egg-mother', gm: 'Yeep, the best ally in the warren, if the eggs are left alone.' },
        { room: 'Weeping cistern', title: 'The weeping cistern', encounter: 'Stirge roost', gm: 'Where the mist comes in. Seeing this, anyone can tell the kobolds are in danger too.', treasure: 'On a drowned smuggler: a key ring (opens the strongboxes in the vault without the needle), 15 gp.' },
        { room: "Smugglers' dock", title: "The smugglers' dock", optional: true, encounter: 'Frogs under the jetty', gm: 'The quiet way round to the shrine, by boat or by wading.', treasure: 'In the boat\'s locker: a waterproof tinderbox, 20 ft of good rope, a bottle of brandy (5 gp).' },
        { room: 'Fungus grotto', title: 'The fungus grotto', optional: true, encounter: 'Fungus grotto', gm: 'The crack behind the roots is the back way to the shrine.' },
        { room: 'Shrine of Glimmerwing', title: 'The shrine of Glimmerwing', encounter: "Snitchwick's congregation", gm: 'The finale. Snitchwick preaches first; give the players a chance to talk, sneak, or free Glimmerwing mid-fight.', handout: 'sermon', treasure: 'The Mistward Lantern, Snitchwick\'s teaspoon (a holy symbol, oddly), 2 potions of healing in the altar.' },
        { room: "Chief's nook", title: "The chief's nook", optional: true, gm: 'Shiny junk and a quiet crawlway.', treasure: '45 gp in mixed coins, a silver mirror (10 gp), one fine riding boot (left).' },
      ],
      wrapUp: 'Back at the shrine, the blue flame flares and the mist slinks back across the ford. Odalie pays up and the village throws a fish supper. The heroes reach level 2.',
    },
  ],
  ending:
    'Good ending: the lantern burns again, the kobolds (led by Yeep) agree to trade eels for bread, and Glimmerwing finds a windowsill. Bad ending: the lantern is lost or broken, the stirges hunt the village every night and Brindle Ford is half empty by spring. Next: the ledger mentions someone called Garrow. Who was he, and is his share still out there?',
};

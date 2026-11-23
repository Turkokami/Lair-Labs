// Goblin Warren, the big version: a whole hillside cave system. The old warren (ravine mouth, watch post, den,
// wolf pen, mushroom grotto, chief's hall) is still here, and around it now lie a bat roost, the feasting cave, a
// shaman's hollow, a smithy, worg kennels, the prisoners' hole, an underground river and sump, an old dwarven
// mine, a bugbear's nook and the chief's hidden hoard. Three ways lead to the chief: through the feasting cave,
// round by the den and the kennels, or across the river and up through the old mine. Secrets: a sealed dwarven\n// vault behind the grotto and the hoard behind the throne.
// Run: npx vite-node scripts/maps/goblin-warren.ts
import { MapBuilder } from '../mapkit';

const b = new MapBuilder('goblin-warren', 'Goblin Warren', 72, 56, { theme: 'cave', wallStyle: 'cave', ambient: 'dark', floor: 'cave-floor', seed: 31 });
const DIRT = { mat: 'dirt' };
const WATER = { tile: 2, mat: 'water-shallow' };
const DEEP = { tile: 2, mat: 'water-deep' };
const RUBBLE = { tile: 3 };

// ---------- the ravine and the cave mouth (west) ----------
b.rooms2('Ravine mouth', [[1, 22, 9, 12], [10, 25, 4, 6]], {
  mat: 'dirt',
  readAloud: 'The ravine narrows to a black cave mouth. Goblin tracks crowd the mud, and a crude totem of skulls leans by the entrance.',
  gmNotes: 'Two hidden snares on the path (DC 12 Perception to spot; DC 12 Dex save or restrained). The totem is a warning to other tribes, nothing more.',
  label: [5, 27],
});
b.paint(1, 22, 3, 12, { mat: 'grass' });
b.start(2, 27, 2, 2);
b.prop('boulder-large', 2, 23); b.prop('bush', 7, 22); b.prop('thorn-bush', 1, 31); b.prop('boulder', 8, 32);
b.prop('ferns', 4, 33); b.prop('grass-tall', 2, 30); b.prop('skull-pile', 11, 25); b.prop('banner-pole', 12, 30);
b.prop('trap-bear', 8, 27, { gm: true }); b.prop('trap-tripwire', 10, 28, { gm: true });

// ---------- watch post ----------
b.cave('Watch post', 19, 27, 5, 4, {
  readAloud: 'Smoke from a low fire stings your eyes. Something chitters in the dark beyond, and a gong made from a shield hangs on a post.',
  gmNotes: 'If a goblin bangs the shield-gong, the feasting cave is alerted and arrives in 3 rounds.',
});
b.hall(13, 28, 15, 28, { w: 2 });
b.prop('campfire', 19, 27); b.prop('crate', 16, 25); b.prop('barrel', 22, 25); b.prop('bedroll', 21, 29); b.prop('temple-bell', 17, 30);
b.prop('weapon-barrel', 23, 28); b.prop('sack', 15, 29);
b.encounter('Watch post', [14, 23, 11, 9], [['goblin-warrior', 3]], 'easy');

// ---------- north: bat roost and the den ----------
b.tunnel(19, 24, 15, 14, { w: 2 });
b.cave('Bat roost', 15, 11, 5, 4, {
  readAloud: 'The ceiling is lost in darkness and the floor is slick with droppings. Hundreds of small shapes stir overhead.',
  gmNotes: 'Loud noise sends the swarms down. The droppings are slippery: DC 10 Dex save when dashing or fall prone. A dead adventurer lies under the guano with a backpack (rope, 3 days of rations, a potion of healing).',
});
b.prop('stalactites', 13, 9); b.prop('stalactites', 17, 12); b.prop('stalagmites', 12, 12); b.prop('skeleton-lying', 18, 9); b.prop('backpack', 17, 9);
b.prop('mud-patch', 14, 12);
b.encounter('Bat roost', [10, 7, 11, 9], [['swarm-of-bats', 2]], 'easy');

b.tunnel(19, 11, 26, 10, { w: 2 });
b.cave('The den', 33, 10, 7, 6, {
  readAloud: 'Bedrolls and stolen blankets ring the cave. A cold stream cuts across the floor, and the whole place reeks of goblin.',
  gmNotes: 'The stream is shallow (difficult terrain). Sleeping goblins wake on any noise louder than a whisper. Under the boss\'s bedroll: a pouch with 23 sp and a carved bone key that opens the prisoners\' hole.',
});
b.prop('bedroll', 29, 8); b.prop('bedroll', 30, 12, { rot: 90 }); b.prop('bedroll', 27, 10); b.prop('bedroll', 37, 7); b.prop('bedroll', 38, 13, { rot: 90 });
b.prop('crate-pile', 30, 5); b.prop('sack', 32, 14); b.prop('bones', 36, 14); b.prop('loot-sacks', 39, 10); b.prop('torch-sconce', 31, 6);
b.prop('key-ring', 38, 13);
b.encounter('Sleeping den', [26, 4, 15, 13], [['goblin-warrior', 4], ['goblin-minion', 4]], 'medium');


// ---------- bugbear's nook (north-east), off the den ----------
b.hall(40, 9, 46, 9, { vFirst: false });
b.door(43, 9, 'e', 'closed', 'door-wood');
b.cave('Bugbear\'s nook', 50, 7, 4, 4, {
  readAloud: 'Furs and a heap of cracked bones fill this side cave. Someone big sleeps here, and has hung a goblin\'s ear on a string by the door.',
  gmNotes: 'A bugbear hired by the chief. It can be bribed (25 gp or a magic item) to sit the fight out. Its strongbox (DC 13 to pick) holds 60 gp, a silver locket (25 gp) and a spell scroll of sleep.',
});
b.prop('rug-pelt', 49, 6); b.prop('bone-heap', 52, 8); b.prop('strongbox', 53, 5); b.prop('spell-scroll', 53, 6); b.prop('candles', 47, 8);
b.encounter('The bugbear', [45, 3, 10, 9], [['bugbear', 1]], 'medium');

// ---------- shaman's hollow, east of the den ----------
b.tunnel(40, 13, 50, 17, { w: 2 });
b.cave('Shaman\'s hollow', 55, 18, 5, 4, {
  readAloud: 'Glowing fungus lights a ring of painted stones. A crude idol of a grinning god stands over a bowl of something dark.',
  gmNotes: 'The goblin shaman uses the stats of a cultist with a few tricks. The idol\'s eyes are two garnets (50 gp each). The bowl holds 2 potions of healing in clay jars. The rune stone by the idol is a glyph trap (DC 13 Investigation; 2d8 fire, DC 13 Dex save halves).',
});
b.prop('idol', 56, 16); b.prop('offering-bowl', 56, 18); b.prop('glowing-fungus', 52, 17); b.prop('glowing-fungus', 59, 20); b.prop('rune-stone', 54, 19);
b.prop('glyph-trap', 55, 17, { gm: true }); b.prop('potion-set', 58, 17); b.prop('cauldron-tripod', 53, 20); b.prop('herbs-drying', 57, 21);
b.encounter('The shaman', [50, 14, 11, 9], [['cultist', 1], ['goblin-minion', 3]], 'medium');

// ---------- smithy and armory ----------
b.tunnel(55, 22, 50, 27, { w: 2 });
b.room('Smithy', 44, 24, 8, 6, {
  mat: 'stone-flagstone-warm',
  readAloud: 'A forge glows red against the back wall. Racks of crude spears and hammered shields line the walls, and the anvil still rings faintly.',
  gmNotes: 'Two goblins work the forge with a hobgoblin smith overseeing them. A finished +1 scimitar (magic sword) rests on the rack, made from stolen dwarven steel.',
});
b.prop('forge', 45, 24); b.prop('anvil', 48, 25); b.prop('weapon-rack', 50, 24); b.prop('gear-pile', 46, 28); b.prop('magic-sword', 50, 28); b.prop('grindstone', 48, 28);
b.prop('ore-pile', 44, 27); b.prop('tool-wall', 49, 29);
b.encounter('The smithy', [44, 24, 8, 6], [['hobgoblin', 1], ['goblin-warrior', 2]], 'medium');

// ---------- worg kennels ----------
b.tunnel(52, 27, 60, 30, { w: 2 });
b.cave('Worg kennels', 63, 29, 5, 4, {
  readAloud: 'Gnawed bones and chains litter a straw-strewn cave. Yellow eyes turn toward you from the dark.',
  gmNotes: 'A lever by the east wall raises the portcullis into the chief\'s hall. The handler carries a whistle that calms the worgs (DC 13 Animal Handling with it).',
});
b.prop('straw-bed', 61, 28); b.prop('straw-bed', 65, 33); b.prop('wall-chains', 66, 29); b.prop('bones', 62, 32); b.prop('bone-heap', 64, 27); b.prop('lever', 67, 31);
b.prop('water-trough', 60, 32);
b.encounter('Worg kennels', [58, 25, 11, 11], [['worg', 2], ['goblin-warrior', 1]], 'hard');

// ---------- the old warren's south half: feasting cave, wolf pen, grotto ----------
b.tunnel(24, 28, 30, 29, { w: 2 });
b.cave('Feasting cave', 39, 34, 7, 4, {
  readAloud: 'Long trestle tables sag under bones and spilled ale. A spitted boar turns over a fire pit, and the stream gurgles past the far end.',
  gmNotes: 'Most of the tribe eats here at dusk. The jailer, a fat goblin with a ring of keys, sits by the barrels: his keys open the prisoners\' hole and the chief\'s side door.',
});
b.prop('campfire-spit', 41, 32); b.prop('table-trestle', 38, 30); b.prop('table-trestle', 43, 34); b.prop('bench-long', 38, 31); b.prop('barrel-group', 46, 30);
b.prop('keg-rack', 45, 35); b.prop('bones', 40, 35); b.prop('cauldron', 36, 33); b.prop('torch-standing', 44, 29); b.prop('torch-standing', 37, 35);
b.prop('sack', 47, 33);
b.encounter('The feast', [31, 30, 17, 10], [['goblin-warrior', 4], ['goblin-minion', 6], ['hobgoblin', 1]], 'hard');

b.tunnel(19, 31, 17, 38, { w: 2 });
b.cave('Wolf pen', 16, 42, 5, 4, {
  readAloud: 'A ring of sharpened stakes fences off a pit of churned mud. Two lean wolves pace on short chains.',
  gmNotes: 'The wolves are chained; they reach anyone within 3 squares of the pen\'s middle. A cage holds a half-starved halfling scout who knows about the sealed dwarven vault behind the grotto.',
});
b.prop('cage', 19, 40); b.prop('wall-chains', 14, 41); b.prop('bones', 17, 44); b.prop('cheval-de-frise', 12, 42); b.prop('mud-patch', 15, 42);
b.encounter('Wolf pen', [11, 38, 11, 9], [['wolf', 2]], 'medium');

b.tunnel(12, 44, 7, 46, { w: 2 });
b.cave('Mushroom grotto', 6, 47, 4, 5, {
  readAloud: 'Pale mushrooms as tall as a man glow blue in the dark. Sticky threads glint between them.',
  gmNotes: 'Webs here are difficult terrain; a giant spider hunts from the ceiling. The north wall hides a secret door into a sealed dwarven vault (DC 15 Perception: a carved rune under the moss).',
});
b.prop('mushroom-giant', 3, 44); b.prop('mushrooms', 8, 50); b.prop('glowing-fungus', 5, 49); b.prop('spider-web', 4, 47, { gm: false }); b.prop('crystal-cluster', 2, 50);
b.prop('skeleton-lying', 7, 44);
b.encounter('Web lurker', [1, 42, 10, 11], [['giant-spider', 1]], 'hard');

// ---------- prisoners' hole ----------
b.hall(17, 45, 17, 48);
b.door(17, 47, 's', 'locked', 'door-iron');
b.room('Prisoners\' hole', 15, 49, 9, 5, {
  mat: 'dirt',
  readAloud: 'Iron cages hang from the ceiling over a stinking pit. Someone inside one of them whispers for help.',
  gmNotes: 'Three captives: a merchant (offers 50 gp reward), his guard (a guard stat block, will fight once armed) and a goblin outcast who will draw a map of the warren for freedom.',
});
b.prop('cage-hanging', 16, 50); b.prop('cage-hanging', 19, 50); b.prop('cage', 22, 51); b.prop('stocks', 17, 52); b.prop('pit-deep', 20, 52, { gm: false });
b.prop('lantern-hook', 15, 49);

// ---------- underground river and the sump ----------
b.tunnel(41, 37, 37, 42, { w: 2 });
b.cave('Underground river', 34, 44, 7, 4, {
  readAloud: 'The stream widens into a fast, black river that roars away under a low arch. A rope bridge sways across it.',
  gmNotes: 'Deep water: DC 12 Athletics to swim across or be swept 3 squares downstream. The rope bridge holds one creature at a time.',
});
b.paint(32, 40, 6, 9, DEEP);
b.prop('bridge-rope', 34, 42, { rot: 90 }); b.prop('rowboat', 30, 46); b.prop('reeds', 38, 47); b.prop('fishing-net', 28, 43);
b.encounter('River lurker', [27, 40, 15, 9], [['giant-frog', 2], ['crocodile', 1]], 'medium');

b.tunnel(36, 47, 41, 51, { w: 2 });
b.cave('The sump', 44, 51, 5, 3, {
  readAloud: 'Water pools in a sunken cave thick with mist. Something glitters at the bottom of the pool.',
  gmNotes: 'The pool hides a drowned adventurer\'s pack (DC 12 Athletics to dive): a wand of magic missiles with 3 charges and 15 gp.',
});
b.paint(42, 50, 5, 3, DEEP);
b.prop('wand', 44, 51); b.prop('obscuring-cloud', 46, 49, { v: 2 });

// ---------- the sealed dwarven vault (secret, behind the grotto) ----------
b.room('Dwarven vault', 2, 35, 8, 3, {
  mat: 'stone-cobble',
  readAloud: 'Square-cut walls and old rune-marks: dwarves sealed this room long before the goblins came.',
  gmNotes: 'The goblins don\'t know it exists. A dwarven lockbox (DC 15 to pick, or the rune word carved on the door) holds 2 gems (50 gp each) and a map of the old mine below the warren. The rack of old dwarven gear holds a +1 shield.',
});
b.hall(5, 38, 5, 42);
b.door(5, 38, 'n', 'secret');
b.prop('coffer', 8, 35); b.prop('lantern-standing', 2, 35, { off: true }); b.prop('gear-pile', 3, 36); b.prop('rune-stone', 6, 36);

// ---------- the old mine (the back way to the chief) ----------
b.hall(48, 52, 56, 52, { w: 2 });
b.rooms2('Collapsed mine', [[56, 45, 10, 9], [52, 48, 4, 4]], {
  mat: 'dirt',
  readAloud: 'Rotten timbers prop up a sagging ceiling. Rails run into the dark, and a mine cart sits tipped on its side.',
  gmNotes: 'The ledge along the north edge is crumbling (DC 12 Dex save or fall 10 ft into the sinkhole). The cart can be pushed along the rails as cover. Loud noise brings down the ceiling in the marked spot (4d6 bludgeoning, DC 13 Dex save halves).',
});
b.prop('mine-rails', 57, 50); b.prop('mine-rails', 58, 50); b.prop('mine-rails', 59, 50); b.prop('mine-cart', 60, 50); b.prop('mine-support', 57, 46); b.prop('mine-support', 62, 46);
b.prop('crumbling-ledge', 59, 45, { gm: false }); b.prop('sinkhole', 63, 48); b.prop('pickaxes', 56, 52); b.prop('ore-pile', 64, 52);
b.prop('trap-ceiling-collapse', 52, 48, { gm: true });
b.encounter('Mine crawlers', [52, 45, 14, 9], [['giant-spider', 1], ['swarm-of-rats', 2]], 'medium');

// ---------- chief's hall ----------
b.tunnel(48, 34, 54, 38, { w: 2 });
b.rooms2('Chief\'s hall', [[53, 36, 12, 7]], {
  mat: 'stone-flagstone-warm',
  readAloud: 'A throne of lashed bones and shields faces you across a stolen rug. Braziers smoke on either side, and war banners hang from the ceiling.',
  gmNotes: 'The goblin boss fights from the throne dais and flees through the secret door behind it at half hit points. The front is reached from the feasting cave, the portcullis on the east wall opens from the worg kennels\' lever, and the mine path comes up at the south-east corner.',
  label: [58, 39],
});
b.door(54, 38, 'w', 'closed', 'door-double');
b.prop('throne', 63, 39); b.prop('rug', 59, 38, { rot: 90 }); b.prop('brazier', 61, 37); b.prop('brazier', 61, 41); b.prop('war-banner', 55, 36); b.prop('war-banner', 55, 42);
b.prop('shield-wall', 58, 36); b.prop('treasure-pile', 64, 41); b.prop('chest', 63, 37); b.prop('weapon-rack', 57, 42);
// portcullis from the kennels
b.hall(63, 31, 63, 35);
b.door(63, 35, 's', 'locked', 'portcullis');
// mine path into the hall's south-east corner
b.hall(62, 43, 62, 44);
b.door(62, 43, 's', 'closed', 'door-wood');
b.encounter('The chief', [53, 36, 12, 7], [['goblin-boss', 1], ['goblin-warrior', 3], ['hobgoblin', 1]], 'deadly', 'on-door-open');

// the hidden hoard behind the throne
b.hall(65, 39, 67, 39);
b.door(65, 39, 'e', 'secret');
b.room('The chief\'s hoard', 68, 36, 3, 7, {
  readAloud: 'Coins, crowns and stolen silver are heaped in a narrow crack in the rock. A fine chest sits on top, almost too neat.',
  gmNotes: 'The neat chest is a mimic. The real hoard: 340 sp, 85 gp, a silver chalice (75 gp), a magic cloak (cloak of protection) and a potion of climbing.',
});
b.prop('coins-large', 68, 37); b.prop('mimic-chest', 69, 40); b.prop('chalices', 68, 41); b.prop('magic-cloak', 70, 36); b.prop('potion-healing', 70, 42);
b.encounter('Hoard guardian', [68, 36, 3, 7], [['mimic', 1]], 'medium', 'on-door-open');

// keep the smithy its own room: a rock lip along its south side with one doorway into the feasting cave
b.room('Smithy', 44, 24, 8, 6, { mat: 'stone-flagstone-warm' });
b.rooms.pop();
b.fill(43, 30, 10, 1);
b.fill(43, 24, 1, 7);
b.hall(46, 30, 46, 31);
b.door(46, 30, 'n', 'open', 'door-wood');

// a few lights and odds along the tunnels
b.prop('torch-sconce', 26, 28); b.prop('torch-sconce', 45, 15); b.prop('torch-sconce', 53, 29); b.prop('torch-sconce', 49, 36);
b.prop('rubble-pile', 22, 18); b.prop('bones', 44, 14); b.prop('stalagmites', 29, 33); b.prop('caltrops', 50, 36, { gm: true });
b.paint(22, 16, 2, 3, RUBBLE);

// the stream: wherever its line crosses open floor (the den, the feasting cave, the river), it shows as shallow water
for (let y = 2; y < 54; y++) {
  const x = 34 + Math.round(Math.sin(y / 4) * 1.5);
  for (const xx of [x, x + 1]) if (b.at(xx, y) === 1) b.set(xx, y, WATER);
}

b.note(2, 27, 'Goblins post a lookout on the ravine rim by day: a stealthy party can avoid the watch post fight entirely.', true);
b.note(5, 39, 'Secret door (DC 15 Perception: a carved rune under the moss) into the sealed dwarven vault.', true);

// odds and ends so the caves don't feel swept
b.scatter(['bones', 'rubble-pile', 'stalagmites'], 3, [11, 8, 9, 7]);
b.scatter(['mushrooms', 'glowing-fungus', 'stalagmites'], 4, [1, 42, 9, 11]);
b.scatter(['bones', 'sack', 'crate'], 3, [27, 5, 13, 11]);
b.scatter(['bones', 'mud-patch'], 3, [12, 38, 9, 8]);
b.scatter(['rubble-pile', 'mine-support', 'crate'], 4, [56, 46, 9, 7]);
b.scatter(['reeds', 'mud-patch'], 3, [28, 40, 13, 9]);
b.scatter(['candles', 'bones'], 2, [58, 25, 9, 8]);
b.scatter(['torch-standing'], 2, [53, 36, 12, 7]);
b.scatter(['grass-tall', 'bush', 'boulder'], 4, [1, 22, 8, 12]);
void DIRT;
// set dressing that landed on rock (cave walls wobble) moves to the nearest open square in its room
{
  const taken = new Set(b.props.map((p) => `${p.x},${p.y}`));
  for (const p of b.props) {
    if (b.floor(p.x, p.y)) continue;
    let best: [number, number] | undefined, bd = 99;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const x = p.x + dx, y = p.y + dy, d = Math.abs(dx) + Math.abs(dy);
      if (d < bd && b.at(x, y) === 1 && !taken.has(`${x},${y}`)) { bd = d; best = [x, y]; }
    }
    if (best) { taken.delete(`${p.x},${p.y}`); [p.x, p.y] = best; taken.add(`${p.x},${p.y}`); }
  }
}
b.save({
  description: 'A goblin tribe\'s whole hillside cave system: a ravine approach and watch post, a bat roost, the sleeping den on an underground stream, the feasting cave, a shaman\'s hollow, a smithy, worg kennels, a wolf pen, the prisoners\' hole, an underground river, an old dwarven mine and the chief\'s hall with a hidden hoard. Three routes lead to the chief.',
  setting: 'cave',
  tags: ['cave', 'goblins', 'starter', 'large'],
});

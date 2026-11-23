// Makes the outdoor sample maps in public/library/maps from the map maker, with fixed seeds, and lists
// them in public/library/index.json (marked "generated", so import_library.py keeps them).
// Usage: npx tsx scripts/make_outdoor_samples.mts
import { writeFileSync, readFileSync } from 'node:fs';
import { outdoorMap, type Biome, type OutdoorSize } from '../src/engine/outdoor';
import { packMap } from '../src/net/pack';
import { quickDungeon, findRooms } from '../src/engine/stamp';

const SAMPLES: { id: string; biome: Biome; size: OutdoorSize; seed: number; setting: string; tags: string[]; description: string }[] = [
  { id: 'outdoor-forest-small', biome: 'forest', size: 'small', seed: 11, setting: 'wilderness', tags: ['outdoor', 'forest', 'small'], description: 'A small wood with a stream, a track and a clearing: a quick ambush or a camp at dusk.' },
  { id: 'outdoor-village-medium', biome: 'village', size: 'medium', seed: 23, setting: 'town', tags: ['outdoor', 'village', 'town', 'medium'], description: 'A village on a river: houses along the roads, an inn and chapel on the green, fields and a bridge.' },
  { id: 'outdoor-coast-medium', biome: 'coast', size: 'medium', seed: 5, setting: 'wilderness', tags: ['outdoor', 'coast', 'sea', 'medium'], description: 'Sea, surf and sand below the cliffs, with a fishing jetty and the land behind.' },
  { id: 'outdoor-mountains-medium', biome: 'mountains', size: 'medium', seed: 8, setting: 'wilderness', tags: ['outdoor', 'mountains', 'pass', 'medium'], description: 'A road through a mountain pass, cliffs and scree above, pines lower down.' },
  { id: 'outdoor-jungle-large', biome: 'jungle', size: 'large', seed: 7, setting: 'wilderness', tags: ['outdoor', 'jungle', 'temple', 'large'], description: 'Deep rainforest cut by a brown river, with an overgrown step temple and an expedition camp.' },
  { id: 'outdoor-fungus-medium', biome: 'fungus', size: 'medium', seed: 7, setting: 'wilderness', tags: ['outdoor', 'alien', 'fungus', 'medium'], description: 'An alien grove of glowing mushroom towers, spore vents and crystal rings around violet pools. Dim light.' },
  { id: 'outdoor-desert-huge', biome: 'desert', size: 'huge', seed: 3, setting: 'wilderness', tags: ['outdoor', 'desert', 'huge'], description: 'A thousand feet of dunes and cracked flats, mesas, an oasis and buried ruins.' },
  { id: 'outdoor-swamp-medium', biome: 'swamp', size: 'medium', seed: 6, setting: 'wilderness', tags: ['outdoor', 'swamp', 'bog', 'medium'], description: 'A fen of black water and bog: stilt huts on boardwalks, mangroves, will-o-wisps and a drowned statue.' },
  { id: 'outdoor-swamp-large', biome: 'swamp', size: 'large', seed: 14, setting: 'wilderness', tags: ['outdoor', 'swamp', 'bog', 'large'], description: 'A wide marsh cut by a channel, with a witch\'s hut on the one dry hump and bog folk in stilt huts.' },
  { id: 'outdoor-winter-medium', biome: 'winter', size: 'medium', seed: 5, setting: 'wilderness', tags: ['outdoor', 'winter', 'snow', 'ice', 'medium'], description: 'Snowfields and a frozen lake with thin ice, a hunters\' camp with a yurt and sled, and a half-buried tomb.' },
  { id: 'outdoor-winter-pass-large', biome: 'winter', size: 'large', seed: 2, setting: 'wilderness', tags: ['outdoor', 'winter', 'mountains', 'pass', 'large'], description: 'A frozen mountain pass: an icy river, snowy firs, ice spikes on the heights and a cave into the mountain.' },
  { id: 'outdoor-forest-large', biome: 'forest', size: 'large', seed: 21, setting: 'wilderness', tags: ['outdoor', 'forest', 'large'], description: 'Old deep woods with giant trees, a barrow mound, a fairy ring, wisps, ruins and a cave under the roots.' },
  { id: 'outdoor-village-large', biome: 'village', size: 'large', seed: 9, setting: 'town', tags: ['outdoor', 'village', 'town', 'farm', 'large'], description: 'A market town on a river: watermill, orchard, granaries, a smithy, pens and pumpkin patches round the edge.' },
  { id: 'outdoor-village-small', biome: 'village', size: 'small', seed: 4, setting: 'town', tags: ['outdoor', 'village', 'hamlet', 'small'], description: 'A small hamlet by a stream: a few houses, a watermill, a kiln and a pen. Good for a quick stop.' },
  { id: 'outdoor-coast-large', biome: 'coast', size: 'large', seed: 12, setting: 'wilderness', tags: ['outdoor', 'coast', 'sea', 'lighthouse', 'large'], description: 'A long shore with a lighthouse on the point, a wreck on the sandbar, sea stacks and tide pools.' },
  { id: 'outdoor-desert-small', biome: 'desert', size: 'small', seed: 9, setting: 'wilderness', tags: ['outdoor', 'desert', 'oasis', 'small'], description: 'An oasis with mud-brick houses, a stone arch and old columns in the sand.' },
  { id: 'outdoor-mountains-large', biome: 'mountains', size: 'large', seed: 15, setting: 'wilderness', tags: ['outdoor', 'mountains', 'pass', 'large'], description: 'A long mountain pass with a watchtower, a barrow in the valley and a cave mouth on the heights.' },
  { id: 'outdoor-jungle-small', biome: 'jungle', size: 'small', seed: 3, setting: 'wilderness', tags: ['outdoor', 'jungle', 'small'], description: 'A patch of jungle by a muddy river, with a temple clearing and totems in the trees.' },
  { id: 'outdoor-fungus-large', biome: 'fungus', size: 'large', seed: 10, setting: 'wilderness', tags: ['outdoor', 'alien', 'fungus', 'crater', 'large'], description: 'A huge alien grove: crystal trees, monoliths, glowing pools and a fresh crater where something fell.' },
  { id: 'outdoor-region-medium', biome: 'region', size: 'medium', seed: 17, setting: 'region', tags: ['outdoor', 'region', 'world map', 'medium'], description: 'A smaller land at a mile a square: a coast, a range, forests and a handful of towns.' },
  { id: 'outdoor-region-huge', biome: 'region', size: 'huge', seed: 4, setting: 'region', tags: ['outdoor', 'region', 'world map', 'huge'], description: 'A whole land, one square a mile: sea, mountains, forests, rivers, towns and the roads between them.' },
];

const idxPath = 'public/library/index.json';
const index = JSON.parse(readFileSync(idxPath, 'utf8'));
index.maps = index.maps.filter((m: { generated?: boolean }) => !m.generated);
for (const s of SAMPLES) {
  const m = outdoorMap(s.biome, s.size, s.seed);
  m.id = s.id;
  const text = JSON.stringify(packMap(m));
  writeFileSync(`public/library/maps/${s.id}.json`, text);
  index.maps.push({
    id: s.id, name: m.name, cols: m.cols, rows: m.rows, ambient: m.ambient ?? 'bright', description: s.description, setting: s.setting, tags: s.tags,
    rooms: 0, encounters: 0, size: s.size, ...(m.scale ? { scale: m.scale } : {}), generated: true,
  });
  console.log(`${s.id}: ${m.cols}x${m.rows}, ${m.props.length} things, ${(text.length / 1024).toFixed(0)} KB`);
}
// indoor samples from the quick dungeon maker
const DUNGEONS: { id: string; name: string; size: 'small' | 'medium' | 'large'; seed: number; tags: string[]; description: string }[] = [
  { id: 'quick-dungeon-small', name: 'The Sunken Vaults', size: 'small', seed: 12, tags: ['dungeon', 'indoor', 'small'], description: 'A small dungeon of stone halls: storerooms, a shrine and a vault at the end.' },
  { id: 'quick-dungeon-medium', name: 'Halls of the Iron Warden', size: 'medium', seed: 31, tags: ['dungeon', 'indoor', 'medium'], description: 'A full dungeon level: barracks, a library, a crypt, a mess hall and a guarded vault.' },
  { id: 'quick-dungeon-large', name: 'The Deep Keep', size: 'large', seed: 47, tags: ['dungeon', 'indoor', 'large'], description: 'A big delve for a whole session: many rooms, a lair, a ritual chamber and the vault below.' },
];
for (const d of DUNGEONS) {
  const m = quickDungeon(d.size, d.seed);
  m.id = d.id; m.name = d.name;
  const text = JSON.stringify(packMap(m));
  writeFileSync(`public/library/maps/${d.id}.json`, text);
  index.maps.push({ id: d.id, name: d.name, cols: m.cols, rows: m.rows, ambient: m.ambient ?? 'dark', description: d.description, setting: 'dungeon', tags: d.tags, rooms: findRooms(m).length, encounters: 0, size: d.size, generated: true });
  console.log(`${d.id}: ${m.cols}x${m.rows}, ${m.props.length} things, ${(text.length / 1024).toFixed(0)} KB`);
}
writeFileSync(idxPath, JSON.stringify(index, null, 1));

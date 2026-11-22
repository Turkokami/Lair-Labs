// Makes the outdoor sample maps in public/library/maps from the map maker, with fixed seeds, and lists
// them in public/library/index.json (marked "generated", so import_library.py keeps them).
// Usage: npx tsx scripts/make_outdoor_samples.mts
import { writeFileSync, readFileSync } from 'node:fs';
import { outdoorMap, type Biome, type OutdoorSize } from '../src/engine/outdoor';
import { packMap } from '../src/net/pack';

const SAMPLES: { id: string; biome: Biome; size: OutdoorSize; seed: number; setting: string; tags: string[]; description: string }[] = [
  { id: 'outdoor-forest-small', biome: 'forest', size: 'small', seed: 11, setting: 'wilderness', tags: ['outdoor', 'forest', 'small'], description: 'A small wood with a stream, a track and a clearing: a quick ambush or a camp at dusk.' },
  { id: 'outdoor-village-medium', biome: 'village', size: 'medium', seed: 23, setting: 'town', tags: ['outdoor', 'village', 'town', 'medium'], description: 'A village on a river: houses along the roads, an inn and chapel on the green, fields and a bridge.' },
  { id: 'outdoor-coast-medium', biome: 'coast', size: 'medium', seed: 5, setting: 'wilderness', tags: ['outdoor', 'coast', 'sea', 'medium'], description: 'Sea, surf and sand below the cliffs, with a fishing jetty and the land behind.' },
  { id: 'outdoor-mountains-medium', biome: 'mountains', size: 'medium', seed: 8, setting: 'wilderness', tags: ['outdoor', 'mountains', 'pass', 'medium'], description: 'A road through a mountain pass, cliffs and scree above, pines lower down.' },
  { id: 'outdoor-jungle-large', biome: 'jungle', size: 'large', seed: 7, setting: 'wilderness', tags: ['outdoor', 'jungle', 'temple', 'large'], description: 'Deep rainforest cut by a brown river, with an overgrown step temple and an expedition camp.' },
  { id: 'outdoor-fungus-medium', biome: 'fungus', size: 'medium', seed: 7, setting: 'wilderness', tags: ['outdoor', 'alien', 'fungus', 'medium'], description: 'An alien grove of glowing mushroom towers, spore vents and crystal rings around violet pools. Dim light.' },
  { id: 'outdoor-desert-huge', biome: 'desert', size: 'huge', seed: 3, setting: 'wilderness', tags: ['outdoor', 'desert', 'huge'], description: 'A thousand feet of dunes and cracked flats, mesas, an oasis and buried ruins.' },
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
writeFileSync(idxPath, JSON.stringify(index, null, 1));

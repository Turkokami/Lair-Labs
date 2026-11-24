// Usage: npx vite-node scripts/check-adventure.ts src/adventures/<file>.ts [--map N]
// Prints every problem with the adventure in that file, and with --map N an ASCII picture of part N's map.
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkAdventure } from '../src/adventures/validate';
import { encounterXp, difficultyFor } from '../src/adventures/xp';
import type { Adventure } from '../src/adventures/types';

const file = process.argv[2];
const mapAt = process.argv.indexOf('--map');
const mod = await import(pathToFileURL(resolve(file)).href);
const adv = Object.values(mod).find((v: any) => v && typeof v === 'object' && Array.isArray(v.chapters)) as Adventure;
if (!adv) { console.log('No adventure export found in', file); process.exit(1); }
for (const [i, ch] of adv.chapters.entries()) {
  const m = ch.map();
  console.log(`Part ${i}: ${ch.title} (level ${ch.level}) map "${m.name}" ${m.cols}x${m.rows}, ${m.cells.filter((v) => v > 0).length} floor squares, ${m.rooms?.length ?? 0} areas, ${m.props.length} props`);
  for (const en of m.encounters ?? []) console.log(`   fight "${en.name}": ${encounterXp(en.monsters)} XP = ${difficultyFor(encounterXp(en.monsters), ch.level)} (says ${en.difficulty})`);
}
if (mapAt > 0) {
  const m = adv.chapters[Number(process.argv[mapAt + 1])].map();
  const g: string[][] = [];
  for (let y = 0; y < m.rows; y++) { g.push([]); for (let x = 0; x < m.cols; x++) { const v = m.cells[y * m.cols + x]; const mat = m.mats?.[y * m.cols + x]; g[y].push(v === 0 ? ' ' : v === 1 ? '.' : v === 2 ? '~' : v === 3 ? (mat === 'lava' ? 'L' : ':') : 'O'); } }
  for (const p of m.props) if (g[p.y]?.[p.x] !== undefined) g[p.y][p.x] = p.gmOnly ? 't' : '#';
  for (const k of Object.keys(m.doors)) { const [x, y] = k.split(':')[1].split(',').map(Number); if (g[y]?.[x] !== undefined) g[y][x] = 'D'; }
  (m.rooms ?? []).forEach((r, i) => { const [x, y] = r.labelAt ?? r.rects[0]; if (g[y]?.[x] !== undefined) g[y][x] = String.fromCharCode(65 + (i % 26)); });
  console.log(g.map((r) => r.join('')).join('\n'));
  (m.rooms ?? []).forEach((r, i) => console.log(String.fromCharCode(65 + (i % 26)), r.name));
}
const problems = checkAdventure(adv);
console.log(problems.length ? `\n${problems.length} PROBLEMS:\n- ${problems.join('\n- ')}` : '\nOK: no problems found.');
process.exit(problems.length ? 1 : 0);

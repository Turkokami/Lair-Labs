// Draws a library map to a PNG with the app's own map renderer, GM view with room names, so a map written in
// code can be looked at. Needs @napi-rs/canvas (install with --no-save; it isn't an app dependency).
// Usage: npx vite-node scripts/preview-map.ts <map id> <out.png> [scale]
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const napi: any = await import('@napi-rs/canvas');
import type { FloorArt } from '../src/render/scene';
import type { GameMap } from '../src/engine/map';
// the object art draws into canvases it makes with document.createElement
(globalThis as any).document = { createElement: () => napi.createCanvas(1, 1) };
const { drawScene, CELL } = await import('../src/render/scene');

const [id, out, sc] = process.argv.slice(2);
const root = resolve(__dirname, '..');
const map: GameMap = JSON.parse(readFileSync(resolve(root, `public/library/maps/${id}.json`), 'utf8'));
const idx = JSON.parse(readFileSync(resolve(root, 'public/library/index.json'), 'utf8'));
const imgs = new Map<string, unknown>();
const sq = new Map<string, number>();
for (const m of idx.materials) {
  sq.set(m.id, m.squares || 4);
  try { imgs.set(m.id, await napi.loadImage(readFileSync(resolve(root, `public/library/floors/${m.id}.webp`)))); } catch { /* fallback colour */ }
}
const floors: FloorArt = { image: (k: string) => imgs.get(k) as never, squares: (k: string) => sq.get(k) ?? 4 };
const s = Number(sc ?? 0.5);
const c = napi.createCanvas(Math.round(map.cols * CELL * s), Math.round(map.rows * CELL * s));
const g = c.getContext('2d');
g.scale(s, s);
drawScene(g, { map, role: 'gm', tokens: [], view: { x0: 0, y0: 0, x1: map.cols, y1: map.rows }, scale: s, floors, roomLabels: true });
// mark the player start and encounter areas
g.lineWidth = 6;
if (map.playerStart) { const [x, y, w, h] = map.playerStart; g.strokeStyle = '#3ad16a'; g.strokeRect(x * CELL, y * CELL, (w ?? 1) * CELL, (h ?? 1) * CELL); }
g.strokeStyle = 'rgba(230,60,60,0.8)';
g.setLineDash([18, 12]);
for (const e of map.encounters ?? []) { const [x, y, w, h] = e.area; g.strokeRect(x * CELL + 4, y * CELL + 4, w * CELL - 8, h * CELL - 8); }
writeFileSync(out, c.toBuffer('image/png'));
console.log(`wrote ${out}`);

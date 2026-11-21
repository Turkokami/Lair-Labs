// Section B of the object library: dungeon, crypt, temple, wizard and castle structures, light sources,
// traps, hazards and GM markers. All original art drawn in code with the Canvas 2D API.
// Top-down, light from the top-left, ink outline. Wall-mounted pieces (sconces, shelves, niches, the organ)
// put the wall along the TOP edge of their box (y = 0); the map rotates them to face other walls.
import type { ObjDef, G, SetId } from '../art/types';
import { SETS } from '../art/types';
import {
  rng, circle, ellipse, rr, poly, blob, lumpy, paint, domeFill, litFill, line, bevel, speckle, grain, board, planks,
  strap, rivet, stone, blocks, cloth, coins, gem, glow, flame, liquid, book, bottle, candle, scroll, ringPull,
  shade, mix, alpha, INK, LW, WOOD, METAL, STONE, CLOTH, vars,
} from '../art/kit';

const TAU = Math.PI * 2;
type R = () => number;
const ALL_SETS: SetId[] = [...SETS];
const TORCH = '#ff9a40';
const CANDLE = '#ffcf70';
const BONE = '#e4dcc4';
const TRAP_RED = '#e63946';

const STONES = vars('stone', { grey: STONE.grey, marble: STONE.marble, dark: STONE.dark, sand: STONE.sand }, { grey: 'Grey stone', marble: 'Marble', dark: 'Dark stone', sand: 'Sandstone' });

// ---------- local helpers ----------
function fireCols(fire: string): [string, string, string] {
  return fire.toLowerCase() === '#ffb02e' ? ['#fff3b0', '#ffb02e', '#e2481b'] : [mix(fire, '#ffffff', 0.75), fire, shade(fire, -0.45)];
}
function fireAt(g: G, cx: number, cy: number, r: number, rand: R, fire = '#ffb02e') {
  const [a, b, c] = fireCols(fire);
  flame(g, cx, cy, r, rand, a, b, c);
}
/** Stroke the current path twice, dark under and colour on top, so thin lines read on any floor. */
function inked(g: G, col: string, lw: number, under = INK) {
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.strokeStyle = under;
  g.lineWidth = lw + 2;
  g.stroke();
  g.strokeStyle = col;
  g.lineWidth = lw;
  g.stroke();
}
function ringAt(g: G, cx: number, cy: number, r: number, col: string, lw: number) {
  circle(g, cx, cy, r);
  g.strokeStyle = col;
  g.lineWidth = lw;
  g.stroke();
}
function dashed(g: G, col: string, lw: number, dash: number[] = [7, 5]) {
  g.setLineDash(dash);
  g.strokeStyle = col;
  g.lineWidth = lw;
  g.lineCap = 'butt';
  g.stroke();
  g.setLineDash([]);
}
/** A GM-only red dashed frame around a rect, so trap areas read at a glance. */
function trapFrame(g: G, x: number, y: number, w: number, h: number, col = TRAP_RED) {
  rr(g, x, y, w, h, 6);
  g.fillStyle = alpha(col, 0.1);
  g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.55)';
  g.lineWidth = 4.5;
  g.stroke();
  rr(g, x, y, w, h, 6);
  dashed(g, col, 3, [9, 6]);
}
/** A small rune: a spine and one or two branches on a 3x3 grid. */
function rune(g: G, cx: number, cy: number, s: number, rand: R, col: string, lw: number, rot = 0) {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  const P = (i: number) => [((i % 3) - 1) * s / 2, (Math.floor(i / 3) - 1) * s / 2];
  g.beginPath();
  g.moveTo(0, -s / 2);
  g.lineTo(0, s / 2);
  const n = 1 + Math.floor(rand() * 2);
  for (let k = 0; k < n; k++) {
    const a = P([1, 4, 7][Math.floor(rand() * 3)]), b = P([0, 2, 3, 5, 6, 8][Math.floor(rand() * 6)]);
    g.moveTo(a[0], a[1]);
    g.lineTo(b[0], b[1]);
  }
  g.strokeStyle = col;
  g.lineWidth = lw;
  g.lineCap = 'round';
  g.stroke();
  g.restore();
}
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }
/** Star polygon {n/k} on a circle. */
function starPath(g: G, cx: number, cy: number, r: number, n: number, k: number, rot = -Math.PI / 2) {
  g.beginPath();
  const d = gcd(n, k);
  for (let o = 0; o < d; o++) {
    for (let i = 0; i <= n / d; i++) {
      const idx = (o + i * k) % n, a = rot + (idx / n) * TAU;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
  }
}
/** A ritual circle: glow, double ring, rune band, star, inner ring. */
function magicCircle(g: G, cx: number, cy: number, R: number, col: string, glowCol: string, rand: R, points = 5) {
  const lw = Math.max(1.6, R / 50);
  const under = 'rgba(10,6,20,0.55)';
  glow(g, cx, cy, R * 1.12, glowCol, 0.38);
  circle(g, cx, cy, R);
  inked(g, col, lw * 1.2, under);
  circle(g, cx, cy, R * 0.9);
  inked(g, col, lw * 0.7, under);
  circle(g, cx, cy, R * 0.72);
  inked(g, col, lw, under);
  const nr = Math.max(8, Math.round(R / 9));
  for (let i = 0; i < nr; i++) {
    const a = (i / nr) * TAU;
    rune(g, cx + Math.cos(a) * R * 0.81, cy + Math.sin(a) * R * 0.81, R * 0.1, rand, col, lw * 0.55, a + Math.PI / 2);
  }
  const k = points === 4 ? 1 : points === 6 ? 2 : Math.floor((points - 1) / 2);
  starPath(g, cx, cy, R * 0.72, points, k);
  inked(g, col, lw * 0.9, under);
  for (let i = 0; i < points; i++) {
    const a = -Math.PI / 2 + (i / points) * TAU;
    circle(g, cx + Math.cos(a) * R * 0.72, cy + Math.sin(a) * R * 0.72, R * 0.045);
    paint(g, col, under, lw * 0.5);
  }
  circle(g, cx, cy, R * 0.26);
  inked(g, col, lw * 0.8, under);
  glow(g, cx, cy, R * 0.3, glowCol, 0.4);
}
/** Front-facing skull, simple and readable at small sizes. */
function skull(g: G, cx: number, cy: number, r: number, bone = BONE, rot = 0) {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  const lw = Math.max(0.7, r * 0.13);
  rr(g, -r * 0.5, r * 0.35, r, r * 0.6, r * 0.2);
  paint(g, shade(bone, -0.12), INK, lw);
  ellipse(g, 0, -r * 0.08, r, r * 0.88);
  paint(g, domeFill(g, 0, -r * 0.1, r, bone, 0.35), INK, lw);
  ellipse(g, -r * 0.38, r * 0.08, r * 0.26, r * 0.3);
  g.fillStyle = '#1a120c';
  g.fill();
  ellipse(g, r * 0.38, r * 0.08, r * 0.26, r * 0.3);
  g.fill();
  poly(g, [[0, r * 0.32], [-r * 0.12, r * 0.55], [r * 0.12, r * 0.55]]);
  g.fill();
  g.strokeStyle = alpha('#1a120c', 0.8);
  g.lineWidth = lw * 0.6;
  g.beginPath();
  for (let i = -1; i <= 1; i++) { g.moveTo(i * r * 0.18, r * 0.72); g.lineTo(i * r * 0.18, r * 0.92); }
  g.stroke();
  g.restore();
}
/** A long bone with knobbed ends. */
function boneAt(g: G, x1: number, y1: number, x2: number, y2: number, t: number, col = BONE) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, px = -dy / L, py = dx / L;
  line(g, x1, y1, x2, y2, INK, t + 2);
  for (const [x, y] of [[x1, y1], [x2, y2]]) {
    for (const s of [-1, 1]) {
      circle(g, x + px * t * 0.42 * s, y + py * t * 0.42 * s, t * 0.62);
      paint(g, col, INK, 0.8);
    }
  }
  line(g, x1, y1, x2, y2, col, t);
  line(g, x1 + dx * 0.15 - px * t * 0.2, y1 + dy * 0.15 - py * t * 0.2, x2 - dx * 0.15 - px * t * 0.2, y2 - dy * 0.15 - py * t * 0.2, 'rgba(255,255,255,0.35)', t * 0.3);
}
/** A chain of links from one point to another. */
function chain(g: G, x1: number, y1: number, x2: number, y2: number, metal: string, s = 4) {
  const L = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.round(L / (s * 1.7))), a = Math.atan2(y2 - y1, x2 - x1);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
    ellipse(g, x, y, s, i % 2 ? s * 0.4 : s * 0.62, a);
    if (i % 2) { g.fillStyle = shade(metal, -0.2); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); }
    else { g.strokeStyle = INK; g.lineWidth = 2.8; g.stroke(); g.strokeStyle = shade(metal, 0.2); g.lineWidth = 1.4; g.stroke(); }
  }
}
/** A dressed stone plinth with a stepped top. */
function plinth(g: G, x: number, y: number, w: number, h: number, col: string, rand: R) {
  rr(g, x, y, w, h, 3);
  paint(g, litFill(g, x, y, w, h, col, 0.2), INK, LW);
  bevel(g, x, y, w, h, 3, 0.3);
  rr(g, x + 6, y + 6, w - 12, h - 12, 2);
  paint(g, litFill(g, x + 6, y + 6, w - 12, h - 12, shade(col, 0.06), 0.15), alpha(shade(col, -0.6), 0.7), 1.2);
  speckle(g, x + 3, y + 3, w - 6, h - 6, rand, Math.round((w * h) / 400), alpha(shade(col, -0.5), 0.35), 0.9);
}
/** Seven-segment style numeral 1-9, drawn as strokes (no fonts). */
const SEG: Record<number, string> = { 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function digit(g: G, n: number, cx: number, cy: number, s: number, col: string, lw: number) {
  const w = s * 0.56, x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - s / 2, ym = cy, y1 = cy + s / 2;
  const S: Record<string, number[]> = { a: [x0, y0, x1, y0], b: [x1, y0, x1, ym], c: [x1, ym, x1, y1], d: [x0, y1, x1, y1], e: [x0, ym, x0, y1], f: [x0, y0, x0, ym], g: [x0, ym, x1, ym] };
  g.beginPath();
  if (n === 1) {
    g.moveTo(cx - s * 0.16, y0 + s * 0.14); g.lineTo(cx + s * 0.04, y0); g.lineTo(cx + s * 0.04, y1);
    g.moveTo(cx - s * 0.18, y1); g.lineTo(cx + s * 0.26, y1);
  } else {
    for (const ch of SEG[n] ?? '') { const [a, b, c2, d] = S[ch]; g.moveTo(a, b); g.lineTo(c2, d); }
  }
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.strokeStyle = INK;
  g.lineWidth = lw + 3;
  g.stroke();
  g.strokeStyle = col;
  g.lineWidth = lw;
  g.stroke();
}
/** GM marker disc: soft halo, dashed ring and a solid centre to draw a symbol on. */
function gmBadge(g: G, cx: number, cy: number, r: number, col: string) {
  circle(g, cx, cy, r);
  g.fillStyle = alpha(col, 0.18);
  g.fill();
  circle(g, cx, cy, r);
  dashed(g, col, 3, [8, 5]);
  circle(g, cx, cy, r * 0.76);
  paint(g, domeFill(g, cx, cy, r * 0.76, col, 0.3), INK, 2.2);
}
/** A wall sconce with a burning torch. Wall along the top edge. */
function drawSconce(g: G, c: Record<string, string>, seed: number) {
  const r = rng(seed);
  rr(g, 36, 1, 28, 12, 3);
  paint(g, litFill(g, 36, 1, 28, 12, c.metal, 0.35), INK, 1.6);
  rivet(g, 41, 7, 2, c.metal);
  rivet(g, 59, 7, 2, c.metal);
  // arm and cup
  rr(g, 46, 10, 8, 24, 2);
  paint(g, litFill(g, 46, 10, 8, 24, c.metal, 0.35), INK, 1.4);
  // the torch handle, tilted out from the wall
  rr(g, 45, 26, 10, 22, 3);
  paint(g, litFill(g, 45, 26, 10, 22, c.wood, 0.25), INK, 1.4);
  circle(g, 50, 32, 9);
  paint(g, domeFill(g, 50, 32, 9, c.metal, 0.4), INK, 1.6);
  // wrapped head
  circle(g, 50, 52, 9);
  paint(g, '#3a2a1c', INK, 1.4);
  fireAt(g, 50, 54, 13, r, c.fire);
}
/** Lantern seen from above: square cap, glowing panes. */
function lanternTop(g: G, cx: number, cy: number, s: number, metal: string, light: string) {
  glow(g, cx, cy, s * 2.4, light, 0.5);
  rr(g, cx - s * 0.8, cy - s * 0.8, s * 1.6, s * 1.6, s * 0.25);
  paint(g, alpha(mix(light, '#ffffff', 0.4), 0.95), INK, 1.6);
  rr(g, cx - s * 0.62, cy - s * 0.62, s * 1.24, s * 1.24, s * 0.15);
  paint(g, litFill(g, cx - s * 0.62, cy - s * 0.62, s * 1.24, s * 1.24, metal, 0.35), INK, 1.4);
  g.beginPath();
  g.moveTo(cx - s * 0.62, cy - s * 0.62); g.lineTo(cx + s * 0.62, cy + s * 0.62);
  g.moveTo(cx + s * 0.62, cy - s * 0.62); g.lineTo(cx - s * 0.62, cy + s * 0.62);
  g.strokeStyle = alpha(shade(metal, -0.6), 0.8);
  g.lineWidth = 1;
  g.stroke();
  ringPull(g, cx, cy, s * 0.26, metal);
}

// ---------- the pieces our starter maps use ----------
const CORE_DUNGEON: ObjDef[] = [
  {
    id: 'pillar-round', name: 'Round pillar', cat: 'structure', sets: ['dungeon', 'temple', 'castle', 'crypt', 'wizard'], tags: ['column', 'pillar', 'support', 'stone'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { stone: STONE.grey }, variants: STONES,
    desc: 'A round stone column on a square foot.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 8, 8, 84, 84, 5);
      paint(g, litFill(g, 8, 8, 84, 84, shade(c.stone, -0.1), 0.2), INK, LW);
      bevel(g, 8, 8, 84, 84, 5, 0.3);
      circle(g, 50, 50, 38);
      paint(g, domeFill(g, 50, 50, 38, shade(c.stone, -0.15), 0.25), INK, 1.6);
      circle(g, 50, 50, 31);
      paint(g, domeFill(g, 50, 50, 31, c.stone, 0.42), INK, LW);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        line(g, 50 + Math.cos(a) * 25, 50 + Math.sin(a) * 25, 50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30, alpha(shade(c.stone, -0.6), 0.45), 1.1);
      }
      ringAt(g, 50, 50, 21, alpha(shade(c.stone, -0.55), 0.5), 1.2);
      speckle(g, 28, 28, 44, 44, r, 10, alpha(shade(c.stone, -0.5), 0.3), 0.9);
    },
  },
  {
    id: 'pillar-square', name: 'Square pillar', cat: 'structure', sets: ['dungeon', 'temple', 'castle', 'crypt', 'sewer'], tags: ['column', 'pillar', 'pier', 'support', 'stone'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { stone: STONE.grey }, variants: STONES,
    desc: 'A square stone pier with a stepped cap.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 7, 7, 86, 86, 3);
      paint(g, litFill(g, 7, 7, 86, 86, shade(c.stone, -0.12), 0.2), INK, LW);
      blocks(g, 9, 9, 82, 82, shade(c.stone, -0.1), r, 27, 14);
      rr(g, 7, 7, 86, 86, 3);
      g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
      rr(g, 17, 17, 66, 66, 2);
      paint(g, litFill(g, 17, 17, 66, 66, c.stone, 0.3), INK, LW);
      // chamfered cap facets
      g.beginPath();
      g.moveTo(17, 17); g.lineTo(30, 30); g.moveTo(83, 17); g.lineTo(70, 30);
      g.moveTo(83, 83); g.lineTo(70, 70); g.moveTo(17, 83); g.lineTo(30, 70);
      g.strokeStyle = alpha(shade(c.stone, -0.6), 0.6); g.lineWidth = 1.2; g.stroke();
      rr(g, 30, 30, 40, 40, 1);
      paint(g, litFill(g, 30, 30, 40, 40, shade(c.stone, 0.1), 0.25), alpha(shade(c.stone, -0.6), 0.8), 1.3);
      speckle(g, 30, 30, 40, 40, r, 6, alpha(shade(c.stone, -0.5), 0.3), 0.8);
    },
  },
  {
    id: 'statue', name: 'Statue', cat: 'decor', sets: ['dungeon', 'temple', 'castle', 'crypt', 'town'], tags: ['figure', 'monument', 'hero', 'sculpture'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { stone: STONE.grey, body: '#9c9890' },
    variants: [
      { name: 'Grey stone', c: {} },
      { name: 'Marble', c: { stone: STONE.marble, body: '#ebe7df' } },
      { name: 'Verdigris bronze', c: { stone: STONE.dark, body: '#5f9a84' } },
      { name: 'Gilded', c: { stone: STONE.dark, body: '#d9ab3e' } },
    ],
    desc: 'A robed figure resting both hands on a sword, on a plinth.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      plinth(g, 8, 8, 84, 84, c.stone, r);
      const b = c.body;
      // robe and shoulders
      blob(g, [[24, 46], [50, 34], [76, 46], [72, 74], [50, 80], [28, 74]]);
      paint(g, domeFill(g, 50, 54, 32, b, 0.3), INK, LW);
      g.save();
      blob(g, [[24, 46], [50, 34], [76, 46], [72, 74], [50, 80], [28, 74]]);
      g.clip();
      for (const x of [38, 50, 62]) line(g, x, 58, x + (x - 50) * 0.3, 82, alpha(shade(b, -0.5), 0.45), 1.4);
      g.restore();
      // sword, point down at the front of the plinth
      rr(g, 47.5, 64, 5, 26, 1.5);
      paint(g, litFill(g, 47, 64, 5, 26, shade(b, 0.25), 0.3), INK, 1.2);
      rr(g, 39, 61, 22, 5, 2);
      paint(g, shade(b, -0.1), INK, 1.2);
      // arms meeting at the hilt
      for (const s of [-1, 1]) {
        ellipse(g, 50 + s * 13, 56, 6, 11, s * -0.6);
        paint(g, domeFill(g, 50 + s * 13, 56, 10, b, 0.3), INK, 1.4);
      }
      circle(g, 50, 61, 5);
      paint(g, domeFill(g, 50, 61, 5, b, 0.35), INK, 1.3);
      // head
      circle(g, 50, 42, 11.5);
      paint(g, domeFill(g, 50, 42, 11.5, b, 0.45), INK, LW);
      g.beginPath();
      g.arc(50, 42, 8, Math.PI * 1.1, Math.PI * 1.9);
      g.strokeStyle = alpha(shade(b, -0.5), 0.6); g.lineWidth = 1.2; g.stroke();
    },
  },
  {
    id: 'altar', name: 'Altar', cat: 'religious', sets: ['temple', 'crypt', 'dungeon', 'castle'], tags: ['shrine', 'sacrifice', 'ritual', 'table'],
    w: 2, h: 1, blocksMovement: true, c: { stone: STONE.grey, cloth: CLOTH.red, trim: CLOTH.gold },
    variants: [
      { name: 'Stone, red cloth', c: {} },
      { name: 'Marble, white cloth', c: { stone: STONE.marble, cloth: CLOTH.white, trim: CLOTH.gold } },
      { name: 'Dark, bloodied', c: { stone: STONE.dark, cloth: CLOTH.black, trim: '#8a1c1c' }, f: { blood: 1 } },
      { name: 'Sandstone, blue cloth', c: { stone: STONE.sand, cloth: CLOTH.blue, trim: '#d8c48a' } },
    ],
    desc: 'A dressed stone altar with a runner cloth, candles and an offering bowl.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 8, 14, 184, 72, 4);
      paint(g, shade(c.stone, -0.2), INK, LW);
      blocks(g, 10, 16, 180, 68, shade(c.stone, -0.05), r, 30, 17);
      rr(g, 14, 18, 172, 62, 3);
      paint(g, litFill(g, 14, 18, 172, 62, c.stone, 0.22), INK, LW);
      bevel(g, 14, 18, 172, 62, 3, 0.3);
      // runner cloth over the front and back edge
      cloth(g, 78, 10, 44, 80, c.cloth, r, 2, 2);
      line(g, 82, 10, 82, 90, c.trim, 2.4);
      line(g, 118, 10, 118, 90, c.trim, 2.4);
      if (f.blood) {
        blob(g, lumpy(100, 50, 20, 0.5, 9, r, 14));
        paint(g, alpha('#6e0b0e', 0.85), null);
        for (let i = 0; i < 5; i++) { circle(g, 60 + r() * 80, 26 + r() * 48, 1.5 + r() * 3); g.fillStyle = alpha('#7a0d10', 0.85); g.fill(); }
      }
      // bowl
      circle(g, 100, 50, 12);
      paint(g, domeFill(g, 100, 50, 12, METAL.brass, 0.4), INK, 1.6);
      circle(g, 100, 50, 8);
      paint(g, f.blood ? '#5c0a0c' : shade(METAL.brass, -0.4), null);
      candle(g, 34, 34, 6, r);
      candle(g, 46, 62, 5, r);
      candle(g, 166, 34, 6, r);
      candle(g, 154, 62, 5, r);
    },
  },
  {
    id: 'coffin', name: 'Coffin', cat: 'religious', sets: ['crypt', 'dungeon', 'town', 'temple'], tags: ['casket', 'burial', 'vampire', 'undead', 'body'],
    w: 1, h: 2, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.iron },
    variants: [
      { name: 'Walnut', c: {} },
      { name: 'Oak', c: { wood: WOOD.oak } },
      { name: 'Black lacquer', c: { wood: WOOD.ebony, metal: METAL.silver } },
      { name: 'Open, with bones', c: {}, f: { open: 1 } },
    ],
    desc: 'A six-sided wooden coffin. One variant has the lid slid aside.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const shape = [[32, 10], [68, 10], [86, 56], [70, 190], [30, 190], [14, 56]];
      poly(g, shape);
      paint(g, litFill(g, 14, 10, 72, 180, c.wood, 0.2), INK, LW * 1.1);
      if (f.open) {
        const inner = shape.map(([x, y]) => [50 + (x - 50) * 0.8, 100 + (y - 100) * 0.92]);
        poly(g, inner);
        paint(g, '#1e130c', INK, 1.4);
        skull(g, 50, 38, 11, BONE);
        for (let i = 0; i < 4; i++) {
          g.beginPath();
          g.ellipse(50, 64 + i * 8, 15 - i, 4, 0, Math.PI * 0.05, Math.PI * 0.95);
          g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke();
          g.strokeStyle = BONE; g.lineWidth = 2; g.stroke();
        }
        line(g, 50, 58, 50, 96, BONE, 2.6);
        boneAt(g, 42, 104, 40, 160, 4.5);
        boneAt(g, 58, 104, 60, 160, 4.5);
        // lid slid off to the right, sticking out of the box a little
        g.save();
        g.translate(62, 120);
        g.rotate(0.12);
        poly(g, shape.map(([x, y]) => [(x - 50) * 0.92, (y - 100) * 0.7]));
        paint(g, litFill(g, -35, -70, 70, 140, shade(c.wood, 0.05), 0.2), INK, LW);
        g.restore();
        return;
      }
      g.save();
      poly(g, shape);
      g.clip();
      grain(g, 14, 10, 72, 180, c.wood, r, 'v', 7);
      g.restore();
      const lid = shape.map(([x, y]) => [50 + (x - 50) * 0.84, 100 + (y - 100) * 0.94]);
      poly(g, lid);
      g.strokeStyle = alpha(shade(c.wood, -0.6), 0.8);
      g.lineWidth = 1.6;
      g.stroke();
      // a raised cross on the lid
      rr(g, 46, 40, 8, 90, 2);
      paint(g, litFill(g, 46, 40, 8, 90, shade(c.wood, 0.12), 0.3), INK, 1.3);
      rr(g, 30, 62, 40, 8, 2);
      paint(g, litFill(g, 30, 62, 40, 8, shade(c.wood, 0.12), 0.3), INK, 1.3);
      for (const [x, y] of [[26, 30], [74, 30], [24, 170], [76, 170]]) rivet(g, x, y, 2.6, c.metal);
    },
  },
  {
    id: 'sarcophagus', name: 'Sarcophagus', cat: 'religious', sets: ['crypt', 'temple', 'dungeon', 'desert', 'castle'], tags: ['tomb', 'burial', 'mummy', 'effigy', 'king'],
    w: 1, h: 2, blocksMovement: true, c: { stone: STONE.grey },
    variants: [...STONES, { name: 'Lid ajar', c: {}, f: { open: 1 } }],
    desc: 'A stone tomb with a carved effigy on the lid. One variant has the lid pushed aside.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 8, 6, 84, 188, 5);
      paint(g, litFill(g, 8, 6, 84, 188, shade(c.stone, -0.15), 0.2), INK, LW * 1.1);
      if (f.open) {
        rr(g, 16, 14, 68, 172, 3);
        paint(g, '#15100c', INK, 1.4);
      }
      g.save();
      if (f.open) { g.translate(14, 6); g.rotate(0.06); }
      rr(g, 14, 12, 72, 176, 4);
      paint(g, litFill(g, 14, 12, 72, 176, c.stone, 0.25), INK, LW);
      bevel(g, 14, 12, 72, 176, 4, 0.3);
      const e = shade(c.stone, 0.12);
      // effigy: head, body, folded hands, feet
      blob(g, [[36, 58], [50, 52], [64, 58], [66, 120], [60, 168], [40, 168], [34, 120]]);
      paint(g, litFill(g, 34, 52, 32, 116, e, 0.3), alpha(shade(c.stone, -0.6), 0.9), 1.4);
      circle(g, 50, 40, 12);
      paint(g, domeFill(g, 50, 40, 12, e, 0.4), alpha(shade(c.stone, -0.6), 0.9), 1.5);
      poly(g, [[42, 32], [46, 24], [50, 30], [54, 24], [58, 32]]);
      paint(g, shade(e, 0.1), alpha(shade(c.stone, -0.6), 0.9), 1.1);
      ellipse(g, 50, 84, 10, 6);
      paint(g, shade(e, 0.08), alpha(shade(c.stone, -0.6), 0.9), 1.2);
      rr(g, 48, 88, 4, 40, 1.5);
      paint(g, shade(e, 0.18), alpha(shade(c.stone, -0.6), 0.9), 1);
      for (const x of [43, 57]) { ellipse(g, x, 170, 5, 7); paint(g, e, alpha(shade(c.stone, -0.6), 0.9), 1.1); }
      speckle(g, 16, 14, 68, 170, r, 18, alpha(shade(c.stone, -0.5), 0.3), 1);
      g.restore();
    },
  },
  {
    id: 'bones', name: 'Bones', cat: 'decor', sets: ['crypt', 'dungeon', 'cave', 'sewer', 'desert'], tags: ['skeleton', 'remains', 'skull', 'corpse', 'dead'],
    w: 1, h: 1, layer: 'floor', flat: true, c: { bone: BONE },
    variants: [{ name: 'Old bones', c: {} }, { name: 'Bloody', c: { bone: '#efe3d0' }, f: { blood: 1 } }, { name: 'Charred', c: { bone: '#8a8072' } }],
    desc: 'A scatter of bones and a skull.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.blood) {
        blob(g, lumpy(50, 54, 30, 0.5, 10, r, 24));
        paint(g, alpha('#6e0b0e', 0.75), null);
      }
      for (let i = 0; i < 5; i++) {
        const cx = 22 + r() * 56, cy = 22 + r() * 56, a = r() * Math.PI, L = 14 + r() * 14;
        boneAt(g, cx - Math.cos(a) * L, cy - Math.sin(a) * L, cx + Math.cos(a) * L, cy + Math.sin(a) * L, 4 + r() * 1.5, c.bone);
      }
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.ellipse(28 + r() * 40, 30 + r() * 40, 9, 4, r() * 3, 0, Math.PI);
        g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke();
        g.strokeStyle = c.bone; g.lineWidth = 2; g.stroke();
      }
      skull(g, 40 + r() * 20, 40 + r() * 20, 13, c.bone, (r() - 0.5) * 1.6);
    },
  },
  {
    id: 'stairs-down', name: 'Stairs down', cat: 'structure', sets: ['dungeon', 'castle', 'crypt', 'temple', 'wizard', 'sewer'], tags: ['steps', 'staircase', 'descend', 'lower level'],
    w: 1, h: 2, c: { stone: STONE.grey }, variants: STONES,
    desc: 'Steps leading down and away from the top edge, into darkness.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const n = 9;
      for (let i = 0; i < n; i++) {
        const t = i / n, inset = 12 + t * 12, y = 4 + i * 21;
        const tone = shade(c.stone, -0.08 - t * 0.6);
        rr(g, inset, y, 100 - inset * 2, 22, 1.5);
        paint(g, litFill(g, inset, y, 100 - inset * 2, 22, tone, 0.12), INK, 1.4);
        line(g, inset + 2, y + 2, 100 - inset - 2, y + 2, alpha('#ffffff', 0.32 - t * 0.28), 1.6);
        speckle(g, inset, y, 100 - inset * 2, 20, r, 3, alpha(shade(c.stone, -0.6), 0.35), 0.8);
      }
      // side walls
      for (const s of [0, 1]) {
        poly(g, s ? [[100, 0], [88, 0], [76, 196], [100, 200]] : [[0, 0], [12, 0], [24, 196], [0, 200]]);
        paint(g, litFill(g, 0, 0, 100, 200, shade(c.stone, -0.3), 0.15), INK, LW);
      }
      const gr = g.createLinearGradient(0, 60, 0, 200);
      gr.addColorStop(0, 'rgba(0,0,0,0)');
      gr.addColorStop(1, 'rgba(0,0,0,0.75)');
      g.fillStyle = gr;
      g.fillRect(12, 60, 76, 140);
      rr(g, 1, 1, 98, 198, 2);
      g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
    },
  },
  {
    id: 'stairs-up', name: 'Stairs up', cat: 'structure', sets: ['dungeon', 'castle', 'crypt', 'temple', 'wizard', 'town'], tags: ['steps', 'staircase', 'ascend', 'upper level'],
    w: 1, h: 2, blocksSight: false, c: { stone: STONE.grey }, variants: STONES,
    desc: 'Steps rising toward the top edge. Each step casts a shadow on the one below.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const n = 9;
      for (let i = n - 1; i >= 0; i--) {
        const t = 1 - i / (n - 1), y = 4 + i * 21;
        const tone = shade(c.stone, -0.18 + t * 0.32);
        rr(g, 10, y, 80, 23, 1.5);
        paint(g, litFill(g, 10, y, 80, 23, tone, 0.12), INK, 1.4);
        g.fillStyle = 'rgba(0,0,0,0.28)';
        g.fillRect(11, y + 16, 78, 6);
        line(g, 12, y + 2, 88, y + 2, alpha('#ffffff', 0.25 + t * 0.2), 1.6);
        speckle(g, 10, y, 80, 15, r, 3, alpha(shade(c.stone, -0.6), 0.35), 0.8);
      }
      for (const x of [0, 88]) {
        rr(g, x, 0, 12, 200, 2);
        paint(g, litFill(g, x, 0, 12, 200, shade(c.stone, -0.25), 0.2), INK, LW);
        bevel(g, x, 0, 12, 200, 2, 0.25);
      }
      // a chevron worn into the top step to show the way up
      poly(g, [[38, 22], [50, 12], [62, 22]], false);
      g.strokeStyle = alpha('#ffffff', 0.45); g.lineWidth = 2.4; g.lineCap = 'round'; g.stroke();
    },
  },
  {
    id: 'ladder', name: 'Ladder', cat: 'structure', sets: ['dungeon', 'sewer', 'mine', 'cave', 'castle', 'ship'], tags: ['climb', 'shaft', 'hole', 'rungs'],
    w: 1, h: 1, c: { wood: WOOD.oak, stone: STONE.grey },
    variants: [{ name: 'Down a shaft', c: {}, f: { hole: 1 } }, { name: 'Leaning ladder', c: {} }, { name: 'Iron rungs in a shaft', c: { wood: METAL.iron }, f: { hole: 1, iron: 1 } }],
    desc: 'A ladder down a stone-lined shaft, or one leaning against a wall (top edge).',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.hole) {
        rr(g, 10, 10, 80, 80, 6);
        paint(g, litFill(g, 10, 10, 80, 80, c.stone, 0.2), INK, LW);
        blocks(g, 12, 12, 76, 76, c.stone, r, 19, 12);
        rr(g, 22, 22, 56, 56, 3);
        const gr = g.createRadialGradient(50, 55, 4, 50, 50, 40);
        gr.addColorStop(0, '#000000'); gr.addColorStop(1, '#2a221c');
        paint(g, gr, INK, LW);
        for (let i = 0; i < 6; i++) {
          const t = i / 6, y = 26 + (1 - Math.pow(1 - t, 1.7)) * 48, k = 1 - t * 0.5;
          line(g, 50 - 16 * k, y, 50 + 16 * k, y, alpha(shade(c.wood, 0.1), 1 - t * 0.75), 3.2 * k);
        }
        for (const s of [-1, 1]) line(g, 50 + s * 18, 22, 50 + s * 9, 76, alpha(shade(c.wood, -0.1), 0.9), 4);
        return;
      }
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.fillRect(30, 8, 46, 88);
      for (const x of [26, 66]) {
        rr(g, x, 2, 8, 92, 2.5);
        paint(g, litFill(g, x, 2, 8, 92, c.wood, 0.22), INK, 1.6);
        grain(g, x, 2, 8, 92, c.wood, r, 'v', 2);
      }
      for (let y = 12; y < 92; y += 13) {
        rr(g, 33, y, 34, 5, 1.5);
        paint(g, litFill(g, 33, y, 34, 5, shade(c.wood, 0.05), 0.25), INK, 1.2);
      }
    },
  },
  {
    id: 'trapdoor', name: 'Trapdoor', cat: 'structure', sets: ['dungeon', 'tavern', 'castle', 'town', 'ship', 'wizard'], tags: ['hatch', 'cellar', 'door', 'floor door'],
    w: 1, h: 1, layer: 'floor', flat: true, c: { wood: WOOD.oak, metal: METAL.iron },
    variants: [{ name: 'Oak', c: {} }, { name: 'Iron plate', c: { wood: '#5d6166' }, f: { iron: 1 } }, { name: 'Open', c: {}, f: { open: 1 } }],
    desc: 'A hatch in the floor with a ring pull. The open variant shows the dark below.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 10, 10, 80, 80, 3);
      paint(g, litFill(g, 10, 10, 80, 80, shade(c.metal, -0.1), 0.3), INK, LW);
      if (f.open) {
        rr(g, 16, 16, 68, 68, 2);
        const gr = g.createLinearGradient(0, 16, 0, 84);
        gr.addColorStop(0, '#000000'); gr.addColorStop(1, '#2b2119');
        paint(g, gr, INK, 1.4);
        for (let y = 36; y < 84; y += 14) line(g, 34, y, 66, y, alpha(shade(c.wood, -0.1), 0.35 + (y - 36) / 100), 3);
        rr(g, 14, 2, 72, 12, 2);
        paint(g, litFill(g, 14, 2, 72, 12, shade(c.wood, -0.2), 0.2), INK, 1.6);
        return;
      }
      if (f.iron) {
        rr(g, 16, 16, 68, 68, 2);
        paint(g, litFill(g, 16, 16, 68, 68, c.wood, 0.35), INK, 1.4);
        for (let i = 0; i < 4; i++) line(g, 22 + i * 16, 20, 30 + i * 16, 80, alpha(shade(c.wood, -0.5), 0.6), 1.4);
        for (const [x, y] of [[21, 21], [79, 21], [21, 79], [79, 79]]) rivet(g, x, y, 2.4, c.metal);
      } else {
        planks(g, 16, 16, 68, 68, c.wood, r, 'v', 4);
        strap(g, 16, 28, 68, 7, c.metal);
        strap(g, 16, 66, 68, 7, c.metal);
      }
      ringPull(g, 50, 50, 7, shade(c.metal, 0.1));
    },
  },
  {
    id: 'pressure-plate', name: 'Pressure plate', cat: 'trap', sets: ['dungeon', 'crypt', 'temple', 'castle', 'wizard'], tags: ['trap', 'trigger', 'plate', 'hidden'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { stone: STONE.grey },
    variants: [{ name: 'Stone plate', c: {} }, { name: 'Sandstone', c: { stone: STONE.sand } }, { name: 'Dark stone', c: { stone: STONE.dark } }],
    desc: 'GM only. A loose flagstone that sets off a trap when stepped on.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      trapFrame(g, 4, 4, 92, 92);
      rr(g, 20, 20, 60, 60, 2);
      paint(g, 'rgba(0,0,0,0.45)', null);
      rr(g, 23, 23, 54, 54, 2);
      paint(g, litFill(g, 23, 23, 54, 54, c.stone, 0.25), INK, 1.6);
      bevel(g, 23, 23, 54, 54, 2, 0.35);
      speckle(g, 25, 25, 50, 50, r, 10, alpha(shade(c.stone, -0.5), 0.35), 0.9);
      circle(g, 50, 50, 9);
      paint(g, alpha(TRAP_RED, 0.85), INK, 1.4);
      circle(g, 50, 50, 3.5);
      paint(g, '#ffffff', null);
    },
  },
  {
    id: 'magic-circle', name: 'Magic circle', cat: 'arcane', sets: ['wizard', 'temple', 'dungeon', 'crypt', 'castle'], tags: ['ritual', 'summoning', 'runes', 'pentagram', 'ward', 'glyph'],
    w: 3, h: 3, layer: 'floor', flat: true, c: { line: '#8fdcff', glow: '#4cb8ff' },
    variants: [
      { name: 'Arcane blue', c: {} },
      { name: 'Violet', c: { line: '#d6b0ff', glow: '#9b5cff' } },
      { name: 'Gold', c: { line: '#ffe08a', glow: '#ffb23e' }, f: { pts: 6 } },
      { name: 'Blood red', c: { line: '#ff7a6b', glow: '#d0201c' }, f: { pts: 7 } },
    ],
    desc: 'A chalked and glowing ritual circle with a rune band.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      magicCircle(g, w / 2, h / 2, Math.min(w, h) / 2 - 10, c.line, c.glow, r, f.pts || 5);
    },
  },
  {
    id: 'torch-sconce', name: 'Wall torch', cat: 'light', sets: ['dungeon', 'castle', 'crypt', 'temple', 'sewer', 'mine'], tags: ['torch', 'sconce', 'fire', 'light', 'wall'],
    w: 1, h: 1, light: { bright: 20, dim: 20, color: TORCH }, c: { metal: METAL.iron, wood: WOOD.oak, fire: '#ffb02e' },
    variants: [{ name: 'Iron', c: {} }, { name: 'Brass', c: { metal: METAL.brass } }, { name: 'Black iron', c: { metal: METAL.black } }],
    desc: 'A burning torch in a wall bracket. Place it with the top edge against a wall.',
    draw: ({ g, c, seed }) => drawSconce(g, c, seed),
  },
  {
    id: 'candles', name: 'Candles', cat: 'light', sets: ['temple', 'crypt', 'wizard', 'dungeon', 'castle', 'tavern'], tags: ['candle', 'wax', 'ritual', 'light'],
    w: 1, h: 1, light: { bright: 5, dim: 5, color: CANDLE }, c: { wax: '#efe4c8' },
    variants: [{ name: 'White wax', c: {} }, { name: 'Red wax', c: { wax: '#b8433a' } }, { name: 'Black wax', c: { wax: '#3a3438' } }, { name: 'Beeswax', c: { wax: '#e0b85a' } }],
    desc: 'A cluster of candles in a pool of melted wax.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 52, 34, 0.45, 11, r, 30));
      paint(g, litFill(g, 16, 20, 68, 64, shade(c.wax, -0.1), 0.15), alpha(INK, 0.7), 1.3);
      const spots = [[38, 40, 9], [60, 36, 7.5], [64, 60, 10], [40, 64, 7], [52, 52, 6], [26, 52, 5.5], [74, 44, 5]];
      for (const [x, y, rad] of spots) {
        const jx = x + (r() - 0.5) * 4, jy = y + (r() - 0.5) * 4;
        for (let k = 0; k < 2; k++) { ellipse(g, jx + (r() - 0.5) * rad * 1.6, jy + rad * 0.8, 2, 3.5, r()); g.fillStyle = shade(c.wax, -0.05); g.fill(); }
        circle(g, jx, jy, rad);
        paint(g, domeFill(g, jx, jy, rad, c.wax, 0.35), INK, 1.1);
        circle(g, jx, jy, rad * 0.55);
        g.fillStyle = alpha(shade(c.wax, -0.2), 0.6); g.fill();
      }
      for (const [x, y, rad] of spots) {
        glow(g, x, y, rad * 2.2, '#ffb347', 0.45);
        ellipse(g, x + 0.5, y - 1, rad * 0.3, rad * 0.45, 0.3);
        paint(g, '#ffd166', alpha('#c2410c', 0.9), 0.9);
        circle(g, x + 0.3, y - 0.6, rad * 0.14);
        g.fillStyle = '#fffbe6'; g.fill();
      }
    },
  },
  {
    id: 'fireplace', name: 'Fireplace', cat: 'light', sets: ['castle', 'tavern', 'town', 'wizard', 'winter'], tags: ['hearth', 'fire', 'chimney', 'warmth'],
    w: 2, h: 1, blocksMovement: true, light: { bright: 20, dim: 20, color: TORCH }, c: { stone: STONE.grey, wood: WOOD.oak, fire: '#ffb02e' },
    variants: [{ name: 'Grey stone', c: {} }, { name: 'Brick red', c: { stone: STONE.red } }, { name: 'Sandstone', c: { stone: STONE.sand } }, { name: 'Witch-fire', c: { stone: STONE.dark, fire: '#59e08a' } }],
    desc: 'A stone hearth set into the wall (top edge), with logs burning.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 6, -4, 188, 70, 4);
      paint(g, shade(c.stone, -0.2), INK, LW);
      blocks(g, 8, 0, 184, 64, c.stone, r, 26, 16);
      rr(g, 6, -4, 188, 70, 4);
      g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
      // firebox
      poly(g, [[44, 0], [156, 0], [146, 54], [54, 54]]);
      const fb = g.createLinearGradient(0, 0, 0, 54);
      fb.addColorStop(0, '#0d0907'); fb.addColorStop(1, '#3b2518');
      paint(g, fb, INK, LW);
      // hearthstone apron
      rr(g, 30, 60, 140, 32, 3);
      paint(g, litFill(g, 30, 60, 140, 32, shade(c.stone, 0.08), 0.2), INK, LW);
      bevel(g, 30, 60, 140, 32, 3, 0.3);
      speckle(g, 32, 62, 136, 28, r, 14, alpha('#2a1d14', 0.35), 1.1);
      // logs
      for (const [x1, y1, x2, y2] of [[70, 40, 128, 22], [74, 18, 132, 42]]) {
        line(g, x1, y1, x2, y2, INK, 13);
        line(g, x1, y1, x2, y2, shade(c.wood, -0.15), 10);
        line(g, x1, y1 - 2, x2, y2 - 2, alpha(shade(c.wood, 0.2), 0.6), 2.5);
      }
      for (let i = 0; i < 8; i++) { circle(g, 70 + r() * 60, 30 + r() * 20, 2 + r() * 2.5); paint(g, r() < 0.5 ? '#c2410c' : '#ff8a2a', null); }
      fireAt(g, 100, 30, 20, r, c.fire);
    },
  },
  {
    id: 'spider-web', name: 'Spider web', cat: 'hazard', sets: ['dungeon', 'cave', 'crypt', 'forest', 'mine'], tags: ['web', 'spider', 'sticky', 'cobweb', 'difficult terrain'],
    w: 2, h: 2, flat: true, difficult: true, c: { silk: '#f2efe6' },
    variants: [{ name: 'Web', c: {} }, { name: 'Corner web', c: {}, f: { corner: 1 } }, { name: 'With cocoon', c: {}, f: { cocoon: 1 } }],
    desc: 'Thick webbing: difficult terrain, and sticky.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const cx = f.corner ? 8 : w / 2 + (r() - 0.5) * 20, cy = f.corner ? 8 : h / 2 + (r() - 0.5) * 20;
      const n = f.corner ? 7 : 11;
      const a0 = f.corner ? 0 : r() * TAU, span = f.corner ? Math.PI / 2 : TAU;
      const spokes: number[][] = [];
      for (let i = 0; i < n; i++) {
        const a = a0 + (f.corner ? (i / (n - 1)) * span : (i / n) * span + (r() - 0.5) * 0.3);
        const L = (f.corner ? 180 : 92) * (0.85 + r() * 0.15);
        spokes.push([Math.cos(a), Math.sin(a), L]);
      }
      const strand = (lw: number) => {
        g.beginPath();
        for (const [dx, dy, L] of spokes) { g.moveTo(cx, cy); g.lineTo(cx + dx * L, cy + dy * L); }
        for (let k = 1; k <= 7; k++) {
          const t = k / 8;
          spokes.forEach(([dx, dy, L], i) => {
            if (f.corner && i === spokes.length - 1) return;
            const [ex, ey, eL] = spokes[(i + 1) % spokes.length];
            const x1 = cx + dx * L * t, y1 = cy + dy * L * t, x2 = cx + ex * eL * t, y2 = cy + ey * eL * t;
            if (i === 0 || f.corner) g.moveTo(x1, y1);
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            g.quadraticCurveTo(cx + (mx - cx) * 0.9, cy + (my - cy) * 0.9, x2, y2);
          });
        }
        g.lineWidth = lw;
        g.stroke();
      };
      g.strokeStyle = 'rgba(0,0,0,0.35)';
      strand(3.2);
      g.strokeStyle = alpha(c.silk, 0.9);
      strand(1.4);
      if (f.cocoon) {
        ellipse(g, cx + 28, cy + 24, 13, 22, -0.5);
        paint(g, domeFill(g, cx + 28, cy + 24, 22, c.silk, 0.3), INK, 1.6);
        for (let i = -2; i <= 2; i++) line(g, cx + 18 + i * 4, cy + 10 + i * 6, cx + 36 + i * 4, cy + 18 + i * 6, alpha('#9a9488', 0.7), 1);
      }
    },
  },
  {
    id: 'blood-pool', name: 'Blood pool', cat: 'decor', sets: ['dungeon', 'crypt', 'castle', 'temple', 'sewer', 'cave'], tags: ['blood', 'gore', 'stain', 'splatter', 'murder'],
    w: 1, h: 1, layer: 'floor', flat: true, c: { blood: '#8a0f12' },
    variants: [{ name: 'Fresh', c: {} }, { name: 'Dried', c: { blood: '#4a1a10' } }, { name: 'Green ichor', c: { blood: '#4a7a1d' } }, { name: 'Black ichor', c: { blood: '#1e1820' } }],
    desc: 'A pool of blood with spatter.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const pts = lumpy(48, 50, 32, 0.55, 12, r, 27);
      blob(g, pts);
      const gr = g.createRadialGradient(42, 44, 2, 50, 50, 38);
      gr.addColorStop(0, shade(c.blood, 0.15)); gr.addColorStop(1, shade(c.blood, -0.35));
      paint(g, gr, alpha(shade(c.blood, -0.6), 0.9), 1.4);
      for (let i = 0; i < 9; i++) {
        const a = r() * TAU, d = 34 + r() * 12;
        circle(g, 48 + Math.cos(a) * d, 50 + Math.sin(a) * d * 0.9, 1.2 + r() * 2.6);
        g.fillStyle = shade(c.blood, -0.1); g.fill();
      }
      ellipse(g, 38, 38, 9, 4, -0.5);
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.fill();
      circle(g, 52, 34, 2); g.fill();
    },
  },
  {
    id: 'crystal-cluster', name: 'Glowing crystals', cat: 'light', sets: ['cave', 'wizard', 'mine', 'dungeon'], tags: ['crystal', 'gem', 'glow', 'geode', 'light', 'shard'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 10, dim: 10, color: '#7fd3ff' }, c: { gem: '#6cc8ff' },
    variants: [{ name: 'Blue', c: {} }, { name: 'Violet', c: { gem: '#b57cff' } }, { name: 'Green', c: { gem: '#5fe39a' } }, { name: 'Red', c: { gem: '#ff6262' } }],
    desc: 'Crystal shards growing from the floor, glowing softly.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 50, c.gem, 0.55);
      stone(g, 50, 54, 26, '#4a4644', r, 20);
      const shards: number[][] = [];
      for (let i = 0; i < 8; i++) shards.push([(i / 8) * TAU + (r() - 0.5) * 0.5, 30 + r() * 14, 6 + r() * 3]);
      shards.push([-2.3, 40, 9]);
      shards.push([-0.9, 34, 8]);
      for (const [a, L, wd] of shards) {
        const bx = 50 + Math.cos(a) * 4, by = 54 + Math.sin(a) * 4, tx = 50 + Math.cos(a) * L, ty = 54 + Math.sin(a) * L;
        const px = -Math.sin(a) * wd, py = Math.cos(a) * wd;
        const mx = bx + (tx - bx) * 0.7, my = by + (ty - by) * 0.7;
        poly(g, [[bx + px * 0.6, by + py * 0.6], [mx + px, my + py], [tx, ty], [mx - px, my - py], [bx - px * 0.6, by - py * 0.6]]);
        paint(g, shade(c.gem, -0.25), INK, 1.4);
        poly(g, [[bx, by], [mx + px, my + py], [tx, ty]]);
        g.fillStyle = alpha(shade(c.gem, 0.45), 0.9); g.fill();
        line(g, bx, by, tx, ty, alpha('#ffffff', 0.6), 1);
      }
      circle(g, 50, 54, 5);
      paint(g, alpha(mix(c.gem, '#ffffff', 0.7), 0.9), null);
    },
  },
];

// ---------- structure, castle and prison ----------
const STRUCTURE: ObjDef[] = [
  {
    id: 'pillar-broken', name: 'Broken pillar', cat: 'structure', sets: ['dungeon', 'temple', 'crypt', 'castle', 'desert'], tags: ['ruin', 'column', 'rubble', 'stump', 'cover'],
    w: 1, h: 1, blocksMovement: true, difficult: true, c: { stone: STONE.grey }, variants: STONES,
    desc: 'The snapped stump of a column with fallen chunks around it.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 12, 12, 76, 76, 5);
      paint(g, litFill(g, 12, 12, 76, 76, shade(c.stone, -0.12), 0.2), INK, LW);
      bevel(g, 12, 12, 76, 76, 5, 0.25);
      const pts = lumpy(48, 48, 27, 0.4, 12, r);
      blob(g, pts);
      paint(g, domeFill(g, 48, 48, 27, c.stone, 0.35), INK, LW);
      blob(g, lumpy(48, 48, 18, 0.55, 10, r));
      paint(g, litFill(g, 30, 30, 36, 36, shade(c.stone, 0.18), 0.25), alpha(shade(c.stone, -0.6), 0.7), 1.2);
      g.beginPath();
      g.moveTo(40, 40); g.lineTo(48, 48); g.lineTo(46, 58); g.moveTo(48, 48); g.lineTo(58, 44);
      g.strokeStyle = alpha(shade(c.stone, -0.65), 0.7); g.lineWidth = 1.2; g.stroke();
      for (let i = 0; i < 4; i++) {
        const a = 0.3 + i * 0.5 + r() * 0.3;
        stone(g, 50 + Math.cos(a) * 38, 50 + Math.sin(a) * 38, 6 + r() * 5, c.stone, r);
      }
    },
  },
  {
    id: 'column-fallen', name: 'Fallen column', cat: 'structure', sets: ['dungeon', 'temple', 'crypt', 'castle', 'desert', 'forest'], tags: ['ruin', 'column', 'pillar', 'cover', 'rubble'],
    w: 1, h: 3, blocksMovement: true, c: { stone: STONE.grey }, variants: STONES,
    desc: 'A toppled column lying in drum sections. Half cover behind it.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // capital at the bottom end
      rr(g, 10, 248, 80, 44, 4);
      paint(g, litFill(g, 10, 248, 80, 44, c.stone, 0.25), INK, LW);
      line(g, 14, 262, 86, 262, alpha(shade(c.stone, -0.6), 0.6), 1.3);
      line(g, 14, 276, 86, 276, alpha(shade(c.stone, -0.6), 0.6), 1.3);
      // three drums of shaft; the top one has a jagged broken end, each joint is chipped
      const drums = [[14, 13, 86], [98, 15, 80], [176, 12, 74]];
      drums.forEach(([y0, x0, len], i) => {
        const off = (r() - 0.5) * 6, xl = x0 + off, xr = 100 - x0 + off, yb = y0 + len - 4;
        const pts: number[][] = [];
        const jag = i === 0 ? 7 : 3;
        for (let k = 0; k <= 6; k++) pts.push([xl + (k / 6) * (xr - xl), y0 + 2 + r() * jag]);
        pts.push([xr, yb], [xl, yb]);
        poly(g, pts);
        const gr = g.createLinearGradient(xl, 0, xr, 0);
        gr.addColorStop(0, shade(c.stone, -0.05)); gr.addColorStop(0.3, shade(c.stone, 0.3)); gr.addColorStop(1, shade(c.stone, -0.45));
        paint(g, gr, INK, LW);
        g.save();
        poly(g, pts);
        g.clip();
        for (let k = 1; k < 6; k++) line(g, xl + (k * (xr - xl)) / 6, y0, xl + (k * (xr - xl)) / 6, yb, alpha(shade(c.stone, -0.6), 0.35), 1);
        if (i === 0) speckle(g, xl, y0, xr - xl, 14, r, 8, alpha(shade(c.stone, -0.6), 0.5), 1.1);
        g.restore();
      });
      for (let i = 0; i < 4; i++) stone(g, i % 2 ? 93 : 7, 30 + i * 52 + r() * 20, 4 + r() * 2, c.stone, r);
    },
  },
  {
    id: 'portcullis', name: 'Portcullis', cat: 'structure', sets: ['castle', 'dungeon', 'sewer'], tags: ['gate', 'bars', 'grate', 'gatehouse', 'barrier'],
    w: 1, h: 1, blocksMovement: true, c: { metal: METAL.iron, stone: STONE.grey },
    variants: [{ name: 'Lowered, iron', c: {} }, { name: 'Lowered, black iron', c: { metal: METAL.black } }, { name: 'Lowered, rusted', c: { metal: METAL.rust } }, { name: 'Raised', c: {}, f: { open: 1 } }],
    desc: 'One square of a portcullis set in a floor slot. Line several up across a gate.',
    draw: ({ g, c, f }) => {
      rr(g, 0, 40, 100, 20, 1);
      paint(g, '#120d0a', INK, 1.4);
      for (const x of [0, 100]) { rr(g, x - 6, 34, 12, 32, 2); paint(g, litFill(g, x - 6, 34, 12, 32, c.stone, 0.2), INK, 1.4); }
      if (f.open) {
        for (let x = 12.5; x < 100; x += 25) {
          poly(g, [[x - 4, 50], [x, 44], [x + 4, 50], [x, 56]]);
          paint(g, litFill(g, x - 4, 44, 8, 12, c.metal, 0.4), INK, 1.1);
        }
        return;
      }
      rr(g, 2, 44, 96, 12, 2);
      paint(g, litFill(g, 2, 44, 96, 12, c.metal, 0.35), INK, 1.8);
      for (let x = 12.5; x < 100; x += 25) {
        rr(g, x - 7, 41, 14, 18, 2);
        paint(g, litFill(g, x - 7, 41, 14, 18, shade(c.metal, 0.1), 0.45), INK, 1.6);
        rivet(g, x, 50, 2.8, c.metal);
      }
    },
  },
  {
    id: 'prison-bars', name: 'Prison bars', cat: 'structure', sets: ['dungeon', 'castle', 'town'], tags: ['cell', 'jail', 'bars', 'prison', 'gaol'],
    w: 1, h: 1, blocksMovement: true, c: { metal: METAL.iron },
    variants: [{ name: 'Iron', c: {} }, { name: 'Rusted', c: { metal: METAL.rust } }, { name: 'Black iron', c: { metal: METAL.black } }],
    desc: 'A one-square run of cell bars. Line them up to wall in a cell. They block movement, not sight.',
    draw: ({ g, c }) => {
      for (const y of [44, 56]) {
        rr(g, 0, y - 2.5, 100, 5, 2);
        paint(g, litFill(g, 0, y - 3, 100, 6, c.metal, 0.35), INK, 1.3);
      }
      for (let x = 6.25; x < 100; x += 12.5) {
        circle(g, x, 50, 4.6);
        paint(g, domeFill(g, x, 50, 4.6, c.metal, 0.5), INK, 1.4);
      }
    },
  },
  {
    id: 'cell-door', name: 'Cell door', cat: 'structure', sets: ['dungeon', 'castle', 'town'], tags: ['cell', 'jail', 'door', 'bars', 'locked', 'prison'],
    w: 1, h: 1, blocksMovement: true, c: { metal: METAL.iron },
    variants: [{ name: 'Shut', c: {} }, { name: 'Open', c: {}, f: { open: 1 } }, { name: 'Shut, rusted', c: { metal: METAL.rust } }],
    desc: 'A barred door with a lock box. The open variant swings in from the left hinge.',
    draw: ({ g, c, f }) => {
      const door = () => {
        rr(g, 4, 44, 88, 12, 2);
        paint(g, litFill(g, 4, 44, 88, 12, c.metal, 0.35), INK, 1.6);
        for (let x = 14; x < 80; x += 13) { circle(g, x, 50, 4.4); paint(g, domeFill(g, x, 50, 4.4, c.metal, 0.5), INK, 1.3); }
        rr(g, 78, 40, 16, 20, 2);
        paint(g, litFill(g, 78, 40, 16, 20, shade(c.metal, -0.1), 0.35), INK, 1.6);
        circle(g, 86, 50, 2.2); paint(g, '#0c0c0c', null);
      };
      circle(g, 5, 50, 6);
      paint(g, domeFill(g, 5, 50, 6, c.metal, 0.4), INK, 1.4);
      if (f.open) {
        g.save(); g.translate(5, 50); g.rotate(Math.PI / 2); g.translate(-5, -50); door(); g.restore();
        g.beginPath(); g.arc(5, 50, 86, -0.02, Math.PI / 2 - 0.1);
        dashed(g, alpha('#000000', 0.35), 1.2, [4, 4]);
      } else door();
    },
  },
  {
    id: 'iron-maiden', name: 'Iron maiden', cat: 'trap', sets: ['dungeon', 'castle'], tags: ['torture', 'spikes', 'cabinet', 'prison'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { metal: METAL.iron },
    variants: [{ name: 'Shut', c: {} }, { name: 'Rusted', c: { metal: METAL.rust } }, { name: 'Open', c: {}, f: { open: 1 } }],
    desc: 'A spiked iron cabinet with a stern face on the lid.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const shape = [[36, 8], [64, 8], [80, 30], [74, 92], [26, 92], [20, 30]];
      if (f.open) {
        poly(g, shape);
        paint(g, '#140f0c', INK, LW);
        for (let i = 0; i < 10; i++) { circle(g, 34 + (i % 3) * 16, 26 + Math.floor(i / 3) * 16, 2); paint(g, shade(c.metal, 0.3), INK, 0.8); }
        for (const s of [-1, 1]) {
          const door = [[50 + s * 28, 30], [50 + s * 48, 26], [50 + s * 46, 86], [50 + s * 24, 92]];
          poly(g, door);
          paint(g, litFill(g, 0, 20, 100, 70, shade(c.metal, -0.1), 0.3), INK, 1.8);
          for (let k = 0; k < 4; k++) {
            const y = 38 + k * 13, x = 50 + s * 36;
            poly(g, [[x - 3, y], [x + 3, y], [x, y - 6]]);
            paint(g, shade(c.metal, 0.35), INK, 0.8);
          }
        }
        return;
      }
      poly(g, shape);
      paint(g, litFill(g, 20, 8, 60, 84, c.metal, 0.3), INK, LW * 1.1);
      line(g, 50, 40, 50, 90, alpha(shade(c.metal, -0.6), 0.8), 1.6);
      // the face
      ellipse(g, 50, 24, 13, 14);
      paint(g, domeFill(g, 50, 24, 14, shade(c.metal, 0.12), 0.4), INK, 1.6);
      line(g, 43, 21, 47, 22, INK, 2);
      line(g, 53, 22, 57, 21, INK, 2);
      line(g, 45, 31, 55, 31, INK, 1.8);
      for (const [x, y] of [[28, 44], [72, 44], [30, 84], [70, 84], [40, 62], [60, 62]]) rivet(g, x, y, 2.4, c.metal);
      rr(g, 64, 56, 7, 12, 1.5);
      paint(g, shade(c.metal, -0.2), INK, 1.2);
      speckle(g, 22, 10, 56, 80, r, 12, alpha(METAL.rust, 0.4), 1.2);
    },
  },
  {
    id: 'stocks', name: 'Stocks', cat: 'furniture', sets: ['town', 'castle', 'dungeon'], tags: ['punishment', 'prison', 'pillory', 'restraint'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.iron }, variants: vars('wood', { oak: WOOD.oak, walnut: WOOD.walnut, pine: WOOD.pine }),
    desc: 'A wooden beam with holes for a head and hands.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const x of [22, 178]) { rr(g, x - 10, 40, 20, 20, 3); paint(g, litFill(g, x - 10, 40, 20, 20, shade(c.wood, -0.2), 0.2), INK, LW); }
      for (const y of [34, 50]) {
        board(g, 12, y, 176, 16, shade(c.wood, y === 34 ? 0.05 : -0.05), r, 'h', 2);
      }
      for (const [x, rad] of [[70, 7], [100, 10], [130, 7]] as const) {
        circle(g, x, 50, rad);
        paint(g, '#1a120c', INK, 1.6);
      }
      strap(g, 14, 36, 8, 28, c.metal, false);
      rr(g, 180, 44, 10, 12, 2);
      paint(g, litFill(g, 180, 44, 10, 12, c.metal, 0.35), INK, 1.3);
      ringPull(g, 194, 50, 3.5, c.metal);
    },
  },
  {
    id: 'pillory', name: 'Pillory', cat: 'furniture', sets: ['town', 'castle'], tags: ['punishment', 'stocks', 'restraint', 'square'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak }, variants: vars('wood', { oak: WOOD.oak, walnut: WOOD.walnut, pine: WOOD.pine }),
    desc: 'A standing pillory on a small wooden platform.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      planks(g, 6, 6, 88, 88, shade(c.wood, -0.1), r, 'v', 5);
      rr(g, 6, 6, 88, 88, 2); g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
      circle(g, 50, 50, 9);
      paint(g, 'rgba(0,0,0,0.35)', null);
      board(g, 12, 38, 76, 12, shade(c.wood, 0.08), r, 'h', 2);
      board(g, 12, 50, 76, 12, c.wood, r, 'h', 2);
      for (const [x, rad] of [[28, 5], [50, 8], [72, 5]] as const) { circle(g, x, 50, rad); paint(g, '#1a120c', INK, 1.4); }
    },
  },
  {
    id: 'torture-rack', name: 'Rack', cat: 'furniture', sets: ['dungeon', 'castle'], tags: ['torture', 'interrogation', 'rack', 'prison'],
    w: 1, h: 2, blocksMovement: true, c: { wood: WOOD.oak, rope: '#c8b07a' }, variants: vars('wood', { oak: WOOD.oak, walnut: WOOD.walnut, ebony: WOOD.ebony }),
    desc: 'A wooden frame with a roller at each end.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const x of [12, 76]) board(g, x, 6, 12, 188, c.wood, r, 'v', 3);
      for (let y = 46; y < 160; y += 22) board(g, 26, y, 48, 12, shade(c.wood, -0.12), r, 'h', 2);
      for (const y of [22, 178]) {
        rr(g, 18, y - 9, 64, 18, 8);
        const gr = g.createLinearGradient(0, y - 9, 0, y + 9);
        gr.addColorStop(0, shade(c.wood, 0.25)); gr.addColorStop(1, shade(c.wood, -0.4));
        paint(g, gr, INK, LW);
        for (const s of [-1, 1]) {
          line(g, s < 0 ? 4 : 96, y - 10, s < 0 ? 4 : 96, y + 10, INK, 5.5);
          line(g, s < 0 ? 4 : 96, y - 10, s < 0 ? 4 : 96, y + 10, shade(c.wood, 0.1), 3);
          line(g, s < 0 ? 4 : 96, y, s < 0 ? 18 : 82, y, INK, 4);
        }
        for (const x of [38, 62]) line(g, x, y, x + (x - 50) * 0.2, y < 100 ? 62 : 138, c.rope, 2.2);
      }
      for (const [x, y] of [[40, 62], [60, 62], [40, 138], [60, 138]]) ringPull(g, x, y, 4, METAL.iron);
    },
  },
  {
    id: 'wall-chains', name: 'Wall chains', cat: 'decor', sets: ['dungeon', 'castle', 'crypt', 'sewer'], tags: ['manacles', 'shackles', 'prison', 'chains', 'cell', 'wall'],
    w: 1, h: 1, c: { metal: METAL.iron },
    variants: [{ name: 'Iron', c: {} }, { name: 'Rusted', c: { metal: METAL.rust } }, { name: 'With old prisoner', c: {}, f: { bones: 1 } }],
    desc: 'Chains and manacles bolted to the wall (top edge).',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.bones) {
        skull(g, 50, 46, 11, BONE, 0.2);
        boneAt(g, 36, 70, 60, 82, 4.5);
        for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(52, 62 + i * 6, 12, 3.5, 0, 0, Math.PI); g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke(); g.strokeStyle = BONE; g.lineWidth = 2; g.stroke(); }
      }
      for (const [x, ex] of [[28, 22], [72, 80]]) {
        rr(g, x - 8, 1, 16, 9, 2);
        paint(g, litFill(g, x - 8, 1, 16, 9, c.metal, 0.35), INK, 1.4);
        const ey = 62 + r() * 10;
        chain(g, x, 8, ex, ey, c.metal, 3.6);
        g.beginPath();
        g.arc(ex, ey + 6, 7, Math.PI * 1.25, Math.PI * 3.05);
        g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
        g.strokeStyle = shade(c.metal, 0.2); g.lineWidth = 3.6; g.stroke();
      }
    },
  },
  {
    id: 'statue-gargoyle', name: 'Gargoyle statue', cat: 'decor', sets: ['castle', 'temple', 'crypt', 'dungeon', 'town'], tags: ['gargoyle', 'statue', 'grotesque', 'wings', 'guardian'],
    w: 1, h: 1, blocksMovement: true, c: { stone: STONE.grey },
    variants: [...STONES, { name: 'Mossy', c: { stone: STONE.green } }],
    desc: 'A crouching winged grotesque on a plinth, facing the bottom edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      plinth(g, 12, 12, 76, 76, shade(c.stone, -0.1), r);
      const s = shade(c.stone, 0.05);
      for (const k of [-1, 1]) {
        const wing = [[50 + k * 10, 46], [50 + k * 46, 18], [50 + k * 44, 34], [50 + k * 38, 40], [50 + k * 40, 52], [50 + k * 30, 54], [50 + k * 28, 64], [50 + k * 14, 58]];
        poly(g, wing);
        paint(g, litFill(g, 4, 18, 92, 50, shade(s, -0.1), 0.3), INK, 1.8);
        line(g, 50 + k * 12, 48, 50 + k * 44, 20, alpha(shade(s, -0.6), 0.7), 1.6);
        line(g, 50 + k * 18, 50, 50 + k * 38, 40, alpha(shade(s, -0.6), 0.6), 1.2);
      }
      ellipse(g, 50, 54, 15, 19);
      paint(g, domeFill(g, 50, 52, 19, s, 0.35), INK, LW);
      for (const k of [-1, 1]) { ellipse(g, 50 + k * 9, 76, 6, 5); paint(g, domeFill(g, 50 + k * 9, 76, 6, s, 0.3), INK, 1.4); }
      circle(g, 50, 66, 10);
      paint(g, domeFill(g, 50, 66, 10, shade(s, 0.08), 0.4), INK, 1.8);
      for (const k of [-1, 1]) {
        poly(g, [[50 + k * 5, 60], [50 + k * 14, 52], [50 + k * 9, 62]]);
        paint(g, shade(s, -0.15), INK, 1.1);
        circle(g, 50 + k * 4, 69, 1.6); g.fillStyle = '#1a120c'; g.fill();
      }
    },
  },
  {
    id: 'statue-knight', name: 'Knight statue', cat: 'decor', sets: ['castle', 'crypt', 'temple', 'town', 'dungeon'], tags: ['knight', 'statue', 'armor', 'warrior', 'guardian', 'tomb'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { stone: STONE.grey, body: '#a29e96', shield: '#7c776f' },
    variants: [
      { name: 'Grey stone', c: {} },
      { name: 'Marble', c: { stone: STONE.marble, body: '#ece8e0', shield: '#d8d2c6' } },
      { name: 'Verdigris bronze', c: { stone: STONE.dark, body: '#5f9a84', shield: '#4d8270' } },
      { name: 'Painted', c: { stone: STONE.dark, body: '#b9bec4', shield: '#2f5d8a' } },
    ],
    desc: 'An armoured knight with shield and planted sword, facing the bottom edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      plinth(g, 8, 8, 84, 84, c.stone, r);
      const b = c.body;
      ellipse(g, 50, 50, 30, 18);
      paint(g, domeFill(g, 50, 50, 30, b, 0.3), INK, LW);
      for (const k of [-1, 1]) { circle(g, 50 + k * 24, 46, 11); paint(g, domeFill(g, 50 + k * 24, 46, 11, b, 0.45), INK, 1.8); g.beginPath(); g.arc(50 + k * 24, 46, 7, Math.PI * 1.1, Math.PI * 1.7); g.strokeStyle = alpha('#ffffff', 0.4); g.lineWidth = 1.4; g.stroke(); }
      // shield on the left arm
      poly(g, [[16, 56], [36, 56], [36, 72], [26, 86], [16, 72]]);
      paint(g, litFill(g, 16, 56, 20, 30, c.shield, 0.3), INK, 1.8);
      line(g, 26, 58, 26, 82, alpha(shade(b, 0.3), 0.8), 2);
      line(g, 18, 66, 34, 66, alpha(shade(b, 0.3), 0.8), 2);
      // sword planted at the front
      rr(g, 59, 64, 5, 26, 1.5);
      paint(g, litFill(g, 59, 64, 5, 26, shade(b, 0.3), 0.3), INK, 1.2);
      rr(g, 52, 61, 19, 4.5, 2);
      paint(g, shade(b, -0.1), INK, 1.2);
      circle(g, 61.5, 60, 4.5);
      paint(g, domeFill(g, 61.5, 60, 4.5, b, 0.35), INK, 1.2);
      // helm with crest
      circle(g, 50, 44, 12);
      paint(g, domeFill(g, 50, 44, 12, b, 0.5), INK, LW);
      rr(g, 47.5, 31, 5, 24, 2);
      paint(g, shade(b, -0.2), INK, 1.2);
      line(g, 44, 52, 56, 52, INK, 1.8);
    },
  },
  {
    id: 'statue-dragon', name: 'Dragon statue', cat: 'decor', sets: ['castle', 'temple', 'dungeon', 'cave', 'wizard'], tags: ['dragon', 'statue', 'wings', 'monument', 'wyrm'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { stone: STONE.grey, body: '#8f8b84', eye: '#ffcf4a' },
    variants: [
      { name: 'Grey stone', c: {} },
      { name: 'Marble', c: { stone: STONE.marble, body: '#e6e1d8', eye: '#4fb3ff' } },
      { name: 'Obsidian, ruby eyes', c: { stone: STONE.dark, body: '#2f2b33', eye: '#ff3b3b' } },
      { name: 'Jade', c: { stone: STONE.dark, body: '#4f9a72', eye: '#ffe08a' } },
    ],
    desc: 'A coiled dragon with spread wings on a broad plinth, head toward the bottom edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      plinth(g, 12, 12, 176, 176, c.stone, r);
      const b = c.body, dk = shade(b, -0.55);
      for (const k of [-1, 1]) {
        const wx = (x: number) => 100 + k * x;
        const wing = [[wx(14), 92], [wx(40), 40], [wx(86), 22], [wx(80), 52], [wx(84), 80], [wx(66), 82], [wx(64), 106], [wx(44), 104], [wx(30), 116]];
        poly(g, wing);
        paint(g, litFill(g, 14, 22, 172, 96, shade(b, -0.08), 0.3), INK, LW);
        for (const [x, y] of [[86, 22], [84, 80], [64, 106]]) line(g, wx(26), 84, wx(x), y, alpha(dk, 0.8), 2.2);
      }
      // tail curl
      g.beginPath();
      g.moveTo(100, 130); g.bezierCurveTo(150, 150, 168, 110, 156, 84); g.quadraticCurveTo(150, 70, 136, 74);
      g.strokeStyle = INK; g.lineWidth = 15; g.lineCap = 'round'; g.stroke();
      g.strokeStyle = b; g.lineWidth = 11; g.stroke();
      poly(g, [[136, 74], [124, 66], [128, 80]]);
      paint(g, b, INK, 1.6);
      // body
      ellipse(g, 100, 112, 26, 34);
      paint(g, domeFill(g, 100, 108, 34, b, 0.35), INK, LW);
      for (let i = 0; i < 5; i++) { poly(g, [[94, 90 + i * 10], [100, 84 + i * 10], [106, 90 + i * 10]]); paint(g, shade(b, 0.12), INK, 1.1); }
      for (const k of [-1, 1]) { ellipse(g, 100 + k * 24, 140, 9, 12); paint(g, domeFill(g, 100 + k * 24, 140, 12, b, 0.3), INK, 1.6); }
      // neck and head at the front
      rr(g, 90, 132, 20, 22, 8);
      paint(g, litFill(g, 90, 132, 20, 22, b, 0.3), INK, 1.8);
      blob(g, [[84, 150], [100, 142], [116, 150], [112, 172], [100, 182], [88, 172]]);
      paint(g, domeFill(g, 100, 158, 22, b, 0.4), INK, LW);
      for (const k of [-1, 1]) {
        poly(g, [[100 + k * 10, 148], [100 + k * 22, 128], [100 + k * 15, 150]]);
        paint(g, shade(b, 0.2), INK, 1.4);
        ellipse(g, 100 + k * 8, 160, 3.4, 2.4, k * 0.4);
        paint(g, c.eye, INK, 1);
        circle(g, 100 + k * 4, 176, 1.4); g.fillStyle = INK; g.fill();
      }
      glow(g, 100, 160, 22, c.eye, 0.25);
    },
  },
];

// ---------- temple, shrine and crypt ----------
const SACRED: ObjDef[] = [
  {
    id: 'fountain', name: 'Fountain', cat: 'decor', sets: ['town', 'castle', 'temple', 'market'], tags: ['water', 'basin', 'well', 'plaza', 'statue'],
    w: 2, h: 2, blocksMovement: true, c: { stone: STONE.grey, water: '#4a8fb5' },
    variants: [
      { name: 'Grey stone', c: {} },
      { name: 'Marble', c: { stone: STONE.marble } },
      { name: 'Blood-filled', c: { stone: STONE.dark, water: '#7a1012' } },
      { name: 'Dry and cracked', c: { stone: STONE.sand }, f: { dry: 1 } },
    ],
    desc: 'A round stone basin with a central spout.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const pts: number[][] = [];
      for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + (i / 8) * TAU; pts.push([100 + Math.cos(a) * 92, 100 + Math.sin(a) * 92]); }
      poly(g, pts);
      paint(g, litFill(g, 8, 8, 184, 184, c.stone, 0.25), INK, LW * 1.1);
      g.save(); poly(g, pts); g.clip();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; line(g, 100 + Math.cos(a) * 70, 100 + Math.sin(a) * 70, 100 + Math.cos(a) * 95, 100 + Math.sin(a) * 95, alpha(shade(c.stone, -0.6), 0.6), 1.3); }
      g.restore();
      const inner = pts.map(([x, y]) => [100 + (x - 100) * 0.82, 100 + (y - 100) * 0.82]);
      poly(g, inner);
      if (f.dry) {
        paint(g, litFill(g, 25, 25, 150, 150, '#8a7458', 0.2), INK, 1.8);
        g.beginPath();
        for (let i = 0; i < 6; i++) { const a = r() * TAU; g.moveTo(100 + Math.cos(a) * 30, 100 + Math.sin(a) * 30); g.lineTo(100 + Math.cos(a + 0.3) * 50, 100 + Math.sin(a + 0.3) * 50); g.lineTo(100 + Math.cos(a) * 70, 100 + Math.sin(a) * 70); }
        g.strokeStyle = alpha('#3a2a1c', 0.7); g.lineWidth = 1.4; g.stroke();
        speckle(g, 30, 30, 140, 140, r, 20, alpha('#3a2a1c', 0.4), 1.4);
      } else {
        paint(g, c.water, INK, 1.8);
        g.save(); poly(g, inner); g.clip();
        liquid(g, 100, 100, 76, 76, c.water, r);
        for (const rad of [36, 50, 64]) ringAt(g, 100, 100, rad, alpha('#ffffff', 0.25), 1.4);
        g.restore();
      }
      circle(g, 100, 100, 26);
      paint(g, domeFill(g, 100, 100, 26, c.stone, 0.35), INK, LW);
      circle(g, 100, 100, 17);
      paint(g, f.dry ? '#6a5844' : shade(c.water, 0.1), INK, 1.4);
      circle(g, 100, 100, 7);
      paint(g, domeFill(g, 100, 100, 7, c.stone, 0.45), INK, 1.4);
      if (!f.dry) for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; line(g, 100 + Math.cos(a) * 9, 100 + Math.sin(a) * 9, 100 + Math.cos(a) * 14, 100 + Math.sin(a) * 14, alpha('#ffffff', 0.75), 1.6); }
    },
  },
  {
    id: 'font', name: 'Holy water font', cat: 'religious', sets: ['temple', 'crypt', 'castle'], tags: ['basin', 'holy water', 'font', 'blessing', 'baptism'],
    w: 1, h: 1, blocksMovement: true, c: { stone: STONE.marble, water: '#8fc7e8', aura: '#ffe9a8' },
    variants: [
      { name: 'Blessed, marble', c: {} },
      { name: 'Blessed, grey stone', c: { stone: STONE.grey } },
      { name: 'Unholy', c: { stone: STONE.dark, water: '#3e1f52', aura: '#9b5cff' } },
    ],
    desc: 'An eight-sided basin of holy (or unholy) water on a pedestal.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 50, c.aura, 0.4);
      const oct = (rad: number) => { const p: number[][] = []; for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + (i / 8) * TAU; p.push([50 + Math.cos(a) * rad, 50 + Math.sin(a) * rad]); } return p; };
      poly(g, oct(40));
      paint(g, litFill(g, 10, 10, 80, 80, c.stone, 0.28), INK, LW);
      poly(g, oct(31));
      paint(g, shade(c.stone, -0.3), INK, 1.4);
      g.save(); poly(g, oct(29)); g.clip();
      liquid(g, 50, 50, 30, 30, c.water, r);
      g.restore();
      for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + Math.PI / 4; circle(g, 50 + Math.cos(a) * 36, 50 + Math.sin(a) * 36, 2.2); paint(g, shade(c.aura, -0.1), INK, 0.8); }
      glow(g, 50, 50, 16, c.aura, 0.5);
    },
  },
  {
    id: 'prayer-kneeler', name: 'Prayer kneeler', cat: 'religious', sets: ['temple', 'castle', 'crypt'], tags: ['kneeler', 'prayer', 'bench', 'cushion', 'chapel'],
    w: 1, h: 1, c: { wood: WOOD.walnut, cloth: CLOTH.red },
    variants: [{ name: 'Red cushion', c: {} }, { name: 'Blue cushion', c: { cloth: CLOTH.blue } }, { name: 'Green cushion', c: { cloth: CLOTH.green } }, { name: 'Oak, purple', c: { wood: WOOD.oak, cloth: CLOTH.purple } }],
    desc: 'A low prayer bench with a book rest and a cushion.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const x of [14, 80]) board(g, x, 22, 6, 62, shade(c.wood, -0.15), r, 'v', 1);
      board(g, 12, 22, 76, 14, c.wood, r, 'h', 3);
      book(g, 38, 24, 22, 10, '#5a2a22', 0.05);
      cloth(g, 18, 56, 64, 24, c.cloth, r, 3, 8);
      for (const x of [26, 50, 74]) { circle(g, x, 68, 1.8); paint(g, shade(c.cloth, -0.4), null); }
    },
  },
  {
    id: 'pew', name: 'Pew', cat: 'furniture', sets: ['temple', 'castle', 'town'], tags: ['bench', 'church', 'seat', 'chapel', 'congregation'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak }, variants: vars('wood', WOOD),
    desc: 'A long wooden bench with a back. Worshippers face the bottom edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      board(g, 10, 40, 180, 38, c.wood, r, 'h');
      board(g, 10, 20, 180, 14, shade(c.wood, -0.12), r, 'h', 2);
      for (const x of [4, 184]) {
        rr(g, x, 16, 12, 68, 5);
        paint(g, litFill(g, x, 16, 12, 68, shade(c.wood, -0.2), 0.25), INK, LW);
        circle(g, x + 6, 22, 4.5);
        paint(g, domeFill(g, x + 6, 22, 4.5, shade(c.wood, 0.1), 0.4), INK, 1.2);
      }
      book(g, 120, 50, 18, 13, '#2c3e5a', 0.1);
    },
  },
  {
    id: 'pipe-organ', name: 'Pipe organ', cat: 'furniture', sets: ['temple', 'castle', 'crypt'], tags: ['organ', 'music', 'pipes', 'cathedral', 'haunted'],
    w: 3, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: '#c9ced3' },
    variants: [{ name: 'Walnut and tin', c: {} }, { name: 'Oak and brass', c: { wood: WOOD.oak, metal: METAL.brass } }, { name: 'Ebony and silver', c: { wood: WOOD.ebony, metal: METAL.silver } }],
    desc: 'A great organ against the wall (top edge), with console and bench.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 6, -2, 288, 52, 4);
      paint(g, litFill(g, 6, -2, 288, 52, c.wood, 0.2), INK, LW);
      grain(g, 6, 0, 288, 48, c.wood, r, 'h', 6);
      // pipe tops in two ranks, tallest in the middle
      for (let row = 0; row < 2; row++) {
        const n = 15;
        for (let i = 0; i < n; i++) {
          const x = 22 + i * 18.3 + row * 9, t = 1 - Math.abs(i - 7) / 8;
          const rad = 4 + t * 3.2 - row * 1;
          if (x > 284) continue;
          circle(g, x, 12 + row * 18, rad);
          paint(g, domeFill(g, x, 12 + row * 18, rad, c.metal, 0.5), INK, 1.1);
          circle(g, x, 12 + row * 18, rad * 0.45);
          g.fillStyle = '#141414'; g.fill();
        }
      }
      // console
      rr(g, 86, 48, 128, 24, 3);
      paint(g, litFill(g, 86, 48, 128, 24, shade(c.wood, -0.1), 0.2), INK, LW);
      rr(g, 94, 54, 112, 13, 1.5);
      paint(g, '#f1eadb', INK, 1.4);
      g.beginPath();
      for (let x = 94 + 5.6; x < 206; x += 5.6) { g.moveTo(x, 54); g.lineTo(x, 67); }
      g.strokeStyle = alpha(INK, 0.5); g.lineWidth = 0.7; g.stroke();
      for (let i = 0; i < 20; i++) { if (i % 7 === 2 || i % 7 === 6) continue; const x = 97 + i * 5.6; rr(g, x, 54, 3.2, 7, 0.6); g.fillStyle = '#16120f'; g.fill(); }
      for (const x of [70, 230]) for (let k = 0; k < 3; k++) { circle(g, x, 54 + k * 8, 3); paint(g, domeFill(g, x, 54 + k * 8, 3, k % 2 ? '#e8e0d0' : '#a3312c', 0.4), INK, 0.9); }
      board(g, 106, 76, 88, 14, shade(c.wood, 0.05), r, 'h', 2);
    },
  },
  {
    id: 'temple-bell', name: 'Bell', cat: 'religious', sets: ['temple', 'castle', 'town', 'ship'], tags: ['bell', 'alarm', 'gong', 'tower', 'chime'],
    w: 1, h: 1, blocksMovement: true, c: { metal: METAL.bronze, wood: WOOD.oak },
    variants: [{ name: 'Bronze', c: {} }, { name: 'Brass', c: { metal: METAL.brass } }, { name: 'Iron', c: { metal: METAL.iron } }],
    desc: 'A large bell hung in a wooden frame.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      circle(g, 50, 50, 32);
      paint(g, domeFill(g, 50, 50, 32, c.metal, 0.5), INK, LW);
      ringAt(g, 50, 50, 27, alpha(shade(c.metal, -0.5), 0.7), 1.4);
      ringAt(g, 50, 50, 18, alpha(shade(c.metal, 0.4), 0.6), 1.4);
      for (const x of [10, 90]) { rr(g, x - 7, 40, 14, 20, 2); paint(g, litFill(g, x - 7, 40, 14, 20, shade(c.wood, -0.15), 0.2), INK, LW); }
      board(g, 6, 44, 88, 12, c.wood, r, 'h', 2);
      strap(g, 42, 42, 16, 16, METAL.iron, false);
      rivet(g, 50, 50, 3, METAL.iron);
    },
  },
  {
    id: 'idol', name: 'Idol', cat: 'religious', sets: ['temple', 'cave', 'dungeon', 'forest', 'swamp', 'desert'], tags: ['idol', 'god', 'cult', 'effigy', 'treasure', 'statue'],
    w: 1, h: 1, blocksMovement: true, c: { body: '#4f9a72', eye: '#ff3b3b', stone: STONE.dark },
    variants: [
      { name: 'Jade', c: {} },
      { name: 'Gold', c: { body: '#d6a93a', eye: '#2fb8ff' } },
      { name: 'Obsidian', c: { body: '#2e2a33', eye: '#ffcf4a' } },
      { name: 'Clay', c: { body: '#a8643c', eye: '#5fe39a', stone: STONE.sand } },
    ],
    desc: 'A squat seated idol with gem eyes, on a low dais.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      circle(g, 50, 52, 42);
      paint(g, litFill(g, 8, 10, 84, 84, c.stone, 0.2), INK, LW);
      ringAt(g, 50, 52, 36, alpha(shade(c.stone, -0.6), 0.6), 1.2);
      speckle(g, 14, 14, 72, 72, r, 10, alpha('#000000', 0.2), 1);
      const b = c.body;
      ellipse(g, 50, 70, 30, 14);
      paint(g, domeFill(g, 50, 70, 30, b, 0.3), INK, 1.8);
      ellipse(g, 50, 58, 22, 18);
      paint(g, domeFill(g, 50, 56, 22, b, 0.4), INK, 1.8);
      for (const k of [-1, 1]) { ellipse(g, 50 + k * 20, 62, 6, 12, k * 0.5); paint(g, domeFill(g, 50 + k * 20, 62, 10, b, 0.3), INK, 1.4); }
      // headdress rays
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + 0.25 + (i / 6) * (Math.PI - 0.5);
        poly(g, [[50 + Math.cos(a - 0.15) * 16, 36 + Math.sin(a - 0.15) * 16], [50 + Math.cos(a) * 28, 36 + Math.sin(a) * 28], [50 + Math.cos(a + 0.15) * 16, 36 + Math.sin(a + 0.15) * 16]]);
        paint(g, shade(b, 0.15), INK, 1.2);
      }
      circle(g, 50, 38, 17);
      paint(g, domeFill(g, 50, 38, 17, b, 0.45), INK, LW);
      line(g, 40, 32, 46, 34, INK, 2);
      line(g, 54, 34, 60, 32, INK, 2);
      gem(g, 43, 38, 3.6, c.eye);
      gem(g, 57, 38, 3.6, c.eye);
      g.beginPath(); g.arc(50, 44, 7, 0.2, Math.PI - 0.2); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
      glow(g, 50, 38, 16, c.eye, 0.25);
    },
  },
  {
    id: 'obelisk', name: 'Obelisk', cat: 'structure', sets: ['temple', 'desert', 'crypt', 'wizard', 'forest'], tags: ['monolith', 'pillar', 'monument', 'runes', 'standing stone'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { stone: STONE.grey, rune: '#7fe0ff' },
    variants: [
      { name: 'Grey stone', c: {} },
      { name: 'Sandstone', c: { stone: STONE.sand } },
      { name: 'Black, red runes', c: { stone: '#2e2b2e', rune: '#ff5a4f' }, f: { runes: 1 } },
      { name: 'Dark, glowing runes', c: { stone: STONE.dark, rune: '#5fe39a' }, f: { runes: 1 } },
    ],
    desc: 'A tapering stone needle seen from above, pyramid tip in the centre.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 8, 8, 84, 84, 3);
      paint(g, litFill(g, 8, 8, 84, 84, shade(c.stone, -0.15), 0.2), INK, LW);
      bevel(g, 8, 8, 84, 84, 3, 0.25);
      if (f.runes) glow(g, 50, 50, 48, c.rune, 0.35);
      const A = [22, 22], B = [78, 22], C = [78, 78], D = [22, 78], M = [50, 50];
      const faces: [number[], number[], number][] = [[A, B, 0.3], [D, A, 0.15], [B, C, -0.25], [C, D, -0.4]];
      for (const [p, q, s] of faces) { poly(g, [p, q, M]); paint(g, shade(c.stone, s), INK, 1.6); }
      speckle(g, 24, 24, 52, 52, r, 10, alpha(shade(c.stone, -0.6), 0.3), 0.9);
      if (f.runes) {
        rune(g, 50, 32, 8, r, c.rune, 1.6);
        rune(g, 50, 68, 8, r, c.rune, 1.6);
        rune(g, 32, 50, 8, r, c.rune, 1.6, Math.PI / 2);
        rune(g, 68, 50, 8, r, c.rune, 1.6, Math.PI / 2);
      }
    },
  },
  {
    id: 'shrine', name: 'Wayside shrine', cat: 'religious', sets: ['temple', 'forest', 'town', 'farm', 'crypt'], tags: ['shrine', 'icon', 'offering', 'roadside', 'prayer'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 5, dim: 5, color: CANDLE }, c: { roof: '#6b4a3a', wood: WOOD.oak },
    variants: [{ name: 'Wood and shingle', c: {} }, { name: 'Stone', c: { roof: STONE.grey, wood: STONE.sand } }, { name: 'Painted', c: { roof: '#2f5d8a', wood: '#c9b27f' } }],
    desc: 'A small roofed shrine with an icon and a candle. The open side faces the bottom edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 10, 10, 80, 82, 3);
      paint(g, litFill(g, 10, 10, 80, 82, shade(c.wood, -0.1), 0.2), INK, LW);
      rr(g, 24, 64, 52, 26, 2);
      paint(g, '#2a1c14', INK, 1.4);
      coins(g, 40, 82, 5, 4, r);
      glow(g, 60, 78, 22, '#ffb347', 0.5);
      candle(g, 60, 78, 4, r);
      // gable roof, ridge across
      rr(g, 14, 6, 72, 30, 2);
      paint(g, litFill(g, 14, 6, 72, 30, shade(c.roof, 0.12), 0.15), INK, LW);
      rr(g, 14, 36, 72, 30, 2);
      paint(g, litFill(g, 14, 36, 72, 30, shade(c.roof, -0.2), 0.15), INK, LW);
      for (let y = 12; y < 66; y += 7) if (Math.abs(y - 36) > 3) line(g, 16, y, 84, y, alpha(shade(c.roof, -0.5), 0.5), 1);
      line(g, 14, 36, 86, 36, INK, 3);
    },
  },
  {
    id: 'offering-bowl', name: 'Offering bowl', cat: 'religious', sets: ['temple', 'crypt', 'forest', 'desert', 'cave'], tags: ['offering', 'tribute', 'incense', 'bowl', 'coins'],
    w: 1, h: 1, c: { metal: METAL.bronze },
    variants: [{ name: 'Coins', c: {}, f: { k: 0 } }, { name: 'Fruit', c: { metal: METAL.brass }, f: { k: 1 } }, { name: 'Incense', c: {}, f: { k: 2 } }, { name: 'Blood', c: { metal: METAL.black }, f: { k: 3 } }],
    desc: 'A footed bowl of offerings.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i / 3) * TAU; circle(g, 50 + Math.cos(a) * 34, 50 + Math.sin(a) * 34, 5); paint(g, domeFill(g, 50 + Math.cos(a) * 34, 50 + Math.sin(a) * 34, 5, c.metal, 0.4), INK, 1.2); }
      circle(g, 50, 50, 32);
      paint(g, domeFill(g, 50, 50, 32, c.metal, 0.4), INK, LW);
      circle(g, 50, 50, 25);
      paint(g, shade(c.metal, -0.45), INK, 1.4);
      if (f.k === 0) coins(g, 50, 50, 17, 22, r);
      else if (f.k === 1) {
        for (const [x, y, rad, col] of [[42, 44, 8, '#c0392b'], [58, 46, 7, '#7cb342'], [48, 58, 7.5, '#8e44ad'], [60, 58, 5, '#e1a33a'], [38, 56, 5, '#d35400']] as const) {
          circle(g, x, y, rad); paint(g, domeFill(g, x, y, rad, col, 0.45), INK, 1.1);
        }
      } else if (f.k === 2) {
        for (let i = 0; i < 10; i++) { circle(g, 38 + r() * 24, 38 + r() * 24, 2 + r() * 3); paint(g, r() < 0.5 ? '#3a2219' : '#e2481b', null); }
        for (let i = 0; i < 3; i++) {
          g.beginPath(); g.moveTo(50 + i * 4 - 4, 50);
          g.bezierCurveTo(30 + i * 10, 34, 64 - i * 6, 24, 44 + i * 8, 8);
          g.strokeStyle = alpha('#e8e4f0', 0.55); g.lineWidth = 3; g.stroke();
        }
      } else {
        circle(g, 50, 50, 22); paint(g, domeFill(g, 50, 50, 22, '#6e0b0e', 0.3), null);
        ellipse(g, 44, 44, 6, 3, -0.5); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fill();
      }
    },
  },
  {
    id: 'tomb-niche', name: 'Tomb niche', cat: 'religious', sets: ['crypt', 'dungeon', 'temple'], tags: ['niche', 'loculus', 'catacomb', 'burial', 'shelf', 'wall'],
    w: 1, h: 1, c: { stone: STONE.grey, shroud: '#d8ccb0' },
    variants: [{ name: 'Shrouded body', c: {}, f: { k: 0 } }, { name: 'Bones', c: {}, f: { k: 1 } }, { name: 'Empty', c: {}, f: { k: 2 } }, { name: 'Dark stone, shrouded', c: { stone: STONE.dark }, f: { k: 0 } }],
    desc: 'A burial recess cut into the wall (top edge).',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 4, -4, 92, 72, 3);
      paint(g, litFill(g, 4, -4, 92, 72, shade(c.stone, -0.1), 0.2), INK, LW);
      blocks(g, 6, 0, 88, 66, shade(c.stone, -0.1), r, 22, 14);
      rr(g, 14, 0, 72, 52, 3);
      const gr = g.createLinearGradient(0, 0, 0, 52);
      gr.addColorStop(0, '#0e0a08'); gr.addColorStop(1, '#2e241c');
      paint(g, gr, INK, 1.8);
      if (f.k === 0) {
        blob(g, [[20, 26], [30, 16], [74, 18], [82, 26], [74, 36], [30, 38]]);
        paint(g, litFill(g, 20, 16, 62, 22, c.shroud, 0.25), INK, 1.4);
        circle(g, 28, 27, 8); paint(g, domeFill(g, 28, 27, 8, c.shroud, 0.3), INK, 1.2);
        for (const x of [42, 54, 66]) line(g, x, 18, x + 3, 36, alpha(shade(c.shroud, -0.5), 0.6), 1.1);
      } else if (f.k === 1) {
        skull(g, 28, 26, 9, BONE, -0.3);
        boneAt(g, 42, 20, 76, 26, 4);
        boneAt(g, 44, 34, 72, 30, 3.6);
      }
      rr(g, 10, 50, 80, 12, 2);
      paint(g, litFill(g, 10, 50, 80, 12, shade(c.stone, 0.1), 0.25), INK, 1.6);
      candle(g, 78, 74, 4, r);
    },
  },
  {
    id: 'urn', name: 'Funeral urns', cat: 'decor', sets: ['crypt', 'temple', 'desert', 'castle'], tags: ['urn', 'ashes', 'jar', 'vase', 'pottery', 'canopic'],
    w: 1, h: 1, blocksMovement: true, c: { body: '#b5653a', trim: CLOTH.gold },
    variants: [{ name: 'Terracotta', c: {} }, { name: 'Bronze', c: { body: METAL.bronze, trim: '#2a2a2a' } }, { name: 'Marble', c: { body: STONE.marble, trim: '#7a8f9a' } }, { name: 'Black glaze', c: { body: '#2c2a2e', trim: '#c9a24a' } }],
    desc: 'A group of lidded funeral urns.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const pots = [[42, 54, 25], [76, 26, 13], [78, 76, 11], [20, 22, 9]];
      for (const [x, y, rad] of pots) {
        circle(g, x, y, rad);
        paint(g, domeFill(g, x, y, rad, c.body, 0.4), INK, rad > 12 ? LW : 1.6);
        ringAt(g, x, y, rad * 0.78, c.trim, Math.max(1.4, rad * 0.12));
        circle(g, x, y, rad * 0.5);
        paint(g, domeFill(g, x, y, rad * 0.5, shade(c.body, -0.1), 0.4), INK, 1.2);
        circle(g, x, y, rad * 0.18);
        paint(g, c.trim, INK, 0.8);
      }
      speckle(g, 20, 30, 50, 50, r, 6, alpha('#000000', 0.15), 1);
    },
  },
  {
    id: 'skull-pile', name: 'Skull pile', cat: 'decor', sets: ['crypt', 'dungeon', 'cave', 'temple'], tags: ['skulls', 'bones', 'ossuary', 'remains', 'macabre', 'necromancer'],
    w: 1, h: 1, difficult: true, c: { bone: BONE }, variants: [{ name: 'Old bone', c: {} }, { name: 'Bleached', c: { bone: '#f2efe6' } }, { name: 'Charred', c: { bone: '#8a8072' } }],
    desc: 'A heap of skulls and bones. Difficult terrain.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 52, 42, 0.25, 12, r, 38));
      paint(g, shade(c.bone, -0.55), INK, LW);
      for (let i = 0; i < 6; i++) { const a = r() * TAU; boneAt(g, 50 + Math.cos(a) * 18, 52 + Math.sin(a) * 18, 50 + Math.cos(a) * 40, 52 + Math.sin(a) * 36, 4, shade(c.bone, -0.1)); }
      const spots = [[30, 66], [52, 72], [72, 62], [24, 44], [70, 40], [44, 52], [58, 54], [38, 32], [60, 28], [50, 40]];
      spots.forEach(([x, y], i) => skull(g, x + (r() - 0.5) * 4, y + (r() - 0.5) * 4, i > 6 ? 10.5 : 9.5, shade(c.bone, i > 6 ? 0.05 : -0.05), (r() - 0.5) * 1.2));
    },
  },
  {
    id: 'open-grave', name: 'Open grave', cat: 'terrain', sets: ['crypt', 'town', 'forest', 'swamp'], tags: ['grave', 'pit', 'burial', 'graveyard', 'cemetery', 'dig'],
    w: 1, h: 2, c: { dirt: '#6b4f35', stone: STONE.grey },
    variants: [{ name: 'With headstone', c: {}, f: { stone: 1 } }, { name: 'Fresh dig', c: {} }, { name: 'Disturbed coffin', c: {}, f: { stone: 1, coffin: 1 } }],
    desc: 'A dug grave with a mound of earth and a spade.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.stone) {
        poly(g, [[24, 24], [24, 12], [34, 4], [66, 4], [76, 12], [76, 24]]);
        paint(g, litFill(g, 24, 4, 52, 20, c.stone, 0.3), INK, LW);
        line(g, 50, 8, 50, 20, alpha(shade(c.stone, -0.6), 0.8), 1.6);
        line(g, 44, 12, 56, 12, alpha(shade(c.stone, -0.6), 0.8), 1.6);
      }
      rr(g, 16, 30, 68, 120, 4);
      paint(g, litFill(g, 16, 30, 68, 120, shade(c.dirt, 0.05), 0.2), INK, LW);
      rr(g, 23, 37, 54, 106, 3);
      const gr = g.createLinearGradient(23, 37, 77, 143);
      gr.addColorStop(0, '#120c08'); gr.addColorStop(1, '#2c1f15');
      paint(g, gr, INK, 1.6);
      if (f.coffin) {
        poly(g, [[38, 60], [62, 60], [70, 82], [62, 132], [38, 132], [30, 82]]);
        paint(g, litFill(g, 30, 60, 40, 72, WOOD.walnut, 0.2), INK, 1.6);
        line(g, 34, 92, 64, 104, '#1a120c', 3);
        line(g, 40, 76, 52, 120, alpha('#1a120c', 0.8), 2);
      }
      blob(g, lumpy(50, 172, 42, 0.3, 11, r, 24));
      paint(g, domeFill(g, 50, 170, 42, c.dirt, 0.3), INK, LW);
      for (let i = 0; i < 9; i++) { circle(g, 18 + r() * 64, 156 + r() * 32, 2 + r() * 3); paint(g, shade(c.dirt, (r() - 0.5) * 0.4), alpha(INK, 0.5), 0.6); }
      line(g, 70, 148, 88, 186, INK, 5);
      line(g, 70, 148, 88, 186, WOOD.pine, 3);
      poly(g, [[62, 136], [76, 130], [80, 146], [70, 152]]);
      paint(g, litFill(g, 62, 130, 18, 22, METAL.iron, 0.4), INK, 1.4);
    },
  },
  {
    id: 'ossuary-shelf', name: 'Ossuary shelf', cat: 'storage', sets: ['crypt', 'dungeon', 'temple'], tags: ['ossuary', 'skulls', 'bones', 'catacomb', 'shelf', 'wall'],
    w: 2, h: 1, blocksMovement: true, c: { stone: STONE.grey, bone: BONE },
    variants: [{ name: 'Stone', c: {} }, { name: 'Dark stone', c: { stone: STONE.dark } }, { name: 'Wood', c: { stone: WOOD.walnut } }],
    desc: 'Wall shelving (top edge) packed with stacked long bones and skulls.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 4, -2, 192, 62, 3);
      paint(g, litFill(g, 4, -2, 192, 62, c.stone, 0.2), INK, LW);
      for (let i = 0; i < 5; i++) {
        const x = 10 + i * 37;
        rr(g, x, 2, 32, 50, 2);
        paint(g, '#1c1612', INK, 1.4);
        for (let k = 0; k < 5; k++) line(g, x + 3, 8 + k * 5, x + 29, 8 + k * 5, shade(c.bone, -0.2 + r() * 0.15), 3.4);
        skull(g, x + 16, 40, 9.5, c.bone, (r() - 0.5) * 0.4);
      }
    },
  },
  {
    id: 'burial-slab', name: 'Burial slab', cat: 'religious', sets: ['crypt', 'temple', 'dungeon'], tags: ['slab', 'corpse', 'body', 'bier', 'morgue', 'shroud'],
    w: 1, h: 2, blocksMovement: true, c: { stone: STONE.grey, shroud: '#ddd2b8' },
    variants: [{ name: 'Linen shroud', c: {} }, { name: 'Black shroud', c: { shroud: '#2e2b30' } }, { name: 'Bare, stained', c: {}, f: { bare: 1 } }, { name: 'Marble, linen', c: { stone: STONE.marble } }],
    desc: 'A stone bier with a shrouded body laid out.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 12, 8, 76, 184, 4);
      paint(g, litFill(g, 12, 8, 76, 184, c.stone, 0.22), INK, LW);
      bevel(g, 12, 8, 76, 184, 4, 0.3);
      speckle(g, 14, 10, 72, 180, r, 20, alpha(shade(c.stone, -0.5), 0.3), 1);
      if (f.bare) {
        for (let i = 0; i < 3; i++) { blob(g, lumpy(36 + r() * 28, 50 + i * 45, 10 + r() * 6, 0.5, 8, r)); paint(g, alpha('#5c0a0c', 0.65), null); }
        return;
      }
      const s = c.shroud;
      blob(g, [[34, 52], [50, 46], [66, 52], [70, 80], [64, 130], [58, 176], [42, 176], [36, 130], [30, 80]]);
      paint(g, litFill(g, 30, 46, 40, 130, s, 0.25), INK, 1.8);
      ellipse(g, 50, 36, 12, 14);
      paint(g, domeFill(g, 50, 36, 14, s, 0.35), INK, 1.8);
      g.save();
      blob(g, [[34, 52], [50, 46], [66, 52], [70, 80], [64, 130], [58, 176], [42, 176], [36, 130], [30, 80]]);
      g.clip();
      for (let y = 64; y < 176; y += 16) line(g, 28, y, 72, y + 6, alpha(shade(s, -0.45), 0.6), 1.3);
      g.restore();
      for (const [x, y, col] of [[24, 180, '#c0392b'], [76, 182, '#e9c46a'], [22, 172, '#f2f2f2']] as const) { circle(g, x, y, 3.6); paint(g, col, INK, 0.8); }
    },
  },
];

// ---------- light sources ----------
const LIGHTS: ObjDef[] = [
  {
    id: 'candelabra', name: 'Candelabra', cat: 'light', sets: ['castle', 'crypt', 'temple', 'wizard', 'tavern'], tags: ['candles', 'candlestick', 'light', 'gothic', 'vampire'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 10, dim: 10, color: CANDLE }, c: { metal: METAL.brass, wax: '#efe4c8' },
    variants: [{ name: 'Brass', c: {} }, { name: 'Silver', c: { metal: METAL.silver } }, { name: 'Black iron', c: { metal: METAL.black } }, { name: 'Black candles', c: { metal: METAL.iron, wax: '#3a3438' } }],
    desc: 'A standing branched candlestick with five candles.',
    draw: ({ g, c }) => {
      glow(g, 50, 50, 50, '#ffb347', 0.4);
      circle(g, 50, 50, 22);
      paint(g, domeFill(g, 50, 50, 22, shade(c.metal, -0.2), 0.3), INK, 1.6);
      const arms: number[][] = [];
      for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + (i / 4) * TAU; arms.push([50 + Math.cos(a) * 27, 50 + Math.sin(a) * 27]); }
      for (const [x, y] of arms) { line(g, 50, 50, x, y, INK, 6); line(g, 50, 50, x, y, shade(c.metal, 0.1), 3.6); }
      for (const [x, y] of [...arms, [50, 50]]) {
        circle(g, x, y, 9);
        paint(g, domeFill(g, x, y, 9, c.metal, 0.5), INK, 1.4);
        circle(g, x, y, 5.5);
        paint(g, domeFill(g, x, y, 5.5, c.wax, 0.35), INK, 1);
        glow(g, x, y, 12, '#ffb347', 0.5);
        ellipse(g, x + 0.5, y - 1, 2, 3, 0.3);
        paint(g, '#ffd166', alpha('#c2410c', 0.9), 0.8);
      }
    },
  },
  {
    id: 'lantern-standing', name: 'Lantern', cat: 'light', sets: ['camp', 'dungeon', 'mine', 'ship', 'tavern', 'sewer'], tags: ['lantern', 'lamp', 'oil', 'light', 'hooded'],
    w: 1, h: 1, light: { bright: 15, dim: 15, color: '#ffc46b' }, c: { metal: METAL.iron, light: '#ffcf70' },
    variants: [{ name: 'Iron', c: {} }, { name: 'Brass', c: { metal: METAL.brass } }, { name: 'Ghost-light', c: { metal: METAL.black, light: '#8dffb0' } }],
    desc: 'An oil lantern set on the floor.',
    draw: ({ g, c }) => lanternTop(g, 50, 50, 25, c.metal, c.light),
  },
  {
    id: 'lamp-post', name: 'Lamp post', cat: 'light', sets: ['town', 'castle', 'market'], tags: ['street lamp', 'lamp', 'post', 'lantern', 'light'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 20, dim: 20, color: '#ffc46b' }, c: { metal: METAL.black, light: '#ffcf70', stone: STONE.grey },
    variants: [{ name: 'Black iron', c: {} }, { name: 'Brass', c: { metal: METAL.brass } }, { name: 'Magelight', c: { metal: METAL.iron, light: '#9fd8ff' } }],
    desc: 'A street lamp on a post, seen from above.',
    draw: ({ g, c }) => {
      rr(g, 26, 26, 48, 48, 4);
      paint(g, litFill(g, 26, 26, 48, 48, c.stone, 0.2), INK, 1.6);
      for (const k of [-1, 1]) { line(g, 50, 50, 50 + k * 22, 50, INK, 5); line(g, 50, 50, 50 + k * 22, 50, c.metal, 3); }
      lanternTop(g, 50, 50, 22, c.metal, c.light);
      poly(g, [[50, 36], [64, 50], [50, 64], [36, 50]]);
      paint(g, litFill(g, 36, 36, 28, 28, c.metal, 0.4), INK, 1.3);
      circle(g, 50, 50, 3.5);
      paint(g, domeFill(g, 50, 50, 3.5, c.metal, 0.6), INK, 1);
    },
  },
  {
    id: 'lantern-hanging', name: 'Hanging lantern', cat: 'light', sets: ['tavern', 'castle', 'ship', 'dungeon', 'town', 'wizard'], tags: ['lantern', 'chandelier', 'ceiling', 'lamp', 'light'],
    w: 1, h: 1, layer: 'overhead', light: { bright: 15, dim: 15, color: '#ffc46b' }, c: { metal: METAL.iron, light: '#ffcf70' },
    variants: [{ name: 'Iron', c: {} }, { name: 'Brass', c: { metal: METAL.brass } }, { name: 'Ghost-light', c: { metal: METAL.black, light: '#8dffb0' } }],
    desc: 'A lantern hanging from the ceiling on a chain. Drawn over tokens.',
    draw: ({ g, c }) => {
      chain(g, 50, 2, 50, 30, c.metal, 3.2);
      lanternTop(g, 50, 54, 22, c.metal, c.light);
    },
  },
  {
    id: 'sconce-witchfire', name: 'Witch-fire sconce', cat: 'light', sets: ['crypt', 'dungeon', 'swamp', 'wizard', 'temple'], tags: ['torch', 'green fire', 'sconce', 'cursed', 'necromancer', 'light'],
    w: 1, h: 1, light: { bright: 20, dim: 20, color: '#59e08a' }, c: { metal: METAL.black, wood: WOOD.ebony, fire: '#59e08a' },
    variants: [{ name: 'Black iron', c: {} }, { name: 'Bronze', c: { metal: METAL.bronze } }],
    desc: 'A wall torch burning with eerie green flame. Top edge against a wall.',
    draw: ({ g, c, seed }) => drawSconce(g, c, seed),
  },
  {
    id: 'sconce-magefire', name: 'Magefire sconce', cat: 'light', sets: ['wizard', 'castle', 'temple', 'dungeon'], tags: ['torch', 'blue fire', 'sconce', 'magic', 'continual flame', 'light'],
    w: 1, h: 1, light: { bright: 20, dim: 20, color: '#6fc3ff' }, c: { metal: METAL.silver, wood: WOOD.ebony, fire: '#5ab8ff' },
    variants: [{ name: 'Silver', c: {} }, { name: 'Brass', c: { metal: METAL.brass } }],
    desc: 'A wall sconce holding a cold blue magical flame. Top edge against a wall.',
    draw: ({ g, c, seed }) => drawSconce(g, c, seed),
  },
  {
    id: 'brazier-everburning', name: 'Everburning brazier', cat: 'light', sets: ['wizard', 'temple', 'castle', 'dungeon'], tags: ['brazier', 'magic fire', 'runes', 'eternal flame', 'light'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 10, dim: 10, color: '#a98bff' }, c: { stone: STONE.dark, fire: '#a77bff', rune: '#d6b0ff' },
    variants: [{ name: 'Violet', c: {} }, { name: 'Blue', c: { fire: '#4cb8ff', rune: '#a8e2ff' } }, { name: 'Green', c: { fire: '#59e08a', rune: '#b6f5c9' } }, { name: 'Gold', c: { stone: STONE.marble, fire: '#ffb02e', rune: '#ffe08a' } }],
    desc: 'A rune-cut stone bowl whose flame never goes out.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const pts: number[][] = [];
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; pts.push([50 + Math.cos(a) * 42, 50 + Math.sin(a) * 42]); }
      poly(g, pts);
      paint(g, litFill(g, 8, 8, 84, 84, c.stone, 0.25), INK, LW);
      circle(g, 50, 50, 32);
      paint(g, domeFill(g, 50, 50, 32, shade(c.stone, 0.1), 0.3), INK, 1.8);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; rune(g, 50 + Math.cos(a) * 27, 50 + Math.sin(a) * 27, 6, r, c.rune, 1.4, a + Math.PI / 2); }
      circle(g, 50, 50, 21);
      paint(g, '#120e16', INK, 1.4);
      fireAt(g, 50, 50, 14, r, c.fire);
    },
  },
];

// ---------- the wizard's tower ----------
const ARCANE: ObjDef[] = [
  {
    id: 'orrery', name: 'Arcane orrery', cat: 'arcane', sets: ['wizard', 'castle'], tags: ['orrery', 'planets', 'astronomy', 'clockwork', 'brass', 'stars'],
    w: 2, h: 2, blocksMovement: true, c: { metal: METAL.brass, wood: WOOD.walnut, sun: '#ffcf4a' },
    variants: [{ name: 'Brass', c: {} }, { name: 'Silver', c: { metal: METAL.silver, sun: '#9fd8ff' } }, { name: 'Bronze', c: { metal: METAL.bronze, wood: WOOD.ebony, sun: '#ff8a4a' } }],
    desc: 'A brass model of the heavens on a round wooden table.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      circle(g, 100, 100, 90);
      paint(g, domeFill(g, 100, 100, 90, c.wood, 0.2), INK, LW);
      ringAt(g, 100, 100, 84, c.metal, 4);
      for (let i = 0; i < 36; i++) { const a = (i / 36) * TAU; line(g, 100 + Math.cos(a) * 80, 100 + Math.sin(a) * 80, 100 + Math.cos(a) * (i % 3 ? 76 : 72), 100 + Math.sin(a) * (i % 3 ? 76 : 72), alpha(shade(c.metal, 0.3), 0.9), 1.2); }
      const orbits = [26, 42, 56, 70];
      const cols = ['#c97b4a', '#4f8fd0', '#d9c27a', '#9a6ad0'];
      orbits.forEach((rad, i) => {
        ringAt(g, 100, 100, rad, alpha(INK, 0.6), 3);
        ringAt(g, 100, 100, rad, alpha(c.metal, 0.9), 1.4);
        const a = r() * TAU, x = 100 + Math.cos(a) * rad, y = 100 + Math.sin(a) * rad;
        line(g, 100, 100, x, y, INK, 3.6);
        line(g, 100, 100, x, y, c.metal, 2);
        const pr = 5 + (i % 2) * 2.5;
        if (i === 2) { ellipse(g, x, y, pr * 2, pr * 0.7, a); g.strokeStyle = INK; g.lineWidth = 2.6; g.stroke(); g.strokeStyle = shade(c.metal, 0.3); g.lineWidth = 1.4; g.stroke(); }
        circle(g, x, y, pr);
        paint(g, domeFill(g, x, y, pr, cols[i], 0.5), INK, 1.3);
        if (i === 1) { circle(g, x + 10, y - 4, 2.2); paint(g, '#d8d8d8', INK, 0.7); }
      });
      glow(g, 100, 100, 30, c.sun, 0.55);
      circle(g, 100, 100, 12);
      paint(g, domeFill(g, 100, 100, 12, c.sun, 0.55), INK, 1.8);
    },
  },
  {
    id: 'telescope', name: 'Telescope', cat: 'arcane', sets: ['wizard', 'castle', 'ship'], tags: ['telescope', 'spyglass', 'astronomy', 'stars', 'observatory'],
    w: 2, h: 1, blocksMovement: true, c: { metal: METAL.brass, wood: WOOD.walnut },
    variants: [{ name: 'Brass', c: {} }, { name: 'Silver', c: { metal: METAL.silver, wood: WOOD.ebony } }, { name: 'Bronze', c: { metal: METAL.bronze, wood: WOOD.oak } }],
    desc: 'A great brass telescope on a wooden tripod, aimed at the sky.',
    draw: ({ g, c }) => {
      for (const [x, y] of [[30, 16], [32, 86], [86, 52]]) { line(g, 60, 52, x, y, INK, 7); line(g, 60, 52, x, y, c.wood, 4.5); circle(g, x, y, 4); paint(g, shade(c.metal, -0.1), INK, 1.1); }
      g.save();
      g.translate(60, 52);
      g.rotate(-0.22);
      poly(g, [[-36, -7], [130, -15], [130, 15], [-36, 7]]);
      const gr = g.createLinearGradient(0, -15, 0, 15);
      gr.addColorStop(0, shade(c.metal, 0.4)); gr.addColorStop(0.4, c.metal); gr.addColorStop(1, shade(c.metal, -0.45));
      paint(g, gr, INK, LW);
      for (const x of [-20, 30, 80]) { rr(g, x, -12 - x * 0.05, 7, 24 + x * 0.1, 2); paint(g, shade(c.metal, -0.2), INK, 1.2); }
      rr(g, 126, -17, 10, 34, 3);
      paint(g, shade(c.metal, 0.1), INK, 1.6);
      ellipse(g, 134, 0, 4, 14);
      paint(g, alpha('#9fd8ff', 0.85), INK, 1);
      rr(g, -46, -4, 12, 8, 2);
      paint(g, shade(c.metal, -0.3), INK, 1.2);
      g.restore();
      circle(g, 60, 52, 7);
      paint(g, domeFill(g, 60, 52, 7, c.metal, 0.5), INK, 1.4);
    },
  },
  {
    id: 'alchemy-table', name: 'Alchemy table', cat: 'arcane', sets: ['wizard', 'castle', 'town', 'swamp'], tags: ['alchemy', 'potions', 'lab', 'flasks', 'apothecary', 'workbench'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut },
    variants: vars('wood', { walnut: WOOD.walnut, oak: WOOD.oak, ebony: WOOD.ebony }),
    desc: 'A cluttered workbench with flasks, a retort over a burner, a mortar and an open book.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      planks(g, 6, 8, 188, 84, c.wood, r, 'h', 4);
      rr(g, 6, 8, 188, 84, 3); g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
      // spill and scorch
      blob(g, lumpy(120, 70, 14, 0.5, 8, r, 8)); paint(g, alpha('#6fd36a', 0.55), null);
      // open book
      g.save(); g.translate(40, 50); g.rotate(-0.12);
      rr(g, -28, -18, 56, 36, 2); paint(g, '#5a2a22', INK, 1.4);
      rr(g, -25, -15, 24, 30, 1); paint(g, '#efe6cf', INK, 0.8);
      rr(g, 1, -15, 24, 30, 1); paint(g, '#efe6cf', INK, 0.8);
      for (let i = 0; i < 4; i++) { line(g, -21, -9 + i * 6, -5, -9 + i * 6, 'rgba(60,40,20,0.5)', 0.8); line(g, 5, -9 + i * 6, 21, -9 + i * 6, 'rgba(60,40,20,0.5)', 0.8); }
      g.restore();
      // burner and retort
      circle(g, 104, 34, 10); paint(g, domeFill(g, 104, 34, 10, METAL.iron, 0.4), INK, 1.4);
      fireAt(g, 104, 34, 5, r, '#4cb8ff');
      line(g, 104, 34, 140, 22, INK, 5); line(g, 104, 34, 140, 22, alpha('#cfeaf2', 0.9), 3);
      circle(g, 104, 34, 12); paint(g, alpha('#b04ad0', 0.7), INK, 1.4);
      circle(g, 100, 30, 3); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fill();
      // flasks
      for (const [x, y, rad, col] of [[156, 28, 9, '#d94b4b'], [176, 44, 7, '#4fb3ff'], [158, 64, 8, '#e9c46a'], [178, 74, 6, '#5fe39a'], [138, 44, 5, '#c08cff']] as const) bottle(g, x, y, rad, col);
      // mortar and pestle
      circle(g, 84, 74, 10); paint(g, domeFill(g, 84, 74, 10, STONE.grey, 0.3), INK, 1.4);
      circle(g, 84, 74, 6.5); paint(g, '#3a3530', null);
      line(g, 82, 74, 96, 62, INK, 4.4); line(g, 82, 74, 96, 62, '#cfc9bf', 2.6);
      for (let i = 0; i < 3; i++) gem(g, 108 + i * 8, 84 - i * 3, 3, ['#ff6b6b', '#6cc8ff', '#b57cff'][i]);
    },
  },
  {
    id: 'potion-rack', name: 'Potion rack', cat: 'storage', sets: ['wizard', 'town', 'market', 'castle', 'swamp'], tags: ['potions', 'shelf', 'bottles', 'apothecary', 'alchemy', 'wall'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut },
    variants: vars('wood', { walnut: WOOD.walnut, oak: WOOD.oak, ebony: WOOD.ebony }),
    desc: 'Wall shelves (top edge) lined with coloured potion bottles.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 4, -2, 192, 60, 3);
      paint(g, litFill(g, 4, -2, 192, 60, shade(c.wood, -0.25), 0.15), INK, LW);
      const cols = ['#d94b4b', '#4fb3ff', '#5fe39a', '#c08cff', '#e9c46a', '#ff8fd0', '#f2f2f2', '#ff8a3a'];
      for (const y of [16, 42]) {
        board(g, 6, y + 8, 188, 6, c.wood, r, 'h', 1);
        for (let x = 14; x < 190; x += 11 + r() * 6) {
          const rad = 3.6 + r() * 2.4;
          bottle(g, x, y + 2, rad, cols[Math.floor(r() * cols.length)]);
        }
      }
    },
  },
  {
    id: 'crystal-ball', name: 'Crystal ball', cat: 'arcane', sets: ['wizard', 'town', 'market', 'camp'], tags: ['scrying', 'orb', 'fortune', 'divination', 'seer'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 0, dim: 5, color: '#b48cff' }, c: { cloth: CLOTH.purple, trim: CLOTH.gold, orb: '#b48cff' },
    variants: [{ name: 'Purple cloth', c: {} }, { name: 'Midnight blue', c: { cloth: '#1f2f5a', orb: '#7fd3ff' } }, { name: 'Black, green mist', c: { cloth: CLOTH.black, orb: '#7dff9e' } }],
    desc: 'A scrying orb on a clawed stand, on a draped round table.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 50, 44, 0.12, 14, r));
      paint(g, domeFill(g, 50, 50, 44, c.cloth, 0.25), INK, LW);
      ringAt(g, 50, 50, 36, c.trim, 2);
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i / 3) * TAU; line(g, 50, 50, 50 + Math.cos(a) * 24, 50 + Math.sin(a) * 24, INK, 6); line(g, 50, 50, 50 + Math.cos(a) * 24, 50 + Math.sin(a) * 24, METAL.brass, 3.6); }
      glow(g, 50, 50, 34, c.orb, 0.55);
      circle(g, 50, 50, 19);
      const gr = g.createRadialGradient(44, 43, 2, 50, 50, 20);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, mix(c.orb, '#ffffff', 0.4)); gr.addColorStop(1, shade(c.orb, -0.45));
      paint(g, gr, INK, 1.8);
      g.beginPath(); g.arc(52, 52, 9, 0.5, 3.6); g.strokeStyle = alpha('#ffffff', 0.6); g.lineWidth = 1.6; g.stroke();
      g.beginPath(); g.arc(48, 50, 13, 2.6, 5.4); g.strokeStyle = alpha(shade(c.orb, -0.3), 0.6); g.lineWidth = 1.4; g.stroke();
      circle(g, 43, 42, 3.4); g.fillStyle = 'rgba(255,255,255,0.9)'; g.fill();
    },
  },
  {
    id: 'summoning-circle', name: 'Summoning circle', cat: 'arcane', sets: ['wizard', 'temple', 'crypt', 'dungeon', 'cave'], tags: ['summoning', 'ritual', 'circle', 'demon', 'elemental', 'binding', 'portal'],
    w: 3, h: 3, layer: 'floor', flat: true, c: { line: '#ffb36b', glow: '#ff5a1f' },
    variants: [
      { name: 'Fire', c: {}, f: { k: 0 } },
      { name: 'Frost', c: { line: '#c8f3ff', glow: '#59c8ff' }, f: { k: 1 } },
      { name: 'Necrotic', c: { line: '#b6f59a', glow: '#4f9a3a' }, f: { k: 2 } },
      { name: 'Holy', c: { line: '#fff1b8', glow: '#ffd36e' }, f: { k: 3 } },
    ],
    desc: 'A binding circle themed to what it calls: fire, frost, the dead or the divine. Candles mark the points.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const cx = w / 2, cy = h / 2, R = 124;
      const pts = [7, 6, 5, 8][f.k ?? 0];
      if (f.k === 3) for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; g.beginPath(); g.moveTo(cx + Math.cos(a) * R * 1.02, cy + Math.sin(a) * R * 1.02); g.lineTo(cx + Math.cos(a) * R * (i % 2 ? 1.1 : 1.16), cy + Math.sin(a) * R * (i % 2 ? 1.1 : 1.16)); inked(g, c.line, 2.4, 'rgba(10,6,20,0.5)'); }
      magicCircle(g, cx, cy, R, c.line, c.glow, r, pts);
      if (f.k === 1) {
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU - Math.PI / 2, ex = cx + Math.cos(a) * R * 0.24, ey = cy + Math.sin(a) * R * 0.24;
          g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey);
          const mx = cx + Math.cos(a) * R * 0.15, my = cy + Math.sin(a) * R * 0.15;
          for (const s of [-1, 1]) { g.moveTo(mx, my); g.lineTo(mx + Math.cos(a + s * 0.8) * 8, my + Math.sin(a + s * 0.8) * 8); }
          inked(g, c.line, 2.2, 'rgba(10,6,20,0.5)');
        }
      } else if (f.k === 2) skull(g, cx, cy, 18, '#d8e8c8');
      else if (f.k === 3) { circle(g, cx, cy, 14); paint(g, domeFill(g, cx, cy, 14, c.line, 0.4), INK, 1.6); }
      else fireAt(g, cx, cy, 14, r);
      for (let i = 0; i < pts; i++) {
        const a = -Math.PI / 2 + (i / pts) * TAU, x = cx + Math.cos(a) * R * 1.07, y = cy + Math.sin(a) * R * 1.07;
        if (x < 8 || y < 8 || x > w - 8 || y > h - 8) continue;
        circle(g, x, y, 5); paint(g, domeFill(g, x, y, 5, f.k === 2 ? '#3a3438' : '#efe4c8', 0.35), INK, 1);
        glow(g, x, y, 9, '#ffb347', 0.55);
        circle(g, x, y, 1.8); g.fillStyle = '#fff3b0'; g.fill();
      }
    },
  },
  {
    id: 'rune-stone', name: 'Rune stone', cat: 'arcane', sets: ['forest', 'wizard', 'cave', 'temple', 'winter'], tags: ['runestone', 'standing stone', 'menhir', 'runes', 'ward', 'ancient'],
    w: 1, h: 1, blocksMovement: true, c: { stone: STONE.grey, rune: '#7fe0ff' },
    variants: [
      { name: 'Carved', c: { rune: '#3a3632' } },
      { name: 'Glowing blue', c: {}, f: { glow: 1 } },
      { name: 'Glowing green', c: { stone: STONE.green, rune: '#7dff9e' }, f: { glow: 1 } },
      { name: 'Mossy', c: { stone: STONE.green, rune: '#3a3632' }, f: { moss: 1 } },
    ],
    desc: 'The top of a standing stone carved with runes.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.glow) glow(g, 50, 50, 50, c.rune, 0.45);
      stone(g, 50, 50, 36, c.stone, r, 30);
      if (f.moss) speckle(g, 18, 20, 50, 40, r, 30, alpha('#4f7a34', 0.75), 2.4);
      for (let i = 0; i < 5; i++) rune(g, 30 + i * 10, 46 + (i % 2) * 8, 10, r, c.rune, f.glow ? 2.2 : 1.8);
      if (f.glow) for (let i = 0; i < 5; i++) glow(g, 30 + i * 10, 50, 10, c.rune, 0.35);
    },
  },
  {
    id: 'teleport-pad', name: 'Teleportation circle', cat: 'arcane', sets: ['wizard', 'castle', 'temple', 'dungeon'], tags: ['teleport', 'portal', 'gate', 'waypoint', 'travel', 'circle'],
    w: 2, h: 2, layer: 'floor', flat: true, light: { bright: 5, dim: 10, color: '#7ff0ff' }, c: { stone: STONE.grey, glow: '#5ff0ff' },
    variants: [{ name: 'Cyan', c: {} }, { name: 'Violet', c: { glow: '#c08cff' } }, { name: 'Gold', c: { stone: STONE.sand, glow: '#ffd36e' } }, { name: 'Dormant', c: { glow: '#7a8a90' }, f: { off: 1 } }],
    desc: 'An inlaid stone dais that links to another circle.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      circle(g, 100, 100, 90);
      paint(g, litFill(g, 10, 10, 180, 180, c.stone, 0.22), INK, LW);
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; line(g, 100 + Math.cos(a) * 74, 100 + Math.sin(a) * 74, 100 + Math.cos(a) * 89, 100 + Math.sin(a) * 89, alpha(shade(c.stone, -0.6), 0.7), 1.3); }
      speckle(g, 20, 20, 160, 160, r, 30, alpha(shade(c.stone, -0.5), 0.3), 1);
      const a = f.off ? 0.15 : 0.5;
      glow(g, 100, 100, 96, c.glow, a);
      for (const rad of [74, 52]) { circle(g, 100, 100, rad); inked(g, f.off ? shade(c.stone, -0.3) : c.glow, 4, 'rgba(0,0,0,0.5)'); }
      for (let i = 0; i < 16; i++) { const t = (i / 16) * TAU; rune(g, 100 + Math.cos(t) * 63, 100 + Math.sin(t) * 63, 9, r, f.off ? shade(c.stone, -0.4) : mix(c.glow, '#ffffff', 0.4), 1.5, t + Math.PI / 2); }
      for (let i = 0; i < 4; i++) gem(g, 100 + Math.cos(i * Math.PI / 2) * 82, 100 + Math.sin(i * Math.PI / 2) * 82, 6, f.off ? '#7a8a90' : c.glow);
      g.beginPath();
      for (let t = 0; t < 30; t++) { const ang = t * 0.42, rad = 3 + t * 1.45; const x = 100 + Math.cos(ang) * rad, y = 100 + Math.sin(ang) * rad; if (t) g.lineTo(x, y); else g.moveTo(x, y); }
      inked(g, f.off ? shade(c.stone, -0.3) : mix(c.glow, '#ffffff', 0.5), 2.4, 'rgba(0,0,0,0.4)');
    },
  },
  {
    id: 'scroll-pile', name: 'Scroll pile', cat: 'arcane', sets: ['wizard', 'temple', 'castle', 'town'], tags: ['scrolls', 'papers', 'library', 'documents', 'parchment', 'maps'],
    w: 1, h: 1, c: { paper: '#eadbb5', seal: '#a3312c' },
    variants: [{ name: 'Parchment', c: {} }, { name: 'Old, black seals', c: { paper: '#cdb98a', seal: '#2b2b30' } }, { name: 'Gold seals', c: { seal: '#d9ab3e' } }],
    desc: 'A heap of rolled and loose scrolls.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 3; i++) scroll(g, 14 + r() * 40, 18 + r() * 50, 32, 22, (r() - 0.5) * 1.4);
      for (let i = 0; i < 6; i++) {
        const x = 20 + r() * 60, y = 20 + r() * 60, a = r() * Math.PI, L = 22 + r() * 10;
        g.save(); g.translate(x, y); g.rotate(a);
        rr(g, -L / 2, -5, L, 10, 5);
        const gr = g.createLinearGradient(0, -5, 0, 5);
        gr.addColorStop(0, shade(c.paper, 0.2)); gr.addColorStop(1, shade(c.paper, -0.35));
        paint(g, gr, INK, 1.2);
        ellipse(g, L / 2 - 1, 0, 2.5, 5); paint(g, shade(c.paper, -0.15), INK, 0.9);
        circle(g, L / 2 - 1, 0, 1.4); g.fillStyle = shade(c.paper, -0.6); g.fill();
        if (i % 2 === 0) { rr(g, -2, -5.5, 4, 11, 1); paint(g, c.seal, INK, 0.7); }
        g.restore();
      }
    },
  },
  {
    id: 'magic-mirror', name: 'Magic mirror', cat: 'arcane', sets: ['wizard', 'castle', 'crypt', 'forest'], tags: ['mirror', 'scrying', 'portal', 'haunted', 'reflection', 'looking glass'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 0, dim: 5, color: '#9fd8ff' }, c: { frame: METAL.gold, glass: '#9fd8ff' },
    variants: [{ name: 'Gilded', c: {} }, { name: 'Haunted', c: { frame: METAL.black, glass: '#7dff9e' } }, { name: 'Silver, violet', c: { frame: METAL.silver, glass: '#c08cff' } }],
    desc: 'A tall oval mirror on clawed feet, its glass swirling with light.',
    draw: ({ g, c }) => {
      for (const k of [-1, 1]) { line(g, 50 + k * 14, 84, 50 + k * 26, 94, INK, 6); line(g, 50 + k * 14, 84, 50 + k * 26, 94, c.frame, 3.4); }
      glow(g, 50, 48, 46, c.glass, 0.4);
      ellipse(g, 50, 48, 30, 41);
      paint(g, domeFill(g, 50, 48, 41, c.frame, 0.45), INK, LW);
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; circle(g, 50 + Math.cos(a) * 27.5, 48 + Math.sin(a) * 37.5, 2.4); paint(g, shade(c.frame, 0.25), INK, 0.7); }
      ellipse(g, 50, 48, 22, 32);
      const gr = g.createLinearGradient(30, 18, 70, 80);
      gr.addColorStop(0, mix(c.glass, '#ffffff', 0.6)); gr.addColorStop(0.5, c.glass); gr.addColorStop(1, shade(c.glass, -0.5));
      paint(g, gr, INK, 1.6);
      g.save(); ellipse(g, 50, 48, 22, 32); g.clip();
      for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(50, 50, 6 + i * 7, 0.4 + i, 3.4 + i); g.strokeStyle = alpha('#ffffff', 0.45 - i * 0.1); g.lineWidth = 2; g.stroke(); }
      line(g, 36, 30, 44, 22, 'rgba(255,255,255,0.75)', 2.4);
      g.restore();
      gem(g, 50, 10, 4.5, c.glass);
    },
  },
  {
    id: 'levitating-tome', name: 'Levitating tome', cat: 'arcane', sets: ['wizard', 'temple', 'crypt'], tags: ['spellbook', 'book', 'grimoire', 'floating', 'magic', 'tome'],
    w: 1, h: 1, light: { bright: 0, dim: 10, color: '#c08cff' }, c: { cover: '#5d3a78', glow: '#c08cff' },
    variants: [{ name: 'Violet', c: {} }, { name: 'Crimson grimoire', c: { cover: '#7a1c1c', glow: '#ff6b6b' } }, { name: 'Green, necromantic', c: { cover: '#2f3a2a', glow: '#7dff9e' } }, { name: 'Gold, holy', c: { cover: '#e6dcc4', glow: '#ffd36e' } }],
    desc: 'An open spellbook hovering above the floor, pages stirring.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      ellipse(g, 56, 64, 26, 12);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fill();
      glow(g, 50, 48, 46, c.glow, 0.5);
      g.save(); g.translate(50, 46); g.rotate(-0.1);
      rr(g, -32, -22, 64, 44, 3); paint(g, litFill(g, -32, -22, 64, 44, c.cover, 0.3), INK, LW);
      for (const s of [-1, 1]) {
        g.beginPath(); g.moveTo(0, -18); g.quadraticCurveTo(s * 14, -24, s * 29, -18); g.lineTo(s * 29, 18); g.quadraticCurveTo(s * 14, 13, 0, 18); g.closePath();
        paint(g, '#f2e9d2', INK, 1.2);
        for (let i = 0; i < 5; i++) line(g, s * 5, -10 + i * 6, s * 24, -10 + i * 6, alpha(shade(c.glow, -0.5), 0.6), 0.9);
      }
      line(g, 0, -18, 0, 18, alpha(INK, 0.8), 1.2);
      rune(g, 14, 4, 9, r, shade(c.glow, -0.3), 1.6);
      g.restore();
      for (let i = 0; i < 3; i++) {
        const x = 14 + r() * 72, y = 10 + r() * 22 + (i === 2 ? 56 : 0);
        g.save(); g.translate(x, y); g.rotate((r() - 0.5) * 1.6);
        rr(g, -6, -8, 12, 16, 1); paint(g, '#f2e9d2', INK, 1);
        g.restore();
      }
      for (let i = 0; i < 6; i++) { const x = 12 + r() * 76, y = 10 + r() * 80; circle(g, x, y, 1.6); g.fillStyle = mix(c.glow, '#ffffff', 0.6); g.fill(); }
    },
  },
];

// ---------- traps (GM only) ----------
const TRAPS: ObjDef[] = [
  {
    id: 'glyph-trap', name: 'Warding glyph', cat: 'trap', sets: ['wizard', 'temple', 'crypt', 'dungeon', 'castle'], tags: ['glyph', 'rune', 'ward', 'magic trap', 'explosive runes', 'trigger'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { line: '#ff7a5a', glow: '#ff3b1f' },
    variants: [{ name: 'Fire', c: {} }, { name: 'Lightning', c: { line: '#bfe8ff', glow: '#4cb8ff' } }, { name: 'Frost', c: { line: '#e2fbff', glow: '#7fe0ff' } }, { name: 'Acid', c: { line: '#d6ff8a', glow: '#7ccf2a' } }],
    desc: 'GM only. A hidden magical glyph that goes off when crossed or touched.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 48, c.glow, 0.55);
      circle(g, 50, 50, 36); inked(g, c.line, 2.6, 'rgba(10,6,20,0.55)');
      circle(g, 50, 50, 30); inked(g, c.line, 1.4, 'rgba(10,6,20,0.55)');
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; rune(g, 50 + Math.cos(a) * 33, 50 + Math.sin(a) * 33, 5, r, c.line, 1.1, a + Math.PI / 2); }
      starPath(g, 50, 50, 22, 3, 1);
      inked(g, c.line, 2, 'rgba(10,6,20,0.55)');
      starPath(g, 50, 50, 22, 3, 1, Math.PI / 2);
      inked(g, c.line, 2, 'rgba(10,6,20,0.55)');
      rune(g, 50, 50, 14, r, '#ffffff', 3);
    },
  },
  {
    id: 'trap-spike-pit', name: 'Spiked pit', cat: 'trap', sets: ['dungeon', 'forest', 'castle', 'cave', 'temple'], tags: ['pit', 'spikes', 'trap', 'hidden', 'fall'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { stone: STONE.grey, metal: METAL.iron },
    variants: [{ name: 'Covered', c: {}, f: { cover: 1 } }, { name: 'Open', c: {} }, { name: 'Wooden stakes', c: { metal: WOOD.pine } }],
    desc: 'GM only. A pit lined with spikes, often hidden under a false cover.',
    draw: ({ g, c, f }) => {
      trapFrame(g, 3, 3, 94, 94);
      rr(g, 12, 12, 76, 76, 3);
      const gr = g.createRadialGradient(50, 54, 4, 50, 50, 50);
      gr.addColorStop(0, '#000000'); gr.addColorStop(1, '#2c241e');
      paint(g, gr, INK, LW);
      for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) {
        const x = 22 + k * 19 + (i % 2) * 4, y = 22 + i * 18;
        circle(g, x, y, 4.2);
        paint(g, domeFill(g, x, y, 4.2, c.metal, 0.5), INK, 1);
        circle(g, x - 1, y - 1, 1.2); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fill();
      }
      if (f.cover) {
        rr(g, 12, 12, 76, 76, 3);
        g.fillStyle = alpha(c.stone, 0.45); g.fill();
        g.beginPath();
        for (let x = 31; x < 88; x += 19) { g.moveTo(x, 12); g.lineTo(x, 88); }
        for (let y = 31; y < 88; y += 19) { g.moveTo(12, y); g.lineTo(88, y); }
        g.strokeStyle = alpha(shade(c.stone, -0.5), 0.6); g.lineWidth = 1.2; g.stroke();
      }
    },
  },
  {
    id: 'trap-blade', name: 'Swinging blade', cat: 'trap', sets: ['dungeon', 'temple', 'castle', 'crypt'], tags: ['blade', 'scythe', 'pendulum', 'trap', 'corridor'],
    w: 2, h: 1, gmOnly: true, c: { metal: '#b9c0c6' },
    variants: [{ name: 'Steel', c: {} }, { name: 'Rusted', c: { metal: METAL.rust } }, { name: 'Black iron', c: { metal: METAL.black } }],
    desc: 'GM only. A pendulum blade drops out of a ceiling slot and sweeps across the corridor.',
    draw: ({ g, c }) => {
      trapFrame(g, 3, 3, 194, 94);
      rr(g, 8, 46, 184, 8, 3);
      paint(g, '#0f0b09', INK, 1.4);
      for (const s of [-1, 1]) {
        g.beginPath(); g.arc(100, 50, 70, s < 0 ? Math.PI * 0.83 : -Math.PI * 0.17, s < 0 ? Math.PI * 1.17 : Math.PI * 0.17);
        dashed(g, alpha('#ffffff', 0.7), 2, [5, 5]);
      }
      g.beginPath();
      g.moveTo(60, 50); g.quadraticCurveTo(100, 22, 140, 50); g.quadraticCurveTo(100, 38, 60, 50); g.closePath();
      paint(g, litFill(g, 60, 26, 80, 24, c.metal, 0.45), INK, 1.8);
      g.beginPath();
      g.moveTo(60, 50); g.quadraticCurveTo(100, 62, 140, 50);
      g.quadraticCurveTo(100, 78, 60, 50); g.closePath();
      paint(g, litFill(g, 60, 50, 80, 26, shade(c.metal, -0.15), 0.45), INK, 1.8);
      rr(g, 94, 40, 12, 20, 2);
      paint(g, litFill(g, 94, 40, 12, 20, METAL.iron, 0.4), INK, 1.4);
    },
  },
  {
    id: 'trap-darts', name: 'Dart wall', cat: 'trap', sets: ['dungeon', 'temple', 'crypt', 'desert'], tags: ['darts', 'arrows', 'poison', 'trap', 'holes', 'wall'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { dart: '#5a3d24', fletch: '#c0392b' },
    variants: [{ name: 'Darts', c: {} }, { name: 'Poisoned', c: { fletch: '#5fe39a' } }],
    desc: 'GM only. Holes in the wall (top edge) that fire darts across the square.',
    draw: ({ g, c }) => {
      trapFrame(g, 3, 3, 94, 94);
      for (const x of [20, 40, 60, 80]) {
        g.beginPath(); g.moveTo(x, 10); g.lineTo(x, 92);
        dashed(g, alpha('#ffffff', 0.55), 1.6, [4, 5]);
        circle(g, x, 7, 4.5);
        paint(g, '#0e0a08', METAL.iron, 1.8);
      }
      for (const [x, y] of [[40, 52], [80, 34]]) {
        line(g, x, y - 16, x, y + 10, INK, 3.4);
        line(g, x, y - 16, x, y + 10, c.dart, 1.8);
        poly(g, [[x - 3, y + 8], [x + 3, y + 8], [x, y + 15]]); paint(g, METAL.iron, INK, 0.8);
        poly(g, [[x, y - 12], [x - 5, y - 19], [x, y - 16], [x + 5, y - 19]]); paint(g, c.fletch, INK, 0.8);
      }
    },
  },
  {
    id: 'trap-bear', name: 'Bear trap', cat: 'trap', sets: ['forest', 'camp', 'dungeon', 'winter', 'swamp', 'cave'], tags: ['snare', 'jaws', 'trap', 'hunter', 'restrain'],
    w: 1, h: 1, gmOnly: true, c: { metal: METAL.iron },
    variants: [{ name: 'Iron', c: {} }, { name: 'Rusted', c: { metal: METAL.rust } }, { name: 'Sprung', c: {}, f: { shut: 1 } }],
    desc: 'GM only. Toothed iron jaws chained to a stake.',
    draw: ({ g, c, f }) => {
      chain(g, 76, 80, 56, 58, c.metal, 3);
      circle(g, 80, 84, 6); paint(g, domeFill(g, 80, 84, 6, WOOD.oak, 0.3), INK, 1.4);
      for (const s of [-1, 1]) { rr(g, 50 + s * 34 - 6, 44, 12, 12, 3); paint(g, litFill(g, 50 + s * 34 - 6, 44, 12, 12, c.metal, 0.4), INK, 1.4); }
      if (f.shut) {
        rr(g, 22, 42, 56, 16, 6); paint(g, litFill(g, 22, 42, 56, 16, c.metal, 0.4), INK, LW);
        for (let x = 26; x < 76; x += 6) line(g, x, 46, x + 3, 54, INK, 1.4);
        return;
      }
      circle(g, 50, 50, 30); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
      g.strokeStyle = c.metal; g.lineWidth = 6; g.stroke();
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU, x = 50 + Math.cos(a) * 26, y = 50 + Math.sin(a) * 26;
        poly(g, [[x + Math.cos(a + 1.57) * 3.5, y + Math.sin(a + 1.57) * 3.5], [50 + Math.cos(a) * 17, 50 + Math.sin(a) * 17], [x - Math.cos(a + 1.57) * 3.5, y - Math.sin(a + 1.57) * 3.5]]);
        paint(g, shade(c.metal, 0.3), INK, 0.9);
      }
      circle(g, 50, 50, 10); paint(g, domeFill(g, 50, 50, 10, c.metal, 0.45), INK, 1.4);
    },
  },
  {
    id: 'trap-tripwire', name: 'Tripwire', cat: 'trap', sets: ['forest', 'dungeon', 'camp', 'castle', 'cave'], tags: ['wire', 'snare', 'alarm', 'trip', 'trap'],
    w: 2, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { wire: '#d8d2c0' },
    variants: [{ name: 'Plain', c: {} }, { name: 'Alarm bells', c: {}, f: { bells: 1 } }, { name: 'Crossbow', c: {}, f: { bow: 1 } }],
    desc: 'GM only. A low wire between two pegs, sometimes rigged to bells or a crossbow.',
    draw: ({ g, c, f }) => {
      trapFrame(g, 3, 28, 194, 44);
      g.beginPath(); g.moveTo(16, 50); g.quadraticCurveTo(100, 56, 184, 50);
      g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 3; g.stroke();
      g.strokeStyle = c.wire; g.lineWidth = 1.4; g.stroke();
      for (const x of [14, 186]) { circle(g, x, 50, 6); paint(g, domeFill(g, x, 50, 6, WOOD.oak, 0.35), INK, 1.6); }
      if (f.bells) for (const [x, y] of [[176, 38], [188, 36], [182, 64]]) { circle(g, x, y, 4.5); paint(g, domeFill(g, x, y, 4.5, METAL.brass, 0.5), INK, 1); }
      if (f.bow) {
        line(g, 14, 50, 14, 50, INK, 1);
        rr(g, 22, 36, 6, 28, 2); paint(g, WOOD.walnut, INK, 1.2);
        g.beginPath(); g.moveTo(26, 30); g.quadraticCurveTo(38, 50, 26, 70); g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke(); g.strokeStyle = METAL.iron; g.lineWidth = 2; g.stroke();
        line(g, 26, 50, 60, 50, METAL.iron, 1.6);
      }
    },
  },
  {
    id: 'trap-falling-block', name: 'Falling block', cat: 'trap', sets: ['dungeon', 'temple', 'castle', 'crypt', 'mine'], tags: ['ceiling', 'crush', 'block', 'rocks', 'trap', 'cave-in'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { stone: STONE.grey },
    variants: [{ name: 'Stone block', c: {} }, { name: 'Rockfall', c: { stone: '#7a6a58' }, f: { rocks: 1 } }],
    desc: 'GM only. A ceiling block or rockfall drops onto this square.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      trapFrame(g, 3, 3, 94, 94);
      g.save();
      g.globalAlpha = 0.5;
      if (f.rocks) for (let i = 0; i < 6; i++) stone(g, 22 + r() * 56, 22 + r() * 56, 9 + r() * 6, c.stone, r);
      else { blocks(g, 16, 16, 68, 68, c.stone, r, 34, 23); rr(g, 16, 16, 68, 68, 2); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); }
      g.restore();
      for (const [x, y, sx, sy] of [[10, 10, 1, 1], [90, 10, -1, 1], [90, 90, -1, -1], [10, 90, 1, -1]]) {
        poly(g, [[x, y + sy * 14], [x, y], [x + sx * 14, y]], false);
        inked(g, '#ffffff', 2.6);
      }
      for (const y of [30, 50]) { poly(g, [[38, y], [50, y + 12], [62, y]], false); inked(g, TRAP_RED, 3.2); }
    },
  },
  {
    id: 'trap-needle-lock', name: 'Poison needle lock', cat: 'trap', sets: ['dungeon', 'castle', 'town', 'crypt'], tags: ['lock', 'needle', 'poison', 'chest trap', 'door trap'],
    w: 1, h: 1, gmOnly: true, c: { metal: METAL.brass, poison: '#5fe39a' },
    variants: [{ name: 'Brass lock', c: {} }, { name: 'Iron lock', c: { metal: METAL.iron } }],
    desc: 'GM only. A trapped lock: picking it wrongly jabs a poisoned needle.',
    draw: ({ g, c }) => {
      circle(g, 50, 50, 44); g.fillStyle = alpha(TRAP_RED, 0.12); g.fill();
      circle(g, 50, 50, 44); dashed(g, TRAP_RED, 3, [8, 5]);
      rr(g, 30, 22, 40, 56, 6);
      paint(g, litFill(g, 30, 22, 40, 56, c.metal, 0.4), INK, LW);
      for (const [x, y] of [[36, 28], [64, 28], [36, 72], [64, 72]]) rivet(g, x, y, 2.4, c.metal);
      circle(g, 50, 44, 6); paint(g, '#120d0a', null);
      poly(g, [[46, 48], [54, 48], [52, 62], [48, 62]]); paint(g, '#120d0a', null);
      line(g, 50, 44, 76, 30, INK, 2.8);
      line(g, 50, 44, 76, 30, '#e6e9ec', 1.4);
      glow(g, 77, 29, 10, c.poison, 0.7);
      ellipse(g, 78, 31, 3, 4.2, 0.3); paint(g, c.poison, INK, 0.9);
    },
  },
  {
    id: 'trap-fire-vent', name: 'Fire jet vent', cat: 'trap', sets: ['dungeon', 'temple', 'wizard', 'cave', 'castle'], tags: ['fire', 'flame jet', 'vent', 'burner', 'trap', 'steam', 'acid'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { metal: METAL.iron, jet: '#ffb02e' },
    variants: [{ name: 'Fire', c: {} }, { name: 'Acid spray', c: { jet: '#8fd14f' } }, { name: 'Scalding steam', c: { jet: '#e8f4ff' } }, { name: 'Frost', c: { jet: '#7fe0ff' } }],
    desc: 'GM only. A floor vent that blasts fire (or acid, steam, frost) when triggered.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 50, 44, 0.4, 12, r));
      const gr = g.createRadialGradient(50, 50, 10, 50, 50, 46);
      gr.addColorStop(0, 'rgba(20,12,8,0.85)'); gr.addColorStop(1, 'rgba(20,12,8,0)');
      g.fillStyle = gr; g.fill();
      trapFrame(g, 3, 3, 94, 94);
      circle(g, 50, 50, 22);
      paint(g, domeFill(g, 50, 50, 22, c.metal, 0.35), INK, LW);
      g.save(); circle(g, 50, 50, 17); g.clip();
      g.fillStyle = '#0c0907'; g.fillRect(30, 30, 40, 40);
      for (let x = 34; x < 68; x += 7) { rr(g, x, 30, 3.4, 40, 1); paint(g, shade(c.metal, -0.1), null); }
      g.restore();
      glow(g, 50, 50, 30, c.jet, 0.6);
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + r(); circle(g, 50 + Math.cos(a) * 10, 50 + Math.sin(a) * 10, 2); g.fillStyle = alpha(mix(c.jet, '#ffffff', 0.5), 0.9); g.fill(); }
    },
  },
  {
    id: 'trap-collapsing-floor', name: 'Collapsing floor', cat: 'trap', sets: ['dungeon', 'castle', 'crypt', 'mine', 'temple'], tags: ['collapse', 'cave-in', 'weak floor', 'pit', 'trap', 'cracks'],
    w: 2, h: 2, layer: 'floor', flat: true, gmOnly: true, c: { stone: STONE.grey },
    variants: [{ name: 'Flagstones', c: {} }, { name: 'Sandstone', c: { stone: STONE.sand } }, { name: 'Rotten boards', c: { stone: WOOD.oak }, f: { wood: 1 } }],
    desc: 'GM only. Weakened floor that gives way under weight, dropping into a pit or the level below.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      g.save();
      g.globalAlpha = 0.85;
      if (f.wood) planks(g, 14, 14, 172, 172, c.stone, r, 'v', 8);
      else blocks(g, 14, 14, 172, 172, c.stone, r, 43, 43);
      g.restore();
      g.beginPath();
      for (let i = 0; i < 7; i++) {
        let x = 100, y = 100; const a0 = (i / 7) * TAU + r() * 0.4;
        g.moveTo(x, y);
        for (let k = 1; k <= 4; k++) { const a = a0 + (r() - 0.5) * 0.7; x = 100 + Math.cos(a) * k * 20; y = 100 + Math.sin(a) * k * 20; g.lineTo(x, y); }
      }
      g.strokeStyle = '#120d0a'; g.lineWidth = 2.6; g.lineJoin = 'round'; g.stroke();
      blob(g, lumpy(100, 100, 16, 0.5, 9, r));
      paint(g, '#0a0706', INK, 1.4);
      trapFrame(g, 6, 6, 188, 188);
    },
  },
];

// ---------- hazards ----------
const HAZARDS: ObjDef[] = [
  {
    id: 'lava-crack', name: 'Lava fissure', cat: 'hazard', sets: ['cave', 'dungeon', 'mine', 'desert'], tags: ['lava', 'magma', 'fire', 'crack', 'fissure', 'volcano'],
    w: 2, h: 2, layer: 'floor', flat: true, light: { bright: 10, dim: 10, color: '#ff6a1a' }, c: { lava: '#ff7a1a', rock: '#2e2622' },
    variants: [{ name: 'Lava', c: {} }, { name: 'Cooling', c: { lava: '#d9411a', rock: '#3a302b' } }, { name: 'Hellfire', c: { lava: '#ff3b6b', rock: '#24161c' } }],
    desc: 'A glowing crack of molten rock. Fire damage to anyone who steps in.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(100, 100, 78, 0.35, 14, r));
      const gr = g.createRadialGradient(100, 100, 10, 100, 100, 90);
      gr.addColorStop(0, alpha(c.rock, 0.95)); gr.addColorStop(1, alpha(c.rock, 0));
      g.fillStyle = gr; g.fill();
      const paths: number[][][] = [];
      let x = 12 + r() * 20, y = 30 + r() * 30; const main: number[][] = [[x, y]];
      while (x < 185) { x += 14 + r() * 12; y += (r() - 0.4) * 30; y = Math.max(20, Math.min(180, y)); main.push([x, y]); }
      paths.push(main);
      for (let b = 0; b < 3; b++) {
        const s = main[2 + Math.floor(r() * (main.length - 4))]; let bx = s[0], by = s[1]; const br: number[][] = [[bx, by]];
        const dir = r() < 0.5 ? -1 : 1;
        for (let k = 0; k < 4; k++) { bx += (r() - 0.5) * 24; by += dir * (12 + r() * 14); br.push([bx, by]); }
        paths.push(br);
      }
      const stroke = (col: string, lw: number) => { for (const p of paths) { poly(g, p, false); g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } };
      for (const p of paths) for (const [px, py] of p) glow(g, px, py, 26, c.lava, 0.18);
      stroke(INK, 14);
      stroke(shade(c.lava, -0.4), 11);
      stroke(c.lava, 7);
      stroke(mix(c.lava, '#fff3b0', 0.7), 2.6);
    },
  },
  {
    id: 'acid-pool', name: 'Acid pool', cat: 'hazard', sets: ['dungeon', 'cave', 'sewer', 'swamp'], tags: ['acid', 'pool', 'sludge', 'sewage', 'tar', 'poison', 'liquid'],
    w: 2, h: 2, layer: 'floor', flat: true, c: { liq: '#8fd14f' },
    variants: [{ name: 'Acid', c: {} }, { name: 'Sewage', c: { liq: '#6b5a2a' } }, { name: 'Tar', c: { liq: '#26221f' } }, { name: 'Poison', c: { liq: '#9b5cff' } }],
    desc: 'A bubbling pool that burns, sickens or sticks.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const outer = lumpy(100, 100, 86, 0.3, 13, r, 80);
      blob(g, outer);
      paint(g, alpha(shade(c.liq, -0.55), 0.85), null);
      const inner = outer.map(([x, y]) => [100 + (x - 100) * 0.86, 100 + (y - 100) * 0.86]);
      blob(g, inner);
      const gr = g.createRadialGradient(80, 80, 10, 100, 100, 90);
      gr.addColorStop(0, shade(c.liq, 0.25)); gr.addColorStop(1, shade(c.liq, -0.3));
      paint(g, gr, INK, 1.8);
      g.save(); blob(g, inner); g.clip();
      for (let i = 0; i < 14; i++) {
        const x = 40 + r() * 120, y = 40 + r() * 120, rad = 2 + r() * 6;
        circle(g, x, y, rad);
        paint(g, alpha(shade(c.liq, 0.3), 0.8), alpha(shade(c.liq, -0.5), 0.8), 1);
        circle(g, x - rad * 0.3, y - rad * 0.35, rad * 0.3); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fill();
      }
      ellipse(g, 70, 64, 22, 7, -0.5); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fill();
      g.restore();
      glow(g, 100, 100, 70, c.liq, 0.18);
    },
  },
  {
    id: 'green-slime', name: 'Green slime', cat: 'hazard', sets: ['dungeon', 'cave', 'sewer', 'swamp', 'crypt'], tags: ['slime', 'ooze', 'acid', 'ceiling', 'hazard'],
    w: 1, h: 1, layer: 'floor', flat: true, c: { slime: '#7ad13a' },
    variants: [{ name: 'Green', c: {} }, { name: 'Sickly yellow', c: { slime: '#c9c23a' } }, { name: 'Black', c: { slime: '#34363a' } }],
    desc: 'A patch of corrosive slime. It drops from ceilings and eats flesh, metal and wood.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const pts = lumpy(50, 50, 38, 0.5, 13, r, 34);
      blob(g, pts);
      paint(g, domeFill(g, 44, 44, 44, c.slime, 0.45), alpha(shade(c.slime, -0.6), 0.9), 1.8);
      for (let i = 0; i < 5; i++) { const a = r() * TAU, d = 38 + r() * 8; circle(g, 50 + Math.cos(a) * d, 50 + Math.sin(a) * d, 2 + r() * 3); paint(g, c.slime, alpha(shade(c.slime, -0.6), 0.9), 1); }
      for (let i = 0; i < 6; i++) { const x = 28 + r() * 44, y = 28 + r() * 44; ringAt(g, x, y, 2 + r() * 4, alpha(shade(c.slime, 0.5), 0.8), 1.2); }
      ellipse(g, 36, 34, 10, 5, -0.6); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fill();
    },
  },
  {
    id: 'mold-patch', name: 'Mold patch', cat: 'hazard', sets: ['dungeon', 'cave', 'sewer', 'crypt', 'swamp', 'mine'], tags: ['mold', 'brown mold', 'yellow mold', 'spores', 'fungus', 'cold'],
    w: 1, h: 1, layer: 'floor', flat: true, c: { mold: '#8a5a32', aura: '#bfe6ff' },
    variants: [{ name: 'Brown (chilling)', c: {} }, { name: 'Yellow (spores)', c: { mold: '#d2b83a', aura: '#f2e27a' } }, { name: 'Russet', c: { mold: '#9a3b1f', aura: '#ff9a7a' } }],
    desc: 'Fuzzy mold on the floor. Brown mold drains heat; yellow mold bursts into choking spores.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 50, c.aura, 0.4);
      for (let i = 0; i < 26; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 34, x = 50 + Math.cos(a) * d, y = 50 + Math.sin(a) * d, rad = 3 + r() * 6;
        circle(g, x, y, rad);
        paint(g, domeFill(g, x, y, rad, shade(c.mold, (r() - 0.5) * 0.3), 0.4), alpha(shade(c.mold, -0.6), 0.8), 0.9);
      }
      speckle(g, 16, 16, 68, 68, r, 30, alpha(shade(c.aura, 0.3), 0.9), 1);
    },
  },
  {
    id: 'poison-gas', name: 'Gas cloud', cat: 'hazard', sets: ['dungeon', 'sewer', 'swamp', 'cave', 'crypt', 'mine'], tags: ['gas', 'poison', 'fog', 'smoke', 'cloud', 'miasma'],
    w: 2, h: 2, layer: 'floor', flat: true, c: { gas: '#8fe04a' },
    variants: [{ name: 'Poison green', c: {} }, { name: 'Violet', c: { gas: '#b07cff' } }, { name: 'Yellow', c: { gas: '#e8d44a' } }, { name: 'Grey smoke', c: { gas: '#b8b8b8' } }],
    desc: 'A drifting translucent cloud of poison, smoke or fog. Lightly or heavily obscured.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 9; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 50, x = 100 + Math.cos(a) * d, y = 100 + Math.sin(a) * d, rad = 40 + r() * 26;
        const gr = g.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, alpha(c.gas, 0.38)); gr.addColorStop(0.6, alpha(c.gas, 0.2)); gr.addColorStop(1, alpha(c.gas, 0));
        g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      for (let i = 0; i < 5; i++) {
        const x = 50 + r() * 100, y = 50 + r() * 100, rad = 10 + r() * 16;
        g.beginPath(); g.arc(x, y, rad, r() * TAU, r() * TAU + 3.6);
        g.strokeStyle = alpha(mix(c.gas, '#ffffff', 0.5), 0.55); g.lineWidth = 2.4; g.lineCap = 'round'; g.stroke();
      }
    },
  },
  {
    id: 'pit-deep', name: 'Deep pit', cat: 'hazard', sets: ['dungeon', 'cave', 'mine', 'crypt', 'forest'], tags: ['pit', 'hole', 'shaft', 'fall', 'drop', 'well'],
    w: 2, h: 2, layer: 'floor', flat: true, c: { stone: STONE.grey },
    variants: [{ name: 'Grey stone', c: {} }, { name: 'Earth', c: { stone: '#7a5c3e' } }, { name: 'Dark stone', c: { stone: STONE.dark } }],
    desc: 'A sheer drop into darkness. Fall damage depends on depth.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const pts = lumpy(100, 100, 82, 0.2, 14, r);
      blob(g, pts);
      paint(g, litFill(g, 16, 16, 168, 168, shade(c.stone, -0.25), 0.2), INK, LW);
      const inner = pts.map(([x, y]) => [100 + (x - 100) * 0.8, 100 + (y - 100) * 0.8]);
      blob(g, inner);
      const gr = g.createRadialGradient(108, 110, 4, 100, 100, 70);
      gr.addColorStop(0, '#000000'); gr.addColorStop(0.7, '#0b0807'); gr.addColorStop(1, shade(c.stone, -0.6));
      paint(g, gr, INK, LW);
      for (let i = 0; i < 9; i++) {
        const [x, y] = pts[Math.floor(r() * pts.length)];
        stone(g, 100 + (x - 100) * 0.92, 100 + (y - 100) * 0.92, 6 + r() * 6, c.stone, r);
      }
    },
  },
  {
    id: 'chasm-edge', name: 'Chasm edge', cat: 'hazard', sets: ['cave', 'dungeon', 'mine', 'winter', 'desert'], tags: ['chasm', 'cliff', 'abyss', 'ledge', 'drop', 'ravine'],
    w: 2, h: 2, layer: 'floor', flat: true, c: { stone: STONE.grey },
    variants: [{ name: 'Grey stone', c: {} }, { name: 'Dark stone', c: { stone: STONE.dark } }, { name: 'Sandstone', c: { stone: STONE.sand } }, { name: 'Ice', c: { stone: '#bcd8e6' } }],
    desc: 'The lip of a bottomless chasm. Ground on the top half, the drop on the bottom. Tile along the edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const edge: number[][] = [];
      for (let x = 0; x <= 200; x += 20) edge.push([x, 92 + (x === 0 || x === 200 ? 0 : (r() - 0.5) * 24)]);
      // the void
      poly(g, [...edge, [200, 200], [0, 200]]);
      const vg = g.createLinearGradient(0, 90, 0, 200);
      vg.addColorStop(0, '#16110e'); vg.addColorStop(1, '#000000');
      g.fillStyle = vg; g.fill();
      // the cliff face just below the lip
      poly(g, [...edge, ...edge.slice().reverse().map(([x, y]) => [x, y + 26 + (x % 40 ? 6 : 0)])]);
      const fg = g.createLinearGradient(0, 90, 0, 128);
      fg.addColorStop(0, shade(c.stone, -0.45)); fg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = fg; g.fill();
      g.save(); poly(g, [...edge, [200, 140], [0, 140]]); g.clip();
      for (let i = 0; i < 10; i++) { const x = 6 + i * 20 + r() * 8; line(g, x, 96, x + (r() - 0.5) * 6, 124, alpha(shade(c.stone, -0.2), 0.6), 1.4); }
      g.restore();
      // ground lip
      poly(g, [[0, 0], [200, 0], ...edge.slice().reverse()]);
      g.fillStyle = alpha(shade(c.stone, 0.05), 0.35); g.fill();
      poly(g, edge, false);
      g.strokeStyle = INK; g.lineWidth = LW * 1.2; g.lineJoin = 'round'; g.stroke();
      poly(g, edge.map(([x, y]) => [x, y - 3]), false);
      g.strokeStyle = alpha(shade(c.stone, 0.4), 0.7); g.lineWidth = 2; g.stroke();
      for (let i = 0; i < 5; i++) stone(g, 10 + r() * 180, 60 + r() * 22, 4 + r() * 5, c.stone, r);
    },
  },
  {
    id: 'sewer-outflow', name: 'Sewer outflow', cat: 'hazard', sets: ['sewer', 'dungeon', 'town'], tags: ['pipe', 'drain', 'sewage', 'culvert', 'sludge', 'wall'],
    w: 1, h: 1, layer: 'floor', flat: true, c: { stone: STONE.grey, liq: '#6b5a2a' },
    variants: [{ name: 'Sewage', c: {} }, { name: 'Clean water', c: { liq: '#4a8fb5' } }, { name: 'Toxic', c: { liq: '#8fd14f' } }],
    desc: 'A drain pipe in the wall (top edge) spilling a stream across the floor.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      g.beginPath();
      g.moveTo(30, 8); g.bezierCurveTo(22, 40, 8, 64, 4, 100); g.lineTo(96, 100); g.bezierCurveTo(90, 66, 80, 38, 70, 8); g.closePath();
      const gr = g.createLinearGradient(0, 10, 0, 100);
      gr.addColorStop(0, shade(c.liq, 0.15)); gr.addColorStop(1, shade(c.liq, -0.25));
      paint(g, gr, alpha(INK, 0.7), 1.4);
      for (let i = 0; i < 5; i++) { const y = 26 + i * 15; g.beginPath(); g.moveTo(40 - i * 3, y); g.quadraticCurveTo(50, y + 4, 60 + i * 3, y); g.strokeStyle = alpha('#ffffff', 0.3); g.lineWidth = 1.4; g.stroke(); }
      speckle(g, 30, 30, 40, 60, r, 8, alpha(shade(c.liq, -0.5), 0.6), 1.5);
      g.beginPath(); g.arc(50, 0, 24, 0, Math.PI); g.closePath();
      paint(g, litFill(g, 26, 0, 48, 24, c.stone, 0.3), INK, LW);
      g.beginPath(); g.arc(50, 0, 17, 0, Math.PI); g.closePath();
      paint(g, '#0c0908', INK, 1.4);
      g.beginPath(); g.arc(50, 0, 17, 0.2, Math.PI - 0.2);
      g.strokeStyle = shade(c.liq, 0.1); g.lineWidth = 4; g.stroke();
    },
  },
];

// ---------- GM markers (GM only, flat) ----------
const GM_SETS: SetId[] = ALL_SETS;
const MARKERS: ObjDef[] = [
  {
    id: 'gm-encounter', name: 'Encounter marker', cat: 'gm', sets: GM_SETS, tags: ['encounter', 'fight', 'combat', 'ambush', 'monster', 'marker'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { col: '#d62828' },
    variants: [{ name: 'Red', c: {} }, { name: 'Orange', c: { col: '#f77f00' } }, { name: 'Purple', c: { col: '#7b2cbf' } }],
    desc: 'GM only. Marks where an encounter starts.',
    draw: ({ g, c }) => {
      gmBadge(g, 50, 50, 44, c.col);
      for (const s of [-1, 1]) {
        g.save(); g.translate(50, 50); g.rotate(s * Math.PI / 4);
        rr(g, -3, -26, 6, 34, 2); paint(g, '#eef1f4', INK, 1.4);
        rr(g, -10, 8, 20, 5, 2); paint(g, '#c9a24a', INK, 1.3);
        rr(g, -2.5, 13, 5, 10, 1.5); paint(g, '#5a3d24', INK, 1.2);
        circle(g, 0, 25, 3.4); paint(g, '#c9a24a', INK, 1.1);
        g.restore();
      }
    },
  },
  {
    id: 'gm-secret-door', name: 'Secret door marker', cat: 'gm', sets: GM_SETS, tags: ['secret', 'hidden door', 'passage', 'marker', 'search'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { col: '#7b2cbf' },
    variants: [{ name: 'Purple', c: {} }, { name: 'Teal', c: { col: '#0f9b8e' } }],
    desc: 'GM only. A hidden door or passage. Place it against the wall where the door is.',
    draw: ({ g, c }) => {
      gmBadge(g, 50, 50, 44, c.col);
      g.beginPath();
      g.moveTo(34, 76); g.lineTo(34, 40); g.arc(50, 40, 16, Math.PI, 0); g.lineTo(66, 76); g.closePath();
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fill();
      dashed(g, '#ffffff', 3, [6, 4]);
      circle(g, 50, 52, 4.5); paint(g, '#ffffff', INK, 1.2);
      poly(g, [[47.5, 54], [52.5, 54], [54, 66], [46, 66]]); paint(g, '#ffffff', INK, 1.2);
    },
  },
  {
    id: 'gm-treasure', name: 'Treasure marker', cat: 'gm', sets: GM_SETS, tags: ['treasure', 'loot', 'hoard', 'x marks the spot', 'marker', 'cache'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { col: '#e9a400' },
    variants: [{ name: 'Gold', c: {} }, { name: 'Green', c: { col: '#2a9d8f' } }],
    desc: 'GM only. Hidden treasure or a loot cache.',
    draw: ({ g, c }) => {
      gmBadge(g, 50, 50, 44, c.col);
      g.beginPath(); g.moveTo(32, 32); g.lineTo(68, 68); g.moveTo(68, 32); g.lineTo(32, 68);
      inked(g, '#ffffff', 6);
      gem(g, 50, 50, 8, '#e63946');
    },
  },
  {
    id: 'gm-room', name: 'Room number', cat: 'gm', sets: GM_SETS, tags: ['room', 'number', 'key', 'label', 'area', 'marker'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { col: '#1d6fb8' },
    variants: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ name: `Room ${n}`, c: {}, f: { n } })),
    desc: 'GM only. A numbered room marker to match your adventure notes.',
    draw: ({ g, c, f }) => {
      gmBadge(g, 50, 50, 44, c.col);
      digit(g, f.n || 1, 50, 50, 40, '#ffffff', 6);
    },
  },
  {
    id: 'gm-start', name: 'Start area', cat: 'gm', sets: GM_SETS, tags: ['start', 'spawn', 'entrance', 'party', 'deploy', 'marker'],
    w: 2, h: 2, layer: 'floor', flat: true, gmOnly: true, c: { col: '#2a9d48' },
    variants: [{ name: 'Green', c: {} }, { name: 'Blue', c: { col: '#1d6fb8' } }, { name: 'Gold', c: { col: '#e9a400' } }],
    desc: 'GM only. Where the party starts or deploys.',
    draw: ({ g, c }) => {
      rr(g, 8, 8, 184, 184, 14);
      g.fillStyle = alpha(c.col, 0.18); g.fill();
      rr(g, 8, 8, 184, 184, 14);
      dashed(g, c.col, 4, [12, 7]);
      circle(g, 100, 100, 34);
      paint(g, domeFill(g, 100, 100, 34, c.col, 0.3), INK, 2.2);
      line(g, 92, 78, 92, 124, INK, 5.4);
      line(g, 92, 78, 92, 124, '#f2efe6', 3);
      poly(g, [[94, 78], [122, 88], [94, 100]]);
      paint(g, '#ffffff', INK, 1.6);
    },
  },
  {
    id: 'gm-exit', name: 'Exit arrow', cat: 'gm', sets: GM_SETS, tags: ['exit', 'arrow', 'direction', 'way out', 'leads to', 'marker'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { col: '#2a9d48' },
    variants: [{ name: 'Green', c: {} }, { name: 'Yellow', c: { col: '#e9c400' } }, { name: 'Red', c: { col: '#d62828' } }, { name: 'Blue', c: { col: '#1d6fb8' } }],
    desc: 'GM only. Points the way out (toward the top edge); rotate it to aim.',
    draw: ({ g, c }) => {
      poly(g, [[50, 8], [88, 48], [64, 48], [64, 90], [36, 90], [36, 48], [12, 48]]);
      paint(g, litFill(g, 12, 8, 76, 82, c.col, 0.3), INK, 2.6);
      poly(g, [[50, 20], [74, 44], [58, 44], [58, 82], [42, 82], [42, 44], [26, 44]]);
      dashed(g, alpha('#ffffff', 0.75), 2, [5, 4]);
    },
  },
  {
    id: 'gm-trap', name: 'Trap marker', cat: 'gm', sets: GM_SETS, tags: ['trap', 'warning', 'danger', 'hazard', 'marker', 'note'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { col: '#f77f00' },
    variants: [{ name: 'Orange', c: {} }, { name: 'Red', c: { col: '#d62828' } }],
    desc: 'GM only. A general warning marker for a trap or hazard you describe in your notes.',
    draw: ({ g, c }) => {
      gmBadge(g, 50, 50, 44, c.col);
      poly(g, [[50, 22], [76, 70], [24, 70]]);
      paint(g, '#ffe066', INK, 2.4);
      rr(g, 47, 36, 6, 20, 2.5); paint(g, INK, null);
      circle(g, 50, 62, 3.4); paint(g, INK, null);
    },
  },
];

export const DUNGEON_OBJECTS: ObjDef[] = [...CORE_DUNGEON, ...STRUCTURE, ...SACRED, ...LIGHTS, ...ARCANE, ...TRAPS, ...HAZARDS, ...MARKERS];

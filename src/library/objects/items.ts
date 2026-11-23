// Items pack: fire and lava, environment hazards, traps, doors and mechanisms, treasure and loot, magic items as
// props, and camp, siege and battlefield pieces. Same rules as the other sets: original art drawn in code with the
// Canvas 2D API, 1 square = 100 art units, top-down, light from the top-left, ink outline. Ids are stable once saved
// maps use them. Wall-mounted pieces put the wall along the TOP edge of their box. Doors run across the middle.
// Every object here has a matching 3D model in src/view3d/models-items.ts, keyed by the same id.
import type { ObjDef, G, Colors, Variant } from '../art/types';
import {
  rng, rr, circle, ellipse, poly, blob, lumpy, litFill, domeFill, paint, line, bevel, speckle, gem, glow, flame, coins,
  stone, blocks, board, strap, rivet, shade, mix, alpha, INK, LW, WOOD, METAL, STONE, CLOTH,
} from '../art/kit';

type R = () => number;
const TAU = Math.PI * 2;
const TRAP_RED = '#e63946';
const HOT = '#fff3b0';
const DARK = '#110d0a';
const BONE = '#e4dcc4';
const LEATHER = '#6b4428';
const PARCH = '#eadbb5';
const GOLD = '#e2b84a';

// ---------------------------------------------------------------- shared drawing helpers

const scalePts = (pts: number[][], cx: number, cy: number, k: number) => pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);

function dashed(g: G, col: string, lw: number, dash: number[] = [7, 5]) {
  g.setLineDash(dash);
  g.strokeStyle = col;
  g.lineWidth = lw;
  g.lineCap = 'butt';
  g.stroke();
  g.setLineDash([]);
}
/** The GM-only red dashed frame that marks a trap area. */
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
/** A plain arrow with a filled head. */
function arrow(g: G, x1: number, y1: number, x2: number, y2: number, col: string, lw = 2.4) {
  const a = Math.atan2(y2 - y1, x2 - x1), hl = lw * 3.4;
  line(g, x1, y1, x2 - Math.cos(a) * hl * 0.6, y2 - Math.sin(a) * hl * 0.6, col, lw);
  poly(g, [[x2, y2], [x2 - Math.cos(a - 0.45) * hl, y2 - Math.sin(a - 0.45) * hl], [x2 - Math.cos(a + 0.45) * hl, y2 - Math.sin(a + 0.45) * hl]]);
  g.fillStyle = col;
  g.fill();
}
/** A small made-up rune: a spine and two branches. */
function rune(g: G, cx: number, cy: number, s: number, r: R, col: string, lw: number) {
  const P = (i: number) => [cx + ((i % 3) - 1) * s / 2, cy + (Math.floor(i / 3) - 1) * s / 2];
  const a = Math.floor(r() * 3), b = 6 + Math.floor(r() * 3);
  g.beginPath();
  g.moveTo(P(a)[0], P(a)[1]);
  g.lineTo(P(b)[0], P(b)[1]);
  for (let k = 0; k < 2; k++) {
    const m = P(3 + Math.floor(r() * 3)), e = P(Math.floor(r() * 9));
    g.moveTo(m[0], m[1]);
    g.lineTo(e[0], e[1]);
  }
  g.strokeStyle = col;
  g.lineWidth = lw;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.stroke();
}
/** Hot liquid (lava) inside a blob outline: rock rim, glowing body, dark crust plates with lit edges, bubbles. */
function lavaBody(g: G, pts: number[][], cx: number, cy: number, R0: number, c: Colors, r: R, crust: number) {
  glow(g, cx, cy, R0 * 1.3, c.lava, 0.4);
  blob(g, pts);
  paint(g, litFill(g, cx - R0, cy - R0, R0 * 2, R0 * 2, c.rock, 0.2), INK, LW * 1.2);
  const inner = scalePts(pts, cx, cy, 0.84);
  blob(g, inner);
  const gr = g.createRadialGradient(cx - R0 * 0.15, cy - R0 * 0.15, R0 * 0.05, cx, cy, R0);
  gr.addColorStop(0, mix(c.lava, HOT, 0.75));
  gr.addColorStop(0.5, c.lava);
  gr.addColorStop(1, shade(c.lava, -0.45));
  paint(g, gr, shade(c.lava, -0.6), 1.6);
  g.save();
  blob(g, inner);
  g.clip();
  for (let i = 0; i < crust; i++) {
    const a = r() * TAU, d = Math.sqrt(r()) * R0 * 0.8, s = 4 + r() * R0 * 0.11;
    blob(g, lumpy(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s, 0.5, 6, r));
    paint(g, shade(c.rock, 0.05 + r() * 0.12), alpha(mix(c.lava, HOT, 0.45), 0.95), 1.6);
  }
  for (let i = 0; i < crust / 2 + 2; i++) {
    const a = r() * TAU, d = Math.sqrt(r()) * R0 * 0.7, s = 2 + r() * 3.5;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    circle(g, x, y, s);
    g.strokeStyle = alpha(HOT, 0.85);
    g.lineWidth = 1.1;
    g.stroke();
    circle(g, x - s * 0.3, y - s * 0.3, s * 0.3);
    g.fillStyle = alpha(HOT, 0.8);
    g.fill();
  }
  g.restore();
  blob(g, scalePts(inner, cx, cy, 0.985));
  g.strokeStyle = alpha(mix(c.lava, HOT, 0.6), 0.8);
  g.lineWidth = 1.2;
  g.stroke();
}
/** Wavy bank lines for a strip that runs along x and tiles end to end (both ends meet the box edge at the same height). */
function stripEdges(w: number, h: number, r: R, inset = 0.2, wob = 5) {
  const top: number[][] = [], bot: number[][] = [];
  const n = Math.round(w / 12);
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w, edge = i === 0 || i === n ? 0 : 1;
    top.push([x, h * inset + (Math.sin((x / w) * TAU * 2) * wob + (r() - 0.5) * 4) * edge]);
    bot.push([x, h * (1 - inset) + (Math.sin((x / w) * TAU * 2 + 1.3) * wob + (r() - 0.5) * 4) * edge]);
  }
  return { top, bot };
}
function stripPath(g: G, top: number[][], bot: number[][]) {
  g.beginPath();
  top.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  for (let i = bot.length - 1; i >= 0; i--) g.lineTo(bot[i][0], bot[i][1]);
  g.closePath();
}
/** Rocky banks above and below a strip. */
function banks(g: G, w: number, h: number, top: number[][], bot: number[][], rock: string, r: R) {
  for (const [edge, y0] of [[top, 0], [bot, h]] as [number[][], number][]) {
    g.beginPath();
    g.moveTo(0, y0);
    edge.forEach(([x, y]) => g.lineTo(x, y));
    g.lineTo(w, y0);
    g.closePath();
    paint(g, litFill(g, 0, 0, w, h, rock, 0.15), null);
    poly(g, edge, false);
    g.strokeStyle = INK;
    g.lineWidth = LW;
    g.stroke();
    for (let i = 0; i < w / 30; i++) {
      const x = 8 + r() * (w - 16), y = y0 === 0 ? 4 + r() * (h * 0.1) : h - 4 - r() * (h * 0.1);
      stone(g, x, y, 3 + r() * 3, shade(rock, 0.15), r);
    }
  }
}
/** Puffy cloud blobs filling a box: smoke, fog, darkness. */
function puffs(g: G, x: number, y: number, w: number, h: number, col: string, r: R, n: number, a = 0.8, rim?: string) {
  const spots: number[][] = [];
  for (let i = 0; i < n; i++) spots.push([x + w * (0.27 + r() * 0.46), y + h * (0.27 + r() * 0.46), Math.min(w, h) * (0.21 + r() * 0.06)]);
  if (rim) for (const [px, py, pr] of spots) glow(g, px, py, pr * 1.6, rim, 0.35);
  for (const [px, py, pr] of spots) {
    const gr = g.createRadialGradient(px - pr * 0.3, py - pr * 0.3, pr * 0.1, px, py, pr);
    gr.addColorStop(0, alpha(shade(col, 0.18), a));
    gr.addColorStop(0.7, alpha(col, a * 0.85));
    gr.addColorStop(1, alpha(col, 0));
    g.fillStyle = gr;
    g.fillRect(px - pr, py - pr, pr * 2, pr * 2);
  }
}
/** Top-down fire: teardrop tongues curling out from a hot core, in three layers, over a soft glow. */
function blaze(g: G, cx: number, cy: number, r: number, rand: R, hot: string, mid: string, outer: string) {
  glow(g, cx, cy, r * 2.3, mid, 0.5);
  const n = 6 + Math.floor(rand() * 3), off = rand() * TAU, curl = rand() < 0.5 ? 0.35 : -0.35;
  const angs = Array.from({ length: n }, (_, i) => off + (i / n) * TAU + (rand() - 0.5) * 0.5);
  const lens = angs.map(() => 0.75 + rand() * 0.55);
  for (const [col, k] of [[outer, 1], [mid, 0.7], [hot, 0.4]] as [string, number][]) {
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const a = angs[i], L = r * k * lens[i] * 1.3, wv = r * k * 0.5, px = -Math.sin(a), py = Math.cos(a);
      const ta = a + curl * 0.6, tx = cx + Math.cos(ta) * L, ty = cy + Math.sin(ta) * L;
      g.moveTo(cx + px * wv, cy + py * wv);
      g.quadraticCurveTo(cx + Math.cos(a) * L * 0.6 + px * wv, cy + Math.sin(a) * L * 0.6 + py * wv, tx, ty);
      g.quadraticCurveTo(cx + Math.cos(a) * L * 0.5 - px * wv * 0.6, cy + Math.sin(a) * L * 0.5 - py * wv * 0.6, cx - px * wv, cy - py * wv);
      g.closePath();
    }
    g.moveTo(cx + r * k * 0.62, cy);
    g.arc(cx, cy, r * k * 0.62, 0, TAU);
    g.fillStyle = col;
    g.fill('nonzero');
  }
}
/** A sword lying with its pommel at x,y pointing along ang, length L. */
function sword(g: G, x: number, y: number, ang: number, L: number, blade: string, hilt: string, wd = 1, grip = LEATHER) {
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  const gx = L * 0.24, bw = 4.6 * wd;
  poly(g, [[gx, -bw], [L - bw * 2.4, -bw * 0.85], [L, 0], [L - bw * 2.4, bw * 0.85], [gx, bw]]);
  paint(g, litFill(g, gx, -bw, L - gx, bw * 2, blade, 0.45), INK, 1.4);
  line(g, gx + 3, 0, L - bw * 2.6, 0, alpha(shade(blade, -0.45), 0.75), 1.1);
  rr(g, 4, -2.6 * wd, gx - 4, 5.2 * wd, 2);
  paint(g, litFill(g, 4, -3, gx, 6, grip, 0.3), INK, 1.1);
  rr(g, gx - 2.8, -bw * 2.5, 5.6, bw * 5, 2);
  paint(g, litFill(g, gx - 3, -bw * 2.5, 6, bw * 5, hilt, 0.4), INK, 1.2);
  circle(g, 3, 0, 4.2 * wd);
  paint(g, domeFill(g, 3, 0, 4.2 * wd, hilt, 0.5), INK, 1.1);
  g.restore();
}
/** A round shield seen from above. */
function roundShield(g: G, cx: number, cy: number, r: number, face: string, rim: string) {
  circle(g, cx, cy, r);
  paint(g, domeFill(g, cx, cy, r, rim, 0.35), INK, LW);
  circle(g, cx, cy, r * 0.86);
  paint(g, domeFill(g, cx, cy, r * 0.86, face, 0.3), alpha(INK, 0.6), 1);
  circle(g, cx, cy, r * 0.24);
  paint(g, domeFill(g, cx, cy, r * 0.24, rim, 0.6), INK, 1.2);
}
/** A glass flask lying on its side, neck pointing along ang. */
function flask(g: G, cx: number, cy: number, r: number, liq: string, ang = 0, cork = '#8a5a34') {
  g.save();
  g.translate(cx, cy);
  g.rotate(ang);
  rr(g, r * 0.62, -r * 0.3, r * 0.8, r * 0.6, 2);
  paint(g, 'rgba(214,236,240,0.9)', INK, 1);
  rr(g, r * 1.32, -r * 0.36, r * 0.38, r * 0.72, 1.5);
  paint(g, cork, INK, 1);
  circle(g, 0, 0, r);
  paint(g, domeFill(g, 0, 0, r, liq, 0.45), INK, 1.3);
  ellipse(g, -r * 0.32, -r * 0.42, r * 0.36, r * 0.17, -0.5);
  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.fill();
  g.restore();
}
/** A square stone pedestal seen from above. */
function plinth(g: G, cx: number, cy: number, s: number, col: string) {
  rr(g, cx - s / 2, cy - s / 2, s, s, 4);
  paint(g, litFill(g, cx - s / 2, cy - s / 2, s, s, shade(col, -0.1), 0.25), INK, LW);
  rr(g, cx - s * 0.38, cy - s * 0.38, s * 0.76, s * 0.76, 3);
  paint(g, litFill(g, cx - s * 0.38, cy - s * 0.38, s * 0.76, s * 0.76, col, 0.3), alpha(INK, 0.7), 1.2);
  bevel(g, cx - s * 0.38, cy - s * 0.38, s * 0.76, s * 0.76, 3, 0.3);
}
/** A plump cushion with corner tassels. */
function cushion(g: G, cx: number, cy: number, s: number, col: string, tassel = GOLD) {
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    circle(g, cx + dx * s * 0.47, cy + dy * s * 0.47, s * 0.07);
    paint(g, tassel, INK, 0.8);
  }
  g.beginPath();
  const k = s / 2;
  g.moveTo(cx - k, cy - k);
  g.quadraticCurveTo(cx, cy - k * 0.8, cx + k, cy - k);
  g.quadraticCurveTo(cx + k * 0.8, cy, cx + k, cy + k);
  g.quadraticCurveTo(cx, cy + k * 0.8, cx - k, cy + k);
  g.quadraticCurveTo(cx - k * 0.8, cy, cx - k, cy - k);
  paint(g, domeFill(g, cx, cy, s * 0.6, col, 0.3), INK, 1.4);
  circle(g, cx, cy, s * 0.05);
  paint(g, shade(col, -0.4), null);
}
/** A cloth sack or pouch with a tied neck pointing along ang. */
function sack(g: G, cx: number, cy: number, r: number, col: string, rr0: R, ang = -Math.PI / 2, tie = '#c9b48a') {
  blob(g, lumpy(cx, cy, r, 0.22, 9, rr0));
  paint(g, domeFill(g, cx, cy, r, col, 0.3), INK, 1.4);
  const nx = cx + Math.cos(ang) * r * 0.9, ny = cy + Math.sin(ang) * r * 0.9;
  ellipse(g, nx, ny, r * 0.32, r * 0.24, ang);
  paint(g, shade(col, -0.15), INK, 1.1);
  const tx = cx + Math.cos(ang) * r * 1.22, ty = cy + Math.sin(ang) * r * 1.22;
  blob(g, lumpy(tx, ty, r * 0.3, 0.6, 6, rr0));
  paint(g, shade(col, 0.05), INK, 1);
  line(g, nx - Math.sin(ang) * r * 0.3, ny + Math.cos(ang) * r * 0.3, nx + Math.sin(ang) * r * 0.3, ny - Math.cos(ang) * r * 0.3, tie, 2);
}
/** A coin stack seen from slightly above-left: a column of offset discs. */
function coinStack(g: G, cx: number, cy: number, r: number, n: number, col = GOLD) {
  for (let i = 0; i < n; i++) {
    const y = cy - i * 2.1, x = cx - i * 0.6;
    ellipse(g, x, y, r, r * 0.86);
    paint(g, i === n - 1 ? domeFill(g, x, y, r, col, 0.45) : shade(col, -0.15 - (i % 2) * 0.08), shade(col, -0.6), 0.9);
  }
  ellipse(g, cx - (n - 1) * 0.6, cy - (n - 1) * 2.1, r * 0.55, r * 0.45);
  g.strokeStyle = alpha(shade(col, -0.4), 0.7);
  g.lineWidth = 0.8;
  g.stroke();
}
/** A wooden plank seen from above, rotated about its centre. */
function plank(g: G, cx: number, cy: number, L: number, wd: number, ang: number, col: string, r: R) {
  g.save();
  g.translate(cx, cy);
  g.rotate(ang);
  board(g, -L / 2, -wd / 2, L, wd, col, r, 'h', 1.5);
  g.restore();
}
/** A sparkle star (4 points) for magic shimmer. */
function sparkle(g: G, x: number, y: number, s: number, col = '#ffffff') {
  poly(g, [[x, y - s], [x + s * 0.22, y - s * 0.22], [x + s, y], [x + s * 0.22, y + s * 0.22], [x, y + s], [x - s * 0.22, y + s * 0.22], [x - s, y], [x - s * 0.22, y - s * 0.22]]);
  g.fillStyle = col;
  g.fill();
}
/** A key lying flat, bow at x,y, shaft along ang. */
function key(g: G, x: number, y: number, ang: number, L: number, col: string) {
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  line(g, 0, 0, L, 0, INK, 4.4);
  line(g, 0, 0, L, 0, col, 2.6);
  for (const [bx, bh] of [[L - 2, 5], [L - 6, 3.5]]) {
    rr(g, bx - 1.6, 0, 3.2, bh, 0.8);
    paint(g, col, INK, 0.8);
  }
  circle(g, -3, 0, 5);
  g.strokeStyle = INK;
  g.lineWidth = 4.2;
  g.stroke();
  g.strokeStyle = col;
  g.lineWidth = 2.4;
  g.stroke();
  g.restore();
}

// ---------------------------------------------------------------- 1. fire and lava

const LAVA_VARS: Variant[] = [
  { name: 'Lava', c: {} },
  { name: 'Cooling crust', c: { lava: '#d9411a', rock: '#3a302b' }, f: { cool: 1 } },
  { name: 'Hellfire', c: { lava: '#ff3b6b', rock: '#24161c' } },
  { name: 'Spirit fire', c: { lava: '#3fd0ff', rock: '#1c2430' } },
];
const FIRE_VARS: Variant[] = [
  { name: 'Fire', c: {} },
  { name: 'Blue flame', c: { hot: '#e8fbff', mid: '#6fd3ff', outer: '#2a6fd6' } },
  { name: 'Green witchfire', c: { hot: '#f2ffd8', mid: '#8fe04a', outer: '#2f8a3a' } },
  { name: 'Violet flame', c: { hot: '#fbe8ff', mid: '#c77dff', outer: '#6a2ca0' } },
];

const FIRE: ObjDef[] = [
  {
    id: 'lava-pool', name: 'Lava pool', cat: 'hazard', sets: ['cave', 'dungeon', 'mine', 'desert', 'temple'], tags: ['lava', 'magma', 'molten', 'fire', 'volcano', 'pool', 'hazard'],
    w: 3, h: 3, layer: 'floor', flat: true, light: { bright: 15, dim: 15, color: '#ff6a1a' }, c: { lava: '#ff7a1a', rock: '#2e2622' },
    variants: LAVA_VARS,
    desc: 'A wide pool of molten rock. Heavy fire damage to anyone who enters or starts a turn in it.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      lavaBody(g, lumpy(w / 2, h / 2, 136, 0.22, 16, r), w / 2, h / 2, 136, c, r, f.cool ? 30 : 12);
    },
  },
  {
    id: 'lava-river', name: 'Lava river', cat: 'hazard', sets: ['cave', 'dungeon', 'mine', 'desert'], tags: ['lava', 'magma', 'river', 'flow', 'channel', 'fire', 'strip'],
    w: 4, h: 1, layer: 'floor', flat: true, light: { bright: 10, dim: 15, color: '#ff6a1a' }, c: { lava: '#ff7a1a', rock: '#2e2622' },
    variants: LAVA_VARS,
    desc: 'A flowing strip of lava. Lay several end to end. Heavy fire damage to anyone who enters it.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const { top, bot } = stripEdges(w, h, r, 0.22, 5);
      for (let x = 20; x < w; x += 40) glow(g, x, h / 2, 50, c.lava, 0.22);
      stripPath(g, top, bot);
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, shade(c.lava, -0.45));
      gr.addColorStop(0.5, mix(c.lava, HOT, 0.3));
      gr.addColorStop(1, shade(c.lava, -0.45));
      paint(g, gr, null);
      g.save();
      stripPath(g, top, bot);
      g.clip();
      for (let i = 0; i < 9; i++) {
        const y = h * (0.32 + r() * 0.36), x = r() * w, L = 30 + r() * 50;
        g.beginPath();
        g.moveTo(x, y);
        g.bezierCurveTo(x + L * 0.3, y - 4, x + L * 0.6, y + 4, x + L, y);
        g.strokeStyle = alpha(HOT, 0.65);
        g.lineWidth = 1.6;
        g.stroke();
      }
      for (let i = 0; i < (f.cool ? 22 : 9); i++) {
        const x = r() * w, y = h * (0.3 + r() * 0.4);
        ellipse(g, x, y, 6 + r() * 9, 3 + r() * 3, (r() - 0.5) * 0.4);
        paint(g, shade(c.rock, 0.1 + r() * 0.1), alpha(mix(c.lava, HOT, 0.4), 0.9), 1.4);
      }
      g.restore();
      banks(g, w, h, top, bot, c.rock, r);
    },
  },
  {
    id: 'burning-ground', name: 'Burning ground', cat: 'hazard', sets: ['dungeon', 'forest', 'town', 'camp', 'castle', 'farm'], tags: ['fire', 'flames', 'burning', 'blaze', 'spell', 'hazard'],
    w: 2, h: 2, layer: 'floor', flat: true, light: { bright: 10, dim: 15, color: '#ff8a2a' }, c: { hot: '#fff3b0', mid: '#ffb02e', outer: '#e2481b', soot: '#2a201a' },
    variants: FIRE_VARS,
    desc: 'A patch of open flame. Fire damage to anyone who enters or starts a turn here.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(w / 2, h / 2, 88, 0.3, 13, r));
      g.fillStyle = alpha(c.soot, 0.85);
      g.fill();
      speckle(g, 20, 20, 160, 160, r, 40, alpha('#000000', 0.4), 2);
      const spots: number[][] = [[w / 2 + (r() - 0.5) * 16, h / 2 + (r() - 0.5) * 16, 18 + r() * 6]];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + r() * 0.5, d = 42 + r() * 18;
        spots.push([w / 2 + Math.cos(a) * d, h / 2 + Math.sin(a) * d, 11 + r() * 8]);
      }
      spots.sort((a, b) => a[1] - b[1]);
      for (const [x, y, s] of spots) blaze(g, x, y, s, r, c.hot, c.mid, c.outer);
      speckle(g, 20, 20, 160, 160, r, 26, c.mid, 1.4);
    },
  },
  {
    id: 'wall-of-fire', name: 'Wall of fire', cat: 'hazard', sets: ['dungeon', 'temple', 'wizard', 'castle', 'forest'], tags: ['fire', 'flames', 'wall', 'spell', 'barrier', 'blaze'],
    w: 3, h: 1, layer: 'floor', flat: true, blocksSight: true, light: { bright: 20, dim: 20, color: '#ff8a2a' }, c: { hot: '#fff3b0', mid: '#ffb02e', outer: '#e2481b' },
    variants: FIRE_VARS,
    desc: 'A roaring sheet of flame you cannot see through. Fire damage to anyone who passes through or ends a turn beside it.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      rr(g, 4, h / 2 - 16, w - 8, 32, 14);
      g.fillStyle = alpha('#1c140f', 0.7);
      g.fill();
      for (let x = 22; x < w - 16; x += 18.5) blaze(g, x + (r() - 0.5) * 5, h / 2 + (r() - 0.5) * 10, 15 + r() * 5, r, c.hot, c.mid, c.outer);
    },
  },
  {
    id: 'embers-ash', name: 'Embers and ash', cat: 'hazard', sets: ['dungeon', 'forest', 'town', 'camp', 'castle', 'farm', 'cave'], tags: ['embers', 'ash', 'cinders', 'burnt', 'smoulder', 'fire'],
    w: 2, h: 2, layer: 'floor', flat: true, light: { bright: 0, dim: 10, color: '#ff6a1a' }, c: { ash: '#6e6862', ember: '#ff6a1a' },
    variants: [{ name: 'Glowing', c: {} }, { name: 'Pale ash', c: { ash: '#a8a29a' } }, { name: 'Blue embers', c: { ember: '#3fd0ff' } }],
    desc: 'Smouldering cinders. Hot underfoot: a little fire damage to anyone who walks through barefoot or lies down.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(w / 2, h / 2, 84, 0.35, 14, r));
      g.fillStyle = alpha(c.ash, 0.8);
      g.fill();
      for (let i = 0; i < 8; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 60;
        blob(g, lumpy(w / 2 + Math.cos(a) * d, h / 2 + Math.sin(a) * d, 10 + r() * 12, 0.5, 7, r));
        g.fillStyle = alpha(shade(c.ash, -0.45), 0.6);
        g.fill();
      }
      for (let i = 0; i < 24; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 64, x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d;
        glow(g, x, y, 9, c.ember, 0.5);
        circle(g, x, y, 1.4 + r() * 2);
        g.fillStyle = r() < 0.4 ? mix(c.ember, HOT, 0.6) : c.ember;
        g.fill();
      }
      for (let i = 0; i < 4; i++) {
        const x = 50 + r() * 100, y = 50 + r() * 100;
        plank(g, x, y, 22 + r() * 16, 6, r() * TAU, '#2b211b', r);
        line(g, x - 6, y, x + 6, y, alpha(c.ember, 0.9), 1.2);
      }
    },
  },
  {
    id: 'burning-wreckage', name: 'Burning wreckage', cat: 'hazard', sets: ['town', 'castle', 'ship', 'camp', 'farm', 'forest'], tags: ['fire', 'wreck', 'debris', 'beams', 'burning', 'ruin', 'cart'],
    w: 2, h: 2, difficult: true, light: { bright: 15, dim: 15, color: '#ff8a2a' }, c: { wood: '#4a3424', hot: '#fff3b0', mid: '#ffb02e', outer: '#e2481b' },
    variants: [{ name: 'Charred timbers', c: {} }, { name: 'Ship timbers', c: { wood: '#5a4a3a' } }, { name: 'Witchfire', c: { hot: '#f2ffd8', mid: '#8fe04a', outer: '#2f8a3a' } }],
    desc: 'Collapsed, burning beams. Difficult terrain, and fire damage to anyone who climbs through.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(w / 2, h / 2, 80, 0.35, 12, r));
      g.fillStyle = alpha('#1d1612', 0.75);
      g.fill();
      for (let i = 0; i < 7; i++) plank(g, 40 + r() * 120, 40 + r() * 120, 60 + r() * 50, 12 + r() * 6, r() * Math.PI, shade(c.wood, (r() - 0.5) * 0.2), r);
      for (let i = 0; i < 3; i++) {
        const x = 50 + r() * 100, y = 50 + r() * 100;
        g.save();
        g.translate(x, y);
        g.rotate(r() * Math.PI);
        rr(g, -28, -7, 56, 14, 3);
        paint(g, litFill(g, -28, -7, 56, 14, '#2b211b', 0.15), INK, 1.4);
        line(g, -22, 0, 20, 2, alpha(c.mid, 0.9), 1.4);
        g.restore();
      }
      for (const [x, y] of [[60, 70], [130, 60], [100, 110], [70, 140], [140, 140]]) blaze(g, x + (r() - 0.5) * 16, y + (r() - 0.5) * 16, 11 + r() * 7, r, c.hot, c.mid, c.outer);
    },
  },
  {
    id: 'steam-vent', name: 'Steam vent', cat: 'hazard', sets: ['cave', 'mine', 'dungeon', 'winter', 'sewer'], tags: ['steam', 'vent', 'geyser', 'scald', 'fumarole', 'sulfur'],
    w: 1, h: 1, layer: 'floor', flat: true, c: { rock: '#4e4740', steam: '#eef3f6' },
    variants: [{ name: 'Steam', c: {} }, { name: 'Sulfur', c: { steam: '#f0e7a0', rock: '#6a5a3a' } }, { name: 'Dark rock', c: { rock: '#2e2a28' } }],
    desc: 'A crack that blasts scalding steam now and then. Fire damage to anyone standing over it when it bursts.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 50, 38, 0.3, 11, r));
      paint(g, litFill(g, 10, 10, 80, 80, c.rock, 0.2), INK, LW);
      blob(g, lumpy(50, 52, 14, 0.4, 8, r, 9));
      paint(g, '#0c0a09', INK, 1.4);
      for (let i = 0; i < 6; i++) { const a = r() * TAU; line(g, 50 + Math.cos(a) * 12, 52 + Math.sin(a) * 8, 50 + Math.cos(a) * 32, 52 + Math.sin(a) * 30, alpha('#000000', 0.45), 1.1); }
      speckle(g, 22, 22, 56, 56, r, 10, alpha(mix(c.steam, '#d8c46a', 0.4), 0.7), 1.6);
      puffs(g, 22, 18, 62, 62, c.steam, r, 6, 0.75);
    },
  },
  {
    id: 'magma-vent', name: 'Magma vent', cat: 'hazard', sets: ['cave', 'mine', 'dungeon', 'desert'], tags: ['magma', 'lava', 'vent', 'volcano', 'fire', 'eruption', 'smoke'],
    w: 1, h: 1, layer: 'floor', flat: true, light: { bright: 5, dim: 10, color: '#ff6a1a' }, c: { lava: '#ff7a1a', rock: '#2e2622' },
    variants: [{ name: 'Magma', c: {} }, { name: 'Hellfire', c: { lava: '#ff3b6b', rock: '#24161c' } }, { name: 'Spirit fire', c: { lava: '#3fd0ff', rock: '#1c2430' } }],
    desc: 'A cone of rock spitting molten droplets and smoke. Fire damage to anyone in or next to it when it spurts.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 50, c.lava, 0.45);
      blob(g, lumpy(50, 50, 40, 0.25, 10, r));
      paint(g, domeFill(g, 50, 50, 40, c.rock, 0.3), INK, LW);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + r() * 0.3; line(g, 50 + Math.cos(a) * 16, 50 + Math.sin(a) * 16, 50 + Math.cos(a) * 36, 50 + Math.sin(a) * 36, alpha(shade(c.rock, -0.5), 0.7), 1.2); }
      circle(g, 50, 50, 15);
      const gr = g.createRadialGradient(50, 50, 2, 50, 50, 15);
      gr.addColorStop(0, HOT); gr.addColorStop(0.5, c.lava); gr.addColorStop(1, shade(c.lava, -0.5));
      paint(g, gr, INK, 1.6);
      for (let i = 0; i < 7; i++) { const a = r() * TAU, d = 20 + r() * 22; circle(g, 50 + Math.cos(a) * d, 50 + Math.sin(a) * d, 1.6 + r() * 1.6); g.fillStyle = mix(c.lava, HOT, r() * 0.6); g.fill(); }
      puffs(g, 40, 6, 50, 40, '#3a3430', r, 3, 0.55);
    },
  },
  {
    id: 'tar-pit', name: 'Tar pit', cat: 'hazard', sets: ['swamp', 'cave', 'desert', 'forest', 'dungeon'], tags: ['tar', 'pitch', 'bitumen', 'sticky', 'bog', 'restrain', 'flammable'],
    w: 2, h: 2, layer: 'floor', flat: true, difficult: true, c: { tar: '#1f1b18', edge: '#4a3f30' },
    variants: [{ name: 'Tar', c: {} }, { name: 'Bitumen', c: { tar: '#2e2116', edge: '#6a5232' } }, { name: 'With old bones', c: {}, f: { bones: 1 } }],
    desc: 'Thick, sticky tar. Anyone who walks in is held fast until they pull free, and it burns fiercely if lit.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const pts = lumpy(w / 2, h / 2, 86, 0.25, 13, r, 80);
      blob(g, pts);
      paint(g, alpha(c.edge, 0.9), null);
      const inner = scalePts(pts, w / 2, h / 2, 0.86);
      blob(g, inner);
      const gr = g.createRadialGradient(80, 76, 6, 100, 100, 90);
      gr.addColorStop(0, shade(c.tar, 0.22)); gr.addColorStop(1, shade(c.tar, -0.3));
      paint(g, gr, INK, LW);
      g.save();
      blob(g, inner);
      g.clip();
      if (f.bones) {
        for (let i = 0; i < 4; i++) { const x = 60 + r() * 80, y = 60 + r() * 80, a = r() * Math.PI; line(g, x - Math.cos(a) * 14, y - Math.sin(a) * 14, x + Math.cos(a) * 14, y + Math.sin(a) * 14, alpha(BONE, 0.85), 4); }
        circle(g, 120, 86, 9); paint(g, alpha(BONE, 0.9), alpha(INK, 0.6), 1);
      }
      for (let i = 0; i < 9; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 62, x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d, s = 3 + r() * 6;
        circle(g, x, y, s);
        paint(g, domeFill(g, x, y, s, shade(c.tar, 0.15), 0.6), alpha('#000000', 0.6), 0.9);
        circle(g, x - s * 0.35, y - s * 0.35, s * 0.25);
        g.fillStyle = 'rgba(255,255,255,0.55)';
        g.fill();
      }
      for (let i = 0; i < 3; i++) {
        const y = 60 + i * 30 + r() * 8;
        g.beginPath(); g.moveTo(50 + r() * 20, y); g.quadraticCurveTo(100, y - 8, 140 + r() * 20, y);
        g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 2; g.stroke();
      }
      g.restore();
    },
  },
  {
    id: 'oil-slick', name: 'Oil slick', cat: 'hazard', sets: ['dungeon', 'town', 'castle', 'ship', 'sewer', 'tavern', 'wizard'], tags: ['oil', 'grease', 'slick', 'slippery', 'flammable', 'spill', 'prone'],
    w: 2, h: 2, layer: 'floor', flat: true, difficult: true, c: { oil: '#3a2a16' },
    variants: [{ name: 'Lamp oil', c: {} }, { name: 'Grease', c: { oil: '#c9c0a0' }, f: { grease: 1 } }, { name: 'Black oil', c: { oil: '#141210' } }],
    desc: 'A slippery spill. Anyone crossing may slip and fall prone; oil catches fire from any flame.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const pts = lumpy(w / 2, h / 2, 84, 0.4, 15, r, 74);
      blob(g, pts);
      paint(g, alpha(c.oil, f.grease ? 0.7 : 0.8), alpha(INK, 0.5), 1.4);
      for (let i = 0; i < 4; i++) {
        const a = r() * TAU, d = 70 + r() * 18;
        blob(g, lumpy(w / 2 + Math.cos(a) * d, h / 2 + Math.sin(a) * d * 0.9, 7 + r() * 6, 0.4, 7, r));
        paint(g, alpha(c.oil, 0.75), alpha(INK, 0.4), 1);
      }
      g.save();
      blob(g, pts);
      g.clip();
      const sheens = f.grease ? ['rgba(255,255,255,0.35)', 'rgba(230,220,190,0.4)'] : ['rgba(120,90,220,0.35)', 'rgba(60,200,180,0.32)', 'rgba(240,190,60,0.3)', 'rgba(220,80,160,0.28)'];
      for (let i = 0; i < 9; i++) {
        const x = 40 + r() * 120, y = 40 + r() * 120, rx = 14 + r() * 26;
        g.beginPath();
        g.ellipse(x, y, rx, rx * (0.35 + r() * 0.3), r() * Math.PI, 0, Math.PI * (1 + r()));
        g.strokeStyle = sheens[i % sheens.length];
        g.lineWidth = 3 + r() * 3;
        g.stroke();
      }
      ellipse(g, 76, 70, 26, 9, -0.5);
      g.fillStyle = 'rgba(255,255,255,0.16)';
      g.fill();
      g.restore();
    },
  },
];

// ---------------------------------------------------------------- 2. other environment hazards

const ENV: ObjDef[] = [
  {
    id: 'ice-thin', name: 'Thin ice', cat: 'hazard', sets: ['winter', 'cave', 'forest', 'swamp'], tags: ['ice', 'thin ice', 'slippery', 'frozen', 'break', 'cold', 'slick'],
    w: 2, h: 2, layer: 'floor', flat: true, c: { ice: '#bfe3f2', water: '#1d3f55' },
    variants: [{ name: 'Thin, cracking', c: {} }, { name: 'Slippery sheet', c: { ice: '#d4eef8' }, f: { slick: 1 } }, { name: 'Dark lake ice', c: { ice: '#8fb8cc', water: '#0e2433' } }],
    desc: 'Thin ice cracks under weight and can drop anyone into freezing water; a slick sheet makes footing hard (may fall prone).',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const pts = lumpy(w / 2, h / 2, 88, 0.2, 14, r);
      blob(g, pts);
      paint(g, alpha('#eef6fa', 0.9), INK, LW);
      const inner = scalePts(pts, w / 2, h / 2, 0.9);
      blob(g, inner);
      const gr = g.createLinearGradient(20, 20, 180, 180);
      gr.addColorStop(0, shade(c.ice, 0.35)); gr.addColorStop(0.6, c.ice); gr.addColorStop(1, shade(c.ice, -0.25));
      paint(g, gr, alpha(shade(c.ice, -0.5), 0.6), 1);
      g.save();
      blob(g, inner);
      g.clip();
      if (f.slick) {
        for (let i = 0; i < 6; i++) { const x = 30 + r() * 120, y = 30 + r() * 120; line(g, x, y, x + 30 + r() * 30, y - 16 - r() * 14, 'rgba(255,255,255,0.65)', 2 + r() * 2); }
      } else {
        for (let i = 0; i < 2; i++) {
          const hx = 70 + r() * 60, hy = 70 + r() * 60;
          blob(g, lumpy(hx, hy, 9 + r() * 7, 0.45, 8, r));
          paint(g, c.water, alpha(INK, 0.8), 1.2);
          for (let k = 0; k < 7; k++) {
            const a = (k / 7) * TAU + r() * 0.5;
            let x = hx, y = hy;
            g.beginPath(); g.moveTo(x, y);
            for (let s = 0; s < 4; s++) { x += Math.cos(a + (r() - 0.5) * 0.9) * (10 + r() * 10); y += Math.sin(a + (r() - 0.5) * 0.9) * (10 + r() * 10); g.lineTo(x, y); }
            g.strokeStyle = alpha(shade(c.ice, -0.55), 0.85); g.lineWidth = 1.2; g.stroke();
          }
        }
      }
      ellipse(g, 70, 60, 34, 10, -0.6);
      g.fillStyle = 'rgba(255,255,255,0.3)';
      g.fill();
      g.restore();
    },
  },
  {
    id: 'deep-water', name: 'Deep water pool', cat: 'hazard', sets: ['cave', 'forest', 'dungeon', 'swamp', 'sewer', 'winter', 'temple'], tags: ['water', 'pool', 'deep', 'swim', 'drown', 'frigid', 'cold', 'lake'],
    w: 3, h: 3, layer: 'floor', flat: true, c: { water: '#2f6f8f', shore: '#7a7166' },
    variants: [{ name: 'Deep', c: {} }, { name: 'Frigid', c: { water: '#6fa8c0', shore: '#dfe8ee' }, f: { ice: 1 } }, { name: 'Murky', c: { water: '#4a5a32', shore: '#5a4a32' } }, { name: 'Underground', c: { water: '#1c3a4c', shore: '#4e4b48' } }],
    desc: 'Water too deep to stand in: swim or sink. Frigid water also tires anyone who stays in it.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const pts = lumpy(w / 2, h / 2, 138, 0.2, 16, r);
      blob(g, pts);
      paint(g, litFill(g, 0, 0, w, h, c.shore, 0.2), INK, LW * 1.2);
      const inner = scalePts(pts, w / 2, h / 2, 0.88);
      blob(g, inner);
      const gr = g.createRadialGradient(w / 2 + 10, h / 2 + 10, 8, w / 2, h / 2, 130);
      gr.addColorStop(0, shade(c.water, -0.6)); gr.addColorStop(0.55, shade(c.water, -0.2)); gr.addColorStop(1, shade(c.water, 0.25));
      paint(g, gr, alpha(INK, 0.8), 1.4);
      g.save();
      blob(g, inner);
      g.clip();
      for (let i = 0; i < 7; i++) {
        const x = 40 + r() * 220, y = 40 + r() * 220, L = 20 + r() * 30;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 5, x + L, y);
        g.strokeStyle = 'rgba(255,255,255,0.32)'; g.lineWidth = 1.4; g.stroke();
      }
      if (f.ice) for (let i = 0; i < 5; i++) {
        const a = r() * TAU, d = 60 + r() * 50;
        poly(g, lumpy(w / 2 + Math.cos(a) * d, h / 2 + Math.sin(a) * d, 12 + r() * 12, 0.5, 6, r));
        paint(g, alpha('#f2f8fb', 0.9), alpha(INK, 0.7), 1.1);
      }
      ellipse(g, 100, 90, 50, 14, -0.5);
      g.fillStyle = 'rgba(255,255,255,0.14)';
      g.fill();
      g.restore();
      for (let i = 0; i < 7; i++) { const a = r() * TAU; stone(g, w / 2 + Math.cos(a) * 128, h / 2 + Math.sin(a) * 128, 6 + r() * 6, shade(c.shore, 0.1), r); }
    },
  },
  {
    id: 'rapids', name: 'Rushing water', cat: 'hazard', sets: ['forest', 'cave', 'winter', 'sewer', 'mine'], tags: ['rapids', 'river', 'current', 'stream', 'white water', 'swim', 'strip'],
    w: 4, h: 1, layer: 'floor', flat: true, difficult: true, c: { water: '#3d7fa0', rock: '#7a7166' },
    variants: [{ name: 'River', c: {} }, { name: 'Glacial', c: { water: '#7fc0d8', rock: '#a8b4bc' } }, { name: 'Muddy', c: { water: '#7a6a42', rock: '#6a5a40' } }, { name: 'Sewer', c: { water: '#5a6a3a', rock: '#5a5650' } }],
    desc: 'A fast current. Hard going, and it pushes swimmers downstream (toward the right edge) each turn.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const { top, bot } = stripEdges(w, h, r, 0.18, 4);
      stripPath(g, top, bot);
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, shade(c.water, 0.2)); gr.addColorStop(0.5, shade(c.water, -0.15)); gr.addColorStop(1, shade(c.water, 0.2));
      paint(g, gr, null);
      g.save();
      stripPath(g, top, bot);
      g.clip();
      for (let i = 0; i < 26; i++) {
        const x = r() * w, y = h * (0.25 + r() * 0.5), L = 10 + r() * 14;
        g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + L, y); g.lineTo(x, y + 4);
        g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.6; g.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const x = 30 + r() * (w - 60), y = h * (0.3 + r() * 0.4);
        ellipse(g, x - 8, y, 16, 9); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fill();
        stone(g, x, y, 7 + r() * 4, c.rock, r);
      }
      g.restore();
      banks(g, w, h, top, bot, c.rock, r);
    },
  },
  {
    id: 'whirlpool', name: 'Whirlpool', cat: 'hazard', sets: ['ship', 'cave', 'sewer', 'temple', 'wizard'], tags: ['whirlpool', 'vortex', 'maelstrom', 'water', 'drown', 'pull'],
    w: 3, h: 3, layer: 'floor', flat: true, c: { water: '#2f6f8f' },
    variants: [{ name: 'Sea', c: {} }, { name: 'Dark water', c: { water: '#1c2f3a' } }, { name: 'Arcane', c: { water: '#5a3a9a' } }, { name: 'Sewer', c: { water: '#5a6a3a' } }],
    desc: 'A spinning vortex. It drags swimmers toward the middle each turn and pulls them under there.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const cx = w / 2, cy = h / 2;
      circle(g, cx, cy, 142);
      const gr = g.createRadialGradient(cx, cy, 4, cx, cy, 142);
      gr.addColorStop(0, '#05080a'); gr.addColorStop(0.2, shade(c.water, -0.6)); gr.addColorStop(1, shade(c.water, 0.15));
      g.fillStyle = gr;
      g.fill();
      const offs = [0, 1, 2, 3, 4, 5].map((k) => (k / 6) * TAU + r() * 0.3);
      for (const [col, lw] of [[alpha(shade(c.water, -0.5), 0.6), 6], [alpha('#ffffff', 0.45), 2.2]] as [string, number][])
        for (const off of offs) {
          g.beginPath();
          for (let t = 0; t <= 1; t += 0.02) {
            const rad = 138 * (1 - t) + 6, a = off + t * 7.5;
            const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
            t ? g.lineTo(x, y) : g.moveTo(x, y);
          }
          g.strokeStyle = col;
          g.lineWidth = lw * (1 - 0.0);
          g.stroke();
        }
      circle(g, cx, cy, 142);
      g.strokeStyle = alpha('#ffffff', 0.25);
      g.lineWidth = 3;
      g.stroke();
    },
  },
  {
    id: 'sinkhole', name: 'Sinkhole', cat: 'hazard', sets: ['forest', 'desert', 'cave', 'town', 'mine', 'swamp', 'farm'], tags: ['sinkhole', 'collapse', 'hole', 'pit', 'fall', 'ground'],
    w: 2, h: 2, layer: 'floor', flat: true, c: { earth: '#7a5e40' },
    variants: [{ name: 'Earth', c: {} }, { name: 'Sand', c: { earth: '#c9ab72' } }, { name: 'Stone', c: { earth: '#7e7a72' } }, { name: 'Snow', c: { earth: '#c8d4dc' } }],
    desc: 'The ground gives way into a deep hole. Anyone on it falls unless they leap clear; the edges keep crumbling.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const cx = w / 2, cy = h / 2;
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + r() * 0.4;
        g.beginPath(); g.moveTo(cx + Math.cos(a) * 62, cy + Math.sin(a) * 62);
        g.lineTo(cx + Math.cos(a + 0.12) * 80, cy + Math.sin(a + 0.12) * 80); g.lineTo(cx + Math.cos(a - 0.05) * 94, cy + Math.sin(a - 0.05) * 94);
        g.strokeStyle = alpha(shade(c.earth, -0.6), 0.8); g.lineWidth = 1.4; g.stroke();
      }
      const pts = lumpy(cx, cy, 70, 0.25, 12, r);
      blob(g, pts);
      paint(g, alpha(shade(c.earth, -0.15), 0.95), INK, LW);
      for (const k of [0.82, 0.62, 0.42]) {
        blob(g, scalePts(pts, cx, cy + 4 * (1 - k), k));
        g.fillStyle = shade(c.earth, -0.3 - (1 - k) * 0.7);
        g.fill();
        g.strokeStyle = alpha('#000000', 0.35);
        g.lineWidth = 1;
        g.stroke();
      }
      blob(g, scalePts(pts, cx, cy + 4, 0.26));
      g.fillStyle = '#050403';
      g.fill();
      for (let i = 0; i < 8; i++) { const a = r() * TAU, d = 68 + r() * 22; stone(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 3 + r() * 4, shade(c.earth, 0.1), r); }
    },
  },
  {
    id: 'crumbling-ledge', name: 'Crumbling ledge', cat: 'hazard', sets: ['cave', 'mine', 'dungeon', 'castle', 'winter'], tags: ['ledge', 'cliff', 'edge', 'crumble', 'collapse', 'fall', 'drop'],
    w: 2, h: 1, layer: 'floor', flat: true, c: { stone: '#8a8780' },
    variants: [{ name: 'Grey stone', c: {} }, { name: 'Sandstone', c: { stone: '#b8a27c' } }, { name: 'Dark stone', c: { stone: '#4e4b48' } }, { name: 'Icy', c: { stone: '#bcd4e0' } }],
    desc: 'A ledge (top half) over a drop (bottom half). Weight near the cracked lip makes it break away.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const gr = g.createLinearGradient(0, 40, 0, h);
      gr.addColorStop(0, '#1a1714'); gr.addColorStop(1, '#030303');
      g.fillStyle = gr;
      g.fillRect(0, 40, w, h - 40);
      const edge: number[][] = [];
      for (let x = 0; x <= w; x += 12) edge.push([x, 48 + (x === 0 || x >= w ? 0 : (r() - 0.5) * 14)]);
      g.beginPath();
      g.moveTo(0, 0);
      edge.forEach(([x, y]) => g.lineTo(x, y));
      g.lineTo(w, 0);
      g.closePath();
      g.save();
      g.clip();
      blocks(g, 0, 0, w, 60, c.stone, r, 26, 16);
      g.restore();
      poly(g, edge, false);
      g.strokeStyle = INK; g.lineWidth = LW * 1.2; g.stroke();
      for (let i = 0; i < 4; i++) {
        const x = 20 + r() * (w - 40);
        g.beginPath(); g.moveTo(x, 50); g.lineTo(x + (r() - 0.5) * 12, 34); g.lineTo(x + (r() - 0.5) * 20, 18);
        g.strokeStyle = alpha('#000000', 0.7); g.lineWidth = 1.6; g.stroke();
      }
      for (let i = 0; i < 6; i++) stone(g, 15 + r() * (w - 30), 60 + r() * 34, 3 + r() * 5, shade(c.stone, -0.3 - r() * 0.2), r);
    },
  },
  {
    id: 'caltrops', name: 'Caltrops', cat: 'hazard', sets: ['dungeon', 'castle', 'camp', 'town', 'forest'], tags: ['caltrops', 'spikes', 'ball bearings', 'marbles', 'scatter', 'slip', 'prone'],
    w: 1, h: 1, layer: 'floor', flat: true, difficult: true, c: { metal: '#6c6f73' },
    variants: [{ name: 'Iron caltrops', c: {} }, { name: 'Rusted', c: { metal: '#8b4a2b' } }, { name: 'Ball bearings', c: { metal: '#c9ced3' }, f: { balls: 1 } }],
    desc: 'Scattered spikes (piercing damage and slowed) or ball bearings (may slip and fall prone) to anyone who walks through without care.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < (f.balls ? 30 : 12); i++) {
        const x = 14 + r() * 72, y = 14 + r() * 72;
        if (f.balls) {
          const s = 3 + r() * 1.4;
          circle(g, x, y, s);
          paint(g, domeFill(g, x, y, s, c.metal, 0.6), INK, 0.8);
          continue;
        }
        const a = r() * TAU;
        for (let k = 0; k < 3; k++) {
          const b = a + (k / 3) * TAU, ex = x + Math.cos(b) * 9, ey = y + Math.sin(b) * 9;
          poly(g, [[x + Math.cos(b + 1.3) * 2.6, y + Math.sin(b + 1.3) * 2.6], [ex, ey], [x + Math.cos(b - 1.3) * 2.6, y + Math.sin(b - 1.3) * 2.6]]);
          paint(g, litFill(g, x - 9, y - 9, 18, 18, c.metal, 0.45), INK, 1);
        }
        circle(g, x, y, 3);
        paint(g, domeFill(g, x, y, 3, c.metal, 0.6), INK, 1);
      }
    },
  },
  {
    id: 'brambles', name: 'Razor brambles', cat: 'hazard', sets: ['forest', 'swamp', 'farm', 'castle', 'crypt'], tags: ['brambles', 'thorns', 'briars', 'thicket', 'razorvine', 'plants', 'difficult'],
    w: 2, h: 2, difficult: true, c: { vine: '#3f5a2a', thorn: '#d8d0b0', berry: '#7a1f3a' },
    variants: [{ name: 'Green', c: {} }, { name: 'Dead brown', c: { vine: '#5a4630', berry: '#2a1a14' } }, { name: 'Blood thorns', c: { vine: '#3a2a2a', thorn: '#c0392b', berry: '#c0392b' } }],
    desc: 'A tangle of thorny vines. Difficult terrain, and slashing damage to anyone who pushes through.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(w / 2, h / 2, 84, 0.35, 14, r));
      paint(g, alpha(shade(c.vine, -0.45), 0.85), alpha(INK, 0.6), 1.2);
      const vines: number[][][] = [];
      for (let i = 0; i < 11; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 46;
        let x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d, dir = r() * TAU;
        const p: number[][] = [[x, y]];
        for (let s = 0; s < 6; s++) { dir += (r() - 0.5) * 1.5; x += Math.cos(dir) * 14; y += Math.sin(dir) * 14; x = Math.max(18, Math.min(182, x)); y = Math.max(18, Math.min(182, y)); p.push([x, y]); }
        vines.push(p);
      }
      const path = (p: number[][]) => { g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length - 1; i++) g.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2); };
      for (const p of vines) { path(p); g.strokeStyle = INK; g.lineWidth = 8; g.lineCap = 'round'; g.stroke(); }
      for (const p of vines) { path(p); g.strokeStyle = shade(c.vine, 0.1 + r() * 0.2); g.lineWidth = 5.4; g.stroke(); path(p); g.strokeStyle = alpha('#ffffff', 0.18); g.lineWidth = 1.4; g.stroke(); }
      for (const p of vines) for (let i = 1; i < p.length; i++) {
        const [x, y] = p[i];
        if (r() < 0.5) { const la = r() * TAU; ellipse(g, x + Math.cos(la) * 7, y + Math.sin(la) * 7, 6, 3, la); paint(g, shade(c.vine, 0.3), INK, 0.8); }
        if (r() < 0.6) {
          const a = r() * TAU, bx = x, by = y;
          poly(g, [[bx + Math.cos(a + 1.5) * 2.4, by + Math.sin(a + 1.5) * 2.4], [bx + Math.cos(a) * 9, by + Math.sin(a) * 9], [bx + Math.cos(a - 1.5) * 2.4, by + Math.sin(a - 1.5) * 2.4]]);
          paint(g, c.thorn, INK, 0.9);
        }
      }
      for (let i = 0; i < 7; i++) { const [x, y] = vines[i][3]; circle(g, x + 4, y + 3, 3.6); paint(g, domeFill(g, x + 4, y + 3, 3.6, c.berry, 0.5), INK, 0.8); }
    },
  },
  {
    id: 'obscuring-cloud', name: 'Smoke cloud', cat: 'hazard', sets: ['dungeon', 'town', 'castle', 'camp', 'wizard', 'swamp', 'forest'], tags: ['smoke', 'fog', 'darkness', 'magical darkness', 'cloud', 'obscured', 'blind', 'mist'],
    w: 2, h: 2, layer: 'overhead', blocksSight: true, c: { col: '#6e6a66' },
    variants: [{ name: 'Smoke', c: {} }, { name: 'Magical darkness', c: { col: '#0b0910' }, f: { dark: 1 } }, { name: 'Fog', c: { col: '#e6ecef' } }, { name: 'Ash cloud', c: { col: '#4a4440' } }],
    desc: 'A thick cloud nobody can see through. Magical darkness also defeats darkvision and ordinary light.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      puffs(g, 0, 0, w, h, c.col, r, 12, f.dark ? 0.95 : 0.82, f.dark ? '#7b2cbf' : undefined);
      if (f.dark) for (let i = 0; i < 6; i++) sparkle(g, 30 + r() * 140, 30 + r() * 140, 2 + r() * 2, alpha('#c77dff', 0.6));
      else for (let i = 0; i < 5; i++) {
        const x = 40 + r() * 120, y = 40 + r() * 120;
        g.beginPath(); g.arc(x, y, 10 + r() * 10, -2.6, -0.6);
        g.strokeStyle = alpha(shade(c.col, 0.35), 0.5); g.lineWidth = 2; g.stroke();
      }
    },
  },
];

// ---------------------------------------------------------------- 3. traps (GM only until revealed)

const TRAPS: ObjDef[] = [
  {
    id: 'trap-net', name: 'Falling net', cat: 'trap', sets: ['dungeon', 'forest', 'camp', 'castle', 'cave'], tags: ['net', 'snare', 'restrain', 'trap', 'ceiling', 'hunter'],
    w: 2, h: 2, layer: 'floor', flat: true, gmOnly: true, c: { rope: '#c9b48a', weight: '#6c6f73' },
    variants: [{ name: 'Rope net', c: {} }, { name: 'Dark cord', c: { rope: '#5a4a38' } }, { name: 'Chain net', c: { rope: '#9aa0a8' } }],
    desc: 'GM only. A weighted net drops from the ceiling and holds everyone under it until they cut or wriggle free.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      trapFrame(g, 3, 3, w - 6, h - 6);
      g.save();
      g.translate(w / 2, h / 2);
      g.rotate(0.12);
      const s = 74, n = 7;
      for (const [col, lw] of [[INK, 3.4], [c.rope, 1.8]] as [string, number][]) {
        g.beginPath();
        for (let i = 0; i <= n; i++) {
          const t = -s + (i / n) * 2 * s;
          g.moveTo(-s, t); for (let k = 1; k <= n; k++) g.lineTo(-s + (k / n) * 2 * s, t + Math.sin(k * 1.7 + i) * 3);
          g.moveTo(t, -s); for (let k = 1; k <= n; k++) g.lineTo(t + Math.sin(k * 1.3 + i) * 3, -s + (k / n) * 2 * s);
        }
        g.strokeStyle = col; g.lineWidth = lw; g.stroke();
      }
      for (const [x, y] of [[-s, -s], [s, -s], [-s, s], [s, s], [0, -s], [0, s], [-s, 0], [s, 0]]) { circle(g, x, y, 5); paint(g, domeFill(g, x, y, 5, c.weight, 0.5), INK, 1); }
      g.restore();
      void r;
    },
  },
  {
    id: 'trap-fire-statue', name: 'Fire-breathing statue', cat: 'trap', sets: ['temple', 'dungeon', 'crypt', 'castle', 'desert'], tags: ['statue', 'fire', 'flame', 'breath', 'trap', 'gargoyle', 'jet'],
    w: 1, h: 2, gmOnly: true, c: { stone: '#9a9286', jet: '#ffb02e' },
    variants: [{ name: 'Grey stone', c: {} }, { name: 'Dark stone', c: { stone: '#4e4b48' } }, { name: 'Bronze', c: { stone: '#a8743c' } }, { name: 'Frost breath', c: { jet: '#8fdcff' } }],
    desc: 'GM only. A statue (top square) that blasts flame over the square in front of it when the trap is set off.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      trapFrame(g, 3, 3, 94, 194);
      g.beginPath(); g.moveTo(50, 70); g.lineTo(8, 190); g.lineTo(92, 190); g.closePath();
      dashed(g, alpha(c.jet, 0.9), 2, [6, 5]);
      for (let i = 0; i < 4; i++) blaze(g, 50 + (r() - 0.5) * 30 * (i / 3), 100 + i * 24, 8 + i * 3, r, '#fff3b0', c.jet, shade(c.jet, -0.35));
      rr(g, 12, 10, 76, 62, 6);
      paint(g, litFill(g, 12, 10, 76, 62, shade(c.stone, -0.15), 0.25), INK, LW);
      ellipse(g, 50, 40, 30, 20);
      paint(g, domeFill(g, 50, 40, 30, c.stone, 0.3), INK, 1.6);
      circle(g, 50, 46, 14);
      paint(g, domeFill(g, 50, 46, 14, shade(c.stone, 0.1), 0.35), INK, 1.4);
      ellipse(g, 50, 60, 9, 5);
      paint(g, '#1a0d08', INK, 1.2);
      glow(g, 50, 62, 12, c.jet, 0.6);
    },
  },
  {
    id: 'trap-rolling-boulder', name: 'Rolling boulder trap', cat: 'trap', sets: ['temple', 'dungeon', 'cave', 'desert', 'crypt'], tags: ['boulder', 'rolling', 'stone ball', 'channel', 'crush', 'trap', 'corridor'],
    w: 4, h: 1, gmOnly: true, c: { stone: '#8a8073', floor: '#5a5650' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { stone: '#c2a878', floor: '#8a7656' } }, { name: 'Dark', c: { stone: '#5a5550', floor: '#3a3632' } }],
    desc: 'GM only. A stone ball released from one end (left) rolls down the channel and flattens anyone in its path.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      trapFrame(g, 3, 3, w - 6, h - 6);
      rr(g, 10, 22, w - 20, 56, 10);
      paint(g, litFill(g, 10, 22, w - 20, 56, shade(c.floor, -0.2), 0.2), INK, 1.6);
      for (const y of [30, 70]) line(g, 14, y, w - 14, y, alpha('#000000', 0.45), 2);
      g.beginPath(); g.moveTo(110, 50); g.lineTo(w - 24, 50);
      dashed(g, alpha('#ffffff', 0.75), 2.2, [8, 6]);
      arrow(g, w - 60, 50, w - 18, 50, alpha('#ffffff', 0.85), 2.4);
      stone(g, 52, 50, 40, c.stone, r);
      for (let i = 0; i < 3; i++) { const a = -1 + i; g.beginPath(); g.arc(52, 50, 30, a, a + 0.6); g.strokeStyle = alpha('#000000', 0.35); g.lineWidth = 1.4; g.stroke(); }
    },
  },
  {
    id: 'trap-pit-hidden', name: 'Hidden pit', cat: 'trap', sets: ['dungeon', 'castle', 'temple', 'crypt', 'cave', 'forest'], tags: ['pit', 'hidden', 'false floor', 'cover', 'locking', 'lid', 'fall', 'trap'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { stone: '#8a8780', metal: '#6c6f73' },
    variants: [{ name: 'Covered', c: {}, f: { cover: 1 } }, { name: 'Open', c: {} }, { name: 'Locking lid', c: {}, f: { lock: 1 } }, { name: 'Leafy cover', c: { stone: '#6a7a3a' }, f: { cover: 1, leaf: 1 } }],
    desc: 'GM only. A deep pit under a false floor. The locking kind slams its lid shut and bolts it after someone falls in.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      trapFrame(g, 3, 3, 94, 94);
      rr(g, 12, 12, 76, 76, 3);
      const gr = g.createRadialGradient(50, 54, 4, 50, 50, 52);
      gr.addColorStop(0, '#000000'); gr.addColorStop(1, '#2c241e');
      paint(g, gr, INK, LW);
      if (f.cover) {
        rr(g, 12, 12, 76, 76, 3);
        g.fillStyle = alpha(c.stone, 0.5); g.fill();
        if (f.leaf) for (let i = 0; i < 18; i++) { const x = 18 + r() * 64, y = 18 + r() * 64; ellipse(g, x, y, 5, 2.4, r() * 3); paint(g, alpha(shade(c.stone, (r() - 0.5) * 0.4), 0.9), alpha(INK, 0.5), 0.6); }
        else { g.beginPath(); for (const v of [31, 50, 69]) { g.moveTo(v, 12); g.lineTo(v, 88); g.moveTo(12, v); g.lineTo(88, v); } g.strokeStyle = alpha(shade(c.stone, -0.5), 0.6); g.lineWidth = 1.2; g.stroke(); }
      }
      if (f.lock) {
        for (const x of [14, 51]) {
          rr(g, x, 14, 35, 72, 2);
          g.fillStyle = alpha(c.stone, 0.35); g.fill();
          g.strokeStyle = alpha(INK, 0.6); g.lineWidth = 1; g.stroke();
        }
        for (const y of [24, 76]) { strap(g, 38, y - 4, 24, 8, c.metal); }
        for (const y of [20, 50, 80]) { rr(g, 8, y - 3, 8, 6, 1); paint(g, c.metal, INK, 0.8); rr(g, 84, y - 3, 8, 6, 1); paint(g, c.metal, INK, 0.8); }
      }
    },
  },
  {
    id: 'trap-pendulum-axe', name: 'Pendulum axes', cat: 'trap', sets: ['dungeon', 'temple', 'castle', 'crypt'], tags: ['axe', 'pendulum', 'blade', 'swing', 'corridor', 'trap', 'gauntlet'],
    w: 3, h: 1, gmOnly: true, c: { metal: '#b9c0c6', wood: '#5c3a20' },
    variants: [{ name: 'Steel', c: {} }, { name: 'Rusted', c: { metal: '#8b4a2b' } }, { name: 'Black iron', c: { metal: '#33373c' } }],
    desc: 'GM only. A row of great axes swinging across the corridor in turn. Slashing damage to anyone caught as they pass.',
    draw: ({ g, w, h, c }) => {
      trapFrame(g, 3, 3, w - 6, h - 6);
      [50, 150, 250].forEach((x, i) => {
        rr(g, x - 4, 6, 8, 88, 2);
        paint(g, '#0f0b09', INK, 1.2);
        g.beginPath(); g.arc(x, 50, 40, Math.PI * 0.32, Math.PI * 0.68);
        dashed(g, alpha('#ffffff', 0.6), 1.8, [4, 4]);
        const dy = i % 2 ? 22 : -22;
        line(g, x, 50, x, 50 + dy, INK, 5);
        line(g, x, 50, x, 50 + dy, c.wood, 3);
        g.beginPath();
        const s = Math.sign(dy);
        g.moveTo(x - 2, 50 + dy - 6 * s); g.quadraticCurveTo(x - 22, 50 + dy + 4 * s, x - 18, 50 + dy + 18 * s);
        g.quadraticCurveTo(x - 8, 50 + dy + 8 * s, x - 2, 50 + dy + 8 * s);
        g.moveTo(x + 2, 50 + dy - 6 * s); g.quadraticCurveTo(x + 22, 50 + dy + 4 * s, x + 18, 50 + dy + 18 * s);
        g.quadraticCurveTo(x + 8, 50 + dy + 8 * s, x + 2, 50 + dy + 8 * s);
        paint(g, litFill(g, x - 20, 40, 40, 40, c.metal, 0.45), INK, 1.4);
        circle(g, x, 50, 4); paint(g, METAL.iron, INK, 1);
      });
    },
  },
  {
    id: 'trap-swinging-log', name: 'Swinging log', cat: 'trap', sets: ['forest', 'camp', 'dungeon', 'cave', 'swamp'], tags: ['log', 'swing', 'ram', 'ropes', 'trap', 'tripwire', 'knock'],
    w: 2, h: 1, gmOnly: true, c: { wood: '#6a4a2a', rope: '#c9b48a' },
    variants: [{ name: 'Plain log', c: {} }, { name: 'Spiked log', c: {}, f: { spikes: 1 } }, { name: 'Pale birch', c: { wood: '#cfc6b4' } }],
    desc: 'GM only. A heavy log on ropes swings down across the path and knocks anyone there flat.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      trapFrame(g, 3, 3, w - 6, h - 6);
      for (const s of [-1, 1]) { g.beginPath(); g.arc(100, 50, 44, s < 0 ? Math.PI * 0.6 : -Math.PI * 0.4, s < 0 ? Math.PI * 1.4 : Math.PI * 0.4); dashed(g, alpha('#ffffff', 0.6), 1.8, [5, 5]); }
      for (const x of [55, 145]) { line(g, x, 8, x, 40, INK, 3.4); line(g, x, 8, x, 40, c.rope, 1.8); }
      if (f.spikes) for (let x = 40; x <= 160; x += 20) for (const s of [-1, 1]) { poly(g, [[x - 3, 50 + s * 10], [x, 50 + s * 22], [x + 3, 50 + s * 10]]); paint(g, '#b9c0c6', INK, 0.8); }
      rr(g, 24, 38, 152, 24, 12);
      paint(g, litFill(g, 24, 38, 152, 24, c.wood, 0.25), INK, LW);
      for (let i = 0; i < 4; i++) line(g, 34 + r() * 20, 44 + i * 4, 150 + r() * 20, 44 + i * 4, alpha(shade(c.wood, -0.45), 0.5), 0.9);
      for (const x of [24, 176]) { ellipse(g, x, 50, 5, 12); paint(g, shade(c.wood, 0.25), INK, 1.2); }
      for (const x of [55, 145]) { rr(g, x - 3, 37, 6, 26, 1.5); paint(g, c.rope, INK, 0.9); }
    },
  },
  {
    id: 'trap-crushing-walls', name: 'Closing walls trap', cat: 'trap', sets: ['dungeon', 'temple', 'castle', 'crypt'], tags: ['crushing', 'walls', 'closing', 'squeeze', 'room', 'trap', 'spikes'],
    w: 3, h: 3, layer: 'floor', flat: true, gmOnly: true, c: { stone: '#8a8780', metal: '#b9c0c6' },
    variants: [{ name: 'Smooth walls', c: {} }, { name: 'Spiked walls', c: {}, f: { spikes: 1 } }],
    desc: 'GM only. Marks a room whose side walls grind inward each round, crushing anyone still inside when they meet.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      trapFrame(g, 3, 3, w - 6, h - 6);
      for (const s of [0, 1]) {
        const x = s ? w - 34 : 10;
        rr(g, x, 12, 24, h - 24, 3);
        g.save(); rr(g, x, 12, 24, h - 24, 3); g.clip(); blocks(g, x, 12, 24, h - 24, c.stone, r, 24, 18); g.restore();
        rr(g, x, 12, 24, h - 24, 3); g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
        if (f.spikes) for (let y = 24; y < h - 20; y += 18) { const bx = s ? x : x + 24, dx = s ? -10 : 10; poly(g, [[bx, y - 4], [bx + dx, y], [bx, y + 4]]); paint(g, c.metal, INK, 0.8); }
        for (const y of [90, 150, 210]) arrow(g, s ? w - 46 : 46, y, s ? w - 96 : 96, y, alpha('#ffffff', 0.85), 3);
      }
    },
  },
  {
    id: 'trap-arrow-slits', name: 'Arrow-slit corridor', cat: 'trap', sets: ['dungeon', 'castle', 'temple', 'crypt'], tags: ['arrows', 'slits', 'crossfire', 'corridor', 'darts', 'trap', 'wall'],
    w: 3, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { shaft: '#5a3d24', fletch: '#c0392b' },
    variants: [{ name: 'Arrows', c: {} }, { name: 'Poisoned', c: { fletch: '#5fe39a' } }, { name: 'Bolts', c: { shaft: '#3a3632', fletch: '#9aa0a8' } }],
    desc: 'GM only. Slits in both walls (top and bottom edges) loose arrows across the corridor when the trigger is stepped on.',
    draw: ({ g, w, h, c }) => {
      trapFrame(g, 3, 3, w - 6, h - 6);
      for (let x = 30; x < w; x += 60) {
        for (const [y, s] of [[7, 1], [93, -1]] as [number, number][]) {
          rr(g, x - 9, y - 3, 18, 6, 2); paint(g, '#0e0a08', '#6c6f73', 1.6);
          g.beginPath(); g.moveTo(x + (s > 0 ? 0 : 30), y + s * 4); g.lineTo(x + (s > 0 ? 30 : 0), 50 + s * 38);
          dashed(g, alpha('#ffffff', 0.5), 1.4, [4, 5]);
        }
      }
      for (const [x, y, a] of [[80, 46, 0.35], [190, 56, -0.4]]) {
        g.save(); g.translate(x, y); g.rotate(a);
        line(g, -18, 0, 14, 0, INK, 3.4); line(g, -18, 0, 14, 0, c.shaft, 1.8);
        poly(g, [[12, -3], [20, 0], [12, 3]]); paint(g, '#6c6f73', INK, 0.8);
        poly(g, [[-14, 0], [-21, -5], [-18, 0], [-21, 5]]); paint(g, c.fletch, INK, 0.8);
        g.restore();
      }
    },
  },
  {
    id: 'trap-vent-grate', name: 'Trap vent grate', cat: 'trap', sets: ['dungeon', 'sewer', 'temple', 'crypt', 'castle'], tags: ['vent', 'grate', 'poison gas', 'flooding', 'water', 'room', 'trap'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { metal: '#6c6f73', fx: '#8fe04a' },
    variants: [{ name: 'Poison gas', c: {} }, { name: 'Flooding water', c: { fx: '#4ca8d8' }, f: { water: 1 } }, { name: 'Sleeping gas', c: { fx: '#c9a0ff' } }],
    desc: 'GM only. Once the room is sealed this grate pours out poison gas or floods the chamber with water, rising each round.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      trapFrame(g, 3, 3, 94, 94);
      rr(g, 22, 22, 56, 56, 4);
      paint(g, '#0c0a09', INK, LW);
      for (let x = 30; x < 76; x += 9) { rr(g, x, 24, 4.5, 52, 1); paint(g, litFill(g, x, 24, 4.5, 52, c.metal, 0.4), INK, 0.8); }
      rr(g, 22, 22, 56, 56, 4); g.strokeStyle = c.metal; g.lineWidth = 3; g.stroke();
      if (f.water) for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(50, 50, 32 + i * 7, -2.6 + i * 0.3, -1.2 + i * 0.3); g.strokeStyle = alpha(c.fx, 0.85 - i * 0.15); g.lineWidth = 2.2; g.stroke(); }
      else puffs(g, 14, 10, 72, 60, c.fx, r, 5, 0.55);
    },
  },
  {
    id: 'trap-cage-drop', name: 'Dropping cage', cat: 'trap', sets: ['dungeon', 'castle', 'temple', 'cave'], tags: ['cage', 'drop', 'bars', 'capture', 'restrain', 'ceiling', 'trap'],
    w: 1, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { metal: '#6c6f73', stone: '#8a8780' },
    variants: [{ name: 'Iron', c: {} }, { name: 'Black iron', c: { metal: '#33373c' } }, { name: 'Rusted', c: { metal: '#8b4a2b' } }],
    desc: 'GM only. A barred cage drops from the ceiling over this square, trapping whoever stepped on the plate.',
    draw: ({ g, c }) => {
      trapFrame(g, 3, 3, 94, 94);
      rr(g, 36, 36, 28, 28, 2); paint(g, litFill(g, 36, 36, 28, 28, c.stone, 0.2), INK, 1.4);
      rr(g, 12, 12, 76, 76, 2);
      dashed(g, alpha(c.metal, 0.95), 3, [5, 3]);
      for (let i = 0; i < 6; i++) { const t = 12 + (i + 0.5) * (76 / 6); for (const [x, y] of [[t, 12], [t, 88], [12, t], [88, t]]) { circle(g, x, y, 2.4); paint(g, c.metal, INK, 0.7); } }
      arrow(g, 50, 22, 50, 32, alpha('#ffffff', 0.8), 2); arrow(g, 50, 78, 50, 68, alpha('#ffffff', 0.8), 2);
    },
  },
  {
    id: 'trap-floor-scythe', name: 'Scything floor blade', cat: 'trap', sets: ['dungeon', 'temple', 'castle', 'crypt'], tags: ['scythe', 'blade', 'floor', 'slot', 'legs', 'sweep', 'trap'],
    w: 2, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { metal: '#b9c0c6' },
    variants: [{ name: 'Steel', c: {} }, { name: 'Rusted', c: { metal: '#8b4a2b' } }, { name: 'Black iron', c: { metal: '#33373c' } }],
    desc: 'GM only. A curved blade sweeps out of a floor slot at ankle height. Slashing damage and knocked prone.',
    draw: ({ g, w, h, c }) => {
      trapFrame(g, 3, 3, w - 6, h - 6);
      rr(g, 10, 47, w - 20, 6, 2); paint(g, '#0c0a09', INK, 1.2);
      g.beginPath(); g.arc(30, 50, 140, -0.32, 0.32); dashed(g, alpha('#ffffff', 0.55), 1.8, [5, 5]);
      g.beginPath();
      g.moveTo(26, 50); g.quadraticCurveTo(120, 18, 168, 30); g.quadraticCurveTo(120, 34, 40, 52); g.closePath();
      paint(g, litFill(g, 26, 18, 142, 34, c.metal, 0.45), INK, 1.6);
      circle(g, 28, 50, 6); paint(g, METAL.iron, INK, 1.2);
    },
  },
  {
    id: 'trap-ceiling-collapse', name: 'Collapsing ceiling', cat: 'trap', sets: ['dungeon', 'mine', 'cave', 'temple', 'crypt', 'castle'], tags: ['ceiling', 'collapse', 'cave-in', 'rocks', 'rubble', 'falling', 'trap'],
    w: 3, h: 3, layer: 'floor', flat: true, gmOnly: true, c: { stone: '#8a8073' },
    variants: [{ name: 'Rock', c: {} }, { name: 'Dressed stone', c: { stone: '#a8a196' } }, { name: 'Timber and earth', c: { stone: '#7a5e40' } }],
    desc: 'GM only. Marks where the roof caves in. Bludgeoning damage to everyone under it, and the area becomes rubble.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      trapFrame(g, 3, 3, w - 6, h - 6);
      for (let i = 0; i < 6; i++) {
        let x = w / 2, y = h / 2; const a = (i / 6) * TAU + r() * 0.5;
        g.beginPath(); g.moveTo(x, y);
        for (let s = 0; s < 5; s++) { x += Math.cos(a + (r() - 0.5)) * 24; y += Math.sin(a + (r() - 0.5)) * 24; g.lineTo(x, y); }
        g.strokeStyle = alpha('#000000', 0.55); g.lineWidth = 2; g.stroke();
      }
      for (let i = 0; i < 14; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 110, x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d;
        blob(g, lumpy(x, y, 7 + r() * 9, 0.4, 7, r));
        g.fillStyle = alpha(c.stone, 0.35); g.fill();
        dashed(g, alpha(shade(c.stone, 0.4), 0.8), 1.4, [3, 3]);
      }
      for (const [x, y] of [[90, 120], [200, 170], [150, 80]]) arrow(g, x, y - 26, x, y, alpha('#ffffff', 0.8), 2.4);
    },
  },
  {
    id: 'trap-rune-threshold', name: 'Warded threshold', cat: 'trap', sets: ['wizard', 'temple', 'crypt', 'dungeon', 'castle'], tags: ['ward', 'runes', 'threshold', 'doorway', 'magic', 'glyph', 'trap', 'lightning', 'frost'],
    w: 2, h: 1, layer: 'floor', flat: true, gmOnly: true, c: { rune: '#ff8a5a' },
    variants: [{ name: 'Fire', c: {} }, { name: 'Frost', c: { rune: '#8fdcff' } }, { name: 'Lightning', c: { rune: '#fff07a' } }, { name: 'Necrotic', c: { rune: '#9bff8a' } }],
    desc: 'GM only. A line of runes across a doorway. It bursts with fire, cold, lightning or rot on anyone who crosses without the password.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      trapFrame(g, 3, 3, w - 6, h - 6);
      for (const y of [32, 68]) line(g, 14, y, w - 14, y, alpha(c.rune, 0.7), 1.6);
      for (let i = 0; i < 5; i++) {
        const x = 30 + i * 35;
        glow(g, x, 50, 24, c.rune, 0.55);
        const rr0 = rng(seed + i * 31);
        rune(g, x, 50, 20, rr0, alpha(shade(c.rune, -0.6), 0.8), 5);
        rune(g, x, 50, 20, rng(seed + i * 31), mix(c.rune, '#ffffff', 0.35), 2.6);
      }
    },
  },
];

// ---------------------------------------------------------------- 4. doors and mechanisms

const MECH: ObjDef[] = [
  {
    id: 'lever', name: 'Lever', cat: 'structure', sets: ['dungeon', 'castle', 'mine', 'temple', 'crypt', 'sewer'], tags: ['lever', 'switch', 'mechanism', 'handle', 'puzzle', 'wall', 'floor'],
    w: 1, h: 1, c: { metal: '#6c6f73', grip: '#5c3a20' },
    variants: [{ name: 'Wall lever, up', c: {} }, { name: 'Wall lever, down', c: {}, f: { down: 1 } }, { name: 'Brass wall lever', c: { metal: '#c9a24a', grip: '#7a2f2f' } }, { name: 'Floor lever', c: {}, f: { floor: 1 } }],
    desc: 'A lever that works a door, gate, bridge or trap. Wall levers sit against the top edge; the floor lever stands free.',
    draw: ({ g, c, f }) => {
      if (f.floor) {
        rr(g, 26, 34, 48, 32, 4); paint(g, litFill(g, 26, 34, 48, 32, c.metal, 0.3), INK, LW);
        rr(g, 34, 46, 32, 8, 3); paint(g, '#0c0a09', INK, 1);
        for (const [x, y] of [[30, 38], [70, 38], [30, 62], [70, 62]]) rivet(g, x, y, 2, c.metal);
        line(g, 44, 50, 66, 28, INK, 6.4); line(g, 44, 50, 66, 28, c.metal, 4);
        circle(g, 68, 26, 7); paint(g, domeFill(g, 68, 26, 7, c.grip, 0.45), INK, 1.2);
        return;
      }
      rr(g, 28, 2, 44, 20, 3); paint(g, litFill(g, 28, 2, 44, 20, c.metal, 0.3), INK, LW);
      rr(g, 46, 6, 8, 14, 2); paint(g, '#0c0a09', INK, 1);
      const L = f.down ? 54 : 30;
      line(g, 50, 14, 50, 14 + L, INK, 6.4); line(g, 50, 14, 50, 14 + L, c.metal, 4);
      rr(g, 43, 6 + L, 14, 16, 5); paint(g, litFill(g, 43, 6 + L, 14, 16, c.grip, 0.35), INK, 1.3);
      for (const x of [32, 68]) rivet(g, x, 12, 2.2, c.metal);
      g.beginPath(); g.arc(50, 14, 64, Math.PI * 0.42, Math.PI * 0.58);
      dashed(g, alpha('#000000', 0.35), 1.2, [3, 3]);
    },
  },
  {
    id: 'wall-button', name: 'Wall button', cat: 'structure', sets: ['dungeon', 'temple', 'crypt', 'castle', 'wizard'], tags: ['button', 'switch', 'pressure', 'press', 'secret', 'puzzle', 'wall', 'mechanism'],
    w: 1, h: 1, c: { stone: '#8a8780', btn: '#a8a196' },
    variants: [{ name: 'Stone', c: {} }, { name: 'Brass', c: { btn: '#c9a24a' } }, { name: 'Glowing rune', c: { btn: '#4cb8ff' }, f: { rune: 1 } }, { name: 'Skull boss', c: { btn: BONE }, f: { skull: 1 } }],
    desc: 'A button set in the wall (top edge). Pressing it works a hidden door, a trap or a puzzle.',
    draw: ({ g, c, f, seed }) => {
      rr(g, 24, 2, 52, 22, 3); paint(g, litFill(g, 24, 2, 52, 22, c.stone, 0.25), INK, LW);
      if (f.rune) glow(g, 50, 16, 20, c.btn, 0.6);
      circle(g, 50, 16, 10); paint(g, shade(c.stone, -0.3), INK, 1.4);
      circle(g, 50, 16, 7.5); paint(g, domeFill(g, 50, 16, 7.5, c.btn, 0.5), INK, 1.2);
      if (f.rune) rune(g, 50, 16, 7, rng(seed), '#e8f6ff', 1.4);
      if (f.skull) { circle(g, 47, 15, 1.6); circle(g, 53, 15, 1.6); g.fillStyle = INK; g.beginPath(); g.arc(47, 15, 1.6, 0, TAU); g.arc(53, 15, 1.6, 0, TAU); g.fill(); }
    },
  },
  {
    id: 'winch', name: 'Winch', cat: 'structure', sets: ['castle', 'dungeon', 'mine', 'ship', 'sewer'], tags: ['winch', 'pulley', 'chain', 'crank', 'windlass', 'portcullis', 'drawbridge', 'mechanism'],
    w: 1, h: 1, blocksMovement: true, c: { wood: '#7a5432', metal: '#6c6f73', rope: '#c9b48a' },
    variants: [{ name: 'Rope pulley', c: {} }, { name: 'Chain winch', c: { wood: '#5c3a20' }, f: { chain: 1 } }, { name: 'Iron and chain', c: { wood: '#55585e' }, f: { chain: 1 } }],
    desc: 'A crank drum that raises a gate, bridge, cage or bucket. Takes an action (and some strength) to turn.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (const x of [16, 76]) board(g, x, 18, 10, 64, c.wood, r, 'v');
      rr(g, 24, 32, 54, 36, 8);
      paint(g, litFill(g, 24, 32, 54, 36, shade(c.wood, 0.1), 0.25), INK, LW);
      g.save(); rr(g, 24, 32, 54, 36, 8); g.clip();
      for (let x = 26; x < 78; x += f.chain ? 6 : 4) {
        if (f.chain) { ellipse(g, x + 3, 50, 3.2, 14); g.strokeStyle = INK; g.lineWidth = 2.6; g.stroke(); g.strokeStyle = c.metal; g.lineWidth = 1.4; g.stroke(); }
        else line(g, x, 33, x + 2, 67, alpha(shade(c.rope, -0.3), 0.9), 2.2);
      }
      if (!f.chain) { g.fillStyle = alpha(c.rope, 0.5); g.fillRect(24, 32, 54, 36); }
      g.restore();
      rr(g, 24, 32, 54, 36, 8); g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
      line(g, 86, 50, 94, 50, INK, 5); line(g, 86, 50, 94, 50, c.metal, 3);
      line(g, 94, 50, 94, 78, INK, 5); line(g, 94, 50, 94, 78, c.metal, 3);
      circle(g, 94, 80, 4.5); paint(g, domeFill(g, 94, 80, 4.5, '#5c3a20', 0.4), INK, 1);
      if (f.chain) for (let y = 4; y < 32; y += 6) { ellipse(g, 50, y + 3, 2.6, 3.4); g.strokeStyle = c.metal; g.lineWidth = 1.6; g.stroke(); }
      else line(g, 50, 0, 50, 32, c.rope, 2.4);
    },
  },
  {
    id: 'statue-rotating', name: 'Turning statue', cat: 'structure', sets: ['temple', 'dungeon', 'crypt', 'castle', 'wizard'], tags: ['statue', 'rotating', 'turn', 'puzzle', 'facing', 'dial', 'mechanism'],
    w: 1, h: 1, blocksMovement: true, c: { stone: '#a8a196', mark: '#e2b84a' },
    variants: [{ name: 'Stone', c: {} }, { name: 'Bronze', c: { stone: '#a8743c', mark: '#f2e6c8' } }, { name: 'Marble', c: { stone: '#dcd8d0' } }, { name: 'Dark stone', c: { stone: '#5a5550' } }],
    desc: 'A statue on a turntable. Turning it to face the right way (marks on the ring) solves a puzzle or opens a door.',
    draw: ({ g, c }) => {
      circle(g, 50, 50, 44); paint(g, domeFill(g, 50, 50, 44, shade(c.stone, -0.2), 0.2), INK, LW);
      circle(g, 50, 50, 36); paint(g, shade(c.stone, -0.32), alpha(INK, 0.7), 1.2);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU - Math.PI / 2; line(g, 50 + Math.cos(a) * 37, 50 + Math.sin(a) * 37, 50 + Math.cos(a) * (i % 2 ? 41 : 43), 50 + Math.sin(a) * (i % 2 ? 41 : 43), c.mark, i % 2 ? 1.4 : 2.6); }
      ellipse(g, 50, 52, 24, 15); paint(g, domeFill(g, 50, 52, 24, c.stone, 0.3), INK, 1.6);
      for (const s of [-1, 1]) { ellipse(g, 50 + s * 20, 58, 6, 9, s * 0.4); paint(g, domeFill(g, 50 + s * 20, 58, 9, c.stone, 0.3), INK, 1.2); }
      circle(g, 50, 46, 11); paint(g, domeFill(g, 50, 46, 11, shade(c.stone, 0.1), 0.4), INK, 1.4);
      poly(g, [[50, 70], [44, 62], [56, 62]]); paint(g, c.mark, INK, 1);
    },
  },
  {
    id: 'orb-pedestal', name: 'Orb on pedestal', cat: 'arcane', sets: ['wizard', 'temple', 'dungeon', 'crypt', 'castle'], tags: ['orb', 'pedestal', 'crystal ball', 'puzzle', 'key', 'magic', 'glow', 'plinth'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 0, dim: 10, color: '#8fd0ff' }, c: { stone: '#a8a196', orb: '#4cb8ff' },
    variants: [{ name: 'Blue orb', c: {} }, { name: 'Red orb', c: { orb: '#ff5a4a' } }, { name: 'Green orb', c: { orb: '#5ad87a' } }, { name: 'Gold orb', c: { orb: '#ffd24a' } }, { name: 'Empty socket', c: {}, f: { empty: 1 } }],
    desc: 'A glowing orb on a stone plinth: a puzzle piece, a key, or a source of power. The empty one waits for its orb.',
    draw: ({ g, c, f }) => {
      plinth(g, 50, 50, 70, c.stone);
      if (f.empty) { circle(g, 50, 50, 12); paint(g, shade(c.stone, -0.45), INK, 1.4); return; }
      glow(g, 50, 50, 42, c.orb, 0.6);
      circle(g, 50, 50, 17); paint(g, domeFill(g, 50, 50, 17, c.orb, 0.55), INK, 1.6);
      circle(g, 50, 50, 9); g.fillStyle = alpha('#ffffff', 0.35); g.fill();
      circle(g, 44, 44, 4); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fill();
    },
  },
  {
    id: 'rune-tiles', name: 'Rune tile puzzle', cat: 'arcane', sets: ['temple', 'wizard', 'dungeon', 'crypt'], tags: ['tiles', 'runes', 'puzzle', 'floor', 'pattern', 'step', 'sequence'],
    w: 3, h: 3, layer: 'floor', flat: true, c: { stone: '#8a8780', rune: '#4cb8ff' },
    variants: [{ name: 'Blue', c: {} }, { name: 'Gold', c: { rune: '#ffd24a' } }, { name: 'Red', c: { rune: '#ff5a4a' } }, { name: 'Sandstone, green', c: { stone: '#b8a27c', rune: '#5ad87a' } }],
    desc: 'Nine carved floor tiles. Step on the right ones in the right order; a wrong step sets off whatever the GM has in store.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const lit = new Set([Math.floor(r() * 9), Math.floor(r() * 9), Math.floor(r() * 9)]);
      for (let i = 0; i < 9; i++) {
        const x = 6 + (i % 3) * 96, y = 6 + Math.floor(i / 3) * 96;
        rr(g, x, y, 92, 92, 4);
        paint(g, litFill(g, x, y, 92, 92, shade(c.stone, (r() - 0.5) * 0.12), 0.2), INK, LW);
        bevel(g, x, y, 92, 92, 4, 0.25);
        if (lit.has(i)) glow(g, x + 46, y + 46, 46, c.rune, 0.5);
        rune(g, x + 46, y + 46, 40, r, lit.has(i) ? mix(c.rune, '#ffffff', 0.4) : alpha('#000000', 0.45), lit.has(i) ? 4 : 3.4);
      }
    },
  },
  {
    id: 'lock-plate', name: 'Keyhole lock plate', cat: 'structure', sets: ['dungeon', 'castle', 'crypt', 'temple', 'wizard'], tags: ['lock', 'keyhole', 'key', 'plate', 'door', 'vault', 'puzzle', 'wall'],
    w: 1, h: 1, c: { metal: '#c9a24a' },
    variants: [{ name: 'Brass', c: {} }, { name: 'Iron', c: { metal: '#6c6f73' } }, { name: 'Gold, ornate', c: { metal: '#e2b84a' }, f: { gems: 1 } }, { name: 'Rune lock', c: { metal: '#5a5f78' }, f: { rune: 1 } }],
    desc: 'A big lock plate on the wall (top edge). It wants a particular key, or a clever pair of hands.',
    draw: ({ g, c, f, seed }) => {
      poly(g, [[26, 2], [74, 2], [74, 18], [62, 30], [38, 30], [26, 18]]);
      paint(g, litFill(g, 26, 2, 48, 28, c.metal, 0.4), INK, LW);
      for (const [x, y] of [[31, 8], [69, 8], [42, 25], [58, 25]]) rivet(g, x, y, 1.8, c.metal);
      if (f.rune) { glow(g, 50, 14, 18, '#8fdcff', 0.6); rune(g, 50, 14, 12, rng(seed), '#bfe6ff', 2); return; }
      circle(g, 50, 11, 4.5); paint(g, '#0c0a09', null);
      poly(g, [[47, 12], [53, 12], [55, 22], [45, 22]]); paint(g, '#0c0a09', null);
      if (f.gems) for (const x of [36, 64]) gem(g, x, 16, 3.4, '#c0392b');
    },
  },
  {
    id: 'bookcase-secret', name: 'Hinged bookcase', cat: 'structure', sets: ['castle', 'wizard', 'town', 'tavern', 'dungeon'], tags: ['bookcase', 'secret door', 'hidden', 'passage', 'swing', 'library', 'bookshelf'],
    w: 2, h: 1, blocksMovement: true, c: { wood: '#5c3a20' },
    variants: [{ name: 'Shut', c: {} }, { name: 'Swung open', c: {}, f: { open: 1 } }, { name: 'Shut, oak', c: { wood: '#9a6a3a' } }, { name: 'Swung open, oak', c: { wood: '#9a6a3a' }, f: { open: 1 } }],
    desc: 'A bookcase against the top wall that swings out on a hidden hinge. The open variant shows the dark passage behind it.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const BK = ['#7a2a22', '#2f4f6f', '#3e5e34', '#6b4a2b', '#5a3a6a', '#a07a2a', '#2b2b30'];
      const caseAt = () => {
        rr(g, 0, 0, 200, 38, 3); paint(g, litFill(g, 0, 0, 200, 38, c.wood, 0.2), INK, LW);
        let x = 8;
        while (x < 186) { const bw = 5 + r() * 6; rr(g, x, 6, bw, 26, 1); paint(g, litFill(g, x, 6, bw, 26, BK[Math.floor(r() * BK.length)], 0.25), INK, 0.8); x += bw + 0.5; }
        rr(g, 0, 0, 200, 38, 3); g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
      };
      if (f.open) {
        rr(g, 20, 0, 160, 12, 2); paint(g, '#060504', INK, 1.4);
        g.beginPath(); g.arc(198, 2, 196, Math.PI - 0.42, Math.PI); dashed(g, alpha('#000000', 0.35), 1.2, [4, 4]);
        g.save(); g.translate(198, 2); g.rotate(-0.42); g.translate(-200, 0); caseAt(); g.restore();
        return;
      }
      caseAt();
      circle(g, 192, 32, 2.2); paint(g, '#c9a24a', INK, 0.6);
    },
  },
  {
    id: 'door-broken', name: 'Broken door', cat: 'structure', sets: ['dungeon', 'castle', 'town', 'tavern', 'crypt', 'farm'], tags: ['door', 'broken', 'smashed', 'splinters', 'doorway', 'ruin'],
    w: 1, h: 1, difficult: true, c: { wood: '#7a5432', metal: '#55585e' },
    variants: [{ name: 'Oak', c: {} }, { name: 'Dark wood', c: { wood: '#4a3020' } }, { name: 'Pale pine', c: { wood: '#c4955a' } }],
    desc: 'A door smashed off its hinges, one plank left hanging. The splintered wreck is difficult terrain.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 2, 44, 10, 12, 2); paint(g, c.metal, INK, 1.2);
      g.save(); g.translate(6, 50); g.rotate(0.35);
      board(g, 0, -6, 34, 12, c.wood, r, 'h', 1.5);
      g.restore();
      for (let i = 0; i < 5; i++) plank(g, 30 + r() * 50, 30 + r() * 44, 22 + r() * 22, 8 + r() * 4, (r() - 0.5) * 1.6, shade(c.wood, (r() - 0.5) * 0.2), r);
      for (let i = 0; i < 12; i++) { const x = 20 + r() * 64, y = 26 + r() * 50, a = r() * TAU; line(g, x, y, x + Math.cos(a) * 5, y + Math.sin(a) * 5, shade(c.wood, 0.2), 1.6); }
      strap(g, 52, 62, 26, 6, c.metal);
    },
  },
  {
    id: 'door-barricaded', name: 'Barricaded door', cat: 'structure', sets: ['dungeon', 'castle', 'town', 'tavern', 'farm', 'camp'], tags: ['door', 'barricade', 'boarded', 'planks', 'blocked', 'nailed', 'doorway'],
    w: 1, h: 1, blocksMovement: true, c: { wood: '#7a5432', plank: '#a07a4a' },
    variants: [{ name: 'Boarded up', c: {} }, { name: 'Boards and crates', c: {}, f: { crates: 1 } }, { name: 'Dark wood', c: { wood: '#4a3020', plank: '#6b4428' } }],
    desc: 'A door nailed shut with planks (and maybe furniture piled behind). Takes time and noise to break through.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      board(g, 2, 42, 96, 16, c.wood, r, 'h', 2);
      for (const [y, a] of [[50, 0.32], [50, -0.28], [50, 0.05]] as [number, number][]) plank(g, 50, y, 104, 9, a, c.plank, r);
      for (const [x, y] of [[12, 44], [88, 56], [14, 56], [86, 43], [50, 50]]) { circle(g, x, y, 1.6); paint(g, '#33373c', null); }
      if (f.crates) {
        for (const [x, y, s] of [[18, 66, 26], [50, 70, 22], [76, 66, 24]]) {
          rr(g, x - s / 2, y, s, s, 2); paint(g, litFill(g, x - s / 2, y, s, s, '#9a7048', 0.2), INK, 1.4);
          line(g, x - s / 2 + 2, y + 2, x + s / 2 - 2, y + s - 2, alpha('#3a2412', 0.7), 2);
        }
      }
    },
  },
  {
    id: 'portal-arch', name: 'Magic portal arch', cat: 'arcane', sets: ['wizard', 'temple', 'dungeon', 'crypt', 'forest', 'castle'], tags: ['portal', 'gate', 'arch', 'teleport', 'doorway', 'magic', 'glow', 'plane'],
    w: 2, h: 1, light: { bright: 10, dim: 15, color: '#b07bff' }, c: { stone: '#8a8780', glow: '#b07bff' },
    variants: [{ name: 'Violet', c: {} }, { name: 'Blue', c: { glow: '#4cb8ff' } }, { name: 'Green', c: { glow: '#5ad87a' } }, { name: 'Fire', c: { glow: '#ff8a3a' } }, { name: 'Dormant', c: { glow: '#5a5f68' }, f: { off: 1 } }],
    desc: 'A stone arch holding a shimmering gateway. Step through to arrive at its paired portal (the GM decides where).',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      if (!f.off) glow(g, w / 2, h / 2, 90, c.glow, 0.5);
      ellipse(g, w / 2, h / 2, 74, 13);
      const gr = g.createLinearGradient(26, 0, 174, 0);
      gr.addColorStop(0, shade(c.glow, -0.4)); gr.addColorStop(0.5, f.off ? c.glow : mix(c.glow, '#ffffff', 0.6)); gr.addColorStop(1, shade(c.glow, -0.4));
      paint(g, gr, alpha(INK, 0.7), 1.2);
      if (!f.off) for (let i = 0; i < 6; i++) sparkle(g, 40 + r() * 120, 42 + r() * 16, 2 + r() * 2.5, alpha('#ffffff', 0.9));
      rr(g, 30, 41, 140, 18, 9);
      g.strokeStyle = alpha(shade(c.stone, -0.3), 0.9); g.lineWidth = 3; g.stroke();
      for (const x of [16, 184]) {
        rr(g, x - 15, 30, 30, 40, 4); paint(g, litFill(g, x - 15, 30, 30, 40, c.stone, 0.3), INK, LW);
        g.save(); rr(g, x - 15, 30, 30, 40, 4); g.clip(); blocks(g, x - 15, 30, 30, 40, c.stone, r, 15, 10); g.restore();
        rr(g, x - 15, 30, 30, 40, 4); g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
        if (!f.off) { glow(g, x, 50, 10, c.glow, 0.8); rune(g, x, 50, 10, r, mix(c.glow, '#ffffff', 0.4), 1.8); }
      }
    },
  },
];

// ---------------------------------------------------------------- 5. treasure and loot

const LOOT: ObjDef[] = [
  {
    id: 'mimic-chest', name: 'Mimic chest', cat: 'treasure', sets: ['dungeon', 'crypt', 'castle', 'cave', 'tavern'], tags: ['mimic', 'chest', 'monster', 'teeth', 'ambush', 'trap', 'loot'],
    w: 1, h: 1, blocksMovement: true, c: { wood: '#6b4428', metal: '#c9a24a', maw: '#8a1f2a' },
    variants: [{ name: 'Closed (looks like a chest)', c: {} }, { name: 'Revealed', c: {}, f: { open: 1 } }, { name: 'Iron-bound, closed', c: { wood: '#9a6a3a', metal: '#6c6f73' } }, { name: 'Iron-bound, revealed', c: { wood: '#9a6a3a', metal: '#6c6f73' }, f: { open: 1 } }],
    desc: 'A chest that is really a hungry shapeshifter. It sticks to whoever touches it, then bites.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const x = 12, y = 24, w = 76, h = 56;
      if (f.open) {
        rr(g, x, y - 20, w, 22, 5); paint(g, litFill(g, x, y - 20, w, 22, shade(c.wood, -0.15)), INK, LW);
        rr(g, x, y, w, h, 6); paint(g, litFill(g, x, y, w, h, c.wood), INK, LW * 1.1);
        rr(g, x + 6, y + 4, w - 12, h - 12, 8);
        const gr = g.createRadialGradient(50, y + 26, 4, 50, y + 26, 40);
        gr.addColorStop(0, '#1a0306'); gr.addColorStop(1, c.maw);
        paint(g, gr, INK, 1.4);
        g.beginPath(); g.moveTo(50, y + h - 10); g.bezierCurveTo(30, y + 30, 66, y + 22, 58, y + 8); g.lineWidth = 9; g.strokeStyle = INK; g.lineCap = 'round'; g.stroke(); g.lineWidth = 6.5; g.strokeStyle = '#d0506a'; g.stroke();
        for (let i = 0; i < 8; i++) {
          const tx = x + 9 + i * 8.4;
          poly(g, [[tx, y + 3], [tx + 4, y + 13 + r() * 4], [tx + 8, y + 3]]); paint(g, BONE, INK, 0.9);
          poly(g, [[tx, y - 1], [tx + 4, y - 10 - r() * 4], [tx + 8, y - 1]]); paint(g, BONE, INK, 0.9);
        }
        for (const [ex, ey] of [[26, y - 12], [74, y - 12]]) { circle(g, ex, ey, 4.5); paint(g, '#ffe066', INK, 1); ellipse(g, ex, ey, 1.2, 3.4); g.fillStyle = INK; g.fill(); }
        return;
      }
      rr(g, x, y, w, h, 6); paint(g, litFill(g, x, y, w, h, c.wood), INK, LW * 1.1);
      g.save(); rr(g, x, y, w, h, 6); g.clip();
      for (let i = 0; i < 6; i++) line(g, x, y + 6 + i * 9 + r() * 2, x + w, y + 6 + i * 9 + r() * 2, alpha(shade(c.wood, -0.45), 0.4), 0.9);
      const sh = g.createLinearGradient(0, y, 0, y + h);
      sh.addColorStop(0, 'rgba(255,255,255,0.18)'); sh.addColorStop(0.45, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.25)');
      g.fillStyle = sh; g.fillRect(x, y, w, h);
      g.restore();
      strap(g, x + 12, y, 8, h, c.metal); strap(g, x + w - 20, y, 8, h, c.metal);
      rr(g, 43, y + h - 16, 14, 16, 2); paint(g, litFill(g, 43, y + h - 16, 14, 16, c.metal, 0.35), INK, 1.2);
      circle(g, 50, y + h - 9, 2); g.fillStyle = INK; g.fill();
      for (const tx of [30, 64]) { poly(g, [[tx, y + h], [tx + 2.5, y + h + 5], [tx + 5, y + h]]); paint(g, BONE, INK, 0.7); }
    },
  },
  {
    id: 'dragon-hoard', name: 'Dragon hoard', cat: 'treasure', sets: ['cave', 'dungeon', 'castle', 'mine', 'temple'], tags: ['hoard', 'gold', 'treasure', 'dragon', 'coins', 'gems', 'pile', 'lair', 'loot'],
    w: 3, h: 3, difficult: true, c: { gold: '#e2b84a', accent: '#c0392b' },
    variants: [{ name: 'Gold', c: {} }, { name: 'Silver hoard', c: { gold: '#c9ced3', accent: '#2f7fd6' } }, { name: 'Cursed', c: { gold: '#b8a83a', accent: '#5ad87a' } }, { name: 'Copper and bronze', c: { gold: '#c27c4b', accent: '#9b5cff' } }],
    desc: 'A great mound of coins, gems and treasures. Difficult terrain to wade through, and whatever sleeps on it wakes easily.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const pts = lumpy(w / 2, h / 2, 134, 0.22, 16, r);
      blob(g, pts);
      paint(g, domeFill(g, w / 2, h / 2, 140, shade(c.gold, -0.1), 0.35), INK, LW * 1.2);
      blob(g, lumpy(w / 2 - 10, h / 2 - 10, 80, 0.3, 12, r));
      paint(g, domeFill(g, w / 2 - 10, h / 2 - 10, 80, c.gold, 0.45), alpha(INK, 0.4), 1);
      g.save(); blob(g, pts); g.clip();
      coins(g, w / 2, h / 2, 128, 260, r, c.gold);
      g.restore();
      for (let i = 0; i < 14; i++) { const a = r() * TAU, d = Math.sqrt(r()) * 110; gem(g, w / 2 + Math.cos(a) * d, h / 2 + Math.sin(a) * d, 4 + r() * 4, i % 3 ? c.accent : ['#2f7fd6', '#3fae5a', '#9b5cff', '#f2f2f2'][i % 4]); }
      for (const [x, y] of [[100, 190], [210, 120]]) { circle(g, x, y, 10); paint(g, domeFill(g, x, y, 10, c.gold, 0.5), INK, 1.3); circle(g, x, y, 6.5); paint(g, shade(c.gold, -0.4), null); }
      sword(g, 175, 215, -0.9, 76, '#d8dde2', c.gold, 1.1);
      g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i / 5) * TAU; g.lineTo(120 + Math.cos(a) * 15, 105 + Math.sin(a) * 15); g.lineTo(120 + Math.cos(a + 0.6) * 9, 105 + Math.sin(a + 0.6) * 9); } g.closePath();
      paint(g, litFill(g, 105, 90, 30, 30, c.gold, 0.5), INK, 1.3);
      gem(g, 120, 105, 4, c.accent);
      roundShield(g, 222, 205, 20, '#7a2f2f', c.gold);
      for (let i = 0; i < 6; i++) sparkle(g, 60 + r() * 180, 60 + r() * 180, 3 + r() * 3, alpha('#ffffff', 0.9));
    },
  },
  {
    id: 'coin-stacks', name: 'Coin stacks', cat: 'treasure', sets: ['dungeon', 'tavern', 'market', 'town', 'castle', 'crypt'], tags: ['coins', 'gold', 'stacks', 'purse', 'gems', 'money', 'loot', 'spilled'],
    w: 1, h: 1, c: { gold: '#e2b84a', bag: '#7a5638' },
    variants: [{ name: 'Gold stacks', c: {} }, { name: 'Silver stacks', c: { gold: '#c9ced3' } }, { name: 'Spilled purse', c: {}, f: { purse: 1 } }, { name: 'Gem scatter', c: {}, f: { gems: 1 } }],
    desc: 'Neat piles of coins, a purse spilling its contents, or a handful of loose gems.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.gems) { const cols = ['#c0392b', '#2f7fd6', '#3fae5a', '#9b5cff', '#f2f2f2', '#e0b03a']; for (let i = 0; i < 11; i++) gem(g, 18 + r() * 64, 18 + r() * 64, 4 + r() * 3.5, cols[i % cols.length]); return; }
      if (f.purse) {
        coins(g, 62, 62, 24, 26, r, c.gold);
        sack(g, 36, 36, 18, c.bag, r, -2.3);
        return;
      }
      for (const [x, y, n] of [[34, 40, 7], [60, 34, 5], [48, 64, 9], [72, 62, 4], [26, 70, 3]]) coinStack(g, x, y + n * 2, 9, n, c.gold);
      coins(g, 50, 82, 18, 6, r, c.gold);
    },
  },
  {
    id: 'jewelry-box', name: 'Jewelry box', cat: 'treasure', sets: ['castle', 'town', 'tavern', 'wizard', 'market'], tags: ['jewelry', 'box', 'necklace', 'rings', 'casket', 'pearls', 'loot'],
    w: 1, h: 1, c: { wood: '#6a2a2a', metal: '#e2b84a', lining: '#2f5d8a' },
    variants: [{ name: 'Rosewood', c: {} }, { name: 'Ebony', c: { wood: '#3b2a22', lining: '#a3312c' } }, { name: 'Silver', c: { wood: '#9aa0a8', metal: '#e6e9ec', lining: '#5d3a78' } }],
    desc: 'A small open casket of rings, chains and pearls. Easy to pocket, worth a small fortune.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 20, 18, 60, 14, 3); paint(g, litFill(g, 20, 18, 60, 14, shade(c.wood, -0.1), 0.3), INK, 1.6);
      rr(g, 20, 32, 60, 46, 4); paint(g, litFill(g, 20, 32, 60, 46, c.wood, 0.3), INK, LW);
      rr(g, 25, 37, 50, 36, 3); paint(g, litFill(g, 25, 37, 50, 36, c.lining, 0.25), INK, 1.2);
      g.beginPath(); g.moveTo(30, 44); g.bezierCurveTo(40, 70, 60, 70, 70, 44);
      g.setLineDash([2.4, 1.6]); g.strokeStyle = c.metal; g.lineWidth = 2.4; g.stroke(); g.setLineDash([]);
      gem(g, 50, 63, 4.5, '#c0392b');
      for (let i = 0; i < 7; i++) { const x = 32 + i * 6, y = 50 + Math.sin(i) * 3; circle(g, x, y, 2.2); paint(g, domeFill(g, x, y, 2.2, '#f4efe4', 0.6), alpha(INK, 0.6), 0.6); }
      for (const [x, y, col] of [[36, 66, '#3fae5a'], [64, 66, '#2f7fd6']] as [number, number, string][]) { circle(g, x, y, 4); g.strokeStyle = INK; g.lineWidth = 2.8; g.stroke(); g.strokeStyle = c.metal; g.lineWidth = 1.6; g.stroke(); gem(g, x, y - 4, 2.2, col); }
      for (const x of [20, 76]) { rr(g, x, 30, 4, 4, 1); paint(g, c.metal, INK, 0.6); }
      void r;
    },
  },
  {
    id: 'reliquary', name: 'Reliquary', cat: 'treasure', sets: ['temple', 'crypt', 'castle', 'dungeon'], tags: ['reliquary', 'relic', 'casket', 'holy', 'shrine', 'gilded', 'loot'],
    w: 1, h: 1, c: { metal: '#e2b84a', gem: '#c0392b', cloth: '#5d3a78' },
    variants: [{ name: 'Gilded', c: {} }, { name: 'Silver', c: { metal: '#c9ced3', gem: '#2f7fd6', cloth: '#2f5d8a' } }, { name: 'Dark bronze', c: { metal: '#8a6a3a', gem: '#3fae5a', cloth: '#2b2b30' } }],
    desc: 'A small gilded casket shaped like a little house, holding a sacred relic. Its keepers want it back.',
    draw: ({ g, c }) => {
      cushion(g, 50, 52, 74, c.cloth, c.metal);
      rr(g, 26, 34, 48, 34, 3); paint(g, litFill(g, 26, 34, 48, 34, c.metal, 0.4), INK, LW);
      poly(g, [[22, 40], [50, 28], [78, 40], [78, 50], [50, 38], [22, 50]]); paint(g, litFill(g, 22, 28, 56, 22, shade(c.metal, 0.1), 0.4), INK, 1.4);
      line(g, 50, 28, 50, 38, shade(c.metal, -0.4), 1.2);
      for (const x of [34, 50, 66]) gem(g, x, 58, 3.5, c.gem);
      poly(g, [[48, 22], [52, 22], [52, 28], [48, 28]]); paint(g, c.metal, INK, 0.8);
      line(g, 45, 24, 55, 24, INK, 3); line(g, 45, 24, 55, 24, c.metal, 1.6);
    },
  },
  {
    id: 'chalices', name: 'Golden goblets', cat: 'treasure', sets: ['castle', 'temple', 'tavern', 'crypt', 'dungeon'], tags: ['chalice', 'goblet', 'cup', 'gold', 'plate', 'tableware', 'loot', 'grail'],
    w: 1, h: 1, c: { metal: '#e2b84a', wine: '#6a1a2a' },
    variants: [{ name: 'Gold', c: {} }, { name: 'Silver', c: { metal: '#c9ced3' } }, { name: 'Jeweled gold', c: {}, f: { gems: 1 } }],
    desc: 'A golden platter with fine goblets. Valuable, if a bit heavy to carry off.',
    draw: ({ g, c, f }) => {
      circle(g, 50, 50, 42); paint(g, domeFill(g, 50, 50, 42, c.metal, 0.35), INK, LW);
      circle(g, 50, 50, 34); paint(g, shade(c.metal, -0.15), alpha(INK, 0.5), 1);
      for (const [x, y, s, full] of [[36, 40, 12, 1], [62, 38, 10, 0], [52, 64, 11, 1]]) {
        circle(g, x + 3, y + 3, s * 0.6); paint(g, alpha('#000000', 0.25), null);
        circle(g, x, y, s); paint(g, domeFill(g, x, y, s, c.metal, 0.5), INK, 1.4);
        circle(g, x, y, s * 0.74); paint(g, full ? c.wine : shade(c.metal, -0.45), alpha(INK, 0.7), 1);
        if (full) { ellipse(g, x - s * 0.25, y - s * 0.3, s * 0.25, s * 0.12, -0.5); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fill(); }
        if (f.gems) for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU + 0.5; gem(g, x + Math.cos(a) * s * 0.9, y + Math.sin(a) * s * 0.9, 2.2, ['#c0392b', '#2f7fd6', '#3fae5a'][k]); }
      }
    },
  },
  {
    id: 'treasure-urn', name: 'Treasure urn', cat: 'treasure', sets: ['crypt', 'temple', 'dungeon', 'desert', 'cave'], tags: ['urn', 'jar', 'vase', 'coins', 'treasure', 'spilled', 'loot'],
    w: 1, h: 1, c: { clay: '#a0603a', gold: '#e2b84a' },
    variants: [{ name: 'Clay', c: {} }, { name: 'Bronze', c: { clay: '#a8743c' } }, { name: 'Gold', c: { clay: '#e2b84a', gold: '#f2d27a' } }, { name: 'Tipped over', c: {}, f: { tipped: 1 } }],
    desc: 'A big urn brimming with coins. Tipped over, it spills a trail of gold across the floor.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.tipped) {
        coins(g, 70, 64, 22, 30, r, c.gold);
        g.save(); g.translate(40, 42); g.rotate(0.7);
        ellipse(g, 0, 0, 22, 17); paint(g, domeFill(g, 0, 0, 22, c.clay, 0.35), INK, LW);
        rr(g, 18, -9, 10, 18, 3); paint(g, litFill(g, 18, -9, 10, 18, shade(c.clay, -0.1), 0.3), INK, 1.4);
        ellipse(g, 28, 0, 4, 10); paint(g, '#1a120c', INK, 1);
        g.restore();
        return;
      }
      circle(g, 50, 50, 34); paint(g, domeFill(g, 50, 50, 34, c.clay, 0.4), INK, LW);
      for (let i = 0; i < 2; i++) { circle(g, 50, 50, 26 - i * 3); g.strokeStyle = alpha(shade(c.clay, -0.45), 0.6); g.lineWidth = 1.4; g.stroke(); }
      circle(g, 50, 50, 18); paint(g, shade(c.clay, -0.2), INK, 1.6);
      g.save(); circle(g, 50, 50, 16); g.clip(); coins(g, 50, 50, 14, 22, r, c.gold); g.restore();
      for (const s of [-1, 1]) { ellipse(g, 50 + s * 36, 50, 5, 9); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); g.strokeStyle = c.clay; g.lineWidth = 2.4; g.stroke(); }
      coins(g, 74, 80, 8, 4, r, c.gold);
    },
  },
  {
    id: 'treasure-map', name: 'Treasure map', cat: 'treasure', sets: ['ship', 'tavern', 'dungeon', 'camp', 'town', 'cave'], tags: ['map', 'treasure map', 'scroll case', 'parchment', 'clue', 'x marks', 'loot'],
    w: 1, h: 1, layer: 'floor', c: { ink: '#7a2f2f', leather: '#6b4428' },
    variants: [{ name: 'Map', c: {} }, { name: 'Faded map', c: { ink: '#5a4a38' } }, { name: 'Scroll case', c: {}, f: { tube: 1 } }, { name: 'Bone scroll case', c: { leather: '#d8cfb4' }, f: { tube: 1 } }],
    desc: 'A weathered map with a dotted path to an X, or a sealed case that may hold one.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.tube) {
        g.save(); g.translate(50, 50); g.rotate(-0.6);
        rr(g, -36, -9, 72, 18, 8); paint(g, litFill(g, -36, -9, 72, 18, c.leather, 0.35), INK, LW);
        for (const x of [-36, 26]) { rr(g, x, -10, 10, 20, 4); paint(g, litFill(g, x, -10, 10, 20, '#c9a24a', 0.4), INK, 1.3); }
        line(g, -20, -9, -20, 9, alpha(INK, 0.5), 1.2); line(g, 14, -9, 14, 9, alpha(INK, 0.5), 1.2);
        g.restore();
        return;
      }
      g.save(); g.translate(50, 50); g.rotate(-0.12);
      poly(g, [[-38, -30], [36, -34], [40, 28], [-34, 32]]);
      paint(g, litFill(g, -38, -34, 78, 66, PARCH, 0.15), INK, 1.6);
      for (const [x, y] of [[-38, -30], [36, -34], [40, 28], [-34, 32]]) { circle(g, x, y, 5); paint(g, '#8a8780', INK, 1); }
      blob(g, lumpy(-6, 0, 22, 0.4, 9, r, 16)); g.strokeStyle = alpha('#6a5a3a', 0.8); g.lineWidth = 1.2; g.stroke();
      g.beginPath(); g.moveTo(-28, 20); g.bezierCurveTo(-10, 10, -20, -14, 6, -12); g.bezierCurveTo(20, -10, 14, 8, 22, 12);
      dashed(g, c.ink, 1.6, [3, 3]);
      line(g, 18, 8, 26, 16, c.ink, 2.4); line(g, 26, 8, 18, 16, c.ink, 2.4);
      for (let i = 0; i < 3; i++) { poly(g, [[-26 + i * 7, -18], [-23 + i * 7, -24], [-20 + i * 7, -18]]); g.strokeStyle = alpha('#5a4a38', 0.8); g.lineWidth = 1; g.stroke(); }
      g.restore();
    },
  },
  {
    id: 'key-ring', name: 'Key ring', cat: 'treasure', sets: ['dungeon', 'castle', 'town', 'tavern', 'crypt'], tags: ['keys', 'key ring', 'jailer', 'locks', 'skeleton key', 'loot'],
    w: 1, h: 1, layer: 'floor', c: { metal: '#6c6f73' },
    variants: [{ name: 'Iron', c: {} }, { name: 'Brass', c: { metal: '#c9a24a' } }, { name: 'Bone', c: { metal: '#e4dcc4' } }],
    desc: "A jailer's ring of keys. One of them opens something important.",
    draw: ({ g, c }) => {
      circle(g, 50, 42, 13);
      g.strokeStyle = INK; g.lineWidth = 4.6; g.stroke(); g.strokeStyle = c.metal; g.lineWidth = 2.8; g.stroke();
      [[-0.2, 30], [0.5, 34], [1.2, 28], [1.9, 32], [2.6, 26]].forEach(([a, L], i) => key(g, 50 + Math.cos(a + 0.4) * 15, 42 + Math.sin(a + 0.4) * 15, a + 0.4, L, i % 2 ? shade(c.metal, 0.15) : c.metal));
    },
  },
  {
    id: 'backpack', name: "Adventurer's backpack", cat: 'treasure', sets: ['camp', 'dungeon', 'forest', 'cave', 'tavern', 'crypt'], tags: ['backpack', 'pack', 'gear', 'bedroll', 'rope', 'supplies', 'dead adventurer', 'loot'],
    w: 1, h: 1, c: { pack: '#7a5638', roll: '#5a6a3a' },
    variants: [{ name: 'Brown leather', c: {} }, { name: 'Green canvas', c: { pack: '#4e5e34', roll: '#8a3a2a' } }, { name: 'Grey', c: { pack: '#6a6660', roll: '#2f5d8a' } }],
    desc: "A dropped pack with a bedroll and rope: rations, a torch or two, and whatever its owner didn't live to use.",
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 24, 26, 52, 58, 14); paint(g, litFill(g, 24, 26, 52, 58, c.pack, 0.3), INK, LW);
      rr(g, 30, 52, 40, 24, 8); paint(g, litFill(g, 30, 52, 40, 24, shade(c.pack, -0.1), 0.3), INK, 1.4);
      rr(g, 28, 26, 44, 26, 10); paint(g, litFill(g, 28, 26, 44, 26, shade(c.pack, 0.1), 0.3), INK, 1.4);
      for (const x of [40, 60]) { rr(g, x - 3, 40, 6, 20, 1.5); paint(g, '#3a2a1c', INK, 1); rr(g, x - 4, 56, 8, 5, 1); paint(g, '#c9a24a', INK, 0.8); }
      rr(g, 18, 14, 64, 16, 8); paint(g, litFill(g, 18, 14, 64, 16, c.roll, 0.3), INK, LW);
      for (const x of [30, 70]) line(g, x, 14, x, 30, '#3a2a1c', 2.4);
      circle(g, 80, 78, 12); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#c9b48a'; g.lineWidth = 4; g.stroke();
      circle(g, 80, 78, 7); g.strokeStyle = alpha('#8a7550', 0.9); g.lineWidth = 2; g.stroke();
      void r;
    },
  },
  {
    id: 'gear-pile', name: 'Weapon and armor pile', cat: 'treasure', sets: ['dungeon', 'camp', 'castle', 'cave', 'crypt'], tags: ['weapons', 'armor', 'pile', 'swords', 'axes', 'helmet', 'shield', 'loot', 'battlefield'],
    w: 1, h: 1, c: { metal: '#b9c0c6', wood: '#6b4428' },
    variants: [{ name: 'Weapon pile', c: {} }, { name: 'Armor pile', c: {}, f: { armor: 1 } }, { name: 'Rusty weapons', c: { metal: '#8b5a3b' } }, { name: 'Rusty armor', c: { metal: '#8b5a3b' }, f: { armor: 1 } }],
    desc: 'A heap of dropped weapons or armor, maybe from a fallen patrol. Some of it is still good.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.armor) {
        roundShield(g, 30, 64, 20, '#7a2f2f', '#8a6a3a');
        g.beginPath(); g.moveTo(44, 30); g.quadraticCurveTo(64, 22, 84, 30); g.lineTo(80, 70); g.quadraticCurveTo(64, 78, 48, 70); g.closePath();
        paint(g, litFill(g, 44, 22, 40, 56, c.metal, 0.4), INK, LW);
        line(g, 64, 28, 64, 72, alpha(shade(c.metal, -0.45), 0.7), 1.2);
        for (let y = 40; y < 70; y += 8) line(g, 50, y, 78, y, alpha(shade(c.metal, -0.35), 0.5), 1);
        circle(g, 34, 30, 15); paint(g, domeFill(g, 34, 30, 15, c.metal, 0.45), INK, LW);
        rr(g, 30, 22, 8, 16, 2); paint(g, '#1a1714', INK, 1);
        rr(g, 56, 78, 30, 12, 4); paint(g, litFill(g, 56, 78, 30, 12, '#6b4428', 0.3), INK, 1.4);
        return;
      }
      sword(g, 14, 80, -0.7, 72, c.metal, '#8a6a3a');
      sword(g, 20, 26, 0.55, 70, c.metal, '#6c6f73');
      g.save(); g.translate(56, 66); g.rotate(-1.9);
      line(g, 0, 0, 52, 0, INK, 6); line(g, 0, 0, 52, 0, c.wood, 3.6);
      g.beginPath(); g.moveTo(40, -3); g.quadraticCurveTo(46, -20, 58, -18); g.quadraticCurveTo(52, -6, 52, 0); g.quadraticCurveTo(52, 6, 58, 18); g.quadraticCurveTo(46, 20, 40, 3); g.closePath();
      paint(g, litFill(g, 40, -20, 18, 40, c.metal, 0.45), INK, 1.4);
      g.restore();
      g.save(); g.translate(10, 52); g.rotate(-0.15);
      line(g, 0, 0, 82, 0, INK, 5); line(g, 0, 0, 82, 0, c.wood, 3);
      poly(g, [[80, -5], [94, 0], [80, 5]]); paint(g, c.metal, INK, 1);
      g.restore();
      void r;
    },
  },
  {
    id: 'supplies', name: 'Rations and supplies', cat: 'treasure', sets: ['camp', 'dungeon', 'tavern', 'ship', 'cave', 'forest'], tags: ['rations', 'food', 'supplies', 'waterskin', 'bread', 'cheese', "healer's kit", 'bandages', 'herbs'],
    w: 1, h: 1, c: { cloth: '#b59a6a', bag: '#6b4428' },
    variants: [{ name: 'Rations', c: {} }, { name: "Healer's kit", c: { bag: '#5a3a24' }, f: { heal: 1 } }, { name: 'Rations, dark cloth', c: { cloth: '#7a6a52' } }],
    desc: "A bundle of trail food and water, or a healer's satchel of bandages, salves and herbs.",
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.heal) {
        rr(g, 18, 26, 64, 48, 10); paint(g, litFill(g, 18, 26, 64, 48, c.bag, 0.3), INK, LW);
        rr(g, 18, 26, 64, 20, 10); paint(g, litFill(g, 18, 26, 64, 20, shade(c.bag, 0.1), 0.3), INK, 1.4);
        for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k - 1) * 0.6; ellipse(g, 50 + Math.cos(a) * 8, 52 + Math.sin(a) * 8, 3, 7, a + Math.PI / 2); paint(g, '#5fae5a', INK, 0.8); }
        line(g, 50, 52, 50, 64, '#3e6b3a', 1.6);
        for (const [x, y] of [[78, 80], [88, 70]]) { ellipse(g, x, y, 9, 6); paint(g, domeFill(g, x, y, 9, '#efe8d8', 0.3), INK, 1.2); circle(g, x, y, 3); g.strokeStyle = alpha('#9a8a6a', 0.8); g.lineWidth = 1; g.stroke(); }
        flask(g, 20, 84, 6, '#c0392b', -0.4);
        return;
      }
      rr(g, 16, 30, 46, 36, 6); paint(g, litFill(g, 16, 30, 46, 36, c.cloth, 0.25), INK, LW);
      line(g, 16, 48, 62, 48, '#6a5232', 2); line(g, 39, 30, 39, 66, '#6a5232', 2);
      ellipse(g, 68, 34, 18, 10, -0.3); paint(g, domeFill(g, 68, 34, 18, '#c9853a', 0.35), INK, 1.4);
      for (let i = 0; i < 3; i++) line(g, 58 + i * 8, 28, 62 + i * 8, 38, alpha('#6a3a1a', 0.7), 1.2);
      poly(g, [[64, 58], [88, 52], [86, 76]]); paint(g, litFill(g, 64, 52, 24, 24, '#e8c860', 0.3), INK, 1.4);
      sack(g, 32, 80, 12, '#7a5a3a', r, 0.3);
    },
  },
];

// ---------------------------------------------------------------- 6. magic items as props

const MAGIC: ObjDef[] = [
  {
    id: 'potion-healing', name: 'Healing potion', cat: 'treasure', sets: ['dungeon', 'wizard', 'temple', 'tavern', 'market', 'crypt'], tags: ['potion', 'healing', 'red', 'flask', 'vial', 'magic item', 'loot'],
    w: 1, h: 1, light: { bright: 0, dim: 5, color: '#ff6a6a' }, c: { liq: '#d2283a', cork: '#8a5a34' },
    variants: [{ name: 'Healing', c: {} }, { name: 'Greater healing', c: { liq: '#e0405a', cork: '#e2b84a' } }, { name: 'Superior healing', c: { liq: '#ff6a2a', cork: '#c9ced3' } }, { name: 'Supreme healing', c: { liq: '#ff3b8a', cork: '#e2b84a' } }],
    desc: 'A red potion that glows faintly. Drinking it heals wounds (stronger kinds heal more).',
    draw: ({ g, c }) => {
      glow(g, 46, 52, 36, c.liq, 0.5);
      flask(g, 42, 54, 16, c.liq, -0.5, c.cork);
      flask(g, 72, 72, 9, c.liq, 2.2, c.cork);
      sparkle(g, 66, 34, 4, alpha('#ffffff', 0.9));
    },
  },
  {
    id: 'potion-set', name: 'Assorted potions', cat: 'treasure', sets: ['wizard', 'market', 'dungeon', 'tavern', 'temple'], tags: ['potions', 'vials', 'flasks', 'set', 'alchemy', 'magic item', 'loot', 'tray'],
    w: 1, h: 1, light: { bright: 0, dim: 5, color: '#c9a0ff' }, c: { tray: '#6b4428' },
    variants: [{ name: 'Wooden tray', c: {} }, { name: 'Silver tray', c: { tray: '#c9ced3' } }, { name: 'No tray', c: {}, f: { loose: 1 } }],
    desc: 'A handful of potions in mixed colours. Who knows which is which until someone tastes them.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (!f.loose) { rr(g, 12, 18, 76, 64, 6); paint(g, litFill(g, 12, 18, 76, 64, c.tray, 0.3), INK, LW); rr(g, 17, 23, 66, 54, 4); paint(g, shade(c.tray, -0.2), alpha(INK, 0.6), 1); }
      const cols = ['#d2283a', '#2f7fd6', '#3fae5a', '#9b5cff', '#e0b03a', '#2fb8b0'];
      [[32, 36, 10], [58, 34, 8], [76, 50, 7], [30, 62, 8], [54, 60, 11], [70, 70, 6]].forEach(([x, y, s], i) => {
        glow(g, x, y, s * 2.2, cols[i], 0.45);
        circle(g, x, y, s); paint(g, domeFill(g, x, y, s, cols[i], 0.5), INK, 1.3);
        circle(g, x, y, s * 0.38); paint(g, '#8a5a34', INK, 0.8);
        circle(g, x - s * 0.45, y - s * 0.45, s * 0.2); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fill();
      });
      void r;
    },
  },
  {
    id: 'spell-scroll', name: 'Spell scroll', cat: 'treasure', sets: ['wizard', 'temple', 'dungeon', 'crypt', 'market'], tags: ['scroll', 'spell', 'magic', 'parchment', 'runes', 'magic item', 'loot'],
    w: 1, h: 1, layer: 'floor', light: { bright: 0, dim: 5, color: '#ffd27a' }, c: { rune: '#e8a020', ribbon: '#a3312c' },
    variants: [{ name: 'Gold script', c: {} }, { name: 'Blue script', c: { rune: '#2f7fd6', ribbon: '#2f5d8a' } }, { name: 'Red script', c: { rune: '#c0392b', ribbon: '#2b2b30' } }, { name: 'Green script', c: { rune: '#3fae5a', ribbon: '#5d3a78' } }],
    desc: 'A parchment holding one spell, ready to read aloud once. The words glow faintly.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      g.save(); g.translate(50, 50); g.rotate(-0.25);
      glow(g, 0, 0, 40, c.rune, 0.4);
      rr(g, -30, -24, 60, 48, 2); paint(g, litFill(g, -30, -24, 60, 48, PARCH, 0.15), INK, 1.4);
      for (const x of [-34, 30]) { rr(g, x, -27, 8, 54, 4); paint(g, litFill(g, x, -27, 8, 54, '#c9b27f', 0.35), INK, 1.2); }
      for (let i = 0; i < 3; i++) for (let k = 0; k < 4; k++) rune(g, -20 + k * 13, -12 + i * 12, 7, r, c.rune, 1.6);
      rr(g, -8, 20, 16, 10, 2); paint(g, c.ribbon, INK, 1);
      circle(g, 0, 22, 5); paint(g, domeFill(g, 0, 22, 5, '#a3312c', 0.4), INK, 1);
      g.restore();
    },
  },
  {
    id: 'wand', name: 'Wand or rod', cat: 'treasure', sets: ['wizard', 'dungeon', 'temple', 'crypt', 'market'], tags: ['wand', 'rod', 'sceptre', 'magic', 'staff', 'magic item', 'loot', 'spark'],
    w: 1, h: 1, light: { bright: 0, dim: 5, color: '#9fe0ff' }, c: { wood: '#6b4428', tip: '#7fd6ff' },
    variants: [{ name: 'Oak wand', c: {} }, { name: 'Bone wand', c: { wood: '#e4dcc4', tip: '#9bff8a' } }, { name: 'Iron rod', c: { wood: '#6c6f73', tip: '#ff8a5a' }, f: { rod: 1 } }, { name: 'Golden rod', c: { wood: '#e2b84a', tip: '#ffffff' }, f: { rod: 1 } }],
    desc: 'A wand or rod humming with stored spells. Sparks flicker at its tip.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      g.save(); g.translate(50, 50); g.rotate(-0.7);
      if (f.rod) {
        rr(g, -38, -4, 66, 8, 3); paint(g, litFill(g, -38, -4, 66, 8, c.wood, 0.45), INK, 1.4);
        for (const x of [-30, -10]) { rr(g, x, -5.5, 4, 11, 1); paint(g, shade(c.wood, 0.2), INK, 0.8); }
        for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU; poly(g, [[28, 0], [28 + Math.cos(a) * 10, Math.sin(a) * 10], [36, 0]]); paint(g, litFill(g, 26, -10, 12, 20, c.wood, 0.4), INK, 1); }
        glow(g, 36, 0, 18, c.tip, 0.7); circle(g, 36, 0, 4.5); paint(g, domeFill(g, 36, 0, 4.5, c.tip, 0.6), INK, 1);
      } else {
        poly(g, [[-36, -3.4], [30, -1.6], [30, 1.6], [-36, 3.4]]); paint(g, litFill(g, -36, -4, 66, 8, c.wood, 0.35), INK, 1.3);
        rr(g, -36, -4.5, 16, 9, 2); paint(g, shade(c.wood, -0.25), INK, 1);
        glow(g, 32, 0, 18, c.tip, 0.7); circle(g, 32, 0, 3.4); paint(g, mix(c.tip, '#ffffff', 0.5), null);
      }
      for (let i = 0; i < 5; i++) sparkle(g, 34 + (r() - 0.3) * 24, (r() - 0.5) * 24, 1.6 + r() * 2.4, alpha(mix(c.tip, '#ffffff', 0.5), 0.95));
      g.restore();
    },
  },
  {
    id: 'staff-stand', name: 'Magic staff on stand', cat: 'arcane', sets: ['wizard', 'temple', 'castle', 'forest', 'dungeon'], tags: ['staff', 'stand', 'crystal', 'magic', 'wizard', 'druid', 'magic item', 'loot'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 5, dim: 5, color: '#8fd0ff' }, c: { wood: '#5c3a20', gem: '#4cb8ff', metal: '#c9a24a' },
    variants: [{ name: 'Crystal', c: {} }, { name: 'Ember', c: { gem: '#ff6a2a', metal: '#33373c' } }, { name: 'Druid', c: { wood: '#7a5a32', gem: '#5ad87a', metal: '#5a7a3a' }, f: { leaf: 1 } }, { name: 'Bone', c: { wood: '#d8cfb4', gem: '#c77dff', metal: '#4a4440' } }],
    desc: 'A powerful staff standing in an iron holder, its head crystal glowing. Someone will miss it.',
    draw: ({ g, c, f }) => {
      for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU - Math.PI / 2; line(g, 50, 50, 50 + Math.cos(a) * 34, 50 + Math.sin(a) * 34, INK, 5.4); line(g, 50, 50, 50 + Math.cos(a) * 34, 50 + Math.sin(a) * 34, '#55585e', 3.4); }
      circle(g, 50, 50, 14); paint(g, domeFill(g, 50, 50, 14, c.wood, 0.4), INK, 1.6);
      if (f.leaf) for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; ellipse(g, 50 + Math.cos(a) * 16, 50 + Math.sin(a) * 16, 8, 3.5, a); paint(g, '#4e8a3a', INK, 0.9); }
      for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU + 0.4; line(g, 50, 50, 50 + Math.cos(a) * 15, 50 + Math.sin(a) * 15, INK, 4); line(g, 50, 50, 50 + Math.cos(a) * 15, 50 + Math.sin(a) * 15, c.metal, 2.4); }
      glow(g, 50, 50, 34, c.gem, 0.7);
      gem(g, 50, 50, 9, c.gem);
    },
  },
  {
    id: 'ring-cushion', name: 'Magic ring on cushion', cat: 'treasure', sets: ['castle', 'temple', 'wizard', 'crypt', 'dungeon'], tags: ['ring', 'amulet', 'pendant', 'necklace', 'cushion', 'jewel', 'magic item', 'loot'],
    w: 1, h: 1, light: { bright: 0, dim: 5, color: '#ffe08a' }, c: { cloth: '#7a2f2f', metal: '#e2b84a', gem: '#c0392b' },
    variants: [{ name: 'Ring', c: {} }, { name: 'Ring, blue velvet', c: { cloth: '#2f5d8a', gem: '#3fd0ff' } }, { name: 'Amulet', c: { cloth: '#5d3a78', gem: '#3fae5a' }, f: { amulet: 1 } }, { name: 'Silver amulet', c: { cloth: '#2b2b30', metal: '#c9ced3', gem: '#9b5cff' }, f: { amulet: 1 } }],
    desc: 'A glowing ring or amulet laid on a velvet cushion, the kind of thing that grants a lasting power.',
    draw: ({ g, c, f }) => {
      cushion(g, 50, 50, 72, c.cloth, c.metal);
      glow(g, 50, 50, 30, c.gem, 0.6);
      if (f.amulet) {
        g.beginPath(); g.ellipse(50, 42, 22, 18, 0, Math.PI * 1.05, Math.PI * 1.95, true);
        g.setLineDash([2.2, 1.4]); g.strokeStyle = c.metal; g.lineWidth = 2.2; g.stroke(); g.setLineDash([]);
        circle(g, 50, 58, 11); paint(g, domeFill(g, 50, 58, 11, c.metal, 0.5), INK, 1.4);
        gem(g, 50, 58, 6.5, c.gem);
      } else {
        circle(g, 50, 52, 11); g.strokeStyle = INK; g.lineWidth = 6.4; g.stroke(); g.strokeStyle = c.metal; g.lineWidth = 4.4; g.stroke();
        circle(g, 50, 52, 11); g.strokeStyle = alpha('#ffffff', 0.4); g.lineWidth = 1; g.stroke();
        gem(g, 50, 40, 5.5, c.gem);
      }
      sparkle(g, 70, 30, 4, alpha('#ffffff', 0.9));
    },
  },
  {
    id: 'magic-sword', name: 'Glowing magic sword', cat: 'treasure', sets: ['dungeon', 'castle', 'temple', 'crypt', 'cave'], tags: ['sword', 'magic', 'glowing', 'blade', 'weapon', 'runes', 'magic item', 'loot', 'flame', 'frost'],
    w: 1, h: 1, light: { bright: 5, dim: 10, color: '#7fd6ff' }, c: { blade: '#d8eef8', glow: '#4cc9f0', hilt: '#c9a24a' },
    variants: [{ name: 'Frost', c: {} }, { name: 'Flame', c: { blade: '#ffe0c0', glow: '#ff6a1a' } }, { name: 'Holy', c: { blade: '#fff8e0', glow: '#ffd24a', hilt: '#e6e9ec' } }, { name: 'Shadow', c: { blade: '#3a3044', glow: '#9b5cff', hilt: '#2b2b30' } }],
    desc: 'A blade that sheds its own light, runes bright along the fuller. Extra damage of its element on a hit.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 46, c.glow, 0.55);
      sword(g, 12, 86, -0.82, 104, c.blade, c.hilt, 1.15);
      g.save(); g.translate(12, 86); g.rotate(-0.82);
      for (let k = 0; k < 4; k++) rune(g, 42 + k * 12, 0, 6, r, c.glow, 1.4);
      g.restore();
      for (let i = 0; i < 5; i++) sparkle(g, 40 + r() * 40, 18 + r() * 40, 2 + r() * 2.5, alpha(mix(c.glow, '#ffffff', 0.5), 0.95));
    },
  },
  {
    id: 'sword-in-stone', name: 'Sword in the stone', cat: 'treasure', sets: ['forest', 'temple', 'castle', 'cave', 'crypt'], tags: ['sword', 'stone', 'anvil', 'legend', 'chosen', 'pull', 'magic item', 'quest'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 0, dim: 10, color: '#ffe8a3' }, c: { stone: '#8a8780', hilt: '#e2b84a', blade: '#d8dde2' },
    variants: [{ name: 'Grey stone', c: {} }, { name: 'Mossy', c: { stone: '#6c7a64' } }, { name: 'Dark iron hilt', c: { hilt: '#55585e' } }],
    desc: 'A sword sunk deep in a boulder. Only the worthy (or the very strong) can pull it free.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      stone(g, 50, 54, 40, c.stone, r, 36);
      glow(g, 50, 46, 30, '#ffe8a3', 0.5);
      ellipse(g, 50, 52, 9, 3.5); paint(g, '#1a1714', null);
      rr(g, 47, 40, 6, 12, 1); paint(g, litFill(g, 47, 40, 6, 12, c.blade, 0.4), INK, 1);
      rr(g, 30, 34, 40, 8, 3); paint(g, litFill(g, 30, 34, 40, 8, c.hilt, 0.45), INK, 1.4);
      rr(g, 46, 16, 8, 20, 2); paint(g, litFill(g, 46, 16, 8, 20, LEATHER, 0.3), INK, 1.2);
      circle(g, 50, 13, 5.5); paint(g, domeFill(g, 50, 13, 5.5, c.hilt, 0.5), INK, 1.2);
      gem(g, 50, 38, 2.6, '#c0392b');
    },
  },
  {
    id: 'enchanted-shield', name: 'Enchanted shield', cat: 'treasure', sets: ['castle', 'temple', 'dungeon', 'crypt'], tags: ['shield', 'magic', 'sigil', 'glowing', 'armor', 'ward', 'magic item', 'loot'],
    w: 1, h: 1, light: { bright: 0, dim: 5, color: '#ffe08a' }, c: { face: '#2f5d8a', rim: '#e2b84a', sigil: '#ffe08a' },
    variants: [{ name: 'Blue and gold', c: {} }, { name: 'Red and silver', c: { face: '#7a2f2f', rim: '#c9ced3', sigil: '#ffb0a0' } }, { name: 'Green and bronze', c: { face: '#3e6b3a', rim: '#a8743c', sigil: '#c8ff9a' } }, { name: 'Black and violet', c: { face: '#2b2b30', rim: '#6a5f78', sigil: '#c77dff' } }],
    desc: 'A shield with a softly glowing sigil that turns blows aside better than any ordinary shield.',
    draw: ({ g, c }) => {
      glow(g, 50, 50, 46, c.sigil, 0.45);
      roundShield(g, 50, 50, 38, c.face, c.rim);
      g.save(); g.translate(50, 50);
      for (let k = 0; k < 4; k++) { g.rotate(Math.PI / 2); poly(g, [[0, -12], [5, -26], [0, -31], [-5, -26]]); paint(g, alpha(c.sigil, 0.95), alpha(INK, 0.6), 1); }
      g.restore();
      circle(g, 50, 50, 9); paint(g, domeFill(g, 50, 50, 9, c.rim, 0.6), INK, 1.2);
      for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU + 0.2; rivet(g, 50 + Math.cos(a) * 35, 50 + Math.sin(a) * 35, 1.8, c.rim); }
    },
  },
  {
    id: 'magic-cloak', name: 'Magic cloak', cat: 'treasure', sets: ['wizard', 'forest', 'castle', 'crypt', 'dungeon', 'market'], tags: ['cloak', 'cape', 'mantle', 'stars', 'elven', 'invisibility', 'magic item', 'loot'],
    w: 1, h: 1, layer: 'floor', light: { bright: 0, dim: 5, color: '#b0c8ff' }, c: { cloth: '#1f2a4a', trim: '#e2b84a', star: '#ffffff' },
    variants: [{ name: 'Midnight', c: {} }, { name: 'Forest green', c: { cloth: '#2f4a2a', trim: '#c9ced3', star: '#c8ff9a' } }, { name: 'Crimson', c: { cloth: '#6a1a22', trim: '#e2b84a', star: '#ffd0a0' } }, { name: 'Grey shimmer', c: { cloth: '#6a6f78', trim: '#e6e9ec', star: '#e6f6ff' } }],
    desc: 'A cloak spread on the floor, glittering faintly. It might hide its wearer, shield them, or let them blend in.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      g.beginPath();
      g.moveTo(36, 12); g.quadraticCurveTo(50, 18, 64, 12);
      g.quadraticCurveTo(80, 50, 92, 88); g.quadraticCurveTo(70, 82, 50, 92); g.quadraticCurveTo(30, 82, 8, 88);
      g.quadraticCurveTo(20, 50, 36, 12); g.closePath();
      paint(g, litFill(g, 8, 12, 84, 80, c.cloth, 0.3), INK, LW);
      g.save(); g.clip();
      for (const x of [30, 50, 70]) { const gr = g.createLinearGradient(x - 6, 0, x + 6, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.3)'); gr.addColorStop(1, 'rgba(255,255,255,0.08)'); g.fillStyle = gr; g.fillRect(x - 6, 10, 12, 90); }
      for (let i = 0; i < 12; i++) sparkle(g, 16 + r() * 68, 24 + r() * 64, 1.4 + r() * 2.2, alpha(c.star, 0.85));
      g.restore();
      g.beginPath(); g.moveTo(8, 88); g.quadraticCurveTo(30, 82, 50, 92); g.quadraticCurveTo(70, 82, 92, 88);
      g.strokeStyle = c.trim; g.lineWidth = 2.4; g.stroke();
      circle(g, 50, 16, 5); paint(g, domeFill(g, 50, 16, 5, c.trim, 0.5), INK, 1);
    },
  },
  {
    id: 'winged-boots', name: 'Winged boots', cat: 'treasure', sets: ['wizard', 'castle', 'market', 'dungeon', 'temple'], tags: ['boots', 'wings', 'flying', 'speed', 'footwear', 'magic item', 'loot'],
    w: 1, h: 1, light: { bright: 0, dim: 5, color: '#cfe8ff' }, c: { leather: '#7a5638', wing: '#f2f0ea' },
    variants: [{ name: 'Brown', c: {} }, { name: 'Black', c: { leather: '#2b2b30' } }, { name: 'Red', c: { leather: '#7a2f2f', wing: '#ffe8c0' } }],
    desc: 'A pair of boots with little feathered wings at the heels. Their wearer can fly for short bursts.',
    draw: ({ g, c }) => {
      glow(g, 50, 50, 42, '#cfe8ff', 0.4);
      for (const [x, s] of [[37, -1], [63, 1]] as [number, number][]) {
        g.save(); g.translate(x, 52); g.rotate(s * 0.15);
        for (let k = 0; k < 4; k++) { ellipse(g, s * (14 + k * 3), -4 - k * 6, 11, 3.8, -s * (0.5 + k * 0.28)); paint(g, litFill(g, -30, -30, 60, 40, c.wing, 0.25), INK, 1); }
        rr(g, -9, -26, 18, 34, 7); paint(g, litFill(g, -9, -26, 18, 34, c.leather, 0.35), INK, LW);
        ellipse(g, 0, 14, 10, 16); paint(g, litFill(g, -10, -2, 20, 32, shade(c.leather, -0.1), 0.3), INK, LW);
        rr(g, -10, -28, 20, 6, 3); paint(g, shade(c.leather, 0.15), INK, 1.2);
        g.restore();
      }
    },
  },
  {
    id: 'bag-of-holding', name: 'Bag of holding', cat: 'treasure', sets: ['dungeon', 'wizard', 'market', 'tavern', 'camp'], tags: ['bag', 'holding', 'sack', 'pouch', 'bottomless', 'extradimensional', 'magic item', 'loot'],
    w: 1, h: 1, light: { bright: 0, dim: 5, color: '#9b5cff' }, c: { cloth: '#7a5638', swirl: '#9b5cff' },
    variants: [{ name: 'Brown cloth', c: {} }, { name: 'Black velvet', c: { cloth: '#2b2b30' } }, { name: 'Embroidered blue', c: { cloth: '#2f5d8a', swirl: '#5ad8ff' } }],
    desc: 'A plain-looking sack whose open mouth swirls with darkness. It holds far more than it should.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 58, 32, 0.18, 10, r, 28));
      paint(g, domeFill(g, 50, 58, 34, c.cloth, 0.3), INK, LW);
      for (let k = 0; k < 4; k++) line(g, 30 + k * 12, 40, 26 + k * 14, 82, alpha(shade(c.cloth, -0.5), 0.4), 1.2);
      glow(g, 50, 38, 30, c.swirl, 0.65);
      ellipse(g, 50, 38, 20, 12); paint(g, '#0a0614', INK, 1.6);
      for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(50, 38, 16 - k * 5, 9 - k * 3, 0.3 * k, 0.4 + k, 3.4 + k); g.strokeStyle = alpha(c.swirl, 0.9 - k * 0.2); g.lineWidth = 1.6; g.stroke(); }
      g.beginPath(); g.moveTo(30, 36); g.quadraticCurveTo(22, 20, 36, 22); g.moveTo(70, 36); g.quadraticCurveTo(80, 22, 66, 22);
      g.strokeStyle = INK; g.lineWidth = 3.6; g.stroke(); g.strokeStyle = '#c9b48a'; g.lineWidth = 2; g.stroke();
      for (let i = 0; i < 4; i++) sparkle(g, 36 + r() * 28, 30 + r() * 14, 1.4 + r() * 1.6, alpha('#ffffff', 0.85));
    },
  },
  {
    id: 'rune-weapon-rack', name: 'Rune weapon rack', cat: 'arcane', sets: ['castle', 'temple', 'wizard', 'dungeon'], tags: ['weapon rack', 'runes', 'magic weapons', 'armory', 'glowing', 'swords', 'magic item'],
    w: 2, h: 1, blocksMovement: true, light: { bright: 5, dim: 5, color: '#8fd0ff' }, c: { wood: '#3b2a22', rune: '#4cc9f0', metal: '#c9ced3' },
    variants: [{ name: 'Blue runes', c: {} }, { name: 'Fire runes', c: { rune: '#ff7a3a' } }, { name: 'Green runes', c: { rune: '#5ad87a', wood: '#5c3a20' } }, { name: 'Gold runes', c: { rune: '#ffd24a', wood: '#2b2b30' } }],
    desc: 'A dark rack against the top wall holding enchanted weapons, every one carved with glowing runes.',
    draw: ({ g, w, c, seed }) => {
      const r = rng(seed);
      board(g, 4, 4, w - 8, 16, c.wood, r, 'h', 2);
      board(g, 4, 34, w - 8, 10, c.wood, r, 'h', 2);
      for (let i = 0; i < 6; i++) rune(g, 22 + i * 31, 12, 8, r, c.rune, 1.8);
      glow(g, w / 2, 30, 80, c.rune, 0.3);
      for (const x of [28, 76, 124, 172]) {
        const ax = x === 76 || x === 172;
        g.save(); g.translate(x, 6); g.rotate(Math.PI / 2);
        if (ax) {
          line(g, 0, 0, 74, 0, INK, 5.4); line(g, 0, 0, 74, 0, '#6b4428', 3.4);
          g.beginPath(); g.moveTo(10, -3); g.quadraticCurveTo(4, -16, 18, -18); g.quadraticCurveTo(16, -8, 22, -3); g.closePath();
          paint(g, litFill(g, 4, -18, 18, 18, c.metal, 0.45), INK, 1.2);
          rune(g, 14, -9, 5, r, c.rune, 1.3);
        } else {
          sword(g, 0, 0, 0, 80, c.metal, '#8a6a3a', 0.9);
          for (let k = 0; k < 3; k++) rune(g, 34 + k * 12, 0, 5, r, c.rune, 1.3);
        }
        g.restore();
      }
    },
  },
];

// ---------------------------------------------------------------- 7. camp, siege and battlefield

const WOODS: Variant[] = [{ name: 'Oak', c: { wood: WOOD.oak } }, { name: 'Walnut', c: { wood: WOOD.walnut } }, { name: 'Pine', c: { wood: WOOD.pine } }];

/** A wooden cart wheel from above: a narrow rim seen edge-on. */
function wheelTop(g: G, cx: number, cy: number, L: number, wood: string) {
  rr(g, cx - L / 2, cy - 4, L, 8, 3);
  paint(g, litFill(g, cx - L / 2, cy - 4, L, 8, shade(wood, -0.2), 0.3), INK, 1.4);
  rivet(g, cx, cy, 3, METAL.iron);
}

const SIEGE: ObjDef[] = [
  {
    id: 'barricade-wood', name: 'Wooden barricade', cat: 'structure', sets: ['town', 'camp', 'castle', 'dungeon', 'farm'], tags: ['barricade', 'barrier', 'cover', 'planks', 'crates', 'blockade', 'defence'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak },
    variants: [...WOODS, { name: 'Crates and barrels', c: { wood: '#9a7048' }, f: { junk: 1 } }],
    desc: 'A hasty wall of planks and junk. Gives cover to anyone crouched behind it; must be climbed or smashed to pass.',
    draw: ({ g, w, c, f, seed }) => {
      const r = rng(seed);
      if (f.junk) {
        for (const [x, y, s] of [[30, 30, 34], [70, 26, 30], [112, 34, 32]]) { rr(g, x - s / 2, y, s, s, 2); paint(g, litFill(g, x - s / 2, y, s, s, c.wood, 0.2), INK, LW); line(g, x - s / 2 + 3, y + 3, x + s / 2 - 3, y + s - 3, alpha('#3a2412', 0.7), 2.4); }
        for (const [x, y] of [[154, 50], [180, 44]]) { circle(g, x, y, 16); paint(g, domeFill(g, x, y, 16, '#8a5a34', 0.3), INK, LW); circle(g, x, y, 12); g.strokeStyle = '#55585e'; g.lineWidth = 2; g.stroke(); }
        plank(g, 90, 72, 120, 12, 0.08, shade(c.wood, -0.1), r);
        return;
      }
      for (let i = 0; i < 4; i++) plank(g, w / 2 + (r() - 0.5) * 10, 34 + i * 11, w - 16 - r() * 20, 12, (r() - 0.5) * 0.12, shade(c.wood, (r() - 0.5) * 0.2), r);
      for (const x of [30, 100, 170]) { rr(g, x - 5, 22, 10, 62, 2); paint(g, litFill(g, x - 5, 22, 10, 62, shade(c.wood, -0.25), 0.25), INK, 1.4); }
      for (const [x, y] of [[30, 40], [100, 52], [170, 44]]) { circle(g, x, y, 1.6); paint(g, '#33373c', null); }
    },
  },
  {
    id: 'cheval-de-frise', name: 'Spiked barricade', cat: 'structure', sets: ['camp', 'castle', 'town', 'forest', 'farm'], tags: ['spikes', 'stakes', 'barricade', 'abatis', 'cheval de frise', 'defence', 'battlefield'],
    w: 2, h: 1, blocksMovement: true, c: { wood: '#7a5a3a', tip: '#d8c9a4' },
    variants: [{ name: 'Wooden stakes', c: {} }, { name: 'Iron-tipped', c: { tip: '#9aa0a8' } }, { name: 'Dark wood', c: { wood: '#4a3424' } }],
    desc: 'A log bristling with sharpened stakes. Blocks the way; anyone forced into it takes piercing damage.',
    draw: ({ g, w, c, seed }) => {
      const r = rng(seed);
      const stake = (x: number, s: number, under: boolean) => {
        const y1 = 50 - s * 40, y2 = 50 + s * 40, x1 = x - 22, x2 = x + 22;
        if (under) { line(g, x1, y1, x2, y2, INK, 7.4); line(g, x1, y1, x2, y2, shade(c.wood, -0.15), 5); }
        for (const [ex, ey, dx, dy] of [[x1, y1, -1, -s], [x2, y2, 1, s]]) {
          const L = Math.hypot(44, 80), ux = (x2 - x1) / L * dx, uy = (y2 - y1) / L * dx;
          poly(g, [[ex - uy * 3, ey + ux * 3], [ex + ux * 10, ey + uy * 10], [ex + uy * 3, ey - ux * 3]]); paint(g, c.tip, INK, 1);
          void dy;
        }
      };
      for (let x = 30; x < w; x += 35) stake(x, x % 70 < 35 ? 1 : -1, true);
      rr(g, 8, 40, w - 16, 20, 10); paint(g, litFill(g, 8, 40, w - 16, 20, c.wood, 0.3), INK, LW);
      for (let i = 0; i < 3; i++) line(g, 16 + r() * 10, 45 + i * 5, w - 20 - r() * 10, 45 + i * 5, alpha(shade(c.wood, -0.5), 0.45), 0.9);
      for (const x of [8, w - 8]) { ellipse(g, x, 50, 4, 10); paint(g, shade(c.wood, 0.25), INK, 1.2); }
      for (let x = 30; x < w; x += 35) { circle(g, x, 50, 3.4); paint(g, shade(c.wood, -0.4), INK, 1); }
    },
  },
  {
    id: 'sandbags', name: 'Sandbag wall', cat: 'structure', sets: ['camp', 'castle', 'town', 'desert', 'farm', 'ship'], tags: ['sandbags', 'sacks', 'wall', 'cover', 'fortification', 'flood', 'battlefield'],
    w: 2, h: 1, blocksMovement: true, c: { sack: '#b59a6a' },
    variants: [{ name: 'Burlap', c: {} }, { name: 'Grey canvas', c: { sack: '#8a8780' } }, { name: 'Dark', c: { sack: '#6a5a42' } }, { name: 'Snow-dusted', c: { sack: '#d8dde0' } }],
    desc: 'A low curved wall of filled sacks. Good cover for anyone behind it.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (let row = 0; row < 2; row++) for (let i = 0; i < 6; i++) {
        const t = (i + (row ? 0.5 : 0)) / 6, x = 16 + t * 168, y = 36 + row * 22 + Math.sin(t * Math.PI) * -10;
        if (x > 186) continue;
        g.save(); g.translate(x, y); g.rotate((t - 0.5) * 0.4);
        rr(g, -16, -11, 32, 22, 9); paint(g, litFill(g, -16, -11, 32, 22, shade(c.sack, (r() - 0.5) * 0.12), 0.3), INK, 1.6);
        line(g, -10, -6, -10, 6, alpha(shade(c.sack, -0.5), 0.6), 1.2);
        g.restore();
      }
    },
  },
  {
    id: 'ballista', name: 'Ballista', cat: 'vehicle', sets: ['castle', 'camp', 'ship', 'town'], tags: ['ballista', 'siege', 'bolt', 'crossbow', 'war machine', 'artillery', 'battlefield'],
    w: 2, h: 2, blocksMovement: true, c: { wood: WOOD.oak, metal: '#55585e', rope: '#c9b48a' },
    variants: WOODS,
    desc: 'A giant crossbow on a turning stand. It takes a crew to load and aim, and hits like a falling tree.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU + Math.PI / 4; plank(g, 100 + Math.cos(a) * 44, 112 + Math.sin(a) * 44, 70, 12, a, shade(c.wood, -0.15), r); }
      circle(g, 100, 112, 16); paint(g, domeFill(g, 100, 112, 16, c.metal, 0.4), INK, LW);
      rr(g, 90, 24, 20, 156, 4); paint(g, litFill(g, 90, 24, 20, 156, c.wood, 0.25), INK, LW);
      line(g, 100, 28, 100, 170, alpha(shade(c.wood, -0.5), 0.8), 2);
      g.beginPath(); g.moveTo(22, 74); g.quadraticCurveTo(100, 20, 178, 74);
      g.strokeStyle = INK; g.lineWidth = 11; g.lineCap = 'round'; g.stroke(); g.strokeStyle = c.wood; g.lineWidth = 7.4; g.stroke();
      g.beginPath(); g.moveTo(22, 74); g.lineTo(100, 140); g.lineTo(178, 74); g.strokeStyle = INK; g.lineWidth = 3.2; g.stroke(); g.strokeStyle = c.rope; g.lineWidth = 1.8; g.stroke();
      for (const x of [74, 126]) { rr(g, x - 7, 40, 14, 22, 4); paint(g, litFill(g, x - 7, 40, 14, 22, c.rope, 0.3), INK, 1.2); }
      line(g, 100, 12, 100, 138, INK, 5.4); line(g, 100, 12, 100, 138, '#5c3a20', 3.2);
      poly(g, [[94, 18], [100, 4], [106, 18]]); paint(g, c.metal, INK, 1.1);
      rr(g, 84, 160, 32, 10, 3); paint(g, c.metal, INK, 1.2);
      for (const s of [-1, 1]) { line(g, 100 + s * 16, 165, 100 + s * 30, 180, INK, 5); line(g, 100 + s * 16, 165, 100 + s * 30, 180, '#5c3a20', 3); }
    },
  },
  {
    id: 'catapult', name: 'Catapult', cat: 'vehicle', sets: ['castle', 'camp', 'town'], tags: ['catapult', 'mangonel', 'siege', 'war machine', 'artillery', 'boulder', 'battlefield'],
    w: 2, h: 2, blocksMovement: true, c: { wood: WOOD.oak, metal: '#55585e' },
    variants: [...WOODS, { name: 'Loaded', c: {}, f: { loaded: 1 } }],
    desc: 'A wheeled throwing engine. Needs a crew and several rounds to wind; flings boulders across the battlefield.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (const x of [44, 156]) board(g, x - 8, 20, 16, 160, c.wood, r, 'v');
      for (const y of [32, 168]) board(g, 36, y - 7, 128, 14, shade(c.wood, -0.1), r, 'h');
      for (const [x, y] of [[30, 50], [30, 150], [170, 50], [170, 150]]) wheelTop(g, x, y, 40, c.wood);
      for (const s of [-1, 1]) { poly(g, [[100 + s * 46, 70], [100 + s * 46, 110], [100 + s * 14, 94]]); paint(g, litFill(g, 54, 70, 92, 40, shade(c.wood, 0.1), 0.25), INK, 1.6); }
      rr(g, 54, 86, 92, 14, 6); paint(g, litFill(g, 54, 86, 92, 14, c.metal, 0.35), INK, LW);
      rr(g, 93, 52, 14, 120, 5); paint(g, litFill(g, 93, 52, 14, 120, shade(c.wood, 0.1), 0.25), INK, LW);
      circle(g, 100, 52, 20); paint(g, domeFill(g, 100, 52, 20, shade(c.wood, -0.25), 0.3), INK, LW);
      circle(g, 100, 52, 14); paint(g, shade(c.wood, -0.5), INK, 1.2);
      if (f.loaded) stone(g, 100, 52, 12, '#8a8073', r);
      for (const x of [70, 130]) { circle(g, x, 150, 7); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); g.strokeStyle = '#c9b48a'; g.lineWidth = 2.4; g.stroke(); }
    },
  },
  {
    id: 'battering-ram', name: 'Battering ram', cat: 'vehicle', sets: ['castle', 'camp', 'town'], tags: ['ram', 'battering ram', 'siege', 'gate', 'log', 'war machine', 'battlefield'],
    w: 3, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: '#55585e', roof: '#7a6a52' },
    variants: [...WOODS, { name: 'With hide roof', c: {}, f: { roof: 1 } }],
    desc: 'A huge iron-capped log slung in a wheeled frame. The crew swings it into a door or gate to batter it down.',
    draw: ({ g, w, c, f, seed }) => {
      const r = rng(seed);
      for (const x of [60, 150, 240]) for (const y of [12, 88]) wheelTop(g, x, y, 30, c.wood);
      for (const y of [18, 82]) board(g, 26, y - 6, 248, 12, shade(c.wood, -0.15), r, 'h');
      for (const x of [80, 220]) board(g, x - 6, 12, 12, 76, shade(c.wood, -0.1), r, 'v');
      rr(g, 10, 36, 250, 28, 13); paint(g, litFill(g, 10, 36, 250, 28, shade(c.wood, 0.05), 0.3), INK, LW);
      for (let i = 0; i < 4; i++) line(g, 20 + r() * 20, 41 + i * 6, 240 + r() * 15, 41 + i * 6, alpha(shade(c.wood, -0.5), 0.45), 0.9);
      poly(g, [[254, 34], [w - 6, 40], [w - 6, 60], [254, 66]]); paint(g, litFill(g, 254, 34, 40, 32, c.metal, 0.4), INK, LW);
      for (const x of [262, 278]) rivet(g, x, 50, 3, c.metal);
      for (const x of [80, 220]) strap(g, x - 4, 34, 8, 32, c.metal, false);
      if (f.roof) {
        poly(g, [[30, 4], [266, 4], [266, 96], [30, 96]]);
        paint(g, alpha(c.roof, 0.82), INK, LW);
        line(g, 30, 50, 266, 50, alpha(shade(c.roof, -0.5), 0.9), 2.4);
        for (let x = 50; x < 266; x += 30) { line(g, x, 6, x, 94, alpha(shade(c.roof, -0.4), 0.5), 1.2); }
      }
    },
  },
  {
    id: 'siege-tower', name: 'Siege tower', cat: 'vehicle', sets: ['castle', 'camp', 'town'], tags: ['siege tower', 'belfry', 'tower', 'wheels', 'walls', 'assault', 'war machine', 'battlefield'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { wood: WOOD.oak, hide: '#8a7050' },
    variants: [...WOODS, { name: 'Hide-covered', c: { wood: '#7a5a3a' }, f: { hide: 1 } }],
    desc: 'A tall rolling tower that is pushed up to a wall. Its front drops as a bridge onto the battlements.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (const [x, y] of [[10, 40], [10, 140], [190, 40], [190, 140]]) wheelTop(g, x, y, 36, c.wood);
      rr(g, 16, 16, 168, 168, 4);
      g.save(); rr(g, 16, 16, 168, 168, 4); g.clip();
      for (let i = 0; i < 12; i++) board(g, 16, 16 + i * 14, 168, 14, shade(c.wood, (r() - 0.5) * 0.15), r, 'h', 1);
      if (f.hide) { g.fillStyle = alpha(c.hide, 0.55); g.fillRect(16, 16, 168, 168); for (let i = 0; i < 20; i++) { circle(g, 20 + r() * 160, 20 + r() * 160, 1.6); g.fillStyle = '#3a2a1c'; g.fill(); } }
      g.restore();
      rr(g, 16, 16, 168, 168, 4); g.strokeStyle = INK; g.lineWidth = LW * 1.4; g.stroke();
      for (const [x, y] of [[16, 16], [168, 16], [16, 168], [168, 168]]) { rr(g, x, y, 16, 16, 2); paint(g, litFill(g, x, y, 16, 16, shade(c.wood, -0.3), 0.3), INK, 1.4); }
      rr(g, 60, 150, 80, 34, 2); paint(g, litFill(g, 60, 150, 80, 34, shade(c.wood, 0.1), 0.2), INK, LW);
      for (let x = 66; x < 138; x += 10) line(g, x, 152, x, 182, alpha(shade(c.wood, -0.5), 0.6), 1.2);
      rr(g, 76, 70, 48, 48, 2); paint(g, '#120e0b', INK, 1.6);
      for (let y = 76; y < 116; y += 9) line(g, 82, y, 118, y, '#8a5a34', 2.4);
    },
  },
  {
    id: 'gallows', name: 'Gallows', cat: 'structure', sets: ['town', 'castle', 'camp', 'market'], tags: ['gallows', 'execution', 'scaffold', 'noose', 'platform', 'hanging', 'town square'],
    w: 2, h: 2, blocksMovement: true, c: { wood: '#5c3a20', rope: '#c9b48a' },
    variants: [{ name: 'Dark wood', c: {} }, { name: 'Weathered', c: { wood: '#8a7a64' } }, { name: 'Oak', c: { wood: WOOD.oak } }],
    desc: 'A raised scaffold with a crossbeam, a trapdoor and steps up one side. A grim town landmark.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 14, 14, 172, 132, 3);
      g.save(); rr(g, 14, 14, 172, 132, 3); g.clip();
      for (let i = 0; i < 11; i++) board(g, 14 + i * 16, 14, 16, 132, shade(c.wood, (r() - 0.5) * 0.14), r, 'v', 1);
      g.restore();
      rr(g, 14, 14, 172, 132, 3); g.strokeStyle = INK; g.lineWidth = LW * 1.3; g.stroke();
      rr(g, 76, 60, 48, 40, 1); paint(g, litFill(g, 76, 60, 48, 40, shade(c.wood, -0.3), 0.2), INK, 1.6);
      line(g, 100, 60, 100, 100, INK, 1.4);
      for (let i = 0; i < 4; i++) board(g, 60, 146 + i * 12, 80, 12, shade(c.wood, 0.05 - i * 0.04), r, 'h', 1.5);
      board(g, 30, 34, 140, 14, shade(c.wood, -0.1), r, 'h');
      for (const x of [30, 160]) { rr(g, x - 2, 30, 14, 22, 2); paint(g, litFill(g, x - 2, 30, 14, 22, shade(c.wood, -0.25), 0.3), INK, 1.4); }
      line(g, 100, 41, 100, 68, INK, 3.6); line(g, 100, 41, 100, 68, c.rope, 2);
      circle(g, 100, 74, 7); g.strokeStyle = INK; g.lineWidth = 3.6; g.stroke(); g.strokeStyle = c.rope; g.lineWidth = 2; g.stroke();
      rr(g, 150, 100, 20, 30, 2); paint(g, litFill(g, 150, 100, 20, 30, '#55585e', 0.3), INK, 1.2);
      line(g, 158, 100, 158, 112, INK, 2);
    },
  },
  {
    id: 'war-banner', name: 'War banner', cat: 'decor', sets: ['camp', 'castle', 'town', 'temple', 'forest'], tags: ['banner', 'standard', 'flag', 'war', 'army', 'rally', 'pole', 'tent', 'battlefield'],
    w: 1, h: 1, c: { cloth: CLOTH.red, trim: '#e2b84a', wood: '#5c3a20' },
    variants: [{ name: 'Red', c: {} }, { name: 'Blue', c: { cloth: CLOTH.blue } }, { name: 'Green', c: { cloth: CLOTH.green, trim: '#c9ced3' } }, { name: 'Black', c: { cloth: CLOTH.black, trim: '#c0392b' } }],
    desc: 'A tall pole flying a war standard, planted to mark a camp, a rally point or a commander.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU + 0.5; line(g, 30, 50, 30 + Math.cos(a) * 18, 50 + Math.sin(a) * 18, INK, 4.4); line(g, 30, 50, 30 + Math.cos(a) * 18, 50 + Math.sin(a) * 18, c.wood, 2.6); }
      g.beginPath(); g.moveTo(32, 40); g.bezierCurveTo(52, 30, 66, 46, 92, 38); g.lineTo(84, 50); g.lineTo(92, 62); g.bezierCurveTo(66, 70, 52, 54, 32, 60); g.closePath();
      paint(g, litFill(g, 32, 30, 60, 40, c.cloth, 0.3), INK, LW);
      g.save(); g.clip(); for (const x of [48, 66]) { const gr = g.createLinearGradient(x - 5, 0, x + 5, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.28)'); gr.addColorStop(1, 'rgba(255,255,255,0.08)'); g.fillStyle = gr; g.fillRect(x - 5, 28, 10, 44); } g.restore();
      line(g, 34, 46, 80, 44, alpha(c.trim, 0.9), 1.6); line(g, 34, 54, 80, 56, alpha(c.trim, 0.9), 1.6);
      circle(g, 54, 50, 5); paint(g, c.trim, INK, 1);
      line(g, 30, 34, 30, 66, INK, 4.4); line(g, 30, 34, 30, 66, c.trim, 2.6);
      circle(g, 30, 50, 7); paint(g, domeFill(g, 30, 50, 7, c.wood, 0.4), INK, 1.4);
      circle(g, 30, 50, 3); paint(g, domeFill(g, 30, 50, 3, c.trim, 0.5), INK, 0.8);
      void r;
    },
  },
  {
    id: 'campfire-cold', name: 'Burnt-out campfire', cat: 'decor', sets: ['camp', 'forest', 'cave', 'desert', 'winter', 'dungeon'], tags: ['campfire', 'burnt out', 'cold', 'ashes', 'firepit', 'abandoned', 'tracks', 'clue'],
    w: 1, h: 1, layer: 'floor', c: { stone: '#8a8780', ash: '#6e6862' },
    variants: [{ name: 'Cold ashes', c: {} }, { name: 'Still smoking', c: {}, f: { smoke: 1 } }, { name: 'Snowy', c: { stone: '#a8b4bc', ash: '#d8dde0' } }],
    desc: 'A ring of stones around cold ashes and charred sticks. Still smoking means someone left in a hurry.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 50, 30, 0.3, 10, r));
      paint(g, alpha(c.ash, 0.9), null);
      speckle(g, 26, 26, 48, 48, r, 18, alpha('#1a1714', 0.6), 1.6);
      for (let i = 0; i < 4; i++) { const a = r() * Math.PI; plank(g, 50 + (r() - 0.5) * 10, 50 + (r() - 0.5) * 10, 30 + r() * 10, 7, a, '#2b211b', r); }
      for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU + r() * 0.2; stone(g, 50 + Math.cos(a) * 36, 50 + Math.sin(a) * 36, 7 + r() * 2, c.stone, r); }
      if (f.smoke) puffs(g, 30, 14, 46, 46, '#9a9690', r, 4, 0.5);
    },
  },
];

/** Every object in the items pack, in browser order. */
export const ITEM_OBJECTS: ObjDef[] = [...FIRE, ...ENV, ...TRAPS, ...MECH, ...LOOT, ...MAGIC, ...SIEGE];

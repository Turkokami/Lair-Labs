// More map objects: lighting, furniture and dungeon dressing added for the 3D view. Same rules as the other sets:
// original art drawn in code, 1 square = 100 art units, ids are stable once saved maps use them.
// Top-down, light from the top-left, ink outline. Wall-mounted pieces put the wall along the TOP edge of their box.
// Every object here has a matching 3D model in src/view3d/models-extra.ts, keyed by the same id.
import type { ObjDef, G } from '../art/types';
import {
  rng, rr, circle, ellipse, poly, blob, lumpy, litFill, domeFill, paint, line, bevel, speckle, cloth, gem, glow, flame,
  book, bottle, candle, scroll, ringPull, rivet, strap, stone, shade, mix, alpha, INK, LW, WOOD, METAL, STONE, CLOTH, vars,
} from '../art/kit';

type R = () => number;
const TAU = Math.PI * 2;
const CANDLE = '#ffcf70';
const TORCH = '#ff9a40';
const LAMP = '#ffc46b';
const WAX = '#efe4c8';
const BONE = '#e4dcc4';

const WV = [
  { name: 'Oak', c: { wood: WOOD.oak } },
  { name: 'Walnut', c: { wood: WOOD.walnut } },
  { name: 'Pine', c: { wood: WOOD.pine } },
  { name: 'Ebony', c: { wood: WOOD.ebony } },
];
const MV = [
  { name: 'Brass', c: { metal: METAL.brass } },
  { name: 'Iron', c: { metal: METAL.iron } },
  { name: 'Gold', c: { metal: METAL.gold } },
  { name: 'Silver', c: { metal: METAL.silver } },
];
const STONES = vars('stone', { grey: STONE.grey, marble: STONE.marble, dark: STONE.dark, sand: STONE.sand }, { grey: 'Grey stone', marble: 'Marble', dark: 'Dark stone', sand: 'Sandstone' });
const CLOTHS = (key: string) => [
  { name: 'Red', c: { [key]: CLOTH.red } },
  { name: 'Blue', c: { [key]: CLOTH.blue } },
  { name: 'Green', c: { [key]: CLOTH.green } },
  { name: 'Purple', c: { [key]: CLOTH.purple } },
];
const BOOKS = ['#7a2a22', '#2f4f6f', '#3e5e34', '#6b4a2b', '#5a3a6a', '#a07a2a', '#2b2b30', '#8a5a3a'];

// ---------------------------------------------------------------- drawing helpers

function fgrain(g: G, x: number, y: number, w: number, h: number, base: string, r: R, dir: 'h' | 'v', n: number) {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.lineWidth = 0.9;
  const across = dir === 'h' ? h : w, len = dir === 'h' ? w : h;
  for (let i = 0; i < n; i++) {
    const o = ((i + 0.5) / n) * across + (r() - 0.5) * 2;
    const a = (r() - 0.5) * 3.5, b = (r() - 0.5) * 3.5;
    g.strokeStyle = alpha(shade(base, -0.45), 0.25 + r() * 0.3);
    g.beginPath();
    if (dir === 'h') { g.moveTo(x, y + o); g.bezierCurveTo(x + len * 0.33, y + o + a, x + len * 0.66, y + o + b, x + len, y + o); }
    else { g.moveTo(x + o, y); g.bezierCurveTo(x + o + a, y + len * 0.33, x + o + b, y + len * 0.66, x + o, y + len); }
    g.stroke();
  }
  g.restore();
}

function boards(g: G, x: number, y: number, w: number, h: number, base: string, r: R, dir: 'h' | 'v', n: number) {
  const across = dir === 'h' ? h : w;
  const s = across / n;
  for (let i = 0; i < n; i++) {
    const tone = shade(base, (r() - 0.5) * 0.16);
    const bx = dir === 'h' ? x : x + i * s, by = dir === 'h' ? y + i * s : y;
    const bw = dir === 'h' ? w : s, bh = dir === 'h' ? s : h;
    g.fillStyle = litFill(g, bx, by, bw, bh, tone, 0.1);
    g.fillRect(bx, by, bw, bh);
    fgrain(g, bx, by, bw, bh, tone, r, dir, s > 13 ? 3 : 2);
    if (i) {
      if (dir === 'h') line(g, x, by, x + w, by, alpha(shade(base, -0.65), 0.8), 1.1);
      else line(g, bx, y, bx, y + h, alpha(shade(base, -0.65), 0.8), 1.1);
    }
  }
}

function sheen(g: G, x: number, y: number, w: number, h: number, a = 0.14) {
  const gr = g.createLinearGradient(x, y, x + w * 0.6, y + h);
  gr.addColorStop(0, `rgba(255,255,255,${a})`);
  gr.addColorStop(0.5, 'rgba(255,255,255,0)');
  gr.addColorStop(1, `rgba(0,0,0,${a * 1.4})`);
  g.fillStyle = gr;
  g.fillRect(x, y, w, h);
}

function stroke(g: G, color: string | CanvasGradient = INK, lw = LW) {
  g.strokeStyle = color;
  g.lineWidth = lw;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.stroke();
}

/** A planked wooden surface with bevel and outline. */
function panel(g: G, x: number, y: number, w: number, h: number, base: string, r: R, dir?: 'h' | 'v', n = 0, rad = 3, lw = LW) {
  const d = dir ?? (w >= h ? 'h' : 'v');
  const across = d === 'h' ? h : w;
  const k = n || Math.max(1, Math.round(across / 20));
  g.save();
  rr(g, x, y, w, h, rad);
  g.clip();
  boards(g, x, y, w, h, base, r, d, k);
  sheen(g, x, y, w, h);
  g.restore();
  bevel(g, x, y, w, h, rad, 0.22);
  rr(g, x, y, w, h, rad);
  stroke(g, INK, lw);
}

/** A round planked top. */
function roundPanel(g: G, cx: number, cy: number, rad: number, base: string, r: R, n = 0) {
  const k = n || Math.max(2, Math.round((rad * 2) / 20));
  g.save();
  circle(g, cx, cy, rad);
  g.clip();
  boards(g, cx - rad, cy - rad, rad * 2, rad * 2, base, r, 'h', k);
  const gr = g.createRadialGradient(cx - rad * 0.35, cy - rad * 0.4, rad * 0.1, cx, cy, rad);
  gr.addColorStop(0, 'rgba(255,255,255,0.16)');
  gr.addColorStop(0.6, 'rgba(255,255,255,0)');
  gr.addColorStop(1, 'rgba(0,0,0,0.3)');
  g.fillStyle = gr;
  g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  g.restore();
  circle(g, cx, cy, rad - 2.5);
  stroke(g, 'rgba(255,255,255,0.16)', 1.2);
  circle(g, cx, cy, rad);
  stroke(g, INK, LW);
}

/** Plain solid shape: rounded rect, lit, outlined. */
function box(g: G, x: number, y: number, w: number, h: number, col: string, rad = 3, lw = LW, k = 0.2) {
  rr(g, x, y, w, h, rad);
  paint(g, litFill(g, x, y, w, h, col, k), INK, lw);
}

/** A soft padded shape (cushion, seat, mattress). */
function pad(g: G, x: number, y: number, w: number, h: number, col: string, rad = 8, lw = 1.3) {
  rr(g, x, y, w, h, rad);
  paint(g, domeFill(g, x + w / 2, y + h / 2, Math.max(w, h) * 0.6, col, 0.3), INK, lw);
}

/** A seat with a backrest at the top (rot turns it). */
function chairAt(g: G, cx: number, cy: number, s: number, rot: number, wood: string, r: R, cushion?: string) {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  panel(g, -s * 0.4, -s * 0.34, s * 0.8, s * 0.76, wood, r, 'v', 3, 4, LW * 0.9);
  if (cushion) {
    rr(g, -s * 0.31, -s * 0.24, s * 0.62, s * 0.56, s * 0.12);
    paint(g, domeFill(g, 0, s * 0.04, s * 0.4, cushion, 0.35), INK, 1.1);
  }
  rr(g, -s * 0.47, -s * 0.52, s * 0.94, s * 0.2, 3);
  paint(g, litFill(g, -s * 0.47, -s * 0.52, s * 0.94, s * 0.2, shade(wood, -0.08), 0.25), INK, LW * 0.9);
  for (const px of [-s * 0.4, s * 0.4]) {
    circle(g, px, -s * 0.42, s * 0.075);
    paint(g, domeFill(g, px, -s * 0.42, s * 0.075, shade(wood, 0.1), 0.4), INK, 1);
  }
  g.restore();
}

/** Books standing on a shelf seen from above. */
function bookRow(g: G, x: number, y: number, w: number, d: number, r: R) {
  let xx = x;
  while (xx < x + w - 4) {
    const bw = 3.5 + r() * 5;
    if (r() < 0.08) { xx += bw; continue; }
    const bd = d * (0.65 + r() * 0.35);
    const col = BOOKS[Math.floor(r() * BOOKS.length)];
    g.fillStyle = litFill(g, xx, y, bw, bd, col, 0.25);
    g.fillRect(xx, y + (d - bd), Math.min(bw, x + w - xx), bd);
    g.strokeStyle = alpha(INK, 0.8);
    g.lineWidth = 0.7;
    g.strokeRect(xx, y + (d - bd), Math.min(bw, x + w - xx), bd);
    xx += bw;
  }
}

/** A shelf case seen from above (books face the bottom edge). */
function shelfCase(g: G, x: number, y: number, w: number, d: number, wood: string, r: R, fillRow: (ix: number, iy: number, iw: number, id: number) => void) {
  rr(g, x, y, w, d, 2);
  paint(g, litFill(g, x, y, w, d, shade(wood, -0.3), 0.2), INK, LW);
  const t = 5;
  g.save();
  g.beginPath();
  g.rect(x + t, y + t, w - 2 * t, d - 2 * t);
  g.clip();
  g.fillStyle = '#1e140d';
  g.fillRect(x + t, y + t, w - 2 * t, d - 2 * t);
  fillRow(x + t, y + t, w - 2 * t, d - 2 * t);
  g.restore();
  const rim = (bx: number, by: number, bw: number, bh: number) => {
    rr(g, bx, by, bw, bh, 1);
    paint(g, litFill(g, bx, by, bw, bh, wood, 0.25), INK, 1.1);
  };
  rim(x, y, w, t);
  rim(x, y + d - t, w, t);
  rim(x, y, t, d);
  rim(x + w - t, y, t, d);
  rr(g, x, y, w, d, 2);
  stroke(g, INK, LW);
}

function chain(g: G, x1: number, y1: number, x2: number, y2: number, metal: string, s = 3) {
  const L = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.round(L / (s * 1.7))), a = Math.atan2(y2 - y1, x2 - x1);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
    ellipse(g, x, y, s, i % 2 ? s * 0.4 : s * 0.62, a);
    if (i % 2) { g.fillStyle = shade(metal, -0.2); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); }
    else { g.strokeStyle = INK; g.lineWidth = 2.6; g.stroke(); g.strokeStyle = shade(metal, 0.2); g.lineWidth = 1.3; g.stroke(); }
  }
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

/** A thick metal bar (ink edge, lit core). */
function bar(g: G, x1: number, y1: number, x2: number, y2: number, metal: string, w = 3.6) {
  line(g, x1, y1, x2, y2, INK, w + 2);
  line(g, x1, y1, x2, y2, shade(metal, 0.1), w);
}

/** A metal hoop seen from above. */
function hoop(g: G, cx: number, cy: number, rad: number, metal: string, w = 5) {
  circle(g, cx, cy, rad);
  stroke(g, INK, w + 2.6);
  circle(g, cx, cy, rad);
  stroke(g, litFill(g, cx - rad, cy - rad, rad * 2, rad * 2, metal, 0.4), w);
}

/** A small candle flame, as on the candelabra. */
function wick(g: G, x: number, y: number, s = 1, col = '#ffb347') {
  glow(g, x, y, 12 * s, col, 0.5);
  ellipse(g, x + 0.5, y - 1, 2 * s, 3 * s, 0.3);
  paint(g, '#ffd166', alpha('#c2410c', 0.9), 0.8);
}

/** A candle in a metal cup. */
function cupCandle(g: G, x: number, y: number, metal: string, wax: string, s = 1) {
  circle(g, x, y, 8 * s);
  paint(g, domeFill(g, x, y, 8 * s, metal, 0.5), INK, 1.2);
  circle(g, x, y, 5 * s);
  paint(g, domeFill(g, x, y, 5 * s, wax, 0.35), INK, 0.9);
  wick(g, x, y, s);
}

function fireCols(fire: string): [string, string, string] {
  return fire.toLowerCase() === '#ffb02e' ? ['#fff3b0', '#ffb02e', '#e2481b'] : [mix(fire, '#ffffff', 0.75), fire, shade(fire, -0.45)];
}
function fireAt(g: G, cx: number, cy: number, rad: number, r: R, fire = '#ffb02e') {
  const [a, b, c] = fireCols(fire);
  flame(g, cx, cy, rad, r, a, b, c);
}

/** Glass seen from above: pale fill with a couple of glints. */
function glass(g: G, x: number, y: number, w: number, h: number, tint = '#bcd6e0', rad = 2) {
  rr(g, x, y, w, h, rad);
  const gr = g.createLinearGradient(x, y, x + w, y + h);
  gr.addColorStop(0, alpha(shade(tint, 0.4), 0.85));
  gr.addColorStop(0.5, alpha(tint, 0.7));
  gr.addColorStop(1, alpha(shade(tint, -0.3), 0.85));
  paint(g, gr, INK, 1.2);
  g.save();
  rr(g, x, y, w, h, rad);
  g.clip();
  for (const k of [0.25, 0.42]) line(g, x + w * k, y + h, x + w * k + h * 0.6, y, 'rgba(255,255,255,0.45)', 1.4);
  g.restore();
}

/** The front edge of a cabinet with drawer splits and pulls, along the bottom of a top panel. */
function drawerStrip(g: G, x: number, y: number, w: number, h: number, wood: string, metal: string, n: number) {
  rr(g, x, y, w, h, 2);
  paint(g, litFill(g, x, y, w, h, shade(wood, -0.18), 0.3), INK, 1.5);
  for (let i = 0; i < n; i++) {
    const cx = x + (i + 0.5) * (w / n);
    if (i) line(g, x + i * (w / n), y, x + i * (w / n), y + h, INK, 1);
    rr(g, cx - 5, y + h / 2 - 2, 10, 4, 2);
    paint(g, metal, INK, 0.8);
  }
}

/** A crystal shard seen from above. */
function shard(g: G, cx: number, cy: number, len: number, wid: number, rot: number, col: string) {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  const pts = [[-len * 0.5, 0], [-len * 0.2, -wid], [len * 0.35, -wid * 0.8], [len * 0.5, 0], [len * 0.35, wid * 0.8], [-len * 0.2, wid]];
  poly(g, pts);
  paint(g, litFill(g, -len / 2, -wid, len, wid * 2, col, 0.45), shade(col, -0.6), 1.1);
  line(g, -len * 0.45, 0, len * 0.45, 0, alpha('#ffffff', 0.55), 1);
  g.restore();
}

/** A bone: a shaft with knobbed ends. */
function boneAt(g: G, x1: number, y1: number, x2: number, y2: number, wid = 4, col = BONE) {
  line(g, x1, y1, x2, y2, INK, wid + 2.2);
  line(g, x1, y1, x2, y2, col, wid);
  for (const [x, y] of [[x1, y1], [x2, y2]]) {
    circle(g, x, y, wid * 0.75);
    paint(g, domeFill(g, x, y, wid * 0.75, col, 0.3), INK, 0.9);
  }
}

function skull(g: G, cx: number, cy: number, s: number, rot = 0, col = BONE) {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  ellipse(g, 0, 0, s, s * 1.15);
  paint(g, domeFill(g, 0, 0, s, col, 0.35), INK, 1.3);
  for (const k of [-1, 1]) {
    ellipse(g, k * s * 0.38, s * 0.25, s * 0.26, s * 0.3);
    g.fillStyle = '#2a2018';
    g.fill();
  }
  rr(g, -s * 0.35, s * 0.72, s * 0.7, s * 0.3, 2);
  paint(g, shade(col, -0.1), INK, 0.9);
  g.restore();
}

/** A bundle of something hanging, seen from above: a tied knot and a fan of stems. */
function bundle(g: G, cx: number, cy: number, s: number, col: string, r: R) {
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + r() * 0.5;
    line(g, cx, cy, cx + Math.cos(a) * s, cy + Math.sin(a) * s, INK, 3.6);
    line(g, cx, cy, cx + Math.cos(a) * s, cy + Math.sin(a) * s, shade(col, (r() - 0.5) * 0.3), 2);
    ellipse(g, cx + Math.cos(a) * s, cy + Math.sin(a) * s, 3.4, 2, a);
    paint(g, shade(col, 0.15), INK, 0.7);
  }
  circle(g, cx, cy, 3.4);
  paint(g, '#b89a6a', INK, 1);
}

/** Crate lid seen from above. */
function crateLid(g: G, x: number, y: number, s: number, wood: string, r: R) {
  panel(g, x, y, s, s, wood, r, 'h', 4, 2);
  const t = s * 0.14;
  for (const [bx, by, bw, bh] of [[x, y, s, t], [x, y + s - t, s, t], [x, y, t, s], [x + s - t, y, t, s]]) {
    rr(g, bx, by, bw, bh, 1);
    paint(g, litFill(g, bx, by, bw, bh, shade(wood, -0.15), 0.25), INK, 1.1);
  }
  line(g, x + t, y + t, x + s - t, y + s - t, INK, t * 0.75 + 2);
  line(g, x + t, y + t, x + s - t, y + s - t, shade(wood, -0.1), t * 0.75);
  for (const [px, py] of [[x + t / 2, y + t / 2], [x + s - t / 2, y + t / 2], [x + t / 2, y + s - t / 2], [x + s - t / 2, y + s - t / 2]]) rivet(g, px, py, 1.6, METAL.iron);
}

/** Barrel top seen from above. */
function barrelTop(g: G, cx: number, cy: number, rad: number, wood: string, r: R) {
  circle(g, cx, cy, rad);
  paint(g, domeFill(g, cx, cy, rad, shade(wood, -0.1), 0.3), INK, LW);
  circle(g, cx, cy, rad * 0.84);
  stroke(g, METAL.iron, 2.6);
  g.save();
  circle(g, cx, cy, rad * 0.78);
  g.clip();
  boards(g, cx - rad, cy - rad, rad * 2, rad * 2, wood, r, 'v', 5);
  g.restore();
  circle(g, cx, cy, rad * 0.78);
  stroke(g, INK, 1.2);
  circle(g, cx + rad * 0.3, cy, rad * 0.1);
  paint(g, shade(wood, -0.5), INK, 0.8);
}

// ---------------------------------------------------------------- lighting

const LIGHTS: ObjDef[] = [
  {
    id: 'chandelier-tiered', name: 'Tiered chandelier', cat: 'light', sets: ['castle', 'tavern', 'temple', 'town'], tags: ['chandelier', 'candles', 'hanging', 'ceiling', 'grand', 'ballroom', 'overhead'],
    w: 2, h: 2, layer: 'overhead', light: { bright: 20, dim: 20, color: CANDLE }, c: { metal: METAL.brass, wax: WAX }, variants: MV,
    desc: 'Two rings of candles, one above the other. Hangs above the room; tokens pass underneath.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 100, 100, 99, '#ffcf7a', 0.35);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.26;
        bar(g, 100, 100, 100 + Math.cos(a) * 72, 100 + Math.sin(a) * 72, c.metal, 2.4);
      }
      hoop(g, 100, 100, 72, c.metal, 5);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU;
        cupCandle(g, 100 + Math.cos(a) * 72, 100 + Math.sin(a) * 72, c.metal, c.wax, 0.95);
      }
      hoop(g, 100, 100, 40, shade(c.metal, 0.1), 4.4);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.5;
        cupCandle(g, 100 + Math.cos(a) * 40, 100 + Math.sin(a) * 40, c.metal, c.wax, 0.85);
      }
      circle(g, 100, 100, 13);
      paint(g, domeFill(g, 100, 100, 13, c.metal, 0.55), INK, 1.5);
      candle(g, 100, 100, 6, r, c.wax);
    },
  },
  {
    id: 'chandelier-crystal', name: 'Crystal chandelier', cat: 'light', sets: ['castle', 'town', 'temple', 'wizard'], tags: ['chandelier', 'crystal', 'prisms', 'hanging', 'ceiling', 'noble', 'ballroom', 'overhead'],
    w: 2, h: 2, layer: 'overhead', light: { bright: 20, dim: 20, color: '#ffe6b0' }, c: { metal: METAL.silver, crystal: '#bfe6ff', wax: WAX },
    variants: [
      { name: 'Clear', c: {} }, { name: 'Gold and clear', c: { metal: METAL.gold } },
      { name: 'Rose', c: { crystal: '#ffc2dc' } }, { name: 'Amber', c: { metal: METAL.brass, crystal: '#ffd98a' } },
    ],
    desc: 'Rings of hanging prisms around a crown of candles. Hangs above the room.',
    draw: ({ g, c }) => {
      glow(g, 100, 100, 99, mix(c.crystal, '#fff1c8', 0.5), 0.4);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        bar(g, 100, 100, 100 + Math.cos(a) * 66, 100 + Math.sin(a) * 66, c.metal, 2);
      }
      hoop(g, 100, 100, 66, c.metal, 3.6);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU + 0.2;
        gem(g, 100 + Math.cos(a) * 80, 100 + Math.sin(a) * 80, 5.5, c.crystal);
        line(g, 100 + Math.cos(a) * 66, 100 + Math.sin(a) * 66, 100 + Math.cos(a) * 75, 100 + Math.sin(a) * 75, alpha(c.metal, 0.9), 1);
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + 0.39;
        cupCandle(g, 100 + Math.cos(a) * 66, 100 + Math.sin(a) * 66, c.metal, c.wax, 0.8);
      }
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU;
        gem(g, 100 + Math.cos(a) * 40, 100 + Math.sin(a) * 40, 6.5, c.crystal);
      }
      hoop(g, 100, 100, 26, c.metal, 3);
      gem(g, 100, 100, 15, c.crystal);
    },
  },
  {
    id: 'chandelier-wheel', name: 'Wagon-wheel chandelier', cat: 'light', sets: ['tavern', 'farm', 'town', 'camp', 'castle'], tags: ['chandelier', 'wheel', 'rustic', 'candles', 'hanging', 'inn', 'overhead'],
    w: 2, h: 2, layer: 'overhead', light: { bright: 15, dim: 15, color: CANDLE }, c: { wood: WOOD.oak, metal: METAL.iron, wax: WAX }, variants: WV,
    desc: 'An old cart wheel hung flat on chains, candles round the rim. Hangs above the room.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 100, 100, 98, '#ffcf7a', 0.32);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        line(g, 100, 100, 100 + Math.cos(a) * 68, 100 + Math.sin(a) * 68, INK, 8);
        line(g, 100, 100, 100 + Math.cos(a) * 68, 100 + Math.sin(a) * 68, shade(c.wood, 0.05), 5.6);
      }
      circle(g, 100, 100, 70);
      stroke(g, INK, 17);
      circle(g, 100, 100, 70);
      stroke(g, litFill(g, 30, 30, 140, 140, c.wood, 0.3), 13);
      circle(g, 100, 100, 70);
      stroke(g, alpha(shade(c.wood, -0.5), 0.5), 1);
      circle(g, 100, 100, 77);
      stroke(g, c.metal, 2);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU + 0.5;
        chain(g, 100 + Math.cos(a) * 66, 100 + Math.sin(a) * 66, 100, 100, c.metal, 2.4);
      }
      circle(g, 100, 100, 16);
      paint(g, domeFill(g, 100, 100, 16, shade(c.wood, -0.1), 0.4), INK, 1.6);
      circle(g, 100, 100, 6);
      paint(g, domeFill(g, 100, 100, 6, c.metal, 0.5), INK, 1);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + TAU / 16;
        candle(g, 100 + Math.cos(a) * 70, 100 + Math.sin(a) * 70, 6, r, c.wax);
      }
    },
  },
  {
    id: 'chandelier-antler', name: 'Antler chandelier', cat: 'light', sets: ['castle', 'tavern', 'forest', 'winter', 'camp'], tags: ['chandelier', 'antlers', 'hunting lodge', 'rustic', 'candles', 'hanging', 'overhead'],
    w: 2, h: 2, layer: 'overhead', light: { bright: 15, dim: 15, color: CANDLE }, c: { bone: '#d6c7a3', wax: WAX },
    variants: [{ name: 'Pale antler', c: {} }, { name: 'Dark antler', c: { bone: '#8a6a4a' } }, { name: 'Bleached', c: { bone: '#ece4d0' } }, { name: 'Black candles', c: { wax: '#3a3438' } }],
    desc: 'Shed antlers bound into a crown, candles on the tines. Hangs above the room.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 100, 100, 96, '#ffcf7a', 0.3);
      const tips: number[][] = [];
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU - Math.PI / 2;
        const bend = 0.45;
        const ex = 100 + Math.cos(a) * 74, ey = 100 + Math.sin(a) * 74;
        const qx = 100 + Math.cos(a - bend) * 50, qy = 100 + Math.sin(a - bend) * 50;
        for (const [col, wdt] of [[INK, 10], [c.bone, 7]] as [string, number][]) {
          g.beginPath();
          g.moveTo(100, 100);
          g.quadraticCurveTo(qx, qy, ex, ey);
          stroke(g, col, wdt);
        }
        const mx = 100 + Math.cos(a - bend * 0.6) * 46, my = 100 + Math.sin(a - bend * 0.6) * 46;
        const tx = 100 + Math.cos(a + 0.35) * 64, ty = 100 + Math.sin(a + 0.35) * 64;
        line(g, mx, my, tx, ty, INK, 7);
        line(g, mx, my, tx, ty, shade(c.bone, 0.08), 4.4);
        tips.push([ex, ey], [tx, ty]);
        for (let k = 0; k < 3; k++) {
          const t = 0.3 + k * 0.2;
          circle(g, 100 + (ex - 100) * t, 100 + (ey - 100) * t, 1.1);
          g.fillStyle = alpha(shade(c.bone, -0.5), 0.7);
          g.fill();
        }
      }
      circle(g, 100, 100, 15);
      paint(g, domeFill(g, 100, 100, 15, shade(c.bone, -0.2), 0.4), INK, 1.6);
      line(g, 87, 96, 113, 104, '#7a5a30', 2.2);
      line(g, 87, 104, 113, 96, '#7a5a30', 2.2);
      for (const [x, y] of tips) candle(g, x, y, 5.5, r, c.wax);
    },
  },
  {
    id: 'candle-hoop', name: 'Hanging candle hoop', cat: 'light', sets: ['tavern', 'dungeon', 'crypt', 'castle', 'town', 'temple'], tags: ['chandelier', 'small', 'candles', 'hanging', 'ring', 'overhead'],
    w: 1, h: 1, layer: 'overhead', light: { bright: 10, dim: 10, color: CANDLE }, c: { metal: METAL.iron, wax: WAX },
    variants: [{ name: 'Iron', c: {} }, { name: 'Brass', c: { metal: METAL.brass } }, { name: 'Black iron', c: { metal: METAL.black } }, { name: 'Black candles', c: { wax: '#3a3438' } }],
    desc: 'A small iron hoop of candles on three chains, for a single room or corridor.',
    draw: ({ g, c }) => {
      glow(g, 50, 50, 50, '#ffcf7a', 0.35);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU - Math.PI / 2;
        chain(g, 50 + Math.cos(a) * 32, 50 + Math.sin(a) * 32, 50, 50, c.metal, 2.2);
      }
      hoop(g, 50, 50, 32, c.metal, 4);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + 0.3;
        cupCandle(g, 50 + Math.cos(a) * 32, 50 + Math.sin(a) * 32, c.metal, c.wax, 0.8);
      }
      ringPull(g, 50, 50, 5, c.metal);
    },
  },
  {
    id: 'candelabra-grand', name: 'Grand candelabra', cat: 'light', sets: ['castle', 'temple', 'crypt', 'wizard', 'town'], tags: ['candelabra', 'candles', 'standing', 'seven branch', 'tall', 'gothic'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 15, dim: 15, color: CANDLE }, c: { metal: METAL.brass, wax: WAX },
    variants: [...MV, { name: 'Black iron, black wax', c: { metal: METAL.black, wax: '#3a3438' } }],
    desc: 'A tall floor candelabra with seven candles on a fanned arm.',
    draw: ({ g, c }) => {
      glow(g, 50, 50, 50, '#ffb347', 0.4);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU + Math.PI / 2;
        bar(g, 50, 50, 50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30, shade(c.metal, -0.15), 4);
        circle(g, 50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30, 4);
        paint(g, domeFill(g, 50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30, 4, c.metal, 0.5), INK, 1);
      }
      g.beginPath();
      g.moveTo(14, 46);
      g.quadraticCurveTo(50, 64, 86, 46);
      stroke(g, INK, 7);
      g.beginPath();
      g.moveTo(14, 46);
      g.quadraticCurveTo(50, 64, 86, 46);
      stroke(g, shade(c.metal, 0.12), 4.4);
      for (let i = 0; i < 7; i++) {
        const t = i / 6, x = 14 + t * 72, y = 46 + 4 * t * (1 - t) * 9;
        cupCandle(g, x, y, c.metal, c.wax, i === 3 ? 0.95 : 0.75);
      }
    },
  },
  {
    id: 'wall-candelabra', name: 'Wall candelabra', cat: 'light', sets: ['castle', 'temple', 'crypt', 'town', 'tavern', 'wizard'], tags: ['sconce', 'candles', 'wall', 'bracket', 'light'],
    w: 1, h: 1, light: { bright: 10, dim: 10, color: CANDLE }, c: { metal: METAL.brass, wax: WAX },
    variants: [...MV.slice(0, 2), { name: 'Black iron', c: { metal: METAL.black } }, { name: 'Red candles', c: { wax: '#b8433a' } }],
    desc: 'Three candles on a branched wall bracket. Put the top edge of its square on a wall.',
    draw: ({ g, c }) => {
      rr(g, 34, 1, 32, 11, 3);
      paint(g, litFill(g, 34, 1, 32, 11, c.metal, 0.35), INK, 1.5);
      rivet(g, 40, 6.5, 2, c.metal);
      rivet(g, 60, 6.5, 2, c.metal);
      bar(g, 50, 10, 50, 28, c.metal, 3.4);
      g.beginPath();
      g.moveTo(22, 30);
      g.quadraticCurveTo(50, 40, 78, 30);
      stroke(g, INK, 6);
      g.beginPath();
      g.moveTo(22, 30);
      g.quadraticCurveTo(50, 40, 78, 30);
      stroke(g, shade(c.metal, 0.1), 3.6);
      for (const [x, y] of [[22, 30], [50, 35], [78, 30]]) cupCandle(g, x, y, c.metal, c.wax, 0.85);
    },
  },
  {
    id: 'oil-lamp-hanging', name: 'Hanging oil lamp', cat: 'light', sets: ['temple', 'town', 'desert', 'castle', 'wizard', 'tavern'], tags: ['lamp', 'oil', 'bowl', 'chains', 'hanging', 'ceiling', 'overhead'],
    w: 1, h: 1, layer: 'overhead', light: { bright: 15, dim: 15, color: LAMP }, c: { metal: METAL.brass },
    variants: [{ name: 'Brass', c: {} }, { name: 'Bronze', c: { metal: METAL.bronze } }, { name: 'Silver', c: { metal: METAL.silver } }, { name: 'Iron', c: { metal: METAL.iron } }],
    desc: 'A pierced metal bowl of oil with three wicks, hung from three chains.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 50, LAMP, 0.42);
      circle(g, 50, 50, 26);
      paint(g, domeFill(g, 50, 50, 26, c.metal, 0.45), INK, LW);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        circle(g, 50 + Math.cos(a) * 21, 50 + Math.sin(a) * 21, 1.6);
        g.fillStyle = alpha('#ffd37a', 0.9);
        g.fill();
      }
      circle(g, 50, 50, 15);
      paint(g, domeFill(g, 50, 50, 15, '#5a3a14', 0.3), INK, 1.2);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU + Math.PI / 6;
        chain(g, 50 + Math.cos(a) * 24, 50 + Math.sin(a) * 24, 50, 50, c.metal, 2);
        fireAt(g, 50 + Math.cos(a + Math.PI / 3) * 12, 50 + Math.sin(a + Math.PI / 3) * 12, 4.5, r);
      }
      ringPull(g, 50, 50, 4, c.metal);
    },
  },
  {
    id: 'lamp-table', name: 'Lamp table', cat: 'light', sets: ['tavern', 'town', 'castle', 'wizard', 'ship'], tags: ['oil lamp', 'side table', 'lamp', 'bedside', 'study'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 10, dim: 10, color: LAMP }, c: { wood: WOOD.walnut, metal: METAL.brass, light: '#ffcf70' },
    variants: [...WV.slice(0, 3), { name: 'Ghost-light', c: { wood: WOOD.ebony, metal: METAL.black, light: '#8dffb0' } }],
    desc: 'A small round table with an oil lamp burning on it.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      roundPanel(g, 50, 50, 34, c.wood, r, 3);
      glow(g, 50, 46, 40, c.light, 0.45);
      circle(g, 50, 46, 14);
      paint(g, domeFill(g, 50, 46, 14, c.metal, 0.5), INK, 1.4);
      circle(g, 50, 46, 8);
      paint(g, alpha(mix(c.light, '#ffffff', 0.5), 0.9), INK, 1.1);
      circle(g, 50, 46, 3);
      paint(g, '#fff6d0', null);
      book(g, 56, 62, 16, 12, '#2f4f6f', 0.3);
    },
  },
  {
    id: 'fire-bowl', name: 'Fire bowl', cat: 'light', sets: ['temple', 'castle', 'dungeon', 'desert', 'crypt'], tags: ['brazier', 'fire', 'pedestal', 'bowl', 'flame', 'basin'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 20, dim: 20, color: TORCH }, c: { metal: METAL.bronze, fire: '#ffb02e' },
    variants: [{ name: 'Bronze', c: {} }, { name: 'Iron', c: { metal: METAL.iron } }, { name: 'Stone', c: { metal: STONE.grey } }, { name: 'Gold', c: { metal: METAL.gold } }],
    desc: 'A wide bowl of fire on a waist-high pedestal.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 50, '#ff9a40', 0.45);
      circle(g, 50, 50, 38);
      paint(g, domeFill(g, 50, 50, 38, c.metal, 0.4), INK, LW);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        line(g, 50 + Math.cos(a) * 32, 50 + Math.sin(a) * 32, 50 + Math.cos(a) * 37, 50 + Math.sin(a) * 37, alpha(shade(c.metal, -0.5), 0.6), 1.2);
      }
      circle(g, 50, 50, 30);
      paint(g, '#2a1a12', INK, 1.4);
      for (let i = 0; i < 12; i++) {
        const a = r() * TAU, d = r() * 24;
        circle(g, 50 + Math.cos(a) * d, 50 + Math.sin(a) * d, 2.5 + r() * 3);
        paint(g, r() < 0.5 ? '#3a2219' : '#c2410c', null);
      }
      fireAt(g, 50, 50, 17, r, c.fire);
    },
  },
  {
    id: 'torch-standing', name: 'Standing torch', cat: 'light', sets: ['camp', 'forest', 'swamp', 'desert', 'dungeon', 'cave', 'temple'], tags: ['torch', 'pole', 'tiki', 'staked', 'path', 'fire'],
    w: 1, h: 1, light: { bright: 20, dim: 20, color: TORCH }, c: { wood: WOOD.oak, wrap: '#3a2a1c', fire: '#ffb02e' },
    variants: [{ name: 'Oak pole', c: {} }, { name: 'Pine pole', c: { wood: WOOD.pine } }, { name: 'Bone-bound', c: { wood: '#5a4a3a', wrap: BONE } }],
    desc: 'A torch on a tall pole driven into the ground.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      ellipse(g, 50, 54, 18, 14);
      g.fillStyle = 'rgba(40,28,18,0.35)';
      g.fill();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU;
        stone(g, 50 + Math.cos(a) * 17, 54 + Math.sin(a) * 13, 4.5, STONE.grey, r);
      }
      circle(g, 50, 50, 11);
      paint(g, domeFill(g, 50, 50, 11, c.wrap, 0.3), INK, 1.4);
      for (let i = -1; i <= 1; i++) line(g, 41, 50 + i * 4, 59, 50 + i * 4 + 2, alpha(shade(c.wrap, -0.5), 0.7), 1);
      fireAt(g, 50, 50, 15, r, c.fire);
    },
  },
  {
    id: 'crystal-lamp', name: 'Glow-crystal plinth', cat: 'light', sets: ['wizard', 'cave', 'temple', 'castle', 'mine'], tags: ['crystal', 'magic', 'glowing', 'light', 'gem', 'plinth', 'arcane'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 15, dim: 15, color: '#9fd8ff' }, c: { stone: STONE.dark, crystal: '#7fd6ff' },
    variants: [{ name: 'Blue', c: {} }, { name: 'Violet', c: { crystal: '#c08bff' } }, { name: 'Green', c: { crystal: '#6fe3a0' } }, { name: 'Amber', c: { crystal: '#ffc25a', stone: STONE.sand } }],
    desc: 'A cluster of glowing crystal on a carved stone plinth.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 16, 16, 68, 68, 5);
      paint(g, litFill(g, 16, 16, 68, 68, c.stone, 0.25), INK, LW);
      bevel(g, 16, 16, 68, 68, 5, 0.3);
      rr(g, 24, 24, 52, 52, 3);
      stroke(g, alpha(shade(c.stone, -0.6), 0.7), 1.2);
      glow(g, 50, 50, 48, c.crystal, 0.6);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + r() * 0.4;
        shard(g, 50 + Math.cos(a) * 11, 50 + Math.sin(a) * 11, 22 + r() * 8, 5.5, a, c.crystal);
      }
      shard(g, 50, 50, 20, 8, 0.8, shade(c.crystal, 0.2));
    },
  },
  {
    id: 'candle-ring', name: 'Ritual candle ring', cat: 'light', sets: ['temple', 'crypt', 'wizard', 'dungeon', 'swamp', 'forest'], tags: ['candles', 'ritual', 'circle', 'summoning', 'seance', 'chalk', 'floor'],
    w: 2, h: 2, layer: 'floor', flat: true, light: { bright: 10, dim: 10, color: CANDLE }, c: { wax: WAX, chalk: '#e8e2d2' },
    variants: [{ name: 'White wax', c: {} }, { name: 'Black wax', c: { wax: '#3a3438' } }, { name: 'Red wax, blood', c: { wax: '#b8433a', chalk: '#8a1c1c' } }, { name: 'Beeswax', c: { wax: '#e0b85a' } }],
    desc: 'A chalked circle ringed with candles on the floor. Tokens can stand in it.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      circle(g, 100, 100, 72);
      stroke(g, alpha(c.chalk, 0.85), 3);
      circle(g, 100, 100, 62);
      stroke(g, alpha(c.chalk, 0.6), 1.6);
      const star: number[][] = [];
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 2 * TAU) / 5; star.push([100 + Math.cos(a) * 60, 100 + Math.sin(a) * 60]); }
      poly(g, star);
      stroke(g, alpha(c.chalk, 0.55), 1.6);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU;
        const x = 100 + Math.cos(a) * 82, y = 100 + Math.sin(a) * 82;
        blob(g, lumpy(x, y + 2, 9, 0.4, 7, r));
        paint(g, alpha(shade(c.wax, -0.08), 0.85), alpha(INK, 0.5), 0.8);
        candle(g, x, y, 5 + r() * 1.5, r, c.wax);
      }
    },
  },
  {
    id: 'lantern-hook', name: 'Hook-post lantern', cat: 'light', sets: ['town', 'camp', 'farm', 'forest', 'market', 'swamp'], tags: ['lantern', 'post', 'crook', 'path', 'hanging', 'lamp'],
    w: 1, h: 1, light: { bright: 15, dim: 15, color: LAMP }, c: { wood: WOOD.oak, metal: METAL.iron, light: '#ffcf70' },
    variants: [{ name: 'Oak and iron', c: {} }, { name: 'Black iron', c: { wood: METAL.black, metal: METAL.black } }, { name: 'Brass', c: { metal: METAL.brass, wood: WOOD.walnut } }, { name: 'Ghost-light', c: { light: '#8dffb0', wood: WOOD.ebony } }],
    desc: 'A crooked post with a lantern hanging from its hook.',
    draw: ({ g, c }) => {
      circle(g, 30, 30, 9);
      paint(g, domeFill(g, 30, 30, 9, c.wood, 0.4), INK, LW);
      g.beginPath();
      g.moveTo(30, 30);
      g.quadraticCurveTo(62, 22, 60, 50);
      stroke(g, INK, 7);
      g.beginPath();
      g.moveTo(30, 30);
      g.quadraticCurveTo(62, 22, 60, 50);
      stroke(g, shade(c.wood, 0.1), 4.4);
      lanternTop(g, 60, 58, 14, c.metal, c.light);
    },
  },
  {
    id: 'lantern-wall', name: 'Wall lantern', cat: 'light', sets: ['town', 'tavern', 'castle', 'ship', 'dungeon', 'market'], tags: ['lantern', 'wall', 'bracket', 'lamp', 'porch'],
    w: 1, h: 1, light: { bright: 15, dim: 15, color: LAMP }, c: { metal: METAL.black, light: '#ffcf70' },
    variants: [{ name: 'Black iron', c: {} }, { name: 'Brass', c: { metal: METAL.brass } }, { name: 'Iron', c: { metal: METAL.iron } }, { name: 'Magelight', c: { metal: METAL.silver, light: '#9fd8ff' } }],
    desc: 'A lantern on a wall bracket. Put the top edge of its square on a wall.',
    draw: ({ g, c }) => {
      rr(g, 38, 1, 24, 10, 3);
      paint(g, litFill(g, 38, 1, 24, 10, c.metal, 0.35), INK, 1.4);
      bar(g, 50, 8, 50, 26, c.metal, 3.2);
      g.beginPath();
      g.moveTo(50, 12);
      g.quadraticCurveTo(62, 16, 56, 26);
      stroke(g, INK, 3.4);
      lanternTop(g, 50, 38, 15, c.metal, c.light);
    },
  },
  {
    id: 'light-orb', name: 'Floating light orb', cat: 'light', sets: ['wizard', 'temple', 'castle', 'cave', 'dungeon', 'forest'], tags: ['magic', 'orb', 'wisp', 'glow', 'floating', 'arcane', 'overhead'],
    w: 1, h: 1, layer: 'overhead', light: { bright: 20, dim: 20, color: '#cfe8ff' }, c: { orb: '#9fd8ff' },
    variants: [{ name: 'Pale blue', c: {} }, { name: 'Gold', c: { orb: '#ffd36a' } }, { name: 'Violet', c: { orb: '#c49bff' } }, { name: 'Green', c: { orb: '#8dffb0' } }],
    desc: 'A hovering ball of magical light with slow rings turning round it.',
    draw: ({ g, c }) => {
      glow(g, 50, 50, 50, c.orb, 0.6);
      ellipse(g, 50, 50, 36, 14, -0.5);
      stroke(g, alpha(shade(c.orb, 0.3), 0.8), 1.6);
      ellipse(g, 50, 50, 32, 12, 0.7);
      stroke(g, alpha(shade(c.orb, 0.2), 0.6), 1.2);
      circle(g, 50, 50, 15);
      paint(g, domeFill(g, 50, 50, 15, mix(c.orb, '#ffffff', 0.4), 0.5), alpha(shade(c.orb, -0.4), 0.9), 1.4);
      circle(g, 45, 45, 4);
      g.fillStyle = 'rgba(255,255,255,0.9)';
      g.fill();
      for (const [x, y] of [[22, 30], [78, 66], [70, 22]]) {
        circle(g, x, y, 2);
        g.fillStyle = alpha(shade(c.orb, 0.5), 0.9);
        g.fill();
      }
    },
  },
  {
    id: 'cresset', name: 'Cresset', cat: 'light', sets: ['castle', 'dungeon', 'camp', 'mine', 'town', 'ship'], tags: ['fire basket', 'beacon', 'pole', 'iron', 'brazier', 'watch fire'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 20, dim: 20, color: TORCH }, c: { metal: METAL.black, fire: '#ffb02e' },
    variants: [{ name: 'Black iron', c: {} }, { name: 'Rusty', c: { metal: METAL.rust } }, { name: 'Witch-fire', c: { fire: '#59e08a' } }, { name: 'Magefire', c: { metal: METAL.silver, fire: '#5ab8ff' } }],
    desc: 'An iron fire basket on a tall pole: a watch fire or a beacon.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 50, c.fire === '#ffb02e' ? '#ff9a40' : c.fire, 0.45);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU + Math.PI / 2;
        bar(g, 50, 50, 50 + Math.cos(a) * 36, 50 + Math.sin(a) * 36, c.metal, 3.2);
      }
      circle(g, 50, 50, 24);
      paint(g, '#24160e', INK, 1.6);
      for (let i = 0; i < 10; i++) {
        const a = r() * TAU, d = r() * 18;
        circle(g, 50 + Math.cos(a) * d, 50 + Math.sin(a) * d, 3 + r() * 2.5);
        paint(g, r() < 0.4 ? '#3a2219' : '#d2561a', null);
      }
      fireAt(g, 50, 50, 15, r, c.fire);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        bar(g, 50 + Math.cos(a) * 14, 50 + Math.sin(a) * 14, 50 + Math.cos(a) * 27, 50 + Math.sin(a) * 27, c.metal, 2.4);
      }
      hoop(g, 50, 50, 26, c.metal, 3.4);
    },
  },
  {
    id: 'floor-lamp', name: 'Standing oil lamp', cat: 'light', sets: ['town', 'castle', 'wizard', 'tavern'], tags: ['lamp', 'shade', 'standing', 'reading lamp', 'parlour'],
    w: 1, h: 1, light: { bright: 15, dim: 15, color: LAMP }, c: { metal: METAL.brass, shade: '#d9b878' },
    variants: [{ name: 'Brass, parchment', c: {} }, { name: 'Black, red shade', c: { metal: METAL.black, shade: '#a8423a' } }, { name: 'Silver, green shade', c: { metal: METAL.silver, shade: '#5e8a5a' } }, { name: 'Bronze, blue shade', c: { metal: METAL.bronze, shade: '#4a6a9a' } }],
    desc: 'A tall lamp on a weighted foot with a cloth shade.',
    draw: ({ g, c }) => {
      glow(g, 50, 50, 50, LAMP, 0.42);
      circle(g, 50, 50, 30);
      paint(g, domeFill(g, 50, 50, 30, c.shade, 0.25), INK, LW);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        line(g, 50 + Math.cos(a) * 13, 50 + Math.sin(a) * 13, 50 + Math.cos(a) * 29, 50 + Math.sin(a) * 29, alpha(shade(c.shade, -0.4), 0.5), 1);
      }
      circle(g, 50, 50, 13);
      paint(g, alpha('#fff2c4', 0.95), INK, 1.4);
      circle(g, 50, 50, 5);
      paint(g, domeFill(g, 50, 50, 5, c.metal, 0.5), INK, 1);
    },
  },
];

// ---------------------------------------------------------------- furniture

function dish(g: G, cx: number, cy: number, rad: number, col = '#d9d2c3', food?: string) {
  circle(g, cx, cy, rad);
  paint(g, domeFill(g, cx, cy, rad, col, 0.25), INK, 1);
  circle(g, cx, cy, rad * 0.6);
  paint(g, food ? domeFill(g, cx, cy, rad * 0.6, food, 0.4) : alpha(shade(col, -0.15), 0.7), null);
}

/** Small flowers in a round vase. */
function vase(g: G, cx: number, cy: number, rad: number, col: string, r: R) {
  circle(g, cx, cy, rad);
  paint(g, domeFill(g, cx, cy, rad, col, 0.45), INK, 1.2);
  const petals = ['#e85d75', '#f2c14e', '#ffffff', '#b07ad6'];
  for (let i = 0; i < 6; i++) {
    const a = r() * TAU, d = r() * rad * 0.9;
    circle(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, rad * 0.32);
    paint(g, i < 2 ? '#4e7a3a' : petals[Math.floor(r() * petals.length)], INK, 0.7);
  }
}

/** Upholstery tufting buttons. */
function tufts(g: G, x: number, y: number, w: number, h: number, col: string, nx: number, ny: number) {
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    circle(g, x + ((i + 0.5) / nx) * w, y + ((j + 0.5) / ny) * h, 1.3);
    g.fillStyle = shade(col, -0.5);
    g.fill();
  }
}

/** A rug's tassel fringe along one edge. */
function fringe(g: G, x1: number, y: number, x2: number, dir: number, col: string) {
  for (let x = x1; x <= x2; x += 5) line(g, x, y, x, y + dir * 6, alpha(shade(col, -0.1), 0.9), 1.4);
}

const FURNITURE: ObjDef[] = [
  // ---- bedroom and storage
  {
    id: 'dresser-tall', name: 'Tall chest of drawers', cat: 'furniture', sets: ['castle', 'town', 'tavern', 'wizard'], tags: ['dresser', 'drawers', 'highboy', 'bedroom', 'tall'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.brass }, variants: WV,
    desc: 'A narrow, tall chest of five drawers. Back edge to a wall (top edge).',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 14, 10, 72, 56, c.wood, r, 'h', 3, 4);
      drawerStrip(g, 14, 62, 72, 14, c.wood, c.metal, 2);
      rr(g, 24, 20, 22, 16, 3);
      paint(g, litFill(g, 24, 20, 22, 16, '#5a2a3a', 0.3), INK, 1.1);
      line(g, 24, 27, 46, 27, c.metal, 1.4);
      bottle(g, 66, 30, 5, '#5aa0c8');
      rr(g, 52, 44, 24, 6, 2);
      paint(g, '#c9b48a', INK, 0.9);
    },
  },
  {
    id: 'dresser-low', name: 'Low dresser', cat: 'furniture', sets: ['castle', 'town', 'tavern', 'farm'], tags: ['dresser', 'drawers', 'linen', 'bedroom', 'lowboy'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.iron, linen: '#e6e0d2' }, variants: WV,
    desc: 'A long, low chest of drawers with folded linen on top.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 8, 18, 184, 46, c.wood, r, 'h', 2, 4);
      drawerStrip(g, 8, 60, 184, 14, c.wood, c.metal, 4);
      for (let i = 0; i < 3; i++) pad(g, 22 + i * 4, 24 + i * 3, 44, 26, shade(c.linen, -i * 0.06), 3, 1);
      for (let i = 0; i < 2; i++) pad(g, 120 + i * 3, 26 + i * 3, 40, 24, i ? CLOTH.blue : CLOTH.red, 3, 1);
      vase(g, 176, 32, 7, '#7a8f9a', r);
    },
  },
  {
    id: 'dresser-mirror', name: 'Dresser with mirror', cat: 'furniture', sets: ['castle', 'town', 'tavern'], tags: ['dresser', 'mirror', 'looking glass', 'bedroom', 'vanity'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.brass }, variants: WV,
    desc: 'Drawers with a tall mirror standing at the back. Back edge to a wall (top edge).',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 10, 16, 180, 48, c.wood, r, 'h', 2, 4);
      drawerStrip(g, 10, 60, 180, 14, c.wood, c.metal, 3);
      box(g, 38, 4, 124, 16, shade(c.wood, -0.15), 4, LW);
      glass(g, 46, 8, 108, 8, '#bcd6e0', 2);
      for (const x of [38, 162]) {
        circle(g, x, 12, 5);
        paint(g, domeFill(g, x, 12, 5, c.metal, 0.5), INK, 1);
      }
      bottle(g, 30, 36, 5, '#a45ad6');
      bottle(g, 42, 44, 4, '#d6a04a');
      rr(g, 90, 36, 26, 7, 2);
      paint(g, '#c9b48a', INK, 0.9);
      for (let i = 0; i < 8; i++) line(g, 92 + i * 3, 43, 92 + i * 3, 47, INK, 0.8);
      circle(g, 150, 40, 9);
      paint(g, domeFill(g, 150, 40, 9, '#e9dcc8', 0.3), INK, 1.1);
    },
  },
  {
    id: 'side-table', name: 'Round side table', cat: 'furniture', sets: ['castle', 'town', 'tavern', 'wizard'], tags: ['side table', 'end table', 'occasional', 'vase', 'flowers', 'parlour'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, cloth: CLOTH.white }, variants: [...WV.slice(0, 3), { name: 'Lace cloth', c: { wood: WOOD.oak }, f: { cloth: 1 } }],
    desc: 'A small pedestal table with a vase of flowers.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      roundPanel(g, 50, 50, 30, c.wood, r, 3);
      if (f.cloth) {
        circle(g, 50, 50, 24);
        paint(g, alpha(c.cloth, 0.95), INK, 1);
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU;
          circle(g, 50 + Math.cos(a) * 21, 50 + Math.sin(a) * 21, 2);
          stroke(g, alpha(shade(c.cloth, -0.3), 0.7), 0.8);
        }
      }
      vase(g, 50, 50, 11, '#4a7a9a', r);
    },
  },
  {
    id: 'armoire', name: 'Carved armoire', cat: 'storage', sets: ['castle', 'town', 'wizard'], tags: ['wardrobe', 'closet', 'cupboard', 'clothes', 'bedroom', 'carved', 'noble'],
    w: 2, h: 1, blocksMovement: true, blocksSight: true, c: { wood: WOOD.walnut, metal: METAL.brass, inlay: '#d9b878' },
    variants: [...WV.slice(0, 3), { name: 'Painted', c: { wood: WOOD.painted, inlay: '#e6e0d2' } }],
    desc: 'A tall double-doored armoire with a carved crown. Back edge to a wall (top edge).',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 8, 8, 184, 58, c.wood, r, 'v', 2, 3);
      rr(g, 4, 2, 192, 12, 3);
      paint(g, litFill(g, 4, 2, 192, 12, shade(c.wood, -0.2), 0.3), INK, LW);
      for (let x = 14; x < 190; x += 12) line(g, x, 4, x, 12, alpha(shade(c.wood, -0.55), 0.6), 1);
      for (const x0 of [16, 104]) {
        rr(g, x0, 18, 80, 42, 3);
        stroke(g, alpha(shade(c.wood, -0.55), 0.7), 1.6);
        poly(g, [[x0 + 40, 24], [x0 + 64, 39], [x0 + 40, 54], [x0 + 16, 39]]);
        paint(g, alpha(c.inlay, 0.7), alpha(shade(c.wood, -0.5), 0.8), 1);
        circle(g, x0 + 40, 39, 4);
        paint(g, domeFill(g, x0 + 40, 39, 4, c.metal, 0.5), INK, 0.9);
      }
      rr(g, 8, 62, 184, 10, 2);
      paint(g, litFill(g, 8, 62, 184, 10, shade(c.wood, -0.25), 0.3), INK, 1.6);
      for (const x of [94, 106]) {
        circle(g, x, 67, 2.8);
        paint(g, domeFill(g, x, 67, 2.8, c.metal, 0.5), INK, 0.9);
      }
    },
  },
  {
    id: 'vanity', name: 'Vanity table', cat: 'furniture', sets: ['castle', 'town', 'tavern'], tags: ['dressing table', 'mirror', 'makeup', 'bedroom', 'stool', 'boudoir'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.ash, metal: METAL.gold, cloth: '#c4718a' },
    variants: [{ name: 'Ash and rose', c: {} }, { name: 'Walnut and green', c: { wood: WOOD.walnut, cloth: CLOTH.green } }, { name: 'Ebony and red', c: { wood: WOOD.ebony, cloth: CLOTH.red, metal: METAL.silver } }, { name: 'White and blue', c: { wood: '#e3dccd', cloth: CLOTH.blue } }],
    desc: 'A dressing table with a three-part mirror and a padded stool.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 22, 14, 156, 42, c.wood, r, 'h', 2, 6);
      // three-part mirror at the back
      g.save();
      g.translate(70, 12);
      g.rotate(0.45);
      box(g, -34, -5, 34, 10, c.metal, 3, 1.4);
      glass(g, -31, -2.5, 28, 5, '#c9dde6', 1);
      g.restore();
      g.save();
      g.translate(130, 12);
      g.rotate(-0.45);
      box(g, 0, -5, 34, 10, c.metal, 3, 1.4);
      glass(g, 3, -2.5, 28, 5, '#c9dde6', 1);
      g.restore();
      box(g, 70, 6, 60, 12, c.metal, 3, 1.6);
      glass(g, 74, 9, 52, 6, '#c9dde6', 1);
      bottle(g, 46, 34, 5, '#e07ab0');
      bottle(g, 58, 42, 4, '#7ab0e0');
      circle(g, 100, 38, 8);
      paint(g, domeFill(g, 100, 38, 8, '#f2e3d0', 0.3), INK, 1.1);
      circle(g, 100, 38, 3);
      paint(g, '#e8b4b4', null);
      rr(g, 128, 32, 24, 14, 3);
      paint(g, litFill(g, 128, 32, 24, 14, '#5a2a3a', 0.3), INK, 1.1);
      gem(g, 140, 39, 3, '#2fa3d6');
      circle(g, 100, 80, 15);
      paint(g, domeFill(g, 100, 80, 15, c.cloth, 0.35), INK, LW);
      tufts(g, 90, 70, 20, 20, c.cloth, 2, 2);
    },
  },
  {
    id: 'sideboard', name: 'Sideboard', cat: 'furniture', sets: ['castle', 'tavern', 'town'], tags: ['buffet', 'credenza', 'dining', 'dishes', 'decanter', 'cabinet'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.silver, cloth: CLOTH.red }, variants: WV,
    desc: 'A long dining-room cabinet set with plates, a decanter and candlesticks.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 6, 12, 188, 52, c.wood, r, 'h', 2, 4);
      drawerStrip(g, 6, 60, 188, 14, c.wood, METAL.brass, 3);
      cloth(g, 30, 28, 140, 20, c.cloth, r, 4, 1);
      for (const x of [44, 70, 130, 156]) dish(g, x, 38, 10);
      circle(g, 100, 36, 9);
      paint(g, domeFill(g, 100, 36, 9, '#7a1c2a', 0.5), INK, 1.2);
      circle(g, 100, 36, 3.5);
      paint(g, domeFill(g, 100, 36, 3.5, c.metal, 0.5), INK, 0.8);
      for (const x of [16, 184]) {
        circle(g, x, 30, 6);
        paint(g, domeFill(g, x, 30, 6, c.metal, 0.5), INK, 1);
        circle(g, x, 30, 3);
        paint(g, WAX, INK, 0.7);
      }
    },
  },
  {
    id: 'cupboard', name: 'Cupboard', cat: 'storage', sets: ['tavern', 'farm', 'town', 'castle'], tags: ['cabinet', 'pantry', 'kitchen', 'dishes', 'hutch', 'storage'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { wood: WOOD.pine, metal: METAL.iron }, variants: [...WV.slice(0, 3), { name: 'Painted', c: { wood: WOOD.painted } }],
    desc: 'A tall two-door cupboard. Back edge to a wall (top edge).',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 12, 8, 76, 56, c.wood, r, 'v', 2, 3);
      rr(g, 8, 3, 84, 10, 3);
      paint(g, litFill(g, 8, 3, 84, 10, shade(c.wood, -0.2), 0.3), INK, LW);
      rr(g, 12, 60, 76, 12, 2);
      paint(g, litFill(g, 12, 60, 76, 12, shade(c.wood, -0.25), 0.3), INK, 1.6);
      line(g, 50, 60, 50, 72, INK, 1.2);
      for (const x of [45, 55]) {
        circle(g, x, 66, 2.6);
        paint(g, domeFill(g, x, 66, 2.6, c.metal, 0.5), INK, 0.9);
      }
      for (let i = 0; i < 3; i++) dish(g, 34, 34 - i * 2, 11 - i * 2, '#c9d0d6');
      circle(g, 66, 34, 9);
      paint(g, domeFill(g, 66, 34, 9, '#a0603a', 0.4), INK, 1.1);
      circle(g, 66, 34, 4);
      paint(g, '#4a2a18', null);
    },
  },
  {
    id: 'cabinet-glass', name: 'Glass-front cabinet', cat: 'storage', sets: ['castle', 'wizard', 'town', 'temple', 'market'], tags: ['curio', 'display', 'vitrine', 'china', 'collection', 'cabinet'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.brass }, variants: WV,
    desc: 'A cabinet with glass doors showing curios inside. Back edge to a wall (top edge).',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      box(g, 8, 6, 184, 58, shade(c.wood, -0.1), 3, LW);
      rr(g, 16, 12, 168, 46, 2);
      paint(g, '#2a1d14', INK, 1.2);
      // curios on the shelf
      dish(g, 34, 34, 12, '#e6eef2', '#5a8ac8');
      bottle(g, 60, 30, 6, '#3aa07a');
      gem(g, 78, 40, 6, '#d6402f');
      circle(g, 104, 34, 10);
      paint(g, domeFill(g, 104, 34, 10, '#e8e0cc', 0.4), INK, 1.1);
      skull(g, 132, 34, 8, 0);
      bottle(g, 156, 40, 5, '#a45ad6');
      dish(g, 170, 26, 8, '#d9b878');
      glass(g, 16, 12, 84, 46, '#c9dde6', 2);
      glass(g, 100, 12, 84, 46, '#c9dde6', 2);
      rr(g, 8, 60, 184, 10, 2);
      paint(g, litFill(g, 8, 60, 184, 10, shade(c.wood, -0.25), 0.3), INK, 1.6);
      for (const x of [94, 106]) {
        circle(g, x, 65, 2.6);
        paint(g, domeFill(g, x, 65, 2.6, c.metal, 0.5), INK, 0.9);
      }
      fgrain(g, 8, 6, 184, 6, c.wood, r, 'h', 1);
    },
  },
  // ---- seating
  {
    id: 'bench-long', name: 'Long bench', cat: 'furniture', sets: ['tavern', 'castle', 'town', 'temple', 'farm', 'camp'], tags: ['bench', 'seat', 'hall', 'mess', 'form'],
    w: 3, h: 1, c: { wood: WOOD.oak }, variants: WV,
    desc: 'A long plank bench for a hall or mess table.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const x of [26, 143, 260]) box(g, x, 30, 14, 40, shade(c.wood, -0.3), 2, 1.4);
      panel(g, 6, 35, 288, 30, c.wood, r, 'h', 2, 4);
      speckle(g, 10, 38, 280, 24, r, 12, alpha(shade(c.wood, -0.5), 0.3), 1.3);
    },
  },
  {
    id: 'settle', name: 'Settle bench', cat: 'furniture', sets: ['tavern', 'farm', 'town', 'castle'], tags: ['bench', 'high back', 'fireside', 'seat', 'inn'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, cushion: CLOTH.red },
    variants: [...WV.slice(0, 3), { name: 'Cushioned', c: { wood: WOOD.walnut }, f: { cushion: 1 } }],
    desc: 'A high-backed wooden bench with arms; the back faces the top edge.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      panel(g, 12, 22, 176, 50, c.wood, r, 'h', 2, 3);
      if (f.cushion) {
        pad(g, 22, 28, 76, 38, c.cushion, 8);
        pad(g, 102, 28, 76, 38, c.cushion, 8);
      }
      box(g, 6, 8, 188, 18, shade(c.wood, -0.12), 3, LW, 0.3);
      fgrain(g, 6, 8, 188, 18, shade(c.wood, -0.12), r, 'h', 2);
      for (const x of [6, 180]) box(g, x, 14, 14, 62, shade(c.wood, -0.05), 3, LW, 0.3);
    },
  },
  {
    id: 'stool-bar', name: 'Bar stool', cat: 'furniture', sets: ['tavern', 'town', 'ship'], tags: ['stool', 'tall', 'bar', 'seat', 'counter'],
    w: 1, h: 1, c: { wood: WOOD.oak, metal: METAL.iron, cushion: CLOTH.red },
    variants: [...WV.slice(0, 3), { name: 'Leather seat', c: { wood: WOOD.walnut, cushion: '#6b3a22' }, f: { cushion: 1 } }],
    desc: 'A tall stool with a foot ring.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      hoop(g, 50, 50, 25, c.metal, 2.6);
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i / 4) * TAU;
        circle(g, 50 + Math.cos(a) * 28, 50 + Math.sin(a) * 28, 4.5);
        paint(g, shade(c.wood, -0.3), INK, 1);
      }
      roundPanel(g, 50, 50, 19, c.wood, r, 2);
      if (f.cushion) {
        circle(g, 50, 50, 15);
        paint(g, domeFill(g, 50, 50, 15, c.cushion, 0.4), INK, 1.1);
      }
    },
  },
  {
    id: 'footstool', name: 'Footstool', cat: 'furniture', sets: ['castle', 'town', 'tavern', 'wizard'], tags: ['ottoman', 'pouffe', 'stool', 'padded', 'parlour'],
    w: 1, h: 1, c: { wood: WOOD.walnut, cloth: CLOTH.green }, variants: CLOTHS('cloth'),
    desc: 'A low padded footstool.',
    draw: ({ g, c }) => {
      for (const [x, y] of [[28, 32], [72, 32], [28, 68], [72, 68]]) {
        circle(g, x, y, 5);
        paint(g, domeFill(g, x, y, 5, c.wood, 0.4), INK, 1);
      }
      pad(g, 26, 30, 48, 40, c.cloth, 10, LW);
      tufts(g, 26, 30, 48, 40, c.cloth, 3, 2);
    },
  },
  {
    id: 'sofa', name: 'Settee', cat: 'furniture', sets: ['castle', 'town', 'tavern', 'wizard'], tags: ['sofa', 'couch', 'parlour', 'seat', 'upholstered', 'lounge'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, cloth: CLOTH.red }, variants: CLOTHS('cloth'),
    desc: 'An upholstered two-seat settee; its back faces the top edge.',
    draw: ({ g, c }) => {
      for (const x of [16, 184]) for (const y of [14, 80]) {
        circle(g, x, y, 4);
        paint(g, domeFill(g, x, y, 4, c.wood, 0.4), INK, 1);
      }
      rr(g, 10, 10, 180, 70, 12);
      paint(g, litFill(g, 10, 10, 180, 70, shade(c.cloth, -0.15), 0.25), INK, LW);
      pad(g, 14, 10, 172, 22, shade(c.cloth, -0.05), 10, 1.4);
      tufts(g, 30, 14, 140, 14, c.cloth, 7, 1);
      pad(g, 34, 32, 66, 42, c.cloth, 8);
      pad(g, 100, 32, 66, 42, c.cloth, 8);
      pad(g, 8, 16, 26, 62, shade(c.cloth, -0.08), 12, LW);
      pad(g, 166, 16, 26, 62, shade(c.cloth, -0.08), 12, LW);
    },
  },
  {
    id: 'armchair', name: 'Armchair', cat: 'furniture', sets: ['castle', 'town', 'tavern', 'wizard'], tags: ['wingback', 'chair', 'fireside', 'upholstered', 'parlour', 'seat'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, cloth: CLOTH.green }, variants: CLOTHS('cloth'),
    desc: 'A deep wingback armchair; its back faces the top edge.',
    draw: ({ g, c }) => {
      rr(g, 12, 10, 76, 78, 12);
      paint(g, litFill(g, 12, 10, 76, 78, shade(c.cloth, -0.18), 0.25), INK, LW);
      pad(g, 16, 8, 68, 24, shade(c.cloth, -0.05), 10, 1.4);
      pad(g, 30, 30, 40, 50, c.cloth, 9);
      pad(g, 10, 18, 20, 66, shade(c.cloth, -0.08), 9, LW);
      pad(g, 70, 18, 20, 66, shade(c.cloth, -0.08), 9, LW);
      tufts(g, 24, 12, 52, 14, c.cloth, 4, 1);
    },
  },
  {
    id: 'rocking-chair', name: 'Rocking chair', cat: 'furniture', sets: ['farm', 'town', 'tavern', 'camp'], tags: ['rocker', 'chair', 'porch', 'fireside', 'seat', 'cottage'],
    w: 1, h: 1, c: { wood: WOOD.oak, cushion: '#b0503a' },
    variants: [...WV.slice(0, 3), { name: 'With cushion', c: { wood: WOOD.pine }, f: { cushion: 1 } }],
    desc: 'A wooden rocking chair; its back faces the top edge.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (const x of [24, 76]) {
        line(g, x, 6, x, 94, INK, 7);
        line(g, x, 6, x, 94, shade(c.wood, -0.1), 4.4);
      }
      chairAt(g, 50, 54, 62, 0, c.wood, r, f.cushion ? c.cushion : undefined);
      for (let i = 0; i < 4; i++) line(g, 30 + i * 13, 22, 30 + i * 13, 28, alpha(shade(c.wood, -0.5), 0.7), 1.5);
    },
  },
  {
    id: 'chair-high-back', name: 'High-backed chair', cat: 'furniture', sets: ['castle', 'temple', 'wizard', 'crypt', 'town'], tags: ['carved', 'chair', 'lord', 'council', 'seat', 'noble'],
    w: 1, h: 1, c: { wood: WOOD.ebony, cushion: CLOTH.red, metal: METAL.gold },
    variants: [{ name: 'Ebony and red', c: {} }, { name: 'Oak and green', c: { wood: WOOD.oak, cushion: CLOTH.green } }, { name: 'Walnut and blue', c: { wood: WOOD.walnut, cushion: CLOTH.blue, metal: METAL.silver } }, { name: 'Black and purple', c: { wood: '#2a2226', cushion: CLOTH.purple } }],
    desc: 'A tall carved chair for the head of a table; its back faces the top edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 20, 26, 60, 56, c.wood, r, 'v', 3, 4);
      pad(g, 26, 32, 48, 44, c.cushion, 8);
      g.beginPath();
      g.moveTo(14, 30);
      g.lineTo(14, 14);
      g.quadraticCurveTo(50, -2, 86, 14);
      g.lineTo(86, 30);
      g.closePath();
      paint(g, litFill(g, 14, 4, 72, 26, shade(c.wood, 0.05), 0.3), INK, LW);
      fgrain(g, 14, 6, 72, 24, c.wood, r, 'h', 3);
      for (const x of [14, 86]) {
        circle(g, x, 20, 6);
        paint(g, domeFill(g, x, 20, 6, c.metal, 0.5), INK, 1.2);
      }
      gem(g, 50, 14, 4, '#c0392b');
    },
  },
  // ---- tables
  {
    id: 'table-square', name: 'Square table', cat: 'furniture', sets: ['tavern', 'town', 'farm', 'castle', 'dungeon'], tags: ['table', 'square', 'small', 'card table'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak }, variants: WV,
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 9, 9, 82, 82, c.wood, r, 'h', 4, 4);
      speckle(g, 14, 14, 72, 72, r, 6, alpha(shade(c.wood, -0.5), 0.35), 1.5);
    },
  },
  {
    id: 'table-trestle', name: 'Trestle table', cat: 'furniture', sets: ['tavern', 'camp', 'farm', 'castle', 'market'], tags: ['table', 'trestle', 'rough', 'mess', 'feast', 'long'],
    w: 3, h: 1, blocksMovement: true, c: { wood: WOOD.pine }, variants: WV,
    desc: 'Rough planks laid across two X-shaped trestles.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const x of [30, 270]) {
        line(g, x - 8, 8, x + 8, 92, INK, 9);
        line(g, x - 8, 8, x + 8, 92, shade(c.wood, -0.3), 6.4);
        line(g, x + 8, 8, x - 8, 92, INK, 9);
        line(g, x + 8, 8, x - 8, 92, shade(c.wood, -0.25), 6.4);
      }
      for (let i = 0; i < 3; i++) {
        const y = 18 + i * 21.5, off = (r() - 0.5) * 8;
        panel(g, 6 + off, y, 288 - Math.abs(off), 21, shade(c.wood, (r() - 0.5) * 0.12), r, 'h', 1, 2, 1.8);
      }
      for (const x of [30, 270]) for (let i = 0; i < 3; i++) rivet(g, x, 28 + i * 21.5, 1.8, METAL.iron);
    },
  },
  {
    id: 'dining-table-six', name: 'Dining table for six', cat: 'furniture', sets: ['castle', 'tavern', 'town'], tags: ['dining', 'table', 'chairs', 'meal', 'banquet', 'dressed table', 'set'],
    w: 3, h: 2, blocksMovement: true, c: { wood: WOOD.walnut, cloth: CLOTH.white, cushion: CLOTH.red },
    variants: [...WV.slice(0, 3), { name: 'Laid for supper', c: {}, f: { set: 1 } }],
    desc: 'A long table with three chairs down each side.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (const x of [80, 150, 220]) {
        chairAt(g, x, 28, 44, 0, c.wood, r, c.cushion);
        chairAt(g, x, 172, 44, Math.PI, c.wood, r, c.cushion);
      }
      panel(g, 34, 48, 232, 104, c.wood, r, 'h', 5, 5);
      if (f.set) {
        cloth(g, 54, 84, 192, 32, c.cloth, r, 6, 2);
        for (const x of [80, 150, 220]) {
          dish(g, x, 64, 11, '#d9d2c3', '#c0703a');
          dish(g, x, 136, 11, '#d9d2c3', '#8aa04a');
        }
        candle(g, 115, 100, 6, r);
        candle(g, 185, 100, 6, r);
        dish(g, 150, 100, 13, '#c9b48a', '#b5482a');
      }
    },
  },
  {
    id: 'table-reading', name: 'Reading table', cat: 'furniture', sets: ['wizard', 'castle', 'temple', 'town'], tags: ['library', 'study', 'books', 'table', 'scholar', 'research'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut }, variants: WV,
    desc: 'A library table covered in open books, notes and a lens.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 8, 14, 184, 66, c.wood, r, 'h', 3, 4);
      // open book
      rr(g, 60, 26, 64, 40, 2);
      paint(g, '#5a2a22', INK, 1.2);
      for (const x of [63, 92]) {
        rr(g, x, 28, 29, 36, 1.5);
        paint(g, litFill(g, x, 28, 29, 36, '#efe6cf', 0.15), INK, 0.9);
        for (let i = 0; i < 6; i++) line(g, x + 3, 33 + i * 5, x + 25 - r() * 6, 33 + i * 5, 'rgba(50,35,20,0.45)', 0.7);
      }
      book(g, 18, 22, 28, 20, BOOKS[1], 0.1);
      book(g, 20, 20, 26, 18, BOOKS[0], -0.08);
      book(g, 140, 46, 30, 20, BOOKS[2], 0.3);
      scroll(g, 140, 22, 34, 11, -0.15);
      rr(g, 24, 52, 26, 20, 1);
      paint(g, '#eadfc4', INK, 1);
      for (let i = 0; i < 3; i++) line(g, 28, 57 + i * 5, 46, 57 + i * 5, 'rgba(50,35,20,0.45)', 0.7);
      circle(g, 118, 64, 7);
      paint(g, alpha('#cfe6ee', 0.8), INK, 1.4);
      line(g, 123, 69, 132, 76, '#6b4428', 2.6);
      candle(g, 178, 24, 6, r);
    },
  },
  {
    id: 'writing-desk', name: 'Writing desk and chair', cat: 'furniture', sets: ['wizard', 'castle', 'town', 'temple', 'ship'], tags: ['secretary', 'bureau', 'desk', 'study', 'quill', 'letters', 'chair'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, cushion: CLOTH.green }, variants: WV,
    desc: 'A desk with letter cubbies along the back and a chair pulled up. Back edge to a wall (top edge).',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 20, 6, 160, 50, c.wood, r, 'h', 2, 4);
      box(g, 26, 4, 148, 16, shade(c.wood, -0.25), 2, 1.6);
      for (let i = 1; i < 8; i++) line(g, 26 + i * 18.5, 4, 26 + i * 18.5, 20, INK, 1.2);
      for (let i = 0; i < 8; i++) if (r() < 0.6) {
        rr(g, 29 + i * 18.5, 8, 12, 9, 1);
        paint(g, '#eadfc4', INK, 0.7);
      }
      rr(g, 76, 26, 40, 24, 1);
      paint(g, '#eadfc4', INK, 1);
      for (let i = 0; i < 4; i++) line(g, 80, 31 + i * 5, 110 - r() * 8, 31 + i * 5, 'rgba(50,35,20,0.5)', 0.8);
      circle(g, 130, 32, 5);
      paint(g, domeFill(g, 130, 32, 5, '#2b2b30', 0.4), INK, 1);
      line(g, 128, 32, 120, 50, '#f2ecdc', 1.6);
      candle(g, 40, 34, 6, r);
      chairAt(g, 100, 78, 38, Math.PI, c.wood, r, c.cushion);
    },
  },
  {
    id: 'globe-stand', name: 'Globe on stand', cat: 'decor', sets: ['wizard', 'castle', 'ship', 'town'], tags: ['globe', 'world', 'map', 'study', 'navigator', 'library'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.brass, sea: '#3f7a9a', land: '#c9b27f' },
    variants: [{ name: 'Classic', c: {} }, { name: 'Antique', c: { sea: '#b8a07a', land: '#7a5a3a' } }, { name: 'Night sky', c: { sea: '#1f2a4a', land: '#e8d68a', metal: METAL.silver } }],
    desc: 'A world globe in a brass meridian on a wooden stand.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU + Math.PI / 2;
        line(g, 50, 50, 50 + Math.cos(a) * 40, 50 + Math.sin(a) * 40, INK, 7);
        line(g, 50, 50, 50 + Math.cos(a) * 40, 50 + Math.sin(a) * 40, shade(c.wood, 0.05), 4.6);
      }
      hoop(g, 50, 50, 33, c.metal, 3);
      circle(g, 50, 50, 28);
      paint(g, domeFill(g, 50, 50, 28, c.sea, 0.35), INK, LW);
      g.save();
      circle(g, 50, 50, 28);
      g.clip();
      for (const [x, y, s] of [[40, 40, 11], [62, 54, 9], [44, 66, 6], [64, 32, 5]]) {
        blob(g, lumpy(x, y, s, 0.5, 9, r));
        paint(g, alpha(c.land, 0.95), alpha(INK, 0.5), 0.8);
      }
      ellipse(g, 50, 50, 28, 9);
      stroke(g, alpha('#ffffff', 0.3), 0.8);
      g.restore();
      line(g, 50, 17, 50, 83, c.metal, 2);
      circle(g, 41, 40, 6);
      g.fillStyle = 'rgba(255,255,255,0.25)';
      g.fill();
    },
  },
  // ---- books and papers
  {
    id: 'bookshelf-tall', name: 'Narrow bookcase', cat: 'furniture', sets: ['wizard', 'castle', 'town', 'temple', 'tavern'], tags: ['books', 'bookcase', 'library', 'shelf', 'study', 'narrow'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { wood: WOOD.walnut }, variants: WV,
    desc: 'A tall, one-square bookcase. Put the top edge of its square on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shelfCase(g, 8, 6, 84, 54, c.wood, r, (ix, iy, iw, id) => bookRow(g, ix, iy, iw, id, r));
      book(g, 30, 70, 18, 12, BOOKS[3], -0.3);
    },
  },
  {
    id: 'bookshelf-low', name: 'Low bookshelf', cat: 'furniture', sets: ['wizard', 'castle', 'town', 'temple', 'tavern'], tags: ['books', 'shelf', 'library', 'half height', 'study'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak }, variants: WV,
    desc: 'A waist-high bookshelf with odds and ends on top.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 6, 12, 188, 42, c.wood, r, 'h', 2, 3);
      rr(g, 6, 50, 188, 18, 2);
      paint(g, '#1e140d', INK, LW);
      g.save();
      g.beginPath();
      g.rect(9, 52, 182, 14);
      g.clip();
      bookRow(g, 9, 52, 182, 14, r);
      g.restore();
      vase(g, 24, 30, 9, '#9a5a48', r);
      book(g, 60, 20, 30, 20, BOOKS[4], 0.06);
      book(g, 62, 24, 28, 18, BOOKS[5], -0.05);
      candle(g, 112, 30, 6, r);
      skull(g, 140, 32, 9);
      scroll(g, 160, 22, 26, 9, 0.4);
    },
  },
  {
    id: 'bookshelf-corner', name: 'Corner bookshelf', cat: 'furniture', sets: ['wizard', 'castle', 'town', 'temple'], tags: ['books', 'corner', 'shelf', 'library', 'quarter round'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { wood: WOOD.walnut }, variants: WV,
    desc: 'A quarter-round bookshelf for a room corner: put its top-left corner in the corner.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const qp = (rad: number) => {
        g.beginPath();
        g.moveTo(4, 4);
        g.lineTo(4 + rad, 4);
        g.arc(4, 4, rad, 0, Math.PI / 2);
        g.closePath();
      };
      qp(88);
      paint(g, litFill(g, 4, 4, 88, 88, shade(c.wood, 0.05), 0.25), INK, LW);
      qp(80);
      paint(g, '#1e140d', INK, 1.1);
      g.save();
      qp(80);
      g.clip();
      let a = 0.04;
      while (a < Math.PI / 2 - 0.06) {
        const da = 0.05 + r() * 0.06, len = 22 + r() * 14;
        g.save();
        g.translate(4, 4);
        g.rotate(a + da / 2);
        rr(g, 80 - len, -40 * da, len, 80 * da, 1);
        paint(g, litFill(g, 80 - len, -40 * da, len, 80 * da, BOOKS[Math.floor(r() * BOOKS.length)], 0.25), alpha(INK, 0.8), 0.7);
        g.restore();
        a += da + 0.005;
      }
      g.restore();
      qp(38);
      paint(g, litFill(g, 4, 4, 38, 38, c.wood, 0.25), INK, 1.4);
      fgrain(g, 4, 4, 38, 38, c.wood, r, 'h', 2);
      candle(g, 18, 18, 5, r);
    },
  },
  {
    id: 'library-stack', name: 'Library stack', cat: 'furniture', sets: ['wizard', 'castle', 'temple', 'town'], tags: ['books', 'library', 'double-sided', 'freestanding', 'stacks', 'archive'],
    w: 2, h: 1, blocksMovement: true, blocksSight: true, c: { wood: WOOD.oak }, variants: WV,
    desc: 'A freestanding double-sided bookcase for the middle of a library.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 4, 10, 192, 80, 2);
      paint(g, '#1e140d', INK, LW);
      g.save();
      g.beginPath();
      g.rect(9, 15, 182, 70);
      g.clip();
      bookRow(g, 9, 51, 182, 33, r);
      g.translate(0, 100);
      g.scale(1, -1);
      bookRow(g, 9, 51, 182, 33, r);
      g.restore();
      for (const [x, y, w, h] of [[4, 10, 192, 5], [4, 85, 192, 5], [4, 10, 5, 80], [191, 10, 5, 80], [4, 48, 192, 4], [98, 10, 4, 80]]) {
        rr(g, x, y, w, h, 1);
        paint(g, litFill(g, x, y, w, h, c.wood, 0.25), INK, 1.1);
      }
      rr(g, 4, 10, 192, 80, 2);
      stroke(g, INK, LW);
    },
  },
  {
    id: 'bookcase-ladder', name: 'Library wall with ladder', cat: 'furniture', sets: ['wizard', 'castle', 'temple', 'town'], tags: ['books', 'library', 'ladder', 'tall', 'bookcase', 'archive', 'rolling ladder'],
    w: 3, h: 1, blocksMovement: true, blocksSight: true, c: { wood: WOOD.walnut, metal: METAL.brass }, variants: WV,
    desc: 'A run of tall bookcases with a rolling ladder. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shelfCase(g, 4, 6, 292, 50, c.wood, r, (ix, iy, iw, id) => {
        bookRow(g, ix, iy, iw, id, r);
        for (const x of [ix + iw / 3, ix + (2 * iw) / 3]) {
          g.fillStyle = litFill(g, x - 2.5, iy, 5, id, c.wood, 0.25);
          g.fillRect(x - 2.5, iy, 5, id);
        }
      });
      bar(g, 6, 8, 294, 8, c.metal, 2.4);
      for (const x of [196, 224]) {
        line(g, x, 8, x + 6, 90, INK, 6);
        line(g, x, 8, x + 6, 90, shade(c.wood, 0.1), 3.8);
      }
      for (let i = 0; i < 7; i++) {
        const t = (i + 0.5) / 7, y = 8 + t * 82;
        line(g, 196 + t * 6, y, 224 + t * 6, y, INK, 3.6);
        line(g, 196 + t * 6, y, 224 + t * 6, y, shade(c.wood, 0.15), 2);
      }
      for (const x of [202, 230]) {
        circle(g, x, 90, 3.5);
        paint(g, domeFill(g, x, 90, 3.5, c.metal, 0.5), INK, 1);
      }
    },
  },
  {
    id: 'book-pile', name: 'Book stacks', cat: 'decor', sets: ['wizard', 'castle', 'temple', 'town', 'crypt', 'dungeon'], tags: ['books', 'pile', 'stack', 'tomes', 'library', 'clutter'],
    w: 1, h: 1, c: { a: BOOKS[0], b: BOOKS[1], cc: BOOKS[2] },
    variants: [{ name: 'Mixed', c: {} }, { name: 'Old leather', c: { a: '#6b4a2b', b: '#8a5a3a', cc: '#4a3020' } }, { name: 'Arcane', c: { a: '#5a3a6a', b: '#2b2b30', cc: '#2f4f6f' } }],
    desc: 'Stacks of books on the floor, with one left open.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const cols = [c.a, c.b, c.cc, '#a07a2a', '#6b4a2b'];
      for (const [x, y, n] of [[16, 12, 5], [54, 22, 3], [22, 56, 4]]) {
        for (let i = 0; i < n; i++) book(g, x + (r() - 0.5) * 4, y + (r() - 0.5) * 4, 30 - i * 1.5, 22 - i, cols[(i + x) % cols.length], (r() - 0.5) * 0.5);
      }
      g.save();
      g.translate(70, 72);
      g.rotate(-0.3);
      rr(g, -18, -11, 36, 22, 1.5);
      paint(g, c.a, INK, 1);
      rr(g, -16, -9, 15.5, 18, 1);
      paint(g, '#efe6cf', INK, 0.8);
      rr(g, 0.5, -9, 15.5, 18, 1);
      paint(g, '#efe6cf', INK, 0.8);
      g.restore();
    },
  },
  {
    id: 'scroll-rack', name: 'Scroll rack', cat: 'storage', sets: ['wizard', 'temple', 'castle', 'desert', 'town'], tags: ['scrolls', 'cubbies', 'archive', 'library', 'documents', 'pigeonholes'],
    w: 2, h: 1, blocksMovement: true, blocksSight: true, c: { wood: WOOD.oak }, variants: WV,
    desc: 'A lattice of cubbies stuffed with rolled scrolls. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shelfCase(g, 6, 6, 188, 56, c.wood, r, (ix, iy, iw, id) => {
        const nx = 9, ny = 3, cw = iw / nx, ch = id / ny;
        for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
          const n = Math.floor(r() * 4);
          for (let k = 0; k < n; k++) {
            circle(g, ix + cw * (0.3 + (k % 2) * 0.4), iy + ch * (j + 0.3 + Math.floor(k / 2) * 0.4), Math.min(cw, ch) * 0.2);
            paint(g, r() < 0.15 ? '#c9b27f' : '#eadbb5', INK, 0.7);
          }
        }
        for (let i = 1; i < nx; i++) line(g, ix + i * cw, iy, ix + i * cw, iy + id, shade(c.wood, -0.05), 2);
        for (let j = 1; j < ny; j++) line(g, ix, iy + j * ch, ix + iw, iy + j * ch, shade(c.wood, -0.05), 2);
      });
      scroll(g, 120, 72, 30, 10, 0.2);
    },
  },
  {
    id: 'map-cabinet', name: 'Map cabinet', cat: 'storage', sets: ['wizard', 'castle', 'ship', 'town', 'camp'], tags: ['maps', 'charts', 'flat file', 'drawers', 'cartographer', 'navigator'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.brass, paper: '#e8dbb4' }, variants: WV,
    desc: 'A wide cabinet of shallow drawers, with a chart weighed down on top.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 6, 8, 188, 58, c.wood, r, 'h', 3, 4);
      drawerStrip(g, 6, 62, 188, 12, c.wood, c.metal, 3);
      rr(g, 28, 13, 144, 46, 2);
      paint(g, litFill(g, 28, 13, 144, 46, c.paper, 0.12), INK, 1.2);
      blob(g, lumpy(80, 34, 22, 0.45, 10, r, 14));
      paint(g, alpha('#9ab07a', 0.6), alpha('#5a4a2a', 0.8), 1);
      blob(g, lumpy(136, 40, 14, 0.5, 9, r, 10));
      paint(g, alpha('#9ab07a', 0.6), alpha('#5a4a2a', 0.8), 1);
      g.setLineDash([4, 3]);
      g.beginPath();
      g.moveTo(66, 40);
      g.quadraticCurveTo(110, 18, 134, 40);
      stroke(g, '#a3312c', 1.5);
      g.setLineDash([]);
      for (const [x, y] of [[30, 15], [170, 15], [30, 57], [170, 57]]) {
        circle(g, x, y, 4.5);
        paint(g, domeFill(g, x, y, 4.5, c.metal, 0.5), INK, 1);
      }
    },
  },
  // ---- rugs, screens and beds
  {
    id: 'rug-round', name: 'Round rug', cat: 'decor', sets: ['castle', 'tavern', 'town', 'wizard', 'temple'], tags: ['rug', 'carpet', 'round', 'floor', 'medallion'],
    w: 2, h: 2, layer: 'floor', flat: true, c: { cloth: CLOTH.red, trim: CLOTH.gold, motif: CLOTH.blue },
    variants: [{ name: 'Red', c: {} }, { name: 'Blue', c: { cloth: CLOTH.blue, motif: CLOTH.red } }, { name: 'Green', c: { cloth: CLOTH.green, motif: CLOTH.gold, trim: '#e6e0d2' } }, { name: 'Purple', c: { cloth: CLOTH.purple, motif: '#e6e0d2' } }],
    draw: ({ g, c }) => {
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * TAU;
        line(g, 100 + Math.cos(a) * 86, 100 + Math.sin(a) * 86, 100 + Math.cos(a) * 94, 100 + Math.sin(a) * 94, alpha(c.trim, 0.9), 1.4);
      }
      circle(g, 100, 100, 87);
      paint(g, domeFill(g, 100, 100, 87, c.cloth, 0.1), INK, 1.6);
      circle(g, 100, 100, 78);
      stroke(g, c.trim, 3);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        ellipse(g, 100 + Math.cos(a) * 46, 100 + Math.sin(a) * 46, 20, 9, a);
        paint(g, c.motif, alpha(c.trim, 0.9), 1.4);
      }
      circle(g, 100, 100, 24);
      paint(g, c.trim, INK, 1.2);
      circle(g, 100, 100, 14);
      paint(g, c.motif, alpha(INK, 0.6), 1);
    },
  },
  {
    id: 'rug-runner', name: 'Rug runner', cat: 'decor', sets: ['castle', 'temple', 'town', 'tavern', 'wizard'], tags: ['rug', 'carpet', 'runner', 'hall', 'aisle', 'floor', 'long'],
    w: 1, h: 3, layer: 'floor', flat: true, c: { cloth: CLOTH.red, trim: CLOTH.gold, motif: CLOTH.black },
    variants: [{ name: 'Red', c: {} }, { name: 'Blue', c: { cloth: CLOTH.blue } }, { name: 'Green', c: { cloth: CLOTH.green } }, { name: 'Purple', c: { cloth: CLOTH.purple } }],
    desc: 'A long carpet for a hall or temple aisle.',
    draw: ({ g, c }) => {
      fringe(g, 20, 8, 80, -1, c.trim);
      fringe(g, 20, 292, 80, 1, c.trim);
      rr(g, 16, 8, 68, 284, 2);
      paint(g, litFill(g, 16, 8, 68, 284, c.cloth, 0.08), INK, 1.6);
      rr(g, 23, 15, 54, 270, 1);
      stroke(g, c.trim, 2.4);
      for (let i = 0; i < 6; i++) {
        const y = 38 + i * 45;
        poly(g, [[50, y - 16], [66, y], [50, y + 16], [34, y]]);
        paint(g, c.motif, c.trim, 1.6);
        circle(g, 50, y, 4);
        paint(g, c.trim, null);
      }
    },
  },
  {
    id: 'rug-pelt', name: 'Fur pelt rug', cat: 'decor', sets: ['castle', 'tavern', 'winter', 'forest', 'camp'], tags: ['fur', 'pelt', 'hide', 'rug', 'hunting lodge', 'floor', 'skin'],
    w: 2, h: 2, layer: 'floor', flat: true, c: { fur: '#6e5a48' },
    variants: [{ name: 'Brown', c: {} }, { name: 'White', c: { fur: '#e6e2d8' } }, { name: 'Grey', c: { fur: '#8a8a88' } }, { name: 'Black', c: { fur: '#3a3430' } }],
    desc: 'A great furred hide spread flat on the floor.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const legs = [[40, 50, -0.7], [160, 50, 0.7], [44, 156, 0.7], [156, 156, -0.7]];
      for (const [x, y, a] of legs) {
        ellipse(g, x, y, 26, 12, a);
        paint(g, shade(c.fur, -0.08), INK, 1.6);
      }
      blob(g, lumpy(100, 104, 62, 0.12, 14, r, 72));
      paint(g, domeFill(g, 100, 100, 72, c.fur, 0.2), INK, LW);
      ellipse(g, 100, 28, 20, 18);
      paint(g, domeFill(g, 100, 28, 20, c.fur, 0.3), INK, LW);
      for (const k of [-1, 1]) {
        circle(g, 100 + k * 15, 14, 6);
        paint(g, shade(c.fur, -0.2), INK, 1.2);
      }
      ellipse(g, 100, 40, 8, 6);
      paint(g, shade(c.fur, -0.35), INK, 1);
      g.save();
      blob(g, lumpy(100, 104, 60, 0.1, 14, r, 70));
      g.clip();
      for (let i = 0; i < 90; i++) {
        const x = 44 + r() * 112, y = 36 + r() * 136;
        line(g, x, y, x + (r() - 0.5) * 5, y + 6, alpha(shade(c.fur, r() < 0.5 ? -0.4 : 0.3), 0.55), 1);
      }
      g.restore();
    },
  },
  {
    id: 'hearth-rug', name: 'Braided hearth rug', cat: 'decor', sets: ['tavern', 'farm', 'town', 'castle', 'winter'], tags: ['rug', 'braided', 'hearth', 'fireplace', 'floor', 'cottage'],
    w: 2, h: 1, layer: 'floor', flat: true, c: { a: '#a3412c', b: '#c9a05a', cc: '#5a6a4a' },
    variants: [{ name: 'Autumn', c: {} }, { name: 'Blue and cream', c: { a: '#2f5d8a', b: '#e6e0d2', cc: '#7a8a9a' } }, { name: 'Earth', c: { a: '#7a5638', b: '#b9a17d', cc: '#4e4b48' } }],
    desc: 'A half-round braided rug; lay its straight top edge along a hearth.',
    draw: ({ g, c }) => {
      const cols = [c.a, c.b, c.cc];
      for (let i = 0; i < 8; i++) {
        const rx = 92 - i * 10, ry = 86 - i * 10;
        if (rx <= 0 || ry <= 0) break;
        g.beginPath();
        g.ellipse(100, 6, rx, ry, 0, 0, Math.PI);
        g.closePath();
        paint(g, cols[i % 3], i ? alpha(INK, 0.35) : INK, i ? 1 : 1.8);
        g.save();
        g.clip();
        g.setLineDash([3, 3]);
        g.beginPath();
        g.ellipse(100, 6, rx - 4, ry - 4, 0, 0, Math.PI);
        stroke(g, alpha(shade(cols[i % 3], -0.35), 0.8), 2);
        g.setLineDash([]);
        g.restore();
      }
    },
  },
  {
    id: 'folding-screen', name: 'Folding screen', cat: 'decor', sets: ['castle', 'town', 'tavern', 'temple', 'wizard'], tags: ['screen', 'partition', 'privacy', 'dressing', 'divider'],
    w: 2, h: 1, blocksMovement: true, blocksSight: true, c: { wood: WOOD.walnut, cloth: '#d9c9a0' },
    variants: [{ name: 'Linen', c: {} }, { name: 'Red silk', c: { cloth: CLOTH.red, wood: WOOD.ebony } }, { name: 'Blue silk', c: { cloth: CLOTH.blue } }, { name: 'Painted reeds', c: { cloth: '#b8c49a', wood: WOOD.pine } }],
    desc: 'A four-panel folding screen standing in a zigzag.',
    draw: ({ g, c }) => {
      const pts = [[10, 36], [56, 64], [100, 36], [146, 64], [190, 36]];
      for (let i = 0; i < 4; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
        line(g, x1, y1, x2, y2, INK, 11);
        line(g, x1, y1, x2, y2, shade(c.cloth, i % 2 ? -0.12 : 0.05), 8);
        line(g, x1, y1, x2, y2, alpha(shade(c.wood, 0.1), 0.9), 1.6);
      }
      for (const [x, y] of pts) {
        circle(g, x, y, 5.5);
        paint(g, domeFill(g, x, y, 5.5, c.wood, 0.4), INK, 1.2);
      }
    },
  },
  {
    id: 'cot', name: 'Camp cot', cat: 'furniture', sets: ['camp', 'castle', 'temple', 'ship', 'dungeon'], tags: ['bed', 'cot', 'field', 'infirmary', 'soldier', 'barracks', 'canvas'],
    w: 1, h: 2, blocksMovement: true, c: { wood: WOOD.pine, cloth: '#b8a77a', blanket: '#6e6a4a' },
    variants: [{ name: 'Canvas', c: {} }, { name: 'Infirmary white', c: { cloth: '#e6e0d2', blanket: '#a3b8c8' } }, { name: 'Red blanket', c: { blanket: CLOTH.red } }],
    desc: 'A folding canvas cot on a wooden frame.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const y of [30, 100, 170]) {
        line(g, 16, y - 12, 84, y + 12, INK, 5);
        line(g, 16, y - 12, 84, y + 12, shade(c.wood, -0.2), 3);
        line(g, 84, y - 12, 16, y + 12, INK, 5);
        line(g, 84, y - 12, 16, y + 12, shade(c.wood, -0.2), 3);
      }
      for (const x of [20, 80]) {
        line(g, x, 8, x, 192, INK, 7);
        line(g, x, 8, x, 192, shade(c.wood, 0.05), 4.6);
      }
      rr(g, 22, 10, 56, 180, 2);
      paint(g, litFill(g, 22, 10, 56, 180, c.cloth, 0.15), INK, 1.4);
      pad(g, 28, 16, 44, 20, '#e8e2d2', 8, 1.1);
      cloth(g, 24, 110, 52, 70, c.blanket, r, 3, 3);
    },
  },
  {
    id: 'straw-bed', name: 'Straw pallet', cat: 'furniture', sets: ['farm', 'dungeon', 'camp', 'cave', 'tavern'], tags: ['bed', 'straw', 'pallet', 'poor', 'cell', 'stable', 'mattress'],
    w: 1, h: 2, c: { straw: '#d2b468', blanket: '#7a6a50' },
    variants: [{ name: 'Fresh straw', c: {} }, { name: 'Old straw', c: { straw: '#a89060', blanket: '#5a4e40' } }, { name: 'Red blanket', c: { blanket: '#8a3a2a' } }],
    desc: 'A heap of straw with a rough blanket: a cell or stable bed.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 100, 40, 0.12, 14, r, 88));
      paint(g, domeFill(g, 50, 100, 88, c.straw, 0.25), INK, LW);
      g.save();
      blob(g, lumpy(50, 100, 38, 0.1, 14, r, 86));
      g.clip();
      for (let i = 0; i < 70; i++) {
        const x = 12 + r() * 76, y = 14 + r() * 172, a = r() * TAU;
        line(g, x, y, x + Math.cos(a) * 9, y + Math.sin(a) * 9, alpha(shade(c.straw, r() < 0.5 ? -0.35 : 0.3), 0.8), 1);
      }
      g.restore();
      g.save();
      g.translate(52, 128);
      g.rotate(0.12);
      cloth(g, -32, -40, 64, 80, c.blanket, r, 3, 6);
      g.restore();
    },
  },
  {
    id: 'chaise-longue', name: 'Chaise longue', cat: 'furniture', sets: ['castle', 'town', 'wizard'], tags: ['daybed', 'couch', 'lounge', 'sofa', 'parlour', 'fainting couch'],
    w: 1, h: 2, blocksMovement: true, c: { wood: WOOD.walnut, cloth: CLOTH.purple }, variants: CLOTHS('cloth'),
    desc: 'A long upholstered day-bed with a curled head end at the top.',
    draw: ({ g, c }) => {
      for (const [x, y] of [[20, 16], [80, 16], [20, 186], [80, 186]]) {
        circle(g, x, y, 4.5);
        paint(g, domeFill(g, x, y, 4.5, c.wood, 0.4), INK, 1);
      }
      rr(g, 16, 12, 68, 178, 10);
      paint(g, litFill(g, 16, 12, 68, 178, shade(c.wood, 0.05), 0.25), INK, LW);
      pad(g, 22, 42, 56, 142, c.cloth, 10);
      tufts(g, 22, 50, 56, 120, c.cloth, 2, 5);
      g.beginPath();
      g.moveTo(14, 46);
      g.quadraticCurveTo(14, 6, 50, 6);
      g.quadraticCurveTo(86, 6, 86, 46);
      g.closePath();
      paint(g, domeFill(g, 50, 26, 40, shade(c.cloth, -0.08), 0.35), INK, LW);
      pad(g, 26, 36, 48, 16, shade(c.cloth, 0.1), 8, 1.1);
    },
  },
];

// ---------------------------------------------------------------- dungeon and room dressing

/** A barrel lying on its side, axis along y, seen from above. */
function barrelSide(g: G, cx: number, cy: number, wid: number, len: number, wood: string, r: R) {
  rr(g, cx - wid / 2, cy - len / 2, wid, len, wid * 0.45);
  paint(g, litFill(g, cx - wid / 2, cy - len / 2, wid, len, wood, 0.3), INK, LW);
  g.save();
  rr(g, cx - wid / 2, cy - len / 2, wid, len, wid * 0.45);
  g.clip();
  boards(g, cx - wid / 2, cy - len / 2, wid, len, wood, r, 'v', 4);
  const gr = g.createLinearGradient(cx - wid / 2, 0, cx + wid / 2, 0);
  gr.addColorStop(0, 'rgba(0,0,0,0.35)');
  gr.addColorStop(0.4, 'rgba(255,255,255,0.12)');
  gr.addColorStop(1, 'rgba(0,0,0,0.4)');
  g.fillStyle = gr;
  g.fillRect(cx - wid / 2, cy - len / 2, wid, len);
  g.restore();
  for (const k of [-0.32, 0.32]) {
    line(g, cx - wid / 2 + 2, cy + len * k, cx + wid / 2 - 2, cy + len * k, INK, 4.4);
    line(g, cx - wid / 2 + 2, cy + len * k, cx + wid / 2 - 2, cy + len * k, METAL.iron, 2.6);
  }
  rr(g, cx - wid / 2, cy - len / 2, wid, len, wid * 0.45);
  stroke(g, INK, LW);
}

/** A broken plank with a jagged end. */
function plank(g: G, cx: number, cy: number, len: number, wid: number, rot: number, wood: string, r: R) {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  const j = len * 0.12;
  poly(g, [[-len / 2, -wid / 2], [len / 2 - j * r(), -wid / 2], [len / 2, -wid * 0.1], [len / 2 - j, wid * 0.2], [len / 2 - j * 0.4, wid / 2], [-len / 2, wid / 2]]);
  paint(g, litFill(g, -len / 2, -wid / 2, len, wid, wood, 0.25), INK, 1.4);
  fgrain(g, -len / 2, -wid / 2, len, wid, wood, r, 'h', 2);
  g.restore();
}

const DRESSING: ObjDef[] = [
  {
    id: 'spear-rack', name: 'Round spear rack', cat: 'furniture', sets: ['castle', 'camp', 'dungeon', 'town'], tags: ['armory', 'spears', 'polearms', 'weapons', 'guard', 'barracks', 'rack'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.silver },
    variants: [{ name: 'Oak and steel', c: {} }, { name: 'Dark wood', c: { wood: WOOD.ebony } }, { name: 'Rusty', c: { metal: METAL.rust, wood: WOOD.walnut } }],
    desc: 'A round standing rack of spears and pikes, points up.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      roundPanel(g, 50, 50, 30, shade(c.wood, -0.1), r, 3);
      hoop(g, 50, 50, 24, METAL.iron, 3);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + 0.2, x = 50 + Math.cos(a) * 24, y = 50 + Math.sin(a) * 24;
        circle(g, x, y, 4);
        paint(g, shade(c.wood, 0.05), INK, 1);
        g.save();
        g.translate(x + Math.cos(a) * 9, y + Math.sin(a) * 9);
        g.rotate(a);
        poly(g, [[8, 0], [0, -3.6], [-6, 0], [0, 3.6]]);
        paint(g, litFill(g, -6, -4, 14, 8, c.metal, 0.4), INK, 1);
        g.restore();
      }
      circle(g, 50, 50, 6);
      paint(g, domeFill(g, 50, 50, 6, METAL.iron, 0.5), INK, 1);
    },
  },
  {
    id: 'shield-wall', name: 'Shield display', cat: 'decor', sets: ['castle', 'tavern', 'camp', 'town', 'ship'], tags: ['shields', 'heraldry', 'trophy', 'wall', 'swords', 'hall', 'armory'],
    w: 2, h: 1, c: { wood: WOOD.walnut, metal: METAL.iron, a: CLOTH.red, b: CLOTH.blue, cc: CLOTH.gold },
    variants: [{ name: 'Painted', c: {} }, { name: 'Faded', c: { a: '#8a5a4a', b: '#6a7a8a', cc: '#b8a06a' } }, { name: 'Black and white', c: { a: '#2b2b30', b: '#e6e0d2', cc: '#8a8780' } }],
    desc: 'Shields and crossed swords hung on a wall. Put the top edge on a wall.',
    draw: ({ g, c }) => {
      rr(g, 6, 2, 188, 9, 2);
      paint(g, litFill(g, 6, 2, 188, 9, c.wood, 0.3), INK, 1.6);
      for (const [x, col] of [[44, c.a], [100, c.b], [156, c.cc]] as [number, string][]) {
        g.beginPath();
        g.ellipse(x, 10, 24, 22, 0, 0, Math.PI);
        g.closePath();
        paint(g, litFill(g, x - 24, 10, 48, 22, col, 0.3), INK, LW);
        g.beginPath();
        g.ellipse(x, 10, 24, 22, 0, 0, Math.PI);
        stroke(g, c.metal, 2.2);
        circle(g, x, 16, 5);
        paint(g, domeFill(g, x, 16, 5, c.metal, 0.5), INK, 1);
      }
      for (const [x1, x2] of [[60, 84], [84, 60], [116, 140], [140, 116]]) {
        line(g, x1, 12, x2, 44, INK, 4.4);
        line(g, x1, 12, x2, 44, mix(c.metal, '#dfe4e8', 0.5), 2.6);
      }
    },
  },
  {
    id: 'crate-stack', name: 'Stacked crates', cat: 'storage', sets: ['dungeon', 'ship', 'town', 'market', 'mine', 'castle'], tags: ['crates', 'boxes', 'stack', 'warehouse', 'cargo', 'tall', 'cover'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { wood: '#9a7048' },
    variants: [{ name: 'Plain', c: {} }, { name: 'Dark', c: { wood: WOOD.walnut } }, { name: 'Pale', c: { wood: WOOD.pine } }],
    desc: 'Three crates stacked taller than a person.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      crateLid(g, 6, 8, 86, c.wood, r);
      rr(g, 20, 20, 64, 64, 2);
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fill();
      g.save();
      g.translate(48, 48);
      g.rotate(0.12);
      crateLid(g, -32, -32, 64, shade(c.wood, 0.06), r);
      g.restore();
    },
  },
  {
    id: 'barrel-group', name: 'Barrel cluster', cat: 'storage', sets: ['tavern', 'ship', 'town', 'market', 'castle', 'dungeon'], tags: ['barrels', 'casks', 'cellar', 'storage', 'ale', 'cover'],
    w: 2, h: 2, blocksMovement: true, c: { wood: '#8a5a34' },
    variants: [{ name: 'Oak', c: {} }, { name: 'Dark', c: { wood: WOOD.walnut } }, { name: 'Pale', c: { wood: WOOD.pine } }],
    desc: 'Four barrels standing together.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const [x, y, s] of [[52, 52, 40], [148, 54, 38], [54, 148, 37], [146, 146, 41]]) barrelTop(g, x, y, s, shade(c.wood, (r() - 0.5) * 0.12), r);
    },
  },
  {
    id: 'barrel-stack', name: 'Barrel stack', cat: 'storage', sets: ['tavern', 'ship', 'town', 'castle', 'market'], tags: ['barrels', 'casks', 'cellar', 'lying', 'pyramid', 'wine', 'ale'],
    w: 2, h: 1, blocksMovement: true, c: { wood: '#8a5a34' },
    variants: [{ name: 'Oak', c: {} }, { name: 'Dark', c: { wood: WOOD.walnut } }, { name: 'Pale', c: { wood: WOOD.pine } }],
    desc: 'Barrels laid on their sides, two on three, ends to the bottom edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const x of [36, 100, 164]) barrelSide(g, x, 50, 58, 86, c.wood, r);
      for (const x of [68, 132]) barrelSide(g, x, 50, 56, 82, shade(c.wood, 0.08), r);
    },
  },
  {
    id: 'wall-shelves', name: 'Wall shelves', cat: 'storage', sets: ['tavern', 'farm', 'town', 'wizard', 'castle', 'dungeon'], tags: ['shelf', 'jars', 'pots', 'wall', 'storage', 'pantry', 'clutter'],
    w: 2, h: 1, c: { wood: WOOD.pine }, variants: WV,
    desc: 'Plank shelves on iron brackets, crowded with jars and pots. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const x of [24, 176]) {
        rr(g, x - 3, 2, 6, 34, 1);
        paint(g, METAL.iron, INK, 1);
      }
      panel(g, 6, 4, 188, 30, c.wood, r, 'h', 2, 2);
      const cols = ['#a0603a', '#6a8a6a', '#c9b48a', '#5a7a9a', '#8a4a4a'];
      for (let i = 0; i < 8; i++) {
        const x = 20 + i * 22 + (r() - 0.5) * 4, y = 18 + (r() - 0.5) * 4;
        if (i % 3 === 1) bottle(g, x, y, 5.5, cols[i % cols.length]);
        else {
          circle(g, x, y, 8);
          paint(g, domeFill(g, x, y, 8, cols[i % cols.length], 0.45), INK, 1);
          circle(g, x, y, 4);
          paint(g, domeFill(g, x, y, 4, '#8a6a44', 0.35), INK, 0.8);
        }
      }
    },
  },
  {
    id: 'herbs-drying', name: 'Drying herbs', cat: 'kitchen', sets: ['farm', 'wizard', 'swamp', 'forest', 'tavern', 'town'], tags: ['herbs', 'hanging', 'drying', 'witch', 'apothecary', 'garlic', 'overhead'],
    w: 2, h: 1, layer: 'overhead', c: { wood: WOOD.oak, herb: '#6a8a4a' },
    variants: [{ name: 'Green herbs', c: {} }, { name: 'Lavender', c: { herb: '#9a7ac8' } }, { name: 'Dried, brown', c: { herb: '#9a8a5a' } }],
    desc: 'Bundles of herbs hung from a pole under the ceiling.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const x of [14, 186]) chain(g, x, 50, x, 6, METAL.iron, 2);
      line(g, 8, 50, 192, 50, INK, 9);
      line(g, 8, 50, 192, 50, shade(c.wood, 0.05), 6.4);
      for (let i = 0; i < 6; i++) {
        const x = 32 + i * 27;
        bundle(g, x, 50 + (i % 2 ? 6 : -6), 13, i === 2 ? '#e8e0c8' : shade(c.herb, (r() - 0.5) * 0.25), r);
      }
    },
  },
  {
    id: 'cauldron-tripod', name: 'Cauldron over fire', cat: 'kitchen', sets: ['camp', 'swamp', 'forest', 'wizard', 'cave', 'farm'], tags: ['cauldron', 'tripod', 'cooking', 'fire', 'witch', 'stew', 'brew'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 10, dim: 10, color: TORCH }, c: { metal: '#2c2e32', brew: '#6a9a3a', wood: WOOD.walnut },
    variants: [{ name: 'Green brew', c: {} }, { name: 'Stew', c: { brew: '#9a5a2a' } }, { name: 'Purple potion', c: { brew: '#8a4ac8' } }, { name: 'Blood red', c: { brew: '#8a1c1c' } }],
    desc: 'A pot hung from an iron tripod over a cookfire.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.3;
        line(g, 50 + Math.cos(a) * 18, 50 + Math.sin(a) * 18, 50 + Math.cos(a) * 40, 50 + Math.sin(a) * 40, INK, 6);
        line(g, 50 + Math.cos(a) * 18, 50 + Math.sin(a) * 18, 50 + Math.cos(a) * 40, 50 + Math.sin(a) * 40, shade(c.wood, -0.2), 4);
      }
      fireAt(g, 50, 50, 24, r);
      circle(g, 50, 50, 23);
      paint(g, domeFill(g, 50, 50, 23, c.metal, 0.4), INK, LW);
      circle(g, 50, 50, 17);
      paint(g, domeFill(g, 54, 54, 17, c.brew, 0.3), INK, 1.2);
      for (let i = 0; i < 4; i++) {
        circle(g, 44 + r() * 14, 44 + r() * 14, 1.5 + r() * 2);
        stroke(g, alpha(shade(c.brew, 0.5), 0.8), 1);
      }
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU - Math.PI / 2;
        bar(g, 50, 50, 50 + Math.cos(a) * 44, 50 + Math.sin(a) * 44, '#4a4d52', 3);
      }
      ringPull(g, 50, 50, 4, '#6c6f73');
    },
  },
  {
    id: 'cobweb-corner', name: 'Corner cobwebs', cat: 'decor', sets: ['dungeon', 'crypt', 'cave', 'castle', 'sewer', 'mine'], tags: ['cobweb', 'spider', 'web', 'abandoned', 'dust', 'corner', 'overhead'],
    w: 1, h: 1, layer: 'overhead', flat: true, c: { web: '#e8e8e4' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Dusty', c: { web: '#c9bfa8' } }, { name: 'Ghostly', c: { web: '#bfe8d8' } }],
    desc: 'Old webs strung across a ceiling corner: put its top-left corner in the room corner.',
    draw: ({ g, c }) => {
      const spokes = 6;
      for (let i = 0; i <= spokes; i++) {
        const a = (i / spokes) * (Math.PI / 2);
        line(g, 2, 2, 2 + Math.cos(a) * 92, 2 + Math.sin(a) * 92, alpha(c.web, 0.85), 1.1);
      }
      for (let k = 1; k <= 5; k++) {
        const rad = k * 17;
        g.beginPath();
        for (let i = 0; i <= spokes; i++) {
          const a = (i / spokes) * (Math.PI / 2), x = 2 + Math.cos(a) * rad, y = 2 + Math.sin(a) * rad;
          if (!i) g.moveTo(x, y);
          else {
            const am = ((i - 0.5) / spokes) * (Math.PI / 2), sag = rad * 0.82;
            g.quadraticCurveTo(2 + Math.cos(am) * sag, 2 + Math.sin(am) * sag, x, y);
          }
        }
        stroke(g, alpha(c.web, 0.7), 0.9);
      }
      g.beginPath();
      g.moveTo(60, 2);
      g.quadraticCurveTo(70, 30, 98, 40);
      stroke(g, alpha(c.web, 0.5), 0.8);
    },
  },
  {
    id: 'broken-furniture', name: 'Smashed furniture', cat: 'decor', sets: ['dungeon', 'tavern', 'castle', 'town', 'crypt', 'cave'], tags: ['broken', 'debris', 'wreckage', 'chair', 'splinters', 'ransacked', 'difficult'],
    w: 1, h: 1, difficult: true, c: { wood: WOOD.oak }, variants: WV.slice(0, 3),
    desc: 'The wreck of a chair and table: difficult ground.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      plank(g, 46, 40, 62, 14, 0.5, c.wood, r);
      plank(g, 56, 64, 54, 12, -0.3, shade(c.wood, -0.08), r);
      chairAt(g, 30, 70, 34, 2.2, c.wood, r);
      for (let i = 0; i < 4; i++) {
        const x = 15 + r() * 70, y = 15 + r() * 70, a = r() * TAU;
        line(g, x, y, x + Math.cos(a) * 18, y + Math.sin(a) * 18, INK, 5);
        line(g, x, y, x + Math.cos(a) * 18, y + Math.sin(a) * 18, shade(c.wood, -0.2), 3);
      }
      for (let i = 0; i < 10; i++) {
        const x = 10 + r() * 80, y = 10 + r() * 80, a = r() * TAU;
        poly(g, [[x, y], [x + Math.cos(a) * 7, y + Math.sin(a) * 7], [x + Math.cos(a + 0.4) * 4, y + Math.sin(a + 0.4) * 4]]);
        paint(g, shade(c.wood, 0.1), INK, 0.7);
      }
    },
  },
  {
    id: 'bookshelf-fallen', name: 'Toppled bookshelf', cat: 'decor', sets: ['wizard', 'castle', 'dungeon', 'crypt', 'town', 'temple'], tags: ['bookshelf', 'fallen', 'books', 'ransacked', 'wreckage', 'library', 'difficult'],
    w: 2, h: 1, difficult: true, c: { wood: WOOD.walnut }, variants: WV,
    desc: 'A bookcase lying face down with its books spilled round it: difficult ground.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 12; i++) book(g, 8 + r() * 170, (r() < 0.5 ? 2 : 70) + r() * 16, 16 + r() * 8, 11 + r() * 5, BOOKS[Math.floor(r() * BOOKS.length)], (r() - 0.5) * 2.4);
      g.save();
      g.translate(100, 50);
      g.rotate(-0.06);
      panel(g, -86, -26, 172, 52, c.wood, r, 'h', 3, 3);
      for (const x of [-30, 28]) line(g, x, -26, x, 26, alpha(shade(c.wood, -0.6), 0.8), 1.6);
      g.restore();
      for (let i = 0; i < 4; i++) {
        g.save();
        g.translate(20 + r() * 160, 12 + r() * 76);
        g.rotate(r() * TAU);
        rr(g, -6, -8, 12, 16, 1);
        paint(g, '#eadfc4', INK, 0.8);
        g.restore();
      }
    },
  },
  {
    id: 'skeleton-lying', name: 'Fallen skeleton', cat: 'decor', sets: ['dungeon', 'crypt', 'cave', 'desert', 'castle', 'sewer'], tags: ['skeleton', 'bones', 'corpse', 'remains', 'dead adventurer', 'body'],
    w: 1, h: 2, c: { bone: BONE, metal: METAL.iron },
    variants: [{ name: 'Bare bones', c: {} }, { name: 'With sword', c: {}, f: { sword: 1 } }, { name: 'Old and brown', c: { bone: '#b8a888' } }],
    desc: 'The bones of someone who did not make it, lying where they fell.',
    draw: ({ g, c, f }) => {
      const b = c.bone;
      if (f.sword) {
        line(g, 80, 60, 86, 170, INK, 6);
        line(g, 80, 60, 86, 170, mix(c.metal, '#dfe4e8', 0.4), 4);
        line(g, 72, 70, 90, 68, INK, 5);
        line(g, 72, 70, 90, 68, c.metal, 3);
      }
      boneAt(g, 50, 40, 50, 108, 4, b);
      for (let i = 0; i < 5; i++) {
        const y = 52 + i * 9, wd = 22 - i * 1.5;
        g.beginPath();
        g.moveTo(50 - wd, y + 6);
        g.quadraticCurveTo(50, y - 6, 50 + wd, y + 6);
        stroke(g, INK, 4.4);
        g.beginPath();
        g.moveTo(50 - wd, y + 6);
        g.quadraticCurveTo(50, y - 6, 50 + wd, y + 6);
        stroke(g, b, 2.6);
      }
      ellipse(g, 50, 114, 16, 10);
      paint(g, domeFill(g, 50, 114, 16, b, 0.3), INK, 1.4);
      boneAt(g, 28, 48, 18, 84, 3.6, b);
      boneAt(g, 18, 84, 26, 114, 3, b);
      boneAt(g, 72, 48, 80, 80, 3.6, b);
      boneAt(g, 80, 80, 70, 104, 3, b);
      boneAt(g, 42, 122, 36, 158, 4.2, b);
      boneAt(g, 36, 158, 40, 190, 3.6, b);
      boneAt(g, 58, 122, 66, 156, 4.2, b);
      boneAt(g, 66, 156, 72, 188, 3.6, b);
      skull(g, 50, 24, 13, Math.PI, b);
    },
  },
  {
    id: 'skeleton-seated', name: 'Slumped skeleton', cat: 'decor', sets: ['dungeon', 'crypt', 'cave', 'sewer', 'castle'], tags: ['skeleton', 'bones', 'corpse', 'chained', 'prisoner', 'remains', 'wall'],
    w: 1, h: 1, c: { bone: BONE, metal: METAL.iron },
    variants: [{ name: 'Bare bones', c: {} }, { name: 'Chained to wall', c: {}, f: { chains: 1 } }, { name: 'Old and brown', c: { bone: '#b8a888' } }],
    desc: 'Bones sitting slumped against a wall. Put the top edge on a wall.',
    draw: ({ g, c, f }) => {
      const b = c.bone;
      if (f.chains) {
        chain(g, 20, 2, 22, 40, c.metal, 2.4);
        chain(g, 80, 2, 78, 40, c.metal, 2.4);
      }
      boneAt(g, 50, 26, 50, 52, 3.6, b);
      for (let i = 0; i < 3; i++) {
        const y = 32 + i * 7;
        g.beginPath();
        g.moveTo(34, y + 4);
        g.quadraticCurveTo(50, y - 4, 66, y + 4);
        stroke(g, INK, 4.2);
        g.beginPath();
        g.moveTo(34, y + 4);
        g.quadraticCurveTo(50, y - 4, 66, y + 4);
        stroke(g, b, 2.4);
      }
      ellipse(g, 50, 56, 14, 8);
      paint(g, domeFill(g, 50, 56, 14, b, 0.3), INK, 1.3);
      boneAt(g, 30, 30, 22, 54, 3.2, b);
      boneAt(g, 22, 54, 34, 66, 2.8, b);
      boneAt(g, 70, 30, 78, 54, 3.2, b);
      boneAt(g, 78, 54, 68, 70, 2.8, b);
      boneAt(g, 42, 60, 34, 84, 3.8, b);
      boneAt(g, 34, 84, 40, 96, 3.2, b);
      boneAt(g, 58, 60, 70, 82, 3.8, b);
      boneAt(g, 70, 82, 62, 96, 3.2, b);
      skull(g, 54, 20, 11, 0.4, b);
    },
  },
  {
    id: 'debris-wood', name: 'Wood debris', cat: 'decor', sets: ['dungeon', 'mine', 'town', 'ship', 'cave', 'farm'], tags: ['debris', 'planks', 'wreckage', 'splinters', 'beams', 'collapse', 'difficult'],
    w: 1, h: 1, difficult: true, c: { wood: WOOD.oak }, variants: [...WV.slice(0, 3), { name: 'Burnt', c: { wood: '#3a2c22' } }],
    desc: 'Broken planks and beams: difficult ground.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 5; i++) plank(g, 22 + r() * 56, 22 + r() * 56, 40 + r() * 30, 9 + r() * 6, r() * Math.PI, shade(c.wood, (r() - 0.5) * 0.2), r);
      for (let i = 0; i < 6; i++) {
        const x = 12 + r() * 76, y = 12 + r() * 76;
        line(g, x, y, x + 5, y + 2, '#55585e', 1.3);
      }
      speckle(g, 10, 10, 80, 80, r, 14, alpha(shade(c.wood, -0.4), 0.6), 1.4);
    },
  },
  {
    id: 'sarcophagus-effigy', name: 'Effigy sarcophagus', cat: 'religious', sets: ['crypt', 'temple', 'castle', 'dungeon', 'desert'], tags: ['tomb', 'sarcophagus', 'effigy', 'knight', 'noble', 'burial', 'carved'],
    w: 1, h: 2, blocksMovement: true, c: { stone: STONE.grey, metal: METAL.bronze }, variants: STONES,
    desc: 'A stone tomb whose lid is carved with the sleeping figure of the one inside.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 10, 6, 80, 188, 4);
      paint(g, litFill(g, 10, 6, 80, 188, shade(c.stone, -0.1), 0.2), INK, LW);
      rr(g, 16, 12, 68, 176, 3);
      paint(g, litFill(g, 16, 12, 68, 176, c.stone, 0.22), INK, 1.4);
      bevel(g, 16, 12, 68, 176, 3, 0.3);
      speckle(g, 18, 14, 64, 172, r, 30, alpha(shade(c.stone, -0.5), 0.3), 1);
      const fig = shade(c.stone, 0.12);
      rr(g, 38, 20, 24, 10, 3);
      paint(g, litFill(g, 38, 20, 24, 10, shade(c.stone, -0.05), 0.2), INK, 1);
      ellipse(g, 50, 40, 11, 13);
      paint(g, domeFill(g, 50, 40, 11, fig, 0.35), INK, 1.3);
      g.beginPath();
      g.moveTo(32, 58);
      g.quadraticCurveTo(50, 50, 68, 58);
      g.lineTo(62, 176);
      g.lineTo(38, 176);
      g.closePath();
      paint(g, litFill(g, 32, 52, 36, 124, fig, 0.25), INK, 1.4);
      line(g, 50, 70, 50, 168, INK, 4.4);
      line(g, 50, 70, 50, 168, c.metal, 2.6);
      line(g, 42, 76, 58, 76, INK, 4.2);
      line(g, 42, 76, 58, 76, c.metal, 2.4);
      ellipse(g, 50, 84, 9, 7);
      paint(g, domeFill(g, 50, 84, 9, fig, 0.3), INK, 1.1);
      for (const x of [42, 58]) {
        ellipse(g, x, 178, 6, 5);
        paint(g, domeFill(g, x, 178, 6, fig, 0.3), INK, 1);
      }
    },
  },
  {
    id: 'sarcophagus-open', name: 'Open sarcophagus', cat: 'religious', sets: ['crypt', 'temple', 'dungeon', 'desert', 'castle'], tags: ['tomb', 'sarcophagus', 'open', 'opened', 'bones', 'looted', 'burial', 'undead'],
    w: 1, h: 2, blocksMovement: true, c: { stone: STONE.grey }, variants: STONES,
    desc: 'A stone coffin with its heavy lid shoved half off. Bones lie inside.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 12, 6, 76, 188, 4);
      paint(g, litFill(g, 12, 6, 76, 188, c.stone, 0.22), INK, LW);
      rr(g, 22, 16, 56, 168, 3);
      paint(g, '#1c1612', INK, 1.4);
      g.save();
      rr(g, 22, 16, 56, 168, 3);
      g.clip();
      skull(g, 46, 34, 9, Math.PI);
      boneAt(g, 48, 50, 50, 100, 3, BONE);
      boneAt(g, 34, 60, 40, 96, 2.6, BONE);
      boneAt(g, 42, 110, 36, 150, 3.2, BONE);
      boneAt(g, 56, 112, 62, 150, 3.2, BONE);
      g.restore();
      g.save();
      g.translate(62, 128);
      g.rotate(0.32);
      rr(g, -40, -60, 80, 120, 4);
      paint(g, litFill(g, -40, -60, 80, 120, shade(c.stone, 0.05), 0.25), INK, LW);
      bevel(g, -40, -60, 80, 120, 4, 0.3);
      rr(g, -32, -52, 64, 104, 2);
      stroke(g, alpha(shade(c.stone, -0.5), 0.6), 1.2);
      g.restore();
      speckle(g, 12, 6, 76, 188, r, 16, alpha(shade(c.stone, -0.5), 0.35), 1);
    },
  },
  {
    id: 'plinth-display', name: 'Display plinth', cat: 'decor', sets: ['temple', 'castle', 'crypt', 'wizard', 'dungeon', 'desert'], tags: ['pedestal', 'plinth', 'relic', 'idol', 'orb', 'museum', 'treasure', 'statue base'],
    w: 1, h: 1, blocksMovement: true, c: { stone: STONE.marble, metal: METAL.gold, gem: '#7fd6ff' },
    variants: [{ name: 'Crystal orb', c: {} }, { name: 'Urn', c: { stone: STONE.grey }, f: { item: 1 } }, { name: 'Golden idol', c: { stone: STONE.sand }, f: { item: 2 } }, { name: 'Skull', c: { stone: STONE.dark }, f: { item: 3 } }],
    desc: 'A waist-high stone pedestal with something on it worth stealing.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 14, 14, 72, 72, 4);
      paint(g, litFill(g, 14, 14, 72, 72, shade(c.stone, -0.1), 0.2), INK, LW);
      rr(g, 22, 22, 56, 56, 3);
      paint(g, litFill(g, 22, 22, 56, 56, c.stone, 0.25), INK, 1.4);
      bevel(g, 22, 22, 56, 56, 3, 0.3);
      speckle(g, 16, 16, 68, 68, r, 10, alpha(shade(c.stone, -0.5), 0.3), 1);
      const item = f.item ?? 0;
      if (item === 1) {
        circle(g, 50, 50, 16);
        paint(g, domeFill(g, 50, 50, 16, '#a0603a', 0.4), INK, 1.4);
        circle(g, 50, 50, 7);
        paint(g, domeFill(g, 50, 50, 7, '#5a3018', 0.3), INK, 1);
      } else if (item === 2) {
        glow(g, 50, 50, 26, '#ffd36a', 0.4);
        ellipse(g, 50, 56, 11, 14);
        paint(g, domeFill(g, 50, 56, 11, c.metal, 0.5), INK, 1.3);
        circle(g, 50, 40, 8);
        paint(g, domeFill(g, 50, 40, 8, c.metal, 0.5), INK, 1.2);
        gem(g, 50, 40, 3, '#d6402f');
      } else if (item === 3) {
        skull(g, 50, 48, 13, 0);
      } else {
        glow(g, 50, 50, 30, c.gem, 0.55);
        circle(g, 50, 50, 6);
        paint(g, domeFill(g, 50, 50, 6, c.metal, 0.5), INK, 1);
        circle(g, 50, 50, 14);
        paint(g, domeFill(g, 50, 50, 14, mix(c.gem, '#ffffff', 0.3), 0.55), alpha(shade(c.gem, -0.5), 0.9), 1.3);
      }
    },
  },
];

export const EXTRA_OBJECTS: ObjDef[] = [...LIGHTS, ...FURNITURE, ...DRESSING];

// More map objects: lighting, furniture and dungeon dressing added for the 3D view. Same rules as the other sets:
// original art drawn in code, 1 square = 100 art units, ids are stable once saved maps use them.
// Top-down, light from the top-left, ink outline. Wall-mounted pieces put the wall along the TOP edge of their box.
// Every object here has a matching 3D model in src/view3d/models-extra.ts, keyed by the same id.
import type { ObjDef, G, Variant } from '../art/types';
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

// ---------------------------------------------------------------- tall halls
// Pieces for grand rooms with high ceilings (the 3D view's halls are 24 ft tall): tall columns, galleries, great stairs,
// hangings, throne rooms, libraries and deep crypts. Ceiling-hung things use the overhead layer, so tokens pass under them.

const HSTONES = [
  { name: 'Marble', c: { stone: STONE.marble } },
  { name: 'Grey stone', c: { stone: STONE.grey } },
  { name: 'Dark stone', c: { stone: STONE.dark } },
  { name: 'Sandstone', c: { stone: STONE.sand } },
];
const STATUE_STONES: Variant[] = [
  { name: 'Grey stone', c: {} },
  { name: 'Marble', c: { stone: STONE.marble, body: '#e8e4dc' } },
  { name: 'Bronze', c: { stone: STONE.dark, body: '#9a6a34' } },
  { name: 'Verdigris', c: { stone: STONE.green, body: '#6f9a86' } },
];

/** Dressed stone blocks in running bond, clipped to a rect. */
function hBlocks(g: G, x: number, y: number, w: number, h: number, base: string, r: R, bw = 22, bh = 14) {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  for (let row = 0, yy = y; yy < y + h; row++, yy += bh) {
    for (let xx = x - (row % 2 ? bw / 2 : 0); xx < x + w; xx += bw) {
      const tone = shade(base, (r() - 0.5) * 0.18);
      g.fillStyle = litFill(g, xx, yy, bw, bh, tone, 0.12);
      g.fillRect(xx, yy, bw, bh);
      g.strokeStyle = alpha(shade(base, -0.55), 0.75);
      g.lineWidth = 1;
      g.strokeRect(xx + 0.5, yy + 0.5, bw - 1, bh - 1);
    }
  }
  g.restore();
}

/** A stone slab: blocks, a bevel and an ink edge. */
function slab(g: G, x: number, y: number, w: number, h: number, col: string, r: R, bw = 22, bh = 14, rad = 2) {
  rr(g, x, y, w, h, rad);
  paint(g, col, null);
  hBlocks(g, x, y, w, h, col, r, bw, bh);
  bevel(g, x, y, w, h, rad, 0.28);
  rr(g, x, y, w, h, rad);
  stroke(g, INK, LW);
}

/** A column seen from above: square base, round capital with flutes or a twist. */
function colTop(g: G, cx: number, cy: number, s: number, col: string, r: R, kind: 'flute' | 'twist' | 'plain' = 'plain') {
  rr(g, cx - s, cy - s, s * 2, s * 2, 3);
  paint(g, litFill(g, cx - s, cy - s, s * 2, s * 2, shade(col, -0.14), 0.22), INK, LW);
  bevel(g, cx - s, cy - s, s * 2, s * 2, 3, 0.3);
  const rad = s * 0.8;
  circle(g, cx, cy, rad);
  paint(g, domeFill(g, cx, cy, rad, col, 0.35), INK, LW);
  g.save();
  circle(g, cx, cy, rad);
  g.clip();
  if (kind === 'flute') {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      line(g, cx + Math.cos(a) * rad * 0.58, cy + Math.sin(a) * rad * 0.58, cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, alpha(shade(col, -0.55), 0.7), 1.7);
    }
  } else if (kind === 'twist') {
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      for (let j = 0; j <= 10; j++) {
        const t = j / 10, a = (i / 4) * TAU + t * 2.4, d = rad * (0.15 + t * 0.85);
        if (j === 0) g.moveTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
        else g.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
      }
      stroke(g, alpha(shade(col, -0.55), 0.8), 2.4);
    }
  }
  g.restore();
  circle(g, cx, cy, rad * 0.55);
  stroke(g, alpha('#ffffff', 0.22), 1.4);
  speckle(g, cx - s, cy - s, s * 2, s * 2, r, 8, alpha(shade(col, -0.5), 0.3), 1);
}

/** A strip of wall face along the top edge, for pieces that stand against a wall. */
function wallLip(g: G, x: number, w: number, h: number, col: string, r: R) {
  slab(g, x, 0, w, h, shade(col, -0.08), r, 18, h);
}

/** A soft dark shadow on the floor under something that hangs. */
function dropShadow(g: G, cx: number, cy: number, rx: number, ry = rx) {
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
  gr.addColorStop(0, 'rgba(0,0,0,0.32)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  ellipse(g, cx, cy, rx, ry);
  g.fill();
}

/** A sun mark (rays and a disc), the emblem on banners, altars and crests. */
function sunMark(g: G, cx: number, cy: number, s: number, col: string) {
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    poly(g, [[cx + Math.cos(a - 0.18) * s * 0.5, cy + Math.sin(a - 0.18) * s * 0.5], [cx + Math.cos(a) * s, cy + Math.sin(a) * s], [cx + Math.cos(a + 0.18) * s * 0.5, cy + Math.sin(a + 0.18) * s * 0.5]]);
    paint(g, shade(col, 0.1), INK, 0.9);
  }
  circle(g, cx, cy, s * 0.48);
  paint(g, domeFill(g, cx, cy, s * 0.48, col, 0.5), INK, 1.1);
}

/** A plinth for a tall statue, seen from above. */
function plinthTop(g: G, x: number, y: number, s: number, col: string, r: R) {
  rr(g, x, y, s, s, 4);
  paint(g, litFill(g, x, y, s, s, shade(col, -0.15), 0.2), INK, LW);
  rr(g, x + s * 0.08, y + s * 0.08, s * 0.84, s * 0.84, 3);
  paint(g, litFill(g, x + s * 0.08, y + s * 0.08, s * 0.84, s * 0.84, col, 0.25), INK, 1.4);
  bevel(g, x + s * 0.08, y + s * 0.08, s * 0.84, s * 0.84, 3, 0.3);
  speckle(g, x, y, s, s, r, 14, alpha(shade(col, -0.5), 0.3), 1);
}

/** A hanging chain seen from above, ending in a hook. */
function hookChain(g: G, x: number, y: number, len: number, a: number, metal: string) {
  const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
  chain(g, x, y, ex, ey, metal, 2.6);
  g.beginPath();
  g.arc(ex + Math.cos(a) * 4, ey + Math.sin(a) * 4, 4.5, a - 2.2, a + 2.2);
  stroke(g, INK, 4);
  g.beginPath();
  g.arc(ex + Math.cos(a) * 4, ey + Math.sin(a) * 4, 4.5, a - 2.2, a + 2.2);
  stroke(g, shade(metal, 0.15), 2);
}

/** Bars of a round cage seen from above. */
function cageTop(g: G, cx: number, cy: number, rad: number, metal: string, n = 10) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    bar(g, cx + Math.cos(a) * rad * 0.3, cy + Math.sin(a) * rad * 0.3, cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, metal, 2.2);
  }
  hoop(g, cx, cy, rad, metal, 3.6);
  circle(g, cx, cy, rad * 0.32);
  paint(g, domeFill(g, cx, cy, rad * 0.32, metal, 0.5), INK, 1.3);
  ringPull(g, cx, cy, rad * 0.14, metal);
}

const HALLS_ARCH: ObjDef[] = [
  {
    id: 'column-fluted', name: 'Tall fluted column', cat: 'structure', sets: ['temple', 'castle', 'crypt', 'dungeon', 'wizard', 'desert'], tags: ['column', 'pillar', 'fluted', 'hall', 'tall', 'marble', 'support', 'grand', 'cathedral'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { stone: STONE.marble }, variants: HSTONES,
    desc: 'A fluted column running all the way up to a high ceiling. Set them in pairs down a great hall.',
    draw: ({ g, c, seed }) => colTop(g, 50, 50, 42, c.stone, rng(seed), 'flute'),
  },
  {
    id: 'column-twisted', name: 'Twisted column', cat: 'structure', sets: ['temple', 'castle', 'wizard', 'crypt'], tags: ['column', 'pillar', 'spiral', 'barley twist', 'hall', 'tall', 'ornate'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { stone: STONE.marble },
    variants: [{ name: 'Marble', c: {} }, { name: 'Red stone', c: { stone: STONE.red } }, { name: 'Dark stone', c: { stone: STONE.dark } }, { name: 'Sandstone', c: { stone: STONE.sand } }],
    desc: 'A tall column whose shaft winds like a rope. Common in old palaces and wizard towers.',
    draw: ({ g, c, seed }) => colTop(g, 50, 50, 42, c.stone, rng(seed), 'twist'),
  },
  {
    id: 'column-cluster', name: 'Clustered pier', cat: 'structure', sets: ['temple', 'castle', 'crypt'], tags: ['column', 'pillar', 'pier', 'gothic', 'cathedral', 'hall', 'tall', 'support'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { stone: STONE.grey }, variants: STONES,
    desc: 'A thick pier of five shafts bundled together, the kind that holds up a cathedral roof.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 12, 12, 176, 176, 6);
      paint(g, litFill(g, 12, 12, 176, 176, shade(c.stone, -0.16), 0.2), INK, LW);
      bevel(g, 12, 12, 176, 176, 6, 0.3);
      rr(g, 26, 26, 148, 148, 5);
      paint(g, litFill(g, 26, 26, 148, 148, shade(c.stone, -0.06), 0.22), INK, 1.4);
      for (const [x, y] of [[100, 46], [154, 100], [100, 154], [46, 100]]) {
        circle(g, x, y, 28);
        paint(g, domeFill(g, x, y, 28, c.stone, 0.35), INK, LW);
      }
      circle(g, 100, 100, 48);
      paint(g, domeFill(g, 100, 100, 48, shade(c.stone, 0.06), 0.35), INK, LW);
      circle(g, 100, 100, 30);
      stroke(g, alpha('#ffffff', 0.2), 1.6);
      speckle(g, 14, 14, 172, 172, r, 22, alpha(shade(c.stone, -0.5), 0.3), 1.1);
    },
  },
  {
    id: 'half-column-wall', name: 'Wall half-column', cat: 'structure', sets: ['temple', 'castle', 'crypt', 'dungeon', 'wizard'], tags: ['pilaster', 'column', 'engaged', 'wall', 'tall', 'hall', 'support'],
    w: 1, h: 1, blocksMovement: true, c: { stone: STONE.marble }, variants: HSTONES,
    desc: 'Half a column built into the wall, running up to the ceiling. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      wallLip(g, 0, 100, 8, c.stone, r);
      rr(g, 10, 4, 80, 40, 3);
      paint(g, litFill(g, 10, 4, 80, 40, shade(c.stone, -0.14), 0.22), INK, LW);
      bevel(g, 10, 4, 80, 40, 3, 0.3);
      g.beginPath();
      g.arc(50, 6, 32, 0, Math.PI);
      g.closePath();
      paint(g, domeFill(g, 50, 6, 32, c.stone, 0.35), INK, LW);
      g.save();
      g.beginPath();
      g.arc(50, 6, 32, 0, Math.PI);
      g.closePath();
      g.clip();
      for (let i = 1; i < 8; i++) {
        const a = (i / 8) * Math.PI;
        line(g, 50 + Math.cos(a) * 18, 6 + Math.sin(a) * 18, 50 + Math.cos(a) * 32, 6 + Math.sin(a) * 32, alpha(shade(c.stone, -0.55), 0.7), 1.6);
      }
      g.restore();
    },
  },
  {
    id: 'window-stained-tall', name: 'Tall stained-glass window', cat: 'decor', sets: ['temple', 'castle', 'crypt', 'wizard'], tags: ['window', 'stained glass', 'arched', 'cathedral', 'light', 'tall', 'hall', 'chapel'],
    w: 2, h: 1, c: { stone: STONE.grey, a: '#c0392b', b: '#2f6db3', cc: '#e9c46a' },
    variants: [
      { name: 'Rose and sky', c: {} },
      { name: 'Royal', c: { stone: STONE.marble, a: '#3a4fb8', b: '#7a3aa8', cc: '#dfe7f2' } },
      { name: 'Emerald', c: { a: '#2e8b57', b: '#d4a640', cc: '#4fb3a8' } },
      { name: 'Blood moon', c: { stone: STONE.dark, a: '#8b1e1e', b: '#2b1f2e', cc: '#f0a040' } },
    ],
    desc: 'A tall arched window of coloured glass, throwing patches of colour on the floor. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const cols = [c.a, c.b, c.cc];
      g.save();
      poly(g, [[36, 14], [164, 14], [196, 98], [4, 98]]);
      g.clip();
      for (let row = 0; row < 5; row++) for (let i = 0; i < 7; i++) {
        const t = (row + 0.5) / 5, spread = 128 + t * 180, x = 100 - spread / 2 + (i + 0.5) * (spread / 7), y = 18 + row * 17;
        poly(g, [[x, y], [x + 9 + t * 4, y + 8], [x, y + 16], [x - 9 - t * 4, y + 8]]);
        g.fillStyle = alpha(cols[(i + row) % 3], 0.22 - t * 0.12);
        g.fill();
      }
      g.restore();
      wallLip(g, 0, 200, 10, c.stone, r);
      rr(g, 22, 4, 156, 16, 3);
      paint(g, litFill(g, 22, 4, 156, 16, c.stone, 0.3), INK, LW);
      for (let i = 0; i < 6; i++) {
        rr(g, 32 + i * 23, 8, 21, 7, 1);
        paint(g, alpha(cols[i % 3], 0.9), INK, 1);
      }
      line(g, 100, 6, 100, 18, INK, 2);
    },
  },
  {
    id: 'gallery-balcony', name: 'Gallery balcony', cat: 'structure', sets: ['castle', 'temple', 'town', 'wizard', 'tavern'], tags: ['balcony', 'gallery', 'mezzanine', 'upper floor', 'walkway', 'minstrel', 'overhead', 'tall'],
    w: 3, h: 1, layer: 'overhead', c: { stone: STONE.grey, metal: METAL.iron }, variants: STONES,
    desc: 'A stone walkway high on the wall with a railing, held up on brackets. Tokens below pass underneath. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 2, 0, 296, 80, 2);
      paint(g, c.stone, null);
      hBlocks(g, 2, 0, 296, 80, c.stone, r, 30, 20);
      sheen(g, 2, 0, 296, 80, 0.12);
      rr(g, 2, 0, 296, 80, 2);
      stroke(g, INK, LW);
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(2, 80, 296, 8);
      rr(g, 0, 70, 300, 13, 4);
      paint(g, litFill(g, 0, 70, 300, 13, shade(c.stone, 0.12), 0.3), INK, LW);
      for (let x = 14; x < 300; x += 34) {
        circle(g, x, 76.5, 5.5);
        paint(g, domeFill(g, x, 76.5, 5.5, shade(c.stone, 0.18), 0.4), INK, 1.1);
      }
    },
  },
  {
    id: 'stair-grand', name: 'Grand staircase', cat: 'structure', sets: ['castle', 'temple', 'town', 'wizard'], tags: ['stairs', 'staircase', 'steps', 'landing', 'grand', 'ascend', 'gallery', 'upper floor', 'tall'],
    w: 3, h: 4, c: { stone: STONE.marble, carpet: CLOTH.red, metal: METAL.brass },
    variants: [
      { name: 'Marble, red carpet', c: {} },
      { name: 'Grey stone, blue carpet', c: { stone: STONE.grey, carpet: CLOTH.blue, metal: METAL.silver } },
      { name: 'Dark stone, bare', c: { stone: STONE.dark }, f: { bare: 1 } },
      { name: 'Oak, green carpet', c: { stone: WOOD.oak, carpet: CLOTH.green, metal: METAL.gold } },
    ],
    desc: 'A broad flight of steps rising from the bottom edge to a landing at the top, about 13 ft up. Put the landing against a wall or under a gallery.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const n = 13, y0 = 100, step = 300 / n;
      slab(g, 22, 4, 256, 96, shade(c.stone, 0.12), r, 32, 24);
      for (let i = 0; i < n; i++) {
        const y = y0 + i * step, tone = shade(c.stone, 0.1 - (i / n) * 0.4);
        g.fillStyle = litFill(g, 22, y, 256, step, tone, 0.12);
        g.fillRect(22, y, 256, step);
        line(g, 22, y, 278, y, alpha(INK, 0.85), 1.6);
        line(g, 22, y + 2, 278, y + 2, alpha('#ffffff', 0.2), 1);
      }
      if (!f.bare) {
        rr(g, 104, 30, 92, 370, 2);
        paint(g, litFill(g, 104, 30, 92, 370, c.carpet, 0.2), INK, 1.4);
        line(g, 112, 30, 112, 400, alpha(CLOTH.gold, 0.7), 1.4);
        line(g, 188, 30, 188, 400, alpha(CLOTH.gold, 0.7), 1.4);
        for (let i = 0; i < n; i++) line(g, 100, y0 + i * step + 3, 200, y0 + i * step + 3, c.metal, 1.8);
      }
      for (const x of [0, 278]) {
        rr(g, x, 4, 22, 396, 3);
        paint(g, litFill(g, x, 4, 22, 396, shade(c.stone, -0.1), 0.25), INK, LW);
        bevel(g, x, 4, 22, 396, 3, 0.3);
      }
      for (const [x, y] of [[11, 388], [289, 388], [11, 100], [289, 100]]) {
        rr(g, x - 13, y - 13, 26, 26, 4);
        paint(g, litFill(g, x - 13, y - 13, 26, 26, shade(c.stone, 0.05), 0.3), INK, 1.6);
        circle(g, x, y, 7);
        paint(g, domeFill(g, x, y, 7, c.metal, 0.5), INK, 1);
      }
      rr(g, 0, 0, 300, 400, 3);
      stroke(g, INK, LW);
    },
  },
  {
    id: 'stair-spiral', name: 'Spiral stair', cat: 'structure', sets: ['castle', 'wizard', 'dungeon', 'temple', 'town'], tags: ['stairs', 'spiral', 'winding', 'tower', 'steps', 'ascend', 'upper floor', 'tall'],
    w: 2, h: 2, c: { stone: STONE.grey, metal: METAL.iron }, variants: STONES,
    desc: 'Wedge-shaped steps winding round a central post right up to the ceiling. The arrow marks the first step.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const n = 16;
      circle(g, 100, 100, 94);
      paint(g, shade(c.stone, -0.45), INK, LW);
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * TAU - Math.PI / 2, a1 = a0 + TAU / n;
        g.beginPath();
        g.moveTo(100 + Math.cos(a0) * 14, 100 + Math.sin(a0) * 14);
        g.arc(100, 100, 88, a0, a1);
        g.lineTo(100 + Math.cos(a1) * 14, 100 + Math.sin(a1) * 14);
        g.closePath();
        paint(g, litFill(g, 12, 12, 176, 176, shade(c.stone, -0.3 + (i / n) * 0.45), 0.15), INK, 1.3);
      }
      speckle(g, 20, 20, 160, 160, r, 18, alpha(shade(c.stone, -0.5), 0.3), 1);
      circle(g, 100, 100, 88);
      stroke(g, INK, 4.6);
      circle(g, 100, 100, 88);
      stroke(g, c.metal, 2.4);
      circle(g, 100, 100, 16);
      paint(g, domeFill(g, 100, 100, 16, shade(c.stone, 0.1), 0.4), INK, LW);
      poly(g, [[118, 30], [146, 34], [122, 46]]);
      paint(g, alpha('#ffffff', 0.85), INK, 1.2);
    },
  },
  {
    id: 'doors-grand-frame', name: 'Great doors', cat: 'structure', sets: ['castle', 'temple', 'crypt', 'dungeon', 'town'], tags: ['doors', 'double doors', 'gate', 'entrance', 'portal', 'arch', 'tall', 'hall', 'decor'],
    w: 3, h: 1, c: { stone: STONE.grey, wood: WOOD.oak, metal: METAL.iron },
    variants: [
      { name: 'Oak and iron', c: {} },
      { name: 'Ebony and gold', c: { wood: WOOD.ebony, metal: METAL.gold, stone: STONE.marble } },
      { name: 'Weathered', c: { wood: '#7d6a55', metal: METAL.rust } },
      { name: 'Red lacquer', c: { wood: '#7a2622', metal: METAL.brass, stone: STONE.dark } },
    ],
    desc: 'A pair of tall arched doors set in a carved stone frame, about 18 ft high. Dressing for a wall, not a working door. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      wallLip(g, 0, 300, 8, c.stone, r);
      g.beginPath();
      g.ellipse(150, 18, 110, 40, 0, 0, Math.PI);
      g.closePath();
      paint(g, litFill(g, 40, 18, 220, 40, shade(c.stone, 0.08), 0.25), INK, LW);
      hBlocks(g, 70, 20, 160, 18, shade(c.stone, 0.08), r, 26, 9);
      g.beginPath();
      g.ellipse(150, 18, 110, 40, 0, 0, Math.PI);
      stroke(g, INK, LW);
      for (const x of [16, 238]) {
        slab(g, x, 2, 46, 34, c.stone, r, 16, 12);
      }
      panel(g, 62, 4, 88, 14, c.wood, r, 'v', 5, 2);
      panel(g, 150, 4, 88, 14, c.wood, r, 'v', 5, 2);
      for (const x of [74, 106, 138, 162, 194, 226]) strap(g, x - 2, 4, 4, 14, c.metal, false);
      for (const x of [142, 158]) ringPull(g, x, 21, 4, c.metal);
    },
  },
  {
    id: 'wall-alcove-arch', name: 'Arched alcove', cat: 'decor', sets: ['temple', 'crypt', 'castle', 'dungeon', 'wizard'], tags: ['alcove', 'niche', 'arch', 'shrine', 'wall', 'urn', 'statue', 'candles', 'skulls'],
    w: 2, h: 1, c: { stone: STONE.grey, metal: METAL.bronze, wax: WAX },
    variants: [
      { name: 'Urn', c: {} },
      { name: 'Small saint', c: { stone: STONE.marble }, f: { item: 1 } },
      { name: 'Candles', c: { stone: STONE.sand }, f: { item: 2 } },
      { name: 'Skulls', c: { stone: STONE.dark }, f: { item: 3 } },
    ],
    desc: 'A tall round-headed niche cut into the wall with something kept in it. Put the top edge on a wall.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      wallLip(g, 0, 200, 8, c.stone, r);
      rr(g, 40, 2, 120, 36, 3);
      paint(g, litFill(g, 40, 2, 120, 36, shade(c.stone, -0.5), 0.2), INK, 1.6);
      for (const x of [8, 160]) slab(g, x, 2, 32, 46, c.stone, r, 16, 12);
      rr(g, 36, 34, 128, 10, 2);
      paint(g, litFill(g, 36, 34, 128, 10, shade(c.stone, 0.12), 0.3), INK, 1.6);
      const item = f.item ?? 0;
      if (item === 1) {
        ellipse(g, 100, 20, 18, 11);
        paint(g, domeFill(g, 100, 20, 18, '#e8e4dc', 0.35), INK, 1.3);
        circle(g, 100, 18, 8);
        paint(g, domeFill(g, 100, 18, 8, '#efece6', 0.4), INK, 1.1);
      } else if (item === 2) {
        for (const x of [76, 92, 108, 124]) cupCandle(g, x, 18 + (x % 3) * 2, c.metal, c.wax, 0.75);
      } else if (item === 3) {
        for (const [x, y] of [[82, 22], [100, 18], [118, 22], [91, 30], [109, 30]]) skull(g, x, y, 7, 0);
      } else {
        circle(g, 100, 20, 14);
        paint(g, domeFill(g, 100, 20, 14, c.metal, 0.45), INK, 1.4);
        circle(g, 100, 20, 6);
        paint(g, domeFill(g, 100, 20, 6, shade(c.metal, -0.4), 0.3), INK, 1);
      }
    },
  },
  {
    id: 'archway-grand', name: 'Great archway', cat: 'structure', sets: ['castle', 'temple', 'crypt', 'dungeon', 'desert', 'town'], tags: ['arch', 'archway', 'gateway', 'portal', 'entrance', 'tall', 'ruin', 'hall'],
    w: 3, h: 1, c: { stone: STONE.grey }, variants: STONES,
    desc: 'A free-standing stone arch on two piers, about 20 ft tall. Tokens walk through the middle.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.fillRect(58, 62, 184, 14);
      rr(g, 52, 28, 196, 40, 3);
      paint(g, litFill(g, 52, 28, 196, 40, shade(c.stone, 0.06), 0.25), INK, LW);
      for (let i = 1; i < 9; i++) {
        const x = 52 + i * (196 / 9), lean = (x - 150) * 0.08;
        line(g, x - lean, 29, x + lean, 67, alpha(shade(c.stone, -0.55), 0.8), 1.2);
      }
      rr(g, 138, 24, 24, 48, 2);
      paint(g, litFill(g, 138, 24, 24, 48, shade(c.stone, 0.16), 0.3), INK, 1.6);
      for (const x of [6, 240]) slab(g, x, 10, 54, 80, c.stone, r, 18, 14);
      speckle(g, 52, 28, 196, 40, r, 14, alpha(shade(c.stone, -0.5), 0.3), 1);
    },
  },
];

const HALLS_HANGING: ObjDef[] = [
  {
    id: 'banner-hanging-tall', name: 'Long hall banner', cat: 'decor', sets: ['castle', 'temple', 'town', 'camp'], tags: ['banner', 'flag', 'hanging', 'ceiling', 'heraldry', 'standard', 'hall', 'overhead', 'tall'],
    w: 1, h: 1, layer: 'overhead', c: { cloth: CLOTH.red, metal: METAL.gold }, variants: CLOTHS('cloth'),
    desc: 'A long swallow-tailed banner hanging from the ceiling on cords, nearly to head height. Tokens pass under it.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      line(g, 50, 4, 14, 20, alpha(INK, 0.8), 1.4);
      line(g, 50, 4, 86, 20, alpha(INK, 0.8), 1.4);
      poly(g, [[22, 20], [78, 20], [78, 92], [50, 76], [22, 92]]);
      paint(g, litFill(g, 22, 20, 56, 72, c.cloth, 0.2), INK, LW * 0.8);
      g.save();
      poly(g, [[22, 20], [78, 20], [78, 92], [50, 76], [22, 92]]);
      g.clip();
      for (const x of [34, 50, 66]) {
        const gr = g.createLinearGradient(x - 5, 0, x + 5, 0);
        gr.addColorStop(0, 'rgba(0,0,0,0)');
        gr.addColorStop(0.5, alpha(shade(c.cloth, -0.5), 0.3));
        gr.addColorStop(1, 'rgba(255,255,255,0.08)');
        g.fillStyle = gr;
        g.fillRect(x - 5, 20, 10, 74);
      }
      line(g, 26, 24, 26, 86, alpha(c.metal, 0.8), 1.6);
      line(g, 74, 24, 74, 86, alpha(c.metal, 0.8), 1.6);
      g.restore();
      sunMark(g, 50, 46, 15, c.metal);
      bar(g, 12, 20, 88, 20, METAL.iron, 3.4);
      for (const x of [12, 88]) {
        circle(g, x, 20, 4);
        paint(g, domeFill(g, x, 20, 4, c.metal, 0.5), INK, 1);
      }
      void r;
    },
  },
  {
    id: 'tapestry-tall', name: 'Tall tapestry', cat: 'decor', sets: ['castle', 'temple', 'town', 'wizard'], tags: ['tapestry', 'wall hanging', 'cloth', 'hunt', 'story', 'hall', 'tall', 'arras'],
    w: 2, h: 1, c: { cloth: CLOTH.red, cc: CLOTH.gold, metal: METAL.brass },
    variants: [
      { name: 'Crimson', c: {} },
      { name: 'Midnight stars', c: { cloth: '#1f2f5a', cc: '#d8dde6', metal: METAL.silver } },
      { name: 'Greenwood', c: { cloth: CLOTH.green, cc: '#c9a36a' } },
      { name: 'Faded', c: { cloth: '#8a6a5a', cc: '#c8b98a', metal: METAL.iron } },
    ],
    desc: 'A woven hanging three times a person\'s height, hung from a rod near the ceiling. Hides a secret door nicely. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      g.fillStyle = 'rgba(0,0,0,0.18)';
      g.fillRect(14, 30, 172, 10);
      cloth(g, 14, 4, 172, 26, c.cloth, r, 6, 2);
      g.save();
      rr(g, 14, 4, 172, 26, 2);
      g.clip();
      rr(g, 18, 8, 164, 18, 1);
      stroke(g, alpha(c.cc, 0.85), 1.6);
      for (let x = 30; x < 180; x += 20) {
        poly(g, [[x, 12], [x + 5, 17], [x, 22], [x - 5, 17]]);
        g.fillStyle = alpha(c.cc, 0.75);
        g.fill();
      }
      g.restore();
      fringe(g, 16, 30, 184, 1, c.cc);
      bar(g, 6, 4, 194, 4, c.metal, 3.6);
      for (const x of [6, 194]) {
        circle(g, x, 4, 4.4);
        paint(g, domeFill(g, x, 4, 4.4, c.metal, 0.5), INK, 1);
      }
    },
  },
  {
    id: 'heraldic-crest', name: 'Heraldic crest', cat: 'decor', sets: ['castle', 'town', 'tavern', 'camp'], tags: ['shield', 'crest', 'heraldry', 'swords', 'coat of arms', 'trophy', 'wall', 'hall'],
    w: 1, h: 1, c: { a: CLOTH.red, b: CLOTH.gold, metal: METAL.silver },
    variants: [
      { name: 'Red and gold', c: {} },
      { name: 'Blue and silver', c: { a: CLOTH.blue, b: '#d8dde6', metal: METAL.silver } },
      { name: 'Green and bronze', c: { a: CLOTH.green, b: METAL.bronze, metal: METAL.bronze } },
      { name: 'Black and gold', c: { a: CLOTH.black, b: CLOTH.gold, metal: METAL.gold } },
    ],
    desc: 'A big painted shield over two crossed swords, hung high on the wall. Put the top edge on a wall.',
    draw: ({ g, c }) => {
      for (const [x1, x2] of [[12, 88], [88, 12]]) {
        bar(g, x1, 6, x2, 58, c.metal, 3.6);
        const mx = x1 + (x2 - x1) * 0.18, my = 6 + 52 * 0.18;
        bar(g, mx - 7, my + 5, mx + 7, my - 5, METAL.brass, 3);
      }
      const sh = [[26, 4], [74, 4], [74, 26], [50, 52], [26, 26]];
      poly(g, sh);
      paint(g, c.a, INK, LW);
      g.save();
      poly(g, sh);
      g.clip();
      g.fillStyle = c.b;
      g.fillRect(50, 0, 30, 60);
      poly(g, [[26, 34], [50, 18], [74, 34], [74, 42], [50, 26], [26, 42]]);
      paint(g, shade(c.metal, 0.1), INK, 1);
      sheen(g, 26, 4, 48, 48, 0.18);
      g.restore();
      poly(g, sh);
      stroke(g, c.metal, 2.4);
      poly(g, sh);
      stroke(g, INK, 1);
    },
  },
  {
    id: 'cage-hanging', name: 'Hanging cage', cat: 'decor', sets: ['dungeon', 'castle', 'cave', 'crypt'], tags: ['cage', 'prison', 'captive', 'hanging', 'chain', 'ceiling', 'torture', 'overhead'],
    w: 1, h: 1, layer: 'overhead', c: { metal: METAL.iron },
    variants: [{ name: 'Empty', c: {} }, { name: 'Occupied', c: {}, f: { bones: 1 } }, { name: 'Rusted', c: { metal: METAL.rust } }, { name: 'Rusted, occupied', c: { metal: METAL.rust }, f: { bones: 1 } }],
    desc: 'A round iron cage hanging on a chain from the ceiling, its floor about 3 ft up. Tokens pass under it.',
    draw: ({ g, c, f }) => {
      dropShadow(g, 54, 56, 40);
      if (f.bones) {
        boneAt(g, 36, 62, 58, 70, 3, BONE);
        skull(g, 62, 42, 8, 0.4);
      }
      cageTop(g, 50, 50, 36, c.metal);
    },
  },
  {
    id: 'chains-hanging', name: 'Hanging chains', cat: 'decor', sets: ['dungeon', 'castle', 'cave', 'crypt', 'mine'], tags: ['chains', 'hooks', 'hanging', 'ceiling', 'torture', 'slaughter', 'meat', 'overhead'],
    w: 1, h: 1, layer: 'overhead', c: { metal: METAL.iron },
    variants: [{ name: 'Iron hooks', c: {} }, { name: 'Meat hooks', c: {}, f: { meat: 1 } }, { name: 'Rusted', c: { metal: METAL.rust } }, { name: 'Black iron', c: { metal: METAL.black } }],
    desc: 'Lengths of chain dangling from the ceiling at different heights, ending in hooks.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const spots = [[30, 28], [70, 26], [50, 52], [26, 72], [74, 70]];
      for (const [x, y] of spots) {
        const a = r() * TAU;
        hookChain(g, x, y, 10 + r() * 6, a, c.metal);
        if (f.meat && r() < 0.7) {
          blob(g, lumpy(x + Math.cos(a) * 20, y + Math.sin(a) * 20, 8, 0.3, 7, r));
          paint(g, domeFill(g, x + Math.cos(a) * 20, y + Math.sin(a) * 20, 8, '#8a2a2a', 0.35), INK, 1.1);
        }
      }
    },
  },
  {
    id: 'censer-hanging', name: 'Hanging censer', cat: 'religious', sets: ['temple', 'crypt', 'castle', 'wizard'], tags: ['censer', 'incense', 'thurible', 'smoke', 'hanging', 'chain', 'ceiling', 'overhead'],
    w: 1, h: 1, layer: 'overhead', c: { metal: METAL.brass, smoke: '#b8b4c8' }, variants: MV,
    desc: 'A pierced metal censer hanging on a long chain, trailing sweet smoke.',
    draw: ({ g, c }) => {
      for (const [x, y, s] of [[64, 34, 22], [36, 30, 18], [70, 64, 16]]) {
        const gr = g.createRadialGradient(x, y, 0, x, y, s);
        gr.addColorStop(0, alpha(c.smoke, 0.4));
        gr.addColorStop(1, alpha(c.smoke, 0));
        g.fillStyle = gr;
        g.fillRect(x - s, y - s, s * 2, s * 2);
      }
      circle(g, 50, 52, 18);
      paint(g, domeFill(g, 50, 52, 18, c.metal, 0.5), INK, LW);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        circle(g, 50 + Math.cos(a) * 11, 52 + Math.sin(a) * 11, 1.8);
        g.fillStyle = '#ffb347';
        g.fill();
      }
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU - Math.PI / 2;
        chain(g, 50 + Math.cos(a) * 16, 52 + Math.sin(a) * 16, 50, 52, c.metal, 2);
      }
      ringPull(g, 50, 52, 4, c.metal);
    },
  },
];

const HALLS_LIGHTS: ObjDef[] = [
  {
    id: 'lantern-cluster', name: 'Lantern cluster', cat: 'light', sets: ['castle', 'temple', 'town', 'tavern', 'wizard'], tags: ['lanterns', 'hanging', 'ceiling', 'chains', 'cluster', 'light', 'overhead'],
    w: 2, h: 2, layer: 'overhead', light: { bright: 15, dim: 20, color: LAMP }, c: { metal: METAL.iron, glass: '#ffc46b' },
    variants: [
      { name: 'Iron, amber', c: {} },
      { name: 'Brass', c: { metal: METAL.brass, glass: '#ffd27a' } },
      { name: 'Silver, moonlight', c: { metal: METAL.silver, glass: '#cfe6ff' } },
      { name: 'Witchlight', c: { metal: METAL.black, glass: '#9dff9a' } },
    ],
    desc: 'An iron hoop hung from the ceiling with lanterns dangling from it at different heights.',
    draw: ({ g, c }) => {
      glow(g, 100, 100, 99, c.glass, 0.32);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU + 0.5;
        bar(g, 100, 100, 100 + Math.cos(a) * 56, 100 + Math.sin(a) * 56, c.metal, 2);
      }
      hoop(g, 100, 100, 56, c.metal, 3.6);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU - Math.PI / 2;
        lanternTop(g, 100 + Math.cos(a) * 56, 100 + Math.sin(a) * 56, 12, c.metal, c.glass);
      }
      lanternTop(g, 100, 100, 15, c.metal, c.glass);
    },
  },
  {
    id: 'chandelier-great', name: 'Great chandelier', cat: 'light', sets: ['castle', 'temple', 'town', 'tavern', 'crypt'], tags: ['chandelier', 'candles', 'hanging', 'ceiling', 'grand', 'hall', 'ring', 'chains', 'overhead'],
    w: 3, h: 3, layer: 'overhead', light: { bright: 30, dim: 30, color: CANDLE }, c: { metal: METAL.iron, wax: WAX },
    variants: [{ name: 'Iron', c: {} }, { name: 'Brass', c: { metal: METAL.brass } }, { name: 'Gold', c: { metal: METAL.gold } }, { name: 'Black iron, bone candles', c: { metal: METAL.black, wax: '#d8cfb4' } }],
    desc: 'A huge double ring of candles hung on four chains, lighting a whole hall. Tokens pass underneath.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 150, 150, 149, '#ffcf7a', 0.38);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + 0.2;
        bar(g, 150 + Math.cos(a) * 70, 150 + Math.sin(a) * 70, 150 + Math.cos(a) * 120, 150 + Math.sin(a) * 120, c.metal, 2.6);
      }
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + Math.PI / 4;
        chain(g, 150, 150, 150 + Math.cos(a) * 118, 150 + Math.sin(a) * 118, c.metal, 3);
      }
      hoop(g, 150, 150, 120, c.metal, 6);
      hoop(g, 150, 150, 70, c.metal, 4.6);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        cupCandle(g, 150 + Math.cos(a) * 120, 150 + Math.sin(a) * 120, c.metal, c.wax, 1);
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + 0.4;
        cupCandle(g, 150 + Math.cos(a) * 70, 150 + Math.sin(a) * 70, c.metal, c.wax, 0.9);
      }
      circle(g, 150, 150, 18);
      paint(g, domeFill(g, 150, 150, 18, c.metal, 0.55), INK, 1.6);
      candle(g, 150, 150, 7, r, c.wax);
    },
  },
  {
    id: 'brazier-pedestal', name: 'Pedestal brazier', cat: 'light', sets: ['temple', 'castle', 'crypt', 'dungeon', 'desert', 'wizard'], tags: ['brazier', 'fire', 'pedestal', 'bowl', 'flame', 'tall', 'sacred', 'light'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 20, dim: 20, color: TORCH }, c: { stone: STONE.marble, metal: METAL.bronze, fire: '#ffb02e' },
    variants: [
      { name: 'Bronze, fire', c: {} },
      { name: 'Silver, blue flame', c: { stone: STONE.grey, metal: METAL.silver, fire: '#4cc9f0' } },
      { name: 'Black, green flame', c: { stone: STONE.dark, metal: METAL.black, fire: '#7ae36a' } },
      { name: 'Gold, holy flame', c: { stone: STONE.sand, metal: METAL.gold, fire: '#ffe08a' } },
    ],
    desc: 'A wide fire bowl on a chest-high stone pedestal, lighting a great hall or temple.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 50, c.fire, 0.45);
      rr(g, 12, 12, 76, 76, 6);
      paint(g, litFill(g, 12, 12, 76, 76, shade(c.stone, -0.15), 0.22), INK, LW);
      bevel(g, 12, 12, 76, 76, 6, 0.3);
      circle(g, 50, 50, 34);
      paint(g, domeFill(g, 50, 50, 34, c.metal, 0.45), INK, LW);
      circle(g, 50, 50, 27);
      paint(g, '#2a1a12', INK, 1.4);
      for (let i = 0; i < 14; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 22;
        circle(g, 50 + Math.cos(a) * d, 50 + Math.sin(a) * d, 2.4 + r() * 2.2);
        paint(g, r() < 0.5 ? '#c2410c' : '#4a2a1a', null);
      }
      fireAt(g, 50, 50, 20, r, c.fire);
    },
  },
  {
    id: 'candle-stand-tall', name: 'Tall candle stand', cat: 'light', sets: ['temple', 'castle', 'crypt', 'wizard', 'town'], tags: ['candles', 'pricket', 'candlestand', 'tall', 'iron', 'church', 'vigil', 'light'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 10, dim: 15, color: CANDLE }, c: { metal: METAL.brass, wax: WAX }, variants: MV,
    desc: 'A head-high stand on three feet with a crown of tall candles.',
    draw: ({ g, c }) => {
      glow(g, 50, 50, 46, '#ffcf7a', 0.35);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU - Math.PI / 2;
        bar(g, 50, 50, 50 + Math.cos(a) * 42, 50 + Math.sin(a) * 42, c.metal, 3);
        circle(g, 50 + Math.cos(a) * 42, 50 + Math.sin(a) * 42, 4.5);
        paint(g, domeFill(g, 50 + Math.cos(a) * 42, 50 + Math.sin(a) * 42, 4.5, c.metal, 0.5), INK, 1);
      }
      hoop(g, 50, 50, 20, c.metal, 3);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU;
        cupCandle(g, 50 + Math.cos(a) * 20, 50 + Math.sin(a) * 20, c.metal, c.wax, 0.8);
      }
      cupCandle(g, 50, 50, c.metal, c.wax, 0.95);
    },
  },
  {
    id: 'brazier-hanging', name: 'Hanging fire basket', cat: 'light', sets: ['castle', 'dungeon', 'cave', 'crypt', 'temple', 'camp'], tags: ['brazier', 'fire', 'basket', 'hanging', 'chains', 'ceiling', 'cresset', 'overhead', 'light'],
    w: 1, h: 1, layer: 'overhead', light: { bright: 15, dim: 15, color: TORCH }, c: { metal: METAL.iron, fire: '#ffb02e' },
    variants: [
      { name: 'Iron', c: {} },
      { name: 'Bronze', c: { metal: METAL.bronze } },
      { name: 'Black iron, blue flame', c: { metal: METAL.black, fire: '#4cc9f0' } },
      { name: 'Rusted, green flame', c: { metal: METAL.rust, fire: '#7ae36a' } },
    ],
    desc: 'An open iron basket of burning coals hung on three chains. Hangs above the room; tokens pass underneath.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 50, c.fire, 0.45);
      circle(g, 50, 50, 30);
      paint(g, '#2a1a12', null);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        bar(g, 50 + Math.cos(a) * 12, 50 + Math.sin(a) * 12, 50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30, c.metal, 2.2);
      }
      hoop(g, 50, 50, 30, c.metal, 4);
      fireAt(g, 50, 50, 19, r, c.fire);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU - Math.PI / 2;
        chain(g, 50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30, 50 + Math.cos(a) * 14, 50 + Math.sin(a) * 14, c.metal, 2.2);
      }
    },
  },
  {
    id: 'hearth-grand', name: 'Great hearth', cat: 'light', sets: ['castle', 'tavern', 'town'], tags: ['fireplace', 'hearth', 'fire', 'chimney', 'hall', 'feast', 'warmth', 'grand'],
    w: 3, h: 1, blocksMovement: true, light: { bright: 20, dim: 20, color: TORCH }, c: { stone: STONE.grey, wood: WOOD.oak, fire: '#ffb02e' },
    variants: [
      { name: 'Grey stone', c: {} },
      { name: 'Sandstone', c: { stone: STONE.sand } },
      { name: 'Dark stone', c: { stone: STONE.dark } },
      { name: 'Marble', c: { stone: STONE.marble, wood: WOOD.walnut } },
    ],
    desc: 'A walk-in fireplace with a chimney breast that rises to the ceiling. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 150, 30, 110, '#ff9a40', 0.4);
      slab(g, 36, 40, 228, 40, shade(c.stone, 0.06), r, 28, 13);
      rr(g, 70, 2, 160, 40, 2);
      paint(g, '#1c1410', INK, 1.6);
      plank(g, 136, 24, 70, 10, 0.12, c.wood, r);
      plank(g, 164, 22, 66, 9, -0.2, shade(c.wood, -0.1), r);
      fireAt(g, 150, 22, 18, r, c.fire);
      for (const x of [96, 204]) {
        bar(g, x, 10, x, 36, METAL.black, 3.4);
        circle(g, x, 36, 4);
        paint(g, domeFill(g, x, 36, 4, METAL.iron, 0.5), INK, 1);
      }
      slab(g, 8, 0, 64, 50, c.stone, r, 20, 13);
      slab(g, 228, 0, 64, 50, c.stone, r, 20, 13);
    },
  },
];

const HALLS_ROOMS: ObjDef[] = [
  {
    id: 'throne-dais', name: 'Throne on a dais', cat: 'furniture', sets: ['castle', 'temple', 'dungeon', 'crypt'], tags: ['throne', 'dais', 'king', 'queen', 'ruler', 'steps', 'royal', 'hall', 'court'],
    w: 3, h: 3, blocksMovement: true, c: { stone: STONE.grey, metal: METAL.gold, cloth: CLOTH.red },
    variants: [
      { name: 'Gold and crimson', c: {} },
      { name: 'Silver and blue', c: { stone: STONE.marble, metal: METAL.silver, cloth: CLOTH.blue } },
      { name: 'Bone and black', c: { stone: STONE.dark, metal: BONE, cloth: CLOTH.black } },
      { name: 'Bronze and green', c: { stone: STONE.sand, metal: METAL.bronze, cloth: CLOTH.green } },
    ],
    desc: 'A high-backed throne on three stone steps, with a carpet running up the front. The back faces the top edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const [x, k] of [[6, -0.12], [36, 0], [66, 0.12]] as [number, number][]) {
        rr(g, x, x - 4, 300 - 2 * x, 300 - 2 * x, 4);
        paint(g, litFill(g, x, x - 4, 300 - 2 * x, 300 - 2 * x, shade(c.stone, k), 0.2), INK, LW);
        bevel(g, x, x - 4, 300 - 2 * x, 300 - 2 * x, 4, 0.25);
      }
      speckle(g, 8, 4, 284, 284, r, 30, alpha(shade(c.stone, -0.5), 0.25), 1.1);
      cloth(g, 122, 176, 56, 120, c.cloth, r, 2, 2);
      line(g, 126, 176, 126, 296, alpha(c.metal, 0.8), 1.4);
      line(g, 174, 176, 174, 296, alpha(c.metal, 0.8), 1.4);
      rr(g, 98, 70, 104, 30, 6);
      paint(g, litFill(g, 98, 70, 104, 30, c.metal, 0.35), INK, LW);
      for (const x of [104, 150, 196]) {
        circle(g, x, 74, 8);
        paint(g, domeFill(g, x, 74, 8, shade(c.metal, 0.1), 0.5), INK, 1.2);
      }
      gem(g, 150, 86, 6, '#d6402f');
      rr(g, 106, 98, 88, 70, 6);
      paint(g, litFill(g, 106, 98, 88, 70, shade(c.metal, -0.1), 0.3), INK, LW);
      pad(g, 116, 104, 68, 58, c.cloth, 10);
      for (const x of [96, 188]) {
        rr(g, x, 100, 16, 66, 5);
        paint(g, litFill(g, x, 100, 16, 66, c.metal, 0.35), INK, 1.6);
      }
    },
  },
  {
    id: 'feast-hall-table', name: 'Great hall feast table', cat: 'furniture', sets: ['castle', 'tavern', 'town', 'camp'], tags: ['feast', 'banquet', 'table', 'benches', 'long table', 'hall', 'dining', 'mead hall'],
    w: 6, h: 2, blocksMovement: true, c: { wood: WOOD.oak, cloth: CLOTH.red, metal: METAL.brass, wax: WAX }, variants: WV,
    desc: 'A thirty-foot table laid for a feast, with a bench down each side.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 24, 10, 552, 30, shade(c.wood, -0.08), r, 'h', 2, 4);
      panel(g, 24, 160, 552, 30, shade(c.wood, -0.08), r, 'h', 2, 4);
      panel(g, 10, 52, 580, 96, c.wood, r, 'h', 5, 4);
      cloth(g, 30, 86, 540, 28, c.cloth, r, 10, 2);
      for (let i = 0; i < 9; i++) {
        const x = 62 + i * 60;
        dish(g, x, 70, 10, '#d9d2c3', i % 3 ? '#c0703a' : '#7a9a4a');
        dish(g, x + 22, 130, 10, '#d9d2c3', i % 2 ? '#a0503a' : '#c9a24a');
        circle(g, x + 18, 66, 4.4);
        paint(g, domeFill(g, x + 18, 66, 4.4, c.metal, 0.5), INK, 1);
        circle(g, x + 4, 136, 4.4);
        paint(g, domeFill(g, x + 4, 136, 4.4, c.metal, 0.5), INK, 1);
      }
      ellipse(g, 300, 100, 30, 18);
      paint(g, domeFill(g, 300, 100, 30, '#d9d2c3', 0.25), INK, 1.4);
      ellipse(g, 300, 100, 22, 12);
      paint(g, domeFill(g, 300, 100, 22, '#9a5a2a', 0.45), INK, 1.2);
      for (const x of [120, 480]) {
        circle(g, x, 100, 13);
        paint(g, domeFill(g, x, 100, 13, c.metal, 0.5), INK, 1.3);
        for (const dx of [-7, 0, 7]) candle(g, x + dx, 100 + (dx ? 3 : -4), 3.4, r, c.wax);
      }
    },
  },
  {
    id: 'statue-tall-knight', name: 'Tall knight statue', cat: 'decor', sets: ['castle', 'temple', 'crypt', 'dungeon', 'town'], tags: ['statue', 'knight', 'warrior', 'guardian', 'sword', 'plinth', 'monument', 'tall', 'hall'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { stone: STONE.grey, body: '#b8b2a6' }, variants: STATUE_STONES,
    desc: 'A knight twice life size on a tall plinth, hands resting on a sword set point-down. Faces the bottom edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      plinthTop(g, 18, 18, 164, c.stone, r);
      ellipse(g, 100, 92, 50, 30);
      paint(g, litFill(g, 50, 62, 100, 60, shade(c.body, -0.15), 0.25), INK, LW);
      ellipse(g, 100, 106, 44, 26);
      paint(g, domeFill(g, 100, 106, 44, c.body, 0.3), INK, LW);
      for (const k of [-1, 1]) {
        ellipse(g, 100 + k * 40, 104, 16, 18);
        paint(g, domeFill(g, 100 + k * 40, 104, 16, shade(c.body, 0.08), 0.4), INK, 1.6);
      }
      circle(g, 100, 102, 18);
      paint(g, domeFill(g, 100, 102, 18, shade(c.body, 0.1), 0.45), INK, LW);
      line(g, 100, 86, 100, 118, alpha(shade(c.body, -0.5), 0.8), 3);
      bar(g, 76, 140, 124, 140, shade(c.body, -0.05), 5);
      for (const x of [90, 110]) {
        circle(g, x, 140, 6);
        paint(g, domeFill(g, x, 140, 6, c.body, 0.4), INK, 1.2);
      }
      circle(g, 100, 134, 5);
      paint(g, domeFill(g, 100, 134, 5, c.body, 0.5), INK, 1.1);
    },
  },
  {
    id: 'statue-tall-robed', name: 'Robed figure statue', cat: 'decor', sets: ['temple', 'crypt', 'wizard', 'castle', 'town'], tags: ['statue', 'priest', 'sage', 'monk', 'saint', 'hooded', 'plinth', 'monument', 'tall'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { stone: STONE.grey, body: '#b8b2a6', glow: '#ffd27a' },
    variants: [
      { name: 'Grey stone, book', c: {} },
      { name: 'Marble, lantern', c: { stone: STONE.marble, body: '#e8e4dc' }, f: { item: 1 } },
      { name: 'Bronze, staff', c: { stone: STONE.dark, body: '#9a6a34' }, f: { item: 2 } },
      { name: 'Dark stone, glowing orb', c: { stone: STONE.dark, body: '#5e5a62', glow: '#9fd8ff' }, f: { item: 3 } },
    ],
    desc: 'A hooded figure in long robes, twice life size on a tall plinth, holding something out. Faces the bottom edge.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      plinthTop(g, 18, 18, 164, c.stone, r);
      blob(g, lumpy(100, 104, 52, 0.08, 12, r, 44));
      paint(g, domeFill(g, 100, 104, 52, c.body, 0.3), INK, LW);
      for (let i = 0; i < 6; i++) {
        const a = Math.PI * 0.15 + (i / 5) * Math.PI * 0.7;
        line(g, 100 + Math.cos(a) * 24, 104 + Math.sin(a) * 20, 100 + Math.cos(a) * 48, 104 + Math.sin(a) * 40, alpha(shade(c.body, -0.5), 0.6), 1.4);
      }
      circle(g, 100, 92, 22);
      paint(g, domeFill(g, 100, 92, 22, shade(c.body, -0.05), 0.45), INK, LW);
      ellipse(g, 100, 100, 10, 8);
      paint(g, shade(c.body, -0.6), null);
      const item = f.item ?? 0;
      if (item === 1) {
        glow(g, 100, 140, 26, c.glow, 0.5);
        lanternTop(g, 100, 140, 8, c.body, c.glow);
      } else if (item === 2) {
        circle(g, 130, 128, 7);
        paint(g, domeFill(g, 130, 128, 7, shade(c.body, 0.1), 0.5), INK, 1.3);
      } else if (item === 3) {
        glow(g, 100, 140, 30, c.glow, 0.6);
        circle(g, 100, 140, 10);
        paint(g, domeFill(g, 100, 140, 10, c.glow, 0.5), INK, 1.2);
      } else {
        rr(g, 84, 128, 32, 20, 2);
        paint(g, litFill(g, 84, 128, 32, 20, shade(c.body, 0.08), 0.3), INK, 1.4);
        line(g, 100, 128, 100, 148, INK, 1.2);
      }
    },
  },
  {
    id: 'statue-tall-winged', name: 'Winged guardian statue', cat: 'decor', sets: ['temple', 'crypt', 'castle', 'wizard'], tags: ['statue', 'winged', 'guardian', 'angel', 'celestial', 'spear', 'plinth', 'monument', 'tall'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { stone: STONE.grey, body: '#b8b2a6' }, variants: STATUE_STONES,
    desc: 'A winged guardian with a spear, its wings raised so their tips nearly brush a high ceiling. Faces the bottom edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      plinthTop(g, 30, 30, 140, c.stone, r);
      for (const k of [-1, 1]) {
        const pts = [[100 + k * 20, 92], [100 + k * 92, 30], [100 + k * 96, 62], [100 + k * 80, 92], [100 + k * 60, 112], [100 + k * 26, 112]];
        poly(g, pts);
        paint(g, litFill(g, 4, 30, 192, 82, shade(c.body, 0.05), 0.3), INK, LW);
        for (let i = 1; i < 5; i++) line(g, 100 + k * 26, 100, 100 + k * (40 + i * 13), 34 + i * 16, alpha(shade(c.body, -0.5), 0.7), 1.3);
      }
      ellipse(g, 100, 104, 26, 20);
      paint(g, domeFill(g, 100, 104, 26, c.body, 0.35), INK, LW);
      circle(g, 100, 100, 13);
      paint(g, domeFill(g, 100, 100, 13, shade(c.body, 0.1), 0.45), INK, 1.8);
      bar(g, 124, 70, 124, 156, shade(c.body, -0.1), 3.6);
      poly(g, [[124, 156], [119, 146], [129, 146]]);
      paint(g, shade(c.body, 0.15), INK, 1.1);
    },
  },
  {
    id: 'fountain-grand', name: 'Grand fountain', cat: 'decor', sets: ['castle', 'temple', 'town', 'market'], tags: ['fountain', 'water', 'basin', 'tiered', 'courtyard', 'plaza', 'hall', 'grand'],
    w: 3, h: 3, blocksMovement: true, c: { stone: STONE.marble, water: '#4f8fb0' },
    variants: [
      { name: 'Marble', c: {} },
      { name: 'Grey stone', c: { stone: STONE.grey } },
      { name: 'Sandstone', c: { stone: STONE.sand, water: '#4a9aa8' } },
      { name: 'Dark stone, green water', c: { stone: STONE.dark, water: '#4f8a6a' } },
    ],
    desc: 'An eight-sided basin with two tiers of bowls spilling into it, taller than a person.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const oct = (rad: number) => Array.from({ length: 8 }, (_, i) => [150 + Math.cos((i / 8) * TAU + TAU / 16) * rad, 150 + Math.sin((i / 8) * TAU + TAU / 16) * rad]);
      poly(g, oct(146));
      paint(g, litFill(g, 4, 4, 292, 292, c.stone, 0.25), INK, LW);
      poly(g, oct(128));
      const wg = g.createRadialGradient(130, 120, 10, 150, 150, 130);
      wg.addColorStop(0, shade(c.water, 0.3));
      wg.addColorStop(1, shade(c.water, -0.3));
      paint(g, wg, INK, 1.6);
      for (const rad of [76, 96, 116]) {
        circle(g, 150, 150, rad);
        stroke(g, alpha('#ffffff', 0.22), 1.4);
      }
      speckle(g, 30, 30, 240, 240, r, 30, alpha('#ffffff', 0.35), 1.2);
      circle(g, 150, 150, 62);
      paint(g, domeFill(g, 150, 150, 62, c.stone, 0.35), INK, LW);
      circle(g, 150, 150, 52);
      paint(g, domeFill(g, 150, 150, 52, c.water, 0.3), INK, 1.2);
      circle(g, 150, 150, 32);
      paint(g, domeFill(g, 150, 150, 32, shade(c.stone, 0.05), 0.4), INK, 1.8);
      circle(g, 150, 150, 24);
      paint(g, domeFill(g, 150, 150, 24, shade(c.water, 0.1), 0.3), INK, 1);
      circle(g, 150, 150, 10);
      paint(g, domeFill(g, 150, 150, 10, shade(c.stone, 0.1), 0.5), INK, 1.4);
    },
  },
  {
    id: 'organ-cathedral', name: 'Cathedral organ', cat: 'furniture', sets: ['temple', 'castle', 'crypt'], tags: ['organ', 'pipes', 'music', 'cathedral', 'grand', 'tall', 'haunted', 'chapel'],
    w: 4, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.silver },
    variants: [
      { name: 'Silver and walnut', c: {} },
      { name: 'Gold and ebony', c: { wood: WOOD.ebony, metal: METAL.gold } },
      { name: 'Brass and oak', c: { wood: WOOD.oak, metal: METAL.brass } },
      { name: 'Bone and black', c: { wood: '#2b2b30', metal: BONE } },
    ],
    desc: 'Three towers of pipes climbing nearly to a high ceiling, over a carved console. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 6, 2, 388, 46, c.wood, r, 'h', 2, 3);
      const pipeRow = (x0: number, x1: number, n: number, rad: number) => {
        for (let i = 0; i < n; i++) {
          const x = x0 + ((i + 0.5) / n) * (x1 - x0), rr2 = rad * (1 - Math.abs(i - (n - 1) / 2) / n * 0.6);
          circle(g, x, 24, rr2);
          paint(g, domeFill(g, x, 24, rr2, c.metal, 0.55), INK, 1.2);
          circle(g, x, 24, rr2 * 0.45);
          paint(g, '#1a1410', null);
        }
      };
      pipeRow(16, 126, 6, 9);
      pipeRow(138, 262, 6, 11);
      pipeRow(274, 384, 6, 9);
      panel(g, 136, 46, 128, 30, shade(c.wood, -0.05), r, 'h', 2, 3);
      rr(g, 146, 66, 108, 8, 1);
      paint(g, '#efe8d8', INK, 1);
      for (let x = 150; x < 252; x += 7) line(g, x, 66, x, 71, INK, 2.4);
      panel(g, 160, 82, 80, 14, c.wood, r, 'h', 1, 3);
    },
  },
  {
    id: 'lectern-dais', name: 'Lectern on a dais', cat: 'religious', sets: ['temple', 'castle', 'wizard', 'crypt', 'town'], tags: ['lectern', 'pulpit', 'dais', 'sermon', 'book', 'reading', 'speech', 'steps'],
    w: 2, h: 2, blocksMovement: true, c: { stone: STONE.marble, wood: WOOD.oak, metal: METAL.brass, wax: WAX },
    variants: [
      { name: 'Marble and oak', c: {} },
      { name: 'Grey and walnut', c: { stone: STONE.grey, wood: WOOD.walnut, metal: METAL.iron } },
      { name: 'Dark and ebony', c: { stone: STONE.dark, wood: WOOD.ebony, metal: METAL.silver } },
      { name: 'Sandstone and gold', c: { stone: STONE.sand, wood: WOOD.pine, metal: METAL.gold } },
    ],
    desc: 'A slanted reading stand with a great open book, raised on two round steps. The reader stands at the top edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      circle(g, 100, 100, 94);
      paint(g, domeFill(g, 100, 100, 94, shade(c.stone, -0.1), 0.25), INK, LW);
      circle(g, 100, 96, 66);
      paint(g, domeFill(g, 100, 96, 66, c.stone, 0.3), INK, LW);
      speckle(g, 10, 10, 180, 180, r, 22, alpha(shade(c.stone, -0.5), 0.3), 1);
      g.save();
      g.translate(100, 104);
      rr(g, -34, -22, 68, 44, 3);
      paint(g, litFill(g, -34, -22, 68, 44, c.wood, 0.3), INK, LW);
      rr(g, -28, -17, 27, 34, 1);
      paint(g, '#efe6cf', INK, 1);
      rr(g, 1, -17, 27, 34, 1);
      paint(g, '#e6dcc0', INK, 1);
      for (let i = 0; i < 5; i++) {
        line(g, -24, -11 + i * 6, -5, -11 + i * 6, alpha(INK, 0.4), 1);
        line(g, 5, -11 + i * 6, 24, -11 + i * 6, alpha(INK, 0.4), 1);
      }
      line(g, 6, 17, 10, 28, '#a3312c', 2);
      g.restore();
      cupCandle(g, 52, 76, c.metal, c.wax, 0.9);
      cupCandle(g, 148, 76, c.metal, c.wax, 0.9);
    },
  },
  {
    id: 'war-table', name: 'War table', cat: 'furniture', sets: ['castle', 'camp', 'town', 'dungeon'], tags: ['war', 'map', 'strategy', 'campaign', 'generals', 'markers', 'table', 'council', 'planning'],
    w: 3, h: 2, blocksMovement: true, c: { wood: WOOD.oak, map: '#e6d6aa', a: CLOTH.red, b: CLOTH.blue }, variants: WV,
    desc: 'A heavy table spread with a campaign map, pieces for armies and a dagger pinning the corner.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 6, 6, 288, 188, c.wood, r, 'h', 6, 6);
      rr(g, 26, 24, 248, 152, 4);
      paint(g, litFill(g, 26, 24, 248, 152, c.map, 0.15), INK, 1.6);
      g.save();
      rr(g, 26, 24, 248, 152, 4);
      g.clip();
      g.fillStyle = alpha('#5a8aa8', 0.35);
      g.fillRect(26, 24, 248, 152);
      blob(g, lumpy(140, 104, 96, 0.22, 14, r, 58));
      paint(g, c.map, alpha(shade(c.map, -0.6), 0.9), 1.4);
      g.beginPath();
      g.moveTo(70, 72);
      g.bezierCurveTo(110, 96, 140, 80, 172, 120);
      g.bezierCurveTo(190, 140, 200, 150, 220, 150);
      stroke(g, alpha('#3f6f9a', 0.8), 2.2);
      for (let i = 0; i < 14; i++) {
        circle(g, 80 + r() * 50, 100 + r() * 40, 3.6);
        g.fillStyle = alpha('#3e6b3a', 0.7);
        g.fill();
      }
      for (let i = 0; i < 5; i++) {
        const x = 170 + i * 14, y = 74 + (i % 2) * 8;
        poly(g, [[x - 7, y + 6], [x, y - 6], [x + 7, y + 6]], false);
        stroke(g, alpha('#5a4a3a', 0.85), 1.4);
      }
      g.restore();
      for (const [x, y, col] of [[110, 82, c.a], [124, 92, c.a], [100, 120, c.a], [196, 118, c.b], [208, 104, c.b], [182, 140, c.b]] as [number, number, string][]) {
        circle(g, x, y, 5.5);
        paint(g, domeFill(g, x, y, 5.5, col, 0.5), INK, 1.2);
      }
      for (const [x, y, col] of [[152, 64, c.a], [226, 134, c.b]] as [number, number, string][]) {
        line(g, x, y, x, y - 14, INK, 1.4);
        poly(g, [[x, y - 14], [x + 11, y - 10], [x, y - 6]]);
        paint(g, col, INK, 1);
      }
      bar(g, 236, 36, 268, 58, METAL.silver, 3);
      bar(g, 232, 40, 240, 32, METAL.brass, 3);
      candle(g, 44, 156, 6, r, WAX);
    },
  },
  {
    id: 'altar-reredos', name: 'High altar and screen', cat: 'religious', sets: ['temple', 'crypt', 'castle'], tags: ['altar', 'reredos', 'screen', 'shrine', 'chapel', 'cathedral', 'holy', 'tall', 'sanctuary'],
    w: 3, h: 2, blocksMovement: true, c: { stone: STONE.marble, metal: METAL.gold, cloth: CLOTH.white, wax: WAX },
    variants: [
      { name: 'Marble and gold', c: {} },
      { name: 'Grey and silver', c: { stone: STONE.grey, metal: METAL.silver, cloth: CLOTH.blue } },
      { name: 'Black and blood', c: { stone: STONE.dark, metal: '#8b1e1e', cloth: '#4a1414' } },
      { name: 'Sandstone and bronze', c: { stone: STONE.sand, metal: METAL.bronze, cloth: CLOTH.gold } },
    ],
    desc: 'A stone altar on a step, backed by a carved screen of niches and spires that climbs almost to the ceiling. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      slab(g, 4, 0, 292, 44, c.stone, r, 24, 14);
      for (const x of [56, 150, 244]) {
        rr(g, x - 22, 6, 44, 24, 10);
        paint(g, shade(c.stone, -0.45), INK, 1.4);
        poly(g, [[x, 2], [x + 7, 16], [x, 30], [x - 7, 16]]);
        paint(g, litFill(g, x - 7, 2, 14, 28, shade(c.stone, 0.15), 0.4), INK, 1);
      }
      sunMark(g, 150, 18, 10, c.metal);
      slab(g, 36, 128, 228, 36, shade(c.stone, 0.06), r, 30, 12);
      rr(g, 56, 60, 188, 70, 3);
      paint(g, litFill(g, 56, 60, 188, 70, c.stone, 0.25), INK, LW);
      cloth(g, 70, 56, 160, 78, c.cloth, r, 4, 2);
      rr(g, 70, 56, 160, 78, 2);
      stroke(g, alpha(c.metal, 0.85), 2);
      for (const x of [86, 214]) cupCandle(g, x, 76, c.metal, c.wax, 1.1);
      rr(g, 132, 80, 36, 24, 3);
      paint(g, litFill(g, 132, 80, 36, 24, c.metal, 0.4), INK, 1.4);
    },
  },
  {
    id: 'idol-colossal', name: 'Colossal seated idol', cat: 'religious', sets: ['temple', 'cave', 'desert', 'crypt', 'dungeon'], tags: ['idol', 'statue', 'colossus', 'god', 'giant', 'seated', 'cult', 'ancient', 'tall'],
    w: 3, h: 3, blocksMovement: true, blocksSight: true, c: { stone: STONE.sand, gem: '#e63946' },
    variants: [
      { name: 'Sandstone', c: {} },
      { name: 'Jade', c: { stone: '#5f8a6a', gem: '#7fffd4' } },
      { name: 'Obsidian', c: { stone: '#2e2a30', gem: '#ff4d2e' } },
      { name: 'Gilded', c: { stone: '#c9a24a', gem: '#4cc9f0' } },
    ],
    desc: 'A seated stone god nearly as tall as the hall, hands on its knees and a jewel in its brow. Faces the bottom edge.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      slab(g, 14, 8, 272, 230, shade(c.stone, -0.12), r, 34, 22, 4);
      for (const k of [-1, 1]) {
        ellipse(g, 150 + k * 46, 214, 34, 52);
        paint(g, domeFill(g, 150 + k * 46, 214, 34, c.stone, 0.3), INK, LW);
        ellipse(g, 150 + k * 50, 246, 20, 14);
        paint(g, domeFill(g, 150 + k * 50, 246, 20, shade(c.stone, 0.08), 0.4), INK, 1.6);
      }
      ellipse(g, 150, 120, 96, 56);
      paint(g, domeFill(g, 150, 120, 96, c.stone, 0.3), INK, LW);
      for (const k of [-1, 1]) {
        ellipse(g, 150 + k * 84, 160, 18, 52);
        paint(g, domeFill(g, 150 + k * 84, 160, 18, shade(c.stone, 0.04), 0.35), INK, LW);
      }
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        poly(g, [[150 + Math.cos(a - 0.14) * 40, 112 + Math.sin(a - 0.14) * 40], [150 + Math.cos(a) * 62, 112 + Math.sin(a) * 62], [150 + Math.cos(a + 0.14) * 40, 112 + Math.sin(a + 0.14) * 40]]);
        paint(g, litFill(g, 90, 50, 120, 60, shade(c.stone, 0.12), 0.3), INK, 1.4);
      }
      circle(g, 150, 116, 38);
      paint(g, domeFill(g, 150, 116, 38, shade(c.stone, 0.06), 0.45), INK, LW);
      glow(g, 150, 132, 18, c.gem, 0.6);
      gem(g, 150, 132, 7, c.gem);
      speckle(g, 20, 20, 260, 220, r, 30, alpha(shade(c.stone, -0.5), 0.3), 1.2);
    },
  },
];

const HALLS_LIBRARY: ObjDef[] = [
  {
    id: 'bookcase-grand', name: 'Double-height bookcase', cat: 'furniture', sets: ['wizard', 'castle', 'temple', 'town'], tags: ['books', 'library', 'bookcase', 'ladder', 'rolling ladder', 'tall', 'archive', 'scholar', 'grand'],
    w: 3, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.brass },
    variants: [{ name: 'Walnut', c: {} }, { name: 'Oak', c: { wood: WOOD.oak } }, { name: 'Ebony and gold', c: { wood: WOOD.ebony, metal: METAL.gold } }, { name: 'Pine', c: { wood: WOOD.pine, metal: METAL.iron } }],
    desc: 'Shelves of books climbing near the ceiling, with a brass rail and a rolling ladder to reach the top. Put the top edge on a wall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shelfCase(g, 4, 2, 292, 50, c.wood, r, (ix, iy, iw, id) => {
        for (let i = 0; i < 4; i++) bookRow(g, ix + (i * iw) / 4 + 2, iy, iw / 4 - 4, id, r);
        for (let i = 1; i < 4; i++) line(g, ix + (i * iw) / 4, iy, ix + (i * iw) / 4, iy + id, c.wood, 4);
      });
      bar(g, 4, 58, 296, 58, c.metal, 3);
      g.save();
      g.translate(206, 66);
      g.rotate(-0.08);
      for (const x of [-15, 15]) bar(g, x, -12, x, 26, c.wood, 4.6);
      for (let y = -6; y < 26; y += 8) bar(g, -15, y, 15, y, shade(c.wood, 0.1), 3);
      for (const x of [-15, 15]) {
        circle(g, x, 28, 4);
        paint(g, domeFill(g, x, 28, 4, c.metal, 0.5), INK, 1);
      }
      g.restore();
    },
  },
  {
    id: 'reading-nook', name: 'Reading nook', cat: 'furniture', sets: ['wizard', 'castle', 'town', 'tavern'], tags: ['armchair', 'reading', 'books', 'library', 'study', 'cozy', 'rug', 'footstool', 'scholar'],
    w: 2, h: 2, c: { wood: WOOD.walnut, cloth: CLOTH.green, rug: CLOTH.red, wax: WAX },
    variants: [
      { name: 'Green and red', c: {} },
      { name: 'Blue and gold', c: { cloth: CLOTH.blue, rug: CLOTH.gold } },
      { name: 'Burgundy', c: { cloth: '#6a1f2a', rug: CLOTH.brown, wood: WOOD.ebony } },
      { name: 'Plum', c: { cloth: CLOTH.purple, rug: CLOTH.black, wood: WOOD.oak } },
    ],
    desc: 'A deep armchair on a round rug with a footstool, a candle table and a pile of books.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      circle(g, 100, 100, 90);
      paint(g, domeFill(g, 100, 100, 90, c.rug, 0.15), INK, 1.8);
      circle(g, 100, 100, 78);
      stroke(g, alpha(shade(c.rug, 0.45), 0.7), 3);
      circle(g, 100, 100, 40);
      stroke(g, alpha(shade(c.rug, 0.45), 0.5), 2);
      chairAt(g, 78, 82, 74, -0.5, c.wood, r, c.cloth);
      pad(g, 110, 124, 40, 32, c.cloth, 10);
      roundPanel(g, 148, 60, 22, c.wood, r, 2);
      cupCandle(g, 144, 56, METAL.brass, c.wax, 0.8);
      book(g, 150, 60, 14, 10, '#7a2a22', 0.4);
      for (let i = 0; i < 4; i++) book(g, 30 + i * 2, 140 - i * 5, 22, 15, BOOKS[i + 1], (r() - 0.5) * 0.6);
    },
  },
  {
    id: 'astrolabe-stand', name: 'Great astrolabe', cat: 'arcane', sets: ['wizard', 'castle', 'temple', 'ship'], tags: ['astrolabe', 'stars', 'astronomy', 'brass', 'instrument', 'observatory', 'scholar', 'navigation'],
    w: 1, h: 1, blocksMovement: true, c: { metal: METAL.brass, wood: WOOD.walnut }, variants: MV,
    desc: 'A brass star-disc as tall as a person, turning on a tripod stand.',
    draw: ({ g, c }) => {
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU + Math.PI / 2;
        bar(g, 50, 50, 50 + Math.cos(a) * 44, 50 + Math.sin(a) * 44, c.wood, 4);
      }
      hoop(g, 50, 50, 36, c.metal, 5);
      circle(g, 50, 50, 33);
      paint(g, alpha(shade(c.metal, -0.4), 0.55), null);
      hoop(g, 50, 50, 24, c.metal, 2);
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * TAU;
        line(g, 50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30, 50 + Math.cos(a) * 34, 50 + Math.sin(a) * 34, INK, 1);
      }
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.3;
        bar(g, 50, 50, 50 + Math.cos(a) * 22, 50 + Math.sin(a) * 22, c.metal, 1.6);
        circle(g, 50 + Math.cos(a) * 22, 50 + Math.sin(a) * 22, 2.4);
        paint(g, shade(c.metal, 0.3), INK, 0.8);
      }
      bar(g, 20, 70, 80, 30, shade(c.metal, 0.15), 3);
      rivet(g, 50, 50, 4, c.metal);
    },
  },
  {
    id: 'globe-great', name: 'Great globe', cat: 'decor', sets: ['wizard', 'castle', 'town', 'ship'], tags: ['globe', 'world', 'map', 'library', 'study', 'navigator', 'scholar', 'large'],
    w: 2, h: 2, blocksMovement: true, c: { wood: WOOD.walnut, sea: '#3f6f9a', land: '#9aa86a', metal: METAL.brass },
    variants: [
      { name: 'Walnut', c: {} },
      { name: 'Oak', c: { wood: WOOD.oak } },
      { name: 'Ebony and gold', c: { wood: WOOD.ebony, metal: METAL.gold } },
      { name: 'Old parchment', c: { sea: '#c9b07a', land: '#8a6a3a', wood: WOOD.pine } },
    ],
    desc: 'A globe taller than a person in a ring stand on four carved legs.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      bar(g, 36, 36, 164, 164, c.wood, 4);
      bar(g, 164, 36, 36, 164, c.wood, 4);
      for (const [x, y] of [[36, 36], [164, 36], [36, 164], [164, 164]]) {
        circle(g, x, y, 11);
        paint(g, domeFill(g, x, y, 11, c.wood, 0.45), INK, 1.6);
      }
      hoop(g, 100, 100, 80, c.wood, 9);
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * TAU;
        line(g, 100 + Math.cos(a) * 77, 100 + Math.sin(a) * 77, 100 + Math.cos(a) * 83, 100 + Math.sin(a) * 83, alpha(INK, 0.6), 1);
      }
      circle(g, 100, 100, 64);
      paint(g, domeFill(g, 100, 100, 64, c.sea, 0.4), INK, LW);
      g.save();
      circle(g, 100, 100, 64);
      g.clip();
      for (const [x, y, s] of [[78, 78, 26], [128, 92, 20], [96, 136, 22]]) {
        blob(g, lumpy(x, y, s, 0.35, 10, r));
        paint(g, alpha(c.land, 0.95), alpha(shade(c.land, -0.6), 0.8), 1.2);
      }
      ellipse(g, 100, 100, 64, 22);
      stroke(g, alpha('#ffffff', 0.35), 1);
      g.restore();
      g.beginPath();
      g.ellipse(100, 100, 18, 68, 0.3, 0, TAU);
      stroke(g, INK, 5);
      g.beginPath();
      g.ellipse(100, 100, 18, 68, 0.3, 0, TAU);
      stroke(g, c.metal, 3);
    },
  },
  {
    id: 'archive-stacks', name: 'Scroll archive stacks', cat: 'storage', sets: ['wizard', 'temple', 'castle', 'town', 'desert'], tags: ['scrolls', 'archive', 'library', 'stacks', 'records', 'cubbies', 'shelves', 'tall', 'scholar'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, paper: '#e8dcb8' }, variants: WV,
    desc: 'A free-standing rack of cubbyholes stuffed with scrolls on both sides, taller than two people.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 4, 8, 192, 84, 3);
      paint(g, litFill(g, 4, 8, 192, 84, shade(c.wood, -0.3), 0.2), INK, LW);
      for (let col = 0; col < 6; col++) for (let row = 0; row < 2; row++) {
        const x = 10 + col * 30.5, y = 14 + row * 39;
        rr(g, x, y, 27, 34, 1);
        paint(g, '#1e140d', null);
        for (let i = 0; i < 6; i++) {
          const sx = x + 6 + (i % 3) * 7.5 + (r() - 0.5) * 2, sy = y + 9 + Math.floor(i / 3) * 14 + (r() - 0.5) * 2;
          circle(g, sx, sy, 3.6);
          paint(g, domeFill(g, sx, sy, 3.6, shade(c.paper, (r() - 0.5) * 0.2), 0.3), INK, 0.8);
          circle(g, sx, sy, 1.1);
          g.fillStyle = alpha(shade(c.paper, -0.5), 0.8);
          g.fill();
        }
      }
      for (let col = 0; col <= 6; col++) {
        const x = 7 + col * 30.5;
        rr(g, x, 8, 4, 84, 1);
        paint(g, litFill(g, x, 8, 4, 84, c.wood, 0.3), INK, 0.9);
      }
      for (const y of [8, 48.5, 88]) {
        rr(g, 4, y, 192, 4, 1);
        paint(g, litFill(g, 4, y, 192, 4, c.wood, 0.3), INK, 0.9);
      }
      rr(g, 4, 8, 192, 84, 3);
      stroke(g, INK, LW);
    },
  },
];

const HALLS_CRYPT: ObjDef[] = [
  {
    id: 'gate-iron-tall', name: 'Tall iron gate', cat: 'structure', sets: ['castle', 'crypt', 'dungeon', 'temple', 'town'], tags: ['gate', 'bars', 'iron', 'fence', 'barrier', 'tall', 'crypt gate', 'locked', 'cemetery'],
    w: 2, h: 1, blocksMovement: true, c: { metal: METAL.black, stone: STONE.grey },
    variants: [{ name: 'Black iron', c: {} }, { name: 'Rusted', c: { metal: METAL.rust } }, { name: 'Gilded', c: { metal: METAL.gold, stone: STONE.marble } }, { name: 'Bronze', c: { metal: METAL.bronze, stone: STONE.sand } }],
    desc: 'A locked double gate of spear-topped bars about 18 ft tall, hung between stone posts. You can see and shoot through it.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      bar(g, 30, 44, 170, 44, c.metal, 3);
      bar(g, 30, 56, 170, 56, c.metal, 3);
      for (let i = 0; i < 11; i++) {
        const x = 37 + i * 12.6;
        circle(g, x, 50, 4.2);
        paint(g, domeFill(g, x, 50, 4.2, c.metal, 0.5), INK, 1.1);
        poly(g, [[x, 43], [x + 3, 50], [x, 57], [x - 3, 50]]);
        paint(g, shade(c.metal, 0.3), null);
      }
      rr(g, 92, 42, 16, 16, 2);
      paint(g, litFill(g, 92, 42, 16, 16, shade(c.metal, 0.1), 0.4), INK, 1.4);
      circle(g, 100, 50, 2.4);
      paint(g, '#1a1410', null);
      for (const x of [4, 170]) slab(g, x, 28, 26, 44, c.stone, r, 13, 11);
    },
  },
  {
    id: 'sarcophagus-row', name: 'Row of sarcophagi', cat: 'religious', sets: ['crypt', 'temple', 'dungeon', 'castle', 'desert'], tags: ['sarcophagus', 'tomb', 'burial', 'crypt', 'effigy', 'dead', 'mausoleum', 'nobles'],
    w: 4, h: 2, blocksMovement: true, c: { stone: STONE.grey, metal: METAL.bronze, wax: WAX }, variants: STONES,
    desc: 'Three stone coffins with carved lids, side by side on a long plinth. Something may still be inside.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      slab(g, 4, 6, 392, 188, shade(c.stone, -0.18), r, 40, 26, 4);
      for (const x of [28, 155, 282]) {
        rr(g, x, 18, 90, 164, 8);
        paint(g, litFill(g, x, 18, 90, 164, c.stone, 0.25), INK, LW);
        rr(g, x + 7, 25, 76, 150, 6);
        paint(g, litFill(g, x + 7, 25, 76, 150, shade(c.stone, 0.1), 0.3), INK, 1.3);
        bevel(g, x + 7, 25, 76, 150, 6, 0.3);
        circle(g, x + 45, 50, 13);
        paint(g, domeFill(g, x + 45, 50, 13, shade(c.stone, 0.18), 0.45), INK, 1.4);
        ellipse(g, x + 45, 104, 24, 40);
        paint(g, domeFill(g, x + 45, 104, 24, shade(c.stone, 0.12), 0.35), INK, 1.3);
        line(g, x + 45, 76, x + 45, 148, alpha(shade(c.stone, -0.5), 0.7), 1.4);
        line(g, x + 36, 86, x + 54, 86, alpha(shade(c.stone, -0.5), 0.7), 1.6);
      }
      for (const x of [137, 264]) cupCandle(g, x, 44, c.metal, c.wax, 0.9);
    },
  },
  {
    id: 'bone-heap', name: 'Bone heap', cat: 'hazard', sets: ['crypt', 'cave', 'dungeon', 'swamp'], tags: ['bones', 'skulls', 'pile', 'remains', 'ossuary', 'lair', 'dead', 'heap'],
    w: 2, h: 2, difficult: true, c: { bone: BONE },
    variants: [{ name: 'Bleached', c: {} }, { name: 'Old', c: { bone: '#cdb98a' } }, { name: 'Charred', c: { bone: '#6a5e54' } }, { name: 'Mossy', c: { bone: '#a8b48a' } }],
    desc: 'A waist-high heap of bones and skulls. Difficult terrain; who knows what is buried in it.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(100, 104, 86, 0.18, 14, r, 78));
      paint(g, domeFill(g, 100, 104, 86, shade(c.bone, -0.35), 0.3), INK, LW);
      for (let i = 0; i < 26; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 66, x = 100 + Math.cos(a) * d, y = 104 + Math.sin(a) * d * 0.9, b = r() * Math.PI, L = 12 + r() * 16;
        boneAt(g, x - Math.cos(b) * L, y - Math.sin(b) * L, x + Math.cos(b) * L, y + Math.sin(b) * L, 3 + r() * 1.6, shade(c.bone, (r() - 0.5) * 0.2));
      }
      for (let i = 0; i < 6; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 52;
        skull(g, 100 + Math.cos(a) * d, 100 + Math.sin(a) * d, 8 + r() * 3, r() * TAU, c.bone);
      }
    },
  },
  {
    id: 'torture-wheel', name: 'Breaking wheel', cat: 'furniture', sets: ['dungeon', 'castle'], tags: ['torture', 'wheel', 'interrogation', 'prison', 'execution', 'straps', 'cruel'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.iron, rope: '#8a6a4a' }, variants: WV,
    desc: 'A big spoked wheel upright in a heavy frame, with straps for a victim. Grim dressing for a dungeon.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const y of [8, 92]) {
        bar(g, 46, y, 154, y, shade(c.wood, -0.1), 7);
        bar(g, 100, y, 100, 50, shade(c.wood, -0.05), 5);
      }
      bar(g, 100, 6, 100, 94, c.metal, 4);
      g.beginPath();
      g.ellipse(100, 50, 76, 38, 0, 0, TAU);
      stroke(g, INK, 10);
      g.beginPath();
      g.ellipse(100, 50, 76, 38, 0, 0, TAU);
      stroke(g, litFill(g, 24, 12, 152, 76, c.wood, 0.3), 7);
      g.beginPath();
      g.ellipse(100, 50, 76, 38, 0, 0, TAU);
      stroke(g, alpha(c.metal, 0.9), 2);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        bar(g, 100, 50, 100 + Math.cos(a) * 72, 50 + Math.sin(a) * 35, c.wood, 3.4);
      }
      circle(g, 100, 50, 10);
      paint(g, domeFill(g, 100, 50, 10, c.metal, 0.5), INK, 1.4);
      for (const a of [0.4, 2.7]) {
        rr(g, 100 + Math.cos(a) * 64 - 4, 50 + Math.sin(a) * 31 - 7, 8, 14, 2);
        paint(g, c.rope, INK, 1);
      }
      void r;
    },
  },
  {
    id: 'gibbet-post', name: 'Gibbet', cat: 'structure', sets: ['dungeon', 'castle', 'town', 'swamp', 'forest'], tags: ['gibbet', 'gallows', 'cage', 'hanging', 'execution', 'crossroads', 'warning', 'corpse'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.iron },
    variants: [{ name: 'Empty', c: {} }, { name: 'Occupied', c: {}, f: { bones: 1 } }, { name: 'Rusted', c: { metal: METAL.rust } }, { name: 'Weathered, occupied', c: { wood: '#7d6a55', metal: METAL.rust }, f: { bones: 1 } }],
    desc: 'A tall post with an arm, from which a body-shaped iron cage hangs on a chain.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      dropShadow(g, 150, 54, 30, 26);
      plank(g, 86, 50, 120, 14, 0, c.wood, r);
      bar(g, 34, 62, 70, 52, shade(c.wood, -0.1), 5);
      rr(g, 16, 34, 32, 32, 3);
      paint(g, litFill(g, 16, 34, 32, 32, c.wood, 0.3), INK, LW);
      if (f.bones) skull(g, 152, 44, 9, 0);
      g.beginPath();
      g.ellipse(150, 50, 18, 26, 0, 0, TAU);
      stroke(g, INK, 5);
      g.beginPath();
      g.ellipse(150, 50, 18, 26, 0, 0, TAU);
      stroke(g, c.metal, 3);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        bar(g, 150, 50, 150 + Math.cos(a) * 18, 50 + Math.sin(a) * 26, c.metal, 1.6);
      }
      ringPull(g, 150, 50, 4, c.metal);
    },
  },
  {
    id: 'stalactites-tall', name: 'Dripping stalactites', cat: 'terrain', sets: ['cave', 'mine', 'winter', 'crypt', 'sewer'], tags: ['stalactites', 'ceiling', 'cave', 'dripping', 'water', 'rock', 'hanging', 'overhead', 'tall'],
    w: 2, h: 2, layer: 'overhead', c: { rock: '#8a8478', water: '#5a8aa8' },
    variants: [{ name: 'Limestone', c: {} }, { name: 'Dark rock', c: { rock: '#4e4b48' } }, { name: 'Ice', c: { rock: '#cfe6f2', water: '#9ac8e0' } }, { name: 'Red rock', c: { rock: '#9a5a48', water: '#6a8a9a' } }],
    desc: 'Long spears of rock hanging from a high cave roof, dripping into puddles. Tokens pass underneath.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(108, 112, 60, 0.3, 11, r, 46));
      paint(g, alpha(c.water, 0.45), alpha(shade(c.water, -0.4), 0.6), 1.2);
      for (const [x, y, s] of [[70, 70, 22], [128, 60, 16], [104, 112, 26], [150, 120, 18], [60, 136, 14], [124, 158, 12], [160, 80, 11]]) {
        circle(g, x, y, s);
        paint(g, domeFill(g, x, y, s, c.rock, 0.4), INK, 1.8);
        circle(g, x, y, s * 0.6);
        stroke(g, alpha(shade(c.rock, -0.4), 0.6), 1.1);
        circle(g, x + s * 0.05, y + s * 0.05, s * 0.22);
        paint(g, shade(c.rock, -0.25), null);
        circle(g, x, y, 2);
        g.fillStyle = alpha('#ffffff', 0.7);
        g.fill();
      }
    },
  },
  {
    id: 'crystal-spire', name: 'Crystal spire', cat: 'nature', sets: ['cave', 'wizard', 'mine', 'winter'], tags: ['crystal', 'spire', 'gem', 'glowing', 'formation', 'magic', 'cave', 'tall', 'light'],
    w: 2, h: 2, blocksMovement: true, light: { bright: 10, dim: 20, color: '#8fd8ff' }, c: { crystal: '#8fd8ff', rock: '#5a5560' },
    variants: [{ name: 'Blue', c: {} }, { name: 'Violet', c: { crystal: '#c9a2ff' } }, { name: 'Green', c: { crystal: '#8fffb0' } }, { name: 'Red', c: { crystal: '#ff8a8a' } }],
    desc: 'A cluster of glowing crystals as tall as the cave, around one great central spire.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 100, 100, 99, c.crystal, 0.45);
      for (const [x, y, s] of [[70, 130, 30], [130, 136, 26], [100, 80, 28], [140, 86, 18]]) stone(g, x, y, s, c.rock, r);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + r() * 0.4, L = 34 + r() * 26;
        shard(g, 100 + Math.cos(a) * (14 + L / 2), 104 + Math.sin(a) * (14 + L / 2), L, 7 + r() * 4, a, shade(c.crystal, (r() - 0.5) * 0.3));
      }
      gem(g, 100, 104, 26, c.crystal);
    },
  },
  {
    id: 'column-collapsed', name: 'Collapsed tall column', cat: 'structure', sets: ['temple', 'crypt', 'castle', 'dungeon', 'desert'], tags: ['column', 'ruin', 'fallen', 'drums', 'rubble', 'cover', 'broken', 'tall'],
    w: 3, h: 1, blocksMovement: true, difficult: true, c: { stone: STONE.marble }, variants: HSTONES,
    desc: 'A great column that toppled and broke into drums, its stump still standing at the left end.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const [x, y, s] of [[96, 84, 7], [178, 18, 6], [268, 84, 8], [212, 86, 5]]) stone(g, x, y, s, c.stone, r);
      for (const [x, rot] of [[112, 0.06], [170, -0.08]] as [number, number][]) {
        g.save();
        g.translate(x, 52);
        g.rotate(rot);
        rr(g, -26, -30, 52, 60, 6);
        paint(g, litFill(g, -26, -30, 52, 60, c.stone, 0.3), INK, LW);
        for (let i = 1; i < 6; i++) line(g, -26, -30 + i * 10, 26, -30 + i * 10, alpha(shade(c.stone, -0.5), 0.6), 1.3);
        g.restore();
      }
      g.save();
      g.translate(244, 52);
      g.rotate(0.25);
      rr(g, -30, -30, 60, 60, 3);
      paint(g, litFill(g, -30, -30, 60, 60, shade(c.stone, 0.05), 0.3), INK, LW);
      bevel(g, -30, -30, 60, 60, 3, 0.3);
      g.restore();
      colTop(g, 44, 50, 38, c.stone, r, 'flute');
      blob(g, lumpy(44, 50, 18, 0.45, 9, r));
      paint(g, shade(c.stone, -0.25), INK, 1.2);
    },
  },
  {
    id: 'ceiling-rubble', name: 'Fallen ceiling', cat: 'terrain', sets: ['dungeon', 'crypt', 'cave', 'castle', 'mine', 'temple'], tags: ['rubble', 'collapse', 'cave-in', 'ruin', 'debris', 'ceiling', 'blocks', 'difficult'],
    w: 2, h: 2, difficult: true, c: { stone: STONE.grey, wood: WOOD.walnut }, variants: STONES,
    desc: 'A heap of stone and a snapped beam where part of the high ceiling came down. Difficult terrain.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const dust = g.createRadialGradient(100, 100, 10, 100, 100, 96);
      dust.addColorStop(0, alpha(shade(c.stone, 0.2), 0.45));
      dust.addColorStop(1, alpha(shade(c.stone, 0.2), 0));
      g.fillStyle = dust;
      g.fillRect(0, 0, 200, 200);
      plank(g, 104, 92, 150, 18, 0.62, c.wood, r);
      for (const [x, y, rot] of [[60, 70, 0.3], [138, 136, -0.4], [118, 50, 0.9]]) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        rr(g, -18, -12, 36, 24, 2);
        paint(g, litFill(g, -18, -12, 36, 24, shade(c.stone, 0.06), 0.3), INK, 1.8);
        bevel(g, -18, -12, 36, 24, 2, 0.3);
        g.restore();
      }
      for (let i = 0; i < 16; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 78;
        stone(g, 100 + Math.cos(a) * d, 100 + Math.sin(a) * d, 5 + r() * 12, shade(c.stone, (r() - 0.5) * 0.2), r);
      }
    },
  },
];

const HALLS: ObjDef[] = [...HALLS_ARCH, ...HALLS_HANGING, ...HALLS_LIGHTS, ...HALLS_ROOMS, ...HALLS_LIBRARY, ...HALLS_CRYPT];

export const EXTRA_OBJECTS: ObjDef[] = [...LIGHTS, ...FURNITURE, ...DRESSING, ...HALLS];

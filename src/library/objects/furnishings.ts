// Furnishings, storage, tavern, town, market, kitchen, workshop and treasure objects.
// Original art drawn in code: top-down, light from the top-left, ink outline, soft gradients.
import type { ObjDef, G } from '../art/types';
import {
  rng, rr, circle, board, ellipse, poly, blob, lumpy, litFill, domeFill, paint, line, bevel, speckle, strap, rivet, cloth, coins, gem,
  glow, flame, liquid, book, bottle, mug, plate, candle, scroll, shade, mix, alpha, blocks, stone, INK, LW, WOOD, METAL, STONE, CLOTH, vars,
} from '../art/kit';

type R = () => number;

// ---------------------------------------------------------------- helpers

const WV = [
  { name: 'Oak', c: { wood: WOOD.oak } },
  { name: 'Walnut', c: { wood: WOOD.walnut } },
  { name: 'Pine', c: { wood: WOOD.pine } },
  { name: 'Ebony', c: { wood: WOOD.ebony } },
];

/** Cheap wood grain: a few gentle curves across a rect. */
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

/** Boards filling a rect, no outline. */
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

function shadowRect(g: G, x: number, y: number, w: number, h: number, rad = 4, a = 0.3) {
  rr(g, x + 5, y + 6, w, h, rad);
  g.fillStyle = `rgba(0,0,0,${a})`;
  g.fill();
}

/** Plain solid shape helper: rounded rect, lit, outlined. */
function box(g: G, x: number, y: number, w: number, h: number, col: string, rad = 3, lw = LW, k = 0.2) {
  rr(g, x, y, w, h, rad);
  paint(g, litFill(g, x, y, w, h, col, k), INK, lw);
}

/** A crate lid seen from above: slats, frame and a diagonal brace. */
function crateTop(g: G, x: number, y: number, w: number, h: number, wood: string, r: R, mark?: string) {
  g.save();
  rr(g, x, y, w, h, 2);
  g.clip();
  boards(g, x, y, w, h, shade(wood, -0.08), r, 'h', Math.max(3, Math.round(h / 16)));
  g.restore();
  const t = Math.max(7, Math.min(w, h) * 0.14);
  const fw = shade(wood, 0.06);
  // diagonal brace, clipped to the inside
  g.save();
  g.beginPath();
  g.rect(x + t, y + t, w - 2 * t, h - 2 * t);
  g.clip();
  const iw = w - 2 * t, ih = h - 2 * t, len = Math.hypot(iw, ih);
  g.translate(x + w / 2, y + h / 2);
  g.rotate(Math.atan2(ih, iw));
  rr(g, -len / 2 - 4, -t / 2, len + 8, t, 1);
  paint(g, litFill(g, -len / 2, -t / 2, len, t, fw, 0.18), INK, 1.2);
  g.restore();
  if (mark) {
    g.save();
    g.globalAlpha = 0.75;
    circle(g, x + w * 0.3, y + h * 0.7, Math.min(w, h) * 0.11);
    stroke(g, mark, 2.4);
    line(g, x + w * 0.62, y + h * 0.22, x + w * 0.78, y + h * 0.38, mark, 2.4);
    line(g, x + w * 0.78, y + h * 0.22, x + w * 0.62, y + h * 0.38, mark, 2.4);
    g.restore();
  }
  // frame
  const fr = (bx: number, by: number, bw: number, bh: number) => {
    rr(g, bx, by, bw, bh, 1.2);
    paint(g, litFill(g, bx, by, bw, bh, fw, 0.2), INK, 1.2);
    fgrain(g, bx, by, bw, bh, fw, r, bw > bh ? 'h' : 'v', 1);
  };
  fr(x, y, w, t);
  fr(x, y + h - t, w, t);
  fr(x, y + t, t, h - 2 * t);
  fr(x + w - t, y + t, t, h - 2 * t);
  for (const [nx, ny] of [[x + t / 2, y + t / 2], [x + w - t / 2, y + t / 2], [x + t / 2, y + h - t / 2], [x + w - t / 2, y + h - t / 2]]) {
    circle(g, nx, ny, 1.4);
    g.fillStyle = '#2a2a2a';
    g.fill();
  }
  rr(g, x, y, w, h, 2);
  stroke(g, INK, LW);
}

/** An open crate: frame with dark inside, contents drawn by fill(). */
function openCrate(g: G, x: number, y: number, w: number, h: number, wood: string, r: R, fill: (ix: number, iy: number, iw: number, ih: number) => void) {
  const t = Math.max(6, Math.min(w, h) * 0.12);
  rr(g, x, y, w, h, 2);
  paint(g, litFill(g, x, y, w, h, shade(wood, 0.04), 0.2), INK, LW);
  rr(g, x + t, y + t, w - 2 * t, h - 2 * t, 1.5);
  paint(g, '#2a1c12', INK, 1.2);
  fgrain(g, x, y, w, t, wood, r, 'h', 1);
  fgrain(g, x, y + h - t, w, t, wood, r, 'h', 1);
  g.save();
  rr(g, x + t, y + t, w - 2 * t, h - 2 * t, 1.5);
  g.clip();
  fill(x + t, y + t, w - 2 * t, h - 2 * t);
  g.restore();
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
    circle(g, 0, s * 0.04, 1.4);
    g.fillStyle = shade(cushion, -0.5);
    g.fill();
  }
  // backrest
  rr(g, -s * 0.47, -s * 0.52, s * 0.94, s * 0.2, 3);
  paint(g, litFill(g, -s * 0.47, -s * 0.52, s * 0.94, s * 0.2, shade(wood, -0.08), 0.25), INK, LW * 0.9);
  for (const px of [-s * 0.4, s * 0.4]) {
    circle(g, px, -s * 0.42, s * 0.075);
    paint(g, domeFill(g, px, -s * 0.42, s * 0.075, shade(wood, 0.1), 0.4), INK, 1);
  }
  g.restore();
}

function stoolAt(g: G, cx: number, cy: number, rad: number, wood: string, r: R) {
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i / 3) * Math.PI * 2 + 0.5;
    circle(g, cx + Math.cos(a) * rad * 1.05, cy + Math.sin(a) * rad * 1.05, rad * 0.2);
    paint(g, shade(wood, -0.3), INK, 1);
  }
  roundPanel(g, cx, cy, rad, wood, r, 2);
}

/** Upright sack seen from above with a gathered, tied neck. */
function sackUp(g: G, cx: number, cy: number, rad: number, col: string, r: R) {
  const pts = lumpy(cx, cy, rad, 0.22, 10, r);
  blob(g, pts);
  paint(g, domeFill(g, cx, cy, rad, col, 0.3), INK, LW);
  g.save();
  blob(g, pts);
  g.clip();
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + r();
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * rad * 0.3, cy + Math.sin(a) * rad * 0.3);
    g.quadraticCurveTo(cx + Math.cos(a + 0.3) * rad * 0.6, cy + Math.sin(a + 0.3) * rad * 0.6, cx + Math.cos(a + 0.1) * rad * 0.92, cy + Math.sin(a + 0.1) * rad * 0.92);
    stroke(g, alpha(shade(col, -0.55), 0.45), 1.1);
  }
  speckle(g, cx - rad, cy - rad, rad * 2, rad * 2, r, Math.round(rad / 2), alpha(shade(col, -0.4), 0.35), 0.9);
  g.restore();
  const nk = lumpy(cx, cy, rad * 0.3, 0.55, 8, r);
  blob(g, nk);
  paint(g, domeFill(g, cx, cy, rad * 0.3, shade(col, 0.08), 0.45), INK, 1.3);
  circle(g, cx, cy, rad * 0.14);
  paint(g, '#7a5a30', INK, 1.1);
}

/** A sack lying down, tied end pointing along +x before rotation. */
function sackLying(g: G, cx: number, cy: number, len: number, wid: number, rot: number, col: string, r: R, label?: string) {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  // tuft
  blob(g, [[len * 0.3, -wid * 0.1], [len * 0.47, -wid * 0.24], [len * 0.44, 0], [len * 0.47, wid * 0.24], [len * 0.3, wid * 0.1]]);
  paint(g, litFill(g, len * 0.3, -wid * 0.3, len * 0.2, wid * 0.6, shade(col, 0.05)), INK, 1.2);
  const pts = [[-len * 0.5, -wid * 0.36], [-len * 0.3, -wid * 0.54], [len * 0.05, -wid * 0.55], [len * 0.26, -wid * 0.42], [len * 0.36, -wid * 0.1], [len * 0.36, wid * 0.1], [len * 0.26, wid * 0.42], [len * 0.05, wid * 0.55], [-len * 0.3, wid * 0.54], [-len * 0.5, wid * 0.36], [-len * 0.54, 0]];
  blob(g, pts);
  paint(g, domeFill(g, -len * 0.05, 0, len * 0.5, col, 0.3), INK, LW * 0.9);
  if (label) {
    g.save();
    blob(g, pts);
    g.clip();
    g.fillStyle = alpha(label, 0.7);
    g.fillRect(-len * 0.18, -wid * 0.6, len * 0.12, wid * 1.2);
    g.restore();
  }
  line(g, -len * 0.3, -wid * 0.2, len * 0.15, -wid * 0.28, alpha(shade(col, -0.5), 0.5), 1);
  line(g, -len * 0.25, wid * 0.22, len * 0.18, wid * 0.18, alpha(shade(col, -0.5), 0.4), 1);
  rr(g, len * 0.31, -wid * 0.14, len * 0.06, wid * 0.28, 1);
  paint(g, '#6e5130', INK, 1);
  g.restore();
}

function goblet(g: G, cx: number, cy: number, rad: number, metal: string, drink = '#6e1a26') {
  circle(g, cx, cy, rad);
  paint(g, domeFill(g, cx, cy, rad, metal, 0.5), INK, 1);
  circle(g, cx, cy, rad * 0.65);
  paint(g, drink, alpha(shade(metal, -0.5), 0.8), 0.8);
  circle(g, cx - rad * 0.25, cy - rad * 0.25, rad * 0.18);
  g.fillStyle = 'rgba(255,255,255,0.5)';
  g.fill();
}

function fruit(g: G, cx: number, cy: number, rad: number, col: string) {
  circle(g, cx, cy, rad);
  paint(g, domeFill(g, cx, cy, rad, col, 0.45), INK, 0.9);
  circle(g, cx + rad * 0.1, cy + rad * 0.05, rad * 0.14);
  g.fillStyle = '#4a3a1e';
  g.fill();
}

function jar(g: G, cx: number, cy: number, rad: number, col: string, lid = '#8a6a44') {
  circle(g, cx, cy, rad);
  paint(g, domeFill(g, cx, cy, rad, col, 0.45), INK, 1);
  circle(g, cx, cy, rad * 0.55);
  paint(g, domeFill(g, cx, cy, rad * 0.55, lid, 0.35), INK, 0.8);
}

function loaf(g: G, cx: number, cy: number, rx: number, ry: number, rot: number) {
  ellipse(g, cx, cy, rx, ry, rot);
  paint(g, domeFill(g, cx, cy, rx, '#c98b3e', 0.4), INK, 1);
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  for (let i = -1; i <= 1; i++) line(g, i * rx * 0.45 - 2, -ry * 0.45, i * rx * 0.45 + 2, ry * 0.45, alpha('#6e3d14', 0.7), 1);
  g.restore();
}

function fish(g: G, cx: number, cy: number, len: number, rot: number, col: string) {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  poly(g, [[len * 0.36, 0], [len * 0.52, -len * 0.14], [len * 0.52, len * 0.14]]);
  paint(g, shade(col, -0.15), INK, 0.9);
  ellipse(g, 0, 0, len * 0.4, len * 0.15);
  paint(g, litFill(g, -len * 0.4, -len * 0.15, len * 0.8, len * 0.3, col, 0.35), INK, 1);
  line(g, -len * 0.25, -len * 0.12, -len * 0.22, len * 0.12, alpha(shade(col, -0.5), 0.6), 0.8);
  circle(g, -len * 0.3, -len * 0.04, len * 0.035);
  g.fillStyle = '#111';
  g.fill();
  g.restore();
}

function sword(g: G, x: number, y0: number, y1: number, metal: string, hilt = '#5a3a20') {
  const L = y1 - y0;
  poly(g, [[x - 3, y0 + L * 0.28], [x + 3, y0 + L * 0.28], [x + 2.6, y1 - 6], [x, y1], [x - 2.6, y1 - 6]]);
  paint(g, litFill(g, x - 3, y0, 6, L, METAL.silver === metal ? metal : mix(metal, '#dfe4e8', 0.4), 0.4), INK, 1);
  line(g, x, y0 + L * 0.3, x, y1 - 5, alpha('#ffffff', 0.45), 0.8);
  rr(g, x - 9, y0 + L * 0.24, 18, 4.5, 2);
  paint(g, litFill(g, x - 9, y0 + L * 0.24, 18, 4.5, metal, 0.4), INK, 1);
  rr(g, x - 2.2, y0 + 5, 4.4, L * 0.2, 1.5);
  paint(g, hilt, INK, 1);
  circle(g, x, y0 + 4, 3.4);
  paint(g, domeFill(g, x, y0 + 4, 3.4, metal, 0.5), INK, 1);
}

function spear(g: G, x: number, y0: number, y1: number, metal: string, wood: string) {
  line(g, x, y0 + 14, x, y1, INK, 4.6);
  line(g, x, y0 + 14, x, y1, wood, 2.6);
  poly(g, [[x, y0], [x + 4.5, y0 + 10], [x + 1.6, y0 + 17], [x - 1.6, y0 + 17], [x - 4.5, y0 + 10]]);
  paint(g, litFill(g, x - 5, y0, 10, 17, mix(metal, '#dfe4e8', 0.3), 0.4), INK, 1);
}

function axe(g: G, x: number, y0: number, y1: number, metal: string, wood: string) {
  line(g, x, y0 + 2, x, y1, INK, 5.2);
  line(g, x, y0 + 2, x, y1, wood, 3.2);
  g.beginPath();
  g.moveTo(x + 2, y0 + 6);
  g.quadraticCurveTo(x + 18, y0 - 2, x + 17, y0 + 14);
  g.quadraticCurveTo(x + 18, y0 + 28, x + 2, y0 + 22);
  g.closePath();
  paint(g, litFill(g, x, y0, 18, 28, mix(metal, '#dfe4e8', 0.3), 0.4), INK, 1.1);
}

function mace(g: G, x: number, y0: number, y1: number, metal: string, wood: string) {
  line(g, x, y0 + 6, x, y1, INK, 4.8);
  line(g, x, y0 + 6, x, y1, wood, 2.8);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    poly(g, [[x + Math.cos(a - 0.3) * 6, y0 + 8 + Math.sin(a - 0.3) * 6], [x + Math.cos(a) * 10.5, y0 + 8 + Math.sin(a) * 10.5], [x + Math.cos(a + 0.3) * 6, y0 + 8 + Math.sin(a + 0.3) * 6]]);
    paint(g, shade(metal, -0.1), INK, 0.8);
  }
  circle(g, x, y0 + 8, 6.5);
  paint(g, domeFill(g, x, y0 + 8, 6.5, metal, 0.5), INK, 1);
}

function bedAt(g: G, x: number, y: number, w: number, h: number, wood: string, blanket: string, r: R, pillows = 1, sheet = '#ebe4d2') {
  panel(g, x, y, w, h, wood, r, 'v', Math.max(1, Math.round(w / 40)), 4);
  rr(g, x + 5, y + 12, w - 10, h - 17, 4);
  paint(g, litFill(g, x + 5, y + 12, w - 10, h - 17, sheet, 0.12), INK, 1.2);
  const pw = (w - 16 - (pillows - 1) * 4) / pillows;
  for (let i = 0; i < pillows; i++) {
    const px = x + 8 + i * (pw + 4);
    rr(g, px, y + 16, pw, 22, 8);
    paint(g, domeFill(g, px + pw / 2, y + 27, pw * 0.6, '#f4efe2', 0.25), INK, 1.1);
    line(g, px + pw * 0.3, y + 27, px + pw * 0.7, y + 27, 'rgba(0,0,0,0.12)', 1.4);
  }
  const by = y + Math.max(44, h * 0.34);
  cloth(g, x + 3, by, w - 6, y + h - 3 - by, blanket, r, Math.max(2, Math.round(w / 30)), 4);
  rr(g, x + 3, by, w - 6, 9, 3);
  paint(g, litFill(g, x + 3, by, w - 6, 9, sheet, 0.2), INK, 1.1);
  line(g, x + 6, by + (y + h - by) * 0.55, x + w - 6, by + (y + h - by) * 0.55, alpha(shade(blanket, 0.35), 0.7), 2.4);
  // headboard
  rr(g, x - 2, y - 2, w + 4, 14, 3);
  paint(g, litFill(g, x - 2, y - 2, w + 4, 14, shade(wood, -0.12), 0.3), INK, LW);
  fgrain(g, x - 2, y - 2, w + 4, 14, shade(wood, -0.12), r, 'h', 2);
}

/** Books standing on a shelf seen from above: a row of coloured spines' tops. */
function bookRow(g: G, x: number, y: number, w: number, d: number, r: R) {
  const cols = ['#7a2a22', '#2f4f6f', '#3e5e34', '#6b4a2b', '#5a3a6a', '#a07a2a', '#2b2b30', '#8a5a3a'];
  let xx = x;
  while (xx < x + w - 4) {
    const bw = 3.5 + r() * 5;
    if (r() < 0.08) { xx += bw; continue; }
    const bd = d * (0.65 + r() * 0.35);
    const col = cols[Math.floor(r() * cols.length)];
    g.fillStyle = litFill(g, xx, y, bw, bd, col, 0.25);
    g.fillRect(xx, y + (d - bd), Math.min(bw, x + w - xx), bd);
    g.strokeStyle = alpha(INK, 0.8);
    g.lineWidth = 0.7;
    g.strokeRect(xx, y + (d - bd), Math.min(bw, x + w - xx), bd);
    xx += bw;
  }
}

/** A shelf case seen from above against a wall at the top of its box. */
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
  // top rim boards
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

function basket(g: G, cx: number, cy: number, rad: number, fillCol: string | null, r: R, wicker = '#b48a4e') {
  circle(g, cx, cy, rad);
  paint(g, domeFill(g, cx, cy, rad, wicker, 0.25), INK, LW * 0.8);
  g.save();
  circle(g, cx, cy, rad);
  g.clip();
  for (let i = 0; i < 4; i++) {
    circle(g, cx, cy, rad * (0.55 + i * 0.13));
    stroke(g, alpha(shade(wicker, -0.5), 0.4), 0.9);
  }
  g.restore();
  circle(g, cx, cy, rad * 0.78);
  paint(g, '#3a2816', INK, 1);
  if (fillCol) {
    const n = Math.round(rad / 3);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rad * 0.5;
      fruit(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, rad * 0.24, shade(fillCol, (r() - 0.5) * 0.25));
    }
  }
}

function coinStack(g: G, cx: number, cy: number, rad: number, gold: string) {
  circle(g, cx + 1.5, cy + 2, rad);
  paint(g, shade(gold, -0.45), INK, 1);
  circle(g, cx, cy, rad);
  paint(g, domeFill(g, cx, cy, rad, gold, 0.5), INK, 1);
  circle(g, cx, cy, rad * 0.6);
  stroke(g, alpha(shade(gold, -0.5), 0.6), 0.8);
}

function cards(g: G, cx: number, cy: number, r: R, n = 5) {
  for (let i = 0; i < n; i++) {
    g.save();
    g.translate(cx + (r() - 0.5) * 22, cy + (r() - 0.5) * 16);
    g.rotate((r() - 0.5) * 2);
    rr(g, -4.5, -6.5, 9, 13, 1.4);
    paint(g, r() < 0.3 ? '#7a2420' : '#f2ecdc', INK, 0.9);
    circle(g, 0, 0, 1.8);
    g.fillStyle = r() < 0.5 ? '#a8231e' : '#222';
    g.fill();
    g.restore();
  }
}

function die(g: G, cx: number, cy: number, s: number, rot: number, col = '#efe8d8') {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  rr(g, -s / 2, -s / 2, s, s, s * 0.22);
  paint(g, litFill(g, -s / 2, -s / 2, s, s, col, 0.3), INK, 0.9);
  circle(g, 0, 0, s * 0.12);
  g.fillStyle = '#222';
  g.fill();
  circle(g, -s * 0.25, -s * 0.25, s * 0.1);
  g.fill();
  circle(g, s * 0.25, s * 0.25, s * 0.1);
  g.fill();
  g.restore();
}

/** A striped awning with a scalloped front edge. */
function awning(g: G, x: number, y: number, w: number, h: number, c1: string, c2: string) {
  const n = Math.max(4, Math.round(w / 22));
  const sw = w / n;
  g.save();
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + w, y);
  g.lineTo(x + w, y + h);
  for (let i = n - 1; i >= 0; i--) g.arc(x + i * sw + sw / 2, y + h, sw / 2, 0, Math.PI, false);
  g.closePath();
  g.clip();
  for (let i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? c2 : c1;
    g.fillRect(x + i * sw, y, sw + 0.5, h + sw);
  }
  const gr = g.createLinearGradient(x, y, x, y + h + sw / 2);
  gr.addColorStop(0, 'rgba(255,255,255,0.22)');
  gr.addColorStop(0.5, 'rgba(0,0,0,0)');
  gr.addColorStop(1, 'rgba(0,0,0,0.3)');
  g.fillStyle = gr;
  g.fillRect(x, y, w, h + sw);
  for (let i = 1; i < n; i++) line(g, x + i * sw, y, x + i * sw, y + h + sw / 2, 'rgba(0,0,0,0.18)', 1);
  g.restore();
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + w, y);
  g.lineTo(x + w, y + h);
  for (let i = n - 1; i >= 0; i--) g.arc(x + i * sw + sw / 2, y + h, sw / 2, 0, Math.PI, false);
  g.closePath();
  stroke(g, INK, LW);
}

const SACK = '#b89a6a';
const DRINKS = { wine: '#6e1a26', ale: '#c9922e' };

// ---------------------------------------------------------------- objects

export const FURNISHING_OBJECTS: ObjDef[] = [
  // ============ storage ============
  {
    id: 'crate', name: 'Crate', cat: 'storage', sets: ['dungeon', 'ship', 'town', 'market', 'tavern', 'mine', 'farm'], tags: ['box', 'cargo', 'supplies', 'wooden'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.pine, mark: '#2b2b30' },
    variants: [
      { name: 'Pine', c: {} }, { name: 'Oak', c: { wood: WOOD.oak } }, { name: 'Old dark', c: { wood: '#6e5a44' } },
      { name: 'Marked cargo', c: { mark: '#8e2f25' }, f: { mark: 1 } },
    ],
    desc: 'A nailed wooden crate with a cross brace.',
    draw: ({ g, c, f, seed }) => crateTop(g, 12, 12, 76, 76, c.wood, rng(seed), f.mark ? c.mark : undefined),
  },
  {
    id: 'crate-pile', name: 'Crate pile', cat: 'storage', sets: ['dungeon', 'ship', 'town', 'market', 'mine'], tags: ['boxes', 'cargo', 'stack', 'warehouse', 'cover'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { wood: WOOD.pine, sack: SACK },
    variants: [{ name: 'Pine', c: {} }, { name: 'Oak', c: { wood: WOOD.oak } }, { name: 'Weathered', c: { wood: '#8a7a62' } }],
    desc: 'A stack of crates and a sack: good cover in a warehouse or hold.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      crateTop(g, 6, 104, 92, 88, c.wood, r);
      crateTop(g, 102, 98, 92, 94, shade(c.wood, -0.06), r);
      crateTop(g, 110, 8, 82, 82, shade(c.wood, 0.03), r);
      sackUp(g, 44, 42, 32, c.sack, r);
      shadowRect(g, 54, 58, 84, 84, 3, 0.38);
      crateTop(g, 54, 58, 84, 84, shade(c.wood, 0.12), r, '#2b2b30');
    },
  },
  {
    id: 'sack', name: 'Sack', cat: 'storage', sets: ['farm', 'market', 'ship', 'town', 'tavern', 'camp'], tags: ['bag', 'grain', 'burlap', 'supplies'],
    w: 1, h: 1, c: { cloth: SACK, grain: '#e0c27a' },
    variants: [
      { name: 'Burlap', c: {} }, { name: 'Pale canvas', c: { cloth: '#d6c7a3' } }, { name: 'Dark canvas', c: { cloth: '#7a6a52' } },
      { name: 'Open, spilling', c: {}, f: { open: 1 } },
    ],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.open) {
        blob(g, lumpy(70, 72, 20, 0.5, 9, r));
        paint(g, domeFill(g, 70, 72, 20, c.grain, 0.3), alpha(INK, 0.6), 1);
        speckle(g, 52, 58, 40, 32, r, 30, shade(c.grain, -0.3), 1);
        const pts = lumpy(44, 44, 32, 0.22, 10, r);
        blob(g, pts);
        paint(g, domeFill(g, 44, 44, 32, c.cloth, 0.3), INK, LW);
        ellipse(g, 48, 48, 17, 14);
        paint(g, shade(c.cloth, -0.35), INK, 1.4);
        ellipse(g, 49, 49, 13, 10.5);
        paint(g, domeFill(g, 49, 49, 13, c.grain, 0.35), null);
        speckle(g, 38, 40, 22, 18, r, 14, shade(c.grain, -0.3), 0.8);
        return;
      }
      sackUp(g, 50, 50, 36, c.cloth, r);
    },
  },
  {
    id: 'chest-open', name: 'Open chest', cat: 'treasure', sets: ['dungeon', 'crypt', 'castle', 'ship', 'cave'], tags: ['loot', 'treasure', 'gold', 'coins', 'open'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.brass, lining: '#7a1f2b', gold: '#e9b949' },
    variants: [
      { name: 'Gold hoard', c: {} }, { name: 'Gems and gold', c: {}, f: { gems: 1 } },
      { name: 'Iron-bound, empty', c: { wood: WOOD.oak, metal: METAL.iron, lining: '#3a2e26' }, f: { empty: 1 } },
      { name: 'Scrolls and potions', c: { lining: '#2f4f6f' }, f: { goods: 1 } },
    ],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const x = 12, y = 38, w = 76, h = 50;
      // lid tipped back
      rr(g, x + 2, 8, w - 4, 32, 6);
      paint(g, litFill(g, x, 8, w, 32, shade(c.wood, -0.18)), INK, LW);
      rr(g, x + 9, 13, w - 18, 21, 3);
      paint(g, litFill(g, x + 9, 13, w - 18, 21, c.lining, 0.25), INK, 1);
      strap(g, x + 4, 9, 7, 30, c.metal, false);
      strap(g, x + w - 11, 9, 7, 30, c.metal, false);
      // body
      rr(g, x, y, w, h, 5);
      paint(g, litFill(g, x, y, w, h, c.wood), INK, LW * 1.1);
      rr(g, x + 7, y + 6, w - 14, h - 13, 3);
      paint(g, '#24170e', INK, 1.2);
      g.save();
      rr(g, x + 7, y + 6, w - 14, h - 13, 3);
      g.clip();
      if (f.empty) {
        speckle(g, x + 8, y + 8, w - 16, h - 16, r, 18, 'rgba(180,160,130,0.35)', 1.2);
        line(g, x + 14, y + 20, x + 30, y + 30, 'rgba(220,220,220,0.4)', 0.6);
      } else if (f.goods) {
        scroll(g, x + 10, y + 10, 24, 10, 0.2);
        scroll(g, x + 14, y + 24, 22, 9, -0.15);
        bottle(g, x + 48, y + 16, 6, '#c0392b');
        bottle(g, x + 58, y + 26, 5.5, '#2e86c1');
        bottle(g, x + 44, y + 30, 5, '#58b368');
      } else {
        g.fillStyle = shade(c.gold, -0.35);
        g.fillRect(x + 7, y + 6, w - 14, h - 13);
        coins(g, 50, y + h / 2 - 2, 26, 38, r, c.gold);
        if (f.gems) {
          gem(g, 34, y + 18, 6, '#d6304a');
          gem(g, 60, y + 14, 5, '#2fa3d6');
          gem(g, 52, y + 30, 5.5, '#3fbf6a');
          gem(g, 70, y + 28, 4.5, '#a45ad6');
        }
      }
      g.restore();
      strap(g, x, y + 2, 8, h - 4, c.metal);
      strap(g, x + w - 8, y + 2, 8, h - 4, c.metal);
      rr(g, 44, y + h - 8, 12, 12, 2);
      paint(g, litFill(g, 44, y + h - 8, 12, 12, c.metal, 0.35), INK, 1.1);
      circle(g, 50, y + h - 2, 1.8);
      g.fillStyle = '#111';
      g.fill();
    },
  },
  {
    id: 'treasure-pile', name: 'Treasure pile', cat: 'treasure', sets: ['dungeon', 'cave', 'castle', 'crypt'], tags: ['hoard', 'gold', 'coins', 'loot', 'dragon'],
    w: 1, h: 1, c: { gold: '#e9b949' },
    variants: [
      { name: 'Gold', c: {} }, { name: 'Silver', c: { gold: '#cfd6dc' } }, { name: 'Copper', c: { gold: '#c27c4b' } },
      { name: 'Hoard with crown', c: {}, f: { crown: 1 } },
    ],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const pts = lumpy(50, 52, 40, 0.25, 12, r);
      blob(g, pts);
      paint(g, domeFill(g, 50, 52, 40, shade(c.gold, -0.15), 0.4), INK, LW);
      g.save();
      blob(g, pts);
      g.clip();
      coins(g, 50, 52, 38, 70, r, c.gold);
      g.restore();
      coins(g, 48, 48, 22, 18, r, c.gold);
      gem(g, 30, 40, 5.5, '#d6304a');
      gem(g, 66, 62, 5, '#2fa3d6');
      gem(g, 58, 30, 4.5, '#3fbf6a');
      goblet(g, 36, 66, 8, METAL.gold);
      if (f.crown) {
        circle(g, 58, 48, 13);
        paint(g, domeFill(g, 58, 48, 13, METAL.gold, 0.45), INK, 1.4);
        circle(g, 58, 48, 8.5);
        paint(g, '#7a1f2b', INK, 1);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          circle(g, 58 + Math.cos(a) * 11, 48 + Math.sin(a) * 11, 2.2);
          paint(g, i % 2 ? '#d6304a' : '#f4f1e0', INK, 0.7);
        }
      }
    },
  },

  // ============ tables and seats ============
  {
    id: 'table-long', name: 'Long table', cat: 'furniture', sets: ['tavern', 'castle', 'town', 'dungeon', 'farm'], tags: ['table', 'trestle', 'dining'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, cloth: CLOTH.red },
    variants: [...WV.slice(0, 3), { name: 'With runner', c: {}, f: { runner: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      panel(g, 8, 14, 184, 72, c.wood, r, 'h', 4, 5);
      speckle(g, 14, 20, 172, 60, r, 10, alpha(shade(c.wood, -0.5), 0.35), 1.6);
      if (f.runner) {
        cloth(g, 30, 36, 140, 28, c.cloth, r, 5, 1);
        line(g, 30, 40, 170, 40, alpha(CLOTH.gold, 0.8), 1.4);
        line(g, 30, 60, 170, 60, alpha(CLOTH.gold, 0.8), 1.4);
      }
    },
  },
  {
    id: 'table-round', name: 'Round table', cat: 'furniture', sets: ['tavern', 'town', 'castle', 'wizard'], tags: ['table', 'round'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak }, variants: WV,
    draw: ({ g, c, seed }) => roundPanel(g, 50, 50, 39, c.wood, rng(seed), 4),
  },
  {
    id: 'table-round-large', name: 'Large round table', cat: 'furniture', sets: ['tavern', 'castle', 'town', 'wizard'], tags: ['table', 'round', 'council', 'meeting'],
    w: 2, h: 2, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.silver },
    variants: [...WV.slice(0, 3), { name: 'Set for a meal', c: {}, f: { set: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      roundPanel(g, 100, 100, 84, c.wood, r, 7);
      circle(g, 100, 100, 70);
      stroke(g, alpha(shade(c.wood, -0.5), 0.35), 1.2);
      if (f.set) {
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          plate(g, 100 + Math.cos(a) * 60, 100 + Math.sin(a) * 60, 11, ['#c0703a', '#8aa04a', '#b5482a'][i % 3]);
          goblet(g, 100 + Math.cos(a + 0.3) * 48, 100 + Math.sin(a + 0.3) * 48, 5.5, c.metal);
        }
        candle(g, 92, 96, 6, r);
        candle(g, 108, 104, 6, r);
        loaf(g, 100, 122, 12, 7, 0.3);
      }
    },
  },
  {
    id: 'chair', name: 'Chair', cat: 'furniture', sets: ['tavern', 'town', 'castle', 'wizard', 'dungeon'], tags: ['seat'],
    w: 1, h: 1, c: { wood: WOOD.oak, cushion: CLOTH.red },
    variants: [...WV.slice(0, 3), { name: 'Cushioned', c: { wood: WOOD.walnut }, f: { cushion: 1 } }],
    draw: ({ g, c, f, seed }) => chairAt(g, 50, 52, 66, 0, c.wood, rng(seed), f.cushion ? c.cushion : undefined),
  },
  {
    id: 'stool', name: 'Stool', cat: 'furniture', sets: ['tavern', 'town', 'farm', 'market', 'camp'], tags: ['seat', 'bar stool'],
    w: 1, h: 1, c: { wood: WOOD.oak }, variants: WV.slice(0, 3),
    draw: ({ g, c, seed }) => stoolAt(g, 50, 50, 22, c.wood, rng(seed)),
  },
  {
    id: 'bench', name: 'Bench', cat: 'furniture', sets: ['tavern', 'town', 'temple', 'farm', 'castle'], tags: ['seat', 'pew'],
    w: 2, h: 1, c: { wood: WOOD.oak }, variants: WV.slice(0, 3),
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      box(g, 20, 30, 14, 40, shade(c.wood, -0.3), 2, 1.4);
      box(g, 166, 30, 14, 40, shade(c.wood, -0.3), 2, 1.4);
      panel(g, 8, 34, 184, 32, c.wood, r, 'h', 2, 4);
    },
  },
  {
    id: 'bed', name: 'Bed', cat: 'furniture', sets: ['tavern', 'town', 'castle', 'farm'], tags: ['bed', 'sleep', 'inn', 'bedroom'],
    w: 1, h: 2, blocksMovement: true, c: { wood: WOOD.oak, blanket: CLOTH.red },
    variants: [
      { name: 'Red blanket', c: {} }, { name: 'Blue blanket', c: { blanket: CLOTH.blue } }, { name: 'Green blanket', c: { blanket: CLOTH.green } },
      { name: 'Plain wool', c: { blanket: '#9a8a70', wood: WOOD.pine } },
    ],
    draw: ({ g, c, seed }) => bedAt(g, 12, 10, 76, 180, c.wood, c.blanket, rng(seed)),
  },
  {
    id: 'bedroll', name: 'Bedroll', cat: 'furniture', sets: ['camp', 'forest', 'dungeon', 'cave', 'winter'], tags: ['sleeping', 'camp', 'rest', 'blanket'],
    w: 1, h: 2, flat: true, c: { cloth: CLOTH.green, mat: '#8a7656' },
    variants: [
      { name: 'Green', c: {} }, { name: 'Brown', c: { cloth: CLOTH.brown } }, { name: 'Red', c: { cloth: CLOTH.red } },
      { name: 'Fur pelt', c: { cloth: '#6e5a48', mat: '#8a7a68' }, f: { fur: 1 } },
    ],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.fur) {
        rr(g, 14, 28, 72, 164, 22);
        paint(g, litFill(g, 14, 28, 72, 164, c.cloth, 0.25), INK, LW);
        for (const [x, y] of [[14, 52], [86, 52], [14, 170], [86, 170]]) {
          ellipse(g, x, y, 9, 6, x < 50 ? 0.4 : -0.4);
          paint(g, shade(c.cloth, -0.15), INK, 1.2);
        }
        g.save();
        rr(g, 16, 30, 68, 160, 20);
        g.clip();
        for (let i = 0; i < 40; i++) {
          const x = 18 + r() * 64, y = 34 + r() * 150;
          line(g, x, y, x + (r() - 0.5) * 4, y + 5, alpha(shade(c.cloth, r() < 0.5 ? -0.4 : 0.3), 0.6), 1);
        }
        g.restore();
      } else {
        cloth(g, 18, 34, 64, 156, c.mat, r, 2, 6);
        cloth(g, 22, 52, 56, 134, c.cloth, r, 3, 5);
        rr(g, 22, 52, 56, 12, 4);
        paint(g, litFill(g, 22, 52, 56, 12, shade(c.cloth, 0.25), 0.2), INK, 1.1);
      }
      // rolled head end
      rr(g, 14, 10, 72, 26, 12);
      paint(g, litFill(g, 14, 10, 72, 26, shade(c.cloth, 0.05), 0.3), INK, LW);
      for (const x of [28, 50, 72]) line(g, x, 13, x - 2, 33, alpha(shade(c.cloth, -0.5), 0.5), 1);
      for (const x of [24, 76]) {
        rr(g, x - 2, 8, 4, 30, 1);
        paint(g, '#6e5130', INK, 0.9);
      }
    },
  },
  {
    id: 'bookshelf', name: 'Bookshelf', cat: 'furniture', sets: ['wizard', 'castle', 'town', 'temple', 'tavern'], tags: ['books', 'library', 'shelf', 'study'],
    w: 2, h: 1, blocksMovement: true, blocksSight: true, c: { wood: WOOD.walnut },
    variants: [...WV.slice(0, 3), { name: 'Scroll cubbies', c: { wood: WOOD.oak }, f: { scrolls: 1 } }],
    desc: 'Against a wall: put the top edge of its square on the wall.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      shelfCase(g, 4, 6, 192, 54, c.wood, r, (ix, iy, iw, id) => {
        if (f.scrolls) {
          const n = 8, cw = iw / n;
          for (let i = 0; i < n; i++) {
            const cx = ix + i * cw;
            line(g, cx, iy, cx, iy + id, shade(c.wood, -0.1), 2.4);
            for (let k = 0; k < 4; k++) {
              circle(g, cx + cw * (0.3 + (k % 2) * 0.4), iy + id * (0.28 + Math.floor(k / 2) * 0.42), cw * 0.17);
              paint(g, '#eadbb5', INK, 0.8);
            }
          }
        } else {
          bookRow(g, ix, iy, iw, id, r);
        }
      });
      // a few loose items on the floor in front
      book(g, 40, 70, 18, 12, '#7a2a22', 0.3);
      if (r() < 0.6) scroll(g, 140, 72, 26, 9, -0.2);
    },
  },
  {
    id: 'desk', name: 'Desk', cat: 'furniture', sets: ['wizard', 'castle', 'town', 'temple'], tags: ['writing', 'study', 'office', 'table'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut }, variants: WV,
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 8, 12, 184, 66, c.wood, r, 'h', 3, 4);
      rr(g, 60, 26, 44, 34, 1);
      paint(g, '#eadfc4', INK, 1);
      for (let i = 0; i < 5; i++) line(g, 65, 32 + i * 5.5, 96 - r() * 10, 32 + i * 5.5, 'rgba(50,35,20,0.5)', 0.8);
      circle(g, 120, 30, 6);
      paint(g, domeFill(g, 120, 30, 6, '#2b2b30', 0.4), INK, 1);
      line(g, 118, 30, 108, 54, '#f2ecdc', 1.6);
      line(g, 112, 44, 106, 54, alpha('#dcd4c0', 0.9), 3);
      book(g, 140, 24, 24, 18, '#2f4f6f', 0.12);
      book(g, 144, 46, 22, 16, '#7a2a22', -0.08);
      candle(g, 30, 30, 7, r);
      scroll(g, 20, 52, 30, 11, 0.1);
    },
  },
  {
    id: 'lectern', name: 'Lectern', cat: 'furniture', sets: ['temple', 'wizard', 'castle', 'crypt'], tags: ['book', 'stand', 'pulpit', 'tome'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, page: '#efe6cf', cover: '#7a2a22' },
    variants: [...WV.slice(0, 2), { name: 'Stone', c: { wood: STONE.grey } }, { name: 'Dark tome', c: { wood: WOOD.ebony, cover: '#2b2b30', page: '#d9cfa8' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      circle(g, 50, 58, 24);
      paint(g, domeFill(g, 50, 58, 24, shade(c.wood, -0.25), 0.3), INK, LW);
      poly(g, [[18, 26], [82, 26], [88, 74], [12, 74]]);
      const gr = g.createLinearGradient(0, 26, 0, 74);
      gr.addColorStop(0, shade(c.wood, -0.2));
      gr.addColorStop(1, shade(c.wood, 0.15));
      paint(g, gr, INK, LW);
      fgrain(g, 18, 28, 64, 44, c.wood, r, 'h', 4);
      box(g, 12, 72, 76, 7, shade(c.wood, -0.1), 2, 1.4);
      // open book
      rr(g, 22, 32, 56, 38, 2);
      paint(g, c.cover, INK, 1.2);
      rr(g, 25, 34, 25, 34, 1.5);
      paint(g, litFill(g, 25, 34, 25, 34, c.page, 0.15), INK, 0.9);
      rr(g, 50, 34, 25, 34, 1.5);
      paint(g, litFill(g, 50, 34, 25, 34, c.page, 0.15), INK, 0.9);
      for (let i = 0; i < 6; i++) {
        line(g, 28, 39 + i * 5, 46, 39 + i * 5, 'rgba(50,35,20,0.45)', 0.7);
        line(g, 54, 39 + i * 5, 72, 39 + i * 5, 'rgba(50,35,20,0.45)', 0.7);
      }
      line(g, 62, 30, 62, 76, '#a3312c', 1.6);
    },
  },
  {
    id: 'bar-counter', name: 'Bar counter', cat: 'furniture', sets: ['tavern', 'town'], tags: ['bar', 'counter', 'inn', 'taproom', 'ale'],
    w: 3, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.brass },
    variants: [...WV.slice(0, 3), { name: 'Pewter fittings', c: { metal: METAL.silver } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 4, 20, 292, 60, c.wood, r, 'h', 3, 5);
      rr(g, 4, 70, 292, 8, 3);
      paint(g, litFill(g, 4, 70, 292, 8, c.metal, 0.4), INK, 1.4);
      // ale rings
      for (let i = 0; i < 5; i++) {
        circle(g, 20 + r() * 260, 32 + r() * 30, 6 + r() * 2);
        stroke(g, alpha(shade(c.wood, -0.6), 0.35), 1.2);
      }
      // tap tower
      rr(g, 120, 28, 34, 22, 4);
      paint(g, litFill(g, 120, 28, 34, 22, c.metal, 0.45), INK, 1.4);
      for (const x of [128, 146]) {
        rr(g, x - 2, 44, 4, 12, 1.5);
        paint(g, '#2b2b30', INK, 1);
      }
      mug(g, 40, 44, 8);
      mug(g, 64, 56, 8, '#7d7f84');
      mug(g, 196, 42, 8);
      goblet(g, 232, 50, 6.5, METAL.silver);
      bottle(g, 260, 40, 7, '#2e5e3a');
      cloth(g, 84, 34, 22, 16, '#d6cdb6', r, 2, 3);
      coins(g, 176, 58, 6, 4, r);
    },
  },
  {
    id: 'keg-rack', name: 'Keg rack', cat: 'storage', sets: ['tavern', 'ship', 'town', 'castle'], tags: ['ale', 'beer', 'wine', 'cask', 'barrel', 'cellar'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.iron, rack: WOOD.walnut },
    variants: [{ name: 'Oak kegs', c: {} }, { name: 'Dark kegs', c: { wood: WOOD.walnut, rack: WOOD.ebony } }, { name: 'Pale kegs', c: { wood: WOOD.pine } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      box(g, 4, 14, 192, 12, c.rack, 2, 1.6);
      box(g, 4, 74, 192, 12, c.rack, 2, 1.6);
      for (const kx of [12, 104]) {
        const kw = 84, ky = 6, kh = 84;
        rr(g, kx, ky, kw, kh, 16);
        const gr = g.createLinearGradient(kx, 0, kx + kw, 0);
        gr.addColorStop(0, shade(c.wood, -0.3));
        gr.addColorStop(0.32, shade(c.wood, 0.22));
        gr.addColorStop(1, shade(c.wood, -0.45));
        paint(g, gr, INK, LW);
        g.save();
        rr(g, kx, ky, kw, kh, 16);
        g.clip();
        for (let i = 1; i < 6; i++) line(g, kx + (i * kw) / 6, ky, kx + (i * kw) / 6, ky + kh, alpha(shade(c.wood, -0.6), 0.45), 1);
        for (const hy of [ky + 14, ky + 30, ky + kh - 30, ky + kh - 14]) {
          g.fillStyle = INK;
          g.fillRect(kx, hy - 3.2, kw, 6.4);
          const hg = g.createLinearGradient(kx, 0, kx + kw, 0);
          hg.addColorStop(0, shade(c.metal, -0.2));
          hg.addColorStop(0.32, shade(c.metal, 0.4));
          hg.addColorStop(1, shade(c.metal, -0.4));
          g.fillStyle = hg;
          g.fillRect(kx, hy - 2, kw, 4);
        }
        g.restore();
        rr(g, kx + kw / 2 - 4, ky + kh - 6, 8, 10, 2);
        paint(g, litFill(g, kx + kw / 2 - 4, ky + kh - 6, 8, 10, METAL.brass, 0.4), INK, 1.1);
      }
    },
  },
  {
    id: 'throne', name: 'Throne', cat: 'furniture', sets: ['castle', 'temple', 'dungeon', 'cave'], tags: ['king', 'queen', 'seat', 'royal', 'court'],
    w: 1, h: 1, blocksMovement: true, c: { frame: METAL.gold, cushion: CLOTH.red, gem: '#2fa3d6' },
    variants: [
      { name: 'Gold and red', c: {} }, { name: 'Stone', c: { frame: STONE.grey, cushion: CLOTH.purple, gem: '#d6304a' } },
      { name: 'Dark iron', c: { frame: METAL.black, cushion: '#4a1418', gem: '#b13ad6' } }, { name: 'Wood and green', c: { frame: WOOD.walnut, cushion: CLOTH.green, gem: '#e9b949' } },
    ],
    draw: ({ g, c }) => {
      // arms
      for (const x of [8, 76]) {
        box(g, x, 30, 16, 56, c.frame, 4, LW, 0.3);
        circle(g, x + 8, 82, 7);
        paint(g, domeFill(g, x + 8, 82, 7, c.frame, 0.5), INK, 1.2);
      }
      box(g, 22, 30, 56, 60, shade(c.frame, -0.15), 4, LW, 0.25);
      rr(g, 27, 34, 46, 50, 8);
      paint(g, domeFill(g, 50, 56, 32, c.cushion, 0.35), INK, 1.4);
      for (const [x, y] of [[38, 46], [62, 46], [50, 60], [38, 72], [62, 72]]) {
        circle(g, x, y, 1.6);
        g.fillStyle = shade(c.cushion, -0.5);
        g.fill();
      }
      // tall back
      poly(g, [[10, 30], [10, 12], [24, 4], [50, 0], [76, 4], [90, 12], [90, 30]]);
      paint(g, litFill(g, 10, 0, 80, 30, c.frame, 0.35), INK, LW);
      line(g, 16, 24, 84, 24, alpha(shade(c.frame, -0.5), 0.6), 1.4);
      gem(g, 50, 14, 6.5, c.gem);
      for (const x of [10, 90]) {
        circle(g, x, 18, 6);
        paint(g, domeFill(g, x, 18, 6, c.frame, 0.5), INK, 1.2);
      }
    },
  },
  {
    id: 'weapon-rack', name: 'Weapon rack', cat: 'furniture', sets: ['castle', 'dungeon', 'camp', 'town'], tags: ['armory', 'swords', 'spears', 'guard', 'barracks'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.iron },
    variants: [{ name: 'Iron arms', c: {} }, { name: 'Bronze arms', c: { metal: METAL.bronze } }, { name: 'Ornate', c: { wood: WOOD.ebony, metal: METAL.silver } }, { name: 'Half empty', c: {}, f: { sparse: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      box(g, 4, 10, 14, 76, shade(c.wood, -0.15), 2, 1.6);
      box(g, 182, 10, 14, 76, shade(c.wood, -0.15), 2, 1.6);
      panel(g, 8, 64, 184, 11, c.wood, r, 'h', 1, 2, 1.6);
      const hw = shade(c.wood, -0.1);
      const slots: ((x: number) => void)[] = [
        (x) => sword(g, x, 8, 72, c.metal), (x) => spear(g, x, 4, 86, c.metal, hw), (x) => axe(g, x, 10, 82, c.metal, hw),
        (x) => sword(g, x, 12, 74, c.metal, '#3a2a40'), (x) => mace(g, x, 12, 80, c.metal, hw), (x) => spear(g, x, 6, 86, c.metal, hw), (x) => sword(g, x, 10, 70, c.metal),
      ];
      slots.forEach((fn, i) => { if (!f.sparse || i % 2 === 0) fn(30 + i * 23); });
      panel(g, 8, 24, 184, 11, c.wood, r, 'h', 1, 2, 1.6);
    },
  },
  {
    id: 'cauldron', name: 'Cauldron', cat: 'kitchen', sets: ['wizard', 'swamp', 'camp', 'tavern', 'castle', 'forest'], tags: ['pot', 'witch', 'brew', 'stew', 'potion'],
    w: 1, h: 1, blocksMovement: true, c: { metal: METAL.black, brew: '#7a4a22' },
    variants: [
      { name: 'Stew', c: {} }, { name: 'Witch brew', c: { brew: '#5fcf3a' }, f: { glow: 1 } },
      { name: 'Boiling oil', c: { brew: '#c98a1a' } }, { name: 'Blood red', c: { brew: '#8a1622' } },
    ],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 3; i++) {
        const a = Math.PI / 2 + (i / 3) * Math.PI * 2;
        circle(g, 50 + Math.cos(a) * 38, 50 + Math.sin(a) * 38, 6);
        paint(g, shade(c.metal, -0.1), INK, 1.2);
      }
      circle(g, 50, 50, 40);
      paint(g, domeFill(g, 50, 50, 40, c.metal, 0.35), INK, LW * 1.1);
      g.beginPath();
      g.arc(50, 50, 44, Math.PI * 0.9, Math.PI * 2.1);
      stroke(g, INK, 4.2);
      g.beginPath();
      g.arc(50, 50, 44, Math.PI * 0.9, Math.PI * 2.1);
      stroke(g, shade(c.metal, 0.3), 2);
      circle(g, 50, 50, 31);
      paint(g, shade(c.metal, -0.5), INK, 1.6);
      liquid(g, 50, 50, 28, 28, c.brew, r);
      for (let i = 0; i < 7; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 20;
        circle(g, 50 + Math.cos(a) * d, 50 + Math.sin(a) * d, 1.5 + r() * 3);
        stroke(g, alpha(shade(c.brew, 0.5), 0.8), 1);
      }
      if (f.glow) glow(g, 50, 50, 34, c.brew, 0.5);
    },
  },
  {
    id: 'anvil', name: 'Anvil', cat: 'workshop', sets: ['town', 'castle', 'mine', 'dungeon'], tags: ['smith', 'blacksmith', 'forge', 'metal'],
    w: 1, h: 1, blocksMovement: true, c: { metal: '#5d6166', wood: WOOD.oak },
    variants: [{ name: 'Iron', c: {} }, { name: 'Dark steel', c: { metal: '#3d4146' } }, { name: 'Dwarven bronze', c: { metal: METAL.bronze } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      circle(g, 50, 52, 40);
      paint(g, domeFill(g, 50, 52, 40, c.wood, 0.25), INK, LW);
      for (let i = 1; i < 4; i++) {
        circle(g, 50, 52, i * 9 + r() * 2);
        stroke(g, alpha(shade(c.wood, -0.5), 0.4), 1);
      }
      const pts = [[8, 50], [30, 38], [80, 36], [90, 39], [90, 61], [80, 64], [30, 62]];
      poly(g, pts.map(([x, y]) => [x + 4, y + 5]));
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.fill();
      poly(g, pts);
      paint(g, litFill(g, 8, 36, 82, 28, c.metal, 0.4), INK, LW);
      poly(g, [[16, 50], [32, 43], [78, 42], [84, 44], [84, 56], [78, 58], [32, 57]]);
      paint(g, litFill(g, 16, 42, 70, 16, shade(c.metal, 0.25), 0.3), null);
      rr(g, 72, 46, 6, 6, 1);
      paint(g, '#111', null);
      circle(g, 64, 49, 2);
      paint(g, '#111', null);
      // hammer on the stump
      line(g, 28, 80, 60, 74, INK, 5.5);
      line(g, 28, 80, 60, 74, '#8a6a44', 3.4);
      rr(g, 56, 66, 10, 16, 2);
      paint(g, litFill(g, 56, 66, 10, 16, '#6c6f73', 0.4), INK, 1.2);
    },
  },
  {
    id: 'forge', name: 'Forge', cat: 'workshop', sets: ['town', 'castle', 'mine', 'dungeon'], tags: ['smith', 'blacksmith', 'fire', 'hearth', 'bellows'],
    w: 2, h: 2, blocksMovement: true, light: { bright: 10, dim: 10, color: '#ff8a3a' }, c: { stone: STONE.grey, fire: '#ffb02e', leather: '#6b4428' },
    variants: [{ name: 'Grey stone', c: {} }, { name: 'Red brick', c: { stone: STONE.red } }, { name: 'Dark stone', c: { stone: STONE.dark } }, { name: 'Cold', c: {}, f: { cold: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      // chimney back
      rr(g, 8, 4, 184, 140, 12);
      paint(g, c.stone, INK, LW);
      g.save();
      rr(g, 8, 4, 184, 140, 12);
      g.clip();
      blocks(g, 8, 4, 184, 140, c.stone, r, 26, 16);
      sheen(g, 8, 4, 184, 140, 0.16);
      g.restore();
      rr(g, 8, 4, 184, 140, 12);
      stroke(g, INK, LW);
      rr(g, 56, 8, 88, 26, 4);
      paint(g, litFill(g, 56, 8, 88, 26, shade(c.stone, -0.35), 0.2), INK, 1.6);
      // fire pit
      rr(g, 40, 42, 120, 86, 12);
      paint(g, '#1d1612', INK, LW);
      for (let i = 0; i < 26; i++) {
        const x = 48 + r() * 104, y = 50 + r() * 70;
        circle(g, x, y, 3 + r() * 4);
        paint(g, f.cold ? (r() < 0.5 ? '#3a3330' : '#55504c') : r() < 0.45 ? '#3a2219' : r() < 0.6 ? '#ff7a1a' : '#c2410c', null);
      }
      if (!f.cold) {
        flame(g, 100, 84, 18, r);
        flame(g, 76, 96, 11, r);
        flame(g, 124, 100, 12, r);
      }
      // tongs on the edge
      line(g, 150, 132, 186, 112, INK, 3.6);
      line(g, 150, 132, 186, 112, '#6c6f73', 1.8);
      line(g, 152, 136, 188, 118, INK, 3.6);
      line(g, 152, 136, 188, 118, '#6c6f73', 1.8);
      // bellows
      g.save();
      g.translate(40, 168);
      g.rotate(-0.35);
      poly(g, [[-30, -16], [16, -12], [26, 0], [16, 12], [-30, 16], [-36, 0]]);
      paint(g, litFill(g, -36, -16, 62, 32, c.leather, 0.3), INK, LW);
      for (const x of [-20, -8, 4]) line(g, x, -13, x, 13, alpha(shade(c.leather, -0.5), 0.6), 1.2);
      rr(g, 24, -3, 18, 6, 2);
      paint(g, litFill(g, 24, -3, 18, 6, METAL.brass, 0.4), INK, 1.1);
      g.restore();
      // quench bucket
      circle(g, 160, 170, 22);
      paint(g, domeFill(g, 160, 170, 22, WOOD.oak, 0.25), INK, LW);
      circle(g, 160, 170, 20);
      stroke(g, '#3d4146', 2.4);
      liquid(g, 160, 170, 16, 16, '#3d5a66', r);
    },
  },
  {
    id: 'market-stall', name: 'Market stall', cat: 'furniture', sets: ['market', 'town', 'farm'], tags: ['shop', 'vendor', 'awning', 'merchant', 'booth'],
    w: 2, h: 2, blocksMovement: true, c: { cloth: CLOTH.red, cloth2: '#efe6d2', wood: WOOD.pine, goods: '#c0392b' },
    variants: [
      { name: 'Red and white', c: {} }, { name: 'Blue and white', c: { cloth: CLOTH.blue, goods: '#e09b2d' } },
      { name: 'Green and gold', c: { cloth: CLOTH.green, cloth2: '#d9b44a', goods: '#8aa04a' } }, { name: 'Purple and gold', c: { cloth: CLOTH.purple, cloth2: '#d9b44a', goods: '#7a3a8a' } },
    ],
    desc: 'Counter at the bottom edge faces the customers.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const [x, y] of [[8, 8], [182, 8], [8, 180], [182, 180]]) box(g, x, y, 10, 12, shade(c.wood, -0.3), 2, 1.4);
      panel(g, 6, 128, 188, 56, c.wood, r, 'h', 3, 3);
      basket(g, 34, 154, 18, c.goods, r);
      basket(g, 76, 152, 17, '#e0b23a', r);
      basket(g, 118, 154, 18, '#7aa03a', r);
      cloth(g, 146, 138, 40, 16, CLOTH.blue, r, 2, 3);
      cloth(g, 150, 158, 38, 16, CLOTH.gold, r, 2, 3);
      awning(g, 4, 4, 192, 100, c.cloth, c.cloth2);
    },
  },
  {
    id: 'cart', name: 'Handcart', cat: 'vehicle', sets: ['farm', 'market', 'town', 'mine', 'camp'], tags: ['wagon', 'barrow', 'haul', 'cart'],
    w: 1, h: 2, blocksMovement: true, c: { wood: WOOD.oak, load: '#d9bf6a' },
    variants: [{ name: 'Empty', c: {} }, { name: 'Hay', c: {}, f: { hay: 1 } }, { name: 'Crates', c: {}, f: { crates: 1 } }, { name: 'Sacks', c: {}, f: { sacks: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      // handles
      for (const [x1, x2] of [[26, 20], [74, 80]]) {
        line(g, x1, 130, x2, 194, INK, 6);
        line(g, x1, 130, x2, 194, shade(c.wood, -0.05), 3.6);
      }
      line(g, 21, 186, 79, 186, INK, 5);
      line(g, 21, 186, 79, 186, shade(c.wood, -0.05), 3);
      // wheels
      for (const x of [2, 86]) {
        rr(g, x, 62, 12, 48, 4);
        paint(g, litFill(g, x, 62, 12, 48, shade(c.wood, -0.25), 0.3), INK, LW);
        line(g, x + 6, 64, x + 6, 108, '#5d6166', 2.4);
      }
      panel(g, 14, 10, 72, 128, c.wood, r, 'v', 4, 4);
      rr(g, 14, 10, 72, 128, 4);
      stroke(g, shade(c.wood, -0.35), 5);
      rr(g, 14, 10, 72, 128, 4);
      stroke(g, INK, LW);
      if (f.hay) {
        blob(g, lumpy(50, 74, 30, 0.2, 12, r, 56));
        paint(g, domeFill(g, 50, 70, 56, c.load, 0.3), INK, LW);
        for (let i = 0; i < 36; i++) {
          const x = 26 + r() * 48, y = 24 + r() * 100, a = r() * Math.PI;
          line(g, x, y, x + Math.cos(a) * 8, y + Math.sin(a) * 8, alpha(shade(c.load, r() < 0.5 ? -0.35 : 0.3), 0.8), 1);
        }
      } else if (f.crates) {
        crateTop(g, 20, 18, 60, 52, WOOD.pine, r);
        crateTop(g, 22, 76, 56, 54, shade(WOOD.pine, -0.1), r);
      } else if (f.sacks) {
        sackLying(g, 50, 36, 62, 30, 0.1, SACK, r);
        sackLying(g, 46, 72, 60, 30, -0.1, '#cbb98e', r);
        sackLying(g, 52, 108, 62, 30, 0.05, SACK, r);
      }
    },
  },
  {
    id: 'cage', name: 'Cage', cat: 'furniture', sets: ['dungeon', 'castle', 'camp', 'market', 'cave'], tags: ['prison', 'cell', 'captive', 'animal', 'bars'],
    w: 1, h: 1, blocksMovement: true, c: { metal: METAL.iron },
    variants: [{ name: 'Iron', c: {} }, { name: 'Rusty', c: { metal: METAL.rust } }, { name: 'Gilded', c: { metal: METAL.gold } }, { name: 'Wooden', c: { metal: WOOD.oak } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 10, 10, 80, 80, 3);
      paint(g, '#3a2e22', null);
      for (let i = 0; i < 24; i++) {
        const x = 14 + r() * 72, y = 14 + r() * 72, a = r() * Math.PI;
        line(g, x, y, x + Math.cos(a) * 9, y + Math.sin(a) * 9, alpha('#c9a85a', 0.75), 1.1);
      }
      const bar = (x1: number, y1: number, x2: number, y2: number, wdt: number) => {
        line(g, x1, y1, x2, y2, INK, wdt + 2.2);
        line(g, x1, y1, x2, y2, shade(c.metal, 0.15), wdt);
      };
      for (let i = 1; i < 7; i++) bar(10 + i * (80 / 7), 10, 10 + i * (80 / 7), 90, 2.6);
      bar(10, 50, 90, 50, 3.4);
      rr(g, 10, 10, 80, 80, 3);
      stroke(g, INK, 7.5);
      rr(g, 10, 10, 80, 80, 3);
      g.strokeStyle = litFill(g, 10, 10, 80, 80, c.metal, 0.4);
      g.lineWidth = 4.6;
      g.stroke();
      for (const [x, y] of [[10, 10], [90, 10], [10, 90], [90, 90]]) rivet(g, x, y, 3.6, c.metal);
      circle(g, 50, 50, 6);
      stroke(g, INK, 4);
      circle(g, 50, 50, 6);
      stroke(g, shade(c.metal, 0.25), 2.2);
      rr(g, 86, 40, 8, 20, 2);
      paint(g, litFill(g, 86, 40, 8, 20, c.metal, 0.4), INK, 1.2);
    },
  },
  // ============ bedroom ============
  {
    id: 'wardrobe', name: 'Wardrobe', cat: 'storage', sets: ['castle', 'town', 'tavern', 'wizard'], tags: ['armoire', 'closet', 'cupboard', 'clothes', 'bedroom'],
    w: 2, h: 1, blocksMovement: true, blocksSight: true, c: { wood: WOOD.walnut, metal: METAL.brass },
    variants: [...WV.slice(0, 3), { name: 'Open, clothes', c: {}, f: { open: 1 } }],
    desc: 'Tall armoire against a wall (top edge).',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.open) {
        rr(g, 14, 8, 172, 58, 3);
        paint(g, '#24170e', INK, LW);
        line(g, 20, 34, 180, 34, '#8a8d92', 2.2);
        const cols = ['#a3312c', '#2f5d8a', '#3e6b3a', '#c9b48a', '#5d3a78', '#7a5638', '#2b2b30'];
        for (let i = 0; i < 9; i++) {
          const x = 24 + i * 17.5;
          rr(g, x, 16, 14, 42, 4);
          paint(g, litFill(g, x, 16, 14, 42, cols[i % cols.length], 0.3), INK, 1);
        }
        // doors swung open
        for (const s of [-1, 1]) {
          g.save();
          g.translate(s < 0 ? 14 : 186, 66);
          g.rotate(s < 0 ? 1.15 : Math.PI - 1.15);
          rr(g, 0, -4, 34, 8, 2);
          paint(g, litFill(g, 0, -4, 34, 8, c.wood, 0.3), INK, 1.6);
          g.restore();
        }
        return;
      }
      panel(g, 8, 6, 184, 60, c.wood, r, 'v', 2, 4);
      rr(g, 16, 13, 168, 46, 3);
      stroke(g, alpha(shade(c.wood, -0.55), 0.7), 2);
      rr(g, 8, 62, 184, 10, 2);
      paint(g, litFill(g, 8, 62, 184, 10, shade(c.wood, -0.2), 0.3), INK, 1.6);
      for (const x of [94, 106]) {
        circle(g, x, 67, 2.8);
        paint(g, domeFill(g, x, 67, 2.8, c.metal, 0.5), INK, 0.9);
      }
    },
  },
  {
    id: 'dresser', name: 'Dresser', cat: 'furniture', sets: ['castle', 'town', 'tavern'], tags: ['drawers', 'chest of drawers', 'bedroom', 'vanity'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.brass }, variants: WV,
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 10, 12, 180, 56, c.wood, r, 'h', 2, 4);
      rr(g, 10, 64, 180, 12, 2);
      paint(g, litFill(g, 10, 64, 180, 12, shade(c.wood, -0.18), 0.3), INK, 1.6);
      for (const x of [40, 100, 160]) {
        line(g, x - 30, 64, x - 30, 76, INK, 1);
        rr(g, x - 6, 68, 12, 4, 2);
        paint(g, c.metal, INK, 0.8);
      }
      // a basin, comb and a jewel box on top
      circle(g, 46, 38, 18);
      paint(g, domeFill(g, 46, 38, 18, '#d9d2c3', 0.25), INK, 1.4);
      liquid(g, 46, 38, 12, 12, '#7aa6b8', r);
      rr(g, 120, 24, 30, 22, 3);
      paint(g, litFill(g, 120, 24, 30, 22, '#7a2a22', 0.3), INK, 1.2);
      line(g, 120, 33, 150, 33, c.metal, 1.6);
      gem(g, 135, 29, 3, '#2fa3d6');
      bottle(g, 164, 30, 5, '#a45ad6');
      bottle(g, 174, 44, 4, '#d6a04a');
      rr(g, 80, 46, 22, 6, 2);
      paint(g, '#c9b48a', INK, 0.9);
    },
  },
  {
    id: 'nightstand', name: 'Nightstand', cat: 'furniture', sets: ['castle', 'town', 'tavern'], tags: ['bedside', 'side table', 'bedroom'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak }, variants: WV.slice(0, 3),
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 20, 20, 60, 60, c.wood, r, 'h', 2, 4);
      candle(g, 38, 38, 7, r);
      book(g, 48, 50, 22, 16, '#2f4f6f', 0.3);
    },
  },
  {
    id: 'bed-double', name: 'Double bed', cat: 'furniture', sets: ['castle', 'town', 'tavern'], tags: ['bed', 'bedroom', 'inn', 'master'],
    w: 2, h: 2, blocksMovement: true, c: { wood: WOOD.walnut, blanket: CLOTH.blue },
    variants: [{ name: 'Blue', c: {} }, { name: 'Red', c: { blanket: CLOTH.red } }, { name: 'Green', c: { blanket: CLOTH.green, wood: WOOD.oak } }, { name: 'Purple', c: { blanket: CLOTH.purple } }],
    draw: ({ g, c, seed }) => bedAt(g, 14, 12, 172, 178, c.wood, c.blanket, rng(seed), 2),
  },
  {
    id: 'bed-four-poster', name: 'Four-poster bed', cat: 'furniture', sets: ['castle', 'town'], tags: ['bed', 'noble', 'royal', 'bedroom', 'canopy'],
    w: 2, h: 2, blocksMovement: true, c: { wood: WOOD.walnut, blanket: CLOTH.red, drape: CLOTH.gold },
    variants: [
      { name: 'Red and gold', c: {} }, { name: 'Blue and silver', c: { blanket: CLOTH.blue, drape: '#c9ced3' } },
      { name: 'Green and gold', c: { blanket: CLOTH.green } }, { name: 'Black and purple', c: { wood: WOOD.ebony, blanket: CLOTH.purple, drape: '#2b2b30' } },
    ],
    desc: 'Pair with the bed canopy (overhead) to roof it over.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      bedAt(g, 16, 14, 168, 174, c.wood, c.blanket, r, 2);
      for (const [x, y] of [[16, 14], [184, 14], [16, 188], [184, 188]]) {
        // tied-back drapes
        ellipse(g, x + (x < 100 ? 7 : -7), y + (y < 100 ? 12 : -12), 9, 15, x < 100 === y < 100 ? -0.5 : 0.5);
        paint(g, domeFill(g, x, y, 15, c.drape, 0.35), INK, 1.2);
        circle(g, x, y, 8.5);
        paint(g, domeFill(g, x, y, 8.5, c.wood, 0.45), INK, 1.6);
      }
    },
  },
  {
    id: 'bed-canopy', name: 'Bed canopy', cat: 'decor', sets: ['castle', 'town'], tags: ['canopy', 'four-poster', 'roof', 'drapes', 'overhead'],
    w: 2, h: 2, layer: 'overhead', c: { drape: CLOTH.red, trim: CLOTH.gold, wood: WOOD.walnut },
    variants: [{ name: 'Red', c: {} }, { name: 'Blue', c: { drape: CLOTH.blue, trim: '#c9ced3' } }, { name: 'Green', c: { drape: CLOTH.green } }, { name: 'Purple', c: { drape: CLOTH.purple, wood: WOOD.ebony } }],
    desc: 'Overhead canopy that sits on a four-poster bed.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      cloth(g, 12, 10, 176, 182, c.drape, r, 6, 6);
      g.save();
      rr(g, 12, 10, 176, 182, 6);
      g.clip();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        line(g, 100, 100, 100 + Math.cos(a) * 140, 100 + Math.sin(a) * 140, alpha(shade(c.drape, -0.5), 0.35), 3);
      }
      g.restore();
      rr(g, 12, 10, 176, 182, 6);
      stroke(g, c.trim, 4);
      rr(g, 12, 10, 176, 182, 6);
      stroke(g, INK, 1.2);
      circle(g, 100, 100, 10);
      paint(g, domeFill(g, 100, 100, 10, c.trim, 0.5), INK, 1.2);
      for (const [x, y] of [[14, 12], [186, 12], [14, 190], [186, 190]]) {
        circle(g, x, y, 7);
        paint(g, domeFill(g, x, y, 7, c.wood, 0.5), INK, 1.4);
      }
    },
  },
  {
    id: 'bunk-bed', name: 'Bunk bed', cat: 'furniture', sets: ['ship', 'castle', 'camp', 'town', 'tavern'], tags: ['bed', 'barracks', 'crew', 'dorm'],
    w: 1, h: 2, blocksMovement: true, c: { wood: WOOD.pine, blanket: '#8a7a5e' },
    variants: [{ name: 'Wool', c: {} }, { name: 'Red', c: { blanket: CLOTH.red, wood: WOOD.oak } }, { name: 'Blue', c: { blanket: CLOTH.blue } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      bedAt(g, 14, 12, 72, 178, c.wood, c.blanket, r);
      for (const [x, y] of [[14, 12], [86, 12], [14, 190], [86, 190]]) {
        rr(g, x - 6, y - 6, 12, 12, 2);
        paint(g, litFill(g, x - 6, y - 6, 12, 12, shade(c.wood, -0.15), 0.3), INK, 1.4);
      }
      // ladder on the side
      for (const x of [88, 96]) line(g, x, 70, x, 150, INK, 3.4);
      for (const x of [88, 96]) line(g, x, 70, x, 150, shade(c.wood, 0.1), 2);
      for (let y = 78; y < 150; y += 14) line(g, 88, y, 96, y, shade(c.wood, -0.2), 2.4);
      line(g, 14, 96, 86, 96, alpha(INK, 0.5), 1.4);
    },
  },
  {
    id: 'crib', name: 'Crib', cat: 'furniture', sets: ['town', 'castle', 'farm'], tags: ['cradle', 'baby', 'nursery'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.pine, blanket: '#9bb7d4' },
    variants: [{ name: 'Pine', c: {} }, { name: 'Oak', c: { wood: WOOD.oak, blanket: '#d9a3b5' } }, { name: 'Painted', c: { wood: '#7a8f6a', blanket: '#e6e0d2' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 16, 10, 68, 80, 8);
      paint(g, '#ebe4d2', INK, LW);
      cloth(g, 20, 40, 60, 46, c.blanket, r, 2, 6);
      rr(g, 28, 16, 44, 18, 7);
      paint(g, domeFill(g, 50, 25, 22, '#f4efe2', 0.25), INK, 1);
      circle(g, 64, 58, 6);
      paint(g, domeFill(g, 64, 58, 6, '#b48a4e', 0.4), INK, 1);
      rr(g, 16, 10, 68, 80, 8);
      stroke(g, INK, 6.4);
      rr(g, 16, 10, 68, 80, 8);
      stroke(g, c.wood, 4);
      for (let i = 1; i < 6; i++) {
        circle(g, 16 + i * 11.3, 10, 1.6);
        paint(g, shade(c.wood, -0.4), null);
        circle(g, 16 + i * 11.3, 90, 1.6);
        paint(g, shade(c.wood, -0.4), null);
      }
    },
  },
  {
    id: 'footlocker', name: 'Footlocker', cat: 'storage', sets: ['castle', 'camp', 'ship', 'town'], tags: ['chest', 'box', 'barracks', 'trunk', 'soldier'],
    w: 1, h: 1, blocksMovement: true, c: { wood: '#5f6b4e', metal: METAL.iron },
    variants: [{ name: 'Army green', c: {} }, { name: 'Oak', c: { wood: WOOD.oak } }, { name: 'Red painted', c: { wood: '#7a2a22', metal: METAL.brass } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 12, 28, 76, 44, c.wood, r, 'h', 2, 3);
      for (const x of [12, 80]) strap(g, x, 28, 8, 44, c.metal);
      for (const x of [6, 88]) {
        rr(g, x, 44, 6, 12, 2);
        paint(g, c.metal, INK, 1.1);
      }
      rr(g, 45, 64, 10, 10, 2);
      paint(g, litFill(g, 45, 64, 10, 10, c.metal, 0.4), INK, 1.1);
    },
  },
  {
    id: 'trunk', name: 'Travel trunk', cat: 'storage', sets: ['ship', 'tavern', 'town', 'castle', 'camp'], tags: ['chest', 'luggage', 'clothes', 'steamer'],
    w: 2, h: 1, blocksMovement: true, c: { wood: '#6b4428', leather: '#8a5a32', metal: METAL.brass },
    variants: [{ name: 'Leather', c: {} }, { name: 'Black', c: { leather: '#2b2b30', wood: '#3a3030' } }, { name: 'Red', c: { leather: '#7a2420' } }, { name: 'Open, clothes', c: {}, f: { open: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.open) {
        rr(g, 20, 4, 160, 22, 5);
        paint(g, litFill(g, 20, 4, 160, 22, shade(c.leather, -0.2), 0.3), INK, LW);
        rr(g, 16, 26, 168, 64, 5);
        paint(g, litFill(g, 16, 26, 168, 64, c.leather, 0.2), INK, LW);
        rr(g, 23, 32, 154, 52, 3);
        paint(g, '#2a1c12', INK, 1.2);
        cloth(g, 28, 36, 50, 44, CLOTH.blue, r, 3, 4);
        cloth(g, 72, 40, 54, 38, CLOTH.white, r, 3, 4);
        cloth(g, 120, 36, 52, 44, CLOTH.red, r, 3, 4);
        book(g, 132, 50, 20, 14, '#3e5e34', 0.2);
        return;
      }
      rr(g, 16, 18, 168, 64, 8);
      const gr = g.createLinearGradient(0, 18, 0, 82);
      gr.addColorStop(0, shade(c.leather, 0.25));
      gr.addColorStop(0.5, c.leather);
      gr.addColorStop(1, shade(c.leather, -0.4));
      paint(g, gr, INK, LW);
      for (const x of [44, 148]) strap(g, x, 18, 10, 64, shade(c.leather, -0.35), false);
      for (const x of [44, 148]) {
        rr(g, x - 1, 70, 12, 8, 1.5);
        paint(g, c.metal, INK, 1);
      }
      for (const [x, y] of [[16, 18], [172, 18], [16, 70], [172, 70]]) {
        rr(g, x, y, 12, 12, 3);
        paint(g, litFill(g, x, y, 12, 12, c.metal, 0.4), INK, 1.1);
      }
      rr(g, 93, 70, 14, 12, 2);
      paint(g, litFill(g, 93, 70, 14, 12, c.metal, 0.4), INK, 1.1);
    },
  },
  {
    id: 'hammock', name: 'Hammock', cat: 'furniture', sets: ['ship', 'camp', 'forest'], tags: ['bed', 'sleep', 'crew', 'sailor'],
    w: 1, h: 2, c: { cloth: '#d6c7a3' },
    variants: [{ name: 'Canvas', c: {} }, { name: 'Striped', c: { cloth: '#b5543a' }, f: { stripe: 1 } }, { name: 'Netting', c: { cloth: '#c9b48a' }, f: { net: 1 } }],
    draw: ({ g, c, f }) => {
      for (const y of [6, 194]) {
        circle(g, 50, y, 4);
        paint(g, '#6c6f73', INK, 1.2);
      }
      for (const dx of [-20, -8, 8, 20]) {
        line(g, 50, 8, 50 + dx, 40, '#8a6a3a', 1.2);
        line(g, 50, 192, 50 + dx, 160, '#8a6a3a', 1.2);
      }
      g.beginPath();
      g.moveTo(30, 40);
      g.quadraticCurveTo(14, 100, 30, 160);
      g.lineTo(70, 160);
      g.quadraticCurveTo(86, 100, 70, 40);
      g.closePath();
      const gr = g.createLinearGradient(14, 0, 86, 0);
      gr.addColorStop(0, shade(c.cloth, 0.15));
      gr.addColorStop(0.5, shade(c.cloth, -0.25));
      gr.addColorStop(1, shade(c.cloth, -0.05));
      paint(g, gr, INK, LW);
      g.save();
      g.clip();
      if (f.stripe) for (let x = 20; x < 86; x += 14) { g.fillStyle = alpha('#efe6d2', 0.8); g.fillRect(x, 40, 6, 120); }
      if (f.net) {
        for (let k = -120; k < 120; k += 10) {
          line(g, 14 + k, 40, 86 + k, 160, alpha(INK, 0.4), 0.8);
          line(g, 86 - k, 40, 14 - k, 160, alpha(INK, 0.4), 0.8);
        }
      }
      g.restore();
    },
  },

  // ============ treasure ============
  {
    id: 'strongbox', name: 'Strongbox', cat: 'treasure', sets: ['castle', 'town', 'ship', 'dungeon', 'market'], tags: ['lockbox', 'money', 'payroll', 'locked', 'iron'],
    w: 1, h: 1, blocksMovement: true, c: { metal: '#4e5257', lock: METAL.brass },
    variants: [{ name: 'Iron', c: {} }, { name: 'Black and gold', c: { metal: METAL.black, lock: METAL.gold } }, { name: 'Rusty', c: { metal: METAL.rust, lock: METAL.iron } }],
    draw: ({ g, c }) => {
      box(g, 22, 30, 56, 42, c.metal, 4, LW, 0.35);
      for (const x of [22, 70]) strap(g, x, 30, 8, 42, shade(c.metal, -0.15));
      for (const y of [33, 69]) for (let x = 34; x <= 66; x += 8) rivet(g, x, y, 1.6, c.metal);
      rr(g, 42, 42, 16, 22, 3);
      paint(g, litFill(g, 42, 42, 16, 22, c.lock, 0.4), INK, 1.3);
      circle(g, 50, 50, 2.4);
      paint(g, '#111', null);
      rr(g, 49, 51, 2, 6, 0.5);
      paint(g, '#111', null);
      rr(g, 40, 22, 20, 8, 3);
      paint(g, litFill(g, 40, 22, 20, 8, c.metal, 0.4), INK, 1.2);
    },
  },
  {
    id: 'coffer', name: 'Jewel coffer', cat: 'treasure', sets: ['castle', 'crypt', 'temple', 'dungeon'], tags: ['jewels', 'casket', 'jewellery', 'box', 'gems'],
    w: 1, h: 1, c: { wood: '#5a2a3a', metal: METAL.gold },
    variants: [{ name: 'Velvet and gold', c: {} }, { name: 'Ebony and silver', c: { wood: WOOD.ebony, metal: METAL.silver } }, { name: 'Ivory', c: { wood: '#e6dcc6', metal: METAL.gold } }, { name: 'Open, jewels', c: {}, f: { open: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.open) {
        rr(g, 26, 22, 48, 14, 4);
        paint(g, litFill(g, 26, 22, 48, 14, shade(c.wood, -0.15), 0.3), INK, 1.6);
        box(g, 24, 36, 52, 38, c.wood, 4, LW, 0.3);
        rr(g, 29, 40, 42, 30, 2);
        paint(g, '#4a1420', INK, 1);
        g.save();
        rr(g, 29, 40, 42, 30, 2);
        g.clip();
        g.beginPath();
        g.arc(40, 52, 9, 0, Math.PI);
        stroke(g, METAL.gold, 1.6);
        gem(g, 40, 61, 4, '#d6304a');
        gem(g, 58, 48, 4.5, '#2fa3d6');
        gem(g, 62, 62, 3.5, '#3fbf6a');
        circle(g, 50, 56, 4);
        stroke(g, METAL.silver, 1.6);
        coins(g, 52, 64, 6, 4, r);
        g.restore();
        return;
      }
      box(g, 24, 30, 52, 40, c.wood, 6, LW, 0.35);
      rr(g, 28, 34, 44, 32, 4);
      stroke(g, c.metal, 2.2);
      gem(g, 50, 50, 7, '#d6304a');
      for (const [x, y] of [[33, 39], [67, 39], [33, 61], [67, 61]]) gem(g, x, y, 2.8, '#2fa3d6');
      for (const [x, y] of [[24, 30], [76, 30], [24, 70], [76, 70]]) rivet(g, x, y, 3.6, c.metal);
    },
  },
  {
    id: 'safe', name: 'Vault safe', cat: 'treasure', sets: ['castle', 'town', 'market', 'dungeon'], tags: ['vault', 'bank', 'locked', 'heist', 'iron'],
    w: 1, h: 1, blocksMovement: true, c: { metal: '#4e5257', trim: METAL.brass },
    variants: [{ name: 'Iron', c: {} }, { name: 'Black and gold', c: { metal: '#2c2f33', trim: METAL.gold } }, { name: 'Dwarven green', c: { metal: '#3f5a4a', trim: METAL.bronze } }],
    draw: ({ g, c }) => {
      box(g, 10, 10, 80, 80, c.metal, 6, LW * 1.1, 0.35);
      rr(g, 18, 18, 64, 64, 4);
      stroke(g, alpha(shade(c.metal, -0.6), 0.9), 2);
      bevel(g, 18, 18, 64, 64, 4, 0.3);
      circle(g, 50, 50, 16);
      paint(g, domeFill(g, 50, 50, 16, c.trim, 0.45), INK, 1.6);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        line(g, 50 + Math.cos(a) * 11, 50 + Math.sin(a) * 11, 50 + Math.cos(a) * 15, 50 + Math.sin(a) * 15, alpha(INK, 0.7), 1);
      }
      circle(g, 50, 50, 5);
      paint(g, shade(c.trim, -0.3), INK, 1);
      for (const [x, y] of [[16, 16], [84, 16], [16, 84], [84, 84]]) rivet(g, x, y, 3, c.metal);
      for (const y of [30, 70]) {
        rr(g, 82, y - 6, 8, 12, 2);
        paint(g, litFill(g, 82, y - 6, 8, 12, shade(c.metal, 0.2), 0.4), INK, 1.1);
      }
    },
  },
  {
    id: 'loot-sacks', name: 'Loot sacks', cat: 'treasure', sets: ['dungeon', 'cave', 'camp', 'ship'], tags: ['coins', 'purse', 'bags', 'gold', 'bandit'],
    w: 1, h: 1, c: { cloth: '#8a6a44', gold: '#e9b949' },
    variants: [{ name: 'Leather', c: {} }, { name: 'Burlap', c: { cloth: SACK } }, { name: 'Red velvet', c: { cloth: '#7a1f2b' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      coins(g, 62, 72, 16, 16, r, c.gold);
      sackUp(g, 34, 34, 22, c.cloth, r);
      sackUp(g, 68, 40, 18, shade(c.cloth, 0.1), r);
      sackUp(g, 40, 70, 17, shade(c.cloth, -0.1), r);
      coinStack(g, 72, 72, 5, c.gold);
    },
  },
  {
    id: 'coins-small', name: 'Scattered coins', cat: 'treasure', sets: ['dungeon', 'cave', 'crypt', 'tavern', 'castle'], tags: ['gold', 'coins', 'loot', 'money'],
    w: 1, h: 1, flat: true, c: { gold: '#e9b949' },
    variants: [{ name: 'Gold', c: {} }, { name: 'Silver', c: { gold: '#cfd6dc' } }, { name: 'Copper', c: { gold: '#c27c4b' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      coins(g, 46, 54, 30, 22, r, c.gold);
      coinStack(g, 64, 38, 7, c.gold);
      coinStack(g, 62, 33, 7, c.gold);
      coinStack(g, 32, 44, 6, c.gold);
    },
  },
  {
    id: 'coins-large', name: 'Gold hoard', cat: 'treasure', sets: ['cave', 'dungeon', 'castle', 'crypt'], tags: ['hoard', 'dragon', 'treasure', 'gold', 'coins', 'loot'],
    w: 2, h: 2, difficult: true, c: { gold: '#e9b949' },
    variants: [{ name: 'Gold', c: {} }, { name: 'Silver', c: { gold: '#cfd6dc' } }, { name: 'Mixed with arms', c: {}, f: { arms: 1 } }],
    desc: 'A great heap of coin, deep enough to wade through.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const pts = lumpy(100, 104, 86, 0.22, 16, r, 80);
      blob(g, pts);
      paint(g, domeFill(g, 100, 100, 86, shade(c.gold, -0.18), 0.4), INK, LW);
      g.save();
      blob(g, pts);
      g.clip();
      coins(g, 100, 104, 84, 120, r, c.gold);
      g.restore();
      coins(g, 96, 96, 44, 40, r, c.gold);
      if (f.arms) {
        sword(g, 140, 40, 120, METAL.silver, '#5a2a3a');
        circle(g, 58, 132, 20);
        paint(g, domeFill(g, 58, 132, 20, '#7a2a22', 0.35), INK, LW);
        circle(g, 58, 132, 20);
        stroke(g, METAL.gold, 3);
        rivet(g, 58, 132, 5, METAL.gold);
      }
      goblet(g, 70, 70, 9, METAL.gold);
      goblet(g, 130, 140, 8, METAL.silver);
      for (const [x, y, col] of [[110, 70, '#d6304a'], [80, 110, '#2fa3d6'], [134, 104, '#3fbf6a'], [100, 140, '#a45ad6'], [60, 94, '#e9e2a0']] as [number, number, string][]) gem(g, x, y, 5.5, col);
      circle(g, 112, 108, 12);
      paint(g, domeFill(g, 112, 108, 12, METAL.gold, 0.45), INK, 1.4);
      circle(g, 112, 108, 7.5);
      paint(g, '#7a1f2b', INK, 1);
    },
  },
  {
    id: 'gem-bowl', name: 'Bowl of gems', cat: 'treasure', sets: ['castle', 'wizard', 'temple', 'dungeon', 'cave'], tags: ['gems', 'jewels', 'offering', 'diamonds', 'rubies'],
    w: 1, h: 1, c: { metal: METAL.gold },
    variants: [{ name: 'Gold bowl', c: {} }, { name: 'Silver bowl', c: { metal: METAL.silver } }, { name: 'Stone bowl', c: { metal: STONE.grey } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      circle(g, 50, 50, 34);
      paint(g, domeFill(g, 50, 50, 34, c.metal, 0.45), INK, LW);
      circle(g, 50, 50, 27);
      paint(g, shade(c.metal, -0.4), INK, 1.2);
      const cols = ['#d6304a', '#2fa3d6', '#3fbf6a', '#a45ad6', '#e9d24a', '#f4f1f8'];
      for (let i = 0; i < 16; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 18;
        gem(g, 50 + Math.cos(a) * d, 50 + Math.sin(a) * d, 4 + r() * 2.5, cols[i % cols.length]);
      }
    },
  },
  {
    id: 'crown-cushion', name: 'Crown on cushion', cat: 'treasure', sets: ['castle', 'temple', 'crypt'], tags: ['crown', 'regalia', 'king', 'royal', 'relic'],
    w: 1, h: 1, c: { cushion: CLOTH.red, metal: METAL.gold },
    variants: [{ name: 'Gold on red', c: {} }, { name: 'Silver on blue', c: { cushion: CLOTH.blue, metal: METAL.silver } }, { name: 'Gold on purple', c: { cushion: CLOTH.purple } }],
    draw: ({ g, c }) => {
      for (const [x, y] of [[16, 16], [84, 16], [16, 84], [84, 84]]) {
        const dx = x < 50 ? -1 : 1, dy = y < 50 ? -1 : 1;
        poly(g, [[x + dx * 2, y - dy * 3], [x + dx * 11, y + dy * 9], [x + dx * 3, y + dy * 3], [x + dx * 9, y + dy * 11], [x - dx * 3, y + dy * 2]]);
        paint(g, METAL.gold, INK, 0.9);
      }
      rr(g, 16, 16, 68, 68, 14);
      paint(g, domeFill(g, 50, 50, 46, c.cushion, 0.4), INK, LW);
      line(g, 22, 22, 78, 78, alpha(shade(c.cushion, -0.5), 0.3), 2);
      line(g, 78, 22, 22, 78, alpha(shade(c.cushion, -0.5), 0.3), 2);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        poly(g, [[50 + Math.cos(a - 0.2) * 18, 50 + Math.sin(a - 0.2) * 18], [50 + Math.cos(a) * 27, 50 + Math.sin(a) * 27], [50 + Math.cos(a + 0.2) * 18, 50 + Math.sin(a + 0.2) * 18]]);
        paint(g, litFill(g, 30, 30, 40, 40, c.metal, 0.4), INK, 1);
        circle(g, 50 + Math.cos(a) * 26, 50 + Math.sin(a) * 26, 2.4);
        paint(g, '#f4f1e0', INK, 0.7);
      }
      circle(g, 50, 50, 19);
      stroke(g, INK, 7.5);
      circle(g, 50, 50, 19);
      stroke(g, c.metal, 5);
      circle(g, 50, 50, 15.5);
      paint(g, alpha('#7a1f2b', 0.85), null);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        gem(g, 50 + Math.cos(a) * 19, 50 + Math.sin(a) * 19, 3.2, i % 2 ? '#2fa3d6' : '#d6304a');
      }
    },
  },

  // ============ dressed tables ============
  {
    id: 'table-feast', name: 'Feast table', cat: 'furniture', sets: ['castle', 'tavern', 'town'], tags: ['banquet', 'feast', 'dining', 'hall', 'food', 'dressed table'],
    w: 3, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.silver, cloth: CLOTH.white },
    variants: [{ name: 'Oak', c: {} }, { name: 'Walnut, gold plate', c: { wood: WOOD.walnut, metal: METAL.gold } }, { name: 'With red cloth', c: { cloth: CLOTH.red }, f: { cloth: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      panel(g, 4, 12, 292, 76, c.wood, r, 'h', 4, 5);
      if (f.cloth) cloth(g, 4, 30, 292, 40, c.cloth, r, 8, 2);
      for (let i = 0; i < 5; i++) {
        const x = 30 + i * 60;
        if (x > 120 && x < 180) continue;
        plate(g, x, 26, 9, ['#c0703a', '#8aa04a', '#b5482a'][i % 3]);
        plate(g, x + 8, 74, 9, ['#8aa04a', '#c0703a', '#b5482a'][i % 3]);
        goblet(g, x + 16, 28, 5, c.metal);
        goblet(g, x - 8, 72, 5, c.metal, DRINKS.ale);
      }
      // roast on a platter
      ellipse(g, 150, 50, 30, 20);
      paint(g, domeFill(g, 150, 50, 30, c.metal, 0.4), INK, 1.4);
      for (const [dx, dy] of [[-16, -10], [-16, 10]]) {
        ellipse(g, 150 + dx, 50 + dy, 8, 4.5, dy < 0 ? 0.5 : -0.5);
        paint(g, domeFill(g, 150 + dx, 50 + dy, 8, '#9a5424', 0.4), INK, 1);
      }
      ellipse(g, 154, 50, 18, 13);
      paint(g, domeFill(g, 154, 50, 18, '#a65d26', 0.45), INK, 1.3);
      fruit(g, 132, 36, 3, '#3e8a3a');
      fruit(g, 170, 64, 3, '#c0392b');
      loaf(g, 100, 50, 11, 6, 0.2);
      loaf(g, 202, 48, 11, 6, -0.3);
      candle(g, 118, 50, 5, r);
      candle(g, 184, 50, 5, r);
      basket(g, 250, 50, 12, '#c0392b', r);
      bottle(g, 60, 50, 6, '#2e5e3a');
    },
  },
  {
    id: 'table-cards', name: 'Card table', cat: 'furniture', sets: ['tavern', 'town', 'ship', 'camp'], tags: ['gambling', 'dice', 'cards', 'game', 'dressed table'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak, felt: '#2f5a3a' },
    variants: [{ name: 'Bare oak', c: {} }, { name: 'Green felt', c: {}, f: { felt: 1 } }, { name: 'Walnut', c: { wood: WOOD.walnut } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      roundPanel(g, 50, 50, 40, c.wood, r, 4);
      if (f.felt) {
        circle(g, 50, 50, 33);
        paint(g, domeFill(g, 50, 50, 33, c.felt, 0.2), INK, 1.2);
      }
      cards(g, 50, 46, r, 6);
      die(g, 36, 62, 7, 0.4);
      die(g, 44, 66, 7, -0.3);
      coins(g, 64, 64, 6, 6, r);
      mug(g, 24, 36, 6.5);
      mug(g, 74, 30, 6.5, '#7d7f84');
    },
  },
  {
    id: 'table-maps', name: 'Map table', cat: 'furniture', sets: ['castle', 'ship', 'camp', 'wizard', 'town'], tags: ['war table', 'planning', 'chart', 'navigation', 'dressed table'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, paper: '#e4d3a8' },
    variants: [{ name: 'Walnut', c: {} }, { name: 'Oak', c: { wood: WOOD.oak } }, { name: 'Sea chart', c: { paper: '#d9d0b0' }, f: { sea: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      panel(g, 6, 10, 188, 80, c.wood, r, 'h', 4, 5);
      g.save();
      g.translate(100, 50);
      g.rotate(-0.05);
      rr(g, -64, -30, 128, 60, 2);
      paint(g, litFill(g, -64, -30, 128, 60, c.paper, 0.15), INK, 1.4);
      g.save();
      rr(g, -64, -30, 128, 60, 2);
      g.clip();
      if (f.sea) {
        g.fillStyle = alpha('#6f9cb0', 0.45);
        g.fillRect(-64, -30, 128, 60);
      }
      blob(g, lumpy(-20, 2, 34, 0.4, 12, r, 20));
      paint(g, f.sea ? alpha('#e4d3a8', 1) : alpha('#b7c48a', 0.6), alpha('#5a3d24', 0.9), 1.2);
      blob(g, lumpy(36, -12, 14, 0.5, 8, r, 9));
      paint(g, f.sea ? '#e4d3a8' : alpha('#b7c48a', 0.6), alpha('#5a3d24', 0.9), 1.1);
      g.setLineDash([2.5, 2.5]);
      g.beginPath();
      g.moveTo(-40, 14);
      g.quadraticCurveTo(0, -20, 34, -10);
      stroke(g, '#7a2420', 1.2);
      g.setLineDash([]);
      line(g, 30, -14, 38, -6, '#a8231e', 2);
      line(g, 38, -14, 30, -6, '#a8231e', 2);
      g.restore();
      // compass rose
      poly(g, [[50, 10], [53, 18], [50, 26], [47, 18]]);
      paint(g, alpha('#5a3d24', 0.8), null);
      poly(g, [[42, 18], [50, 15], [58, 18], [50, 21]]);
      paint(g, alpha('#5a3d24', 0.6), null);
      g.restore();
      // weights: dagger, candle, compass
      sword(g, 30, 20, 60, METAL.silver);
      candle(g, 176, 24, 6, r);
      circle(g, 172, 72, 7);
      paint(g, domeFill(g, 172, 72, 7, METAL.brass, 0.45), INK, 1.1);
      book(g, 160, 40, 18, 14, '#2f4f6f', 0.2);
    },
  },
  {
    id: 'dining-set', name: 'Dining set', cat: 'furniture', sets: ['tavern', 'castle', 'town'], tags: ['table', 'chairs', 'dining', 'meal', 'dressed table'],
    w: 3, h: 2, blocksMovement: true, c: { wood: WOOD.oak, metal: '#9aa0a6' },
    variants: [...WV.slice(0, 3), { name: 'Set for a meal', c: {}, f: { set: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (const x of [95, 150, 205]) {
        chairAt(g, x, 34, 56, 0, c.wood, r);
        chairAt(g, x, 166, 56, Math.PI, c.wood, r);
      }
      chairAt(g, 32, 100, 56, -Math.PI / 2, c.wood, r);
      chairAt(g, 268, 100, 56, Math.PI / 2, c.wood, r);
      panel(g, 56, 52, 188, 96, c.wood, r, 'h', 5, 5);
      if (f.set) {
        for (const x of [95, 150, 205]) {
          plate(g, x, 70, 10, '#c0703a');
          plate(g, x, 130, 10, '#8aa04a');
          goblet(g, x + 17, 72, 5, c.metal);
          goblet(g, x - 17, 128, 5, c.metal, DRINKS.ale);
        }
        plate(g, 74, 100, 9, '#b5482a');
        plate(g, 226, 100, 9, '#b5482a');
        candle(g, 130, 100, 6, r);
        candle(g, 170, 100, 6, r);
        loaf(g, 150, 100, 11, 6, 0.2);
      }
    },
  },
  {
    id: 'kitchen-table', name: 'Kitchen table', cat: 'kitchen', sets: ['tavern', 'castle', 'farm', 'town'], tags: ['cooking', 'prep', 'chopping', 'baking', 'dressed table'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.pine }, variants: WV.slice(0, 3),
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 6, 12, 188, 76, c.wood, r, 'h', 4, 4);
      speckle(g, 110, 22, 60, 40, r, 40, 'rgba(250,246,236,0.75)', 1.6);
      rr(g, 20, 26, 60, 44, 6);
      paint(g, litFill(g, 20, 26, 60, 44, '#b98a52', 0.25), INK, 1.4);
      // knife
      poly(g, [[34, 60], [64, 56], [66, 58], [36, 64]]);
      paint(g, litFill(g, 34, 56, 32, 8, '#cfd6dc', 0.4), INK, 1);
      rr(g, 22, 59, 14, 6, 2);
      paint(g, '#4a2e1a', INK, 0.9);
      // carrots and onions
      for (let i = 0; i < 3; i++) {
        g.save();
        g.translate(40 + i * 10, 38);
        g.rotate(0.2 + i * 0.1);
        poly(g, [[-3, -9], [3, -9], [0, 10]]);
        paint(g, '#e0782a', INK, 0.9);
        line(g, 0, -9, 0, -14, '#3e8a3a', 2);
        g.restore();
      }
      fruit(g, 70, 36, 5, '#c9a86a');
      // cabbage
      circle(g, 96, 66, 10);
      paint(g, domeFill(g, 96, 66, 10, '#7ab04a', 0.4), INK, 1.2);
      g.beginPath();
      g.arc(96, 66, 6, 0.3, 2.5);
      stroke(g, alpha('#3e6b2a', 0.8), 1);
      // rolling pin and dough
      blob(g, lumpy(140, 44, 18, 0.25, 9, r, 13));
      paint(g, domeFill(g, 140, 44, 18, '#ecdcb8', 0.25), INK, 1.2);
      rr(g, 118, 66, 50, 8, 4);
      paint(g, litFill(g, 118, 66, 50, 8, '#c4955a', 0.35), INK, 1.1);
      circle(g, 176, 32, 10);
      paint(g, domeFill(g, 176, 32, 10, '#d9d2c3', 0.3), INK, 1.2);
      circle(g, 176, 32, 6);
      paint(g, '#e8d39b', null);
    },
  },

  // ============ kitchen and food ============
  {
    id: 'hearth-oven', name: 'Bread oven', cat: 'kitchen', sets: ['tavern', 'castle', 'farm', 'town'], tags: ['oven', 'bake', 'bakery', 'hearth', 'fire', 'kitchen'],
    w: 2, h: 1, blocksMovement: true, light: { bright: 5, dim: 10, color: '#ff8a3a' }, c: { stone: STONE.red, fire: '#ffb02e' },
    variants: [{ name: 'Brick', c: {} }, { name: 'Grey stone', c: { stone: STONE.grey } }, { name: 'Clay', c: { stone: '#b07a52' } }, { name: 'Cold', c: {}, f: { cold: 1 } }],
    desc: 'Domed oven against a wall (top edge).',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 4, 2, 192, 30, 4);
      paint(g, c.stone, INK, LW);
      g.save();
      rr(g, 4, 2, 192, 30, 4);
      g.clip();
      blocks(g, 4, 2, 192, 30, shade(c.stone, -0.15), r, 24, 10);
      g.restore();
      rr(g, 4, 2, 192, 30, 4);
      stroke(g, INK, LW);
      ellipse(g, 100, 44, 66, 40);
      paint(g, domeFill(g, 100, 40, 66, c.stone, 0.4), INK, LW);
      g.save();
      ellipse(g, 100, 44, 66, 40);
      g.clip();
      for (let i = 1; i < 4; i++) {
        ellipse(g, 100, 44, 66 - i * 15, 40 - i * 9);
        stroke(g, alpha(shade(c.stone, -0.55), 0.6), 1.1);
      }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        line(g, 100 + Math.cos(a) * 20, 44 + Math.sin(a) * 12, 100 + Math.cos(a) * 66, 44 + Math.sin(a) * 40, alpha(shade(c.stone, -0.55), 0.45), 1);
      }
      g.restore();
      circle(g, 100, 40, 9);
      paint(g, '#2a2420', INK, 1.4);
      rr(g, 64, 74, 72, 22, 4);
      paint(g, litFill(g, 64, 74, 72, 22, STONE.grey, 0.25), INK, 1.6);
      g.beginPath();
      g.moveTo(80, 84);
      g.arc(100, 78, 20, Math.PI, 0);
      g.lineTo(120, 84);
      g.closePath();
      paint(g, '#1d1612', INK, 1.6);
      if (!f.cold) {
        glow(g, 100, 76, 26, '#ff8a3a', 0.6);
        flame(g, 100, 74, 7, r);
      }
      loaf(g, 160, 82, 10, 6, 0.3);
      // baker's peel
      line(g, 20, 88, 52, 70, INK, 4.6);
      line(g, 20, 88, 52, 70, '#c4955a', 2.6);
      ellipse(g, 56, 68, 9, 7, -0.5);
      paint(g, litFill(g, 48, 60, 18, 16, '#c4955a', 0.3), INK, 1.2);
    },
  },
  {
    id: 'stove', name: 'Cook stove', cat: 'kitchen', sets: ['tavern', 'castle', 'town', 'ship'], tags: ['stove', 'cooking', 'galley', 'kitchen', 'iron'],
    w: 1, h: 1, blocksMovement: true, c: { metal: '#33373c' },
    variants: [{ name: 'Black iron', c: {} }, { name: 'Green enamel', c: { metal: '#3f5a4a' } }, { name: 'Copper trim', c: { metal: '#4a3a32' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 42, 2, 16, 14, 2);
      paint(g, litFill(g, 42, 2, 16, 14, '#2a2c30', 0.3), INK, 1.4);
      box(g, 10, 12, 80, 76, c.metal, 5, LW, 0.3);
      rr(g, 10, 80, 80, 8, 2);
      paint(g, '#1d1612', INK, 1.2);
      for (let x = 18; x < 84; x += 8) line(g, x, 82, x, 87, '#ff7a1a', 1.6);
      for (const [x, y] of [[32, 40], [68, 40], [50, 66]]) {
        circle(g, x, y, 13);
        paint(g, shade(c.metal, -0.3), INK, 1.2);
        circle(g, x, y, 8);
        stroke(g, alpha(shade(c.metal, 0.4), 0.7), 1.2);
      }
      // pot and kettle
      circle(g, 32, 40, 12);
      paint(g, domeFill(g, 32, 40, 12, '#8a8d92', 0.4), INK, 1.3);
      liquid(g, 32, 40, 8, 8, '#8a5a2a', r);
      circle(g, 68, 40, 10);
      paint(g, domeFill(g, 68, 40, 10, '#b06a3a', 0.45), INK, 1.3);
      line(g, 76, 34, 84, 28, INK, 3.4);
      line(g, 76, 34, 84, 28, '#b06a3a', 2);
    },
  },
  {
    id: 'pot-rack', name: 'Hanging pot rack', cat: 'kitchen', sets: ['tavern', 'castle', 'farm', 'town'], tags: ['pots', 'pans', 'kitchen', 'hanging', 'overhead'],
    w: 2, h: 1, layer: 'overhead', c: { metal: '#4e5257', pot: '#b06a3a' },
    variants: [{ name: 'Copper pots', c: {} }, { name: 'Iron pots', c: { pot: '#5d6166' } }, { name: 'With herbs', c: {}, f: { herbs: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (const [x, y] of [[10, 10], [190, 10], [10, 90], [190, 90]]) line(g, 100, 50, x, y, alpha('#2a2c30', 0.7), 1.2);
      rr(g, 8, 44, 184, 12, 4);
      paint(g, litFill(g, 8, 44, 184, 12, c.metal, 0.4), INK, LW);
      const items = [
        () => { circle(g, 30, 34, 14); paint(g, domeFill(g, 30, 34, 14, c.pot, 0.45), INK, 1.4); circle(g, 30, 34, 9); paint(g, shade(c.pot, -0.4), null); },
        () => { circle(g, 66, 66, 16); paint(g, domeFill(g, 66, 66, 16, '#2c2f33', 0.4), INK, 1.4); line(g, 66, 50, 66, 56, INK, 3); },
        () => { circle(g, 104, 32, 12); paint(g, domeFill(g, 104, 32, 12, c.pot, 0.45), INK, 1.4); line(g, 116, 32, 128, 30, INK, 3.4); line(g, 116, 32, 128, 30, c.pot, 2); },
        () => { circle(g, 140, 70, 13); paint(g, domeFill(g, 140, 70, 13, c.pot, 0.45), INK, 1.4); circle(g, 140, 70, 8); paint(g, shade(c.pot, -0.4), null); },
        () => { circle(g, 176, 34, 7); paint(g, domeFill(g, 176, 34, 7, '#9aa0a6', 0.45), INK, 1.2); line(g, 176, 41, 176, 52, INK, 2.6); line(g, 176, 41, 176, 52, '#9aa0a6', 1.4); },
      ];
      items.forEach((fn) => fn());
      if (f.herbs) {
        for (const x of [48, 120, 160]) {
          for (let i = 0; i < 6; i++) line(g, x, 54, x + (r() - 0.5) * 14, 76 + r() * 6, '#4f7a34', 2);
          line(g, x - 3, 56, x + 3, 56, '#8a6a3a', 2.4);
        }
      }
    },
  },
  {
    id: 'washbasin', name: 'Washbasin', cat: 'furniture', sets: ['tavern', 'castle', 'town', 'temple'], tags: ['basin', 'wash', 'pitcher', 'water', 'bath'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak, bowl: '#e3ddd0' },
    variants: [{ name: 'Ceramic', c: {} }, { name: 'Pewter', c: { bowl: '#9aa0a6' } }, { name: 'Copper', c: { bowl: '#b06a3a', wood: WOOD.walnut } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 14, 14, 72, 72, c.wood, r, 'h', 3, 6);
      circle(g, 44, 46, 24);
      paint(g, domeFill(g, 44, 46, 24, c.bowl, 0.3), INK, LW);
      liquid(g, 44, 46, 17, 17, '#7aa6b8', r);
      circle(g, 74, 70, 9);
      paint(g, domeFill(g, 74, 70, 9, c.bowl, 0.4), INK, 1.3);
      circle(g, 74, 70, 5);
      paint(g, '#5a7a88', null);
      poly(g, [[66, 64], [61, 60], [66, 68]]);
      paint(g, c.bowl, INK, 1);
      cloth(g, 18, 70, 30, 12, CLOTH.white, r, 2, 2);
    },
  },
  {
    id: 'bathtub', name: 'Bathtub', cat: 'furniture', sets: ['castle', 'tavern', 'town'], tags: ['bath', 'tub', 'wash', 'water', 'bathhouse'],
    w: 2, h: 1, blocksMovement: true, c: { tub: WOOD.oak, metal: METAL.iron, water: '#7aa6b8' },
    variants: [{ name: 'Wooden', c: {} }, { name: 'Copper', c: { tub: '#b06a3a' }, f: { metal: 1 } }, { name: 'Marble', c: { tub: STONE.marble }, f: { metal: 1 } }, { name: 'Bubbles', c: {}, f: { bubbles: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 8, 12, 184, 76, 36);
      paint(g, litFill(g, 8, 12, 184, 76, c.tub, 0.3), INK, LW * 1.1);
      if (!f.metal) {
        g.save();
        rr(g, 8, 12, 184, 76, 36);
        g.clip();
        for (let x = 20; x < 190; x += 12) line(g, x, 12, x, 88, alpha(shade(c.tub, -0.55), 0.5), 1);
        g.restore();
        for (const x of [40, 160]) {
          line(g, x, 13, x, 87, INK, 6);
          line(g, x, 13, x, 87, shade(c.metal, 0.2), 3.6);
        }
      }
      rr(g, 18, 20, 164, 60, 28);
      paint(g, shade(c.tub, -0.35), INK, 1.4);
      g.save();
      rr(g, 20, 22, 160, 56, 26);
      g.clip();
      liquid(g, 100, 50, 82, 30, c.water, r);
      if (f.bubbles) {
        for (let i = 0; i < 22; i++) {
          const x = 30 + r() * 140, y = 26 + r() * 48, rad = 3 + r() * 5;
          circle(g, x, y, rad);
          paint(g, 'rgba(255,255,255,0.75)', alpha('#9ab8c4', 0.9), 0.8);
        }
      }
      g.restore();
      cloth(g, 150, 4, 36, 16, CLOTH.white, r, 2, 3);
    },
  },
  {
    id: 'privy', name: 'Privy', cat: 'furniture', sets: ['town', 'farm', 'tavern', 'castle', 'camp'], tags: ['toilet', 'outhouse', 'latrine', 'garderobe'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.pine },
    variants: [{ name: 'Pine', c: {} }, { name: 'Old oak', c: { wood: '#7a6a52' } }, { name: 'Stone garderobe', c: { wood: STONE.grey } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 8, 8, 84, 52, c.wood, r, 'h', 3, 3);
      ellipse(g, 50, 34, 14, 10);
      paint(g, '#120c08', INK, 1.4);
      ellipse(g, 50, 34, 18, 13);
      stroke(g, alpha(shade(c.wood, -0.5), 0.6), 1.4);
      box(g, 24, 8, 52, 9, shade(c.wood, -0.2), 2, 1.4);
      circle(g, 74, 76, 11);
      paint(g, domeFill(g, 74, 76, 11, WOOD.oak, 0.3), INK, 1.4);
      circle(g, 74, 76, 8);
      paint(g, '#4a3a22', null);
      speckle(g, 16, 64, 40, 28, r, 6, 'rgba(30,20,10,0.25)', 2);
    },
  },
  {
    id: 'water-barrel', name: 'Water barrel', cat: 'storage', sets: ['ship', 'town', 'farm', 'camp', 'tavern', 'castle'], tags: ['water', 'rain barrel', 'drink', 'butt', 'barrel'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.iron, water: '#4f7a88' },
    variants: [{ name: 'Water', c: {} }, { name: 'Ale', c: { water: '#b07a2a' } }, { name: 'Rainwater, mossy', c: { water: '#4a6a4a', wood: '#6e6450' } }, { name: 'Pickles', c: { water: '#8a9a4a' }, f: { pickles: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      circle(g, 50, 50, 40);
      paint(g, domeFill(g, 50, 50, 40, c.wood, 0.25), INK, LW * 1.1);
      circle(g, 50, 50, 37);
      stroke(g, INK, 6);
      circle(g, 50, 50, 37);
      stroke(g, shade(c.metal, 0.15), 3.6);
      circle(g, 50, 50, 31);
      paint(g, shade(c.wood, -0.45), INK, 1.4);
      liquid(g, 50, 50, 28, 28, c.water, r);
      if (f.pickles) for (let i = 0; i < 6; i++) { const a = r() * 6.28, d = r() * 16; ellipse(g, 50 + Math.cos(a) * d, 50 + Math.sin(a) * d, 7, 3.5, r() * 3); paint(g, '#5a7a2a', INK, 0.8); }
      // ladle
      line(g, 50, 52, 86, 22, INK, 4.4);
      line(g, 50, 52, 86, 22, '#8a6a44', 2.6);
      circle(g, 46, 56, 7);
      paint(g, domeFill(g, 46, 56, 7, '#8a6a44', 0.35), INK, 1.2);
    },
  },
  {
    id: 'flour-sacks', name: 'Flour sacks', cat: 'storage', sets: ['farm', 'market', 'tavern', 'town', 'ship'], tags: ['flour', 'grain', 'mill', 'bakery', 'sacks', 'supplies'],
    w: 2, h: 1, c: { cloth: '#e3dac4', label: '#2f5d8a' },
    variants: [{ name: 'Flour', c: {} }, { name: 'Grain, burlap', c: { cloth: SACK, label: '#8e2f25' } }, { name: 'Salt', c: { cloth: '#d6d0c8', label: '#3e6b3a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      speckle(g, 10, 60, 180, 36, r, 30, 'rgba(250,246,236,0.7)', 1.6);
      sackLying(g, 44, 30, 70, 38, 0.05, c.cloth, r, c.label);
      sackLying(g, 120, 28, 72, 38, -0.08, shade(c.cloth, -0.05), r, c.label);
      sackLying(g, 70, 70, 72, 38, 0.1, shade(c.cloth, 0.03), r, c.label);
      sackLying(g, 150, 70, 66, 36, Math.PI - 0.1, c.cloth, r, c.label);
    },
  },
  {
    id: 'hay-bale', name: 'Hay bale', cat: 'storage', sets: ['farm', 'town', 'market', 'camp'], tags: ['hay', 'straw', 'barn', 'stable', 'cover'],
    w: 2, h: 1, blocksMovement: true, c: { hay: '#d9bf6a', twine: '#8a5a32' },
    variants: [{ name: 'Fresh', c: {} }, { name: 'Old', c: { hay: '#b3a275' } }, { name: 'Green', c: { hay: '#b8c06a' } }, { name: 'Loose pile', c: {}, f: { loose: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const straw = (x: number, y: number, w: number, h: number, n: number) => {
        for (let i = 0; i < n; i++) {
          const sx = x + r() * w, sy = y + r() * h, a = (r() - 0.5) * 0.8 + (f.loose ? r() * 3 : 0);
          line(g, sx, sy, sx + Math.cos(a) * 10, sy + Math.sin(a) * 10, alpha(shade(c.hay, r() < 0.5 ? -0.35 : 0.3), 0.85), 1);
        }
      };
      if (f.loose) {
        const pts = lumpy(100, 52, 86, 0.3, 16, r, 40);
        blob(g, pts);
        paint(g, domeFill(g, 100, 52, 86, c.hay, 0.3), INK, LW);
        g.save();
        blob(g, pts);
        g.clip();
        straw(16, 12, 168, 80, 90);
        g.restore();
        return;
      }
      rr(g, 8, 16, 184, 68, 8);
      paint(g, litFill(g, 8, 16, 184, 68, c.hay, 0.25), INK, LW);
      g.save();
      rr(g, 8, 16, 184, 68, 8);
      g.clip();
      straw(8, 16, 184, 68, 80);
      g.restore();
      for (const x of [62, 138]) {
        line(g, x, 15, x + 2, 85, INK, 4.4);
        line(g, x, 15, x + 2, 85, c.twine, 2.4);
      }
    },
  },
  {
    id: 'produce-crates', name: 'Produce crates', cat: 'kitchen', sets: ['market', 'farm', 'town', 'ship', 'tavern'], tags: ['fruit', 'vegetables', 'apples', 'food', 'harvest', 'crates'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.pine, a: '#c0392b', b: '#7ab04a' },
    variants: [
      { name: 'Apples and cabbages', c: {} }, { name: 'Oranges and lemons', c: { a: '#e0782a', b: '#e9d24a' } },
      { name: 'Potatoes and carrots', c: { a: '#b08a5a', b: '#e0782a' }, f: { long: 1 } }, { name: 'Plums and pears', c: { a: '#5a2a5a', b: '#b8c04a' } },
    ],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const pile = (col: string, size: number, long: boolean) => (ix: number, iy: number, iw: number, ih: number) => {
        const n = Math.round((iw * ih) / (size * size * 2.2));
        for (let i = 0; i < n; i++) {
          const x = ix + size * 0.6 + r() * (iw - size * 1.2), y = iy + size * 0.6 + r() * (ih - size * 1.2);
          const col2 = shade(col, (r() - 0.5) * 0.3);
          if (long) {
            g.save();
            g.translate(x, y);
            g.rotate(r() * 3);
            poly(g, [[-size * 0.4, -size], [size * 0.4, -size], [0, size]]);
            paint(g, col2, INK, 0.8);
            g.restore();
          } else fruit(g, x, y, size, col2);
        }
      };
      openCrate(g, 6, 10, 90, 80, c.wood, r, pile(c.a, 8, false));
      openCrate(g, 104, 12, 90, 78, shade(c.wood, -0.06), r, pile(c.b, f.long ? 7 : 10, !!f.long));
    },
  },
  {
    id: 'fish-crate', name: 'Fish crate', cat: 'kitchen', sets: ['ship', 'market', 'town'], tags: ['fish', 'catch', 'dock', 'fishmonger', 'ice', 'food'],
    w: 1, h: 1, c: { wood: '#8a7a62', fish: '#9aaab4' },
    variants: [{ name: 'Silver fish', c: {} }, { name: 'Red snapper', c: { fish: '#c0584a' } }, { name: 'Mixed catch', c: { fish: '#7a8a6a' }, f: { mixed: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      openCrate(g, 10, 10, 80, 80, c.wood, r, (ix, iy, iw, ih) => {
        g.fillStyle = '#cfe0e6';
        g.fillRect(ix, iy, iw, ih);
        speckle(g, ix, iy, iw, ih, r, 30, 'rgba(255,255,255,0.8)', 1.6);
        for (let i = 0; i < 6; i++) {
          const col = f.mixed ? ['#9aaab4', '#c0584a', '#7a8a6a'][i % 3] : c.fish;
          fish(g, ix + 14 + (i % 2) * 28 + r() * 6, iy + 10 + Math.floor(i / 2) * 20, 34, (i % 2 ? Math.PI : 0) + (r() - 0.5) * 0.4, col);
        }
      });
    },
  },
  {
    id: 'bread-rack', name: 'Bread rack', cat: 'kitchen', sets: ['market', 'town', 'tavern', 'castle'], tags: ['bakery', 'bread', 'loaves', 'shelf', 'food'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.pine }, variants: WV.slice(0, 3),
    desc: 'Against a wall (top edge).',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shelfCase(g, 4, 6, 192, 62, c.wood, r, (ix, iy, iw) => {
        line(g, ix, iy + 26, ix + iw, iy + 26, shade(c.wood, -0.1), 2.6);
        for (let i = 0; i < 7; i++) loaf(g, ix + 14 + i * 25, iy + 12, 11, 7, (r() - 0.5) * 0.4);
        for (let i = 0; i < 5; i++) loaf(g, ix + 22 + i * 36, iy + 40, 16, 5, (r() - 0.5) * 0.3);
      });
      basket(g, 40, 86, 12, null, r);
      loaf(g, 40, 86, 7, 4, 0.4);
    },
  },
  {
    id: 'wine-rack', name: 'Wine rack', cat: 'storage', sets: ['tavern', 'castle', 'town'], tags: ['wine', 'bottles', 'cellar', 'vintage'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut },
    variants: [...WV.slice(0, 3), { name: 'Half empty', c: {}, f: { sparse: 1 } }],
    desc: 'Against a wall (top edge).',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      shelfCase(g, 4, 6, 192, 60, c.wood, r, (ix, iy, iw, ih) => {
        const cols = 11, rows = 3, cw = iw / cols, rh = ih / rows;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const x = ix + (i + 0.5) * cw, y = iy + (j + 0.5) * rh;
          circle(g, x, y, Math.min(cw, rh) * 0.48);
          paint(g, shade(c.wood, -0.25), null);
          if (f.sparse && r() < 0.45) continue;
          const glass = ['#2e5e3a', '#4a1a22', '#3a4a22', '#2a2420'][Math.floor(r() * 4)];
          bottle(g, x, y, Math.min(cw, rh) * 0.4, glass);
        }
      });
    },
  },
  {
    id: 'shelf-jars', name: 'Pantry shelf', cat: 'kitchen', sets: ['tavern', 'castle', 'farm', 'town', 'wizard'], tags: ['jars', 'pantry', 'larder', 'preserves', 'shelf', 'storage'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak }, variants: WV.slice(0, 3),
    desc: 'Against a wall (top edge).',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shelfCase(g, 4, 6, 192, 56, c.wood, r, (ix, iy, iw) => {
        const cols = ['#c0392b', '#e0b23a', '#7a9a4a', '#b08a5a', '#d9d2c3', '#8a4a6a'];
        for (let i = 0; i < 9; i++) jar(g, ix + 10 + i * 20, iy + 12, 8, cols[Math.floor(r() * cols.length)]);
        for (let i = 0; i < 6; i++) jar(g, ix + 18 + i * 29, iy + 32, 9.5, mix('#b07a52', cols[i % cols.length], 0.3), '#d9d2c3');
      });
      sackUp(g, 172, 80, 14, SACK, r);
      jar(g, 30, 82, 10, '#a86a3a', '#6b4a2b');
    },
  },
  {
    id: 'potion-shelf', name: 'Potion shelf', cat: 'arcane', sets: ['wizard', 'market', 'swamp', 'castle', 'town'], tags: ['potions', 'alchemy', 'bottles', 'apothecary', 'elixir', 'shelf'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut },
    variants: [...WV.slice(0, 2), { name: 'Witch hut', c: { wood: '#5a5040' }, f: { witch: 1 } }],
    desc: 'Against a wall (top edge).',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      shelfCase(g, 4, 6, 192, 56, c.wood, r, (ix, iy, iw) => {
        const cols = ['#d6304a', '#2fa3d6', '#3fbf6a', '#a45ad6', '#e9b949', '#f07ab0', '#5ae0d0'];
        for (let row = 0; row < 2; row++) {
          let x = ix + 7;
          while (x < ix + iw - 6) {
            const rad = 4 + r() * 3.5, col = cols[Math.floor(r() * cols.length)];
            if (r() < 0.3) glow(g, x, iy + 11 + row * 22, rad * 2.4, col, 0.45);
            bottle(g, x, iy + 11 + row * 22, rad, col);
            x += rad * 2 + 3;
          }
        }
      });
      if (f.witch) {
        jar(g, 30, 82, 10, '#7a9a4a', '#5a5040');
        circle(g, 170, 82, 9);
        paint(g, domeFill(g, 170, 82, 9, '#e6dcc6', 0.4), INK, 1.3);
        for (const [x, y] of [[166, 80], [174, 80]]) { circle(g, x, y, 2.2); paint(g, '#1b1410', null); }
      } else {
        bottle(g, 40, 82, 7, '#3fbf6a');
        scroll(g, 140, 76, 26, 9, 0.2);
      }
    },
  },
  {
    id: 'butcher-block', name: 'Butcher block', cat: 'kitchen', sets: ['market', 'town', 'tavern', 'castle', 'farm'], tags: ['butcher', 'meat', 'cleaver', 'chopping', 'kitchen'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak },
    variants: [{ name: 'Clean', c: {} }, { name: 'Bloody', c: {}, f: { blood: 1 } }, { name: 'Dark wood', c: { wood: WOOD.walnut } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 12, 12, 76, 76, 5);
      paint(g, c.wood, INK, LW * 1.1);
      g.save();
      rr(g, 12, 12, 76, 76, 5);
      g.clip();
      for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) {
        const x = 12 + i * 15.2, y = 12 + j * 15.2;
        g.fillStyle = litFill(g, x, y, 15, 15, shade(c.wood, (r() - 0.5) * 0.25), 0.15);
        g.fillRect(x, y, 15.2, 15.2);
        circle(g, x + 7.6, y + 7.6, 4);
        stroke(g, alpha(shade(c.wood, -0.5), 0.35), 0.8);
      }
      sheen(g, 12, 12, 76, 76, 0.18);
      if (f.blood) for (let i = 0; i < 5; i++) { blob(g, lumpy(20 + r() * 60, 20 + r() * 60, 3 + r() * 6, 0.6, 7, r)); g.fillStyle = alpha('#6e0f14', 0.7); g.fill(); }
      g.restore();
      rr(g, 12, 12, 76, 76, 5);
      stroke(g, INK, LW * 1.1);
      // a joint of meat
      blob(g, lumpy(38, 40, 16, 0.25, 9, r, 12));
      paint(g, domeFill(g, 38, 40, 16, '#b0383a', 0.35), INK, 1.4);
      ellipse(g, 32, 36, 6, 4, 0.4);
      paint(g, '#f0e2d0', null);
      // cleaver
      g.save();
      g.translate(66, 62);
      g.rotate(-0.6);
      rr(g, -14, -8, 22, 16, 2);
      paint(g, litFill(g, -14, -8, 22, 16, '#cfd6dc', 0.4), INK, 1.2);
      rr(g, 8, -3, 18, 6, 2);
      paint(g, '#4a2e1a', INK, 1);
      g.restore();
    },
  },
  {
    id: 'milk-churn', name: 'Milk churn', cat: 'kitchen', sets: ['farm', 'town', 'market'], tags: ['butter', 'dairy', 'milk', 'pail', 'churn'],
    w: 1, h: 1, c: { wood: WOOD.pine, metal: METAL.iron },
    variants: [{ name: 'Wooden', c: {} }, { name: 'Dark wood', c: { wood: WOOD.oak } }, { name: 'Tin', c: { wood: '#a8adb2', metal: '#6c6f73' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      circle(g, 70, 70, 16);
      paint(g, domeFill(g, 70, 70, 16, c.wood, 0.3), INK, LW);
      circle(g, 70, 70, 12);
      paint(g, '#f2eee4', INK, 1);
      liquid(g, 70, 70, 11, 11, '#f4f1ea', r);
      circle(g, 40, 40, 28);
      paint(g, domeFill(g, 40, 40, 28, c.wood, 0.3), INK, LW);
      for (const rad of [26, 18]) { circle(g, 40, 40, rad); stroke(g, INK, 4); circle(g, 40, 40, rad); stroke(g, shade(c.metal, 0.2), 2.2); }
      circle(g, 40, 40, 14);
      paint(g, domeFill(g, 40, 40, 14, shade(c.wood, -0.1), 0.3), INK, 1.2);
      circle(g, 40, 40, 4);
      paint(g, domeFill(g, 40, 40, 4, shade(c.wood, 0.2), 0.5), INK, 1.2);
    },
  },
  {
    id: 'firewood', name: 'Firewood stack', cat: 'storage', sets: ['farm', 'camp', 'town', 'forest', 'winter', 'tavern'], tags: ['logs', 'wood', 'chopping block', 'axe', 'fuel'],
    w: 2, h: 1, blocksMovement: true, c: { bark: '#5a3d24', wood: '#c9a066' },
    variants: [{ name: 'Oak logs', c: {} }, { name: 'Birch logs', c: { bark: '#d9d2c3', wood: '#e3c896' } }, { name: 'Snowy', c: {}, f: { snow: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 6; i++) {
        const y = 12 + i * 13, x = 6 + (i % 2) * 6, w = 118 - (i % 2) * 8;
        rr(g, x, y, w, 15, 7);
        paint(g, litFill(g, x, y, w, 15, c.bark, 0.3), INK, 1.4);
        for (let k = 0; k < 4; k++) line(g, x + 10 + r() * (w - 30), y + 4, x + 18 + r() * (w - 30), y + 11, alpha(shade(c.bark, c.bark === '#d9d2c3' ? -0.7 : -0.5), 0.6), 1);
        ellipse(g, x + w - 4, y + 7.5, 5, 7);
        paint(g, c.wood, INK, 1);
      }
      if (f.snow) {
        blob(g, lumpy(64, 14, 56, 0.3, 10, r, 8));
        paint(g, '#f4f7fa', alpha(INK, 0.5), 1);
      }
      // chopping stump with axe
      circle(g, 166, 50, 26);
      paint(g, domeFill(g, 166, 50, 26, c.wood, 0.25), INK, LW);
      for (const rad of [8, 15, 21]) { circle(g, 166, 50, rad); stroke(g, alpha(shade(c.wood, -0.45), 0.45), 1); }
      axe(g, 160, 30, 72, METAL.iron, '#8a6a44');
      speckle(g, 136, 80, 60, 16, r, 10, '#c9a066', 1.8);
    },
  },

  // ============ decor and town ============
  {
    id: 'coat-rack', name: 'Coat rack', cat: 'decor', sets: ['tavern', 'town', 'castle'], tags: ['cloak', 'hat', 'hooks', 'hall'],
    w: 1, h: 1, c: { wood: WOOD.walnut, cloak: CLOTH.green },
    variants: [{ name: 'Green cloak', c: {} }, { name: 'Red cloak', c: { cloak: CLOTH.red } }, { name: 'Bare', c: {}, f: { bare: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i / 4) * Math.PI * 2;
        line(g, 50, 50, 50 + Math.cos(a) * 34, 50 + Math.sin(a) * 34, INK, 5.4);
        line(g, 50, 50, 50 + Math.cos(a) * 34, 50 + Math.sin(a) * 34, shade(c.wood, -0.1), 3.4);
      }
      if (!f.bare) {
        blob(g, [[30, 34], [52, 40], [56, 62], [44, 80], [24, 78], [16, 56]]);
        paint(g, litFill(g, 16, 34, 40, 46, c.cloak, 0.3), INK, LW);
        for (const x of [28, 38]) line(g, x, 46, x - 4, 74, alpha(shade(c.cloak, -0.5), 0.5), 1.4);
        circle(g, 70, 36, 14);
        paint(g, domeFill(g, 70, 36, 14, '#5a4030', 0.35), INK, 1.4);
        circle(g, 70, 36, 7);
        paint(g, domeFill(g, 70, 36, 7, '#4a3020', 0.35), INK, 1);
        line(g, 63, 35, 77, 35, '#a3312c', 2);
      }
      circle(g, 50, 50, 7);
      paint(g, domeFill(g, 50, 50, 7, c.wood, 0.5), INK, 1.4);
      void r;
    },
  },
  {
    id: 'mirror', name: 'Standing mirror', cat: 'decor', sets: ['castle', 'town', 'wizard'], tags: ['mirror', 'looking glass', 'cheval', 'vanity', 'bedroom'],
    w: 1, h: 1, blocksMovement: true, c: { frame: METAL.gold },
    variants: [{ name: 'Gilded', c: {} }, { name: 'Walnut', c: { frame: WOOD.walnut } }, { name: 'Silver', c: { frame: METAL.silver } }, { name: 'Haunted (dark glass)', c: { frame: METAL.black }, f: { dark: 1 } }],
    draw: ({ g, c, f }) => {
      box(g, 14, 76, 72, 10, shade(c.frame, -0.2), 4, LW, 0.3);
      for (const x of [16, 84]) line(g, x, 80, x, 30, INK, 6);
      for (const x of [16, 84]) line(g, x, 80, x, 30, c.frame, 3.6);
      ellipse(g, 50, 46, 30, 38);
      paint(g, litFill(g, 20, 8, 60, 76, c.frame, 0.4), INK, LW);
      ellipse(g, 50, 46, 23, 31);
      const gr = g.createLinearGradient(30, 16, 70, 76);
      if (f.dark) { gr.addColorStop(0, '#4a3a5a'); gr.addColorStop(1, '#141018'); }
      else { gr.addColorStop(0, '#e8f0f4'); gr.addColorStop(0.5, '#a9bcc6'); gr.addColorStop(1, '#6a7f8a'); }
      paint(g, gr, INK, 1.2);
      g.save();
      ellipse(g, 50, 46, 23, 31);
      g.clip();
      line(g, 34, 40, 54, 18, 'rgba(255,255,255,0.6)', 3);
      line(g, 40, 56, 64, 26, 'rgba(255,255,255,0.35)', 2);
      if (f.dark) glow(g, 50, 46, 22, '#9d4edd', 0.5);
      g.restore();
    },
  },
  {
    id: 'harpsichord', name: 'Harpsichord', cat: 'decor', sets: ['castle', 'town', 'tavern', 'wizard'], tags: ['piano', 'music', 'instrument', 'keyboard', 'organ'],
    w: 2, h: 2, blocksMovement: true, c: { wood: WOOD.walnut, inner: '#d9b46a' },
    variants: [{ name: 'Walnut', c: {} }, { name: 'Ebony', c: { wood: WOOD.ebony } }, { name: 'Painted red', c: { wood: '#7a2420' } }, { name: 'Lid open', c: {}, f: { open: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const shape = () => {
        g.beginPath();
        g.moveTo(26, 150);
        g.lineTo(26, 18);
        g.quadraticCurveTo(26, 6, 40, 8);
        g.lineTo(70, 12);
        g.quadraticCurveTo(110, 30, 140, 70);
        g.quadraticCurveTo(176, 110, 176, 150);
        g.closePath();
      };
      shape();
      paint(g, litFill(g, 26, 8, 150, 142, c.wood, 0.3), INK, LW);
      if (f.open) {
        g.save();
        shape();
        g.clip();
        g.fillStyle = litFill(g, 26, 8, 150, 142, c.inner, 0.2);
        g.fillRect(32, 12, 140, 134);
        for (let i = 0; i < 16; i++) line(g, 38 + i * 8.5, 140, 38 + i * 6, 14 + i * 6, alpha('#5a4a30', 0.7), 0.8);
        g.restore();
        shape();
        stroke(g, INK, LW);
        shape();
        stroke(g, alpha(shade(c.wood, -0.1), 1), 5);
        shape();
        stroke(g, INK, 1);
      } else {
        g.save();
        shape();
        g.clip();
        fgrain(g, 26, 8, 150, 142, c.wood, r, 'v', 8);
        sheen(g, 26, 8, 150, 142, 0.18);
        g.restore();
      }
      // keyboard
      rr(g, 22, 146, 158, 20, 2);
      paint(g, shade(c.wood, -0.2), INK, LW);
      rr(g, 30, 149, 142, 14, 1);
      paint(g, '#f2ecdc', INK, 1);
      for (let i = 0; i < 24; i++) {
        const x = 30 + (i * 142) / 24;
        line(g, x, 149, x, 163, alpha(INK, 0.5), 0.6);
        if ([1, 2, 4, 5, 6].includes(i % 7)) { g.fillStyle = '#1b1410'; g.fillRect(x - 1.6, 149, 3.2, 8); }
      }
      panel(g, 50, 174, 102, 20, c.wood, r, 'h', 1, 4);
    },
  },
  {
    id: 'chandelier', name: 'Chandelier', cat: 'light', sets: ['castle', 'tavern', 'temple', 'town', 'crypt'], tags: ['candles', 'hanging', 'ceiling', 'light', 'overhead'],
    w: 2, h: 2, layer: 'overhead', light: { bright: 15, dim: 15, color: '#ffcf7a' }, c: { metal: METAL.iron, wax: '#efe4c8' },
    variants: [{ name: 'Iron', c: {} }, { name: 'Brass', c: { metal: METAL.brass } }, { name: 'Gold', c: { metal: METAL.gold } }, { name: 'Antler', c: { metal: '#d6c7a3' } }],
    desc: 'Hangs above the room; tokens pass underneath.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 100, 100, 96, '#ffcf7a', 0.32);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        line(g, 100, 100, 100 + Math.cos(a) * 64, 100 + Math.sin(a) * 64, INK, 3.6);
        line(g, 100, 100, 100 + Math.cos(a) * 64, 100 + Math.sin(a) * 64, shade(c.metal, 0.1), 1.8);
      }
      circle(g, 100, 100, 64);
      stroke(g, INK, 8);
      circle(g, 100, 100, 64);
      stroke(g, litFill(g, 36, 36, 128, 128, c.metal, 0.4), 5.4);
      circle(g, 100, 100, 30);
      stroke(g, INK, 5);
      circle(g, 100, 100, 30);
      stroke(g, shade(c.metal, 0.15), 2.8);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const x = 100 + Math.cos(a) * 64, y = 100 + Math.sin(a) * 64;
        circle(g, x, y, 9);
        paint(g, domeFill(g, x, y, 9, c.metal, 0.45), INK, 1.2);
        candle(g, x, y, 5.5, r, c.wax);
      }
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        candle(g, 100 + Math.cos(a) * 30, 100 + Math.sin(a) * 30, 5, r, c.wax);
      }
      circle(g, 100, 100, 10);
      paint(g, domeFill(g, 100, 100, 10, c.metal, 0.5), INK, 1.4);
    },
  },
  {
    id: 'tavern-sign', name: 'Hanging sign', cat: 'decor', sets: ['tavern', 'town', 'market'], tags: ['sign', 'inn', 'shop sign', 'signboard'],
    w: 1, h: 1, c: { wood: WOOD.oak, paint: '#c99a2e', bg: '#2f4f3a' },
    variants: [
      { name: 'Tankard', c: {} }, { name: 'Moon and star', c: { bg: '#2b2f4a', paint: '#e8d68a' }, f: { emblem: 1 } },
      { name: 'Crossed swords', c: { bg: '#5a1f1f', paint: '#d9d2c3' }, f: { emblem: 2 } }, { name: 'Key', c: { bg: '#3a2a20', paint: '#c99a2e' }, f: { emblem: 3 } },
    ],
    draw: ({ g, c, f }) => {
      line(g, 6, 14, 94, 14, INK, 5.6);
      line(g, 6, 14, 94, 14, '#4e5257', 3.4);
      circle(g, 90, 14, 4);
      stroke(g, '#4e5257', 2);
      for (const x of [26, 74]) line(g, x, 14, x, 26, '#4e5257', 1.6);
      box(g, 14, 24, 72, 62, c.wood, 6, LW, 0.25);
      rr(g, 20, 30, 60, 50, 4);
      paint(g, litFill(g, 20, 30, 60, 50, c.bg, 0.2), INK, 1.2);
      const e = f.emblem ?? 0;
      if (e === 0) {
        rr(g, 38, 42, 20, 28, 3);
        paint(g, litFill(g, 38, 42, 20, 28, c.paint, 0.3), INK, 1.2);
        g.beginPath();
        g.arc(60, 56, 8, -Math.PI / 2, Math.PI / 2);
        stroke(g, INK, 4.4);
        g.beginPath();
        g.arc(60, 56, 8, -Math.PI / 2, Math.PI / 2);
        stroke(g, c.paint, 2.6);
        blob(g, [[36, 42], [44, 36], [52, 38], [60, 42], [48, 46]]);
        paint(g, '#f4efe2', INK, 1);
      } else if (e === 1) {
        circle(g, 46, 55, 16);
        g.fillStyle = c.paint;
        g.fill();
        circle(g, 53, 50, 14);
        g.fillStyle = c.bg;
        g.fill();
        poly(g, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, d = i % 2 ? 3 : 7.5; return [64 + Math.cos(a) * d, 50 + Math.sin(a) * d]; }));
        g.fillStyle = c.paint;
        g.fill();
      } else if (e === 2) {
        line(g, 32, 72, 68, 38, INK, 5.4);
        line(g, 32, 72, 68, 38, c.paint, 3.4);
        line(g, 68, 72, 32, 38, INK, 5.4);
        line(g, 68, 72, 32, 38, c.paint, 3.4);
        line(g, 34, 62, 44, 72, '#c99a2e', 3);
        line(g, 56, 72, 66, 62, '#c99a2e', 3);
      } else {
        circle(g, 38, 55, 9);
        stroke(g, INK, 6);
        circle(g, 38, 55, 9);
        stroke(g, c.paint, 3.6);
        line(g, 47, 55, 70, 55, INK, 6);
        line(g, 47, 55, 70, 55, c.paint, 3.6);
        for (const x of [62, 68]) { line(g, x, 55, x, 64, INK, 5); line(g, x, 55, x, 64, c.paint, 3); }
      }
    },
  },
  {
    id: 'dartboard', name: 'Dartboard', cat: 'decor', sets: ['tavern', 'town', 'camp'], tags: ['darts', 'game', 'pub', 'target'],
    w: 1, h: 1, c: { a: '#2b2b30', b: '#e6dcc6', ring1: '#a3312c', ring2: '#3e6b3a' },
    variants: [{ name: 'Classic', c: {} }, { name: 'Painted cork', c: { a: '#7a5638', b: '#d6b98a' } }],
    desc: 'Hangs on a wall.',
    draw: ({ g, c }) => {
      box(g, 8, 8, 84, 84, WOOD.walnut, 4, LW, 0.25);
      circle(g, 50, 50, 36);
      paint(g, domeFill(g, 50, 50, 36, '#1d1612', 0.2), INK, LW);
      for (let i = 0; i < 16; i++) {
        const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 1) / 16) * Math.PI * 2;
        g.beginPath();
        g.moveTo(50, 50);
        g.arc(50, 50, 30, a0, a1);
        g.closePath();
        g.fillStyle = i % 2 ? c.a : c.b;
        g.fill();
      }
      for (const [rad, col] of [[30, c.ring1], [19, c.ring2]] as [number, string][]) {
        circle(g, 50, 50, rad - 1.8);
        stroke(g, col, 3.6);
      }
      circle(g, 50, 50, 5);
      paint(g, c.ring2, INK, 0.8);
      circle(g, 50, 50, 2.4);
      paint(g, c.ring1, null);
      for (const [x, y, a] of [[44, 40, -0.6], [62, 56, 0.4], [52, 62, 1.2]]) {
        line(g, x, y, x + Math.cos(a) * 12, y + Math.sin(a) * 12, INK, 2.4);
        line(g, x, y, x + Math.cos(a) * 12, y + Math.sin(a) * 12, '#c9a24a', 1.2);
        poly(g, [[x + Math.cos(a) * 12, y + Math.sin(a) * 12], [x + Math.cos(a + 0.4) * 18, y + Math.sin(a + 0.4) * 18], [x + Math.cos(a - 0.4) * 18, y + Math.sin(a - 0.4) * 18]]);
        paint(g, '#a3312c', INK, 0.8);
      }
    },
  },
  {
    id: 'notice-board', name: 'Notice board', cat: 'decor', sets: ['town', 'tavern', 'market', 'camp', 'castle'], tags: ['quest board', 'bounty', 'wanted', 'posters', 'jobs'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, roof: '#5a3d2a' },
    variants: [{ name: 'Oak', c: {} }, { name: 'Weathered', c: { wood: '#8a7a62', roof: '#5a5048' } }, { name: 'Dark', c: { wood: WOOD.walnut, roof: '#3a2a22' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const x of [16, 176]) box(g, x, 18, 10, 76, shade(c.wood, -0.25), 2, 1.4);
      panel(g, 8, 24, 184, 62, c.wood, r, 'h', 3, 3);
      for (let i = 0; i < 6; i++) {
        g.save();
        g.translate(30 + i * 28 + (r() - 0.5) * 6, 54 + (r() - 0.5) * 12);
        g.rotate((r() - 0.5) * 0.3);
        rr(g, -11, -15, 22, 28, 1);
        paint(g, ['#efe6cf', '#e4d3a8', '#d9cfa8'][i % 3], INK, 1);
        if (i === 2) {
          circle(g, 0, -4, 6);
          stroke(g, '#3a2a20', 1);
          line(g, -6, 6, 6, 6, '#3a2a20', 1.2);
        } else for (let k = 0; k < 4; k++) line(g, -7, -9 + k * 5, 7 - r() * 4, -9 + k * 5, 'rgba(50,35,20,0.55)', 0.8);
        circle(g, 0, -13, 2);
        paint(g, i % 2 ? '#a3312c' : '#4e5257', null);
        g.restore();
      }
      // shingle roof along the top
      rr(g, 2, 6, 196, 20, 3);
      paint(g, litFill(g, 2, 6, 196, 20, c.roof, 0.3), INK, LW);
      for (let x = 14; x < 196; x += 12) line(g, x, 7, x, 25, alpha(shade(c.roof, -0.6), 0.7), 1);
      line(g, 2, 16, 198, 16, alpha(shade(c.roof, -0.6), 0.7), 1);
    },
  },
  {
    id: 'display-case', name: 'Display case', cat: 'furniture', sets: ['market', 'castle', 'town', 'wizard', 'temple'], tags: ['glass', 'shop', 'museum', 'jewellery', 'relic', 'curio'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, velvet: '#5a1f2b' },
    variants: [{ name: 'Walnut, red velvet', c: {} }, { name: 'Oak, blue velvet', c: { wood: WOOD.oak, velvet: '#1f3a5a' } }, { name: 'Ebony, green velvet', c: { wood: WOOD.ebony, velvet: '#1f4a2a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      box(g, 6, 14, 188, 72, c.wood, 4, LW, 0.25);
      rr(g, 14, 22, 172, 56, 2);
      paint(g, domeFill(g, 100, 50, 100, c.velvet, 0.25), INK, 1.4);
      sword(g, 40, 26, 74, METAL.silver, '#3a2a40');
      g.beginPath();
      g.arc(80, 40, 11, 0.2, Math.PI - 0.2);
      stroke(g, METAL.gold, 1.4);
      gem(g, 80, 54, 6, '#2fa3d6');
      gem(g, 110, 40, 5, '#d6304a');
      gem(g, 122, 60, 4.5, '#3fbf6a');
      circle(g, 104, 62, 5);
      stroke(g, INK, 3.6);
      circle(g, 104, 62, 5);
      stroke(g, METAL.gold, 2);
      coinStack(g, 150, 40, 6, '#e9b949');
      bottle(g, 160, 62, 6, '#a45ad6');
      // glass
      g.save();
      rr(g, 14, 22, 172, 56, 2);
      g.clip();
      g.fillStyle = 'rgba(200,230,240,0.16)';
      g.fillRect(14, 22, 172, 56);
      for (const x of [30, 46, 120]) line(g, x, 80, x + 40, 20, 'rgba(255,255,255,0.35)', x === 46 ? 2 : 5);
      g.restore();
      line(g, 100, 22, 100, 78, alpha(c.wood, 0.9), 2.4);
      void r;
    },
  },
  {
    id: 'shop-counter', name: 'Shop counter', cat: 'furniture', sets: ['market', 'town', 'tavern'], tags: ['shop', 'merchant', 'store', 'counter', 'till', 'ledger'],
    w: 3, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.brass },
    variants: WV.slice(0, 3),
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 4, 20, 292, 62, c.wood, r, 'h', 3, 4);
      // ledger
      rr(g, 24, 30, 56, 38, 2);
      paint(g, '#5a2a22', INK, 1.2);
      rr(g, 27, 32, 25, 34, 1);
      paint(g, '#efe6cf', INK, 0.8);
      rr(g, 52, 32, 25, 34, 1);
      paint(g, '#efe6cf', INK, 0.8);
      for (let i = 0; i < 6; i++) { line(g, 30, 37 + i * 5, 49, 37 + i * 5, 'rgba(50,35,20,0.45)', 0.7); line(g, 55, 37 + i * 5, 74, 37 + i * 5, 'rgba(50,35,20,0.45)', 0.7); }
      line(g, 84, 34, 98, 60, '#f2ecdc', 1.6);
      // scales
      line(g, 120, 50, 168, 50, INK, 3.4);
      line(g, 120, 50, 168, 50, c.metal, 1.8);
      for (const x of [120, 168]) { circle(g, x, 50, 9); paint(g, domeFill(g, x, 50, 9, c.metal, 0.45), INK, 1.2); }
      circle(g, 144, 50, 4);
      paint(g, domeFill(g, 144, 50, 4, c.metal, 0.5), INK, 1);
      coins(g, 168, 50, 4, 3, r);
      for (const x of [190, 200, 210]) coinStack(g, x, 36, 5, '#e9b949');
      // bell
      circle(g, 236, 34, 7);
      paint(g, domeFill(g, 236, 34, 7, c.metal, 0.5), INK, 1.2);
      // wares
      cloth(g, 222, 50, 30, 22, CLOTH.blue, r, 2, 3);
      cloth(g, 254, 46, 32, 26, CLOTH.red, r, 2, 3);
      bottle(g, 196, 64, 6, '#2e5e3a');
    },
  },
  {
    id: 'scales', name: 'Merchant scales', cat: 'decor', sets: ['market', 'town', 'wizard', 'temple'], tags: ['balance', 'scale', 'weigh', 'trade', 'justice'],
    w: 1, h: 1, c: { metal: METAL.brass },
    variants: [{ name: 'Brass', c: {} }, { name: 'Iron', c: { metal: METAL.iron } }, { name: 'Gold', c: { metal: METAL.gold } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      box(g, 36, 62, 28, 24, WOOD.walnut, 3, LW, 0.25);
      line(g, 14, 44, 86, 44, INK, 5);
      line(g, 14, 44, 86, 44, c.metal, 3);
      for (const x of [20, 80]) {
        for (const dx of [-8, 8]) line(g, x, 44, x + dx, 56, alpha(shade(c.metal, -0.3), 0.9), 1);
        circle(g, x, 58, 13);
        paint(g, domeFill(g, x, 58, 13, c.metal, 0.45), INK, 1.4);
      }
      coins(g, 20, 58, 6, 5, r);
      rr(g, 76, 54, 8, 8, 1);
      paint(g, litFill(g, 76, 54, 8, 8, '#4e5257', 0.4), INK, 1);
      line(g, 50, 44, 50, 66, INK, 5);
      line(g, 50, 44, 50, 66, c.metal, 3);
      circle(g, 50, 40, 5);
      paint(g, domeFill(g, 50, 40, 5, c.metal, 0.5), INK, 1.2);
    },
  },
  {
    id: 'stocks', name: 'Stocks', cat: 'decor', sets: ['town', 'castle', 'market'], tags: ['pillory', 'punishment', 'jail', 'square', 'prisoner'],
    w: 2, h: 1, blocksMovement: true, c: { wood: '#7a6a52', metal: METAL.iron },
    variants: [{ name: 'Weathered', c: {} }, { name: 'Oak', c: { wood: WOOD.oak } }, { name: 'Dark', c: { wood: WOOD.walnut } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const x of [14, 172]) box(g, x, 24, 14, 54, shade(c.wood, -0.2), 2, LW, 0.25);
      panel(g, 20, 36, 160, 30, c.wood, r, 'h', 2, 3);
      for (const [x, rad] of [[60, 7], [100, 11], [140, 7]] as [number, number][]) {
        circle(g, x, 51, rad);
        paint(g, '#1b1410', INK, 1.4);
      }
      line(g, 20, 51, 180, 51, alpha(INK, 0.6), 1.2);
      for (const x of [80, 120]) { rr(g, x - 4, 46, 8, 10, 1.5); paint(g, litFill(g, x - 4, 46, 8, 10, c.metal, 0.4), INK, 1); }
    },
  },
  {
    id: 'water-trough', name: 'Water trough', cat: 'furniture', sets: ['farm', 'town', 'camp', 'castle'], tags: ['trough', 'horses', 'stable', 'water', 'feed'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, water: '#4f7a88' },
    variants: [{ name: 'Wooden, water', c: {} }, { name: 'Stone, water', c: { wood: STONE.grey } }, { name: 'Feed trough', c: { water: '#c9b06a' }, f: { feed: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      panel(g, 8, 22, 184, 56, c.wood, r, 'h', 2, 5);
      rr(g, 17, 30, 166, 40, 3);
      paint(g, shade(c.wood, -0.45), INK, 1.4);
      g.save();
      rr(g, 18, 31, 164, 38, 3);
      g.clip();
      if (f.feed) {
        g.fillStyle = c.water;
        g.fillRect(18, 31, 164, 38);
        for (let i = 0; i < 50; i++) { const x = 20 + r() * 160, y = 32 + r() * 36; line(g, x, y, x + 6 * (r() - 0.5), y + 5, alpha(shade(c.water, r() < 0.5 ? -0.35 : 0.3), 0.8), 1); }
      } else liquid(g, 100, 50, 84, 22, c.water, r);
      g.restore();
    },
  },
  {
    id: 'banner-pole', name: 'Banner on pole', cat: 'decor', sets: ['castle', 'camp', 'town', 'temple', 'market'], tags: ['banner', 'flag', 'standard', 'heraldry', 'faction'],
    w: 1, h: 1, c: { cloth: CLOTH.red, emblem: CLOTH.gold },
    variants: [{ name: 'Red and gold', c: {} }, { name: 'Blue and silver', c: { cloth: CLOTH.blue, emblem: '#d9dde0' } }, { name: 'Green and gold', c: { cloth: CLOTH.green } }, { name: 'Black and red', c: { cloth: CLOTH.black, emblem: '#a3312c' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 3; i++) {
        const a = Math.PI / 2 + (i / 3) * Math.PI * 2;
        line(g, 26, 76, 26 + Math.cos(a) * 18, 76 + Math.sin(a) * 18, INK, 5.4);
        line(g, 26, 76, 26 + Math.cos(a) * 18, 76 + Math.sin(a) * 18, WOOD.walnut, 3.4);
      }
      // flowing banner
      g.beginPath();
      g.moveTo(28, 18);
      g.quadraticCurveTo(58, 10, 90, 20);
      g.lineTo(80, 36);
      g.lineTo(92, 52);
      g.quadraticCurveTo(60, 44, 28, 56);
      g.closePath();
      paint(g, litFill(g, 28, 10, 64, 46, c.cloth, 0.3), INK, LW);
      g.save();
      g.clip();
      for (const x of [46, 66]) line(g, x, 10, x + 4, 56, alpha(shade(c.cloth, -0.5), 0.35), 4);
      g.restore();
      circle(g, 52, 35, 8);
      paint(g, domeFill(g, 52, 35, 8, c.emblem, 0.4), INK, 1.2);
      poly(g, [[52, 29], [56, 37], [48, 37]]);
      paint(g, c.cloth, null);
      line(g, 26, 14, 26, 78, INK, 6.4);
      line(g, 26, 14, 26, 78, WOOD.walnut, 4);
      circle(g, 26, 12, 5);
      paint(g, domeFill(g, 26, 12, 5, METAL.gold, 0.5), INK, 1.2);
      void r;
    },
  },
  {
    id: 'pottery', name: 'Pottery', cat: 'storage', sets: ['market', 'town', 'desert', 'temple', 'farm', 'crypt'], tags: ['pots', 'urns', 'amphora', 'vases', 'jars', 'clay', 'breakable'],
    w: 1, h: 1, c: { clay: '#b0663a', glaze: '#c98a52' },
    variants: [{ name: 'Terracotta', c: {} }, { name: 'Blue glaze', c: { clay: '#2f5d8a', glaze: '#5a8ab0' } }, { name: 'Grey stoneware', c: { clay: '#7a7670', glaze: '#9a968e' } }, { name: 'Smashed', c: {}, f: { broken: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.broken) {
        for (let i = 0; i < 12; i++) {
          const x = 14 + r() * 62, y = 14 + r() * 62, s = 9 + r() * 12;
          g.beginPath();
          g.moveTo(x, y);
          g.quadraticCurveTo(x + s * 0.6, y - s * 0.2, x + s, y + s * (r() * 0.4));
          g.lineTo(x + s * (0.3 + r() * 0.4), y + s);
          g.closePath();
          paint(g, litFill(g, x, y, s, s, i % 3 ? c.clay : c.glaze, 0.3), INK, 1.3);
        }
        speckle(g, 20, 20, 60, 60, r, 16, shade(c.clay, -0.3), 1.2);
        return;
      }
      // amphora on its side
      g.save();
      g.translate(60, 70);
      g.rotate(-0.5);
      ellipse(g, 0, 0, 22, 13);
      paint(g, litFill(g, -22, -13, 44, 26, c.clay, 0.35), INK, LW);
      rr(g, 20, -4, 12, 8, 2);
      paint(g, c.clay, INK, 1.2);
      line(g, -10, -12, -10, 12, alpha(shade(c.clay, -0.5), 0.5), 1.4);
      g.restore();
      for (const [x, y, rad, col] of [[34, 34, 20, c.clay], [70, 30, 14, c.glaze], [28, 70, 12, c.glaze]] as [number, number, number, string][]) {
        circle(g, x, y, rad);
        paint(g, domeFill(g, x, y, rad, col, 0.4), INK, LW * 0.9);
        circle(g, x, y, rad * 0.5);
        paint(g, shade(col, -0.25), INK, 1.1);
        circle(g, x, y, rad * 0.32);
        paint(g, '#1d1410', null);
        circle(g, x, y, rad * 0.78);
        stroke(g, alpha(shade(col, 0.4), 0.6), 1.2);
      }
    },
  },

  // ============ workshop and training ============
  {
    id: 'workbench', name: 'Workbench', cat: 'workshop', sets: ['town', 'castle', 'ship', 'mine', 'farm'], tags: ['carpenter', 'tools', 'craft', 'vise', 'woodwork'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.iron }, variants: WV.slice(0, 3),
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 6, 14, 188, 74, c.wood, r, 'h', 3, 3);
      speckle(g, 70, 24, 80, 50, r, 18, alpha(shade(c.wood, -0.5), 0.35), 1.4);
      // vise
      rr(g, 10, 40, 22, 26, 2);
      paint(g, litFill(g, 10, 40, 22, 26, c.metal, 0.4), INK, 1.4);
      line(g, 4, 53, 38, 53, INK, 3.6);
      line(g, 4, 53, 38, 53, shade(c.metal, 0.3), 1.8);
      // plank and shavings
      board(g, 44, 26, 80, 16, WOOD.pine, r);
      for (let i = 0; i < 5; i++) {
        g.beginPath();
        g.arc(132 + r() * 24, 30 + r() * 20, 3 + r() * 2, 0, Math.PI * 1.5);
        stroke(g, '#e3c896', 1.4);
      }
      // saw
      poly(g, [[60, 56], [124, 52], [124, 66], [60, 64]]);
      paint(g, litFill(g, 60, 52, 64, 14, '#cfd6dc', 0.4), INK, 1.1);
      for (let x = 62; x < 122; x += 4) line(g, x, 64, x + 2, 67, INK, 0.8);
      rr(g, 124, 50, 16, 18, 4);
      paint(g, '#8a5a32', INK, 1.1);
      // hammer and chisels
      line(g, 154, 76, 180, 50, INK, 4.6);
      line(g, 154, 76, 180, 50, '#8a6a44', 2.6);
      rr(g, 172, 42, 16, 9, 2);
      paint(g, litFill(g, 172, 42, 16, 9, c.metal, 0.4), INK, 1.1);
      for (const y of [24, 32]) { line(g, 156, y, 186, y, INK, 3.4); line(g, 156, y, 172, y, '#8a5a32', 2); line(g, 172, y, 186, y, '#cfd6dc', 2); }
    },
  },
  {
    id: 'sawhorse', name: 'Sawhorses', cat: 'workshop', sets: ['town', 'farm', 'castle', 'ship', 'camp'], tags: ['carpenter', 'sawing', 'lumber', 'trestle', 'construction'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.pine },
    variants: [{ name: 'Pine', c: {} }, { name: 'Oak', c: { wood: WOOD.oak } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      speckle(g, 70, 60, 60, 34, r, 30, '#e3c896', 1.6);
      for (const x of [44, 156]) {
        for (const [dx, dy] of [[-14, -38], [14, -38], [-14, 38], [14, 38]]) line(g, x, 50 + dy * 0.2, x + dx, 50 + dy, INK, 5);
        for (const [dx, dy] of [[-14, -38], [14, -38], [-14, 38], [14, 38]]) line(g, x, 50 + dy * 0.2, x + dx, 50 + dy, shade(c.wood, -0.2), 3);
        box(g, x - 6, 14, 12, 72, shade(c.wood, -0.05), 2, 1.6);
      }
      panel(g, 14, 38, 172, 24, shade(c.wood, 0.08), r, 'h', 1, 2);
      // saw resting across
      g.save();
      g.translate(110, 50);
      g.rotate(0.5);
      poly(g, [[-30, -5], [26, -7], [26, 7], [-30, 3]]);
      paint(g, litFill(g, -30, -7, 56, 14, '#cfd6dc', 0.4), INK, 1.1);
      rr(g, 26, -8, 14, 16, 4);
      paint(g, '#8a5a32', INK, 1.1);
      g.restore();
    },
  },
  {
    id: 'tool-wall', name: 'Tool wall', cat: 'workshop', sets: ['town', 'castle', 'farm', 'mine', 'ship'], tags: ['tools', 'carpenter', 'pegboard', 'hooks', 'shed'],
    w: 2, h: 1, c: { wood: WOOD.pine, metal: METAL.iron },
    variants: [{ name: 'Pine', c: {} }, { name: 'Dark', c: { wood: WOOD.walnut } }],
    desc: 'Tools hung against a wall (top edge).',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 4, 4, 192, 22, c.wood, r, 'h', 1, 2);
      for (let x = 14; x < 192; x += 12) { circle(g, x, 15, 1.4); g.fillStyle = INK; g.fill(); }
      // hanging tools, seen from above as they lie against the wall
      g.save();
      g.translate(26, 46);
      poly(g, [[-10, -18], [10, -18], [8, 22], [-8, 22]]);
      paint(g, litFill(g, -10, -18, 20, 40, '#cfd6dc', 0.4), INK, 1.1);
      rr(g, -8, -26, 16, 10, 3);
      paint(g, '#8a5a32', INK, 1);
      g.restore();
      line(g, 56, 20, 56, 66, INK, 4.6);
      line(g, 56, 20, 56, 66, '#8a6a44', 2.6);
      rr(g, 46, 58, 20, 12, 3);
      paint(g, litFill(g, 46, 58, 20, 12, c.metal, 0.4), INK, 1.1);
      for (const x of [80, 90, 100]) { line(g, x, 22, x, 56, INK, 3.4); line(g, x, 22, x, 40, '#8a5a32', 2); line(g, x, 40, x, 56, '#cfd6dc', 2); }
      for (let i = 0; i < 4; i++) { circle(g, 132, 46, 18 - i * 3.5); stroke(g, INK, 3.6); circle(g, 132, 46, 18 - i * 3.5); stroke(g, '#b48a4e', 2); }
      poly(g, [[160, 22], [186, 22], [186, 30], [168, 30], [168, 64], [160, 64]]);
      paint(g, litFill(g, 160, 22, 26, 42, c.metal, 0.35), INK, 1.1);
    },
  },
  {
    id: 'loom', name: 'Loom', cat: 'workshop', sets: ['town', 'farm', 'castle', 'market'], tags: ['weaving', 'cloth', 'textile', 'weaver', 'craft'],
    w: 2, h: 2, blocksMovement: true, c: { wood: WOOD.oak, cloth: CLOTH.red, thread: '#e6dcc6' },
    variants: [{ name: 'Red weave', c: {} }, { name: 'Blue weave', c: { cloth: CLOTH.blue } }, { name: 'Green weave', c: { cloth: CLOTH.green, wood: WOOD.pine } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const x of [14, 172]) box(g, x, 10, 14, 150, shade(c.wood, -0.1), 3, LW, 0.25);
      rr(g, 28, 30, 144, 104, 1);
      g.fillStyle = 'rgba(30,20,12,0.35)';
      g.fill();
      for (let i = 0; i < 36; i++) line(g, 30 + i * 4, 30, 30 + i * 4, 100, alpha(c.thread, 0.9), 0.9);
      // woven cloth, nearest to the weaver
      cloth(g, 28, 96, 144, 40, c.cloth, r, 5, 1);
      for (let y = 102; y < 134; y += 8) line(g, 28, y, 172, y, alpha(shade(c.cloth, 0.35), 0.6), 2);
      panel(g, 8, 20, 184, 14, c.wood, r, 'h', 1, 3);
      panel(g, 8, 132, 184, 14, c.wood, r, 'h', 1, 3);
      panel(g, 12, 68, 176, 8, shade(c.wood, 0.1), r, 'h', 1, 2, 1.6);
      // shuttle
      ellipse(g, 110, 86, 14, 4);
      paint(g, litFill(g, 96, 82, 28, 8, '#c4955a', 0.4), INK, 1.1);
      // bench
      panel(g, 50, 162, 100, 26, c.wood, r, 'h', 1, 4);
    },
  },
  {
    id: 'spinning-wheel', name: 'Spinning wheel', cat: 'workshop', sets: ['farm', 'town', 'castle', 'forest'], tags: ['spinning', 'wool', 'yarn', 'thread', 'cottage'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak, wool: '#ece6d6' },
    variants: [{ name: 'Oak', c: {} }, { name: 'Pine', c: { wood: WOOD.pine } }, { name: 'Golden thread', c: { wood: WOOD.walnut, wool: '#e9c86a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      poly(g, [[16, 78], [78, 62], [84, 72], [22, 88]]);
      paint(g, litFill(g, 16, 62, 68, 26, c.wood, 0.25), INK, LW);
      // wheel, seen at an angle
      ellipse(g, 38, 46, 26, 30, -0.25);
      stroke(g, INK, 7);
      ellipse(g, 38, 46, 26, 30, -0.25);
      stroke(g, c.wood, 4.4);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        line(g, 38, 46, 38 + Math.cos(a) * 24 * Math.cos(-0.25) - Math.sin(a) * 28 * Math.sin(-0.25), 46 + Math.cos(a) * 24 * Math.sin(-0.25) + Math.sin(a) * 28 * Math.cos(-0.25), shade(c.wood, -0.2), 1.6);
      }
      circle(g, 38, 46, 5);
      paint(g, domeFill(g, 38, 46, 5, c.wood, 0.5), INK, 1.2);
      // distaff with wool
      line(g, 74, 66, 74, 26, INK, 4.4);
      line(g, 74, 66, 74, 26, c.wood, 2.4);
      blob(g, lumpy(74, 24, 13, 0.4, 9, r, 11));
      paint(g, domeFill(g, 74, 24, 13, c.wool, 0.3), INK, 1.4);
      line(g, 74, 34, 46, 44, alpha(c.wool, 0.9), 1);
    },
  },
  {
    id: 'grindstone', name: 'Grindstone', cat: 'workshop', sets: ['town', 'castle', 'farm', 'camp', 'mine'], tags: ['sharpen', 'whetstone', 'blade', 'smith', 'mill'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak, stone: '#9a958a' },
    variants: [{ name: 'Sandstone', c: {} }, { name: 'Dark stone', c: { stone: STONE.dark } }, { name: 'Red stone', c: { stone: STONE.red } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      box(g, 14, 18, 12, 64, c.wood, 2, LW, 0.25);
      box(g, 74, 18, 12, 64, c.wood, 2, LW, 0.25);
      rr(g, 28, 64, 44, 18, 3);
      paint(g, shade(c.wood, -0.3), INK, 1.4);
      liquid(g, 50, 73, 18, 6, '#4f7a88', r);
      line(g, 8, 50, 92, 50, INK, 5);
      line(g, 8, 50, 92, 50, '#6c6f73', 3);
      rr(g, 36, 16, 28, 68, 6);
      const gr = g.createLinearGradient(36, 0, 64, 0);
      gr.addColorStop(0, shade(c.stone, -0.25));
      gr.addColorStop(0.35, shade(c.stone, 0.25));
      gr.addColorStop(1, shade(c.stone, -0.45));
      paint(g, gr, INK, LW);
      speckle(g, 38, 18, 24, 64, r, 18, alpha(shade(c.stone, -0.5), 0.5), 1);
      // crank
      line(g, 92, 50, 92, 66, INK, 4.6);
      line(g, 92, 50, 92, 66, '#6c6f73', 2.6);
      circle(g, 92, 68, 4);
      paint(g, '#8a5a32', INK, 1.1);
    },
  },
  {
    id: 'weapon-barrel', name: 'Barrel of weapons', cat: 'storage', sets: ['castle', 'camp', 'dungeon', 'ship', 'town'], tags: ['armory', 'swords', 'spears', 'arms', 'barracks'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.iron },
    variants: [{ name: 'Iron arms', c: {} }, { name: 'Bronze arms', c: { metal: METAL.bronze } }, { name: 'Practice staves', c: { metal: '#c4955a' }, f: { staves: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      circle(g, 50, 50, 40);
      paint(g, domeFill(g, 50, 50, 40, c.wood, 0.25), INK, LW * 1.1);
      circle(g, 50, 50, 37);
      stroke(g, INK, 6);
      circle(g, 50, 50, 37);
      stroke(g, shade(METAL.iron, 0.15), 3.6);
      circle(g, 50, 50, 31);
      paint(g, '#1e140d', INK, 1.4);
      const pts = [[38, 36], [60, 34], [48, 52], [32, 58], [64, 56], [52, 70], [70, 44]];
      pts.forEach(([x, y], i) => {
        if (f.staves) {
          circle(g, x, y, 5.5);
          paint(g, domeFill(g, x, y, 5.5, c.metal, 0.4), INK, 1.2);
          return;
        }
        const a = r() * Math.PI;
        if (i % 3 === 1) {
          poly(g, [[x + Math.cos(a) * 8, y + Math.sin(a) * 8], [x + Math.cos(a + 1.8) * 4, y + Math.sin(a + 1.8) * 4], [x - Math.cos(a) * 8, y - Math.sin(a) * 8], [x + Math.cos(a - 1.4) * 4, y + Math.sin(a - 1.4) * 4]]);
          paint(g, litFill(g, x - 8, y - 8, 16, 16, mix(c.metal, '#dfe4e8', 0.3), 0.4), INK, 1);
        } else {
          line(g, x - Math.cos(a) * 9, y - Math.sin(a) * 9, x + Math.cos(a) * 9, y + Math.sin(a) * 9, INK, 4.4);
          line(g, x - Math.cos(a) * 9, y - Math.sin(a) * 9, x + Math.cos(a) * 9, y + Math.sin(a) * 9, c.metal, 2.4);
          circle(g, x, y, 4);
          paint(g, domeFill(g, x, y, 4, '#5a3a20', 0.4), INK, 1);
        }
      });
    },
  },
  {
    id: 'armor-stand', name: 'Armour stand', cat: 'decor', sets: ['castle', 'dungeon', 'town', 'camp', 'crypt'], tags: ['armor', 'armour', 'plate', 'helmet', 'mannequin', 'armory'],
    w: 1, h: 1, blocksMovement: true, c: { metal: '#9aa0a6', trim: METAL.brass, plume: CLOTH.red },
    variants: [{ name: 'Steel plate', c: {} }, { name: 'Gilded', c: { metal: METAL.gold, trim: METAL.silver, plume: CLOTH.blue } }, { name: 'Black iron', c: { metal: '#3d4146', trim: METAL.rust, plume: '#2b2b30' } }, { name: 'Leather', c: { metal: '#7a5638', trim: METAL.iron, plume: CLOTH.green } }],
    draw: ({ g, c }) => {
      line(g, 18, 82, 82, 82, INK, 6);
      line(g, 18, 82, 82, 82, WOOD.walnut, 4);
      // shoulders and breastplate
      for (const x of [22, 78]) {
        ellipse(g, x, 48, 15, 17);
        paint(g, domeFill(g, x, 48, 17, c.metal, 0.45), INK, LW);
        ellipse(g, x, 48, 9, 11);
        stroke(g, alpha(c.trim, 0.9), 1.6);
      }
      rr(g, 26, 34, 48, 40, 14);
      paint(g, domeFill(g, 50, 52, 30, c.metal, 0.45), INK, LW);
      line(g, 50, 40, 50, 70, alpha(shade(c.metal, -0.5), 0.6), 1.4);
      // helmet with plume
      circle(g, 50, 40, 16);
      paint(g, domeFill(g, 50, 40, 16, c.metal, 0.5), INK, LW);
      rr(g, 46, 22, 8, 30, 4);
      paint(g, litFill(g, 46, 22, 8, 30, c.plume, 0.35), INK, 1.2);
      rr(g, 40, 50, 20, 4, 1.5);
      paint(g, '#1b1410', null);
    },
  },
  {
    id: 'training-dummy', name: 'Training dummy', cat: 'decor', sets: ['castle', 'camp', 'town', 'farm'], tags: ['practice', 'target', 'combat', 'barracks', 'straw'],
    w: 1, h: 1, c: { straw: '#d9bf6a', sack: SACK, wood: WOOD.oak },
    variants: [{ name: 'Straw', c: {} }, { name: 'Battered', c: { straw: '#b3a275', sack: '#8a7a5a' }, f: { hits: 1 } }, { name: 'With shield', c: {}, f: { shield: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      line(g, 12, 50, 88, 50, INK, 8);
      line(g, 12, 50, 88, 50, c.wood, 5.6);
      for (const x of [12, 88]) {
        for (let i = 0; i < 5; i++) line(g, x, 50, x + (x < 50 ? -1 : 1) * (4 + r() * 6), 50 + (r() - 0.5) * 14, c.straw, 1.4);
      }
      blob(g, lumpy(50, 56, 30, 0.15, 10, r, 24));
      paint(g, domeFill(g, 50, 56, 30, c.sack, 0.3), INK, LW);
      line(g, 26, 60, 74, 60, '#6e5130', 3);
      circle(g, 50, 44, 18);
      paint(g, domeFill(g, 50, 44, 18, c.sack, 0.35), INK, LW);
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2; line(g, 50 + Math.cos(a) * 14, 44 + Math.sin(a) * 14, 50 + Math.cos(a) * 24, 44 + Math.sin(a) * 24, c.straw, 1.6); }
      line(g, 43, 37, 57, 51, '#8e2f25', 3);
      line(g, 57, 37, 43, 51, '#8e2f25', 3);
      if (f.hits) for (let i = 0; i < 4; i++) { const x = 38 + r() * 24, y = 54 + r() * 14; line(g, x - 4, y, x + 4, y + 2, '#5a3a20', 1.6); }
      if (f.shield) {
        circle(g, 80, 66, 13);
        paint(g, domeFill(g, 80, 66, 13, '#7a2a22', 0.35), INK, LW);
        rivet(g, 80, 66, 4, METAL.iron);
      }
    },
  },
  {
    id: 'archery-target', name: 'Archery target', cat: 'decor', sets: ['castle', 'camp', 'town', 'forest', 'farm'], tags: ['archery', 'bow', 'arrows', 'practice', 'butt', 'range'],
    w: 1, h: 1, c: { a: '#efe6d2', b: '#2f5d8a', ring: '#a3312c', mid: '#e9b949' },
    variants: [{ name: 'Painted', c: {} }, { name: 'Faded', c: { a: '#d9cfb8', b: '#6a7a8a', ring: '#8a5a4a', mid: '#c9b06a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const [x1, x2] of [[30, 16], [70, 84]]) { line(g, x1, 50, x2, 92, INK, 6); line(g, x1, 50, x2, 92, WOOD.oak, 4); }
      circle(g, 50, 48, 38);
      paint(g, domeFill(g, 50, 48, 38, '#c9a85a', 0.3), INK, LW);
      g.save();
      circle(g, 50, 48, 38);
      g.clip();
      for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; line(g, 50 + Math.cos(a) * 30, 48 + Math.sin(a) * 30, 50 + Math.cos(a) * 40, 48 + Math.sin(a) * 40, alpha('#8a6a3a', 0.6), 1); }
      g.restore();
      for (const [rad, col] of [[31, c.a], [24, c.b], [17, c.ring], [9, c.mid]] as [number, string][]) {
        circle(g, 50, 48, rad);
        paint(g, col, alpha(INK, 0.7), 1);
      }
      for (let i = 0; i < 3; i++) {
        const x = 40 + r() * 22, y = 38 + r() * 20, a = -2.4 + r() * 0.6;
        line(g, x, y, x + Math.cos(a) * 16, y + Math.sin(a) * 16, INK, 2.6);
        line(g, x, y, x + Math.cos(a) * 16, y + Math.sin(a) * 16, '#c4955a', 1.4);
        poly(g, [[x + Math.cos(a) * 14, y + Math.sin(a) * 14], [x + Math.cos(a + 0.3) * 20, y + Math.sin(a + 0.3) * 20], [x + Math.cos(a - 0.3) * 20, y + Math.sin(a - 0.3) * 20]]);
        paint(g, '#f2ecdc', INK, 0.8);
      }
    },
  },
  {
    id: 'tool-crate', name: 'Crate of tools', cat: 'workshop', sets: ['mine', 'town', 'ship', 'castle', 'farm', 'camp'], tags: ['tools', 'pickaxe', 'hammer', 'supplies', 'crate'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.pine, metal: '#7d8186' },
    variants: [{ name: 'Pine', c: {} }, { name: 'Oak', c: { wood: WOOD.oak } }, { name: 'Mining gear', c: { wood: '#7a6a52' }, f: { mine: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      openCrate(g, 10, 14, 80, 72, c.wood, r, (ix, iy, iw, ih) => {
        g.fillStyle = '#3a2a1c';
        g.fillRect(ix, iy, iw, ih);
        speckle(g, ix, iy, iw, ih, r, 10, '#8a8d92', 1);
        // pick or hammer
        line(g, ix + 6, iy + ih - 6, ix + iw - 10, iy + 10, INK, 5);
        line(g, ix + 6, iy + ih - 6, ix + iw - 10, iy + 10, '#8a6a44', 3);
        if (f.mine) {
          g.beginPath();
          g.moveTo(ix + iw - 28, iy + 4);
          g.quadraticCurveTo(ix + iw - 8, iy + 2, ix + iw - 2, iy + 22);
          stroke(g, INK, 6);
          g.beginPath();
          g.moveTo(ix + iw - 28, iy + 4);
          g.quadraticCurveTo(ix + iw - 8, iy + 2, ix + iw - 2, iy + 22);
          stroke(g, c.metal, 3.6);
          circle(g, ix + 14, iy + 14, 8);
          paint(g, domeFill(g, ix + 14, iy + 14, 8, '#c9a24a', 0.45), INK, 1.2);
          flame(g, ix + 14, iy + 14, 3, r);
        } else {
          rr(g, ix + iw - 18, iy + 4, 12, 9, 2);
          paint(g, litFill(g, ix + iw - 18, iy + 4, 12, 9, c.metal, 0.4), INK, 1);
          line(g, ix + 8, iy + 10, ix + 30, iy + 18, INK, 3.6);
          line(g, ix + 8, iy + 10, ix + 30, iy + 18, c.metal, 2);
          line(g, ix + iw - 8, iy + ih - 12, ix + iw - 30, iy + ih - 6, INK, 3.6);
          line(g, ix + iw - 8, iy + ih - 12, ix + iw - 30, iy + ih - 6, c.metal, 2);
        }
      });
    },
  },
  {
    id: 'cobbler-bench', name: 'Cobbler bench', cat: 'workshop', sets: ['town', 'market'], tags: ['shoes', 'boots', 'leather', 'cobbler', 'craft'],
    w: 2, h: 1, blocksMovement: true, c: { wood: WOOD.oak, leather: '#8a5a32' },
    variants: [{ name: 'Brown leather', c: {} }, { name: 'Black leather', c: { leather: '#2b2b30' } }, { name: 'Red leather', c: { leather: '#7a2420', wood: WOOD.walnut } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 6, 22, 188, 56, c.wood, r, 'h', 2, 4);
      // iron last
      blob(g, [[30, 36], [44, 32], [50, 50], [44, 66], [32, 66], [28, 50]]);
      paint(g, litFill(g, 26, 32, 26, 34, '#5d6166', 0.4), INK, 1.4);
      // a pair of boots
      for (const x of [74, 96]) {
        blob(g, [[x - 6, 36], [x + 6, 34], [x + 8, 52], [x + 4, 68], [x - 6, 68], [x - 8, 50]]);
        paint(g, litFill(g, x - 8, 34, 16, 34, c.leather, 0.35), INK, 1.4);
        ellipse(g, x, 42, 4.5, 6);
        paint(g, shade(c.leather, -0.5), null);
      }
      // hide offcut and tools
      blob(g, lumpy(146, 46, 22, 0.35, 9, r, 15));
      paint(g, litFill(g, 124, 30, 44, 32, shade(c.leather, 0.15), 0.25), INK, 1.4);
      line(g, 120, 68, 140, 64, INK, 3.4);
      line(g, 120, 68, 130, 66, '#8a6a44', 2);
      line(g, 130, 66, 140, 64, '#cfd6dc', 1.4);
      circle(g, 178, 64, 8);
      paint(g, domeFill(g, 178, 64, 8, '#9aa0a6', 0.4), INK, 1.1);
      speckle(g, 172, 58, 12, 12, r, 6, '#3d4146', 1);
    },
  },
  {
    id: 'apothecary-counter', name: 'Apothecary counter', cat: 'arcane', sets: ['market', 'town', 'wizard', 'temple', 'swamp'], tags: ['herbalist', 'alchemy', 'mortar', 'herbs', 'healer', 'potions', 'shop'],
    w: 3, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.brass },
    variants: WV.slice(0, 3),
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 4, 18, 292, 66, c.wood, r, 'h', 3, 4);
      const cols = ['#7a9a4a', '#c0392b', '#e0b23a', '#5a3a6a', '#2fa3d6', '#d9d2c3'];
      for (let i = 0; i < 9; i++) jar(g, 22 + i * 14, 30, 6, cols[i % cols.length], '#6b4a2b');
      // mortar and pestle
      circle(g, 170, 50, 14);
      paint(g, domeFill(g, 170, 50, 14, '#a8a49a', 0.35), INK, 1.4);
      circle(g, 170, 50, 9);
      paint(g, '#5a7a3a', INK, 1);
      line(g, 168, 50, 190, 36, INK, 5);
      line(g, 168, 50, 190, 36, '#c9c4b8', 3);
      // herb bundles
      for (const [x, y] of [[40, 64], [70, 66]]) {
        for (let i = 0; i < 7; i++) line(g, x, y, x + 18 + r() * 6, y - 8 + r() * 16, '#4f7a34', 1.8);
        line(g, x + 2, y - 3, x + 2, y + 3, '#8a5a32', 3);
      }
      // scale and book
      line(g, 214, 44, 254, 44, INK, 3);
      line(g, 214, 44, 254, 44, c.metal, 1.6);
      for (const x of [214, 254]) { circle(g, x, 44, 7); paint(g, domeFill(g, x, 44, 7, c.metal, 0.45), INK, 1.1); }
      book(g, 210, 58, 30, 20, '#3e5e34', 0.05);
      bottle(g, 120, 62, 6, '#a45ad6');
      bottle(g, 136, 66, 5, '#3fbf6a');
      bottle(g, 270, 40, 6, '#d6304a');
      scroll(g, 256, 60, 28, 10, -0.15);
    },
  },
  {
    id: 'merchant-cart', name: 'Merchant wagon', cat: 'vehicle', sets: ['market', 'town', 'camp', 'farm'], tags: ['wagon', 'caravan', 'covered wagon', 'trader', 'peddler'],
    w: 2, h: 3, blocksMovement: true, blocksSight: true, c: { wood: WOOD.oak, canvas: '#e6dcc6' },
    variants: [{ name: 'White canvas', c: {} }, { name: 'Red canvas', c: { canvas: '#a3312c' } }, { name: 'Green canvas', c: { canvas: '#4f6b3a' } }, { name: 'Striped', c: { canvas: '#2f5d8a' }, f: { stripe: 1 } }],
    desc: 'Covered at the back, goods and driver bench at the front (bottom).',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      // tongue
      line(g, 100, 250, 100, 296, INK, 8);
      line(g, 100, 250, 100, 296, shade(c.wood, -0.1), 5.4);
      line(g, 80, 288, 120, 288, INK, 6);
      line(g, 80, 288, 120, 288, shade(c.wood, -0.1), 3.6);
      for (const y of [50, 186]) for (const x of [12, 172]) {
        rr(g, x, y, 16, 60, 5);
        paint(g, litFill(g, x, y, 16, 60, shade(c.wood, -0.3), 0.3), INK, LW);
        line(g, x + 8, y + 2, x + 8, y + 58, '#5d6166', 2.6);
      }
      panel(g, 26, 14, 148, 238, c.wood, r, 'v', 6, 5);
      // goods at the front
      crateTop(g, 36, 152, 50, 46, WOOD.pine, r);
      for (const [x, y] of [[132, 172]]) {
        circle(g, x, y, 22);
        paint(g, domeFill(g, x, y, 22, WOOD.oak, 0.25), INK, LW);
        circle(g, x, y, 19);
        stroke(g, INK, 4);
        circle(g, x, y, 19);
        stroke(g, '#7d8186', 2.4);
      }
      sackLying(g, 70, 212, 60, 28, 0.1, SACK, r);
      sackLying(g, 136, 210, 50, 26, -0.2, '#cbb98e', r);
      panel(g, 30, 232, 140, 16, shade(c.wood, -0.1), r, 'h', 1, 3);
      // canvas cover
      rr(g, 20, 8, 160, 136, 14);
      const gr = g.createLinearGradient(20, 0, 180, 0);
      gr.addColorStop(0, shade(c.canvas, -0.2));
      gr.addColorStop(0.35, shade(c.canvas, 0.2));
      gr.addColorStop(1, shade(c.canvas, -0.35));
      paint(g, gr, INK, LW);
      g.save();
      rr(g, 20, 8, 160, 136, 14);
      g.clip();
      if (f.stripe) for (let x = 20; x < 180; x += 32) { g.fillStyle = alpha('#efe6d2', 0.85); g.fillRect(x, 8, 16, 136); }
      for (const y of [30, 62, 94, 126]) line(g, 20, y, 180, y, alpha(shade(c.canvas, -0.6), 0.55), 2.4);
      g.restore();
      rr(g, 20, 8, 160, 136, 14);
      stroke(g, INK, LW);
    },
  },
  {
    id: 'produce-stall', name: 'Fruit and veg stall', cat: 'furniture', sets: ['market', 'town', 'farm'], tags: ['grocer', 'fruit', 'vegetables', 'greengrocer', 'shop', 'food'],
    w: 2, h: 2, blocksMovement: true, c: { wood: WOOD.pine, cloth: CLOTH.green },
    variants: [{ name: 'Green cloth', c: {} }, { name: 'Red cloth', c: { cloth: CLOTH.red } }, { name: 'Blue cloth', c: { cloth: CLOTH.blue } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      panel(g, 6, 14, 188, 92, c.wood, r, 'h', 4, 4);
      cloth(g, 6, 92, 188, 18, c.cloth, r, 8, 2);
      const fill = (col: string) => (ix: number, iy: number, iw: number, ih: number) => {
        for (let i = 0; i < 9; i++) fruit(g, ix + 7 + (i % 3) * (iw - 14) / 2 + (r() - 0.5) * 3, iy + 7 + Math.floor(i / 3) * (ih - 14) / 2 + (r() - 0.5) * 3, 6.5, shade(col, (r() - 0.5) * 0.25));
      };
      openCrate(g, 14, 22, 52, 44, WOOD.pine, r, fill('#c0392b'));
      openCrate(g, 74, 20, 52, 46, shade(WOOD.pine, -0.08), r, fill('#e0782a'));
      openCrate(g, 134, 22, 52, 44, WOOD.pine, r, fill('#e9d24a'));
      // cabbages and squash on the cloth front
      for (let i = 0; i < 5; i++) {
        circle(g, 30 + i * 18, 84, 8);
        paint(g, domeFill(g, 30 + i * 18, 84, 8, '#7ab04a', 0.4), INK, 1.1);
      }
      for (let i = 0; i < 3; i++) {
        ellipse(g, 132 + i * 22, 82, 10, 7);
        paint(g, domeFill(g, 132 + i * 22, 82, 10, '#d9822a', 0.4), INK, 1.1);
      }
      basket(g, 40, 150, 24, '#7a3a6a', r);
      basket(g, 100, 160, 20, '#b8c04a', r);
      sackUp(g, 158, 150, 24, SACK, r);
    },
  },
  {
    id: 'rope-coil', name: 'Coil of rope', cat: 'decor', sets: ['ship', 'camp', 'mine', 'town', 'dungeon'], tags: ['rope', 'hawser', 'line', 'dock', 'climbing'],
    w: 1, h: 1, flat: true, c: { rope: '#c9a86a' },
    variants: [{ name: 'Hemp', c: {} }, { name: 'Tarred', c: { rope: '#5a4a32' } }, { name: 'Silk', c: { rope: '#e6dcc6' } }],
    draw: ({ g, c }) => {
      const pts: number[][] = [];
      for (let t = 0; t < Math.PI * 2 * 4.2; t += 0.3) {
        const rad = 6 + t * 1.18;
        pts.push([50 + Math.cos(t) * rad, 50 + Math.sin(t) * rad]);
      }
      pts.push([92, 72], [96, 90]);
      const path = () => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      };
      path();
      stroke(g, INK, 9.4);
      path();
      stroke(g, c.rope, 6.6);
      path();
      g.setLineDash([2, 3]);
      stroke(g, alpha(shade(c.rope, -0.45), 0.8), 6);
      g.setLineDash([]);
      path();
      stroke(g, alpha(shade(c.rope, 0.35), 0.6), 1.4);
    },
  },
];

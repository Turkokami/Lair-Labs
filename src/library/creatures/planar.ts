// Planar and big-folk creature tokens: giants, fiends, celestials, elementals, constructs, oozes, plants and aberrations.
// Original art drawn with the Canvas 2D API. Front-facing busts in a 100 x 100 box, clipped to a circle by the renderer.
// Light from the top-left, ink outlines, bold shapes and clear eyes so each one reads at 40 px on a phone.
import type { CreatureDef, G } from '../art/types';
import { rng, blob, paint, domeFill, litFill, ellipse, circle, poly, shade, mix, alpha, glow, flame, lumpy, line, gem, INK, LW } from '../art/kit';

// ======================================================================================
// helpers (local to this file)
// ======================================================================================
const SIDES = [-1, 1];
type EyeOpts = { rot?: number; white?: string | null; pupil?: 'round' | 'slit' | 'none' | 'wide'; glow?: string; lw?: number };

/** Shoulders / chest at the bottom of the token. */
function shoulders(g: G, col: string, y = 68, spread = 1) {
  blob(g, [[50 - 56 * spread, 112], [50 - 50 * spread, y + 14], [50 - 24 * spread, y], [50 + 24 * spread, y], [50 + 50 * spread, y + 14], [50 + 56 * spread, 112]]);
  paint(g, domeFill(g, 44, y + 20, 56, col, 0.25), INK, LW);
}

/** A head outline. Returns the points so callers can clip to it. */
function headPts(o: { top?: number; chin?: number; w?: number; jaw?: number; cx?: number; mid?: number } = {}) {
  const top = o.top ?? 16, chin = o.chin ?? 80, w = o.w ?? 28, jaw = o.jaw ?? 0.7, cx = o.cx ?? 50;
  const my = o.mid ?? (top + chin) / 2 - 4;
  return [[cx, top - 2], [cx + w * 0.82, top + 3], [cx + w * 1.08, my], [cx + w * jaw * 1.08, chin - 8], [cx, chin + 3], [cx - w * jaw * 1.08, chin - 8], [cx - w * 1.08, my], [cx - w * 0.82, top + 3]];
}
function head(g: G, col: string, o: { top?: number; chin?: number; w?: number; jaw?: number; cx?: number; mid?: number } = {}, strength = 0.3) {
  const pts = headPts(o);
  const top = o.top ?? 16, chin = o.chin ?? 80, w = o.w ?? 28;
  blob(g, pts);
  paint(g, domeFill(g, (o.cx ?? 50) - 4, (top + chin) / 2 - 6, w * 1.45, col, strength), INK, LW);
  return pts;
}

function eye(g: G, x: number, y: number, rx: number, ry: number, iris: string, o: EyeOpts = {}) {
  const rot = o.rot ?? 0;
  if (o.glow) glow(g, x, y, Math.max(rx, ry) * 3.2, o.glow, 0.7);
  ellipse(g, x, y, rx, ry, rot);
  const white = o.white === undefined ? '#f4efe2' : o.white;
  paint(g, white ?? iris, INK, o.lw ?? 1.3);
  const r = Math.min(rx, ry);
  if (white) {
    g.save();
    ellipse(g, x, y, rx, ry, rot);
    g.clip();
    circle(g, x, y, r * 0.95);
    g.fillStyle = iris;
    g.fill();
    g.restore();
  }
  const p = o.pupil ?? 'round';
  if (p === 'round' || p === 'wide') {
    circle(g, x, y, r * (p === 'wide' ? 0.7 : 0.45));
    g.fillStyle = '#120c0a';
    g.fill();
  } else if (p === 'slit') {
    ellipse(g, x, y, r * 0.22, ry * 0.85);
    g.fillStyle = '#120c0a';
    g.fill();
  }
  circle(g, x - rx * 0.32, y - ry * 0.32, Math.max(0.6, r * 0.28));
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.fill();
}
function eyes(g: G, cx: number, y: number, dx: number, rx: number, ry: number, iris: string, o: EyeOpts = {}) {
  for (const s of SIDES) eye(g, cx + s * dx, y, rx, ry, iris, { ...o, rot: (o.rot ?? 0) * s });
}
/** Heavy brows. tilt > 0 = angry (inner end low). */
function brows(g: G, cx: number, y: number, dx: number, len: number, tilt: number, col: string, lw = 3.4) {
  for (const s of SIDES) {
    g.beginPath();
    g.moveTo(cx + s * (dx + len), y - tilt);
    g.quadraticCurveTo(cx + s * dx, y - tilt - 1.5, cx + s * (dx - len * 0.75), y + tilt);
    g.strokeStyle = INK;
    g.lineWidth = lw + 1.6;
    g.lineCap = 'round';
    g.stroke();
    g.strokeStyle = col;
    g.lineWidth = lw;
    g.stroke();
  }
}
/** A shadowed brow ridge (for brutes): a dark band above the eyes. */
function browRidge(g: G, cx: number, y: number, hw: number, col: string) {
  g.beginPath();
  g.moveTo(cx - hw, y + 2);
  g.quadraticCurveTo(cx - hw * 0.5, y - 5, cx, y + 1.5);
  g.quadraticCurveTo(cx + hw * 0.5, y - 5, cx + hw, y + 2);
  g.quadraticCurveTo(cx, y - 2, cx - hw, y + 2);
  paint(g, shade(col, -0.25), INK, 1.4);
}
function nose(g: G, x: number, y: number, kind: 'big' | 'hook' | 'flat' | 'pig' | 'small' | 'broad', col: string) {
  g.lineWidth = 1.3;
  if (kind === 'big') {
    blob(g, [[x, y - 12], [x + 5, y - 2], [x + 8, y + 4], [x, y + 7], [x - 8, y + 4], [x - 5, y - 2]]);
    paint(g, domeFill(g, x - 1, y, 9, col, 0.3), INK, 1.4);
    for (const s of SIDES) { ellipse(g, x + s * 3.2, y + 3.6, 1.6, 1.1); g.fillStyle = '#2a1712'; g.fill(); }
  } else if (kind === 'broad') {
    blob(g, [[x, y - 9], [x + 4, y - 1], [x + 9, y + 4], [x, y + 6], [x - 9, y + 4], [x - 4, y - 1]]);
    paint(g, domeFill(g, x - 1, y, 9, col, 0.25), INK, 1.3);
    for (const s of SIDES) { ellipse(g, x + s * 4, y + 3.5, 1.8, 1.1); g.fillStyle = '#2a1712'; g.fill(); }
  } else if (kind === 'hook') {
    g.beginPath();
    g.moveTo(x - 2, y - 14);
    g.quadraticCurveTo(x + 6, y - 4, x + 3, y + 8);
    g.quadraticCurveTo(x, y + 11, x - 4, y + 6);
    g.quadraticCurveTo(x - 1, y + 2, x - 2, y - 14);
    paint(g, domeFill(g, x, y, 10, col, 0.3), INK, 1.3);
  } else if (kind === 'pig') {
    ellipse(g, x, y, 8, 6);
    paint(g, domeFill(g, x, y, 8, col, 0.3), INK, 1.4);
    for (const s of SIDES) { ellipse(g, x + s * 3, y + 0.5, 1.6, 2.4); g.fillStyle = '#2a1712'; g.fill(); }
  } else if (kind === 'flat') {
    for (const s of SIDES) { ellipse(g, x + s * 2.6, y, 1.4, 1); g.fillStyle = '#2a1712'; g.fill(); }
  } else {
    g.beginPath();
    g.moveTo(x - 1, y - 8);
    g.quadraticCurveTo(x + 3, y, x + 2, y + 3);
    g.quadraticCurveTo(x, y + 4.5, x - 2.5, y + 3);
    g.strokeStyle = alpha(INK, 0.75);
    g.stroke();
  }
}
/** A dark mouth opening with optional top/bottom teeth and fangs. */
function openMouth(g: G, cx: number, y: number, hw: number, h: number, o: { top?: number; bottom?: number; fangs?: number; tongue?: string; inside?: string; smile?: number } = {}) {
  const sm = o.smile ?? 0;
  g.beginPath();
  g.moveTo(cx - hw, y - sm);
  g.quadraticCurveTo(cx, y - 2, cx + hw, y - sm);
  g.quadraticCurveTo(cx + hw * 0.6, y + h, cx, y + h);
  g.quadraticCurveTo(cx - hw * 0.6, y + h, cx - hw, y - sm);
  g.closePath();
  paint(g, o.inside ?? '#3a1210', INK, 1.5);
  g.save();
  g.clip();
  if (o.tongue) { ellipse(g, cx, y + h, hw * 0.55, h * 0.45); g.fillStyle = o.tongue; g.fill(); }
  g.fillStyle = '#f1ead6';
  const row = (n: number, yy: number, dir: number, size: number) => {
    for (let i = 0; i < n; i++) {
      const x0 = cx - hw + ((i + 0.5) / n) * hw * 2;
      g.beginPath();
      g.moveTo(x0 - (hw / n) * 0.9, yy);
      g.lineTo(x0, yy + dir * size);
      g.lineTo(x0 + (hw / n) * 0.9, yy);
      g.fill();
    }
  };
  if (o.top) row(o.top, y - 3, 1, h * 0.38);
  if (o.bottom) row(o.bottom, y + h + 1, -1, h * 0.38);
  g.restore();
  if (o.fangs) for (const s of SIDES) {
    poly(g, [[cx + s * hw * 0.55 - 1.6, y - 0.5], [cx + s * hw * 0.5, y + o.fangs], [cx + s * hw * 0.55 + 1.6, y - 0.5]]);
    paint(g, '#f4eedc', INK, 0.9);
  }
}
/** A plain mouth line. curve > 0 smiles, < 0 frowns. */
function mouthLine(g: G, cx: number, y: number, hw: number, curve: number, lw = 1.6) {
  g.beginPath();
  g.moveTo(cx - hw, y - curve * 0.4);
  g.quadraticCurveTo(cx, y + curve, cx + hw, y - curve * 0.4);
  g.strokeStyle = INK;
  g.lineWidth = lw;
  g.lineCap = 'round';
  g.stroke();
}
/** An upward tusk from the lower jaw. */
function tusk(g: G, x: number, y: number, len: number, s: number, col = '#efe4c4', wd = 3) {
  g.beginPath();
  g.moveTo(x - wd, y);
  g.quadraticCurveTo(x - wd * 0.6 + s * 1, y - len * 0.6, x + s * len * 0.28, y - len);
  g.quadraticCurveTo(x + wd * 0.8 + s * 2, y - len * 0.5, x + wd, y);
  g.closePath();
  paint(g, litFill(g, x - wd, y - len, wd * 2, len, col, 0.25), INK, 1.2);
}
/** A horn from base (bx,by) through control (qx,qy) to tip (tx,ty), base width w. ridges = cross lines. */
function horn(g: G, bx: number, by: number, qx: number, qy: number, tx: number, ty: number, w: number, col: string, ridges = 0) {
  const dx = qx - bx, dy = qy - by, l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l, ny = dx / l;
  g.beginPath();
  g.moveTo(bx + nx * w / 2, by + ny * w / 2);
  g.quadraticCurveTo(qx + nx * w * 0.32, qy + ny * w * 0.32, tx, ty);
  g.quadraticCurveTo(qx - nx * w * 0.32, qy - ny * w * 0.32, bx - nx * w / 2, by - ny * w / 2);
  g.closePath();
  paint(g, litFill(g, Math.min(bx, tx) - w, Math.min(by, ty) - w, Math.abs(tx - bx) + w * 2, Math.abs(ty - by) + w * 2, col, 0.3), INK, 1.5);
  if (ridges) {
    g.strokeStyle = alpha(shade(col, -0.55), 0.7);
    g.lineWidth = 1;
    for (let i = 1; i <= ridges; i++) {
      const t = (i / (ridges + 1)) * 0.8, u = 1 - t;
      const px = u * u * bx + 2 * u * t * qx + t * t * tx, py = u * u * by + 2 * u * t * qy + t * t * ty;
      const tdx = 2 * u * (qx - bx) + 2 * t * (tx - qx), tdy = 2 * u * (qy - by) + 2 * t * (ty - qy), tl = Math.hypot(tdx, tdy) || 1;
      const k = (w / 2) * (1 - t * 0.8);
      g.beginPath();
      g.moveTo(px - (tdy / tl) * k, py + (tdx / tl) * k);
      g.lineTo(px + (tdy / tl) * k, py - (tdx / tl) * k);
      g.stroke();
    }
  }
}
function ears(g: G, cx: number, y: number, dx: number, kind: 'round' | 'point' | 'long' | 'bat', col: string, size = 1) {
  for (const s of SIDES) {
    const x = cx + s * dx;
    if (kind === 'round') {
      ellipse(g, x, y, 6 * size, 9 * size, s * 0.2);
      paint(g, domeFill(g, x, y, 9 * size, col, 0.25), INK, LW * 0.8);
      ellipse(g, x + s * 0.5, y, 3 * size, 5 * size, s * 0.2);
      g.fillStyle = alpha(shade(col, -0.45), 0.7);
      g.fill();
    } else if (kind === 'point') {
      poly(g, [[x - s * 4, y - 6 * size], [x + s * 14 * size, y - 12 * size], [x - s * 2, y + 7 * size]]);
      paint(g, domeFill(g, x, y, 12 * size, col, 0.25), INK, LW * 0.8);
    } else if (kind === 'long') {
      blob(g, [[x - s * 4, y - 6], [x + s * 26 * size, y - 16 * size], [x + s * 10 * size, y + 2], [x - s * 2, y + 8]]);
      paint(g, domeFill(g, x, y, 16 * size, col, 0.25), INK, LW * 0.8);
    } else {
      poly(g, [[x - s * 3, y - 2], [x + s * 10 * size, y - 20 * size], [x + s * 13 * size, y - 4 * size], [x + s * 4, y + 8]]);
      paint(g, domeFill(g, x, y - 6, 16 * size, col, 0.25), INK, LW * 0.8);
      poly(g, [[x + s * 1, y - 1], [x + s * 9 * size, y - 15 * size], [x + s * 9 * size, y - 3 * size]]);
      g.fillStyle = alpha(shade(col, -0.5), 0.6);
      g.fill();
    }
  }
}
/** Leathery bat wings behind the shoulders. */
function batWings(g: G, col: string, y = 56, span = 1, rise = 0) {
  for (const s of SIDES) {
    const X = (k: number) => 50 + s * k * span;
    const pts = [[X(18), y + 10], [X(30), y - 30 - rise], [X(52), y - 46 - rise], [X(58), y - 8], [X(50), y - 4], [X(56), y + 18], [X(44), y + 14], [X(46), y + 36], [X(26), y + 26]];
    poly(g, pts);
    paint(g, litFill(g, 0, y - 46, 100, 80, col, 0.25), INK, LW * 0.9);
    g.strokeStyle = alpha(shade(col, -0.55), 0.9);
    g.lineWidth = 1.6;
    for (const [px, py] of [[X(58), y - 8], [X(56), y + 18], [X(46), y + 36]]) {
      g.beginPath(); g.moveTo(X(30), y - 30 - rise); g.lineTo(px, py); g.stroke();
    }
  }
}
/** Feathered wings behind the shoulders. */
function featherWings(g: G, col: string, y = 50, span = 1, tip?: string) {
  for (const s of SIDES) {
    const X = (k: number) => 50 + s * k * span;
    blob(g, [[X(18), y + 20], [X(28), y - 26], [X(50), y - 44], [X(60), y - 20], [X(58), y + 20], [X(46), y + 46], [X(28), y + 34]]);
    paint(g, litFill(g, 0, y - 44, 100, 90, col, 0.2), INK, LW * 0.9);
    for (let i = 0; i < 4; i++) {
      const fy = y - 14 + i * 13, fx = X(44 + (i % 2) * 4);
      ellipse(g, fx, fy, 10, 4.5, s * (0.9 - i * 0.12));
      paint(g, domeFill(g, fx, fy, 10, i === 3 && tip ? tip : shade(col, -0.06 * i), 0.25), alpha(shade(col, -0.6), 0.8), 1);
    }
  }
}
function halo(g: G, cx: number, cy: number, r: number, col: string) {
  glow(g, cx, cy, r * 1.8, col, 0.55);
  circle(g, cx, cy, r);
  g.strokeStyle = INK;
  g.lineWidth = 5;
  g.stroke();
  g.strokeStyle = col;
  g.lineWidth = 3;
  g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.7)';
  g.lineWidth = 1;
  g.beginPath();
  g.arc(cx, cy, r, Math.PI * 1.05, Math.PI * 1.45);
  g.stroke();
}
/** Wart / speck dots. */
function warts(g: G, rand: () => number, x: number, y: number, w: number, h: number, n: number, col: string, r = 1.3) {
  for (let i = 0; i < n; i++) {
    circle(g, x + rand() * w, y + rand() * h, r * (0.6 + rand() * 0.8));
    paint(g, col, alpha(INK, 0.5), 0.6);
  }
}
/** Cheek / blush shading. */
function cheeks(g: G, cx: number, y: number, dx: number, col: string, a = 0.35) {
  for (const s of SIDES) {
    const gr = g.createRadialGradient(cx + s * dx, y, 0, cx + s * dx, y, 8);
    gr.addColorStop(0, alpha(col, a));
    gr.addColorStop(1, alpha(col, 0));
    g.fillStyle = gr;
    g.fillRect(cx + s * dx - 8, y - 8, 16, 16);
  }
}
/** Stringy hair or beard strands. */
function strands(g: G, rand: () => number, x: number, y: number, w: number, h: number, n: number, col: string, lw = 1.2) {
  g.strokeStyle = col;
  g.lineWidth = lw;
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const sx = x + rand() * w, sy = y + rand() * h * 0.3;
    g.beginPath();
    g.moveTo(sx, sy);
    g.quadraticCurveTo(sx + (rand() - 0.5) * 6, sy + h * 0.4, sx + (rand() - 0.5) * 8, sy + h * (0.5 + rand() * 0.5));
    g.stroke();
  }
}
/** A spiky crown of flames (hair, mane, aura). */
function flameCrown(g: G, cx: number, cy: number, rx: number, ry: number, rand: () => number, cols: string[], n = 9, from = Math.PI * 1.05, to = Math.PI * 1.95) {
  cols.forEach((col, li) => {
    const k = 1 - li * 0.22;
    g.beginPath();
    g.moveTo(cx + Math.cos(from) * rx * 0.6, cy + Math.sin(from) * ry * 0.6 + 8);
    for (let i = 0; i <= n; i++) {
      const a = from + ((to - from) * i) / n;
      const tip = 1.05 + rand() * 0.35;
      const am = from + ((to - from) * (i + 0.5)) / n;
      g.lineTo(cx + Math.cos(a) * rx * k * tip, cy + Math.sin(a) * ry * k * tip);
      if (i < n) g.lineTo(cx + Math.cos(am) * rx * k * 0.78, cy + Math.sin(am) * ry * k * 0.78);
    }
    g.lineTo(cx + Math.cos(to) * rx * 0.6, cy + Math.sin(to) * ry * 0.6 + 8);
    g.closePath();
    g.fillStyle = col;
    g.fill();
    if (li === 0) { g.strokeStyle = alpha(INK, 0.8); g.lineWidth = 1.4; g.stroke(); }
  });
}
/** Lightning bolt. */
function bolt(g: G, x: number, y: number, len: number, ang: number, rand: () => number, col = '#e6f4ff') {
  const pts: number[][] = [[x, y]];
  let px = x, py = y;
  for (let i = 0; i < 5; i++) {
    px += Math.cos(ang) * (len / 5) + (rand() - 0.5) * 6;
    py += Math.sin(ang) * (len / 5) + (rand() - 0.5) * 6;
    pts.push([px, py]);
  }
  for (const [cl, lw] of [[alpha('#7fd3ff', 0.6), 4], [col, 1.6]] as [string, number][]) {
    poly(g, pts, false);
    g.strokeStyle = cl;
    g.lineWidth = lw;
    g.lineJoin = 'round';
    g.stroke();
  }
}

// ======================================================================================
// GIANTS
// ======================================================================================
const SKIN = { tan: '#b39a6c', green: '#7f9460', grey: '#8f8c84', ruddy: '#b47a5a', blue: '#6f88a8' };

const GIANTS: CreatureDef[] = [
  {
    id: 'ogre', name: 'Ogre', family: 'giant', size: 'Large', srd: 'ogre', cr: '2', tags: ['brute', 'big', 'tusks', 'club', 'hills'],
    c: { skin: SKIN.tan, hide: '#6e5236', eye: '#e8c547', hair: '#3b2a1c' },
    variants: [
      { name: 'Tan', c: {} },
      { name: 'Green', c: { skin: SKIN.green, hide: '#5a4630' } },
      { name: 'Grey-blue', c: { skin: '#8794a0', hide: '#4a4038', eye: '#f08a3c' } },
      { name: 'Tan, club', c: {}, f: { club: 1 } },
      { name: 'Ruddy, club', c: { skin: SKIN.ruddy, hide: '#4d3a2a' }, f: { club: 1 } },
    ],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.club) {
        g.save(); g.translate(80, 74); g.rotate(0.12);
        blob(g, [[-4, 50], [-5, 0], [-13, -30], [-8, -54], [8, -56], [14, -32], [5, 0], [4, 50]]);
        paint(g, litFill(g, -12, -48, 24, 98, '#7a5233', 0.3), INK, LW);
        for (let i = 0; i < 5; i++) { circle(g, -7 + r() * 14, -48 + r() * 34, 1.8); paint(g, '#d8d2c0', INK, 0.8); }
        g.restore();
      }
      shoulders(g, c.hide, 70, 1.05);
      // fur collar
      g.strokeStyle = alpha(shade(c.hide, -0.5), 0.8); g.lineWidth = 1.2;
      for (let i = 0; i < 14; i++) { const x = 10 + i * 6 + r() * 3, y = 76 + Math.abs(x - 50) * 0.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1.5, y + 7); g.stroke(); }
      ears(g, 50, 46, 31, 'round', c.skin, 0.95);
      head(g, c.skin, { top: 20, chin: 86, w: 31, jaw: 1.0, mid: 50 });
      warts(g, r, 26, 30, 48, 40, 5, shade(c.skin, -0.12), 1.3);
      // hair tuft
      strands(g, r, 42, 12, 16, 12, 6, c.hair, 2);
      browRidge(g, 50, 40, 22, c.skin);
      eyes(g, 50, 45, 10, 4, 3.4, c.eye, { pupil: 'round' });
      nose(g, 50, 55, 'big', shade(c.skin, 0.05));
      // underbite jaw
      g.beginPath(); g.moveTo(32, 66); g.quadraticCurveTo(50, 82, 68, 66); g.quadraticCurveTo(50, 72, 32, 66);
      paint(g, '#3a1612', INK, 1.5);
      for (const s of SIDES) tusk(g, 50 + s * 12, 72, 14, s, '#efe3c2', 3.2);
      for (const x of [44, 50, 56]) { poly(g, [[x - 2, 72], [x, 68], [x + 2, 72]]); paint(g, '#e6dcc0', INK, 0.6); }
    },
  },
  {
    id: 'halfOgre', name: 'Half-Ogre', family: 'giant', size: 'Large', tags: ['brute', 'mercenary', 'tusks', 'half-breed'],
    c: { skin: '#a88a68', hair: '#2d2018', armor: '#6b4a2c', eye: '#8a6a3c', strap: '#3c2a1c' },
    variants: [{ name: 'Leather', c: {} }, { name: 'Grey skin', c: { skin: '#9a9488', hair: '#1d1d1f' } }, { name: 'Mail', c: { armor: '#7c8188', strap: '#4a4038' } }, { name: 'Red-haired', c: { hair: '#8a3b1c', skin: '#c09676' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, c.armor, 70, 1);
      // strap across chest
      poly(g, [[22, 72], [30, 70], [78, 110], [66, 112]]);
      paint(g, c.strap, INK, 1.2);
      for (const s of SIDES) { circle(g, 50 + s * 34, 78, 9); paint(g, domeFill(g, 50 + s * 34, 78, 9, shade(c.armor, 0.15)), INK, 1.4); }
      // shaggy hair behind
      blob(g, lumpy(50, 38, 31, 0.3, 11, r, 30));
      paint(g, shade(c.hair, -0.1), INK, LW);
      ears(g, 50, 46, 26, 'round', c.skin, 0.75);
      head(g, c.skin, { top: 20, chin: 82, w: 26, jaw: 0.92 });
      // fringe
      blob(g, [[26, 34], [32, 18], [50, 12], [70, 18], [75, 34], [64, 28], [56, 32], [48, 26], [38, 31]]);
      paint(g, litFill(g, 26, 12, 50, 24, c.hair, 0.2), INK, 1.4);
      brows(g, 50, 40, 10, 6, 1.5, shade(c.hair, -0.1), 3);
      eyes(g, 50, 45, 10, 4.2, 3.4, c.eye);
      nose(g, 50, 55, 'broad', shade(c.skin, 0.05));
      mouthLine(g, 50, 66, 9, -2, 2);
      for (const s of SIDES) tusk(g, 50 + s * 7, 68, 8, s, '#eee2c0', 2.2);
      // scar
      line(g, 60, 36, 66, 52, alpha('#7a3a2a', 0.8), 1.4);
    },
  },
  {
    id: 'troll', name: 'Troll', family: 'giant', size: 'Large', cr: '5', tags: ['regenerate', 'claws', 'swamp', 'bridge', 'hungry'],
    c: { skin: '#5f7d4c', hair: '#2b3523', eye: '#f3d23a', mouth: '#3a1612' },
    variants: [{ name: 'Green', c: {} }, { name: 'Mossy', c: { skin: '#6f7a3e', hair: '#3f4a1c' } }, { name: 'Grey', c: { skin: '#7c8278', hair: '#33352f', eye: '#ff7b39' } }, { name: 'Ice-blue', c: { skin: '#7d98a8', hair: '#d9e6ee', eye: '#7af0ff' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, shade(c.skin, -0.12), 72, 0.95);
      // stringy hair behind
      blob(g, [[22, 50], [24, 18], [50, 6], [76, 18], [78, 50], [88, 80], [70, 70], [30, 70], [12, 80]]);
      paint(g, litFill(g, 12, 6, 76, 76, c.hair, 0.2), INK, LW);
      ears(g, 50, 40, 20, 'long', c.skin, 1.05);
      // long narrow face
      head(g, c.skin, { top: 14, chin: 90, w: 21, jaw: 0.62, mid: 44 });
      warts(g, r, 32, 22, 36, 52, 6, shade(c.skin, -0.2), 1.1);
      brows(g, 50, 33, 9, 5, 3, shade(c.hair, -0.1), 2.6);
      eyes(g, 50, 38, 8.5, 5, 4.2, c.eye, { pupil: 'slit', glow: c.eye });
      // long hooked nose
      g.beginPath(); g.moveTo(47, 38); g.quadraticCurveTo(58, 52, 56, 64); g.quadraticCurveTo(52, 68, 46, 63); g.quadraticCurveTo(50, 52, 47, 38);
      paint(g, domeFill(g, 50, 52, 14, shade(c.skin, 0.08), 0.3), INK, 1.4);
      openMouth(g, 50, 72, 13, 9, { top: 5, fangs: 6, bottom: 4, inside: c.mouth });
      // shaggy fringe strands
      strands(g, r, 30, 10, 40, 20, 10, shade(c.hair, 0.15), 1.6);
    },
  },
  {
    id: 'ettin', name: 'Ettin', family: 'giant', size: 'Large', cr: '4', tags: ['two heads', 'twin', 'brute', 'hills'],
    c: { skin: '#9d8a6b', hair: '#3a2b1d', hide: '#5e4a34', eye: '#d6c25a' },
    variants: [{ name: 'Tan', c: {} }, { name: 'Grey', c: { skin: '#8a8780', hair: '#222' } }, { name: 'Ruddy', c: { skin: '#a8705a', hair: '#5a2d18' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, c.hide, 64, 1.15);
      for (let i = 0; i < 6; i++) { circle(g, 14 + i * 14.5, 92 + Math.sin(i) * 3, 2); paint(g, shade(c.hide, -0.3), null); }
      // left head: snarling, one eye squint, bald
      const L = 29, R = 71;
      for (const [cx, k] of [[L, -1], [R, 1]] as [number, number][]) {
        ears(g, cx, 48, 17, 'round', c.skin, 0.55);
        head(g, shade(c.skin, k * 0.04), { cx, top: 24, chin: 78, w: 17, jaw: 0.9, mid: 48 });
      }
      // left: angry, thick brows, bald with scar
      brows(g, L, 42, 6, 4, 2.4, c.hair, 2.6);
      eye(g, L - 6, 47, 3.4, 2.8, c.eye);
      eye(g, L + 6, 47, 3.4, 2.8, c.eye);
      nose(g, L, 56, 'broad', c.skin);
      openMouth(g, L, 65, 8, 5, { top: 4, bottom: 3, inside: '#3a1612' });
      line(g, L - 10, 30, L - 4, 40, alpha('#6a2a1a', 0.8), 1.3);
      // right: dopey, shaggy hair, one tooth
      blob(g, [[R - 17, 40], [R - 14, 22], [R, 18], [R + 14, 22], [R + 18, 40], [R + 10, 32], [R, 34], [R - 8, 30]]);
      paint(g, litFill(g, R - 18, 18, 36, 24, c.hair, 0.2), INK, 1.3);
      eye(g, R - 6, 47, 3.6, 3.6, c.eye, { pupil: 'round' });
      eye(g, R + 6, 47.5, 3, 3, c.eye, { pupil: 'round' });
      nose(g, R, 55, 'big', c.skin);
      mouthLine(g, R, 66, 7, 2.5, 1.8);
      poly(g, [[R - 2, 66.5], [R + 1, 70.5], [R + 3, 66.5]]); paint(g, '#efe6cc', INK, 0.7);
      void r;
    },
  },
  {
    id: 'cyclops', name: 'Cyclops', family: 'giant', size: 'Huge', tags: ['one eye', 'folklore', 'shepherd', 'island'],
    c: { skin: '#b9926a', hair: '#3c2a1a', eye: '#4f86c6', cloth: '#7a6a4a' },
    variants: [{ name: 'Brown', c: {} }, { name: 'Olive', c: { skin: '#9a9a6a' } }, { name: 'Grey-bearded', c: { hair: '#9a948a' } }, { name: 'Red eye', c: { eye: '#c2302a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, c.cloth, 72, 1.05);
      g.strokeStyle = alpha(shade(c.cloth, -0.5), 0.6); g.lineWidth = 1.2;
      for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(14 + i * 18, 82); g.lineTo(10 + i * 19, 104); g.stroke(); }
      ears(g, 50, 48, 28, 'round', c.skin, 0.8);
      head(g, c.skin, { top: 16, chin: 84, w: 28, jaw: 0.85 });
      // beard
      blob(g, [[24, 58], [30, 72], [40, 90], [50, 96], [60, 90], [70, 72], [76, 58], [64, 66], [50, 64], [36, 66]]);
      paint(g, litFill(g, 24, 58, 52, 38, c.hair, 0.2), INK, 1.6);
      strands(g, r, 32, 66, 36, 24, 8, shade(c.hair, -0.35), 1);
      // great single eye
      ellipse(g, 50, 40, 15, 11.5); paint(g, shade(c.skin, -0.25), INK, 1.6);
      eye(g, 50, 41, 12.5, 9.5, c.eye, { pupil: 'round', lw: 1.8 });
      // unibrow
      g.beginPath(); g.moveTo(32, 30); g.quadraticCurveTo(50, 22, 68, 30); g.strokeStyle = INK; g.lineWidth = 6; g.lineCap = 'round'; g.stroke();
      g.strokeStyle = c.hair; g.lineWidth = 4; g.stroke();
      nose(g, 50, 60, 'broad', shade(c.skin, 0.05));
      openMouth(g, 50, 69, 9, 5, { top: 4, inside: '#3a1612' });
      // tuft of hair on top
      strands(g, r, 40, 6, 20, 14, 7, c.hair, 1.8);
    },
  },
  {
    id: 'hillGiant', name: 'Hill Giant', family: 'giant', size: 'Huge', cr: '5', tags: ['brute', 'dim', 'hills', 'big'],
    c: { skin: '#c49a76', hair: '#5a3b20', hide: '#7a5a3a', eye: '#6b5a3a' },
    variants: [{ name: 'Fair', c: {} }, { name: 'Tanned', c: { skin: '#a3784f', hair: '#2d1e12' } }, { name: 'Ruddy', c: { skin: '#c97f64', hair: '#8a4a20' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, c.hide, 72, 1.1);
      // crude hide strap with bone
      poly(g, [[30, 70], [38, 70], [62, 112], [52, 112]]); paint(g, shade(c.hide, -0.3), INK, 1.2);
      ellipse(g, 44, 84, 6, 2.6, 1.0); paint(g, '#e9dfc6', INK, 1);
      ears(g, 50, 46, 30, 'round', c.skin, 0.85);
      // round fat head with double chin
      head(g, c.skin, { top: 18, chin: 86, w: 31, jaw: 1.05, mid: 52 });
      g.beginPath(); g.moveTo(30, 76); g.quadraticCurveTo(50, 92, 70, 76); g.strokeStyle = alpha(shade(c.skin, -0.5), 0.7); g.lineWidth = 1.4; g.stroke();
      cheeks(g, 50, 60, 16, '#d2584a', 0.35);
      // stringy comb-over
      strands(g, r, 30, 12, 40, 16, 9, c.hair, 1.8);
      brows(g, 50, 37, 11, 5, -1.5, c.hair, 2.6);
      eyes(g, 50, 43, 11, 3.6, 3.6, c.eye, { pupil: 'round' });
      nose(g, 50, 55, 'big', shade(c.skin, 0.06));
      // dopey crooked-tooth grin
      g.beginPath(); g.moveTo(36, 66); g.quadraticCurveTo(50, 76, 64, 64); g.quadraticCurveTo(50, 70, 36, 66);
      paint(g, '#4a1a14', INK, 1.4);
      for (const [x, h] of [[44, 3.5], [49, 4.5], [57, 3]]) { rrTooth(g, x, 68, 3, h); }
    },
  },
  {
    id: 'stoneGiant', name: 'Stone Giant', family: 'giant', size: 'Huge', cr: '7', tags: ['mountain', 'cave', 'rock', 'thrower'],
    c: { skin: '#9a968c', mark: '#4c4a46', eye: '#141414', cloth: '#6f6656' },
    variants: [{ name: 'Granite', c: {} }, { name: 'Slate', c: { skin: '#6f757a', mark: '#c8d0d6' } }, { name: 'Sandstone', c: { skin: '#b8a07a', mark: '#6a4a2a', cloth: '#5a4a3a' } }, { name: 'Marble', c: { skin: '#d6d2c8', mark: '#7a7468' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, c.cloth, 72, 1.05);
      ears(g, 50, 46, 25, 'round', c.skin, 0.7);
      // angular face
      poly(g, [[50, 12], [70, 16], [78, 36], [76, 62], [64, 82], [50, 86], [36, 82], [24, 62], [22, 36], [30, 16]]);
      paint(g, litFill(g, 22, 12, 56, 74, c.skin, 0.25), INK, LW);
      // facet lines
      g.strokeStyle = alpha(shade(c.skin, -0.4), 0.6); g.lineWidth = 1;
      g.beginPath(); g.moveTo(24, 50); g.lineTo(36, 54); g.lineTo(38, 74); g.moveTo(76, 50); g.lineTo(64, 54); g.lineTo(62, 74); g.stroke();
      // carved tribal markings
      g.strokeStyle = c.mark; g.lineWidth = 2;
      g.beginPath(); g.moveTo(50, 14); g.lineTo(50, 28); g.moveTo(42, 18); g.lineTo(46, 28); g.moveTo(58, 18); g.lineTo(54, 28); g.stroke();
      for (const s of SIDES) { g.beginPath(); g.moveTo(50 + s * 18, 52); g.lineTo(50 + s * 22, 60); g.lineTo(50 + s * 18, 66); g.stroke(); }
      // brow and black eyes
      poly(g, [[28, 38], [48, 36], [52, 36], [72, 38], [70, 42], [30, 42]]); paint(g, shade(c.skin, -0.18), INK, 1.2);
      for (const s of SIDES) { ellipse(g, 50 + s * 11, 46, 5.2, 3.4); paint(g, c.eye, INK, 1.2); circle(g, 50 + s * 11 - 1.6, 45, 1); g.fillStyle = '#fff'; g.fill(); }
      poly(g, [[50, 46], [55, 60], [50, 62], [45, 60]]); paint(g, litFill(g, 44, 46, 12, 16, shade(c.skin, 0.08), 0.3), INK, 1.2);
      line(g, 41, 71, 59, 71, INK, 2);
      speckle2(g, r, 26, 16, 48, 66, 14, alpha(shade(c.skin, -0.35), 0.45));
    },
  },
  {
    id: 'frostGiant', name: 'Frost Giant', family: 'giant', size: 'Huge', cr: '8', tags: ['ice', 'winter', 'cold', 'north', 'raider'],
    c: { skin: '#a8c4d8', hair: '#eef4f8', helm: '#7c858e', eye: '#2e7fc2', fur: '#e8e2d4' },
    variants: [{ name: 'Iron helm', c: {} }, { name: 'Bare-headed', c: {}, f: { bare: 1 } }, { name: 'Pale gold hair', c: { hair: '#e8d8a0' } }, { name: 'Dark helm', c: { helm: '#3f454c', skin: '#9cb4cc' } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      shoulders(g, c.fur, 72, 1.1);
      g.strokeStyle = alpha('#8a8070', 0.6); g.lineWidth = 1.2;
      for (let i = 0; i < 14; i++) { const x = 6 + i * 6.5; g.beginPath(); g.moveTo(x, 80 + r() * 4); g.lineTo(x + 2, 88 + r() * 4); g.stroke(); }
      // hair behind
      blob(g, [[20, 40], [24, 14], [50, 6], [76, 14], [80, 40], [84, 72], [16, 72]]);
      paint(g, litFill(g, 16, 6, 68, 66, c.hair, 0.15), INK, LW);
      head(g, c.skin, { top: 16, chin: 76, w: 24, jaw: 0.85 });
      // braided beard
      blob(g, [[28, 52], [34, 66], [42, 76], [50, 80], [58, 76], [66, 66], [72, 52], [62, 62], [50, 60], [38, 62]]);
      paint(g, litFill(g, 28, 52, 44, 30, c.hair, 0.15), INK, 1.6);
      for (const s of SIDES) {
        for (let i = 0; i < 3; i++) { ellipse(g, 50 + s * 7, 80 + i * 6, 3.6, 3.4); paint(g, shade(c.hair, -0.06 * i), INK, 1); }
        circle(g, 50 + s * 7, 97, 2.4); paint(g, '#c9a24a', INK, 0.9);
      }
      // moustache
      for (const s of SIDES) { blob(g, [[50, 60], [50 + s * 10, 58], [50 + s * 18, 66], [50 + s * 10, 63]]); paint(g, shade(c.hair, -0.05), INK, 1.1); }
      brows(g, 50, 38, 10, 6, 2, c.hair, 3);
      eyes(g, 50, 44, 10, 4.6, 3.6, c.eye, { glow: '#9fe8ff' });
      nose(g, 50, 52, 'small', c.skin);
      if (!f.bare) {
        // horned helm
        for (const s of SIDES) horn(g, 50 + s * 22, 24, 50 + s * 40, 16, 50 + s * 38, -2, 8, '#ece4cf', 3);
        g.beginPath(); g.moveTo(24, 32); g.quadraticCurveTo(24, 8, 50, 6); g.quadraticCurveTo(76, 8, 76, 32); g.quadraticCurveTo(50, 26, 24, 32);
        paint(g, litFill(g, 24, 6, 52, 26, c.helm, 0.35), INK, LW);
        poly(g, [[47, 26], [53, 26], [52, 46], [48, 46]]); paint(g, litFill(g, 47, 26, 6, 20, c.helm, 0.3), INK, 1.2);
        for (const x of [32, 41, 59, 68]) { circle(g, x, 28.5, 1.4); paint(g, shade(c.helm, 0.4), INK, 0.6); }
      } else {
        strands(g, r, 30, 12, 40, 18, 9, shade(c.hair, -0.15), 1.4);
      }
    },
  },
  {
    id: 'fireGiant', name: 'Fire Giant', family: 'giant', size: 'Huge', cr: '9', tags: ['fire', 'forge', 'volcano', 'smith', 'warrior'],
    c: { skin: '#2c2624', hair: '#ff6a1f', hair2: '#ffc53a', eye: '#ffb02e', armor: '#4a3c36' },
    variants: [{ name: 'Coal-black', c: {} }, { name: 'Iron helm', c: {}, f: { helm: 1 } }, { name: 'Ash-grey', c: { skin: '#5a524e' } }, { name: 'Blue flame', c: { hair: '#3d7fff', hair2: '#b8f0ff', eye: '#8fe3ff' } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      // flaming hair behind
      flameCrown(g, 50, 46, 40, 44, r, [c.hair, c.hair2], 9, Math.PI * 0.95, Math.PI * 2.05);
      shoulders(g, c.armor, 72, 1.1);
      for (const s of SIDES) { circle(g, 50 + s * 36, 82, 11); paint(g, domeFill(g, 50 + s * 36, 82, 11, shade(c.armor, 0.15)), INK, 1.4); circle(g, 50 + s * 36, 82, 2.2); paint(g, '#c9a24a', INK, 0.8); }
      head(g, c.skin, { top: 16, chin: 78, w: 25, jaw: 0.9 }, 0.45);
      // flaming beard
      g.save(); g.translate(50, 66); g.scale(1, -1);
      flameCrown(g, 0, 0, 22, 30, r, [c.hair, c.hair2], 7, Math.PI * 1.1, Math.PI * 1.9);
      g.restore();
      for (const s of SIDES) { blob(g, [[50, 62], [50 + s * 11, 59], [50 + s * 19, 66], [50 + s * 10, 64]]); paint(g, c.hair, INK, 1.1); }
      brows(g, 50, 38, 10, 6, 3, c.hair, 3);
      eyes(g, 50, 44, 10, 5, 3.6, c.eye, { white: null, pupil: 'none', glow: c.eye });
      nose(g, 50, 52, 'broad', shade(c.skin, 0.12));
      if (f.helm) {
        g.beginPath(); g.moveTo(24, 34); g.quadraticCurveTo(22, 8, 50, 6); g.quadraticCurveTo(78, 8, 76, 34); g.lineTo(70, 36); g.quadraticCurveTo(50, 28, 30, 36); g.closePath();
        paint(g, litFill(g, 24, 6, 52, 30, '#3c3a3a', 0.35), INK, LW);
        poly(g, [[46, 6], [50, -4], [54, 6]]); paint(g, '#c9a24a', INK, 1);
      }
    },
  },
  {
    id: 'cloudGiant', name: 'Cloud Giant', family: 'giant', size: 'Huge', cr: '9', tags: ['sky', 'castle', 'noble', 'cloud'],
    c: { skin: '#cfd6de', hair: '#f4f6fa', eye: '#6f8fd8', robe: '#5d7fb0', gold: '#e2b84a' },
    variants: [{ name: 'Azure robes', c: {} }, { name: 'Violet robes', c: { robe: '#6c4f9a' } }, { name: 'Dark-haired', c: { hair: '#3a3f4a', skin: '#c2c8d0' } }, { name: 'Silver robes', c: { robe: '#a8b2bf', gold: '#c9ced3' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // cloud wisps behind
      for (let i = 0; i < 6; i++) { const x = 6 + r() * 88, y = 10 + r() * 30; ellipse(g, x, y, 10 + r() * 8, 5 + r() * 3); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fill(); }
      // long hair behind
      blob(g, [[22, 36], [26, 12], [50, 6], [74, 12], [78, 36], [80, 76], [20, 76]]);
      paint(g, litFill(g, 20, 6, 60, 70, c.hair, 0.15), INK, LW);
      shoulders(g, c.robe, 72, 1.0);
      // collar with gold trim
      g.beginPath(); g.moveTo(30, 70); g.lineTo(50, 92); g.lineTo(70, 70); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.strokeStyle = c.gold; g.lineWidth = 3; g.stroke();
      gem(g, 50, 92, 4.5, '#5fd0e0');
      head(g, c.skin, { top: 16, chin: 80, w: 23, jaw: 0.72 });
      // neat beard
      blob(g, [[32, 60], [40, 76], [50, 84], [60, 76], [68, 60], [58, 68], [50, 66], [42, 68]]);
      paint(g, litFill(g, 32, 60, 36, 24, c.hair, 0.15), INK, 1.3);
      brows(g, 50, 38, 9, 5, -0.5, c.hair, 2.4);
      eyes(g, 50, 44, 9.5, 4.6, 3.4, c.eye);
      nose(g, 50, 52, 'small', c.skin);
      mouthLine(g, 50, 63, 5, 0.6, 1.4);
      // circlet
      g.beginPath(); g.moveTo(28, 28); g.quadraticCurveTo(50, 20, 72, 28); g.strokeStyle = INK; g.lineWidth = 4.4; g.stroke(); g.strokeStyle = c.gold; g.lineWidth = 2.6; g.stroke();
      gem(g, 50, 23, 3.6, '#7fb6ff');
      for (const s of SIDES) { circle(g, 50 + s * 26, 54, 2.4); paint(g, c.gold, INK, 0.8); }
    },
  },
  {
    id: 'stormGiant', name: 'Storm Giant', family: 'giant', size: 'Huge', cr: '13', tags: ['lightning', 'sea', 'storm', 'noble', 'oracle'],
    c: { skin: '#5f8a8a', hair: '#e8f0f4', eye: '#bff4ff', armor: '#2f4a5a', gold: '#d9b44a' },
    variants: [{ name: 'Sea-green', c: {} }, { name: 'Violet', c: { skin: '#7a6a9a', hair: '#cfd8ff' } }, { name: 'Deep blue', c: { skin: '#4d6a9a', hair: '#1c2433', armor: '#24364a' } }, { name: 'Pale', c: { skin: '#b8c8cc', hair: '#5a6a7a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // wild hair streaming
      blob(g, [[16, 50], [10, 20], [30, 4], [56, 0], [84, 8], [94, 30], [86, 60], [70, 70], [30, 70]]);
      paint(g, litFill(g, 10, 0, 84, 70, c.hair, 0.15), INK, LW);
      bolt(g, 12, 14, 30, 1.2, r);
      bolt(g, 90, 10, 32, 1.9, r);
      shoulders(g, c.armor, 72, 1.05);
      for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(50, 120, 34 + i * 6, Math.PI * 1.2, Math.PI * 1.8); g.strokeStyle = alpha(shade(c.armor, 0.35), 0.6); g.lineWidth = 1.2; g.stroke(); }
      head(g, c.skin, { top: 16, chin: 80, w: 23, jaw: 0.75 });
      blob(g, [[30, 60], [38, 78], [50, 88], [62, 78], [70, 60], [58, 68], [50, 66], [42, 68]]);
      paint(g, litFill(g, 30, 60, 40, 28, c.hair, 0.15), INK, 1.3);
      strands(g, r, 36, 66, 28, 20, 6, alpha(shade(c.hair, -0.4), 0.7), 1);
      brows(g, 50, 38, 9, 6, 2.5, c.hair, 2.8);
      eyes(g, 50, 44, 9.5, 4.8, 3.6, c.eye, { white: null, pupil: 'none', glow: '#7fd8ff' });
      nose(g, 50, 52, 'small', c.skin);
      mouthLine(g, 50, 64, 6, -1, 1.6);
      // crown of points
      g.beginPath(); g.moveTo(28, 28);
      for (let i = 0; i <= 6; i++) { const x = 28 + i * (44 / 6); g.lineTo(x, i % 2 ? 22 : 12 - (i === 3 ? 4 : 0)); }
      g.lineTo(72, 28); g.quadraticCurveTo(50, 24, 28, 28);
      paint(g, litFill(g, 28, 8, 44, 20, c.gold, 0.35), INK, 1.4);
      gem(g, 50, 21, 3.2, '#7fd8ff');
    },
  },
  {
    id: 'oni', name: 'Oni', family: 'giant', size: 'Large', cr: '7', tags: ['ogre mage', 'horns', 'shapechanger', 'folklore', 'demon'],
    c: { skin: '#4f73b8', hair: '#f0f0ec', eye: '#ffd23a', horn: '#efe6cc', mouth: '#3a0e10' },
    variants: [{ name: 'Blue', c: {} }, { name: 'Red', c: { skin: '#c23c2e', hair: '#1c1a1a' } }, { name: 'Green', c: { skin: '#5a8a4a', hair: '#e8e4d8' } }, { name: 'Purple', c: { skin: '#7a4a9a', hair: '#ffffff' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // wild mane
      blob(g, lumpy(50, 46, 42, 0.35, 14, r, 40));
      paint(g, litFill(g, 8, 6, 84, 84, c.hair, 0.18), INK, LW);
      shoulders(g, '#3a3036', 74, 1.05);
      poly(g, [[34, 72], [50, 100], [66, 72], [60, 72], [50, 88], [40, 72]]); paint(g, '#b8302a', INK, 1.2);
      ears(g, 50, 46, 24, 'point', c.skin, 0.9);
      head(g, c.skin, { top: 20, chin: 82, w: 24, jaw: 0.85 });
      for (const s of SIDES) horn(g, 50 + s * 12, 24, 50 + s * 16, 10, 50 + s * 22, 0, 7, c.horn, 2);
      brows(g, 50, 39, 9, 6, 3.4, c.hair, 3.2);
      eyes(g, 50, 45, 9.5, 5, 3.8, c.eye, { pupil: 'slit', glow: c.eye });
      nose(g, 50, 54, 'broad', shade(c.skin, 0.1));
      openMouth(g, 50, 64, 13, 9, { top: 6, bottom: 5, fangs: 0, inside: c.mouth });
      for (const s of SIDES) tusk(g, 50 + s * 9, 72, 10, s, '#f2ead2', 2.4);
    },
  },
  {
    id: 'fomorian', name: 'Fomorian', family: 'giant', size: 'Huge', tags: ['twisted', 'cursed', 'underdark', 'folklore', 'deformed'],
    c: { skin: '#9a8a74', hair: '#3a3026', eye: '#d8c84a', cloth: '#4a4238' },
    variants: [{ name: 'Sallow', c: {} }, { name: 'Grey-green', c: { skin: '#7f8a6c' } }, { name: 'Mottled', c: { skin: '#a37a6a', eye: '#e86a3a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, c.cloth, 70, 1.1);
      // lopsided hunched shoulder
      ellipse(g, 20, 72, 18, 14, -0.3); paint(g, domeFill(g, 20, 72, 18, shade(c.skin, -0.1)), INK, LW);
      // misshapen head
      blob(g, [[44, 14], [66, 16], [78, 36], [76, 60], [64, 82], [44, 86], [28, 74], [24, 50], [30, 26]]);
      paint(g, domeFill(g, 48, 44, 40, c.skin, 0.3), INK, LW);
      warts(g, r, 30, 24, 44, 52, 9, shade(c.skin, -0.18), 1.5);
      strands(g, r, 36, 12, 20, 14, 6, c.hair, 1.6);
      // one huge low eye, one tiny high eye
      browRidge(g, 40, 38, 12, c.skin);
      eye(g, 39, 46, 8, 7, c.eye, { pupil: 'round' });
      eye(g, 63, 36, 3.2, 3, c.eye, { pupil: 'round' });
      g.beginPath(); g.moveTo(58, 31); g.lineTo(68, 30); g.strokeStyle = INK; g.lineWidth = 2.2; g.stroke();
      nose(g, 55, 56, 'hook', shade(c.skin, 0.05));
      // crooked mouth
      g.beginPath(); g.moveTo(34, 70); g.quadraticCurveTo(46, 66, 64, 74); g.quadraticCurveTo(50, 80, 34, 70);
      paint(g, '#3a1612', INK, 1.4);
      for (const x of [40, 48, 57]) { poly(g, [[x - 2, 70], [x, 74], [x + 2, 71]]); paint(g, '#e6dcc0', INK, 0.6); }
    },
  },
];

function rrTooth(g: G, x: number, y: number, w: number, h: number) {
  g.beginPath();
  g.rect(x - w / 2, y - 1, w, h);
  paint(g, '#efe6cc', INK, 0.8);
}
function speckle2(g: G, rand: () => number, x: number, y: number, w: number, h: number, n: number, col: string) {
  g.fillStyle = col;
  for (let i = 0; i < n; i++) { circle(g, x + rand() * w, y + rand() * h, 0.6 + rand() * 0.9); g.fill(); }
}

// ======================================================================================
// FIENDS
// ======================================================================================
/** A fanged smirk: a curved dark mouth with two fangs. */
function smirk(g: G, cx: number, y: number, hw: number, curve: number, fang = 3.5) {
  g.beginPath();
  g.moveTo(cx - hw, y - curve * 0.5);
  g.quadraticCurveTo(cx, y + curve * 1.4, cx + hw, y - curve * 0.5);
  g.quadraticCurveTo(cx, y + curve * 0.5, cx - hw, y - curve * 0.5);
  paint(g, '#2a0a0a', INK, 1.3);
  if (fang) for (const s of SIDES) { poly(g, [[cx + s * hw * 0.45 - 1.4, y + curve * 0.3], [cx + s * hw * 0.42, y + curve * 0.3 + fang], [cx + s * hw * 0.45 + 1.4, y + curve * 0.35]]); paint(g, '#f4eedc', INK, 0.7); }
}
/** Rows of small spikes along an arc (for barbs, crests). */
function spikes(g: G, pts: number[][], len: number, col: string, out: number[] = [0, -1]) {
  for (const [x, y] of pts) {
    poly(g, [[x - 2.4, y], [x + out[0] * len, y + out[1] * len], [x + 2.4, y]]);
    paint(g, litFill(g, x - 3, y - len, 6, len, col, 0.3), INK, 1);
  }
}
/** Front view of a long animal head (horse, hound). */
function longSnout(g: G, col: string, o: { top: number; eyeY: number; nose: number; w: number; nw: number }) {
  const { top, eyeY, nose: ny, w, nw } = o;
  blob(g, [[50, top], [50 + w, top + 8], [50 + w * 1.05, eyeY + 4], [50 + nw * 1.1, ny - 8], [50 + nw * 1.2, ny + 4], [50, ny + 10], [50 - nw * 1.2, ny + 4], [50 - nw * 1.1, ny - 8], [50 - w * 1.05, eyeY + 4], [50 - w, top + 8]]);
  paint(g, domeFill(g, 46, eyeY, w * 2.2, col, 0.3), INK, LW);
}

const FIEND_RED = '#b8352a';
const FIENDS: CreatureDef[] = [
  {
    id: 'imp', name: 'Imp', family: 'fiend', size: 'Tiny', cr: '1', tags: ['devil', 'familiar', 'invisible', 'trickster', 'wings'],
    c: { skin: '#c2402e', wing: '#6a1d1a', eye: '#ffd23a', horn: '#3a2a26' },
    variants: [{ name: 'Red', c: {} }, { name: 'Dusky', c: { skin: '#7a3a5a', wing: '#3a1a30', eye: '#9cff6a' } }, { name: 'Black', c: { skin: '#3a3236', wing: '#1e1a1c', eye: '#ff6a2a', horn: '#a89a8a' } }, { name: 'Orange', c: { skin: '#d8702e', wing: '#7a3418' } }],
    draw: ({ g, c }) => {
      batWings(g, c.wing, 56, 0.95, 6);
      shoulders(g, shade(c.skin, -0.15), 76, 0.6);
      ears(g, 50, 46, 21, 'bat', c.skin, 1.1);
      head(g, c.skin, { top: 22, chin: 80, w: 23, jaw: 0.5, mid: 46 });
      for (const s of SIDES) horn(g, 50 + s * 9, 26, 50 + s * 12, 14, 50 + s * 20, 8, 6, c.horn, 1);
      brows(g, 50, 39, 8, 5, 2.5, shade(c.skin, -0.5), 2.2);
      eyes(g, 50, 46, 9, 6, 5, c.eye, { pupil: 'slit', glow: c.eye });
      nose(g, 50, 56, 'small', c.skin);
      smirk(g, 50, 64, 13, 5, 3.4);
    },
  },
  {
    id: 'quasit', name: 'Quasit', family: 'fiend', size: 'Tiny', cr: '1', tags: ['demon', 'familiar', 'shapechanger', 'trickster'],
    c: { skin: '#5f8a3a', eye: '#ff3a2a', horn: '#2a2620', mouth: '#3a0a0a' },
    variants: [{ name: 'Green', c: {} }, { name: 'Brown', c: { skin: '#8a6a3a' } }, { name: 'Blue-grey', c: { skin: '#5a7a8a', eye: '#ffd23a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, shade(c.skin, -0.15), 78, 0.62);
      ears(g, 50, 44, 18, 'bat', c.skin, 1.45);
      head(g, c.skin, { top: 24, chin: 82, w: 24, jaw: 0.55, mid: 48 });
      warts(g, r, 30, 30, 40, 40, 7, shade(c.skin, -0.25), 1.2);
      for (const s of SIDES) horn(g, 50 + s * 7, 28, 50 + s * 6, 18, 50 + s * 10, 12, 5, c.horn);
      eyes(g, 50, 46, 10, 6.4, 5.6, c.eye, { white: '#fff6b0', pupil: 'slit' });
      nose(g, 50, 55, 'flat', c.skin);
      // huge mischief grin with tongue
      g.beginPath(); g.moveTo(30, 60); g.quadraticCurveTo(50, 84, 70, 60); g.quadraticCurveTo(50, 68, 30, 60);
      paint(g, c.mouth, INK, 1.4);
      ellipse(g, 56, 72, 4, 3, 0.4); g.fillStyle = '#d2485a'; g.fill();
      for (let i = 0; i < 6; i++) { const x = 36 + i * 5.6; const yy = 62.5 + Math.sin((i / 5) * Math.PI) * 3; poly(g, [[x - 2, yy - 0.5], [x, yy + 3], [x + 2, yy - 0.5]]); paint(g, '#f2ead6', null); }
    },
  },
  {
    id: 'lemure', name: 'Lemure', family: 'fiend', size: 'Medium', cr: '0', tags: ['devil', 'blob', 'melting', 'hell', 'swarm'],
    c: { skin: '#b87a6a', eye: '#e8d8a8' },
    variants: [{ name: 'Flesh', c: {} }, { name: 'Ashen', c: { skin: '#8a8078' } }, { name: 'Crimson', c: { skin: '#a8423a', eye: '#ffd23a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // slumping mass of flesh
      blob(g, [[50, 18], [70, 24], [80, 46], [92, 76], [100, 104], [0, 104], [8, 76], [20, 46], [30, 24]]);
      paint(g, domeFill(g, 44, 46, 56, c.skin, 0.3), INK, LW);
      // drips
      for (let i = 0; i < 6; i++) {
        const x = 18 + i * 13 + r() * 4, y = 56 + r() * 18, l = 8 + r() * 10;
        g.beginPath(); g.moveTo(x - 3, y); g.quadraticCurveTo(x - 3, y + l, x, y + l + 2); g.quadraticCurveTo(x + 3, y + l, x + 3, y);
        paint(g, shade(c.skin, -0.12), alpha(INK, 0.6), 1);
      }
      // sagging folds
      g.strokeStyle = alpha(shade(c.skin, -0.5), 0.7); g.lineWidth = 1.3;
      for (const [y, w] of [[30, 10], [70, 22], [84, 30]]) { g.beginPath(); g.moveTo(50 - w, y); g.quadraticCurveTo(50, y + 6, 50 + w, y); g.stroke(); }
      // drooping eyes and slack mouth
      for (const s of SIDES) {
        ellipse(g, 50 + s * 10, 46, 5, 3.6, s * -0.4); paint(g, shade(c.skin, -0.45), INK, 1.2);
        circle(g, 50 + s * 10, 47, 2.2); g.fillStyle = c.eye; g.fill();
      }
      g.beginPath(); g.moveTo(40, 62); g.quadraticCurveTo(50, 58, 60, 62); g.quadraticCurveTo(56, 72, 50, 72); g.quadraticCurveTo(44, 72, 40, 62);
      paint(g, '#3a1410', INK, 1.4);
    },
  },
  {
    id: 'dretch', name: 'Dretch', family: 'fiend', size: 'Small', cr: '1/4', tags: ['demon', 'abyss', 'pot-belly', 'stench'],
    c: { skin: '#a89a8a', eye: '#f0e060', mouth: '#3a1410' },
    variants: [{ name: 'Pallid', c: {} }, { name: 'Sickly green', c: { skin: '#8a9a6a' } }, { name: 'Bruised', c: { skin: '#8a6a7a', eye: '#ff7a3a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, shade(c.skin, -0.1), 70, 0.9);
      // round lumpy head, jowls
      blob(g, [[50, 18], [72, 24], [80, 44], [82, 66], [70, 84], [50, 88], [30, 84], [18, 66], [20, 44], [28, 24]]);
      paint(g, domeFill(g, 44, 44, 40, c.skin, 0.3), INK, LW);
      warts(g, r, 26, 26, 48, 50, 8, shade(c.skin, -0.2), 1.2);
      // tiny stubby horns
      for (const s of SIDES) horn(g, 50 + s * 14, 24, 50 + s * 16, 16, 50 + s * 20, 12, 5, '#4a3a30');
      // beady close-set eyes
      brows(g, 50, 36, 6, 4, -2, shade(c.skin, -0.5), 1.8);
      eyes(g, 50, 42, 6.5, 3.6, 3.6, c.eye, { pupil: 'round' });
      nose(g, 50, 51, 'pig', shade(c.skin, 0.05));
      // huge droopy mouth
      g.beginPath(); g.moveTo(26, 62); g.quadraticCurveTo(50, 58, 74, 62); g.quadraticCurveTo(62, 82, 50, 82); g.quadraticCurveTo(38, 82, 26, 62);
      paint(g, c.mouth, INK, 1.5);
      for (const x of [36, 44, 57, 64]) { poly(g, [[x - 2, 61], [x, 66], [x + 2, 61]]); paint(g, '#e8dcc0', null); }
    },
  },
  {
    id: 'manes', name: 'Manes', family: 'fiend', size: 'Small', tags: ['demon', 'lost soul', 'folklore', 'swarm', 'claws'],
    c: { skin: '#9aa0a0', eye: '#ff5a3a' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Pale blue', c: { skin: '#8aa0b8', eye: '#ffe060' } }, { name: 'Sallow', c: { skin: '#b0a080' } }],
    draw: ({ g, c }) => {
      shoulders(g, shade(c.skin, -0.25), 74, 0.8);
      // clawed hands raised at the sides
      for (const s of SIDES) {
        const x = 50 + s * 36;
        blob(g, [[x - s * 6, 96], [x - s * 2, 66], [x + s * 6, 60], [x + s * 10, 70], [x + s * 6, 96]]);
        paint(g, domeFill(g, x, 76, 14, shade(c.skin, -0.1)), INK, 1.6);
        for (let i = 0; i < 3; i++) { const fx = x - s * 3 + s * i * 4.5; horn(g, fx, 64, fx + s * 1, 56, fx + s * 3, 48 + i * 2, 3.4, '#2a2420'); }
      }
      // gaunt skull-like head
      blob(g, [[50, 16], [68, 22], [74, 42], [66, 66], [58, 82], [50, 84], [42, 82], [34, 66], [26, 42], [32, 22]]);
      paint(g, domeFill(g, 46, 42, 34, c.skin, 0.3), INK, LW);
      // hollow sockets with pinprick eyes
      for (const s of SIDES) {
        ellipse(g, 50 + s * 10, 42, 7, 6.4, s * 0.2); paint(g, '#1a1414', INK, 1.2);
        eye(g, 50 + s * 10, 43, 2.4, 2.4, c.eye, { white: null, pupil: 'none', glow: c.eye });
      }
      // cheek hollows
      g.strokeStyle = alpha(INK, 0.45); g.lineWidth = 1.3;
      for (const s of SIDES) { g.beginPath(); g.moveTo(50 + s * 16, 52); g.quadraticCurveTo(50 + s * 12, 62, 50 + s * 8, 70); g.stroke(); }
      // gaping mouth of needles
      ellipse(g, 50, 68, 7, 9); paint(g, '#2a0a0a', INK, 1.4);
      g.fillStyle = '#efe6cc';
      for (let i = 0; i < 4; i++) { const x = 45 + i * 3.3; poly(g, [[x - 1.2, 60], [x, 64.5], [x + 1.2, 60]]); g.fill(); poly(g, [[x - 1.2, 76.5], [x, 72], [x + 1.2, 76.5]]); g.fill(); }
    },
  },
  {
    id: 'hellHound', name: 'Hell Hound', family: 'fiend', size: 'Medium', cr: '3', tags: ['dog', 'fire', 'breath', 'pack', 'hound'],
    c: { fur: '#2a2422', eye: '#ff3a1a', fire: '#ff7a1a', fire2: '#ffd04a' },
    variants: [{ name: 'Black', c: {} }, { name: 'Rust', c: { fur: '#6a2a1a' } }, { name: 'Ash', c: { fur: '#5a5450' } }, { name: 'Blue fire', c: { fire: '#3a7aff', fire2: '#c8f4ff', eye: '#7ae8ff' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // flaming ruff
      flameCrown(g, 50, 60, 48, 46, r, [c.fire, c.fire2], 10, Math.PI * 0.85, Math.PI * 2.15);
      shoulders(g, c.fur, 72, 0.95);
      for (const s of SIDES) {
        poly(g, [[50 + s * 12, 28], [50 + s * 26, 2], [50 + s * 32, 34]]);
        paint(g, domeFill(g, 50 + s * 24, 22, 16, c.fur), INK, LW);
        poly(g, [[50 + s * 17, 28], [50 + s * 25, 10], [50 + s * 28, 30]]); paint(g, '#5a1a10', null);
      }
      blob(g, [[50, 18], [72, 24], [80, 44], [70, 64], [50, 72], [30, 64], [20, 44], [28, 24]]);
      paint(g, domeFill(g, 46, 38, 34, c.fur, 0.35), INK, LW);
      // muzzle with snarl
      blob(g, [[50, 44], [64, 52], [66, 70], [50, 84], [34, 70], [36, 52]]);
      paint(g, domeFill(g, 48, 58, 22, shade(c.fur, 0.12), 0.3), INK, LW * 0.8);
      ellipse(g, 50, 55, 6.4, 4.4); paint(g, '#120a0a', INK, 1);
      openMouth(g, 50, 68, 13, 10, { top: 5, fangs: 6, bottom: 4, inside: '#7a1a0a' });
      glow(g, 50, 74, 14, c.fire2, 0.7);
      brows(g, 50, 36, 10, 5, 3, '#120a0a', 2.4);
      eyes(g, 50, 41, 12, 5, 3.6, c.eye, { white: null, pupil: 'none', glow: c.eye, rot: 0.3 });
    },
  },
  {
    id: 'nightmare', name: 'Nightmare', family: 'fiend', size: 'Large', cr: '3', tags: ['horse', 'steed', 'mount', 'fire', 'ethereal'],
    c: { coat: '#1e1a1c', eye: '#ff3a1a', fire: '#ff6a1a', fire2: '#ffd04a' },
    variants: [{ name: 'Black', c: {} }, { name: 'Ghost-fire', c: { fire: '#5a3aff', fire2: '#d8c8ff', eye: '#c8a8ff' } }, { name: 'Ash grey', c: { coat: '#4a4446' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      flameCrown(g, 50, 46, 44, 50, r, [c.fire, c.fire2], 11, Math.PI * 0.8, Math.PI * 2.2);
      shoulders(g, c.coat, 80, 0.9);
      for (const s of SIDES) {
        poly(g, [[50 + s * 10, 22], [50 + s * 18, 0], [50 + s * 24, 24]]);
        paint(g, domeFill(g, 50 + s * 17, 14, 12, c.coat), INK, LW);
      }
      longSnout(g, c.coat, { top: 12, eyeY: 36, nose: 82, w: 22, nw: 14 });
      // flaming forelock
      g.save(); g.translate(50, 30); g.scale(0.45, 0.5);
      flameCrown(g, 0, 0, 30, 40, r, [c.fire, c.fire2], 5);
      g.restore();
      // blaze lines
      g.strokeStyle = alpha('#6a5a5a', 0.6); g.lineWidth = 1;
      g.beginPath(); g.moveTo(44, 52); g.quadraticCurveTo(46, 66, 42, 78); g.moveTo(56, 52); g.quadraticCurveTo(54, 66, 58, 78); g.stroke();
      eyes(g, 50, 40, 15, 5, 3.6, c.eye, { white: null, pupil: 'none', glow: c.eye, rot: 0.35 });
      // fiery nostrils
      for (const s of SIDES) { ellipse(g, 50 + s * 8, 82, 3.4, 4.4, s * 0.3); paint(g, '#140808', INK, 1); glow(g, 50 + s * 8, 84, 9, c.fire2, 0.8); }
    },
  },
  {
    id: 'succubus', name: 'Succubus / Incubus', family: 'fiend', size: 'Medium', cr: '4', tags: ['incubus', 'tempter', 'shapechanger', 'charm', 'wings'],
    c: { skin: '#c45a5a', hair: '#1e1418', eye: '#ffcf3a', wing: '#4a1a2a', horn: '#2a1e22' },
    variants: [
      { name: 'Succubus', c: {} },
      { name: 'Incubus', c: { skin: '#a8484a', hair: '#2a1a1a' }, f: { male: 1 } },
      { name: 'Violet', c: { skin: '#8a5aa8', hair: '#f0e8f0', eye: '#7af0ff', wing: '#2a1a40' } },
      { name: 'Violet incubus', c: { skin: '#7a4a98', hair: '#e8e0f0', eye: '#7af0ff', wing: '#2a1a40' }, f: { male: 1 } },
      { name: 'Pale', c: { skin: '#e0c0b0', hair: '#5a1a1a', eye: '#ff4a6a' } },
    ],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      batWings(g, c.wing, 54, 1, 4);
      if (!f.male) {
        blob(g, [[22, 40], [24, 14], [50, 6], [76, 14], [80, 44], [86, 86], [62, 76], [38, 76], [14, 86]]);
        paint(g, litFill(g, 14, 6, 72, 80, c.hair, 0.25), INK, LW);
      }
      shoulders(g, '#2a1a24', 76, 0.85);
      poly(g, [[38, 76], [50, 94], [62, 76]]); paint(g, shade(c.skin, -0.12), INK, 1.2);
      head(g, c.skin, { top: 18, chin: 80, w: 21, jaw: f.male ? 0.78 : 0.55 });
      // swept horns
      for (const s of SIDES) horn(g, 50 + s * 10, 22, 50 + s * 22, 8, 50 + s * 32, 16, 6, c.horn, 2);
      if (f.male) {
        blob(g, [[28, 36], [30, 16], [50, 10], [70, 16], [72, 36], [64, 26], [52, 28], [40, 24]]);
        paint(g, litFill(g, 28, 10, 44, 26, c.hair, 0.25), INK, 1.4);
      } else {
        blob(g, [[28, 44], [30, 18], [50, 12], [70, 18], [72, 44], [64, 28], [54, 24], [42, 30]]);
        paint(g, litFill(g, 28, 12, 44, 30, c.hair, 0.25), INK, 1.4);
      }
      brows(g, 50, 38, 9, 4.5, 1.8, shade(c.hair, 0.1), 1.8);
      eyes(g, 50, 44, 9, 5, 3.6, c.eye, { pupil: 'slit', glow: c.eye, rot: 0.15 });
      nose(g, 50, 52, 'small', c.skin);
      if (f.male) { mouthLine(g, 51, 64, 6, 1.6, 1.6); line(g, 56, 62, 58, 61, INK, 1.2); }
      else { g.beginPath(); g.moveTo(44, 63); g.quadraticCurveTo(50, 61, 57, 62); g.quadraticCurveTo(50, 68, 44, 63); paint(g, '#6a1a2a', INK, 1); }
      void r;
    },
  },
  {
    id: 'erinyes', name: 'Erinyes', family: 'fiend', size: 'Medium', cr: '12', tags: ['devil', 'fury', 'archer', 'fallen angel', 'wings'],
    c: { skin: '#d8c8c0', wing: '#2a2428', armor: '#3a3438', eye: '#ff2a1a', hair: '#1a1416' },
    variants: [{ name: 'Black wings', c: {} }, { name: 'Ashen', c: { skin: '#a8a0a0', wing: '#4a4448', armor: '#5a3030' } }, { name: 'Bronze', c: { armor: '#7a5030', skin: '#c89a80' } }],
    draw: ({ g, c }) => {
      featherWings(g, c.wing, 46, 1.05);
      blob(g, [[26, 40], [28, 16], [50, 10], [72, 16], [74, 40], [80, 82], [20, 82]]);
      paint(g, litFill(g, 20, 10, 60, 72, c.hair, 0.25), INK, LW);
      shoulders(g, c.armor, 74, 0.9);
      for (const s of SIDES) { blob(g, [[50 + s * 20, 72], [50 + s * 40, 70], [50 + s * 48, 84], [50 + s * 30, 86]]); paint(g, litFill(g, 0, 70, 100, 18, shade(c.armor, 0.15), 0.35), INK, 1.4); }
      head(g, c.skin, { top: 22, chin: 80, w: 19, jaw: 0.6 });
      // winged helm
      g.beginPath(); g.moveTo(30, 42); g.quadraticCurveTo(28, 12, 50, 12); g.quadraticCurveTo(72, 12, 70, 42); g.lineTo(64, 40); g.quadraticCurveTo(50, 30, 36, 40); g.closePath();
      paint(g, litFill(g, 28, 12, 44, 30, c.armor, 0.4), INK, LW);
      for (const s of SIDES) { poly(g, [[50 + s * 18, 26], [50 + s * 34, 6], [50 + s * 28, 20], [50 + s * 36, 16], [50 + s * 22, 32]]); paint(g, litFill(g, 0, 6, 100, 26, shade(c.armor, 0.2), 0.4), INK, 1.2); }
      eyes(g, 50, 47, 8, 4.4, 2.8, c.eye, { white: null, pupil: 'none', glow: c.eye, rot: 0.2 });
      nose(g, 50, 55, 'small', c.skin);
      mouthLine(g, 50, 66, 5, -1, 1.5);
    },
  },
  {
    id: 'barbedDevil', name: 'Barbed Devil', family: 'fiend', size: 'Medium', cr: '5', tags: ['devil', 'spikes', 'guard', 'hell'],
    c: { skin: '#a8302a', spike: '#2a1a16', eye: '#ffd23a' },
    variants: [{ name: 'Crimson', c: {} }, { name: 'Rust', c: { skin: '#8a4a2a' } }, { name: 'Dark', c: { skin: '#5a2a2a', spike: '#d8c8b0', eye: '#ff6a2a' } }],
    draw: ({ g, c }) => {
      shoulders(g, shade(c.skin, -0.15), 72, 0.95);
      spikes(g, [[14, 86], [24, 78], [76, 78], [86, 86]], 12, c.spike, [0, -1]);
      head(g, c.skin, { top: 20, chin: 82, w: 23, jaw: 0.6 });
      // barbs over the scalp and cheeks
      const crest: number[][] = [];
      for (let i = 0; i < 7; i++) { const a = Math.PI * (1.1 + i * 0.13); crest.push([50 + Math.cos(a) * 24, 46 + Math.sin(a) * 28]); }
      for (const [x, y] of crest) { const dx = (x - 50) / 24, dy = (y - 46) / 28; poly(g, [[x - dy * 3, y + dx * 3], [x + dx * 12, y + dy * 12], [x + dy * 3, y - dx * 3]]); paint(g, litFill(g, x - 6, y - 12, 12, 12, c.spike, 0.3), INK, 1); }
      for (const s of SIDES) for (const y of [58, 66]) { poly(g, [[50 + s * 22, y - 2], [50 + s * 32, y - 4], [50 + s * 22, y + 3]]); paint(g, c.spike, INK, 1); }
      brows(g, 50, 39, 9, 5, 3, '#1a0a0a', 2.4);
      eyes(g, 50, 45, 9, 5, 3.8, c.eye, { pupil: 'slit', glow: c.eye, rot: 0.25 });
      nose(g, 50, 54, 'flat', c.skin);
      openMouth(g, 50, 63, 13, 8, { top: 6, bottom: 6, inside: '#2a0808', smile: 3 });
    },
  },
  {
    id: 'beardedDevil', name: 'Bearded Devil', family: 'fiend', size: 'Medium', cr: '3', tags: ['devil', 'glaive', 'tentacle beard', 'soldier'],
    c: { skin: '#7a8a4a', beard: '#3a4a2a', eye: '#ffd23a', horn: '#2a2420' },
    variants: [{ name: 'Olive', c: {} }, { name: 'Red', c: { skin: '#a8402e', beard: '#4a1a14' } }, { name: 'Brown', c: { skin: '#8a6a4a', beard: '#3a2a1a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, '#3a2a24', 74, 0.95);
      ears(g, 50, 42, 21, 'point', c.skin, 1);
      head(g, c.skin, { top: 20, chin: 76, w: 21, jaw: 0.7 });
      for (const s of SIDES) horn(g, 50 + s * 10, 24, 50 + s * 14, 10, 50 + s * 22, 4, 6, c.horn, 2);
      // writhing tentacle beard
      for (let i = 0; i < 9; i++) {
        const x0 = 34 + i * 4, len = 24 + r() * 14, sw = (r() - 0.5) * 14;
        g.beginPath(); g.moveTo(x0, 62); g.bezierCurveTo(x0 + sw, 62 + len * 0.4, x0 - sw, 62 + len * 0.7, x0 + sw * 0.5, 62 + len);
        g.strokeStyle = INK; g.lineWidth = 5.4; g.lineCap = 'round'; g.stroke();
        g.strokeStyle = shade(c.beard, (r() - 0.5) * 0.3); g.lineWidth = 3.4; g.stroke();
      }
      brows(g, 50, 37, 8, 5, 3, '#1a0a0a', 2.4);
      eyes(g, 50, 43, 8.5, 4.8, 3.6, c.eye, { pupil: 'slit', glow: c.eye, rot: 0.2 });
      nose(g, 50, 51, 'small', c.skin);
      mouthLine(g, 50, 60, 7, -2, 1.8);
    },
  },
  {
    id: 'boneDevil', name: 'Bone Devil', family: 'fiend', size: 'Large', cr: '9', tags: ['devil', 'skeletal', 'scorpion tail', 'sting'],
    c: { bone: '#d8cfb8', eye: '#ff3a1a', tail: '#b8ac90' },
    variants: [{ name: 'Bone', c: {} }, { name: 'Ash', c: { bone: '#a8a49c', tail: '#8a8680' } }, { name: 'Bloodstained', c: { bone: '#c8a890', tail: '#9a6a5a' } }],
    draw: ({ g, c }) => {
      // scorpion tail arching over the head
      g.beginPath(); g.moveTo(82, 100); g.bezierCurveTo(108, 50, 90, -4, 52, 6);
      g.strokeStyle = INK; g.lineWidth = 13; g.lineCap = 'round'; g.stroke();
      g.strokeStyle = c.tail; g.lineWidth = 10; g.stroke();
      for (let i = 0; i < 6; i++) { const t = 0.15 + i * 0.14, u = 1 - t; const x = u * u * u * 82 + 3 * u * u * t * 108 + 3 * u * t * t * 90 + t * t * t * 52, y = u * u * u * 100 + 3 * u * u * t * 50 + 3 * u * t * t * -4 + t * t * t * 6; circle(g, x, y, 1.4); g.fillStyle = alpha(INK, 0.6); g.fill(); }
      poly(g, [[54, 0], [38, 14], [52, 12]]); paint(g, '#f0e8d8', INK, 1.2);
      shoulders(g, shade(c.bone, -0.25), 72, 0.9);
      g.strokeStyle = alpha(INK, 0.5); g.lineWidth = 1.4;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(30, 80 + i * 6); g.quadraticCurveTo(50, 76 + i * 6, 70, 80 + i * 6); g.stroke(); }
      // gaunt skull face
      blob(g, [[50, 18], [68, 24], [72, 42], [64, 62], [58, 82], [50, 84], [42, 82], [36, 62], [28, 42], [32, 24]]);
      paint(g, domeFill(g, 46, 40, 34, c.bone, 0.3), INK, LW);
      for (const s of SIDES) horn(g, 50 + s * 12, 24, 50 + s * 16, 14, 50 + s * 14, 4, 5, shade(c.bone, -0.2), 2);
      for (const s of SIDES) { ellipse(g, 50 + s * 9, 42, 6.6, 5.6, s * 0.3); paint(g, '#180c0a', INK, 1.2); eye(g, 50 + s * 9, 43, 2.6, 2.4, c.eye, { white: null, pupil: 'none', glow: c.eye }); }
      poly(g, [[50, 50], [53, 58], [47, 58]]); paint(g, '#180c0a', null);
      // lipless teeth
      g.beginPath(); g.rect(40, 64, 20, 9); paint(g, '#f0e8d0', INK, 1.2);
      for (let i = 1; i < 5; i++) line(g, 40 + i * 4, 64, 40 + i * 4, 73, INK, 0.9);
      line(g, 40, 68.5, 60, 68.5, INK, 1);
    },
  },
  {
    id: 'chainDevil', name: 'Chain Devil', family: 'fiend', size: 'Medium', cr: '8', tags: ['devil', 'chains', 'torturer', 'hooks'],
    c: { skin: '#9a8a80', chain: '#7c8086', eye: '#ffcf3a' },
    variants: [{ name: 'Iron chains', c: {} }, { name: 'Rusted', c: { chain: '#8b5a3a' } }, { name: 'Black chains', c: { chain: '#3a3c40', skin: '#b0a090' } }],
    draw: ({ g, c }) => {
      shoulders(g, shade(c.skin, -0.15), 72, 0.95);
      head(g, c.skin, { top: 18, chin: 82, w: 21, jaw: 0.72 });
      const chainLine = (x1: number, y1: number, x2: number, y2: number) => {
        const n = Math.round(Math.hypot(x2 - x1, y2 - y1) / 6), a = Math.atan2(y2 - y1, x2 - x1);
        for (let i = 0; i <= n; i++) {
          const t = i / n, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
          ellipse(g, x, y, 4, i % 2 ? 1.6 : 2.6, a);
          g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.strokeStyle = c.chain; g.lineWidth = 1.6; g.stroke();
        }
      };
      chainLine(26, 30, 74, 24);
      chainLine(24, 58, 76, 52);
      chainLine(28, 74, 72, 80);
      chainLine(6, 82, 94, 96);
      chainLine(8, 98, 90, 74);
      // hooks dangling
      for (const x of [20, 82]) { g.beginPath(); g.moveTo(x, 90); g.lineTo(x, 100); g.arc(x - 3, 100, 3, 0, Math.PI); g.strokeStyle = INK; g.lineWidth = 2.6; g.stroke(); g.strokeStyle = c.chain; g.lineWidth = 1.4; g.stroke(); }
      eyes(g, 50, 42, 9, 5, 3.6, c.eye, { pupil: 'round', glow: c.eye });
      nose(g, 50, 48, 'flat', c.skin);
      mouthLine(g, 50, 68, 6, -1, 1.4);
    },
  },
  {
    id: 'hornedDevil', name: 'Horned Devil', family: 'fiend', size: 'Large', cr: '11', tags: ['devil', 'malebranche', 'fork', 'wings', 'brute'],
    c: { skin: '#5a3a30', horn: '#d8ccb0', wing: '#3a2018', eye: '#ffb02e' },
    variants: [{ name: 'Umber', c: {} }, { name: 'Black', c: { skin: '#2e2626', wing: '#1a1414' } }, { name: 'Red', c: { skin: '#8a2a22', wing: '#4a1410' } }],
    draw: ({ g, c }) => {
      batWings(g, c.wing, 58, 1.05, 4);
      shoulders(g, shade(c.skin, -0.1), 70, 1.05);
      ears(g, 50, 44, 24, 'point', c.skin, 0.9);
      head(g, c.skin, { top: 22, chin: 84, w: 25, jaw: 0.9, mid: 50 });
      // great forward horns
      for (const s of SIDES) horn(g, 50 + s * 16, 28, 50 + s * 40, 20, 50 + s * 34, -2, 12, c.horn, 4);
      browRidge(g, 50, 40, 20, c.skin);
      eyes(g, 50, 45, 10, 5, 3.6, c.eye, { white: null, pupil: 'none', glow: c.eye, rot: 0.25 });
      nose(g, 50, 55, 'broad', shade(c.skin, 0.1));
      openMouth(g, 50, 66, 14, 9, { top: 6, bottom: 5, fangs: 5, inside: '#2a0808' });
    },
  },
  {
    id: 'iceDevil', name: 'Ice Devil', family: 'fiend', size: 'Large', cr: '14', tags: ['devil', 'insect', 'cold', 'winter', 'mandibles'],
    c: { shell: '#b8d4e4', eye: '#3a8ad8', jaw: '#e8f4fa' },
    variants: [{ name: 'Frost', c: {} }, { name: 'Glacier blue', c: { shell: '#7aa8cc', eye: '#ffffff' } }, { name: 'Bone white', c: { shell: '#e0e4e4', eye: '#d83a3a' } }],
    draw: ({ g, c }) => {
      shoulders(g, shade(c.shell, -0.2), 70, 1.0);
      spikes(g, [[12, 84], [24, 74], [76, 74], [88, 84]], 16, shade(c.shell, 0.2));
      // crest spikes
      for (let i = -2; i <= 2; i++) { const x = 50 + i * 9; horn(g, x, 24, x + i * 2, 12, x + i * 5, 2 - (2 - Math.abs(i)) * 3, 6, shade(c.shell, 0.15)); }
      // insect head
      blob(g, [[50, 16], [72, 24], [78, 44], [68, 66], [50, 76], [32, 66], [22, 44], [28, 24]]);
      paint(g, domeFill(g, 46, 40, 34, c.shell, 0.35), INK, LW);
      line(g, 50, 18, 50, 48, alpha(shade(c.shell, -0.4), 0.7), 1.4);
      // huge faceted eyes
      for (const s of SIDES) {
        ellipse(g, 50 + s * 15, 42, 10, 8, s * 0.5); paint(g, domeFill(g, 50 + s * 15, 42, 10, c.eye, 0.5), INK, 1.5);
        g.strokeStyle = alpha('#ffffff', 0.35); g.lineWidth = 0.8;
        for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(50 + s * 15 + k * 4, 35); g.lineTo(50 + s * 15 + k * 4, 49); g.stroke(); }
        circle(g, 50 + s * 15 - 3, 38, 2); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fill();
      }
      // mandibles
      for (const s of SIDES) {
        g.beginPath(); g.moveTo(50 + s * 6, 64); g.quadraticCurveTo(50 + s * 18, 72, 50 + s * 10, 90); g.quadraticCurveTo(50 + s * 8, 78, 50 + s * 1, 72); g.closePath();
        paint(g, litFill(g, 40, 64, 20, 26, c.jaw, 0.3), INK, 1.4);
      }
      ellipse(g, 50, 66, 6, 4); paint(g, '#1a2a3a', INK, 1.2);
    },
  },
  {
    id: 'pitFiend', name: 'Pit Fiend', family: 'fiend', size: 'Large', cr: '20', tags: ['devil', 'archdevil', 'general', 'wings', 'boss'],
    c: { skin: '#a82a22', horn: '#7a6450', wing: '#5a1410', eye: '#ffe14a', armor: '#2a2224' },
    variants: [{ name: 'Crimson', c: {} }, { name: 'Black', c: { skin: '#2e2224', wing: '#1a1214', horn: '#c8b89a', eye: '#ff4a2a' } }, { name: 'Scarlet & gold', c: { armor: '#7a5a20' } }],
    draw: ({ g, c }) => {
      batWings(g, c.wing, 52, 1.12, 10);
      shoulders(g, c.armor, 72, 1.1);
      for (const s of SIDES) { blob(g, [[50 + s * 18, 70], [50 + s * 42, 66], [50 + s * 52, 82], [50 + s * 30, 86]]); paint(g, litFill(g, 0, 66, 100, 20, shade(c.armor, 0.2), 0.4), INK, 1.4); spikes(g, [[50 + s * 38, 70]], 10, '#c8b89a'); }
      ears(g, 50, 44, 22, 'point', c.skin, 0.8);
      head(g, c.skin, { top: 22, chin: 84, w: 23, jaw: 0.75 });
      // massive ram horns
      for (const s of SIDES) {
        horn(g, 50 + s * 14, 30, 50 + s * 36, -2, 50 + s * 42, 30, 14, c.horn, 5);
        horn(g, 50 + s * 41, 26, 50 + s * 42, 46, 50 + s * 30, 44, 9, c.horn, 2);
      }
      browRidge(g, 50, 40, 20, c.skin);
      eyes(g, 50, 45, 9.5, 5.2, 3.8, c.eye, { pupil: 'slit', glow: c.eye, rot: 0.25 });
      nose(g, 50, 54, 'flat', c.skin);
      openMouth(g, 50, 64, 12, 9, { top: 5, bottom: 4, fangs: 6, inside: '#1a0404' });
      // chin spikes
      for (const x of [42, 50, 58]) { poly(g, [[x - 2, 80], [x, 88], [x + 2, 80]]); paint(g, c.horn, INK, 0.9); }
    },
  },
  {
    id: 'balor', name: 'Balor', family: 'fiend', size: 'Huge', cr: '19', tags: ['demon', 'fire', 'whip', 'wings', 'boss'],
    c: { skin: '#3a1a16', horn: '#1a1210', fire: '#ff5a1a', fire2: '#ffd04a', eye: '#fff2a0', wing: '#2a0e0c' },
    variants: [{ name: 'Inferno', c: {} }, { name: 'Ember red', c: { skin: '#7a1a14' } }, { name: 'Hellfire green', c: { fire: '#3ac83a', fire2: '#d8ff8a', eye: '#e8ffb0' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      flameCrown(g, 50, 60, 52, 58, r, [c.fire, c.fire2], 12, Math.PI * 0.8, Math.PI * 2.2);
      batWings(g, c.wing, 56, 1.1, 8);
      shoulders(g, c.skin, 72, 1.1);
      // ember cracks
      g.strokeStyle = c.fire2; g.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) { const x = 14 + r() * 72, y = 80 + r() * 16; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 5, y + 3); g.lineTo(x + 3, y + 8); g.stroke(); }
      // flaming whip lash across the bottom
      g.beginPath(); g.moveTo(-4, 92); g.bezierCurveTo(30, 80, 60, 104, 104, 86);
      g.strokeStyle = alpha(c.fire, 0.7); g.lineWidth = 6; g.stroke(); g.strokeStyle = c.fire2; g.lineWidth = 2; g.stroke();
      head(g, c.skin, { top: 24, chin: 84, w: 22, jaw: 0.7 }, 0.4);
      for (const s of SIDES) horn(g, 50 + s * 14, 30, 50 + s * 38, 26, 50 + s * 40, 2, 11, c.horn, 3);
      browRidge(g, 50, 42, 18, c.skin);
      eyes(g, 50, 47, 9, 5, 3.6, c.eye, { white: null, pupil: 'none', glow: c.fire2, rot: 0.25 });
      nose(g, 50, 56, 'flat', c.skin);
      openMouth(g, 50, 66, 13, 9, { top: 6, bottom: 5, fangs: 5, inside: '#ff8a1a' });
    },
  },
  {
    id: 'vrock', name: 'Vrock', family: 'fiend', size: 'Large', cr: '6', tags: ['demon', 'vulture', 'bird', 'spores', 'screech'],
    c: { skin: '#8a7a6a', feather: '#3a3430', beak: '#d8c8a0', eye: '#ff3a1a' },
    variants: [{ name: 'Carrion grey', c: {} }, { name: 'Brown', c: { skin: '#9a6a4a', feather: '#3a2418' } }, { name: 'Blue-black', c: { skin: '#6a7a8a', feather: '#1e2228' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      featherWings(g, c.feather, 50, 1.05);
      shoulders(g, shade(c.feather, -0.1), 74, 0.95);
      // shaggy feather ruff
      const ruff: number[][] = [];
      for (let i = 0; i < 16; i++) { const a = Math.PI * 0.05 + (i / 15) * Math.PI * 0.9, k = i % 2 ? 1 : 0.8; ruff.push([50 + Math.cos(a) * 40 * k, 62 + Math.sin(a) * 30 * k]); }
      poly(g, [[12, 62], ...ruff.reverse(), [88, 62]]);
      paint(g, litFill(g, 10, 58, 80, 36, c.feather, 0.3), INK, LW);
      void r;
      // bald vulture head
      blob(g, [[50, 14], [68, 20], [74, 38], [68, 58], [50, 66], [32, 58], [26, 38], [32, 20]]);
      paint(g, domeFill(g, 46, 34, 30, c.skin, 0.3), INK, LW);
      g.strokeStyle = alpha(shade(c.skin, -0.45), 0.6); g.lineWidth = 1.1;
      for (const s of SIDES) { g.beginPath(); g.moveTo(50 + s * 18, 50); g.quadraticCurveTo(50 + s * 14, 58, 50 + s * 8, 60); g.stroke(); }
      brows(g, 50, 30, 11, 5, 3, '#1a0a0a', 2.4);
      eyes(g, 50, 35, 12, 5, 4, c.eye, { white: null, pupil: 'none', glow: c.eye, rot: 0.3 });
      // big hooked beak
      g.beginPath(); g.moveTo(40, 40); g.quadraticCurveTo(50, 34, 60, 40); g.quadraticCurveTo(62, 58, 52, 74); g.quadraticCurveTo(48, 70, 47, 64); g.quadraticCurveTo(40, 56, 40, 40);
      paint(g, litFill(g, 40, 34, 22, 40, c.beak, 0.3), INK, 1.6);
      g.beginPath(); g.moveTo(42, 56); g.quadraticCurveTo(50, 62, 58, 54); g.strokeStyle = INK; g.lineWidth = 1.3; g.stroke();
      for (const s of SIDES) { ellipse(g, 50 + s * 4, 45, 1.4, 2); g.fillStyle = INK; g.fill(); }
    },
  },
  {
    id: 'hezrou', name: 'Hezrou', family: 'fiend', size: 'Large', cr: '8', tags: ['demon', 'toad', 'stench', 'swamp'],
    c: { skin: '#6a7a4a', belly: '#c8b890', eye: '#ffd23a', spike: '#3a2a1e' },
    variants: [{ name: 'Swamp green', c: {} }, { name: 'Mud brown', c: { skin: '#7a5a3a' } }, { name: 'Bruise purple', c: { skin: '#6a4a6a', eye: '#9aff4a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // spines behind
      for (let i = 0; i < 7; i++) { const x = 14 + i * 12; horn(g, x, 52, x + (x - 50) * 0.15, 32, x + (x - 50) * 0.3, 18 + Math.abs(x - 50) * 0.25, 8, c.spike); }
      shoulders(g, c.skin, 66, 1.12);
      // wide flat toad head
      blob(g, [[50, 26], [80, 30], [94, 50], [86, 74], [50, 86], [14, 74], [6, 50], [20, 30]]);
      paint(g, domeFill(g, 44, 44, 48, c.skin, 0.3), INK, LW);
      warts(g, r, 16, 34, 68, 30, 10, shade(c.skin, -0.2), 1.6);
      // bulging eyes on top
      for (const s of SIDES) { circle(g, 50 + s * 22, 30, 11); paint(g, domeFill(g, 50 + s * 22, 30, 11, c.skin), INK, LW); eye(g, 50 + s * 22, 30, 7, 6, c.eye, { pupil: 'slit' }); }
      // huge mouth with teeth
      g.beginPath(); g.moveTo(14, 56); g.quadraticCurveTo(50, 62, 86, 56); g.quadraticCurveTo(70, 82, 50, 82); g.quadraticCurveTo(30, 82, 14, 56);
      paint(g, '#3a1410', INK, 1.6);
      g.save(); g.clip();
      ellipse(g, 50, 82, 20, 8); g.fillStyle = c.belly; g.fill();
      g.fillStyle = '#efe6cc';
      for (let i = 0; i < 9; i++) { const x = 20 + i * 7.5, y = 57.5 + Math.sin((i / 8) * Math.PI) * 2.6; poly(g, [[x - 2.6, y - 1], [x, y + 5], [x + 2.6, y - 1]]); g.fill(); }
      g.restore();
      for (const s of SIDES) { circle(g, 50 + s * 4, 46, 1.4); g.fillStyle = INK; g.fill(); }
    },
  },
  {
    id: 'glabrezu', name: 'Glabrezu', family: 'fiend', size: 'Large', cr: '9', tags: ['demon', 'pincers', 'wish', 'tempter', 'four arms'],
    c: { skin: '#a84a3a', horn: '#2a1e1a', claw: '#7a3a2e', eye: '#ffe14a' },
    variants: [{ name: 'Brick red', c: {} }, { name: 'Ochre', c: { skin: '#a87a3a', claw: '#7a5420' } }, { name: 'Ash', c: { skin: '#7a706a', claw: '#5a524e' } }],
    draw: ({ g, c }) => {
      // two great pincers raised behind
      for (const s of SIDES) {
        g.save(); g.translate(50 + s * 30, 66); g.rotate(s * 0.18);
        poly(g, [[-7, 40], [-9, 2], [-15, -18], [-12, -40], [-4, -50], [-6, -30], [-1, -16], [1, -16], [6, -30], [4, -50], [12, -40], [15, -18], [9, 2], [7, 40]]);
        paint(g, litFill(g, -15, -50, 30, 90, c.claw, 0.3), INK, LW);
        g.restore();
      }
      shoulders(g, shade(c.skin, -0.1), 72, 1.0);
      // canine-ish head
      blob(g, [[50, 20], [70, 26], [76, 44], [68, 60], [50, 66], [32, 60], [24, 44], [30, 26]]);
      paint(g, domeFill(g, 46, 40, 32, c.skin, 0.3), INK, LW);
      for (const s of SIDES) horn(g, 50 + s * 14, 26, 50 + s * 22, 6, 50 + s * 14, -4, 7, c.horn, 2);
      blob(g, [[50, 48], [62, 54], [62, 72], [50, 84], [38, 72], [38, 54]]);
      paint(g, domeFill(g, 48, 60, 20, shade(c.skin, 0.06), 0.3), INK, LW * 0.8);
      ellipse(g, 50, 56, 5, 3.4); paint(g, '#1a0c0a', INK, 1);
      openMouth(g, 50, 70, 10, 8, { top: 5, fangs: 5, inside: '#2a0808' });
      brows(g, 50, 36, 9, 5, 3, '#1a0a0a', 2.2);
      eyes(g, 50, 42, 10, 5, 3.6, c.eye, { pupil: 'slit', glow: c.eye, rot: 0.3 });
    },
  },
  {
    id: 'marilith', name: 'Marilith', family: 'fiend', size: 'Large', cr: '16', tags: ['demon', 'six arms', 'serpent', 'swords', 'general'],
    c: { skin: '#3f7a5a', scale: '#2a5a42', hair: '#1a1416', eye: '#ffe14a', blade: '#c9ced3' },
    variants: [{ name: 'Jade', c: {} }, { name: 'Crimson', c: { skin: '#a8443a', scale: '#6a2a24' } }, { name: 'Violet', c: { skin: '#6a4a8a', scale: '#3a2a5a', hair: '#e8e0f0' } }],
    draw: ({ g, c }) => {
      // six arms fanned with blades
      for (const [a, k] of [[-2.5, 1], [-1.95, 0.9], [-1.25, 1], [2.5 - Math.PI * 2 + Math.PI * 2, 1], [1.95, 0.9], [1.25, 1]] as [number, number][]) {
        void k;
        const ang = a - Math.PI / 2;
        const ex = 50 + Math.cos(ang) * 30, ey = 66 + Math.sin(ang) * 30;
        // blade
        g.save(); g.translate(ex, ey); g.rotate(ang + Math.PI / 2);
        poly(g, [[-2.6, 0], [-2.2, -30], [0, -36], [2.2, -30], [2.6, 0]]); paint(g, litFill(g, -3, -36, 6, 36, c.blade, 0.4), INK, 1.2);
        g.fillStyle = '#c9a24a'; g.fillRect(-6, -1, 12, 3); g.strokeStyle = INK; g.lineWidth = 0.9; g.strokeRect(-6, -1, 12, 3);
        g.restore();
        g.beginPath(); g.moveTo(50 + Math.cos(ang) * 10, 70 + Math.sin(ang) * 6); g.lineTo(ex, ey);
        g.strokeStyle = INK; g.lineWidth = 8; g.lineCap = 'round'; g.stroke(); g.strokeStyle = c.skin; g.lineWidth = 5.6; g.stroke();
        circle(g, ex, ey, 3.6); paint(g, shade(c.skin, -0.05), INK, 1.2);
      }
      blob(g, [[30, 40], [30, 16], [50, 10], [70, 16], [70, 40], [76, 80], [24, 80]]);
      paint(g, litFill(g, 24, 10, 52, 70, c.hair, 0.25), INK, LW);
      shoulders(g, c.scale, 74, 0.8);
      g.strokeStyle = alpha(shade(c.scale, -0.5), 0.6); g.lineWidth = 1;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) { g.beginPath(); g.arc(22 + j * 11 + (i % 2) * 5, 82 + i * 6, 4, 0.2, Math.PI - 0.2); g.stroke(); }
      head(g, c.skin, { top: 20, chin: 76, w: 18, jaw: 0.55 });
      blob(g, [[32, 40], [34, 18], [50, 12], [66, 18], [68, 40], [60, 26], [50, 24], [40, 26]]);
      paint(g, litFill(g, 32, 12, 36, 26, c.hair, 0.25), INK, 1.3);
      eyes(g, 50, 44, 8, 4.4, 3, c.eye, { pupil: 'slit', glow: c.eye, rot: 0.2 });
      nose(g, 50, 52, 'small', c.skin);
      g.beginPath(); g.moveTo(44, 62); g.quadraticCurveTo(50, 60, 56, 62); g.quadraticCurveTo(50, 66, 44, 62); paint(g, '#4a0e18', INK, 1);
    },
  },
  {
    id: 'nalfeshnee', name: 'Nalfeshnee', family: 'fiend', size: 'Large', cr: '13', tags: ['demon', 'boar', 'judge', 'wings', 'brute'],
    c: { skin: '#7a5a4a', hide: '#5a3e30', tusk: '#efe4c4', eye: '#ff3a1a', wing: '#c8b8a0' },
    variants: [{ name: 'Brown', c: {} }, { name: 'Black boar', c: { skin: '#3a3230', hide: '#2a2220' } }, { name: 'Bloody', c: { skin: '#8a3a30', hide: '#5a2018' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // tiny feathered wings
      for (const s of SIDES) { blob(g, [[50 + s * 24, 52], [50 + s * 40, 22], [50 + s * 48, 34], [50 + s * 40, 54]]); paint(g, litFill(g, 0, 22, 100, 32, c.wing, 0.25), INK, 1.6); }
      shoulders(g, c.hide, 64, 1.18);
      strands(g, r, 10, 66, 80, 26, 14, alpha(shade(c.hide, -0.5), 0.8), 1.2);
      // boar head
      for (const s of SIDES) { poly(g, [[50 + s * 16, 30], [50 + s * 30, 14], [50 + s * 28, 36]]); paint(g, domeFill(g, 50 + s * 24, 26, 12, c.skin), INK, LW); }
      blob(g, [[50, 20], [70, 26], [78, 46], [70, 66], [50, 72], [30, 66], [22, 46], [30, 26]]);
      paint(g, domeFill(g, 46, 40, 32, c.skin, 0.3), INK, LW);
      // bristly crest
      strands(g, r, 42, 14, 16, 16, 8, shade(c.hide, -0.4), 1.6);
      brows(g, 50, 38, 9, 5, 3, '#1a0a0a', 2.4);
      eyes(g, 50, 43, 9, 4, 3.4, c.eye, { white: null, pupil: 'none', glow: c.eye, rot: 0.3 });
      // snout
      ellipse(g, 50, 62, 14, 10); paint(g, domeFill(g, 48, 60, 14, shade(c.skin, 0.12), 0.3), INK, LW * 0.9);
      for (const s of SIDES) { ellipse(g, 50 + s * 5, 62, 2.4, 3.4); g.fillStyle = '#1a0c0a'; g.fill(); }
      for (const s of SIDES) tusk(g, 50 + s * 13, 72, 16, s, c.tusk, 3.4);
      mouthLine(g, 50, 74, 10, -2, 1.8);
    },
  },
  {
    id: 'rakshasa', name: 'Rakshasa', family: 'fiend', size: 'Medium', cr: '13', tags: ['tiger', 'noble', 'deceiver', 'folklore', 'spellcaster'],
    c: { fur: '#d8822e', stripe: '#1e1410', muzzle: '#f4ead8', robe: '#5a2a6a', gold: '#e2b84a', eye: '#9aff6a' },
    variants: [{ name: 'Orange tiger', c: {} }, { name: 'White tiger', c: { fur: '#e8e2d8', eye: '#7ac8ff', robe: '#2a3a6a' } }, { name: 'Crimson robes', c: { robe: '#8a1e22' } }, { name: 'Black tiger', c: { fur: '#3a3230', stripe: '#0e0a0a', muzzle: '#9a8a80', eye: '#ffd23a' } }],
    draw: ({ g, c }) => {
      shoulders(g, c.robe, 74, 0.95);
      g.beginPath(); g.moveTo(26, 74); g.quadraticCurveTo(50, 104, 74, 74); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.strokeStyle = c.gold; g.lineWidth = 3.6; g.stroke();
      gem(g, 50, 89, 4, '#d83a5a');
      for (const s of SIDES) { circle(g, 50 + s * 24, 18, 8); paint(g, domeFill(g, 50 + s * 24, 18, 8, c.fur), INK, LW); circle(g, 50 + s * 24, 19, 4); g.fillStyle = '#3a2418'; g.fill(); }
      // wide feline head with cheek ruff
      blob(g, [[50, 14], [70, 18], [82, 36], [88, 56], [74, 70], [50, 78], [26, 70], [12, 56], [18, 36], [30, 18]]);
      paint(g, domeFill(g, 46, 40, 40, c.fur, 0.3), INK, LW);
      // stripes
      g.fillStyle = c.stripe;
      for (const s of SIDES) {
        for (const [x, y, l] of [[16, 46, 12], [18, 56, 12], [20, 36, 10]]) { poly(g, [[50 + s * (50 - x), y - 2.4], [50 + s * (50 - x - l), y], [50 + s * (50 - x), y + 2.4]]); g.fill(); }
        poly(g, [[50 + s * 4, 18], [50 + s * 8, 30], [50 + s * 2, 26]]); g.fill();
      }
      poly(g, [[46, 16], [50, 28], [54, 16]]); g.fill();
      // muzzle
      for (const s of SIDES) { ellipse(g, 50 + s * 7, 60, 9, 7); paint(g, domeFill(g, 50 + s * 7, 58, 9, c.muzzle, 0.2), INK, 1.2); }
      poly(g, [[44, 50], [56, 50], [50, 57]]); paint(g, '#c86a6a', INK, 1.2);
      ellipse(g, 50, 70, 5, 3.4); paint(g, c.muzzle, INK, 1);
      for (const s of SIDES) { poly(g, [[50 + s * 3, 64], [50 + s * 4, 70], [50 + s * 5, 64]]); paint(g, '#fff', INK, 0.7); }
      for (const s of SIDES) for (const y of [58, 62]) line(g, 50 + s * 16, y, 50 + s * 30, y + (y - 60) * 2, alpha('#ffffff', 0.8), 0.9);
      eyes(g, 50, 40, 11, 5.4, 4.2, c.eye, { pupil: 'slit', glow: c.eye, rot: 0.25 });
    },
  },
];

// ======================================================================================
// CELESTIALS
// ======================================================================================
/** Radiant sunburst rays behind a figure. */
function sunburst(g: G, cx: number, cy: number, r1: number, r2: number, n: number, col: string) {
  glow(g, cx, cy, r2 * 1.1, col, 0.55);
  g.fillStyle = alpha(col, 0.55);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, w = Math.PI / n * 0.45;
    poly(g, [[cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1], [cx + Math.cos(a) * (i % 2 ? r2 : r2 * 0.8), cy + Math.sin(a) * (i % 2 ? r2 : r2 * 0.8)], [cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1]]);
    g.fill();
  }
}
/** Front view of a horse head, with mane on both sides. */
function horseHead(g: G, coat: string, mane: string, rand: () => number, iris = '#2a1e1a', between?: () => void) {
  // mane falling behind the head on both sides
  for (const s of SIDES) {
    g.beginPath(); g.moveTo(50 + s * 6, 12); g.quadraticCurveTo(50 + s * 36, 14, 50 + s * 40, 50); g.quadraticCurveTo(50 + s * 44, 80, 50 + s * 34, 104);
    g.lineTo(50 + s * 16, 104); g.quadraticCurveTo(50 + s * 24, 60, 50 + s * 10, 30); g.closePath();
    paint(g, litFill(g, 6, 12, 88, 92, mane, 0.25), INK, LW);
    g.strokeStyle = alpha(shade(mane, -0.4), 0.6); g.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(50 + s * (14 + i * 7), 22 + i * 4); g.quadraticCurveTo(50 + s * (30 + i * 4), 56, 50 + s * (24 + i * 5), 96); g.stroke(); }
  }
  if (between) between();
  for (const s of SIDES) {
    poly(g, [[50 + s * 8, 24], [50 + s * 15, 0], [50 + s * 22, 22]]);
    paint(g, domeFill(g, 50 + s * 15, 14, 10, coat), INK, LW);
    poly(g, [[50 + s * 11, 21], [50 + s * 15, 7], [50 + s * 19, 21]]); g.fillStyle = alpha(shade(coat, -0.4), 0.7); g.fill();
  }
  // long face: broad brow, narrow nose bridge, rounded muzzle
  g.beginPath();
  g.moveTo(50, 14);
  g.bezierCurveTo(66, 14, 76, 24, 72, 42);
  g.bezierCurveTo(70, 52, 63, 58, 63, 68);
  g.bezierCurveTo(68, 78, 68, 94, 50, 96);
  g.bezierCurveTo(32, 94, 32, 78, 37, 68);
  g.bezierCurveTo(37, 58, 30, 52, 28, 42);
  g.bezierCurveTo(24, 24, 34, 14, 50, 14);
  paint(g, domeFill(g, 46, 40, 46, coat, 0.3), INK, LW);
  // muzzle
  ellipse(g, 50, 84, 14, 10);
  g.fillStyle = alpha(mix(coat, '#6a5a5a', 0.45), 0.75); g.fill();
  for (const s of SIDES) { ellipse(g, 50 + s * 6.5, 84, 2.6, 3.8, s * 0.35); paint(g, '#2a1e1a', INK, 0.8); }
  g.beginPath(); g.moveTo(44, 92); g.quadraticCurveTo(50, 95, 56, 92); g.strokeStyle = alpha(INK, 0.7); g.lineWidth = 1.1; g.stroke();
  // forelock
  blob(g, [[40, 16], [50, 10], [60, 16], [58, 30], [52, 38], [46, 32], [42, 26]]);
  paint(g, litFill(g, 40, 10, 20, 28, mane, 0.25), INK, 1.3);
  for (const s of SIDES) eye(g, 50 + s * 16, 42, 4.4, 5, iris, { pupil: 'round', rot: s * 0.4 });
  void rand;
}

const CELESTIALS: CreatureDef[] = [
  {
    id: 'deva', name: 'Deva', family: 'celestial', size: 'Medium', cr: '10', tags: ['angel', 'messenger', 'wings', 'holy', 'halo'],
    c: { skin: '#c8ccd4', hair: '#f2f0e8', eye: '#fff8d0', robe: '#f2ecda', wing: '#f6f4ee', gold: '#e2b84a' },
    variants: [{ name: 'Silver', c: {} }, { name: 'Gold', c: { skin: '#d8b45a', hair: '#7a4a1e' } }, { name: 'Bronze', c: { skin: '#a8743c', hair: '#2a1a12' } }, { name: 'Sky', c: { skin: '#9ab8d8', hair: '#ffffff', robe: '#cfe0f2' } }],
    draw: ({ g, c }) => {
      featherWings(g, c.wing, 48, 1.05, shade(c.wing, -0.08));
      halo(g, 50, 20, 20, c.gold);
      shoulders(g, c.robe, 74, 0.85);
      g.beginPath(); g.moveTo(34, 74); g.quadraticCurveTo(50, 96, 66, 74); g.strokeStyle = INK; g.lineWidth = 4.6; g.stroke(); g.strokeStyle = c.gold; g.lineWidth = 2.8; g.stroke();
      head(g, c.skin, { top: 22, chin: 78, w: 19, jaw: 0.6 });
      blob(g, [[30, 44], [32, 22], [50, 16], [68, 22], [70, 44], [62, 30], [50, 26], [38, 30]]);
      paint(g, litFill(g, 30, 16, 40, 28, c.hair, 0.2), INK, 1.4);
      eyes(g, 50, 46, 8, 4.4, 3, c.eye, { white: null, pupil: 'none', glow: '#fff4b0' });
      nose(g, 50, 54, 'small', c.skin);
      mouthLine(g, 50, 64, 4.5, 1, 1.4);
    },
  },
  {
    id: 'planetar', name: 'Planetar', family: 'celestial', size: 'Large', cr: '16', tags: ['angel', 'warrior', 'wings', 'holy', 'greatsword'],
    c: { skin: '#4f9a6a', eye: '#fff8d0', armor: '#d8d2c0', wing: '#f6f4ee', gold: '#e2b84a', blade: '#e8eef4' },
    variants: [{ name: 'Emerald', c: {} }, { name: 'Jade', c: { skin: '#3a7a6a' } }, { name: 'Gold armor', c: { armor: '#d8b45a' } }],
    draw: ({ g, c }) => {
      featherWings(g, c.wing, 46, 1.12);
      // greatsword hilt over shoulder
      g.save(); g.translate(78, 62); g.rotate(0.35);
      poly(g, [[-3, 0], [-3, -40], [0, -46], [3, -40], [3, 0]]); paint(g, litFill(g, -3, -46, 6, 46, c.blade, 0.4), INK, 1.2);
      g.fillStyle = c.gold; g.fillRect(-9, -1, 18, 4); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(-9, -1, 18, 4);
      g.restore();
      halo(g, 50, 20, 22, c.gold);
      shoulders(g, c.armor, 72, 1.0);
      for (const s of SIDES) { blob(g, [[50 + s * 18, 70], [50 + s * 42, 66], [50 + s * 50, 84], [50 + s * 28, 86]]); paint(g, litFill(g, 0, 66, 100, 20, shade(c.armor, 0.15), 0.4), INK, 1.4); }
      gem(g, 50, 86, 5, '#ffe9a0');
      ears(g, 50, 46, 21, 'round', c.skin, 0.6);
      head(g, c.skin, { top: 22, chin: 80, w: 21, jaw: 0.75 });
      brows(g, 50, 40, 8, 5, 1.2, shade(c.skin, -0.45), 2);
      eyes(g, 50, 46, 9, 4.6, 3.2, c.eye, { white: null, pupil: 'none', glow: '#fff4b0' });
      nose(g, 50, 55, 'small', c.skin);
      mouthLine(g, 50, 66, 5.5, -0.5, 1.6);
    },
  },
  {
    id: 'solar', name: 'Solar', family: 'celestial', size: 'Large', cr: '21', tags: ['angel', 'radiant', 'sun', 'wings', 'holy', 'boss'],
    c: { skin: '#e8c070', hair: '#fff8e8', eye: '#ffffff', armor: '#f2d27a', wing: '#fffaf0', ray: '#ffe9a0' },
    variants: [{ name: 'Radiant gold', c: {} }, { name: 'Silver light', c: { skin: '#d8dce4', armor: '#e8ecf2', ray: '#e8f4ff' } }, { name: 'Dawn', c: { skin: '#e8a070', ray: '#ffc0a0', hair: '#ffe8c8' } }],
    draw: ({ g, c }) => {
      sunburst(g, 50, 40, 20, 56, 16, c.ray);
      featherWings(g, c.wing, 46, 1.1, c.armor);
      shoulders(g, c.armor, 72, 0.95);
      for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(50, 120, 38 + i * 6, Math.PI * 1.25, Math.PI * 1.75); g.strokeStyle = alpha(shade(c.armor, -0.4), 0.6); g.lineWidth = 1.2; g.stroke(); }
      blob(g, [[28, 40], [30, 14], [50, 8], [70, 14], [72, 40], [78, 74], [22, 74]]);
      paint(g, litFill(g, 22, 8, 56, 66, c.hair, 0.15), INK, LW);
      head(g, c.skin, { top: 20, chin: 78, w: 19, jaw: 0.65 }, 0.25);
      blob(g, [[31, 40], [33, 18], [50, 12], [67, 18], [69, 40], [62, 28], [50, 24], [38, 28]]);
      paint(g, litFill(g, 31, 12, 38, 28, c.hair, 0.15), INK, 1.3);
      eyes(g, 50, 45, 8, 4.6, 3.2, c.eye, { white: null, pupil: 'none', glow: c.ray });
      nose(g, 50, 53, 'small', c.skin);
      mouthLine(g, 50, 63, 5, 0, 1.5);
      // diadem
      poly(g, [[44, 22], [50, 12], [56, 22], [50, 26]]); paint(g, litFill(g, 44, 12, 12, 14, c.armor, 0.4), INK, 1.1);
    },
  },
  {
    id: 'pegasus', name: 'Pegasus', family: 'celestial', size: 'Large', cr: '2', tags: ['horse', 'winged', 'mount', 'steed', 'flying'],
    c: { coat: '#f2f0ea', mane: '#d8dce4', wing: '#ffffff', eye: '#3a6aa8' },
    variants: [{ name: 'White', c: {} }, { name: 'Dapple grey', c: { coat: '#b8bcc0', mane: '#6a6e74', wing: '#e8eaee' } }, { name: 'Palomino', c: { coat: '#e2c084', mane: '#f6eedc', wing: '#fff8ea' } }, { name: 'Black', c: { coat: '#2e2a2c', mane: '#1a1618', wing: '#6a6668', eye: '#8ab8e8' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      horseHead(g, c.coat, c.mane, r, c.eye, () => {
        // wings raised from the shoulders, in front of the mane
        for (const s of SIDES) {
          g.save(); g.translate(50 + s * 19, 76); g.scale(s * 0.85, 0.95);
          blob(g, [[-8, 10], [0, -30], [14, -62], [26, -60], [24, -34], [28, -12], [16, 14]]);
          paint(g, litFill(g, -8, -62, 36, 76, c.wing, 0.25), INK, LW);
          for (let i = 0; i < 4; i++) { ellipse(g, 14 + i * 2, -48 + i * 13, 9, 4, 1.2 - i * 0.15); paint(g, domeFill(g, 14, -48 + i * 13, 9, shade(c.wing, -0.05 * i), 0.25), alpha(shade(c.wing, -0.6), 0.8), 1); }
          g.restore();
        }
      });
    },
  },
  {
    id: 'unicorn', name: 'Unicorn', family: 'celestial', size: 'Large', cr: '5', tags: ['horse', 'horn', 'forest', 'holy', 'healing'],
    c: { coat: '#f6f4f0', mane: '#e8d8f0', horn: '#f0dca0', eye: '#5a3a8a' },
    variants: [{ name: 'White', c: {} }, { name: 'Silver mane', c: { mane: '#c8d0dc', horn: '#e8eef4' } }, { name: 'Golden mane', c: { mane: '#f0cf6a' } }, { name: 'Moonlit', c: { coat: '#c8d0e4', mane: '#4a5a9a', horn: '#e8f0ff' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 30, 50, '#fff8e0', 0.4);
      shoulders(g, shade(c.coat, -0.08), 80, 0.8);
      horseHead(g, c.coat, c.mane, r, c.eye);
      // spiral horn
      glow(g, 50, 8, 14, '#ffffff', 0.7);
      poly(g, [[43.5, 28], [50, 0], [56.5, 28]]);
      paint(g, litFill(g, 43, 0, 14, 28, c.horn, 0.35), INK, 1.6);
      g.strokeStyle = alpha(shade(c.horn, -0.5), 0.85); g.lineWidth = 1.1;
      for (let i = 0; i < 5; i++) { const y = 25 - i * 5, hw = 6 - i * 1.15; g.beginPath(); g.moveTo(50 - hw, y + 1); g.lineTo(50 + hw, y - 2.4); g.stroke(); }
    },
  },
  {
    id: 'couatl', name: 'Couatl', family: 'celestial', size: 'Medium', cr: '4', tags: ['serpent', 'feathered', 'snake', 'wings', 'guardian'],
    c: { scale: '#3aa88a', belly: '#e8d890', eye: '#ffd23a', f1: '#e8443a', f2: '#f2b03a', f3: '#3a8ae8' },
    variants: [{ name: 'Jade', c: {} }, { name: 'Gold', c: { scale: '#d8a83a', belly: '#f6eac0' } }, { name: 'Sky blue', c: { scale: '#3a8ac8', f3: '#3ac88a' } }],
    draw: ({ g, c }) => {
      // rainbow feather crest fan
      const cols = [c.f3, c.f2, c.f1, c.f2, c.f3];
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (1.0 + i / 8), x = 50 + Math.cos(a) * 34, y = 46 + Math.sin(a) * 38;
        g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2);
        ellipse(g, 0, 0, 6, 15); paint(g, domeFill(g, 0, -4, 14, cols[i % 5], 0.3), INK, 1.2);
        line(g, 0, -12, 0, 12, alpha('#ffffff', 0.5), 0.9);
        g.restore();
      }
      // coiled body
      g.beginPath(); g.moveTo(-4, 96); g.bezierCurveTo(30, 66, 70, 110, 104, 80);
      g.strokeStyle = INK; g.lineWidth = 22; g.lineCap = 'round'; g.stroke(); g.strokeStyle = c.scale; g.lineWidth = 19; g.stroke();
      g.strokeStyle = alpha(c.belly, 0.8); g.lineWidth = 5; g.stroke();
      // neck and diamond head
      blob(g, [[42, 92], [40, 66], [50, 60], [60, 66], [58, 92]]); paint(g, domeFill(g, 48, 74, 20, c.scale), INK, LW);
      blob(g, [[50, 18], [68, 30], [74, 46], [62, 66], [50, 74], [38, 66], [26, 46], [32, 30]]);
      paint(g, domeFill(g, 46, 40, 32, c.scale, 0.35), INK, LW);
      g.strokeStyle = alpha(shade(c.scale, -0.45), 0.6); g.lineWidth = 1;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(40 + j * 10 + (i % 2) * 5, 26 + i * 7, 4, 0.2, Math.PI - 0.2); g.stroke(); }
      eyes(g, 50, 46, 13, 5.6, 4.4, c.eye, { pupil: 'slit', rot: 0.25 });
      for (const s of SIDES) { circle(g, 50 + s * 4, 60, 1.2); g.fillStyle = INK; g.fill(); }
      g.beginPath(); g.moveTo(50, 72); g.lineTo(50, 82); g.lineTo(47, 86); g.moveTo(50, 82); g.lineTo(53, 86); g.strokeStyle = '#d83a4a'; g.lineWidth = 1.6; g.stroke();
    },
  },
];

// ======================================================================================
// ELEMENTALS
// ======================================================================================
type MephitKind = 'magma' | 'ice' | 'dust' | 'steam' | 'mud' | 'smoke';
function mephit(g: G, c: Record<string, string>, rand: () => number, kind: MephitKind) {
  // stubby wings
  for (const s of SIDES) {
    poly(g, [[50 + s * 18, 62], [50 + s * 34, 30], [50 + s * 48, 40], [50 + s * 42, 54], [50 + s * 48, 64], [50 + s * 30, 70]]);
    paint(g, litFill(g, 0, 30, 100, 40, c.wing, 0.3), INK, LW * 0.9);
  }
  shoulders(g, shade(c.skin, -0.12), 76, 0.6);
  ears(g, 50, 46, 19, 'point', c.skin, 0.9);
  const hp = headPts({ top: 24, chin: 80, w: 21, jaw: 0.55, mid: 48 });
  blob(g, hp);
  paint(g, domeFill(g, 46, 46, 32, c.skin, 0.35), INK, LW);
  g.save(); blob(g, hp); g.clip();
  if (kind === 'magma') {
    g.strokeStyle = c.glow; g.lineWidth = 1.6;
    for (let i = 0; i < 7; i++) { const x = 30 + rand() * 40, y = 28 + rand() * 44; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4, y + 4); g.lineTo(x + 2, y + 9); g.stroke(); }
  } else if (kind === 'ice') {
    for (let i = 0; i < 4; i++) { const x = 32 + rand() * 36, y = 30 + rand() * 40; poly(g, [[x, y - 5], [x + 3, y], [x, y + 5], [x - 3, y]]); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fill(); }
  } else if (kind === 'mud') {
    for (let i = 0; i < 6; i++) { circle(g, 30 + rand() * 40, 28 + rand() * 44, 1.5 + rand() * 2); g.fillStyle = alpha(shade(c.skin, -0.3), 0.6); g.fill(); }
  } else if (kind === 'dust') {
    speckle2(g, rand, 28, 26, 44, 50, 26, alpha(shade(c.skin, -0.35), 0.5));
  }
  g.restore();
  if (kind === 'ice') for (let i = -2; i <= 2; i++) { const x = 50 + i * 8; poly(g, [[x - 3, 28], [x + i * 2, 12 - (2 - Math.abs(i)) * 3], [x + 3, 28]]); paint(g, litFill(g, x - 3, 8, 6, 20, '#e8f8ff', 0.3), INK, 1); }
  if (kind === 'magma' || kind === 'smoke' || kind === 'steam') for (const s of SIDES) horn(g, 50 + s * 9, 26, 50 + s * 11, 16, 50 + s * 16, 10, 5, kind === 'magma' ? '#2a1e1a' : shade(c.skin, -0.3));
  if (kind === 'mud') for (const x of [38, 47, 60]) { g.beginPath(); g.moveTo(x - 3, 74); g.quadraticCurveTo(x - 3, 86, x, 88); g.quadraticCurveTo(x + 3, 86, x + 3, 74); paint(g, c.skin, INK, 1.1); }
  if (kind === 'magma') { g.beginPath(); g.moveTo(56, 74); g.quadraticCurveTo(55, 86, 58, 90); g.quadraticCurveTo(61, 86, 60, 74); paint(g, c.glow, INK, 1); glow(g, 58, 88, 8, c.glow, 0.7); }
  const hollow = kind === 'dust';
  if (hollow) for (const s of SIDES) { ellipse(g, 50 + s * 9, 46, 5.4, 5, s * 0.2); paint(g, '#1a120c', INK, 1.1); circle(g, 50 + s * 9, 46.5, 1.6); g.fillStyle = c.eye; g.fill(); }
  else eyes(g, 50, 46, 9, 5.4, 4.6, c.eye, { pupil: kind === 'ice' ? 'round' : 'slit', glow: kind === 'magma' || kind === 'smoke' ? c.eye : undefined, rot: 0.2 });
  if (kind === 'steam') {
    smirk(g, 50, 63, 9, 3, 0);
  } else if (kind === 'mud') {
    mouthLine(g, 50, 64, 8, -2.4, 1.8);
  } else smirk(g, 50, 62, 11, 4.5, 3);
  // aura
  if (kind === 'smoke' || kind === 'steam' || kind === 'dust') {
    for (let i = 0; i < 6; i++) {
      const a = rand() * Math.PI * 2, d = 34 + rand() * 10, x = 50 + Math.cos(a) * d, y = 46 + Math.sin(a) * d * 0.8;
      blob(g, lumpy(x, y, 6 + rand() * 4, 0.4, 7, rand));
      g.fillStyle = alpha(c.puff, 0.65); g.fill();
    }
  }
}

const MEPHIT = (id: string, name: string, kind: MephitKind, cr: string, tags: string[], c: Record<string, string>, variants: { name: string; c: Record<string, string> }[]): CreatureDef => ({
  id, name, family: 'elemental', size: 'Small', cr, tags: ['mephit', 'imp', ...tags], c, variants: [{ name: 'Classic', c: {} }, ...variants],
  draw: ({ g, c: cc, seed }) => mephit(g, cc, rng(seed), kind),
});

const ELEMENTALS: CreatureDef[] = [
  {
    id: 'airElemental', name: 'Air Elemental', family: 'elemental', size: 'Large', cr: '5', tags: ['whirlwind', 'wind', 'storm', 'tornado'],
    c: { air: '#cfe8f4', dark: '#6a9ab8', eye: '#ffffff' },
    variants: [{ name: 'Clear sky', c: {} }, { name: 'Storm', c: { air: '#a8b0bc', dark: '#3a4250', eye: '#bff4ff' } }, { name: 'Dust devil', c: { air: '#e0ccaa', dark: '#8a6a44', eye: '#fff2c0' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 44, 48, c.air, 0.35);
      // funnel of swirling bands, wide at top
      for (let i = 0; i < 7; i++) {
        const y = 12 + i * 12, hw = 42 - i * 4.5;
        g.beginPath(); g.ellipse(50 + Math.sin(i * 1.3) * 4, y, hw, 6 + i * 0.3, 0, Math.PI * (0.05 + r() * 0.2), Math.PI * (1.6 + r() * 0.3));
        g.strokeStyle = alpha(INK, 0.5); g.lineWidth = 7; g.lineCap = 'round'; g.stroke();
        g.strokeStyle = mix(c.air, c.dark, i / 9); g.lineWidth = 5; g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1.2; g.stroke();
      }
      for (let i = 0; i < 10; i++) { circle(g, 10 + r() * 80, 10 + r() * 80, 0.8 + r() * 1.4); g.fillStyle = alpha(c.dark, 0.7); g.fill(); }
      // eyes in the eye of the storm
      eyes(g, 50, 42, 10, 6, 3.4, c.eye, { white: null, pupil: 'none', glow: c.eye, rot: 0.2 });
    },
  },
  {
    id: 'earthElemental', name: 'Earth Elemental', family: 'elemental', size: 'Large', cr: '5', tags: ['rock', 'stone', 'boulder', 'burrow'],
    c: { rock: '#8a8074', eye: '#ffb02e', crystal: '#9ad8e8' },
    variants: [{ name: 'Granite', c: {} }, { name: 'Red rock', c: { rock: '#a0644a' } }, { name: 'Mossy', c: { rock: '#6f7a5e', crystal: '#b8f08a' } }, { name: 'Amethyst', c: { rock: '#5e5866', crystal: '#c890ff', eye: '#e8b0ff' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // shoulder boulders
      for (const [x, y, rr2] of [[14, 84, 20], [86, 84, 20], [50, 98, 18], [30, 96, 14], [70, 96, 14]]) { const pts = lumpy(x, y, rr2, 0.3, 8, r); poly(g, pts); paint(g, litFill(g, x - rr2, y - rr2, rr2 * 2, rr2 * 2, shade(c.rock, (r() - 0.5) * 0.2), 0.3), INK, LW); }
      // crystals
      for (const [x, y, a] of [[20, 64, -0.5], [80, 62, 0.5], [70, 18, 0.3]]) {
        g.save(); g.translate(x, y); g.rotate(a);
        poly(g, [[-4, 6], [-4, -8], [0, -16], [4, -8], [4, 6]]); paint(g, litFill(g, -4, -16, 8, 22, c.crystal, 0.4), INK, 1.2);
        g.restore();
      }
      // craggy head
      const hp = [[50, 14], [66, 16], [78, 30], [76, 52], [68, 72], [50, 80], [32, 72], [24, 52], [22, 30], [34, 16]];
      poly(g, hp); paint(g, litFill(g, 22, 14, 56, 66, c.rock, 0.3), INK, LW);
      g.strokeStyle = alpha(shade(c.rock, -0.5), 0.7); g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(30, 22); g.lineTo(40, 34); g.lineTo(36, 46); g.moveTo(66, 18); g.lineTo(60, 30); g.moveTo(70, 56); g.lineTo(60, 64); g.lineTo(62, 76); g.stroke();
      // brow slab
      poly(g, [[26, 34], [74, 34], [72, 42], [28, 42]]); paint(g, litFill(g, 26, 34, 48, 8, shade(c.rock, 0.1), 0.3), INK, 1.4);
      for (const s of SIDES) { poly(g, [[50 + s * 6, 44], [50 + s * 18, 44], [50 + s * 16, 52], [50 + s * 8, 52]]); paint(g, '#1a1410', INK, 1); glow(g, 50 + s * 12, 48, 10, c.eye, 0.8); ellipse(g, 50 + s * 12, 48, 4, 2.2); g.fillStyle = shade(c.eye, 0.4); g.fill(); }
      // jagged mouth
      poly(g, [[36, 64], [42, 60], [46, 66], [52, 60], [58, 66], [64, 60], [66, 66], [60, 70], [40, 70]]); paint(g, '#1a1410', INK, 1.2);
      glow(g, 50, 66, 10, c.eye, 0.4);
    },
  },
  {
    id: 'fireElemental', name: 'Fire Elemental', family: 'elemental', size: 'Large', cr: '5', tags: ['flame', 'burning', 'blaze', 'inferno'],
    c: { outer: '#e2481b', mid: '#ffb02e', hot: '#fff3b0', eye: '#2a0c04' },
    variants: [{ name: 'Orange', c: {} }, { name: 'Blue', c: { outer: '#2a5ae8', mid: '#5ab8ff', hot: '#e8fbff', eye: '#0a1a3a' } }, { name: 'Green', c: { outer: '#2a9a3a', mid: '#8ae84a', hot: '#f0ffd0', eye: '#0a2a0a' } }, { name: 'Violet', c: { outer: '#7a2ae8', mid: '#d08aff', hot: '#fbe8ff', eye: '#1a0a3a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 56, c.mid, 0.5);
      flameCrown(g, 50, 70, 50, 70, r, [c.outer, c.mid, c.hot], 11, Math.PI * 0.85, Math.PI * 2.15);
      // body column
      blob(g, [[14, 104], [24, 76], [36, 66], [64, 66], [76, 76], [86, 104]]);
      g.fillStyle = c.outer; g.fill();
      blob(g, [[28, 104], [34, 80], [50, 72], [66, 80], [72, 104]]);
      g.fillStyle = c.mid; g.fill();
      // face in the hot core
      blob(g, [[50, 26], [66, 34], [68, 54], [50, 70], [32, 54], [34, 34]]);
      g.fillStyle = c.hot; g.fill();
      for (const s of SIDES) { poly(g, [[50 + s * 4, 42], [50 + s * 16, 38], [50 + s * 14, 48], [50 + s * 5, 48]]); paint(g, c.eye, null); }
      g.beginPath(); g.moveTo(40, 56); g.quadraticCurveTo(50, 66, 60, 56); g.quadraticCurveTo(50, 60, 40, 56); g.fillStyle = c.eye; g.fill();
      for (let i = 0; i < 8; i++) { circle(g, 10 + r() * 80, 10 + r() * 60, 0.8 + r()); g.fillStyle = c.hot; g.fill(); }
    },
  },
  {
    id: 'waterElemental', name: 'Water Elemental', family: 'elemental', size: 'Large', cr: '5', tags: ['wave', 'sea', 'flood', 'drown'],
    c: { water: '#2a7ab8', foam: '#e8f6ff', eye: '#bff4ff' },
    variants: [{ name: 'Ocean', c: {} }, { name: 'Murky', c: { water: '#3a6a5a', foam: '#c8dcc0', eye: '#e8ff9a' } }, { name: 'Glacial', c: { water: '#6ab0d8', foam: '#ffffff', eye: '#ffffff' } }, { name: 'Deep', c: { water: '#1a3a7a', foam: '#9ac8ff' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // rising wave with curling crest
      g.beginPath(); g.moveTo(-4, 104); g.quadraticCurveTo(4, 50, 30, 22); g.quadraticCurveTo(54, 2, 78, 12); g.quadraticCurveTo(96, 22, 88, 40); g.quadraticCurveTo(80, 52, 70, 42); g.quadraticCurveTo(76, 30, 66, 30);
      g.quadraticCurveTo(78, 58, 92, 74); g.quadraticCurveTo(100, 90, 104, 104); g.closePath();
      const gr = g.createLinearGradient(20, 10, 80, 100); gr.addColorStop(0, shade(c.water, 0.3)); gr.addColorStop(1, shade(c.water, -0.4));
      paint(g, gr, INK, LW);
      // foam on crest
      g.beginPath(); g.moveTo(30, 22); g.quadraticCurveTo(54, 2, 78, 12); g.quadraticCurveTo(96, 22, 88, 40); g.quadraticCurveTo(80, 50, 72, 42);
      g.strokeStyle = c.foam; g.lineWidth = 4; g.lineCap = 'round'; g.stroke();
      for (let i = 0; i < 7; i++) { circle(g, 34 + r() * 50, 10 + r() * 20, 1.2 + r() * 1.6); g.fillStyle = c.foam; g.fill(); }
      // flow lines
      g.strokeStyle = alpha(c.foam, 0.45); g.lineWidth = 1.6;
      for (let i = 0; i < 5; i++) { const y = 56 + i * 9; g.beginPath(); g.moveTo(10 + i * 2, y); g.quadraticCurveTo(50, y - 8, 88 - i * 2, y + 2); g.stroke(); }
      eyes(g, 46, 46, 11, 6, 4, c.eye, { white: null, pupil: 'none', glow: c.eye, rot: 0.15 });
      mouthLine(g, 46, 60, 8, -1.5, 1.6);
    },
  },
  {
    id: 'salamander', name: 'Salamander', family: 'elemental', size: 'Large', cr: '5', tags: ['fire', 'serpent', 'spear', 'snake'],
    c: { scale: '#d8501e', belly: '#ffc04a', spine: '#ffe07a', eye: '#fff2a0', fire: '#ff7a1a' },
    variants: [{ name: 'Flame', c: {} }, { name: 'Crimson', c: { scale: '#a82a1e', belly: '#ff8a3a' } }, { name: 'Coal', c: { scale: '#3a2a26', belly: '#ff6a1a', spine: '#ff9a3a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      flameCrown(g, 50, 52, 46, 50, r, [c.fire, c.spine], 10, Math.PI * 0.9, Math.PI * 2.1);
      shoulders(g, c.scale, 72, 0.9);
      ellipse(g, 50, 92, 16, 20); g.fillStyle = alpha(c.belly, 0.8); g.fill();
      // fiery frill
      for (let i = 0; i < 7; i++) { const a = Math.PI * (1.1 + i * 0.13); horn(g, 50 + Math.cos(a) * 18, 44 + Math.sin(a) * 20, 50 + Math.cos(a) * 30, 44 + Math.sin(a) * 32, 50 + Math.cos(a) * 40, 44 + Math.sin(a) * 40, 7, c.spine); }
      // serpent head
      blob(g, [[50, 20], [68, 28], [72, 46], [64, 66], [50, 74], [36, 66], [28, 46], [32, 28]]);
      paint(g, domeFill(g, 46, 40, 30, c.scale, 0.35), INK, LW);
      g.strokeStyle = alpha(shade(c.scale, -0.5), 0.6); g.lineWidth = 1;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(40 + j * 10 + (i % 2) * 5, 26 + i * 7, 4, 0.2, Math.PI - 0.2); g.stroke(); }
      eyes(g, 50, 44, 11, 5, 3.8, c.eye, { pupil: 'slit', glow: c.fire, rot: 0.3 });
      for (const s of SIDES) { circle(g, 50 + s * 4, 58, 1.2); g.fillStyle = INK; g.fill(); }
      openMouth(g, 50, 64, 11, 6, { top: 5, fangs: 4, inside: '#ff7a1a' });
    },
  },
  {
    id: 'xorn', name: 'Xorn', family: 'elemental', size: 'Medium', cr: '5', tags: ['earth', 'gem eater', 'burrow', 'three eyes'],
    c: { hide: '#8a7a6a', eye: '#e8d06a', mouth: '#2a1410' },
    variants: [{ name: 'Stone', c: {} }, { name: 'Ruddy', c: { hide: '#9a6a52' } }, { name: 'Slate', c: { hide: '#6a6e74', eye: '#9ae8ff' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // broad pebbled body
      blob(g, [[50, 12], [80, 20], [94, 50], [90, 90], [50, 104], [10, 90], [6, 50], [20, 20]]);
      paint(g, domeFill(g, 44, 40, 56, c.hide, 0.3), INK, LW);
      speckle2(g, r, 12, 18, 76, 80, 40, alpha(shade(c.hide, -0.35), 0.5));
      for (let i = 0; i < 8; i++) { const x = 16 + r() * 68, y = 60 + r() * 30; circle(g, x, y, 2 + r() * 2); paint(g, domeFill(g, x, y, 3, shade(c.hide, 0.12)), alpha(INK, 0.5), 0.7); }
      // three eyes around the crown
      for (const [x, y] of [[26, 32], [50, 24], [74, 32]]) { circle(g, x, y, 7.4); paint(g, shade(c.hide, -0.3), INK, 1.4); eye(g, x, y, 5.4, 5.4, c.eye, { pupil: 'round' }); }
      // great round toothed mouth
      circle(g, 50, 60, 20); paint(g, c.mouth, INK, LW);
      g.fillStyle = '#efe6cc';
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; poly(g, [[50 + Math.cos(a - 0.2) * 19, 60 + Math.sin(a - 0.2) * 19], [50 + Math.cos(a) * 11, 60 + Math.sin(a) * 11], [50 + Math.cos(a + 0.2) * 19, 60 + Math.sin(a + 0.2) * 19]]); g.fill(); }
      circle(g, 50, 60, 8); g.fillStyle = '#120806'; g.fill();
      gem(g, 47, 62, 3, '#e83a5a');
    },
  },
  {
    id: 'azer', name: 'Azer', family: 'elemental', size: 'Medium', cr: '2', tags: ['dwarf', 'fire', 'smith', 'forge', 'bronze'],
    c: { skin: '#c88a3a', fire: '#ff6a1a', fire2: '#ffd04a', eye: '#fff2a0', kilt: '#5a4a3a' },
    variants: [{ name: 'Bronze', c: {} }, { name: 'Brass', c: { skin: '#d8b04a' } }, { name: 'Copper', c: { skin: '#b8603a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      flameCrown(g, 50, 40, 32, 36, r, [c.fire, c.fire2], 8, Math.PI * 1.0, Math.PI * 2.0);
      shoulders(g, c.skin, 70, 1.0);
      g.strokeStyle = alpha(shade(c.skin, -0.5), 0.6); g.lineWidth = 1.2;
      for (const s of SIDES) { g.beginPath(); g.arc(50 + s * 16, 92, 12, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
      ears(g, 50, 46, 24, 'round', c.skin, 0.6);
      head(g, c.skin, { top: 22, chin: 74, w: 22, jaw: 0.85 }, 0.45);
      // metallic sheen bands
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2;
      g.beginPath(); g.arc(44, 40, 16, Math.PI * 1.1, Math.PI * 1.5); g.stroke();
      // flame beard
      g.save(); g.translate(50, 58); g.scale(1, -1);
      flameCrown(g, 0, 0, 24, 36, r, [c.fire, c.fire2], 7, Math.PI * 1.1, Math.PI * 1.9);
      g.restore();
      for (const s of SIDES) { blob(g, [[50, 56], [50 + s * 10, 54], [50 + s * 16, 60], [50 + s * 8, 59]]); paint(g, c.fire, INK, 1); }
      brows(g, 50, 39, 8, 5, 2.4, c.fire, 2.6);
      eyes(g, 50, 44, 9, 4.4, 3.2, c.eye, { white: null, pupil: 'none', glow: c.fire2 });
      nose(g, 50, 52, 'broad', shade(c.skin, 0.1));
    },
  },
  {
    id: 'djinni', name: 'Djinni', family: 'elemental', size: 'Large', cr: '11', tags: ['genie', 'air', 'wish', 'desert', 'folklore'],
    c: { skin: '#4f86c6', hair: '#1a1a24', eye: '#ffffff', vest: '#d8a83a', cloud: '#cfe4f4' },
    variants: [{ name: 'Blue', c: {} }, { name: 'Sky', c: { skin: '#7ab4e0' } }, { name: 'Violet', c: { skin: '#7a5ab8', vest: '#3ab88a' } }, { name: 'Sea-green', c: { skin: '#3a9a8a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // cloudy swirl below
      for (let i = 0; i < 7; i++) { const x = 8 + i * 14, y = 92 + r() * 8; circle(g, x, y, 10 + r() * 5); g.fillStyle = alpha(c.cloud, 0.85); g.fill(); }
      shoulders(g, c.skin, 70, 1.05);
      for (const s of SIDES) { poly(g, [[50 + s * 16, 68], [50 + s * 34, 70], [50 + s * 30, 104], [50 + s * 12, 104]]); paint(g, litFill(g, 0, 68, 100, 36, c.vest, 0.3), INK, 1.4); }
      for (let i = 0; i < 6; i++) { circle(g, 6 + i * 18, 98, 9); g.fillStyle = alpha(c.cloud, 0.7); g.fill(); }
      ears(g, 50, 46, 22, 'point', c.skin, 0.75);
      for (const s of SIDES) { circle(g, 50 + s * 24, 56, 3.6); g.strokeStyle = INK; g.lineWidth = 2.6; g.stroke(); g.strokeStyle = '#e2b84a'; g.lineWidth = 1.6; g.stroke(); }
      head(g, c.skin, { top: 20, chin: 78, w: 21, jaw: 0.72 });
      // topknot
      g.beginPath(); g.moveTo(48, 20); g.quadraticCurveTo(44, 4, 58, -2); g.quadraticCurveTo(52, 8, 54, 20); g.closePath(); paint(g, c.hair, INK, 1.3);
      circle(g, 51, 19, 3); paint(g, '#e2b84a', INK, 1);
      // pointed beard and moustache
      poly(g, [[42, 64], [50, 90], [58, 64], [50, 68]]); paint(g, c.hair, INK, 1.2);
      for (const s of SIDES) { g.beginPath(); g.moveTo(50, 60); g.quadraticCurveTo(50 + s * 10, 58, 50 + s * 16, 52); g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke(); g.strokeStyle = c.hair; g.lineWidth = 2; g.stroke(); }
      brows(g, 50, 38, 9, 5, 1.6, c.hair, 2.4);
      eyes(g, 50, 44, 9, 4.6, 3.2, c.eye, { white: null, pupil: 'none', glow: '#bfe8ff' });
      nose(g, 50, 52, 'small', c.skin);
    },
  },
  {
    id: 'efreeti', name: 'Efreeti', family: 'elemental', size: 'Large', cr: '11', tags: ['genie', 'fire', 'wish', 'brass city', 'folklore'],
    c: { skin: '#c23a2a', hair: '#1a1210', eye: '#ffd23a', gold: '#e2b84a', fire: '#ff7a1a', fire2: '#ffd04a' },
    variants: [{ name: 'Red', c: {} }, { name: 'Ember', c: { skin: '#d86a2a' } }, { name: 'Obsidian', c: { skin: '#2e2626', eye: '#ff6a2a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      flameCrown(g, 50, 56, 50, 56, r, [c.fire, c.fire2], 11, Math.PI * 0.85, Math.PI * 2.15);
      shoulders(g, c.skin, 70, 1.08);
      for (const s of SIDES) { g.beginPath(); g.ellipse(50 + s * 38, 86, 8, 4, s * 0.3, 0, Math.PI * 2); g.strokeStyle = INK; g.lineWidth = 4.4; g.stroke(); g.strokeStyle = c.gold; g.lineWidth = 2.6; g.stroke(); }
      g.beginPath(); g.moveTo(30, 72); g.quadraticCurveTo(50, 90, 70, 72); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.strokeStyle = c.gold; g.lineWidth = 3; g.stroke();
      ears(g, 50, 46, 22, 'point', c.skin, 0.8);
      head(g, c.skin, { top: 22, chin: 78, w: 22, jaw: 0.75 });
      for (const s of SIDES) horn(g, 50 + s * 10, 26, 50 + s * 14, 12, 50 + s * 10, 2, 6, '#2a1e1a', 2);
      // black forked beard
      poly(g, [[38, 62], [44, 92], [50, 78], [56, 92], [62, 62], [50, 68]]); paint(g, litFill(g, 38, 62, 24, 30, c.hair, 0.3), INK, 1.3);
      for (const s of SIDES) { blob(g, [[50, 60], [50 + s * 10, 57], [50 + s * 18, 62], [50 + s * 9, 62]]); paint(g, c.hair, INK, 1); }
      brows(g, 50, 39, 9, 5, 3.4, c.hair, 3);
      eyes(g, 50, 45, 9, 5, 3.6, c.eye, { pupil: 'slit', glow: c.eye, rot: 0.2 });
      nose(g, 50, 53, 'hook', shade(c.skin, 0.06));
    },
  },
  {
    id: 'invisibleStalker', name: 'Invisible Stalker', family: 'elemental', size: 'Medium', cr: '6', tags: ['invisible', 'air', 'hunter', 'shimmer', 'unseen'],
    c: { air: '#d8eaf4', eye: '#ffffff' },
    variants: [{ name: 'Shimmer', c: {}, f: { seen: 0 } }, { name: 'Revealed (dust)', c: { air: '#d8c8a8' }, f: { seen: 1 } }, { name: 'Revealed (flour)', c: { air: '#ffffff' }, f: { seen: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const a1 = f.seen ? 0.55 : 0.38;
      // refraction ripples: a humanoid-ish outline of wavy strokes
      const outline = (k: number) => {
        g.beginPath();
        g.moveTo(-4, 104); g.quadraticCurveTo(6, 74, 30, 70);
        g.bezierCurveTo(22 * k + 18 * (1 - k), 50, 24, 18, 50, 16);
        g.bezierCurveTo(76, 18, 78, 50, 70, 70);
        g.quadraticCurveTo(94, 74, 104, 104);
      };
      outline(1);
      g.fillStyle = alpha(c.air, f.seen ? 0.4 : 0.16); g.fill();
      for (let i = 0; i < 4; i++) {
        g.save(); g.translate(50, 60); g.scale(1 - i * 0.12, 1 - i * 0.1); g.translate(-50, -60);
        outline(1);
        g.setLineDash([6 + r() * 6, 3 + r() * 4]);
        g.strokeStyle = alpha(i % 2 ? '#ffffff' : c.air, a1 + 0.15 - i * 0.04); g.lineWidth = 2.2 - i * 0.3; g.stroke();
        g.restore();
      }
      g.setLineDash([]);
      for (let i = 0; i < 14; i++) { circle(g, 24 + r() * 52, 16 + r() * 80, 0.6 + r()); g.fillStyle = alpha('#ffffff', 0.4 + r() * 0.4); g.fill(); }
      eyes(g, 50, 40, 9, 3.6, 2, c.eye, { white: null, pupil: 'none', glow: '#bfe8ff' });
    },
  },
  {
    id: 'gargoyle', name: 'Gargoyle', family: 'elemental', size: 'Medium', cr: '2', tags: ['stone', 'statue', 'wings', 'rooftop', 'castle'],
    c: { stone: '#8a8780', eye: '#ffcf3a', wing: '#6e6b66' },
    variants: [{ name: 'Granite', c: {} }, { name: 'Dark basalt', c: { stone: '#4e4b48', wing: '#3a3836', eye: '#ff5a2a' } }, { name: 'Sandstone', c: { stone: '#b8a27c', wing: '#8a7a5c' } }, { name: 'Mossy', c: { stone: '#6c7a64', wing: '#4e5a48', eye: '#bfff6a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      batWings(g, c.wing, 56, 1.0, 6);
      shoulders(g, shade(c.stone, -0.08), 72, 0.95);
      ears(g, 50, 42, 21, 'bat', c.stone, 0.9);
      head(g, c.stone, { top: 22, chin: 80, w: 22, jaw: 0.75 });
      for (const s of SIDES) horn(g, 50 + s * 10, 26, 50 + s * 14, 10, 50 + s * 6, 4, 6, shade(c.stone, -0.15), 2);
      g.strokeStyle = alpha(shade(c.stone, -0.5), 0.7); g.lineWidth = 1;
      g.beginPath(); g.moveTo(36, 30); g.lineTo(40, 38); g.lineTo(37, 44); g.moveTo(64, 64); g.lineTo(60, 70); g.stroke();
      speckle2(g, r, 30, 26, 40, 50, 18, alpha(shade(c.stone, -0.4), 0.45));
      browRidge(g, 50, 40, 18, c.stone);
      eyes(g, 50, 45, 9, 4.8, 3.6, c.eye, { white: null, pupil: 'none', glow: c.eye, rot: 0.25 });
      nose(g, 50, 54, 'pig', shade(c.stone, 0.06));
      openMouth(g, 50, 64, 14, 10, { top: 5, bottom: 4, fangs: 6, inside: '#2a2420', smile: -2 });
    },
  },
  MEPHIT('magmaMephit', 'Magma Mephit', 'magma', '1/2', ['fire', 'lava'], { skin: '#3a2a26', glow: '#ff7a1a', eye: '#ffd04a', wing: '#4a2a20' }, [{ name: 'Glowing', c: { skin: '#6a2a1a', glow: '#ffd04a' } }]),
  MEPHIT('iceMephit', 'Ice Mephit', 'ice', '1/2', ['cold', 'frost', 'winter'], { skin: '#a8d8f0', eye: '#2a6ab8', wing: '#d8f0ff' }, [{ name: 'Glacier', c: { skin: '#6aa8d8', wing: '#b8e0f8', eye: '#ffffff' } }]),
  MEPHIT('dustMephit', 'Dust Mephit', 'dust', '1/2', ['earth', 'air', 'desert', 'tomb'], { skin: '#b8a07a', eye: '#ffe08a', wing: '#8a7a5a', puff: '#c8b490' }, [{ name: 'Grey dust', c: { skin: '#9a968c', wing: '#6e6a62', puff: '#b0aca0' } }]),
  MEPHIT('steamMephit', 'Steam Mephit', 'steam', '1/4', ['fire', 'water', 'steam', 'scald'], { skin: '#e0b8b0', eye: '#3a7ab8', wing: '#f4e8e4', puff: '#ffffff' }, [{ name: 'Rosy', c: { skin: '#e88a8a' } }]),
  MEPHIT('mudMephit', 'Mud Mephit', 'mud', '1/4', ['earth', 'water', 'swamp', 'gloomy'], { skin: '#7a5a3a', eye: '#d8c86a', wing: '#5a4028' }, [{ name: 'Clay', c: { skin: '#a8603a', wing: '#7a4428' } }]),
  MEPHIT('smokeMephit', 'Smoke Mephit', 'smoke', '1/4', ['fire', 'air', 'soot', 'chimney'], { skin: '#4e4b4a', eye: '#ff7a3a', wing: '#3a3838', puff: '#7a7676' }, [{ name: 'Pale smoke', c: { skin: '#8a8684', puff: '#b0acaa', eye: '#ffd23a' } }]),
  {
    id: 'magmin', name: 'Magmin', family: 'elemental', size: 'Small', cr: '1/2', tags: ['fire', 'lava', 'small', 'explode'],
    c: { skin: '#5a2a1a', crack: '#ffb02e', fire: '#ff6a1a', fire2: '#ffe07a', eye: '#fff6c0' },
    variants: [{ name: 'Lava', c: {} }, { name: 'Bright', c: { skin: '#a83a1a' } }, { name: 'Blue flame', c: { fire: '#3a7aff', fire2: '#c8f4ff', crack: '#7ad8ff', eye: '#e8fbff' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      flameCrown(g, 50, 44, 30, 40, r, [c.fire, c.fire2], 7, Math.PI * 1.05, Math.PI * 1.95);
      shoulders(g, c.skin, 76, 0.7);
      const hp = headPts({ top: 26, chin: 80, w: 22, jaw: 0.75 });
      blob(g, hp); paint(g, domeFill(g, 46, 48, 32, c.skin, 0.3), INK, LW);
      g.save(); blob(g, hp); g.clip();
      g.strokeStyle = c.crack; g.lineWidth = 1.6;
      for (let i = 0; i < 8; i++) { const x = 28 + r() * 44, y = 30 + r() * 46; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4, y + 3); g.lineTo(x + 2, y + 8); g.stroke(); }
      g.restore();
      for (const s of SIDES) { circle(g, 50 + s * 9, 48, 5.6); g.fillStyle = INK; g.fill(); eye(g, 50 + s * 9, 48, 4.4, 4.4, c.eye, { white: null, pupil: 'none', glow: c.fire2 }); }
      g.beginPath(); g.moveTo(38, 62); g.quadraticCurveTo(50, 76, 62, 62); g.quadraticCurveTo(50, 66, 38, 62); paint(g, c.fire2, INK, 1.3);
    },
  },
];

// ======================================================================================
// CONSTRUCTS
// ======================================================================================
function stitch(g: G, pts: number[][], col = '#2a1a14') {
  poly(g, pts, false);
  g.strokeStyle = col; g.lineWidth = 1.2; g.stroke();
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / 4)), a = Math.atan2(y2 - y1, x2 - x1);
    for (let k = 0; k <= n; k++) {
      const x = x1 + ((x2 - x1) * k) / n, y = y1 + ((y2 - y1) * k) / n;
      line(g, x - Math.sin(a) * 2.4, y + Math.cos(a) * 2.4, x + Math.sin(a) * 2.4, y - Math.cos(a) * 2.4, col, 1);
    }
  }
}
function pauldrons(g: G, metal: string, y = 72) {
  shoulders(g, shade(metal, -0.15), y, 1.0);
  for (const s of SIDES) {
    for (let i = 0; i < 2; i++) {
      blob(g, [[50 + s * 16, y + i * 8], [50 + s * 40, y - 4 + i * 8], [50 + s * 54, y + 14 + i * 8], [50 + s * 30, y + 18 + i * 8]]);
      paint(g, litFill(g, 0, y - 4, 100, 26, shade(metal, 0.12 - i * 0.1), 0.45), INK, 1.5);
    }
  }
}

const CONSTRUCTS: CreatureDef[] = [
  {
    id: 'animatedArmor', name: 'Animated Armor', family: 'construct', size: 'Medium', srd: 'animatedArmor', cr: '1', tags: ['armor', 'haunted', 'guardian', 'knight', 'empty'],
    c: { metal: '#9aa2aa', eye: '#7ad8ff', plume: '#a3312c' },
    variants: [{ name: 'Steel', c: {} }, { name: 'Blackened', c: { metal: '#4a4e54', eye: '#ff4a2a' } }, { name: 'Gilded', c: { metal: '#d8b04a', eye: '#9aff6a' } }, { name: 'Rusted', c: { metal: '#8b5a3a', eye: '#ffd23a' } }, { name: 'Steel, plumed', c: {}, f: { plume: 1 } }],
    draw: ({ g, c, f }) => {
      if (f.plume) { blob(g, [[50, 22], [44, 6], [52, -2], [70, 4], [82, 20], [68, 14], [58, 16]]); paint(g, litFill(g, 44, -2, 38, 24, c.plume, 0.3), INK, 1.6); }
      pauldrons(g, c.metal, 72);
      // great helm
      g.beginPath(); g.moveTo(28, 78); g.lineTo(26, 36); g.quadraticCurveTo(28, 12, 50, 10); g.quadraticCurveTo(72, 12, 74, 36); g.lineTo(72, 78); g.quadraticCurveTo(50, 84, 28, 78);
      paint(g, litFill(g, 26, 10, 48, 74, c.metal, 0.45), INK, LW);
      line(g, 50, 12, 50, 78, alpha(shade(c.metal, -0.5), 0.6), 1.6);
      g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 66); g.quadraticCurveTo(30, 26, 44, 16); g.stroke();
      // eye slit with ghost light inside
      poly(g, [[30, 40], [70, 40], [68, 48], [32, 48]]); paint(g, '#0c0a0c', INK, 1.4);
      for (const s of SIDES) { glow(g, 50 + s * 10, 44, 9, c.eye, 0.8); ellipse(g, 50 + s * 10, 44, 3.4, 1.6); g.fillStyle = shade(c.eye, 0.5); g.fill(); }
      // breaths
      for (let i = 0; i < 3; i++) for (const s of SIDES) { circle(g, 50 + s * (6 + i * 6), 60, 1.4); g.fillStyle = '#0c0a0c'; g.fill(); }
      for (const [x, y] of [[30, 30], [70, 30], [30, 72], [70, 72]]) { circle(g, x, y, 1.6); paint(g, shade(c.metal, 0.4), INK, 0.7); }
    },
  },
  {
    id: 'flyingSword', name: 'Flying Sword', family: 'construct', size: 'Small', cr: '1/4', tags: ['sword', 'blade', 'animated object', 'haunted'],
    c: { blade: '#d8dee4', hilt: '#c9a24a', grip: '#5a3a24', glow: '#7ad8ff' },
    variants: [{ name: 'Steel', c: {} }, { name: 'Gold', c: { blade: '#f0d27a', hilt: '#e8e8e8', glow: '#fff2a0' } }, { name: 'Cursed', c: { blade: '#5a5660', hilt: '#3a3438', glow: '#ff3a3a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 46, c.glow, 0.45);
      // motion streaks
      g.strokeStyle = alpha(c.glow, 0.6); g.lineWidth = 1.6;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(50, 50, 30 + i * 6, Math.PI * (0.9 + r() * 0.1), Math.PI * (1.3 + r() * 0.1)); g.stroke(); }
      g.save(); g.translate(50, 50); g.rotate(Math.PI / 4);
      poly(g, [[-5, 18], [-5, -34], [0, -44], [5, -34], [5, 18]]); paint(g, litFill(g, -5, -44, 10, 62, c.blade, 0.45), INK, LW * 0.9);
      line(g, 0, -36, 0, 16, alpha(shade(c.blade, -0.45), 0.8), 1.2);
      for (let i = 0; i < 3; i++) { const y = -24 + i * 12; poly(g, [[-2, y], [0, y - 3], [2, y], [0, y + 3]]); g.fillStyle = c.glow; g.fill(); }
      rrPath(g, -17, 17, 34, 6, 2); paint(g, litFill(g, -17, 17, 34, 6, c.hilt, 0.4), INK, 1.4);
      rrPath(g, -3.5, 23, 7, 16, 1.5); paint(g, c.grip, INK, 1.2);
      circle(g, 0, 42, 5); paint(g, domeFill(g, 0, 42, 5, c.hilt, 0.4), INK, 1.2);
      g.restore();
    },
  },
  {
    id: 'rugOfSmothering', name: 'Rug of Smothering', family: 'construct', size: 'Large', cr: '2', tags: ['rug', 'carpet', 'trap', 'animated object', 'mimic'],
    c: { rug: '#a3312c', border: '#c99a2e', inner: '#2f5d8a', fringe: '#e6e0d2' },
    variants: [{ name: 'Crimson', c: {} }, { name: 'Blue', c: { rug: '#2f5d8a', inner: '#a3312c' } }, { name: 'Green', c: { rug: '#3e6b3a', inner: '#c99a2e', border: '#e6e0d2' } }, { name: 'Purple', c: { rug: '#5d3a78', inner: '#c99a2e' } }],
    draw: ({ g, c }) => {
      // a rug rearing up and curling over, like a hood
      const sh = [[10, 104], [14, 60], [20, 26], [40, 10], [64, 10], [82, 24], [88, 50], [80, 46], [86, 104]];
      blob(g, sh); paint(g, litFill(g, 10, 10, 80, 94, c.rug, 0.3), INK, LW);
      g.save(); blob(g, sh); g.clip();
      g.strokeStyle = c.border; g.lineWidth = 5;
      blob(g, sh.map(([x, y]) => [50 + (x - 50) * 0.82, 56 + (y - 56) * 0.86])); g.stroke();
      g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
      // medallion pattern
      for (const [y, rr2] of [[44, 14], [78, 10]]) { poly(g, [[50, y - rr2], [50 + rr2, y], [50, y + rr2], [50 - rr2, y]]); paint(g, c.inner, INK, 1.2); poly(g, [[50, y - rr2 * 0.5], [50 + rr2 * 0.5, y], [50, y + rr2 * 0.5], [50 - rr2 * 0.5, y]]); paint(g, c.border, INK, 0.9); }
      // underside shadow fold
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.moveTo(80, 46); g.quadraticCurveTo(70, 70, 86, 104); g.lineTo(104, 104); g.lineTo(104, 40); g.fill();
      g.restore();
      // the curled-over top edge, rolling towards the viewer, with its fringe
      g.beginPath(); g.moveTo(18, 30); g.quadraticCurveTo(50, 4, 86, 28); g.quadraticCurveTo(88, 40, 82, 42); g.quadraticCurveTo(50, 22, 22, 44); g.quadraticCurveTo(14, 40, 18, 30);
      paint(g, litFill(g, 14, 8, 74, 36, shade(c.rug, -0.25), 0.35), INK, LW);
      g.beginPath(); g.moveTo(20, 34); g.quadraticCurveTo(50, 12, 84, 32); g.strokeStyle = c.border; g.lineWidth = 2.4; g.stroke();
      g.strokeStyle = INK; g.lineWidth = 3.4; g.lineCap = 'round';
      const fr: number[][] = [];
      for (let i = 0; i < 11; i++) { const t = i / 10, x = 24 + t * 56, y = 44 - Math.sin(t * Math.PI) * 18 + (t > 0.85 ? -4 : 0); fr.push([x, y]); }
      for (const [x, y] of fr) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 0.5, y + 9); g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke(); g.strokeStyle = c.fringe; g.lineWidth = 1.8; g.stroke(); }
    },
  },
  {
    id: 'clayGolem', name: 'Clay Golem', family: 'construct', size: 'Large', cr: '9', tags: ['golem', 'clay', 'guardian', 'temple', 'folklore'],
    c: { clay: '#a8784a', rune: '#ffd76a', eye: '#1a0e08' },
    variants: [{ name: 'Brown clay', c: {} }, { name: 'Terracotta', c: { clay: '#c0603a' } }, { name: 'Grey clay', c: { clay: '#8a847a', rune: '#9ae8ff' } }, { name: 'River mud', c: { clay: '#6a5a40' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, shade(c.clay, -0.1), 68, 1.1);
      // smooth slab head
      blob(g, [[50, 14], [72, 18], [78, 40], [76, 66], [62, 82], [50, 84], [38, 82], [24, 66], [22, 40], [28, 18]]);
      paint(g, domeFill(g, 46, 42, 40, c.clay, 0.3), INK, LW);
      // thumb-press marks
      for (let i = 0; i < 6; i++) { const x = 28 + r() * 44, y = 22 + r() * 54; ellipse(g, x, y, 3.4, 2.2, r() * 3); g.fillStyle = alpha(shade(c.clay, -0.3), 0.45); g.fill(); }
      // glowing rune on brow
      glow(g, 50, 26, 14, c.rune, 0.7);
      g.strokeStyle = c.rune; g.lineWidth = 2.2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(44, 22); g.lineTo(56, 22); g.moveTo(50, 22); g.lineTo(50, 32); g.moveTo(44, 32); g.lineTo(47, 28); g.moveTo(56, 32); g.lineTo(53, 28); g.stroke();
      // hollow eyes
      for (const s of SIDES) { ellipse(g, 50 + s * 11, 46, 6, 5); paint(g, c.eye, INK, 1.4); }
      g.beginPath(); g.moveTo(48, 50); g.quadraticCurveTo(52, 58, 48, 62); g.strokeStyle = alpha(shade(c.clay, -0.5), 0.8); g.lineWidth = 1.6; g.stroke();
      ellipse(g, 50, 70, 7, 3); paint(g, c.eye, INK, 1.2);
    },
  },
  {
    id: 'fleshGolem', name: 'Flesh Golem', family: 'construct', size: 'Medium', cr: '5', tags: ['golem', 'stitched', 'patchwork', 'laboratory', 'monster'],
    c: { skin: '#9aa88a', skin2: '#c0a890', hair: '#1a1a1c', eye: '#e8e070', bolt: '#7c8086' },
    variants: [{ name: 'Pallid green', c: {} }, { name: 'Grey', c: { skin: '#a0a0a4', skin2: '#c4b4a8' } }, { name: 'Mismatched', c: { skin: '#b89a80', skin2: '#7a8a6a' } }],
    draw: ({ g, c }) => {
      shoulders(g, '#3a3430', 72, 1.05);
      stitch(g, [[30, 76], [50, 86], [70, 76]]);
      for (const s of SIDES) { rrPath(g, 50 + s * 26 - 4, 64, 8, 8, 1.5); paint(g, litFill(g, 0, 64, 100, 8, c.bolt, 0.4), INK, 1.2); }
      // flat-topped head
      const hp = [[26, 20], [74, 20], [76, 50], [70, 72], [50, 82], [30, 72], [24, 50]];
      blob(g, hp); paint(g, domeFill(g, 46, 44, 40, c.skin, 0.3), INK, LW);
      // patch of different skin
      g.save(); blob(g, hp); g.clip();
      poly(g, [[56, 40], [80, 36], [80, 80], [58, 74], [60, 58]]); g.fillStyle = c.skin2; g.fill();
      g.restore();
      stitch(g, [[56, 40], [60, 58], [58, 74]]);
      stitch(g, [[30, 34], [42, 30]]);
      // flat black hair
      rrPath(g, 24, 10, 52, 14, 3); paint(g, litFill(g, 24, 10, 52, 14, c.hair, 0.25), INK, 1.6);
      for (let i = 0; i < 7; i++) { poly(g, [[26 + i * 7, 23], [29 + i * 7, 29], [32 + i * 7, 23]]); g.fillStyle = c.hair; g.fill(); }
      // heavy lids
      for (const s of SIDES) { eye(g, 50 + s * 11, 44, 5, 3.6, c.eye, { pupil: 'round' }); poly(g, [[50 + s * 5, 41], [50 + s * 17, 40], [50 + s * 17, 44], [50 + s * 5, 44]]); paint(g, shade(c.skin, -0.2), INK, 1.2); }
      nose(g, 50, 54, 'broad', c.skin);
      mouthLine(g, 50, 66, 9, -1.5, 2);
    },
  },
  {
    id: 'ironGolem', name: 'Iron Golem', family: 'construct', size: 'Large', cr: '16', tags: ['golem', 'iron', 'furnace', 'poison breath', 'guardian'],
    c: { metal: '#5a5e64', fire: '#ff8a2a', fire2: '#ffe07a' },
    variants: [{ name: 'Iron', c: {} }, { name: 'Bronze', c: { metal: '#a8743c' } }, { name: 'Black iron, green fire', c: { metal: '#33373c', fire: '#3ac83a', fire2: '#d8ff8a' } }],
    draw: ({ g, c }) => {
      pauldrons(g, c.metal, 70);
      // crest horns
      for (const s of SIDES) horn(g, 50 + s * 20, 26, 50 + s * 34, 18, 50 + s * 38, 2, 9, shade(c.metal, 0.1), 2);
      // armored face plate
      poly(g, [[50, 10], [72, 18], [78, 44], [70, 76], [50, 86], [30, 76], [22, 44], [28, 18]]);
      paint(g, litFill(g, 22, 10, 56, 76, c.metal, 0.45), INK, LW);
      line(g, 50, 12, 50, 36, alpha('#000', 0.5), 1.4);
      poly(g, [[26, 38], [74, 38], [72, 44], [28, 44]]); paint(g, litFill(g, 26, 38, 48, 6, shade(c.metal, 0.15), 0.4), INK, 1.2);
      // furnace eyes
      for (const s of SIDES) { poly(g, [[50 + s * 4, 46], [50 + s * 20, 46], [50 + s * 18, 54], [50 + s * 6, 54]]); paint(g, '#120a06', INK, 1.2); glow(g, 50 + s * 12, 50, 12, c.fire, 0.8); poly(g, [[50 + s * 6, 48], [50 + s * 18, 48], [50 + s * 17, 52], [50 + s * 7, 52]]); g.fillStyle = c.fire2; g.fill(); }
      // grill mouth
      rrPath(g, 38, 60, 24, 14, 2); paint(g, '#120a06', INK, 1.4);
      glow(g, 50, 67, 14, c.fire, 0.7);
      for (let i = 1; i < 6; i++) line(g, 38 + i * 4, 60, 38 + i * 4, 74, shade(c.metal, 0.1), 1.6);
      for (const [x, y] of [[30, 24], [70, 24], [28, 64], [72, 64], [50, 80]]) { circle(g, x, y, 1.8); paint(g, shade(c.metal, 0.4), INK, 0.7); }
    },
  },
  {
    id: 'stoneGolem', name: 'Stone Golem', family: 'construct', size: 'Large', cr: '10', tags: ['golem', 'stone', 'statue', 'guardian', 'slow'],
    c: { stone: '#8a8780', rune: '#7ad8ff' },
    variants: [{ name: 'Granite', c: {} }, { name: 'Sandstone', c: { stone: '#b8a27c', rune: '#ffb02e' } }, { name: 'Obsidian', c: { stone: '#3a3638', rune: '#c87aff' } }, { name: 'Marble', c: { stone: '#dcd8d0', rune: '#ffd23a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // block shoulders
      for (const s of SIDES) { rrPath(g, 50 + s * 34 - 18, 66, 36, 40, 4); paint(g, litFill(g, 0, 66, 100, 40, shade(c.stone, -0.05), 0.3), INK, LW); }
      rrPath(g, 34, 72, 32, 34, 3); paint(g, litFill(g, 34, 72, 32, 34, shade(c.stone, -0.15), 0.3), INK, LW);
      // cube head
      rrPath(g, 24, 12, 52, 62, 6); paint(g, litFill(g, 24, 12, 52, 62, c.stone, 0.3), INK, LW);
      g.strokeStyle = alpha(shade(c.stone, -0.5), 0.6); g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(24, 30); g.lineTo(76, 30); g.moveTo(66, 56); g.lineTo(72, 62); g.lineTo(70, 72); g.stroke();
      speckle2(g, r, 26, 14, 48, 58, 16, alpha(shade(c.stone, -0.4), 0.45));
      // rune band
      glow(g, 50, 22, 14, c.rune, 0.6);
      g.strokeStyle = c.rune; g.lineWidth = 2;
      g.beginPath(); g.moveTo(40, 18); g.lineTo(44, 26); g.lineTo(48, 18); g.moveTo(52, 26); g.lineTo(56, 18); g.lineTo(60, 26); g.stroke();
      // square eyes and mouth
      for (const s of SIDES) { g.beginPath(); g.rect(50 + s * 12 - 5, 38, 10, 7); paint(g, '#141214', INK, 1.2); glow(g, 50 + s * 12, 41.5, 8, c.rune, 0.7); g.fillStyle = shade(c.rune, 0.3); g.fillRect(50 + s * 12 - 3, 40, 6, 3); }
      poly(g, [[46, 46], [54, 46], [52, 56], [48, 56]]); paint(g, litFill(g, 46, 46, 8, 10, shade(c.stone, 0.1), 0.3), INK, 1);
      g.beginPath(); g.rect(38, 62, 24, 5); paint(g, '#141214', INK, 1.2);
    },
  },
  {
    id: 'shieldGuardian', name: 'Shield Guardian', family: 'construct', size: 'Large', cr: '7', tags: ['guardian', 'amulet', 'bodyguard', 'wood', 'metal'],
    c: { wood: '#7a5a3a', metal: '#7c8086', gem: '#5fd0e0' },
    variants: [{ name: 'Oak & iron', c: {} }, { name: 'Dark wood & bronze', c: { wood: '#4e3626', metal: '#a8743c', gem: '#e85a5a' } }, { name: 'Pale wood & steel', c: { wood: '#b9a17d', metal: '#c9ced3', gem: '#9aff6a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      pauldrons(g, c.metal, 70);
      // wooden head frame with metal bands, no face
      rrPath(g, 28, 14, 44, 62, 10); paint(g, litFill(g, 28, 14, 44, 62, c.wood, 0.3), INK, LW);
      g.strokeStyle = alpha(shade(c.wood, -0.5), 0.5); g.lineWidth = 0.9;
      for (let i = 0; i < 6; i++) { const x = 32 + i * 7 + r() * 2; g.beginPath(); g.moveTo(x, 16); g.quadraticCurveTo(x + 2, 44, x - 1, 74); g.stroke(); }
      for (const y of [26, 56]) { rrPath(g, 26, y, 48, 6, 1.5); paint(g, litFill(g, 26, y, 48, 6, c.metal, 0.4), INK, 1.2); }
      // horn-like top struts
      for (const s of SIDES) horn(g, 50 + s * 16, 18, 50 + s * 20, 4, 50 + s * 26, -2, 6, c.metal);
      // single glowing eye-gem slot
      rrPath(g, 34, 38, 32, 10, 3); paint(g, '#141214', INK, 1.2);
      glow(g, 50, 43, 14, c.gem, 0.7);
      ellipse(g, 50, 43, 9, 2.6); g.fillStyle = shade(c.gem, 0.4); g.fill();
      // amulet on chest
      gem(g, 50, 90, 7, c.gem);
    },
  },
  {
    id: 'homunculus', name: 'Homunculus', family: 'construct', size: 'Tiny', cr: '0', tags: ['familiar', 'wizard', 'servant', 'wings', 'tiny'],
    c: { skin: '#7a8a5a', wing: '#5a4a3a', eye: '#ffcf3a' },
    variants: [{ name: 'Olive', c: {} }, { name: 'Grey', c: { skin: '#8a8a8a', wing: '#4a4448' } }, { name: 'Clay red', c: { skin: '#a86a4a', wing: '#5a3a2a', eye: '#9aff6a' } }],
    draw: ({ g, c }) => {
      batWings(g, c.wing, 60, 0.9, 6);
      shoulders(g, shade(c.skin, -0.15), 78, 0.55);
      ears(g, 50, 48, 18, 'point', c.skin, 1.2);
      head(g, c.skin, { top: 26, chin: 80, w: 22, jaw: 0.5, mid: 50 });
      // stitched seam on top
      stitch(g, [[38, 30], [50, 26], [62, 30]]);
      eyes(g, 50, 50, 9.5, 7, 6.4, c.eye, { pupil: 'wide' });
      nose(g, 50, 60, 'flat', c.skin);
      smirk(g, 50, 67, 8, 3, 2.4);
    },
  },
  {
    id: 'scarecrow', name: 'Scarecrow', family: 'construct', size: 'Medium', tags: ['farm', 'field', 'haunted', 'straw', 'folklore', 'harvest'],
    c: { sack: '#c8b088', hat: '#6a5236', straw: '#e8c860', eye: '#ff8a1a', coat: '#4a5a3a' },
    variants: [{ name: 'Burlap', c: {} }, { name: 'Pale sack', c: { sack: '#e0d4bc', eye: '#7ad8ff' } }, { name: 'Black hat', c: { hat: '#2a2626', coat: '#5a2a2a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, c.coat, 72, 0.95);
      // straw spilling at collar and sleeves
      g.strokeStyle = c.straw; g.lineWidth = 1.6; g.lineCap = 'round';
      for (let i = 0; i < 16; i++) { const x = 30 + r() * 40, y = 74 + r() * 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 10, y + 8 + r() * 6); g.stroke(); }
      for (let i = 0; i < 10; i++) { const s = i % 2 ? 1 : -1, x = 50 + s * (16 + r() * 8); g.beginPath(); g.moveTo(x, 30); g.lineTo(x + s * (6 + r() * 10), 30 + (r() - 0.3) * 14); g.stroke(); }
      // sack head, tied at the neck
      blob(g, [[50, 22], [70, 26], [76, 48], [68, 68], [56, 74], [44, 74], [32, 68], [24, 48], [30, 26]]);
      paint(g, domeFill(g, 46, 44, 32, c.sack, 0.25), INK, LW);
      g.strokeStyle = alpha(shade(c.sack, -0.35), 0.5); g.lineWidth = 0.8;
      for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(28, 30 + i * 8); g.lineTo(72, 30 + i * 8); g.stroke(); }
      g.beginPath(); g.moveTo(40, 74); g.lineTo(60, 74); g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke(); g.strokeStyle = '#a8804a'; g.lineWidth = 2; g.stroke();
      // carved glowing eyes
      for (const s of SIDES) { poly(g, [[50 + s * 4, 46], [50 + s * 16, 40], [50 + s * 14, 50]]); paint(g, '#1a0e08', INK, 1.2); glow(g, 50 + s * 11, 46, 9, c.eye, 0.8); circle(g, 50 + s * 11, 46, 1.8); g.fillStyle = shade(c.eye, 0.5); g.fill(); }
      // stitched grin
      stitch(g, [[34, 58], [42, 64], [50, 65], [58, 64], [66, 58]]);
      // floppy hat
      ellipse(g, 50, 28, 40, 9, -0.06); paint(g, litFill(g, 10, 19, 80, 18, c.hat, 0.3), INK, LW);
      blob(g, [[34, 26], [36, 8], [52, 0], [64, 10], [66, 26]]); paint(g, litFill(g, 34, 0, 32, 26, c.hat, 0.3), INK, LW);
      rrPath(g, 34, 20, 32, 5, 1); paint(g, '#8a3a2a', INK, 1);
    },
  },
  {
    id: 'clockworkSoldier', name: 'Clockwork Soldier', family: 'construct', size: 'Medium', tags: ['clockwork', 'gears', 'automaton', 'brass', 'folklore', 'guard'],
    c: { brass: '#c9a24a', steel: '#8a9098', eye: '#7ad8ff', coat: '#2f5d8a' },
    variants: [{ name: 'Brass & blue', c: {} }, { name: 'Copper & red', c: { brass: '#c27c4b', coat: '#a3312c', eye: '#ffd23a' } }, { name: 'Steel & green', c: { brass: '#a8b0b8', coat: '#3e6b3a' } }],
    draw: ({ g, c }) => {
      // wind-up key behind
      g.beginPath(); g.moveTo(78, 46); g.lineTo(92, 40); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.strokeStyle = c.brass; g.lineWidth = 3; g.stroke();
      for (const s of SIDES) { ellipse(g, 94, 40 + s * 7, 5, 7, 0.4); paint(g, litFill(g, 88, 30, 12, 20, c.brass, 0.4), INK, 1.3); }
      shoulders(g, c.coat, 72, 0.95);
      for (const s of SIDES) { rrPath(g, 50 + s * 30 - 10, 70, 20, 7, 2); paint(g, litFill(g, 0, 70, 100, 7, c.brass, 0.4), INK, 1.2); }
      for (const y of [80, 90]) { circle(g, 50, y, 2.4); paint(g, c.brass, INK, 0.9); }
      // barrel head
      rrPath(g, 28, 22, 44, 52, 12); paint(g, litFill(g, 28, 22, 44, 52, c.brass, 0.45), INK, LW);
      // gear on the side
      for (const s of SIDES) {
        const gx = 50 + s * 24, gy = 46;
        g.beginPath();
        for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, rr2 = i % 2 ? 9 : 7; g.lineTo(gx + Math.cos(a) * rr2, gy + Math.sin(a) * rr2); }
        g.closePath(); paint(g, litFill(g, gx - 9, gy - 9, 18, 18, c.steel, 0.4), INK, 1.2);
        circle(g, gx, gy, 2.4); paint(g, c.brass, INK, 0.8);
      }
      rrPath(g, 28, 22, 44, 52, 12); g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
      // shako cap
      rrPath(g, 32, 4, 36, 22, 3); paint(g, litFill(g, 32, 4, 36, 22, c.coat, 0.3), INK, LW);
      rrPath(g, 28, 22, 44, 5, 2); paint(g, '#1a1a1c', INK, 1.2);
      gem(g, 50, 13, 4, c.brass);
      // lens eyes
      for (const s of SIDES) { circle(g, 50 + s * 9, 44, 6); paint(g, litFill(g, 50 + s * 9 - 6, 38, 12, 12, c.steel, 0.4), INK, 1.4); eye(g, 50 + s * 9, 44, 3.8, 3.8, c.eye, { white: null, pupil: 'round', glow: c.eye }); }
      // moustache grill
      for (let i = 0; i < 5; i++) line(g, 40 + i * 5, 58, 40 + i * 5, 66, INK, 1.6);
      rrPath(g, 38, 57, 24, 10, 2); g.strokeStyle = INK; g.lineWidth = 1.4; g.stroke();
    },
  },
];
function rrPath(g: G, x: number, y: number, w: number, h: number, rad: number) {
  rad = Math.max(0, Math.min(rad, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + rad, y);
  g.arcTo(x + w, y, x + w, y + h, rad);
  g.arcTo(x + w, y + h, x, y + h, rad);
  g.arcTo(x, y + h, x, y, rad);
  g.arcTo(x, y, x + w, y, rad);
  g.closePath();
}

// ======================================================================================
// OOZES
// ======================================================================================
function oozeBlob(g: G, col: string, rand: () => number, a: number, top = 20) {
  const pts = [[50, top], [70, top + 4], [84, top + 22], [92, 64], [104, 100], [-4, 100], [8, 64], [16, top + 22], [30, top + 4]];
  blob(g, pts);
  const gr = g.createRadialGradient(36, top + 18, 4, 50, 60, 60);
  gr.addColorStop(0, alpha(shade(col, 0.45), a));
  gr.addColorStop(0.55, alpha(col, a));
  gr.addColorStop(1, alpha(shade(col, -0.45), Math.min(1, a + 0.1)));
  paint(g, gr, INK, LW);
  // drips on the edge
  for (let i = 0; i < 5; i++) {
    const x = 14 + i * 18 + rand() * 6, y = 66 + rand() * 10, l = 8 + rand() * 10;
    g.beginPath(); g.moveTo(x - 3, y); g.quadraticCurveTo(x - 3, y + l, x, y + l + 2); g.quadraticCurveTo(x + 3, y + l, x + 3, y); g.fillStyle = alpha(shade(col, -0.2), a); g.fill();
  }
  return pts;
}
function shine(g: G, x: number, y: number, rx: number, ry: number, rot = -0.5, a = 0.65) {
  ellipse(g, x, y, rx, ry, rot); g.fillStyle = `rgba(255,255,255,${a})`; g.fill();
}
function bubbles(g: G, rand: () => number, x: number, y: number, w: number, h: number, n: number, col: string) {
  for (let i = 0; i < n; i++) {
    const bx = x + rand() * w, by = y + rand() * h, br = 1.2 + rand() * 3;
    circle(g, bx, by, br); g.strokeStyle = alpha(shade(col, 0.5), 0.8); g.lineWidth = 0.9; g.stroke();
    circle(g, bx - br * 0.35, by - br * 0.35, br * 0.3); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fill();
  }
}
function tinySkull(g: G, x: number, y: number, s: number, a = 0.8) {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s);
  blob(g, [[0, -9], [7, -6], [8, 1], [4, 6], [-4, 6], [-8, 1], [-7, -6]]); paint(g, '#e8e0cc', INK, 1.2);
  for (const k of SIDES) { circle(g, k * 3.2, -0.5, 2.2); g.fillStyle = '#2a2420'; g.fill(); }
  g.fillStyle = '#e8e0cc'; g.fillRect(-3.5, 5, 7, 4); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(-3.5, 5, 7, 4);
  g.restore();
}

const OOZES: CreatureDef[] = [
  {
    id: 'gelatinousCube', name: 'Gelatinous Cube', family: 'ooze', size: 'Large', srd: 'gelatinousCube', cr: '2', tags: ['cube', 'jelly', 'dungeon', 'engulf', 'transparent'],
    c: { gel: '#7fd08a', edge: '#3a8a4a' },
    variants: [{ name: 'Green, full', c: {}, f: { full: 1 } }, { name: 'Green, empty', c: {}, f: { full: 0 } }, { name: 'Clear blue', c: { gel: '#8ac8e8', edge: '#3a7aa8' }, f: { full: 1 } }, { name: 'Amber', c: { gel: '#e8c070', edge: '#a8782a' }, f: { full: 1 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      // cube in 3/4 view: front face and top face
      const front = [[16, 34], [76, 34], [76, 94], [16, 94]], top = [[16, 34], [32, 16], [92, 16], [76, 34]], side = [[76, 34], [92, 16], [92, 76], [76, 94]];
      // contents first, seen through the gel
      if (f.full) {
        tinySkull(g, 38, 70, 1.3, 0.85);
        g.save(); g.globalAlpha = 0.85; g.translate(60, 58); g.rotate(0.7);
        poly(g, [[-2, -18], [0, -22], [2, -18], [2, 10], [-2, 10]]); paint(g, '#c9ced3', INK, 1);
        g.fillStyle = '#a8743c'; g.fillRect(-6, 10, 12, 2.5); g.restore();
        for (let i = 0; i < 6; i++) { const x = 24 + r() * 44, y = 78 + r() * 12; ellipse(g, x, y, 3, 2.4, r()); paint(g, '#e2b84a', alpha(INK, 0.6), 0.7); }
      }
      poly(g, side); g.fillStyle = alpha(shade(c.gel, -0.25), 0.55); g.fill();
      poly(g, top); g.fillStyle = alpha(shade(c.gel, 0.3), 0.6); g.fill();
      poly(g, front); g.fillStyle = alpha(c.gel, 0.45); g.fill();
      bubbles(g, r, 20, 38, 52, 52, 7, c.gel);
      // edges
      g.strokeStyle = INK; g.lineWidth = LW; g.lineJoin = 'round';
      poly(g, [[16, 34], [32, 16], [92, 16], [92, 76], [76, 94], [16, 94]]); g.stroke();
      g.strokeStyle = alpha(c.edge, 0.9); g.lineWidth = 1.6;
      poly(g, [[16, 34], [76, 34], [92, 16]], false); g.stroke();
      line(g, 76, 34, 76, 94, alpha(c.edge, 0.9), 1.6);
      shine(g, 30, 44, 9, 3, -0.3, 0.6);
      shine(g, 50, 24, 12, 2.4, 0, 0.5);
    },
  },
  {
    id: 'blackPudding', name: 'Black Pudding', family: 'ooze', size: 'Large', cr: '4', tags: ['ooze', 'acid', 'corrode', 'blob', 'sewer'],
    c: { ooze: '#1e1a1e' },
    variants: [{ name: 'Black', c: {} }, { name: 'Tar brown', c: { ooze: '#3a2a1e' } }, { name: 'Bruise purple', c: { ooze: '#2e1e36' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      oozeBlob(g, mix(c.ooze, '#5a5a6a', 0.25), r, 1, 18);
      // glossy highlights read as wet tar
      shine(g, 34, 34, 12, 4.5, -0.6, 0.55);
      shine(g, 62, 30, 5, 2, -0.3, 0.45);
      shine(g, 24, 62, 4, 1.6, -0.9, 0.35);
      // acid fizz
      for (let i = 0; i < 6; i++) { circle(g, 20 + r() * 60, 40 + r() * 40, 1 + r() * 2); g.strokeStyle = 'rgba(200,220,120,0.55)'; g.lineWidth = 1; g.stroke(); }
      // lumpy pseudopods on top
      for (const [x, y, rr2] of [[40, 22, 8], [60, 24, 6]]) { circle(g, x, y, rr2); paint(g, domeFill(g, x, y, rr2, mix(c.ooze, '#5a5a6a', 0.25), 0.5), INK, 1.6); shine(g, x - 2, y - 3, rr2 * 0.4, rr2 * 0.2, -0.5, 0.5); }
    },
  },
  {
    id: 'grayOoze', name: 'Gray Ooze', family: 'ooze', size: 'Medium', cr: '1/2', tags: ['ooze', 'acid', 'puddle', 'stone', 'rust'],
    c: { ooze: '#8a8c8e' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Slate', c: { ooze: '#6a7480' } }, { name: 'Greenish', c: { ooze: '#848e7a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // low, spread puddle
      const pts = lumpy(50, 62, 44, 0.25, 12, r, 30);
      blob(g, pts);
      paint(g, domeFill(g, 44, 52, 46, c.ooze, 0.35), INK, LW);
      // rippling rings
      g.strokeStyle = alpha(shade(c.ooze, -0.4), 0.6); g.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) { ellipse(g, 50, 62, 12 + i * 10, 8 + i * 7); g.stroke(); }
      // a rising pseudopod
      blob(g, [[28, 64], [32, 46], [44, 38], [58, 40], [70, 48], [72, 64]]); paint(g, domeFill(g, 46, 46, 26, shade(c.ooze, 0.08), 0.4), INK, 1.8);
      shine(g, 42, 44, 7, 2.4, -0.3, 0.6);
      shine(g, 30, 52, 9, 3, -0.4, 0.45);
      bubbles(g, r, 20, 54, 60, 20, 5, c.ooze);
    },
  },
  {
    id: 'ochreJelly', name: 'Ochre Jelly', family: 'ooze', size: 'Large', cr: '2', tags: ['ooze', 'jelly', 'acid', 'split', 'yellow'],
    c: { jelly: '#d8a03a' },
    variants: [{ name: 'Ochre', c: {} }, { name: 'Mustard', c: { jelly: '#c8b030' } }, { name: 'Rust', c: { jelly: '#c0642a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      oozeBlob(g, c.jelly, r, 0.88, 22);
      // inner core shadow and floating bits
      ellipse(g, 52, 64, 24, 16); g.fillStyle = alpha(shade(c.jelly, -0.3), 0.4); g.fill();
      for (let i = 0; i < 5; i++) { ellipse(g, 30 + r() * 40, 50 + r() * 26, 2 + r() * 2, 1.4 + r(), r() * 3); g.fillStyle = alpha(shade(c.jelly, -0.55), 0.7); g.fill(); }
      tinySkull(g, 64, 66, 0.7, 0.5);
      bubbles(g, r, 20, 34, 60, 40, 8, c.jelly);
      shine(g, 34, 38, 11, 4, -0.6, 0.6);
    },
  },
];
// ======================================================================================
// PLANTS
// ======================================================================================
function bark(g: G, rand: () => number, x: number, y: number, w: number, h: number, col: string, n = 9) {
  g.strokeStyle = alpha(shade(col, -0.5), 0.75);
  g.lineWidth = 1.2;
  for (let i = 0; i < n; i++) {
    const bx = x + ((i + 0.5) / n) * w + (rand() - 0.5) * 3;
    g.beginPath(); g.moveTo(bx, y + rand() * 6);
    g.bezierCurveTo(bx + (rand() - 0.5) * 6, y + h * 0.35, bx + (rand() - 0.5) * 6, y + h * 0.65, bx + (rand() - 0.5) * 4, y + h - rand() * 6);
    g.stroke();
  }
}
function knotEye(g: G, x: number, y: number, rx: number, ry: number, bark: string, glowCol: string) {
  ellipse(g, x, y, rx + 2.4, ry + 2.4); paint(g, shade(bark, -0.2), INK, 1.4);
  ellipse(g, x, y, rx, ry); paint(g, '#140c06', INK, 1);
  glow(g, x, y, rx * 2.4, glowCol, 0.8);
  circle(g, x, y, Math.min(rx, ry) * 0.5); g.fillStyle = shade(glowCol, 0.4); g.fill();
}
function leafClump(g: G, x: number, y: number, r: number, col: string, rand: () => number) {
  blob(g, lumpy(x, y, r, 0.4, 8, rand));
  paint(g, domeFill(g, x, y, r, col, 0.35), INK, 1.4);
}
function mushroomCap(g: G, cx: number, cy: number, rx: number, ry: number, col: string, spot: string, rand: () => number, spots = 6) {
  g.beginPath();
  g.moveTo(cx - rx, cy);
  g.bezierCurveTo(cx - rx, cy - ry * 1.3, cx + rx, cy - ry * 1.3, cx + rx, cy);
  g.quadraticCurveTo(cx, cy + ry * 0.35, cx - rx, cy);
  paint(g, domeFill(g, cx - rx * 0.2, cy - ry * 0.6, rx * 1.1, col, 0.35), INK, LW);
  for (let i = 0; i < spots; i++) {
    const a = Math.PI * (1.1 + rand() * 0.8), d = 0.3 + rand() * 0.55;
    ellipse(g, cx + Math.cos(a) * rx * d, cy - 2 + Math.sin(a) * ry * d, 2 + rand() * 3, 1.6 + rand() * 2);
    g.fillStyle = spot; g.fill();
  }
}

const PLANTS: CreatureDef[] = [
  {
    id: 'shamblingMound', name: 'Shambling Mound', family: 'plant', size: 'Large', cr: '5', tags: ['swamp', 'vines', 'compost', 'engulf', 'bog'],
    c: { vine: '#4a6a2e', dark: '#1e2a14', eye: '#e8f060', moss: '#7a8a3a' },
    variants: [{ name: 'Bog green', c: {} }, { name: 'Rotting brown', c: { vine: '#5a4a2a', dark: '#1e160c', moss: '#7a6a3a', eye: '#ffb02e' } }, { name: 'Autumn', c: { vine: '#8a5a24', moss: '#b87a2a', eye: '#bfff6a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, [[50, 8], [78, 16], [94, 44], [100, 100], [0, 100], [6, 44], [22, 16]]);
      paint(g, domeFill(g, 44, 40, 60, c.vine, 0.3), INK, LW);
      // dark hollow where a face would be
      blob(g, [[50, 30], [66, 36], [70, 52], [60, 66], [40, 66], [30, 52], [34, 36]]);
      g.fillStyle = c.dark; g.fill();
      for (const s of SIDES) { glow(g, 50 + s * 9, 46, 10, c.eye, 0.85); ellipse(g, 50 + s * 9, 46, 3.4, 2.4, s * 0.3); g.fillStyle = shade(c.eye, 0.4); g.fill(); }
      // tangled vines over everything
      for (let i = 0; i < 16; i++) {
        const x0 = r() * 100, y0 = 10 + r() * 80, x1 = x0 + (r() - 0.5) * 50, y1 = y0 + (r() - 0.3) * 40;
        g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + (r() - 0.5) * 20, (y0 + y1) / 2 + (r() - 0.5) * 20, x1, y1);
        g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke(); g.strokeStyle = shade(c.vine, (r() - 0.3) * 0.4); g.lineWidth = 2; g.stroke();
      }
      // hanging moss and leaves
      for (let i = 0; i < 8; i++) { const x = 10 + r() * 80, y = 14 + r() * 70; ellipse(g, x, y, 4, 2.2, r() * 3); paint(g, c.moss, INK, 0.8); }
      strands(g, r, 20, 56, 60, 30, 10, alpha(c.moss, 0.9), 1.6);
    },
  },
  {
    id: 'treant', name: 'Treant', family: 'plant', size: 'Huge', cr: '9', tags: ['tree', 'forest', 'guardian', 'ancient', 'wood'],
    c: { bark: '#6a4a2e', leaf: '#3e7a32', moss: '#7a9a3a', eye: '#ffd23a' },
    variants: [{ name: 'Summer oak', c: {} }, { name: 'Autumn', c: { leaf: '#c8642a', moss: '#a8843a' } }, { name: 'Winter', c: { leaf: '#e8f0f4', moss: '#9aa8a8', eye: '#7ad8ff' } }, { name: 'Birch', c: { bark: '#d8d2c4', leaf: '#8ab83a', eye: '#6aff8a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // branch antlers with leaf clumps
      g.strokeStyle = INK; g.lineCap = 'round';
      for (const s of SIDES) {
        for (const [x1, y1, x2, y2, w] of [[50 + s * 14, 28, 50 + s * 30, 12, 6], [50 + s * 26, 18, 50 + s * 40, 28, 4], [50 + s * 6, 24, 50 + s * 12, 8, 4]]) {
          g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = INK; g.lineWidth = w + 2.4; g.stroke(); g.strokeStyle = c.bark; g.lineWidth = w; g.stroke();
        }
        leafClump(g, 50 + s * 31, 13, 11, c.leaf, r);
        leafClump(g, 50 + s * 41, 30, 9, shade(c.leaf, -0.08), r);
        leafClump(g, 50 + s * 14, 8, 8, shade(c.leaf, 0.06), r);
      }
      shoulders(g, shade(c.bark, -0.1), 70, 1.1);
      bark(g, r, 6, 74, 88, 30, c.bark, 10);
      // long trunk face
      const hp = [[50, 14], [68, 18], [74, 40], [72, 70], [62, 88], [38, 88], [28, 70], [26, 40], [32, 18]];
      blob(g, hp); paint(g, litFill(g, 26, 14, 48, 74, c.bark, 0.3), INK, LW);
      g.save(); blob(g, hp); g.clip(); bark(g, r, 28, 14, 44, 74, c.bark, 8); g.restore();
      // brow knot and eyes
      g.beginPath(); g.moveTo(32, 38); g.quadraticCurveTo(50, 30, 68, 38); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.strokeStyle = shade(c.bark, 0.1); g.lineWidth = 3; g.stroke();
      for (const s of SIDES) knotEye(g, 50 + s * 10, 44, 4, 3.4, c.bark, c.eye);
      poly(g, [[48, 48], [53, 48], [54, 58], [47, 58]]); paint(g, litFill(g, 46, 48, 8, 10, shade(c.bark, 0.1), 0.3), INK, 1);
      // mouth hollow and mossy beard
      ellipse(g, 50, 66, 7, 3); paint(g, '#140c06', INK, 1.2);
      blob(g, [[34, 70], [42, 82], [50, 98], [58, 82], [66, 70], [58, 76], [50, 74], [42, 76]]); paint(g, litFill(g, 34, 70, 32, 28, c.moss, 0.25), INK, 1.3);
      strands(g, r, 38, 74, 24, 20, 6, alpha(shade(c.moss, -0.4), 0.8), 1);
    },
  },
  {
    id: 'awakenedTree', name: 'Awakened Tree', family: 'plant', size: 'Huge', cr: '2', tags: ['tree', 'forest', 'druid', 'wood', 'animated'],
    c: { bark: '#7a5636', leaf: '#4f8a3a', eye: '#d8f06a' },
    variants: [{ name: 'Oak', c: {} }, { name: 'Pine', c: { leaf: '#2e5a3a', bark: '#5a3e2a' }, f: { pine: 1 } }, { name: 'Autumn maple', c: { leaf: '#d8502a' } }, { name: 'Blossom', c: { leaf: '#f0b0c8', bark: '#4e3626', eye: '#ffffff' } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      // canopy above
      if (f.pine) {
        for (let i = 0; i < 3; i++) { const y = 2 + i * 14, w = 26 + i * 10; poly(g, [[50, y - 10], [50 + w, y + 18], [50 - w, y + 18]]); paint(g, litFill(g, 50 - w, y - 10, w * 2, 28, shade(c.leaf, i * 0.05), 0.3), INK, LW); }
      } else {
        blob(g, lumpy(50, 18, 46, 0.3, 12, r, 24)); paint(g, domeFill(g, 44, 10, 46, shade(c.leaf, -0.15), 0.3), INK, LW);
        for (let i = 0; i < 7; i++) leafClump(g, 10 + i * 13.5, 16 + Math.sin(i * 1.7) * 8, 10 + r() * 3, c.leaf, r);
      }
      // trunk
      g.beginPath(); g.moveTo(26, 104); g.quadraticCurveTo(34, 70, 32, 36); g.lineTo(68, 36); g.quadraticCurveTo(66, 70, 74, 104); g.closePath();
      paint(g, litFill(g, 26, 36, 48, 68, c.bark, 0.3), INK, LW);
      bark(g, r, 32, 38, 36, 64, c.bark, 7);
      for (const s of SIDES) knotEye(g, 50 + s * 9, 54, 4.4, 3.4, c.bark, c.eye);
      g.beginPath(); g.moveTo(42, 72); g.quadraticCurveTo(50, 78, 58, 72); g.quadraticCurveTo(50, 74, 42, 72); paint(g, '#140c06', INK, 1.4);
      // stubby arm-branches
      for (const s of SIDES) { g.beginPath(); g.moveTo(50 + s * 18, 62); g.quadraticCurveTo(50 + s * 34, 56, 50 + s * 42, 40); g.strokeStyle = INK; g.lineWidth = 7.4; g.stroke(); g.strokeStyle = c.bark; g.lineWidth = 5; g.stroke(); leafClump(g, 50 + s * 42, 38, 6, c.leaf, r); }
    },
  },
  {
    id: 'awakenedShrub', name: 'Awakened Shrub', family: 'plant', size: 'Small', cr: '0', tags: ['bush', 'shrub', 'garden', 'druid', 'animated'],
    c: { leaf: '#4f8a3a', eye: '#2a1a0a', flower: '#e85a7a' },
    variants: [{ name: 'Green', c: {}, f: { flowers: 0 } }, { name: 'Flowering', c: {}, f: { flowers: 1 } }, { name: 'Berry', c: { leaf: '#3a6a2e', flower: '#4a5ae8' }, f: { flowers: 1 } }, { name: 'Autumn', c: { leaf: '#b8742a', flower: '#e8c83a' }, f: { flowers: 0 } }],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 56, 44, 0.25, 14, r, 42)); paint(g, shade(c.leaf, -0.3), INK, LW);
      for (let i = 0; i < 12; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 30; leafClump(g, 50 + Math.cos(a) * d, 56 + Math.sin(a) * d, 10 + r() * 4, shade(c.leaf, (r() - 0.5) * 0.2), r); }
      if (f.flowers) for (let i = 0; i < 8; i++) { const x = 16 + r() * 68, y = 22 + r() * 66; if (Math.abs(x - 50) < 18 && y > 38 && y < 70) continue; circle(g, x, y, 3); paint(g, c.flower, INK, 0.8); circle(g, x, y, 1); g.fillStyle = '#ffe07a'; g.fill(); }
      // peeking face
      for (const s of SIDES) { ellipse(g, 50 + s * 9, 50, 6, 7); paint(g, '#f4efe2', INK, 1.4); circle(g, 50 + s * 9 + s * 1, 51, 3); g.fillStyle = c.eye; g.fill(); circle(g, 50 + s * 9, 49.5, 1); g.fillStyle = '#fff'; g.fill(); }
      g.beginPath(); g.moveTo(44, 64); g.quadraticCurveTo(50, 69, 56, 64); g.quadraticCurveTo(50, 66, 44, 64); paint(g, '#2a1410', INK, 1.2);
    },
  },
  {
    id: 'shrieker', name: 'Shrieker', family: 'plant', size: 'Medium', cr: '0', tags: ['fungus', 'mushroom', 'alarm', 'cave', 'underdark'],
    c: { cap: '#8a4a9a', spot: '#e8d8f0', stalk: '#e0d4c0', wave: '#ffffff' },
    variants: [{ name: 'Violet', c: {} }, { name: 'Red', c: { cap: '#b83a2a', spot: '#f4e8d0' } }, { name: 'Brown', c: { cap: '#8a5a34', spot: '#e8d8b0' } }, { name: 'Pale', c: { cap: '#d8ccb8', spot: '#a89a80' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // sound rings
      for (const s of SIDES) for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(50, 46, 36 + i * 8, s > 0 ? -0.6 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.6); g.strokeStyle = alpha(c.wave, 0.75 - i * 0.2); g.lineWidth = 3 - i * 0.6; g.stroke(); }
      // stalk with ring
      g.beginPath(); g.moveTo(38, 104); g.quadraticCurveTo(42, 70, 42, 50); g.lineTo(58, 50); g.quadraticCurveTo(58, 70, 62, 104); g.closePath();
      paint(g, litFill(g, 38, 50, 24, 54, c.stalk, 0.3), INK, LW);
      ellipse(g, 50, 66, 14, 4); paint(g, shade(c.stalk, -0.08), INK, 1.3);
      mushroomCap(g, 50, 50, 40, 30, c.cap, c.spot, r, 8);
      // gills under the cap and an open shriek hole
      g.strokeStyle = alpha(shade(c.cap, -0.5), 0.7); g.lineWidth = 1;
      for (let i = 0; i < 9; i++) { const x = 16 + i * 8.5; g.beginPath(); g.moveTo(x, 50 + Math.abs(x - 50) * 0.02); g.lineTo(50 + (x - 50) * 0.6, 56); g.stroke(); }
      ellipse(g, 50, 82, 6, 8); paint(g, '#2a1428', INK, 1.4);
    },
  },
  {
    id: 'violetFungus', name: 'Violet Fungus', family: 'plant', size: 'Medium', cr: '1/4', tags: ['fungus', 'mushroom', 'rot', 'tendrils', 'cave', 'underdark'],
    c: { cap: '#7a3aa8', spot: '#c8a0e8', stalk: '#b8a8c8', tendril: '#9a5ac8' },
    variants: [{ name: 'Violet', c: {} }, { name: 'Indigo', c: { cap: '#3a3aa8', tendril: '#6a6ae8', spot: '#a8a8f0' } }, { name: 'Magenta', c: { cap: '#a83a8a', tendril: '#d85ab8' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // whipping tendrils
      for (let i = 0; i < 6; i++) {
        const s = i % 2 ? 1 : -1, x0 = 50 + s * (8 + r() * 6), y0 = 70;
        const x1 = 50 + s * (30 + r() * 18), y1 = 20 + r() * 70;
        g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(x0 + s * 20, y0 - 30, x1 - s * 10, y1 + 30, x1, y1);
        g.strokeStyle = INK; g.lineWidth = 5; g.lineCap = 'round'; g.stroke(); g.strokeStyle = c.tendril; g.lineWidth = 3; g.stroke();
        circle(g, x1, y1, 2.6); paint(g, shade(c.tendril, 0.2), INK, 1);
      }
      g.beginPath(); g.moveTo(40, 104); g.quadraticCurveTo(44, 70, 44, 52); g.lineTo(56, 52); g.quadraticCurveTo(56, 70, 60, 104); g.closePath();
      paint(g, litFill(g, 40, 52, 20, 52, c.stalk, 0.3), INK, LW);
      // knobbly cap
      mushroomCap(g, 50, 52, 30, 30, c.cap, c.spot, r, 7);
      for (let i = 0; i < 5; i++) { const x = 30 + i * 10, y = 34 - Math.sin((i / 4) * Math.PI) * 8 + r() * 4; circle(g, x, y, 3); paint(g, domeFill(g, x, y, 3, shade(c.cap, 0.15), 0.4), INK, 0.9); }
    },
  },
  {
    id: 'twigBlight', name: 'Twig Blight', family: 'plant', size: 'Small', tags: ['blight', 'twigs', 'forest', 'ambush', 'cursed'],
    c: { wood: '#7a6044', eye: '#ff3a2a' },
    variants: [{ name: 'Dry', c: {} }, { name: 'Dark', c: { wood: '#4a3a2a', eye: '#ffd23a' } }, { name: 'Pale', c: { wood: '#a8987a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // bundle of sticks forming a head and shoulders
      const stick = (x1: number, y1: number, x2: number, y2: number, w: number) => {
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = INK; g.lineWidth = w + 2.2; g.lineCap = 'round'; g.stroke(); g.strokeStyle = shade(c.wood, (r() - 0.5) * 0.3); g.lineWidth = w; g.stroke();
      };
      for (let i = 0; i < 10; i++) { const x = 12 + i * 8.5; stick(x, 104, 50 + (x - 50) * 0.5, 66 + r() * 6, 3.2); }
      for (let i = 0; i < 12; i++) { const a = Math.PI * (1.05 + (i / 11) * 0.9), l = 30 + r() * 14; stick(50 + Math.cos(a) * 8, 46 + Math.sin(a) * 6, 50 + Math.cos(a) * l, 46 + Math.sin(a) * l, 2.6); }
      // tangled head core
      blob(g, lumpy(50, 50, 20, 0.35, 10, r, 24)); paint(g, domeFill(g, 46, 46, 24, c.wood, 0.3), INK, LW);
      for (let i = 0; i < 6; i++) { const y = 32 + i * 6; line(g, 32 + r() * 6, y, 68 - r() * 6, y + (r() - 0.5) * 6, alpha(shade(c.wood, -0.5), 0.8), 1.2); }
      for (const s of SIDES) { circle(g, 50 + s * 8, 46, 4.6); paint(g, '#140a06', INK, 1); glow(g, 50 + s * 8, 46, 8, c.eye, 0.8); circle(g, 50 + s * 8, 46, 2.4); g.fillStyle = shade(c.eye, 0.3); g.fill(); }
      g.beginPath(); g.moveTo(42, 60); g.lineTo(46, 57); g.lineTo(50, 61); g.lineTo(54, 57); g.lineTo(58, 60); g.strokeStyle = INK; g.lineWidth = 1.8; g.stroke();
    },
  },
  {
    id: 'needleBlight', name: 'Needle Blight', family: 'plant', size: 'Medium', tags: ['blight', 'needles', 'conifer', 'forest', 'cursed'],
    c: { needle: '#3a5a3a', wood: '#5a4030', eye: '#ffb02e' },
    variants: [{ name: 'Pine green', c: {} }, { name: 'Dead brown', c: { needle: '#7a5a34', eye: '#ff4a2a' } }, { name: 'Frosted', c: { needle: '#6a8a8a', eye: '#7ad8ff' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      shoulders(g, c.wood, 72, 1.0);
      // shaggy cone of needles
      blob(g, [[50, 8], [70, 30], [84, 62], [74, 86], [26, 86], [16, 62], [30, 30]]);
      paint(g, litFill(g, 16, 8, 68, 78, c.needle, 0.25), INK, LW);
      g.lineCap = 'round';
      for (let i = 0; i < 60; i++) {
        const y = 14 + r() * 70, hw = 6 + (y - 8) * 0.42, x = 50 + (r() - 0.5) * 2 * hw;
        const s = x < 50 ? -1 : 1;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * (3 + r() * 4), y + 4 + r() * 3);
        g.strokeStyle = shade(c.needle, (r() - 0.4) * 0.6); g.lineWidth = 1.1; g.stroke();
      }
      // hollow face
      blob(g, [[50, 38], [62, 44], [62, 60], [50, 68], [38, 60], [38, 44]]); g.fillStyle = '#120c08'; g.fill();
      for (const s of SIDES) { glow(g, 50 + s * 6, 50, 8, c.eye, 0.85); ellipse(g, 50 + s * 6, 50, 2.6, 1.8, s * 0.4); g.fillStyle = shade(c.eye, 0.4); g.fill(); }
      for (const x of [46, 50, 54]) { poly(g, [[x - 1.4, 58], [x, 63], [x + 1.4, 58]]); g.fillStyle = '#c8b890'; g.fill(); }
    },
  },
  {
    id: 'vineBlight', name: 'Vine Blight', family: 'plant', size: 'Medium', tags: ['blight', 'vines', 'strangle', 'forest', 'cursed'],
    c: { vine: '#4a6a2e', leaf: '#6a9a3a', eye: '#ff4a6a', flower: '#a83a6a' },
    variants: [{ name: 'Green', c: {} }, { name: 'Withered', c: { vine: '#5a4a2a', leaf: '#8a7a3a', eye: '#ffd23a' } }, { name: 'Thorny red', c: { vine: '#5a2a24', leaf: '#7a3a2a', flower: '#e8e0d2' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // coils of vine forming a hunched mass
      for (let i = 0; i < 14; i++) {
        const cx = 50 + (r() - 0.5) * 50, cy = 30 + r() * 70, rr2 = 10 + r() * 16;
        g.beginPath(); g.arc(cx, cy, rr2, r() * 6, r() * 6 + 3.6);
        g.strokeStyle = INK; g.lineWidth = 6.4; g.lineCap = 'round'; g.stroke(); g.strokeStyle = shade(c.vine, (r() - 0.4) * 0.3); g.lineWidth = 4.4; g.stroke();
      }
      // leafy head
      blob(g, lumpy(50, 42, 20, 0.3, 10, r, 22)); paint(g, domeFill(g, 46, 38, 24, c.vine, 0.3), INK, LW);
      for (let i = 0; i < 6; i++) { const a = Math.PI * (1 + i * 0.2), x = 50 + Math.cos(a) * 20, y = 42 + Math.sin(a) * 22; ellipse(g, x, y, 7, 3.4, a); paint(g, domeFill(g, x, y, 7, c.leaf, 0.3), INK, 1); }
      // glaring eyes and a thorned maw
      for (const s of SIDES) { poly(g, [[50 + s * 3, 40], [50 + s * 14, 36], [50 + s * 12, 46]]); paint(g, '#140a06', INK, 1); glow(g, 50 + s * 10, 42, 8, c.eye, 0.8); circle(g, 50 + s * 10, 42, 1.8); g.fillStyle = shade(c.eye, 0.4); g.fill(); }
      openMouth(g, 50, 54, 9, 7, { top: 5, bottom: 4, inside: '#2a0a0a' });
      for (let i = 0; i < 3; i++) { const x = 20 + r() * 60, y = 70 + r() * 24; circle(g, x, y, 3.4); paint(g, c.flower, INK, 1); }
    },
  },
  {
    id: 'myconid', name: 'Myconid', family: 'plant', size: 'Medium', tags: ['mushroom folk', 'fungus', 'spores', 'underdark', 'peaceful'],
    c: { cap: '#c8743a', spot: '#f4e8d0', skin: '#e0d0b8', eye: '#3a2a1a', spore: '#e8e0a0' },
    variants: [{ name: 'Rust cap', c: {} }, { name: 'Violet cap', c: { cap: '#7a4a9a', spore: '#d8b8f0' } }, { name: 'Blue glow', c: { cap: '#3a6ab8', spot: '#9ae8ff', spore: '#9ae8ff' } }, { name: 'White cap', c: { cap: '#e8e2d4', spot: '#b8a888' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 12; i++) { circle(g, 8 + r() * 84, 10 + r() * 80, 0.8 + r() * 1.6); g.fillStyle = alpha(c.spore, 0.75); g.fill(); }
      shoulders(g, shade(c.skin, -0.1), 74, 0.75);
      // stalk-face
      blob(g, [[36, 40], [64, 40], [66, 62], [60, 80], [40, 80], [34, 62]]);
      paint(g, domeFill(g, 46, 56, 26, c.skin, 0.3), INK, LW);
      for (const s of SIDES) { ellipse(g, 50 + s * 8, 56, 3.4, 4.2); paint(g, c.eye, INK, 1); circle(g, 50 + s * 8 - 1, 54.6, 1); g.fillStyle = '#fff'; g.fill(); }
      mouthLine(g, 50, 68, 4, 1.4, 1.4);
      // big cap
      mushroomCap(g, 50, 42, 44, 30, c.cap, c.spot, r, 7);
      g.strokeStyle = alpha(shade(c.cap, -0.5), 0.7); g.lineWidth = 1;
      for (let i = 0; i < 9; i++) { const x = 10 + i * 10; g.beginPath(); g.moveTo(x, 42); g.lineTo(50 + (x - 50) * 0.7, 47); g.stroke(); }
    },
  },
];

// ======================================================================================
// ABERRATIONS (SRD only)
// ======================================================================================
function tentacle(g: G, x0: number, y0: number, x1: number, y1: number, bend: number, w: number, col: string) {
  const mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2;
  g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1);
  g.strokeStyle = INK; g.lineWidth = w + 2.4; g.lineCap = 'round'; g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.stroke();
  g.strokeStyle = alpha('#ffffff', 0.25); g.lineWidth = w * 0.3; g.stroke();
}

const ABERRATIONS: CreatureDef[] = [
  {
    id: 'aboleth', name: 'Aboleth', family: 'aberration', size: 'Large', cr: '10', tags: ['fish', 'tentacles', 'telepath', 'underwater', 'slime', 'ancient'],
    c: { skin: '#4a7a7a', belly: '#8ab0a0', eye: '#ff3a2a', slime: '#bff0d0' },
    variants: [{ name: 'Blue-green', c: {} }, { name: 'Murky grey', c: { skin: '#5a6266', belly: '#9aa0a0', eye: '#ffd23a' } }, { name: 'Deep violet', c: { skin: '#4a3a6a', belly: '#8a7aa8' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // drooping tentacles below
      for (const [x, b] of [[30, -10], [42, 6], [58, -6], [70, 10]]) tentacle(g, x, 64, x + b * 0.6, 108, b, 7, shade(c.skin, -0.08));
      // pectoral fins
      for (const s of SIDES) {
        poly(g, [[50 + s * 34, 36], [50 + s * 52, 22], [50 + s * 50, 40], [50 + s * 54, 56], [50 + s * 34, 56]]);
        paint(g, litFill(g, 0, 22, 100, 34, shade(c.skin, -0.15), 0.3), INK, LW * 0.9);
        for (const y of [30, 40, 50]) line(g, 50 + s * 36, 46, 50 + s * 50, y, alpha(shade(c.skin, -0.5), 0.8), 1);
      }
      // great rounded fish head
      blob(g, [[50, 6], [78, 14], [92, 40], [86, 66], [66, 78], [34, 78], [14, 66], [8, 40], [22, 14]]);
      paint(g, domeFill(g, 42, 30, 56, c.skin, 0.35), INK, LW);
      // fin crest
      poly(g, [[44, 8], [50, -4], [56, 8]]); paint(g, shade(c.skin, -0.1), INK, 1.2);
      // pale underside
      ellipse(g, 50, 66, 30, 10); g.fillStyle = alpha(c.belly, 0.7); g.fill();
      // three eyes stacked down the centre
      for (const [y, rr2] of [[22, 5.5], [36, 6.5], [51, 5.5]]) { ellipse(g, 50, y, rr2 + 2.6, rr2 * 0.7 + 2); paint(g, shade(c.skin, -0.3), INK, 1.2); eye(g, 50, y, rr2, rr2 * 0.65, c.eye, { pupil: 'slit', glow: c.eye }); }
      // slime glints
      for (let i = 0; i < 6; i++) { ellipse(g, 20 + r() * 60, 16 + r() * 50, 2.4, 1.2, r() * 3); g.fillStyle = alpha(c.slime, 0.6); g.fill(); }
      // mouth slit
      g.beginPath(); g.moveTo(30, 64); g.quadraticCurveTo(50, 74, 70, 64); g.quadraticCurveTo(50, 80, 30, 64); paint(g, '#1a2a2a', INK, 1.6);
      shine(g, 32, 22, 9, 3, -0.6, 0.45);
    },
  },
  {
    id: 'chuul', name: 'Chuul', family: 'aberration', size: 'Large', cr: '4', tags: ['crab', 'lobster', 'pincers', 'swamp', 'paralyze', 'tentacles'],
    c: { shell: '#7a6a3a', tent: '#c88a8a', eye: '#1a1a1a' },
    variants: [{ name: 'Olive', c: {} }, { name: 'Lobster red', c: { shell: '#a83a2a' } }, { name: 'Slate blue', c: { shell: '#4a5a7a' } }],
    draw: ({ g, c }) => {
      // raised pincers
      for (const s of SIDES) {
        g.save(); g.translate(50 + s * 29, 62); g.rotate(s * 0.08);
        poly(g, [[-6, 40], [-8, 4], [-16, -14], [-14, -36], [-4, -48], [-4, -26], [0, -18], [4, -26], [8, -46], [16, -34], [16, -12], [8, 4], [6, 40]]);
        paint(g, litFill(g, -16, -48, 32, 88, c.shell, 0.4), INK, LW);
        g.restore();
      }
      shoulders(g, shade(c.shell, -0.12), 70, 0.9);
      // segmented carapace head
      blob(g, [[50, 14], [72, 20], [80, 42], [72, 62], [50, 70], [28, 62], [20, 42], [28, 20]]);
      paint(g, litFill(g, 20, 14, 60, 56, c.shell, 0.4), INK, LW);
      g.strokeStyle = alpha(shade(c.shell, -0.55), 0.7); g.lineWidth = 1.4;
      for (const y of [28, 40]) { g.beginPath(); g.moveTo(26, y); g.quadraticCurveTo(50, y - 8, 74, y); g.stroke(); }
      // beady eyes on nubs
      for (const s of SIDES) { circle(g, 50 + s * 12, 32, 4.6); paint(g, domeFill(g, 50 + s * 12, 32, 4.6, c.eye, 0.6), INK, 1.2); circle(g, 50 + s * 12 - 1.4, 30.6, 1.2); g.fillStyle = '#fff'; g.fill(); }
      // mouth tentacles
      for (const [x, b] of [[42, -6], [47, 4], [53, -4], [58, 6]]) tentacle(g, x, 54, x + b, 82, b, 3.4, c.tent);
    },
  },
  {
    id: 'cloaker', name: 'Cloaker', family: 'aberration', size: 'Large', cr: '8', tags: ['cloak', 'manta', 'ambush', 'darkness', 'cave'],
    c: { hide: '#2e2a30', under: '#6a5a5a', eye: '#ff2a1a', bone: '#d8ccb0' },
    variants: [{ name: 'Black', c: {} }, { name: 'Deep brown', c: { hide: '#3a2a20', under: '#7a5a48' } }, { name: 'Grey', c: { hide: '#55555c', under: '#8a8490', eye: '#ffd23a' } }],
    draw: ({ g, c }) => {
      // spread cloak wings with scalloped edge
      g.beginPath(); g.moveTo(50, 14);
      g.quadraticCurveTo(80, 10, 100, 30); g.lineTo(96, 48); g.quadraticCurveTo(90, 46, 88, 56); g.quadraticCurveTo(82, 56, 80, 66); g.quadraticCurveTo(72, 66, 66, 78);
      g.lineTo(50, 104); g.lineTo(34, 78); g.quadraticCurveTo(28, 66, 20, 66); g.quadraticCurveTo(18, 56, 12, 56); g.quadraticCurveTo(10, 46, 4, 48); g.lineTo(0, 30); g.quadraticCurveTo(20, 10, 50, 14);
      paint(g, litFill(g, 0, 10, 100, 94, c.hide, 0.35), INK, LW);
      // bony ridge "clasps"
      for (const s of SIDES) { for (let i = 0; i < 3; i++) { const x = 50 + s * (22 + i * 12), y = 26 + i * 4; poly(g, [[x - 2.4, y + 2], [x + s * 2, y - 6], [x + 2.4, y + 2]]); paint(g, c.bone, INK, 1); } }
      // pale underside of the face
      blob(g, [[50, 26], [64, 34], [64, 56], [50, 70], [36, 56], [36, 34]]); paint(g, domeFill(g, 48, 44, 22, c.under, 0.3), INK, 1.6);
      for (const s of SIDES) eye(g, 50 + s * 8, 40, 5, 3.6, c.eye, { white: null, pupil: 'none', glow: c.eye, rot: 0.35 });
      openMouth(g, 50, 52, 9, 10, { top: 5, bottom: 4, fangs: 4, inside: '#1a0808' });
      // whip tail
      g.beginPath(); g.moveTo(50, 98); g.quadraticCurveTo(62, 106, 72, 100); g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke(); g.strokeStyle = c.hide; g.lineWidth = 2; g.stroke();
    },
  },
  {
    id: 'gibberingMouther', name: 'Gibbering Mouther', family: 'aberration', size: 'Medium', cr: '2', tags: ['blob', 'eyes', 'mouths', 'madness', 'flesh'],
    c: { flesh: '#b87a6a', eye: '#d8c84a', mouth: '#4a1414' },
    variants: [{ name: 'Flesh', c: {} }, { name: 'Pallid', c: { flesh: '#c8b8a0', eye: '#4ab8e8' } }, { name: 'Sickly', c: { flesh: '#8a9a6a', eye: '#ff6a2a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 56, 46, 0.3, 12, r, 44)); paint(g, domeFill(g, 42, 44, 52, c.flesh, 0.35), INK, LW);
      // mouths
      for (const [x, y, w] of [[50, 64, 11], [26, 46, 7], [72, 74, 7], [32, 82, 6]]) openMouth(g, x, y, w, w * 0.7, { top: Math.round(w / 2.2), bottom: Math.round(w / 3), inside: c.mouth, tongue: '#c8505a' });
      // many eyes of different sizes
      for (const [x, y, rr2] of [[44, 34, 7], [64, 40, 5.4], [28, 64, 4], [58, 22, 3.6], [78, 56, 4.6], [36, 22, 3], [52, 84, 3.2], [74, 28, 3]]) {
        circle(g, x, y, rr2 + 1.8); paint(g, shade(c.flesh, -0.15), INK, 1);
        eye(g, x, y, rr2, rr2, c.eye, { pupil: 'round', rot: r() });
      }
    },
  },
  {
    id: 'otyugh', name: 'Otyugh', family: 'aberration', size: 'Large', cr: '5', tags: ['sewer', 'garbage', 'tentacles', 'filth', 'dungeon'],
    c: { hide: '#8a7a5a', mouth: '#3a1410', eye: '#e8d84a' },
    variants: [{ name: 'Mud', c: {} }, { name: 'Sewer green', c: { hide: '#6a7a52' } }, { name: 'Grey', c: { hide: '#7a7672', eye: '#ff7a3a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // eye stalk rising from the top
      g.beginPath(); g.moveTo(50, 44); g.quadraticCurveTo(44, 30, 52, 20); g.strokeStyle = INK; g.lineWidth = 9; g.lineCap = 'round'; g.stroke(); g.strokeStyle = c.hide; g.lineWidth = 6.4; g.stroke();
      // tentacles with spiked pads
      for (const s of SIDES) {
        const tx = 50 + s * 32, ty = 24;
        tentacle(g, 50 + s * 24, 60, tx, ty, s * 14, 6, shade(c.hide, -0.08));
        for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.4; poly(g, [[tx + Math.cos(a) * 3, ty + Math.sin(a) * 3], [tx + Math.cos(a + 0.35) * 10, ty + Math.sin(a + 0.35) * 10], [tx + Math.cos(a + 0.7) * 3, ty + Math.sin(a + 0.7) * 3]]); paint(g, '#d8ccb0', INK, 0.8); }
        ellipse(g, tx, ty, 6, 5); paint(g, domeFill(g, tx, ty, 6, c.hide), INK, 1.2);
      }
      // bloated round body
      blob(g, lumpy(50, 72, 44, 0.18, 12, r, 36)); paint(g, domeFill(g, 42, 58, 50, c.hide, 0.3), INK, LW);
      warts(g, r, 12, 40, 76, 56, 10, shade(c.hide, -0.2), 1.6);
      // huge toothy maw
      g.beginPath(); g.moveTo(16, 62); g.quadraticCurveTo(50, 54, 84, 62); g.quadraticCurveTo(70, 96, 50, 96); g.quadraticCurveTo(30, 96, 16, 62);
      paint(g, c.mouth, INK, 1.8);
      g.save(); g.clip(); g.fillStyle = '#e8dcc0';
      for (let i = 0; i < 9; i++) { const x = 20 + i * 7.5; poly(g, [[x - 3, 58], [x, 66 + (i % 2) * 3], [x + 3, 58]]); g.fill(); }
      for (let i = 0; i < 7; i++) { const x = 28 + i * 7.4; poly(g, [[x - 3, 98], [x, 89], [x + 3, 98]]); g.fill(); }
      g.restore();
      // three-eyed stalk head
      circle(g, 52, 18, 11); paint(g, domeFill(g, 52, 18, 11, c.hide, 0.35), INK, LW);
      for (const [x, y] of [[46.5, 16], [57.5, 16], [52, 23]]) eye(g, x, y, 3.6, 3.6, c.eye, { pupil: 'round' });
    },
  },
];

// ======================================================================================
/** Giants, fiends, celestials, elementals, constructs, oozes, plants and aberrations. */
export const PLANAR_CREATURES: CreatureDef[] = [...GIANTS, ...FIENDS, ...CELESTIALS, ...ELEMENTALS, ...CONSTRUCTS, ...OOZES, ...PLANTS, ...ABERRATIONS];

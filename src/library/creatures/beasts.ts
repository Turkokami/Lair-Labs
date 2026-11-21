// Creature tokens: dragons, beasts and monstrosities. Our own designs, drawn in code.
// Front-facing heads and busts in a 100 x 100 box; the renderer clips them to a circle.
// Light from the top-left, ink outlines, one bold signature feature per creature so it reads at 40 px.
import type { CreatureDef, CreatureSize, Colors, G, Variant } from '../art/types';
import { rng, blob, paint, domeFill, litFill, ellipse, circle, poly, shade, mix, alpha, glow, INK, LW } from '../art/kit';

type Pt = number[];
type Rand = () => number;
type Flags = Record<string, number>;

// ===================================================================================================
// Shared drawing helpers (local to this file)
// ===================================================================================================
const mir = (fn: (s: number) => void) => { fn(-1); fn(1); };

/** Shoulders / chest running off the bottom of the token. */
function bust(g: G, col: string, top = 66, half = 46, lw = LW) {
  blob(g, [[50 - half - 6, 112], [50 - half + 2, top + 14], [50 - half * 0.45, top], [50 + half * 0.45, top], [50 + half - 2, top + 14], [50 + half + 6, 112]]);
  paint(g, domeFill(g, 50, top + 24, half + 6, col, 0.25), INK, lw);
}
/** Smooth closed shape painted with a dome light. */
function shape(g: G, pts: number[][], col: string, cx = 50, cy = 50, rad = 40, lw = LW, k = 0.32) {
  blob(g, pts);
  paint(g, domeFill(g, cx, cy, rad, col, k), INK, lw);
}
/** Straight-edged shape painted with a dome light. */
function sharp(g: G, pts: number[][], col: string, cx = 50, cy = 50, rad = 40, lw = LW, k = 0.32) {
  poly(g, pts);
  paint(g, domeFill(g, cx, cy, rad, col, k), INK, lw);
}
/** Mirror a point list around x = 50 (for one side drawn as s = 1). */
const mx = (pts: number[][], s: number) => pts.map(([x, y]) => [50 + (x - 50) * s, y]);

interface EyeOpt { rot?: number; pupil?: 'round' | 'slit' | 'goat' | 'bead' | 'none' | 'small'; pr?: number; glow?: boolean; brow?: number; lid?: string; s?: number; lw?: number; pcol?: string }
function eye(g: G, x: number, y: number, rx: number, ry: number, col: string, o: EyeOpt = {}) {
  const rot = o.rot ?? 0;
  if (o.glow) glow(g, x, y, rx * 3.2, col, 0.55);
  ellipse(g, x, y, rx, ry, rot);
  if (o.pupil === 'bead') {
    paint(g, domeFill(g, x, y, rx, col, 0.5), INK, o.lw ?? 1.3);
  } else {
    const gr = g.createRadialGradient(x - rx * 0.3, y - ry * 0.3, 0, x, y, Math.max(rx, ry));
    gr.addColorStop(0, shade(col, 0.45));
    gr.addColorStop(0.7, col);
    gr.addColorStop(1, shade(col, -0.35));
    paint(g, gr, INK, o.lw ?? 1.3);
    const p = o.pupil ?? 'round', pr = o.pr ?? 0.45;
    g.fillStyle = o.pcol ?? '#120c0a';
    if (p === 'round') { circle(g, x, y, Math.min(rx, ry) * pr * 1.4); g.fill(); }
    else if (p === 'small') { circle(g, x, y, Math.min(rx, ry) * pr); g.fill(); }
    else if (p === 'slit') { ellipse(g, x, y, rx * 0.2 * (pr / 0.45), ry * 0.92, rot); g.fill(); }
    else if (p === 'goat') { ellipse(g, x, y, rx * 0.7, ry * 0.26, rot); g.fill(); }
  }
  // brow / lid: covers the top of the eye with a slanted line (angry when brow > 0)
  if (o.brow !== undefined && o.s) {
    const s = o.s, b = o.brow;
    g.save();
    ellipse(g, x, y, rx + 0.2, ry + 0.2, rot);
    g.clip();
    const ox = x + s * rx * 1.4, ix = x - s * rx * 1.4;
    const oy = y - ry * 1.05 + (b < 0 ? -b * ry * 1.2 : 0), iy = y - ry * 1.05 + (b > 0 ? b * ry * 1.6 : 0);
    poly(g, [[ox, oy], [ix, iy], [ix, y - ry * 3], [ox, y - ry * 3]]);
    g.fillStyle = o.lid ?? '#3a2a22';
    g.fill();
    g.restore();
    g.beginPath(); g.moveTo(x + s * rx * 1.25, oy + (b < 0 ? 0 : 0.5)); g.lineTo(x - s * rx * 1.25, iy);
    g.strokeStyle = INK; g.lineWidth = (o.lw ?? 1.3) * 1.3; g.lineCap = 'round'; g.stroke();
  }
  if (o.pupil !== 'none') {
    circle(g, x - rx * 0.35, y - ry * 0.35, Math.max(0.6, Math.min(rx, ry) * 0.28));
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.fill();
  }
}
function eyes(g: G, cx: number, y: number, dx: number, rx: number, ry: number, col: string, o: EyeOpt = {}) {
  mir((s) => eye(g, cx + s * dx, y, rx, ry, col, { ...o, rot: (o.rot ?? 0) * s, s }));
}

/** A tapered horn along a quadratic curve from base (width w) to a point. */
function horn(g: G, p0: Pt, c1: Pt, p1: Pt, w: number, col: string, ridges = 0, lw = 1.8, tip = 0.06) {
  const N = 9, L: number[][] = [], R: number[][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    const x = u * u * p0[0] + 2 * u * t * c1[0] + t * t * p1[0];
    const y = u * u * p0[1] + 2 * u * t * c1[1] + t * t * p1[1];
    let dx = 2 * u * (c1[0] - p0[0]) + 2 * t * (p1[0] - c1[0]);
    let dy = 2 * u * (c1[1] - p0[1]) + 2 * t * (p1[1] - c1[1]);
    const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const ww = (w / 2) * (tip + (1 - tip) * Math.pow(1 - t, 0.85));
    L.push([x - dy * ww, y + dx * ww]); R.push([x + dy * ww, y - dx * ww]);
  }
  poly(g, [...L, ...R.reverse()]);
  const gr = g.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
  gr.addColorStop(0, shade(col, -0.35)); gr.addColorStop(0.5, col); gr.addColorStop(1, shade(col, 0.3));
  paint(g, gr, INK, lw);
  if (ridges) {
    R.reverse();
    g.strokeStyle = alpha(shade(col, -0.6), 0.75); g.lineWidth = 0.9;
    for (let k = 1; k <= ridges; k++) {
      const i = Math.round((k / (ridges + 1)) * N * 0.85);
      g.beginPath(); g.moveTo(L[i][0], L[i][1]); g.lineTo(R[i][0], R[i][1]); g.stroke();
    }
  }
}
/** Horn defined relative to its base, scaled by k (age). */
function hornK(g: G, p0: Pt, c1: Pt, p1: Pt, k: number, w: number, col: string, ridges = 0, lw = 1.8) {
  const sc = (p: Pt) => [p0[0] + (p[0] - p0[0]) * k, p0[1] + (p[1] - p0[1]) * k];
  horn(g, p0, sc(c1), sc(p1), w * (0.55 + 0.45 * k), col, ridges, lw);
}
/** A small spike (triangle) from base point outward. */
function spike(g: G, x: number, y: number, ang: number, len: number, w: number, col: string, lw = 1.4) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  poly(g, [[x - sa * w / 2, y + ca * w / 2], [x + ca * len, y + sa * len], [x + sa * w / 2, y - ca * w / 2]]);
  paint(g, mix(col, '#ffffff', 0.08), INK, lw);
}
function fang(g: G, x: number, y: number, len: number, w: number, col = '#f3ead2', dir = 1, lw = 1) {
  poly(g, [[x - w / 2, y], [x + w / 2, y], [x + w * 0.1, y + len * dir]]);
  paint(g, col, INK, lw);
}
function nostrils(g: G, cx: number, y: number, dx: number, rx: number, ry: number, rot = 0.5, col = '#1a1010') {
  mir((s) => { ellipse(g, cx + s * dx, y, rx, ry, rot * s); g.fillStyle = col; g.fill(); });
}
/** Short strokes for fur, scales or feathers over a region. */
function strokes(g: G, r: Rand, x: number, y: number, w: number, h: number, col: string, n: number, len = 4, lw = 1) {
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const px = x + r() * w, py = y + r() * h;
    g.moveTo(px, py); g.lineTo(px + (px < 50 ? -len * 0.6 : len * 0.6), py + len);
  }
  g.stroke();
}
function scaleTex(g: G, r: Rand, x: number, y: number, w: number, h: number, col: string, n: number, sz = 2.6, lw = 0.9) {
  g.strokeStyle = col; g.lineWidth = lw;
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const px = x + r() * w, py = y + r() * h;
    g.moveTo(px + sz * Math.cos(0.15 * Math.PI), py + sz * Math.sin(0.15 * Math.PI));
    g.arc(px, py, sz, 0.15 * Math.PI, 0.85 * Math.PI);
  }
  g.stroke();
}
/** Inner ink stroke helper. */
function stroke(g: G, pts: number[][], col = INK, lw = 1.4, close = false) {
  poly(g, pts, close);
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
}
function curve(g: G, p0: Pt, c: Pt, p1: Pt, col = INK, lw = 1.4) {
  g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(c[0], c[1], p1[0], p1[1]);
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.stroke();
}
/** A spiky, lumpy ring (mane, ruff, feathers). */
function spiky(g: G, cx: number, cy: number, rIn: number, rOut: number, n: number, col: string, r: Rand, a0 = 0, a1 = Math.PI * 2, lw = LW, k = 0.3) {
  const pts: number[][] = [];
  const full = Math.abs(a1 - a0) >= Math.PI * 2 - 0.01;
  const steps = full ? n * 2 : n * 2 + 1;
  for (let i = 0; i < steps; i++) {
    const a = a0 + ((a1 - a0) * i) / (full ? steps : steps - 1);
    const rad = i % 2 ? rOut * (0.88 + r() * 0.22) : rIn * (0.95 + r() * 0.1);
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  if (!full) pts.push([cx, cy]);
  poly(g, pts);
  paint(g, domeFill(g, cx, cy, rOut, col, k), INK, lw);
}
function scar(g: G, x1: number, y1: number, x2: number, y2: number) {
  stroke(g, [[x1, y1], [x2, y2]], '#6b1f1f', 2.4);
  stroke(g, [[x1, y1], [x2, y2]], '#e8b5a5', 0.9);
  const mxp = (x1 + x2) / 2, myp = (y1 + y2) / 2;
  stroke(g, [[mxp - 2, myp - 3], [mxp + 2, myp + 3]], '#6b1f1f', 1);
}
function drip(g: G, x: number, y: number, len: number, col: string) {
  blob(g, [[x - 1.2, y], [x + 1.2, y], [x + 2.2, y + len], [x, y + len + 2.6], [x - 2.2, y + len]]);
  paint(g, col, shade(col, -0.5), 0.8);
}
function puff(g: G, x: number, y: number, rad: number, col: string, a = 0.75) {
  for (const [dx, dy, k] of [[0, 0, 1], [rad * 0.7, -rad * 0.5, 0.75], [-rad * 0.6, -rad * 0.4, 0.7]] as const) {
    circle(g, x + dx, y + dy, rad * k);
    g.fillStyle = alpha(col, a); g.fill();
  }
}
function zig(g: G, pts: number[][], col: string) {
  stroke(g, pts, alpha(col, 0.45), 4);
  stroke(g, pts, '#ffffff', 1.2);
}

// ===================================================================================================
// Dragons
// ===================================================================================================
interface DGeo { top: number; bw: number; eyeY: number; eyeDX: number; cw: number; cheekY: number; jw: number; jawY: number; chinY: number; sw: number; noseY: number; }
interface DHooks {
  back?: (k: number) => void; front?: (k: number) => void; afterHead?: (k: number) => void; breath?: () => void;
  smile?: boolean; plate?: boolean; sockets?: boolean; ears?: boolean;
}

function dragonHead(g: G, c: Colors, age: number, f: Flags, r: Rand, geo: DGeo, h: DHooks) {
  const k = [0.5, 0.75, 1, 1.2][age];
  const { top, bw, eyeY, eyeDX, cw, cheekY, jw, jawY, chinY, sw, noseY } = geo;
  const sc = c.scale, dark = shade(sc, -0.35);
  // wings behind (adult and older), young get stubby ones
  if (age >= 1) {
    mir((s) => {
      const L = age >= 2 ? 1 : 0.75;
      const P = (x: number, y: number) => [50 + s * (x - 50), y];
      const pts = [P(70, 70), P(84 - 4 * L, 40), P(96, 8 + (1 - L) * 20), P(102, 30), P(108, 52), P(98, 60), P(102, 74), P(90, 74)];
      poly(g, pts);
      paint(g, domeFill(g, 50 + s * 40, 40, 40, c.wing, 0.3), INK, 1.8);
      g.strokeStyle = alpha(shade(c.wing, 0.45), 0.9); g.lineWidth = 1.8;
      g.beginPath();
      const wr = P(96, 8 + (1 - L) * 20);
      for (const q of [P(102, 30), P(108, 52), P(102, 74)]) { g.moveTo(wr[0], wr[1]); g.lineTo(q[0], q[1]); }
      g.stroke();
      spike(g, wr[0], wr[1], -Math.PI / 2 - s * 0.4, 7, 4, c.horn);
    });
  }
  // neck
  bust(g, sc, 62, 36);
  for (let i = 0; i < 3; i++) {
    const y = 88 + i * 7, wv = 12 + i;
    ellipse(g, 50, y, wv, 3.6);
    paint(g, domeFill(g, 48, y - 1, wv, c.belly, 0.3), alpha(INK, 0.8), 1.1);
  }
  g.save();
  g.translate(0, -5);
  h.back?.(k);
  // ear frills
  if (h.ears) {
    mir((s) => {
      const P = (x: number, y: number) => [50 + s * (x - 50), y];
      poly(g, [P(68, 36), P(90, 16), P(88, 30), P(96, 34), P(88, 44), P(92, 52), P(72, 50)]);
      paint(g, domeFill(g, 50 + s * 34, 36, 20, c.wing, 0.3), INK, 1.6);
      stroke(g, [P(70, 42), P(90, 18)], alpha(shade(c.wing, -0.6), 0.8), 1.1);
      stroke(g, [P(70, 44), P(94, 35)], alpha(shade(c.wing, -0.6), 0.8), 1.1);
      stroke(g, [P(71, 46), P(90, 51)], alpha(shade(c.wing, -0.6), 0.8), 1.1);
    });
  }
  // skull
  shape(g, [[50, top], [50 + bw * 0.7, top + 1], [50 + bw, top + 8], [50 + cw, cheekY - 4], [50 + cw - 2, cheekY + 6], [50 + jw, jawY], [50 + jw * 0.5, chinY - 2], [50, chinY], [50 - jw * 0.5, chinY - 2], [50 - jw, jawY], [50 - cw + 2, cheekY + 6], [50 - cw, cheekY - 4], [50 - bw, top + 8], [50 - bw * 0.7, top + 1]], sc, 46, top + 22, cw + 6);
  // lower jaw (darker)
  blob(g, [[50 - jw - 1, jawY - 10], [50 + jw + 1, jawY - 10], [50 + jw * 0.9, jawY + 2], [50 + jw * 0.5, chinY - 1], [50, chinY + 0.5], [50 - jw * 0.5, chinY - 1], [50 - jw * 0.9, jawY + 2]]);
  paint(g, domeFill(g, 48, jawY, jw, mix(dark, c.belly, 0.25), 0.25), INK, 1.6);
  // chin plates
  g.strokeStyle = alpha(INK, 0.5); g.lineWidth = 1;
  g.beginPath(); g.moveTo(50 - jw * 0.45, chinY - 6); g.quadraticCurveTo(50, chinY - 3, 50 + jw * 0.45, chinY - 6); g.stroke();
  // scale texture on skull
  scaleTex(g, r, 50 - cw + 4, top + 8, (cw - 4) * 2, cheekY - top, alpha(shade(sc, -0.5), 0.55), 14, 2.6);
  if (h.plate) {
    shape(g, [[50, top + 3], [50 + bw * 0.6, top + 6], [50 + 10, eyeY - 2], [50 + 8, eyeY + 8], [50, eyeY + 10], [50 - 8, eyeY + 8], [50 - 10, eyeY - 2], [50 - bw * 0.6, top + 6]], c.belly, 46, top + 10, 20, 1.4);
  }
  if (h.sockets) {
    mir((s) => { ellipse(g, 50 + s * eyeDX, eyeY + 1, 9.5, 7.5, s * 0.3); g.fillStyle = alpha('#060606', 0.8); g.fill(); });
  }
  // mouth line, teeth along it
  mir((s) => {
    g.beginPath();
    g.moveTo(50 + s * sw * 0.9, noseY + 3);
    g.quadraticCurveTo(50 + s * (jw - 2), noseY + (h.smile ? -2 : 4), 50 + s * (jw + 2), jawY - (h.smile ? 14 : 8));
    g.strokeStyle = '#2a0e0a'; g.lineWidth = 3.2; g.lineCap = 'round'; g.stroke();
    for (let i = 0; i < 3; i++) {
      const t = 0.25 + i * 0.25;
      const x = 50 + s * (sw * 0.9 + (jw - sw * 0.9) * t), y = noseY + 3 + ((h.smile ? -4 : 0) * t);
      fang(g, x, y - 0.5, 3.4, 2.2, '#efe6cc', 1, 0.7);
    }
  });
  // snout bridge
  const sw0 = Math.max(6, bw * 0.38);
  shape(g, [[50 - sw0, eyeY - 6], [50 + sw0, eyeY - 6], [50 + sw - 1, noseY - 10], [50 + sw + 1.5, noseY - 1], [50 + sw * 0.55, noseY + 5], [50 - sw * 0.55, noseY + 5], [50 - sw - 1.5, noseY - 1], [50 - sw + 1, noseY - 10]], shade(sc, 0.08), 46, eyeY + 4, sw + 14, 1.8);
  // bridge plates
  g.strokeStyle = alpha(shade(sc, -0.55), 0.7); g.lineWidth = 1;
  g.beginPath();
  for (let i = 0; i < 3; i++) { const y = eyeY + 4 + i * ((noseY - eyeY - 10) / 3); const wv = sw0 + (sw - sw0) * (i / 3) - 2; g.moveTo(50 - wv * 0.6, y); g.quadraticCurveTo(50, y + 2.2, 50 + wv * 0.6, y); }
  g.stroke();
  nostrils(g, 50, noseY, sw * 0.5, 2.6, 1.5, 0.6);
  // upper fangs
  mir((s) => fang(g, 50 + s * sw * 0.7, noseY + 3.5, 6 + age * 0.6, 3, '#f6eedb', 1, 0.9));
  h.afterHead?.(k);
  // eyes and brows
  const er = [1.35, 1.15, 1, 0.95][age];
  eyes(g, 50, eyeY, eyeDX, 5.6 * er, 3.6 * er, c.eye, { rot: 0.32, pupil: 'slit', brow: age === 0 ? 0.2 : 0.55, lid: shade(sc, -0.15), glow: age === 3 });
  mir((s) => {
    g.beginPath();
    g.moveTo(50 + s * (eyeDX + 9 * er), eyeY - 6 * er);
    g.quadraticCurveTo(50 + s * eyeDX, eyeY - 9 * er, 50 + s * (eyeDX - 9 * er), eyeY - 2);
    g.strokeStyle = shade(sc, -0.5); g.lineWidth = 2.4; g.stroke();
  });
  h.front?.(k);
  // ancient: crown of small brow spikes; young+: cheek spikes
  if (age >= 1) {
    mir((s) => { for (let i = 0; i < (age >= 2 ? 3 : 2); i++) spike(g, 50 + s * (cw - 1 - i * 2), cheekY + 2 + i * 7, s > 0 ? 0.25 + i * 0.25 : Math.PI - 0.25 - i * 0.25, 5 + age * 1.5 - i, 4, c.horn, 1.1); });
  }
  if (age === 3) {
    for (let i = -2; i <= 2; i++) spike(g, 50 + i * 6, top + 3 + Math.abs(i) * 1.5, -Math.PI / 2 + i * 0.22, 7 - Math.abs(i), 4, c.horn, 1.1);
  }
  if (age === 3 || f.scar) {
    scar(g, 50 + eyeDX - 8, eyeY - 12, 50 + eyeDX + 5, eyeY + 12);
    if (age === 3 && f.scar) scar(g, 50 - cw + 8, cheekY, 50 - cw + 16, cheekY + 12);
  }
  h.breath?.();
  g.restore();
}

interface DragonKind {
  key: string; name: string; cr: [string, string, string, string]; c: Colors; dusk: Colors; tags: string[];
  draw: (g: G, c: Colors, age: number, f: Flags, r: Rand) => void;
}
const AGES: { key: string; name: string; size: CreatureSize }[] = [
  { key: 'wyrmling', name: 'Wyrmling', size: 'Medium' },
  { key: 'young', name: 'Young', size: 'Large' },
  { key: 'adult', name: 'Adult', size: 'Huge' },
  { key: 'ancient', name: 'Ancient', size: 'Gargantuan' },
];
const dragonDefs = (k: DragonKind): CreatureDef[] =>
  AGES.map((a, i) => ({
    id: `dragon-${k.key}-${a.key}`,
    name: `${a.name} ${k.name} Dragon`,
    family: 'dragon' as const,
    size: a.size,
    cr: k.cr[i],
    tags: ['dragon', k.key, a.key, ...k.tags],
    c: k.c,
    variants: [{ name: 'Classic', c: {} }, { name: 'Dusk scales', c: k.dusk }, { name: 'Battle-scarred', c: {}, f: { scar: 1 } }],
    draw: ({ g, c, f, seed }) => k.draw(g, c, i, f, rng(seed)),
  }));

const RED: DragonKind = {
  key: 'red', name: 'Red', cr: ['4', '10', '17', '24'], tags: ['chromatic', 'fire', 'volcano', 'mountain'],
  c: { scale: '#b3261e', belly: '#e8a23a', horn: '#eadfc4', eye: '#ffd23f', wing: '#7e1b16' },
  dusk: { scale: '#7a1a1a', belly: '#c4782a', wing: '#4e1010' },
  draw: (g, c, age, f, r) => dragonHead(g, c, age, f, r,
    { top: 24, bw: 25, eyeY: 44, eyeDX: 15, cw: 32, cheekY: 54, jw: 24, jawY: 76, chinY: 90, sw: 12, noseY: 78 }, {
      back: (k) => mir((s) => {
        hornK(g, [50 + s * 18, 30], [50 + s * 44, 34], [50 + s * 40, 8], k, 13, c.horn, 4, 1.8);
        if (age >= 2) hornK(g, [50 + s * 24, 40], [50 + s * 36, 44], [50 + s * 46, 40], k, 6, c.horn, 2, 1.3);
      }),
      breath: () => {
        if (age === 0) return;
        glow(g, 50, 90, 12 + age * 3, '#ff9a2e', 0.6);
        g.fillStyle = '#ffd36a';
        for (let i = 0; i < 2 + age * 2; i++) { circle(g, 30 + r() * 40, 84 + r() * 12, 0.8 + r() * 0.8); g.fill(); }
      },
    }),
};
const BLUE: DragonKind = {
  key: 'blue', name: 'Blue', cr: ['3', '9', '16', '23'], tags: ['chromatic', 'lightning', 'desert'],
  c: { scale: '#2b6fd6', belly: '#a6d3ff', horn: '#e8ecf4', eye: '#fff3a3', wing: '#1c4590' },
  dusk: { scale: '#1d4a94', belly: '#7aaed8', wing: '#122e60' },
  draw: (g, c, age, f, r) => dragonHead(g, c, age, f, r,
    { top: 22, bw: 20, eyeY: 46, eyeDX: 14, cw: 27, cheekY: 56, jw: 19, jawY: 78, chinY: 93, sw: 11, noseY: 81 }, {
      ears: true,
      back: (k) => mir((s) => hornK(g, [50 + s * 12, 26], [50 + s * 20, 10], [50 + s * 30, 2], k, 6, c.horn, 0, 1.4)),
      front: (k) => {
        // the great nose horn
        horn(g, [50, 70], [50, 50], [50, 70 - 46 * k], 13 * (0.6 + 0.4 * k), c.horn, 4, 1.8, 0.04);
      },
      breath: () => {
        if (age === 0) return;
        zig(g, [[30, 78], [24, 84], [28, 86], [20, 94]], '#7fd3ff');
        zig(g, [[70, 78], [77, 83], [73, 87], [82, 95]], '#7fd3ff');
      },
    }),
};
const GREEN: DragonKind = {
  key: 'green', name: 'Green', cr: ['2', '8', '15', '22'], tags: ['chromatic', 'poison', 'forest', 'swamp'],
  c: { scale: '#2f8a3e', belly: '#c9d46a', horn: '#d9e3b0', eye: '#f7e35a', wing: '#1f5e2a' },
  dusk: { scale: '#1f5a2a', belly: '#9aa84a', wing: '#143c1c' },
  draw: (g, c, age, f, r) => dragonHead(g, c, age, f, r,
    { top: 26, bw: 19, eyeY: 47, eyeDX: 13.5, cw: 26, cheekY: 57, jw: 18, jawY: 80, chinY: 94, sw: 10, noseY: 83 }, {
      back: (k) => {
        // crest sail with spines along the top of the head
        const n = 5, base = [50, 40];
        const pts: number[][] = [[50 - 14, 32]];
        for (let i = 0; i < n; i++) {
          const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.32, len = (26 + (i === 2 ? 8 : 0)) * k + 10;
          pts.push([base[0] + Math.cos(a) * len, base[1] + Math.sin(a) * len]);
          if (i < n - 1) { const a2 = a + 0.16; pts.push([base[0] + Math.cos(a2) * len * 0.7, base[1] + Math.sin(a2) * len * 0.7]); }
        }
        pts.push([50 + 14, 32]);
        poly(g, pts);
        paint(g, domeFill(g, 50, 20, 26, c.wing, 0.3), INK, 1.8);
        g.strokeStyle = alpha(c.horn, 0.8); g.lineWidth = 1.2; g.beginPath();
        for (let i = 1; i < pts.length - 1; i += 2) { g.moveTo(50, 36); g.lineTo(pts[i][0], pts[i][1]); }
        g.stroke();
        mir((s) => hornK(g, [50 + s * 15, 32], [50 + s * 30, 26], [50 + s * 34, 10], k, 6, c.horn, 2, 1.4));
      },
      front: (k) => {
        // spiky chin beard
        for (let i = -2; i <= 2; i++) spike(g, 50 + i * 5, 91 - Math.abs(i) * 2, Math.PI / 2 + i * 0.2, (6 + 6 * k) - Math.abs(i), 4, c.horn, 1.1);
      },
      breath: () => {
        if (age === 0) return;
        for (const [x, y, rr] of [[24, 86, 6], [76, 88, 7], [34, 96, 5], [68, 98, 6]]) puff(g, x, y, rr * (0.6 + age * 0.15), '#9be06a', 0.42);
      },
    }),
};
const BLACK: DragonKind = {
  key: 'black', name: 'Black', cr: ['2', '7', '14', '21'], tags: ['chromatic', 'acid', 'swamp', 'ruins'],
  c: { scale: '#2a292e', belly: '#6e6a5b', horn: '#ddd3b3', eye: '#b8f03c', wing: '#1a191d' },
  dusk: { scale: '#3a3442', belly: '#5d5a6e', wing: '#241f2a' },
  draw: (g, c, age, f, r) => dragonHead(g, c, age, f, r,
    { top: 24, bw: 22, eyeY: 42, eyeDX: 14, cw: 24, cheekY: 52, jw: 16, jawY: 76, chinY: 91, sw: 9.5, noseY: 81 }, {
      plate: true, sockets: true,
      back: (k) => mir((s) => {
        // horns sweep out, then forward and down past the cheeks
        hornK(g, [50 + s * 17, 28], [50 + s * 48, 14], [50 + s * 40, 62], k, 11, c.horn, 4, 1.8);
      }),
      breath: () => {
        drip(g, 50 - 7, 89, 4 + age * 1.5, '#b8f03c');
        if (age >= 1) drip(g, 50 + 13, 86, 3 + age, '#b8f03c');
        if (age >= 2) drip(g, 50 - 15, 84, 2 + age, '#b8f03c');
      },
    }),
};
const WHITE: DragonKind = {
  key: 'white', name: 'White', cr: ['2', '6', '13', '20'], tags: ['chromatic', 'cold', 'ice', 'winter', 'arctic'],
  c: { scale: '#e6eef4', belly: '#b6d0e2', horn: '#8ea9c0', eye: '#45b8f0', wing: '#a9c3d8' },
  dusk: { scale: '#b9c9d6', belly: '#8aa4ba', wing: '#7e97ad' },
  draw: (g, c, age, f, r) => dragonHead(g, c, age, f, r,
    { top: 27, bw: 26, eyeY: 47, eyeDX: 15, cw: 30, cheekY: 57, jw: 24, jawY: 77, chinY: 88, sw: 14, noseY: 76 }, {
      back: (k) => {
        // fan crown of ice spines behind the head
        for (let i = 0; i < 7; i++) {
          const a = -Math.PI + 0.35 + i * ((Math.PI - 0.7) / 6), len = (18 + (i % 2 ? 0 : 6)) * k + 18;
          horn(g, [50 + Math.cos(a) * 14, 46 + Math.sin(a) * 14], [50 + Math.cos(a) * (len * 0.6), 46 + Math.sin(a) * (len * 0.6)], [50 + Math.cos(a) * len, 46 + Math.sin(a) * len], 8, c.horn, 0, 1.4);
        }
      },
      breath: () => {
        if (age === 0) return;
        glow(g, 50, 92, 16, '#9ee7ff', 0.55);
        mir((s) => puff(g, 50 + s * 16, 96, 3 + age * 1.3, '#e8f8ff', 0.7));
      },
    }),
};
const GOLD: DragonKind = {
  key: 'gold', name: 'Gold', cr: ['3', '10', '17', '24'], tags: ['metallic', 'fire', 'noble', 'good'],
  c: { scale: '#e0a92a', belly: '#fff0b3', horn: '#fff3d0', eye: '#ff7a1a', wing: '#b37d14' },
  dusk: { scale: '#b8831c', belly: '#e6cf80', wing: '#7e5a10' },
  draw: (g, c, age, f, r) => dragonHead(g, c, age, f, r,
    { top: 24, bw: 24, eyeY: 44, eyeDX: 15, cw: 28, cheekY: 54, jw: 22, jawY: 78, chinY: 90, sw: 13, noseY: 78 }, {
      back: (k) => mir((s) => {
        hornK(g, [50 + s * 14, 28], [50 + s * 26, 4], [50 + s * 44, 0], k, 9, c.horn, 0, 1.6);
        // tendril frill on the cheeks
        for (let i = 0; i < 2; i++) horn(g, [50 + s * 24, 50 + i * 9], [50 + s * (38 + i * 3), 52 + i * 10], [50 + s * (40 + i * 4), 64 + i * 13], 5.5, c.scale, 0, 1.3);
      }),
      front: (k) => mir((s) => {
        // long whisker barbels from the nose
        horn(g, [50 + s * 11, 76], [50 + s * 30, 78], [50 + s * (32 + 6 * k), 98], 4.4, c.horn, 0, 1.3);
      }),
      afterHead: () => { circle(g, 50, 34, 3.4); paint(g, domeFill(g, 50, 34, 3.4, '#ff9a3a', 0.5), INK, 1); },
    }),
};
const SILVER: DragonKind = {
  key: 'silver', name: 'Silver', cr: ['2', '9', '16', '23'], tags: ['metallic', 'cold', 'mountain', 'good'],
  c: { scale: '#c4cbd3', belly: '#eef3f7', horn: '#f2f5f8', eye: '#3a6fd8', wing: '#8b96a3' },
  dusk: { scale: '#9aa3ad', belly: '#cfd8df', wing: '#6c7682' },
  draw: (g, c, age, f, r) => dragonHead(g, c, age, f, r,
    { top: 26, bw: 23, eyeY: 46, eyeDX: 14.5, cw: 27, cheekY: 56, jw: 21, jawY: 78, chinY: 89, sw: 12, noseY: 78 }, {
      back: (k) => {
        // smooth shield frill behind the head
        const R = 24 + 16 * k;
        g.beginPath();
        g.moveTo(50 - R, 52);
        g.arc(50, 44, R, Math.PI * 1.05, Math.PI * 1.95);
        g.lineTo(50 + R, 52);
        g.closePath();
        paint(g, domeFill(g, 44, 26, R, c.wing, 0.35), INK, 1.8);
        g.strokeStyle = alpha(shade(c.wing, -0.5), 0.7); g.lineWidth = 1.1; g.beginPath();
        for (let i = 0; i < 7; i++) { const a = Math.PI * (1.12 + i * 0.12); g.moveTo(50, 44); g.lineTo(50 + Math.cos(a) * R, 44 + Math.sin(a) * R); }
        g.stroke();
        mir((s) => hornK(g, [50 + s * 14, 30], [50 + s * 22, 14], [50 + s * 30, 6], k, 6, c.horn, 0, 1.4));
      },
      front: (k) => {
        // flowing chin frill
        blob(g, [[42, 86], [58, 86], [56, 92 + 4 * k], [50, 98 + 6 * k], [44, 92 + 4 * k]]);
        paint(g, domeFill(g, 48, 90, 10, c.wing, 0.3), INK, 1.3);
      },
      breath: () => { if (age >= 1) glow(g, 50, 94, 12 + age * 2, '#d8f4ff', 0.5); },
    }),
};
const BRONZE: DragonKind = {
  key: 'bronze', name: 'Bronze', cr: ['2', '8', '15', '22'], tags: ['metallic', 'lightning', 'coast', 'sea', 'good'],
  c: { scale: '#a8642b', belly: '#e3b16b', horn: '#f0d9a8', eye: '#2ec4b6', wing: '#3f8f88' },
  dusk: { scale: '#7c4a22', belly: '#c08f52', wing: '#2c6a64' },
  draw: (g, c, age, f, r) => dragonHead(g, c, age, f, r,
    { top: 24, bw: 23, eyeY: 45, eyeDX: 14.5, cw: 27, cheekY: 55, jw: 20, jawY: 78, chinY: 91, sw: 12, noseY: 80 }, {
      back: (k) => mir((s) => {
        // webbed cheek fins
        const P = (x: number, y: number) => [50 + s * (x - 50), y];
        poly(g, [P(72, 48), P(96, 40), P(92, 52), P(100, 60), P(90, 66), P(94, 76), P(70, 70)]);
        paint(g, domeFill(g, 50 + s * 36, 58, 18, c.wing, 0.3), INK, 1.6);
        g.strokeStyle = alpha(c.horn, 0.75); g.lineWidth = 1.1; g.beginPath();
        for (const q of [P(96, 40), P(100, 60), P(94, 76)]) { g.moveTo(50 + s * 22, 58); g.lineTo(q[0], q[1]); }
        g.stroke();
        // ribbed crest of three horns swept back
        for (let i = 0; i < 3; i++) hornK(g, [50 + s * (8 + i * 6), 28 + i * 2], [50 + s * (12 + i * 9), 10 + i * 4], [50 + s * (14 + i * 12), 0 + i * 6], k, 7 - i, c.horn, i ? 0 : 2, 1.4);
      }),
      breath: () => { if (age >= 1) { zig(g, [[33, 80], [27, 86], [30, 88], [24, 94]], '#fff58a'); } },
    }),
};
const COPPER: DragonKind = {
  key: 'copper', name: 'Copper', cr: ['1', '7', '14', '21'], tags: ['metallic', 'acid', 'hills', 'trickster', 'good'],
  c: { scale: '#c4683a', belly: '#f0b67f', horn: '#f2dcc0', eye: '#4ad66d', wing: '#8a3f1f' },
  dusk: { scale: '#94492a', belly: '#c88d5c', wing: '#5f2a14' },
  draw: (g, c, age, f, r) => dragonHead(g, c, age, f, r,
    { top: 25, bw: 26, eyeY: 46, eyeDX: 15, cw: 29, cheekY: 56, jw: 22, jawY: 76, chinY: 89, sw: 12.5, noseY: 77 }, {
      smile: true, plate: true,
      back: (k) => mir((s) => {
        // segmented horns sweeping out sideways, stacked in two tiers
        hornK(g, [50 + s * 18, 30], [50 + s * 40, 26], [50 + s * 50, 34], k, 10, c.horn, 5, 1.6);
        hornK(g, [50 + s * 20, 36], [50 + s * 38, 40], [50 + s * 46, 50], k, 8, c.horn, 4, 1.4);
      }),
    }),
};
const BRASS: DragonKind = {
  key: 'brass', name: 'Brass', cr: ['1', '6', '13', '20'], tags: ['metallic', 'fire', 'desert', 'good'],
  c: { scale: '#d6b25e', belly: '#f4e3a8', horn: '#f6edc8', eye: '#c0392b', wing: '#a5803a' },
  dusk: { scale: '#b08c44', belly: '#d8c27e', wing: '#7e5f26' },
  draw: (g, c, age, f, r) => dragonHead(g, c, age, f, r,
    { top: 26, bw: 21, eyeY: 47, eyeDX: 13.5, cw: 25, cheekY: 57, jw: 18, jawY: 80, chinY: 93, sw: 10, noseY: 82 }, {
      back: (k) => {
        // the great blade-shaped head plate
        const t = 30 - 26 * k;
        poly(g, [[50 - 18, 36], [50 - 38, 26 + t * 0.4], [50 - 28, 16 + t * 0.6], [50, 2 + t], [50 + 28, 16 + t * 0.6], [50 + 38, 26 + t * 0.4], [50 + 18, 36]]);
        paint(g, domeFill(g, 44, 14, 36, c.wing, 0.35), INK, 1.8);
        g.strokeStyle = alpha(shade(c.wing, -0.55), 0.8); g.lineWidth = 1.1; g.beginPath();
        g.moveTo(50, 34); g.lineTo(50, 6 + t);
        mir((s) => { g.moveTo(50 + s * 10, 34); g.lineTo(50 + s * 26, 18 + t * 0.6); });
        g.stroke();
      },
      front: () => mir((s) => spike(g, 50 + s * 18, 82, Math.PI / 2 + s * 0.5, 8, 5, c.horn, 1.1)),
      breath: () => { if (age >= 1) glow(g, 50, 92, 14, '#ffb347', 0.4); },
    }),
};

// Other dragons -------------------------------------------------------------------------------------
function drawWyvern(g: G, c: Colors, f: Flags, r: Rand) {
  // big bat wings framing a narrow head, stinger arching overhead
  mir((s) => {
    const P = (x: number, y: number) => [50 + s * (x - 50), y];
    poly(g, [P(58, 60), P(74, 10), P(86, -2), P(96, 20), P(108, 40), P(100, 52), P(106, 70), P(80, 76)]);
    paint(g, domeFill(g, 50 + s * 34, 36, 40, c.wing, 0.25), INK, 1.8);
    g.strokeStyle = alpha(shade(c.wing, -0.55), 0.9); g.lineWidth = 1.5; g.beginPath();
    for (const q of [P(96, 20), P(108, 40), P(106, 70)]) { g.moveTo(P(86, -2)[0], -2); g.lineTo(q[0], q[1]); }
    g.stroke();
  });
  // tail stinger arching over the head
  horn(g, [72, 30], [70, -4], [44, 6], 9, c.scale, 0, 1.6);
  poly(g, [[46, 2], [36, 10], [44, 12]]); paint(g, '#e9e0c4', INK, 1.2);
  drip(g, 37, 12, 3, '#a6e05a');
  bust(g, c.scale, 66, 30);
  shape(g, [[50, 26], [62, 30], [66, 46], [60, 62], [56, 80], [50, 90], [44, 80], [40, 62], [34, 46], [38, 30]], c.scale, 46, 44, 30);
  scaleTex(g, r, 36, 30, 28, 30, alpha(shade(c.scale, -0.5), 0.5), 14, 2.2);
  mir((s) => hornK(g, [50 + s * 8, 30], [50 + s * 12, 16], [50 + s * 18, 10], 1, 5, c.horn, 0, 1.3));
  stroke(g, [[44, 84], [50, 88], [56, 84]], '#2a0e0a', 2.2);
  mir((s) => fang(g, 50 + s * 4, 85, 4, 2.2));
  nostrils(g, 50, 80, 3, 1.5, 1, 0.5);
  eyes(g, 50, 46, 9, 4, 2.8, c.eye, { rot: 0.35, pupil: 'slit', brow: 0.6, lid: shade(c.scale, -0.2) });
  if (f.scar) scar(g, 56, 36, 62, 58);
}
function drawDragonTurtle(g: G, c: Colors, f: Flags, r: Rand) {
  // domed spiked shell behind, wide beaked dragon head in front
  shape(g, [[2, 70], [8, 26], [30, 6], [70, 6], [92, 26], [98, 70]], c.shell, 46, 24, 54);
  g.strokeStyle = alpha(shade(c.shell, -0.55), 0.85); g.lineWidth = 1.5; g.beginPath();
  for (const [x, y] of [[28, 20], [50, 14], [72, 20], [14, 44], [86, 44]]) { g.moveTo(x + 8, y); g.arc(x, y, 8, 0, Math.PI * 2); }
  g.stroke();
  for (const [x, y] of [[28, 20], [50, 14], [72, 20], [14, 44], [86, 44]]) spike(g, x, y, -Math.PI / 2, 7, 6, c.horn, 1.2);
  bust(g, c.scale, 68, 36);
  shape(g, [[50, 30], [70, 34], [80, 50], [74, 70], [62, 84], [50, 88], [38, 84], [26, 70], [20, 50], [30, 34]], c.scale, 46, 48, 32);
  scaleTex(g, r, 26, 34, 48, 40, alpha(shade(c.scale, -0.45), 0.55), 18, 2.4);
  // beak
  poly(g, [[38, 62], [62, 62], [58, 78], [50, 88], [42, 78]]);
  paint(g, domeFill(g, 48, 70, 14, c.horn, 0.35), INK, 1.6);
  stroke(g, [[42, 76], [50, 80], [58, 76]], INK, 1.2);
  nostrils(g, 50, 66, 4, 1.6, 1.1, 0.4);
  // whisker frill
  mir((s) => horn(g, [50 + s * 24, 64], [50 + s * 34, 74], [50 + s * 30, 90], 5, c.frill, 0, 1.2));
  eyes(g, 50, 48, 13, 5, 3.6, c.eye, { rot: 0.25, pupil: 'slit', brow: 0.4, lid: shade(c.scale, -0.2) });
  mir((s) => hornK(g, [50 + s * 14, 36], [50 + s * 22, 26], [50 + s * 30, 24], 1, 6, c.horn, 2, 1.3));
  if (f.scar) scar(g, 30, 40, 40, 58);
}
function drawPseudodragon(g: G, c: Colors, f: Flags, r: Rand) {
  // tiny, big-eyed, bright little dragon with perky wing-ears
  mir((s) => {
    const P = (x: number, y: number) => [50 + s * (x - 50), y];
    poly(g, [P(62, 52), P(84, 14), P(96, 30), P(92, 44), P(100, 54), P(84, 66)]);
    paint(g, domeFill(g, 50 + s * 30, 40, 26, c.wing, 0.3), INK, 1.6);
    stroke(g, [P(66, 54), P(84, 14)], shade(c.wing, -0.5), 1.4);
  });
  bust(g, c.scale, 70, 26);
  shape(g, [[50, 22], [68, 28], [76, 46], [70, 64], [60, 76], [50, 80], [40, 76], [30, 64], [24, 46], [32, 28]], c.scale, 44, 40, 32);
  mir((s) => hornK(g, [50 + s * 10, 26], [50 + s * 14, 12], [50 + s * 22, 8], 1, 5, c.horn, 2, 1.2));
  shape(g, [[42, 56], [58, 56], [60, 70], [50, 77], [40, 70]], c.belly, 48, 62, 14, 1.4);
  nostrils(g, 50, 64, 3.2, 1.3, 0.9, 0.4);
  stroke(g, [[43, 72], [50, 74.5], [57, 72]], '#2a0e0a', 1.4);
  eyes(g, 50, 46, 12, 7, 6.2, c.eye, { pupil: 'slit', pr: 0.55 });
  // tail with stinger curling over the shoulder
  horn(g, [78, 84], [100, 60], [86, 44], 5, c.scale, 0, 1.2);
  spike(g, 86, 44, -Math.PI / 2 - 0.6, 6, 5, c.horn, 1);
  if (f.scar) scar(g, 60, 34, 66, 52);
}
function drawDrake(g: G, c: Colors, f: Flags, r: Rand) {
  // wingless, bull-necked, blunt-snouted folklore drake with a ridge of back plates
  for (let i = -2; i <= 2; i++) spike(g, 50 + i * 12, 20 + Math.abs(i) * 6, -Math.PI / 2 + i * 0.35, 18 - Math.abs(i) * 3, 12, c.horn, 1.4);
  bust(g, c.scale, 60, 46);
  scaleTex(g, r, 10, 70, 80, 30, alpha(shade(c.scale, -0.5), 0.5), 18, 3);
  shape(g, [[50, 24], [70, 28], [80, 46], [76, 64], [64, 82], [50, 86], [36, 82], [24, 64], [20, 46], [30, 28]], c.scale, 44, 44, 34);
  scaleTex(g, r, 26, 28, 48, 30, alpha(shade(c.scale, -0.5), 0.5), 16, 2.6);
  // blunt snout
  shape(g, [[38, 52], [62, 52], [66, 70], [58, 82], [42, 82], [34, 70]], shade(c.scale, 0.1), 46, 62, 20, 1.8);
  nostrils(g, 50, 70, 6, 2.6, 1.6, 0.5);
  stroke(g, [[38, 80], [50, 83], [62, 80]], '#2a0e0a', 2.4);
  mir((s) => { fang(g, 50 + s * 8, 81, 5, 3); horn(g, [50 + s * 20, 34], [50 + s * 30, 30], [50 + s * 34, 20], 6, c.horn, 2, 1.3); });
  eyes(g, 50, 44, 14, 5, 3.4, c.eye, { rot: 0.3, pupil: 'slit', brow: 0.6, lid: shade(c.scale, -0.2) });
  if (f.scar) scar(g, 28, 40, 40, 62);
  if (c.fire !== 'none') mir((s) => puff(g, 50 + s * 6, 66, 3, '#5d5550', 0.45));
}

const DRAGONS: CreatureDef[] = [
  ...[RED, BLUE, GREEN, BLACK, WHITE, GOLD, SILVER, BRONZE, COPPER, BRASS].flatMap(dragonDefs),
  {
    id: 'wyvern', name: 'Wyvern', family: 'dragon', size: 'Large', cr: '6', tags: ['dragon', 'wings', 'stinger', 'poison', 'mountain', 'flying'],
    c: { scale: '#5c6b3a', wing: '#41502a', horn: '#e2d7b5', eye: '#f2a531' },
    variants: [{ name: 'Moss', c: {} }, { name: 'Rust', c: { scale: '#8a4a2c', wing: '#5e2f1b' } }, { name: 'Ash', c: { scale: '#55565c', wing: '#38393f', eye: '#e84a3a' } }, { name: 'Scarred', c: {}, f: { scar: 1 } }],
    draw: ({ g, c, f, seed }) => drawWyvern(g, c, f, rng(seed)),
  },
  {
    id: 'dragon-turtle', name: 'Dragon Turtle', family: 'dragon', size: 'Gargantuan', cr: '17', tags: ['dragon', 'turtle', 'sea', 'water', 'ship', 'steam'],
    c: { scale: '#3f7f6e', shell: '#5b5236', horn: '#e6dcb4', eye: '#ffcf4a', frill: '#2d6b84' },
    variants: [{ name: 'Sea green', c: {} }, { name: 'Deep blue', c: { scale: '#2e5a86', shell: '#3d4a52', frill: '#1d3f5e' } }, { name: 'Coral', c: { scale: '#a8584a', shell: '#6b4a32', frill: '#d27a5a' } }],
    draw: ({ g, c, f, seed }) => drawDragonTurtle(g, c, f, rng(seed)),
  },
  {
    id: 'pseudodragon', name: 'Pseudodragon', family: 'dragon', size: 'Tiny', cr: '1/4', tags: ['dragon', 'familiar', 'tiny', 'cute', 'wizard'],
    c: { scale: '#c0563a', belly: '#f2b07a', wing: '#8a3424', horn: '#f3e6c6', eye: '#ffd84a' },
    variants: [{ name: 'Russet', c: {} }, { name: 'Teal', c: { scale: '#2f8f8a', belly: '#9fe0d4', wing: '#1e5e5a' } }, { name: 'Violet', c: { scale: '#7a4aa0', belly: '#d2b4ea', wing: '#4e2c6e' } }, { name: 'Gold', c: { scale: '#d4a23a', belly: '#fbe3a2', wing: '#9a6e1c', eye: '#5fd3ff' } }],
    draw: ({ g, c, f, seed }) => drawPseudodragon(g, c, f, rng(seed)),
  },
  {
    id: 'drake', name: 'Drake', family: 'dragon', size: 'Large', tags: ['dragon', 'drake', 'wingless', 'folklore', 'mount', 'cave'],
    c: { scale: '#6e7a3a', horn: '#d8cba0', eye: '#ffb02e', fire: 'yes' },
    variants: [{ name: 'Moss drake', c: {} }, { name: 'Fire drake', c: { scale: '#a33a22', eye: '#ffe066' } }, { name: 'Stone drake', c: { scale: '#77726a', eye: '#9ad1ff', fire: 'none' } }, { name: 'Marsh drake', c: { scale: '#3a5a50', eye: '#d6f25a', fire: 'none' } }, { name: 'Scarred', c: {}, f: { scar: 1 } }],
    draw: ({ g, c, f, seed }) => drawDrake(g, c, f, rng(seed)),
  },
];


// ===================================================================================================
// Beast parts
// ===================================================================================================
/** A face outline: top y, bottom y and half-widths at the top, middle and bottom. */
function face(g: G, top: number, bot: number, wt: number, wm: number, wb: number, col: string, midK = 0.45, k = 0.3, lw = LW) {
  const h = bot - top;
  shape(g, [[50, top], [50 + wt, top + h * 0.1], [50 + wm, top + h * midK], [50 + wb, bot - h * 0.12], [50, bot], [50 - wb, bot - h * 0.12], [50 - wm, top + h * midK], [50 - wt, top + h * 0.1]], col, 46, top + h * 0.4, Math.max(wm, h / 2) + 4, lw, k);
}
type EarKind = 'point' | 'round' | 'small' | 'long' | 'droop';
function ear1(g: G, kind: EarKind, x: number, y: number, sz: number, col: string, inner: string, s: number, tilt = 0) {
  if (kind === 'point') {
    poly(g, [[x - s * sz * 0.5, y + sz * 0.35], [x + s * sz * (0.2 + tilt), y - sz], [x + s * sz * 0.55, y + sz * 0.4]]);
    paint(g, domeFill(g, x, y, sz, col), INK, LW * 0.9);
    poly(g, [[x - s * sz * 0.22, y + sz * 0.25], [x + s * sz * (0.2 + tilt * 0.9), y - sz * 0.68], [x + s * sz * 0.3, y + sz * 0.3]]);
    paint(g, inner, null);
  } else if (kind === 'round' || kind === 'small') {
    const rr = kind === 'small' ? sz * 0.38 : sz * 0.55;
    circle(g, x, y, rr); paint(g, domeFill(g, x, y, rr, col), INK, LW * 0.9);
    circle(g, x + s * rr * 0.08, y + rr * 0.12, rr * 0.55); paint(g, inner, null);
  } else if (kind === 'long') {
    const rot = s * (0.35 + tilt);
    const cx = x + Math.sin(rot) * sz * 0.55, cy = y - Math.cos(rot) * sz * 0.55;
    ellipse(g, cx, cy, sz * 0.3, sz * 0.75, rot); paint(g, domeFill(g, cx, cy, sz * 0.75, col), INK, LW * 0.9);
    ellipse(g, cx, cy + sz * 0.05, sz * 0.15, sz * 0.52, rot); paint(g, inner, null);
  } else {
    ellipse(g, x + s * sz * 0.22, y + sz * 0.6, sz * 0.34, sz * 0.78, -s * (0.25 + tilt));
    paint(g, domeFill(g, x, y + sz * 0.4, sz, shade(col, -0.12)), INK, LW * 0.9);
  }
}
function ears(g: G, kind: EarKind, dx: number, y: number, sz: number, col: string, inner: string, tilt = 0) {
  mir((s) => ear1(g, kind, 50 + s * dx, y, sz, col, inner, s, tilt));
}
function dogNose(g: G, x: number, y: number, s: number, col = '#1a1414') {
  ellipse(g, x, y, s, s * 0.7); paint(g, domeFill(g, x, y, s, col, 0.3), INK, 1);
  ellipse(g, x - s * 0.3, y - s * 0.25, s * 0.32, s * 0.16); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fill();
}
function catNose(g: G, x: number, y: number, s: number, col = '#c9707a') {
  blob(g, [[x - s, y - s * 0.6], [x + s, y - s * 0.6], [x, y + s * 0.55]]);
  paint(g, col, INK, 1.1);
}
/** The Y mouth under a nose. */
function yMouth(g: G, x: number, y: number, drop: number, w: number, lw = 1.3) {
  g.beginPath();
  g.moveTo(x, y); g.lineTo(x, y + drop);
  g.moveTo(x - w, y + drop - w * 0.15); g.quadraticCurveTo(x - w * 0.5, y + drop + w * 0.45, x, y + drop);
  g.quadraticCurveTo(x + w * 0.5, y + drop + w * 0.45, x + w, y + drop - w * 0.15);
  g.strokeStyle = INK; g.lineWidth = lw; g.lineCap = 'round'; g.stroke();
}
function whiskers(g: G, y: number, dx: number, len: number, col = 'rgba(255,255,255,0.75)') {
  g.strokeStyle = col; g.lineWidth = 0.8; g.beginPath();
  mir((s) => { for (let i = 0; i < 3; i++) { g.moveTo(50 + s * dx, y + i * 2.5); g.lineTo(50 + s * (dx + len), y - 4 + i * 5); } });
  g.stroke();
}
function snarl(g: G, x: number, y: number, w: number, h: number, teeth = '#f3ead2') {
  ellipse(g, x, y, w, h); paint(g, '#5a1414', INK, 1.4);
  ellipse(g, x, y + h * 0.35, w * 0.55, h * 0.4); g.fillStyle = '#b5464a'; g.fill();
  mir((s) => { fang(g, x + s * w * 0.6, y - h * 0.85, h * 1.1, 2.6, teeth, 1, 0.8); fang(g, x + s * w * 0.45, y + h * 0.9, h * 0.8, 2.4, teeth, -1, 0.8); });
}
/** Feather or leg lines radiating from a point (for wings/legs). */
function feathers(g: G, pts: number[][], col: string) {
  g.strokeStyle = col; g.lineWidth = 1.1; g.beginPath();
  for (let i = 0; i + 1 < pts.length; i += 2) { g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i + 1][0], pts[i + 1][1]); }
  g.stroke();
}
/** A thick jointed leg: ink stroke then colour stroke. */
function leg(g: G, pts: number[][], w: number, col: string) {
  stroke(g, pts, INK, w + 2.4);
  stroke(g, pts, col, w);
  stroke(g, pts, alpha('#ffffff', 0.18), w * 0.35);
}
/** Draw a smaller copy of a portrait at x,y with scale k. */
function mini(g: G, x: number, y: number, k: number, fn: () => void) {
  g.save(); g.translate(x, y); g.scale(k, k); g.translate(-50, -50); fn(); g.restore();
}

// ===================================================================================================
// Beasts
// ===================================================================================================
function ratHead(g: G, c: Colors, r: Rand, angry = false, fur = true) {
  ears(g, 'round', 22, 30, 26, c.fur, c.inner);
  face(g, 26, 88, 18, 25, 7, c.fur, 0.42);
  if (fur) strokes(g, r, 30, 30, 40, 30, alpha(shade(c.fur, -0.45), 0.6), 14, 4);
  shape(g, [[50, 62], [58, 70], [56, 84], [50, 88], [44, 84], [42, 70]], c.belly, 48, 72, 12, 1.2);
  if (fur) whiskers(g, 76, 6, 20, alpha('#ffffff', 0.7));
  circle(g, 50, 82, 3.8); paint(g, domeFill(g, 50, 82, 3.8, c.nose, 0.4), INK, 1);
  rr4(g, 47.4, 87, 5.2, 5.5, '#f6e7b4');
  eyes(g, 50, 50, 11, 4.4, 4.4, c.eye, { pupil: 'bead', brow: angry ? 0.5 : undefined, lid: shade(c.fur, -0.2) });
}
function rr4(g: G, x: number, y: number, w: number, h: number, col: string) {
  poly(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]); paint(g, col, INK, 1);
  stroke(g, [[x + w / 2, y], [x + w / 2, y + h]], INK, 0.8);
}
function drawRat(g: G, c: Colors, r: Rand, f: Flags) {
  bust(g, c.fur, 72, 34);
  ratHead(g, c, r, !!f.angry);
  if (f.mange) { for (const [x, y] of [[34, 40], [62, 36], [58, 58]]) { circle(g, x, y, 4); g.fillStyle = alpha(c.inner, 0.7); g.fill(); } }
}
function drawRatSwarm(g: G, c: Colors, r: Rand) {
  g.strokeStyle = c.inner; g.lineWidth = 2; g.lineCap = 'round';
  for (const [x, y, a] of [[20, 90, 1], [82, 88, -1], [60, 98, 1], [10, 50, 1], [92, 46, -1]]) curve(g, [x, y], [x + a * 20, y - 16], [x + a * 8, y - 30], c.inner, 2);
  for (const [x, y, k] of [[30, 30, 0.44], [70, 28, 0.42], [20, 66, 0.4], [80, 66, 0.42], [50, 56, 0.52], [50, 92, 0.4]]) {
    mini(g, x, y, k, () => { ratHead(g, c, r, true, false); });
  }
}
function drawBat(g: G, c: Colors, r: Rand, f: Flags, giant: boolean) {
  mir((s) => {
    const P = (x: number, y: number) => [50 + s * (x - 50), y];
    poly(g, [P(60, 68), P(68, 40), P(94, 20), P(100, 42), P(104, 60), P(92, 60), P(90, 76), P(76, 72)]);
    paint(g, domeFill(g, 50 + s * 36, 44, 34, c.wing, 0.25), INK, 1.8);
    feathers(g, [P(68, 40), P(100, 42), P(68, 40), P(92, 60), P(70, 44), P(82, 72)], alpha(shade(c.wing, 0.4), 0.9));
  });
  bust(g, c.fur, 72, 24);
  ears(g, 'point', 17, 28, giant ? 28 : 26, c.fur, c.inner, -0.12);
  face(g, 28, 78, 16, 20, 12, c.fur, 0.45);
  strokes(g, r, 34, 32, 32, 30, alpha(shade(c.fur, -0.45), 0.6), 12, 3);
  // squashed nose with leaf
  poly(g, [[46, 56], [50, 46], [54, 56]]); paint(g, c.inner, INK, 1);
  ellipse(g, 50, 59, 6.5, 4.2); paint(g, domeFill(g, 50, 59, 6, c.inner, 0.3), INK, 1.1);
  nostrils(g, 50, 59, 2.4, 1.2, 1.4, 0.4);
  // open mouth with fangs
  ellipse(g, 50, 68, 7, 3.8); paint(g, '#5a1414', INK, 1.2);
  mir((s) => fang(g, 50 + s * 4, 65, giant ? 5 : 4, 2.2));
  eyes(g, 50, 46, 9, 3.4, 3.4, c.eye, { pupil: 'bead' });
  if (f.scar) scar(g, 56, 34, 62, 50);
}
function drawWolfish(g: G, c: Colors, r: Rand, f: Flags, o: { ruff?: boolean; snarl?: boolean; frost?: boolean; heavy?: boolean }) {
  if (o.ruff) spiky(g, 50, 60, 30, 48, 13, c.ruff ?? shade(c.fur, -0.2), r, Math.PI * 0.7, Math.PI * 2.3, 2);
  blob(g, [[4, 104], [12, 72], [34, 62], [66, 62], [88, 72], [96, 104]]);
  paint(g, domeFill(g, 50, 84, 50, shade(c.fur, -0.15), 0.25), INK, LW);
  ears(g, 'point', 22, 22, o.heavy ? 22 : 24, c.fur, c.inner ?? '#3b2a2a', 0.15);
  blob(g, [[50, 17], [74, 25], [82, 46], [72, 66], [50, 78], [28, 66], [18, 46], [26, 25]]);
  paint(g, domeFill(g, 46, 40, 34, c.fur, 0.3), INK, LW);
  strokes(g, r, 26, 22, 48, 40, alpha(shade(c.fur, -0.45), 0.6), 16, 4);
  blob(g, [[50, 44], [65, 54], [63, 72], [50, 84], [37, 72], [35, 54]]);
  paint(g, domeFill(g, 48, 60, 22, c.belly, 0.25), INK, LW * 0.8);
  if (o.snarl) {
    // wrinkled snarl
    g.strokeStyle = alpha(INK, 0.6); g.lineWidth = 1; g.beginPath();
    for (let i = 0; i < 3; i++) { g.moveTo(44, 47 + i * 3); g.quadraticCurveTo(50, 45 + i * 3, 56, 47 + i * 3); }
    g.stroke();
    snarl(g, 50, 73, 10, 5.5);
    dogNose(g, 50, 60, 7);
  } else {
    dogNose(g, 50, 58, 7);
    yMouth(g, 50, 63, 7, 6);
    if (o.heavy) mir((s) => fang(g, 50 + s * 5, 71, 5, 2.4));
  }
  eyes(g, 50, 41, 12, 5.6, 3.6, c.eye, { rot: 0.25, glow: !!f.glow || o.snarl, brow: o.snarl || o.heavy ? 0.6 : undefined, lid: shade(c.fur, -0.25) });
  if (o.frost) { glow(g, 50, 86, 16, '#bfeaff', 0.6); mir((s) => puff(g, 50 + s * 13, 88, 4, '#f0fbff', 0.7)); }
  if (f.scar || o.heavy) scar(g, 58, 30, 66, 50);
}
function drawBear(g: G, c: Colors, r: Rand, f: Flags, polar: boolean) {
  bust(g, c.fur, 62, 48);
  if (!polar) shape(g, [[30, 70], [50, 58], [70, 70], [50, 74]], shade(c.fur, -0.05), 50, 64, 24, 0);
  ears(g, 'round', polar ? 25 : 24, polar ? 30 : 25, polar ? 14 : 19, c.fur, c.inner);
  if (polar) face(g, 22, 88, 18, 26, 14, c.fur, 0.42); else face(g, 20, 84, 23, 31, 19, c.fur, 0.45);
  strokes(g, r, 24, 24, 52, 30, alpha(shade(c.fur, -0.4), 0.55), 18, 4);
  shape(g, polar ? [[50, 52], [61, 58], [62, 76], [50, 86], [38, 76], [39, 58]] : [[50, 50], [64, 57], [65, 72], [50, 82], [35, 72], [36, 57]], c.muzzle, 48, 64, 16, 1.6);
  dogNose(g, 50, polar ? 64 : 61, 7);
  yMouth(g, 50, polar ? 69 : 66, 6, 7);
  eyes(g, 50, polar ? 46 : 44, polar ? 11 : 13, 3.2, 3.2, c.eye, { pupil: 'bead' });
  if (f.scar) scar(g, 34, 34, 42, 56);
  if (f.roar) { snarl(g, 50, 74, 9, 5); }
}
function drawBoar(g: G, c: Colors, r: Rand, f: Flags, giant: boolean) {
  bust(g, c.fur, 62, 46);
  for (let i = -3; i <= 3; i++) spike(g, 50 + i * 5, 26 + Math.abs(i) * 1.5, -Math.PI / 2 + i * 0.18, 12 - Math.abs(i), 6, c.bristle, 1.2);
  ears(g, 'point', 24, 30, 16, c.fur, c.inner, 0.45);
  face(g, 22, 84, 20, 27, 20, c.fur, 0.45);
  strokes(g, r, 26, 26, 48, 36, alpha(shade(c.fur, -0.45), 0.6), 18, 4);
  shape(g, [[42, 46], [58, 46], [62, 64], [38, 64]], shade(c.fur, 0.08), 48, 52, 14, 1.4);
  ellipse(g, 50, 70, 13, 9); paint(g, domeFill(g, 48, 68, 13, c.snout, 0.35), INK, 1.8);
  nostrils(g, 50, 70, 5, 2.4, 3, 0.15);
  const tk = giant ? 1.35 : 1;
  mir((s) => {
    horn(g, [50 + s * 11, 77], [50 + s * 24, 80], [50 + s * (20 + 6 * tk), 76 - 18 * tk], 6 * tk, c.tusk, 0, 1.4);
    if (giant) horn(g, [50 + s * 14, 74], [50 + s * 22, 70], [50 + s * 25, 62], 4, c.tusk, 0, 1.1);
  });
  eyes(g, 50, 42, 13, 3.4, 2.8, c.eye, { pupil: 'bead', brow: 0.6, lid: shade(c.fur, -0.2), s: 1 });
  if (giant || f.scar) { scar(g, 34, 32, 42, 52); }
}
interface CatOpt { mane?: boolean; stripes?: boolean; sabre?: boolean; domestic?: boolean; spots?: boolean }
function drawCat(g: G, c: Colors, r: Rand, f: Flags, o: CatOpt) {
  if (o.mane) {
    spiky(g, 50, 52, 34, 50, 15, shade(c.mane, -0.15), r, 0, Math.PI * 2, 2);
    spiky(g, 50, 52, 26, 40, 14, c.mane, r, 0, Math.PI * 2, 1.4);
  }
  bust(g, c.fur, o.domestic ? 74 : 68, o.domestic ? 30 : 40);
  if (o.domestic) ears(g, 'point', 22, 26, 24, c.fur, c.inner, 0.05);
  else ears(g, 'round', o.mane ? 24 : 25, 25, 15, c.fur, c.inner);
  if (o.domestic) face(g, 24, 80, 22, 27, 15, c.fur, 0.5);
  else face(g, 20, 84, 22, 29, 17, c.fur, 0.48);
  strokes(g, r, 26, 24, 48, 24, alpha(shade(c.fur, -0.4), 0.5), 12, 3);
  if (o.stripes || o.spots) {
    g.fillStyle = c.stripe;
    if (o.stripes) {
      mir((s) => {
        for (let i = 0; i < 3; i++) {
          const y = 46 + i * 9;
          poly(g, [[50 + s * 29, y - 3], [50 + s * (18 - i), y + 1], [50 + s * 29, y + 3]]); g.fill();
        }
        poly(g, [[50 + s * 4, 22], [50 + s * 7, 34], [50 + s * 10, 22]]); g.fill();
        poly(g, [[50 + s * 14, 25], [50 + s * 15, 33], [50 + s * 19, 26]]); g.fill();
      });
      poly(g, [[48, 21], [50, 30], [52, 21]]); g.fill();
    } else {
      for (let i = 0; i < 16; i++) { const x = 28 + r() * 44, y = 24 + r() * 30; if (Math.abs(x - 50) < 8 && y > 40) continue; circle(g, x, y, 1.4 + r()); g.fill(); }
    }
  }
  // bridge and whisker pads
  shape(g, [[50, 40], [56, 46], [55, 60], [45, 60], [44, 46]], shade(c.fur, 0.12), 50, 50, 10, 0);
  mir((s) => { circle(g, 50 + s * 6.5, 68, o.domestic ? 6 : 7.5); paint(g, domeFill(g, 50 + s * 6, 66, 8, c.muzzle, 0.3), INK, 1.2); });
  circle(g, 50, 76, o.domestic ? 4.5 : 5.5); paint(g, domeFill(g, 50, 75, 6, shade(c.muzzle, -0.1), 0.3), INK, 1.1);
  if (o.sabre) mir((s) => horn(g, [50 + s * 5, 70], [50 + s * 6, 84], [50 + s * 3, 96], 5.5, '#f3ead2', 0, 1.2));
  catNose(g, 50, 61, o.domestic ? 3.6 : 5, c.nose);
  g.fillStyle = alpha(INK, 0.6);
  mir((s) => { for (let i = 0; i < 3; i++) { circle(g, 50 + s * (4 + i * 3), 67 + (i % 2) * 2.5, 0.7); g.fill(); } });
  whiskers(g, 68, 10, o.domestic ? 22 : 16);
  eyes(g, 50, 46, o.domestic ? 11 : 12, o.domestic ? 6 : 5.2, o.domestic ? 5.2 : 3.8, c.eye, { rot: 0.22, pupil: o.domestic ? 'slit' : 'small', pr: o.domestic ? 0.6 : 0.4, brow: o.domestic ? undefined : 0.3, lid: shade(c.fur, -0.2) });
  if (f.scar) scar(g, 58, 34, 66, 54);
}
function drawApe(g: G, c: Colors, r: Rand, f: Flags, o: { giant?: boolean; yeti?: boolean }) {
  bust(g, c.fur, 60, o.giant || o.yeti ? 52 : 46);
  strokes(g, r, 8, 70, 84, 26, alpha(shade(c.fur, -0.4), 0.55), 16, 5);
  mir((s) => { circle(g, 50 + s * 28, 52, 6); paint(g, domeFill(g, 50 + s * 28, 52, 6, c.skin, 0.3), INK, 1.6); });
  face(g, 16, 84, 20, 27, 22, c.fur, 0.45);
  if (!o.yeti) { blob(g, [[42, 20], [50, 12], [58, 20], [50, 24]]); paint(g, shade(c.fur, -0.1), INK, 1.4); }
  else strokes(g, r, 26, 16, 48, 18, alpha(shade(c.fur, -0.3), 0.7), 14, 5);
  shape(g, [[50, 34], [66, 37], [68, 52], [63, 62], [64, 74], [50, 84], [36, 74], [37, 62], [32, 52], [34, 37]], c.skin, 48, 56, 22, 1.6);
  shape(g, [[33, 42], [50, 38], [67, 42], [66, 48], [50, 46], [34, 48]], shade(c.skin, -0.25), 48, 42, 18, 1.4);
  eyes(g, 50, 50, 8.5, 3, 2.6, c.eye, { pupil: 'small', pr: 0.5 });
  shape(g, [[45, 54], [55, 54], [58, 64], [50, 66], [42, 64]], shade(c.skin, -0.1), 50, 58, 10, 1.3);
  nostrils(g, 50, 62, 3.6, 2.3, 1.5, 0.35);
  if (o.yeti || f.roar) {
    ellipse(g, 50, 75, 9, 5.5); paint(g, '#5a1414', INK, 1.3);
    mir((s) => { fang(g, 50 + s * 6, 70.5, 6, 3); fang(g, 50 + s * 5, 79.5, 4, 2.4, '#f3ead2', -1); });
  } else stroke(g, [[40, 73], [50, 75], [60, 73]], INK, 1.6);
  if (o.giant || f.scar) scar(g, 56, 30, 64, 52);
}
function antler(g: G, s: number, big: boolean, col: string) {
  const P = (x: number, y: number) => [50 + s * (x - 50), y];
  if (big) {
    horn(g, P(62, 26), P(88, 28), P(96, 4), 7, col, 0, 1.4, 0.15);
    for (const [bx, by, tx, ty] of [[70, 24, 70, 6], [80, 20, 82, 2], [88, 16, 98, 18], [74, 25, 92, 32]]) horn(g, P(bx, by), P((bx + tx) / 2, (by + ty) / 2 + 2), P(tx, ty), 4.4, col, 0, 1.2, 0.1);
  } else {
    horn(g, P(60, 26), P(76, 22), P(80, 4), 5.5, col, 0, 1.3, 0.15);
    for (const [bx, by, tx, ty] of [[68, 22, 66, 8], [75, 16, 88, 10]]) horn(g, P(bx, by), P((bx + tx) / 2, (by + ty) / 2), P(tx, ty), 3.6, col, 0, 1.1, 0.1);
  }
}
function drawDeer(g: G, c: Colors, r: Rand, f: Flags, kind: 'elk' | 'deer') {
  const antlers = f.doe ? 0 : 1;
  if (antlers) mir((s) => antler(g, s, kind === 'elk', c.antler));
  bust(g, c.fur, 70, kind === 'elk' ? 36 : 30);
  if (kind === 'elk') spiky(g, 50, 74, 20, 32, 9, c.mane, r, Math.PI * 0.05, Math.PI * 0.95, 1.8);
  shape(g, [[42, 80], [58, 80], [56, 96], [44, 96]], c.belly, 50, 86, 12, 0);
  ears(g, 'long', 17, 34, 18, c.fur, c.inner, 0.65);
  face(g, 22, 92, 18, 20, 11, c.fur, 0.35);
  strokes(g, r, 34, 26, 32, 26, alpha(shade(c.fur, -0.4), 0.5), 10, 4);
  shape(g, [[50, 70], [61, 78], [60, 90], [50, 94], [40, 90], [39, 78]], c.belly, 48, 80, 12, 1.2);
  dogNose(g, 50, 84, 5.5);
  eyes(g, 50, 44, 14, 4.6, 4, '#2a1a12', { pupil: 'bead', rot: 0.15 });
  if (f.scar) scar(g, 56, 30, 62, 52);
}
function drawGoat(g: G, c: Colors, r: Rand, f: Flags) {
  mir((s) => hornK(g, [50 + s * 10, 26], [50 + s * 40, 2], [50 + s * 44, 40], 1, 11, c.horn, 6, 1.6));
  bust(g, c.fur, 70, 36);
  ears(g, 'long', 20, 40, 15, c.fur, c.inner, 0.95);
  face(g, 22, 86, 17, 19, 11, c.fur, 0.38);
  strokes(g, r, 34, 26, 32, 30, alpha(shade(c.fur, -0.4), 0.5), 12, 4);
  spiky(g, 50, 82, 4, 18, 5, c.beard, r, Math.PI * 0.25, Math.PI * 0.75, 1.4);
  shape(g, [[50, 66], [59, 72], [58, 82], [50, 86], [42, 82], [41, 72]], shade(c.fur, 0.15), 48, 74, 12, 1.2);
  nostrils(g, 50, 74, 4, 2, 1.2, 0.6);
  stroke(g, [[45, 81], [50, 82], [55, 81]], INK, 1.2);
  eyes(g, 50, 44, 13, 4.6, 3.6, c.eye, { pupil: 'goat', rot: 0.15 });
  if (f.scar) scar(g, 36, 34, 42, 54);
}
type HorseKind = 'draft' | 'riding' | 'war' | 'pony' | 'mule';
function drawHorse(g: G, c: Colors, r: Rand, f: Flags, kind: HorseKind) {
  const pony = kind === 'pony', mule = kind === 'mule', draft = kind === 'draft';
  bust(g, c.coat, 70, draft ? 40 : 32);
  if (kind === 'war') {
    // neck barding
    blob(g, [[14, 112], [20, 80], [50, 74], [80, 80], [86, 112]]);
    paint(g, domeFill(g, 50, 90, 40, c.cloth, 0.25), INK, LW);
    g.strokeStyle = c.trim; g.lineWidth = 2.4; g.beginPath(); g.moveTo(20, 84); g.quadraticCurveTo(50, 74, 80, 84); g.stroke();
  }
  // mane on one side of the neck
  if (!mule) spiky(g, 28, 74, 6, 18, 6, c.mane, r, Math.PI * 0.55, Math.PI * 1.45, 1.6);
  if (mule) ears(g, 'long', 13, 26, 30, c.coat, c.inner, 0.05);
  else ears(g, 'point', 14, 20, pony ? 13 : 16, c.coat, c.inner, -0.15);
  const bot = pony ? 88 : 94;
  face(g, 18, bot, draft ? 19 : 17, draft ? 21 : 19, draft ? 16 : 14, c.coat, 0.33);
  strokes(g, r, 36, 24, 28, 30, alpha(shade(c.coat, -0.35), 0.45), 10, 4);
  if (c.blaze !== 'none') shape(g, [[50, 26], [54, 32], [53, 60], [56, bot - 14], [50, bot - 8], [44, bot - 14], [47, 60], [46, 32]], c.blaze, 50, 40, 20, 0);
  ellipse(g, 50, bot - 9, draft ? 15 : 13, 9.5); paint(g, domeFill(g, 48, bot - 11, 14, c.muzzle, 0.3), INK, 1.6);
  nostrils(g, 50, bot - 11, 7, 2.6, 1.7, 0.9);
  stroke(g, [[44, bot - 3], [50, bot - 2], [56, bot - 3]], INK, 1.1);
  if (kind === 'war') {
    // chanfron (face plate) with a plume
    shape(g, [[50, 22], [60, 26], [60, 46], [56, 64], [50, 70], [44, 64], [40, 46], [40, 26]], c.metal, 46, 34, 26, 1.8, 0.45);
    stroke(g, [[50, 26], [50, 66]], alpha(shade(c.metal, 0.6), 0.8), 1.4);
    for (const y of [32, 48]) mir((s) => { circle(g, 50 + s * 6, y, 1.4); g.fillStyle = shade(c.metal, -0.5); g.fill(); });
    spiky(g, 50, 14, 4, 13, 5, c.plume, r, -Math.PI * 0.95, -Math.PI * 0.05, 1.4);
  }
  if (!mule && kind !== 'war') spiky(g, 50, 21, 3, pony ? 18 : 13, pony ? 6 : 5, c.mane, r, Math.PI * 0.2, Math.PI * 0.8, 1.4);
  eyes(g, 50, 40, kind === 'war' ? 15 : 16, 3.8, 3.4, '#20140e', { pupil: 'bead', rot: 0.2 });
  if (f.scar) scar(g, 62, 36, 64, 56);
}
function drawCamel(g: G, c: Colors, r: Rand, f: Flags) {
  shape(g, [[58, 80], [68, 62], [82, 58], [94, 68], [98, 86]], shade(c.coat, -0.1), 80, 66, 20);
  if (f.twohump) shape(g, [[42, 80], [32, 62], [18, 58], [6, 68], [2, 86]], shade(c.coat, -0.1), 20, 66, 20);
  bust(g, c.coat, 74, 26);
  strokes(g, r, 30, 74, 40, 20, alpha(shade(c.coat, -0.35), 0.5), 10, 5);
  ears(g, 'small', 20, 28, 16, c.coat, c.inner);
  face(g, 18, 90, 18, 19, 15, c.coat, 0.36);
  spiky(g, 50, 22, 3, 12, 6, shade(c.coat, -0.15), r, Math.PI * 0.15, Math.PI * 0.85, 1.4);
  ellipse(g, 50, 78, 15, 11); paint(g, domeFill(g, 48, 76, 15, c.muzzle, 0.3), INK, 1.6);
  stroke(g, [[50, 80], [50, 89]], INK, 1.3);
  mir((s) => stroke(g, [[50 + s * 5, 71], [50 + s * 9, 75]], INK, 1.6));
  stroke(g, [[40, 88], [50, 90], [60, 88]], INK, 1.2);
  eyes(g, 50, 44, 13, 4.4, 3.4, '#2a1a12', { pupil: 'bead', brow: -0.3, lid: shade(c.coat, -0.1), s: 1 });
  mir((s) => feathers(g, [[50 + s * 9, 41], [50 + s * 8, 37], [50 + s * 13, 40.5], [50 + s * 13, 36], [50 + s * 17, 41], [50 + s * 18, 37]], INK));
}
function drawMastiff(g: G, c: Colors, r: Rand, f: Flags) {
  bust(g, c.fur, 64, 44);
  // spiked collar
  blob(g, [[16, 80], [50, 72], [84, 80], [84, 88], [50, 82], [16, 88]]);
  paint(g, litFill(g, 16, 72, 68, 16, c.collar), INK, 1.6);
  for (let i = -3; i <= 3; i++) spike(g, 50 + i * 10, 78 + Math.abs(i) * 1.4, -Math.PI / 2 + i * 0.15, 6, 4, '#c9ced3', 1);
  face(g, 22, 84, 24, 30, 26, c.fur, 0.45);
  g.strokeStyle = alpha(shade(c.fur, -0.5), 0.7); g.lineWidth = 1.2; g.beginPath();
  for (let i = 0; i < 3; i++) { g.moveTo(40, 30 + i * 4); g.quadraticCurveTo(50, 27 + i * 4, 60, 30 + i * 4); }
  g.stroke();
  ears(g, 'droop', 26, 28, 18, c.fur, c.inner, 0.1);
  // jowls
  mir((s) => { blob(g, [[50, 60], [50 + s * 18, 60], [50 + s * 22, 74], [50 + s * 12, 82], [50, 78]]); paint(g, domeFill(g, 50 + s * 10, 68, 16, c.muzzle, 0.3), INK, 1.6); });
  shape(g, [[42, 44], [58, 44], [60, 60], [40, 60]], c.muzzle, 50, 52, 12, 0);
  dogNose(g, 50, 58, 7.5);
  stroke(g, [[50, 62], [50, 70]], INK, 1.3);
  eyes(g, 50, 44, 12, 3.6, 3.2, c.eye, { pupil: 'bead', brow: 0.35, lid: shade(c.fur, -0.2) });
  if (f.scar) scar(g, 32, 36, 38, 54);
}
interface BirdOpt { beak: 'hook' | 'straight' | 'small' | 'owl' | 'short'; wings?: boolean; eyeR?: number; head?: string; crest?: boolean; tufts?: boolean; disc?: boolean; ruff?: boolean; bald?: boolean; comb?: boolean; stripe?: boolean; mane?: boolean; furry?: boolean; ears?: boolean }
function drawBird(g: G, c: Colors, r: Rand, f: Flags, o: BirdOpt) {
  const head = c.head ?? c.body;
  if (o.wings) mir((s) => {
    const P = (x: number, y: number) => [50 + s * (x - 50), y];
    poly(g, [P(62, 66), P(70, 30), P(90, 14), P(104, 24), P(96, 34), P(104, 44), P(96, 52), P(102, 64), P(84, 76)]);
    paint(g, domeFill(g, 50 + s * 34, 40, 36, c.wing ?? c.body, 0.3), INK, 1.8);
    feathers(g, [P(74, 40), P(96, 34), P(76, 50), P(96, 52), P(78, 60), P(96, 66)], alpha(shade(c.wing ?? c.body, -0.5), 0.8));
  });
  if (o.ruff) spiky(g, 50, 74, 22, 36, 12, c.ruff, r, Math.PI * 0.9, Math.PI * 2.1, 1.8);
  bust(g, c.body, 70, o.furry ? 42 : 36);
  if (o.furry) strokes(g, r, 10, 74, 80, 24, alpha(shade(c.body, -0.4), 0.55), 14, 4);
  else scaleTex(g, r, 16, 76, 68, 22, alpha(shade(c.body, -0.45), 0.6), 18, 3.4, 1);
  if (o.mane) spiky(g, 50, 40, 24, 36, 10, c.mane, r, Math.PI * 1.05, Math.PI * 1.95, 1.6);
  if (o.ears) ears(g, 'point', 22, 22, 14, c.mane, shade(c.mane, -0.35), 0.1);
  if (o.tufts) mir((s) => { for (let i = 0; i < 3; i++) horn(g, [50 + s * (14 + i * 3), 26 + i * 2], [50 + s * (20 + i * 4), 14], [50 + s * (24 + i * 4), 4 + i * 3], 5, shade(head, -0.1 * i), 0, 1.2); });
  if (o.crest) for (let i = -2; i <= 2; i++) horn(g, [50 + i * 4, 24], [50 + i * 8, 12], [50 + i * 14, 2 - (2 - Math.abs(i)) * 3], 5, c.crest, 0, 1.2);
  if (o.comb) {
    blob(g, [[38, 26], [40, 12], [46, 18], [50, 6], [54, 17], [60, 10], [62, 24], [56, 30], [44, 30]]);
    paint(g, domeFill(g, 48, 18, 14, c.comb, 0.35), INK, 1.6);
  }
  if (o.bald) face(g, 24, 80, 15, 18, 12, head, 0.45);
  else face(g, 20, 80, 20, 25, 16, head, 0.45);
  if (o.bald) {
    g.strokeStyle = alpha(shade(head, -0.5), 0.6); g.lineWidth = 1; g.beginPath();
    for (let i = 0; i < 4; i++) { g.moveTo(40, 30 + i * 4); g.quadraticCurveTo(50, 28 + i * 4, 60, 30 + i * 4); }
    g.stroke();
  } else scaleTex(g, r, 32, 26, 36, 20, alpha(shade(head, -0.4), 0.45), 10, 2.6);
  if (o.disc) {
    mir((s) => { circle(g, 50 + s * 12, 48, 14); paint(g, domeFill(g, 50 + s * 12, 46, 14, c.disc, 0.25), alpha(INK, 0.7), 1.2); });
    stroke(g, [[50, 30], [50, 56]], alpha(shade(c.disc, -0.5), 0.6), 1);
  }
  if (o.stripe) mir((s) => { blob(g, [[50 + s * 12, 52], [50 + s * 18, 56], [50 + s * 17, 70], [50 + s * 13, 66]]); paint(g, shade(head, -0.55), null); });
  if (c.throat) shape(g, [[42, 62], [58, 62], [60, 74], [50, 80], [40, 74]], c.throat, 50, 68, 10, 0);
  if (o.comb) mir((s) => { blob(g, [[50 + s * 3, 66], [50 + s * 9, 70], [50 + s * 8, 84], [50 + s * 3, 80]]); paint(g, domeFill(g, 50 + s * 6, 74, 8, c.comb, 0.3), INK, 1.3); });
  const er = o.eyeR ?? 5;
  eyes(g, 50, 46, o.disc ? 12 : 13, er, er * (o.disc ? 1 : 0.85), c.eye, { pupil: o.disc ? 'round' : 'round', pr: o.disc ? 0.5 : 0.36, brow: o.disc || o.beak === 'straight' ? undefined : 0.5, lid: shade(head, -0.15) });
  // beak
  const bc = c.beak;
  if (o.beak === 'hook') {
    shape(g, [[42, 50], [58, 50], [57, 58], [53, 70], [50, 78], [47, 70], [43, 58]], bc, 46, 56, 14, 1.8, 0.4);
    poly(g, [[47.5, 70], [52.5, 70], [50, 79]]); g.fillStyle = shade(bc, -0.45); g.fill();
    if (c.cere) { blob(g, [[42, 50], [58, 50], [56, 55], [44, 55]]); paint(g, c.cere, INK, 1.2); }
    nostrils(g, 50, 56, 4.5, 1.2, 0.8, 0);
  } else if (o.beak === 'straight') {
    shape(g, [[43, 50], [57, 50], [55, 64], [50, 84], [45, 64]], bc, 46, 58, 14, 1.8, 0.45);
    stroke(g, [[50, 54], [50, 82]], alpha('#ffffff', 0.25), 1);
  } else if (o.beak === 'owl') {
    shape(g, [[46, 52], [54, 52], [52, 62], [50, 67], [48, 62]], bc, 48, 56, 8, 1.4, 0.4);
  } else if (o.beak === 'short') {
    shape(g, [[44, 54], [56, 54], [54, 62], [50, 70], [46, 62]], bc, 48, 58, 10, 1.6, 0.4);
    stroke(g, [[45, 61], [55, 61]], INK, 1);
  } else {
    shape(g, [[45, 52], [55, 52], [53, 60], [50, 66], [47, 60]], bc, 48, 56, 8, 1.4, 0.4);
  }
  if (f.scar) scar(g, 58, 32, 66, 52);
}
function drawSpider(g: G, c: Colors, r: Rand, f: Flags, phase = false) {
  if (phase) { glow(g, 50, 50, 50, c.glow, 0.55); }
  // legs, four a side
  mir((s) => {
    for (let i = 0; i < 4; i++) {
      const P = (x: number, y: number) => [50 + s * (x - 50), y];
      leg(g, [P(62, 56 + i * 5), P(80 + i * 2, 18 + i * 14), P(100, 30 + i * 18)], 4.6 - i * 0.3, shade(c.body, -0.1));
      circle(g, 50 + s * (30 + i * 2), 18 + i * 14, 2.6); paint(g, c.band, INK, 1);
    }
  });
  // abdomen behind
  ellipse(g, 50, 28, 26, 22); paint(g, domeFill(g, 46, 22, 26, c.body, 0.3), INK, LW);
  if (c.mark !== 'none') { blob(g, [[50, 16], [56, 26], [50, 34], [44, 26]]); paint(g, c.mark, INK, 1); }
  strokes(g, r, 28, 12, 44, 30, alpha(shade(c.body, 0.4), 0.45), 16, 3);
  // head
  shape(g, [[50, 40], [70, 46], [74, 62], [64, 76], [50, 80], [36, 76], [26, 62], [30, 46]], c.body, 46, 56, 26);
  strokes(g, r, 30, 44, 40, 30, alpha(shade(c.body, 0.45), 0.4), 14, 3);
  // chelicerae and fangs
  mir((s) => {
    blob(g, [[50 + s * 2, 70], [50 + s * 12, 68], [50 + s * 13, 82], [50 + s * 6, 88], [50 + s * 1, 82]]);
    paint(g, domeFill(g, 50 + s * 7, 76, 10, shade(c.body, 0.1), 0.35), INK, 1.6);
    horn(g, [50 + s * 7, 86], [50 + s * 8, 94], [50 + s * 1, 96], 4, c.fang, 0, 1.1);
  });
  // eyes: two big, six small
  const ec = c.eye;
  eyes(g, 50, 56, 6.5, 4.6, 4.6, ec, { pupil: 'bead', glow: phase });
  eyes(g, 50, 47, 5, 2.6, 2.6, ec, { pupil: 'bead' });
  eyes(g, 50, 52, 15, 2.8, 2.8, ec, { pupil: 'bead' });
  eyes(g, 50, 62, 15, 2.2, 2.2, ec, { pupil: 'bead' });
  if (phase) {
    g.strokeStyle = alpha(c.glow, 0.85); g.lineWidth = 1.2; g.setLineDash([3, 3]);
    ellipse(g, 54, 54, 30, 30); g.stroke();
    g.setLineDash([]);
  }
  if (f.scar) scar(g, 56, 44, 64, 60);
}
function drawScorpion(g: G, c: Colors, r: Rand, f: Flags) {
  // tail arching over the head, stinger pointing down
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.95 - i * 0.16);
    const x = 50 + Math.cos(a) * 30 + 6, y = 52 - Math.sin(a) * 40;
    ellipse(g, x, y, 8 - i * 0.6, 7 - i * 0.6); paint(g, domeFill(g, x, y, 8, c.shell, 0.35), INK, 1.6);
  }
  blob(g, [[36, 18], [44, 10], [50, 14], [46, 30], [38, 28]]); paint(g, domeFill(g, 42, 18, 10, c.sting, 0.35), INK, 1.6);
  horn(g, [44, 26], [46, 34], [52, 36], 4, '#f3ead2', 0, 1);
  // claws
  mir((s) => {
    const P = (x: number, y: number) => [50 + s * (x - 50), y];
    leg(g, [P(64, 70), P(84, 66), P(88, 46)], 7, c.shell);
    blob(g, [P(80, 48), P(92, 26), P(100, 24), P(98, 46), P(90, 54)]); paint(g, domeFill(g, 50 + s * 42, 38, 14, c.shell, 0.35), INK, 1.8);
    blob(g, [P(82, 44), P(80, 26), P(88, 22), P(90, 36)]); paint(g, domeFill(g, 50 + s * 35, 32, 10, shade(c.shell, 0.15), 0.35), INK, 1.6);
  });
  bust(g, shade(c.shell, -0.1), 72, 34);
  shape(g, [[50, 44], [70, 50], [74, 66], [62, 82], [50, 86], [38, 82], [26, 66], [30, 50]], c.shell, 46, 58, 26);
  stroke(g, [[34, 60], [50, 56], [66, 60]], alpha(INK, 0.6), 1.2);
  stroke(g, [[36, 70], [50, 66], [64, 70]], alpha(INK, 0.6), 1.2);
  eyes(g, 50, 52, 5, 2.8, 2.8, c.eye, { pupil: 'bead' });
  mir((s) => { circle(g, 50 + s * 16, 56, 1.8); g.fillStyle = c.eye; g.fill(); circle(g, 50 + s * 19, 58, 1.6); g.fill(); });
  mir((s) => horn(g, [50 + s * 6, 80], [50 + s * 8, 90], [50 + s * 1, 92], 5, shade(c.shell, -0.2), 0, 1.2));
  if (f.scar) scar(g, 40, 54, 46, 70);
}
function drawCentipede(g: G, c: Colors, r: Rand, f: Flags) {
  // coiled body segments behind the head
  for (let i = 9; i >= 0; i--) {
    const a = Math.PI * (0.5 + i * 0.2);
    const x = 50 + Math.cos(a) * 34, y = 56 + Math.sin(a) * 34;
    for (const s of [-1, 1]) { stroke(g, [[x, y], [x + s * 6, y + 7]], INK, 2.4); stroke(g, [[x, y], [x + s * 6, y + 7]], c.leg, 1.2); }
    ellipse(g, x, y, 9, 7.5, a); paint(g, domeFill(g, x, y, 9, i % 2 ? c.shell : shade(c.shell, -0.12), 0.35), INK, 1.6);
  }
  // antennae
  mir((s) => horn(g, [50 + s * 8, 40], [50 + s * 20, 14], [50 + s * 40, 4], 3.2, c.leg, 0, 1.1));
  shape(g, [[50, 36], [66, 42], [70, 58], [62, 74], [50, 78], [38, 74], [30, 58], [34, 42]], c.shell, 46, 54, 22);
  stroke(g, [[36, 50], [50, 46], [64, 50]], alpha(INK, 0.55), 1.1);
  // forcipules
  mir((s) => horn(g, [50 + s * 10, 72], [50 + s * 18, 90], [50 + s * 2, 92], 6, c.fang, 0, 1.4));
  eyes(g, 50, 56, 10, 3, 3, c.eye, { pupil: 'bead' });
  if (f.scar) scar(g, 54, 42, 60, 58);
}
function drawWasp(g: G, c: Colors, r: Rand, f: Flags) {
  mir((s) => {
    for (const [a, l, w] of [[0.55, 46, 12], [0.95, 38, 10]]) {
      const cx = 50 + s * Math.sin(a) * l * 0.55, cy = 56 - Math.cos(a) * l * 0.55;
      ellipse(g, cx, cy, w, l * 0.55, s * a); paint(g, alpha('#dff3ff', 0.55), INK, 1.4);
      stroke(g, [[50 + s * 6, 54], [cx + s * Math.sin(a) * l * 0.3, cy - Math.cos(a) * l * 0.3]], alpha(INK, 0.5), 0.9);
    }
  });
  // striped thorax
  bust(g, c.stripe, 72, 30);
  for (const y of [80, 92]) { blob(g, [[22, y], [50, y - 4], [78, y], [78, y + 5], [50, y + 1], [22, y + 5]]); paint(g, c.body, null); }
  mir((s) => horn(g, [50 + s * 6, 28], [50 + s * 14, 10], [50 + s * 26, 4], 3, c.stripe, 0, 1.1));
  shape(g, [[50, 26], [68, 32], [72, 50], [62, 70], [50, 76], [38, 70], [28, 50], [32, 32]], c.body, 46, 46, 24);
  shape(g, [[42, 30], [58, 30], [56, 42], [44, 42]], c.stripe, 50, 36, 10, 1.2);
  // huge compound eyes
  mir((s) => {
    ellipse(g, 50 + s * 15, 50, 9, 14, s * 0.25); paint(g, domeFill(g, 50 + s * 13, 46, 14, c.eye, 0.5), INK, 1.6);
    g.strokeStyle = alpha('#000000', 0.25); g.lineWidth = 0.7; g.beginPath();
    for (let i = 0; i < 4; i++) { g.moveTo(50 + s * 8, 42 + i * 5); g.lineTo(50 + s * 22, 40 + i * 5); }
    g.stroke();
    circle(g, 50 + s * 13, 44, 2.2); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fill();
  });
  mir((s) => horn(g, [50 + s * 7, 68], [50 + s * 12, 80], [50 + s * 2, 82], 6, shade(c.stripe, 0.1), 0, 1.3));
  if (f.scar) scar(g, 40, 30, 46, 48);
}
function drawFrog(g: G, c: Colors, r: Rand, f: Flags, toad: boolean) {
  bust(g, c.skin, 68, 46);
  shape(g, [[50, 30], [76, 36], [90, 56], [80, 76], [50, 84], [20, 76], [10, 56], [24, 36]], c.skin, 44, 50, 40);
  shape(g, [[26, 70], [50, 66], [74, 70], [68, 82], [50, 86], [32, 82]], c.belly, 50, 76, 22, 0);
  if (toad) {
    g.fillStyle = shade(c.skin, -0.25);
    for (let i = 0; i < 18; i++) { const x = 18 + r() * 64, y = 38 + r() * 26; circle(g, x, y, 1.2 + r() * 1.8); g.fill(); }
    mir((s) => { ellipse(g, 50 + s * 28, 46, 7, 4, s * 0.4); paint(g, domeFill(g, 50 + s * 28, 45, 7, shade(c.skin, 0.1), 0.35), INK, 1.2); });
  } else {
    g.fillStyle = c.spot;
    for (let i = 0; i < 8; i++) { const x = 24 + r() * 52, y = 40 + r() * 22; if (Math.abs(x - 50) < 10) continue; circle(g, x, y, 2 + r() * 2); g.fill(); }
  }
  // bulging eyes on top
  mir((s) => { circle(g, 50 + s * 18, 32, 11); paint(g, domeFill(g, 50 + s * 17, 30, 11, c.skin, 0.35), INK, LW); });
  eyes(g, 50, 32, 18, 7.4, 7, c.eye, { pupil: 'goat', pr: 0.5 });
  nostrils(g, 50, 52, 5, 1.4, 1, 0.3);
  g.beginPath(); g.moveTo(16, 60); g.quadraticCurveTo(50, 74, 84, 60);
  g.strokeStyle = INK; g.lineWidth = 2.2; g.stroke();
  if (f.tongue) { horn(g, [50, 70], [56, 84], [48, 98], 6, '#e06a7a', 0, 1.2); }
}
function drawSnake(g: G, c: Colors, r: Rand, f: Flags, big: boolean) {
  // coils behind
  for (const [cx, cy, rx] of [[50, 92, 44], [50, 78, 36]]) {
    ellipse(g, cx, cy, rx, 12); paint(g, domeFill(g, cx, cy - 4, rx, c.scale, 0.3), INK, 2);
    g.fillStyle = c.pattern;
    for (let i = -3; i <= 3; i++) { blob(g, [[cx + i * rx * 0.28 - 3, cy - 6], [cx + i * rx * 0.28 + 3, cy - 6], [cx + i * rx * 0.28 + 4, cy - 1], [cx + i * rx * 0.28 - 4, cy - 1]]); g.fill(); }
  }
  // neck
  shape(g, [[38, 80], [40, 50], [60, 50], [62, 80]], c.scale, 50, 62, 18, 2);
  shape(g, [[44, 80], [45, 56], [55, 56], [56, 80]], c.belly, 50, 66, 10, 1);
  // head: viper triangle or rounded constrictor
  const hp = big ? [[50, 18], [70, 24], [76, 42], [68, 58], [50, 64], [32, 58], [24, 42], [30, 24]] : [[50, 16], [66, 20], [80, 40], [66, 56], [50, 62], [34, 56], [20, 40], [34, 20]];
  shape(g, hp, c.scale, 46, 36, 30);
  scaleTex(g, r, 30, 22, 40, 30, alpha(shade(c.scale, -0.5), 0.5), 18, 2.4);
  g.fillStyle = c.pattern;
  blob(g, [[50, 22], [58, 30], [50, 40], [42, 30]]); g.fill();
  nostrils(g, 50, 54, 4, 1.4, 1, 0.3);
  stroke(g, [[38, 58], [50, 61], [62, 58]], INK, 1.2);
  // forked tongue
  g.strokeStyle = '#d0263a'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(50, 61); g.lineTo(50, 72); g.lineTo(46, 77); g.moveTo(50, 72); g.lineTo(54, 77); g.stroke();
  eyes(g, 50, 38, big ? 18 : 20, 4.4, 3.8, c.eye, { pupil: 'slit', rot: 0.2, brow: big ? 0.2 : 0.6, lid: shade(c.scale, -0.15) });
  if (!big) mir((s) => { circle(g, 50 + s * 9, 48, 1.6); g.fillStyle = '#1a1010'; g.fill(); });
}
function drawCroc(g: G, c: Colors, r: Rand, f: Flags, giant: boolean) {
  bust(g, c.scale, 70, 46);
  // wide flat head with snout coming toward us
  shape(g, [[50, 24], [76, 30], [86, 50], [76, 70], [50, 74], [24, 70], [14, 50], [24, 30]], c.scale, 44, 44, 38);
  scaleTex(g, r, 22, 30, 56, 34, alpha(shade(c.scale, -0.5), 0.55), 22, 3);
  // jaw line with interlocking teeth
  shape(g, [[26, 62], [74, 62], [70, 84], [50, 94], [30, 84]], shade(c.scale, -0.12), 48, 74, 24, LW);
  shape(g, [[30, 50], [70, 50], [68, 70], [50, 80], [32, 70]], shade(c.scale, 0.08), 46, 60, 22, 1.8);
  for (let i = 0; i < 7; i++) {
    const t = i / 6, x = 32 + t * 36, y = 70 + Math.sin(t * Math.PI) * 9;
    fang(g, x, y - 1, 4.5, 2.6, '#f2ecd6', 1, 0.8);
    if (i % 2) fang(g, x + 2, y + 5, 3.6, 2.4, '#f2ecd6', -1, 0.8);
  }
  nostrils(g, 50, 56, 5, 2.2, 1.6, 0.5);
  // raised eyes
  mir((s) => { ellipse(g, 50 + s * 18, 32, 9, 7); paint(g, domeFill(g, 50 + s * 17, 30, 9, c.scale, 0.35), INK, 1.8); });
  eyes(g, 50, 32, 18, 5, 3.6, c.eye, { pupil: 'slit', rot: 0.1, brow: 0.6, lid: shade(c.scale, -0.15) });
  for (let i = -2; i <= 2; i++) { ellipse(g, 50 + i * 9, 22 - Math.abs(i) * 0, 3.5, 2.2); paint(g, shade(c.scale, -0.2), INK, 1); }
  if (giant || f.scar) scar(g, 24, 38, 34, 58);
}
function drawShark(g: G, c: Colors, r: Rand, f: Flags, giant: boolean) {
  // dorsal fin and pectoral fins
  poly(g, [[38, 30], [50, -2], [64, 30]]); paint(g, domeFill(g, 48, 12, 20, shade(c.skin, -0.1), 0.3), INK, LW);
  mir((s) => { poly(g, [[50 + s * 30, 70], [50 + s * 54, 92], [50 + s * 24, 86]]); paint(g, domeFill(g, 50 + s * 36, 82, 16, shade(c.skin, -0.1), 0.3), INK, LW); });
  shape(g, [[50, 22], [74, 30], [86, 52], [80, 76], [50, 92], [20, 76], [14, 52], [26, 30]], c.skin, 44, 40, 40);
  // pale belly under the jaw
  shape(g, [[22, 66], [50, 60], [78, 66], [70, 84], [50, 92], [30, 84]], c.belly, 50, 76, 26, 0);
  // gills
  mir((s) => { for (let i = 0; i < 3; i++) curve(g, [50 + s * (28 + i * 3), 50], [50 + s * (31 + i * 3), 58], [50 + s * (28 + i * 3), 66], alpha(INK, 0.6), 1.1); });
  // mouth with rows of teeth
  blob(g, [[30, 68], [50, 62], [70, 68], [64, 82], [50, 86], [36, 82]]);
  paint(g, '#5a1418', INK, 1.8);
  for (let i = 0; i < 8; i++) { const t = i / 7; fang(g, 33 + t * 34, 66 + Math.sin(t * Math.PI) * -3, 5, 3.6, '#f6f1e2', 1, 0.7); }
  for (let i = 0; i < 6; i++) { const t = i / 5; fang(g, 38 + t * 24, 84 - Math.sin(t * Math.PI) * 2, 4.4, 3.4, '#f6f1e2', -1, 0.7); }
  nostrils(g, 50, 44, 10, 2, 1.2, 0.2);
  eyes(g, 50, 46, 24, 3.4, 3.4, '#0c0c10', { pupil: 'bead' });
  if (giant || f.scar) { scar(g, 30, 30, 40, 44); if (giant) scar(g, 64, 32, 70, 42); }
}
function drawOctopus(g: G, c: Colors, r: Rand, f: Flags, kraken: boolean) {
  const n = kraken ? 7 : 5;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), x0 = 30 + t * 40, a = -1 + t * 2;
    const tip = [50 + a * 52, 92 - Math.abs(a) * 30];
    horn(g, [x0, 62], [50 + a * 30, 100], tip, kraken ? 14 : 12, i % 2 ? c.skin : shade(c.skin, -0.1), 0, 1.6, 0.05);
    g.fillStyle = c.sucker;
    for (let k = 1; k < 4; k++) { const u = k / 5; const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * (50 + a * 30) + u * u * tip[0]; const y = (1 - u) * (1 - u) * 62 + 2 * (1 - u) * u * 100 + u * u * tip[1]; circle(g, x, y - 1, 1.6 - u); g.fill(); }
  }
  if (kraken) mir((s) => horn(g, [50 + s * 20, 60], [50 + s * 58, 40], [50 + s * 36, 4], 12, c.skin, 0, 1.6, 0.05));
  // mantle
  blob(g, [[50, 4], [74, 12], [80, 36], [72, 58], [50, 68], [28, 58], [20, 36], [26, 12]]);
  paint(g, domeFill(g, 44, 24, 40, c.skin, 0.35), INK, LW);
  g.fillStyle = alpha(shade(c.skin, -0.35), 0.6);
  for (let i = 0; i < 12; i++) { circle(g, 30 + r() * 40, 10 + r() * 30, 1 + r() * 2.2); g.fill(); }
  if (kraken) { g.fillStyle = '#d8d0b8'; for (let i = 0; i < 6; i++) { circle(g, 30 + r() * 40, 12 + r() * 24, 1.6 + r()); g.fill(); } }
  eyes(g, 50, 46, 15, kraken ? 7 : 6, kraken ? 6 : 5, c.eye, { pupil: 'goat', glow: kraken, brow: kraken ? 0.5 : -0.2, lid: shade(c.skin, -0.15) });
  if (kraken) {
    // beak in the middle
    shape(g, [[44, 58], [56, 58], [54, 68], [50, 76], [46, 68]], '#2a2420', 50, 64, 10, 1.6, 0.5);
  } else stroke(g, [[46, 60], [50, 62], [54, 60]], INK, 1.1);
}
function drawOrca(g: G, c: Colors, r: Rand, f: Flags) {
  poly(g, [[40, 34], [52, -4], [62, 34]]); paint(g, domeFill(g, 50, 14, 20, c.dark, 0.3), INK, LW);
  mir((s) => { blob(g, [[50 + s * 30, 72], [50 + s * 56, 84], [50 + s * 48, 98], [50 + s * 22, 88]]); paint(g, domeFill(g, 50 + s * 38, 84, 16, c.dark, 0.3), INK, LW); });
  shape(g, [[50, 20], [76, 28], [88, 52], [80, 78], [50, 92], [20, 78], [12, 52], [24, 28]], c.dark, 44, 40, 40);
  shape(g, [[22, 66], [50, 62], [78, 66], [70, 84], [50, 92], [30, 84]], c.light, 48, 74, 26, 1.6);
  mir((s) => { ellipse(g, 50 + s * 20, 42, 9, 5.5, -s * 0.35); paint(g, domeFill(g, 50 + s * 20, 41, 9, c.light, 0.25), INK, 1.4); });
  ellipse(g, 50, 30, 14, 5); g.fillStyle = alpha(c.light, 0.25); g.fill();
  g.beginPath(); g.moveTo(26, 64); g.quadraticCurveTo(50, 74, 74, 64); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  for (let i = 0; i < 6; i++) { const t = i / 5; fang(g, 31 + t * 38, 66 + Math.sin(t * Math.PI) * 4, 3, 2.4, '#f6f1e2', 1, 0.6); }
  mir((s) => { circle(g, 50 + s * 18, 50, 2.6); paint(g, '#0c0c10', null); });
}
function drawElephant(g: G, c: Colors, r: Rand, f: Flags, mammoth: boolean) {
  // ears
  if (!mammoth) mir((s) => { blob(g, [[50 + s * 20, 26], [50 + s * 46, 14], [50 + s * 52, 44], [50 + s * 44, 74], [50 + s * 26, 66]]); paint(g, domeFill(g, 50 + s * 38, 40, 28, shade(c.skin, -0.06), 0.3), INK, LW); blob(g, [[50 + s * 26, 32], [50 + s * 42, 24], [50 + s * 46, 46], [50 + s * 40, 64], [50 + s * 30, 58]]); paint(g, alpha(c.inner, 0.6), null); });
  bust(g, c.skin, 64, 46);
  if (mammoth) spiky(g, 50, 72, 30, 50, 12, c.fur, r, Math.PI * 0.85, Math.PI * 2.15, 2);
  if (mammoth) mir((s) => { ellipse(g, 50 + s * 30, 42, 7, 9); paint(g, domeFill(g, 50 + s * 30, 42, 9, c.fur, 0.3), INK, 1.6); });
  face(g, mammoth ? 10 : 18, 70, mammoth ? 22 : 22, 26, 18, mammoth ? c.fur : c.skin, 0.4);
  if (mammoth) strokes(g, r, 28, 12, 44, 50, alpha(shade(c.fur, -0.45), 0.7), 26, 5);
  else { g.strokeStyle = alpha(shade(c.skin, -0.45), 0.55); g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 4; i++) { g.moveTo(40, 26 + i * 4); g.quadraticCurveTo(50, 24 + i * 4, 60, 26 + i * 4); } g.stroke(); }
  // tusks
  mir((s) => {
    if (mammoth) horn(g, [50 + s * 10, 64], [50 + s * 40, 96], [50 + s * 26, 54], 9, c.tusk, 0, 1.6, 0.1);
    else horn(g, [50 + s * 10, 64], [50 + s * 22, 84], [50 + s * 28, 74], 7, c.tusk, 0, 1.4, 0.1);
  });
  // trunk
  horn(g, [50, 52], [50, 84], [58, 100], 18, mammoth ? shade(c.fur, -0.05) : c.skin, 0, LW, 0.6);
  g.strokeStyle = alpha(shade(c.skin, -0.5), 0.6); g.lineWidth = 1; g.beginPath();
  for (let i = 0; i < 5; i++) { const y = 66 + i * 6; g.moveTo(44 + i * 0.6, y); g.quadraticCurveTo(50, y + 2, 56 + i * 0.6, y); }
  g.stroke();
  eyes(g, 50, 44, 16, 3, 2.8, '#2a1a12', { pupil: 'bead', brow: -0.2, lid: shade(mammoth ? c.fur : c.skin, -0.2), s: 1 });
  if (f.scar) scar(g, 30, 30, 36, 50);
}
function drawRhino(g: G, c: Colors, r: Rand, f: Flags) {
  bust(g, c.skin, 62, 48);
  ears(g, 'long', 22, 24, 16, c.skin, c.inner, 0.15);
  face(g, 20, 92, 22, 27, 20, c.skin, 0.45);
  g.strokeStyle = alpha(shade(c.skin, -0.5), 0.6); g.lineWidth = 1.2; g.beginPath();
  mir((s) => { g.moveTo(50 + s * 24, 40); g.quadraticCurveTo(50 + s * 18, 54, 50 + s * 24, 70); });
  g.stroke();
  speckle2(g, r, 30, 30, 40, 40, alpha(shade(c.skin, -0.35), 0.5), 18);
  ellipse(g, 50, 80, 16, 10); paint(g, domeFill(g, 48, 78, 16, shade(c.skin, 0.06), 0.3), INK, 1.6);
  nostrils(g, 50, 82, 9, 2.4, 1.6, 0.6);
  stroke(g, [[40, 90], [50, 91], [60, 90]], INK, 1.2);
  horn(g, [50, 52], [50, 40], [50, 28], 10, c.horn, 2, 1.6, 0.08);
  horn(g, [50, 78], [50, 56], [52, 30], 18, c.horn, 3, 1.8, 0.06);
  eyes(g, 50, 46, 20, 2.8, 2.6, '#1e140e', { pupil: 'bead' });
  if (f.scar) scar(g, 30, 46, 36, 64);
}
function speckle2(g: G, r: Rand, x: number, y: number, w: number, h: number, col: string, n: number) {
  g.fillStyle = col;
  for (let i = 0; i < n; i++) { circle(g, x + r() * w, y + r() * h, 0.8 + r()); g.fill(); }
}
function drawLizard(g: G, c: Colors, r: Rand, f: Flags) {
  for (let i = -3; i <= 3; i++) spike(g, 50 + i * 7, 28 + Math.abs(i) * 4, -Math.PI / 2 + i * 0.3, 10 - Math.abs(i) * 1.5, 6, c.crest, 1.2);
  bust(g, c.scale, 70, 42);
  scaleTex(g, r, 14, 72, 72, 26, alpha(shade(c.scale, -0.45), 0.55), 16, 3);
  // dewlap
  blob(g, [[40, 70], [60, 70], [58, 88], [50, 96], [42, 88]]); paint(g, domeFill(g, 48, 80, 14, c.dewlap, 0.35), INK, 1.8);
  shape(g, [[50, 26], [72, 32], [80, 48], [72, 66], [50, 74], [28, 66], [20, 48], [28, 32]], c.scale, 44, 44, 32);
  scaleTex(g, r, 28, 30, 44, 34, alpha(shade(c.scale, -0.45), 0.55), 20, 2.4);
  shape(g, [[38, 52], [62, 52], [64, 66], [50, 74], [36, 66]], shade(c.scale, 0.1), 46, 58, 16, 1.6);
  nostrils(g, 50, 60, 5, 1.6, 1, 0.3);
  g.beginPath(); g.moveTo(32, 64); g.quadraticCurveTo(50, 74, 68, 64); g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke();
  eyes(g, 50, 42, 19, 4.8, 4.2, c.eye, { pupil: 'round', pr: 0.35, brow: 0.3, lid: shade(c.scale, -0.15) });
  if (f.scar) scar(g, 56, 30, 62, 50);
}
function drawCrab(g: G, c: Colors, r: Rand, f: Flags) {
  // claws raised at the sides
  mir((s) => {
    const P = (x: number, y: number) => [50 + s * (x - 50), y];
    leg(g, [P(70, 66), P(86, 58), P(86, 42)], 7, c.shell);
    blob(g, [P(76, 46), P(84, 18), P(98, 14), P(100, 36), P(92, 50)]); paint(g, domeFill(g, 50 + s * 38, 30, 16, c.shell, 0.35), INK, LW);
    blob(g, [P(80, 30), P(78, 10), P(86, 6), P(88, 22)]); paint(g, domeFill(g, 50 + s * 32, 16, 10, shade(c.shell, 0.15), 0.35), INK, 1.8);
    for (let i = 0; i < 3; i++) leg(g, [P(70, 78 + i * 6), P(90, 74 + i * 9), P(100, 90 + i * 8)], 3.6, shade(c.shell, -0.1));
  });
  // carapace
  const pts: number[][] = [];
  for (let i = 0; i < 14; i++) { const a = Math.PI + (i / 13) * Math.PI; pts.push([50 + Math.cos(a) * 34, 74 + Math.sin(a) * 30 * (i % 2 ? 1.04 : 0.96)]); }
  pts.push([78, 86], [50, 96], [22, 86]);
  blob(g, pts); paint(g, domeFill(g, 44, 58, 36, c.shell, 0.35), INK, LW);
  speckle2(g, r, 24, 50, 52, 30, alpha(shade(c.shell, 0.35), 0.6), 12);
  // eye stalks
  mir((s) => { stroke(g, [[50 + s * 7, 56], [50 + s * 10, 40]], INK, 4); stroke(g, [[50 + s * 7, 56], [50 + s * 10, 40]], c.shell, 2.2); });
  eyes(g, 50, 38, 10, 3.6, 3.6, '#121212', { pupil: 'bead' });
  // mouthparts
  for (let i = -1; i <= 1; i++) { blob(g, [[50 + i * 5 - 2, 72], [50 + i * 5 + 2, 72], [50 + i * 5 + 1.6, 82], [50 + i * 5 - 1.6, 82]]); paint(g, shade(c.shell, -0.2), INK, 1); }
  if (f.scar) scar(g, 34, 56, 42, 70);
}

// ===================================================================================================
// Definitions
// ===================================================================================================
type DrawFn = (g: G, c: Colors, r: Rand, f: Flags) => void;
const V = (name: string, c: Colors = {}, f?: Flags): Variant => (f ? { name, c, f } : { name, c });
function mk(id: string, name: string, family: CreatureDef['family'], size: CreatureSize, cr: string | undefined, tags: string[], c: Colors, variants: Variant[], fn: DrawFn, srd?: string): CreatureDef {
  const d: CreatureDef = { id, name, family, size, tags, c, variants, draw: ({ g, c: cc, f, seed }) => fn(g, cc, rng(seed), f) };
  if (cr) d.cr = cr;
  if (srd) d.srd = srd;
  return d;
}
const BEAR_C = { fur: '#6b4a2e', muzzle: '#a98262', inner: '#3a2618', eye: '#1a120c' };
const HORSE_C = { coat: '#7a4a2a', mane: '#2a1a12', muzzle: '#4a3428', blaze: '#f1ece2', inner: '#3a2618', cloth: '#a3312c', trim: '#e2b84a', metal: '#b9c0c8', plume: '#e6e0d2' };
const HORSE_V = [V('Bay'), V('Chestnut', { coat: '#a0522d', mane: '#7a3a1a', muzzle: '#6a3a24' }), V('Black', { coat: '#2b2624', mane: '#141110', muzzle: '#3a3330', blaze: 'none' }), V('Grey', { coat: '#b8b4ae', mane: '#6e6a66', muzzle: '#5a5552', blaze: 'none' }), V('Palomino', { coat: '#d9b06a', mane: '#f4ead2', muzzle: '#8a6a4a' })];

const BEASTS: CreatureDef[] = [
  mk('giant-rat', 'Giant Rat', 'beast', 'Small', '1/8', ['rat', 'rodent', 'sewer', 'vermin', 'dungeon'], { fur: '#6e6258', belly: '#a99c8c', inner: '#d88a92', nose: '#e59aa2', eye: '#c0262a' },
    [V('Brown'), V('Grey', { fur: '#7d7e82', belly: '#b4b4b8' }), V('Black', { fur: '#2e2a2a', belly: '#5a5452', eye: '#ff4a3a' }), V('Plague', { fur: '#6c6a4a', belly: '#9a9870', eye: '#b8f03c' }, { mange: 1, angry: 1 })], (g, c, r, f) => drawRat(g, c, r, f), 'giantRat'),
  mk('rat-swarm', 'Swarm of Rats', 'beast', 'Medium', '1/4', ['rat', 'swarm', 'sewer', 'vermin', 'rodent'], { fur: '#6e6258', belly: '#a99c8c', inner: '#d88a92', nose: '#e59aa2', eye: '#c0262a' },
    [V('Brown'), V('Grey', { fur: '#7d7e82', belly: '#b4b4b8' }), V('Black', { fur: '#2e2a2a', belly: '#5a5452', eye: '#ff4a3a' })], (g, c, r) => drawRatSwarm(g, c, r)),
  mk('bat', 'Bat', 'beast', 'Tiny', '0', ['bat', 'cave', 'night', 'flying'], { fur: '#5a4636', wing: '#3a2c26', inner: '#c98a84', eye: '#141010' },
    [V('Brown'), V('Black', { fur: '#2a2426', wing: '#1c1819' }), V('Pale', { fur: '#b8aa98', wing: '#8a7a6a', eye: '#c0262a' })], (g, c, r, f) => drawBat(g, c, r, f, false)),
  mk('giant-bat', 'Giant Bat', 'beast', 'Large', '1/4', ['bat', 'cave', 'night', 'flying', 'giant'], { fur: '#4a3a30', wing: '#2e2420', inner: '#b8726c', eye: '#d63a2a' },
    [V('Brown'), V('Black', { fur: '#221d1e', wing: '#151213' }), V('Grey', { fur: '#6a6466', wing: '#433e40' }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawBat(g, c, r, f, true)),
  mk('dire-wolf', 'Dire Wolf', 'beast', 'Large', '1', ['wolf', 'canine', 'pack', 'forest', 'winter'], { fur: '#5e564c', belly: '#b3a894', ruff: '#4a433b', eye: '#f2c14e' },
    [V('Grey'), V('Black', { fur: '#2a2725', belly: '#55504a', ruff: '#1c1a19' }), V('White', { fur: '#cfcac0', belly: '#efebe2', ruff: '#b0aaa0', eye: '#7cc6e8' }), V('Brown', { fur: '#6e4c30', belly: '#b89068', ruff: '#56391f' })], (g, c, r, f) => drawWolfish(g, c, r, f, { ruff: true, heavy: true }), 'direWolf'),
  mk('brown-bear', 'Brown Bear', 'beast', 'Large', '1', ['bear', 'forest', 'mountain'], BEAR_C,
    [V('Brown'), V('Grizzly', { fur: '#7d6248', muzzle: '#b8a084' }), V('Cinnamon', { fur: '#8a5130', muzzle: '#c08a64' }), V('Roaring', {}, { roar: 1 }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawBear(g, c, r, f, false)),
  mk('black-bear', 'Black Bear', 'beast', 'Medium', '1/2', ['bear', 'forest'], { ...BEAR_C, fur: '#252222', muzzle: '#a8876a', inner: '#141212' },
    [V('Black'), V('Chocolate', { fur: '#3d2a20', muzzle: '#a8876a' }), V('Roaring', {}, { roar: 1 })], (g, c, r, f) => drawBear(g, c, r, f, false)),
  mk('polar-bear', 'Polar Bear', 'beast', 'Large', '2', ['bear', 'winter', 'arctic', 'ice', 'snow'], { fur: '#eeeae0', muzzle: '#f6f3ea', inner: '#b8b0a0', eye: '#141010' },
    [V('White'), V('Cream', { fur: '#e6dcc4', muzzle: '#f0e8d4' }), V('Roaring', {}, { roar: 1 }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawBear(g, c, r, f, true)),
  mk('boar', 'Boar', 'beast', 'Medium', '1/4', ['boar', 'pig', 'forest', 'swine', 'hunt'], { fur: '#5a4234', bristle: '#2e221c', snout: '#b88a7a', inner: '#8a5a4e', tusk: '#f1e6c8', eye: '#1a1010' },
    [V('Brown'), V('Black', { fur: '#2e2826', bristle: '#151212', snout: '#7a6660' }), V('Russet', { fur: '#7a4a2a', bristle: '#4a2a14' })], (g, c, r, f) => drawBoar(g, c, r, f, false)),
  mk('giant-boar', 'Giant Boar', 'beast', 'Large', '2', ['boar', 'pig', 'forest', 'giant', 'swine'], { fur: '#4a3628', bristle: '#221a14', snout: '#a87a6a', inner: '#7a4a3e', tusk: '#f1e6c8', eye: '#c0262a' },
    [V('Brown'), V('Black', { fur: '#26201e', bristle: '#100d0c', snout: '#6a5a54' }), V('Grey', { fur: '#5e5a56', bristle: '#2e2c2a' })], (g, c, r, f) => drawBoar(g, c, r, f, true)),
  mk('panther', 'Panther', 'beast', 'Medium', '1/4', ['cat', 'big cat', 'jungle', 'forest', 'leopard'], { fur: '#2a2628', muzzle: '#3e383a', inner: '#141213', nose: '#3a3234', eye: '#b8e04a', stripe: '#141213' },
    [V('Black'), V('Leopard', { fur: '#d0a050', muzzle: '#f0dcb4', inner: '#6a4a2a', nose: '#c9707a', eye: '#e8b84a', stripe: '#2a1e14' }, { spots: 1 }), V('Snow leopard', { fur: '#d8d4cc', muzzle: '#f4f2ee', inner: '#8a8682', nose: '#c9a0a0', eye: '#8ad0e0', stripe: '#3a3634' }, { spots: 1 }), V('Puma', { fur: '#b08a5e', muzzle: '#eadcc4', inner: '#5a4030', nose: '#c9807a', eye: '#d8b040' })],
    (g, c, r, f) => drawCat(g, c, r, f, { spots: !!f.spots })),
  mk('lion', 'Lion', 'beast', 'Large', '1', ['cat', 'big cat', 'savanna', 'mane'], { fur: '#c9964e', mane: '#8a5426', muzzle: '#f0dfbe', inner: '#6a4a2a', nose: '#b8705a', eye: '#e3a83a' },
    [V('Golden'), V('Dark mane', { mane: '#3e2414' }), V('White', { fur: '#e8e0cc', mane: '#c8b8a0', muzzle: '#faf6ec', eye: '#7cc0d8' }), V('Lioness', {}, { nomane: 1 }), V('Scarred', {}, { scar: 1 })],
    (g, c, r, f) => drawCat(g, c, r, f, { mane: !f.nomane })),
  mk('tiger', 'Tiger', 'beast', 'Large', '1', ['cat', 'big cat', 'jungle', 'stripes'], { fur: '#d9822b', muzzle: '#f6ecde', inner: '#3a2414', nose: '#c86a5a', eye: '#e8c040', stripe: '#1e140e' },
    [V('Orange'), V('White', { fur: '#ebe6dc', muzzle: '#ffffff', nose: '#d89a9a', eye: '#6ab0e0', stripe: '#2a2624' }), V('Golden', { fur: '#e6b45a', stripe: '#a0602a' }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawCat(g, c, r, f, { stripes: true })),
  mk('saber-toothed-tiger', 'Saber-Toothed Tiger', 'beast', 'Large', '2', ['cat', 'big cat', 'prehistoric', 'winter', 'smilodon'], { fur: '#b88a52', muzzle: '#efe0c4', inner: '#4a3220', nose: '#8a5a4a', eye: '#e8b84a', stripe: '#6a4a2a' },
    [V('Tawny'), V('Spotted', {}, { spots: 1 }), V('Snow', { fur: '#d8d2c4', muzzle: '#f6f2ea', stripe: '#8a8478', eye: '#8ad0e0' }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawCat(g, c, r, f, { sabre: true, spots: !!f.spots })),
  mk('cat', 'Cat', 'beast', 'Tiny', '0', ['cat', 'pet', 'familiar', 'town', 'witch'], { fur: '#e08a3a', muzzle: '#f6e6d2', inner: '#e8a0a0', nose: '#e88a94', eye: '#8ad04a', stripe: '#a0521e' },
    [V('Ginger'), V('Black', { fur: '#232022', muzzle: '#3a3638', inner: '#5a4a4a', eye: '#f0c838' }), V('Grey tabby', { fur: '#8a8a88', muzzle: '#e6e4e0', stripe: '#4a4a4a', eye: '#6ac0a0' }, { tabby: 1 }), V('White', { fur: '#f0ece6', muzzle: '#ffffff', eye: '#5ab0f0' }), V('Ginger tabby', {}, { tabby: 1 })],
    (g, c, r, f) => drawCat(g, c, r, f, { domestic: true, stripes: !!f.tabby })),
  mk('ape', 'Ape', 'beast', 'Medium', '1/2', ['ape', 'gorilla', 'jungle', 'primate'], { fur: '#2c2826', skin: '#4a3e3a', eye: '#3a2214' },
    [V('Black'), V('Silverback', { fur: '#4a4846' }), V('Red', { fur: '#8a4a28', skin: '#6a4a3e' }), V('Roaring', {}, { roar: 1 })], (g, c, r, f) => drawApe(g, c, r, f, {})),
  mk('giant-ape', 'Giant Ape', 'beast', 'Huge', '7', ['ape', 'gorilla', 'giant', 'jungle', 'primate'], { fur: '#262220', skin: '#3e3430', eye: '#c0262a' },
    [V('Black'), V('Silverback', { fur: '#55524e' }), V('Red', { fur: '#7a3e20', skin: '#5a3e34' }), V('Roaring', {}, { roar: 1 })], (g, c, r, f) => drawApe(g, c, r, f, { giant: true })),
  mk('elk', 'Elk', 'beast', 'Large', '1/4', ['elk', 'deer', 'antlers', 'forest', 'hunt'], { fur: '#8a5a36', mane: '#4a3020', belly: '#d8c0a0', inner: '#3a2618', antler: '#e6d8b8' },
    [V('Bull'), V('Dark', { fur: '#5e3e26', mane: '#2e1e14' }), V('Cow', {}, { doe: 1 }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawDeer(g, c, r, f, 'elk')),
  mk('deer', 'Deer', 'beast', 'Medium', '0', ['deer', 'stag', 'doe', 'forest', 'hunt'], { fur: '#b07a48', mane: '#7a5030', belly: '#f0e2cc', inner: '#5a3a24', antler: '#eadcbc' },
    [V('Stag'), V('Doe', {}, { doe: 1 }), V('White stag', { fur: '#efeae0', belly: '#ffffff', inner: '#c8b8a8', antler: '#f6e8b0' }), V('Red deer', { fur: '#8a4a2a' })], (g, c, r, f) => drawDeer(g, c, r, f, 'deer')),
  mk('draft-horse', 'Draft Horse', 'beast', 'Large', '1/4', ['horse', 'farm', 'cart', 'mount'], HORSE_C, HORSE_V, (g, c, r, f) => drawHorse(g, c, r, f, 'draft')),
  mk('riding-horse', 'Riding Horse', 'beast', 'Large', '1/4', ['horse', 'mount', 'travel', 'steed'], HORSE_C, HORSE_V, (g, c, r, f) => drawHorse(g, c, r, f, 'riding')),
  mk('warhorse', 'Warhorse', 'beast', 'Large', '1/2', ['horse', 'mount', 'knight', 'barding', 'castle', 'steed'], HORSE_C,
    [V('Red barding'), V('Blue barding', { cloth: '#2f5d8a', trim: '#e6e0d2' }), V('Black barding', { coat: '#2b2624', mane: '#141110', blaze: 'none', cloth: '#2b2b30', trim: '#a8743c', plume: '#a3312c' }), V('White horse', { coat: '#e6e2dc', mane: '#c8c4be', muzzle: '#8a8480', blaze: 'none', cloth: '#5d3a78' })],
    (g, c, r, f) => drawHorse(g, c, r, f, 'war')),
  mk('pony', 'Pony', 'beast', 'Medium', '1/8', ['horse', 'pony', 'mount', 'farm'], { ...HORSE_C, coat: '#9a6a44', mane: '#e8dcc4' }, [V('Dun'), ...HORSE_V.slice(1)], (g, c, r, f) => drawHorse(g, c, r, f, 'pony')),
  mk('mule', 'Mule', 'beast', 'Medium', '1/8', ['mule', 'donkey', 'pack animal', 'farm', 'mine'], { ...HORSE_C, coat: '#6e5a4a', muzzle: '#c8b8a4', blaze: 'none' },
    [V('Brown'), V('Grey', { coat: '#8a8682', muzzle: '#d8d4cc' }), V('Dark', { coat: '#3e3430', muzzle: '#a8988a' })], (g, c, r, f) => drawHorse(g, c, r, f, 'mule')),
  mk('camel', 'Camel', 'beast', 'Large', '1/8', ['camel', 'desert', 'mount', 'caravan'], { coat: '#c8a06a', muzzle: '#d8bc8e', inner: '#6a4a2a' },
    [V('Dromedary'), V('Bactrian', { coat: '#a07a4a', muzzle: '#c0a07a' }, { twohump: 1 }), V('White', { coat: '#e6dcc8', muzzle: '#f0e8d8' })], (g, c, r, f) => drawCamel(g, c, r, f)),
  mk('mastiff', 'Mastiff', 'beast', 'Medium', '1/8', ['dog', 'hound', 'guard dog', 'town', 'castle'], { fur: '#b08a5a', muzzle: '#3a2e28', inner: '#5a4030', eye: '#4a2a14', collar: '#5a3a24' },
    [V('Fawn'), V('Brindle', { fur: '#6a4a30' }), V('Black', { fur: '#2a2624', muzzle: '#1a1716', eye: '#a06030' }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawMastiff(g, c, r, f)),
  mk('hawk', 'Hawk', 'beast', 'Tiny', '0', ['bird', 'hawk', 'falcon', 'flying', 'familiar'], { body: '#7a5236', head: '#8a6040', throat: '#efe2c8', beak: '#3a3a3e', cere: '#e8c440', eye: '#f0a020' },
    [V('Red-tail'), V('Falcon', { body: '#4e5660', head: '#5a626c', throat: '#f2ece2' }), V('Blood hawk', { body: '#8a2a22', head: '#a03028', throat: '#e8a090', eye: '#f04a2a' })], (g, c, r, f) => drawBird(g, c, r, f, { beak: 'hook', stripe: true })),
  mk('eagle', 'Eagle', 'beast', 'Small', '0', ['bird', 'eagle', 'flying', 'mountain'], { body: '#4a3020', head: '#f2efe8', beak: '#e8b830', eye: '#f2c430' },
    [V('White-headed'), V('Golden', { head: '#9a6a30', body: '#5a3a1e' }), V('Sea eagle', { head: '#c8c4bc', body: '#5a5048' })], (g, c, r, f) => drawBird(g, c, r, f, { beak: 'hook' })),
  mk('giant-eagle', 'Giant Eagle', 'beast', 'Large', '1', ['bird', 'eagle', 'flying', 'mountain', 'mount', 'giant'], { body: '#5a3a1e', head: '#c08a40', beak: '#f0c040', eye: '#f2c430', wing: '#4a2e18' },
    [V('Golden'), V('White-headed', { head: '#f2efe8', body: '#4a3020' }), V('Storm', { head: '#9aa4ae', body: '#3e4650', wing: '#2e343c', eye: '#7fd3ff' }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawBird(g, c, r, f, { beak: 'hook', wings: true, crest: false })),
  mk('owl', 'Owl', 'beast', 'Tiny', '0', ['bird', 'owl', 'night', 'familiar', 'forest', 'wizard'], { body: '#8a6a4a', head: '#9a7a56', disc: '#d8c4a0', beak: '#3a3430', eye: '#f0a020' },
    [V('Brown'), V('Barn', { body: '#c8a070', head: '#d8b484', disc: '#fbf6ec', eye: '#1a1414' }), V('Snowy', { body: '#eeeae2', head: '#f6f2ec', disc: '#ffffff', eye: '#f2c430' })], (g, c, r, f) => drawBird(g, c, r, f, { beak: 'owl', disc: true, tufts: true, eyeR: 6.4 })),
  mk('giant-owl', 'Giant Owl', 'beast', 'Large', '1/4', ['bird', 'owl', 'night', 'forest', 'giant', 'mount'], { body: '#6a4e36', head: '#7a5a3e', disc: '#cdb48c', beak: '#2e2824', eye: '#f07a1a', wing: '#5a4030' },
    [V('Brown'), V('Barn', { body: '#c8a070', head: '#d8b484', disc: '#fbf6ec', eye: '#1a1414', wing: '#a88050' }), V('Snowy', { body: '#eeeae2', head: '#f6f2ec', disc: '#ffffff', eye: '#f2c430', wing: '#d8d2c8' }), V('Grey', { body: '#6a6866', head: '#7a7876', disc: '#c8c4c0', wing: '#555352' })],
    (g, c, r, f) => drawBird(g, c, r, f, { beak: 'owl', disc: true, tufts: true, eyeR: 6.4, wings: true })),
  mk('raven', 'Raven', 'beast', 'Tiny', '0', ['bird', 'raven', 'crow', 'familiar', 'crypt', 'witch'], { body: '#1e1e26', head: '#24242e', ruff: '#1a1a22', beak: '#2e2e36', eye: '#14141a' },
    [V('Black'), V('Grey crow', { body: '#5a5a60', head: '#26262c' }), V('White', { body: '#eeeae4', head: '#f6f2ec', ruff: '#d8d4ce', beak: '#c8a8a0', eye: '#c0262a' })], (g, c, r, f) => drawBird(g, c, r, f, { beak: 'straight', ruff: true })),
  mk('vulture', 'Vulture', 'beast', 'Medium', '0', ['bird', 'vulture', 'desert', 'carrion', 'flying'], { body: '#3a2e28', head: '#c86a5a', ruff: '#efe6d8', beak: '#d8c8a0', eye: '#2a1810' },
    [V('Red-headed'), V('Pale-headed', { head: '#d8b0a0' }), V('Black', { head: '#5a5450', body: '#1e1a18', ruff: '#4a4440' })], (g, c, r, f) => drawBird(g, c, r, f, { beak: 'hook', bald: true, ruff: true })),
  mk('giant-spider', 'Giant Spider', 'beast', 'Large', '1', ['spider', 'web', 'cave', 'forest', 'dungeon', 'poison'], { body: '#3a2e2a', band: '#8a5a3a', mark: '#c0262a', fang: '#e8dcc0', eye: '#e04a3a' },
    [V('Dark'), V('Banded', { body: '#5a4430', band: '#d8b06a', mark: 'none', eye: '#1a1414' }), V('Pale cave', { body: '#c8c0b0', band: '#8a8070', mark: '#5a4a3a', eye: '#c0262a' }), V('Jungle', { body: '#2e4a2a', band: '#e8c040', mark: '#e8c040', eye: '#f2e040' })], (g, c, r, f) => drawSpider(g, c, r, f), 'giantSpider'),
  mk('spider', 'Spider', 'beast', 'Tiny', '0', ['spider', 'vermin', 'familiar', 'web'], { body: '#6a5444', band: '#c8a070', mark: 'none', fang: '#e8dcc0', eye: '#1a1414' },
    [V('Brown'), V('Black widow', { body: '#1e1a1e', band: '#2e2a2e', mark: '#d0262a', eye: '#3a3a3a' }), V('Jumping', { body: '#3a3a3a', band: '#f0f0f0', mark: '#f0a020', eye: '#2a4a2a' })], (g, c, r, f) => drawSpider(g, c, r, f)),
  mk('giant-scorpion', 'Giant Scorpion', 'beast', 'Large', '3', ['scorpion', 'desert', 'poison', 'cave'], { shell: '#8a5a2a', sting: '#c0402a', eye: '#141010' },
    [V('Sand'), V('Black', { shell: '#2e2a2e', sting: '#7a1a1a', eye: '#d63a2a' }), V('Red', { shell: '#a0402a', sting: '#3a1a14' }), V('Pale', { shell: '#d8c8a0', sting: '#8a6a3a' })], (g, c, r, f) => drawScorpion(g, c, r, f)),
  mk('giant-centipede', 'Giant Centipede', 'beast', 'Small', '1/4', ['centipede', 'vermin', 'cave', 'sewer', 'poison'], { shell: '#8a3a1e', leg: '#e0a040', fang: '#2a1a14', eye: '#141010' },
    [V('Red'), V('Black', { shell: '#2a2628', leg: '#e0c040' }), V('Blue', { shell: '#2a4a7a', leg: '#e8a040' })], (g, c, r, f) => drawCentipede(g, c, r, f)),
  mk('giant-wasp', 'Giant Wasp', 'beast', 'Medium', '1/2', ['wasp', 'insect', 'flying', 'poison', 'forest'], { body: '#e8b820', stripe: '#1e1a18', eye: '#3a2a20' },
    [V('Yellow'), V('Red hornet', { body: '#b8401e', eye: '#2a1a14' }), V('Blue', { body: '#3a6ad8', eye: '#14141e' })], (g, c, r, f) => drawWasp(g, c, r, f)),
  mk('giant-frog', 'Giant Frog', 'beast', 'Medium', '1/4', ['frog', 'swamp', 'amphibian'], { skin: '#5a9a3a', belly: '#e0e0a0', spot: '#2e5a1e', eye: '#e8c040' },
    [V('Green'), V('Poison red', { skin: '#d03a2a', belly: '#f0b0a0', spot: '#1e1a1a', eye: '#1a1414' }), V('Blue', { skin: '#2a6ad0', belly: '#a0c8f0', spot: '#14203a', eye: '#1a1414' }), V('Tongue out', {}, { tongue: 1 })], (g, c, r, f) => drawFrog(g, c, r, f, false)),
  mk('giant-toad', 'Giant Toad', 'beast', 'Large', '1', ['toad', 'swamp', 'amphibian', 'giant'], { skin: '#7a6a3a', belly: '#d8c89a', spot: '#4a3a1e', eye: '#e0a020' },
    [V('Brown'), V('Grey', { skin: '#6a6a62', belly: '#c8c4b4' }), V('Swamp green', { skin: '#4e6a3a', belly: '#c4cc9a' }), V('Tongue out', {}, { tongue: 1 })], (g, c, r, f) => drawFrog(g, c, r, f, true)),
  mk('snake', 'Poisonous Snake', 'beast', 'Tiny', '1/8', ['snake', 'viper', 'poison', 'serpent', 'swamp', 'desert'], { scale: '#6a7a3a', belly: '#d8d0a0', pattern: '#3a4a1e', eye: '#e8c040' },
    [V('Green viper'), V('Desert adder', { scale: '#c8a06a', belly: '#f0e4c8', pattern: '#7a5a2e' }), V('Coral', { scale: '#c8301e', belly: '#f0e040', pattern: '#1e1a1a' }), V('Black', { scale: '#2a2a2e', belly: '#6a6a70', pattern: '#4a4a52', eye: '#d63a2a' })], (g, c, r, f) => drawSnake(g, c, r, f, false)),
  mk('giant-constrictor-snake', 'Giant Constrictor Snake', 'beast', 'Huge', '2', ['snake', 'python', 'serpent', 'jungle', 'giant'], { scale: '#8a7a4a', belly: '#e8dcb4', pattern: '#4a3a1e', eye: '#e8a020' },
    [V('Python'), V('Green', { scale: '#3a7a3a', belly: '#c8e0a0', pattern: '#1e4a1e' }), V('Albino', { scale: '#f0e8d0', belly: '#ffffff', pattern: '#e8c060', eye: '#d63a2a' })], (g, c, r, f) => drawSnake(g, c, r, f, true)),
  mk('crocodile', 'Crocodile', 'beast', 'Large', '1/2', ['crocodile', 'alligator', 'swamp', 'river', 'reptile'], { scale: '#4e5a32', eye: '#d8c040' },
    [V('Olive'), V('Dark', { scale: '#2e3428' }), V('Albino', { scale: '#e0dcc8', eye: '#d63a2a' })], (g, c, r, f) => drawCroc(g, c, r, f, false)),
  mk('giant-crocodile', 'Giant Crocodile', 'beast', 'Huge', '5', ['crocodile', 'swamp', 'river', 'reptile', 'giant'], { scale: '#3e4a2a', eye: '#f0a020' },
    [V('Olive'), V('Mud', { scale: '#5a4a32' }), V('Ancient black', { scale: '#22241e', eye: '#d63a2a' })], (g, c, r, f) => drawCroc(g, c, r, f, true)),
  mk('reef-shark', 'Reef Shark', 'beast', 'Medium', '1/2', ['shark', 'sea', 'water', 'ship', 'coast'], { skin: '#7a8a96', belly: '#eef0f0' },
    [V('Grey'), V('Blue', { skin: '#4a6a8a' }), V('Sand', { skin: '#a8a088' })], (g, c, r, f) => drawShark(g, c, r, f, false)),
  mk('shark', 'Hunter Shark', 'beast', 'Large', '2', ['shark', 'sea', 'water', 'ship'], { skin: '#5a6a78', belly: '#e8ecee' },
    [V('Grey'), V('Blue', { skin: '#2e4e6e' }), V('Tiger', { skin: '#7a7a62' }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawShark(g, c, r, f, false)),
  mk('giant-shark', 'Giant Shark', 'beast', 'Huge', '5', ['shark', 'sea', 'water', 'ship', 'giant'], { skin: '#46525e', belly: '#dfe4e6' },
    [V('Grey'), V('Deep blue', { skin: '#1e3450' }), V('Ghost white', { skin: '#c8ccd0', belly: '#f6f8f8' })], (g, c, r, f) => drawShark(g, c, r, f, true)),
  mk('octopus', 'Octopus', 'beast', 'Small', '0', ['octopus', 'sea', 'water', 'coast'], { skin: '#c0603a', sucker: '#f0c0a0', eye: '#e8c040' },
    [V('Red'), V('Purple', { skin: '#7a4a90', sucker: '#d8b8e8' }), V('Blue-ringed', { skin: '#d8b860', sucker: '#3a6ad8' })], (g, c, r, f) => drawOctopus(g, c, r, f, false)),
  mk('giant-octopus', 'Giant Octopus', 'beast', 'Large', '1', ['octopus', 'sea', 'water', 'giant', 'ship'], { skin: '#a8442a', sucker: '#f0b090', eye: '#e8c040' },
    [V('Red'), V('Purple', { skin: '#5e3a7a', sucker: '#c8a8e0' }), V('Abyssal', { skin: '#2a3a4a', sucker: '#7fd3ff', eye: '#7fd3ff' })], (g, c, r, f) => drawOctopus(g, c, r, f, false)),
  mk('killer-whale', 'Killer Whale', 'beast', 'Huge', '3', ['whale', 'orca', 'sea', 'water', 'ship'], { dark: '#1e2026', light: '#f2f2ee' },
    [V('Black and white'), V('Grey', { dark: '#4a4e56' })], (g, c, r, f) => drawOrca(g, c, r, f)),
  mk('elephant', 'Elephant', 'beast', 'Huge', '4', ['elephant', 'savanna', 'jungle', 'tusks', 'mount'], { skin: '#8a8682', inner: '#c89890', tusk: '#f2ead2' },
    [V('Grey'), V('Dusty', { skin: '#a08a72' }), V('War elephant', { skin: '#706c68' }, { scar: 1 })], (g, c, r, f) => drawElephant(g, c, r, f, false)),
  mk('mammoth', 'Mammoth', 'beast', 'Huge', '6', ['mammoth', 'elephant', 'winter', 'arctic', 'prehistoric', 'tusks'], { skin: '#5a4232', fur: '#7a4a2a', inner: '#a07060', tusk: '#f2ead2' },
    [V('Russet'), V('Dark', { fur: '#3e2a1e' }), V('Snow', { fur: '#d8d0c0' }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawElephant(g, c, r, f, true)),
  mk('rhinoceros', 'Rhinoceros', 'beast', 'Large', '2', ['rhino', 'rhinoceros', 'savanna', 'horn'], { skin: '#7e7a74', inner: '#5a5650', horn: '#cfc6b4' },
    [V('Grey'), V('Dusty', { skin: '#9a8a74' }), V('Woolly', { skin: '#7a5a3e' }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawRhino(g, c, r, f)),
  mk('giant-goat', 'Giant Goat', 'beast', 'Large', '1/2', ['goat', 'mountain', 'mount', 'horns', 'giant'], { fur: '#d8d0c0', beard: '#efe8dc', inner: '#9a8070', horn: '#8a7a64', eye: '#e8b840' },
    [V('White'), V('Brown', { fur: '#8a6a4a', beard: '#5a4430' }), V('Black', { fur: '#2e2a28', beard: '#4a4440', eye: '#e86a2a' }), V('Scarred', {}, { scar: 1 })], (g, c, r, f) => drawGoat(g, c, r, f)),
  mk('giant-lizard', 'Giant Lizard', 'beast', 'Large', '1/4', ['lizard', 'reptile', 'cave', 'desert', 'mount'], { scale: '#6a8a4a', crest: '#c8a040', dewlap: '#e86a3a', eye: '#e8c040' },
    [V('Green'), V('Desert', { scale: '#c8a06a', crest: '#8a5a2a', dewlap: '#e8c040' }), V('Cave', { scale: '#7a7a8a', crest: '#4a4a5a', dewlap: '#9a8ad0', eye: '#e8e8f0' }), V('Red', { scale: '#a0402a', crest: '#2a1a14', dewlap: '#f0c040' })], (g, c, r, f) => drawLizard(g, c, r, f)),
  mk('giant-crab', 'Giant Crab', 'beast', 'Medium', '1/8', ['crab', 'sea', 'coast', 'beach', 'shell'], { shell: '#c8502a' },
    [V('Red'), V('Blue', { shell: '#3a6a9a' }), V('Sand', { shell: '#c8a870' }), V('Purple', { shell: '#7a3a7a' })], (g, c, r, f) => drawCrab(g, c, r, f)),
];


// ===================================================================================================
// Monstrosities
// ===================================================================================================
/** A humanoid face for the human-headed monsters (manticore, harpy, medusa, lamia, sphinx, centaur). */
function humanFace(g: G, c: Colors, o: { top?: number; bot?: number; w?: number; ears?: 'point' | 'round' | 'none'; grin?: boolean; beard?: boolean; brow?: number; eyeCol?: string; glow?: boolean; smile?: boolean }) {
  const top = o.top ?? 24, bot = o.bot ?? 80, w = o.w ?? 19;
  if (o.ears !== 'none') mir((s) => {
    if (o.ears === 'point') { poly(g, [[50 + s * (w - 2), 46], [50 + s * (w + 12), 34], [50 + s * (w - 1), 58]]); paint(g, domeFill(g, 50 + s * (w + 4), 46, 10, c.skin, 0.3), INK, 1.6); }
    else { ellipse(g, 50 + s * w, 52, 4, 6.5); paint(g, domeFill(g, 50 + s * w, 52, 6, c.skin, 0.3), INK, 1.6); }
  });
  face(g, top, bot, w - 3, w, w * 0.55, c.skin, 0.42);
  if (o.beard) spiky(g, 50, 70, 10, 30, 8, c.hair, rng(7), Math.PI * 0.1, Math.PI * 0.9, 1.8);
  eyes(g, 50, top + (bot - top) * 0.4, w * 0.42, 3.6, 2.4, o.eyeCol ?? '#3a5a8a', { pupil: 'round', pr: 0.4, brow: o.brow ?? 0.3, lid: shade(c.skin, -0.2), glow: o.glow });
  const ny = top + (bot - top) * 0.62;
  stroke(g, [[50, ny - 8], [48, ny], [51.5, ny + 1]], alpha(INK, 0.75), 1.2);
  const my = top + (bot - top) * 0.78;
  if (o.grin) {
    blob(g, [[40, my - 2], [60, my - 2], [56, my + 4], [44, my + 4]]); paint(g, '#4a1414', INK, 1.3);
    for (let i = 0; i < 5; i++) fang(g, 42 + i * 4, my - 2, 3, 2.6, '#f3ead2', 1, 0.6);
  } else if (o.smile) curve(g, [43, my - 1], [50, my + 3], [57, my - 1], INK, 1.4);
  else curve(g, [44, my], [50, my + 1], [56, my], INK, 1.4);
}
function batWings(g: G, col: string, y0 = 0) {
  mir((s) => {
    const P = (x: number, y: number) => [50 + s * (x - 50), y + y0];
    poly(g, [P(60, 66), P(72, 26), P(92, 8), P(102, 28), P(94, 36), P(104, 50), P(94, 56), P(100, 72), P(80, 74)]);
    paint(g, domeFill(g, 50 + s * 34, 40 + y0, 36, col, 0.3), INK, 1.8);
    feathers(g, [P(92, 8), P(94, 36), P(92, 8), P(94, 56), P(90, 12), P(80, 74)], alpha(shade(col, 0.4), 0.8));
  });
}
function featherWings(g: G, col: string) {
  mir((s) => {
    const P = (x: number, y: number) => [50 + s * (x - 50), y];
    poly(g, [P(62, 66), P(70, 30), P(90, 12), P(104, 22), P(96, 32), P(104, 42), P(96, 50), P(102, 62), P(84, 76)]);
    paint(g, domeFill(g, 50 + s * 34, 40, 36, col, 0.3), INK, 1.8);
    feathers(g, [P(74, 40), P(96, 32), P(76, 50), P(96, 50), P(78, 60), P(96, 64)], alpha(shade(col, -0.5), 0.8));
  });
}
function drawOwlbear(g: G, c: Colors, r: Rand, f: Flags) {
  bust(g, c.fur, 60, 50);
  strokes(g, r, 6, 66, 88, 30, alpha(shade(c.fur, -0.45), 0.6), 18, 5);
  ears(g, 'round', 27, 22, 17, c.fur, c.inner);
  spiky(g, 50, 50, 26, 36, 14, c.feather, r, 0, Math.PI * 2, 2);
  mir((s) => { circle(g, 50 + s * 12, 46, 14); paint(g, domeFill(g, 50 + s * 12, 44, 14, c.disc, 0.25), alpha(INK, 0.7), 1.2); });
  scaleTex(g, r, 32, 26, 36, 12, alpha(shade(c.feather, -0.4), 0.5), 8, 2.6);
  eyes(g, 50, 46, 12, 6, 6, c.eye, { pupil: 'round', pr: 0.4, brow: 0.6, lid: shade(c.feather, -0.25) });
  shape(g, [[40, 52], [60, 52], [59, 62], [54, 74], [50, 84], [46, 74], [41, 62]], c.beak, 46, 60, 16, 2, 0.4);
  poly(g, [[46.5, 74], [53.5, 74], [50, 85]]); g.fillStyle = shade(c.beak, -0.5); g.fill();
  nostrils(g, 50, 58, 5, 1.4, 0.9, 0);
  if (f.scar) scar(g, 30, 30, 40, 54);
}
function drawMinotaur(g: G, c: Colors, r: Rand, f: Flags) {
  mir((s) => hornK(g, [50 + s * 16, 28], [50 + s * 46, 34], [50 + s * 44, 6], 1, 11, c.horn, 3, 1.8));
  bust(g, c.skin, 66, 50);
  // harness strap and buckle
  blob(g, [[16, 112], [24, 72], [32, 70], [28, 112]]); paint(g, c.leather, INK, 1.6);
  circle(g, 27, 84, 4); paint(g, domeFill(g, 27, 84, 4, '#c9a24a', 0.4), INK, 1.2);
  ears(g, 'long', 26, 38, 13, c.fur, c.inner, 1.1);
  face(g, 20, 88, 22, 26, 18, c.fur, 0.42);
  spiky(g, 50, 24, 4, 14, 6, shade(c.fur, -0.25), r, Math.PI * 0.15, Math.PI * 0.85, 1.4);
  strokes(g, r, 28, 26, 44, 30, alpha(shade(c.fur, -0.45), 0.6), 14, 4);
  ellipse(g, 50, 74, 16, 11); paint(g, domeFill(g, 48, 72, 16, c.muzzle, 0.3), INK, 1.8);
  nostrils(g, 50, 72, 7, 2.6, 1.8, 0.6);
  // nose ring
  g.beginPath(); g.arc(50, 79, 5, 0.1 * Math.PI, 0.9 * Math.PI); g.strokeStyle = INK; g.lineWidth = 3.6; g.stroke();
  g.strokeStyle = '#d8b44a'; g.lineWidth = 2; g.stroke();
  eyes(g, 50, 46, 14, 4.4, 3.2, c.eye, { pupil: 'small', brow: 0.7, lid: shade(c.fur, -0.3), glow: !!f.rage });
  if (f.scar) scar(g, 58, 34, 66, 58);
}
function drawMimic(g: G, c: Colors, r: Rand, f: Flags) {
  // chest base
  poly(g, [[12, 62], [88, 62], [90, 96], [10, 96]]); paint(g, litFill(g, 10, 62, 80, 34, c.wood), INK, LW);
  g.strokeStyle = alpha(shade(c.wood, -0.5), 0.6); g.lineWidth = 1; g.beginPath();
  for (const y of [72, 84]) { g.moveTo(14, y); g.lineTo(86, y); }
  g.stroke();
  // open lid as upper jaw
  poly(g, [[14, 40], [20, 10], [80, 10], [86, 40]]); paint(g, litFill(g, 14, 10, 72, 30, shade(c.wood, 0.08)), INK, LW);
  // mouth interior
  blob(g, [[14, 40], [86, 40], [86, 64], [50, 70], [14, 64]]); paint(g, '#4a0e14', INK, 1.8);
  ellipse(g, 50, 60, 22, 7); g.fillStyle = '#2a060a'; g.fill();
  // metal bands
  for (const x of [22, 78]) { poly(g, [[x - 4, 10], [x + 4, 10], [x + 4, 40], [x - 4, 40]]); paint(g, litFill(g, x - 4, 10, 8, 30, c.metal), INK, 1.4); poly(g, [[x - 4, 62], [x + 4, 62], [x + 4, 96], [x - 4, 96]]); paint(g, litFill(g, x - 4, 62, 8, 34, c.metal), INK, 1.4); }
  // teeth
  for (let i = 0; i < 9; i++) fang(g, 18 + i * 8, 40, 7 + (i % 2) * 3, 5.4, '#efe6cc', 1, 0.9);
  for (let i = 0; i < 8; i++) fang(g, 22 + i * 8, 63, 6 + (i % 2) * 2, 5, '#efe6cc', -1, 0.9);
  // tongue lolling out
  horn(g, [50, 58], [70, 74], [58, 100], 14, '#d0586a', 0, 1.8, 0.5);
  // eye on the lid
  eye(g, 50, 24, 7, 6, c.eye, { pupil: 'slit', glow: true });
  rr4(g, 46, 40, 8, 6, c.metal);
}
function drawBasilisk(g: G, c: Colors, r: Rand, f: Flags) {
  for (let i = -3; i <= 3; i++) spike(g, 50 + i * 8, 26 + Math.abs(i) * 3, -Math.PI / 2 + i * 0.32, 18 - Math.abs(i) * 3, 8, c.crest, 1.4);
  bust(g, c.scale, 66, 44);
  scaleTex(g, r, 10, 70, 80, 26, alpha(shade(c.scale, -0.45), 0.55), 18, 3);
  shape(g, [[50, 24], [74, 30], [84, 50], [74, 72], [50, 82], [26, 72], [16, 50], [26, 30]], c.scale, 44, 44, 36);
  scaleTex(g, r, 24, 28, 52, 30, alpha(shade(c.scale, -0.45), 0.55), 20, 2.6);
  shape(g, [[30, 60], [70, 60], [66, 80], [50, 86], [34, 80]], '#4a1414', 48, 70, 20, 1.8);
  for (let i = 0; i < 6; i++) { fang(g, 34 + i * 6.4, 60, 6, 3.6, '#efe6cc', 1, 0.8); fang(g, 36 + i * 5.6, 82 - Math.sin((i / 5) * Math.PI) * 2, 5, 3, '#efe6cc', -1, 0.8); }
  // brow plates and baleful eyes
  mir((s) => { blob(g, [[50 + s * 8, 34], [50 + s * 30, 32], [50 + s * 28, 40], [50 + s * 10, 42]]); paint(g, domeFill(g, 50 + s * 20, 36, 12, shade(c.scale, -0.2), 0.3), INK, 1.4); });
  eyes(g, 50, 46, 17, 6, 4.4, c.eye, { pupil: 'slit', glow: true, brow: 0.6, lid: shade(c.scale, -0.25) });
  nostrils(g, 50, 54, 5, 1.8, 1.2, 0.4);
}
function drawChimera(g: G, c: Colors, r: Rand, f: Flags) {
  batWings(g, c.wing, -6);
  // goat head on the left, dragon head on the right, lion in front
  mini(g, 22, 34, 0.46, () => drawGoat(g, { fur: c.goat, beard: shade(c.goat, 0.3), inner: '#7a6050', horn: '#5a4a3a', eye: '#e8b840' }, r, {}));
  mini(g, 78, 34, 0.46, () => drawDrake(g, { scale: c.dragon, horn: '#e6dab4', eye: '#ffd23f', fire: 'yes' }, {}, r));
  mini(g, 50, 60, 0.66, () => drawCat(g, { fur: c.lion, mane: c.mane, muzzle: '#efdcbc', inner: '#5a3a24', nose: '#9a5a4a', eye: '#e8a030' }, r, {}, { mane: true }));
}
function drawManticore(g: G, c: Colors, r: Rand, f: Flags) {
  batWings(g, c.wing);
  // spiked tail arching behind the head
  horn(g, [86, 90], [100, 4], [30, 6], 10, c.fur, 0, 1.8, 0.4);
  for (let i = 0; i < 6; i++) { const a = -0.3 - i * 0.42; spike(g, 64 + Math.cos(a - 1.2) * 20, 18 + Math.sin(a) * 6, -Math.PI / 2 + i * 0.25 - 0.4, 9, 4, '#e8dcc0', 1.1); }
  spiky(g, 50, 50, 28, 44, 14, c.mane, r, 0, Math.PI * 2, 2);
  bust(g, c.fur, 72, 36);
  humanFace(g, c, { top: 26, bot: 80, w: 18, ears: 'point', grin: true, brow: 0.7, eyeCol: c.eye });
  if (f.scar) scar(g, 56, 36, 62, 54);
}
function drawHarpy(g: G, c: Colors, r: Rand, f: Flags) {
  featherWings(g, c.wing);
  spiky(g, 50, 44, 20, 38, 13, c.hair, r, Math.PI * 0.75, Math.PI * 2.25, 1.8);
  bust(g, c.wing, 72, 32);
  scaleTex(g, r, 22, 76, 56, 20, alpha(shade(c.wing, -0.45), 0.6), 12, 3.2, 1);
  humanFace(g, c, { top: 28, bot: 78, w: 16, ears: 'none', grin: true, brow: 0.6, eyeCol: c.eye });
  spiky(g, 50, 36, 6, 16, 9, c.hair, r, Math.PI * 1.02, Math.PI * 1.98, 1.4);
}
function drawMedusa(g: G, c: Colors, r: Rand, f: Flags) {
  // snake hair, a writhing crown
  const heads: number[][] = [];
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.92 + i * 0.145), len = 34 + (i % 2) * 8;
    const p1 = [50 + Math.cos(a) * len, 46 + Math.sin(a) * len];
    horn(g, [50 + Math.cos(a) * 12, 46 + Math.sin(a) * 12], [50 + Math.cos(a + 0.4) * len * 0.7, 46 + Math.sin(a + 0.4) * len * 0.7], p1, 7, i % 2 ? c.snake : shade(c.snake, -0.15), 0, 1.4, 0.7);
    heads.push(p1);
  }
  for (const [x, y] of heads) { ellipse(g, x, y, 4, 3.2); paint(g, domeFill(g, x, y, 4, c.snake, 0.35), INK, 1.2); circle(g, x - 1.4, y - 0.6, 0.8); circle(g, x + 1.4, y - 0.6, 0.8); g.fillStyle = '#e8c040'; g.fill(); }
  bust(g, c.robe, 74, 34);
  stroke(g, [[30, 80], [50, 90], [70, 80]], c.trim, 2.4);
  humanFace(g, c, { top: 26, bot: 80, w: 17, ears: 'none', brow: 0.4, eyeCol: c.eye, glow: true });
  scaleTex(g, r, 36, 30, 28, 12, alpha(shade(c.skin, -0.4), 0.5), 8, 2);
}
function drawGorgon(g: G, c: Colors, r: Rand, f: Flags) {
  mir((s) => hornK(g, [50 + s * 16, 28], [50 + s * 40, 26], [50 + s * 42, 4], 1, 11, shade(c.metal, -0.2), 3, 1.8));
  bust(g, c.metal, 64, 48);
  for (let i = 0; i < 4; i++) { stroke(g, [[10 + i * 6, 80 + i * 4], [90 - i * 6, 80 + i * 4]], alpha(shade(c.metal, -0.5), 0.6), 1.2); }
  ears(g, 'long', 26, 40, 12, c.metal, shade(c.metal, -0.4), 1.1);
  face(g, 20, 88, 22, 26, 18, c.metal, 0.42, 0.45);
  // plates and rivets
  g.strokeStyle = alpha(shade(c.metal, -0.55), 0.8); g.lineWidth = 1.3; g.beginPath();
  g.moveTo(30, 38); g.lineTo(70, 38); g.moveTo(50, 22); g.lineTo(50, 38); mir((s) => { g.moveTo(50 + s * 22, 38); g.lineTo(50 + s * 18, 66); });
  g.stroke();
  for (const [x, y] of [[36, 34], [64, 34], [34, 56], [66, 56], [44, 28], [56, 28]]) { circle(g, x, y, 1.6); paint(g, shade(c.metal, 0.4), INK, 0.7); }
  ellipse(g, 50, 74, 16, 11); paint(g, domeFill(g, 48, 72, 16, shade(c.metal, -0.15), 0.4), INK, 1.8);
  nostrils(g, 50, 72, 7, 2.6, 1.8, 0.6, '#0a1a10');
  mir((s) => puff(g, 50 + s * 12, 82, 5, c.breath, 0.55));
  eyes(g, 50, 46, 14, 4.4, 3.2, c.eye, { pupil: 'none', glow: true, brow: 0.7, lid: shade(c.metal, -0.3) });
}
function serpentHead(g: G, c: Colors) {
  shape(g, [[50, 22], [66, 28], [72, 44], [64, 62], [50, 70], [36, 62], [28, 44], [34, 28]], c.scale, 46, 40, 26);
  mir((s) => spike(g, 50 + s * 14, 28, -Math.PI / 2 + s * 0.5, 9, 6, c.horn, 1.2));
  shape(g, [[38, 52], [62, 52], [60, 64], [50, 70], [40, 64]], '#4a1414', 48, 58, 12, 1.4);
  mir((s) => fang(g, 50 + s * 6, 52, 6, 3));
  eyes(g, 50, 40, 11, 4.4, 3.2, c.eye, { pupil: 'slit', rot: 0.3, brow: 0.6, lid: shade(c.scale, -0.2) });
  nostrils(g, 50, 48, 4, 1.4, 1, 0.4);
}
function drawHydra(g: G, c: Colors, r: Rand, f: Flags) {
  const hs = [[20, 40, 0.5], [80, 40, 0.5], [32, 20, 0.46], [68, 20, 0.46], [50, 44, 0.6]];
  for (const [x, y, k] of hs) {
    horn(g, [50 + (x - 50) * 0.3, 104], [x, 80], [x, y + 10], 16 * k + 6, shade(c.scale, -0.08), 0, 2, 0.75);
  }
  bust(g, c.scale, 80, 40);
  shape(g, [[38, 112], [40, 84], [60, 84], [62, 112]], c.belly, 50, 96, 14, 0);
  for (const [x, y, k] of hs) mini(g, x, y, k, () => serpentHead(g, c));
  if (f.scar) scar(g, 46, 34, 52, 48);
}
function drawAnkheg(g: G, c: Colors, r: Rand, f: Flags) {
  mir((s) => horn(g, [50 + s * 8, 30], [50 + s * 22, 4], [50 + s * 44, 2], 3.4, c.shell, 0, 1.1));
  bust(g, shade(c.shell, -0.1), 68, 44);
  for (let i = 0; i < 3; i++) { blob(g, [[10, 76 + i * 9], [50, 70 + i * 9], [90, 76 + i * 9], [90, 82 + i * 9], [50, 76 + i * 9], [10, 82 + i * 9]]); paint(g, domeFill(g, 50, 74 + i * 9, 40, c.shell, 0.3), INK, 1.4); }
  shape(g, [[50, 24], [72, 30], [80, 48], [70, 66], [50, 72], [30, 66], [20, 48], [28, 30]], c.shell, 44, 42, 32);
  stroke(g, [[30, 40], [50, 34], [70, 40]], alpha(INK, 0.55), 1.2);
  eyes(g, 50, 44, 17, 5.6, 4.4, c.eye, { pupil: 'bead', rot: 0.3 });
  mir((s) => horn(g, [50 + s * 14, 62], [50 + s * 30, 84], [50 + s * 4, 92], 9, c.mandible, 0, 1.6));
  drip(g, 50, 70, 8, '#b8f03c');
  drip(g, 44, 74, 4, '#b8f03c');
}
function drawBulette(g: G, c: Colors, r: Rand, f: Flags) {
  // dorsal crest fin
  poly(g, [[34, 34], [44, 2], [56, 4], [68, 34]]); paint(g, domeFill(g, 50, 14, 22, shade(c.plate, -0.1), 0.35), INK, LW);
  stroke(g, [[46, 30], [48, 8]], alpha(INK, 0.5), 1.1); stroke(g, [[56, 30], [54, 8]], alpha(INK, 0.5), 1.1);
  bust(g, c.skin, 62, 50);
  shape(g, [[50, 22], [78, 28], [90, 50], [80, 70], [50, 76], [20, 70], [10, 50], [22, 28]], c.plate, 44, 40, 40, LW, 0.4);
  g.strokeStyle = alpha(shade(c.plate, -0.55), 0.8); g.lineWidth = 1.4; g.beginPath();
  for (const [x1, y1, x2, y2] of [[22, 40, 78, 40], [16, 54, 84, 54], [36, 26, 34, 40], [64, 26, 66, 40], [50, 40, 50, 54]]) { g.moveTo(x1, y1); g.lineTo(x2, y2); }
  g.stroke();
  // shark-like maw
  blob(g, [[24, 64], [50, 60], [76, 64], [70, 84], [50, 92], [30, 84]]); paint(g, '#4a1414', INK, 2);
  for (let i = 0; i < 8; i++) { const t = i / 7; fang(g, 28 + t * 44, 63 - Math.sin(t * Math.PI) * 3, 7, 4.6, '#efe6cc', 1, 0.8); }
  for (let i = 0; i < 6; i++) { const t = i / 5; fang(g, 33 + t * 34, 88 - Math.sin(t * Math.PI) * 3, 5, 4, '#efe6cc', -1, 0.8); }
  eyes(g, 50, 48, 24, 3.6, 3, c.eye, { pupil: 'bead', brow: 0.6, lid: shade(c.plate, -0.3) });
}
function drawPurpleWorm(g: G, c: Colors, r: Rand, f: Flags) {
  circle(g, 50, 50, 54); paint(g, domeFill(g, 40, 36, 54, c.skin, 0.35), INK, LW);
  for (const rad of [46, 38]) { circle(g, 50, 50, rad); g.strokeStyle = alpha(shade(c.skin, -0.5), 0.7); g.lineWidth = 1.6; g.stroke(); }
  circle(g, 50, 52, 30); paint(g, '#3a0e1a', INK, 2);
  // rings of inward teeth
  for (const [rad, n, len] of [[30, 14, 10], [20, 10, 7]] as const) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (rad === 20 ? 0.3 : 0);
      spike(g, 50 + Math.cos(a) * rad, 52 + Math.sin(a) * rad, a + Math.PI, len, 4.4, '#efe6cc', 0.8);
    }
  }
  circle(g, 50, 52, 9); g.fillStyle = '#12040a'; g.fill();
  drip(g, 34, 80, 5, '#c8e060');
}
function drawRustMonster(g: G, c: Colors, r: Rand, f: Flags) {
  mir((s) => {
    const p0 = [50 + s * 8, 30], p1 = [50 + s * 40, 6];
    horn(g, p0, [50 + s * 16, 6], p1, 4, c.antenna, 0, 1.2);
    g.strokeStyle = c.antenna; g.lineWidth = 1.2; g.beginPath();
    for (let i = 1; i < 6; i++) { const t = i / 6; const x = 50 + s * (8 + t * 30), y = 30 - t * 24 - Math.sin(t * Math.PI) * 6; g.moveTo(x, y); g.lineTo(x + s * 5, y + 4); g.moveTo(x, y); g.lineTo(x - s * 1, y + 6); }
    g.stroke();
  });
  bust(g, c.shell, 68, 40);
  for (let i = 0; i < 3; i++) stroke(g, [[16, 78 + i * 8], [50, 72 + i * 8], [84, 78 + i * 8]], alpha(INK, 0.5), 1.2);
  face(g, 26, 82, 20, 26, 16, c.shell, 0.45);
  speckle2(g, r, 28, 30, 44, 30, alpha('#7a3a1a', 0.6), 14);
  eyes(g, 50, 46, 13, 6, 6, c.eye, { pupil: 'round', pr: 0.5 });
  shape(g, [[42, 62], [58, 62], [56, 74], [50, 78], [44, 74]], shade(c.shell, -0.2), 50, 68, 10, 1.4);
  stroke(g, [[44, 70], [50, 72], [56, 70]], INK, 1.2);
}
function drawEttercap(g: G, c: Colors, r: Rand, f: Flags) {
  bust(g, c.skin, 64, 46);
  strokes(g, r, 8, 68, 84, 30, alpha(shade(c.skin, 0.35), 0.5), 18, 5);
  face(g, 20, 84, 20, 26, 18, c.skin, 0.42);
  strokes(g, r, 26, 22, 48, 40, alpha(shade(c.skin, 0.4), 0.45), 18, 4);
  eyes(g, 50, 42, 8, 5, 5, c.eye, { pupil: 'bead', glow: true });
  eyes(g, 50, 33, 6, 2.6, 2.6, c.eye, { pupil: 'bead' });
  eyes(g, 50, 40, 19, 3, 3, c.eye, { pupil: 'bead' });
  mir((s) => horn(g, [50 + s * 8, 62], [50 + s * 18, 82], [50 + s * 3, 86], 8, c.fang, 0, 1.6));
  ellipse(g, 50, 66, 6, 4); paint(g, '#2a0a10', INK, 1.2);
  drip(g, 50, 69, 5, '#9be06a');
}
function drawCentaur(g: G, c: Colors, r: Rand, f: Flags) {
  // horse chest below, human torso above
  blob(g, [[0, 112], [6, 80], [30, 72], [70, 72], [94, 80], [100, 112]]); paint(g, domeFill(g, 50, 90, 50, c.coat, 0.25), INK, LW);
  horn(g, [86, 96], [96, 30], [70, 4], 5, c.wood, 0, 1.4, 0.4);
  stroke(g, [[84, 94], [72, 6]], '#e6e0d2', 0.8);
  blob(g, [[22, 92], [28, 64], [40, 58], [60, 58], [72, 64], [78, 92]]); paint(g, domeFill(g, 50, 72, 30, c.skin, 0.3), INK, LW);
  poly(g, [[30, 62], [38, 58], [74, 90], [66, 94]]); paint(g, c.sash, INK, 1.4);
  spiky(g, 50, 40, 18, 28, 10, c.hair, r, Math.PI * 0.85, Math.PI * 2.15, 1.8);
  humanFace(g, c, { top: 16, bot: 62, w: 15, ears: 'round', beard: !!f.beard, brow: 0.3, eyeCol: c.eye });
  spiky(g, 50, 26, 8, 16, 8, c.hair, r, Math.PI * 1.02, Math.PI * 1.98, 1.4);
}
function drawLamia(g: G, c: Colors, r: Rand, f: Flags) {
  spiky(g, 50, 52, 30, 46, 14, c.fur, r, 0, Math.PI * 2, 2);
  blob(g, [[50, 30], [72, 40], [78, 70], [70, 96], [30, 96], [22, 70], [28, 40]]); paint(g, domeFill(g, 50, 50, 30, c.hair, 0.25), INK, LW);
  bust(g, c.fur, 74, 36);
  humanFace(g, c, { top: 26, bot: 80, w: 17, ears: 'none', smile: true, brow: 0.2, eyeCol: c.eye });
  // jewelled headdress
  blob(g, [[30, 34], [38, 18], [50, 12], [62, 18], [70, 34], [50, 28]]); paint(g, litFill(g, 30, 12, 40, 22, c.gold), INK, 1.8);
  circle(g, 50, 22, 4); paint(g, domeFill(g, 50, 22, 4, c.gem, 0.5), INK, 1);
  mir((s) => { circle(g, 50 + s * 12, 26, 2.4); paint(g, domeFill(g, 50 + s * 12, 26, 2.4, c.gem, 0.5), INK, 0.8); });
}
function drawSphinx(g: G, c: Colors, r: Rand, f: Flags, beard: boolean) {
  featherWings(g, c.wing);
  bust(g, c.fur, 70, 40);
  // striped headdress
  blob(g, [[50, 14], [72, 22], [80, 50], [84, 84], [66, 80], [62, 50], [38, 50], [34, 80], [16, 84], [20, 50], [28, 22]]);
  paint(g, domeFill(g, 46, 34, 36, c.cloth, 0.3), INK, LW);
  g.strokeStyle = alpha(c.stripe, 0.9); g.lineWidth = 2.6; g.beginPath();
  mir((s) => { for (let i = 0; i < 4; i++) { g.moveTo(50 + s * (24 + i * 2), 30 + i * 12); g.lineTo(50 + s * (32 + i * 2.5), 32 + i * 13); } });
  g.stroke();
  humanFace(g, c, { top: 26, bot: 76, w: 15, ears: 'none', brow: 0.15, eyeCol: c.eye, glow: true });
  if (beard) { blob(g, [[44, 74], [56, 74], [55, 92], [50, 96], [45, 92]]); paint(g, litFill(g, 44, 74, 12, 22, c.cloth), INK, 1.6); }
  blob(g, [[30, 30], [50, 22], [70, 30], [66, 34], [50, 28], [34, 34]]); paint(g, c.stripe, INK, 1.2);
}
function drawDarkmantle(g: G, c: Colors, r: Rand, f: Flags) {
  // webbed tentacle skirt spread like a cloak
  const pts: number[][] = [];
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (0.05 + i * 0.09); const rad = i % 2 ? 40 : 50; pts.push([50 + Math.cos(a) * rad, 44 + Math.sin(a) * rad]); }
  poly(g, [[50, 44], ...pts]); paint(g, domeFill(g, 50, 70, 46, c.web, 0.3), INK, LW);
  g.strokeStyle = alpha(shade(c.web, 0.35), 0.7); g.lineWidth = 2; g.beginPath();
  for (let i = 0; i <= 10; i += 2) { g.moveTo(50, 50); g.lineTo(pts[i][0], pts[i][1]); }
  g.stroke();
  blob(g, [[50, 6], [70, 14], [76, 36], [68, 56], [50, 62], [32, 56], [24, 36], [30, 14]]); paint(g, domeFill(g, 44, 24, 34, c.skin, 0.35), INK, LW);
  speckle2(g, r, 32, 12, 36, 30, alpha(shade(c.skin, 0.3), 0.5), 12);
  eyes(g, 50, 44, 11, 3.4, 2.6, c.eye, { pupil: 'goat', glow: true });
}
function drawStirge(g: G, c: Colors, r: Rand, f: Flags) {
  batWings(g, c.wing, 6);
  ellipse(g, 50, 70, 24, 22); paint(g, domeFill(g, 46, 64, 24, c.fur, 0.3), INK, LW);
  strokes(g, r, 28, 50, 44, 36, alpha(shade(c.fur, -0.45), 0.6), 16, 4);
  ellipse(g, 50, 44, 20, 17); paint(g, domeFill(g, 46, 40, 20, c.fur, 0.3), INK, LW);
  strokes(g, r, 32, 30, 36, 22, alpha(shade(c.fur, -0.45), 0.6), 12, 3);
  eyes(g, 50, 42, 9, 6.4, 6, c.eye, { pupil: 'bead' });
  horn(g, [50, 52], [52, 76], [48, 98], 5, c.beak, 0, 1.4, 0.15);
}
function drawGrick(g: G, c: Colors, r: Rand, f: Flags) {
  bust(g, c.skin, 60, 34);
  for (let i = 0; i < 4; i++) { const y = 70 + i * 9; stroke(g, [[20, y], [50, y - 4], [80, y]], alpha(shade(c.skin, -0.45), 0.6), 1.2); }
  // four tentacles splayed in an X around the beak
  for (const [x, y, cx, cy] of [[12, 6, 46, 10], [88, 6, 54, 10], [4, 70, 14, 34], [96, 70, 86, 34]]) horn(g, [50, 44], [cx, cy], [x, y], 11, shade(c.skin, -0.06), 0, 1.8, 0.1);
  circle(g, 50, 46, 18); paint(g, domeFill(g, 46, 42, 18, c.skin, 0.3), INK, LW);
  ellipse(g, 50, 47, 12, 13); paint(g, '#3a0e14', INK, 1.2);
  mir((s) => { blob(g, [[50 + s * 1, 34], [50 + s * 12, 42], [50 + s * 3, 60], [50 + s * 1, 52]]); paint(g, domeFill(g, 50 + s * 5, 44, 12, c.beak, 0.45), INK, 1.4); });
}
function drawBehir(g: G, c: Colors, r: Rand, f: Flags) {
  mir((s) => { hornK(g, [50 + s * 14, 26], [50 + s * 30, 6], [50 + s * 46, 6], 1, 9, c.horn, 3, 1.6); hornK(g, [50 + s * 20, 34], [50 + s * 36, 26], [50 + s * 48, 30], 1, 6, c.horn, 2, 1.3); });
  bust(g, c.scale, 70, 32);
  for (let i = 0; i < 3; i++) { ellipse(g, 50, 82 + i * 9, 12, 3.6); paint(g, c.belly, alpha(INK, 0.8), 1.1); }
  serpentHead(g, c);
  zig(g, [[28, 66], [20, 74], [26, 76], [16, 88]], '#9ad8ff');
  zig(g, [[72, 66], [80, 72], [74, 76], [84, 88]], '#9ad8ff');
}
function drawRemorhaz(g: G, c: Colors, r: Rand, f: Flags) {
  glow(g, 50, 30, 50, '#ff6a1a', 0.5);
  for (let i = -3; i <= 3; i++) spike(g, 50 + i * 12, 30 + Math.abs(i) * 3, -Math.PI / 2 + i * 0.3, 18 - Math.abs(i) * 2, 9, c.hot, 1.4);
  mir((s) => horn(g, [50 + s * 8, 34], [50 + s * 18, 8], [50 + s * 34, 4], 3.2, c.shell, 0, 1.1));
  bust(g, c.shell, 66, 46);
  for (let i = 0; i < 3; i++) stroke(g, [[10, 76 + i * 9], [50, 70 + i * 9], [90, 76 + i * 9]], alpha(c.hot, 0.8), 2);
  shape(g, [[50, 28], [72, 34], [80, 50], [70, 68], [50, 74], [30, 68], [20, 50], [28, 34]], c.shell, 44, 46, 30);
  eyes(g, 50, 46, 16, 5, 4, c.eye, { pupil: 'bead', glow: true });
  mir((s) => horn(g, [50 + s * 12, 66], [50 + s * 26, 86], [50 + s * 4, 92], 9, shade(c.shell, -0.2), 0, 1.6));
}
function drawRoper(g: G, c: Colors, r: Rand, f: Flags) {
  // tendrils reaching out, a stony cone with one eye and a toothy maw
  for (const [x, y] of [[2, 30], [98, 34], [0, 64], [100, 70]]) horn(g, [50, 66], [50 + (x - 50) * 0.5, 30], [x, y], 4.4, c.tendril, 0, 1.2, 0.2);
  blob(g, [[50, 2], [64, 16], [74, 50], [84, 104], [16, 104], [26, 50], [36, 16]]); paint(g, domeFill(g, 44, 30, 50, c.stone, 0.3), INK, LW);
  speckle2(g, r, 30, 10, 40, 80, alpha(shade(c.stone, -0.4), 0.55), 22);
  eye(g, 50, 36, 9, 7, c.eye, { pupil: 'slit', glow: true });
  blob(g, [[34, 62], [66, 62], [62, 80], [50, 86], [38, 80]]); paint(g, '#3a0e14', INK, 1.8);
  for (let i = 0; i < 5; i++) { fang(g, 38 + i * 6, 62, 6, 4, '#efe6cc', 1, 0.8); fang(g, 40 + i * 5, 84 - Math.sin((i / 4) * Math.PI) * 2, 4.4, 3.4, '#efe6cc', -1, 0.8); }
}
function drawMerrow(g: G, c: Colors, r: Rand, f: Flags) {
  horn(g, [92, 100], [96, 40], [86, 2], 5, '#7a5a3a', 0, 1.4, 0.6);
  poly(g, [[86, 0], [80, 14], [86, 10], [92, 14]]); paint(g, '#b9c0c8', INK, 1.2);
  bust(g, c.skin, 64, 48);
  mir((s) => { poly(g, [[50 + s * 22, 40], [50 + s * 40, 26], [50 + s * 36, 40], [50 + s * 44, 48], [50 + s * 24, 58]]); paint(g, domeFill(g, 50 + s * 32, 42, 14, c.fin, 0.3), INK, 1.6); });
  face(g, 20, 86, 22, 26, 22, c.skin, 0.45);
  spiky(g, 50, 26, 10, 22, 8, c.hair, r, Math.PI * 1.0, Math.PI * 2.0, 1.6);
  scaleTex(g, r, 30, 30, 40, 16, alpha(shade(c.skin, -0.4), 0.5), 10, 2.4);
  eyes(g, 50, 46, 11, 4, 3, c.eye, { pupil: 'small', brow: 0.6, lid: shade(c.skin, -0.25) });
  nostrils(g, 50, 58, 4, 2, 1.4, 0.4);
  stroke(g, [[38, 72], [50, 74], [62, 72]], INK, 1.8);
  mir((s) => fang(g, 50 + s * 9, 74, 7, 3.6, '#efe6cc', -1));
  for (let i = 0; i < 4; i++) curve(g, [26 + i * 14, 88], [30 + i * 14, 96], [24 + i * 14, 104], '#3a6a3a', 2.4);
}

const MONSTROSITIES: CreatureDef[] = [
  mk('owlbear', 'Owlbear', 'monstrosity', 'Large', '3', ['owlbear', 'forest', 'bear', 'owl', 'beak'], { fur: '#6b4a2e', feather: '#8a6a44', disc: '#d8c4a0', beak: '#3e3632', inner: '#3a2618', eye: '#f07a1a' },
    [V('Brown'), V('Snowy', { fur: '#e6e0d4', feather: '#f2eee6', disc: '#ffffff', inner: '#a8a094', beak: '#5a524c', eye: '#f2c430' }), V('Black', { fur: '#2a2624', feather: '#3a3432', disc: '#8a7a6a', inner: '#141212', eye: '#e04a2a' }), V('Scarred', {}, { scar: 1 })], drawOwlbear, 'owlbear'),
  mk('minotaur', 'Minotaur', 'monstrosity', 'Large', '3', ['minotaur', 'bull', 'labyrinth', 'dungeon', 'horns'], { fur: '#5a3a26', skin: '#6a4a34', muzzle: '#3a2a22', horn: '#e8dcc0', inner: '#2a1a12', eye: '#e04a2a', leather: '#3e2a1a' },
    [V('Brown'), V('Black', { fur: '#2a2422', skin: '#3a3230', muzzle: '#1a1615' }), V('Red', { fur: '#7a3a22', skin: '#8a4a30', muzzle: '#4a2418' }), V('White', { fur: '#d8d0c4', skin: '#c8bcae', muzzle: '#8a7a70' }), V('Enraged', {}, { rage: 1, scar: 1 })], drawMinotaur, 'minotaur'),
  mk('mimic', 'Mimic', 'monstrosity', 'Medium', '2', ['mimic', 'chest', 'trap', 'dungeon', 'treasure', 'shapechanger'], { wood: '#8a5a32', metal: '#6c6f73', eye: '#e8c040' },
    [V('Oak chest'), V('Iron-bound', { wood: '#4a3424', metal: '#33373c' }), V('Gilded', { wood: '#7a2a22', metal: '#e2b84a' }), V('Pine', { wood: '#c4955a', metal: '#a8743c' })], drawMimic, 'mimic'),
  mk('basilisk', 'Basilisk', 'monstrosity', 'Medium', '3', ['basilisk', 'petrify', 'gaze', 'cave', 'lizard'], { scale: '#5a6a3a', crest: '#3a4a22', eye: '#b8f03c' },
    [V('Moss'), V('Ash', { scale: '#6a6660', crest: '#3e3a36', eye: '#ffd23f' }), V('Desert', { scale: '#a08050', crest: '#6a4a2a', eye: '#4ad6ff' })], drawBasilisk),
  mk('cockatrice', 'Cockatrice', 'monstrosity', 'Small', '1/2', ['cockatrice', 'rooster', 'petrify', 'bird', 'lizard'], { body: '#6a8a4a', head: '#e6dcc4', comb: '#d0302a', beak: '#e8b830', eye: '#e04a2a' },
    [V('Green'), V('Red', { body: '#a0402a', head: '#efe6d4' }), V('Black', { body: '#2e2e34', head: '#4a4a52', beak: '#d8a830', eye: '#b8f03c' })], (g, c, r, f) => drawBird(g, c, r, f, { beak: 'short', comb: true })),
  mk('chimera', 'Chimera', 'monstrosity', 'Large', '6', ['chimera', 'three heads', 'lion', 'goat', 'dragon', 'fire'], { lion: '#c9964e', mane: '#7a4a22', goat: '#8a7a68', dragon: '#a33a22', wing: '#5a2a1e' },
    [V('Classic'), V('Dusky', { lion: '#8a6a44', mane: '#3a2414', goat: '#4a4440', dragon: '#2e4a7a', wing: '#2a2a34' }), V('Pale', { lion: '#e6dcc4', mane: '#b8a888', goat: '#efeae0', dragon: '#3a7a4a', wing: '#6a6a60' })], drawChimera),
  mk('manticore', 'Manticore', 'monstrosity', 'Large', '3', ['manticore', 'lion', 'tail spikes', 'wings', 'mountain'], { fur: '#b8864a', mane: '#6a3a1e', skin: '#c89070', hair: '#4a2a14', wing: '#5a3a2a', eye: '#e8a020' },
    [V('Tawny'), V('Dark', { fur: '#6a4a30', mane: '#2a1810', skin: '#9a6a4e', wing: '#2e2224' }), V('Red', { fur: '#a04a2a', mane: '#4a1a10', skin: '#c07a60', wing: '#5a1e1a' }), V('Scarred', {}, { scar: 1 })], drawManticore),
  mk('griffon', 'Griffon', 'monstrosity', 'Large', '2', ['griffon', 'gryphon', 'eagle', 'lion', 'mount', 'flying', 'mountain'], { body: '#c09050', head: '#f0ece2', beak: '#e8b830', eye: '#f07a1a', wing: '#8a6a3e' },
    [V('White-headed'), V('Golden', { head: '#c8903e', body: '#b07a3a', wing: '#7a4e22' }), V('Grey', { head: '#a8aab0', body: '#8a8478', wing: '#5a5a60' }), V('Black', { head: '#2e2e34', body: '#3a342e', wing: '#22222a', eye: '#ffd23f' })], (g, c, r, f) => drawBird(g, c, r, f, { beak: 'hook', wings: true, furry: true, tufts: true })),
  mk('hippogriff', 'Hippogriff', 'monstrosity', 'Large', '1', ['hippogriff', 'eagle', 'horse', 'mount', 'flying'], { body: '#8a5a36', head: '#c8b090', mane: '#4a2e1c', beak: '#3a3a3e', eye: '#f0a020', wing: '#6a4a30' },
    [V('Bay'), V('Grey', { body: '#8a8682', head: '#d8d4ce', mane: '#5a5652', wing: '#6a6866' }), V('White', { body: '#e6e2da', head: '#f6f2ec', mane: '#bcb4a8', wing: '#d8d2c8' }), V('Black', { body: '#2a2624', head: '#4a4440', mane: '#141110', wing: '#1e1c1a', eye: '#e04a2a' })],
    (g, c, r, f) => drawBird(g, c, r, f, { beak: 'hook', wings: true, furry: true, mane: true, ears: true })),
  mk('harpy', 'Harpy', 'monstrosity', 'Medium', '1', ['harpy', 'bird', 'song', 'mountain', 'coast', 'flying'], { skin: '#a8a490', hair: '#3a3a30', wing: '#5a5040', eye: '#e8c040' },
    [V('Drab'), V('Raven', { skin: '#8a8a9a', hair: '#141418', wing: '#22222a', eye: '#e04a2a' }), V('Sea', { skin: '#8aa49a', hair: '#2e4a44', wing: '#4a6a6a' })], drawHarpy),
  mk('medusa', 'Medusa', 'monstrosity', 'Medium', '6', ['medusa', 'snake hair', 'petrify', 'gaze', 'ruins', 'temple'], { skin: '#9ab08a', snake: '#4e7a3a', robe: '#2f5d5a', trim: '#e2b84a', eye: '#b8f03c' },
    [V('Green'), V('Ashen', { skin: '#b0aaa0', snake: '#4a4a52', robe: '#3a2a3e', eye: '#ff4a3a' }), V('Gold', { skin: '#c8a878', snake: '#a07a2a', robe: '#6a1e1e', eye: '#4ad6ff' })], drawMedusa),
  mk('gorgon', 'Gorgon', 'monstrosity', 'Large', '5', ['gorgon', 'iron bull', 'petrify', 'breath', 'metal'], { metal: '#6c747c', breath: '#9be06a', eye: '#b8f03c' },
    [V('Iron'), V('Bronze', { metal: '#a8743c' }), V('Black iron', { metal: '#3a3e44', eye: '#ff6a2a', breath: '#ffb02e' })], drawGorgon),
  mk('hydra', 'Hydra', 'monstrosity', 'Huge', '8', ['hydra', 'many heads', 'swamp', 'serpent', 'lake'], { scale: '#3e6a4a', belly: '#c8c890', horn: '#e6dcb4', eye: '#ffd23f' },
    [V('Swamp green'), V('Black', { scale: '#2a2a30', belly: '#6a6a60', eye: '#e04a2a' }), V('Sea blue', { scale: '#2e5a7a', belly: '#a8d0d8' }), V('Red', { scale: '#8a2e22', belly: '#e0a060' }), V('Scarred', {}, { scar: 1 })], drawHydra),
  mk('kraken', 'Kraken', 'monstrosity', 'Gargantuan', '23', ['kraken', 'sea', 'tentacles', 'ship', 'water', 'titan'], { skin: '#4a2e5a', sucker: '#d8b8e8', eye: '#ffd23f' },
    [V('Abyss purple'), V('Deep green', { skin: '#2a4a3a', sucker: '#a8e0c0', eye: '#e04a2a' }), V('Blood red', { skin: '#6a1e1e', sucker: '#f0b0a0' }), V('Ghost', { skin: '#a8b0b8', sucker: '#7fd3ff', eye: '#7fd3ff' })], (g, c, r, f) => drawOctopus(g, c, r, f, true)),
  mk('roc', 'Roc', 'monstrosity', 'Gargantuan', '11', ['roc', 'bird', 'giant', 'mountain', 'flying', 'titan'], { body: '#5a4a3a', head: '#8a7a64', crest: '#c0402a', beak: '#d8c090', cere: '#3a3a3e', eye: '#f2c430', wing: '#4a3a2a' },
    [V('Brown'), V('White', { body: '#d8d2c8', head: '#f2efe8', wing: '#b8b2a8', crest: '#2f5d8a' }), V('Storm', { body: '#3a3e48', head: '#5a606c', wing: '#2a2e36', crest: '#e8c040', eye: '#7fd3ff' }), V('Scarred', {}, { scar: 1 })],
    (g, c, r, f) => drawBird(g, c, r, f, { beak: 'hook', wings: true, crest: true })),
  mk('ankheg', 'Ankheg', 'monstrosity', 'Large', '2', ['ankheg', 'insect', 'burrow', 'farm', 'acid'], { shell: '#7a5a2e', mandible: '#3a2a1a', eye: '#1a1414' },
    [V('Brown'), V('Black', { shell: '#2e2a26', mandible: '#5a3a1a', eye: '#e04a2a' }), V('Green', { shell: '#4a5a2a', mandible: '#2a2214' })], drawAnkheg),
  mk('bulette', 'Bulette', 'monstrosity', 'Large', '5', ['bulette', 'landshark', 'burrow', 'hills'], { plate: '#5a6a78', skin: '#8a7a64', eye: '#e04a2a' },
    [V('Slate'), V('Rust', { plate: '#8a5a3a', skin: '#a08a6a' }), V('Sand', { plate: '#a8946a', skin: '#c8b48a', eye: '#1a1414' })], drawBulette),
  mk('purple-worm', 'Purple Worm', 'monstrosity', 'Gargantuan', '15', ['purple worm', 'worm', 'burrow', 'underdark', 'cave', 'titan'], { skin: '#6a3a8a' },
    [V('Purple'), V('Grey', { skin: '#6a6670' }), V('Sand', { skin: '#a8885a' })], drawPurpleWorm),
  mk('rust-monster', 'Rust Monster', 'monstrosity', 'Medium', '1/2', ['rust monster', 'insect', 'dungeon', 'metal', 'cave'], { shell: '#b8643a', antenna: '#d8a060', eye: '#2a1a14' },
    [V('Rust'), V('Copper', { shell: '#4a8a7a', antenna: '#a8d0c0' }), V('Ochre', { shell: '#c8943a' })], drawRustMonster),
  mk('ettercap', 'Ettercap', 'monstrosity', 'Medium', '2', ['ettercap', 'spider', 'web', 'forest', 'poison'], { skin: '#4a3a4e', fang: '#2a1a1e', eye: '#e04a2a' },
    [V('Violet'), V('Brown', { skin: '#5a4430' }), V('Pale', { skin: '#9a9488', eye: '#2a1414' })], drawEttercap),
  mk('phase-spider', 'Phase Spider', 'monstrosity', 'Large', '3', ['spider', 'phase', 'ethereal', 'blink', 'arcane', 'web'], { body: '#3e3a7a', band: '#9a8ae0', mark: '#7fd3ff', fang: '#e8dcc0', eye: '#9ae8ff', glow: '#9a7aff' },
    [V('Violet'), V('Teal', { body: '#1e5a5a', band: '#7ad8c8', mark: '#e0f8ff', glow: '#4ae8d0' }), V('Ghost', { body: '#8a8a9a', band: '#e0e0f0', mark: '#ffffff', glow: '#c8d8ff', eye: '#ffffff' })], (g, c, r, f) => drawSpider(g, c, r, f, true)),
  mk('worg', 'Worg', 'monstrosity', 'Large', '1/2', ['worg', 'wolf', 'goblin mount', 'evil', 'forest'], { fur: '#3e3630', belly: '#7a6e5e', ruff: '#2a241f', inner: '#2a1a1a', eye: '#ff5a2a' },
    [V('Dark'), V('Grey', { fur: '#5e5a54', belly: '#9a948a', ruff: '#45413c' }), V('Mangy brown', { fur: '#5a4430', belly: '#8a7254', ruff: '#3e2e20', eye: '#f2d23a' })], (g, c, r, f) => drawWolfish(g, c, r, f, { ruff: true, snarl: true })),
  mk('winter-wolf', 'Winter Wolf', 'monstrosity', 'Large', '3', ['wolf', 'winter', 'ice', 'cold', 'arctic', 'snow'], { fur: '#dfe8ee', belly: '#ffffff', ruff: '#b8d4e4', inner: '#7a9ab0', eye: '#45b8f0' },
    [V('Frost'), V('Silver', { fur: '#b8c0c8', belly: '#e6eaee', ruff: '#8a9aa8' }), V('Blue-black', { fur: '#3a4a5a', belly: '#8aa4ba', ruff: '#2a3644', eye: '#9ae8ff' })], (g, c, r, f) => drawWolfish(g, c, r, f, { ruff: true, frost: true })),
  mk('centaur', 'Centaur', 'monstrosity', 'Large', '2', ['centaur', 'horse', 'archer', 'forest', 'plains'], { skin: '#c8906a', hair: '#4a2e1c', coat: '#7a4a2a', sash: '#3e6b3a', wood: '#8a5a32', eye: '#3a5a2a' },
    [V('Bay'), V('Bearded', {}, { beard: 1 }), V('Grey', { coat: '#a8a49e', hair: '#d8d0c4', skin: '#e0b896', sash: '#2f5d8a' }, { beard: 1 }), V('Dark', { coat: '#2e2624', hair: '#141110', skin: '#7a5038', sash: '#a3312c' })], drawCentaur),
  mk('lamia', 'Lamia', 'monstrosity', 'Large', '4', ['lamia', 'desert', 'ruins', 'charm'], { skin: '#d8a880', hair: '#2a1a14', fur: '#c09050', gold: '#e2b84a', gem: '#2ec4b6', eye: '#e8a020' },
    [V('Desert gold'), V('Night', { hair: '#14141e', fur: '#5a4a3a', gem: '#c0262a', skin: '#a07858' }), V('Pale', { skin: '#efd8c4', hair: '#a07a4a', gem: '#7a3aa0' })], drawLamia),
  mk('androsphinx', 'Androsphinx', 'monstrosity', 'Large', '17', ['sphinx', 'riddle', 'desert', 'temple', 'guardian', 'wings'], { skin: '#c89a6a', fur: '#c8a060', wing: '#a07a40', cloth: '#e2b84a', stripe: '#2f5d8a', eye: '#4ad6ff' },
    [V('Gold and blue'), V('Gold and red', { stripe: '#a3312c' }), V('Stone', { skin: '#b8b0a0', fur: '#a8a090', wing: '#8a8478', cloth: '#d8d0c0', stripe: '#6a6458' })], (g, c, r, f) => drawSphinx(g, c, r, f, true)),
  mk('gynosphinx', 'Gynosphinx', 'monstrosity', 'Large', '11', ['sphinx', 'riddle', 'desert', 'temple', 'guardian', 'wings'], { skin: '#b07a52', fur: '#c8a060', wing: '#a07a40', cloth: '#e2b84a', stripe: '#3e6b3a', eye: '#e8c040' },
    [V('Gold and green'), V('Gold and purple', { stripe: '#5d3a78' }), V('Stone', { skin: '#b8b0a0', fur: '#a8a090', wing: '#8a8478', cloth: '#d8d0c0', stripe: '#6a6458' })], (g, c, r, f) => drawSphinx(g, c, r, f, false)),
  mk('yeti', 'Yeti', 'monstrosity', 'Large', undefined, ['yeti', 'winter', 'snow', 'mountain', 'folklore', 'ape'], { fur: '#eef0f2', skin: '#7a8ea4', eye: '#45b8f0' },
    [V('White'), V('Grey', { fur: '#b8bcc0', skin: '#5a6a7a' }), V('Abominable', { fur: '#dfe6ea', skin: '#4a5a8a', eye: '#e04a2a' }, { scar: 1 })], (g, c, r, f) => drawApe(g, c, r, f, { yeti: true })),
  mk('darkmantle', 'Darkmantle', 'monstrosity', 'Small', '1/2', ['darkmantle', 'cave', 'ceiling', 'ambush', 'darkness'], { skin: '#3e3a44', web: '#2a2630', eye: '#e04a2a' },
    [V('Charcoal'), V('Stone', { skin: '#6a6660', web: '#4a4640', eye: '#e8c040' }), V('Purple', { skin: '#4a2e5a', web: '#2e1e3a' })], drawDarkmantle),
  mk('stirge', 'Stirge', 'monstrosity', 'Tiny', '1/8', ['stirge', 'blood', 'swamp', 'cave', 'vermin', 'flying'], { fur: '#8a5a3a', wing: '#5a3a2e', beak: '#3a2a22', eye: '#c0262a' },
    [V('Rust'), V('Grey', { fur: '#6a6466', wing: '#433e40' }), V('Swamp', { fur: '#5a6a3a', wing: '#3a4628', eye: '#e8c040' })], drawStirge),
  mk('grick', 'Grick', 'monstrosity', 'Medium', '2', ['grick', 'worm', 'tentacles', 'cave', 'underdark'], { skin: '#8a8a7a', beak: '#3a3430' },
    [V('Grey'), V('Green', { skin: '#5a7a5a' }), V('Pale', { skin: '#c8c0b0' }), V('Alpha', { skin: '#5a5a62', beak: '#c0262a' })], drawGrick),
  mk('behir', 'Behir', 'monstrosity', 'Huge', '11', ['behir', 'serpent', 'lightning', 'cave', 'mountain'], { scale: '#2f5d9a', belly: '#9ac0e0', horn: '#e6dcb4', eye: '#fff3a3' },
    [V('Blue'), V('Storm grey', { scale: '#4a5260', belly: '#a8b0b8' }), V('Violet', { scale: '#5a3a8a', belly: '#c8b0e0' })], drawBehir),
  mk('remorhaz', 'Remorhaz', 'monstrosity', 'Huge', '11', ['remorhaz', 'winter', 'arctic', 'fire', 'burrow', 'insect'], { shell: '#d8dce0', hot: '#ff8a2a', eye: '#1a1414' },
    [V('Ice white'), V('Blue', { shell: '#8aa8c0', hot: '#ff5a1a' }), V('Young', { shell: '#e6e8ea', hot: '#ffb02e' })], drawRemorhaz),
  mk('roper', 'Roper', 'monstrosity', 'Large', '5', ['roper', 'cave', 'stalagmite', 'ambush', 'tendrils'], { stone: '#7a746a', tendril: '#9a8a70', eye: '#e8c040' },
    [V('Grey'), V('Dark', { stone: '#4a4640', tendril: '#6a6050' }), V('Red rock', { stone: '#9a5a48', tendril: '#b88a6a' })], drawRoper),
  mk('merrow', 'Merrow', 'monstrosity', 'Large', '2', ['merrow', 'sea', 'coast', 'ogre', 'harpoon', 'water'], { skin: '#5a7a5a', fin: '#2e5a5a', hair: '#2a3a2a', eye: '#e8c040' },
    [V('Green'), V('Blue', { skin: '#4a6a8a', fin: '#2a4a6a' }), V('Grey', { skin: '#7a7e80', fin: '#4a5a5a' })], drawMerrow),
];

export const BEAST_CREATURES: CreatureDef[] = [...DRAGONS, ...BEASTS, ...MONSTROSITIES];

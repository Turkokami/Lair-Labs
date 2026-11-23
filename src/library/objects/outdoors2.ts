// Outdoor structures and region-map icons for Lair Labs: roofed buildings seen from above, town and
// castle walls, palisades, bridges, ruins, more trees and rocks, and small icons for region maps where
// one square is a mile. Original art drawn in code with the Canvas 2D API, in the same top-down style
// as the rest of the library: light from the top-left, ink outline, soft shading.
import type { G, ObjDef } from '../art/types';
import { rng, circle, ellipse, rr, poly, blob, lumpy, paint, line, domeFill, litFill, speckle, stone, blocks, foliage, shade, alpha, INK, LW, STONE, CLOTH } from '../art/kit';

type Rand = () => number;
const TAU = Math.PI * 2;

// ---------- roofs ----------

export type RoofStyle = 'thatch' | 'shingle' | 'slate' | 'tile';
export const ROOF: Record<string, string> = { thatch: '#b89a5a', shingle: '#6e4a32', slate: '#4f565e', tile: '#a5513a' };

/** Clip to a polygon and run f inside it. */
function clipped(g: G, pts: number[][], f: () => void) {
  g.save();
  poly(g, pts);
  g.clip();
  f();
  g.restore();
}

/** Courses of roofing laid parallel to an eave from (ax,ay) to (bx,by), rising towards (nx,ny). */
function courses(g: G, ax: number, ay: number, bx: number, by: number, nx: number, ny: number, depth: number, base: string, style: RoofStyle, r: Rand) {
  const gap = style === 'thatch' ? 7 : style === 'slate' ? 9 : 8;
  const ex = bx - ax, ey = by - ay, len = Math.hypot(ex, ey);
  const ux = ex / len, uy = ey / len;
  for (let d = gap, row = 0; d < depth + gap; d += gap, row++) {
    const ox = nx * d, oy = ny * d;
    if (style === 'thatch') {
      // rough straw strokes running up the slope
      g.strokeStyle = alpha(shade(base, row % 2 ? 0.18 : -0.22), 0.6);
      g.lineWidth = 1.1;
      g.beginPath();
      for (let t = 0; t < len; t += 3 + r() * 3) {
        const x = ax + ux * t + ox - nx * gap, y = ay + uy * t + oy - ny * gap;
        g.moveTo(x, y);
        g.lineTo(x + nx * (gap + 3) + (r() - 0.5) * 2, y + ny * (gap + 3) + (r() - 0.5) * 2);
      }
      g.stroke();
      continue;
    }
    // a course line, then the butt joints between shingles or tiles, staggered row by row
    g.strokeStyle = alpha(shade(base, -0.55), 0.6);
    g.lineWidth = style === 'tile' ? 1.6 : 1.1;
    g.beginPath();
    g.moveTo(ax - ux * 20 + ox, ay - uy * 20 + oy);
    g.lineTo(bx + ux * 20 + ox, by + uy * 20 + oy);
    g.stroke();
    const step = style === 'tile' ? 9 : style === 'slate' ? 12 : 10;
    g.lineWidth = 0.9;
    g.beginPath();
    for (let t = (row % 2) * step * 0.5 - 20; t < len + 20; t += step * (0.8 + r() * 0.4)) {
      const x = ax + ux * t + ox, y = ay + uy * t + oy;
      g.moveTo(x, y);
      g.lineTo(x - nx * gap, y - ny * gap);
    }
    g.stroke();
    if (style === 'tile') {
      // round tiles catch light on their crowns
      g.strokeStyle = alpha(shade(base, 0.35), 0.35);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(ax - ux * 20 + ox - nx * 3, ay - uy * 20 + oy - ny * 3);
      g.lineTo(bx + ux * 20 + ox - nx * 3, by + uy * 20 + oy - ny * 3);
      g.stroke();
    }
  }
}

/** A hipped roof seen from above: four slopes, the ridge along the long side. Lit from the top-left. */
export function hipRoof(g: G, x: number, y: number, w: number, h: number, base: string, style: RoofStyle, r: Rand) {
  const long = w >= h;
  const hw = Math.min(w, h) / 2;
  const cx = x + w / 2, cy = y + h / 2;
  const [r1x, r1y, r2x, r2y] = long ? [x + hw, cy, x + w - hw, cy] : [cx, y + hw, cx, y + h - hw];
  const tl = [x, y], tr = [x + w, y], br = [x + w, y + h], bl = [x, y + h];
  const faces: { pts: number[][]; amt: number; e: number[]; n: number[]; depth: number }[] = [
    { pts: [tl, tr, [r2x, r2y], [r1x, r1y]], amt: 0.16, e: [x, y, x + w, y], n: [0, 1], depth: long ? hw : h / 2 },
    { pts: [bl, br, [r2x, r2y], [r1x, r1y]], amt: -0.24, e: [x, y + h, x + w, y + h], n: [0, -1], depth: long ? hw : h / 2 },
    { pts: [tl, bl, [r1x, r1y]], amt: 0.06, e: [x, y, x, y + h], n: [1, 0], depth: long ? w / 2 : hw },
    { pts: [tr, br, [r2x, r2y]], amt: -0.14, e: [x + w, y, x + w, y + h], n: [-1, 0], depth: long ? w / 2 : hw },
  ];
  if (!long) {
    faces[0].pts = [tl, tr, [r1x, r1y]];
    faces[1].pts = [bl, br, [r2x, r2y]];
    faces[2].pts = [tl, bl, [r2x, r2y], [r1x, r1y]];
    faces[3].pts = [tr, br, [r2x, r2y], [r1x, r1y]];
  }
  // eaves cast a soft shadow
  g.fillStyle = 'rgba(0,0,0,0.28)';
  rr(g, x + 5, y + 7, w, h, 4);
  g.fill();
  for (const f of faces) {
    poly(g, f.pts);
    paint(g, shade(base, f.amt), null);
    clipped(g, f.pts, () => courses(g, f.e[0], f.e[1], f.e[2], f.e[3], f.n[0], f.n[1], f.depth, shade(base, f.amt), style, r));
  }
  // hips and ridge
  g.strokeStyle = alpha(shade(base, style === 'thatch' ? -0.45 : -0.6), 0.9);
  g.lineWidth = style === 'thatch' ? 3 : 2.4;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x, y); g.lineTo(r1x, r1y); g.lineTo(x + (long ? 0 : w), y + (long ? h : 0));
  g.moveTo(x + w, y + h); g.lineTo(r2x, r2y); g.lineTo(x + (long ? w : 0), y + (long ? 0 : h));
  g.moveTo(r1x, r1y); g.lineTo(r2x, r2y);
  g.stroke();
  g.strokeStyle = alpha(shade(base, 0.4), 0.5);
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(r1x - (long ? 0 : 1.5), r1y - (long ? 1.5 : 0));
  g.lineTo(r2x - (long ? 0 : 1.5), r2y - (long ? 1.5 : 0));
  g.stroke();
  rr(g, x, y, w, h, 2);
  paint(g, 'rgba(0,0,0,0)', INK, LW);
}

/** A gabled roof: two slopes meeting on a ridge along the long side, with gable ends. */
export function gableRoof(g: G, x: number, y: number, w: number, h: number, base: string, style: RoofStyle, r: Rand) {
  const long = w >= h;
  g.fillStyle = 'rgba(0,0,0,0.28)';
  rr(g, x + 5, y + 7, w, h, 3);
  g.fill();
  if (long) {
    const a = [[x, y], [x + w, y], [x + w, y + h / 2], [x, y + h / 2]], b = [[x, y + h / 2], [x + w, y + h / 2], [x + w, y + h], [x, y + h]];
    poly(g, a); paint(g, shade(base, 0.14), null);
    clipped(g, a, () => courses(g, x, y, x + w, y, 0, 1, h / 2, shade(base, 0.14), style, r));
    poly(g, b); paint(g, shade(base, -0.22), null);
    clipped(g, b, () => courses(g, x, y + h, x + w, y + h, 0, -1, h / 2, shade(base, -0.22), style, r));
    line(g, x + 2, y + h / 2, x + w - 2, y + h / 2, alpha(shade(base, -0.6), 0.95), 2.6);
  } else {
    const a = [[x, y], [x + w / 2, y], [x + w / 2, y + h], [x, y + h]], b = [[x + w / 2, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h]];
    poly(g, a); paint(g, shade(base, 0.1), null);
    clipped(g, a, () => courses(g, x, y, x, y + h, 1, 0, w / 2, shade(base, 0.1), style, r));
    poly(g, b); paint(g, shade(base, -0.2), null);
    clipped(g, b, () => courses(g, x + w, y, x + w, y + h, -1, 0, w / 2, shade(base, -0.2), style, r));
    line(g, x + w / 2, y + 2, x + w / 2, y + h - 2, alpha(shade(base, -0.6), 0.95), 2.6);
  }
  rr(g, x, y, w, h, 2);
  paint(g, 'rgba(0,0,0,0)', INK, LW);
}

export function chimney(g: G, x: number, y: number, s: number, color = '#7d7266', smoke = true) {
  g.fillStyle = 'rgba(0,0,0,0.3)';
  g.fillRect(x + 4, y + 5, s, s);
  rr(g, x, y, s, s, 2);
  paint(g, litFill(g, x, y, s, s, color, 0.25), INK, 1.6);
  rr(g, x + s * 0.25, y + s * 0.25, s * 0.5, s * 0.5, 1);
  paint(g, '#1d1916', null);
  if (smoke) {
    g.fillStyle = 'rgba(220,220,220,0.18)';
    for (let i = 0; i < 3; i++) { circle(g, x + s / 2 + 6 + i * 7, y - 4 - i * 6, 5 + i * 2.5); g.fill(); }
  }
}

/** A stone or timber wall of a building, peeking out under the eaves at the bottom (the side facing the viewer). */
export function wallBase(g: G, x: number, y: number, w: number, h: number, color: string) {
  rr(g, x, y + h - 10, w, 12, 2);
  paint(g, shade(color, -0.25), INK, 1.6);
}

/** A front door under the bottom eave. */
export function door(g: G, cx: number, y: number, color = '#5a3a20') {
  rr(g, cx - 9, y - 4, 18, 9, 1.5);
  paint(g, color, INK, 1.4);
  rr(g, cx - 13, y + 5, 26, 7, 2);
  paint(g, '#8a8378', INK, 1.2);
}

export interface House { id: string; name: string; w: number; h: number; roof: 'hip' | 'gable'; style: RoofStyle; chimney?: [number, number][]; tags: string[]; desc: string; sets: ObjDef['sets']; extra?: (g: G, w: number, h: number, c: Record<string, string>, r: Rand) => void }

export function houseDef(o: House): ObjDef {
  const styles: { name: string; style: RoofStyle }[] = [
    { name: 'Thatch', style: 'thatch' }, { name: 'Wood shingle', style: 'shingle' }, { name: 'Slate', style: 'slate' }, { name: 'Clay tile', style: 'tile' },
  ];
  const first = styles.findIndex((s) => s.style === o.style);
  const order = [styles[first], ...styles.filter((_, i) => i !== first)];
  return {
    id: o.id, name: o.name, cat: 'structure', sets: o.sets, tags: ['building', 'house', 'roof', ...o.tags],
    w: o.w, h: o.h, blocksMovement: true, blocksSight: true, solid: true,
    c: { roof: ROOF[o.style], wall: '#b8ab92' },
    variants: order.map((s, i) => ({ name: s.name, c: { roof: ROOF[s.style] }, f: { style: styles.indexOf(s) + 1 } , ...(i === 0 ? {} : {}) })),
    desc: o.desc,
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const style = styles[(f.style ?? first + 1) - 1]?.style ?? o.style;
      const m = 6;
      wallBase(g, m + 2, m, w - m * 2 - 4, h - m * 2, c.wall);
      if (o.roof === 'hip') hipRoof(g, m, m, w - m * 2, h - m * 2 - 8, c.roof, style, r);
      else gableRoof(g, m, m, w - m * 2, h - m * 2 - 8, c.roof, style, r);
      door(g, w / 2, h - m - 8);
      o.extra?.(g, w, h, c, r);
      for (const [cx, cy] of o.chimney ?? []) chimney(g, cx * w, cy * h, 16);
    },
  };
}

// ---------- walls ----------

export function stoneCourse(g: G, x: number, y: number, w: number, h: number, base: string, r: Rand, bw = 20, bh = 12) {
  rr(g, x, y, w, h, 3);
  paint(g, shade(base, -0.15), INK, LW);
  g.save();
  rr(g, x, y, w, h, 3);
  g.clip();
  blocks(g, x, y, w, h, base, r, bw, bh);
  g.restore();
}

/** Crenellated top of a castle wall: merlons along both edges. */
function battlements(g: G, x: number, y: number, w: number, h: number, base: string, r: Rand) {
  stoneCourse(g, x, y, w, h, shade(base, -0.05), r, 18, 11);
  // walkway
  rr(g, x + 10, y + h * 0.3, w - 20, h * 0.4, 2);
  paint(g, shade(base, -0.28), alpha(INK, 0.6), 1);
  for (let i = 0; i < w / 25; i++) {
    const mx = x + 4 + i * 25;
    if (mx + 14 > x + w) break;
    for (const my of [y + 3, y + h - 15]) {
      rr(g, mx, my, 14, 12, 1.5);
      paint(g, litFill(g, mx, my, 14, 12, shade(base, 0.12), 0.25), INK, 1.3);
    }
  }
}

export function logEnd(g: G, cx: number, cy: number, rad: number, wood: string) {
  circle(g, cx, cy, rad);
  paint(g, domeFill(g, cx, cy, rad, wood, 0.3), INK, 1.6);
  circle(g, cx, cy, rad * 0.55);
  paint(g, 'rgba(0,0,0,0)', alpha(shade(wood, -0.5), 0.6), 0.8);
}

// ---------- trees and rocks ----------

export function trunkRoots(g: G, cx: number, cy: number, len: number, color: string, r: Rand, n = 5) {
  for (let i = 0; i < n; i++) {
    const a = r() * TAU;
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
    g.strokeStyle = INK;
    g.lineWidth = 9;
    g.stroke();
    g.strokeStyle = color;
    g.lineWidth = 6;
    g.stroke();
  }
}

/** Ground shadow under a canopy, offset down-right. */
export function canopyShadow(g: G, cx: number, cy: number, rad: number) {
  g.fillStyle = 'rgba(0,0,0,0.22)';
  circle(g, cx + rad * 0.18, cy + rad * 0.22, rad);
  g.fill();
}

// ---------- region-map icons: 1 square = 1 mile ----------

function mountain(g: G, cx: number, by: number, hw: number, hgt: number, rock: string, snow: string, r: Rand) {
  const peak = [cx + (r() - 0.5) * hw * 0.3, by - hgt];
  const left = [cx - hw, by], right = [cx + hw, by];
  poly(g, [left, peak, right]);
  paint(g, shade(rock, 0.1), INK, 1.8);
  // shaded right flank
  poly(g, [peak, right, [peak[0] + hw * 0.15, by]]);
  paint(g, shade(rock, -0.3), null);
  // ridge lines
  g.strokeStyle = alpha(INK, 0.55);
  g.lineWidth = 1;
  g.beginPath();
  for (let i = 0; i < 3; i++) {
    const t = 0.35 + i * 0.2;
    g.moveTo(peak[0] - hw * 0.1 * i, peak[1] + hgt * t * 0.5);
    g.lineTo(peak[0] - hw * (0.2 + 0.15 * i), by - hgt * 0.1);
  }
  g.stroke();
  // snow cap
  poly(g, [[peak[0] - hw * 0.28, peak[1] + hgt * 0.3], peak, [peak[0] + hw * 0.3, peak[1] + hgt * 0.32], [peak[0] + hw * 0.08, peak[1] + hgt * 0.24], [peak[0] - hw * 0.05, peak[1] + hgt * 0.34]]);
  paint(g, snow, alpha(INK, 0.7), 1);
}

function hill(g: G, cx: number, by: number, hw: number, hgt: number, color: string) {
  g.beginPath();
  g.moveTo(cx - hw, by);
  g.quadraticCurveTo(cx - hw * 0.2, by - hgt * 1.5, cx + hw, by);
  paint(g, litFill(g, cx - hw, by - hgt, hw * 2, hgt, color, 0.3), INK, 1.6);
  g.strokeStyle = alpha(INK, 0.4);
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(cx + hw * 0.1, by - hgt * 0.55);
  g.quadraticCurveTo(cx + hw * 0.45, by - hgt * 0.3, cx + hw * 0.6, by - 2);
  g.stroke();
}

function tinyTree(g: G, cx: number, cy: number, s: number, leaf: string, pine: boolean) {
  line(g, cx, cy, cx, cy + s * 0.5, INK, 3);
  if (pine) {
    poly(g, [[cx - s * 0.42, cy + s * 0.28], [cx, cy - s * 0.75], [cx + s * 0.42, cy + s * 0.28]]);
    paint(g, leaf, INK, 2.2);
    poly(g, [[cx, cy - s * 0.75], [cx + s * 0.42, cy + s * 0.28], [cx + s * 0.05, cy + s * 0.28]]);
    paint(g, alpha('#000000', 0.22), null);
  } else {
    circle(g, cx, cy - s * 0.15, s * 0.42);
    paint(g, domeFill(g, cx, cy - s * 0.15, s * 0.42, leaf, 0.45), INK, 2.2);
  }
}

function tinyHouse(g: G, cx: number, by: number, s: number, roof: string, wall = '#d9cdb0') {
  rr(g, cx - s * 0.4, by - s * 0.45, s * 0.8, s * 0.45, 1);
  paint(g, wall, INK, 1.2);
  poly(g, [[cx - s * 0.52, by - s * 0.42], [cx, by - s * 0.85], [cx + s * 0.52, by - s * 0.42]]);
  paint(g, roof, INK, 1.2);
  rr(g, cx - s * 0.08, by - s * 0.24, s * 0.16, s * 0.24, 0.5);
  paint(g, '#4a3220', null);
}

function tinyTower(g: G, cx: number, by: number, s: number, wall: string, roof: string) {
  rr(g, cx - s * 0.18, by - s * 0.9, s * 0.36, s * 0.9, 1);
  paint(g, litFill(g, cx - s * 0.18, by - s * 0.9, s * 0.36, s * 0.9, wall, 0.3), INK, 1.3);
  poly(g, [[cx - s * 0.26, by - s * 0.88], [cx, by - s * 1.25], [cx + s * 0.26, by - s * 0.88]]);
  paint(g, roof, INK, 1.3);
  rr(g, cx - s * 0.05, by - s * 0.65, s * 0.1, s * 0.14, 0.5);
  paint(g, '#2a2420', null);
}

function flag(g: G, x: number, y: number, color: string) {
  line(g, x, y, x, y - 16, INK, 1.4);
  poly(g, [[x, y - 16], [x + 11, y - 13], [x, y - 10]]);
  paint(g, color, INK, 0.9);
}

// ---------------------------------------------------------------------------------------------------------

export const OUTDOOR2_OBJECTS: ObjDef[] = [
  // --- buildings (the door faces the bottom edge; rotate to turn them) ---
  houseDef({
    id: 'cottage', name: 'Cottage', w: 3, h: 3, roof: 'hip', style: 'thatch', chimney: [[0.66, 0.2]], sets: ['town', 'farm', 'forest'],
    tags: ['cottage', 'hut', 'home', 'village'], desc: 'A small one-room home under a hipped roof. Door at the bottom edge.',
  }),
  houseDef({
    id: 'house', name: 'House', w: 4, h: 3, roof: 'gable', style: 'shingle', chimney: [[0.18, 0.18]], sets: ['town', 'farm'],
    tags: ['home', 'townhouse', 'village', 'gable'], desc: 'A two-room town house with a gabled roof. Door at the bottom edge.',
  }),
  houseDef({
    id: 'house-large', name: 'Large house', w: 5, h: 4, roof: 'hip', style: 'slate', chimney: [[0.2, 0.22], [0.76, 0.22]], sets: ['town', 'castle'],
    tags: ['manor', 'mansion', 'merchant', 'guildhall'], desc: 'A big slate-roofed house: a merchant, a guild or the reeve. Door at the bottom edge.',
  }),
  houseDef({
    id: 'longhouse', name: 'Longhouse', w: 6, h: 3, roof: 'gable', style: 'thatch', chimney: [[0.48, 0.38]], sets: ['town', 'farm', 'winter', 'forest'],
    tags: ['hall', 'mead hall', 'barracks', 'village'], desc: 'A long hall with a smoke hole along the ridge. Door at the bottom edge.',
  }),
  houseDef({
    id: 'inn', name: 'Inn', w: 6, h: 5, roof: 'hip', style: 'tile', chimney: [[0.18, 0.2], [0.8, 0.2]], sets: ['town', 'tavern', 'market'],
    tags: ['tavern', 'pub', 'roadhouse', 'hostel'], desc: 'A big roadside inn with stables round the back. Door at the bottom edge.',
    extra: (g, w, h) => {
      // hanging sign by the door
      line(g, w / 2 + 22, h - 22, w / 2 + 40, h - 22, INK, 2);
      rr(g, w / 2 + 30, h - 20, 16, 12, 2);
      paint(g, '#8a5a2a', INK, 1.2);
    },
  }),
  houseDef({
    id: 'shop', name: 'Shop', w: 3, h: 4, roof: 'gable', style: 'tile', sets: ['town', 'market'],
    tags: ['store', 'smithy', 'bakery', 'workshop'], desc: 'A narrow shop front with living space above. Door at the bottom edge.',
    extra: (g, w, h, c, r) => {
      // striped awning over the door
      const y = h - 34;
      rr(g, w / 2 - 40, y, 80, 16, 2);
      paint(g, '#e6dcc4', INK, 1.4);
      g.save();
      rr(g, w / 2 - 40, y, 80, 16, 2);
      g.clip();
      for (let i = 0; i < 8; i += 2) { g.fillStyle = r() < 2 ? CLOTH.red : CLOTH.red; g.fillRect(w / 2 - 40 + i * 10, y, 10, 16); }
      g.restore();
    },
  }),
  houseDef({
    id: 'barn', name: 'Barn', w: 5, h: 4, roof: 'gable', style: 'shingle', sets: ['farm'],
    tags: ['stable', 'granary', 'hayloft', 'byre'], desc: 'A big timber barn with wide doors at the bottom edge.',
    extra: (g, w, h) => {
      rr(g, w / 2 - 30, h - 18, 60, 10, 1);
      paint(g, '#6b4428', INK, 1.4);
      line(g, w / 2, h - 18, w / 2, h - 8, INK, 1.2);
    },
  }),
  {
    id: 'chapel', name: 'Chapel', cat: 'structure', sets: ['town', 'temple'], tags: ['church', 'shrine', 'temple', 'building', 'steeple'],
    w: 4, h: 6, blocksMovement: true, blocksSight: true, solid: true, c: { roof: ROOF.slate, wall: '#c9c0ae' },
    variants: [{ name: 'Slate', c: {} }, { name: 'Red tile', c: { roof: ROOF.tile } }, { name: 'Thatch', c: { roof: ROOF.thatch } }],
    desc: 'A village chapel with a bell tower at the far end. Door at the bottom edge.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      wallBase(g, 30, 60, w - 60, h - 72, c.wall);
      gableRoof(g, 28, 70, w - 56, h - 90, c.roof, c.roof === ROOF.thatch ? 'thatch' : c.roof === ROOF.tile ? 'tile' : 'slate', r);
      door(g, w / 2, h - 18);
      // tower
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(w / 2 - 50, 20, 110, 104);
      rr(g, w / 2 - 55, 12, 110, 104, 3);
      paint(g, litFill(g, w / 2 - 55, 12, 110, 104, c.wall, 0.25), INK, LW);
      poly(g, [[w / 2 - 55, 12], [w / 2 + 55, 12], [w / 2, 64]]); paint(g, shade(c.roof, 0.15), INK, 1.2);
      poly(g, [[w / 2 - 55, 116], [w / 2 + 55, 116], [w / 2, 64]]); paint(g, shade(c.roof, -0.25), INK, 1.2);
      poly(g, [[w / 2 - 55, 12], [w / 2 - 55, 116], [w / 2, 64]]); paint(g, shade(c.roof, 0.05), INK, 1.2);
      poly(g, [[w / 2 + 55, 12], [w / 2 + 55, 116], [w / 2, 64]]); paint(g, shade(c.roof, -0.12), INK, 1.2);
      circle(g, w / 2, 64, 6); paint(g, '#c9a24a', INK, 1.2);
    },
  },
  {
    id: 'tower-stone', name: 'Stone tower', cat: 'structure', sets: ['castle', 'town', 'forest'], tags: ['tower', 'wizard', 'keep', 'watchtower', 'building'],
    w: 3, h: 3, blocksMovement: true, blocksSight: true, solid: true, c: { stone: STONE.grey, roof: ROOF.slate },
    variants: [{ name: 'Slate cone', c: {} }, { name: 'Red cone', c: { roof: ROOF.tile } }, { name: 'Open top', c: { roof: '' } }, { name: 'Dark stone', c: { stone: STONE.dark, roof: '#3c3550' } }],
    desc: 'A round stone tower. With an open top you see the battlements.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const cx = w / 2, cy = h / 2, R = 138;
      g.fillStyle = 'rgba(0,0,0,0.3)';
      circle(g, cx + 7, cy + 9, R); g.fill();
      circle(g, cx, cy, R);
      paint(g, shade(c.stone, -0.1), INK, LW);
      g.save(); circle(g, cx, cy, R); g.clip(); blocks(g, 0, 0, w, h, c.stone, r, 22, 13); g.restore();
      if (c.roof) {
        const n = 16;
        for (let i = 0; i < n; i++) {
          const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU;
          const lit = Math.cos((a0 + a1) / 2 + Math.PI * 0.75);
          poly(g, [[cx, cy], [cx + Math.cos(a0) * (R - 8), cy + Math.sin(a0) * (R - 8)], [cx + Math.cos(a1) * (R - 8), cy + Math.sin(a1) * (R - 8)]]);
          paint(g, shade(c.roof, lit * 0.22), alpha(INK, 0.7), 1);
        }
        circle(g, cx, cy, 8); paint(g, '#c9a24a', INK, 1.4);
      } else {
        circle(g, cx, cy, R - 26);
        paint(g, litFill(g, cx - R, cy - R, R * 2, R * 2, shade(c.stone, -0.3), 0.2), INK, 1.6);
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * TAU;
          const mx = cx + Math.cos(a) * (R - 13), my = cy + Math.sin(a) * (R - 13);
          rr(g, mx - 8, my - 8, 16, 16, 2);
          paint(g, litFill(g, mx - 8, my - 8, 16, 16, shade(c.stone, 0.1), 0.3), INK, 1.2);
        }
        // trapdoor down
        rr(g, cx - 18, cy - 18, 36, 36, 2); paint(g, '#5a3a20', INK, 1.4);
      }
    },
  },
  {
    id: 'windmill', name: 'Windmill', cat: 'structure', sets: ['farm', 'town'], tags: ['mill', 'sails', 'grain', 'building'],
    w: 3, h: 3, blocksMovement: true, blocksSight: true, solid: true, c: { roof: ROOF.shingle, wall: '#d6cbb2', sail: '#e6dcc4' },
    desc: 'A post windmill. The sails turn slowly over everything else.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const cx = w / 2, cy = h / 2;
      g.fillStyle = 'rgba(0,0,0,0.28)';
      circle(g, cx + 6, cy + 8, 70); g.fill();
      circle(g, cx, cy, 70); paint(g, c.wall, INK, LW);
      for (let i = 0; i < 12; i++) {
        const a0 = (i / 12) * TAU, a1 = ((i + 1) / 12) * TAU;
        poly(g, [[cx, cy], [cx + Math.cos(a0) * 64, cy + Math.sin(a0) * 64], [cx + Math.cos(a1) * 64, cy + Math.sin(a1) * 64]]);
        paint(g, shade(c.roof, Math.cos((a0 + a1) / 2 + Math.PI * 0.75) * 0.2), alpha(INK, 0.6), 1);
      }
      const rot = 0.35 + r() * 0.5;
      for (let k = 0; k < 4; k++) {
        const a = rot + (k * TAU) / 4;
        g.save();
        g.translate(cx, cy);
        g.rotate(a);
        line(g, 0, 0, 0, -138, INK, 6);
        line(g, 0, 0, 0, -138, '#6b4428', 3.5);
        rr(g, 4, -136, 26, 92, 2);
        paint(g, alpha(c.sail, 0.92), INK, 1.4);
        for (let j = 1; j < 5; j++) line(g, 4, -136 + j * 18.4, 30, -136 + j * 18.4, alpha(INK, 0.45), 0.8);
        g.restore();
      }
      circle(g, cx, cy, 9); paint(g, '#4a3220', INK, 1.4);
    },
  },
  {
    id: 'watchtower-wood', name: 'Wooden watchtower', cat: 'structure', sets: ['camp', 'castle', 'forest', 'town'], tags: ['lookout', 'tower', 'palisade', 'guard'],
    w: 2, h: 2, blocksSight: true, c: { wood: '#7a5634', roof: ROOF.shingle },
    desc: 'A lookout on four posts with a little roof. Archers stand up top.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (const [x, y] of [[18, 18], [w - 18, 18], [18, h - 18], [w - 18, h - 18]]) logEnd(g, x, y, 10, c.wood);
      line(g, 18, 18, w - 18, h - 18, alpha(INK, 0.8), 3);
      line(g, w - 18, 18, 18, h - 18, alpha(INK, 0.8), 3);
      hipRoof(g, 26, 26, w - 52, h - 52, c.roof, 'shingle', r);
    },
  },
  {
    id: 'well-house', name: 'Covered well', cat: 'structure', sets: ['town', 'farm', 'market'], tags: ['well', 'water', 'square', 'roof'],
    w: 2, h: 2, c: { roof: ROOF.shingle, stone: STONE.grey },
    desc: 'A village well under a little gabled roof, with a bucket and winch.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      circle(g, w / 2, h / 2, 62); paint(g, shade(c.stone, -0.1), INK, LW);
      g.save(); circle(g, w / 2, h / 2, 62); g.clip(); blocks(g, 0, 0, w, h, c.stone, r, 16, 10); g.restore();
      circle(g, w / 2, h / 2, 36); paint(g, '#152230', INK, 1.6);
      gableRoof(g, w / 2 - 54, h / 2 - 30, 108, 60, c.roof, 'shingle', r);
    },
  },

  // --- walls, gates and fences (one square long; turn them to run up and down) ---
  {
    id: 'wall-stone', name: 'Stone wall', cat: 'structure', sets: ['town', 'castle', 'farm'], tags: ['wall', 'town wall', 'enclosure', 'barrier'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { stone: STONE.grey },
    variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { stone: STONE.sand } }, { name: 'Dark', c: { stone: STONE.dark } }, { name: 'Mossy', c: { stone: '#7a8466' } }],
    desc: 'A tall mortared wall, one square long. Blocks movement and sight. Line several up.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.fillRect(-2, h / 2 - 18, w + 4, 44);
      stoneCourse(g, -2, h / 2 - 22, w + 4, 44, c.stone, r, 18, 11);
      line(g, 0, h / 2 - 22 + 4, w, h / 2 - 22 + 4, alpha(shade(c.stone, 0.4), 0.5), 1.4);
    },
  },
  {
    id: 'wall-castle', name: 'Castle wall', cat: 'structure', sets: ['castle'], tags: ['rampart', 'battlements', 'crenellations', 'curtain wall', 'fortress'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { stone: '#8a8378' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { stone: STONE.sand } }, { name: 'Dark', c: { stone: STONE.dark } }],
    desc: 'A thick curtain wall with a walkway between the battlements. One square long.',
    draw: ({ g, w, h, c, seed }) => battlements(g, -2, 4, w + 4, h - 8, c.stone, rng(seed)),
  },
  {
    id: 'castle-tower', name: 'Wall tower', cat: 'structure', sets: ['castle'], tags: ['bastion', 'turret', 'corner tower', 'fortress'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, solid: true, c: { stone: '#8a8378' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { stone: STONE.sand } }, { name: 'Dark', c: { stone: STONE.dark } }],
    desc: 'A square tower to anchor castle walls at corners and gates.',
    draw: ({ g, w, h, c, seed }) => {
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(10, 12, w - 8, h - 8);
      battlements(g, 2, 2, w - 4, h - 4, c.stone, rng(seed));
      rr(g, w / 2 - 14, h / 2 - 14, 28, 28, 2); paint(g, '#5a3a20', INK, 1.4);
    },
  },
  {
    id: 'castle-gate', name: 'Castle gatehouse', cat: 'structure', sets: ['castle', 'town'], tags: ['gate', 'gatehouse', 'portcullis', 'town gate', 'entrance'],
    w: 3, h: 2, blocksSight: true, c: { stone: '#8a8378', wood: '#6b4428' },
    variants: [{ name: 'Open', c: {}, f: { open: 1 } }, { name: 'Shut', c: {}, f: { open: 0 } }],
    desc: 'Two squat towers and a gate between them. Open, the middle square is a passage.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(8, 10, w - 6, h - 6);
      battlements(g, 0, 0, 100, h, c.stone, r);
      battlements(g, w - 100, 0, 100, h, c.stone, r);
      rr(g, 100, 30, 100, h - 60, 1);
      paint(g, '#3e3a35', INK, 1.4);
      if (f.open) {
        // portcullis raised: the arch shadow and an open passage
        rr(g, 104, 34, 92, 16, 1); paint(g, 'rgba(0,0,0,0.4)', null);
      } else {
        rr(g, 102, h / 2 - 12, 96, 24, 2); paint(g, c.wood, INK, 1.6);
        for (let i = 1; i < 6; i++) line(g, 102 + i * 16, h / 2 - 12, 102 + i * 16, h / 2 + 12, alpha(INK, 0.6), 1);
      }
    },
  },
  {
    id: 'palisade', name: 'Palisade', cat: 'structure', sets: ['camp', 'forest', 'castle', 'town'], tags: ['stockade', 'stakes', 'log wall', 'fort'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { wood: '#7a5634' },
    desc: 'A row of sharpened logs, one square long. Line several up for a fort.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(-2, h / 2 - 8, w + 4, 30);
      for (let i = 0; i < 6; i++) logEnd(g, 8 + i * 17 + (r() - 0.5) * 2, h / 2 + (r() - 0.5) * 4, 9 + r() * 1.5, shade(c.wood, (r() - 0.5) * 0.2));
    },
  },
  {
    id: 'palisade-gate', name: 'Palisade gate', cat: 'structure', sets: ['camp', 'forest', 'castle', 'town'], tags: ['gate', 'stockade', 'fort', 'door'],
    w: 2, h: 1, blocksSight: true, c: { wood: '#7a5634' },
    variants: [{ name: 'Shut', c: {}, f: { open: 0 } }, { name: 'Open', c: {}, f: { open: 1 } }],
    desc: 'A heavy log gate between two posts.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      logEnd(g, 10, h / 2, 12, c.wood);
      logEnd(g, w - 10, h / 2, 12, c.wood);
      if (f.open) {
        for (const [x, a] of [[22, 1.3], [w - 22, -1.3 + Math.PI]] as [number, number][]) {
          g.save(); g.translate(x, h / 2); g.rotate(a);
          rr(g, 0, -7, 76, 14, 2); paint(g, litFill(g, 0, -7, 76, 14, c.wood, 0.2), INK, 1.6);
          g.restore();
        }
      } else {
        rr(g, 22, h / 2 - 8, w - 44, 16, 2);
        paint(g, litFill(g, 22, h / 2 - 8, w - 44, 16, c.wood, 0.2), INK, 1.6);
        for (let i = 1; i < 8; i++) line(g, 22 + i * 19.5, h / 2 - 8, 22 + i * 19.5, h / 2 + 8, alpha(INK, 0.5), 1);
        line(g, 30, h / 2, w - 30, h / 2, alpha(shade(c.wood, -0.5), 0.7), 2);
        void r;
      }
    },
  },
  {
    id: 'fence-picket', name: 'Picket fence', cat: 'structure', sets: ['town', 'farm'], tags: ['fence', 'garden', 'yard'],
    w: 1, h: 1, c: { wood: '#d9cdb0' },
    variants: [{ name: 'White', c: {} }, { name: 'Weathered', c: { wood: '#9a8a70' } }],
    desc: 'A low garden fence. Easy to step over (difficult terrain if you like).',
    draw: ({ g, w, h, c }) => {
      line(g, 0, h / 2, w, h / 2, INK, 4);
      line(g, 0, h / 2, w, h / 2, c.wood, 2);
      for (let i = 0; i < 6; i++) { rr(g, 4 + i * 17, h / 2 - 5, 7, 10, 1); paint(g, c.wood, INK, 1.1); }
    },
  },

  // --- bridges and roads ---
  {
    id: 'bridge-stone', name: 'Stone bridge', cat: 'structure', sets: ['town', 'castle', 'forest', 'farm'], tags: ['bridge', 'arch', 'river', 'crossing'],
    w: 2, h: 4, layer: 'floor', c: { stone: STONE.grey },
    variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { stone: STONE.sand } }, { name: 'Mossy', c: { stone: '#7a8466' } }],
    desc: 'An arched stone bridge, two squares wide. Lay it across a river: walk over it.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(4, 14, w, h - 16);
      rr(g, 0, 6, w, h - 12, 4);
      paint(g, shade(c.stone, -0.05), INK, LW);
      g.save(); rr(g, 14, 6, w - 28, h - 12, 2); g.clip(); blocks(g, 14, 6, w - 28, h - 12, shade(c.stone, 0.05), r, 24, 16); g.restore();
      // parapets
      for (const x of [0, w - 14]) {
        rr(g, x, 2, 14, h - 4, 3);
        paint(g, litFill(g, x, 2, 14, h - 4, shade(c.stone, 0.12), 0.3), INK, 1.6);
        for (let y = 14; y < h - 10; y += 22) line(g, x + 1, y, x + 13, y, alpha(INK, 0.55), 1);
      }
    },
  },
  {
    id: 'ford-stones', name: 'Stepping stones', cat: 'terrain', sets: ['forest', 'farm', 'swamp'], tags: ['ford', 'river', 'crossing', 'stones'],
    w: 1, h: 3, layer: 'floor', c: { stone: '#8a8780' },
    desc: 'Flat stones across a stream. Difficult terrain, but no swimming.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 6; i++) stone(g, w / 2 + (r() - 0.5) * 30, 26 + i * 50, 18 + r() * 8, c.stone, r, 14 + r() * 6);
    },
  },

  // --- ruins ---
  {
    id: 'ruin-walls', name: 'Ruined walls', cat: 'structure', sets: ['forest', 'castle', 'desert', 'crypt'], tags: ['ruins', 'broken walls', 'foundation', 'remains'],
    w: 4, h: 4, layer: 'floor', c: { stone: STONE.grey, moss: '#5d7a3a' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { stone: STONE.sand, moss: '#9a8a5a' } }, { name: 'Dark', c: { stone: STONE.dark } }],
    desc: 'The broken stumps of a building\'s walls with rubble inside. Low enough to see over.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const segs: [number, number, number, number][] = [[20, 20, w - 20, 20], [w - 20, 20, w - 20, h - 20], [w - 20, h - 20, 20, h - 20], [20, h - 20, 20, 20]];
      for (const [x1, y1, x2, y2] of segs) {
        const len = Math.hypot(x2 - x1, y2 - y1);
        let t = 0;
        while (t < len) {
          const run = 40 + r() * 90, gap = r() < 0.55 ? 20 + r() * 50 : 0;
          const a = t / len, b = Math.min(1, (t + run) / len);
          const ax = x1 + (x2 - x1) * a, ay = y1 + (y2 - y1) * a, bx = x1 + (x2 - x1) * b, by = y1 + (y2 - y1) * b;
          const x = Math.min(ax, bx) - 11, y = Math.min(ay, by) - 11;
          stoneCourse(g, x, y, Math.abs(bx - ax) + 22, Math.abs(by - ay) + 22, c.stone, r, 16, 10);
          t += run + gap;
        }
      }
      for (let i = 0; i < 9; i++) stone(g, 40 + r() * (w - 80), 40 + r() * (h - 80), 6 + r() * 8, shade(c.stone, (r() - 0.5) * 0.3), r);
      for (let i = 0; i < 10; i++) {
        blob(g, lumpy(15 + r() * (w - 30), 15 + r() * (h - 30), 8 + r() * 10, 0.4, 7, r));
        paint(g, alpha(c.moss, 0.55), null);
      }
    },
  },
  {
    id: 'ruin-arch', name: 'Ruined arch', cat: 'structure', sets: ['forest', 'castle', 'desert', 'temple'], tags: ['ruins', 'arch', 'gateway', 'columns'],
    w: 3, h: 1, c: { stone: STONE.grey },
    variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { stone: STONE.sand } }, { name: 'Marble', c: { stone: STONE.marble } }],
    desc: 'A standing arch from a fallen hall. Walk under it.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (const x of [26, w - 26]) {
        circle(g, x, h / 2, 22);
        paint(g, domeFill(g, x, h / 2, 22, c.stone, 0.35), INK, LW);
      }
      rr(g, 20, h / 2 - 12, w - 40, 24, 4);
      paint(g, litFill(g, 20, h / 2 - 12, w - 40, 24, shade(c.stone, 0.08), 0.3), INK, 1.8);
      for (let x = 48; x < w - 40; x += 26) line(g, x, h / 2 - 12, x - 3, h / 2 + 12, alpha(INK, 0.5), 1);
      stone(g, w / 2 + 30, h / 2 + 34, 8, c.stone, r);
    },
  },
  {
    id: 'ruin-tower', name: 'Ruined tower', cat: 'structure', sets: ['forest', 'castle'], tags: ['ruins', 'tower', 'broken', 'stump'],
    w: 3, h: 3, layer: 'floor', c: { stone: STONE.grey, moss: '#5d7a3a' },
    desc: 'The broken ring of a fallen tower, open to the sky, rubble spilling out of a gap.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const cx = w / 2, cy = h / 2;
      const gap = r() * TAU;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU;
        const d = Math.abs(((a - gap + Math.PI * 3) % TAU) - Math.PI);
        if (d < 0.5) continue;
        const R = 118, ht = d < 1 ? 12 : 22;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2);
        rr(g, -22, -ht / 2, 44, ht + 8, 3);
        paint(g, litFill(g, -22, -ht / 2, 44, ht + 8, shade(c.stone, (r() - 0.5) * 0.2), 0.25), INK, 1.6);
        g.restore();
      }
      for (let i = 0; i < 12; i++) {
        const a = gap + (r() - 0.5) * 0.9, d = 60 + r() * 100;
        stone(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 7 + r() * 9, shade(c.stone, (r() - 0.5) * 0.3), r);
      }
      for (let i = 0; i < 6; i++) { blob(g, lumpy(cx + (r() - 0.5) * 160, cy + (r() - 0.5) * 160, 10 + r() * 12, 0.4, 7, r)); paint(g, alpha(c.moss, 0.5), null); }
    },
  },
  {
    id: 'gravestone', name: 'Gravestone', cat: 'religious', sets: ['town', 'crypt', 'temple'], tags: ['grave', 'tombstone', 'cemetery', 'headstone', 'graveyard'],
    w: 1, h: 1, c: { stone: '#8a8780' },
    variants: [{ name: 'Rounded', c: {}, f: { k: 0 } }, { name: 'Cross', c: {}, f: { k: 1 } }, { name: 'Leaning', c: {}, f: { k: 2 } }],
    desc: 'A headstone with a grave mound in front of it.',
    draw: ({ g, w, h, c, f }) => {
      rr(g, w / 2 - 20, 40, 40, 52, 10);
      paint(g, alpha('#4a3a28', 0.55), null);
      g.save();
      if (f.k === 2) { g.translate(w / 2, 30); g.rotate(0.25); g.translate(-w / 2, -30); }
      if (f.k === 1) {
        rr(g, w / 2 - 6, 6, 12, 40, 2); paint(g, litFill(g, w / 2 - 6, 6, 12, 40, c.stone, 0.3), INK, 1.6);
        rr(g, w / 2 - 18, 16, 36, 11, 2); paint(g, litFill(g, w / 2 - 18, 16, 36, 11, c.stone, 0.3), INK, 1.6);
      } else {
        g.beginPath();
        g.moveTo(w / 2 - 22, 38); g.lineTo(w / 2 - 22, 22); g.arc(w / 2, 22, 22, Math.PI, 0); g.lineTo(w / 2 + 22, 38); g.closePath();
        paint(g, litFill(g, w / 2 - 22, 0, 44, 38, c.stone, 0.3), INK, 1.8);
        line(g, w / 2 - 10, 22, w / 2 + 10, 22, alpha(INK, 0.5), 1);
      }
      g.restore();
    },
  },

  // --- trees and rocks ---
  {
    id: 'tree-cluster', name: 'Tree clump', cat: 'nature', sets: ['forest', 'farm', 'camp'], tags: ['trees', 'woods', 'grove', 'canopy', 'cover'],
    w: 4, h: 4, layer: 'overhead', blocksSight: true, c: { leaf: '#4f7a34', leaf2: '#3e6a2c', trunk: '#5a3d24' },
    variants: [{ name: 'Summer', c: {} }, { name: 'Autumn', c: { leaf: '#b5602a', leaf2: '#c9893a' } }, { name: 'Dark wood', c: { leaf: '#2f4f2a', leaf2: '#3a5a30' } }, { name: 'Pale spring', c: { leaf: '#7aa040', leaf2: '#5f8a34' } }],
    desc: 'Several broadleaf trees with their canopies touching. Hides what is under it.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const pts: [number, number, number][] = [];
      for (let i = 0; i < 5; i++) pts.push([70 + r() * (w - 140), 70 + r() * (h - 140), 70 + r() * 30]);
      for (const [x, y, rad] of pts) canopyShadow(g, x, y, rad);
      for (const [x, y] of pts) trunkRoots(g, x, y, 34, c.trunk, r, 3);
      pts.sort((a, b) => b[1] - a[1]);
      pts.forEach(([x, y, rad], i) => foliage(g, x, y, rad, i % 2 ? c.leaf : c.leaf2, r, 10));
    },
  },
  {
    id: 'tree-large', name: 'Great tree', cat: 'nature', sets: ['forest', 'town', 'farm'], tags: ['oak', 'ancient', 'tree', 'canopy', 'landmark'],
    w: 5, h: 5, layer: 'overhead', blocksSight: true, c: { leaf: '#46703a', trunk: '#4e3420' },
    variants: [{ name: 'Summer', c: {} }, { name: 'Autumn', c: { leaf: '#a8552a' } }, { name: 'Blossom', c: { leaf: '#d98fb0' } }, { name: 'Eldritch', c: { leaf: '#4a3a6a' } }],
    desc: 'An ancient tree with a huge canopy, a landmark for a whole map.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      canopyShadow(g, w / 2, h / 2, 225);
      trunkRoots(g, w / 2, h / 2, 120, c.trunk, r, 7);
      foliage(g, w / 2, h / 2, 228, c.leaf, r, 22);
    },
  },
  {
    id: 'rock-outcrop', name: 'Rock outcrop', cat: 'terrain', sets: ['forest', 'cave', 'desert', 'winter', 'mine'], tags: ['rocks', 'crag', 'tor', 'cover', 'boulders'],
    w: 3, h: 3, blocksSight: true, c: { stone: '#857f75', moss: '#5d7a3a' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Red rock', c: { stone: '#9a5a48', moss: '#8a7a4a' } }, { name: 'Sandstone', c: { stone: STONE.sand, moss: '#9a8a5a' } }, { name: 'Snowy', c: { stone: '#7a7a80', moss: '#eef3f7' } }],
    desc: 'A heap of big rocks rising out of the ground. Climb it (difficult) or hide behind it.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      blob(g, lumpy(w / 2 + 12, h / 2 + 16, 120, 0.25, 12, r)); g.fill();
      const rocks: [number, number, number][] = [];
      for (let i = 0; i < 7; i++) rocks.push([w / 2 + (r() - 0.5) * 140, h / 2 + (r() - 0.5) * 140, 34 + r() * 30]);
      rocks.push([w / 2, h / 2, 62]);
      rocks.sort((a, b) => a[2] - b[2]).reverse();
      for (const [x, y, rad] of rocks) {
        blob(g, lumpy(x, y, rad, 0.22, 9, r));
        paint(g, domeFill(g, x, y, rad, shade(c.stone, (r() - 0.5) * 0.2), 0.4), INK, LW);
        g.strokeStyle = alpha(INK, 0.45);
        g.lineWidth = 1.1;
        g.beginPath();
        g.moveTo(x - rad * 0.3, y - rad * 0.1);
        g.lineTo(x + rad * 0.1, y + rad * 0.2);
        g.lineTo(x + rad * 0.35, y + rad * 0.1);
        g.stroke();
        if (r() < 0.5) { blob(g, lumpy(x - rad * 0.3, y - rad * 0.35, rad * 0.3, 0.4, 7, r)); paint(g, alpha(c.moss, 0.6), null); }
      }
    },
  },

  // --- region maps: one square is a mile ---
  ...regionIcons(),
];

function regionIcons(): ObjDef[] {
  const base = { cat: 'terrain' as const, sets: ['forest', 'town', 'castle', 'desert', 'winter'] as ObjDef['sets'], flat: true };
  return [
    {
      ...base, id: 'region-mountains', name: 'Region: mountains', tags: ['region', 'overworld', 'mountain range', 'peaks', 'world map'],
      w: 3, h: 2, c: { rock: '#8a8270', snow: '#f2f5f7' },
      variants: [{ name: 'Grey', c: {} }, { name: 'Brown', c: { rock: '#8a6a4a' } }, { name: 'Volcanic', c: { rock: '#4a4040', snow: '#d26a2a' } }],
      desc: 'A range of peaks for a region map (one square is a mile).',
      draw: ({ g, w, h, c, seed }) => {
        const r = rng(seed);
        const peaks = [[0.22, 0.6, 52], [0.5, 0.85, 70], [0.78, 0.65, 54], [0.36, 0.4, 40], [0.64, 0.45, 44]];
        peaks.sort((a, b) => a[1] - b[1]);
        for (const [x, s, hw] of peaks) mountain(g, x * w, h - 18 - (1 - s) * 30, hw, hw * 1.5 * s + 40, c.rock, c.snow, r);
      },
    },
    {
      ...base, id: 'region-peak', name: 'Region: lone peak', tags: ['region', 'overworld', 'mountain', 'world map'],
      w: 2, h: 2, c: { rock: '#8a8270', snow: '#f2f5f7' },
      draw: ({ g, w, h, c, seed }) => mountain(g, w / 2, h - 22, 80, 150, c.rock, c.snow, rng(seed)),
    },
    {
      ...base, id: 'region-hills', name: 'Region: hills', tags: ['region', 'overworld', 'hills', 'downs', 'world map'],
      w: 2, h: 1, c: { hill: '#8aa055' },
      variants: [{ name: 'Green', c: {} }, { name: 'Dry', c: { hill: '#b59a5a' } }, { name: 'Snowy', c: { hill: '#dfe6ea' } }],
      draw: ({ g, w, h, c }) => { hill(g, w * 0.32, h - 18, 60, 46, shade(c.hill, -0.05)); hill(g, w * 0.66, h - 12, 66, 56, c.hill); },
    },
    {
      ...base, id: 'region-forest', name: 'Region: forest', tags: ['region', 'overworld', 'woods', 'trees', 'world map'],
      w: 2, h: 2, c: { leaf: '#2f5a24' },
      variants: [{ name: 'Broadleaf', c: {}, f: { pine: 0 } }, { name: 'Pine', c: { leaf: '#1f4a2c' }, f: { pine: 1 } }, { name: 'Autumn', c: { leaf: '#b5602a' }, f: { pine: 0 } }, { name: 'Snowy pine', c: { leaf: '#d9e4ea' }, f: { pine: 1 } }],
      draw: ({ g, w, h, c, f, seed }) => {
        const r = rng(seed);
        const pts: number[][] = [];
        for (let i = 0; i < 8; i++) pts.push([34 + r() * (w - 68), 48 + r() * (h - 80)]);
        pts.sort((a, b) => a[1] - b[1]);
        for (const [x, y] of pts) tinyTree(g, x, y, 56 + r() * 14, shade(c.leaf, (r() - 0.5) * 0.25), !!f.pine);
      },
    },
    {
      ...base, id: 'region-village', name: 'Region: village', tags: ['region', 'overworld', 'hamlet', 'settlement', 'world map'],
      w: 1, h: 1, c: { roof: '#a5513a' },
      draw: ({ g, w, h, c }) => { tinyHouse(g, w * 0.36, h * 0.62, 40, c.roof); tinyHouse(g, w * 0.66, h * 0.82, 36, shade(c.roof, -0.15)); },
    },
    {
      ...base, id: 'region-town', name: 'Region: town', tags: ['region', 'overworld', 'town', 'settlement', 'world map'],
      w: 2, h: 2, c: { roof: '#a5513a', wall: '#8a8378' },
      draw: ({ g, w, h, c }) => {
        ellipse(g, w / 2, h * 0.62, 84, 58); paint(g, alpha('#d9cdb0', 0.35), alpha(INK, 0.5), 1.4);
        const spots = [[0.3, 0.55], [0.55, 0.45], [0.75, 0.6], [0.4, 0.78], [0.65, 0.82]];
        for (const [x, y] of spots) tinyHouse(g, x * w, y * h, 38, shade(c.roof, (x - 0.5) * 0.3));
        tinyTower(g, w * 0.5, h * 0.6, 50, '#c9c0ae', '#4f565e');
      },
    },
    {
      ...base, id: 'region-city', name: 'Region: walled city', tags: ['region', 'overworld', 'city', 'capital', 'world map'],
      w: 3, h: 3, c: { roof: '#a5513a', wall: '#8a8378' },
      draw: ({ g, w, h, c }) => {
        circle(g, w / 2, h / 2 + 10, 118); paint(g, alpha('#d9cdb0', 0.4), INK, 5);
        circle(g, w / 2, h / 2 + 10, 118); paint(g, 'rgba(0,0,0,0)', c.wall, 3);
        for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; tinyTower(g, w / 2 + Math.cos(a) * 118, h / 2 + 10 + Math.sin(a) * 118 + 14, 34, c.wall, '#4f565e'); }
        const spots = [[0.3, 0.45], [0.5, 0.35], [0.7, 0.45], [0.3, 0.65], [0.7, 0.68], [0.45, 0.8], [0.6, 0.82]];
        for (const [x, y] of spots) tinyHouse(g, x * w, y * h, 42, shade(c.roof, (x - 0.5) * 0.4));
        tinyTower(g, w / 2, h * 0.62, 80, '#c9c0ae', '#4f565e');
        flag(g, w / 2, h * 0.62 - 98, CLOTH.red);
      },
    },
    {
      ...base, id: 'region-castle', name: 'Region: castle', tags: ['region', 'overworld', 'castle', 'keep', 'fortress', 'world map'],
      w: 2, h: 2, c: { wall: '#8a8378', banner: CLOTH.blue },
      variants: [{ name: 'Blue banner', c: {} }, { name: 'Red banner', c: { banner: CLOTH.red } }, { name: 'Black banner', c: { banner: CLOTH.black } }, { name: 'Ruined', c: { banner: '' } }],
      draw: ({ g, w, h, c }) => {
        rr(g, 40, 90, 120, 70, 2); paint(g, litFill(g, 40, 90, 120, 70, c.wall, 0.3), INK, 1.8);
        for (let x = 40; x < 160; x += 20) { rr(g, x, 82, 12, 10, 1); paint(g, c.wall, INK, 1.2); }
        tinyTower(g, 44, 160, 90, c.wall, '#4f565e');
        tinyTower(g, 156, 160, 90, c.wall, '#4f565e');
        tinyTower(g, 100, 150, 120, shade(c.wall, 0.1), '#4f565e');
        rr(g, 88, 128, 24, 32, 10); paint(g, '#3a2a1c', INK, 1.4);
        if (c.banner) flag(g, 100, 150 - 150, c.banner);
      },
    },
    {
      ...base, id: 'region-tower', name: 'Region: tower', tags: ['region', 'overworld', 'tower', 'wizard', 'world map'],
      w: 1, h: 1, c: { wall: '#c9c0ae', roof: '#4a3a6a' },
      draw: ({ g, w, h, c }) => tinyTower(g, w / 2, h - 10, 72, c.wall, c.roof),
    },
    {
      ...base, id: 'region-ruins', name: 'Region: ruins', tags: ['region', 'overworld', 'ruins', 'dungeon', 'world map'],
      w: 1, h: 1, c: { stone: '#9a9488' },
      draw: ({ g, w, h, c }) => {
        for (const [x, ht] of [[24, 40], [46, 26], [70, 46]]) { rr(g, x, h - 18 - ht, 12, ht, 1); paint(g, litFill(g, x, h - 18 - ht, 12, ht, c.stone, 0.3), INK, 1.3); }
        line(g, 20, h - 66, 60, h - 72, INK, 3); line(g, 20, h - 66, 60, h - 72, c.stone, 1.6);
        line(g, 14, h - 16, 88, h - 16, alpha(INK, 0.5), 1.4);
      },
    },
    {
      ...base, id: 'region-cave', name: 'Region: cave mouth', tags: ['region', 'overworld', 'cave', 'dungeon', 'lair', 'world map'],
      w: 1, h: 1, c: { rock: '#8a8270' },
      draw: ({ g, w, h, c }) => {
        g.beginPath(); g.moveTo(8, h - 14); g.quadraticCurveTo(w / 2, -10, w - 8, h - 14); paint(g, litFill(g, 8, 10, w - 16, h - 24, c.rock, 0.3), INK, 1.8);
        g.beginPath(); g.moveTo(30, h - 14); g.quadraticCurveTo(w / 2, 26, w - 30, h - 14); paint(g, '#15110e', INK, 1.4);
      },
    },
    {
      ...base, id: 'region-port', name: 'Region: harbour', tags: ['region', 'overworld', 'port', 'harbor', 'docks', 'world map'],
      w: 2, h: 2, c: { roof: '#a5513a', sail: '#e6dcc4' },
      draw: ({ g, w, h, c }) => {
        for (const [x, y] of [[0.3, 0.42], [0.55, 0.36], [0.42, 0.6]]) tinyHouse(g, x * w, y * h, 40, c.roof);
        for (let i = 0; i < 3; i++) { rr(g, 64 + i * 34, 140, 10, 46, 1); paint(g, '#7a5634', INK, 1.2); }
        // a ship at anchor
        const sx = 160, sy = 160;
        g.beginPath(); g.moveTo(sx - 26, sy); g.quadraticCurveTo(sx, sy + 20, sx + 26, sy); g.closePath(); paint(g, '#6b4428', INK, 1.4);
        line(g, sx, sy, sx, sy - 44, INK, 1.6);
        poly(g, [[sx + 2, sy - 42], [sx + 22, sy - 8], [sx + 2, sy - 8]]); paint(g, c.sail, INK, 1.2);
      },
    },
    {
      ...base, id: 'region-camp', name: 'Region: camp', tags: ['region', 'overworld', 'camp', 'bandits', 'army', 'world map'],
      w: 1, h: 1, c: { canvas: '#cbb994' },
      draw: ({ g, w, h, c }) => {
        for (const [x, y, s] of [[30, 60, 26], [66, 72, 30]]) {
          poly(g, [[x - s * 0.7, y + s * 0.3], [x, y - s * 0.6], [x + s * 0.7, y + s * 0.3]]); paint(g, c.canvas, INK, 1.3);
          poly(g, [[x, y - s * 0.6], [x + s * 0.7, y + s * 0.3], [x + s * 0.1, y + s * 0.3]]); paint(g, alpha('#000000', 0.2), null);
        }
        flag(g, 50, 40, CLOTH.red);
      },
    },
    {
      ...base, id: 'region-volcano', name: 'Region: volcano', tags: ['region', 'overworld', 'volcano', 'fire', 'world map'],
      w: 2, h: 2, c: { rock: '#4a4040', fire: '#e2481b' },
      draw: ({ g, w, h, c, seed }) => {
        const r = rng(seed);
        poly(g, [[16, h - 20], [80, 60], [120, 60], [w - 16, h - 20]]); paint(g, litFill(g, 16, 60, w - 32, h - 80, c.rock, 0.35), INK, 1.8);
        ellipse(g, 100, 62, 22, 6); paint(g, c.fire, INK, 1.2);
        for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(90 + i * 10, 64); g.quadraticCurveTo(84 + i * 14 + r() * 8, 110, 70 + i * 30, h - 30); g.strokeStyle = c.fire; g.lineWidth = 3; g.stroke(); }
        g.fillStyle = 'rgba(80,70,70,0.35)';
        for (let i = 0; i < 4; i++) { circle(g, 100 + i * 12, 40 - i * 12, 12 + i * 4); g.fill(); }
      },
    },
    {
      ...base, id: 'region-swamp', name: 'Region: marsh', tags: ['region', 'overworld', 'swamp', 'bog', 'fen', 'world map'],
      w: 2, h: 1, c: { reed: '#6a7a3a', water: '#4a6a5a' },
      draw: ({ g, w, h, c, seed }) => {
        const r = rng(seed);
        for (let i = 0; i < 4; i++) { ellipse(g, 30 + i * 45, 60 + (i % 2) * 14, 22, 6); paint(g, alpha(c.water, 0.8), alpha(INK, 0.5), 1); }
        g.strokeStyle = c.reed; g.lineWidth = 1.6;
        for (let i = 0; i < 26; i++) { const x = 14 + r() * (w - 28), y = 40 + r() * 46; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - 14 - r() * 10); g.stroke(); }
      },
    },
    {
      ...base, id: 'region-compass', name: 'Compass rose', tags: ['region', 'overworld', 'compass', 'north', 'world map', 'decoration'],
      w: 3, h: 3, c: { ink: '#3a2a1c', gold: '#c99a2e' },
      draw: ({ g, w, h, c }) => {
        const cx = w / 2, cy = h / 2;
        circle(g, cx, cy, 110); paint(g, alpha('#efe6cf', 0.75), c.ink, 2);
        circle(g, cx, cy, 96); paint(g, 'rgba(0,0,0,0)', alpha(c.ink, 0.6), 1);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU - Math.PI / 2, L = i % 2 ? 62 : 104, s = i % 2 ? 9 : 15;
          const tip = [cx + Math.cos(a) * L, cy + Math.sin(a) * L];
          const l = [cx + Math.cos(a - Math.PI / 2) * s, cy + Math.sin(a - Math.PI / 2) * s];
          const rt = [cx + Math.cos(a + Math.PI / 2) * s, cy + Math.sin(a + Math.PI / 2) * s];
          poly(g, [[cx, cy], l, tip]); paint(g, i === 0 ? CLOTH.red : c.gold, c.ink, 1.2);
          poly(g, [[cx, cy], rt, tip]); paint(g, i === 0 ? shade(CLOTH.red, -0.3) : shade(c.gold, -0.35), c.ink, 1.2);
        }
        g.fillStyle = c.ink;
        g.font = 'bold 26px serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText('N', cx, cy - 128 + 0);
      },
    },
  ];
}

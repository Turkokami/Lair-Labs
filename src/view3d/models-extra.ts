// 3D models for the newer library objects in src/library/objects/extra.ts.
// Same scale as props3d.ts: 1 square = 1 world unit, y up, walls 2.4 tall, a person about 1.4. Local -z is the TOP edge of
// the object's overhead drawing, so wall pieces put their back at -d/2. Each model stays small (roughly 4 to 30 pieces)
// so a furnished map still runs on a phone. Light sources return the height of their flame.
import type { Kit, Spot } from './kit';
import type { Prop } from '../engine/map';
import { type Model, WOOD, DARKWOOD, IRON, STONE, GOLD, CLOTH, barrel, crate, legsTable, flameCup } from './modelkit';

const TAU = Math.PI * 2;
const WAX = '#efe4c8';
const BONE = '#e4dcc4';
const GLASS = '#a9c8d6';
const PAPER = '#efe6cf';
const BOOK_COLS = ['#7a2f2f', '#2f4f7a', '#3f6a3a', '#7a6a2f', '#4a3a5a', '#6b4a2b'];

/** Which variant the GM picked (some variants change the shape, not just the colour). */
const vi = (p: Prop) => p.v ?? 0;

/** A spot offset in the object's own frame, so sub-assemblies turn with it. */
function sub(O: Spot, lx: number, lz: number, dry = 0): Spot {
  const yaw = O.ry ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  return { x: O.x + lx * c + lz * s, z: O.z - lx * s + lz * c, ry: yaw + dry, y: O.y };
}

function lighten(hex: string, t: number) {
  const n = parseInt(hex.slice(1, 7), 16);
  const f = (v: number) => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0');
  return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`;
}

/** A flame: the usual warm one, or a coloured magical one. */
function fire(k: Kit, O: Spot, x: number, y: number, z: number, s: number, col = '#ffb02e') {
  if (col.toLowerCase() === '#ffb02e') return flameCup(k, O, x, y, z, s);
  k.S('glow', O, x, y + 0.08 * s, z, 0.07 * s, col);
  k.P('glow', O, 'cone', x, y + 0.2 * s, z, 0.1 * s, 0.22 * s, 0.1 * s, lighten(col, 0.5));
}

/** A candle standing on y with a flame on top. */
function candle(k: Kit, O: Spot, x: number, y: number, z: number, h = 0.14, wax = WAX, s = 0.35) {
  k.C('lit', O, x, y, z, 0.025, h, wax, 'cyl6');
  flameCup(k, O, x, y + h, z, s);
}

/** A table top on four legs at a local offset. */
function tableAt(k: Kit, O: Spot, x: number, z: number, w: number, d: number, h: number, col: string) {
  k.B('wood', O, x, h - 0.06, z, w, 0.06, d, col);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.B('wood', O, x + a * (w / 2 - 0.07), 0, z + b * (d / 2 - 0.07), 0.07, h - 0.06, 0.07, DARKWOOD);
}

/** A simple chair: seat, two side leg boards and a back. The back is toward -z, or +z when flip. */
function chairM(k: Kit, O: Spot, x: number, z: number, flip: boolean, col: string, cushion?: string) {
  const s = flip ? -1 : 1;
  k.B('wood', O, x, 0.42, z, 0.42, 0.05, 0.42, col);
  for (const a of [-1, 1]) k.B('wood', O, x + a * 0.18, 0, z, 0.04, 0.42, 0.36, DARKWOOD);
  k.B('wood', O, x, 0.47, z - s * 0.19, 0.42, 0.5, 0.05, col);
  if (cushion) k.B('fabric', O, x, 0.47, z + s * 0.02, 0.36, 0.05, 0.34, cushion);
}

/** Books on a shelf between x0 and x1: two or three blocks of spines, facing +z (or -z when back). */
function books(k: Kit, O: Spot, x0: number, x1: number, y: number, z: number, depth: number, R: () => number, maxH = 0.32, n = 3) {
  const span = x1 - x0;
  let x = x0;
  for (let i = 0; i < n; i++) {
    const bw = (span / n) * (0.75 + R() * 0.2), bh = maxH * (0.7 + R() * 0.3);
    k.B('fabric', O, x + bw / 2, y, z, bw, bh, depth, BOOK_COLS[Math.floor(R() * BOOK_COLS.length)]);
    x += span / n;
  }
}

/** Drawer fronts on the +z face of a cabinet, with a pull on each. */
function drawers(k: Kit, O: Spot, x: number, zFront: number, w: number, y0: number, rowH: number, rows: number, cols: number, col: string, metal: string) {
  const cw = w / cols;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = x - w / 2 + (c + 0.5) * cw, y = y0 + r * rowH;
    k.B('wood', O, cx, y + 0.02, zFront + 0.01, cw - 0.04, rowH - 0.04, 0.02, col);
    k.B('metal', O, cx, y + rowH / 2 - 0.02, zFront + 0.03, 0.1, 0.03, 0.03, metal);
  }
}

/** Ceiling height of the tall 3D halls (24 ft). Ceiling-hung pieces run their chain up to just below it. */
const HALL_H = 4.8;

export const EXTRA_MODELS: Record<string, Model> = {
  // ================================================================ lighting
  'chandelier-tiered': (k, O, w, d, R, c) => {
    const m = c('metal', GOLD), r1 = w * 0.36, r2 = w * 0.2;
    k.Beam('metal', O, [0, 2.4, 0], [0, 1.92, 0], 0.02, m);
    k.Ring('metal', O, 0, 1.95, 0, r1, 0.05, m);
    k.Ring('metal', O, 0, 2.13, 0, r2, 0.04, m);
    k.S('metal', O, 0, 1.9, 0, 0.07, m);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      flameCup(k, O, Math.cos(a) * r1, 1.96, Math.sin(a) * r1, 0.42);
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + 0.4;
      flameCup(k, O, Math.cos(a) * r2, 2.14, Math.sin(a) * r2, 0.38);
    }
    return 2.05;
  },
  'chandelier-crystal': (k, O, w, d, R, c) => {
    const m = c('metal', '#c9ced3'), cr = c('crystal', '#bfe6ff'), rr = w * 0.33;
    k.Beam('metal', O, [0, 2.4, 0], [0, 2.0, 0], 0.02, m);
    k.Ring('metal', O, 0, 2.0, 0, rr, 0.04, m);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.2;
      k.P('glow', O, 'oct', Math.cos(a) * w * 0.4, 1.88, Math.sin(a) * w * 0.4, 0.07, 0.16, 0.07, cr);
    }
    k.P('glow', O, 'oct', 0, 1.8, 0, 0.2, 0.36, 0.2, cr);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      flameCup(k, O, Math.cos(a) * rr, 2.01, Math.sin(a) * rr, 0.36);
    }
    return 2.0;
  },
  'chandelier-wheel': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', IRON), rr = w * 0.35;
    k.P('wood', O, 'torus', 0, 2.0, 0, rr * 2, 0.8, rr * 2, wood);
    for (let i = 0; i < 4; i++) k.P('wood', O, 'box', 0, 2.0, 0, rr * 1.95, 0.05, 0.06, wood, 0, (i / 4) * Math.PI, 0);
    k.C('wood', O, 0, 1.95, 0, 0.1, 0.1, DARKWOOD, 'cyl16');
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.5;
      k.Beam('metal', O, [Math.cos(a) * rr, 2.04, Math.sin(a) * rr], [0, 2.4, 0], 0.012, m);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + TAU / 16;
      flameCup(k, O, Math.cos(a) * rr, 2.06, Math.sin(a) * rr, 0.42);
    }
    return 2.1;
  },
  'chandelier-antler': (k, O, w, d, R, c) => {
    const b = c('bone', '#d6c7a3');
    k.Beam('metal', O, [0, 2.4, 0], [0, 2.05, 0], 0.015, IRON);
    k.S('lit', O, 0, 2.02, 0, 0.11, b, 'ico');
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU, mid = [Math.cos(a - 0.3) * 0.42, 1.94, Math.sin(a - 0.3) * 0.42], tip = [Math.cos(a) * w * 0.37, 2.16, Math.sin(a) * w * 0.37];
      k.Beam('lit', O, [0, 2.02, 0], mid, 0.035, b);
      k.Beam('lit', O, mid, tip, 0.025, b);
      flameCup(k, O, tip[0], tip[1], tip[2], 0.38);
    }
    return 2.15;
  },
  'candle-hoop': (k, O, w, d, R, c) => {
    const m = c('metal', IRON);
    k.Ring('metal', O, 0, 2.0, 0, 0.32, 0.04, m);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU - Math.PI / 2;
      k.Beam('metal', O, [Math.cos(a) * 0.32, 2.0, Math.sin(a) * 0.32], [0, 2.4, 0], 0.01, m);
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + 0.3;
      flameCup(k, O, Math.cos(a) * 0.32, 2.01, Math.sin(a) * 0.32, 0.34);
    }
    return 2.05;
  },
  'candelabra-grand': (k, O, w, d, R, c) => {
    const m = c('metal', GOLD), wax = c('wax', WAX);
    k.P('metal', O, 'cone', 0, 0.12, 0, 0.42, 0.24, 0.42, m);
    k.C('metal', O, 0, 0, 0, 0.035, 1.32, m, 'cyl6');
    k.Beam('metal', O, [-0.36, 1.42, 0], [0, 1.3, 0], 0.018, m);
    k.Beam('metal', O, [0, 1.3, 0], [0.36, 1.42, 0], 0.018, m);
    for (let i = 0; i < 7; i++) {
      const x = -0.36 + i * 0.12;
      candle(k, O, x, 1.3 + (Math.abs(x) / 0.36) * 0.12, 0, 0.14, wax, 0.36);
    }
    return 1.6;
  },
  'wall-candelabra': (k, O, w, d, R, c) => {
    const m = c('metal', GOLD), wax = c('wax', WAX), zb = -d / 2 + 0.03;
    k.B('metal', O, 0, 1.25, zb, 0.2, 0.3, 0.04, m);
    k.Beam('metal', O, [0, 1.38, zb], [0, 1.4, zb + 0.26], 0.018, m);
    k.Beam('metal', O, [-0.26, 1.45, zb + 0.24], [0.26, 1.45, zb + 0.24], 0.015, m);
    for (const x of [-0.26, 0, 0.26]) candle(k, O, x, 1.45, zb + 0.25 + (x ? 0 : 0.03), 0.14, wax, 0.36);
    return 1.65;
  },
  'oil-lamp-hanging': (k, O, w, d, R, c) => {
    const m = c('metal', GOLD);
    k.P('metal', O, 'hemi', 0, 1.95, 0, 0.5, -0.24, 0.5, m);
    k.S('metal', O, 0, 1.82, 0, 0.04, m);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + Math.PI / 6;
      k.Beam('metal', O, [Math.cos(a) * 0.24, 1.95, Math.sin(a) * 0.24], [0, 2.4, 0], 0.01, m);
      const b = a + Math.PI / 3;
      flameCup(k, O, Math.cos(b) * 0.17, 1.94, Math.sin(b) * 0.17, 0.3);
    }
    return 2.0;
  },
  'lamp-table': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', GOLD), light = c('light', '#ffcf70');
    k.C('wood', O, 0, 0.62, 0, 0.34, 0.05, wood, 'cyl16');
    k.C('wood', O, 0, 0, 0, 0.05, 0.62, DARKWOOD, 'cyl6');
    k.C('wood', O, 0, 0, 0, 0.2, 0.05, DARKWOOD, 'cyl16');
    k.P('metal', O, 'sph', 0, 0.71, -0.04, 0.2, 0.1, 0.2, m);
    k.C('glow', O, 0, 0.74, -0.04, 0.05, 0.16, lighten(light, 0.4), 'cyl16');
    k.S('glow', O, 0, 0.82, -0.04, 0.03, light);
    k.B('fabric', O, 0.1, 0.67, 0.14, 0.16, 0.04, 0.12, '#2f4f7a', 0, 0.3, 0);
    return 0.85;
  },
  'fire-bowl': (k, O, w, d, R, c) => {
    const m = c('metal', '#a8743c');
    k.C('metal', O, 0, 0, 0, 0.28, 0.08, m, 'cyl16');
    k.C('metal', O, 0, 0.08, 0, 0.08, 0.72, m, 'cyl16');
    k.P('metal', O, 'hemi', 0, 1.0, 0, 0.86, -0.3, 0.86, m);
    k.Ring('metal', O, 0, 1.0, 0, 0.43, 0.06, m);
    k.S('glow', O, 0, 0.97, 0, 0.3, '#ff7a1a', 'ico');
    fire(k, O, 0, 0.98, 0, 2.4, c('fire', '#ffb02e'));
    return 1.3;
  },
  'torch-standing': (k, O, w, d, R, c) => {
    k.Beam('wood', O, [0, 0, 0], [0, 1.42, 0], 0.035, c('wood', WOOD));
    k.C('fabric', O, 0, 1.38, 0, 0.06, 0.16, c('wrap', '#3a2a1c'), 'cyl6');
    fire(k, O, 0, 1.52, 0, 1.3, c('fire', '#ffb02e'));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + R();
      k.S('lit', O, Math.cos(a) * 0.17, 0.04, Math.sin(a) * 0.14, 0.06 + R() * 0.03, '#8a8780', 'ico');
    }
    return 1.75;
  },
  'crystal-lamp': (k, O, w, d, R, c) => {
    const st = c('stone', '#4e4b48'), cr = c('crystal', '#7fd6ff');
    k.B('stone', O, 0, 0, 0, 0.68, 0.12, 0.68, st);
    k.B('stone', O, 0, 0.12, 0, 0.5, 0.7, 0.5, st);
    k.B('lit', O, 0, 0.82, 0, 0.6, 0.08, 0.6, st);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + R(), h = 0.22 + R() * 0.25;
      k.P('glow', O, 'oct', Math.cos(a) * 0.1, 0.9 + h / 2, Math.sin(a) * 0.1, 0.1, h, 0.1, cr, Math.sin(a) * 0.4, 0, Math.cos(a) * 0.4);
    }
    k.P('glow', O, 'oct', 0, 1.1, 0, 0.14, 0.42, 0.14, lighten(cr, 0.25));
    return 1.25;
  },
  'candle-ring': (k, O, w, d, R, c) => {
    const wax = c('wax', WAX);
    k.Ring('deco', O, 0, 0.006, 0, w * 0.36, 0.02, c('chalk', '#e8e2d2'));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      candle(k, O, Math.cos(a) * w * 0.41, 0, Math.sin(a) * w * 0.41, 0.1 + R() * 0.12, wax, 0.34);
    }
    return 0.35;
  },
  'lantern-hook': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', IRON), light = c('light', '#ffcf70');
    k.Beam('wood', O, [-0.2, 0, -0.2], [-0.2, 1.75, -0.2], 0.04, wood);
    k.Beam('wood', O, [-0.2, 1.72, -0.2], [0.1, 1.82, 0.08], 0.03, wood);
    k.Beam('metal', O, [0.1, 1.82, 0.08], [0.1, 1.6, 0.08], 0.008, m);
    k.B('metal', O, 0.1, 1.36, 0.08, 0.16, 0.24, 0.16, m);
    k.S('glow', O, 0.1, 1.47, 0.08, 0.07, light);
    k.P('metal', O, 'pyr', 0.1, 1.64, 0.08, 0.2, 0.08, 0.2, m);
    return 1.48;
  },
  'lantern-wall': (k, O, w, d, R, c) => {
    const m = c('metal', '#33373c'), light = c('light', '#ffcf70'), zb = -d / 2 + 0.03;
    k.B('metal', O, 0, 1.45, zb, 0.16, 0.24, 0.04, m);
    k.Beam('metal', O, [0, 1.62, zb], [0, 1.62, zb + 0.32], 0.015, m);
    k.B('metal', O, 0, 1.3, zb + 0.32, 0.17, 0.25, 0.17, m);
    k.S('glow', O, 0, 1.42, zb + 0.32, 0.07, light);
    k.P('metal', O, 'pyr', 0, 1.59, zb + 0.32, 0.22, 0.08, 0.22, m);
    return 1.42;
  },
  'light-orb': (k, O, w, d, R, c) => {
    const orb = c('orb', '#9fd8ff');
    k.S('glow', O, 0, 1.9, 0, 0.14, lighten(orb, 0.35));
    k.P('glow', O, 'ring', 0, 1.9, 0, 0.62, 1.2, 0.62, orb, 0.5, 0, 0.2);
    k.P('glow', O, 'ring', 0, 1.9, 0, 0.5, 1.2, 0.5, orb, -0.3, 0, -0.6);
    return 1.9;
  },
  cresset: (k, O, w, d, R, c) => {
    const m = c('metal', '#33373c');
    k.C('metal', O, 0, 0, 0, 0.035, 1.55, m, 'cyl6');
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + Math.PI / 2;
      k.Beam('metal', O, [0, 0.35, 0], [Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36], 0.02, m);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      k.Beam('metal', O, [Math.cos(a) * 0.1, 1.55, Math.sin(a) * 0.1], [Math.cos(a) * 0.25, 1.9, Math.sin(a) * 0.25], 0.012, m);
    }
    k.Ring('metal', O, 0, 1.9, 0, 0.25, 0.04, m);
    k.S('glow', O, 0, 1.68, 0, 0.15, '#ff7a1a', 'ico');
    fire(k, O, 0, 1.72, 0, 1.7, c('fire', '#ffb02e'));
    return 2.0;
  },
  'floor-lamp': (k, O, w, d, R, c) => {
    const m = c('metal', GOLD);
    k.C('metal', O, 0, 0, 0, 0.18, 0.05, m, 'cyl16');
    k.C('metal', O, 0, 0.05, 0, 0.025, 1.3, m, 'cyl6');
    k.S('glow', O, 0, 1.38, 0, 0.07, '#fff2c4');
    k.P('fabric', O, 'cone', 0, 1.48, 0, 0.56, 0.3, 0.56, c('shade', '#d9b878'));
    return 1.4;
  },

  // ================================================================ bedroom and storage
  'dresser-tall': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', GOLD), z = -0.18;
    k.B('wood', O, 0, 0, z, 0.72, 1.25, 0.5, shade(wood));
    k.B('wood', O, 0, 1.25, z, 0.78, 0.05, 0.56, wood);
    drawers(k, O, 0, z + 0.25, 0.68, 0.06, 0.235, 5, 1, wood, m);
    k.B('fabric', O, -0.16, 1.3, z - 0.05, 0.2, 0.1, 0.14, '#5a2a3a');
    return undefined;
  },
  'dresser-low': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', IRON), z = -0.05;
    k.B('wood', O, 0, 0, z, w * 0.9, 0.68, 0.54, shade(wood));
    k.B('wood', O, 0, 0.68, z, w * 0.92, 0.05, 0.58, wood);
    drawers(k, O, 0, z + 0.27, w * 0.86, 0.06, 0.3, 2, 2, wood, m);
    k.B('fabric', O, -0.45, 0.73, z - 0.04, 0.44, 0.14, 0.28, c('linen', '#e6e0d2'));
    k.B('fabric', O, 0.4, 0.73, z - 0.04, 0.4, 0.1, 0.26, CLOTH);
    return undefined;
  },
  'dresser-mirror': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', GOLD), z = -0.05;
    k.B('wood', O, 0, 0, z, w * 0.9, 0.82, 0.52, shade(wood));
    k.B('wood', O, 0, 0.82, z, w * 0.92, 0.05, 0.56, wood);
    drawers(k, O, 0, z + 0.26, w * 0.86, 0.06, 0.25, 3, 1, wood, m);
    k.B('wood', O, 0, 0.87, -0.36, 1.24, 0.95, 0.05, wood);
    k.B('deco', O, 0, 0.94, -0.33, 1.08, 0.8, 0.02, GLASS);
    for (const x of [-0.62, 0.62]) k.S('metal', O, x, 1.3, -0.36, 0.05, m);
    k.C('lit', O, -0.7, 0.87, 0, 0.04, 0.14, '#a45ad6', 'cyl6');
    k.C('lit', O, -0.58, 0.87, 0.06, 0.035, 0.1, '#d6a04a', 'cyl6');
    return undefined;
  },
  'side-table': (k, O, w, d, R, c, p) => {
    const wood = c('wood', WOOD);
    k.C('wood', O, 0, 0.6, 0, 0.3, 0.04, wood, 'cyl16');
    k.C('wood', O, 0, 0, 0, 0.045, 0.6, DARKWOOD, 'cyl6');
    k.C('wood', O, 0, 0, 0, 0.18, 0.05, DARKWOOD, 'cyl16');
    if (vi(p) === 3) k.C('fabric', O, 0, 0.64, 0, 0.25, 0.005, c('cloth', '#e6e0d2'), 'cyl16');
    k.S('lit', O, 0, 0.73, 0, 0.08, '#4a7a9a');
    for (let i = 0; i < 3; i++) k.S('fabric', O, Math.cos(i * 2.1) * 0.05, 0.86, Math.sin(i * 2.1) * 0.05, 0.05, ['#e85d75', '#f2c14e', '#ffffff'][i], 'ico');
    return undefined;
  },
  armoire: (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', GOLD), z = -0.12, zf = z + 0.31;
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.B('wood', O, a * 0.84, 0, z + b * 0.24, 0.1, 0.1, 0.1, DARKWOOD);
    k.B('wood', O, 0, 0.1, z, 1.84, 1.95, 0.6, shade(wood));
    k.B('wood', O, 0, 2.05, z, 1.94, 0.16, 0.68, wood);
    for (const x of [-0.45, 0.45]) {
      k.B('wood', O, x, 0.3, zf, 0.8, 1.6, 0.03, wood);
      k.P('deco', O, 'box', x, 1.1, zf + 0.02, 0.32, 0.32, 0.02, c('inlay', '#d9b878'), 0, 0, Math.PI / 4);
    }
    for (const x of [-0.06, 0.06]) k.S('metal', O, x, 1.1, zf + 0.04, 0.03, m);
    return undefined;
  },
  vanity: (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', GOLD), cl = c('cloth', '#c4718a');
    tableAt(k, O, 0, -0.15, 1.56, 0.42, 0.74, wood);
    k.B('wood', O, 0, 0.56, -0.15, 1.4, 0.12, 0.38, shade(wood));
    k.B('metal', O, 0, 0.74, -0.38, 0.62, 0.66, 0.04, m);
    k.B('deco', O, 0, 0.8, -0.36, 0.52, 0.54, 0.02, GLASS);
    for (const s of [-1, 1]) k.P('deco', O, 'box', s * 0.5, 1.02, -0.3, 0.36, 0.5, 0.03, GLASS, 0, -s * 0.45, 0);
    k.C('lit', O, -0.5, 0.74, -0.1, 0.035, 0.12, '#e07ab0', 'cyl6');
    k.C('lit', O, -0.38, 0.74, -0.05, 0.03, 0.09, '#7ab0e0', 'cyl6');
    k.C('wood', O, 0, 0, 0.3, 0.05, 0.38, DARKWOOD, 'cyl6');
    k.C('fabric', O, 0, 0.36, 0.3, 0.16, 0.1, cl, 'cyl16');
    return undefined;
  },
  sideboard: (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', '#c9ced3'), z = -0.08;
    k.B('wood', O, 0, 0, z, w * 0.92, 0.86, 0.54, shade(wood));
    k.B('wood', O, 0, 0.86, z, w * 0.95, 0.05, 0.6, wood);
    drawers(k, O, 0, z + 0.27, w * 0.88, 0.08, 0.76, 1, 3, wood, GOLD);
    k.B('fabric', O, 0, 0.91, z, 1.4, 0.01, 0.22, c('cloth', CLOTH));
    for (const x of [-0.56, -0.3, 0.3, 0.56]) k.C('deco', O, x, 0.92, z, 0.1, 0.015, '#d9d2c3', 'cyl16');
    k.S('lit', O, 0, 1.0, z, 0.09, '#7a1c2a');
    k.C('metal', O, 0, 1.07, z, 0.025, 0.08, m, 'cyl6');
    for (const x of [-0.84, 0.84]) {
      k.C('metal', O, x, 0.91, z - 0.08, 0.025, 0.2, m, 'cyl6');
      k.C('lit', O, x, 1.11, z - 0.08, 0.02, 0.1, WAX, 'cyl6');
    }
    return undefined;
  },
  cupboard: (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', IRON), z = -0.14;
    k.B('wood', O, 0, 0, z, 0.76, 1.9, 0.56, shade(wood));
    k.B('wood', O, 0, 1.9, z, 0.84, 0.1, 0.62, wood);
    for (const x of [-0.19, 0.19]) k.B('wood', O, x, 0.08, z + 0.29, 0.35, 1.74, 0.02, wood);
    for (const x of [-0.05, 0.05]) k.S('metal', O, x, 0.95, z + 0.31, 0.025, m);
    k.S('lit', O, 0.15, 2.08, z, 0.09, '#a0603a');
    return undefined;
  },
  'cabinet-glass': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', GOLD), z = -0.15;
    k.B('wood', O, 0, 0, z, w * 0.92, 0.15, 0.54, shade(wood));
    k.B('wood', O, 0, 0.15, z, w * 0.9, 1.6, 0.5, shade(wood));
    k.B('wood', O, 0, 1.75, z, w * 0.95, 0.08, 0.58, wood);
    k.B('deco', O, 0, 0.22, z + 0.25, w * 0.84, 1.46, 0.015, GLASS);
    k.B('wood', O, 0, 0.15, z + 0.26, 0.04, 1.6, 0.03, wood);
    for (const x of [-0.06, 0.06]) k.S('metal', O, x, 0.9, z + 0.28, 0.025, m);
    for (let i = 0; i < 3; i++) k.S('glow', O, -0.6 + i * 0.6, 1.0 + (i % 2) * 0.4, z + 0.18, 0.05, ['#5a8ac8', '#d6402f', '#3aa07a'][i], 'oct');
    return undefined;
  },

  // ================================================================ seating
  'bench-long': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD);
    k.B('wood', O, 0, 0.42, 0, w * 0.96, 0.06, 0.3, wood);
    for (const x of [-w * 0.39, 0, w * 0.39]) k.B('wood', O, x, 0, 0, 0.07, 0.42, 0.28, DARKWOOD);
    return undefined;
  },
  settle: (k, O, w, d, R, c, p) => {
    const wood = c('wood', WOOD);
    k.B('wood', O, 0, 0, 0.08, w * 0.86, 0.42, 0.5, shade(wood));
    k.B('wood', O, 0, 0.42, 0.08, w * 0.88, 0.06, 0.52, wood);
    k.B('wood', O, 0, 0, -0.33, w * 0.94, 1.3, 0.08, wood);
    for (const x of [-1, 1]) k.B('wood', O, x * w * 0.44, 0, 0.04, 0.12, 0.72, 0.66, shade(wood));
    if (vi(p) === 3) for (const x of [-0.4, 0.4]) k.B('fabric', O, x, 0.48, 0.08, 0.74, 0.08, 0.44, c('cushion', CLOTH));
    return undefined;
  },
  'stool-bar': (k, O, w, d, R, c, p) => {
    const wood = c('wood', WOOD);
    k.C('wood', O, 0, 0.72, 0, 0.19, 0.05, wood, 'cyl16');
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i / 4) * TAU;
      k.Beam('wood', O, [Math.cos(a) * 0.27, 0, Math.sin(a) * 0.27], [Math.cos(a) * 0.13, 0.72, Math.sin(a) * 0.13], 0.025, DARKWOOD);
    }
    k.Ring('metal', O, 0, 0.28, 0, 0.23, 0.04, c('metal', IRON));
    if (vi(p) === 3) k.C('fabric', O, 0, 0.77, 0, 0.16, 0.05, c('cushion', CLOTH), 'cyl16');
    return undefined;
  },
  footstool: (k, O, w, d, R, c) => {
    const cl = c('cloth', '#3e6b3a');
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.C('wood', O, a * 0.21, 0, b * 0.17, 0.035, 0.12, c('wood', WOOD), 'cyl6');
    k.B('fabric', O, 0, 0.12, 0, 0.5, 0.14, 0.42, cl);
    k.P('fabric', O, 'hemi', 0, 0.26, 0, 0.5, 0.1, 0.42, cl);
    return undefined;
  },
  sofa: (k, O, w, d, R, c) => {
    const cl = c('cloth', CLOTH), wood = c('wood', WOOD);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.C('wood', O, a * 0.84, 0, b * 0.3, 0.04, 0.08, wood, 'cyl6');
    k.B('fabric', O, 0, 0.08, 0.02, 1.8, 0.32, 0.7, shade(cl));
    k.B('fabric', O, 0, 0.08, -0.29, 1.78, 0.88, 0.2, cl);
    for (const x of [-1, 1]) k.B('fabric', O, x * 0.8, 0.08, 0.03, 0.22, 0.58, 0.66, shade(cl));
    for (const x of [-0.33, 0.33]) k.B('fabric', O, x, 0.4, 0.06, 0.66, 0.12, 0.48, cl);
    return undefined;
  },
  armchair: (k, O, w, d, R, c) => {
    const cl = c('cloth', '#3e6b3a'), wood = c('wood', WOOD);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.C('wood', O, a * 0.32, 0, b * 0.32, 0.035, 0.08, wood, 'cyl6');
    k.B('fabric', O, 0, 0.08, 0.02, 0.76, 0.32, 0.74, shade(cl));
    k.B('fabric', O, 0, 0.08, -0.3, 0.74, 1.12, 0.2, cl);
    for (const x of [-1, 1]) k.B('fabric', O, x * 0.3, 0.08, 0.02, 0.18, 0.6, 0.68, shade(cl));
    k.B('fabric', O, 0, 0.4, 0.08, 0.42, 0.12, 0.5, cl);
    return undefined;
  },
  'rocking-chair': (k, O, w, d, R, c, p) => {
    const wood = c('wood', WOOD);
    for (const x of [-0.26, 0.26]) {
      k.Beam('wood', O, [x, 0.08, -0.46], [x, 0.01, 0], 0.025, DARKWOOD);
      k.Beam('wood', O, [x, 0.01, 0], [x, 0.08, 0.46], 0.025, DARKWOOD);
      k.Beam('wood', O, [x - Math.sign(x) * 0.06, 0.02, -0.15], [x - Math.sign(x) * 0.06, 0.42, -0.15], 0.02, DARKWOOD);
      k.Beam('wood', O, [x - Math.sign(x) * 0.06, 0.02, 0.18], [x - Math.sign(x) * 0.06, 0.42, 0.18], 0.02, DARKWOOD);
    }
    k.B('wood', O, 0, 0.42, 0.02, 0.44, 0.05, 0.42, wood);
    k.B('wood', O, 0, 0.45, -0.22, 0.46, 0.75, 0.05, wood, -0.2, 0, 0);
    if (vi(p) === 3) k.B('fabric', O, 0, 0.47, 0.04, 0.38, 0.05, 0.36, c('cushion', '#b0503a'));
    return undefined;
  },
  'chair-high-back': (k, O, w, d, R, c) => {
    const wood = c('wood', '#3b2a22'), m = c('metal', GOLD);
    k.B('wood', O, 0, 0.42, 0.04, 0.6, 0.07, 0.56, wood);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.B('wood', O, a * 0.26, 0, 0.04 + b * 0.24, 0.06, 0.42, 0.06, DARKWOOD);
    k.B('wood', O, 0, 0.42, -0.3, 0.66, 1.3, 0.08, wood);
    k.P('wood', O, 'cyl16', 0, 1.72, -0.3, 0.66, 0.08, 0.3, wood, Math.PI / 2, 0, 0);
    k.B('fabric', O, 0, 0.49, 0.06, 0.5, 0.06, 0.46, c('cushion', CLOTH));
    k.B('fabric', O, 0, 0.6, -0.25, 0.5, 0.9, 0.03, c('cushion', CLOTH));
    for (const x of [-0.34, 0.34]) k.S('metal', O, x, 1.6, -0.3, 0.05, m);
    return undefined;
  },

  // ================================================================ tables
  'table-square': (k, O, w, d, R, c) => legsTable(k, O, 0.82, 0.82, 0.76, c('wood', WOOD)),
  'table-trestle': (k, O, w, d, R, c) => {
    const wood = c('wood', '#c4955a');
    k.B('wood', O, 0, 0.72, 0, w * 0.96, 0.07, 0.64, wood);
    for (const x of [-w * 0.4, w * 0.4]) {
      k.Beam('wood', O, [x, 0, -0.32], [x, 0.72, 0.28], 0.04, DARKWOOD);
      k.Beam('wood', O, [x, 0, 0.32], [x, 0.72, -0.28], 0.04, DARKWOOD);
    }
    k.Beam('wood', O, [-w * 0.4, 0.36, 0], [w * 0.4, 0.36, 0], 0.03, DARKWOOD);
    return undefined;
  },
  'dining-table-six': (k, O, w, d, R, c, p) => {
    const wood = c('wood', WOOD);
    legsTable(k, O, 2.32, 1.04, 0.78, wood);
    for (const x of [-0.7, 0, 0.7]) {
      chairM(k, O, x, -0.74, false, wood);
      chairM(k, O, x, 0.74, true, wood);
    }
    if (vi(p) === 3) k.B('fabric', O, 0, 0.78, 0, 1.92, 0.01, 0.32, c('cloth', '#e6e0d2'));
    return undefined;
  },
  'table-reading': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD);
    tableAt(k, O, 0, 0.07, 1.84, 0.66, 0.78, wood);
    k.B('fabric', O, -0.08, 0.78, -0.04, 0.64, 0.02, 0.4, '#5a2a22');
    k.B('fabric', O, -0.08, 0.8, -0.04, 0.6, 0.015, 0.36, PAPER);
    k.B('fabric', O, -0.68, 0.78, -0.18, 0.28, 0.1, 0.2, BOOK_COLS[1], 0, 0.1, 0);
    k.B('fabric', O, 0.55, 0.78, 0.06, 0.3, 0.06, 0.2, BOOK_COLS[2], 0, -0.3, 0);
    k.B('fabric', O, -0.62, 0.78, 0.12, 0.26, 0.01, 0.2, PAPER);
    candle(k, O, 0.78, 0.78, -0.26, 0.12, WAX, 0.3);
    return undefined;
  },
  'writing-desk': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD);
    tableAt(k, O, 0, -0.2, 1.6, 0.5, 0.76, wood);
    k.B('wood', O, 0, 0.76, -0.38, 1.48, 0.34, 0.16, shade(wood));
    for (const x of [-0.37, 0, 0.37]) k.B('wood', O, x, 0.76, -0.3, 0.02, 0.34, 0.02, DARKWOOD);
    k.B('fabric', O, -0.04, 0.76, -0.12, 0.4, 0.01, 0.26, PAPER);
    k.C('lit', O, 0.3, 0.76, -0.18, 0.04, 0.06, '#2b2b30', 'cyl6');
    candle(k, O, -0.6, 0.76, -0.16, 0.12, WAX, 0.3);
    chairM(k, O, 0, 0.26, true, wood, c('cushion', '#3e6b3a'));
    return undefined;
  },
  'globe-stand': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', GOLD);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + Math.PI / 2;
      k.Beam('wood', O, [Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38], [Math.cos(a) * 0.1, 0.62, Math.sin(a) * 0.1], 0.03, wood);
    }
    k.Ring('wood', O, 0, 0.66, 0, 0.3, 0.05, wood);
    k.P('metal', O, 'ring', 0, 0.98, 0, 0.7, 0.8, 0.7, m, Math.PI / 2, 0.4, 0);
    k.S('lit', O, 0, 0.98, 0, 0.28, c('sea', '#3f7a9a'));
    const land = c('land', '#c9b27f');
    for (const [a, b] of [[0.4, 0.3], [2.4, -0.2], [4.2, 0.5]]) k.S('deco', O, Math.cos(a) * Math.cos(b) * 0.22, 0.98 + Math.sin(b) * 0.22, Math.sin(a) * Math.cos(b) * 0.22, 0.1, land, 'ico');
    return undefined;
  },

  // ================================================================ books and papers
  'bookshelf-tall': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), z = -0.18, D = 0.5, H = 2.1;
    k.B('wood', O, 0, 0, z - D / 2 + 0.02, 0.84, H, 0.04, DARKWOOD);
    for (const x of [-0.41, 0.41]) k.B('wood', O, x, 0, z, 0.04, H, D, shade(wood));
    for (let s = 0; s < 5; s++) {
      k.B('wood', O, 0, s * 0.5, z, 0.8, 0.04, D, wood);
      if (s < 4) books(k, O, -0.38, 0.38, s * 0.5 + 0.04, z + 0.02, D * 0.8, R, 0.36, 2);
    }
    k.B('wood', O, 0, H, z, 0.9, 0.06, D + 0.04, wood);
    return undefined;
  },
  'bookshelf-low': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), z = -0.1, D = 0.56;
    k.B('wood', O, 0, 0, z - D / 2 + 0.02, 1.84, 1.0, 0.04, DARKWOOD);
    for (const x of [-0.92, 0.92]) k.B('wood', O, x, 0, z, 0.05, 1.0, D, shade(wood));
    for (const y of [0, 0.5]) {
      k.B('wood', O, 0, y, z, 1.82, 0.04, D, wood);
      books(k, O, -0.88, 0.88, y + 0.04, z + 0.03, D * 0.8, R, 0.38, 3);
    }
    k.B('wood', O, 0, 1.0, z, 1.9, 0.05, D + 0.04, wood);
    k.S('lit', O, -0.76, 1.13, z, 0.09, '#9a5a48');
    k.B('fabric', O, -0.24, 1.05, z, 0.3, 0.08, 0.2, BOOK_COLS[4], 0, 0.06, 0);
    candle(k, O, 0.12, 1.05, z, 0.12, WAX, 0.3);
    k.S('lit', O, 0.4, 1.13, z, 0.08, BONE);
    return undefined;
  },
  'bookshelf-corner': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD);
    for (let i = 0; i < 3; i++) {
      const t = ((i + 0.5) / 3) * (Math.PI / 2), cx = -0.48 + Math.cos(t) * 0.5, cz = -0.48 + Math.sin(t) * 0.5, ry = Math.PI / 2 - t;
      k.P('wood', O, 'box', cx, 0.95, cz, 0.42, 1.9, 0.3, shade(wood), 0, ry, 0);
      for (let s = 0; s < 3; s++) k.P('fabric', O, 'box', cx + Math.cos(t) * 0.16, 0.36 + s * 0.6, cz + Math.sin(t) * 0.16, 0.36, 0.34, 0.03, BOOK_COLS[(i * 3 + s) % BOOK_COLS.length], 0, ry, 0);
    }
    return undefined;
  },
  'library-stack': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), H = 2.0, D = 0.8;
    k.B('wood', O, 0, 0, 0, 1.88, H, 0.04, DARKWOOD);
    for (const x of [-0.94, 0.94]) k.B('wood', O, x, 0, 0, 0.05, H, D, shade(wood));
    for (let s = 0; s < 5; s++) {
      k.B('wood', O, 0, s * 0.48, 0, 1.86, 0.04, D, wood);
      if (s < 4) for (const zz of [-0.2, 0.2]) books(k, O, -0.9, 0.9, s * 0.48 + 0.04, zz, 0.32, R, 0.36, 2);
    }
    k.B('wood', O, 0, H, 0, 1.94, 0.06, D + 0.04, wood);
    return undefined;
  },
  'bookcase-ladder': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', GOLD), z = -0.2, D = 0.5, H = 2.3;
    k.B('wood', O, 0, 0, z - D / 2 + 0.02, w * 0.97, H, 0.04, DARKWOOD);
    for (const x of [-1.46, -0.49, 0.49, 1.46]) k.B('wood', O, x, 0, z, 0.05, H, D, shade(wood));
    for (let s = 0; s < 6; s++) {
      k.B('wood', O, 0, s * 0.45, z, w * 0.96, 0.04, D, wood);
      if (s < 5) books(k, O, -1.42, 1.42, s * 0.45 + 0.04, z + 0.02, D * 0.8, R, 0.36, 2);
    }
    k.Beam('metal', O, [-1.45, 2.2, z + D / 2 + 0.04], [1.45, 2.2, z + D / 2 + 0.04], 0.015, m);
    for (const x of [0.46, 0.74]) k.Beam('wood', O, [x, 2.2, z + D / 2 + 0.05], [x + 0.06, 0, 0.42], 0.025, wood);
    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5, y = 2.2 * (1 - t), zz = z + D / 2 + 0.05 + (0.42 - (z + D / 2 + 0.05)) * t;
      k.B('wood', O, 0.63 + 0.06 * t, y, zz, 0.28, 0.03, 0.04, wood);
    }
    return undefined;
  },
  'book-pile': (k, O, w, d, R, c) => {
    const cols = [c('a', BOOK_COLS[0]), c('b', BOOK_COLS[1]), c('cc', BOOK_COLS[2]), '#a07a2a', '#6b4a2b'];
    for (const [x, z, n] of [[-0.19, -0.27, 5], [0.19, -0.13, 3], [-0.13, 0.17, 4]]) {
      for (let i = 0; i < n; i++) k.B('fabric', O, x, i * 0.06, z, 0.3 - i * 0.015, 0.055, 0.22 - i * 0.01, cols[(i + n) % cols.length], 0, (R() - 0.5) * 0.6, 0);
    }
    k.B('fabric', O, 0.2, 0, 0.22, 0.36, 0.02, 0.22, cols[0], 0, -0.3, 0);
    k.B('fabric', O, 0.2, 0.02, 0.22, 0.32, 0.01, 0.18, PAPER, 0, -0.3, 0);
    return undefined;
  },
  'scroll-rack': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), z = -0.16, D = 0.54, H = 1.4;
    k.B('wood', O, 0, 0, z, 1.88, H, D, '#2a1c12');
    k.B('wood', O, 0, H, z, 1.92, 0.05, D + 0.04, wood);
    for (const x of [-0.94, -0.31, 0.31, 0.94]) k.B('wood', O, x, 0, z + 0.01, 0.05, H, D, wood);
    for (const y of [0, 0.47, 0.93]) k.B('wood', O, 0, y, z + 0.01, 1.88, 0.04, D, wood);
    for (let i = 0; i < 12; i++) {
      const col = i % 3, row = Math.floor(i / 3) % 3, x = -0.62 + col * 0.62 + (R() - 0.5) * 0.3, y = 0.2 + row * 0.47 + (R() - 0.5) * 0.12;
      k.P('fabric', O, 'cyl6', x, y, z + 0.06, 0.09, D * 0.9, 0.09, R() < 0.2 ? '#c9b27f' : '#eadbb5', Math.PI / 2, 0, 0);
    }
    return undefined;
  },
  'map-cabinet': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', GOLD), z = -0.08;
    k.B('wood', O, 0, 0, z, 1.86, 0.84, 0.64, shade(wood));
    k.B('wood', O, 0, 0.84, z, 1.92, 0.05, 0.7, wood);
    drawers(k, O, 0, z + 0.32, 1.8, 0.04, 0.2, 4, 1, wood, m);
    k.B('fabric', O, 0, 0.89, z - 0.02, 1.44, 0.01, 0.46, c('paper', '#e8dbb4'));
    for (const [x, zz] of [[-0.7, -0.22], [0.7, -0.22], [-0.7, 0.2], [0.7, 0.2]]) k.S('metal', O, x, 0.92, z - 0.02 + zz, 0.04, m);
    return undefined;
  },

  // ================================================================ rugs, screens and beds
  'rug-round': (k, O, w, d, R, c) => {
    const trim = c('trim', '#c99a2e'), motif = c('motif', '#2f5d8a');
    k.P('fabric', O, 'disc', 0, 0.006, 0, w * 0.9, 1, d * 0.9, trim);
    k.P('fabric', O, 'disc', 0, 0.008, 0, w * 0.8, 1, d * 0.8, c('cloth', CLOTH));
    for (let i = 0; i < 4; i++) k.P('fabric', O, 'disc', 0, 0.01, 0, w * 0.6, 1, 0.16, motif, 0, (i / 4) * Math.PI, 0);
    k.P('fabric', O, 'disc', 0, 0.012, 0, 0.48, 1, 0.48, trim);
    k.P('fabric', O, 'disc', 0, 0.014, 0, 0.28, 1, 0.28, motif);
    return undefined;
  },
  'rug-runner': (k, O, w, d, R, c) => {
    const trim = c('trim', '#c99a2e'), motif = c('motif', '#2b2b30');
    k.P('fabric', O, 'flat', 0, 0.006, 0, 0.68, 1, d * 0.95, trim);
    k.P('fabric', O, 'flat', 0, 0.008, 0, 0.58, 1, d * 0.9, c('cloth', CLOTH));
    for (let i = 0; i < 6; i++) k.P('fabric', O, 'flat', 0, 0.01, -d / 2 + 0.38 + i * 0.45, 0.22, 1, 0.22, motif, 0, Math.PI / 4, 0);
    return undefined;
  },
  'rug-pelt': (k, O, w, d, R, c) => {
    const fur = c('fur', '#6e5a48');
    k.P('fabric', O, 'hemi', 0, 0, 0.04, 1.2, 0.08, 1.4, fur);
    for (const [x, z, a] of [[-0.6, -0.5, 0.7], [0.6, -0.5, -0.7], [-0.56, 0.56, -0.7], [0.56, 0.56, 0.7]]) k.P('fabric', O, 'sph', x, 0.01, z, 0.5, 0.04, 0.22, fur, 0, a, 0);
    k.P('fabric', O, 'sph', 0, 0.06, -0.72, 0.38, 0.14, 0.36, fur);
    k.P('fabric', O, 'sph', 0, 0.05, -0.6, 0.16, 0.1, 0.14, lighten(fur, -0.0));
    for (const x of [-0.14, 0.14]) k.S('fabric', O, x, 0.1, -0.86, 0.05, fur);
    return undefined;
  },
  'hearth-rug': (k, O, w, d, R, c) => {
    const cols = [c('a', '#a3412c'), c('b', '#c9a05a'), c('cc', '#5a6a4a')];
    for (let i = 0; i < 3; i++) k.P('fabric', O, 'disc', 0, 0.006 + i * 0.002, 0.04, w * (0.9 - i * 0.22), 1, d * (0.86 - i * 0.22), cols[i]);
    return undefined;
  },
  'folding-screen': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), cl = c('cloth', '#d9c9a0');
    const pts = [[-0.9, -0.14], [-0.44, 0.14], [0, -0.14], [0.46, 0.14], [0.9, -0.14]];
    for (let i = 0; i < 4; i++) {
      const [x1, z1] = pts[i], [x2, z2] = pts[i + 1], L = Math.hypot(x2 - x1, z2 - z1);
      k.P('fabric', O, 'box', (x1 + x2) / 2, 0.9, (z1 + z2) / 2, L - 0.04, 1.5, 0.03, i % 2 ? shade(cl) : cl, 0, Math.atan2(-(z2 - z1), x2 - x1), 0);
    }
    for (const [x, z] of pts) k.C('wood', O, x, 0, z, 0.03, 1.7, wood, 'cyl6');
    return undefined;
  },
  cot: (k, O, w, d, R, c) => {
    const wood = c('wood', '#c4955a');
    k.B('fabric', O, 0, 0.42, 0, 0.56, 0.03, 1.8, c('cloth', '#b8a77a'));
    for (const x of [-0.3, 0.3]) k.P('wood', O, 'cyl6', x, 0.44, 0, 0.05, 1.86, 0.05, wood, Math.PI / 2, 0, 0);
    for (const z of [-0.7, 0, 0.7]) {
      k.Beam('wood', O, [-0.3, 0, z], [0.3, 0.42, z], 0.02, DARKWOOD);
      k.Beam('wood', O, [0.3, 0, z], [-0.3, 0.42, z], 0.02, DARKWOOD);
    }
    k.B('fabric', O, 0, 0.45, -0.74, 0.44, 0.1, 0.2, '#e8e2d2');
    k.B('fabric', O, 0, 0.45, 0.45, 0.54, 0.06, 0.7, c('blanket', '#6e6a4a'));
    return undefined;
  },
  'straw-bed': (k, O, w, d, R, c) => {
    const straw = c('straw', '#d2b468');
    k.P('fabric', O, 'hemi', 0, 0, 0, 0.8, 0.22, 1.76, straw);
    k.P('fabric', O, 'box', 0.02, 0.14, 0.28, 0.64, 0.04, 0.8, c('blanket', '#7a6a50'), 0, 0.12, 0);
    k.S('fabric', O, 0.24, 0.06, -0.62, 0.1, straw, 'ico');
    k.S('fabric', O, -0.26, 0.05, 0.7, 0.09, straw, 'ico');
    return undefined;
  },
  'chaise-longue': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), cl = c('cloth', '#5d3a78');
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.C('wood', O, a * 0.3, 0, b * 0.86, 0.035, 0.1, wood, 'cyl6');
    k.B('wood', O, 0, 0.1, 0, 0.68, 0.24, 1.78, wood);
    k.B('fabric', O, 0, 0.34, 0.16, 0.58, 0.12, 1.42, cl);
    k.B('fabric', O, 0, 0.34, -0.7, 0.66, 0.45, 0.3, shade(cl), -0.35, 0, 0);
    k.P('fabric', O, 'cyl16', 0, 0.82, -0.82, 0.18, 0.7, 0.18, shade(cl), 0, 0, Math.PI / 2);
    k.P('fabric', O, 'cyl16', 0, 0.5, -0.5, 0.14, 0.5, 0.14, lighten(cl, 0.15), 0, 0, Math.PI / 2);
    return undefined;
  },

  // ================================================================ dungeon and room dressing
  'spear-rack': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', '#c9ced3');
    k.C('wood', O, 0, 0, 0, 0.3, 0.12, DARKWOOD, 'cyl16');
    k.C('wood', O, 0, 0.12, 0, 0.04, 0.9, DARKWOOD, 'cyl6');
    k.Ring('metal', O, 0, 0.95, 0, 0.24, 0.04, IRON);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + 0.2, x = Math.cos(a), z = Math.sin(a);
      k.Beam('wood', O, [x * 0.22, 0.12, z * 0.22], [x * 0.26, 1.9, z * 0.26], 0.016, wood);
      k.P('metal', O, 'cone', x * 0.265, 1.98, z * 0.265, 0.05, 0.16, 0.025, m);
    }
    return undefined;
  },
  'shield-wall': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', IRON), zb = -d / 2 + 0.04;
    k.B('wood', O, 0, 1.75, zb - 0.01, 1.88, 0.1, 0.05, wood);
    const cols = [c('a', '#a3312c'), c('b', '#2f5d8a'), c('cc', '#c99a2e')];
    for (let i = 0; i < 3; i++) {
      const x = -0.56 + i * 0.56;
      k.P('wood', O, 'cyl16', x, 1.4, zb + 0.03, 0.48, 0.05, 0.48, cols[i], Math.PI / 2, 0, 0);
      k.S('metal', O, x, 1.4, zb + 0.07, 0.06, m);
    }
    for (const xc of [-0.28, 0.28]) {
      k.Beam('metal', O, [xc - 0.16, 1.0, zb + 0.06], [xc + 0.16, 1.7, zb + 0.06], 0.015, '#c9ced3');
      k.Beam('metal', O, [xc + 0.16, 1.0, zb + 0.06], [xc - 0.16, 1.7, zb + 0.06], 0.015, '#c9ced3');
    }
    return undefined;
  },
  'crate-stack': (k, O, w, d, R, c) => {
    const col = c('wood', '#9a7048');
    crate(k, O, 0.86, 0, col);
    crate(k, sub(O, 0.02, -0.02, 0.12), 0.72, 0.86, lighten(col, 0.06));
    crate(k, sub(O, -0.04, 0.03, -0.1), 0.56, 1.58, col);
    return undefined;
  },
  'barrel-group': (k, O, w, d, R, c) => {
    for (const [x, z, s] of [[-0.48, -0.48, 1.05], [0.48, -0.46, 1.0], [-0.46, 0.48, 0.95], [0.46, 0.46, 1.08]]) barrel(k, sub(O, x, z, R()), s);
    return undefined;
  },
  'barrel-stack': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD);
    const put = (x: number, y: number, col: string) => {
      k.P('wood', O, 'cyl16', x, y, 0, 0.58, 0.84, 0.58, col, Math.PI / 2, 0, 0);
      for (const z of [-0.27, 0.27]) k.P('metal', O, 'ring', x, y, z, 0.6, 0.5, 0.6, IRON, Math.PI / 2, 0, 0);
    };
    for (const x of [-0.64, 0, 0.64]) put(x, 0.29, wood);
    for (const x of [-0.32, 0.32]) put(x, 0.79, lighten(wood, 0.08));
    for (const x of [-0.94, 0.94]) k.B('wood', O, x, 0, 0, 0.08, 0.12, 0.6, DARKWOOD);
    return undefined;
  },
  'wall-shelves': (k, O, w, d, R, c) => {
    const wood = c('wood', '#c4955a'), zb = -d / 2 + 0.17;
    const jars = ['#a0603a', '#6a8a6a', '#c9b48a', '#5a7a9a', '#8a4a4a'];
    for (const [y, n] of [[1.2, 4], [1.62, 5]] as [number, number][]) {
      k.B('wood', O, 0, y, zb, 1.88, 0.04, 0.3, wood);
      for (let i = 0; i < n; i++) {
        const x = -0.8 + (i + 0.5) * (1.6 / n), col = jars[(i + n) % jars.length];
        if (i % 3 === 1) k.C('lit', O, x, y + 0.04, zb, 0.05, 0.22, col, 'cyl6');
        else k.S('lit', O, x, y + 0.13, zb, 0.09, col);
      }
    }
    for (const x of [-0.76, 0.76]) for (const y of [1.06, 1.48]) k.B('metal', O, x, y, zb - 0.06, 0.04, 0.14, 0.18, IRON);
    return undefined;
  },
  'herbs-drying': (k, O, w, d, R, c) => {
    const herb = c('herb', '#6a8a4a');
    k.P('wood', O, 'cyl6', 0, 2.05, 0, 0.06, w * 0.92, 0.06, c('wood', WOOD), 0, 0, Math.PI / 2);
    for (const x of [-0.86, 0.86]) k.Beam('metal', O, [x, 2.05, 0], [x, 2.4, 0], 0.01, IRON);
    for (let i = 0; i < 6; i++) {
      const x = -0.68 + i * 0.27;
      k.P('fabric', O, 'cone', x, 1.86, (i % 2 ? 0.06 : -0.06), 0.16, 0.36, 0.16, i === 2 ? '#e8e0c8' : lighten(herb, R() * 0.15), Math.PI, 0, 0);
    }
    return undefined;
  },
  'cauldron-tripod': (k, O, w, d, R, c) => {
    const pot = c('metal', '#2c2e32');
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU - Math.PI / 2;
      k.Beam('metal', O, [Math.cos(a) * 0.44, 0, Math.sin(a) * 0.44], [0, 1.25, 0], 0.025, '#4a4d52');
    }
    k.Beam('metal', O, [0, 1.25, 0], [0, 0.8, 0], 0.01, IRON);
    k.P('metal', O, 'sph', 0, 0.55, 0, 0.6, 0.5, 0.6, pot);
    k.P('deco', O, 'disc', 0, 0.76, 0, 0.44, 1, 0.44, c('brew', '#6a9a3a'));
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.5;
      k.Beam('wood', O, [Math.cos(a) * 0.32, 0.02, Math.sin(a) * 0.32], [0, 0.14, 0], 0.035, '#4a2e18');
    }
    k.S('glow', O, 0, 0.08, 0, 0.1, '#ff7a1a', 'ico');
    flameCup(k, O, 0, 0.06, 0, 1.2);
    return 0.3;
  },
  'cobweb-corner': (k, O, w, d, R, c) => {
    const web = c('web', '#e8e8e4'), A = [-0.49, 2.38, -0.49];
    const ends = [[0.4, 2.36, -0.49], [-0.49, 2.36, 0.4], [-0.49, 1.5, -0.49], [0.1, 1.9, -0.49], [-0.49, 1.9, 0.1], [0.05, 2.1, 0.05]];
    for (const e of ends) k.Beam('deco', O, A, e, 0.005, web, 'cyl6');
    k.Sag('deco', O, [0.1, 2.36, -0.49], [-0.49, 2.36, 0.1], 0.18, 0.004, web, 3);
    k.Sag('deco', O, [-0.1, 2.0, -0.49], [-0.49, 2.0, -0.1], 0.08, 0.004, web, 3);
    k.Sag('deco', O, [0.3, 2.3, -0.49], [-0.49, 2.3, 0.3], 0.22, 0.004, web, 3);
    return undefined;
  },
  'broken-furniture': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD);
    k.P('wood', O, 'box', -0.04, 0.05, -0.1, 0.62, 0.04, 0.14, wood, 0, -0.5, 0.08);
    k.P('wood', O, 'box', 0.06, 0.04, 0.14, 0.54, 0.04, 0.12, wood, 0.05, 0.3, 0);
    k.P('wood', O, 'box', -0.2, 0.12, 0.2, 0.36, 0.04, 0.36, wood, 0.3, 0.6, 0.2);
    k.P('wood', O, 'box', -0.26, 0.24, 0.32, 0.36, 0.42, 0.04, wood, -0.9, 0.6, 0);
    for (let i = 0; i < 4; i++) {
      const x = (R() - 0.5) * 0.7, z = (R() - 0.5) * 0.7, a = R() * TAU;
      k.Beam('wood', O, [x, 0.03, z], [x + Math.cos(a) * 0.3, 0.03 + R() * 0.12, z + Math.sin(a) * 0.3], 0.025, DARKWOOD);
    }
    return undefined;
  },
  'bookshelf-fallen': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD);
    k.P('wood', O, 'box', 0, 0.2, 0, 1.72, 0.4, 0.52, wood, 0, -0.06, 0);
    for (let i = 0; i < 8; i++) k.P('fabric', O, 'box', (R() - 0.5) * 1.7, 0.03, (R() < 0.5 ? -0.4 : 0.38) + (R() - 0.5) * 0.1, 0.2, 0.05, 0.14, BOOK_COLS[Math.floor(R() * BOOK_COLS.length)], 0, R() * TAU, (R() - 0.5) * 0.3);
    for (let i = 0; i < 3; i++) k.P('fabric', O, 'flat', (R() - 0.5) * 1.6, 0.01, (R() - 0.5) * 0.8, 0.12, 1, 0.16, PAPER, 0, R() * TAU, 0);
    return undefined;
  },
  'skeleton-lying': (k, O, w, d, R, c, p) => {
    const b = c('bone', BONE);
    k.S('lit', O, 0, 0.09, -0.76, 0.1, b);
    k.Beam('lit', O, [0, 0.05, -0.62], [0, 0.05, 0.1], 0.025, b);
    k.P('lit', O, 'hemi', 0, 0.02, -0.38, 0.42, 0.18, 0.34, b);
    k.P('lit', O, 'sph', 0, 0.06, 0.14, 0.3, 0.1, 0.2, b);
    for (const [a1, a2, a3] of [[[-0.22, 0.04, -0.52], [-0.32, 0.03, -0.16], [-0.24, 0.03, 0.14]], [[0.22, 0.04, -0.52], [0.3, 0.03, -0.2], [0.2, 0.03, 0.04]], [[-0.08, 0.04, 0.22], [-0.14, 0.04, 0.58], [-0.1, 0.04, 0.9]], [[0.08, 0.04, 0.22], [0.16, 0.04, 0.56], [0.22, 0.04, 0.88]]]) {
      k.Beam('lit', O, a1, a2, 0.025, b);
      k.Beam('lit', O, a2, a3, 0.02, b);
    }
    if (vi(p) === 1) {
      k.Beam('metal', O, [0.3, 0.03, -0.4], [0.36, 0.03, 0.7], 0.022, '#c9ced3');
      k.B('metal', O, 0.3, 0.01, -0.3, 0.2, 0.04, 0.04, IRON, 0, -0.05, 0);
    }
    return undefined;
  },
  'skeleton-seated': (k, O, w, d, R, c, p) => {
    const b = c('bone', BONE);
    k.P('lit', O, 'sph', 0, 0.08, -0.32, 0.3, 0.12, 0.2, b);
    k.Beam('lit', O, [0, 0.1, -0.34], [0, 0.62, -0.4], 0.025, b);
    k.P('lit', O, 'sph', 0, 0.45, -0.37, 0.34, 0.3, 0.22, b);
    k.S('lit', O, 0.05, 0.76, -0.33, 0.1, b);
    for (const s of [-1, 1]) {
      k.Beam('lit', O, [s * 0.17, 0.6, -0.38], [s * 0.22, 0.3, -0.26], 0.02, b);
      k.Beam('lit', O, [s * 0.22, 0.3, -0.26], [s * 0.15, 0.12, -0.04], 0.018, b);
      k.Beam('lit', O, [s * 0.08, 0.1, -0.28], [s * 0.15, 0.34, 0.1], 0.025, b);
      k.Beam('lit', O, [s * 0.15, 0.34, 0.1], [s * 0.12, 0.03, 0.38], 0.02, b);
      if (vi(p) === 1) k.Sag('metal', O, [s * 0.3, 1.2, -0.48], [s * 0.15, 0.14, -0.04], 0.1, 0.012, c('metal', IRON), 3);
    }
    return undefined;
  },
  'debris-wood': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD);
    for (let i = 0; i < 5; i++) k.P('wood', O, 'box', (R() - 0.5) * 0.5, 0.04 + i * 0.03, (R() - 0.5) * 0.5, 0.45 + R() * 0.3, 0.04, 0.1 + R() * 0.06, lighten(wood, R() * 0.1), (R() - 0.5) * 0.3, R() * Math.PI, (R() - 0.5) * 0.3);
    for (let i = 0; i < 3; i++) k.P('wood', O, 'cone', (R() - 0.5) * 0.7, 0.03, (R() - 0.5) * 0.7, 0.04, 0.2, 0.04, DARKWOOD, Math.PI / 2, R() * TAU, 0);
    return undefined;
  },
  'sarcophagus-effigy': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), fig = lighten(st, 0.12), m = c('metal', '#a8743c');
    k.B('stone', O, 0, 0, 0, 0.8, 0.7, 1.88, st);
    k.B('lit', O, 0, 0.7, 0, 0.7, 0.1, 1.76, STONE);
    k.B('stone', O, 0, 0.8, -0.74, 0.26, 0.06, 0.12, st);
    k.S('stone', O, 0, 0.9, -0.6, 0.1, fig);
    k.P('stone', O, 'cyl16', 0, 0.88, 0.1, 0.34, 1.16, 0.18, fig, Math.PI / 2, 0, 0);
    k.Beam('metal', O, [0, 0.98, -0.32], [0, 0.98, 0.7], 0.018, m);
    k.B('metal', O, 0, 0.96, -0.24, 0.18, 0.04, 0.04, m);
    k.S('stone', O, 0, 0.98, -0.16, 0.07, fig);
    for (const x of [-0.08, 0.08]) k.S('stone', O, x, 0.84, 0.78, 0.06, fig);
    return undefined;
  },
  'sarcophagus-open': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780');
    k.B('stone', O, 0, 0, 0, 0.76, 0.66, 1.88, st);
    k.B('cave', O, 0, 0.66, 0, 0.56, 0.01, 1.68, '#1c1612');
    k.S('lit', O, -0.04, 0.7, -0.66, 0.08, BONE);
    k.Beam('lit', O, [0, 0.69, -0.5], [0, 0.69, 0], 0.02, BONE);
    k.Beam('lit', O, [-0.08, 0.69, 0.1], [-0.14, 0.69, 0.5], 0.02, BONE);
    k.P('stone', O, 'box', 0.14, 0.73, 0.28, 0.8, 0.12, 1.2, lighten(st, 0.05), 0, 0.32, 0.06);
    return undefined;
  },
  'plinth-display': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#dcd8d0'), m = c('metal', GOLD);
    k.B('stone', O, 0, 0, 0, 0.72, 0.12, 0.72, st);
    k.B('stone', O, 0, 0.12, 0, 0.5, 0.8, 0.5, st);
    k.B('lit', O, 0, 0.92, 0, 0.62, 0.08, 0.62, st);
    const item = vi(p);
    if (item === 1) {
      k.S('lit', O, 0, 1.18, 0, 0.16, '#a0603a');
      k.C('lit', O, 0, 1.28, 0, 0.07, 0.12, '#a0603a', 'cyl16');
    } else if (item === 2) {
      k.C('metal', O, 0, 1.0, 0, 0.1, 0.22, m, 'cyl16');
      k.S('metal', O, 0, 1.3, 0, 0.09, m);
      k.S('glow', O, 0, 1.32, 0.08, 0.025, '#d6402f', 'oct');
    } else if (item === 3) {
      k.S('lit', O, 0, 1.1, 0, 0.1, BONE);
      k.B('lit', O, 0, 1.0, 0.05, 0.1, 0.04, 0.06, BONE);
    } else {
      k.C('metal', O, 0, 1.0, 0, 0.07, 0.05, m, 'cyl16');
      k.S('glow', O, 0, 1.17, 0, 0.13, c('gem', '#7fd6ff'));
    }
    return undefined;
  },
  // ================================================================ tall halls (ceiling HALL_H)
  'column-fluted': (k, O, w, d, R, c) => {
    const st = c('stone', '#dcd8d0');
    colFoot(k, O, st, 0.42);
    k.C('stone', O, 0, 0.32, 0, 0.29, HALL_H - 0.95, st, 'cyl16');
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      k.B('lit', O, Math.cos(a) * 0.285, 0.36, Math.sin(a) * 0.285, 0.05, HALL_H - 1.03, 0.05, lighten(st, 0.06));
    }
    colHead(k, O, st, 0.42);
    return undefined;
  },
  'column-twisted': (k, O, w, d, R, c) => {
    const st = c('stone', '#dcd8d0'), y0 = 0.32, y1 = HALL_H - 0.63, n = 12;
    colFoot(k, O, st, 0.42);
    k.C('stone', O, 0, y0, 0, 0.17, y1 - y0, st, 'cyl16');
    for (const s0 of [0, Math.PI]) {
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n, a0 = s0 + t0 * TAU * 2, a1 = s0 + t1 * TAU * 2;
        k.Beam('stone', O, [Math.cos(a0) * 0.13, y0 + t0 * (y1 - y0), Math.sin(a0) * 0.13], [Math.cos(a1) * 0.13, y0 + t1 * (y1 - y0), Math.sin(a1) * 0.13], 0.12, s0 ? lighten(st, 0.05) : st);
      }
    }
    colHead(k, O, st, 0.42);
    return undefined;
  },
  'column-cluster': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), y0 = 0.34, y1 = HALL_H - 0.5;
    k.B('stone', O, 0, 0, 0, 1.76, 0.22, 1.76, shade(st));
    k.B('lit', O, 0, 0.22, 0, 1.48, 0.12, 1.48, st);
    k.C('stone', O, 0, y0, 0, 0.46, y1 - y0, lighten(st, 0.04), 'cyl16');
    for (const [x, z] of [[0, -0.54], [0.54, 0], [0, 0.54], [-0.54, 0]]) {
      k.C('stone', O, x, y0, z, 0.27, y1 - y0, st, 'cyl16');
      k.C('lit', O, x, 2.3, z, 0.31, 0.12, lighten(st, 0.08), 'cyl16');
    }
    k.B('lit', O, 0, y1, 0, 1.48, 0.14, 1.48, st);
    k.B('stone', O, 0, y1 + 0.14, 0, 1.76, HALL_H - 0.02 - y1 - 0.14, 1.76, shade(st));
    return undefined;
  },
  'half-column-wall': (k, O, w, d, R, c) => {
    const st = c('stone', '#dcd8d0'), z = -0.5;
    k.B('stone', O, 0, 0, -0.29, 0.84, 0.22, 0.42, shade(st));
    k.C('stone', O, 0, 0.22, z, 0.29, HALL_H - 0.7, st, 'cyl16');
    for (let i = 0; i < 5; i++) {
      const a = 0.45 + (i / 4) * (Math.PI - 0.9);
      k.B('lit', O, Math.cos(a) * 0.285, 0.26, z + Math.sin(a) * 0.285, 0.05, HALL_H - 0.78, 0.05, lighten(st, 0.06));
    }
    k.C('lit', O, 0, HALL_H - 0.6, z, 0.34, 0.14, st, 'cyl16');
    k.B('stone', O, 0, HALL_H - 0.46, -0.27, 0.84, 0.44, 0.46, shade(st));
    return undefined;
  },
  'window-stained-tall': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), cols = [c('a', '#c0392b'), c('b', '#2f6db3'), c('cc', '#e9c46a')], lead = '#2a2a2e';
    k.B('stone', O, 0, 0.9, -0.36, 1.74, 0.12, 0.28, lighten(st, 0.06));
    for (const s of [-1, 1]) {
      k.B('stone', O, s * 0.72, 1.02, -0.42, 0.22, 2.4, 0.16, st);
      k.Beam('stone', O, [s * 0.72, 3.38, -0.42], [0, 4.32, -0.42], 0.11, st, 'box');
    }
    for (let row = 0; row < 3; row++) for (let col = 0; col < 2; col++) {
      k.B('glow', O, (col - 0.5) * 0.61, 1.02 + row * 0.8, -0.475, 0.6, 0.8, 0.02, cols[(row + col) % 3]);
    }
    k.P('glow', O, 'pyr', 0, 3.84, -0.475, 1.22, 0.84, 0.03, cols[2]);
    k.P('glow', O, 'cyl16', 0, 3.72, -0.462, 0.36, 0.02, 0.36, cols[0], Math.PI / 2);
    k.B('metal', O, 0, 1.02, -0.455, 0.04, 2.8, 0.03, lead);
    for (const y of [1.81, 2.61]) k.B('metal', O, 0, y, -0.455, 1.22, 0.04, 0.03, lead);
    return undefined;
  },
  'gallery-balcony': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), FL = 2.6, W = w * 0.98;
    k.B('stone', O, 0, FL, -0.05, W, 0.18, 0.9, st);
    for (const x of [-1.1, 0, 1.1]) {
      k.B('stone', O, x, FL - 0.6, -0.36, 0.26, 0.6, 0.28, shade(st));
      k.B('stone', O, x, FL - 0.95, -0.42, 0.2, 0.35, 0.16, shade(st));
    }
    k.B('stone', O, 0, FL + 0.18, 0.33, W, 0.08, 0.16, st);
    for (let i = 0; i < 10; i++) k.C('lit', O, -1.35 + i * 0.3, FL + 0.26, 0.33, 0.045, 0.7, lighten(st, 0.05), 'cyl6');
    k.B('stone', O, 0, FL + 0.96, 0.33, W, 0.1, 0.16, lighten(st, 0.08));
    for (const s of [-1, 1]) k.B('stone', O, s * (W / 2 - 0.04), FL + 0.18, -0.06, 0.08, 0.88, 0.84, st);
    return undefined;
  },
  'stair-grand': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#dcd8d0'), cp = c('carpet', '#a3312c'), m = c('metal', GOLD), n = 13, rise = 0.2, sd = 3 / n, H = n * rise;
    for (let i = 0; i < n; i++) k.B('stone', O, 0, 0, 2 - (i + 0.5) * sd, 2.6, (i + 1) * rise, sd + 0.002, i % 2 ? st : lighten(st, 0.04));
    k.B('stone', O, 0, 0, -1.5, 2.6, H, 1.0, st);
    const L = Math.hypot(3, H), ang = Math.atan2(H, 3);
    for (const s of [-1, 1]) {
      k.P('stone', O, 'box', s * 1.4, H / 2 + 0.2, 0.5, 0.2, 0.9, L, shade(st), ang);
      k.B('stone', O, s * 1.4, 0, -1.5, 0.2, H + 0.65, 1.0, shade(st));
      k.B('stone', O, s * 1.4, 0, 1.86, 0.3, 1.0, 0.28, st);
      k.S('metal', O, s * 1.4, 1.1, 1.86, 0.09, m);
    }
    if (vi(p) !== 2) {
      k.P('fabric', O, 'box', 0, H / 2 + 0.03, 0.5, 1.0, 0.03, L, cp, ang);
      k.B('fabric', O, 0, H, -1.42, 1.0, 0.02, 1.16, cp);
    }
    return undefined;
  },
  'stair-spiral': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), m = c('metal', IRON), n = 18, rise = (HALL_H - 0.5) / n;
    k.C('stone', O, 0, 0, 0, 0.14, HALL_H - 0.02, st, 'cyl16');
    let prev: number[] | null = null;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i + 0.5) * (TAU / 16), y = (i + 1) * rise;
      k.B('stone', O, Math.cos(a) * 0.5, y - 0.08, Math.sin(a) * 0.5, 0.78, 0.08, 0.38, i % 2 ? st : lighten(st, 0.06), 0, -a, 0);
      if (i % 2 === 0) {
        const q = [Math.cos(a) * 0.86, y + 0.9, Math.sin(a) * 0.86];
        if (prev && q[1] < HALL_H - 0.1) k.Beam('metal', O, prev, q, 0.025, m, 'cyl6');
        prev = q;
      }
    }
    return undefined;
  },
  'doors-grand-frame': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), wood = c('wood', WOOD), m = c('metal', IRON), top = 3.35;
    k.P('stone', O, 'cyl16', 0, 0.04, -0.5, 2.3, 0.08, 0.9, lighten(st, 0.06));
    for (const s of [-1, 1]) {
      k.B('wood', O, s * 0.5, 0.05, -0.42, 0.98, top - 0.05, 0.1, s < 0 ? wood : lighten(wood, 0.04));
      k.B('stone', O, s * 1.2, 0, -0.38, 0.42, top, 0.3, st);
      for (const y of [0.6, 1.7, 2.8]) k.B('metal', O, s * 0.5, y, -0.36, 0.9, 0.08, 0.02, m);
      k.P('metal', O, 'torus', s * 0.12, 1.5, -0.35, 0.18, 0.5, 0.18, m, Math.PI / 2);
    }
    k.P('wood', O, 'cyl16', 0, top, -0.44, 2.0, 0.08, 2.0, shade(wood), Math.PI / 2);
    for (let i = 0; i < 7; i++) {
      const a = (Math.PI * (i + 0.5)) / 7, mid = i === 3;
      k.P('stone', O, 'box', Math.cos(a) * 1.2, top + Math.sin(a) * 1.2, -0.38, mid ? 0.5 : 0.42, mid ? 0.6 : 0.52, mid ? 0.36 : 0.3, mid ? lighten(st, 0.1) : st, 0, 0, a);
    }
    return undefined;
  },
  'wall-alcove-arch': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8780'), m = c('metal', '#a8743c'), dark = '#1c1612', item = vi(p);
    k.B('cave', O, 0, 0.6, -0.47, 1.2, 2.0, 0.04, dark);
    k.P('cave', O, 'cyl16', 0, 2.6, -0.47, 1.2, 0.04, 1.2, dark, Math.PI / 2);
    k.B('stone', O, 0, 0, -0.33, 1.24, 0.6, 0.34, st);
    for (const s of [-1, 1]) {
      k.B('stone', O, s * 0.8, 0, -0.32, 0.4, 2.6, 0.36, st);
      k.B('lit', O, s * 0.8, 2.6, -0.3, 0.46, 0.1, 0.4, lighten(st, 0.08));
    }
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * (i + 0.5)) / 5;
      k.P('stone', O, 'box', Math.cos(a) * 0.72, 2.6 + Math.sin(a) * 0.72, -0.32, 0.26, 0.48, 0.36, i === 2 ? lighten(st, 0.1) : st, 0, 0, a);
    }
    k.B('stone', O, 0, 3.44, -0.29, 2.0, 0.16, 0.42, shade(st));
    if (item === 1) {
      k.P('lit', O, 'cone', 0, 1.15, -0.3, 0.36, 1.1, 0.3, '#e8e4dc');
      k.S('lit', O, 0, 1.76, -0.3, 0.11, '#efece6');
    } else if (item === 2) {
      for (const [x, h] of [[-0.36, 0.3], [-0.12, 0.45], [0.12, 0.22], [0.36, 0.36]]) candle(k, O, x, 0.6, -0.3, h, WAX, 0.4);
    } else if (item === 3) {
      for (const [x, y, z] of [[-0.22, 0.7, -0.26], [0, 0.7, -0.26], [0.22, 0.7, -0.26], [-0.11, 0.88, -0.32], [0.11, 0.88, -0.32]]) k.S('lit', O, x, y, z, 0.1, BONE);
    } else {
      k.S('metal', O, 0, 0.86, -0.3, 0.22, m);
      k.C('metal', O, 0, 1.0, -0.3, 0.09, 0.2, m, 'cyl16');
      k.C('metal', O, 0, 0.6, -0.3, 0.11, 0.08, shade(m), 'cyl16');
    }
    return undefined;
  },
  'archway-grand': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), sp = 3.15, H = HALL_H - 0.16;
    for (const s of [-1, 1]) {
      k.B('stone', O, s * 1.25, 0, 0, 0.5, H, 0.8, st);
      k.B('lit', O, s * 1.25, sp - 0.15, 0, 0.62, 0.15, 0.9, lighten(st, 0.08));
    }
    for (let i = 0; i < 9; i++) {
      const a = (Math.PI * (i + 0.5)) / 9, mid = i === 4;
      k.P('stone', O, 'box', Math.cos(a) * 1.25, sp + Math.sin(a) * 1.25, 0, mid ? 0.6 : 0.5, 0.46, mid ? 0.9 : 0.8, mid ? lighten(st, 0.1) : st, 0, 0, a);
    }
    k.B('stone', O, 0, H, 0, 3.0, 0.14, 0.9, shade(st));
    return undefined;
  },
  'banner-hanging-tall': (k, O, w, d, R, c) => {
    const cl = c('cloth', CLOTH), m = c('metal', GOLD), top = 4.3;
    k.Beam('metal', O, [-0.42, top, 0], [0.42, top, 0], 0.025, IRON);
    for (const s of [-1, 1]) {
      k.S('metal', O, s * 0.45, top, 0, 0.045, m);
      k.Beam('metal', O, [s * 0.38, top, 0], [0, HALL_H - 0.02, 0], 0.008, '#3a3a3a', 'cyl6');
      k.P('fabric', O, 'box', s * 0.19, 1.8, 0, 0.34, 0.5, 0.03, cl, 0, 0, s * 0.12);
      k.B('deco', O, s * 0.33, 2.0, 0, 0.04, top - 2.02, 0.045, m);
    }
    k.B('fabric', O, 0, 2.0, 0, 0.72, top - 2.02, 0.03, cl);
    for (const z of [-0.022, 0.022]) k.P('metal', O, 'cyl16', 0, 3.4, z, 0.36, 0.01, 0.36, m, Math.PI / 2);
    return undefined;
  },
  'tapestry-tall': (k, O, w, d, R, c) => {
    const cl = c('cloth', CLOTH), cc = c('cc', GOLD), m = c('metal', GOLD), z = -0.45, f = z + 0.018, top = 4.42;
    k.Beam('metal', O, [-0.95, top + 0.03, -0.42], [0.95, top + 0.03, -0.42], 0.03, m);
    for (const s of [-1, 1]) {
      k.S('metal', O, s * 0.97, top + 0.03, -0.42, 0.05, m);
      k.B('metal', O, s * 0.84, top - 0.06, -0.46, 0.04, 0.1, 0.1, IRON);
      k.B('deco', O, s * 0.8, 1.06, f, 0.06, 3.3, 0.01, cc);
    }
    k.B('fabric', O, 0, 1.0, z, 1.72, top - 1.0, 0.03, cl);
    for (const y of [1.06, top - 0.12]) k.B('deco', O, 0, y, f, 1.6, 0.06, 0.01, cc);
    k.B('deco', O, 0, 1.3, f, 0.1, 1.7, 0.01, shade(cc));
    for (const [x, y, s] of [[0, 3.35, 0.56], [-0.3, 2.95, 0.42], [0.3, 2.95, 0.42]]) k.P('deco', O, 'cyl16', x, y, f, s, 0.01, s, cc, Math.PI / 2);
    k.B('deco', O, 0, 0.88, z, 1.7, 0.12, 0.02, cc);
    return undefined;
  },
  'heraldic-crest': (k, O, w, d, R, c) => {
    const a = c('a', CLOTH), b = c('b', GOLD), m = c('metal', '#c9ced3'), z = -0.44;
    for (const s of [-1, 1]) {
      const lo = [s * -0.55, 2.15, -0.47], hi = [s * 0.5, 3.7, -0.47], dx = hi[0] - lo[0], dy = hi[1] - lo[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      k.Beam('metal', O, lo, hi, 0.025, lighten(m, 0.2), 'box');
      k.Beam('metal', O, [hi[0] - uy * 0.13, hi[1] + ux * 0.13, -0.47], [hi[0] + uy * 0.13, hi[1] - ux * 0.13, -0.47], 0.025, GOLD);
      k.Beam('wood', O, hi, [hi[0] + ux * 0.22, hi[1] + uy * 0.22, -0.47], 0.03, DARKWOOD);
      k.S('metal', O, hi[0] + ux * 0.26, hi[1] + uy * 0.26, -0.47, 0.045, GOLD);
    }
    k.B('lit', O, 0, 2.75, z, 0.7, 0.6, 0.06, a);
    k.P('lit', O, 'pyr', 0, 2.55, z, 0.7, 0.4, 0.06, a, Math.PI);
    k.B('lit', O, 0.175, 2.75, z + 0.032, 0.35, 0.6, 0.005, b);
    k.Beam('metal', O, [-0.3, 2.86, -0.405], [0, 3.1, -0.405], 0.035, m, 'box');
    k.Beam('metal', O, [0, 3.1, -0.405], [0.3, 2.86, -0.405], 0.035, m, 'box');
    return undefined;
  },
  'cage-hanging': (k, O, w, d, R, c, p) => {
    const m = c('metal', IRON), yb = 0.95, yt = 2.4, v = vi(p);
    k.Beam('metal', O, [0, HALL_H - 0.02, 0], [0, yt + 0.36, 0], 0.02, m, 'cyl6');
    k.P('metal', O, 'torus', 0, yt + 0.36, 0, 0.12, 0.5, 0.12, m, Math.PI / 2);
    k.P('metal', O, 'hemi', 0, yt, 0, 0.68, 0.6, 0.68, m);
    k.C('metal', O, 0, yb, 0, 0.34, 0.05, m, 'cyl16');
    for (const y of [yb + 0.05, (yb + yt) / 2, yt]) k.Ring('metal', O, 0, y, 0, 0.33, 0.04, m);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      k.Beam('metal', O, [Math.cos(a) * 0.33, yb, Math.sin(a) * 0.33], [Math.cos(a) * 0.33, yt, Math.sin(a) * 0.33], 0.013, m, 'cyl6');
    }
    if (v === 1 || v === 3) {
      k.S('lit', O, 0.08, yb + 0.14, 0.06, 0.09, BONE);
      k.Beam('lit', O, [-0.18, yb + 0.07, 0.1], [0.12, yb + 0.07, -0.14], 0.022, BONE);
      k.Beam('lit', O, [-0.1, yb + 0.07, -0.18], [-0.16, yb + 0.5, -0.24], 0.022, BONE);
    }
    return undefined;
  },
  'chains-hanging': (k, O, w, d, R, c, p) => {
    const m = c('metal', IRON), meat = vi(p) === 1;
    for (const [sx, sz] of [[30, 28], [70, 26], [50, 52], [26, 72], [74, 70]]) {
      const x = (sx - 50) / 100, z = (sz - 50) / 100, yb = 1.6 + R() * 1.4;
      k.Beam('metal', O, [x, HALL_H - 0.02, z], [x, yb, z], 0.016, m, 'cyl6');
      k.P('metal', O, 'torus', x, yb - 0.03, z, 0.08, 0.5, 0.08, m, Math.PI / 2, R() * 3);
      k.Beam('metal', O, [x, yb - 0.07, z], [x + 0.06, yb - 0.2, z], 0.014, m, 'cyl6');
      k.Beam('metal', O, [x + 0.06, yb - 0.2, z], [x, yb - 0.26, z], 0.014, m, 'cyl6');
      if (meat && R() < 0.75) k.P('fabric', O, 'ico', x + 0.02, yb - 0.42, z, 0.24, 0.36, 0.2, '#8a2a2a');
    }
    return undefined;
  },
  'censer-hanging': (k, O, w, d, R, c) => {
    const m = c('metal', GOLD), smoke = c('smoke', '#b8b4c8'), y = 1.55;
    k.Beam('metal', O, [0, HALL_H - 0.02, 0], [0, y + 0.42, 0], 0.012, m, 'cyl6');
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU - Math.PI / 2;
      k.Beam('metal', O, [0, y + 0.42, 0], [Math.cos(a) * 0.13, y + 0.05, Math.sin(a) * 0.13], 0.008, m, 'cyl6');
    }
    k.S('metal', O, 0, y, 0, 0.14, m);
    k.P('metal', O, 'cone', 0, y + 0.13, 0, 0.26, 0.2, 0.26, m);
    k.C('metal', O, 0, y - 0.18, 0, 0.06, 0.06, m, 'cyl6');
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + 0.4;
      k.S('glow', O, Math.cos(a) * 0.13, y + 0.02, Math.sin(a) * 0.13, 0.025, '#ff8a3a');
    }
    k.S('deco', O, 0.06, y + 0.3, 0.03, 0.05, lighten(smoke, 0.3), 'ico');
    return undefined;
  },
  'lantern-cluster': (k, O, w, d, R, c) => {
    const m = c('metal', IRON), gl = c('glass', '#ffc46b'), hy = 3.7, rr = 0.56;
    k.Ring('metal', O, 0, hy, 0, rr, 0.05, m);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.5;
      k.Beam('metal', O, [Math.cos(a) * rr, hy, Math.sin(a) * rr], [0, HALL_H - 0.02, 0], 0.012, m, 'cyl6');
    }
    let sum = 0;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU - Math.PI / 2, x = Math.cos(a) * rr, z = Math.sin(a) * rr, yb = hy - 0.55 - (i % 3) * 0.35 - 0.38;
      k.Beam('metal', O, [x, hy, z], [x, yb + 0.38, z], 0.01, m, 'cyl6');
      lanternM(k, O, x, yb, z, 1, m, gl);
      sum += yb + 0.15;
    }
    k.Beam('metal', O, [0, HALL_H - 0.02, 0], [0, 2.4 + 0.48, 0], 0.012, m, 'cyl6');
    lanternM(k, O, 0, 2.4, 0, 1.25, m, gl);
    return (sum + 2.6) / 6;
  },
  'chandelier-great': (k, O, w, d, R, c) => {
    const m = c('metal', IRON), wax = c('wax', WAX), ro = 1.2, ri = 0.7, yo = 3.0, yi = 3.25;
    k.Ring('metal', O, 0, yo, 0, ro, 0.07, m);
    k.Ring('metal', O, 0, yi, 0, ri, 0.06, m);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + 0.2;
      k.Beam('metal', O, [Math.cos(a) * ri, yi, Math.sin(a) * ri], [Math.cos(a) * ro, yo, Math.sin(a) * ro], 0.025, m, 'cyl6');
      const b = a + Math.PI / 4 - 0.2;
      k.Beam('metal', O, [Math.cos(b) * ro, yo, Math.sin(b) * ro], [0, HALL_H - 0.02, 0], 0.02, m, 'cyl6');
    }
    k.S('metal', O, 0, yi, 0, 0.13, m);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      candle(k, O, Math.cos(a) * ro, yo + 0.02, Math.sin(a) * ro, 0.16, wax, 0.5);
    }
    return yo + 0.25;
  },
  'brazier-pedestal': (k, O, w, d, R, c) => {
    const st = c('stone', '#dcd8d0'), m = c('metal', '#a8743c'), fl = c('fire', '#ffb02e');
    k.B('stone', O, 0, 0, 0, 0.72, 0.14, 0.72, shade(st));
    k.C('lit', O, 0, 0.14, 0, 0.24, 0.1, st, 'cyl16');
    k.C('stone', O, 0, 0.24, 0, 0.16, 1.0, st, 'cyl16');
    k.C('lit', O, 0, 1.24, 0, 0.24, 0.08, st, 'cyl16');
    k.P('metal', O, 'hemi', 0, 1.57, 0, 0.8, 0.5, 0.8, m, Math.PI);
    k.Ring('metal', O, 0, 1.57, 0, 0.4, 0.06, lighten(m, 0.1));
    k.C('lit', O, 0, 1.5, 0, 0.36, 0.06, '#3a2418', 'cyl16');
    fire(k, O, 0, 1.55, 0, 1.6, fl);
    fire(k, O, -0.14, 1.55, 0.08, 1.0, fl);
    fire(k, O, 0.13, 1.55, -0.07, 1.0, fl);
    return 1.75;
  },
  'candle-stand-tall': (k, O, w, d, R, c) => {
    const m = c('metal', GOLD), wax = c('wax', WAX);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU - Math.PI / 2;
      k.Beam('metal', O, [0, 0.36, 0], [Math.cos(a) * 0.4, 0.02, Math.sin(a) * 0.4], 0.025, m, 'cyl6');
    }
    k.C('metal', O, 0, 0.3, 0, 0.03, 1.5, m, 'cyl6');
    k.S('metal', O, 0, 1.0, 0, 0.06, m);
    k.C('metal', O, 0, 1.77, 0, 0.1, 0.03, m, 'cyl16');
    k.Ring('metal', O, 0, 1.8, 0, 0.2, 0.04, m);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      candle(k, O, Math.cos(a) * 0.2, 1.8, Math.sin(a) * 0.2, 0.26, wax, 0.45);
    }
    candle(k, O, 0, 1.8, 0, 0.38, wax, 0.5);
    return 2.15;
  },
  'brazier-hanging': (k, O, w, d, R, c) => {
    const m = c('metal', IRON), fl = c('fire', '#ffb02e'), y = 2.75;
    k.P('metal', O, 'hemi', 0, y, 0, 0.62, 0.7, 0.62, m, Math.PI);
    k.Ring('metal', O, 0, y, 0, 0.31, 0.06, m);
    k.C('lit', O, 0, y - 0.08, 0, 0.27, 0.05, '#3a2418', 'cyl16');
    fire(k, O, 0, y - 0.03, 0, 1.4, fl);
    fire(k, O, -0.12, y - 0.03, 0.07, 0.9, fl);
    fire(k, O, 0.11, y - 0.03, -0.08, 0.9, fl);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU - Math.PI / 2;
      k.Beam('metal', O, [Math.cos(a) * 0.3, y, Math.sin(a) * 0.3], [0, y + 0.75, 0], 0.012, m, 'cyl6');
    }
    k.P('metal', O, 'torus', 0, y + 0.78, 0, 0.1, 0.5, 0.1, m, Math.PI / 2);
    k.Beam('metal', O, [0, y + 0.82, 0], [0, HALL_H - 0.02, 0], 0.016, m, 'cyl6');
    return y + 0.2;
  },
  'hearth-grand': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), wood = c('wood', WOOD), fl = c('fire', '#ffb02e');
    k.B('stone', O, 0, 0, -0.05, 2.4, 0.08, 0.7, lighten(st, 0.06));
    k.B('cave', O, 0, 0, -0.45, 1.8, 1.9, 0.1, '#1c1410');
    for (const s of [-1, 1]) {
      k.B('stone', O, s * 1.15, 0, -0.25, 0.5, 1.9, 0.5, st);
      k.B('metal', O, s * 0.55, 0, -0.1, 0.05, 0.38, 0.05, '#33373c');
      k.S('metal', O, s * 0.55, 0.4, -0.1, 0.05, '#55585e');
    }
    k.B('stone', O, 0, 1.9, -0.22, 2.9, 0.35, 0.56, st);
    k.B('lit', O, 0, 2.25, -0.2, 3.0, 0.08, 0.6, lighten(st, 0.08));
    k.B('stone', O, 0, 2.33, -0.35, 2.4, HALL_H - 0.02 - 2.33, 0.3, shade(st));
    k.P('metal', O, 'cyl16', 0, 3.4, -0.19, 0.6, 0.04, 0.6, GOLD, Math.PI / 2);
    k.P('wood', O, 'cyl', -0.1, 0.17, -0.22, 0.17, 0.95, 0.17, wood, 0, 0.1, Math.PI / 2);
    k.P('wood', O, 'cyl', 0.12, 0.17, -0.08, 0.16, 0.9, 0.16, shade(wood), 0, -0.2, Math.PI / 2);
    k.P('wood', O, 'cyl', 0, 0.32, -0.16, 0.15, 0.8, 0.15, wood, 0, 0.35, Math.PI / 2);
    fire(k, O, 0, 0.3, -0.17, 2.6, fl);
    fire(k, O, -0.32, 0.22, -0.12, 1.6, fl);
    fire(k, O, 0.3, 0.22, -0.2, 1.6, fl);
    return 0.6;
  },
  'throne-dais': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), m = c('metal', GOLD), cl = c('cloth', CLOTH), zc = -0.04;
    k.B('stone', O, 0, 0, zc, 2.88, 0.2, 2.88, shade(st));
    k.B('stone', O, 0, 0.2, zc, 2.28, 0.2, 2.28, st);
    k.B('stone', O, 0, 0.4, zc, 1.68, 0.2, 1.68, lighten(st, 0.06));
    k.P('fabric', O, 'box', 0, 0.33, 1.15, 0.56, 0.02, 0.92, cl, Math.atan2(0.6, 0.7));
    k.B('fabric', O, 0, 0.6, 0.45, 0.56, 0.015, 0.7, cl);
    k.B('metal', O, 0, 0.6, -0.15, 0.9, 0.45, 0.7, m);
    k.B('fabric', O, 0, 1.05, -0.12, 0.72, 0.08, 0.6, cl);
    k.B('metal', O, 0, 1.05, -0.47, 0.95, 1.9, 0.14, m);
    k.B('fabric', O, 0, 1.15, -0.395, 0.7, 1.5, 0.02, cl);
    k.P('metal', O, 'pyr', 0, 3.15, -0.47, 0.5, 0.4, 0.14, m);
    for (const s of [-1, 1]) {
      k.S('metal', O, s * 0.48, 2.98, -0.47, 0.09, m);
      k.B('metal', O, s * 0.47, 1.05, -0.15, 0.12, 0.35, 0.7, lighten(m, 0.06));
    }
    k.S('glow', O, 0, 2.6, -0.39, 0.06, '#d6402f', 'oct');
    return undefined;
  },
  'feast-hall-table': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), cl = c('cloth', CLOTH), m = c('metal', GOLD);
    k.B('wood', O, 0, 0.74, 0, 5.8, 0.07, 0.96, wood);
    for (const x of [-2.3, 0, 2.3]) k.B('wood', O, x, 0, 0, 0.1, 0.74, 0.8, DARKWOOD);
    k.B('wood', O, 0, 0.3, 0, 4.7, 0.08, 0.08, DARKWOOD);
    for (const z of [-0.75, 0.75]) {
      k.B('wood', O, 0, 0.42, z, 5.4, 0.06, 0.3, shade(wood));
      for (const x of [-2.4, 0, 2.4]) k.B('wood', O, x, 0, z, 0.08, 0.42, 0.26, DARKWOOD);
    }
    k.B('fabric', O, 0, 0.81, 0, 5.4, 0.01, 0.28, cl);
    for (let i = 0; i < 6; i++) k.C('lit', O, -2.4 + i * 0.96, 0.81, i % 2 ? 0.3 : -0.3, 0.11, 0.02, '#d9d2c3', 'cyl16');
    k.C('metal', O, 0, 0.82, 0, 0.32, 0.02, '#d9d2c3', 'cyl16');
    k.P('lit', O, 'sph', 0, 0.9, 0, 0.45, 0.2, 0.3, '#8a4a22');
    for (const x of [-1.8, 1.8]) {
      k.C('metal', O, x, 0.82, 0, 0.03, 0.3, m, 'cyl6');
      flameCup(k, O, x, 1.12, 0, 0.5);
    }
    return undefined;
  },
  'statue-tall-knight': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), b = c('body', '#b8b2a6'), y = 1.3;
    plinthM(k, O, 1.64, y, st);
    for (const s of [-1, 1]) {
      k.B('lit', O, s * 0.17, y, 0, 0.24, 1.25, 0.3, b);
      k.S('lit', O, s * 0.42, y + 2.2, 0, 0.2, lighten(b, 0.05));
      k.Beam('lit', O, [s * 0.38, y + 2.1, 0.05], [s * 0.08, y + 1.35, 0.34], 0.09, b);
      k.S('lit', O, s * 0.07, y + 1.33, 0.35, 0.075, b);
    }
    k.C('lit', O, 0, y + 1.05, 0, 0.36, 0.4, b, 'cyl16');
    k.P('lit', O, 'cyl16', 0, y + 1.8, 0, 0.78, 0.9, 0.5, b);
    k.C('lit', O, 0, y + 2.25, 0, 0.17, 0.36, b, 'cyl16');
    k.S('lit', O, 0, y + 2.6, 0, 0.17, b);
    k.B('lit', O, 0, y + 2.68, 0, 0.05, 0.18, 0.38, lighten(b, 0.08));
    k.B('lit', O, 0, y + 0.2, -0.28, 0.85, 2.05, 0.08, shade(b), -0.05);
    k.B('lit', O, 0, y, 0.36, 0.1, 1.15, 0.03, lighten(b, 0.1));
    k.B('lit', O, 0, y + 1.15, 0.36, 0.5, 0.06, 0.06, b);
    k.C('lit', O, 0, y + 1.21, 0.36, 0.03, 0.22, b, 'cyl6');
    k.S('lit', O, 0, y + 1.46, 0.36, 0.05, b);
    return undefined;
  },
  'statue-tall-robed': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8780'), b = c('body', '#b8b2a6'), gl = c('glow', '#ffd27a'), y = 1.3, item = vi(p);
    plinthM(k, O, 1.64, y, st);
    k.P('lit', O, 'cone', 0, y + 1.2, 0, 1.0, 2.4, 0.85, b);
    k.P('lit', O, 'sph', 0, y + 2.1, 0, 0.7, 0.4, 0.5, b);
    k.S('lit', O, 0, y + 2.45, -0.02, 0.24, shade(b));
    k.S('cave', O, 0, y + 2.42, 0.12, 0.13, '#1c1612');
    k.Beam('lit', O, [-0.3, y + 2.0, 0.05], [-0.1, y + 1.45, 0.35], 0.1, b);
    k.Beam('lit', O, [0.3, y + 2.0, 0.05], item === 2 ? [0.28, y + 1.5, 0.3] : [0.1, y + 1.45, 0.35], 0.1, b);
    if (item === 1) lanternM(k, O, 0, y + 1.1, 0.42, 1, b, gl);
    else if (item === 2) {
      k.Beam('lit', O, [0.28, y + 0.02, 0.32], [0.28, y + 3.0, 0.32], 0.04, lighten(b, 0.05));
      k.S('lit', O, 0.28, y + 3.08, 0.32, 0.09, b);
    } else if (item === 3) k.S('glow', O, 0, y + 1.52, 0.42, 0.14, gl);
    else k.B('lit', O, 0, y + 1.38, 0.4, 0.4, 0.07, 0.3, lighten(b, 0.1));
    return undefined;
  },
  'statue-tall-winged': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), b = c('body', '#b8b2a6'), y = 1.2;
    plinthM(k, O, 1.4, y, st);
    k.P('lit', O, 'cone', 0, y + 1.0, 0, 0.7, 2.0, 0.55, b);
    k.P('lit', O, 'sph', 0, y + 1.95, 0, 0.6, 0.6, 0.42, b);
    k.S('lit', O, 0, y + 2.45, 0, 0.16, lighten(b, 0.05));
    for (const s of [-1, 1]) {
      for (let j = 0; j < 3; j++) {
        const th = 0.35 + j * 0.38, L = 1.3 - j * 0.28, bx = s * 0.2, by = y + 2.0;
        k.P('lit', O, 'box', bx + s * Math.sin(th) * L / 2, by + Math.cos(th) * L / 2, -0.18 - j * 0.02, 0.34, L, 0.05, j ? shade(b) : b, 0, 0, -s * th);
      }
    }
    k.Beam('lit', O, [0.42, y + 0.05, 0.25], [0.42, y + 3.1, 0.25], 0.035, shade(b));
    k.P('lit', O, 'cone', 0.42, y + 3.2, 0.25, 0.1, 0.22, 0.1, lighten(b, 0.08));
    k.Beam('lit', O, [0.22, y + 2.0, 0], [0.4, y + 1.7, 0.22], 0.08, b);
    k.Beam('lit', O, [-0.22, y + 2.0, 0], [-0.3, y + 1.3, 0.1], 0.08, b);
    return undefined;
  },
  'fountain-grand': (k, O, w, d, R, c) => {
    const st = c('stone', '#dcd8d0'), wa = c('water', '#4f8fb0'), fall = lighten(wa, 0.4);
    k.C('stone', O, 0, 0, 0, 1.45, 0.45, st, 'cyl16');
    k.C('deco', O, 0, 0.45, 0, 1.3, 0.04, wa, 'cyl16');
    k.P('stone', O, 'torus', 0, 0.5, 0, 2.75, 0.6, 2.75, lighten(st, 0.06));
    k.C('stone', O, 0, 0.45, 0, 0.18, 1.0, st, 'cyl16');
    k.P('stone', O, 'hemi', 0, 1.5, 0, 1.24, 0.5, 1.24, st, Math.PI);
    k.C('deco', O, 0, 1.45, 0, 0.55, 0.03, wa, 'cyl16');
    k.C('stone', O, 0, 1.5, 0, 0.11, 0.75, st, 'cyl16');
    k.P('stone', O, 'hemi', 0, 2.4, 0, 0.64, 0.3, 0.64, st, Math.PI);
    k.C('deco', O, 0, 2.36, 0, 0.28, 0.03, wa, 'cyl16');
    k.S('stone', O, 0, 2.55, 0, 0.12, lighten(st, 0.06));
    k.P('stone', O, 'cone', 0, 2.76, 0, 0.12, 0.24, 0.12, st);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + 0.3;
      k.Beam('deco', O, [Math.cos(a) * 0.6, 1.48, Math.sin(a) * 0.6], [Math.cos(a) * 0.82, 0.48, Math.sin(a) * 0.82], 0.03, fall, 'cyl6');
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU;
      k.Beam('deco', O, [Math.cos(a) * 0.31, 2.38, Math.sin(a) * 0.31], [Math.cos(a) * 0.44, 1.47, Math.sin(a) * 0.44], 0.022, fall, 'cyl6');
    }
    return undefined;
  },
  'organ-cathedral': (k, O, w, d, R, c) => {
    const wood = c('wood', '#6b4428'), m = c('metal', '#c9ced3');
    k.B('wood', O, 0, 0, -0.3, 3.8, 1.2, 0.4, wood);
    k.B('wood', O, 0, 1.2, -0.46, 3.8, 2.5, 0.06, shade(wood));
    k.B('wood', O, 0, 0, 0.11, 1.28, 0.9, 0.3, wood);
    k.B('lit', O, 0, 0.9, 0.18, 1.08, 0.04, 0.12, '#efe8d8');
    k.B('lit', O, 0, 0.98, 0.08, 1.08, 0.04, 0.1, '#efe8d8');
    k.B('wood', O, 0, 0, 0.39, 0.8, 0.45, 0.14, DARKWOOD);
    const tower = (x0: number, x1: number, r: number, hMax: number) => {
      for (let i = 0; i < 6; i++) {
        const x = x0 + ((i + 0.5) / 6) * (x1 - x0), h = hMax - Math.abs(i - 2.5) * 0.22;
        k.C('metal', O, x, 1.2, -0.26, r, h, i % 2 ? m : lighten(m, 0.08), 'cyl16');
      }
    };
    tower(-1.84, -0.74, 0.085, 2.4);
    tower(-0.62, 0.62, 0.1, 3.3);
    tower(0.74, 1.84, 0.085, 2.4);
    return undefined;
  },
  'lectern-dais': (k, O, w, d, R, c) => {
    const st = c('stone', '#dcd8d0'), wood = c('wood', WOOD), m = c('metal', GOLD), wax = c('wax', WAX), tilt = -0.35;
    k.C('stone', O, 0, 0, 0, 0.94, 0.16, shade(st), 'cyl16');
    k.C('stone', O, 0, 0.16, -0.04, 0.66, 0.16, st, 'cyl16');
    k.C('wood', O, 0, 0.32, 0.04, 0.2, 0.06, wood, 'cyl16');
    k.C('wood', O, 0, 0.38, 0.04, 0.07, 0.78, wood, 'cyl6');
    k.B('wood', O, 0, 1.13, 0.04, 0.68, 0.05, 0.44, wood, tilt);
    for (const s of [-1, 1]) {
      k.B('lit', O, s * 0.14, 1.18, 0.04, 0.27, 0.03, 0.34, PAPER, tilt);
      k.C('metal', O, s * 0.48, 0.32, -0.24, 0.035, 0.4, m, 'cyl6');
      candle(k, O, s * 0.48, 0.72, -0.24, 0.12, wax, 0.35);
    }
    return undefined;
  },
  'war-table': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), mp = c('map', '#e6d6aa'), a = c('a', CLOTH), b = c('b', '#2f5d8a'), y = 0.9;
    k.B('wood', O, 0, 0.82, 0, 2.88, 0.08, 1.88, wood);
    for (const s of [-1, 1]) {
      k.B('wood', O, s * 1.0, 0.06, 0, 0.3, 0.76, 1.2, DARKWOOD);
      k.B('wood', O, s * 1.0, 0, 0, 0.5, 0.08, 1.5, DARKWOOD);
    }
    k.B('deco', O, 0, y, 0, 2.48, 0.005, 1.52, '#9ab4bf');
    k.P('deco', O, 'disc', -0.1, y + 0.007, 0.04, 1.9, 1, 1.16, mp);
    k.P('deco', O, 'disc', -0.35, y + 0.01, 0.2, 0.5, 1, 0.4, '#6e8a5a');
    for (const x of [0.42, 0.56, 0.7]) k.P('lit', O, 'cone', x, y + 0.05, -0.24, 0.1, 0.09, 0.1, '#7a6a5a');
    for (const [x, z, col] of [[-0.4, -0.18, a], [-0.26, -0.08, a], [-0.5, 0.2, a], [0.46, 0.18, b], [0.58, 0.04, b], [0.32, 0.4, b]] as [number, number, string][]) {
      k.C('lit', O, x, y, z, 0.045, 0.1, col, 'cyl6');
    }
    for (const [x, z, col] of [[0.02, -0.5, a], [0.76, 0.2, b]] as [number, number, string][]) {
      k.Beam('wood', O, [x, y, z], [x, y + 0.2, z], 0.008, DARKWOOD, 'cyl6');
      k.B('fabric', O, x + 0.06, y + 0.13, z, 0.12, 0.07, 0.005, col);
    }
    k.Beam('metal', O, [0.86, y + 0.02, -0.64], [1.16, y + 0.02, -0.44], 0.018, '#c9ced3', 'box');
    k.Beam('metal', O, [0.8, y + 0.02, -0.6], [0.88, y + 0.02, -0.72], 0.02, GOLD, 'box');
    candle(k, O, -1.06, y, 0.56, 0.14, WAX, 0.35);
    return undefined;
  },
  'altar-reredos': (k, O, w, d, R, c) => {
    const st = c('stone', '#dcd8d0'), m = c('metal', GOLD), cl = c('cloth', '#e6e0d2'), wax = c('wax', WAX), dark = '#221a14';
    k.B('stone', O, 0, 0, -0.78, 2.92, 3.6, 0.44, st);
    for (const x of [-0.94, 0, 0.94]) {
      k.B('cave', O, x, 1.2, -0.555, 0.5, 1.3, 0.02, dark);
      k.P('lit', O, 'cone', x, 1.6, -0.62, 0.22, 0.8, 0.18, lighten(st, 0.1));
      k.P('stone', O, 'pyr', x, x ? 4.1 : 4.17, -0.78, x ? 0.4 : 0.5, x ? 1.0 : 1.15, x ? 0.4 : 0.5, lighten(st, 0.05));
    }
    k.P('metal', O, 'cyl16', 0, 2.95, -0.55, 0.5, 0.04, 0.5, m, Math.PI / 2);
    k.B('stone', O, 0, 0, 0.46, 2.28, 0.14, 0.36, lighten(st, 0.06));
    k.B('stone', O, 0, 0, -0.05, 1.88, 0.95, 0.7, st);
    k.B('fabric', O, 0, 0.95, -0.05, 1.62, 0.02, 0.78, cl);
    k.B('fabric', O, 0, 0.55, 0.31, 1.62, 0.42, 0.02, cl);
    for (const s of [-1, 1]) {
      k.C('metal', O, s * 0.64, 0.97, -0.24, 0.04, 0.3, m, 'cyl6');
      candle(k, O, s * 0.64, 1.27, -0.24, 0.25, wax, 0.45);
    }
    k.B('metal', O, 0, 0.97, -0.1, 0.36, 0.2, 0.24, m);
    return undefined;
  },
  'idol-colossal': (k, O, w, d, R, c) => {
    const st = c('stone', '#b8a27c'), gem = c('gem', '#e63946');
    k.B('stone', O, 0, 0, -0.27, 2.72, 1.2, 2.3, shade(st));
    for (const s of [-1, 1]) {
      k.B('stone', O, s * 0.46, 0, 0.98, 0.5, 1.72, 0.44, st);
      k.B('stone', O, s * 0.5, 0, 1.22, 0.42, 0.22, 0.4, lighten(st, 0.04));
      k.B('stone', O, s * 0.46, 1.2, 0.375, 0.56, 0.5, 1.65, st);
      k.S('stone', O, s * 0.84, 2.9, -0.5, 0.36, st);
      k.Beam('stone', O, [s * 0.86, 2.8, -0.45], [s * 0.9, 1.95, 0.2], 0.22, st);
      k.Beam('stone', O, [s * 0.9, 1.95, 0.2], [s * 0.62, 1.85, 0.98], 0.19, lighten(st, 0.03));
      k.S('glow', O, s * 0.15, 3.58, -0.09, 0.04, gem);
    }
    k.P('stone', O, 'cyl16', 0, 2.15, -0.5, 1.7, 1.9, 1.0, st);
    k.C('stone', O, 0, 3.0, -0.42, 0.24, 0.2, st, 'cyl16');
    k.B('stone', O, 0, 3.15, -0.42, 0.68, 0.8, 0.66, lighten(st, 0.04));
    k.P('stone', O, 'pyr', 0, 4.25, -0.45, 1.0, 0.6, 0.8, lighten(st, 0.08));
    k.S('glow', O, 0, 3.74, -0.08, 0.08, gem, 'oct');
    return undefined;
  },
  'bookcase-grand': (k, O, w, d, R, c) => {
    const wood = c('wood', '#6b4428'), m = c('metal', GOLD), z = -0.23, top = 4.32;
    k.B('wood', O, 0, 0, -0.47, 2.92, top, 0.04, DARKWOOD);
    for (const x of [-1.44, -0.48, 0.48, 1.44]) k.B('wood', O, x, 0, z, 0.06, top, 0.5, shade(wood));
    for (let i = 0; i < 6; i++) {
      const y = i * 0.72;
      k.B('wood', O, 0, y, z, 2.92, 0.05, 0.5, wood);
      for (const x0 of [-1.41, -0.45, 0.51]) books(k, O, x0, x0 + 0.9, y + 0.05, z + 0.02, 0.36, R, 0.55, 1);
    }
    k.B('wood', O, 0, top, z + 0.02, 3.0, 0.1, 0.56, wood);
    k.Beam('metal', O, [-1.46, 3.95, 0.06], [1.46, 3.95, 0.06], 0.02, m, 'cyl6');
    const xa = 0.4, xb = 0.72, lo = [0, 0.45], hi = [3.95, 0.08];
    for (const x of [xa, xb]) k.Beam('wood', O, [x, lo[0], lo[1]], [x, hi[0], hi[1]], 0.025, DARKWOOD, 'cyl6');
    for (const t of [0.25, 0.5, 0.75]) {
      const yy = lo[0] + (hi[0] - lo[0]) * t, zz = lo[1] + (hi[1] - lo[1]) * t;
      k.Beam('wood', O, [xa, yy, zz], [xb, yy, zz], 0.018, DARKWOOD, 'cyl6');
    }
    return undefined;
  },
  'reading-nook': (k, O, w, d, R, c) => {
    const wood = c('wood', '#6b4428'), cl = c('cloth', '#3e6b3a'), rug = c('rug', CLOTH), wax = c('wax', WAX), C = sub(O, -0.22, -0.18, 0.5);
    k.P('fabric', O, 'disc', 0, 0.012, 0, 1.8, 1, 1.8, rug);
    k.Ring('deco', O, 0, 0.016, 0, 0.78, 0.03, lighten(rug, 0.4));
    k.B('wood', C, 0, 0, 0.02, 0.74, 0.42, 0.62, wood);
    k.B('fabric', C, 0, 0.42, 0.06, 0.56, 0.1, 0.5, cl);
    k.B('fabric', C, 0, 0.42, -0.26, 0.74, 0.66, 0.16, cl);
    for (const s of [-1, 1]) k.B('fabric', C, s * 0.32, 0.42, 0.02, 0.12, 0.22, 0.62, shade(cl));
    k.B('wood', O, 0.3, 0, 0.4, 0.36, 0.22, 0.28, wood);
    k.B('fabric', O, 0.3, 0.22, 0.4, 0.4, 0.1, 0.32, cl);
    k.C('wood', O, 0.48, 0, -0.4, 0.12, 0.03, DARKWOOD, 'cyl16');
    k.C('wood', O, 0.48, 0.03, -0.4, 0.04, 0.57, DARKWOOD, 'cyl6');
    k.C('wood', O, 0.48, 0.6, -0.4, 0.22, 0.04, wood, 'cyl16');
    candle(k, O, 0.44, 0.64, -0.46, 0.12, wax, 0.35);
    k.B('fabric', O, 0.54, 0.64, -0.34, 0.16, 0.04, 0.12, '#7a2a22', 0, 0.4);
    for (let i = 0; i < 4; i++) k.B('fabric', O, -0.6, i * 0.06, 0.4, 0.24, 0.06, 0.17, BOOK_COLS[i + 1], 0, (R() - 0.5) * 0.6);
    return undefined;
  },
  'astrolabe-stand': (k, O, w, d, R, c) => {
    const m = c('metal', GOLD), wood = c('wood', '#6b4428'), y = 1.75;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + Math.PI / 2;
      k.Beam('wood', O, [0, 0.9, 0], [Math.cos(a) * 0.44, 0, Math.sin(a) * 0.44], 0.03, wood, 'cyl6');
    }
    k.C('wood', O, 0, 0.85, 0, 0.035, 0.5, wood, 'cyl6');
    k.P('metal', O, 'torus', 0, y, 0, 0.8, 0.4, 0.8, m, Math.PI / 2);
    k.P('metal', O, 'cyl16', 0, y, -0.01, 0.72, 0.02, 0.72, shade(m), Math.PI / 2);
    for (const rz of [0, 1.05, 2.1]) k.P('metal', O, 'box', 0, y, 0.012, 0.68, 0.025, 0.012, lighten(m, 0.15), 0, 0, rz);
    k.P('metal', O, 'box', 0, y, 0.026, 0.8, 0.04, 0.015, m, 0, 0, 0.6);
    k.S('metal', O, 0, y, 0.03, 0.04, m);
    k.P('metal', O, 'torus', 0, y + 0.46, 0, 0.12, 0.5, 0.12, m, Math.PI / 2);
    return undefined;
  },
  'globe-great': (k, O, w, d, R, c) => {
    const wood = c('wood', '#6b4428'), sea = c('sea', '#3f6f9a'), land = c('land', '#9aa86a'), m = c('metal', GOLD), y = 1.3;
    for (const [x, z] of [[-0.64, -0.64], [0.64, -0.64], [-0.64, 0.64], [0.64, 0.64]]) k.C('wood', O, x, 0, z, 0.07, y, wood, 'cyl6');
    k.Beam('wood', O, [-0.64, 0.25, -0.64], [0.64, 0.25, 0.64], 0.035, shade(wood), 'cyl6');
    k.Beam('wood', O, [0.64, 0.25, -0.64], [-0.64, 0.25, 0.64], 0.035, shade(wood), 'cyl6');
    k.P('wood', O, 'torus', 0, y, 0, 1.6, 0.6, 1.6, wood);
    k.S('lit', O, 0, y, 0, 0.62, sea);
    for (const [ax, ay, az, s] of [[-0.4, 0.3, -0.3, 0.22], [0.42, 0.12, -0.26, 0.17], [-0.12, -0.2, 0.44, 0.19]]) {
      const L = Math.hypot(ax, ay, az), r = 0.48;
      k.S('lit', O, (ax / L) * r, y + (ay / L) * r, (az / L) * r, s, land, 'ico');
    }
    k.P('metal', O, 'ring', 0, y, 0, 1.4, 0.8, 1.4, m, 0, 0.3, Math.PI / 2);
    return undefined;
  },
  'archive-stacks': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), paper = c('paper', '#e8dcb8'), H = 3.4;
    for (const s of [-1, 1]) k.B('wood', O, s * 0.94, 0, 0, 0.06, H, 0.84, shade(wood));
    for (let i = 1; i < 6; i++) k.B('wood', O, -0.94 + i * 0.313, 0, 0, 0.035, H, 0.84, wood);
    k.B('wood', O, 0, 0, 0, 1.88, H, 0.03, DARKWOOD);
    for (let i = 0; i < 6; i++) {
      const y = i * 0.672;
      k.B('wood', O, 0, y, 0, 1.92, 0.05, 0.84, wood);
      if (i < 5) for (const s of [-1, 1]) k.B('lit', O, 0, y + 0.05, s * 0.22, 1.82, 0.36 + R() * 0.12, 0.36, i % 2 ? paper : lighten(paper, 0.08));
    }
    for (let i = 0; i < 3; i++) k.P('lit', O, 'cyl6', -0.6 + i * 0.55, 0.9 + i * 1.34, 0.44, 0.07, 0.3, 0.07, lighten(paper, 0.1), Math.PI / 2 - 0.15);
    return undefined;
  },
  'gate-iron-tall': (k, O, w, d, R, c) => {
    const m = c('metal', '#33373c'), st = c('stone', '#8a8780');
    for (const s of [-1, 1]) {
      k.B('stone', O, s * 0.83, 0, 0, 0.26, 4.0, 0.44, st);
      k.P('stone', O, 'pyr', s * 0.83, 4.15, 0, 0.36, 0.3, 0.36, lighten(st, 0.06), 0, Math.PI / 4, 0);
    }
    for (let i = 0; i < 11; i++) {
      const x = -0.63 + i * 0.126, h = 3.3 + 0.35 * Math.cos((x / 0.7) * (Math.PI / 2));
      k.C('metal', O, x, 0, 0, 0.02, h, m, 'cyl6');
      if (i % 2 === 0) k.P('metal', O, 'cone', x, h + 0.08, 0, 0.07, 0.16, 0.07, lighten(m, 0.1));
    }
    for (const y of [0.2, 1.6, 3.0]) k.B('metal', O, 0, y, 0, 1.4, 0.06, 0.05, m);
    k.B('metal', O, 0, 1.45, 0.03, 0.16, 0.24, 0.05, lighten(m, 0.15));
    return undefined;
  },
  'sarcophagus-row': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), wax = c('wax', WAX);
    k.B('stone', O, 0, 0, 0, 3.92, 0.25, 1.88, shade(st));
    for (const x of [-1.27, 0, 1.27]) {
      k.B('stone', O, x, 0.25, 0, 0.82, 0.62, 1.56, st);
      k.B('stone', O, x, 0.87, 0, 0.9, 0.12, 1.64, lighten(st, 0.06));
      k.S('lit', O, x, 1.06, -0.5, 0.12, lighten(st, 0.1));
      k.P('lit', O, 'sph', x, 0.99, 0.06, 0.42, 0.18, 1.0, lighten(st, 0.08));
    }
    for (const x of [-0.63, 0.64]) candle(k, O, x, 0.25, -0.56, 0.2, wax, 0.4);
    return undefined;
  },
  'bone-heap': (k, O, w, d, R, c) => {
    const bone = c('bone', BONE), rad = 0.85, mh = 0.5;
    k.P('lit', O, 'hemi', 0, 0, 0.04, rad * 2, mh * 2, rad * 1.84, shade(bone));
    const hAt = (x: number, z: number) => mh * Math.sqrt(Math.max(0, 1 - (x * x + z * z) / (rad * rad)));
    for (let i = 0; i < 14; i++) {
      const a = R() * TAU, dd = Math.sqrt(R()) * 0.72, x = Math.cos(a) * dd, z = Math.sin(a) * dd, b = R() * Math.PI, L = 0.12 + R() * 0.12;
      const x0 = x - Math.cos(b) * L, z0 = z - Math.sin(b) * L, x1 = x + Math.cos(b) * L, z1 = z + Math.sin(b) * L;
      k.Beam('lit', O, [x0, hAt(x0, z0) + 0.02, z0], [x1, hAt(x1, z1) + 0.02, z1], 0.025, lighten(bone, (R() - 0.5) * 0.2));
    }
    for (let i = 0; i < 5; i++) {
      const a = R() * TAU, dd = Math.sqrt(R()) * 0.55, x = Math.cos(a) * dd, z = Math.sin(a) * dd;
      k.S('lit', O, x, hAt(x, z) + 0.05, z, 0.09, bone);
    }
    return undefined;
  },
  'torture-wheel': (k, O, w, d, R, c) => {
    const wood = c('wood', WOOD), m = c('metal', IRON), rope = c('rope', '#8a6a4a'), y = 1.3, rw = 0.76;
    k.P('wood', O, 'torus', 0, y, 0, rw * 2, 0.7, rw * 2, wood, Math.PI / 2);
    for (let i = 0; i < 4; i++) k.P('wood', O, 'box', 0, y, 0, rw * 1.9, 0.06, 0.05, shade(wood), 0, 0, (i * Math.PI) / 4);
    k.P('metal', O, 'cyl16', 0, y, 0, 0.2, 0.2, 0.2, m, Math.PI / 2);
    k.Beam('metal', O, [0, y, -0.42], [0, y, 0.42], 0.04, m);
    for (const z of [-0.38, 0.38]) {
      for (const s of [-1, 1]) k.Beam('wood', O, [s * 0.52, 0, z], [0, y + 0.12, z], 0.06, shade(wood), 'box');
      k.B('wood', O, 0, 0, z, 1.2, 0.1, 0.12, DARKWOOD);
    }
    for (const a of [0.4, 2.7]) k.B('fabric', O, Math.cos(a) * rw, y - Math.sin(a) * rw - 0.08, 0.06, 0.1, 0.16, 0.04, rope);
    return undefined;
  },
  'gibbet-post': (k, O, w, d, R, c, p) => {
    const wood = c('wood', '#6b4428'), m = c('metal', IRON), v = vi(p), cx = 0.5;
    k.B('stone', O, -0.68, 0, 0, 0.5, 0.2, 0.5, STONE);
    k.B('wood', O, -0.68, 0, 0, 0.2, 3.7, 0.2, wood);
    k.B('wood', O, -0.14, 3.5, 0, 1.3, 0.16, 0.16, wood);
    k.Beam('wood', O, [-0.68, 2.8, 0], [-0.2, 3.5, 0], 0.05, shade(wood), 'box');
    k.Beam('metal', O, [cx, 3.5, 0], [cx, 3.02, 0], 0.018, m, 'cyl6');
    k.S('metal', O, cx, 3.0, 0, 0.1, m);
    const rings: [number, number][] = [[2.95, 0.12], [2.6, 0.24], [1.2, 0.15]];
    k.Ring('metal', O, cx, 2.6, 0, 0.24, 0.04, m);
    k.Ring('metal', O, cx, 1.9, 0, 0.2, 0.04, m);
    k.Ring('metal', O, cx, 1.2, 0, 0.15, 0.04, m);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      for (let j = 0; j < 2; j++) {
        const [y0, r0] = rings[j], [y1, r1] = rings[j + 1];
        k.Beam('metal', O, [cx + Math.cos(a) * r0, y0, Math.sin(a) * r0], [cx + Math.cos(a) * r1, y1, Math.sin(a) * r1], 0.012, m, 'cyl6');
      }
    }
    if (v === 1 || v === 3) {
      k.S('lit', O, cx, 2.8, 0, 0.1, BONE);
      k.P('lit', O, 'sph', cx, 2.2, 0, 0.3, 0.42, 0.22, '#cfc6ae');
      k.Beam('lit', O, [cx - 0.06, 1.95, 0], [cx - 0.05, 1.3, 0.02], 0.025, BONE);
    }
    return undefined;
  },
  'stalactites-tall': (k, O, w, d, R, c) => {
    const rock = c('rock', '#8a8478'), wa = c('water', '#5a8aa8');
    k.P('cave', O, 'ico', 0.08, HALL_H - 0.24, 0.12, 1.6, 0.4, 1.3, rock);
    const spots: [number, number, number][] = [[70, 70, 22], [128, 60, 16], [104, 112, 26], [150, 120, 18], [60, 136, 14], [124, 158, 12], [160, 80, 11]];
    for (const [sx, sz, s] of spots) {
      const x = (sx - 100) / 100, z = (sz - 100) / 100, r = s / 100, L = 0.7 + (s / 26) * 1.5;
      k.P('cave', O, 'cone', x, HALL_H - 0.04 - L / 2, z, r * 2, L, r * 2, s % 2 ? rock : shade(rock), Math.PI);
      if (s >= 18) {
        k.S('deco', O, x, HALL_H - L - 0.12, z, 0.025, lighten(wa, 0.3));
        k.P('cave', O, 'cone', x, 0.12, z, r * 0.9, 0.24, r * 0.9, rock);
      }
    }
    k.P('deco', O, 'disc', 0.08, 0.01, 0.12, 1.2, 1, 0.92, wa);
    return undefined;
  },
  'crystal-spire': (k, O, w, d, R, c) => {
    const cr = c('crystal', '#8fd8ff'), rock = c('rock', '#5a5560');
    for (const [sx, sz, s] of [[70, 130, 30], [130, 136, 26], [100, 80, 28], [140, 86, 18]]) k.S('cave', O, (sx - 100) / 100, s / 300, (sz - 100) / 100, s / 100, rock, 'ico');
    k.P('glow', O, 'oct', 0, 1.8, 0.04, 0.55, 3.6, 0.55, cr);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + R() * 0.4, h = 1.0 + R() * 1.0, rb = 0.32;
      k.Beam('glow', O, [Math.cos(a) * rb, -0.1, Math.sin(a) * rb], [Math.cos(a) * (rb + 0.45 + R() * 0.2), h, Math.sin(a) * (rb + 0.45 + R() * 0.2)], 0.11, i % 2 ? cr : lighten(cr, 0.3), 'oct');
    }
    return 1.8;
  },
  'column-collapsed': (k, O, w, d, R, c) => {
    const st = c('stone', '#dcd8d0');
    k.B('stone', O, -1.06, 0, 0, 0.76, 0.2, 0.76, shade(st));
    k.C('stone', O, -1.06, 0.2, 0, 0.29, 0.9, st, 'cyl16');
    k.P('stone', O, 'ico', -1.06, 1.12, 0, 0.5, 0.3, 0.5, st);
    for (const [x, rot] of [[-0.38, -0.06], [0.2, 0.08]]) k.P('stone', O, 'cyl16', x, 0.3, 0.02, 0.6, 0.52, 0.6, st, 0, rot, Math.PI / 2);
    k.B('stone', O, 0.94, 0, 0, 0.6, 0.34, 0.6, lighten(st, 0.05), 0.06, -0.25, 0.1);
    for (const [sx, sz, s] of [[96, 84, 7], [178, 18, 6], [268, 84, 8], [212, 86, 5]]) k.S('stone', O, (sx - 150) / 100, s / 120, (sz - 50) / 100, s / 100, shade(st), 'ico');
    return undefined;
  },
  'ceiling-rubble': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), wood = c('wood', '#6b4428');
    k.P('cave', O, 'ico', 0, 0.12, 0, 0.9, 0.45, 0.8, st);
    for (const [sx, sz, rot] of [[60, 70, 0.3], [138, 136, -0.4], [118, 50, 0.9]]) {
      k.B('stone', O, (sx - 100) / 100, 0, (sz - 100) / 100, 0.36, 0.24, 0.24, lighten(st, 0.05), R() * 0.3, -rot, R() * 0.3);
    }
    for (let i = 0; i < 10; i++) {
      const a = R() * TAU, dd = Math.sqrt(R()) * 0.78, r = 0.05 + R() * 0.12;
      k.S('cave', O, Math.cos(a) * dd, r * 0.6, Math.sin(a) * dd, r, i % 2 ? st : shade(st), 'ico');
    }
    k.P('wood', O, 'box', 0.04, 0.3, -0.08, 1.5, 0.18, 0.18, wood, 0, -0.62, 0.3);
    k.Beam('wood', O, [0.6, HALL_H - 0.02, -0.5], [0.25, HALL_H - 1.1, -0.2], 0.08, wood, 'box');
    k.S('cave', O, -0.3, HALL_H - 0.3, 0.2, 0.25, shade(st), 'ico');
    return undefined;
  },
};

/** A slightly darker tone of a colour for carcass sides. */
function shade(hex: string) {
  const n = parseInt(hex.slice(1, 7), 16);
  const f = (v: number) => Math.round(v * 0.82).toString(16).padStart(2, '0');
  return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`;
}

// ---------------------------------------------------------------- tall hall helpers

/** Base of a tall column: square plinth and a round torus moulding, top at 0.32. */
function colFoot(k: Kit, O: Spot, st: string, s: number) {
  k.B('stone', O, 0, 0, 0, s * 2.05, 0.2, s * 2.05, shade(st));
  k.C('lit', O, 0, 0.2, 0, s * 0.85, 0.12, st, 'cyl16');
}

/** Head of a tall column: necking ring, flared bell and a square abacus just under the ceiling. */
function colHead(k: Kit, O: Spot, st: string, s: number) {
  k.C('lit', O, 0, HALL_H - 0.63, 0, s * 0.82, 0.14, st, 'cyl16');
  k.P('lit', O, 'cone', 0, HALL_H - 0.37, 0, s * 2.0, 0.24, s * 2.0, st, Math.PI);
  k.B('stone', O, 0, HALL_H - 0.25, 0, s * 2.05, 0.23, s * 2.05, shade(st));
}

/** A tall statue plinth (base, die and cap), top at h. */
function plinthM(k: Kit, O: Spot, size: number, h: number, st: string) {
  k.B('stone', O, 0, 0, 0, size, 0.2, size, shade(st));
  k.B('stone', O, 0, 0.2, 0, size * 0.86, h - 0.4, size * 0.86, st);
  k.B('lit', O, 0, h - 0.2, 0, size, 0.2, size, lighten(st, 0.05));
}

/** A small hanging lantern standing on y: base plate, glowing panes and a pointed cap. Top at y + 0.38 * s. */
function lanternM(k: Kit, O: Spot, x: number, y: number, z: number, s: number, metal: string, glass: string) {
  k.B('metal', O, x, y, z, 0.2 * s, 0.04 * s, 0.2 * s, metal);
  k.B('glow', O, x, y + 0.04 * s, z, 0.15 * s, 0.2 * s, 0.15 * s, glass);
  k.P('metal', O, 'pyr', x, y + 0.31 * s, z, 0.26 * s, 0.14 * s, 0.26 * s, metal, 0, Math.PI / 4, 0);
}

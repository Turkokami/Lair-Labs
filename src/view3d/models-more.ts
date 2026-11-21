// 3D models for library objects that only had a stand-in body. Built from the shared model kit.
// Local axes: x across the object's width, z across its depth (-z is the top edge / wall side), y up.
import type { Kit, Spot, Bin } from './kit';
import type { Prop } from '../engine/map';
import { objectById } from '../library/objects';
import { type Model, WOOD, DARKWOOD, IRON, GOLD, legsTable, flameCup } from './modelkit';

const H = Math.PI / 2, TAU = Math.PI * 2;
const DARK = '#16120f', BONE = '#e4dcc4', ROPE = '#c9b48a', SNOW = '#eef3f8';

/** A flag from the placed object's chosen variant (e.g. open, broken), 0 when unset. */
const fl = (p: Prop, key: string) => (p?.kind ? objectById(p.kind)?.variants?.[p.v ?? 0]?.f?.[key] ?? 0 : 0);
/** Darken (f < 1) or lighten (f > 1) a #rrggbb colour. */
const dk = (hex: string, f = 0.75) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(Math.min(255, v * f)).toString(16).padStart(2, '0')).join('');
};
/** A sub-spot at local lx,lz of O, turned a further dry radians. */
const at = (O: Spot, lx: number, lz: number, dry = 0): Spot => {
  const a = O.ry ?? 0, cs = Math.cos(a), sn = Math.sin(a);
  return { x: O.x + lx * cs + lz * sn, z: O.z - lx * sn + lz * cs, ry: a + dry, y: O.y };
};
/** An upright disc facing +z (face 1) or -z (face -1). */
const vdisc = (k: Kit, bin: Bin, O: Spot, x: number, y: number, z: number, w: number, h: number, col: string, face = 1) =>
  k.P(bin, O, 'disc', x, y, z, w, 1, h, col, face > 0 ? H : -H);
/** An open bowl: rim at y, hanging down by depth, with a fill disc just under the rim. */
const bowl = (k: Kit, bin: Bin, O: Spot, x: number, y: number, z: number, r: number, depth: number, col: string, fill: string) => {
  k.P(bin, O, 'hemi', x, y, z, r * 2, depth * 2, r * 2, col, Math.PI);
  k.Ring(bin, O, x, y, z, r, 0.025, col);
  k.P('deco', O, 'disc', x, y - 0.012, z, r * 1.94, 1, r * 1.94, fill);
};
/** A water or feed trough with real walls, so the fill shows. */
const trough = (k: Kit, O: Spot, w: number, d: number, col: string, fill: string, stone: boolean, feed: boolean) => {
  const L = w * 0.9, D = Math.min(0.62, d * 0.62), y0 = stone ? 0 : 0.12, h = 0.48, t = 0.07, bin: Bin = stone ? 'lit' : 'wood';
  if (!stone) for (const s of [-1, 1]) k.B('wood', O, s * L * 0.36, 0, 0, 0.1, y0 + 0.02, D + 0.1, DARKWOOD);
  k.B(bin, O, 0, y0, 0, L, 0.06, D, col);
  for (const s of [-1, 1]) {
    k.B(bin, O, 0, y0, (s * (D - t)) / 2, L, h, t, col);
    k.B(bin, O, (s * (L - t)) / 2, y0, 0, t, h, D - 2 * t, col);
  }
  k.P(feed ? 'fabric' : 'deco', O, 'flat', 0, y0 + h - 0.08, 0, L - 2 * t, 1, D - 2 * t, fill);
};
/** A curving sheet (hammock bed) between z0 and z1, sagging by sag. */
const sheet = (k: Kit, O: Spot, z0: number, z1: number, y: number, sag: number, wd: number, cols: string[], n = 6) => {
  let pz = z0, py = y;
  for (let i = 1; i <= n; i++) {
    const u = i / n, qz = z0 + (z1 - z0) * u, qy = y - Math.sin(Math.PI * u) * sag, len = Math.hypot(qz - pz, qy - py);
    k.P('fabric', O, 'box', 0, (py + qy) / 2, (pz + qz) / 2, wd, 0.02, len + 0.01, cols[i % cols.length], -Math.atan2(qy - py, qz - pz));
    pz = qz; py = qy;
  }
};

// ---------------------------------------------------------------- traps (low, subtle floor details)
const TRAPS: Record<string, Model> = {
  'pressure-plate': (k, O, w, d, R, c) => {
    k.P('deco', O, 'flat', 0, 0.005, 0, 0.66, 1, 0.66, DARK);
    k.B('lit', O, 0, 0, 0, 0.6, 0.022, 0.6, c('stone', '#8a8780'), 0.01, R() * 0.08 - 0.04, 0);
  },
  'glyph-trap': (k, O, w, d, R, c) => {
    const ln = c('line', '#ff7a5a'), gl = c('glow', '#ff3b1f');
    k.Ring('glow', O, 0, 0.009, 0, 0.36, 0.02, ln);
    k.Ring('glow', O, 0, 0.009, 0, 0.24, 0.016, gl);
    for (let i = 0; i < 3; i++) k.P('glow', O, 'flat', 0, 0.006 + i * 0.001, 0, 0.66, 1, 0.022, ln, 0, (i * Math.PI) / 3, 0);
    k.P('glow', O, 'disc', 0, 0.01, 0, 0.1, 1, 0.1, gl);
  },
  'trap-spike-pit': (k, O, w, d, R, c, p) => {
    const s = c('stone', '#8a8780'), m = c('metal', '#6c6f73');
    k.P('cave', O, 'flat', 0, 0.006, 0, 0.84, 1, 0.84, '#120f0d');
    if (fl(p, 'cover')) {
      k.B('lit', O, 0, 0, 0, 0.8, 0.02, 0.8, s);
      k.P('deco', O, 'flat', 0.05, 0.021, -0.08, 0.5, 1, 0.012, DARK, 0, 0.6, 0);
      return;
    }
    for (const t of [-1, 1]) {
      k.B('lit', O, 0, 0, t * 0.45, 0.98, 0.05, 0.1, s);
      k.B('lit', O, t * 0.45, 0, 0, 0.1, 0.05, 0.8, s);
    }
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const h = 0.14 + R() * 0.07;
        k.P('metal', O, 'cone', -0.24 + i * 0.24, h / 2, -0.24 + j * 0.24, 0.07, h, 0.07, m);
      }
  },
  'trap-blade': (k, O, w, d, R, c) => {
    const m = c('metal', '#b9c0c6'), th = 0.35, L = 1.75, ex = Math.sin(th) * L, ey = 2.38 - Math.cos(th) * L;
    k.B('metal', O, 0, 2.34, 0, w * 0.9, 0.05, 0.12, '#1c1c1e');
    k.S('metal', O, 0, 2.34, 0, 0.06, IRON);
    k.Beam('metal', O, [0, 2.36, 0], [ex, ey, 0], 0.025, IRON);
    k.P('metal', O, 'hemi', ex, ey, 0, 0.95, 0.65, 0.04, m, 0, 0, Math.PI + th);
    k.P('deco', O, 'flat', 0, 0.006, 0, w * 0.85, 1, 0.05, '#2a2622');
  },
  'trap-darts': (k, O, w, d, R, c) => {
    const dc = c('dart', '#5a3d24'), fc = c('fletch', '#c0392b');
    for (const x of [-0.25, 0, 0.25]) vdisc(k, 'deco', O, x, 0.95, -0.495, 0.05, 0.05, DARK);
    for (let i = 0; i < 3; i++) {
      const x = (R() - 0.5) * 0.6, z = -0.1 + R() * 0.45, a = R() * TAU, dx = Math.cos(a) * 0.1, dz = Math.sin(a) * 0.1;
      k.Beam('wood', O, [x - dx, 0.012, z - dz], [x + dx, 0.012, z + dz], 0.008, dc);
      k.S('fabric', O, x - dx, 0.018, z - dz, 0.02, fc);
    }
  },
  'trap-bear': (k, O, w, d, R, c, p) => {
    const m = c('metal', '#6c6f73');
    if (fl(p, 'shut')) {
      k.P('metal', O, 'ring', 0, 0.16, 0, 0.36, 0.5, 0.3, m, H);
      k.B('metal', O, 0, 0, 0, 0.42, 0.03, 0.12, m);
    } else {
      k.Ring('metal', O, 0, 0.03, 0, 0.2, 0.03, m);
      k.C('metal', O, 0, 0, 0, 0.08, 0.035, '#4a4d52', 'cyl16');
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU;
        k.P('metal', O, 'cone', Math.cos(a) * 0.2, 0.06, Math.sin(a) * 0.2, 0.025, 0.06, 0.025, m);
      }
    }
    for (const s of [-1, 1]) k.B('metal', O, s * 0.3, 0, 0, 0.18, 0.03, 0.06, m);
    k.C('metal', O, 0.32, 0, 0.34, 0.025, 0.1, IRON, 'cyl6');
    k.Sag('metal', O, [0.3, 0.02, 0.05], [0.32, 0.03, 0.32], 0.01, 0.01, IRON, 3);
  },
  'trap-tripwire': (k, O, w, d, R, c, p) => {
    const wc = c('wire', '#d8d2c0');
    for (const s of [-1, 1]) k.C('wood', O, s * 0.82, 0, 0, 0.025, 0.16, '#5a3d24', 'cyl6');
    k.Beam('metal', O, [-0.82, 0.11, 0], [0.82, 0.11, 0], 0.006, wc);
    if (fl(p, 'bells')) for (let i = 0; i < 3; i++) k.S('metal', O, 0.87, 0.07, -0.06 + i * 0.06, 0.03, GOLD);
    if (fl(p, 'bow')) {
      k.B('wood', O, 0.87, 0.03, 0.18, 0.22, 0.05, 0.06, DARKWOOD);
      k.Beam('metal', O, [0.79, 0.07, 0.05], [0.79, 0.07, 0.31], 0.012, IRON);
    }
  },
  'trap-falling-block': (k, O, w, d, R, c, p) => {
    const s = c('stone', '#8a8780');
    if (fl(p, 'rocks')) for (let i = 0; i < 5; i++) k.S('cave', O, (R() - 0.5) * 0.6, 2.05 + R() * 0.12, (R() - 0.5) * 0.6, 0.13 + R() * 0.06, s, 'ico');
    else k.B('stone', O, 0, 1.98, 0, 0.92, 0.4, 0.92, s);
    for (let i = 0; i < 3; i++) k.S('lit', O, (R() - 0.5) * 0.7, 0.03, (R() - 0.5) * 0.7, 0.04, s, 'ico');
  },
  'trap-needle-lock': (k, O, w, d, R, c) => {
    const m = c('metal', '#c9a24a'), po = c('poison', '#5fe39a');
    k.B('metal', O, 0, 0, 0, 0.32, 0.26, 0.14, m);
    k.P('metal', O, 'ring', 0, 0.3, 0, 0.22, 0.6, 0.22, m, H);
    vdisc(k, 'deco', O, 0, 0.12, 0.071, 0.04, 0.07, DARK);
    k.Beam('glow', O, [0, 0.12, 0.07], [0, 0.12, 0.17], 0.006, po);
    k.S('glow', O, 0, 0.12, 0.17, 0.012, po);
  },
  'trap-fire-vent': (k, O, w, d, R, c) => {
    const m = c('metal', '#6c6f73'), j = c('jet', '#ffb02e');
    k.P('deco', O, 'disc', 0, 0.005, 0, 0.86, 1, 0.86, '#2a2420');
    k.C('metal', O, 0, 0, 0, 0.27, 0.025, m, 'cyl16');
    k.P('deco', O, 'disc', 0, 0.0265, 0, 0.44, 1, 0.44, DARK);
    k.P('glow', O, 'disc', 0, 0.027, 0, 0.22, 1, 0.22, j);
    for (const i of [-1, 0, 1]) k.B('metal', O, i * 0.1, 0.025, 0, 0.025, 0.012, 0.44, m);
  },
  'trap-collapsing-floor': (k, O, w, d, R, c, p) => {
    const s = c('stone', '#8a8780');
    k.P('cave', O, 'flat', 0, 0.005, 0, w * 0.92, 1, d * 0.92, '#110e0c');
    if (fl(p, 'wood'))
      for (let i = 0; i < 6; i++) k.B('wood', O, (R() - 0.5) * 0.05, 0, -0.75 + i * 0.3, 1.8, 0.03, 0.26, s, (R() - 0.5) * 0.06, (R() - 0.5) * 0.04, (R() - 0.5) * 0.05);
    else
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 2; j++) k.B('lit', O, -0.44 + i * 0.88, 0, -0.44 + j * 0.88, 0.84, 0.03, 0.84, s, (R() - 0.5) * 0.07, (R() - 0.5) * 0.1, (R() - 0.5) * 0.07);
  },
};

// ---------------------------------------------------------------- decor
const DECOR: Record<string, Model> = {
  'blood-pool': (k, O, w, d, R, c) => {
    const b = c('blood', '#8a0f12');
    k.P('deco', O, 'disc', 0, 0.006, 0, 0.62, 1, 0.5, b, 0, R() * 3, 0);
    k.P('deco', O, 'disc', 0.14, 0.008, 0.08, 0.36, 1, 0.3, dk(b, 0.85), 0, R() * 3, 0);
    for (let i = 0; i < 3; i++) {
      const s = 0.07 + R() * 0.05;
      k.P('deco', O, 'disc', (R() - 0.5) * 0.8, 0.01, (R() - 0.5) * 0.8, s, 1, s, b);
    }
  },
  'wall-chains': (k, O, w, d, R, c, p) => {
    const m = c('metal', '#6c6f73');
    for (const s of [-1, 1]) {
      const x = s * 0.28;
      k.B('metal', O, x, 1.5, -0.065, 0.1, 0.1, 0.03, IRON);
      k.Sag('metal', O, [x, 1.55, -0.04], [x * 0.8, 1.0, 0.04], 0.03, 0.012, m, 3);
      k.P('metal', O, 'ring', x * 0.8, 0.95, 0.04, 0.12, 0.5, 0.12, m, H);
    }
    k.Sag('metal', O, [-0.28, 1.56, -0.04], [0.28, 1.56, -0.04], 0.28, 0.012, m, 5);
    if (fl(p, 'bones')) {
      k.S('lit', O, 0.05, 0.1, 0.1, 0.1, BONE);
      for (let i = 0; i < 3; i++) {
        const x = (R() - 0.5) * 0.6, z = 0.05 + R() * 0.3, a = R() * TAU;
        k.Beam('lit', O, [x, 0.03, z], [x + Math.cos(a) * 0.25, 0.03, z + Math.sin(a) * 0.12], 0.022, BONE);
      }
    }
  },
  'statue-gargoyle': (k, O, w, d, R, c) => {
    const s = c('stone', '#8a8780');
    k.B('lit', O, 0, 0, 0, 0.7, 0.55, 0.7, s);
    k.B('lit', O, 0, 0.55, 0, 0.76, 0.06, 0.76, dk(s, 0.9));
    k.P('stone', O, 'ico', 0, 0.86, -0.02, 0.42, 0.5, 0.4, s);
    k.S('stone', O, 0, 1.18, 0.12, 0.13, s, 'ico');
    k.P('stone', O, 'cone', 0, 1.15, 0.27, 0.1, 0.14, 0.1, s, H);
    for (const g of [-1, 1]) {
      k.P('stone', O, 'cone', g * 0.08, 1.3, 0.08, 0.05, 0.16, 0.05, s, -0.4, 0, -g * 0.3);
      k.P('stone', O, 'pyr', g * 0.28, 1.12, -0.16, 0.5, 0.55, 0.04, s, 0.2, g * 0.5, -g * 0.5);
      k.Beam('stone', O, [g * 0.12, 0.9, 0.1], [g * 0.13, 0.62, 0.24], 0.045, s);
    }
  },
  'statue-dragon': (k, O, w, d, R, c) => {
    const s = c('stone', '#8a8780'), b = c('body', '#8f8b84'), e = c('eye', '#ffcf4a');
    k.B('lit', O, 0, 0, 0, 1.75, 0.3, 1.75, s);
    k.B('lit', O, 0, 0.3, 0, 1.6, 0.06, 1.6, dk(s, 0.9));
    k.P('stone', O, 'torus', 0, 0.48, -0.05, 1.2, 1.1, 1.0, b);
    k.P('stone', O, 'torus', 0.05, 0.72, -0.1, 0.8, 1.0, 0.7, b);
    k.P('stone', O, 'ico', 0, 0.85, -0.15, 0.6, 0.6, 0.7, b);
    k.Beam('stone', O, [0, 0.95, 0], [0, 1.45, 0.35], 0.13, b);
    k.B('stone', O, 0, 1.44, 0.48, 0.26, 0.22, 0.38, b);
    k.P('stone', O, 'cone', 0, 1.5, 0.72, 0.18, 0.22, 0.14, b, H);
    for (const g of [-1, 1]) {
      k.P('stone', O, 'cone', g * 0.09, 1.72, 0.36, 0.06, 0.28, 0.06, b, -0.9, 0, -g * 0.25);
      k.S('glow', O, g * 0.1, 1.6, 0.6, 0.035, e);
      k.Beam('stone', O, [g * 0.2, 1.05, -0.2], [g * 0.8, 1.9, -0.45], 0.05, b);
      k.P('stone', O, 'pyr', g * 0.55, 1.35, -0.4, 0.9, 1.1, 0.04, b, 0.15, g * 0.35, -g * 0.45);
    }
    k.Beam('stone', O, [0.45, 0.45, 0.3], [0.72, 0.4, 0.62], 0.07, b);
    k.Beam('stone', O, [0.72, 0.4, 0.62], [0.5, 0.38, 0.8], 0.05, b);
  },
  'bed-canopy': (k, O, w, d, R, c) => {
    const dr = c('drape', '#a3312c'), tr = c('trim', '#c99a2e'), wd = c('wood', '#6b4428');
    const y = 2.05, hw = w * 0.43, hd = d * 0.46;
    k.B('fabric', O, 0, y, 0, hw * 2, 0.04, hd * 2, dr);
    for (const t of [-1, 1]) {
      k.B('wood', O, 0, y - 0.04, t * hd, hw * 2 + 0.06, 0.08, 0.06, wd);
      k.B('wood', O, t * hw, y - 0.04, 0, 0.06, 0.08, hd * 2, wd);
      k.B('fabric', O, 0, y - 0.26, t * (hd + 0.035), hw * 2, 0.22, 0.015, dr);
      k.B('fabric', O, t * (hw + 0.035), y - 0.26, 0, 0.015, 0.22, hd * 2, dr);
      k.B('fabric', O, 0, y - 0.3, t * (hd + 0.035), hw * 2, 0.04, 0.02, tr);
      k.B('fabric', O, t * (hw + 0.035), y - 0.3, 0, 0.02, 0.04, hd * 2, tr);
    }
  },
  'coat-rack': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#6b4428'), cl = c('cloak', '#3e6b3a');
    for (let i = 0; i < 3; i++) k.Beam('wood', O, [Math.cos(i * 2.09) * 0.25, 0, Math.sin(i * 2.09) * 0.25], [0, 0.25, 0], 0.025, wd);
    k.C('wood', O, 0, 0, 0, 0.03, 1.75, wd, 'cyl6');
    k.S('wood', O, 0, 1.77, 0, 0.045, wd);
    for (let i = 0; i < 4; i++) {
      const a = i * H + Math.PI / 4;
      k.Beam('wood', O, [0, 1.6, 0], [Math.cos(a) * 0.16, 1.68, Math.sin(a) * 0.16], 0.015, wd);
    }
    if (!fl(p, 'bare')) {
      k.P('fabric', O, 'cone', 0, 1.12, 0.1, 0.42, 1.0, 0.22, cl);
      k.S('fabric', O, 0, 1.6, 0.1, 0.1, cl);
    }
  },
  mirror: (k, O, w, d, R, c, p) => {
    const fr = c('frame', '#e2b84a'), z0 = 0.04, bin: Bin = fr === '#6b4428' ? 'wood' : 'metal';
    k.B(bin, O, 0, 0, z0 + 0.05, 0.6, 0.05, 0.24, fr);
    for (const s of [-1, 1]) k.Beam(bin, O, [s * 0.22, 0.05, z0 + 0.05], [s * 0.36, 1.15, z0], 0.022, fr);
    k.P(bin, O, 'cyl16', 0, 1.15, z0 - 0.03, 0.66, 0.04, 1.16, fr, H);
    k.P('metal', O, 'disc', 0, 1.15, z0 - 0.008, 0.6, 1, 1.08, fl(p, 'dark') ? '#1a1620' : '#c4d2da', H);
    k.P(bin, O, 'torus', 0, 1.15, z0 - 0.01, 0.6, 0.35, 1.0, fr, H);
    k.S(bin, O, 0, 1.77, z0 - 0.01, 0.05, fr);
  },
  harpsichord: (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#6b4428'), inn = c('inner', '#d9b46a'), open = fl(p, 'open'), y0 = 0.52, hh = 0.26;
    // keyboard at the bottom edge (+z); the case narrows toward the top edge along the straight left side
    for (const [x, z, ww, dd] of [[0.01, 0.17, 1.5, 0.66], [-0.32, -0.42, 0.84, 0.52], [-0.52, -0.8, 0.44, 0.26]]) {
      k.B('wood', O, x, y0, z, ww, hh, dd, wd);
      if (open) k.P('deco', O, 'flat', x, y0 + hh + 0.003, z, ww - 0.06, 1, dd - 0.06, inn);
    }
    k.B('wood', O, 0.01, y0 + 0.1, 0.56, 1.3, 0.1, 0.14, wd);
    k.B('lit', O, 0.01, y0 + 0.2, 0.57, 1.2, 0.025, 0.11, '#efe8d8');
    k.B('deco', O, 0.01, y0 + 0.225, 0.54, 1.2, 0.012, 0.05, '#1e1a16');
    for (const [x, z] of [[-0.68, 0.44], [0.7, 0.44], [-0.68, -0.85], [0.05, -0.62]]) k.C('wood', O, x, 0, z, 0.035, y0, dk(wd, 0.85), 'cyl6');
    if (open) {
      k.P('wood', O, 'box', -0.47, 1.2, -0.25, 1.0, 0.025, 1.25, wd, 0, 0, 1.0);
      k.Beam('wood', O, [0.05, 0.79, -0.3], [-0.31, 1.44, -0.3], 0.012, dk(wd, 0.8));
    }
    k.B('wood', O, 0.01, 0, 0.88, 0.7, 0.45, 0.22, dk(wd, 0.9));
  },
  'tavern-sign': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#9a6a3a'), pt = c('paint', '#c99a2e'), bg = c('bg', '#2f4f3a'), em = fl(p, 'emblem'), ir = '#4e5257';
    k.Beam('metal', O, [-0.44, 2.0, 0.08], [0.44, 2.0, 0.08], 0.02, ir);
    for (const s of [-1, 1]) {
      k.Beam('metal', O, [s * 0.4, 2.0, -0.07], [s * 0.4, 2.0, 0.08], 0.018, ir);
      k.Beam('metal', O, [s * 0.24, 2.0, 0.08], [s * 0.24, 1.86, 0.08], 0.008, ir);
    }
    k.B('wood', O, 0, 1.3, 0.08, 0.72, 0.56, 0.05, wd);
    for (const f of [1, -1]) {
      const z = 0.08 + f * 0.027, ze = 0.08 + f * 0.031;
      k.B('deco', O, 0, 1.36, z, 0.6, 0.44, 0.004, bg);
      if (em === 1) {
        vdisc(k, 'deco', O, -0.08, 1.58, ze, 0.2, 0.2, pt, f);
        vdisc(k, 'deco', O, 0.13, 1.68, ze, 0.07, 0.07, pt, f);
      } else if (em === 2) for (const g of [-1, 1]) k.P('deco', O, 'box', 0, 1.58, ze, 0.04, 0.36, 0.006, pt, 0, 0, g * 0.7);
      else if (em === 3) {
        k.P('deco', O, 'ring', -0.12, 1.58, ze, 0.14, 0.1, 0.14, pt, H);
        k.B('deco', O, 0.06, 1.565, ze, 0.26, 0.03, 0.006, pt);
      } else {
        k.B('deco', O, -0.03, 1.44, ze, 0.16, 0.24, 0.006, pt);
        k.B('deco', O, 0.09, 1.5, ze, 0.05, 0.12, 0.006, pt);
      }
    }
  },
  dartboard: (k, O, w, d, R, c) => {
    const a = c('a', '#2b2b30'), b = c('b', '#e6dcc6'), r1 = c('ring1', '#a3312c'), r2 = c('ring2', '#3e6b3a'), y = 1.6, z = -0.06;
    k.P('wood', O, 'cyl16', 0, y, z, 0.48, 0.04, 0.48, '#4a3426', H);
    const L: [number, string][] = [[0.44, r1], [0.4, a], [0.3, b], [0.26, r2], [0.16, a], [0.06, r1]];
    L.forEach(([dd, col], i) => vdisc(k, 'deco', O, 0, y, z + 0.021 + i * 0.002, dd, dd, col));
    for (const [x, yy] of [[0.05, 0.04], [-0.09, -0.06]]) {
      k.Beam('wood', O, [x, y + yy, -0.03], [x + 0.02, y + yy + 0.02, 0.08], 0.006, '#3a2a20');
      k.S('fabric', O, x + 0.02, y + yy + 0.02, 0.08, 0.018, r1);
    }
  },
  'notice-board': (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a6a3a'), rf = c('roof', '#5a3d2a');
    for (const s of [-1, 1]) k.B('wood', O, s * 0.82, 0, 0, 0.1, 2.0, 0.1, wd);
    k.B('wood', O, 0, 0.85, 0, 1.55, 0.95, 0.05, wd);
    k.B('wood', O, 0, 1.93, 0.1, 1.85, 0.04, 0.38, rf, 0.3, 0, 0);
    for (let i = 0; i < 5; i++)
      k.B('fabric', O, -0.6 + i * 0.3 + (R() - 0.5) * 0.08, 1.0 + R() * 0.45, 0.027, 0.2, 0.26, 0.006, i % 3 ? '#efe6cf' : '#e0d2a8', 0, 0, (R() - 0.5) * 0.2);
  },
  scales: (k, O, w, d, R, c) => {
    const m = c('metal', '#c9a24a');
    k.C('metal', O, 0, 0, 0, 0.17, 0.05, m, 'cyl16');
    k.C('metal', O, 0, 0.05, 0, 0.03, 1.0, m, 'cyl6');
    k.S('metal', O, 0, 1.1, 0, 0.045, m);
    k.Beam('metal', O, [-0.38, 1.07, 0], [0.38, 1.01, 0], 0.018, m);
    for (const [s, yy] of [[-1, 1.07], [1, 1.01]]) {
      const py = yy - 0.42;
      k.P('metal', O, 'hemi', s * 0.38, py, 0, 0.3, 0.12, 0.3, m, Math.PI);
      for (let i = 0; i < 3; i++) k.Beam('metal', O, [s * 0.38, yy, 0], [s * 0.38 + Math.cos(i * 2.09) * 0.14, py, Math.sin(i * 2.09) * 0.14], 0.004, m);
    }
  },
  'banner-pole': (k, O, w, d, R, c) => {
    const cl = c('cloth', '#a3312c'), em = c('emblem', '#c99a2e');
    k.C('lit', O, 0, 0, 0, 0.18, 0.12, '#6e675e', 'cyl16');
    k.C('wood', O, 0, 0, 0, 0.035, 2.3, DARKWOOD, 'cyl6');
    k.Beam('wood', O, [-0.34, 2.15, 0.04], [0.34, 2.15, 0.04], 0.02, DARKWOOD);
    k.S('metal', O, 0, 2.33, 0, 0.05, GOLD);
    k.B('fabric', O, 0, 1.15, 0.05, 0.62, 1.0, 0.02, cl);
    for (const s of [-1, 1]) k.P('fabric', O, 'pyr', s * 0.155, 1.05, 0.05, 0.31, 0.2, 0.02, cl, 0, 0, Math.PI);
    for (const f of [-1, 1]) k.B('deco', O, 0, 1.44, 0.05 + f * 0.012, 0.22, 0.22, 0.004, em, 0, 0, Math.PI / 4);
  },
  'archery-target': (k, O, w, d, R, c) => {
    const a = c('a', '#efe6d2'), b = c('b', '#2f5d8a'), rg = c('ring', '#a3312c'), md = c('mid', '#e9b949');
    const t = 0.22, th = H - t, ny = Math.cos(th), nz = Math.sin(th), uy = Math.cos(t), uz = -Math.sin(t), cy = 0.95;
    k.P('fabric', O, 'cyl16', 0, cy, 0, 0.84, 0.14, 0.84, '#c9b07a', th);
    ([[0.8, a], [0.6, b], [0.4, rg], [0.18, md]] as [number, string][]).forEach(([dd, col], i) => {
      const o = 0.071 + i * 0.002;
      k.P('deco', O, 'disc', 0, cy + ny * o, nz * o, dd, 1, dd, col, th);
    });
    for (const s of [-1, 1]) k.Beam('wood', O, [s * 0.44, 0, 0.15], [s * 0.4, 1.2, -0.05], 0.025, DARKWOOD);
    k.Beam('wood', O, [0, 0, -0.5], [0, 1.25, -0.1], 0.025, DARKWOOD);
    for (let i = 0; i < 2; i++) {
      const x = (R() - 0.5) * 0.3, v = (R() - 0.5) * 0.3, py = cy + v * uy + ny * 0.07, pz = v * uz + nz * 0.07;
      k.Beam('wood', O, [x, py, pz], [x + 0.03, py + ny * 0.35, pz + nz * 0.35], 0.008, '#8a6a48');
      k.S('fabric', O, x + 0.03, py + ny * 0.35, pz + nz * 0.35, 0.02, '#efe6d2');
    }
  },
  'rope-coil': (k, O, w, d, R, c) => {
    const r = c('rope', '#c9a86a');
    k.P('fabric', O, 'torus', 0, 0.045, 0, 0.62, 0.38, 0.62, r);
    k.P('fabric', O, 'torus', 0.01, 0.1, 0.01, 0.54, 0.38, 0.54, r);
    k.P('fabric', O, 'torus', 0, 0.155, 0, 0.46, 0.38, 0.46, r);
    k.Beam('fabric', O, [0.27, 0.03, 0.05], [0.42, 0.02, 0.32], 0.03, r, 'cyl6');
  },
  'fishing-net': (k, O, w, d, R, c) => {
    const r = c('rope', '#b8a882'), fc = c('float', '#d9822b'), S = at(O, 0, 0, R() * 0.3 - 0.15);
    for (let i = 0; i < 6; i++) {
      const t = -0.75 + i * 0.3;
      k.P('deco', S, 'flat', t, 0.007, 0, 0.025, 1, 1.6, r);
      k.P('deco', S, 'flat', 0, 0.009, t, 1.6, 1, 0.025, r);
      k.P('fabric', S, 'sph', t, 0.03, -0.82, 0.1, 0.06, 0.1, fc);
    }
  },
  'fishing-gear': (k, O, w, d, R, c, p) => {
    const wk = c('wicker', '#b8925a'), fi = c('fish', '#a9b8c2');
    k.B('fabric', O, -0.18, 0, -0.1, 0.38, 0.3, 0.26, wk);
    k.B('fabric', O, -0.18, 0.3, -0.1, 0.4, 0.04, 0.28, dk(wk, 0.8));
    k.Beam('wood', O, [-0.45, 0.03, 0.4], [0.44, 0.06, -0.42], 0.015, DARKWOOD);
    k.P('metal', O, 'cyl16', -0.33, 0.06, 0.29, 0.07, 0.03, 0.07, IRON, 0, 0, H);
    if (fl(p, 'fish'))
      for (let i = 0; i < 3; i++) {
        const x = 0.1 + i * 0.11, z = 0.15 + (R() - 0.5) * 0.15, a = R() * 0.8 - 0.4;
        k.P('lit', O, 'sph', x, 0.04, z, 0.08, 0.06, 0.24, fi, 0, a, 0);
        k.P('lit', O, 'box', x + Math.sin(a) * 0.14, 0.04, z + Math.cos(a) * 0.14, 0.09, 0.015, 0.06, fi, 0, a, 0);
      }
  },
  scarecrow: (k, O, w, d, R, c, p) => {
    const cl = c('cloth', '#6b5a8a'), ht = c('hat', '#5a4a32'), straw = '#d6b25e';
    k.C('wood', O, 0, 0, 0, 0.035, 1.75, DARKWOOD, 'cyl6');
    k.Beam('wood', O, [-0.48, 1.35, 0], [0.48, 1.35, 0], 0.025, DARKWOOD);
    k.B('fabric', O, 0, 0.8, 0, 0.38, 0.62, 0.22, cl);
    k.P('fabric', O, 'cone', 0, 0.72, 0, 0.18, 0.16, 0.12, straw, Math.PI);
    for (const s of [-1, 1]) {
      k.P('fabric', O, 'cyl6', s * 0.26, 1.35, 0, 0.12, 0.38, 0.12, cl, 0, 0, H);
      k.P('fabric', O, 'cone', s * 0.48, 1.35, 0, 0.1, 0.1, 0.1, straw, 0, 0, -s * H);
    }
    k.S('fabric', O, 0, 1.6, 0, 0.13, '#d6c7a4');
    k.C('fabric', O, 0, 1.7, 0, 0.2, 0.02, ht, 'cyl16');
    k.P('fabric', O, 'cone', 0, 1.84, 0, 0.22, 0.26, 0.22, ht, 0.15, 0, 0.1);
    if (fl(p, 'crow')) {
      k.P('lit', O, 'sph', 0.38, 1.43, 0, 0.1, 0.09, 0.16, '#1b1b1e');
      k.S('lit', O, 0.38, 1.5, 0.07, 0.04, '#1b1b1e');
      k.P('lit', O, 'cone', 0.38, 1.5, 0.12, 0.02, 0.05, 0.02, '#c9a24a', H);
    }
  },
  beehive: (k, O, w, d, R, c, p) => {
    const hv = c('hive', '#d6b25e'), wd = c('wood', '#9a744a');
    k.B('wood', O, 0, 0.38, 0, 0.9, 0.05, 0.42, wd);
    for (const s of [-1, 1]) k.B('wood', O, s * 0.36, 0, 0, 0.06, 0.38, 0.38, dk(wd, 0.85));
    for (const s of [-1, 1]) {
      const x = s * 0.22;
      if (fl(p, 'box')) {
        k.B('wood', O, x, 0.43, 0, 0.32, 0.38, 0.32, hv);
        k.B('wood', O, x, 0.81, 0, 0.38, 0.05, 0.38, wd);
        k.B('deco', O, x, 0.45, 0.161, 0.12, 0.03, 0.004, DARK);
      } else {
        k.P('fabric', O, 'hemi', x, 0.43, 0, 0.36, 0.84, 0.36, hv);
        k.Ring('fabric', O, x, 0.52, 0, 0.178, 0.03, dk(hv, 0.8));
        k.Ring('fabric', O, x, 0.66, 0, 0.15, 0.03, dk(hv, 0.8));
        vdisc(k, 'deco', O, x, 0.48, 0.172, 0.07, 0.05, DARK);
      }
    }
    if (fl(p, 'swarm')) for (let i = 0; i < 6; i++) k.S('deco', O, (R() - 0.5) * 0.7, 0.9 + R() * 0.5, (R() - 0.5) * 0.6, 0.025, '#2a2014');
  },
  'bones-mud': (k, O, w, d, R, c) => {
    const mud = c('mud', '#5b4632'), bone = c('bone', '#e3dac4');
    if (/^#/.test(mud)) {
      k.P('deco', O, 'disc', 0, 0.006, 0, 0.85, 1, 0.7, mud, 0, R() * 3, 0);
      k.P('deco', O, 'disc', 0.2, 0.008, -0.15, 0.4, 1, 0.3, dk(mud, 0.85));
    }
    k.P('lit', O, 'sph', -0.18, 0.03, 0.08, 0.2, 0.16, 0.24, bone, 0.3, 0.5, 0);
    for (let i = 0; i < 4; i++) {
      const x = i * 0.09, m = [x + 0.03, 0.12, 0];
      k.Beam('lit', O, [x, -0.01, -0.12], m, 0.018, bone);
      k.Beam('lit', O, m, [x + 0.05, 0.02, 0.14], 0.018, bone);
    }
    k.Beam('lit', O, [-0.35, 0.02, -0.25], [-0.05, 0.03, -0.32], 0.025, bone);
  },
  'skull-bleached': (k, O, w, d, R, c) => {
    const b = c('bone', '#ece4cf');
    k.P('lit', O, 'sph', 0, 0.14, -0.08, 0.38, 0.28, 0.34, b);
    k.P('lit', O, 'box', 0, 0.09, 0.18, 0.2, 0.14, 0.34, b, 0.15);
    for (const s of [-1, 1]) {
      k.S('deco', O, s * 0.1, 0.17, 0.06, 0.05, '#2a2420');
      k.Beam('lit', O, [s * 0.14, 0.2, -0.12], [s * 0.36, 0.26, -0.2], 0.045, b);
      k.Beam('lit', O, [s * 0.36, 0.26, -0.2], [s * 0.45, 0.42, -0.05], 0.035, b);
      k.P('lit', O, 'cone', s * 0.46, 0.49, 0.0, 0.05, 0.14, 0.05, b, 0.6, 0, -s * 0.2);
    }
  },
  'giant-ribcage': (k, O, w, d, R, c) => {
    const b = c('bone', '#e3dac4');
    k.Beam('lit', O, [-1.4, 0.12, 0], [1.4, 0.16, 0.05], 0.1, b, 'cyl6');
    for (let i = 0; i < 5; i++) {
      const x = -1.05 + i * 0.52, h = 1.5 - Math.abs(i - 1.5) * 0.15;
      for (const s of [-1, 1]) {
        const m = [x, 0.85, s * 0.72];
        k.Beam('lit', O, [x, 0.15, s * 0.08], m, 0.06, b, 'cyl6');
        k.Beam('lit', O, m, [x + 0.12, h, s * 0.48], 0.045, b, 'cyl6');
      }
    }
  },
  snowman: (k, O, w, d, R, c, p) => {
    const sc = c('scarf', '#a3312c');
    k.S('lit', O, 0, 0.3, 0, 0.32, SNOW);
    k.S('lit', O, 0, 0.78, 0, 0.23, SNOW);
    k.S('lit', O, 0, 1.13, 0, 0.16, SNOW);
    k.P('lit', O, 'cone', 0, 1.13, 0.22, 0.05, 0.16, 0.05, '#e07a2a', H);
    for (const s of [-1, 1]) {
      k.S('deco', O, s * 0.06, 1.18, 0.14, 0.022, '#1b1b1e');
      k.Beam('wood', O, [s * 0.2, 0.85, 0], [s * 0.48, 1.1, 0.05], 0.018, '#4a3020');
    }
    for (const y of [0.72, 0.84]) k.S('deco', O, 0, y, 0.215, 0.022, '#1b1b1e');
    k.P('fabric', O, 'torus', 0, 0.98, 0, 0.36, 0.5, 0.36, sc);
    k.B('fabric', O, 0.1, 0.72, 0.17, 0.08, 0.26, 0.03, sc, 0.1, 0, 0.15);
    if (fl(p, 'hat')) {
      k.C('fabric', O, 0, 1.26, 0, 0.15, 0.02, '#1b1b1e', 'cyl16');
      k.C('fabric', O, 0, 1.26, 0, 0.1, 0.2, '#1b1b1e', 'cyl16');
    }
  },
};

// ---------------------------------------------------------------- structures
const STRUCT: Record<string, Model> = {
  portcullis: (k, O, w, d, R, c, p) => {
    const m = c('metal', '#6c6f73'), s = c('stone', '#8a8780'), open = fl(p, 'open'), y0 = open ? 1.95 : 0;
    k.B('lit', O, 0, 0, 0, 1.0, 0.012, 0.2, s);
    k.P('deco', O, 'flat', 0, 0.014, 0, 0.98, 1, 0.05, DARK);
    for (let i = 0; i < 5; i++) {
      const x = -0.4 + i * 0.2;
      k.B('metal', O, x, y0 + 0.1, 0, 0.05, 2.4 - y0 - 0.1, 0.05, m);
      k.P('metal', O, 'cone', x, y0 + 0.05, 0, 0.06, 0.1, 0.06, m, Math.PI);
    }
    for (const y of open ? [2.2] : [0.6, 1.3, 2.0]) k.B('metal', O, 0, y, 0, 1.0, 0.06, 0.07, m);
  },
  'prison-bars': (k, O, w, d, R, c) => {
    const m = c('metal', '#6c6f73');
    k.B('metal', O, 0, 0, 0, 1.0, 0.08, 0.1, m);
    k.B('metal', O, 0, 2.28, 0, 1.0, 0.1, 0.1, m);
    k.B('metal', O, 0, 1.2, 0, 1.0, 0.05, 0.06, m);
    for (let i = 0; i < 5; i++) k.C('metal', O, -0.4 + i * 0.2, 0.08, 0, 0.022, 2.2, m, 'cyl6');
  },
  'cell-door': (k, O, w, d, R, c, p) => {
    const m = c('metal', '#6c6f73');
    for (const s of [-1, 1]) k.B('metal', O, s * 0.47, 0, 0, 0.06, 2.3, 0.12, m);
    k.B('metal', O, 0, 2.2, 0, 1.0, 0.1, 0.12, m);
    const D = at(O, -0.43, 0, fl(p, 'open') ? -1.0 : 0);
    for (const x of [0.025, 0.835]) k.B('metal', D, x, 0, 0, 0.05, 2.1, 0.05, m);
    for (const y of [0.05, 1.0, 2.05]) k.B('metal', D, 0.43, y, 0, 0.86, 0.05, 0.05, m);
    for (let i = 0; i < 3; i++) k.C('metal', D, 0.22 + i * 0.2, 0.05, 0, 0.018, 2.0, m, 'cyl6');
    k.B('metal', D, 0.76, 0.95, 0, 0.14, 0.18, 0.09, dk(m, 0.8));
  },
  'wall-stone-low': (k, O, w, d, R, c, p) => {
    const rk = c('rock', '#8a8780'), broken = fl(p, 'broken'), L = broken ? 1.2 : 1.9, cx = broken ? -0.33 : 0, n = broken ? 3 : 5;
    k.B('stone', O, cx, 0, 0, L, 0.55, 0.5, rk);
    for (let i = 0; i < n; i++) k.P('lit', O, 'ico', cx - L / 2 + (i + 0.5) * (L / n), 0.6, (R() - 0.5) * 0.05, (L / n) * 1.05, 0.18, 0.46, dk(rk, 0.92 + R() * 0.12));
    if (broken) {
      k.B('stone', O, 0.62, 0, 0, 0.5, 0.25, 0.48, rk);
      for (let i = 0; i < 4; i++) k.S('lit', O, 0.45 + R() * 0.45, 0.1, (R() - 0.5) * 0.6, 0.1 + R() * 0.06, rk, 'ico');
    }
    if (fl(p, 'moss')) for (let i = 0; i < 3; i++) k.P('fabric', O, 'hemi', cx + (R() - 0.5) * L * 0.8, 0.66, (R() - 0.5) * 0.2, 0.3, 0.1, 0.25, c('moss', '#6d8a3a'));
  },
  'fence-wood': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#8a6a48'), br = fl(p, 'broken');
    [-0.9, 0, 0.9].forEach((x, i) => {
      k.B('wood', O, x, 0, 0, 0.1, 1.0, 0.1, wd, 0, 0, br && i === 2 ? 0.25 : 0);
      k.P('wood', O, 'pyr', x, 1.04, 0, 0.13, 0.08, 0.13, wd, 0, Math.PI / 4, br && i === 2 ? 0.25 : 0);
    });
    k.B('wood', O, 0, 0.4, 0.075, 1.95, 0.07, 0.05, wd);
    if (br) {
      k.B('wood', O, -0.45, 0.78, 0.075, 0.95, 0.07, 0.05, wd);
      k.P('wood', O, 'box', 0.5, 0.5, 0.1, 0.9, 0.07, 0.05, wd, 0, 0, 0.45);
    } else k.B('wood', O, 0, 0.78, 0.075, 1.95, 0.07, 0.05, wd);
  },
  'fence-gate': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#8a6a48'), mt = c('metal', '#6c6f73'), open = fl(p, 'open'), iron = fl(p, 'iron'), bin: Bin = iron ? 'metal' : 'wood';
    for (const s of [-1, 1]) {
      k.B(bin, O, s * 0.93, 0, 0, 0.14, 1.3, 0.14, wd);
      k.B(bin, O, s * 0.93, 1.3, 0, 0.18, 0.05, 0.18, dk(wd, 0.85));
      const D = at(O, s * 0.86, 0, s < 0 ? (open ? -0.6 : 0) : Math.PI + (open ? 0.6 : 0));
      for (const y of [0.15, 0.55, 0.95]) k.B(bin, D, 0.42, y, 0, 0.84, 0.08, 0.05, wd);
      k.B(bin, D, 0.8, 0.1, 0, 0.07, 0.98, 0.05, wd);
      if (iron) for (let i = 0; i < 3; i++) k.C('metal', D, 0.15 + i * 0.22, 0.15, 0, 0.012, 0.85, mt, 'cyl6');
      else k.Beam('wood', D, [0.05, 0.2, 0], [0.75, 0.95, 0], 0.03, wd);
      for (const y of [0.2, 0.9]) k.B('metal', D, 0.08, y, 0.03, 0.16, 0.04, 0.01, mt);
    }
    if (!open) k.B('metal', O, 0, 0.6, 0.04, 0.08, 0.08, 0.02, mt);
  },
  signpost: (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#9a7448'), n = fl(p, 'arms') || 2;
    k.S('lit', O, 0, 0.05, 0, 0.18, '#7a7066', 'ico');
    k.C('wood', O, 0, 0, 0, 0.055, 2.0, wd, 'cyl6');
    k.P('wood', O, 'pyr', 0, 2.06, 0, 0.14, 0.12, 0.14, wd);
    for (let i = 0; i < n; i++) {
      const S = at(O, 0, 0, [0.3, 2.4, 4.3][i]), y = 1.72 - i * 0.22;
      k.B('wood', S, 0.25, y, 0, 0.42, 0.13, 0.03, wd);
      k.P('wood', S, 'box', 0.46, y + 0.065, 0, 0.092, 0.092, 0.03, wd, 0, 0, Math.PI / 4);
      k.B('deco', S, 0.24, y + 0.05, 0, 0.28, 0.025, 0.034, '#2a2018');
    }
  },
  milestone: (k, O, w, d, R, c) => {
    const rk = c('rock', '#8a8780');
    k.B('lit', O, 0, 0, 0, 0.5, 0.08, 0.36, dk(rk, 0.9));
    k.B('stone', O, 0, 0.08, 0, 0.38, 0.55, 0.24, rk);
    k.P('stone', O, 'cyl16', 0, 0.63, 0, 0.38, 0.24, 0.38, rk, H);
    k.B('deco', O, 0, 0.28, 0.121, 0.22, 0.3, 0.004, dk(rk, 0.7));
  },
  'stone-circle': (k, O, w, d, R, c, p) => {
    const rk = c('rock', '#8a8780'), ruin = fl(p, 'ruin');
    k.P('deco', O, 'disc', 0, 0.006, 0, 3.6, 1, 3.6, c('grass', '#6a8a4a'));
    k.B('stone', O, 0, 0, 0, 0.95, 0.35, 0.6, rk);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.2, S = at(O, Math.cos(a) * 1.5, Math.sin(a) * 1.5, Math.atan2(-Math.cos(a), -Math.sin(a)));
      if (ruin && i % 3 === 1) k.B('stone', S, 0, 0, 0, 1.4, 0.38, 0.45, rk, 0, 0.2, 0);
      else k.B('stone', S, 0, 0, 0, 0.5, (ruin && i % 3 === 2 ? 0.9 : 1.7) + R() * 0.4, 0.32, dk(rk, 0.9 + R() * 0.15), (R() - 0.5) * 0.08, 0, (R() - 0.5) * 0.08);
    }
  },
  cairn: (k, O, w, d, R, c, p) => {
    const rk = c('rock', '#8a8780');
    for (const [n, rr, y, s] of [[5, 0.24, 0.12, 0.15], [4, 0.15, 0.3, 0.13], [2, 0.07, 0.46, 0.11], [1, 0, 0.6, 0.1]])
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + R();
        k.S('cave', O, Math.cos(a) * rr, y, Math.sin(a) * rr, s * (0.9 + R() * 0.25), dk(rk, 0.85 + R() * 0.25), 'ico');
      }
    if (fl(p, 'snow')) k.P('lit', O, 'hemi', 0, 0.6, 0, 0.3, 0.24, 0.3, SNOW);
  },
  'bridge-plank': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#9a744a'), br = fl(p, 'broken'), n = 10;
    for (const s of [-1, 1]) k.B('wood', O, s * 0.36, 0, 0, 0.1, 0.09, d * 0.98, dk(wd, 0.8));
    for (let i = 0; i < n; i++) {
      if (br && (i === 3 || i === 7)) continue;
      const t = br && i === 4 ? 0.1 : 0;
      k.B('wood', O, (R() - 0.5) * 0.03, 0.09, -d / 2 + (i + 0.5) * (d / n), 0.92, 0.04, d / n - 0.03, wd, t, (R() - 0.5) * 0.04, t * 0.8);
    }
    for (const s of [-1, 1]) for (const t of [-1, 1]) k.C('wood', O, s * 0.42, 0, t * (d / 2 - 0.08), 0.05, 0.7, dk(wd, 0.75), 'cyl6');
  },
  'bridge-rope': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#9a7a52'), rp = c('rope', ROPE), br = fl(p, 'broken'), L = d * 0.98, n = 12;
    for (let i = 0; i < n; i++) {
      if (br && (i === 4 || i === 8)) continue;
      k.B('wood', O, 0, 0.03, -L / 2 + (i + 0.5) * (L / n), 0.8 + (R() - 0.5) * 0.06, 0.035, L / n - 0.07, wd, 0, (R() - 0.5) * 0.08, 0);
    }
    for (const s of [-1, 1]) {
      for (const t of [-1, 1]) k.C('wood', O, s * 0.44, 0, t * (L / 2 - 0.04), 0.045, 1.05, dk(wd, 0.75), 'cyl6');
      k.Beam('fabric', O, [s * 0.38, 0.05, -L / 2], [s * 0.38, 0.05, L / 2], 0.015, rp, 'cyl6');
      k.Sag('fabric', O, [s * 0.44, 1.0, -L / 2 + 0.04], [s * 0.44, 1.0, L / 2 - 0.04], br && s > 0 ? 0.55 : 0.35, 0.018, rp, 5);
    }
  },
  'dock-pier': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#8a6e4c'), n = 7;
    for (const s of [-1, 1]) {
      for (const t of [-1, 1]) k.C('wood', O, s * 0.4, 0, t * (d / 2 - 0.15), 0.08, 0.42, dk(wd, 0.7), 'cyl16');
      k.B('wood', O, s * 0.3, 0.08, 0, 0.1, 0.1, d * 0.98, dk(wd, 0.8));
    }
    for (let i = 0; i < n; i++) k.B('wood', O, 0, 0.18, -d / 2 + (i + 0.5) * (d / n), 0.98, 0.05, d / n - 0.025, dk(wd, 0.93 + R() * 0.14));
    if (fl(p, 'moss')) for (let i = 0; i < 3; i++) k.P('deco', O, 'disc', (R() - 0.5) * 0.7, 0.232, (R() - 0.5) * 1.6, 0.18, 1, 0.12, '#5f7a3a');
  },
  'mooring-post': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#6e5238'), iron = wd === '#3c4044', bin: Bin = iron ? 'metal' : 'wood', ry = iron ? 0.3 : 0.55;
    if (iron) {
      k.C(bin, O, 0, 0, 0, 0.17, 0.5, wd, 'cyl16');
      k.C(bin, O, 0, 0.5, 0, 0.22, 0.08, wd, 'cyl16');
    } else {
      k.C(bin, O, 0, 0, 0, 0.16, 0.85, wd, 'cyl16');
      k.P(bin, O, 'hemi', 0, 0.85, 0, 0.32, 0.12, 0.32, wd);
    }
    if (!fl(p, 'bare')) {
      for (const y of [ry, ry + 0.07]) k.P('fabric', O, 'torus', 0, y, 0, 0.46, 0.35, 0.46, ROPE);
      k.Sag('fabric', O, [0.18, ry, 0.05], [0.45, 0.02, 0.4], 0.03, 0.02, ROPE, 4);
    }
  },
  tent: (k, O, w, d, R, c) => {
    const cv = c('canvas', '#d9cdb0'), hw = 0.85, hz = 0.88, Ht = 1.25, sl = Math.hypot(hw, Ht), ang = Math.atan2(Ht, hw);
    for (const s of [-1, 1]) {
      k.P('fabric', O, 'box', (s * hw) / 2, Ht / 2, 0, sl, 0.03, hz * 2, cv, 0, 0, -s * ang);
      k.P('fabric', O, 'pyr', 0, Ht / 2, s * hz, hw * 2, Ht, 0.02, cv);
      k.P('fabric', O, 'pyr', s * 0.42, 0.4, hz + 0.08, 0.42, 0.8, 0.02, dk(cv, 0.9), 0, s * 0.5, 0);
      k.C('wood', O, 0, 0, s * (hz + 0.08), 0.022, Ht + 0.1, DARKWOOD, 'cyl6');
      k.Beam('fabric', O, [0, Ht + 0.05, s * (hz + 0.1)], [0, 0.02, s * 0.98], 0.008, ROPE);
    }
    k.P('deco', O, 'pyr', 0, 0.4, hz + 0.012, 0.7, 0.8, 0.02, '#2a241c');
    k.Beam('wood', O, [0, Ht + 0.02, -hz - 0.1], [0, Ht + 0.02, hz + 0.1], 0.025, DARKWOOD);
  },
  'tent-round': (k, O, w, d, R, c) => {
    const cv = c('canvas', '#cbb994'), tr = c('trim', '#8a623c'), R0 = 0.88, Ht = 1.8, rAt = (y: number) => R0 * (1 - y / Ht);
    k.P('fabric', O, 'cone', 0, Ht / 2, 0, R0 * 2, Ht, R0 * 2, cv);
    k.Ring('fabric', O, 0, 0.3, 0, rAt(0.3) + 0.01, 0.06, tr);
    k.Ring('fabric', O, 0, 1.2, 0, rAt(1.2) + 0.01, 0.05, tr);
    k.P('deco', O, 'pyr', 0, 0.42, rAt(0.42) + 0.02, 0.5, 0.84, 0.02, '#2a241c', -Math.atan(R0 / Ht));
    for (let i = 0; i < 3; i++) {
      const a = i * 2.09 + 0.4;
      k.Beam('wood', O, [Math.cos(a) * 0.05, Ht - 0.25, Math.sin(a) * 0.05], [Math.cos(a) * 0.16, Ht + 0.3, Math.sin(a) * 0.16], 0.02, DARKWOOD);
    }
  },
  'tent-bell': (k, O, w, d, R, c) => {
    const cv = c('canvas', '#e6dcc4'), tr = c('trim', '#a3312c'), Rw = 1.38, Hw = 1.1, Ht = 2.6, rot = Math.PI / 8;
    k.P('fabric', O, 'tube', 0, Hw / 2, 0, Rw * 2, Hw, Rw * 2, cv, 0, rot, 0);
    k.P('fabric', O, 'cone', 0, Hw + (Ht - Hw) / 2, 0, Rw * 2 + 0.12, Ht - Hw, Rw * 2 + 0.12, cv);
    k.P('fabric', O, 'tube', 0, Hw - 0.1, 0, Rw * 2 + 0.14, 0.2, Rw * 2 + 0.14, tr, 0, rot, 0);
    k.B('deco', O, 0, 0, Rw * Math.cos(rot) + 0.01, 0.6, 0.95, 0.02, '#2a241c');
    k.C('wood', O, 0, Ht - 0.05, 0, 0.03, 0.35, DARKWOOD, 'cyl6');
    k.P('fabric', O, 'pyr', 0.13, Ht + 0.2, 0, 0.14, 0.26, 0.02, tr, 0, 0, -H);
    for (let i = 0; i < 4; i++) {
      const a = i * H + Math.PI / 4;
      k.Beam('fabric', O, [Math.cos(a) * (Rw + 0.05), Hw, Math.sin(a) * (Rw + 0.05)], [Math.cos(a) * 1.9, 0.02, Math.sin(a) * 1.9], 0.01, ROPE);
    }
  },
  'tent-command': (k, O, w, d, R, c) => {
    const cv = c('canvas', '#e6dcc4'), st = c('stripe', '#a3312c'), hw = 1.3, Hw = 1.4;
    k.B('fabric', O, 0, 0, 0, hw * 2, Hw, hw * 2, cv);
    for (const t of [-1, 1])
      for (const x of [-0.9, 0.9]) {
        k.B('fabric', O, x, 0, t * (hw + 0.004), 0.3, Hw, 0.008, st);
        k.B('fabric', O, t * (hw + 0.004), 0, x, 0.008, Hw, 0.3, st);
      }
    k.P('fabric', O, 'pyr', 0, Hw + 0.5, 0, (hw * 2.05) / 0.7071, 1.0, (hw * 2.05) / 0.7071, st, 0, Math.PI / 4, 0);
    k.B('deco', O, 0, 0, hw + 0.006, 0.7, 1.1, 0.01, '#2a241c');
    for (const s of [-1, 1]) k.B('fabric', O, s * 0.45, 0, hw + 0.03, 0.22, 1.1, 0.03, cv, 0, s * 0.4, 0);
    k.C('wood', O, 0, Hw + 0.9, 0, 0.03, 0.75, DARKWOOD, 'cyl6');
    k.B('fabric', O, 0.22, Hw + 1.35, 0, 0.42, 0.26, 0.015, c('flag', '#a3312c'));
  },
};

const STRUCT2: Record<string, Model> = {
  'lean-to': (k, O, w, d, R, c, p) => {
    const rf = c('roof', '#6f6a3a'), wd = c('wood', '#6b4428'), bd = c('bed', '#7a5638');
    const zf = 0.6, zb = -0.88, Ht = 1.4, dz = zf - zb, L = Math.hypot(dz, Ht), th = -Math.atan2(Ht, dz), nY = dz / L, nZ = -Ht / L;
    for (const s of [-1, 1]) k.Beam('wood', O, [s * 0.82, 0, zf], [s * 0.8, Ht + 0.12, zf], 0.04, wd);
    k.Beam('wood', O, [-0.95, Ht, zf], [0.95, Ht, zf], 0.04, wd);
    k.P('fabric', O, 'box', 0, Ht / 2, (zf + zb) / 2, 1.8, 0.05, L, rf, th);
    if (!fl(p, 'hide'))
      for (let i = 0; i < 4; i++) {
        const x = -0.7 + i * 0.47, o = 0.045;
        k.Beam('wood', O, [x, nY * o, zb + nZ * o], [x + 0.05, Ht + nY * o, zf + nZ * o], 0.025, dk(wd, 0.9));
      }
    if (fl(p, 'snow')) k.P('lit', O, 'box', 0, Ht / 2 + nY * 0.05, (zf + zb) / 2 + nZ * 0.05, 1.85, 0.04, L * 0.95, SNOW, th);
    k.B('fabric', O, 0, 0, 0, 1.2, 0.08, 0.5, bd);
    k.P('fabric', O, 'cyl16', -0.55, 0.1, 0, 0.18, 0.5, 0.18, dk(bd, 1.2), H);
  },
  'hitching-post': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#7a5638');
    for (const s of [-1, 1]) k.C('wood', O, s * 0.8, 0, 0, 0.07, 1.0, wd, 'cyl6');
    k.Beam('wood', O, [-0.92, 0.92, 0], [0.92, 0.92, 0], 0.055, wd);
    if (fl(p, 'rope')) {
      k.P('fabric', O, 'torus', 0.3, 0.92, 0, 0.16, 0.6, 0.16, ROPE, 0, 0, H);
      k.Sag('fabric', O, [0.3, 0.86, 0.05], [0.42, 0.25, 0.3], 0.05, 0.015, ROPE, 4);
    }
  },
  'horse-trough': (k, O, w, d, R, c, p) => trough(k, O, w, d, c('wood', '#7a5638'), c('water', '#4f7f95'), !!fl(p, 'stone'), false),
  'chicken-coop': (k, O, w, d, R, c) => {
    const rf = c('roof', '#8e4a32'), wd = c('wood', '#9a744a'), hx = -0.5;
    for (const t of [-1, 1]) k.B('wood', O, hx, 0, t * 0.3, 0.85, 0.18, 0.08, DARKWOOD);
    k.B('wood', O, hx, 0.18, 0, 0.85, 0.55, 0.75, wd);
    for (const t of [-1, 1]) {
      k.P('wood', O, 'box', hx, 0.84, t * 0.225, 0.95, 0.035, 0.56, rf, t * 0.556);
      k.P('wood', O, 'pyr', hx + t * 0.42, 0.855, 0, 0.02, 0.25, 0.75, wd);
    }
    k.B('deco', O, hx + 0.427, 0.2, 0.1, 0.01, 0.28, 0.2, '#2a1e14');
    k.P('wood', O, 'box', hx + 0.615, 0.1, 0.1, 0.42, 0.03, 0.18, DARKWOOD, 0, 0, -0.495);
    for (const [x, z] of [[0, -0.4], [0.95, -0.4], [0.95, 0.4], [0, 0.4]]) k.C('wood', O, x, 0, z, 0.025, 0.55, DARKWOOD, 'cyl6');
    for (const t of [-1, 1]) k.Beam('wood', O, [0, 0.55, t * 0.4], [0.95, 0.55, t * 0.4], 0.02, DARKWOOD);
    k.Beam('wood', O, [0.95, 0.55, -0.4], [0.95, 0.55, 0.4], 0.02, DARKWOOD);
    for (let i = 0; i < 3; i++) {
      const x = 0.25 + R() * 0.55, z = (R() - 0.5) * 0.55, a = R() * TAU, hx2 = x + Math.sin(a) * 0.09, hz = z + Math.cos(a) * 0.09;
      k.P('fabric', O, 'sph', x, 0.11, z, 0.16, 0.14, 0.2, '#f2ece0', 0, a, 0);
      k.S('fabric', O, hx2, 0.2, hz, 0.045, '#f2ece0');
      k.S('deco', O, hx2, 0.245, hz, 0.02, '#c0392b');
    }
  },
  'mine-rails': (k, O, w, d, R, c, p) => {
    const mt = c('metal', '#7a7e83'), wd = c('wood', '#6b4a2e'), kind = fl(p, 'kind');
    const straight = (S: Spot, ties = true) => {
      if (ties) for (let i = 0; i < 4; i++) k.B('wood', S, 0, 0, -0.375 + i * 0.25, 0.8, 0.05, 0.13, wd);
      for (const s of [-1, 1]) k.B('metal', S, s * 0.22, 0.05, 0, 0.045, 0.05, 1.0, mt);
    };
    if (kind === 1) {
      // curve joining the bottom edge to the right edge, around the bottom-right corner
      for (let i = 0; i < 3; i++) {
        const t = Math.PI + ((i + 0.5) / 3) * H;
        k.B('wood', at(O, 0.5 + Math.cos(t) * 0.5, 0.5 + Math.sin(t) * 0.5, -t), 0, 0, 0, 0.8, 0.05, 0.13, wd);
      }
      for (const r of [0.28, 0.72])
        for (let i = 0; i < 4; i++) {
          const t0 = Math.PI + (i / 4) * H, t1 = Math.PI + ((i + 1) / 4) * H;
          k.Beam('metal', O, [0.5 + Math.cos(t0) * r, 0.075, 0.5 + Math.sin(t0) * r], [0.5 + Math.cos(t1) * r, 0.075, 0.5 + Math.sin(t1) * r], 0.025, mt, 'box');
        }
      return;
    }
    straight(O);
    if (kind === 2) {
      k.B('wood', O, 0, 0, -0.42, 0.7, 0.3, 0.12, wd);
      for (const s of [-1, 1]) k.B('wood', O, s * 0.3, 0, -0.33, 0.08, 0.22, 0.08, dk(wd, 0.85));
      k.B('metal', O, 0, 0.12, -0.355, 0.5, 0.08, 0.01, mt);
    }
    if (kind === 3) straight(at(O, 0, 0, H), false);
  },
  igloo: (k, O, w, d, R, c) => {
    const sn = c('snow', SNOW), Rr = 0.8, Hh = 1.0, zc = -0.1;
    k.P('lit', O, 'hemi', 0, 0, zc, Rr * 2, Hh * 2, Rr * 2, sn);
    for (const y of [0.35, 0.7]) k.Ring('deco', O, 0, y, zc, Rr * Math.sqrt(1 - (y / Hh) ** 2) + 0.004, 0.02, dk(sn, 0.85));
    k.P('lit', O, 'cyl16', 0, 0, 0.72, 0.62, 0.5, 0.62, sn, H);
    k.P('deco', O, 'disc', 0, 0, 0.975, 0.42, 1, 0.42, '#1e2228', H);
  },
};

// ---------------------------------------------------------------- furniture
const FURN: Record<string, Model> = {
  stocks: (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a6a3a'), mt = c('metal', '#6c6f73');
    k.B('wood', O, 0, 0, 0, 1.6, 0.1, 0.35, dk(wd, 0.85));
    for (const s of [-1, 1]) {
      k.B('wood', O, s * 0.72, 0.1, 0, 0.12, 0.95, 0.14, wd);
      k.B('metal', O, s * 0.6, 0.72, 0, 0.05, 0.26, 0.13, mt);
    }
    k.B('wood', O, 0, 0.71, 0, 1.3, 0.14, 0.12, wd);
    k.B('wood', O, 0, 0.855, 0, 1.3, 0.14, 0.12, wd);
    k.B('wood', O, 0, 1.0, 0, 1.6, 0.06, 0.18, dk(wd, 0.9));
    for (const x of [-0.35, 0, 0.35]) for (const f of [1, -1]) vdisc(k, 'deco', O, x, 0.85, f * 0.062, x ? 0.09 : 0.16, x ? 0.09 : 0.16, DARK, f);
  },
  pillory: (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a6a3a');
    k.B('wood', O, 0, 0, 0, 0.9, 0.18, 0.9, dk(wd, 0.85));
    k.B('wood', O, 0, 0.18, -0.15, 0.12, 1.55, 0.12, wd);
    k.B('wood', O, 0, 1.18, -0.07, 0.85, 0.14, 0.08, wd);
    k.B('wood', O, 0, 1.33, -0.07, 0.85, 0.14, 0.08, wd);
    k.B('wood', O, 0, 1.73, -0.15, 0.3, 0.05, 0.16, dk(wd, 0.9));
    for (const x of [-0.27, 0, 0.27]) {
      vdisc(k, 'deco', O, x, 1.325, -0.028, x ? 0.08 : 0.15, x ? 0.08 : 0.15, DARK, 1);
      vdisc(k, 'deco', O, x, 1.325, -0.112, x ? 0.08 : 0.15, x ? 0.08 : 0.15, DARK, -1);
    }
  },
  'torture-rack': (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a6a3a'), rp = c('rope', '#c8b07a'), L = d * 0.9, ez = L / 2 - 0.1;
    for (const s of [-1, 1]) {
      k.B('wood', O, s * 0.34, 0.5, 0, 0.1, 0.12, L, wd);
      for (const t of [-1, 1]) {
        k.B('wood', O, s * 0.34, 0, t * (L / 2 - 0.08), 0.1, 0.5, 0.1, dk(wd, 0.85));
        k.Beam('fabric', O, [s * 0.12, 0.7, t * ez], [s * 0.1, 0.62, t * 0.45], 0.012, rp);
      }
    }
    for (let i = 0; i < 3; i++) k.B('wood', O, 0, 0.56, -0.45 + i * 0.45, 0.6, 0.05, 0.16, wd);
    for (const t of [-1, 1]) {
      k.P('wood', O, 'cyl16', 0, 0.68, t * ez, 0.14, 0.86, 0.14, wd, 0, 0, H);
      k.Beam('wood', O, [0.46, 0.5, t * ez], [0.46, 0.86, t * ez], 0.02, dk(wd, 0.8));
      k.Beam('wood', O, [0.46, 0.68, t * ez - 0.18], [0.46, 0.68, t * ez + 0.18], 0.02, dk(wd, 0.8));
    }
  },
  'pipe-organ': (k, O, w, d, R, c) => {
    const wd = c('wood', '#6b4428'), mt = c('metal', '#c9ced3');
    k.B('wood', O, 0, 0, -0.33, 2.8, 2.15, 0.34, wd);
    k.B('wood', O, 0, 2.15, -0.31, 2.95, 0.12, 0.4, dk(wd, 0.85));
    k.B('wood', O, 0, 0.95, -0.12, 2.6, 0.06, 0.1, dk(wd, 0.85));
    for (let i = 0; i < 9; i++) k.C('metal', O, -1.2 + i * 0.3, 1.0, -0.1, 0.065, 0.6 + (1 - Math.abs(i - 4) / 4) * 0.5, mt, 'cyl');
    k.B('wood', O, 0, 0, 0.12, 1.2, 0.78, 0.36, wd);
    k.B('wood', O, 0, 0.78, 0.0, 1.2, 0.2, 0.12, dk(wd, 0.9));
    k.B('lit', O, 0, 0.78, 0.2, 1.0, 0.03, 0.14, '#efe8d8');
    k.B('wood', O, 0, 0, 0.42, 1.0, 0.45, 0.16, dk(wd, 0.9));
  },
  'market-stall': (k, O, w, d, R, c) => {
    const c1 = c('cloth', '#a3312c'), c2 = c('cloth2', '#efe6d2'), wd = c('wood', '#c4955a'), gd = c('goods', '#c0392b');
    const zf = 0.86, zb = -0.86, yf = 1.9, yb = 2.15, L = Math.hypot(zf - zb + 0.2, yb - yf), th = Math.atan2(yb - yf, zf - zb + 0.2);
    for (const s of [-1, 1]) {
      k.C('wood', O, s * 0.88, 0, zf, 0.04, yf, wd, 'cyl6');
      k.C('wood', O, s * 0.88, 0, zb, 0.04, yb, wd, 'cyl6');
    }
    k.B('wood', O, 0, 0, 0.55, 1.8, 0.85, 0.5, wd);
    k.B('wood', O, 0, 0.85, 0.55, 1.86, 0.05, 0.56, dk(wd, 0.85));
    for (let i = 0; i < 6; i++) k.P('fabric', O, 'box', -0.9 + (i + 0.5) * 0.3, (yf + yb) / 2 + 0.03, 0, 0.3, 0.03, L, i % 2 ? c2 : c1, th);
    k.B('fabric', O, 0, yf - 0.17, zf + 0.1, 1.8, 0.16, 0.02, c1);
    for (let i = 0; i < 6; i++) {
      const x = -0.7 + i * 0.28;
      if (i % 2) k.S('fabric', O, x, 0.98, 0.55, 0.09, gd, 'ico');
      else k.B('wood', O, x, 0.9, 0.55, 0.2, 0.12, 0.25, dk(wd, 0.8));
    }
  },
  'bed-four-poster': (k, O, w, d, R, c) => {
    const wd = c('wood', '#6b4428'), bl = c('blanket', '#a3312c'), dr = c('drape', '#c99a2e'), hw = w * 0.43, hd = d * 0.46;
    k.B('wood', O, 0, 0, 0, hw * 2 - 0.06, 0.42, hd * 2 - 0.04, wd);
    k.B('fabric', O, 0, 0.42, 0.03, hw * 2 - 0.14, 0.14, hd * 2 - 0.16, '#e8e0cf');
    k.B('fabric', O, 0, 0.55, 0.22, hw * 2 - 0.1, 0.06, hd * 1.3, bl);
    for (const s of [-1, 1]) k.B('fabric', O, s * 0.38, 0.56, -hd + 0.3, 0.6, 0.12, 0.3, '#f2ece0');
    k.B('wood', O, 0, 0.3, -hd, hw * 2, 0.95, 0.07, wd);
    k.B('wood', O, 0, 0.3, hd, hw * 2, 0.45, 0.07, wd);
    for (const s of [-1, 1])
      for (const t of [-1, 1]) {
        k.C('wood', O, s * hw, 0, t * hd, 0.05, 2.05, dk(wd, 0.9), 'cyl6');
        k.C('fabric', O, s * (hw - 0.1), 0.6, t * (hd - 0.04), 0.06, 1.45, dr, 'cyl6');
      }
  },
  'bunk-bed': (k, O, w, d, R, c) => {
    const wd = c('wood', '#c4955a'), bl = c('blanket', '#8a7a5e'), hw = 0.42, hd = 0.92;
    for (const s of [-1, 1]) for (const t of [-1, 1]) k.B('wood', O, s * hw, 0, t * hd, 0.07, 1.75, 0.07, wd);
    for (const y of [0.25, 1.15]) {
      k.B('wood', O, 0, y, 0, hw * 2, 0.08, hd * 2, dk(wd, 0.85));
      k.B('fabric', O, 0, y + 0.08, 0, hw * 2 - 0.08, 0.1, hd * 2 - 0.1, '#d8ccb0');
      k.B('fabric', O, 0, y + 0.18, 0.2, hw * 2 - 0.06, 0.04, hd * 1.3, bl);
      k.B('fabric', O, 0, y + 0.18, -hd + 0.2, 0.5, 0.08, 0.22, '#efe8da');
    }
    k.B('wood', O, hw, 1.42, -0.2, 0.05, 0.08, hd * 1.2, wd);
    for (let i = 0; i < 3; i++) k.B('wood', O, 0, 0.5 + i * 0.3, hd, hw * 2, 0.04, 0.04, wd);
  },
  crib: (k, O, w, d, R, c) => {
    const wd = c('wood', '#c4955a'), bl = c('blanket', '#9bb7d4'), hw = 0.38, hd = 0.26, top = 0.9, y0 = 0.3;
    for (const s of [-1, 1]) for (const t of [-1, 1]) k.B('wood', O, s * hw, 0, t * hd, 0.05, top + 0.05, 0.05, wd);
    k.B('wood', O, 0, y0, 0, hw * 2, 0.05, hd * 2, wd);
    k.B('fabric', O, 0, y0 + 0.05, 0, hw * 2 - 0.05, 0.07, hd * 2 - 0.05, '#efe8da');
    k.B('fabric', O, 0.08, y0 + 0.12, 0, hw * 1.3, 0.04, hd * 2 - 0.07, bl);
    for (const t of [-1, 1]) {
      k.B('wood', O, 0, top - 0.04, t * hd, hw * 2, 0.04, 0.035, wd);
      k.B('wood', O, t * hw, top - 0.04, 0, 0.035, 0.04, hd * 2, wd);
      for (let i = 0; i < 4; i++) k.C('wood', O, -0.27 + i * 0.18, y0, t * hd, 0.012, top - 0.04 - y0, wd, 'cyl6');
    }
  },
  hammock: (k, O, w, d, R, c, p) => {
    const cl = c('cloth', '#d6c7a3'), Lz = 0.9;
    for (const t of [-1, 1]) {
      k.C('wood', O, 0, 0, t * Lz, 0.06, 1.35, DARKWOOD, 'cyl6');
      k.Beam('fabric', O, [0, 1.25, t * Lz], [0, 0.85, t * 0.58], 0.012, ROPE);
      k.Beam('wood', O, [-0.3, 0.85, t * 0.58], [0.3, 0.85, t * 0.58], 0.018, DARKWOOD);
    }
    sheet(k, O, -0.58, 0.58, 0.85, 0.3, 0.62, fl(p, 'stripe') ? [cl, '#efe6d2'] : [cl]);
  },
  'table-cards': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#9a6a3a'), felt = fl(p, 'felt'), y = felt ? 0.774 : 0.772;
    k.C('wood', O, 0, 0.72, 0, 0.42, 0.05, wd, 'cyl16');
    k.C('wood', O, 0, 0, 0, 0.06, 0.72, dk(wd, 0.8), 'cyl6');
    k.C('wood', O, 0, 0, 0, 0.22, 0.05, dk(wd, 0.8), 'cyl16');
    if (felt) k.P('fabric', O, 'disc', 0, 0.772, 0, 0.72, 1, 0.72, c('felt', '#2f5a3a'));
    for (let i = 0; i < 4; i++) {
      const a = R() * TAU, r = 0.12 + R() * 0.18;
      k.B('deco', O, Math.cos(a) * r, y + 0.002 * i, Math.sin(a) * r, 0.07, 0.004, 0.1, i % 2 ? '#efe8da' : '#e8dcc4', 0, R() * 3, 0);
    }
    for (const s of [-1, 1]) k.C('metal', O, s * 0.15, 0.77, -0.05 * s, 0.03, 0.03 + R() * 0.03, GOLD, 'cyl16');
  },
  'table-maps': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#6b4428'), pp = c('paper', '#e4d3a8'), sea = fl(p, 'sea');
    legsTable(k, O, w * 0.92, d * 0.8, 0.8, wd);
    k.P('fabric', O, 'flat', 0, 0.803, 0, 1.15, 1, 0.6, pp, 0, 0.05, 0);
    for (let i = 0; i < 3; i++) k.P('deco', O, 'disc', (R() - 0.5) * 0.8, 0.805, (R() - 0.5) * 0.3, 0.3, 1, 0.18, sea ? '#7fa6b8' : '#b8a878');
    for (const s of [-1, 1]) k.Beam('fabric', O, [s * 0.62, 0.83, -0.35], [s * 0.7, 0.83, 0.25], 0.03, pp, 'cyl16');
    ['#a3312c', '#2f5d8a', '#3e6b3a'].forEach((col) => k.P('deco', O, 'pyr', (R() - 0.5) * 0.8, 0.83, (R() - 0.5) * 0.4, 0.05, 0.06, 0.05, col));
  },
  washbasin: (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a6a3a'), bw = c('bowl', '#e3ddd0'), bb: Bin = bw === '#e3ddd0' ? 'lit' : 'metal';
    k.B('wood', O, 0, 0.72, 0, 0.6, 0.05, 0.45, wd);
    for (const s of [-1, 1]) for (const t of [-1, 1]) k.B('wood', O, s * 0.25, 0, t * 0.18, 0.04, 0.72, 0.04, dk(wd, 0.85));
    k.B('wood', O, 0, 0.18, 0, 0.5, 0.03, 0.36, dk(wd, 0.85));
    bowl(k, bb, O, 0, 0.89, 0, 0.18, 0.12, bw, '#8fb8c8');
    k.C(bb, O, 0, 0.21, 0, 0.07, 0.2, bw, 'cyl16');
    k.B('fabric', O, 0.31, 0.5, 0, 0.02, 0.26, 0.2, '#efe8da');
  },
  bathtub: (k, O, w, d, R, c, p) => {
    const tb = c('tub', '#9a6a3a'), mt = c('metal', '#6c6f73'), mf = fl(p, 'metal');
    const bin: Bin = mf ? (tb === '#b06a3a' ? 'metal' : 'lit') : 'wood', y0 = mf ? 0.12 : 0.02, H0 = 0.55;
    k.P(bin, O, 'cyl16', 0, y0 + H0 / 2, 0, 1.7, H0, 0.78, tb);
    k.P(bin, O, 'ring', 0, y0 + H0, 0, 1.72, 0.6, 0.8, tb);
    k.P('deco', O, 'disc', 0, y0 + H0 + 0.002, 0, 1.6, 1, 0.7, c('water', '#7aa6b8'));
    if (mf) for (const s of [-1, 1]) for (const t of [-1, 1]) k.S('metal', O, s * 0.62, 0.07, t * 0.22, 0.07, mt);
    else for (const y of [0.15, 0.42]) k.P('metal', O, 'ring', 0, y0 + y, 0, 1.73, 0.4, 0.8, mt);
    if (fl(p, 'bubbles')) for (let i = 0; i < 6; i++) k.P('lit', O, 'sph', (R() - 0.5) * 1.2, y0 + H0 + 0.02, (R() - 0.5) * 0.4, 0.14, 0.07, 0.14, '#f4f6f8');
  },
  privy: (k, O, w, d, R, c) => {
    const wd = c('wood', '#c4955a'), stone = wd === '#8a8780', bin: Bin = stone ? 'stone' : 'wood';
    k.B(bin, O, 0, 0, 0, 0.82, 1.9, 0.82, wd);
    k.B(bin, O, 0, 1.9, -0.02, 0.96, 0.06, 0.98, dk(wd, 0.8), -0.12);
    k.B('wood', O, 0, 0.05, 0.415, 0.56, 1.65, 0.02, stone ? '#6b4428' : dk(wd, 0.88));
    vdisc(k, 'deco', O, 0, 1.45, 0.427, 0.12, 0.12, DARK);
    k.B('metal', O, 0.2, 0.9, 0.43, 0.03, 0.08, 0.02, IRON);
  },
  'display-case': (k, O, w, d, R, c) => {
    const wd = c('wood', '#6b4428'), fr = dk(wd, 0.85);
    k.B('wood', O, 0, 0, 0, 1.8, 0.8, 0.75, wd);
    k.P('fabric', O, 'flat', 0, 0.803, 0, 1.68, 1, 0.63, c('velvet', '#5a1f2b'));
    for (const s of [-1, 1]) {
      for (const t of [-1, 1]) k.B('wood', O, s * 0.87, 0.8, t * 0.345, 0.04, 0.32, 0.04, fr);
      k.B('wood', O, 0, 1.12, s * 0.345, 1.78, 0.03, 0.04, fr);
      k.B('wood', O, s * 0.87, 1.12, 0, 0.04, 0.03, 0.73, fr);
    }
    k.S('metal', O, -0.5, 0.86, 0, 0.06, GOLD);
    k.P('deco', O, 'oct', -0.1, 0.87, 0.05, 0.08, 0.12, 0.08, '#4fb3ff');
    k.B('metal', O, 0.35, 0.805, 0, 0.4, 0.015, 0.04, '#c9ced3', 0, 0.3, 0);
    k.C('metal', O, 0.65, 0.805, -0.05, 0.08, 0.07, GOLD, 'cyl16');
  },
  'water-trough': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#9a6a3a');
    trough(k, O, w, d, wd, c('water', '#4f7a88'), wd === '#8a8780', !!fl(p, 'feed'));
  },
  'produce-stall': (k, O, w, d, R, c) => {
    const wd = c('wood', '#c4955a'), cl = c('cloth', '#3e6b3a'), T = at(O, 0, 0.45), fruit = ['#c0392b', '#e09b2d', '#8aa04a'];
    legsTable(k, T, 1.8, 0.8, 0.78, wd);
    for (let i = 0; i < 3; i++) {
      const x = -0.6 + i * 0.6;
      k.B('wood', T, x, 0.78, 0, 0.5, 0.14, 0.55, dk(wd, 0.85));
      for (let j = 0; j < 3; j++) k.S('fabric', T, x + (j - 1) * 0.13, 0.98, (R() - 0.5) * 0.25, 0.08, fruit[i], 'ico');
    }
    for (const s of [-1, 1]) {
      k.C('wood', O, s * 0.88, 0, -0.85, 0.035, 2.05, wd, 'cyl6');
      k.C('wood', O, s * 0.88, 0, 0.88, 0.035, 1.8, wd, 'cyl6');
    }
    k.P('fabric', O, 'box', 0, 1.95, 0.02, 1.84, 0.03, 1.85, cl, Math.atan2(0.25, 1.73));
    k.S('fabric', O, -0.55, 0.28, -0.55, 0.28, '#b59a6a', 'ico');
    k.S('fabric', O, 0.5, 0.25, -0.6, 0.25, '#b59a6a', 'ico');
  },
};

// ---------------------------------------------------------------- religious
const REL: Record<string, Model> = {
  font: (k, O, w, d, R, c) => {
    const st = c('stone', '#dcd8d0'), au = c('aura', '#ffe9a8');
    k.C('lit', O, 0, 0, 0, 0.32, 0.1, st, 'cyl');
    k.C('stone', O, 0, 0.1, 0, 0.11, 0.6, st, 'cyl');
    k.P('lit', O, 'cone', 0, 0.78, 0, 0.7, 0.2, 0.7, st, Math.PI);
    k.C('lit', O, 0, 0.84, 0, 0.36, 0.1, st, 'cyl');
    k.P('glow', O, 'disc', 0, 0.945, 0, 0.6, 1, 0.6, c('water', '#8fc7e8'));
    for (let i = 0; i < 4; i++) {
      const a = i * H + R();
      k.S('glow', O, Math.cos(a) * 0.2, 1.05 + R() * 0.25, Math.sin(a) * 0.2, 0.018, au);
    }
  },
  'prayer-kneeler': (k, O, w, d, R, c) => {
    const wd = c('wood', '#6b4428');
    k.B('wood', O, 0, 0, 0.18, 0.7, 0.12, 0.28, wd);
    k.B('fabric', O, 0, 0.12, 0.18, 0.64, 0.06, 0.24, c('cloth', '#a3312c'));
    for (const s of [-1, 1]) k.B('wood', O, s * 0.3, 0, -0.12, 0.06, 0.82, 0.08, wd);
    k.B('wood', O, 0, 0.3, -0.12, 0.66, 0.05, 0.06, wd);
    k.B('wood', O, 0, 0.82, -0.08, 0.72, 0.04, 0.26, wd, 0.35);
    k.B('fabric', O, 0, 0.85, -0.07, 0.3, 0.05, 0.2, '#3a2a20', 0.35);
  },
  'temple-bell': (k, O, w, d, R, c) => {
    const mt = c('metal', '#a8743c'), wd = c('wood', '#9a6a3a');
    for (const s of [-1, 1]) {
      k.B('wood', O, s * 0.42, 0, 0, 0.12, 1.9, 0.12, wd);
      k.B('wood', O, s * 0.42, 0, 0, 0.14, 0.08, 0.6, dk(wd, 0.85));
    }
    k.B('wood', O, 0, 1.85, 0, 1.0, 0.14, 0.16, wd);
    k.B('wood', O, 0, 1.58, 0, 0.16, 0.27, 0.1, dk(wd, 0.85));
    k.P('metal', O, 'hemi', 0, 1.02, 0, 0.58, 1.12, 0.58, mt);
    k.Ring('metal', O, 0, 1.03, 0, 0.3, 0.05, mt);
    k.S('metal', O, 0, 0.96, 0, 0.05, dk(mt, 0.7));
  },
  idol: (k, O, w, d, R, c) => {
    const bd = c('body', '#4f9a72'), ey = c('eye', '#ff3b3b'), st = c('stone', '#4e4b48'), bin: Bin = bd === '#d6a93a' ? 'metal' : 'lit';
    k.B('stone', O, 0, 0, 0, 0.84, 0.16, 0.84, st);
    k.B('lit', O, 0, 0.16, 0, 0.66, 0.08, 0.66, st);
    k.P(bin, O, 'sph', 0, 0.48, -0.02, 0.56, 0.5, 0.46, bd);
    k.S(bin, O, 0, 0.86, 0.02, 0.19, bd);
    for (const s of [-1, 1]) {
      k.S(bin, O, s * 0.2, 0.36, 0.15, 0.09, bd);
      k.Beam(bin, O, [s * 0.25, 0.62, 0], [s * 0.17, 0.48, 0.17], 0.05, bd);
      k.S('glow', O, s * 0.07, 0.9, 0.18, 0.035, ey);
    }
    k.P(bin, O, 'pyr', 0, 1.1, 0, 0.32, 0.22, 0.32, bd, 0, Math.PI / 4, 0);
  },
  shrine: (k, O, w, d, R, c) => {
    const rf = c('roof', '#6b4a3a'), wd = c('wood', '#9a6a3a'), bin: Bin = wd === '#b8a27c' ? 'lit' : 'wood';
    k.B(bin, O, 0, 0, 0, 0.16, 0.9, 0.16, wd);
    k.B(bin, O, 0, 0.9, 0, 0.56, 0.05, 0.42, wd);
    k.B(bin, O, 0, 0.95, -0.18, 0.56, 0.5, 0.05, wd);
    for (const s of [-1, 1]) {
      k.B(bin, O, s * 0.255, 0.95, 0, 0.05, 0.5, 0.42, wd);
      k.P('wood', O, 'box', s * 0.165, 1.52, 0.02, 0.42, 0.035, 0.56, rf, 0, 0, -s * 0.545);
    }
    k.P(bin, O, 'pyr', 0, 1.535, -0.18, 0.56, 0.17, 0.02, wd);
    k.C('lit', O, 0, 0.95, -0.1, 0.05, 0.22, '#d9c7a0', 'cyl6');
    k.S('lit', O, 0, 1.22, -0.1, 0.05, '#d9c7a0');
    k.C('lit', O, 0.13, 0.95, 0.08, 0.02, 0.08, '#efe6cf', 'cyl6');
    flameCup(k, O, 0.13, 1.03, 0.08, 0.35);
    return 1.1;
  },
  'offering-bowl': (k, O, w, d, R, c, p) => {
    const mt = c('metal', '#a8743c'), kk = fl(p, 'k');
    k.C('metal', O, 0, 0, 0, 0.12, 0.04, mt, 'cyl16');
    k.C('metal', O, 0, 0.04, 0, 0.035, 0.14, mt, 'cyl6');
    bowl(k, 'metal', O, 0, 0.32, 0, 0.24, 0.14, mt, kk === 3 ? '#5a0a0c' : dk(mt, 0.55));
    if (kk === 0) for (let i = 0; i < 6; i++) k.S('metal', O, (R() - 0.5) * 0.22, 0.32 + R() * 0.03, (R() - 0.5) * 0.22, 0.04, GOLD, 'ico');
    if (kk === 1) ['#c0392b', '#e09b2d', '#8aa04a', '#7a3a8a'].forEach((col) => k.S('fabric', O, (R() - 0.5) * 0.18, 0.35, (R() - 0.5) * 0.18, 0.06, col));
    if (kk === 2)
      for (let i = 0; i < 3; i++) {
        const x = (R() - 0.5) * 0.12, z = (R() - 0.5) * 0.12;
        k.Beam('wood', O, [x, 0.3, z], [x * 1.4, 0.55, z * 1.4], 0.006, '#5a3d24');
        k.S('glow', O, x * 1.4, 0.55, z * 1.4, 0.012, '#ff7a1a');
      }
  },
  'tomb-niche': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8780'), sh = c('shroud', '#d8ccb0'), kk = fl(p, 'k'), zc = 0.07;
    k.B('cave', O, 0, 0.5, -0.07, 0.86, 0.82, 0.02, '#15110e');
    k.B('stone', O, 0, 0.42, zc, 0.96, 0.1, 0.3, st);
    k.B('stone', O, 0, 1.32, zc, 0.96, 0.14, 0.3, st);
    for (const s of [-1, 1]) k.B('stone', O, s * 0.44, 0.52, zc, 0.08, 0.8, 0.3, st);
    if (kk === 0) {
      k.P('fabric', O, 'cyl16', 0.05, 0.6, zc, 0.16, 0.7, 0.14, sh, 0, 0, H);
      k.S('fabric', O, -0.32, 0.6, zc, 0.08, sh);
    } else if (kk === 1) {
      k.S('lit', O, -0.25, 0.58, zc, 0.07, BONE);
      k.Beam('lit', O, [-0.1, 0.54, zc - 0.04], [0.3, 0.54, zc + 0.02], 0.02, BONE);
      k.Beam('lit', O, [0.0, 0.54, zc + 0.06], [0.33, 0.55, zc - 0.03], 0.02, BONE);
    }
  },
  'road-shrine': (k, O, w, d, R, c) => {
    const rf = c('roof', '#6b4a32'), bs = c('base', '#8a8780');
    k.B('stone', O, 0, 0, 0, 0.5, 0.15, 0.5, bs);
    k.B('stone', O, 0, 0.15, 0, 0.32, 0.85, 0.32, bs);
    k.B('lit', O, 0, 1.0, 0, 0.48, 0.06, 0.4, bs);
    k.B('lit', O, 0, 1.06, -0.15, 0.44, 0.4, 0.06, bs);
    for (const s of [-1, 1]) k.C('wood', O, s * 0.2, 1.06, 0.15, 0.018, 0.4, dk(rf, 0.8), 'cyl6');
    k.P('wood', O, 'pyr', 0, 1.62, 0, 0.75, 0.32, 0.65, rf, 0, Math.PI / 4, 0);
    k.C('lit', O, 0, 1.06, -0.06, 0.05, 0.1, '#d9c7a0', 'cyl6');
    k.S('lit', O, 0, 1.2, -0.06, 0.05, '#d9c7a0');
    k.S('fabric', O, -0.13, 1.09, 0.08, 0.03, '#c0392b');
    k.C('lit', O, 0.12, 1.06, 0.08, 0.02, 0.07, '#efe6cf', 'cyl6');
    flameCup(k, O, 0.12, 1.13, 0.08, 0.35);
    return 1.2;
  },
};

// ---------------------------------------------------------------- terrain
const TERR: Record<string, Model> = {
  'open-grave': (k, O, w, d, R, c, p) => {
    const dt = c('dirt', '#6b4f35');
    k.P('deco', O, 'flat', -0.12, 0.006, 0.1, 0.62, 1, 1.4, dk(dt, 0.8));
    k.P('cave', O, 'flat', -0.12, 0.009, 0.1, 0.5, 1, 1.25, '#120e0b');
    k.P('lit', O, 'hemi', 0.3, 0, 0.1, 0.36, 0.5, 1.3, dt);
    k.Beam('wood', O, [0.3, 0.12, 0.45], [0.36, 0.95, 0.5], 0.02, '#6b4428');
    k.B('metal', O, 0.3, 0.03, 0.45, 0.14, 0.18, 0.02, IRON);
    if (fl(p, 'stone')) {
      const st = c('stone', '#8a8780');
      k.B('stone', O, -0.12, 0, -0.82, 0.42, 0.55, 0.12, st);
      k.P('stone', O, 'cyl16', -0.12, 0.55, -0.82, 0.42, 0.12, 0.42, st, H);
    }
    if (fl(p, 'coffin')) k.B('wood', O, -0.15, 0, 0.3, 0.4, 0.05, 0.9, '#4a2e18', -0.35, 0, 0.1);
  },
  'grass-tall': (k, O, w, d, R, c) => {
    const gc = c('grass', '#6f9a3e');
    k.P('deco', O, 'disc', 0, 0.006, 0, 0.9, 1, 0.9, dk(gc, 0.7));
    for (let i = 0; i < 12; i++) {
      const h = 0.55 + R() * 0.35;
      k.P('fabric', O, 'cone', (R() - 0.5) * 0.85, h / 2, (R() - 0.5) * 0.85, 0.1 + R() * 0.06, h, 0.05 + R() * 0.04, i % 3 ? gc : dk(gc, 0.85), (R() - 0.5) * 0.3, R() * 3, (R() - 0.5) * 0.3);
    }
  },
  puddle: (k, O, w, d, R, c) => {
    const wc = c('water', '#4f7f95');
    k.P('deco', O, 'disc', 0, 0.007, 0, 0.78, 1, 0.56, wc, 0, R() * 3, 0);
    k.P('deco', O, 'disc', 0.18, 0.009, 0.12, 0.38, 1, 0.3, wc, 0, R() * 3, 0);
    k.P('deco', O, 'disc', -0.06, 0.011, -0.05, 0.22, 1, 0.1, dk(wc, 1.35), 0, 0.4, 0);
  },
  'mud-patch': (k, O, w, d, R, c) => {
    const md = c('mud', '#5b4632');
    k.P('deco', O, 'disc', 0, 0.006, 0, 1.85, 1, 1.6, md, 0, R() * 3, 0);
    k.P('deco', O, 'disc', 0.3, 0.008, -0.25, 1.0, 1, 0.8, dk(md, 0.8), 0, R() * 3, 0);
    k.P('deco', O, 'disc', -0.4, 0.01, 0.35, 0.7, 1, 0.55, dk(md, 0.88), 0, R() * 3, 0);
    for (let i = 0; i < 4; i++) {
      const s = 0.08 + R() * 0.06;
      k.P('lit', O, 'hemi', (R() - 0.5) * 1.2, 0.006, (R() - 0.5) * 1.2, s, 0.06, s, dk(md, 1.15));
    }
  },
  'sand-ripples': (k, O, w, d, R, c) => {
    const sd = c('sand', '#e0c890');
    k.P('deco', O, 'flat', 0, 0.006, 0, w * 0.96, 1, d * 0.96, sd);
    for (let i = 0; i < 6; i++)
      k.P('lit', O, 'cyl', (R() - 0.5) * 0.2, 0.012, -0.75 + i * 0.3 + (R() - 0.5) * 0.06, 0.04, 1.5 + R() * 0.3, 0.08, dk(sd, 1.08), 0, (R() - 0.5) * 0.25, H);
  },
  'oasis-pool': (k, O, w, d, R, c) => {
    const wa = c('water', '#3d8aa0'), gr = c('grass', '#6f9a3e');
    k.P('deco', O, 'disc', 0, 0.006, 0, 1.9, 1, 1.75, c('sand', '#d8bf8a'));
    k.P('deco', O, 'disc', 0, 0.008, 0, 1.5, 1, 1.35, gr);
    k.P('deco', O, 'disc', 0, 0.01, 0, 1.2, 1, 1.05, wa);
    k.P('deco', O, 'disc', 0.1, 0.012, -0.08, 0.7, 1, 0.5, dk(wa, 0.8));
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + R() * 0.4, h = 0.18 + R() * 0.15;
      k.P('fabric', O, 'cone', Math.cos(a) * 0.68, h / 2, Math.sin(a) * 0.6, 0.12, h, 0.08, gr, 0, R() * 3, 0);
    }
    for (let i = 0; i < 3; i++) {
      const a = 0.6 + i * 0.25, x = Math.cos(a) * 0.62, z = Math.sin(a) * 0.55;
      k.C('fabric', O, x, 0, z, 0.012, 0.6 + R() * 0.2, '#6a7a3a', 'cyl6');
      k.C('fabric', O, x, 0.55, z, 0.025, 0.12, '#5a3d24', 'cyl6');
    }
  },
  snowdrift: (k, O, w, d, R, c) => {
    const sn = c('snow', SNOW);
    for (const [x, z, sx, h, sz] of [[0, 0, 1.4, 0.55, 1.2], [-0.45, 0.3, 0.9, 0.4, 0.8], [0.5, -0.35, 0.8, 0.35, 0.7], [0.35, 0.5, 0.7, 0.3, 0.6], [-0.5, -0.45, 0.6, 0.25, 0.6]])
      k.P('lit', O, 'hemi', x, 0, z, sx, h * 2, sz, sn, 0, R(), 0);
  },
  'frozen-pond': (k, O, w, d, R, c, p) => {
    const ic = c('ice', '#a9d6ea');
    k.P('lit', O, 'disc', 0, 0.006, 0, 1.9, 1, 1.7, '#e6eef4');
    k.P('metal', O, 'disc', 0, 0.009, 0, 1.65, 1, 1.45, ic);
    if (fl(p, 'crack')) for (let i = 0; i < 3; i++) k.P('deco', O, 'flat', (R() - 0.5) * 0.4, 0.012 + i * 0.001, (R() - 0.5) * 0.4, 0.9, 1, 0.012, dk(ic, 0.55), 0, R() * 3, 0);
    if (fl(p, 'hole')) {
      k.P('deco', O, 'disc', 0.25, 0.016, 0.2, 0.45, 1, 0.38, '#1c3440');
      for (let i = 0; i < 3; i++) {
        const a = i * 2.1 + R();
        k.P('metal', O, 'box', 0.25 + Math.cos(a) * 0.28, 0.02, 0.2 + Math.sin(a) * 0.24, 0.16, 0.03, 0.1, ic, (R() - 0.5) * 0.5, a, (R() - 0.5) * 0.5);
      }
    }
  },
  'ice-block': (k, O, w, d, R, c, p) => {
    const ic = c('ice', '#a9d6ea');
    k.B('metal', O, 0, 0, 0, 0.78, 0.85, 0.74, ic);
    k.B('metal', O, 0.05, 0.85, -0.02, 0.6, 0.12, 0.55, dk(ic, 1.08), 0.05, 0.25, 0.04);
    for (let i = 0; i < 3; i++) {
      const a = R() * TAU;
      k.P('metal', O, 'oct', Math.cos(a) * 0.45, 0.06, Math.sin(a) * 0.45, 0.14, 0.12, 0.12, ic, 0, R() * 3, 0);
    }
    if (fl(p, 'inside')) {
      vdisc(k, 'deco', O, 0, 0.45, 0.372, 0.36, 0.55, '#3a4a58');
      k.Beam('lit', O, [0.1, 0.8, 0.1], [0.14, 1.08, 0.12], 0.03, BONE);
      k.S('lit', O, 0.14, 1.1, 0.12, 0.045, BONE);
    }
  },
};

// ---------------------------------------------------------------- storage and light
const POTIONS = ['#c0392b', '#2f8a5a', '#3a5fcf', '#9b5cff', '#e0a020', '#5fd8c8'];
const REST: Record<string, Model> = {
  'ossuary-shelf': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), bn = c('bone', BONE), D = 0.42, zc = -0.5 + D / 2 + 0.02;
    k.B('lit', O, 0, 0, -0.47, 1.9, 2.0, 0.06, dk(st, 0.8));
    for (const s of [-1, 1]) k.B('lit', O, s * 0.92, 0, zc, 0.08, 2.0, D, st);
    for (let i = 0; i < 4; i++) k.B('lit', O, 0, i * 0.62, zc, 1.84, 0.06, D, st);
    for (let i = 0; i < 3; i++) {
      const y = i * 0.62 + 0.06;
      for (const yy of [0.05, 0.14]) k.P('lit', O, 'cyl6', 0, y + yy, zc - 0.05, 0.1, 1.7, 0.1, dk(bn, 0.92 + yy), 0, 0, H);
      for (let j = 0; j < 4; j++) k.S('lit', O, -0.66 + j * 0.44, y + 0.3, zc + 0.08, 0.09, bn);
    }
  },
  'potion-rack': (k, O, w, d, R, c) => {
    const wd = c('wood', '#6b4428'), D = 0.3, zc = -0.5 + D / 2 + 0.03;
    k.B('wood', O, 0, 0.4, -0.47, 1.85, 1.45, 0.04, dk(wd, 0.85));
    for (const s of [-1, 1]) k.B('wood', O, s * 0.9, 0.4, zc, 0.05, 1.45, D, wd);
    for (let i = 0; i < 4; i++) k.B('wood', O, 0, 0.4 + i * 0.46, zc, 1.8, 0.04, D, wd);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 5; j++)
        k.C(j === 2 ? 'glow' : 'deco', O, -0.7 + j * 0.35 + (R() - 0.5) * 0.08, 0.44 + i * 0.46, zc + 0.03, 0.045, 0.14 + R() * 0.12, POTIONS[Math.floor(R() * POTIONS.length)], 'cyl6');
  },
  'wine-rack': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#6b4428'), sparse = fl(p, 'sparse'), D = 0.4, zc = -0.5 + D / 2 + 0.02, H0 = 1.6;
    for (const s of [-1, 1]) k.B('wood', O, s * 0.9, 0, zc, 0.06, H0, D, wd);
    k.B('wood', O, 0, H0 - 0.05, zc, 1.86, 0.05, D, wd);
    k.B('wood', O, 0, 0, zc, 1.86, 0.06, D, wd);
    k.B('wood', O, 0, 0, -0.47, 1.8, H0, 0.03, dk(wd, 0.75));
    for (const i of [-1, 0, 1]) k.B('wood', O, i * 0.45, 0.06, zc, 0.04, H0 - 0.11, D, dk(wd, 0.9));
    for (let j = 0; j < 3; j++) k.B('wood', O, 0, 0.42 + j * 0.38, zc, 1.8, 0.03, D, dk(wd, 0.9));
    for (let col = 0; col < 4; col++)
      for (let row = 0; row < 4; row++) {
        if (sparse && R() < 0.5) continue;
        k.P('deco', O, 'cyl6', -0.675 + col * 0.45, 0.18 + row * 0.38, zc + 0.02, 0.13, 0.34, 0.13, R() < 0.3 ? '#5a1f2b' : '#2f4a2a', H);
      }
  },
  'weapon-barrel': (k, O, w, d, R, c, p) => {
    const wd = c('wood', WOOD), mt = c('metal', '#6c6f73'), staves = fl(p, 'staves');
    k.C('wood', O, 0, 0, 0, 0.32, 0.8, wd, 'cyl16');
    k.C('wood', O, 0, 0.12, 0, 0.345, 0.56, wd, 'cyl16');
    for (const y of [0.1, 0.66]) k.Ring('metal', O, 0, y, 0, 0.35, 0.025, IRON);
    k.P('wood', O, 'disc', 0, 0.805, 0, 0.6, 1, 0.6, '#1e1610');
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + R() * 0.5, x0 = Math.cos(a) * 0.07, z0 = Math.sin(a) * 0.07;
      const x1 = Math.cos(a) * 0.26, z1 = Math.sin(a) * 0.26, y1 = 1.35 + R() * 0.3;
      if (staves) k.Beam('wood', O, [x0, 0.6, z0], [x1, y1, z1], 0.022, mt);
      else if (i % 2) {
        k.Beam('wood', O, [x0, 0.6, z0], [x1, y1, z1], 0.018, DARKWOOD);
        k.P('metal', O, 'cone', x1, y1 + 0.08, z1, 0.06, 0.16, 0.025, mt);
      } else {
        const xm = (x0 + x1) / 2, zm = (z0 + z1) / 2;
        k.Beam('metal', O, [x0, 0.6, z0], [xm, 1.0, zm], 0.022, mt, 'box');
        k.B('metal', O, xm, 1.0, zm, 0.2, 0.03, 0.04, mt, 0, -a, 0);
        k.Beam('wood', O, [xm, 1.03, zm], [xm, 1.2, zm], 0.015, '#3a2a20');
        k.S('metal', O, xm, 1.22, zm, 0.025, mt);
      }
    }
  },
  'lantern-hanging': (k, O, w, d, R, c) => {
    const mt = c('metal', '#6c6f73'), y = 1.55;
    k.Beam('metal', O, [0, 2.4, 0], [0, y + 0.4, 0], 0.012, mt, 'cyl6');
    k.P('metal', O, 'pyr', 0, y + 0.34, 0, 0.26, 0.14, 0.26, mt, 0, Math.PI / 4, 0);
    k.B('metal', O, 0, y, 0, 0.2, 0.03, 0.2, mt);
    k.B('metal', O, 0, y + 0.27, 0, 0.2, 0.02, 0.2, mt);
    for (const s of [-1, 1]) for (const t of [-1, 1]) k.B('metal', O, s * 0.085, y + 0.03, t * 0.085, 0.02, 0.24, 0.02, mt);
    k.S('glow', O, 0, y + 0.15, 0, 0.065, c('light', '#ffcf70'));
    return y + 0.15;
  },
  'cooking-pot-fire': (k, O, w, d, R, c) => {
    const mt = c('metal', '#33373c');
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU;
      k.S('lit', O, Math.cos(a) * 0.36, 0.05, Math.sin(a) * 0.36, 0.08, '#7a746a', 'ico');
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + R();
      k.Beam('wood', O, [Math.cos(a) * 0.28, 0.02, Math.sin(a) * 0.28], [0, 0.18, 0], 0.035, '#4a2e18');
    }
    k.S('glow', O, 0, 0.1, 0, 0.1, '#ff7a1a', 'ico');
    flameCup(k, O, 0, 0.08, 0, 1.4);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.5;
      k.Beam('wood', O, [Math.cos(a) * 0.44, 0, Math.sin(a) * 0.44], [0, 1.15, 0], 0.025, DARKWOOD);
    }
    k.Beam('metal', O, [0, 1.12, 0], [0, 0.64, 0], 0.008, mt, 'cyl6');
    k.P('metal', O, 'ring', 0, 0.5, 0, 0.4, 0.3, 0.3, mt, H);
    bowl(k, 'metal', O, 0, 0.5, 0, 0.22, 0.22, mt, c('stew', '#8a5a2e'));
    return 0.3;
  },
};

export const MORE_MODELS: Record<string, Model> = { ...TRAPS, ...DECOR, ...STRUCT, ...STRUCT2, ...FURN, ...REL, ...TERR, ...REST };

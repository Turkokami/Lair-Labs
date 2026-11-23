// 3D models for library objects that only had a stand-in body (second half: arcane, hazard, workshop, vehicle, treasure, kitchen, nature).
// Same conventions as props3d.ts: 1 square = 1 unit, y up, base at y = 0, centred on the footprint (w across x, d across z).
// "Top edge" in the overhead art is local -z, the bottom edge (front) is +z. Variant-only shapes read p.v (the variant index).
import type { Kit, Bin, Spot } from './kit';
import { type Model, WOOD, DARKWOOD, IRON, STONE, GOLD, crate, legsTable, flameCup } from './modelkit';

const TAU = Math.PI * 2, HALF = Math.PI / 2;

/** Lighten (f > 0) or darken (f < 0) a #rrggbb colour. */
const tint = (hex: string, f: number) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => {
    const v = (n >> s) & 255;
    return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  };
  return '#' + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0');
};

/** A spot offset by a local (lx, lz) from O and turned a further dry, so sub-builders follow the object's rotation. */
const sub = (O: Spot, lx: number, lz: number, dry = 0): Spot => {
  const yaw = O.ry ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  return { x: O.x + lx * c + lz * s, z: O.z - lx * s + lz * c, ry: yaw + dry, y: O.y };
};

/** A spoked wheel standing upright, its axle along x. 4 pieces. */
const wheel = (k: Kit, O: Spot, x: number, z: number, r: number, col: string, hub = IRON) => {
  k.P('wood', O, 'torus', x, r, z, r / 0.62, 0.33, r / 0.62, col, 0, 0, HALF);
  k.P('metal', O, 'cyl16', x, r, z, r * 0.36, 0.12, r * 0.36, hub, 0, 0, HALF);
  k.Beam('wood', O, [x, 0.08 * r, z], [x, r * 1.92, z], 0.025, col);
  k.Beam('wood', O, [x, r, z - r * 0.92], [x, r, z + r * 0.92], 0.025, col);
};

/** A flat leaf/frond (thin box) starting at local (lx, ly, lz), heading out at yaw and tilted down by pitch (negative = rising). */
const frond = (k: Kit, O: Spot, lx: number, ly: number, lz: number, yaw: number, pitch: number, L: number, wid: number, col: string, bin: Bin = 'fabric') => {
  const S = sub(O, lx, lz, yaw);
  k.P(bin, S, 'box', 0, ly - (Math.sin(pitch) * L) / 2, (Math.cos(pitch) * L) / 2, wid, 0.02, L, col, pitch, 0, 0);
};

/** Flat strips along a polyline lying on the floor (cracks, streams). */
const strip = (k: Kit, O: Spot, pts: number[][], y: number, wid: number, col: string, bin: Bin) => {
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i], dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
    k.P(bin, O, 'flat', (ax + bx) / 2, y, (az + bz) / 2, L + wid * 0.6, 1, wid, col, 0, -Math.atan2(dz, dx), 0);
  }
};

/** A board running from a to b ([y, z] points) in the y-z plane, e.g. a loom's sloped warp. */
const slab = (k: Kit, bin: Bin, O: Spot, x: number, a: number[], b: number[], wid: number, th: number, col: string) => {
  const dy = b[0] - a[0], dz = b[1] - a[1];
  k.P(bin, O, 'box', x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, wid, th, Math.hypot(dy, dz), col, Math.atan2(-dy, dz), 0, 0);
};

/** An open boat hull: an upturned dome (rotated, so its faces stay outward) with floorboards inside and a gunwale rim. */
const hull = (k: Kit, O: Spot, wid: number, len: number, depth: number, outer: string, inner: string, rim: string) => {
  k.P('wood', O, 'hemi', 0, depth + 0.04, 0, wid, depth * 2, len, outer, Math.PI, 0, 0);
  k.P('wood', O, 'disc', 0, depth - 0.04, 0, wid * 0.92, 1, len * 0.92, inner);
  k.P('wood', O, 'ring', 0, depth + 0.04, 0, wid, 0.7, len, rim);
};

/** Shelving against the top (-z) wall: back, sides and n boards. Returns the shelf middle z and the heights things stand at. */
const shelving = (k: Kit, O: Spot, w: number, d: number, wood: string, H: number, n: number, D = 0.34) => {
  const z = -d / 2 + D / 2 + 0.02;
  k.B('wood', O, 0, 0, -d / 2 + 0.04, w * 0.94, H, 0.03, tint(wood, -0.25));
  for (const x of [-1, 1]) k.B('wood', O, x * w * 0.46, 0, z, 0.05, H, D, wood);
  const ys: number[] = [];
  for (let s = 0; s < n; s++) {
    const y = 0.06 + s * ((H - 0.1) / (n - 1));
    k.B('wood', O, 0, y, z, w * 0.9, 0.04, D, wood);
    ys.push(y + 0.04);
  }
  return { z, ys };
};

const POTIONS = ['#c0392b', '#2f7fd6', '#3fae5a', '#9b5cff', '#e0b03a', '#2fb8b0'];
const GEMS = ['#c0392b', '#2f7fd6', '#3fae5a', '#9b5cff', '#f2f2f2', '#e0b03a'];
const ROPE = '#b59a6a';

export const MORE_MODELS2: Record<string, Model> = {
  // ---------------- arcane ----------------
  orrery: (k, O, w, d, R, c) => {
    const m = c('metal', '#c9a24a'), wd = c('wood', '#6b4428'), sun = c('sun', '#ffcf4a');
    k.C('wood', O, 0, 0, 0, 0.36, 0.06, tint(wd, -0.2), 'cyl16');
    k.C('wood', O, 0, 0, 0, 0.09, 0.62, tint(wd, -0.2), 'cyl6');
    k.C('wood', O, 0, 0.62, 0, Math.min(w, d) * 0.42, 0.07, wd, 'cyl16');
    k.C('metal', O, 0, 0.69, 0, 0.16, 0.05, m, 'cyl16');
    k.C('metal', O, 0, 0.69, 0, 0.03, 0.62, m, 'cyl6');
    k.S('glow', O, 0, 1.36, 0, 0.13, sun);
    const pl = ['#7fb2d9', '#c9583a', '#b8a27c', '#7ad1a0'];
    for (let i = 0; i < 4; i++) {
      const r = 0.28 + i * 0.16, a = R() * TAU, y = 1.0 + i * 0.07, x = Math.cos(a) * r, z = Math.sin(a) * r;
      k.Ring('metal', O, 0, y, 0, r, 0.012, m);
      k.Beam('metal', O, [0, y + 0.1, 0], [x, y, z], 0.01, m);
      k.S('deco', O, x, y, z, 0.05 + i * 0.012, pl[i]);
    }
  },
  telescope: (k, O, w, d, R, c) => {
    const m = c('metal', '#c9a24a'), wd = c('wood', '#6b4428'), head = [-0.15, 1.0, 0];
    for (const f of [[-0.6, -0.3], [-0.6, 0.3], [0.25, 0]]) k.Beam('wood', O, [f[0], 0, f[1]], head, 0.035, wd);
    k.B('metal', O, -0.15, 0.94, 0, 0.14, 0.12, 0.14, tint(m, -0.3));
    k.Beam('metal', O, [-0.8, 0.72, 0], [0.55, 1.42, 0], 0.08, m, 'cyl16');
    k.Beam('metal', O, [0.45, 1.37, 0], [0.82, 1.56, 0], 0.11, m, 'cyl16');
    k.Beam('metal', O, [-0.95, 0.65, 0], [-0.8, 0.72, 0], 0.04, tint(m, -0.3), 'cyl16');
    k.P('deco', O, 'disc', 0.83, 1.565, 0, 0.2, 1, 0.2, '#9fc8e6', 0, 0, -1.09);
  },
  'alchemy-table': (k, O, w, d, R, c) => {
    legsTable(k, O, w * 0.92, d * 0.72, 0.8, c('wood', '#6b4428'));
    const y = 0.8;
    for (let i = 0; i < 3; i++) {
      const x = -0.72 + i * 0.16, z = i % 2 ? 0.1 : -0.1;
      k.S('glow', O, x, y + 0.08, z, 0.075, POTIONS[(i * 2) % POTIONS.length]);
      k.C('deco', O, x, y + 0.13, z, 0.022, 0.1, '#d8e4e8', 'cyl6');
    }
    // retort over a burner
    k.C('metal', O, -0.05, y, 0, 0.07, 0.12, IRON, 'cyl6');
    k.P('glow', O, 'cone', -0.05, y + 0.17, 0, 0.07, 0.1, 0.07, '#7fb8ff');
    k.S('deco', O, -0.05, y + 0.31, 0, 0.1, '#cfe3e0');
    k.Beam('deco', O, [0.0, y + 0.35, 0], [0.3, y + 0.2, 0.05], 0.018, '#cfe3e0');
    // mortar and an open book
    k.C('lit', O, 0.42, y, 0.13, 0.08, 0.09, '#9a9286', 'cyl16');
    k.Beam('wood', O, [0.42, y + 0.06, 0.13], [0.5, y + 0.2, 0.18], 0.015, '#e6dcc4');
    k.B('fabric', O, 0.62, y, -0.08, 0.32, 0.015, 0.24, '#5a2a2a');
    k.B('fabric', O, 0.54, y + 0.015, -0.08, 0.15, 0.02, 0.21, '#efe6cf', 0, 0, -0.1);
    k.B('fabric', O, 0.7, y + 0.015, -0.08, 0.15, 0.02, 0.21, '#efe6cf', 0, 0, 0.1);
  },
  'crystal-ball': (k, O, w, d, R, c) => {
    const cloth = c('cloth', '#5d3a78'), trim = c('trim', '#c99a2e');
    k.C('fabric', O, 0, 0, 0, 0.38, 0.72, cloth, 'cyl16');
    k.C('fabric', O, 0, 0.72, 0, 0.41, 0.03, cloth, 'cyl16');
    k.Ring('fabric', O, 0, 0.7, 0, 0.405, 0.03, trim);
    k.C('metal', O, 0, 0.75, 0, 0.1, 0.05, GOLD, 'cyl16');
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU;
      k.Beam('metal', O, [Math.cos(a) * 0.1, 0.77, Math.sin(a) * 0.1], [Math.cos(a) * 0.09, 0.93, Math.sin(a) * 0.09], 0.016, GOLD);
    }
    k.S('glow', O, 0, 0.95, 0, 0.15, c('orb', '#b48cff'));
    return 0.95;
  },
  'teleport-pad': (k, O, w, d, R, c, p) => {
    const dormant = p.v === 3 || !!p.off, glow = c('glow', '#5ff0ff'), gb: Bin = dormant ? 'deco' : 'glow';
    const r = Math.min(w, d) * 0.46;
    k.C('stone', O, 0, 0, 0, r, 0.06, c('stone', '#8a8780'), 'cyl16');
    k.Ring(gb, O, 0, 0.065, 0, r * 0.82, 0.04, glow);
    k.Ring(gb, O, 0, 0.065, 0, r * 0.45, 0.03, glow);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      k.P(gb, O, 'flat', Math.cos(a) * r * 0.64, 0.064, Math.sin(a) * r * 0.64, 0.07, 1, 0.22, glow, 0, -a, 0);
    }
    k.P(gb, O, 'disc', 0, 0.063, 0, r * 0.5, 1, r * 0.5, tint(glow, -0.45));
    return 0.3;
  },
  'scroll-pile': (k, O, w, d, R, c) => {
    const paper = c('paper', '#eadbb5'), seal = c('seal', '#a3312c');
    for (let i = 0; i < 2; i++) k.P('fabric', O, 'box', (R() - 0.5) * 0.4, 0.006, (R() - 0.5) * 0.4, 0.3, 0.008, 0.22, tint(paper, -0.05), 0, R() * Math.PI, 0);
    for (let i = 0; i < 6; i++) {
      const x = (R() - 0.5) * 0.45, z = (R() - 0.5) * 0.45, y = 0.045 + (i > 3 ? 0.08 : 0), a = R() * Math.PI;
      k.P('fabric', O, 'cyl16', x, y, z, 0.085, 0.36 + R() * 0.14, 0.085, paper, 0, a, HALF);
      if (i % 2 === 0) k.S('deco', O, x, y, z, 0.048, seal);
    }
  },
  // wall-hung: local -z faces the wall, which is about 0.08 behind the spot
  'magic-mirror': (k, O, w, d, R, c) => {
    const fr = c('frame', '#e2b84a'), glass = c('glass', '#9fd8ff');
    for (const x of [-1, 1]) {
      k.Beam('metal', O, [x * 0.3, 0.04, 0.16], [x * 0.24, 0.72, 0.02], 0.025, fr);
      k.S('metal', O, x * 0.3, 0.05, 0.17, 0.06, fr);
    }
    k.P('metal', O, 'torus', 0, 1.18, 0.02, 0.7, 0.5, 1.3, fr, HALF, 0, 0);
    k.P('glow', O, 'disc', 0, 1.18, 0.03, 0.6, 1, 1.18, glass, HALF, 0, 0);
    k.S('metal', O, 0, 2.0, 0.02, 0.06, fr);
    return 1.18;
  },
  'levitating-tome': (k, O, w, d, R, c) => {
    const cover = c('cover', '#5d3a78'), glow = c('glow', '#c08cff'), y = 1.0;
    k.Ring('glow', O, 0, 0.015, 0, 0.32, 0.03, glow);
    k.P('fabric', O, 'box', -0.14, y, 0, 0.28, 0.025, 0.38, cover, 0, 0, -0.22);
    k.P('fabric', O, 'box', 0.14, y, 0, 0.28, 0.025, 0.38, cover, 0, 0, 0.22);
    k.P('deco', O, 'box', -0.13, y + 0.025, 0, 0.25, 0.025, 0.34, '#efe6cf', 0, 0, -0.22);
    k.P('deco', O, 'box', 0.13, y + 0.025, 0, 0.25, 0.025, 0.34, '#efe6cf', 0, 0, 0.22);
    k.P('deco', O, 'box', 0.08, y + 0.12, 0.01, 0.2, 0.01, 0.32, '#f5eedd', 0, 0, 0.9);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + R();
      k.S('glow', O, Math.cos(a) * 0.32, y - 0.15 + R() * 0.4, Math.sin(a) * 0.32, 0.025, glow);
    }
    return y;
  },
  'potion-shelf': (k, O, w, d, R, c) => {
    const { z, ys } = shelving(k, O, w, d, c('wood', '#6b4428'), 1.7, 4);
    for (let s = 0; s < 3; s++) {
      for (let i = 0; i < 4; i++) {
        const x = -w * 0.36 + i * (w * 0.24) + (R() - 0.5) * 0.08, col = POTIONS[Math.floor(R() * POTIONS.length)], bz = z + 0.03;
        if ((i + s) % 2) k.C('deco', O, x, ys[s], bz, 0.055, 0.2 + R() * 0.08, col, 'cyl6');
        else k.S(s === 1 && i === 0 ? 'glow' : 'deco', O, x, ys[s] + 0.09, bz, 0.09, col);
      }
    }
  },
  'apothecary-counter': (k, O, w, d, R, c) => {
    const wd = c('wood', '#6b4428'), m = c('metal', '#c9a24a'), y = 1.0;
    k.B('wood', O, 0, 0, 0, w * 0.96, 0.95, d * 0.6, wd);
    k.B('wood', O, 0, 0.95, 0, w * 0.98, 0.05, d * 0.7, tint(wd, 0.15));
    for (let i = 0; i < 4; i++) k.B('metal', O, -w * 0.36 + i * w * 0.24, 0.6, d * 0.3, 0.08, 0.03, 0.02, m);
    // brass scales
    k.C('metal', O, -1.05, y, 0, 0.08, 0.03, m, 'cyl16');
    k.C('metal', O, -1.05, y, 0, 0.014, 0.36, m, 'cyl6');
    k.B('metal', O, -1.05, y + 0.36, 0, 0.42, 0.02, 0.02, m);
    for (const x of [-1.24, -0.86]) {
      k.Beam('metal', O, [x, y + 0.36, 0], [x, y + 0.2, 0], 0.005, m);
      k.P('metal', O, 'cyl16', x, y + 0.19, 0, 0.16, 0.025, 0.16, m);
    }
    // mortar, jars, herbs
    k.C('lit', O, -0.35, y, 0.05, 0.09, 0.1, '#9a9286', 'cyl16');
    k.Beam('wood', O, [-0.35, y + 0.07, 0.05], [-0.28, y + 0.22, 0.1], 0.016, '#e6dcc4');
    for (let i = 0; i < 4; i++) {
      const x = 0.15 + i * 0.22;
      k.C('deco', O, x, y, -0.08, 0.07, 0.18 + (i % 2) * 0.06, POTIONS[(i + 1) % POTIONS.length], 'cyl16');
      k.C('wood', O, x, y + 0.18 + (i % 2) * 0.06, -0.08, 0.075, 0.03, DARKWOOD, 'cyl16');
    }
    k.S('fabric', O, 1.15, y + 0.06, 0.08, 0.09, '#5f8a3a', 'ico');
    k.S('fabric', O, 1.28, y + 0.05, -0.05, 0.07, '#7a9a4a', 'ico');
  },

  // ---------------- hazard (flat ones sit 0.005-0.02 above the floor) ----------------
  'lava-crack': (k, O, w, d, R, c) => {
    const lava = c('lava', '#ff7a1a'), rock = c('rock', '#2e2622');
    k.P('cave', O, 'disc', 0, 0.006, 0, w * 0.86, 1, d * 0.7, rock);
    const pts: number[][] = [];
    for (let i = 0; i <= 4; i++) pts.push([-w * 0.42 + i * w * 0.21, (i / 4 - 0.5) * d * 0.5 + (R() - 0.5) * 0.3]);
    strip(k, O, pts, 0.012, 0.2, lava, 'glow');
    for (const i of [1, 3]) {
      const [x, z] = pts[i], s = i === 1 ? 1 : -1;
      strip(k, O, [[x, z], [x + 0.15, z + s * 0.45]], 0.013, 0.08, tint(lava, 0.2), 'glow');
    }
    for (const i of [1, 3]) k.P('glow', O, 'hemi', pts[i][0], 0.005, pts[i][1], 0.14, 0.06, 0.14, tint(lava, 0.35));
    return 0.15;
  },
  'acid-pool': (k, O, w, d, R, c, p) => {
    const liq = c('liq', '#8fd14f'), bin: Bin = p.v === 1 || p.v === 2 ? 'deco' : 'glow';
    k.P('deco', O, 'disc', 0, 0.006, 0, w * 0.9, 1, d * 0.84, tint(liq, -0.6));
    k.P(bin, O, 'disc', -0.05, 0.011, 0.02, w * 0.76, 1, d * 0.68, liq);
    k.P(bin, O, 'disc', w * 0.18, 0.014, -d * 0.12, w * 0.4, 1, d * 0.36, tint(liq, -0.15));
    for (let i = 0; i < 4; i++) {
      const r = 0.06 + R() * 0.07;
      k.P(bin, O, 'hemi', (R() - 0.5) * w * 0.5, 0.01, (R() - 0.5) * d * 0.45, r, r * 0.7, r, tint(liq, 0.3));
    }
  },
  'green-slime': (k, O, w, d, R, c) => {
    const s = c('slime', '#7ad13a');
    k.P('deco', O, 'disc', 0, 0.008, 0, 0.8, 1, 0.7, s);
    for (let i = 0; i < 4; i++) {
      const r = 0.16 + R() * 0.14;
      k.P('deco', O, 'hemi', (R() - 0.5) * 0.4, 0.005, (R() - 0.5) * 0.35, r, 0.07 + R() * 0.05, r * 0.9, tint(s, i % 2 ? 0.15 : -0.1));
    }
    k.S('glow', O, 0.08, 0.06, 0.05, 0.025, tint(s, 0.5));
  },
  'mold-patch': (k, O, w, d, R, c) => {
    const m = c('mold', '#8a5a32');
    k.P('deco', O, 'disc', 0, 0.008, 0, 0.82, 1, 0.76, m);
    k.Ring('glow', O, 0, 0.012, 0, 0.44, 0.02, c('aura', '#bfe6ff'));
    for (let i = 0; i < 7; i++) {
      const r = 0.07 + R() * 0.07;
      k.P('fabric', O, 'ico', (R() - 0.5) * 0.55, 0.02, (R() - 0.5) * 0.5, r * 2, r * 0.8, r * 2, tint(m, (R() - 0.5) * 0.4));
    }
  },
  'poison-gas': (k, O, w, d, R, c) => {
    const g = c('gas', '#8fe04a');
    k.P('deco', O, 'disc', 0, 0.007, 0, w * 0.85, 1, d * 0.85, tint(g, -0.45));
    for (let i = 0; i < 6; i++) {
      const r = 0.3 + R() * 0.25, a = (i / 6) * TAU + R() * 0.5, rr = i ? 0.45 : 0;
      k.P('fabric', O, 'hemi', Math.cos(a) * rr * w * 0.5, 0, Math.sin(a) * rr * d * 0.5, r * 2, 0.25 + R() * 0.25, r * 2, tint(g, (R() - 0.3) * 0.3));
    }
  },
  'pit-deep': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780');
    k.P('deco', O, 'disc', 0, 0.005, 0, w * 0.86, 1, d * 0.86, '#1e1b18');
    k.P('glow', O, 'disc', 0, 0.009, 0, w * 0.74, 1, d * 0.74, '#050506');
    k.P('stone', O, 'torus', 0, 0.02, 0, w * 0.74, 0.45, d * 0.74, st);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + R() * 0.6, r = Math.min(w, d) * 0.46;
      k.S('cave', O, Math.cos(a) * r, 0.04, Math.sin(a) * r, 0.07 + R() * 0.05, tint(st, -0.1), 'ico');
    }
  },
  'chasm-edge': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780');
    k.B('stone', O, 0, 0, -d / 4, w, 0.05, d / 2, st);
    k.P('glow', O, 'flat', 0, 0.006, d / 4, w, 1, d / 2, '#050506');
    k.P('deco', O, 'flat', 0, 0.01, 0.1, w, 1, 0.2, '#1c1a18');
    for (let i = 0; i < 6; i++) k.S('cave', O, -w / 2 + (i + 0.5) * (w / 6) + (R() - 0.5) * 0.1, 0.03, 0.02 + (R() - 0.5) * 0.08, 0.1 + R() * 0.06, tint(st, -0.1), 'ico');
  },
  'sewer-outflow': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8780'), liq = c('liq', '#6b5a2a'), lb: Bin = p.v === 2 ? 'glow' : 'deco';
    k.P('stone', O, 'cyl16', 0, 0.36, -0.42, 0.46, 0.2, 0.46, st, HALF, 0, 0);
    k.P('glow', O, 'disc', 0, 0.36, -0.315, 0.32, 1, 0.32, '#0b0b0a', HALF, 0, 0);
    for (const x of [-0.07, 0.07]) k.C('metal', O, x, 0.2, -0.31, 0.012, 0.32, IRON, 'cyl6');
    k.P(lb, O, 'box', 0, 0.09, -0.3, 0.16, 0.18, 0.03, liq);
    k.P(lb, O, 'flat', 0, 0.01, 0.02, 0.28, 1, 0.66, liq);
    k.P(lb, O, 'disc', 0.04, 0.013, 0.32, 0.6, 1, 0.3, tint(liq, 0.1));
  },
  quicksand: (k, O, w, d, R, c) => {
    const s = c('sand', '#c9ab72');
    k.P('lit', O, 'disc', 0, 0.006, 0, w * 0.9, 1, d * 0.86, s);
    k.Ring('deco', O, 0, 0.01, 0, w * 0.3, 0.02, tint(s, -0.25));
    k.Ring('deco', O, 0, 0.011, 0, w * 0.17, 0.02, tint(s, -0.3));
    k.P('deco', O, 'disc', 0, 0.012, 0, 0.26, 1, 0.26, tint(s, -0.4));
  },

  // ---------------- workshop ----------------
  forge: (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8780'), cold = p.v === 3 || !!p.off;
    k.B('stone', O, 0, 0, -d * 0.36, w * 0.9, 2.4, d * 0.26, st);
    k.B('stone', O, 0, 0, -d * 0.08, w * 0.82, 0.78, d * 0.5, st);
    k.B('lit', O, 0, 0.78, -d * 0.08, w * 0.86, 0.06, d * 0.54, tint(st, -0.15));
    k.P('stone', O, 'pyr', 0, 1.6, -d * 0.18, 1.5, 0.8, 1.5, st, 0, Math.PI / 4, 0);
    k.P('cave', O, 'sph', 0, 0.86, -d * 0.1, 0.62, 0.12, 0.5, cold ? '#4a4540' : '#2a1d16');
    if (!cold) {
      k.P('glow', O, 'sph', 0, 0.88, -d * 0.1, 0.42, 0.1, 0.34, '#ff6a1a');
      flameCup(k, O, 0, 0.86, -d * 0.1, 2);
    }
    // bellows on a post at the front corner, nozzle into the fire
    const lth = c('leather', '#6b4428');
    k.B('wood', O, w * 0.3, 0, d * 0.32, 0.08, 0.45, 0.08, DARKWOOD);
    k.B('wood', O, w * 0.3, 0.45, d * 0.32, 0.32, 0.03, 0.5, DARKWOOD, 0.12, 0, 0);
    k.B('fabric', O, w * 0.3, 0.48, d * 0.32, 0.28, 0.12, 0.42, lth, 0.06, 0, 0);
    k.Beam('metal', O, [w * 0.3, 0.55, d * 0.2], [w * 0.22, 0.8, d * 0.05], 0.03, IRON);
    // quench tub
    k.C('wood', O, -w * 0.3, 0, d * 0.32, 0.22, 0.4, DARKWOOD, 'cyl16');
    k.P('deco', O, 'disc', -w * 0.3, 0.38, d * 0.32, 0.38, 1, 0.38, '#2a4a5a');
    return cold ? undefined : 1.0;
  },
  workbench: (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a6a3a'), m = c('metal', '#6c6f73'), y = 0.85;
    legsTable(k, O, w * 0.92, d * 0.7, y, wd);
    k.B('wood', O, 0, 0.16, 0, w * 0.8, 0.04, d * 0.5, tint(wd, -0.15));
    // vise
    k.B('metal', O, w * 0.38, y, d * 0.3, 0.16, 0.12, 0.12, m);
    k.Beam('metal', O, [w * 0.38, y + 0.06, d * 0.36], [w * 0.38, y + 0.06, d * 0.5], 0.015, m);
    // hammer, saw, plane, offcuts
    k.Beam('wood', O, [-0.6, y + 0.02, 0.05], [-0.3, y + 0.02, 0.15], 0.018, DARKWOOD);
    k.B('metal', O, -0.62, y, 0.04, 0.05, 0.05, 0.14, m, 0, 0.32, 0);
    k.B('metal', O, 0.05, y, -0.08, 0.45, 0.01, 0.14, '#b8bcc4', 0, 0.1, 0);
    k.B('wood', O, -0.2, y, -0.1, 0.12, 0.04, 0.1, DARKWOOD, 0, 0.1, 0);
    k.B('wood', O, 0.3, y, 0.12, 0.2, 0.08, 0.07, tint(wd, 0.1));
    k.B('wood', O, -0.05, y, 0.16, 0.5, 0.04, 0.1, tint(wd, 0.2), 0, -0.15, 0);
  },
  sawhorse: (k, O, w, d, R, c) => {
    const wd = c('wood', '#c4955a');
    for (const x0 of [-w * 0.3, w * 0.3]) {
      k.B('wood', O, x0, 0.58, 0, 0.1, 0.08, d * 0.72, wd);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.Beam('wood', O, [x0 + sx * 0.03, 0.6, sz * 0.28], [x0 + sx * 0.2, 0, sz * 0.33], 0.025, tint(wd, -0.15));
    }
    k.B('wood', O, 0, 0.66, 0.02, w * 0.92, 0.05, 0.3, tint(wd, 0.12));
    k.B('metal', O, 0.25, 0.71, 0.1, 0.5, 0.01, 0.12, '#b8bcc4', 0, 0.35, 0);
    k.P('deco', O, 'disc', 0, 0.006, 0.05, 0.9, 1, 0.55, '#d9bf8a');
  },
  // wall-hung: the board sits just in front of the wall behind local -z
  'tool-wall': (k, O, w, d, R, c) => {
    const wd = c('wood', '#c4955a'), m = c('metal', '#6c6f73'), z = 0.0;
    k.B('wood', O, 0, 0.55, -0.05, w * 0.9, 1.15, 0.04, wd);
    k.B('wood', O, 0, 0.5, -0.02, w * 0.92, 0.06, 0.1, tint(wd, -0.2));
    k.B('wood', O, 0, 1.68, -0.02, w * 0.92, 0.06, 0.1, tint(wd, -0.2));
    // hammer
    k.Beam('wood', O, [-0.7, 0.85, z], [-0.7, 1.3, z], 0.018, DARKWOOD);
    k.B('metal', O, -0.7, 1.3, z, 0.16, 0.06, 0.06, m);
    // saw
    k.B('metal', O, -0.35, 0.8, z, 0.18, 0.6, 0.01, '#b8bcc4');
    k.B('wood', O, -0.35, 1.38, z, 0.12, 0.12, 0.03, DARKWOOD);
    // axe
    k.Beam('wood', O, [0.05, 0.75, z], [0.05, 1.45, z], 0.02, DARKWOOD);
    k.B('metal', O, 0.12, 1.25, z, 0.16, 0.16, 0.02, m);
    // tongs, a coil of rope and a peg box
    k.Beam('metal', O, [0.38, 0.8, z], [0.42, 1.4, z], 0.012, m);
    k.Beam('metal', O, [0.46, 0.8, z], [0.42, 1.4, z], 0.012, m);
    k.P('fabric', O, 'torus', 0.72, 1.12, z + 0.01, 0.38, 0.4, 0.38, ROPE, HALF, 0, 0);
    k.B('wood', O, 0, 1.6, z, 0.24, 0.08, 0.06, DARKWOOD);
  },
  loom: (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a6a3a'), cloth = c('cloth', '#a3312c'), thread = c('thread', '#e6dcc6');
    const xs = w * 0.4, zb = -d * 0.28, zf = d * 0.12, zm = (zb + zf) / 2 + 0.1;
    for (const x of [-xs, xs]) {
      k.B('wood', O, x, 0, zb, 0.08, 1.55, 0.08, wd);
      k.B('wood', O, x, 0, zf, 0.08, 0.95, 0.08, wd);
      k.B('wood', O, x, 0.15, (zb + zf) / 2, 0.06, 0.06, zf - zb, tint(wd, -0.15));
    }
    k.B('wood', O, 0, 1.5, zb, xs * 2 + 0.1, 0.08, 0.1, wd);
    k.P('wood', O, 'cyl16', 0, 1.3, zb, 0.1, xs * 2, 0.1, tint(wd, -0.1), 0, 0, HALF);
    k.P('fabric', O, 'cyl16', 0, 0.88, zf, 0.16, xs * 2 - 0.06, 0.16, cloth, 0, 0, HALF);
    // warp threads run down to the beater, woven cloth from there to the front roll
    slab(k, 'fabric', O, 0, [1.3, zb], [1.0, zm], xs * 2 - 0.12, 0.01, thread);
    slab(k, 'fabric', O, 0, [1.0, zm], [0.9, zf - 0.06], xs * 2 - 0.12, 0.015, cloth);
    k.B('wood', O, 0, 1.0, zm, xs * 2 - 0.06, 0.12, 0.04, DARKWOOD);
    // weaver's bench
    k.B('wood', O, 0, 0.42, d * 0.36, w * 0.5, 0.05, 0.26, wd);
    for (const x of [-1, 1]) k.B('wood', O, x * w * 0.2, 0, d * 0.36, 0.06, 0.42, 0.22, tint(wd, -0.2));
  },
  'spinning-wheel': (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a6a3a'), wool = c('wool', '#ece6d6');
    k.B('wood', O, 0, 0.26, 0.05, 0.22, 0.06, 0.75, wd, -0.12, 0, 0);
    for (const [x, z] of [[-0.12, 0.38], [0.12, 0.38], [0, -0.3]]) k.Beam('wood', O, [x * 1.4, 0, z * 1.1], [x * 0.5, 0.3, z * 0.85], 0.025, tint(wd, -0.15));
    for (const x of [-0.07, 0.07]) k.Beam('wood', O, [x, 0.3, -0.12], [x, 0.78, -0.17], 0.022, wd);
    k.P('wood', O, 'torus', 0, 0.78, -0.17, 0.62, 0.3, 0.62, wd, 0, 0, HALF);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI;
      k.Beam('wood', O, [0, 0.78 + Math.cos(a) * 0.36, -0.17 + Math.sin(a) * 0.36], [0, 0.78 - Math.cos(a) * 0.36, -0.17 - Math.sin(a) * 0.36], 0.012, wd);
    }
    k.C('wood', O, 0, 0.3, 0.3, 0.025, 0.45, wd, 'cyl6');
    k.S('fabric', O, 0, 0.8, 0.3, 0.11, wool, 'ico');
    k.B('wood', O, 0, 0.03, -0.05, 0.2, 0.03, 0.3, tint(wd, -0.2), 0.15, 0, 0);
  },
  grindstone: (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a6a3a'), st = c('stone', '#9a958a');
    for (const x of [-0.24, 0.24]) {
      k.B('wood', O, x, 0.32, 0, 0.07, 0.07, 0.8, wd);
      for (const z of [-0.32, 0.32]) k.Beam('wood', O, [x * 1.15, 0, z * 1.1], [x, 0.36, z], 0.03, tint(wd, -0.15));
      k.B('wood', O, x, 0.39, 0, 0.06, 0.2, 0.06, wd);
    }
    k.P('stone', O, 'cyl16', 0, 0.62, 0, 0.62, 0.14, 0.62, st, 0, 0, HALF);
    k.Beam('metal', O, [-0.3, 0.62, 0], [0.36, 0.62, 0], 0.02, IRON);
    k.Beam('metal', O, [0.36, 0.62, 0], [0.36, 0.48, 0.12], 0.016, IRON);
    k.Beam('wood', O, [0.36, 0.48, 0.12], [0.46, 0.48, 0.12], 0.025, DARKWOOD);
    k.B('wood', O, 0, 0.18, 0, 0.3, 0.1, 0.36, DARKWOOD);
    k.P('deco', O, 'flat', 0, 0.285, 0, 0.26, 1, 0.32, '#3a5a6a');
  },
  'tool-crate': (k, O, w, d, R, c) => {
    const wd = c('wood', '#c4955a'), m = c('metal', '#7d8186');
    crate(k, O, 0.62, 0, wd);
    k.P('cave', O, 'flat', 0, 0.625, 0, 0.56, 1, 0.56, '#2a2420');
    // a pick, a shovel and a hammer poking out of the open top
    k.Beam('wood', O, [-0.12, 0.4, -0.1], [-0.2, 1.15, -0.16], 0.025, DARKWOOD);
    k.Beam('metal', O, [-0.42, 1.08, -0.16], [0.02, 1.2, -0.16], 0.03, m);
    k.Beam('wood', O, [0.1, 0.4, 0.05], [0.18, 1.05, 0.12], 0.022, DARKWOOD);
    k.B('metal', O, 0.19, 1.03, 0.12, 0.2, 0.26, 0.02, m, 0, 0.1, -0.12);
    k.Beam('wood', O, [0.05, 0.4, -0.15], [0.12, 0.85, -0.2], 0.018, DARKWOOD);
    k.B('metal', O, 0.12, 0.84, -0.2, 0.06, 0.06, 0.16, m);
  },
  'cobbler-bench': (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a6a3a'), lth = c('leather', '#8a5a32');
    k.B('wood', O, 0, 0.4, 0, w * 0.88, 0.07, d * 0.5, wd);
    for (const x of [-1, 1]) for (const z of [-1, 1]) k.B('wood', O, x * w * 0.38, 0, z * d * 0.18, 0.07, 0.4, 0.07, tint(wd, -0.2));
    k.B('wood', O, -w * 0.3, 0.47, 0, 0.36, 0.06, d * 0.44, tint(wd, -0.15));
    for (let i = 0; i < 4; i++) k.S('metal', O, -w * 0.3 + (R() - 0.5) * 0.25, 0.53, (R() - 0.5) * 0.3, 0.025, IRON);
    // shoe last on its post
    k.C('metal', O, w * 0.05, 0.47, 0, 0.025, 0.3, IRON, 'cyl6');
    k.B('metal', O, w * 0.07, 0.77, 0, 0.22, 0.06, 0.08, IRON);
    // a pair of boots and a rolled hide under the bench
    for (const z of [-0.18, 0.08]) {
      k.C('fabric', O, w * 0.3, 0.47, z, 0.06, 0.24, lth, 'cyl16');
      k.B('fabric', O, w * 0.3 + 0.06, 0.47, z, 0.2, 0.07, 0.11, tint(lth, -0.15));
    }
    k.P('fabric', O, 'cyl16', 0, 0.09, 0, 0.18, w * 0.5, 0.18, tint(lth, 0.1), 0, 0, HALF);
  },
  pickaxes: (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a744a'), m = c('metal', '#6c6f73');
    const pick = (x: number, z: number, a: number) => {
      const S = sub(O, x, z, a);
      k.Beam('wood', S, [0, 0.03, -0.35], [0, 0.03, 0.35], 0.022, wd);
      k.Beam('metal', S, [0, 0.04, -0.37], [-0.22, 0.05, -0.32], 0.025, m, 'cone');
      k.Beam('metal', S, [0, 0.04, -0.37], [0.22, 0.05, -0.32], 0.025, m, 'cone');
    };
    pick(-0.12, 0, 0.4);
    pick(0.15, 0.05, -0.7);
    const S = sub(O, 0.05, -0.05, 1.4);
    k.Beam('wood', S, [0, 0.025, -0.05], [0, 0.025, 0.42], 0.02, wd);
    k.B('metal', S, 0, 0.01, -0.16, 0.2, 0.02, 0.24, m);
  },

  // ---------------- vehicle ----------------
  cart: (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#9a6a3a'), load = c('load', '#d9bf6a'), v = p.v ?? 0;
    k.B('wood', O, 0, 0.45, 0.1, w * 0.78, 0.07, d * 0.55, wd);
    for (const x of [-1, 1]) k.B('wood', O, x * w * 0.38, 0.52, 0.1, 0.04, 0.18, d * 0.55, tint(wd, -0.15));
    k.B('wood', O, 0, 0.52, 0.1 + d * 0.27, w * 0.78, 0.18, 0.04, tint(wd, -0.15));
    for (const x of [-1, 1]) {
      wheel(k, O, x * w * 0.44, 0.25, 0.3, DARKWOOD);
      k.Beam('wood', O, [x * w * 0.3, 0.5, -d * 0.15], [x * w * 0.3, 0.62, -d * 0.47], 0.025, tint(wd, -0.15));
    }
    k.Beam('wood', O, [0, 0.45, d * 0.36], [0, 0, d * 0.4], 0.03, DARKWOOD);
    if (v === 1) k.P('fabric', O, 'hemi', 0, 0.52, 0.1, w * 0.74, 0.5, d * 0.52, load);
    else if (v === 2) {
      crate(k, sub(O, 0, -0.15), 0.38, 0.52);
      crate(k, sub(O, 0.04, 0.4, 0.3), 0.32, 0.52);
    } else if (v === 3) for (let i = 0; i < 3; i++) k.S('fabric', O, i % 2 ? 0.1 : -0.1, 0.68, -0.25 + i * 0.32, 0.2, ROPE, 'ico');
  },
  'merchant-cart': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#9a6a3a'), cv = c('canvas', '#e6dcc6');
    k.B('wood', O, 0, 0.6, 0, w * 0.76, 0.1, d * 0.84, wd);
    for (const x of [-1, 1]) for (const z of [-0.8, 0.8]) wheel(k, O, x * w * 0.44, z, 0.42, DARKWOOD);
    // canvas cover over the back half
    const zc = -0.5, L = 1.6;
    k.B('fabric', O, 0, 0.7, zc, w * 0.74, 0.55, L, cv);
    k.P('fabric', O, 'cyl16', 0, 1.25, zc, w * 0.74, L, 0.9, cv, HALF, 0, 0);
    if (p.v === 3) for (const dz of [-0.55, 0, 0.55]) k.P('fabric', O, 'cyl16', 0, 1.25, zc + dz, w * 0.75, 0.14, 0.92, '#e6dcc6', HALF, 0, 0);
    // goods at the front, driver bench, shafts
    k.B('wood', O, -0.3, 0.7, 0.55, 0.36, 0.3, 0.34, '#9a7048');
    k.B('wood', O, 0.2, 0.7, 0.5, 0.3, 0.24, 0.3, '#8a6040', 0, 0.3, 0);
    k.C('wood', O, 0.45, 0.7, 0.72, 0.15, 0.36, WOOD, 'cyl16');
    k.B('wood', O, 0, 0.7, 1.12, w * 0.7, 0.3, 0.26, tint(wd, -0.1));
    for (const x of [-0.35, 0.35]) k.Beam('wood', O, [x, 0.55, 1.2], [x * 0.8, 0.45, 1.48], 0.03, DARKWOOD);
  },
  wagon: (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#8a623c'), m = c('metal', '#6c6f73'), cv = c('canvas', '#e6dcc4'), v = p.v ?? 0;
    k.B('wood', O, 0, 0.55, 0.1, w * 0.74, 0.08, d * 0.75, wd);
    for (const x of [-1, 1]) k.B('wood', O, x * w * 0.36, 0.63, 0.1, 0.05, 0.3, d * 0.75, tint(wd, -0.12));
    for (const z of [-1, 1]) k.B('wood', O, 0, 0.63, 0.1 + z * d * 0.37, w * 0.74, 0.3, 0.05, tint(wd, -0.12));
    for (const x of [-1, 1]) for (const z of [-0.65, 0.85]) wheel(k, O, x * w * 0.42, z, 0.4, tint(wd, -0.2), m);
    // shaft forward (to the top)
    k.Beam('wood', O, [-0.25, 0.4, -d * 0.27], [0, 0.35, -d * 0.49], 0.035, DARKWOOD);
    k.Beam('wood', O, [0.25, 0.4, -d * 0.27], [0, 0.35, -d * 0.49], 0.035, DARKWOOD);
    if (v === 1 || v === 3) {
      k.P('fabric', O, 'cyl16', 0, 0.95, 0.1, w * 0.74, d * 0.7, 1.1, cv, HALF, 0, 0);
      for (const z of [-1, 1]) k.P('fabric', O, 'disc', 0, 0.95, 0.1 + z * d * 0.35, w * 0.72, 1, 1.08, tint(cv, -0.15), z * HALF, 0, 0);
    } else if (v === 2) {
      crate(k, sub(O, -0.3, -0.35), 0.5, 0.63);
      crate(k, sub(O, 0.3, 0.2, 0.25), 0.45, 0.63);
      for (let i = 0; i < 3; i++) k.S('fabric', O, -0.3 + i * 0.25, 0.85, 0.75, 0.2, ROPE, 'ico');
    }
  },
  handcart: (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#9a744a'), m = c('metal', '#6c6f73'), v = p.v ?? 0;
    k.B('wood', O, 0, 0.42, 0.2, w * 0.7, 0.06, d * 0.45, wd);
    for (const x of [-1, 1]) {
      k.B('wood', O, x * w * 0.34, 0.48, 0.2, 0.04, 0.2, d * 0.45, tint(wd, -0.15));
      wheel(k, O, x * w * 0.42, 0.25, 0.3, tint(wd, -0.25), m);
      k.Beam('wood', O, [x * w * 0.28, 0.45, -d * 0.02], [x * w * 0.3, 0.75, -d * 0.47], 0.025, tint(wd, -0.15));
    }
    k.Beam('wood', O, [-w * 0.3, 0.75, -d * 0.44], [w * 0.3, 0.75, -d * 0.44], 0.022, DARKWOOD);
    k.Beam('wood', O, [0, 0.42, d * 0.42], [0, 0, d * 0.44], 0.03, DARKWOOD);
    if (v === 1) for (let i = 0; i < 3; i++) k.S('fabric', O, i % 2 ? 0.1 : -0.1, 0.65, -0.05 + i * 0.25, 0.18, ROPE, 'ico');
    else if (v === 2) for (let i = 0; i < 9; i++) k.S('fabric', O, (R() - 0.5) * 0.5, 0.56 + R() * 0.1, 0.2 + (R() - 0.5) * 0.7, 0.08, ['#c0392b', '#7ab04a', '#e0782a'][i % 3]);
  },
  'ship-mast': (k, O, w, d, R, c) => {
    const wd = c('wood', '#8a623c'), m = c('metal', '#6c6f73');
    k.C('wood', O, 0, 0, 0, 0.2, 2.4, wd, 'cyl16');
    for (const y of [0.5, 1.5]) k.Ring('metal', O, 0, y, 0, 0.205, 0.04, m);
    // pin rail with belaying pins
    k.B('wood', O, 0, 0.72, 0.36, 0.8, 0.07, 0.12, tint(wd, 0.1));
    for (const x of [-0.34, 0.34]) k.B('wood', O, x, 0, 0.36, 0.07, 0.72, 0.07, tint(wd, -0.15));
    for (let i = 0; i < 5; i++) k.C('wood', O, -0.24 + i * 0.12, 0.62, 0.36, 0.02, 0.3, DARKWOOD, 'cyl6');
    // coiled line on deck and one running up the mast
    k.P('fabric', O, 'torus', 0.25, 0.04, -0.3, 0.32, 0.6, 0.32, ROPE);
    k.P('fabric', O, 'torus', 0.25, 0.1, -0.3, 0.24, 0.6, 0.24, ROPE);
    k.Sag('fabric', O, [-0.2, 0.75, 0.36], [-0.15, 2.4, 0.1], -0.05, 0.012, ROPE, 3);
  },
  'crows-nest': (k, O, w, d, R, c) => {
    const wd = c('wood', '#8a623c'), y = 1.85;
    k.C('wood', O, 0, 0, 0, 0.12, 2.4, tint(wd, -0.1), 'cyl16');
    k.C('wood', O, 0, y, 0, 0.42, 0.06, wd, 'cyl16');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      k.C('wood', O, Math.cos(a) * 0.39, y + 0.06, Math.sin(a) * 0.39, 0.02, 0.36, wd, 'cyl6');
    }
    k.Ring('wood', O, 0, y + 0.42, 0, 0.4, 0.05, wd);
    k.Ring('wood', O, 0, y + 0.24, 0, 0.4, 0.03, wd);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.5;
      k.Beam('wood', O, [Math.cos(a) * 0.1, y - 0.45, Math.sin(a) * 0.1], [Math.cos(a) * 0.35, y, Math.sin(a) * 0.35], 0.025, tint(wd, -0.2));
    }
  },
  'ship-wheel': (k, O, w, d, R, c) => {
    const wd = c('wood', '#8a623c'), m = c('metal', '#c9a24a'), y = 1.05, z = -0.08;
    k.B('wood', O, 0, 0, z, 0.36, 0.08, 0.3, tint(wd, -0.2));
    k.B('wood', O, 0, 0.08, z, 0.18, y - 0.1, 0.18, wd);
    k.P('wood', O, 'torus', 0, y, z + 0.14, 0.62, 0.4, 0.62, wd, HALF, 0, 0);
    k.P('metal', O, 'ring', 0, y, z + 0.14, 0.42, 0.5, 0.42, m, HALF, 0, 0);
    k.P('metal', O, 'cyl16', 0, y, z + 0.13, 0.12, 0.1, 0.12, m, HALF, 0, 0);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI + Math.PI / 8;
      k.Beam('wood', O, [Math.cos(a) * 0.5, y + Math.sin(a) * 0.5, z + 0.14], [-Math.cos(a) * 0.5, y - Math.sin(a) * 0.5, z + 0.14], 0.018, wd);
    }
  },
  cannon: (k, O, w, d, R, c) => {
    const m = c('metal', '#3c4044'), wd = c('wood', '#7a5638');
    for (const x of [-0.17, 0.17]) k.B('wood', O, x, 0.12, 0.15, 0.08, 0.32, 0.95, wd);
    k.B('wood', O, 0, 0.12, 0.15, 0.3, 0.08, 0.95, tint(wd, -0.15));
    for (const x of [-0.27, 0.27]) for (const z of [-0.25, 0.5]) k.P('wood', O, 'cyl16', x, 0.17, z, 0.34, 0.07, 0.34, tint(wd, -0.25), 0, 0, HALF);
    // barrel, muzzle to the top
    k.Beam('metal', O, [0, 0.5, 0.6], [0, 0.56, -0.85], 0.12, m, 'cyl16');
    k.Beam('metal', O, [0, 0.49, 0.7], [0, 0.5, 0.45], 0.15, m, 'cyl16');
    k.P('metal', O, 'cyl16', 0, 0.56, -0.82, 0.32, 0.1, 0.32, m, HALF, 0, 0);
    k.P('glow', O, 'disc', 0, 0.56, -0.875, 0.16, 1, 0.16, '#060606', -HALF, 0, 0);
    k.S('metal', O, 0, 0.49, 0.78, 0.07, m);
    for (let i = 0; i < 3; i++) k.S('metal', O, 0.2 + (i % 2) * 0.1, 0.06, 0.72 + i * 0.07, 0.06, '#26282b');
  },
  anchor: (k, O, w, d, R, c) => {
    const m = c('metal', '#4e5358'), y = 0.05;
    k.Beam('metal', O, [0, y, -0.38], [0, y, 0.3], 0.04, m);
    k.Beam('metal', O, [-0.3, y, -0.32], [0.3, y, -0.32], 0.03, m);
    k.P('metal', O, 'torus', 0, y, -0.43, 0.14, 0.4, 0.14, m);
    for (const s of [-1, 1]) {
      k.Beam('metal', O, [0, y, 0.32], [s * 0.3, y, 0.18], 0.04, m);
      k.P('metal', O, 'pyr', s * 0.3, y, 0.1, 0.16, 0.18, 0.06, m, HALF, 0, s * 0.4);
    }
    k.S('metal', O, 0, y, 0.33, 0.06, m);
    const pts = [[0, -0.5], [0.2, -0.42], [0.35, -0.2], [0.42, 0.05]];
    for (let i = 1; i < pts.length; i++) k.Beam('metal', O, [pts[i - 1][0], 0.025, pts[i - 1][1]], [pts[i][0], 0.025, pts[i][1]], 0.022, tint(m, -0.2), 'cyl6');
  },
  'sails-pile': (k, O, w, d, R, c, p) => {
    const cv = c('canvas', '#e6dcc4');
    for (let i = 0; i < 4; i++) {
      const x = -w * 0.32 + i * w * 0.2 + (R() - 0.5) * 0.1;
      k.P('fabric', O, 'ico', x, 0.12, (R() - 0.5) * 0.25, 0.6 + R() * 0.25, 0.32 + R() * 0.18, 0.55 + R() * 0.2, tint(cv, (R() - 0.5) * 0.15), 0, R() * 3, 0);
    }
    k.P('fabric', O, 'cyl16', 0, 0.38, 0.12, 0.2, w * 0.7, 0.2, tint(cv, -0.06), 0, 0.15, HALF);
    k.P('fabric', O, 'torus', w * 0.36, 0.04, -0.28, 0.28, 0.6, 0.28, ROPE);
    if (p.v === 3) for (let i = 0; i < 3; i++) k.P('fabric', O, 'box', -0.5 + i * 0.45, 0.3, 0.2 - i * 0.1, 0.16, 0.06, 0.16, tint(cv, -0.3), 0.3, i, 0);
  },
  'cargo-hatch': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#8a623c'), bin: Bin = p.v === 1 ? 'metal' : 'wood', s = 0.82;
    k.P('glow', O, 'flat', 0, 0.01, 0, s - 0.06, 1, s - 0.06, '#0a0908');
    for (const z of [-1, 1]) k.B(bin, O, 0, 0, z * s * 0.47, s, 0.1, 0.06, tint(wd, -0.1));
    for (const x of [-1, 1]) k.B(bin, O, x * s * 0.47, 0, 0, 0.06, 0.1, s - 0.12, tint(wd, -0.1));
    if (p.v === 2) k.B('wood', O, 0, 0.08, -0.44, s - 0.04, 0.7, 0.04, wd, -0.2, 0, 0);
    else
      for (let i = 0; i < 5; i++) {
        const t = -s * 0.36 + i * s * 0.18;
        k.B(bin, O, t, 0.06, 0, 0.04, 0.04, s - 0.1, wd);
        k.B(bin, O, 0, 0.07, t, s - 0.1, 0.03, 0.04, wd);
      }
  },
  gangplank: (k, O, w, d, R, c) => {
    const wd = c('wood', '#9a744a');
    k.B('wood', O, 0, 0, 0, 0.6, 0.06, d * 0.94, wd);
    for (let i = 0; i < 6; i++) k.B('wood', O, 0, 0.06, -d * 0.4 + i * d * 0.16, 0.56, 0.03, 0.05, tint(wd, -0.2));
    for (const x of [-0.36, 0.36]) {
      for (const z of [-1, 1]) k.C('wood', O, x, 0, z * d * 0.44, 0.03, 0.7, DARKWOOD, 'cyl6');
      k.Sag('fabric', O, [x, 0.66, -d * 0.44], [x, 0.66, d * 0.44], 0.14, 0.015, ROPE, 4);
    }
  },
  rowboat: (k, O, w, d, R, c) => {
    const wd = c('wood', '#8a623c'), paint = c('paint', '#2f5d8a');
    hull(k, O, w * 0.82, d * 0.9, 0.36, paint, tint(wd, -0.1), tint(wd, -0.3));
    for (const z of [-0.25, 0.35]) k.B('wood', O, 0, 0.35, z, w * 0.74, 0.04, 0.16, wd);
    k.Beam('wood', O, [-0.22, 0.345, -0.5], [0.12, 0.345, 0.55], 0.02, tint(wd, 0.15));
    k.Beam('wood', O, [0.22, 0.345, -0.5], [-0.1, 0.345, 0.5], 0.02, tint(wd, 0.15));
    k.B('wood', O, 0.12, 0.34, 0.6, 0.1, 0.02, 0.25, tint(wd, 0.15), 0, 0.3, 0);
  },
  canoe: (k, O, w, d, R, c) => {
    const wd = c('wood', '#a8794a'), bark = c('bark', '#a8794a');
    hull(k, O, w * 0.5, d * 0.94, 0.26, bark, tint(wd, -0.1), tint(wd, -0.25));
    k.B('wood', O, 0, 0.25, 0, w * 0.44, 0.03, 0.1, wd);
    k.Beam('wood', O, [-0.08, 0.26, -0.45], [0.06, 0.26, 0.3], 0.018, tint(wd, 0.15));
    k.B('wood', O, 0.07, 0.245, 0.42, 0.12, 0.02, 0.26, tint(wd, 0.15), 0, -0.18, 0);
  },
  'mine-cart': (k, O, w, d, R, c, p) => {
    const m = c('metal', '#5a5e63'), wd = c('wood', '#7a5638');
    k.B('metal', O, 0, 0.16, 0, 0.62, 0.46, 0.78, m);
    for (const z of [-1, 1]) k.B('wood', O, 0, 0.54, z * 0.39, 0.66, 0.08, 0.04, wd);
    for (const x of [-1, 1]) k.B('wood', O, x * 0.31, 0.54, 0, 0.04, 0.08, 0.8, wd);
    for (const x of [-1, 1]) for (const z of [-0.25, 0.25]) k.P('metal', O, 'cyl16', x * 0.33, 0.12, z, 0.24, 0.06, 0.24, tint(m, -0.3), 0, 0, HALF);
    if (p.v !== 1) {
      const load = c('load', '#4e4b48'), glint = c('glint', '#c97a4a');
      k.P('cave', O, 'hemi', 0, 0.62, 0, 0.56, 0.32, 0.72, load);
      for (let i = 0; i < 5; i++) k.S('cave', O, (R() - 0.5) * 0.4, 0.68 + R() * 0.06, (R() - 0.5) * 0.55, 0.07, tint(load, (R() - 0.5) * 0.3), 'ico');
      for (let i = 0; i < 4; i++) k.S('metal', O, (R() - 0.5) * 0.35, 0.72, (R() - 0.5) * 0.5, 0.035, glint, 'oct');
    } else k.P('cave', O, 'flat', 0, 0.623, 0, 0.56, 1, 0.72, '#1e1c1a');
  },

  // ---------------- treasure ----------------
  coffer: (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#5a2a3a'), m = c('metal', '#e2b84a');
    for (const x of [-1, 1]) for (const z of [-1, 1]) k.S('metal', O, x * 0.22, 0.03, z * 0.15, 0.035, m);
    k.B('wood', O, 0, 0.03, 0, 0.5, 0.24, 0.34, wd);
    for (const x of [-0.17, 0.17]) k.B('metal', O, x, 0.03, 0, 0.035, 0.245, 0.35, m);
    if (p.v === 3) {
      k.B('wood', O, 0, 0.27, -0.2, 0.5, 0.26, 0.05, wd, -0.3, 0, 0);
      k.P('fabric', O, 'flat', 0, 0.272, 0, 0.46, 1, 0.3, '#7a1f2b');
      for (let i = 0; i < 6; i++) k.S('glow', O, (R() - 0.5) * 0.36, 0.29, (R() - 0.5) * 0.2, 0.035, GEMS[i], 'oct');
    } else {
      k.P('wood', O, 'cyl16', 0, 0.27, 0, 0.2, 0.5, 0.34, wd, 0, 0, HALF);
      k.B('metal', O, 0, 0.2, 0.17, 0.08, 0.1, 0.03, m);
    }
  },
  safe: (k, O, w, d, R, c) => {
    const m = c('metal', '#4e5257'), tr = c('trim', '#c9a24a');
    for (const x of [-1, 1]) for (const z of [-1, 1]) k.B('metal', O, x * 0.3, 0, z * 0.27, 0.1, 0.06, 0.1, tint(m, -0.3));
    k.B('metal', O, 0, 0.06, 0, 0.76, 0.94, 0.68, m);
    k.B('metal', O, 0, 1.0, 0, 0.8, 0.05, 0.72, tint(m, -0.15));
    // door on the front with dial, handle and hinges
    k.B('metal', O, 0, 0.16, 0.345, 0.6, 0.74, 0.025, tint(m, 0.08));
    k.P('metal', O, 'cyl16', 0.1, 0.62, 0.37, 0.16, 0.04, 0.16, tr, HALF, 0, 0);
    k.Beam('metal', O, [-0.12, 0.45, 0.37], [-0.12, 0.45, 0.43], 0.015, tr);
    k.Beam('metal', O, [-0.2, 0.45, 0.43], [-0.04, 0.45, 0.43], 0.015, tr);
    for (const y of [0.3, 0.75]) k.C('metal', O, -0.33, y, 0.36, 0.025, 0.12, tr, 'cyl6');
  },
  'loot-sacks': (k, O, w, d, R, c) => {
    const cl = c('cloth', '#8a6a44'), g = c('gold', '#e9b949');
    const bags: number[][] = [[-0.15, -0.12, 0.22], [0.18, -0.05, 0.18], [0, 0.2, 0.15]];
    for (const [x, z, r] of bags) {
      k.S('fabric', O, x, r * 0.9, z, r, cl, 'ico');
      k.C('fabric', O, x, r * 1.75, z, r * 0.28, r * 0.5, tint(cl, -0.15), 'cyl6');
      k.Ring('fabric', O, x, r * 1.8, z, r * 0.3, 0.02, '#c9b07a');
    }
    for (let i = 0; i < 7; i++) k.C('metal', O, 0.12 + (R() - 0.5) * 0.4, 0, 0.25 + (R() - 0.5) * 0.25, 0.035, 0.012, g, 'cyl16');
  },
  'coins-small': (k, O, w, d, R, c) => {
    const g = c('gold', '#e9b949');
    for (let i = 0; i < 12; i++) {
      const x = (R() - 0.5) * 0.7, z = (R() - 0.5) * 0.7;
      if (i % 4 === 3) k.P('metal', O, 'cyl16', x, 0.025, z, 0.07, 0.012, 0.07, g, 0.9, R() * 3, 0);
      else k.C('metal', O, x, 0.002, z, 0.035, 0.01, g, 'cyl16');
    }
  },
  'coins-large': (k, O, w, d, R, c, p) => {
    const g = c('gold', '#e9b949');
    k.P('metal', O, 'hemi', 0, 0, 0, w * 0.82, 0.9, d * 0.76, g);
    k.P('metal', O, 'hemi', w * 0.25, 0, d * 0.22, w * 0.42, 0.55, d * 0.4, tint(g, -0.08));
    k.P('metal', O, 'hemi', -w * 0.24, 0, -d * 0.2, w * 0.38, 0.5, d * 0.36, tint(g, 0.05));
    for (let i = 0; i < 10; i++) {
      const a = R() * TAU, r = 0.65 + R() * 0.25;
      k.P('metal', O, 'cyl16', Math.cos(a) * r, 0.01, Math.sin(a) * r, 0.08, 0.015, 0.08, g, (R() - 0.5) * 0.6, 0, (R() - 0.5) * 0.6);
    }
    k.S('glow', O, 0.15, 0.42, -0.05, 0.05, '#c0392b', 'oct');
    k.S('glow', O, -0.2, 0.38, 0.1, 0.045, '#2f7fd6', 'oct');
    if (p.v === 2) {
      // a sword stuck in the heap, a shield and a goblet
      k.Beam('metal', O, [0.1, 0.25, 0.1], [0.25, 1.05, 0.05], 0.02, '#b8bcc4');
      k.B('metal', O, 0.22, 0.86, 0.06, 0.24, 0.03, 0.04, GOLD);
      k.P('metal', O, 'cyl16', -0.45, 0.35, 0.3, 0.55, 0.05, 0.55, '#7a2f2f', 0.9, 0.5, 0);
      k.C('metal', O, 0.5, 0.3, -0.35, 0.06, 0.18, g, 'cyl16');
    }
  },
  'gem-bowl': (k, O, w, d, R, c) => {
    const m = c('metal', '#e2b84a');
    k.C('metal', O, 0, 0, 0, 0.13, 0.06, m, 'cyl16');
    k.C('metal', O, 0, 0.06, 0, 0.05, 0.06, m, 'cyl6');
    k.P('metal', O, 'hemi', 0, 0.3, 0, 0.62, 0.36, 0.62, m, Math.PI, 0, 0);
    k.Ring('metal', O, 0, 0.3, 0, 0.31, 0.03, tint(m, 0.15));
    k.P('deco', O, 'hemi', 0, 0.26, 0, 0.56, 0.22, 0.56, '#3a2a4a');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + R(), r = i ? 0.08 + R() * 0.12 : 0;
      k.S('glow', O, Math.cos(a) * r, 0.33 + (0.2 - r) * 0.3, Math.sin(a) * r, 0.045, GEMS[i % GEMS.length], i % 2 ? 'oct' : 'ico');
    }
  },
  'crown-cushion': (k, O, w, d, R, c) => {
    const cu = c('cushion', '#a3312c'), m = c('metal', '#e2b84a');
    k.P('fabric', O, 'sph', 0, 0.1, 0, 0.66, 0.22, 0.66, cu);
    for (const x of [-1, 1]) for (const z of [-1, 1]) k.S('fabric', O, x * 0.26, 0.08, z * 0.26, 0.035, GOLD);
    k.C('metal', O, 0, 0.18, 0, 0.13, 0.09, m, 'cyl16');
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      k.P('metal', O, 'cone', Math.cos(a) * 0.12, 0.31, Math.sin(a) * 0.12, 0.06, 0.1, 0.06, m);
    }
    k.S('glow', O, 0, 0.22, 0.13, 0.025, '#c0392b');
    k.S('glow', O, 0.13, 0.22, 0, 0.022, '#2f7fd6');
  },
  'ore-pile': (k, O, w, d, R, c) => {
    const rock = c('rock', '#5e5a55'), glint = c('glint', '#c97a4a');
    k.S('cave', O, 0, 0.12, 0, 0.3, rock, 'ico');
    for (let i = 0; i < 8; i++) {
      const a = R() * TAU, r = 0.15 + R() * 0.22;
      k.S('cave', O, Math.cos(a) * r, 0.06 + R() * 0.12, Math.sin(a) * r, 0.07 + R() * 0.08, tint(rock, (R() - 0.5) * 0.3), 'ico');
    }
    for (let i = 0; i < 5; i++) {
      const a = R() * TAU, r = R() * 0.3;
      k.S('metal', O, Math.cos(a) * r, 0.18 + (0.3 - r) * 0.5, Math.sin(a) * r, 0.04, glint, 'oct');
    }
  },

  // ---------------- kitchen ----------------
  'hearth-oven': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#9a5a48'), cold = p.v === 3 || !!p.off;
    k.B('stone', O, 0, 0, -0.08, w * 0.86, 0.6, d * 0.8, st);
    k.P('stone', O, 'hemi', 0, 0.6, -0.12, 1.3, 1.1, 0.72, st);
    k.B('stone', O, 0, 0.9, -0.38, 0.28, 1.5, 0.24, tint(st, -0.1));
    k.B('lit', O, 0, 0.55, 0.3, w * 0.5, 0.06, 0.2, STONE);
    k.P(cold ? 'cave' : 'glow', O, 'disc', 0, 0.78, 0.235, 0.36, 1, 0.3, cold ? '#1a1512' : c('fire', '#ffb02e'), HALF, 0, 0);
    // bread peel and firewood
    k.Beam('wood', O, [0.62, 0, 0.42], [0.72, 1.2, 0.05], 0.02, WOOD);
    k.B('wood', O, 0.6, 0, 0.44, 0.24, 0.02, 0.28, WOOD, -0.15, 0, 0);
    for (let i = 0; i < 3; i++) k.P('wood', O, 'cyl6', -0.65 + (i === 2 ? 0.07 : i * 0.14), 0.07 + (i === 2 ? 0.12 : 0), 0.3, 0.13, 0.4, 0.13, '#6a4a2a', HALF, 0, 0);
    return cold ? undefined : 0.75;
  },
  stove: (k, O, w, d, R, c) => {
    const m = c('metal', '#33373c');
    for (const x of [-1, 1]) for (const z of [-1, 1]) k.B('metal', O, x * 0.34, 0, z * 0.26, 0.06, 0.14, 0.06, m);
    k.B('metal', O, 0, 0.14, 0, 0.8, 0.62, 0.64, m);
    k.B('metal', O, 0, 0.76, 0, 0.86, 0.04, 0.7, tint(m, -0.3));
    k.C('metal', O, 0, 0.8, -0.25, 0.07, 1.6, m, 'cyl16');
    // oven door, firebox with a glowing slot, a pot and a kettle
    k.B('metal', O, 0.15, 0.22, 0.32, 0.38, 0.32, 0.02, tint(m, 0.15));
    k.Beam('metal', O, [0.02, 0.46, 0.345], [0.28, 0.46, 0.345], 0.012, '#b8bcc4');
    k.B('metal', O, -0.24, 0.36, 0.32, 0.22, 0.2, 0.02, tint(m, 0.15));
    k.B('glow', O, -0.24, 0.42, 0.333, 0.14, 0.03, 0.005, '#ff7a1a');
    k.C('metal', O, 0.18, 0.8, 0.1, 0.14, 0.18, '#5d6166', 'cyl16');
    k.P('metal', O, 'sph', -0.18, 0.9, 0.12, 0.22, 0.18, 0.22, '#b06a3a');
    k.Beam('metal', O, [-0.1, 0.9, 0.12], [-0.02, 0.95, 0.12], 0.015, '#b06a3a');
  },
  // overhead: everything hangs above 1.5 so tokens pass underneath
  'pot-rack': (k, O, w, d, R, c, p) => {
    const m = c('metal', '#4e5257'), pot = c('pot', '#b06a3a'), y = 2.05, herbs = p.v === 2;
    for (const z of [-0.18, 0.18]) k.Beam('metal', O, [-w * 0.42, y, z], [w * 0.42, y, z], 0.02, m);
    for (const x of [-1, 1]) {
      k.B('metal', O, x * w * 0.42, y - 0.02, 0, 0.04, 0.04, 0.4, m);
      k.Beam('metal', O, [x * w * 0.42, y, 0], [x * w * 0.3, 2.4, 0], 0.01, m);
    }
    for (let i = 0; i < 5; i++) {
      const x = -w * 0.34 + i * w * 0.17, z = i % 2 ? 0.18 : -0.18, hy = y - 0.18 - (i % 3) * 0.08;
      k.Beam('metal', O, [x, y, z], [x, hy + 0.1, z], 0.008, m);
      if (herbs && i % 2) k.P('fabric', O, 'cone', x, hy - 0.05, z, 0.18, 0.3, 0.18, '#5f8a3a', Math.PI, 0, 0);
      else if (i % 2) k.C('metal', O, x, hy - 0.12, z, 0.13, 0.2, pot, 'cyl16');
      else k.P('metal', O, 'cyl16', x, hy - 0.18, z + 0.04, 0.28, 0.04, 0.28, pot, 1.35, 0, 0);
    }
  },
  'produce-crates': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#c4955a'), a = c('a', '#c0392b'), b = c('b', '#7ab04a'), long = p.v === 0;
    const box = (x: number, z: number, col: string, tilt: number) => {
      const S = sub(O, x, z, tilt);
      k.B('wood', S, 0, 0, 0, 0.72, 0.38, 0.6, wd);
      k.B('wood', S, 0, 0.18, 0.305, 0.7, 0.06, 0.02, tint(wd, -0.25));
      k.B('wood', S, 0, 0.18, -0.305, 0.7, 0.06, 0.02, tint(wd, -0.25));
      for (let i = 0; i < 5; i++) {
        const px = ((i % 3) - 1) * 0.2 + (R() - 0.5) * 0.06, pz = (i < 3 ? -0.1 : 0.12) + (R() - 0.5) * 0.06;
        if (long && col === b) k.P('fabric', S, 'cone', px, 0.44, pz, 0.08, 0.32, 0.08, col, HALF, R() * 3, 0);
        else k.S('fabric', S, px, 0.42, pz, 0.1, col);
      }
    };
    box(-w * 0.24, 0.02, a, 0.05);
    box(w * 0.24, -0.02, b, -0.08);
  },
  'fish-crate': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#8a7a62'), fish = c('fish', '#9aaab4');
    k.B('wood', O, 0, 0, 0, 0.78, 0.3, 0.62, wd);
    for (const z of [-1, 1]) k.B('wood', O, 0, 0.14, z * 0.315, 0.76, 0.06, 0.02, tint(wd, -0.25));
    k.B('deco', O, 0, 0.3, 0, 0.72, 0.02, 0.56, '#dfeef2');
    for (let i = 0; i < 5; i++) {
      const S = sub(O, (i - 2) * 0.13, (R() - 0.5) * 0.08, (R() - 0.5) * 0.3), col = p.v === 2 && i % 2 ? '#c0584a' : fish;
      k.P('metal', S, 'sph', 0, 0.35, -0.02, 0.1, 0.07, 0.4, col);
      k.P('metal', S, 'pyr', 0, 0.35, 0.22, 0.12, 0.1, 0.02, tint(col, -0.15), HALF, 0, 0);
    }
  },
  'bread-rack': (k, O, w, d, R, c) => {
    const { z, ys } = shelving(k, O, w, d, c('wood', '#c4955a'), 1.5, 4, 0.4);
    for (let s = 0; s < 3; s++) {
      for (let i = 0; i < 4; i++) {
        const x = -w * 0.36 + i * w * 0.24 + (R() - 0.5) * 0.06, kind = (s + i) % 3;
        if (kind === 0) k.P('fabric', O, 'cyl16', x, ys[s] + 0.05, z, 0.1, 0.36, 0.1, '#c99a5a', 0, 0.3, HALF);
        else if (kind === 1) k.P('fabric', O, 'hemi', x, ys[s], z, 0.28, 0.24, 0.28, '#b8803a');
        else k.P('fabric', O, 'sph', x, ys[s] + 0.07, z, 0.3, 0.15, 0.18, '#a8703a');
      }
    }
  },
  'shelf-jars': (k, O, w, d, R, c) => {
    const { z, ys } = shelving(k, O, w, d, c('wood', '#9a6a3a'), 1.8, 4);
    const jars = ['#c0392b', '#e0b03a', '#7ab04a', '#8a5a32', '#d8cfb8', '#5a2a5a'];
    for (let s = 0; s < 3; s++) {
      for (let i = 0; i < 4; i++) {
        const x = -w * 0.36 + i * w * 0.24 + (R() - 0.5) * 0.06, h = 0.16 + R() * 0.12;
        k.C('deco', O, x, ys[s], z, 0.08, h, jars[Math.floor(R() * jars.length)], 'cyl16');
        if (i % 2 === s % 2) k.C('fabric', O, x, ys[s] + h, z, 0.085, 0.03, '#e6dcc6', 'cyl16');
      }
    }
    k.S('fabric', O, w * 0.25, 0.18, z + 0.28, 0.18, '#d6c7a4', 'ico');
  },
  'butcher-block': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#9a6a3a');
    for (const x of [-1, 1]) for (const z of [-1, 1]) k.B('wood', O, x * 0.26, 0, z * 0.26, 0.09, 0.6, 0.09, tint(wd, -0.2));
    k.B('wood', O, 0, 0.6, 0, 0.72, 0.26, 0.72, wd);
    k.B('wood', O, 0, 0.15, 0, 0.56, 0.04, 0.56, tint(wd, -0.15));
    // cleaver bitten into the block, a joint of meat
    k.B('metal', O, 0.12, 0.83, -0.05, 0.03, 0.14, 0.24, '#b8bcc4', 0, 0.4, 0.1);
    k.Beam('wood', O, [0.13, 0.93, -0.05], [0.2, 1.08, -0.08], 0.02, DARKWOOD);
    k.P('fabric', O, 'sph', -0.15, 0.93, 0.1, 0.32, 0.18, 0.24, '#b85a5a');
    k.Beam('lit', O, [-0.3, 0.92, 0.1], [-0.36, 0.94, 0.1], 0.025, '#eae2cc');
    if (p.v === 1) {
      k.P('deco', O, 'disc', 0.05, 0.865, 0.15, 0.3, 1, 0.22, '#6a1414');
      k.P('deco', O, 'disc', 0.2, 0.006, 0.42, 0.4, 1, 0.3, '#5a1212');
    }
  },
  'milk-churn': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#c4955a'), m = c('metal', '#6c6f73'), bin: Bin = p.v === 2 ? 'metal' : 'wood';
    k.C(bin, O, -0.08, 0, 0, 0.2, 0.8, wd, 'cyl16');
    k.C(bin, O, -0.08, 0.8, 0, 0.16, 0.05, tint(wd, -0.15), 'cyl16');
    for (const y of [0.15, 0.62]) k.Ring('metal', O, -0.08, y, 0, 0.205, 0.03, m);
    k.C('wood', O, -0.08, 0.85, 0, 0.02, 0.45, DARKWOOD, 'cyl6');
    // a milk pail beside it
    k.C(bin, O, 0.26, 0, 0.2, 0.13, 0.24, wd, 'cyl16');
    k.Ring('metal', O, 0.26, 0.2, 0.2, 0.135, 0.02, m);
    k.P('deco', O, 'disc', 0.26, 0.245, 0.2, 0.22, 1, 0.22, '#f4f1e8');
  },

  // ---------------- nature ----------------
  'tree-palm': (k, O, w, d, R, c) => {
    const leaf = c('leaf', '#5c8f3a'), H = 3.0, lean = 0.3, a0 = R() * TAU;
    const pt = (t: number) => [Math.cos(a0) * lean * t * t, H * t, Math.sin(a0) * lean * t * t];
    for (let i = 0; i < 4; i++) k.Beam('wood', O, pt(i / 4), pt((i + 1) / 4), 0.13 - i * 0.015, i % 2 ? '#8a6a48' : '#7a5c3c', 'cyl6');
    const [tx, ty, tz] = pt(1);
    for (let i = 0; i < 7; i++) frond(k, O, tx, ty, tz, (i / 7) * TAU + R() * 0.4, 0.35 + R() * 0.3, Math.min(w, d) * 0.5, 0.3, tint(leaf, (R() - 0.5) * 0.2));
    for (let i = 0; i < 3; i++) k.S('wood', O, tx + Math.cos(i * 2.1) * 0.12, ty - 0.12, tz + Math.sin(i * 2.1) * 0.12, 0.08, '#5a3d24');
  },
  flowers: (k, O, w, d, R, c) => {
    const cols = [c('a', '#e85d75'), c('b', '#f2d14b'), c('cc', '#8fb6ea')], grass = c('grass', '#5f8a3a');
    k.P('fabric', O, 'disc', 0, 0.006, 0, 0.85, 1, 0.8, grass);
    for (let i = 0; i < 4; i++) frond(k, O, (R() - 0.5) * 0.4, 0.01, (R() - 0.5) * 0.4, R() * TAU, -0.5, 0.2, 0.06, tint(grass, 0.1));
    for (let i = 0; i < 7; i++) {
      const x = (R() - 0.5) * 0.65, z = (R() - 0.5) * 0.65, h = 0.12 + R() * 0.14;
      k.C('fabric', O, x, 0, z, 0.008, h, grass, 'cyl6');
      k.S('deco', O, x, h, z, 0.035 + R() * 0.015, cols[i % 3]);
    }
  },
  ferns: (k, O, w, d, R, c) => {
    const leaf = c('leaf', '#4f8a3a');
    for (let i = 0; i < 8; i++) frond(k, O, 0, 0.08, 0, (i / 8) * TAU + R() * 0.4, -0.35 - R() * 0.4, 0.38 + R() * 0.1, 0.16, tint(leaf, (R() - 0.5) * 0.2));
    for (let i = 0; i < 2; i++) k.P('fabric', O, 'torus', (R() - 0.5) * 0.15, 0.25 + i * 0.05, (R() - 0.5) * 0.15, 0.08, 0.6, 0.08, tint(leaf, 0.2), HALF, R() * 3, 0);
    k.S('fabric', O, 0, 0.04, 0, 0.12, tint(leaf, -0.3), 'ico');
  },
  reeds: (k, O, w, d, R, c) => {
    const leaf = c('leaf', '#6f8a42'), head = c('head', '#6b4228');
    k.P('deco', O, 'disc', 0, 0.006, 0, 0.8, 1, 0.75, '#4a4a2e');
    for (let i = 0; i < 11; i++) {
      const x = (R() - 0.5) * 0.65, z = (R() - 0.5) * 0.65, h = 0.8 + R() * 0.55, tx = x + (R() - 0.5) * 0.2, tz = z + (R() - 0.5) * 0.2;
      k.Beam('fabric', O, [x, 0, z], [tx, h, tz], 0.014, tint(leaf, (R() - 0.5) * 0.2), 'cyl6');
      if (i % 2 === 0) k.Beam('fabric', O, [x + (tx - x) * 0.8, h * 0.8, z + (tz - z) * 0.8], [x + (tx - x) * 0.93, h * 0.93, z + (tz - z) * 0.93], 0.035, head, 'cyl6');
    }
  },
  'lily-pads': (k, O, w, d, R, c, p) => {
    const leaf = c('leaf', '#4f8a3a'), fl = c('flower', '#f2b6c9');
    const pads: number[][] = [[-0.18, -0.15, 0.36], [0.2, -0.05, 0.3], [-0.05, 0.22, 0.28], [0.28, 0.28, 0.18]];
    pads.forEach(([x, z, s], i) => k.P('deco', O, 'disc', x, 0.008 + i * 0.003, z, s, 1, s, tint(leaf, i % 2 ? 0.1 : -0.05)));
    if (p.v !== 2)
      for (const [x, z] of [[-0.18, -0.15], [-0.05, 0.22]]) {
        k.P('deco', O, 'cone', x, 0.06, z, 0.12, 0.09, 0.12, fl);
        k.S('deco', O, x, 0.045, z, 0.03, '#f2d14b');
      }
  },
  // overhead: a stalk with the cap above token height
  'mushroom-giant': (k, O, w, d, R, c) => {
    const cap = c('cap', '#9a4a3a'), spot = c('spot', '#e9dcc0'), H = 2.1, rx = w * 0.46, ry = 0.5, rz = d * 0.46;
    k.S('lit', O, 0, 0.15, 0, 0.28, '#d9d0bc');
    k.C('lit', O, 0, 0, 0, 0.18, H, '#e3dac6', 'cyl16');
    k.Ring('lit', O, 0, H * 0.7, 0, 0.26, 0.06, '#d9d0bc');
    k.P('fabric', O, 'hemi', 0, H, 0, rx * 2, ry * 2, rz * 2, cap);
    k.P('deco', O, 'disc', 0, H - 0.005, 0, rx * 1.95, 1, rz * 1.95, tint(spot, -0.25), Math.PI, 0, 0);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + R() * 0.5, ph = 0.35 + R() * 0.6;
      k.P('deco', O, 'sph', Math.sin(ph) * Math.cos(a) * rx * 0.98, H + Math.cos(ph) * ry * 0.98, Math.sin(ph) * Math.sin(a) * rz * 0.98, 0.2, 0.08, 0.2, spot);
    }
  },
  haystack: (k, O, w, d, R, c) => {
    const hay = c('hay', '#d9bf6a'), r = Math.min(w, d) * 0.42;
    k.C('fabric', O, 0, 0, 0, r, 0.5, tint(hay, -0.08), 'cyl16');
    k.P('fabric', O, 'hemi', 0, 0.5, 0, r * 2, 2.0, r * 2, hay);
    k.Beam('wood', O, [0, 1.3, 0], [0.05, 1.85, 0.02], 0.03, DARKWOOD);
    k.Ring('fabric', O, 0, 0.9, 0, r * 0.92, 0.05, tint(hay, -0.2));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + R();
      k.P('fabric', O, 'ico', Math.cos(a) * (r + 0.1), 0.02, Math.sin(a) * (r + 0.1), 0.35, 0.1, 0.3, tint(hay, 0.08));
    }
  },
  'crop-rows': (k, O, w, d, R, c, p) => {
    const soil = c('soil', '#6b4e34'), crop = c('crop', '#d6b25e'), kind = p.v ?? 0;
    k.P('lit', O, 'flat', 0, 0.006, 0, w * 0.96, 1, d * 0.96, tint(soil, -0.15));
    for (let r = 0; r < 4; r++) {
      const x = -w * 0.375 + r * w * 0.25, L = d * 0.88;
      k.B('lit', O, x, 0, 0, 0.24, 0.07, L, soil);
      if (kind === 0) {
        // wheat: a dense band of stalks with a ragged line of heavy ears along the top
        k.B('fabric', O, x, 0.07, 0, 0.14, 0.42, L * 0.96, tint(crop, -0.08));
        const n = Math.max(5, Math.round(L / 0.16));
        for (let i = 0; i < n; i++) {
          const z = -L * 0.48 + (i + 0.5) * (L * 0.96 / n);
          k.P('fabric', O, 'ico', x + (R() - 0.5) * 0.08, 0.5 + R() * 0.08, z, 0.15, 0.2, 0.13, tint(crop, 0.08 + (R() - 0.5) * 0.12), (R() - 0.5) * 0.4, R() * TAU, (R() - 0.5) * 0.4);
        }
      } else if (kind === 2) {
        // corn, tall enough to hide in: single stalks with blades, cobs and tassels
        const n = Math.max(3, Math.round(L / 0.36));
        for (let i = 0; i < n; i++) {
          const z = -L * 0.45 + (i + 0.5) * (L * 0.9 / n) + (R() - 0.5) * 0.06, h = 1.45 + R() * 0.2, xs = x + (R() - 0.5) * 0.05;
          k.C('fabric', O, xs, 0.07, z, 0.035, h, tint(crop, -0.05), 'cyl6');
          for (let j = 0; j < 3; j++) {
            const a = R() * TAU, y = 0.45 + j * 0.38;
            k.Beam('fabric', O, [xs, y, z], [xs + Math.cos(a) * 0.32, y + 0.2, z + Math.sin(a) * 0.32], 0.035, tint(crop, 0.06 * j), 'cyl6');
          }
          k.P('fabric', O, 'cyl6', xs + 0.05, 0.85, z, 0.07, 0.24, 0.07, '#e2c860', 0, 0, 0.35);
          k.P('fabric', O, 'cone', xs, h + 0.14, z, 0.1, 0.22, 0.1, '#d9c26a');
        }
      } else if (kind === 1) for (let i = 0; i < 4; i++) k.S('fabric', O, x, 0.15, -L * 0.375 + i * L * 0.25, 0.13, i % 2 ? crop : tint(crop, -0.1), 'ico');
      else {
        // pumpkins on a vine
        k.B('fabric', O, x, 0.07, 0, 0.06, 0.02, L, '#5f8a3a');
        for (let i = 0; i < 3; i++) k.P('fabric', O, 'sph', x + (R() - 0.5) * 0.06, 0.17, -L * 0.33 + i * L * 0.33, 0.24, 0.17, 0.22, crop);
      }
    }
  },
  cactus: (k, O, w, d, R, c, p) => {
    const pl = c('plant', '#5a8a4a'), fl = c('flower', '#e85d75'), kind = p.v ?? 0;
    if (kind === 1) {
      // barrel cactus with ribs and a ring of flowers
      k.P('fabric', O, 'sph', 0, 0.3, 0, 0.62, 0.62, 0.62, pl);
      for (let i = 0; i < 8; i++) k.P('fabric', O, 'box', Math.cos(i * 0.785) * 0.29, 0.3, Math.sin(i * 0.785) * 0.29, 0.03, 0.5, 0.03, tint(pl, -0.25), 0, -i * 0.785, 0);
      for (let i = 0; i < 3; i++) k.S('deco', O, Math.cos(i * 2.1) * 0.08, 0.6, Math.sin(i * 2.1) * 0.08, 0.05, fl);
    } else if (kind === 2) {
      // prickly pear pads
      const pads: number[][] = [[0, 0.22, 0, 0], [-0.17, 0.48, 0.02, 0.5], [0.18, 0.46, -0.02, -0.45], [0.02, 0.72, 0.03, 0.1]];
      for (const [x, y, z, rz] of pads) k.P('fabric', O, 'sph', x, y, z, 0.3, 0.38, 0.09, pl, 0, (R() - 0.5) * 0.6, rz);
      for (const [x, y] of [[-0.28, 0.66], [0.3, 0.63], [0.05, 0.92]]) k.S('deco', O, x, y, 0.01, 0.045, fl);
    } else {
      // tall saguaro with two arms
      k.C('fabric', O, 0, 0, 0, 0.16, 1.75, pl, 'cyl16');
      k.S('fabric', O, 0, 1.75, 0, 0.16, pl);
      for (const s of [-1, 1]) {
        const h = s < 0 ? 0.7 : 0.95, top = s < 0 ? 1.3 : 1.45;
        k.Beam('fabric', O, [0, h, 0], [s * 0.36, h, 0], 0.09, pl);
        k.C('fabric', O, s * 0.36, h, 0, 0.09, top - h, pl, 'cyl16');
        k.S('fabric', O, s * 0.36, top, 0, 0.09, pl);
      }
      k.S('deco', O, 0.04, 1.9, 0, 0.05, fl);
    }
  },
};

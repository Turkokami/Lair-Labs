// 3D models for the items pack (src/library/objects/items.ts): fire and lava, hazards, traps, mechanisms, loot,
// magic items, and siege and camp pieces. Same conventions as the other model files: 1 square = 1 unit, y up,
// base at y = 0, centred on the footprint (w across x, d across z). The top edge of the overhead art is local -z
// (wall-mounted pieces sit there), the bottom edge (front) is +z. Flat floor hazards sit 0.005-0.02 above the floor.
// Hot and magic things use the 'glow' bin so they shine; models of lit objects return the height of their light.
import type { Kit, Spot, Bin } from './kit';
import type { Prop } from '../engine/map';
import { objectById } from '../library/objects';
import { WALL_H } from './dungeon';
import { type Model, WOOD, DARKWOOD, IRON, GOLD, crate, barrel } from './modelkit';

const TAU = Math.PI * 2, H = Math.PI / 2;
const DARK = '#14100d', BONE = '#e4dcc4', ROPE = '#c9b48a', STEEL = '#b9c0c6', LEATHER = '#6b4428', PARCH = '#eadbb5';
const GEMS = ['#c0392b', '#2f7fd6', '#3fae5a', '#9b5cff', '#f2f2f2', '#e0b03a'];

/** A flag from the placed object's chosen variant (e.g. open, floor), 0 when unset. */
const fl = (p: Prop, key: string) => (p?.kind ? objectById(p.kind)?.variants?.[p.v ?? 0]?.f?.[key] ?? 0 : 0);
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
/** A sub-spot at local lx,lz of O, turned a further dry radians, so sub-builders follow the object's rotation. */
const at = (O: Spot, lx: number, lz: number, dry = 0): Spot => {
  const a = O.ry ?? 0, cs = Math.cos(a), sn = Math.sin(a);
  return { x: O.x + lx * cs + lz * sn, z: O.z - lx * sn + lz * cs, ry: a + dry, y: O.y };
};
/** A flame: an outer and an inner glowing cone over a hot core. s is its height. */
const fire = (k: Kit, O: Spot, x: number, z: number, s: number, hot: string, mid: string, outer: string, ws = s) => {
  k.P('glow', O, 'cone', x, s * 0.45, z, ws * 0.55, s * 0.9, ws * 0.55, outer);
  k.P('glow', O, 'cone', x, s * 0.36, z, ws * 0.36, s * 0.72, ws * 0.36, mid);
  k.S('glow', O, x, s * 0.12, z, Math.min(s, ws) * 0.16, hot);
};
/** Puffs of smoke, steam or gas: soft spheres stacked upward. */
const puffs = (k: Kit, bin: Bin, O: Spot, x: number, z: number, n: number, r: number, y0: number, col: string, R: () => number, spread = 0.2) => {
  for (let i = 0; i < n; i++) k.S(bin, O, x + (R() - 0.5) * spread, y0 + i * r * 1.1, z + (R() - 0.5) * spread, r * (1 - i * 0.08), tint(col, (R() - 0.5) * 0.15), 'ico');
};
/** A sword lying flat from (x, z) along angle a (in the floor plane), length L. */
const swordFlat = (k: Kit, bin: Bin, O: Spot, x: number, z: number, a: number, L: number, blade: string, hilt: string, y = 0.03) => {
  const S = at(O, x, z, a);
  k.P(bin, S, 'box', L * 0.62, y, 0, L * 0.74, 0.02, 0.07, blade);
  k.P(bin, S, 'pyr', L * 1.01, y, 0, 0.07, 0.08, 0.02, blade, 0, 0, -H);
  k.B('metal', S, L * 0.24, y - 0.02, 0, 0.04, 0.04, 0.24, hilt);
  k.P('wood', S, 'cyl6', L * 0.12, y, 0, 0.04, L * 0.22, 0.04, LEATHER, 0, 0, H);
  k.S('metal', S, 0, y, 0, 0.035, hilt);
};
/** An upright disc facing +z. */
const vdisc = (k: Kit, bin: Bin, O: Spot, x: number, y: number, z: number, w: number, h: number, col: string) => k.P(bin, O, 'disc', x, y, z, w, 1, h, col, H);
/** A small potion bottle standing up: glowing liquid ball, glass neck and cork. */
const potion = (k: Kit, O: Spot, x: number, z: number, r: number, liq: string, cork = '#8a5a34') => {
  k.S('glow', O, x, r, z, r, liq);
  k.C('deco', O, x, r * 1.7, z, r * 0.32, r * 0.7, '#cfe6ea', 'cyl6');
  k.C('wood', O, x, r * 2.35, z, r * 0.38, r * 0.3, cork, 'cyl6');
};
/** A spoked wheel standing upright, its axle along x. */
const wheel = (k: Kit, O: Spot, x: number, z: number, r: number, col: string) => {
  k.P('wood', O, 'torus', x, r, z, r * 2, 0.33, r * 2, col, 0, 0, H);
  k.P('metal', O, 'cyl16', x, r, z, r * 0.36, 0.12, r * 0.36, IRON, 0, 0, H);
  k.Beam('wood', O, [x, 0.08 * r, z], [x, r * 1.92, z], 0.025, col);
  k.Beam('wood', O, [x, r, z - r * 0.92], [x, r, z + r * 0.92], 0.025, col);
};
/** A row of books on a shelf from x0 to x1 at height y, depth z. */
const books = (k: Kit, O: Spot, x0: number, x1: number, y: number, z: number, D: number, R: () => number) => {
  const cols = ['#7a2f2f', '#2f4f7a', '#3f6a3a', '#7a6a2f', '#4a3a5a'];
  let x = x0;
  while (x < x1) {
    const bw = 0.04 + R() * 0.05, bh = 0.25 + R() * 0.12;
    k.B('fabric', O, x + bw / 2, y, z, bw, bh, D * 0.75, cols[Math.floor(R() * 5)]);
    x += bw + 0.005;
  }
};
/** A bookcase centred at S's origin, back along local -z. */
const bookcase = (k: Kit, S: Spot, w: number, D: number, col: string, R: () => number) => {
  const Ht = 2.0;
  k.B('wood', S, 0, 0, -D / 2 + 0.02, w * 0.98, Ht, 0.04, tint(col, -0.2));
  for (const x of [-1, 1]) k.B('wood', S, (x * w) / 2 - x * 0.03, 0, 0, 0.06, Ht, D, col);
  for (let s = 0; s < 5; s++) {
    k.B('wood', S, 0, s * 0.45, 0, w * 0.95, 0.04, D, tint(col, 0.15));
    if (s < 4) books(k, S, -w * 0.45, w * 0.45, s * 0.45 + 0.04, 0.02, D, R);
  }
};
/** A strip of floor pieces from x = -w/2 to w/2 (rivers). */
const stripFlat = (k: Kit, bin: Bin, O: Spot, w: number, wid: number, y: number, col: string) => k.P(bin, O, 'flat', 0, y, 0, w, 1, wid, col);
/** A low rubble stone. */
const rock = (k: Kit, O: Spot, x: number, z: number, r: number, col: string) => k.S('cave', O, x, r * 0.5, z, r, col, 'ico');

// ---------------------------------------------------------------- fire and lava
const FIRE: Record<string, Model> = {
  'lava-pool': (k, O, w, d, R, c, p) => {
    const lava = c('lava', '#ff7a1a'), rock0 = c('rock', '#2e2622');
    k.P('cave', O, 'disc', 0, 0.006, 0, w * 0.94, 1, d * 0.92, rock0);
    k.P('cave', O, 'torus', 0, 0.02, 0, w * 0.86, 0.5, d * 0.84, tint(rock0, 0.15));
    k.P('glow', O, 'disc', 0, 0.012, 0, w * 0.8, 1, d * 0.78, lava);
    k.P('glow', O, 'disc', -0.1, 0.014, -0.1, w * 0.45, 1, d * 0.42, tint(lava, 0.45));
    for (let i = 0; i < (fl(p, 'cool') ? 18 : 8); i++) {
      const a = R() * TAU, r = Math.sqrt(R()) * w * 0.34, s = 0.12 + R() * 0.2;
      k.P('cave', O, 'hemi', Math.cos(a) * r, 0.01, Math.sin(a) * r, s, 0.05, s * 0.8, tint(rock0, 0.1), 0, R() * 3, 0);
    }
    for (let i = 0; i < 6; i++) { const a = R() * TAU, r = Math.sqrt(R()) * w * 0.3, s = 0.05 + R() * 0.05; k.P('glow', O, 'hemi', Math.cos(a) * r, 0.012, Math.sin(a) * r, s, s * 0.8, s, tint(lava, 0.6)); }
    return 0.25;
  },
  'lava-river': (k, O, w, d, R, c, p) => {
    const lava = c('lava', '#ff7a1a'), rock0 = c('rock', '#2e2622');
    for (const s of [-1, 1]) {
      k.P('cave', O, 'flat', 0, 0.008, s * d * 0.39, w, 1, d * 0.22, rock0);
      for (let i = 0; i < 6; i++) rock(k, O, -w / 2 + (i + R()) * (w / 6), s * d * (0.33 + R() * 0.1), 0.05 + R() * 0.05, tint(rock0, 0.2));
    }
    stripFlat(k, 'glow', O, w, d * 0.6, 0.006, lava);
    stripFlat(k, 'glow', O, w, d * 0.22, 0.008, tint(lava, 0.4));
    for (let i = 0; i < (fl(p, 'cool') ? 14 : 6); i++) {
      const s = 0.1 + R() * 0.16;
      k.P('cave', O, 'hemi', (R() - 0.5) * w * 0.95, 0.008, (R() - 0.5) * d * 0.4, s * 1.6, 0.04, s, tint(rock0, 0.1));
    }
    return 0.2;
  },
  'burning-ground': (k, O, w, d, R, c) => {
    const hot = c('hot', '#fff3b0'), mid = c('mid', '#ffb02e'), out = c('outer', '#e2481b');
    k.P('deco', O, 'disc', 0, 0.006, 0, w * 0.88, 1, d * 0.86, c('soot', '#2a201a'));
    fire(k, O, 0, 0, 0.7, hot, mid, out);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + R() * 0.5, r = 0.45 + R() * 0.2; fire(k, O, Math.cos(a) * r, Math.sin(a) * r, 0.35 + R() * 0.3, hot, mid, out); }
    return 0.5;
  },
  'wall-of-fire': (k, O, w, d, R, c) => {
    const hot = c('hot', '#fff3b0'), mid = c('mid', '#ffb02e'), out = c('outer', '#e2481b');
    k.P('glow', O, 'flat', 0, 0.008, 0, w * 0.96, 1, 0.3, tint(out, -0.2));
    const n = Math.round(w * 5);
    for (let i = 0; i < n; i++) fire(k, O, -w / 2 + 0.15 + (i + 0.5) * ((w - 0.3) / n) + (R() - 0.5) * 0.06, (R() - 0.5) * 0.12, 1.6 + R() * 0.8, hot, mid, out, 0.62);
    return 1.0;
  },
  'embers-ash': (k, O, w, d, R, c) => {
    const ash = c('ash', '#6e6862'), em = c('ember', '#ff6a1a');
    k.P('deco', O, 'disc', 0, 0.006, 0, w * 0.86, 1, d * 0.84, ash);
    for (let i = 0; i < 5; i++) k.P('lit', O, 'hemi', (R() - 0.5) * w * 0.6, 0.006, (R() - 0.5) * d * 0.6, 0.3 + R() * 0.3, 0.06, 0.3 + R() * 0.2, tint(ash, -0.3));
    for (let i = 0; i < 4; i++) { const x = (R() - 0.5) * 1.1, z = (R() - 0.5) * 1.1, a = R() * TAU; k.Beam('wood', O, [x, 0.03, z], [x + Math.cos(a) * 0.3, 0.03, z + Math.sin(a) * 0.3], 0.03, '#2b211b'); }
    for (let i = 0; i < 24; i++) k.S('glow', O, (R() - 0.5) * w * 0.7, 0.012, (R() - 0.5) * d * 0.7, 0.012 + R() * 0.018, R() < 0.4 ? tint(em, 0.5) : em);
    return 0.1;
  },
  'burning-wreckage': (k, O, w, d, R, c) => {
    const wood = c('wood', '#4a3424'), hot = c('hot', '#fff3b0'), mid = c('mid', '#ffb02e'), out = c('outer', '#e2481b');
    k.P('deco', O, 'disc', 0, 0.006, 0, w * 0.8, 1, d * 0.8, '#1d1612');
    for (let i = 0; i < 7; i++) {
      const x = (R() - 0.5) * w * 0.6, z = (R() - 0.5) * d * 0.6, a = R() * Math.PI, L = 0.6 + R() * 0.6, h = R() * 0.5;
      k.Beam('wood', O, [x - Math.cos(a) * L / 2, 0.06, z - Math.sin(a) * L / 2], [x + Math.cos(a) * L / 2, 0.06 + h, z + Math.sin(a) * L / 2], 0.06 + R() * 0.03, tint(wood, (R() - 0.5) * 0.3), 'cyl6');
    }
    for (const [x, z] of [[-0.4, -0.3], [0.3, -0.4], [0, 0.1], [-0.3, 0.4], [0.4, 0.4]]) fire(k, O, x + (R() - 0.5) * 0.15, z + (R() - 0.5) * 0.15, 0.4 + R() * 0.4, hot, mid, out);
    return 0.6;
  },
  'steam-vent': (k, O, w, d, R, c) => {
    const rk = c('rock', '#4e4740'), st = c('steam', '#eef3f6');
    k.P('cave', O, 'hemi', 0, 0, 0, 0.8, 0.12, 0.75, rk);
    k.P('glow', O, 'disc', 0, 0.062, 0, 0.26, 1, 0.18, '#070605');
    puffs(k, 'fabric', O, 0, 0, 5, 0.14, 0.2, st, R, 0.15);
  },
  'magma-vent': (k, O, w, d, R, c) => {
    const lava = c('lava', '#ff7a1a'), rk = c('rock', '#2e2622');
    k.P('cave', O, 'cone', 0, 0.16, 0, 0.82, 0.32, 0.78, rk);
    k.P('glow', O, 'disc', 0, 0.255, 0, 0.26, 1, 0.26, tint(lava, 0.4));
    k.S('glow', O, 0, 0.26, 0, 0.07, '#fff3b0');
    for (let i = 0; i < 5; i++) { const a = R() * TAU; k.S('glow', O, Math.cos(a) * 0.25, 0.3 + R() * 0.4, Math.sin(a) * 0.25, 0.025, lava); }
    puffs(k, 'fabric', O, 0, -0.05, 3, 0.13, 0.55, '#3a3430', R, 0.2);
    return 0.4;
  },
  'tar-pit': (k, O, w, d, R, c, p) => {
    const tar = c('tar', '#1f1b18');
    k.P('deco', O, 'disc', 0, 0.006, 0, w * 0.88, 1, d * 0.82, c('edge', '#4a3f30'));
    k.P('metal', O, 'disc', 0, 0.011, 0, w * 0.76, 1, d * 0.7, tar);
    for (let i = 0; i < 7; i++) { const s = 0.04 + R() * 0.07; k.P('metal', O, 'hemi', (R() - 0.5) * w * 0.6, 0.01, (R() - 0.5) * d * 0.55, s * 2, s * 1.4, s * 2, tint(tar, 0.15)); }
    if (fl(p, 'bones')) {
      k.Beam('lit', O, [-0.3, 0.03, 0.1], [0.05, 0.05, -0.15], 0.03, BONE);
      k.Beam('lit', O, [0.2, 0.02, 0.3], [0.5, 0.04, 0.1], 0.025, BONE);
      k.P('lit', O, 'hemi', 0.25, 0.01, -0.3, 0.2, 0.14, 0.22, BONE);
    }
  },
  'oil-slick': (k, O, w, d, R, c, p) => {
    const oil = c('oil', '#3a2a16'), bin: Bin = fl(p, 'grease') ? 'deco' : 'metal';
    k.P(bin, O, 'disc', 0, 0.006, 0, w * 0.86, 1, d * 0.76, oil);
    for (let i = 0; i < 4; i++) { const a = R() * TAU; k.P(bin, O, 'disc', Math.cos(a) * w * 0.4, 0.007, Math.sin(a) * d * 0.36, 0.14 + R() * 0.1, 1, 0.12 + R() * 0.08, oil); }
    if (!fl(p, 'grease')) for (let i = 0; i < 3; i++) k.Ring('glow', O, (R() - 0.5) * w * 0.4, 0.009, (R() - 0.5) * d * 0.4, 0.15 + R() * 0.2, 0.012, ['#5a4a8a', '#3a7a70', '#8a7030'][i]);
  },
};

// ---------------------------------------------------------------- environment hazards
const ENV: Record<string, Model> = {
  'ice-thin': (k, O, w, d, R, c, p) => {
    const ice = c('ice', '#bfe3f2');
    k.P('lit', O, 'disc', 0, 0.006, 0, w * 0.9, 1, d * 0.9, '#eef6fa');
    k.P('metal', O, 'disc', 0, 0.01, 0, w * 0.82, 1, d * 0.82, ice);
    if (fl(p, 'slick')) return;
    for (const [x, z] of [[-0.15, -0.2], [0.25, 0.15]]) {
      k.P('deco', O, 'disc', x, 0.013, z, 0.22, 1, 0.18, c('water', '#1d3f55'));
      for (let i = 0; i < 5; i++) k.P('deco', O, 'flat', x, 0.012 + i * 0.0005, z, 0.5 + R() * 0.3, 1, 0.012, tint(ice, -0.55), 0, R() * Math.PI, 0);
    }
  },
  'deep-water': (k, O, w, d, R, c, p) => {
    const wa = c('water', '#2f6f8f'), sh = c('shore', '#7a7166');
    k.P('lit', O, 'disc', 0, 0.005, 0, w * 0.94, 1, d * 0.94, sh);
    k.P('metal', O, 'disc', 0, 0.01, 0, w * 0.82, 1, d * 0.82, tint(wa, 0.1));
    k.P('metal', O, 'disc', 0.05, 0.012, 0.05, w * 0.5, 1, d * 0.5, tint(wa, -0.45));
    for (let i = 0; i < 9; i++) { const a = R() * TAU; rock(k, O, Math.cos(a) * w * 0.43, Math.sin(a) * d * 0.43, 0.08 + R() * 0.06, tint(sh, 0.1)); }
    if (fl(p, 'ice')) for (let i = 0; i < 5; i++) { const a = R() * TAU, r = 0.6 + R() * 0.5; k.B('lit', O, Math.cos(a) * r, 0.005, Math.sin(a) * r, 0.25 + R() * 0.2, 0.04, 0.2 + R() * 0.15, '#f2f8fb', 0, R() * 3, 0); }
  },
  rapids: (k, O, w, d, R, c) => {
    const wa = c('water', '#3d7fa0'), rk = c('rock', '#7a7166');
    for (const s of [-1, 1]) {
      k.P('lit', O, 'flat', 0, 0.006, s * d * 0.42, w, 1, d * 0.18, rk);
      for (let i = 0; i < 6; i++) rock(k, O, -w / 2 + (i + R()) * (w / 6), s * d * (0.38 + R() * 0.08), 0.05 + R() * 0.05, tint(rk, 0.1));
    }
    stripFlat(k, 'metal', O, w, d * 0.66, 0.008, wa);
    for (let i = 0; i < 14; i++) k.P('deco', O, 'flat', (R() - 0.5) * w * 0.95, 0.011, (R() - 0.5) * d * 0.5, 0.16, 1, 0.03, '#e8f2f6', 0, (R() - 0.5) * 0.4, 0);
    for (let i = 0; i < 4; i++) { const x = (R() - 0.5) * w * 0.8, z = (R() - 0.5) * d * 0.4; rock(k, O, x, z, 0.08 + R() * 0.05, rk); k.P('deco', O, 'disc', x - 0.08, 0.012, z, 0.3, 1, 0.16, '#f2f8fb'); }
  },
  whirlpool: (k, O, w, d, R, c) => {
    const wa = c('water', '#2f6f8f');
    k.P('metal', O, 'disc', 0, 0.008, 0, w * 0.95, 1, d * 0.95, tint(wa, 0.1));
    for (let i = 0; i < 5; i++) {
      const r = (w * 0.45 * (5 - i)) / 5;
      k.P('metal', O, 'disc', 0, 0.009 + i * 0.002, 0, r * 2, 1, r * 2, tint(wa, -0.12 * (i + 1)));
      k.Ring('deco', O, 0, 0.01 + i * 0.002, 0, r * 0.95, 0.012, '#e8f2f6');
    }
    k.P('glow', O, 'disc', 0, 0.022, 0, 0.18, 1, 0.18, '#030405');
  },
  sinkhole: (k, O, w, d, R, c) => {
    const e = c('earth', '#7a5e40');
    k.P('lit', O, 'disc', 0, 0.006, 0, w * 0.82, 1, d * 0.82, tint(e, -0.1));
    for (let i = 0; i < 3; i++) k.P('deco', O, 'disc', 0, 0.008 + i * 0.002, 0.02 * i, w * (0.62 - i * 0.15), 1, d * (0.62 - i * 0.15), tint(e, -0.35 - i * 0.2));
    k.P('glow', O, 'disc', 0, 0.015, 0.05, w * 0.2, 1, d * 0.2, '#040302');
    for (let i = 0; i < 8; i++) { const a = R() * TAU; rock(k, O, Math.cos(a) * w * 0.4, Math.sin(a) * d * 0.4, 0.04 + R() * 0.05, tint(e, 0.1)); }
  },
  'crumbling-ledge': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780');
    k.B('stone', O, 0, 0, -d / 4, w, 0.05, d / 2, st);
    k.P('glow', O, 'flat', 0, 0.006, d / 4, w, 1, d / 2, '#050506');
    for (let i = 0; i < 6; i++) k.B('lit', O, -w / 2 + (i + 0.5) * (w / 6), 0, 0.02 + (R() - 0.5) * 0.04, w / 6.5, 0.05, 0.1 + R() * 0.06, tint(st, -0.15), (R() - 0.5) * 0.3, (R() - 0.5) * 0.3, (R() - 0.5) * 0.2);
    for (let i = 0; i < 4; i++) k.P('deco', O, 'flat', (R() - 0.5) * w * 0.8, 0.052, -0.08 - R() * 0.2, 0.25, 1, 0.012, DARK, 0, (R() - 0.5) * 1.2 + H, 0);
  },
  caltrops: (k, O, w, d, R, c, p) => {
    const m = c('metal', '#6c6f73');
    if (fl(p, 'balls')) { for (let i = 0; i < 26; i++) k.S('metal', O, (R() - 0.5) * 0.75, 0.025, (R() - 0.5) * 0.75, 0.025, m); return; }
    for (let i = 0; i < 12; i++) {
      const x = (R() - 0.5) * 0.72, z = (R() - 0.5) * 0.72, a = R() * TAU;
      for (let j = 0; j < 3; j++) { const b = a + (j / 3) * TAU; k.Beam('metal', O, [x, 0.01, z], [x + Math.cos(b) * 0.07, 0.01, z + Math.sin(b) * 0.07], 0.012, m, 'cyl6'); }
      k.Beam('metal', O, [x, 0.01, z], [x, 0.08, z], 0.012, m, 'cyl6');
    }
  },
  brambles: (k, O, w, d, R, c) => {
    const v = c('vine', '#3f5a2a'), th = c('thorn', '#d8d0b0'), be = c('berry', '#7a1f3a');
    k.P('deco', O, 'disc', 0, 0.006, 0, w * 0.86, 1, d * 0.86, tint(v, -0.45));
    for (let i = 0; i < 5; i++) k.P('fabric', O, 'hemi', (R() - 0.5) * w * 0.6, 0, (R() - 0.5) * d * 0.6, 0.5 + R() * 0.3, 0.3 + R() * 0.3, 0.5 + R() * 0.3, tint(v, -0.2));
    for (let i = 0; i < 16; i++) {
      const x = (R() - 0.5) * w * 0.75, z = (R() - 0.5) * d * 0.75, a = R() * TAU, L = 0.3 + R() * 0.3, y = 0.15 + R() * 0.4;
      const ex = x + Math.cos(a) * L, ez = z + Math.sin(a) * L;
      k.Beam('wood', O, [x, 0.02, z], [(x + ex) / 2, y, (z + ez) / 2], 0.022, tint(v, 0.1), 'cyl6');
      k.Beam('wood', O, [(x + ex) / 2, y, (z + ez) / 2], [ex, 0.05, ez], 0.02, tint(v, 0.1), 'cyl6');
      k.P('metal', O, 'cone', (x + ex) / 2, y + 0.04, (z + ez) / 2, 0.025, 0.08, 0.025, th);
    }
    for (let i = 0; i < 6; i++) k.S('deco', O, (R() - 0.5) * w * 0.6, 0.3 + R() * 0.2, (R() - 0.5) * d * 0.6, 0.03, be);
  },
  'obscuring-cloud': (k, O, w, d, R, c, p) => {
    const col = c('col', '#6e6a66'), bin: Bin = fl(p, 'dark') ? 'glow' : 'fabric';
    for (let i = 0; i < 14; i++) k.S(bin, O, (R() - 0.5) * w * 0.5, 0.4 + R() * 1.4, (R() - 0.5) * d * 0.5, 0.36 + R() * 0.14, tint(col, (R() - 0.5) * 0.15), 'ico');
  },
};

// ---------------------------------------------------------------- traps
const TRAPS: Record<string, Model> = {
  'trap-net': (k, O, w, d, R, c) => {
    const rope = c('rope', '#c9b48a'), top = WALL_H - 0.08, n = 7;
    for (let i = 0; i <= n; i++) {
      const t = -w * 0.42 + (i / n) * w * 0.84;
      k.Sag('fabric', O, [-w * 0.42, top, t], [w * 0.42, top, t], 0.12, 0.008, rope, 6);
      k.Sag('fabric', O, [t, top, -d * 0.42], [t, top, d * 0.42], 0.12, 0.008, rope, 6);
    }
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.S('metal', O, x * w * 0.42, top - 0.04, z * d * 0.42, 0.05, c('weight', '#6c6f73'));
  },
  'trap-fire-statue': (k, O, w, d, R, c) => {
    const st = c('stone', '#9a9286'), z0 = -d / 4;
    k.B('lit', O, 0, 0, z0, 0.82, 0.4, 0.82, tint(st, -0.15));
    k.C('stone', O, 0, 0.4, z0, 0.26, 0.9, st, 'cyl16');
    k.S('stone', O, 0, 1.5, z0, 0.3, st);
    k.P('stone', O, 'cone', 0, 1.46, z0 + 0.3, 0.2, 0.22, 0.2, st, H, 0, 0);
    vdisc(k, 'glow', O, 0, 1.42, z0 + 0.41, 0.1, 0.07, '#2a0d05');
    for (const x of [-1, 1]) k.S('glow', O, x * 0.1, 1.6, z0 + 0.26, 0.03, c('jet', '#ffb02e'));
    for (let i = 0; i < 3; i++) k.P('deco', O, 'flat', 0, 0.006, 0.3 + i * 0.2, 0.3 + i * 0.25, 1, 0.08, '#2a221c');
  },
  'trap-rolling-boulder': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8073'), fl0 = c('floor', '#5a5650');
    k.P('deco', O, 'flat', 0, 0.006, 0, w * 0.95, 1, d * 0.56, tint(fl0, -0.35));
    for (const s of [-1, 1]) k.B('lit', O, 0, 0, s * d * 0.3, w * 0.95, 0.06, 0.06, tint(fl0, 0.1));
    k.S('cave', O, -w / 2 + 0.5, 0.42, 0, 0.42, st, 'ico');
  },
  'trap-pit-hidden': (k, O, w, d, R, c, p) => {
    const s = c('stone', '#8a8780'), m = c('metal', '#6c6f73');
    k.P('glow', O, 'flat', 0, 0.006, 0, 0.82, 1, 0.82, '#050403');
    if (fl(p, 'cover')) { k.B('lit', O, 0, 0, 0, 0.8, 0.02, 0.8, s); return; }
    if (fl(p, 'lock')) {
      for (const x of [-1, 1]) {
        k.B('lit', O, x * 0.43, 0, 0, 0.06, 0.04, 0.8, s);
        k.B('metal', O, x * 0.25, 0.01, 0, 0.36, 0.03, 0.78, tint(s, -0.2), 0, 0, x * 1.2);
      }
      for (const z of [-0.3, 0.3]) k.B('metal', O, -0.48, 0.02, z, 0.06, 0.05, 0.06, m);
      return;
    }
    for (const t of [-1, 1]) { k.B('lit', O, 0, 0, t * 0.45, 0.98, 0.05, 0.1, s); k.B('lit', O, t * 0.45, 0, 0, 0.1, 0.05, 0.8, s); }
  },
  'trap-pendulum-axe': (k, O, w, d, R, c) => {
    const m = c('metal', '#b9c0c6'), wd = c('wood', '#5c3a20'), top = WALL_H - 0.04;
    [-1, 0, 1].forEach((i) => {
      const x = i * (w / 3), th = (i === 0 ? -1 : 1) * 0.12, L = top - 0.7, ez = Math.sin(th) * L, ey = top - Math.cos(th) * L;
      k.B('metal', O, x, top - 0.04, 0, 0.12, 0.05, d * 0.9, '#1c1c1e');
      k.S('metal', O, x, top, 0, 0.06, IRON);
      k.Beam('wood', O, [x, top, 0], [x, ey, ez], 0.035, wd);
      for (const s of [-1, 1]) k.P('metal', O, 'hemi', x + s * 0.08, ey, ez, 0.28, 0.55, 0.05, m, th, 0, s * H);
    });
  },
  'trap-swinging-log': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#6a4a2a'), rope = c('rope', '#c9b48a'), y = 1.0;
    k.P('wood', O, 'cyl16', 0, y, 0, 0.36, w * 0.76, 0.36, wd, 0, 0, H);
    for (const x of [-0.45, 0.45]) k.Beam('fabric', O, [x, y + 0.15, 0], [x, WALL_H, 0], 0.015, rope, 'cyl6');
    if (fl(p, 'spikes')) for (let i = 0; i < 6; i++) for (const s of [-1, 1]) k.P('metal', O, 'cone', -0.6 + i * 0.24, y, s * 0.24, 0.05, 0.14, 0.05, STEEL, s * H, 0, 0);
  },
  'trap-crushing-walls': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8780');
    for (const s of [-1, 1]) {
      k.B('stone', O, s * (w / 2 - 0.12), 0, 0, 0.22, 2.4, d * 0.92, st);
      if (fl(p, 'spikes')) for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) k.P('metal', O, 'cone', s * (w / 2 - 0.3), 0.5 + j * 0.6, -d * 0.38 + i * (d * 0.15), 0.08, 0.2, 0.08, c('metal', STEEL), 0, 0, s * H);
    }
    for (let i = 0; i < 3; i++) k.P('deco', O, 'flat', 0, 0.006, -0.8 + i * 0.8, w * 0.5, 1, 0.03, '#2a2622');
  },
  'trap-arrow-slits': (k, O, w, d, R, c) => {
    for (let x = -w / 2 + 0.3; x < w / 2; x += 0.6) for (const s of [-1, 1]) k.B('deco', O, x, 0.9, s * 0.48, 0.18, 0.05, 0.04, DARK);
    k.B('lit', O, 0, 0, 0, 0.5, 0.02, 0.4, '#7a776f');
    for (const [x, z, a] of [[-0.6, -0.05, 0.35], [0.4, 0.1, -0.4]]) {
      const S = at(O, x, z, a);
      k.Beam('wood', S, [-0.18, 0.012, 0], [0.16, 0.012, 0], 0.008, c('shaft', '#5a3d24'));
      k.S('fabric', S, -0.17, 0.018, 0, 0.022, c('fletch', '#c0392b'));
    }
  },
  'trap-vent-grate': (k, O, w, d, R, c, p) => {
    const m = c('metal', '#6c6f73'), fx = c('fx', '#8fe04a');
    k.P('glow', O, 'flat', 0, 0.005, 0, 0.56, 1, 0.56, '#060505');
    for (let i = 0; i < 6; i++) k.B('metal', O, -0.22 + i * 0.088, 0, 0, 0.035, 0.03, 0.54, m);
    for (const s of [-1, 1]) k.B('metal', O, 0, 0, s * 0.27, 0.58, 0.035, 0.04, m);
    if (fl(p, 'water')) k.P('deco', O, 'disc', 0, 0.034, 0, 0.4, 1, 0.4, tint(fx, -0.2));
    else puffs(k, 'fabric', O, 0, 0, 3, 0.12, 0.12, fx, R, 0.3);
  },
  'trap-cage-drop': (k, O, w, d, R, c) => {
    const m = c('metal', '#6c6f73'), top = WALL_H - 0.05, bot = top - 1.6;
    k.B('lit', O, 0, 0, 0, 0.3, 0.02, 0.3, c('stone', '#8a8780'));
    for (const y of [bot, top - 0.06]) k.B('metal', O, 0, y, 0, 0.9, 0.06, 0.9, m);
    for (let i = 0; i < 12; i++) {
      const t = (i / 12) * 4, side = Math.floor(t), f = t - side;
      const x = [-1 + 2 * f, 1, 1 - 2 * f, -1][side] * 0.44, z = [-1, -1 + 2 * f, 1, 1 - 2 * f][side] * 0.44;
      k.C('metal', O, x, bot, z, 0.015, top - bot, m, 'cyl6');
    }
  },
  'trap-floor-scythe': (k, O, w, d, R, c) => {
    k.P('glow', O, 'flat', 0, 0.006, 0, w * 0.88, 1, 0.07, '#060505');
    k.P('metal', O, 'hemi', 0.05, 0.03, -0.12, 1.3, 0.06, 0.32, c('metal', STEEL), 0, 0.15, 0);
    k.C('metal', O, -0.68, 0, 0, 0.06, 0.05, IRON, 'cyl16');
  },
  'trap-ceiling-collapse': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8073');
    for (let i = 0; i < 10; i++) k.S('cave', O, (R() - 0.5) * w * 0.7, WALL_H - 0.15 - R() * 0.1, (R() - 0.5) * d * 0.7, 0.12 + R() * 0.14, st, 'ico');
    for (let i = 0; i < 5; i++) k.P('deco', O, 'flat', 0, 0.006 + i * 0.0005, 0, 0.6 + R() * 0.8, 1, 0.02, '#2a2420', 0, R() * Math.PI, 0);
    for (let i = 0; i < 5; i++) rock(k, O, (R() - 0.5) * w * 0.7, (R() - 0.5) * d * 0.7, 0.03 + R() * 0.03, st);
  },
  'trap-rune-threshold': (k, O, w, d, R, c) => {
    const ru = c('rune', '#ff8a5a');
    for (const z of [-0.18, 0.18]) k.P('glow', O, 'flat', 0, 0.006, z, w * 0.86, 1, 0.012, ru);
    for (let i = 0; i < 5; i++) {
      const x = -w * 0.35 + i * (w * 0.175);
      k.P('glow', O, 'flat', x, 0.007, 0, 0.16, 1, 0.025, ru, 0, R() * Math.PI, 0);
      k.P('glow', O, 'flat', x, 0.008, 0, 0.12, 1, 0.025, ru, 0, R() * Math.PI, 0);
    }
  },
};

// ---------------------------------------------------------------- doors and mechanisms
const MECH: Record<string, Model> = {
  lever: (k, O, w, d, R, c, p) => {
    const m = c('metal', '#6c6f73'), gr = c('grip', '#5c3a20');
    if (fl(p, 'floor')) {
      k.B('metal', O, 0, 0, 0, 0.45, 0.08, 0.3, m);
      k.Beam('metal', O, [0, 0.08, 0], [0.12, 0.85, -0.25], 0.025, m);
      k.S('wood', O, 0.12, 0.88, -0.25, 0.06, gr);
      return;
    }
    const z = -d / 2 + 0.04, up = !fl(p, 'down');
    k.B('metal', O, 0, 0.9, z, 0.4, 0.36, 0.06, m);
    k.B('deco', O, 0, 0.94, z + 0.031, 0.06, 0.26, 0.01, DARK);
    const ty = up ? 1.42 : 0.68, tz = z + 0.32;
    k.Beam('metal', O, [0, 1.08, z + 0.03], [0, ty, tz], 0.025, m);
    k.C('wood', O, 0, ty - 0.06, tz, 0.045, 0.14, gr, 'cyl16');
  },
  'wall-button': (k, O, w, d, R, c, p) => {
    const z = -d / 2 + 0.04, b = c('btn', '#a8a196');
    k.B('lit', O, 0, 1.0, z, 0.36, 0.3, 0.06, c('stone', '#8a8780'));
    k.P(fl(p, 'rune') ? 'glow' : 'metal', O, 'cyl16', 0, 1.15, z + 0.06, 0.13, 0.06, 0.13, b, H, 0, 0);
  },
  winch: (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#7a5432'), m = c('metal', '#6c6f73');
    for (const x of [-0.38, 0.38]) k.B('wood', O, x, 0, 0, 0.1, 0.9, 0.5, wd);
    k.P('wood', O, 'cyl16', 0, 0.7, 0, 0.36, 0.66, 0.36, tint(wd, 0.1), 0, 0, H);
    if (fl(p, 'chain')) for (let i = 0; i < 6; i++) k.P('metal', O, 'ring', -0.25 + i * 0.1, 0.7, 0, 0.36, 0.6, 0.36, m, 0, 0, H);
    else k.P('fabric', O, 'cyl16', 0, 0.7, 0, 0.39, 0.5, 0.39, c('rope', ROPE), 0, 0, H);
    k.Beam('metal', O, [0.43, 0.7, 0], [0.55, 0.7, 0], 0.025, m);
    k.Beam('metal', O, [0.55, 0.7, 0], [0.55, 0.45, 0.1], 0.025, m);
    k.C('wood', O, 0.6, 0.4, 0.1, 0.03, 0.12, DARKWOOD, 'cyl6');
    k.Beam(fl(p, 'chain') ? 'metal' : 'fabric', O, [0, 0.88, 0], [0, WALL_H, -0.3], 0.018, fl(p, 'chain') ? m : ROPE, 'cyl6');
  },
  'statue-rotating': (k, O, w, d, R, c) => {
    const st = c('stone', '#a8a196'), mk = c('mark', '#e2b84a');
    k.C('lit', O, 0, 0, 0, 0.45, 0.16, tint(st, -0.25), 'cyl16');
    k.C('stone', O, 0, 0.16, 0, 0.38, 0.06, tint(st, -0.1), 'cyl16');
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; k.B('glow', O, Math.cos(a) * 0.42, 0.15, Math.sin(a) * 0.42, 0.04, 0.012, 0.04, mk, 0, -a, 0); }
    k.C('stone', O, 0, 0.22, 0, 0.2, 0.8, st, 'cyl16');
    k.S('stone', O, 0, 1.15, 0, 0.25, st);
    k.S('stone', O, 0, 1.5, 0, 0.15, st);
    k.Beam('stone', O, [0, 1.2, 0], [0, 1.15, 0.4], 0.05, st);
    k.P('metal', O, 'cone', 0, 1.15, 0.47, 0.06, 0.12, 0.06, mk, H, 0, 0);
  },
  'orb-pedestal': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#a8a196');
    k.B('stone', O, 0, 0, 0, 0.66, 0.15, 0.66, tint(st, -0.15));
    k.B('stone', O, 0, 0.15, 0, 0.44, 0.75, 0.44, st);
    k.B('lit', O, 0, 0.9, 0, 0.6, 0.08, 0.6, tint(st, 0.1));
    if (fl(p, 'empty')) { k.P('deco', O, 'disc', 0, 0.985, 0, 0.2, 1, 0.2, DARK); return; }
    k.C('metal', O, 0, 0.98, 0, 0.1, 0.04, GOLD, 'cyl16');
    k.S('glow', O, 0, 1.15, 0, 0.15, c('orb', '#4cb8ff'));
    return 1.2;
  },
  'rune-tiles': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), ru = c('rune', '#4cb8ff');
    const lit = new Set([Math.floor(R() * 9), Math.floor(R() * 9), Math.floor(R() * 9)]);
    for (let i = 0; i < 9; i++) {
      const x = ((i % 3) - 1) * 0.96, z = (Math.floor(i / 3) - 1) * 0.96;
      k.B('lit', O, x, 0, z, 0.92, 0.03, 0.92, tint(st, (R() - 0.5) * 0.15));
      const col = lit.has(i) ? ru : tint(st, -0.5), bin: Bin = lit.has(i) ? 'glow' : 'deco';
      k.P(bin, O, 'flat', x, 0.032, z, 0.5, 1, 0.04, col, 0, R() * Math.PI, 0);
      k.P(bin, O, 'flat', x, 0.033, z, 0.3, 1, 0.04, col, 0, R() * Math.PI, 0);
    }
  },
  'lock-plate': (k, O, w, d, R, c, p) => {
    const m = c('metal', '#c9a24a'), z = -d / 2 + 0.03;
    k.B('metal', O, 0, 0.85, z, 0.42, 0.42, 0.05, m);
    k.P('metal', O, 'pyr', 0, 0.8, z, 0.3, 0.14, 0.05, m, Math.PI, Math.PI / 4, 0);
    if (fl(p, 'rune')) { vdisc(k, 'glow', O, 0, 1.06, z + 0.03, 0.14, 0.14, '#8fdcff'); return; }
    vdisc(k, 'deco', O, 0, 1.1, z + 0.027, 0.07, 0.07, DARK);
    k.B('deco', O, 0, 0.94, z + 0.026, 0.035, 0.13, 0.005, DARK);
    if (fl(p, 'gems')) for (const x of [-0.13, 0.13]) k.S('glow', O, x, 1.0, z + 0.03, 0.025, '#c0392b');
  },
  'bookcase-secret': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#5c3a20'), D = 0.4;
    if (fl(p, 'open')) {
      k.B('glow', O, 0, 0, -d / 2 + 0.01, w * 0.8, 2.0, 0.02, '#050403');
      const th = 0.42;
      bookcase(k, at(O, w / 2 - (w / 2) * Math.cos(th) - Math.sin(th) * (D / 2) * -1, -d / 2 + D / 2 + (w / 2) * Math.sin(th), th), w, D, wd, R);
      return;
    }
    bookcase(k, at(O, 0, -d / 2 + D / 2), w, D, wd, R);
  },
  'door-broken': (k, O, w, d, R, c) => {
    const wd = c('wood', '#7a5432'), m = c('metal', '#55585e');
    for (const y of [0.4, 1.6]) k.B('metal', O, -0.47, y, 0, 0.06, 0.12, 0.08, m);
    k.B('wood', O, -0.33, 0.5, 0, 0.26, 1.2, 0.07, wd, 0, 0, -0.08);
    for (let i = 0; i < 5; i++) k.B('wood', O, (R() - 0.5) * 0.6, 0.02 + i * 0.03, 0.15 + (R() - 0.5) * 0.4, 0.18 + R() * 0.1, 0.05, 0.6 + R() * 0.4, tint(wd, (R() - 0.5) * 0.25), (R() - 0.5) * 0.2, R() * 3, (R() - 0.5) * 0.15);
    for (let i = 0; i < 8; i++) k.B('wood', O, (R() - 0.5) * 0.8, 0.01, (R() - 0.5) * 0.8, 0.02, 0.02, 0.1, tint(wd, 0.2), 0, R() * 3, 0);
  },
  'door-barricaded': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#7a5432'), pl = c('plank', '#a07a4a');
    k.B('wood', O, 0, 0, 0, w * 0.96, 2.1, 0.08, wd);
    for (const [y, a] of [[0.7, 0.35], [1.4, -0.3], [1.05, 0.05]]) k.B('wood', O, 0, y, 0.06, w * 1.02, 0.14, 0.04, pl, 0, 0, a);
    if (fl(p, 'crates')) { crate(k, at(O, -0.22, 0.3), 0.42); crate(k, at(O, 0.24, 0.32, 0.3), 0.38); crate(k, at(O, -0.05, 0.3), 0.32, 0.42); }
  },
  'portal-arch': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8780'), gl = c('glow', '#b07bff'), off = fl(p, 'off');
    for (const s of [-1, 1]) {
      k.B('stone', O, s * (w / 2 - 0.16), 0, 0, 0.32, 2.3, 0.4, st);
      k.B('lit', O, s * (w / 2 - 0.16), 2.3, 0, 0.4, 0.12, 0.46, tint(st, 0.1));
      if (!off) k.B('glow', O, s * (w / 2 - 0.16), 1.2, 0.205, 0.1, 0.1, 0.01, tint(gl, 0.3));
    }
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (i / 6), x = Math.cos(a) * (w / 2 - 0.16), y = 2.42 + Math.sin(a) * 0.5;
      k.B('stone', O, x, y - 0.12, 0, 0.32, 0.26, 0.4, tint(st, (R() - 0.5) * 0.1), 0, 0, a - H);
    }
    k.P(off ? 'deco' : 'glow', O, 'disc', 0, 1.42, 0, w * 0.68, 1, 2.6, off ? '#3a3f48' : gl, H);
    if (!off) k.P('glow', O, 'disc', 0, 1.42, 0.01, w * 0.4, 1, 1.6, tint(gl, 0.5), H);
    return 1.4;
  },
};

// ---------------------------------------------------------------- treasure and loot
const LOOT: Record<string, Model> = {
  'mimic-chest': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#6b4428'), m = c('metal', '#c9a24a');
    k.B('wood', O, 0, 0, 0, w * 0.8, 0.42, d * 0.62, wd);
    for (const x of [-0.3, 0.3]) k.B('metal', O, x * w, 0, 0, 0.05, 0.44, d * 0.64, m);
    if (fl(p, 'open')) {
      k.B('fabric', O, 0, 0.36, 0, w * 0.7, 0.04, d * 0.5, c('maw', '#8a1f2a'));
      k.B('wood', O, 0, 0.62, -d * 0.36, w * 0.8, 0.42, 0.08, wd, -0.5, 0, 0);
      for (let i = 0; i < 8; i++) {
        const x = -w * 0.33 + i * (w * 0.66 / 7);
        k.P('lit', O, 'cone', x, 0.47, d * 0.28, 0.05, 0.12, 0.05, BONE);
        k.P('lit', O, 'cone', x, 0.52, -d * 0.26, 0.05, 0.12, 0.05, BONE, Math.PI - 0.5, 0, 0);
      }
      k.Beam('fabric', O, [0, 0.4, 0], [0.08, 0.45, d * 0.45], 0.06, '#d0506a');
      for (const x of [-0.25, 0.25]) k.S('glow', O, x, 0.82, -d * 0.4, 0.04, '#ffe066');
      return;
    }
    k.P('wood', O, 'cyl16', 0, 0.42, 0, d * 0.62, w * 0.8, d * 0.37, wd, 0, 0, H);
    k.B('metal', O, 0, 0.3, d * 0.31, 0.12, 0.14, 0.04, m);
    for (const x of [-0.18, 0.18]) k.P('lit', O, 'cone', x, 0.39, d * 0.315, 0.03, 0.06, 0.03, BONE, Math.PI, 0, 0);
  },
  'dragon-hoard': (k, O, w, d, R, c) => {
    const g0 = c('gold', '#e2b84a'), ac = c('accent', '#c0392b');
    k.P('metal', O, 'hemi', 0, 0, 0, w * 0.88, 0.9, d * 0.86, tint(g0, -0.1));
    k.P('metal', O, 'hemi', -0.25, 0, -0.2, w * 0.5, 1.2, d * 0.5, g0);
    for (let i = 0; i < 60; i++) { const a = R() * TAU, r = Math.sqrt(R()) * w * 0.44; k.P('metal', O, 'cyl16', Math.cos(a) * r, 0.03 + R() * 0.02, Math.sin(a) * r, 0.1, 0.02, 0.1, R() < 0.15 ? '#cfd6dc' : g0, (R() - 0.5) * 0.6, 0, (R() - 0.5) * 0.6); }
    for (let i = 0; i < 12; i++) { const a = R() * TAU, r = Math.sqrt(R()) * w * 0.3; k.P('glow', O, 'oct', Math.cos(a) * r, 0.25 + (1 - r / (w * 0.3)) * 0.25, Math.sin(a) * r, 0.1, 0.1, 0.1, i % 3 ? ac : GEMS[i % GEMS.length]); }
    k.Beam('metal', O, [0.55, 0.2, 0.55], [0.75, 1.0, 0.85], 0.03, STEEL);
    k.B('metal', O, 0.6, 0.4, 0.62, 0.3, 0.04, 0.05, g0, 0, -0.8, 0);
    k.P('metal', O, 'cyl16', -0.7, 0.2, 0.75, 0.6, 0.06, 0.6, '#7a2f2f', 0.9, 0, 0);
    k.C('metal', O, -0.2, 0.55, -0.15, 0.13, 0.12, g0, 'cyl16');
  },
  'coin-stacks': (k, O, w, d, R, c, p) => {
    const g0 = c('gold', '#e2b84a');
    if (fl(p, 'gems')) { for (let i = 0; i < 11; i++) k.P('glow', O, 'oct', (R() - 0.5) * 0.6, 0.04, (R() - 0.5) * 0.6, 0.07, 0.06, 0.07, GEMS[i % GEMS.length]); return; }
    if (fl(p, 'purse')) {
      k.S('fabric', O, -0.15, 0.13, -0.15, 0.15, c('bag', '#7a5638'));
      k.C('fabric', O, -0.22, 0.24, -0.22, 0.05, 0.08, c('bag', '#7a5638'), 'cyl6');
      for (let i = 0; i < 18; i++) k.P('metal', O, 'cyl16', 0.12 + (R() - 0.5) * 0.4, 0.008, 0.12 + (R() - 0.5) * 0.4, 0.08, 0.015, 0.08, g0);
      return;
    }
    for (const [x, z, n] of [[-0.16, -0.1, 7], [0.1, -0.16, 5], [-0.02, 0.14, 9], [0.22, 0.12, 4], [-0.24, 0.2, 3]]) k.C('metal', O, x, 0, z, 0.08, n * 0.025, g0, 'cyl16');
  },
  'jewelry-box': (k, O, w, d, R, c) => {
    const wd = c('wood', '#6a2a2a'), m = c('metal', '#e2b84a');
    k.B('wood', O, 0, 0, 0.05, 0.56, 0.22, 0.4, wd);
    k.B('fabric', O, 0, 0.18, 0.05, 0.5, 0.05, 0.34, c('lining', '#2f5d8a'));
    k.B('wood', O, 0, 0.22, -0.18, 0.56, 0.3, 0.04, tint(wd, -0.1), -0.3, 0, 0);
    for (let i = 0; i < 7; i++) k.S('lit', O, -0.18 + i * 0.06, 0.24, 0.0 + Math.sin(i) * 0.04, 0.02, '#f4efe4');
    k.P('metal', O, 'ring', 0, 0.24, 0.12, 0.3, 0.3, 0.16, m);
    k.S('glow', O, 0, 0.25, 0.2, 0.03, '#c0392b');
  },
  reliquary: (k, O, w, d, R, c) => {
    const m = c('metal', '#e2b84a');
    k.B('fabric', O, 0, 0, 0, 0.7, 0.1, 0.7, c('cloth', '#5d3a78'));
    k.B('metal', O, 0, 0.1, 0, 0.44, 0.26, 0.3, m);
    k.P('metal', O, 'pyr', 0, 0.45, 0, 0.62, 0.18, 0.44, m, 0, Math.PI / 4, 0);
    for (const x of [-0.12, 0, 0.12]) k.S('glow', O, x, 0.24, 0.155, 0.025, c('gem', '#c0392b'));
    k.B('metal', O, 0, 0.53, 0, 0.03, 0.12, 0.03, m);
    k.B('metal', O, 0, 0.6, 0, 0.1, 0.025, 0.03, m);
  },
  chalices: (k, O, w, d, R, c, p) => {
    const m = c('metal', '#e2b84a');
    k.C('metal', O, 0, 0, 0, 0.42, 0.03, m, 'cyl16');
    for (const [x, z, s] of [[-0.14, -0.1, 1.1], [0.12, -0.12, 0.9], [0.02, 0.14, 1]]) {
      k.C('metal', O, x, 0.03, z, 0.06 * s, 0.02, m, 'cyl16');
      k.C('metal', O, x, 0.05, z, 0.015, 0.12 * s, m, 'cyl6');
      k.P('metal', O, 'hemi', x, 0.29 * s + 0.05, z, 0.16 * s, 0.24 * s, 0.16 * s, m, Math.PI);
      k.P('deco', O, 'disc', x, 0.27 * s + 0.05, z, 0.13 * s, 1, 0.13 * s, c('wine', '#6a1a2a'));
      if (fl(p, 'gems')) k.S('glow', O, x + 0.08 * s, 0.14 * s + 0.05, z, 0.015, '#c0392b');
    }
  },
  'treasure-urn': (k, O, w, d, R, c, p) => {
    const cl = c('clay', '#a0603a'), g0 = c('gold', '#e2b84a');
    if (fl(p, 'tipped')) {
      k.P('lit', O, 'sph', -0.08, 0.22, -0.08, 0.5, 0.4, 0.4, cl, 0, 0.8, 0);
      k.P('lit', O, 'cyl16', 0.12, 0.22, 0.12, 0.2, 0.16, 0.2, cl, H, 0.8, 0);
      for (let i = 0; i < 20; i++) k.P('metal', O, 'cyl16', 0.2 + R() * 0.2, 0.008, 0.2 + R() * 0.2, 0.07, 0.015, 0.07, g0);
      return;
    }
    k.P('lit', O, 'sph', 0, 0.32, 0, 0.62, 0.64, 0.62, cl);
    k.C('lit', O, 0, 0.55, 0, 0.17, 0.18, cl, 'cyl16');
    k.P('metal', O, 'hemi', 0, 0.72, 0, 0.32, 0.12, 0.32, g0);
    for (const s of [-1, 1]) k.P('lit', O, 'torus', s * 0.33, 0.42, 0, 0.14, 0.5, 0.14, cl, H, 0, 0);
  },
  'treasure-map': (k, O, w, d, R, c, p) => {
    if (fl(p, 'tube')) {
      k.P('wood', O, 'cyl16', 0, 0.06, 0, 0.12, 0.7, 0.12, c('leather', LEATHER), 0, -0.6, H);
      for (const s of [-1, 1]) k.P('metal', O, 'cyl16', Math.cos(0.6) * s * 0.32, 0.06, Math.sin(0.6) * s * 0.32, 0.13, 0.08, 0.13, GOLD, 0, -0.6, H);
      return;
    }
    k.P('lit', O, 'flat', 0, 0.008, 0, 0.72, 1, 0.62, PARCH, 0, 0.12, 0);
    k.P('deco', O, 'flat', 0.1, 0.01, 0.05, 0.3, 1, 0.025, c('ink', '#7a2f2f'), 0, 0.5, 0);
    k.P('deco', O, 'flat', 0.2, 0.011, 0.1, 0.1, 1, 0.02, c('ink', '#7a2f2f'), 0, 0.8, 0);
    k.P('deco', O, 'flat', 0.2, 0.011, 0.1, 0.1, 1, 0.02, c('ink', '#7a2f2f'), 0, -0.8, 0);
    for (const [x, z] of [[-0.34, -0.28], [0.34, -0.32], [0.38, 0.28], [-0.32, 0.3]]) rock(k, O, x, z, 0.04, '#8a8780');
  },
  'key-ring': (k, O, w, d, R, c) => {
    const m = c('metal', '#6c6f73');
    k.Ring('metal', O, 0, 0.012, -0.08, 0.13, 0.016, m);
    for (let i = 0; i < 5; i++) {
      const a = -0.2 + i * 0.7, x = Math.cos(a) * 0.15, z = -0.08 + Math.sin(a) * 0.15;
      k.Beam('metal', O, [x, 0.012, z], [x + Math.cos(a) * 0.28, 0.012, z + Math.sin(a) * 0.28], 0.012, m, 'cyl6');
      k.B('metal', O, x + Math.cos(a) * 0.26, 0, z + Math.sin(a) * 0.26, 0.04, 0.02, 0.04, m, 0, -a, 0);
    }
  },
  backpack: (k, O, w, d, R, c) => {
    const pk = c('pack', '#7a5638');
    k.P('fabric', O, 'box', 0, 0.14, 0.04, 0.5, 0.28, 0.58, pk, -0.15, 0, 0);
    k.B('fabric', O, 0, 0.2, 0.1, 0.4, 0.12, 0.24, tint(pk, -0.1));
    k.P('fabric', O, 'cyl16', 0, 0.38, -0.25, 0.18, 0.62, 0.18, c('roll', '#5a6a3a'), 0, 0, H);
    for (const x of [-0.12, 0.12]) k.B('fabric', O, x, 0.27, 0.2, 0.05, 0.03, 0.2, '#3a2a1c');
    k.P('fabric', O, 'torus', 0.32, 0.04, 0.3, 0.26, 0.6, 0.26, ROPE);
  },
  'gear-pile': (k, O, w, d, R, c, p) => {
    const m = c('metal', STEEL), wd = c('wood', '#6b4428');
    if (fl(p, 'armor')) {
      k.P('metal', O, 'cyl16', -0.22, 0.04, 0.15, 0.42, 0.06, 0.42, '#7a2f2f', 0.15, 0, 0);
      k.P('metal', O, 'hemi', 0.15, 0, 0, 0.4, 0.3, 0.5, m, -H, 0, 0);
      k.S('metal', O, -0.2, 0.15, -0.22, 0.15, m);
      return;
    }
    swordFlat(k, 'metal', O, -0.36, 0.28, 0.6, 0.75, m, '#8a6a3a');
    swordFlat(k, 'metal', O, -0.32, -0.3, -0.45, 0.72, m, IRON, 0.06);
    k.Beam('wood', O, [-0.42, 0.05, 0.02], [0.45, 0.05, -0.08], 0.022, wd);
    k.P('metal', O, 'cone', 0.5, 0.05, -0.09, 0.05, 0.12, 0.03, m, 0, 0, -H);
    k.Beam('wood', O, [0.1, 0.03, 0.4], [0.25, 0.08, -0.1], 0.025, wd);
    k.P('metal', O, 'hemi', 0.26, 0.08, -0.12, 0.25, 0.04, 0.16, m, H, 0, 0);
  },
  supplies: (k, O, w, d, R, c, p) => {
    if (fl(p, 'heal')) {
      k.B('fabric', O, 0, 0, 0, 0.6, 0.26, 0.42, c('bag', '#5a3a24'));
      k.P('fabric', O, 'cyl16', 0, 0.26, -0.06, 0.6, 0.6, 0.3, tint(c('bag', '#5a3a24'), 0.1), 0, 0, H);
      k.B('deco', O, 0, 0.27, 0.2, 0.12, 0.12, 0.02, '#5fae5a');
      for (const [x, z] of [[0.36, 0.3], [0.42, 0.18]]) k.P('fabric', O, 'cyl16', x, 0.06, z, 0.14, 0.1, 0.12, '#efe8d8', 0, 0, H);
      potion(k, O, -0.36, 0.34, 0.05, '#c0392b');
      return;
    }
    k.B('fabric', O, -0.12, 0, -0.06, 0.44, 0.28, 0.36, c('cloth', '#b59a6a'));
    k.P('lit', O, 'hemi', 0.2, 0, -0.18, 0.36, 0.2, 0.22, '#c9853a');
    k.P('lit', O, 'cyl16', 0.26, 0.06, 0.2, 0.26, 0.12, 0.26, '#e8c860');
    k.S('fabric', O, -0.2, 0.12, 0.3, 0.12, '#7a5a3a');
  },
};

// ---------------------------------------------------------------- magic items
const MAGIC: Record<string, Model> = {
  'potion-healing': (k, O, w, d, R, c) => {
    const lq = c('liq', '#d2283a'), ck = c('cork', '#8a5a34');
    potion(k, O, -0.06, -0.02, 0.11, lq, ck);
    potion(k, O, 0.2, 0.16, 0.07, lq, ck);
    return 0.2;
  },
  'potion-set': (k, O, w, d, R, c, p) => {
    if (!fl(p, 'loose')) k.B('wood', O, 0, 0, 0, 0.74, 0.04, 0.62, c('tray', '#6b4428'));
    const cols = ['#d2283a', '#2f7fd6', '#3fae5a', '#9b5cff', '#e0b03a', '#2fb8b0'];
    [[-0.18, -0.14, 0.09], [0.08, -0.16, 0.07], [0.26, 0, 0.06], [-0.2, 0.12, 0.07], [0.04, 0.1, 0.1], [0.2, 0.2, 0.05]].forEach(([x, z, s], i) => potion(k, at(O, 0, 0), x, z, s, cols[i]));
    return 0.2;
  },
  'spell-scroll': (k, O, w, d, R, c) => {
    const S = at(O, 0, 0, 0.25);
    k.P('lit', S, 'flat', 0, 0.01, 0, 0.6, 1, 0.48, PARCH);
    for (const x of [-0.31, 0.31]) k.P('wood', S, 'cyl16', x, 0.04, 0, 0.08, 0.54, 0.08, '#c9b27f', H, 0, 0);
    for (let i = 0; i < 3; i++) k.P('glow', S, 'flat', 0, 0.012, -0.12 + i * 0.12, 0.4, 1, 0.03, c('rune', '#e8a020'));
    k.S('deco', S, 0, 0.02, 0.22, 0.04, c('ribbon', '#a3312c'));
    return 0.05;
  },
  wand: (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#6b4428'), tip = c('tip', '#7fd6ff'), S = at(O, 0, 0, 0.7);
    if (fl(p, 'rod')) {
      k.P('metal', S, 'cyl16', 0, 0.04, 0, 0.07, 0.66, 0.07, wd, 0, 0, H);
      k.P('metal', S, 'oct', 0.36, 0.04, 0, 0.14, 0.12, 0.14, wd);
      k.S('glow', S, 0.38, 0.05, 0, 0.04, tip);
    } else {
      k.P('wood', S, 'cyl6', 0, 0.025, 0, 0.035, 0.66, 0.035, wd, 0, 0, H);
      k.S('glow', S, 0.34, 0.03, 0, 0.03, tip);
    }
    return 0.05;
  },
  'staff-stand': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#5c3a20');
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU - H; k.Beam('metal', O, [Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32], [0, 0.45, 0], 0.025, '#55585e'); }
    k.C('wood', O, 0, 0, 0, 0.035, 1.75, wd, 'cyl6');
    for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU; k.Beam('metal', O, [0, 1.7, 0], [Math.cos(a) * 0.09, 1.95, Math.sin(a) * 0.09], 0.015, c('metal', '#c9a24a')); }
    if (fl(p, 'leaf')) for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; k.P('fabric', O, 'sph', Math.cos(a) * 0.1, 1.65, Math.sin(a) * 0.1, 0.12, 0.04, 0.06, '#4e8a3a', 0, -a, 0); }
    k.P('glow', O, 'oct', 0, 1.9, 0, 0.16, 0.22, 0.16, c('gem', '#4cb8ff'));
    return 1.9;
  },
  'ring-cushion': (k, O, w, d, R, c, p) => {
    const m = c('metal', '#e2b84a');
    k.P('fabric', O, 'sph', 0, 0.07, 0, 0.66, 0.16, 0.66, c('cloth', '#7a2f2f'));
    if (fl(p, 'amulet')) {
      k.Ring('metal', O, 0, 0.15, -0.06, 0.18, 0.012, m);
      k.C('metal', O, 0, 0.14, 0.14, 0.07, 0.02, m, 'cyl16');
      k.S('glow', O, 0, 0.165, 0.14, 0.04, c('gem', '#3fae5a'));
    } else {
      k.P('metal', O, 'torus', 0, 0.19, 0, 0.14, 0.7, 0.14, m, H, 0, 0);
      k.S('glow', O, 0, 0.27, 0, 0.035, c('gem', '#c0392b'));
    }
    return 0.25;
  },
  'magic-sword': (k, O, w, d, R, c) => {
    swordFlat(k, 'glow', O, -0.38, 0.38, 0.79, 1.0, c('blade', '#d8eef8'), c('hilt', '#c9a24a'));
    k.P('glow', O, 'flat', 0.06, 0.045, -0.06, 0.5, 1, 0.02, c('glow', '#4cc9f0'), 0, 0.79, 0);
    return 0.1;
  },
  'sword-in-stone': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), hl = c('hilt', '#e2b84a');
    k.P('cave', O, 'ico', 0, 0.3, 0, 0.84, 0.7, 0.76, st);
    k.B('metal', O, 0, 0.55, 0, 0.07, 0.35, 0.025, c('blade', '#d8dde2'));
    k.B('metal', O, 0, 0.9, 0, 0.38, 0.05, 0.06, hl);
    k.C('wood', O, 0, 0.95, 0, 0.03, 0.22, LEATHER, 'cyl6');
    k.S('metal', O, 0, 1.2, 0, 0.05, hl);
    k.S('glow', O, 0, 0.92, 0.035, 0.022, '#c0392b');
    return 1.0;
  },
  'enchanted-shield': (k, O, w, d, R, c) => {
    const rim = c('rim', '#e2b84a');
    k.P('metal', O, 'cyl16', 0, 0.03, 0, 0.78, 0.05, 0.78, rim);
    k.P('metal', O, 'hemi', 0, 0.05, 0, 0.7, 0.08, 0.7, c('face', '#2f5d8a'));
    for (let i = 0; i < 4; i++) k.P('glow', O, 'flat', 0, 0.092, 0, 0.5, 1, 0.05, c('sigil', '#ffe08a'), 0, (i * Math.PI) / 4, 0);
    k.P('metal', O, 'hemi', 0, 0.08, 0, 0.16, 0.08, 0.16, rim);
    return 0.1;
  },
  'magic-cloak': (k, O, w, d, R, c) => {
    const cl = c('cloth', '#1f2a4a');
    k.P('fabric', O, 'pyr', 0, 0.02, 0.05, 0.86, 0.04, 0.82, cl, 0, Math.PI / 4, 0);
    for (let i = 0; i < 3; i++) k.P('fabric', O, 'cyl16', -0.2 + i * 0.2, 0.03, 0.12, 0.08, 0.6, 0.05, tint(cl, -0.15), H, 0, 0);
    k.S('metal', O, 0, 0.04, -0.34, 0.04, c('trim', '#e2b84a'));
    for (let i = 0; i < 9; i++) k.S('glow', O, (R() - 0.5) * 0.6, 0.06, (R() - 0.2) * 0.6, 0.01, c('star', '#ffffff'));
    return 0.1;
  },
  'winged-boots': (k, O, w, d, R, c) => {
    const lt = c('leather', '#7a5638'), wg = c('wing', '#f2f0ea');
    for (const s of [-1, 1]) {
      const x = s * 0.14;
      k.C('wood', O, x, 0, -0.06, 0.09, 0.42, lt, 'cyl16');
      k.P('wood', O, 'sph', x, 0.06, 0.08, 0.17, 0.12, 0.3, tint(lt, -0.1));
      for (let i = 0; i < 3; i++) k.P('fabric', O, 'sph', x + s * (0.14 + i * 0.04), 0.3 + i * 0.05, -0.1, 0.2, 0.04, 0.08, wg, 0, 0, s * (0.5 + i * 0.25));
    }
    return 0.3;
  },
  'bag-of-holding': (k, O, w, d, R, c) => {
    const cl = c('cloth', '#7a5638');
    k.P('fabric', O, 'sph', 0, 0.22, 0.04, 0.6, 0.46, 0.54, cl);
    k.C('fabric', O, 0, 0.4, -0.02, 0.16, 0.08, tint(cl, -0.1), 'cyl16');
    k.P('glow', O, 'disc', 0, 0.485, -0.02, 0.28, 1, 0.24, c('swirl', '#9b5cff'));
    k.P('glow', O, 'disc', 0, 0.488, -0.02, 0.12, 1, 0.1, '#0a0614');
    return 0.5;
  },
  'rune-weapon-rack': (k, O, w, d, R, c) => {
    const wd = c('wood', '#3b2a22'), ru = c('rune', '#4cc9f0'), m = c('metal', '#c9ced3');
    k.B('wood', O, 0, 0, -0.25, w * 0.9, 0.08, 0.3, wd);
    k.B('wood', O, 0, 1.1, -0.3, w * 0.9, 0.12, 0.1, wd);
    for (let i = 0; i < 6; i++) k.B('glow', O, -w * 0.38 + i * (w * 0.152), 1.14, -0.248, 0.07, 0.05, 0.004, ru, 0, 0, R() * Math.PI);
    for (let i = 0; i < 4; i++) {
      const x = -w * 0.33 + (i / 3) * w * 0.66;
      k.Beam('glow', O, [x, 0.12, -0.18], [x, 1.5, -0.27], 0.022, i % 2 ? m : tint(ru, 0.4));
      if (i % 2) k.P('metal', O, 'hemi', x, 1.42, -0.26, 0.28, 0.3, 0.04, m, 0, 0, H);
      else k.B('metal', O, x, 0.45, -0.2, 0.2, 0.04, 0.05, GOLD);
    }
    return 1.0;
  },
};

// ---------------------------------------------------------------- camp, siege and battlefield
const SIEGE: Record<string, Model> = {
  'barricade-wood': (k, O, w, d, R, c, p) => {
    const wd = c('wood', WOOD);
    if (fl(p, 'junk')) {
      crate(k, at(O, -0.7, -0.05, 0.1), 0.6);
      crate(k, at(O, -0.15, -0.1, -0.15), 0.55);
      crate(k, at(O, -0.45, 0, 0.2), 0.42, 0.6);
      barrel(k, at(O, 0.4, 0), 0.9);
      barrel(k, at(O, 0.78, -0.1), 0.85);
      k.B('wood', O, 0, 0, 0.3, w * 0.6, 0.06, 0.14, tint(wd, -0.1), 0, 0.08, 0);
      return;
    }
    for (let i = 0; i < 5; i++) k.B('wood', O, (R() - 0.5) * 0.08, 0.1 + i * 0.2, 0.02, w * 0.9 - R() * 0.2, 0.18, 0.06, tint(wd, (R() - 0.5) * 0.25), 0, 0, (R() - 0.5) * 0.08);
    for (const x of [-0.7, 0, 0.7]) k.B('wood', O, x, 0, 0.06, 0.1, 1.15, 0.08, tint(wd, -0.25));
    for (const x of [-0.7, 0.7]) k.Beam('wood', O, [x, 0.9, 0.06], [x, 0, -0.5], 0.04, tint(wd, -0.2));
  },
  'cheval-de-frise': (k, O, w, d, R, c) => {
    const wd = c('wood', '#7a5a3a'), tip = c('tip', '#d8c9a4'), y = 0.45, L = 0.45;
    k.P('wood', O, 'cyl16', 0, y, 0, 0.3, w * 0.92, 0.3, wd, 0, 0, H);
    for (let i = 0; i < 5; i++) {
      const x = -w * 0.38 + i * (w * 0.19), s = i % 2 ? 1 : -1;
      for (const t of [-1, 1]) {
        const dy = t * L, dz = t * s * L;
        k.Beam('wood', O, [x, y - dy, -dz], [x, y + dy, dz], 0.03, tint(wd, 0.1), 'cyl6');
        if (dy > 0) k.P('metal', O, 'cone', x, y + dy * 1.1, dz * 1.1, 0.06, 0.12, 0.06, tip, Math.atan2(dz, dy), 0, 0);
      }
    }
  },
  sandbags: (k, O, w, d, R, c) => {
    const sk = c('sack', '#b59a6a');
    for (let row = 0; row < 3; row++)
      for (let i = 0; i < 6; i++) {
        const t = (i + (row % 2 ? 0.5 : 0)) / 6;
        if (t > 0.95) continue;
        const x = -w / 2 + 0.2 + t * (w - 0.3), z = -Math.sin(t * Math.PI) * 0.15;
        k.P('fabric', O, 'sph', x, 0.1 + row * 0.18, z, 0.36, 0.2, 0.26, tint(sk, (R() - 0.5) * 0.15), 0, (t - 0.5) * 0.4, 0);
      }
  },
  ballista: (k, O, w, d, R, c) => {
    const wd = c('wood', WOOD), m = c('metal', '#55585e'), rope = c('rope', ROPE);
    for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + Math.PI / 4; k.Beam('wood', O, [Math.cos(a) * 0.75, 0.04, Math.sin(a) * 0.75 + 0.12], [0, 0.6, 0.12], 0.05, tint(wd, -0.2)); }
    k.C('metal', O, 0, 0.55, 0.12, 0.12, 0.2, m, 'cyl16');
    k.B('wood', O, 0, 0.75, 0, 0.18, 0.14, 1.6, wd);
    for (const s of [-1, 1]) {
      k.Beam('wood', O, [0, 0.85, -0.55], [s * 0.78, 0.85, -0.3], 0.05, wd);
      k.Beam('fabric', O, [s * 0.78, 0.85, -0.3], [0, 0.88, 0.4], 0.012, rope, 'cyl6');
      k.C('fabric', O, s * 0.26, 0.72, -0.58, 0.07, 0.26, rope, 'cyl16');
    }
    k.P('wood', O, 'cyl6', 0, 0.9, -0.2, 0.04, 1.3, 0.04, DARKWOOD, H, 0, 0);
    k.P('metal', O, 'cone', 0, 0.9, -0.9, 0.08, 0.16, 0.08, m, -H, 0, 0);
    k.B('metal', O, 0, 0.7, 0.62, 0.32, 0.1, 0.1, m);
  },
  catapult: (k, O, w, d, R, c, p) => {
    const wd = c('wood', WOOD), m = c('metal', '#55585e');
    for (const x of [-0.56, 0.56]) k.B('wood', O, x, 0.3, 0, 0.16, 0.16, 1.6, wd);
    for (const z of [-0.68, 0.68]) k.B('wood', O, 0, 0.3, z, 1.28, 0.14, 0.14, tint(wd, -0.1));
    for (const [x, z] of [[-0.72, -0.5], [-0.72, 0.5], [0.72, -0.5], [0.72, 0.5]]) wheel(k, O, x, z, 0.32, tint(wd, -0.2));
    for (const x of [-0.45, 0.45]) { k.Beam('wood', O, [x, 0.4, -0.3], [x, 1.2, 0], 0.06, wd); k.Beam('wood', O, [x, 0.4, 0.3], [x, 1.2, 0], 0.06, wd); }
    k.B('wood', O, 0, 1.15, 0, 1.0, 0.12, 0.14, tint(wd, 0.1));
    k.P('metal', O, 'cyl16', 0, 0.55, 0.2, 0.22, 0.86, 0.22, m, 0, 0, H);
    k.Beam('wood', O, [0, 0.55, 0.3], [0, 1.25, -0.65], 0.07, tint(wd, 0.1));
    k.P('wood', O, 'hemi', 0, 1.42, -0.7, 0.4, 0.36, 0.4, tint(wd, -0.25), Math.PI);
    if (fl(p, 'loaded')) k.S('cave', O, 0, 1.33, -0.7, 0.13, '#8a8073', 'ico');
  },
  'battering-ram': (k, O, w, d, R, c, p) => {
    const wd = c('wood', WOOD), m = c('metal', '#55585e');
    for (const x of [-0.9, 0, 0.9]) for (const s of [-1, 1]) wheel(k, O, x, s * 0.42, 0.22, tint(wd, -0.2));
    for (const s of [-1, 1]) k.B('wood', O, 0, 0.42, s * 0.34, w * 0.82, 0.1, 0.1, tint(wd, -0.15));
    for (const x of [-0.7, 0.7]) for (const s of [-1, 1]) k.B('wood', O, x, 0.42, s * 0.34, 0.1, 1.0, 0.1, tint(wd, -0.1));
    for (const x of [-0.7, 0.7]) k.B('wood', O, x, 1.38, 0, 0.1, 0.1, 0.8, tint(wd, -0.1));
    k.P('wood', O, 'cyl16', -0.05, 0.85, 0, 0.3, w * 0.84, 0.3, wd, 0, 0, H);
    k.P('metal', O, 'cone', w * 0.43, 0.85, 0, 0.32, 0.26, 0.32, m, 0, 0, -H);
    for (const x of [-0.7, 0.7]) { k.Beam('fabric', O, [x, 0.95, 0], [x, 1.38, 0], 0.02, ROPE, 'cyl6'); k.P('metal', O, 'ring', x, 0.85, 0, 0.34, 0.6, 0.34, m, 0, 0, H); }
    if (fl(p, 'roof')) for (const s of [-1, 1]) k.B('fabric', O, 0, 1.48, s * 0.24, w * 0.86, 0.04, 0.6, c('roof', '#7a6a52'), s * 0.55, 0, 0);
  },
  'siege-tower': (k, O, w, d, R, c, p) => {
    const wd = c('wood', WOOD), Ht = 3.4;
    for (const [x, z] of [[-1, -0.45], [-1, 0.45], [1, -0.45], [1, 0.45]]) wheel(k, O, x * 0.86, z, 0.28, tint(wd, -0.25));
    k.B(fl(p, 'hide') ? 'fabric' : 'wood', O, 0, 0.2, 0, 1.6, Ht - 0.2, 1.6, fl(p, 'hide') ? c('hide', '#8a7050') : wd);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.B('wood', O, x * 0.8, 0, z * 0.8, 0.16, Ht + 0.2, 0.16, tint(wd, -0.3));
    for (const y of [1.1, 2.2]) k.B('wood', O, 0, y, 0, 1.66, 0.1, 1.66, tint(wd, -0.2));
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) k.B('wood', O, s * (0.8 - i * 0.53), Ht, -0.8, 0.22, 0.3, 0.12, tint(wd, -0.1));
    k.B('wood', O, 0, Ht - 1.0, 0.84, 1.0, 1.0, 0.1, tint(wd, 0.12));
    k.B('deco', O, 0, 0.2, 0.805, 0.6, 1.2, 0.02, DARK);
  },
  gallows: (k, O, w, d, R, c) => {
    const wd = c('wood', '#5c3a20'), rope = c('rope', ROPE);
    k.B('wood', O, 0, 0, -0.2, 1.72, 0.9, 1.32, wd);
    k.B('deco', O, 0, 0.9, -0.2, 0.48, 0.01, 0.4, tint(wd, -0.4));
    for (let i = 0; i < 4; i++) k.B('wood', O, 0, 0, 0.52 + i * 0.12, 0.8, 0.9 - (i + 1) * 0.2, 0.12, tint(wd, 0.05));
    for (const x of [-0.65, 0.65]) k.B('wood', O, x, 0.9, -0.6, 0.14, 2.0, 0.14, tint(wd, -0.15));
    k.B('wood', O, 0, 2.8, -0.6, 1.5, 0.14, 0.14, tint(wd, -0.15));
    k.Beam('wood', O, [-0.65, 2.3, -0.6], [-0.25, 2.8, -0.6], 0.04, tint(wd, -0.15));
    k.Beam('fabric', O, [0, 2.8, -0.6], [0, 1.95, -0.25], 0.012, rope, 'cyl6');
    k.P('fabric', O, 'torus', 0, 1.88, -0.25, 0.16, 0.5, 0.16, rope, H, 0, 0);
    k.B('metal', O, 0.5, 0.9, 0.0, 0.2, 0.6, 0.06, IRON);
  },
  'war-banner': (k, O, w, d, R, c) => {
    const cl = c('cloth', '#a3312c'), tr = c('trim', '#e2b84a'), wd = c('wood', '#5c3a20');
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + 0.5; k.Beam('wood', O, [Math.cos(a) * 0.25 - 0.2, 0, Math.sin(a) * 0.25], [-0.2, 0.35, 0], 0.025, wd); }
    k.C('wood', O, -0.2, 0, 0, 0.035, 2.6, wd, 'cyl6');
    k.S('metal', O, -0.2, 2.65, 0, 0.06, tr);
    k.Beam('wood', O, [-0.2, 2.45, 0], [0.45, 2.45, 0], 0.02, wd);
    k.B('fabric', O, 0.12, 1.45, 0, 0.6, 1.0, 0.02, cl);
    k.P('fabric', O, 'pyr', 0.12, 1.32, 0, 0.6, 0.26, 0.02, cl, Math.PI, 0, 0);
    k.B('fabric', O, 0.12, 2.2, 0.012, 0.6, 0.06, 0.01, tr);
    k.P('deco', O, 'disc', 0.12, 1.9, 0.013, 0.2, 1, 0.2, tr, H);
  },
  'campfire-cold': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8780');
    k.P('deco', O, 'disc', 0, 0.006, 0, 0.62, 1, 0.62, c('ash', '#6e6862'));
    for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU; k.S('lit', O, Math.cos(a) * 0.36, 0.05, Math.sin(a) * 0.36, 0.08, tint(st, (R() - 0.5) * 0.15), 'ico'); }
    for (let i = 0; i < 4; i++) { const a = R() * Math.PI; k.Beam('wood', O, [Math.cos(a) * 0.2, 0.03, Math.sin(a) * 0.2], [-Math.cos(a) * 0.15, 0.06, -Math.sin(a) * 0.15], 0.035, '#2b211b'); }
    if (fl(p, 'smoke')) puffs(k, 'fabric', O, 0, 0, 3, 0.1, 0.15, '#9a9690', R, 0.15);
  },
};

/** Every items-pack model, keyed by object id. */
export const ITEM_MODELS: Record<string, Model> = { ...FIRE, ...ENV, ...TRAPS, ...MECH, ...LOOT, ...MAGIC, ...SIEGE };

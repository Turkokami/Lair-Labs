// 3D models for the rest of the outdoor library: walls, castles, palisades, the great tree, stepping stones,
// ruined towers and the region-map icons, plus the new outdoor batch (farm, coast, swamp, winter, desert, wild, alien).
// Same conventions as props3d.ts: 1 square = 1 unit, y up, base at y = 0, centred on the footprint (w across x, d across z).
// Front is +z. Variant flags come from the object's variant f values. All shapes are Lair Labs' own, built from kit primitives.
import type { Kit, Spot } from './kit';
import type { Prop } from '../engine/map';
import { objectById } from '../library/objects';
import { type Model, DARKWOOD, STONE, tree } from './modelkit';
import { tint, sub, PT, roof, windowAt, building, liana, broadLeaf } from './models-outdoor';

const TAU = Math.PI * 2, HALF = Math.PI / 2, Q = Math.PI / 4, RT2 = Math.SQRT2;
const fl = (p: Prop, key: string) => (p?.kind ? objectById(p.kind)?.variants?.[p.v ?? 0]?.f?.[key] ?? 0 : 0);

/** A run of crenellations (merlons) along x from x0 to x1 at height y, centred on z. */
function merlons(k: Kit, O: Spot, x0: number, x1: number, y: number, z: number, depth: number, col: string) {
  const n = Math.max(2, Math.round((x1 - x0) / 0.42));
  for (let i = 0; i < n; i++) if (i % 2 === 0) {
    const a = x0 + ((x1 - x0) * i) / n, b = x0 + ((x1 - x0) * (i + 1)) / n;
    k.B('stone', O, (a + b) / 2, y, z, b - a, 0.34, depth, tint(col, (i % 4 ? 0.03 : -0.04)));
  }
}

/** Mortar lines on the face of a wall running along x (coursed ashlar look). */
function courses(k: Kit, O: Spot, L: number, H: number, z: number, col: string, R: () => number, step = 0.32) {
  const dark = tint(col, -0.32);
  for (let y = step; y < H - 0.05; y += step) {
    k.B('deco', O, 0, y, z, L, 0.018, 0.01, dark);
    const row = Math.round(y / step);
    for (let x = -L / 2 + ((row % 2) * 0.25 + 0.3 + R() * 0.05); x < L / 2 - 0.05; x += 0.5 + R() * 0.12) k.B('deco', O, x, y - step + 0.02, z, 0.016, step - 0.02, 0.01, dark);
  }
}

/** A round stone tower: tapered body, string courses, arrow slits, battlements or a cone roof. */
function roundTower(k: Kit, O: Spot, r: number, H: number, st: string, rf: string, R: () => number) {
  k.C('stone', O, 0, 0, 0, r * 1.1, 0.4, tint(st, -0.12), 'cyl16');
  k.C('stone', O, 0, 0.35, 0, r, H - 0.35, st, 'cyl16');
  for (const y of [H * 0.36, H * 0.68]) k.C('stone', O, 0, y, 0, r * 1.035, 0.1, tint(st, -0.15), 'cyl16');
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + R() * 0.3, y = 0.9 + (i % 3) * (H * 0.27);
    if (y > H - 0.6) continue;
    PT(k, 'deco', O, 'box', Math.sin(a) * (r + 0.005), y, Math.cos(a) * (r + 0.005), 0.09, 0.42, 0.04, '#1e1b18', a, 0);
  }
  // door at the front
  k.B('wood', O, 0, 0.35, r - 0.02, 0.5, 1.0, 0.1, '#5a3a22');
  k.P('wood', O, 'cyl16', 0, 1.35, r - 0.02, 0.5, 0.1, 0.5, '#5a3a22', HALF, 0, 0);
  k.C('stone', O, 0, H, 0, r * 1.12, 0.16, tint(st, -0.1), 'cyl16');
  if (rf) {
    k.P('lit', O, 'cone', 0, H + 0.16 + r * 1.1, 0, r * 2.5, r * 2.2, r * 2.5, rf);
    k.Beam('metal', O, [0, H + 0.16 + r * 2.2, 0], [0, H + 0.16 + r * 2.2 + 0.5, 0], 0.025, '#3a3a3a');
    k.P('fabric', O, 'box', 0.16, H + r * 2.2 + 0.5, 0, 0.3, 0.18, 0.02, '#a3312c');
  } else {
    const n = 12;
    for (let i = 0; i < n; i += 2) {
      const a = (i / n) * TAU;
      PT(k, 'stone', O, 'box', Math.sin(a) * r * 1.02, H + 0.16 + 0.17, Math.cos(a) * r * 1.02, r * 0.42, 0.34, 0.22, tint(st, 0.03), a, 0);
    }
    k.P('stone', O, 'disc', 0, H + 0.17, 0, r * 1.9, 1, r * 1.9, tint(st, -0.25));
  }
}

/** A square castle tower with battlements and a few arrow slits on each face. */
function squareTower(k: Kit, O: Spot, s: number, H: number, st: string, R: () => number) {
  k.B('stone', O, 0, 0, 0, s + 0.16, 0.45, s + 0.16, tint(st, -0.12));
  k.B('stone', O, 0, 0.4, 0, s, H - 0.4, s, st);
  k.B('stone', O, 0, H, 0, s + 0.18, 0.14, s + 0.18, tint(st, -0.1));
  for (const sd of [-1, 1]) {
    merlons(k, O, -s / 2 - 0.09, s / 2 + 0.09, H + 0.14, sd * (s / 2 + 0.02), 0.16, st);
    merlons(k, sub(O, 0, 0, HALF), -s / 2 - 0.09, s / 2 + 0.09, H + 0.14, sd * (s / 2 + 0.02), 0.16, st);
    for (const y of [H * 0.45, H * 0.75]) {
      k.B('deco', O, (R() - 0.5) * s * 0.4, y, sd * (s / 2 + 0.005), 0.08, 0.4, 0.02, '#1e1b18');
      k.B('deco', O, sd * (s / 2 + 0.005), y, (R() - 0.5) * s * 0.4, 0.02, 0.4, 0.08, '#1e1b18');
    }
  }
}

export const OUTDOOR_MODELS2: Record<string, Model> = {
  longhouse: (k, O, w, d, R, c) => {
    const b = building(k, O, w, d, R, { roof: 'gable', roofCol: c('roof', '#b89a5a'), wall: c('wall', '#8a6a48'), H: 1.7, boards: true, timber: false, fw: 0.94, fd: 0.78 });
    // smoke louvre on the ridge and carved crossed horns at both gable ends
    k.B('lit', O, 0, b.ridge - 0.05, 0, 0.8, 0.22, 0.5, tint(c('roof', '#b89a5a'), -0.2));
    k.P('lit', O, 'box', 0, b.ridge + 0.2, 0, 0.95, 0.05, 0.62, tint(c('roof', '#b89a5a'), -0.35));
    for (const e of [-1, 1]) for (const s of [-1, 1]) {
      const x = e * (b.W / 2 + 0.16);
      k.Beam('wood', O, [x, b.ridge - 0.45, s * 0.42], [x, b.ridge + 0.5, -s * 0.12], 0.05, DARKWOOD, 'box');
    }
    // log pile against one end
    for (let i = 0; i < 5; i++) PT(k, 'wood', O, 'cyl', -b.W / 2 - 0.25, 0.1 + (i % 3) * 0.17 + (i > 2 ? 0.08 : 0), -0.4 + (i % 3) * 0.2 - (i > 2 ? -0.1 : 0), 0.17, 0.7, 0.17, tint('#7a5634', (R() - 0.5) * 0.2), 0, HALF);
  },
  'tower-stone': (k, O, w, d, R, c) => roundTower(k, O, Math.min(w, d) * 0.38, 5.4, c('stone', '#8a8780'), c('roof', '#4f565e'), R),
  'ruin-tower': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), moss = c('moss', '#5d7a3a'), r = Math.min(w, d) * 0.4, gap = R() * TAU, n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU, dd = Math.abs(((a - gap + Math.PI * 3) % TAU) - Math.PI);
      if (dd < 0.45) continue;
      const h = (dd < 1 ? 0.3 + R() * 0.5 : 0.8 + R() * 2.2) * (1 - Math.abs(Math.sin(a * 2 + gap)) * 0.3);
      PT(k, 'stone', O, 'box', Math.sin(a) * r, h / 2, Math.cos(a) * r, (TAU * r) / n + 0.04, h, 0.42, tint(st, (R() - 0.5) * 0.16), a, 0);
      if (R() < 0.5) PT(k, 'lit', O, 'ico', Math.sin(a) * r, h + 0.02, Math.cos(a) * r, (TAU * r) / n + 0.1, 0.12, 0.46, moss, a, 0);
    }
    k.P('lit', O, 'disc', 0, 0.02, 0, r * 1.8, 1, r * 1.8, tint(st, -0.3));
    for (let i = 0; i < 14; i++) {
      const a = gap + (R() - 0.5) * 1.1, dd = r * (0.3 + R() * 1.1);
      k.S('stone', O, Math.sin(a) * dd, 0.08, Math.cos(a) * dd, 0.1 + R() * 0.17, tint(st, (R() - 0.5) * 0.25), 'ico');
    }
  },
  'wall-stone': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), H = 2.0, T = 0.42;
    k.B('stone', O, 0, 0, 0, 1.0, 0.25, T + 0.1, tint(st, -0.12));
    k.B('stone', O, 0, 0.2, 0, 1.0, H - 0.2, T, st);
    k.B('stone', O, 0, H, 0, 1.02, 0.12, T + 0.1, tint(st, -0.18));
    for (const sd of [-1, 1]) courses(k, O, 1.0, H, sd * (T / 2 + 0.003), st, R);
  },
  'wall-castle': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8378'), H = 3.2, T = 0.8;
    k.B('stone', O, 0, 0, 0, 1.0, 0.4, T + 0.24, tint(st, -0.14));
    k.B('stone', O, 0, 0.3, 0, 1.0, H - 0.3, T, st);
    for (const sd of [-1, 1]) courses(k, O, 1.0, H, sd * (T / 2 + 0.003), st, R, 0.36);
    k.B('stone', O, 0, H - 0.02, 0, 1.0, 0.04, T - 0.3, tint(st, -0.3)); // walkway
    for (const sd of [-1, 1]) {
      k.B('stone', O, 0, H, sd * (T / 2 - 0.08), 1.0, 0.12, 0.18, tint(st, -0.08));
      merlons(k, O, -0.5, 0.5, H + 0.12, sd * (T / 2 - 0.08), 0.18, st);
    }
    k.B('deco', O, 0.2, H * 0.6, T / 2 + 0.005, 0.07, 0.42, 0.02, '#1e1b18');
  },
  'castle-tower': (k, O, w, d, R, c) => squareTower(k, O, Math.min(w, d) * 0.9, 4.3, c('stone', '#8a8378'), R),
  'castle-gate': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8378'), wd = c('wood', '#6b4428'), open = fl(p, 'open') === 1, H = 3.9, s = 0.96, D = d * 0.9;
    for (const sd of [-1, 1]) {
      const T = sub(O, sd * (w / 2 - 0.5), 0);
      k.B('stone', T, 0, 0, 0, s + 0.12, 0.45, D + 0.1, tint(st, -0.12));
      k.B('stone', T, 0, 0.4, 0, s, H - 0.4, D, st);
      k.B('stone', T, 0, H, 0, s + 0.16, 0.14, D + 0.16, tint(st, -0.1));
      for (const zz of [-1, 1]) merlons(k, T, -s / 2 - 0.08, s / 2 + 0.08, H + 0.14, zz * (D / 2 + 0.02), 0.16, st);
      for (const xx of [-1, 1]) merlons(k, sub(T, 0, 0, HALF), -D / 2 - 0.08, D / 2 + 0.08, H + 0.14, xx * (s / 2 + 0.02), 0.16, st);
      for (const zz of [-1, 1]) k.B('deco', T, 0, H * 0.55, zz * (D / 2 + 0.005), 0.08, 0.45, 0.02, '#1e1b18');
    }
    // the bridge over the passage with an arch beneath
    const bh = 2.3, pw = w - 2 * s;
    k.B('stone', O, 0, bh, 0, pw + 0.04, H - 0.4 - bh, D * 0.86, st);
    for (const zz of [-1, 1]) {
      k.P('stone', O, 'cyl16', 0, bh, zz * (D * 0.43), pw, 0.1, pw * 0.7, tint(st, -0.15), HALF, 0, 0);
      merlons(k, O, -pw / 2, pw / 2, H - 0.4, zz * (D * 0.43 - 0.06), 0.16, st);
    }
    k.B('deco', O, 0, 0, 0, pw, 0.01, D, '#4a4540');
    // portcullis: raised (just its spikes showing) or down
    const pY = open ? bh - 0.2 : 0;
    for (let i = 0; i < 6; i++) k.B('metal', O, -pw / 2 + 0.08 + (i * (pw - 0.16)) / 5, pY, D * 0.3, 0.04, bh - pY - 0.02, 0.04, '#3a3a3a');
    for (const y of open ? [bh - 0.1] : [0.5, 1.2, 1.9]) k.B('metal', O, 0, y, D * 0.3, pw, 0.04, 0.05, '#3a3a3a');
    if (!open) for (const sd of [-1, 1]) k.B('wood', O, sd * pw * 0.25, 0, -D * 0.3, pw * 0.48, bh - 0.05, 0.08, wd);
  },
  palisade: (k, O, w, d, R, c) => {
    const wd = c('wood', '#7a5634'), n = 6;
    for (let i = 0; i < n; i++) {
      const x = -0.5 + (i + 0.5) / n, h = 2.0 + R() * 0.35, r = 0.085 + R() * 0.012, lean = (R() - 0.5) * 0.05;
      k.P('wood', O, 'cyl', x, h / 2, (R() - 0.5) * 0.04, r * 2, h, r * 2, tint(wd, (R() - 0.5) * 0.2), lean, 0, lean);
      k.P('wood', O, 'cone', x, h + 0.13, 0, r * 2, 0.26, r * 2, tint(wd, 0.12));
    }
    for (const y of [0.55, 1.5]) k.B('wood', O, 0, y, -0.11, 1.0, 0.09, 0.06, tint(wd, -0.25));
  },
  'palisade-gate': (k, O, w, d, R, c, p) => {
    const wd = c('wood', '#7a5634'), open = fl(p, 'open') === 1, L = w * 0.86;
    for (const sd of [-1, 1]) {
      k.C('wood', O, sd * (w / 2 - 0.08), 0, 0, 0.13, 2.9, tint(wd, -0.1), 'cyl');
      k.P('wood', O, 'cone', sd * (w / 2 - 0.08), 3.02, 0, 0.26, 0.25, 0.26, tint(wd, 0.1));
    }
    k.Beam('wood', O, [-w / 2, 2.6, 0], [w / 2, 2.6, 0], 0.08, tint(wd, -0.15), 'cyl');
    for (const sd of [-1, 1]) {
      // each leaf hinges on its post; open swings it inwards (-z)
      const hx = sd * (w / 2 - 0.15), ang = open ? sd * 1.25 : 0, H = sub(O, hx, 0, ang);
      const n = 4;
      for (let i = 0; i < n; i++) {
        const x = -sd * (((i + 0.5) / n) * (L / 2)), h = 2.0 + R() * 0.2;
        k.C('wood', H, x, 0, 0, 0.075, h, tint(wd, (R() - 0.5) * 0.18), 'cyl');
        k.P('wood', H, 'cone', x, h + 0.1, 0, 0.15, 0.2, 0.15, tint(wd, 0.1));
      }
      for (const y of [0.5, 1.5]) k.B('wood', H, -sd * (L / 4), y, -0.09, L / 2, 0.08, 0.05, tint(wd, -0.25));
      k.Beam('wood', H, [-sd * 0.05, 0.55, -0.1], [-sd * (L / 2 - 0.05), 1.5, -0.1], 0.03, tint(wd, -0.25), 'box');
    }
  },
  'fence-picket': (k, O, w, d, R, c) => {
    const wd = c('wood', '#d9cdb0');
    for (const x of [-0.5, 0.5]) k.B('wood', O, x * 0.96, 0, 0, 0.07, 0.95, 0.07, tint(wd, -0.1));
    for (const y of [0.25, 0.65]) k.B('wood', O, 0, y, -0.05, 1.0, 0.06, 0.03, tint(wd, -0.12));
    for (let i = 0; i < 7; i++) {
      const x = -0.42 + i * 0.14;
      k.B('wood', O, x, 0.04, 0, 0.08, 0.72, 0.02, tint(wd, (R() - 0.5) * 0.08));
      k.P('wood', O, 'pyr', x, 0.8, 0, 0.11, 0.08, 0.03, tint(wd, 0.04), 0, Q, 0);
    }
  },
  'ford-stones': (k, O, w, d, R, c) => {
    const st = c('stone', '#8a8780'), n = Math.max(3, Math.round(d * 1.7));
    for (let i = 0; i < n; i++) {
      const z = -d / 2 + ((i + 0.5) * d) / n, x = (R() - 0.5) * 0.35, r = 0.24 + R() * 0.08;
      k.P('lit', O, 'ico', x, 0.02, z, r * 2.1, 0.3, r * 1.8, tint(st, (R() - 0.5) * 0.15), 0, R() * TAU, 0);
      k.P('lit', O, 'disc', x, 0.17, z, r * 1.7, 1, r * 1.4, tint(st, 0.1));
      if (R() < 0.4) k.P('lit', O, 'hemi', x + 0.1, 0.16, z - 0.05, 0.22, 0.04, 0.16, '#5d7a3a');
    }
  },
  'tree-large': (k, O, w, d, R, c) => {
    const leaf = c('leaf', '#46703a'), trunk = c('trunk', '#4e3420');
    // a broad, flared old trunk with roots half sunk in the ground; then the crown
    k.P('wood', O, 'cone', 0, 0.55, 0, 1.25, 1.1, 1.25, trunk);
    k.C('wood', O, 0, 0, 0, 0.36, 2.2, trunk, 'cyl16');
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + R() * 0.4, L = 0.75 + R() * 0.45;
      k.Beam('wood', O, [Math.cos(a) * 0.25, 0.3, Math.sin(a) * 0.25], [Math.cos(a) * L, -0.08, Math.sin(a) * L], 0.1 - R() * 0.03, tint(trunk, (R() - 0.5) * 0.1), 'cone');
    }
    tree(k, O, R, leaf, trunk, 5.2, Math.min(w, d) * 0.44, false, 'round');
  },

  // ---- region (overland) icons: one square is a mile, so these are small and readable from above ----
  'region-city': (k, O, w, d, R, c) => {
    const rf = c('roof', '#a5513a'), wall = c('wall', '#8a8378'), rad = Math.min(w, d) * 0.42;
    k.Ring('stone', O, 0, 0.3, 0, rad, 0.6, wall);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      k.C('stone', O, Math.cos(a) * rad, 0, Math.sin(a) * rad, 0.1, 0.5, tint(wall, 0.05), 'cyl16');
      k.P('lit', O, 'cone', Math.cos(a) * rad, 0.58, Math.sin(a) * rad, 0.24, 0.18, 0.24, rf);
    }
    for (let i = 0; i < 20; i++) {
      const a = R() * TAU, r = Math.sqrt(R()) * rad * 0.82, x = Math.cos(a) * r, z = Math.sin(a) * r, h = 0.16 + R() * 0.2;
      k.B('lit', O, x, 0, z, 0.22, h, 0.18, '#d8ccb0');
      k.P('lit', O, 'pyr', x, h + 0.06, z, 0.3, 0.13, 0.26, tint(rf, (R() - 0.5) * 0.2), 0, Q, 0);
    }
    k.C('stone', O, 0, 0, 0, 0.18, 0.9, '#c9c0ae', 'cyl16');
    k.P('lit', O, 'cone', 0, 1.05, 0, 0.42, 0.32, 0.42, rf);
  },
  'region-castle': (k, O, w, d, R, c) => {
    const wall = c('wall', '#8a8378'), ban = c('banner', '#2f5d8a'), s = Math.min(w, d) * 0.5;
    k.P('lit', O, 'hemi', 0, 0, 0, s * 2.4, 0.3, s * 2.4, '#7a8a50');
    k.B('stone', O, 0, 0.25, 0, s, 0.35, s, wall);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      k.C('stone', O, (x * s) / 2, 0.25, (z * s) / 2, 0.11, 0.55, tint(wall, 0.05), 'cyl16');
      k.P('lit', O, 'cone', (x * s) / 2, 0.88, (z * s) / 2, 0.26, 0.16, 0.26, '#4f565e');
    }
    k.B('stone', O, 0, 0.6, -0.05, s * 0.42, 0.55, s * 0.42, tint(wall, 0.08));
    k.Beam('metal', O, [0, 1.15, -0.05], [0, 1.55, -0.05], 0.012, '#3a3a3a');
    k.B('fabric', O, 0.1, 1.38, -0.05, 0.2, 0.14, 0.01, ban);
  },
  'region-tower': (k, O, w, d, R, c) => {
    const wall = c('wall', '#c9c0ae'), rf = c('roof', '#4a3a6a');
    k.C('stone', O, 0, 0, 0, 0.13, 0.85, wall, 'cyl16');
    k.C('stone', O, 0, 0.85, 0, 0.16, 0.05, tint(wall, -0.15), 'cyl16');
    k.P('lit', O, 'cone', 0, 1.06, 0, 0.36, 0.38, 0.36, rf);
    k.B('glow', O, 0, 0.62, 0.13, 0.05, 0.08, 0.01, '#d9a640');
  },
  'region-ruins': (k, O, w, d, R, c) => {
    const st = c('stone', '#9a9488');
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + R() * 0.3;
      k.C('stone', O, Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26, 0.05, 0.15 + R() * 0.35, tint(st, (R() - 0.5) * 0.15), 'cyl16');
    }
    for (let i = 0; i < 6; i++) k.S('stone', O, (R() - 0.5) * 0.6, 0.03, (R() - 0.5) * 0.6, 0.04 + R() * 0.03, tint(st, -0.1), 'ico');
  },
  'region-cave': (k, O, w, d, R, c) => {
    const rock = c('rock', '#8a8270');
    k.P('lit', O, 'ico', 0, 0.12, -0.05, 0.85, 0.7, 0.7, rock, 0, R() * TAU, 0);
    k.P('deco', O, 'hemi', 0, 0.02, 0.25, 0.32, 0.28, 0.1, '#14110e', HALF, 0, 0);
  },
  'region-port': (k, O, w, d, R, c) => {
    const rf = c('roof', '#a5513a'), sail = c('sail', '#e6dcc4');
    for (let i = 0; i < 6; i++) {
      const x = (R() - 0.5) * w * 0.7, z = -d * 0.25 + (R() - 0.5) * d * 0.3;
      k.B('lit', O, x, 0, z, 0.2, 0.16, 0.18, '#d8ccb0');
      k.P('lit', O, 'pyr', x, 0.22, z, 0.28, 0.12, 0.26, rf, 0, Q, 0);
    }
    for (const x of [-0.5, 0.2]) k.B('wood', O, x, 0, d * 0.15, 0.1, 0.06, 0.6, '#7a5634');
    // a little ship
    const S = sub(O, 0.55, d * 0.3);
    k.P('wood', S, 'hemi', 0, 0.12, 0, 0.22, 0.14, 0.55, '#6b4428', Math.PI, 0, 0);
    k.Beam('wood', S, [0, 0.1, 0], [0, 0.55, 0], 0.012, '#3a2418');
    k.B('fabric', S, 0, 0.22, 0, 0.02, 0.28, 0.32, sail);
  },
  'region-camp': (k, O, w, d, R, c) => {
    const cv = c('canvas', '#cbb994');
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.4, x = Math.cos(a) * 0.24, z = Math.sin(a) * 0.24;
      k.P('fabric', O, 'pyr', x, 0.11, z, 0.24, 0.22, 0.24, tint(cv, (R() - 0.5) * 0.15), 0, a, 0);
    }
    k.S('glow', O, 0, 0.04, 0, 0.05, '#ffb02e');
  },
  'region-volcano': (k, O, w, d, R, c) => {
    const rock = c('rock', '#4a4040'), fire = c('fire', '#e2481b'), h = 1.5;
    k.P('lit', O, 'cone', 0, h / 2, 0, 1.9, h, 1.9, tint(rock, 0.15));
    k.P('cave', O, 'cyl16', 0, h - 0.18, 0, 0.62, 0.36, 0.62, tint(rock, -0.1));
    k.P('glow', O, 'disc', 0, h + 0.005, 0, 0.5, 1, 0.5, fire);
    for (let i = 0; i < 4; i++) {
      const a = R() * TAU;
      k.Beam('glow', O, [Math.cos(a) * 0.25, h - 0.05, Math.sin(a) * 0.25], [Math.cos(a) * 0.85, 0.05, Math.sin(a) * 0.85], 0.035, tint(fire, -0.2), 'cyl6');
    }
    for (let i = 0; i < 3; i++) k.S('lit', O, (R() - 0.5) * 0.2, h + 0.3 + i * 0.25, (R() - 0.5) * 0.2, 0.12 + i * 0.06, '#9a9692');
  },
  'region-swamp': (k, O, w, d, R, c) => {
    const reed = c('reed', '#6a7a3a'), water = c('water', '#4a6a5a');
    for (let i = 0; i < 3; i++) k.P('deco', O, 'disc', (i - 1) * 0.55, 0.01, (R() - 0.5) * 0.3, 0.55, 1, 0.38, water);
    for (let i = 0; i < 26; i++) {
      const x = (R() - 0.5) * w * 0.9, z = (R() - 0.5) * d * 0.8, h = 0.15 + R() * 0.2;
      k.Beam('fabric', O, [x, 0, z], [x + (R() - 0.5) * 0.05, h, z], 0.01, tint(reed, (R() - 0.5) * 0.2), 'cyl6');
    }
  },
  'region-compass': (k, O, w, d, R, c) => {
    const ink = c('ink', '#3a2a1c'), gold = c('gold', '#c99a2e'), r = Math.min(w, d) * 0.42;
    k.Ring('metal', O, 0, 0.03, 0, r * 0.62, 0.05, gold);
    for (let i = 0; i < 8; i++) {
      const a = Math.PI + (i / 8) * TAU, L = i % 2 ? r * 0.55 : r;
      PT(k, 'metal', O, 'oct', Math.sin(a) * L * 0.5, 0.03, Math.cos(a) * L * 0.5, 0.16, 0.05, L, i === 0 ? '#a3312c' : i % 2 ? gold : ink, a, 0);
    }
    k.C('metal', O, 0, 0.02, 0, 0.08, 0.05, gold, 'cyl16');
  },
};

void [roof, windowAt, liana, broadLeaf, STONE, RT2];

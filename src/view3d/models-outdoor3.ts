// 3D models for the third outdoor batch (outdoors3.ts): farm, coast, swamp, winter, desert, wild and alien pieces.
// Same conventions as props3d.ts: 1 square = 1 unit, y up, base at y = 0, centred on the footprint (w across x, d across z).
// Front (the bottom edge in the overhead art) is +z. All shapes are Lair Labs' own, built from the kit's primitives.
import type { Kit, Spot } from './kit';
import { type Model, DARKWOOD, STONE, tree } from './modelkit';
import { tint, sub, PT, roof, building } from './models-outdoor';

const TAU = Math.PI * 2, HALF = Math.PI / 2, Q = Math.PI / 4, RT2 = Math.SQRT2;
const THATCH = '#b89a5a';

/** A conical roof (thatch, felt, hide) with a ring of eave stubble and a smoke hole or a cap. */
function cone(k: Kit, O: Spot, y: number, r: number, h: number, col: string, R: () => number) {
  k.P('lit', O, 'cone', 0, y + h / 2, 0, r * 2, h, r * 2, col);
  for (let i = 0; i < 3; i++) k.C('lit', O, 0, y + h * (0.12 + i * 0.25), 0, r * (0.95 - i * 0.26), 0.05, tint(col, -0.22), 'cyl16');
  k.C('lit', O, 0, y - 0.04, 0, r * 1.01, 0.1, tint(col, -0.12), 'cyl16');
  void R;
}

/** A post-and-rail fence from a to b (x,z pairs), posts about every 0.75. */
function rails(k: Kit, O: Spot, a: number[], b: number[], col: string) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 0.75));
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
    k.B('wood', O, x, 0, z, 0.09, 0.95, 0.09, tint(col, -0.1));
  }
  for (const y of [0.45, 0.82]) k.Beam('wood', O, [a[0], y, a[1]], [b[0], y, b[1]], 0.03, col, 'box');
}

/** A thatched hut-on-stilts deck at height y, size W x D, with a ladder at the front. */
function stilts(k: Kit, O: Spot, W: number, D: number, y: number, wd: string) {
  for (const x of [-W / 2 + 0.1, 0, W / 2 - 0.1]) for (const z of [-D / 2 + 0.1, D / 2 - 0.1]) k.C('wood', O, x, -0.3, z, 0.07, y + 0.3, tint(wd, -0.15), 'cyl');
  k.B('wood', O, 0, y, 0, W, 0.12, D, wd);
  for (let x = -W / 2 + 0.15; x < W / 2; x += 0.22) k.B('wood', O, x, y + 0.121, 0, 0.012, 0.005, D, tint(wd, -0.35));
  for (const sx of [-0.18, 0.18]) k.Beam('wood', O, [sx, 0, D / 2 + 0.55], [sx, y + 0.1, D / 2 + 0.02], 0.025, wd);
  for (let i = 1; i < 6; i++) { const t = i / 6; k.Beam('wood', O, [-0.18, y * t, D / 2 + 0.55 - 0.53 * t], [0.18, y * t, D / 2 + 0.55 - 0.53 * t], 0.015, wd); }
}

export const OUTDOOR_MODELS3: Record<string, Model> = {
  // ---- farm and village ----
  'tree-fruit': (k, O, w, d, R, c) => {
    const leaf = c('leaf', '#4d7a36'), fruit = c('fruit', '#c23a2a'), h = 2.0, r = Math.min(w, d) * 0.4;
    tree(k, O, R, leaf, c('trunk', '#5a3d24'), h, r, false, 'round');
    const H = h * 1.3, rr = r * 1.25;
    for (let i = 0; i < 22; i++) {
      const a = R() * TAU, ph = 0.35 + R() * 1.1;
      k.S('lit', O, Math.cos(a) * Math.sin(ph) * rr * 0.92, H * 0.78 + Math.cos(ph) * rr * 0.62, Math.sin(a) * Math.sin(ph) * rr * 0.92, 0.065, tint(fruit, (R() - 0.5) * 0.2));
    }
  },
  watermill: (k, O, w, d, R, c) => {
    const b = building(k, O, w, d, R, { roof: 'gable', roofCol: c('roof', '#6e4a32'), wall: c('wall', '#b8ab92'), H: 2.6, chim: [[0.25, 0.22]], timber: true, fw: 0.72 });
    const wd = '#6a4a2e', x = b.W / 2 + 0.28, yc = 1.0, Rw = 1.0;
    const Wh = sub(O, x, 0);
    for (const s of [-0.16, 0.16]) k.P('wood', Wh, 'ring', s, yc, 0, Rw * 2, 1.2, Rw * 2, tint(wd, -0.1), 0, 0, HALF);
    k.Beam('wood', O, [b.W / 2 - 0.05, yc, 0], [x + 0.3, yc, 0], 0.09, DARKWOOD, 'cyl');
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      k.P('wood', Wh, 'box', 0, yc + Math.cos(a) * Rw * 0.88, Math.sin(a) * Rw * 0.88, 0.34, 0.28, 0.04, tint(wd, 0.08), a, 0, 0);
      if (i % 2 === 0) k.Beam('wood', Wh, [0, yc, 0], [0, yc + Math.cos(a) * Rw, Math.sin(a) * Rw], 0.025, wd, 'box');
    }
    // the millrace chute feeding the top of the wheel
    k.B('wood', O, x, yc + Rw + 0.15, -0.85, 0.42, 0.12, 1.3, wd);
    k.B('deco', O, x, yc + Rw + 0.25, -0.85, 0.3, 0.02, 1.3, '#4a7a8a');
    for (const z of [-1.3, -0.5]) k.B('wood', O, x, 0, z, 0.08, yc + Rw + 0.15, 0.08, DARKWOOD);
  },
  dovecote: (k, O, w, d, R, c) => {
    const wall = c('wall', '#d8ccb0'), rf = c('roof', '#a5513a'), r = Math.min(w, d) * 0.36, H = 2.2;
    k.C('stone', O, 0, 0, 0, r * 1.1, 0.25, STONE, 'cyl16');
    k.C('lit', O, 0, 0.2, 0, r, H - 0.2, wall, 'cyl16');
    k.C('lit', O, 0, H * 0.55, 0, r * 1.06, 0.06, tint(wall, -0.2), 'cyl16');
    for (let row = 0; row < 3; row++) for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + row * 0.45, y = H * 0.62 + row * 0.22;
      if (y > H - 0.12) continue;
      PT(k, 'deco', O, 'box', Math.sin(a) * (r + 0.003), y, Math.cos(a) * (r + 0.003), 0.07, 0.08, 0.02, '#1e1b18', a, 0);
    }
    k.P('lit', O, 'cone', 0, H + 0.45, 0, r * 2.6, 0.9, r * 2.6, rf);
    k.C('lit', O, 0, H + 0.82, 0, 0.09, 0.22, tint(wall, -0.05), 'cyl16');
    k.P('lit', O, 'cone', 0, H + 1.12, 0, 0.26, 0.2, 0.26, rf);
    for (let i = 0; i < 3; i++) k.S('lit', O, (R() - 0.5) * r * 1.6, H + 0.1, r * 0.9 + 0.05, 0.05, '#ece8e0');
  },
  kiln: (k, O, w, d, R, c) => {
    const clay = c('clay', '#a8684a'), r = Math.min(w, d) * 0.4;
    k.C('stone', O, 0, 0, 0, r * 1.08, 0.2, tint(clay, -0.25), 'cyl16');
    k.P('lit', O, 'hemi', 0, 0.15, 0, r * 2, r * 2.1, r * 2, clay);
    for (let i = 0; i < 3; i++) k.P('lit', O, 'hemi', 0, 0.15, 0, r * 2.02, r * (0.5 + i * 0.5), r * 2.02, tint(clay, -0.08 - i * 0.04));
    k.C('lit', O, 0, r * 1.05, 0, 0.18, 0.3, tint(clay, -0.15), 'cyl16');
    k.P('deco', O, 'disc', 0, r * 1.05 + 0.31, 0, 0.26, 1, 0.26, '#1d1916');
    // the fire mouth
    k.B('stone', O, 0, 0, r * 0.82, 0.62, 0.55, 0.42, tint(clay, -0.2));
    k.B('glow', O, 0, 0.06, r * 0.82 + 0.212, 0.36, 0.32, 0.01, '#ff8a2a');
    for (let i = 0; i < 6; i++) k.B('wood', O, (R() - 0.5) * 0.9, 0, r + 0.55 + R() * 0.25, 0.5, 0.08, 0.08, tint('#7a5634', (R() - 0.5) * 0.2), 0, R() * TAU);
  },
  'pumpkin-patch': (k, O, w, d, R, c) => {
    const soil = c('soil', '#5a4030'), crop = c('crop', '#e0822a'), leaf = c('leaf', '#4f7a34'), cabbage = crop.toLowerCase() === '#9cc070';
    k.B('lit', O, 0, -0.02, 0, w * 0.9, 0.06, d * 0.9, soil);
    for (let z = -d * 0.36; z <= d * 0.37; z += d * 0.24) {
      k.P('lit', O, 'cyl', 0, 0.05, z + 0.08, 0.14, w * 0.85, 0.1, tint(soil, -0.18), 0, 0, HALF);
      for (let x = -w * 0.34; x <= w * 0.35; x += w * 0.19) {
        const px = x + (R() - 0.5) * 0.08, pz = z + (R() - 0.5) * 0.06, s = 0.14 + R() * 0.05;
        for (let i = 0; i < 3; i++) PT(k, 'fabric', O, 'sph', px + (R() - 0.5) * 0.2, 0.06, pz + (R() - 0.5) * 0.16, 0.2, 0.025, 0.12, leaf, R() * TAU, 0.2);
        if (cabbage) k.S('lit', O, px, s * 0.8, pz, s * 0.9, tint(crop, (R() - 0.5) * 0.15), 'ico');
        else {
          k.P('lit', O, 'sph', px, s * 0.7, pz, s * 2.3, s * 1.5, s * 2.1, tint(crop, (R() - 0.5) * 0.15));
          k.Beam('wood', O, [px, s * 1.35, pz], [px + 0.02, s * 1.55, pz], 0.018, '#5a6a2a', 'cyl6');
        }
      }
    }
  },
  'animal-pen': (k, O, w, d, R, c) => {
    const wd = c('wood', '#8a6a48'), gr = c('ground', '#6a5236'), X = w * 0.43, Z = d * 0.43;
    k.P('lit', O, 'disc', 0, 0.01, 0, w * 0.82, 1, d * 0.82, gr);
    rails(k, O, [-X, -Z], [X, -Z], wd); rails(k, O, [-X, -Z], [-X, Z], wd); rails(k, O, [X, -Z], [X, Z], wd);
    rails(k, O, [-X, Z], [-X * 0.25, Z], wd); rails(k, O, [X * 0.25, Z], [X, Z], wd);
    // trough
    k.B('wood', O, -0.55, 0, -Z + 0.35, 0.95, 0.3, 0.3, '#7a5634');
    k.B('deco', O, -0.55, 0.27, -Z + 0.35, 0.8, 0.02, 0.18, '#4a6a7a');
    for (let i = 0; i < 4; i++) k.P('lit', O, 'hemi', (R() - 0.5) * w * 0.6, 0, (R() - 0.5) * d * 0.5, 0.5 + R() * 0.4, 0.04, 0.4, tint(gr, -0.15));
  },
  'smithy-shed': (k, O, w, d, R, c) => {
    const rf = c('roof', '#6e4a32'), wd = c('wood', '#6b4428'), W = w * 0.86, D = d * 0.76, H = 2.2;
    for (const x of [-W / 2, W / 2]) for (const z of [-D / 2, D / 2]) k.B('wood', O, x, 0, z, 0.14, H, 0.14, wd);
    for (const z of [-D / 2, D / 2]) k.B('wood', O, 0, H - 0.12, z, W + 0.1, 0.12, 0.12, wd);
    roof(k, O, W, D, H, 'gable', rf, R);
    k.B('stone', O, 0, 0, 0, W + 0.2, 0.06, D + 0.2, '#6a6258');
    // forge with coals and a chimney through the roof
    const fx = -W / 2 + 0.6;
    k.B('stone', O, fx, 0, -D / 2 + 0.45, 0.95, 0.85, 0.75, STONE);
    k.B('glow', O, fx, 0.85, -D / 2 + 0.45, 0.6, 0.04, 0.45, '#ff6a1a');
    k.B('stone', O, fx, 0.85, -D / 2 + 0.2, 0.55, 2.4, 0.3, tint(STONE, -0.15));
    k.B('stone', O, fx, 1.5, -D / 2 + 0.35, 0.8, 0.5, 0.6, tint(STONE, -0.1));
    // anvil on a stump, quench barrel, tools
    k.C('wood', O, 0.25, 0, 0.1, 0.22, 0.45, '#6a4a2e', 'cyl16');
    k.B('metal', O, 0.25, 0.45, 0.1, 0.5, 0.14, 0.2, '#3a3c40');
    k.P('metal', O, 'cone', 0.6, 0.53, 0.1, 0.14, 0.3, 0.14, '#3a3c40', 0, 0, -HALF);
    k.C('wood', O, W / 2 - 0.35, 0, -D / 2 + 0.35, 0.26, 0.6, '#7a5634', 'cyl16');
    k.P('deco', O, 'disc', W / 2 - 0.35, 0.58, -D / 2 + 0.35, 0.44, 1, 0.44, '#2a3a40');
    for (let i = 0; i < 4; i++) k.B('metal', O, -0.2 + i * 0.16, 1.1, -D / 2 - 0.05, 0.03, 0.5, 0.03, '#4a4c50');
  },
  granary: (k, O, w, d, R, c) => {
    const rf = c('roof', THATCH), wall = c('wall', '#9a7a52'), W = w * 0.78, D = d * 0.72, y0 = 0.6;
    for (const x of [-W / 2 + 0.15, 0, W / 2 - 0.15]) for (const z of [-D / 2 + 0.15, 0, D / 2 - 0.15]) {
      k.P('stone', O, 'cone', x, 0.25, z, 0.22, 0.5, 0.22, STONE, Math.PI, 0, 0);
      k.P('stone', O, 'hemi', x, 0.48, z, 0.42, 0.14, 0.42, tint(STONE, 0.05));
    }
    k.B('wood', O, 0, y0, 0, W, 1.25, D, wall);
    for (let x = -W / 2 + 0.12; x < W / 2; x += 0.2) for (const s of [-1, 1]) k.B('wood', O, x, y0 + 0.02, s * (D / 2 + 0.005), 0.02, 1.2, 0.01, tint(wall, -0.3));
    k.B('wood', O, 0, y0 + 0.1, D / 2 + 0.01, 0.45, 0.85, 0.04, tint(wall, -0.2));
    roof(k, O, W, D, y0 + 1.25, 'hip', rf, R);
    for (const sx of [-0.17, 0.17]) k.Beam('wood', O, [sx, 0, D / 2 + 0.5], [sx, y0 + 0.1, D / 2 + 0.03], 0.02, DARKWOOD, 'box');
    for (let i = 1; i < 4; i++) k.Beam('wood', O, [-0.17, (i * y0) / 4, D / 2 + 0.5 - (i * 0.47) / 4], [0.17, (i * y0) / 4, D / 2 + 0.5 - (i * 0.47) / 4], 0.015, DARKWOOD, 'box');
  },

  // ---- coast ----
  lighthouse: (k, O, w, d, R, c) => {
    const wall = c('wall', '#e6e0d2'), band = c('band', '#a3312c'), rf = c('roof', '#33373c'), n = 6, sh = 1.15;
    k.C('stone', O, 0, 0, 0, 1.35, 0.55, '#8a8780', 'cyl16');
    k.C('stone', O, 0, 0.5, 0, 1.42, 0.1, tint('#8a8780', -0.2), 'cyl16');
    for (let i = 0; i < n; i++) {
      const r0 = 0.95 - i * 0.045;
      k.P('lit', O, 'cyl16', 0, 0.55 + i * sh + sh / 2, 0, r0 * 2, sh, r0 * 2, i % 2 ? band : wall);
    }
    const top = 0.55 + n * sh;
    for (let i = 0; i < 4; i++) { const a = i * 1.7 + 0.3, y = 1.4 + i * 1.5; PT(k, 'deco', O, 'box', Math.sin(a) * (0.9 - i * 0.07), y, Math.cos(a) * (0.9 - i * 0.07), 0.16, 0.32, 0.04, '#25303a', a, 0); }
    k.B('wood', O, 0, 0.55, 0.92, 0.45, 0.95, 0.12, '#5a3a22');
    // gallery and lamp room
    k.C('metal', O, 0, top, 0, 0.92, 0.1, '#33373c', 'cyl16');
    k.Ring('metal', O, 0, top + 0.42, 0, 0.88, 0.04, '#33373c');
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; k.Beam('metal', O, [Math.cos(a) * 0.88, top + 0.1, Math.sin(a) * 0.88], [Math.cos(a) * 0.88, top + 0.44, Math.sin(a) * 0.88], 0.012, '#33373c', 'cyl6'); }
    k.C('glow', O, 0, top + 0.1, 0, 0.48, 0.8, '#ffd27a', 'cyl16');
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; k.Beam('metal', O, [Math.cos(a) * 0.5, top + 0.1, Math.sin(a) * 0.5], [Math.cos(a) * 0.5, top + 0.9, Math.sin(a) * 0.5], 0.025, rf, 'cyl6'); }
    k.P('lit', O, 'cone', 0, top + 0.9 + 0.3, 0, 1.2, 0.6, 1.2, rf);
    k.S('metal', O, 0, top + 1.55, 0, 0.08, '#d4a640');
    return top + 0.5;
  },
  'fishing-hut': (k, O, w, d, R, c) => {
    const rf = c('roof', THATCH), wd = c('wood', '#7a6448'), y = 0.7;
    stilts(k, O, w * 0.9, d * 0.88, y, wd);
    const W = w * 0.72, D = d * 0.5, z0 = -d * 0.16;
    k.B('wood', O, 0, y + 0.12, z0, W, 1.35, D, tint(wd, 0.06));
    for (let x = -W / 2 + 0.1; x < W / 2; x += 0.18) k.B('wood', O, x, y + 0.14, z0 + D / 2 + 0.006, 0.02, 1.3, 0.01, tint(wd, -0.3));
    k.B('wood', O, 0.25, y + 0.12, z0 + D / 2 + 0.02, 0.45, 1.0, 0.04, '#4a3424');
    k.B('deco', O, -0.35, y + 0.75, z0 + D / 2 + 0.01, 0.3, 0.26, 0.02, '#25303a');
    roof(k, sub(O, 0, z0), W, D, y + 1.47, 'gable', rf, R);
    // nets hung on a rail on the porch and a couple of floats
    k.Beam('wood', O, [-W / 2, y + 1.1, d * 0.38], [-0.05, y + 1.1, d * 0.38], 0.025, DARKWOOD);
    for (const x of [-W / 2, -0.05]) k.B('wood', O, x, y + 0.12, d * 0.38, 0.05, 1.0, 0.05, DARKWOOD);
    PT(k, 'fabric', O, 'box', -W / 4 - 0.02, y + 0.75, d * 0.38, W / 2 - 0.1, 0.7, 0.01, '#c9b88a', 0, 0.05);
    for (let i = 0; i < 3; i++) k.S('lit', O, -W / 2 + 0.15 + i * 0.25, y + 0.42, d * 0.39, 0.05, i % 2 ? '#e8dcc0' : '#c23a2a');
  },
  shipwreck: (k, O, w, d, R, c) => {
    const wd = c('wood', '#5a4232'), L = w * 0.86, t = 0.55, ct = Math.cos(t), st = Math.sin(t);
    const pt = (x: number, th: number): number[] => {
      const sc = Math.sqrt(Math.max(0.08, 1 - (2 * x / L) ** 2)), y0 = 0.75 - Math.sin(th) * 0.75 * sc, z0 = Math.cos(th) * 0.8 * sc;
      return [x, y0 * ct - z0 * st + 0.35, y0 * st + z0 * ct];
    };
    const ribs = 9;
    for (let i = 0; i <= ribs; i++) {
      const x = -L / 2 + 0.2 + ((L - 0.4) * i) / ribs;
      let prev = pt(x, 0.15);
      for (let j = 1; j <= 6; j++) { const th = 0.15 + (j / 6) * (Math.PI - 0.3); const nx = pt(x, th); if (!(i % 3 === 2 && j < 2)) k.Beam('wood', O, prev, nx, 0.045, tint(wd, -0.1), 'box'); prev = nx; }
    }
    // planking on the low (ground) side; holes on the upper side
    for (let j = 0; j < 9; j++) {
      const th = Math.PI * 0.5 + (j / 9) * (Math.PI * 0.42);
      for (let i = 0; i < ribs; i++) {
        if (R() < 0.18) continue;
        const x0 = -L / 2 + 0.2 + ((L - 0.4) * i) / ribs, x1 = -L / 2 + 0.2 + ((L - 0.4) * (i + 1)) / ribs;
        k.Beam('wood', O, pt(x0, th), pt(x1, th), 0.06, tint(wd, (R() - 0.5) * 0.18), 'box');
      }
    }
    for (let j = 0; j < 5; j++) {
      const th = Math.PI * 0.12 + (j / 5) * (Math.PI * 0.35);
      for (let i = 0; i < ribs; i++) if (R() < 0.35) k.Beam('wood', O, pt(-L / 2 + 0.2 + ((L - 0.4) * i) / ribs, th), pt(-L / 2 + 0.2 + ((L - 0.4) * (i + 1)) / ribs, th), 0.06, tint(wd, 0.05), 'box');
    }
    k.Beam('wood', O, pt(-L / 2, HALF), pt(L / 2, HALF), 0.09, tint(wd, -0.25), 'box');
    k.Beam('wood', O, [-0.4, 0.15, -0.3], [L / 2 + 0.4, 0.08, -d * 0.45], 0.08, tint(wd, 0.1), 'cyl');
    for (let i = 0; i < 6; i++) k.B('wood', O, (R() - 0.5) * L, 0, (R() - 0.5) * d * 0.8, 0.5, 0.05, 0.12, tint(wd, 0.1), 0, R() * TAU);
  },
  'sea-stack': (k, O, w, d, R, c) => {
    const st = c('stone', '#7a746a'), top = c('top', '#6a8a44'), r = Math.min(w, d) * 0.38;
    let y = 0;
    for (let i = 0; i < 4; i++) {
      const s = r * (1.15 - i * 0.14), h = 1.0 + R() * 0.3;
      k.P('lit', O, 'ico', (R() - 0.5) * 0.12, y + h / 2, (R() - 0.5) * 0.12, s * 2, h * 1.25, s * 1.9, tint(st, (R() - 0.5) * 0.14), 0, R() * TAU, 0);
      y += h * 0.82;
    }
    k.P('lit', O, 'hemi', 0, y + 0.18, 0, r * 1.7, 0.22, r * 1.6, top);
    for (let i = 0; i < 4; i++) { const a = R() * TAU; k.S('lit', O, Math.cos(a) * r * 0.5, y + 0.3, Math.sin(a) * r * 0.5, 0.06, '#efece6'); }
    for (let i = 0; i < 5; i++) k.S('stone', O, (R() - 0.5) * w * 0.9, 0.05, (R() - 0.5) * d * 0.9, 0.1 + R() * 0.12, tint(st, -0.1), 'ico');
  },
  driftwood: (k, O, w, d, R, c) => {
    const wd = c('wood', '#b8ab92');
    for (let i = 0; i < 3; i++) {
      const z = (i - 1) * 0.22, L = w * (0.55 + R() * 0.3), a = (R() - 0.5) * 0.35, r = 0.07 + R() * 0.04;
      PT(k, 'wood', O, 'cyl', (R() - 0.5) * 0.3, r, z, r * 2, L, r * 2, tint(wd, (R() - 0.5) * 0.15), HALF + a, HALF);
      if (R() < 0.7) k.Beam('wood', O, [0.2, r, z], [0.45, r + 0.25, z + 0.18], 0.025, tint(wd, -0.1), 'cone');
    }
  },
  'tide-pools': (k, O, w, d, R, c) => {
    const st = c('stone', '#7a746a'), water = c('water', '#3f7a86');
    for (let i = 0; i < 3; i++) k.P('deco', O, 'disc', (R() - 0.5) * w * 0.55, 0.02, (R() - 0.5) * d * 0.55, 0.55 + R() * 0.3, 1, 0.38 + R() * 0.2, water);
    for (let i = 0; i < 9; i++) {
      const s = 0.18 + R() * 0.2;
      k.P('lit', O, 'ico', (R() - 0.5) * w * 0.8, 0.02, (R() - 0.5) * d * 0.8, s * 2.2, s * 0.9, s * 1.8, tint(st, (R() - 0.5) * 0.2), 0, R() * TAU, 0);
    }
    for (let i = 0; i < 4; i++) k.P('lit', O, 'oct', (R() - 0.5) * w * 0.6, 0.06, (R() - 0.5) * d * 0.6, 0.16, 0.03, 0.16, '#e0703a', 0, R() * TAU, 0);
    for (let i = 0; i < 4; i++) k.P('fabric', O, 'hemi', (R() - 0.5) * w * 0.6, 0.02, (R() - 0.5) * d * 0.6, 0.3, 0.05, 0.2, '#4a6a30');
  },

  // ---- swamp ----
  'stilt-hut': (k, O, w, d, R, c) => {
    const rf = c('roof', THATCH), wd = c('wood', '#6a5638'), y = 1.0;
    stilts(k, O, w * 0.86, d * 0.8, y, wd);
    const r = Math.min(w, d) * 0.32, z0 = -0.15;
    const H = sub(O, 0, z0);
    k.C('wood', H, 0, y + 0.12, 0, r, 1.35, tint(wd, 0.1), 'cyl16');
    for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU; PT(k, 'wood', H, 'box', Math.sin(a) * (r + 0.005), y + 0.8, Math.cos(a) * (r + 0.005), 0.02, 1.3, 0.01, tint(wd, -0.3), a, 0); }
    k.B('wood', H, 0, y + 0.12, r - 0.03, 0.5, 1.0, 0.08, '#3a2a1c');
    cone(k, H, y + 1.45, r * 1.45, 1.5, rf, R);
    for (let i = 0; i < 3; i++) k.S('lit', O, -w * 0.3 + i * 0.12, y + 0.95, d * 0.38, 0.06, '#8a6a48');
  },
  boardwalk: (k, O, w, d, R, c) => {
    const wd = c('wood', '#7a6448'), y = 0.28, W = w * 0.6;
    for (let z = -d / 2 + 0.08; z < d / 2; z += 0.15) {
      if (R() < 0.06) continue;
      k.B('wood', O, (R() - 0.5) * 0.04, y, z, W, 0.05, 0.12, tint(wd, (R() - 0.5) * 0.2), 0, (R() - 0.5) * 0.06);
    }
    for (const sx of [-1, 1]) {
      k.B('wood', O, sx * (W / 2 - 0.08), y - 0.08, 0, 0.08, 0.08, d - 0.05, tint(wd, -0.2));
      for (const z of [-d / 2 + 0.1, 0, d / 2 - 0.1]) k.C('wood', O, sx * (W / 2 + 0.05), -0.4, z, 0.06, y + 0.55, tint(wd, -0.15), 'cyl');
    }
  },
  'tree-mangrove': (k, O, w, d, R, c) => {
    const leaf = c('leaf', '#3f6a34'), trunk = c('trunk', '#5a4a38'), lift = 0.9;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU + R() * 0.3, L = 0.9 + R() * 0.5;
      let prev = [0, lift + 0.2, 0];
      for (let j = 1; j <= 4; j++) {
        const t = j / 4, nx = [Math.cos(a) * L * t, lift + 0.2 + Math.sin(t * Math.PI * 0.5) * 0.15 - (t ** 2) * (lift + 0.45), Math.sin(a) * L * t];
        k.Beam('wood', O, prev, nx, 0.06 - t * 0.02, tint(trunk, (R() - 0.5) * 0.1), 'cyl6');
        prev = nx;
      }
    }
    tree(k, { ...O, y: (O.y ?? 0) + lift }, R, leaf, trunk, 2.6, Math.min(w, d) * 0.4, false, 'swamp');
  },
  'will-o-wisps': (k, O, w, d, R, c) => {
    const gl = c('glow', '#9ad8ff');
    for (let i = 0; i < 5; i++) {
      const x = (R() - 0.5) * 0.7, z = (R() - 0.5) * 0.7, y = 0.7 + R() * 0.9, s = 0.04 + R() * 0.04;
      k.S('glow', O, x, y, z, s, gl);
      k.S('glow', O, x, y, z, s * 2.1, tint(gl, -0.55));
    }
    return 1.0;
  },
  'sunken-statue': (k, O, w, d, R, c) => {
    const st = c('stone', '#7a8466'), moss = c('moss', '#4f7a34');
    k.P('deco', O, 'disc', 0, 0.015, 0.1, w * 0.85, 1, d * 0.75, '#3f4a38');
    const H = sub(O, -0.15, -0.05, 0.3);
    k.P('lit', H, 'sph', 0, 0.35, 0, 1.15, 1.4, 1.1, st, -0.25, 0, 0.12);
    k.B('lit', H, 0, 0.62, 0.42, 0.75, 0.12, 0.2, tint(st, -0.1), -0.25);
    for (const s of [-1, 1]) {
      k.P('deco', H, 'sph', s * 0.18, 0.5, 0.5, 0.16, 0.06, 0.03, tint(st, -0.5), -0.25);
      k.P('lit', H, 'box', s * 0.56, 0.35, 0.02, 0.1, 0.42, 0.24, tint(st, -0.05), -0.25);
    }
    k.P('lit', H, 'pyr', 0, 0.36, 0.56, 0.16, 0.24, 0.12, tint(st, 0.05), -0.25, Q, 0);
    k.B('deco', H, 0, 0.13, 0.52, 0.3, 0.05, 0.03, tint(st, -0.45), -0.25);
    k.P('lit', H, 'hemi', -0.1, 0.92, -0.1, 0.8, 0.2, 0.7, moss);
    // fingers of a hand breaking the surface
    for (let i = 0; i < 4; i++) {
      const x = 0.55 + i * 0.11, h = 0.35 + (i === 1 || i === 2 ? 0.12 : 0);
      k.P('lit', O, 'cyl6', x, h / 2, 0.45 + (i % 2) * 0.04, 0.09, h, 0.09, tint(st, (R() - 0.5) * 0.1), 0.1, 0, -0.1 + i * 0.05);
    }
  },

  // ---- winter ----
  'ice-spikes': (k, O, w, d, R, c) => {
    const ice = c('ice', '#bfe3f2');
    for (let i = 0; i < 12; i++) {
      const x = (R() - 0.5) * w * 0.8, z = (R() - 0.5) * d * 0.8, h = 0.5 + R() * 1.3, r = 0.08 + h * 0.08;
      PT(k, 'lit', O, 'cone', x, h / 2 - 0.05, z, r * 2, h, r * 2, tint(ice, (R() - 0.5) * 0.15), R() * TAU, (R() - 0.5) * 0.6);
    }
    k.P('lit', O, 'disc', 0, 0.012, 0, w * 0.8, 1, d * 0.8, tint(ice, 0.2));
  },
  yurt: (k, O, w, d, R, c) => {
    const felt = c('felt', '#d9cdb0'), band = c('band', '#a3312c'), r = Math.min(w, d) * 0.42;
    k.C('lit', O, 0, 0, 0, r, 1.1, felt, 'cyl16');
    k.C('lit', O, 0, 0.55, 0, r * 1.012, 0.14, band, 'cyl16');
    k.P('lit', O, 'cone', 0, 1.1 + 0.42, 0, r * 2.15, 0.84, r * 2.15, tint(felt, -0.05));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; k.Beam('fabric', O, [Math.cos(a) * r * 1.07, 1.12, Math.sin(a) * r * 1.07], [Math.cos(a) * 0.2, 1.88, Math.sin(a) * 0.2], 0.018, band, 'box'); }
    k.Ring('wood', O, 0, 1.88, 0, 0.22, 0.08, DARKWOOD);
    k.B('wood', O, 0, 0, r - 0.02, 0.6, 0.95, 0.1, band);
    k.B('wood', O, 0, 0.95, r - 0.02, 0.72, 0.08, 0.12, DARKWOOD);
    k.C('metal', O, 0.12, 1.75, 0.05, 0.05, 0.5, '#3a3a3a', 'cyl');
  },
  sled: (k, O, w, d, R, c) => {
    const wd = c('wood', '#8a6a48'), load = c('load', '#7a5638'), L = d * 0.82, W = w * 0.5;
    for (const s of [-1, 1]) {
      k.Beam('wood', O, [s * W / 2, 0.04, -L / 2], [s * W / 2, 0.04, L / 2 - 0.15], 0.025, '#9a9690', 'box');
      k.Beam('wood', O, [s * W / 2, 0.04, L / 2 - 0.15], [s * W / 2, 0.3, L / 2 + 0.05], 0.025, '#9a9690', 'box');
      for (const z of [-L / 3, 0, L / 3]) k.B('wood', O, s * W / 2, 0.04, z, 0.05, 0.2, 0.05, wd);
      k.B('wood', O, s * W / 2, 0.24, -L / 2 + 0.1, 0.05, 0.4, 0.05, wd);
    }
    k.B('wood', O, 0, 0.22, 0, W + 0.08, 0.05, L - 0.1, wd);
    k.B('wood', O, 0, 0.62, -L / 2 + 0.1, W, 0.05, 0.05, wd);
    k.P('fabric', O, 'sph', 0, 0.42, 0.05, W * 0.9, 0.45, L * 0.55, load);
    k.P('fabric', O, 'sph', 0.04, 0.6, -0.1, W * 0.6, 0.25, L * 0.3, '#d9cdb0');
    k.Beam('fabric', O, [-W / 2, 0.3, 0.05], [W / 2, 0.3, 0.05], 0.012, '#c9b48a', 'cyl6');
  },

  // ---- desert ----
  'house-adobe': (k, O, w, d, R, c) => {
    const wall = c('wall', '#c9a27a'), trim = c('trim', '#2f5d8a'), W = w * 0.78, D = d * 0.74, H = 2.0;
    k.B('lit', O, 0, 0, 0, W, H, D, wall);
    for (const s of [-1, 1]) {
      k.B('lit', O, 0, H, s * (D / 2 - 0.08), W, 0.28, 0.16, tint(wall, 0.05));
      k.B('lit', O, s * (W / 2 - 0.08), H, 0, 0.16, 0.28, D, tint(wall, 0.05));
    }
    k.B('lit', O, 0, H - 0.02, 0, W - 0.3, 0.04, D - 0.3, tint(wall, -0.15));
    for (let x = -W / 2 + 0.3; x < W / 2 - 0.1; x += 0.36) k.P('wood', O, 'cyl', x, H - 0.2, D / 2 + 0.12, 0.1, 0.3, 0.1, '#6b4428', HALF, 0, 0);
    k.B('wood', O, 0.2, 0, D / 2 + 0.01, 0.55, 1.25, 0.05, trim);
    k.B('lit', O, 0.2, 1.25, D / 2 + 0.02, 0.7, 0.08, 0.06, tint(wall, -0.2));
    for (const [x, z, f] of [[-0.7, D / 2, 1], [W / 2, 0.2, 2], [-W / 2, -0.3, -2], [0.4, -D / 2, -1]] as number[][]) {
      const onZ = Math.abs(f) === 1;
      k.B('deco', O, x + (onZ ? 0 : Math.sign(f) * 0.01), 0.95, z + (onZ ? Math.sign(f) * 0.01 : 0), onZ ? 0.36 : 0.02, 0.4, onZ ? 0.02 : 0.36, '#2a2420');
      k.B('wood', O, x + (onZ ? 0 : Math.sign(f) * 0.03), 1.35, z + (onZ ? Math.sign(f) * 0.03 : 0), onZ ? 0.46 : 0.04, 0.05, onZ ? 0.04 : 0.46, trim);
    }
    for (const s of [-0.18, 0.18]) k.Beam('wood', O, [W / 2 + 0.35 + s * 0.2, 0, 0.6 + s], [W / 2 + 0.06 + s * 0.2, H + 0.5, 0.6 + s], 0.03, DARKWOOD);
    for (let i = 1; i < 8; i++) { const t = i / 8; k.Beam('wood', O, [W / 2 + 0.35 - 0.29 * t - 0.036, (H + 0.5) * t, 0.42], [W / 2 + 0.35 - 0.29 * t + 0.036, (H + 0.5) * t, 0.78], 0.015, DARKWOOD); }
    for (let i = 0; i < 3; i++) k.C('lit', O, -W / 2 + 0.3 + i * 0.3, H + 0.02, -D / 2 + 0.35, 0.1, 0.25, '#a8684a', 'cyl16');
  },
  'rock-arch': (k, O, w, d, R, c) => {
    const st = c('stone', '#b87a52'), sp = w * 0.36, H = 2.4;
    for (const s of [-1, 1]) {
      let y = 0;
      for (let i = 0; i < 3; i++) {
        const sz = 0.95 - i * 0.12, h = 0.9;
        k.P('lit', O, 'ico', s * (sp + 0.05 - i * 0.08), y + h / 2, (R() - 0.5) * 0.1, sz * 1.5, h * 1.3, sz * 1.4, tint(st, (R() - 0.5) * 0.14), 0, R() * TAU, 0);
        y += h * 0.8;
      }
    }
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI - (i / n) * Math.PI, a1 = Math.PI - ((i + 1) / n) * Math.PI, m = Math.abs((i + 0.5) / n - 0.5) * 2, th = 0.3 + m * 0.18;
      k.Beam('lit', O, [Math.cos(a0) * sp, H * 0.62 + Math.sin(a0) * H * 0.5, 0], [Math.cos(a1) * sp, H * 0.62 + Math.sin(a1) * H * 0.5, 0], th, tint(st, (R() - 0.5) * 0.08), 'cyl16');
      k.P('lit', O, 'ico', (Math.cos(a0) + Math.cos(a1)) * sp / 2, H * 0.62 + (Math.sin(a0) + Math.sin(a1)) * H * 0.25, 0, th * 2.2, th * 1.9, th * 2.3, tint(st, (R() - 0.5) * 0.12), 0, R() * TAU, 0);
    }
    for (let i = 0; i < 6; i++) k.S('stone', O, (R() - 0.5) * w * 0.8, 0.05, (R() - 0.5) * d * 0.7, 0.1 + R() * 0.15, tint(st, -0.1), 'ico');
  },
  'ruin-columns': (k, O, w, d, R, c) => {
    const st = c('stone', '#d8ccb0'), rad = Math.min(w, d) * 0.35;
    k.B('stone', O, 0, -0.02, 0, w * 0.84, 0.12, d * 0.84, tint(st, -0.12));
    for (let i = 0; i < 6; i++) k.B('deco', O, (R() - 0.5) * w * 0.7, 0.101, (R() - 0.5) * d * 0.7, 0.02, 0.005, 0.5 + R() * 0.5, tint(st, -0.45), 0, R() * TAU);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU, x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      if (R() < 0.3) {
        k.B('stone', O, x, 0.1, z, 0.42, 0.12, 0.42, st);
        PT(k, 'stone', O, 'cyl16', x + Math.cos(a) * 0.5, 0.26, z + Math.sin(a) * 0.5, 0.3, 1.1, 0.3, tint(st, -0.04), R() * TAU, HALF);
        continue;
      }
      const h = 0.4 + R() * 2.0;
      k.B('stone', O, x, 0.1, z, 0.44, 0.16, 0.44, st);
      k.C('stone', O, x, 0.26, z, 0.15, h, tint(st, (R() - 0.5) * 0.08), 'cyl16');
      for (let f = 0; f < 6; f++) { const b = (f / 6) * TAU; k.B('deco', O, x + Math.cos(b) * 0.152, 0.28, z + Math.sin(b) * 0.152, 0.01, h - 0.04, 0.01, tint(st, -0.3)); }
      if (h > 1.9) k.B('stone', O, x, 0.26 + h, z, 0.42, 0.16, 0.42, tint(st, 0.04));
    }
    for (let i = 0; i < 8; i++) k.S('stone', O, (R() - 0.5) * w * 0.8, 0.12, (R() - 0.5) * d * 0.8, 0.06 + R() * 0.1, tint(st, -0.08), 'ico');
  },
  'sand-dune': (k, O, w, d, R, c) => {
    const sand = c('sand', '#d8b878');
    k.P('lit', O, 'hemi', 0, -0.02, 0, w * 0.92, 0.75, d * 0.8, sand, 0, 0.1, 0);
    k.P('lit', O, 'hemi', w * 0.15, -0.02, d * 0.08, w * 0.55, 0.95, d * 0.5, tint(sand, 0.05), 0, -0.2, 0);
    for (let i = 0; i < 5; i++) k.B('deco', O, -w * 0.3 + i * w * 0.15, 0.06, d * 0.33, w * 0.1, 0.01, 0.02, tint(sand, -0.2), 0, 0.2);
  },

  // ---- wild, graves and camps ----
  barrow: (k, O, w, d, R, c) => {
    const grass = c('grass', '#6a8a44'), st = c('stone', '#8a8780'), r = Math.min(w, d) * 0.46;
    k.P('lit', O, 'hemi', 0, -0.05, -0.05, r * 2, 1.25, r * 2, grass);
    for (let i = 0; i < 6; i++) { const a = R() * TAU; k.S('stone', O, Math.cos(a) * r * 0.9, 0.08, Math.sin(a) * r * 0.9, 0.12 + R() * 0.1, tint(st, -0.1), 'ico'); }
    const z = r - 0.15;
    for (const s of [-1, 1]) k.B('stone', O, s * 0.36, 0, z, 0.24, 1.05, 0.34, tint(st, (R() - 0.5) * 0.1));
    k.B('stone', O, 0, 1.0, z, 1.05, 0.24, 0.4, tint(st, -0.05));
    k.B('deco', O, 0, 0, z + 0.05, 0.5, 1.0, 0.3, '#14110e');
    k.B('stone', O, 0, 0, z + 0.32, 1.2, 0.08, 0.5, tint(st, -0.15));
  },
  'fairy-ring': (k, O, w, d, R, c) => {
    const cap = c('cap', '#e2d6c0'), gl = c('glow', '#c9a2ff'), rad = Math.min(w, d) * 0.37;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU + R() * 0.15, rr = rad + (R() - 0.5) * 0.08, x = Math.cos(a) * rr, z = Math.sin(a) * rr, h = 0.12 + R() * 0.12, s = 0.07 + R() * 0.05;
      k.C('lit', O, x, 0, z, s * 0.35, h, '#ece4d4', 'cyl6');
      k.P('lit', O, 'hemi', x, h - 0.01, z, s * 2, s * 1.1, s * 2, tint(cap, (R() - 0.5) * 0.15));
    }
    for (let i = 0; i < 5; i++) k.S('glow', O, (R() - 0.5) * rad, 0.3 + R() * 0.6, (R() - 0.5) * rad, 0.025, gl);
  },
  mausoleum: (k, O, w, d, R, c) => {
    const st = c('stone', '#a8a196'), rf = c('roof', '#6a6660'), W = w * 0.66, D = d * 0.56, H = 2.1, z0 = -0.25;
    k.B('stone', O, 0, 0, z0 + 0.2, W + 0.4, 0.2, D + 0.9, tint(st, -0.15));
    k.B('stone', O, 0, 0.2, z0, W, H, D, st);
    k.B('stone', O, 0, H + 0.2, z0 + 0.25, W + 0.16, 0.16, D + 0.6, tint(st, -0.08));
    roof(k, sub(O, 0, z0 + 0.25), W, D + 0.5, H + 0.36, 'gable', rf, R);
    for (let i = 0; i < 4; i++) {
      const x = -W / 2 + 0.15 + (i * (W - 0.3)) / 3;
      k.C('stone', O, x, 0.2, z0 + D / 2 + 0.38, 0.11, H, tint(st, 0.06), 'cyl16');
      k.B('stone', O, x, H + 0.08, z0 + D / 2 + 0.38, 0.28, 0.12, 0.28, tint(st, -0.05));
    }
    k.B('metal', O, 0, 0.2, z0 + D / 2 + 0.01, 0.6, 1.3, 0.05, '#3a3c3a');
    k.B('metal', O, 0, 0.85, z0 + D / 2 + 0.04, 0.6, 0.03, 0.02, '#6a6c6a');
    for (let i = 0; i < 3; i++) k.B('stone', O, 0, 0, z0 + D / 2 + 0.55 + i * 0.16, 0.9, 0.2 - i * 0.07, 0.18, tint(st, -0.1));
    for (const s of [-1, 1]) {
      k.C('stone', O, s * (W / 2 + 0.05), H + 0.36, z0 + D / 2 + 0.6, 0.08, 0.06, st, 'cyl16');
      k.P('stone', O, 'sph', s * (W / 2 + 0.05), H + 0.52, z0 + D / 2 + 0.6, 0.18, 0.26, 0.18, st);
    }
  },
  'cave-entrance': (k, O, w, d, R, c) => {
    const st = c('stone', '#857f75');
    const rocks: number[][] = [[0, -0.35, 1.35, 1.7], [-1.0, -0.2, 0.85, 1.2], [1.0, -0.25, 0.9, 1.3], [-0.6, -0.55, 0.9, 1.4], [0.6, -0.6, 0.85, 1.5], [-1.35, 0.25, 0.5, 0.6], [1.35, 0.2, 0.55, 0.7]];
    for (const [x, z, s, h] of rocks) k.P('lit', O, 'ico', x, h * 0.42, z, s * 2, h * 1.2, s * 1.6, tint(st, (R() - 0.5) * 0.15), (R() - 0.5) * 0.3, R() * TAU, 0);
    k.P('deco', O, 'hemi', 0, 0, 0.45, 1.1, 1.75, 0.5, '#0e0c0a', 0, 0, 0);
    k.P('lit', O, 'ico', 0, 1.35, 0.3, 1.5, 0.55, 0.7, tint(st, 0.05), 0.2, 0, 0);
    for (let i = 0; i < 6; i++) k.S('stone', O, (R() - 0.5) * 1.6, 0.06, 0.6 + R() * 0.35, 0.07 + R() * 0.08, tint(st, -0.08), 'ico');
  },
  'totem-pole': (k, O, w, d, R, c) => {
    const wd = c('wood', '#8a5a34'), pt = c('paint', '#a3312c'), n = 4, seg = 0.72;
    k.C('wood', O, 0, 0, 0, 0.24, n * seg, wd, 'cyl16');
    for (let i = 0; i < n; i++) {
      const y = i * seg + seg * 0.55;
      k.C('lit', O, 0, i * seg + 0.04, 0, 0.245, 0.08, pt, 'cyl16');
      for (const s of [-1, 1]) {
        k.P('deco', O, 'sph', s * 0.09, y, 0.215, 0.1, 0.07, 0.04, '#1e1814');
        k.P('lit', O, 'sph', s * 0.09, y, 0.205, 0.15, 0.11, 0.04, i % 2 ? '#e8dcc0' : pt);
      }
      if (i % 2) k.P('wood', O, 'pyr', 0, y - 0.18, 0.3, 0.12, 0.22, 0.2, tint(wd, 0.1), HALF, Q, 0);
      else k.B('lit', O, 0, y - 0.24, 0.21, 0.22, 0.06, 0.04, '#1e1814');
    }
    const top = n * seg;
    for (const s of [-1, 1]) k.P('wood', O, 'box', s * 0.5, top - 0.25, 0, 0.75, 0.32, 0.07, pt, 0, 0, s * 0.3);
    k.P('wood', O, 'cone', 0, top + 0.15, 0.08, 0.36, 0.3, 0.36, tint(wd, 0.1));
  },
  roundhouse: (k, O, w, d, R, c) => {
    const rf = c('roof', THATCH), wall = c('wall', '#9a8a6a'), r = Math.min(w, d) * 0.38;
    k.C('lit', O, 0, 0, 0, r, 1.15, wall, 'cyl16');
    for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU; PT(k, 'wood', O, 'box', Math.sin(a) * (r + 0.005), 0.55, Math.cos(a) * (r + 0.005), 0.025, 1.1, 0.01, tint(wall, -0.28), a, 0); }
    cone(k, O, 1.0, r * 1.35, 2.0, rf, R);
    // porch over the door
    k.B('wood', O, 0, 0, r + 0.02, 0.6, 1.0, 0.08, '#5a3a20');
    for (const s of [-1, 1]) {
      k.B('wood', O, s * 0.4, 0, r + 0.02, 0.1, 1.15, 0.1, DARKWOOD);
      PT(k, 'lit', O, 'box', s * 0.24, 1.25, r + 0.15, 0.55, 0.08, 0.6, rf, 0, 0.35, s * 0.45);
    }
    for (let i = 0; i < 5; i++) k.B('wood', O, -r - 0.2 + (R() - 0.5) * 0.3, 0, -0.5 + i * 0.22, 0.5, 0.1, 0.1, tint('#7a5634', (R() - 0.5) * 0.2), 0, R() * 0.4);
  },

  // ---- alien ----
  monolith: (k, O, w, d, R, c) => {
    const st = c('stone', '#1e1e24'), gl = c('glow', '#7af0d8');
    k.B('metal', O, 0, 0, 0, 0.6, 3.0, 0.18, st);
    for (let y = 0.6; y < 2.6; y += 0.32) for (const s of [-1, 1]) k.B('glow', O, (R() - 0.5) * 0.1, y, s * 0.091, 0.2 + R() * 0.15, 0.025, 0.005, gl);
  },
  crater: (k, O, w, d, R, c) => {
    const rock = c('rock', '#6a5e52'), core = c('core', '#7af0d8'), rad = Math.min(w, d) * 0.42;
    k.P('lit', O, 'torus', 0, 0.02, 0, rad * 2.1, 2.2, rad * 2.1, tint(rock, 0.1));
    k.P('lit', O, 'disc', 0, 0.01, 0, rad * 1.9, 1, rad * 1.9, tint(rock, -0.35));
    k.P('lit', O, 'disc', 0, 0.015, 0, rad * 1.1, 1, rad * 1.1, tint(rock, -0.5));
    for (let i = 0; i < 16; i++) { const a = R() * TAU, dd = rad * (1.0 + R() * 0.3); k.S('stone', O, Math.cos(a) * dd, 0.1, Math.sin(a) * dd, 0.08 + R() * 0.14, tint(rock, (R() - 0.5) * 0.2), 'ico'); }
    k.P('glow', O, 'ico', 0, 0.2, 0, 0.5, 0.42, 0.46, core, 0.3, R() * TAU, 0.2);
    k.P('glow', O, 'disc', 0, 0.02, 0, 1.3, 1, 1.3, tint(core, -0.75));
    return 0.3;
  },
  'crystal-tree': (k, O, w, d, R, c) => {
    const cr = c('crystal', '#9ad8ff'), tr = c('trunk', '#5a6a7a');
    k.P('metal', O, 'cone', 0, 0.2, 0, 0.6, 0.4, 0.6, tr);
    k.Beam('metal', O, [0, 0, 0], [0.05, 1.6, 0.02], 0.09, tr, 'cyl6');
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + R() * 0.3, y0 = 0.9 + R() * 0.8, L = 0.5 + R() * 0.45, ex = Math.cos(a) * L, ez = Math.sin(a) * L, ey = y0 + 0.4 + R() * 0.4;
      k.Beam('metal', O, [0.03, y0, 0.01], [ex, ey, ez], 0.035, tr, 'cyl6');
      const s = 0.12 + R() * 0.1;
      PT(k, 'glow', O, 'oct', ex, ey + s, ez, s * 0.9, s * 3, s * 0.9, tint(cr, (R() - 0.5) * 0.2 - 0.25), R() * TAU, (R() - 0.5) * 0.5);
    }
    PT(k, 'glow', O, 'oct', 0.05, 1.95, 0.02, 0.3, 0.8, 0.3, tint(cr, -0.2), 0, 0);
    for (let i = 0; i < 6; i++) PT(k, 'lit', O, 'oct', (R() - 0.5) * 1.2, 0.08, (R() - 0.5) * 1.2, 0.1, 0.25, 0.1, cr, R() * TAU, (R() - 0.5) * 0.8);
  },
};

void [RT2];

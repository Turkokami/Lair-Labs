// 3D models for the outdoor objects that only had a stand-in body: buildings, ruins, jungle and alien plants, region icons.
// Same conventions as props3d.ts: 1 square = 1 unit, y up, base at y = 0, centred on the footprint (w across x, d across z).
// The front (door side, "bottom edge" in the overhead art) is +z. Variant-only shapes read p.v (the variant index).
// All shapes are Lair Labs' own, built from the kit's primitives.
import * as THREE from 'three';
import type { Kit, Bin, Spot, GeoKey } from './kit';
import { type Model, DARKWOOD, STONE, tree } from './modelkit';
import { foliageOn, bushCrown } from './foliage3d';

const TAU = Math.PI * 2, HALF = Math.PI / 2, Q = Math.PI / 4, RT2 = Math.SQRT2;

const tint = (hex: string, f: number) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => {
    const v = (n >> s) & 255;
    return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  };
  return '#' + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0');
};

const sub = (O: Spot, lx: number, lz: number, dry = 0): Spot => {
  const yaw = O.ry ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  return { x: O.x + lx * c + lz * s, z: O.z - lx * s + lz * c, ry: yaw + dry, y: O.y };
};

/** A piece turned by yaw (about y) after pitch (about x) and roll (about z), which plain XYZ angles can't express. */
const E = new THREE.Euler(), QA = new THREE.Quaternion(), QB = new THREE.Quaternion(), AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), AZ = new THREE.Vector3(0, 0, 1);
function PT(k: Kit, bin: Bin, O: Spot, gk: GeoKey, x: number, y: number, z: number, sx: number, sy: number, sz: number, col: string, yaw: number, pitch: number, roll = 0) {
  QA.setFromAxisAngle(AY, yaw).multiply(QB.setFromAxisAngle(AX, pitch)).multiply(QB.setFromAxisAngle(AZ, roll));
  E.setFromQuaternion(QA, 'XYZ');
  k.P(bin, O, gk, x, y, z, sx, sy, sz, col, E.x, E.y, E.z);
}

// ---------- buildings ----------

type Roof = 'gable' | 'hip';
interface Bld { roof: Roof; roofCol: string; wall: string; H: number; chim?: [number, number][]; timber?: boolean; boards?: boolean; fw?: number; fd?: number }

/** A roof over a W x D box whose walls stop at y = top. 45 degree pitch; ridge along the longer side. Returns the ridge height. */
function roof(k: Kit, O: Spot, W: number, D: number, top: number, kind: Roof, col: string, R: () => number) {
  const ov = 0.36, alongX = W >= D, L = (alongX ? W : D) + ov, S = (alongX ? D : W) + ov, rh = S / 2, s = S / RT2;
  const dark = tint(col, -0.28);
  if (kind === 'gable') {
    if (alongX) k.P('lit', O, 'box', 0, top, 0, L, s, s, col, Q, 0, 0);
    else k.P('lit', O, 'box', 0, top, 0, s, s, L, col, 0, 0, Q);
  } else {
    const prism = Math.max(0, L - S);
    if (prism > 0.01) {
      if (alongX) k.P('lit', O, 'box', 0, top, 0, prism, s, s, col, Q, 0, 0);
      else k.P('lit', O, 'box', 0, top, 0, s, s, prism, col, 0, 0, Q);
    }
    for (const e of prism > 0.01 ? [-1, 1] : [0]) {
      const ex = alongX ? (e * prism) / 2 : 0, ez = alongX ? 0 : (e * prism) / 2;
      k.P('lit', O, 'pyr', ex, top + rh / 2, ez, S * RT2, rh, S * RT2, col, 0, Q, 0);
    }
  }
  // courses of shingle or tile along each slope, and a ridge cap
  const courses = 3;
  for (const sd of [-1, 1])
    for (let i = 1; i <= courses; i++) {
      const f = i / (courses + 1), off = (S / 2) * (1 - f), y = top + rh * f + 0.035;
      const len = kind === 'hip' ? L - S + S * f : L;
      if (alongX) k.P('lit', O, 'box', 0, y, sd * off, len, 0.04, 0.05, dark, sd * Q, 0, 0);
      else k.P('lit', O, 'box', sd * off, y, 0, 0.05, 0.04, len, dark, 0, 0, -sd * Q);
    }
  const ridge = kind === 'hip' ? L - S : L;
  if (ridge > 0.05) {
    if (alongX) k.P('lit', O, 'box', 0, top + rh, 0, ridge, 0.09, 0.09, dark, Q, 0, 0);
    else k.P('lit', O, 'box', 0, top + rh, 0, 0.09, 0.09, ridge, dark, 0, 0, Q);
  }
  void R;
  return top + rh;
}

/** A window on a wall: dark glass, a timber frame, a sill and (sometimes) shutters. face: +1/-1 front/back (z), +2/-2 right/left (x). */
function windowAt(k: Kit, O: Spot, x: number, y: number, z: number, face: number, R: () => number, w = 0.42, h = 0.52, frame = DARKWOOD) {
  const onZ = Math.abs(face) === 1, sg = Math.sign(face), t = 0.05;
  const glass = R() < 0.25 ? '#e7b765' : '#25303a';
  const X = (a: number) => (onZ ? x + a : x + sg * t), Z = (a: number) => (onZ ? z + sg * t : z + a);
  if (onZ) {
    k.B(glass === '#25303a' ? 'deco' : 'glow', O, x, y, z + sg * 0.01, w, h, 0.04, glass === '#25303a' ? glass : tint(glass, -0.35));
    k.B('wood', O, x, y - 0.04, z + sg * t, w + 0.12, 0.06, 0.1, frame);
    k.B('wood', O, x, y + h, z + sg * t, w + 0.12, 0.05, 0.08, frame);
    k.B('wood', O, x, y, z + sg * t, 0.04, h, 0.06, frame);
    k.B('wood', O, x, y + h / 2 - 0.02, z + sg * t, w, 0.04, 0.06, frame);
  } else {
    k.B(glass === '#25303a' ? 'deco' : 'glow', O, x + sg * 0.01, y, z, 0.04, h, w, glass === '#25303a' ? glass : tint(glass, -0.35));
    k.B('wood', O, x + sg * t, y - 0.04, z, 0.1, 0.06, w + 0.12, frame);
    k.B('wood', O, x + sg * t, y + h, z, 0.08, 0.05, w + 0.12, frame);
    k.B('wood', O, x + sg * t, y, z, 0.06, h, 0.04, frame);
    k.B('wood', O, x + sg * t, y + h / 2 - 0.02, z, 0.06, 0.04, w, frame);
  }
  if (R() < 0.5) for (const s of [-1, 1]) k.B('wood', O, X(s * (w / 2 + 0.14)), y, Z(s * (w / 2 + 0.14)), onZ ? 0.2 : 0.04, h, onZ ? 0.04 : 0.2, tint(frame, 0.25));
}

/** A house: stone footing, plastered or boarded walls with timber framing, windows, a door at the front, a roof and chimneys. */
function building(k: Kit, O: Spot, w: number, d: number, R: () => number, o: Bld) {
  const W = w * (o.fw ?? 0.84), D = d * (o.fd ?? 0.8), H = o.H, beam = tint(DARKWOOD, -0.1);
  k.B('stone', O, 0, 0, 0, W + 0.12, 0.26, D + 0.12, STONE);
  k.B('lit', O, 0, 0.2, 0, W, H - 0.2, D, tint(o.wall, 0.12));
  if (o.boards) for (let x = -W / 2 + 0.2; x < W / 2; x += 0.34) for (const sd of [-1, 1]) k.B('wood', O, x, 0.24, sd * (D / 2 + 0.006), 0.03, H - 0.3, 0.02, tint(o.wall, -0.3));
  if (o.timber) {
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.B('wood', O, (sx * W) / 2, 0.2, (sz * D) / 2, 0.13, H - 0.2, 0.13, beam);
    for (const y of [H - 0.07, ...(H > 2.6 ? [H * 0.52] : [])]) {
      for (const sd of [-1, 1]) {
        k.B('wood', O, 0, y - 0.05, sd * (D / 2 + 0.02), W + 0.04, 0.1, 0.06, beam);
        k.B('wood', O, sd * (W / 2 + 0.02), y - 0.05, 0, 0.06, 0.1, D + 0.04, beam);
      }
    }
    k.B('wood', O, 0, 0.26, D / 2 + 0.02, W + 0.04, 0.08, 0.06, beam);
    // a few braces on the sides
    for (const sd of [-1, 1]) {
      const x0 = sd * (W / 2 + 0.03);
      k.Beam('wood', O, [x0, 0.35, -D / 2 + 0.15], [x0, Math.min(H, 2.2) - 0.15, -D / 2 + 0.75], 0.035, beam, 'box');
      k.Beam('wood', O, [x0, 0.35, D / 2 - 0.15], [x0, Math.min(H, 2.2) - 0.15, D / 2 - 0.75], 0.035, beam, 'box');
    }
  }
  // door and step
  const dw = 0.62, dh = 1.25;
  k.B('wood', O, 0, 0.22, D / 2 + 0.02, dw, dh, 0.06, tint('#6a4528', (R() - 0.5) * 0.2));
  k.B('wood', O, 0, 0.22 + dh, D / 2 + 0.04, dw + 0.16, 0.08, 0.08, beam);
  for (const s of [-1, 1]) k.B('wood', O, (s * (dw + 0.08)) / 2, 0.22, D / 2 + 0.04, 0.07, dh, 0.08, beam);
  k.S('metal', O, dw * 0.32, 0.85, D / 2 + 0.07, 0.035, '#c9a24a');
  k.B('stone', O, 0, 0, D / 2 + 0.2, dw + 0.3, 0.16, 0.36, tint(STONE, -0.05));
  // windows: front either side of the door, sides, back; and upstairs on tall houses
  const rows = H > 2.6 ? [0.8, H * 0.52 + 0.35] : [0.8];
  for (const y of rows) {
    const nf = Math.max(1, Math.floor((W - 1) / 1.3));
    for (let i = 0; i < nf * 2; i++) {
      const x = (i < nf ? -1 : 1) * (dw / 2 + 0.45 + (i % nf) * 1.1);
      if (Math.abs(x) < W / 2 - 0.3) windowAt(k, O, x, y, D / 2, 1, R);
    }
    if (y > 1) windowAt(k, O, 0, y, D / 2, 1, R);
    for (let x = -W / 2 + 0.7; x < W / 2 - 0.4; x += 1.4) windowAt(k, O, x, y, -D / 2, -1, R);
    for (const sd of [-1, 1]) for (let z = -D / 2 + 0.7; z < D / 2 - 0.4; z += 1.5) windowAt(k, O, (sd * W) / 2, y, z, sd * 2, R);
  }
  const ridge = roof(k, O, W, D, H, o.roof, o.roofCol, R);
  for (const [cx, cy] of o.chim ?? []) {
    const x = Math.max(-W / 2 + 0.25, Math.min(W / 2 - 0.25, (cx - 0.5) * w)), z = Math.max(-D / 2 + 0.25, Math.min(D / 2 - 0.25, (cy - 0.5) * d));
    k.B('stone', O, x, H - 0.3, z, 0.42, ridge - H + 0.75, 0.42, tint(STONE, -0.12));
    k.B('stone', O, x, ridge + 0.45, z, 0.5, 0.1, 0.5, tint(STONE, -0.25));
  }
  return { W, D, H, ridge };
}

const house = (o: { roof: Roof; H: number; chim?: [number, number][]; timber?: boolean; boards?: boolean; extra?: (k: Kit, O: Spot, b: { W: number; D: number; H: number; ridge: number }, R: () => number, c: (k: string, f: string) => string) => void }): Model =>
  (k, O, w, d, R, c) => {
    const b = building(k, O, w, d, R, { roof: o.roof, roofCol: c('roof', '#6e4a32'), wall: c('wall', '#b8ab92'), H: o.H, chim: o.chim, timber: o.timber ?? true, boards: o.boards });
    o.extra?.(k, O, b, R, c);
  };

// ---------- plants ----------

/** Lianas hanging from (x, y, z) down to y1, with a few leaves on them. */
function liana(k: Kit, O: Spot, x: number, y: number, z: number, y1: number, col: string, R: () => number, glow = false) {
  const n = 4;
  let px = x, pz = z, py = y;
  for (let i = 1; i <= n; i++) {
    const t = i / n, nx = x + Math.sin(t * 3 + x) * 0.12, nz = z + Math.cos(t * 2.5 + z) * 0.1, ny = y + (y1 - y) * t;
    k.Beam(glow ? 'glow' : 'fabric', O, [px, py, pz], [nx, ny, nz], 0.022, glow ? tint(col, -0.3) : col, 'cyl6');
    if (!glow && R() < 0.8) PT(k, 'fabric', O, 'sph', nx, ny, nz, 0.16, 0.03, 0.26, tint(col, (R() - 0.5) * 0.3), R() * TAU, 0.6);
    px = nx; py = ny; pz = nz;
  }
}

/** Buttress roots: thin triangular fins flaring out from a trunk (each piece makes two opposite fins). */
function buttress(k: Kit, O: Spot, r: number, h: number, col: string, R: () => number, n = 4) {
  const half = Math.ceil(n / 2);
  for (let i = 0; i < half; i++) {
    const a = (i / half) * Math.PI + R() * 0.4;
    PT(k, 'wood', O, 'pyr', 0, (h * (0.8 + R() * 0.3)) / 2, 0, 0.1, h * (0.8 + R() * 0.3), r * 2 * (0.85 + R() * 0.3), tint(col, (R() - 0.5) * 0.15), -a + HALF, 0, 0);
  }
}

/** A broad leaf on a short stalk pointing out at angle a, drooping. */
function broadLeaf(k: Kit, O: Spot, a: number, len: number, y: number, col: string, R: () => number) {
  const c = Math.cos(a), s = Math.sin(a), d = len * 0.55;
  k.Beam('fabric', O, [0, 0, 0], [c * d * 0.5, y, s * d * 0.5], 0.018, tint(col, -0.25), 'cyl6');
  PT(k, 'fabric', O, 'sph', c * d, y + 0.02, s * d, len * 0.45, 0.025, len, tint(col, (R() - 0.4) * 0.25), -a + HALF, 0.35 + R() * 0.35);
  PT(k, 'fabric', O, 'box', c * d, y + 0.035, s * d, 0.015, 0.012, len * 0.9, tint(col, 0.25), -a + HALF, 0.35);
}

/** An alien mushroom: pale stem, shelf rings, a cap glowing from underneath. */
function bigShroom(k: Kit, O: Spot, x: number, z: number, H: number, rc: number, cap: string, spot: string, R: () => number) {
  k.S('lit', O, x, 0.12, z, rc * 0.32, '#d6cfc2', 'ico');
  k.C('lit', O, x, 0, z, rc * 0.17, H, '#e3dccd', 'cyl16');
  for (let i = 1; i <= 2; i++) k.P('lit', O, 'hemi', x + (R() - 0.5) * 0.05, H * (0.3 + i * 0.2), z, rc * 0.7, 0.12, rc * 0.7, tint(cap, 0.15));
  k.P('fabric', O, 'hemi', x, H - 0.05, z, rc * 2, rc * 0.9, rc * 2, cap);
  k.P('glow', O, 'disc', x, H - 0.06, z, rc * 1.9, 1, rc * 1.9, tint(spot, -0.45), Math.PI, 0, 0);
  for (let i = 0; i < 6; i++) {
    const a = R() * TAU, ph = 0.4 + R() * 0.7;
    k.S('glow', O, x + Math.sin(ph) * Math.cos(a) * rc * 0.98, H - 0.05 + Math.cos(ph) * rc * 0.44, z + Math.sin(ph) * Math.sin(a) * rc * 0.98, 0.07 + R() * 0.05, tint(spot, -0.2));
  }
}

export const OUTDOOR_MODELS: Record<string, Model> = {
  // ---- buildings ----
  cottage: house({ roof: 'hip', H: 1.9, chim: [[0.66, 0.2]] }),
  house: house({ roof: 'gable', H: 2.3, chim: [[0.18, 0.18]] }),
  'house-large': house({ roof: 'hip', H: 3.1, chim: [[0.2, 0.22], [0.76, 0.22]] }),
  shop: house({
    roof: 'gable', H: 3.0,
    extra: (k, O, b, R, c) => {
      // a striped awning over the shop window and a hanging sign
      const aw = c('awning', '#a3312c');
      for (let i = 0; i < 6; i++) PT(k, 'fabric', O, 'box', -b.W / 2 + (b.W / 6) * (i + 0.5), 1.62, b.D / 2 + 0.32, b.W / 6, 0.03, 0.7, i % 2 ? '#e8dcc0' : aw, 0, 0.45);
      k.Beam('metal', O, [b.W / 2 - 0.1, 2.0, b.D / 2], [b.W / 2 - 0.1, 2.0, b.D / 2 + 0.55], 0.02, '#3a3a3a');
      k.B('wood', O, b.W / 2 - 0.1, 1.55, b.D / 2 + 0.45, 0.05, 0.38, 0.5, '#7a5634');
      void R;
    },
  }),
  inn: house({
    roof: 'hip', H: 3.2, chim: [[0.18, 0.2], [0.8, 0.2]],
    extra: (k, O, b) => {
      k.Beam('wood', O, [-b.W / 2 + 0.6, 2.2, b.D / 2], [-b.W / 2 + 0.6, 2.2, b.D / 2 + 0.7], 0.035, DARKWOOD);
      k.B('wood', O, -b.W / 2 + 0.6, 1.6, b.D / 2 + 0.62, 0.06, 0.5, 0.62, '#8a5a34');
      k.S('glow', O, -b.W / 2 + 0.6, 1.85, b.D / 2 + 0.66, 0.04, '#d9a640');
      // a porch roof over the door
      PT(k, 'lit', O, 'box', 0, 1.75, b.D / 2 + 0.45, 1.6, 0.06, 1.0, '#7a4a30', 0, 0.35);
      for (const s of [-1, 1]) k.Beam('wood', O, [s * 0.72, 0, b.D / 2 + 0.85], [s * 0.72, 1.6, b.D / 2 + 0.85], 0.045, DARKWOOD);
    },
  }),
  barn: (k, O, w, d, R, c) => {
    const b = building(k, O, w, d, R, { roof: 'gable', roofCol: c('roof', '#6e4a32'), wall: c('wall', '#8a3a2c'), H: 2.5, boards: true, timber: false, fw: 0.88, fd: 0.84 });
    // wide double doors with cross braces
    for (const s of [-1, 1]) {
      const x = s * 0.55;
      k.B('wood', O, x, 0.22, b.D / 2 + 0.05, 1.0, 1.9, 0.06, '#6a3a2a');
      k.Beam('wood', O, [x - s * 0.45, 0.3, b.D / 2 + 0.09], [x + s * 0.45, 2.05, b.D / 2 + 0.09], 0.04, '#e6dcc4', 'box');
      k.B('wood', O, x, 0.22, b.D / 2 + 0.09, 1.0, 0.07, 0.03, '#e6dcc4');
      k.B('wood', O, x, 2.05, b.D / 2 + 0.09, 1.0, 0.07, 0.03, '#e6dcc4');
    }
    k.B('wood', O, 0, 2.6, b.D / 2 + 0.03, 0.7, 0.6, 0.05, '#3a2418');
  },
  chapel: (k, O, w, d, R, c) => {
    const wall = c('wall', '#c9c0ae'), rf = c('roof', '#4f565e'), W = w * 0.62, D = d * 0.66, H = 2.8;
    k.B('stone', O, 0, 0, -0.4, W + 0.14, 0.3, D + 0.14, STONE);
    k.B('stone', O, 0, 0.25, -0.4, W, H - 0.25, D, wall);
    for (const sd of [-1, 1]) for (let z = -D / 2 + 0.5; z < D / 2 - 0.3; z += 0.9) {
      k.B('stone', O, (sd * (W / 2 + 0.06)), 0.25, z - 0.4, 0.14, H - 0.3, 0.16, tint(wall, -0.12));
      k.B('deco', O, sd * (W / 2 + 0.01), 0.9, z - 0.4 + 0.45, 0.04, 1.2, 0.3, '#3a4a6a');
      k.P('deco', O, 'cyl16', sd * (W / 2 + 0.01), 2.1, z - 0.4 + 0.45, 0.3, 0.04, 0.3, '#3a4a6a', 0, 0, HALF);
    }
    roof(k, sub(O, 0, -0.4), W, D, H, 'gable', rf, R);
    // bell tower at the front with a spire
    const T = Math.min(W * 0.62, 1.5), tz = D / 2 - 0.4 + T / 2 - 0.2, TH = 4.6;
    k.B('stone', O, 0, 0, tz, T + 0.1, 0.3, T + 0.1, STONE);
    k.B('stone', O, 0, 0.25, tz, T, TH, T, tint(wall, 0.05));
    k.B('deco', O, 0, TH - 1.0, tz + T / 2 + 0.01, T * 0.38, 0.7, 0.03, '#2a2622');
    k.S('metal', O, 0, TH - 0.75, tz, 0.22, '#a8823a');
    k.B('stone', O, 0, TH + 0.2, tz, T + 0.16, 0.12, T + 0.16, tint(wall, -0.15));
    k.P('lit', O, 'pyr', 0, TH + 0.3 + 1.1, tz, T * 1.05 * RT2, 2.2, T * 1.05 * RT2, rf, 0, Q, 0);
    k.Beam('metal', O, [0, TH + 2.45, tz], [0, TH + 2.95, tz], 0.025, '#d4a640');
    k.B('metal', O, 0, TH + 2.78, tz, 0.26, 0.04, 0.04, '#d4a640');
    // arched door
    k.B('wood', O, 0, 0.25, tz + T / 2 + 0.02, 0.62, 1.2, 0.06, '#5a3a22');
    k.P('wood', O, 'cyl16', 0, 1.45, tz + T / 2 + 0.02, 0.62, 0.06, 0.62, '#5a3a22', HALF, 0, 0);
    k.B('stone', O, 0, 0, tz + T / 2 + 0.25, 0.9, 0.16, 0.4, tint(STONE, -0.05));
  },
  windmill: (k, O, w, d, R, c) => {
    const wall = c('wall', '#d6cbb2'), rf = c('roof', '#6e4a32'), sail = c('sail', '#e6dcc4'), r0 = Math.min(w, d) * 0.3;
    k.C('stone', O, 0, 0, 0, r0 + 0.1, 0.4, STONE, 'cyl16');
    const seg = 3, h = 1.3;
    for (let i = 0; i < seg; i++) k.C('lit', O, 0, 0.35 + i * h, 0, r0 * (1 - i * 0.1), h + 0.02, tint(wall, -i * 0.04), 'cyl16');
    const top = 0.35 + seg * h;
    k.Ring('wood', O, 0, top, 0, r0 * 0.78, 0.12, DARKWOOD);
    k.P('lit', O, 'cone', 0, top + 0.6, 0, r0 * 1.85, 1.2, r0 * 1.85, rf);
    k.B('wood', O, 0, 0.35, r0 * 0.98, 0.5, 1.0, 0.06, '#5a3a22');
    windowAt(k, O, 0, 1.9, r0 * 0.88, 1, R, 0.3, 0.38);
    // the sails on a hub at the front
    const hz = r0 * 0.75 + 0.35, hy = top + 0.1, spin = (R() * TAU) / 4;
    k.Beam('wood', O, [0, hy, 0], [0, hy, hz + 0.1], 0.08, DARKWOOD);
    k.S('wood', O, 0, hy, hz + 0.1, 0.12, DARKWOOD);
    for (let i = 0; i < 4; i++) {
      const a = spin + (i * TAU) / 4, ca = Math.cos(a), sa = Math.sin(a), L = 2.5;
      k.Beam('wood', O, [0, hy, hz], [ca * L, hy + sa * L, hz], 0.035, '#6a4a2c', 'box');
      const px = -sa, py = ca; // across the arm
      for (let j = 1; j <= 4; j++) {
        const t = 0.3 + j * 0.17;
        k.Beam('wood', O, [ca * L * t, hy + sa * L * t, hz], [ca * L * t + px * 0.42, hy + sa * L * t + py * 0.42, hz], 0.015, '#6a4a2c', 'box');
      }
      const mx = ca * L * 0.68 + px * 0.21, my = hy + sa * L * 0.68 + py * 0.21;
      k.P('fabric', O, 'box', mx, my, hz + 0.03, L * 0.62, 0.4, 0.015, sail, 0, 0, a);
    }
  },
  'well-house': (k, O, w, d, R, c) => {
    const st = c('stone', STONE), rf = c('roof', '#6e4a32'), r = Math.min(w, d) * 0.3;
    k.C('stone', O, 0, 0, 0, r, 0.75, st, 'cyl16');
    k.Ring('stone', O, 0, 0.76, 0, r - 0.04, 0.12, tint(st, -0.15));
    k.P('deco', O, 'disc', 0, 0.55, 0, r * 1.7, 1, r * 1.7, '#1d2a30');
    for (const s of [-1, 1]) k.B('wood', O, s * (r + 0.02), 0.6, 0, 0.1, 1.5, 0.1, DARKWOOD);
    k.Beam('wood', O, [-r - 0.1, 1.5, 0], [r + 0.1, 1.5, 0], 0.05, '#7a5634');
    k.C('wood', O, 0, 1.05, 0, 0.1, 0.18, '#7a5634', 'cyl');
    k.Beam('metal', O, [0, 1.48, 0], [0, 1.2, 0], 0.008, '#c9b48a');
    k.Beam('metal', O, [r + 0.1, 1.5, 0], [r + 0.22, 1.35, 0.12], 0.02, '#3a3a3a');
    const W = 2 * r + 0.5;
    for (const sd of [-1, 1]) PT(k, 'lit', O, 'box', 0, 2.05, sd * 0.33, W, 0.05, 0.85, rf, 0, sd * 0.7);
    k.B('lit', O, 0, 2.32, 0, W, 0.06, 0.08, tint(rf, -0.3));
  },
  'watchtower-wood': (k, O, w, d, R, c) => {
    const wd = c('wood', '#7a5634'), rf = c('roof', '#6e4a32'), s = Math.min(w, d) * 0.36, P = 3.1;
    for (const [x, z] of [[-s, -s], [s, -s], [-s, s], [s, s]]) {
      k.Beam('wood', O, [x * 1.12, 0, z * 1.12], [x, P + 1.4, z], 0.07, wd);
      k.S('stone', O, x * 1.12, 0.05, z * 1.12, 0.14, STONE, 'ico');
    }
    for (const y of [0.9, 2.0]) for (const [a, b] of [[[-s, -s], [s, -s]], [[s, -s], [s, s]], [[s, s], [-s, s]], [[-s, s], [-s, -s]]] as number[][][]) {
      k.Beam('wood', O, [a[0] * 1.08, y - 0.45, a[1] * 1.08], [b[0] * 1.08, y + 0.45, b[1] * 1.08], 0.035, tint(wd, -0.15));
    }
    k.B('wood', O, 0, P, 0, s * 2 + 0.4, 0.12, s * 2 + 0.4, tint(wd, -0.08));
    for (const [x, z, lw, ld] of [[0, -s - 0.2, s * 2 + 0.4, 0.06], [0, s + 0.2, s * 2 + 0.4, 0.06], [-s - 0.2, 0, 0.06, s * 2 + 0.4], [s + 0.2, 0, 0.06, s * 2 + 0.4]]) {
      k.B('wood', O, x, P + 0.12, z, lw, 0.7, ld, tint(wd, 0.06));
    }
    k.P('lit', O, 'pyr', 0, P + 1.4 + 0.45, 0, (s * 2 + 0.7) * RT2, 0.9, (s * 2 + 0.7) * RT2, rf, 0, Q, 0);
    // ladder up the front
    for (const sx of [-0.18, 0.18]) k.Beam('wood', O, [sx, 0, s + 0.55], [sx, P + 0.1, s + 0.24], 0.025, wd);
    for (let i = 1; i < 9; i++) { const t = i / 9; k.Beam('wood', O, [-0.18, P * t, s + 0.55 - 0.31 * t], [0.18, P * t, s + 0.55 - 0.31 * t], 0.015, wd); }
  },
  'bridge-stone': (k, O, w, d, R, c) => {
    const st = c('stone', '#8f8a80'), W = w * 0.9, L = d * 1.04, deck = 0.24;
    k.B('stone', O, 0, deck - 0.22, 0, W, 0.22, L, st);
    // the arch: a big ring under the deck, plus abutments
    k.P('stone', O, 'torus', 0, deck - 0.2 - L * 0.32, 0, L * 0.7, W * 1.0 / 0.24, L * 0.7, tint(st, -0.1), 0, 0, HALF);
    for (const s of [-1, 1]) k.B('stone', O, 0, -1.4, s * (L / 2 - 0.3), W, 1.4 + deck - 0.2, 0.6, tint(st, -0.12));
    for (const s of [-1, 1]) {
      k.B('stone', O, s * (W / 2 - 0.1), deck, 0, 0.2, 0.42, L, tint(st, 0.04));
      k.B('stone', O, s * (W / 2 - 0.1), deck + 0.42, 0, 0.26, 0.07, L + 0.02, tint(st, -0.15));
      for (const e of [-1, 1]) k.B('stone', O, s * (W / 2 - 0.1), deck, e * (L / 2 - 0.12), 0.3, 0.6, 0.3, tint(st, -0.05));
    }
    for (let z = -L / 2 + 0.25; z < L / 2; z += 0.5) k.B('stone', O, 0, deck - 0.005, z, W - 0.45, 0.01, 0.02, tint(st, -0.3));
  },
  'ruin-walls': (k, O, w, d, R, c) => {
    const st = c('stone', '#8f8a80'), moss = c('moss', '#5d7a3a'), W = w * 0.9, D = d * 0.9;
    const run = (ax: number, az: number, bx: number, bz: number) => {
      const n = 6;
      for (let i = 0; i < n; i++) {
        if (R() < 0.18) continue;
        const t0 = i / n, t1 = (i + 1) / n, h = 0.25 + R() * (R() < 0.3 ? 1.6 : 0.8);
        const x0 = ax + (bx - ax) * t0, z0 = az + (bz - az) * t0, x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1;
        const len = Math.hypot(x1 - x0, z1 - z0);
        k.B('stone', O, (x0 + x1) / 2, 0, (z0 + z1) / 2, Math.abs(x1 - x0) > 0.01 ? len : 0.34, h, Math.abs(z1 - z0) > 0.01 ? len : 0.34, tint(st, (R() - 0.5) * 0.15));
        if (R() < 0.6) k.P('lit', O, 'ico', (x0 + x1) / 2, h + 0.02, (z0 + z1) / 2, Math.max(0.3, Math.abs(x1 - x0)) * 0.9, 0.08, Math.max(0.3, Math.abs(z1 - z0)) * 0.9, moss);
      }
    };
    run(-W / 2, -D / 2, W / 2, -D / 2); run(W / 2, -D / 2, W / 2, D / 2); run(-W / 2, D / 2, -W / 2, -D / 2);
    run(-W / 2, D / 2, -W * 0.1, D / 2); run(W * 0.15, D / 2, W / 2, D / 2);
    for (let i = 0; i < 7; i++) k.S('stone', O, (R() - 0.5) * W * 0.9, 0.06, (R() - 0.5) * D * 0.9, 0.1 + R() * 0.16, tint(st, -0.1), 'ico');
  },
  'ruin-arch': (k, O, w, d, R, c) => {
    const st = c('stone', '#8f8a80'), sp = w * 0.36, H = 2.3;
    for (const s of [-1, 1]) {
      k.B('stone', O, s * sp, 0, 0, 0.6, 0.25, 0.6, tint(st, -0.1));
      k.C('stone', O, s * sp, 0.25, 0, 0.22, s < 0 ? H : H * 0.62, st, 'cyl16');
    }
    k.B('stone', O, -sp, H + 0.25, 0, 0.56, 0.2, 0.56, tint(st, -0.05));
    for (let i = 0; i < 4; i++) {
      const a0 = Math.PI - (i / 7) * Math.PI, a1 = Math.PI - ((i + 1) / 7) * Math.PI;
      k.Beam('stone', O, [Math.cos(a0) * sp, H + 0.35 + Math.sin(a0) * sp * 0.7, 0], [Math.cos(a1) * sp, H + 0.35 + Math.sin(a1) * sp * 0.7, 0], 0.2, st, 'box');
    }
    for (let i = 0; i < 5; i++) k.S('stone', O, sp * 0.6 + (R() - 0.5) * 0.9, 0.1, (R() - 0.5) * 0.7, 0.12 + R() * 0.12, tint(st, -0.12), 'ico');
  },
  gravestone: (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8780'), v = p.v ?? 0;
    k.P('lit', O, 'flat', 0, 0.01, 0.12, 0.42, 1, 0.75, '#4a3a2a');
    if (v === 1) {
      k.B('stone', O, 0, 0, -0.1, 0.12, 0.95, 0.12, st);
      k.B('stone', O, 0, 0.6, -0.1, 0.46, 0.12, 0.12, st);
      k.B('stone', O, 0, 0, -0.1, 0.3, 0.12, 0.24, tint(st, -0.15));
    } else {
      const lean = v === 2 ? 0.28 : 0;
      k.P('stone', O, 'box', 0, 0.3, -0.1, 0.46, 0.6, 0.1, st, -lean, 0, lean * 0.4);
      k.P('stone', O, 'cyl16', 0, 0.6 + 0.0, -0.1 - lean * 0.17, 0.46, 0.1, 0.46, st, HALF - lean, 0, 0);
      k.B('deco', O, 0, 0.32, -0.04, 0.24, 0.025, 0.012, tint(st, -0.4), -lean);
    }
  },
  'stone-idol': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8574'), eye = c('eye', '#e2b13a'), glow = p.v === 3;
    k.B('stone', O, 0, 0, 0, 0.8, 0.25, 0.8, tint(st, -0.12));
    k.B('stone', O, 0, 0.25, 0, 0.62, 1.55, 0.55, st);
    k.B('stone', O, 0, 1.25, 0.04, 0.7, 0.12, 0.58, tint(st, -0.1)); // brow
    for (const s of [-1, 1]) {
      k.B(glow ? 'glow' : 'deco', O, s * 0.15, 1.08, 0.28, 0.13, 0.08, 0.02, glow ? eye : tint(eye, -0.1));
      k.B('stone', O, s * 0.34, 0.85, 0, 0.1, 0.4, 0.2, tint(st, -0.05)); // ears
    }
    k.P('stone', O, 'pyr', 0, 0.86, 0.3, 0.16, 0.26, 0.12, tint(st, 0.05), 0, Q, 0); // nose
    k.B('deco', O, 0, 0.55, 0.28, 0.32, 0.06, 0.02, tint(st, -0.45));
    k.B('stone', O, 0, 1.8, 0, 0.7, 0.14, 0.6, tint(st, -0.08));
    if (R() < 0.7) k.P('lit', O, 'ico', 0.08, 1.88, 0, 0.6, 0.1, 0.5, '#4a7a30');
  },
  'rock-outcrop': (k, O, w, d, R, c) => {
    const st = c('stone', '#857f75'), moss = c('moss', '#5d7a3a'), r = Math.min(w, d) * 0.42;
    const rocks: [number, number, number][] = [[0, 0, r * 0.75], ...Array.from({ length: 6 }, () => [(R() - 0.5) * r * 1.5, (R() - 0.5) * r * 1.5, r * (0.25 + R() * 0.35)] as [number, number, number])];
    for (const [x, z, s] of rocks) {
      const hgt = s * (0.75 + R() * 0.45);
      k.P('cave', O, 'ico', x, hgt * 0.3, z, s * 2.1, hgt * 1.3, s * 1.8, tint(st, (R() - 0.5) * 0.18), R() * 0.25, R() * TAU, R() * 0.25);
      if (s > r * 0.4) k.P('lit', O, 'ico', x, hgt * 0.3 + hgt * 0.6, z, s * 1.5, 0.14, s * 1.3, moss, 0, R() * TAU, 0);
    }
  },
  'jungle-temple': (k, O, w, d, R, c, p) => {
    const st = c('stone', '#8a8574'), moss = c('moss', '#4a7a30'), bare = p.v === 3, S = Math.min(w, d) * 0.92, tiers = 4, th = 0.75;
    for (let i = 0; i < tiers; i++) {
      const s = S * (1 - i * 0.19);
      k.B('stone', O, 0, i * th, 0, s, th, s, tint(st, -i * 0.03 + (R() - 0.5) * 0.06));
      k.B('stone', O, 0, i * th + th - 0.08, 0, s + 0.08, 0.1, s + 0.08, tint(st, -0.18));
      if (!bare) for (let j = 0; j < 4; j++) {
        const a = R() * TAU;
        k.P('lit', O, 'ico', Math.cos(a) * s * 0.45, i * th + th, Math.sin(a) * s * 0.45, 0.6 + R() * 0.5, 0.12, 0.5 + R() * 0.4, tint(moss, (R() - 0.5) * 0.2));
      }
    }
    // a stair up the front
    const sw = S * 0.22, steps = 14;
    for (let i = 0; i < steps; i++) k.B('stone', O, 0, (i * tiers * th) / steps, S / 2 - (i * (S * 0.38)) / steps + 0.1, sw, (tiers * th) / steps + 0.02, 0.32, tint(st, 0.05 - (i % 2) * 0.05));
    for (const s of [-1, 1]) k.Beam('stone', O, [s * (sw / 2 + 0.08), 0.2, S / 2 + 0.15], [s * (sw / 2 + 0.08), tiers * th + 0.15, S / 2 - S * 0.38 + 0.1], 0.1, tint(st, -0.12), 'box');
    // shrine on top
    const tY = tiers * th, ts = S * 0.3;
    k.B('stone', O, 0, tY, -0.1, ts, 1.0, ts, tint(st, 0.04));
    k.B('deco', O, 0, tY, ts / 2 - 0.1 + 0.01, ts * 0.35, 0.7, 0.03, '#1c1a16');
    k.B('stone', O, 0, tY + 1.0, -0.1, ts + 0.2, 0.16, ts + 0.2, tint(st, -0.15));
    k.P('stone', O, 'pyr', 0, tY + 1.36, -0.1, ts * RT2, 0.4, ts * RT2, tint(st, -0.05), 0, Q, 0);
    if (!bare) for (let i = 0; i < 5; i++) {
      const x = (R() - 0.5) * S * 0.8, z = -S / 2 + R() * S * 0.3;
      liana(k, O, x, tiers * th * (0.6 + R() * 0.4), z, 0.2 + R() * 0.8, moss, R);
    }
  },

  // ---- jungle and alien plants ----
  'tree-jungle': (k, O, w, d, R, c, p) => {
    const leaf = c('leaf', '#2f6a2a'), vine = c('vine', '#4f8a34'), trunk = '#6b5a44', r = Math.min(w, d) * 0.42;
    buttress(k, O, 0.9, 0.9, trunk, R, 4);
    tree(k, O, R, leaf, trunk, 3.6, r, false, 'round');
    for (let i = 0; i < 4; i++) { const a = R() * TAU, rr = r * (0.4 + R() * 0.4); liana(k, O, Math.cos(a) * rr, 3.2 + R() * 0.6, Math.sin(a) * rr, 0.8 + R() * 1.6, vine, R); }
    if (p.v === 3) for (let i = 0; i < 8; i++) { const a = R() * TAU; k.S('deco', O, Math.cos(a) * r * 1.1, 3.8 + R() * 1.2, Math.sin(a) * r * 1.1, 0.12, R() < 0.5 ? '#e8508a' : '#f2c94a'); }
  },
  'tree-emergent': (k, O, w, d, R, c) => {
    const leaf = c('leaf', '#2e6328'), trunk = c('trunk', '#6b5a44'), vine = c('vine', '#4f8a34'), r = Math.min(w, d) * 0.42;
    buttress(k, O, 1.8, 1.6, trunk, R, 6);
    k.C('wood', O, 0, 0, 0, 0.42, 3.2, trunk, 'cyl16');
    tree(k, O, R, leaf, trunk, 5.4, r, false, 'round');
    for (let i = 0; i < 7; i++) { const a = R() * TAU, rr = r * (0.3 + R() * 0.5); liana(k, O, Math.cos(a) * rr, 5 + R(), Math.sin(a) * rr, 0.6 + R() * 2, vine, R); }
  },
  'tree-cluster': (k, O, w, d, R, c) => {
    const leaf = c('leaf', '#4f7a34'), leaf2 = c('leaf2', '#3e6a2c'), trunk = c('trunk', '#5a3d24'), r = Math.min(w, d) * 0.25;
    const spots: [number, number][] = [[-0.7, -0.5], [0.8, -0.6], [-0.4, 0.8], [0.6, 0.7]];
    spots.forEach(([x, z], i) => tree(k, sub(O, x * r * 1.4, z * r * 1.4), R, i % 2 ? leaf2 : leaf, trunk, 2.4 + R() * 1.0, r * (0.9 + R() * 0.35), false, 'round'));
    if (foliageOn()) bushCrown({ x: O.x, y: O.y ?? 0, z: O.z }, R, leaf2, 0.9);
  },
  'plant-broadleaf': (k, O, w, d, R, c) => {
    const leaf = c('leaf', '#3c7a2e'), n = 7;
    for (let i = 0; i < n; i++) broadLeaf(k, O, (i / n) * TAU + R() * 0.5, 0.75 + R() * 0.35, 0.35 + R() * 0.35, leaf, R);
    broadLeaf(k, O, R() * TAU, 0.6, 0.75, tint(leaf, 0.15), R);
  },
  'vines-hanging': (k, O, w, d, R, c, p) => {
    // a curtain of lianas hanging from a branch slung between two slim trunks
    const vine = c('vine', '#4f8a34'), glow = p.v === 2, s = Math.min(w, d) * 0.42, top = 3.3;
    for (const sd of [-1, 1]) {
      k.Beam('wood', O, [sd * s, 0, sd * 0.1], [sd * s * 0.9, top + 0.5, 0], 0.08, '#5a4a34');
      k.P('wood', O, 'cone', sd * s, 0.1, sd * 0.1, 0.4, 0.22, 0.4, '#5a4a34');
      if (foliageOn()) bushCrown({ x: sub(O, sd * s * 0.9, 0).x, y: (O.y ?? 0) + top, z: sub(O, sd * s * 0.9, 0).z }, R, tint(vine, -0.15), 0.9);
    }
    k.Sag('wood', O, [-s * 0.9, top + 0.3, 0], [s * 0.9, top + 0.3, 0], 0.25, 0.05, '#5a4a34');
    for (let i = 0; i < 9; i++) {
      const t = (i + 0.5) / 9, x = (t * 2 - 1) * s * 0.85, y = top + 0.3 - Math.sin(t * Math.PI) * 0.25;
      liana(k, O, x, y, (R() - 0.5) * 0.15, 0.4 + R() * 1.4, vine, R, glow);
    }
  },
  'tree-alien': (k, O, w, d, R, c) => {
    const frond = c('frond', '#2f6a6a'), vein = c('vein', '#9af0e0'), bulb = c('bulb', '#ff8ad8'), r = Math.min(w, d) * 0.48;
    const H = 3.4 + R() * 0.6;
    // a leaning, curving stem
    let pt = [0, 0, 0];
    const lean = R() * TAU;
    for (let i = 1; i <= 5; i++) {
      const t = i / 5, nxt = [Math.cos(lean) * Math.sin(t * 1.4) * 0.4, H * t, Math.sin(lean) * Math.sin(t * 1.4) * 0.4];
      k.Beam('lit', O, pt, nxt, 0.17 - t * 0.07, tint('#5a6a6a', -t * 0.2), 'cyl');
      pt = nxt;
    }
    const [tx, , tz] = pt;
    // umbrella of fronds
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + R() * 0.3;
      PT(k, 'fabric', O, 'sph', tx + Math.cos(a) * r * 0.5, H - 0.1, tz + Math.sin(a) * r * 0.5, r * 0.42, 0.05, r * 1.05, tint(frond, (R() - 0.5) * 0.2), -a + HALF, 0.28);
      PT(k, 'glow', O, 'box', tx + Math.cos(a) * r * 0.5, H - 0.13, tz + Math.sin(a) * r * 0.5, 0.025, 0.02, r * 0.95, tint(vein, -0.35), -a + HALF, 0.28);
    }
    k.P('fabric', O, 'hemi', tx, H - 0.05, tz, 0.7, 0.35, 0.7, tint(frond, -0.15));
    for (let i = 0; i < 6; i++) {
      const a = R() * TAU, rr = r * (0.2 + R() * 0.5), y = H - 0.4 - R() * 0.5;
      k.Beam('lit', O, [tx + Math.cos(a) * rr, H - 0.15, tz + Math.sin(a) * rr], [tx + Math.cos(a) * rr, y, tz + Math.sin(a) * rr], 0.012, tint(frond, -0.3), 'cyl6');
      k.S('glow', O, tx + Math.cos(a) * rr, y - 0.08, tz + Math.sin(a) * rr, 0.09 + R() * 0.05, tint(bulb, -0.25));
    }
  },
  'fungus-tower': (k, O, w, d, R, c) => {
    const cap = c('cap', '#4a2f6e'), spot = c('spot', '#7af0d8'), s = Math.min(w, d) * 0.3;
    bigShroom(k, O, 0, -0.2, 4.4 + R() * 0.6, 1.25, cap, spot, R);
    bigShroom(k, O, s * 1.1, s * 0.8, 2.6 + R() * 0.5, 0.85, tint(cap, 0.1), spot, R);
    bigShroom(k, O, -s * 1.1, s * 0.6, 1.6 + R() * 0.4, 0.6, tint(cap, -0.1), spot, R);
    for (let i = 0; i < 5; i++) { const a = R() * TAU; k.P('lit', O, 'hemi', Math.cos(a) * 0.3, 1 + R() * 2, -0.2 + Math.sin(a) * 0.3, 0.5, 0.1, 0.4, tint(cap, 0.25)); }
  },
  'glow-pods': (k, O, w, d, R, c) => {
    const pod = c('pod', '#7af0d8'), stalk = c('stalk', '#2f4a4a');
    for (let i = 0; i < 5; i++) {
      const a = R() * TAU, r0 = R() * 0.25, h = 0.2 + R() * 0.5, x = Math.cos(a) * r0, z = Math.sin(a) * r0;
      const tx = x + Math.cos(a) * 0.1, tz = z + Math.sin(a) * 0.1;
      k.Beam('lit', O, [x, 0, z], [tx, h, tz], 0.015, stalk, 'cyl6');
      for (let j = 0; j < 3; j++) {
        const s = 0.07 + R() * 0.05, b = R() * TAU;
        k.P('glow', O, 'sph', tx + Math.cos(b) * 0.05, h + 0.03 + j * 0.06, tz + Math.sin(b) * 0.05, s, s * 1.35, s, tint(pod, -0.15 - R() * 0.3));
      }
    }
    for (let i = 0; i < 4; i++) broadLeaf(k, O, R() * TAU, 0.35, 0.06, tint(stalk, 0.2), R);
  },
  'spore-vent': (k, O, w, d, R, c) => {
    const rim = c('rim', '#5a4a6e'), spore = c('spore', '#c8f07a');
    for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU + R() * 0.3; k.P('cave', O, 'ico', Math.cos(a) * 0.36, 0.06, Math.sin(a) * 0.36, 0.3, 0.2 + R() * 0.1, 0.26, tint(rim, (R() - 0.5) * 0.2), 0, -a, 0); }
    k.P('deco', O, 'disc', 0, 0.04, 0, 0.62, 1, 0.62, '#16121c');
    k.P('glow', O, 'disc', 0, 0.045, 0, 0.36, 1, 0.36, tint(spore, -0.55));
    for (let i = 0; i < 9; i++) k.S('glow', O, (R() - 0.5) * 0.4, 0.25 + R() * 1.1, (R() - 0.5) * 0.4, 0.03 + R() * 0.04, tint(spore, -0.2));
  },
  tendrils: (k, O, w, d, R, c) => {
    const skin = c('skin', '#6a3a7a'), tip = c('tip', '#7af0d8');
    for (let i = 0; i < 6; i++) {
      const a = R() * TAU, r0 = R() * 0.6, x0 = Math.cos(a) * r0, z0 = Math.sin(a) * r0, curl = (R() < 0.5 ? -1 : 1) * (0.8 + R()), H = 0.8 + R() * 1.0;
      let pt = [x0, 0, z0];
      for (let j = 1; j <= 6; j++) {
        const t = j / 6, b = a + curl * t * 1.6;
        const nxt = [x0 + Math.cos(b) * 0.3 * t, H * Math.sin((t * Math.PI) / 2), z0 + Math.sin(b) * 0.3 * t];
        k.Beam('lit', O, pt, nxt, 0.08 * (1 - t * 0.75), tint(skin, -t * 0.2), 'cyl');
        pt = nxt;
      }
      k.S('glow', O, pt[0], pt[1], pt[2], 0.05, tint(tip, -0.2));
    }
  },

  // ---- region (overland) icons ----
  'region-hills': (k, O, w, d, R, c) => {
    const hill = c('hill', '#8aa055');
    for (let i = 0; i < 2; i++) k.P('lit', O, 'hemi', (i - 0.5) * w * 0.4, 0, (R() - 0.5) * 0.2, w * (0.55 + R() * 0.15), 0.5 + R() * 0.3, d * 0.9, tint(hill, (R() - 0.5) * 0.15));
  },
  'region-mountains': (k, O, w, d, R, c) => {
    const rock = c('rock', '#8a8270'), snow = c('snow', '#f2f5f7');
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * w * 0.28, h = 1.2 + R() * 0.8 + (i === 1 ? 0.5 : 0), r = 0.7 + R() * 0.2;
      k.P('cave', O, 'cone', x, h / 2, (R() - 0.5) * 0.3, r * 2, h, r * 2, tint(rock, (R() - 0.5) * 0.15));
      k.P('lit', O, 'cone', x, h * 0.86, 0, r * 0.62, h * 0.3, r * 0.62, snow);
    }
  },
  'region-peak': (k, O, w, d, R, c) => {
    const rock = c('rock', '#8a8270'), snow = c('snow', '#f2f5f7'), h = 2.4;
    k.P('cave', O, 'cone', 0, h / 2, 0, 1.8, h, 1.8, rock);
    k.P('lit', O, 'cone', 0, h * 0.84, 0, 0.62, h * 0.33, 0.62, snow);
  },
  'region-forest': (k, O, w, d, R, c) => {
    const leaf = c('leaf', '#2f5a24');
    for (let i = 0; i < 6; i++) tree(k, sub(O, (R() - 0.5) * w * 0.75, (R() - 0.5) * d * 0.75), R, tint(leaf, (R() - 0.5) * 0.2), '#4a3420', 0.9 + R() * 0.3, 0.35, R() < 0.5);
  },
  'region-village': (k, O, w, d, R, c) => {
    const rf = c('roof', '#a5513a');
    for (let i = 0; i < 3; i++) {
      const x = (R() - 0.5) * 0.5, z = (R() - 0.5) * 0.5;
      k.B('lit', O, x, 0, z, 0.22, 0.16, 0.18, '#d8ccb0');
      k.P('lit', O, 'pyr', x, 0.22, z, 0.32, 0.14, 0.28, rf, 0, Q, 0);
    }
  },
  'region-town': (k, O, w, d, R, c) => {
    const rf = c('roof', '#a5513a'), wall = c('wall', '#8a8378');
    for (let i = 0; i < 7; i++) {
      const x = (R() - 0.5) * w * 0.6, z = (R() - 0.5) * d * 0.6;
      k.B('lit', O, x, 0, z, 0.26, 0.2, 0.22, '#d8ccb0');
      k.P('lit', O, 'pyr', x, 0.27, z, 0.38, 0.16, 0.34, rf, 0, Q, 0);
    }
    k.Ring('stone', O, 0, 0.1, 0, w * 0.4, 0.4, wall);
  },
};

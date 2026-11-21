// Shared pieces for 3D object models: the model signature, palette and small builders (barrels, crates, tables...).
// Model files (props3d.ts, models-*.ts) all build from these so the whole library looks like one set.
import { Kit, type Spot } from './kit';
import type { Prop } from '../engine/map';

export type Model = (k: Kit, O: Spot, w: number, d: number, R: () => number, c: (key: string, fb: string) => string, p: Prop) => number | void; // returns flame height for lit things

export const WOOD = '#8a5a34', DARKWOOD = '#5c3a20', IRON = '#55585e', STONE = '#9a9286', GOLD = '#d4a640', CLOTH = '#7a2f2f';

export const barrel = (k: Kit, O: Spot, s = 1) => {
  k.C('wood', O, 0, 0, 0, 0.32 * s, 0.8 * s, WOOD, 'cyl16');
  k.C('wood', O, 0, 0.12 * s, 0, 0.345 * s, 0.56 * s, WOOD, 'cyl16');
  for (const y of [0.1, 0.38, 0.66]) k.Ring('metal', O, 0, y * s, 0, 0.35 * s, 0.025, IRON);
  k.P('wood', O, 'disc', 0, 0.805 * s, 0, 0.6 * s, 1, 0.6 * s, DARKWOOD);
};
export const crate = (k: Kit, O: Spot, s = 0.8, y0 = 0, col = '#9a7048') => {
  k.B('wood', O, 0, y0, 0, s, s, s, col);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.B('wood', O, (x * s) / 2.1, y0, (z * s) / 2.1, 0.06, s + 0.01, 0.06, DARKWOOD);
  k.B('wood', O, 0, y0 + s * 0.45, s / 2 + 0.005, s * 0.95, 0.07, 0.02, DARKWOOD);
  k.B('wood', O, 0, y0 + s * 0.45, -s / 2 - 0.005, s * 0.95, 0.07, 0.02, DARKWOOD);
};
export const legsTable = (k: Kit, O: Spot, w: number, d: number, h = 0.78, col = WOOD) => {
  k.B('wood', O, 0, h - 0.07, 0, w, 0.07, d, col);
  k.B('wood', O, 0, h - 0.17, 0, w - 0.18, 0.1, d - 0.18, DARKWOOD);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.B('wood', O, x * (w / 2 - 0.12), 0, z * (d / 2 - 0.12), 0.08, h - 0.07, 0.08, DARKWOOD);
};
export const chair = (k: Kit, O: Spot, x = 0, z = 0, face = 0) => {
  const P: Spot = { x: O.x + x, z: O.z + z, ry: face, y: O.y };
  k.B('wood', P, 0, 0.42, 0, 0.42, 0.05, 0.42, WOOD);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.B('wood', P, a * 0.17, 0, b * 0.17, 0.05, 0.42, 0.05, DARKWOOD);
  k.B('wood', P, 0, 0.47, 0.19, 0.42, 0.5, 0.05, WOOD);
};
export const flameCup = (k: Kit, O: Spot, x: number, y: number, z: number, s = 1) => {
  k.S('glow', O, x, y + 0.08 * s, z, 0.07 * s, '#ffb347');
  k.P('glow', O, 'cone', x, y + 0.2 * s, z, 0.1 * s, 0.22 * s, 0.1 * s, '#ffd27a');
};
export const pillarRound = (k: Kit, O: Spot, h = 2.4, r = 0.3) => {
  k.B('lit', O, 0, 0, 0, r * 2.6, 0.18, r * 2.6, STONE);
  k.C('lit', O, 0, 0.18, 0, r * 1.15, 0.12, STONE, 'cyl16');
  k.C('stone', O, 0, 0.3, 0, r, h - 0.6, '#a8a196', 'cyl16');
  k.C('lit', O, 0, h - 0.3, 0, r * 1.15, 0.12, STONE, 'cyl16');
  k.B('lit', O, 0, h - 0.18, 0, r * 2.6, 0.18, r * 2.6, STONE);
};
export const tree = (k: Kit, O: Spot, R: () => number, leaf: string, trunk = '#5a3d24', h = 2.6, r = 1.1, pine = false) => {
  k.C('wood', O, 0, 0, 0, 0.16, h * 0.7, trunk, 'cyl6');
  if (pine) for (let i = 0; i < 4; i++) k.P('fabric', O, 'cone', 0, h * 0.35 + i * 0.45, 0, r * (1.7 - i * 0.35), 0.9, r * (1.7 - i * 0.35), leaf);
  else
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + R();
      k.S('fabric', O, Math.cos(a) * r * 0.45, h * 0.75 + R() * 0.4, Math.sin(a) * r * 0.45, r * (0.5 + R() * 0.2), leaf, 'ico');
    }
};


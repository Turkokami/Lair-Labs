// Map objects in 3D. The common ones are built from the kit's primitives (barrels, chests, tables, pillars,
// torches...), so they're real 3D models; every other object in the library gets a simple body in its own colour
// with its overhead picture laid on top, so nothing the GM placed goes missing. Models for more objects can be added
// to MODELS one by one later; the rest of the view doesn't change.
import * as THREE from 'three';
import { WALL_H } from './dungeon';
import { type GameMap, type Prop, isFloor, isWall, hKey, vKey } from '../engine/map';
import { objectById } from '../library/objects';
import { objectSprite } from '../library/art/sprites';
import type { ObjDef } from '../library/art/types';
import { Kit, rng, type Spot } from './kit';
import { shade, type VisUniforms } from './shaders';
import { glowTex } from './textures';

export interface LightSpot { x: number; y: number; z: number; color: string; range: number; intensity: number; flame: boolean }

import { foliageOn, bushCrown } from './foliage3d';
import { type Model, WOOD, DARKWOOD, IRON, STONE, GOLD, CLOTH, barrel, crate, legsTable, chair, flameCup, pillarRound, tree } from './modelkit';
import { MORE_MODELS } from './models-more';
import { EXTRA_MODELS } from './models-extra';
import { MORE_MODELS2 } from './models-more2';
import { OUTDOOR_MODELS } from './models-outdoor';

const MODELS: Record<string, Model> = {
  barrel: (k, O) => barrel(k, O),
  'water-barrel': (k, O) => barrel(k, O),
  'keg-rack': (k, O, w) => {
    k.B('wood', O, 0, 0, 0, w * 0.95, 0.12, 0.7, DARKWOOD);
    const n = Math.max(1, Math.round(w / 0.7));
    for (let i = 0; i < n; i++) k.P('wood', O, 'cyl16', -w / 2 + (i + 0.5) * (w / n), 0.42, 0, 0.56, 0.7, 0.56, WOOD, Math.PI / 2, 0, 0);
  },
  crate: (k, O) => crate(k, O),
  'crate-pile': (k, O, w, d) => {
    crate(k, { ...O, x: O.x - w * 0.22, z: O.z - d * 0.2 }, 0.75);
    crate(k, { ...O, x: O.x + w * 0.22, z: O.z + d * 0.18, ry: (O.ry ?? 0) + 0.3 }, 0.7);
    crate(k, { ...O, x: O.x - w * 0.12, z: O.z - d * 0.12, ry: (O.ry ?? 0) - 0.2 }, 0.6, 0.75);
  },
  'cargo-crates': (k, O, w, d) => MODELS['crate-pile'](k, O, w, d, Math.random, () => '', {} as Prop),
  sack: (k, O) => {
    k.S('fabric', O, 0, 0.28, 0, 0.3, '#b59a6a', 'ico');
    k.C('fabric', O, 0, 0.5, 0, 0.08, 0.14, '#9a7f52', 'cyl6');
  },
  'flour-sacks': (k, O, w, d, R) => {
    for (let i = 0; i < 4; i++) k.S('fabric', O, (R() - 0.5) * w * 0.6, 0.26 + (i > 2 ? 0.35 : 0), (R() - 0.5) * d * 0.6, 0.28, '#d6c7a4', 'ico');
  },
  chest: (k, O, w, d, R, c) => {
    const col = c('wood', '#7a4a26');
    k.B('wood', O, 0, 0, 0, w * 0.8, 0.42, d * 0.62, col);
    k.P('wood', O, 'cyl16', 0, 0.42, 0, d * 0.62, w * 0.8, d * 0.62 * 0.6, col, 0, 0, Math.PI / 2);
    for (const x of [-0.3, 0.3]) k.B('metal', O, x * w, 0, 0, 0.05, 0.44, d * 0.64, IRON);
    k.B('metal', O, 0, 0.3, d * 0.31, 0.12, 0.14, 0.04, GOLD);
  },
  'chest-open': (k, O, w, d) => {
    k.B('wood', O, 0, 0, 0, w * 0.8, 0.42, d * 0.62, '#7a4a26');
    k.B('wood', O, 0, 0.42, -d * 0.31, w * 0.8, 0.4, 0.06, '#7a4a26', -0.35, 0, 0);
    for (let i = 0; i < 9; i++) k.S('metal', O, (i % 3 - 1) * 0.18, 0.4 + (i > 5 ? 0.04 : 0), (Math.floor(i / 3) - 1) * 0.1, 0.07, GOLD, 'ico');
  },
  'treasure-pile': (k, O, w, d, R) => {
    for (let i = 0; i < 30; i++) k.S('metal', O, (R() - 0.5) * w * 0.7, R() * 0.15, (R() - 0.5) * d * 0.7, 0.06 + R() * 0.06, R() < 0.15 ? '#c0392b' : GOLD, 'ico');
    k.P('metal', O, 'hemi', 0, 0, 0, w * 0.6, 0.35, d * 0.6, GOLD);
  },
  'table-long': (k, O, w, d) => legsTable(k, O, w * 0.92, d * 0.72),
  'kitchen-table': (k, O, w, d) => legsTable(k, O, w * 0.92, d * 0.72),
  'table-feast': (k, O, w, d, R) => {
    legsTable(k, O, w * 0.94, d * 0.7);
    for (let i = 0; i < w * 2; i++) k.C('metal', O, -w * 0.4 + (i / (w * 2)) * w * 0.8, 0.78, (R() - 0.5) * d * 0.3, 0.06, 0.12, i % 2 ? GOLD : '#c9c4ba');
  },
  'table-round': (k, O, w) => {
    k.C('wood', O, 0, 0.7, 0, w * 0.42, 0.07, WOOD, 'cyl16');
    k.C('wood', O, 0, 0, 0, 0.07, 0.7, DARKWOOD, 'cyl6');
    k.C('wood', O, 0, 0, 0, 0.25, 0.06, DARKWOOD, 'cyl16');
  },
  'table-round-large': (k, O, w) => MODELS['table-round'](k, O, w, w, Math.random, () => '', {} as Prop),
  'dining-set': (k, O, w, d) => {
    legsTable(k, O, w * 0.6, d * 0.45);
    chair(k, O, 0, -d * 0.38, Math.PI);
    chair(k, O, 0, d * 0.38, 0);
  },
  chair: (k, O) => chair(k, O, 0, 0, 0),
  stool: (k, O) => {
    k.C('wood', O, 0, 0.45, 0, 0.2, 0.05, WOOD, 'cyl16');
    for (let i = 0; i < 3; i++) k.Beam('wood', O, [Math.cos(i * 2.1) * 0.15, 0, Math.sin(i * 2.1) * 0.15], [Math.cos(i * 2.1) * 0.08, 0.46, Math.sin(i * 2.1) * 0.08], 0.025, DARKWOOD);
  },
  bench: (k, O, w, d) => {
    k.B('wood', O, 0, 0.42, 0, w * 0.92, 0.06, Math.min(0.4, d * 0.4), WOOD);
    for (const x of [-1, 1]) k.B('wood', O, x * w * 0.38, 0, 0, 0.07, 0.42, Math.min(0.36, d * 0.36), DARKWOOD);
  },
  pew: (k, O, w, d) => {
    MODELS.bench(k, O, w, d, Math.random, () => '', {} as Prop);
    k.B('wood', O, 0, 0.48, d * 0.2, w * 0.92, 0.5, 0.05, WOOD);
  },
  bed: (k, O, w, d, R, c) => {
    k.B('wood', O, 0, 0, 0, w * 0.86, 0.38, d * 0.92, DARKWOOD);
    k.B('fabric', O, 0, 0.38, 0, w * 0.8, 0.14, d * 0.86, '#e8e0cf');
    k.B('fabric', O, 0, 0.5, d * 0.1, w * 0.84, 0.05, d * 0.62, c('blanket', CLOTH));
    k.B('fabric', O, 0, 0.52, -d * 0.34, w * 0.6, 0.1, 0.25, '#f2ece0');
    k.B('wood', O, 0, 0, -d * 0.46, w * 0.9, 0.85, 0.07, DARKWOOD);
  },
  'bed-double': (k, O, w, d, R, c, p) => MODELS.bed(k, O, w, d, R, c, p),
  bedroll: (k, O, w, d) => {
    k.B('fabric', O, 0, 0, 0, w * 0.6, 0.07, d * 0.85, '#6b5a3a');
    k.P('fabric', O, 'cyl16', 0, 0.1, -d * 0.36, 0.2, w * 0.6, 0.2, '#8a7550', 0, 0, Math.PI / 2);
  },
  bookshelf: (k, O, w, d, R) => {
    const H = 2.0, D = Math.min(0.45, d * 0.5);
    k.B('wood', O, 0, 0, -d / 2 + D / 2, w * 0.95, H, 0.04, DARKWOOD);
    for (const x of [-1, 1]) k.B('wood', O, x * w * 0.46, 0, -d / 2 + D / 2, 0.05, H, D, DARKWOOD);
    for (let s = 0; s < 5; s++) {
      k.B('wood', O, 0, s * 0.45, -d / 2 + D / 2, w * 0.92, 0.04, D, WOOD);
      if (s < 4) {
        let x = -w * 0.42;
        while (x < w * 0.4) {
          const bw = 0.04 + R() * 0.05, bh = 0.25 + R() * 0.12;
          k.B('fabric', O, x + bw / 2, s * 0.45 + 0.04, -d / 2 + D / 2 + 0.03, bw, bh, D * 0.75, ['#7a2f2f', '#2f4f7a', '#3f6a3a', '#7a6a2f', '#4a3a5a'][Math.floor(R() * 5)]);
          x += bw + 0.005;
        }
      }
    }
  },
  desk: (k, O, w, d) => {
    legsTable(k, O, w * 0.9, d * 0.6, 0.76, DARKWOOD);
    k.B('wood', O, w * 0.25, 0.1, 0, w * 0.35, 0.55, d * 0.55, WOOD);
    chair(k, O, 0, d * 0.42, 0);
  },
  lectern: (k, O) => {
    k.B('wood', O, 0, 0, 0, 0.36, 0.06, 0.36, DARKWOOD);
    k.C('wood', O, 0, 0, 0, 0.06, 1.0, DARKWOOD, 'cyl6');
    k.B('wood', O, 0, 1.0, 0, 0.5, 0.05, 0.38, WOOD, -0.4, 0, 0);
    k.B('fabric', O, 0, 1.05, 0, 0.4, 0.03, 0.3, '#efe6cf', -0.4, 0, 0);
  },
  throne: (k, O, w, d, R, c) => {
    k.B('lit', O, 0, 0, 0, w * 0.9, 0.2, d * 0.9, STONE);
    k.B('wood', O, 0, 0.2, 0, 0.8, 0.45, 0.7, c('wood', '#6a3a1a'));
    k.B('fabric', O, 0, 0.65, 0.03, 0.66, 0.08, 0.6, c('cushion', CLOTH));
    k.B('wood', O, 0, 0.2, -0.32, 0.8, 1.6, 0.1, c('wood', '#6a3a1a'));
    for (const x of [-1, 1]) {
      k.B('wood', O, x * 0.38, 0.65, 0, 0.08, 0.3, 0.66, '#6a3a1a');
      k.S('metal', O, x * 0.38, 1.85, -0.32, 0.07, GOLD);
    }
  },
  // pillars carry the ceiling, so they run the full height of the hall
  'pillar-round': (k, O) => pillarRound(k, O, WALL_H, 0.34),
  'pillar-square': (k, O) => {
    k.B('lit', O, 0, 0, 0, 0.8, 0.2, 0.8, STONE);
    k.B('stone', O, 0, 0.2, 0, 0.62, WALL_H - 0.4, 0.62, '#a8a196');
    for (const y of [1.2, 2.75]) k.B('lit', O, 0, y, 0, 0.68, 0.1, 0.68, STONE);
    k.B('lit', O, 0, WALL_H - 0.2, 0, 0.84, 0.2, 0.84, STONE);
  },
  'pillar-broken': (k, O, w, d, R) => {
    k.B('lit', O, 0, 0, 0, 0.8, 0.18, 0.8, STONE);
    k.C('stone', O, 0, 0.18, 0, 0.3, 0.9 + R() * 0.3, '#a8a196', 'cyl16');
    for (let i = 0; i < 5; i++) k.S('lit', O, (R() - 0.5) * 0.9, 0.06, (R() - 0.5) * 0.9, 0.08 + R() * 0.08, '#9a9286', 'ico');
  },
  'column-fallen': (k, O, w) => {
    k.P('stone', O, 'cyl16', 0, 0.3, 0, 0.6, w * 0.85, 0.6, '#a8a196', 0, 0, Math.PI / 2);
  },
  'mine-support': (k, O, w) => {
    for (const x of [-1, 1]) k.B('wood', O, x * w * 0.42, 0, 0, 0.18, 2.3, 0.18, DARKWOOD);
    k.B('wood', O, 0, 2.15, 0, w * 0.95, 0.2, 0.2, DARKWOOD);
  },
  statue: (k, O, w, d, R, c) => {
    const col = c('stone', '#b8b2a6');
    k.B('lit', O, 0, 0, 0, 0.8, 0.4, 0.8, STONE);
    k.C('stone', O, 0, 0.4, 0, 0.22, 0.8, col, 'cyl16');
    k.S('stone', O, 0, 1.35, 0, 0.27, col);
    k.S('stone', O, 0, 1.75, 0, 0.16, col);
    for (const x of [-1, 1]) k.Beam('stone', O, [x * 0.22, 1.45, 0], [x * 0.32, 1.0, 0.08], 0.06, col);
  },
  'statue-knight': (k, O, w, d, R, c, p) => {
    MODELS.statue(k, O, w, d, R, c, p);
    k.Beam('stone', O, [0.32, 0.5, 0.12], [0.32, 1.6, 0.12], 0.03, '#b8b2a6');
  },
  altar: (k, O, w, d, R, c) => {
    k.B('stone', O, 0, 0, 0, w * 0.85, 0.85, d * 0.6, c('stone', '#a8a196'));
    k.B('lit', O, 0, 0.85, 0, w * 0.9, 0.08, d * 0.66, STONE);
    k.B('fabric', O, 0, 0.6, d * 0.3, w * 0.5, 0.33, 0.01, c('cloth', CLOTH));
    flameCup(k, O, -w * 0.32, 0.93, 0, 0.6);
    flameCup(k, O, w * 0.32, 0.93, 0, 0.6);
    return 1.1;
  },
  coffin: (k, O, w, d) => {
    k.B('wood', O, 0, 0, 0, Math.min(w, d) * 0.55, 0.45, Math.max(w, d) * 0.88, DARKWOOD);
    k.B('wood', O, 0, 0.45, 0, Math.min(w, d) * 0.58, 0.06, Math.max(w, d) * 0.9, '#4a2e18');
  },
  sarcophagus: (k, O, w, d, R, c) => {
    const col = c('stone', '#a8a196');
    k.B('stone', O, 0, 0, 0, w * 0.75, 0.8, d * 0.88, col);
    k.B('lit', O, 0, 0.8, 0, w * 0.8, 0.12, d * 0.92, STONE);
    k.P('stone', O, 'cyl16', 0, 0.98, 0, w * 0.3, d * 0.5, 0.2, col, Math.PI / 2, 0, 0);
    k.S('stone', O, 0, 1.0, -d * 0.32, 0.12, col);
  },
  'burial-slab': (k, O, w, d) => k.B('stone', O, 0, 0, 0, w * 0.7, 0.55, d * 0.85, '#9a9286'),
  bones: (k, O, w, d, R) => {
    for (let i = 0; i < 7; i++) {
      const a = R() * 6.28;
      k.Beam('lit', O, [(R() - 0.5) * 0.6, 0.03, (R() - 0.5) * 0.6], [(R() - 0.5) * 0.6 + Math.cos(a) * 0.3, 0.03, (R() - 0.5) * 0.6 + Math.sin(a) * 0.3], 0.025, '#e6dcc4');
    }
    k.S('lit', O, 0.1, 0.09, 0, 0.09, '#eae2cc');
  },
  'skull-pile': (k, O, w, d, R) => {
    for (let i = 0; i < 12; i++) k.S('lit', O, (R() - 0.5) * w * 0.6, 0.08 + (i > 8 ? 0.15 : 0), (R() - 0.5) * d * 0.6, 0.09, '#e6dcc4');
  },
  urn: (k, O, w, d, R, c) => {
    k.S('lit', O, 0, 0.3, 0, 0.22, c('clay', '#a0603a'));
    k.C('lit', O, 0, 0.45, 0, 0.1, 0.2, c('clay', '#a0603a'), 'cyl16');
  },
  pottery: (k, O, w, d, R, c, p) => MODELS.urn(k, O, w, d, R, c, p),
  'torch-sconce': (k, O) => {
    k.B('metal', O, 0, 1.35, -0.04, 0.12, 0.18, 0.04, IRON);
    k.Beam('wood', O, [0, 1.35, -0.02], [0, 1.65, 0.12], 0.03, DARKWOOD);
    flameCup(k, O, 0, 1.62, 0.13, 1.2);
    return 1.8;
  },
  'sconce-witchfire': (k, O, w, d, R, c, p) => MODELS['torch-sconce'](k, O, w, d, R, c, p),
  'sconce-magefire': (k, O, w, d, R, c, p) => MODELS['torch-sconce'](k, O, w, d, R, c, p),
  brazier: (k, O) => {
    for (let i = 0; i < 3; i++) k.Beam('metal', O, [Math.cos(i * 2.1) * 0.3, 0, Math.sin(i * 2.1) * 0.3], [Math.cos(i * 2.1) * 0.18, 0.7, Math.sin(i * 2.1) * 0.18], 0.03, IRON);
    k.P('metal', O, 'hemi', 0, 0.85, 0, 0.6, -0.25, 0.6, IRON);
    k.S('glow', O, 0, 0.82, 0, 0.18, '#ff7a1a', 'ico');
    flameCup(k, O, 0, 0.82, 0, 2.2);
    return 1.2;
  },
  'brazier-everburning': (k, O, w, d, R, c, p) => MODELS.brazier(k, O, w, d, R, c, p),
  candles: (k, O, w, d, R) => {
    for (let i = 0; i < 5; i++) {
      const x = (R() - 0.5) * 0.4, z = (R() - 0.5) * 0.4, h = 0.1 + R() * 0.2;
      k.C('lit', O, x, 0, z, 0.03, h, '#efe6cf', 'cyl6');
      flameCup(k, O, x, h, z, 0.35);
    }
    return 0.4;
  },
  candelabra: (k, O) => {
    k.C('metal', O, 0, 0, 0, 0.16, 0.05, GOLD, 'cyl16');
    k.C('metal', O, 0, 0, 0, 0.03, 1.3, GOLD, 'cyl6');
    for (const x of [-0.22, 0, 0.22]) {
      k.C('lit', O, x, 1.3, 0, 0.03, 0.15, '#efe6cf', 'cyl6');
      flameCup(k, O, x, 1.45, 0, 0.4);
    }
    k.B('metal', O, 0, 1.28, 0, 0.5, 0.03, 0.03, GOLD);
    return 1.55;
  },
  'lantern-standing': (k, O) => {
    k.C('metal', O, 0, 0, 0, 0.04, 1.4, IRON, 'cyl6');
    k.B('metal', O, 0, 1.4, 0, 0.2, 0.25, 0.2, IRON);
    k.S('glow', O, 0, 1.52, 0, 0.07, '#ffd27a');
    return 1.55;
  },
  'lamp-post': (k, O, w, d, R, c, p) => MODELS['lantern-standing'](k, O, w, d, R, c, p),
  chandelier: (k, O, w) => {
    k.Ring('metal', O, 0, 2.05, 0, w * 0.35, 0.04, IRON);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2, x = Math.cos(a) * w * 0.35, z = Math.sin(a) * w * 0.35;
      flameCup(k, O, x, 2.07, z, 0.4);
      k.Beam('metal', O, [x, 2.05, z], [0, 2.4, 0], 0.01, IRON);
    }
    return 2.1;
  },
  campfire: (k, O, w, d, R) => {
    for (let i = 0; i < 8; i++) k.S('lit', O, Math.cos((i / 8) * 6.28) * 0.36, 0.05, Math.sin((i / 8) * 6.28) * 0.36, 0.09, '#7a746a', 'ico');
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * 6.28 + R();
      k.Beam('wood', O, [Math.cos(a) * 0.28, 0.02, Math.sin(a) * 0.28], [0, 0.22, 0], 0.04, '#4a2e18');
    }
    k.S('glow', O, 0, 0.12, 0, 0.12, '#ff7a1a', 'ico');
    flameCup(k, O, 0, 0.1, 0, 2);
    return 0.5;
  },
  'campfire-spit': (k, O, w, d, R, c, p) => MODELS.campfire(k, O, w, d, R, c, p),
  fireplace: (k, O, w, d) => {
    k.B('stone', O, 0, 0, -d * 0.3, w * 0.95, 1.4, d * 0.4, '#8f887c');
    k.B('cave', O, 0, 0, -d * 0.25, w * 0.5, 0.75, d * 0.32, '#2a2420');
    k.B('lit', O, 0, 1.0, -d * 0.12, w * 1.0, 0.1, d * 0.6, STONE);
    flameCup(k, O, 0, 0.1, -d * 0.2, 2);
    return 0.4;
  },
  well: (k, O) => {
    k.C('stone', O, 0, 0, 0, 0.6, 0.75, '#9a9286', 'cyl16');
    k.P('cave', O, 'disc', 0, 0.76, 0, 0.95, 1, 0.95, '#0e1a22');
    for (const x of [-1, 1]) k.B('wood', O, x * 0.55, 0.75, 0, 0.08, 1.0, 0.08, DARKWOOD);
    k.P('wood', O, 'pyr', 0, 1.95, 0, 1.4, 0.5, 0.9, '#6a3a1a');
    k.Beam('wood', O, [-0.55, 1.5, 0], [0.55, 1.5, 0], 0.05, DARKWOOD);
  },
  fountain: (k, O, w) => {
    k.C('stone', O, 0, 0, 0, w * 0.45, 0.45, '#a8a196', 'cyl16');
    k.P('glow', O, 'disc', 0, 0.42, 0, w * 0.82, 1, w * 0.82, '#2a5a7a');
    k.C('stone', O, 0, 0.45, 0, 0.12, 0.7, '#a8a196', 'cyl16');
    k.P('stone', O, 'hemi', 0, 1.15, 0, 0.7, -0.2, 0.7, '#a8a196');
  },
  'stairs-down': (k, O, w, d) => {
    for (let i = 0; i < 6; i++) k.B('cave', O, 0, -0.18 * (i + 1), -d / 2 + (i + 0.5) * (d / 6), w * 0.9, 0.18, d / 6, '#6e675e');
    k.B('cave', O, 0, -1.2, 0, w * 0.92, 0.05, d * 0.95, '#1a1714');
  },
  'stairs-up': (k, O, w, d) => {
    for (let i = 0; i < 8; i++) k.B('stone', O, 0, 0, d / 2 - (i + 0.5) * (d / 8), w * 0.9, 0.2 * (i + 1), d / 8, '#9a9286');
  },
  ladder: (k, O) => {
    for (const x of [-0.2, 0.2]) k.B('wood', O, x, 0, -0.3, 0.05, 2.4, 0.05, WOOD);
    for (let i = 0; i < 7; i++) k.B('wood', O, 0, 0.3 + i * 0.3, -0.3, 0.4, 0.04, 0.04, WOOD);
  },
  trapdoor: (k, O, w, d) => {
    k.B('wood', O, 0, 0, 0, w * 0.8, 0.04, d * 0.8, DARKWOOD);
    k.Ring('metal', O, 0, 0.05, d * 0.25, 0.06, 0.012, IRON);
  },
  cauldron: (k, O) => {
    k.P('metal', O, 'sph', 0, 0.38, 0, 0.75, 0.65, 0.75, '#2c2e32');
    k.P('glow', O, 'disc', 0, 0.62, 0, 0.6, 1, 0.6, '#4a8a3a');
    for (let i = 0; i < 3; i++) k.C('metal', O, Math.cos(i * 2.1) * 0.25, 0, Math.sin(i * 2.1) * 0.25, 0.03, 0.15, '#2c2e32', 'cyl6');
  },
  anvil: (k, O) => {
    k.B('wood', O, 0, 0, 0, 0.4, 0.45, 0.4, DARKWOOD);
    k.B('metal', O, 0, 0.45, 0, 0.55, 0.18, 0.22, '#3a3c40');
    k.P('metal', O, 'cone', 0.38, 0.56, 0, 0.14, 0.24, 0.14, '#3a3c40', 0, 0, Math.PI / 2);
  },
  'weapon-rack': (k, O, w) => {
    k.B('wood', O, 0, 0, -0.2, w * 0.9, 0.08, 0.3, DARKWOOD);
    k.B('wood', O, 0, 1.1, -0.25, w * 0.9, 0.08, 0.1, DARKWOOD);
    for (let i = 0; i < 4; i++) {
      const x = -w * 0.33 + (i / 3) * w * 0.66;
      k.Beam('metal', O, [x, 0.08, -0.15], [x, 1.5, -0.25], 0.02, '#b8bcc4');
      if (i % 2) k.P('metal', O, 'cone', x, 1.6, -0.26, 0.08, 0.2, 0.03, '#b8bcc4');
    }
  },
  'armor-stand': (k, O) => {
    k.C('wood', O, 0, 0, 0, 0.2, 0.05, DARKWOOD, 'cyl16');
    k.C('wood', O, 0, 0, 0, 0.03, 1.1, DARKWOOD, 'cyl6');
    k.B('metal', O, 0, 0.8, 0, 0.5, 0.6, 0.28, '#9aa0a8');
    k.S('metal', O, 0, 1.55, 0, 0.15, '#9aa0a8');
  },
  'training-dummy': (k, O) => {
    k.C('wood', O, 0, 0, 0, 0.05, 1.0, DARKWOOD, 'cyl6');
    k.C('fabric', O, 0, 0.9, 0, 0.2, 0.6, '#c9b07a', 'cyl16');
    k.S('fabric', O, 0, 1.65, 0, 0.15, '#c9b07a');
    k.Beam('wood', O, [-0.45, 1.3, 0], [0.45, 1.3, 0], 0.04, DARKWOOD);
  },
  'bar-counter': (k, O, w, d) => {
    k.B('wood', O, 0, 0, 0, w * 0.97, 1.05, d * 0.6, DARKWOOD);
    k.B('wood', O, 0, 1.05, 0, w, 0.06, d * 0.7, WOOD);
  },
  'shop-counter': (k, O, w, d, R, c, p) => MODELS['bar-counter'](k, O, w, d, R, c, p),
  wardrobe: (k, O, w, d) => {
    k.B('wood', O, 0, 0, -d * 0.1, w * 0.9, 1.9, d * 0.6, DARKWOOD);
    k.B('wood', O, 0, 1.9, -d * 0.1, w * 0.95, 0.08, d * 0.65, WOOD);
    k.B('wood', O, 0, 0.1, d * 0.2 + 0.005, 0.02, 1.75, 0.01, '#3a2412');
  },
  dresser: (k, O, w, d) => {
    k.B('wood', O, 0, 0, 0, w * 0.9, 0.9, d * 0.6, DARKWOOD);
    for (let i = 0; i < 3; i++) k.B('metal', O, 0, 0.2 + i * 0.28, d * 0.3, 0.1, 0.03, 0.03, GOLD);
  },
  nightstand: (k, O) => k.B('wood', O, 0, 0, 0, 0.45, 0.6, 0.45, DARKWOOD),
  footlocker: (k, O, w, d, R, c, p) => MODELS.chest(k, O, w, d, R, c, p),
  trunk: (k, O, w, d, R, c, p) => MODELS.chest(k, O, w, d, R, c, p),
  strongbox: (k, O, w, d, R, c, p) => MODELS.chest(k, O, w, d, R, c, p),
  cage: (k, O, w, d) => {
    k.B('metal', O, 0, 0, 0, w * 0.85, 0.06, d * 0.85, IRON);
    k.B('metal', O, 0, 1.5, 0, w * 0.85, 0.06, d * 0.85, IRON);
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * 4, side = Math.floor(t), f = t - side;
      const x = [-1 + 2 * f, 1, 1 - 2 * f, -1][side] * w * 0.42, z = [-1, -1 + 2 * f, 1, 1 - 2 * f][side] * d * 0.42;
      k.C('metal', O, x, 0, z, 0.02, 1.52, IRON, 'cyl6');
    }
  },
  'iron-maiden': (k, O) => {
    k.P('metal', O, 'cyl16', 0, 1.0, 0, 0.6, 2.0, 0.45, '#4a4d52');
    k.S('metal', O, 0, 2.05, 0, 0.18, '#4a4d52');
  },
  boulder: (k, O, w, d, R) => k.S('cave', O, 0, 0.3, 0, 0.42, '#8a8073', 'ico'),
  'boulder-large': (k, O, w, d, R) => {
    k.S('cave', O, 0, 0.6, 0, w * 0.42, '#8a8073', 'ico');
    k.S('cave', O, w * 0.2, 0.3, d * 0.2, w * 0.25, '#7a7066', 'ico');
  },
  'rubble-pile': (k, O, w, d, R) => {
    for (let i = 0; i < 14; i++) k.S('lit', O, (R() - 0.5) * w * 0.8, R() * 0.15, (R() - 0.5) * d * 0.8, 0.07 + R() * 0.12, i % 2 ? '#8a8073' : '#a39887', 'ico');
  },
  'desert-rocks': (k, O, w, d, R, c, p) => MODELS['rubble-pile'](k, O, w, d, R, c, p),
  stalagmites: (k, O, w, d, R) => {
    for (let i = 0; i < 4; i++) {
      const h = 0.5 + R() * 1.1;
      k.P('cave', O, 'cone', (R() - 0.5) * w * 0.6, h / 2, (R() - 0.5) * d * 0.6, 0.2 + R() * 0.15, h, 0.2 + R() * 0.15, '#8a7e70');
    }
  },
  stalactites: (k, O, w, d, R) => {
    for (let i = 0; i < 4; i++) {
      const h = 0.4 + R() * 0.8;
      k.P('cave', O, 'cone', (R() - 0.5) * w * 0.6, 2.4 - h / 2, (R() - 0.5) * d * 0.6, 0.18, h, 0.18, '#7a7066', Math.PI, 0, 0);
    }
  },
  'crystal-cluster': (k, O, w, d, R, c) => {
    for (let i = 0; i < 6; i++) {
      const h = 0.3 + R() * 0.7;
      k.P('glow', O, 'oct', (R() - 0.5) * 0.5, h / 2, (R() - 0.5) * 0.5, 0.14, h, 0.14, c('crystal', '#7fd6ff'), (R() - 0.5) * 0.6, 0, (R() - 0.5) * 0.6);
    }
  },
  'cave-crystals': (k, O, w, d, R, c, p) => MODELS['crystal-cluster'](k, O, w, d, R, c, p),
  'glowing-fungus': (k, O, w, d, R) => {
    for (let i = 0; i < 7; i++) {
      const x = (R() - 0.5) * w * 0.7, z = (R() - 0.5) * d * 0.7, h = 0.1 + R() * 0.3;
      k.C('lit', O, x, 0, z, 0.025, h, '#d9d2c0', 'cyl6');
      k.P('glow', O, 'hemi', x, h, z, 0.18, 0.08, 0.18, '#5ad8a6');
    }
  },
  mushrooms: (k, O, w, d, R) => {
    for (let i = 0; i < 6; i++) {
      const x = (R() - 0.5) * w * 0.7, z = (R() - 0.5) * d * 0.7, h = 0.08 + R() * 0.15;
      k.C('lit', O, x, 0, z, 0.02, h, '#e6dcc4', 'cyl6');
      k.P('fabric', O, 'hemi', x, h, z, 0.14, 0.07, 0.14, '#a8402a');
    }
  },
  'tree-oak': (k, O, w, d, R) => tree(k, O, R, '#4a7a35', '#5a3d24', 2.8, w * 0.42),
  'tree-birch': (k, O, w, d, R) => tree(k, O, R, '#7aa04a', '#d8d2c4', 2.8, w * 0.35, false, 'airy'),
  'tree-willow': (k, O, w, d, R) => tree(k, O, R, '#6a8a3a', '#5a3d24', 2.6, w * 0.45, false, 'weeping'),
  'tree-swamp': (k, O, w, d, R) => tree(k, O, R, '#4a5a2a', '#3a2c1c', 2.6, w * 0.4, false, 'swamp'),
  'tree-pine': (k, O, w, d, R) => tree(k, O, R, '#2f5a32', '#4a3020', 3.2, w * 0.35, true),
  'tree-fir-snow': (k, O, w, d, R) => tree(k, O, R, '#dfe8ee', '#4a3020', 3.2, w * 0.35, true),
  'tree-dead': (k, O, w, d, R) => {
    k.C('wood', O, 0, 0, 0, 0.14, 2.2, '#5a4a3a', 'cyl6');
    for (let i = 0; i < 5; i++) {
      const a = R() * 6.28, y = 1.0 + R() * 1.1;
      k.Beam('wood', O, [0, y, 0], [Math.cos(a) * 0.8, y + 0.5, Math.sin(a) * 0.8], 0.04, '#5a4a3a');
    }
  },
  bush: (k, O, w, d, R) => {
    if (foliageOn()) return bushCrown({ x: O.x, y: O.y ?? 0, z: O.z }, R, '#3f6a32', Math.max(0.45, Math.min(w, d) * 0.5));
    for (let i = 0; i < 4; i++) k.S('fabric', O, (R() - 0.5) * 0.4, 0.3 + R() * 0.15, (R() - 0.5) * 0.4, 0.3, '#3f6a32', 'ico');
  },
  'thorn-bush': (k, O, w, d, R, c, p) => MODELS.bush(k, O, w, d, R, c, p),
  hedge: (k, O, w, d) => k.B('fabric', O, 0, 0, 0, w * 0.9, 1.3, d * 0.8, '#3f6a32'),
  'hedge-long': (k, O, w, d) => k.B('fabric', O, 0, 0, 0, w * 0.95, 1.3, d * 0.8, '#3f6a32'),
  stump: (k, O) => k.C('wood', O, 0, 0, 0, 0.3, 0.4, '#6a4a2a', 'cyl16'),
  'log-fallen': (k, O, w) => k.P('wood', O, 'cyl16', 0, 0.25, 0, 0.5, w * 0.9, 0.5, '#6a4a2a', 0, 0, Math.PI / 2),
  'log-pile': (k, O, w, d) => {
    for (let i = 0; i < 6; i++) k.P('wood', O, 'cyl16', 0, 0.14 + (i > 2 ? 0.24 : 0), (i % 3 - 1) * 0.28 + (i > 2 ? 0.14 : 0), 0.26, w * 0.8, 0.26, '#7a5432', 0, 0, Math.PI / 2);
  },
  firewood: (k, O, w, d, R, c, p) => MODELS['log-pile'](k, O, w, d, R, c, p),
  'hay-bale': (k, O, w, d) => k.B('fabric', O, 0, 0, 0, w * 0.8, 0.5, d * 0.6, '#d8b860'),
  'standing-stone': (k, O) => k.P('stone', O, 'box', 0, 1.1, 0, 0.6, 2.2, 0.4, '#8f887c', 0.05, 0.2, 0.04),
  obelisk: (k, O) => {
    k.B('stone', O, 0, 0, 0, 0.6, 2.4, 0.6, '#5a5550');
    k.P('stone', O, 'pyr', 0, 2.55, 0, 0.6, 0.3, 0.6, '#5a5550');
  },
  'rune-stone': (k, O, w, d, R, c, p) => MODELS['standing-stone'](k, O, w, d, R, c, p),
  'spider-web': () => {},
  'magic-circle': () => {},
  'summoning-circle': () => {},
  rug: () => {},
};
// more models live in their own files; an id already modelled above wins
for (const [k, v] of Object.entries({ ...MORE_MODELS, ...MORE_MODELS2, ...EXTRA_MODELS, ...OUTDOOR_MODELS })) if (!MODELS[k]) MODELS[k] = v;

/** A sprite card laid flat: the object's own overhead art, on the floor or on top of a stand-in body. */
const spriteTexCache = new Map<string, THREE.Texture>();
function spriteTex(def: ObjDef, v: number, seed: number) {
  const key = `${def.id}|${v}|${seed % 8}`;
  let t = spriteTexCache.get(key);
  if (!t) {
    const sp = objectSprite(def, v, 128, 0, seed % 8);
    t = new THREE.CanvasTexture(sp.canvas as HTMLCanvasElement);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.userData.sp = sp;
    spriteTexCache.set(key, t);
  }
  return t;
}

const HEIGHT_BY_CAT: Record<string, number> = {
  furniture: 0.8, storage: 0.75, light: 1.4, treasure: 0.25, trap: 0.03, hazard: 0.03, nature: 0.6, terrain: 0.05, structure: 1.6,
  religious: 1.0, arcane: 0.9, kitchen: 0.9, workshop: 0.9, decor: 0.9, vehicle: 1.1, gm: 0.02,
};

function firstColour(def: ObjDef, fb = '#8a7a66') {
  for (const v of Object.values(def.c)) if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  return fb;
}

/** Where a wall-hung thing (torch sconce) should sit: against the nearest wall of its square, facing into the room. */
function wallSide(m: GameMap, x: number, y: number): number | null {
  const sides: [string, number][] = [[hKey(x, y), Math.PI], [hKey(x, y + 1), 0], [vKey(x, y), -Math.PI / 2], [vKey(x + 1, y), Math.PI / 2]];
  const nb = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  for (let i = 0; i < 4; i++) if (isWall(m, sides[i][0]) || !isFloor(m, x + nb[i][0], y + nb[i][1])) return sides[i][1];
  return null;
}

/**
 * Things modelled for the old 12 ft rooms that hang from the ceiling. Lamps drop to a good height on a longer chain;
 * rock teeth, webs and drying racks move right up under the ceiling.
 */
const OLD_TOP = 2.4;
const HANG_LAMP = new Set(['chandelier', 'chandelier-tiered', 'chandelier-crystal', 'chandelier-wheel', 'chandelier-antler', 'lantern-hanging', 'candle-hoop', 'oil-lamp-hanging', 'light-orb', 'pot-rack']);
const HANG_TOP = new Set(['stalactites', 'cobweb-corner', 'herbs-drying']);

const WALL_HUNG = new Set(['torch-sconce', 'sconce-witchfire', 'sconce-magefire', 'wall-chains', 'tomb-niche', 'tool-wall', 'notice-board', 'dartboard', 'tavern-sign', 'mirror', 'magic-mirror']);

export function buildProps(m: GameMap, kit: Kit, root: THREE.Group, mats: THREE.Material[], vis: VisUniforms, role: 'gm' | 'player', shadows: boolean, heightAt?: (x: number, z: number) => number, quality: 'low' | 'medium' | 'high' = 'high'): LightSpot[] {
  const lights: LightSpot[] = [];
  const glows = new THREE.Group();
  glows.name = 'glows';
  root.add(glows);
  const glowMat = new THREE.SpriteMaterial({ map: glowTex(), color: '#ffb35a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 });
  mats.push(glowMat);
  const addGlow = (x: number, y: number, z: number, col: string, s: number) => {
    const g = new THREE.Sprite(glowMat.clone());
    (g.material as THREE.SpriteMaterial).color.set(col);
    mats.push(g.material);
    g.position.set(x, y, z);
    g.scale.setScalar(s);
    g.userData.glow = true;
    glows.add(g);
  };

  for (const p of m.props) {
    const def = objectById(p.kind);
    if (!def) continue;
    if (role === 'player' && (p.gmOnly || def.gmOnly || def.cat === 'gm')) continue;
    const rot = ((p.rot % 360) + 360) % 360;
    const W = rot % 180 ? def.h : def.w, H = rot % 180 ? def.w : def.h;
    const cx = p.x + W / 2, cz = p.y + H / 2;
    let ry = (-rot * Math.PI) / 180;
    const R = rng((p.x * 73856093) ^ (p.y * 19349663) ^ p.kind.length);
    const vc = def.variants?.[p.v ?? 0]?.c ?? {};
    const c = (key: string, fb: string) => vc[key] ?? def.c[key] ?? fb;
    // outdoors things stand on the rolling ground (and float at the waterline, not on the river bed)
    const gy = heightAt ? Math.max(-0.1, heightAt(cx, cz)) : 0;
    let O = { x: cx, z: cz, ry, y: gy };
    let flameY: number | void = undefined;
    if (WALL_HUNG.has(def.id)) {
      const side = wallSide(m, p.x, p.y);
      if (side !== null) {
        ry = side;
        // push to the wall: local -z points at the wall after turning by ry
        O = { x: cx - Math.sin(ry) * 0.42, z: cz - Math.cos(ry) * 0.42, ry, y: gy };
      }
    }
    const model = MODELS[def.id];
    const lift = HANG_TOP.has(def.id) ? WALL_H - OLD_TOP : HANG_LAMP.has(def.id) ? Math.max(0, WALL_H - OLD_TOP - 1.4) : 0;
    if (lift) {
      O = { ...O, y: gy + lift };
      if (HANG_LAMP.has(def.id)) kit.Beam('metal', O, [0, OLD_TOP - 0.02, 0], [0, WALL_H - lift, 0], 0.016, '#2e2c2a', 'cyl6');
    }
    if (model) {
      flameY = model(kit, O, def.w, def.h, R, c, p);
      if (typeof flameY === 'number') flameY += lift;
    }
    else {
      // stand-in body with the overhead picture on top
      const flat = def.flat || def.layer === 'floor' || (HEIGHT_BY_CAT[def.cat] ?? 0.5) < 0.06;
      const h = flat ? 0 : HEIGHT_BY_CAT[def.cat] ?? 0.6;
      if (h > 0) {
        const col = firstColour(def);
        const bin = def.cat === 'nature' ? 'fabric' : def.cat === 'structure' || def.cat === 'religious' ? 'stone' : def.cat === 'light' || def.cat === 'arcane' ? 'metal' : 'wood';
        if (def.layer === 'overhead') k3Canopy(kit, O, def.w, def.h, R, col);
        else if (def.cat === 'nature') kit.S('fabric', O, 0, h / 2, 0, Math.min(def.w, def.h) * 0.4, col, 'ico');
        else kit.B(bin, O, 0, 0, 0, def.w * 0.82, h, def.h * 0.82, col);
      }
      const tex = spriteTex(def, p.v ?? 0, (p.x * 31 + p.y * 17) >>> 0);
      const sp = tex.userData.sp as { canvas: { width: number; height: number } };
      const mat = shade(new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.35, depthWrite: true, roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -2 }), vis);
      mats.push(mat);
      const g = new THREE.PlaneGeometry(sp.canvas.width / 128, sp.canvas.height / 128);
      g.rotateX(-Math.PI / 2);
      const me = new THREE.Mesh(g, mat);
      me.position.set(cx, gy + (h > 0 ? h : 0) + 0.012, cz);
      me.rotation.y = (-rot * Math.PI) / 180;
      me.receiveShadow = shadows;
      me.userData.prop = p.id;
      root.add(me);
      if (def.light) flameY = Math.max(0.4, h);
    }
    if (def.light && !p.off) {
      const fy = typeof flameY === 'number' ? flameY : 1.2;
      const range = (def.light.bright + def.light.dim) / 5;
      const fx = O.x + (WALL_HUNG.has(def.id) ? Math.sin(ry) * 0.15 : 0), fz = O.z + (WALL_HUNG.has(def.id) ? Math.cos(ry) * 0.15 : 0);
      lights.push({ x: fx, y: fy + gy, z: fz, color: def.light.color, range, intensity: 1.6, flame: true });
      addGlow(fx, fy + gy, fz, def.light.color, def.id.includes('brazier') || def.id.includes('campfire') ? 1.4 : 0.7);
    }
  }
  for (const l of m.lights ?? []) lights.push({ x: l.x, y: 1.9, z: l.y, color: l.color, range: (l.bright + l.dim) / 5, intensity: 1.4, flame: false });
  return lights;
}

function k3Canopy(kit: Kit, O: Spot, w: number, d: number, R: () => number, col: string) {
  tree(kit, O, R, col, '#5a3d24', 2.8, Math.min(w, d) * 0.42);
}

export function disposePropTextures() {
  for (const t of spriteTexCache.values()) t.dispose();
  spriteTexCache.clear();
}
/** Whether an object id has a real 3D model (not the stand-in box). */
export const hasModel = (id: string) => !!MODELS[id];

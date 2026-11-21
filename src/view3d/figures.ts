// Stand-in 3D figures for tokens until Lair Labs has its own creature models.
// Each figure is a little skeleton of named joints (hips, spine, head, arms, legs, tail...) with simple shapes hung on
// them, and it plays real animation clips (idle, walk, attack, hurt, die) through three.js's AnimationMixer with
// cross-fades, the same way a rigged model would. When proper models arrive, a loaded GLB with clips of the same names
// can replace the stand-in body without changing anything else.
import * as THREE from 'three';
import { glowTex } from './textures';
import type { Token } from '../engine/game';
import { creatureById } from '../library/creatures';
import { tokenSprite } from '../library/art/sprites';
import { FAMILY_RING, type CreatureFamily } from '../library/art/types';
import { shade, type VisUniforms } from './shaders';

export type ClipName = 'idle' | 'walk' | 'attack' | 'hurt' | 'die';
type Plan = 'biped' | 'quad' | 'blob' | 'flyer';

const PLAN: Record<CreatureFamily, Plan> = {
  hero: 'biped', humanoid: 'biped', undead: 'biped', fey: 'biped', giant: 'biped', fiend: 'biped', celestial: 'biped', construct: 'biped',
  dragon: 'flyer', beast: 'quad', monstrosity: 'quad', ooze: 'blob', plant: 'blob', aberration: 'blob', elemental: 'blob',
};

const E = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
function qTrack(node: string, times: number[], eul: [number, number, number][]) {
  const v: number[] = [];
  for (const e of eul) v.push(...E(...e).toArray());
  return new THREE.QuaternionKeyframeTrack(`${node}.quaternion`, times, v);
}
function pTrack(node: string, times: number[], pos: [number, number, number][]) {
  return new THREE.VectorKeyframeTrack(`${node}.position`, times, pos.flat());
}
function sTrack(node: string, times: number[], s: [number, number, number][]) {
  return new THREE.VectorKeyframeTrack(`${node}.scale`, times, s.flat());
}

/** World size of the stand-in figures: 0.76 makes a medium humanoid about 6 ft against 5 ft squares. */
export const FIG = 0.76;

interface Rig { root: THREE.Group; body: THREE.Group; clips: Record<ClipName, THREE.AnimationClip>; height: number }

function sizeScale(t: Token, size?: string) {
  const s = size ?? (t.size >= 4 ? 'Gargantuan' : t.size === 3 ? 'Huge' : t.size === 2 ? 'Large' : 'Medium');
  return { Tiny: 0.45, Small: 0.75, Medium: 1, Large: 1.65, Huge: 2.5, Gargantuan: 3.4 }[s] ?? 1;
}

function mats(vis: VisUniforms, main: string, accent: string, skin: string, glow = false) {
  const m = (col: string, rough = 0.7, metal = 0) => shade(new THREE.MeshStandardMaterial({ color: col, roughness: rough, metalness: metal }), vis);
  return {
    main: m(main),
    accent: m(accent, 0.5, 0.2),
    skin: glow ? shade(new THREE.MeshStandardMaterial({ color: skin, emissive: skin, emissiveIntensity: 0.6, roughness: 0.4 }), vis) : m(skin, 0.8),
    metal: m('#b8bcc4', 0.35, 0.8),
    dark: m('#2a2420', 0.9),
    eye: shade(new THREE.MeshStandardMaterial({ color: '#000', emissive: glow ? '#ffffff' : '#ffe9a8', emissiveIntensity: glow ? 1.5 : 0.25 }), vis),
  };
}

const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cap: new THREE.CapsuleGeometry(0.5, 1, 4, 10),
  sph: new THREE.SphereGeometry(0.5, 16, 12),
  cone: new THREE.ConeGeometry(0.5, 1, 10),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 10),
};
function part(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number, rx = 0, ry = 0, rz = 0) {
  const me = new THREE.Mesh(geo, mat);
  me.position.set(x, y, z);
  me.scale.set(sx, sy, sz);
  me.rotation.set(rx, ry, rz);
  me.castShadow = true;
  parent.add(me);
  return me;
}
function joint(parent: THREE.Object3D, name: string, x: number, y: number, z: number) {
  const j = new THREE.Group();
  j.name = name;
  j.position.set(x, y, z);
  parent.add(j);
  return j;
}

function biped(M: ReturnType<typeof mats>, fam: CreatureFamily, armed: boolean): Rig {
  const root = new THREE.Group();
  const body = joint(root, 'hips', 0, 0.82, 0);
  const spine = joint(body, 'spine', 0, 0.08, 0);
  part(body, G.box, M.main, 0, 0, 0, 0.36, 0.2, 0.22);
  part(spine, G.cap, M.main, 0, 0.27, 0, 0.42, 0.28, 0.26);
  part(spine, G.box, M.accent, 0, 0.12, 0.0, 0.4, 0.06, 0.27);
  const neck = joint(spine, 'neck', 0, 0.56, 0);
  const head = joint(neck, 'head', 0, 0.06, 0);
  part(head, G.sph, M.skin, 0, 0.13, 0, 0.27, 0.3, 0.28);
  part(head, G.sph, M.eye, -0.06, 0.16, 0.12, 0.05, 0.05, 0.03);
  part(head, G.sph, M.eye, 0.06, 0.16, 0.12, 0.05, 0.05, 0.03);
  if (fam === 'fiend') for (const s of [-1, 1]) part(head, G.cone, M.dark, s * 0.1, 0.32, -0.02, 0.06, 0.18, 0.06, 0, 0, -s * 0.4);
  if (fam === 'hero' || fam === 'humanoid') part(head, G.sph, M.accent, 0, 0.2, -0.03, 0.29, 0.22, 0.3);
  if (fam === 'celestial') part(head, new THREE.TorusGeometry(0.16, 0.015, 6, 20), M.skin, 0, 0.36, 0, 1, 1, 1, Math.PI / 2, 0, 0);
  for (const s of [-1, 1]) {
    const side = s < 0 ? 'L' : 'R';
    const sh = joint(spine, 'arm' + side, s * 0.25, 0.48, 0);
    part(sh, G.sph, M.accent, 0, 0, 0, 0.16, 0.14, 0.16);
    part(sh, G.cap, M.main, 0, -0.16, 0, 0.11, 0.2, 0.11);
    const el = joint(sh, 'fore' + side, 0, -0.32, 0);
    part(el, G.cap, M.skin, 0, -0.14, 0, 0.09, 0.18, 0.09);
    part(el, G.sph, M.skin, 0, -0.3, 0, 0.1, 0.1, 0.1);
    if (armed && s > 0) {
      const w = joint(el, 'weapon', 0, -0.3, 0.02);
      part(w, G.box, M.metal, 0, 0, 0.32, 0.04, 0.03, 0.6);
      part(w, G.box, M.accent, 0, 0, 0.0, 0.16, 0.04, 0.04);
    }
    if (armed && s < 0 && (fam === 'hero' || fam === 'humanoid')) part(el, G.cyl, M.accent, -0.06, -0.2, 0.05, 0.36, 0.04, 0.36, 0, 0, Math.PI / 2);
    const hip = joint(body, 'leg' + side, s * 0.11, -0.08, 0);
    part(hip, G.cap, M.main, 0, -0.2, 0, 0.14, 0.24, 0.14);
    const kn = joint(hip, 'shin' + side, 0, -0.4, 0);
    part(kn, G.cap, M.dark, 0, -0.17, 0, 0.12, 0.22, 0.12);
    part(kn, G.box, M.dark, 0, -0.33, 0.05, 0.12, 0.08, 0.22);
  }
  if (fam === 'fey' || fam === 'celestial' || fam === 'fiend') {
    for (const s of [-1, 1]) {
      const wj = joint(spine, s < 0 ? 'wingL' : 'wingR', s * 0.1, 0.45, -0.14);
      part(wj, G.box, fam === 'fiend' ? M.dark : M.skin, s * 0.35, 0.05, 0, 0.7, 0.42, 0.02, 0, 0, s * 0.2);
    }
  }
  const t = [0, 1, 2];
  const clips: Record<ClipName, THREE.AnimationClip> = {
    idle: new THREE.AnimationClip('idle', 2, [
      qTrack('spine', t, [[0.02, 0, 0], [-0.02, 0, 0], [0.02, 0, 0]]),
      qTrack('armL', t, [[0, 0, -0.08], [0.05, 0, -0.12], [0, 0, -0.08]]),
      qTrack('armR', t, [[0, 0, 0.08], [0.05, 0, 0.12], [0, 0, 0.08]]),
      qTrack('foreR', t, [[-0.5, 0, 0], [-0.55, 0, 0], [-0.5, 0, 0]]),
      qTrack('head', t, [[0, -0.1, 0], [0.04, 0.1, 0], [0, -0.1, 0]]),
      pTrack('hips', t, [[0, 0.82, 0], [0, 0.805, 0], [0, 0.82, 0]]),
    ]),
    walk: new THREE.AnimationClip('walk', 0.7, [
      qTrack('legL', [0, 0.35, 0.7], [[0.55, 0, 0], [-0.55, 0, 0], [0.55, 0, 0]]),
      qTrack('legR', [0, 0.35, 0.7], [[-0.55, 0, 0], [0.55, 0, 0], [-0.55, 0, 0]]),
      qTrack('shinL', [0, 0.175, 0.35, 0.525, 0.7], [[0, 0, 0], [0, 0, 0], [0.9, 0, 0], [0.3, 0, 0], [0, 0, 0]]),
      qTrack('shinR', [0, 0.175, 0.35, 0.525, 0.7], [[0.9, 0, 0], [0.3, 0, 0], [0, 0, 0], [0, 0, 0], [0.9, 0, 0]]),
      qTrack('armL', [0, 0.35, 0.7], [[-0.45, 0, -0.08], [0.45, 0, -0.08], [-0.45, 0, -0.08]]),
      qTrack('armR', [0, 0.35, 0.7], [[0.45, 0, 0.08], [-0.45, 0, 0.08], [0.45, 0, 0.08]]),
      qTrack('spine', [0, 0.35, 0.7], [[0.06, 0.08, 0], [0.06, -0.08, 0], [0.06, 0.08, 0]]),
      pTrack('hips', [0, 0.175, 0.35, 0.525, 0.7], [[0, 0.82, 0], [0, 0.86, 0], [0, 0.82, 0], [0, 0.86, 0], [0, 0.82, 0]]),
    ]),
    attack: new THREE.AnimationClip('attack', 0.8, [
      qTrack('armR', [0, 0.25, 0.4, 0.8], [[0, 0, 0.1], [-2.6, 0, 0.3], [-0.2, 0, -0.1], [0, 0, 0.1]]),
      qTrack('foreR', [0, 0.25, 0.4, 0.8], [[-0.5, 0, 0], [-0.8, 0, 0], [-0.1, 0, 0], [-0.5, 0, 0]]),
      qTrack('spine', [0, 0.25, 0.4, 0.8], [[0, 0, 0], [-0.15, 0.4, 0], [0.3, -0.3, 0], [0, 0, 0]]),
      qTrack('legL', [0, 0.4, 0.8], [[0, 0, 0], [-0.4, 0, 0], [0, 0, 0]]),
      qTrack('legR', [0, 0.4, 0.8], [[0, 0, 0], [0.3, 0, 0], [0, 0, 0]]),
    ]),
    hurt: new THREE.AnimationClip('hurt', 0.5, [
      qTrack('spine', [0, 0.12, 0.5], [[0, 0, 0], [-0.45, 0, 0.15], [0, 0, 0]]),
      qTrack('head', [0, 0.12, 0.5], [[0, 0, 0], [-0.4, 0, 0], [0, 0, 0]]),
      qTrack('armL', [0, 0.12, 0.5], [[0, 0, 0], [-0.6, 0, -0.5], [0, 0, 0]]),
      qTrack('armR', [0, 0.12, 0.5], [[0, 0, 0], [-0.6, 0, 0.5], [0, 0, 0]]),
    ]),
    die: new THREE.AnimationClip('die', 1.2, [
      qTrack('hips', [0, 0.4, 1.2], [[0, 0, 0], [-0.4, 0, 0.1], [-1.5, 0, 0.1]]),
      pTrack('hips', [0, 0.4, 1.2], [[0, 0.82, 0], [0, 0.5, -0.1], [0, 0.18, -0.35]]),
      qTrack('legL', [0, 0.4, 1.2], [[0, 0, 0], [0.8, 0, 0], [0.2, 0, 0]]),
      qTrack('legR', [0, 0.4, 1.2], [[0, 0, 0], [0.8, 0, 0], [0.1, 0, 0]]),
      qTrack('armL', [0, 1.2], [[0, 0, 0], [-2.2, 0, -0.4]]),
      qTrack('armR', [0, 1.2], [[0, 0, 0], [-2.2, 0, 0.4]]),
    ]),
  };
  return { root, body, clips, height: 1.6 };
}

function quad(M: ReturnType<typeof mats>, fam: CreatureFamily, winged: boolean): Rig {
  const root = new THREE.Group();
  const body = joint(root, 'hips', 0, 0.55, 0);
  part(body, G.cap, M.main, 0, 0.05, 0, 0.42, 0.55, 0.42, Math.PI / 2, 0, 0);
  part(body, G.box, M.accent, 0, 0.24, 0, 0.12, 0.06, 0.7);
  const neck = joint(body, 'neck', 0, 0.12, 0.42);
  part(neck, G.cap, M.main, 0, 0.12, 0.08, 0.2, 0.2, 0.2, -0.8, 0, 0);
  const head = joint(neck, 'head', 0, 0.26, 0.2);
  part(head, G.box, M.skin, 0, 0, 0.1, 0.24, 0.2, 0.36);
  part(head, G.box, M.dark, 0, -0.07, 0.24, 0.18, 0.06, 0.16);
  part(head, G.sph, M.eye, -0.09, 0.05, 0.2, 0.05, 0.05, 0.04);
  part(head, G.sph, M.eye, 0.09, 0.05, 0.2, 0.05, 0.05, 0.04);
  if (fam === 'dragon' || fam === 'monstrosity') for (const s of [-1, 1]) part(head, G.cone, M.dark, s * 0.08, 0.16, -0.05, 0.05, 0.22, 0.05, -0.8, 0, 0);
  else for (const s of [-1, 1]) part(head, G.cone, M.main, s * 0.08, 0.13, -0.04, 0.07, 0.12, 0.04);
  const legs: [string, number, number][] = [['legFL', -0.16, 0.3], ['legFR', 0.16, 0.3], ['legBL', -0.16, -0.3], ['legBR', 0.16, -0.3]];
  for (const [n, x, z] of legs) {
    const j = joint(body, n, x, -0.08, z);
    part(j, G.cap, M.main, 0, -0.2, 0, 0.12, 0.26, 0.12);
    part(j, G.box, M.dark, 0, -0.44, 0.03, 0.12, 0.06, 0.16);
  }
  const tail = joint(body, 'tail', 0, 0.08, -0.48);
  part(tail, G.cone, M.main, 0, 0, -0.25, 0.12, 0.55, 0.12, -Math.PI / 2 - 0.3, 0, 0);
  if (winged)
    for (const s of [-1, 1]) {
      const wj = joint(body, s < 0 ? 'wingL' : 'wingR', s * 0.15, 0.22, 0.05);
      part(wj, G.box, M.accent, s * 0.5, 0.05, 0, 1.0, 0.03, 0.55, 0, 0, s * 0.15);
    }
  const t = [0, 1, 2];
  const leg = (a: number) => [[a, 0, 0], [-a, 0, 0], [a, 0, 0]] as [number, number, number][];
  const flap = winged ? [qTrack('wingL', [0, 0.35, 0.7], [[0, 0, -0.5], [0, 0, 0.5], [0, 0, -0.5]]), qTrack('wingR', [0, 0.35, 0.7], [[0, 0, 0.5], [0, 0, -0.5], [0, 0, 0.5]])] : [];
  const clips: Record<ClipName, THREE.AnimationClip> = {
    idle: new THREE.AnimationClip('idle', 2, [
      qTrack('neck', t, [[0, 0, 0], [0.08, 0.1, 0], [0, 0, 0]]),
      qTrack('tail', t, [[0, -0.3, 0], [0, 0.3, 0], [0, -0.3, 0]]),
      sTrack('hips', t, [[1, 1, 1], [1.03, 1.03, 1], [1, 1, 1]]),
      ...(winged ? [qTrack('wingL', t, [[0, 0, 0.6], [0, 0, 0.5], [0, 0, 0.6]]), qTrack('wingR', t, [[0, 0, -0.6], [0, 0, -0.5], [0, 0, -0.6]])] : []),
    ]),
    walk: new THREE.AnimationClip('walk', 0.7, [
      qTrack('legFL', [0, 0.35, 0.7], leg(0.5)),
      qTrack('legBR', [0, 0.35, 0.7], leg(0.5)),
      qTrack('legFR', [0, 0.35, 0.7], leg(-0.5)),
      qTrack('legBL', [0, 0.35, 0.7], leg(-0.5)),
      qTrack('tail', [0, 0.35, 0.7], [[0, -0.25, 0], [0, 0.25, 0], [0, -0.25, 0]]),
      pTrack('hips', [0, 0.175, 0.35, 0.525, 0.7], [[0, 0.55, 0], [0, 0.59, 0], [0, 0.55, 0], [0, 0.59, 0], [0, 0.55, 0]]),
      ...flap,
    ]),
    attack: new THREE.AnimationClip('attack', 0.8, [
      qTrack('neck', [0, 0.25, 0.4, 0.8], [[0, 0, 0], [-0.6, 0, 0], [0.7, 0, 0], [0, 0, 0]]),
      qTrack('head', [0, 0.25, 0.4, 0.8], [[0, 0, 0], [-0.3, 0, 0], [0.4, 0, 0], [0, 0, 0]]),
      pTrack('hips', [0, 0.25, 0.4, 0.8], [[0, 0.55, 0], [0, 0.6, -0.15], [0, 0.55, 0.25], [0, 0.55, 0]]),
      qTrack('legFL', [0, 0.25, 0.4, 0.8], [[0, 0, 0], [-0.8, 0, 0], [0.3, 0, 0], [0, 0, 0]]),
      qTrack('legFR', [0, 0.25, 0.4, 0.8], [[0, 0, 0], [-0.8, 0, 0], [0.3, 0, 0], [0, 0, 0]]),
    ]),
    hurt: new THREE.AnimationClip('hurt', 0.5, [
      qTrack('hips', [0, 0.12, 0.5], [[0, 0, 0], [-0.3, 0, 0.2], [0, 0, 0]]),
      qTrack('neck', [0, 0.12, 0.5], [[0, 0, 0], [-0.5, 0, 0], [0, 0, 0]]),
    ]),
    die: new THREE.AnimationClip('die', 1.2, [
      qTrack('hips', [0, 0.5, 1.2], [[0, 0, 0], [0, 0, 0.6], [0, 0, 1.45]]),
      pTrack('hips', [0, 0.5, 1.2], [[0, 0.55, 0], [0.1, 0.45, 0], [0.2, 0.25, 0]]),
      qTrack('neck', [0, 1.2], [[0, 0, 0], [0.6, 0, 0]]),
    ]),
  };
  return { root, body, clips, height: 1.0 };
}

function blob(M: ReturnType<typeof mats>, fam: CreatureFamily): Rig {
  const root = new THREE.Group();
  const body = joint(root, 'hips', 0, 0, 0);
  const core = joint(body, 'core', 0, 0, 0);
  if (fam === 'plant') {
    part(core, G.cone, M.main, 0, 0.55, 0, 0.5, 1.1, 0.5);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      part(core, G.box, M.accent, Math.cos(a) * 0.3, 0.5 + (i % 2) * 0.3, Math.sin(a) * 0.3, 0.45, 0.03, 0.18, 0, -a, 0.4);
    }
    part(core, G.sph, M.skin, 0, 1.15, 0, 0.36, 0.3, 0.36);
  } else if (fam === 'aberration') {
    part(core, G.sph, M.main, 0, 0.75, 0, 0.8, 0.75, 0.8);
    part(core, G.sph, M.eye, 0, 0.82, 0.36, 0.26, 0.26, 0.12);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const j = joint(core, 'arm' + i, Math.cos(a) * 0.3, 0.45, Math.sin(a) * 0.3);
      part(j, G.cone, M.accent, Math.cos(a) * 0.18, -0.2, Math.sin(a) * 0.18, 0.12, 0.6, 0.12, Math.sin(a) * 0.6 + Math.PI, 0, -Math.cos(a) * 0.6);
    }
  } else if (fam === 'elemental') {
    for (let i = 0; i < 5; i++) part(core, new THREE.IcosahedronGeometry(0.5, 0), M.skin, Math.sin(i * 2.3) * 0.15, 0.3 + i * 0.32, Math.cos(i * 2.3) * 0.15, 0.6 - i * 0.07, 0.4, 0.6 - i * 0.07, i, i * 0.7, 0);
    part(core, G.sph, M.eye, -0.08, 1.35, 0.18, 0.06, 0.06, 0.04);
    part(core, G.sph, M.eye, 0.08, 1.35, 0.18, 0.06, 0.06, 0.04);
  } else {
    part(core, G.sph, M.skin, 0, 0.35, 0, 0.95, 0.7, 0.95);
    part(core, G.sph, M.eye, -0.14, 0.45, 0.4, 0.08, 0.08, 0.05);
    part(core, G.sph, M.eye, 0.14, 0.45, 0.4, 0.08, 0.08, 0.05);
  }
  const t = [0, 1, 2];
  const clips: Record<ClipName, THREE.AnimationClip> = {
    idle: new THREE.AnimationClip('idle', 2, [sTrack('core', t, [[1, 1, 1], [1.06, 0.94, 1.06], [1, 1, 1]]), qTrack('core', t, [[0, -0.15, 0], [0, 0.15, 0], [0, -0.15, 0]])]),
    walk: new THREE.AnimationClip('walk', 0.6, [sTrack('core', [0, 0.3, 0.6], [[1.1, 0.9, 1.1], [0.92, 1.1, 0.92], [1.1, 0.9, 1.1]]), pTrack('hips', [0, 0.3, 0.6], [[0, 0, 0], [0, 0.08, 0], [0, 0, 0]])]),
    attack: new THREE.AnimationClip('attack', 0.8, [
      sTrack('core', [0, 0.25, 0.4, 0.8], [[1, 1, 1], [1.2, 0.75, 1.2], [0.85, 1.25, 0.85], [1, 1, 1]]),
      pTrack('hips', [0, 0.25, 0.4, 0.8], [[0, 0, 0], [0, 0, -0.1], [0, 0.1, 0.35], [0, 0, 0]]),
    ]),
    hurt: new THREE.AnimationClip('hurt', 0.5, [sTrack('core', [0, 0.12, 0.5], [[1, 1, 1], [1.25, 0.7, 1.25], [1, 1, 1]])]),
    die: new THREE.AnimationClip('die', 1.2, [sTrack('core', [0, 1.2], [[1, 1, 1], [1.6, 0.08, 1.6]])]),
  };
  return { root, body, clips, height: 1.2 };
}

/** The name, health bar and portrait floating over a figure. */
function nameplate(t: Token, def: ReturnType<typeof creatureById>) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 80;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const draw = (tok: Token & { hpLabel?: string }, current: boolean) => {
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, 256, 80);
    g.fillStyle = current ? 'rgba(80,60,10,0.85)' : 'rgba(10,10,14,0.72)';
    g.beginPath();
    g.roundRect(0, 6, 256, 68, 34);
    g.fill();
    if (current) {
      g.strokeStyle = '#ffd166';
      g.lineWidth = 4;
      g.stroke();
    }
    if (def) {
      try {
        const sp = tokenSprite(def, tok.artV ?? 0, 64, tok.color);
        g.drawImage(sp.canvas as CanvasImageSource, 8, 8, 64, 64);
      } catch {
        /* portrait is optional */
      }
    } else {
      g.fillStyle = tok.color;
      g.beginPath();
      g.arc(40, 40, 28, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#fff';
    g.font = 'bold 26px system-ui, sans-serif';
    g.fillText(tok.name.slice(0, 13), 82, 36);
    const frac = tok.maxHp > 0 ? Math.max(0, Math.min(1, tok.hp / tok.maxHp)) : 1;
    const showBar = tok.maxHp > 0 && (tok.kind === 'pc' || tok.hpLabel === undefined || tok.hpLabel === '');
    if (showBar) {
      g.fillStyle = 'rgba(255,255,255,0.18)';
      g.fillRect(82, 48, 160, 12);
      g.fillStyle = frac > 0.5 ? '#4caf50' : frac > 0.25 ? '#e9c46a' : '#e63946';
      g.fillRect(82, 48, 160 * frac, 12);
    } else if (tok.hpLabel) {
      g.fillStyle = '#ddd';
      g.font = '20px system-ui, sans-serif';
      g.fillText(tok.hpLabel, 82, 62);
    }
    tex.needsUpdate = true;
  };
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sp.scale.set(0.72, 0.225, 1);
  sp.renderOrder = 10;
  return { sprite: sp, draw };
}

export class Figure {
  group = new THREE.Group();
  mixer: THREE.AnimationMixer;
  actions = {} as Record<ClipName, THREE.AnimationAction>;
  current: ClipName = 'idle';
  plate: ReturnType<typeof nameplate>;
  ring: THREE.Mesh;
  height: number;
  scale: number;
  /** Path the figure is walking along (world x,z), and how far along. */
  path: [number, number][] = [];
  face = 0;
  dead = false;
  lastHp: number;
  private lastPlate = '';
  private materials: THREE.Material[] = [];

  constructor(public token: Token & { hpLabel?: string }, vis: VisUniforms) {
    const def = token.art ? creatureById(token.art) : undefined;
    const fam: CreatureFamily = def?.family ?? (token.kind === 'pc' ? 'hero' : 'humanoid');
    const firstHex = (o?: Record<string, string>) => Object.values(o ?? {}).find((v) => /^#[0-9a-f]{6}$/i.test(v));
    const main = def ? firstHex(def.c) ?? token.color : token.kind === 'pc' ? '#3d4a5c' : '#5a4a3a';
    const accent = token.color || FAMILY_RING[fam];
    const skin = fam === 'undead' ? '#c8cdb8' : fam === 'elemental' ? accent : fam === 'ooze' ? '#7fbf5a' : fam === 'hero' || fam === 'humanoid' ? '#d9a77c' : main;
    const M = mats(vis, main, accent, skin, fam === 'elemental' || fam === 'ooze');
    this.materials = Object.values(M);
    const plan = PLAN[fam];
    const rig = plan === 'biped' ? biped(M, fam, true) : plan === 'blob' ? blob(M, fam) : quad(M, fam, plan === 'flyer');
    // FIG: a medium creature stands about 1.2 squares (6 ft) tall against 12 ft walls
    this.scale = sizeScale(token, def?.size) * (plan === 'quad' || plan === 'flyer' ? 1.1 : 1) * FIG;
    rig.root.scale.setScalar(this.scale);
    this.group.add(rig.root);
    this.height = rig.height * this.scale;
    this.mixer = new THREE.AnimationMixer(rig.root);
    for (const k of Object.keys(rig.clips) as ClipName[]) {
      const a = this.mixer.clipAction(rig.clips[k]);
      if (k === 'attack' || k === 'hurt' || k === 'die') {
        a.setLoop(THREE.LoopOnce, 1);
        a.clampWhenFinished = true;
      }
      this.actions[k] = a;
    }
    this.actions.idle.time = Math.random() * 2;
    this.actions.idle.play();
    this.mixer.addEventListener('finished', (e) => {
      const name = (e.action as THREE.AnimationAction).getClip().name as ClipName;
      if (name !== 'die') this.play(this.path.length ? 'walk' : 'idle', 0.2);
    });
    // base ring in the token's colour, so you can tell sides apart from far off
    // a soft contact shadow so figures sit on the floor even without real shadows (phones)
    const sm = shade(new THREE.MeshBasicMaterial({ map: glowTex(), color: '#000000', transparent: true, opacity: 0.6, depthWrite: false }), vis);
    this.materials.push(sm);
    const sg = new THREE.PlaneGeometry(1.0 * Math.max(1, token.size), 1.0 * Math.max(1, token.size));
    sg.rotateX(-Math.PI / 2);
    const shadowBlob = new THREE.Mesh(sg, sm);
    shadowBlob.position.y = 0.008;
    shadowBlob.renderOrder = 1;
    this.group.add(shadowBlob);
    const rm = shade(new THREE.MeshBasicMaterial({ color: token.color || '#888', transparent: true, opacity: 0.6, depthWrite: false }), vis);
    this.materials.push(rm);
    const rg = new THREE.RingGeometry(0.36 * Math.max(1, token.size), 0.43 * Math.max(1, token.size), 32);
    rg.rotateX(-Math.PI / 2);
    this.ring = new THREE.Mesh(rg, rm);
    this.ring.position.y = 0.015;
    this.group.add(this.ring);
    this.plate = nameplate(token, def);
    this.plate.sprite.position.y = this.height + 0.28;
    this.group.add(this.plate.sprite);
    this.lastHp = token.hp;
    this.place(token);
    this.dead = token.maxHp > 0 && token.hp <= 0 && token.kind !== 'pc';
    if (this.dead) this.play('die', 0);
  }

  /** Centre of the token's squares, in world units. */
  static centre(t: Token): [number, number] {
    return [t.x + t.size / 2, t.y + t.size / 2];
  }

  place(t: Token) {
    const [x, z] = Figure.centre(t);
    this.group.position.set(x, 0, z);
  }

  play(name: ClipName, fade = 0.25) {
    if (this.dead && name !== 'die') return;
    const next = this.actions[name];
    const prev = this.actions[this.current];
    if (name === this.current && next.isRunning() && name !== 'attack' && name !== 'hurt') return;
    next.reset().setEffectiveWeight(1).play();
    if (prev !== next && fade > 0) prev.crossFadeTo(next, fade, false);
    else if (prev !== next) prev.stop();
    this.current = name;
  }

  /** Called when the server's copy of the token changes. */
  sync(t: Token & { hpLabel?: string }, current: boolean, path?: [number, number][]) {
    const key = `${t.name}|${t.hp}|${t.maxHp}|${t.hpLabel ?? ''}|${current ? 1 : 0}`;
    if (key !== this.lastPlate) {
      this.plate.draw(t, current);
      this.lastPlate = key;
    }
    if (t.hp < this.lastHp && t.hp > 0) this.play('hurt', 0.08);
    if (t.maxHp > 0 && t.hp <= 0 && !this.dead && t.kind !== 'pc') {
      this.play('die', 0.15);
      this.dead = true;
    }
    if (this.dead && t.hp > 0) {
      this.dead = false;
      this.play('idle', 0.3);
    }
    this.lastHp = t.hp;
    const moved = t.x !== this.token.x || t.y !== this.token.y;
    this.token = t;
    if (moved) {
      this.path = path && path.length ? path : [Figure.centre(t)];
      this.play('walk', 0.15);
    }
  }

  /** Turn to face a world point (for attacks). */
  lookAt(x: number, z: number) {
    this.face = Math.atan2(x - this.group.position.x, z - this.group.position.z);
  }

  update(dt: number) {
    this.mixer.update(dt);
    if (this.path.length) {
      const [tx, tz] = this.path[0];
      const p = this.group.position;
      const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
      const step = dt * 3.2;
      if (d <= step) {
        p.x = tx;
        p.z = tz;
        this.path.shift();
        if (!this.path.length) this.play('idle', 0.25);
      } else {
        p.x += (dx / d) * step;
        p.z += (dz / d) * step;
        this.face = Math.atan2(dx, dz);
      }
    }
    // ease toward the facing direction
    const r = this.group.children[0];
    let df = this.face - r.rotation.y;
    while (df > Math.PI) df -= Math.PI * 2;
    while (df < -Math.PI) df += Math.PI * 2;
    r.rotation.y += df * Math.min(1, dt * 10);
  }

  dispose() {
    this.mixer.stopAllAction();
    for (const m of this.materials) m.dispose();
    (this.plate.sprite.material as THREE.SpriteMaterial).map?.dispose();
    this.plate.sprite.material.dispose();
    this.ring.geometry.dispose();
  }
}

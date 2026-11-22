// Spell effects for the 3D view: our own procedural fire, frost, force darts, a burst with its radius on the floor,
// healing motes and a shield bubble. Everything is one point-sprite particle system (one draw call for the sparks,
// one for smoke) plus a handful of meshes that live for a second or two, so it stays cheap on phones.
import * as THREE from 'three';

type RGB = [number, number, number];
const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

import { TYPE, fxColours, fxKind, type FxKindName } from '../rules/spellLook';
export { fxColours, fxKind };

// ---------- particles ----------
const VERT = `
attribute float size; attribute float alpha; attribute vec3 color;
varying vec3 vC; varying float vA;
uniform float uScale;
void main() {
  vC = color; vA = alpha;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * uScale / max(0.05, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
varying vec3 vC; varying float vA;
uniform float uSoft;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, uSoft, r);
  gl_FragColor = vec4(vC, a * a * vA);
}`;

interface Emit {
  at: THREE.Vector3; count?: number; spread?: number; speed?: number; dir?: THREE.Vector3; up?: number;
  life?: number; lifeJitter?: number; size?: number; size2?: number; c1: RGB; c2?: RGB; grav?: number; drag?: number; alpha?: number; swirl?: number;
}
class Particles {
  max: number;
  n = 0;
  pos: Float32Array; col: Float32Array; size: Float32Array; alpha: Float32Array;
  vel: Float32Array; life: Float32Array; age: Float32Array; s0: Float32Array; s1: Float32Array; c1: Float32Array; c2: Float32Array;
  grav: Float32Array; drag: Float32Array; a0: Float32Array; swirl: Float32Array; orig: Float32Array;
  geo = new THREE.BufferGeometry();
  mat: THREE.ShaderMaterial;
  points: THREE.Points;
  constructor(max: number, blending: THREE.Blending, soft = 0) {
    this.max = max;
    const f = (k: number) => new Float32Array(max * k);
    this.pos = f(3); this.col = f(3); this.size = f(1); this.alpha = f(1);
    this.vel = f(3); this.life = f(1); this.age = f(1); this.s0 = f(1); this.s1 = f(1); this.c1 = f(3); this.c2 = f(3);
    this.grav = f(1); this.drag = f(1); this.a0 = f(1); this.swirl = f(1); this.orig = f(3);
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.geo.setDrawRange(0, 0);
    this.mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: { uScale: { value: 400 }, uSoft: { value: soft } }, transparent: true, depthWrite: false, blending });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 6;
  }
  emit(o: Emit) {
    const count = o.count ?? 1;
    for (let k = 0; k < count; k++) {
      if (this.n >= this.max) return;
      const i = this.n++;
      const sp = (o.speed ?? 1) * (0.4 + Math.random() * 0.6);
      // a random direction, leaned toward dir when given
      let x = Math.random() * 2 - 1, y = Math.random() * 2 - 1, z = Math.random() * 2 - 1;
      const l = Math.hypot(x, y, z) || 1;
      x /= l; y /= l; z /= l;
      if (o.dir) {
        const s = o.spread ?? 0.3;
        x = o.dir.x + x * s; y = o.dir.y + y * s; z = o.dir.z + z * s;
      }
      y += o.up ?? 0;
      this.vel.set([x * sp, y * sp, z * sp], i * 3);
      const j = (o.spread ?? 0) * (o.dir ? 0 : 0.15);
      this.pos.set([o.at.x + (Math.random() - 0.5) * j, o.at.y + (Math.random() - 0.5) * j, o.at.z + (Math.random() - 0.5) * j], i * 3);
      this.orig.set([o.at.x, o.at.y, o.at.z], i * 3);
      this.life[i] = (o.life ?? 0.5) * (1 + (Math.random() - 0.5) * (o.lifeJitter ?? 0.5));
      this.age[i] = 0;
      this.s0[i] = o.size ?? 0.2;
      this.s1[i] = o.size2 ?? (o.size ?? 0.2) * 0.3;
      this.c1.set(o.c1, i * 3);
      this.c2.set(o.c2 ?? o.c1, i * 3);
      this.grav[i] = o.grav ?? 0;
      this.drag[i] = o.drag ?? 0;
      this.a0[i] = o.alpha ?? 1;
      this.swirl[i] = o.swirl ?? 0;
    }
  }
  private kill(i: number) {
    const last = --this.n;
    if (i === last) return;
    const mv = (a: Float32Array, k: number) => a.copyWithin(i * k, last * k, last * k + k);
    for (const a of [this.pos, this.vel, this.c1, this.c2, this.orig]) mv(a, 3);
    for (const a of [this.life, this.age, this.s0, this.s1, this.grav, this.drag, this.a0, this.swirl]) mv(a, 1);
  }
  update(dt: number) {
    for (let i = 0; i < this.n; ) {
      this.age[i] += dt;
      const t = this.age[i] / this.life[i];
      if (t >= 1) {
        this.kill(i);
        continue;
      }
      const v = i * 3;
      const dr = Math.exp(-this.drag[i] * dt);
      this.vel[v] *= dr; this.vel[v + 1] = this.vel[v + 1] * dr + this.grav[i] * dt; this.vel[v + 2] *= dr;
      if (this.swirl[i]) {
        // turn around the emitter's vertical axis (healing motes)
        const ox = this.pos[v] - this.orig[v], oz = this.pos[v + 2] - this.orig[v + 2];
        const a = this.swirl[i] * dt, c = Math.cos(a), s = Math.sin(a);
        this.pos[v] = this.orig[v] + ox * c - oz * s;
        this.pos[v + 2] = this.orig[v + 2] + ox * s + oz * c;
      }
      this.pos[v] += this.vel[v] * dt; this.pos[v + 1] += this.vel[v + 1] * dt; this.pos[v + 2] += this.vel[v + 2] * dt;
      const ct = Math.min(1, t * 1.6);
      this.col[v] = this.c1[v] + (this.c2[v] - this.c1[v]) * ct;
      this.col[v + 1] = this.c1[v + 1] + (this.c2[v + 1] - this.c1[v + 1]) * ct;
      this.col[v + 2] = this.c1[v + 2] + (this.c2[v + 2] - this.c1[v + 2]) * ct;
      this.size[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * t;
      this.alpha[i] = this.a0[i] * (t < 0.1 ? t / 0.1 : 1 - (t - 0.1) / 0.9);
      i++;
    }
    this.geo.setDrawRange(0, this.n);
    for (const k of ['position', 'color', 'size', 'alpha']) (this.geo.getAttribute(k) as THREE.BufferAttribute).needsUpdate = true;
  }
  dispose() {
    this.geo.dispose();
    this.mat.dispose();
  }
}

// ---------- the player ----------
export interface FxTarget { id: string; chest: THREE.Vector3; feet: THREE.Vector3; size: number; hit?: boolean; saved?: boolean; crit?: boolean; heal?: boolean; darts?: number }
export interface FxCast {
  spell: string; dmgType?: string; kind: FxKindName;
  hand: THREE.Vector3; casterFeet: THREE.Vector3; casterSize: number; targets: FxTarget[]; point?: THREE.Vector3; radius?: number; blocked?: boolean;
}
type Job = (dt: number) => boolean; // false when finished

const GLOW = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, side: THREE.DoubleSide });

export class SpellFx {
  sparks = new Particles(900, THREE.AdditiveBlending, 0);
  smoke = new Particles(160, THREE.NormalBlending, 0.2);
  private jobs: Job[] = [];
  private flashes: { i: number; decay: number }[] = [];
  private auras = new Map<string, { group: THREE.Group; get: () => THREE.Vector3 | null; kind: 'shield' | 'chill'; size: number; t: number; dispose: () => void }>();
  constructor(private scene: THREE.Scene, private light: THREE.PointLight, private camera: THREE.PerspectiveCamera, private renderer: THREE.WebGLRenderer) {
    scene.add(this.sparks.points, this.smoke.points);
  }

  /** Play a cast. Returns, for each target, how many ms until its effect lands (so the pop-ups can wait for it). */
  play(c: FxCast): number[] {
    const [a, b] = fxColours(c.kind === 'heal' ? 'heal' : c.kind === 'shield' ? 'shield' : c.dmgType);
    const c1 = hex(a), c2 = hex(b);
    this.castFlare(c, c1, c2);
    switch (c.kind) {
      case 'bolt': return c.targets.map((t) => this.bolt(c.hand, t, c1, c2, c.dmgType === 'fire'));
      case 'ray': return c.targets.map((t) => this.ray(c.hand, t, c1, c2));
      case 'darts': return this.darts(c, c1, c2);
      case 'burst': return this.burst(c, c1, c2);
      case 'heal': return c.targets.map((t) => this.heal(c.hand, t, c1, c2));
      case 'shield': return [this.shieldPop(c, c1, c2)];
      case 'smite': return c.targets.map((t) => this.smite(t, c1, c2));
      default: return c.targets.map(() => 300);
    }
  }

  private run(job: Job) {
    this.jobs.push(job);
  }
  private flash(at: THREE.Vector3, col: RGB, intensity: number, distance: number, decay = 6) {
    this.light.position.copy(at);
    this.light.color.setRGB(col[0], col[1], col[2], THREE.SRGBColorSpace);
    this.light.distance = distance;
    this.light.intensity = Math.max(this.light.intensity, intensity);
    this.flashes = [{ i: this.light.intensity, decay }];
  }
  private mesh(geo: THREE.BufferGeometry, col: string | RGB, opacity: number) {
    const m = GLOW.clone();
    if (typeof col === 'string') m.color.set(col);
    else m.color.setRGB(col[0], col[1], col[2], THREE.SRGBColorSpace);
    m.opacity = opacity;
    const me = new THREE.Mesh(geo, m);
    me.renderOrder = 5;
    this.scene.add(me);
    return { me, m, dispose: () => { this.scene.remove(me); geo.dispose(); m.dispose(); } };
  }
  /** A ring that grows on the floor and fades. */
  private floorRing(at: THREE.Vector3, col: RGB, r0: number, r1: number, dur: number, opacity = 0.9, width = 0.08) {
    const g = new THREE.RingGeometry(1 - width, 1, 48);
    g.rotateX(-Math.PI / 2);
    const r = this.mesh(g, col, opacity);
    r.me.position.set(at.x, 0.04, at.z);
    let t = 0;
    this.run((dt) => {
      t += dt / dur;
      const e = 1 - (1 - Math.min(1, t)) ** 3;
      r.me.scale.setScalar(r0 + (r1 - r0) * e);
      r.m.opacity = opacity * (1 - t);
      if (t >= 1) r.dispose();
      return t < 1;
    });
  }

  /** Everyone sees the caster gather the spell: sparks swirl up from the hands and a ring opens at their feet. */
  private castFlare(c: FxCast, c1: RGB, c2: RGB) {
    this.sparks.emit({ at: c.hand, count: 22, speed: 1.1, life: 0.45, size: 0.14, size2: 0.02, c1, c2, drag: 3, up: 0.6 });
    this.floorRing(c.casterFeet, c2, 0.3 * c.casterSize, 0.75 * c.casterSize, 0.55, 0.8, 0.12);
    this.flash(c.hand, c2, 2.5, 4, 8);
  }

  // ----- a mote of fire (Fire Bolt and other spell attacks) -----
  private bolt(from: THREE.Vector3, t: FxTarget, c1: RGB, c2: RGB, fire: boolean): number {
    const end = t.hit === false ? missPoint(from, t) : t.chest.clone();
    const dist = from.distanceTo(end);
    const dur = Math.max(0.28, Math.min(0.7, dist / 13));
    const head = from.clone();
    let k = 0;
    const delay = 0.18;
    let wait = delay;
    this.run((dt) => {
      if (wait > 0) {
        wait -= dt;
        return true;
      }
      k = Math.min(1, k + dt / dur);
      head.lerpVectors(from, end, k);
      head.y += Math.sin(k * Math.PI) * Math.min(0.5, dist * 0.04);
      this.sparks.emit({ at: head, count: 3, speed: 0.15, life: 0.12, size: 0.42, size2: 0.2, c1: [1, 1, 0.92], c2: c1 });
      this.sparks.emit({ at: head, count: 4, speed: 0.5, life: 0.38, size: 0.34, size2: 0.06, c1, c2, up: 0.8, drag: 2, grav: fire ? 1.2 : 0 });
      if (Math.random() < 0.5) this.sparks.emit({ at: head, count: 1, speed: 1.2, life: 0.6, size: 0.06, c1: [1, 0.9, 0.6], c2, grav: -3 });
      this.light.position.copy(head);
      this.light.color.setRGB(c2[0], c2[1], c2[2], THREE.SRGBColorSpace);
      this.light.distance = 5;
      this.light.intensity = 4;
      if (k >= 1) {
        if (t.hit === false) this.puff(end, c2, 12);
        else this.impact(end, c1, c2, t.crit ? 1.5 : 1, fire);
        return false;
      }
      return true;
    });
    return (delay + dur) * 1000;
  }
  private impact(at: THREE.Vector3, c1: RGB, c2: RGB, scale = 1, fire = true) {
    this.sparks.emit({ at, count: Math.round(38 * scale), speed: 3.2 * scale, life: 0.5, size: 0.32 * scale, size2: 0.04, c1, c2, drag: 4, up: 0.3 });
    this.sparks.emit({ at, count: 12, speed: 3.5, life: 0.8, size: 0.07, c1: [1, 0.95, 0.8], c2, grav: -6, drag: 1 });
    if (fire) this.smoke.emit({ at, count: 6, speed: 0.6, life: 1.2, size: 0.4, size2: 1.1, c1: [0.16, 0.13, 0.12], c2: [0.08, 0.08, 0.08], up: 1, drag: 1.5, alpha: 0.5 });
    const s = this.mesh(new THREE.SphereGeometry(1, 16, 12), c1, 0.9);
    s.me.position.copy(at);
    let t = 0;
    this.run((dt) => {
      t += dt / 0.28;
      s.me.scale.setScalar((0.15 + 0.5 * Math.min(1, t)) * scale);
      s.m.opacity = 0.9 * (1 - t);
      if (t >= 1) s.dispose();
      return t < 1;
    });
    this.flash(at, c2, 9 * scale, 6, 7);
  }
  private puff(at: THREE.Vector3, col: RGB, n: number) {
    this.sparks.emit({ at, count: n, speed: 1.2, life: 0.35, size: 0.16, size2: 0.02, c1: col, c2: [0.3, 0.3, 0.3], drag: 3 });
    this.smoke.emit({ at, count: 3, speed: 0.3, life: 0.8, size: 0.3, size2: 0.7, c1: [0.2, 0.2, 0.2], c2: [0.1, 0.1, 0.1], up: 0.6, alpha: 0.35 });
  }

  // ----- a beam of frost (Ray of Frost) -----
  private ray(from: THREE.Vector3, t: FxTarget, c1: RGB, c2: RGB): number {
    const end = t.hit === false ? missPoint(from, t) : t.chest.clone();
    const len = from.distanceTo(end);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(from).normalize());
    const core = this.mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 8, 1, true), c1, 1);
    const glow = this.mesh(new THREE.CylinderGeometry(0.13, 0.13, 1, 12, 1, true), c2, 0.35);
    const spiral = this.mesh(new THREE.TorusGeometry(0.11, 0.012, 4, 10), c1, 0.8);
    const delay = 0.18, grow = 0.14, hold = 0.55, fade = 0.25;
    let t0 = 0, struck = false;
    for (const m of [core, glow]) m.me.visible = false;
    spiral.me.visible = false;
    this.run((dt) => {
      t0 += dt;
      const t1 = t0 - delay;
      if (t1 < 0) return true;
      const g = Math.min(1, t1 / grow);
      const l = len * g;
      const tip = from.clone().lerp(end, g);
      for (const m of [core, glow]) {
        m.me.visible = true;
        m.me.quaternion.copy(q);
        m.me.position.copy(from).lerp(tip, 0.5);
        m.me.scale.set(1, Math.max(0.001, l), 1);
      }
      const flick = 0.85 + Math.random() * 0.3;
      const out = t1 > grow + hold ? 1 - (t1 - grow - hold) / fade : 1;
      core.m.opacity = flick * out;
      glow.m.opacity = 0.35 * flick * out;
      glow.me.scale.x = glow.me.scale.z = 0.8 + Math.sin(t0 * 40) * 0.25;
      // rings of cold run down the beam
      spiral.me.visible = g >= 1 && out > 0;
      spiral.me.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)));
      spiral.me.position.copy(from).lerp(end, (t1 * 2.2) % 1);
      spiral.m.opacity = 0.8 * out;
      for (let i = 0; i < 3; i++) {
        const p = from.clone().lerp(tip, Math.random());
        this.sparks.emit({ at: p, count: 1, speed: 0.25, life: 0.6, size: 0.09, size2: 0.03, c1, c2, grav: -0.6, drag: 1 });
      }
      if (g >= 1 && out > 0.5) this.sparks.emit({ at: end, count: 2, speed: 1.6, life: 0.45, size: 0.1, c1: [1, 1, 1], c2, grav: -5, drag: 1 });
      this.light.position.copy(tip);
      this.light.color.setRGB(c2[0], c2[1], c2[2], THREE.SRGBColorSpace);
      this.light.distance = 6;
      this.light.intensity = Math.max(this.light.intensity, 4 * out);
      if (g >= 1 && !struck && t.hit !== false) {
        struck = true;
        // ice shards burst off the target
        this.sparks.emit({ at: end, count: 30, speed: 2.8, life: 0.8, size: 0.13, size2: 0.05, c1: [1, 1, 1], c2, grav: -7, drag: 0.8 });
        this.floorRing(t.feet, c2, 0.2, 0.9 * t.size, 0.7, 0.9, 0.2);
      }
      if (out <= 0) {
        core.dispose();
        glow.dispose();
        spiral.dispose();
        return false;
      }
      return true;
    });
    return (delay + grow) * 1000;
  }

  // ----- force darts (Magic Missile): curving, staggered, all land -----
  private darts(c: FxCast, c1: RGB, c2: RGB): number[] {
    const lands: number[] = c.targets.map(() => 0);
    let n = 0;
    c.targets.forEach((t, ti) => {
      for (let d = 0; d < (t.darts ?? 1); d++, n++) {
        const delay = 0.2 + n * 0.11;
        const dur = Math.max(0.45, Math.min(0.85, c.hand.distanceTo(t.chest) / 9));
        const side = (n % 2 ? 1 : -1) * (0.8 + Math.random() * 0.9);
        const dir = t.chest.clone().sub(c.hand);
        const perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
        const ctrl = c.hand.clone().lerp(t.chest, 0.45).addScaledVector(perp, side).add(new THREE.Vector3(0, 0.6 + Math.random() * 0.8, 0));
        // a dart that meets a Shield stops short against the bubble
        const end = t.hit === false ? t.chest.clone().addScaledVector(dir.clone().normalize(), -0.75 * t.size) : t.chest.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0));
        const curve = new THREE.QuadraticBezierCurve3(c.hand.clone(), ctrl, end);
        const head = new THREE.Vector3();
        let w = delay, k = 0;
        this.run((dt) => {
          if (w > 0) {
            w -= dt;
            return true;
          }
          k = Math.min(1, k + dt / dur);
          curve.getPoint(k * k * (3 - 2 * k) * 0.3 + k * 0.7, head);
          this.sparks.emit({ at: head, count: 2, speed: 0.05, life: 0.1, size: 0.3, size2: 0.15, c1: [1, 1, 1], c2: c1 });
          this.sparks.emit({ at: head, count: 2, speed: 0.12, life: 0.32, size: 0.17, size2: 0.02, c1, c2 });
          this.light.position.copy(head);
          this.light.color.setRGB(c2[0], c2[1], c2[2], THREE.SRGBColorSpace);
          this.light.distance = 4;
          this.light.intensity = Math.max(this.light.intensity, 2.5);
          if (k >= 1) {
            this.sparks.emit({ at: end, count: 16, speed: 2.2, life: 0.35, size: 0.16, size2: 0.02, c1, c2, drag: 4 });
            this.flash(end, c2, 5, 4, 9);
            return false;
          }
          return true;
        });
        lands[ti] = Math.max(lands[ti], (delay + dur) * 1000);
      }
    });
    return lands;
  }

  // ----- a bead that bursts (Fireball): the burst fills its radius, and the radius stays drawn on the floor a moment -----
  private burst(c: FxCast, c1: RGB, c2: RGB): number[] {
    const p = c.point ?? c.targets[0]?.feet ?? c.hand;
    const R = (c.radius ?? 20) / 5;
    const at = new THREE.Vector3(p.x, 0.6, p.z);
    const dist = c.hand.distanceTo(at);
    const delay = 0.22, dur = Math.max(0.35, Math.min(0.8, dist / 12));
    const head = new THREE.Vector3();
    let w = delay, k = 0;
    const bead = this.mesh(new THREE.SphereGeometry(0.11, 10, 8), [1, 0.95, 0.75], 1);
    bead.me.visible = false;
    this.run((dt) => {
      if (w > 0) {
        w -= dt;
        return true;
      }
      k = Math.min(1, k + dt / dur);
      head.lerpVectors(c.hand, at, k);
      head.y += Math.sin(k * Math.PI) * Math.min(1.4, dist * 0.12);
      bead.me.visible = true;
      bead.me.position.copy(head);
      this.sparks.emit({ at: head, count: 3, speed: 0.3, life: 0.3, size: 0.2, size2: 0.03, c1, c2, drag: 2 });
      this.light.position.copy(head);
      this.light.color.setRGB(c1[0], c1[1], c1[2], THREE.SRGBColorSpace);
      this.light.distance = 4;
      this.light.intensity = Math.max(this.light.intensity, 3);
      if (k >= 1) {
        bead.dispose();
        this.explode(at, R, c1, c2, c.dmgType === 'fire');
        return false;
      }
      return true;
    });
    const land = (delay + dur + 0.08) * 1000;
    return c.targets.map(() => land);
  }
  private explode(at: THREE.Vector3, R: number, c1: RGB, c2: RGB, fire: boolean) {
    const inner = this.mesh(new THREE.IcosahedronGeometry(1, 3), mix(c1, [1, 1, 1], 0.3), 1);
    const outer = this.mesh(new THREE.IcosahedronGeometry(1, 3), c2, 0.55);
    for (const m of [inner, outer]) m.me.position.copy(at);
    // the burst's edge on the floor: bright at first, then a dim line that lingers so everyone sees who was inside
    const edgeG = new THREE.RingGeometry(R - 0.07, R, 72);
    edgeG.rotateX(-Math.PI / 2);
    const edge = this.mesh(edgeG, c2, 1);
    edge.me.position.set(at.x, 0.05, at.z);
    const scorchG = new THREE.CircleGeometry(R, 48);
    scorchG.rotateX(-Math.PI / 2);
    const scM = new THREE.MeshBasicMaterial({ color: fire ? '#120804' : '#06060c', transparent: true, opacity: 0, depthWrite: false, fog: false });
    const scorch = new THREE.Mesh(scorchG, scM);
    scorch.position.set(at.x, 0.03, at.z);
    scorch.renderOrder = 4;
    this.scene.add(scorch);
    const fillG = new THREE.CircleGeometry(R, 48);
    fillG.rotateX(-Math.PI / 2);
    const fill = this.mesh(fillG, c2, 0.5);
    fill.me.position.set(at.x, 0.045, at.z);
    // the fire itself
    this.sparks.emit({ at, count: 170, speed: R * 2.4, life: 0.85, lifeJitter: 0.6, size: 0.75, size2: 0.15, c1, c2, drag: 3.2, up: 0.25 });
    this.sparks.emit({ at, count: 60, speed: R * 1.2, life: 1.2, size: 0.5, size2: 0.05, c1: [1, 1, 0.85], c2, drag: 2.4, up: 0.9 });
    this.sparks.emit({ at, count: 40, speed: R * 2, life: 1.4, size: 0.08, c1: [1, 0.9, 0.6], c2, grav: -5, drag: 1, up: 0.7 });
    // a ring of flame runs out along the floor to the edge
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      this.sparks.emit({ at: new THREE.Vector3(at.x, 0.25, at.z), count: 1, dir: new THREE.Vector3(Math.cos(a), 0.05, Math.sin(a)), spread: 0.05, speed: R * 3.4, life: 0.5, size: 0.55, size2: 0.2, c1, c2, drag: 3.4 });
    }
    if (fire) this.smoke.emit({ at, count: 34, speed: R * 0.7, life: 2.4, size: 0.9, size2: 2.4, c1: [0.18, 0.14, 0.12], c2: [0.09, 0.09, 0.1], up: 1.2, drag: 1.4, alpha: 0.55 });
    this.flash(at, c2, 30, R * 3.2, 2.6);
    let t = 0;
    this.run((dt) => {
      t += dt;
      const a = Math.min(1, t / 0.32), e = 1 - (1 - a) ** 3;
      inner.me.scale.setScalar(R * 0.55 * e + 0.1);
      outer.me.scale.setScalar(R * e + 0.1);
      inner.m.opacity = Math.max(0, 1 - t / 0.55);
      outer.m.opacity = Math.max(0, 0.55 * (1 - t / 0.75));
      fill.m.opacity = Math.max(0, 0.5 * (1 - t / 0.9));
      edge.m.opacity = t < 0.6 ? 1 : t < 3.4 ? 0.55 : Math.max(0, 0.55 * (1 - (t - 3.4) / 0.8));
      scM.opacity = Math.min(0.45, t * 2) * (t > 4 ? Math.max(0, 1 - (t - 4) / 1.5) : 1);
      if (t > 0.8 && inner.me.parent) {
        inner.dispose();
        outer.dispose();
        fill.dispose();
      }
      if (t >= 5.5) {
        edge.dispose();
        this.scene.remove(scorch);
        scorchG.dispose();
        scM.dispose();
        return false;
      }
      return true;
    });
  }

  // ----- healing: a spoken word flies to the ally, then light rises around them -----
  private heal(from: THREE.Vector3, t: FxTarget, c1: RGB, c2: RGB): number {
    const self = from.distanceTo(t.chest) < 0.6;
    const delay = 0.2, dur = self ? 0 : Math.max(0.35, Math.min(0.75, from.distanceTo(t.chest) / 10));
    const head = new THREE.Vector3();
    let w = delay, k = 0, landed = false, after = 0;
    this.run((dt) => {
      if (w > 0) {
        w -= dt;
        return true;
      }
      if (!landed) {
        k = dur ? Math.min(1, k + dt / dur) : 1;
        head.lerpVectors(from, t.chest, k);
        head.y += Math.sin(k * Math.PI) * 0.5;
        this.sparks.emit({ at: head, count: 2, speed: 0.1, life: 0.12, size: 0.3, size2: 0.12, c1: [1, 1, 0.9], c2: c1 });
        this.sparks.emit({ at: head, count: 2, speed: 0.35, life: 0.5, size: 0.09, c1, c2, drag: 2, grav: -0.5 });
        if (k >= 1) {
          landed = true;
          this.floorRing(t.feet, c2, 0.25, 0.85 * t.size, 0.8, 1, 0.14);
          this.flash(t.chest, c2, 6, 5, 3);
        }
        return true;
      }
      after += dt;
      // motes rise in a slow spiral around them
      for (let i = 0; i < 3; i++) {
        const a = Math.random() * Math.PI * 2, r = 0.38 * t.size;
        const p = new THREE.Vector3(t.feet.x + Math.cos(a) * r, 0.05 + Math.random() * 0.2, t.feet.z + Math.sin(a) * r);
        this.sparks.emit({ at: p, count: 1, dir: new THREE.Vector3(0, 1, 0), spread: 0.1, speed: 1.3, life: 0.9, size: 0.13, size2: 0.03, c1: [1, 1, 0.85], c2, swirl: 2.4 });
      }
      return after < 0.85;
    });
    return (delay + dur) * 1000;
  }

  // ----- Shield: a faceted bubble snaps up around the caster -----
  private shieldPop(c: FxCast, c1: RGB, c2: RGB): number {
    const g = this.bubble(c.casterSize, c1, c2, 1);
    g.group.position.set(c.casterFeet.x, 0, c.casterFeet.z);
    this.scene.add(g.group);
    if (c.blocked) {
      // the blow that would have landed glances off in a shower of sparks
      const at = new THREE.Vector3(c.casterFeet.x, c.hand.y, c.casterFeet.z).add(new THREE.Vector3(0.45, 0, 0.45));
      this.sparks.emit({ at, count: 40, speed: 3.4, life: 0.55, size: 0.12, size2: 0.02, c1: [1, 1, 1], c2, drag: 2.5, grav: -3 });
    }
    this.flash(c.hand, c2, 7, 5, 5);
    let t = 0;
    this.run((dt) => {
      t += dt;
      const s = t < 0.12 ? 0.55 + (t / 0.12) * 0.6 : t < 0.3 ? 1.15 - ((t - 0.12) / 0.18) * 0.15 : 1;
      g.group.scale.setScalar(s);
      g.set(t < 0.2 ? 1 : Math.max(0.25, 1 - (t - 0.2) * 1.2));
      if (t > 0.9) {
        this.scene.remove(g.group);
        g.dispose();
        return false;
      }
      return true;
    });
    return 150;
  }
  private bubble(size: number, c1: RGB, c2: RGB, k: number) {
    const R = 0.68 * Math.max(1, size);
    const geo = new THREE.IcosahedronGeometry(R, 1);
    const shell = this.mesh(geo, c2, 0.16 * k);
    this.scene.remove(shell.me);
    const edges = new THREE.EdgesGeometry(geo);
    const lm = new THREE.LineBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false });
    lm.color.setRGB(c1[0], c1[1], c1[2], THREE.SRGBColorSpace);
    const lines = new THREE.LineSegments(edges, lm);
    lines.renderOrder = 5;
    const group = new THREE.Group();
    shell.me.position.y = lines.position.y = R * 0.95;
    group.add(shell.me, lines);
    return {
      group,
      set: (o: number) => {
        shell.m.opacity = 0.16 * o;
        lm.opacity = 0.9 * o;
      },
      dispose: () => {
        shell.dispose();
        edges.dispose();
        lm.dispose();
      },
    };
  }

  // ----- a save spell on one creature (Sacred Flame and the like): light falls on them -----
  private smite(t: FxTarget, c1: RGB, c2: RGB): number {
    let w = 0.2, n = 0;
    this.run((dt) => {
      if (w > 0) {
        w -= dt;
        return true;
      }
      n += dt;
      const top = new THREE.Vector3(t.feet.x, 2.6, t.feet.z);
      this.sparks.emit({ at: top, count: 6, dir: new THREE.Vector3(0, -1, 0), spread: 0.12, speed: 7, life: 0.32, size: 0.3, size2: 0.12, c1, c2 });
      if (n > 0.3) {
        this.impact(t.chest, c1, c2, t.saved ? 0.6 : 1, false);
        return false;
      }
      return true;
    });
    return 520;
  }

  /** Lasting marks: a Shield bubble while it holds, a frost ring under a slowed creature. */
  setAuras(list: { key: string; kind: 'shield' | 'chill'; size: number; get: () => THREE.Vector3 | null }[]) {
    const want = new Set(list.map((a) => a.key));
    for (const [k, a] of this.auras)
      if (!want.has(k)) {
        a.dispose();
        this.auras.delete(k);
      }
    for (const a of list) {
      if (this.auras.has(a.key)) {
        this.auras.get(a.key)!.get = a.get;
        continue;
      }
      if (a.kind === 'shield') {
        const [x, y] = TYPE.shield;
        const b = this.bubble(a.size, hex(x), hex(y), 0.4);
        this.scene.add(b.group);
        this.auras.set(a.key, { group: b.group, get: a.get, kind: 'shield', size: a.size, t: 0, dispose: () => { this.scene.remove(b.group); b.dispose(); } });
        b.set(0.35);
      } else {
        const [x, y] = TYPE.cold;
        const g = new THREE.RingGeometry(0.3 * a.size, 0.5 * a.size, 6, 1);
        g.rotateX(-Math.PI / 2);
        const r = this.mesh(g, hex(y), 0.5);
        this.scene.remove(r.me);
        const crys = this.mesh(new THREE.OctahedronGeometry(0.05, 0), hex(x), 0.9);
        this.scene.remove(crys.me);
        const group = new THREE.Group();
        r.me.position.y = 0.05;
        group.add(r.me);
        for (let i = 0; i < 6; i++) {
          const c = crys.me.clone();
          const ang = (i / 6) * Math.PI * 2;
          c.position.set(Math.cos(ang) * 0.42 * a.size, 0.07, Math.sin(ang) * 0.42 * a.size);
          c.scale.set(1, 2.2, 1);
          group.add(c);
        }
        this.scene.add(group);
        this.auras.set(a.key, { group, get: a.get, kind: 'chill', size: a.size, t: 0, dispose: () => { this.scene.remove(group); r.dispose(); crys.dispose(); } });
      }
    }
  }

  update(dt: number) {
    const h = this.renderer.domElement.height;
    const sc = h / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2));
    this.sparks.mat.uniforms.uScale.value = sc;
    this.smoke.mat.uniforms.uScale.value = sc;
    // a job may start new jobs (an impact when a bolt lands): keep those too
    const jobs = this.jobs;
    this.jobs = [];
    const keep = jobs.filter((j) => j(dt));
    this.jobs = keep.concat(this.jobs);
    this.sparks.update(dt);
    this.smoke.update(dt);
    if (this.flashes.length) {
      const f = this.flashes[0];
      this.light.intensity *= Math.exp(-f.decay * dt);
      if (this.light.intensity < 0.05) {
        this.light.intensity = 0;
        this.flashes = [];
      }
    } else if (!this.jobs.length) this.light.intensity = 0;
    for (const a of this.auras.values()) {
      a.t += dt;
      const p = a.get();
      a.group.visible = !!p;
      if (!p) continue;
      a.group.position.set(p.x, 0, p.z);
      a.group.rotation.y = a.t * (a.kind === 'shield' ? 0.5 : -0.3);
      if (a.kind === 'shield') a.group.scale.setScalar(1 + Math.sin(a.t * 3) * 0.015);
      if (a.kind === 'chill' && Math.random() < dt * 6) this.sparks.emit({ at: new THREE.Vector3(p.x + (Math.random() - 0.5) * 0.7, 0.1, p.z + (Math.random() - 0.5) * 0.7), count: 1, dir: new THREE.Vector3(0, 1, 0), spread: 0.2, speed: 0.4, life: 1, size: 0.07, c1: [1, 1, 1], c2: hex(TYPE.cold[1]) });
    }
  }
  get busy() {
    return this.jobs.length > 0 || this.sparks.n > 0;
  }
  dispose() {
    for (const a of this.auras.values()) a.dispose();
    this.auras.clear();
    this.scene.remove(this.sparks.points, this.smoke.points);
    this.sparks.dispose();
    this.smoke.dispose();
    this.light.intensity = 0;
  }
}

/** A miss sails past: a little to the side of the target and on beyond it. */
function missPoint(from: THREE.Vector3, t: FxTarget) {
  const d = t.chest.clone().sub(from);
  const side = new THREE.Vector3(-d.z, 0, d.x).normalize().multiplyScalar(0.7 * t.size);
  return t.chest.clone().add(side).addScaledVector(d.normalize(), 1.6).setY(t.chest.y + 0.3);
}


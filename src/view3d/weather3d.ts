// Weather in the 3D view: rain streaks, snow, hail, sand, ash, embers and leaves falling in a box that follows the
// camera's focus, blown by the wind; fog that thickens the scene's fog; gloom that dims the sky light; lightning.
// One draw call for the falling things, sized by quality, and nothing at all while the weather is clear.
import * as THREE from 'three';
import { isClear, type Weather } from '../engine/weather';

const BOX = 16, TOP = 7;
const WIND = [0, 1.2, 3.5, 7];
const FOG_MUL = [1, 1.8, 3.2, 5.5];
const GLOOM_MUL = [1, 0.75, 0.5, 0.28];

interface Look { n: number; fall: [number, number]; len: number; size: number; col: string; streak: boolean; up?: boolean; add?: boolean }
const LOOK: Record<string, Look> = {
  drizzle: { n: 500, fall: [7, 9], len: 0.25, size: 0.03, col: '#b8cce4', streak: true },
  rain: { n: 1400, fall: [11, 14], len: 0.45, size: 0.03, col: '#a9c3e6', streak: true },
  storm: { n: 2000, fall: [13, 17], len: 0.6, size: 0.03, col: '#b4c8ea', streak: true },
  hail: { n: 700, fall: [9, 11], len: 0, size: 0.07, col: '#f2f6ff', streak: false },
  snow: { n: 1100, fall: [0.6, 1.2], len: 0, size: 0.07, col: '#ffffff', streak: false },
  blizzard: { n: 2200, fall: [1.5, 2.5], len: 0, size: 0.06, col: '#ffffff', streak: false },
  sand: { n: 1600, fall: [0.2, 0.6], len: 0.3, size: 0.04, col: '#d8b46a', streak: true },
  ash: { n: 900, fall: [0.3, 0.7], len: 0, size: 0.06, col: '#8f8a84', streak: false },
  embers: { n: 400, fall: [0.4, 1.0], len: 0, size: 0.07, col: '#ff8a2a', streak: false, up: true, add: true },
  leaves: { n: 220, fall: [0.6, 1.1], len: 0, size: 0.12, col: '#c8742a', streak: false },
};

function dotTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class Weather3D {
  w?: Weather;
  private obj?: THREE.Points | THREE.LineSegments;
  private vel = new Float32Array(0);
  private look?: Look;
  private flash = 0;
  private nextBolt = 0;
  private tex?: THREE.Texture;
  constructor(private scene: THREE.Scene, private scale = 1) {}

  private key = '';
  set(w: Weather | undefined, quality: 'low' | 'medium' | 'high') {
    const key = JSON.stringify(w ?? null) + quality;
    if (key === this.key) return;
    this.key = key;
    this.w = w && !isClear(w) ? w : undefined;
    this.clear();
    if (!this.w) return;
    const L = LOOK[this.w.precip];
    if (!L) return;
    this.look = L;
    const n = Math.round(L.n * (quality === 'low' ? 0.35 : quality === 'medium' ? 0.65 : 1) * this.scale);
    this.vel = new Float32Array(n);
    const verts = L.streak ? 2 : 1;
    const pos = new Float32Array(n * 3 * verts);
    for (let i = 0; i < n; i++) {
      this.vel[i] = L.fall[0] + Math.random() * (L.fall[1] - L.fall[0]);
      const x = (Math.random() - 0.5) * BOX, y = Math.random() * TOP, z = (Math.random() - 0.5) * BOX;
      for (let v = 0; v < verts; v++) pos.set([x, y + v * L.len, z], (i * verts + v) * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    if (L.streak) {
      const m = new THREE.LineBasicMaterial({ color: L.col, transparent: true, opacity: this.w.precip === 'sand' ? 0.5 : 0.42, depthWrite: false, fog: true });
      this.obj = new THREE.LineSegments(geo, m);
    } else {
      this.tex ??= dotTex();
      const m = new THREE.PointsMaterial({ size: L.size, map: this.tex, color: L.col, transparent: true, opacity: 0.9, depthWrite: false, sizeAttenuation: true, blending: L.add ? THREE.AdditiveBlending : THREE.NormalBlending });
      if (this.w.precip === 'leaves') m.vertexColors = true;
      if (this.w.precip === 'leaves') {
        const cols = new Float32Array(n * 3), pal = ['#c8742a', '#b84a22', '#d9a23a', '#8a5a2a'].map((h) => new THREE.Color(h));
        for (let i = 0; i < n; i++) pal[i % pal.length].toArray(cols, i * 3);
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
        m.color.set('#ffffff');
      }
      this.obj = new THREE.Points(geo, m);
    }
    this.obj.frustumCulled = false;
    this.obj.renderOrder = 5;
    this.scene.add(this.obj);
  }

  /** Multipliers for the scene's fog density and sky light, and a lightning flash 0..1. */
  get fogMul() { return this.w ? FOG_MUL[this.w.fog] * (this.w.precip === 'sand' || this.w.precip === 'blizzard' ? 1.5 : 1) : 1; }
  get skyMul() { return this.w ? GLOOM_MUL[this.w.gloom] : 1; }
  get fogColor(): string | undefined {
    if (!this.w || (!this.w.fog && !['sand', 'ash', 'blizzard'].includes(this.w.precip))) return undefined;
    return this.w.precip === 'sand' ? '#c9a868' : this.w.precip === 'ash' ? '#5e5852' : this.w.precip === 'embers' ? '#4a3026' : this.w.gloom >= 2 ? '#4a5058' : '#9aa2aa';
  }

  step(dt: number, focus: THREE.Vector3, time: number): number {
    const w = this.w;
    if (!w) return 0;
    if (w.lightning) {
      if (!this.nextBolt) this.nextBolt = time + 3 + Math.random() * 5;
      if (time > this.nextBolt) { this.flash = 1; this.nextBolt = time + 4 + Math.random() * 7; }
      this.flash = Math.max(0, this.flash - dt * 3);
    }
    const L = this.look, o = this.obj;
    if (L && o) {
      const a = o.geometry.attributes.position as THREE.BufferAttribute;
      const arr = a.array as Float32Array;
      const verts = L.streak ? 2 : 1;
      const wind = WIND[w.wind] * (w.precip === 'sand' ? 1.6 : 1);
      const n = this.vel.length;
      for (let i = 0; i < n; i++) {
        const b = i * verts * 3;
        const sway = L.streak ? 0 : Math.sin(time * 1.3 + i) * 0.4;
        const vx = wind + sway, vy = L.up ? this.vel[i] : -this.vel[i];
        let x = arr[b] + vx * dt, y = arr[b + 1] + vy * dt, z = arr[b + 2] + Math.cos(time * 0.9 + i * 1.7) * 0.15 * dt;
        const dx = x - focus.x, dz = z - focus.z;
        if (dx > BOX / 2) x -= BOX; else if (dx < -BOX / 2) x += BOX;
        if (dz > BOX / 2) z -= BOX; else if (dz < -BOX / 2) z += BOX;
        if (y < 0) { y += TOP; x = focus.x + (Math.random() - 0.5) * BOX; z = focus.z + (Math.random() - 0.5) * BOX; }
        if (y > TOP) y -= TOP;
        arr[b] = x; arr[b + 1] = y; arr[b + 2] = z;
        if (verts === 2) {
          // the streak's tail points back along its motion, so wind slants the rain
          const sp = Math.hypot(vx, vy) || 1;
          arr[b + 3] = x - (vx / sp) * L.len; arr[b + 4] = y - (vy / sp) * L.len; arr[b + 5] = z;
        }
      }
      a.needsUpdate = true;
    }
    return this.flash > 0.55 && this.flash < 0.7 ? this.flash * 0.3 : this.flash;
  }

  private clear() {
    if (!this.obj) return;
    this.scene.remove(this.obj);
    this.obj.geometry.dispose();
    (this.obj.material as THREE.Material).dispose();
    this.obj = undefined;
    this.look = undefined;
  }
  dispose() {
    this.clear();
    this.tex?.dispose();
  }
}

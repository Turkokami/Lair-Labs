// The 3D view's engine: renderer, quality presets, the moving light pool, fog of war and the frame loop.
// Modelled on how the Alienmon 3D game keeps phones fast (capped pixel ratio, a small pool of point lights handed to the
// nearest flames each frame, shadows only on High and redrawn every few frames, fog to hide the far end), but this is
// Lair Labs' own code and shares nothing with that project.
import * as THREE from 'three';
import type { GameMap } from '../engine/map';
import { makeVisUniforms, type VisUniforms } from './shaders';
import { kitMaterials, type Bin } from './kit';
import { buildDungeon, poseDoor, WALL_H, type Built } from './dungeon';
import { dungeonEnv, glowTex, setTextureDetail } from './textures';
import type { LightSpot } from './props3d';

export type Quality = 'low' | 'medium' | 'high';
export const QUALITY: Record<Quality, { pixelRatio: number; lights: number; shadows: boolean; antialias: boolean; fogFar: number }> = {
  low: { pixelRatio: 1, lights: 4, shadows: false, antialias: false, fogFar: 0.09 },
  medium: { pixelRatio: 1.5, lights: 8, shadows: false, antialias: true, fogFar: 0.06 },
  high: { pixelRatio: 2, lights: 14, shadows: true, antialias: true, fogFar: 0.045 },
};

/** A guess at a good start: phones and small screens get Low or Medium. */
export function defaultQuality(): Quality {
  const saved = (() => {
    try {
      return localStorage.getItem('ll3d-quality') as Quality | null;
    } catch {
      return null;
    }
  })();
  if (saved && QUALITY[saved]) return saved;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const cores = navigator.hardwareConcurrency ?? 4;
  return small ? (cores >= 8 ? 'medium' : 'low') : 'high';
}

const AMBIENT: Record<string, { sky: string; ground: string; amb: number; fog: string }> = {
  bright: { sky: '#d8d2c4', ground: '#5a5048', amb: 1.4, fog: '#3a3530' },
  dim: { sky: '#6a6a80', ground: '#3e362e', amb: 0.55, fog: '#121014' },
  dark: { sky: '#3a3a52', ground: '#1e1a16', amb: 0.22, fog: '#060508' },
};

export class Engine3D {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, 1, 0.05, 80);
  vis: VisUniforms = makeVisUniforms();
  kitMats: Record<Bin, THREE.Material>;
  built?: Built;
  quality: Quality;
  pool: THREE.PointLight[] = [];
  carried = new THREE.PointLight('#ffcf8a', 0, 9, 1.6);
  hemi = new THREE.HemisphereLight('#888', '#222', 0.5);
  sun = new THREE.DirectionalLight('#fff4e0', 0);
  clock = new THREE.Clock();
  frame = 0;
  onFrame?: (dt: number) => void;
  private raf = 0;
  private lightTimer = 0;
  private assigned: (LightSpot | null)[] = [];
  private outdoor = false;
  private base = { amb: 0.5, fog: 0.07, sky: '#888', ground: '#222' };
  private work = false;
  private far = false;

  constructor(public host: HTMLElement, quality: Quality) {
    this.quality = quality;
    const Q = QUALITY[quality];
    this.renderer = new THREE.WebGLRenderer({ antialias: Q.antialias, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.pixelRatio));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = Q.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.touchAction = 'none';
    host.appendChild(this.renderer.domElement);
    setTextureDetail(quality);
    this.kitMats = kitMaterials(this.vis);
    this.scene.environment = dungeonEnv();
    this.scene.add(this.hemi, this.sun, this.sun.target, this.carried);
    for (let i = 0; i < Q.lights; i++) {
      const l = new THREE.PointLight('#ffffff', 0, 8, 1.6);
      if (Q.shadows && i === 0) {
        l.castShadow = true;
        l.shadow.mapSize.set(512, 512);
        l.shadow.bias = -0.004;
        l.shadow.camera.near = 0.1;
        l.shadow.camera.far = 12;
      }
      this.pool.push(l);
      this.scene.add(l);
    }
    this.resize();
  }

  setMap(m: GameMap, role: 'gm' | 'player') {
    if (this.built) {
      this.scene.remove(this.built.root);
      this.built.dispose();
    }
    this.built = buildDungeon(m, this.vis, this.kitMats, { quality: this.quality, role, onTexture: () => (this.renderer.shadowMap.needsUpdate = true) });
    this.scene.add(this.built.root);
    const a = AMBIENT[m.ambient ?? 'dim'] ?? AMBIENT.dim;
    // outdoor maps (mostly grass, dirt, sand) get daylight instead of a ceiling glow
    let outside = 0, floors = 0;
    for (let i = 0; i < m.cells.length; i++) {
      if (m.cells[i] <= 0) continue;
      floors++;
      if (['grass', 'dirt', 'sand', 'mud', 'ice'].includes(m.mats?.[i] ?? '')) outside++;
    }
    this.outdoor = floors > 0 && outside / floors > 0.5;
    this.hemi.color.set(a.sky);
    this.hemi.groundColor.set(a.ground);
    this.hemi.intensity = a.amb;
    this.sun.intensity = this.outdoor && m.ambient !== 'dark' ? 1.6 : m.ambient === 'bright' ? 0.5 : 0;
    this.sun.position.set(m.cols * 0.3, 14, m.rows * 0.2);
    this.sun.target.position.set(m.cols / 2, 0, m.rows / 2);
    this.scene.background = new THREE.Color(this.outdoor ? '#8fb3d0' : a.fog);
    this.scene.fog = new THREE.FogExp2(this.outdoor ? '#a9c0d0' : a.fog, this.outdoor ? 0.02 : QUALITY[this.quality].fogFar);
    this.base = { amb: a.amb, fog: (this.scene.fog as THREE.FogExp2).density, sky: a.sky, ground: a.ground };
    this.applyLook();
    this.vis.uVisSize.value.set(m.cols, m.rows);
    this.assigned = [];
    this.renderer.shadowMap.needsUpdate = true;
  }

  /**
   * Fog of war. For players: squares seen now are full brightness (dimmed in dim light), squares seen before stay
   * faintly visible, the rest are black. Rock squares take the brightness of the floor beside them so walls show.
   * For the GM (seeAll), everything shows, with squares the players haven't found shaded a little.
   */
  setVision(m: GameMap, o: { visible?: number[]; lit?: string; revealed?: number[]; seeAll?: boolean; gmShade?: boolean }) {
    const W = m.cols, H = m.rows;
    const v = new Float32Array(W * H);
    if (o.seeAll) {
      const rev = new Set(o.revealed ?? []);
      for (let i = 0; i < W * H; i++) v[i] = o.gmShade && rev.size && !rev.has(i) ? 0.55 : 1;
    } else {
      const rev = o.revealed ?? [];
      for (const i of rev) v[i] = 0.28;
      if (o.visible) for (const i of o.visible) v[i] = o.lit ? (o.lit[i] === '2' ? 1 : o.lit[i] === '1' ? 0.72 : 0.5) : 1;
      else for (const i of rev) v[i] = 1;
    }
    // rock squares borrow from their brightest floor neighbour so wall faces light up with the room
    const out = new Uint8Array(W * H * 4);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        let b = v[i];
        if (m.cells[i] <= 0)
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
              const j = ny * W + nx;
              if (m.cells[j] > 0) b = Math.max(b, v[j]);
            }
        const g = Math.round(b * 255);
        out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = g;
        out[i * 4 + 3] = 255;
      }
    const old = this.vis.uVis.value;
    const t = new THREE.DataTexture(out, W, H, THREE.RGBAFormat);
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearFilter;
    t.flipY = false;
    t.needsUpdate = true;
    this.vis.uVis.value = t;
    this.vis.uVisOn.value = 1;
    old.dispose();
    this.renderer.shadowMap.needsUpdate = true;
  }

  setQuality(q: Quality) {
    try {
      localStorage.setItem('ll3d-quality', q);
    } catch {
      /* private mode */
    }
  }

  resize() {
    const w = Math.max(1, this.host.clientWidth), h = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Hand the light pool to the light spots nearest the camera (re-sorted a few times a second). */
  private assignLights(dt: number, focus: THREE.Vector3) {
    const spots = this.built?.lights ?? [];
    this.lightTimer -= dt;
    if (this.lightTimer <= 0 || this.assigned.length === 0) {
      this.lightTimer = 0.3;
      const sorted = spots
        .map((s) => ({ s, d: (s.x - focus.x) ** 2 + (s.z - focus.z) ** 2 }))
        .sort((a, b) => a.d - b.d)
        .slice(0, this.pool.length)
        .map((o) => o.s);
      this.assigned = this.pool.map((_, i) => sorted[i] ?? null);
      const L0 = this.assigned[0];
      if (L0) this.renderer.shadowMap.needsUpdate = true;
      void L0;
    }
    const t = this.clock.elapsedTime;
    this.pool.forEach((l, i) => {
      const s = this.assigned[i];
      if (!s) {
        l.intensity = 0;
        return;
      }
      l.position.set(s.x, s.y, s.z);
      l.color.set(s.color);
      l.distance = Math.max(6, s.range * 1.45); // reach up the tall walls to the ceiling
      const flick = s.flame ? 0.86 + 0.14 * Math.sin(t * 11 + i * 1.7) * Math.sin(t * 7.3 + i) : 1;
      // fade lights in by distance so they don't pop when the pool is re-sorted
      const d = Math.hypot(s.x - focus.x, s.z - focus.z);
      const fade = Math.max(0, Math.min(1, (24 - d) / 6));
      l.intensity = s.intensity * flick * fade * (this.outdoor ? 0.7 : 1) * 1.6;
    });
  }

  /** Doors ease toward open or shut. */
  setDoors(m: GameMap) {
    if (!this.built) return;
    for (const [k, d] of this.built.doors) {
      d.target = m.doors[k] === 'open' ? 1 : 0;
    }
  }

  start(getFocus: () => THREE.Vector3, carried: () => { x: number; z: number; range: number } | null) {
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, this.clock.getDelta());
      this.vis.uTime.value = this.clock.elapsedTime;
      this.frame++;
      this.onFrame?.(dt);
      const focus = getFocus();
      this.assignLights(dt, focus);
      const c = carried();
      if (c) {
        this.carried.position.set(c.x, 1.25, c.z);
        this.carried.distance = Math.max(5, c.range * 1.2);
        this.carried.intensity = 2.2 * (0.92 + 0.08 * Math.sin(this.clock.elapsedTime * 9));
      } else this.carried.intensity = 0;
      if (this.built) {
        for (const d of this.built.doors.values()) {
          if (Math.abs(d.t - d.target) > 0.001) {
            d.t += Math.sign(d.target - d.t) * Math.min(Math.abs(d.target - d.t), dt * 2.2);
            poseDoor(d);
            this.renderer.shadowMap.needsUpdate = true;
          }
        }
        for (const w of this.built.water) {
          const m = w.material as THREE.MeshStandardMaterial;
          if (m.normalMap) m.normalMap.offset.set(this.clock.elapsedTime * 0.02, this.clock.elapsedTime * 0.013);
        }
      }
      this.driftDust(dt, focus);
      if (QUALITY[this.quality].shadows && this.frame % 4 === 0) this.renderer.shadowMap.needsUpdate = true;
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  /** Dust hanging in the torchlight around the camera's focus: cheap, and it makes the air feel thick. */
  private dust?: THREE.Points;
  private driftDust(dt: number, f: THREE.Vector3) {
    if (this.quality === 'low' || this.outdoor) return;
    const N = 180, B = 7;
    if (!this.dust) {
      const g = new THREE.BufferGeometry();
      const p = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        p[i * 3] = (Math.random() - 0.5) * B;
        p[i * 3 + 1] = Math.random() * 2.2 + 0.1;
        p[i * 3 + 2] = (Math.random() - 0.5) * B;
      }
      g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      const m = new THREE.PointsMaterial({ size: 0.03, map: glowTex(), color: '#ffd9a0', transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending });
      this.dust = new THREE.Points(g, m);
      this.dust.frustumCulled = false;
      this.scene.add(this.dust);
    }
    const a = this.dust.geometry.attributes.position as THREE.BufferAttribute;
    const t = this.clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      let x = a.getX(i) + Math.sin(t * 0.3 + i) * dt * 0.05, y = a.getY(i) + Math.sin(t * 0.21 + i * 1.7) * dt * 0.04 - dt * 0.01, z = a.getZ(i) + Math.cos(t * 0.27 + i) * dt * 0.05;
      // keep the cloud centred on the focus by wrapping
      const dx = x - f.x, dz = z - f.z;
      if (dx > B / 2) x -= B; else if (dx < -B / 2) x += B;
      if (dz > B / 2) z -= B; else if (dz < -B / 2) z += B;
      if (y < 0.05) y = 2.3;
      a.setXYZ(i, x, y, z);
    }
    a.needsUpdate = true;
  }

  /** GM work light: the whole map lit evenly, like the overhead view. Far: thinner fog for the table camera. */
  setLook(work: boolean, far: boolean) {
    this.work = work;
    this.far = far;
    this.applyLook();
  }
  private applyLook() {
    this.hemi.intensity = this.work ? Math.max(this.base.amb, 1.5) : this.base.amb;
    const lit = this.work && !this.outdoor;
    this.hemi.color.set(lit ? '#e8e0d0' : this.base.sky);
    this.hemi.groundColor.set(lit ? '#6a6058' : this.base.ground);
    const f = this.scene.fog as THREE.FogExp2 | null;
    if (f) f.density = this.base.fog * (this.far ? 0.25 : 1) * (this.work ? 0.6 : 1);
  }

  showCeiling(on: boolean) {
    if (this.built) this.built.ceiling.visible = on;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.built?.dispose();
    for (const m of Object.values(this.kitMats)) m.dispose();
    this.vis.uVis.value.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

export { WALL_H };

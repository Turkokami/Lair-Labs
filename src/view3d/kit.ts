// The Lair Labs build kit: a separate copy of the same way of building the 3D Alienmon worlds use, written for the dungeon grid.
// Pieces (boxes, cylinders, spheres, beams, rings, sagging ropes) are pushed into a handful of bins by surface
// (stone, painted solid, wood, iron, cloth, small decoration, glow). flush() merges every bin into one vertex-coloured
// mesh per square chunk of the map, so a whole dungeon of furniture costs a few dozen draw calls on a phone.
// Colour is painted per vertex with soft noise, and darkened toward the floor, so pieces read as aged and grounded.
import * as THREE from 'three';
import { shade, type VisUniforms } from './shaders';
import { gritTex, woodTex, clothTex, ironTex, stoneBlockTex, caveRockTex, dungeonEnv } from './textures';

export type Bin = 'stone' | 'cave' | 'lit' | 'wood' | 'metal' | 'fabric' | 'deco' | 'glow';
export const BINS: Bin[] = ['stone', 'cave', 'lit', 'wood', 'metal', 'fabric', 'deco', 'glow'];
const SOLID = new Set<Bin>(['stone', 'cave', 'lit', 'wood', 'metal']);

const TAU = Math.PI * 2;
const h3 = (x: number, y: number, z: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
export const vn3 = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), f = (t: number) => t * t * (3 - 2 * t), u = f(x - xi), v = f(y - yi), w = f(z - zi);
  const L = (a: number, b: number, t: number) => a + (b - a) * t;
  return L(
    L(L(h3(xi, yi, zi), h3(xi + 1, yi, zi), u), L(h3(xi, yi + 1, zi), h3(xi + 1, yi + 1, zi), u), v),
    L(L(h3(xi, yi, zi + 1), h3(xi + 1, yi, zi + 1), u), L(h3(xi, yi + 1, zi + 1), h3(xi + 1, yi + 1, zi + 1), u), v),
    w,
  );
};
/** Seeded random numbers (same generator the kit uses). */
export const rng = (s: number) => () => {
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ---- unit shapes, never indexed, so they merge by copying ----
const GEO = new Map<string, THREE.BufferGeometry>();
export type GeoKey = 'box' | 'cyl' | 'cyl6' | 'cyl16' | 'cone' | 'sph' | 'hemi' | 'ico' | 'ring' | 'oct' | 'pyr' | 'flat' | 'disc' | 'tube' | 'torus';
function geo(k: GeoKey): THREE.BufferGeometry {
  let g = GEO.get(k);
  if (g) return g;
  switch (k) {
    case 'box': g = new THREE.BoxGeometry(1, 1, 1); break;
    case 'cyl': g = new THREE.CylinderGeometry(0.5, 0.5, 1, 10); break;
    case 'cyl6': g = new THREE.CylinderGeometry(0.5, 0.5, 1, 6); break;
    case 'cyl16': g = new THREE.CylinderGeometry(0.5, 0.5, 1, 16); break;
    case 'cone': g = new THREE.ConeGeometry(0.5, 1, 10); break;
    case 'sph': g = new THREE.SphereGeometry(0.5, 10, 7); break;
    case 'hemi': g = new THREE.SphereGeometry(0.5, 12, 5, 0, TAU, 0, Math.PI / 2); break;
    case 'ico': {
      g = new THREE.IcosahedronGeometry(0.5, 1);
      const P = g.attributes.position, d = new THREE.Vector3();
      for (let i = 0; i < P.count; i++) {
        d.fromBufferAttribute(P, i);
        const w = 1 + 0.22 * (h3(Math.round(d.x * 50), Math.round(d.y * 50), Math.round(d.z * 50)) - 0.5);
        P.setXYZ(i, d.x * w, d.y * w, d.z * w);
      }
      g.computeVertexNormals();
      break;
    }
    case 'ring': g = new THREE.TorusGeometry(0.5, 0.05, 4, 24); g.rotateX(Math.PI / 2); break;
    case 'torus': g = new THREE.TorusGeometry(0.5, 0.12, 6, 20); g.rotateX(Math.PI / 2); break;
    case 'oct': g = new THREE.OctahedronGeometry(0.5, 0); break;
    case 'pyr': g = new THREE.ConeGeometry(0.5, 1, 4); break;
    case 'flat': g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); break;
    case 'disc': g = new THREE.CircleGeometry(0.5, 12); g.rotateX(-Math.PI / 2); break;
    case 'tube': g = new THREE.CylinderGeometry(0.5, 0.5, 1, 8, 1, true); break;
  }
  g = g!.index ? g!.toNonIndexed() : g!;
  GEO.set(k, g);
  return g;
}

/** Where a group of pieces hangs off: a spot on the floor (x, z in world units) turned by ry radians. */
export interface Spot { x: number; z: number; ry?: number; y?: number }
type Item = { gk: GeoKey; wx: number; wy: number; wz: number; rx: number; ry: number; rz: number; sx: number; sy: number; sz: number; col: string; floorY: number | null };

export interface KitMaterials { [b: string]: THREE.Material }

/** Materials for the kit, made once per 3D view (they carry that view's fog-of-war uniforms). */
export function kitMaterials(vis: VisUniforms, cave = false): Record<Bin, THREE.Material> {
  const env = dungeonEnv();
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0, ...p });
  const g = gritTex(), w = woodTex(), c = clothTex(), ir = ironTex(), sb = stoneBlockTex(), cr = caveRockTex();
  return {
    stone: shade(std({ map: sb.map, normalMap: sb.normal, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 0.88 }), vis, { tri: 0.5, rv: 0.25 }),
    cave: shade(std({ map: cr.map, normalMap: cr.normal, normalScale: new THREE.Vector2(1.4, 1.4), roughness: 0.92 }), vis, { tri: 0.33, rv: 0.3 }),
    lit: shade(std({ map: g.map, normalMap: g.normal, normalScale: new THREE.Vector2(0.8, 0.8), roughness: 0.78 }), vis, { tri: 1.4, rv: 0.4 }),
    wood: shade(std({ map: w.map, normalMap: w.normal, normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.74, envMap: env, envMapIntensity: 0.3 }), vis, { tri: 1.1, rv: 0.25 }),
    metal: shade(std({ map: ir.map, normalMap: ir.normal, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.42, metalness: 0.55, envMap: env, envMapIntensity: 1.1 }), vis, { tri: 1.6, rv: 0.3 }),
    fabric: shade(std({ map: c.map, normalMap: c.normal, normalScale: new THREE.Vector2(0.8, 0.8), roughness: 0.92, side: THREE.DoubleSide }), vis, { tri: 3, rv: 0.1 }),
    deco: shade(std({ map: g.map, roughness: 0.7 }), vis, { tri: 2, rv: 0.3 }),
    glow: shade(new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(1.8, 1.8, 1.8), toneMapped: false }), vis, { flicker: true }),
  } as Record<Bin, THREE.Material>;
  void cave;
}

export class Kit {
  private bins = new Map<Bin, Item[]>();
  constructor(public chunk = 12) {
    for (const b of BINS) this.bins.set(b, []);
  }

  /** One piece: a unit shape at local lx,ly,lz on spot O, scaled sx,sy,sz and turned rx,ry,rz. */
  P(bin: Bin, O: Spot | null, gk: GeoKey, lx: number, ly: number, lz: number, sx: number, sy: number, sz: number, col: string, rx = 0, ry = 0, rz = 0) {
    const yaw = O?.ry ?? 0;
    let wx = lx, wz = lz;
    if (yaw) {
      const c = Math.cos(yaw), s = Math.sin(yaw);
      wx = lx * c + lz * s;
      wz = -lx * s + lz * c;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw));
      const e = new THREE.Euler().setFromQuaternion(q, 'XYZ');
      rx = e.x; ry = e.y; rz = e.z;
    }
    const bx = O?.x ?? 0, by = O?.y ?? 0, bz = O?.z ?? 0;
    this.bins.get(bin)!.push({ gk, wx: bx + wx, wy: by + ly, wz: bz + wz, rx, ry, rz, sx, sy, sz, col, floorY: O ? by : null });
  }
  /** A box standing on y0. */
  B(bin: Bin, O: Spot | null, x: number, y0: number, z: number, w: number, h: number, d: number, col: string, rx = 0, ry = 0, rz = 0) {
    this.P(bin, O, 'box', x, y0 + h / 2, z, w, h, d, col, rx, ry, rz);
  }
  /** A cylinder standing on y0. */
  C(bin: Bin, O: Spot | null, x: number, y0: number, z: number, r: number, h: number, col: string, gk: GeoKey = 'cyl') {
    this.P(bin, O, gk, x, y0 + h / 2, z, r * 2, h, r * 2, col);
  }
  /** A sphere (or ico rock, hemisphere) centred at x,y,z. */
  S(bin: Bin, O: Spot | null, x: number, y: number, z: number, r: number, col: string, gk: GeoKey = 'sph') {
    this.P(bin, O, gk, x, y, z, r * 2, r * 2, r * 2, col);
  }
  /** A round beam from a to b (local points). */
  Beam(bin: Bin, O: Spot | null, a: number[], b: number[], r: number, col: string, gk: GeoKey = 'cyl') {
    const v = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const L = v.length();
    if (L < 1e-4) return;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
    const e = new THREE.Euler().setFromQuaternion(q, 'XYZ');
    this.P(bin, O, gk, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, r * 2, L, r * 2, col, e.x, e.y, e.z);
  }
  /** A flat ring lying level. */
  Ring(bin: Bin, O: Spot | null, x: number, y: number, z: number, r: number, tube: number, col: string) {
    this.P(bin, O, 'ring', x, y, z, r * 2, tube / 0.1, r * 2, col);
  }
  /** A sagging line (rope, chain, vine) from a to b in n straight pieces. */
  Sag(bin: Bin, O: Spot | null, a: number[], b: number[], sag: number, r: number, col: string, n = 6) {
    let p = a;
    for (let i = 1; i <= n; i++) {
      const t = i / n, q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * sag, a[2] + (b[2] - a[2]) * t];
      this.Beam(bin, O, p, q, r, col, 'cyl6');
      p = q;
    }
  }

  count() {
    let n = 0;
    for (const b of BINS) for (const it of this.bins.get(b)!) n += geo(it.gk).attributes.position.count;
    return n;
  }

  /** Merge everything into chunked meshes under root. Solid ones are tagged for the camera's bump test. */
  flush(root: THREE.Object3D, mats: Record<Bin, THREE.Material>, shadows: boolean): THREE.Mesh[] {
    const made: THREE.Mesh[] = [];
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), v = new THREE.Vector3(), n3 = new THREE.Matrix3(), cc = new THREE.Color();
    for (const bin of BINS) {
      const all = this.bins.get(bin)!;
      if (!all.length) continue;
      const chunks = new Map<string, Item[]>();
      for (const it of all) {
        const key = Math.floor(it.wx / this.chunk) + ',' + Math.floor(it.wz / this.chunk);
        let a = chunks.get(key);
        if (!a) chunks.set(key, (a = []));
        a.push(it);
      }
      for (const L0 of chunks.values()) {
        let nv = 0;
        for (const it of L0) nv += geo(it.gk).attributes.position.count;
        const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), C = new Float32Array(nv * 3);
        let o = 0;
        for (const it of L0) {
          m4.compose(v.set(it.wx, it.wy, it.wz), q.setFromEuler(e.set(it.rx, it.ry, it.rz)), s.set(it.sx, it.sy, it.sz));
          n3.getNormalMatrix(m4);
          cc.set(it.col);
          const paint = bin !== 'glow';
          if (paint) {
            const j = h3(it.wx, it.wy, it.wz);
            cc.offsetHSL((j - 0.5) * 0.02, 0, (j - 0.5) * 0.06);
          }
          const g = geo(it.gk), gp = g.attributes.position, gn = g.attributes.normal;
          for (let i = 0; i < gp.count; i++, o++) {
            v.fromBufferAttribute(gp, i).applyMatrix4(m4);
            P[o * 3] = v.x; P[o * 3 + 1] = v.y; P[o * 3 + 2] = v.z;
            let k = 1;
            if (paint) {
              k = 0.9 + 0.2 * vn3(v.x * 0.9, v.y * 0.9 + 5, v.z * 0.9) + 0.06 * (vn3(v.x * 3.7, v.y * 3.7, v.z * 3.7) - 0.5);
              if (it.floorY !== null) {
                const h = Math.min(1, Math.max(0, (v.y - it.floorY) / 0.6));
                k *= 0.6 + 0.4 * h * h * (3 - 2 * h);
              }
            }
            v.fromBufferAttribute(gn, i).applyMatrix3(n3).normalize();
            N[o * 3] = v.x; N[o * 3 + 1] = v.y; N[o * 3 + 2] = v.z;
            if (paint && v.y > 0.6) k *= 1.04;
            C[o * 3] = cc.r * k; C[o * 3 + 1] = cc.g * k; C[o * 3 + 2] = cc.b * k;
          }
        }
        const bg = new THREE.BufferGeometry();
        bg.setAttribute('position', new THREE.BufferAttribute(P, 3));
        bg.setAttribute('normal', new THREE.BufferAttribute(N, 3));
        bg.setAttribute('color', new THREE.BufferAttribute(C, 3));
        bg.computeBoundingSphere();
        const mesh = new THREE.Mesh(bg, mats[bin]);
        mesh.name = 'kit-' + bin;
        mesh.userData.solid = SOLID.has(bin);
        mesh.castShadow = shadows && bin !== 'glow' && bin !== 'deco';
        mesh.receiveShadow = shadows && bin !== 'glow';
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        root.add(mesh);
        made.push(mesh);
      }
      this.bins.set(bin, []);
    }
    return made;
  }
}

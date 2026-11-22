// Outdoor ground for the 3D view. Instead of one flat tile per square with brick walls round the map, an outdoor map
// becomes a rolling landscape:
// - one height-field mesh: water squares sink into soft-banked beds, cliffs rise as rocky shelves, land rolls a little
// - its colour is the overhead map's own ground, baked once (so the soft blends between grass, sand, roads and
//   shores match the 2D map exactly), with fine grain and rock painted on top by the shader up close
// - the map carries on past its edge: a mirrored band of ground and trees, then open land into the haze, so there is
//   no wall at the end of the world
// - water is its own surface: clear, darker where deep, mirroring the sky, with moving ripples
import * as THREE from 'three';
import type { GameMap, Prop } from '../engine/map';
import { terrainById } from '../library/terrain';
import { objectById } from '../library/objects';
import { drawGround } from '../render/ground';
import { browserFloors, onFloorsLoaded } from '../render/floors';
import { shade, type VisUniforms } from './shaders';
import { gritTex, fbm } from './textures';

const CELL = 48;
/** Squares of mirrored land drawn past each edge. */
export const MARGIN = 14;

/** Natural grounds, roads and water: squares with no roof over them. */
export function isOutdoorMat(id: string | undefined) {
  if (!id) return false;
  if (['grass', 'dirt', 'sand', 'mud', 'ice'].includes(id)) return true;
  const t = terrainById(id);
  return !!t && (t.z !== undefined || t.group === 'road' || t.rule === 'water' || !!t.cliff);
}

/** An outdoor map: most of its open squares are natural ground. */
export function isOutdoorMap(m: GameMap) {
  if (!m.mats) return false;
  let out = 0, floors = 0;
  for (let i = 0; i < m.cells.length; i++) {
    if (m.cells[i] <= 0) continue;
    floors++;
    if (isOutdoorMat(m.mats[i])) out++;
  }
  return floors > 0 && out / floors > 0.5;
}

const WATER_LOOK: Record<string, { col: string; deep: string; op: number; glow?: string }> = {
  ocean: { col: '#1d5f86', deep: '#0c2c44', op: 0.9 },
  'water-deep': { col: '#21607e', deep: '#0e3045', op: 0.86 },
  'water-shallow': { col: '#4d97a6', deep: '#1f5466', op: 0.62 },
  'water-muddy': { col: '#6b6a3e', deep: '#3a3a22', op: 0.88 },
  'water-glow': { col: '#3a2f8a', deep: '#120c34', op: 0.8, glow: '#3cd6c8' },
  'swamp-water': { col: '#46562e', deep: '#232c18', op: 0.86 },
};
const DEPTH: Record<string, number> = { ocean: -1.3, 'water-deep': -0.95, 'water-shallow': -0.42, 'water-muddy': -0.7, 'water-glow': -0.6, 'swamp-water': -0.3 };

/** Mirror a coordinate back into 0..n-1, so the land past the edge continues the land inside it. */
const mirror = (v: number, n: number) => {
  if (n <= 1) return 0;
  const p = 2 * n;
  let k = ((v % p) + p) % p;
  if (k >= n) k = p - 1 - k;
  return k;
};

function hash(x: number, y: number, s: number) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x: number, y: number, s: number) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
const fbm2 = (x: number, y: number, s: number) => vnoise(x, y, s) * 0.55 + vnoise(x * 2.1, y * 2.1, s + 1) * 0.3 + vnoise(x * 4.3, y * 4.3, s + 2) * 0.15;

/** The map grown by MARGIN squares on every side, mirrored. */
export function extendMap(m: GameMap): GameMap {
  const M = MARGIN, C = m.cols + 2 * M, Rr = m.rows + 2 * M;
  const cells = new Array<number>(C * Rr), mats = new Array<string>(C * Rr);
  for (let y = 0; y < Rr; y++)
    for (let x = 0; x < C; x++) {
      const sx = mirror(x - M, m.cols), sy = mirror(y - M, m.rows), j = sy * m.cols + sx;
      cells[y * C + x] = m.cells[j];
      mats[y * C + x] = m.mats?.[j] ?? '';
    }
  return { ...m, cols: C, rows: Rr, cells, mats, props: [], notes: [], doors: {}, walls: [], wallKinds: {}, id: (m.id ?? 'map') + '-ext' } as GameMap;
}

/** Natural things near the edge, mirrored past it, so woods and rocks carry on beyond the map. */
export function mirroredProps(m: GameMap): Prop[] {
  const out: Prop[] = [];
  const natural = (k: string) => {
    const d = objectById(k);
    if (!d) return false;
    return /^(tree|bush|boulder|rock|fern|ferns|plant|reeds|grass-tall|flowers|cactus|desert-rocks|thorn|mushroom|fungus|glow-pods|tendrils|crystal|vines|log)/.test(k) && !/region-/.test(k);
  };
  for (const p of m.props) {
    if (!natural(p.kind)) continue;
    const d = objectById(p.kind)!;
    const [w, h] = p.rot % 180 ? [d.h, d.w] : [d.w, d.h];
    const xs = [p.x], ys = [p.y];
    if (p.x < MARGIN) xs.push(-p.x - w);
    if (p.x + w > m.cols - MARGIN) xs.push(2 * m.cols - p.x - w);
    if (p.y < MARGIN) ys.push(-p.y - h);
    if (p.y + h > m.rows - MARGIN) ys.push(2 * m.rows - p.y - h);
    for (const x of xs)
      for (const y of ys) {
        if (x === p.x && y === p.y) continue;
        out.push({ ...p, id: p.id + '~' + x + ',' + y, x, y, gmOnly: false });
      }
  }
  // woods carry on into the distance: trees of the same kinds, about as thick as along the map's own edge
  const trees = m.props.filter((p) => /^tree-/.test(p.kind));
  if (trees.length && edgeWaterShare(m) < 0.25) {
    const near = trees.filter((p) => p.x < 10 || p.y < 10 || p.x > m.cols - 10 || p.y > m.rows - 10).length;
    const band = 2 * 10 * (m.cols + m.rows);
    const dens = Math.min(0.12, (near / band) * 0.9);
    const R = (() => { let s = m.cols * 131 + m.rows; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    const W2 = MARGIN + 34;
    for (let y = -W2; y < m.rows + W2; y += 2)
      for (let x = -W2; x < m.cols + W2; x += 2) {
        if (x > -MARGIN && y > -MARGIN && x < m.cols + MARGIN && y < m.rows + MARGIN) continue;
        if (R() > dens * 4) continue;
        const t = trees[Math.floor(R() * trees.length)];
        out.push({ ...t, id: t.id + '~far' + x + ',' + y, x: x + Math.floor(R() * 2), y: y + Math.floor(R() * 2), gmOnly: false });
      }
  }
  return out;
}

/** Square heights: water sinks, cliffs rise, the rest rolls gently. */
function squareHeights(e: GameMap) {
  const H = new Float32Array(e.cols * e.rows);
  for (let i = 0; i < H.length; i++) {
    const id = e.mats?.[i] ?? '', v = e.cells[i], t = terrainById(id);
    if (v === 2 || t?.rule === 'water') H[i] = DEPTH[id] ?? -0.45;
    else if (v === 5 || t?.cliff) H[i] = 2.2;
    else if (v <= 0) H[i] = 2.6;
    else H[i] = 0;
  }
  return H;
}

export interface Terrain {
  group: THREE.Group;
  meshes: THREE.Mesh[];
  water: THREE.Mesh[];
  materials: THREE.Material[];
  geometries: THREE.BufferGeometry[];
  textures: THREE.Texture[];
  /** Ground height at a world point. */
  heightAt: (x: number, z: number) => number;
  /** The ground at a square, past the edge too (mirrored). */
  matAt: (x: number, y: number) => string;
  dispose: () => void;
}

let waterNormalCache: THREE.Texture | undefined;
/** Soft, tileable ripples for the water surface. */
function waterNormal() {
  if (waterNormalCache) return waterNormalCache;
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const img = g.createImageData(S, S);
  const h = (x: number, y: number) => fbm(x, y, S, 6, 4, 11) * 0.7 + fbm(x, y, S, 14, 3, 23) * 0.3;
  const Hh = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) Hh[y * S + x] = h(x, y);
  const at = (x: number, y: number) => Hh[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 9, dy = (at(x, y + 1) - at(x, y - 1)) * 9, l = Math.hypot(dx, dy, 1), i = (y * S + x) * 4;
      img.data[i] = (-dx / l * 0.5 + 0.5) * 255;
      img.data[i + 1] = (dy / l * 0.5 + 0.5) * 255;
      img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  waterNormalCache = t;
  return t;
}

/** Pixels per square for the baked ground: one of the ground painter's own sizes, kept inside a phone's memory. */
function bakeDensity(C: number, R: number, q: 'low' | 'medium' | 'high') {
  const mb = (q === 'high' ? 72 : q === 'medium' ? 36 : 16) * 1024 * 1024;
  for (const p of q === 'low' ? [24, 12] : [48, 24, 12]) if (C * p <= 4096 && R * p <= 4096 && C * R * p * p * 4 <= mb) return p;
  return 12;
}

export function buildTerrain(m: GameMap, vis: VisUniforms, q: 'low' | 'medium' | 'high', shadows: boolean, onChange?: () => void): Terrain {
  const group = new THREE.Group();
  group.name = 'terrain';
  const materials: THREE.Material[] = [], geometries: THREE.BufferGeometry[] = [], textures: THREE.Texture[] = [], meshes: THREE.Mesh[] = [], water: THREE.Mesh[] = [];
  const e = extendMap(m);
  const M = MARGIN, C = e.cols, R = e.rows;
  const SH = squareHeights(e);
  const seed = (m.cols * 31 + m.rows * 17) | 0;

  // ---- heights on a grid of sub-steps (2 per square, 1 on Low) ----
  const sub = q === 'low' ? 1 : 2;
  const VX = C * sub + 1, VZ = R * sub + 1;
  const hv = new Float32Array(VX * VZ);
  const sqH = (x: number, y: number) => SH[Math.max(0, Math.min(R - 1, y)) * C + Math.max(0, Math.min(C - 1, x))];
  for (let j = 0; j < VZ; j++)
    for (let i = 0; i < VX; i++) {
      const fx = i / sub, fz = j / sub;
      // squares this vertex touches: on a line it averages both sides, inside a square it is that square
      const xs = Number.isInteger(fx) ? [fx - 1, fx] : [Math.floor(fx)];
      const zs = Number.isInteger(fz) ? [fz - 1, fz] : [Math.floor(fz)];
      let s = 0, n = 0, lo = 0, hi = 0;
      for (const a of xs) for (const b of zs) { const h = sqH(a, b); s += h; n++; lo = Math.min(lo, h); hi = Math.max(hi, h); }
      let h = s / n;
      // cliffs keep a flat-topped shelf with steep sides, not a spike (a lone cliff square would otherwise be a pyramid)
      if (hi > 1 && lo >= -0.05 && n > 1) h = h * 0.3 + hi * 0.7;
      const wx = fx - M, wz = fz - M;
      const nz = fbm2(wx * 0.23, wz * 0.23, seed);
      if (hi > 1) h += (fbm2(wx * 0.7, wz * 0.7, seed + 5) - 0.5) * 1.2 * (h / 2.2); // ragged cliff tops
      else if (lo < -0.05) h += (nz - 0.5) * 0.18 * Math.min(1, -h * 2); // uneven river and lake beds
      else h += (nz - 0.5) * 0.1 + (vnoise(wx * 1.7, wz * 1.7, seed + 9) - 0.5) * 0.04; // gentle rolls where people stand
      hv[j * VX + i] = h;
    }
  const heightAt = (x: number, z: number) => {
    if (x < -M || z < -M || x > C - M || z > R - M) return -0.03; // the open land past the mirrored band
    const fx = (x + M) * sub, fz = (z + M) * sub;
    const i = Math.max(0, Math.min(VX - 2, Math.floor(fx))), j = Math.max(0, Math.min(VZ - 2, Math.floor(fz)));
    const tx = Math.min(1, Math.max(0, fx - i)), tz = Math.min(1, Math.max(0, fz - j));
    const a = hv[j * VX + i], b = hv[j * VX + i + 1], c = hv[(j + 1) * VX + i], d = hv[(j + 1) * VX + i + 1];
    return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
  };

  // ---- the ground mesh ----
  const pos = new Float32Array(VX * VZ * 3), uv = new Float32Array(VX * VZ * 2);
  for (let j = 0; j < VZ; j++)
    for (let i = 0; i < VX; i++) {
      const k = j * VX + i;
      pos[k * 3] = i / sub - M;
      pos[k * 3 + 1] = hv[k];
      pos[k * 3 + 2] = j / sub - M;
      uv[k * 2] = i / sub / C;
      uv[k * 2 + 1] = j / sub / R;
    }
  const idx = new Uint32Array((VX - 1) * (VZ - 1) * 6);
  let p = 0;
  for (let j = 0; j < VZ - 1; j++)
    for (let i = 0; i < VX - 1; i++) {
      const a = j * VX + i, b = a + 1, c = a + VX, d = c + 1;
      // alternate the diagonal so slopes don't streak one way
      if ((i + j) % 2) { idx[p++] = a; idx[p++] = c; idx[p++] = b; idx[p++] = b; idx[p++] = c; idx[p++] = d; }
      else { idx[p++] = a; idx[p++] = c; idx[p++] = d; idx[p++] = a; idx[p++] = d; idx[p++] = b; }
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  geometries.push(g);

  // ---- bake the overhead ground into one picture ----
  const pps = bakeDensity(C, R, q);
  const bw = Math.min(4096, C * pps), bh = Math.min(4096, R * pps);
  const canvas = document.createElement('canvas');
  canvas.width = bw;
  canvas.height = bh;
  const ctx = canvas.getContext('2d')!;
  const avg = averageColour(e);
  ctx.fillStyle = avg;
  ctx.fillRect(0, 0, bw, bh);
  const bake = new THREE.CanvasTexture(canvas);
  bake.colorSpace = THREE.SRGBColorSpace;
  bake.flipY = false;
  bake.anisotropy = q === 'high' ? 8 : 4;
  bake.wrapS = bake.wrapT = THREE.ClampToEdgeWrapping;
  textures.push(bake);
  let alive = true, timer: ReturnType<typeof setTimeout> | undefined, redraws = 0;
  // the ground painter works in short slices so the page never freezes; keep slicing until the whole map is drawn
  const bakeStep = () => {
    if (!alive) return;
    ctx.save();
    ctx.setTransform(bw / (C * CELL), 0, 0, bh / (R * CELL), 0, 0);
    const pending = drawGround(ctx, e, browserFloors, bw / (C * CELL), { x0: 0, y0: 0, x1: C, y1: R }, CELL);
    ctx.restore();
    bake.needsUpdate = true;
    onChange?.();
    clearTimeout(timer);
    if (pending) timer = setTimeout(bakeStep, 0);
  };
  bakeStep();
  // pictures arrive one by one; redraw when they do
  const off = onFloorsLoaded(() => {
    if (redraws++ > 60) return;
    clearTimeout(timer);
    timer = setTimeout(bakeStep, 80);
  });

  const grit = gritTex();
  const nrm = grit.normal.clone();
  nrm.wrapS = nrm.wrapT = THREE.RepeatWrapping;
  nrm.repeat.set(C / 1.5, R / 1.5);
  nrm.needsUpdate = true;
  textures.push(nrm);
  const gm = shade(
    new THREE.MeshStandardMaterial({ map: bake, normalMap: nrm, normalScale: new THREE.Vector2(0.55, 0.55), roughness: 0.94, metalness: 0 }),
    vis,
    { ground: true },
  );
  materials.push(gm);
  const ground = new THREE.Mesh(g, gm);
  ground.name = 'terrain-ground';
  ground.receiveShadow = shadows;
  ground.userData.floor = true;
  group.add(ground);
  meshes.push(ground);

  // ---- open land past the mirrored band, into the haze ----
  const edgeWater = edgeWaterShare(m);
  // a big square with a hole the size of the extended map
  // shape in x, -z so that turning it flat leaves it facing up
  const sk = new THREE.Shape([new THREE.Vector2(-400, 400), new THREE.Vector2(-400, -400), new THREE.Vector2(400, -400), new THREE.Vector2(400, 400)]);
  const hx0 = -M + 0.5, hx1 = C - M - 0.5, hz0 = -M + 0.5, hz1 = R - M - 0.5;
  sk.holes.push(new THREE.Path([new THREE.Vector2(hx0, -hz0), new THREE.Vector2(hx1, -hz0), new THREE.Vector2(hx1, -hz1), new THREE.Vector2(hx0, -hz1)]));
  const sg = new THREE.ShapeGeometry(sk);
  sg.rotateX(-Math.PI / 2);
  geometries.push(sg);
  const edgeId = edgeGround(m);
  const nrm2 = grit.normal.clone();
  nrm2.wrapS = nrm2.wrapT = THREE.RepeatWrapping;
  nrm2.repeat.set(0.6, 0.6);
  nrm2.needsUpdate = true;
  textures.push(nrm2);
  const sm = shade(
    new THREE.MeshStandardMaterial({ color: edgeWater > 0.4 ? '#0e2a3a' : terrainById(edgeId)?.color ?? avg, roughness: 0.95, side: THREE.DoubleSide, normalMap: nrm2, normalScale: new THREE.Vector2(0.4, 0.4) }),
    vis,
    { noVis: true, ground: true },
  );
  materials.push(sm);
  const skirt = new THREE.Mesh(sg, sm);
  skirt.position.y = edgeWater > 0.4 ? -1.3 : -0.03;
  skirt.receiveShadow = shadows;
  skirt.name = 'terrain-skirt';
  group.add(skirt);

  // far hills all round, fading into the haze, so the land doesn't stop at a ruler-straight horizon
  {
    const cx = m.cols / 2, cz = m.rows / 2, r0 = Math.hypot(C, R) / 2 + 70, segs = 180;
    const P: number[] = [], Cc: number[] = [], I: number[] = [];
    const near = new THREE.Color(avg).multiplyScalar(0.55), far = new THREE.Color(avg).lerp(new THREE.Color('#4a5a6e'), 0.6).multiplyScalar(0.7);
    const rings = [[0, -0.6], [60, 1], [110, 0.8], [150, 0.3]];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      const hh = 3 + 16 * Math.pow(fbm2(ca * 3 + 10, sa * 3 + 10, seed + 31), 1.8) + 3 * fbm2(ca * 11 + 4, sa * 11 + 4, seed + 40);
      rings.forEach(([dr, k], j) => {
        P.push(cx + ca * (r0 + dr), j === 0 ? -0.6 : hh * k, cz + sa * (r0 + dr));
        const c = near.clone().lerp(far, j / 3);
        Cc.push(c.r, c.g, c.b);
      });
    }
    for (let i = 0; i < segs; i++)
      for (let j = 0; j < 3; j++) {
        const a = i * 4 + j, b = a + 4;
        I.push(a, a + 1, b, a + 1, b + 1, b);
      }
    const hg = new THREE.BufferGeometry();
    hg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    hg.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 3));
    hg.setIndex(I);
    hg.computeVertexNormals();
    geometries.push(hg);
    const hm = shade(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide }), vis, { noVis: true });
    materials.push(hm);
    const hills = new THREE.Mesh(hg, hm);
    hills.name = 'far-hills';
    group.add(hills);
  }

  // ---- water: one surface over every pond, river and sea, a square wider than the water so the banks dip under
  // it; its colour and clearness blend from kind to kind at each corner, so shallows fade into deeps ----
  const wn = waterNormal();
  const kindAt = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= C || y >= R) return '';
    const i = y * C + x, id = e.mats?.[i] ?? '';
    if (e.cells[i] !== 2 && terrainById(id)?.rule !== 'water') return '';
    return WATER_LOOK[id] ? id : 'water-shallow';
  };
  for (const glow of [false, true]) {
    const use = (k: string) => !!k && (k === 'water-glow') === glow;
    const near = new Uint8Array(C * R);
    let any = false;
    for (let y = 0; y < R; y++)
      for (let x = 0; x < C; x++)
        if (use(kindAt(x, y))) {
          any = true;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (x + dx >= 0 && y + dy >= 0 && x + dx < C && y + dy < R) near[(y + dy) * C + x + dx] = 1;
        }
    if (!any) continue;
    const vid = new Int32Array((C + 1) * (R + 1)).fill(-1);
    const P: number[] = [], U: number[] = [], Cc: number[] = [], I: number[] = [];
    const col = new THREE.Color(), sum = new THREE.Color();
    const vert = (x: number, y: number) => {
      const k = y * (C + 1) + x;
      if (vid[k] >= 0) return vid[k];
      sum.setRGB(0, 0, 0);
      let n = 0, op = 0;
      for (let r = 1; r <= 2 && !n; r++)
        for (let dy = -r; dy < r; dy++)
          for (let dx = -r; dx < r; dx++) {
            const kk = kindAt(x + dx, y + dy);
            if (!use(kk)) continue;
            const L = WATER_LOOK[kk];
            col.set(L.col);
            sum.r += col.r; sum.g += col.g; sum.b += col.b;
            op += L.op;
            n++;
          }
      if (!n) { col.set(WATER_LOOK['water-shallow'].col); sum.copy(col); op = 0.6; n = 1; }
      vid[k] = P.length / 3;
      P.push(x - M, 0, y - M);
      U.push((x - M) / 6, (y - M) / 6);
      Cc.push(sum.r / n, sum.g / n, sum.b / n, op / n);
      return vid[k];
    };
    for (let y = 0; y < R; y++)
      for (let x = 0; x < C; x++) {
        if (!near[y * C + x]) continue;
        const a0 = vert(x, y), b0 = vert(x + 1, y), c0 = vert(x, y + 1), d0 = vert(x + 1, y + 1);
        I.push(a0, c0, b0, b0, c0, d0);
      }
    const wg = new THREE.BufferGeometry();
    wg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    wg.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    wg.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 4));
    wg.setIndex(I);
    wg.computeVertexNormals();
    geometries.push(wg);
    const mesh = new THREE.Mesh(wg, waterMaterial(vis, wn, glow));
    materials.push(mesh.material as THREE.Material);
    mesh.position.y = -0.1;
    mesh.renderOrder = 2;
    mesh.name = glow ? 'water-glow' : 'water';
    group.add(mesh);
    water.push(mesh);
  }
  // a coast: the sea goes on to the horizon
  if (edgeWater > 0.4) {
    const ring = sg.clone();
    const n = ring.attributes.position.count, Cc: number[] = [];
    const sea = new THREE.Color(WATER_LOOK.ocean.col);
    for (let i = 0; i < n; i++) Cc.push(sea.r, sea.g, sea.b, 0.94);
    ring.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 4));
    const U = ring.attributes.position;
    const uv: number[] = [];
    for (let i = 0; i < n; i++) uv.push(U.getX(i) / 6, U.getZ(i) / 6);
    ring.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geometries.push(ring);
    const mesh = new THREE.Mesh(ring, waterMaterial(vis, wn, false));
    materials.push(mesh.material as THREE.Material);
    mesh.position.y = -0.1;
    mesh.renderOrder = 2;
    mesh.name = 'water-sea';
    group.add(mesh);
    water.push(mesh);
  }

  return {
    group, meshes, water, materials, geometries, textures, heightAt,
    matAt: (x, y) => e.mats?.[(y + M) * C + (x + M)] ?? '',
    dispose: () => {
      alive = false;
      off();
      clearTimeout(timer);
      for (const x of geometries) x.dispose();
      for (const x of materials) x.dispose();
      for (const t of textures) t.dispose();
    },
  };
}

function waterMaterial(vis: VisUniforms, wn: THREE.Texture, glow: boolean) {
  return shade(
    new THREE.MeshStandardMaterial({
      color: '#ffffff', vertexColors: true, transparent: true, roughness: 0.05, metalness: 0, envMapIntensity: 1.15,
      normalMap: wn, normalScale: new THREE.Vector2(0.3, 0.3),
      emissive: glow ? new THREE.Color('#3cd6c8') : new THREE.Color(0), emissiveIntensity: glow ? 0.16 : 0,
      depthWrite: false,
    }),
    vis,
    { water: true },
  );
}

function averageColour(e: GameMap) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < e.cells.length; i += 7) {
    const c = new THREE.Color(terrainById(e.mats?.[i] ?? '')?.color ?? '#5a6a3a');
    r += c.r; g += c.g; b += c.b; n++;
  }
  return '#' + new THREE.Color(r / n, g / n, b / n).getHexString();
}

function edgeGround(m: GameMap) {
  const n = new Map<string, number>();
  const at = (x: number, y: number) => { const id = m.mats?.[y * m.cols + x]; if (id && terrainById(id)?.rule !== 'water') n.set(id, (n.get(id) ?? 0) + 1); };
  for (let x = 0; x < m.cols; x++) { at(x, 0); at(x, m.rows - 1); }
  for (let y = 0; y < m.rows; y++) { at(0, y); at(m.cols - 1, y); }
  return [...n].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'grass';
}

function edgeWaterShare(m: GameMap) {
  let w = 0, n = 0;
  const at = (x: number, y: number) => { n++; if (m.cells[y * m.cols + x] === 2) w++; };
  for (let x = 0; x < m.cols; x++) { at(x, 0); at(x, m.rows - 1); }
  for (let y = 0; y < m.rows; y++) { at(0, y); at(m.cols - 1, y); }
  return w / Math.max(1, n);
}

// ---------------------------------------------------------------------------------------------------------
// sky

export interface SkyLook { zenith: string; horizon: string; ground: string; sun: string; sunDir: THREE.Vector3; clouds: number; stars: boolean }

export const SKIES: Record<'day' | 'dusk' | 'night' | 'alien', SkyLook> = {
  day: { zenith: '#3f7fc4', horizon: '#cfe0ea', ground: '#7c8a6a', sun: '#fff6df', sunDir: new THREE.Vector3(-0.62, 0.62, 0.28).normalize(), clouds: 0.55, stars: false },
  dusk: { zenith: '#2a3260', horizon: '#c98e6a', ground: '#3a3036', sun: '#ffc48a', sunDir: new THREE.Vector3(-0.85, 0.2, 0.2).normalize(), clouds: 0.4, stars: false },
  alien: { zenith: '#1c1640', horizon: '#7a5aa8', ground: '#1c2a2a', sun: '#b8f0e0', sunDir: new THREE.Vector3(0.5, 0.35, -0.6).normalize(), clouds: 0.5, stars: true },
  night: { zenith: '#070a1a', horizon: '#2a2550', ground: '#0e0c16', sun: '#9fb2ff', sunDir: new THREE.Vector3(0.4, 0.55, -0.5).normalize(), clouds: 0.25, stars: true },
};

/** A painted sky all the way round, used as the background and as what shiny things (water) reflect. */
export function skyTexture(s: SkyLook) {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const img = g.createImageData(W, H);
  const z = new THREE.Color(s.zenith), hz = new THREE.Color(s.horizon), gr = new THREE.Color(s.ground), sun = new THREE.Color(s.sun);
  const sd = s.sunDir;
  const tmp = new THREE.Color();
  for (let y = 0; y < H; y++) {
    const lat = Math.PI / 2 - (y / H) * Math.PI; // +90 at the top
    const sy = Math.sin(lat);
    for (let x = 0; x < W; x++) {
      const lon = (x / W) * Math.PI * 2 - Math.PI;
      const dx = Math.cos(lat) * Math.sin(lon), dz = -Math.cos(lat) * Math.cos(lon);
      if (sy >= 0) tmp.copy(hz).lerp(z, Math.pow(sy, 0.55));
      else tmp.copy(hz).lerp(gr, Math.min(1, Math.pow(-sy * 4, 0.6)));
      // sun glow
      const dot = Math.max(0, dx * sd.x + sy * sd.y + dz * sd.z);
      tmp.lerp(sun, Math.pow(dot, 220) * 0.95 + Math.pow(dot, 12) * 0.28);
      // soft clouds, thicker near the horizon
      if (sy > 0.02 && s.clouds > 0) {
        const u = dx / (sy + 0.25), v = dz / (sy + 0.25);
        const cl = fbmFree(u * 1.6 + 7, v * 1.6 + 3);
        const k = Math.max(0, Math.min(1, (cl - (1 - s.clouds * 0.62)) * 3.2)) * Math.min(1, sy * 6) * 0.85;
        const cc = s.stars ? 0.5 : 1;
        tmp.lerp(tmp.clone().lerp(new THREE.Color(1, 1, 1), 0.85 * cc).lerp(sun, 0.15), k);
      }
      if (s.stars && sy > 0.05 && hash(x, y, 77) > 0.9975) tmp.lerp(new THREE.Color(1, 1, 1), 0.4 + hash(x, y, 78) * 0.6);
      const i = (y * W + x) * 4;
      img.data[i] = Math.min(255, tmp.r * 255);
      img.data[i + 1] = Math.min(255, tmp.g * 255);
      img.data[i + 2] = Math.min(255, tmp.b * 255);
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function fbmFree(x: number, y: number) {
  let a = 0.5, s = 0, n = 0;
  for (let o = 0; o < 5; o++) { s += vnoise(x, y, 400 + o) * a; n += a; x *= 2.03; y *= 2.03; a *= 0.5; }
  return s / n;
}

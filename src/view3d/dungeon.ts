// Turns an overhead Lair Labs map into a 3D dungeon on the same grid: 1 square = 1 world unit (5 ft),
// world x = map column, world z = map row. Floors use the same floor pictures as the overhead map; walls, doors,
// windows and bars come straight from the map's wall edges; caves get lumpy rock instead of dressed stone.
import * as THREE from 'three';
import { type GameMap, allWallEdges, parseEdge, cell, isFloor, SEE_THROUGH_DOORS } from '../engine/map';
import { Kit, rng, type Bin } from './kit';
import { shade, type VisUniforms } from './shaders';
import { gritTex, plankTex, ironTex, stoneBlockTex, caveRockTex } from './textures';
import { buildProps, type LightSpot } from './props3d';

export const WALL_H = 2.4; // 12 ft
export const EYE = 1.15;
const THEME_FLOOR: Record<string, string> = { stone: 'stone-flagstone', cave: 'cave-floor', wood: 'wood-planks' };
const OUTDOOR = new Set(['grass', 'dirt', 'sand', 'mud', 'ice']);
const FALLBACK: Record<string, string> = {
  'stone-flagstone': '#8f8a80', 'stone-flagstone-warm': '#9a8a74', 'dungeon-slab': '#77736c', 'stone-cobble': '#857f76', 'brick-floor': '#8c5a45',
  marble: '#d9d4cb', 'wood-planks': '#9a6b3e', 'wood-planks-dark': '#5f4029', dirt: '#7a5f43', grass: '#5d7a3a', sand: '#cdb27f', 'cave-floor': '#6e6458',
  'water-shallow': '#4f86a6', 'water-deep': '#24506e', mud: '#5a4632', ice: '#bcd8e6', lava: '#c2410c', pit: '#141210',
};

export interface DoorObj {
  key: string;
  pivot: THREE.Object3D;
  kind: 'swing' | 'lift' | 'double';
  leaves: THREE.Object3D[];
  /** 0 shut .. 1 open, eased toward target each frame. */
  t: number;
  target: number;
  hit: THREE.Mesh;
}

export interface Built {
  root: THREE.Group;
  ceiling: THREE.Group;
  doors: Map<string, DoorObj>;
  lights: LightSpot[];
  /** Meshes the camera can't pass through and taps land on. */
  floorMeshes: THREE.Mesh[];
  water: THREE.Mesh[];
  materials: THREE.Material[];
  dispose: () => void;
}

const floorTexCache = new Map<string, THREE.Texture>();
function floorTex(id: string, onLoad: () => void) {
  let t = floorTexCache.get(id);
  if (!t) {
    t = new THREE.TextureLoader().load(`/library/floors/${id}.webp`, onLoad, undefined, () => {});
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    floorTexCache.set(id, t);
  }
  return t;
}

function matFor(m: GameMap, i: number, v: number) {
  const mt = m.mats?.[i];
  if (v === 2) return mt && mt.startsWith('water') ? mt : 'water-shallow';
  if (v === 4) return 'pit';
  return mt || THEME_FLOOR[m.theme] || 'stone-flagstone';
}

export interface BuildOpts { quality: 'low' | 'medium' | 'high'; role: 'gm' | 'player'; onTexture?: () => void }

export function buildDungeon(m: GameMap, vis: VisUniforms, kitMats: Record<Bin, THREE.Material>, o: BuildOpts): Built {
  const root = new THREE.Group();
  root.name = 'dungeon';
  const ceiling = new THREE.Group();
  ceiling.name = 'ceiling';
  root.add(ceiling);
  const shadows = o.quality === 'high';
  const mats: THREE.Material[] = [];
  const geos: THREE.BufferGeometry[] = [];
  const kit = new Kit(12);
  const R = rng(m.cols * 9973 + m.rows * 31 + m.cells.length);
  const cave = m.theme === 'cave' || m.wallStyle === 'cave';
  const wallBin: Bin = cave ? 'cave' : m.wallStyle === 'wood' || m.theme === 'wood' ? 'wood' : 'stone';
  const wallCol = cave ? '#8a7e70' : m.wallStyle === 'brick' ? '#b0705a' : wallBin === 'wood' ? '#9a6a40' : m.wallStyle === 'hedge' ? '#4f7a3a' : '#a8a196';

  // ---------------- floors ----------------
  const byMat = new Map<string, number[]>();
  const W = m.cols;
  for (let i = 0; i < m.cells.length; i++) {
    const v = m.cells[i];
    if (v <= 0) continue;
    const id = matFor(m, i, v);
    let a = byMat.get(id);
    if (!a) byMat.set(id, (a = []));
    a.push(i);
  }
  // corner shade: how much rock touches each grid corner (cheap ambient occlusion along wall feet)
  const rockAt = (x: number, y: number) => (isFloor(m, x, y) ? 0 : 1);
  const cornerAO = (cx: number, cy: number) => {
    const n = rockAt(cx - 1, cy - 1) + rockAt(cx, cy - 1) + rockAt(cx - 1, cy) + rockAt(cx, cy);
    return n === 0 ? 1 : n === 1 ? 0.72 : n === 2 ? 0.62 : 0.5;
  };
  const floorMeshes: THREE.Mesh[] = [];
  const water: THREE.Mesh[] = [];
  const gr = gritTex();
  for (const [id, cells] of byMat) {
    const isWater = id.startsWith('water');
    const isPit = id === 'pit';
    const y0 = isWater ? -0.18 : isPit ? -2.5 : 0;
    const P: number[] = [], N: number[] = [], U: number[] = [], C: number[] = [];
    const sq = 4;
    for (const i of cells) {
      const x = i % W, y = Math.floor(i / W);
      const corners = [[x, y], [x + 1, y + 1], [x + 1, y], [x, y], [x, y + 1], [x + 1, y + 1]]; // wound to face up
      for (const [cx, cy] of corners) {
        P.push(cx, y0, cy);
        N.push(0, 1, 0);
        U.push(cx / sq, -cy / sq);
        const k = isPit ? 0.15 : cornerAO(cx, cy) * (0.94 + 0.12 * ((Math.sin(cx * 12.9898 + cy * 78.233) * 43758.5453) % 1 + 1) % 1);
        C.push(k, k, k);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    geos.push(g);
    const nrm = gr.normal.clone();
    nrm.repeat.set(4, 4);
    nrm.needsUpdate = true;
    const mat = shade(
      new THREE.MeshStandardMaterial({
        map: id === 'pit' ? null : floorTex(id, () => o.onTexture?.()),
        color: id === 'pit' ? FALLBACK.pit : '#ffffff',
        vertexColors: true,
        roughness: id === 'marble' || id === 'ice' ? 0.35 : 0.9,
        normalMap: nrm,
        normalScale: new THREE.Vector2(0.6, 0.6),
        emissive: id === 'lava' ? new THREE.Color('#ff5a1a') : new THREE.Color(0),
        emissiveIntensity: id === 'lava' ? 0.9 : 0,
      }),
      vis,
      { flicker: id === 'lava' },
    );
    mats.push(mat);
    const mesh = new THREE.Mesh(g, mat);
    mesh.name = 'floor-' + id;
    mesh.receiveShadow = shadows;
    mesh.userData.floor = true;
    root.add(mesh);
    floorMeshes.push(mesh);
    if (isWater) {
      // a moving water surface over a sunken floor, plus the cut edges where water meets dry floor
      const wg = g.clone();
      const wp = wg.attributes.position as THREE.BufferAttribute;
      for (let k = 0; k < wp.count; k++) wp.setY(k, -0.06);
      const wm = shade(
        new THREE.MeshStandardMaterial({ color: id === 'water-deep' ? '#1d4a68' : '#3d7a9a', transparent: true, opacity: id === 'water-deep' ? 0.82 : 0.6, roughness: 0.08, metalness: 0.1, normalMap: gr.normal, normalScale: new THREE.Vector2(0.35, 0.35) }),
        vis,
      );
      mats.push(wm);
      geos.push(wg);
      const wmesh = new THREE.Mesh(wg, wm);
      wmesh.name = 'water';
      wmesh.renderOrder = 2;
      root.add(wmesh);
      water.push(wmesh);
    }
    if (isWater || isPit) {
      // side faces where the floor steps down
      for (const i of cells) {
        const x = i % W, y = Math.floor(i / W);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nv = cell(m, x + dx, y + dy);
          if (nv <= 0 || nv === m.cells[i] || (nv === 2 && isWater) || (nv === 4 && isPit)) continue;
          const cxp = x + 0.5 + dx * 0.5, czp = y + 0.5 + dy * 0.5;
          const depth = -y0;
          kit.B(isPit ? 'cave' : 'lit', null, cxp - dx * 0.03, y0, czp - dy * 0.03, dx ? 0.06 : 1, depth, dy ? 0.06 : 1, isPit ? '#3a342e' : '#77706a');
        }
      }
    }
  }

  // rubble squares: loose stones
  for (let i = 0; i < m.cells.length; i++) {
    if (m.cells[i] !== 3) continue;
    const x = i % W, y = Math.floor(i / W);
    const n = 5 + Math.floor(R() * 4);
    for (let k = 0; k < n; k++) {
      const r = 0.06 + R() * 0.13;
      kit.S('lit', { x: x + 0.12 + R() * 0.76, z: y + 0.12 + R() * 0.76, y: 0 }, 0, r * 0.6, 0, r, k % 2 ? '#8a8073' : '#a39887', 'ico');
    }
  }

  // ---------------- walls ----------------
  const edges = allWallEdges(m);
  const doors = new Map<string, DoorObj>();
  const corners = new Set<string>();
  const wallTex = cave ? caveRockTex() : stoneBlockTex();
  void wallTex;
  for (const k of edges) {
    const { t, x, y } = parseEdge(k);
    // edge from (x,y) to (x+1,y) for h, (x,y) to (x,y+1) for v
    const cx = t === 'h' ? x + 0.5 : x, cz = t === 'h' ? y : y + 0.5;
    const along: [number, number] = t === 'h' ? [1, 0] : [0, 1];
    corners.add(`${x},${y}`);
    corners.add(t === 'h' ? `${x + 1},${y}` : `${x},${y + 1}`);
    const door = m.doors[k];
    const kind = m.wallKinds?.[k];
    // which side is the room? (a wall between floor and rock faces the floor)
    const style = m.doorStyles?.[k] ?? (door === 'secret' ? 'door-secret' : 'door-wood');
    if (door && !(door === 'secret' && o.role === 'player')) {
      doors.set(k, makeDoor(k, door, style, cx, cz, along, kit, wallBin, wallCol, root, mats, vis, shadows));
      continue;
    }
    const ry = t === 'h' ? 0 : Math.PI / 2;
    const O = { x: cx, z: cz, ry, y: 0 };
    if (kind === 'low') {
      kit.B(wallBin, O, 0, 0, 0, 1.02, 0.55, 0.3, wallCol);
      kit.B(wallBin, O, 0, 0.55, 0, 1.06, 0.08, 0.36, wallCol);
      continue;
    }
    if (kind === 'window') {
      kit.B(wallBin, O, 0, 0, 0, 1.02, 0.95, 0.24, wallCol);
      kit.B(wallBin, O, 0, 1.75, 0, 1.02, WALL_H - 1.75, 0.24, wallCol);
      kit.B('lit', O, 0, 0.92, 0, 1.06, 0.07, 0.34, '#b8b0a2');
      kit.B('wood', O, -0.47, 0.95, 0, 0.06, 0.8, 0.2, '#6a4a2a');
      kit.B('wood', O, 0.47, 0.95, 0, 0.06, 0.8, 0.2, '#6a4a2a');
      kit.B('wood', O, 0, 0.95, 0, 0.04, 0.8, 0.06, '#5a3a20');
      kit.B('wood', O, 0, 1.33, 0, 0.9, 0.04, 0.06, '#5a3a20');
      continue;
    }
    if (kind === 'bars' || kind === 'ethereal') {
      if (kind === 'bars') {
        for (let b = 0; b < 7; b++) kit.C('metal', O, -0.42 + b * 0.14, 0, 0, 0.022, WALL_H - 0.05, '#4a4d52', 'cyl6');
        kit.B('metal', O, 0, 0.1, 0, 1, 0.06, 0.06, '#3a3c40');
        kit.B('metal', O, 0, WALL_H - 0.3, 0, 1, 0.06, 0.06, '#3a3c40');
      } else kit.B('glow', O, 0, 0, 0, 1, WALL_H, 0.02, '#3a6aa8');
      continue;
    }
    if (cave) {
      // lumpy rock: overlapping rough boulders along the edge, taller in the middle of a run
      const [[ax, ay], [bx, by]] = t === 'h' ? [[x, y - 1], [x, y]] : [[x - 1, y], [x, y]];
      const rockSide = isFloor(m, ax, ay) ? [bx, by] : [ax, ay];
      const push = t === 'h' ? (rockSide[1] > y - 1 && rockSide[1] === y ? 0.18 : -0.18) : rockSide[0] === x ? 0.18 : -0.18;
      for (let j = 0; j < 3; j++) {
        const off = -0.35 + j * 0.35 + (R() - 0.5) * 0.12;
        const lx = t === 'h' ? cx + off : cx + push, lz = t === 'h' ? cz + push : cz + off;
        const r = 0.42 + R() * 0.2;
        kit.P('cave', null, 'ico', lx, r * 0.7, lz, r * 2, r * 1.8, r * 2, '#8a7e70', R() * 3, R() * 3, 0);
        kit.P('cave', null, 'ico', lx + (R() - 0.5) * 0.2, 1.1 + R() * 0.5, lz + (R() - 0.5) * 0.2, r * 2.2, r * 2, r * 2.2, '#7c7266', R() * 3, R() * 3, 0);
        kit.P('cave', null, 'ico', lx, WALL_H - 0.2, lz, r * 2.4, r * 1.6, r * 2.4, '#6e655a', R() * 3, R() * 3, 0);
      }
      continue;
    }
    // dressed wall: core, plinth, cornice
    const style2 = m.wallStyle === 'brick' ? '#b0705a' : wallCol;
    kit.B(wallBin, O, 0, 0, 0, 1.0, WALL_H, 0.26, style2);
    kit.B(wallBin === 'wood' ? 'wood' : 'lit', O, 0, 0, 0, 1.0, 0.16, 0.34, wallBin === 'wood' ? '#5a3a20' : '#8f887c');
    kit.B(wallBin === 'wood' ? 'wood' : 'lit', O, 0, WALL_H - 0.14, 0, 1.0, 0.14, 0.34, wallBin === 'wood' ? '#5a3a20' : '#9a9286');
    if (wallBin === 'wood') kit.B('wood', O, 0, 0.9, 0, 1.0, 0.08, 0.3, '#5a3a20');
  }
  // corner posts hide the seams where walls meet
  if (!cave)
    for (const c of corners) {
      const [x, y] = c.split(',').map(Number);
      const n = [`h:${x - 1},${y}`, `h:${x},${y}`, `v:${x},${y - 1}`, `v:${x},${y}`].filter((e) => edges.includes(e) && !m.doors[e] && m.wallKinds?.[e] !== 'low').length;
      if (n < 2) continue;
      kit.B(wallBin, { x, z: y, y: 0 }, 0, 0, 0, 0.36, WALL_H + 0.02, 0.36, wallBin === 'wood' ? '#6a4a2a' : '#9a9286');
      kit.B(wallBin === 'wood' ? 'wood' : 'lit', { x, z: y, y: 0 }, 0, 0, 0, 0.42, 0.2, 0.42, '#8a8276');
    }

  // ---------------- ceiling ----------------
  const ceilCells: number[] = [];
  for (let i = 0; i < m.cells.length; i++) if (m.cells[i] > 0 && !OUTDOOR.has(matFor(m, i, m.cells[i]))) ceilCells.push(i);
  if (ceilCells.length) {
    const P: number[] = [];
    for (const i of ceilCells) {
      const x = i % W, y = Math.floor(i / W);
      P.push(x, WALL_H, y, x + 1, WALL_H, y, x + 1, WALL_H, y + 1, x, WALL_H, y, x + 1, WALL_H, y + 1, x, WALL_H, y + 1); // wound to face down
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.computeVertexNormals();
    geos.push(g);
    const ct = cave ? caveRockTex() : wallBin === 'wood' ? { map: plankTex().map, normal: plankTex().normal } : stoneBlockTex();
    const cm = shade(new THREE.MeshStandardMaterial({ map: ct.map, normalMap: ct.normal, color: cave ? '#5a524a' : wallBin === 'wood' ? '#7a5636' : '#6a655e', roughness: 0.95 }), vis, { tri: 0.5 });
    mats.push(cm);
    const cmesh = new THREE.Mesh(g, cm);
    cmesh.name = 'ceiling';
    ceiling.add(cmesh);
    // beams across the shorter way of each room line, every 3 squares
    const ck = new Kit(12);
    const set = new Set(ceilCells);
    for (const i of ceilCells) {
      const x = i % W, y = Math.floor(i / W);
      if (cave) {
        if (R() < 0.18) ck.P('cave', null, 'cone', x + 0.5, WALL_H - 0.35, y + 0.5, 0.25, 0.7, 0.25, '#6e655a', Math.PI, 0, 0);
      } else if (y % 3 === 0 && set.has(i)) ck.B('wood', null, x + 0.5, WALL_H - 0.22, y + 0.15, 1.02, 0.22, 0.2, '#5a3d24');
    }
    ck.flush(ceiling, kitMats, false);
  }

  // rock tops: from the table camera the solid rock between rooms reads as a dark stone mass, like the overhead map.
  // They face up, so from inside the dungeon (below them) they're never drawn.
  {
    const P: number[] = [];
    for (let y = 0; y < m.rows; y++)
      for (let x = 0; x < m.cols; x++) {
        if (m.cells[y * W + x] > 0) continue;
        let near = false;
        for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2 && !near; dx++) near = isFloor(m, x + dx, y + dy);
        if (!near) continue;
        const h = WALL_H + 0.001;
        P.push(x, h, y, x + 1, h, y + 1, x + 1, h, y, x, h, y, x, h, y + 1, x + 1, h, y + 1);
      }
    if (P.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      g.computeVertexNormals();
      geos.push(g);
      const ct = cave ? caveRockTex() : stoneBlockTex();
      const rm = shade(new THREE.MeshStandardMaterial({ map: ct.map, color: cave ? '#4a433c' : '#3e3a35', roughness: 1 }), vis, { tri: 0.5 });
      mats.push(rm);
      const rmesh = new THREE.Mesh(g, rm);
      rmesh.name = 'rock-tops';
      root.add(rmesh);
    }
  }

  // ---------------- objects ----------------
  const lights = buildProps(m, kit, root, mats, vis, o.role, shadows);

  kit.flush(root, kitMats, shadows);

  return {
    root,
    ceiling,
    doors,
    lights,
    floorMeshes,
    water,
    materials: mats,
    dispose: () => {
      root.traverse((ob) => {
        const me = ob as THREE.Mesh;
        if (me.isMesh) me.geometry.dispose();
      });
      for (const g of geos) g.dispose();
      for (const mt of mats) mt.dispose();
    },
  };
}

function makeDoor(
  k: string, state: string, style: string, cx: number, cz: number, along: [number, number], kit: Kit, wallBin: Bin, wallCol: string,
  root: THREE.Group, mats: THREE.Material[], vis: VisUniforms, shadows: boolean,
): DoorObj {
  const ry = along[0] ? 0 : Math.PI / 2;
  const O = { x: cx, z: cz, ry, y: 0 };
  const DH = 1.85;
  const lift = style === 'portcullis' || style === 'bars';
  const secret = style === 'door-secret';
  // frame: jambs and lintel, wall above
  if (!secret) {
    kit.B(wallBin, O, -0.45, 0, 0, 0.12, DH + 0.1, 0.34, '#9a9286');
    kit.B(wallBin, O, 0.45, 0, 0, 0.12, DH + 0.1, 0.34, '#9a9286');
    kit.B(wallBin === 'wood' ? 'wood' : 'lit', O, 0, DH, 0, 1.04, 0.16, 0.38, '#8a8276');
  }
  kit.B(wallBin, O, 0, DH + 0.16, 0, 1.0, WALL_H - DH - 0.16, 0.26, wallCol);

  const pivot = new THREE.Group();
  pivot.position.set(cx, 0, cz);
  pivot.rotation.y = ry;
  root.add(pivot);
  const leaves: THREE.Object3D[] = [];
  const pk = plankTex(), ir = ironTex(), sb = stoneBlockTex();
  const wood = shade(new THREE.MeshStandardMaterial({ map: pk.map, normalMap: pk.normal, color: style === 'door-iron' ? '#6a6e74' : '#8a5a34', roughness: 0.8, metalness: style === 'door-iron' ? 0.6 : 0 }), vis, { tri: 1.2 });
  const iron = shade(new THREE.MeshStandardMaterial({ map: ir.map, color: '#4a4d52', roughness: 0.45, metalness: 0.7 }), vis, { tri: 2 });
  const stone = shade(new THREE.MeshStandardMaterial({ map: sb.map, normalMap: sb.normal, color: wallCol, roughness: 0.9 }), vis, { tri: 0.5 });
  mats.push(wood, iron, stone);
  const mk = (g: THREE.BufferGeometry, mt: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D) => {
    const me = new THREE.Mesh(g, mt);
    me.position.set(x, y, z);
    me.castShadow = shadows;
    me.receiveShadow = shadows;
    parent.add(me);
    return me;
  };
  let kind: DoorObj['kind'] = 'swing';
  let hit: THREE.Mesh;
  if (lift) {
    kind = 'lift';
    const leaf = new THREE.Group();
    pivot.add(leaf);
    const bars = style === 'bars' ? 6 : 7;
    for (let b = 0; b < bars; b++) mk(new THREE.CylinderGeometry(0.025, 0.025, DH, 6), iron, -0.36 + (b * 0.72) / (bars - 1), DH / 2, 0, leaf);
    for (const yy of [0.35, 0.95, 1.55]) mk(new THREE.BoxGeometry(0.8, 0.05, 0.05), iron, 0, yy, 0, leaf);
    if (style === 'portcullis') for (let b = 0; b < 7; b++) mk(new THREE.ConeGeometry(0.035, 0.12, 6), iron, -0.36 + b * 0.12, -0.05, 0, leaf).rotation.x = Math.PI;
    leaves.push(leaf);
    hit = mk(new THREE.BoxGeometry(0.9, DH, 0.12), iron, 0, DH / 2, 0, pivot);
  } else if (style === 'door-double') {
    kind = 'double';
    for (const side of [-1, 1]) {
      const hinge = new THREE.Group();
      hinge.position.set(side * 0.39, 0, 0);
      pivot.add(hinge);
      mk(new THREE.BoxGeometry(0.39, DH - 0.02, 0.07), wood, -side * 0.195, DH / 2, 0, hinge);
      for (const yy of [0.4, 1.4]) mk(new THREE.BoxGeometry(0.4, 0.05, 0.085), iron, -side * 0.195, yy, 0, hinge);
      mk(new THREE.TorusGeometry(0.05, 0.012, 6, 12), iron, -side * 0.33, 1.0, 0.06, hinge);
      leaves.push(hinge);
    }
    hit = mk(new THREE.BoxGeometry(0.8, DH, 0.1), wood, 0, DH / 2, 0, pivot);
  } else {
    const hinge = new THREE.Group();
    hinge.position.set(-0.39, 0, 0);
    pivot.add(hinge);
    if (secret) {
      mk(new THREE.BoxGeometry(0.98, WALL_H * 0.0 + DH + 0.16, 0.26), stone, 0.45, (DH + 0.16) / 2, 0, hinge);
    } else {
      mk(new THREE.BoxGeometry(0.78, DH - 0.02, 0.08), wood, 0.39, DH / 2, 0, hinge);
      for (const yy of [0.35, 0.95, 1.55]) mk(new THREE.BoxGeometry(0.8, 0.06, 0.095), iron, 0.39, yy, 0, hinge);
      mk(new THREE.TorusGeometry(0.06, 0.014, 6, 12), iron, 0.66, 1.0, 0.07, hinge);
      if (state === 'locked') mk(new THREE.BoxGeometry(0.1, 0.14, 0.12), iron, 0.66, 0.85, 0, hinge);
    }
    leaves.push(hinge);
    hit = mk(new THREE.BoxGeometry(0.8, DH, 0.1), wood, 0, DH / 2, 0, pivot);
  }
  hit.visible = false;
  hit.userData.door = k;
  const t = state === 'open' ? 1 : 0;
  const d: DoorObj = { key: k, pivot, kind, leaves, t, target: t, hit };
  poseDoor(d);
  return d;
}

export function poseDoor(d: DoorObj) {
  const e = d.t * d.t * (3 - 2 * d.t);
  if (d.kind === 'lift') d.leaves[0].position.y = e * 1.65;
  else if (d.kind === 'double') {
    d.leaves[0].rotation.y = e * 1.6;
    d.leaves[1].rotation.y = -e * 1.6;
  } else d.leaves[0].rotation.y = e * 1.75;
}

export { SEE_THROUGH_DOORS };

// Draws a map scene: floors, walls, doors, objects, light and shadow, area templates and tokens.
// Pure drawing on a 2D context in world units (CELL px per square), so the app, the art checker and
// the demo-video renderer all use exactly the same code.
import { type GameMap, allWallEdges, parseEdge, cell, SEE_THROUGH_DOORS } from '../engine/map';
import type { Token, AreaTemplate } from '../engine/game';
import { objectById } from '../library/objects';
import { creatureById } from '../library/creatures';
import { objectSprite, tokenSprite, pxBucket } from '../library/art/sprites';
import { FAMILY_RING } from '../library/art/types';
import { mapLights } from '../engine/vision';
import { areaCells, templateOutline } from '../engine/areas';
import { drawGround, setGroundCanvasFactory, groundMat } from './ground';
import { terrainById } from '../library/terrain';

export const CELL = 48;
type G = CanvasRenderingContext2D;
type Img = CanvasImageSource & { width: number; height: number };

export interface FloorArt {
  /** The floor picture for a material, if it has loaded. */
  image(id: string): Img | undefined;
  /** How many squares one picture covers along a side. */
  squares(id: string): number;
}

export type SceneToken = Token & { hpLabel?: string };

export interface SceneOptions {
  map: GameMap;
  role: 'gm' | 'player';
  tokens: SceneToken[];
  /** World view rectangle in squares, for culling. */
  view: { x0: number; y0: number; x1: number; y1: number };
  /** A picture drawn over the whole map (Universal VTT imports). */
  backdrop?: CanvasImageSource;
  /** Screen pixels per world pixel (camera zoom times device pixel ratio). */
  scale: number;
  floors?: FloorArt;
  revealed?: Set<number>;
  /** Squares the party can see now (dynamic lighting). */
  visible?: Set<number>;
  /** Light level per square ('0','1','2'). */
  lit?: string;
  /** GM: shade what players can't see. */
  showFog?: boolean;
  currentTokenId?: string;
  selectedTokenId?: string;
  selectedTokenIds?: string[];
  myTokenId?: string;
  /** Where to draw a token while it is being dragged. */
  tokenPos?: (t: SceneToken) => [number, number];
  templates?: AreaTemplate[];
  highlight?: [number, number][];
  selectedPropId?: string;
  /** GM: show room names. */
  roomLabels?: boolean;
}

export const WALL_STYLES: Record<string, { body: string; edge: string; hi: string; w: number }> = {
  stone: { body: '#4c4844', edge: '#151210', hi: '#8a8278', w: 0.24 },
  brick: { body: '#6e3426', edge: '#1f0f0a', hi: '#b06a52', w: 0.24 },
  wood: { body: '#5a3a20', edge: '#1c120a', hi: '#9a6a3e', w: 0.2 },
  cave: { body: '#3a342e', edge: '#120f0c', hi: '#6c6155', w: 0.26 },
  hedge: { body: '#2f4a22', edge: '#121d0c', hi: '#5c8a3e', w: 0.3 },
};

const hash = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/** Size of a placed object after rotation, in squares. */
export function propSize(kind: string, rot: number): [number, number] {
  const d = objectById(kind);
  const w = d?.w ?? 1, h = d?.h ?? 1;
  return ((rot % 360) + 360) % 180 ? [h, w] : [w, h];
}

function drawGrid(g: G, o: SceneOptions) {
  const { map: m, view } = o;
  if (CELL * o.scale < 8) return; // too small to read; it would only grey the map
  g.strokeStyle = m.ambient === 'bright' && m.theme !== 'cave' ? 'rgba(20,14,8,0.22)' : 'rgba(0,0,0,0.28)';
  g.lineWidth = Math.max(0.6, 1.1 / Math.max(o.scale, 0.4));
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < m.cols && y < m.rows && m.cells[y * m.cols + x] > 0;
  g.beginPath();
  // one line per run of open squares, not one box per square
  for (let y = view.y0; y <= view.y1; y++) {
    let start = -1;
    for (let x = view.x0; x <= view.x1; x++) {
      const e = x < view.x1 && (on(x, y) || on(x, y - 1));
      if (e && start < 0) start = x;
      else if (!e && start >= 0) { g.moveTo(start * CELL, y * CELL); g.lineTo(x * CELL, y * CELL); start = -1; }
    }
  }
  for (let x = view.x0; x <= view.x1; x++) {
    let start = -1;
    for (let y = view.y0; y <= view.y1; y++) {
      const e = y < view.y1 && (on(x, y) || on(x - 1, y));
      if (e && start < 0) start = y;
      else if (!e && start >= 0) { g.moveTo(x * CELL, start * CELL); g.lineTo(x * CELL, y * CELL); start = -1; }
    }
  }
  g.stroke();
}

/** Clip to the open squares in view, one rectangle per run. */
function clipOpen(g: G, o: SceneOptions) {
  const { map: m, view } = o;
  g.beginPath();
  for (let y = view.y0; y < view.y1; y++) {
    let start = -1;
    for (let x = view.x0; x <= view.x1; x++) {
      const e = x < view.x1 && m.cells[y * m.cols + x] > 0;
      if (e && start < 0) start = x;
      else if (!e && start >= 0) { g.rect(start * CELL - 0.5, y * CELL - 0.5, (x - start) * CELL + 1, CELL + 1); start = -1; }
    }
  }
  g.clip();
}

function edgeLine(k: string): [number, number, number, number] {
  const { t, x, y } = parseEdge(k);
  return t === 'h' ? [x * CELL, y * CELL, (x + 1) * CELL, y * CELL] : [x * CELL, y * CELL, x * CELL, (y + 1) * CELL];
}

const wallMemo = new WeakMap<number[], { walls: string[]; doors: object; kinds: object | undefined; mats: string[] | undefined; list: string[] }>();
/** Wall edges to draw, worked out once per map change. The map's own border isn't walled on open ground. */
function wallList(m: GameMap) {
  const hit = wallMemo.get(m.cells);
  if (hit && hit.walls === m.walls && hit.doors === m.doors && hit.kinds === m.wallKinds && hit.mats === m.mats) return hit.list;
  const natural = (x: number, y: number) => {
    const v = cell(m, x, y);
    return v > 0 && !!terrainById(groundMat(m, y * m.cols + x, v))?.z;
  };
  const list = allWallEdges(m).filter((k) => {
    const { t, x, y } = parseEdge(k);
    if (t === 'h' && (y === 0 || y === m.rows)) return !natural(x, y === 0 ? 0 : m.rows - 1);
    if (t === 'v' && (x === 0 || x === m.cols)) return !natural(x === 0 ? 0 : m.cols - 1, y);
    return true;
  });
  wallMemo.set(m.cells, { walls: m.walls, doors: m.doors, kinds: m.wallKinds, mats: m.mats, list });
  return list;
}

function drawWalls(g: G, o: SceneOptions) {
  const m = o.map;
  let walls = wallList(m);
  if (o.role === 'player')
    walls = walls.filter((k) => {
      const { t, x, y } = parseEdge(k);
      const a = t === 'h' ? cell(m, x, y - 1) : cell(m, x - 1, y);
      return a !== -1 && cell(m, x, y) !== -1;
    });
  const inView = (k: string) => {
    const { x, y } = parseEdge(k);
    return x >= o.view.x0 - 1 && x <= o.view.x1 + 1 && y >= o.view.y0 - 1 && y <= o.view.y1 + 1;
  };
  walls = walls.filter((k) => !m.doors[k] && inView(k));
  const st = WALL_STYLES[m.wallStyle ?? (m.theme === 'cave' ? 'cave' : m.theme === 'wood' ? 'wood' : 'stone')] ?? WALL_STYLES.stone;
  const rough = (m.wallStyle ?? m.theme) === 'cave';
  const W = st.w * CELL;
  const plain = walls.filter((k) => !m.wallKinds?.[k]);
  const path = (list: string[], jitter: number) => {
    g.beginPath();
    for (const k of list) {
      const [x1, y1, x2, y2] = edgeLine(k);
      if (!jitter) {
        const ex = (x2 - x1) / CELL * (W / 2), ey = (y2 - y1) / CELL * (W / 2);
        g.moveTo(x1 - ex, y1 - ey);
        g.lineTo(x2 + ex, y2 + ey);
      } else {
        const j1 = (hash(x1, y1) - 0.5) * jitter, j2 = (hash(x2, y2) - 0.5) * jitter;
        const jm = (hash(x1 + x2, y1 * 3 + y2) - 0.5) * jitter * 1.4;
        const nx = (y2 - y1) / CELL, ny = (x1 - x2) / CELL;
        g.moveTo(x1 + nx * j1, y1 + ny * j1);
        g.quadraticCurveTo((x1 + x2) / 2 + nx * jm, (y1 + y2) / 2 + ny * jm, x2 + nx * j2, y2 + ny * j2);
      }
    }
  };
  g.save();
  g.lineCap = rough ? 'round' : 'square';
  g.lineJoin = 'round';
  // drop shadow onto the floor
  g.strokeStyle = 'rgba(0,0,0,0.35)';
  g.lineWidth = W + 6;
  g.translate(2, 3);
  path(plain, rough ? 10 : 0);
  g.stroke();
  g.translate(-2, -3);
  g.strokeStyle = st.edge;
  g.lineWidth = W + 3;
  path(plain, rough ? 10 : 0);
  g.stroke();
  g.strokeStyle = st.body;
  g.lineWidth = W;
  path(plain, rough ? 10 : 0);
  g.stroke();
  g.strokeStyle = st.hi;
  g.lineWidth = Math.max(1.5, W * 0.25);
  g.setLineDash(rough ? [] : [CELL * 0.42, CELL * 0.08]);
  path(plain, rough ? 10 : 0);
  g.stroke();
  g.setLineDash([]);
  // windows, bars, low walls
  for (const k of walls) {
    const kind = m.wallKinds?.[k];
    if (!kind) continue;
    const [x1, y1, x2, y2] = edgeLine(k);
    g.lineCap = 'butt';
    if (kind === 'window') {
      g.strokeStyle = st.edge;
      g.lineWidth = W + 3;
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      g.strokeStyle = st.body;
      g.lineWidth = W;
      g.stroke();
      g.strokeStyle = '#9fd3ef';
      g.lineWidth = W * 0.42;
      const ix = (x2 - x1) * 0.12, iy = (y2 - y1) * 0.12;
      g.beginPath(); g.moveTo(x1 + ix, y1 + iy); g.lineTo(x2 - ix, y2 - iy); g.stroke();
    } else if (kind === 'bars') {
      g.strokeStyle = '#2b2b2b';
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      g.fillStyle = '#6b6b6b';
      for (let t = 0.1; t < 1; t += 0.2) {
        g.beginPath();
        g.arc(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, 3.2, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#111';
        g.lineWidth = 1;
        g.stroke();
      }
    } else if (kind === 'low') {
      g.strokeStyle = st.edge;
      g.lineWidth = W * 0.7;
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      g.strokeStyle = st.hi;
      g.lineWidth = W * 0.35;
      g.stroke();
    } else {
      g.strokeStyle = 'rgba(160,200,255,0.55)';
      g.lineWidth = W * 0.5;
      g.setLineDash([6, 5]);
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      g.setLineDash([]);
    }
  }
  g.restore();
}

function drawDoors(g: G, o: SceneOptions) {
  const m = o.map;
  const st = WALL_STYLES[m.wallStyle ?? (m.theme === 'cave' ? 'cave' : m.theme === 'wood' ? 'wood' : 'stone')] ?? WALL_STYLES.stone;
  for (const [k, state] of Object.entries(m.doors)) {
    const { t, x, y } = parseEdge(k);
    if (x < o.view.x0 - 1 || x > o.view.x1 + 1 || y < o.view.y0 - 1 || y > o.view.y1 + 1) continue;
    const style = m.doorStyles?.[k] ?? (state === 'secret' ? 'door-secret' : 'door-wood');
    const cx = t === 'h' ? (x + 0.5) * CELL : x * CELL;
    const cy = t === 'h' ? y * CELL : (y + 0.5) * CELL;
    g.save();
    g.translate(cx, cy);
    if (t === 'v') g.rotate(Math.PI / 2);
    const H = CELL / 2, T = st.w * CELL;
    // jambs
    g.fillStyle = st.edge;
    g.fillRect(-H - 3, -T / 2 - 1.5, 9, T + 3);
    g.fillRect(H - 6, -T / 2 - 1.5, 9, T + 3);
    g.fillStyle = st.body;
    g.fillRect(-H - 1.5, -T / 2, 6, T);
    g.fillRect(H - 4.5, -T / 2, 6, T);
    if (state === 'secret') {
      g.fillStyle = st.body;
      g.fillRect(-H, -T / 2, CELL, T);
      if (o.role === 'gm') {
        g.setLineDash([5, 4]);
        g.strokeStyle = '#c084fc';
        g.lineWidth = 2.5;
        g.strokeRect(-H + 5, -T / 2 - 3, CELL - 10, T + 6);
        g.setLineDash([]);
      }
      g.restore();
      continue;
    }
    const leaf = (len: number, flip = 1) => {
      const L = len;
      if (style === 'portcullis' || style === 'bars') {
        g.fillStyle = '#2a2a2a';
        g.fillRect(0, -2.5, L * flip, 5);
        for (let i = 4; i < L; i += 7) {
          g.fillStyle = '#7a7a7a';
          g.beginPath();
          g.arc(i * flip, 0, 2.6, 0, Math.PI * 2);
          g.fill();
        }
        return;
      }
      const iron = style === 'door-iron';
      const base = iron ? '#6d7177' : style === 'door-double' ? '#7a4a24' : '#835227';
      const grd = g.createLinearGradient(0, -6, 0, 6);
      grd.addColorStop(0, iron ? '#a3a8ae' : '#a9713e');
      grd.addColorStop(0.5, base);
      grd.addColorStop(1, iron ? '#3d4045' : '#4a2c12');
      g.fillStyle = grd;
      const lx = Math.min(0, L * flip), lw = Math.abs(L);
      g.fillRect(lx, -6, lw, 12);
      g.strokeStyle = '#1b120a';
      g.lineWidth = 1.6;
      g.strokeRect(lx, -6, lw, 12);
      if (iron) {
        g.fillStyle = '#2b2d30';
        for (let i = 4; i < lw; i += 8) {
          g.beginPath(); g.arc(lx + i, -3, 1.3, 0, Math.PI * 2); g.fill();
          g.beginPath(); g.arc(lx + i, 3, 1.3, 0, Math.PI * 2); g.fill();
        }
      } else {
        g.strokeStyle = 'rgba(40,20,5,0.55)';
        g.lineWidth = 1;
        for (let i = lw / 4; i < lw - 1; i += lw / 4) {
          g.beginPath(); g.moveTo(lx + i, -6); g.lineTo(lx + i, 6); g.stroke();
        }
        g.fillStyle = '#2b2b2b';
        g.fillRect(lx + 3, -6, 3, 12);
        g.fillRect(lx + lw - 6, -6, 3, 12);
      }
    };
    const open = state === 'open';
    const span = CELL - 10;
    if (open) {
      if (style === 'portcullis') {
        // raised: just a shadow line
        g.strokeStyle = 'rgba(0,0,0,0.5)';
        g.lineWidth = 2;
        g.setLineDash([3, 3]);
        g.beginPath(); g.moveTo(-H + 5, 0); g.lineTo(H - 5, 0); g.stroke();
        g.setLineDash([]);
      } else if (style === 'door-double') {
        g.save(); g.translate(-H + 5, 0); g.rotate(-Math.PI / 2 + 0.15); leaf(span / 2); g.restore();
        g.save(); g.translate(H - 5, 0); g.rotate(Math.PI / 2 - 0.15); leaf(span / 2, -1); g.restore();
      } else {
        g.save();
        g.translate(-H + 5, 0);
        g.rotate(-Math.PI / 2 + 0.12);
        leaf(span);
        g.restore();
        g.strokeStyle = 'rgba(255,240,200,0.25)';
        g.lineWidth = 1;
        g.beginPath();
        g.arc(-H + 5, 0, span, -Math.PI / 2, 0);
        g.stroke();
      }
    } else if (style === 'door-double') {
      g.save(); g.translate(-H + 5, 0); leaf(span / 2); g.restore();
      g.save(); g.translate(H - 5, 0); leaf(span / 2, -1); g.restore();
    } else {
      g.save(); g.translate(-H + 5, 0); leaf(span); g.restore();
    }
    if (state === 'locked' && o.role === 'gm') {
      g.fillStyle = '#f5c542';
      g.strokeStyle = '#3a2a00';
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(0, 0, 4.5, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }
    g.restore();
  }
}

function drawProps(g: G, o: SceneOptions, layer: 'floor' | 'props' | 'overhead') {
  const m = o.map;
  const need = pxBucket(CELL * o.scale);
  for (const pr of m.props) {
    const d = objectById(pr.kind);
    const lay = d?.layer ?? 'props';
    if (lay !== layer) continue;
    const [w, h] = propSize(pr.kind, pr.rot);
    if (pr.x + w < o.view.x0 || pr.x > o.view.x1 || pr.y + h < o.view.y0 || pr.y > o.view.y1) continue;
    const cx = (pr.x + w / 2) * CELL, cy = (pr.y + h / 2) * CELL;
    g.globalAlpha = pr.gmOnly ? 0.55 : layer === 'overhead' ? 0.92 : 1;
    if (!d) {
      g.fillStyle = 'rgba(80,60,40,0.8)';
      g.beginPath();
      g.arc(cx, cy, CELL * 0.35, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fff';
      g.font = `bold ${CELL * 0.4}px system-ui, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('?', cx, cy + 1);
    } else {
      const seed = Math.floor(hash(pr.x * 7 + 1, pr.y * 13 + 5) * 4);
      const sp = objectSprite(d, pr.v ?? 0, need, ((pr.rot % 360) + 360) % 360, seed);
      const k = (CELL / sp.px) * (pr.s && pr.s > 0.5 && pr.s < 1.6 ? pr.s : 1);
      g.drawImage(sp.canvas, cx + sp.ox * k, cy + sp.oy * k, sp.canvas.width * k, sp.canvas.height * k);
    }
    if (pr.gmOnly && o.role === 'gm') {
      g.globalAlpha = 1;
      g.strokeStyle = '#c084fc';
      g.setLineDash([4, 3]);
      g.lineWidth = 1.5;
      g.strokeRect(pr.x * CELL + 2, pr.y * CELL + 2, w * CELL - 4, h * CELL - 4);
      g.setLineDash([]);
    }
    if (pr.id === o.selectedPropId) {
      g.globalAlpha = 1;
      g.strokeStyle = '#ffd25a';
      g.lineWidth = 2.5;
      g.strokeRect(pr.x * CELL + 1, pr.y * CELL + 1, w * CELL - 2, h * CELL - 2);
    }
    g.globalAlpha = 1;
  }
}

/** Warm glow from every light the viewer knows about. */
function drawGlows(g: G, o: SceneOptions) {
  const m = o.map;
  const lights = mapLights(m);
  for (const t of o.tokens) if (t.light) lights.push({ x: t.x + t.size / 2, y: t.y + t.size / 2, bright: t.light.bright, dim: t.light.dim, color: '#ffcf80' });
  if (!lights.length) return;
  const strength = m.ambient === 'bright' ? 0.1 : m.ambient === 'dim' ? 0.2 : 0.28;
  g.save();
  // light lands on floors only, never on the rock around them
  clipOpen(g, o);
  g.globalCompositeOperation = 'lighter';
  for (const L of lights) {
    const r = ((L.bright + L.dim) / 5) * CELL;
    const cx = L.x * CELL, cy = L.y * CELL;
    if (cx + r < o.view.x0 * CELL || cx - r > o.view.x1 * CELL || cy + r < o.view.y0 * CELL || cy - r > o.view.y1 * CELL) continue;
    const grd = g.createRadialGradient(cx, cy, 2, cx, cy, r);
    grd.addColorStop(0, hexA(L.color, strength));
    grd.addColorStop(0.5, hexA(L.color, strength * 0.45));
    grd.addColorStop(1, hexA(L.color, 0));
    g.fillStyle = grd;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  g.restore();
}

function hexA(hex: string, a: number) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
}

let shadeCanvas: { c: HTMLCanvasElement; w: number; h: number } | null = null;
let makeCanvas: (w: number, h: number) => HTMLCanvasElement = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};
export function setSceneCanvasFactory(f: (w: number, h: number) => unknown) {
  makeCanvas = f as (w: number, h: number) => HTMLCanvasElement;
  shadeCanvas = null;
  setGroundCanvasFactory(f);
}

/**
 * Darkness: squares out of sight are dark, explored squares are dimmed, dim light is shaded.
 * Drawn on a small canvas (4 px per square) and scaled up smoothly so the edges are soft.
 */
let shadeKey: unknown[] = [];
function drawDarkness(g: G, o: SceneOptions) {
  const m = o.map;
  const player = o.role === 'player';
  if (!player && !o.showFog) return;
  // big maps use 2 px per square so the picture stays small
  const R = m.cols * m.rows > 40000 ? 2 : 4;
  const w = m.cols * R, h = m.rows * R;
  const key = [m.cells, o.visible, o.revealed, o.lit, o.role, o.showFog, R];
  const same = shadeCanvas && shadeCanvas.w === w && shadeCanvas.h === h && key.every((k, i) => k === shadeKey[i]);
  if (!same) {
    if (!shadeCanvas || shadeCanvas.w !== w || shadeCanvas.h !== h) shadeCanvas = { c: makeCanvas(w, h), w, h };
    shadeKey = key;
    const sg = shadeCanvas.c.getContext('2d')!;
    const im = sg.createImageData(w, h);
    const d = im.data;
    const [cr, cg, cb] = player ? [6, 6, 14] : [14, 14, 40];
    for (let y = 0; y < m.rows; y++)
      for (let x = 0; x < m.cols; x++) {
        const i = y * m.cols + x;
        const v = m.cells[i];
        let a = 0;
        if (player) {
          if (v === -1) a = 1; // never seen
          if (o.visible && !o.visible.has(i)) a = 0.62;
          else if (o.lit) a = o.lit[i] === '2' ? 0 : o.lit[i] === '1' ? 0.3 : 0.48;
        } else {
          if (v <= 0) continue;
          if (o.revealed && !o.revealed.has(i)) a = 0.5;
          else if (o.visible && !o.visible.has(i)) a = 0.22;
        }
        if (!a) continue;
        const av = Math.round(a * 255);
        for (let yy = 0; yy < R; yy++) {
          let j = ((y * R + yy) * w + x * R) * 4;
          for (let xx = 0; xx < R; xx++, j += 4) { d[j] = cr; d[j + 1] = cg; d[j + 2] = cb; d[j + 3] = av; }
        }
      }
    sg.putImageData(im, 0, 0);
  }
  g.save();
  g.imageSmoothingEnabled = true;
  g.drawImage(shadeCanvas!.c, 0, 0, w, h, 0, 0, m.cols * CELL, m.rows * CELL);
  g.restore();
}

function drawTemplates(g: G, o: SceneOptions) {
  for (const t of o.templates ?? []) {
    const cells = areaCells(t, o.map.cols, o.map.rows);
    g.fillStyle = hexA(t.color, 0.22);
    for (const [x, y] of cells) g.fillRect(x * CELL, y * CELL, CELL, CELL);
    g.save();
    g.strokeStyle = hexA(t.color, 0.95);
    g.lineWidth = 2.5;
    g.setLineDash([8, 5]);
    templateOutline(g, t, CELL);
    g.stroke();
    g.setLineDash([]);
    g.restore();
    if (t.label) {
      g.font = `bold ${Math.max(11, 13 / Math.min(1, o.scale))}px system-ui, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const label = `${t.label} · ${t.size} ft`;
      const w = g.measureText(label).width + 10;
      g.fillStyle = 'rgba(0,0,0,0.7)';
      g.fillRect(t.x * CELL - w / 2, t.y * CELL - 30, w, 18);
      g.fillStyle = '#fff';
      g.fillText(label, t.x * CELL, t.y * CELL - 21);
    }
  }
}

function drawTokens(g: G, o: SceneOptions) {
  const sorted = [...o.tokens].sort((a, b) => (a.kind === 'pc' ? 1 : 0) - (b.kind === 'pc' ? 1 : 0) || b.size - a.size);
  const sel = new Set(o.selectedTokenIds ?? (o.selectedTokenId ? [o.selectedTokenId] : []));
  for (const t of sorted) {
    const [tx, ty] = o.tokenPos ? o.tokenPos(t) : [t.x, t.y];
    if (tx + t.size < o.view.x0 || tx > o.view.x1 || ty + t.size < o.view.y0 || ty > o.view.y1) continue;
    const D = t.size * CELL;
    const cx = tx * CELL + D / 2, cy = ty * CELL + D / 2;
    const r = D / 2 - 3;
    g.globalAlpha = t.hidden ? 0.45 : 1;
    if (t.id === o.currentTokenId) {
      const grd = g.createRadialGradient(cx, cy, r * 0.7, cx, cy, r + 10);
      grd.addColorStop(0, 'rgba(255,215,0,0.55)');
      grd.addColorStop(1, 'rgba(255,215,0,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(cx, cy, r + 10, 0, Math.PI * 2);
      g.fill();
    }
    const def = t.art ? creatureById(t.art) : undefined;
    const down = t.hp === 0;
    if (def) {
      const ring = sel.has(t.id) ? '#ffd25a' : t.kind === 'pc' ? t.color : FAMILY_RING[def.family];
      const diam = pxBucket(2 * r * o.scale);
      const sp = tokenSprite(def, t.artV ?? 0, diam, ring);
      const k = (2 * r) / sp.px;
      g.drawImage(sp.canvas, cx + sp.ox * k, cy + sp.oy * k, sp.canvas.width * k, sp.canvas.height * k);
    } else {
      g.fillStyle = 'rgba(0,0,0,0.45)';
      g.beginPath();
      g.arc(cx + 2, cy + 3, r, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = t.color;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = sel.has(t.id) ? 4 : 2.5;
      g.strokeStyle = sel.has(t.id) ? '#ffd25a' : t.kind === 'monster' ? '#2a0d0d' : '#fdf6e3';
      g.stroke();
      g.fillStyle = '#fff';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `bold ${Math.max(12, r * 0.75)}px system-ui, sans-serif`;
      g.fillText(initials(t.name.replace(/\s*\d+$/, '')), cx, cy + 1);
    }
    // monster number badge, so "Goblin 2" is easy to call out
    const num = t.kind !== 'pc' ? /(\d+)$/.exec(t.name)?.[1] : undefined;
    if (num) {
      const br = Math.max(7, r * 0.3);
      g.fillStyle = '#1b1410';
      g.beginPath();
      g.arc(cx + r * 0.72, cy - r * 0.72, br, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#fdf6e3';
      g.lineWidth = 1.5;
      g.stroke();
      g.fillStyle = '#fff';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `bold ${br * 1.2}px system-ui, sans-serif`;
      g.fillText(num, cx + r * 0.72, cy - r * 0.72 + 0.5);
    }
    if (down) {
      g.fillStyle = 'rgba(30,30,30,0.55)';
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(150,20,20,0.95)';
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx - r * 0.55, cy - r * 0.55);
      g.lineTo(cx + r * 0.55, cy + r * 0.55);
      g.moveTo(cx + r * 0.55, cy - r * 0.55);
      g.lineTo(cx - r * 0.55, cy + r * 0.55);
      g.stroke();
      g.lineCap = 'butt';
    }
    // hp bar
    if (t.maxHp > 0) {
      const w = D - 10;
      const bx = cx - w / 2, by = ty * CELL + D - 5;
      g.fillStyle = 'rgba(0,0,0,0.75)';
      g.fillRect(bx, by, w, 6);
      const f = Math.max(0, Math.min(1, t.hp / t.maxHp));
      g.fillStyle = f > 0.5 ? '#4ade80' : f > 0.25 ? '#facc15' : '#ef4444';
      g.fillRect(bx + 1, by + 1, (w - 2) * f, 4);
    } else if (t.hpLabel) {
      g.font = 'bold 11px system-ui, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const w = g.measureText(t.hpLabel).width + 8;
      g.fillStyle = t.hpLabel === 'Down' ? 'rgba(0,0,0,0.85)' : 'rgba(150,20,20,0.92)';
      g.fillRect(cx - w / 2, ty * CELL + D - 11, w, 14);
      g.fillStyle = '#fff';
      g.fillText(t.hpLabel, cx, ty * CELL + D - 4);
    }
    t.conditions.slice(0, 4).forEach((_, i) => {
      g.fillStyle = '#a855f7';
      g.strokeStyle = '#1b1410';
      g.lineWidth = 1;
      g.beginPath();
      g.arc(tx * CELL + 7 + i * 9, ty * CELL + 7, 4, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    });
    g.globalAlpha = 1;
    if (t.id === o.myTokenId || sel.has(t.id)) {
      g.font = `bold ${Math.max(10, 12 / Math.min(1, o.scale))}px system-ui, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const w = g.measureText(t.name).width + 10;
      const lh = 16 / Math.min(1, o.scale);
      g.fillStyle = 'rgba(0,0,0,0.72)';
      g.fillRect(cx - w / 2, ty * CELL + D + 2, w, lh);
      g.fillStyle = '#fff';
      g.fillText(t.name, cx, ty * CELL + D + 2 + lh / 2);
    }
  }
}

function drawLabels(g: G, o: SceneOptions) {
  const m = o.map;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (o.role === 'gm') {
    for (const n of m.notes) {
      g.font = `${CELL * 0.42}px system-ui, "Apple Color Emoji", sans-serif`;
      g.fillText('📝', (n.x + 0.8) * CELL, (n.y + 0.22) * CELL);
    }
  }
  if (o.roomLabels && m.rooms) {
    for (const r of m.rooms) {
      const [lx, ly] = r.labelAt ?? [r.rects[0][0] + r.rects[0][2] / 2, r.rects[0][1] + r.rects[0][3] / 2];
      g.font = `600 ${Math.max(11, 13 / Math.min(1, o.scale))}px Georgia, serif`;
      const w = g.measureText(r.name).width + 12;
      g.fillStyle = 'rgba(20,14,8,0.7)';
      g.fillRect(lx * CELL - w / 2, ly * CELL - 10, w, 20);
      g.fillStyle = '#f3e7c9';
      g.fillText(r.name, lx * CELL, ly * CELL + 0.5);
    }
  }
}

/** On a picture map the walls are in the picture: the GM sees thin lines so they can check the import. */
function drawWallLines(g: G, o: SceneOptions) {
  if (o.role !== 'gm') return;
  g.strokeStyle = 'rgba(80,200,255,0.75)';
  g.lineWidth = 2;
  g.beginPath();
  for (const k of o.map.walls) {
    if (o.map.doors[k]) continue;
    const [x1, y1, x2, y2] = edgeLine(k);
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
  }
  g.stroke();
}

/** Draw the whole scene. The caller sets the transform so 1 unit = 1 world pixel (CELL per square). */
/** Draws the scene. Returns true when parts of the ground are still being prepared: draw again next frame. */
export function drawScene(g: G, o: SceneOptions): boolean {
  const m = o.map;
  o.view = {
    x0: Math.max(0, Math.floor(o.view.x0)), y0: Math.max(0, Math.floor(o.view.y0)),
    x1: Math.min(m.cols, Math.ceil(o.view.x1)), y1: Math.min(m.rows, Math.ceil(o.view.y1)),
  };
  const pending = drawGround(g, m, o.floors, o.scale, o.view, CELL);
  if (o.backdrop && m.backdrop) g.drawImage(o.backdrop, 0, 0, m.cols * CELL, m.rows * CELL);
  drawProps(g, o, 'floor');
  drawGrid(g, o);
  if (m.backdrop) drawWallLines(g, o);
  else drawWalls(g, o);
  drawDoors(g, o);
  drawProps(g, o, 'props');
  drawGlows(g, o);
  drawProps(g, o, 'overhead');
  drawDarkness(g, o);
  if (o.highlight) {
    g.fillStyle = 'rgba(255,215,0,0.25)';
    for (const [x, y] of o.highlight) g.fillRect(x * CELL, y * CELL, CELL, CELL);
  }
  drawTemplates(g, o);
  drawTokens(g, o);
  drawLabels(g, o);
  return pending;
}

export { SEE_THROUGH_DOORS };

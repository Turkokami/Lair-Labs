// Reusable bust builder for creature tokens: heroes, townsfolk, humanoid monsters, undead and fey.
// Draws a front-facing head and shoulders in a 100 x 100 box (the renderer clips it to a circle).
// Light from the top-left, ink outlines, big readable heads and gear so a token still reads at 40 px.
// All original art, drawn with the Canvas 2D API.
import type { G } from '../art/types';
import { rng, blob, paint, domeFill, litFill, ellipse, circle, poly, shade, mix, alpha, glow, line, rr, gem, INK, LW } from '../art/kit';

export type FaceShape = 'oval' | 'round' | 'square' | 'long' | 'narrow' | 'wide' | 'gaunt' | 'heart';
export type Ears = 'round' | 'elf' | 'long' | 'small' | 'goblin' | 'fin' | 'canine' | 'bear' | 'rat' | 'none';
export type Snout = 'reptile' | 'canine' | 'hyena' | 'rat';
export type EyeStyle = 'normal' | 'big' | 'narrow' | 'solid' | 'glow' | 'hollow' | 'slit' | 'beady' | 'closed' | 'blank' | 'none';
export type Brows = 'calm' | 'angry' | 'raised' | 'worried' | 'heavy' | 'sly' | 'none';
export type Nose = 'small' | 'button' | 'big' | 'hook' | 'flat' | 'long' | 'none';
export type Mouth = 'neutral' | 'smile' | 'grin' | 'snarl' | 'fangs' | 'open' | 'frown' | 'smirk' | 'teeth' | 'maw' | 'none';
export type Hair =
  | 'none' | 'bald' | 'short' | 'slick' | 'long' | 'bob' | 'bun' | 'ponytail' | 'braids' | 'wild' | 'curly' | 'shaggy'
  | 'mohawk' | 'topknot' | 'tufts' | 'stringy' | 'tonsure' | 'flowing' | 'fin' | 'leafy';
export type Beard = 'none' | 'stubble' | 'short' | 'full' | 'long' | 'braided' | 'goatee' | 'mustache' | 'forked';
export type Outfit =
  | 'tunic' | 'robe' | 'leather' | 'mail' | 'plate' | 'scale' | 'bare' | 'gi' | 'doublet' | 'vest' | 'apron' | 'rags'
  | 'leaves' | 'bark' | 'shroud' | 'bandage' | 'ribs' | 'gown' | 'stripes' | 'coat' | 'fur' | 'wisp' | 'none';
export type Hat = 'wizard' | 'feather' | 'tricorn' | 'wide' | 'witch' | 'cap' | 'beanie' | 'straw' | 'turban' | 'mitre' | 'redcap' | 'nemes';
export type Helmet = 'cap' | 'nasal' | 'horned' | 'winged' | 'great' | 'crest' | 'kettle' | 'spiked';
export type Crown = 'crown' | 'circlet' | 'wreath' | 'flowers' | 'antlers' | 'bones' | 'shells';
export type Horns = 'curl' | 'ram' | 'straight' | 'goat' | 'ridge' | 'nubs';
export type Wings = 'insect' | 'butterfly' | 'bat';
export type Held =
  | 'sword' | 'scimitar' | 'dagger' | 'axe' | 'greataxe' | 'mace' | 'morningstar' | 'club' | 'spear' | 'trident' | 'staff' | 'gnarled'
  | 'bow' | 'lute' | 'shield' | 'round-shield' | 'book' | 'orb' | 'flame' | 'wand' | 'torch' | 'lantern' | 'mug' | 'purse'
  | 'scroll' | 'fist' | 'claws' | 'pipes' | 'sickle';
export type Fx = 'sparkle' | 'eldritch' | 'halo' | 'blink' | 'fumes' | 'drips' | 'motes' | 'aura' | 'frost';

export interface BustOpts {
  /** Skin, scales, fur or bone colour. */
  skin: string;
  face?: FaceShape;
  /** A muzzle in place of a human nose and mouth. */
  snout?: Snout;
  /** Lighter colour for a muzzle, belly scales or underside. */
  under?: string;
  /** Head half width, half height and centre y. Defaults 19, 23, 44. */
  headW?: number;
  headH?: number;
  headY?: number;
  /** Shoulder width factor (1 = normal, 0.8 small folk, 1.2 hulking). */
  shoulders?: number;
  ears?: Ears;
  /** Draw ears over a raised hood (elf and goblin ears poke out). */
  earsOver?: boolean;
  eyes?: string;
  eyeStyle?: EyeStyle;
  /** Glow colour for glowing or hollow eyes, and magic effects. */
  glowColor?: string;
  /** Dark rings around the eyes (undead, hags). */
  sunken?: boolean;
  brows?: Brows;
  nose?: Nose;
  mouth?: Mouth;
  tusks?: 'small' | 'big';
  horns?: Horns;
  hornColor?: string;
  /** Scale texture on the face. */
  scales?: boolean;
  hair?: Hair;
  hairColor?: string;
  beard?: Beard;
  beardColor?: string;
  scar?: boolean;
  eyepatch?: boolean;
  freckles?: boolean;
  blush?: boolean;
  /** War paint band across the eyes in this colour. */
  warpaint?: string;
  /** Stone-skin markings in this colour (goliath). */
  marks?: string;
  /** Spots on the head (hyena, warts). */
  spots?: string;
  /** Undead rot 0..1 and pallor 0..1. */
  rot?: number;
  pallor?: number;
  /** A skull instead of a face. */
  skull?: boolean;
  /** Mummy wrappings over the face. */
  wraps?: boolean;
  /** No face at all, just darkness and eyes (wraiths, shadows). */
  noFace?: boolean;
  outfit?: Outfit;
  outfitColor?: string;
  /** Trim, tabard or accent colour on clothes. */
  trim?: string;
  metal?: string;
  cloak?: string;
  hood?: 'up' | 'down';
  hoodColor?: string;
  /** Hood made of chain mail (a coif). */
  coif?: boolean;
  mantle?: 'fur' | 'leaves' | 'feathers' | 'gold';
  mantleColor?: string;
  collar?: 'high' | 'ruff';
  collarColor?: string;
  hat?: Hat;
  hatColor?: string;
  /** Feather, band or plume colour on hats and helmets. */
  plume?: string;
  helmet?: Helmet;
  /** Visor glow inside a great helm. */
  visorGlow?: string;
  crown?: Crown;
  crownColor?: string;
  bandana?: string;
  headband?: string;
  /** Cloth mask over the lower face. */
  mask?: string;
  /** Holy symbol pendant colour. */
  holy?: string;
  /** Bead or tooth necklace colour. */
  beads?: string;
  earring?: string;
  held?: Held;
  heldSide?: 'L' | 'R';
  /** Second item on the other side. */
  held2?: Held;
  /** Colour for the held item's accent (staff gem, book cover, shield face). */
  heldColor?: string;
  quiver?: boolean;
  wings?: Wings;
  wingColor?: string;
  fx?: Fx;
  fx2?: Fx;
  /** Translucency for ghosts, 0..1 (1 = solid). */
  ghost?: number;
}

/** Shared state while one bust is drawn. */
interface B {
  g: G;
  r: () => number;
  o: BustOpts;
  HX: number;
  HY: number;
  hw: number;
  hh: number;
  ey: number;
  top: number;
  sw: number;
  skin: string;
  hair: string;
  accent: string;
}

// ---------------------------------------------------------------- helpers

/** Points along a smooth line through pts (quadratic through midpoints). */
function smoothLine(pts: number[][], steps = 6): number[][] {
  if (pts.length < 3) {
    const out: number[][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      out.push([pts[0][0] + (pts[1][0] - pts[0][0]) * t, pts[0][1] + (pts[1][1] - pts[0][1]) * t]);
    }
    return out;
  }
  const out: number[][] = [pts[0]];
  let start = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const c = pts[i];
    const end = i === pts.length - 2 ? pts[i + 1] : [(c[0] + pts[i + 1][0]) / 2, (c[1] + pts[i + 1][1]) / 2];
    for (let s = 1; s <= steps; s++) {
      const t = s / steps, u = 1 - t;
      out.push([u * u * start[0] + 2 * u * t * c[0] + t * t * end[0], u * u * start[1] + 2 * u * t * c[1] + t * t * end[1]]);
    }
    start = end;
  }
  return out;
}

/** A tapered shape along a smooth centre line: width w0 at the start, w1 at the end. Leaves a closed path. */
export function taper(g: G, pts: number[][], w0: number, w1: number, steps = 4) {
  const c = smoothLine(pts, steps);
  const L: number[][] = [], R: number[][] = [];
  for (let i = 0; i < c.length; i++) {
    const p = c[i], q = c[Math.min(c.length - 1, i + 1)], o = c[Math.max(0, i - 1)];
    let dx = q[0] - o[0], dy = q[1] - o[1];
    const d = Math.hypot(dx, dy) || 1;
    dx /= d; dy /= d;
    const t = i / (c.length - 1), w = (w0 + (w1 - w0) * t) / 2;
    L.push([p[0] - dy * w, p[1] + dx * w]);
    R.push([p[0] + dy * w, p[1] - dx * w]);
  }
  g.beginPath();
  L.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
  g.closePath();
}

/** An upward flame seen from the front: layered tongues with a hot core. */
export function flameUp(g: G, cx: number, cy: number, s: number, outer = '#e2481b', mid = '#ffb02e', hot = '#fff3b0') {
  glow(g, cx, cy, s * 2.6, mid, 0.5);
  const layer = (k: number, col: string) => {
    g.beginPath();
    g.moveTo(cx, cy - s * 1.9 * k);
    g.bezierCurveTo(cx + s * 0.35 * k, cy - s * 1.1 * k, cx + s * 1.05 * k, cy - s * 0.6 * k, cx + s * 0.95 * k, cy + s * 0.25 * k);
    g.bezierCurveTo(cx + s * 0.85 * k, cy + s * 0.95 * k, cx - s * 0.85 * k, cy + s * 0.95 * k, cx - s * 0.95 * k, cy + s * 0.25 * k);
    g.bezierCurveTo(cx - s * 1.0 * k, cy - s * 0.4 * k, cx - s * 0.5 * k, cy - s * 0.8 * k, cx - s * 0.25 * k, cy - s * 1.2 * k);
    g.quadraticCurveTo(cx - s * 0.05 * k, cy - s * 0.9 * k, cx, cy - s * 1.9 * k);
    g.closePath();
    g.fillStyle = col;
    g.fill();
  };
  layer(1, outer);
  g.strokeStyle = alpha(shade(outer, -0.5), 0.8);
  g.lineWidth = 1;
  g.stroke();
  g.save();
  g.translate(0, s * 0.25);
  layer(0.7, mid);
  layer(0.4, hot);
  g.restore();
}

/** A four-point sparkle. */
export function sparkle(g: G, x: number, y: number, s: number, col: string) {
  g.beginPath();
  g.moveTo(x, y - s);
  g.quadraticCurveTo(x, y, x + s, y);
  g.quadraticCurveTo(x, y, x, y + s);
  g.quadraticCurveTo(x, y, x - s, y);
  g.quadraticCurveTo(x, y, x, y - s);
  g.closePath();
  g.fillStyle = col;
  g.fill();
}

/** A leaf shape centred at x,y pointing along angle a. */
export function leaf(g: G, x: number, y: number, len: number, wid: number, a: number, col: string, lw = 0.9) {
  g.save();
  g.translate(x, y);
  g.rotate(a);
  g.beginPath();
  g.moveTo(-len / 2, 0);
  g.quadraticCurveTo(0, -wid, len / 2, 0);
  g.quadraticCurveTo(0, wid, -len / 2, 0);
  g.closePath();
  paint(g, litFill(g, -len / 2, -wid, len, wid * 2, col, 0.25), alpha(shade(col, -0.65), 0.9), lw);
  if (len >= 13) line(g, -len / 2, 0, len / 2 - 1, 0, alpha(shade(col, -0.5), 0.6), 0.6);
  g.restore();
}

/** A simple closed fist seen from the front. */
export function fist(g: G, x: number, y: number, s: number, col: string) {
  rr(g, x - s * 0.62, y - s * 0.5, s * 1.24, s, s * 0.38);
  paint(g, domeFill(g, x, y, s, col, 0.3), INK, 1.2);
  g.strokeStyle = alpha(shade(col, -0.55), 0.85);
  g.lineWidth = 0.8;
  g.beginPath();
  for (let i = 1; i < 4; i++) {
    const fx = x - s * 0.62 + (s * 1.24 * i) / 4;
    g.moveTo(fx, y - s * 0.48);
    g.lineTo(fx, y - s * 0.12);
  }
  g.stroke();
}

const bodyPath = (b: B) => {
  const { top, sw } = b;
  const w = 44 * sw;
  blob(b.g, [[50 - w - 8, 116], [50 - w - 6, 92], [50 - w + 6, top + 8], [35, top], [65, top], [50 + w - 6, top + 8], [50 + w + 6, 92], [50 + w + 8, 116]]);
};

const FACES: Record<FaceShape, [number, number, number, number, number]> = {
  // top width, cheek width, jaw width, chin width, chin drop
  oval: [0.9, 1.0, 0.84, 0.36, 1.04],
  round: [0.96, 1.06, 1.0, 0.56, 1.0],
  square: [0.96, 1.02, 1.02, 0.7, 1.0],
  long: [0.86, 0.94, 0.8, 0.36, 1.08],
  narrow: [0.88, 0.96, 0.68, 0.22, 1.08],
  wide: [1.0, 1.1, 1.1, 0.74, 0.98],
  gaunt: [0.92, 1.0, 0.62, 0.3, 1.06],
  heart: [1.0, 1.05, 0.72, 0.2, 1.05],
};

function facePath(b: B, grow = 0) {
  const { HX, HY, hw, hh } = b;
  const [tw, cw, jw, chw, cd] = FACES[b.o.face ?? 'oval'];
  const R = [[tw * 0.62, -1.02], [cw, -0.5], [cw, 0.12], [jw, 0.62], [chw, 0.98]];
  const pts = [[0, -1.08], ...R, [0, cd * 1.05], ...R.slice().reverse().map(([x, y]) => [-x, y])];
  const kx = hw * 1.06 + grow, ky = hh * 1.06 + grow;
  blob(b.g, pts.map(([x, y]) => [HX + x * kx, HY + y * ky]));
}

// ---------------------------------------------------------------- back layers

function drawWings(b: B) {
  const { g, o } = b;
  const col = o.wingColor ?? '#bfe8ff';
  for (const s of [-1, 1]) {
    if (o.wings === 'insect') {
      for (const [ang, len, wid] of [[-0.55, 46, 11], [-0.05, 40, 9]] as const) {
        const ax = 50 + s * 10, ay = 68;
        const tx = ax + s * Math.cos(ang) * len, ty = ay + Math.sin(ang) * len;
        g.beginPath();
        g.moveTo(ax, ay);
        g.quadraticCurveTo((ax + tx) / 2 - Math.sin(ang) * wid * s, (ay + ty) / 2 - wid, tx, ty);
        g.quadraticCurveTo((ax + tx) / 2 + Math.sin(ang) * wid * s, (ay + ty) / 2 + wid, ax, ay);
        paint(g, alpha(col, 0.55), alpha(shade(col, -0.6), 0.9), 1.2);
        line(g, ax, ay, tx, ty, alpha(shade(col, -0.5), 0.6), 0.8);
      }
    } else if (o.wings === 'butterfly') {
      blob(g, [[50 + s * 8, 66], [50 + s * 30, 18], [50 + s * 52, 22], [50 + s * 48, 52], [50 + s * 26, 70]]);
      paint(g, domeFill(g, 50 + s * 36, 34, 26, col, 0.3), INK, 1.4);
      circle(g, 50 + s * 38, 36, 6);
      paint(g, alpha(shade(col, 0.6), 0.9), alpha(shade(col, -0.5), 0.8), 1);
      blob(g, [[50 + s * 10, 74], [50 + s * 34, 70], [50 + s * 40, 92], [50 + s * 22, 96]]);
      paint(g, domeFill(g, 50 + s * 28, 82, 16, shade(col, -0.15), 0.3), INK, 1.3);
    } else if (o.wings === 'bat') {
      poly(g, [[50 + s * 12, 70], [50 + s * 34, 20], [50 + s * 54, 30], [50 + s * 46, 46], [50 + s * 54, 56], [50 + s * 42, 64], [50 + s * 48, 78]]);
      paint(g, litFill(g, 50, 20, 54, 60, col, 0.2), INK, 1.4);
    }
  }
}

function drawHalo(b: B, col: string) {
  const { g, HX, HY, hh } = b;
  glow(g, HX, HY - 4, 46, col, 0.6);
  ellipse(g, HX, HY - hh - 4, 20, 5.5);
  g.strokeStyle = alpha(shade(col, 0.4), 0.95);
  g.lineWidth = 3;
  g.stroke();
}

function drawQuiver(b: B) {
  const { g } = b;
  g.save();
  g.translate(22, 66);
  g.rotate(-0.35);
  const cols = ['#e9e1cc', '#b8432f', '#e9e1cc'];
  for (let i = 0; i < 3; i++) {
    const x = -5 + i * 5;
    line(g, x, 6, x, -26, '#6b4a2b', 1.4);
    poly(g, [[x, -22], [x - 3.2, -30], [x, -28], [x + 3.2, -30]]);
    paint(g, cols[i], INK, 0.8);
  }
  rr(g, -9, -10, 18, 40, 4);
  paint(g, litFill(g, -9, -10, 18, 40, '#7a5032', 0.25), INK, LW * 0.8);
  rr(g, -9.5, -11, 19, 5, 2);
  paint(g, '#5a3a22', INK, 1);
  g.restore();
}

function drawLongHairBack(b: B, k = 1) {
  const { g, HX, HY, hw, hh, hair } = b;
  const bot = Math.min(98, HY + hh * 1.6 * k + 6);
  blob(g, [[HX, HY - hh * 1.18], [HX + hw * 1.15, HY - hh * 0.95], [HX + hw * 1.36, HY], [HX + hw * 1.42, HY + hh * 0.9 * k], [HX + hw * 1.25, bot], [HX + hw * 0.6, bot + 3], [HX - hw * 0.6, bot + 3], [HX - hw * 1.25, bot], [HX - hw * 1.42, HY + hh * 0.9 * k], [HX - hw * 1.36, HY], [HX - hw * 1.15, HY - hh * 0.95]]);
  paint(g, domeFill(g, HX - 6, HY, hw * 1.6, shade(hair, -0.18), 0.25), INK, LW);
}

function drawFlowingHairBack(b: B) {
  const { g, HX, HY, hw, hh, hair, r } = b;
  const pts: number[][] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 1.05 + (i / (n - 1)) * Math.PI * 0.9 - Math.PI;
    const wob = 1 + (i % 2) * 0.12 + r() * 0.08;
    pts.push([HX + Math.cos(a - Math.PI / 2) * hw * 2.1 * wob, HY + 6 + Math.sin(a - Math.PI / 2) * hh * 1.55 * wob]);
  }
  pts.push([HX + hw * 2.2, 104], [HX - hw * 2.2, 104]);
  blob(g, pts);
  paint(g, domeFill(g, HX - 8, HY, 52, shade(hair, -0.12), 0.3), INK, LW);
  g.strokeStyle = alpha(shade(hair, 0.35), 0.5);
  g.lineWidth = 1.2;
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.moveTo(HX + s * hw * (0.9 + i * 0.2), HY - hh * 0.6);
      g.quadraticCurveTo(HX + s * hw * (1.9 + i * 0.15), HY + 10, HX + s * hw * (1.5 + i * 0.3), 96);
      g.stroke();
    }
  }
}

function drawHighCollar(b: B) {
  const { g, HX, HY, hw, hh, o } = b;
  const col = o.collarColor ?? o.cloak ?? o.outfitColor ?? '#2b2b30';
  for (const s of [-1, 1]) {
    blob(g, [[HX + s * 6, b.top + 6], [HX + s * hw * 0.9, HY + hh * 0.2], [HX + s * hw * 1.55, HY - hh * 0.35], [HX + s * hw * 1.8, HY + hh * 0.3], [HX + s * hw * 1.5, b.top + 10]]);
    paint(g, litFill(g, HX - hw * 1.8, HY - hh * 0.4, hw * 3.6, hh * 1.8, col, 0.25), INK, LW);
    g.save();
    g.clip();
    blob(g, [[HX + s * 10, b.top + 4], [HX + s * hw * 1.05, HY + hh * 0.25], [HX + s * hw * 1.5, HY - hh * 0.15], [HX + s * hw * 1.55, b.top + 6]]);
    g.fillStyle = alpha(o.trim ?? '#8a1f2a', 0.85);
    g.fill();
    g.restore();
  }
}

// ---------------------------------------------------------------- body and clothes

function drawBody(b: B) {
  const { g, o, r, top, skin } = b;
  const kind = o.outfit ?? 'tunic';
  if (kind === 'none') return;
  if (kind === 'ribs') return drawRibs(b);
  const base = kind === 'bare' ? skin : kind === 'fur' ? (o.outfitColor ?? skin) : (o.outfitColor ?? '#7a5638');
  const metal = o.metal ?? '#9ea4ab';
  const trim = o.trim ?? shade(base, 0.35);
  if (kind === 'wisp') {
    blob(g, [[4, 120], [8, 92], [22, top + 8], [36, top], [64, top], [78, top + 8], [92, 92], [96, 120]]);
    const gr = g.createLinearGradient(0, top, 0, 100);
    gr.addColorStop(0, base);
    gr.addColorStop(0.7, alpha(base, 0.6));
    gr.addColorStop(1, alpha(base, 0));
    paint(g, gr, alpha(INK, 0.5), 1.4);
    g.strokeStyle = alpha(shade(base, 0.4), 0.45);
    g.lineWidth = 1.4;
    for (let i = 0; i < 5; i++) {
      const x = 18 + i * 16 + r() * 4;
      g.beginPath();
      g.moveTo(x, top + 8);
      g.bezierCurveTo(x - 6, top + 16, x + 6, top + 22, x - 2, 100);
      g.stroke();
    }
    return;
  }
  const isMetal = kind === 'plate' || kind === 'mail';
  const fillCol = isMetal ? metal : kind === 'gown' ? skin : base;
  bodyPath(b);
  paint(g, domeFill(g, 38, top + 10, 62, fillCol, isMetal ? 0.4 : 0.22), INK, LW);
  g.save();
  g.clip();
  const neckV = (depth: number, col: string) => {
    poly(g, [[39, top - 2], [50, top + depth], [61, top - 2]]);
    paint(g, col, INK, 1.4);
  };
  const folds = (col: string, n = 3) => {
    g.strokeStyle = alpha(shade(col, -0.5), 0.45);
    g.lineWidth = 1.2;
    for (let i = 0; i < n; i++) {
      const x = 20 + r() * 60;
      g.beginPath();
      g.moveTo(x, top + 12 + r() * 6);
      g.quadraticCurveTo(x + (r() - 0.5) * 8, top + 22, x + (r() - 0.5) * 6, 100);
      g.stroke();
    }
  };
  switch (kind) {
    case 'tunic':
    case 'stripes': {
      if (kind === 'stripes') {
        g.strokeStyle = alpha(o.trim ?? '#f1ece0', 0.9);
        g.lineWidth = 3.4;
        for (let y = top + 7; y < 104; y += 8) {
          g.beginPath(); g.moveTo(0, y); g.lineTo(100, y + 1); g.stroke();
        }
      }
      folds(base);
      neckV(11, shade(skin, -0.12));
      line(g, 39, top - 1, 50, top + 11, trim, 2.2);
      line(g, 61, top - 1, 50, top + 11, trim, 2.2);
      break;
    }
    case 'apron': {
      folds(base, 2);
      neckV(9, shade(skin, -0.12));
      const ap = o.trim ?? '#ece6d6';
      rr(g, 33, top + 14, 34, 40, 4);
      paint(g, litFill(g, 33, top + 14, 34, 40, ap, 0.15), INK, 1.4);
      line(g, 34, top + 15, 28, top + 2, ap, 3);
      line(g, 66, top + 15, 72, top + 2, ap, 3);
      rr(g, 42, top + 22, 16, 10, 2);
      paint(g, shade(ap, -0.08), alpha(INK, 0.6), 1);
      break;
    }
    case 'robe':
    case 'gi':
    case 'shroud': {
      folds(base, 4);
      const inner = kind === 'gi' ? shade(skin, -0.1) : shade(base, -0.4);
      poly(g, [[38, top - 2], [50, top + (kind === 'gi' ? 14 : 34)], [62, top - 2]]);
      paint(g, inner, null);
      const band = kind === 'gi' ? (o.trim ?? shade(base, -0.3)) : trim;
      g.lineCap = 'round';
      g.strokeStyle = INK;
      g.lineWidth = kind === 'gi' ? 7.5 : 6.5;
      g.beginPath();
      g.moveTo(37, top - 3); g.lineTo(kind === 'gi' ? 58 : 50, kind === 'gi' ? 104 : top + 34);
      g.moveTo(63, top - 3); g.lineTo(kind === 'gi' ? 50 : 50, kind === 'gi' ? top + 16 : top + 34);
      if (kind !== 'gi') { g.moveTo(50, top + 34); g.lineTo(50, 104); }
      g.stroke();
      g.strokeStyle = band;
      g.lineWidth = kind === 'gi' ? 5 : 4;
      g.stroke();
      if (kind === 'shroud') {
        g.strokeStyle = alpha(shade(base, -0.45), 0.6);
        g.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          g.beginPath(); g.moveTo(8 + i * 22, 104); g.lineTo(18 + i * 22 + r() * 6, top + 6); g.stroke();
        }
      }
      break;
    }
    case 'leather': {
      folds(base, 2);
      neckV(9, shade(skin, -0.12));
      // shoulder pads
      for (const s of [-1, 1]) {
        ellipse(g, 50 + s * 33, top + 12, 14, 9, s * 0.35);
        paint(g, domeFill(g, 50 + s * 33, top + 10, 14, shade(base, -0.12), 0.3), INK, 1.4);
        ellipse(g, 50 + s * 33, top + 12, 10, 5.5, s * 0.35);
        g.setLineDash([1.6, 2.2]);
        g.strokeStyle = alpha(shade(base, 0.45), 0.8);
        g.lineWidth = 0.9;
        g.stroke();
        g.setLineDash([]);
      }
      // bandolier
      g.beginPath(); g.moveTo(26, top + 2); g.lineTo(74, 108);
      g.strokeStyle = INK; g.lineWidth = 7.5; g.stroke();
      g.strokeStyle = shade(base, -0.35); g.lineWidth = 5.5; g.stroke();
      rr(g, 40, top + 22, 7, 7, 1.5);
      paint(g, '#c9a24a', INK, 1);
      break;
    }
    case 'vest':
    case 'coat': {
      const shirt = o.trim ?? '#e8dfc8';
      poly(g, [[36, top - 4], [64, top - 4], [60, 110], [40, 110]]);
      paint(g, litFill(g, 36, top, 28, 40, shirt, 0.15), null);
      neckV(8, shade(skin, -0.12));
      for (const s of [-1, 1]) {
        poly(g, [[50 + s * 12, top - 3], [50 + s * (kind === 'coat' ? 4 : 6), top + 22], [50 + s * 9, 110], [50 + s * 60, 110], [50 + s * 60, top]]);
        paint(g, litFill(g, 0, top, 100, 40, base, 0.2), INK, 1.5);
        if (kind === 'coat') {
          poly(g, [[50 + s * 12, top - 3], [50 + s * 4, top + 22], [50 + s * 15, top + 14]]);
          paint(g, shade(base, -0.3), INK, 1.2);
          for (let i = 0; i < 2; i++) {
            circle(g, 50 + s * 13, top + 20 + i * 9, 1.8);
            paint(g, '#d9b44a', INK, 0.8);
          }
        }
      }
      if (kind === 'vest') {
        g.strokeStyle = INK; g.lineWidth = 1;
        g.beginPath();
        for (let i = 0; i < 3; i++) { g.moveTo(45, top + 8 + i * 6); g.lineTo(55, top + 11 + i * 6); }
        g.stroke();
      }
      break;
    }
    case 'doublet': {
      // diamond pattern
      g.strokeStyle = alpha(trim, 0.7);
      g.lineWidth = 1.3;
      g.beginPath();
      for (let x = -40; x < 140; x += 12) { g.moveTo(x, top); g.lineTo(x + 40, 110); g.moveTo(x + 40, top); g.lineTo(x, 110); }
      g.stroke();
      neckV(7, shade(skin, -0.12));
      // buttons
      for (let i = 0; i < 3; i++) {
        circle(g, 50, top + 12 + i * 8, 1.9);
        paint(g, '#e2b84a', INK, 0.8);
      }
      // puffed shoulders with slashes
      for (const s of [-1, 1]) {
        ellipse(g, 50 + s * 34, top + 11, 14, 10, s * 0.3);
        paint(g, domeFill(g, 50 + s * 34, top + 9, 14, base, 0.35), INK, 1.4);
        for (let i = -1; i <= 1; i++) line(g, 50 + s * (34 + i * 6), top + 4, 50 + s * (34 + i * 6 + s), top + 18, trim, 2.2);
      }
      break;
    }
    case 'mail': {
      g.setLineDash([0.1, 3.6]);
      g.lineCap = 'round';
      for (let y = top + 2, row = 0; y < 106; y += 3.4, row++) {
        g.beginPath(); g.moveTo(row % 2 ? 1.8 : 0, y); g.lineTo(100, y);
        g.strokeStyle = alpha(shade(metal, -0.55), 0.9); g.lineWidth = 2.6; g.stroke();
        g.beginPath(); g.moveTo(row % 2 ? 1.2 : -0.6, y - 0.6); g.lineTo(100, y - 0.6);
        g.strokeStyle = alpha(shade(metal, 0.5), 0.8); g.lineWidth = 1.1; g.stroke();
      }
      g.setLineDash([]);
      if (o.trim) {
        // tabard
        poly(g, [[37, top - 1], [63, top - 1], [66, 110], [34, 110]]);
        paint(g, litFill(g, 34, top, 32, 40, o.trim, 0.2), INK, 1.5);
        line(g, 37, top + 1, 34, 110, shade(o.trim, -0.35), 1.6);
        circle(g, 50, top + 18, 6);
        paint(g, alpha(shade(o.trim, o.trim === '#e6e0d2' ? -0.5 : 0.55), 0.85), null);
      }
      neckV(6, shade(metal, -0.3));
      break;
    }
    case 'plate': {
      // breastplate ridge and highlight
      line(g, 50, top + 4, 50, 104, alpha(shade(metal, -0.5), 0.7), 1.4);
      ellipse(g, 40, top + 18, 7, 12, 0.3);
      g.fillStyle = 'rgba(255,255,255,0.28)';
      g.fill();
      if (o.trim) {
        poly(g, [[40, top + 14], [60, top + 14], [56, 110], [44, 110]]);
        paint(g, alpha(o.trim, 0.9), INK, 1.2);
      }
      // gorget
      blob(g, [[34, top - 2], [50, top - 5], [66, top - 2], [64, top + 7], [50, top + 9], [36, top + 7]]);
      paint(g, domeFill(g, 46, top, 18, shade(metal, 0.1), 0.4), INK, 1.4);
      // pauldrons
      for (const s of [-1, 1]) {
        ellipse(g, 50 + s * 33, top + 10, 17, 12, s * 0.35);
        paint(g, domeFill(g, 50 + s * 31, top + 6, 17, metal, 0.5), INK, LW * 0.9);
        g.save();
        g.beginPath();
        g.ellipse(50 + s * 33, top + 14, 15, 9, s * 0.35, 0.15 * Math.PI, 0.85 * Math.PI);
        g.strokeStyle = alpha(shade(metal, -0.55), 0.8);
        g.lineWidth = 1.3;
        g.stroke();
        g.restore();
        circle(g, 50 + s * 28, top + 6, 1.6);
        paint(g, shade(metal, 0.5), INK, 0.6);
      }
      break;
    }
    case 'scale': {
      const sc = o.trim ?? shade(base, 0.25);
      g.strokeStyle = alpha(shade(base, -0.55), 0.85);
      g.lineWidth = 1;
      for (let y = top + 4, row = 0; y < 104; y += 6, row++) {
        g.beginPath();
        for (let x = (row % 2) * 4 + 6; x < 96; x += 8) {
          g.moveTo(x + 4, y);
          g.arc(x, y, 4, 0, Math.PI);
        }
        g.fillStyle = alpha(sc, 0.35);
        g.fill();
        g.stroke();
      }
      neckV(6, shade(base, -0.35));
      break;
    }
    case 'bare': {
      // collarbones and chest
      g.strokeStyle = alpha(shade(skin, -0.5), 0.6);
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(30, top + 9); g.quadraticCurveTo(40, top + 5, 47, top + 8);
      g.moveTo(70, top + 9); g.quadraticCurveTo(60, top + 5, 53, top + 8);
      g.moveTo(32, top + 24); g.quadraticCurveTo(41, top + 30, 49, top + 24);
      g.moveTo(68, top + 24); g.quadraticCurveTo(59, top + 30, 51, top + 24);
      g.stroke();
      if (o.outfitColor) {
        // belt of hide across the chest
        g.beginPath(); g.moveTo(72, top + 2); g.lineTo(28, 108);
        g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
        g.strokeStyle = o.outfitColor; g.lineWidth = 5; g.stroke();
      }
      break;
    }
    case 'fur': {
      g.strokeStyle = alpha(shade(base, -0.45), 0.6);
      g.lineWidth = 1.1;
      g.beginPath();
      for (let i = 0; i < 18; i++) {
        const x = 10 + r() * 80, y = top + 4 + r() * 26;
        g.moveTo(x, y); g.lineTo(x + (x < 50 ? -2.5 : 2.5), y + 5);
      }
      g.stroke();
      if (o.trim) {
        // torn shirt over fur
        blob(g, [[30, 110], [28, top + 12], [40, top + 4], [46, top + 14], [54, top + 6], [60, top + 14], [70, top + 6], [74, 110]]);
        paint(g, litFill(g, 28, top, 46, 40, o.trim, 0.2), INK, 1.3);
      }
      break;
    }
    case 'rags': {
      folds(base, 3);
      neckV(10, shade(skin, -0.15));
      for (let i = 0; i < 2; i++) {
        const x = 24 + r() * 46, y = top + 12 + r() * 14;
        rr(g, x, y, 9, 8, 1);
        paint(g, shade(base, (r() - 0.5) * 0.5 + 0.15), alpha(INK, 0.7), 1);
        g.setLineDash([1.4, 1.6]);
        g.strokeStyle = alpha(INK, 0.6); g.lineWidth = 0.7;
        rr(g, x + 1.2, y + 1.2, 6.6, 5.6, 1); g.stroke();
        g.setLineDash([]);
      }
      for (let i = 0; i < 2; i++) {
        const x = 20 + r() * 60, y = top + 8 + r() * 16;
        poly(g, [[x, y], [x + 2.5, y + 7], [x - 1, y + 9]]);
        paint(g, alpha('#160f0a', 0.7), null);
      }
      break;
    }
    case 'leaves':
    case 'bark': {
      if (kind === 'bark') {
        g.strokeStyle = alpha(shade(base, -0.5), 0.75);
        g.lineWidth = 1.4;
        g.beginPath();
        for (let i = 0; i < 9; i++) {
          const x = 8 + i * 10 + r() * 4;
          g.moveTo(x, top + 4 + r() * 6);
          g.bezierCurveTo(x + 4, top + 14, x - 4, top + 24, x + 2, 104);
        }
        g.stroke();
      }
      const lc = o.trim ?? (kind === 'bark' ? '#6f9a3c' : shade(base, 0.25));
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const x = 18 + t * 64, y = top + 6 + Math.abs(t - 0.5) * 10 + r() * 3;
        leaf(g, x, y, 13, 4.5, (t - 0.5) * 1.6 + Math.PI / 2 + (r() - 0.5) * 0.6, shade(lc, (r() - 0.5) * 0.3));
      }
      break;
    }
    case 'bandage': {
      g.strokeStyle = alpha(shade(base, -0.45), 0.85);
      g.lineWidth = 1.2;
      g.beginPath();
      for (let y = top + 2; y < 106; y += 5.5) {
        const tilt = (r() - 0.5) * 8;
        g.moveTo(0, y + tilt); g.lineTo(100, y - tilt);
      }
      g.stroke();
      break;
    }
    case 'gown': {
      const dress = o.outfitColor ?? '#5d3a78';
      blob(g, [[8, 120], [12, top + 14], [30, top + 10], [40, top + 16], [50, top + 12], [60, top + 16], [70, top + 10], [88, top + 14], [92, 120]]);
      paint(g, litFill(g, 8, top + 10, 84, 40, dress, 0.25), INK, 1.5);
      line(g, 16, top + 12, 84, top + 12, alpha(o.trim ?? shade(dress, 0.4), 0.0), 0);
      g.strokeStyle = o.trim ?? shade(dress, 0.45);
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(14, top + 15); g.quadraticCurveTo(30, top + 9, 40, top + 17); g.quadraticCurveTo(50, top + 11, 60, top + 17); g.quadraticCurveTo(70, top + 9, 86, top + 15);
      g.stroke();
      // collarbones
      g.strokeStyle = alpha(shade(skin, -0.45), 0.5);
      g.lineWidth = 1.1;
      g.beginPath();
      g.moveTo(32, top + 5); g.quadraticCurveTo(40, top + 2, 47, top + 5);
      g.moveTo(68, top + 5); g.quadraticCurveTo(60, top + 2, 53, top + 5);
      g.stroke();
      break;
    }
  }
  g.restore();
  bodyPath(b);
  g.strokeStyle = INK;
  g.lineWidth = LW;
  g.stroke();
}

function drawRibs(b: B) {
  const { g, top, skin } = b;
  const bone = skin;
  // spine
  for (let i = 0; i < 6; i++) {
    rr(g, 46.5, top + 2 + i * 6, 7, 5, 2);
    paint(g, domeFill(g, 50, top + 4 + i * 6, 5, bone, 0.3), INK, 1);
  }
  // clavicles
  for (const s of [-1, 1]) {
    taper(g, [[50 + s * 5, top + 4], [50 + s * 18, top + 1], [50 + s * 34, top + 8]], 4.2, 3);
    paint(g, bone, INK, 1.2);
    // shoulder ball
    circle(g, 50 + s * 36, top + 10, 6);
    paint(g, domeFill(g, 50 + s * 36, top + 9, 6, bone, 0.4), INK, 1.2);
    for (let i = 0; i < 4; i++) {
      const y = top + 12 + i * 7.5;
      taper(g, [[50 + s * 4, y], [50 + s * (22 - i * 1.5), y - 2], [50 + s * (30 - i * 2), y + 8]], 3.6, 2.2, 4);
      paint(g, bone, INK, 1.1);
    }
  }
}

function drawCloak(b: B) {
  const { g, o, top } = b;
  const col = o.cloak!;
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(50 + s * 10, top - 2);
    g.quadraticCurveTo(50 + s * 30, top - 2, 50 + s * 48, top + 16);
    g.lineTo(50 + s * 56, 112);
    g.lineTo(50 + s * 30, 112);
    g.quadraticCurveTo(50 + s * 26, top + 18, 50 + s * 14, top + 6);
    g.closePath();
    paint(g, litFill(g, 0, top, 100, 40, col, 0.25), INK, LW * 0.9);
    // fold
    g.beginPath();
    g.moveTo(50 + s * 34, top + 12); g.quadraticCurveTo(50 + s * 40, top + 26, 50 + s * 38, 104);
    g.strokeStyle = alpha(shade(col, -0.55), 0.6); g.lineWidth = 1.3; g.stroke();
  }
  // clasp
  circle(g, 50, top + 3, 3.8);
  paint(g, domeFill(g, 50, top + 3, 3.8, o.metal && o.outfit !== 'plate' ? o.metal : '#d9b44a', 0.5), INK, 1);
}

function drawHoodDown(b: B) {
  const { g, o, top } = b;
  const col = o.hoodColor ?? o.cloak ?? '#4a4038';
  blob(g, [[24, top + 6], [34, top - 7], [50, top - 9], [66, top - 7], [76, top + 6], [64, top + 10], [36, top + 10]]);
  paint(g, domeFill(g, 46, top - 2, 26, col, 0.3), INK, LW * 0.9);
  ellipse(g, 50, top + 1, 15, 5);
  g.fillStyle = alpha(shade(col, -0.6), 0.9);
  g.fill();
}

function drawMantle(b: B) {
  const { g, o, r, top } = b;
  const col = o.mantleColor ?? '#8a6a4a';
  if (o.mantle === 'fur') {
    const pts: number[][] = [];
    const n = 16;
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = Math.PI + t * Math.PI;
      const rad = 1 + (i % 2) * 0.1;
      pts.push([50 + Math.cos(a) * 46 * rad, top + 6 + Math.sin(a) * 12 * rad]);
    }
    for (let i = n; i >= 0; i--) {
      const t = i / n;
      const x = 50 + Math.cos(Math.PI + t * Math.PI) * 40;
      pts.push([x, top + 16 + Math.abs(t - 0.5) * -6 + (i % 2) * 4 + r() * 2]);
    }
    blob(g, pts);
    paint(g, domeFill(g, 42, top, 40, col, 0.3), INK, LW);
    g.strokeStyle = alpha(shade(col, -0.5), 0.7);
    g.lineWidth = 1;
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const x = 10 + r() * 80, y = top - 2 + r() * 14;
      g.moveTo(x, y); g.lineTo(x + (x < 50 ? -2 : 2), y + 4);
    }
    g.stroke();
  } else if (o.mantle === 'gold') {
    // a broad jewelled collar in bands
    const bands = [col, o.trim ?? '#2f5d8a', col, '#a3312c', col];
    for (let i = 0; i < bands.length; i++) {
      const k = 1 - i * 0.16;
      g.beginPath();
      g.ellipse(50, top - 2, 40 * k, 24 * k, 0, 0, Math.PI);
      g.closePath();
      paint(g, i % 2 ? bands[i] : domeFill(g, 44, top + 6, 36, bands[i], 0.35), INK, 1.2);
    }
    g.beginPath();
    g.ellipse(50, top - 2, 13, 7, 0, 0, Math.PI);
    g.closePath();
    paint(g, shade(b.skin, -0.15), INK, 1.2);
  } else if (o.mantle === 'leaves') {
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const x = 8 + t * 84, y = top + 4 + Math.abs(t - 0.5) * 14 * (t < 0.5 ? 1 : 1) - 2 + r() * 3;
      leaf(g, x, y, 15, 5, Math.PI / 2 + (t - 0.5) * 2 + (r() - 0.5) * 0.5, shade(col, (r() - 0.5) * 0.35));
    }
  } else {
    for (let i = 0; i < 11; i++) {
      const t = i / 10;
      const x = 10 + t * 80, y = top + 4 + Math.abs(t - 0.5) * 12;
      const a = Math.PI / 2 + (t - 0.5) * 1.6;
      taper(g, [[x, y - 4], [x + Math.cos(a) * 8, y + Math.sin(a) * 8], [x + Math.cos(a) * 16, y + Math.sin(a) * 16]], 6, 1.5, 3);
      paint(g, i % 2 ? col : shade(col, 0.25), INK, 1);
    }
  }
}

function drawRuff(b: B) {
  const { g, top } = b;
  const col = b.o.collarColor ?? '#f1ece0';
  const pts: number[][] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const k = i % 2 ? 1 : 0.84;
    pts.push([50 + Math.cos(a) * 22 * k, top + 1 + Math.sin(a) * 7 * k]);
  }
  blob(g, pts);
  paint(g, domeFill(g, 46, top - 2, 22, col, 0.25), INK, 1.4);
}

function drawNecklaces(b: B) {
  const { g, o, top } = b;
  if (o.beads) {
    for (let i = 0; i < 9; i++) {
      const t = i / 8, a = Math.PI * (0.15 + t * 0.7);
      const x = 50 + Math.cos(a) * 16, y = top - 2 + Math.sin(a) * 15;
      circle(g, x, y, 2.3);
      paint(g, domeFill(g, x, y, 2.3, o.beads, 0.5), INK, 0.7);
    }
  }
  if (o.holy) {
    g.beginPath();
    g.moveTo(41, top - 1); g.quadraticCurveTo(44, top + 12, 50, top + 15);
    g.moveTo(59, top - 1); g.quadraticCurveTo(56, top + 12, 50, top + 15);
    g.strokeStyle = shade(o.holy, -0.3); g.lineWidth = 1.2; g.stroke();
    const cy = top + 20;
    glow(g, 50, cy, 12, o.holy, 0.45);
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, k = i % 2 ? 5 : 8.5;
      i ? g.lineTo(50 + Math.cos(a) * k, cy + Math.sin(a) * k) : g.moveTo(50 + Math.cos(a) * k, cy + Math.sin(a) * k);
    }
    g.closePath();
    paint(g, domeFill(g, 50, cy, 8, o.holy, 0.5), INK, 1.1);
    circle(g, 50, cy, 3);
    paint(g, shade(o.holy, 0.4), alpha(INK, 0.7), 0.8);
  }
}

// ---------------------------------------------------------------- head

function drawEars(b: B) {
  const { g, o, HX, HY, hw, hh, ey } = b;
  const ears = o.ears ?? 'round';
  const col = b.skin;
  const inner = mix(shade(col, -0.3), '#c46a6a', 0.25);
  for (const s of [-1, 1]) {
    const bx = HX + s * hw * 0.98;
    switch (ears) {
      case 'round':
      case 'small': {
        if (ears === 'small') {
          blob(g, [[bx - s * 2, ey - 3], [bx + s * 6, ey - 8], [bx + s * 6, ey + 4], [bx, ey + 9]]);
        } else {
          ellipse(g, bx + s * 2, ey + 2, 4.6, 6.8, s * 0.2);
        }
        paint(g, domeFill(g, bx, ey, 7, col, 0.25), INK, 1.6);
        ellipse(g, bx + s * 2.2, ey + 2, 2, 3.6, s * 0.2);
        g.fillStyle = alpha(inner, 0.7);
        g.fill();
        break;
      }
      case 'elf':
      case 'long': {
        const L = ears === 'elf' ? 1 : 0.62;
        poly(g, [[bx - s * 1, ey - 4], [bx + s * 17 * L, ey - 17 * L], [bx + s * 5, ey + 9]]);
        blob(g, [[bx - s * 2, ey - 5], [bx + s * 7 * L, ey - 9 * L], [bx + s * 18 * L, ey - 18 * L], [bx + s * 9, ey + 3], [bx + s * 3, ey + 10], [bx - s * 2, ey + 6]]);
        paint(g, domeFill(g, bx + s * 4, ey - 4, 12, col, 0.25), INK, 1.6);
        poly(g, [[bx + s * 2, ey - 2], [bx + s * 13 * L, ey - 13 * L], [bx + s * 4, ey + 5]]);
        g.fillStyle = alpha(inner, 0.55);
        g.fill();
        break;
      }
      case 'goblin': {
        blob(g, [[bx - s * 2, ey - 7], [bx + s * 14, ey - 12], [bx + s * 27, ey - 10], [bx + s * 16, ey + 2], [bx + s * 4, ey + 9], [bx - s * 2, ey + 5]]);
        paint(g, domeFill(g, bx + s * 8, ey - 4, 16, col, 0.25), INK, 1.7);
        blob(g, [[bx + s * 2, ey - 4], [bx + s * 14, ey - 8], [bx + s * 20, ey - 8], [bx + s * 6, ey + 4]]);
        g.fillStyle = alpha(inner, 0.6);
        g.fill();
        // notch
        poly(g, [[bx + s * 14, ey - 11], [bx + s * 17, ey - 6], [bx + s * 19, ey - 11]]);
        g.fillStyle = alpha(INK, 0.5);
        g.fill();
        break;
      }
      case 'fin': {
        g.beginPath();
        g.moveTo(bx - s * 1, ey - 6);
        g.lineTo(bx + s * 14, ey - 16);
        g.quadraticCurveTo(bx + s * 12, ey - 8, bx + s * 16, ey - 4);
        g.quadraticCurveTo(bx + s * 11, ey - 1, bx + s * 13, ey + 6);
        g.quadraticCurveTo(bx + s * 7, ey + 5, bx, ey + 9);
        g.closePath();
        paint(g, litFill(g, bx, ey - 16, 16, 25, o.under ?? shade(col, 0.2), 0.25), INK, 1.5);
        g.strokeStyle = alpha(shade(col, -0.5), 0.8);
        g.lineWidth = 0.9;
        g.beginPath();
        g.moveTo(bx, ey - 2); g.lineTo(bx + s * 12, ey - 13);
        g.moveTo(bx, ey + 1); g.lineTo(bx + s * 13, ey - 3);
        g.moveTo(bx, ey + 4); g.lineTo(bx + s * 11, ey + 5);
        g.stroke();
        break;
      }
      case 'canine': {
        const tx = HX + s * hw * 0.95, ty = HY - hh * 1.55;
        poly(g, [[HX + s * hw * 0.25, HY - hh * 0.85], [tx, ty], [HX + s * hw * 1.05, HY - hh * 0.2]]);
        paint(g, domeFill(g, tx, HY - hh, 16, col, 0.25), INK, LW);
        poly(g, [[HX + s * hw * 0.45, HY - hh * 0.75], [tx - s * 1, ty + 7], [HX + s * hw * 0.88, HY - hh * 0.3]]);
        g.fillStyle = alpha('#3b2a2a', 0.8);
        g.fill();
        break;
      }
      case 'bear':
      case 'rat': {
        const k = ears === 'rat' ? 1.35 : 1;
        const cx = HX + s * hw * 0.82, cy = HY - hh * 0.9;
        circle(g, cx, cy, 8 * k);
        paint(g, domeFill(g, cx, cy, 8 * k, col, 0.25), INK, LW * 0.9);
        circle(g, cx + s * 0.6, cy + 0.8, 4.8 * k);
        g.fillStyle = ears === 'rat' ? alpha('#d99a9a', 0.85) : alpha(shade(col, -0.45), 0.8);
        g.fill();
        break;
      }
    }
  }
}

function drawRidgeHorns(b: B) {
  const { g, o, HX, HY, hw, hh } = b;
  const col = o.hornColor ?? '#e6dcc0';
  const k = o.horns === 'nubs' ? 0.55 : 1;
  for (const s of [-1, 1]) {
    taper(g, [[HX + s * hw * 0.5, HY - hh * 0.65], [HX + s * hw * 0.9, HY - hh * (1.05 + 0.25 * k)], [HX + s * hw * (1.0 + 0.45 * k), HY - hh * (1.15 + 0.5 * k)]], 9 * k, 0.6);
    paint(g, domeFill(g, HX + s * hw, HY - hh * 1.2, 16, col, 0.35), INK, 1.6);
    taper(g, [[HX + s * hw * 0.85, HY - hh * 0.3], [HX + s * hw * 1.25, HY - hh * 0.55], [HX + s * hw * (1.35 + 0.35 * k), HY - hh * (0.6 + 0.25 * k)]], 7 * k, 0.5);
    paint(g, domeFill(g, HX + s * hw * 1.3, HY - hh * 0.6, 12, shade(col, -0.08), 0.35), INK, 1.5);
  }
}

function drawFrontHorns(b: B) {
  const { g, o, HX, HY, hw, hh } = b;
  const col = o.hornColor ?? '#3a2a2e';
  const ridges = (k: number) => {
    g.save();
    g.clip();
    g.strokeStyle = alpha(shade(col, -0.6), 0.6);
    g.lineWidth = 1.1;
    g.beginPath();
    for (let i = 0; i < k; i++) {
      const y = HY - hh * (0.7 + i * 0.22);
      g.moveTo(HX - hw * 2, y); g.lineTo(HX + hw * 2, y - 3);
    }
    g.stroke();
    g.restore();
  };
  for (const s of [-1, 1]) {
    let pts: number[][];
    let w0 = 7.5;
    switch (o.horns) {
      case 'curl':
        pts = [[HX + s * hw * 0.42, HY - hh * 0.62], [HX + s * hw * 0.55, HY - hh * 1.3], [HX + s * hw * 1.15, HY - hh * 1.55], [HX + s * hw * 1.42, HY - hh * 1.05], [HX + s * hw * 1.2, HY - hh * 0.85]];
        break;
      case 'ram':
        w0 = 9;
        pts = [[HX + s * hw * 0.55, HY - hh * 0.85], [HX + s * hw * 1.2, HY - hh * 1.15], [HX + s * hw * 1.68, HY - hh * 0.55], [HX + s * hw * 1.45, HY + hh * 0.05], [HX + s * hw * 1.08, HY - hh * 0.2], [HX + s * hw * 1.22, HY - hh * 0.45]];
        break;
      case 'goat':
        pts = [[HX + s * hw * 0.38, HY - hh * 0.75], [HX + s * hw * 0.55, HY - hh * 1.4], [HX + s * hw * 1.05, HY - hh * 1.75], [HX + s * hw * 1.4, HY - hh * 1.6]];
        break;
      case 'straight':
        w0 = 6.5;
        pts = [[HX + s * hw * 0.42, HY - hh * 0.72], [HX + s * hw * 0.6, HY - hh * 1.2], [HX + s * hw * 0.85, HY - hh * 1.6]];
        break;
      default:
        return;
    }
    taper(g, pts, w0, 0.6, 3);
    paint(g, domeFill(g, HX + s * hw * 0.8, HY - hh * 1.2, 20, col, 0.4), INK, 1.7);
    ridges(4);
  }
}

function drawFace(b: B) {
  const { g, o, HX, HY, hw, hh, skin, r } = b;
  if (o.skull) return drawSkull(b);
  if (o.noFace) {
    facePath(b);
    const gr = g.createRadialGradient(HX, HY + 4, 2, HX, HY, hh * 1.2);
    gr.addColorStop(0, '#000000');
    gr.addColorStop(1, alpha(o.skin, 0.95));
    paint(g, gr, o.hood === 'up' ? null : alpha(INK, 0.8), 1.4);
    return;
  }
  if (o.snout) return drawSnoutHead(b);
  facePath(b);
  paint(g, domeFill(g, HX - hw * 0.25, HY - hh * 0.25, hh * 1.3, skin, 0.28), INK, LW);
  g.save();
  g.clip();
  // jaw shade on the right
  const jg = g.createLinearGradient(HX - hw, 0, HX + hw * 1.1, 0);
  jg.addColorStop(0, 'rgba(255,255,255,0.06)');
  jg.addColorStop(0.6, 'rgba(0,0,0,0)');
  jg.addColorStop(1, 'rgba(0,0,0,0.18)');
  g.fillStyle = jg;
  g.fillRect(HX - hw * 1.2, HY - hh * 1.2, hw * 2.4, hh * 2.4);
  if (o.face === 'gaunt' || o.rot) {
    for (const s of [-1, 1]) {
      ellipse(g, HX + s * hw * 0.62, HY + hh * 0.36, hw * 0.2, hh * 0.22);
      g.fillStyle = alpha(shade(skin, -0.5), 0.35);
      g.fill();
    }
  }
  if (o.marks) {
    g.fillStyle = alpha(o.marks, 0.55);
    for (let i = 0; i < 5; i++) {
      const x = HX + (r() - 0.5) * hw * 1.6, y = HY + (r() - 0.6) * hh * 1.4;
      blob(g, [[x, y], [x + 4 + r() * 3, y + 1], [x + 2, y + 4 + r() * 2], [x - 3, y + 2]]);
      g.fill();
    }
    g.strokeStyle = alpha(o.marks, 0.7);
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(HX - hw * 0.2, HY - hh * 0.95); g.lineTo(HX - hw * 0.05, HY - hh * 0.6); g.lineTo(HX - hw * 0.25, HY - hh * 0.4);
    g.moveTo(HX + hw * 0.75, HY + hh * 0.05); g.lineTo(HX + hw * 0.55, HY + hh * 0.3);
    g.stroke();
  }
  if (o.spots) {
    g.fillStyle = alpha(o.spots, 0.8);
    for (let i = 0; i < 6; i++) {
      circle(g, HX + (r() - 0.5) * hw * 1.6, HY + (r() - 0.5) * hh * 1.5, 1.2 + r() * 1.6);
      g.fill();
    }
  }
  if (o.rot) {
    for (let i = 0; i < 3; i++) {
      const x = HX + (r() - 0.5) * hw * 1.4, y = HY + (r() - 0.3) * hh * 1.2;
      blob(g, [[x, y], [x + 5, y - 2], [x + 7, y + 3], [x + 2, y + 6], [x - 3, y + 3]]);
      g.fillStyle = alpha(mix(skin, '#3d2a1e', 0.5), 0.55 * o.rot + 0.2);
      g.fill();
    }
    // stitches
    const sx = HX - hw * 0.75, sy = HY - hh * 0.55;
    line(g, sx, sy, sx + 10, sy + 9, alpha('#2a1d16', 0.8), 1.1);
    g.beginPath();
    for (let i = 0; i < 4; i++) {
      const px = sx + i * 2.6, py = sy + i * 2.4;
      g.moveTo(px - 2, py + 2); g.lineTo(px + 2, py - 2);
    }
    g.strokeStyle = alpha('#2a1d16', 0.8); g.lineWidth = 0.9; g.stroke();
  }
  if (o.blush) {
    for (const s of [-1, 1]) glow(g, HX + s * hw * 0.55, HY + hh * 0.32, hw * 0.32, '#e8707a', 0.45);
  }
  if (o.freckles) {
    g.fillStyle = alpha(shade(skin, -0.45), 0.75);
    for (const s of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        circle(g, HX + s * hw * (0.35 + r() * 0.35), HY + hh * (0.18 + r() * 0.22), 0.65);
        g.fill();
      }
    }
  }
  if (o.scales) faceScales(b);
  if (o.wraps) drawWraps(b);
  g.restore();
  facePath(b);
  g.strokeStyle = INK;
  g.lineWidth = LW;
  g.stroke();
}

function faceScales(b: B) {
  const { g, HX, HY, hw, hh, skin } = b;
  g.strokeStyle = alpha(shade(skin, -0.55), 0.5);
  g.lineWidth = 0.9;
  g.beginPath();
  for (let row = 0; row < 3; row++) {
    const y = HY - hh * 0.92 + row * 6;
    for (let x = HX - hw + (row % 2) * 3.5; x < HX + hw; x += 7) {
      g.moveTo(x + 3.5, y);
      g.arc(x, y, 3.5, 0, Math.PI);
    }
  }
  g.stroke();
}

function drawWraps(b: B) {
  const { g, HX, HY, hw, hh, skin, ey } = b;
  const cols = [skin, shade(skin, -0.1), shade(skin, 0.08)];
  for (let i = 0; i < 9; i++) {
    const y = HY - hh * 1.15 + i * hh * 0.29;
    if (Math.abs(y - ey) < hh * 0.12) continue;
    const t = (i % 2 ? 1 : -1) * 3;
    poly(g, [[HX - hw * 1.3, y - t], [HX + hw * 1.3, y + t], [HX + hw * 1.3, y + t + hh * 0.3], [HX - hw * 1.3, y - t + hh * 0.3]]);
    paint(g, cols[i % 3], alpha(shade(skin, -0.55), 0.9), 1);
  }
  // dark gap around the eyes
  rr(g, HX - hw * 1.1, ey - hh * 0.13, hw * 2.2, hh * 0.26, 3);
  g.fillStyle = '#1c140f';
  g.fill();
}

function drawSkull(b: B) {
  const { g, o, HX, HY, hw, hh } = b;
  const bone = o.skin;
  const ey = b.ey;
  // cranium
  blob(g, [[HX, HY - hh * 1.12], [HX + hw * 0.95, HY - hh * 0.9], [HX + hw * 1.08, HY - hh * 0.15], [HX + hw * 0.9, HY + hh * 0.35], [HX + hw * 0.55, HY + hh * 0.55], [HX - hw * 0.55, HY + hh * 0.55], [HX - hw * 0.9, HY + hh * 0.35], [HX - hw * 1.08, HY - hh * 0.15], [HX - hw * 0.95, HY - hh * 0.9]]);
  paint(g, domeFill(g, HX - 5, HY - hh * 0.4, hh * 1.3, bone, 0.32), INK, LW);
  // jaw
  blob(g, [[HX - hw * 0.62, HY + hh * 0.42], [HX + hw * 0.62, HY + hh * 0.42], [HX + hw * 0.56, HY + hh * 0.9], [HX + hw * 0.2, HY + hh * 1.08], [HX - hw * 0.2, HY + hh * 1.08], [HX - hw * 0.56, HY + hh * 0.9]]);
  paint(g, domeFill(g, HX - 3, HY + hh * 0.6, hh * 0.7, shade(bone, -0.06), 0.3), INK, LW * 0.9);
  // teeth
  rr(g, HX - hw * 0.5, HY + hh * 0.42, hw, hh * 0.24, 2);
  paint(g, shade(bone, 0.15), INK, 1.2);
  g.beginPath();
  for (let i = 1; i < 6; i++) {
    const x = HX - hw * 0.5 + (hw * i) / 6;
    g.moveTo(x, HY + hh * 0.43); g.lineTo(x, HY + hh * 0.65);
  }
  g.moveTo(HX - hw * 0.5, HY + hh * 0.54); g.lineTo(HX + hw * 0.5, HY + hh * 0.54);
  g.strokeStyle = alpha(INK, 0.8); g.lineWidth = 0.9; g.stroke();
  // cheekbones
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(HX + s * hw * 0.95, ey + hh * 0.05); g.quadraticCurveTo(HX + s * hw * 0.7, ey + hh * 0.4, HX + s * hw * 0.35, ey + hh * 0.32);
    g.strokeStyle = alpha(shade(bone, -0.55), 0.7); g.lineWidth = 1.3; g.stroke();
  }
  // sockets
  for (const s of [-1, 1]) {
    blob(g, [[HX + s * hw * 0.12, ey - hh * 0.12], [HX + s * hw * 0.45, ey - hh * 0.25], [HX + s * hw * 0.8, ey - hh * 0.12], [HX + s * hw * 0.72, ey + hh * 0.2], [HX + s * hw * 0.38, ey + hh * 0.24], [HX + s * hw * 0.14, ey + hh * 0.12]]);
    paint(g, '#120c0a', INK, 1.4);
  }
  // nose cavity
  poly(g, [[HX, ey + hh * 0.18], [HX + hw * 0.14, ey + hh * 0.42], [HX, ey + hh * 0.38], [HX - hw * 0.14, ey + hh * 0.42]]);
  paint(g, '#120c0a', INK, 1);
  // cracks
  g.beginPath();
  g.moveTo(HX + hw * 0.3, HY - hh * 1.0); g.lineTo(HX + hw * 0.4, HY - hh * 0.75); g.lineTo(HX + hw * 0.3, HY - hh * 0.55);
  g.strokeStyle = alpha(INK, 0.7); g.lineWidth = 1; g.stroke();
}

function drawSnoutHead(b: B) {
  const { g, o, HX, HY, hw, hh, skin, ey } = b;
  const under = o.under ?? shade(skin, 0.35);
  const kind = o.snout!;
  if (kind === 'reptile') {
    // cranium with brow ridges
    blob(g, [[HX, HY - hh * 1.1], [HX + hw * 0.85, HY - hh * 0.95], [HX + hw * 1.1, HY - hh * 0.3], [HX + hw * 1.08, HY + hh * 0.3], [HX + hw * 0.8, HY + hh * 0.75], [HX - hw * 0.8, HY + hh * 0.75], [HX - hw * 1.08, HY + hh * 0.3], [HX - hw * 1.1, HY - hh * 0.3], [HX - hw * 0.85, HY - hh * 0.95]]);
    paint(g, domeFill(g, HX - 5, HY - hh * 0.4, hh * 1.3, skin, 0.3), INK, LW);
    // cheek spikes
    for (const s of [-1, 1]) {
      poly(g, [[HX + s * hw * 0.98, HY + hh * 0.05], [HX + s * hw * 1.5, HY + hh * 0.42], [HX + s * hw * 0.92, HY + hh * 0.5]]);
      paint(g, domeFill(g, HX + s * hw * 1.2, HY + hh * 0.3, 8, shade(skin, -0.1), 0.3), INK, 1.4);
    }
    // lower jaw
    blob(g, [[HX - hw * 0.8, HY + hh * 0.45], [HX + hw * 0.8, HY + hh * 0.45], [HX + hw * 0.66, HY + hh * 1.0], [HX, HY + hh * 1.2], [HX - hw * 0.66, HY + hh * 1.0]]);
    paint(g, domeFill(g, HX - 3, HY + hh * 0.85, hh * 0.7, under, 0.25), INK, LW * 0.9);
    g.strokeStyle = alpha(shade(under, -0.4), 0.6);
    g.lineWidth = 0.9;
    g.beginPath();
    for (let i = 0; i < 3; i++) {
      const y = HY + hh * (0.84 + i * 0.11);
      g.moveTo(HX - hw * 0.5 + i * 3, y); g.quadraticCurveTo(HX, y + 2, HX + hw * 0.5 - i * 3, y);
    }
    g.stroke();
    // long reptile mouth line from cheek to cheek, with teeth
    g.beginPath();
    g.moveTo(HX - hw * 0.95, HY + hh * 0.42);
    g.quadraticCurveTo(HX - hw * 0.7, HY + hh * 0.78, HX, HY + hh * 0.86);
    g.quadraticCurveTo(HX + hw * 0.7, HY + hh * 0.78, HX + hw * 0.95, HY + hh * 0.42);
    g.strokeStyle = INK; g.lineWidth = 1.8; g.stroke();
    for (const s of [-1, 1]) {
      for (const t of [0.72, 0.5]) {
        const x = HX + s * hw * t, y = HY + hh * (0.62 + (0.72 - t) * 0.55 + 0.08);
        poly(g, [[x - 1.6, y - 1], [x + 1.6, y - 1], [x + s * 0.4, y + 3.6]]);
        paint(g, '#f2ead6', INK, 0.7);
      }
    }
    // upper snout: narrow at the brow, wide and rounded at the tip
    blob(g, [[HX - hw * 0.3, ey - hh * 0.3], [HX + hw * 0.3, ey - hh * 0.3], [HX + hw * 0.5, HY + hh * 0.3], [HX + hw * 0.56, HY + hh * 0.66], [HX + hw * 0.3, HY + hh * 0.86], [HX - hw * 0.3, HY + hh * 0.86], [HX - hw * 0.56, HY + hh * 0.66], [HX - hw * 0.5, HY + hh * 0.3]]);
    paint(g, domeFill(g, HX - 4, HY + hh * 0.2, hh * 0.8, shade(skin, 0.08), 0.32), INK, LW * 0.9);
    // bridge plates
    for (let i = 0; i < 3; i++) {
      const y = ey - hh * 0.12 + i * hh * 0.2;
      ellipse(g, HX, y, hw * (0.14 + i * 0.03), hh * 0.075);
      paint(g, shade(skin, -0.08), alpha(INK, 0.7), 0.9);
    }
    // nostril slits near the tip
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(HX + s * hw * 0.16, HY + hh * 0.7);
      g.quadraticCurveTo(HX + s * hw * 0.3, HY + hh * 0.6, HX + s * hw * 0.36, HY + hh * 0.66);
      g.strokeStyle = '#1a1010'; g.lineWidth = 2; g.stroke();
    }
    // scales on top
    g.save();
    blob(g, [[HX, HY - hh * 1.1], [HX + hw * 0.85, HY - hh * 0.95], [HX + hw * 1.1, HY - hh * 0.3], [HX - hw * 1.1, HY - hh * 0.3], [HX - hw * 0.85, HY - hh * 0.95]]);
    g.clip();
    if (o.scales !== false) faceScales(b);
    g.restore();
    // brow ridges
    for (const s of [-1, 1]) {
      taper(g, [[HX + s * hw * 0.15, ey - hh * 0.3], [HX + s * hw * 0.6, ey - hh * 0.38], [HX + s * hw * 1.0, ey - hh * 0.2]], 5.5, 2);
      paint(g, shade(skin, -0.12), INK, 1.2);
    }
    return;
  }
  // mammal snouts: canine, hyena, rat
  const rat = kind === 'rat';
  blob(g, [[HX, HY - hh * 1.05], [HX + hw * 0.95, HY - hh * 0.75], [HX + hw * 1.12, HY], [HX + hw * 0.85, HY + hh * 0.6], [HX, HY + hh * 0.85], [HX - hw * 0.85, HY + hh * 0.6], [HX - hw * 1.12, HY], [HX - hw * 0.95, HY - hh * 0.75]]);
  paint(g, domeFill(g, HX - 4, HY - hh * 0.3, hh * 1.3, skin, 0.3), INK, LW);
  // cheek ruff
  for (const s of [-1, 1]) {
    poly(g, [[HX + s * hw * 0.9, HY - hh * 0.1], [HX + s * hw * 1.32, HY + hh * 0.25], [HX + s * hw * 1.0, HY + hh * 0.35], [HX + s * hw * 1.2, HY + hh * 0.6], [HX + s * hw * 0.7, HY + hh * 0.6]]);
    paint(g, shade(skin, -0.05), INK, 1.3);
  }
  if (o.spots) {
    g.fillStyle = alpha(o.spots, 0.75);
    for (let i = 0; i < 7; i++) {
      circle(g, HX + (b.r() - 0.5) * hw * 1.7, HY + (b.r() - 0.8) * hh * 0.9, 1.3 + b.r() * 1.5);
      g.fill();
    }
  }
  const mw = rat ? 0.42 : 0.55;
  const mb = rat ? 1.22 : 1.12;
  blob(g, [[HX - hw * mw * 0.7, ey - hh * 0.05], [HX + hw * mw * 0.7, ey - hh * 0.05], [HX + hw * mw, HY + hh * 0.6], [HX + hw * mw * 0.6, HY + hh * mb], [HX - hw * mw * 0.6, HY + hh * mb], [HX - hw * mw, HY + hh * 0.6]]);
  paint(g, domeFill(g, HX - 3, HY + hh * 0.4, hh * 0.8, under, 0.28), INK, LW * 0.9);
  if (kind === 'hyena') {
    blob(g, [[HX - hw * 0.4, HY + hh * 0.35], [HX + hw * 0.4, HY + hh * 0.35], [HX + hw * 0.32, HY + hh * 1.08], [HX - hw * 0.32, HY + hh * 1.08]]);
    g.fillStyle = alpha('#2a2018', 0.55);
    g.fill();
  }
  // nose
  const ny = HY + hh * (rat ? 0.62 : 0.5);
  ellipse(g, HX, ny, rat ? 4 : 6.5, rat ? 3 : 4.5);
  paint(g, rat ? '#d98a96' : '#1a1414', INK, 1);
  ellipse(g, HX - 1.5, ny - 1.2, 1.8, 1);
  g.fillStyle = 'rgba(255,255,255,0.6)';
  g.fill();
  // mouth
  const my = HY + hh * (rat ? 0.95 : 0.88);
  g.beginPath();
  g.moveTo(HX, ny + 3); g.lineTo(HX, my - 2);
  g.moveTo(HX - hw * 0.38, my - 1); g.quadraticCurveTo(HX, my + 3, HX + hw * 0.38, my - 1);
  g.strokeStyle = INK; g.lineWidth = 1.3; g.stroke();
  if (rat) {
    rr(g, HX - 2.6, my - 0.5, 5.2, 5, 1);
    paint(g, '#f4e7b8', INK, 0.9);
    line(g, HX, my, HX, my + 4.5, INK, 0.7);
    g.strokeStyle = alpha('#f2efe6', 0.8);
    g.lineWidth = 0.7;
    g.beginPath();
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { g.moveTo(HX + s * 4, ny + 2); g.lineTo(HX + s * (22 + i * 2), ny - 4 + i * 5); }
    g.stroke();
  } else {
    for (const s of [-1, 1]) {
      poly(g, [[HX + s * hw * 0.26, my], [HX + s * hw * 0.2, my + 6], [HX + s * hw * 0.12, my + 1]]);
      paint(g, '#f2ead6', INK, 0.8);
    }
  }
  // fur strokes on top of the head
  g.strokeStyle = alpha(shade(skin, -0.45), 0.6);
  g.lineWidth = 1;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const x = HX + (b.r() - 0.5) * hw * 1.6, y = HY - hh * (0.2 + b.r() * 0.7);
    g.moveTo(x, y); g.lineTo(x + (x < HX ? -2.5 : 2.5), y + 4);
  }
  g.stroke();
}

function drawEyes(b: B) {
  const { g, o, HX, hw, hh, ey } = b;
  const style = o.eyeStyle ?? 'normal';
  if (style === 'none') return;
  const iris = o.eyes ?? '#5a3d24';
  const glowCol = o.glowColor ?? iris;
  const snout = !!o.snout;
  const ex = snout ? hw * 0.56 : hw * 0.42;
  const yy = snout ? ey - hh * 0.06 : ey;
  let rx = hw * 0.22, ry = hw * 0.165;
  if (style === 'big') { rx *= 1.2; ry *= 1.4; }
  if (style === 'narrow') ry *= 0.7;
  if (style === 'beady') { rx *= 0.55; ry *= 0.7; }
  for (const s of [-1, 1]) {
    const x = HX + s * ex;
    if (o.sunken) {
      ellipse(g, x, yy + 0.5, rx * 1.55, ry * 1.9);
      g.fillStyle = alpha('#1d1418', 0.4);
      g.fill();
    }
    if (o.eyepatch && s < 0) continue;
    const tilt = snout ? s * 0.25 : 0;
    switch (style) {
      case 'closed': {
        g.beginPath();
        g.ellipse(x, yy - 1, rx, ry, 0, Math.PI * 0.1, Math.PI * 0.9);
        g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke();
        break;
      }
      case 'glow':
      case 'hollow': {
        if (style === 'hollow') {
          ellipse(g, x, yy, rx * 1.15, ry * 1.25);
          paint(g, '#0d0a0c', INK, 1.2);
        }
        glow(g, x, yy, rx * 3.2, glowCol, 0.75);
        ellipse(g, x, yy, style === 'hollow' ? rx * 0.42 : rx, style === 'hollow' ? ry * 0.5 : ry * 0.85, tilt);
        paint(g, shade(glowCol, 0.3), style === 'hollow' ? null : alpha(INK, 0.8), 1);
        ellipse(g, x, yy, rx * 0.4, ry * 0.35, tilt);
        g.fillStyle = '#ffffff';
        g.fill();
        break;
      }
      case 'solid':
      case 'blank': {
        ellipse(g, x, yy, rx, ry, tilt);
        paint(g, style === 'blank' ? domeFill(g, x, yy, rx, '#f4f2ea', 0.3) : domeFill(g, x, yy, rx, iris, 0.55), INK, 1.4);
        circle(g, x - rx * 0.35, yy - ry * 0.35, ry * 0.3);
        g.fillStyle = 'rgba(255,255,255,0.85)';
        g.fill();
        break;
      }
      case 'beady': {
        ellipse(g, x, yy, rx, ry);
        paint(g, '#120c0c', null);
        circle(g, x - rx * 0.3, yy - ry * 0.3, ry * 0.35);
        g.fillStyle = 'rgba(255,255,255,0.9)';
        g.fill();
        break;
      }
      default: {
        ellipse(g, x, yy, rx, ry, tilt);
        paint(g, style === 'slit' ? domeFill(g, x, yy, rx, iris, 0.4) : '#f6f1e7', null);
        g.save();
        ellipse(g, x, yy, rx, ry, tilt);
        g.clip();
        if (style === 'slit') {
          ellipse(g, x, yy, rx * 0.16, ry * 0.95);
          g.fillStyle = '#120c0a';
          g.fill();
        } else {
          circle(g, x + s * 0.3, yy + 0.3, ry * 1.02);
          g.fillStyle = domeFill(g, x, yy, ry, iris, 0.4);
          g.fill();
          circle(g, x + s * 0.3, yy + 0.3, ry * 0.48);
          g.fillStyle = '#120c0a';
          g.fill();
        }
        circle(g, x - rx * 0.28, yy - ry * 0.32, ry * 0.32);
        g.fillStyle = 'rgba(255,255,255,0.9)';
        g.fill();
        g.restore();
        ellipse(g, x, yy, rx, ry, tilt);
        g.strokeStyle = alpha(INK, 0.85);
        g.lineWidth = 1;
        g.stroke();
        // upper lid
        g.beginPath();
        g.ellipse(x, yy, rx, ry, tilt, Math.PI * 1.08, Math.PI * 1.92);
        g.strokeStyle = INK;
        g.lineWidth = 2;
        g.stroke();
        if (style === 'narrow' || o.brows === 'angry' || o.brows === 'heavy') {
          // lowered lid over the inner top
          g.save();
          ellipse(g, x, yy, rx + 0.5, ry + 0.5, tilt);
          g.clip();
          poly(g, [[x - s * rx * 1.2, yy - ry * 1.4], [x + s * rx * 1.4, yy - ry * 1.4], [x + s * rx * 1.4, yy - ry * 0.8], [x - s * rx * 1.2, yy - ry * 0.05]]);
          paint(g, shade(b.skin, -0.12), INK, 1.4);
          g.restore();
        }
      }
    }
  }
  if (o.eyepatch) {
    const x = HX - ex;
    line(g, HX - hw * 1.05, ey - hh * 0.5, HX + hw * 1.05, ey - hh * 0.05, '#1a1414', 1.4);
    ellipse(g, x, yy + 0.5, rx * 1.35, ry * 1.65);
    paint(g, '#1d1a1a', INK, 1.2);
  }
}

function drawBrows(b: B) {
  const { g, o, HX, hw, hh, ey } = b;
  const kind = o.brows ?? 'calm';
  if (kind === 'none' || o.skull || o.noFace) return;
  const col = o.snout ? shade(b.skin, -0.45) : (o.hair === 'bald' || o.hair === 'none' ? shade(b.skin, -0.42) : shade(b.hair, -0.25));
  const ex = hw * 0.42;
  const by = ey - hh * 0.27;
  let dIn = 0, dOut = 0;
  switch (kind) {
    case 'angry': dIn = 2.4; dOut = -2; break;
    case 'heavy': dIn = 2; dOut = -1; break;
    case 'raised': dIn = -2.2; dOut = -0.6; break;
    case 'worried': dIn = -2.6; dOut = 1.4; break;
    case 'sly': dIn = 1.5; dOut = -1.5; break;
  }
  for (const s of [-1, 1]) {
    let din = dIn, dout = dOut;
    if (kind === 'sly' && s > 0) { din = -1.8; dout = -1; }
    const x1 = HX + s * ex * 0.4, x2 = HX + s * ex * 1.55;
    g.beginPath();
    g.moveTo(x1, by + din);
    g.quadraticCurveTo((x1 + x2) / 2, by - 1.6 + (din + dout) / 2, x2, by + dout + 1);
    g.strokeStyle = col;
    g.lineWidth = kind === 'heavy' ? 4 : 2.8;
    g.lineCap = 'round';
    g.stroke();
  }
}

function drawNose(b: B) {
  const { g, o, HX, HY, hw, hh, ey, skin } = b;
  const kind = o.nose ?? 'small';
  if (kind === 'none' || o.snout || o.skull || o.noFace || o.wraps) return;
  const ny = HY + hh * 0.36;
  const sh = alpha(shade(skin, -0.55), 0.75);
  switch (kind) {
    case 'small': {
      g.beginPath();
      g.moveTo(HX + 1, ey + hh * 0.08);
      g.quadraticCurveTo(HX + hw * 0.2, ny - 1, HX + hw * 0.1, ny + 1.5);
      g.quadraticCurveTo(HX, ny + 2.5, HX - hw * 0.1, ny + 1.5);
      g.strokeStyle = sh; g.lineWidth = 1.4; g.stroke();
      break;
    }
    case 'button':
    case 'big': {
      const rx = hw * (kind === 'button' ? 0.24 : 0.22), ryy = hw * (kind === 'button' ? 0.22 : 0.2);
      ellipse(g, HX, ny - 1, rx, ryy);
      paint(g, domeFill(g, HX, ny - 2, rx * 1.2, mix(skin, '#d0706a', 0.18), 0.35), alpha(INK, 0.8), 1.3);
      if (kind === 'big') {
        g.beginPath();
        g.moveTo(HX - hw * 0.08, ey); g.quadraticCurveTo(HX - hw * 0.14, ny - 3, HX - hw * 0.18, ny - 2);
        g.strokeStyle = sh; g.lineWidth = 1.2; g.stroke();
      }
      break;
    }
    case 'flat': {
      ellipse(g, HX, ny, hw * 0.28, hw * 0.17);
      paint(g, domeFill(g, HX, ny - 1, hw * 0.3, skin, 0.3), alpha(INK, 0.7), 1.2);
      for (const s of [-1, 1]) {
        ellipse(g, HX + s * hw * 0.11, ny + 1, 1.6, 1.2);
        g.fillStyle = '#1a1010';
        g.fill();
      }
      break;
    }
    case 'hook': {
      g.beginPath();
      g.moveTo(HX - 2, ey);
      g.quadraticCurveTo(HX + hw * 0.3, ny - 4, HX + hw * 0.22, ny + 7);
      g.quadraticCurveTo(HX + hw * 0.05, ny + 4, HX - hw * 0.15, ny + 2);
      g.closePath();
      paint(g, domeFill(g, HX, ny, 10, shade(skin, 0.05), 0.3), INK, 1.3);
      circle(g, HX + hw * 0.18, ny - 4, 1.5);
      paint(g, shade(skin, -0.25), null);
      break;
    }
    case 'long': {
      poly(g, [[HX - 2.2, ey + 1], [HX + 2.2, ey + 1], [HX + hw * 0.12, ny + 9], [HX - hw * 0.1, ny + 6]]);
      paint(g, domeFill(g, HX, ny, 10, skin, 0.3), INK, 1.3);
      break;
    }
  }
}

function drawMouth(b: B, small = false) {
  const { g, o, HX, HY, hw, hh } = b;
  const kind = o.mouth ?? 'neutral';
  if (kind === 'none' || o.snout || o.skull || o.noFace || o.wraps) return;
  const my = HY + hh * 0.62;
  const w = small ? hw * 0.22 : hw * 0.32;
  g.lineCap = 'round';
  switch (kind) {
    case 'neutral':
      g.beginPath(); g.moveTo(HX - w, my); g.quadraticCurveTo(HX, my + 1, HX + w, my);
      g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
      break;
    case 'smile':
      g.beginPath(); g.moveTo(HX - w, my - 1.5); g.quadraticCurveTo(HX, my + 4, HX + w, my - 1.5);
      g.strokeStyle = INK; g.lineWidth = 1.7; g.stroke();
      break;
    case 'smirk':
      g.beginPath(); g.moveTo(HX - w * 0.9, my + 0.5); g.quadraticCurveTo(HX + w * 0.2, my + 2, HX + w, my - 2.5);
      g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke();
      break;
    case 'frown':
      g.beginPath(); g.moveTo(HX - w, my + 1.5); g.quadraticCurveTo(HX, my - 2.5, HX + w, my + 1.5);
      g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke();
      break;
    case 'grin':
    case 'teeth': {
      g.beginPath();
      g.moveTo(HX - w * 1.15, my - 2);
      g.quadraticCurveTo(HX, my - 0.5, HX + w * 1.15, my - 2);
      g.quadraticCurveTo(HX, my + 7, HX - w * 1.15, my - 2);
      g.closePath();
      paint(g, kind === 'teeth' ? '#e9dfc0' : '#f6f0e2', INK, 1.4);
      g.beginPath();
      if (kind === 'teeth') {
        g.moveTo(HX - w * 1.1, my - 1.5);
        for (let i = 1; i <= 8; i++) g.lineTo(HX - w * 1.1 + (w * 2.2 * i) / 8, my + (i % 2 ? 2.8 : -0.8));
      } else {
        g.moveTo(HX - w * 0.9, my + 0.8); g.quadraticCurveTo(HX, my + 2.2, HX + w * 0.9, my + 0.8);
        g.moveTo(HX - w * 0.4, my - 0.8); g.lineTo(HX - w * 0.4, my + 2.8);
        g.moveTo(HX + w * 0.4, my - 0.8); g.lineTo(HX + w * 0.4, my + 2.8);
      }
      g.strokeStyle = alpha(INK, 0.75); g.lineWidth = 0.8; g.stroke();
      break;
    }
    case 'snarl':
    case 'maw':
    case 'open': {
      const mh = kind === 'open' ? 10 : kind === 'maw' ? 6 : 5;
      const mw = kind === 'maw' ? w * 1.7 : w * 1.1;
      g.beginPath();
      g.moveTo(HX - mw, my - 1);
      g.quadraticCurveTo(HX, my - 3.5, HX + mw, my - 1);
      g.quadraticCurveTo(HX + mw * 0.6, my + mh, HX, my + mh);
      g.quadraticCurveTo(HX - mw * 0.6, my + mh, HX - mw, my - 1);
      g.closePath();
      paint(g, '#3a1216', INK, 1.5);
      if (kind !== 'open') {
        g.fillStyle = '#f4ecd8';
        const n = kind === 'maw' ? 7 : 4;
        for (let i = 0; i < n; i++) {
          const x = HX - mw * 0.8 + (mw * 1.6 * (i + 0.5)) / n;
          poly(g, [[x - 1.8, my - 1.8], [x + 1.8, my - 1.8], [x, my + 2.6]]);
          g.fill();
          if (kind === 'maw') {
            poly(g, [[x - 1.6, my + mh - 0.5], [x + 1.6, my + mh - 0.5], [x, my + mh - 3.8]]);
            g.fill();
          }
        }
        if (kind === 'snarl') {
          for (const s of [-1, 1]) {
            poly(g, [[HX + s * mw * 0.75, my - 1.5], [HX + s * mw * 0.5, my - 1.5], [HX + s * mw * 0.62, my + 4.5]]);
            paint(g, '#f4ecd8', INK, 0.7);
          }
        }
      }
      break;
    }
    case 'fangs': {
      g.beginPath(); g.moveTo(HX - w, my - 1); g.quadraticCurveTo(HX, my + 2.5, HX + w, my - 1);
      g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke();
      for (const s of [-1, 1]) {
        poly(g, [[HX + s * w * 0.3, my + 0.5], [HX + s * w * 0.62, my], [HX + s * w * 0.5, my + 5]]);
        paint(g, '#f8f4ea', INK, 0.8);
      }
      break;
    }
  }
}

function drawTusks(b: B) {
  const { g, o, HX, HY, hw, hh } = b;
  if (!o.tusks) return;
  const k = o.tusks === 'big' ? 1 : 0.6;
  const my = HY + hh * 0.66;
  for (const s of [-1, 1]) {
    taper(g, [[HX + s * hw * 0.34, my + 2], [HX + s * hw * 0.42, my - 3 * k], [HX + s * hw * 0.5, my - 9 * k]], 4.6 * k + 1, 0.6, 3);
    paint(g, domeFill(g, HX + s * hw * 0.4, my - 3, 6, '#efe6c8', 0.4), INK, 1.2);
  }
}

function drawBeard(b: B) {
  const { g, o, HX, HY, hw, hh } = b;
  const kind = o.beard ?? 'none';
  if (kind === 'none' || o.snout || o.skull || o.noFace) return;
  const col = o.beardColor ?? b.hair;
  if (kind === 'stubble') {
    g.save();
    facePath(b);
    g.clip();
    blob(g, [[HX - hw * 1.1, HY + hh * 0.05], [HX - hw * 0.45, HY + hh * 0.42], [HX, HY + hh * 0.4], [HX + hw * 0.45, HY + hh * 0.42], [HX + hw * 1.1, HY + hh * 0.05], [HX + hw, HY + hh * 1.3], [HX - hw, HY + hh * 1.3]]);
    g.fillStyle = alpha(shade(col, -0.1), 0.38);
    g.fill();
    g.restore();
    return;
  }
  if (kind !== 'mustache') {
    const bot = kind === 'goatee' ? HY + hh * 1.22 : kind === 'short' ? HY + hh * 1.2 : kind === 'full' ? HY + hh * 1.45 : 97;
    const bw = kind === 'goatee' ? hw * 0.3 : kind === 'short' ? hw * 0.6 : kind === 'full' ? hw * 0.7 : hw * 0.45;
    const side = kind === 'goatee' ? 0.32 : 1.04;
    const pts = kind === 'goatee'
      ? [[HX - hw * 0.34, HY + hh * 0.72], [HX + hw * 0.34, HY + hh * 0.72], [HX + bw, HY + hh * 1.0], [HX, bot + 4], [HX - bw, HY + hh * 1.0]]
      : [[HX - hw * side, HY - hh * 0.05], [HX - hw * 0.65, HY + hh * 0.42], [HX - hw * 0.25, HY + hh * 0.46], [HX, HY + hh * 0.42], [HX + hw * 0.25, HY + hh * 0.46], [HX + hw * 0.65, HY + hh * 0.42], [HX + hw * side, HY - hh * 0.05], [HX + hw * 1.08, HY + hh * 0.6], [HX + bw + 4, bot - 8], [HX + bw, bot], [HX, bot + 4], [HX - bw, bot], [HX - bw - 4, bot - 8], [HX - hw * 1.08, HY + hh * 0.6]];
    if (kind === 'forked') {
      pts.splice(9, 3, [HX + bw, bot], [HX + 2, bot - 10], [HX - 2, bot - 10], [HX - bw, bot]);
    }
    blob(g, pts);
    paint(g, domeFill(g, HX - 4, HY + hh * 0.7, hh, col, 0.3), INK, LW * 0.9);
    // strands
    g.strokeStyle = alpha(shade(col, -0.45), 0.6);
    g.lineWidth = 1;
    g.beginPath();
    for (let i = 0; i < 7; i++) {
      const x = HX - hw * 0.7 + i * hw * 0.23;
      g.moveTo(x, HY + hh * 0.75); g.quadraticCurveTo(x + (x - HX) * 0.1, (HY + hh * 0.9 + bot) / 2, HX + (x - HX) * 0.5, bot - 3);
    }
    g.stroke();
    if (kind === 'braided') {
      for (const s of [-1, 1]) {
        const bx = HX + s * hw * 0.3;
        for (let i = 0; i < 2; i++) {
          rr(g, bx - 3.4, bot - 18 + i * 9, 6.8, 3.2, 1.2);
          paint(g, '#c9a24a', INK, 0.9);
        }
      }
    }
  }
  // mouth gap and mustache
  const my = HY + hh * 0.62;
  if (o.mouth !== 'none') {
    ellipse(g, HX, my + 1, hw * 0.22, o.mouth === 'grin' || o.mouth === 'open' ? 2.6 : 1.2);
    g.fillStyle = '#2a1414';
    g.fill();
  }
  const mk = kind === 'mustache' ? 1.25 : 1;
  for (const s of [-1, 1]) {
    blob(g, [[HX, HY + hh * 0.42], [HX + s * hw * 0.3 * mk, HY + hh * 0.42], [HX + s * hw * 0.55 * mk, HY + hh * 0.55], [HX + s * hw * 0.62 * mk, HY + hh * (0.72 + (mk - 1) * 0.2)], [HX + s * hw * 0.3, HY + hh * 0.6], [HX, HY + hh * 0.56]]);
    paint(g, domeFill(g, HX + s * 5, HY + hh * 0.48, 8, shade(col, 0.05), 0.3), INK, 1.2);
  }
}

function drawMask(b: B) {
  const { g, o, HX, HY, hw, hh, ey } = b;
  if (!o.mask) return;
  g.save();
  facePath(b, 0.8);
  g.clip();
  const y0 = ey + hh * 0.2;
  g.beginPath();
  g.moveTo(HX - hw * 1.3, y0 + 1);
  g.quadraticCurveTo(HX - hw * 0.3, y0 + 2, HX, y0 - 2);
  g.quadraticCurveTo(HX + hw * 0.3, y0 + 2, HX + hw * 1.3, y0 + 1);
  g.lineTo(HX + hw * 1.3, HY + hh * 1.5);
  g.lineTo(HX - hw * 1.3, HY + hh * 1.5);
  g.closePath();
  paint(g, litFill(g, HX - hw, y0, hw * 2, hh, o.mask, 0.25), INK, 1.6);
  g.strokeStyle = alpha(shade(o.mask, -0.5), 0.7);
  g.lineWidth = 1.1;
  g.beginPath();
  g.moveTo(HX - hw * 0.6, y0 + 5); g.quadraticCurveTo(HX - hw * 0.1, y0 + 10, HX - hw * 0.3, HY + hh * 1.0);
  g.moveTo(HX + hw * 0.6, y0 + 6); g.quadraticCurveTo(HX + hw * 0.3, y0 + 11, HX + hw * 0.35, HY + hh * 1.0);
  g.stroke();
  g.restore();
}

function drawWarpaint(b: B) {
  const { g, o, HX, hw, hh, ey } = b;
  if (!o.warpaint) return;
  g.save();
  facePath(b);
  g.clip();
  g.beginPath();
  g.moveTo(HX - hw * 1.2, ey - hh * 0.16);
  g.quadraticCurveTo(HX, ey - hh * 0.26, HX + hw * 1.2, ey - hh * 0.16);
  g.lineTo(HX + hw * 1.2, ey + hh * 0.14);
  g.quadraticCurveTo(HX, ey + hh * 0.1, HX - hw * 1.2, ey + hh * 0.14);
  g.closePath();
  g.fillStyle = alpha(o.warpaint, 0.85);
  g.fill();
  // chin stripes
  g.beginPath();
  for (const s of [-1, 0, 1]) { g.moveTo(HX + s * hw * 0.22, b.HY + hh * 0.8); g.lineTo(HX + s * hw * 0.22, b.HY + hh * 1.05); }
  g.strokeStyle = alpha(o.warpaint, 0.85);
  g.lineWidth = 2.8;
  g.lineCap = 'round';
  g.stroke();
  g.restore();
}

function drawScar(b: B) {
  const { g, o, HX, hw, hh, ey } = b;
  if (!o.scar) return;
  const x = HX + hw * 0.45;
  g.beginPath();
  g.moveTo(x - 3, ey - hh * 0.45); g.lineTo(x + 3, ey + hh * 0.35);
  g.strokeStyle = alpha('#8a3a3a', 0.85); g.lineWidth = 2; g.stroke();
  g.beginPath();
  for (let i = 0; i < 3; i++) {
    const t = 0.2 + i * 0.3;
    const px = x - 3 + 6 * t, py = ey - hh * 0.45 + hh * 0.8 * t;
    g.moveTo(px - 2.5, py); g.lineTo(px + 2.5, py - 0.5);
  }
  g.strokeStyle = alpha('#5a2020', 0.8); g.lineWidth = 0.9; g.stroke();
}

// ---------------------------------------------------------------- hair

function capPts(b: B, vol: number, fringe: 'part' | 'fringe' | 'swept' | 'peak' | 'high', sideDrop: number): number[][] {
  const { HX, HY, hw, hh, ey } = b;
  const top = HY - hh * (1.12 + vol * 0.16);
  const ow = hw * (1.08 + vol * 0.12);
  const sideY = ey - 2 + sideDrop;
  const inner: number[][] = {
    part: [[HX + hw * 0.55, HY - hh * 0.5], [HX + hw * 0.12, HY - hh * 0.74], [HX - hw * 0.1, HY - hh * 0.6], [HX - hw * 0.55, HY - hh * 0.48]],
    fringe: [[HX + hw * 0.6, HY - hh * 0.3], [HX + hw * 0.2, HY - hh * 0.36], [HX - hw * 0.2, HY - hh * 0.34], [HX - hw * 0.6, HY - hh * 0.3]],
    swept: [[HX + hw * 0.55, HY - hh * 0.52], [HX + hw * 0.1, HY - hh * 0.5], [HX - hw * 0.35, HY - hh * 0.36], [HX - hw * 0.7, HY - hh * 0.22]],
    peak: [[HX + hw * 0.5, HY - hh * 0.62], [HX + hw * 0.1, HY - hh * 0.5], [HX, HY - hh * 0.4], [HX - hw * 0.1, HY - hh * 0.5], [HX - hw * 0.5, HY - hh * 0.62]],
    high: [[HX + hw * 0.55, HY - hh * 0.72], [HX, HY - hh * 0.8], [HX - hw * 0.55, HY - hh * 0.72]],
  }[fringe];
  return [
    [HX - ow, sideY],
    [HX - ow * 1.03, HY - hh * 0.55],
    [HX - hw * 0.74 * (1 + vol * 0.1), top + hh * 0.12],
    [HX, top],
    [HX + hw * 0.74 * (1 + vol * 0.1), top + hh * 0.12],
    [HX + ow * 1.03, HY - hh * 0.55],
    [HX + ow, sideY],
    [HX + hw * 0.88, sideY - 3],
    [HX + hw * 0.84, HY - hh * 0.38],
    ...inner,
    [HX - hw * 0.84, HY - hh * 0.38],
    [HX - hw * 0.88, sideY - 3],
  ];
}

function paintHair(b: B, pts: number[][]) {
  const { g, HX, HY, hh, hair } = b;
  blob(g, pts);
  paint(g, domeFill(g, HX - 6, HY - hh * 0.9, hh * 1.1, hair, 0.35), INK, LW);
  g.save();
  g.clip();
  g.strokeStyle = alpha(shade(hair, -0.45), 0.55);
  g.lineWidth = 1.1;
  g.beginPath();
  for (let i = 0; i < 6; i++) {
    const x = HX - 16 + i * 6.5;
    g.moveTo(x + 2, HY - hh * 1.2);
    g.quadraticCurveTo(x + (x - HX) * 0.3, HY - hh * 0.9, x + (x - HX) * 0.55, HY - hh * 0.5);
  }
  g.stroke();
  g.strokeStyle = alpha(shade(hair, 0.5), 0.45);
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(HX - 12, HY - hh * 0.9); g.quadraticCurveTo(HX - 6, HY - hh * 1.12, HX + 2, HY - hh * 1.08);
  g.stroke();
  g.restore();
}

function hairHidden(b: B) {
  const o = b.o;
  return o.hood === 'up' || o.helmet === 'great' || o.hat === 'turban' || o.hat === 'nemes' || o.bandana !== undefined || o.skull;
}

function drawHairBack(b: B) {
  const o = b.o;
  const h = o.hair ?? 'short';
  if (o.hood === 'up' || o.helmet === 'great') return;
  if (h === 'long' || h === 'braids' || h === 'stringy') drawLongHairBack(b, h === 'stringy' ? 0.9 : 1);
  else if (h === 'bob' || h === 'wild' || h === 'shaggy' || h === 'leafy') drawLongHairBack(b, 0.45);
  else if (h === 'flowing') drawFlowingHairBack(b);
  else if (h === 'ponytail') {
    const { g, HX, HY, hw, hh, hair } = b;
    taper(b.g, [[HX + hw * 0.6, HY - hh * 0.9], [HX + hw * 1.5, HY - hh * 0.6], [HX + hw * 1.5, HY + hh * 0.6], [HX + hw * 1.25, HY + hh * 1.4]], 12, 3);
    paint(g, domeFill(g, HX + hw * 1.3, HY, 20, shade(hair, -0.1), 0.3), INK, LW);
  }
}

/** Locks of long hair that fall in front of the shoulders. */
function drawHairLocks(b: B) {
  const { g, o, HX, HY, hw, hh, hair } = b;
  const h = o.hair ?? 'short';
  if (hairHidden(b) && o.hood !== 'up') return;
  if (o.hood === 'up' && h !== 'braids' && h !== 'long' && h !== 'flowing') return;
  if (h !== 'long' && h !== 'braids' && h !== 'stringy' && h !== 'flowing') return;
  for (const s of [-1, 1]) {
    if (h === 'braids') {
      const pts = [[HX + s * hw * 0.95, HY], [HX + s * hw * 1.15, HY + hh * 0.8], [HX + s * hw * 1.05, 92]];
      taper(g, pts, 8, 5);
      paint(g, domeFill(g, HX + s * hw, HY + hh, 14, hair, 0.3), INK, 1.5);
      g.strokeStyle = alpha(shade(hair, -0.5), 0.75);
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const y = HY + hh * 0.3 + i * 6.5;
        const x = HX + s * hw * (1.04 + Math.min(0.11, i * 0.03));
        g.moveTo(x - 3.5, y - 2); g.quadraticCurveTo(x, y + 2, x + 3.5, y - 2);
      }
      g.stroke();
      rr(g, HX + s * hw * 1.05 - 3, 88, 6, 3.4, 1.2);
      paint(g, b.accent, INK, 0.8);
      continue;
    }
    const w = h === 'stringy' ? 5 : 9;
    taper(g, [[HX + s * hw * 0.92, HY - hh * 0.3], [HX + s * hw * 1.18, HY + hh * 0.6], [HX + s * hw * 1.12, 90]], w, 2.5);
    paint(g, domeFill(g, HX + s * hw, HY + hh * 0.6, 16, hair, 0.3), INK, 1.5);
  }
}

function drawHairFront(b: B) {
  const { g, o, HX, HY, hw, hh, hair, r } = b;
  const h = o.hair ?? 'short';
  if (h === 'none' || o.skull) return;
  if (o.hood === 'up' || o.helmet === 'great' || o.hat === 'turban' || o.hat === 'nemes' || o.bandana) return;
  const scalp = () => {
    ellipse(g, HX - hw * 0.3, HY - hh * 0.8, hw * 0.35, hh * 0.15, -0.4);
    g.fillStyle = 'rgba(255,255,255,0.22)';
    g.fill();
  };
  switch (h) {
    case 'bald':
      scalp();
      return;
    case 'short':
      return paintHair(b, capPts(b, 0, 'part', 0));
    case 'slick':
      return paintHair(b, capPts(b, -0.25, 'peak', -1));
    case 'long':
    case 'stringy':
      return paintHair(b, capPts(b, 0.08, 'part', 4));
    case 'bob':
      return paintHair(b, capPts(b, 0.15, 'fringe', 8));
    case 'braids':
      return paintHair(b, capPts(b, 0, 'part', 2));
    case 'flowing':
      return paintHair(b, capPts(b, 0.2, 'swept', 5));
    case 'ponytail':
      return paintHair(b, capPts(b, -0.1, 'high', 0));
    case 'bun': {
      circle(g, HX, HY - hh * 1.25, hh * 0.38);
      paint(g, domeFill(g, HX, HY - hh * 1.28, hh * 0.4, hair, 0.35), INK, LW * 0.9);
      return paintHair(b, capPts(b, -0.1, 'part', 0));
    }
    case 'wild':
    case 'shaggy':
    case 'leafy': {
      const pts = capPts(b, h === 'shaggy' ? 0.45 : 0.3, h === 'shaggy' ? 'fringe' : 'swept', h === 'shaggy' ? 6 : 2);
      // spikes on the outer edge
      const outer = pts.slice(0, 7);
      const spiky: number[][] = [];
      for (let i = 0; i < outer.length - 1; i++) {
        const [x1, y1] = outer[i], [x2, y2] = outer[i + 1];
        spiky.push(outer[i]);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const dx = mx - HX, dy = my - HY, d = Math.hypot(dx, dy) || 1;
        spiky.push([mx + (dx / d) * (5 + r() * 3), my + (dy / d) * (5 + r() * 3)]);
      }
      spiky.push(outer[outer.length - 1]);
      paintHair(b, [...spiky, ...pts.slice(7)]);
      if (h === 'leafy') {
        for (let i = 0; i < 7; i++) {
          const a = Math.PI * (1.1 + (i / 6) * 0.8);
          leaf(g, HX + Math.cos(a) * hw * 1.1, HY - hh * 0.3 + Math.sin(a) * hh * 0.95, 11, 4, a + Math.PI / 2, o.trim ?? '#6fa04a');
        }
      }
      return;
    }
    case 'curly': {
      const pts = capPts(b, 0.2, 'fringe', 0);
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (1.0 + (i / 8));
        const x = HX + Math.cos(a) * hw * 1.05, y = HY - hh * 0.45 + Math.sin(a) * hh * 0.78;
        circle(g, x, y, 5.6);
        paint(g, domeFill(g, x, y, 6, hair, 0.35), INK, 1.4);
      }
      paintHair(b, pts);
      g.strokeStyle = alpha(shade(hair, -0.5), 0.7);
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 0; i < 7; i++) {
        const x = HX - hw * 0.75 + i * hw * 0.25, y = HY - hh * (0.6 + (i % 2) * 0.25);
        g.moveTo(x + 2.5, y); g.arc(x, y, 2.5, 0, Math.PI * 1.5);
      }
      g.stroke();
      return;
    }
    case 'mohawk': {
      scalp();
      g.beginPath();
      g.moveTo(HX - 5, HY - hh * 0.55);
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        const x = HX - 6 + t * 12 + (i % 2 ? 0 : 0);
        const y = HY - hh * (1.05 + (i % 2 ? 0.55 : 0.25)) - Math.sin(t * Math.PI) * 4;
        g.lineTo(x, y);
      }
      g.lineTo(HX + 5, HY - hh * 0.55);
      g.closePath();
      paint(g, domeFill(g, HX - 2, HY - hh * 1.2, 14, hair, 0.35), INK, 1.6);
      return;
    }
    case 'topknot': {
      scalp();
      circle(g, HX, HY - hh * 1.2, 6);
      paint(g, domeFill(g, HX, HY - hh * 1.22, 6, hair, 0.35), INK, 1.5);
      rr(g, HX - 4, HY - hh * 1.1, 8, 3, 1.2);
      paint(g, b.accent, INK, 0.9);
      return;
    }
    case 'tonsure': {
      scalp();
      for (const s of [-1, 1]) {
        blob(g, [[HX + s * hw * 0.55, HY - hh * 0.95], [HX + s * hw * 1.12, HY - hh * 0.55], [HX + s * hw * 1.08, b.ey], [HX + s * hw * 0.9, b.ey - 2], [HX + s * hw * 0.85, HY - hh * 0.5], [HX + s * hw * 0.45, HY - hh * 0.75]]);
        paint(g, domeFill(g, HX + s * hw * 0.8, HY - hh * 0.6, 12, hair, 0.3), INK, 1.4);
      }
      return;
    }
    case 'tufts': {
      scalp();
      for (const s of [-1, 1]) {
        const cx = HX + s * hw * 1.0, cy = HY - hh * 0.55;
        blob(g, [[cx - s * 3, cy - 9], [cx + s * 8, cy - 12], [cx + s * 15, cy - 4], [cx + s * 12, cy + 3], [cx + s * 16, cy + 8], [cx + s * 4, cy + 12], [cx - s * 3, cy + 6]]);
        paint(g, domeFill(g, cx, cy - 2, 14, hair, 0.35), INK, 1.6);
      }
      // a wisp on top
      taper(g, [[HX - 2, HY - hh * 1.0], [HX + 2, HY - hh * 1.35], [HX + 9, HY - hh * 1.4]], 5, 1, 4);
      paint(g, hair, INK, 1.2);
      return;
    }
    case 'fin': {
      g.beginPath();
      g.moveTo(HX - 5, HY - hh * 0.6);
      g.lineTo(HX - 3, HY - hh * 1.5);
      g.quadraticCurveTo(HX, HY - hh * 1.3, HX + 2, HY - hh * 1.62);
      g.quadraticCurveTo(HX + 4, HY - hh * 1.3, HX + 6, HY - hh * 1.45);
      g.lineTo(HX + 5, HY - hh * 0.6);
      g.closePath();
      paint(g, litFill(g, HX - 6, HY - hh * 1.6, 12, hh, hair, 0.3), INK, 1.5);
      g.strokeStyle = alpha(shade(hair, -0.5), 0.7);
      g.lineWidth = 0.9;
      g.beginPath();
      g.moveTo(HX - 2, HY - hh * 0.7); g.lineTo(HX - 3, HY - hh * 1.4);
      g.moveTo(HX + 2, HY - hh * 0.7); g.lineTo(HX + 2, HY - hh * 1.5);
      g.stroke();
      return;
    }
  }
}

// ---------------------------------------------------------------- headgear

function hoodOuter(b: B) {
  const { HX, HY, hw, hh } = b;
  return [[HX, HY - hh - 17], [HX + hw + 10, HY - hh * 0.75], [HX + hw + 13, HY + hh * 0.2], [HX + hw + 14, HY + hh + 6], [HX + hw + 22, b.top + 10], [HX - hw - 22, b.top + 10], [HX - hw - 14, HY + hh + 6], [HX - hw - 13, HY + hh * 0.2], [HX - hw - 10, HY - hh * 0.75]];
}

function hoodInterior(b: B) {
  const { g, o, HX, HY, hw, hh } = b;
  const col = o.coif ? (o.metal ?? '#9ea4ab') : (o.hoodColor ?? o.cloak ?? '#4a4038');
  ellipse(g, HX, HY + hh * 0.15, hw * 1.08, hh * 1.08);
  g.fillStyle = shade(col, -0.75);
  g.fill();
}

function drawHoodFrame(b: B) {
  const { g, o, HX, HY, hw, hh } = b;
  const col = o.coif ? (o.metal ?? '#9ea4ab') : (o.hoodColor ?? o.cloak ?? '#4a4038');
  const outer = hoodOuter(b);
  const op = { x: HX, y: HY + hh * (o.coif ? 0.18 : 0.12), rx: hw * (o.coif ? 0.94 : 1.0), ry: hh * (o.coif ? 0.94 : 1.0) };
  blob(g, outer);
  g.ellipse(op.x, op.y, op.rx, op.ry, 0, 0, Math.PI * 2, true);
  g.fillStyle = domeFill(g, HX - 8, HY - hh * 0.6, hh * 2, col, 0.32);
  g.fill('evenodd');
  if (o.coif) {
    g.save();
    blob(g, outer);
    g.ellipse(op.x, op.y, op.rx, op.ry, 0, 0, Math.PI * 2, true);
    g.clip('evenodd');
    g.setLineDash([0.1, 3.4]);
    g.lineCap = 'round';
    for (let y = HY - hh - 18, row = 0; y < b.top + 12; y += 3.7, row++) {
      g.beginPath(); g.moveTo(row % 2 ? 1.7 : 0, y); g.lineTo(100, y);
      g.strokeStyle = alpha(shade(col, -0.55), 0.9); g.lineWidth = 2.4; g.stroke();
    }
    g.setLineDash([]);
    g.restore();
  } else {
    // folds
    g.strokeStyle = alpha(shade(col, -0.55), 0.55);
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(HX - hw - 6, HY - hh * 0.5); g.quadraticCurveTo(HX - hw - 9, HY + hh * 0.4, HX - hw - 8, HY + hh + 6);
    g.moveTo(HX + hw + 6, HY - hh * 0.5); g.quadraticCurveTo(HX + hw + 9, HY + hh * 0.4, HX + hw + 8, HY + hh + 6);
    g.stroke();
  }
  blob(g, outer);
  g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
  ellipse(g, op.x, op.y, op.rx, op.ry);
  g.strokeStyle = INK; g.lineWidth = LW * 0.9; g.stroke();
  // shadow inside the top of the opening
  g.save();
  ellipse(g, op.x, op.y, op.rx, op.ry);
  g.clip();
  const sg = g.createLinearGradient(0, op.y - op.ry, 0, op.y - op.ry * 0.1);
  sg.addColorStop(0, 'rgba(0,0,0,0.6)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sg;
  g.fillRect(HX - hw * 1.2, op.y - op.ry, hw * 2.4, op.ry);
  g.restore();
}

function domeHelm(b: B, lowY: number) {
  const { g, HX, HY, hw, hh } = b;
  g.beginPath();
  g.moveTo(HX - hw * 1.13, lowY);
  g.bezierCurveTo(HX - hw * 1.2, HY - hh * 1.2, HX - hw * 0.6, HY - hh * 1.32, HX, HY - hh * 1.32);
  g.bezierCurveTo(HX + hw * 0.6, HY - hh * 1.32, HX + hw * 1.2, HY - hh * 1.2, HX + hw * 1.13, lowY);
  g.quadraticCurveTo(HX, lowY - hh * 0.22, HX - hw * 1.13, lowY);
  g.closePath();
}

function drawHelmet(b: B) {
  const { g, o, HX, HY, hw, hh, ey, accent } = b;
  const metal = o.metal ?? '#9ea4ab';
  const kind = o.helmet!;
  if (kind === 'great') {
    blob(g, [[HX, HY - hh * 1.3], [HX + hw * 0.95, HY - hh * 1.15], [HX + hw * 1.2, HY - hh * 0.4], [HX + hw * 1.18, HY + hh * 0.75], [HX + hw * 0.9, HY + hh * 1.18], [HX - hw * 0.9, HY + hh * 1.18], [HX - hw * 1.18, HY + hh * 0.75], [HX - hw * 1.2, HY - hh * 0.4], [HX - hw * 0.95, HY - hh * 1.15]]);
    paint(g, domeFill(g, HX - 7, HY - hh * 0.5, hh * 1.6, metal, 0.45), INK, LW);
    // ridge
    line(g, HX, HY - hh * 1.25, HX, HY + hh * 1.1, alpha(shade(metal, -0.5), 0.7), 1.4);
    // visor slit
    rr(g, HX - hw * 0.95, ey - 2.6, hw * 1.9, 5.2, 2);
    paint(g, '#0c0a0c', INK, 1.2);
    if (o.visorGlow) {
      for (const s of [-1, 1]) glow(g, HX + s * hw * 0.42, ey, 9, o.visorGlow, 0.9);
      for (const s of [-1, 1]) {
        ellipse(g, HX + s * hw * 0.42, ey, 3.2, 1.6);
        g.fillStyle = shade(o.visorGlow, 0.5);
        g.fill();
      }
    }
    rr(g, HX - 2.2, ey - 3, 4.4, hh * 0.9, 1.2);
    paint(g, shade(metal, 0.1), INK, 1);
    // breaths
    g.fillStyle = '#0c0a0c';
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      circle(g, HX + s * hw * (0.35 + i * 0.18), HY + hh * 0.55 + i * 1.5, 1.2);
      g.fill();
    }
    // plume
    g.beginPath();
    g.moveTo(HX - 3, HY - hh * 1.25);
    g.bezierCurveTo(HX - 6, HY - hh * 2.0, HX + 18, HY - hh * 2.1, HX + 26, HY - hh * 1.2);
    g.bezierCurveTo(HX + 16, HY - hh * 1.6, HX + 4, HY - hh * 1.5, HX + 3, HY - hh * 1.25);
    g.closePath();
    paint(g, litFill(g, HX - 6, HY - hh * 2, 32, hh, o.plume ?? accent, 0.3), INK, 1.4);
    return;
  }
  const lowY = kind === 'kettle' ? HY - hh * 0.5 : HY - hh * 0.36;
  if (kind === 'crest') {
    g.beginPath();
    g.moveTo(HX - 5, HY - hh * 1.2);
    g.bezierCurveTo(HX - 8, HY - hh * 1.9, HX + 8, HY - hh * 1.95, HX + 22, HY - hh * 1.5);
    g.lineTo(HX + 5, HY - hh * 1.15);
    g.closePath();
    paint(g, litFill(g, HX - 8, HY - hh * 1.95, 30, hh, o.plume ?? accent, 0.3), INK, 1.5);
    g.strokeStyle = alpha(shade(o.plume ?? accent, -0.5), 0.6);
    g.lineWidth = 1;
    g.beginPath();
    for (let i = 0; i < 5; i++) { g.moveTo(HX - 3 + i * 4, HY - hh * 1.25); g.lineTo(HX - 4 + i * 6, HY - hh * (1.75 - i * 0.04)); }
    g.stroke();
  }
  if (kind === 'horned') {
    for (const s of [-1, 1]) {
      taper(g, [[HX + s * hw * 0.85, HY - hh * 0.7], [HX + s * hw * 1.55, HY - hh * 0.95], [HX + s * hw * 1.7, HY - hh * 1.6]], 8, 0.6);
      paint(g, domeFill(g, HX + s * hw * 1.4, HY - hh * 1.1, 14, o.hornColor ?? '#e9dfc4', 0.4), INK, 1.5);
    }
  }
  if (kind === 'winged') {
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const bx = HX + s * hw * 0.95, by = HY - hh * (0.62 + i * 0.12);
        taper(g, [[bx, by], [bx + s * (9 + i * 3), by - 8 - i * 4], [bx + s * (12 + i * 5), by - 18 - i * 6]], 6.5, 1.5, 4);
        paint(g, domeFill(g, bx + s * 8, by - 10, 14, i % 2 ? '#e8eef2' : '#ffffff', 0.25), INK, 1.2);
      }
    }
  }
  domeHelm(b, lowY);
  paint(g, domeFill(g, HX - 7, HY - hh * 0.95, hh * 1.1, metal, 0.5), INK, LW);
  // band
  g.beginPath();
  g.moveTo(HX - hw * 1.12, lowY);
  g.quadraticCurveTo(HX, lowY - hh * 0.22, HX + hw * 1.12, lowY);
  g.strokeStyle = INK; g.lineWidth = 5.5; g.stroke();
  g.strokeStyle = shade(metal, -0.2); g.lineWidth = 3.6; g.stroke();
  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5, x = HX - hw * 1.05 + t * hw * 2.1;
    const y = lowY - Math.sin(t * Math.PI) * hh * 0.11;
    circle(g, x, y, 1.1);
    g.fillStyle = shade(metal, 0.5);
    g.fill();
  }
  line(g, HX, HY - hh * 1.3, HX, lowY - hh * 0.12, alpha(shade(metal, -0.5), 0.6), 1.2);
  if (kind === 'nasal') {
    rr(g, HX - 2.4, lowY - 3, 4.8, hh * 0.62, 1.5);
    paint(g, litFill(g, HX - 2.4, lowY, 4.8, hh * 0.6, metal, 0.3), INK, 1.2);
  }
  if (kind === 'spiked') {
    poly(g, [[HX - 4, HY - hh * 1.26], [HX, HY - hh * 1.9], [HX + 4, HY - hh * 1.26]]);
    paint(g, domeFill(g, HX, HY - hh * 1.5, 8, metal, 0.5), INK, 1.3);
  }
  if (kind === 'kettle') {
    ellipse(g, HX, lowY + 1, hw * 1.65, 5.5);
    paint(g, litFill(g, HX - hw * 1.65, lowY - 5, hw * 3.3, 11, metal, 0.35), INK, LW * 0.9);
    ellipse(g, HX, lowY - 0.5, hw * 1.3, 3);
    g.strokeStyle = alpha(shade(metal, -0.5), 0.6); g.lineWidth = 1; g.stroke();
  }
}

function drawHat(b: B) {
  const { g, o, HX, HY, hw, hh, accent } = b;
  const col = o.hatColor ?? accent;
  const band = o.plume ?? shade(col, 0.45);
  switch (o.hat) {
    case 'wizard':
    case 'witch': {
      const by = HY - hh * 0.62;
      const witch = o.hat === 'witch';
      ellipse(g, HX, by, hw * (witch ? 1.9 : 1.75), 6.5, witch ? 0.08 : -0.06);
      paint(g, litFill(g, HX - hw * 1.8, by - 6, hw * 3.6, 12, shade(col, -0.1), 0.3), INK, LW);
      g.beginPath();
      g.moveTo(HX - hw * 0.95, by);
      if (witch) {
        g.quadraticCurveTo(HX - hw * 0.4, by - 22, HX - 4, by - 34);
        g.lineTo(HX - 18, by - 46);
        g.lineTo(HX + 2, by - 37);
        g.quadraticCurveTo(HX + hw * 0.5, by - 18, HX + hw * 0.95, by);
      } else {
        g.quadraticCurveTo(HX - hw * 0.35, by - 24, HX + 2, by - 38);
        g.quadraticCurveTo(HX + 14, by - 46, HX + 26, by - 34);
        g.quadraticCurveTo(HX + 14, by - 37, HX + 8, by - 30);
        g.quadraticCurveTo(HX + hw * 0.55, by - 14, HX + hw * 0.95, by);
      }
      g.closePath();
      paint(g, litFill(g, HX - hw, by - 40, hw * 2, 40, col, 0.3), INK, LW);
      // band
      g.beginPath();
      g.moveTo(HX - hw * 0.95, by);
      g.quadraticCurveTo(HX, by + 3, HX + hw * 0.95, by);
      g.lineTo(HX + hw * 0.78, by - 6);
      g.quadraticCurveTo(HX, by - 3, HX - hw * 0.78, by - 6);
      g.closePath();
      paint(g, witch ? '#3a2a1e' : band, INK, 1.2);
      if (witch) {
        rr(g, HX - 3, by - 6, 6, 6, 1);
        paint(g, '#c9a24a', INK, 0.9);
      } else {
        sparkle(g, HX + 1, by - 18, 4.2, band);
        sparkle(g, HX - 6, by - 27, 2.4, band);
      }
      // front brim lip
      g.beginPath();
      g.ellipse(HX, by, hw * (witch ? 1.9 : 1.75), 6.5, witch ? 0.08 : -0.06, 0.1, Math.PI - 0.1);
      g.strokeStyle = alpha(shade(col, 0.4), 0.7); g.lineWidth = 1.4; g.stroke();
      break;
    }
    case 'feather': {
      // plume first so the cap overlaps its root
      const fc = o.plume ?? '#f2f0e6';
      taper(g, [[HX - hw * 0.3, HY - hh * 1.05], [HX - hw * 0.9, HY - hh * 1.5], [HX - hw * 1.55, HY - hh * 1.45], [HX - hw * 1.75, HY - hh * 1.1]], 10, 2, 6);
      paint(g, litFill(g, HX - hw * 1.8, HY - hh * 1.6, hw * 1.6, hh * 0.6, fc, 0.3), INK, 1.4);
      g.beginPath();
      g.moveTo(HX - hw * 0.3, HY - hh * 1.05); g.quadraticCurveTo(HX - hw * 1.0, HY - hh * 1.5, HX - hw * 1.6, HY - hh * 1.3);
      g.strokeStyle = alpha(shade(fc, -0.5), 0.7); g.lineWidth = 0.9; g.stroke();
      blob(g, [[HX - hw * 1.2, HY - hh * 0.62], [HX - hw * 0.9, HY - hh * 1.15], [HX + hw * 0.1, HY - hh * 1.42], [HX + hw * 1.2, HY - hh * 1.12], [HX + hw * 1.25, HY - hh * 0.72], [HX, HY - hh * 0.62]]);
      paint(g, domeFill(g, HX - 4, HY - hh * 1.1, hh * 0.9, col, 0.35), INK, LW);
      g.beginPath();
      g.moveTo(HX - hw * 1.15, HY - hh * 0.66); g.quadraticCurveTo(HX, HY - hh * 0.82, HX + hw * 1.2, HY - hh * 0.76);
      g.strokeStyle = INK; g.lineWidth = 4.6; g.stroke();
      g.strokeStyle = shade(col, -0.35); g.lineWidth = 2.8; g.stroke();
      break;
    }
    case 'tricorn': {
      g.beginPath();
      g.moveTo(HX - hw * 1.7, HY - hh * 0.8);
      g.quadraticCurveTo(HX - hw * 0.9, HY - hh * 1.65, HX, HY - hh * 1.42);
      g.quadraticCurveTo(HX + hw * 0.9, HY - hh * 1.65, HX + hw * 1.7, HY - hh * 0.8);
      g.quadraticCurveTo(HX + hw * 0.9, HY - hh * 0.72, HX, HY - hh * 0.42);
      g.quadraticCurveTo(HX - hw * 0.9, HY - hh * 0.72, HX - hw * 1.7, HY - hh * 0.8);
      g.closePath();
      paint(g, litFill(g, HX - hw * 1.7, HY - hh * 1.6, hw * 3.4, hh * 1.2, col, 0.3), INK, LW);
      g.beginPath();
      g.moveTo(HX - hw * 1.6, HY - hh * 0.82);
      g.quadraticCurveTo(HX - hw * 0.9, HY - hh * 0.75, HX, HY - hh * 0.48);
      g.quadraticCurveTo(HX + hw * 0.9, HY - hh * 0.75, HX + hw * 1.6, HY - hh * 0.82);
      g.strokeStyle = o.plume ?? '#d9b44a'; g.lineWidth = 2.2; g.stroke();
      circle(g, HX, HY - hh * 0.95, 3.4);
      paint(g, '#f1ece0', INK, 1);
      break;
    }
    case 'wide': {
      blob(g, [[HX - hw * 0.95, HY - hh * 0.6], [HX - hw * 0.85, HY - hh * 1.25], [HX, HY - hh * 1.4], [HX + hw * 0.85, HY - hh * 1.25], [HX + hw * 0.95, HY - hh * 0.6]]);
      paint(g, domeFill(g, HX - 5, HY - hh * 1.1, hh, col, 0.3), INK, LW);
      g.beginPath();
      g.moveTo(HX - hw * 0.92, HY - hh * 0.72); g.quadraticCurveTo(HX, HY - hh * 0.86, HX + hw * 0.92, HY - hh * 0.72);
      g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
      g.strokeStyle = band; g.lineWidth = 3.2; g.stroke();
      ellipse(g, HX, HY - hh * 0.62, hw * 1.95, 7.5);
      paint(g, litFill(g, HX - hw * 2, HY - hh * 0.62 - 7, hw * 4, 15, col, 0.25), INK, LW);
      ellipse(g, HX, HY - hh * 0.66, hw * 1.05, 4);
      paint(g, shade(col, -0.25), null);
      break;
    }
    case 'cap':
    case 'beanie': {
      blob(g, [[HX - hw * 1.1, HY - hh * 0.5], [HX - hw * 1.02, HY - hh * 1.1], [HX, HY - hh * 1.32], [HX + hw * 1.02, HY - hh * 1.1], [HX + hw * 1.1, HY - hh * 0.5]]);
      paint(g, domeFill(g, HX - 5, HY - hh * 1.0, hh, col, 0.3), INK, LW);
      if (o.hat === 'beanie') {
        rr(g, HX - hw * 1.12, HY - hh * 0.72, hw * 2.24, hh * 0.3, 3);
        paint(g, shade(col, -0.15), INK, 1.4);
        g.strokeStyle = alpha(shade(col, -0.5), 0.6); g.lineWidth = 0.9; g.beginPath();
        for (let i = 1; i < 10; i++) { const x = HX - hw * 1.12 + (hw * 2.24 * i) / 10; g.moveTo(x, HY - hh * 0.7); g.lineTo(x, HY - hh * 0.45); }
        g.stroke();
      } else {
        ellipse(g, HX + 3, HY - hh * 0.58, hw * 0.9, 4, 0.05);
        paint(g, shade(col, -0.2), INK, 1.4);
      }
      break;
    }
    case 'straw': {
      ellipse(g, HX, HY - hh * 0.62, hw * 2.0, 8);
      paint(g, litFill(g, HX - hw * 2, HY - hh * 0.62 - 8, hw * 4, 16, col, 0.25), INK, LW);
      blob(g, [[HX - hw * 0.9, HY - hh * 0.62], [HX - hw * 0.75, HY - hh * 1.22], [HX, HY - hh * 1.32], [HX + hw * 0.75, HY - hh * 1.22], [HX + hw * 0.9, HY - hh * 0.62]]);
      paint(g, domeFill(g, HX - 4, HY - hh, hh * 0.8, col, 0.3), INK, LW * 0.9);
      g.strokeStyle = alpha(shade(col, -0.45), 0.6); g.lineWidth = 0.8; g.beginPath();
      for (let i = 0; i < 4; i++) { g.moveTo(HX - hw * 1.8 + i * 2, HY - hh * 0.62 + i * 1.5); g.lineTo(HX + hw * 1.8 - i * 2, HY - hh * 0.62 + i * 1.5); }
      g.stroke();
      rr(g, HX - hw * 0.88, HY - hh * 0.8, hw * 1.76, 4, 1.5);
      paint(g, band, INK, 1);
      break;
    }
    case 'turban': {
      blob(g, [[HX - hw * 1.2, HY - hh * 0.35], [HX - hw * 1.28, HY - hh * 1.0], [HX - hw * 0.6, HY - hh * 1.5], [HX + hw * 0.4, HY - hh * 1.52], [HX + hw * 1.25, HY - hh * 1.1], [HX + hw * 1.2, HY - hh * 0.35], [HX, HY - hh * 0.55]]);
      paint(g, domeFill(g, HX - 5, HY - hh * 1.1, hh * 1.1, col, 0.3), INK, LW);
      g.strokeStyle = alpha(shade(col, -0.5), 0.7); g.lineWidth = 1.4; g.beginPath();
      for (let i = 0; i < 3; i++) {
        g.moveTo(HX - hw * 1.2, HY - hh * (0.55 + i * 0.28)); g.quadraticCurveTo(HX, HY - hh * (0.85 + i * 0.3), HX + hw * 1.2, HY - hh * (0.75 + i * 0.25));
      }
      g.stroke();
      gem(g, HX, HY - hh * 0.82, 4, o.plume ?? '#c0303a');
      break;
    }
    case 'mitre': {
      g.beginPath();
      g.moveTo(HX - hw * 0.95, HY - hh * 0.55);
      g.lineTo(HX - hw * 0.85, HY - hh * 1.5);
      g.quadraticCurveTo(HX - hw * 0.3, HY - hh * 2.0, HX, HY - hh * 2.15);
      g.quadraticCurveTo(HX + hw * 0.3, HY - hh * 2.0, HX + hw * 0.85, HY - hh * 1.5);
      g.lineTo(HX + hw * 0.95, HY - hh * 0.55);
      g.quadraticCurveTo(HX, HY - hh * 0.7, HX - hw * 0.95, HY - hh * 0.55);
      g.closePath();
      paint(g, litFill(g, HX - hw, HY - hh * 2.1, hw * 2, hh * 1.6, col, 0.3), INK, LW);
      rr(g, HX - 3, HY - hh * 2.0, 6, hh * 1.4, 1);
      paint(g, band, INK, 1);
      rr(g, HX - hw * 0.92, HY - hh * 0.82, hw * 1.84, 5, 1.5);
      paint(g, band, INK, 1);
      gem(g, HX, HY - hh * 1.2, 3.2, '#c0303a');
      break;
    }
    case 'redcap': {
      g.beginPath();
      g.moveTo(HX - hw * 1.08, HY - hh * 0.5);
      g.quadraticCurveTo(HX - hw * 0.9, HY - hh * 1.6, HX + hw * 0.2, HY - hh * 1.8);
      g.quadraticCurveTo(HX + hw * 1.4, HY - hh * 1.9, HX + hw * 1.75, HY - hh * 1.0);
      g.quadraticCurveTo(HX + hw * 1.2, HY - hh * 1.35, HX + hw * 1.08, HY - hh * 0.5);
      g.quadraticCurveTo(HX, HY - hh * 0.72, HX - hw * 1.08, HY - hh * 0.5);
      g.closePath();
      paint(g, litFill(g, HX - hw, HY - hh * 1.9, hw * 2.6, hh * 1.4, col, 0.35), INK, LW);
      g.fillStyle = alpha('#4a0a0a', 0.45);
      for (let i = 0; i < 3; i++) {
        blob(g, [[HX - hw * 0.6 + i * 9, HY - hh * 0.65], [HX - hw * 0.5 + i * 9, HY - hh * 0.95], [HX - hw * 0.4 + i * 9 + 3, HY - hh * 0.62]]);
        g.fill();
      }
      break;
    }
    case 'nemes': {
      const stripe = o.plume ?? '#2f4f8a';
      blob(g, [[HX - hw * 1.12, HY - hh * 0.5], [HX - hw * 1.05, HY - hh * 1.15], [HX, HY - hh * 1.3], [HX + hw * 1.05, HY - hh * 1.15], [HX + hw * 1.12, HY - hh * 0.5], [HX + hw * 1.7, b.top + 8], [HX + hw * 1.0, b.top + 12], [HX + hw * 1.0, HY - hh * 0.3], [HX - hw * 1.0, HY - hh * 0.3], [HX - hw * 1.0, b.top + 12], [HX - hw * 1.7, b.top + 8]]);
      paint(g, domeFill(g, HX - 5, HY - hh * 0.8, hh * 1.6, col, 0.35), INK, LW);
      g.save();
      g.clip();
      g.strokeStyle = stripe;
      g.lineWidth = 2.6;
      g.beginPath();
      for (let i = 0; i < 9; i++) {
        const y = HY - hh * 1.2 + i * 5.5;
        g.moveTo(HX - hw * 2, y + 8); g.quadraticCurveTo(HX, y - 4, HX + hw * 2, y + 8);
      }
      g.stroke();
      g.restore();
      rr(g, HX - hw * 1.02, HY - hh * 0.62, hw * 2.04, 5, 2);
      paint(g, col, INK, 1.2);
      break;
    }
  }
}

function drawCrown(b: B) {
  const { g, o, HX, HY, hw, hh, r } = b;
  const col = o.crownColor ?? '#e2b84a';
  switch (o.crown) {
    case 'crown': {
      const y = HY - hh * 0.78;
      g.beginPath();
      g.moveTo(HX - hw * 0.98, y + 6);
      g.lineTo(HX - hw * 1.02, y - 9);
      for (let i = 0; i < 5; i++) {
        const t = (i + 0.5) / 5, x = HX - hw + t * hw * 2;
        g.lineTo(x - hw * 0.12, y - 3);
        g.lineTo(x, y - (i % 2 ? 12 : 16));
        g.lineTo(x + hw * 0.12, y - 3);
      }
      g.lineTo(HX + hw * 1.02, y - 9);
      g.lineTo(HX + hw * 0.98, y + 6);
      g.quadraticCurveTo(HX, y + 3, HX - hw * 0.98, y + 6);
      g.closePath();
      paint(g, litFill(g, HX - hw, y - 16, hw * 2, 22, col, 0.4), INK, 1.6);
      for (let i = 0; i < 3; i++) {
        const x = HX - hw * 0.5 + i * hw * 0.5;
        gem(g, x, y + 1, i === 1 ? 3.2 : 2.4, i === 1 ? '#c0303a' : '#2f6fb0');
      }
      break;
    }
    case 'circlet': {
      g.beginPath();
      g.moveTo(HX - hw * 1.02, HY - hh * 0.45);
      g.quadraticCurveTo(HX, HY - hh * 0.72, HX + hw * 1.02, HY - hh * 0.45);
      g.strokeStyle = INK; g.lineWidth = 3.8; g.stroke();
      g.strokeStyle = col; g.lineWidth = 2.2; g.stroke();
      gem(g, HX, HY - hh * 0.58, 3.4, o.heldColor ?? '#4cc9f0');
      break;
    }
    case 'wreath':
    case 'flowers': {
      const lc = o.crown === 'flowers' ? '#5f9a43' : (o.crownColor ?? '#5f9a43');
      for (let i = 0; i < 11; i++) {
        const a = Math.PI * (1.02 + (i / 10) * 0.96);
        const x = HX + Math.cos(a) * hw * 1.08, y = HY - hh * 0.5 + Math.sin(a) * hh * 0.62;
        leaf(g, x, y, 10, 3.6, a + Math.PI / 2 + (i % 2 ? 0.5 : -0.5), shade(lc, (r() - 0.5) * 0.3));
      }
      if (o.crown === 'flowers') {
        const fc = [o.crownColor ?? '#f2a7d8', '#fff6e0', '#ffd166'];
        for (let i = 0; i < 5; i++) {
          const a = Math.PI * (1.08 + (i / 4) * 0.84);
          const x = HX + Math.cos(a) * hw * 1.05, y = HY - hh * 0.5 + Math.sin(a) * hh * 0.62;
          g.fillStyle = fc[i % 3];
          for (let p = 0; p < 5; p++) {
            const pa = (p / 5) * Math.PI * 2;
            circle(g, x + Math.cos(pa) * 2.4, y + Math.sin(pa) * 2.4, 2.2);
            paint(g, fc[i % 3], alpha(INK, 0.6), 0.6);
          }
          circle(g, x, y, 1.5);
          paint(g, '#e9a43a', null);
        }
      }
      break;
    }
    case 'antlers': {
      const ac = o.crownColor ?? '#8a6a48';
      for (const s of [-1, 1]) {
        const bx = HX + s * hw * 0.55, by = HY - hh * 0.95;
        taper(g, [[bx, by], [bx + s * 6, by - 14], [bx + s * 18, by - 24], [bx + s * 30, by - 26]], 5, 1.5, 3);
        paint(g, domeFill(g, bx + s * 10, by - 16, 18, ac, 0.3), INK, 1.4);
        taper(g, [[bx + s * 5, by - 11], [bx - s * 2, by - 20], [bx - s * 1, by - 30]], 3.6, 1, 2);
        paint(g, ac, INK, 1.2);
        taper(g, [[bx + s * 15, by - 22], [bx + s * 15, by - 32], [bx + s * 19, by - 38]], 3.4, 1, 2);
        paint(g, ac, INK, 1.2);
      }
      break;
    }
    case 'bones': {
      const y = HY - hh * 0.75;
      for (let i = 0; i < 5; i++) {
        const x = HX - hw * 0.8 + i * hw * 0.4;
        taper(g, [[x, y + 2], [x + (i - 2) * 1.2, y - 7 - (i % 2 ? 0 : 4)], [x + (i - 2) * 2, y - 13 - (i % 2 ? 0 : 5)]], 4.5, 0.8, 3);
        paint(g, '#efe6c8', INK, 1.1);
      }
      rr(g, HX - hw * 1.0, y - 1, hw * 2, 5, 2);
      paint(g, '#6b4a2b', INK, 1.2);
      break;
    }
    case 'shells': {
      g.beginPath();
      g.moveTo(HX - hw * 1.02, HY - hh * 0.5);
      g.quadraticCurveTo(HX, HY - hh * 0.78, HX + hw * 1.02, HY - hh * 0.5);
      g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke();
      g.strokeStyle = '#e8d9b0'; g.lineWidth = 2; g.stroke();
      for (let i = 0; i < 3; i++) {
        const x = HX - hw * 0.5 + i * hw * 0.5, y = HY - hh * (i === 1 ? 0.72 : 0.6);
        g.beginPath();
        g.moveTo(x, y + 3.5);
        g.lineTo(x - 4.5, y - 2);
        g.quadraticCurveTo(x, y - 7, x + 4.5, y - 2);
        g.closePath();
        paint(g, domeFill(g, x, y - 1, 5, i === 1 ? '#f2b8a8' : '#f1e6d0', 0.35), INK, 1);
        g.beginPath();
        for (let k = -1; k <= 1; k++) { g.moveTo(x, y + 3); g.lineTo(x + k * 3, y - 4); }
        g.strokeStyle = alpha(INK, 0.5); g.lineWidth = 0.6; g.stroke();
      }
      break;
    }
  }
}

function drawBandana(b: B) {
  const { g, o, HX, HY, hw, hh } = b;
  if (o.bandana) {
    const col = o.bandana;
    blob(g, [[HX - hw * 1.1, HY - hh * 0.38], [HX - hw * 1.04, HY - hh * 1.05], [HX, HY - hh * 1.22], [HX + hw * 1.04, HY - hh * 1.05], [HX + hw * 1.1, HY - hh * 0.38], [HX, HY - hh * 0.56]]);
    paint(g, domeFill(g, HX - 5, HY - hh * 1.0, hh, col, 0.3), INK, LW);
    // knot and tails
    circle(g, HX + hw * 1.1, HY - hh * 0.55, 3.6);
    paint(g, shade(col, -0.1), INK, 1.2);
    taper(g, [[HX + hw * 1.15, HY - hh * 0.5], [HX + hw * 1.55, HY - hh * 0.2], [HX + hw * 1.65, HY + hh * 0.2]], 5, 2, 4);
    paint(g, col, INK, 1.2);
    g.fillStyle = alpha('#ffffff', 0.7);
    for (let i = 0; i < 5; i++) {
      circle(g, HX - hw * 0.7 + i * hw * 0.35, HY - hh * (0.85 + (i % 2) * 0.12), 1.1);
      g.fill();
    }
  }
  if (o.headband) {
    const col = o.headband;
    g.beginPath();
    g.moveTo(HX - hw * 1.08, HY - hh * 0.42);
    g.quadraticCurveTo(HX, HY - hh * 0.62, HX + hw * 1.08, HY - hh * 0.42);
    g.strokeStyle = INK; g.lineWidth = 6.4; g.stroke();
    g.strokeStyle = col; g.lineWidth = 4.4; g.stroke();
    for (let i = 0; i < 2; i++) {
      taper(g, [[HX + hw * 1.05, HY - hh * 0.42], [HX + hw * (1.4 + i * 0.1), HY - hh * (0.25 - i * 0.2)], [HX + hw * (1.55 + i * 0.15), HY + hh * (0.15 - i * 0.15)]], 4, 2.5, 4);
      paint(g, shade(col, -i * 0.15), INK, 1.1);
    }
  }
}

// ---------------------------------------------------------------- held items

function heldItem(b: B, item: Held, side: 'L' | 'R') {
  const { g, o, skin } = b;
  const hand = o.outfit === 'plate' ? (o.metal ?? '#9ea4ab') : o.skull ? o.skin : skin;
  const steel = '#c9ced3', wood = '#7a5032', gold = '#d9b44a';
  const hc = o.heldColor ?? b.accent;
  g.save();
  if (side === 'L') {
    g.translate(100, 0);
    g.scale(-1, 1);
  }
  switch (item) {
    case 'sword': {
      poly(g, [[80.5, 76], [80.5, 22], [84, 12], [87.5, 22], [87.5, 76]]);
      paint(g, litFill(g, 80, 12, 8, 64, steel, 0.4), INK, 1.5);
      line(g, 84, 22, 84, 72, alpha('#6c7480', 0.8), 1.2);
      if (o.fx === 'halo') glow(g, 84, 44, 16, '#fff3c0', 0.5);
      rr(g, 72, 74, 24, 5, 2);
      paint(g, litFill(g, 72, 74, 24, 5, gold, 0.4), INK, 1.3);
      rr(g, 81.6, 78, 4.8, 13, 1.5);
      paint(g, '#5a3a22', INK, 1.1);
      fist(g, 84, 86, 10, hand);
      circle(g, 84, 95.5, 3.4);
      paint(g, domeFill(g, 84, 95.5, 3.4, gold, 0.5), INK, 1);
      break;
    }
    case 'scimitar': {
      g.beginPath();
      g.moveTo(80, 76);
      g.quadraticCurveTo(78, 44, 93, 16);
      g.quadraticCurveTo(90, 46, 88, 76);
      g.closePath();
      paint(g, litFill(g, 78, 16, 15, 60, steel, 0.4), INK, 1.5);
      rr(g, 74, 74, 20, 4.5, 2);
      paint(g, gold, INK, 1.2);
      fist(g, 84, 84, 10, hand);
      break;
    }
    case 'dagger':
    case 'sickle': {
      g.translate(82, 84);
      g.rotate(-0.4);
      if (item === 'sickle') {
        g.beginPath();
        g.moveTo(-2, -6);
        g.bezierCurveTo(-2, -30, 22, -36, 20, -18);
        g.bezierCurveTo(16, -28, 4, -26, 3, -6);
        g.closePath();
        paint(g, litFill(g, -2, -36, 24, 30, steel, 0.4), INK, 1.3);
      } else {
        poly(g, [[-3, -5], [-3, -24], [0, -32], [3, -24], [3, -5]]);
        paint(g, litFill(g, -3, -32, 6, 27, steel, 0.45), INK, 1.3);
        line(g, 0, -25, 0, -7, alpha('#6c7480', 0.8), 1);
        rr(g, -7, -7, 14, 3.6, 1.5);
        paint(g, gold, INK, 1.1);
      }
      fist(g, 0, 1, 9, hand);
      break;
    }
    case 'axe':
    case 'greataxe': {
      rr(g, 80, 26, 5, 84, 2);
      paint(g, litFill(g, 80, 26, 5, 84, wood, 0.3), INK, 1.3);
      g.beginPath();
      g.moveTo(84, 26);
      g.quadraticCurveTo(94, 24, 99, 14);
      g.quadraticCurveTo(104, 34, 99, 56);
      g.quadraticCurveTo(94, 46, 84, 44);
      g.closePath();
      paint(g, litFill(g, 84, 14, 18, 42, steel, 0.4), INK, 1.5);
      if (item === 'greataxe') {
        g.beginPath();
        g.moveTo(81, 28);
        g.quadraticCurveTo(74, 26, 70, 18);
        g.quadraticCurveTo(66, 34, 70, 52);
        g.quadraticCurveTo(74, 44, 81, 42);
        g.closePath();
        paint(g, litFill(g, 66, 18, 15, 34, steel, 0.4), INK, 1.5);
      }
      rr(g, 79, 26, 7, 18, 1.5);
      paint(g, shade(steel, -0.35), INK, 1.1);
      fist(g, 82.5, 86, 10, hand);
      break;
    }
    case 'mace':
    case 'morningstar':
    case 'club': {
      if (item === 'club') {
        taper(g, [[83, 104], [84, 70], [86, 34]], 5, 12, 4);
        paint(g, litFill(g, 77, 34, 14, 70, '#8a5a34', 0.3), INK, 1.5);
        for (let i = 0; i < 3; i++) { circle(g, 84 + (i - 1) * 2, 42 + i * 9, 1.3); g.fillStyle = alpha(INK, 0.6); g.fill(); }
      } else {
        rr(g, 81, 50, 4.6, 56, 1.5);
        paint(g, litFill(g, 81, 50, 4.6, 56, '#5a3a22', 0.3), INK, 1.2);
        if (item === 'morningstar') {
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            poly(g, [[83 + Math.cos(a - 0.3) * 7, 42 + Math.sin(a - 0.3) * 7], [83 + Math.cos(a) * 13, 42 + Math.sin(a) * 13], [83 + Math.cos(a + 0.3) * 7, 42 + Math.sin(a + 0.3) * 7]]);
            paint(g, steel, INK, 1);
          }
          circle(g, 83, 42, 8.5);
          paint(g, domeFill(g, 83, 42, 8.5, '#8a8f96', 0.5), INK, 1.4);
        } else {
          for (const s of [-1, 1]) {
            poly(g, [[83, 34], [83 + s * 9, 38], [83 + s * 9, 50], [83, 54]]);
            paint(g, litFill(g, 74, 34, 18, 20, steel, 0.4), INK, 1.2);
          }
          circle(g, 83, 44, 5.5);
          paint(g, domeFill(g, 83, 44, 5.5, steel, 0.5), INK, 1.2);
          circle(g, 83, 32.5, 2.4);
          paint(g, gold, INK, 0.9);
        }
      }
      fist(g, 83, 88, 10, hand);
      break;
    }
    case 'spear':
    case 'trident': {
      rr(g, 78.5, 22, 4, 90, 1.5);
      paint(g, litFill(g, 78.5, 22, 4, 90, wood, 0.3), INK, 1.2);
      if (item === 'trident') {
        g.beginPath();
        g.moveTo(70, 26); g.lineTo(70, 12); g.moveTo(80.5, 26); g.lineTo(80.5, 4); g.moveTo(91, 26); g.lineTo(91, 12);
        g.moveTo(70, 26); g.quadraticCurveTo(80.5, 32, 91, 26);
        g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
        g.strokeStyle = o.heldColor ?? '#c9b25a'; g.lineWidth = 3; g.stroke();
        for (const x of [70, 80.5, 91]) {
          poly(g, [[x - 3, 13], [x, x === 80.5 ? -2 : 5], [x + 3, 13]]);
          paint(g, o.heldColor ?? '#c9b25a', INK, 1);
        }
      } else {
        poly(g, [[80.5, 4], [86, 16], [82.5, 26], [78.5, 26], [75, 16]]);
        paint(g, litFill(g, 75, 4, 11, 22, steel, 0.4), INK, 1.4);
        line(g, 80.5, 8, 80.5, 24, alpha('#6c7480', 0.8), 1);
        g.beginPath();
        g.moveTo(80.5, 27); g.quadraticCurveTo(84, 33, 82, 40); g.moveTo(80.5, 27); g.quadraticCurveTo(77, 33, 79, 40);
        g.strokeStyle = hc; g.lineWidth = 2.4; g.stroke();
      }
      fist(g, 80.5, 80, 10, hand);
      break;
    }
    case 'staff':
    case 'gnarled': {
      if (item === 'gnarled') {
        taper(g, [[82, 112], [84, 70], [80, 40], [84, 22], [92, 16], [90, 8], [82, 10]], 5.5, 3, 2);
        paint(g, litFill(g, 76, 8, 18, 104, '#6b4a2b', 0.3), INK, 1.4);
        leaf(g, 76, 24, 12, 4.5, -0.6, '#6fa04a');
        leaf(g, 92, 30, 11, 4, 0.7, '#5f9a43');
        glow(g, 86, 14, 14, '#b8f27a', 0.7);
        circle(g, 86, 14, 3);
        paint(g, '#eaffc8', null);
      } else {
        rr(g, 80, 24, 5, 90, 2);
        paint(g, litFill(g, 80, 24, 5, 90, '#5a3a22', 0.3), INK, 1.3);
        rr(g, 79, 40, 7, 4, 1.5);
        paint(g, gold, INK, 1);
        // claw cradle
        for (const s of [-1, 1]) {
          taper(g, [[82.5, 27], [82.5 + s * 7, 20], [82.5 + s * 4, 10]], 3.4, 1, 3);
          paint(g, gold, INK, 1);
        }
        glow(g, 82.5, 17, 18, hc, 0.75);
        gem(g, 82.5, 17, 6.5, hc);
      }
      fist(g, 82.5, 80, 10, hand);
      break;
    }
    case 'bow': {
      taper(g, [[78, 12], [100, 52], [78, 94]], 4.2, 4.2, 10);
      paint(g, litFill(g, 78, 12, 22, 82, '#8a5a34', 0.3), INK, 1.3);
      line(g, 78.5, 13, 78.5, 93, alpha('#efe6d0', 0.9), 0.9);
      // arrow nocked
      line(g, 70, 53, 96, 53, '#6b4a2b', 1.6);
      poly(g, [[66, 53], [71, 50], [71, 56]]);
      paint(g, steel, INK, 0.9);
      fist(g, 88.5, 53, 9, hand);
      break;
    }
    case 'lute': {
      g.save();
      g.translate(82, 86);
      g.rotate(0.38);
      rr(g, -3.4, -52, 6.8, 44, 1.5);
      paint(g, litFill(g, -3.4, -52, 6.8, 44, '#5a3a22', 0.3), INK, 1.3);
      poly(g, [[-3.6, -52], [3.6, -52], [5.5, -62], [-2, -64]]);
      paint(g, '#5a3a22', INK, 1.2);
      for (let i = 0; i < 3; i++) {
        circle(g, 5.8, -54 - i * 3.4, 1.4);
        paint(g, '#efe6d0', INK, 0.6);
      }
      ellipse(g, 0, 0, 13, 15);
      paint(g, domeFill(g, -3, -4, 15, '#c08a4a', 0.45), INK, 1.6);
      circle(g, 0, -2, 3.8);
      paint(g, '#2a1a10', null);
      rr(g, -5, 7, 10, 2.6, 1);
      paint(g, '#5a3a22', INK, 0.8);
      g.beginPath();
      for (let i = -1; i <= 1; i++) { g.moveTo(i * 1.4, 8); g.lineTo(i * 1.2, -52); }
      g.strokeStyle = alpha('#f2ead6', 0.8); g.lineWidth = 0.6; g.stroke();
      g.restore();
      fist(g, 92, 60, 8.5, hand);
      break;
    }
    case 'shield': {
      g.beginPath();
      g.moveTo(66, 64);
      g.quadraticCurveTo(84, 60, 102, 64);
      g.lineTo(102, 86);
      g.quadraticCurveTo(100, 104, 84, 114);
      g.quadraticCurveTo(68, 104, 66, 86);
      g.closePath();
      paint(g, litFill(g, 66, 60, 36, 54, hc, 0.3), INK, LW);
      g.save();
      g.clip();
      g.beginPath();
      g.moveTo(66, 64); g.quadraticCurveTo(84, 60, 102, 64); g.lineTo(102, 86); g.quadraticCurveTo(100, 104, 84, 114); g.quadraticCurveTo(68, 104, 66, 86); g.closePath();
      g.strokeStyle = o.metal ?? '#c9ced3'; g.lineWidth = 6; g.stroke();
      // chevron
      poly(g, [[70, 92], [84, 76], [98, 92], [98, 99], [84, 83], [70, 99]]);
      paint(g, o.trim && o.trim !== hc ? o.trim : shade(hc, 0.55), alpha(INK, 0.7), 1);
      g.restore();
      g.beginPath();
      g.moveTo(66, 64); g.quadraticCurveTo(84, 60, 102, 64); g.lineTo(102, 86); g.quadraticCurveTo(100, 104, 84, 114); g.quadraticCurveTo(68, 104, 66, 86); g.closePath();
      g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
      break;
    }
    case 'round-shield': {
      circle(g, 84, 88, 22);
      paint(g, domeFill(g, 82, 84, 22, o.heldColor ?? '#8a5a34', 0.3), INK, LW);
      g.save();
      circle(g, 84, 88, 22);
      g.clip();
      g.strokeStyle = alpha(INK, 0.45); g.lineWidth = 1; g.beginPath();
      for (let i = -2; i <= 2; i++) { g.moveTo(84 + i * 8, 60); g.lineTo(84 + i * 8, 116); }
      g.stroke();
      g.restore();
      circle(g, 84, 88, 22);
      g.strokeStyle = INK; g.lineWidth = 5.5; g.stroke();
      g.strokeStyle = '#8a8f96'; g.lineWidth = 3.4; g.stroke();
      circle(g, 84, 88, 6);
      paint(g, domeFill(g, 84, 88, 6, '#b9bec4', 0.5), INK, 1.3);
      break;
    }
    case 'book': {
      g.translate(78, 84);
      g.rotate(-0.22);
      rr(g, -12, -15, 24, 30, 2);
      paint(g, '#efe4c4', INK, 1.3);
      rr(g, -13.5, -16.5, 24, 30, 2.5);
      paint(g, litFill(g, -13.5, -16.5, 24, 30, hc, 0.3), INK, 1.5);
      rr(g, -13.5, -16.5, 4, 30, 1.5);
      paint(g, shade(hc, -0.3), INK, 1);
      if (o.fx === 'eldritch' || o.glowColor) {
        glow(g, -1, -1.5, 14, o.glowColor ?? '#9cff7a', 0.7);
        ellipse(g, -1, -1.5, 6, 3.6);
        paint(g, o.glowColor ?? '#9cff7a', alpha(INK, 0.6), 0.8);
        circle(g, -1, -1.5, 1.8);
        g.fillStyle = '#120c0a';
        g.fill();
      } else {
        circle(g, -1, -1.5, 5);
        paint(g, gold, INK, 1);
      }
      rr(g, 7.5, -3.5, 4, 5, 1);
      paint(g, gold, INK, 0.9);
      fist(g, 2, 14, 9, hand);
      break;
    }
    case 'orb':
    case 'flame':
    case 'wand': {
      const col = o.glowColor ?? hc;
      if (item === 'wand') {
        g.save();
        g.translate(82, 86);
        g.rotate(0.35);
        rr(g, -1.8, -28, 3.6, 30, 1.2);
        paint(g, '#3a2a22', INK, 1);
        g.restore();
        glow(g, 92, 60, 14, col, 0.8);
        sparkle(g, 92, 60, 6, shade(col, 0.6));
        fist(g, 82, 88, 9, hand);
        break;
      }
      // cupped hand
      g.beginPath();
      g.moveTo(66, 90); g.quadraticCurveTo(77, 99, 90, 88); g.quadraticCurveTo(88, 82, 78, 84); g.quadraticCurveTo(70, 84, 66, 90);
      g.closePath();
      paint(g, domeFill(g, 78, 88, 12, hand, 0.3), INK, 1.3);
      if (item === 'orb') {
        glow(g, 78, 74, 24, col, 0.75);
        circle(g, 78, 74, 9.5);
        paint(g, domeFill(g, 76, 71, 10, col, 0.6), alpha(INK, 0.8), 1.3);
        circle(g, 75, 71, 2.6);
        g.fillStyle = 'rgba(255,255,255,0.8)';
        g.fill();
      } else {
        flameUp(g, 78, 76, 10, shade(col, -0.1), shade(col, 0.45), '#fffbe8');
      }
      break;
    }
    case 'torch': {
      rr(g, 81, 50, 6, 54, 2);
      paint(g, litFill(g, 81, 50, 6, 54, wood, 0.3), INK, 1.3);
      rr(g, 79.5, 46, 9, 8, 2);
      paint(g, '#4a3a2a', INK, 1.1);
      flameUp(g, 84, 38, 8);
      fist(g, 84, 84, 10, hand);
      break;
    }
    case 'lantern': {
      const col = o.glowColor ?? '#ffd27a';
      line(g, 82, 60, 82, 66, INK, 1.4);
      circle(g, 82, 58, 3);
      g.strokeStyle = INK; g.lineWidth = 1.4; g.stroke();
      glow(g, 82, 78, 26, col, 0.75);
      rr(g, 74, 66, 16, 4, 1.5);
      paint(g, '#3a3530', INK, 1.1);
      rr(g, 75.5, 69, 13, 16, 2);
      paint(g, alpha(shade(col, 0.4), 0.95), INK, 1.3);
      flameUp(g, 82, 79, 3.6, shade(col, -0.2), col, '#ffffff');
      g.beginPath();
      g.moveTo(79, 69); g.lineTo(79, 85); g.moveTo(85, 69); g.lineTo(85, 85);
      g.strokeStyle = '#3a3530'; g.lineWidth = 1.4; g.stroke();
      rr(g, 74, 84, 16, 4, 1.5);
      paint(g, '#3a3530', INK, 1.1);
      fist(g, 82, 56, 8, hand);
      break;
    }
    case 'mug': {
      rr(g, 72, 76, 18, 22, 3);
      paint(g, litFill(g, 72, 76, 18, 22, '#9a6a3a', 0.3), INK, 1.5);
      g.strokeStyle = alpha(INK, 0.6); g.lineWidth = 1;
      g.beginPath(); g.moveTo(72, 82); g.lineTo(90, 82); g.moveTo(72, 92); g.lineTo(90, 92); g.stroke();
      blob(g, [[71, 77], [74, 71], [80, 72], [86, 70], [91, 74], [91, 78]]);
      paint(g, '#f6f0e2', INK, 1.2);
      ellipse(g, 93, 87, 5, 7);
      g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke();
      g.strokeStyle = '#9a6a3a'; g.lineWidth = 2; g.stroke();
      fist(g, 94, 88, 8, hand);
      break;
    }
    case 'purse': {
      blob(g, [[74, 82], [90, 82], [94, 96], [82, 102], [70, 96]]);
      paint(g, domeFill(g, 80, 88, 14, '#8a5a34', 0.3), INK, 1.5);
      poly(g, [[76, 82], [82, 76], [88, 82]]);
      paint(g, '#8a5a34', INK, 1.2);
      line(g, 75, 83, 89, 83, '#d9b44a', 2);
      for (let i = 0; i < 3; i++) {
        ellipse(g, 70 + i * 6, 74 - (i % 2) * 3, 3.2, 2.6);
        paint(g, domeFill(g, 70 + i * 6, 74, 3.2, gold, 0.45), INK, 0.8);
      }
      fist(g, 82, 74, 7.5, hand);
      break;
    }
    case 'scroll': {
      g.translate(80, 84);
      g.rotate(-0.5);
      rr(g, -14, -5, 28, 10, 2);
      paint(g, '#eadbb5', INK, 1.2);
      for (const s of [-1, 1]) {
        ellipse(g, s * 14, 0, 3, 6.5);
        paint(g, '#c9b27f', INK, 1);
      }
      rr(g, -3, -5.5, 6, 11, 1);
      paint(g, '#a3312c', INK, 0.9);
      g.rotate(0.5);
      fist(g, 4, 6, 9, hand);
      break;
    }
    case 'fist': {
      taper(g, [[86, 114], [83, 96], [80, 82]], 13, 11, 3);
      paint(g, litFill(g, 74, 82, 14, 32, hand, 0.25), INK, 1.4);
      g.strokeStyle = '#efe6d0';
      g.lineWidth = 2.6;
      g.beginPath();
      for (let i = 0; i < 4; i++) { g.moveTo(74.5 + i * 0.6, 86 + i * 5); g.lineTo(87 + i * 0.8, 84 + i * 5); }
      g.stroke();
      fist(g, 80, 74, 15, hand);
      rr(g, 71, 70, 18, 4, 1.5);
      paint(g, '#efe6d0', alpha(INK, 0.8), 0.9);
      break;
    }
    case 'claws': {
      blob(g, [[72, 96], [74, 80], [84, 76], [92, 80], [92, 96]]);
      paint(g, domeFill(g, 82, 86, 12, hand, 0.3), INK, 1.4);
      for (let i = 0; i < 4; i++) {
        const x = 74 + i * 5.5;
        taper(g, [[x, 80], [x - 1 + i * 0.4, 70], [x + 1.5, 62 + Math.abs(i - 1.5) * 2]], 5, 1, 3);
        paint(g, domeFill(g, x, 70, 6, hand, 0.25), INK, 1.1);
        poly(g, [[x - 0.4, 64 + Math.abs(i - 1.5) * 2], [x + 1.6, 55 + Math.abs(i - 1.5) * 2], [x + 3, 64 + Math.abs(i - 1.5) * 2]]);
        paint(g, '#2a201a', INK, 0.7);
      }
      break;
    }
    case 'pipes': {
      g.translate(80, 76);
      g.rotate(-0.25);
      for (let i = 0; i < 5; i++) {
        rr(g, -10 + i * 4.2, -12, 4, 14 + i * 3, 1.5);
        paint(g, litFill(g, -10 + i * 4.2, -12, 4, 20, '#c4955a', 0.3), INK, 1);
      }
      rr(g, -11, -4, 23, 3.4, 1.2);
      paint(g, '#6b4a2b', INK, 0.9);
      g.rotate(0.25);
      fist(g, 2, 14, 9, hand);
      break;
    }
  }
  g.restore();
}

// ---------------------------------------------------------------- effects

function drawFx(b: B, fx: Fx) {
  const { g, o, r, HX, HY } = b;
  const col = o.glowColor ?? b.accent;
  switch (fx) {
    case 'sparkle':
    case 'frost':
    case 'blink': {
      const c = fx === 'frost' ? '#d9f4ff' : fx === 'blink' ? '#8fd3ff' : shade(col, 0.5);
      for (let i = 0; i < 7; i++) {
        const a = r() * Math.PI * 2, d = 34 + r() * 12;
        const x = 50 + Math.cos(a) * d, y = 46 + Math.sin(a) * d;
        glow(g, x, y, 6, c, 0.6);
        sparkle(g, x, y, 2.2 + r() * 2.4, c);
      }
      if (fx === 'blink') {
        g.setLineDash([3, 3]);
        circle(g, 50, 50, 45);
        g.strokeStyle = alpha('#8fd3ff', 0.7); g.lineWidth = 1.6; g.stroke();
        g.setLineDash([]);
      }
      break;
    }
    case 'eldritch': {
      const c = o.glowColor ?? '#9cff7a';
      for (let i = 0; i < 3; i++) {
        const x = 14 + i * 34 + r() * 6;
        taper(g, [[x, 100], [x - 6, 84], [x + 6, 72], [x - 2, 60]], 4, 0.5, 5);
        g.fillStyle = alpha(c, 0.65);
        g.fill();
      }
      glow(g, 50, 92, 40, c, 0.35);
      break;
    }
    case 'fumes': {
      g.strokeStyle = alpha('#9cc06a', 0.6);
      g.lineWidth = 2;
      g.beginPath();
      for (let i = 0; i < 4; i++) {
        const x = 12 + i * 24 + r() * 6;
        g.moveTo(x, 100);
        g.bezierCurveTo(x - 6, 86, x + 6, 78, x - 2, 64);
      }
      g.stroke();
      break;
    }
    case 'drips': {
      for (let i = 0; i < 6; i++) {
        const x = 18 + r() * 64, y = 20 + r() * 70;
        if (Math.abs(x - 50) < 16 && y < 70) continue;
        g.beginPath();
        g.moveTo(x, y - 4);
        g.quadraticCurveTo(x + 2.4, y, x, y + 2);
        g.quadraticCurveTo(x - 2.4, y, x, y - 4);
        paint(g, alpha('#bfe8ff', 0.85), alpha('#2a5a7a', 0.8), 0.7);
      }
      break;
    }
    case 'motes': {
      const c = o.glowColor ?? '#fff3a0';
      for (let i = 0; i < 9; i++) {
        const a = r() * Math.PI * 2, d = 28 + r() * 18;
        const x = 50 + Math.cos(a) * d, y = 48 + Math.sin(a) * d;
        glow(g, x, y, 5, c, 0.8);
        circle(g, x, y, 1);
        g.fillStyle = '#ffffff';
        g.fill();
      }
      break;
    }
    case 'aura':
    case 'halo':
      break;
  }
}

// ---------------------------------------------------------------- the builder

function lowerFace(b: B) {
  const o = b.o;
  drawMask(b);
  if (o.mask) return;
  if (o.beard && o.beard !== 'none' && o.beard !== 'stubble') drawBeard(b);
  else {
    if (o.beard === 'stubble') drawBeard(b);
    drawMouth(b);
  }
  drawTusks(b);
}

/** Draw a bust portrait in the 100 x 100 token box. */
export function drawBust(g: G, o: BustOpts, seed = 1) {
  const hw = o.headW ?? 19, hh = o.headH ?? 23, HY = o.headY ?? 44;
  let skin = o.skin;
  if (o.pallor) skin = mix(skin, '#cfd6d4', o.pallor);
  if (o.rot) skin = mix(skin, '#7d8f5a', o.rot * 0.5);
  const b: B = {
    g, r: rng(seed * 31 + 7), o, HX: 50, HY, hw, hh,
    ey: HY + hh * 0.06,
    top: Math.min(78, HY + hh + 3),
    sw: o.shoulders ?? 1,
    skin,
    hair: o.hairColor ?? '#4a3020',
    accent: o.trim ?? o.cloak ?? o.outfitColor ?? '#a3312c',
  };
  if (o.ghost !== undefined) g.globalAlpha = o.ghost;
  if (o.fx === 'aura' || o.fx2 === 'aura') glow(g, 50, 50, 50, o.glowColor ?? b.accent, 0.55);
  if (o.wings) drawWings(b);
  if (o.fx === 'halo' || o.fx2 === 'halo') drawHalo(b, o.glowColor ?? '#ffe08a');
  if (o.quiver) drawQuiver(b);
  if (o.collar === 'high') drawHighCollar(b);
  drawHairBack(b);
  drawBody(b);
  if (o.cloak) drawCloak(b);
  if (o.mantle) drawMantle(b);
  if (o.quiver) {
    g.beginPath(); g.moveTo(24, b.top + 6); g.lineTo(70, 106);
    g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
    g.strokeStyle = '#5a3a22'; g.lineWidth = 3.2; g.stroke();
  }
  drawNecklaces(b);
  if (o.hood === 'down') drawHoodDown(b);
  // neck
  if (!o.skull && o.outfit !== 'wisp' && !o.noFace) {
    const nw = hw * (o.snout ? 0.62 : 0.48);
    rr(g, 50 - nw, HY + hh * 0.4, nw * 2, b.top - HY - hh * 0.4 + 6, nw * 0.5);
    paint(g, litFill(g, 50 - nw, HY, nw * 2, 30, shade(skin, -0.18), 0.2), INK, LW * 0.9);
    ellipse(g, 50, HY + hh * 1.0, nw * 0.95, 4);
    g.fillStyle = alpha(shade(skin, -0.6), 0.35);
    g.fill();
  } else if (o.skull) {
    for (let i = 0; i < 2; i++) {
      rr(g, 46, HY + hh * 0.95 + i * 5, 8, 4.4, 1.6);
      paint(g, shade(skin, -0.05), INK, 1);
    }
  }
  if (o.collar === 'ruff') drawRuff(b);
  drawHairLocks(b);
  if (o.horns === 'ridge' || o.horns === 'nubs') drawRidgeHorns(b);
  if (!o.skull && !o.noFace && (o.hood !== 'up' || !o.earsOver)) drawEars(b);
  if (o.hood === 'up') hoodInterior(b);
  drawFace(b);
  if (!o.noFace && !o.skull) {
    drawWarpaint(b);
    drawScar(b);
  }
  drawEyes(b);
  if (!o.noFace) {
    drawBrows(b);
    drawNose(b);
    if (o.hood !== 'up') lowerFace(b);
  }
  drawHairFront(b);
  if (o.earring && !hairHidden(b)) {
    for (const s of [-1, 1]) {
      circle(g, 50 + s * hw * 1.02, b.ey + 7, 2.2);
      g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
      g.strokeStyle = o.earring; g.lineWidth = 1.2; g.stroke();
    }
  }
  if (o.hood === 'up') {
    drawHoodFrame(b);
    if (!o.noFace) lowerFace(b);
  }
  if (o.hood === 'up' && o.earsOver) drawEars(b);
  if (o.bandana || o.headband) drawBandana(b);
  if (o.helmet) drawHelmet(b);
  if (o.hat) drawHat(b);
  if (o.crown) drawCrown(b);
  if (o.horns && o.horns !== 'ridge' && o.horns !== 'nubs') drawFrontHorns(b);
  const side = o.heldSide ?? 'R';
  if (o.held) heldItem(b, o.held, side);
  if (o.held2) heldItem(b, o.held2, side === 'R' ? 'L' : 'R');
  if (o.fx) drawFx(b, o.fx);
  if (o.fx2) drawFx(b, o.fx2);
  g.globalAlpha = 1;
}

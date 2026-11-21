// Outdoor objects for Lair Labs: nature, terrain, roads, camps, ships and docks, caves and mines,
// swamps, deserts, winter and farms. Original art drawn in code with the Canvas 2D API.
// Top-down, light from the top-left, ink outline, soft gradients, a little seeded wear.
import type { G, ObjDef } from '../art/types';
import {
  rng, circle, ellipse, rr, poly, blob, lumpy, paint, line, domeFill, litFill, bevel, speckle, grain, board, planks, strap, rivet,
  stone, blocks, cloth, gem, glow, flame, liquid, foliage, tuft, shade, mix, alpha, INK, LW, WOOD, METAL, STONE, CLOTH, vars,
} from '../art/kit';

type Rand = () => number;
const TAU = Math.PI * 2;

// ---------- local helpers ----------

/** Stroke the current path twice: a dark ink edge, then the colour on top. */
function inked(g: G, color: string, lw: number, ink = LW) {
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = INK;
  g.lineWidth = lw + ink;
  g.stroke();
  g.strokeStyle = color;
  g.lineWidth = lw;
  g.stroke();
}
/** A polyline drawn as rope, branch or rail: ink edge then colour. */
function cord(g: G, pts: number[][], color: string, lw: number, smooth = true, ink = LW * 0.8) {
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  if (smooth && pts.length > 2) {
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const l = pts[pts.length - 1];
    g.lineTo(l[0], l[1]);
  } else pts.slice(1).forEach(([x, y]) => g.lineTo(x, y));
  inked(g, color, lw, ink);
}
/** A leafy canopy with clumps of a chosen size (foliage() with finer control). */
function canopy(g: G, cx: number, cy: number, r: number, base: string, rand: Rand, clumps: number, lump: number, ry = r) {
  blob(g, lumpy(cx, cy, r, 0.22, 16, rand, ry));
  paint(g, shade(base, -0.38), INK, LW);
  const pts: number[][] = [];
  for (let i = 0; i < clumps; i++) {
    const a = rand() * TAU, d = Math.sqrt(rand()) * (1 - lump * 0.9);
    pts.push([cx + Math.cos(a) * d * r, cy + Math.sin(a) * d * ry]);
  }
  pts.sort((a, b) => b[0] + b[1] - (a[0] + a[1]));
  for (const [x, y] of pts) {
    const cr = r * lump * (0.8 + rand() * 0.4);
    blob(g, lumpy(x, y, cr, 0.35, 7, rand));
    paint(g, domeFill(g, x, y, cr, shade(base, (rand() - 0.5) * 0.12), 0.3), alpha(shade(base, -0.6), 0.6), 0.9);
  }
  speckle(g, cx - r * 0.75, cy - ry * 0.75, r * 1.1, ry * 1.1, rand, Math.round(r / 3), alpha(shade(base, 0.5), 0.45), 1.1);
}
/** A conifer seen from above: stacked star-shaped tiers of needles. snow 0..1 dusts the tips. */
function conifer(g: G, cx: number, cy: number, r: number, base: string, rand: Rand, snow = 0) {
  const tiers = [1, 0.76, 0.52, 0.3];
  tiers.forEach((k, li) => {
    const n = 12 - li * 2, off = rand() * TAU;
    const pts: number[][] = [];
    for (let i = 0; i < n * 2; i++) {
      const a = off + (i / (n * 2)) * TAU;
      const rad = r * k * (i % 2 ? 0.68 + rand() * 0.1 : 0.93 + rand() * 0.09);
      pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
    }
    poly(g, pts);
    paint(g, domeFill(g, cx, cy, r * k, shade(base, -0.22 + li * 0.11), 0.32), li === 0 ? INK : alpha(INK, 0.6), li === 0 ? LW : 1.2);
    // needle strokes
    g.strokeStyle = alpha(shade(base, -0.55), 0.45);
    g.lineWidth = 0.9;
    for (let i = 0; i < n * 2; i += 2) {
      const [x, y] = pts[i];
      g.beginPath();
      g.moveTo(cx + (x - cx) * 0.55, cy + (y - cy) * 0.55);
      g.lineTo(cx + (x - cx) * 0.9, cy + (y - cy) * 0.9);
      g.stroke();
    }
    if (snow) {
      g.save();
      poly(g, pts);
      g.clip();
      const sg = g.createRadialGradient(cx - r * k * 0.45, cy - r * k * 0.5, 0, cx - r * k * 0.2, cy - r * k * 0.2, r * k * 1.15);
      sg.addColorStop(0, alpha('#ffffff', 0.95 * snow));
      sg.addColorStop(0.55, alpha('#eef4fa', 0.75 * snow));
      sg.addColorStop(1, alpha('#dfe9f2', 0));
      g.fillStyle = sg;
      g.fillRect(cx - r, cy - r, r * 2, r * 2);
      g.restore();
    }
  });
  circle(g, cx, cy, r * 0.07);
  paint(g, snow ? '#f4f8fb' : shade(base, 0.25), alpha(INK, 0.6), 1);
}
/** Recursive bare branches seen from above. */
function branches(g: G, cx: number, cy: number, len: number, wd: number, color: string, rand: Rand, mains = 5, depth = 3) {
  const segs: number[][] = [];
  const grow = (x: number, y: number, a: number, l: number, w: number, d: number) => {
    const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
    segs.push([x, y, x2, y2, w]);
    if (d > 0) {
      grow(x2, y2, a - 0.35 - rand() * 0.35, l * (0.55 + rand() * 0.15), w * 0.6, d - 1);
      grow(x2, y2, a + 0.35 + rand() * 0.35, l * (0.55 + rand() * 0.15), w * 0.6, d - 1);
    }
  };
  const off = rand() * TAU;
  for (let i = 0; i < mains; i++) grow(cx, cy, off + (i / mains) * TAU + (rand() - 0.5) * 0.5, len * (0.8 + rand() * 0.25), wd, depth);
  g.lineCap = 'round';
  g.strokeStyle = INK;
  for (const [x, y, x2, y2, w] of segs) { g.lineWidth = w + 2.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); }
  for (const [x, y, x2, y2, w] of segs) {
    g.strokeStyle = shade(color, w > 5 ? 0 : 0.12);
    g.lineWidth = w;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
  }
}
/** A wooden wheel seen from above: a thin rim slab with a hub. Long axis along y. */
function wheelTop(g: G, cx: number, cy: number, len: number, thick: number, wood: string, metal: string) {
  rr(g, cx - thick / 2, cy - len / 2, thick, len, thick * 0.45);
  paint(g, litFill(g, cx - thick / 2, cy - len / 2, thick, len, wood, 0.25), INK, LW * 0.8);
  rr(g, cx - thick / 2, cy - len / 2, thick, 4, 2);
  paint(g, metal, null);
  rr(g, cx - thick / 2, cy + len / 2 - 4, thick, 4, 2);
  paint(g, metal, null);
  circle(g, cx, cy, thick * 0.55);
  paint(g, domeFill(g, cx, cy, thick * 0.55, metal, 0.4), INK, 1);
}
/** A log lying along the y axis with bark lines and a cut end at the bottom. */
function logY(g: G, cx: number, y: number, len: number, rad: number, bark: string, inner: string, rand: Rand, endCap = true) {
  rr(g, cx - rad, y, rad * 2, len, rad * 0.9);
  const gr = g.createLinearGradient(cx - rad, 0, cx + rad, 0);
  gr.addColorStop(0, shade(bark, 0.2));
  gr.addColorStop(0.4, bark);
  gr.addColorStop(1, shade(bark, -0.45));
  paint(g, gr, INK, LW * 0.9);
  g.save();
  rr(g, cx - rad, y, rad * 2, len, rad * 0.9);
  g.clip();
  g.strokeStyle = alpha(shade(bark, -0.6), 0.6);
  g.lineWidth = 1;
  const n = Math.max(3, Math.round(rad / 3));
  for (let i = 0; i < n; i++) {
    const ox = cx - rad + ((i + 0.5) / n) * rad * 2;
    g.beginPath();
    g.moveTo(ox, y + rand() * 8);
    for (let t = 0; t < len; t += 10) g.lineTo(ox + (rand() - 0.5) * 2.2, y + t + rand() * 6);
    g.stroke();
  }
  g.restore();
  if (endCap) {
    ellipse(g, cx, y + len - rad * 0.55, rad * 0.92, rad * 0.5);
    paint(g, inner, INK, 1.2);
    for (let k = 1; k < 3; k++) {
      ellipse(g, cx, y + len - rad * 0.55, rad * 0.92 * (k / 3), rad * 0.5 * (k / 3));
      g.strokeStyle = alpha(shade(inner, -0.45), 0.7);
      g.lineWidth = 0.8;
      g.stroke();
    }
  }
}
/** A peaked roof seen from above: two halves, lit and shaded, with a ridge line. ridge 'h' runs left-right. */
function roofTop(g: G, x: number, y: number, w: number, h: number, base: string, ridge: 'h' | 'v', lines = 0, r = 3) {
  rr(g, x, y, w, h, r);
  paint(g, base, INK, LW);
  g.save();
  rr(g, x, y, w, h, r);
  g.clip();
  if (ridge === 'v') {
    g.fillStyle = litFill(g, x, y, w / 2, h, shade(base, 0.12), 0.12);
    g.fillRect(x, y, w / 2, h);
    g.fillStyle = litFill(g, x + w / 2, y, w / 2, h, shade(base, -0.2), 0.12);
    g.fillRect(x + w / 2, y, w / 2, h);
  } else {
    g.fillStyle = litFill(g, x, y, w, h / 2, shade(base, 0.12), 0.12);
    g.fillRect(x, y, w, h / 2);
    g.fillStyle = litFill(g, x, y + h / 2, w, h / 2, shade(base, -0.2), 0.12);
    g.fillRect(x, y + h / 2, w, h / 2);
  }
  if (lines) {
    g.strokeStyle = alpha(shade(base, -0.5), 0.55);
    g.lineWidth = 1;
    for (let i = 1; i < lines; i++) {
      g.beginPath();
      if (ridge === 'v') { const yy = y + (i / lines) * h; g.moveTo(x, yy); g.lineTo(x + w, yy); }
      else { const xx = x + (i / lines) * w; g.moveTo(xx, y); g.lineTo(xx, y + h); }
      g.stroke();
    }
  }
  g.restore();
  if (ridge === 'v') line(g, x + w / 2, y + 1, x + w / 2, y + h - 1, INK, 1.8);
  else line(g, x + 1, y + h / 2, x + w - 1, y + h / 2, INK, 1.8);
}
/** A tent peg with a guy rope running to it. */
function guy(g: G, x1: number, y1: number, x2: number, y2: number, rope = '#c9b48a') {
  line(g, x1, y1, x2, y2, alpha(INK, 0.7), 1.6);
  line(g, x1, y1, x2, y2, rope, 0.8);
  circle(g, x2, y2, 1.9);
  paint(g, '#6b4a2b', INK, 0.8);
}
/** A round coil of rope (spiral). */
function coil(g: G, cx: number, cy: number, r: number, color: string, turns = 4, lw = 4) {
  g.beginPath();
  const steps = turns * 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, a = t * turns * TAU, rad = r * 0.18 + r * 0.82 * t;
    const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  inked(g, color, lw, 1.8);
  // twist ticks
  g.strokeStyle = alpha(shade(color, -0.5), 0.6);
  g.lineWidth = 0.8;
  for (let i = 4; i < steps; i += 2) {
    const t = i / steps, a = t * turns * TAU, rad = r * 0.18 + r * 0.82 * t;
    const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
    g.beginPath();
    g.moveTo(x - Math.cos(a) * lw * 0.4, y - Math.sin(a) * lw * 0.4);
    g.lineTo(x + Math.cos(a + 0.6) * lw * 0.4, y + Math.sin(a + 0.6) * lw * 0.4);
    g.stroke();
  }
}
/** A ring of fire stones with logs and flame (shared by the camp fires). */
function fireRing(g: G, cx: number, cy: number, r: number, rand: Rand, lit = true, rock = STONE.grey, fire = '#ffb02e') {
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU + rand() * 0.2;
    stone(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.24, shade(rock, (rand() - 0.5) * 0.2), rand);
  }
  circle(g, cx, cy, r * 0.8);
  paint(g, '#2a1d16', null);
  speckle(g, cx - r * 0.6, cy - r * 0.6, r * 1.2, r * 1.2, rand, 14, '#5a4a40', 1.6);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.4;
    g.save();
    g.translate(cx, cy);
    g.rotate(a);
    rr(g, -r * 0.08, -r * 0.1, r * 0.75, r * 0.2, r * 0.08);
    paint(g, litFill(g, 0, -r * 0.1, r * 0.7, r * 0.2, '#6b4428', 0.2), INK, 1.2);
    rr(g, -r * 0.08, -r * 0.1, r * 0.3, r * 0.2, r * 0.08);
    paint(g, '#2b1a12', null);
    g.restore();
  }
  for (let i = 0; i < 8; i++) {
    circle(g, cx + (rand() - 0.5) * r * 0.7, cy + (rand() - 0.5) * r * 0.7, 1.5 + rand() * 2.2);
    paint(g, rand() < 0.5 ? '#ff7a1a' : '#c2410c', null);
  }
  if (lit) {
    const hot = fire === '#ffb02e' ? ['#fff3b0', '#ffb02e', '#e2481b'] : [shade(fire, 0.7), fire, shade(fire, -0.4)];
    flame(g, cx, cy, r * 0.42, rand, hot[0], hot[1], hot[2]);
  } else glow(g, cx, cy, r * 0.9, '#ff6a1a', 0.35);
}
/** A cut crop of shaded stone for walls, cairns and rubble. */
function rocks(g: G, cx: number, cy: number, spread: number, n: number, rmin: number, rmax: number, base: string, rand: Rand, sy = 1) {
  const list: number[][] = [];
  for (let i = 0; i < n; i++) {
    const a = rand() * TAU, d = Math.sqrt(rand()) * spread;
    list.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * sy, rmin + rand() * (rmax - rmin)]);
  }
  list.sort((a, b) => b[2] - a[2]);
  for (const [x, y, rad] of list) stone(g, x, y, rad, shade(base, (rand() - 0.5) * 0.22), rand);
}

const LEAF = { summer: '#4f7a34', dark: '#2f4f2a', autumn: '#b5602a', spring: '#7aa64a' };
const SAND = '#d8bf8a';
const SNOW = '#eef3f8';
const ICE = '#a9d6ea';
const WATER = '#3d7a92';
const MUD = '#5b4632';
const STRAW = '#d6b25e';
const ROPE = '#c9b48a';
const CANVAS = '#d9cdb0';

// ======================= NATURE: trees, plants, rocks =======================
const NATURE: ObjDef[] = [
  {
    id: 'tree-pine', name: 'Pine tree', cat: 'nature', sets: ['forest', 'camp', 'winter'], tags: ['tree', 'conifer', 'evergreen', 'canopy', 'cover', 'spruce'],
    w: 2, h: 2, layer: 'overhead', blocksSight: true, c: { leaf: '#2f5b3a' },
    variants: [{ name: 'Green pine', c: {} }, { name: 'Blue spruce', c: { leaf: '#3c6470' } }, { name: 'Golden larch', c: { leaf: '#b08a2e' } }, { name: 'Dark fir', c: { leaf: '#1f3d2a' } }],
    desc: 'A tall pine seen from above. The canopy hides tokens beneath it.',
    draw: ({ g, w, h, c, seed }) => conifer(g, w / 2, h / 2, 92, c.leaf, rng(seed)),
  },
  {
    id: 'tree-fir-snow', name: 'Snowy fir', cat: 'nature', sets: ['winter', 'forest'], tags: ['tree', 'conifer', 'snow', 'evergreen', 'canopy', 'cover'],
    w: 2, h: 2, layer: 'overhead', blocksSight: true, c: { leaf: '#2c5640' }, variants: [{ name: 'Snow-dusted', c: {}, f: { snow: 0.6 } }, { name: 'Heavy snow', c: {}, f: { snow: 1 } }, { name: 'Frosted blue', c: { leaf: '#3a6378' }, f: { snow: 0.8 } }],
    desc: 'A fir tree weighed down with snow.',
    draw: ({ g, w, h, c, f, seed }) => conifer(g, w / 2, h / 2, 92, c.leaf, rng(seed), f.snow ?? 0.7),
  },
  {
    id: 'tree-birch', name: 'Birch tree', cat: 'nature', sets: ['forest', 'town', 'farm'], tags: ['tree', 'canopy', 'cover', 'silver birch', 'aspen'],
    w: 2, h: 2, layer: 'overhead', blocksSight: true, c: { leaf: '#8db04a', trunk: '#ece7dc' },
    variants: [{ name: 'Summer', c: {} }, { name: 'Autumn gold', c: { leaf: '#d8a632' } }, { name: 'Spring', c: { leaf: '#a9c95c' } }],
    desc: 'A light, airy birch. Pale bark shows through its leaves.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      branches(g, w / 2, h / 2, 50, 7, c.trunk, r, 4, 1);
      canopy(g, w / 2, h / 2, 82, c.leaf, r, 22, 0.22);
    },
  },
  {
    id: 'tree-willow', name: 'Weeping willow', cat: 'nature', sets: ['forest', 'swamp', 'town', 'farm'], tags: ['tree', 'canopy', 'cover', 'river', 'pond'],
    w: 3, h: 3, layer: 'overhead', blocksSight: true, c: { leaf: '#7c9a48' }, variants: [{ name: 'Green', c: {} }, { name: 'Silver', c: { leaf: '#93a68a' } }, { name: 'Autumn', c: { leaf: '#b49a3c' } }],
    desc: 'A broad willow whose trailing fronds hang to the ground.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2, R = 138;
      blob(g, lumpy(cx, cy, R * 0.97, 0.12, 18, r));
      paint(g, shade(c.leaf, -0.42), INK, LW);
      g.lineCap = 'round';
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < 46; i++) {
          const a = (i / 46) * TAU + r() * 0.12;
          const r0 = R * (0.08 + r() * 0.2), r1 = R * (pass ? 0.62 + r() * 0.2 : 0.8 + r() * 0.15);
          const sw = (r() - 0.5) * 0.35;
          g.strokeStyle = shade(c.leaf, pass ? 0.05 + r() * 0.2 : -0.18 + r() * 0.12);
          g.lineWidth = pass ? 3.4 : 4.4;
          g.beginPath();
          g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          g.quadraticCurveTo(cx + Math.cos(a + sw) * (r0 + r1) / 2, cy + Math.sin(a + sw) * (r0 + r1) / 2, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          g.stroke();
        }
      }
      blob(g, lumpy(cx, cy, R * 0.3, 0.3, 10, r));
      paint(g, domeFill(g, cx, cy, R * 0.3, shade(c.leaf, 0.12), 0.3), alpha(INK, 0.5), 1);
      speckle(g, cx - R * 0.7, cy - R * 0.7, R * 1.1, R * 1.1, r, 40, alpha(shade(c.leaf, 0.55), 0.5), 1.1);
    },
  },
  {
    id: 'tree-dead', name: 'Dead tree', cat: 'nature', sets: ['swamp', 'forest', 'crypt', 'desert', 'winter'], tags: ['tree', 'bare', 'spooky', 'withered', 'branches', 'haunted'],
    w: 2, h: 2, layer: 'overhead', c: { wood: '#6e6253' }, variants: [{ name: 'Grey', c: {} }, { name: 'Black', c: { wood: '#3a332e' } }, { name: 'Bleached', c: { wood: '#b8ad98' } }],
    desc: 'A leafless, twisted tree. Gives no real cover.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      branches(g, w / 2, h / 2, 40, 10, c.wood, r, 5, 3);
      circle(g, w / 2, h / 2, 13);
      paint(g, domeFill(g, w / 2, h / 2, 13, c.wood, 0.3), INK, LW);
      circle(g, w / 2 + 2, h / 2 + 1, 5);
      paint(g, shade(c.wood, -0.5), null);
    },
  },
  {
    id: 'tree-palm', name: 'Palm tree', cat: 'nature', sets: ['desert', 'ship', 'forest'], tags: ['tree', 'tropical', 'oasis', 'island', 'beach', 'coconut'],
    w: 2, h: 2, layer: 'overhead', c: { leaf: '#5c8f3a' }, variants: [{ name: 'Green', c: {} }, { name: 'Dry', c: { leaf: '#a49045' } }, { name: 'Lush', c: { leaf: '#3f7a3a' } }],
    desc: 'A palm with a crown of long fronds. Oases and islands.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      const n = 8, off = r() * TAU;
      for (let i = 0; i < n; i++) {
        const a = off + (i / n) * TAU + (r() - 0.5) * 0.3, L = 78 + r() * 14, bend = (r() - 0.5) * 30;
        const dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
        const left: number[][] = [], right: number[][] = [];
        for (let k = 0; k <= 12; k++) {
          const t = k / 12, x = cx + dx * L * t + px * bend * t * t, y = cy + dy * L * t + py * bend * t * t;
          const wd = 15 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.7) * (k % 2 ? 1 : 0.6);
          left.push([x + px * wd, y + py * wd]);
          right.push([x - px * wd, y - py * wd]);
        }
        poly(g, [...left, ...right.reverse()]);
        paint(g, domeFill(g, cx + dx * L * 0.4, cy + dy * L * 0.4, L * 0.6, shade(c.leaf, (r() - 0.5) * 0.2), 0.3), INK, 1.3);
        g.beginPath();
        g.moveTo(cx, cy);
        g.quadraticCurveTo(cx + dx * L * 0.5 + px * bend * 0.2, cy + dy * L * 0.5 + py * bend * 0.2, cx + dx * L + px * bend, cy + dy * L + py * bend);
        g.strokeStyle = alpha(shade(c.leaf, -0.55), 0.8);
        g.lineWidth = 1.4;
        g.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const a = r() * TAU;
        circle(g, cx + Math.cos(a) * 8, cy + Math.sin(a) * 8, 6);
        paint(g, domeFill(g, cx + Math.cos(a) * 8, cy + Math.sin(a) * 8, 6, '#6b4a2b', 0.4), INK, 1);
      }
      circle(g, cx, cy, 6);
      paint(g, shade(c.leaf, -0.3), INK, 1);
    },
  },
  {
    id: 'tree-swamp', name: 'Swamp tree', cat: 'nature', sets: ['swamp', 'forest'], tags: ['tree', 'cypress', 'mangrove', 'roots', 'moss', 'bog', 'canopy'],
    w: 3, h: 3, layer: 'overhead', blocksSight: true, c: { leaf: '#56603a', trunk: '#4a3a2a', moss: '#9aa588' },
    variants: [{ name: 'Mossy', c: {} }, { name: 'Dark bog', c: { leaf: '#36452f', moss: '#7d8a70' } }, { name: 'Sickly', c: { leaf: '#77753a', moss: '#b0aa80' } }],
    desc: 'A gnarled swamp tree on spreading roots, hung with moss.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + r() * 0.4, L = 120 + r() * 22, k = (r() - 0.5) * 0.6;
        cord(g, [[cx, cy], [cx + Math.cos(a + k) * L * 0.5, cy + Math.sin(a + k) * L * 0.5], [cx + Math.cos(a) * L, cy + Math.sin(a) * L]], c.trunk, 7, true, LW);
      }
      canopy(g, cx, cy, 104, c.leaf, r, 14, 0.32);
      g.lineCap = 'round';
      for (let i = 0; i < 16; i++) {
        const a = r() * TAU, d = 30 + r() * 64;
        const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
        g.beginPath();
        g.moveTo(x, y);
        g.bezierCurveTo(x + 4, y + 6, x - 4, y + 11, x + 1, y + 17 + r() * 8);
        g.strokeStyle = alpha(INK, 0.5);
        g.lineWidth = 3.4;
        g.stroke();
        g.strokeStyle = c.moss;
        g.lineWidth = 2;
        g.stroke();
      }
    },
  },
  {
    id: 'bush', name: 'Bush', cat: 'nature', sets: ['forest', 'town', 'farm', 'camp', 'swamp'], tags: ['shrub', 'hedge', 'cover', 'plant', 'berries'],
    w: 1, h: 1, c: { leaf: LEAF.summer, fruit: '#c0392b' },
    variants: [{ name: 'Green', c: {} }, { name: 'Berries', c: { leaf: '#3f6b35' }, f: { fruit: 1 } }, { name: 'Flowering', c: { leaf: '#5b8a3c', fruit: '#f2c6de' }, f: { fruit: 1 } }, { name: 'Autumn', c: { leaf: LEAF.autumn } }],
    desc: 'A low leafy shrub. Light cover.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      foliage(g, w / 2, h / 2, 40, c.leaf, r, 8);
      if (f.fruit) for (let i = 0; i < 12; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 30;
        circle(g, w / 2 + Math.cos(a) * d, h / 2 + Math.sin(a) * d, 2.6);
        paint(g, domeFill(g, w / 2 + Math.cos(a) * d, h / 2 + Math.sin(a) * d, 2.6, c.fruit, 0.5), INK, 0.7);
      }
    },
  },
  {
    id: 'thorn-bush', name: 'Thorn bush', cat: 'nature', sets: ['forest', 'swamp', 'desert', 'farm'], tags: ['briar', 'bramble', 'thorns', 'blackberry', 'difficult', 'hazard'],
    w: 1, h: 1, difficult: true, c: { leaf: '#3c4f2c', stem: '#5a3b2a', fruit: '#2a1630' },
    variants: [{ name: 'Briar', c: {} }, { name: 'Blackberry', c: {}, f: { fruit: 1 } }, { name: 'Dry thorns', c: { leaf: '#7a6a42', stem: '#6e5238' } }],
    desc: 'A tangle of thorny stems. Difficult terrain; the GM may call for damage to push through.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      canopy(g, cx, cy, 40, c.leaf, r, 9, 0.3);
      g.lineCap = 'round';
      for (let i = 0; i < 9; i++) {
        const a = r() * TAU, a2 = a + (r() - 0.5) * 1.6, d1 = 6 + r() * 10, d2 = 30 + r() * 12;
        const x1 = cx + Math.cos(a) * d1, y1 = cy + Math.sin(a) * d1, x2 = cx + Math.cos(a2) * d2, y2 = cy + Math.sin(a2) * d2;
        g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26, x2, y2);
        inked(g, c.stem, 1.8, 1.6);
        for (let k = 0; k < 3; k++) {
          const t = 0.3 + k * 0.25, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
          line(g, x, y, x + Math.cos(a2 + 1.4) * 4, y + Math.sin(a2 + 1.4) * 4, '#e6d7b5', 1.1);
        }
      }
      if (f.fruit) for (let i = 0; i < 9; i++) {
        const x = cx + (r() - 0.5) * 50, y = cy + (r() - 0.5) * 50;
        circle(g, x, y, 2.8);
        paint(g, domeFill(g, x, y, 2.8, c.fruit, 0.6), INK, 0.7);
      }
    },
  },
  {
    id: 'hedge', name: 'Hedge', cat: 'nature', sets: ['town', 'farm', 'castle', 'forest'], tags: ['hedgerow', 'shrub', 'wall', 'garden', 'maze'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { leaf: '#3f6a32' }, variants: [{ name: 'Green', c: {} }, { name: 'Dark yew', c: { leaf: '#2a4a2e' } }, { name: 'Autumn', c: { leaf: '#8a6a2a' } }],
    desc: 'A clipped hedge block. Joins up with other hedges.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      rr(g, 4, 6, w - 8, h - 12, 14);
      paint(g, shade(c.leaf, -0.35), INK, LW);
      for (let i = 0; i < 9; i++) {
        const x = 18 + r() * (w - 36), y = 20 + r() * (h - 40), cr = 14 + r() * 6;
        blob(g, lumpy(x, y, cr, 0.3, 7, r));
        paint(g, domeFill(g, x, y, cr, c.leaf, 0.3), alpha(shade(c.leaf, -0.6), 0.6), 0.9);
      }
      speckle(g, 8, 10, w - 16, h - 20, r, 18, alpha(shade(c.leaf, 0.5), 0.45), 1.1);
    },
  },
  {
    id: 'hedge-long', name: 'Hedge row', cat: 'nature', sets: ['town', 'farm', 'castle', 'forest'], tags: ['hedgerow', 'shrub', 'wall', 'garden', 'maze'],
    w: 2, h: 1, blocksMovement: true, blocksSight: true, c: { leaf: '#3f6a32' }, variants: [{ name: 'Green', c: {} }, { name: 'Dark yew', c: { leaf: '#2a4a2e' } }, { name: 'Flowering', c: { leaf: '#4a7334' }, f: { bloom: 1 } }],
    desc: 'A two-square run of clipped hedge.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 4, 10, w - 8, h - 20, 16);
      paint(g, shade(c.leaf, -0.35), INK, LW);
      for (let i = 0; i < 15; i++) {
        const x = 18 + r() * (w - 36), y = 24 + r() * (h - 48), cr = 13 + r() * 6;
        blob(g, lumpy(x, y, cr, 0.3, 7, r));
        paint(g, domeFill(g, x, y, cr, c.leaf, 0.3), alpha(shade(c.leaf, -0.6), 0.6), 0.9);
      }
      speckle(g, 8, 14, w - 16, h - 28, r, 26, alpha(shade(c.leaf, 0.5), 0.45), 1.1);
      if (f.bloom) speckle(g, 12, 18, w - 24, h - 36, r, 30, '#f4d7e6', 1.8);
    },
  },
  {
    id: 'stump', name: 'Tree stump', cat: 'nature', sets: ['forest', 'camp', 'farm', 'swamp'], tags: ['stump', 'wood', 'seat', 'chopping block'],
    w: 1, h: 1, blocksMovement: true, c: { bark: '#5a3d24', wood: '#c9a26b', moss: '#6d8a3a' },
    variants: [{ name: 'Fresh cut', c: {} }, { name: 'Old and mossy', c: { wood: '#9a7a52' }, f: { moss: 1 } }, { name: 'With axe', c: {}, f: { axe: 1 } }],
    desc: 'A sawn-off stump with growth rings.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + r() * 0.5;
        cord(g, [[cx, cy], [cx + Math.cos(a) * 36, cy + Math.sin(a) * 36], [cx + Math.cos(a + 0.2) * 45, cy + Math.sin(a + 0.2) * 45]], c.bark, 6, true, LW);
      }
      blob(g, lumpy(cx, cy, 31, 0.12, 12, r));
      paint(g, c.bark, INK, LW);
      circle(g, cx, cy, 25);
      paint(g, domeFill(g, cx, cy, 25, c.wood, 0.2), INK, 1.2);
      for (let k = 1; k < 5; k++) {
        circle(g, cx + (r() - 0.5) * 2, cy + (r() - 0.5) * 2, k * 5);
        g.strokeStyle = alpha(shade(c.wood, -0.45), 0.6);
        g.lineWidth = 0.9;
        g.stroke();
      }
      line(g, cx, cy, cx + 18, cy - 12, alpha(shade(c.wood, -0.6), 0.7), 1);
      if (f.moss) { blob(g, lumpy(cx - 12, cy + 8, 13, 0.4, 8, r)); paint(g, domeFill(g, cx - 12, cy + 8, 13, c.moss, 0.3), alpha(INK, 0.5), 1); }
      if (f.axe) {
        rr(g, cx - 2, cy - 4, 40, 5, 2);
        paint(g, litFill(g, cx, cy - 4, 40, 5, '#9a6a3a'), INK, 1.2);
        poly(g, [[cx - 6, cy - 12], [cx + 4, cy - 10], [cx + 4, cy + 4], [cx - 6, cy + 6]]);
        paint(g, litFill(g, cx - 6, cy - 12, 10, 18, METAL.iron, 0.4), INK, 1.2);
      }
    },
  },
  {
    id: 'log-fallen', name: 'Fallen log', cat: 'nature', sets: ['forest', 'swamp', 'camp'], tags: ['log', 'trunk', 'wood', 'cover', 'bench'],
    w: 1, h: 3, difficult: true, c: { bark: '#5f4630', wood: '#c69c66', moss: '#6d8a3a' },
    variants: [{ name: 'Oak', c: {} }, { name: 'Mossy', c: {}, f: { moss: 1 } }, { name: 'Birch', c: { bark: '#d8d2c4', wood: '#e2c79a' } }, { name: 'Rotten', c: { bark: '#4a3b2e', wood: '#7a5e40' }, f: { moss: 1 } }],
    desc: 'A felled trunk. Climbing over costs extra movement; half cover behind it.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed), cx = w / 2;
      // broken branch stubs
      for (let i = 0; i < 3; i++) {
        const y = 60 + i * 70 + r() * 20, s = i % 2 ? 1 : -1;
        cord(g, [[cx, y], [cx + s * 34, y - 10 - r() * 10]], c.bark, 5, false, LW);
      }
      logY(g, cx, 10, h - 18, 25, c.bark, c.wood, r);
      // bark stripes on birch
      if (c.bark === '#d8d2c4') for (let i = 0; i < 12; i++) { rr(g, cx - 20 + r() * 26, 20 + r() * (h - 60), 10, 2.4, 1); paint(g, '#2b2622', null); }
      if (f.moss) for (let i = 0; i < 4; i++) {
        const y = 30 + r() * (h - 90);
        blob(g, lumpy(cx - 8 + r() * 10, y, 11 + r() * 6, 0.45, 8, r));
        paint(g, domeFill(g, cx - 6, y, 14, c.moss, 0.3), alpha(INK, 0.45), 0.9);
      }
      // jagged broken top end
      poly(g, [[cx - 25, 22], [cx - 16, 8], [cx - 8, 18], [cx + 2, 6], [cx + 10, 17], [cx + 18, 9], [cx + 25, 22]]);
      paint(g, shade(c.wood, -0.15), INK, 1.2);
    },
  },
  {
    id: 'log-pile', name: 'Log pile', cat: 'nature', sets: ['forest', 'camp', 'farm', 'town', 'winter'], tags: ['firewood', 'wood', 'lumber', 'woodpile', 'logs'],
    w: 2, h: 1, blocksMovement: true, c: { bark: '#5f4630', wood: '#c9a26b' }, variants: [{ name: 'Oak', c: {} }, { name: 'Pine', c: { bark: '#6e4a2c', wood: '#dcb57c' } }, { name: 'Birch', c: { bark: '#d8d2c4', wood: '#e2c79a' } }],
    desc: 'Stacked firewood logs, cut ends facing out.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      // logs lie left-right; draw as rotated logY
      const rows = [22, 42, 62, 80];
      rows.forEach((y, i) => {
        g.save();
        g.translate(10 + (i % 2) * 6, y);
        g.rotate(-Math.PI / 2);
        logY(g, 0, 0, w - 26 - (i % 2) * 6, 10.5, shade(c.bark, (r() - 0.5) * 0.15), c.wood, r);
        g.restore();
      });
      // rotate draws the cut end on the left; add a few more cut ends on the right for a stack feel
      for (let i = 0; i < 4; i++) {
        const y = rows[i];
        ellipse(g, w - 18 - (i % 2) * 6, y, 6, 9.5);
        paint(g, c.wood, INK, 1.1);
        circle(g, w - 18 - (i % 2) * 6, y, 3);
        g.strokeStyle = alpha(shade(c.wood, -0.45), 0.7);
        g.lineWidth = 0.8;
        g.stroke();
      }
    },
  },
  {
    id: 'grass-tall', name: 'Tall grass', cat: 'terrain', sets: ['forest', 'farm', 'swamp', 'camp', 'desert'], tags: ['grass', 'brush', 'meadow', 'undergrowth', 'difficult', 'hide'],
    w: 1, h: 1, difficult: true, c: { grass: '#6f9a3e' }, variants: [{ name: 'Green', c: {} }, { name: 'Dry', c: { grass: '#b9a456' } }, { name: 'Marsh', c: { grass: '#5f7a48' } }, { name: 'Frosted', c: { grass: '#a9b9a0' } }],
    desc: 'Waist-high grass. Difficult terrain; lightly obscured.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(w / 2, h / 2, 44, 0.25, 12, r));
      paint(g, alpha(shade(c.grass, -0.3), 0.55), null);
      for (let i = 0; i < 12; i++) {
        const x = 16 + r() * (w - 32), y = 18 + r() * (h - 30);
        tuft(g, x, y + 1.5, 15 + r() * 6, alpha(INK, 0.55), r);
        tuft(g, x, y, 14 + r() * 6, shade(c.grass, (r() - 0.3) * 0.4), r);
      }
    },
  },
  {
    id: 'flowers', name: 'Wildflowers', cat: 'nature', sets: ['forest', 'farm', 'town', 'camp'], tags: ['flowers', 'meadow', 'garden', 'poppies', 'herbs'],
    w: 1, h: 1, layer: 'floor', flat: true, c: { a: '#e85d75', b: '#f2d14b', cc: '#8fb6ea', grass: '#5f8a3a' },
    variants: [{ name: 'Mixed', c: {} }, { name: 'Red poppies', c: { a: '#d6332a', b: '#e0453a', cc: '#b82a22' } }, { name: 'Bluebells', c: { a: '#5b6fd6', b: '#7d8fe8', cc: '#4a5ac0' } }, { name: 'White daisies', c: { a: '#f5f2e8', b: '#efe9d6', cc: '#ffffff' } }],
    desc: 'A patch of wildflowers. Purely decorative.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 6; i++) tuft(g, 15 + r() * (w - 30), 15 + r() * (h - 30), 10, alpha(c.grass, 0.85), r);
      const cols = [c.a, c.b, c.cc];
      for (let i = 0; i < 13; i++) {
        const x = 12 + r() * (w - 24), y = 12 + r() * (h - 24), pr = 2.6 + r() * 1.6, col = cols[i % 3];
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * TAU;
          circle(g, x + Math.cos(a) * pr, y + Math.sin(a) * pr, pr * 0.85);
          paint(g, col, alpha(INK, 0.6), 0.6);
        }
        circle(g, x, y, pr * 0.6);
        paint(g, '#f5c542', null);
      }
    },
  },
  {
    id: 'ferns', name: 'Ferns', cat: 'nature', sets: ['forest', 'swamp', 'cave'], tags: ['fern', 'bracken', 'undergrowth', 'plant'],
    w: 1, h: 1, c: { leaf: '#4f8a3a' }, variants: [{ name: 'Green', c: {} }, { name: 'Bracken', c: { leaf: '#a0732e' } }, { name: 'Pale cave fern', c: { leaf: '#8bb59a' } }],
    desc: 'A clump of ferns. Lightly obscures small things.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      const n = 7, off = r() * TAU;
      for (let i = 0; i < n; i++) {
        const a = off + (i / n) * TAU + (r() - 0.5) * 0.3, L = 36 + r() * 8, bend = (r() - 0.5) * 14;
        const dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
        const left: number[][] = [], right: number[][] = [];
        for (let k = 0; k <= 10; k++) {
          const t = k / 10, x = cx + dx * L * t + px * bend * t * t, y = cy + dy * L * t + py * bend * t * t;
          const wd = 8 * Math.sin(Math.PI * Math.min(1, t * 1.05)) * (k % 2 ? 1 : 0.45);
          left.push([x + px * wd, y + py * wd]);
          right.push([x - px * wd, y - py * wd]);
        }
        poly(g, [...left, ...right.reverse()]);
        paint(g, domeFill(g, cx + dx * L * 0.4, cy + dy * L * 0.4, L * 0.6, shade(c.leaf, (r() - 0.4) * 0.25), 0.3), INK, 1);
        line(g, cx, cy, cx + dx * L + px * bend, cy + dy * L + py * bend, alpha(shade(c.leaf, -0.55), 0.7), 0.9);
      }
    },
  },
  {
    id: 'reeds', name: 'Reeds and cattails', cat: 'nature', sets: ['swamp', 'forest', 'farm'], tags: ['reeds', 'cattails', 'bulrush', 'marsh', 'pond', 'river', 'difficult'],
    w: 1, h: 1, difficult: true, c: { leaf: '#6f8a42', head: '#6b4228' }, variants: [{ name: 'Green', c: {} }, { name: 'Dry', c: { leaf: '#a99a5a' } }, { name: 'Dark marsh', c: { leaf: '#4c6438' } }],
    desc: 'A stand of reeds at the water\'s edge. Difficult terrain.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      g.lineCap = 'round';
      for (let i = 0; i < 26; i++) {
        const x = 15 + r() * (w - 30), y = 15 + r() * (h - 30), a = -Math.PI / 2 + (r() - 0.5) * 2.2 + (x < w / 2 ? -0.4 : 0.4), L = 14 + r() * 14;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + 3, y + Math.sin(a) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L);
        inked(g, shade(c.leaf, (r() - 0.4) * 0.35), 2, 1.4);
      }
      for (let i = 0; i < 8; i++) {
        const x = 22 + r() * (w - 44), y = 22 + r() * (h - 44), a = r() * TAU;
        ellipse(g, x, y, 5.5, 2.6, a);
        paint(g, domeFill(g, x, y, 5.5, c.head, 0.4), INK, 1);
      }
    },
  },
  {
    id: 'lily-pads', name: 'Lily pads', cat: 'nature', sets: ['swamp', 'forest', 'town'], tags: ['lily', 'water', 'pond', 'lotus', 'flower'],
    w: 1, h: 1, layer: 'floor', flat: true, c: { leaf: '#4f8a3a', flower: '#f2b6c9' }, variants: [{ name: 'Pink lilies', c: {} }, { name: 'White lilies', c: { flower: '#f7f3e8' } }, { name: 'No flowers', c: {}, f: { bare: 1 } }],
    desc: 'Floating lily pads. Place on water.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const pads: number[][] = [];
      for (let i = 0; i < 6; i++) pads.push([18 + r() * (w - 36), 18 + r() * (h - 36), 9 + r() * 7]);
      for (const [x, y, pr] of pads) {
        const a = r() * TAU;
        g.beginPath();
        g.moveTo(x, y);
        g.arc(x, y, pr, a + 0.35, a + TAU - 0.35);
        g.closePath();
        paint(g, domeFill(g, x, y, pr, shade(c.leaf, (r() - 0.5) * 0.2), 0.35), INK, 1.1);
        line(g, x, y, x + Math.cos(a + Math.PI) * pr * 0.8, y + Math.sin(a + Math.PI) * pr * 0.8, alpha(shade(c.leaf, -0.5), 0.6), 0.8);
      }
      if (!f.bare) for (let i = 0; i < 2; i++) {
        const [x, y] = pads[i];
        for (let p = 0; p < 7; p++) {
          const a = (p / 7) * TAU;
          ellipse(g, x + Math.cos(a) * 4, y + Math.sin(a) * 4, 4.4, 2.2, a);
          paint(g, domeFill(g, x, y, 6, c.flower, 0.3), alpha(INK, 0.7), 0.7);
        }
        circle(g, x, y, 2.2);
        paint(g, '#f5c542', null);
      }
    },
  },
  {
    id: 'mushrooms', name: 'Mushrooms', cat: 'nature', sets: ['forest', 'cave', 'swamp'], tags: ['mushroom', 'toadstool', 'fungus', 'fairy ring', 'ingredient'],
    w: 1, h: 1, c: { cap: '#b8382e', spot: '#f4ecd8' },
    variants: [{ name: 'Red toadstools', c: {} }, { name: 'Brown', c: { cap: '#8a5f3a', spot: '#d9c6a3' }, f: { plain: 1 } }, { name: 'Purple', c: { cap: '#6a3d8a', spot: '#d8c2ef' } }, { name: 'Fairy ring', c: { cap: '#c9a46a', spot: '#f4ecd8' }, f: { ring: 1 } }],
    desc: 'A cluster of mushrooms. Some may be useful, some poisonous.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const list: number[][] = [];
      if (f.ring) for (let i = 0; i < 11; i++) { const a = (i / 11) * TAU + r() * 0.2; list.push([w / 2 + Math.cos(a) * 34, h / 2 + Math.sin(a) * 34, 6 + r() * 3]); }
      else for (let i = 0; i < 7; i++) list.push([22 + r() * (w - 44), 22 + r() * (h - 44), 6 + r() * 9]);
      list.sort((a, b) => a[2] - b[2]);
      for (const [x, y, cr] of list) {
        circle(g, x, y, cr);
        paint(g, domeFill(g, x, y, cr, c.cap, 0.45), INK, 1.2);
        if (!f.plain) for (let k = 0; k < 3; k++) {
          circle(g, x + (r() - 0.6) * cr, y + (r() - 0.6) * cr, cr * 0.16 + 0.5);
          paint(g, c.spot, null);
        }
      }
    },
  },
  {
    id: 'mushroom-giant', name: 'Giant mushroom', cat: 'nature', sets: ['cave', 'forest', 'swamp'], tags: ['mushroom', 'fungus', 'giant', 'underdark', 'cave', 'canopy'],
    w: 2, h: 2, layer: 'overhead', blocksSight: true, c: { cap: '#9a4a3a', spot: '#e9dcc0' },
    variants: [{ name: 'Rust red', c: {} }, { name: 'Pale cave', c: { cap: '#bdb39a', spot: '#8f866e' } }, { name: 'Violet', c: { cap: '#5b3a7a', spot: '#c7a8ef' } }, { name: 'Teal', c: { cap: '#2f6f6a', spot: '#a6ece0' } }],
    desc: 'A mushroom cap as wide as a tent. Tokens can stand beneath it.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      blob(g, lumpy(cx, cy, 86, 0.1, 14, r));
      paint(g, domeFill(g, cx, cy, 86, c.cap, 0.4), INK, LW * 1.1);
      g.save();
      blob(g, lumpy(cx, cy, 86, 0.0, 14, r));
      g.clip();
      g.strokeStyle = alpha(shade(c.cap, -0.5), 0.35);
      g.lineWidth = 1.2;
      for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU; line(g, cx + Math.cos(a) * 60, cy + Math.sin(a) * 60, cx + Math.cos(a) * 86, cy + Math.sin(a) * 86, alpha(shade(c.cap, -0.5), 0.35), 1.1); }
      g.restore();
      for (let i = 0; i < 11; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 62, sr = 5 + r() * 7;
        blob(g, lumpy(cx + Math.cos(a) * d, cy + Math.sin(a) * d, sr, 0.35, 7, r));
        paint(g, alpha(c.spot, 0.9), alpha(INK, 0.4), 0.8);
      }
    },
  },
  {
    id: 'boulder', name: 'Boulder', cat: 'terrain', sets: ['forest', 'cave', 'mine', 'desert', 'winter', 'camp'], tags: ['rock', 'stone', 'cover'],
    w: 1, h: 1, blocksMovement: true, c: { rock: STONE.grey, moss: '#6d8a3a' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { rock: STONE.sand } }, { name: 'Dark', c: { rock: STONE.dark } }, { name: 'Mossy', c: {}, f: { moss: 1 } }],
    desc: 'A big rock. Half cover.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      stone(g, w / 2, h / 2, 40, c.rock, r, 36);
      if (f.moss) { blob(g, lumpy(w / 2 - 10, h / 2 - 10, 18, 0.5, 9, r)); paint(g, alpha(c.moss, 0.85), alpha(INK, 0.35), 0.8); speckle(g, 25, 25, 30, 30, r, 10, alpha(shade(c.moss, 0.4), 0.7), 1.2); }
    },
  },
  {
    id: 'boulder-large', name: 'Large boulder', cat: 'terrain', sets: ['forest', 'cave', 'mine', 'desert', 'winter'], tags: ['rock', 'stone', 'cover', 'outcrop'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { rock: STONE.grey, moss: '#6d8a3a' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { rock: STONE.sand } }, { name: 'Dark', c: { rock: STONE.dark } }, { name: 'Mossy', c: {}, f: { moss: 1 } }, { name: 'Snow-capped', c: {}, f: { snow: 1 } }],
    desc: 'A house-sized rock. Full cover; blocks sight.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      stone(g, w / 2, h / 2, 82, c.rock, r, 74);
      stone(g, 40, h - 26, 14, shade(c.rock, -0.08), r, 11);
      stone(g, w - 30, h - 46, 10, shade(c.rock, 0.05), r, 9);
      if (f.moss) for (let i = 0; i < 3; i++) { const x = 50 + r() * 70, y = 50 + r() * 70; blob(g, lumpy(x, y, 16 + r() * 10, 0.5, 9, r)); paint(g, alpha(c.moss, 0.85), alpha(INK, 0.35), 0.8); }
      if (f.snow) { blob(g, lumpy(w / 2 - 22, h / 2 - 24, 42, 0.35, 10, r, 32)); paint(g, domeFill(g, w / 2 - 22, h / 2 - 24, 42, SNOW, 0.15), alpha(INK, 0.4), 1); }
    },
  },
  {
    id: 'rubble-pile', name: 'Rubble', cat: 'terrain', sets: ['dungeon', 'cave', 'mine', 'castle', 'town', 'crypt', 'desert'], tags: ['rubble', 'debris', 'collapse', 'rocks', 'difficult'],
    w: 1, h: 1, difficult: true, c: { rock: STONE.grey }, variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { rock: STONE.sand } }, { name: 'Dark', c: { rock: STONE.dark } }, { name: 'Brick', c: { rock: STONE.red } }],
    desc: 'Loose fallen stone. Difficult terrain.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(w / 2, h / 2, 44, 0.3, 12, r));
      paint(g, alpha(shade(c.rock, -0.15), 0.45), null);
      speckle(g, 10, 10, w - 20, h - 20, r, 26, alpha(shade(c.rock, -0.4), 0.6), 1.5);
      rocks(g, w / 2, h / 2, 30, 11, 5, 15, c.rock, r);
    },
  },
  {
    id: 'puddle', name: 'Puddle', cat: 'terrain', sets: ['dungeon', 'cave', 'town', 'forest', 'swamp', 'sewer', 'farm'], tags: ['water', 'puddle', 'wet', 'pool'],
    w: 1, h: 1, layer: 'floor', flat: true, c: { water: '#4f7f95' }, variants: [{ name: 'Clear water', c: {} }, { name: 'Muddy', c: { water: '#6b5a40' } }, { name: 'Murky green', c: { water: '#4a6a3c' } }, { name: 'Dark', c: { water: '#26343c' } }],
    desc: 'A shallow puddle. Purely cosmetic unless the GM says otherwise.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const pts = lumpy(w / 2, h / 2, 38, 0.35, 10, r, 30);
      blob(g, pts);
      paint(g, alpha(shade(c.water, -0.3), 0.6), null);
      blob(g, lumpy(w / 2, h / 2, 34, 0.3, 10, r, 26));
      const gr = g.createRadialGradient(w / 2 + 6, h / 2 + 6, 2, w / 2, h / 2, 38);
      gr.addColorStop(0, alpha(shade(c.water, 0.15), 0.85));
      gr.addColorStop(1, alpha(shade(c.water, -0.25), 0.85));
      paint(g, gr, alpha(INK, 0.35), 1);
      g.strokeStyle = 'rgba(255,255,255,0.45)';
      g.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        const y = 38 + i * 10 + r() * 3, x = 30 + r() * 10;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 2.5, x + 22, y); g.stroke();
      }
      ellipse(g, 38, 38, 8, 3, -0.4);
      g.fillStyle = 'rgba(255,255,255,0.3)';
      g.fill();
    },
  },
];

/** A wooden crate: frame boards, slats and a cross brace. */
function crate(g: G, x: number, y: number, s: number, wood: string, rand: Rand, mark = 0) {
  rr(g, x, y, s, s, 2);
  paint(g, shade(wood, -0.3), INK, LW);
  planks(g, x + 4, y + 4, s - 8, s - 8, wood, rand, 'h', Math.max(3, Math.round(s / 14)));
  const b = Math.max(5, s * 0.12);
  board(g, x, y, s, b, shade(wood, -0.08), rand, 'h', 1.5);
  board(g, x, y + s - b, s, b, shade(wood, -0.08), rand, 'h', 1.5);
  board(g, x, y, b, s, shade(wood, -0.12), rand, 'v', 1.5);
  board(g, x + s - b, y, b, s, shade(wood, -0.12), rand, 'v', 1.5);
  g.save();
  g.translate(x + s / 2, y + s / 2);
  g.rotate(Math.PI / 4);
  board(g, -s * 0.62, -b / 2, s * 1.24, b, shade(wood, 0.05), rand, 'h', 1.5);
  g.restore();
  if (mark) {
    circle(g, x + s * 0.3, y + s * 0.7, s * 0.1);
    g.strokeStyle = alpha('#2a1a10', 0.75);
    g.lineWidth = 1.6;
    g.stroke();
  }
}
/** Rowboat-style hull outline. ends: 1 = pointed bow at top, square stern; 2 = pointed both ends. */
function hull(g: G, cx: number, y0: number, y1: number, half: number, ends: 1 | 2, k = 1) {
  const L = y1 - y0, hw = half * k, top = y0 + (1 - k) * L * 0.06, bot = y1 - (1 - k) * L * 0.06;
  g.beginPath();
  g.moveTo(cx, top);
  if (ends === 1) {
    g.bezierCurveTo(cx + hw * 0.8, top + L * 0.07, cx + hw * 1.04, top + L * 0.3, cx + hw, top + L * 0.52);
    g.lineTo(cx + hw * 0.72, bot);
    g.lineTo(cx - hw * 0.72, bot);
    g.lineTo(cx - hw, top + L * 0.52);
    g.bezierCurveTo(cx - hw * 1.04, top + L * 0.3, cx - hw * 0.8, top + L * 0.07, cx, top);
  } else {
    g.bezierCurveTo(cx + hw * 0.9, top + L * 0.18, cx + hw * 1.05, top + L * 0.4, cx + hw, top + L * 0.5);
    g.bezierCurveTo(cx + hw * 1.05, top + L * 0.6, cx + hw * 0.9, top + L * 0.82, cx, bot);
    g.bezierCurveTo(cx - hw * 0.9, top + L * 0.82, cx - hw * 1.05, top + L * 0.6, cx - hw, top + L * 0.5);
    g.bezierCurveTo(cx - hw * 1.05, top + L * 0.4, cx - hw * 0.9, top + L * 0.18, cx, top);
  }
  g.closePath();
}
/** An oar or paddle lying along a direction. */
function oar(g: G, x1: number, y1: number, x2: number, y2: number, wood: string, blade = 9) {
  cord(g, [[x1, y1], [x2, y2]], wood, 3.2, false, 1.6);
  const a = Math.atan2(y2 - y1, x2 - x1);
  ellipse(g, x2 + Math.cos(a) * blade * 0.9, y2 + Math.sin(a) * blade * 0.9, blade * 1.3, blade * 0.5, a);
  paint(g, litFill(g, x2 - blade, y2 - blade, blade * 2, blade * 2, wood, 0.25), INK, 1.1);
}

// ======================= ROADS, WALLS, BRIDGES, TOWN EDGE =======================
const ROAD: ObjDef[] = [
  {
    id: 'wall-stone-low', name: 'Low stone wall', cat: 'structure', sets: ['farm', 'town', 'forest', 'castle', 'winter'], tags: ['wall', 'dry stone', 'field wall', 'cover', 'fence'],
    w: 2, h: 1, blocksMovement: true, c: { rock: STONE.grey, moss: '#6d8a3a' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { rock: STONE.sand } }, { name: 'Mossy', c: {}, f: { moss: 1 } }, { name: 'Tumbled', c: {}, f: { broken: 1 } }],
    desc: 'A waist-high dry-stone wall. Half cover; climb over for extra movement.',
    draw: ({ g, w, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 4, 30, w - 8, 40, 10);
      paint(g, shade(c.rock, -0.4), INK, LW);
      for (let row = 0; row < 2; row++) {
        let x = 6 + row * 6;
        while (x < w - 12) {
          const rad = 8 + r() * 5;
          if (!(f.broken && x > w * 0.45 && x < w * 0.7)) stone(g, x + rad, 40 + row * 20, rad, shade(c.rock, (r() - 0.5) * 0.25), r, rad * 0.78);
          x += rad * 1.75;
        }
      }
      if (f.broken) rocks(g, w * 0.58, 70, 18, 5, 4, 8, c.rock, r);
      if (f.moss) for (let i = 0; i < 5; i++) { const x = 15 + r() * (w - 30); blob(g, lumpy(x, 38 + r() * 24, 7 + r() * 5, 0.5, 7, r)); paint(g, alpha(c.moss, 0.85), null); }
    },
  },
  {
    id: 'fence-wood', name: 'Wooden fence', cat: 'structure', sets: ['farm', 'town', 'camp', 'forest'], tags: ['fence', 'rail', 'paddock', 'pen'],
    w: 2, h: 1, blocksMovement: true, c: { wood: '#8a6a48' },
    variants: [{ name: 'Weathered', c: {} }, { name: 'Dark', c: { wood: WOOD.walnut } }, { name: 'Whitewashed', c: { wood: '#e3ddd0' } }, { name: 'Broken', c: { wood: '#7a6048' }, f: { broken: 1 } }],
    desc: 'A post-and-rail fence section. Easy to climb, blocks a straight walk.',
    draw: ({ g, w, c, f, seed }) => {
      const r = rng(seed);
      if (f.broken) {
        board(g, 8, 44, w * 0.42, 8, c.wood, r, 'h');
        g.save(); g.translate(w * 0.62, 56); g.rotate(0.35); board(g, 0, -4, w * 0.36, 8, shade(c.wood, -0.1), r, 'h'); g.restore();
      } else {
        board(g, 6, 41, w - 12, 7, c.wood, r, 'h');
        board(g, 6, 53, w - 12, 7, shade(c.wood, -0.06), r, 'h');
      }
      for (const x of [10, w / 2, w - 10]) {
        rr(g, x - 7, 43, 14, 14, 2.5);
        paint(g, litFill(g, x - 7, 43, 14, 14, shade(c.wood, -0.1), 0.3), INK, LW);
        circle(g, x, 50, 3);
        g.strokeStyle = alpha(shade(c.wood, -0.6), 0.6);
        g.lineWidth = 0.8;
        g.stroke();
      }
    },
  },
  {
    id: 'fence-gate', name: 'Field gate', cat: 'structure', sets: ['farm', 'town', 'castle'], tags: ['gate', 'fence', 'entrance', 'door'],
    w: 2, h: 1, blocksMovement: true, c: { wood: '#8a6a48', metal: METAL.iron },
    variants: [{ name: 'Closed', c: {} }, { name: 'Ajar', c: {}, f: { open: 1 } }, { name: 'Dark wood closed', c: { wood: WOOD.walnut } }, { name: 'Iron gate', c: { wood: '#4a4d52', metal: '#2e3135' }, f: { iron: 1 } }],
    desc: 'A two-leaf gate between stout posts. Pick Ajar to show it swung open.',
    draw: ({ g, w, c, f, seed }) => {
      const r = rng(seed);
      const leaf = (px: number, dir: number) => {
        g.save();
        g.translate(px, 50);
        if (f.open) g.rotate(dir * 0.55);
        const L = w / 2 - 16;
        if (f.iron) {
          rr(g, dir > 0 ? 0 : -L, -4, L, 8, 2);
          paint(g, litFill(g, -L, -4, L * 2, 8, c.wood, 0.4), INK, 1.4);
          for (let k = 1; k < 6; k++) { const x = (dir > 0 ? 0 : -L) + (k / 6) * L; circle(g, x, 0, 2.6); paint(g, shade(c.wood, 0.3), INK, 0.8); }
        } else {
          board(g, dir > 0 ? 0 : -L, -5, L, 10, c.wood, r, 'h');
          strap(g, dir > 0 ? 2 : -14, -6, 12, 12, c.metal, false);
        }
        g.restore();
      };
      leaf(16, 1);
      leaf(w - 16, -1);
      for (const x of [9, w - 9]) {
        rr(g, x - 9, 41, 18, 18, 3);
        paint(g, litFill(g, x - 9, 41, 18, 18, shade(c.wood, -0.12), 0.3), INK, LW);
        rr(g, x - 6, 44, 12, 12, 2);
        paint(g, shade(c.wood, 0.1), alpha(INK, 0.5), 0.8);
      }
    },
  },
  {
    id: 'signpost', name: 'Signpost', cat: 'structure', sets: ['town', 'forest', 'farm', 'camp', 'winter', 'desert'], tags: ['sign', 'crossroads', 'directions', 'road', 'waypost'],
    w: 1, h: 1, blocksMovement: true, c: { wood: '#9a7448' }, variants: [{ name: 'Two arms', c: {}, f: { arms: 2 } }, { name: 'Three arms', c: {}, f: { arms: 3 } }, { name: 'Old and grey', c: { wood: '#8a8270' }, f: { arms: 2 } }, { name: 'Painted', c: { wood: '#b33c2e' }, f: { arms: 3 } }],
    desc: 'A crossroads signpost with pointing arms.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const n = f.arms || 2;
      const angs = n === 2 ? [-0.5, 2.5] : [-0.6, 1.4, 3.1];
      angs.forEach((a, i) => {
        g.save();
        g.translate(50, 50);
        g.rotate(a + (r() - 0.5) * 0.15);
        poly(g, [[4, -6], [34, -6], [42, 0], [34, 6], [4, 6]]);
        paint(g, litFill(g, 4, -6, 38, 12, shade(c.wood, i * 0.06), 0.25), INK, LW * 0.9);
        line(g, 10, -2, 30, -2, alpha(shade(c.wood, -0.6), 0.5), 0.9);
        line(g, 10, 2, 26, 2, alpha(shade(c.wood, -0.6), 0.5), 0.9);
        g.restore();
      });
      rr(g, 42, 42, 16, 16, 3);
      paint(g, litFill(g, 42, 42, 16, 16, shade(c.wood, -0.15), 0.3), INK, LW);
      poly(g, [[44, 44], [56, 44], [50, 50]]);
      paint(g, alpha('#ffffff', 0.15), null);
    },
  },
  {
    id: 'milestone', name: 'Milestone', cat: 'structure', sets: ['town', 'forest', 'farm', 'desert', 'winter'], tags: ['marker', 'road', 'boundary stone', 'stone'],
    w: 1, h: 1, blocksMovement: true, c: { rock: STONE.grey }, variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { rock: STONE.sand } }, { name: 'Marble', c: { rock: STONE.marble } }],
    desc: 'A carved roadside marker stone.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 5; i++) tuft(g, 20 + r() * 60, 66 + r() * 16, 10, '#5f8a3a', r);
      rr(g, 32, 26, 36, 46, 12);
      paint(g, litFill(g, 32, 26, 36, 46, c.rock, 0.3), INK, LW);
      rr(g, 37, 31, 26, 26, 9);
      paint(g, domeFill(g, 50, 40, 18, shade(c.rock, 0.08), 0.25), alpha(INK, 0.4), 1);
      for (let i = 0; i < 3; i++) line(g, 41, 38 + i * 7, 59 - r() * 6, 38 + i * 7, alpha(shade(c.rock, -0.6), 0.75), 1.4);
      speckle(g, 34, 28, 32, 42, r, 12, alpha(shade(c.rock, -0.4), 0.5), 1);
      void w; void h;
    },
  },
  {
    id: 'road-shrine', name: 'Roadside shrine', cat: 'religious', sets: ['town', 'forest', 'farm', 'winter'], tags: ['shrine', 'altar', 'offering', 'wayside', 'idol', 'candle'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 5, dim: 5, color: '#ffc46b' }, c: { roof: '#6b4a32', base: STONE.grey },
    variants: [{ name: 'Wooden', c: {} }, { name: 'Stone', c: { roof: '#6f6c66', base: STONE.dark } }, { name: 'Painted red', c: { roof: '#9b3b2c' } }],
    desc: 'A little roofed shrine with a candle and offerings.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 24, 22, 52, 44, 3);
      paint(g, litFill(g, 24, 22, 52, 44, c.base), INK, LW);
      roofTop(g, 18, 12, 64, 50, c.roof, 'v', 6, 3);
      // offerings in front
      for (let i = 0; i < 3; i++) {
        const x = 36 + i * 13, y = 78 + (i % 2) * 4;
        circle(g, x, y, 3.2);
        paint(g, ['#e85d75', '#f2d14b', '#d9cdb0'][i], INK, 0.7);
      }
      circle(g, 50, 70, 5);
      paint(g, domeFill(g, 50, 70, 5, '#efe4c8', 0.3), INK, 0.9);
      flame(g, 50, 70, 3, r);
    },
  },
  {
    id: 'standing-stone', name: 'Standing stone', cat: 'structure', sets: ['forest', 'farm', 'winter', 'swamp', 'desert'], tags: ['menhir', 'monolith', 'megalith', 'ritual', 'ancient', 'runes'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { rock: STONE.grey, rune: '#7fe3ff' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Dark', c: { rock: STONE.dark } }, { name: 'Mossy', c: { rock: STONE.green } }, { name: 'Glowing runes', c: { rock: STONE.dark }, f: { glow: 1 } }],
    desc: 'A tall ancient stone. Blocks sight. The runed version glows faintly.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      g.save();
      g.translate(50, 50);
      g.rotate((r() - 0.5) * 0.8);
      g.translate(-50, -50);
      stone(g, 50, 50, 34, c.rock, r, 26);
      const col = f.glow ? c.rune : alpha(shade(c.rock, -0.6), 0.8);
      if (f.glow) glow(g, 50, 50, 34, c.rune, 0.35);
      g.lineCap = 'round';
      g.strokeStyle = col;
      g.lineWidth = f.glow ? 2 : 1.4;
      for (let i = 0; i < 4; i++) {
        const x = 30 + i * 11;
        g.beginPath();
        g.moveTo(x, 44); g.lineTo(x + 3, 52); g.lineTo(x - 1, 58);
        g.stroke();
      }
      g.restore();
    },
  },
  {
    id: 'stone-circle', name: 'Stone circle', cat: 'structure', sets: ['forest', 'farm', 'winter', 'swamp'], tags: ['henge', 'ritual', 'druid', 'ancient', 'megalith', 'altar'],
    w: 4, h: 4, c: { rock: STONE.grey, grass: '#6a8a4a' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Mossy', c: { rock: STONE.green } }, { name: 'Ruined', c: {}, f: { ruin: 1 } }, { name: 'Sandstone', c: { rock: STONE.sand, grass: '#b8a26a' } }],
    desc: 'A ring of standing stones around a flat altar stone. Each stone blocks movement and sight.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      circle(g, cx, cy, 150);
      g.strokeStyle = alpha(shade(c.grass, -0.3), 0.35);
      g.lineWidth = 26;
      g.stroke();
      rr(g, cx - 34, cy - 22, 68, 44, 6);
      paint(g, litFill(g, cx - 34, cy - 22, 68, 44, c.rock, 0.25), INK, LW);
      blocks(g, cx - 30, cy - 18, 60, 36, shade(c.rock, 0.05), r, 30, 18);
      rr(g, cx - 34, cy - 22, 68, 44, 6);
      g.strokeStyle = INK; g.lineWidth = LW; g.stroke();
      const n = 9;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU - Math.PI / 2;
        const x = cx + Math.cos(a) * 150, y = cy + Math.sin(a) * 150;
        if (f.ruin && i % 3 === 1) { rocks(g, x, y, 16, 4, 5, 9, c.rock, r); continue; }
        if (f.ruin && i % 3 === 2) {
          g.save(); g.translate(x, y); g.rotate(a + 0.3); stone(g, 10, 0, 30, c.rock, r, 13); g.restore();
          continue;
        }
        g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2); stone(g, 0, 0, 24, shade(c.rock, (r() - 0.5) * 0.2), r, 15); g.restore();
      }
    },
  },
  {
    id: 'cairn', name: 'Cairn', cat: 'structure', sets: ['forest', 'winter', 'desert', 'cave', 'crypt'], tags: ['rock pile', 'grave', 'marker', 'barrow', 'stones'],
    w: 1, h: 1, blocksMovement: true, c: { rock: STONE.grey }, variants: [{ name: 'Grey', c: {} }, { name: 'Sandstone', c: { rock: STONE.sand } }, { name: 'Dark', c: { rock: STONE.dark } }, { name: 'Snowy', c: {}, f: { snow: 1 } }],
    desc: 'A heap of stacked stones marking a grave or a trail.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU + r() * 0.3; stone(g, 50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30, 11 + r() * 3, shade(c.rock, -0.12 + r() * 0.1), r); }
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + r(); stone(g, 50 + Math.cos(a) * 16, 50 + Math.sin(a) * 16, 10 + r() * 2, shade(c.rock, r() * 0.1), r); }
      stone(g, 50, 50, 12, shade(c.rock, 0.12), r);
      if (f.snow) for (let i = 0; i < 6; i++) { const x = 28 + r() * 36, y = 28 + r() * 36; blob(g, lumpy(x, y, 6 + r() * 4, 0.4, 7, r)); paint(g, alpha(SNOW, 0.95), alpha(INK, 0.3), 0.6); }
    },
  },
  {
    id: 'bridge-plank', name: 'Plank bridge', cat: 'structure', sets: ['forest', 'swamp', 'town', 'farm', 'cave'], tags: ['bridge', 'footbridge', 'crossing', 'river', 'stream'],
    w: 1, h: 3, layer: 'floor', c: { wood: '#9a744a' },
    variants: [{ name: 'Sound', c: {} }, { name: 'Dark wood', c: { wood: WOOD.walnut } }, { name: 'Rickety', c: { wood: '#8a7a62' }, f: { broken: 1 } }],
    desc: 'A short plank bridge with posts at each end. Lay it across a stream or chasm.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      for (const x of [12, w - 12]) board(g, x - 5, 8, 10, h - 16, shade(c.wood, -0.25), r, 'v');
      const n = 18, s = (h - 24) / n;
      for (let i = 0; i < n; i++) {
        if (f.broken && (i === 6 || i === 11 || (i === 12 && r() < 0.6))) continue;
        g.save();
        g.translate(w / 2, 12 + i * s + s / 2);
        g.rotate((r() - 0.5) * (f.broken ? 0.12 : 0.04));
        board(g, -40, -s / 2 + 0.6, 80, s - 1.2, shade(c.wood, (r() - 0.5) * 0.18), r, 'h', 1.2);
        g.restore();
      }
      for (const [x, y] of [[10, 8], [w - 10, 8], [10, h - 8], [w - 10, h - 8]]) { circle(g, x, y, 7); paint(g, domeFill(g, x, y, 7, shade(c.wood, -0.15), 0.35), INK, LW * 0.9); }
    },
  },
  {
    id: 'bridge-rope', name: 'Rope bridge', cat: 'structure', sets: ['forest', 'cave', 'mine', 'swamp'], tags: ['bridge', 'chasm', 'crossing', 'ravine', 'swaying'],
    w: 1, h: 4, layer: 'floor', c: { wood: '#9a7a52', rope: ROPE },
    variants: [{ name: 'Sound', c: {} }, { name: 'Frayed', c: { wood: '#7f705a', rope: '#a8987a' }, f: { broken: 1 } }, { name: 'Dark', c: { wood: '#5e4630', rope: '#8f7a58' } }],
    desc: 'A swaying bridge of planks hung on ropes. Squeezing or running may call for a check.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const n = 19, s = (h - 30) / n;
      for (let i = 0; i < n; i++) {
        if (f.broken && (i === 7 || i === 13)) continue;
        const sag = Math.sin((i / (n - 1)) * Math.PI) * 4;
        g.save();
        g.translate(w / 2, 15 + i * s + s / 2);
        g.rotate((r() - 0.5) * 0.12);
        board(g, -30 + sag, -s * 0.36, 60 - sag * 2, s * 0.72, shade(c.wood, (r() - 0.5) * 0.2), r, 'h', 1.2);
        g.restore();
      }
      for (const side of [-1, 1]) {
        g.beginPath();
        g.moveTo(w / 2 + side * 36, 10);
        g.quadraticCurveTo(w / 2 + side * 27, h / 2, w / 2 + side * 36, h - 10);
        inked(g, c.rope, 2.6, 1.8);
      }
      for (const [x, y] of [[14, 10], [w - 14, 10], [14, h - 10], [w - 14, h - 10]]) { circle(g, x, y, 7); paint(g, domeFill(g, x, y, 7, shade(c.wood, -0.15), 0.35), INK, LW * 0.9); }
    },
  },
  {
    id: 'well', name: 'Well', cat: 'structure', sets: ['town', 'farm', 'castle', 'desert', 'market'], tags: ['well', 'water', 'bucket', 'village square', 'windlass'],
    w: 2, h: 2, blocksMovement: true, c: { rock: STONE.grey, wood: '#7a5638', roof: '#6b4a32' },
    variants: [{ name: 'Stone', c: {} }, { name: 'Sandstone', c: { rock: STONE.sand } }, { name: 'Roofed', c: {}, f: { roof: 1 } }, { name: 'Dry and cracked', c: { rock: '#9a9182' }, f: { dry: 1 } }],
    desc: 'A stone well with a windlass and bucket.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      circle(g, cx, cy, 66);
      paint(g, domeFill(g, cx, cy, 66, c.rock, 0.2), INK, LW * 1.1);
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU + (i % 2) * 0.08;
        line(g, cx + Math.cos(a) * 46, cy + Math.sin(a) * 46, cx + Math.cos(a) * 66, cy + Math.sin(a) * 66, alpha(shade(c.rock, -0.6), 0.75), 1.1);
      }
      circle(g, cx, cy, 56);
      g.strokeStyle = alpha(shade(c.rock, -0.55), 0.6); g.lineWidth = 1; g.stroke();
      circle(g, cx, cy, 46);
      paint(g, '#0f1214', INK, 1.6);
      if (f.dry) { speckle(g, cx - 30, cy - 30, 60, 60, r, 18, '#3a3028', 2); }
      else liquid(g, cx, cy, 38, 38, '#1f3d4a', r);
      if (f.roof) { roofTop(g, 16, 30, w - 32, h - 60, c.roof, 'v', 8, 4); return; }
      for (const x of [cx - 60, cx + 60]) { rr(g, x - 8, cy - 8, 16, 16, 2); paint(g, litFill(g, x - 8, cy - 8, 16, 16, c.wood, 0.3), INK, LW); }
      board(g, cx - 54, cy - 5, 108, 10, c.wood, r, 'h', 3);
      for (let i = 0; i < 4; i++) line(g, cx - 14 + i * 5, cy - 5, cx - 14 + i * 5, cy + 5, alpha(ROPE, 0.95), 2);
      cord(g, [[cx + 68, cy], [cx + 78, cy], [cx + 78, cy + 14]], METAL.iron, 3, false, 1.6);
      line(g, cx - 4, cy + 5, cx - 4, cy + 22, ROPE, 1.6);
      circle(g, cx - 4, cy + 30, 10);
      paint(g, domeFill(g, cx - 4, cy + 30, 10, '#8a6a48', 0.3), INK, 1.4);
      circle(g, cx - 4, cy + 30, 6.5);
      paint(g, '#2a3a40', null);
    },
  },
  {
    id: 'wagon', name: 'Wagon', cat: 'vehicle', sets: ['town', 'camp', 'farm', 'market', 'desert'], tags: ['cart', 'wagon', 'caravan', 'travel', 'covered wagon'],
    w: 2, h: 3, blocksMovement: true, c: { wood: '#8a623c', metal: METAL.iron, canvas: CANVAS },
    variants: [{ name: 'Open', c: {} }, { name: 'Covered', c: {}, f: { cover: 1 } }, { name: 'Loaded', c: { wood: '#7a5638' }, f: { load: 1 } }, { name: 'Painted caravan', c: { wood: '#2f5d8a', canvas: '#b33c2e' }, f: { cover: 1 } }],
    desc: 'A four-wheeled wagon with its shaft forward (to the top).',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      // shaft
      board(g, w / 2 - 4, 6, 8, 70, shade(c.wood, -0.1), r, 'v');
      board(g, w / 2 - 34, 18, 68, 7, shade(c.wood, -0.1), r, 'h');
      for (const y of [110, 236]) for (const x of [26, w - 26]) wheelTop(g, x, y, 66, 13, shade(c.wood, -0.15), c.metal);
      rr(g, 36, 66, w - 72, 214, 4);
      paint(g, shade(c.wood, -0.35), INK, LW);
      planks(g, 44, 74, w - 88, 198, c.wood, r, 'v', 6);
      board(g, 36, 66, w - 72, 9, shade(c.wood, 0.05), r, 'h');
      board(g, 36, 271, w - 72, 9, shade(c.wood, 0.05), r, 'h');
      board(g, 36, 66, 9, 214, shade(c.wood, -0.05), r, 'v');
      board(g, w - 45, 66, 9, 214, shade(c.wood, -0.05), r, 'v');
      if (f.cover) {
        rr(g, 30, 74, w - 60, 196, 18);
        paint(g, c.canvas, INK, LW);
        g.save();
        rr(g, 30, 74, w - 60, 196, 18);
        g.clip();
        const gr = g.createLinearGradient(30, 0, w - 30, 0);
        gr.addColorStop(0, shade(c.canvas, 0.2)); gr.addColorStop(0.45, c.canvas); gr.addColorStop(1, shade(c.canvas, -0.35));
        g.fillStyle = gr; g.fillRect(30, 74, w - 60, 196);
        for (let i = 1; i < 6; i++) { const y = 74 + i * (196 / 6); line(g, 30, y, w - 30, y, alpha(shade(c.canvas, -0.55), 0.55), 3); }
        g.restore();
      }
      if (f.load) {
        crate(g, 52, 90, 44, '#b08a5a', r);
        crate(g, w - 98, 150, 42, '#a07a4a', r, 1);
        for (let i = 0; i < 3; i++) { const x = 70 + i * 18, y = 210 + (i % 2) * 14; blob(g, lumpy(x, y, 16, 0.25, 9, r, 13)); paint(g, domeFill(g, x, y, 16, '#cdb588', 0.3), INK, 1.4); }
        circle(g, w - 70, 225, 20); paint(g, domeFill(g, w - 70, 225, 20, '#8a5a32', 0.3), INK, LW);
        circle(g, w - 70, 225, 17); g.strokeStyle = METAL.iron; g.lineWidth = 2.5; g.stroke();
      }
    },
  },
  {
    id: 'handcart', name: 'Handcart', cat: 'vehicle', sets: ['town', 'farm', 'market', 'mine', 'camp'], tags: ['cart', 'barrow', 'pushcart', 'peddler'],
    w: 1, h: 2, blocksMovement: true, c: { wood: '#9a744a', metal: METAL.iron },
    variants: [{ name: 'Empty', c: {} }, { name: 'Sacks', c: {}, f: { load: 1 } }, { name: 'Produce', c: { wood: '#7a5638' }, f: { load: 2 } }],
    desc: 'A two-wheeled handcart, handles to the top.',
    draw: ({ g, w, c, f, seed }) => {
      const r = rng(seed);
      board(g, 26, 6, 6, 60, shade(c.wood, -0.1), r, 'v');
      board(g, w - 32, 6, 6, 60, shade(c.wood, -0.1), r, 'v');
      for (const x of [12, w - 12]) wheelTop(g, x, 128, 52, 10, shade(c.wood, -0.15), c.metal);
      rr(g, 20, 50, w - 40, 130, 3);
      paint(g, shade(c.wood, -0.35), INK, LW);
      planks(g, 25, 55, w - 50, 120, c.wood, r, 'v', 4);
      if (f.load === 1) for (let i = 0; i < 4; i++) { const x = 38 + (i % 2) * 24, y = 80 + Math.floor(i / 2) * 50; blob(g, lumpy(x, y, 15, 0.25, 9, r, 18)); paint(g, domeFill(g, x, y, 16, '#cdb588', 0.3), INK, 1.3); }
      if (f.load === 2) for (let i = 0; i < 16; i++) { const x = 32 + r() * 36, y = 64 + r() * 100, col = ['#c0392b', '#e0a32e', '#6a9a3a'][i % 3]; circle(g, x, y, 6); paint(g, domeFill(g, x, y, 6, col, 0.45), INK, 0.9); }
    },
  },
];

// ======================= SHIP AND DOCK =======================
const SHIP: ObjDef[] = [
  {
    id: 'ship-mast', name: 'Ship mast', cat: 'vehicle', sets: ['ship'], tags: ['mast', 'deck', 'rigging', 'pin rail', 'ship'],
    w: 1, h: 1, blocksMovement: true, c: { wood: '#8a623c', metal: METAL.iron },
    variants: [{ name: 'Oak', c: {} }, { name: 'Dark', c: { wood: WOOD.walnut } }, { name: 'Pale pine', c: { wood: WOOD.pine } }],
    desc: 'The foot of a mast with its pin rail and belaying pins.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      rr(g, 10, 10, 80, 80, 4);
      g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
      g.strokeStyle = shade(c.wood, -0.05); g.lineWidth = 8; g.stroke();
      for (let i = 0; i < 4; i++) {
        const t = 0.2 + i * 0.2;
        for (const [x, y] of [[10 + 80 * t, 10], [10 + 80 * t, 90], [10, 10 + 80 * t], [90, 10 + 80 * t]]) { circle(g, x, y, 2.6); paint(g, shade(c.wood, 0.3), INK, 0.9); }
      }
      coil(g, 24, 76, 9, ROPE, 2, 2.4);
      coil(g, 78, 24, 9, ROPE, 2, 2.4);
      circle(g, 50, 50, 21);
      paint(g, domeFill(g, 50, 50, 21, c.wood, 0.35), INK, LW * 1.1);
      for (const k of [17, 13]) { circle(g, 50, 50, k); g.strokeStyle = alpha(shade(c.wood, -0.5), 0.5); g.lineWidth = 0.8; g.stroke(); }
      circle(g, 50, 50, 21);
      g.strokeStyle = c.metal; g.lineWidth = 2.5; g.stroke();
      void r;
    },
  },
  {
    id: 'crows-nest', name: "Crow's nest", cat: 'vehicle', sets: ['ship'], tags: ['lookout', 'mast', 'platform', 'top', 'ship'],
    w: 1, h: 1, layer: 'overhead', c: { wood: '#8a623c' }, variants: [{ name: 'Oak', c: {} }, { name: 'Dark', c: { wood: WOOD.walnut } }],
    desc: 'The lookout platform high on the mast. Overhead: tokens below show under it.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      for (const [x, y] of [[4, 4], [96, 4], [4, 96], [96, 96]]) line(g, 50, 50, x, y, alpha(ROPE, 0.9), 1.4);
      circle(g, 50, 50, 40);
      paint(g, shade(c.wood, -0.3), INK, LW);
      g.save(); circle(g, 50, 50, 34); g.clip(); planks(g, 14, 14, 72, 72, c.wood, r, 'h', 6); g.restore();
      circle(g, 50, 50, 37);
      g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
      g.strokeStyle = shade(c.wood, 0.1); g.lineWidth = 5; g.stroke();
      circle(g, 50, 50, 10);
      paint(g, domeFill(g, 50, 50, 10, c.wood, 0.35), INK, LW);
    },
  },
  {
    id: 'ship-wheel', name: "Ship's wheel", cat: 'vehicle', sets: ['ship'], tags: ['helm', 'wheel', 'steering', 'deck', 'captain'],
    w: 1, h: 1, blocksMovement: true, c: { wood: '#8a623c', metal: METAL.brass }, variants: [{ name: 'Oak and brass', c: {} }, { name: 'Dark and iron', c: { wood: WOOD.walnut, metal: METAL.iron } }, { name: 'Gilded', c: { wood: '#6b2f24', metal: METAL.gold } }],
    desc: 'The helm. Whoever stands here steers the ship.',
    draw: ({ g, c }) => {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        cord(g, [[50 + Math.cos(a) * 8, 50 + Math.sin(a) * 8], [50 + Math.cos(a) * 40, 50 + Math.sin(a) * 40]], c.wood, 3.4, false, 2);
        circle(g, 50 + Math.cos(a) * 42, 50 + Math.sin(a) * 42, 4.2);
        paint(g, domeFill(g, 50 + Math.cos(a) * 42, 50 + Math.sin(a) * 42, 4.2, c.wood, 0.4), INK, 1.2);
      }
      circle(g, 50, 50, 30);
      inked(g, c.wood, 5, 2.4);
      circle(g, 50, 50, 22);
      g.strokeStyle = alpha(c.metal, 0.9); g.lineWidth = 1.6; g.stroke();
      circle(g, 50, 50, 9);
      paint(g, domeFill(g, 50, 50, 9, c.metal, 0.5), INK, 1.4);
    },
  },
  {
    id: 'cannon', name: 'Cannon', cat: 'vehicle', sets: ['ship', 'castle'], tags: ['cannon', 'gun', 'artillery', 'siege', 'pirate', 'broadside'],
    w: 1, h: 2, blocksMovement: true, c: { metal: '#3c4044', wood: '#7a5638' },
    variants: [{ name: 'Iron', c: {} }, { name: 'Bronze', c: { metal: METAL.bronze } }, { name: 'Black and red', c: { metal: '#26282b', wood: '#7a2a22' } }],
    desc: 'A deck cannon on a wheeled carriage, muzzle to the top.',
    draw: ({ g, w, c, seed }) => {
      const r = rng(seed);
      for (const y of [110, 172]) for (const x of [14, w - 14]) wheelTop(g, x, y, 34, 11, shade(c.wood, -0.2), METAL.iron);
      rr(g, 22, 92, w - 44, 98, 4);
      paint(g, shade(c.wood, -0.35), INK, LW);
      planks(g, 25, 95, w - 50, 92, c.wood, r, 'v', 3);
      rr(g, 16, 116, w - 32, 10, 3);
      paint(g, litFill(g, 16, 116, w - 32, 10, c.metal, 0.4), INK, 1.4);
      poly(g, [[39, 12], [61, 12], [67, 160], [33, 160]]);
      const gr = g.createLinearGradient(33, 0, 67, 0);
      gr.addColorStop(0, shade(c.metal, 0.35)); gr.addColorStop(0.35, shade(c.metal, 0.12)); gr.addColorStop(1, shade(c.metal, -0.45));
      paint(g, gr, INK, LW);
      for (const y of [24, 90, 140]) { rr(g, 34 + (y - 12) * 0.035, y - 3, 32 - (y - 12) * 0.07 + 4, 7, 2); paint(g, litFill(g, 30, y - 3, 40, 7, shade(c.metal, 0.1), 0.4), INK, 1.2); }
      rr(g, 36, 6, 28, 10, 3);
      paint(g, litFill(g, 36, 6, 28, 10, c.metal, 0.4), INK, 1.4);
      ellipse(g, 50, 10, 8, 3.4);
      paint(g, '#0b0b0c', null);
      circle(g, 50, 168, 8);
      paint(g, domeFill(g, 50, 168, 8, c.metal, 0.5), INK, 1.4);
    },
  },
  {
    id: 'anchor', name: 'Anchor', cat: 'vehicle', sets: ['ship', 'town'], tags: ['anchor', 'dock', 'harbour', 'iron', 'chain'],
    w: 1, h: 1, c: { metal: '#4e5358' }, variants: [{ name: 'Iron', c: {} }, { name: 'Rusted', c: { metal: METAL.rust } }, { name: 'Bronze', c: { metal: METAL.bronze } }],
    desc: 'A heavy ship\'s anchor lying on deck or dock.',
    draw: ({ g, c }) => {
      g.save();
      g.translate(50, 50);
      g.rotate(-0.6);
      cord(g, [[-6, -34], [-26, -38], [-40, -30]], ROPE, 3, true, 1.8);
      cord(g, [[0, -30], [0, 30]], c.metal, 6, false, 2.4);
      cord(g, [[-22, -24], [22, -24]], shade(c.metal, -0.1), 5, false, 2.4);
      g.beginPath();
      g.moveTo(-28, 12);
      g.quadraticCurveTo(0, 46, 28, 12);
      inked(g, c.metal, 6, 2.4);
      for (const s of [-1, 1]) { poly(g, [[s * 28, 12], [s * 36, 4], [s * 33, 20]]); paint(g, litFill(g, -40, 0, 80, 20, c.metal, 0.35), INK, 1.4); }
      circle(g, 0, -36, 6.5);
      inked(g, c.metal, 3, 2);
      g.restore();
    },
  },
  {
    id: 'rope-coil', name: 'Coil of rope', cat: 'vehicle', sets: ['ship', 'mine', 'camp', 'town'], tags: ['rope', 'line', 'coil', 'hemp', 'climbing'],
    w: 1, h: 1, c: { rope: ROPE }, variants: [{ name: 'Hemp', c: {} }, { name: 'Tarred', c: { rope: '#5a4a38' } }, { name: 'Red', c: { rope: '#a3463a' } }],
    desc: 'A neat coil of rope, fifty feet or so.',
    draw: ({ g, c }) => {
      coil(g, 48, 50, 36, c.rope, 4, 5.4);
      cord(g, [[84, 50], [90, 70], [80, 90]], c.rope, 5.4, true, 1.8);
    },
  },
  {
    id: 'cargo-crates', name: 'Cargo crates', cat: 'storage', sets: ['ship', 'town', 'market', 'mine'], tags: ['crate', 'cargo', 'boxes', 'freight', 'dock', 'supplies'],
    w: 2, h: 1, blocksMovement: true, c: { wood: '#b08a5a' }, variants: [{ name: 'Pine', c: {} }, { name: 'Dark', c: { wood: '#7a5638' } }, { name: 'Stamped', c: { wood: '#a88454' }, f: { mark: 1 } }],
    desc: 'Crates lashed together with rope.',
    draw: ({ g, w, c, f, seed }) => {
      const r = rng(seed);
      crate(g, 6, 18, 60, shade(c.wood, 0.04), r, f.mark);
      crate(g, 72, 8, 50, shade(c.wood, -0.08), r);
      crate(g, 128, 22, 64, c.wood, r, f.mark);
      line(g, 4, 50, w - 4, 52, alpha(INK, 0.7), 4);
      line(g, 4, 50, w - 4, 52, ROPE, 2.4);
    },
  },
  {
    id: 'sails-pile', name: 'Furled sails', cat: 'vehicle', sets: ['ship', 'town'], tags: ['sail', 'canvas', 'cloth', 'repair', 'pile'],
    w: 2, h: 1, c: { canvas: '#e6dcc4' }, variants: [{ name: 'Canvas', c: {} }, { name: 'Red', c: { canvas: '#a84a3a' } }, { name: 'Black', c: { canvas: '#3a3a3e' } }, { name: 'Patched', c: { canvas: '#d2c4a2' }, f: { patch: 1 } }],
    desc: 'Heaped sailcloth waiting for repair or rigging.',
    draw: ({ g, w, c, f, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(w / 2, 50, 88, 0.18, 14, r, 38));
      paint(g, domeFill(g, w / 2, 50, 88, c.canvas, 0.25), INK, LW);
      g.save();
      blob(g, lumpy(w / 2, 50, 86, 0.0, 14, r, 36));
      g.clip();
      for (let i = 0; i < 9; i++) {
        const x = 20 + i * 20 + r() * 6;
        g.beginPath();
        g.moveTo(x, 6);
        g.bezierCurveTo(x + 14, 30, x - 12, 60, x + 8, 96);
        g.strokeStyle = alpha(shade(c.canvas, -0.5), 0.45); g.lineWidth = 2.2; g.stroke();
        g.strokeStyle = alpha('#ffffff', 0.18); g.lineWidth = 1.2;
        g.translate(4, 0); g.stroke(); g.translate(-4, 0);
      }
      if (f.patch) for (let i = 0; i < 3; i++) { rr(g, 30 + r() * 120, 26 + r() * 40, 16, 13, 1); paint(g, shade(c.canvas, -0.18), alpha(INK, 0.6), 0.9); }
      g.restore();
      for (const x of [60, 140]) { line(g, x, 14, x + 4, 86, alpha(INK, 0.7), 4.2); line(g, x, 14, x + 4, 86, ROPE, 2.4); }
    },
  },
  {
    id: 'cargo-hatch', name: 'Cargo hatch', cat: 'vehicle', sets: ['ship', 'sewer', 'town'], tags: ['hatch', 'grate', 'hold', 'trapdoor', 'deck'],
    w: 1, h: 1, layer: 'floor', c: { wood: '#8a623c' }, variants: [{ name: 'Wood grating', c: {} }, { name: 'Iron grate', c: { wood: '#4e5358' } }, { name: 'Open hold', c: {}, f: { open: 1 } }],
    desc: 'A deck grating over the cargo hold.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 8, 8, 84, 84, 3);
      paint(g, '#120d0a', INK, LW);
      if (!f.open) {
        for (let i = 0; i < 6; i++) { const t = 16 + i * 13.6; board(g, t - 2.5, 14, 5, 72, c.wood, r, 'v', 1); board(g, 14, t - 2.5, 72, 5, shade(c.wood, 0.06), r, 'h', 1); }
      } else { line(g, 30, 30, 30, 92, alpha(ROPE, 0.8), 2); for (let y = 36; y < 92; y += 12) line(g, 26, y, 40, y, '#7a5638', 2.4); }
      board(g, 4, 4, 92, 9, c.wood, r, 'h'); board(g, 4, 87, 92, 9, c.wood, r, 'h');
      board(g, 4, 4, 9, 92, shade(c.wood, -0.08), r, 'v'); board(g, 87, 4, 9, 92, shade(c.wood, -0.08), r, 'v');
    },
  },
  {
    id: 'gangplank', name: 'Gangplank', cat: 'vehicle', sets: ['ship', 'town'], tags: ['plank', 'boarding', 'ramp', 'dock', 'walk the plank'],
    w: 1, h: 2, layer: 'floor', c: { wood: '#9a744a' }, variants: [{ name: 'Oak', c: {} }, { name: 'Weathered', c: { wood: '#8a8270' } }, { name: 'Dark', c: { wood: WOOD.walnut } }],
    desc: 'A boarding plank with foot cleats and rope rails.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      planks(g, 22, 6, w - 44, h - 12, c.wood, r, 'v', 3);
      for (let y = 22; y < h - 10; y += 22) board(g, 24, y, w - 48, 5, shade(c.wood, -0.18), r, 'h', 1);
      for (const x of [14, w - 14]) { line(g, x, 4, x, h - 4, alpha(INK, 0.7), 3.6); line(g, x, 4, x, h - 4, ROPE, 2); }
    },
  },
  {
    id: 'dock-pier', name: 'Dock section', cat: 'structure', sets: ['ship', 'town', 'swamp'], tags: ['dock', 'pier', 'jetty', 'wharf', 'boardwalk', 'harbour'],
    w: 1, h: 2, layer: 'floor', c: { wood: '#8a6e4c' }, variants: [{ name: 'Weathered', c: {} }, { name: 'Dark', c: { wood: '#5e4630' } }, { name: 'Mossy', c: { wood: '#7a6a4a' }, f: { moss: 1 } }],
    desc: 'A section of pier on round pilings. Chain several to build a dock.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      const n = 13, s = (h - 4) / n;
      for (let i = 0; i < n; i++) board(g, 4 + (r() - 0.5) * 2, 2 + i * s, w - 8, s - 0.6, shade(c.wood, (r() - 0.5) * 0.2), r, 'h', 1);
      for (let i = 0; i < n; i++) for (const x of [12, w - 12]) { circle(g, x, 2 + i * s + s / 2, 1); paint(g, '#2a2420', null); }
      if (f.moss) speckle(g, 6, 6, w - 12, h - 12, r, 30, alpha('#6d8a3a', 0.6), 2.2);
      for (const [x, y] of [[8, 8], [w - 8, 8], [8, h / 2], [w - 8, h / 2], [8, h - 8], [w - 8, h - 8]]) { circle(g, x, y, 7.5); paint(g, domeFill(g, x, y, 7.5, shade(c.wood, -0.2), 0.35), INK, LW * 0.9); }
    },
  },
  {
    id: 'mooring-post', name: 'Mooring post', cat: 'structure', sets: ['ship', 'town', 'swamp'], tags: ['bollard', 'piling', 'dock', 'rope', 'mooring'],
    w: 1, h: 1, blocksMovement: true, c: { wood: '#6e5238' }, variants: [{ name: 'Wooden piling', c: {} }, { name: 'Iron bollard', c: { wood: '#3c4044' } }, { name: 'Bare', c: {}, f: { bare: 1 } }],
    desc: 'A stout post for tying up boats.',
    draw: ({ g, c, f }) => {
      if (!f.bare) cord(g, [[64, 58], [80, 72], [90, 94]], ROPE, 4.4, true, 1.8);
      circle(g, 50, 50, 24);
      paint(g, domeFill(g, 50, 50, 24, c.wood, 0.35), INK, LW * 1.1);
      for (const k of [17, 10]) { circle(g, 50, 50, k); g.strokeStyle = alpha(shade(c.wood, -0.5), 0.5); g.lineWidth = 0.9; g.stroke(); }
      if (!f.bare) { circle(g, 50, 50, 27); inked(g, ROPE, 4.2, 1.8); circle(g, 50, 50, 31); inked(g, shade(ROPE, -0.08), 3.6, 1.6); }
    },
  },
  {
    id: 'rowboat', name: 'Rowboat', cat: 'vehicle', sets: ['ship', 'swamp', 'town', 'forest'], tags: ['boat', 'dinghy', 'skiff', 'oars', 'lake', 'river'],
    w: 1, h: 2, c: { wood: '#8a623c', paint: '#2f5d8a' },
    variants: [{ name: 'Blue', c: {} }, { name: 'Red', c: { paint: '#9b3b2c' } }, { name: 'Bare wood', c: { paint: '#6b4a2e' } }, { name: 'White', c: { paint: '#e3ddd0' } }],
    desc: 'A small rowboat for two or three, bow to the top.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      hull(g, w / 2, 6, h - 8, 38, 1);
      paint(g, litFill(g, 10, 6, 80, h, c.paint, 0.25), INK, LW * 1.1);
      hull(g, w / 2, 6, h - 8, 38, 1, 0.82);
      paint(g, shade(c.wood, -0.1), INK, 1.4);
      g.save();
      hull(g, w / 2, 6, h - 8, 38, 1, 0.82);
      g.clip();
      for (let i = 0; i < 6; i++) { const x = 20 + i * 12; line(g, x, 0, x, h, alpha(shade(c.wood, -0.5), 0.55), 1); }
      g.restore();
      for (const y of [74, 124, 168]) board(g, 16, y, w - 32, 10, shade(c.wood, 0.1), r, 'h', 1.5);
      oar(g, 36, 30, 30, 150, '#b08a5a', 7);
      oar(g, 64, 30, 70, 150, '#b08a5a', 7);
    },
  },
  {
    id: 'canoe', name: 'Canoe', cat: 'vehicle', sets: ['swamp', 'forest', 'ship', 'camp'], tags: ['boat', 'canoe', 'kayak', 'dugout', 'river', 'paddle'],
    w: 1, h: 2, c: { wood: '#a8794a', bark: '#a8794a' },
    variants: [{ name: 'Wood', c: {} }, { name: 'Birch bark', c: { bark: '#e2dccd', wood: '#c9a26b' }, f: { birch: 1 } }, { name: 'Dugout', c: { bark: '#6b4a2e', wood: '#8a623c' } }],
    desc: 'A narrow canoe for one or two, with a paddle.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      hull(g, w / 2, 4, h - 4, 27, 2);
      paint(g, litFill(g, 20, 4, 60, h, c.bark, 0.25), INK, LW * 1.1);
      if (f.birch) { g.save(); hull(g, w / 2, 4, h - 4, 27, 2); g.clip(); for (let i = 0; i < 14; i++) { rr(g, 22 + r() * 50, 10 + r() * (h - 20), 7, 2, 1); paint(g, '#2b2622', null); } g.restore(); }
      hull(g, w / 2, 4, h - 4, 27, 2, 0.8);
      paint(g, shade(c.wood, -0.18), INK, 1.4);
      for (const y of [70, 130]) board(g, 28, y, w - 56, 7, shade(c.wood, 0.1), r, 'h', 1.5);
      oar(g, 46, 46, 56, 150, '#c9a26b', 8);
    },
  },
  {
    id: 'fishing-net', name: 'Fishing net', cat: 'decor', sets: ['ship', 'town', 'swamp'], tags: ['net', 'fishing', 'trap', 'dock', 'floats'],
    w: 2, h: 2, layer: 'floor', flat: true, c: { rope: '#b8a882', float: '#d9822b' }, variants: [{ name: 'Hemp', c: {} }, { name: 'Dark', c: { rope: '#6e6250', float: '#c9b48a' } }, { name: 'Green', c: { rope: '#7a8a62', float: '#c0392b' } }],
    desc: 'A net spread out to dry. Could also hide a snare (mark it GM-only by layering a trap).',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const pts = lumpy(w / 2, h / 2, 82, 0.28, 12, r);
      g.save();
      blob(g, pts);
      g.clip();
      g.translate(w / 2, h / 2);
      g.rotate(0.35);
      g.strokeStyle = alpha(INK, 0.45);
      g.lineWidth = 2.2;
      for (let pass = 0; pass < 2; pass++) {
        for (let k = -100; k <= 100; k += 11) {
          g.beginPath(); g.moveTo(k, -110); g.quadraticCurveTo(k + 6, 0, k, 110); g.stroke();
          g.beginPath(); g.moveTo(-110, k); g.quadraticCurveTo(0, k + 6, 110, k); g.stroke();
        }
        g.strokeStyle = c.rope;
        g.lineWidth = 1;
      }
      g.restore();
      blob(g, pts);
      inked(g, c.rope, 2.8, 1.8);
      for (let i = 0; i < 12; i += 1) {
        const [x, y] = pts[i];
        ellipse(g, x, y, 5, 3.4, r() * 3);
        paint(g, domeFill(g, x, y, 5, c.float, 0.4), INK, 1);
      }
    },
  },
  {
    id: 'fishing-gear', name: 'Fishing gear', cat: 'decor', sets: ['ship', 'camp', 'town', 'swamp'], tags: ['fishing', 'rod', 'creel', 'basket', 'fish', 'catch'],
    w: 1, h: 1, c: { wicker: '#b8925a', fish: '#a9b8c2' }, variants: [{ name: 'With catch', c: {}, f: { fish: 1 } }, { name: 'Empty creel', c: {} }, { name: 'Golden catch', c: { fish: '#d9a63a' }, f: { fish: 1 } }],
    desc: 'A rod, a wicker creel and the day\'s catch.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      cord(g, [[8, 88], [90, 14]], '#8a623c', 2.6, false, 1.6);
      circle(g, 26, 72, 5); paint(g, domeFill(g, 26, 72, 5, METAL.iron, 0.4), INK, 1);
      g.beginPath(); g.moveTo(90, 14); g.quadraticCurveTo(96, 40, 84, 56); g.strokeStyle = alpha('#f0f0f0', 0.8); g.lineWidth = 0.8; g.stroke();
      rr(g, 16, 22, 40, 32, 7);
      paint(g, litFill(g, 16, 22, 40, 32, c.wicker, 0.25), INK, LW);
      g.save(); rr(g, 16, 22, 40, 32, 7); g.clip();
      for (let y = 26; y < 54; y += 5) line(g, 16, y, 56, y, alpha(shade(c.wicker, -0.5), 0.55), 1);
      for (let x = 20; x < 56; x += 7) line(g, x, 22, x, 54, alpha(shade(c.wicker, 0.3), 0.45), 1);
      g.restore();
      line(g, 20, 38, 52, 38, '#6b4a2b', 2.2);
      if (f.fish) for (let i = 0; i < 2; i++) {
        const x = 58 + i * 8, y = 70 + i * 12;
        g.save(); g.translate(x, y); g.rotate(-0.3 + r() * 0.3);
        ellipse(g, 0, 0, 13, 5); paint(g, litFill(g, -13, -5, 26, 10, c.fish, 0.4), INK, 1.1);
        poly(g, [[12, 0], [20, -5], [20, 5]]); paint(g, shade(c.fish, -0.1), INK, 1);
        circle(g, -8, -1, 1.2); paint(g, '#111', null);
        g.restore();
      }
    },
  },
];

/** A round tent from above: panels around a centre pole, lit from the top-left. */
function roundTent(g: G, cx: number, cy: number, R: number, base: string, trim: string, rand: Rand, seg = 10, valance = 0) {
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * TAU + 0.3;
    guy(g, cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92, cx + Math.cos(a) * (R + 14), cy + Math.sin(a) * (R + 14));
  }
  circle(g, cx, cy, R);
  paint(g, base, INK, LW * 1.1);
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * TAU, a1 = ((i + 1) / seg) * TAU, am = (a0 + a1) / 2;
    const lit = Math.cos(am - (-2.36)) * 0.18; // brighter facing top-left
    g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0, a1); g.closePath();
    g.fillStyle = shade(base, lit + (i % 2 ? -0.04 : 0.02));
    g.fill();
    line(g, cx, cy, cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, alpha(shade(base, -0.55), 0.6), 1.1);
  }
  if (valance) {
    for (let i = 0; i < seg * 2; i++) {
      const a = ((i + 0.5) / (seg * 2)) * TAU;
      circle(g, cx + Math.cos(a) * R * 0.94, cy + Math.sin(a) * R * 0.94, R * 0.07);
      paint(g, trim, alpha(INK, 0.6), 0.8);
    }
  }
  // door flap at the bottom
  g.beginPath(); g.moveTo(cx, cy + R * 0.45); g.lineTo(cx - R * 0.2, cy + R); g.lineTo(cx + R * 0.2, cy + R); g.closePath();
  paint(g, shade(base, -0.35), INK, 1.4);
  circle(g, cx, cy, R);
  g.strokeStyle = INK; g.lineWidth = LW * 1.1; g.stroke();
  circle(g, cx, cy, R * 0.12);
  paint(g, domeFill(g, cx, cy, R * 0.12, trim, 0.4), INK, 1.4);
  void rand;
}

// ======================= CAMP =======================
const CAMP: ObjDef[] = [
  {
    id: 'campfire', name: 'Campfire', cat: 'light', sets: ['camp', 'forest', 'cave', 'desert', 'winter', 'swamp'], tags: ['fire', 'campfire', 'light', 'warmth', 'cooking', 'bonfire'],
    w: 1, h: 1, light: { bright: 20, dim: 20, color: '#ff9a40' }, c: { rock: STONE.grey, fire: '#ffb02e' },
    variants: [{ name: 'Burning', c: {} }, { name: 'Embers', c: {}, f: { out: 1 } }, { name: 'Sandstone ring', c: { rock: STONE.sand } }, { name: 'Witch-fire', c: { fire: '#59e08a' } }],
    desc: 'A stone-ringed campfire. Bright light 20 ft, dim 20 ft more.',
    draw: ({ g, c, f, seed }) => fireRing(g, 50, 50, 32, rng(seed), !f.out, c.rock, c.fire),
  },
  {
    id: 'campfire-spit', name: 'Campfire with spit', cat: 'light', sets: ['camp', 'forest', 'tavern', 'farm'], tags: ['fire', 'roast', 'spit', 'cooking', 'meat', 'boar'],
    w: 1, h: 1, light: { bright: 20, dim: 20, color: '#ff9a40' }, c: { rock: STONE.grey, meat: '#9a5a32' },
    variants: [{ name: 'Roasting meat', c: {} }, { name: 'Fish', c: { meat: '#b8a48a' }, f: { fish: 1 } }, { name: 'Empty spit', c: {}, f: { empty: 1 } }],
    desc: 'A fire with a roasting spit across it.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      fireRing(g, 50, 52, 30, r);
      for (const x of [9, 91]) { circle(g, x, 50, 5); paint(g, domeFill(g, x, 50, 5, '#6b4428', 0.35), INK, 1.4); }
      cord(g, [[6, 50], [94, 50]], '#5a4030', 2.4, false, 1.8);
      if (!f.empty) {
        if (f.fish) for (const y of [44, 56]) { ellipse(g, 50, y, 16, 5); paint(g, litFill(g, 34, y - 5, 32, 10, c.meat, 0.4), INK, 1.1); }
        else {
          ellipse(g, 50, 50, 20, 12);
          paint(g, domeFill(g, 50, 50, 20, c.meat, 0.45), INK, LW);
          for (let i = 0; i < 3; i++) line(g, 40 + i * 9, 42, 38 + i * 9, 58, alpha(shade(c.meat, -0.5), 0.5), 1.4);
        }
        cord(g, [[82, 50], [86, 40]], '#5a4030', 2, false, 1.4);
      }
    },
  },
  {
    id: 'cooking-pot-fire', name: 'Cooking pot over fire', cat: 'light', sets: ['camp', 'forest', 'swamp', 'farm', 'winter'], tags: ['cauldron', 'pot', 'stew', 'tripod', 'cooking', 'fire', 'witch'],
    w: 1, h: 1, light: { bright: 15, dim: 15, color: '#ff9a40' }, c: { metal: '#33373c', stew: '#8a5a2e' },
    variants: [{ name: 'Stew', c: {} }, { name: 'Bubbling green brew', c: { stew: '#5fae3a' } }, { name: 'Boiling water', c: { stew: '#5f8fa8' } }],
    desc: 'An iron pot on a tripod over a small fire.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      fireRing(g, 50, 50, 30, r);
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i / 3) * TAU; cord(g, [[50 + Math.cos(a) * 44, 50 + Math.sin(a) * 44], [50, 50]], '#5a4030', 2.6, false, 1.6); }
      circle(g, 50, 50, 21);
      paint(g, domeFill(g, 50, 50, 21, c.metal, 0.4), INK, LW);
      liquid(g, 50, 50, 16, 16, c.stew, r);
      for (let i = 0; i < 4; i++) { const x = 44 + r() * 12, y = 44 + r() * 12; circle(g, x, y, 1.8 + r()); g.strokeStyle = alpha('#ffffff', 0.5); g.lineWidth = 0.8; g.stroke(); }
      cord(g, [[56, 48], [76, 30]], '#8a623c', 2.2, false, 1.4);
    },
  },
  {
    id: 'tent', name: 'Tent', cat: 'structure', sets: ['camp', 'forest', 'desert', 'winter', 'market'], tags: ['tent', 'camp', 'shelter', 'a-frame', 'canvas'],
    w: 2, h: 2, blocksSight: true, c: { canvas: CANVAS },
    variants: [{ name: 'Canvas', c: {} }, { name: 'Green', c: { canvas: '#5f7a4a' } }, { name: 'Red', c: { canvas: '#a3463a' } }, { name: 'Blue', c: { canvas: '#3f6a92' } }, { name: 'Hide', c: { canvas: '#9a7a5a' } }],
    desc: 'A two-person ridge tent, door at the bottom edge. Blocks sight.',
    draw: ({ g, w, c, seed }) => {
      const r = rng(seed);
      for (const [x1, y1, x2, y2] of [[46, 30, 14, 14], [154, 30, 186, 14], [46, 170, 14, 186], [154, 170, 186, 186], [100, 26, 100, 6], [100, 174, 100, 194]]) guy(g, x1, y1, x2, y2);
      roofTop(g, 42, 26, w - 84, 148, c.canvas, 'v', 0, 4);
      for (let i = 1; i < 4; i++) { const y = 26 + i * 37; line(g, 44, y, w - 44, y, alpha(shade(c.canvas, -0.5), 0.35), 1); }
      poly(g, [[100, 140], [80, 174], [120, 174]]);
      paint(g, shade(c.canvas, -0.4), INK, 1.4);
      poly(g, [[100, 140], [100, 174], [120, 174]]);
      paint(g, alpha('#000000', 0.25), null);
      speckle(g, 46, 30, w - 92, 140, r, 14, alpha(shade(c.canvas, -0.4), 0.35), 1.6);
    },
  },
  {
    id: 'tent-round', name: 'Round tent', cat: 'structure', sets: ['camp', 'desert', 'winter', 'forest', 'market'], tags: ['tent', 'yurt', 'teepee', 'shelter', 'conical'],
    w: 2, h: 2, blocksSight: true, c: { canvas: '#cbb994', trim: '#8a623c' },
    variants: [{ name: 'Canvas', c: {} }, { name: 'Hide teepee', c: { canvas: '#a8845a', trim: '#5a3b24' } }, { name: 'Felt yurt', c: { canvas: '#d9d0bc', trim: '#a3312c' } }, { name: 'Dark', c: { canvas: '#4e4a44', trim: '#9a7a4a' } }],
    desc: 'A conical tent on a centre pole, door at the bottom.',
    draw: ({ g, w, h, c, seed }) => roundTent(g, w / 2, h / 2, 76, c.canvas, c.trim, rng(seed), 10),
  },
  {
    id: 'tent-bell', name: 'Bell tent', cat: 'structure', sets: ['camp', 'castle', 'market', 'desert'], tags: ['tent', 'pavilion', 'bell tent', 'tournament', 'fair', 'circus'],
    w: 3, h: 3, blocksSight: true, c: { canvas: '#e6dcc4', trim: '#a3312c' },
    variants: [{ name: 'White and red', c: {} }, { name: 'Blue and gold', c: { canvas: '#3f6a92', trim: CLOTH.gold } }, { name: 'Green and white', c: { canvas: '#4a7a4a', trim: '#e6e0d2' } }, { name: 'Purple and gold', c: { canvas: '#5d3a78', trim: CLOTH.gold } }],
    desc: 'A large round pavilion with a scalloped trim. Sleeps a party.',
    draw: ({ g, w, h, c, seed }) => roundTent(g, w / 2, h / 2, 118, c.canvas, c.trim, rng(seed), 14, 1),
  },
  {
    id: 'tent-command', name: 'Command tent', cat: 'structure', sets: ['camp', 'castle', 'market'], tags: ['tent', 'pavilion', 'war tent', 'headquarters', 'army', 'striped'],
    w: 3, h: 3, blocksSight: true, c: { canvas: '#e6dcc4', stripe: '#a3312c', flag: '#a3312c' },
    variants: [{ name: 'Red stripes', c: {} }, { name: 'Blue stripes', c: { stripe: '#2f5d8a', flag: '#2f5d8a' } }, { name: 'Black and gold', c: { canvas: '#2b2b30', stripe: '#c99a2e', flag: '#c99a2e' } }, { name: 'Plain green', c: { canvas: '#5f7a4a', stripe: '#4c6438', flag: '#e6e0d2' } }],
    desc: 'A big striped pavilion for a war council. Door at the bottom edge.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const x = 34, y = 50, W = w - 68, H = h - 100;
      for (const [x1, y1, x2, y2] of [[x + 6, y + 6, 8, 20], [x + W - 6, y + 6, w - 8, 20], [x + 6, y + H - 6, 8, h - 20], [x + W - 6, y + H - 6, w - 8, h - 20], [x + W / 2, y, x + W / 2 - 30, 8], [x + W / 2, y + H, x + W / 2 + 30, h - 8], [x, y + H / 2, 6, y + H / 2], [x + W, y + H / 2, w - 6, y + H / 2]]) guy(g, x1, y1, x2, y2);
      roofTop(g, x, y, W, H, c.canvas, 'h', 0, 6);
      g.save();
      rr(g, x, y, W, H, 6);
      g.clip();
      for (let i = 0; i < 8; i += 2) {
        const sx = x + (i / 8) * W;
        g.fillStyle = alpha(c.stripe, 0.85);
        g.fillRect(sx, y, W / 8, H);
      }
      const sh = g.createLinearGradient(0, y, 0, y + H);
      sh.addColorStop(0, 'rgba(255,255,255,0.18)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(0,0,0,0.12)'); sh.addColorStop(1, 'rgba(0,0,0,0.3)');
      g.fillStyle = sh; g.fillRect(x, y, W, H);
      g.restore();
      rr(g, x, y, W, H, 6);
      g.strokeStyle = INK; g.lineWidth = LW * 1.1; g.stroke();
      line(g, x + 2, y + H / 2, x + W - 2, y + H / 2, INK, 2);
      for (let i = 0; i < 12; i++) { const sx = x + 8 + (i / 11) * (W - 16); circle(g, sx, y + H, 5); paint(g, c.stripe, alpha(INK, 0.6), 0.8); }
      rr(g, x + W / 2 - 20, y + H - 34, 40, 34, 2);
      paint(g, shade(c.canvas, -0.45), INK, 1.4);
      for (const px of [x + 14, x + W - 14]) {
        circle(g, px, y + H / 2, 6);
        paint(g, domeFill(g, px, y + H / 2, 6, '#8a623c', 0.4), INK, 1.4);
        poly(g, [[px, y + H / 2 - 2], [px + 30, y + H / 2 - 12 + r() * 4], [px, y + H / 2 - 20]]);
        paint(g, litFill(g, px, y + H / 2 - 20, 30, 18, c.flag, 0.3), INK, 1.2);
      }
    },
  },
  {
    id: 'lean-to', name: 'Lean-to', cat: 'structure', sets: ['camp', 'forest', 'swamp', 'winter'], tags: ['shelter', 'lean-to', 'hut', 'bivouac', 'branches'],
    w: 2, h: 2, c: { roof: '#6f6a3a', wood: '#6b4428', bed: '#7a5638' },
    variants: [{ name: 'Branches', c: {} }, { name: 'Hide', c: { roof: '#9a7a5a' }, f: { hide: 1 } }, { name: 'Canvas', c: { roof: CANVAS }, f: { hide: 1 } }, { name: 'Snowed over', c: { roof: '#6f6a3a' }, f: { snow: 1 } }],
    desc: 'A sloped shelter open to the front (bottom edge). A bedroll lies beneath.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 52, 90, 96, 80, 6);
      paint(g, alpha('#000000', 0.18), null);
      cloth(g, 66, 70, 68, 84, c.bed, r, 2, 5);
      for (const y of [128, 136]) { g.fillStyle = alpha('#c99a2e', 0.8); g.fillRect(67, y, 66, 4); }
      for (const x of [26, w - 26]) cord(g, [[x, 22], [x, 132]], c.wood, 5, false, LW);
      rr(g, 20, 16, w - 40, 108, 4);
      const gr = g.createLinearGradient(0, 16, 0, 124);
      gr.addColorStop(0, shade(c.roof, 0.18)); gr.addColorStop(1, shade(c.roof, -0.3));
      paint(g, gr, INK, LW);
      g.save();
      rr(g, 20, 16, w - 40, 108, 4);
      g.clip();
      if (f.hide) { for (let i = 1; i < 4; i++) line(g, 20 + i * 40, 16, 20 + i * 40, 124, alpha(shade(c.roof, -0.5), 0.5), 1.4); }
      else {
        g.lineCap = 'round';
        for (let i = 0; i < 40; i++) {
          const x = 20 + r() * (w - 40), y = 14 + r() * 100;
          g.strokeStyle = alpha(shade(c.roof, (r() - 0.5) * 0.5), 0.9);
          g.lineWidth = 2.4;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 8, y + 16 + r() * 8); g.stroke();
        }
      }
      if (f.snow) { blob(g, lumpy(w / 2, 40, 82, 0.2, 12, r, 34)); paint(g, alpha(SNOW, 0.93), null); }
      g.restore();
      cord(g, [[14, 122], [w - 14, 122]], c.wood, 5, false, LW);
    },
  },
  {
    id: 'bedroll', name: 'Bedroll', cat: 'furniture', sets: ['camp', 'forest', 'cave', 'desert', 'winter', 'ship'], tags: ['bedroll', 'sleeping', 'blanket', 'rest', 'bed', 'camp'],
    w: 1, h: 1, layer: 'floor', c: { cloth: '#7a5638', stripe: '#a3312c' },
    variants: [{ name: 'Brown', c: {} }, { name: 'Green', c: { cloth: '#4c6438', stripe: '#c99a2e' } }, { name: 'Blue', c: { cloth: '#2f5d8a', stripe: '#e6e0d2' } }, { name: 'Fur', c: { cloth: '#8a7a64', stripe: '#6b5a44' }, f: { fur: 1 } }],
    desc: 'A blanket roll laid out for a long rest. Head at the top.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      cloth(g, 28, 12, 44, 78, c.cloth, r, 2, 6);
      if (f.fur) speckle(g, 30, 22, 40, 64, r, 40, alpha(shade(c.cloth, 0.3), 0.6), 1.6);
      else for (const y of [56, 64]) { g.fillStyle = alpha(c.stripe, 0.85); g.fillRect(29, y, 42, 4); }
      rr(g, 26, 8, 48, 16, 8);
      paint(g, litFill(g, 26, 8, 48, 16, shade(c.cloth, 0.2), 0.3), INK, LW * 0.9);
      line(g, 34, 16, 66, 16, alpha(shade(c.cloth, -0.5), 0.5), 1);
    },
  },
  {
    id: 'hammock', name: 'Hammock', cat: 'furniture', sets: ['camp', 'ship', 'forest'], tags: ['hammock', 'bed', 'sleeping', 'net', 'crew'],
    w: 1, h: 2, c: { cloth: '#d2c4a2', wood: '#6b4428' }, variants: [{ name: 'Canvas', c: {} }, { name: 'Striped', c: { cloth: '#a3463a' }, f: { stripe: 1 } }, { name: 'Rope net', c: { cloth: '#b8a882' }, f: { net: 1 } }],
    desc: 'A hammock slung between two posts (or trees, or ship beams).',
    draw: ({ g, h, c, f, seed }) => {
      const r = rng(seed);
      for (const [y, s] of [[14, 1], [h - 14, -1]]) {
        for (const dx of [-14, 0, 14]) line(g, 50, y, 50 + dx, y + s * 30, alpha(ROPE, 1), 1.3);
        circle(g, 50, y, 8);
        paint(g, domeFill(g, 50, y, 8, c.wood, 0.4), INK, LW);
      }
      g.beginPath();
      g.moveTo(50 - 14, 44);
      g.quadraticCurveTo(50 - 30, h / 2, 50 - 14, h - 44);
      g.lineTo(50 + 14, h - 44);
      g.quadraticCurveTo(50 + 30, h / 2, 50 + 14, 44);
      g.closePath();
      paint(g, litFill(g, 20, 44, 60, h - 88, c.cloth, 0.25), INK, LW);
      g.save();
      g.clip();
      if (f.stripe) for (let x = 24; x < 80; x += 12) { g.fillStyle = alpha('#e6dcc4', 0.75); g.fillRect(x, 40, 5, h - 80); }
      if (f.net) { for (let y = 44; y < h - 40; y += 8) line(g, 15, y, 85, y + 6, alpha(INK, 0.4), 1); for (let y = 44; y < h - 40; y += 8) line(g, 15, y + 6, 85, y, alpha(INK, 0.4), 1); }
      const sh = g.createLinearGradient(20, 0, 80, 0);
      sh.addColorStop(0, 'rgba(0,0,0,0.25)'); sh.addColorStop(0.4, 'rgba(255,255,255,0.1)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)');
      g.fillStyle = sh; g.fillRect(15, 40, 70, h - 80);
      g.restore();
      void r;
    },
  },
  {
    id: 'hitching-post', name: 'Hitching post', cat: 'structure', sets: ['town', 'farm', 'camp', 'tavern'], tags: ['hitching rail', 'horse', 'post', 'stable', 'tie'],
    w: 2, h: 1, blocksMovement: true, c: { wood: '#7a5638' }, variants: [{ name: 'Oak', c: {} }, { name: 'Weathered', c: { wood: '#8a8270' } }, { name: 'With rope', c: {}, f: { rope: 1 } }],
    desc: 'A rail for tying up horses.',
    draw: ({ g, w, c, f, seed }) => {
      const r = rng(seed);
      board(g, 12, 44, w - 24, 12, c.wood, r, 'h', 4);
      for (const x of [18, w - 18]) { rr(g, x - 9, 41, 18, 18, 3); paint(g, litFill(g, x - 9, 41, 18, 18, shade(c.wood, -0.12), 0.3), INK, LW); }
      if (f.rope) { cord(g, [[86, 46], [92, 60], [84, 76], [96, 88]], ROPE, 2.6, true, 1.6); circle(g, 88, 50, 6); inked(g, ROPE, 2.2, 1.4); }
    },
  },
  {
    id: 'horse-trough', name: 'Water trough', cat: 'structure', sets: ['town', 'farm', 'camp', 'tavern', 'desert'], tags: ['trough', 'water', 'horse', 'stable', 'drink'],
    w: 2, h: 1, blocksMovement: true, c: { wood: '#7a5638', water: '#4f7f95' },
    variants: [{ name: 'Wooden', c: {} }, { name: 'Stone', c: { wood: STONE.grey }, f: { stone: 1 } }, { name: 'Empty', c: { water: '#3a2c20' } }],
    desc: 'A long trough of water for animals.',
    draw: ({ g, w, c, f, seed }) => {
      const r = rng(seed);
      rr(g, 8, 22, w - 16, 56, 5);
      paint(g, litFill(g, 8, 22, w - 16, 56, c.wood, 0.25), INK, LW);
      if (f.stone) blocks(g, 9, 23, w - 18, 54, c.wood, r, 30, 27);
      else planks(g, 9, 23, w - 18, 54, c.wood, r, 'h', 4);
      rr(g, 18, 31, w - 36, 38, 3);
      paint(g, '#1a1410', INK, 1.4);
      g.save(); rr(g, 19, 32, w - 38, 36, 3); g.clip();
      liquid(g, w / 2, 50, w / 2 - 14, 22, c.water, r);
      g.restore();
      if (!f.stone) { strap(g, 40, 22, 6, 56, METAL.iron, false); strap(g, w - 46, 22, 6, 56, METAL.iron, false); }
    },
  },
];

// ======================= FARM =======================
const FARM: ObjDef[] = [
  {
    id: 'haystack', name: 'Haystack', cat: 'nature', sets: ['farm', 'town', 'camp'], tags: ['hay', 'straw', 'haystack', 'hide', 'stable'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { hay: STRAW }, variants: [{ name: 'Golden', c: {} }, { name: 'Old grey', c: { hay: '#a8996e' } }, { name: 'Green fodder', c: { hay: '#a8b05a' } }],
    desc: 'A big domed haystack. Good place to hide something (or someone).',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      blob(g, lumpy(cx, cy, 84, 0.12, 16, r));
      paint(g, domeFill(g, cx, cy, 84, c.hay, 0.32), INK, LW * 1.1);
      g.save();
      blob(g, lumpy(cx, cy, 82, 0.0, 16, r));
      g.clip();
      g.lineCap = 'round';
      for (let i = 0; i < 110; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 80, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, aa = a + (r() - 0.5) * 0.8;
        g.strokeStyle = r() < 0.5 ? alpha(shade(c.hay, -0.45), 0.55) : alpha(shade(c.hay, 0.35), 0.6);
        g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(aa) * 10, y + Math.sin(aa) * 10); g.stroke();
      }
      g.restore();
      circle(g, cx - 4, cy - 4, 12);
      paint(g, domeFill(g, cx - 4, cy - 4, 12, shade(c.hay, 0.1), 0.4), alpha(INK, 0.6), 1);
    },
  },
  {
    id: 'hay-bale', name: 'Hay bale', cat: 'nature', sets: ['farm', 'town', 'tavern', 'market'], tags: ['hay', 'straw', 'bale', 'stable', 'cover'],
    w: 1, h: 1, blocksMovement: true, c: { hay: STRAW }, variants: [{ name: 'Square bale', c: {} }, { name: 'Round bale', c: {}, f: { round: 1 } }, { name: 'Old grey', c: { hay: '#a8996e' } }],
    desc: 'A tied bale of hay. Half cover.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      if (f.round) {
        circle(g, 50, 50, 40);
        paint(g, domeFill(g, 50, 50, 40, c.hay, 0.3), INK, LW);
        coil(g, 50, 50, 34, shade(c.hay, -0.12), 4, 1.6);
        return;
      }
      rr(g, 12, 24, 76, 52, 5);
      paint(g, litFill(g, 12, 24, 76, 52, c.hay, 0.25), INK, LW);
      g.save(); rr(g, 12, 24, 76, 52, 5); g.clip();
      for (let i = 0; i < 40; i++) { const x = 12 + r() * 76, y = 24 + r() * 52; line(g, x, y, x + 8 + r() * 6, y + (r() - 0.5) * 2, r() < 0.5 ? alpha(shade(c.hay, -0.45), 0.6) : alpha(shade(c.hay, 0.4), 0.6), 1); }
      g.restore();
      for (const x of [34, 66]) { line(g, x, 23, x, 77, alpha(INK, 0.6), 3.4); line(g, x, 23, x, 77, '#8a5a32', 1.8); }
    },
  },
  {
    id: 'scarecrow', name: 'Scarecrow', cat: 'decor', sets: ['farm', 'town', 'swamp'], tags: ['scarecrow', 'field', 'straw man', 'creepy', 'harvest'],
    w: 1, h: 1, blocksMovement: true, c: { cloth: '#6b5a8a', hat: '#5a4a32' }, variants: [{ name: 'Purple coat', c: {} }, { name: 'Red rags', c: { cloth: '#8e3a2c' } }, { name: 'Sinister', c: { cloth: '#2b2b30', hat: '#1b1b1e' }, f: { crow: 1 } }],
    desc: 'A straw figure on a pole, arms outstretched. Or is it?',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      board(g, 8, 40, 84, 8, '#7a5638', r, 'h', 2);
      for (const s of [-1, 1]) {
        const x = 50 + s * 38;
        tuft(g, x + s * 4, 44, 8, STRAW, r);
        rr(g, s < 0 ? 16 : 54, 36, 30, 16, 4);
        paint(g, litFill(g, 16, 36, 68, 16, c.cloth, 0.25), INK, 1.4);
      }
      poly(g, [[36, 38], [64, 38], [70, 76], [30, 76]]);
      paint(g, litFill(g, 30, 38, 40, 38, c.cloth, 0.25), INK, LW);
      for (let i = 0; i < 2; i++) { rr(g, 38 + r() * 18, 52 + r() * 16, 8, 7, 1); paint(g, shade(c.cloth, 0.25), alpha(INK, 0.7), 0.8); }
      circle(g, 50, 40, 20);
      paint(g, domeFill(g, 50, 40, 20, c.hat, 0.35), INK, LW);
      circle(g, 50, 40, 11);
      paint(g, domeFill(g, 50, 40, 11, shade(c.hat, 0.15), 0.4), alpha(INK, 0.7), 1.2);
      if (f.crow) {
        ellipse(g, 80, 42, 8, 5, 0.3);
        paint(g, '#1b1b1e', INK, 1);
        poly(g, [[87, 44], [93, 46], [87, 47]]);
        paint(g, '#c9a24a', null);
      }
    },
  },
  {
    id: 'crop-rows', name: 'Crop rows', cat: 'nature', sets: ['farm', 'town'], tags: ['crops', 'field', 'farm', 'wheat', 'cabbage', 'corn', 'pumpkin', 'garden', 'vegetables'],
    w: 2, h: 2, layer: 'floor', c: { soil: '#6b4e34', crop: '#d6b25e' },
    variants: [{ name: 'Wheat', c: {}, f: { kind: 0 } }, { name: 'Cabbages', c: { crop: '#7aa64a' }, f: { kind: 1 } }, { name: 'Corn', c: { crop: '#6f9a3e' }, f: { kind: 2 } }, { name: 'Pumpkins', c: { crop: '#d9822b' }, f: { kind: 3 } }],
    desc: 'Planted rows in tilled soil. Corn is tall enough to hide in (GM call).',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed), k = f.kind ?? 0;
      rr(g, 6, 6, w - 12, h - 12, 6);
      paint(g, alpha(c.soil, 0.9), alpha(INK, 0.6), 1.4);
      const rows = 6, s = (h - 24) / rows;
      for (let i = 0; i < rows; i++) {
        const y = 12 + i * s + s / 2;
        rr(g, 10, y - s * 0.32, w - 20, s * 0.64, s * 0.3);
        paint(g, shade(c.soil, 0.12), null);
        line(g, 12, y + s * 0.34, w - 12, y + s * 0.34, alpha(shade(c.soil, -0.5), 0.6), 2);
        if (k === 0) for (let x = 16; x < w - 12; x += 7) tuft(g, x + r() * 3, y + 3, 8, shade(c.crop, (r() - 0.4) * 0.3), r);
        if (k === 1) for (let x = 22; x < w - 14; x += 22) { const cr = 8 + r() * 2; circle(g, x, y, cr); paint(g, domeFill(g, x, y, cr, c.crop, 0.45), INK, 1); circle(g, x - 1, y - 1, cr * 0.45); paint(g, shade(c.crop, 0.3), alpha(INK, 0.4), 0.7); }
        if (k === 2) for (let x = 20; x < w - 14; x += 18) {
          for (let b = 0; b < 5; b++) { const a = r() * TAU; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * 8 + 3, y + Math.sin(a) * 8, x + Math.cos(a) * 14, y + Math.sin(a) * 14); inked(g, shade(c.crop, (r() - 0.4) * 0.3), 2.6, 1.4); }
          circle(g, x, y, 3); paint(g, '#e9c46a', INK, 0.8);
        }
        if (k === 3) {
          g.beginPath(); g.moveTo(12, y); for (let x = 12; x < w - 12; x += 10) g.lineTo(x, y + Math.sin(x * 0.2 + i) * 4); inked(g, '#5f8a3a', 2, 1.2);
          for (let x = 24 + r() * 10; x < w - 16; x += 30 + r() * 10) { const cr = 7 + r() * 4; ellipse(g, x, y, cr * 1.15, cr); paint(g, domeFill(g, x, y, cr, c.crop, 0.45), INK, 1.1); line(g, x, y - cr, x, y + cr, alpha(shade(c.crop, -0.5), 0.6), 0.9); }
        }
      }
    },
  },
  {
    id: 'chicken-coop', name: 'Chicken coop', cat: 'structure', sets: ['farm', 'town'], tags: ['chickens', 'hens', 'coop', 'poultry', 'eggs', 'farm animals'],
    w: 2, h: 1, blocksMovement: true, c: { roof: '#8e4a32', wood: '#9a744a' }, variants: [{ name: 'Red roof', c: {} }, { name: 'Thatched', c: { roof: '#b8964e' } }, { name: 'Grey slate', c: { roof: '#5e6066' } }],
    desc: 'A little hen house with a wire run and a few birds.',
    draw: ({ g, w, c, seed }) => {
      const r = rng(seed);
      rr(g, 104, 14, w - 112, 72, 3);
      paint(g, alpha('#8a7a5a', 0.35), INK, 1.2);
      g.save(); rr(g, 104, 14, w - 112, 72, 3); g.clip();
      for (let x = 104; x < w; x += 8) line(g, x, 14, x + 20, 86, alpha('#d9d2c3', 0.5), 0.7);
      for (let x = 104; x < w + 40; x += 8) line(g, x, 14, x - 20, 86, alpha('#d9d2c3', 0.5), 0.7);
      g.restore();
      for (let i = 0; i < 4; i++) {
        const x = 120 + r() * 60, y = 26 + r() * 48, a = r() * TAU;
        ellipse(g, x, y, 7, 5, a); paint(g, domeFill(g, x, y, 7, i === 2 ? '#a8643a' : '#f2ede2', 0.3), INK, 1);
        circle(g, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 3); paint(g, i === 2 ? '#a8643a' : '#f2ede2', INK, 0.8);
        circle(g, x + Math.cos(a) * 8, y + Math.sin(a) * 8 - 1, 1.3); paint(g, '#d62828', null);
      }
      board(g, 92, 44, 26, 10, shade(c.wood, 0.1), r, 'h', 1);
      roofTop(g, 6, 8, 96, 84, c.roof, 'h', 6, 3);
    },
  },
  {
    id: 'beehive', name: 'Beehives', cat: 'decor', sets: ['farm', 'town', 'forest', 'temple'], tags: ['bees', 'hive', 'skep', 'honey', 'apiary', 'swarm'],
    w: 1, h: 1, blocksMovement: true, c: { hive: STRAW, wood: '#9a744a' }, variants: [{ name: 'Straw skeps', c: {} }, { name: 'Wooden boxes', c: { hive: '#e3ddd0' }, f: { box: 1 } }, { name: 'Wild hive (angry)', c: { hive: '#b08a4a' }, f: { swarm: 1 } }],
    desc: 'Hives on a bench. Disturb them and the GM may call for a bee swarm.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      board(g, 6, 40, 88, 20, c.wood, r, 'h', 3);
      for (const x of [29, 71]) {
        if (f.box) {
          rr(g, x - 18, 32, 36, 36, 2); paint(g, litFill(g, x - 18, 32, 36, 36, c.hive, 0.25), INK, LW);
          roofTop(g, x - 20, 30, 40, 40, '#6f6c66', 'v', 0, 2);
        } else {
          circle(g, x, 50, 19);
          paint(g, domeFill(g, x, 50, 19, c.hive, 0.4), INK, LW);
          for (const k of [14, 9, 4.5]) { circle(g, x, 50, k); g.strokeStyle = alpha(shade(c.hive, -0.5), 0.6); g.lineWidth = 1.2; g.stroke(); }
        }
      }
      const n = f.swarm ? 26 : 7;
      for (let i = 0; i < n; i++) { const x = 8 + r() * 84, y = 8 + r() * 84; ellipse(g, x, y, 2.4, 1.6, r() * 3); paint(g, '#f2c230', INK, 0.7); }
    },
  },
];

/** A crystal shard pointing along angle a from (x, y). */
function shard(g: G, x: number, y: number, a: number, len: number, wd: number, col: string) {
  const dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
  const tip = [x + dx * len, y + dy * len], sh = [x + dx * len * 0.72, y + dy * len * 0.72];
  const L = [[x + px * wd, y + py * wd], [sh[0] + px * wd, sh[1] + py * wd], tip];
  const R = [tip, [sh[0] - px * wd, sh[1] - py * wd], [x - px * wd, y - py * wd]];
  poly(g, [...L, ...R.slice(1)]);
  paint(g, shade(col, -0.15), INK, 1.4);
  poly(g, [[x, y], ...L]);
  g.fillStyle = alpha(shade(col, px * -0.7 + py * -0.7 > 0 ? 0.45 : 0.15), 0.9);
  g.fill();
  line(g, x, y, tip[0], tip[1], alpha('#ffffff', 0.55), 1);
}
/** A bone: a shaft with knobbed ends. */
function bone(g: G, x1: number, y1: number, x2: number, y2: number, wd: number, col: string) {
  cord(g, [[x1, y1], [x2, y2]], col, wd, false, 1.8);
  const a = Math.atan2(y2 - y1, x2 - x1), px = -Math.sin(a), py = Math.cos(a);
  for (const [x, y] of [[x1, y1], [x2, y2]]) for (const s of [-1, 1]) {
    circle(g, x + px * wd * 0.45 * s, y + py * wd * 0.45 * s, wd * 0.62);
    paint(g, col, INK, 1);
  }
}

// ======================= CAVE AND MINE =======================
const UNDER: ObjDef[] = [
  {
    id: 'mine-cart', name: 'Mine cart', cat: 'vehicle', sets: ['mine', 'cave', 'dungeon'], tags: ['minecart', 'cart', 'ore', 'rails', 'tub'],
    w: 1, h: 1, blocksMovement: true, c: { metal: '#5a5e63', wood: '#7a5638', load: '#4e4b48', glint: '#c97a4a' },
    variants: [{ name: 'Iron ore', c: {}, f: { load: 1 } }, { name: 'Empty', c: {} }, { name: 'Gold ore', c: { glint: '#f2c94c' }, f: { load: 1 } }, { name: 'Coal', c: { load: '#1f1f22', glint: '#5a5e63' }, f: { load: 1 } }],
    desc: 'A rail cart. On rails it rolls; pushing a loaded one takes a strong shove.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      for (const [x, y] of [[14, 20], [78, 20], [14, 72], [78, 72]]) { rr(g, x, y, 8, 10, 2); paint(g, '#26282b', INK, 1.2); }
      rr(g, 18, 14, 64, 72, 6);
      paint(g, litFill(g, 18, 14, 64, 72, c.metal, 0.35), INK, LW * 1.1);
      for (const y of [30, 70]) strap(g, 18, y - 3, 64, 6, shade(c.metal, -0.15));
      rr(g, 25, 21, 50, 58, 4);
      paint(g, '#17181a', INK, 1.4);
      if (f.load) {
        g.save(); rr(g, 25, 21, 50, 58, 4); g.clip();
        rocks(g, 50, 50, 20, 12, 5, 10, c.load, r);
        for (let i = 0; i < 7; i++) { circle(g, 32 + r() * 36, 28 + r() * 44, 2.2); paint(g, c.glint, alpha(INK, 0.6), 0.6); }
        g.restore();
      }
    },
  },
  {
    id: 'mine-rails', name: 'Mine rails', cat: 'structure', sets: ['mine', 'cave', 'dungeon'], tags: ['rails', 'track', 'minecart', 'railway'],
    w: 1, h: 1, layer: 'floor', c: { metal: '#7a7e83', wood: '#6b4a2e' },
    variants: [{ name: 'Straight', c: {}, f: { kind: 0 } }, { name: 'Curve', c: {}, f: { kind: 1 } }, { name: 'End stop', c: {}, f: { kind: 2 } }, { name: 'Crossing', c: {}, f: { kind: 3 } }],
    desc: 'One square of track. Rotate pieces to lay a line; curves join bottom to right.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed), k = f.kind ?? 0;
      const sleepersV = (y0: number, y1: number) => { for (let y = y0 + 8; y < y1; y += 18) board(g, 20, y - 4, 60, 8, shade(c.wood, (r() - 0.5) * 0.2), r, 'h', 1.2); };
      const railsV = (y0: number) => { for (const x of [32, 68]) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, 100); inked(g, c.metal, 3.6, 1.8); line(g, x - 0.8, y0, x - 0.8, 100, alpha('#ffffff', 0.4), 0.8); } };
      if (k === 1) {
        for (let i = 0; i < 6; i++) {
          const a = Math.PI + (i + 0.5) * (Math.PI / 2 / 6);
          g.save(); g.translate(100, 100); g.rotate(a); board(g, 20, -4, 60, 8, shade(c.wood, (r() - 0.5) * 0.2), r, 'h', 1.2); g.restore();
        }
        for (const rad of [32, 68]) { g.beginPath(); g.arc(100, 100, rad, Math.PI, Math.PI * 1.5); inked(g, c.metal, 3.6, 1.8); }
        return;
      }
      if (k === 3) {
        sleepersV(0, 100);
        for (const y of [32, 68]) { g.beginPath(); g.moveTo(0, y); g.lineTo(100, y); inked(g, c.metal, 3.6, 1.8); }
        railsV(0);
        for (const x of [32, 68]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 100); inked(g, c.metal, 3.6, 1.8); }
        return;
      }
      sleepersV(k === 2 ? 30 : 0, 100);
      railsV(k === 2 ? 34 : 0);
      if (k === 2) {
        board(g, 18, 18, 64, 16, c.wood, r, 'h', 2);
        for (const x of [24, 76]) { circle(g, x, 26, 4); paint(g, domeFill(g, x, 26, 4, '#3a3d40', 0.4), INK, 1); }
      }
    },
  },
  {
    id: 'ore-pile', name: 'Ore pile', cat: 'treasure', sets: ['mine', 'cave'], tags: ['ore', 'rubble', 'mining', 'nuggets', 'vein', 'difficult'],
    w: 1, h: 1, difficult: true, c: { rock: '#5e5a55', glint: '#c97a4a' },
    variants: [{ name: 'Iron', c: {} }, { name: 'Copper', c: { glint: '#3fb39a' } }, { name: 'Gold', c: { glint: '#f2c94c' } }, { name: 'Silver', c: { glint: '#e6ecf2' } }, { name: 'Coal', c: { rock: '#26262a', glint: '#4a4e55' } }, { name: 'Star-blue mithral', c: { rock: '#4a4f5a', glint: '#9fd8ff' } }],
    desc: 'Broken ore heaped for hauling. Difficult terrain.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 52, 42, 0.3, 11, r));
      paint(g, alpha(shade(c.rock, -0.3), 0.5), null);
      rocks(g, 50, 50, 28, 12, 6, 13, c.rock, r);
      for (let i = 0; i < 9; i++) {
        const x = 26 + r() * 48, y = 26 + r() * 48, s = 2.6 + r() * 2.2;
        poly(g, [[x, y - s], [x + s, y], [x, y + s], [x - s, y]]);
        paint(g, domeFill(g, x, y, s, c.glint, 0.5), INK, 0.8);
      }
    },
  },
  {
    id: 'pickaxes', name: 'Mining tools', cat: 'workshop', sets: ['mine', 'cave', 'camp'], tags: ['pickaxe', 'pick', 'shovel', 'tools', 'mining', 'dig'],
    w: 1, h: 1, c: { wood: '#9a744a', metal: '#6c6f73' }, variants: [{ name: 'Iron', c: {} }, { name: 'Rusty', c: { metal: METAL.rust, wood: '#7a6048' } }, { name: 'Steel and ash', c: { metal: '#a9b0b8', wood: WOOD.ash } }],
    desc: 'Picks and a shovel left on the ground.',
    draw: ({ g, c }) => {
      const pick = (cx: number, cy: number, a: number) => {
        g.save(); g.translate(cx, cy); g.rotate(a);
        cord(g, [[0, -34], [0, 34]], c.wood, 4, false, 2);
        g.beginPath(); g.moveTo(-26, -20); g.quadraticCurveTo(0, -34, 26, -20);
        inked(g, c.metal, 5, 2.4);
        rr(g, -5, -34, 10, 10, 2); paint(g, litFill(g, -5, -34, 10, 10, c.metal, 0.4), INK, 1.2);
        g.restore();
      };
      g.save(); g.translate(68, 52); g.rotate(0.15);
      cord(g, [[0, -38], [0, 18]], c.wood, 3.6, false, 2);
      rr(g, -6, -42, 12, 6, 2); paint(g, c.wood, INK, 1);
      poly(g, [[-10, 16], [10, 16], [9, 34], [0, 40], [-9, 34]]); paint(g, litFill(g, -10, 16, 20, 24, c.metal, 0.4), INK, 1.4);
      g.restore();
      pick(42, 50, -0.5);
      pick(40, 54, 0.7);
    },
  },
  {
    id: 'mine-support', name: 'Mine supports', cat: 'structure', sets: ['mine', 'cave', 'dungeon'], tags: ['beam', 'timber', 'support', 'shoring', 'tunnel', 'prop'],
    w: 2, h: 1, layer: 'overhead', c: { wood: '#7a5638' },
    variants: [{ name: 'Sound', c: {} }, { name: 'Dark', c: { wood: '#4e3624' } }, { name: 'Cracked (may collapse)', c: { wood: '#6b5038' }, f: { crack: 1 } }],
    desc: 'Timber posts and a crossbeam shoring up a tunnel. The posts stand at each end.',
    draw: ({ g, w, c, f, seed }) => {
      const r = rng(seed);
      g.save();
      if (f.crack) { g.translate(w / 2, 50); g.rotate(0.05); g.translate(-w / 2, -50); }
      board(g, 4, 40, w - 8, 20, c.wood, r, 'h', 2);
      if (f.crack) { g.beginPath(); g.moveTo(w / 2 - 6, 40); g.lineTo(w / 2 + 2, 48); g.lineTo(w / 2 - 3, 53); g.lineTo(w / 2 + 6, 60); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); }
      g.restore();
      for (const x of [16, w - 16]) {
        rr(g, x - 12, 38, 24, 24, 2);
        paint(g, litFill(g, x - 12, 38, 24, 24, shade(c.wood, -0.1), 0.3), INK, LW);
        for (const k of [8, 4]) { circle(g, x, 50, k); g.strokeStyle = alpha(shade(c.wood, -0.6), 0.6); g.lineWidth = 0.8; g.stroke(); }
      }
      for (const x of [34, w - 34]) { rivet(g, x, 50, 3, METAL.iron); }
    },
  },
  {
    id: 'stalagmites', name: 'Stalagmites', cat: 'terrain', sets: ['cave', 'mine', 'winter'], tags: ['stalagmite', 'rock spire', 'cave', 'formation', 'cover'],
    w: 1, h: 1, blocksMovement: true, c: { rock: '#8a8174' },
    variants: [{ name: 'Limestone', c: {} }, { name: 'Dark wet', c: { rock: '#4a4844' } }, { name: 'Red rock', c: { rock: '#9a5a48' } }, { name: 'Ice', c: { rock: '#a9d6ea' } }],
    desc: 'Rising spires of rock. Blocks movement; partial cover.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      const list: number[][] = [[50, 52, 25], [26, 30, 14], [76, 28, 12], [74, 76, 15], [24, 74, 11]];
      list.sort((a, b) => a[2] - b[2]);
      blob(g, lumpy(50, 52, 44, 0.25, 11, r));
      paint(g, alpha(shade(c.rock, -0.35), 0.55), null);
      for (const [x, y, s] of list.reverse()) {
        const xx = x + (r() - 0.5) * 6, yy = y + (r() - 0.5) * 6;
        blob(g, lumpy(xx, yy, s, 0.2, 8, r));
        paint(g, domeFill(g, xx, yy, s, c.rock, 0.5), INK, LW * 0.9);
        for (const k of [0.66, 0.36]) { circle(g, xx - s * (1 - k) * 0.3, yy - s * (1 - k) * 0.3, s * k); g.strokeStyle = alpha(shade(c.rock, -0.45), 0.55); g.lineWidth = 0.9; g.stroke(); }
        circle(g, xx - s * 0.28, yy - s * 0.28, s * 0.14);
        paint(g, alpha(shade(c.rock, 0.6), 0.9), null);
      }
    },
  },
  {
    id: 'stalactites', name: 'Stalactites', cat: 'terrain', sets: ['cave', 'mine', 'winter'], tags: ['stalactite', 'ceiling', 'cave', 'dripping', 'falling', 'overhead'],
    w: 1, h: 1, layer: 'overhead', c: { rock: '#8a8174' }, variants: [{ name: 'Limestone', c: {} }, { name: 'Dark', c: { rock: '#4a4844' } }, { name: 'Icicles', c: { rock: '#bfe3f2' } }],
    desc: 'Rock teeth hanging from the ceiling, shown as a shadow over the floor. Some may fall.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(50, 50, 42, 0.3, 10, r));
      paint(g, 'rgba(10,8,6,0.28)', null);
      for (let i = 0; i < 7; i++) {
        const x = 20 + r() * 60, y = 20 + r() * 60, s = 5 + r() * 7;
        circle(g, x, y, s);
        const gr = g.createRadialGradient(x, y, 0, x, y, s);
        gr.addColorStop(0, shade(c.rock, 0.55)); gr.addColorStop(0.35, c.rock); gr.addColorStop(1, alpha(shade(c.rock, -0.5), 0.9));
        paint(g, gr, alpha(INK, 0.55), 1);
        circle(g, x, y, 1.4);
        paint(g, alpha('#cfe8ff', 0.9), null);
      }
    },
  },
  {
    id: 'cave-crystals', name: 'Glowing crystals', cat: 'light', sets: ['cave', 'mine', 'wizard', 'dungeon'], tags: ['crystal', 'gem', 'geode', 'glow', 'arcane', 'light', 'quartz'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 10, dim: 10, color: '#8fd8ff' }, c: { crystal: '#5fc4f0' },
    variants: [{ name: 'Blue', c: {} }, { name: 'Violet', c: { crystal: '#a774e8' } }, { name: 'Green', c: { crystal: '#5fe08a' } }, { name: 'Red', c: { crystal: '#ef5a5a' } }, { name: 'Clear quartz', c: { crystal: '#dfe9ef' } }],
    desc: 'A cluster of crystals that shed soft light. Bright 10 ft, dim 10 ft.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 50, c.crystal, 0.5);
      rocks(g, 50, 52, 16, 6, 6, 10, '#4e4b48', r);
      const list: number[][] = [];
      const off = r() * TAU;
      for (let i = 0; i < 8; i++) list.push([off + (i / 8) * TAU + (r() - 0.5) * 0.4, 30 + r() * 12, 6 + r() * 3]);
      list.sort((a, b) => Math.sin(b[0]) - Math.sin(a[0]));
      for (const [a, len, wd] of list) shard(g, 50 + Math.cos(a) * 6, 52 + Math.sin(a) * 6, a, len, wd, c.crystal);
      shard(g, 46, 56, -2.3, 24, 9, shade(c.crystal, 0.12));
      shard(g, 54, 50, -0.6, 20, 8, shade(c.crystal, 0.05));
    },
  },
  {
    id: 'glowing-fungus', name: 'Glowing fungus', cat: 'light', sets: ['cave', 'swamp', 'forest', 'mine'], tags: ['fungus', 'mushroom', 'glow', 'bioluminescent', 'light', 'underdark'],
    w: 1, h: 1, light: { bright: 5, dim: 10, color: '#7affd4' }, c: { cap: '#3fe0c0', dark: '#1d4a48' },
    variants: [{ name: 'Teal', c: {} }, { name: 'Violet', c: { cap: '#c08aff', dark: '#3a2558' } }, { name: 'Amber', c: { cap: '#ffc65a', dark: '#5a3a18' } }],
    desc: 'Luminous fungus. Bright light 5 ft, dim 5 ft more.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      glow(g, 50, 50, 50, c.cap, 0.55);
      const list: number[][] = [];
      for (let i = 0; i < 9; i++) list.push([18 + r() * 64, 18 + r() * 64, 4 + r() * 8]);
      list.sort((a, b) => a[2] - b[2]);
      for (const [x, y, s] of list) {
        circle(g, x, y, s);
        const gr = g.createRadialGradient(x - s * 0.3, y - s * 0.3, 0, x, y, s);
        gr.addColorStop(0, shade(c.cap, 0.6)); gr.addColorStop(0.5, c.cap); gr.addColorStop(1, c.dark);
        paint(g, gr, INK, 1);
        for (let k = 0; k < 3; k++) { circle(g, x + (r() - 0.5) * s, y + (r() - 0.5) * s, s * 0.12 + 0.4); paint(g, '#f4fffb', null); }
      }
    },
  },
];

// ======================= SWAMP AND DESERT =======================
const WILDS: ObjDef[] = [
  {
    id: 'mud-patch', name: 'Bog mud', cat: 'terrain', sets: ['swamp', 'farm', 'forest', 'sewer'], tags: ['mud', 'bog', 'mire', 'muck', 'difficult', 'marsh'],
    w: 2, h: 2, layer: 'floor', flat: true, difficult: true, c: { mud: MUD },
    variants: [{ name: 'Brown mud', c: {} }, { name: 'Black bog', c: { mud: '#2e2a24' } }, { name: 'Green slime', c: { mud: '#4a5a32' } }],
    desc: 'Sucking mud. Difficult terrain.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const pts = lumpy(w / 2, h / 2, 86, 0.32, 13, r);
      blob(g, pts);
      paint(g, alpha(shade(c.mud, -0.2), 0.88), alpha(INK, 0.35), 1.4);
      blob(g, lumpy(w / 2 + 4, h / 2 + 4, 62, 0.3, 11, r));
      paint(g, alpha(shade(c.mud, -0.4), 0.6), null);
      for (let i = 0; i < 6; i++) {
        const x = 30 + r() * 140, y = 30 + r() * 140, s = 3 + r() * 5;
        circle(g, x, y, s);
        paint(g, alpha(shade(c.mud, 0.15), 0.8), alpha(INK, 0.5), 0.8);
        circle(g, x - s * 0.3, y - s * 0.3, s * 0.3);
        paint(g, 'rgba(255,255,255,0.5)', null);
      }
      for (let i = 0; i < 3; i++) { const x = 50 + r() * 90, y = 50 + r() * 90; ellipse(g, x, y, 18 + r() * 10, 4, -0.3); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fill(); }
    },
  },
  {
    id: 'quicksand', name: 'Quicksand', cat: 'hazard', sets: ['desert', 'swamp'], tags: ['quicksand', 'sinking', 'trap', 'hazard', 'sand', 'difficult'],
    w: 2, h: 2, layer: 'floor', flat: true, difficult: true, c: { sand: '#c9ab72' }, variants: [{ name: 'Desert', c: {} }, { name: 'Swamp silt', c: { sand: '#8a7a58' } }],
    desc: 'Sand that swallows the careless. A creature entering may sink (GM rules).',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      const pts = lumpy(cx, cy, 80, 0.2, 13, r);
      blob(g, pts);
      const gr = g.createRadialGradient(cx, cy, 4, cx, cy, 84);
      gr.addColorStop(0, shade(c.sand, -0.35)); gr.addColorStop(0.6, shade(c.sand, -0.12)); gr.addColorStop(1, alpha(c.sand, 0.4));
      paint(g, gr, null);
      g.save(); blob(g, pts); g.clip();
      for (let k = 0; k < 4; k++) {
        g.beginPath();
        for (let i = 0; i <= 40; i++) { const t = i / 40, a = t * TAU * 1.2 + k * 1.6, rad = 10 + t * 70; const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad; i ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.strokeStyle = alpha(shade(c.sand, -0.5), 0.45); g.lineWidth = 2; g.stroke();
      }
      g.restore();
    },
  },
  {
    id: 'bones-mud', name: 'Bones in the mud', cat: 'decor', sets: ['swamp', 'cave', 'crypt', 'desert', 'dungeon'], tags: ['bones', 'skeleton', 'remains', 'corpse', 'grim', 'mud'],
    w: 1, h: 1, layer: 'floor', c: { mud: MUD, bone: '#e3dac4' }, variants: [{ name: 'In mud', c: {} }, { name: 'Bare ground', c: { mud: 'transparent' } }, { name: 'In sand', c: { mud: '#c9ab72' } }],
    desc: 'Half-sunk remains. Something died here.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      if (c.mud !== 'transparent') { blob(g, lumpy(50, 50, 44, 0.3, 11, r)); paint(g, alpha(c.mud, 0.85), null); }
      for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(46, 60, 10 + i * 6, Math.PI * 1.1, Math.PI * 1.9); inked(g, c.bone, 2.6, 1.6); }
      cord(g, [[46, 40], [46, 72]], c.bone, 3.4, false, 1.6);
      bone(g, 64, 70, 86, 56, 4, c.bone);
      bone(g, 18, 74, 34, 86, 3.4, c.bone);
      circle(g, 70, 32, 12);
      paint(g, domeFill(g, 70, 32, 12, c.bone, 0.35), INK, LW * 0.9);
      for (const dx of [-4.5, 4.5]) { circle(g, 70 + dx, 34, 3); paint(g, '#1b1410', null); }
    },
  },
  {
    id: 'cactus', name: 'Cactus', cat: 'nature', sets: ['desert'], tags: ['cactus', 'saguaro', 'prickly pear', 'desert', 'spines'],
    w: 1, h: 1, blocksMovement: true, c: { plant: '#5a8a4a', flower: '#e85d75' },
    variants: [{ name: 'Tall saguaro', c: {}, f: { kind: 0 } }, { name: 'Barrel', c: { plant: '#6a9a52', flower: '#f2b84b' }, f: { kind: 1 } }, { name: 'Prickly pear', c: { plant: '#6f9a4a', flower: '#c0392b' }, f: { kind: 2 } }],
    desc: 'A spiny cactus. Touching it hurts.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed), k = f.kind ?? 0;
      const ribbed = (x: number, y: number, s: number, ribs: number) => {
        circle(g, x, y, s);
        paint(g, domeFill(g, x, y, s, c.plant, 0.4), INK, LW * 0.9);
        for (let i = 0; i < ribs; i++) { const a = (i / ribs) * TAU; line(g, x + Math.cos(a) * s * 0.25, y + Math.sin(a) * s * 0.25, x + Math.cos(a) * s * 0.95, y + Math.sin(a) * s * 0.95, alpha(shade(c.plant, -0.5), 0.6), 1); }
        for (let i = 0; i < ribs; i++) { const a = ((i + 0.5) / ribs) * TAU; circle(g, x + Math.cos(a) * s * 0.7, y + Math.sin(a) * s * 0.7, 0.9); paint(g, '#f4ecd8', null); }
      };
      if (k === 0) {
        for (const [a, d] of [[-0.5, 32], [2.5, 30]]) {
          const x = 50 + Math.cos(a) * d, y = 50 + Math.sin(a) * d;
          cord(g, [[50, 50], [x, y]], c.plant, 14, false, LW);
          ribbed(x, y, 13, 8);
        }
        ribbed(50, 50, 25, 14);
        for (let i = 0; i < 3; i++) { circle(g, 50 + (i - 1) * 7, 46 + (i % 2) * 5, 3.4); paint(g, c.flower, INK, 0.8); }
      } else if (k === 1) {
        ribbed(50, 52, 30, 16);
        for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; circle(g, 50 + Math.cos(a) * 6, 52 + Math.sin(a) * 6, 4); paint(g, c.flower, INK, 0.8); }
      } else {
        const pads: number[][] = [[48, 58, 0.2], [30, 40, -0.7], [66, 36, 0.6], [70, 72, 1.3], [32, 74, -1.2]];
        for (const [x, y, a] of pads) {
          ellipse(g, x, y, 17, 12, a);
          paint(g, domeFill(g, x, y, 17, shade(c.plant, (r() - 0.5) * 0.2), 0.35), INK, LW * 0.8);
          for (let i = 0; i < 5; i++) { circle(g, x + (r() - 0.5) * 20, y + (r() - 0.5) * 14, 1); paint(g, '#f4ecd8', null); }
          if (r() < 0.6) { circle(g, x + Math.cos(a) * 15, y + Math.sin(a) * 10, 3.6); paint(g, domeFill(g, x, y, 3, c.flower, 0.4), INK, 0.8); }
        }
      }
    },
  },
  {
    id: 'desert-rocks', name: 'Sandstone rocks', cat: 'terrain', sets: ['desert', 'cave', 'forest'], tags: ['rocks', 'outcrop', 'mesa', 'sandstone', 'cover', 'boulders'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { rock: '#c08a5a' }, variants: [{ name: 'Red sandstone', c: {} }, { name: 'Pale', c: { rock: '#d8c09a' } }, { name: 'Dark basalt', c: { rock: '#4e4b48' } }],
    desc: 'Wind-carved sandstone with layered bands. Full cover.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const slab = (x: number, y: number, rx: number, ry: number) => {
        const pts = lumpy(x, y, rx, 0.25, 10, r, ry);
        blob(g, pts);
        paint(g, domeFill(g, x, y, Math.max(rx, ry), c.rock, 0.3), INK, LW);
        g.save(); blob(g, pts); g.clip();
        for (let k = 1; k < 4; k++) { blob(g, lumpy(x - k * 2, y - k * 2, rx * (1 - k * 0.22), 0.25, 10, r, ry * (1 - k * 0.22))); g.strokeStyle = alpha(shade(c.rock, k % 2 ? 0.25 : -0.35), 0.7); g.lineWidth = 1.6; g.stroke(); }
        g.restore();
      };
      slab(136, 140, 44, 38);
      slab(52, 128, 34, 30);
      slab(92, 74, 66, 54);
      rocks(g, 160, 50, 14, 4, 5, 9, c.rock, r);
      void w; void h;
    },
  },
  {
    id: 'sand-ripples', name: 'Sand ripples', cat: 'terrain', sets: ['desert', 'ship'], tags: ['sand', 'dune', 'ripples', 'beach', 'wind'],
    w: 2, h: 2, layer: 'floor', flat: true, c: { sand: '#e0c890' }, variants: [{ name: 'Golden', c: {} }, { name: 'Pale beach', c: { sand: '#efe2c2' } }, { name: 'Red', c: { sand: '#d49a6a' } }],
    desc: 'Wind ripples in loose sand. Purely decorative.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(w / 2, h / 2, 90, 0.18, 12, r));
      paint(g, alpha(c.sand, 0.55), null);
      g.save();
      blob(g, lumpy(w / 2, h / 2, 90, 0.0, 12, r));
      g.clip();
      for (let i = 0; i < 12; i++) {
        const y0 = 16 + i * 15 + r() * 4, ph = r() * 6;
        g.beginPath();
        for (let x = 0; x <= w; x += 8) { const y = y0 + Math.sin(x * 0.035 + ph) * 6; x ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.strokeStyle = alpha(shade(c.sand, -0.45), 0.85); g.lineWidth = 2.4; g.stroke();
        g.translate(0, -2.5);
        g.strokeStyle = alpha(shade(c.sand, 0.45), 0.85); g.lineWidth = 1.6; g.stroke();
        g.translate(0, 2);
      }
      g.restore();
    },
  },
  {
    id: 'oasis-pool', name: 'Oasis pool', cat: 'terrain', sets: ['desert', 'forest', 'camp'], tags: ['oasis', 'pool', 'water', 'spring', 'pond'],
    w: 2, h: 2, layer: 'floor', c: { water: '#3d8aa0', sand: '#d8bf8a', grass: '#6f9a3e' },
    variants: [{ name: 'Desert oasis', c: {} }, { name: 'Forest pond', c: { water: '#3d6a72', sand: '#7a6a4a', grass: '#4f7a34' } }, { name: 'Murky', c: { water: '#4a6a4a', sand: '#6b5a40', grass: '#5f7a48' } }],
    desc: 'A small pool of fresh water ringed with grass.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(w / 2, h / 2, 82, 0.2, 12, r, 74));
      paint(g, alpha(c.sand, 0.9), alpha(INK, 0.4), 1.2);
      blob(g, lumpy(w / 2, h / 2, 66, 0.22, 12, r, 58));
      paint(g, '#1e2e33', INK, 1.4);
      liquid(g, w / 2, h / 2, 60, 52, c.water, r);
      for (let i = 0; i < 9; i++) { const a = r() * TAU; tuft(g, w / 2 + Math.cos(a) * 72, h / 2 + Math.sin(a) * 64, 12, c.grass, r); }
    },
  },
  {
    id: 'skull-bleached', name: 'Bleached skull', cat: 'decor', sets: ['desert', 'swamp', 'cave', 'farm'], tags: ['skull', 'horns', 'bones', 'cattle', 'beast', 'warning'],
    w: 1, h: 1, c: { bone: '#ece4cf' }, variants: [{ name: 'Bleached', c: {} }, { name: 'Old yellowed', c: { bone: '#d6c69a' } }, { name: 'Blackened', c: { bone: '#7a7266' } }],
    desc: 'The horned skull of some large beast, sun-bleached.',
    draw: ({ g, c }) => {
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(50 + s * 14, 34);
        g.bezierCurveTo(50 + s * 34, 30, 50 + s * 44, 18, 50 + s * 40, 6);
        inked(g, shade(c.bone, -0.08), 6, 2.2);
      }
      g.beginPath();
      g.moveTo(32, 32); g.bezierCurveTo(32, 18, 68, 18, 68, 32);
      g.bezierCurveTo(70, 48, 62, 54, 60, 76); g.quadraticCurveTo(50, 90, 40, 76);
      g.bezierCurveTo(38, 54, 30, 48, 32, 32);
      g.closePath();
      paint(g, litFill(g, 30, 18, 40, 72, c.bone, 0.3), INK, LW);
      for (const s of [-1, 1]) { ellipse(g, 50 + s * 9, 42, 5.5, 7, s * 0.3); paint(g, '#1b1410', null); }
      for (const s of [-1, 1]) { ellipse(g, 50 + s * 3, 76, 2, 3.4); paint(g, '#1b1410', null); }
      line(g, 50, 24, 50, 34, alpha(shade(c.bone, -0.5), 0.7), 1);
    },
  },
  {
    id: 'giant-ribcage', name: 'Giant ribcage', cat: 'decor', sets: ['desert', 'swamp', 'cave', 'winter'], tags: ['bones', 'skeleton', 'dragon bones', 'remains', 'ribs', 'carcass', 'landmark'],
    w: 3, h: 2, c: { bone: '#e3dac4' }, variants: [{ name: 'Bleached', c: {} }, { name: 'Old yellowed', c: { bone: '#d0bf92' } }, { name: 'Dark', c: { bone: '#8a8070' } }],
    desc: 'The ribs of something enormous. A landmark, with cover between the ribs.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 7; i++) {
        const x = 60 + i * 30, s = 1 - Math.abs(i - 2.5) * 0.12;
        for (const d of [-1, 1]) {
          g.beginPath();
          g.moveTo(x, h / 2);
          g.bezierCurveTo(x + 22 * s, h / 2 + d * 30, x + 30 * s, h / 2 + d * 70 * s, x + 6, h / 2 + d * 86 * s);
          inked(g, shade(c.bone, (r() - 0.5) * 0.1), 6.5, 2.4);
        }
      }
      for (let i = 0; i < 9; i++) { const x = 40 + i * 27; rr(g, x, h / 2 - 7, 22, 14, 5); paint(g, litFill(g, x, h / 2 - 7, 22, 14, c.bone, 0.3), INK, 1.6); }
      g.beginPath();
      g.moveTo(8, h / 2); g.bezierCurveTo(10, h / 2 - 26, 46, h / 2 - 22, 44, h / 2); g.bezierCurveTo(46, h / 2 + 22, 10, h / 2 + 26, 8, h / 2);
      paint(g, litFill(g, 8, h / 2 - 24, 38, 48, c.bone, 0.3), INK, LW);
      for (const d of [-1, 1]) { ellipse(g, 30, h / 2 + d * 9, 5, 3.4); paint(g, '#1b1410', null); }
    },
  },
];

// ======================= WINTER =======================
const WINTER: ObjDef[] = [
  {
    id: 'snowdrift', name: 'Snowdrift', cat: 'terrain', sets: ['winter'], tags: ['snow', 'drift', 'deep snow', 'difficult', 'bank'],
    w: 2, h: 2, difficult: true, c: { snow: SNOW }, variants: [{ name: 'Fresh', c: {} }, { name: 'Dirty', c: { snow: '#d8d4cc' } }, { name: 'Blue dusk', c: { snow: '#d8e4f0' } }],
    desc: 'Deep heaped snow. Difficult terrain.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (const [x, y, s] of [[70, 120, 56], [130, 80, 60], [110, 140, 44], [60, 64, 40]]) {
        blob(g, lumpy(x, y, s, 0.28, 11, r, s * 0.82));
        const gr = g.createRadialGradient(x - s * 0.4, y - s * 0.4, 2, x, y, s * 1.1);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, c.snow); gr.addColorStop(1, mix(c.snow, '#7a9ab8', 0.45));
        paint(g, gr, alpha('#3a4a5a', 0.7), 1.6);
      }
      speckle(g, 20, 20, w - 40, h - 40, r, 30, 'rgba(255,255,255,0.9)', 1.1);
    },
  },
  {
    id: 'frozen-pond', name: 'Frozen pond', cat: 'terrain', sets: ['winter', 'forest'], tags: ['ice', 'frozen', 'pond', 'lake', 'slippery', 'thin ice'],
    w: 2, h: 2, layer: 'floor', flat: true, c: { ice: ICE },
    variants: [{ name: 'Solid', c: {} }, { name: 'Cracked', c: {}, f: { crack: 1 } }, { name: 'Broken hole', c: {}, f: { crack: 1, hole: 1 } }],
    desc: 'A pond frozen over. Slippery; the GM may call for checks. Thin ice may break.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      blob(g, lumpy(cx, cy, 86, 0.18, 13, r, 76));
      paint(g, alpha(SNOW, 0.95), alpha('#3a4a5a', 0.6), 1.4);
      const pts = lumpy(cx, cy, 72, 0.2, 12, r, 62);
      blob(g, pts);
      const gr = g.createLinearGradient(cx - 70, cy - 60, cx + 70, cy + 60);
      gr.addColorStop(0, shade(c.ice, 0.35)); gr.addColorStop(0.5, c.ice); gr.addColorStop(1, shade(c.ice, -0.25));
      paint(g, gr, alpha('#2a4a5a', 0.8), 1.4);
      g.save(); blob(g, pts); g.clip();
      for (let i = 0; i < 4; i++) line(g, cx - 60 + i * 30, cy - 50, cx - 20 + i * 30, cy - 70, 'rgba(255,255,255,0.45)', 3);
      if (f.crack) {
        g.strokeStyle = alpha('#ffffff', 0.85); g.lineWidth = 1.2;
        for (let i = 0; i < 7; i++) {
          let x = cx + 10, y = cy + 6;
          const a = (i / 7) * TAU + r() * 0.4;
          g.beginPath(); g.moveTo(x, y);
          for (let k = 0; k < 5; k++) { x += Math.cos(a + (r() - 0.5) * 0.9) * 14; y += Math.sin(a + (r() - 0.5) * 0.9) * 14; g.lineTo(x, y); }
          g.stroke();
        }
      }
      if (f.hole) { blob(g, lumpy(cx + 10, cy + 6, 20, 0.35, 9, r)); paint(g, '#1d3a4a', '#ffffff', 2); }
      g.restore();
      for (let i = 0; i < 5; i++) { const a = r() * TAU; blob(g, lumpy(cx + Math.cos(a) * 58, cy + Math.sin(a) * 50, 10 + r() * 8, 0.4, 8, r)); paint(g, alpha(SNOW, 0.9), null); }
    },
  },
  {
    id: 'ice-block', name: 'Ice block', cat: 'terrain', sets: ['winter', 'cave'], tags: ['ice', 'frozen', 'block', 'glacier', 'cover', 'trapped'],
    w: 1, h: 1, blocksMovement: true, c: { ice: ICE }, variants: [{ name: 'Clear', c: {} }, { name: 'Deep blue', c: { ice: '#6fb0d6' } }, { name: 'Something frozen inside', c: {}, f: { inside: 1 } }],
    desc: 'A great block of ice. Something may be frozen within.',
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const pts = [[14, 20], [74, 10], [90, 66], [30, 90]];
      poly(g, pts);
      const gr = g.createLinearGradient(14, 10, 90, 90);
      gr.addColorStop(0, alpha(shade(c.ice, 0.5), 0.95)); gr.addColorStop(0.5, alpha(c.ice, 0.88)); gr.addColorStop(1, alpha(shade(c.ice, -0.3), 0.95));
      paint(g, gr, '#2a4a5a', LW);
      if (f.inside) { ellipse(g, 52, 52, 16, 11, 0.4); paint(g, alpha('#3a2a3a', 0.45), null); circle(g, 42, 46, 6); paint(g, alpha('#3a2a3a', 0.4), null); }
      poly(g, [[22, 26], [70, 18], [80, 60], [34, 80]]);
      g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1.2; g.stroke();
      for (let i = 0; i < 3; i++) { const x = 30 + r() * 40, y = 30 + r() * 40; line(g, x, y, x + 8 + r() * 10, y + (r() - 0.5) * 14, 'rgba(255,255,255,0.7)', 1); }
      line(g, 20, 24, 70, 15, 'rgba(255,255,255,0.8)', 2);
    },
  },
  {
    id: 'snowman', name: 'Snowman', cat: 'decor', sets: ['winter', 'town'], tags: ['snowman', 'snow', 'winter', 'festival', 'decoy'],
    w: 1, h: 1, blocksMovement: true, c: { scarf: '#a3312c' }, variants: [{ name: 'Red scarf', c: {} }, { name: 'Green scarf', c: { scarf: '#3e6b3a' } }, { name: 'Top hat', c: { scarf: '#2f5d8a' }, f: { hat: 1 } }],
    desc: 'Just a snowman. Probably.',
    draw: ({ g, c, f }) => {
      for (const s of [-1, 1]) cord(g, [[50 + s * 20, 46], [50 + s * 36, 40], [50 + s * 44, 30]], '#5a3d24', 2.2, false, 1.6);
      for (const [rad, cy] of [[38, 54], [27, 50], [18, 46]]) {
        circle(g, 50, cy, rad);
        const gr = g.createRadialGradient(50 - rad * 0.4, cy - rad * 0.4, 1, 50, cy, rad * 1.05);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.65, SNOW); gr.addColorStop(1, '#a8bccf');
        paint(g, gr, '#3a4a5a', 1.6);
      }
      circle(g, 50, 46, 19.5);
      g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
      g.strokeStyle = c.scarf; g.lineWidth = 4; g.stroke();
      if (f.hat) { circle(g, 50, 44, 14); paint(g, domeFill(g, 50, 44, 14, '#26262a', 0.35), INK, LW); circle(g, 50, 44, 9); paint(g, domeFill(g, 50, 44, 9, '#33333a', 0.4), INK, 1); return; }
      for (const dx of [-6, 6]) { circle(g, 50 + dx, 42, 2.2); paint(g, '#1b1410', null); }
      poly(g, [[47, 48], [53, 48], [50, 66]]);
      paint(g, '#e8792a', INK, 1);
    },
  },
  {
    id: 'igloo', name: 'Igloo', cat: 'structure', sets: ['winter'], tags: ['igloo', 'snow house', 'shelter', 'ice', 'dome'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { snow: SNOW }, variants: [{ name: 'Snow blocks', c: {} }, { name: 'Ice blocks', c: { snow: '#cfe6f2' } }],
    desc: 'A dome house of snow blocks, entrance tunnel at the bottom.',
    draw: ({ g, w, h, c }) => {
      const cx = w / 2, cy = h / 2 - 10, R = 74;
      rr(g, cx - 24, cy + 50, 48, 56, 18);
      paint(g, litFill(g, cx - 24, cy + 50, 48, 56, c.snow, 0.15), '#3a4a5a', LW);
      for (const y of [cy + 70, cy + 88]) line(g, cx - 23, y, cx + 23, y, alpha('#6a8aa8', 0.7), 1.2);
      circle(g, cx, cy, R);
      const gr = g.createRadialGradient(cx - R * 0.4, cy - R * 0.4, 2, cx, cy, R * 1.05);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, c.snow); gr.addColorStop(1, '#9ab3c9');
      paint(g, gr, '#3a4a5a', LW * 1.1);
      g.save(); circle(g, cx, cy, R); g.clip();
      g.strokeStyle = alpha('#6a8aa8', 0.75); g.lineWidth = 1.3;
      const rings = [0.25, 0.45, 0.63, 0.8, 0.94];
      for (const k of rings) { circle(g, cx, cy, R * k); g.stroke(); }
      for (let i = 0; i < rings.length; i++) {
        const r0 = R * (i ? rings[i - 1] : 0.08), r1 = R * rings[i], n = 5 + i * 4;
        for (let j = 0; j < n; j++) { const a = (j / n) * TAU + i * 0.3; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke(); }
      }
      g.restore();
      ellipse(g, cx, cy + 100, 14, 6);
      paint(g, '#1d2a35', null);
    },
  },
];

export const OUTDOOR_OBJECTS: ObjDef[] = [...NATURE, ...ROAD, ...SHIP, ...CAMP, ...FARM, ...UNDER, ...WILDS, ...WINTER];

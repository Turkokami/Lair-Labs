// A third batch of outdoor objects for Lair Labs: farm and village pieces (orchard trees, a watermill, a dovecote,
// a kiln, pens and patches), the coast (lighthouse, fishing hut, wreck, sea stacks, tide pools), the swamp (stilt hut,
// boardwalk, mangroves, will-o'-wisps), winter (ice spikes, yurt, sled), the desert (adobe house, rock arch, broken
// columns, dunes), the wild (barrow, fairy ring, mausoleum, cave mouth, totem, roundhouse) and the alien (monolith,
// crater, crystal tree). Original art drawn in code with the Canvas 2D API, in the library's top-down style:
// light from the top-left, ink outline, soft shading.
import type { G, ObjDef } from '../art/types';
import { rng, circle, ellipse, rr, poly, blob, lumpy, paint, line, domeFill, litFill, speckle, stone, blocks, planks, foliage, tuft, glow, liquid, shade, alpha, INK, LW, STONE, CLOTH } from '../art/kit';
import { ROOF, houseDef, hipRoof, gableRoof, chimney, logEnd, canopyShadow, trunkRoots, stoneCourse } from './outdoors2';

type Rand = () => number;
const TAU = Math.PI * 2;

/** A spoked wheel seen edge-on from above: a long box with paddles. */
function paddleWheel(g: G, x: number, y: number, w: number, h: number, wood: string) {
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(x + 4, y + 5, w, h);
  rr(g, x, y, w, h, 3);
  paint(g, litFill(g, x, y, w, h, wood, 0.25), INK, 1.8);
  for (let yy = y + 6; yy < y + h - 2; yy += 9) line(g, x + 2, yy, x + w - 2, yy, alpha(shade(wood, -0.5), 0.8), 1.4);
  line(g, x - 6, y + h / 2, x + w + 6, y + h / 2, INK, 4);
}

/** A ring of small fence posts and rails round a rectangle. gap: leave a gate on the bottom edge. */
function fenceRect(g: G, x: number, y: number, w: number, h: number, wood: string, gap = true) {
  const rail = (x1: number, y1: number, x2: number, y2: number) => {
    line(g, x1, y1, x2, y2, INK, 5);
    line(g, x1, y1, x2, y2, wood, 3);
  };
  rail(x, y, x + w, y); rail(x, y, x, y + h); rail(x + w, y, x + w, y + h);
  if (gap) { rail(x, y + h, x + w * 0.4, y + h); rail(x + w * 0.6, y + h, x + w, y + h); } else rail(x, y + h, x + w, y + h);
  for (let t = 0; t <= 1.001; t += 0.25) {
    for (const [px, py] of [[x + w * t, y], [x + w * t, y + h], [x, y + h * t], [x + w, y + h * t]]) {
      rr(g, px - 4, py - 4, 8, 8, 2);
      paint(g, shade(wood, -0.1), INK, 1.2);
    }
  }
}

/** A round thatched or hide roof seen from above, with a smoke hole or a finial. */
function coneRoof(g: G, cx: number, cy: number, rad: number, base: string, r: Rand, rays = 28, hole = true) {
  g.fillStyle = 'rgba(0,0,0,0.25)';
  circle(g, cx + 6, cy + 8, rad);
  g.fill();
  circle(g, cx, cy, rad);
  paint(g, domeFill(g, cx, cy, rad, base, 0.28), INK, LW);
  g.strokeStyle = alpha(shade(base, -0.45), 0.5);
  g.lineWidth = 1;
  g.beginPath();
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * TAU + r() * 0.05;
    g.moveTo(cx + Math.cos(a) * rad * 0.15, cy + Math.sin(a) * rad * 0.15);
    g.lineTo(cx + Math.cos(a) * rad * 0.97, cy + Math.sin(a) * rad * 0.97);
  }
  g.stroke();
  for (const f of [0.45, 0.75]) { circle(g, cx, cy, rad * f); paint(g, 'rgba(0,0,0,0)', alpha(shade(base, -0.4), 0.45), 1.2); }
  circle(g, cx, cy, rad * 0.12);
  paint(g, hole ? '#1d1916' : shade(base, -0.3), INK, 1.4);
}

/** A rock seen from above with a lit top. */
function rock(g: G, cx: number, cy: number, rad: number, base: string, r: Rand, ry = rad) {
  g.fillStyle = 'rgba(0,0,0,0.28)';
  blob(g, lumpy(cx + rad * 0.2, cy + ry * 0.25, rad, 0.3, 9, r, ry));
  g.fill();
  blob(g, lumpy(cx, cy, rad, 0.3, 9, r, ry));
  paint(g, domeFill(g, cx, cy, Math.max(rad, ry), base, 0.32), INK, LW);
  blob(g, lumpy(cx - rad * 0.2, cy - ry * 0.25, rad * 0.45, 0.4, 7, r, ry * 0.45));
  paint(g, alpha(shade(base, 0.25), 0.5), null);
}

/** Water seen from above, a soft rounded pool. */
function pool(g: G, cx: number, cy: number, rx: number, ry: number, color: string, r: Rand) {
  blob(g, lumpy(cx, cy, rx, 0.25, 12, r, ry));
  paint(g, color, INK, 1.8);
  for (let i = 0; i < 3; i++) {
    ellipse(g, cx - rx * 0.2 + (r() - 0.5) * rx * 0.6, cy - ry * 0.2 + (r() - 0.5) * ry * 0.5, rx * 0.25, ry * 0.08);
    paint(g, alpha('#ffffff', 0.18), null);
  }
}

/** Several glowing motes. */
function motes(g: G, cx: number, cy: number, spread: number, n: number, color: string, r: Rand) {
  for (let i = 0; i < n; i++) {
    const x = cx + (r() - 0.5) * spread, y = cy + (r() - 0.5) * spread, s = 4 + r() * 5;
    glow(g, x, y, s * 4, color, 0.45);
    circle(g, x, y, s);
    paint(g, shade(color, 0.5), alpha(shade(color, -0.3), 0.8), 1);
  }
}

export const OUTDOOR3_OBJECTS: ObjDef[] = [
  // ---------- farm and village ----------
  {
    id: 'tree-fruit', name: 'Fruit tree', cat: 'nature', sets: ['farm', 'town', 'forest'], tags: ['orchard', 'apple', 'pear', 'tree', 'garden'],
    w: 2, h: 2, layer: 'overhead', c: { leaf: '#4d7a36', fruit: '#c23a2a', trunk: '#5a3d24' },
    variants: [{ name: 'Apple', c: {} }, { name: 'Pear', c: { fruit: '#d8c24a' } }, { name: 'Blossom', c: { leaf: '#6f8f4a', fruit: '#f2b8cc' } }, { name: 'Lemon', c: { fruit: '#efd84a', leaf: '#3f6e34' } }],
    desc: 'A small orchard tree hung with fruit. Line them up in rows for an orchard.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      canopyShadow(g, cx, cy, 78);
      trunkRoots(g, cx, cy, 30, c.trunk, r, 4);
      foliage(g, cx, cy, 74, c.leaf, r, 10);
      for (let i = 0; i < 14; i++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 62, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
        circle(g, x, y, 5 + r() * 2);
        paint(g, domeFill(g, x, y, 6, c.fruit, 0.4), alpha(INK, 0.8), 1);
      }
    },
  },
  houseDef({
    id: 'watermill', name: 'Watermill', w: 3, h: 3, roof: 'gable', style: 'shingle', chimney: [[0.25, 0.22]], sets: ['farm', 'town'],
    tags: ['mill', 'water wheel', 'millstream', 'grain'], desc: 'A mill house with a big wheel on the right side. Put it beside a stream.',
    extra: (g, w, h, c, r) => { void c; void r; paddleWheel(g, w - 16, h * 0.22, 22, h * 0.52, '#7a5634'); },
  }),
  {
    id: 'dovecote', name: 'Dovecote', cat: 'structure', sets: ['farm', 'town', 'castle'], tags: ['pigeons', 'doves', 'birds', 'tower'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { wall: '#d8ccb0', roof: ROOF.tile },
    variants: [{ name: 'Tile roof', c: {} }, { name: 'Slate roof', c: { roof: ROOF.slate } }, { name: 'Thatch', c: { roof: ROOF.thatch } }],
    desc: 'A little round tower full of nesting holes for doves.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      circle(g, w / 2, h / 2, 42);
      paint(g, c.wall, INK, LW);
      coneRoof(g, w / 2, h / 2, 38, c.roof, r, 20, false);
      for (let i = 0; i < 3; i++) { circle(g, w / 2 + 14 - i * 9, h / 2 - 10 + i * 6, 4); paint(g, '#e8e4dc', INK, 1); }
    },
  },
  {
    id: 'kiln', name: 'Kiln', cat: 'workshop', sets: ['farm', 'town', 'camp'], tags: ['pottery', 'bricks', 'oven', 'furnace', 'charcoal'],
    w: 2, h: 2, blocksMovement: true, c: { clay: '#a8684a' }, light: { bright: 5, dim: 10, color: '#ff9a3c' },
    desc: 'A domed clay kiln with a glowing fire mouth at the front.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2 - 6;
      g.fillStyle = 'rgba(0,0,0,0.28)';
      circle(g, cx + 8, cy + 10, 72); g.fill();
      circle(g, cx, cy, 72);
      paint(g, domeFill(g, cx, cy, 72, c.clay, 0.35), INK, LW);
      speckle(g, cx - 60, cy - 60, 120, 120, r, 40, alpha(shade(c.clay, -0.4), 0.5), 1.6);
      circle(g, cx, cy, 16);
      paint(g, '#2a201a', INK, 1.6);
      rr(g, cx - 22, cy + 62, 44, 30, 6);
      paint(g, '#3a2418', INK, 1.8);
      glow(g, cx, cy + 78, 34, '#ff8a2a', 0.6);
      ellipse(g, cx, cy + 80, 14, 7);
      paint(g, '#ffb02e', null);
    },
  },
  {
    id: 'pumpkin-patch', name: 'Vegetable patch', cat: 'nature', sets: ['farm', 'town'], tags: ['pumpkins', 'cabbages', 'garden', 'crops', 'harvest'],
    w: 2, h: 2, layer: 'floor', difficult: true, c: { soil: '#5a4030', crop: '#e0822a', leaf: '#4f7a34' },
    variants: [{ name: 'Pumpkins', c: {} }, { name: 'Cabbages', c: { crop: '#9cc070' } }, { name: 'Squash', c: { crop: '#e2c04a' } }],
    desc: 'Tilled ground with a crop ready for picking. Difficult terrain to cross.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      rr(g, 8, 8, w - 16, h - 16, 10);
      paint(g, litFill(g, 8, 8, w - 16, h - 16, c.soil, 0.15), alpha(INK, 0.7), 1.6);
      for (let y = 30; y < h - 15; y += 45) {
        line(g, 16, y + 14, w - 16, y + 14, alpha(shade(c.soil, -0.4), 0.7), 3);
        for (let x = 30; x < w - 15; x += 38) {
          const px = x + (r() - 0.5) * 8, py = y + (r() - 0.5) * 6;
          for (let i = 0; i < 3; i++) { ellipse(g, px + (r() - 0.5) * 22, py + (r() - 0.5) * 16, 9, 5, r() * TAU); paint(g, c.leaf, alpha(INK, 0.6), 1); }
          circle(g, px, py, 11 + r() * 3);
          paint(g, domeFill(g, px, py, 12, c.crop, 0.35), INK, 1.4);
        }
      }
    },
  },
  {
    id: 'animal-pen', name: 'Animal pen', cat: 'structure', sets: ['farm', 'town', 'camp'], tags: ['pig sty', 'sheep fold', 'goats', 'corral', 'livestock', 'fence'],
    w: 3, h: 3, layer: 'floor', c: { wood: '#8a6a48', ground: '#6a5236' },
    variants: [{ name: 'Muddy', c: {} }, { name: 'Straw', c: { ground: '#b89a5a' } }, { name: 'Grass', c: { ground: '#6a8a44' } }],
    desc: 'A fenced pen with a feed trough and a gate on the bottom edge.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(w / 2, h / 2, w * 0.42, 0.15, 14, r));
      paint(g, alpha(c.ground, 0.85), null);
      speckle(g, 20, 20, w - 40, h - 40, r, 60, alpha(shade(c.ground, -0.35), 0.5), 2.2);
      rr(g, 40, 30, 90, 22, 4);
      paint(g, litFill(g, 40, 30, 90, 22, '#7a5634'), INK, 1.6);
      rr(g, 46, 35, 78, 12, 2);
      paint(g, '#4a6a7a', null);
      fenceRect(g, 14, 14, w - 28, h - 28, c.wood, true);
    },
  },
  {
    id: 'smithy-shed', name: 'Smithy shed', cat: 'workshop', sets: ['town', 'farm', 'camp', 'castle'], tags: ['blacksmith', 'forge', 'anvil', 'open shed', 'workshop'],
    w: 3, h: 2, blocksSight: false, c: { roof: ROOF.shingle, wood: '#6b4428' }, light: { bright: 10, dim: 20, color: '#ff8a3c' },
    variants: [{ name: 'Shingle', c: {} }, { name: 'Thatch', c: { roof: ROOF.thatch } }, { name: 'Slate', c: { roof: ROOF.slate } }],
    desc: 'An open-sided forge shed on four posts: forge, anvil and quench barrel under one roof.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      gableRoof(g, 8, 6, w - 16, h - 22, c.roof, c.roof === ROOF.thatch ? 'thatch' : c.roof === ROOF.slate ? 'slate' : 'shingle', r);
      chimney(g, 30, 22, 22);
      for (const [x, y] of [[12, h - 22], [w - 22, h - 22]]) { rr(g, x, y, 10, 14, 2); paint(g, c.wood, INK, 1.4); }
    },
  },
  {
    id: 'granary', name: 'Granary', cat: 'structure', sets: ['farm', 'town'], tags: ['grain store', 'barn', 'stilts', 'storehouse'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, solid: true, c: { roof: ROOF.thatch, wall: '#9a7a52' },
    variants: [{ name: 'Thatch', c: {} }, { name: 'Shingle', c: { roof: ROOF.shingle } }],
    desc: 'A small store raised on stone mushrooms to keep the rats out.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (const [x, y] of [[18, 18], [w - 18, 18], [18, h - 18], [w - 18, h - 18]]) { circle(g, x + 4, y + 6, 12); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fill(); }
      hipRoof(g, 10, 8, w - 20, h - 22, c.roof, c.roof === ROOF.thatch ? 'thatch' : 'shingle', r);
    },
  },

  // ---------- coast ----------
  {
    id: 'lighthouse', name: 'Lighthouse', cat: 'structure', sets: ['ship', 'town'], tags: ['beacon', 'harbour', 'coast', 'tower', 'lamp'],
    w: 3, h: 3, blocksMovement: true, blocksSight: true, solid: true, c: { wall: '#e6e0d2', band: '#a3312c', roof: '#33373c' }, light: { bright: 30, dim: 60, color: '#ffd27a' },
    variants: [{ name: 'Red bands', c: {} }, { name: 'Black bands', c: { band: '#2b2b30' } }, { name: 'Plain stone', c: { wall: '#9a9286', band: '#8a8278' } }],
    desc: 'A tall banded tower with a lamp room on top. Its light reaches far out to sea.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      g.fillStyle = 'rgba(0,0,0,0.3)';
      circle(g, cx + 14, cy + 18, 112); g.fill();
      circle(g, cx, cy, 112);
      paint(g, domeFill(g, cx, cy, 112, '#8a8780', 0.2), INK, LW);
      g.save(); circle(g, cx, cy, 110); g.clip();
      blocks(g, cx - 110, cy - 110, 220, 220, '#8a8780', r, 26, 16);
      g.restore();
      circle(g, cx, cy, 82);
      paint(g, domeFill(g, cx, cy, 82, c.wall, 0.3), INK, LW);
      circle(g, cx, cy, 62);
      paint(g, 'rgba(0,0,0,0)', c.band, 9);
      glow(g, cx, cy, 70, '#ffd27a', 0.55);
      circle(g, cx, cy, 34);
      paint(g, domeFill(g, cx, cy, 34, c.roof, 0.4), INK, 2);
      circle(g, cx, cy, 6);
      paint(g, '#d4a640', INK, 1.2);
    },
  },
  {
    id: 'fishing-hut', name: 'Fishing hut', cat: 'structure', sets: ['ship', 'swamp', 'town'], tags: ['shack', 'fisher', 'nets', 'stilts', 'shore'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, solid: true, c: { roof: ROOF.thatch, wood: '#7a6448' },
    variants: [{ name: 'Thatch', c: {} }, { name: 'Shingle', c: { roof: ROOF.shingle } }],
    desc: 'A weathered shack on stilts with nets drying on the porch at the front.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      planks(g, 14, h - 46, w - 28, 36, c.wood, r, 'v', 6);
      rr(g, 14, h - 46, w - 28, 36, 2); paint(g, 'rgba(0,0,0,0)', INK, 1.6);
      g.strokeStyle = alpha('#d9cdb0', 0.7); g.lineWidth = 1;
      for (let i = 0; i < 6; i++) line(g, 40 + i * 8, h - 40, 34 + i * 10, h - 16, alpha('#d9cdb0', 0.7), 1);
      gableRoof(g, 12, 10, w - 24, h - 66, c.roof, c.roof === ROOF.thatch ? 'thatch' : 'shingle', r);
    },
  },
  {
    id: 'shipwreck', name: 'Shipwreck', cat: 'vehicle', sets: ['ship'], tags: ['wreck', 'hull', 'beached', 'ship', 'ruin', 'coast'],
    w: 4, h: 2, blocksMovement: true, c: { wood: '#5a4232' },
    desc: 'The broken hull of a ship lying on its side, ribs showing where the planks have gone.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      const hull = [[30, h / 2], [80, 22], [w - 60, 18], [w - 14, h / 2 - 6], [w - 50, h - 20], [90, h - 24]];
      g.fillStyle = 'rgba(0,0,0,0.3)';
      blob(g, hull.map(([x, y]) => [x + 8, y + 10])); g.fill();
      blob(g, hull);
      paint(g, litFill(g, 30, 18, w - 44, h - 36, c.wood, 0.2), INK, LW);
      g.save(); blob(g, hull); g.clip();
      for (let x = 70; x < w - 40; x += 22) {
        const broken = r() < 0.4;
        line(g, x, 20, x + 6, h - 20, broken ? alpha('#1d1612', 0.8) : alpha(shade(c.wood, 0.35), 0.8), broken ? 12 : 4);
      }
      g.restore();
      line(g, 120, h / 2, w - 30, h / 2 - 30, INK, 9);
      line(g, 120, h / 2, w - 30, h / 2 - 30, shade(c.wood, 0.2), 6);
    },
  },
  {
    id: 'sea-stack', name: 'Sea stack', cat: 'terrain', sets: ['ship'], tags: ['rock pillar', 'stack', 'coast', 'seabirds', 'cliff'],
    w: 2, h: 2, blocksMovement: true, blocksSight: true, c: { stone: '#7a746a', top: '#6a8a44' },
    desc: 'A pillar of rock standing in the surf, grass and nests on its top.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      rock(g, w / 2, h / 2, 82, c.stone, r);
      blob(g, lumpy(w / 2 - 6, h / 2 - 8, 46, 0.35, 10, r));
      paint(g, domeFill(g, w / 2 - 6, h / 2 - 8, 46, c.top, 0.3), alpha(INK, 0.7), 1.4);
      for (let i = 0; i < 3; i++) { circle(g, w / 2 + (r() - 0.5) * 50, h / 2 + (r() - 0.5) * 40, 4); paint(g, '#efece6', INK, 1); }
    },
  },
  {
    id: 'driftwood', name: 'Driftwood', cat: 'nature', sets: ['ship', 'swamp'], tags: ['log', 'beach', 'shore', 'bleached'],
    w: 2, h: 1, difficult: true, c: { wood: '#b8ab92' },
    desc: 'Sea-bleached logs and branches washed up on the shore.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 3; i++) {
        const y = h / 2 + (i - 1) * 20, x0 = 20 + r() * 30, x1 = w - 20 - r() * 30, a = (r() - 0.5) * 0.3;
        g.save(); g.translate((x0 + x1) / 2, y); g.rotate(a);
        rr(g, -(x1 - x0) / 2, -8, x1 - x0, 16, 8);
        paint(g, litFill(g, -(x1 - x0) / 2, -8, x1 - x0, 16, shade(c.wood, (r() - 0.5) * 0.2), 0.3), INK, 1.6);
        g.restore();
      }
    },
  },
  {
    id: 'tide-pools', name: 'Tide pools', cat: 'terrain', sets: ['ship'], tags: ['rock pools', 'starfish', 'crabs', 'shore', 'beach'],
    w: 2, h: 2, layer: 'floor', difficult: true, c: { stone: '#7a746a', water: '#3f7a86' },
    desc: 'Slick rocks with pools of seawater, starfish and weed. Difficult terrain.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 6; i++) rock(g, 30 + r() * (w - 60), 30 + r() * (h - 60), 20 + r() * 18, shade(c.stone, (r() - 0.5) * 0.2), r);
      for (let i = 0; i < 3; i++) pool(g, 40 + r() * (w - 80), 40 + r() * (h - 80), 22 + r() * 12, 14 + r() * 8, c.water, r);
      for (let i = 0; i < 3; i++) {
        const x = 30 + r() * (w - 60), y = 30 + r() * (h - 60);
        g.beginPath();
        for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU, d = k % 2 ? 3 : 8; g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
        g.closePath(); paint(g, '#e0703a', INK, 1);
      }
    },
  },

  // ---------- swamp ----------
  {
    id: 'stilt-hut', name: 'Stilt hut', cat: 'structure', sets: ['swamp', 'jungle'], tags: ['hut', 'stilts', 'bog', 'witch', 'hermit', 'shack'],
    w: 3, h: 3, blocksMovement: true, blocksSight: true, solid: true, c: { roof: ROOF.thatch, wood: '#6a5638' },
    desc: 'A reed-thatched hut on tall stilts above the water, a ladder down from the porch.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      planks(g, 30, h - 70, w - 60, 40, c.wood, r, 'h', 4);
      rr(g, 30, h - 70, w - 60, 40, 2); paint(g, 'rgba(0,0,0,0)', INK, 1.6);
      for (let i = 0; i < 4; i++) line(g, w / 2 - 12 + (i % 2) * 24, h - 30, w / 2 - 12 + (i % 2) * 24, h - 6, INK, 4);
      for (let y = h - 26; y < h - 6; y += 6) line(g, w / 2 - 12, y, w / 2 + 12, y, '#8a6a48', 3);
      coneRoof(g, w / 2, h / 2 - 22, 104, c.roof, r, 34, true);
    },
  },
  {
    id: 'boardwalk', name: 'Boardwalk', cat: 'terrain', sets: ['swamp', 'ship', 'jungle'], tags: ['walkway', 'planks', 'jetty', 'bridge', 'path'],
    w: 1, h: 3, layer: 'floor', c: { wood: '#7a6448' },
    desc: 'Planks on posts across marsh or shallow water. Chain them end to end.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(24, 4, w - 40, h);
      for (let y = 2; y < h - 4; y += 14) {
        const missing = r() < 0.06;
        if (missing) continue;
        rr(g, 20 + (r() - 0.5) * 3, y, w - 40, 12, 2);
        paint(g, litFill(g, 20, y, w - 40, 12, shade(c.wood, (r() - 0.5) * 0.18), 0.2), INK, 1.2);
      }
      for (const y of [10, h / 2, h - 12]) for (const x of [16, w - 16]) logEnd(g, x, y, 7, shade(c.wood, -0.15));
    },
  },
  {
    id: 'tree-mangrove', name: 'Mangrove', cat: 'nature', sets: ['swamp', 'jungle', 'ship'], tags: ['tree', 'roots', 'stilt roots', 'marsh', 'bayou'],
    w: 3, h: 3, layer: 'overhead', difficult: true, c: { leaf: '#3f6a34', trunk: '#5a4a38' },
    desc: 'A tree standing on a cage of arching roots in the shallows. The roots are difficult terrain.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + r() * 0.3, L = 90 + r() * 40;
        g.beginPath(); g.moveTo(cx, cy);
        g.quadraticCurveTo(cx + Math.cos(a + 0.4) * L * 0.6, cy + Math.sin(a + 0.4) * L * 0.6, cx + Math.cos(a) * L, cy + Math.sin(a) * L);
        g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
        g.strokeStyle = c.trunk; g.lineWidth = 5; g.stroke();
      }
      canopyShadow(g, cx, cy, 96);
      foliage(g, cx, cy, 98, c.leaf, r, 13);
    },
  },
  {
    id: 'will-o-wisps', name: "Will-o'-wisps", cat: 'light', sets: ['swamp', 'forest', 'crypt'], tags: ['wisps', 'ghost lights', 'fey', 'lure', 'glow'],
    w: 1, h: 1, layer: 'overhead', c: { glow: '#9ad8ff' }, light: { bright: 5, dim: 15, color: '#9ad8ff' },
    variants: [{ name: 'Pale blue', c: {} }, { name: 'Green', c: { glow: '#9affb0' } }, { name: 'Gold', c: { glow: '#ffd27a' } }],
    desc: 'A drift of floating ghost lights. They lure travellers off the path.',
    draw: ({ g, w, h, c, seed }) => motes(g, w / 2, h / 2, 60, 4, c.glow, rng(seed)),
  },
  {
    id: 'sunken-statue', name: 'Sunken statue', cat: 'religious', sets: ['swamp', 'jungle', 'forest'], tags: ['ruin', 'head', 'idol', 'drowned', 'statue'],
    w: 2, h: 2, blocksMovement: true, c: { stone: '#7a8466', moss: '#4f7a34' },
    desc: 'The head and one hand of a huge statue sticking out of the mire.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      pool(g, w / 2, h / 2 + 10, 90, 70, alpha('#3f4a38', 0.9), r);
      ellipse(g, w / 2 - 10, h / 2, 48, 54);
      paint(g, domeFill(g, w / 2 - 10, h / 2, 54, c.stone, 0.32), INK, LW);
      for (const s of [-1, 1]) { ellipse(g, w / 2 - 10 + s * 16, h / 2 - 6, 8, 4); paint(g, shade(c.stone, -0.45), null); }
      line(g, w / 2 - 22, h / 2 + 24, w / 2 + 2, h / 2 + 24, shade(c.stone, -0.5), 2);
      blob(g, lumpy(w / 2 - 20, h / 2 - 30, 28, 0.5, 9, r)); paint(g, alpha(c.moss, 0.8), null);
      for (let i = 0; i < 4; i++) { rr(g, w - 66 + i * 11, h - 70 + (i % 2) * 6, 9, 26, 4); paint(g, litFill(g, w - 66 + i * 11, h - 70, 9, 26, c.stone), INK, 1.2); }
    },
  },

  // ---------- winter ----------
  {
    id: 'ice-spikes', name: 'Ice spikes', cat: 'terrain', sets: ['winter', 'cave'], tags: ['ice', 'icicles', 'frozen', 'crystals', 'hazard'],
    w: 2, h: 2, difficult: true, c: { ice: '#bfe3f2' },
    desc: 'Jagged spears of ice thrust up from the ground. Difficult terrain.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 9; i++) {
        const x = 30 + r() * (w - 60), y = 30 + r() * (h - 60), s = 12 + r() * 18, a = r() * TAU;
        const pts = [[x + Math.cos(a) * s * 2, y + Math.sin(a) * s * 2], [x + Math.cos(a + 2.2) * s, y + Math.sin(a + 2.2) * s], [x + Math.cos(a + 4) * s, y + Math.sin(a + 4) * s]];
        g.fillStyle = 'rgba(0,0,0,0.18)'; poly(g, pts.map(([px, py]) => [px + 5, py + 7])); g.fill();
        poly(g, pts);
        paint(g, litFill(g, x - s, y - s, s * 2, s * 2, shade(c.ice, (r() - 0.5) * 0.15), 0.3), shade(c.ice, -0.5), 1.4);
        line(g, x, y, pts[0][0], pts[0][1], alpha('#ffffff', 0.7), 1.2);
      }
    },
  },
  {
    id: 'yurt', name: 'Yurt', cat: 'structure', sets: ['winter', 'camp', 'desert'], tags: ['ger', 'felt tent', 'nomad', 'round tent'],
    w: 3, h: 3, blocksMovement: true, blocksSight: true, solid: true, c: { felt: '#d9cdb0', band: CLOTH.red },
    variants: [{ name: 'Red bands', c: {} }, { name: 'Blue bands', c: { band: CLOTH.blue } }, { name: 'Dark felt', c: { felt: '#8a7a62', band: '#3a2a1c' } }],
    desc: 'A round felt tent on a lattice frame, a painted door at the front.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      coneRoof(g, w / 2, h / 2, 120, c.felt, r, 22, true);
      circle(g, w / 2, h / 2, 100);
      paint(g, 'rgba(0,0,0,0)', c.band, 6);
      rr(g, w / 2 - 18, h - 34, 36, 14, 2);
      paint(g, c.band, INK, 1.6);
    },
  },
  {
    id: 'sled', name: 'Sled', cat: 'vehicle', sets: ['winter'], tags: ['sledge', 'sleigh', 'dog sled', 'runners'],
    w: 1, h: 2, c: { wood: '#8a6a48', load: '#7a5638' },
    desc: 'A wooden sledge on long runners, loaded with furs and supplies.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (const x of [22, w - 22]) { line(g, x, 14, x, h - 10, INK, 6); line(g, x, 14, x, h - 10, '#9a9690', 3); }
      planks(g, 26, 30, w - 52, h - 50, c.wood, r, 'h', 6);
      rr(g, 26, 30, w - 52, h - 50, 3); paint(g, 'rgba(0,0,0,0)', INK, 1.8);
      blob(g, lumpy(w / 2, h / 2 + 10, 26, 0.3, 8, r, 40)); paint(g, domeFill(g, w / 2, h / 2 + 10, 34, c.load, 0.3), INK, 1.6);
    },
  },

  // ---------- desert ----------
  {
    id: 'house-adobe', name: 'Adobe house', cat: 'structure', sets: ['desert', 'town'], tags: ['mud brick', 'flat roof', 'house', 'building', 'pueblo'],
    w: 3, h: 3, blocksMovement: true, blocksSight: true, solid: true, c: { wall: '#c9a27a', trim: '#2f5d8a' },
    variants: [{ name: 'Blue door', c: {} }, { name: 'Red door', c: { trim: CLOTH.red } }, { name: 'Whitewashed', c: { wall: '#e8e0d0', trim: '#2f7a8a' } }],
    desc: 'A flat-roofed mud-brick house with a low parapet, roof beams poking out of the walls.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(16, 18, w - 20, h - 20);
      rr(g, 8, 8, w - 20, h - 22, 8);
      paint(g, litFill(g, 8, 8, w - 20, h - 22, c.wall, 0.2), INK, LW);
      rr(g, 20, 20, w - 44, h - 46, 4);
      paint(g, litFill(g, 20, 20, w - 44, h - 46, shade(c.wall, -0.1), 0.15), alpha(INK, 0.6), 1.4);
      speckle(g, 24, 24, w - 52, h - 54, r, 50, alpha(shade(c.wall, -0.3), 0.5), 1.6);
      for (let x = 30; x < w - 30; x += 34) logEnd(g, x, h - 14, 5, '#6b4428');
      rr(g, w / 2 - 14, h - 18, 28, 10, 2); paint(g, c.trim, INK, 1.4);
    },
  },
  {
    id: 'rock-arch', name: 'Rock arch', cat: 'terrain', sets: ['desert', 'forest'], tags: ['natural arch', 'sandstone', 'landmark', 'canyon'],
    w: 4, h: 2, blocksSight: false, c: { stone: '#b87a52' },
    variants: [{ name: 'Red sandstone', c: {} }, { name: 'Pale', c: { stone: '#c9b08a' } }, { name: 'Grey', c: { stone: '#8a8780' } }],
    desc: 'A natural stone arch. The two feet block movement; the gap under it is open.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      g.fillStyle = 'rgba(0,0,0,0.28)'; rr(g, 30, h / 2 - 10, w - 40, 50, 25); g.fill();
      rr(g, 20, h / 2 - 28, w - 40, 50, 25);
      paint(g, litFill(g, 20, h / 2 - 28, w - 40, 50, c.stone, 0.25), INK, LW);
      for (let i = 0; i < 4; i++) line(g, 50 + i * 80, h / 2 - 20 + (r() - 0.5) * 8, 100 + i * 80, h / 2 - 14 + (r() - 0.5) * 8, alpha(shade(c.stone, -0.4), 0.7), 1.6);
      rock(g, 50, h / 2, 44, shade(c.stone, -0.05), r);
      rock(g, w - 50, h / 2, 44, shade(c.stone, -0.05), r);
    },
  },
  {
    id: 'ruin-columns', name: 'Broken colonnade', cat: 'structure', sets: ['desert', 'temple', 'forest', 'jungle'], tags: ['ruins', 'columns', 'pillars', 'temple', 'ancient'],
    w: 3, h: 3, layer: 'floor', c: { stone: '#d8ccb0' },
    variants: [{ name: 'Marble', c: {} }, { name: 'Sandstone', c: { stone: STONE.sand } }, { name: 'Grey', c: { stone: STONE.grey } }],
    desc: 'A ring of broken columns on a cracked stone floor. Some still stand; some lie where they fell.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      rr(g, 16, 16, w - 32, h - 32, 6);
      paint(g, alpha(shade(c.stone, -0.15), 0.8), alpha(INK, 0.6), 1.4);
      stoneCourse(g, 18, 18, w - 36, h - 36, shade(c.stone, -0.1), r, 34, 34);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU, x = cx + Math.cos(a) * 104, y = cy + Math.sin(a) * 104;
        if (r() < 0.3) {
          g.save(); g.translate(x, y); g.rotate(r() * TAU);
          rr(g, -10, -12, 64, 24, 10); paint(g, litFill(g, -10, -12, 64, 24, c.stone, 0.25), INK, 1.6);
          g.restore();
        } else {
          circle(g, x, y, 16); paint(g, domeFill(g, x, y, 16, c.stone, 0.35), INK, 1.8);
          circle(g, x, y, 10); paint(g, 'rgba(0,0,0,0)', alpha(shade(c.stone, -0.4), 0.6), 1);
        }
      }
    },
  },
  {
    id: 'sand-dune', name: 'Sand dune', cat: 'terrain', sets: ['desert'], tags: ['dune', 'sand', 'drift', 'ridge'],
    w: 3, h: 2, layer: 'floor', difficult: true, c: { sand: '#d8b878' },
    desc: 'A wind-shaped ridge of loose sand. Difficult terrain.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      blob(g, lumpy(w / 2, h / 2, w * 0.46, 0.18, 12, r, h * 0.4));
      paint(g, litFill(g, 0, 0, w, h, c.sand, 0.18), alpha(shade(c.sand, -0.4), 0.5), 1.4);
      g.beginPath(); g.moveTo(24, h / 2 + 10); g.quadraticCurveTo(w / 2, h / 2 - 40, w - 24, h / 2 + 4);
      g.strokeStyle = alpha(shade(c.sand, 0.4), 0.9); g.lineWidth = 3; g.stroke();
      for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(40 + i * 40, h / 2 + 20); g.quadraticCurveTo(60 + i * 40, h / 2 + 12, 80 + i * 40, h / 2 + 22); g.strokeStyle = alpha(shade(c.sand, -0.25), 0.5); g.lineWidth = 1.4; g.stroke(); }
    },
  },

  // ---------- wild, graves and camps ----------
  {
    id: 'barrow', name: 'Barrow mound', cat: 'religious', sets: ['crypt', 'forest', 'winter'], tags: ['burial mound', 'tumulus', 'grave', 'tomb', 'cairn'],
    w: 3, h: 3, blocksMovement: true, blocksSight: true, c: { grass: '#6a8a44', stone: STONE.grey },
    desc: 'A grassy burial mound with a stone-framed doorway on the bottom edge.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      g.fillStyle = 'rgba(0,0,0,0.25)'; circle(g, w / 2 + 10, h / 2 + 12, 128); g.fill();
      blob(g, lumpy(w / 2, h / 2, 128, 0.12, 14, r));
      paint(g, domeFill(g, w / 2, h / 2, 128, c.grass, 0.3), INK, LW);
      for (let i = 0; i < 12; i++) tuft(g, 40 + r() * (w - 80), 40 + r() * (h - 80), 8, alpha(shade(c.grass, 0.3), 0.8), r);
      rr(g, w / 2 - 28, h - 46, 56, 34, 3); paint(g, litFill(g, w / 2 - 28, h - 46, 56, 34, c.stone, 0.25), INK, 1.8);
      rr(g, w / 2 - 16, h - 38, 32, 26, 2); paint(g, '#14110e', null);
    },
  },
  {
    id: 'fairy-ring', name: 'Fairy ring', cat: 'nature', sets: ['forest', 'swamp'], tags: ['mushroom ring', 'fey', 'toadstools', 'portal', 'circle'],
    w: 2, h: 2, layer: 'floor', c: { cap: '#e2d6c0', glow: '#c9a2ff' }, light: { bright: 0, dim: 10, color: '#c9a2ff' },
    variants: [{ name: 'Pale', c: {} }, { name: 'Red caps', c: { cap: '#c23a2a', glow: '#ffd27a' } }, { name: 'Glowing', c: { cap: '#9ae0d0', glow: '#7af0d8' } }],
    desc: 'A perfect ring of toadstools in the grass. Step inside at your own risk.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      glow(g, cx, cy, 80, c.glow, 0.25);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU + r() * 0.15, d = 72 + (r() - 0.5) * 8, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, s = 6 + r() * 4;
        circle(g, x, y, s); paint(g, domeFill(g, x, y, s, c.cap, 0.4), INK, 1.2);
        circle(g, x - s * 0.3, y - s * 0.3, 1.4); paint(g, '#ffffff', null);
      }
    },
  },
  {
    id: 'mausoleum', name: 'Mausoleum', cat: 'religious', sets: ['crypt', 'temple', 'town'], tags: ['tomb', 'crypt', 'graveyard', 'family vault'],
    w: 3, h: 3, blocksMovement: true, blocksSight: true, solid: true, c: { stone: '#a8a196', roof: '#6a6660' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Marble', c: { stone: STONE.marble, roof: '#9a9690' } }, { name: 'Dark', c: { stone: STONE.dark, roof: '#3a3836' } }],
    desc: 'A stone tomb house with columns and a heavy door on the bottom edge.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      gableRoof(g, 24, 14, w - 48, h - 64, c.roof, 'slate', r);
      rr(g, 24, h - 52, w - 48, 30, 2); paint(g, litFill(g, 24, h - 52, w - 48, 30, c.stone, 0.2), INK, 1.8);
      for (let i = 0; i < 4; i++) { const x = 46 + i * ((w - 92) / 3); circle(g, x, h - 36, 10); paint(g, domeFill(g, x, h - 36, 10, c.stone, 0.4), INK, 1.4); }
      rr(g, w / 2 - 20, h - 26, 40, 14, 2); paint(g, '#3a3632', INK, 1.4);
    },
  },
  {
    id: 'cave-entrance', name: 'Cave mouth', cat: 'terrain', sets: ['cave', 'forest', 'winter', 'mine'], tags: ['cave', 'entrance', 'lair', 'hillside', 'tunnel'],
    w: 3, h: 2, blocksMovement: true, blocksSight: true, c: { stone: '#857f75' },
    variants: [{ name: 'Grey rock', c: {} }, { name: 'Red rock', c: { stone: '#9a6a52' } }, { name: 'Snowy', c: { stone: '#9aa4ae' } }],
    desc: 'A dark opening in a rocky hillside, facing the bottom edge. Put a cave map behind it.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      rock(g, w / 2, h / 2 - 10, w * 0.46, c.stone, r, h * 0.4);
      blob(g, lumpy(w / 2, h - 34, 50, 0.25, 9, r, 26));
      paint(g, '#120f0c', INK, 2);
      for (let i = 0; i < 5; i++) rock(g, w / 2 - 70 + r() * 140, h - 12 - r() * 10, 6 + r() * 6, shade(c.stone, -0.1), r);
    },
  },
  {
    id: 'totem-pole', name: 'Totem pole', cat: 'decor', sets: ['camp', 'forest', 'jungle', 'winter'], tags: ['totem', 'carved pole', 'tribal', 'marker'],
    w: 1, h: 1, blocksMovement: true, c: { wood: '#8a5a34', paint: CLOTH.red },
    variants: [{ name: 'Red paint', c: {} }, { name: 'Blue paint', c: { paint: CLOTH.blue } }, { name: 'Plain', c: { paint: '#6b4428' } }],
    desc: 'A tall carved pole of stacked faces with outspread wings at the top.',
    draw: ({ g, w, h, c, seed }) => {
      void seed;
      rr(g, 12, h / 2 - 10, w - 24, 20, 6); paint(g, litFill(g, 12, h / 2 - 10, w - 24, 20, c.paint, 0.25), INK, 1.8);
      circle(g, w / 2, h / 2, 22); paint(g, domeFill(g, w / 2, h / 2, 22, c.wood, 0.35), INK, 2);
      for (const s of [-1, 1]) { circle(g, w / 2 + s * 8, h / 2 - 4, 4); paint(g, c.paint, INK, 1); }
      line(g, w / 2 - 8, h / 2 + 9, w / 2 + 8, h / 2 + 9, INK, 2);
    },
  },
  {
    id: 'roundhouse', name: 'Roundhouse', cat: 'structure', sets: ['farm', 'forest', 'camp', 'winter'], tags: ['hut', 'round hut', 'village', 'thatch', 'iron age'],
    w: 3, h: 3, blocksMovement: true, blocksSight: true, solid: true, c: { roof: ROOF.thatch, wall: '#9a8a6a' },
    variants: [{ name: 'Thatch', c: {} }, { name: 'Turf', c: { roof: '#6a7a44' } }, { name: 'Hide', c: { roof: '#8a6a48' } }],
    desc: 'A round wattle-and-daub hut under a tall conical thatch, its door on the bottom edge.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      rr(g, w / 2 - 16, h - 30, 32, 22, 3); paint(g, '#5a3a20', INK, 1.6);
      coneRoof(g, w / 2, h / 2 - 6, 118, c.roof, r, 40, true);
    },
  },

  // ---------- alien ----------
  {
    id: 'monolith', name: 'Monolith', cat: 'arcane', sets: ['alien', 'desert', 'wizard'], tags: ['black stone', 'obelisk', 'artifact', 'slab', 'alien'],
    w: 1, h: 1, blocksMovement: true, blocksSight: true, c: { stone: '#1e1e24', glow: '#7af0d8' },
    variants: [{ name: 'Black', c: {} }, { name: 'Black, violet runes', c: { glow: '#c9a2ff' } }, { name: 'Pale', c: { stone: '#d8d4cc', glow: '#ffd27a' } }],
    desc: 'A perfectly smooth slab, taller than a giant, humming faintly.',
    draw: ({ g, w, h, c, seed }) => {
      void seed;
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(34, 26, 42, 64);
      rr(g, 28, 18, 44, 64, 2);
      paint(g, litFill(g, 28, 18, 44, 64, c.stone, 0.5), INK, LW);
      glow(g, w / 2, h / 2, 34, c.glow, 0.3);
      for (let y = 30; y < 74; y += 12) line(g, 40, y, 60, y, alpha(c.glow, 0.8), 1.6);
    },
  },
  {
    id: 'crater', name: 'Impact crater', cat: 'terrain', sets: ['alien', 'desert', 'winter'], tags: ['crater', 'meteor', 'impact', 'pit', 'fallen star'],
    w: 3, h: 3, layer: 'floor', difficult: true, c: { rock: '#6a5e52', core: '#7af0d8' },
    variants: [{ name: 'Glowing stone', c: {} }, { name: 'Burning', c: { core: '#ff8a2a' } }, { name: 'Cold', c: { core: '#4a4440' } }],
    desc: 'A blasted bowl in the ground with a fallen star still in the middle. Difficult terrain.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      blob(g, lumpy(cx, cy, 136, 0.12, 16, r)); paint(g, litFill(g, 0, 0, w, h, shade(c.rock, 0.15), 0.2), alpha(INK, 0.7), 1.8);
      blob(g, lumpy(cx, cy, 104, 0.1, 14, r));
      const gr = g.createRadialGradient(cx + 20, cy + 20, 10, cx, cy, 110);
      gr.addColorStop(0, shade(c.rock, -0.4)); gr.addColorStop(1, shade(c.rock, 0.1));
      paint(g, gr, alpha(INK, 0.6), 1.4);
      for (let i = 0; i < 14; i++) { const a = r() * TAU, d = 112 + r() * 22; rock(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 6 + r() * 8, c.rock, r); }
      glow(g, cx, cy, 50, c.core, 0.5);
      rock(g, cx, cy, 20, shade(c.core, -0.3), r);
    },
  },
  {
    id: 'crystal-tree', name: 'Crystal tree', cat: 'nature', sets: ['alien', 'cave', 'wizard'], tags: ['crystal', 'glass tree', 'gem', 'glow', 'alien'],
    w: 2, h: 2, layer: 'overhead', c: { crystal: '#9ad8ff', trunk: '#5a6a7a' }, light: { bright: 5, dim: 15, color: '#9ad8ff' },
    variants: [{ name: 'Blue', c: {} }, { name: 'Rose', c: { crystal: '#ff9ac8' } }, { name: 'Amethyst', c: { crystal: '#b88aff' } }, { name: 'Emerald', c: { crystal: '#7af0a8' } }],
    desc: 'A tree of glassy crystal branches that ring softly in the wind and glow at night.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      glow(g, cx, cy, 90, c.crystal, 0.35);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + r() * 0.3, L = 50 + r() * 30, x = cx + Math.cos(a) * L, y = cy + Math.sin(a) * L;
        line(g, cx, cy, x, y, INK, 5); line(g, cx, cy, x, y, c.trunk, 3);
        const s = 10 + r() * 8, pts = [[x + Math.cos(a) * s * 1.6, y + Math.sin(a) * s * 1.6], [x + Math.cos(a + 1.6) * s * 0.6, y + Math.sin(a + 1.6) * s * 0.6], [x - Math.cos(a) * s * 0.6, y - Math.sin(a) * s * 0.6], [x + Math.cos(a - 1.6) * s * 0.6, y + Math.sin(a - 1.6) * s * 0.6]];
        poly(g, pts); paint(g, litFill(g, x - s, y - s, s * 2, s * 2, c.crystal, 0.4), shade(c.crystal, -0.5), 1.4);
      }
      circle(g, cx, cy, 12); paint(g, domeFill(g, cx, cy, 12, c.trunk, 0.4), INK, 1.6);
    },
  },
];

void [liquid];

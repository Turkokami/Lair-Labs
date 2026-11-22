// Jungle and alien-fungus objects for Lair Labs' outdoor maps: rainforest trees, giant emergent trees,
// broad-leaf plants, hanging vines, an overgrown step temple, carved idols, and an alien set of fungus
// towers, glowing pods, spore vents and coiled tendrils. Original art drawn in code with the Canvas 2D API,
// in the library's top-down style: light from the top-left, ink outline, soft shading.
import type { G, ObjDef } from '../art/types';
import { rng, circle, ellipse, poly, blob, lumpy, paint, line, domeFill, speckle, blocks, foliage, glow, shade, alpha, INK, LW, STONE } from '../art/kit';

type Rand = () => number;
const TAU = Math.PI * 2;

/** One broad leaf from (x,y) pointing at angle a: a pointed oval with a midrib. */
function leaf(g: G, x: number, y: number, a: number, L: number, W: number, color: string, lw = 1.1) {
  const ca = Math.cos(a), sa = Math.sin(a);
  const tipx = x + ca * L, tipy = y + sa * L;
  const mx = x + ca * L * 0.45, my = y + sa * L * 0.45;
  g.beginPath();
  g.moveTo(x, y);
  g.quadraticCurveTo(mx - sa * W, my + ca * W, tipx, tipy);
  g.quadraticCurveTo(mx + sa * W, my - ca * W, x, y);
  g.closePath();
  const gr = g.createLinearGradient(mx - sa * W, my + ca * W, mx + sa * W, my - ca * W);
  gr.addColorStop(0, shade(color, -0.18));
  gr.addColorStop(1, shade(color, 0.16));
  paint(g, gr, alpha(INK, 0.75), lw);
  line(g, x, y, x + ca * L * 0.92, y + sa * L * 0.92, alpha(shade(color, 0.45), 0.7), 1);
}

/** A ring of broad leaves round a centre, outer ring darker. Used for jungle crowns and plants. */
function leafCrown(g: G, cx: number, cy: number, R: number, color: string, r: Rand, rings = 3) {
  for (let k = 0; k < rings; k++) {
    const n = 7 + k * 2;
    const rad = R * (1 - k * 0.24);
    const col = shade(color, -0.22 + k * 0.14);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + r() * 0.5 + k * 0.4;
      const start = rad * 0.18;
      leaf(g, cx + Math.cos(a) * start, cy + Math.sin(a) * start, a + (r() - 0.5) * 0.3, rad * (0.82 + r() * 0.2), rad * (0.34 + r() * 0.1), col);
    }
  }
}

/** A dangling vine strand: a wavy line with small leaves along it. */
function vine(g: G, x: number, y: number, len: number, a: number, color: string, r: Rand) {
  const pts: number[][] = [];
  const ca = Math.cos(a), sa = Math.sin(a);
  for (let t = 0; t <= 1.0001; t += 0.1) {
    const wob = Math.sin(t * 9 + r() * 2) * 5;
    pts.push([x + ca * len * t - sa * wob, y + sa * len * t + ca * wob]);
  }
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) g.lineTo(p[0], p[1]);
  g.strokeStyle = alpha(INK, 0.7);
  g.lineWidth = 3.2;
  g.stroke();
  g.strokeStyle = shade(color, -0.1);
  g.lineWidth = 1.8;
  g.stroke();
  for (let i = 1; i < pts.length; i += 2) {
    const side = i % 4 === 1 ? 1 : -1;
    leaf(g, pts[i][0], pts[i][1], a + side * 1.1, 9, 4, color, 0.8);
  }
}

function shadowDisc(g: G, cx: number, cy: number, rad: number, a = 0.22) {
  g.fillStyle = `rgba(0,0,0,${a})`;
  circle(g, cx + rad * 0.16, cy + rad * 0.2, rad);
  g.fill();
}

/** An alien mushroom cap seen from above with gill rays and glowing spots. */
function alienCap(g: G, cx: number, cy: number, R: number, cap: string, spot: string, r: Rand) {
  blob(g, lumpy(cx, cy, R, 0.08, 12, r));
  paint(g, domeFill(g, cx, cy, R, cap, 0.45), INK, LW);
  g.save();
  blob(g, lumpy(cx, cy, R, 0, 12, r));
  g.clip();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    line(g, cx + Math.cos(a) * R * 0.55, cy + Math.sin(a) * R * 0.55, cx + Math.cos(a) * R, cy + Math.sin(a) * R, alpha(shade(cap, -0.45), 0.35), 1);
  }
  g.restore();
  for (let i = 0; i < 6; i++) {
    const a = r() * TAU, d = Math.sqrt(r()) * R * 0.7, sr = R * (0.06 + r() * 0.07);
    glow(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, sr * 2.6, spot, 0.35);
    circle(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, sr);
    paint(g, spot, alpha(INK, 0.35), 0.7);
  }
}

export const WILDS_OBJECTS: ObjDef[] = [
  // --- jungle ---
  {
    id: 'tree-jungle', name: 'Jungle tree', cat: 'nature', sets: ['jungle', 'forest', 'swamp'], tags: ['rainforest', 'tropical', 'tree', 'canopy', 'vines'],
    w: 3, h: 3, layer: 'overhead', blocksSight: true, c: { leaf: '#2f6a2a', vine: '#4f8a34' },
    variants: [{ name: 'Rainforest', c: {} }, { name: 'Dark canopy', c: { leaf: '#1f4d24' } }, { name: 'Bright', c: { leaf: '#4a8a2a' } }, { name: 'Flowering', c: {}, f: { flowers: 1 } }],
    desc: 'A broad-leafed rainforest tree draped in vines. Tokens can stand beneath it.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      shadowDisc(g, cx, cy, 132);
      foliage(g, cx, cy, 128, shade(c.leaf, -0.25), r, 14);
      leafCrown(g, cx, cy, 140, c.leaf, r, 3);
      foliage(g, cx, cy, 60, shade(c.leaf, 0.1), r, 7);
      for (let i = 0; i < 5; i++) {
        const a = r() * TAU;
        vine(g, cx + Math.cos(a) * 40, cy + Math.sin(a) * 40, 70 + r() * 40, a + (r() - 0.5) * 0.6, c.vine, r);
      }
      if (f.flowers) for (let i = 0; i < 14; i++) {
        const a = r() * TAU, d = 30 + r() * 100;
        circle(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 4 + r() * 3);
        paint(g, i % 3 ? '#e2457a' : '#f2b13a', alpha(INK, 0.5), 0.8);
      }
    },
  },
  {
    id: 'tree-emergent', name: 'Giant jungle tree', cat: 'nature', sets: ['jungle'], tags: ['kapok', 'ancient', 'tree', 'canopy', 'landmark', 'rainforest', 'buttress'],
    w: 5, h: 5, layer: 'overhead', blocksSight: true, c: { leaf: '#2e6328', trunk: '#6b5a44', vine: '#4f8a34' },
    variants: [{ name: 'Rainforest', c: {} }, { name: 'Ancient', c: { leaf: '#24502a', trunk: '#57503f' } }, { name: 'Golden', c: { leaf: '#7a8a2a' } }],
    desc: 'A towering tree that rises above the rest of the jungle, roots like walls.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      shadowDisc(g, cx, cy, 228, 0.25);
      // buttress roots reaching out past the crown
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + r() * 0.4;
        poly(g, [[cx + Math.cos(a - 0.12) * 40, cy + Math.sin(a - 0.12) * 40], [cx + Math.cos(a) * 240, cy + Math.sin(a) * 240], [cx + Math.cos(a + 0.12) * 40, cy + Math.sin(a + 0.12) * 40]]);
        paint(g, shade(c.trunk, -0.05), INK, 1.6);
      }
      foliage(g, cx, cy, 225, shade(c.leaf, -0.15), r, 20);
      leafCrown(g, cx, cy, 175, c.leaf, r, 2);
      foliage(g, cx - 20, cy - 20, 80, shade(c.leaf, 0.15), r, 8);
      for (let i = 0; i < 8; i++) {
        const a = r() * TAU;
        vine(g, cx + Math.cos(a) * 70, cy + Math.sin(a) * 70, 100 + r() * 60, a, c.vine, r);
      }
    },
  },
  {
    id: 'plant-broadleaf', name: 'Broad-leaf plant', cat: 'nature', sets: ['jungle', 'swamp', 'forest'], tags: ['elephant ear', 'tropical', 'plant', 'leaves', 'cover'],
    w: 1, h: 1, difficult: true, c: { leaf: '#3c7a2e' },
    variants: [{ name: 'Green', c: {} }, { name: 'Dark', c: { leaf: '#24502a' } }, { name: 'Red-veined', c: { leaf: '#6a3a3a' } }, { name: 'Lime', c: { leaf: '#7aa83a' } }],
    desc: 'Huge tropical leaves at knee height. Difficult ground.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      const n = 6 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + r() * 0.4;
        leaf(g, cx, cy, a, 42 + r() * 8, 16, shade(c.leaf, (r() - 0.5) * 0.25));
      }
    },
  },
  {
    id: 'vines-hanging', name: 'Hanging vines', cat: 'nature', sets: ['jungle', 'swamp', 'cave'], tags: ['lianas', 'curtain', 'creepers', 'overhead'],
    w: 2, h: 2, layer: 'overhead', c: { vine: '#4f8a34' },
    variants: [{ name: 'Green', c: {} }, { name: 'Brown', c: { vine: '#7a6a3a' } }, { name: 'Glowing', c: { vine: '#4fd0b0' }, f: { glow: 1 } }],
    desc: 'A curtain of lianas hanging from the canopy. Hides little; slows nothing.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 9; i++) {
        const x = 20 + r() * (w - 40), y = 10 + r() * 40;
        vine(g, x, y, 110 + r() * 50, Math.PI / 2 + (r() - 0.5) * 0.7, c.vine, r);
        if (f.glow) glow(g, x, y + 80, 18, c.vine, 0.4);
      }
    },
  },
  {
    id: 'jungle-temple', name: 'Overgrown step temple', cat: 'structure', sets: ['jungle', 'temple', 'desert'], tags: ['ziggurat', 'pyramid', 'ruin', 'shrine', 'lost city', 'stairs', 'landmark'],
    w: 5, h: 5, blocksMovement: true, blocksSight: true, solid: true, c: { stone: '#8a8574', moss: '#4a7a30' },
    variants: [{ name: 'Mossy grey', c: {} }, { name: 'Sandstone', c: { stone: STONE.sand, moss: '#6a8a3a' } }, { name: 'Dark basalt', c: { stone: '#4e4c4a', moss: '#3a6a2a' } }, { name: 'Clean', c: {}, f: { bare: 1 } }],
    desc: 'A stepped stone temple swallowed by the jungle, with a stair up the south face to a shrine on top.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(28, 32, w - 40, h - 40);
      // four tiers, each smaller and lighter
      for (let k = 0; k < 4; k++) {
        const m = 14 + k * 46;
        blocks(g, m, m, w - m * 2, h - m * 2, shade(c.stone, -0.12 + k * 0.08), r, 30, 18);
        g.strokeStyle = INK;
        g.lineWidth = 1.8;
        g.strokeRect(m, m, w - m * 2, h - m * 2);
        // shadow line on the lower-right step faces
        line(g, m + 4, h - m - 3, w - m - 3, h - m - 3, alpha(INK, 0.4), 4);
        line(g, w - m - 3, m + 4, w - m - 3, h - m - 3, alpha(INK, 0.4), 4);
      }
      // the stair down the south face
      const sw = 70;
      g.fillStyle = shade(c.stone, 0.05);
      g.fillRect(cx - sw / 2, cy, sw, h / 2 - 12);
      g.strokeStyle = INK;
      g.lineWidth = 1.6;
      g.strokeRect(cx - sw / 2, cy, sw, h / 2 - 12);
      for (let y = cy + 10; y < h - 14; y += 10) line(g, cx - sw / 2, y, cx + sw / 2, y, alpha(INK, 0.5), 1);
      // shrine on top
      blocks(g, cx - 40, cy - 46, 80, 64, shade(c.stone, 0.18), r, 20, 12);
      g.strokeStyle = INK;
      g.lineWidth = 2;
      g.strokeRect(cx - 40, cy - 46, 80, 64);
      g.fillStyle = '#16120e';
      g.fillRect(cx - 14, cy + 2, 28, 16);
      if (!f.bare) {
        for (let i = 0; i < 26; i++) {
          const x = 10 + r() * (w - 20), y = 10 + r() * (h - 20);
          blob(g, lumpy(x, y, 8 + r() * 18, 0.45, 8, r));
          paint(g, alpha(shade(c.moss, (r() - 0.5) * 0.3), 0.85), alpha(INK, 0.35), 0.8);
        }
        for (let i = 0; i < 5; i++) vine(g, 20 + r() * (w - 40), 10 + r() * 60, 90 + r() * 80, Math.PI / 2 + (r() - 0.5), c.moss, r);
      }
    },
  },
  {
    id: 'stone-idol', name: 'Carved idol', cat: 'religious', sets: ['jungle', 'temple', 'desert', 'alien'], tags: ['statue', 'head', 'totem', 'monolith', 'carving', 'shrine'],
    w: 1, h: 1, blocksMovement: true, c: { stone: '#8a8574', eye: '#e2b13a' },
    variants: [{ name: 'Grey stone', c: {} }, { name: 'Jade', c: { stone: '#4f8a6a', eye: '#d8f0a0' } }, { name: 'Obsidian', c: { stone: '#2e2a30', eye: '#b06aff' } }, { name: 'Glowing eyes', c: { eye: '#6af0ff' }, f: { glow: 1 } }],
    desc: 'A great carved stone head staring skyward.',
    draw: ({ g, w, h, c, f, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      g.fillStyle = 'rgba(0,0,0,0.25)';
      ellipse(g, cx + 6, cy + 8, 40, 42); g.fill();
      blob(g, lumpy(cx, cy, 38, 0.06, 10, r, 42));
      paint(g, domeFill(g, cx, cy, 40, c.stone, 0.4), INK, LW);
      // brow, eyes, mouth
      line(g, cx - 24, cy - 14, cx + 24, cy - 14, alpha(INK, 0.8), 3);
      for (const s of [-1, 1]) {
        if (f.glow) glow(g, cx + s * 13, cy - 5, 14, c.eye, 0.6);
        ellipse(g, cx + s * 13, cy - 5, 7, 4);
        paint(g, c.eye, INK, 1.2);
      }
      g.fillStyle = shade(c.stone, -0.45);
      g.fillRect(cx - 14, cy + 14, 28, 7);
      speckle(g, cx - 34, cy - 34, 68, 68, r, 14, alpha(shade(c.stone, -0.4), 0.6), 1.2);
    },
  },

  // --- alien fungus ---
  {
    id: 'fungus-tower', name: 'Fungus tower', cat: 'nature', sets: ['alien', 'cave', 'swamp'], tags: ['mushroom', 'giant', 'alien', 'bioluminescent', 'shelf', 'canopy', 'glow'],
    w: 3, h: 3, layer: 'overhead', blocksSight: true, light: { bright: 10, dim: 15, color: '#7af0d8' }, c: { cap: '#4a2f6e', spot: '#7af0d8' },
    variants: [{ name: 'Violet & teal', c: {} }, { name: 'Teal & pink', c: { cap: '#1f5a5a', spot: '#ff8ad8' } }, { name: 'Amber', c: { cap: '#7a4a1e', spot: '#ffd36a' } }, { name: 'Ghost white', c: { cap: '#8a8aa0', spot: '#d8f0ff' } }],
    desc: 'A cluster of house-tall alien mushrooms that glow from beneath. Bright light 10 ft, dim 15 ft.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      glow(g, cx, cy, 150, c.spot, 0.3);
      shadowDisc(g, cx, cy, 120, 0.18);
      const caps: [number, number, number][] = [[cx - 52, cy + 40, 52], [cx + 58, cy + 30, 46], [cx + 20, cy - 60, 58], [cx - 40, cy - 28, 64]];
      for (const [x, y, R] of caps) alienCap(g, x + (r() - 0.5) * 10, y + (r() - 0.5) * 10, R, shade(c.cap, (r() - 0.5) * 0.2), c.spot, r);
    },
  },
  {
    id: 'glow-pods', name: 'Glow pods', cat: 'light', sets: ['alien', 'cave', 'swamp', 'jungle'], tags: ['bioluminescent', 'bulbs', 'alien', 'plant', 'light', 'eggs'],
    w: 1, h: 1, light: { bright: 5, dim: 10, color: '#7af0d8' }, c: { pod: '#7af0d8', stalk: '#2f4a4a' },
    variants: [{ name: 'Teal', c: {} }, { name: 'Pink', c: { pod: '#ff8ad8' } }, { name: 'Gold', c: { pod: '#ffd36a' } }, { name: 'Violet', c: { pod: '#b38aff' } }],
    desc: 'Clustered bulbs that glow softly. Bright light 5 ft, dim 10 ft.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      glow(g, cx, cy, 48, c.pod, 0.5);
      const n = 4 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + r(), d = 12 + r() * 22, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
        line(g, cx, cy, x, y, c.stalk, 3);
        const R = 10 + r() * 8;
        circle(g, x, y, R);
        paint(g, domeFill(g, x, y, R, c.pod, 0.5), alpha(INK, 0.6), 1);
        circle(g, x - R * 0.3, y - R * 0.3, R * 0.3);
        paint(g, 'rgba(255,255,255,0.6)', null);
      }
    },
  },
  {
    id: 'spore-vent', name: 'Spore vent', cat: 'hazard', sets: ['alien', 'cave', 'swamp'], tags: ['spores', 'gas', 'cloud', 'fungus', 'poison', 'crater', 'hazard'],
    w: 1, h: 1, difficult: true, c: { rim: '#5a4a6e', spore: '#c8f07a' },
    variants: [{ name: 'Green spores', c: {} }, { name: 'Pink spores', c: { spore: '#ff9ad8' } }, { name: 'Gold spores', c: { spore: '#ffd36a' } }],
    desc: 'A fungal crater that puffs out spores. Difficult ground; the GM decides what the spores do.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      blob(g, lumpy(cx, cy, 44, 0.18, 10, r));
      paint(g, domeFill(g, cx, cy, 44, c.rim, 0.4), INK, LW);
      circle(g, cx, cy, 16);
      paint(g, '#120c18', INK, 1.2);
      for (let i = 0; i < 14; i++) {
        const a = r() * TAU, d = r() * 40;
        glow(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 10 + r() * 10, c.spore, 0.35);
      }
      speckle(g, cx - 40, cy - 40, 80, 80, r, 30, alpha(c.spore, 0.9), 1.6);
    },
  },
  {
    id: 'tendrils', name: 'Alien tendrils', cat: 'nature', sets: ['alien', 'swamp', 'cave'], tags: ['coils', 'tentacles', 'alien', 'plant', 'creepers', 'difficult'],
    w: 2, h: 2, difficult: true, c: { skin: '#6a3a7a', tip: '#7af0d8' },
    variants: [{ name: 'Violet', c: {} }, { name: 'Teal', c: { skin: '#1f6a6a', tip: '#ff8ad8' } }, { name: 'Crimson', c: { skin: '#7a2a3a', tip: '#ffd36a' } }],
    desc: 'Coiled alien stalks that curl up from the ground. Difficult ground.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      for (let i = 0; i < 7; i++) {
        const x = 30 + r() * (w - 60), y = 30 + r() * (h - 60), a0 = r() * TAU, n = 22;
        g.beginPath();
        let px = x, py = y;
        g.moveTo(px, py);
        for (let k = 1; k <= n; k++) {
          const t = k / n, a = a0 + t * 5.5, rad = 30 * (1 - t) + 4;
          px = x + Math.cos(a) * rad;
          py = y + Math.sin(a) * rad;
          g.lineTo(px, py);
        }
        g.strokeStyle = INK;
        g.lineWidth = 8;
        g.stroke();
        g.strokeStyle = shade(c.skin, (r() - 0.5) * 0.3);
        g.lineWidth = 5;
        g.stroke();
        glow(g, px, py, 10, c.tip, 0.5);
        circle(g, px, py, 3.5);
        paint(g, c.tip, null);
      }
    },
  },
  {
    id: 'tree-alien', name: 'Umbrella tree', cat: 'nature', sets: ['alien', 'jungle'], tags: ['alien', 'tree', 'canopy', 'fronds', 'bioluminescent'],
    w: 3, h: 3, layer: 'overhead', blocksSight: true, c: { frond: '#2f6a6a', vein: '#9af0e0', bulb: '#ff8ad8' },
    variants: [{ name: 'Teal', c: {} }, { name: 'Violet', c: { frond: '#4a2f6e', vein: '#d8b0ff', bulb: '#7af0d8' } }, { name: 'Crimson', c: { frond: '#6a2a2a', vein: '#ffb08a', bulb: '#ffd36a' } }],
    desc: 'A tall stalk topped with a fan of glowing-veined fronds. Tokens can stand beneath it.',
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed), cx = w / 2, cy = h / 2;
      shadowDisc(g, cx, cy, 130, 0.2);
      const n = 11;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + r() * 0.2;
        leaf(g, cx, cy, a, 140, 30, shade(c.frond, (r() - 0.5) * 0.2), 1.4);
        const ca = Math.cos(a), sa = Math.sin(a);
        for (let k = 1; k < 5; k++) {
          const t = k / 5;
          line(g, cx + ca * 140 * t, cy + sa * 140 * t, cx + ca * 140 * t + Math.cos(a + 0.8) * 16 * (1 - t), cy + sa * 140 * t + Math.sin(a + 0.8) * 16 * (1 - t), alpha(c.vein, 0.7), 1);
        }
        line(g, cx, cy, cx + ca * 128, cy + sa * 128, alpha(c.vein, 0.85), 1.4);
      }
      for (let i = 0; i < 6; i++) {
        const a = r() * TAU, d = 20 + r() * 20;
        glow(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 12, c.bulb, 0.5);
        circle(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 5);
        paint(g, c.bulb, alpha(INK, 0.5), 0.8);
      }
      circle(g, cx, cy, 14);
      paint(g, domeFill(g, cx, cy, 14, shade(c.frond, -0.3), 0.4), INK, 1.4);
    },
  },
];

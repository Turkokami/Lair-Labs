// Style examples for the object library. Other files in this folder follow the same look:
// top-down, light from the top-left, ink outline, soft gradients, a little seeded wear.
import type { ObjDef } from '../art/types';
import { rng, circle, rr, paint, domeFill, litFill, strap, grain, planks, foliage, flame, shade, alpha, INK, LW, WOOD, METAL, CLOTH, vars, coins, speckle } from '../art/kit';

export const CORE_OBJECTS: ObjDef[] = [
  {
    id: 'barrel', name: 'Barrel', cat: 'storage', sets: ['tavern', 'dungeon', 'ship', 'town', 'market'], tags: ['keg', 'ale', 'water'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.oak, metal: METAL.iron }, variants: vars('wood', WOOD),
    desc: 'Oak barrel with iron hoops, seen from above.',
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      circle(g, 50, 50, 40);
      paint(g, domeFill(g, 50, 50, 40, c.wood, 0.25), INK, LW * 1.1);
      // staves
      g.save();
      circle(g, 50, 50, 40);
      g.clip();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        g.strokeStyle = alpha(shade(c.wood, -0.55), 0.55);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30);
        g.lineTo(50 + Math.cos(a) * 41, 50 + Math.sin(a) * 41);
        g.stroke();
      }
      g.restore();
      // hoops
      circle(g, 50, 50, 37);
      g.strokeStyle = INK;
      g.lineWidth = 6;
      g.stroke();
      g.strokeStyle = shade(c.metal, 0.15);
      g.lineWidth = 3.6;
      g.stroke();
      // lid boards
      g.save();
      circle(g, 50, 50, 29);
      g.clip();
      planks(g, 20, 20, 60, 60, shade(c.wood, 0.08), r, 'v', 4);
      g.restore();
      circle(g, 50, 50, 29);
      g.strokeStyle = INK;
      g.lineWidth = 1.6;
      g.stroke();
      circle(g, 62, 42, 3.4);
      paint(g, shade(c.wood, -0.5), INK, 1);
    },
  },
  {
    id: 'chest', name: 'Chest', cat: 'treasure', sets: ['dungeon', 'crypt', 'ship', 'castle', 'tavern'], tags: ['loot', 'box', 'locked'],
    w: 1, h: 1, blocksMovement: true, c: { wood: WOOD.walnut, metal: METAL.brass },
    variants: [
      { name: 'Walnut and brass', c: {} },
      { name: 'Oak and iron', c: { wood: WOOD.oak, metal: METAL.iron } },
      { name: 'Painted red', c: { wood: '#8e2f25', metal: METAL.gold } },
      { name: 'Open with gold', c: {}, f: { open: 1 } },
    ],
    draw: ({ g, c, f, seed }) => {
      const r = rng(seed);
      const x = 12, y = 22, w = 76, h = 56;
      if (f.open) {
        // lid tipped back (top), inside showing coins
        rr(g, x, y - 16, w, 18, 4);
        paint(g, litFill(g, x, y - 16, w, 18, shade(c.wood, -0.2)), INK, LW);
        rr(g, x, y, w, h, 5);
        paint(g, litFill(g, x, y, w, h, c.wood), INK, LW * 1.1);
        rr(g, x + 7, y + 7, w - 14, h - 14, 3);
        paint(g, '#2a1a10', INK, 1.2);
        coins(g, 50, y + h / 2, 22, 34, r);
        strap(g, x, y + 2, 7, h - 4, c.metal);
        strap(g, x + w - 7, y + 2, 7, h - 4, c.metal);
        return;
      }
      rr(g, x, y, w, h, 6);
      paint(g, litFill(g, x, y, w, h, c.wood), INK, LW * 1.1);
      g.save();
      rr(g, x, y, w, h, 6);
      g.clip();
      grain(g, x, y, w, h, c.wood, r, 'h', 6);
      // rounded lid shine
      const sh = g.createLinearGradient(0, y, 0, y + h);
      sh.addColorStop(0, 'rgba(255,255,255,0.18)');
      sh.addColorStop(0.45, 'rgba(255,255,255,0)');
      sh.addColorStop(1, 'rgba(0,0,0,0.25)');
      g.fillStyle = sh;
      g.fillRect(x, y, w, h);
      g.restore();
      strap(g, x + 12, y, 8, h, c.metal);
      strap(g, x + w - 20, y, 8, h, c.metal);
      rr(g, x - 1, y - 1, w + 2, 7, 3);
      paint(g, litFill(g, x, y, w, 7, c.metal, 0.3), INK, 1.2);
      // lock plate
      rr(g, 43, y + h - 16, 14, 16, 2);
      paint(g, litFill(g, 43, y + h - 16, 14, 16, c.metal, 0.35), INK, 1.2);
      circle(g, 50, y + h - 9, 2);
      paint(g, '#111', null);
    },
  },
  {
    id: 'brazier', name: 'Brazier', cat: 'light', sets: ['dungeon', 'temple', 'castle', 'crypt', 'cave'], tags: ['fire', 'coals', 'light'],
    w: 1, h: 1, blocksMovement: true, light: { bright: 10, dim: 10, color: '#ff9a40' }, c: { metal: METAL.iron, fire: '#ffb02e' },
    variants: [{ name: 'Iron', c: {} }, { name: 'Bronze', c: { metal: METAL.bronze } }, { name: 'Witch-fire', c: { metal: METAL.black, fire: '#59e08a' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // three feet
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i / 3) * Math.PI * 2;
        rr(g, 50 + Math.cos(a) * 36 - 5, 50 + Math.sin(a) * 36 - 5, 10, 10, 3);
        paint(g, litFill(g, 0, 0, 100, 100, c.metal), INK, 1.4);
      }
      circle(g, 50, 50, 34);
      paint(g, domeFill(g, 50, 50, 34, c.metal, 0.3), INK, LW);
      circle(g, 50, 50, 27);
      paint(g, '#1d1612', INK, 1.4);
      // coals
      for (let i = 0; i < 14; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 20;
        circle(g, 50 + Math.cos(a) * d, 50 + Math.sin(a) * d, 3 + r() * 3);
        paint(g, r() < 0.5 ? '#3a2219' : '#c2410c', null);
      }
      const hot = c.fire === '#ffb02e' ? ['#fff3b0', '#ffb02e', '#e2481b'] : ['#e9ffe9', c.fire, shade(c.fire, -0.4)];
      flame(g, 50, 50, 15, r, hot[0], hot[1], hot[2]);
    },
  },
  {
    id: 'rug', name: 'Rug', cat: 'decor', sets: ['tavern', 'castle', 'town', 'wizard', 'temple'], tags: ['carpet', 'floor'],
    w: 2, h: 3, layer: 'floor', flat: true, c: { cloth: CLOTH.red, trim: CLOTH.gold, motif: CLOTH.blue }, variants: [
      { name: 'Red', c: {} }, { name: 'Blue', c: { cloth: CLOTH.blue, motif: CLOTH.red } }, { name: 'Green', c: { cloth: CLOTH.green, motif: CLOTH.gold } }, { name: 'Purple', c: { cloth: CLOTH.purple, motif: CLOTH.gold } },
    ],
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      rr(g, 8, 6, w - 16, h - 12, 3);
      paint(g, litFill(g, 8, 6, w - 16, h - 12, c.cloth, 0.08), INK, 1.6);
      rr(g, 16, 14, w - 32, h - 28, 2);
      g.strokeStyle = c.trim;
      g.lineWidth = 3;
      g.stroke();
      // central diamond
      g.beginPath();
      g.moveTo(w / 2, 40);
      g.lineTo(w - 40, h / 2);
      g.lineTo(w / 2, h - 40);
      g.lineTo(40, h / 2);
      g.closePath();
      paint(g, c.motif, c.trim, 2.5);
      g.beginPath();
      g.moveTo(w / 2, 80);
      g.lineTo(w - 70, h / 2);
      g.lineTo(w / 2, h - 80);
      g.lineTo(70, h / 2);
      g.closePath();
      paint(g, c.trim, null);
      // fringe
      g.strokeStyle = shade(c.trim, -0.1);
      g.lineWidth = 1.2;
      for (let x = 12; x < w - 10; x += 4) {
        g.beginPath(); g.moveTo(x, 6); g.lineTo(x, 1); g.stroke();
        g.beginPath(); g.moveTo(x, h - 6); g.lineTo(x, h - 1); g.stroke();
      }
      speckle(g, 10, 8, w - 20, h - 16, r, 40, 'rgba(0,0,0,0.12)', 1.5);
    },
  },
  {
    id: 'tree-oak', name: 'Oak tree', cat: 'nature', sets: ['forest', 'town', 'farm', 'camp'], tags: ['tree', 'canopy', 'cover'],
    w: 3, h: 3, layer: 'overhead', blocksSight: true, c: { leaf: '#4f7a34', trunk: '#5a3d24' },
    variants: [{ name: 'Summer', c: {} }, { name: 'Autumn', c: { leaf: '#b5602a' } }, { name: 'Dark wood', c: { leaf: '#2f4f2a' } }, { name: 'Blossom', c: { leaf: '#d98fb0' } }],
    draw: ({ g, w, h, c, seed }) => {
      const r = rng(seed);
      // trunk and roots peek out under the canopy
      for (let i = 0; i < 5; i++) {
        const a = r() * Math.PI * 2;
        g.beginPath();
        g.moveTo(w / 2, h / 2);
        g.lineTo(w / 2 + Math.cos(a) * 60, h / 2 + Math.sin(a) * 60);
        g.strokeStyle = INK;
        g.lineWidth = 9;
        g.stroke();
        g.strokeStyle = c.trunk;
        g.lineWidth = 6;
        g.stroke();
      }
      foliage(g, w / 2, h / 2, 138, c.leaf, r, 14);
    },
  },
];


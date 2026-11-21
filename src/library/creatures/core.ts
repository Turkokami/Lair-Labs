// Style example for creature tokens: a front-facing bust or head that fills the round token.
// Light from the top-left, ink outlines, bold readable shapes that still read at 40 px on a phone.
import type { CreatureDef } from '../art/types';
import { rng, blob, paint, domeFill, ellipse, circle, poly, shade, alpha, INK, LW } from '../art/kit';

export const CORE_CREATURES: CreatureDef[] = [
  {
    id: 'wolf', name: 'Wolf', family: 'beast', size: 'Medium', srd: 'wolf', cr: '1/4', tags: ['canine', 'pack', 'forest'],
    c: { fur: '#7d7466', belly: '#c9bfae', eye: '#f2c14e' },
    variants: [{ name: 'Grey', c: {} }, { name: 'Black', c: { fur: '#2f2c2a', belly: '#5b5550' } }, { name: 'White', c: { fur: '#d8d4cc', belly: '#f4f1ea', eye: '#7cc6e8' } }, { name: 'Brown', c: { fur: '#7a5536', belly: '#c49a6c' } }],
    draw: ({ g, c, seed }) => {
      const r = rng(seed);
      // shoulders
      blob(g, [[6, 104], [14, 74], [34, 64], [66, 64], [86, 74], [94, 104]]);
      paint(g, domeFill(g, 50, 84, 50, shade(c.fur, -0.15), 0.25), INK, LW);
      // ears
      for (const s of [-1, 1]) {
        poly(g, [[50 + s * 14, 30], [50 + s * 30, 6], [50 + s * 34, 38]]);
        paint(g, domeFill(g, 50 + s * 26, 24, 16, c.fur), INK, LW);
        poly(g, [[50 + s * 20, 30], [50 + s * 29, 14], [50 + s * 30, 34]]);
        paint(g, '#3b2a2a', null);
      }
      // head
      blob(g, [[50, 18], [74, 26], [80, 46], [70, 66], [50, 76], [30, 66], [20, 46], [26, 26]]);
      paint(g, domeFill(g, 46, 40, 34, c.fur, 0.3), INK, LW);
      // muzzle and ruff
      blob(g, [[50, 44], [64, 54], [62, 72], [50, 82], [38, 72], [36, 54]]);
      paint(g, domeFill(g, 48, 60, 22, c.belly, 0.25), INK, LW * 0.8);
      ellipse(g, 50, 58, 7, 5);
      paint(g, '#1a1414', INK, 1);
      ellipse(g, 48, 56.5, 2.2, 1.2);
      g.fillStyle = 'rgba(255,255,255,0.6)';
      g.fill();
      g.beginPath();
      g.moveTo(50, 63); g.lineTo(50, 70); g.moveTo(44, 72); g.quadraticCurveTo(50, 75, 56, 72);
      g.strokeStyle = INK; g.lineWidth = 1.3; g.stroke();
      // eyes
      for (const s of [-1, 1]) {
        ellipse(g, 50 + s * 12, 42, 5.5, 3.6, s * 0.25);
        paint(g, c.eye, INK, 1.3);
        circle(g, 50 + s * 12, 42, 1.8);
        g.fillStyle = '#111'; g.fill();
        circle(g, 50 + s * 12 - 1.4, 41, 0.9);
        g.fillStyle = '#fff'; g.fill();
      }
      // fur strokes
      g.strokeStyle = alpha(shade(c.fur, -0.45), 0.6);
      g.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const x = 26 + r() * 48, y = 24 + r() * 40;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + (x < 50 ? -3 : 3), y + 4); g.stroke();
      }
    },
  },
];

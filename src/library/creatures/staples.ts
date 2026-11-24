// Staple tokens every table reaches for: witches, wizards and other spellcasting NPCs, skeleton and undead
// regulars, common townsfolk and court folk, a quick generic dragon. Most are busts from portrait.ts with a
// few props drawn here (brooms, pitchforks, hammers, spectacles, hoods, a bone dragon, a familiar cat).
// Original art drawn with the Canvas 2D API. Names are generic folklore and fantasy names.
import type { Colors, CreatureDef, CreatureFamily, CreatureSize, DrawArgs, G, Variant } from '../art/types';
import { rng, blob, paint, domeFill, litFill, ellipse, circle, poly, rr, shade, mix, alpha, glow, line, gem, INK, LW } from '../art/kit';
import { drawBust, taper, sparkle, leaf, fist, type BustOpts } from './portrait';
import { colorOpts } from './people';
import { BEAST_CREATURES } from './beasts';

type Opts = Partial<BustOpts>;

/** What an overlay needs to know about the bust it draws on. */
interface X {
  g: G;
  c: Colors;
  f: Record<string, number>;
  o: BustOpts;
  r: () => number;
  /** Head centre y, half width, half height, eye line. */
  HY: number;
  hw: number;
  hh: number;
  ey: number;
  /** Hand colour for props. */
  hand: string;
}
type Extra = (x: X) => void;

interface Spec {
  id: string;
  name: string;
  family?: CreatureFamily;
  size?: CreatureSize;
  cr?: string;
  tags: string[];
  o: Opts;
  c: Colors;
  variants?: Variant[];
  flags?: (f: Record<string, number>) => Opts;
  /** Drawn behind the bust. */
  under?: Extra;
  /** Drawn over the bust. */
  over?: Extra;
}

function make(s: Spec): CreatureDef {
  const def: CreatureDef = {
    id: s.id, name: s.name, family: s.family ?? 'humanoid', size: s.size ?? 'Medium', tags: s.tags, c: s.c, variants: s.variants,
    draw: ({ g, c, f, seed }) => {
      const o = { ...s.o, ...colorOpts(c), ...(s.flags ? s.flags(f) : {}) } as BustOpts;
      const hw = o.headW ?? 19, hh = o.headH ?? 23, HY = o.headY ?? 44;
      let skin = o.skin;
      if (o.pallor) skin = mix(skin, '#cfd6d4', o.pallor);
      if (o.rot) skin = mix(skin, '#7d8f5a', o.rot * 0.5);
      const hand = o.outfit === 'plate' ? (o.metal ?? '#9ea4ab') : skin;
      const x: X = { g, c, f, o, r: rng(seed * 17 + 3), HY, hw, hh, ey: HY + hh * 0.06, hand };
      if (s.under) {
        g.save();
        s.under(x);
        g.restore();
      }
      drawBust(g, o, seed);
      if (s.over) {
        g.save();
        if (o.ghost !== undefined) g.globalAlpha = o.ghost;
        s.over(x);
        g.restore();
      }
    },
  };
  if (s.cr) def.cr = s.cr;
  return def;
}

// ------------------------------------------------------------------ props held in a hand (drawn on the right, mirrored for the left)

function onSide(g: G, side: 'L' | 'R', fn: () => void) {
  g.save();
  if (side === 'L') {
    g.translate(100, 0);
    g.scale(-1, 1);
  }
  fn();
  g.restore();
}

const WOOD = '#7a5032';
const GOLD = '#d9b44a';
const IRON = '#7c8288';

function cuppedHand(g: G, hand: string) {
  g.beginPath();
  g.moveTo(66, 90); g.quadraticCurveTo(77, 99, 90, 88); g.quadraticCurveTo(88, 82, 78, 84); g.quadraticCurveTo(70, 84, 66, 90);
  g.closePath();
  paint(g, domeFill(g, 78, 88, 12, hand, 0.3), INK, 1.3);
}

function broom(x: X, side: 'L' | 'R' = 'R') {
  const { g, hand } = x;
  const straw = x.c.straw ?? '#d8b25a';
  onSide(g, side, () => {
    taper(g, [[80, 112], [83, 70], [86, 30]], 4.6, 4, 3);
    paint(g, litFill(g, 78, 30, 10, 82, WOOD, 0.3), INK, 1.3);
    // bristles fanning up
    blob(g, [[81, 36], [91, 36], [100, 12], [95, 2], [84, 0], [73, 2], [70, 12]]);
    paint(g, litFill(g, 70, 0, 30, 36, straw, 0.3), INK, 1.5);
    g.strokeStyle = alpha(shade(straw, -0.5), 0.7);
    g.lineWidth = 0.8;
    g.beginPath();
    for (let i = 0; i < 7; i++) {
      const tx = 74 + i * 3.8;
      g.moveTo(84 + (i - 3) * 0.8, 33); g.lineTo(tx, 3);
    }
    g.stroke();
    rr(g, 79.5, 31, 13, 5, 1.5);
    paint(g, x.c.band ?? '#7a2a5a', INK, 1);
    fist(g, 83, 80, 10, hand);
  });
}

function pitchfork(x: X) {
  const { g, hand } = x;
  rr(g, 81.5, 28, 5, 90, 2);
  paint(g, litFill(g, 81, 28, 6, 90, '#8a6038', 0.3), INK, 1.3);
  g.beginPath();
  g.moveTo(72, 14); g.quadraticCurveTo(72, 30, 84, 30); g.quadraticCurveTo(96, 30, 96, 14);
  g.strokeStyle = INK; g.lineWidth = 4.6; g.stroke();
  g.strokeStyle = IRON; g.lineWidth = 2.8; g.stroke();
  for (const tx of [72, 84, 96]) {
    taper(g, [[tx, tx === 84 ? 30 : 16], [tx, 2]], 3.2, 0.6, 2);
    paint(g, litFill(g, tx - 2, 0, 4, 30, '#a8aeb5', 0.4), INK, 1);
  }
  fist(g, 84, 78, 10, hand);
}

function smithHammer(x: X) {
  const { g, hand } = x;
  rr(g, 83, 48, 6, 54, 2);
  paint(g, litFill(g, 83, 48, 6, 54, WOOD, 0.3), INK, 1.3);
  rr(g, 70, 36, 32, 15, 2.5);
  paint(g, litFill(g, 70, 36, 32, 15, '#5c6268', 0.45), INK, LW * 0.9);
  rr(g, 70, 36, 5, 15, 1.5);
  paint(g, '#8a9096', INK, 1);
  line(g, 74, 39, 98, 39, alpha('#ffffff', 0.35), 1.2);
  fist(g, 86, 84, 10, hand);
}

function pickaxe(x: X) {
  const { g, hand } = x;
  rr(g, 81.5, 38, 5, 70, 2);
  paint(g, litFill(g, 81, 38, 6, 70, WOOD, 0.3), INK, 1.3);
  taper(g, [[84, 40], [74, 38], [62, 48]], 7, 1.4, 4);
  paint(g, litFill(g, 60, 34, 26, 16, '#6c7278', 0.45), INK, 1.4);
  taper(g, [[84, 40], [94, 38], [102, 46]], 7, 1.4, 4);
  paint(g, litFill(g, 82, 34, 22, 16, '#6c7278', 0.45), INK, 1.4);
  rr(g, 79.5, 34, 9, 10, 2);
  paint(g, '#5a5e64', INK, 1);
  fist(g, 84, 82, 10, hand);
}

function handBell(x: X) {
  const { g, hand } = x;
  const bell = x.c.item ?? '#d9a83a';
  rr(g, 81, 48, 5, 14, 2);
  paint(g, litFill(g, 81, 48, 5, 14, WOOD, 0.3), INK, 1.2);
  g.beginPath();
  g.moveTo(76, 64); g.quadraticCurveTo(76, 58, 83.5, 58); g.quadraticCurveTo(91, 58, 91, 64);
  g.lineTo(94, 80); g.quadraticCurveTo(83.5, 84, 73, 80); g.closePath();
  paint(g, litFill(g, 72, 58, 23, 26, bell, 0.45), INK, 1.5);
  ellipse(g, 83.5, 80, 10.5, 3);
  paint(g, shade(bell, -0.35), INK, 1.2);
  circle(g, 85, 84, 2.6);
  paint(g, shade(bell, -0.2), INK, 1);
  // ring lines
  g.strokeStyle = alpha('#fff3c0', 0.85);
  g.lineWidth = 1.3;
  g.beginPath();
  g.arc(83.5, 70, 18, -0.5, 0.3);
  g.moveTo(98, 60); g.arc(83.5, 70, 22, -0.6, 0.35);
  g.stroke();
  fist(g, 83.5, 46, 8.5, hand);
}

function spyglass(x: X) {
  const { g, hand } = x;
  g.save();
  g.translate(80, 76);
  g.rotate(-0.62);
  rr(g, -4, -6.5, 26, 13, 3);
  paint(g, litFill(g, -4, -6.5, 26, 13, '#b8873a', 0.4), INK, 1.4);
  rr(g, -22, -5, 20, 10, 2.5);
  paint(g, litFill(g, -22, -5, 20, 10, '#2a3a5a', 0.3), INK, 1.3);
  rr(g, 20, -7.5, 5, 15, 1.5);
  paint(g, GOLD, INK, 1.1);
  rr(g, -25, -6, 4, 12, 1.5);
  paint(g, GOLD, INK, 1);
  g.restore();
  fist(g, 82, 76, 9.5, hand);
}

function flask(x: X, col = x.c.item ?? '#7aff6a') {
  const { g, hand } = x;
  cuppedHand(g, hand);
  glow(g, 78, 76, 22, col, 0.65);
  rr(g, 74.5, 56, 7, 14, 1.5);
  paint(g, alpha('#e8f4f4', 0.7), INK, 1.2);
  rr(g, 74, 52, 8, 5, 1.5);
  paint(g, '#8a6038', INK, 1);
  circle(g, 78, 77, 10.5);
  paint(g, alpha('#e8f4f4', 0.55), INK, 1.4);
  g.save();
  circle(g, 78, 77, 9.4);
  g.clip();
  g.fillStyle = domeFill(g, 76, 80, 10, col, 0.5);
  g.fillRect(66, 74, 24, 16);
  g.restore();
  for (const [bx, by, br] of [[75, 80, 1.6], [80, 77, 1.1], [77, 72, 0.9]]) {
    circle(g, bx, by, br);
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.fill();
  }
  ellipse(g, 74, 73, 2.4, 3.6, 0.5);
  g.fillStyle = 'rgba(255,255,255,0.6)';
  g.fill();
}

function herbs(x: X, side: 'L' | 'R' = 'R') {
  const { g, hand, r } = x;
  const green = x.c.herb ?? '#5f9a43';
  const bloom = x.c.bloom ?? '#b57ad8';
  onSide(g, side, () => {
    g.strokeStyle = shade(green, -0.4);
    g.lineWidth = 1.4;
    g.beginPath();
    const tips: number[][] = [];
    for (let i = 0; i < 6; i++) {
      const tx = 70 + i * 4.6 + (r() - 0.5) * 3, ty = 44 + Math.abs(i - 2.5) * 4 + r() * 4;
      g.moveTo(83, 84); g.quadraticCurveTo(83 + (tx - 83) * 0.3, 68, tx, ty);
      tips.push([tx, ty]);
    }
    g.stroke();
    tips.forEach(([tx, ty], i) => {
      leaf(g, tx - 3, ty + 8, 10, 3.6, -1.1, shade(green, (r() - 0.5) * 0.3));
      leaf(g, tx + 3, ty + 12, 9, 3.4, -2.1, shade(green, (r() - 0.5) * 0.3));
      if (i % 2) {
        for (let k = 0; k < 3; k++) {
          circle(g, tx + (r() - 0.5) * 3, ty - k * 3, 1.8);
          paint(g, bloom, alpha(INK, 0.5), 0.5);
        }
      } else leaf(g, tx, ty, 8, 3, -1.57, shade(green, 0.15));
    });
    rr(g, 78, 70, 10, 4, 1.5);
    paint(g, '#c8a060', INK, 0.9);
    fist(g, 83, 82, 9.5, hand);
  });
}

function bowl(x: X) {
  const { g, hand } = x;
  g.save();
  g.translate(-4, -4);
  cuppedHand(g, hand);
  g.beginPath();
  g.moveTo(63, 78); g.quadraticCurveTo(78, 99, 93, 78); g.closePath();
  paint(g, litFill(g, 63, 76, 30, 20, '#8a6038', 0.3), INK, 1.5);
  ellipse(g, 78, 78, 15, 4);
  paint(g, '#3a2818', INK, 1.3);
  ellipse(g, 80, 78, 3.2, 1.5);
  paint(g, '#d9b44a', INK, 0.7);
  ellipse(g, 75, 78.5, 2.8, 1.3);
  paint(g, '#c9ced3', INK, 0.6);
  g.restore();
}

function skullStaff(x: X, glowCol: string) {
  const { g, hand } = x;
  rr(g, 80, 26, 5, 90, 2);
  paint(g, litFill(g, 80, 26, 5, 90, '#3a2a22', 0.3), INK, 1.3);
  glow(g, 82.5, 16, 20, glowCol, 0.7);
  // skull
  const bone = '#e4dbc2';
  rr(g, 77.5, 21, 10, 7, 2);
  paint(g, shade(bone, -0.1), INK, 1.1);
  circle(g, 82.5, 15, 8.5);
  paint(g, domeFill(g, 82.5, 15, 8.5, bone, 0.35), INK, 1.3);
  for (const s of [-1, 1]) {
    ellipse(g, 82.5 + s * 3.4, 16, 2.4, 2.8);
    paint(g, '#120c0a', null);
    circle(g, 82.5 + s * 3.4, 16, 1);
    g.fillStyle = glowCol;
    g.fill();
  }
  poly(g, [[82.5, 19], [81.3, 21.3], [83.7, 21.3]]);
  g.fillStyle = '#120c0a';
  g.fill();
  line(g, 80, 25, 80, 27.5, INK, 0.7);
  line(g, 82.5, 25, 82.5, 27.5, INK, 0.7);
  line(g, 85, 25, 85, 27.5, INK, 0.7);
  fist(g, 82.5, 80, 10, hand);
}

function sceptre(x: X) {
  const { g, hand } = x;
  const jewel = x.c.jewel ?? '#c0303a';
  rr(g, 80.5, 42, 4, 46, 1.5);
  paint(g, litFill(g, 80.5, 42, 4, 46, GOLD, 0.45), INK, 1.2);
  for (const yy of [52, 66]) {
    rr(g, 79, yy, 7, 3, 1);
    paint(g, shade(GOLD, -0.15), INK, 0.9);
  }
  for (const s of [-1, 0, 1]) {
    taper(g, [[82.5, 40], [82.5 + s * 6, 34], [82.5 + s * 4, 26 - (s ? 0 : 4)]], 3, 1, 3);
    paint(g, GOLD, INK, 1);
  }
  glow(g, 82.5, 34, 12, jewel, 0.5);
  gem(g, 82.5, 34, 5, jewel);
  fist(g, 82.5, 82, 10, hand);
}

function marotte(x: X) {
  const { g, hand } = x;
  rr(g, 81, 46, 3.5, 46, 1.5);
  paint(g, litFill(g, 81, 46, 3.5, 46, WOOD, 0.3), INK, 1.1);
  const a = x.c.hat ?? '#a3312c', b = x.c.trim ?? '#e2b84a';
  for (const s of [-1, 1]) {
    taper(g, [[82.5 + s * 2, 34], [82.5 + s * 9, 28], [82.5 + s * 12, 34]], 6, 1.5, 3);
    paint(g, s < 0 ? a : b, INK, 1);
    circle(g, 82.5 + s * 12, 35, 2);
    paint(g, GOLD, INK, 0.8);
  }
  circle(g, 82.5, 40, 6);
  paint(g, domeFill(g, 82.5, 40, 6, '#f0d4b8', 0.3), INK, 1.2);
  circle(g, 80.4, 39.4, 0.9); circle(g, 84.6, 39.4, 0.9);
  g.fillStyle = INK; g.fill();
  g.beginPath(); g.arc(82.5, 41.5, 2.4, 0.3, Math.PI - 0.3);
  g.strokeStyle = INK; g.lineWidth = 0.8; g.stroke();
  rr(g, 77.5, 44.5, 10, 3, 1.2);
  paint(g, b, INK, 0.9);
  fist(g, 82.5, 84, 10, hand);
}

/** Lightning forks around a point (a storm staff head). */
function bolts(g: G, cx: number, cy: number, col: string) {
  glow(g, cx, cy, 26, col, 0.6);
  const forks = [[[0, 0], [-8, -6], [-5, -10], [-14, -18]], [[0, 0], [7, -5], [4, -9], [12, -16]], [[0, 0], [-9, 4], [-6, 7], [-16, 10]], [[0, 0], [10, 5], [7, 9], [15, 14]]];
  for (const pts of forks) {
    g.beginPath();
    pts.forEach(([px, py], i) => (i ? g.lineTo(cx + px, cy + py) : g.moveTo(cx + px, cy + py)));
    g.strokeStyle = alpha(shade(col, -0.4), 0.9); g.lineWidth = 3; g.lineJoin = 'miter'; g.stroke();
    g.strokeStyle = '#ffffff'; g.lineWidth = 1.4; g.stroke();
  }
}

// ------------------------------------------------------------------ things worn on the head

function spectacles(x: X) {
  const { g, hw, ey } = x;
  const ex = hw * 0.42, lr = hw * 0.27;
  for (const s of [-1, 1]) {
    circle(g, 50 + s * ex, ey, lr);
    g.fillStyle = 'rgba(220,240,255,0.18)';
    g.fill();
    g.strokeStyle = INK; g.lineWidth = 2.2; g.stroke();
    g.strokeStyle = x.c.rim ?? GOLD; g.lineWidth = 1.1; g.stroke();
    ellipse(g, 50 + s * ex - lr * 0.35, ey - lr * 0.35, lr * 0.3, lr * 0.16, -0.6);
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.fill();
  }
  g.beginPath();
  g.moveTo(50 - ex + lr, ey - 1); g.quadraticCurveTo(50, ey - 3.5, 50 + ex - lr, ey - 1);
  g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke();
  for (const s of [-1, 1]) line(g, 50 + s * (ex + lr), ey - 1, 50 + s * hw * 0.98, ey - 2.5, INK, 1.4);
}

function goggles(x: X) {
  const { g, hw, HY, hh } = x;
  const y = HY - hh * 0.5;
  g.beginPath();
  g.moveTo(50 - hw * 1.04, y + 3); g.quadraticCurveTo(50, y - 4, 50 + hw * 1.04, y + 3);
  g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  g.strokeStyle = '#4a3424'; g.lineWidth = 3.4; g.stroke();
  for (const s of [-1, 1]) {
    const gx = 50 + s * hw * 0.4;
    circle(g, gx, y, hw * 0.3);
    paint(g, domeFill(g, gx, y, hw * 0.3, '#b8873a', 0.4), INK, 1.4);
    circle(g, gx, y, hw * 0.2);
    paint(g, domeFill(g, gx - 1, y - 1, hw * 0.2, x.c.lens ?? '#5ab0a0', 0.6), INK, 1);
    circle(g, gx - 1.6, y - 1.6, 1.2);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.fill();
  }
}

function jesterHat(x: X) {
  const { g, hw, HY, hh } = x;
  const a = x.c.hat ?? '#a3312c', b = x.c.trim ?? '#e2b84a';
  // floppy points first (behind the cap)
  const pts: [number[][], string][] = [
    [[[50 - hw * 0.5, HY - hh * 0.95], [50 - hw * 1.35, HY - hh * 1.55], [50 - hw * 1.85, HY - hh * 1.2], [50 - hw * 1.8, HY - hh * 0.7]], b],
    [[[50 + hw * 0.5, HY - hh * 0.95], [50 + hw * 1.35, HY - hh * 1.55], [50 + hw * 1.85, HY - hh * 1.2], [50 + hw * 1.8, HY - hh * 0.7]], a],
    [[[50, HY - hh * 1.05], [50 - 2, HY - hh * 1.6], [50 + 8, HY - hh * 1.95], [50 + 16, HY - hh * 1.75]], b],
  ];
  for (const [p, col] of pts) {
    taper(g, p, 15, 3, 6);
    paint(g, litFill(g, 0, HY - hh * 2, 100, hh * 1.4, col, 0.3), INK, LW * 0.9);
  }
  for (const [p] of pts) {
    const t = p[p.length - 1];
    glow(g, t[0], t[1] + 2, 6, '#ffe08a', 0.5);
    circle(g, t[0], t[1] + 2, 3.4);
    paint(g, domeFill(g, t[0], t[1] + 2, 3.4, GOLD, 0.5), INK, 1);
  }
  // cap, split in two colours
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(50, HY - hh * 1.2);
    g.quadraticCurveTo(50 + s * hw * 1.0, HY - hh * 1.18, 50 + s * hw * 1.1, HY - hh * 0.4);
    g.lineTo(50, HY - hh * 0.52);
    g.closePath();
    paint(g, litFill(g, 50 - hw, HY - hh * 1.2, hw * 2, hh, s < 0 ? a : b, 0.3), INK, LW * 0.9);
  }
  // band with diamonds
  g.beginPath();
  g.moveTo(50 - hw * 1.1, HY - hh * 0.4); g.quadraticCurveTo(50, HY - hh * 0.62, 50 + hw * 1.1, HY - hh * 0.4);
  g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  g.strokeStyle = shade(b, -0.25); g.lineWidth = 4.2; g.stroke();
  for (let i = -2; i <= 2; i++) {
    const dx = 50 + i * hw * 0.42, dy = HY - hh * 0.52 + Math.abs(i) * 1.2;
    poly(g, [[dx, dy - 2.6], [dx + 2.4, dy], [dx, dy + 2.6], [dx - 2.4, dy]]);
    paint(g, i % 2 ? a : '#2b2b30', null);
  }
}

function executionerHood(x: X) {
  const { g, hw, HY, hh, ey } = x;
  const col = x.c.hood ?? '#1e1c20';
  const ex = hw * 0.42;
  g.beginPath();
  g.moveTo(50, HY - hh * 1.5);
  g.quadraticCurveTo(50 + hw * 1.15, HY - hh * 1.3, 50 + hw * 1.22, HY - hh * 0.2);
  g.lineTo(50 + hw * 1.45, HY + hh * 1.05);
  g.quadraticCurveTo(50, HY + hh * 1.3, 50 - hw * 1.45, HY + hh * 1.05);
  g.lineTo(50 - hw * 1.22, HY - hh * 0.2);
  g.quadraticCurveTo(50 - hw * 1.15, HY - hh * 1.3, 50, HY - hh * 1.5);
  g.closePath();
  for (const s of [-1, 1]) {
    const cx = 50 + s * ex;
    g.moveTo(cx + hw * 0.36, ey);
    g.ellipse(cx, ey, hw * 0.36, hw * 0.26, 0, 0, Math.PI * 2, true);
  }
  g.fillStyle = litFill(g, 50 - hw * 1.4, HY - hh * 1.5, hw * 2.8, hh * 2.8, col, 0.25);
  g.fill('evenodd');
  g.strokeStyle = INK; g.lineWidth = LW; g.lineJoin = 'round'; g.stroke();
  // seam and fold
  g.beginPath();
  g.moveTo(50, HY - hh * 1.45); g.quadraticCurveTo(51, HY - hh * 0.9, 50, ey - hw * 0.3);
  g.moveTo(50, ey + hw * 0.4); g.lineTo(50, HY + hh * 1.1);
  g.strokeStyle = alpha(shade(col, 0.4), 0.6); g.lineWidth = 1; g.stroke();
}

function minerLamp(x: X) {
  const { g, HY, hh } = x;
  const y = HY - hh * 0.98;
  glow(g, 50, y, 22, '#ffd27a', 0.7);
  rr(g, 44, y - 4, 12, 9, 2.5);
  paint(g, litFill(g, 44, y - 4, 12, 9, '#b8873a', 0.4), INK, 1.3);
  circle(g, 50, y + 0.5, 3.2);
  paint(g, domeFill(g, 50, y, 3.2, '#fff3b0', 0.5), INK, 0.9);
}

function iceCrown(x: X) {
  const { g, hw, HY, hh } = x;
  const y = HY - hh * 0.7;
  for (let i = 0; i < 7; i++) {
    const t = (i - 3) / 3, px = 50 + t * hw * 0.95, ht = 10 + (3 - Math.abs(i - 3)) * 4;
    poly(g, [[px - 3.4, y + 2 + Math.abs(t) * 3], [px, y - ht + Math.abs(t) * 3], [px + 3.4, y + 2 + Math.abs(t) * 3]]);
    paint(g, litFill(g, px - 4, y - ht, 8, ht, '#cfefff', 0.5), '#2a5a7a', 1.1);
  }
  g.beginPath();
  g.moveTo(50 - hw * 1.02, y + 4); g.quadraticCurveTo(50, y - 2, 50 + hw * 1.02, y + 4);
  g.strokeStyle = '#2a5a7a'; g.lineWidth = 3.4; g.stroke();
  g.strokeStyle = '#e8f8ff'; g.lineWidth = 1.8; g.stroke();
}

/** Moss and weed hanging from a witch's hat brim. */
function brimMoss(x: X) {
  const { g, hw, HY, hh, r } = x;
  const by = HY - hh * 0.62;
  const col = x.c.moss ?? '#6a8a3a';
  for (let i = 0; i < 6; i++) {
    const px = 50 + (i < 3 ? -1 : 1) * hw * (1.15 + (i % 3) * 0.24) + (r() - 0.5) * 2;
    const len = 8 + r() * 10;
    taper(g, [[px, by + 1], [px + (r() - 0.5) * 3, by + len * 0.6], [px + (r() - 0.5) * 4, by + len]], 3.2, 0.8, 3);
    paint(g, shade(col, (r() - 0.5) * 0.3), alpha(INK, 0.7), 0.8);
  }
}

/** Little stars stitched on a robe. */
function robeStars(x: X) {
  const { g } = x;
  const col = x.c.trim ?? '#e9c24a';
  for (const [sx, sy, ss] of [[26, 92, 3.4], [36, 104, 2.4], [68, 98, 3], [20, 104, 2.2], [62, 86, 2]]) sparkle(g, sx, sy, ss, col);
  const moon = (mx: number, my: number, mr: number) => {
    g.beginPath();
    g.arc(mx, my, mr, 0.6, Math.PI * 2 - 0.6);
    g.arc(mx + mr * 0.5, my, mr * 0.75, Math.PI * 2 - 0.9, 0.9, true);
    g.closePath();
    g.fillStyle = col;
    g.fill();
  };
  moon(32, 84, 3.4);
}

/** A few flies around a rotting head. */
function flies(x: X) {
  const { g, r } = x;
  for (let i = 0; i < 6; i++) {
    const a = r() * Math.PI * 2, d = 30 + r() * 12;
    const fx = 50 + Math.cos(a) * d, fy = 40 + Math.sin(a) * d * 0.8;
    ellipse(g, fx - 1.6, fy - 1.2, 1.6, 1, -0.5);
    ellipse(g, fx + 1.6, fy - 1.2, 1.6, 1, 0.5);
    g.fillStyle = 'rgba(230,240,255,0.6)';
    g.fill();
    circle(g, fx, fy, 1.3);
    g.fillStyle = '#141414';
    g.fill();
  }
}

/** Soot smudges on a cheek and brow. */
function soot(x: X) {
  const { g, hw, ey } = x;
  for (const [sx, sy, sr] of [[50 - hw * 0.62, ey + 9, 4], [50 + hw * 0.5, ey - 9, 3], [50 + hw * 0.7, ey + 12, 2.5]]) {
    ellipse(g, sx, sy, sr, sr * 0.6, 0.3);
    g.fillStyle = 'rgba(30,26,24,0.35)';
    g.fill();
  }
}

// ------------------------------------------------------------------ custom heads

/** A witch's familiar: a cat with glowing eyes, a moon charm on its collar and, if flagged, a tiny pointed hat. */
function familiarCat({ g, c, f, seed }: DrawArgs) {
  const r = rng(seed);
  const fur = c.fur, eye = c.eye;
  // shoulders
  blob(g, [[8, 108], [16, 78], [34, 68], [66, 68], [84, 78], [92, 108]]);
  paint(g, domeFill(g, 50, 86, 48, shade(fur, -0.12), 0.25), INK, LW);
  // ears
  for (const s of [-1, 1]) {
    poly(g, [[50 + s * 10, 28], [50 + s * 30, 6], [50 + s * 33, 40]]);
    paint(g, domeFill(g, 50 + s * 26, 22, 16, fur, 0.3), INK, LW);
    poly(g, [[50 + s * 16, 28], [50 + s * 28, 13], [50 + s * 29, 34]]);
    g.fillStyle = c.inner ?? '#c87a8a';
    g.fill();
  }
  // head
  blob(g, [[50, 22], [72, 28], [80, 48], [72, 68], [50, 76], [28, 68], [20, 48], [28, 28]]);
  paint(g, domeFill(g, 46, 42, 34, fur, 0.3), INK, LW);
  if (c.stripe) {
    g.save();
    blob(g, [[50, 22], [72, 28], [80, 48], [72, 68], [50, 76], [28, 68], [20, 48], [28, 28]]);
    g.clip();
    g.strokeStyle = alpha(c.stripe, 0.8);
    g.lineWidth = 2.4;
    g.beginPath();
    for (const dx of [-6, 0, 6]) { g.moveTo(50 + dx, 23); g.lineTo(50 + dx * 0.6, 34); }
    for (const s of [-1, 1]) for (const dy of [0, 6]) { g.moveTo(50 + s * 30, 46 + dy); g.lineTo(50 + s * 22, 48 + dy); }
    g.stroke();
    g.restore();
  }
  // muzzle
  for (const s of [-1, 1]) {
    ellipse(g, 50 + s * 5, 60, 7, 5.5);
    paint(g, domeFill(g, 50 + s * 5, 59, 7, c.muzzle ?? shade(fur, 0.12), 0.25), null);
  }
  poly(g, [[46, 54], [54, 54], [50, 58.5]]);
  paint(g, c.nose ?? '#d27a8a', INK, 1);
  g.beginPath();
  g.moveTo(50, 58.5); g.lineTo(50, 61); g.quadraticCurveTo(47, 64, 44.5, 62); g.moveTo(50, 61); g.quadraticCurveTo(53, 64, 55.5, 62);
  g.strokeStyle = INK; g.lineWidth = 1.2; g.stroke();
  // whiskers
  g.strokeStyle = alpha(c.whisker ?? '#e8e8e8', 0.9);
  g.lineWidth = 0.9;
  g.beginPath();
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { g.moveTo(50 + s * 9, 59 + i * 2); g.lineTo(50 + s * 30, 54 + i * 5 + r() * 2); }
  g.stroke();
  // eyes
  for (const s of [-1, 1]) {
    const ex = 50 + s * 12, ey = 44;
    glow(g, ex, ey, 12, eye, 0.7);
    ellipse(g, ex, ey, 6.4, 5.4, s * 0.15);
    paint(g, domeFill(g, ex, ey - 1, 6.4, eye, 0.5), INK, 1.4);
    ellipse(g, ex, ey, 1.5, 4.6);
    g.fillStyle = '#0c0a0c';
    g.fill();
    circle(g, ex - 2, ey - 2, 1.2);
    g.fillStyle = '#ffffff';
    g.fill();
  }
  // collar with a crescent charm
  g.beginPath();
  g.moveTo(26, 74); g.quadraticCurveTo(50, 86, 74, 74);
  g.strokeStyle = INK; g.lineWidth = 6.4; g.stroke();
  g.strokeStyle = c.collar ?? '#6a3fa0'; g.lineWidth = 4.6; g.stroke();
  glow(g, 50, 86, 9, '#ffe08a', 0.5);
  g.beginPath();
  g.arc(50, 86, 5, 0.5, Math.PI * 2 - 0.5);
  g.arc(52.6, 86, 3.8, Math.PI * 2 - 0.85, 0.85, true);
  g.closePath();
  paint(g, GOLD, INK, 1);
  if (f.hat) {
    const hc = c.hat ?? '#2a2430';
    ellipse(g, 53, 23, 17, 4.4, 0.18);
    paint(g, litFill(g, 36, 18, 34, 10, shade(hc, -0.1), 0.3), INK, 1.6);
    g.beginPath();
    g.moveTo(44, 22); g.quadraticCurveTo(50, 10, 56, 2); g.lineTo(46, -4); g.lineTo(60, 2); g.quadraticCurveTo(62, 14, 63, 25);
    g.closePath();
    paint(g, litFill(g, 44, -4, 20, 30, hc, 0.3), INK, 1.6);
    g.beginPath();
    g.moveTo(44.5, 21); g.quadraticCurveTo(54, 24, 62.6, 24); g.lineTo(62, 20); g.quadraticCurveTo(54, 20, 45.4, 17.5); g.closePath();
    paint(g, c.band ?? '#a3312c', INK, 0.9);
  }
}

/** A dragon raised as bones: wide horned skull, glowing sockets, folded bony wings behind. */
function boneDragon({ g, c, seed }: DrawArgs) {
  const r = rng(seed);
  const bone = c.bone, glowCol = c.glow, mem = c.membrane, horn = c.horn ?? shade(bone, -0.25);
  glow(g, 50, 42, 52, glowCol, 0.3);
  // folded wings: arm up to the wrist, finger bones fanning down, tattered skin between
  for (const s of [-1, 1]) {
    const sh = [50 + s * 22, 84], wr = [50 + s * 38, 22];
    const tips = [[50 + s * 52, 44], [50 + s * 52, 66], [50 + s * 44, 88]];
    g.beginPath();
    g.moveTo(sh[0], sh[1]);
    g.lineTo(wr[0], wr[1]);
    for (const t of tips) g.lineTo(t[0], t[1]);
    g.lineTo(50 + s * 36, 92);
    g.lineTo(50 + s * 38, 82);
    g.lineTo(50 + s * 30, 90);
    g.closePath();
    g.fillStyle = alpha(mem, 0.85);
    g.fill();
    // tears between the fingers
    for (let i = 0; i < tips.length - 1; i++) {
      const a = tips[i], b2 = tips[i + 1];
      const mx = (a[0] + b2[0]) / 2 - s * (5 + r() * 3), my = (a[1] + b2[1]) / 2;
      poly(g, [[a[0], a[1] + 3], [mx, my], [b2[0], b2[1] - 3], [a[0] + s * 4, my]]);
      g.fillStyle = alpha('#000000', 0.35);
      g.fill();
    }
    g.strokeStyle = alpha(INK, 0.6); g.lineWidth = 1;
    g.beginPath(); g.moveTo(sh[0], sh[1]); g.lineTo(wr[0], wr[1]); tips.forEach((t) => g.lineTo(t[0], t[1])); g.stroke();
    for (const t of tips) {
      taper(g, [wr, [(wr[0] + t[0]) / 2 + s * 3, (wr[1] + t[1]) / 2], t], 3.8, 1.2, 3);
      paint(g, shade(bone, -0.1), INK, 1.1);
    }
    taper(g, [sh, [50 + s * 32, 52], wr], 6.5, 4.5, 3);
    paint(g, domeFill(g, wr[0], wr[1] + 20, 26, shade(bone, -0.08), 0.3), INK, 1.4);
    taper(g, [wr, [50 + s * 40, 14], [50 + s * 36, 8]], 4.4, 0.8, 3);
    paint(g, horn, INK, 1.1);
    circle(g, wr[0], wr[1], 4);
    paint(g, domeFill(g, wr[0], wr[1], 4, bone, 0.4), INK, 1.2);
  }
  // neck vertebrae under the jaw
  for (let i = 0; i < 3; i++) {
    const vy = 90 + i * 8, vw = 18 + i * 3;
    rr(g, 50 - vw / 2, vy, vw, 7, 3);
    paint(g, domeFill(g, 50, vy + 3, vw, shade(bone, -0.15), 0.3), INK, 1.3);
  }
  // open lower jaw with teeth pointing up
  blob(g, [[36, 62], [64, 62], [64, 80], [58, 100], [42, 100], [36, 80]]);
  paint(g, domeFill(g, 48, 80, 26, shade(bone, -0.18), 0.3), INK, LW * 0.9);
  blob(g, [[41, 74], [59, 74], [58, 90], [50, 96], [42, 90]]);
  g.fillStyle = '#1a0e10';
  g.fill();
  glow(g, 50, 90, 12, glowCol, 0.5);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const ty = 92 - i * 6, tx = 50 + s * (6 + i * 2);
      poly(g, [[tx - 1.8, ty], [tx + 1.8, ty], [tx, ty - 5]]);
      paint(g, '#f6f0e0', INK, 0.8);
    }
  }
  // horns sweeping out and back, and a smaller pair under them
  for (const s of [-1, 1]) {
    taper(g, [[50 + s * 14, 26], [50 + s * 28, 17], [50 + s * 41, 19], [50 + s * 47, 30]], 11, 1.2, 6);
    paint(g, domeFill(g, 50 + s * 32, 14, 20, horn, 0.4), INK, 1.6);
    taper(g, [[50 + s * 24, 34], [50 + s * 36, 34], [50 + s * 44, 40]], 7, 1, 4);
    paint(g, domeFill(g, 50 + s * 36, 36, 10, horn, 0.4), INK, 1.3);
    // cheek frill spikes
    for (let i = 0; i < 3; i++) {
      const y0 = 46 + i * 7;
      poly(g, [[50 + s * 26, y0 - 3], [50 + s * (38 - i * 3), y0 + 1], [50 + s * 25, y0 + 4]]);
      paint(g, shade(bone, -0.12), INK, 1);
    }
  }
  // skull: wide brow, long snout
  const skull = [[50, 13], [64, 15], [75, 24], [77, 38], [69, 48], [63, 56], [61, 72], [57, 84], [50, 87], [43, 84], [39, 72], [37, 56], [31, 48], [23, 38], [25, 24], [36, 15]];
  blob(g, skull);
  paint(g, domeFill(g, 44, 34, 50, bone, 0.32), INK, LW);
  // upper teeth hanging from the snout edges
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const ty = 64 + i * 5.2, tx = 50 + s * (10.5 - i * 1.1);
      poly(g, [[tx - 1.7, ty], [tx + 1.7, ty], [tx + s * 0.3, ty + 6]]);
      paint(g, '#f6f0e0', INK, 0.8);
    }
  }
  // sockets under angry brow ridges
  for (const s of [-1, 1]) {
    blob(g, [[50 + s * 7, 35], [50 + s * 21, 29], [50 + s * 24, 36], [50 + s * 17, 43], [50 + s * 9, 41]]);
    paint(g, '#120c0a', INK, 1.4);
    glow(g, 50 + s * 16, 36, 14, glowCol, 0.95);
    ellipse(g, 50 + s * 16, 36.5, 3, 2);
    g.fillStyle = '#ffffff';
    g.fill();
    taper(g, [[50 + s * 4, 33], [50 + s * 14, 27], [50 + s * 26, 25]], 5, 2.4, 3);
    paint(g, shade(bone, 0.15), INK, 1.2);
  }
  // nasal ridge and flared nostrils
  line(g, 50, 44, 50, 70, alpha(shade(bone, -0.5), 0.55), 1.3);
  for (const s of [-1, 1]) {
    ellipse(g, 50 + s * 4.5, 78, 2.6, 4, s * 0.4);
    paint(g, '#120c0a', INK, 0.9);
  }
  // cracks
  g.beginPath();
  g.moveTo(58, 15); g.lineTo(55 + r() * 3, 21); g.lineTo(59, 26);
  g.moveTo(40, 50); g.lineTo(43, 55); g.lineTo(41, 60);
  g.strokeStyle = alpha(INK, 0.7);
  g.lineWidth = 1;
  g.stroke();
}

// ------------------------------------------------------------------ the generic dragon

const DRAGON_COLOURS = ['red', 'green', 'blue', 'black', 'white'] as const;
const dragonArt = (k: number): CreatureDef | undefined => BEAST_CREATURES.find((d) => d.id === `dragon-${DRAGON_COLOURS[k] ?? 'red'}-adult`);

const genericDragon: CreatureDef = {
  id: 'dragon', name: 'Dragon', family: 'dragon', size: 'Huge',
  tags: ['dragon', 'wyrm', 'quick', 'generic', 'red', 'green', 'blue', 'black', 'white', 'boss'],
  c: {},
  variants: DRAGON_COLOURS.map((k, i) => ({ name: k[0].toUpperCase() + k.slice(1), c: {}, f: { k: i } })),
  draw: (d) => {
    const art = dragonArt(d.f.k ?? 0);
    if (art) art.draw({ ...d, c: { ...art.c }, f: {} });
  },
};

// ------------------------------------------------------------------ variants

const SKINS: Variant[] = [
  { name: 'Fair', c: {} },
  { name: 'Olive', c: { skin: '#c8996e', hair: '#1e1814' } },
  { name: 'Brown', c: { skin: '#8a5a3c', hair: '#1a1414' } },
  { name: 'Deep', c: { skin: '#5e3a26', hair: '#2a2020' } },
];
const skinVars = (extra: Variant[] = []): Variant[] => [...SKINS, ...extra];
/** Skin tones that keep the character's own hair colour (white beards, red hair). */
const SKINS_KEEP_HAIR: Variant[] = [
  { name: 'Fair', c: {} },
  { name: 'Olive', c: { skin: '#c8996e' } },
  { name: 'Brown', c: { skin: '#8a5a3c' } },
  { name: 'Deep', c: { skin: '#5e3a26' } },
];

// ------------------------------------------------------------------ witches

const WITCHES: Spec[] = [
  {
    id: 'witch', name: 'Witch', tags: ['witch', 'hag', 'spellcaster', 'hex', 'curse', 'potion', 'npc', 'folklore'],
    o: { hat: 'witch', outfit: 'robe', hair: 'long', nose: 'hook', mouth: 'smirk', brows: 'sly', face: 'long', held: 'wand', fx: 'sparkle' },
    c: { skin: '#e8c4a8', hair: '#2a1e1e', outfit: '#2a2430', trim: '#6a3fa0', hat: '#2a2430', eye: '#3f8a5a', glow: '#b07cff' },
    variants: [
      { name: 'Black', c: {} },
      { name: 'Purple', c: { outfit: '#4a2a6a', hat: '#4a2a6a', trim: '#c9a24a', hair: '#b8482a' } },
      { name: 'Green skin', c: { skin: '#8aa86a', hair: '#1a1414', glow: '#9cff7a' } },
      { name: 'Deep, grey hair', c: { skin: '#5e3a26', hair: '#bdb8ae', outfit: '#3a1e2a', hat: '#3a1e2a', trim: '#a3312c', glow: '#ff7a5a' } },
    ],
  },
  {
    id: 'swamp-witch', name: 'Swamp Witch', tags: ['witch', 'swamp', 'bog', 'marsh', 'hag', 'curse', 'npc', 'folklore'],
    o: { hat: 'witch', outfit: 'rags', hair: 'stringy', nose: 'hook', mouth: 'teeth', brows: 'angry', face: 'gaunt', sunken: true, held: 'lantern', heldColor: '#c8ff7a', glowColor: '#c8ff7a', fx: 'fumes', spots: '#5a6a3a' },
    c: { skin: '#b8a88a', hair: '#4a4a2a', outfit: '#3a4a2a', trim: '#5a6a3a', hat: '#3a4a2e', moss: '#6a8a3a', eye: '#d8c84a' },
    variants: [
      { name: 'Moss', c: {} },
      { name: 'Green skin', c: { skin: '#7a9a5a', hair: '#2a2a1e' } },
      { name: 'Peat brown', c: { skin: '#8a6a4a', hat: '#4a3424', outfit: '#4a3a2a', moss: '#8a9a4a' } },
    ],
    over: brimMoss,
  },
  {
    id: 'hedge-witch', name: 'Hedge Witch', tags: ['witch', 'herbs', 'healer', 'village', 'cottage', 'wise woman', 'npc', 'folklore'],
    o: { outfit: 'robe', crown: 'flowers', hair: 'curly', mouth: 'smile', brows: 'calm', mantle: 'leaves', freckles: true, blush: true },
    c: { skin: '#e8c0a0', hair: '#b8602a', outfit: '#7a6040', trim: '#c8b088', mantle: '#5f8a3a', crown: '#f2a7d8', eye: '#3f8a5a', herb: '#5f9a43', bloom: '#b57ad8' },
    variants: [
      { name: 'Fair, red hair', c: {} },
      { name: 'Olive, dark hair', c: { skin: '#c8996e', hair: '#2a1e18', crown: '#ffd166' } },
      { name: 'Brown, grey hair', c: { skin: '#8a5a3c', hair: '#c8c4bc', mantle: '#8a9a4a' } },
      { name: 'Deep, black hair', c: { skin: '#5e3a26', hair: '#1a1414', crown: '#ffffff', bloom: '#ffd166' } },
    ],
    over: (x) => herbs(x),
  },
  {
    id: 'sea-witch', name: 'Sea Witch', tags: ['witch', 'sea', 'ocean', 'coast', 'storm', 'shells', 'npc', 'folklore'],
    o: { outfit: 'gown', hair: 'flowing', crown: 'shells', mouth: 'smirk', brows: 'sly', held: 'orb', heldColor: '#7ae0e0', glowColor: '#7ae0e0', fx: 'drips', beads: '#f2b8a8', face: 'heart' },
    c: { skin: '#d8c0b0', hair: '#2a6a7a', outfit: '#1e4a5a', trim: '#7ad0c0', eye: '#2a6a8a' },
    variants: [
      { name: 'Teal', c: {} },
      { name: 'Black hair', c: { skin: '#a8724c', hair: '#141818', outfit: '#2a2a4a', trim: '#9ab8e0' } },
      { name: 'White hair', c: { skin: '#9cb8c0', hair: '#eef4f6', outfit: '#3a2a5a', glow: '#c0a8ff', held: '#c0a8ff' } },
    ],
  },
  {
    id: 'snow-witch', name: 'Snow Witch', tags: ['witch', 'winter', 'ice', 'frost', 'snow', 'cold', 'npc', 'folklore'],
    o: { hat: 'witch', outfit: 'robe', hair: 'long', mantle: 'fur', mouth: 'neutral', brows: 'calm', face: 'narrow', eyeStyle: 'glow', glowColor: '#9ad8ff', held: 'wand', fx: 'frost', pallor: 0.25 },
    c: { skin: '#f0dcd0', hair: '#eef4f8', outfit: '#3a5a8a', trim: '#cfefff', hat: '#8ab4d4', mantle: '#f2f2f2', glow: '#9ad8ff' },
    variants: [
      { name: 'Ice blue', c: {} },
      { name: 'Midnight', c: { hat: '#1e3a6a', outfit: '#1e3a6a', mantle: '#d8e4ec' } },
      { name: 'Brown skin', c: { skin: '#8a5a3c', hair: '#f6f8fa' } },
    ],
  },
  {
    id: 'witch-elder', name: 'Witch Elder', tags: ['witch', 'coven', 'elder', 'crone', 'hag', 'curse', 'boss', 'npc', 'folklore'],
    o: { hat: 'witch', outfit: 'robe', hair: 'stringy', nose: 'hook', mouth: 'grin', brows: 'heavy', face: 'gaunt', sunken: true, beads: '#d8ccb0', fx: 'eldritch', fx2: 'aura', glowColor: '#9cff7a', spots: '#8a7a6a' },
    c: { skin: '#d8c0a8', hair: '#d8d4cc', outfit: '#1e1a22', trim: '#5a2a3a', hat: '#1e1a22', eye: '#3a2a1a', glow: '#9cff7a' },
    variants: [
      { name: 'Green fire', c: {} },
      { name: 'Red fire', c: { glow: '#ff6a3a', trim: '#8a1f2a' } },
      { name: 'Violet fire', c: { glow: '#c07aff', outfit: '#2a1a3a', hat: '#2a1a3a' } },
      { name: 'Brown skin', c: { skin: '#8a5a3c' } },
    ],
    over: (x) => skullStaff(x, x.o.glowColor ?? '#9cff7a'),
  },
  {
    id: 'young-witch', name: 'Young Witch', tags: ['witch', 'broom', 'apprentice', 'flying', 'young', 'npc', 'folklore'],
    o: { hat: 'witch', outfit: 'robe', hair: 'bob', mouth: 'grin', brows: 'raised', eyeStyle: 'big', freckles: true, blush: true, face: 'round' },
    c: { skin: '#f0d0b4', hair: '#b8482a', outfit: '#2a2430', trim: '#e86a3a', hat: '#2a2430', eye: '#3f8a5a', straw: '#d8b25a', band: '#a3312c' },
    variants: [
      { name: 'Red hair', c: {} },
      { name: 'Black hair, purple', c: { skin: '#c8996e', hair: '#1a1414', outfit: '#4a2a6a', hat: '#4a2a6a', band: '#e2b84a' } },
      { name: 'Brown, blue', c: { skin: '#8a5a3c', hair: '#2a1e18', outfit: '#1e3a6a', hat: '#1e3a6a', band: '#4cc9f0' } },
      { name: 'Blonde, green', c: { hair: '#e8c46a', outfit: '#2a4a2a', hat: '#2a4a2a' } },
    ],
    over: (x) => broom(x),
  },
];

const FAMILIAR: CreatureDef = {
  id: 'witch-cat', name: 'Familiar Cat', family: 'beast', size: 'Tiny',
  tags: ['cat', 'familiar', 'witch', 'black cat', 'pet', 'companion', 'tiny', 'folklore'],
  c: { fur: '#26232a', eye: '#9cff5a', collar: '#6a3fa0', hat: '#2a2430', band: '#a3312c', muzzle: '#34303a', nose: '#8a5a6a', inner: '#5a4048' },
  variants: [
    { name: 'Black, little hat', c: {}, f: { hat: 1 } },
    { name: 'Black', c: { eye: '#ffd166' } },
    { name: 'Grey tabby', c: { fur: '#8a8a8e', stripe: '#3a3a40', muzzle: '#c8c8cc', eye: '#7fd8ff', nose: '#c87a8a', inner: '#c87a8a', collar: '#a3312c' } },
    { name: 'White', c: { fur: '#ece8e2', muzzle: '#ffffff', eye: '#b07cff', nose: '#e8909a', inner: '#e8a0aa', whisker: '#8a8a8a' }, f: { hat: 1 } },
  ],
  draw: familiarCat,
};

// ------------------------------------------------------------------ wizards and other spellcasters

const CASTERS: Spec[] = [
  {
    id: 'wizard', name: 'Wizard', tags: ['wizard', 'mage', 'spellcaster', 'arcane', 'staff', 'beard', 'npc'],
    o: { hat: 'wizard', outfit: 'robe', beard: 'long', hair: 'long', held: 'staff', heldColor: '#7fd8ff', brows: 'raised', mouth: 'smile', headY: 48, nose: 'big' },
    c: { skin: '#e8b894', hair: '#e8e4dc', outfit: '#2a4a9a', trim: '#e9c24a', hat: '#2a4a9a', eye: '#4a6a8a' },
    variants: [
      { name: 'Blue', c: {} },
      { name: 'Red', c: { outfit: '#8a1f2a', hat: '#8a1f2a', held: '#ffb05a' } },
      { name: 'Green, brown skin', c: { outfit: '#2a5a3a', hat: '#2a5a3a', skin: '#8a5a3c', held: '#a8ff7a' } },
      { name: 'Brown, dark beard', c: { outfit: '#6a4a2a', hat: '#6a4a2a', hair: '#3a2a1e', skin: '#c8996e' } },
    ],
    over: robeStars,
  },
  {
    id: 'apprentice-wizard', name: 'Apprentice Wizard', tags: ['wizard', 'apprentice', 'student', 'young', 'spellcaster', 'npc'],
    o: { hat: 'wizard', outfit: 'robe', hair: 'short', held: 'book', heldColor: '#2f5d8a', brows: 'raised', mouth: 'open', eyeStyle: 'big', freckles: true, blush: true, face: 'round', headY: 47 },
    c: { skin: '#f0d0b4', hair: '#7a4a2a', outfit: '#6a5a8a', trim: '#c8b088', hat: '#6a5a8a', eye: '#4a6a8a' },
    variants: skinVars([{ name: 'Long hair, teal', c: { outfit: '#2a6a6a', hat: '#2a6a6a', hair: '#c8602a' }, f: { long: 1 } }]),
    flags: (f) => (f.long ? { hair: 'long' } : {}),
  },
  {
    id: 'court-wizard', name: 'Court Wizard', tags: ['wizard', 'court', 'royal', 'advisor', 'vizier', 'castle', 'spellcaster', 'npc'],
    o: { outfit: 'robe', collar: 'high', beard: 'forked', hair: 'slick', held: 'wand', brows: 'sly', mouth: 'smirk', beads: '#e2b84a', fx: 'sparkle', face: 'long', crown: 'circlet' },
    c: { skin: '#e8c0a0', hair: '#4a4a52', outfit: '#3a1e4a', trim: '#e2b84a', collar: '#24102e', glow: '#ffd166', eye: '#4a6a8a' },
    variants: [
      { name: 'Purple', c: {} },
      { name: 'Crimson', c: { outfit: '#6a1418', collar: '#3a0a0c', skin: '#c8996e', hair: '#1a1414' } },
      { name: 'Teal', c: { outfit: '#1e4a4a', collar: '#0e2a2a', skin: '#8a5a3c', hair: '#c8c4bc', glow: '#7ae0e0' } },
    ],
  },
  {
    id: 'battle-mage', name: 'Battle Mage', tags: ['mage', 'warrior', 'war', 'spellsword', 'soldier', 'spellcaster', 'npc'],
    o: { outfit: 'mail', cloak: '#7a1f24', held: 'sword', held2: 'flame', heldColor: '#ff7a3a', glowColor: '#ff7a3a', hair: 'short', beard: 'short', brows: 'angry', mouth: 'frown', scar: true, eyeStyle: 'glow' },
    c: { skin: '#e2b08c', hair: '#3a2a1a', metal: '#8e949b', trim: '#7a1f24', cloak: '#7a1f24', glow: '#ff7a3a' },
    variants: skinVars([{ name: 'Blue flame', c: { glow: '#7fd8ff', held: '#7fd8ff', cloak: '#1e3a6a', trim: '#1e3a6a' } }]),
  },
  {
    id: 'elder-wizard', name: 'Elder Wizard', tags: ['wizard', 'elder', 'old', 'sage', 'scholar', 'spellcaster', 'npc'],
    o: { outfit: 'robe', hair: 'bald', beard: 'long', held: 'book', heldColor: '#6a2a2a', brows: 'heavy', mouth: 'smile', nose: 'big', ears: 'round', headY: 47, fx: 'motes', glowColor: '#fff3a0', beads: '#c9a24a' },
    c: { skin: '#e8c0a0', hair: '#f2f0ea', outfit: '#2a5a5a', trim: '#c9a24a', eye: '#4a6a8a', rim: '#c9a24a' },
    variants: [
      { name: 'Teal robe', c: {} },
      { name: 'Wine robe, olive', c: { outfit: '#5a1e2a', skin: '#c8996e' } },
      { name: 'Brown robe, brown', c: { outfit: '#6a4a2a', skin: '#8a5a3c' } },
      { name: 'Indigo robe, deep', c: { outfit: '#2a2a5a', skin: '#5e3a26' } },
    ],
    over: spectacles,
  },
  {
    id: 'enchantress', name: 'Enchantress', tags: ['sorceress', 'charm', 'enchanter', 'spellcaster', 'beauty', 'npc'],
    o: { outfit: 'gown', hair: 'flowing', crown: 'circlet', held: 'wand', mouth: 'smirk', brows: 'sly', fx: 'sparkle', fx2: 'aura', glowColor: '#ff8ad8', face: 'heart', earring: '#e2b84a' },
    c: { skin: '#f0d4bc', hair: '#2a1a2a', outfit: '#8a2a6a', trim: '#f4b0d8', glow: '#ff8ad8', eye: '#6a3fa0', crown: '#e2b84a' },
    variants: [
      { name: 'Rose', c: {} },
      { name: 'Golden, olive', c: { hair: '#e8c46a', skin: '#c8996e', outfit: '#c9a24a', trim: '#fff0b0', glow: '#ffd166' } },
      { name: 'Emerald, brown', c: { skin: '#8a5a3c', hair: '#1a1414', outfit: '#1e6a4a', trim: '#8ae0b0', glow: '#7affb0' } },
      { name: 'Silver, deep', c: { skin: '#5e3a26', hair: '#eef0f4', outfit: '#4a4a6a', trim: '#cfd6ff', glow: '#a8c0ff' } },
    ],
  },
  {
    id: 'necromancer', name: 'Necromancer', tags: ['necromancer', 'death', 'undead', 'dark', 'skull', 'spellcaster', 'villain', 'npc'],
    o: { outfit: 'robe', hood: 'up', collar: 'high', pallor: 0.35, sunken: true, eyeStyle: 'glow', glowColor: '#9cff7a', brows: 'angry', mouth: 'neutral', beads: '#d8ccb0', fx: 'fumes', fx2: 'aura', face: 'gaunt' },
    c: { skin: '#d8c0b0', hair: '#1a1414', outfit: '#1e1a22', trim: '#4a2a5a', hood: '#1e1a22', collar: '#141016', glow: '#9cff7a' },
    variants: [
      { name: 'Green', c: {} },
      { name: 'Violet', c: { glow: '#c07aff', trim: '#6a3fa0' } },
      { name: 'Crimson', c: { glow: '#ff4a3a', hood: '#3a0e12', outfit: '#3a0e12', trim: '#8a1f2a' } },
      { name: 'Brown skin', c: { skin: '#8a5a3c' } },
    ],
    over: (x) => skullStaff(x, x.o.glowColor ?? '#9cff7a'),
  },
  {
    id: 'sorcerer', name: 'Sorcerer', tags: ['sorcerer', 'sorceress', 'innate', 'bloodline', 'spellcaster', 'npc'],
    o: { outfit: 'coat', hair: 'wild', scales: true, eyeStyle: 'glow', glowColor: '#ffb347', held: 'flame', heldColor: '#ff7a3a', brows: 'raised', mouth: 'grin', fx: 'sparkle', earring: '#e2b84a' },
    c: { skin: '#e8c0a0', hair: '#c8302a', outfit: '#3a1e1e', trim: '#e2b84a', glow: '#ffb347', eye: '#ffb347' },
    variants: [
      { name: 'Ember', c: {} },
      { name: 'Storm blue', c: { hair: '#e8eef4', outfit: '#1e2a4a', glow: '#7fd8ff', held: '#4cc9f0', skin: '#c8996e' } },
      { name: 'Verdant', c: { hair: '#2a1e18', outfit: '#1e3a2a', glow: '#9cff7a', held: '#5ad84a', skin: '#8a5a3c' } },
      { name: 'Violet', c: { hair: '#f2f0f6', outfit: '#2a1a3a', glow: '#d0a8ff', held: '#b07cff', skin: '#5e3a26' } },
    ],
  },
  {
    id: 'warlock', name: 'Warlock', tags: ['warlock', 'pact', 'patron', 'eldritch', 'dark', 'spellcaster', 'npc'],
    o: { outfit: 'robe', hood: 'up', mask: '#1a181c', eyeStyle: 'glow', glowColor: '#b07cff', held: 'book', heldColor: '#3a2a4a', fx: 'eldritch', brows: 'sly', collar: 'high' },
    c: { skin: '#d8b8a0', outfit: '#241e2a', trim: '#6a3fa0', hood: '#2a2430', collar: '#1a161e', glow: '#b07cff', mask: '#1a181c' },
    variants: [
      { name: 'Violet', c: {} },
      { name: 'Green', c: { glow: '#9cff7a', trim: '#3a6a3a' } },
      { name: 'Red', c: { glow: '#ff4a3a', trim: '#7a1f24', hood: '#3a1416' } },
      { name: 'Brown skin', c: { skin: '#8a5a3c' } },
    ],
  },
  {
    id: 'illusionist', name: 'Illusionist', tags: ['illusion', 'trickster', 'mirror', 'mage', 'spellcaster', 'npc'],
    o: { hat: 'wizard', outfit: 'robe', beard: 'mustache', hair: 'slick', held: 'wand', mouth: 'smirk', brows: 'sly', fx: 'blink', glowColor: '#8fd3ff', headY: 47 },
    c: { skin: '#e8c0a0', hair: '#2a2020', outfit: '#2a6a7a', trim: '#e8b0f0', hat: '#5a2a7a', plume: '#e8b0f0', eye: '#6a3fa0', glow: '#e8b0f0' },
    variants: skinVars([{ name: 'Gold and black', c: { outfit: '#1e1c22', hat: '#1e1c22', trim: '#e2b84a', plume: '#e2b84a', glow: '#ffd166' } }]),
  },
  {
    id: 'fire-mage', name: 'Fire Mage', tags: ['fire', 'flame', 'pyromancer', 'mage', 'spellcaster', 'npc'],
    o: { outfit: 'robe', hood: 'down', hair: 'wild', eyeStyle: 'glow', glowColor: '#ffb347', held: 'flame', held2: 'flame', heldColor: '#ff7a3a', fx: 'aura', brows: 'angry', mouth: 'grin' },
    c: { skin: '#e8b894', hair: '#d8482a', outfit: '#8a1f14', trim: '#ffb02e', hood: '#5a1410', glow: '#ffb347' },
    variants: skinVars([{ name: 'Blue fire', c: { glow: '#7fd8ff', held: '#4cc9f0', outfit: '#1e2a5a', hood: '#141a3a', trim: '#7fd8ff', hair: '#e8eef4' } }]),
  },
  {
    id: 'frost-mage', name: 'Frost Mage', tags: ['ice', 'frost', 'cold', 'cryomancer', 'winter', 'mage', 'spellcaster', 'npc'],
    o: { outfit: 'robe', mantle: 'fur', hair: 'long', beard: 'short', eyeStyle: 'glow', glowColor: '#9ad8ff', held: 'wand', fx: 'frost', fx2: 'aura', brows: 'calm', mouth: 'neutral', pallor: 0.15 },
    c: { skin: '#e8c8b0', hair: '#eef4f8', outfit: '#2a4a7a', trim: '#cfefff', mantle: '#eef2f4', glow: '#9ad8ff' },
    variants: [
      { name: 'Blue', c: {} },
      { name: 'White robe', c: { outfit: '#d8e4ec', trim: '#5a8ab8' } },
      { name: 'Brown skin', c: { skin: '#8a5a3c', hair: '#1a1414' } },
    ],
    over: iceCrown,
  },
  {
    id: 'storm-mage', name: 'Storm Mage', tags: ['storm', 'lightning', 'thunder', 'weather', 'mage', 'spellcaster', 'npc'],
    o: { outfit: 'robe', cloak: '#1e2a4a', hair: 'wild', beard: 'full', held: 'staff', heldColor: '#cfe8ff', eyeStyle: 'glow', glowColor: '#e8f4ff', brows: 'angry', mouth: 'open', fx: 'sparkle' },
    c: { skin: '#e2b08c', hair: '#c8ccd4', outfit: '#2a3a5a', trim: '#ffe066', cloak: '#1e2a4a', glow: '#e8f4ff', bolt: '#ffe066' },
    variants: [
      ...SKINS_KEEP_HAIR,
      { name: 'Violet storm', c: { bolt: '#d0a8ff', trim: '#d0a8ff', outfit: '#2a1e4a', cloak: '#1a1430', held: '#e8d8ff' } },
    ],
    over: (x) => bolts(x.g, 82.5, 17, x.c.bolt ?? '#ffe066'),
  },
];

// ------------------------------------------------------------------ skeletons and undead regulars

const BONE = '#e4dbc2';

const UNDEAD: Spec[] = [
  {
    id: 'skeleton-warrior', name: 'Skeleton Warrior', family: 'undead', tags: ['undead', 'skeleton', 'bones', 'warrior', 'sword', 'shield', 'crypt', 'dungeon'],
    o: { skull: true, outfit: 'ribs', eyeStyle: 'hollow', glowColor: '#7fd8ff', helmet: 'nasal', held: 'sword', held2: 'shield', heldColor: '#6a2a2a', metal: '#7c7468' },
    c: { skin: BONE, metal: '#7c7468', held: '#6a2a2a', glow: '#7fd8ff' },
    variants: [
      { name: 'Blue eyes', c: {} },
      { name: 'Red eyes', c: { glow: '#ff4a3a', held: '#2a2a32' } },
      { name: 'Rusty', c: { metal: '#8b5a3b', held: '#4a5a3a', glow: '#ffd166' } },
      { name: 'Blackened', c: { skin: '#6a625a', glow: '#9cff7a', held: '#3a2a4a' } },
    ],
  },
  {
    id: 'skeleton-archer', name: 'Skeleton Archer', family: 'undead', tags: ['undead', 'skeleton', 'bones', 'archer', 'bow', 'ranged', 'crypt', 'dungeon'],
    o: { skull: true, outfit: 'ribs', eyeStyle: 'hollow', glowColor: '#7fd8ff', hood: 'up', held: 'bow', quiver: true },
    c: { skin: BONE, hood: '#4a4038', glow: '#7fd8ff' },
    variants: [
      { name: 'Brown hood', c: {} },
      { name: 'Red eyes', c: { glow: '#ff4a3a', hood: '#3a1e1e' } },
      { name: 'Green hood', c: { hood: '#2a3a2a', glow: '#9cff7a' } },
      { name: 'Blackened', c: { skin: '#6a625a', hood: '#24222a', glow: '#c07aff' } },
    ],
  },
  {
    id: 'skeleton-mage', name: 'Skeleton Mage', family: 'undead', tags: ['undead', 'skeleton', 'bones', 'mage', 'caster', 'necromancy', 'crypt', 'dungeon'],
    o: { skull: true, outfit: 'robe', hat: 'wizard', eyeStyle: 'hollow', glowColor: '#c07aff', held: 'staff', heldColor: '#c07aff', fx: 'eldritch', headY: 47 },
    c: { skin: BONE, outfit: '#3a2a4a', trim: '#8a7a4a', hat: '#3a2a4a', glow: '#c07aff', held: '#c07aff' },
    variants: [
      { name: 'Violet', c: {} },
      { name: 'Green', c: { glow: '#9cff7a', held: '#9cff7a', outfit: '#2a3a2a', hat: '#2a3a2a' } },
      { name: 'Red', c: { glow: '#ff5a3a', held: '#ff5a3a', outfit: '#4a1a1a', hat: '#4a1a1a' } },
      { name: 'Blue', c: { glow: '#7fd8ff', held: '#7fd8ff', outfit: '#1e2a4a', hat: '#1e2a4a' } },
    ],
  },
  {
    id: 'skeleton-knight', name: 'Skeleton Knight', family: 'undead', cr: '3', tags: ['undead', 'skeleton', 'bones', 'knight', 'armor', 'death knight', 'crypt', 'boss', 'crusader', 'rusted', '3d'],
    o: { skull: true, outfit: 'plate', helmet: 'spiked', cloak: '#3a1416', eyeStyle: 'hollow', glowColor: '#ff4a3a', held: 'sword', held2: 'shield', heldColor: '#3a1416' },
    c: { skin: BONE, metal: '#4a4e54', cloak: '#3a1416', held: '#3a1416', glow: '#ff4a3a' },
    variants: [
      // The owner's own concept art (the same art the 3D figure was built from); the drawing stands in until it loads.
      { name: 'Rusted crusader', c: { metal: '#7a5a44', cloak: '#7a1e22', held: '#7a1e22', glow: '#ffb070' }, portrait: '/library/portraits/skeleton-knight.webp' },
      { name: 'Black and red', c: {} },
      { name: 'Tarnished gold', c: { metal: '#9a8a4a', cloak: '#2a2a3a', held: '#2a2a3a', glow: '#ffd166' } },
      { name: 'Pale steel', c: { metal: '#a8aeb5', cloak: '#1e2a3a', held: '#1e2a3a', glow: '#7fd8ff' } },
      { name: 'Grave green', c: { metal: '#4a5a4a', cloak: '#1e2a1e', held: '#1e2a1e', glow: '#9cff7a' } },
    ],
  },
  {
    id: 'giant-skeleton', name: 'Giant Skeleton', family: 'undead', size: 'Large', tags: ['undead', 'skeleton', 'bones', 'giant', 'huge', 'brute', 'large'],
    o: { skull: true, outfit: 'ribs', eyeStyle: 'hollow', glowColor: '#7fd8ff', helmet: 'horned', held: 'greataxe', headW: 24, headH: 25, headY: 46, shoulders: 1.35, metal: '#6a6258' },
    c: { skin: '#dcd2b8', metal: '#6a6258', glow: '#7fd8ff' },
    variants: [
      { name: 'Blue eyes', c: {} },
      { name: 'Red eyes', c: { glow: '#ff4a3a' } },
      { name: 'Huge, bare skull', c: { glow: '#9cff7a' }, f: { bare: 1 } },
      { name: 'Blackened', c: { skin: '#6a625a', glow: '#ffb347', metal: '#3a3634' } },
    ],
    flags: (f) => (f.bare ? { helmet: undefined, held: 'club' } : {}),
  },
  {
    id: 'plague-zombie', name: 'Plague Zombie', family: 'undead', tags: ['undead', 'zombie', 'plague', 'disease', 'rotting', 'sickness', 'graveyard'],
    o: { rot: 1, pallor: 0.15, eyeStyle: 'glow', glowColor: '#c8ff5a', sunken: true, mouth: 'open', hair: 'stringy', outfit: 'bandage', held: 'claws', brows: 'worried', face: 'gaunt', spots: '#8a9a3a', fx: 'fumes' },
    c: { skin: '#a8a070', hair: '#3a3028', outfit: '#9a9070', spots: '#8a9a3a', glow: '#c8ff5a' },
    variants: [
      { name: 'Sickly green', c: {} },
      { name: 'Grey', c: { skin: '#9a9a94', spots: '#6a7a3a' } },
      { name: 'Purple blight', c: { skin: '#9a8a9a', spots: '#6a3a6a', glow: '#e07aff' } },
      { name: 'Dark', c: { skin: '#6e4a36', hair: '#1a1414' } },
    ],
    over: flies,
  },
  {
    id: 'ghostly-knight', name: 'Ghostly Knight', family: 'undead', tags: ['undead', 'ghost', 'knight', 'spirit', 'haunt', 'armor', 'spectral', 'castle'],
    o: { outfit: 'plate', helmet: 'great', visorGlow: '#cfffff', cloak: '#8ac8d8', held: 'sword', ghost: 0.72, fx: 'motes', fx2: 'aura', glowColor: '#cfffff' },
    c: { skin: '#c8e8ec', metal: '#b8dce4', cloak: '#8ac8d8', visor: '#cfffff', plume: '#e8f8fa', glow: '#cfffff' },
    variants: [
      { name: 'Pale blue', c: {} },
      { name: 'Green', c: { metal: '#b8e4c4', cloak: '#8ad8a0', visor: '#d8ffe0', glow: '#c8ffd0' } },
      { name: 'Violet', c: { metal: '#d4cce8', cloak: '#b8a0e0', visor: '#f0e0ff', glow: '#e0d0ff' } },
    ],
  },
  {
    id: 'crypt-guardian', name: 'Crypt Guardian', family: 'undead', tags: ['undead', 'tomb', 'guardian', 'warden', 'crypt', 'wrapped', 'sentinel', 'boss'],
    o: { wraps: true, ears: 'none', hair: 'none', brows: 'none', outfit: 'scale', helmet: 'crest', mantle: 'gold', eyeStyle: 'glow', glowColor: '#ffd166', held: 'spear', held2: 'shield', heldColor: '#2f4f8a', shoulders: 1.15 },
    c: { skin: '#c8bc98', outfit: '#8a6a3a', metal: '#c9a24a', mantle: '#c9a24a', plume: '#2f4f8a', held: '#2f4f8a', glow: '#ffd166' },
    variants: [
      { name: 'Gold and blue', c: {} },
      { name: 'Bronze and red', c: { metal: '#a8743c', mantle: '#a8743c', plume: '#8a1f2a', held: '#8a1f2a', glow: '#ff6a3a' } },
      { name: 'Black and green', c: { skin: '#7a7058', metal: '#3a3a40', mantle: '#4a4a52', plume: '#2a5a3a', held: '#2a5a3a', glow: '#9cff7a' } },
    ],
  },
];

const BONE_DRAGON: CreatureDef = {
  id: 'bone-dragon', name: 'Bone Dragon', family: 'undead', size: 'Huge',
  tags: ['undead', 'dragon', 'skeleton', 'bones', 'dracolich', 'wyrm', 'boss', 'huge'],
  c: { bone: '#e2d8be', glow: '#9cff7a', membrane: '#3a3044', horn: '#b8ac90' },
  variants: [
    { name: 'Green fire', c: {} },
    { name: 'Blue fire', c: { glow: '#7fd8ff', membrane: '#2a3448' } },
    { name: 'Red fire', c: { glow: '#ff5a3a', membrane: '#4a2a2a' } },
    { name: 'Blackened', c: { bone: '#7a7066', horn: '#3a3430', glow: '#c07aff', membrane: '#24202a' } },
  ],
  draw: boneDragon,
};

// ------------------------------------------------------------------ townsfolk, court and common NPCs

const NPCS: Spec[] = [
  {
    id: 'blacksmith', name: 'Blacksmith', tags: ['smith', 'forge', 'anvil', 'craftsman', 'armorer', 'town', 'npc'],
    o: { outfit: 'apron', hair: 'short', beard: 'full', brows: 'heavy', mouth: 'neutral', shoulders: 1.22, face: 'square', headband: '#5a4030' },
    c: { skin: '#e2b08c', hair: '#3a2418', outfit: '#3a3028', trim: '#6a4a2e', eye: '#4a3a2a' },
    variants: skinVars([{ name: 'Red beard', c: { hair: '#a8462a' } }]),
    over: (x) => {
      soot(x);
      smithHammer(x);
    },
  },
  {
    id: 'farmer', name: 'Farmer', tags: ['farmer', 'peasant', 'villager', 'field', 'farm', 'pitchfork', 'npc'],
    o: { outfit: 'tunic', hat: 'straw', hair: 'short', beard: 'stubble', mouth: 'smile', brows: 'calm', blush: true },
    c: { skin: '#e8b894', hair: '#6a4a2a', outfit: '#6a7a4a', trim: '#c8b088', hat: '#e2c46a', plume: '#8a3a2a', eye: '#4a6a8a' },
    variants: skinVars([{ name: 'Long hair, no stubble', c: { outfit: '#8a6a44', hair: '#c8902a' }, f: { long: 1 } }]),
    flags: (f) => (f.long ? { hair: 'long', beard: 'none' } : {}),
    over: pitchfork,
  },
  {
    id: 'child', name: 'Child', size: 'Small', tags: ['child', 'kid', 'young', 'urchin', 'villager', 'small', 'npc'],
    o: { outfit: 'tunic', face: 'round', hair: 'curly', eyeStyle: 'big', mouth: 'grin', brows: 'raised', freckles: true, blush: true, nose: 'button', headW: 21, headH: 22, headY: 49, shoulders: 0.72 },
    c: { skin: '#f0d0b4', hair: '#8a5a2a', outfit: '#3a6a9a', trim: '#e8dcc0', eye: '#4a6a8a' },
    variants: [
      ...skinVars(),
      { name: 'Pigtails', c: { hair: '#e8c46a', outfit: '#a3312c' }, f: { braids: 1 } },
    ],
    flags: (f) => (f.braids ? { hair: 'braids' } : {}),
  },
  {
    id: 'beggar', name: 'Beggar', tags: ['beggar', 'poor', 'vagrant', 'street', 'urchin', 'city', 'npc'],
    o: { outfit: 'rags', hood: 'up', beard: 'full', brows: 'worried', mouth: 'neutral', face: 'gaunt', sunken: true },
    c: { skin: '#d8a882', hair: '#7a6a5a', outfit: '#6a5e4e', hood: '#5a4e40', eye: '#4a3a2a' },
    variants: skinVars([{ name: 'Grey cloak', c: { hood: '#5a5a5e', outfit: '#4a4a4e', hair: '#c8c4bc' } }]),
    over: bowl,
  },
  {
    id: 'sage', name: 'Sage', tags: ['sage', 'scholar', 'scribe', 'librarian', 'lore', 'library', 'npc'],
    o: { outfit: 'robe', hair: 'tonsure', beard: 'short', held: 'scroll', brows: 'raised', mouth: 'neutral', face: 'long', nose: 'long' },
    c: { skin: '#e8c0a0', hair: '#9a948a', outfit: '#4a3a2a', trim: '#c8b088', eye: '#4a6a8a', rim: '#3a2a1e' },
    variants: [
      ...SKINS_KEEP_HAIR,
      { name: 'Blue robe, dark hair', c: { outfit: '#2a3a5a', hair: '#2a2020', rim: '#c9a24a' } },
    ],
    over: spectacles,
  },
  {
    id: 'king', name: 'King', tags: ['king', 'monarch', 'royal', 'ruler', 'crown', 'castle', 'court', 'npc'],
    o: { outfit: 'doublet', crown: 'crown', mantle: 'fur', beard: 'full', hair: 'long', brows: 'heavy', mouth: 'neutral', beads: '#e2b84a', face: 'square' },
    c: { skin: '#e8b894', hair: '#8a6a4a', outfit: '#8a1f2a', trim: '#e2b84a', mantle: '#f2eee6', eye: '#4a6a8a', jewel: '#c0303a' },
    variants: [
      { name: 'Crimson', c: {} },
      { name: 'Royal blue, grey beard', c: { outfit: '#2a3a8a', hair: '#c8c4bc', jewel: '#4cc9f0' } },
      { name: 'Purple, brown', c: { outfit: '#4a2a6a', skin: '#8a5a3c', hair: '#1a1414' } },
      { name: 'Green, deep', c: { outfit: '#2a5a3a', skin: '#5e3a26', hair: '#2a2020', jewel: '#7aff9a' } },
    ],
    over: sceptre,
  },
  {
    id: 'queen', name: 'Queen', tags: ['queen', 'monarch', 'royal', 'ruler', 'crown', 'castle', 'court', 'npc'],
    o: { outfit: 'gown', crown: 'crown', collar: 'ruff', hair: 'bun', brows: 'calm', mouth: 'neutral', beads: '#e2b84a', face: 'long', earring: '#e2b84a' },
    c: { skin: '#f0d4bc', hair: '#5a3a22', outfit: '#4a2a6a', trim: '#e2b84a', collar: '#f2eee6', eye: '#4a6a8a' },
    variants: [
      { name: 'Purple', c: {} },
      { name: 'Crimson, olive', c: { outfit: '#8a1f2a', skin: '#c8996e', hair: '#1e1814' } },
      { name: 'Blue, silver hair', c: { outfit: '#2a3a8a', hair: '#d8d4cc' } },
      { name: 'Emerald, deep', c: { outfit: '#1e5a3a', skin: '#5e3a26', hair: '#1a1414' } },
    ],
  },
  {
    id: 'prince', name: 'Prince', tags: ['prince', 'royal', 'noble', 'heir', 'young', 'castle', 'court', 'npc'],
    o: { outfit: 'doublet', crown: 'circlet', cloak: '#2f5d8a', hair: 'short', held: 'sword', brows: 'calm', mouth: 'smirk' },
    c: { skin: '#e8c0a0', hair: '#c8902a', outfit: '#2f5d8a', trim: '#e2b84a', cloak: '#2f5d8a', eye: '#4a6a8a' },
    variants: skinVars([{ name: 'Red cloak', c: { outfit: '#8a1f2a', cloak: '#8a1f2a' } }]),
  },
  {
    id: 'princess', name: 'Princess', tags: ['princess', 'royal', 'noble', 'heir', 'young', 'castle', 'court', 'npc'],
    o: { outfit: 'gown', crown: 'circlet', hair: 'long', blush: true, mouth: 'smile', brows: 'raised', eyeStyle: 'big', face: 'heart', beads: '#f2eee6' },
    c: { skin: '#f0d4bc', hair: '#e8c46a', outfit: '#d87aa8', trim: '#fff0f6', eye: '#4a6a8a', crown: '#e2b84a' },
    variants: [
      { name: 'Rose', c: {} },
      { name: 'Sky blue, olive', c: { outfit: '#6ab0e0', skin: '#c8996e', hair: '#1e1814' } },
      { name: 'Lilac, brown', c: { outfit: '#a88ad8', skin: '#8a5a3c', hair: '#1a1414' } },
      { name: 'Gold, deep', c: { outfit: '#e2b84a', skin: '#5e3a26', hair: '#2a2020', trim: '#fff6d8' } },
    ],
  },
  {
    id: 'jester', name: 'Jester', tags: ['jester', 'fool', 'clown', 'court', 'entertainer', 'performer', 'npc'],
    o: { outfit: 'doublet', collar: 'ruff', hair: 'none', mouth: 'grin', brows: 'raised', eyeStyle: 'big', blush: true, nose: 'button' },
    c: { skin: '#f0d4bc', outfit: '#a3312c', trim: '#e2b84a', hat: '#a3312c', collar: '#f2eee6', eye: '#4a6a8a' },
    variants: [
      { name: 'Red and gold', c: {} },
      { name: 'Purple and green', c: { outfit: '#5d3a78', hat: '#5d3a78', trim: '#5aa83a' } },
      { name: 'Black and white', c: { outfit: '#2b2b30', hat: '#2b2b30', trim: '#efe8da', skin: '#8a5a3c' } },
      { name: 'Blue and orange', c: { outfit: '#2f5d8a', hat: '#2f5d8a', trim: '#e8862a', skin: '#c8996e' } },
    ],
    over: (x) => {
      jesterHat(x);
      marotte(x);
    },
  },
  {
    id: 'executioner', name: 'Executioner', tags: ['executioner', 'headsman', 'hooded', 'axe', 'gallows', 'dungeon', 'castle', 'npc'],
    o: { outfit: 'bare', outfitColor: '#3a2a20', hair: 'bald', held: 'greataxe', shoulders: 1.3, mouth: 'frown', brows: 'heavy', eyeStyle: 'narrow' },
    c: { skin: '#d8a882', hood: '#1e1c20', eye: '#6a2a2a' },
    variants: [
      { name: 'Black hood', c: {} },
      { name: 'Red hood', c: { hood: '#6a1418' } },
      { name: 'Brown, black hood', c: { skin: '#8a5a3c' } },
      { name: 'Deep, grey hood', c: { skin: '#5e3a26', hood: '#4a4a52' } },
    ],
    over: executionerHood,
  },
  {
    id: 'bard', name: 'Bard', tags: ['bard', 'minstrel', 'musician', 'singer', 'lute', 'tavern', 'performer', 'npc'],
    o: { outfit: 'doublet', hat: 'feather', held: 'lute', hair: 'long', beard: 'goatee', mouth: 'grin', brows: 'raised', earring: '#e2b84a' },
    c: { skin: '#e8c0a0', hair: '#6a4a2a', outfit: '#2a6a5a', trim: '#f2e2b0', hat: '#1e3a34', plume: '#e8862a', eye: '#3f8a5a' },
    variants: skinVars([{ name: 'Crimson, red plume', c: { outfit: '#8a1f3a', hat: '#4a0e1e', plume: '#f4d35e' } }]),
  },
  {
    id: 'hunter', name: 'Hunter', tags: ['hunter', 'trapper', 'woodsman', 'archer', 'bow', 'forest', 'npc'],
    o: { outfit: 'leather', mantle: 'fur', hat: 'feather', held: 'bow', quiver: true, beard: 'short', hair: 'short', brows: 'heavy', mouth: 'neutral' },
    c: { skin: '#e2b08c', hair: '#5a3a22', outfit: '#6b4a2b', mantle: '#8a6a4a', hat: '#4a3a24', plume: '#c8b088', eye: '#3f6a4a' },
    variants: skinVars([{ name: 'Grey fur', c: { mantle: '#9a9690', hat: '#3a3a2a' } }]),
  },
  {
    id: 'alchemist', name: 'Alchemist', tags: ['alchemist', 'potion', 'chemist', 'apothecary', 'laboratory', 'shop', 'npc'],
    o: { outfit: 'apron', hair: 'wild', beard: 'stubble', mouth: 'grin', brows: 'raised', eyeStyle: 'big', nose: 'long' },
    c: { skin: '#e8c0a0', hair: '#c8c4bc', outfit: '#4a5a3a', trim: '#e8dcc0', eye: '#4a6a8a', item: '#7aff6a', lens: '#5ab0a0' },
    variants: [
      ...SKINS_KEEP_HAIR,
      { name: 'Red potion, dark hair', c: { item: '#ff5a7a', hair: '#2a2020', lens: '#c8602a' } },
    ],
    over: (x) => {
      goggles(x);
      flask(x);
    },
  },
  {
    id: 'healer', name: 'Healer', tags: ['healer', 'herbalist', 'physician', 'medicine', 'herbs', 'village', 'npc'],
    o: { outfit: 'robe', hood: 'down', hair: 'braids', mouth: 'smile', brows: 'calm', beads: '#8a6a3a' },
    c: { skin: '#e8c0a0', hair: '#6a4a2a', outfit: '#e8e4d8', trim: '#5f8a3a', hood: '#5f8a3a', eye: '#3f8a5a', herb: '#5f9a43', bloom: '#ffd166' },
    variants: skinVars([{ name: 'Green robe', c: { outfit: '#4a6a3a', trim: '#c8b088', hood: '#c8b088' } }]),
    over: (x) => herbs(x),
  },
  {
    id: 'town-crier', name: 'Town Crier', tags: ['crier', 'herald', 'announcer', 'news', 'bell', 'town', 'square', 'npc'],
    o: { outfit: 'coat', hat: 'tricorn', hair: 'short', beard: 'mustache', mouth: 'open', brows: 'raised', face: 'round', blush: true },
    c: { skin: '#e8b894', hair: '#7a4a2a', outfit: '#8a1f2a', trim: '#e2b84a', hat: '#1e1c22', plume: '#e2b84a', eye: '#4a6a8a', item: '#d9a83a' },
    variants: skinVars([{ name: 'Blue coat', c: { outfit: '#1e3a6a' } }]),
    over: handBell,
  },
  {
    id: 'guard-captain', name: 'Captain of the Guard', tags: ['captain', 'guard', 'watch', 'commander', 'officer', 'soldier', 'city', 'npc'],
    o: { outfit: 'plate', helmet: 'crest', cloak: '#2f5d8a', held: 'sword', beard: 'mustache', scar: true, brows: 'heavy', mouth: 'frown', face: 'square' },
    c: { skin: '#e2b08c', hair: '#3a2a1a', metal: '#b8bec5', trim: '#2f5d8a', cloak: '#2f5d8a', plume: '#2f5d8a', eye: '#4a6a8a' },
    variants: skinVars([
      { name: 'Red livery', c: { trim: '#a3312c', cloak: '#a3312c', plume: '#a3312c' } },
      { name: 'Green livery', c: { trim: '#3e6b3a', cloak: '#3e6b3a', plume: '#3e6b3a' } },
    ]),
  },
  {
    id: 'dwarf-miner', name: 'Dwarf Miner', tags: ['dwarf', 'miner', 'mine', 'pickaxe', 'digger', 'underground', 'cave', 'npc'],
    o: { face: 'wide', headY: 47, headW: 20, headH: 21, shoulders: 1.2, ears: 'round', nose: 'big', beard: 'braided', hair: 'short', brows: 'heavy', mouth: 'neutral', outfit: 'leather', helmet: 'cap', metal: '#a8743c' },
    c: { skin: '#e3a886', hair: '#a8462a', outfit: '#5a4030', metal: '#a8743c', eye: '#4a7a9a' },
    variants: [
      { name: 'Red beard', c: {} },
      { name: 'Black beard', c: { skin: '#c08a62', hair: '#2a201c', eye: '#5a3a24' } },
      { name: 'Grey beard', c: { skin: '#8a5a3c', hair: '#bdb8ae', eye: '#3a2a1a' } },
      { name: 'Gold beard', c: { skin: '#f2cdb0', hair: '#d8a84a' } },
    ],
    over: (x) => {
      soot(x);
      minerLamp(x);
      pickaxe(x);
    },
  },
  {
    id: 'elf-archer', name: 'Elf Archer', tags: ['elf', 'archer', 'bow', 'forest', 'sentinel', 'warden', 'npc'],
    o: { face: 'narrow', headW: 17.5, headH: 24, ears: 'elf', hair: 'long', nose: 'small', mouth: 'neutral', brows: 'calm', outfit: 'leather', cloak: '#3e6b3a', held: 'bow', quiver: true, crown: 'circlet' },
    c: { skin: '#f0d4b6', hair: '#ead68e', outfit: '#4a5a3a', cloak: '#3e6b3a', eye: '#3f9a6a', crown: '#c9ced3' },
    variants: [
      { name: 'Fair, golden hair', c: {} },
      { name: 'Fair, silver hair', c: { skin: '#f4e0cc', hair: '#e6ebf0', eye: '#5a86c0', cloak: '#3a4a6a' } },
      { name: 'Bronze, auburn hair', c: { skin: '#c8946a', hair: '#8a3a22', eye: '#6a4a2a', cloak: '#7a5638' } },
      { name: 'Deep, black hair', c: { skin: '#7a4e34', hair: '#1a1414', eye: '#c9a24a' } },
    ],
  },
  {
    id: 'ship-captain', name: 'Ship Captain', tags: ['captain', 'sea', 'ship', 'sailor', 'navy', 'harbor', 'dock', 'npc'],
    o: { outfit: 'coat', hat: 'tricorn', beard: 'full', hair: 'short', brows: 'heavy', mouth: 'neutral', face: 'square', beads: '#e2b84a' },
    c: { skin: '#d8a882', hair: '#d8d4cc', outfit: '#1e2a4a', trim: '#e2b84a', hat: '#141a2a', plume: '#e2b84a', eye: '#4a6a8a' },
    variants: [
      ...SKINS_KEEP_HAIR,
      { name: 'Red coat, dark beard', c: { outfit: '#6a1418', hair: '#2a1a14' } },
    ],
    over: spyglass,
  },
  {
    id: 'monk', name: 'Monk', tags: ['monk', 'monastery', 'martial', 'pilgrim', 'ascetic', 'temple', 'npc'],
    o: { outfit: 'gi', hair: 'bald', eyeStyle: 'closed', mouth: 'smile', brows: 'calm', held: 'fist', beads: '#7a4a2a' },
    c: { skin: '#e2b08c', outfit: '#d9822b', trim: '#8a3a1a', eye: '#3a2a1a' },
    variants: [
      { name: 'Saffron', c: {} },
      { name: 'Grey robe, olive', c: { outfit: '#8a8a84', trim: '#4a4a44', skin: '#c8996e' } },
      { name: 'Maroon, brown', c: { outfit: '#7a1f24', trim: '#e2b84a', skin: '#8a5a3c' } },
      { name: 'Blue, deep', c: { outfit: '#2a4a7a', trim: '#e8dcc0', skin: '#5e3a26' } },
    ],
  },
  {
    id: 'paladin', name: 'Paladin', tags: ['paladin', 'holy', 'knight', 'crusader', 'oath', 'champion', 'temple', 'npc'],
    o: { outfit: 'plate', cloak: '#efe8da', holy: '#e9c24a', held: 'sword', held2: 'shield', heldColor: '#efe8da', hair: 'short', brows: 'calm', mouth: 'neutral', fx: 'halo', glowColor: '#ffe08a' },
    c: { skin: '#e8b894', hair: '#c8902a', metal: '#d3d8de', trim: '#c9a24a', cloak: '#efe8da', held: '#efe8da', eye: '#4a6a8a' },
    variants: skinVars([{ name: 'Blue tabard', c: { cloak: '#2f5d8a', held: '#2f5d8a', trim: '#e2b84a' } }]),
  },
  {
    id: 'ranger', name: 'Ranger', tags: ['ranger', 'tracker', 'wilds', 'hooded', 'archer', 'forest', 'warden', 'npc'],
    o: { outfit: 'leather', hood: 'up', cloak: '#4a5a3a', held: 'bow', held2: 'dagger', quiver: true, beard: 'stubble', brows: 'heavy', mouth: 'neutral', scar: true },
    c: { skin: '#e2b08c', hair: '#3a2a1a', outfit: '#5a4030', hood: '#4a5a3a', cloak: '#4a5a3a', eye: '#3f6a4a' },
    variants: skinVars([{ name: 'Brown cloak', c: { hood: '#6a4a2e', cloak: '#6a4a2e' } }, { name: 'Grey cloak', c: { hood: '#5a5e62', cloak: '#5a5e62' } }]),
  },
];

export const STAPLE_CREATURES: CreatureDef[] = [
  ...WITCHES.map(make), FAMILIAR,
  ...CASTERS.map(make),
  ...UNDEAD.map(make), BONE_DRAGON,
  ...NPCS.map(make),
  genericDragon,
];

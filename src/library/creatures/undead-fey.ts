// Undead and fey tokens. Most are busts from portrait.ts; a few (wisps, claws, skulls, the kelpie) are drawn here.
// Original art drawn with the Canvas 2D API. Creatures come from the SRD or public folklore.
import type { CreatureDef, G } from '../art/types';
import { rng, blob, paint, domeFill, litFill, ellipse, circle, poly, shade, mix, alpha, glow, line, rr, INK, LW } from '../art/kit';
import { drawBust, taper, sparkle, type BustOpts } from './portrait';
import { bustCreature, colorOpts } from './people';

// ------------------------------------------------------------------ custom heads

/** A horse's head seen from the front. Used for the kelpie. */
function horseHead(g: G, c: Record<string, string>, seed: number) {
  const r = rng(seed);
  const skin = c.skin, mane = c.hair ?? shade(skin, -0.4);
  // neck and shoulders
  blob(g, [[2, 112], [8, 80], [26, 62], [74, 62], [92, 80], [98, 112]]);
  paint(g, domeFill(g, 40, 80, 56, shade(skin, -0.2), 0.25), INK, LW);
  // mane down both sides of the neck
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const x = 50 + s * (22 + i * 4);
      taper(g, [[x, 20 + i * 6], [x + s * 6, 48 + i * 6], [x + s * 2 + (r() - 0.5) * 6, 82 + i * 5]], 7, 1.5, 4);
      paint(g, shade(mane, (r() - 0.5) * 0.3), INK, 1.1);
    }
  }
  // ears
  for (const s of [-1, 1]) {
    poly(g, [[50 + s * 10, 22], [50 + s * 18, 2], [50 + s * 24, 22]]);
    paint(g, domeFill(g, 50 + s * 17, 14, 10, skin, 0.3), INK, 1.6);
    poly(g, [[50 + s * 14, 20], [50 + s * 18, 8], [50 + s * 21, 20]]);
    g.fillStyle = alpha(shade(skin, -0.5), 0.8);
    g.fill();
  }
  // head: wide brow, long face, rounded muzzle
  blob(g, [[50, 14], [68, 20], [74, 36], [66, 56], [64, 74], [70, 90], [60, 102], [40, 102], [30, 90], [36, 74], [34, 56], [26, 36], [32, 20]]);
  paint(g, domeFill(g, 44, 40, 48, skin, 0.3), INK, LW);
  // blaze down the nose
  blob(g, [[50, 22], [54, 40], [53, 70], [50, 78], [47, 70], [46, 40]]);
  g.fillStyle = alpha(c.under ?? shade(skin, 0.35), 0.7);
  g.fill();
  // muzzle
  ellipse(g, 50, 90, 17, 11);
  paint(g, domeFill(g, 47, 86, 17, c.under ?? shade(skin, 0.15), 0.25), INK, 1.6);
  for (const s of [-1, 1]) {
    ellipse(g, 50 + s * 8, 88, 3.2, 4.6, s * 0.3);
    paint(g, '#1a1414', null);
  }
  line(g, 42, 97, 58, 97, alpha(INK, 0.7), 1.2);
  // eyes on the sides
  const eyeCol = c.glow ?? c.eye ?? '#2a1a14';
  for (const s of [-1, 1]) {
    if (c.glow) glow(g, 50 + s * 21, 36, 12, c.glow, 0.8);
    ellipse(g, 50 + s * 21, 36, 4.6, 3.2, s * -0.5);
    paint(g, domeFill(g, 50 + s * 21, 35, 4.6, eyeCol, 0.5), INK, 1.3);
    circle(g, 50 + s * 21 - 1.2, 35, 1);
    g.fillStyle = '#fff';
    g.fill();
  }
  // forelock
  for (let i = 0; i < 4; i++) {
    taper(g, [[44 + i * 4, 14], [46 + i * 3, 24], [48 + i * 2 + (r() - 0.5) * 3, 34]], 5, 1, 3);
    paint(g, shade(mane, 0.1 - i * 0.05), INK, 1);
  }
}

/** A horse or bull skull with a little spine and shoulder bone. */
function beastSkull(g: G, c: Record<string, string>, bull: boolean, seed: number) {
  const r = rng(seed);
  const bone = c.skin;
  const glowCol = c.glow ?? '#7fd8ff';
  // vertebrae and shoulder blades
  for (let i = 0; i < 3; i++) {
    rr(g, 43, 78 + i * 9, 14, 7, 2.5);
    paint(g, domeFill(g, 50, 80 + i * 9, 8, shade(bone, -0.08), 0.3), INK, 1.2);
  }
  for (const s of [-1, 1]) {
    blob(g, [[50 + s * 14, 80], [50 + s * 40, 76], [50 + s * 46, 100], [50 + s * 20, 104]]);
    paint(g, domeFill(g, 50 + s * 30, 86, 20, shade(bone, -0.12), 0.25), INK, LW * 0.9);
  }
  if (c.metal) {
    // barding scraps
    blob(g, [[6, 108], [14, 82], [30, 74], [70, 74], [86, 82], [94, 108]]);
    paint(g, litFill(g, 6, 74, 88, 34, c.metal, 0.35), INK, LW);
    for (let i = 0; i < 6; i++) {
      circle(g, 18 + i * 13, 86, 1.6);
      paint(g, shade(c.metal, 0.4), INK, 0.6);
    }
  }
  if (bull) {
    // big horns
    for (const s of [-1, 1]) {
      taper(g, [[50 + s * 14, 26], [50 + s * 34, 22], [50 + s * 44, 8], [50 + s * 40, -2]], 12, 1, 6);
      paint(g, domeFill(g, 50 + s * 36, 14, 18, c.horn ?? '#d8ccb0', 0.4), INK, 1.8);
    }
    blob(g, [[50, 12], [70, 18], [74, 34], [64, 52], [60, 74], [56, 92], [44, 92], [40, 74], [36, 52], [26, 34], [30, 18]]);
  } else {
    for (const s of [-1, 1]) {
      poly(g, [[50 + s * 9, 20], [50 + s * 16, 4], [50 + s * 21, 22]]);
      paint(g, domeFill(g, 50 + s * 15, 14, 9, bone, 0.3), INK, 1.4);
    }
    blob(g, [[50, 12], [66, 18], [72, 34], [64, 50], [60, 72], [62, 92], [54, 100], [46, 100], [38, 92], [40, 72], [36, 50], [28, 34], [34, 18]]);
  }
  paint(g, domeFill(g, 44, 34, 46, bone, 0.32), INK, LW);
  // sockets
  for (const s of [-1, 1]) {
    blob(g, [[50 + s * 9, 30], [50 + s * 18, 26], [50 + s * 24, 34], [50 + s * 20, 44], [50 + s * 11, 42]]);
    paint(g, '#120c0a', INK, 1.4);
    glow(g, 50 + s * 16, 35, 10, glowCol, 0.85);
    circle(g, 50 + s * 16, 35, 1.8);
    g.fillStyle = '#ffffff';
    g.fill();
  }
  // nasal ridge and cavity
  line(g, 50, 44, 50, bull ? 70 : 74, alpha(shade(bone, -0.5), 0.6), 1.3);
  const ny = bull ? 78 : 86;
  for (const s of [-1, 1]) {
    ellipse(g, 50 + s * 4.5, ny, 3, 5, s * 0.25);
    paint(g, '#120c0a', INK, 1);
  }
  // teeth
  const ty = bull ? 88 : 96;
  rr(g, 41, ty - 3, 18, 5, 1.5);
  paint(g, shade(bone, 0.12), INK, 1);
  g.beginPath();
  for (let i = 1; i < 5; i++) { g.moveTo(41 + i * 3.6, ty - 3); g.lineTo(41 + i * 3.6, ty + 2); }
  g.strokeStyle = alpha(INK, 0.7);
  g.lineWidth = 0.8;
  g.stroke();
  // cracks
  g.beginPath();
  g.moveTo(58, 18); g.lineTo(55 + r() * 3, 24); g.lineTo(59, 29);
  g.moveTo(40, 52); g.lineTo(43, 58);
  g.strokeStyle = alpha(INK, 0.7);
  g.lineWidth = 1;
  g.stroke();
}

function wisp(g: G, c: Record<string, string>, seed: number) {
  const r = rng(seed);
  const col = c.glow;
  glow(g, 50, 48, 50, col, 0.7);
  // trailing tail
  taper(g, [[50, 56], [62, 72], [48, 86], [56, 100]], 18, 1, 6);
  g.fillStyle = alpha(col, 0.45);
  g.fill();
  taper(g, [[46, 54], [36, 68], [44, 80]], 10, 1, 5);
  g.fillStyle = alpha(col, 0.35);
  g.fill();
  // orb
  circle(g, 50, 46, 21);
  const gr = g.createRadialGradient(45, 40, 2, 50, 46, 22);
  gr.addColorStop(0, '#ffffff');
  gr.addColorStop(0.45, shade(col, 0.55));
  gr.addColorStop(1, alpha(col, 0.55));
  g.fillStyle = gr;
  g.fill();
  g.strokeStyle = alpha(shade(col, -0.3), 0.6);
  g.lineWidth = 1.4;
  g.stroke();
  // faint face inside
  for (const s of [-1, 1]) {
    ellipse(g, 50 + s * 7, 44, 3, 4.2);
    g.fillStyle = alpha(shade(col, -0.7), 0.55);
    g.fill();
  }
  ellipse(g, 50, 54, 3, 4);
  g.fillStyle = alpha(shade(col, -0.7), 0.45);
  g.fill();
  for (let i = 0; i < 6; i++) {
    const a = r() * Math.PI * 2, d = 26 + r() * 16;
    sparkle(g, 50 + Math.cos(a) * d, 46 + Math.sin(a) * d, 1.8 + r() * 2, shade(col, 0.6));
  }
}

function crawlingClaw(g: G, c: Record<string, string>, seed: number) {
  const r = rng(seed);
  const skin = c.skin;
  if (c.glow) glow(g, 50, 56, 46, c.glow, 0.45);
  // severed wrist trailing down
  taper(g, [[50, 104], [50, 88], [50, 74]], 22, 26, 3);
  paint(g, litFill(g, 38, 74, 26, 30, shade(skin, -0.15), 0.25), INK, LW);
  // thumb out to the side
  taper(g, [[36, 66], [24, 58], [16, 46]], 12, 8, 4);
  paint(g, domeFill(g, 24, 56, 12, skin, 0.3), INK, LW * 0.9);
  poly(g, [[13, 46], [19, 44], [13, 37]]);
  paint(g, c.nail ?? '#3a2a22', INK, 0.9);
  // four fingers side by side, gripping forward
  const fingers: [number, number, number][] = [[37, 30, -5], [46, 22, -1.5], [55, 21, 1.5], [64, 30, 5]];
  for (const [x, ty, lean] of fingers) {
    taper(g, [[x, 52], [x + lean * 0.6, (52 + ty) / 2], [x + lean, ty]], 13.5, 10.5, 4);
    paint(g, litFill(g, x - 6, ty, 12, 52 - ty, skin, 0.3), INK, LW * 0.9);
    // knuckle creases
    const my = (52 + ty) / 2;
    g.beginPath();
    g.moveTo(x + lean * 0.6 - 3.5, my); g.quadraticCurveTo(x + lean * 0.6, my + 1.5, x + lean * 0.6 + 3.5, my);
    g.strokeStyle = alpha(shade(skin, -0.5), 0.7); g.lineWidth = 1; g.stroke();
    // nail
    ellipse(g, x + lean, ty + 1, 3.4, 4.2);
    paint(g, c.nail ?? '#3a2a22', INK, 0.9);
  }
  // back of the hand
  blob(g, [[30, 58], [38, 44], [50, 40], [64, 44], [70, 58], [66, 74], [50, 80], [34, 74]]);
  paint(g, domeFill(g, 45, 52, 30, skin, 0.3), INK, LW);
  // tendons and blotches
  g.strokeStyle = alpha(shade(skin, -0.45), 0.6);
  g.lineWidth = 1.2;
  g.beginPath();
  for (let i = 0; i < 4; i++) {
    const x = 38 + i * 8;
    g.moveTo(x + (i - 1.5) * 1.5, 46); g.quadraticCurveTo(x, 60, 46 + i * 2.5, 74);
  }
  g.stroke();
  g.fillStyle = alpha(mix(skin, '#3d2a1e', 0.5), 0.45);
  for (let i = 0; i < 3; i++) {
    circle(g, 38 + r() * 24, 52 + r() * 18, 2 + r() * 2.5);
    g.fill();
  }
  // stitched cut at the wrist
  line(g, 38, 82, 62, 82, '#6a1a1a', 2.4);
  g.beginPath();
  for (let i = 0; i < 6; i++) { g.moveTo(40 + i * 4, 79); g.lineTo(41 + i * 4, 85); }
  g.strokeStyle = '#2a1a14'; g.lineWidth = 1; g.stroke();
}

function poltergeistExtras(g: G, seed: number) {
  const r = rng(seed);
  // a floating plate, a cup and a knife
  g.save();
  g.translate(20, 30);
  g.rotate(-0.4);
  ellipse(g, 0, 0, 9, 4);
  paint(g, domeFill(g, 0, 0, 9, '#e6e0d2', 0.3), INK, 1.3);
  ellipse(g, 0, -0.5, 5, 2);
  g.strokeStyle = alpha('#2f5d8a', 0.8);
  g.lineWidth = 1;
  g.stroke();
  g.restore();
  g.save();
  g.translate(82, 34);
  g.rotate(0.5);
  rr(g, -5, -6, 10, 11, 2);
  paint(g, litFill(g, -5, -6, 10, 11, '#a3312c', 0.3), INK, 1.2);
  ellipse(g, 6, 0, 3, 3.6);
  g.strokeStyle = INK;
  g.lineWidth = 1.8;
  g.stroke();
  g.restore();
  g.save();
  g.translate(84, 72);
  g.rotate(-0.9);
  poly(g, [[-2, -12], [2, -12], [1.6, 2], [-1.6, 2]]);
  paint(g, '#c9ced3', INK, 1);
  rr(g, -2.5, 2, 5, 9, 1.5);
  paint(g, '#5a3a22', INK, 1);
  g.restore();
  g.strokeStyle = alpha('#bfe8ff', 0.7);
  g.lineWidth = 1.2;
  g.beginPath();
  for (let i = 0; i < 3; i++) {
    const x = 14 + r() * 72, y = 50 + r() * 30;
    g.moveTo(x, y);
    g.quadraticCurveTo(x + 5, y - 4, x + 10, y);
  }
  g.stroke();
}

// ------------------------------------------------------------------ the creatures

type Opts = Partial<BustOpts>;

const bust = (
  id: string, name: string, family: CreatureDef['family'], size: CreatureDef['size'], cr: string | undefined, srd: string | undefined,
  tags: string[], o: Opts, c: Record<string, string>, variants?: CreatureDef['variants'], flags?: (f: Record<string, number>) => Opts,
): CreatureDef => bustCreature({ id, name, family, size, cr, srd, tags, o, c, variants, flags });

const custom = (
  id: string, name: string, family: CreatureDef['family'], size: CreatureDef['size'], cr: string | undefined, tags: string[],
  c: Record<string, string>, variants: CreatureDef['variants'], draw: CreatureDef['draw'], srd?: string,
): CreatureDef => {
  const d: CreatureDef = { id, name, family, size, tags, c, variants, draw };
  if (cr) d.cr = cr;
  if (srd) d.srd = srd;
  return d;
};

const UNDEAD: CreatureDef[] = [
  bust('zombie', 'Zombie', 'undead', 'Medium', '1/4', 'zombie', ['undead', 'corpse', 'walking dead', 'rotting', 'crypt', 'graveyard'],
    { rot: 0.85, pallor: 0.25, eyeStyle: 'blank', sunken: true, mouth: 'open', hair: 'stringy', outfit: 'rags', held: 'claws', brows: 'worried', face: 'gaunt' },
    { skin: '#c8a888', hair: '#3a3028', outfit: '#5a5244' },
    [{ name: 'Rotting', c: {} }, { name: 'Fresh', c: { skin: '#e2c0a8', hair: '#6a4a2a', outfit: '#6a5a8a' } }, { name: 'Bloated', c: { skin: '#8a9aa8', outfit: '#4a4a40' } }, { name: 'Dark', c: { skin: '#6e4a36', hair: '#1a1414' } }]),
  bust('ogre-zombie', 'Ogre Zombie', 'undead', 'Large', '2', undefined, ['undead', 'ogre', 'giant', 'brute', 'rotting', 'large'],
    { rot: 0.9, pallor: 0.2, face: 'wide', headW: 24, headH: 25, headY: 45, shoulders: 1.35, eyeStyle: 'blank', sunken: true, mouth: 'teeth', nose: 'flat', brows: 'heavy', hair: 'stringy', outfit: 'rags', held: 'club', ears: 'round' },
    { skin: '#a89a6a', hair: '#2a241e', outfit: '#5a4a34' },
    [{ name: 'Rotting', c: {} }, { name: 'Grey', c: { skin: '#8a8e8a' } }]),
  bust('skeleton', 'Skeleton', 'undead', 'Medium', '1/4', 'skeleton', ['undead', 'bones', 'crypt', 'tomb', 'warrior', 'dungeon'],
    { skull: true, outfit: 'ribs', eyeStyle: 'hollow', glowColor: '#7fd8ff', held: 'sword' },
    { skin: '#e4dbc2' },
    [
      { name: 'Bones', c: {} },
      { name: 'Rusty soldier', c: { metal: '#8b5a3b', held: '#6b4a2b' }, f: { armed: 1 } },
      { name: 'Red eyes', c: { glow: '#ff4a3a' } },
      { name: 'Blackened', c: { skin: '#6a625a', glow: '#9cff7a' } },
    ],
    (f) => (f.armed ? { helmet: 'cap', held2: 'round-shield', held: 'scimitar' } : {})),
  custom('warhorse-skeleton', 'Warhorse Skeleton', 'undead', 'Large', '1/2', ['undead', 'horse', 'mount', 'bones', 'steed', 'large'],
    { skin: '#e4dbc2', glow: '#7fd8ff' },
    [{ name: 'Bones', c: {} }, { name: 'Barded', c: { metal: '#6a6e74' } }, { name: 'Red eyes', c: { glow: '#ff4a3a' } }],
    ({ g, c, seed }) => beastSkull(g, c, false, seed)),
  custom('minotaur-skeleton', 'Minotaur Skeleton', 'undead', 'Large', '2', ['undead', 'minotaur', 'bull', 'bones', 'labyrinth', 'large'],
    { skin: '#e4dbc2', glow: '#ff7a3a', horn: '#d8ccb0' },
    [{ name: 'Bones', c: {} }, { name: 'Blue eyes', c: { glow: '#7fd8ff' } }, { name: 'Blackened', c: { skin: '#6a625a', horn: '#3a3430', glow: '#9cff7a' } }],
    ({ g, c, seed }) => beastSkull(g, c, true, seed)),
  bust('ghoul', 'Ghoul', 'undead', 'Medium', '1', 'ghoul', ['undead', 'flesh eater', 'crypt', 'graveyard', 'claws', 'paralysis'],
    { face: 'gaunt', pallor: 0.35, ears: 'long', eyeStyle: 'glow', glowColor: '#f2e86a', sunken: true, mouth: 'maw', nose: 'flat', hair: 'stringy', outfit: 'rags', held: 'claws', brows: 'angry' },
    { skin: '#8a9a88', hair: '#2a2420', outfit: '#4a4438' },
    [{ name: 'Grey-green', c: {} }, { name: 'Ashen', c: { skin: '#a8a4a0', glow: '#ff5a3a' } }, { name: 'Blue', c: { skin: '#7a8aa0' } }]),
  bust('ghast', 'Ghast', 'undead', 'Medium', '2', undefined, ['undead', 'ghoul', 'stench', 'crypt', 'flesh eater'],
    { face: 'gaunt', pallor: 0.2, rot: 0.4, ears: 'long', eyeStyle: 'glow', glowColor: '#b8ff5a', sunken: true, mouth: 'maw', nose: 'none', hair: 'bald', outfit: 'rags', held: 'claws', brows: 'angry', fx: 'fumes' },
    { skin: '#7a8a5a', outfit: '#3a3a2a' },
    [{ name: 'Green', c: {} }, { name: 'Purple', c: { skin: '#7a6a8a', glow: '#ff7aff' } }]),
  bust('wight', 'Wight', 'undead', 'Medium', '3', 'wight', ['undead', 'barrow', 'tomb', 'warrior', 'life drain', 'crypt'],
    { face: 'gaunt', pallor: 0.55, eyeStyle: 'glow', glowColor: '#7fd8ff', sunken: true, hair: 'long', mouth: 'frown', brows: 'angry', outfit: 'mail', cloak: '#26262e', held: 'sword', crown: 'circlet', crownColor: '#6a6e74' },
    { skin: '#9aa8b4', hair: '#d8dce0', metal: '#5a5e64', cloak: '#26262e' },
    [{ name: 'Blue glow', c: {} }, { name: 'Red glow', c: { glow: '#ff4a3a', cloak: '#3a1418' } }, { name: 'Black hair', c: { hair: '#1a1a1e' } }]),
  bust('wraith', 'Wraith', 'undead', 'Medium', '5', undefined, ['undead', 'spirit', 'shadow', 'incorporeal', 'life drain', 'hooded'],
    { noFace: true, hood: 'up', eyeStyle: 'glow', glowColor: '#ff3a3a', outfit: 'wisp', ghost: 0.95, held: 'claws' },
    { skin: '#1a1820', hood: '#24222c', outfit: '#24222c' },
    [{ name: 'Red eyes', c: {} }, { name: 'Green eyes', c: { glow: '#7aff6a' } }, { name: 'Blue eyes', c: { glow: '#7fd8ff', hood: '#1e2a3a', outfit: '#1e2a3a' } }]),
  bust('specter', 'Specter', 'undead', 'Medium', '1', 'specter', ['undead', 'spirit', 'ghostly', 'incorporeal', 'haunt'],
    { noFace: true, hood: 'up', eyeStyle: 'glow', glowColor: '#e8ffff', outfit: 'wisp', ghost: 0.78, fx: 'motes' },
    { skin: '#2a4a5a', hood: '#8ac8d8', outfit: '#8ac8d8', glow: '#e8ffff' },
    [{ name: 'Pale blue', c: {} }, { name: 'Green', c: { hood: '#8ad8a0', outfit: '#8ad8a0', skin: '#1e4a2a' } }, { name: 'Grey', c: { hood: '#a8a8b0', outfit: '#a8a8b0', skin: '#2a2a32' } }]),
  bust('ghost', 'Ghost', 'undead', 'Medium', '4', undefined, ['undead', 'spirit', 'haunt', 'incorporeal', 'possession', 'haunted house'],
    { ghost: 0.72, pallor: 0.2, eyeStyle: 'blank', sunken: true, hair: 'long', brows: 'worried', mouth: 'frown', outfit: 'wisp', fx: 'motes', glowColor: '#cfffff', fx2: 'aura' },
    { skin: '#c8e8ec', hair: '#e8f4f6', outfit: '#a8d8e0' },
    [{ name: 'Pale blue', c: {} }, { name: 'Green', c: { skin: '#c8ecd0', hair: '#e0f6e4', outfit: '#9ad8aa', glow: '#c8ffd0' } }, { name: 'Bearded', c: {}, f: { beard: 1 } }],
    (f) => (f.beard ? { hair: 'short', beard: 'full' } : {})),
  bust('banshee', 'Banshee', 'undead', 'Medium', '4', undefined, ['undead', 'spirit', 'wail', 'elf', 'incorporeal', 'scream'],
    { ghost: 0.8, ears: 'elf', face: 'narrow', hair: 'flowing', mouth: 'open', eyeStyle: 'glow', glowColor: '#ffffff', brows: 'worried', outfit: 'wisp', sunken: true, headW: 17.5, headH: 24 },
    { skin: '#d4e6ec', hair: '#eef6f8', outfit: '#b8d8e4' },
    [{ name: 'Pale', c: {} }, { name: 'Green', c: { skin: '#cfe8d6', hair: '#e2f6e6', outfit: '#9ad8aa' } }, { name: 'Violet', c: { skin: '#ddd4ec', hair: '#f0eaf8', outfit: '#c0a8e0' } }]),
  bust('shadow', 'Shadow', 'undead', 'Medium', '1/2', undefined, ['undead', 'shadow', 'darkness', 'incorporeal', 'strength drain'],
    { noFace: true, ears: 'none', hair: 'none', eyeStyle: 'glow', glowColor: '#f4f4ff', outfit: 'wisp', ghost: 0.92, held: 'claws' },
    { skin: '#121216', outfit: '#121216' },
    [{ name: 'Black', c: {} }, { name: 'Violet eyes', c: { glow: '#c07aff' } }]),
  custom('poltergeist', 'Poltergeist', 'undead', 'Medium', '1/2', ['undead', 'spirit', 'haunt', 'invisible', 'mischief', 'haunted house'],
    { skin: '#c8e4f0', outfit: '#a8d4e4' },
    [{ name: 'Pale blue', c: {} }, { name: 'Green', c: { skin: '#cfeed6', outfit: '#9ad8aa' } }],
    ({ g, c, seed }) => {
      drawBust(g, { ...colorOpts(c), skin: c.skin, face: 'round', hair: 'none', ears: 'none', eyeStyle: 'big', eyes: '#2a4a6a', mouth: 'grin', brows: 'sly', outfit: 'wisp', ghost: 0.78, headW: 20, headH: 21, headY: 46 } as BustOpts, seed);
      poltergeistExtras(g, seed);
    }),
  bust('mummy', 'Mummy', 'undead', 'Medium', '3', undefined, ['undead', 'tomb', 'pyramid', 'wrapped', 'curse', 'desert'],
    { wraps: true, ears: 'none', hair: 'none', outfit: 'bandage', eyeStyle: 'glow', glowColor: '#7aff9a', brows: 'none', held: 'claws' },
    { skin: '#cbbf9a', outfit: '#bfb08a' },
    [{ name: 'Linen', c: {} }, { name: 'Dark', c: { skin: '#8a7a5a', outfit: '#7a6a4a' } }, { name: 'Red eyes', c: { glow: '#ff5a3a' } }]),
  bust('mummy-lord', 'Mummy Lord', 'undead', 'Medium', '15', undefined, ['undead', 'tomb', 'pharaoh', 'king', 'curse', 'desert', 'boss'],
    { wraps: true, ears: 'none', hair: 'none', outfit: 'bandage', hat: 'nemes', mantle: 'gold', eyeStyle: 'glow', glowColor: '#ffd166', brows: 'none', fx: 'aura', held: 'staff', heldColor: '#4cc9f0' },
    { skin: '#bfb08a', outfit: '#a8986e', hat: '#e2b84a', plume: '#2f4f8a', mantle: '#e2b84a', trim: '#2f6fb0' },
    [{ name: 'Gold and blue', c: {} }, { name: 'Gold and red', c: { plume: '#8a1f2a', trim: '#8a1f2a', glow: '#ff5a3a' } }]),
  bust('vampire', 'Vampire', 'undead', 'Medium', '13', undefined, ['undead', 'vampire', 'noble', 'blood', 'castle', 'boss'],
    { face: 'long', pallor: 0.5, hair: 'slick', eyeStyle: 'glow', glowColor: '#ff2a2a', mouth: 'fangs', brows: 'sly', collar: 'high', outfit: 'coat', cloak: '#141216', ears: 'long' },
    { skin: '#e8d4cc', hair: '#141016', outfit: '#1e1a1e', trim: '#8a1f2a', collar: '#141216', cloak: '#141216' },
    [{ name: 'Count', c: {} }, { name: 'Countess', c: { hair: '#4a0e14', outfit: '#5a0e14' }, f: { long: 1 } }, { name: 'Silver hair', c: { hair: '#d8dce0', skin: '#c8b8b0' } }],
    (f) => (f.long ? { hair: 'long', face: 'heart' } : {})),
  bust('vampire-spawn', 'Vampire Spawn', 'undead', 'Medium', '5', undefined, ['undead', 'vampire', 'blood', 'thrall', 'feral'],
    { face: 'gaunt', pallor: 0.6, hair: 'wild', eyeStyle: 'glow', glowColor: '#ff3a3a', sunken: true, mouth: 'snarl', brows: 'angry', outfit: 'rags', ears: 'long', held: 'claws' },
    { skin: '#d8c4bc', hair: '#2a2024', outfit: '#4a3a3e' },
    [{ name: 'Pale', c: {} }, { name: 'Ashen', c: { skin: '#a8a0a8', hair: '#6a6470' } }, { name: 'Dark', c: { skin: '#8a6a5e', hair: '#141014' } }]),
  bust('lich', 'Lich', 'undead', 'Medium', '21', undefined, ['undead', 'necromancer', 'wizard', 'skull', 'phylactery', 'boss'],
    { skull: true, crown: 'crown', crownColor: '#9a8a4a', collar: 'high', outfit: 'robe', eyeStyle: 'hollow', glowColor: '#7aff9a', held: 'staff', heldColor: '#7aff9a', fx: 'aura', fx2: 'eldritch', beads: '#d8ccb0' },
    { skin: '#d8ccac', outfit: '#3a1e4a', trim: '#c9a24a', collar: '#24102e' },
    [{ name: 'Green fire', c: {} }, { name: 'Blue fire', c: { glow: '#7fd8ff', held: '#7fd8ff', outfit: '#14203a', collar: '#0c1424' } }, { name: 'Red fire', c: { glow: '#ff5a3a', held: '#ff5a3a', outfit: '#3a0e12', collar: '#1e0608' } }]),
  custom('will-o-wisp', "Will-o'-Wisp", 'undead', 'Tiny', '2', ['undead', 'light', 'swamp', 'marsh', 'lure', 'spirit'],
    { glow: '#9ad8ff' },
    [{ name: 'Blue', c: {} }, { name: 'Green', c: { glow: '#a8ff8a' } }, { name: 'Gold', c: { glow: '#ffd27a' } }, { name: 'Violet', c: { glow: '#d0a8ff' } }],
    ({ g, c, seed }) => wisp(g, c, seed)),
  custom('crawling-claw', 'Crawling Claw', 'undead', 'Tiny', '0', ['undead', 'hand', 'severed', 'crypt', 'crawling'],
    { skin: '#c8b49a' },
    [{ name: 'Pale', c: {} }, { name: 'Grey', c: { skin: '#9a9c94' } }, { name: 'Dark', c: { skin: '#7a5a44' } }, { name: 'Green glow', c: { skin: '#a8a888', glow: '#9cff7a' } }],
    ({ g, c, seed }) => crawlingClaw(g, c, seed)),
];

const FEY: CreatureDef[] = [
  bust('dryad', 'Dryad', 'fey', 'Medium', '1', undefined, ['fey', 'tree', 'forest', 'nature', 'spirit', 'grove'],
    { hair: 'leafy', crown: 'flowers', outfit: 'bark', ears: 'elf', face: 'narrow', eyeStyle: 'big', mouth: 'smile', brows: 'calm', fx: 'motes', glowColor: '#e8ffa0', headW: 17.5, headH: 23 },
    { skin: '#a8b878', hair: '#4f8a3a', outfit: '#7a5a3a', trim: '#6fa04a', eye: '#3a7a2a', crown: '#f2a7d8' },
    [{ name: 'Spring', c: {} }, { name: 'Autumn', c: { hair: '#c8602a', trim: '#e0a03a', skin: '#c8a878', crown: '#ffd166' } }, { name: 'Birch', c: { skin: '#e8e0d0', outfit: '#e8e4dc', hair: '#8ab05a' } }, { name: 'Dark oak', c: { skin: '#8a6a4a', outfit: '#4a3424', hair: '#3a6a2a' } }]),
  bust('nymph', 'Nymph', 'fey', 'Medium', undefined, undefined, ['fey', 'spirit', 'forest', 'spring', 'beauty', 'folklore'],
    { hair: 'flowing', crown: 'flowers', outfit: 'gown', ears: 'elf', face: 'heart', eyeStyle: 'big', mouth: 'smile', blush: true, fx: 'motes', glowColor: '#fff3a0', headW: 17.5 },
    { skin: '#f2dcc8', hair: '#d89a4a', outfit: '#9ad0a0', trim: '#f4f0e0', eye: '#3a8a6a', crown: '#f2a7d8' },
    [{ name: 'Meadow', c: {} }, { name: 'Moonlit', c: { skin: '#dce4f0', hair: '#eef2f8', outfit: '#a8b8e8', eye: '#5a6ab8' } }, { name: 'Bronze', c: { skin: '#a8724c', hair: '#2a1a14', outfit: '#e8c46a' } }]),
  bust('naiad', 'Naiad', 'fey', 'Medium', undefined, undefined, ['fey', 'water', 'river', 'spring', 'lake', 'folklore'],
    { hair: 'flowing', crown: 'shells', outfit: 'gown', ears: 'fin', face: 'oval', eyeStyle: 'big', mouth: 'smile', fx: 'drips', beads: '#f2b8a8' },
    { skin: '#9cc8e0', hair: '#2a8a9a', outfit: '#4ab0c0', trim: '#e8f8ff', eye: '#1e4a8a', under: '#c8eef8' },
    [{ name: 'River blue', c: {} }, { name: 'Lake green', c: { skin: '#a8d8c0', hair: '#3a7a5a', outfit: '#5ab08a' } }, { name: 'Deep', c: { skin: '#5a7ab0', hair: '#e8f0f8', outfit: '#2a4a8a' } }]),
  bust('satyr', 'Satyr', 'fey', 'Medium', '1/2', undefined, ['fey', 'goat', 'revel', 'music', 'forest', 'pipes'],
    { horns: 'ram', ears: 'long', hair: 'curly', beard: 'goatee', outfit: 'bare', mouth: 'grin', brows: 'sly', held: 'pipes', crown: 'wreath', nose: 'big' },
    { skin: '#d8a882', hair: '#5a3a22', horn: '#8a7a5a', eye: '#c9a24a' },
    [{ name: 'Brown', c: {} }, { name: 'Black curls', c: { skin: '#8a5a3c', hair: '#1a1414', horn: '#d8ccb0' } }, { name: 'Ginger', c: { skin: '#f0c8a8', hair: '#b8482a', horn: '#6a5a44' } }]),
  bust('sprite', 'Sprite', 'fey', 'Tiny', '1/4', undefined, ['fey', 'tiny', 'wings', 'forest', 'archer', 'guardian'],
    { wings: 'insect', ears: 'elf', hair: 'wild', outfit: 'leaves', eyeStyle: 'big', brows: 'angry', mouth: 'neutral', held: 'bow', face: 'narrow', headW: 18, headH: 22, headY: 46, shoulders: 0.8 },
    { skin: '#c8e0b0', hair: '#4f8a3a', outfit: '#5a8a3a', trim: '#8ac04a', eye: '#2a6a8a', wing: '#bfe8ff' },
    [{ name: 'Green', c: {} }, { name: 'Blue', c: { skin: '#c0d8f0', hair: '#3a5a9a', trim: '#6a9ae0', wing: '#e8d0ff' } }, { name: 'Gold', c: { skin: '#f0dcb0', hair: '#c8902a', trim: '#e0b84a', wing: '#fff0b0' } }]),
  bust('pixie', 'Pixie', 'fey', 'Tiny', '1/4', undefined, ['fey', 'tiny', 'wings', 'mischief', 'invisible', 'magic'],
    { wings: 'butterfly', ears: 'elf', hair: 'bob', crown: 'flowers', outfit: 'leaves', eyeStyle: 'big', blush: true, mouth: 'grin', brows: 'raised', held: 'wand', fx: 'sparkle', headW: 18.5, headH: 21, headY: 47, shoulders: 0.78 },
    { skin: '#f6dccc', hair: '#c07ae0', outfit: '#e88ac0', trim: '#f4b0d8', eye: '#5a3ab8', wing: '#f2a7d8', glow: '#ffd6f2' },
    [{ name: 'Pink', c: {} }, { name: 'Sky', c: { hair: '#5ab0e8', wing: '#9ad8ff', trim: '#a8e0ff', outfit: '#6ab0e0', glow: '#d6f2ff' } }, { name: 'Sunny', c: { hair: '#f2c14e', wing: '#ffd166', trim: '#ffe08a', outfit: '#e8a03a', glow: '#fff3b0' } }]),
  bust('brownie', 'Brownie', 'fey', 'Tiny', undefined, undefined, ['fey', 'household', 'helper', 'tiny', 'hearth', 'folklore'],
    { ears: 'long', hair: 'shaggy', beard: 'full', hat: 'cap', outfit: 'rags', nose: 'button', eyeStyle: 'big', mouth: 'smile', brows: 'raised', face: 'round', headW: 20, headH: 21, headY: 47, shoulders: 0.78 },
    { skin: '#c89a72', hair: '#6a4024', outfit: '#7a5638', hat: '#5a6a3a', eye: '#3a2a1a' },
    [{ name: 'Brown', c: {} }, { name: 'Grey whiskers', c: { hair: '#a8a49a', hat: '#8a2a2a' } }]),
  bust('green-hag', 'Green Hag', 'fey', 'Medium', '3', undefined, ['fey', 'hag', 'witch', 'swamp', 'curse', 'coven'],
    { face: 'gaunt', nose: 'hook', hair: 'stringy', eyeStyle: 'solid', mouth: 'teeth', spots: '#3a5a2a', brows: 'angry', outfit: 'rags', held: 'claws', sunken: true, ears: 'long' },
    { skin: '#6a8a4a', hair: '#2a2a1e', outfit: '#3a3a2a', eye: '#ffd166' },
    [{ name: 'Bare head', c: {} }, { name: 'Witch hat', c: { hat: '#2a2a22' }, f: { hat: 1 } }, { name: 'Moss', c: { skin: '#5a7a3a', hair: '#4a5a2a' } }],
    (f) => (f.hat ? { hat: 'witch' } : {})),
  bust('sea-hag', 'Sea Hag', 'fey', 'Medium', '2', undefined, ['fey', 'hag', 'sea', 'coast', 'curse', 'coven', 'water'],
    { face: 'gaunt', nose: 'hook', hair: 'stringy', eyeStyle: 'blank', mouth: 'teeth', spots: '#e8e0d0', brows: 'angry', outfit: 'rags', held: 'claws', sunken: true, ears: 'fin', fx: 'drips' },
    { skin: '#6a8a9a', hair: '#3a6a3a', outfit: '#2a4a3a', under: '#8aa8b0' },
    [{ name: 'Grey-blue', c: {} }, { name: 'Green', c: { skin: '#5a7a6a', hair: '#2a4a2a' } }]),
  bust('night-hag', 'Night Hag', 'fiend', 'Medium', '5', undefined, ['fiend', 'hag', 'nightmare', 'dream', 'coven', 'soul'],
    { face: 'gaunt', nose: 'hook', hair: 'wild', horns: 'straight', eyeStyle: 'glow', glowColor: '#ff3a3a', mouth: 'fangs', brows: 'angry', outfit: 'robe', held: 'orb', sunken: true, ears: 'long' },
    { skin: '#4a3a6a', hair: '#e6e2ea', outfit: '#1e1a24', trim: '#5a2a3a', horn: '#1e1a1e' },
    [{ name: 'Violet', c: {} }, { name: 'Blue-black', c: { skin: '#2a3048', hair: '#9a9aa8' } }, { name: 'Green glow', c: { glow: '#9cff7a' } }]),
  bust('lantern-spirit', "Will-o'-the-Wisp Lantern Spirit", 'fey', 'Small', undefined, undefined, ['fey', 'lantern', 'lure', 'marsh', 'night', 'folklore', 'jack'],
    { noFace: true, hood: 'up', eyeStyle: 'glow', glowColor: '#c8ff7a', outfit: 'wisp', held: 'lantern', fx: 'motes', shoulders: 0.82, headY: 46 },
    { skin: '#141a10', hood: '#2a3a24', outfit: '#2a3a24', glow: '#c8ff7a' },
    [{ name: 'Marsh green', c: {} }, { name: 'Ember', c: { glow: '#ffb347', hood: '#3a2418', outfit: '#3a2418' } }, { name: 'Ghost blue', c: { glow: '#9ad8ff', hood: '#1e2a3a', outfit: '#1e2a3a' } }]),
  bust('blink-dog', 'Blink Dog', 'fey', 'Medium', '1/4', undefined, ['fey', 'dog', 'teleport', 'blink', 'canine', 'pack'],
    { snout: 'canine', ears: 'canine', hair: 'none', outfit: 'fur', eyes: '#4cc9f0', fx: 'blink', headW: 20, headH: 23, shoulders: 1.05 },
    { skin: '#c8a050', under: '#f0dcb0' },
    [{ name: 'Golden', c: {} }, { name: 'Pale', c: { skin: '#d8ccb0', under: '#f6f0e4' } }, { name: 'Brindle', c: { skin: '#8a6a4a', under: '#c8a882' } }]),
  bust('fey-knight', 'Fey Knight', 'fey', 'Medium', undefined, undefined, ['fey', 'knight', 'court', 'warrior', 'elf', 'folklore'],
    { ears: 'elf', earsOver: true, face: 'narrow', hair: 'long', outfit: 'plate', helmet: 'cap', crown: 'antlers', mantle: 'leaves', held: 'sword', eyeStyle: 'glow', glowColor: '#a8ff8a', brows: 'calm', mouth: 'neutral', headW: 17.5, headH: 24 },
    { skin: '#e8dcd0', hair: '#e6ebf0', metal: '#9ab8a8', mantle: '#4f8a3a', crown: '#d8ccb0' },
    [{ name: 'Summer court', c: {} }, { name: 'Winter court', c: { metal: '#c8d8e8', mantle: '#8ab0d0', glow: '#9ad8ff', hair: '#f6f8fa' } }, { name: 'Autumn court', c: { metal: '#b89a6a', mantle: '#c8602a', glow: '#ffb347', hair: '#8a3a22', skin: '#c8946a' } }]),
  bust('redcap', 'Redcap', 'fey', 'Small', undefined, undefined, ['fey', 'goblin', 'murder', 'blood', 'ruins', 'folklore'],
    { face: 'gaunt', hat: 'redcap', nose: 'long', mouth: 'teeth', eyeStyle: 'glow', glowColor: '#ff5a3a', beard: 'long', brows: 'angry', outfit: 'leather', held: 'axe', ears: 'long', shoulders: 0.82, headW: 19, headH: 21, headY: 48, sunken: true },
    { skin: '#a8a090', hair: '#c8c4bc', hat: '#a3121a', outfit: '#4a3a2a', eye: '#ff5a3a' },
    [{ name: 'Grey', c: {} }, { name: 'Ruddy', c: { skin: '#c88a6a', hair: '#6a6460' } }]),
  custom('kelpie', 'Kelpie', 'fey', 'Large', undefined, ['fey', 'water horse', 'river', 'loch', 'drown', 'folklore', 'horse'],
    { skin: '#3a5a5a', hair: '#2a6a3a', under: '#6a8a84', glow: '#a8ff8a' },
    [{ name: 'Loch green', c: {} }, { name: 'Black', c: { skin: '#24282c', hair: '#1e3a2a', under: '#4a5258' } }, { name: 'Grey', c: { skin: '#8a949a', hair: '#3a5a4a', under: '#b8c0c4', glow: '#9ad8ff' } }],
    ({ g, c, seed }) => {
      horseHead(g, c, seed);
      // weed and water drips
      const r = rng(seed + 5);
      for (let i = 0; i < 5; i++) {
        const x = 14 + r() * 72, y = 40 + r() * 50;
        if (Math.abs(x - 50) < 18) continue;
        g.beginPath();
        g.moveTo(x, y - 4);
        g.quadraticCurveTo(x + 2.4, y, x, y + 2);
        g.quadraticCurveTo(x - 2.4, y, x, y - 4);
        paint(g, alpha('#bfe8ff', 0.85), alpha('#2a5a7a', 0.8), 0.7);
      }
    }),
];

export const UNDEAD_FEY_CREATURES: CreatureDef[] = [...UNDEAD, ...FEY];

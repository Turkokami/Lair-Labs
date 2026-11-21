// Drawing kit for Lair Labs objects and tokens. Top-down, light from the top-left, ink outlines,
// soft gradients. All sizes are in art units (100 = one 5 ft square).
import type { G } from './types';

export const INK = '#1b1410';
export const LW = 2.4; // standard outline width

// ---------- maths and colour ----------
export function rng(seed: number) {
  let s = (seed >>> 0) || 0x9e3779b9;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function parse(hex: string): [number, number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
}
const hx = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');

/** Lighten (amt > 0) or darken (amt < 0) a colour. amt is -1..1. */
export function shade(hex: string, amt: number): string {
  const [r, g, b] = parse(hex);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  return `#${hx(r + (t - r) * p)}${hx(g + (t - g) * p)}${hx(b + (t - b) * p)}`;
}
/** Mix two colours. t = 0 gives a, 1 gives b. */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = parse(a), [r2, g2, b2] = parse(b);
  return `#${hx(r1 + (r2 - r1) * t)}${hx(g1 + (g2 - g1) * t)}${hx(b1 + (b2 - b1) * t)}`;
}
export function alpha(hex: string, a: number): string {
  const [r, g, b] = parse(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// ---------- paths ----------
export function rr(g: G, x: number, y: number, w: number, h: number, r: number) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + r, y);
  g.lineTo(x + w - r, y);
  g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h);
  g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.closePath();
}
export function circle(g: G, cx: number, cy: number, r: number) {
  g.beginPath();
  g.arc(cx, cy, Math.max(0.01, r), 0, Math.PI * 2);
}
export function ellipse(g: G, cx: number, cy: number, rx: number, ry: number, rot = 0) {
  g.beginPath();
  g.ellipse(cx, cy, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2);
}
export function poly(g: G, pts: number[][], close = true) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  if (close) g.closePath();
}
/** A smooth closed blob through the points (Catmull-Rom style with quadratic midpoints). */
export function blob(g: G, pts: number[][]) {
  g.beginPath();
  const n = pts.length;
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(pts[n - 1], pts[0]);
  g.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) {
    const p = pts[i], m = mid(p, pts[(i + 1) % n]);
    g.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  }
  g.closePath();
}
/** Irregular round outline around a centre: radius r, wobble 0..1. Returns points for blob(). */
export function lumpy(cx: number, cy: number, r: number, wobble: number, n: number, rand: () => number, ry = r): number[][] {
  const pts: number[][] = [];
  const off = rand() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const a = off + (i / n) * Math.PI * 2;
    const k = 1 - wobble / 2 + rand() * wobble;
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * ry * k]);
  }
  return pts;
}

// ---------- fills ----------
/** Linear light from the top-left: lighter at top-left, darker at bottom-right. */
export function litFill(g: G, x: number, y: number, w: number, h: number, base: string, strength = 0.22) {
  const gr = g.createLinearGradient(x, y, x + w, y + h);
  gr.addColorStop(0, shade(base, strength));
  gr.addColorStop(0.55, base);
  gr.addColorStop(1, shade(base, -strength * 1.4));
  return gr;
}
/** A sphere or dome lit from the top-left. */
export function domeFill(g: G, cx: number, cy: number, r: number, base: string, strength = 0.35) {
  const gr = g.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.05, cx, cy, r * 1.05);
  gr.addColorStop(0, shade(base, strength));
  gr.addColorStop(0.6, base);
  gr.addColorStop(1, shade(base, -strength));
  return gr;
}
/** Fill and outline the current path. */
export function paint(g: G, fill: string | CanvasGradient | CanvasPattern, stroke: string | null = INK, lw = LW) {
  g.fillStyle = fill;
  g.fill();
  if (stroke) {
    g.strokeStyle = stroke;
    g.lineWidth = lw;
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.stroke();
  }
}
export function line(g: G, x1: number, y1: number, x2: number, y2: number, color = INK, lw = LW) {
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.strokeStyle = color;
  g.lineWidth = lw;
  g.lineCap = 'round';
  g.stroke();
}
/** A soft highlight stroke along the top-left of a rect, gives a bevel. */
export function bevel(g: G, x: number, y: number, w: number, h: number, r = 3, a = 0.35) {
  g.save();
  rr(g, x + 1.5, y + 1.5, w - 3, h - 3, r);
  g.clip();
  g.strokeStyle = `rgba(255,255,255,${a})`;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x + 2, y + h - 3);
  g.lineTo(x + 2, y + 2);
  g.lineTo(x + w - 3, y + 2);
  g.stroke();
  g.strokeStyle = `rgba(0,0,0,${a * 0.9})`;
  g.beginPath();
  g.moveTo(x + w - 2, y + 3);
  g.lineTo(x + w - 2, y + h - 2);
  g.lineTo(x + 3, y + h - 2);
  g.stroke();
  g.restore();
}
/** Inner shading: darkens the edges of the current clip region. Call inside save/clip. */
export function vignette(g: G, cx: number, cy: number, r: number, a = 0.35) {
  const gr = g.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
  gr.addColorStop(0, 'rgba(0,0,0,0)');
  gr.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = gr;
  g.fillRect(cx - r, cy - r, r * 2, r * 2);
}
/** Little specks of grit or wear inside a rect. */
export function speckle(g: G, x: number, y: number, w: number, h: number, rand: () => number, n: number, color: string, size = 1.4) {
  g.fillStyle = color;
  for (let i = 0; i < n; i++) {
    g.beginPath();
    g.arc(x + rand() * w, y + rand() * h, size * (0.5 + rand()), 0, Math.PI * 2);
    g.fill();
  }
}

// ---------- materials ----------
/** Wood grain lines across a rect (dir 'h' = grain runs left-right). Draw over a filled rect. */
export function grain(g: G, x: number, y: number, w: number, h: number, base: string, rand: () => number, dir: 'h' | 'v' = 'h', n = 0) {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  const len = dir === 'h' ? w : h, across = dir === 'h' ? h : w;
  const count = n || Math.max(3, Math.round(across / 5));
  g.lineWidth = 0.9;
  for (let i = 0; i < count; i++) {
    const o = ((i + 0.5) / count) * across + (rand() - 0.5) * 2;
    g.strokeStyle = alpha(shade(base, -0.45), 0.35 + rand() * 0.3);
    g.beginPath();
    const amp = 0.6 + rand() * 1.4, ph = rand() * 6, fr = 0.03 + rand() * 0.05;
    for (let t = 0; t <= len; t += 4) {
      const off = o + Math.sin(t * fr + ph) * amp;
      if (dir === 'h') (t ? g.lineTo(x + t, y + off) : g.moveTo(x + t, y + off));
      else (t ? g.lineTo(x + off, y + t) : g.moveTo(x + off, y + t));
    }
    g.stroke();
  }
  // a knot now and then
  if (rand() < 0.7) {
    const kx = x + w * (0.2 + rand() * 0.6), ky = y + h * (0.2 + rand() * 0.6);
    ellipse(g, kx, ky, dir === 'h' ? 3.2 : 1.8, dir === 'h' ? 1.8 : 3.2);
    g.strokeStyle = alpha(shade(base, -0.5), 0.6);
    g.lineWidth = 0.9;
    g.stroke();
  }
  g.restore();
}
/** A wooden board: filled, grained, bevelled, outlined. */
export function board(g: G, x: number, y: number, w: number, h: number, base: string, rand: () => number, dir: 'h' | 'v' = w >= h ? 'h' : 'v', r = 2) {
  rr(g, x, y, w, h, r);
  paint(g, litFill(g, x, y, w, h, base, 0.15), null);
  grain(g, x, y, w, h, base, rand, dir);
  bevel(g, x, y, w, h, r, 0.25);
  rr(g, x, y, w, h, r);
  g.strokeStyle = INK;
  g.lineWidth = LW * 0.8;
  g.stroke();
}
/** Several boards side by side filling a rect. */
export function planks(g: G, x: number, y: number, w: number, h: number, base: string, rand: () => number, dir: 'h' | 'v' = 'h', count = 0) {
  const across = dir === 'h' ? h : w;
  const n = count || Math.max(2, Math.round(across / 14));
  const s = across / n;
  for (let i = 0; i < n; i++) {
    const tone = shade(base, (rand() - 0.5) * 0.18);
    if (dir === 'h') board(g, x, y + i * s, w, s, tone, rand, 'h', 1.5);
    else board(g, x + i * s, y, s, h, tone, rand, 'v', 1.5);
  }
}
/** A metal strap or band, with rivets. */
export function strap(g: G, x: number, y: number, w: number, h: number, metal: string, rivets = true) {
  rr(g, x, y, w, h, 1.2);
  paint(g, litFill(g, x, y, w, h, metal, 0.35), INK, 1.4);
  if (rivets) {
    const along = w > h;
    const n = Math.max(2, Math.floor((along ? w : h) / 14));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const cx = along ? x + w * t : x + w / 2, cy = along ? y + h / 2 : y + h * t;
      circle(g, cx, cy, Math.min(w, h) * 0.22);
      paint(g, shade(metal, 0.35), shade(metal, -0.6), 0.7);
    }
  }
}
export function rivet(g: G, cx: number, cy: number, r: number, metal: string) {
  circle(g, cx, cy, r);
  paint(g, domeFill(g, cx, cy, r, metal, 0.5), shade(metal, -0.6), 0.7);
}
/** A rough stone: irregular, shaded, with a crack or two. */
export function stone(g: G, cx: number, cy: number, r: number, base: string, rand: () => number, ry = r) {
  const pts = lumpy(cx, cy, r, 0.35, 9, rand, ry);
  blob(g, pts);
  paint(g, domeFill(g, cx, cy, Math.max(r, ry), base, 0.28), INK, LW * 0.9);
  // facets
  g.save();
  blob(g, pts);
  g.clip();
  g.strokeStyle = alpha(shade(base, -0.5), 0.5);
  g.lineWidth = 0.9;
  for (let i = 0; i < 2; i++) {
    const a = rand() * Math.PI * 2;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r * 0.1, cy + Math.sin(a) * ry * 0.1);
    g.lineTo(cx + Math.cos(a) * r * 0.6 + (rand() - 0.5) * 4, cy + Math.sin(a) * ry * 0.6);
    g.lineTo(cx + Math.cos(a + 0.4) * r, cy + Math.sin(a + 0.4) * ry);
    g.stroke();
  }
  ellipse(g, cx - r * 0.3, cy - ry * 0.35, r * 0.35, ry * 0.18, -0.6);
  g.fillStyle = 'rgba(255,255,255,0.12)';
  g.fill();
  g.restore();
}
/** Dressed stone blocks filling a rect (for plinths, walls, altars). */
export function blocks(g: G, x: number, y: number, w: number, h: number, base: string, rand: () => number, bw = 22, bh = 14) {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  for (let row = 0, yy = y; yy < y + h; row++, yy += bh) {
    const off = row % 2 ? -bw / 2 : 0;
    for (let xx = x + off; xx < x + w; xx += bw) {
      const tone = shade(base, (rand() - 0.5) * 0.2);
      g.fillStyle = litFill(g, xx, yy, bw, bh, tone, 0.12);
      g.fillRect(xx, yy, bw, bh);
      g.strokeStyle = alpha(shade(base, -0.55), 0.8);
      g.lineWidth = 1;
      g.strokeRect(xx + 0.5, yy + 0.5, bw - 1, bh - 1);
    }
  }
  g.restore();
}
/** Cloth: a soft rect with folds. */
export function cloth(g: G, x: number, y: number, w: number, h: number, base: string, rand: () => number, folds = 3, r = 4) {
  rr(g, x, y, w, h, r);
  paint(g, litFill(g, x, y, w, h, base, 0.18), INK, LW * 0.8);
  g.save();
  rr(g, x, y, w, h, r);
  g.clip();
  for (let i = 0; i < folds; i++) {
    const fx = x + w * ((i + 0.5 + (rand() - 0.5) * 0.4) / folds);
    const gr = g.createLinearGradient(fx - 5, 0, fx + 5, 0);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(0.5, alpha(shade(base, -0.5), 0.35));
    gr.addColorStop(1, 'rgba(255,255,255,0.08)');
    g.fillStyle = gr;
    g.fillRect(fx - 5, y, 10, h);
  }
  g.restore();
}
/** Gold and silver coins scattered around a centre. */
export function coins(g: G, cx: number, cy: number, spread: number, n: number, rand: () => number, gold = '#e9b949') {
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * spread;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8;
    const col = rand() < 0.15 ? '#cfd6dc' : rand() < 0.1 ? '#c27c4b' : gold;
    ellipse(g, x, y, 3.4, 2.9, rand());
    paint(g, domeFill(g, x, y, 3.4, col, 0.45), shade(col, -0.6), 0.8);
  }
}
/** A cut gem. */
export function gem(g: G, cx: number, cy: number, r: number, color: string) {
  const pts = [0, 1, 2, 3, 4, 5].map((i) => [cx + Math.cos((i / 6) * Math.PI * 2 - Math.PI / 2) * r, cy + Math.sin((i / 6) * Math.PI * 2 - Math.PI / 2) * r]);
  poly(g, pts);
  paint(g, domeFill(g, cx, cy, r, color, 0.5), shade(color, -0.65), 0.9);
  poly(g, pts.map(([x, y]) => [cx + (x - cx) * 0.5, cy + (y - cy) * 0.5]));
  g.fillStyle = alpha(shade(color, 0.5), 0.6);
  g.fill();
  circle(g, cx - r * 0.3, cy - r * 0.35, r * 0.18);
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.fill();
}

// ---------- fire, light, liquid, plants ----------
/** A soft glow (use for lit things). Additive look without needing composite modes. */
export function glow(g: G, cx: number, cy: number, r: number, color = '#ffb347', a = 0.55) {
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  gr.addColorStop(0, alpha(color, a));
  gr.addColorStop(0.45, alpha(color, a * 0.35));
  gr.addColorStop(1, alpha(color, 0));
  g.fillStyle = gr;
  g.fillRect(cx - r, cy - r, r * 2, r * 2);
}
/** A flame seen from above: layered tongues, hot core. */
export function flame(g: G, cx: number, cy: number, r: number, rand: () => number, hot = '#fff3b0', mid = '#ffb02e', outer = '#e2481b') {
  glow(g, cx, cy, r * 2.4, mid, 0.45);
  const layers: [string, number][] = [[outer, 1], [mid, 0.72], [hot, 0.42]];
  for (const [col, k] of layers) {
    const pts: number[][] = [];
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const tongue = i % 2 ? 1.25 + rand() * 0.35 : 0.75 + rand() * 0.2;
      pts.push([cx + Math.cos(a) * r * k * tongue, cy + Math.sin(a) * r * k * tongue]);
    }
    blob(g, pts);
    g.fillStyle = col;
    g.fill();
  }
}
/** Water or another liquid in a round basin. */
export function liquid(g: G, cx: number, cy: number, rx: number, ry: number, color: string, rand: () => number) {
  ellipse(g, cx, cy, rx, ry);
  const gr = g.createRadialGradient(cx + rx * 0.2, cy + ry * 0.25, 1, cx, cy, Math.max(rx, ry));
  gr.addColorStop(0, shade(color, 0.15));
  gr.addColorStop(1, shade(color, -0.35));
  g.fillStyle = gr;
  g.fill();
  g.save();
  ellipse(g, cx, cy, rx, ry);
  g.clip();
  g.strokeStyle = 'rgba(255,255,255,0.35)';
  g.lineWidth = 1.1;
  for (let i = 0; i < 3; i++) {
    const y = cy - ry * 0.5 + i * ry * 0.45 + (rand() - 0.5) * 3, x = cx - rx * 0.5 + rand() * rx * 0.3;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + rx * 0.25, y - 2.5, x + rx * 0.5, y);
    g.stroke();
  }
  ellipse(g, cx - rx * 0.35, cy - ry * 0.4, rx * 0.22, ry * 0.12, -0.4);
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.fill();
  g.restore();
}
/** A leafy canopy or bush: clusters of shaded blobs. */
export function foliage(g: G, cx: number, cy: number, r: number, base: string, rand: () => number, clumps = 9) {
  // dark under-layer
  blob(g, lumpy(cx, cy, r, 0.3, 14, rand));
  paint(g, shade(base, -0.35), INK, LW);
  const pts: number[][] = [];
  for (let i = 0; i < clumps; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r * 0.62;
    pts.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d]);
  }
  pts.sort((a, b) => a[0] + a[1] - (b[0] + b[1])).reverse();
  for (const [x, y] of pts) {
    const cr = r * (0.28 + rand() * 0.16);
    blob(g, lumpy(x, y, cr, 0.35, 8, rand));
    paint(g, domeFill(g, x, y, cr, base, 0.3), alpha(shade(base, -0.6), 0.7), 1);
  }
  // highlight specks
  speckle(g, cx - r * 0.7, cy - r * 0.7, r * 1.1, r * 1.1, rand, Math.round(r / 3), alpha(shade(base, 0.45), 0.5), 1.2);
}
/** Grass tufts. */
export function tuft(g: G, cx: number, cy: number, r: number, color: string, rand: () => number) {
  g.strokeStyle = color;
  g.lineWidth = 1.3;
  g.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (rand() - 0.5) * 2.4;
    g.beginPath();
    g.moveTo(cx + (rand() - 0.5) * r * 0.4, cy + r * 0.2);
    g.quadraticCurveTo(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    g.stroke();
  }
}

// ---------- small items to dress tables and shelves ----------
export function book(g: G, x: number, y: number, w: number, h: number, color: string, rot = 0) {
  g.save();
  g.translate(x + w / 2, y + h / 2);
  g.rotate(rot);
  rr(g, -w / 2, -h / 2, w, h, 1);
  paint(g, litFill(g, -w / 2, -h / 2, w, h, color, 0.25), INK, 1);
  g.fillStyle = '#efe6cf';
  g.fillRect(w / 2 - 2.2, -h / 2 + 1, 1.6, h - 2);
  line(g, -w / 2 + 2, -h / 2, -w / 2 + 2, h / 2, alpha(shade(color, -0.5), 0.8), 0.8);
  g.restore();
}
export function bottle(g: G, cx: number, cy: number, r: number, color: string) {
  circle(g, cx, cy, r);
  paint(g, domeFill(g, cx, cy, r, color, 0.5), INK, 1);
  circle(g, cx, cy, r * 0.4);
  paint(g, '#6b4a2b', INK, 0.7);
}
export function mug(g: G, cx: number, cy: number, r: number, color = '#9a6a3a') {
  circle(g, cx, cy, r);
  paint(g, domeFill(g, cx, cy, r, color, 0.3), INK, 1);
  circle(g, cx, cy, r * 0.68);
  paint(g, '#e8d39b', null);
  rr(g, cx + r * 0.8, cy - r * 0.3, r * 0.6, r * 0.6, 1);
  paint(g, color, INK, 0.9);
}
export function plate(g: G, cx: number, cy: number, r: number, food = '#c0703a') {
  circle(g, cx, cy, r);
  paint(g, domeFill(g, cx, cy, r, '#d9d2c3', 0.2), INK, 1);
  circle(g, cx, cy, r * 0.55);
  paint(g, domeFill(g, cx, cy, r * 0.55, food, 0.4), null);
}
export function candle(g: G, cx: number, cy: number, r: number, rand: () => number, wax = '#efe4c8') {
  circle(g, cx, cy, r);
  paint(g, domeFill(g, cx, cy, r, wax, 0.3), INK, 0.9);
  flame(g, cx, cy, r * 0.55, rand);
}
export function scroll(g: G, x: number, y: number, w: number, h: number, rot = 0) {
  g.save();
  g.translate(x + w / 2, y + h / 2);
  g.rotate(rot);
  rr(g, -w / 2, -h / 2, w, h, 1);
  paint(g, '#eadbb5', INK, 0.9);
  for (let i = 1; i < 4; i++) line(g, -w / 2 + 3, -h / 2 + (i * h) / 4, w / 2 - 3, -h / 2 + (i * h) / 4, 'rgba(60,40,20,0.45)', 0.7);
  rr(g, -w / 2 - 1.5, -h / 2 - 1, 3, h + 2, 1.5);
  paint(g, '#c9b27f', INK, 0.8);
  rr(g, w / 2 - 1.5, -h / 2 - 1, 3, h + 2, 1.5);
  paint(g, '#c9b27f', INK, 0.8);
  g.restore();
}
/** A ring-handled lid or door pull. */
export function ringPull(g: G, cx: number, cy: number, r: number, metal = '#6c6f73') {
  circle(g, cx, cy, r);
  g.strokeStyle = INK;
  g.lineWidth = r * 0.55 + 1;
  g.stroke();
  g.strokeStyle = metal;
  g.lineWidth = r * 0.45;
  g.stroke();
}

// ---------- common palettes for variants ----------
export const WOOD = { oak: '#9a6a3a', walnut: '#6b4428', pine: '#c4955a', ebony: '#3b2a22', painted: '#7a8f6a', ash: '#b9a17d' };
export const METAL = { iron: '#6c6f73', bronze: '#a8743c', brass: '#c9a24a', gold: '#e2b84a', silver: '#c9ced3', rust: '#8b4a2b', black: '#33373c' };
export const STONE = { grey: '#8a8780', sand: '#b8a27c', dark: '#4e4b48', marble: '#dcd8d0', red: '#9a5a48', green: '#6c7a64' };
export const CLOTH = { red: '#a3312c', blue: '#2f5d8a', green: '#3e6b3a', purple: '#5d3a78', gold: '#c99a2e', black: '#2b2b30', white: '#e6e0d2', brown: '#7a5638' };

/** Build variants from a palette: [['Oak', {wood: WOOD.oak}], ...]. */
export const vars = (key: string, entries: Record<string, string>, labels?: Record<string, string>) =>
  Object.entries(entries).map(([k, v]) => ({ name: labels?.[k] ?? k[0].toUpperCase() + k.slice(1), c: { [key]: v } }));

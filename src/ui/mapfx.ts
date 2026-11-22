// Spell effects on the overhead map: the same casts the 3D view plays, drawn flat so the GM screen and the
// phones on the map view see them too. A burst shows its radius on the floor for a few seconds.
import type { LogEntry } from '../engine/game';
import { spellById } from '../rules/spells';
import { fxKind, fxColours } from '../rules/spellLook';

export interface MapFx { e: LogEntry; born: number; kind: ReturnType<typeof fxKind>; c1: string; c2: string; name: string; dmgType?: string }
const LIFE = { burst: 5200, shield: 1600, heal: 2200, darts: 2400, ray: 2000, bolt: 2000, smite: 1800, plain: 1200 } as const;

export function mapFxFrom(e: LogEntry, now: number): MapFx | undefined {
  if (!e.fx || !e.spell) return undefined;
  const sp = spellById(e.spell);
  if (!sp) return undefined;
  const kind = fxKind(sp);
  const [c1, c2] = fxColours(kind === 'heal' ? 'heal' : kind === 'shield' ? 'shield' : sp.dmgType);
  return { e, born: now, kind, c1, c2, name: sp.name, dmgType: sp.dmgType };
}
export const mapFxAlive = (f: MapFx, now: number) => now - f.born < LIFE[f.kind];

type Pos = (id: string) => [number, number] | undefined; // a token's centre in cells
const ease = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;

/** Draw every running effect. g is already in world space where one cell is `cell` units; s is the zoom. */
export function drawMapFx(g: CanvasRenderingContext2D, list: MapFx[], now: number, pos: Pos, cell: number, s: number) {
  for (const f of list) {
    const t = (now - f.born) / 1000;
    const fx = f.e.fx!;
    const from = fx.caster ? pos(fx.caster) : undefined;
    g.save();
    g.globalCompositeOperation = 'lighter';
    // the caster lights up as they cast
    if (from && t < 0.6) glow(g, from[0] * cell, from[1] * cell, cell * (0.5 + t), f.c2, 0.7 * (1 - t / 0.6));
    const hits = fx.hits.map((h) => ({ h, p: pos(h.id) })).filter((x): x is { h: typeof x.h; p: [number, number] } => !!x.p);
    const lead = 0.18;
    if (f.kind === 'burst' && fx.point) {
      const [px, py] = fx.point, R = ((fx.radius ?? 20) / 5) * cell;
      const fly = from ? Math.min(0.8, Math.max(0.35, Math.hypot(px - from[0], py - from[1]) / 12)) : 0;
      const boom = lead + fly;
      if (from && t > lead && t < boom) {
        const k = (t - lead) / fly;
        comet(g, from[0] * cell, from[1] * cell, (from[0] + (px - from[0]) * k) * cell, (from[1] + (py - from[1]) * k) * cell, f.c1, f.c2, cell * 0.25, s);
      }
      if (t >= boom) {
        const k = t - boom;
        const r = R * ease(k / 0.32);
        if (k < 0.9) glow(g, px * cell, py * cell, Math.max(1, r * 1.15), f.c1, 0.9 * (1 - k / 0.9));
        g.globalCompositeOperation = 'source-over';
        // the radius: bright, then a dashed line and a label that stay a few seconds
        const a = k < 0.6 ? 1 : k < 3.6 ? 0.75 : Math.max(0, 0.75 * (1 - (k - 3.6) / 1));
        g.strokeStyle = f.c2;
        g.globalAlpha = a;
        g.lineWidth = Math.max(2, 3 / s);
        g.setLineDash(k < 0.6 ? [] : [10 / s, 6 / s]);
        g.beginPath();
        g.arc(px * cell, py * cell, Math.max(1, r), 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = f.c2;
        g.globalAlpha = a * 0.16;
        g.fill();
        g.globalAlpha = a;
        label(g, `${f.name} · ${fx.radius} ft`, px * cell, py * cell - R - 6 / s, s, '#fff', f.c2);
      }
      for (const { h, p } of hits) if (t >= boom + 0.08) verdict(g, h, p, t - boom - 0.08, cell, s, f);
    } else if (f.kind === 'shield') {
      const p = from ?? hits[0]?.p;
      if (p) {
        const k = Math.min(1, t / 0.25);
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = Math.max(0, 1 - Math.max(0, t - 0.8) / 0.8);
        g.strokeStyle = f.c2;
        g.lineWidth = Math.max(2, 3 / s);
        hex(g, p[0] * cell, p[1] * cell, cell * (0.35 + 0.35 * k));
        g.stroke();
        label(g, fx.blocked ? 'Blocked!' : 'Shield +5 AC', p[0] * cell, p[1] * cell - cell * 0.85, s, '#fff', f.c2);
      }
    } else {
      hits.forEach(({ h, p }, i) => {
        const src = from ?? p;
        const d = Math.hypot(p[0] - src[0], p[1] - src[1]);
        const fly = f.kind === 'heal' ? Math.max(0.35, Math.min(0.75, d / 10)) : f.kind === 'darts' ? Math.max(0.45, Math.min(0.85, d / 9)) : f.kind === 'ray' ? 0.14 : Math.max(0.28, Math.min(0.7, d / 13));
        const darts = f.kind === 'darts' ? h.darts ?? 1 : 1;
        let land = lead + fly;
        for (let j = 0; j < darts; j++) {
          const st = lead + (f.kind === 'darts' ? (i * 3 + j) * 0.11 : 0);
          land = Math.max(land, st + fly);
          const k = (t - st) / fly;
          if (k <= 0) continue;
          const bend = f.kind === 'darts' ? (j % 2 ? 1 : -1) * 0.9 : 0;
          const miss = h.hit === false && f.kind !== 'darts';
          const tx = miss ? p[0] + 0.7 : p[0], ty = miss ? p[1] - 0.7 : p[1];
          if (f.kind === 'ray') {
            if (t - st < 0.75) beam(g, src[0] * cell, src[1] * cell, tx * cell, ty * cell, Math.min(1, k), f.c1, f.c2, cell, s, 1 - Math.max(0, t - st - 0.55) / 0.2);
          } else if (k < 1) {
            const [x, y] = curve(src, [tx, ty], bend, ease(k));
            comet(g, src[0] * cell, src[1] * cell, x * cell, y * cell, f.c1, f.c2, cell * (f.kind === 'darts' ? 0.16 : 0.22), s);
          }
        }
        if (t >= land) verdict(g, h, p, t - land, cell, s, f);
      });
    }
    g.restore();
  }
}

function verdict(g: CanvasRenderingContext2D, h: NonNullable<LogEntry['fx']>['hits'][number], p: [number, number], k: number, cell: number, s: number, f: MapFx) {
  if (k > 1.9) return;
  const x = p[0] * cell, y = p[1] * cell;
  if (k < 0.5) glow(g, x, y, cell * (0.45 + k), h.heal ? f.c2 : f.c1, 0.8 * (1 - k / 0.5));
  const rise = k * 14 / s;
  const a = k > 1.4 ? 1 - (k - 1.4) / 0.5 : 1;
  g.save();
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = Math.max(0, a);
  const word = h.saved !== undefined ? (h.saved ? 'Saved' : 'Failed') : h.hit === undefined || f.kind === 'darts' ? (h.hit === false ? 'Shield!' : '') : h.hit ? (h.crit ? 'Crit!' : 'Hit!') : 'Miss';
  const amt = h.amount ? (h.heal ? `+${h.amount}` : `−${h.amount}`) : '';
  const txt = [word, amt].filter(Boolean).join(' ');
  if (txt) label(g, txt, x, y - cell * 0.62 - rise, s, h.heal ? '#d9ffe2' : h.hit === false || h.saved ? '#e6e6e6' : '#ffe1d0', h.heal ? '#1f7a3e' : h.hit === false || h.saved ? '#444' : '#8a1f12');
  g.restore();
}

function glow(g: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, a: number) {
  if (a <= 0 || r <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col);
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = a;
  g.fillStyle = gr;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
}
function comet(g: CanvasRenderingContext2D, x0: number, y0: number, x: number, y: number, c1: string, c2: string, r: number, s: number) {
  const dx = x - x0, dy = y - y0, d = Math.hypot(dx, dy) || 1;
  const tail = Math.min(d, r * 6);
  const tx = x - (dx / d) * tail, ty = y - (dy / d) * tail;
  const lg = g.createLinearGradient(tx, ty, x, y);
  lg.addColorStop(0, 'rgba(0,0,0,0)');
  lg.addColorStop(1, c2);
  g.strokeStyle = lg;
  g.lineCap = 'round';
  g.lineWidth = r * 1.1;
  g.beginPath();
  g.moveTo(tx, ty);
  g.lineTo(x, y);
  g.stroke();
  glow(g, x, y, r * 2.2, c2, 0.9);
  glow(g, x, y, r, c1, 1);
  void s;
}
function beam(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, k: number, c1: string, c2: string, cell: number, s: number, a: number) {
  if (a <= 0) return;
  const x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k;
  g.globalAlpha = 0.45 * a;
  g.strokeStyle = c2;
  g.lineCap = 'round';
  g.lineWidth = cell * 0.28;
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x, y);
  g.stroke();
  g.globalAlpha = a;
  g.strokeStyle = c1;
  g.lineWidth = Math.max(1.5 / s, cell * 0.07);
  g.stroke();
  g.globalAlpha = 1;
  glow(g, x, y, cell * 0.35, c1, a);
}
function curve(a: [number, number], b: [number, number], bend: number, k: number): [number, number] {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / d) * bend, cy = my + (dx / d) * bend;
  const u = 1 - k;
  return [u * u * a[0] + 2 * u * k * cx + k * k * b[0], u * u * a[1] + 2 * u * k * cy + k * k * b[1]];
}
function hex(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath();
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    if (i) g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    else g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
}
function label(g: CanvasRenderingContext2D, text: string, x: number, y: number, s: number, fg: string, bg: string) {
  const px = 13 / s;
  g.font = `700 ${px}px system-ui, sans-serif`;
  const w = g.measureText(text).width + px;
  g.fillStyle = bg;
  g.beginPath();
  g.roundRect(x - w / 2, y - px * 1.25, w, px * 1.5, px * 0.4);
  g.fill();
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, x, y - px * 0.5);
}

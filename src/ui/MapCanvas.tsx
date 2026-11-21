import { useEffect, useMemo, useRef, useState } from 'react';
import { type GameMap, allWallEdges, parseEdge, nearestEdge, cell, moveCost } from '../engine/map';
import type { Token } from '../engine/game';

export const CELL = 48;

export type ViewToken = Token & { hpLabel?: string };

export interface MapCanvasProps {
  map: GameMap;
  role: 'gm' | 'player';
  revealed?: number[];
  showFog?: boolean; // GM: shade cells players can't see
  tokens: ViewToken[];
  currentTokenId?: string;
  selectedTokenId?: string;
  myTokenId?: string;
  /** Rect-style build tool: drag a rectangle (or corridor) and get the cells on release. */
  dragTool?: 'rect' | 'corridor' | 'brush' | null;
  /** Tap with a tool (door, wall, prop, note, reveal room...). */
  onTap?: (info: { x: number; y: number; gx: number; gy: number; edge: string; tokenId?: string }) => void;
  onDragCells?: (start: [number, number], end: [number, number], cells: [number, number][]) => void;
  onBrush?: (cells: [number, number][]) => void;
  canDragToken?: (t: ViewToken) => boolean;
  onTokenDrop?: (tokenId: string, x: number, y: number) => void;
  /** Feet left this turn for my token, to show a movement label while dragging. */
  speedLeft?: number;
  fitKey?: string; // change to re-fit the camera
  highlight?: [number, number][];
}

const THEMES = {
  stone: { floor: ['#cbbf9f', '#c4b796', '#d1c6a8'], grid: 'rgba(60,45,25,0.18)', rock: '#1c1a18', wall: '#2b2723', wallHi: '#6f6455' },
  cave: { floor: ['#a89679', '#9f8d71', '#b19f82'], grid: 'rgba(50,35,20,0.15)', rock: '#171411', wall: '#2a231c', wallHi: '#5f513f' },
  wood: { floor: ['#b98a55', '#b0814d', '#c0925d'], grid: 'rgba(70,40,15,0.22)', rock: '#1d1813', wall: '#3a2a1a', wallHi: '#7b5c3c' },
};

const PROP_EMOJI: Record<string, string> = {
  chest: '🧰', barrel: '🛢️', crate: '📦', table: '🪑', bed: '🛏️', bookshelf: '📚', altar: '🕯️', statue: '🗿', pillar: '⚪',
  rubble: '🪨', campfire: '🔥', torch: '🔥', stairs: '🪜', well: '⛲', trap: '⚠️',
};

const hash = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export function MapCanvas(p: MapCanvasProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cam = useRef({ x: 0, y: 0, s: 0.8 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [, force] = useState(0);
  const redraw = () => force((n) => n + 1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<
    | { kind: 'pan'; sx: number; sy: number; cx: number; cy: number; moved: boolean; t: number; gx: number; gy: number }
    | { kind: 'pinch'; d0: number; s0: number; mx: number; my: number; cx: number; cy: number }
    | { kind: 'token'; id: string; gx: number; gy: number; cur: [number, number]; moved: boolean }
    | { kind: 'rect'; start: [number, number]; cur: [number, number] }
    | { kind: 'brush'; cells: Map<number, [number, number]> }
    | null
  >(null);

  const walls = useMemo(() => {
    const all = allWallEdges(p.map);
    if (p.role === 'gm') return all;
    // a player only sees walls between squares they know about
    return all.filter((k) => {
      const { t, x, y } = parseEdge(k);
      const a = t === 'h' ? cell(p.map, x, y - 1) : cell(p.map, x - 1, y);
      const b = cell(p.map, x, y);
      return a !== -1 && b !== -1;
    });
  }, [p.map, p.role]);
  const revealedSet = useMemo(() => new Set(p.revealed ?? []), [p.revealed]);

  // size
  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // fit
  const fit = () => {
    const m = p.map;
    let minx = m.cols, miny = m.rows, maxx = 0, maxy = 0;
    m.cells.forEach((v, i) => {
      if (v > 0) {
        const x = i % m.cols, y = Math.floor(i / m.cols);
        minx = Math.min(minx, x); miny = Math.min(miny, y); maxx = Math.max(maxx, x + 1); maxy = Math.max(maxy, y + 1);
      }
    });
    if (maxx <= minx) { minx = 0; miny = 0; maxx = m.cols; maxy = m.rows; }
    if (p.role === 'player' && p.myTokenId) {
      const t = p.tokens.find((k) => k.id === p.myTokenId);
      if (t) {
        const s = Math.min(1.1, Math.max(0.5, size.w / (CELL * 9)));
        cam.current = { s, x: size.w / 2 - (t.x + 0.5) * CELL * s, y: size.h / 2 - (t.y + 0.5) * CELL * s };
        return redraw();
      }
    }
    const pad = 1;
    const s = Math.min(size.w / ((maxx - minx + pad * 2) * CELL), size.h / ((maxy - miny + pad * 2) * CELL), 1.4);
    cam.current = { s, x: size.w / 2 - ((minx + maxx) / 2) * CELL * s, y: size.h / 2 - ((miny + maxy) / 2) * CELL * s };
    redraw();
  };
  const fitted = useRef('');
  useEffect(() => {
    const key = `${p.fitKey ?? p.map.id}`;
    if (size.w > 10 && fitted.current !== key) {
      fitted.current = key;
      fit();
    }
  });

  // draw
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(size.w * dpr)) c.width = Math.round(size.w * dpr);
    if (c.height !== Math.round(size.h * dpr)) c.height = Math.round(size.h * dpr);
    const g = c.getContext('2d')!;
    const { x: ox, y: oy, s } = cam.current;
    const m = p.map;
    const th = THEMES[m.theme] ?? THEMES.stone;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#0d0c0b';
    g.fillRect(0, 0, size.w, size.h);
    g.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);

    const x0 = Math.max(0, Math.floor(-ox / s / CELL) - 1), y0 = Math.max(0, Math.floor(-oy / s / CELL) - 1);
    const x1 = Math.min(m.cols, Math.ceil((size.w - ox) / s / CELL) + 1), y1 = Math.min(m.rows, Math.ceil((size.h - oy) / s / CELL) + 1);

    // rock and floor
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const v = m.cells[y * m.cols + x];
        const px = x * CELL, py = y * CELL;
        if (v === -1) continue;
        if (v === 0) {
          g.fillStyle = th.rock;
          g.fillRect(px, py, CELL + 0.5, CELL + 0.5);
          if (hash(x, y) > 0.7) {
            g.fillStyle = 'rgba(255,255,255,0.03)';
            g.fillRect(px + hash(y, x) * 30, py + hash(x + 3, y) * 30, 10, 6);
          }
          continue;
        }
        const h = hash(x, y);
        g.fillStyle = th.floor[Math.floor(h * th.floor.length)];
        g.fillRect(px, py, CELL + 0.5, CELL + 0.5);
        // painted texture: soft blotches and flagstone lines
        g.fillStyle = `rgba(80,60,30,${0.05 + hash(y, x) * 0.08})`;
        g.beginPath();
        g.ellipse(px + 10 + h * 28, py + 12 + hash(x + 7, y) * 24, 8 + h * 10, 5 + hash(x, y + 9) * 8, h * 3, 0, Math.PI * 2);
        g.fill();
        if (m.theme === 'wood') {
          g.strokeStyle = 'rgba(70,40,15,0.25)';
          g.lineWidth = 1;
          for (let i = 1; i < 4; i++) {
            g.beginPath();
            g.moveTo(px, py + (i * CELL) / 4);
            g.lineTo(px + CELL, py + (i * CELL) / 4);
            g.stroke();
          }
        }
        if (v === 2) {
          g.fillStyle = 'rgba(40,110,170,0.72)';
          g.fillRect(px, py, CELL + 0.5, CELL + 0.5);
          g.strokeStyle = 'rgba(200,235,255,0.45)';
          g.lineWidth = 1.5;
          g.beginPath();
          const wy = py + 16 + h * 16;
          g.moveTo(px + 6, wy);
          g.quadraticCurveTo(px + 16, wy - 5, px + 24, wy);
          g.quadraticCurveTo(px + 32, wy + 5, px + 42, wy);
          g.stroke();
        } else if (v === 3) {
          g.fillStyle = 'rgba(70,58,44,0.8)';
          for (let i = 0; i < 6; i++) {
            g.beginPath();
            g.arc(px + 6 + hash(x * 3 + i, y) * 36, py + 6 + hash(x, y * 3 + i) * 36, 2.5 + hash(i, x + y) * 4, 0, Math.PI * 2);
            g.fill();
          }
        } else if (v === 4) {
          const grd = g.createRadialGradient(px + CELL / 2, py + CELL / 2, 2, px + CELL / 2, py + CELL / 2, CELL / 2);
          grd.addColorStop(0, '#000');
          grd.addColorStop(1, 'rgba(0,0,0,0.35)');
          g.fillStyle = grd;
          g.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
        }
      }
    // grid
    g.strokeStyle = th.grid;
    g.lineWidth = 1 / Math.max(s, 0.5);
    g.beginPath();
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        if (m.cells[y * m.cols + x] > 0) {
          g.rect(x * CELL, y * CELL, CELL, CELL);
        }
      }
    g.stroke();

    // fog shading for the GM
    if (p.role === 'gm' && p.showFog) {
      g.fillStyle = 'rgba(10,10,30,0.45)';
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++) {
          const i = y * m.cols + x;
          if (m.cells[i] > 0 && !revealedSet.has(i)) g.fillRect(x * CELL, y * CELL, CELL + 0.5, CELL + 0.5);
        }
    }

    // walls
    const drawEdge = (k: string, w: number, color: string) => {
      const { t, x, y } = parseEdge(k);
      g.strokeStyle = color;
      g.lineWidth = w;
      g.beginPath();
      if (t === 'h') {
        g.moveTo(x * CELL - w / 2, y * CELL);
        g.lineTo((x + 1) * CELL + w / 2, y * CELL);
      } else {
        g.moveTo(x * CELL, y * CELL - w / 2);
        g.lineTo(x * CELL, (y + 1) * CELL + w / 2);
      }
      g.stroke();
    };
    g.lineCap = 'butt';
    for (const k of walls) if (!m.doors[k]) drawEdge(k, 9, th.wall);
    for (const k of walls) if (!m.doors[k]) drawEdge(k, 3, th.wallHi);

    // doors
    for (const [k, st] of Object.entries(m.doors)) {
      const { t, x, y } = parseEdge(k);
      const cx = t === 'h' ? (x + 0.5) * CELL : x * CELL;
      const cy = t === 'h' ? y * CELL : (y + 0.5) * CELL;
      g.save();
      g.translate(cx, cy);
      if (t === 'v') g.rotate(Math.PI / 2);
      // door frame
      g.fillStyle = th.wall;
      g.fillRect(-CELL / 2 - 2, -5, 8, 10);
      g.fillRect(CELL / 2 - 6, -5, 8, 10);
      if (st === 'open') {
        g.strokeStyle = '#8a5a2b';
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(-CELL / 2 + 6, 0);
        g.lineTo(-CELL / 2 + 6, -CELL * 0.62);
        g.stroke();
        g.strokeStyle = 'rgba(138,90,43,0.35)';
        g.lineWidth = 1;
        g.beginPath();
        g.arc(-CELL / 2 + 6, 0, CELL * 0.62, -Math.PI / 2, 0);
        g.stroke();
      } else if (st === 'secret') {
        g.fillStyle = th.wall;
        g.fillRect(-CELL / 2, -4.5, CELL, 9);
        g.setLineDash([5, 4]);
        g.strokeStyle = '#c084fc';
        g.lineWidth = 2.5;
        g.strokeRect(-CELL / 2 + 6, -6, CELL - 12, 12);
        g.setLineDash([]);
      } else {
        g.fillStyle = '#7a4b22';
        g.fillRect(-CELL / 2 + 6, -5, CELL - 12, 10);
        g.strokeStyle = '#3d240f';
        g.lineWidth = 1.5;
        g.strokeRect(-CELL / 2 + 6, -5, CELL - 12, 10);
        if (st === 'locked') {
          g.fillStyle = '#f5c542';
          g.beginPath();
          g.arc(0, 0, 4, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.restore();
    }

    // props
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (const pr of m.props) {
      g.globalAlpha = pr.gmOnly ? 0.6 : 1;
      g.font = `${CELL * 0.62}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      g.fillText(PROP_EMOJI[pr.kind] ?? '❔', (pr.x + 0.5) * CELL, (pr.y + 0.55) * CELL);
      g.globalAlpha = 1;
    }
    // GM notes
    if (p.role === 'gm')
      for (const n of m.notes) {
        g.font = `${CELL * 0.45}px system-ui, "Apple Color Emoji", sans-serif`;
        g.fillText('📝', (n.x + 0.8) * CELL, (n.y + 0.22) * CELL);
      }

    // highlight
    if (p.highlight) {
      g.fillStyle = 'rgba(255,215,0,0.25)';
      for (const [x, y] of p.highlight) g.fillRect(x * CELL, y * CELL, CELL, CELL);
    }

    // drag previews
    const ge = gesture.current;
    if (ge?.kind === 'rect') {
      const [ax, ay] = ge.start, [bx, by] = ge.cur;
      g.fillStyle = 'rgba(255,210,90,0.28)';
      g.strokeStyle = '#ffd25a';
      g.lineWidth = 2 / s;
      if (p.dragTool === 'corridor') {
        g.fillRect(Math.min(ax, bx) * CELL, ay * CELL, (Math.abs(bx - ax) + 1) * CELL, CELL);
        g.fillRect(bx * CELL, Math.min(ay, by) * CELL, CELL, (Math.abs(by - ay) + 1) * CELL);
      } else {
        g.fillRect(Math.min(ax, bx) * CELL, Math.min(ay, by) * CELL, (Math.abs(bx - ax) + 1) * CELL, (Math.abs(by - ay) + 1) * CELL);
        g.strokeRect(Math.min(ax, bx) * CELL, Math.min(ay, by) * CELL, (Math.abs(bx - ax) + 1) * CELL, (Math.abs(by - ay) + 1) * CELL);
      }
      g.fillStyle = '#fff';
      g.font = `bold ${14 / s}px system-ui`;
      g.fillText(`${(Math.abs(bx - ax) + 1) * 5} × ${(Math.abs(by - ay) + 1) * 5} ft`, (bx + 0.5) * CELL, (by + 1.4) * CELL);
    } else if (ge?.kind === 'brush') {
      g.fillStyle = 'rgba(255,210,90,0.3)';
      for (const [x, y] of ge.cells.values()) g.fillRect(x * CELL, y * CELL, CELL, CELL);
    }

    // tokens
    const sorted = [...p.tokens].sort((a, b) => (a.kind === 'pc' ? 1 : 0) - (b.kind === 'pc' ? 1 : 0));
    for (const t of sorted) {
      let tx = t.x, ty = t.y;
      if (ge?.kind === 'token' && ge.id === t.id) [tx, ty] = ge.cur;
      const r = (t.size * CELL) / 2 - 4;
      const cx = tx * CELL + (t.size * CELL) / 2, cy = ty * CELL + (t.size * CELL) / 2;
      g.globalAlpha = t.hidden ? 0.45 : 1;
      if (t.id === p.currentTokenId) {
        g.fillStyle = 'rgba(255,215,0,0.35)';
        g.beginPath();
        g.arc(cx, cy, r + 8, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = 'rgba(0,0,0,0.45)';
      g.beginPath();
      g.arc(cx + 2, cy + 3, r, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = t.color;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = t.id === p.selectedTokenId ? 4 : 2.5;
      g.strokeStyle = t.id === p.selectedTokenId ? '#ffd25a' : t.kind === 'monster' ? '#2a0d0d' : '#fdf6e3';
      g.stroke();
      const down = t.hp === 0;
      g.fillStyle = '#fff';
      g.font = `bold ${Math.max(12, r * 0.75)}px system-ui, sans-serif`;
      g.fillText(t.kind === 'monster' && t.name.match(/\d+$/) ? t.name.match(/\d+$/)![0] : initials(t.name), cx, cy + 1);
      if (t.kind === 'monster') {
        g.font = `${Math.max(9, r * 0.38)}px system-ui, sans-serif`;
        g.fillStyle = 'rgba(255,255,255,0.85)';
        g.fillText(initials(t.name.replace(/\s*\d+$/, '')), cx, cy - r * 0.55);
      }
      if (down) {
        g.strokeStyle = 'rgba(0,0,0,0.75)';
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(cx - r * 0.7, cy - r * 0.7);
        g.lineTo(cx + r * 0.7, cy + r * 0.7);
        g.moveTo(cx + r * 0.7, cy - r * 0.7);
        g.lineTo(cx - r * 0.7, cy + r * 0.7);
        g.stroke();
      }
      // hp bar
      if (t.maxHp > 0) {
        const w = t.size * CELL - 10;
        const bx = cx - w / 2, by = ty * CELL + t.size * CELL - 6;
        g.fillStyle = 'rgba(0,0,0,0.7)';
        g.fillRect(bx, by, w, 6);
        const f = Math.max(0, Math.min(1, t.hp / t.maxHp));
        g.fillStyle = f > 0.5 ? '#4ade80' : f > 0.25 ? '#facc15' : '#ef4444';
        g.fillRect(bx + 1, by + 1, (w - 2) * f, 4);
      } else if (t.hpLabel) {
        g.font = `bold ${11}px system-ui`;
        const w = g.measureText(t.hpLabel).width + 8;
        g.fillStyle = t.hpLabel === 'Down' ? 'rgba(0,0,0,0.8)' : 'rgba(150,20,20,0.9)';
        g.fillRect(cx - w / 2, ty * CELL + t.size * CELL - 12, w, 14);
        g.fillStyle = '#fff';
        g.fillText(t.hpLabel, cx, ty * CELL + t.size * CELL - 5);
      }
      // condition pips
      t.conditions.slice(0, 4).forEach((_, i) => {
        g.fillStyle = '#a855f7';
        g.beginPath();
        g.arc(tx * CELL + 7 + i * 9, ty * CELL + 7, 4, 0, Math.PI * 2);
        g.fill();
      });
      g.globalAlpha = 1;
      // name tag under my own or selected token
      if (t.id === p.myTokenId || t.id === p.selectedTokenId) {
        g.font = `bold ${Math.max(10, 12 / s)}px system-ui`;
        const label = t.name;
        const w = g.measureText(label).width + 10;
        g.fillStyle = 'rgba(0,0,0,0.7)';
        g.fillRect(cx - w / 2, ty * CELL + t.size * CELL + 2, w, 16 / Math.min(1, s));
        g.fillStyle = '#fff';
        g.fillText(label, cx, ty * CELL + t.size * CELL + 2 + 8 / Math.min(1, s));
      }
    }
    if (ge?.kind === 'token' && ge.moved) {
      const t = p.tokens.find((k) => k.id === ge.id);
      if (t) {
        const cost = moveCost(m, t.x, t.y, ge.cur[0], ge.cur[1], 500);
        const label = Number.isFinite(cost) ? `${cost} ft` : 'No path';
        const over = p.speedLeft !== undefined && cost > p.speedLeft;
        g.font = `bold ${14 / Math.min(1, s)}px system-ui`;
        const w = g.measureText(label).width + 12;
        const lx = (ge.cur[0] + 0.5) * CELL, ly = ge.cur[1] * CELL - 12;
        g.fillStyle = !Number.isFinite(cost) || over ? 'rgba(180,30,30,0.9)' : 'rgba(0,0,0,0.8)';
        g.fillRect(lx - w / 2, ly - 11, w, 22);
        g.fillStyle = '#fff';
        g.fillText(label, lx, ly);
      }
    }
  });

  const toGrid = (clientX: number, clientY: number) => {
    const r = canvas.current!.getBoundingClientRect();
    const { x, y, s } = cam.current;
    return { gx: (clientX - r.left - x) / s / CELL, gy: (clientY - r.top - y) / s / CELL };
  };
  const tokenAt = (gx: number, gy: number) => {
    const hits = p.tokens.filter((t) => gx >= t.x && gx < t.x + t.size && gy >= t.y && gy < t.y + t.size);
    return hits.sort((a, b) => (a.kind === 'pc' ? -1 : 1) - (b.kind === 'pc' ? -1 : 1))[0];
  };
  const clampCell = (gx: number, gy: number): [number, number] => [Math.max(0, Math.min(p.map.cols - 1, Math.floor(gx))), Math.max(0, Math.min(p.map.rows - 1, Math.floor(gy)))];

  const onDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const r = canvas.current!.getBoundingClientRect();
      gesture.current = { kind: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y), s0: cam.current.s, mx: (a.x + b.x) / 2 - r.left, my: (a.y + b.y) / 2 - r.top, cx: cam.current.x, cy: cam.current.y };
      return;
    }
    if (pointers.current.size > 2) return;
    const { gx, gy } = toGrid(e.clientX, e.clientY);
    const tok = tokenAt(gx, gy);
    if (!p.dragTool && tok && p.canDragToken?.(tok)) {
      gesture.current = { kind: 'token', id: tok.id, gx, gy, cur: [tok.x, tok.y], moved: false };
    } else if (p.dragTool === 'rect' || p.dragTool === 'corridor') {
      const c = clampCell(gx, gy);
      gesture.current = { kind: 'rect', start: c, cur: c };
    } else if (p.dragTool === 'brush') {
      const c = clampCell(gx, gy);
      gesture.current = { kind: 'brush', cells: new Map([[c[1] * p.map.cols + c[0], c]]) };
    } else {
      gesture.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, cx: cam.current.x, cy: cam.current.y, moved: false, t: Date.now(), gx, gy };
    }
    redraw();
  };
  const onMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ge = gesture.current;
    if (!ge) return;
    if (ge.kind === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const r = canvas.current!.getBoundingClientRect();
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const s = Math.max(0.2, Math.min(3, (ge.s0 * d) / Math.max(1, ge.d0)));
      const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      // keep the world point under the original midpoint under the new midpoint
      const wx = (ge.mx - ge.cx) / ge.s0, wy = (ge.my - ge.cy) / ge.s0;
      cam.current = { s, x: mx - wx * s, y: my - wy * s };
    } else if (ge.kind === 'pan') {
      const dx = e.clientX - ge.sx, dy = e.clientY - ge.sy;
      if (Math.abs(dx) + Math.abs(dy) > 6) ge.moved = true;
      if (ge.moved) cam.current = { ...cam.current, x: ge.cx + dx, y: ge.cy + dy };
    } else if (ge.kind === 'token') {
      const { gx, gy } = toGrid(e.clientX, e.clientY);
      const t = p.tokens.find((k) => k.id === ge.id)!;
      const c = clampCell(gx - (t.size - 1) / 2, gy - (t.size - 1) / 2);
      if (Math.abs(gx - ge.gx) + Math.abs(gy - ge.gy) > 0.25) ge.moved = true;
      ge.cur = c;
    } else if (ge.kind === 'rect') {
      const { gx, gy } = toGrid(e.clientX, e.clientY);
      ge.cur = clampCell(gx, gy);
    } else if (ge.kind === 'brush') {
      const { gx, gy } = toGrid(e.clientX, e.clientY);
      const c = clampCell(gx, gy);
      ge.cells.set(c[1] * p.map.cols + c[0], c);
    }
    redraw();
  };
  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const ge = gesture.current;
    if (ge?.kind === 'pinch') {
      if (pointers.current.size === 0) gesture.current = null;
      else {
        // continue as a pan with the remaining finger
        const [rest] = [...pointers.current.values()];
        gesture.current = { kind: 'pan', sx: rest.x, sy: rest.y, cx: cam.current.x, cy: cam.current.y, moved: true, t: 0, gx: 0, gy: 0 };
      }
      return redraw();
    }
    gesture.current = null;
    if (!ge) return;
    if (ge.kind === 'pan' && !ge.moved && Date.now() - ge.t < 600) {
      const tok = tokenAt(ge.gx, ge.gy);
      p.onTap?.({ x: Math.floor(ge.gx), y: Math.floor(ge.gy), gx: ge.gx, gy: ge.gy, edge: nearestEdge(ge.gx, ge.gy), tokenId: tok?.id });
    } else if (ge.kind === 'token') {
      const t = p.tokens.find((k) => k.id === ge.id);
      if (ge.moved && t && (ge.cur[0] !== t.x || ge.cur[1] !== t.y)) p.onTokenDrop?.(ge.id, ge.cur[0], ge.cur[1]);
      else if (!ge.moved) p.onTap?.({ x: Math.floor(ge.gx), y: Math.floor(ge.gy), gx: ge.gx, gy: ge.gy, edge: nearestEdge(ge.gx, ge.gy), tokenId: ge.id });
    } else if (ge.kind === 'rect') {
      const [ax, ay] = ge.start, [bx, by] = ge.cur;
      const cells: [number, number][] = [];
      if (p.dragTool === 'corridor') {
        for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) cells.push([x, ay]);
        for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) cells.push([bx, y]);
      } else for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) cells.push([x, y]);
      if (ax === bx && ay === by) {
        // a plain tap with a rect tool also counts as a tap
        const gx = ax + 0.5, gy = ay + 0.5;
        p.onTap?.({ x: ax, y: ay, gx, gy, edge: nearestEdge(gx, gy) });
      }
      p.onDragCells?.(ge.start, ge.cur, cells);
    } else if (ge.kind === 'brush') {
      p.onBrush?.([...ge.cells.values()]);
    }
    redraw();
  };
  const onWheel = (e: React.WheelEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const { x, y, s } = cam.current;
    const ns = Math.max(0.2, Math.min(3, s * Math.exp(-e.deltaY * 0.0015)));
    cam.current = { s: ns, x: mx - ((mx - x) / s) * ns, y: my - ((my - y) / s) * ns };
    redraw();
  };
  const zoom = (f: number) => {
    const { x, y, s } = cam.current;
    const ns = Math.max(0.2, Math.min(3, s * f));
    const mx = size.w / 2, my = size.h / 2;
    cam.current = { s: ns, x: mx - ((mx - x) / s) * ns, y: my - ((my - y) / s) * ns };
    redraw();
  };

  return (
    <div className="map-wrap" ref={wrap}>
      <canvas
        ref={canvas}
        style={{ width: size.w, height: size.h, touchAction: 'none', display: 'block' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Battle map"
      />
      <div className="map-zoom">
        <button onClick={() => zoom(1.25)} aria-label="Zoom in">+</button>
        <button onClick={() => zoom(0.8)} aria-label="Zoom out">−</button>
        <button onClick={fit} aria-label="Fit map" title="Fit">⤢</button>
      </div>
    </div>
  );
}

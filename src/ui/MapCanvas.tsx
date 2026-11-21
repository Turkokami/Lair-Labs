import { useEffect, useMemo, useRef, useState } from 'react';
import { type GameMap, nearestEdge, moveCost } from '../engine/map';
import type { Token, AreaTemplate } from '../engine/game';
import { drawScene, CELL } from '../render/scene';
import { browserFloors, onFloorsLoaded } from '../render/floors';
import { gridFeet } from '../engine/areas';

export { CELL };
export type ViewToken = Token & { hpLabel?: string };
export type TemplateShape = Pick<AreaTemplate, 'shape' | 'size' | 'color' | 'label'>;
/** A sphere is centred where the finger lifts; other shapes run from where it went down toward where it lifts. */
export function lineToTemplate(shape: AreaTemplate['shape'], a: [number, number], b: [number, number]) {
  return shape === 'sphere' ? { x: b[0], y: b[1], tx: b[0] + 1, ty: b[1] } : { x: a[0], y: a[1], tx: b[0], ty: b[1] };
}

export interface MapCanvasProps {
  map: GameMap;
  role: 'gm' | 'player';
  revealed?: number[];
  showFog?: boolean; // GM: shade cells players can't see
  tokens: ViewToken[];
  currentTokenId?: string;
  selectedTokenId?: string;
  myTokenId?: string;
  /** Rect-style build tool: drag a rectangle (or corridor) and get the cells on release. `line` drags a ruler or a template. */
  dragTool?: 'rect' | 'corridor' | 'brush' | 'line' | null;
  /** Dynamic lighting for players: squares seen now, and light levels. */
  visible?: number[];
  lit?: string;
  templates?: AreaTemplate[];
  /** With dragTool 'line': draw this template shape instead of a ruler. */
  templateShape?: TemplateShape;
  /** Called when a line drag ends (grid units, sphere and cube origins snap to corners). */
  onLine?: (a: [number, number], b: [number, number]) => void;
  selectedTokenIds?: string[];
  selectedPropId?: string;
  roomLabels?: boolean;
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
  /** Data URL of the map's background picture, if it has one. */
  backdrop?: string;
}

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
    | { kind: 'line'; a: [number, number]; b: [number, number] }
    | null
  >(null);

  const revealedSet = useMemo(() => new Set(p.revealed ?? []), [p.revealed]);
  const visibleSet = useMemo(() => (p.visible ? new Set(p.visible) : undefined), [p.visible]);
  useEffect(() => onFloorsLoaded(() => redraw()) as () => void, []);
  const [bgImg, setBgImg] = useState<HTMLImageElement | undefined>();
  useEffect(() => {
    if (!p.backdrop) return setBgImg(undefined);
    const im = new Image();
    im.onload = () => setBgImg(im);
    im.src = p.backdrop;
  }, [p.backdrop]);

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
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#0d0c0b';
    g.fillRect(0, 0, size.w, size.h);
    g.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
    const ge = gesture.current;
    drawScene(g, {
      map: m, role: p.role, tokens: p.tokens, scale: s * dpr, floors: browserFloors,
      view: { x0: -ox / s / CELL - 1, y0: -oy / s / CELL - 1, x1: (size.w - ox) / s / CELL + 1, y1: (size.h - oy) / s / CELL + 1 },
      revealed: revealedSet, visible: visibleSet, lit: p.lit, showFog: p.showFog,
      currentTokenId: p.currentTokenId, selectedTokenId: p.selectedTokenId, selectedTokenIds: p.selectedTokenIds, myTokenId: p.myTokenId,
      tokenPos: (t) => (ge?.kind === 'token' && ge.id === t.id ? ge.cur : [t.x, t.y]),
      templates: ge?.kind === 'line' && p.templateShape ? [...(p.templates ?? []), { id: 'draft', by: '', ...p.templateShape, ...lineToTemplate(p.templateShape.shape, ge.a, ge.b) }] : p.templates,
      highlight: p.highlight, selectedPropId: p.selectedPropId, roomLabels: p.roomLabels, backdrop: bgImg,
    });

    // drag previews
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
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `bold ${14 / s}px system-ui`;
      g.fillText(`${(Math.abs(bx - ax) + 1) * 5} × ${(Math.abs(by - ay) + 1) * 5} ft`, (bx + 0.5) * CELL, (by + 1.4) * CELL);
    } else if (ge?.kind === 'brush') {
      g.fillStyle = 'rgba(255,210,90,0.3)';
      for (const [x, y] of ge.cells.values()) g.fillRect(x * CELL, y * CELL, CELL, CELL);
    } else if (ge?.kind === 'line' && !p.templateShape) {
      // ruler
      const [ax, ay] = ge.a, [bx, by] = ge.b;
      g.strokeStyle = '#ffd25a';
      g.lineWidth = 3 / Math.min(1, s);
      g.setLineDash([10, 6]);
      g.beginPath();
      g.moveTo(ax * CELL, ay * CELL);
      g.lineTo(bx * CELL, by * CELL);
      g.stroke();
      g.setLineDash([]);
      const label = `${gridFeet(ax, ay, bx, by)} ft`;
      g.font = `bold ${15 / Math.min(1, s)}px system-ui`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const w = g.measureText(label).width + 14;
      g.fillStyle = 'rgba(0,0,0,0.82)';
      g.fillRect(bx * CELL - w / 2, by * CELL - 34 / Math.min(1, s), w, 24 / Math.min(1, s));
      g.fillStyle = '#ffd25a';
      g.fillText(label, bx * CELL, by * CELL - 22 / Math.min(1, s));
    }
    if (ge?.kind === 'token' && ge.moved) {
      const t = p.tokens.find((k) => k.id === ge.id);
      if (t) {
        const cost = moveCost(m, t.x, t.y, ge.cur[0], ge.cur[1], 500);
        const label = Number.isFinite(cost) ? `${cost} ft` : 'No path';
        const over = p.speedLeft !== undefined && cost > p.speedLeft;
        g.font = `bold ${14 / Math.min(1, s)}px system-ui`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
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
  /** Spheres and cubes start on a grid corner; cones, lines and the ruler start in a square's centre. */
  const snapPoint = (gx: number, gy: number): [number, number] =>
    p.templateShape && (p.templateShape.shape === 'sphere' || p.templateShape.shape === 'cube') ? [Math.round(gx), Math.round(gy)] : [Math.floor(gx) + 0.5, Math.floor(gy) + 0.5];
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
    } else if (p.dragTool === 'line') {
      const a = snapPoint(gx, gy);
      gesture.current = { kind: 'line', a, b: a };
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
    } else if (ge.kind === 'line') {
      const { gx, gy } = toGrid(e.clientX, e.clientY);
      ge.b = p.templateShape?.shape === 'sphere' ? snapPoint(gx, gy) : [Math.floor(gx) + 0.5, Math.floor(gy) + 0.5];
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
    } else if (ge.kind === 'line') {
      p.onLine?.(ge.a, ge.b);
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

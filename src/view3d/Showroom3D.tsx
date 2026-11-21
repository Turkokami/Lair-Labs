// The object showroom at ?showroom3d: every map object in the library, laid out in one lit hall by category, in the
// same 3D view the game uses. For GMs choosing pieces and for devs adding new ones (see models-*.ts and custom-models.ts).
import { useMemo, useState } from 'react';
import { blankMap, type GameMap } from '../engine/map';
import { OBJECTS } from '../library/objects';
import { CATEGORY_LABELS, type ObjCategory } from '../library/art/types';
import View3D from './View3D';
import { hasModel } from './props3d';
import { toast } from '../ui/common';

const COLS = 26;

function hall(cat: ObjCategory | 'all'): { map: GameMap; spots: { id: string; x: number; y: number; w: number; h: number }[] } {
  const list = OBJECTS.filter((o) => (cat === 'all' ? o.cat !== 'gm' : o.cat === cat));
  // shelf packing: left to right, a free square between pieces
  const spots: { id: string; x: number; y: number; w: number; h: number }[] = [];
  let x = 2, y = 2, rowH = 1;
  for (const o of list) {
    const w = Math.max(1, Math.round(o.w)), h = Math.max(1, Math.round(o.h));
    if (x + w > COLS - 2) {
      x = 2;
      y += rowH + 1;
      rowH = 1;
    }
    spots.push({ id: o.id, x, y, w, h });
    x += w + 1;
    rowH = Math.max(rowH, h);
  }
  const rows = y + rowH + 2;
  const m = blankMap(COLS, rows, 'Object showroom');
  for (let r = 1; r < rows - 1; r++) for (let c = 1; c < COLS - 1; c++) m.cells[r * COLS + c] = 1;
  m.ambient = 'bright';
  m.props = spots.map((s, i) => ({ id: 'show' + i, kind: s.id, x: s.x, y: s.y, rot: 0 }));
  m.playerStart = [Math.floor(COLS / 2), Math.min(rows - 3, 6)];
  return { map: m, spots };
}

export default function Showroom3D() {
  const [cat, setCat] = useState<ObjCategory | 'all'>('light');
  const { map, spots } = useMemo(() => hall(cat), [cat]);
  const cats = useMemo(() => [...new Set(OBJECTS.map((o) => o.cat))].filter((c) => c !== 'gm') as ObjCategory[], []);
  const modelled = spots.filter((s) => hasModel(s.id)).length;
  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="v3d-caption" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <select value={cat} onChange={(e) => setCat(e.target.value as ObjCategory | 'all')} aria-label="Category">
          <option value="all">Everything</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]} ({OBJECTS.filter((o) => o.cat === c).length})
            </option>
          ))}
        </select>
        <span className="small">
          {spots.length} objects · {modelled} with full 3D models · {OBJECTS.length} in the library
        </span>
      </div>
      <View3D
        key={cat}
        map={map}
        role="gm"
        preview
        tokens={[]}
        cam="table"
        startDist={14}
        onTap={(info) => {
          const s = spots.find((p) => info.gx >= p.x && info.gx < p.x + p.w && info.gy >= p.y && info.gy < p.y + p.h);
          const o = s && OBJECTS.find((k) => k.id === s.id);
          if (o) toast(`${o.name} · ${o.id}${o.variants?.length ? ` · ${o.variants.length} looks` : ''}`);
        }}
      />
    </div>
  );
}

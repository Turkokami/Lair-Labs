// The GM's quick-place browsers: map objects, creatures, starter maps and room templates.
// Built for a phone: a search box, scrolling chips for themes and categories, and a grid of
// thumbnails drawn by the same code that draws the map.
import { useEffect, useMemo, useRef, useState } from 'react';
import { OBJECTS, objectById } from '../library/objects';
import { CREATURES } from '../library/creatures';
import { objectSprite, tokenSprite, portraitFor, onPortraitsLoaded } from '../library/art/sprites';
import { CATEGORY_LABELS, FAMILY_LABELS, SETS, SET_LABELS, type CreatureDef, type ObjCategory, type ObjDef, type SetId, type CreatureFamily } from '../library/art/types';
import { libraryIndex, type LibraryIndex } from '../render/floors';
import type { GameMap } from '../engine/map';

// ---------- thumbnails ----------
function Thumb({ draw, size }: { draw: (g: CanvasRenderingContext2D, px: number) => void; size: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = c.height = Math.round(size * dpr);
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, c.width, c.height);
    try {
      draw(g, c.width);
    } catch {
      /* a broken drawing shows an empty tile */
    }
  }, [draw, size]);
  return <canvas ref={ref} style={{ width: size, height: size }} className="thumb" />;
}

export function ObjectThumb({ def, v = 0, rot = 0, size = 64 }: { def: ObjDef; v?: number; rot?: number; size?: number }) {
  const draw = useMemo(
    () => (g: CanvasRenderingContext2D, px: number) => {
      const big = Math.max(def.w, def.h);
      const per = (px * 0.86) / big;
      const s = objectSprite(def, v, Math.max(24, Math.round(per)), rot, 0);
      const k = per / s.px;
      g.drawImage(s.canvas, px / 2 + s.ox * k, px / 2 + s.oy * k, s.canvas.width * k, s.canvas.height * k);
    },
    [def, v, rot],
  );
  return <Thumb draw={draw} size={size} />;
}

export function CreatureThumb({ def, v = 0, size = 64 }: { def: CreatureDef; v?: number; size?: number }) {
  const [pics, setPics] = useState(0);
  useEffect(() => (portraitFor(def, v) ? (onPortraitsLoaded(() => setPics((n) => n + 1)) as () => void) : undefined), [def, v]);
  const draw = useMemo(
    () => (g: CanvasRenderingContext2D, px: number) => {
      const s = tokenSprite(def, v, Math.round(px * 0.84), undefined);
      g.drawImage(s.canvas, (px - s.canvas.width) / 2, (px - s.canvas.height) / 2);
    },
    [def, v, pics],
  );
  return <Thumb draw={draw} size={size} />;
}

/** Only mount children once they scroll near the screen, so a grid of 300 thumbnails stays quick. */
function Lazy({ children, size }: { children: React.ReactNode; size: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || on) return;
    if (!('IntersectionObserver' in window)) return setOn(true);
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setOn(true), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  return <div ref={ref} style={{ width: size, height: size }}>{on ? children : null}</div>;
}

const words = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);
const matches = (hay: string, q: string) => words(q).every((w) => hay.includes(w));

function ChipRow<T extends string>({ items, labels, value, onPick, all = 'All' }: { items: readonly T[]; labels: Record<string, string>; value: T | ''; onPick: (v: T | '') => void; all?: string }) {
  return (
    <div className="chip-scroll">
      <button className={'chip-btn small' + (!value ? ' on' : '')} onClick={() => onPick('')}>{all}</button>
      {items.map((k) => <button key={k} className={'chip-btn small' + (value === k ? ' on' : '')} onClick={() => onPick(value === k ? '' : k)}>{labels[k]}</button>)}
    </div>
  );
}

// ---------- objects ----------
export interface ObjChoice { kind: string; rot: number; v: number; }

export function ObjectBrowser({ value, onChange, theme }: { value: ObjChoice; onChange: (c: ObjChoice) => void; theme?: SetId }) {
  const [q, setQ] = useState('');
  const [set, setSet] = useState<SetId | ''>(theme ?? '');
  const [cat, setCat] = useState<ObjCategory | ''>('');
  const [limit, setLimit] = useState(48);
  const cats = useMemo(() => [...new Set(OBJECTS.map((o) => o.cat))], []);
  const list = useMemo(
    () => OBJECTS.filter((o) => (!set || o.sets.includes(set)) && (!cat || o.cat === cat) && (!q || matches(`${o.name} ${o.id} ${o.cat} ${o.sets.join(' ')} ${(o.tags ?? []).join(' ')}`.toLowerCase(), q))),
    [q, set, cat],
  );
  useEffect(() => {
    setLimit(48);
  }, [q, set, cat]);
  const def = objectById(value.kind);
  return (
    <div className="stack lib-browser">
      {def && (
        <div className="card row gap lib-picked">
          <ObjectThumb def={def} v={value.v} rot={value.rot} size={72} />
          <div className="grow stack tight">
            <b>{def.name} <span className="muted small">{def.w * 5}×{def.h * 5} ft{def.light ? ' · gives light' : ''}{def.gmOnly ? ' · GM only' : ''}</span></b>
            {def.desc && <span className="small muted">{def.desc}</span>}
            <div className="row gap wrap">
              <button className="small" onClick={() => onChange({ ...value, rot: (value.rot + 270) % 360 })} aria-label="Turn left">⟲</button>
              <button className="small" onClick={() => onChange({ ...value, rot: (value.rot + 90) % 360 })} aria-label="Turn right">⟳</button>
              {def.variants?.map((vr, i) => (
                <button key={vr.name} className={'chip-btn small' + (value.v === i ? ' on' : '')} onClick={() => onChange({ ...value, v: i })}>{vr.name}</button>
              ))}
            </div>
          </div>
        </div>
      )}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${OBJECTS.length} things: barrel, torch, trap…`} />
      <ChipRow items={SETS} labels={SET_LABELS} value={set} onPick={setSet} all="Every theme" />
      <ChipRow items={cats} labels={CATEGORY_LABELS} value={cat} onPick={setCat} all="Every kind" />
      <div className="thumb-grid">
        {list.slice(0, limit).map((o) => (
          <button key={o.id} className={'thumb-btn' + (value.kind === o.id ? ' on' : '')} onClick={() => onChange({ kind: o.id, rot: 0, v: 0 })} title={o.name}>
            <Lazy size={56}><ObjectThumb def={o} size={56} /></Lazy>
            <span>{o.name}</span>
          </button>
        ))}
      </div>
      {list.length > limit && <button className="ghost" onClick={() => setLimit(limit + 60)}>Show more ({list.length - limit})</button>}
      {!list.length && <p className="muted small">Nothing matches. Try another word.</p>}
    </div>
  );
}

// ---------- creatures ----------
export interface CreatureChoice { id: string; v: number; }

export function CreatureBrowser({ value, onChange, statBlock }: { value: CreatureChoice | null; onChange: (c: CreatureChoice) => void; statBlock: (c: CreatureDef) => string | undefined }) {
  const [q, setQ] = useState('');
  const [fam, setFam] = useState<CreatureFamily | ''>('');
  const [limit, setLimit] = useState(48);
  const fams = useMemo(() => [...new Set(CREATURES.map((c) => c.family))].filter((f) => f !== 'hero'), []);
  const list = useMemo(
    () => CREATURES.filter((c) => (fam ? c.family === fam : c.family !== 'hero') && (!q || matches(`${c.name} ${c.id} ${c.family} ${(c.tags ?? []).join(' ')}`.toLowerCase(), q))),
    [q, fam],
  );
  useEffect(() => {
    setLimit(48);
  }, [q, fam]);
  const def = value ? CREATURES.find((c) => c.id === value.id) : undefined;
  return (
    <div className="stack lib-browser">
      {def && (
        <div className="card row gap lib-picked">
          <CreatureThumb def={def} v={value!.v} size={72} />
          <div className="grow stack tight">
            <b>{def.name} <span className="muted small">{def.size}{def.cr ? ` · CR ${def.cr}` : ''}</span></b>
            <span className="small muted">{statBlock(def) ? 'Comes with its stat block.' : 'Token only: you set its HP and AC.'}</span>
            {def.variants && (
              <div className="row gap wrap">
                {def.variants.map((vr, i) => <button key={vr.name} className={'chip-btn small' + (value!.v === i ? ' on' : '')} onClick={() => onChange({ id: def.id, v: i })}>{vr.name}</button>)}
              </div>
            )}
          </div>
        </div>
      )}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${CREATURES.length} creatures: dragon, zombie, nymph…`} />
      <ChipRow items={fams} labels={FAMILY_LABELS} value={fam} onPick={setFam} all="Every kind" />
      <div className="thumb-grid">
        {list.slice(0, limit).map((c) => (
          <button key={c.id} className={'thumb-btn' + (value?.id === c.id ? ' on' : '')} onClick={() => onChange({ id: c.id, v: 0 })} title={c.name}>
            <Lazy size={56}><CreatureThumb def={c} size={56} /></Lazy>
            <span>{c.name}</span>
          </button>
        ))}
      </div>
      {list.length > limit && <button className="ghost" onClick={() => setLimit(limit + 60)}>Show more ({list.length - limit})</button>}
      {!list.length && <p className="muted small">Nothing matches. Try another word.</p>}
    </div>
  );
}

// ---------- starter maps and room templates ----------
export function useLibraryIndex() {
  const [idx, setIdx] = useState<LibraryIndex | null>(null);
  useEffect(() => {
    let live = true;
    libraryIndex().then((i) => live && setIdx(i)).catch(() => live && setIdx({ license: '', maps: [], rooms: [], materials: [] }));
    return () => { live = false; };
  }, []);
  return idx;
}

export async function fetchLibraryMap(kind: 'maps' | 'rooms', id: string): Promise<GameMap> {
  const r = await fetch(`/library/${kind}/${encodeURIComponent(id)}.json`);
  if (!r.ok) throw new Error('Could not load that map.');
  return (await r.json()) as GameMap;
}

const AMBIENT_WORDS: Record<string, string> = { bright: 'Bright', dim: 'Dim', dark: 'Dark' };

export function StarterMaps({ onLoad }: { onLoad: (id: string) => void }) {
  const idx = useLibraryIndex();
  if (!idx) return <p className="muted small">Loading starter maps…</p>;
  return (
    <div className="stack">
      {idx.maps.map((m) => (
        <button key={m.id} className="pick" onClick={() => onLoad(m.id)}>
          <b>{m.name}</b>
          <span className="small muted">{m.cols * 5}×{m.rows * 5} ft · {AMBIENT_WORDS[m.ambient] ?? m.ambient} · {m.rooms} rooms{m.encounters ? ` · ${m.encounters} encounters` : ''}</span>
          {m.description && <span className="small">{m.description}</span>}
        </button>
      ))}
    </div>
  );
}

export function RoomTemplates({ value, onPick }: { value: string; onPick: (id: string) => void }) {
  const idx = useLibraryIndex();
  if (!idx) return <p className="muted small">Loading rooms…</p>;
  return (
    <div className="stack">
      {idx.rooms.map((r) => (
        <button key={r.id} className={'pick' + (value === r.id ? ' on' : '')} onClick={() => onPick(r.id)}>
          <b>{r.name}</b>
          <span className="small muted">{r.cols * 5}×{r.rows * 5} ft{r.description ? ` · ${r.description}` : ''}</span>
        </button>
      ))}
    </div>
  );
}

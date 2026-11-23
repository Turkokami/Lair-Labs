import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LogEntry, Visibility } from '../engine/game';
import { describe as describeRoll } from '../engine/dice';
import { uid } from '../rules/character';

// ---------- storage ----------
export const store = {
  get<T>(k: string, fallback: T): T {
    try {
      const v = localStorage.getItem('lairlabs.' + k);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem('lairlabs.' + k, JSON.stringify(v));
    } catch {
      /* storage full or blocked */
    }
  },
  del(k: string) {
    try {
      localStorage.removeItem('lairlabs.' + k);
    } catch {
      /* ignore */
    }
  },
};

export function clientId(): string {
  let id = store.get<string>('clientId', '');
  if (!id) {
    id = uid('p_');
    store.set('clientId', id);
  }
  return id;
}

// ---------- small UI pieces ----------
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className={'modal' + (wide ? ' wide' : '')} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="ghost icon" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

let toastFn: (t: string, kind?: 'info' | 'error') => void = () => {};
export const toast = (t: string, kind: 'info' | 'error' = 'info') => toastFn(t, kind);
export function Toasts() {
  const [items, setItems] = useState<{ id: number; t: string; kind: string }[]>([]);
  useEffect(() => {
    let n = 0;
    toastFn = (t, kind = 'info') => {
      const id = ++n;
      setItems((x) => [...x.slice(-2), { id, t, kind }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), kind === 'error' ? 4500 : 1800);
    };
  }, []);
  return (
    <div className="toasts" aria-live="polite">
      {items.map((i) => (
        <div key={i.id} className={'toast ' + i.kind}>{i.t}</div>
      ))}
    </div>
  );
}

export function Pips({ max, used, onChange, label }: { max: number; used: number; onChange?: (used: number) => void; label?: string }) {
  return (
    <span className="pips" aria-label={label}>
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          className={'pip' + (i < max - used ? ' on' : '')}
          disabled={!onChange}
          onClick={() => onChange?.(i < max - used ? used + 1 : Math.max(0, used - 1))}
          aria-label={`${label ?? ''} ${i + 1}`}
        />
      ))}
    </span>
  );
}

// ---------- rolls and the log ----------
export type RollFn = (formula: string, label: string, opts?: { visibility?: Visibility; attackDamage?: string; critRange?: number; targetId?: string }) => void;

export function RollLine({ e, onDamage, gm }: { e: LogEntry; onDamage?: (formula: string, label: string) => void; gm?: boolean }) {
  const time = new Date(e.ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (e.kind === 'system' && e.fx) return <div className="log-sys log-cast">✨ {e.text}</div>;
  if (e.kind === 'system') return <div className="log-sys">{e.text}{e.visibility === 'gm' && <span className="tag">GM only</span>}</div>;
  if (e.kind === 'chat')
    return (
      <div className={'log-chat' + (e.to ? ' whisper' : '')}>
        <b>{e.from}</b>
        {e.to && <span className="tag">{e.to === 'gm' ? 'to GM' : 'whisper'}</span>} {chatText(e)}
      </div>
    );
  const r = e.roll;
  return (
    <div className={'log-roll' + (e.crit ? ' crit' : '') + (e.fumble ? ' fumble' : '')}>
      <div className="log-roll-head">
        <b>{e.from}</b>
        <span className="muted">{r?.label || r?.formula || ''}</span>
        {e.visibility !== 'public' && <span className="tag">{e.visibility === 'gm' ? 'to GM' : e.visibility === 'blind' ? 'blind' : 'private'}</span>}
        <span className="muted small right">{time}</span>
      </div>
      {e.target && !e.appliedTo && e.hit !== undefined && (
        <div className={'log-verdict ' + (e.hit ? 'hit' : 'miss')}>{e.hit ? (e.crit ? 'Critical hit on ' : 'Hits ') : 'Misses '}{e.target}</div>
      )}
      {e.dc !== undefined && e.saved !== undefined && (
        <div className={'log-verdict ' + (e.saved ? 'miss' : 'hit')}>{e.saved ? `Saves (DC ${e.dc})` : `Fails the DC ${e.dc} save`}</div>
      )}
      {r ? (
        <div className="log-roll-body">
          <span className="total">{r.total}</span>
          {e.appliedTo && <span className={'badge ' + (e.heal ? 'good' : 'bad')}>{e.heal ? 'heals' : 'to'} {e.appliedTo}</span>}
          {e.text && <span className="muted small">{e.text}</span>}
          <span className="muted small">{r.formula} = {describeRoll(r)}</span>
          {e.crit && <span className="badge good">Natural 20!</span>}
          {e.fumble && <span className="badge bad">Natural 1</span>}
        </div>
      ) : (
        <div className="muted small">{e.text}</div>
      )}
      {e.damageFormula && onDamage && (
        <button className="small" onClick={() => onDamage(e.damageFormula!, e.damageLabel || 'Damage')}>
          Roll {e.damageLabel?.toLowerCase().includes('critical') ? 'critical ' : ''}damage ({e.damageFormula})
        </button>
      )}
      {gm && e.visibility === 'blind' && <span className="muted small"> Hidden from the roller.</span>}
    </div>
  );
}

/** Chat text with inline roll results shown as chips you can tap to see the dice. */
function chatText(e: LogEntry) {
  if (!e.inline?.length || !e.text) return e.text;
  return e.text.split(/(\[\[\d+\]\])/).map((part, i) => {
    const m = /^\[\[(\d+)\]\]$/.exec(part);
    const r = m ? e.inline![Number(m[1])] : undefined;
    return r ? <span key={i} className="inline-roll" title={`${r.formula} = ${r.detail}`} tabIndex={0}>{r.total}<small> {r.formula}</small></span> : part;
  });
}

export function LogView({ log, myId, onDamage, onChat, gm, players }: { log: LogEntry[]; myId: string; onDamage?: (f: string, l: string) => void; onChat?: (text: string, to?: string) => void; gm?: boolean; players?: { id: string; name: string }[] }) {
  const end = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [to, setTo] = useState('');
  // a block body: newer browsers return a promise from scrollIntoView, and React would try to call it as a cleanup
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [log.length]);
  return (
    <div className="log">
      <div className="log-list">
        {log.length === 0 && <p className="muted center">Rolls and chat show up here.</p>}
        {log.map((e) => (
          <RollLine key={e.id} e={e} gm={gm} onDamage={(e.fromId === myId || (gm && e.fromId === 'gm')) ? onDamage : undefined} />
        ))}
        <div ref={end} />
      </div>
      {onChat && (
        <form
          className="chat-row"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!text.trim()) return;
            onChat(text, to || undefined);
            setText('');
          }}
        >
          <select value={to} onChange={(e) => setTo(e.target.value)} aria-label="Send to">
            <option value="">Everyone</option>
            {!gm && <option value="gm">GM only</option>}
            {gm && players?.map((p) => <option key={p.id} value={p.id}>Whisper {p.name}</option>)}
          </select>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something… [[1d20+5]] rolls inline, /r 2d6 rolls" maxLength={500} />
          <button type="submit">Send</button>
        </form>
      )}
    </div>
  );
}

const DIE = [4, 6, 8, 10, 12, 20, 100];
export function DiceTray({ onRoll, gm, onClose }: { onRoll: RollFn; gm?: boolean; onClose?: () => void }) {
  const [pool, setPool] = useState<Record<number, number>>({});
  const [bonus, setBonus] = useState(0);
  const [adv, setAdv] = useState<'none' | 'adv' | 'dis'>('none');
  const [vis, setVis] = useState<Visibility>(gm ? 'gm' : 'public');
  const [custom, setCustom] = useState('');
  const formula = () => {
    const parts: string[] = [];
    for (const d of DIE) {
      const n = pool[d];
      if (!n) continue;
      if (d === 20 && n === 1 && adv !== 'none') parts.push(adv === 'adv' ? '2d20kh1' : '2d20kl1');
      else parts.push(`${n}d${d}`);
    }
    let f = parts.join('+');
    if (bonus) f += (bonus > 0 ? '+' : '') + bonus;
    return f;
  };
  const f = custom.trim() || formula();
  const [macros, setMacros] = useState<{ name: string; formula: string }[]>(() => store.get('macros', [] as { name: string; formula: string }[]));
  const saveMacros = (m: { name: string; formula: string }[]) => { setMacros(m); store.set('macros', m); };
  const fire = (formula: string, name: string) => { onRoll(formula, name, { visibility: vis }); onClose?.(); };
  return (
    <div className="tray">
      {macros.length > 0 && (
        <div className="row wrap gap macros">
          {macros.map((m, i) => (
            <span key={i} className="macro">
              <button className="small" onClick={() => fire(m.formula, m.name)} title={m.formula}>{m.name}</button>
              <button className="ghost icon small" aria-label={`Remove ${m.name}`} onClick={() => saveMacros(macros.filter((_, j) => j !== i))}>×</button>
            </span>
          ))}
        </div>
      )}
      <div className="tray-dice">
        {DIE.map((d) => (
          <button key={d} className={'die' + (pool[d] ? ' sel' : '')} onClick={() => setPool({ ...pool, [d]: (pool[d] ?? 0) + 1 })} onContextMenu={(e) => { e.preventDefault(); setPool({ ...pool, [d]: Math.max(0, (pool[d] ?? 0) - 1) }); }}>
            {pool[d] ? <span className="count">{pool[d]}</span> : null}d{d}
          </button>
        ))}
      </div>
      <div className="row wrap gap">
        <span className="stepper">
          <button onClick={() => setBonus(bonus - 1)} aria-label="Lower modifier">−</button>
          <span>{bonus >= 0 ? '+' : ''}{bonus}</span>
          <button onClick={() => setBonus(bonus + 1)} aria-label="Raise modifier">+</button>
        </span>
        <span className="seg">
          {(['none', 'adv', 'dis'] as const).map((a) => (
            <button key={a} className={adv === a ? 'on' : ''} onClick={() => setAdv(a)}>{a === 'none' ? 'Normal' : a === 'adv' ? 'Adv' : 'Dis'}</button>
          ))}
        </span>
        <select value={vis} onChange={(e) => setVis(e.target.value as Visibility)} aria-label="Who sees it">
          <option value="public">Everyone sees</option>
          <option value="gm">{gm ? 'Only me (GM)' : 'Only the GM'}</option>
          {!gm && <option value="self">Only me</option>}
          {!gm && <option value="blind">Blind (GM only, not me)</option>}
        </select>
      </div>
      <div className="row gap">
        <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Or type: 2d6+3, 4d6dl1, 1d20+5 # Stealth" />
      </div>
      <div className="row gap">
        <button className="ghost" onClick={() => { setPool({}); setBonus(0); setAdv('none'); setCustom(''); }}>Clear</button>
        <button
          className="ghost"
          disabled={!f || macros.length >= 12}
          title="Keep this roll as a one-tap button on this device"
          onClick={() => {
            const [expr, ...lab] = f.split('#');
            const name = (lab.join('#').trim() || window.prompt('Name this button (like "Longsword" or "Sneak Attack")', expr.trim()) || '').slice(0, 24);
            if (!name) return;
            saveMacros([...macros, { name, formula: expr.trim() }]);
          }}
        >
          Save button
        </button>
        <button
          className="primary grow"
          disabled={!f}
          onClick={() => {
            const [expr, ...lab] = f.split('#');
            onRoll(expr.trim(), lab.join('#').trim(), { visibility: vis });
            setPool({});
            setBonus(0);
            setAdv('none');
            setCustom('');
            onClose?.();
          }}
        >
          Roll {f || '…'}
        </button>
      </div>
      <p className="muted small">Tap a die to add it. Long-press (or right-click) to remove one. "Save button" keeps a roll you use a lot.</p>
    </div>
  );
}

/** Save text as a file on the phone or computer. */
export function download(name: string, text: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function useInterval(fn: () => void, ms: number) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}

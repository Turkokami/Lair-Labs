import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { HostSession } from '../net/session';
import { peerHost } from '../net/transport';
import { newGame, makeCode, prettyCode, type GameState, type Intent, type Token } from '../engine/game';
import { type GameMap, type DoorState, TEMPLATES, randomDungeon, blankMap, setCells, isFloor, edgeCells, PROP_KINDS, PROP_LABELS, pid, TILE_NAMES } from '../engine/map';
import { MONSTERS, monsterById } from '../rules/monsters';
import { CONDITIONS, conditionName, fmtMod, mod } from '../rules/core';
import { computeSheet } from '../rules/character';
import { d20Formula } from '../engine/dice';
import { MapCanvas, type MapCanvasProps } from './MapCanvas';
import { SheetPanel, ActionsPanel, BagPanel } from './Sheet';
import { DiceTray, LogView, Modal, store, toast, type RollFn } from './common';
import { peerParams, safeDiscord } from './Player';

type Tool =
  | 'select' | 'room' | 'corridor' | 'erase' | 'water' | 'rubble' | 'pit' | 'door' | 'wall' | 'prop' | 'note'
  | 'revealRoom' | 'revealBrush' | 'hideBrush' | 'place';
type PlayTab = 'combat' | 'monsters' | 'party' | 'fog' | 'log' | 'table';

export function GMApp({ onExit }: { onExit: () => void }) {
  const saved = store.get<GameState | null>('gm.game', null);
  const [host, setHost] = useState<HostSession | null>(null);
  const [status, setStatus] = useState<'idle' | 'starting' | 'error'>('idle');
  const [err, setErr] = useState('');

  const start = async (resume: boolean) => {
    setStatus('starting');
    setErr('');
    let state: GameState;
    if (resume && saved) {
      state = saved;
      for (const p of Object.values(state.players)) p.connected = false;
    } else {
      state = newGame(makeCode(), TEMPLATES[0].make());
    }
    for (let attempt = 0; attempt < 4; attempt++) {
      const h = new HostSession(state, peerHost());
      try {
        await h.start();
        setHost(h);
        setStatus('idle');
        return;
      } catch (e) {
        h.stop();
        const msg = (e as Error).message;
        if (msg === 'code-taken') {
          // the old room may take a moment to free up after a refresh
          if (resume && attempt < 2) await new Promise((r) => setTimeout(r, 2500));
          else state = { ...state, code: makeCode() };
          continue;
        }
        setErr(msg);
        setStatus('error');
        return;
      }
    }
    setErr('Could not open a room. Try again.');
    setStatus('error');
  };

  useEffect(() => () => host?.stop(), [host]);

  if (!host)
    return (
      <div className="screen center-screen">
        <div className="panel join-panel">
          <h1 className="logo">Lair Labs</h1>
          <p className="muted">Run the game from this screen. Your players join from their phones with a room code.</p>
          {saved && (
            <button className="primary block" disabled={status === 'starting'} onClick={() => start(true)}>
              Resume last session ({prettyCode(saved.code)} · {saved.map.name})
            </button>
          )}
          <button className={saved ? 'ghost block' : 'primary block'} disabled={status === 'starting'} onClick={() => start(false)}>
            {status === 'starting' ? 'Opening the table…' : 'Start a new session'}
          </button>
          {err && <p className="error">{err}</p>}
          <p className="muted small">Keep this screen open while you play. It's the table: if it closes, players wait until you open it again.</p>
          <button className="ghost block" onClick={onExit}>Back</button>
        </div>
      </div>
    );

  return <GMTable host={host} onEnd={() => { host.stop(); setHost(null); onExit(); }} />;
}

function GMTable({ host, onEnd }: { host: HostSession; onEnd: () => void }) {
  const [, setTick] = useState(0);
  const [mode, setMode] = useState<'build' | 'play'>('build');
  const [tool, setTool] = useState<Tool>('select');
  const [playTab, setPlayTab] = useState<PlayTab>('table');
  const [prop, setProp] = useState('chest');
  const [corridorW, setCorridorW] = useState(1);
  const [placeMonster, setPlaceMonster] = useState('goblin');
  const [placeCount, setPlaceCount] = useState(1);
  const [placeHidden, setPlaceHidden] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();
  const [panelOpen, setPanelOpen] = useState(true);
  const [sheetFor, setSheetFor] = useState<string | null>(null);
  const [qr, setQr] = useState(false);
  const [publicRolls, setPublicRolls] = useState(false);
  const undo = useRef<GameMap[]>([]);
  const core = host.core;
  if (new URLSearchParams(location.search).has('debug')) (window as unknown as { __ll: HostSession }).__ll = host;

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    host.onLocalChange = () => {
      setTick((n) => n + 1);
      clearTimeout(t);
      t = setTimeout(() => store.set('gm.game', core.s), 800);
    };
    store.set('gm.game', core.s);
    return () => {
      host.onLocalChange = () => {};
      clearTimeout(t);
    };
  }, [host, core]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      store.set('gm.game', core.s);
      if (Object.keys(core.s.players).length) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [core]);

  const gm = (i: Intent) => {
    const e = host.gm(i);
    if (e) toast(e, 'error');
    return !e;
  };
  const v = core.view('gm');
  const s = core.s;
  const map = s.map;
  const sel = s.tokens.find((t) => t.id === selected);

  const editMap = (next: GameMap) => {
    undo.current.push(map);
    if (undo.current.length > 40) undo.current.shift();
    gm({ t: 'gm:editMap', map: next });
  };
  const roll: RollFn = (formula, label, opts) => gm({ t: 'roll', formula, label, visibility: publicRolls ? 'public' : 'gm', ...opts });
  const joinUrl = `${location.origin}${location.pathname}?join=${s.code}${peerParams()}`;

  // ---------- map interactions ----------
  const dragTool: MapCanvasProps['dragTool'] =
    mode === 'build' ? (['room', 'erase', 'water', 'rubble', 'pit'].includes(tool) ? 'rect' : tool === 'corridor' ? 'corridor' : null) : tool === 'revealBrush' || tool === 'hideBrush' ? 'brush' : null;

  const onDragCells: MapCanvasProps['onDragCells'] = (start, end, cells) => {
    if (tool === 'corridor') {
      const wide: [number, number][] = [];
      for (const [x, y] of cells) for (let i = 0; i < corridorW; i++) for (let j = 0; j < corridorW; j++) wide.push([x + i, y + j]);
      return editMap(setCells(map, wide, 1));
    }
    const v = { room: 1, erase: 0, water: 2, rubble: 3, pit: 4 }[tool as 'room'];
    if (v === undefined) return;
    if (tool !== 'room' && tool !== 'erase') cells = cells.filter(([x, y]) => isFloor(map, x, y));
    if (start[0] === end[0] && start[1] === end[1] && tool === 'room') return; // single taps don't make 5 ft rooms by accident
    let next = setCells(map, cells, v);
    if (tool === 'erase') {
      const gone = new Set(cells.map(([x, y]) => `${x},${y}`));
      next = { ...next, props: next.props.filter((p) => !gone.has(`${p.x},${p.y}`)), notes: next.notes.filter((n) => !gone.has(`${n.x},${n.y}`)) };
    }
    editMap(next);
  };

  const onTap: MapCanvasProps['onTap'] = (info) => {
    const { x, y, edge } = info;
    if (mode === 'build') {
      if (tool === 'door') {
        const [[ax, ay], [bx, by]] = edgeCells(edge);
        if (!isFloor(map, ax, ay) && !isFloor(map, bx, by)) return toast('Doors go on the edge of a room or corridor.', 'error');
        const order: (DoorState | undefined)[] = [undefined, 'closed', 'open', 'locked', 'secret'];
        const next = order[(order.indexOf(map.doors[edge]) + 1) % order.length];
        const doors = { ...map.doors };
        if (next) doors[edge] = next;
        else delete doors[edge];
        toast(next ? `Door: ${next}` : 'Door removed');
        return editMap({ ...map, doors });
      }
      if (tool === 'wall') {
        const [[ax, ay], [bx, by]] = edgeCells(edge);
        if (!isFloor(map, ax, ay) || !isFloor(map, bx, by)) return toast('Walls already appear around rooms by themselves. Use this to split a room.', 'info');
        const walls = map.walls.includes(edge) ? map.walls.filter((w) => w !== edge) : [...map.walls, edge];
        return editMap({ ...map, walls });
      }
      if (tool === 'prop') {
        const here = map.props.find((p) => p.x === x && p.y === y);
        if (here) return editMap({ ...map, props: map.props.filter((p) => p !== here) });
        if (!isFloor(map, x, y)) return toast('Put things on the floor.', 'error');
        return editMap({ ...map, props: [...map.props, { id: pid(), kind: prop, x, y, rot: 0, gmOnly: prop === 'trap' }] });
      }
      if (tool === 'note') {
        const here = map.notes.find((n) => n.x === x && n.y === y);
        const text = prompt(here ? 'Edit the note (empty to delete)' : 'GM note for this spot (players never see it)', here?.text ?? '');
        if (text === null) return;
        if (here) return editMap({ ...map, notes: text.trim() ? map.notes.map((n) => (n === here ? { ...n, text } : n)) : map.notes.filter((n) => n !== here) });
        if (text.trim()) editMap({ ...map, notes: [...map.notes, { id: pid(), x, y, text: text.slice(0, 500) }] });
        return;
      }
      if (tool === 'select') {
        const note = map.notes.find((n) => n.x === x && n.y === y);
        if (note) toast(note.text);
      }
      return;
    }
    // play mode
    if (tool === 'revealRoom') return gm({ t: 'gm:revealRoom', x, y });
    if (tool === 'place') {
      if (!isFloor(map, x, y)) return toast('Pick a floor square.', 'error');
      gm({ t: 'gm:addMonster', monsterId: placeMonster, x, y, count: placeCount, hidden: placeHidden });
      return;
    }
    if (info.tokenId) return setSelected(info.tokenId === selected ? undefined : info.tokenId);
    const d = map.doors[edge];
    const fx = info.gx - Math.floor(info.gx), fy = info.gy - Math.floor(info.gy);
    if (d && d !== 'secret' && Math.min(fx, 1 - fx, fy, 1 - fy) < 0.35) return gm({ t: 'door', key: edge });
    const note = map.notes.find((n) => n.x === x && n.y === y);
    if (note) toast(note.text);
    setSelected(undefined);
  };

  const buildTools: [Tool, string, string][] = [
    ['select', '✋', 'Move'], ['room', '⬛', 'Room'], ['corridor', '➖', 'Corridor'], ['erase', '🧽', 'Erase'],
    ['door', '🚪', 'Door'], ['wall', '🧱', 'Wall'], ['water', '💧', 'Water'], ['rubble', '🪨', 'Rubble'], ['pit', '🕳️', 'Pit'],
    ['prop', '📦', 'Things'], ['note', '📝', 'GM note'],
  ];
  const help: Partial<Record<Tool, string>> = {
    select: 'Drag to look around. Pinch or scroll to zoom.',
    room: 'Drag a rectangle to carve a room. Walls appear by themselves.',
    corridor: 'Drag from one room to another for an L-shaped corridor.',
    erase: 'Drag over squares to turn them back into rock.',
    door: 'Tap the edge of a square. Tap again to cycle: closed, open, locked, secret, none.',
    wall: 'Tap an edge between two floor squares to add or remove a wall.',
    water: 'Drag over floor to flood it. Water costs double movement.',
    rubble: 'Drag over floor for difficult terrain (double movement).',
    pit: 'Drag over floor to dig pits.',
    prop: 'Pick a thing below, then tap a square. Tap it again to remove it.',
    note: 'Tap a square to leave yourself a note. Players never see notes.',
    revealRoom: 'Tap a room to show it to players.',
    revealBrush: 'Drag to show squares to players.',
    hideBrush: 'Drag to hide squares again.',
    place: 'Tap the map to drop the monster there.',
  };

  const players = Object.values(s.players);
  const connected = players.filter((p) => p.connected).length;

  return (
    <div className={'screen gm' + (panelOpen ? ' panel-open' : '')}>
      <header className="gm-head">
        <span className="logo small-logo">Lair Labs</span>
        <button className="code-pill" onClick={() => setQr(true)} title="Show the join code">
          <span className="muted small">Room</span> <b>{prettyCode(s.code)}</b>
        </button>
        <span className="muted small">{connected}/{players.length} players</span>
        <span className="seg">
          <button className={mode === 'build' ? 'on' : ''} onClick={() => { setMode('build'); setTool('select'); }}>Build</button>
          <button className={mode === 'play' ? 'on' : ''} onClick={() => { setMode('play'); setTool('select'); }}>Play</button>
        </span>
        <button className="ghost icon panel-toggle" onClick={() => setPanelOpen(!panelOpen)} aria-label="Toggle panel">{panelOpen ? '▾' : '▴'}</button>
      </header>
      <div className="gm-body">
        <div className="gm-map">
          <MapCanvas
            map={map}
            role="gm"
            revealed={s.revealed}
            showFog={mode === 'play'}
            tokens={v.tokens}
            currentTokenId={core.currentTokenId()}
            selectedTokenId={selected}
            dragTool={dragTool}
            onTap={onTap}
            onDragCells={onDragCells}
            onBrush={(cells) => gm({ t: 'gm:reveal', cells: cells.map(([x, y]) => y * map.cols + x), on: tool === 'revealBrush' })}
            canDragToken={() => tool === 'select'}
            onTokenDrop={(id, x, y) => gm({ t: 'move', tokenId: id, x, y })}
            fitKey={map.id}
          />
          {help[tool] && tool !== 'select' && <div className="tool-help">{help[tool]}</div>}
        </div>
        <aside className="gm-panel">
          {mode === 'build' ? (
            <div className="pad stack">
              <div className="toolgrid">
                {buildTools.map(([t, ico, label]) => (
                  <button key={t} className={'tool' + (tool === t ? ' on' : '')} onClick={() => setTool(t)}>
                    <span>{ico}</span>
                    {label}
                  </button>
                ))}
              </div>
              <div className="row gap">
                <button className="ghost" disabled={!undo.current.length} onClick={() => { const prev = undo.current.pop(); if (prev) gm({ t: 'gm:editMap', map: prev }); }}>↶ Undo</button>
                <span className="muted small">{help[tool]}</span>
              </div>
              {tool === 'corridor' && (
                <div className="seg">
                  {[1, 2].map((w) => <button key={w} className={corridorW === w ? 'on' : ''} onClick={() => setCorridorW(w)}>{w * 5} ft wide</button>)}
                </div>
              )}
              {tool === 'prop' && (
                <div className="propgrid">
                  {PROP_KINDS.map((k) => <button key={k} className={'chip-btn' + (prop === k ? ' on' : '')} onClick={() => setProp(k)}>{PROP_LABELS[k]}</button>)}
                </div>
              )}
              <MapSettings map={map} onChange={editMap} onLoad={(m) => { undo.current = []; gm({ t: 'gm:setMap', map: m }); setSelected(undefined); }} />
              <button className="primary block" onClick={() => { setMode('play'); setTool('select'); setPlayTab(players.length ? 'combat' : 'table'); }}>Done building: start playing</button>
            </div>
          ) : (
            <div className="play-panel">
              <nav className="subtabs">
                {(['table', 'combat', 'monsters', 'party', 'fog', 'log'] as PlayTab[]).map((t) => (
                  <button key={t} className={playTab === t ? 'on' : ''} onClick={() => { setPlayTab(t); if (t !== 'fog' && t !== 'monsters') setTool('select'); }}>
                    {{ table: 'Table', combat: 'Combat', monsters: 'Monsters', party: 'Party', fog: 'Fog', log: 'Log' }[t]}
                  </button>
                ))}
              </nav>
              <div className="pad stack scroll">
                {sel && <TokenCard t={sel} gm={gm} roll={roll} onClose={() => setSelected(undefined)} onSheet={() => sel.charId && setSheetFor(sel.charId)} monsterHp={s.settings.monsterHp} />}
                {playTab === 'table' && (
                  <TableTab
                    s={s}
                    gm={gm}
                    joinUrl={joinUrl}
                    onQr={() => setQr(true)}
                    onKick={(id) => confirm('Remove this player from the table?') && host.kick(id)}
                    onEnd={() => { if (confirm('End the session? Players will be disconnected. Your map and heroes stay saved on this device.')) onEnd(); }}
                  />
                )}
                {playTab === 'combat' && <CombatTab s={s} gm={gm} core={core} selected={selected} setSelected={setSelected} />}
                {playTab === 'monsters' && (
                  <div className="stack">
                    <p className="muted small">Pick a monster, then tap the map where it should appear.</p>
                    <Bestiary
                      value={placeMonster}
                      onPick={(id) => { setPlaceMonster(id); setTool('place'); }}
                      roll={roll}
                    />
                    <div className="row gap wrap">
                      <label className="inline">How many
                        <select value={placeCount} onChange={(e) => setPlaceCount(Number(e.target.value))}>{[1, 2, 3, 4, 5, 6, 8].map((n) => <option key={n}>{n}</option>)}</select>
                      </label>
                      <label className="inline"><input type="checkbox" checked={placeHidden} onChange={(e) => setPlaceHidden(e.target.checked)} /> Hidden from players</label>
                      <button className={tool === 'place' ? 'primary' : 'ghost'} onClick={() => setTool(tool === 'place' ? 'select' : 'place')}>{tool === 'place' ? `Placing ${monsterById(placeMonster)?.name}: tap the map` : 'Place on map'}</button>
                    </div>
                  </div>
                )}
                {playTab === 'party' && <PartyTab s={s} gm={gm} onSheet={setSheetFor} />}
                {playTab === 'fog' && (
                  <div className="stack">
                    <div className="toolgrid">
                      {([['select', '✋', 'Move'], ['revealRoom', '💡', 'Show room'], ['revealBrush', '🖌️', 'Show brush'], ['hideBrush', '🌑', 'Hide brush']] as [Tool, string, string][]).map(([t, ico, label]) => (
                        <button key={t} className={'tool' + (tool === t ? ' on' : '')} onClick={() => setTool(t)}><span>{ico}</span>{label}</button>
                      ))}
                    </div>
                    <label className="inline"><input type="checkbox" checked={s.settings.autoReveal} onChange={(e) => gm({ t: 'gm:settings', patch: { autoReveal: e.target.checked } })} /> Show a room when a hero walks in or opens its door</label>
                    <div className="row gap wrap">
                      <button className="ghost" onClick={() => gm({ t: 'gm:revealAll', on: true })}>Show everything</button>
                      <button className="ghost" onClick={() => confirm('Hide the whole map from players?') && gm({ t: 'gm:revealAll', on: false })}>Hide everything</button>
                    </div>
                    <label className="inline"><input type="checkbox" checked={s.curtain} onChange={(e) => gm({ t: 'gm:curtain', on: e.target.checked })} /> Curtain: hide the whole map while you set up</label>
                    <p className="muted small">Shaded squares on your screen are hidden from players.</p>
                  </div>
                )}
                {playTab === 'log' && (
                  <div className="stack">
                    <label className="inline"><input type="checkbox" checked={publicRolls} onChange={(e) => setPublicRolls(e.target.checked)} /> Players see my rolls</label>
                    <DiceTray onRoll={roll} gm />
                    <LogView log={v.log} myId="gm" gm onDamage={(f, l) => roll(f, l)} onChat={(text, to) => gm({ t: 'chat', text, to })} players={players} />
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
      {qr && <JoinModal code={s.code} url={joinUrl} onClose={() => setQr(false)} />}
      {sheetFor && s.characters[sheetFor] && (
        <Modal title={s.characters[sheetFor].build.name} onClose={() => setSheetFor(null)} wide>
          <GMSheet ch={s.characters[sheetFor]} gm={gm} roll={roll} />
        </Modal>
      )}
    </div>
  );
}

function GMSheet({ ch, gm, roll }: { ch: GameState['characters'][string]; gm: (i: Intent) => boolean; roll: RollFn }) {
  const [tab, setTab] = useState<'sheet' | 'actions' | 'bag'>('sheet');
  const send = async (i: Intent) => {
    if (!gm(i)) throw new Error('Refused');
  };
  return (
    <div className="stack">
      <div className="seg">
        {(['sheet', 'actions', 'bag'] as const).map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
      </div>
      {tab === 'sheet' && <SheetPanel ch={ch} roll={roll} send={send} canEdit />}
      {tab === 'actions' && <ActionsPanel ch={ch} roll={roll} send={send} canEdit />}
      {tab === 'bag' && <BagPanel ch={ch} send={send} canEdit />}
    </div>
  );
}

function JoinModal({ code, url, onClose }: { code: string; url: string; onClose: () => void }) {
  const [img, setImg] = useState('');
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 320, color: { dark: '#111', light: '#fff' } }).then(setImg).catch(() => setImg(''));
  }, [url]);
  return (
    <Modal title="Join the table" onClose={onClose}>
      <div className="center stack">
        <div className="big-code">{prettyCode(code)}</div>
        <p className="muted">On a phone, open this site and tap Join, or scan the code.</p>
        {img && <img src={img} alt="QR code to join" className="qr" />}
        <div className="row gap">
          <input readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Join link" />
          <button onClick={() => navigator.clipboard?.writeText(url).then(() => toast('Link copied'), () => toast('Copy failed', 'error'))}>Copy</button>
        </div>
      </div>
    </Modal>
  );
}

function TableTab({ s, gm, joinUrl, onQr, onKick, onEnd }: { s: GameState; gm: (i: Intent) => boolean; joinUrl: string; onQr: () => void; onKick: (id: string) => void; onEnd: () => void }) {
  const [discord, setDiscord] = useState(s.settings.discord);
  const [hTitle, setHTitle] = useState('');
  const [hText, setHText] = useState('');
  const players = Object.values(s.players);
  return (
    <div className="stack">
      <button className="card join-card" onClick={onQr}>
        <span className="muted small">Players join with</span>
        <span className="big-code">{prettyCode(s.code)}</span>
        <span className="small">Tap to show the QR code and link</span>
      </button>
      <h3>Players</h3>
      {players.length === 0 && <p className="muted small">No one yet. Share the code: <span className="mono small">{joinUrl}</span></p>}
      {players.map((p) => {
        const ch = p.charId ? s.characters[p.charId] : undefined;
        return (
          <div key={p.id} className="row between card">
            <span><span className={'dot ' + (p.connected ? 'ok' : 'bad')} /> <b>{p.name}</b> <span className="muted small">{ch ? ch.build.name : 'choosing a hero'}</span></span>
            <button className="ghost small" onClick={() => onKick(p.id)}>Remove</button>
          </div>
        );
      })}
      <label className="inline"><input type="checkbox" checked={s.settings.locked} onChange={(e) => gm({ t: 'gm:settings', patch: { locked: e.target.checked } })} /> Lock the table (no new players)</label>
      <h3>Voice</h3>
      <p className="muted small">Lair Labs has no voice chat. Paste your Discord invite and players get a Voice button.</p>
      <div className="row gap">
        <input value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="https://discord.gg/…" />
        <button onClick={() => { const ok = !discord || safeDiscord(discord) === new URL(discord).toString(); if (!ok) return toast('Use a discord.gg or discord.com link.', 'error'); gm({ t: 'gm:settings', patch: { discord } }); toast('Saved'); }}>Save</button>
      </div>
      <h3>Rules at this table</h3>
      <label className="inline">Monster HP players see
        <select value={s.settings.monsterHp} onChange={(e) => gm({ t: 'gm:settings', patch: { monsterHp: e.target.value as 'hidden' } })}>
          <option value="hidden">Nothing</option>
          <option value="bloodied">Bloodied or not</option>
          <option value="exact">Exact numbers</option>
        </select>
      </label>
      <label className="inline">New heroes start at level
        <select value={s.settings.startLevel ?? 1} onChange={(e) => gm({ t: 'gm:settings', patch: { startLevel: Number(e.target.value) } })}>
          {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </label>
      <label className="inline"><input type="checkbox" checked={s.settings.lockMoves} onChange={(e) => gm({ t: 'gm:settings', patch: { lockMoves: e.target.checked } })} /> In combat, players can only move on their turn</label>
      <h3>Handout</h3>
      <input value={hTitle} onChange={(e) => setHTitle(e.target.value)} placeholder="Title, like 'The innkeeper's letter'" />
      <textarea value={hText} onChange={(e) => setHText(e.target.value)} rows={3} placeholder="Text every player sees in a pop-up" />
      <div className="row gap">
        <button disabled={!hTitle.trim()} onClick={() => { gm({ t: 'gm:handout', title: hTitle, text: hText }); setHTitle(''); setHText(''); }}>Show to players</button>
        {s.handout && <button className="ghost" onClick={() => gm({ t: 'gm:clearHandout' })}>Clear</button>}
      </div>
      <h3>Session</h3>
      <div className="row gap wrap">
        <button className="ghost" onClick={() => download(`lair-labs-session-${s.code}.json`, JSON.stringify(s))}>Download a backup</button>
        <button className="ghost" onClick={() => confirm('Clear the chat and roll log?') && gm({ t: 'gm:clearLog' })}>Clear log</button>
        <button className="bad" onClick={onEnd}>End session</button>
      </div>
    </div>
  );
}

function CombatTab({ s, gm, core, selected, setSelected }: { s: GameState; gm: (i: Intent) => boolean; core: HostSession['core']; selected?: string; setSelected: (id?: string) => void }) {
  const c = s.combat;
  const cur = core.currentTokenId();
  const pcsNotRolled = s.tokens.filter((t) => t.kind === 'pc' && !c.order.some((o) => o.tokenId === t.id));
  if (!c.active)
    return (
      <div className="stack">
        <p className="muted">When a fight starts, monsters roll initiative automatically. Each player taps Roll initiative on their phone.</p>
        <button className="primary block" onClick={() => gm({ t: 'gm:startCombat' })}>Start combat</button>
        <p className="muted small">Tip: hidden monsters roll too, but players can't see them in the order.</p>
      </div>
    );
  return (
    <div className="stack">
      <div className="row between">
        <b>Round {c.round}</b>
        <div className="row gap">
          <button className="ghost" onClick={() => gm({ t: 'gm:nextTurn', dir: -1 })}>◀ Back</button>
          <button className="primary" onClick={() => gm({ t: 'gm:nextTurn' })}>Next turn ▶</button>
        </div>
      </div>
      <ol className="init-list">
        {c.order.map((o) => {
          const t = s.tokens.find((k) => k.id === o.tokenId);
          if (!t) return null;
          return (
            <li key={o.tokenId} className={(o.tokenId === cur ? 'cur ' : '') + (o.tokenId === selected ? 'sel' : '')} onClick={() => setSelected(o.tokenId)}>
              <input
                className="num small"
                inputMode="numeric"
                defaultValue={o.init}
                key={o.init}
                onBlur={(e) => { const n = parseInt(e.target.value, 10); if (!Number.isNaN(n) && n !== o.init) gm({ t: 'gm:setInit', tokenId: o.tokenId, init: n }); }}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Initiative for ${t.name}`}
              />
              <span className="dot" style={{ background: t.color }} />
              <span className="grow">{t.name}{t.hidden && <span className="tag">hidden</span>}</span>
              <span className="muted small">{t.hp}/{t.maxHp}</span>
            </li>
          );
        })}
      </ol>
      {pcsNotRolled.length > 0 && <p className="muted small">Waiting on initiative from: {pcsNotRolled.map((t) => t.name).join(', ')}</p>}
      <div className="row gap wrap">
        <button className="ghost" onClick={() => gm({ t: 'gm:rollMonsterInit' })}>Roll for new monsters</button>
        <button className="bad" onClick={() => gm({ t: 'gm:endCombat' })}>End combat</button>
      </div>
    </div>
  );
}

function TokenCard({ t, gm, roll, onClose, onSheet, monsterHp }: { t: Token; gm: (i: Intent) => boolean; roll: RollFn; onClose: () => void; onSheet: () => void; monsterHp: string }) {
  const [amt, setAmt] = useState('');
  const [crit, setCrit] = useState(false);
  const n = Math.max(0, parseInt(amt, 10) || 0);
  const mon = t.monsterId ? monsterById(t.monsterId) : undefined;
  return (
    <div className="card token-card">
      <div className="row between">
        <b style={{ color: t.color }}>{t.name}</b>
        <button className="ghost icon small" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="row gap wrap small">
        <span>HP <b>{t.hp}/{t.maxHp}</b></span>
        <span>AC <b>{t.ac}</b></span>
        <span>Speed {t.speed} ft</span>
        {t.kind === 'monster' && <span className="muted">Players see: {monsterHp === 'exact' ? `${t.hp}/${t.maxHp}` : monsterHp === 'bloodied' ? (t.hp <= t.maxHp / 2 ? 'Bloodied' : 'healthy') : 'nothing'}</span>}
      </div>
      <div className="row gap wrap">
        <input className="num" inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ''))} placeholder="0" aria-label="Amount" />
        <button className="bad" disabled={!n} onClick={() => { gm({ t: 'gm:damage', targets: [t.id], amount: n, crit }); setAmt(''); }}>Damage</button>
        <button className="good" disabled={!n} onClick={() => { gm({ t: 'gm:damage', targets: [t.id], amount: -n }); setAmt(''); }}>Heal</button>
        {t.kind === 'pc' && <label className="inline small"><input type="checkbox" checked={crit} onChange={(e) => setCrit(e.target.checked)} /> crit</label>}
      </div>
      <details>
        <summary className="small">Conditions {t.conditions.length ? `(${t.conditions.map(conditionName).join(', ')})` : ''}</summary>
        <div className="chips">
          {CONDITIONS.map((c) => (
            <button key={c.id} className={'chip-btn small' + (t.conditions.includes(c.id) ? ' on' : '')} title={c.text} onClick={() => gm({ t: 'cond', target: t.charId ?? t.id, cond: c.id, on: !t.conditions.includes(c.id) })}>{c.name}</button>
          ))}
        </div>
      </details>
      {mon && (
        <details open>
          <summary className="small">{mon.size} {mon.kind} · CR {mon.cr} · {mon.xp} XP</summary>
          <div className="statline small">
            {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((a, i) => <span key={a}>{a} {mon.abilities[i]} ({fmtMod(mod(mon.abilities[i]))})</span>)}
          </div>
          <div className="small muted">{mon.senses}</div>
          {mon.traits?.map((tr) => <p key={tr.name} className="small"><b>{tr.name}.</b> {tr.text}</p>)}
          {mon.actions.map((a) => (
            <div key={a.name} className="row between small action-line">
              <span><b>{a.name}.</b> {a.hit !== undefined ? `${fmtMod(a.hit)} to hit, ` : ''}{a.dmg ? `${a.dmg} ${a.type ?? ''}` : ''}{a.save ? ` ${a.save}` : ''}{a.text ? ` ${a.text}` : ''}</span>
              <span className="row gap">
                {a.hit !== undefined && <button className="small" onClick={() => roll(d20Formula(a.hit!, 'none'), `${t.name}: ${a.name} attack`, a.dmg ? { attackDamage: a.dmg } : undefined)}>Attack</button>}
                {a.dmg && <button className="ghost small" onClick={() => roll(a.dmg!, `${t.name}: ${a.name} damage`)}>Dmg</button>}
              </span>
            </div>
          ))}
        </details>
      )}
      <div className="row gap wrap">
        {t.charId ? <button className="ghost small" onClick={onSheet}>Open sheet</button> : null}
        <label className="inline small"><input type="checkbox" checked={t.hidden} onChange={(e) => gm({ t: 'gm:tokenPatch', tokenId: t.id, patch: { hidden: e.target.checked } })} /> Hidden</label>
        {t.kind !== 'pc' && <button className="ghost small" onClick={() => { const name = prompt('Rename', t.name); if (name?.trim()) gm({ t: 'gm:tokenPatch', tokenId: t.id, patch: { name: name.trim().slice(0, 30) } }); }}>Rename</button>}
        {t.kind !== 'pc' && <button className="bad small" onClick={() => { gm({ t: 'gm:removeToken', tokenId: t.id }); onClose(); }}>Remove</button>}
      </div>
    </div>
  );
}

function Bestiary({ value, onPick, roll }: { value: string; onPick: (id: string) => void; roll: RollFn }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => MONSTERS.filter((m) => !q || `${m.name} ${m.kind}`.toLowerCase().includes(q.toLowerCase())), [q]);
  void roll;
  return (
    <div className="stack">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search monsters" />
      <div className="bestiary">
        {list.map((m) => (
          <button key={m.id} className={'pick row between' + (value === m.id ? ' on' : '')} onClick={() => onPick(m.id)}>
            <span><b>{m.name}</b> <span className="muted small">{m.kind}</span></span>
            <span className="small">CR {m.cr} · AC {m.ac} · {m.hp} HP</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PartyTab({ s, gm, onSheet }: { s: GameState; gm: (i: Intent) => boolean; onSheet: (id: string) => void }) {
  const chars = Object.values(s.characters).filter((c) => s.tokens.some((t) => t.charId === c.build.id));
  if (!chars.length) return <p className="muted">Heroes show up here once players make them on their phones.</p>;
  return (
    <div className="stack">
      {chars.map((c) => {
        const sh = computeSheet(c.build);
        const owner = Object.values(s.players).find((p) => p.charId === c.build.id);
        return (
          <div key={c.build.id} className="card">
            <div className="row between">
              <span><b style={{ color: c.build.color }}>{c.build.name}</b> <span className="muted small">{sh.speciesName} {sh.cls.name} {c.build.level}{owner ? ` · ${owner.name}` : ''}</span></span>
              <button className="ghost small" onClick={() => onSheet(c.build.id)}>Sheet</button>
            </div>
            <div className="row gap wrap small">
              <span>HP <b>{c.state.hp}/{sh.maxHp}</b>{c.state.tempHp ? ` +${c.state.tempHp}` : ''}</span>
              <span>AC <b>{sh.ac}</b></span>
              <span>Passive Perception <b>{sh.passivePerception}</b></span>
              {c.state.concentration && <span>Concentrating: {c.state.concentration}</span>}
              {c.state.conditions.length > 0 && <span>{c.state.conditions.map(conditionName).join(', ')}</span>}
            </div>
            <div className="row gap">
              {c.build.level < 5 && (c.levelCap ?? c.build.level) <= c.build.level && <button className="small" onClick={() => gm({ t: 'gm:grantLevel', charId: c.build.id })}>Allow level {c.build.level + 1}</button>}
              {(c.levelCap ?? 0) > c.build.level && <span className="muted small">Waiting for them to level up</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MapSettings({ map, onChange, onLoad }: { map: GameMap; onChange: (m: GameMap) => void; onLoad: (m: GameMap) => void }) {
  const [lib, setLib] = useState(() => store.get<GameMap[]>('maps', []));
  const file = useRef<HTMLInputElement>(null);
  const resize = (cols: number, rows: number) => {
    cols = Math.max(10, Math.min(80, cols));
    rows = Math.max(10, Math.min(80, rows));
    const cells = new Array(cols * rows).fill(0);
    for (let y = 0; y < Math.min(rows, map.rows); y++) for (let x = 0; x < Math.min(cols, map.cols); x++) cells[y * cols + x] = map.cells[y * map.cols + x];
    onChange({ ...map, cols, rows, cells, props: map.props.filter((p) => p.x < cols && p.y < rows), notes: map.notes.filter((n) => n.x < cols && n.y < rows) });
  };
  const saveToLib = () => {
    const next = [{ ...map }, ...lib.filter((m) => m.id !== map.id)].slice(0, 20);
    setLib(next);
    store.set('maps', next);
    toast('Map saved on this device');
  };
  return (
    <div className="stack">
      <h3>This map</h3>
      <label>Name<input value={map.name} onChange={(e) => onChange({ ...map, name: e.target.value.slice(0, 50) })} /></label>
      <div className="row gap wrap">
        <label className="inline">Look
          <select value={map.theme} onChange={(e) => onChange({ ...map, theme: e.target.value as GameMap['theme'] })}>
            <option value="stone">Stone dungeon</option>
            <option value="cave">Cave</option>
            <option value="wood">Wooden floors</option>
          </select>
        </label>
        <label className="inline">Size
          <select value={`${map.cols}x${map.rows}`} onChange={(e) => { const [c, r] = e.target.value.split('x').map(Number); resize(c, r); }}>
            {[[24, 18], [30, 22], [34, 24], [40, 30], [50, 36], [60, 44]].map(([c, r]) => <option key={c} value={`${c}x${r}`}>{c * 5} × {r * 5} ft</option>)}
            {![[24, 18], [30, 22], [34, 24], [40, 30], [50, 36], [60, 44]].some(([c, r]) => c === map.cols && r === map.rows) && <option value={`${map.cols}x${map.rows}`}>{map.cols * 5} × {map.rows * 5} ft</option>}
          </select>
        </label>
      </div>
      <p className="muted small">Squares are 5 ft. {Object.keys(map.doors).length} doors · {map.props.length} things · {map.notes.length} notes · legend: {Object.values(TILE_NAMES).slice(2).join(', ')}.</p>
      <h3>Start from</h3>
      <div className="stack">
        {TEMPLATES.map((t) => (
          <button key={t.id} className="pick" onClick={() => confirm(`Replace this map with ${t.name}?`) && onLoad(t.make())}>
            <b>{t.name}</b>
            <span className="small muted">{t.blurb}</span>
          </button>
        ))}
        <div className="row gap wrap">
          {(['small', 'medium', 'large'] as const).map((sz) => (
            <button key={sz} className="ghost" onClick={() => confirm('Replace this map with a random dungeon?') && onLoad(randomDungeon(sz))}>Random {sz}</button>
          ))}
          <button className="ghost" onClick={() => confirm('Start from an empty map?') && onLoad(blankMap(30, 22, 'New map'))}>Blank</button>
        </div>
      </div>
      <h3>Saved maps</h3>
      <div className="row gap wrap">
        <button onClick={saveToLib}>Save this map</button>
        <button className="ghost" onClick={() => download(`${map.name.replace(/[^\w-]+/g, '-')}.lairmap.json`, JSON.stringify(map))}>Download</button>
        <button className="ghost" onClick={() => file.current?.click()}>Open a file</button>
        <input
          ref={file}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const m = JSON.parse(await f.text()) as GameMap;
              if (!m.cells || !m.cols || !m.rows || m.cells.length !== m.cols * m.rows) throw new Error();
              onLoad({ ...blankMap(m.cols, m.rows), ...m, id: pid() });
            } catch {
              toast("That file isn't a Lair Labs map.", 'error');
            }
            e.target.value = '';
          }}
        />
      </div>
      {lib.map((m) => (
        <div key={m.id} className="row between card">
          <span>{m.name} <span className="muted small">{m.cols * 5}×{m.rows * 5} ft</span></span>
          <span className="row gap">
            <button className="small" onClick={() => onLoad({ ...m, id: pid() })}>Load</button>
            <button className="ghost small" onClick={() => { const next = lib.filter((x) => x.id !== m.id); setLib(next); store.set('maps', next); }} aria-label={`Delete ${m.name}`}>✕</button>
          </span>
        </div>
      ))}
    </div>
  );
}

function download(name: string, text: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

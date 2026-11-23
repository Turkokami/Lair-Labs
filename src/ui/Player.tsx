import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { ClientSession, type ClientStatus } from '../net/session';
import { peerClient } from '../net/transport';
import { normalizeCode, prettyCode, type Intent, type PlayerView } from '../engine/game';
import type { Character } from '../rules/character';
import { computeSheet } from '../rules/character';
import { conditionName } from '../rules/core';
import { TurnHud3D } from './TurnHud3D';
import { nearestFoe, planSpell } from './targets';
import type { Spell } from '../rules/spells';
import { MapCanvas, lineToTemplate, type TemplateShape } from './MapCanvas';
import { CharBuilder } from './CharBuilder';
import { SheetPanel, ActionsPanel, BagPanel } from './Sheet';
import { DiceTray, LogView, Modal, clientId, store, toast, vibrate, type RollFn } from './common';
import { Avatar, ProfileModal, type ImgFn } from './Profile';
import { getImages, putImage } from './imagestore';
import { isEmptyProfile, type Profile } from '../engine/profile';

const View3D = lazy(() => import('../view3d/View3D'));

type Tab = 'table' | 'sheet' | 'actions' | 'bag' | 'log';

export function PlayerApp({ initialCode, onExit }: { initialCode?: string; onExit: () => void }) {
  const [code, setCode] = useState(initialCode ? prettyCode(normalizeCode(initialCode)) : '');
  const [name, setName] = useState(store.get('name', ''));
  const [session, setSession] = useState<ClientSession | null>(null);
  const [, setTick] = useState(0);
  const [joining, setJoining] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => () => session?.stop(), [session]);

  const join = async () => {
    const c = normalizeCode(code);
    if (c.length !== 6) return setErr('Room codes have 6 letters and numbers, like K7Q-4MX.');
    if (!name.trim()) return setErr('Type your name so the table knows who you are.');
    store.set('name', name.trim());
    setErr('');
    setJoining(true);
    const s = new ClientSession(c, name.trim(), clientId(), peerClient());
    s.onUpdate = () => setTick((n) => n + 1);
    s.onImage = (id, data) => void putImage(id, data);
    s.onNotice = (t) => {
      if (t === 'your-turn') {
        vibrate([120, 60, 120]);
        toast("It's your turn!");
      } else toast(t);
    };
    try {
      await s.start();
      setSession(s);
      store.set('lastCode', c);
      history.replaceState(null, '', `${location.pathname}?join=${c}${peerParams()}`);
    } catch (e) {
      setErr((e as Error).message || 'Could not join.');
      s.stop();
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    if (initialCode && name && normalizeCode(initialCode).length === 6 && store.get('autoJoin', '') === normalizeCode(initialCode)) join();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session || !session.view)
    return (
      <div className="screen center-screen">
        <div className="panel join-panel">
          <h1 className="logo">Lair Labs</h1>
          <p className="muted">Join your GM's table.</p>
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value.slice(0, 24))} placeholder="Sam" autoComplete="nickname" /></label>
          <label>Room code<input className="code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="K7Q-4MX" autoCapitalize="characters" autoCorrect="off" spellCheck={false} /></label>
          {err && <p className="error">{err}</p>}
          {session && !session.view && session.status !== 'kicked' && <p className="muted">Connected, waiting for the table…</p>}
          {session?.status === 'kicked' && <p className="error">{session.error}</p>}
          <button className="primary block" onClick={join} disabled={joining}>{joining ? 'Joining…' : 'Join table'}</button>
          <button className="ghost block" onClick={onExit}>Back</button>
        </div>
      </div>
    );

  return <PlayerTable s={session} onLeave={() => { session.stop(); store.del('autoJoin'); setSession(null); onExit(); }} />;
}

export function peerParams() {
  const q = new URLSearchParams(location.search);
  const keep = ['peerhost', 'peerport', 'peerpath', 'peersecure'].filter((k) => q.get(k)).map((k) => `&${k}=${encodeURIComponent(q.get(k)!)}`);
  return keep.join('');
}

function PlayerTable({ s, onLeave }: { s: ClientSession; onLeave: () => void }) {
  const v = s.view as PlayerView;
  const [tab, setTab] = useState<Tab>('table');
  const [tray, setTray] = useState(false);
  const [building, setBuilding] = useState<false | 'new' | 'levelup'>(false);
  const [seenHandout, setSeenHandout] = useState(0);
  const [menu, setMenu] = useState(false);
  const [mapTool, setMapTool] = useState<'move' | 'measure' | 'area'>('move');
  const [view3d, setView3d] = useState<boolean>(() => store.get('view3d', false));
  useEffect(() => {
    store.set('view3d', view3d);
  }, [view3d]);
  const [area, setArea] = useState<TemplateShape>({ shape: 'sphere', size: 20, color: '#4cc9f0' });
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [target, setTarget] = useState<string | undefined>();
  const [profileFor, setProfileFor] = useState<string | null>(null);
  const [castOpen, setCastOpen] = useState(false);
  const [, bump] = useState(0);
  const ch = v.myCharacter;
  // profile pictures: from this phone's own store first, then from the GM
  const loading = useRef(new Set<string>());
  const img: ImgFn = (id) => {
    if (!id) return undefined;
    const have = s.images.get(id);
    if (have) return have;
    if (!loading.current.has(id)) {
      loading.current.add(id);
      getImages([id]).then((m) => {
        const d = m.get(id);
        if (d) {
          s.images.set(id, d);
          bump((n) => n + 1);
        } else {
          s.requestImages([id]);
          setTimeout(() => !s.images.has(id) && loading.current.delete(id), 9000);
        }
      });
    }
    return undefined;
  };
  const send = (i: Intent) => s.send(i);
  const safe = (p: Promise<void>) => p.catch((e: Error) => toast(e.message, 'error'));
  const roll: RollFn = (formula, label, opts) => safe(send({ t: 'roll', formula, label, ...opts })).then(() => tab !== 'log' && toast(`Rolled ${label || formula}`));

  useEffect(() => {
    store.set('autoJoin', v.code);
  }, [v.code]);
  // keep a copy of my hero on this phone so I can bring it next time
  useEffect(() => {
    if (!ch) return;
    const heroes = store.get<Record<string, Character>>('heroes', {});
    heroes[ch.build.id] = ch;
    store.set('heroes', heroes);
  }, [ch]);

  // keep my hero's profile on this phone too, and bring it back at a new table
  const myProfile = ch ? s.profiles[ch.build.id] : undefined;
  const restoring = useRef(false);
  useEffect(() => {
    if (!ch || !myProfile) return;
    const kept = store.get<Record<string, Profile>>('heroProfiles', {});
    if (!isEmptyProfile(myProfile)) {
      const { sheet: _s, ...rest } = myProfile;
      kept[ch.build.id] = rest;
      store.set('heroProfiles', kept);
      return;
    }
    const old = kept[ch.build.id];
    const key = `restored.${v.code}.${ch.build.id}`;
    if (!old || isEmptyProfile(old) || restoring.current || store.get(key, false)) return;
    restoring.current = true;
    store.set(key, true);
    (async () => {
      const { portrait, gallery, sheet: _s, ...words } = old;
      await send({ t: 'profile:save', profile: { ...words, id: ch.build.id, gallery: [] } });
      const pics = await getImages([...(portrait ? [portrait] : []), ...gallery.map((g) => g.id)]);
      if (portrait && pics.get(portrait)) await send({ t: 'profile:image', profileId: ch.build.id, data: pics.get(portrait)!, slot: 'portrait' });
      for (const g of gallery) if (pics.get(g.id)) await send({ t: 'profile:image', profileId: ch.build.id, data: pics.get(g.id)!, slot: 'gallery', caption: g.caption });
      toast(`${ch.build.name}'s profile came along from this phone.`);
    })().catch(() => {}).finally(() => (restoring.current = false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch?.build.id, myProfile]);
  const openFromToken = (tokenId: string) => {
    const t = v.tokens.find((k) => k.id === tokenId);
    if (!t) return false;
    const pid = t.charId ?? (t.profileId && s.profiles[t.profileId] ? t.profileId : undefined);
    if (!pid) return false;
    setProfileFor(pid);
    return true;
  };

  const myTurn = !!v.myTokenId && v.combat.current === v.myTokenId;
  const prevTurn = useRef(false);
  useEffect(() => {
    if (myTurn && !prevTurn.current) vibrate(80);
    prevTurn.current = myTurn;
  }, [myTurn]);

  const myToken = v.tokens.find((t) => t.id === v.myTokenId);
  const castSpell = (sp: Spell, slot?: number) => {
    const plan = planSpell(sp, v.tokens, myToken, target);
    if (plan.why && !sp.heal && sp.id !== 'shield' && (sp.attack || sp.burst || sp.save || sp.id === 'magicMissile')) return toast(plan.why);
    if (plan.aim && plan.aim.id !== myToken?.id && !sp.heal) setTarget(plan.aim.id);
    safe(send({ t: 'cast', spellId: sp.id, slot, targets: plan.targets, point: plan.point }));
  };
  const combat = { active: v.combat.active, myTurn, inOrder: v.combat.order.some((o) => o.isYou), movedLeft: myToken && myTurn ? myToken.speed - myToken.movedFeet : undefined, aim: (reachFt: number) => nearestFoe(v.tokens, myToken, reachFt), plan: (sp: Spell) => planSpell(sp, v.tokens, myToken, target) };

  if (building || !ch)
    return (
      <div className="screen scroll">
        {!building && !ch ? (
          <HeroPicker v={v} send={send} onNew={() => setBuilding('new')} onLeave={onLeave} />
        ) : (
          <CharBuilder
            initial={building === 'levelup' ? ch?.build : undefined}
            levelUp={building === 'levelup'}
            maxLevel={building === 'levelup' ? ch?.levelCap ?? ch?.build.level ?? 1 : v.settings.startLevel ?? 1}
            onCancel={() => setBuilding(false)}
            onSave={(c) =>
              safe(
                (building === 'levelup' ? send({ t: 'levelUp', character: c }) : send({ t: 'saveChar', character: c })).then(() => {
                  setBuilding(false);
                  setTab('sheet');
                }),
              )
            }
          />
        )}
      </div>
    );

  const sh = computeSheet(ch.build);
  const canLevel = (ch.levelCap ?? 0) > ch.build.level;

  return (
    <div className="screen phone">
      <header className="phone-head">
        <span className={'dot ' + statusClass(s.status)} title={s.status} />
        <Avatar src={img(myProfile?.portrait)} name={ch.build.name} color={ch.build.color} size={34} onClick={() => setProfileFor(ch.build.id)} />
        <button className="plain head-name" onClick={() => setTab('sheet')}>
          <b style={{ color: ch.build.color }}>{ch.build.name}</b>
          <span className="muted small"> {ch.state.hp}/{sh.maxHp} HP · AC {sh.ac}</span>
        </button>
        {v.settings.discord && <a className="btn ghost small" href={safeDiscord(v.settings.discord)} target="_blank" rel="noreferrer">Voice</a>}
        <button className="ghost icon" onClick={() => setMenu(true)} aria-label="Menu">☰</button>
      </header>
      {s.status !== 'connected' && <div className="banner warn">{s.status === 'kicked' ? s.error : 'Reconnecting to the GM…'}</div>}
      {myTurn && <div className="banner turn">Your turn! {combat.movedLeft !== undefined && `${combat.movedLeft} ft of movement left.`}</div>}
      {canLevel && <button className="banner level" onClick={() => setBuilding('levelup')}>Level up! Your GM says you can reach level {ch.levelCap}. Tap to choose.</button>}
      <main className="phone-main">
        {tab === 'table' && (
          <div className="table-tab">
            {v.combat.active && (
              <div className="init-strip">
                <span className="muted small">Round {v.combat.round}</span>
                {v.combat.order.map((o) => (
                  <span key={o.tokenId} className={'init-pill' + (o.tokenId === v.combat.current ? ' cur' : '') + (o.isYou ? ' you' : '')}>{o.name}</span>
                ))}
                {v.combat.current === 'hidden' && <span className="init-pill cur">Someone unseen</span>}
              </div>
            )}
            {v.curtain ? (
              <div className="curtain">The GM is setting the scene…</div>
            ) : view3d ? (
              <Suspense fallback={<div className="curtain">Building the dungeon in 3D…</div>}>
                <View3D
                  map={v.map}
                  role="player"
                  tokens={v.tokens}
                  myTokenId={v.myTokenId}
                  currentTokenId={v.combat.current}
                  visible={v.visible}
                  lit={v.lit}
                  revealed={v.revealed}
                  speedLeft={combat.movedLeft}
                  combatActive={v.combat.active}
                  log={v.log}
                  canMove={(t) => t.id === v.myTokenId && (!v.combat.active || myTurn)}
                  onMove={(id, x, y) => safe(send({ t: 'move', tokenId: id, x, y }))}
                  onExit={() => setView3d(false)}
                  hud={<TurnHud3D v={v} ch={ch} target={target} setTarget={setTarget} roll={roll} endTurn={() => safe(send({ t: 'endTurn' }))} rollInit={() => safe(send({ t: 'initiative' }))} cast={castSpell} />}
                  targetId={target && v.tokens.some((t) => t.id === target && !t.hidden) ? target : undefined}
                  onTap={(info) => {
                    if (info.edge && v.map.doors[info.edge]) safe(send({ t: 'door', key: info.edge }));
                    else if (info.tokenId) {
                      const t = v.tokens.find((k) => k.id === info.tokenId);
                      if (!t) return;
                      // tap someone else to aim at them; tap them again to stop
                      if (t.id !== v.myTokenId) setTarget((cur) => (cur === t.id ? undefined : t.id));
                      if (t.conditions.length) toast(`${t.name} · ${t.conditions.map(conditionName).join(', ')}`);
                    }
                  }}
                />
              </Suspense>
            ) : (
              <MapCanvas
                map={v.map}
                log={v.log}
                role="player"
                tokens={v.tokens}
                currentTokenId={v.combat.current}
                myTokenId={v.myTokenId}
                fitKey={v.map.id + (v.myTokenId ?? '')}
                canDragToken={(t) => t.id === v.myTokenId}
                speedLeft={combat.movedLeft}
                onTokenDrop={(id, x, y) => safe(send({ t: 'move', tokenId: id, x, y }))}
                visible={v.visible}
                lit={v.lit}
                templates={v.templates}
                dragTool={mapTool === 'move' ? null : 'line'}
                templateShape={mapTool === 'area' ? area : undefined}
                onLine={(a, b) => mapTool === 'area' && safe(send({ t: 'template', template: { ...area, ...lineToTemplate(area.shape, a, b) } }))}
                onTap={(info) => {
                  if (mapTool === 'area') {
                    const mine = [...(v.templates ?? [])].reverse().find((t) => t.by === v.you && Math.hypot(info.gx - t.x, info.gy - t.y) < 0.8);
                    if (mine) safe(send({ t: 'removeTemplate', id: mine.id }));
                    return;
                  }
                  if (v.map.doors[info.edge] && edgeNear(info.gx, info.gy, info.edge)) safe(send({ t: 'door', key: info.edge }));
                  else if (info.tokenId) {
                    if (openFromToken(info.tokenId)) return;
                    const t = v.tokens.find((k) => k.id === info.tokenId);
                    if (t) toast(`${t.name}${t.hpLabel ? ` · ${t.hpLabel}` : ''}${t.conditions.length ? ` · ${t.conditions.map(conditionName).join(', ')}` : ''}`);
                  }
                }}
              />
            )}
            <div className="party-strip">
              {v.party.map((p) => (
                <button key={p.charId} className={'party-mini plain' + (p.dying ? ' dying' : '')} onClick={() => setProfileFor(p.charId)} aria-label={`${p.name}'s profile`}>
                  {s.profiles[p.charId]?.portrait ? <Avatar src={img(s.profiles[p.charId].portrait)} name={p.name} color={p.color} size={20} /> : <span className="dot" style={{ background: p.color }} />}
                  <span className="small">{p.name.split(' ')[0]}</span>
                  <span className="small muted">{p.hp}/{p.maxHp}</span>
                </button>
              ))}
            </div>
            {!v.curtain && (
              <div className="map-tools phone-tools">
                <button className={view3d ? 'on' : ''} onClick={() => setView3d(!view3d)} aria-label="3D view">3D</button>
                <button className={mapTool === 'measure' ? 'on' : ''} onClick={() => setMapTool(mapTool === 'measure' ? 'move' : 'measure')} aria-label="Ruler">📏</button>
                <button className={mapTool === 'area' ? 'on' : ''} onClick={() => setMapTool(mapTool === 'area' ? 'move' : 'area')} aria-label="Spell area">🎯</button>
                {myToken && <button className={myToken.light ? 'on' : ''} onClick={() => safe(send({ t: 'torch', tokenId: myToken.id, on: !myToken.light }))} aria-label="Torch">🔥</button>}
              </div>
            )}
            {mapTool === 'area' && (
              <div className="area-bar card">
                <div className="chip-scroll">
                  {(['sphere', 'cone', 'line', 'cube'] as const).map((k) => <button key={k} className={'chip-btn small' + (area.shape === k ? ' on' : '')} onClick={() => setArea({ ...area, shape: k })}>{k[0].toUpperCase() + k.slice(1)}</button>)}
                  <select value={area.size} onChange={(e) => setArea({ ...area, size: Number(e.target.value) })} aria-label="Size in feet">
                    {[5, 10, 15, 20, 30, 40, 60, 90, 120].map((f) => <option key={f} value={f}>{f} ft</option>)}
                  </select>
                </div>
                <span className="small muted">Drag from you toward the target. Tap the start of your area to remove it.</span>
              </div>
            )}
            {!v.combat.active && mapTool === 'move' && !view3d && <p className="hint">Drag your token to move. Tap a door to open it.</p>}
            {mapTool === 'measure' && <p className="hint">Drag to measure. Every square is 5 ft.</p>}
          </div>
        )}
        {tab === 'sheet' && (
          <div className="pad scroll">
            <button className="profile-link card row gap" onClick={() => setProfileFor(ch.build.id)}>
              <Avatar src={img(myProfile?.portrait)} name={ch.build.name} color={ch.build.color} size={44} />
              <span className="grow left"><b>{myProfile?.title || 'My profile'}</b><br /><span className="muted small">{myProfile && !isEmptyProfile(myProfile) ? 'Picture, story, gallery and more' : 'Add a picture, background and history'}</span></span>
              <span>›</span>
            </button>
            <SheetPanel ch={ch} roll={roll} send={send} canEdit />
          </div>
        )}
        {tab === 'actions' && <div className="pad scroll"><ActionsPanel ch={ch} roll={roll} send={send} canEdit combat={combat} /></div>}
        {tab === 'bag' && <div className="pad scroll"><BagPanel ch={ch} send={send} canEdit /></div>}
        {tab === 'log' && <LogView log={v.log} myId={v.you} onDamage={(f, l) => roll(f, l)} onChat={(text, to) => safe(send({ t: 'chat', text, to }))} />}
      </main>
      <button className="fab" onClick={() => setTray(true)} aria-label="Roll dice">🎲</button>
      <nav className="tabs">
        {(['table', 'sheet', 'actions', 'bag', 'log'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            <span className="tab-ico">{{ table: '🗺️', sheet: '📜', actions: '⚔️', bag: '🎒', log: '💬' }[t]}</span>
            {{ table: 'Table', sheet: 'Sheet', actions: 'Actions', bag: 'Bag', log: 'Log' }[t]}
          </button>
        ))}
      </nav>
      {tray && (
        <Modal title="Roll dice" onClose={() => setTray(false)}>
          <DiceTray onRoll={roll} onClose={() => setTray(false)} />
        </Modal>
      )}
      {v.handout && v.handout.ts > seenHandout && (
        <Modal title={v.handout.title} onClose={() => setSeenHandout(v.handout!.ts)}>
          <p className="pre">{v.handout.text}</p>
        </Modal>
      )}
      {safetyOpen && (
        <Modal title="Table safety" onClose={() => setSafetyOpen(false)}>
          <div className="stack safety-card">
            <b>Lines: never in our game</b>
            {v.safety.lines.length ? <ul>{v.safety.lines.map((l) => <li key={l}>{l}</li>)}</ul> : <p className="muted small">None set yet. Tell your GM if something should be off the table.</p>}
            <b>Veils: happens off screen</b>
            {v.safety.veils.length ? <ul>{v.safety.veils.map((l) => <li key={l}>{l}</li>)}</ul> : <p className="muted small">None set yet.</p>}
            {v.safety.xcard && <p className="small">Anything feel wrong? Tap the X-card in the menu. The GM sees it without your name and changes the scene.</p>}
          </div>
        </Modal>
      )}
      {castOpen && (
        <Modal title="Characters at this table" onClose={() => setCastOpen(false)}>
          <div className="stack">
            {Object.values(s.profiles).sort((a, b) => (a.kind === 'pc' ? 0 : 1) - (b.kind === 'pc' ? 0 : 1) || a.name.localeCompare(b.name)).map((p) => {
              const pm = v.party.find((x) => x.charId === p.id);
              return (
                <button key={p.id} className="pick row gap" onClick={() => { setCastOpen(false); setProfileFor(p.id); }}>
                  <Avatar src={img(p.portrait)} name={p.name} color={pm?.color} size={40} />
                  <span className="grow left"><b style={{ color: pm?.color }}>{p.name}</b>{p.title && <span className="muted small"> {p.title}</span>}<br /><span className="muted small">{p.sheet?.line ?? (p.kind === 'monster' ? 'Creature' : 'NPC')}{pm?.playerName ? ` · ${pm.playerName}` : ''}</span></span>
                </button>
              );
            })}
          </div>
        </Modal>
      )}
      {profileFor && (() => {
        const own = profileFor === ch.build.id;
        const pm = v.party.find((p) => p.charId === profileFor);
        const tok = v.tokens.find((t) => t.charId === profileFor || t.profileId === profileFor);
        return (
          <ProfileModal
            id={profileFor}
            profile={s.profiles[profileFor]}
            ch={own ? ch : undefined}
            name={pm?.name ?? tok?.name}
            color={pm?.color ?? tok?.color}
            kind={pm || tok?.charId ? 'pc' : undefined}
            canEdit={own}
            isGM={false}
            isOwner={own}
            img={img}
            send={send}
            onClose={() => setProfileFor(null)}
          />
        );
      })()}
      {menu && (
        <Modal title="Table" onClose={() => setMenu(false)}>
          <div className="stack">
            <div>Room <b>{prettyCode(v.code)}</b> · {v.players.filter((p) => p.connected).length} connected</div>
            <ul className="small">{v.players.map((p) => <li key={p.id}>{p.name}{p.connected ? '' : ' (away)'}</li>)}</ul>
            <button className="ghost" onClick={() => { setMenu(false); setProfileFor(ch.build.id); }}>My profile</button>
            <button className="ghost" onClick={() => { setMenu(false); setCastOpen(true); }}>Characters at this table</button>
            <button className="ghost" onClick={() => { setMenu(false); setBuilding('new'); }}>Switch to a new hero</button>
            {v.handout && <button className="ghost" onClick={() => { setSeenHandout(0); setMenu(false); }}>Show the last handout</button>}
            <button className="ghost" onClick={() => { setMenu(false); setSafetyOpen(true); }}>Table safety: lines and veils</button>
            {v.safety.xcard && (
              <button className="xcard-btn" onClick={() => safe(send({ t: 'xcard' })).then(() => { setMenu(false); toast('The GM will change the scene. No one will ask why.'); })}>✕ X-card: change the scene</button>
            )}
            <button className="bad" onClick={onLeave}>Leave table</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function HeroPicker({ v, send, onNew, onLeave }: { v: PlayerView; send: (i: Intent) => Promise<void>; onNew: () => void; onLeave: () => void }) {
  const mine = Object.values(store.get<Record<string, Character>>('heroes', {}));
  const atTable = v.party.filter((p) => !p.playerName);
  const ids = useMemo(() => new Set(v.party.map((p) => p.charId)), [v.party]);
  const bring = (c: Character) => send(ids.has(c.build.id) ? { t: 'pickChar', charId: c.build.id } : { t: 'saveChar', character: c }).catch((e: Error) => toast(e.message, 'error'));
  return (
    <div className="stack pad">
      <h1 className="logo small-logo">Lair Labs</h1>
      <h2>Who are you playing tonight?</h2>
      <button className="primary block" onClick={onNew}>Make a new hero</button>
      {mine.length > 0 && <h3>Heroes on this phone</h3>}
      {mine.map((c) => {
        const sh = computeSheet(c.build);
        return (
          <button key={c.build.id} className="pick row between" onClick={() => bring(c)}>
            <span><b style={{ color: c.build.color }}>{c.build.name}</b> <span className="muted small">{sh.speciesName} {sh.cls.name} {c.build.level}</span></span>
            <span>Play</span>
          </button>
        );
      })}
      {atTable.filter((p) => !mine.some((m) => m.build.id === p.charId)).length > 0 && <h3>Heroes already at this table</h3>}
      {atTable.filter((p) => !mine.some((m) => m.build.id === p.charId)).map((p) => (
        <button key={p.charId} className="pick row between" onClick={() => send({ t: 'pickChar', charId: p.charId }).catch((e: Error) => toast(e.message, 'error'))}>
          <span><b style={{ color: p.color }}>{p.name}</b> <span className="muted small">{p.classLine}</span></span>
          <span>Take over</span>
        </button>
      ))}
      <button className="ghost block" onClick={onLeave}>Leave table</button>
    </div>
  );
}

const statusClass = (s: ClientStatus) => (s === 'connected' ? 'ok' : s === 'reconnecting' || s === 'connecting' ? 'warn' : 'bad');

export function safeDiscord(url: string) {
  try {
    const u = new URL(url);
    if (u.protocol === 'https:' && /(^|\.)discord\.(gg|com)$/.test(u.hostname)) return u.toString();
  } catch {
    /* not a url */
  }
  return 'https://discord.com/app';
}

function edgeNear(gx: number, gy: number, edge: string) {
  const fx = gx - Math.floor(gx), fy = gy - Math.floor(gy);
  const d = Math.min(fx, 1 - fx, fy, 1 - fy);
  return edge && d < 0.35;
}

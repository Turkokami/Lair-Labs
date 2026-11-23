// Ready-to-play adventures: pick one to set up the table, then run it from the Story tab.
import { useEffect, useMemo, useState } from 'react';
import type { GameState, Intent } from '../engine/game';
import { ADVENTURE_CARDS, loadAdventure } from '../adventures';
import type { Adventure } from '../adventures/types';
import { startChapter, placeEncounterHidden, type AdventureProgress } from '../adventures/start';
import { Modal, store, toast } from './common';

export const ADVENTURE_KEY = 'gm.adventure';
export const getProgress = () => store.get<AdventureProgress | null>(ADVENTURE_KEY, null);

/** Loads the adventure the GM is running, if any. */
export function useAdventure(progress: AdventureProgress | null) {
  const [adv, setAdv] = useState<Adventure | null>(null);
  useEffect(() => {
    if (!progress) return setAdv(null);
    if (adv?.id === progress.id) return;
    loadAdventure(progress.id).then(setAdv, () => setAdv(null));
  }, [progress?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return adv;
}

/** The list of adventures. Picking one loads its first part onto the table. */
export function AdventurePicker({ gm, state, hasMap, onStarted, onClose }: {
  gm: (i: Intent) => boolean; state: () => GameState; hasMap: boolean; onStarted: (p: AdventureProgress) => void; onClose: () => void;
}) {
  const [busy, setBusy] = useState('');
  const [monsters, setMonsters] = useState(true);
  const go = async (id: string) => {
    if (hasMap && !confirm('Start this adventure? It replaces the map on the table, and takes the monsters and NPCs off it. Heroes stay.')) return;
    setBusy(id);
    try {
      const adv = await loadAdventure(id);
      const r = startChapter(gm, state, adv, 0, { monsters, clear: true });
      if (!r) throw new Error();
      const p = { id, chapter: 0 };
      store.set(ADVENTURE_KEY, p);
      onStarted(p);
      toast(`${adv.title} is ready${r.placed ? `: ${r.placed} monsters placed, hidden` : ''}. The Story tab has everything you need.`);
    } catch {
      toast('Could not load that adventure. Try again.', 'error');
    } finally {
      setBusy('');
    }
  };
  return (
    <Modal title="Start an adventure" onClose={onClose} wide>
      <div className="stack">
        <p className="muted">Ready to play: a story, big maps, people with profiles, handouts and balanced fights. You read; your players play.</p>
        {ADVENTURE_CARDS.map((a) => (
          <div key={a.id} className="card stack">
            <div className="row between wrap">
              <b>{a.title}</b>
              <span className="small muted">Level {a.levels} · {a.sessions} · {a.players} players</span>
            </div>
            <span>{a.tagline}</span>
            <div className="row gap wrap small muted">
              {a.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              <span>{a.chapters > 1 ? `${a.chapters} parts, ${a.mapSize}` : `Map ${a.mapSize}`}</span>
            </div>
            <button className="primary" disabled={!!busy} onClick={() => go(a.id)}>{busy === a.id ? 'Setting up the table…' : 'Start this adventure'}</button>
          </div>
        ))}
        <label className="inline small"><input type="checkbox" checked={monsters} onChange={(e) => setMonsters(e.target.checked)} /> Put the monsters on the map now, hidden from players</label>
        <p className="muted small">All original stories for Lair Labs. Monster rules from the SRD 5.2 by Wizards of the Coast, used under CC-BY-4.0.</p>
      </div>
    </Modal>
  );
}

/** The GM's script for the adventure being run: what to say, what's going on, who's who. */
export function StoryPanel({ adv, progress, gm, state, onProgress, onProfile, onPick }: {
  adv: Adventure; progress: AdventureProgress; gm: (i: Intent) => boolean; state: () => GameState;
  onProgress: (p: AdventureProgress | null) => void; onProfile: (id: string) => void; onPick: () => void;
}) {
  const ch = adv.chapters[progress.chapter] ?? adv.chapters[0];
  const map = state().map;
  const handout = (id: string) => {
    const h = adv.handouts.find((x) => x.id === id);
    if (h && gm({ t: 'gm:handout', title: h.title, text: h.text })) toast('Shown to the players');
  };
  const place = (name: string) => {
    const en = map.encounters?.find((e) => e.name === name);
    if (!en) return toast('That fight is on another part\'s map.', 'info');
    toast(`${name}: ${placeEncounterHidden(gm, map, ch, adv, en)} placed, hidden`);
  };
  const next = () => {
    const n = progress.chapter + 1;
    if (!confirm(`Go on to ${adv.chapters[n].title}? The map changes and the monsters and NPCs on it go. Heroes stay.`)) return;
    const r = startChapter(gm, state, adv, n, { monsters: true, clear: true });
    if (!r) return;
    const p = { id: adv.id, chapter: n };
    store.set(ADVENTURE_KEY, p);
    onProgress(p);
    toast(`${adv.chapters[n].title}: ${r.placed} monsters placed, hidden`);
  };
  const chapterMapId = useMemo(() => ch.map().id, [ch]);
  const onTable = map.id === chapterMapId;
  return (
    <div className="stack">
      <div className="card stack">
        <b>{adv.title}</b>
        <span className="small muted">{ch.title} · heroes of level {ch.level}</span>
        {!onTable && (
          <button className="small" onClick={() => confirm(`Put ${ch.title}'s map back on the table?`) && startChapter(gm, state, adv, progress.chapter, { monsters: false, clear: false })}>Load this part's map</button>
        )}
      </div>
      <details className="card">
        <summary><b>Before you play</b></summary>
        <div className="stack small">
          <p>{adv.pitch}</p>
          <p><b>The secret:</b> {adv.secret}</p>
          <b>Ways to get the heroes involved</b>
          <ul>{adv.hooks.map((h) => <li key={h}>{h}</li>)}</ul>
          <b>Tips for running it</b>
          <ul>{adv.tips.map((h) => <li key={h}>{h}</li>)}</ul>
        </div>
      </details>
      <div className="card stack small">
        <span><b>This part:</b> {ch.summary}</span>
        <span><b>The heroes' goal:</b> {ch.goal}</span>
      </div>
      {ch.scenes.map((sc, i) => (
        <details key={sc.title} className="card" open={i === 0}>
          <summary><b>{i + 1}. {sc.title}</b>{sc.optional && <span className="tag">optional</span>}{sc.room && <span className="muted small"> · {sc.room}</span>}</summary>
          <div className="stack small">
            {(sc.read ?? map.rooms?.find((r) => r.name === sc.room)?.readAloud) && (
              <p className="read-aloud"><i>"{sc.read ?? map.rooms?.find((r) => r.name === sc.room)?.readAloud}"</i></p>
            )}
            <p>{sc.gm}</p>
            {sc.room && map.rooms?.find((r) => r.name === sc.room)?.gmNotes && <p className="muted">{map.rooms.find((r) => r.name === sc.room)!.gmNotes}</p>}
            {sc.treasure && <p><b>Treasure:</b> {sc.treasure}</p>}
            <div className="row gap wrap">
              {sc.encounter && <button className="small" onClick={() => place(sc.encounter!)}>Place the fight: {sc.encounter}</button>}
              {sc.handout && <button className="small" onClick={() => handout(sc.handout!)}>Show handout: {adv.handouts.find((h) => h.id === sc.handout)?.title}</button>}
            </div>
          </div>
        </details>
      ))}
      <details className="card">
        <summary><b>People</b> <span className="muted small">({adv.npcs.length})</span></summary>
        <div className="stack small">
          {adv.npcs.map((n) => (
            <div key={n.id} className="row between">
              <span><b>{n.name}</b>, {n.title}. <span className="muted">{n.voice}</span></span>
              {state().profiles?.[n.id] && <button className="small" onClick={() => onProfile(n.id)}>Profile</button>}
            </div>
          ))}
        </div>
      </details>
      <details className="card">
        <summary><b>Handouts</b> <span className="muted small">({adv.handouts.length})</span></summary>
        <div className="stack small">
          {adv.handouts.map((h) => (
            <div key={h.id} className="row between"><span>{h.title}</span><button className="small" onClick={() => handout(h.id)}>Show</button></div>
          ))}
        </div>
      </details>
      <div className="card stack small">
        <span><b>When this part ends:</b> {ch.wrapUp}</span>
        {progress.chapter + 1 < adv.chapters.length ? (
          <button className="primary" onClick={next}>Go on to {adv.chapters[progress.chapter + 1].title}</button>
        ) : (
          <span><b>Endings:</b> {adv.ending}</span>
        )}
      </div>
      <div className="row gap wrap">
        <button className="ghost small" onClick={onPick}>Pick another adventure</button>
        <button className="ghost small" onClick={() => { if (confirm('Stop following this adventure? The map stays.')) { store.set(ADVENTURE_KEY, null); onProgress(null); } }}>Close the story</button>
      </div>
      <p className="muted small">Monster rules: SRD 5.2, CC-BY-4.0.</p>
    </div>
  );
}

// A character's profile: picture, gallery, the story, and the stats, for heroes, NPCs and monsters.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Intent, Token } from '../engine/game';
import { type Profile, type ProfileStats, INFO_FIELDS, STORY_FIELDS, LIMITS, blankProfile, profileImageIds } from '../engine/profile';
import type { Character } from '../rules/character';
import { computeSheet } from '../rules/character';
import { ABILITIES, ABILITY_SHORT, fmtMod, mod } from '../rules/core';
import { Modal, toast } from './common';
import { shrinkPicture } from './imagestore';

export type ImgFn = (id?: string) => string | undefined;

/** A round picture, or the first letter of the name when there's no picture yet. */
export function Avatar({ src, name, color, size = 40, onClick }: { src?: string; name: string; color?: string; size?: number; onClick?: () => void }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.45), borderColor: color ?? 'var(--line)' };
  const inner = src ? <img src={src} alt={name} /> : <span>{(name.trim()[0] ?? '?').toUpperCase()}</span>;
  return onClick ? (
    <button className="avatar plain" style={style} onClick={onClick} aria-label={`${name}'s profile`}>{inner}</button>
  ) : (
    <span className="avatar" style={style}>{inner}</span>
  );
}

type Tab = 'about' | 'stats' | 'story' | 'gallery' | 'private';

export interface ProfileProps {
  id: string;
  profile?: Profile;
  /** The hero's full sheet, when this device has it (own hero, or the GM). */
  ch?: Character;
  /** The token on the map, for live HP (GM). */
  token?: Token;
  /** A fallback name and colour when there's no profile yet. */
  name?: string;
  color?: string;
  /** What this is when there's no profile yet. */
  kind?: 'pc' | 'npc' | 'monster';
  canEdit: boolean;
  isGM: boolean;
  isOwner: boolean;
  img: ImgFn;
  send: (i: Intent) => Promise<void>;
  onClose: () => void;
}

export function ProfileModal(props: ProfileProps) {
  const { id, ch, token, canEdit, isGM, isOwner, img, send, onClose } = props;
  const kind = ch || props.profile?.kind === 'pc' || props.kind === 'pc' || token?.charId ? 'pc' : props.profile?.kind ?? props.kind ?? (token?.kind === 'monster' ? 'monster' : 'npc');
  const profile = useMemo(() => props.profile ?? blankProfile(id, kind, ch?.build.name ?? props.name ?? token?.name ?? 'Unnamed'), [props.profile, id, kind, ch, props.name, token]);
  const name = ch?.build.name ?? profile.name;
  const color = ch?.build.color ?? props.color ?? token?.color;
  const [tab, setTab] = useState<Tab>('about');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>(profile);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [viewer, setViewer] = useState<number | null>(null);
  const portraitInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const showPrivate = isGM || isOwner;

  useEffect(() => {
    if (!editing) setDraft(profile);
  }, [profile, editing]);

  const pics = [...(profile.portrait ? [{ id: profile.portrait, caption: 'Profile picture' }] : []), ...profile.gallery];
  const sheetLine = (() => {
    if (ch) {
      const sh = computeSheet(ch.build);
      return `${sh.speciesName} ${sh.cls.name} ${ch.build.level} · ${sh.backgroundName}`;
    }
    if (profile.sheet) return profile.sheet.line;
    const s = profile.stats;
    return [s?.race, s?.role, s?.level].filter(Boolean).join(' · ') || (kind === 'monster' ? 'Monster' : kind === 'npc' ? 'NPC' : 'Hero');
  })();

  const startEdit = () => {
    setDraft(structuredClone(profile));
    setCaptions(Object.fromEntries(profile.gallery.map((g) => [g.id, g.caption ?? ''])));
    setEditing(true);
  };
  const save = async () => {
    setBusy('Saving…');
    try {
      // pictures are saved as they're added; here only their captions and order travel
      const gallery = profile.gallery.map((g) => ({ id: g.id, caption: captions[g.id] ?? g.caption }));
      const { portrait: _p, sheet: _s, ...rest } = draft;
      await send({ t: 'profile:save', profile: { ...rest, id, gallery } });
      setEditing(false);
      toast('Profile saved');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy('');
    }
  };
  const upload = async (files: FileList | null, slot: 'portrait' | 'gallery') => {
    if (!files?.length) return;
    const list = [...files].slice(0, slot === 'portrait' ? 1 : LIMITS.gallery);
    try {
      for (let i = 0; i < list.length; i++) {
        setBusy(list.length > 1 ? `Sending picture ${i + 1} of ${list.length}…` : 'Sending picture…');
        const data = await shrinkPicture(list[i], slot === 'portrait' ? 640 : 1400);
        await send({ t: 'profile:image', profileId: id, data, slot });
      }
      toast(slot === 'portrait' ? 'Profile picture updated' : list.length > 1 ? `${list.length} pictures added` : 'Picture added');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy('');
      if (portraitInput.current) portraitInput.current.value = '';
      if (galleryInput.current) galleryInput.current.value = '';
    }
  };
  const makePortrait = (imageId: string) => {
    const { sheet: _s, ...rest } = profile;
    send({ t: 'profile:save', profile: { ...rest, id, portrait: imageId } }).then(() => toast('Profile picture updated'), (e: Error) => toast(e.message, 'error'));
  };
  const drop = (imageId: string) => {
    if (!confirm('Take this picture off the profile?')) return;
    send({ t: 'profile:dropImage', profileId: id, imageId }).catch((e: Error) => toast(e.message, 'error'));
  };

  const set = (patch: Partial<Profile>) => setDraft((d) => ({ ...d, ...patch }));
  const setInfo = (k: string, v: string) => setDraft((d) => ({ ...d, info: { ...d.info, [k]: v } }));
  const setStory = (k: string, v: string) => setDraft((d) => ({ ...d, story: { ...d.story, [k]: v } }));
  const setStat = (patch: Partial<ProfileStats>) => setDraft((d) => ({ ...d, stats: { ...d.stats, ...patch } }));

  const tabs: Tab[] = ['about', 'stats', 'story', 'gallery', ...(showPrivate ? (['private'] as Tab[]) : [])];

  return (
    <Modal title={name} onClose={onClose} wide>
      <div className="stack profile">
        <div className="profile-head">
          <div className="profile-pic">
            <Avatar src={img(profile.portrait)} name={name} color={color} size={96} onClick={profile.portrait ? () => setViewer(0) : canEdit ? () => portraitInput.current?.click() : undefined} />
            {canEdit && <button className="small ghost" onClick={() => portraitInput.current?.click()}>{profile.portrait ? 'Change picture' : 'Add picture'}</button>}
          </div>
          <div className="grow">
            {editing && kind !== 'pc' ? (
              <input value={draft.name} maxLength={LIMITS.name} onChange={(e) => set({ name: e.target.value })} aria-label="Name" />
            ) : (
              <h2 style={{ color }}>{name}</h2>
            )}
            {editing ? (
              <input value={draft.title ?? ''} maxLength={LIMITS.title} onChange={(e) => set({ title: e.target.value })} placeholder="Title or epithet, e.g. the Ashen Knight" aria-label="Title" />
            ) : (
              profile.title && <div className="profile-title">{profile.title}</div>
            )}
            <div className="muted small">{sheetLine}</div>
            {kind !== 'pc' && isGM && <div className="small muted">{profile.shared ? 'Players can open this profile' : 'Only you can see this profile'}</div>}
          </div>
        </div>
        <input ref={portraitInput} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files, 'portrait')} />
        <input ref={galleryInput} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files, 'gallery')} />
        {busy && <div className="banner">{busy}</div>}

        <div className="seg profile-tabs">
          {tabs.map((t) => (
            <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
              {{ about: 'About', stats: 'Stats', story: 'Story', gallery: `Gallery${profile.gallery.length ? ` (${profile.gallery.length})` : ''}`, private: isGM ? 'Private' : 'Secrets' }[t]}
            </button>
          ))}
        </div>

        {tab === 'about' && (
          <div className="stack">
            {editing ? (
              <div className="info-grid">
                {INFO_FIELDS.map((f) => (
                  <label key={f.id}>{f.label}<input value={draft.info[f.id] ?? ''} maxLength={LIMITS.info} onChange={(e) => setInfo(f.id, e.target.value)} /></label>
                ))}
              </div>
            ) : (
              <InfoGrid p={profile} pronouns={ch?.build.pronouns} />
            )}
            <StoryField label="Appearance" k="appearance" p={profile} draft={draft} editing={editing} setStory={setStory} />
            {!editing && pics.length > 1 && (
              <div className="thumbs">
                {profile.gallery.slice(0, 6).map((g, i) => <button key={g.id} className="thumb plain" onClick={() => setViewer(i + (profile.portrait ? 1 : 0))}><Pic src={img(g.id)} alt={g.caption ?? ''} /></button>)}
              </div>
            )}
          </div>
        )}

        {tab === 'stats' && (
          <div className="stack">
            {ch ? <HeroStats ch={ch} /> : profile.sheet ? <SheetBasics s={profile.sheet} /> : kind === 'pc' ? <p className="muted">The hero's player keeps the full sheet.</p> : null}
            {kind !== 'pc' && (editing ? <StatsEditor s={draft.stats ?? {}} set={setStat} /> : <StatBlock s={profile.stats} token={isGM ? token : undefined} hidden={!isGM && !profile.shareStats} />)}
            <h3>{kind === 'pc' ? 'Treasures and keepsakes' : 'Inventory'}</h3>
            {editing ? (
              <textarea rows={4} value={draft.inventory ?? ''} maxLength={LIMITS.inventory} onChange={(e) => set({ inventory: e.target.value })} placeholder="One item per line" />
            ) : profile.inventory ? (
              <ul className="card small">{profile.inventory.split('\n').filter((l) => l.trim()).map((l, i) => <li key={i}>{l}</li>)}</ul>
            ) : (
              <p className="muted small">Nothing listed yet.</p>
            )}
          </div>
        )}

        {tab === 'story' && (
          <div className="stack">
            {STORY_FIELDS.filter((f) => f.id !== 'appearance').map((f) => <StoryField key={f.id} label={f.label} hint={f.hint} big={f.big} k={f.id} p={profile} draft={draft} editing={editing} setStory={setStory} />)}
            {!editing && !STORY_FIELDS.some((f) => profile.story[f.id]) && <p className="muted">No story written yet.{canEdit ? ' Tap Edit to write the background and history.' : ''}</p>}
          </div>
        )}

        {tab === 'gallery' && (
          <div className="stack">
            {canEdit && <button className="primary" onClick={() => galleryInput.current?.click()}>Add pictures</button>}
            {!profile.gallery.length && <p className="muted">No pictures yet.{canEdit ? ' Add art, maps, sketches or anything else from your phone.' : ''}</p>}
            <div className="gallery">
              {profile.gallery.map((g, i) => (
                <figure key={g.id} className="card">
                  <button className="plain" onClick={() => setViewer(i + (profile.portrait ? 1 : 0))}><Pic src={img(g.id)} alt={g.caption ?? ''} /></button>
                  {editing ? (
                    <input value={captions[g.id] ?? ''} maxLength={LIMITS.caption} onChange={(e) => setCaptions((c) => ({ ...c, [g.id]: e.target.value }))} placeholder="Caption" aria-label="Caption" />
                  ) : (
                    g.caption && <figcaption className="small">{g.caption}</figcaption>
                  )}
                  {canEdit && (
                    <div className="row gap wrap">
                      <button className="ghost small" onClick={() => makePortrait(g.id)} disabled={profile.portrait === g.id}>Use as profile picture</button>
                      <button className="ghost small" onClick={() => drop(g.id)}>Remove</button>
                    </div>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}

        {tab === 'private' && showPrivate && (
          <div className="stack">
            <h3>Secrets</h3>
            <p className="muted small">{kind === 'pc' ? "Only you and the GM see these." : 'Only you see these.'}</p>
            {editing ? <textarea rows={5} value={draft.secrets ?? ''} maxLength={LIMITS.secrets} onChange={(e) => set({ secrets: e.target.value })} /> : <p className="card pre small">{profile.secrets || <span className="muted">None.</span>}</p>}
            {isGM && (
              <>
                <h3>GM notes</h3>
                <p className="muted small">Only you see these.</p>
                {editing ? <textarea rows={5} value={draft.gmNotes ?? ''} maxLength={LIMITS.gmNotes} onChange={(e) => set({ gmNotes: e.target.value })} /> : <p className="card pre small">{profile.gmNotes || <span className="muted">None.</span>}</p>}
              </>
            )}
            {isGM && kind !== 'pc' && (
              <div className="card stack">
                <label className="inline"><input type="checkbox" checked={!!(editing ? draft : profile).shared} onChange={(e) => (editing ? set({ shared: e.target.checked }) : quickShare({ shared: e.target.checked }))} /> Players can open this profile</label>
                <label className="inline"><input type="checkbox" checked={!!(editing ? draft : profile).shareStats} disabled={!(editing ? draft : profile).shared} onChange={(e) => (editing ? set({ shareStats: e.target.checked }) : quickShare({ shareStats: e.target.checked }))} /> Players also see the stats</label>
                {!editing && <button className="bad small" onClick={() => { if (confirm(`Delete ${name}'s profile and its pictures from this table?`)) send({ t: 'gm:deleteProfile', profileId: id }).then(onClose, (e: Error) => toast(e.message, 'error')); }}>Delete profile</button>}
              </div>
            )}
          </div>
        )}

        {canEdit && (
          <div className="row gap profile-actions">
            {editing ? (
              <>
                <button className="primary grow" onClick={save} disabled={!!busy}>Save profile</button>
                <button className="ghost" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <button className="primary grow" onClick={startEdit}>Edit profile</button>
            )}
          </div>
        )}
      </div>
      {viewer !== null && pics[viewer] && (
        <div className="lightbox" onClick={() => setViewer(null)} role="dialog" aria-label="Picture">
          <Pic src={img(pics[viewer].id)} alt={pics[viewer].caption ?? ''} />
          {pics[viewer].caption && <div className="lightbox-cap">{pics[viewer].caption}</div>}
          {pics.length > 1 && (
            <div className="row gap lightbox-nav" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setViewer((viewer + pics.length - 1) % pics.length)} aria-label="Previous picture">‹</button>
              <span className="small">{viewer + 1} / {pics.length}</span>
              <button onClick={() => setViewer((viewer + 1) % pics.length)} aria-label="Next picture">›</button>
            </div>
          )}
          <button className="ghost icon lightbox-close" onClick={() => setViewer(null)} aria-label="Close">✕</button>
        </div>
      )}
    </Modal>
  );

  function quickShare(patch: Partial<Profile>) {
    const { sheet: _s, ...rest } = profile;
    send({ t: 'profile:save', profile: { ...rest, ...patch, id } }).catch((e: Error) => toast(e.message, 'error'));
  }
}

function Pic({ src, alt }: { src?: string; alt: string }) {
  return src ? <img src={src} alt={alt} loading="lazy" /> : <span className="pic-wait">Loading…</span>;
}

function InfoGrid({ p, pronouns }: { p: Profile; pronouns?: string }) {
  const rows = INFO_FIELDS.map((f) => ({ ...f, v: p.info[f.id] || (f.id === 'pronouns' ? pronouns : '') })).filter((r) => r.v);
  if (!rows.length) return <p className="muted small">No details yet.</p>;
  return (
    <dl className="info-dl">
      {rows.map((r) => (
        <div key={r.id}><dt>{r.label}</dt><dd>{r.v}</dd></div>
      ))}
    </dl>
  );
}

function StoryField({ label, hint, big, k, p, draft, editing, setStory }: { label: string; hint?: string; big?: boolean; k: string; p: Profile; draft: Profile; editing: boolean; setStory: (k: string, v: string) => void }) {
  if (editing)
    return (
      <label>{label}
        <textarea rows={big ? 10 : 3} value={draft.story[k] ?? ''} maxLength={LIMITS.story} placeholder={hint} onChange={(e) => setStory(k, e.target.value)} />
      </label>
    );
  if (!p.story[k]) return null;
  return (
    <div>
      <h3>{label}</h3>
      <p className="pre story-text">{p.story[k]}</p>
    </div>
  );
}

function AbilityRow({ scores }: { scores: number[] }) {
  return (
    <div className="ability-row">
      {ABILITIES.map((a, i) => (
        <div key={a} className="ability-box">
          <span className="small muted">{ABILITY_SHORT[a]}</span>
          <b>{fmtMod(mod(scores[i] ?? 10))}</b>
          <span className="small">{scores[i] ?? 10}</span>
        </div>
      ))}
    </div>
  );
}

function HeroStats({ ch }: { ch: Character }) {
  const sh = computeSheet(ch.build);
  return (
    <div className="stack">
      <AbilityRow scores={ABILITIES.map((a) => sh.scores[a])} />
      <div className="statline">
        <span>Level <b>{ch.build.level}</b></span>
        <span>AC <b>{sh.ac}</b></span>
        <span>HP <b>{ch.state.hp}/{sh.maxHp}</b>{ch.state.tempHp ? ` +${ch.state.tempHp}` : ''}</span>
        <span>Speed <b>{sh.speed} ft</b></span>
        <span>Initiative <b>{fmtMod(sh.initiative)}</b></span>
        <span>Proficiency <b>{fmtMod(sh.prof)}</b></span>
        <span>Passive Perception <b>{sh.passivePerception}</b></span>
        {sh.darkvision ? <span>Darkvision <b>{sh.darkvision} ft</b></span> : null}
      </div>
      <h3>Saving throws</h3>
      <div className="statline small">{ABILITIES.map((a) => <span key={a} className={sh.saves[a].prof ? 'prof' : ''}>{ABILITY_SHORT[a]} {fmtMod(sh.saves[a].total)}</span>)}</div>
      <h3>Skills</h3>
      <div className="skill-grid small">{sh.skills.map((k) => <span key={k.id} className={k.prof ? 'prof' : 'muted'}>{k.expert ? '◆' : k.prof ? '●' : '○'} {k.name} {fmtMod(k.total)}</span>)}</div>
      {sh.attacks.length > 0 && (
        <>
          <h3>Attacks</h3>
          <ul className="card small">{sh.attacks.map((a) => <li key={a.name}><b>{a.name}</b> {fmtMod(a.toHit)} to hit, {a.dmg} {a.type}</li>)}</ul>
        </>
      )}
      {sh.spell && (
        <>
          <h3>Spellcasting</h3>
          <div className="card small">
            Save DC <b>{sh.spell.dc}</b> · Attack <b>{fmtMod(sh.spell.attack)}</b>
            {sh.spell.cantrips.length > 0 && <div>Cantrips: {sh.spell.cantrips.map((s) => s.name).join(', ')}</div>}
            {sh.spell.prepared.length > 0 && <div>Prepared: {sh.spell.prepared.map((s) => s.name).join(', ')}</div>}
          </div>
        </>
      )}
      <h3>Gear</h3>
      <div className="card small">
        <div><b>Armor:</b> {sh.acNote}</div>
        <div><b>Weapons:</b> {sh.attacks.filter((a) => a.name !== 'Unarmed Strike').map((a) => a.name).join(', ') || 'None'}</div>
        {ch.build.gear.length > 0 && <div><b>Pack:</b> {ch.build.gear.join(', ')}</div>}
        <div><b>Gold:</b> {ch.state.coins} gp</div>
      </div>
      {sh.features.length > 0 && (
        <>
          <h3>Features</h3>
          {sh.features.map((f, i) => (
            <details key={i} className="card feature small">
              <summary><b>{f.name}</b> <span className="muted">{f.source}</span></summary>
              <p>{f.text}</p>
            </details>
          ))}
        </>
      )}
    </div>
  );
}

function SheetBasics({ s }: { s: NonNullable<Profile['sheet']> }) {
  return (
    <div className="stack">
      <AbilityRow scores={s.abilities} />
      <div className="statline">
        <span>Level <b>{s.level}</b></span>
        <span>AC <b>{s.ac}</b></span>
        <span>Max HP <b>{s.maxHp}</b></span>
        <span>Speed <b>{s.speed} ft</b></span>
      </div>
      {s.skills.length > 0 && <><h3>Skills</h3><div className="skill-grid small">{s.skills.map((k) => <span key={k} className="prof">● {k}</span>)}</div></>}
      {s.gear.length > 0 && <><h3>Gear</h3><div className="card small">{s.gear.join(', ')}</div></>}
    </div>
  );
}

function StatBlock({ s, token, hidden }: { s?: ProfileStats; token?: Token; hidden: boolean }) {
  if (hidden) return <p className="muted small">The GM keeps this one's stats hidden.</p>;
  if (!s && !token) return <p className="muted small">No stats yet.</p>;
  return (
    <div className="stack">
      {s?.abilities && <AbilityRow scores={s.abilities} />}
      <div className="statline">
        {token && <span>HP now <b>{token.hp}/{token.maxHp}</b></span>}
        {s?.ac && <span>AC <b>{s.ac}</b></span>}
        {s?.hp && <span>HP <b>{s.hp}</b></span>}
        {s?.speed && <span>Speed <b>{s.speed}</b></span>}
      </div>
      {(['saves', 'skills', 'senses', 'languages'] as const).map((k) => s?.[k] && <div key={k} className="small"><b>{k[0].toUpperCase() + k.slice(1)}:</b> {s[k]}</div>)}
      {s?.traits && <><h3>Traits</h3><p className="pre small card">{s.traits}</p></>}
      {s?.actions && <><h3>Actions</h3><p className="pre small card">{s.actions}</p></>}
    </div>
  );
}

function StatsEditor({ s, set }: { s: ProfileStats; set: (p: Partial<ProfileStats>) => void }) {
  const ab = s.abilities ?? [10, 10, 10, 10, 10, 10];
  const line = (k: 'race' | 'role' | 'level' | 'ac' | 'hp' | 'speed', label: string, ph: string) => (
    <label>{label}<input value={s[k] ?? ''} maxLength={LIMITS.info} placeholder={ph} onChange={(e) => set({ [k]: e.target.value })} /></label>
  );
  const area = (k: 'saves' | 'skills' | 'senses' | 'languages' | 'traits' | 'actions', label: string, rows = 2) => (
    <label>{label}<textarea rows={rows} value={s[k] ?? ''} maxLength={LIMITS.statText} onChange={(e) => set({ [k]: e.target.value })} /></label>
  );
  return (
    <div className="stack">
      <div className="info-grid">
        {line('race', 'Kind or species', 'Medium humanoid (elf)')}
        {line('role', 'Class or role', 'Innkeeper, priest, captain')}
        {line('level', 'Level or CR', 'Level 3, or CR 1/4')}
        {line('ac', 'Armor Class', '15 (chain shirt)')}
        {line('hp', 'Hit Points', '27 (5d8 + 5)')}
        {line('speed', 'Speed', '30 ft')}
      </div>
      <div className="ability-row">
        {ABILITIES.map((a, i) => (
          <label key={a} className="ability-box">
            <span className="small muted">{ABILITY_SHORT[a]}</span>
            <input className="num" inputMode="numeric" value={ab[i]} onChange={(e) => { const n = [...ab]; n[i] = Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 1)); set({ abilities: n }); }} aria-label={ABILITY_SHORT[a]} />
          </label>
        ))}
      </div>
      {area('saves', 'Saving throws')}
      {area('skills', 'Skills')}
      {area('senses', 'Senses')}
      {area('languages', 'Languages')}
      {area('traits', 'Traits', 4)}
      {area('actions', 'Actions', 5)}
    </div>
  );
}

/** Every picture id the profiles on screen point at (to ask the GM for them). */
export const imagesOf = (ps: (Profile | undefined)[]) => ps.flatMap((p) => (p ? profileImageIds(p) : []));

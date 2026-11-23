import { useMemo, useState } from 'react';
import { CLASSES, classById, learnableSpellLevel, MAX_LEVEL, featLevels, expertiseCount } from '../rules/classes';
import { featById, ASI_FEATS, EPIC_FEATS, STYLE_FEATS } from '../rules/feats';
import { SPECIES, BACKGROUNDS, speciesById, backgroundById } from '../rules/origins';
import { ABILITIES, ABILITY_NAMES, ABILITY_SHORT, type Ability, type Skill, skillName, fmtMod, mod } from '../rules/core';
import { spellsFor } from '../rules/spells';
import { type Character, type CharacterBuild, type Scores, computeSheet, defaultBuild, defaultAsis, freshState, premade, PREMADE_NAMES, STANDARD_ARRAY, POINT_COST, pointsSpent, finalScores, asiChoice } from '../rules/character';

const COLORS = ['#e4572e', '#29a3a3', '#f3a712', '#7d5ba6', '#4caf50', '#e83f6f', '#2e86de', '#c0763b', '#94a3b8', '#f472b6'];
const STEPS = ['Class', 'Origin', 'Abilities', 'Skills', 'Spells', 'Details', 'Review'];

export function CharBuilder({ initial, maxLevel = 1, onSave, onCancel, levelUp }: { initial?: CharacterBuild; maxLevel?: number; onSave: (c: Character) => void; onCancel: () => void; levelUp?: boolean }) {
  const [b, setB] = useState<CharacterBuild | null>(initial ? { ...initial, level: levelUp ? Math.min(MAX_LEVEL, initial.level + 1) : initial.level } : null);
  const [step, setStep] = useState(levelUp ? 6 : 0);
  const [method, setMethod] = useState<'array' | 'points'>('array');

  if (!b)
    return (
      <div className="builder">
        <h2>Make a hero</h2>
        <p className="muted">Pick a ready-made hero to play right now, or build your own step by step.</p>
        <button className="primary block" onClick={() => setB(defaultBuild('fighter', 'human', undefined, Math.min(maxLevel, MAX_LEVEL), ''))}>Build my own</button>
        {maxLevel > 1 && <p className="muted small">Your GM is starting heroes at level {maxLevel}.</p>}
        <h3>Ready-made heroes</h3>
        <div className="cards">
          {CLASSES.map((c) => (
            <button key={c.id} className="pick" onClick={() => { const pb = premade(c.id, Math.min(maxLevel, MAX_LEVEL)); setB(pb); setStep(6); }}>
              <b>{PREMADE_NAMES[c.id][0]}</b>
              <span className="muted small">{speciesById(PREMADE_NAMES[c.id][1]).name} {c.name}</span>
              <span className="small">{c.playsLike}</span>
            </button>
          ))}
        </div>
        <button className="ghost block" onClick={onCancel}>Cancel</button>
      </div>
    );

  const cls = classById(b.classId);
  const isCaster = cls.caster !== 'none' && (cls.cantrips?.[b.level - 1] ?? 0) + (cls.prepared?.[b.level - 1] ?? 0) > 0;
  const steps = STEPS.filter((s) => s !== 'Spells' || isCaster);
  const cur = steps[Math.min(step, steps.length - 1)];
  const set = (patch: Partial<CharacterBuild>) => setB({ ...b, ...patch });
  const reclass = (classId: string) => {
    const nb = defaultBuild(classId, b.speciesId, undefined, b.level, b.name);
    setB({ ...nb, id: b.id, color: b.color, notes: b.notes, pronouns: b.pronouns, name: b.name });
  };

  return (
    <div className="builder">
      <div className="steps">
        {steps.map((s, i) => (
          <button key={s} className={'step' + (s === cur ? ' on' : '') + (i < steps.indexOf(cur) ? ' done' : '')} onClick={() => setStep(i)}>{s}</button>
        ))}
      </div>
      {cur === 'Class' && (
        <div className="cards">
          {CLASSES.map((c) => (
            <button key={c.id} className={'pick' + (c.id === b.classId ? ' on' : '')} onClick={() => reclass(c.id)}>
              <b>{c.name}</b>
              <span className="muted small">d{c.hitDie} · {c.primary.map((a) => ABILITY_SHORT[a]).join('/')} · {c.difficulty}</span>
              <span className="small">{c.playsLike}</span>
            </button>
          ))}
        </div>
      )}
      {cur === 'Origin' && <OriginStep b={b} set={setB} />}
      {cur === 'Abilities' && <AbilityStep b={b} set={setB} method={method} setMethod={setMethod} />}
      {cur === 'Skills' && <SkillStep b={b} set={setB} />}
      {cur === 'Spells' && <SpellStep b={b} set={setB} />}
      {cur === 'Details' && (
        <div className="stack">
          <label>Name<input value={b.name} onChange={(e) => set({ name: e.target.value.slice(0, 40) })} placeholder="What do people call you?" /></label>
          <label>Pronouns (optional)<input value={b.pronouns ?? ''} onChange={(e) => set({ pronouns: e.target.value.slice(0, 20) })} placeholder="they/them" /></label>
          <div>
            <div className="label">Token color</div>
            <div className="row wrap gap">
              {COLORS.map((c) => <button key={c} className={'swatch' + (b.color === c ? ' on' : '')} style={{ background: c }} onClick={() => set({ color: c })} aria-label={`Color ${c}`} />)}
            </div>
          </div>
          <label>
            Level
            <select value={b.level} onChange={(e) => setB(relevel(b, Number(e.target.value)))}>
              {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).filter((l) => l <= Math.max(maxLevel, initial?.level ?? 1, levelUp ? (initial?.level ?? 0) + 1 : 0)).map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <span className="muted small">Your GM decides when you level up.</span>
          </label>
          {cls.fightingStyleAt && b.level >= cls.fightingStyleAt && <StylePicker b={b} set={setB} />}
          {featLevels(cls).filter((l) => l <= b.level).map((l) => <AsiPicker key={l} lvl={l} b={b} set={setB} />)}
          <label>Notes<textarea value={b.notes} onChange={(e) => set({ notes: e.target.value.slice(0, 2000) })} placeholder="Backstory, personality, anything you want to remember" rows={4} /></label>
          <p className="muted small">You start with the {cls.name}'s standard gear: {[cls.kit.armor ? 'armor' : null, ...cls.kit.weapons, ...cls.kit.gear].filter(Boolean).length} items. You can see it in the Bag tab.</p>
        </div>
      )}
      {cur === 'Review' && <Review b={b} />}
      <div className="row gap builder-nav">
        <button className="ghost" onClick={() => (step === 0 ? onCancel() : setStep(steps.indexOf(cur) - 1))}>{step === 0 ? 'Cancel' : 'Back'}</button>
        {cur !== 'Review' ? (
          <button className="primary grow" onClick={() => setStep(steps.indexOf(cur) + 1)}>Next</button>
        ) : (
          <button
            className="primary grow"
            disabled={!b.name.trim()}
            onClick={() => onSave({ build: { ...b, name: b.name.trim() }, state: freshState(b) })}
          >
            {!b.name.trim() ? 'Give your hero a name first' : levelUp ? `Level up to ${b.level}` : 'Save hero'}
          </button>
        )}
      </div>
    </div>
  );
}

function relevel(b: CharacterBuild, level: number): CharacterBuild {
  const cls = classById(b.classId);
  const pool = spellsFor(cls.id, learnableSpellLevel(cls, level)).map((s) => s.id);
  const cMax = cls.cantrips?.[level - 1] ?? 0;
  const pMax = cls.prepared?.[level - 1] ?? 0;
  const next = { ...b, level, cantrips: b.cantrips.slice(0, cMax), spells: b.spells.filter((s) => pool.includes(s)).slice(0, pMax) };
  // fill new picks with sensible defaults so a level-up is never short
  const d = defaultBuild(b.classId, b.speciesId, b.backgroundId, level);
  for (const s of d.cantrips) if (next.cantrips.length < cMax && !next.cantrips.includes(s)) next.cantrips.push(s);
  for (const s of d.spells) if (next.spells.length < pMax && !next.spells.includes(s)) next.spells.push(s);
  const eMax = expertiseCount(cls, level);
  const prof = [...next.skills, ...backgroundById(b.backgroundId).skills];
  for (const s of prof) if (next.expertise.length < eMax && !next.expertise.includes(s)) next.expertise = [...next.expertise, s];
  next.expertise = next.expertise.slice(0, eMax);
  // fill in ASI / Epic Boon choices for levels that don't have one yet
  const defaults = defaultAsis(cls, b.base, b.bgBonus);
  const asis = { ...(b.asis ?? {}) };
  if (!asis[4] && b.asi && Object.keys(b.asi).length) asis[4] = { scores: b.asi };
  for (const l of featLevels(cls)) if (l <= level && !asis[l]) asis[l] = defaults[l];
  next.asis = asis;
  if (cls.fightingStyleAt && !next.fightingStyle) next.fightingStyle = 'defense';
  return next;
}

function OriginStep({ b, set }: { b: CharacterBuild; set: (b: CharacterBuild) => void }) {
  const bg = backgroundById(b.backgroundId);
  const bonusMode = Object.values(b.bgBonus).some((v) => v === 2) ? '21' : '111';
  const pickBg = (id: string) => {
    const nbg = backgroundById(id);
    const cls = classById(b.classId);
    const order = cls.standardArray.filter((a) => nbg.abilities.includes(a));
    const skills = b.skills.filter((s) => !nbg.skills.includes(s));
    set({ ...b, backgroundId: id, bgBonus: { [order[0]]: 2, [order[1]]: 1 }, skills });
  };
  return (
    <div className="stack">
      <h3>Species</h3>
      <div className="cards">
        {SPECIES.map((s) => (
          <button key={s.id} className={'pick' + (s.id === b.speciesId ? ' on' : '')} onClick={() => set({ ...b, speciesId: s.id })}>
            <b>{s.name}</b>
            <span className="muted small">{s.size} · {s.speed} ft{s.darkvision ? ` · Darkvision ${s.darkvision} ft` : ''}</span>
            <span className="small">{s.traits.map((t) => t.name).join(', ')}</span>
          </button>
        ))}
      </div>
      <details className="card">
        <summary>{speciesById(b.speciesId).name} traits</summary>
        {speciesById(b.speciesId).traits.map((t) => <p key={t.name} className="small"><b>{t.name}.</b> {t.text}</p>)}
      </details>
      <h3>Background</h3>
      <div className="cards">
        {BACKGROUNDS.map((g) => (
          <button key={g.id} className={'pick' + (g.id === b.backgroundId ? ' on' : '')} onClick={() => pickBg(g.id)}>
            <b>{g.name}</b>
            <span className="muted small">{g.abilities.map((a) => ABILITY_SHORT[a]).join(', ')} · {g.skills.map(skillName).join(', ')}</span>
            <span className="small">{g.feat}: {g.featText}</span>
          </button>
        ))}
      </div>
      <h3>Ability bonus from {bg.name}</h3>
      <div className="seg">
        <button className={bonusMode === '21' ? 'on' : ''} onClick={() => set({ ...b, bgBonus: { [bg.abilities[0]]: 2, [bg.abilities[1]]: 1 } })}>+2 and +1</button>
        <button className={bonusMode === '111' ? 'on' : ''} onClick={() => set({ ...b, bgBonus: Object.fromEntries(bg.abilities.map((a) => [a, 1])) })}>+1 to all three</button>
      </div>
      {bonusMode === '21' && (
        <div className="row gap wrap">
          {(['+2', '+1'] as const).map((label, idx) => {
            const val = idx === 0 ? 2 : 1;
            const current = (Object.entries(b.bgBonus).find(([, v]) => v === val)?.[0] ?? '') as Ability;
            return (
              <label key={label}>
                {label} to
                <select
                  value={current}
                  onChange={(e) => {
                    const a = e.target.value as Ability;
                    const other = (Object.entries(b.bgBonus).find(([, v]) => v !== val)?.[0] ?? '') as Ability;
                    const nb: Partial<Scores> = { [a]: val };
                    const otherPick = other && other !== a ? other : bg.abilities.find((x) => x !== a)!;
                    nb[otherPick] = val === 2 ? 1 : 2;
                    set({ ...b, bgBonus: nb });
                  }}
                >
                  {bg.abilities.map((a) => <option key={a} value={a}>{ABILITY_NAMES[a]}</option>)}
                </select>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AbilityStep({ b, set, method, setMethod }: { b: CharacterBuild; set: (b: CharacterBuild) => void; method: 'array' | 'points'; setMethod: (m: 'array' | 'points') => void }) {
  const final = finalScores(b);
  const cls = classById(b.classId);
  const spent = pointsSpent(b.base);
  const assign = (a: Ability, v: number) => {
    const base = { ...b.base };
    const holder = ABILITIES.find((x) => x !== a && base[x] === v);
    if (holder) base[holder] = base[a];
    base[a] = v;
    set({ ...b, base });
  };
  return (
    <div className="stack">
      <div className="seg">
        <button className={method === 'array' ? 'on' : ''} onClick={() => { setMethod('array'); const base = {} as Scores; cls.standardArray.forEach((a, i) => (base[a] = STANDARD_ARRAY[i])); set({ ...b, base }); }}>Standard array</button>
        <button className={method === 'points' ? 'on' : ''} onClick={() => { setMethod('points'); set({ ...b, base: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 } }); }}>Point buy</button>
      </div>
      <p className="muted small">{cls.name}s care most about {cls.primary.map((a) => ABILITY_NAMES[a]).join(' and ')}.{method === 'array' ? ' Each number goes to one ability; picking a used number swaps them.' : ` Spend 27 points. ${27 - spent} left.`}</p>
      <div className="ab-table">
        {ABILITIES.map((a) => (
          <div key={a} className="ab-row">
            <span className="ab-label">{ABILITY_NAMES[a]}</span>
            {method === 'array' ? (
              <select value={b.base[a]} onChange={(e) => assign(a, Number(e.target.value))}>
                {STANDARD_ARRAY.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            ) : (
              <span className="stepper">
                <button disabled={b.base[a] <= 8} onClick={() => set({ ...b, base: { ...b.base, [a]: b.base[a] - 1 } })} aria-label={`Lower ${ABILITY_NAMES[a]}`}>−</button>
                <span>{b.base[a]}</span>
                <button disabled={b.base[a] >= 15 || spent - POINT_COST[b.base[a]] + POINT_COST[b.base[a] + 1] > 27} onClick={() => set({ ...b, base: { ...b.base, [a]: b.base[a] + 1 } })} aria-label={`Raise ${ABILITY_NAMES[a]}`}>+</button>
              </span>
            )}
            <span className="muted small">{b.bgBonus[a] ? `+${b.bgBonus[a]}` : ''}{final[a] - b.base[a] - (b.bgBonus[a] ?? 0) > 0 ? ` +${final[a] - b.base[a] - (b.bgBonus[a] ?? 0)} later` : ''}</span>
            <b>{final[a]} ({fmtMod(mod(final[a]))})</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function StylePicker({ b, set }: { b: CharacterBuild; set: (b: CharacterBuild) => void }) {
  const cur = b.fightingStyle ?? 'defense';
  return (
    <label>
      Fighting Style
      <select value={cur} onChange={(e) => set({ ...b, fightingStyle: e.target.value })}>
        {STYLE_FEATS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <span className="muted small">{featById(cur)?.text}</span>
    </label>
  );
}

function AsiPicker({ lvl, b, set }: { lvl: number; b: CharacterBuild; set: (b: CharacterBuild) => void }) {
  const cls = classById(b.classId);
  const epic = lvl === 19;
  const choice = asiChoice(b, lvl);
  const feat = choice.feat ? featById(choice.feat) : undefined;
  const put = (c: { scores?: Partial<Scores>; feat?: string }) => set({ ...b, asis: { ...(b.asis ?? {}), [lvl]: c }, ...(lvl === 4 && !c.feat && c.scores ? { asi: c.scores } : {}) });
  const entries = Object.entries(choice.scores ?? {}).filter(([, v]) => v) as [Ability, number][];
  const [a1, a2] = cls.standardArray;
  const raiseFrom: Ability[] = feat ? feat.raise ?? [] : ABILITIES;
  const options = epic ? EPIC_FEATS : ASI_FEATS.filter((f) => f.id !== 'asiFeat');
  const mode = feat ? feat.id : 'asi';
  return (
    <div className="card">
      <b>Level {lvl}: {epic ? 'Epic Boon' : 'Ability Score Improvement or feat'}</b>
      <label>
        Choice
        <select
          value={mode}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'asi') put({ scores: { [a1]: 2 } });
            else {
              const f = featById(v)!;
              const r = f.raise?.find((x) => cls.standardArray.indexOf(x) >= 0 && finalScores(b)[x] < (epic ? 30 : 20)) ?? f.raise?.[0];
              put({ feat: v, scores: r ? { [r]: 1 } : undefined });
            }
          }}
        >
          {!epic && <option value="asi">Raise ability scores</option>}
          {options.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </label>
      {feat && <p className="small muted">{feat.text}</p>}
      {mode === 'asi' && (
        <div className="seg small">
          <button className={entries.length === 1 ? 'on' : ''} onClick={() => put({ scores: { [a1]: 2 } })}>+2 to one</button>
          <button className={entries.length !== 1 ? 'on' : ''} onClick={() => put({ scores: { [a1]: 1, [a2]: 1 } })}>+1 to two</button>
        </div>
      )}
      <div className="row gap wrap">
        {entries.map(([a, v], i) => (
          <label key={i}>
            +{v} to
            <select
              value={a}
              onChange={(e) => {
                const scores: Partial<Scores> = {};
                entries.forEach(([k, val], j) => {
                  const key = (j === i ? e.target.value : k) as Ability;
                  scores[key] = (scores[key] ?? 0) + val;
                });
                put({ ...choice, scores });
              }}
            >
              {raiseFrom.map((x) => <option key={x} value={x}>{ABILITY_NAMES[x]}</option>)}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

function SkillStep({ b, set }: { b: CharacterBuild; set: (b: CharacterBuild) => void }) {
  const cls = classById(b.classId);
  const bg = backgroundById(b.backgroundId);
  const sp = speciesById(b.speciesId);
  const count = cls.skillCount + (sp.extraSkill ? 1 : 0) + (cls.id === 'bard' ? 0 : 0);
  const from = sp.extraSkill ? [...new Set([...cls.skillFrom, ...(['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival'] as Skill[])])] : cls.skillFrom;
  const expertMax = expertiseCount(cls, b.level);
  const toggle = (s: Skill) => {
    if (b.skills.includes(s)) set({ ...b, skills: b.skills.filter((x) => x !== s), expertise: b.expertise.filter((x) => x !== s) });
    else if (b.skills.length < count) set({ ...b, skills: [...b.skills, s] });
  };
  const proficient = [...b.skills, ...bg.skills];
  return (
    <div className="stack">
      <p>Pick <b>{count}</b> skills{sp.extraSkill ? ' (Humans get one extra from any skill)' : ''}. {b.skills.length}/{count} chosen.</p>
      <p className="muted small">From your background you already have {bg.skills.map(skillName).join(' and ')}.</p>
      <div className="chips">
        {from.filter((s) => !bg.skills.includes(s)).map((s) => (
          <button key={s} className={'chip-btn' + (b.skills.includes(s) ? ' on' : '')} onClick={() => toggle(s)} disabled={!b.skills.includes(s) && b.skills.length >= count}>
            {skillName(s)}
          </button>
        ))}
      </div>
      {expertMax > 0 && (
        <>
          <h3>Expertise</h3>
          <p className="muted small">Pick {expertMax} skills you're proficient in. You add double your proficiency bonus to them.</p>
          <div className="chips">
            {proficient.map((s) => (
              <button
                key={s}
                className={'chip-btn' + (b.expertise.includes(s) ? ' on' : '')}
                onClick={() => set({ ...b, expertise: b.expertise.includes(s) ? b.expertise.filter((x) => x !== s) : b.expertise.length < expertMax ? [...b.expertise, s] : b.expertise })}
              >
                {skillName(s)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SpellStep({ b, set }: { b: CharacterBuild; set: (b: CharacterBuild) => void }) {
  const cls = classById(b.classId);
  const learnMax = learnableSpellLevel(cls, b.level);
  const pool = spellsFor(cls.id, learnMax);
  const [lvlTab, setLvlTab] = useState(0);
  const cMax = cls.cantrips?.[b.level - 1] ?? 0;
  const pMax = cls.prepared?.[b.level - 1] ?? 0;
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (key: 'cantrips' | 'spells', id: string, max: number) => {
    const list = b[key];
    if (list.includes(id)) set({ ...b, [key]: list.filter((x) => x !== id) });
    else if (list.length < max) set({ ...b, [key]: [...list, id] });
  };
  const section = (title: string, key: 'cantrips' | 'spells', max: number, items: typeof pool) =>
    max > 0 && (
      <>
        <h3>{title} <span className="muted small">{b[key].length}/{max}</span></h3>
        <div className="spell-picks">
          {items.map((s) => (
            <div key={s.id} className={'spell-pick' + (b[key].includes(s.id) ? ' on' : '')}>
              <button className="plain grow left" onClick={() => toggle(key, s.id, max)} disabled={!b[key].includes(s.id) && b[key].length >= max}>
                <b>{b[key].includes(s.id) ? '✓ ' : ''}{s.name}</b> <span className="muted small">{s.level ? `Level ${s.level}` : 'Cantrip'} · {s.school}{s.conc ? ' · Conc.' : ''}</span>
              </button>
              <button className="ghost icon small" onClick={() => setOpen(open === s.id ? null : s.id)} aria-label={`About ${s.name}`}>ⓘ</button>
              {open === s.id && <p className="small">{s.text}</p>}
            </div>
          ))}
        </div>
      </>
    );
  return (
    <div className="stack">
      {section('Cantrips', 'cantrips', cMax, pool.filter((s) => s.level === 0))}
      {pMax > 0 && learnMax > 1 && (
        <div className="seg small wrap">
          <button className={lvlTab === 0 ? 'on' : ''} onClick={() => setLvlTab(0)}>All</button>
          {Array.from({ length: learnMax }, (_, i) => i + 1).map((l) => (
            <button key={l} className={lvlTab === l ? 'on' : ''} onClick={() => setLvlTab(l)}>
              {l}{b.spells.some((id) => pool.find((s) => s.id === id)?.level === l) ? ' ✓' : ''}
            </button>
          ))}
        </div>
      )}
      {section(cls.caster === 'pact' || cls.id === 'sorcerer' || cls.id === 'bard' || cls.id === 'ranger' ? 'Spells known' : 'Prepared spells', 'spells', pMax, pool.filter((s) => s.level > 0 && (!lvlTab || s.level === lvlTab)))}
      {cls.caster === 'pact' && b.level >= 11 && <p className="muted small">Spells of 6th level and up are your Mystic Arcanum: one of each level, cast once per long rest without a slot.</p>}
    </div>
  );
}

function Review({ b }: { b: CharacterBuild }) {
  const sh = useMemo(() => computeSheet(b), [b]);
  return (
    <div className="stack">
      <h2 style={{ color: b.color }}>{b.name || 'Unnamed hero'}</h2>
      <div className="muted">Level {b.level} {sh.speciesName} {sh.cls.name} · {sh.backgroundName}</div>
      <div className="row gap wrap">
        <div className="stat-mini"><b>{sh.maxHp}</b><span>HP</span></div>
        <div className="stat-mini"><b>{sh.ac}</b><span>AC</span></div>
        <div className="stat-mini"><b>{sh.speed}</b><span>Speed</span></div>
        <div className="stat-mini"><b>{fmtMod(sh.initiative)}</b><span>Init</span></div>
        <div className="stat-mini"><b>+{sh.prof}</b><span>Prof</span></div>
      </div>
      <div className="abilities">
        {ABILITIES.map((a) => (
          <div key={a} className="ability"><span className="ab-name">{ABILITY_SHORT[a]}</span><span className="ab-mod">{fmtMod(sh.mods[a])}</span><span className="ab-score">{sh.scores[a]}</span></div>
        ))}
      </div>
      <div className="small"><b>Skills:</b> {sh.skills.filter((s) => s.prof).map((s) => `${s.name} ${fmtMod(s.total)}`).join(', ')}</div>
      <div className="small"><b>Attacks:</b> {sh.attacks.map((a) => `${a.name} ${fmtMod(a.toHit)} (${a.dmg})`).join(', ')}</div>
      {sh.spell && <div className="small"><b>Spells:</b> {[...sh.spell.cantrips, ...sh.spell.prepared].map((s) => s.name).join(', ') || 'None yet'} · DC {sh.spell.dc}</div>}
      <div className="small"><b>Features:</b> {sh.features.map((f) => f.name).join(', ')}</div>
    </div>
  );
}

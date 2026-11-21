import { useState } from 'react';
import type { Character, CharacterState } from '../rules/character';
import { computeSheet, masteryText } from '../rules/character';
import { ABILITIES, ABILITY_NAMES, ABILITY_SHORT, CONDITIONS, fmtMod, conditionName } from '../rules/core';
import type { Spell } from '../rules/spells';
import { d20Formula } from '../engine/dice';
import type { Intent } from '../engine/game';
import { Pips, toast, type RollFn } from './common';

export interface SheetProps {
  ch: Character;
  roll: RollFn;
  send: (i: Intent) => Promise<void>;
  canEdit: boolean;
}

type Adv = 'none' | 'adv' | 'dis';

function AdvToggle({ adv, setAdv }: { adv: Adv; setAdv: (a: Adv) => void }) {
  return (
    <span className="seg small">
      {(['none', 'adv', 'dis'] as const).map((a) => (
        <button key={a} className={adv === a ? 'on' : ''} onClick={() => setAdv(a)}>{a === 'none' ? 'Normal' : a === 'adv' ? 'Advantage' : 'Disadvantage'}</button>
      ))}
    </span>
  );
}

const safe = (p: Promise<void>) => p.catch((e: Error) => toast(e.message, 'error'));

export function HpBox({ ch, send, canEdit }: Pick<SheetProps, 'ch' | 'send' | 'canEdit'>) {
  const sh = computeSheet(ch.build);
  const st = ch.state as CharacterState & { concDC?: number };
  const [amt, setAmt] = useState('');
  const n = Math.max(0, parseInt(amt, 10) || 0);
  const id = ch.build.id;
  const dying = st.hp === 0 && !st.dead && !st.stable;
  return (
    <div className="card hp-box">
      <div className="row between">
        <div>
          <div className="big">{st.dead ? 'Dead' : `${st.hp}`}<span className="muted"> / {sh.maxHp}</span>{st.tempHp > 0 && <span className="temp"> +{st.tempHp} temp</span>}</div>
          <div className="muted small">Hit points</div>
        </div>
        <div className="stat-mini"><b>{sh.ac}</b><span>AC</span></div>
        <div className="stat-mini"><b>{sh.speed}</b><span>Speed</span></div>
        <div className="stat-mini"><b>{fmtMod(sh.initiative)}</b><span>Init</span></div>
      </div>
      <div className="hpbar"><div style={{ width: `${Math.min(100, (st.hp / sh.maxHp) * 100)}%` }} /></div>
      {canEdit && !st.dead && (
        <div className="row gap wrap">
          <input className="num" inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ''))} placeholder="0" aria-label="Amount" />
          <button className="bad" disabled={!n} onClick={() => { safe(send({ t: 'hp', charId: id, delta: -n })); setAmt(''); }}>Damage</button>
          <button className="good" disabled={!n} onClick={() => { safe(send({ t: 'hp', charId: id, delta: n })); setAmt(''); }}>Heal</button>
          <button className="ghost" disabled={!n} onClick={() => { safe(send({ t: 'hp', charId: id, temp: n })); setAmt(''); }}>Set temp</button>
        </div>
      )}
      {dying && (
        <div className="dying">
          <b>You're dying.</b> On your turn, roll a death save. 10 or higher is a success. Three successes and you're stable; three failures and you die.
          <div className="row gap">
            <span>Successes <Pips max={3} used={3 - st.deathSaves.s} label="Successes" /></span>
            <span>Failures <Pips max={3} used={3 - st.deathSaves.f} label="Failures" /></span>
          </div>
          {canEdit && <button className="primary" onClick={() => safe(send({ t: 'deathSave' }))}>Roll death save</button>}
        </div>
      )}
      {st.stable && st.hp === 0 && <div className="muted">Stable but unconscious. Healing wakes you up.</div>}
      {st.concDC && canEdit && (
        <div className="notice">
          You took damage while concentrating on {st.concentration}.
          <button className="primary" onClick={() => safe(send({ t: 'concSave', charId: id }))}>Roll DC {st.concDC} Con save</button>
        </div>
      )}
      {st.concentration && !st.concDC && (
        <div className="row between small">
          <span>Concentrating on <b>{st.concentration}</b></span>
          {canEdit && <button className="ghost small" onClick={() => safe(send({ t: 'charState', charId: id, patch: { concentration: undefined } }))}>Stop</button>}
        </div>
      )}
    </div>
  );
}

export function SheetPanel({ ch, roll, send, canEdit }: SheetProps) {
  const sh = computeSheet(ch.build);
  const [adv, setAdv] = useState<Adv>('none');
  const [condOpen, setCondOpen] = useState(false);
  const st = ch.state;
  const r = (mod: number, label: string) => roll(d20Formula(mod, adv), label);
  return (
    <div className="stack">
      <div className="row between">
        <div>
          <h2 className="char-name" style={{ color: ch.build.color }}>{ch.build.name}</h2>
          <div className="muted">{sh.speciesName} {sh.cls.name} {ch.build.level}{sh.subclass ? ` · ${sh.subclass}` : ''} · {sh.backgroundName}</div>
        </div>
        {st.inspiration && <span className="badge good" title="Heroic Inspiration: reroll one die">Inspired</span>}
      </div>
      <HpBox ch={ch} send={send} canEdit={canEdit} />
      <AdvToggle adv={adv} setAdv={setAdv} />
      <div className="abilities">
        {ABILITIES.map((a) => (
          <button key={a} className="ability" onClick={() => r(sh.mods[a], `${ABILITY_NAMES[a]} check`)}>
            <span className="ab-name">{ABILITY_SHORT[a]}</span>
            <span className="ab-mod">{fmtMod(sh.mods[a])}</span>
            <span className="ab-score">{sh.scores[a]}</span>
          </button>
        ))}
      </div>
      <h3>Saving throws</h3>
      <div className="grid2">
        {ABILITIES.map((a) => (
          <button key={a} className={'line' + (sh.saves[a].prof ? ' prof' : '')} onClick={() => r(sh.saves[a].total, `${ABILITY_NAMES[a]} save`)}>
            <span>{ABILITY_NAMES[a]}</span><b>{fmtMod(sh.saves[a].total)}</b>
          </button>
        ))}
      </div>
      <h3>Skills <span className="muted small">· Passive Perception {sh.passivePerception}</span></h3>
      <div className="grid2">
        {sh.skills.map((s) => (
          <button key={s.id} className={'line' + (s.prof ? ' prof' : '') + (s.expert ? ' expert' : '')} onClick={() => r(s.total, s.name)}>
            <span>{s.name} <span className="muted small">{ABILITY_SHORT[s.ability]}</span></span><b>{fmtMod(s.total)}</b>
          </button>
        ))}
      </div>
      <p className="muted small">● proficient · ◆ expertise. Tap any line to roll it.</p>
      <h3>Conditions</h3>
      <div className="row wrap gap">
        {st.conditions.length === 0 && <span className="muted">None</span>}
        {st.conditions.map((c) => (
          <span key={c} className="chip">
            {conditionName(c)}
            {canEdit && <button className="ghost icon small" onClick={() => safe(send({ t: 'cond', target: ch.build.id, cond: c, on: false }))} aria-label={`Remove ${conditionName(c)}`}>✕</button>}
          </span>
        ))}
        {canEdit && <button className="ghost small" onClick={() => setCondOpen(!condOpen)}>{condOpen ? 'Done' : '+ Add'}</button>}
      </div>
      {condOpen && (
        <div className="cond-list">
          {CONDITIONS.map((c) => (
            <button key={c.id} className={'cond' + (st.conditions.includes(c.id) ? ' on' : '')} onClick={() => safe(send({ t: 'cond', target: ch.build.id, cond: c.id, on: !st.conditions.includes(c.id) }))}>
              <b>{c.name}</b>
              <span className="small">{c.text}</span>
            </button>
          ))}
        </div>
      )}
      {st.exhaustion > 0 && <div className="notice">Exhaustion {st.exhaustion}: −{st.exhaustion * 2} to every d20 roll and −{st.exhaustion * 5} ft speed.</div>}
      {canEdit && (
        <div className="row gap wrap">
          <button className="ghost" onClick={() => safe(send({ t: 'hitDie', charId: ch.build.id }))}>Spend Hit Die (d{sh.hitDie}) · {ch.build.level - st.hitDiceUsed} left</button>
          <button className="ghost" onClick={() => safe(send({ t: 'rest', charId: ch.build.id, kind: 'short' }))}>Short rest</button>
          <button className="ghost" onClick={() => confirm('Take a long rest? This restores HP, slots and abilities.') && safe(send({ t: 'rest', charId: ch.build.id, kind: 'long' }))}>Long rest</button>
        </div>
      )}
    </div>
  );
}

function spellDamage(sp: Spell, charLevel: number, slot: number) {
  if (sp.level === 0) return charLevel >= 5 && sp.damage5 ? sp.damage5 : sp.damage;
  if (!sp.damage) return undefined;
  if (!sp.upcast || slot <= sp.level) return sp.damage;
  const extra = sp.upcast.replace(/^(\d*)d(\d+)$/, (_, n, s) => `${(n ? parseInt(n, 10) : 1) * (slot - sp.level)}d${s}`);
  return `${sp.damage}+${extra}`;
}

export function ActionsPanel({ ch, roll, send, canEdit, combat }: SheetProps & { combat?: { active: boolean; myTurn: boolean; inOrder: boolean; movedLeft?: number } }) {
  const sh = computeSheet(ch.build);
  const st = ch.state;
  const [adv, setAdv] = useState<Adv>('none');
  const [open, setOpen] = useState<string | null>(null);
  const id = ch.build.id;
  const slotsLeft = (lvl: number) => (sh.spell?.slots[lvl - 1] ?? 0) - (st.slotsUsed[lvl - 1] ?? 0);
  const useSlot = (lvl: number) => {
    const used = [...(sh.spell?.slots.map((_, i) => st.slotsUsed[i] ?? 0) ?? [])];
    used[lvl - 1] = (used[lvl - 1] ?? 0) + 1;
    return send({ t: 'charState', charId: id, patch: { slotsUsed: used } });
  };
  const cast = async (sp: Spell, slot: number) => {
    try {
      if (sp.level > 0) {
        if (slotsLeft(slot) <= 0) return toast(`No level ${slot} slots left.`, 'error');
        await useSlot(slot);
      }
      if (sp.conc) await send({ t: 'charState', charId: id, patch: { concentration: sp.name } });
      const dmg = spellDamage(sp, ch.build.level, slot);
      const lvlTxt = sp.level > 0 && slot > sp.level ? ` (level ${slot})` : '';
      if (sp.attack) {
        roll(d20Formula(sh.spell!.attack, adv), `${sp.name}${lvlTxt} attack`, dmg ? { attackDamage: dmg } : undefined);
      } else if (sp.save) {
        await send({ t: 'chat', text: `casts ${sp.name}${lvlTxt}: targets make a DC ${sh.spell!.dc} ${ABILITY_NAMES[sp.save]} save.` });
        if (dmg) roll(dmg, `${sp.name} damage (${sp.dmgType ?? ''})`);
      } else if (sp.heal) {
        const extra = sp.level > 0 && slot > sp.level ? `+${slot - sp.level}${sp.heal.replace(/^\d+/, '')}` : '';
        roll(`${sp.heal}${extra}${sp.healMod !== false ? fmtMod(sh.mods[sh.spell!.ability]) : ''}`, `${sp.name} healing`);
      } else {
        await send({ t: 'chat', text: `casts ${sp.name}${lvlTxt}.` });
        if (dmg) roll(dmg, `${sp.name} (${sp.dmgType ?? ''})`);
      }
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };
  const res = sh.resources;
  return (
    <div className="stack">
      {combat?.active && (
        <div className={'card turn-card' + (combat.myTurn ? ' mine' : '')}>
          {combat.inOrder ? (
            combat.myTurn ? (
              <>
                <b>It's your turn.</b> {combat.movedLeft !== undefined && <span className="muted">{combat.movedLeft} ft of movement left.</span>}
                <div className="muted small">You get one action, one bonus action, and your movement.</div>
                {canEdit && <button className="primary" onClick={() => safe(send({ t: 'endTurn' }))}>End my turn</button>}
              </>
            ) : (
              <span>Combat is on. Wait for your turn.</span>
            )
          ) : (
            canEdit && <button className="primary" onClick={() => safe(send({ t: 'initiative' }))}>Roll initiative ({fmtMod(sh.initiative)})</button>
          )}
        </div>
      )}
      <AdvToggle adv={adv} setAdv={setAdv} />
      <h3>Attacks</h3>
      {sh.attacks.map((a) => (
        <div key={a.name} className="card action">
          <div className="row between">
            <div>
              <b>{a.name}</b>
              <div className="muted small">{a.dmg} {a.type}{a.note ? ` · ${a.note}` : ''}</div>
              {a.mastery && <div className="small mastery" title={masteryText(a.mastery)}>Mastery: {a.mastery}. {masteryText(a.mastery)}</div>}
            </div>
            <div className="row gap">
              <button className="primary" onClick={() => roll(d20Formula(a.toHit, adv), `${a.name} attack`, { attackDamage: a.dmg, critRange: ch.build.classId === 'fighter' && ch.build.level >= 3 ? 19 : 20 })}>{fmtMod(a.toHit)}</button>
              <button className="ghost" onClick={() => roll(a.dmg, `${a.name} damage`)}>Dmg</button>
            </div>
          </div>
        </div>
      ))}
      {res.length > 0 && <h3>Abilities</h3>}
      {res.map((r) => (
        <div key={r.id} className="row between card">
          <div>
            <b>{r.name}</b> <span className="muted small">({r.reset} rest)</span>
          </div>
          <Pips max={r.max} used={st.resUsed[r.id] ?? 0} label={r.name} onChange={canEdit ? (used) => safe(send({ t: 'charState', charId: id, patch: { resUsed: { [r.id]: Math.min(r.max, used) } } })) : undefined} />
        </div>
      ))}
      {sh.spell && (
        <>
          <h3>Spells <span className="muted small">· Save DC {sh.spell.dc} · Attack {fmtMod(sh.spell.attack)}</span></h3>
          {sh.spell.slots.length > 0 && (
            <div className="row wrap gap">
              {sh.spell.slots.map((n, i) => (
                <span key={i} className="slot">
                  {sh.cls.caster === 'pact' ? `Pact (lvl ${sh.spell!.slots.length > 0 ? sh.spell!.maxLevel : 1})` : `Level ${i + 1}`} <Pips max={n} used={st.slotsUsed[i] ?? 0} label={`Level ${i + 1} slots`} onChange={canEdit ? (used) => { const arr = sh.spell!.slots.map((_, j) => st.slotsUsed[j] ?? 0); arr[i] = Math.min(n, used); safe(send({ t: 'charState', charId: id, patch: { slotsUsed: arr } })); } : undefined} />
                </span>
              ))}
            </div>
          )}
          {[...sh.spell.cantrips, ...sh.spell.prepared].map((sp) => {
            const minSlot = sp.level;
            const options = sp.level === 0 ? [0] : sh.spell!.slots.map((_, i) => i + 1).filter((l) => l >= minSlot);
            return (
              <div key={sp.id} className="card action">
                <button className="row between plain" onClick={() => setOpen(open === sp.id ? null : sp.id)}>
                  <span><b>{sp.name}</b> <span className="muted small">{sp.level === 0 ? 'Cantrip' : `Level ${sp.level}`}{sp.conc ? ' · Concentration' : ''}{sp.ritual ? ' · Ritual' : ''}</span></span>
                  <span className="muted small">{sp.time} · {sp.range}</span>
                </button>
                {open === sp.id && <p className="small">{sp.text}</p>}
                {canEdit && (
                  <div className="row gap wrap">
                    {options.map((l) => (
                      <button key={l} className={l === minSlot ? 'primary small' : 'ghost small'} disabled={l > 0 && slotsLeft(l) <= 0} onClick={() => cast(sp, l)}>
                        {l === 0 ? 'Cast' : l === minSlot ? `Cast (level ${l})` : `Upcast ${l}`}
                      </button>
                    ))}
                    {sp.damage && <span className="muted small">{spellDamage(sp, ch.build.level, Math.max(1, sp.level))} {sp.dmgType}</span>}
                    {sp.heal && <span className="muted small">Heals {sp.heal}{sp.healMod !== false ? ' + mod' : ''}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export function BagPanel({ ch, send, canEdit }: Pick<SheetProps, 'ch' | 'send' | 'canEdit'>) {
  const sh = computeSheet(ch.build);
  const st = ch.state;
  return (
    <div className="stack">
      <h3>Gear</h3>
      <div className="card">
        <div><b>Armor:</b> {ch.build.armor ? ch.build.armor.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()) : 'None'}{ch.build.shield ? ' + Shield' : ''} <span className="muted small">({sh.acNote})</span></div>
        <div><b>Weapons:</b> {sh.attacks.filter((a) => a.name !== 'Unarmed Strike').map((a) => a.name).join(', ') || 'None'}</div>
        <ul className="small">{ch.build.gear.map((g, i) => <li key={i}>{g}</li>)}</ul>
      </div>
      <div className="row between card">
        <b>Gold pieces</b>
        <span className="stepper">
          <button disabled={!canEdit} onClick={() => safe(send({ t: 'charState', charId: ch.build.id, patch: { coins: st.coins - 1 } }))} aria-label="Spend a gold piece">−</button>
          <span>{st.coins}</span>
          <button disabled={!canEdit} onClick={() => safe(send({ t: 'charState', charId: ch.build.id, patch: { coins: st.coins + 1 } }))} aria-label="Add a gold piece">+</button>
        </span>
      </div>
      <h3>Features</h3>
      {sh.features.map((f, i) => (
        <details key={i} className="card feature">
          <summary><b>{f.name}</b> <span className="muted small">{f.source}</span></summary>
          <p className="small">{f.text}</p>
        </details>
      ))}
      {ch.build.notes && (
        <>
          <h3>Notes</h3>
          <p className="card small pre">{ch.build.notes}</p>
        </>
      )}
    </div>
  );
}

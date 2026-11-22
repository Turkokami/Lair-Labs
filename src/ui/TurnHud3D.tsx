// The turn controls drawn over the 3D view on a player's phone: your HP and AC, feet left to move, who you're
// aiming at and how far away they are, your weapon attacks (with reach and long-range disadvantage worked out), and
// End turn. They send the same intents as the character sheet, so the GM's screen and the log see ordinary rolls.
import type { PlayerView } from '../engine/game';
import type { Character } from '../rules/character';
import { computeSheet } from '../rules/character';
import { fmtMod } from '../rules/core';
import { d20Formula } from '../engine/dice';
import type { RollFn } from './common';
import { gapFt, nearestFoe, weaponReach } from './targets';

export function TurnHud3D({ v, ch, target, setTarget, roll, endTurn, rollInit }: { v: PlayerView; ch: Character; target?: string; setTarget: (id: string | undefined) => void; roll: RollFn; endTurn: () => void; rollInit: () => void }) {
  const sh = computeSheet(ch.build);
  const myTurn = !!v.myTokenId && v.combat.current === v.myTokenId;
  const myToken = v.tokens.find((t) => t.id === v.myTokenId);
  const movedLeft = myToken && myTurn ? myToken.speed - myToken.movedFeet : undefined;
  const inOrder = v.combat.order.some((o) => o.isYou);
  // ----- the 3D view's turn controls: who you're aiming at, how far, your attacks, end turn -----
  const tgt = target ? v.tokens.find((t) => t.id === target && !t.hidden) : undefined;
  const tgtFt = tgt && myToken ? gapFt(myToken, tgt) : undefined;
  const reachOf = (name: string) => weaponReach(ch, name);
  const quick = sh.attacks.filter((a) => a.name !== 'Unarmed Strike').slice(0, 3);
  if (!quick.length) quick.push(...sh.attacks.slice(0, 1));
  const canAct = v.combat.active ? myTurn : !!tgt;
  const curName = v.combat.active ? v.combat.order.find((o) => o.tokenId === v.combat.current)?.name : undefined;
  return (
    <>
      {tgt && (
        <div className="v3d-chip target" onClick={() => setTarget(undefined)} role="button" title="Tap to clear">
          🎯 <b>{tgt.name}</b>
          {tgt.hpLabel ? ` · ${tgt.hpLabel}` : ''}
          {tgtFt !== undefined ? ` · ${tgtFt} ft` : ''} <span className="muted">✕</span>
        </div>
      )}
      <div className="v3d-chip">
        {ch.state.hp}/{sh.maxHp} HP · AC {sh.ac}
        {v.combat.active && myTurn && movedLeft !== undefined && (
          <>
            {' '}· <b>{movedLeft} ft</b> to move
          </>
        )}
      </div>
      {v.combat.active && !myTurn && inOrder && <div className="v3d-chip">{curName ? `${curName}’s turn` : 'Someone else’s turn'}</div>}
      {v.combat.active && !inOrder && (
        <div className="v3d-acts">
          <button className="end" onClick={rollInit}>
            Roll initiative
            <small>{fmtMod(sh.initiative)}</small>
          </button>
        </div>
      )}
      {canAct && (
        <div className="v3d-acts">
          {quick.map((a) => {
            const r = reachOf(a.name);
            const far = tgtFt !== undefined && tgtFt > r.near;
            const out = tgtFt !== undefined && tgtFt > r.far;
            const adv = far && !out && r.far > 5 ? 'dis' : 'none';
            return (
              <button
                key={a.name}
                disabled={out}
                onClick={() => {
                  // no one picked: swing at the nearest foe this weapon can reach
                  const aim = tgt ?? nearestFoe(v.tokens, myToken, r.far);
                  if (aim && !tgt) setTarget(aim.id);
                  const aimFt = aim && myToken ? gapFt(myToken, aim) : undefined;
                  const dis = aimFt !== undefined && aimFt > r.near && r.far > 5 ? 'dis' : 'none';
                  roll(d20Formula(a.toHit, dis), `${a.name} attack${aim ? ` vs ${aim.name}` : ''}${dis === 'dis' ? ' (long range)' : ''}`, {
                    attackDamage: a.dmg,
                    critRange: ch.build.classId === 'fighter' && ch.build.level >= 3 ? 19 : 20,
                    targetId: aim?.id,
                  });
                }}
              >
                {a.name}
                <small>{out ? 'Too far' : `${fmtMod(a.toHit)} · ${a.dmg}${adv === 'dis' ? ' · disadv.' : ''}`}</small>
              </button>
            );
          })}
          {v.combat.active && myTurn && (
            <button className="end" onClick={() => endTurn()}>
              End turn
            </button>
          )}
        </div>
      )}
    </>
  );
}

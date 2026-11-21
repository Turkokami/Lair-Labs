// The turn controls drawn over the 3D view on a player's phone: your HP and AC, feet left to move, who you're
// aiming at and how far away they are, your weapon attacks (with reach and long-range disadvantage worked out), and
// End turn. They send the same intents as the character sheet, so the GM's screen and the log see ordinary rolls.
import type { PlayerView } from '../engine/game';
import type { Character } from '../rules/character';
import { computeSheet } from '../rules/character';
import { fmtMod } from '../rules/core';
import { weaponById } from '../rules/equipment';
import { d20Formula } from '../engine/dice';
import type { RollFn } from './common';

export function TurnHud3D({ v, ch, target, setTarget, roll, endTurn }: { v: PlayerView; ch: Character; target?: string; setTarget: (id: string | undefined) => void; roll: RollFn; endTurn: () => void }) {
  const sh = computeSheet(ch.build);
  const myTurn = !!v.myTokenId && v.combat.current === v.myTokenId;
  const myToken = v.tokens.find((t) => t.id === v.myTokenId);
  const movedLeft = myToken && myTurn ? myToken.speed - myToken.movedFeet : undefined;
  const inOrder = v.combat.order.some((o) => o.isYou);
  // ----- the 3D view's turn controls: who you're aiming at, how far, your attacks, end turn -----
  const tgt = target ? v.tokens.find((t) => t.id === target && !t.hidden) : undefined;
  const gapFt = (a: { x: number; y: number; size: number }, b: { x: number; y: number; size: number }) => {
    const as = Math.max(1, a.size), bs = Math.max(1, b.size);
    const dx = Math.max(0, b.x - (a.x + as - 1), a.x - (b.x + bs - 1));
    const dy = Math.max(0, b.y - (a.y + as - 1), a.y - (b.y + bs - 1));
    return Math.max(dx, dy) * 5;
  };
  const tgtFt = tgt && myToken ? gapFt(myToken, tgt) : undefined;
  /** How far each attack reaches: melee 5 ft (10 with reach), ranged/thrown by the weapon's normal/long range. */
  const reachOf = (name: string) => {
    const w = ch.build.weapons.map(weaponById).find((x) => x?.name === name);
    if (!w) return { near: 5, far: 5 };
    if (w.range && (w.props.includes('ranged') || w.props.includes('thrown'))) {
      const [n, f] = w.range.split('/').map((x) => parseInt(x, 10));
      return { near: n || 5, far: f || n || 5, thrownMelee: !w.props.includes('ranged') };
    }
    const r = w.props.includes('reach') ? 10 : 5;
    return { near: r, far: r };
  };
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
                onClick={() =>
                  roll(d20Formula(a.toHit, adv), `${a.name} attack${tgt ? ` vs ${tgt.name}` : ''}${adv === 'dis' ? ' (long range)' : ''}`, {
                    attackDamage: a.dmg,
                    critRange: ch.build.classId === 'fighter' && ch.build.level >= 3 ? 19 : 20,
                  })
                }
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

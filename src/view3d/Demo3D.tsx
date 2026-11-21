// A self-running 3D demo at ?demo3d: the Sunken Crypt with two heroes and three undead, run by the real game engine
// (the same host code the GM's screen runs), seen from the fighter's phone. Add &auto=1 to play the scripted fight.
import { useEffect, useMemo, useRef, useState } from 'react';
import { HostCore, newGame, type Intent } from '../engine/game';
import { TEMPLATES, vKey } from '../engine/map';
import { premade, computeSheet, freshState } from '../rules/character';
import View3D, { type Cam } from './View3D';
import { toast } from '../ui/common';
import { TurnHud3D } from '../ui/TurnHud3D';

function setup() {
  const map = TEMPLATES.find((t) => t.id === 'crypt')!.make();
  map.ambient = 'dark';
  const core = new HostCore(newGame('DEMO3D', map));
  core.s.settings.lockMoves = true;
  core.s.settings.startLevel = 3;
  const hero = (pid: string, name: string, cls: string, x: number, y: number) => {
    core.handle(pid, { t: 'hello', name, clientId: pid });
    const b = premade(cls, 3);
    core.handle(pid, { t: 'saveChar', character: { build: b, state: freshState(b) } } as Intent);
    const t = core.s.tokens.find((k) => k.charId === b.id)!;
    core.handle('gm', { t: 'gm:tokenPatch', tokenId: t.id, patch: { x, y, light: { bright: 20, dim: 20 } } });
    return t.id;
  };
  const fighter = hero('p1', 'Sam', 'fighter', 4, 11);
  const cleric = hero('p2', 'Jo', 'cleric', 3, 12);
  core.handle('gm', { t: 'gm:addMonster', monsterId: 'skeleton', x: 17, y: 10 });
  core.handle('gm', { t: 'gm:addMonster', monsterId: 'skeleton', x: 18, y: 12 });
  core.handle('gm', { t: 'gm:addMonster', monsterId: 'zombie', x: 20, y: 11 });
  const mons = core.s.tokens.filter((t) => t.kind === 'monster').map((t) => t.id);
  void computeSheet;
  return { core, fighter, cleric, mons };
}

export default function Demo3D() {
  const g = useMemo(setup, []);
  const [, setTick] = useState(0);
  const [cam, setCam] = useState<Cam>('shoulder');
  const [caption, setCaption] = useState('The Sunken Crypt, seen from Garrick the fighter’s phone');
  const busy = useRef(false);
  const [target, setTarget] = useState<string | undefined>();
  const view = g.core.view('p1');
  const bump = () => setTick((n) => n + 1);
  const act = (from: string, it: Intent) => {
    try {
      g.core.handle(from, it);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
    bump();
  };

  const run = async () => {
    if (busy.current) return;
    busy.current = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const walk = async (from: string, id: string, pts: [number, number][], ms = 420) => {
      for (const [x, y] of pts) {
        act(from, { t: 'move', tokenId: id, x, y });
        await wait(ms);
      }
    };
    const [s1, s2, z] = g.mons;
    setCaption('Walk with the arrow pad or tap a square');
    await wait(1500);
    await walk('p1', g.fighter, [[5, 11], [6, 11], [7, 11]]);
    setCaption('Tap a door to open it');
    await wait(500);
    act('p1', { t: 'door', key: vKey(8, 11) });
    await wait(1400);
    await walk('p1', g.fighter, [[8, 11], [9, 11], [10, 11], [11, 11], [12, 11], [13, 11]]);
    await walk('p2', g.cleric, [[6, 12], [9, 11], [12, 11]], 300);
    setCaption('Three undead rise in the flooded chapel');
    await wait(1600);
    act('gm', { t: 'gm:startCombat', tokenIds: [g.fighter, g.cleric] });
    act('gm', { t: 'gm:setInit', tokenId: g.fighter, init: 19 });
    act('gm', { t: 'gm:setInit', tokenId: s1, init: 15 });
    act('gm', { t: 'gm:setInit', tokenId: g.cleric, init: 12 });
    act('gm', { t: 'gm:setInit', tokenId: s2, init: 9 });
    act('gm', { t: 'gm:setInit', tokenId: z, init: 4 });
    setCaption('Combat: the same initiative and 30 ft of movement as the map');
    await wait(2000);
    await walk('p1', g.fighter, [[14, 11], [15, 10], [16, 10]]);
    setTarget(s1);
    setCaption('Tap a foe to aim: range and attacks show on your turn');
    await wait(2200);
    setCaption('Garrick attacks the skeleton');
    act('p1', { t: 'roll', formula: '1d20+5', label: 'Longsword attack vs Skeleton', attackDamage: '1d8+3' } as Intent);
    await wait(900);
    act('gm', { t: 'gm:damage', targets: [s1], amount: 8 });
    await wait(1600);
    act('gm', { t: 'gm:nextTurn' });
    setCaption('The skeleton strikes back');
    act('gm', { t: 'roll', formula: '1d20+4', label: 'Shortsword attack', attackDamage: '1d6+2' } as Intent);
    await wait(900);
    act('gm', { t: 'gm:damage', targets: [g.fighter], amount: 5 });
    await wait(1600);
    act('gm', { t: 'gm:nextTurn' });
    setCaption('Sister Oriel moves up');
    await walk('p2', g.cleric, [[13, 11], [14, 11], [15, 11]]);
    await wait(500);
    act('gm', { t: 'gm:nextTurn' });
    await walk('gm', s2, [[17, 12], [16, 11]]);
    act('gm', { t: 'roll', formula: '1d20+4', label: 'Shortsword attack', attackDamage: '1d6+2' } as Intent);
    await wait(900);
    act('gm', { t: 'gm:damage', targets: [g.cleric], amount: 4 });
    await wait(1400);
    act('gm', { t: 'gm:nextTurn' });
    await walk('gm', z, [[19, 11], [18, 11]], 600);
    await wait(600);
    act('gm', { t: 'gm:nextTurn' });
    setCam('first');
    setCaption('Eyes view: Garrick’s turn again');
    await wait(1800);
    act('p1', { t: 'roll', formula: '1d20+5', label: 'Longsword attack vs Skeleton', attackDamage: '1d8+3' } as Intent);
    await wait(900);
    act('gm', { t: 'gm:damage', targets: [s1], amount: 11 });
    setCaption('The skeleton falls');
    await wait(2600);
    setTarget(undefined);
    setCam('table');
    setCaption('Table view: the whole room at once');
    await wait(4000);
    setCam('shoulder');
    setCaption('Lair Labs 3D: build on the map, play in 3D');
    busy.current = false;
  };

  useEffect(() => {
    (window as unknown as { __demo: unknown }).__demo = { run, setCam, core: g.core, act, g, setTarget };
    if (new URLSearchParams(location.search).get('auto') === '1') setTimeout(run, 2500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const me = view.tokens.find((t) => t.id === view.myTokenId);
  const myTurn = view.combat.current === view.myTokenId;
  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="v3d-caption">{caption}</div>
      <View3D
        map={view.map}
        role="player"
        tokens={view.tokens}
        myTokenId={view.myTokenId}
        currentTokenId={view.combat.current}
        visible={view.visible}
        lit={view.lit}
        revealed={view.revealed}
        combatActive={view.combat.active}
        speedLeft={me && myTurn ? me.speed - me.movedFeet : undefined}
        log={view.log}
        cam={cam}
        targetId={target}
        hud={view.myCharacter ? <TurnHud3D v={view} ch={view.myCharacter} target={target} setTarget={setTarget} roll={(formula, label, opts) => Promise.resolve(act('p1', { t: 'roll', formula, label, ...opts } as Intent))} endTurn={() => act('p1', { t: 'endTurn' })} /> : undefined}
        canMove={(t) => t.id === view.myTokenId && (!view.combat.active || myTurn)}
        onMove={(id, x, y) => act('p1', { t: 'move', tokenId: id, x, y })}
        onTap={(info) => {
          if (info.edge && view.map.doors[info.edge]) act('p1', { t: 'door', key: info.edge });
          else if (info.tokenId) {
            const t = view.tokens.find((k) => k.id === info.tokenId);
            if (t && t.id !== view.myTokenId) setTarget((c) => (c === t.id ? undefined : t.id));
          }
        }}
      />
      <div className="v3d-demo-bar">
        <button className="small" onClick={run}>Play the demo fight</button>
        <a className="small" href={location.pathname}>Open Lair Labs</a>
      </div>
    </div>
  );
}

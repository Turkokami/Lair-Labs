// A self-running 3D demo at ?demo3d: the Sunken Crypt with two heroes and three undead, run by the real game engine
// (the same host code the GM's screen runs), seen from the fighter's phone. Add &auto=1 to play the scripted fight.
import { useEffect, useMemo, useRef, useState } from 'react';
import { HostCore, newGame, type Intent } from '../engine/game';
import { TEMPLATES, vKey } from '../engine/map';
import { premade, computeSheet, freshState } from '../rules/character';
import View3D, { type Cam } from './View3D';
import { toast } from '../ui/common';
import { TurnHud3D } from '../ui/TurnHud3D';

/** Where the heroes stand when a starter map is opened for a walk-through with ?demo3d&map=<id>. */
const TOUR_START: Record<string, [number, number]> = { crypt: [8, 22], 'great-hall': [28, 40], tavern: [12, 14], warren: [6, 26] };

function setup() {
  const tour = new URLSearchParams(location.search).get('map') ?? '';
  const tpl = TEMPLATES.find((t) => t.id === (TOUR_START[tour] ? tour : 'crypt'))!;
  const map = tpl.make();
  map.ambient = tour && tour !== 'crypt' ? 'dim' : 'dark';
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
  const [sx, sy] = TOUR_START[tour] ?? TOUR_START.crypt;
  const fighter = hero('p1', 'Sam', 'fighter', sx, sy);
  const cleric = hero('p2', 'Jo', 'cleric', sx - 2, sy + 2);
  if (tour && tour !== 'crypt') return { core, fighter, cleric, mons: [] as string[], name: tpl.name };
  core.handle('gm', { t: 'gm:addMonster', monsterId: 'skeleton', x: 31, y: 20 });
  core.handle('gm', { t: 'gm:addMonster', monsterId: 'skeleton', x: 33, y: 24 });
  core.handle('gm', { t: 'gm:addMonster', monsterId: 'zombie', x: 36, y: 22 });
  const mons = core.s.tokens.filter((t) => t.kind === 'monster').map((t) => t.id);
  void computeSheet;
  return { core, fighter, cleric, mons, name: tpl.name };
}

export default function Demo3D() {
  const g = useMemo(setup, []);
  const [, setTick] = useState(0);
  const [cam, setCam] = useState<Cam>('shoulder');
  const [caption, setCaption] = useState(`${g.name}, seen from Garrick the fighter’s phone`);
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
    const turn = async (dir: 'left' | 'right', n = 1) => {
      for (let i = 0; i < n; i++) {
        (document.querySelector(`[aria-label="Turn ${dir}"]`) as HTMLButtonElement | null)?.click();
        await wait(450);
      }
    };
    if (!g.mons.length) {
      // a walk through a starter map (?demo3d&map=great-hall&auto=1)
      const line = (x: number, y0: number, y1: number) => Array.from({ length: Math.abs(y1 - y0) }, (_, i) => [x, y0 + Math.sign(y1 - y0) * (i + 1)] as [number, number]);
      const row = (y: number, x0: number, x1: number) => Array.from({ length: Math.abs(x1 - x0) }, (_, i) => [x0 + Math.sign(x1 - x0) * (i + 1), y] as [number, number]);
      setCaption(`${g.name}: 24 ft ceilings, a hall 100 ft across`);
      await wait(2200);
      setCaption('Walk in through the gatehouse');
      await walk('p1', g.fighter, line(28, 40, 30), 380);
      setCam('first');
      setCaption('Eyes view: chandeliers hang from the ceiling on chains');
      await walk('p1', g.fighter, line(28, 30, 24), 450);
      await wait(1200);
      setCaption('Pillars, feast tables and a throne at the far end');
      await turn('left', 1);
      await wait(1400);
      await turn('right', 2);
      await wait(1400);
      await turn('left', 1);
      await walk('p1', g.fighter, line(28, 24, 16), 420);
      await wait(1200);
      setCam('shoulder');
      setCaption('Through the side doors to the library');
      await walk('p1', g.fighter, row(20, 28, 15), 380);
      act('p1', { t: 'door', key: vKey(15, 20) });
      act('p1', { t: 'door', key: vKey(15, 21) });
      await wait(1200);
      await walk('p1', g.fighter, row(20, 15, 9), 380);
      await wait(800);
      setCam('first');
      await turn('right', 2);
      await wait(1600);
      await turn('left', 4);
      await wait(1600);
      setCam('table');
      setCaption('Table view: see over the tall walls into each room');
      await wait(4000);
      setCam('shoulder');
      setCaption('Lair Labs 3D: build on the map, play in 3D');
      busy.current = false;
      return;
    }
    const [s1, s2, z] = g.mons;
    setCaption('Walk with the arrow pad or tap a square');
    await wait(1500);
    await walk('p1', g.fighter, [[10, 22], [12, 22], [14, 22], [15, 22]]);
    setCaption('Tap a door to open it');
    await wait(500);
    act('p1', { t: 'door', key: vKey(16, 22) });
    act('p1', { t: 'door', key: vKey(16, 23) });
    await wait(1400);
    await walk('p1', g.fighter, [[17, 22], [19, 22], [21, 22], [23, 22], [25, 22], [26, 22]]);
    await walk('p2', g.cleric, [[10, 24], [14, 23], [18, 23], [22, 23], [24, 23]], 300);
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
    await walk('p1', g.fighter, [[28, 21], [30, 20]]);
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
    await walk('p2', g.cleric, [[26, 23], [28, 22], [30, 21]]);
    await wait(500);
    act('gm', { t: 'gm:nextTurn' });
    await walk('gm', s2, [[32, 23], [31, 22]]);
    act('gm', { t: 'roll', formula: '1d20+4', label: 'Shortsword attack', attackDamage: '1d6+2' } as Intent);
    await wait(900);
    act('gm', { t: 'gm:damage', targets: [g.cleric], amount: 4 });
    await wait(1400);
    act('gm', { t: 'gm:nextTurn' });
    await walk('gm', z, [[34, 22], [32, 21]], 600);
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

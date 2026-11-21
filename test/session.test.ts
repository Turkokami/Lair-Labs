import { describe, it, expect } from 'vitest';
import { MemoryHub } from '../src/net/transport';
import { HostSession, ClientSession } from '../src/net/session';
import { newGame } from '../src/engine/game';
import { TEMPLATES, hKey, vKey } from '../src/engine/map';
import { premade, freshState } from '../src/rules/character';

const tick = (ms = 80) => new Promise((r) => setTimeout(r, ms));

async function table() {
  const hub = new MemoryHub();
  const map = TEMPLATES.find((t) => t.id === 'crypt')!.make();
  const host = new HostSession(newGame('K7Q4MX', map), hub.makeHost(), 5);
  await host.start();
  const phone = (name: string, id: string) => new ClientSession('K7Q4MX', name, id, hub.makeClient());
  return { hub, host, phone };
}

describe('join flow with two phones', () => {
  it('both phones join, build heroes, and see each other', async () => {
    const { host, phone } = await table();
    const a = phone('Avery', 'client-aaaaaa');
    const b = phone('Blake', 'client-bbbbbb');
    await a.start();
    await b.start();
    await tick();
    expect(Object.keys(host.core.s.players)).toHaveLength(2);
    expect(a.view?.players.map((p) => p.name).sort()).toEqual(['Avery', 'Blake']);

    const fighter = premade('fighter', 1);
    const wizard = premade('wizard', 1);
    await a.send({ t: 'saveChar', character: { build: fighter, state: freshState(fighter) } });
    await b.send({ t: 'saveChar', character: { build: wizard, state: freshState(wizard) } });
    await tick();
    expect(a.view?.myCharacter?.build.classId).toBe('fighter');
    expect(b.view?.myCharacter?.build.classId).toBe('wizard');
    expect(a.view?.party).toHaveLength(2);
    expect(a.view?.tokens.filter((t) => t.kind === 'pc')).toHaveLength(2);
  });

  it('a phone cannot move someone else or use GM powers', async () => {
    const { host, phone } = await table();
    const a = phone('Avery', 'client-aaaaaa');
    const b = phone('Blake', 'client-bbbbbb');
    await a.start();
    await b.start();
    const f = premade('fighter', 1), r = premade('rogue', 1);
    await a.send({ t: 'saveChar', character: { build: f, state: freshState(f) } });
    await b.send({ t: 'saveChar', character: { build: r, state: freshState(r) } });
    await tick();
    const bTok = host.core.tokenForChar(r.id)!;
    await expect(a.send({ t: 'move', tokenId: bTok.id, x: bTok.x + 1, y: bTok.y })).rejects.toThrow(/own hero/);
    await expect(a.send({ t: 'gm:revealAll', on: true } as never)).rejects.toThrow(/Only the GM/);
    await expect(a.send({ t: 'saveChar', character: { build: r, state: freshState(r) } })).rejects.toThrow(/isn't your character/);
  });

  it('fog, hidden monsters, GM notes, secret and locked doors stay hidden from phones', async () => {
    const { host, phone } = await table();
    const a = phone('Avery', 'client-aaaaaa');
    await a.start();
    const f = premade('fighter', 1);
    await a.send({ t: 'saveChar', character: { build: f, state: freshState(f) } });
    host.gm({ t: 'gm:addMonster', monsterId: 'wight', x: 29, y: 12, hidden: true });
    await tick();
    const v = a.view!;
    const s = host.core.s;
    expect(v.map.notes).toHaveLength(0);
    expect(v.map.props.some((p) => p.gmOnly)).toBe(false);
    expect(v.tokens.some((t) => t.kind === 'monster')).toBe(false);
    expect(Object.values(v.map.doors)).not.toContain('secret');
    expect(Object.values(v.map.doors)).not.toContain('locked');
    const hiddenCells = v.map.cells.filter((c, i) => c === -1 && s.map.cells[i] > 0).length;
    expect(hiddenCells).toBeGreaterThan(50);
    // GM sees everything
    const g = host.core.view('gm');
    expect(g.map.notes.length).toBeGreaterThan(0);
    expect(g.tokens.some((t) => t.kind === 'monster')).toBe(true);
  });

  it('runs initiative and turns, with your-turn notices', async () => {
    const { host, phone } = await table();
    const a = phone('Avery', 'client-aaaaaa');
    const b = phone('Blake', 'client-bbbbbb');
    const notices: string[] = [];
    a.onNotice = (t) => notices.push('a:' + t);
    b.onNotice = (t) => notices.push('b:' + t);
    await a.start();
    await b.start();
    const f = premade('fighter', 1), c = premade('cleric', 1);
    await a.send({ t: 'saveChar', character: { build: f, state: freshState(f) } });
    await b.send({ t: 'saveChar', character: { build: c, state: freshState(c) } });
    host.gm({ t: 'gm:addMonster', monsterId: 'goblin', x: 10, y: 10, count: 2 });
    expect(host.gm({ t: 'gm:startCombat' })).toBeUndefined();
    await a.send({ t: 'initiative' });
    await b.send({ t: 'initiative' });
    await tick();
    expect(host.core.s.combat.order).toHaveLength(4);
    expect(a.view?.combat.active).toBe(true);
    // walk the whole round
    for (let i = 0; i < 4; i++) {
      const cur = host.core.currentTokenId()!;
      const tok = host.core.s.tokens.find((t) => t.id === cur)!;
      if (tok.charId === f.id) await a.send({ t: 'endTurn' });
      else if (tok.charId === c.id) await b.send({ t: 'endTurn' });
      else host.gm({ t: 'gm:nextTurn' });
    }
    await tick();
    expect(host.core.s.combat.round).toBe(2);
    expect(notices.filter((n) => n.endsWith('your-turn')).length).toBeGreaterThanOrEqual(1);
  });

  it('damage, dying and death saves work', async () => {
    const { host, phone } = await table();
    const a = phone('Avery', 'client-aaaaaa');
    await a.start();
    const w = premade('wizard', 1);
    await a.send({ t: 'saveChar', character: { build: w, state: freshState(w) } });
    const tok = host.core.tokenForChar(w.id)!;
    host.gm({ t: 'gm:damage', targets: [tok.id], amount: tok.maxHp });
    const st = host.core.s.characters[w.id].state;
    expect(st.hp).toBe(0);
    expect(st.conditions).toContain('unconscious');
    for (let i = 0; i < 10 && !st.dead && !st.stable && st.hp === 0; i++) await a.send({ t: 'deathSave' });
    expect(st.dead || st.stable || st.hp === 1).toBe(true);
  });

  it('doors: players open nearby ones, locked stays shut, and a reconnect keeps the hero', async () => {
    const { host, phone } = await table();
    const a = phone('Avery', 'client-aaaaaa');
    await a.start();
    const f = premade('fighter', 1);
    await a.send({ t: 'saveChar', character: { build: f, state: freshState(f) } });
    const doors = host.core.s.map.doors;
    const closed = Object.keys(doors).find((k) => doors[k] === 'closed')!;
    await expect(a.send({ t: 'door', key: closed })).rejects.toThrow(/next to the door/);
    // GM drops the hero next to the door
    const [kind, rest] = closed.split(':');
    const [x, y] = rest.split(',').map(Number);
    host.gm({ t: 'gm:tokenPatch', tokenId: host.core.tokenForChar(f.id)!.id, patch: kind === 'h' ? { x, y } : { x, y } });
    await a.send({ t: 'door', key: closed });
    expect(host.core.s.map.doors[closed]).toBe('open');
    // drop and come back with the same client id
    a.stop();
    await tick();
    expect(host.core.s.players['client-aaaaaa'].connected).toBe(false);
    const a2 = phone('Avery', 'client-aaaaaa');
    await a2.start();
    await tick();
    expect(a2.view?.myCharacter?.build.id).toBe(f.id);
    expect(host.core.s.players['client-aaaaaa'].connected).toBe(true);
    void hKey; void vKey;
  });

  it('blind rolls hide the result from the roller', async () => {
    const { host, phone } = await table();
    const a = phone('Avery', 'client-aaaaaa');
    const b = phone('Blake', 'client-bbbbbb');
    await a.start();
    await b.start();
    await a.send({ t: 'roll', formula: '1d20+3', label: 'Insight', visibility: 'blind' });
    await a.send({ t: 'roll', formula: '1d20', label: 'Stealth', visibility: 'gm' });
    await tick();
    const mine = a.view!.log.filter((e) => e.kind === 'roll');
    expect(mine).toHaveLength(1);
    expect(mine[0].roll).toBeUndefined();
    expect(b.view!.log.filter((e) => e.kind === 'roll')).toHaveLength(0);
    expect(host.core.view('gm').log.filter((e) => e.kind === 'roll')).toHaveLength(2);
  });

  it('locked table refuses new players', async () => {
    const { host, phone } = await table();
    host.gm({ t: 'gm:settings', patch: { locked: true } });
    const a = phone('Avery', 'client-aaaaaa');
    await a.start().catch(() => {});
    await tick();
    expect(a.status).toBe('kicked');
  });
});

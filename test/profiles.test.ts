import { describe, it, expect } from 'vitest';
import { MemoryHub } from '../src/net/transport';
import { HostSession, ClientSession } from '../src/net/session';
import { newGame } from '../src/engine/game';
import { TEMPLATES } from '../src/engine/map';
import { premade, freshState } from '../src/rules/character';

const tick = (ms = 80) => new Promise((r) => setTimeout(r, ms));
// a 1x1 transparent png
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

async function table() {
  const hub = new MemoryHub();
  const map = TEMPLATES.find((t) => t.id === 'crypt')!.make();
  const host = new HostSession(newGame('P7Q4MX', map), hub.makeHost(), 5);
  await host.start();
  const phone = (name: string, id: string) => new ClientSession('P7Q4MX', name, id, hub.makeClient());
  const a = phone('Avery', 'client-aaaaaa');
  const b = phone('Blake', 'client-bbbbbb');
  await a.start();
  await b.start();
  const f = premade('fighter', 1), w = premade('wizard', 1);
  await a.send({ t: 'saveChar', character: { build: f, state: freshState(f) } });
  await b.send({ t: 'saveChar', character: { build: w, state: freshState(w) } });
  await tick();
  return { host, a, b, f, w };
}

describe('character profiles', () => {
  it('a player writes their own hero profile and the table reads it, secrets stay private', async () => {
    const { host, a, b, f } = await table();
    await a.send({ t: 'profile:save', profile: { id: f.id, title: 'Shield of Brightwater', info: { age: '27', hair: 'red' }, story: { backstory: 'Raised by the river guard.' }, secrets: 'Owes the thieves guild 200 gp.', gmNotes: 'sneaky', shared: true } as never });
    await tick();
    const mine = a.profiles[f.id];
    expect(mine.title).toBe('Shield of Brightwater');
    expect(mine.story.backstory).toContain('river guard');
    expect(mine.secrets).toContain('thieves');
    expect(mine.gmNotes).toBeUndefined(); // players can't write GM notes
    const theirs = b.profiles[f.id];
    expect(theirs.info.age).toBe('27');
    expect(theirs.secrets).toBeUndefined();
    expect(host.core.s.profiles![f.id].secrets).toContain('thieves');
  });

  it("a player can't edit someone else's profile; the GM can edit any", async () => {
    const { host, a, w } = await table();
    await expect(a.send({ t: 'profile:save', profile: { id: w.id, title: 'Fool' } })).rejects.toThrow(/isn't your character/);
    expect(host.gm({ t: 'profile:save', profile: { id: w.id, title: 'Archmage-to-be', gmNotes: 'is secretly royal' } })).toBeUndefined();
    await tick();
    expect(a.profiles[w.id].title).toBe('Archmage-to-be');
    expect(a.profiles[w.id].gmNotes).toBeUndefined();
  });

  it('pictures upload from a phone, stay out of the view, and only reach phones allowed to see them', async () => {
    const { host, a, b, f } = await table();
    await a.send({ t: 'profile:image', profileId: f.id, data: PNG, slot: 'portrait' });
    await a.send({ t: 'profile:image', profileId: f.id, data: PNG, slot: 'gallery', caption: 'At the harvest fair' });
    await tick();
    const p = b.profiles[f.id];
    expect(p.portrait).toMatch(/^im_/);
    expect(p.gallery[0].caption).toBe('At the harvest fair');
    expect(JSON.stringify(b.view)).not.toContain('base64');
    // a second profile picture: the first one moves to the gallery, and the new one isn't duplicated there
    await a.send({ t: 'profile:image', profileId: f.id, data: PNG, slot: 'portrait' });
    await tick();
    const p2 = b.profiles[f.id];
    expect(p2.portrait).not.toBe(p.portrait);
    expect(p2.gallery.map((g) => g.id)).toEqual([p.portrait, p.gallery[0].id]);
    expect(p2.gallery.some((g) => g.id === p2.portrait)).toBe(false);
    await a.send({ t: 'profile:dropImage', profileId: f.id, imageId: p.portrait! });
    b.requestImages([p2.portrait!, p.gallery[0].id, p.portrait!, 'im_notreal1']);
    await tick();
    expect(b.images.get(p2.portrait!)).toBe(PNG);
    expect(b.images.has(p.portrait!)).toBe(false); // taken off the profile, so no longer sent
    expect(b.images.has('im_notreal1')).toBe(false);
    await expect(a.send({ t: 'profile:image', profileId: f.id, data: 'data:text/html;base64,PGI+', slot: 'gallery' })).rejects.toThrow(/picture/);
    // removing a picture
    await a.send({ t: 'profile:dropImage', profileId: f.id, imageId: p.gallery[0].id });
    await tick();
    expect(b.profiles[f.id].gallery).toHaveLength(0);
    expect(b.profiles[f.id].portrait).toBe(p2.portrait);
    expect(host.core.images.size).toBe(3);
  });

  it('GM profiles for NPCs and monsters are hidden until shared, stats separately', async () => {
    const { host, a } = await table();
    host.gm({ t: 'gm:addMonster', monsterId: 'goblin', x: 2, y: 2 });
    const gob = host.core.s.tokens.find((t) => t.kind === 'monster')!;
    expect(host.gm({ t: 'gm:linkProfile', tokenId: gob.id })).toBeUndefined();
    const pid = host.core.s.tokens.find((t) => t.id === gob.id)!.profileId!;
    const prof = host.core.s.profiles![pid];
    expect(prof.kind).toBe('monster');
    expect(prof.stats?.abilities).toHaveLength(6);
    expect(prof.stats?.actions).toBeTruthy();
    await tick();
    expect(a.profiles[pid]).toBeUndefined();
    host.gm({ t: 'profile:save', profile: { ...prof, story: { backstory: 'Snig, runt of the Red Fang.' }, secrets: 'Knows the back way in.', shared: true } });
    await tick();
    expect(a.profiles[pid].story.backstory).toContain('Snig');
    expect(a.profiles[pid].stats).toBeUndefined();
    expect(a.profiles[pid].secrets).toBeUndefined();
    await expect(a.send({ t: 'profile:save', profile: { id: pid, title: 'x' } })).rejects.toThrow(/Only the GM/);
    host.gm({ t: 'profile:save', profile: { ...host.core.s.profiles![pid], shareStats: true } });
    await tick();
    expect(a.profiles[pid].stats?.abilities).toHaveLength(6);
    // a standalone NPC, then deleted
    host.gm({ t: 'gm:newProfile', name: 'Mother Ilse', id: 'pf_ilse0001' });
    expect(host.core.s.profiles!.pf_ilse0001.kind).toBe('npc');
    host.gm({ t: 'gm:deleteProfile', profileId: pid });
    expect(host.core.s.tokens.find((t) => t.id === gob.id)!.profileId).toBeUndefined();
  });
});

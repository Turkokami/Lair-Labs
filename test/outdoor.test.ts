import { describe, expect, it } from 'vitest';
import { BIOMES, OUTDOOR_SIZES, outdoorMap, carvePath, PATH_KINDS } from '../src/engine/outdoor';
import { SCATTER_SETS, GROUND_MIX, paintGround, scatterProps, clearProps, brushDisc } from '../src/engine/terrainTools';
import { RULE_CELL, TERRAINS, terrainById } from '../src/library/terrain';
import { objectById } from '../src/library/objects';
import { blankMap, setCells } from '../src/engine/map';

describe('outdoor map maker', () => {
  it('makes every biome at every size, deterministic by seed', () => {
    for (const b of BIOMES)
      for (const size of ['small', 'medium', 'large'] as const) {
        const m = outdoorMap(b.id, size, 42);
        const [c, r] = OUTDOOR_SIZES[size][b.id === 'region' ? 'region' : 'battle'];
        expect([m.cols, m.rows]).toEqual([c, r]);
        expect(m.cells.length).toBe(c * r);
        expect(m.mats!.every((id) => !id || terrainById(id))).toBe(true);
        expect(m.props.every((p) => objectById(p.kind))).toBe(true);
        expect(m.props.length).toBeGreaterThan(10);
        expect(m.playerStart).toBeTruthy();
        expect(JSON.stringify(outdoorMap(b.id, size, 42).props.map((p) => [p.kind, p.x, p.y]))).toBe(JSON.stringify(m.props.map((p) => [p.kind, p.x, p.y])));
      }
  });
  it('builds huge maps quickly, the region map included', () => {
    for (const b of ['jungle', 'region'] as const) {
      const t = Date.now();
      const m = outdoorMap(b, 'huge', 7);
      expect(m.cols * m.rows).toBe(b === 'region' ? 160 * 120 : 200 * 150);
      expect(Date.now() - t).toBeLessThan(4000);
    }
  });
  it('sets each preset\'s light', () => {
    expect(outdoorMap('fungus', 'small', 3).ambient).toBe('dim');
    expect(outdoorMap('jungle', 'small', 3).ambient).toBe('bright');
    expect(outdoorMap('fungus', 'small', 3).props.some((p) => objectById(p.kind)?.light)).toBe(true);
  });
  it('every ground has a cell rule that matches', () => {
    const m = outdoorMap('swamp', 'small', 9);
    m.mats!.forEach((id, i) => { if (id) expect(m.cells[i] === RULE_CELL[terrainById(id)!.rule] || m.cells[i] === 1).toBe(true); });
  });
});

describe('outdoor brushes', () => {
  const grassy = () => {
    const m = setCells(blankMap(30, 20, 't'), Array.from({ length: 600 }, (_, i) => [i % 30, Math.floor(i / 30)] as [number, number]), 1);
    return paintGround(m, Array.from({ length: 600 }, (_, i) => [i % 30, Math.floor(i / 30)] as [number, number]), 'grass');
  };
  it('paints ground with its rule, and mixes cousins', () => {
    let m = grassy();
    m = paintGround(m, brushDisc(10, 10, 5, m.cols, m.rows), 'water-shallow');
    expect(m.mats![10 * 30 + 10]).toBe('water-shallow');
    expect(m.cells[10 * 30 + 10]).toBe(2);
    const big = paintGround(m, Array.from({ length: 600 }, (_, i) => [i % 30, Math.floor(i / 30)] as [number, number]), 'grass', true, 5);
    expect(new Set(big.mats).size).toBeGreaterThan(1);
    for (const fam of Object.values(GROUND_MIX)) for (const id of fam) expect(terrainById(id)).toBeTruthy();
  });
  it('every terrain and scatter set points at real things', () => {
    for (const t of TERRAINS) expect(RULE_CELL[t.rule]).toBeTruthy();
    for (const set of SCATTER_SETS) for (const [k] of set.kinds) expect(objectById(k), k).toBeTruthy();
  });
  it('scatters without stacking, then clears', () => {
    const m = grassy();
    const cells = brushDisc(15, 10, 15, m.cols, m.rows);
    const s = scatterProps(m, cells, SCATTER_SETS[0].kinds, 0.4, 3);
    expect(s.props.length).toBeGreaterThan(5);
    const again = scatterProps(s, cells, [['boulder-large', 1]], 1, 4);
    // big rocks never land on another thing's footprint
    for (const p of again.props.filter((p) => p.kind === 'boulder-large'))
      for (const q of s.props) if (objectById(q.kind)?.layer !== 'overhead') expect(p.x === q.x && p.y === q.y).toBe(false);
    expect(clearProps(s, cells).props.length).toBe(0);
  });
  it('carves roads with bridges and rivers with banks', () => {
    let m = grassy();
    m = carvePath(m, [[0.5, 10.5], [29.5, 10.5]], 'river', 4, 1);
    expect(m.cells.filter((v) => v === 2).length).toBeGreaterThan(60);
    m = carvePath(m, [[15.5, 0.5], [15.5, 19.5]], 'road', 2, 1);
    expect(m.props.some((p) => p.kind.startsWith('bridge'))).toBe(true);
    expect(m.mats!.includes('road-dirt')).toBe(true);
    for (const k of PATH_KINDS) expect(carvePath(grassy(), [[2.5, 2.5], [20.5, 15.5]], k.id, k.width, 2).mats!.some((id) => id !== 'grass')).toBe(true);
  });
});

describe('packing views for phones', () => {
  it('round-trips a big map and leaves it out when unchanged', async () => {
    const { packView, unpackView } = await import('../src/net/pack');
    const m = outdoorMap('forest', 'huge', 5);
    const view = { code: 'X', you: 'p', role: 'player', map: m, revealed: [5, 3, 4, 100, 101], tokens: [], players: [], party: [], log: [], combat: { active: false, round: 0, order: [] }, settings: {}, curtain: false, version: 1, visible: [1, 2, 3], lit: '0012', templates: [], safety: {} } as never;
    const a = packView(view);
    const size = JSON.stringify(a.wire).length;
    expect(size).toBeLessThan(JSON.stringify(view).length / 3);
    const back = unpackView(a.wire)!;
    expect(back.map.cells).toEqual(m.cells);
    expect(back.map.mats).toEqual(m.mats);
    expect(back.revealed).toEqual([3, 4, 5, 100, 101]);
    expect(back.lit).toBe('0012');
    const b = packView(view, a.mapText);
    expect(b.wire.map).toBeUndefined();
    expect(unpackView(b.wire, back.map)!.map).toBe(back.map);
  });
});

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { inArea, tokensInArea, areaCells } from '../src/engine/areas';
import { stampRoom, rotate90, autoFurnish, quickDungeon, findRooms } from '../src/engine/stamp';
import { fromUvtt, edgesCrossed } from '../src/engine/uvtt';
import { blankMap, isFloor, type GameMap } from '../src/engine/map';
import { OBJECTS, objectById } from '../src/library/objects';
import { CREATURES } from '../src/library/creatures';

const load = (p: string) => JSON.parse(fs.readFileSync(`public/library/${p}.json`, 'utf8')) as GameMap;

describe('areas', () => {
  it('a 20 ft sphere covers squares within 4 squares of its centre', () => {
    const t = { shape: 'sphere' as const, x: 10, y: 10, tx: 11, ty: 10, size: 20 };
    expect(inArea(t, 10.5, 10.5)).toBe(true);
    expect(inArea(t, 13.5, 10.5)).toBe(true);
    expect(inArea(t, 15.5, 10.5)).toBe(false);
    expect(areaCells(t, 30, 30).length).toBeGreaterThan(40);
  });
  it('a cone points where it is dragged', () => {
    const t = { shape: 'cone' as const, x: 5, y: 5, tx: 10, ty: 5, size: 15 };
    expect(tokensInArea(t, [{ id: 'a', x: 7, y: 5, size: 1 }, { id: 'b', x: 2, y: 5, size: 1 }]).map((k) => k.id)).toEqual(['a']);
  });
});

describe('room templates and furnishing', () => {
  it('stamps a library room and keeps the map size', () => {
    const room = load('rooms/' + fs.readdirSync('public/library/rooms')[0].replace('.json', ''));
    const map = blankMap(40, 40);
    const out = stampRoom(map, room, 5, 5, 1);
    expect(out.cols).toBe(40);
    expect(out.cells.filter((v) => v > 0).length).toBe(room.cells.filter((v) => v > 0).length);
    expect(out.props.length).toBe(room.props.length);
  });
  it('rotating four times gives the same map', () => {
    const room = load('maps/goblin-warren');
    const r4 = rotate90(rotate90(rotate90(rotate90(room))));
    expect(r4.cells).toEqual(room.cells);
    expect(new Set(r4.walls)).toEqual(new Set(room.walls));
  });
  it('a quick dungeon comes furnished, with every prop on the floor', () => {
    const m = quickDungeon('medium', 42);
    expect(findRooms(m).length).toBeGreaterThan(2);
    expect(m.props.length).toBeGreaterThan(10);
    for (const p of m.props) expect(isFloor(m, p.x, p.y)).toBe(true);
    expect(autoFurnish(m).props.length).toBe(m.props.length); // nothing empty left to fill
  });
});

describe('universal VTT import', () => {
  it('turns walls and portals into edges and doors', () => {
    expect(edgesCrossed({ x: 3, y: 0 }, { x: 3, y: 4 }, 10, 10)).toContain('v:3,1');
    const r = fromUvtt({
      resolution: { map_origin: { x: 0, y: 0 }, map_size: { x: 10, y: 8 }, pixels_per_grid: 70 },
      line_of_sight: [[{ x: 5, y: 0 }, { x: 5, y: 8 }]],
      portals: [{ position: { x: 5, y: 4 }, bounds: [{ x: 5, y: 3.6 }, { x: 5, y: 4.4 }], closed: true }],
      lights: [{ position: { x: 2, y: 2 }, range: 6, color: 'ffffaa66' }],
      environment: { ambient_light: 'ff202020' },
      image: 'iVBORw0KGgo',
    });
    expect(r.map.cols).toBe(10);
    expect(r.map.walls).toContain('v:5,0');
    expect(r.map.doors['v:5,4']).toBe('closed');
    expect(r.map.walls).not.toContain('v:5,4');
    expect(r.map.ambient).toBe('dark');
    expect(r.map.backdrop).toBeTruthy();
    expect(r.imageType).toBe('image/png');
  });
});

describe('library contents', () => {
  it('has a big, unique set of objects and creatures', () => {
    expect(OBJECTS.length).toBeGreaterThan(200);
    expect(new Set(OBJECTS.map((o) => o.id)).size).toBe(OBJECTS.length);
    expect(new Set(CREATURES.map((c) => c.id)).size).toBe(CREATURES.length);
  });
  it('every starter map prop has art', () => {
    for (const f of fs.readdirSync('public/library/maps')) for (const p of load('maps/' + f.replace('.json', '')).props) expect(objectById(p.kind), p.kind).toBeTruthy();
  });
});

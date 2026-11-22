import type { ObjDef } from '../art/types';
import { CORE_OBJECTS } from './core';
import { DUNGEON_OBJECTS } from './dungeon';
import { FURNISHING_OBJECTS } from './furnishings';
import { OUTDOOR_OBJECTS } from './outdoors';
import { EXTRA_OBJECTS } from './extra';
import { OUTDOOR2_OBJECTS } from './outdoors2';

const seen = new Set<string>();
/** Every map object, in browser order. Ids are stable: saved maps refer to them. When two sets draw the same id, the first wins. */
export const OBJECTS: ObjDef[] = [...CORE_OBJECTS, ...DUNGEON_OBJECTS, ...FURNISHING_OBJECTS, ...OUTDOOR_OBJECTS, ...OUTDOOR2_OBJECTS, ...EXTRA_OBJECTS].filter((o) => !seen.has(o.id) && !!seen.add(o.id));

const byId = new Map(OBJECTS.map((o) => [o.id, o]));
/** Old prop kinds from before the library, and library aliases. */
export const OBJECT_ALIASES: Record<string, string> = {
  table: 'table-long', bookshelf: 'bookshelf', pillar: 'pillar-round', rubble: 'rubble-pile', torch: 'torch-sconce', stairs: 'stairs-down', trap: 'pressure-plate',
};
export const objectById = (id: string): ObjDef | undefined => byId.get(id) ?? byId.get(OBJECT_ALIASES[id] ?? '');

// Loads the floor and terrain pictures from /library/floors on first use, for the scene renderer.
import type { FloorArt } from './scene';
import { terrainById, TERRAIN_SQUARES } from '../library/terrain';

export interface LibraryIndex {
  license: string;
  maps: LibraryEntry[];
  rooms: LibraryEntry[];
  materials: { id: string; name: string; color: string; squares: number }[];
}
export interface LibraryEntry { id: string; name: string; cols: number; rows: number; ambient: string; description: string; setting: string; tags: string[]; rooms: number; encounters: number; size?: string; /** Feet per square when it isn't 5 (5280 = a mile, region maps). */ scale?: number; }

let indexP: Promise<LibraryIndex> | null = null;
export function libraryIndex(): Promise<LibraryIndex> {
  if (!indexP) indexP = fetch('/library/index.json').then((r) => (r.ok ? r.json() : Promise.reject(new Error('no library'))));
  return indexP;
}

const imgs = new Map<string, HTMLImageElement>();
const asked = new Set<string>();
const listeners = new Set<() => void>();

export function onFloorsLoaded(f: () => void) {
  listeners.add(f);
  return () => listeners.delete(f);
}

/** Starts loading one ground picture; only grounds a map actually uses are fetched. */
function load(id: string) {
  if (asked.has(id) || typeof Image === 'undefined' || !terrainById(id)) return;
  asked.add(id);
  const im = new Image();
  im.decoding = 'async';
  im.onload = () => {
    imgs.set(id, im);
    for (const f of listeners) f();
  };
  im.src = `/library/floors/${id}.webp`;
}

export const browserFloors: FloorArt = {
  image(id) {
    const im = imgs.get(id);
    if (!im) load(id);
    return im;
  },
  squares() {
    return TERRAIN_SQUARES;
  },
};
